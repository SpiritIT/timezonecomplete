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
                return weekOfMonth(year, month - 1, daysInMonth(year, month - 1));
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
            var zone = this._getZoneTransitions(zoneName);
            var transitions = zone.transitionsInYears(localTime.components.year - 1, localTime.components.year + 1);
            // find the DST forward transitions
            var prev = duration_1.Duration.hours(0);
            for (var _i = 0, transitions_1 = transitions; _i < transitions_1.length; _i++) {
                var transition = transitions_1[_i];
                var offset = transition.newState.dstOffset.add(transition.newState.standardOffset);
                // forward transition?
                if (offset.greaterThan(prev)) {
                    var localBefore = transition.atUtc.unixMillis + prev.milliseconds();
                    var localAfter = transition.atUtc.unixMillis + offset.milliseconds();
                    if (localTime.unixMillis >= localBefore && localTime.unixMillis < localAfter) {
                        var forwardChange = offset.sub(prev);
                        // non-existing time
                        var factor = (opt === NormalizeOption.Up ? 1 : -1);
                        var resultMillis = localTime.unixMillis + factor * forwardChange.milliseconds();
                        return (typeof a === "number" ? resultMillis : new basics_1.TimeStruct(resultMillis));
                    }
                }
                prev = offset;
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
        var zone = this._getZoneTransitions(zoneName);
        var transitions = zone.transitionsInYears(normalizedTm.components.year - 1, normalizedTm.components.year + 2);
        var prev;
        var prevPrev;
        for (var _i = 0, transitions_2 = transitions; _i < transitions_2.length; _i++) {
            var transition = transitions_2[_i];
            var offset = transition.newState.dstOffset.add(transition.newState.standardOffset);
            if (transition.atUtc.unixMillis + offset.milliseconds() > normalizedTm.unixMillis) {
                // found offset: prev.offset applies
                break;
            }
            prevPrev = prev;
            prev = transition;
        }
        /* istanbul ignore else */
        if (prev) {
            // special care during backward change: take first occurrence of local time
            var prevOffset = prev.newState.dstOffset.add(prev.newState.standardOffset);
            var prevPrevOffset = prevPrev ? prevPrev.newState.dstOffset.add(prevPrev.newState.standardOffset) : undefined;
            if (prevPrev && prevPrevOffset !== undefined && prevPrevOffset.greaterThan(prevOffset)) {
                // backward change
                var diff = prevPrevOffset.sub(prevOffset);
                if (normalizedTm.unixMillis >= prev.atUtc.unixMillis + prevOffset.milliseconds()
                    && normalizedTm.unixMillis < prev.atUtc.unixMillis + prevOffset.milliseconds() + diff.milliseconds()) {
                    // within duplicate range
                    return prevPrevOffset.clone();
                }
                else {
                    return prevOffset.clone();
                }
            }
            else {
                return prevOffset.clone();
            }
        }
        else {
            var state = zone.stateAt(normalizedTm);
            return state.dstOffset.add(state.standardOffset);
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
     * The transitions in year [start, end)
     * @param start start year (inclusive)
     * @param end end year (exclusive)
     */
    CachedZoneTransitions.prototype.transitionsInYears = function (start, end) {
        // check if start-1 is within the initial transitions or not. We use start-1 because we take an extra year in the else clause below
        var final = (this._transitions.length === 0 || this._transitions[this._transitions.length - 1].atUtc.year < start - 1);
        var result = [];
        if (!final) {
            // simply do linear search
            var iterator = this.findFirst();
            while (iterator && iterator.transition.atUtc.year < end) {
                if (iterator.transition.atUtc.year >= start) {
                    result.push(iterator.transition);
                }
                iterator = this.findNext(iterator);
            }
        }
        else {
            var transitionsWithRules = [];
            // Do something smart: first get all transitions with atUtc NOT compensated for standard offset
            // Take an extra year before start
            for (var year = start - 1; year < end; ++year) {
                for (var _i = 0, _a = this._finalRules; _i < _a.length; _i++) {
                    var ruleInfo = _a[_i];
                    if (ruleInfo.applicable(year)) {
                        var transition = {
                            atUtc: ruleInfo.effectiveDateUtc(year, this._finalZoneInfo.gmtoff, duration_1.hours(0)),
                            newState: {
                                abbreviation: zoneAbbreviation(this._finalZoneInfo.format, ruleInfo.save.nonZero(), ruleInfo.letter),
                                letter: ruleInfo.letter,
                                dstOffset: ruleInfo.save,
                                standardOffset: this._finalZoneInfo.gmtoff
                            }
                        };
                        transitionsWithRules.push({ transition: transition, ruleInfo: ruleInfo });
                    }
                }
            }
            transitionsWithRules.sort(function (a, b) { return a.transition.atUtc.unixMillis - b.transition.atUtc.unixMillis; });
            // now apply DST offset retroactively
            var prevDst = duration_1.hours(0);
            for (var _b = 0, transitionsWithRules_1 = transitionsWithRules; _b < transitionsWithRules_1.length; _b++) {
                var tr = transitionsWithRules_1[_b];
                if (tr.ruleInfo.atType === AtType.Wall) {
                    tr.transition.atUtc = new basics_1.TimeStruct(tr.transition.atUtc.unixMillis - prevDst.milliseconds());
                }
                prevDst = tr.transition.newState.dstOffset;
                if (tr.transition.atUtc.year >= start) {
                    result.push(tr.transition);
                }
            }
        }
        return result;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZXJyb3IuanMiLCJkaXN0L2xpYi9mb3JtYXQuanMiLCJkaXN0L2xpYi9nbG9iYWxzLmpzIiwiZGlzdC9saWIvamF2YXNjcmlwdC5qcyIsImRpc3QvbGliL2xvY2FsZS5qcyIsImRpc3QvbGliL21hdGguanMiLCJkaXN0L2xpYi9wYXJzZS5qcyIsImRpc3QvbGliL3BlcmlvZC5qcyIsImRpc3QvbGliL3N0cmluZ3MuanMiLCJkaXN0L2xpYi90aW1lc291cmNlLmpzIiwiZGlzdC9saWIvdGltZXpvbmUuanMiLCJkaXN0L2xpYi90b2tlbi5qcyIsImRpc3QvbGliL3R6LWRhdGFiYXNlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiZGlzdC9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNrQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4c0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3YxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25vRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE2IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKi9cblwidXNlIHN0cmljdFwiO1xudmFyIF9fc3ByZWFkQXJyYXlzID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5cykgfHwgZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcbiAgICByZXR1cm4gcjtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xuLyoqXG4gKiBUaHJvd3MgYW4gQXNzZXJ0aW9uIGVycm9yIGlmIHRoZSBnaXZlbiBjb25kaXRpb24gaXMgZmFsc3lcbiAqIEBwYXJhbSBjb25kaXRpb25cbiAqIEBwYXJhbSBuYW1lIGVycm9yIG5hbWVcbiAqIEBwYXJhbSBmb3JtYXQgZXJyb3IgbWVzc2FnZSB3aXRoIHBlcmNlbnQtc3R5bGUgcGxhY2Vob2xkZXJzXG4gKiBAcGFyYW0gYXJncyBhcmd1bWVudHMgZm9yIGVycm9yIG1lc3NhZ2UgZm9ybWF0IHN0cmluZ1xuICogQHRocm93cyBbbmFtZV0gaWYgYGNvbmRpdGlvbmAgaXMgZmFsc3lcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbmFtZSwgZm9ybWF0KSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDM7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pIC0gM10gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBlcnJvcl8xLnRocm93RXJyb3IuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5cyhbbmFtZSwgZm9ybWF0XSwgYXJncykpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IGFzc2VydDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VydC5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5iaW5hcnlJbnNlcnRpb25JbmRleCA9IGV4cG9ydHMuVGltZVN0cnVjdCA9IGV4cG9ydHMuc2Vjb25kT2ZEYXkgPSBleHBvcnRzLndlZWtEYXlOb0xlYXBTZWNzID0gZXhwb3J0cy50aW1lVG9Vbml4Tm9MZWFwU2VjcyA9IGV4cG9ydHMudW5peFRvVGltZU5vTGVhcFNlY3MgPSBleHBvcnRzLndlZWtOdW1iZXIgPSBleHBvcnRzLndlZWtPZk1vbnRoID0gZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IGV4cG9ydHMud2Vla0RheU9uT3JBZnRlciA9IGV4cG9ydHMuZmlyc3RXZWVrRGF5T2ZNb250aCA9IGV4cG9ydHMubGFzdFdlZWtEYXlPZk1vbnRoID0gZXhwb3J0cy5kYXlPZlllYXIgPSBleHBvcnRzLmRheXNJbk1vbnRoID0gZXhwb3J0cy5kYXlzSW5ZZWFyID0gZXhwb3J0cy5pc0xlYXBZZWFyID0gZXhwb3J0cy5zdHJpbmdUb1RpbWVVbml0ID0gZXhwb3J0cy50aW1lVW5pdFRvU3RyaW5nID0gZXhwb3J0cy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzID0gZXhwb3J0cy5UaW1lVW5pdCA9IGV4cG9ydHMuV2Vla0RheSA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XG52YXIgamF2YXNjcmlwdF8xID0gcmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKTtcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcbi8qKlxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXG4gKi9cbnZhciBXZWVrRGF5O1xuKGZ1bmN0aW9uIChXZWVrRGF5KSB7XG4gICAgV2Vla0RheVtXZWVrRGF5W1wiU3VuZGF5XCJdID0gMF0gPSBcIlN1bmRheVwiO1xuICAgIFdlZWtEYXlbV2Vla0RheVtcIk1vbmRheVwiXSA9IDFdID0gXCJNb25kYXlcIjtcbiAgICBXZWVrRGF5W1dlZWtEYXlbXCJUdWVzZGF5XCJdID0gMl0gPSBcIlR1ZXNkYXlcIjtcbiAgICBXZWVrRGF5W1dlZWtEYXlbXCJXZWRuZXNkYXlcIl0gPSAzXSA9IFwiV2VkbmVzZGF5XCI7XG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVGh1cnNkYXlcIl0gPSA0XSA9IFwiVGh1cnNkYXlcIjtcbiAgICBXZWVrRGF5W1dlZWtEYXlbXCJGcmlkYXlcIl0gPSA1XSA9IFwiRnJpZGF5XCI7XG4gICAgV2Vla0RheVtXZWVrRGF5W1wiU2F0dXJkYXlcIl0gPSA2XSA9IFwiU2F0dXJkYXlcIjtcbn0pKFdlZWtEYXkgPSBleHBvcnRzLldlZWtEYXkgfHwgKGV4cG9ydHMuV2Vla0RheSA9IHt9KSk7XG4vKipcbiAqIFRpbWUgdW5pdHNcbiAqL1xudmFyIFRpbWVVbml0O1xuKGZ1bmN0aW9uIChUaW1lVW5pdCkge1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWlsbGlzZWNvbmRcIl0gPSAwXSA9IFwiTWlsbGlzZWNvbmRcIjtcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIlNlY29uZFwiXSA9IDFdID0gXCJTZWNvbmRcIjtcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1pbnV0ZVwiXSA9IDJdID0gXCJNaW51dGVcIjtcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIkhvdXJcIl0gPSAzXSA9IFwiSG91clwiO1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiRGF5XCJdID0gNF0gPSBcIkRheVwiO1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiV2Vla1wiXSA9IDVdID0gXCJXZWVrXCI7XG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNb250aFwiXSA9IDZdID0gXCJNb250aFwiO1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiWWVhclwiXSA9IDddID0gXCJZZWFyXCI7XG4gICAgLyoqXG4gICAgICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXG4gICAgICovXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNQVhcIl0gPSA4XSA9IFwiTUFYXCI7XG59KShUaW1lVW5pdCA9IGV4cG9ydHMuVGltZVVuaXQgfHwgKGV4cG9ydHMuVGltZVVuaXQgPSB7fSkpO1xuLyoqXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcbiAqIGFuZCBhIHllYXIgaXMgc2V0IHRvIDM2MCBkYXlzIChiZWNhdXNlIDEyIG1vbnRocyBvZiAzMCBkYXlzKS5cbiAqXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcbiAqIEByZXR1cm5zXHRUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Vbml0IGZvciBpbnZhbGlkIHVuaXRcbiAqL1xuZnVuY3Rpb24gdGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSB7XG4gICAgc3dpdGNoICh1bml0KSB7XG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xuICAgICAgICBjYXNlIFRpbWVVbml0LlNlY29uZDogcmV0dXJuIDEwMDA7XG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWludXRlOiByZXR1cm4gNjAgKiAxMDAwO1xuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5EYXk6IHJldHVybiA4NjQwMDAwMDtcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5XZWVrOiByZXR1cm4gNyAqIDg2NDAwMDAwO1xuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5ZZWFyOiByZXR1cm4gMTIgKiAzMCAqIDg2NDAwMDAwO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlVuaXRcIiwgXCJ1bmtub3duIHRpbWUgdW5pdCAlZFwiLCB1bml0KTtcbiAgICB9XG59XG5leHBvcnRzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMgPSB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzO1xuLyoqXG4gKiBUaW1lIHVuaXQgdG8gbG93ZXJjYXNlIHN0cmluZy4gSWYgYW1vdW50IGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgc3RyaW5nIGlzIHB1dCBpbiBwbHVyYWwgZm9ybVxuICogaWYgbmVjZXNzYXJ5LlxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcbiAqIEBwYXJhbSBhbW91bnQgSWYgdGhpcyBpcyB1bmVxdWFsIHRvIC0xIGFuZCAxLCB0aGVuIHRoZSByZXN1bHQgaXMgcGx1cmFsaXplZFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXQgZm9yIGludmFsaWQgdGltZSB1bml0XG4gKi9cbmZ1bmN0aW9uIHRpbWVVbml0VG9TdHJpbmcodW5pdCwgYW1vdW50KSB7XG4gICAgaWYgKGFtb3VudCA9PT0gdm9pZCAwKSB7IGFtb3VudCA9IDE7IH1cbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIodW5pdCkgfHwgdW5pdCA8IDAgfHwgdW5pdCA+PSBUaW1lVW5pdC5NQVgpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlVuaXRcIiwgXCJpbnZhbGlkIHRpbWUgdW5pdCAlZFwiLCB1bml0KTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgXCJzXCI7XG4gICAgfVxufVxuZXhwb3J0cy50aW1lVW5pdFRvU3RyaW5nID0gdGltZVVuaXRUb1N0cmluZztcbi8qKlxuICogQ29udmVydCBhIHN0cmluZyB0byBhIG51bWVyaWMgVGltZVVuaXQuIENhc2UtaW5zZW5zaXRpdmU7IHRpbWUgdW5pdHMgY2FuIGJlIHNpbmd1bGFyIG9yIHBsdXJhbC5cbiAqIEBwYXJhbSBzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuUyBmb3IgaW52YWxpZCBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzKSB7XG4gICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVGltZVVuaXQuTUFYOyArK2kpIHtcbiAgICAgICAgdmFyIG90aGVyID0gdGltZVVuaXRUb1N0cmluZyhpLCAxKTtcbiAgICAgICAgaWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlNcIiwgXCJVbmtub3duIHRpbWUgdW5pdCBzdHJpbmcgJyVzJ1wiLCBzKTtcbn1cbmV4cG9ydHMuc3RyaW5nVG9UaW1lVW5pdCA9IHN0cmluZ1RvVGltZVVuaXQ7XG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBpZiB5ZWFyIGlzIG5vdCBpbnRlZ2VyXG4gKi9cbmZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcikge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiSW52YWxpZCB5ZWFyICVkXCIsIHllYXIpO1xuICAgIC8vIGZyb20gV2lraXBlZGlhOlxuICAgIC8vIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0IHRoZW4gY29tbW9uIHllYXJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSAxMDAgdGhlbiBsZWFwIHllYXJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxuICAgIC8vIGVsc2UgbGVhcCB5ZWFyXG4gICAgaWYgKHllYXIgJSA0ICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoeWVhciAlIDEwMCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoeWVhciAlIDQwMCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG5leHBvcnRzLmlzTGVhcFllYXIgPSBpc0xlYXBZZWFyO1xuLyoqXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGlmIHllYXIgaXMgbm90IGludGVnZXJcbiAqL1xuZnVuY3Rpb24gZGF5c0luWWVhcih5ZWFyKSB7XG4gICAgLy8gcmVseSBvbiB2YWxpZGF0aW9uIGJ5IGlzTGVhcFllYXJcbiAgICByZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjUpO1xufVxuZXhwb3J0cy5kYXlzSW5ZZWFyID0gZGF5c0luWWVhcjtcbi8qKlxuICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcbiAqIEByZXR1cm4gVGhlIG51bWJlciBvZiBkYXlzIGluIHRoZSBnaXZlbiBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgaWYgeWVhciBpcyBub3QgaW50ZWdlclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoIG51bWJlclxuICovXG5mdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xuICAgIHN3aXRjaCAobW9udGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICBjYXNlIDg6XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICByZXR1cm4gMzE7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgcmV0dXJuIDMwO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiSW52YWxpZCBtb250aDogJWRcIiwgbW9udGgpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGF5c0luTW9udGggPSBkYXlzSW5Nb250aDtcbi8qKlxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGUuZy4gMTk4NlxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcbiAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxuICovXG5mdW5jdGlvbiBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSkge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcbiAgICB2YXIgeWVhckRheSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBtb250aDsgaSsrKSB7XG4gICAgICAgIHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XG4gICAgfVxuICAgIHllYXJEYXkgKz0gKGRheSAtIDEpO1xuICAgIHJldHVybiB5ZWFyRGF5O1xufVxuZXhwb3J0cy5kYXlPZlllYXIgPSBkYXlPZlllYXI7XG4vKipcbiAqIFJldHVybnMgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXkgMC02XG4gKiBAcmV0dXJuIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XG4gKi9cbmZ1bmN0aW9uIGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgd2Vla0RheSkge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XG4gICAgdmFyIGVuZE9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkgfSk7XG4gICAgdmFyIGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBlbmRPZk1vbnRoV2Vla0RheTtcbiAgICBpZiAoZGlmZiA+IDApIHtcbiAgICAgICAgZGlmZiAtPSA3O1xuICAgIH1cbiAgICByZXR1cm4gZW5kT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5leHBvcnRzLmxhc3RXZWVrRGF5T2ZNb250aCA9IGxhc3RXZWVrRGF5T2ZNb250aDtcbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcbiAqIEByZXR1cm4gdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XG4gKi9cbmZ1bmN0aW9uIGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIlllYXIgb3V0IG9mIHJhbmdlOiAlZFwiLCB5ZWFyKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIobW9udGgpICYmIG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJNb250aCBvdXQgb2YgcmFuZ2U6ICVkXCIsIG1vbnRoKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIod2Vla0RheSkgJiYgd2Vla0RheSA+PSAwICYmIHdlZWtEYXkgPD0gNiwgXCJBcmd1bWVudC5XZWVrRGF5XCIsIFwid2Vla0RheSBvdXQgb2YgcmFuZ2U6ICVkXCIsIHdlZWtEYXkpO1xuICAgIHZhciBiZWdpbk9mTW9udGggPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiAxIH0pO1xuICAgIHZhciBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIGJlZ2luT2ZNb250aFdlZWtEYXk7XG4gICAgaWYgKGRpZmYgPCAwKSB7XG4gICAgICAgIGRpZmYgKz0gNztcbiAgICB9XG4gICAgcmV0dXJuIGJlZ2luT2ZNb250aC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5leHBvcnRzLmZpcnN0V2Vla0RheU9mTW9udGggPSBmaXJzdFdlZWtEYXlPZk1vbnRoO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheTsgdGhyb3dzIGlmIG5vdCBmb3VuZFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla0RheSBmb3IgaW52YWxpZCB3ZWVrIGRheVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXlcbiAqL1xuZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCBtb250aCwgZGF5LCB3ZWVrRGF5KSB7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKG1vbnRoKSAmJiBtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiTW9udGggb3V0IG9mIHJhbmdlOiAlZFwiLCBtb250aCk7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKGRheSkgJiYgZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJBcmd1bWVudC5EYXlcIiwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xuICAgIHZhciBzdGFydFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XG4gICAgaWYgKGRpZmYgPCAwKSB7XG4gICAgICAgIGRpZmYgKz0gNztcbiAgICB9XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIk5vdEZvdW5kXCIsIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XG4gICAgcmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcbn1cbmV4cG9ydHMud2Vla0RheU9uT3JBZnRlciA9IHdlZWtEYXlPbk9yQWZ0ZXI7XG4vKipcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla0RheSBmb3IgaW52YWxpZCB3ZWVrIGRheVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXlcbiAqL1xuZnVuY3Rpb24gd2Vla0RheU9uT3JCZWZvcmUoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIod2Vla0RheSkgJiYgd2Vla0RheSA+PSAwICYmIHdlZWtEYXkgPD0gNiwgXCJBcmd1bWVudC5XZWVrRGF5XCIsIFwid2Vla0RheSBvdXQgb2YgcmFuZ2U6ICVkXCIsIHdlZWtEYXkpO1xuICAgIHZhciBzdGFydCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSB9KTtcbiAgICB2YXIgc3RhcnRXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xuICAgIGlmIChkaWZmID4gMCkge1xuICAgICAgICBkaWZmIC09IDc7XG4gICAgfVxuICAgIGFzc2VydF8xLmRlZmF1bHQoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmID49IDEsIFwiTm90Rm91bmRcIiwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcbiAgICByZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xuLyoqXG4gKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcywgYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXI6XG4gKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0XG4gKlxuICogQHBhcmFtIHllYXIgVGhlIHllYXJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXG4gKiBAcGFyYW0gZGF5IFRoZSBkYXkgWzEtMzFdXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcbiAqL1xuZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhciwgbW9udGgsIGRheSkge1xuICAgIC8vIHJlbHkgb24geWVhci9tb250aCB2YWxpZGF0aW9uIGluIGZpcnN0V2Vla0RheU9mTW9udGhcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoZGF5KSAmJiBkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XG4gICAgdmFyIGZpcnN0VGh1cnNkYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcbiAgICB2YXIgZmlyc3RNb25kYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XG4gICAgLy8gQ29ybmVyIGNhc2U6IGNoZWNrIGlmIHdlIGFyZSBpbiB3ZWVrIDEgb3IgbGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXG4gICAgaWYgKGRheSA8IGZpcnN0TW9uZGF5KSB7XG4gICAgICAgIGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcbiAgICAgICAgICAgIC8vIFdlZWsgMVxuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcbiAgICAgICAgICAgIGlmIChtb250aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBEZWZhdWx0IGNhc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCAtIDEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEphbnVhcnlcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciAtIDEsIDEyLCAzMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGxhc3RNb25kYXkgPSBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcbiAgICB2YXIgbGFzdFRodXJzZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcbiAgICBpZiAoZGF5ID49IGxhc3RNb25kYXkpIHtcbiAgICAgICAgaWYgKGxhc3RNb25kYXkgPiBsYXN0VGh1cnNkYXkpIHtcbiAgICAgICAgICAgIC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3JtYWwgY2FzZVxuICAgIHZhciByZXN1bHQgPSBNYXRoLmZsb29yKChkYXkgLSBmaXJzdE1vbmRheSkgLyA3KSArIDE7XG4gICAgaWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XG4gICAgICAgIHJlc3VsdCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy53ZWVrT2ZNb250aCA9IHdlZWtPZk1vbnRoO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YteWVhciBvZiB0aGUgTW9uZGF5IG9mIHdlZWsgMSBpbiB0aGUgZ2l2ZW4geWVhci5cbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcbiAqL1xuZnVuY3Rpb24gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKSB7XG4gICAgLy8gcmVsYXkgb24gd2Vla0RheU9uT3JBZnRlciBmb3IgeWVhciB2YWxpZGF0aW9uXG4gICAgLy8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcbiAgICB2YXIgcmVzdWx0ID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xuICAgIGlmIChyZXN1bHQgPiAzKSB7IC8vIGdyZWF0ZXIgdGhhbiBqYW4gNHRoXG4gICAgICAgIHJlc3VsdCAtPSA3O1xuICAgICAgICBpZiAocmVzdWx0IDwgMCkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGV4cG9ydHMuZGF5c0luWWVhcih5ZWFyIC0gMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyIGZvciB0aGUgZ2l2ZW4gZGF0ZS4gV2VlayAxIGlzIHRoZSB3ZWVrXG4gKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxuICpcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk4OFxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXG4gKiBAcGFyYW0gZGF5XHREYXkgb2YgbW9udGggMS0zMVxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcbiAqL1xuZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyLCBtb250aCwgZGF5KSB7XG4gICAgdmFyIGRveSA9IGRheU9mWWVhcih5ZWFyLCBtb250aCwgZGF5KTtcbiAgICAvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcbiAgICBpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XG4gICAgICAgIHZhciBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcbiAgICAgICAgaWYgKG5leHRZZWFyV2Vla09uZSA+IDQgJiYgbmV4dFllYXJXZWVrT25lIDw9IGRveSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gY2hlY2sgYmVnaW5uaW5nLW9mLXllYXIgY29ybmVyIGNhc2VcbiAgICB2YXIgdGhpc1llYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKTtcbiAgICBpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xuICAgICAgICAvLyB3ZWVrIDEgaXMgYXQgZW5kIG9mIGxhc3QgeWVhclxuICAgICAgICB2YXIgd2Vla1R3byA9IHRoaXNZZWFyV2Vla09uZSArIDcgLSBkYXlzSW5ZZWFyKHllYXIgLSAxKTtcbiAgICAgICAgaWYgKGRveSA8IHdlZWtUd28pIHtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHdlZWtUd28pIC8gNykgKyAyO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxuICAgIGlmIChkb3kgPCB0aGlzWWVhcldlZWtPbmUpIHtcbiAgICAgICAgLy8gVGhlIGRhdGUgaXMgcGFydCBvZiB0aGUgbGFzdCB3ZWVrIG9mIHByZXYgeWVhci5cbiAgICAgICAgcmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XG4gICAgfVxuICAgIC8vIG5vcm1hbCBjYXNlczsgbm90ZSB0aGF0IHdlZWsgbnVtYmVycyBzdGFydCBmcm9tIDEgc28gKzFcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcbn1cbmV4cG9ydHMud2Vla051bWJlciA9IHdlZWtOdW1iZXI7XG4vKipcbiAqIENvbnZlcnQgYSB1bml4IG1pbGxpIHRpbWVzdGFtcCBpbnRvIGEgVGltZVQgc3RydWN0dXJlLlxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5peE1pbGxpcyBmb3Igbm9uLWludGVnZXIgYHVuaXhNaWxsaXNgIHBhcmFtZXRlclxuICovXG5mdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKSB7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKHVuaXhNaWxsaXMpLCBcIkFyZ3VtZW50LlVuaXhNaWxsaXNcIiwgXCJ1bml4TWlsbGlzIHNob3VsZCBiZSBhbiBpbnRlZ2VyIG51bWJlclwiKTtcbiAgICB2YXIgdGVtcCA9IHVuaXhNaWxsaXM7XG4gICAgdmFyIHJlc3VsdCA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwIH07XG4gICAgdmFyIHllYXI7XG4gICAgdmFyIG1vbnRoO1xuICAgIGlmICh1bml4TWlsbGlzID49IDApIHtcbiAgICAgICAgcmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xuICAgICAgICByZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG4gICAgICAgIHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcbiAgICAgICAgcmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcbiAgICAgICAgeWVhciA9IDE5NzA7XG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJblllYXIoeWVhcikpIHtcbiAgICAgICAgICAgIHRlbXAgLT0gZGF5c0luWWVhcih5ZWFyKTtcbiAgICAgICAgICAgIHllYXIrKztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQueWVhciA9IHllYXI7XG4gICAgICAgIG1vbnRoID0gMTtcbiAgICAgICAgd2hpbGUgKHRlbXAgPj0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XG4gICAgICAgICAgICB0ZW1wIC09IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcbiAgICAgICAgICAgIG1vbnRoKys7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0Lm1vbnRoID0gbW9udGg7XG4gICAgICAgIHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCBhIG5lZ2F0aXZlIG51bWJlciBtb2R1bG8gc29tZXRoaW5nIHlpZWxkcyBhIG5lZ2F0aXZlIG51bWJlci5cbiAgICAgICAgLy8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cbiAgICAgICAgcmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xuICAgICAgICByZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG4gICAgICAgIHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcbiAgICAgICAgcmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcbiAgICAgICAgeWVhciA9IDE5Njk7XG4gICAgICAgIHdoaWxlICh0ZW1wIDwgLWRheXNJblllYXIoeWVhcikpIHtcbiAgICAgICAgICAgIHRlbXAgKz0gZGF5c0luWWVhcih5ZWFyKTtcbiAgICAgICAgICAgIHllYXItLTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQueWVhciA9IHllYXI7XG4gICAgICAgIG1vbnRoID0gMTI7XG4gICAgICAgIHdoaWxlICh0ZW1wIDwgLWRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xuICAgICAgICAgICAgdGVtcCArPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XG4gICAgICAgICAgICBtb250aC0tO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5tb250aCA9IG1vbnRoO1xuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLnVuaXhUb1RpbWVOb0xlYXBTZWNzID0gdW5peFRvVGltZU5vTGVhcFNlY3M7XG4vKipcbiAqIEZpbGwgeW91IGFueSBtaXNzaW5nIHRpbWUgY29tcG9uZW50IHBhcnRzLCBkZWZhdWx0cyBhcmUgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaW51dGUgZm9yIGludmFsaWQgbWludXRlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuU2Vjb25kIGZvciBpbnZhbGlkIHNlY29uZFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpIGZvciBpbnZhbGlkIG1pbGxpc2Vjb25kc1xuICovXG5mdW5jdGlvbiBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKSB7XG4gICAgdmFyIGlucHV0ID0ge1xuICAgICAgICB5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcbiAgICAgICAgbW9udGg6IHR5cGVvZiBjb21wb25lbnRzLm1vbnRoID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5tb250aCA6IDEsXG4gICAgICAgIGRheTogdHlwZW9mIGNvbXBvbmVudHMuZGF5ID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5kYXkgOiAxLFxuICAgICAgICBob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcbiAgICAgICAgbWludXRlOiB0eXBlb2YgY29tcG9uZW50cy5taW51dGUgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbnV0ZSA6IDAsXG4gICAgICAgIHNlY29uZDogdHlwZW9mIGNvbXBvbmVudHMuc2Vjb25kID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5zZWNvbmQgOiAwLFxuICAgICAgICBtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcbiAgICB9O1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC55ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiaW52YWxpZCB5ZWFyICVkXCIsIGlucHV0LnllYXIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5tb250aCkgJiYgaW5wdXQubW9udGggPj0gMSAmJiBpbnB1dC5tb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcImludmFsaWQgbW9udGggJWRcIiwgaW5wdXQubW9udGgpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5kYXkpICYmIGlucHV0LmRheSA+PSAxICYmIGlucHV0LmRheSA8PSBkYXlzSW5Nb250aChpbnB1dC55ZWFyLCBpbnB1dC5tb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiaW52YWxpZCBkYXkgJWRcIiwgaW5wdXQuZGF5KTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQuaG91cikgJiYgaW5wdXQuaG91ciA+PSAwICYmIGlucHV0LmhvdXIgPD0gMjMsIFwiQXJndW1lbnQuSG91clwiLCBcImludmFsaWQgaG91ciAlZFwiLCBpbnB1dC5ob3VyKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQubWludXRlKSAmJiBpbnB1dC5taW51dGUgPj0gMCAmJiBpbnB1dC5taW51dGUgPD0gNTksIFwiQXJndW1lbnQuTWludXRlXCIsIFwiaW52YWxpZCBtaW51dGUgJWRcIiwgaW5wdXQubWludXRlKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQuc2Vjb25kKSAmJiBpbnB1dC5zZWNvbmQgPj0gMCAmJiBpbnB1dC5zZWNvbmQgPD0gNTksIFwiQXJndW1lbnQuU2Vjb25kXCIsIFwiaW52YWxpZCBzZWNvbmQgJWRcIiwgaW5wdXQuc2Vjb25kKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaW5wdXQubWlsbGkpICYmIGlucHV0Lm1pbGxpID49IDAgJiYgaW5wdXQubWlsbGkgPD0gOTk5LCBcIkFyZ3VtZW50Lk1pbGxpXCIsIFwiaW52YWxpZCBtaWxsaSAlZFwiLCBpbnB1dC5taWxsaSk7XG4gICAgcmV0dXJuIGlucHV0O1xufVxuZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XG4gICAgdmFyIGNvbXBvbmVudHMgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyB7IHllYXI6IGEsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0gOiBhKTtcbiAgICB2YXIgaW5wdXQgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICByZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXG4gICAgICAgIChpbnB1dC55ZWFyIC0gMTk3MCkgKiAzMTUzNjAwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTY5KSAvIDQpICogODY0MDAgLVxuICAgICAgICBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xufVxuZXhwb3J0cy50aW1lVG9Vbml4Tm9MZWFwU2VjcyA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzO1xuLyoqXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5peE1pbGxpcyBmb3IgaW52YWxpZCBgdW5peE1pbGxpc2AgYXJndW1lbnRcbiAqL1xuZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpcykge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih1bml4TWlsbGlzKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwidW5peE1pbGxpcyBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXJcIik7XG4gICAgdmFyIGVwb2NoRGF5ID0gV2Vla0RheS5UaHVyc2RheTtcbiAgICB2YXIgZGF5cyA9IE1hdGguZmxvb3IodW5peE1pbGxpcyAvIDEwMDAgLyA4NjQwMCk7XG4gICAgcmV0dXJuIG1hdGgucG9zaXRpdmVNb2R1bG8oZXBvY2hEYXkgKyBkYXlzLCA3KTtcbn1cbmV4cG9ydHMud2Vla0RheU5vTGVhcFNlY3MgPSB3ZWVrRGF5Tm9MZWFwU2Vjcztcbi8qKlxuICogTi10aCBzZWNvbmQgaW4gdGhlIGRheSwgY291bnRpbmcgZnJvbSAwXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBmb3IgaW52YWxpZCBob3VyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGZvciBpbnZhbGlkIG1pbnV0ZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBmb3IgaW52YWxpZCBzZWNvbmRcbiAqL1xuZnVuY3Rpb24gc2Vjb25kT2ZEYXkoaG91ciwgbWludXRlLCBzZWNvbmQpIHtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoaG91cikgJiYgaG91ciA+PSAwICYmIGhvdXIgPD0gMjMsIFwiQXJndW1lbnQuSG91clwiLCBcImludmFsaWQgaG91ciAlZFwiLCBob3VyKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIobWludXRlKSAmJiBtaW51dGUgPj0gMCAmJiBtaW51dGUgPD0gNTksIFwiQXJndW1lbnQuTWludXRlXCIsIFwiaW52YWxpZCBtaW51dGUgJWRcIiwgbWludXRlKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIoc2Vjb25kKSAmJiBzZWNvbmQgPj0gMCAmJiBzZWNvbmQgPD0gNjEsIFwiQXJndW1lbnQuU2Vjb25kXCIsIFwiaW52YWxpZCBzZWNvbmQgJWRcIiwgc2Vjb25kKTtcbiAgICByZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XG59XG5leHBvcnRzLnNlY29uZE9mRGF5ID0gc2Vjb25kT2ZEYXk7XG4vKipcbiAqIEJhc2ljIHJlcHJlc2VudGF0aW9uIG9mIGEgZGF0ZSBhbmQgdGltZVxuICovXG52YXIgVGltZVN0cnVjdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFRpbWVTdHJ1Y3QoYSkge1xuICAgICAgICBpZiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihhKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwiaW52YWxpZCB1bml4IG1pbGxpcyAlZFwiLCBhKTtcbiAgICAgICAgICAgIHRoaXMuX3VuaXhNaWxsaXMgPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgYSA9PT0gXCJvYmplY3RcIiAmJiBhICE9PSBudWxsLCBcIkFyZ3VtZW50LkNvbXBvbmVudHNcIiwgXCJpbnZhbGlkIGNvbXBvbmVudHMgb2JqZWN0XCIpO1xuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXG4gICAgICpcbiAgICAgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcbiAgICAgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcbiAgICAgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxuICAgICAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcbiAgICAgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxuICAgICAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXG4gICAgICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGZvciBpbnZhbGlkIG1pbnV0ZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgZm9yIGludmFsaWQgc2Vjb25kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpIGZvciBpbnZhbGlkIG1pbGxpc2Vjb25kc1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QuZnJvbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgbnVtYmVyIG9mIHVuaXggbWlsbGlzZWNvbmRzXG4gICAgICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXhNaWxsaXMgZm9yIG5vbi1pbnRlZ2VyIG1pbGxpc2Vjb25kc1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QuZnJvbVVuaXggPSBmdW5jdGlvbiAodW5peE1pbGxpcykge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxuICAgICAqIEBwYXJhbSBkZiBXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lU3RydWN0LmZyb21EYXRlID0gZnVuY3Rpb24gKGQsIGRmKSB7XG4gICAgICAgIGlmIChkZiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0RnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0TW9udGgoKSArIDEsIGRheTogZC5nZXREYXRlKCksXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlMgaWYgYHNgIGlzIG5vdCBhIHByb3BlciBpc28gc3RyaW5nXG4gICAgICovXG4gICAgVGltZVN0cnVjdC5mcm9tU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB5ZWFyID0gMTk3MDtcbiAgICAgICAgICAgIHZhciBtb250aCA9IDE7XG4gICAgICAgICAgICB2YXIgZGF5ID0gMTtcbiAgICAgICAgICAgIHZhciBob3VyID0gMDtcbiAgICAgICAgICAgIHZhciBtaW51dGUgPSAwO1xuICAgICAgICAgICAgdmFyIHNlY29uZCA9IDA7XG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25NaWxsaXMgPSAwO1xuICAgICAgICAgICAgdmFyIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcbiAgICAgICAgICAgIC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoc3BsaXQubGVuZ3RoID49IDEgJiYgc3BsaXQubGVuZ3RoIDw9IDIsIFwiQXJndW1lbnQuU1wiLCBcIkVtcHR5IHN0cmluZyBvciBtdWx0aXBsZSBkb3RzLlwiKTtcbiAgICAgICAgICAgIC8vIHBhcnNlIG1haW4gcGFydFxuICAgICAgICAgICAgdmFyIGlzQmFzaWNGb3JtYXQgPSAocy5pbmRleE9mKFwiLVwiKSA9PT0gLTEpO1xuICAgICAgICAgICAgaWYgKGlzQmFzaWNGb3JtYXQpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLCBcIkFyZ3VtZW50LlNcIiwgXCJJU08gc3RyaW5nIGluIGJhc2ljIG5vdGF0aW9uIG1heSBvbmx5IGNvbnRhaW4gbnVtYmVycyBiZWZvcmUgdGhlIGZyYWN0aW9uYWwgcGFydFwiKTtcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxuICAgICAgICAgICAgICAgIHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSwgXCJBcmd1bWVudC5TXCIsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMCwgNCksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDYsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDgsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMikge1xuICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMiwgMiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZUFuZFRpbWUgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMubGVuZ3RoID4gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXSwgXCJcIl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoWzQsIDEwXS5pbmRleE9mKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCkgIT09IC0xLCBcIkFyZ3VtZW50LlNcIiwgXCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gMTApIHtcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoNSwgMiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGhvdXIgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoMCwgMiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxuICAgICAgICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEgJiYgc3BsaXRbMV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBmcmFjdGlvbiA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAobGFzdFVuaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5ZZWFyOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSBkYXlzSW5ZZWFyKHllYXIpICogODY0MDAwMDAgKiBmcmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0LkRheTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gNjAwMDAgKiBmcmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFRpbWVVbml0LlNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29tYmluZSBtYWluIGFuZCBmcmFjdGlvbmFsIHBhcnRcbiAgICAgICAgICAgIHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xuICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcbiAgICAgICAgICAgIGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcbiAgICAgICAgICAgIGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xuICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xuICAgICAgICAgICAgc2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xuICAgICAgICAgICAgdmFyIHVuaXhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCB9KTtcbiAgICAgICAgICAgIHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlcnJvcl8xLmVycm9ySXMoZSwgW1xuICAgICAgICAgICAgICAgIFwiQXJndW1lbnQuU1wiLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIkFyZ3VtZW50LkRheVwiLCBcIkFyZ3VtZW50LkhvdXJcIixcbiAgICAgICAgICAgICAgICBcIkFyZ3VtZW50Lk1pbnV0ZVwiLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIkFyZ3VtZW50Lk1pbGxpXCJcbiAgICAgICAgICAgIF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIElTTyA4NjAxIHN0cmluZzogXFxcIiVzXFxcIjogJXNcIiwgcywgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7IC8vIHByb2dyYW1taW5nIGVycm9yXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJ1bml4TWlsbGlzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdW5peE1pbGxpcyA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHRoaXMuX2NvbXBvbmVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhNaWxsaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiY29tcG9uZW50c1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBvbmVudHM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwieWVhclwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy55ZWFyO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcIm1vbnRoXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImRheVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiaG91clwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5ob3VyO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcIm1pbnV0ZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5taW51dGU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwic2Vjb25kXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJtaWxsaVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5taWxsaTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnllYXJEYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBkYXlPZlllYXIodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aCwgdGhpcy5jb21wb25lbnRzLmRheSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFcXVhbGl0eSBmdW5jdGlvblxuICAgICAqIEBwYXJhbSBvdGhlclxuICAgICAqIEB0aHJvd3MgVHlwZUVycm9yIGlmIG90aGVyIGlzIG5vdCBhbiBPYmplY3RcbiAgICAgKi9cbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bml4TWlsbGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fY29tcG9uZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy5fdW5peE1pbGxpcyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIGEgdGltZXN0YW1wLiBGaWx0ZXJzIG91dCBub24tZXhpc3RpbmcgdmFsdWVzIGZvciBhbGwgdGltZSBjb21wb25lbnRzXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fY29tcG9uZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5tb250aCA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5tb250aCA8PSAxMlxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMuZGF5IDw9IGRheXNJbk1vbnRoKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgpXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA8PSAyM1xuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlIDw9IDU5XG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPD0gNTlcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPD0gOTk5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXG4gICAgICAgICAgICArIFwiLVwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5tb250aC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuICAgICAgICAgICAgKyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG4gICAgICAgICAgICArIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG4gICAgICAgICAgICArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taW51dGUudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuICAgICAgICAgICAgKyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XG4gICAgfTtcbiAgICByZXR1cm4gVGltZVN0cnVjdDtcbn0oKSk7XG5leHBvcnRzLlRpbWVTdHJ1Y3QgPSBUaW1lU3RydWN0O1xuLyoqXG4gKiBCaW5hcnkgc2VhcmNoXG4gKiBAcGFyYW0gYXJyYXkgQXJyYXkgdG8gc2VhcmNoXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXG4gKiBAcmV0dXJucyBUaGUgaW5zZXJ0aW9uIGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIGxvb2sgZm9yXG4gKiBAdGhyb3dzIFR5cGVFcnJvciBpZiBhcnIgaXMgbm90IGFuIGFycmF5XG4gKiBAdGhyb3dzIHdoYXRldmVyIGBjb21wYXJlKClgIHRocm93c1xuICovXG5mdW5jdGlvbiBiaW5hcnlJbnNlcnRpb25JbmRleChhcnIsIGNvbXBhcmUpIHtcbiAgICB2YXIgbWluSW5kZXggPSAwO1xuICAgIHZhciBtYXhJbmRleCA9IGFyci5sZW5ndGggLSAxO1xuICAgIHZhciBjdXJyZW50SW5kZXg7XG4gICAgdmFyIGN1cnJlbnRFbGVtZW50O1xuICAgIC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcbiAgICBpZiAoIWFycikge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKGFyci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIC8vIG91dCBvZiBib3VuZHNcbiAgICBpZiAoY29tcGFyZShhcnJbMF0pID4gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XG4gICAgICAgIHJldHVybiBtYXhJbmRleCArIDE7XG4gICAgfVxuICAgIC8vIGVsZW1lbnQgaW4gcmFuZ2VcbiAgICB3aGlsZSAobWluSW5kZXggPD0gbWF4SW5kZXgpIHtcbiAgICAgICAgY3VycmVudEluZGV4ID0gTWF0aC5mbG9vcigobWluSW5kZXggKyBtYXhJbmRleCkgLyAyKTtcbiAgICAgICAgY3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcbiAgICAgICAgaWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpIDwgMCkge1xuICAgICAgICAgICAgbWluSW5kZXggPSBjdXJyZW50SW5kZXggKyAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpID4gMCkge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBjdXJyZW50SW5kZXggLSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJbmRleDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWF4SW5kZXg7XG59XG5leHBvcnRzLmJpbmFyeUluc2VydGlvbkluZGV4ID0gYmluYXJ5SW5zZXJ0aW9uSW5kZXg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1iYXNpY3MuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIERhdGUrdGltZSt0aW1lem9uZSByZXByZXNlbnRhdGlvblxuICovXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaXNEYXRlVGltZSA9IGV4cG9ydHMuRGF0ZVRpbWUgPSBleHBvcnRzLm5vdyA9IGV4cG9ydHMubm93VXRjID0gZXhwb3J0cy5ub3dMb2NhbCA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcbnZhciBmb3JtYXQgPSByZXF1aXJlKFwiLi9mb3JtYXRcIik7XG52YXIgamF2YXNjcmlwdF8xID0gcmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKTtcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcbnZhciBwYXJzZUZ1bmNzID0gcmVxdWlyZShcIi4vcGFyc2VcIik7XG52YXIgdGltZXNvdXJjZV8xID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcbnZhciB0aW1lem9uZV8xID0gcmVxdWlyZShcIi4vdGltZXpvbmVcIik7XG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xuLyoqXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gbm93TG9jYWwoKSB7XG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XG59XG5leHBvcnRzLm5vd0xvY2FsID0gbm93TG9jYWw7XG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAqL1xuZnVuY3Rpb24gbm93VXRjKCkge1xuICAgIHJldHVybiBEYXRlVGltZS5ub3dVdGMoKTtcbn1cbmV4cG9ydHMubm93VXRjID0gbm93VXRjO1xuLyoqXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAqL1xuZnVuY3Rpb24gbm93KHRpbWVab25lKSB7XG4gICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XG4gICAgcmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XG59XG5leHBvcnRzLm5vdyA9IG5vdztcbi8qKlxuICpcbiAqIEBwYXJhbSBsb2NhbFRpbWVcbiAqIEBwYXJhbSBmcm9tWm9uZVxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRUb1V0Yyhsb2NhbFRpbWUsIGZyb21ab25lKSB7XG4gICAgaWYgKGZyb21ab25lKSB7XG4gICAgICAgIHZhciBvZmZzZXQgPSBmcm9tWm9uZS5vZmZzZXRGb3Jab25lKGxvY2FsVGltZSk7XG4gICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChsb2NhbFRpbWUudW5peE1pbGxpcyAtIG9mZnNldCAqIDYwMDAwKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBsb2NhbFRpbWUuY2xvbmUoKTtcbiAgICB9XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gdXRjVGltZVxuICogQHBhcmFtIHRvWm9uZVxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRGcm9tVXRjKHV0Y1RpbWUsIHRvWm9uZSkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKHRvWm9uZSkge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gdG9ab25lLm9mZnNldEZvclV0Yyh1dGNUaW1lKTtcbiAgICAgICAgcmV0dXJuIHRvWm9uZS5ub3JtYWxpemVab25lVGltZShuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lLnVuaXhNaWxsaXMgKyBvZmZzZXQgKiA2MDAwMCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcbiAgICB9XG59XG4vKipcbiAqIERhdGVUaW1lIGNsYXNzIHdoaWNoIGlzIHRpbWUgem9uZS1hd2FyZVxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXG4gKi9cbnZhciBEYXRlVGltZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgQHNlZSBvdmVycmlkZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEYXRlVGltZShhMSwgYTIsIGEzLCBoLCBtLCBzLCBtcywgdGltZVpvbmUpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFsbG93IG5vdCB1c2luZyBpbnN0YW5jZW9mXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmtpbmQgPSBcIkRhdGVUaW1lXCI7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIChhMSkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTIgIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCwgXCJBcmd1bWVudC5BM1wiLCBcImZvciB1bml4IHRpbWVzdGFtcCBkYXRldGltZSBjb25zdHJ1Y3RvciwgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBzZWNvbmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9ICh0eXBlb2YgKGEyKSA9PT0gXCJvYmplY3RcIiAmJiBpc1RpbWVab25lKGEyKSA/IGEyIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gZXJyb3JfMS5jb252ZXJ0RXJyb3IoXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0oYTEpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHVuaXhNaWxsaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB5ZWFyIG1vbnRoIGRheSBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHlwZW9mIChhMykgPT09IFwibnVtYmVyXCIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGltZVpvbmUgPT09IHVuZGVmaW5lZCB8fCB0aW1lWm9uZSA9PT0gbnVsbCB8fCBpc1RpbWVab25lKHRpbWVab25lKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGVpZ2h0aCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5ZWFyXzEgPSBhMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb250aF8xID0gYTI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF5XzEgPSBhMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBob3VyXzEgPSAodHlwZW9mIChoKSA9PT0gXCJudW1iZXJcIiA/IGggOiAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW51dGVfMSA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlY29uZF8xID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWlsbGlfMSA9ICh0eXBlb2YgKG1zKSA9PT0gXCJudW1iZXJcIiA/IG1zIDogMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyXzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50LlllYXJcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bSh5ZWFyXzEpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoXzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50Lk1vbnRoXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0obW9udGhfMSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF5XzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50LkRheVwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKGRheV8xKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBob3VyXzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50LkhvdXJcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShob3VyXzEpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZV8xID0gZXJyb3JfMS5jb252ZXJ0RXJyb3IoXCJBcmd1bWVudC5NaW51dGVcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShtaW51dGVfMSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kXzEgPSBlcnJvcl8xLmNvbnZlcnRFcnJvcihcIkFyZ3VtZW50LlNlY29uZFwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKHNlY29uZF8xKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaWxsaV8xID0gZXJyb3JfMS5jb252ZXJ0RXJyb3IoXCJBcmd1bWVudC5NaWxsaVwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKG1pbGxpXzEpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bSA9IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhcl8xLCBtb250aDogbW9udGhfMSwgZGF5OiBkYXlfMSwgaG91cjogaG91cl8xLCBtaW51dGU6IG1pbnV0ZV8xLCBzZWNvbmQ6IHNlY29uZF8xLCBtaWxsaTogbWlsbGlfMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZSh0aW1lWm9uZSkgPyB0aW1lWm9uZSA6IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxpemUgbG9jYWwgdGltZSAocmVtb3ZlIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0bTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTIgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTRcIiwgXCJmaXJzdCB0d28gYXJndW1lbnRzIGFyZSBhIHN0cmluZywgdGhlcmVmb3JlIHRoZSBmb3VydGggdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMyksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aGlyZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvcm1hdCBzdHJpbmcgZ2l2ZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRlU3RyaW5nID0gYTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybWF0U3RyaW5nID0gYTI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgem9uZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYTMgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZShhMykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b25lID0gKGEzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHBhcnNlZC50aW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHBhcnNlZC56b25lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChhMyA9PT0gdW5kZWZpbmVkICYmIGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEzXCIsIFwiZmlyc3QgYXJndW1lbnRzIGlzIGEgc3RyaW5nIGFuZCB0aGUgc2Vjb25kIGlzIG5vdCwgdGhlcmVmb3JlIHRoZSB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEyKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaXZlblN0cmluZyA9IGExLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcyA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChzcy5sZW5ndGggPT09IDIsIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExICsgXCJcXFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzVGltZVpvbmUoYTIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHNzWzFdLnRyaW0oKSA/IHRpbWV6b25lXzEuVGltZVpvbmUuem9uZShzc1sxXSkgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlIG91ciBvd24gSVNPIHBhcnNpbmcgYmVjYXVzZSB0aGF0IGl0IHBsYXRmb3JtIGluZGVwZW5kZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tU3RyaW5nKHNzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhMSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTRcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBhIERhdGUsIHRoZXJlZm9yZSB0aGUgZm91cnRoIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiAmJiAoYTIgPT09IGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldCB8fCBhMiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDKSwgXCJBcmd1bWVudC5HZXRGdW5jc1wiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMyksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aGlyZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gKGExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkayA9IChhMik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEzID8gYTMgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGQsIGRrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHsgLy8gYTEgaW5zdGFuY2VvZiBUaW1lU3RydWN0XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTNcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBhIFRpbWVTdHJ1Y3QsIHRoZXJlZm9yZSB0aGUgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJleHBlY3QgYSBUaW1lWm9uZSBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGExLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEyID8gYTIgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChhMiA9PT0gdW5kZWZpbmVkICYmIGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCwgXCJBcmd1bWVudC5BMlwiLCBcImZpcnN0IGFyZ3VtZW50IGlzIHVuZGVmaW5lZCwgdGhlcmVmb3JlIHRoZSByZXN0IG11c3QgYWxzbyBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgZ2l2ZW4sIG1ha2UgbG9jYWwgZGF0ZXRpbWVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yXzEuZXJyb3IoXCJBcmd1bWVudC5BMVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHVuZXhwZWN0ZWQgZmlyc3QgYXJndW1lbnQgdHlwZS5cIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGVUaW1lLnByb3RvdHlwZSwgXCJ1dGNEYXRlXCIsIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVUQyB0aW1lc3RhbXAgKGxhemlseSBjYWxjdWxhdGVkKVxuICAgICAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl91dGNEYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdXRjRGF0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGVUaW1lLnByb3RvdHlwZSwgXCJ6b25lRGF0ZVwiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMb2NhbCB0aW1lc3RhbXAgKGxhemlseSBjYWxjdWxhdGVkKVxuICAgICAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgICAgICovXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lRGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fem9uZURhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5ub3dMb2NhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKG4sIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldCwgdGltZXpvbmVfMS5UaW1lWm9uZS5sb2NhbCgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgRGF0ZVRpbWUubm93VXRjID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQywgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXG4gICAgICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIERhdGVUaW1lLm5vdyA9IGZ1bmN0aW9uICh0aW1lWm9uZSkge1xuICAgICAgICBpZiAodGltZVpvbmUgPT09IHZvaWQgMCkgeyB0aW1lWm9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCk7IH1cbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxuICAgICAqIGkuZS4gYSBkb3VibGUgcmVwcmVzZW50aW5nIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxuICAgICAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmUgVGltZSB6b25lIHRvIGFzc3VtZSB0aGF0IHRoZSBleGNlbCB2YWx1ZSBpcyBpblxuICAgICAqIEByZXR1cm5zIGEgRGF0ZVRpbWVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTiBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVGltZVpvbmUgaWYgdGhlIGdpdmVuIHRpbWUgem9uZSBpcyBpbnZhbGlkXG4gICAgICovXG4gICAgRGF0ZVRpbWUuZnJvbUV4Y2VsID0gZnVuY3Rpb24gKG4sIHRpbWVab25lKSB7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzRmluaXRlKG4pLCBcIkFyZ3VtZW50Lk5cIiwgXCJpbnZhbGlkIG51bWJlclwiKTtcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG4gICAgICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcbiAgICAgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXG4gICAgICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxuICAgICAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXG4gICAgICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLmV4aXN0cyA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUsIGFsbG93UHJlMTk3MCkge1xuICAgICAgICBpZiAobW9udGggPT09IHZvaWQgMCkgeyBtb250aCA9IDE7IH1cbiAgICAgICAgaWYgKGRheSA9PT0gdm9pZCAwKSB7IGRheSA9IDE7IH1cbiAgICAgICAgaWYgKGhvdXIgPT09IHZvaWQgMCkgeyBob3VyID0gMDsgfVxuICAgICAgICBpZiAobWludXRlID09PSB2b2lkIDApIHsgbWludXRlID0gMDsgfVxuICAgICAgICBpZiAoc2Vjb25kID09PSB2b2lkIDApIHsgc2Vjb25kID0gMDsgfVxuICAgICAgICBpZiAobWlsbGlzZWNvbmQgPT09IHZvaWQgMCkgeyBtaWxsaXNlY29uZCA9IDA7IH1cbiAgICAgICAgaWYgKGFsbG93UHJlMTk3MCA9PT0gdm9pZCAwKSB7IGFsbG93UHJlMTk3MCA9IGZhbHNlOyB9XG4gICAgICAgIGlmICghaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KSB8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZClcbiAgICAgICAgICAgIHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFsbG93UHJlMTk3MCAmJiB5ZWFyIDwgMTk3MCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcbiAgICAgICAgICAgIHJldHVybiAoeWVhciA9PT0gZHQueWVhcigpICYmIG1vbnRoID09PSBkdC5tb250aCgpICYmIGRheSA9PT0gZHQuZGF5KClcbiAgICAgICAgICAgICAgICAmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCB0aGlzLl96b25lKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIGRhdGVzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fem9uZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxuICAgICAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lQWJicmV2aWF0aW9uID0gZnVuY3Rpb24gKGRzdERlcGVuZGVudCkge1xuICAgICAgICBpZiAoZHN0RGVwZW5kZW50ID09PSB2b2lkIDApIHsgZHN0RGVwZW5kZW50ID0gdHJ1ZTsgfVxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW5jbHVkaW5nIERTVCB3LnIudC4gVVRDIGluIG1pbnV0ZXMuIFJldHVybnMgMCBmb3IgdW5hd2FyZSBkYXRlcyBhbmQgZm9yIFVUQyBkYXRlcy5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5vZmZzZXREdXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBXSVRIT1VUIERTVCB3LnIudC4gVVRDIGFzIGEgRHVyYXRpb24uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0RHVyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHRoaXMuX3pvbmUuc3RhbmRhcmRPZmZzZXRGb3JVdGModGhpcy51dGNEYXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygwKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUueWVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUaGUgaG91ciAwLTIzXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmhvdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxuICAgICAqIHdlZWsgZGF5IG51bWJlcnMpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtEYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy56b25lRGF0ZS51bml4TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUueWVhckRheSgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG4gICAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxuICAgICAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXG4gICAgICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcbiAgICAgKlxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla09mTW9udGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuICAgICAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xuICAgICAqXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudW5peFV0Y01pbGxpcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNZZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMueWVhcjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjSG91ciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmhvdXI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjU2Vjb25kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcbiAgICAgKiB3ZWVrIGRheSBudW1iZXJzKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrRGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuICAgICAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxuICAgICAqXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla051bWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXG4gICAgICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cbiAgICAgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxuICAgICAqXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrT2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1NlY29uZE9mRGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXG4gICAgICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cbiAgICAgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cbiAgICAgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxuICAgICAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndpdGhab25lID0gZnVuY3Rpb24gKHpvbmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLCB6b25lKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cbiAgICAgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIHlvdSB0cnkgdG8gY29udmVydCBhIGRhdGV0aW1lIHdpdGhvdXQgYSB6b25lIHRvIGEgZGF0ZXRpbWUgd2l0aCBhIHpvbmVcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICh6b25lKSB7XG4gICAgICAgIGlmICh6b25lKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmUpIHsgLy8gaWYtc3RhdGVtZW50IHNhdGlzZmllcyB0aGUgY29tcGlsZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fem9uZS5lcXVhbHMoem9uZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTsgLy8gc3RpbGwgYXNzaWduLCBiZWNhdXNlIHpvbmVzIG1heSBiZSBlcXVhbCBidXQgbm90IGlkZW50aWNhbCAoVVRDL0dNVC8rMDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHpvbmU7XG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fem9uZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBkYXRlIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gdGltZSB6b25lLlxuICAgICAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxuICAgICAqIENvbnZlcnRpbmcgYW4gdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGUgdGhyb3dzIGFuIGV4Y2VwdGlvbi4gVXNlIHRoZSBjb25zdHJ1Y3RvclxuICAgICAqIGlmIHlvdSByZWFsbHkgbmVlZCB0byBkbyB0aGF0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVcdFRoZSBuZXcgdGltZSB6b25lLiBUaGlzIG1heSBiZSBudWxsIG9yIHVuZGVmaW5lZCB0byBjcmVhdGUgdW5hd2FyZSBkYXRlLlxuICAgICAqIEByZXR1cm4gVGhlIGNvbnZlcnRlZCBkYXRlXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiB5b3UgdHJ5IHRvIGNvbnZlcnQgYSBuYWl2ZSBkYXRldGltZSB0byBhbiBhd2FyZSBvbmUuXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvWm9uZSA9IGZ1bmN0aW9uICh6b25lKSB7XG4gICAgICAgIGlmICh6b25lKSB7XG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX3pvbmUsIFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xuICAgICAgICAgICAgcmVzdWx0LnV0Y0RhdGUgPSB0aGlzLnV0Y0RhdGU7XG4gICAgICAgICAgICByZXN1bHQuX3pvbmUgPSB6b25lO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cbiAgICAgKiBVbmxlc3MgdGhlIHRpbWV6b25lIGlzIGxvY2FsLCB0aGUgRGF0ZS5nZXRVVENYKCkgbWV0aG9kcyB3aWxsIE5PVCBiZSBjb3JyZWN0LlxuICAgICAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9EYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksIHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHpvbmUuXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG4gICAgICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXG4gICAgICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiB5b3UgdHJ5IHRvIGNvbnZlcnQgYSBuYWl2ZSBkYXRldGltZSB0byBhbiBhd2FyZSBvbmUuXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvRXhjZWwgPSBmdW5jdGlvbiAodGltZVpvbmUpIHtcbiAgICAgICAgdmFyIGR0ID0gdGhpcztcbiAgICAgICAgaWYgKHRpbWVab25lICYmICghdGhpcy5fem9uZSB8fCAhdGltZVpvbmUuZXF1YWxzKHRoaXMuX3pvbmUpKSkge1xuICAgICAgICAgICAgZHQgPSB0aGlzLnRvWm9uZSh0aW1lWm9uZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9mZnNldE1pbGxpcyA9IGR0Lm9mZnNldCgpICogNjAgKiAxMDAwO1xuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXAgKyBvZmZzZXRNaWxsaXMpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG4gICAgICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvVXRjRXhjZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gdGhpcy51bml4VXRjTWlsbGlzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIG5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsID0gZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XG4gICAgICAgIC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcbiAgICAgICAgdmFyIG1zZWNzID0gcmVzdWx0IC8gKDEgLyA4NjQwMDAwMCk7XG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKG1zZWNzKSAqICgxIC8gODY0MDAwMDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogSW1wbGVtZW50YXRpb24uXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xuICAgICAgICB2YXIgYW1vdW50O1xuICAgICAgICB2YXIgdTtcbiAgICAgICAgaWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoYTEpO1xuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XG4gICAgICAgICAgICB1ID0gZHVyYXRpb24udW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYW1vdW50ID0gKGExKTtcbiAgICAgICAgICAgIHUgPSB1bml0O1xuICAgICAgICB9XG4gICAgICAgIHZhciB1dGNUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLnV0Y0RhdGUsIGFtb3VudCwgdSk7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcbiAgICB9O1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5hZGRMb2NhbCA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xuICAgICAgICB2YXIgYW1vdW50O1xuICAgICAgICB2YXIgdTtcbiAgICAgICAgaWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoYTEpO1xuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XG4gICAgICAgICAgICB1ID0gZHVyYXRpb24udW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYW1vdW50ID0gKGExKTtcbiAgICAgICAgICAgIHUgPSB1bml0O1xuICAgICAgICB9XG4gICAgICAgIHZhciBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuem9uZURhdGUsIGFtb3VudCwgdSk7XG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gKGFtb3VudCA+PSAwID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXAgOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duKTtcbiAgICAgICAgICAgIHZhciBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShub3JtYWxpemVkLCB0aGlzLl96b25lKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobG9jYWxUbSwgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxuICAgICAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxuICAgICAqIG5lY2Vzc2FyeS5cbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50LkFtb3VudCBpZiBhbW91bnQgaXMgbm90IGZpbml0ZSBvciBpZiBpdCdzIG5vdCBhbiBpbnRlZ2VyIGFuZCB5b3UncmUgYWRkaW5nIG1vbnRocyBvciB5ZWFyc1xuICAgICAqIEB0aHJvd3MgQXJndW1lbnQuVW5pdCBmb3IgaW52YWxpZCB0aW1lIHVuaXRcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX2FkZFRvVGltZVN0cnVjdCA9IGZ1bmN0aW9uICh0bSwgYW1vdW50LCB1bml0KSB7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzRmluaXRlKGFtb3VudCksIFwiQXJndW1lbnQuQW1vdW50XCIsIFwiYW1vdW50IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyXCIpO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICAgICAgdmFyIG1vbnRoO1xuICAgICAgICB2YXIgZGF5O1xuICAgICAgICB2YXIgaG91cjtcbiAgICAgICAgdmFyIG1pbnV0ZTtcbiAgICAgICAgdmFyIHNlY29uZDtcbiAgICAgICAgdmFyIG1pbGxpO1xuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCkpO1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDEwMDApKTtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDYwMDAwKSk7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMzYwMDAwMCkpO1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogODY0MDAwMDApKTtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuV2VlazpcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6IHtcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJBcmd1bWVudC5BbW91bnRcIiwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XG4gICAgICAgICAgICAgICAgLy8ga2VlcCB0aGUgZGF5LW9mLW1vbnRoIHRoZSBzYW1lIChjbGFtcCB0byBlbmQtb2YtbW9udGgpXG4gICAgICAgICAgICAgICAgaWYgKGFtb3VudCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmNlaWwoKGFtb3VudCAtICgxMiAtIHRtLmNvbXBvbmVudHMubW9udGgpKSAvIDEyKTtcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5mbG9vcigoYW1vdW50ICsgKHRtLmNvbXBvbmVudHMubW9udGggLSAxKSkgLyAxMik7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5jZWlsKGFtb3VudCkpLCAxMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcbiAgICAgICAgICAgICAgICBob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xuICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuICAgICAgICAgICAgICAgIG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjoge1xuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQobWF0aC5pc0ludChhbW91bnQpLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xuICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBhbW91bnQ7XG4gICAgICAgICAgICAgICAgbW9udGggPSB0bS5jb21wb25lbnRzLm1vbnRoO1xuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcbiAgICAgICAgICAgICAgICBob3VyID0gdG0uY29tcG9uZW50cy5ob3VyO1xuICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHRtLmNvbXBvbmVudHMubWludXRlO1xuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuICAgICAgICAgICAgICAgIG1pbGxpID0gdG0uY29tcG9uZW50cy5taWxsaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LlVuaXRcIiwgXCJpbnZhbGlkIHRpbWUgdW5pdFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xuICAgICAgICBpZiAodHlwZW9mIGExID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gYTE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiBhbW91bnQsIHVuaXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gYTE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YkxvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgYTEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogYTEsIHVuaXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTG9jYWwoYTEubXVsdGlwbHkoLTEpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xuICAgICAqIEByZXR1cm4gdGhpcyAtIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZEYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZlllYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSBtb21lbnQgaW4gdGltZSBpbiBVVENcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxuICAgICAgICAgICAgJiYgKCF0aGlzLl96b25lKSA9PT0gKCFvdGhlci5fem9uZSlcbiAgICAgICAgICAgICYmICgoIXRoaXMuX3pvbmUgJiYgIW90aGVyLl96b25lKSB8fCAodGhpcy5fem9uZSAmJiBvdGhlci5fem9uZSAmJiB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlckVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQcm9wZXIgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIGFueSBJQU5BIHpvbmUgY29udmVydGVkIHRvIElTTyBvZmZzZXRcbiAgICAgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMyswMTowMFwiIGZvciBFdXJvcGUvQW1zdGVyZGFtXG4gICAgICogVW5hd2FyZSBkYXRlcyBoYXZlIG5vIHpvbmUgaW5mb3JtYXRpb24gYXQgdGhlIGVuZC5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHMgKyB0aW1lem9uZV8xLlRpbWVab25lLm9mZnNldFRvU3RyaW5nKHRoaXMub2Zmc2V0KCkpOyAvLyBjb252ZXJ0IElBTkEgbmFtZSB0byBvZmZzZXRcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBVVEMgYW5kIHRoZW4gcmV0dXJuIElTTyBzdHJpbmcgZW5kaW5nIGluICdaJy4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIERhdGUjdG9JU09TdHJpbmcoKVxuICAgICAqIGUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzIEV1cm9wZS9BbXN0ZXJkYW1cIiBiZWNvbWVzIFwiMjAxNC0wMS0wMVQyMjoxNTozM1pcIi5cbiAgICAgKiBVbmF3YXJlIGRhdGVzIGFyZSBhc3N1bWVkIHRvIGJlIGluIFVUQ1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvWm9uZSh0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS5mb3JtYXQoXCJ5eXl5LU1NLWRkVEhIOm1tOnNzLlNTU1paWlpaXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2l0aFpvbmUodGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSkuZm9ybWF0KFwieXl5eS1NTS1kZFRISDptbTpzcy5TU1NaWlpaWlwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXG4gICAgICogc3BlY2lmaWVkIGZvcm1hdC4gU2VlIExETUwubWQgZm9yIHN1cHBvcnRlZCBmb3JtYXRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXG4gICAgICogQHBhcmFtIGxvY2FsZSBPcHRpb25hbCwgbm9uLWVuZ2xpc2ggZm9ybWF0IG1vbnRoIG5hbWVzIGV0Yy5cbiAgICAgKiBAcmV0dXJuIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBEYXRlVGltZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gb3JtYXRTdHJpbmcgZm9yIGludmFsaWQgZm9ybWF0IHBhdHRlcm5cbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdFN0cmluZywgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy5fem9uZSwgZm9ybWF0U3RyaW5nLCBsb2NhbGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XG4gICAgICogQHBhcmFtIHMgdGhlIHN0cmluZyB0byBwYXJzZVxuICAgICAqIEBwYXJhbSBmb3JtYXQgdGhlIGZvcm1hdCB0aGUgc3RyaW5nIGlzIGluLiBTZWUgTERNTC5tZCBmb3Igc3VwcG9ydGVkIGZvcm1hdHMuXG4gICAgICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxuICAgICAqIEBwYXJhbSBsb2NhbGUgT3B0aW9uYWwsIGRpZmZlcmVudCBzZXR0aW5ncyBmb3IgY29uc3RhbnRzIGxpa2UgJ0FNJyBldGNcbiAgICAgKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBjaGFyYWN0ZXJzIGluIHRoZSBzb3VyY2Ugc3RyaW5nXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3IgaWYgdGhlIGdpdmVuIGRhdGVUaW1lU3RyaW5nIGlzIHdyb25nIG9yIG5vdCBhY2NvcmRpbmcgdG8gdGhlIHBhdHRlcm5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGlmIHRoZSBnaXZlbiBmb3JtYXQgc3RyaW5nIGlzIGludmFsaWRcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wYXJzZSA9IGZ1bmN0aW9uIChzLCBmb3JtYXQsIHpvbmUsIGxvY2FsZSwgYWxsb3dUcmFpbGluZykge1xuICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUsIGFsbG93VHJhaWxpbmcgfHwgZmFsc2UsIGxvY2FsZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHBhcnNlZC50aW1lLCBwYXJzZWQuem9uZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghZXJyb3JfMS5lcnJvcklzKGUsIFwiSW52YWxpZFRpbWVab25lRGF0YVwiKSkge1xuICAgICAgICAgICAgICAgIGUgPSBlcnJvcl8xLmVycm9yKFwiUGFyc2VFcnJvclwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIElBTkEgbmFtZSBpZiBhcHBsaWNhYmxlLlxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5PZmZzZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBzICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBkbyBub3Qgc2VwYXJhdGUgSVNPIHpvbmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvVXRjU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnRvU3RyaW5nKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcbiAgICAgICAgdmFyIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIndpdGhvdXQgRFNUXCIpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdF8xID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShzLnNsaWNlKDAsIGluZGV4IC0gMSkpO1xuICAgICAgICAgICAgcmVzdWx0XzFbMV0gKz0gXCIgd2l0aG91dCBEU1RcIjtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMTtcbiAgICAgICAgfVxuICAgICAgICBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xuICAgICAgICAgICAgcmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXggKyAxKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcbiAgICAgICAgaWYgKGluZGV4IDwgOCkge1xuICAgICAgICAgICAgaW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cbiAgICAgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXG4gICAgICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxuICAgICAqL1xuICAgIERhdGVUaW1lLnRpbWVTb3VyY2UgPSBuZXcgdGltZXNvdXJjZV8xLlJlYWxUaW1lU291cmNlKCk7XG4gICAgcmV0dXJuIERhdGVUaW1lO1xufSgpKTtcbmV4cG9ydHMuRGF0ZVRpbWUgPSBEYXRlVGltZTtcbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYGFgIGlzIHNpbWlsYXIgdG8gYSBUaW1lWm9uZSB3aXRob3V0IHVzaW5nIHRoZSBpbnN0YW5jZW9mIG9wZXJhdG9yLlxuICogSXQgY2hlY2tzIGZvciB0aGUgYXZhaWxhYmlsaXR5IG9mIHRoZSBmdW5jdGlvbnMgdXNlZCBpbiB0aGUgRGF0ZVRpbWUgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSBhIHRoZSBvYmplY3QgdG8gY2hlY2tcbiAqIEByZXR1cm5zIGEgaXMgVGltZVpvbmUtbGlrZVxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGlzVGltZVpvbmUoYSkge1xuICAgIGlmIChhICYmIHR5cGVvZiBhID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYS5ub3JtYWxpemVab25lVGltZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5hYmJyZXZpYXRpb25Gb3JVdGMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgJiYgdHlwZW9mIGEuc3RhbmRhcmRPZmZzZXRGb3JVdGMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgJiYgdHlwZW9mIGEuaWRlbnRpY2FsID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmVxdWFscyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5raW5kID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmNsb25lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbi8qKlxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gb2JqZWN0IGlzIG9mIHR5cGUgRGF0ZVRpbWUuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XG4gKiBhZ2FpbnN0IGRpZmZlcmVudCB2ZXJzaW9ucyBvZiB0aGUgbGlicmFyeSBpbiBvbmUgcHJvY2VzcyBpbnN0ZWFkIG9mIGluc3RhbmNlb2ZcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBjaGVja1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZVRpbWUodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmtpbmQgPT09IFwiRGF0ZVRpbWVcIjtcbn1cbmV4cG9ydHMuaXNEYXRlVGltZSA9IGlzRGF0ZVRpbWU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRldGltZS5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogVGltZSBkdXJhdGlvblxuICovXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaXNEdXJhdGlvbiA9IGV4cG9ydHMuRHVyYXRpb24gPSBleHBvcnRzLm1pbGxpc2Vjb25kcyA9IGV4cG9ydHMuc2Vjb25kcyA9IGV4cG9ydHMubWludXRlcyA9IGV4cG9ydHMuaG91cnMgPSBleHBvcnRzLmRheXMgPSBleHBvcnRzLm1vbnRocyA9IGV4cG9ydHMueWVhcnMgPSB2b2lkIDA7XG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICovXG5mdW5jdGlvbiB5ZWFycyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLnllYXJzKG4pO1xufVxuZXhwb3J0cy55ZWFycyA9IHllYXJzO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIG1vbnRocyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLm1vbnRocyhuKTtcbn1cbmV4cG9ydHMubW9udGhzID0gbW9udGhzO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gZGF5cyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLmRheXMobik7XG59XG5leHBvcnRzLmRheXMgPSBkYXlzO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICovXG5mdW5jdGlvbiBob3VycyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLmhvdXJzKG4pO1xufVxuZXhwb3J0cy5ob3VycyA9IGhvdXJzO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gbWludXRlcyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLm1pbnV0ZXMobik7XG59XG5leHBvcnRzLm1pbnV0ZXMgPSBtaW51dGVzO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gc2Vjb25kcyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLnNlY29uZHMobik7XG59XG5leHBvcnRzLnNlY29uZHMgPSBzZWNvbmRzO1xuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuKSB7XG4gICAgcmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcbn1cbmV4cG9ydHMubWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmRzO1xuLyoqXG4gKiBUaW1lIGR1cmF0aW9uIHdoaWNoIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFtb3VudCBhbmQgYSB1bml0IGUuZy5cbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXG4gKlxuICogSXQgaGFzIHR3byBzZXRzIG9mIGdldHRlciBmdW5jdGlvbnM6XG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxuICogLSBzZWNvbmRzKCksIG1pbnV0ZXMoKSwgaG91cnMoKSBldGMsIHBsdXJhbCBmb3JtOiB0aGVzZSByZXR1cm4gdGhlIHRvdGFsIGFtb3VudCByZXByZXNlbnRlZCBpbiB0aGUgY29ycmVzcG9uZGluZyB1bml0LlxuICovXG52YXIgRHVyYXRpb24gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEdXJhdGlvbihpMSwgdW5pdCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMua2luZCA9IFwiRHVyYXRpb25cIjtcbiAgICAgICAgaWYgKHR5cGVvZiBpMSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgLy8gYW1vdW50K3VuaXQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBpMTtcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzRmluaXRlKGFtb3VudCksIFwiQXJndW1lbnQuQW1vdW50XCIsIFwiYW1vdW50IHNob3VsZCBiZSBmaW5pdGU6ICVkXCIsIGFtb3VudCk7XG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG4gICAgICAgICAgICB0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcih0aGlzLl91bml0KSAmJiB0aGlzLl91bml0ID49IDAgJiYgdGhpcy5fdW5pdCA8IGJhc2ljc18xLlRpbWVVbml0Lk1BWCwgXCJBcmd1bWVudC5Vbml0XCIsIFwiSW52YWxpZCB0aW1lIHVuaXQgJWRcIiwgdGhpcy5fdW5pdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGkxID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvLyBzdHJpbmcgY29uc3RydWN0b3JcbiAgICAgICAgICAgIHZhciBzID0gaTE7XG4gICAgICAgICAgICB2YXIgdHJpbW1lZCA9IHMudHJpbSgpO1xuICAgICAgICAgICAgaWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNpZ24gPSAxO1xuICAgICAgICAgICAgICAgIHZhciBob3Vyc18xID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgbWludXRlc18xID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgc2Vjb25kc18xID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgbWlsbGlzZWNvbmRzXzEgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRyaW1tZWQuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQocGFydHMubGVuZ3RoID4gMCAmJiBwYXJ0cy5sZW5ndGggPCA0LCBcIkFyZ3VtZW50LlNcIiwgXCJOb3QgYSBwcm9wZXIgdGltZSBkdXJhdGlvbiBzdHJpbmc6IFxcXCJcIiArIHRyaW1tZWQgKyBcIlxcXCJcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRyaW1tZWQuY2hhckF0KDApID09PSBcIi1cIikge1xuICAgICAgICAgICAgICAgICAgICBzaWduID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBob3Vyc18xID0gK3BhcnRzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBtaW51dGVzXzEgPSArcGFydHNbMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWNvbmRQYXJ0cyA9IHBhcnRzWzJdLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kc18xID0gK3NlY29uZFBhcnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWlsbGlzZWNvbmRzXzEgPSArc3RyaW5ncy5wYWRSaWdodChzZWNvbmRQYXJ0c1sxXSwgMywgXCIwXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhbW91bnRNc2VjID0gc2lnbiAqIE1hdGgucm91bmQobWlsbGlzZWNvbmRzXzEgKyAxMDAwICogc2Vjb25kc18xICsgNjAwMDAgKiBtaW51dGVzXzEgKyAzNjAwMDAwICogaG91cnNfMSk7XG4gICAgICAgICAgICAgICAgLy8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxuICAgICAgICAgICAgICAgIGlmIChtaWxsaXNlY29uZHNfMSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZHNfMSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtaW51dGVzXzEgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaG91cnNfMSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50TXNlYyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHNwbGl0Lmxlbmd0aCA9PT0gMiwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnJXMnXCIsIHMpO1xuICAgICAgICAgICAgICAgIHZhciBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0Zpbml0ZShhbW91bnQpLCBcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICclcycsIGNhbm5vdCBwYXJzZSBhbW91bnRcIiwgcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gYW1vdW50O1xuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaTEgPT09IHVuZGVmaW5lZCAmJiB1bml0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgY29uc3RydWN0b3JcbiAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IDA7XG4gICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZhbHNlLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcImludmFsaWQgY29uc3RydWN0b3IgYXJndW1lbnRzXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAgICAgKiBAcGFyYW0gYW1vdW50IE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICAgICAqL1xuICAgIER1cmF0aW9uLnllYXJzID0gZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuWWVhcik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICAgICAqL1xuICAgIER1cmF0aW9uLm1vbnRocyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAgICAgKiBAcGFyYW0gYW1vdW50IE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5kYXlzID0gZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAgICAgKiBAcGFyYW0gYW1vdW50IE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICAgICAqL1xuICAgIER1cmF0aW9uLmhvdXJzID0gZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gICAgICovXG4gICAgRHVyYXRpb24ubWludXRlcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gICAgICovXG4gICAgRHVyYXRpb24uc2Vjb25kcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICAgICAqL1xuICAgIER1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQsIHRoaXMuX3VuaXQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIGR1cmF0aW9uIGV4cHJlc3NlZCBpbiBkaWZmZXJlbnQgdW5pdCAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpLlxuICAgICAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cbiAgICAgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYXMgPSBmdW5jdGlvbiAodW5pdCkge1xuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpIHtcbiAgICAgICAgICAgIHZhciB0aGlzTW9udGhzID0gKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xuICAgICAgICAgICAgdmFyIHJlcU1vbnRocyA9ICh1bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTW9udGhzIC8gcmVxTW9udGhzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XG4gICAgICAgICAgICB2YXIgcmVxTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNc2VjIC8gcmVxTXNlYztcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0aGlzIGR1cmF0aW9uIHRvIGEgRHVyYXRpb24gaW4gYW5vdGhlciB1bml0LiBZb3UgYWx3YXlzIGdldCBhIGNsb25lIGV2ZW4gaWYgeW91IHNwZWNpZnlcbiAgICAgKiB0aGUgc2FtZSB1bml0LlxuICAgICAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cbiAgICAgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICh1bml0KSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5hcyh1bml0KSwgdW5pdCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUpXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWlsbGlzZWNvbmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgbWlsbGlzZWNvbmQgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuICAgICAqIEByZXR1cm4gZS5nLiA0MDAgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taWxsaXNlY29uZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgMTUwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2Vjb25kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBzZWNvbmQgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuICAgICAqIEByZXR1cm4gZS5nLiAzIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2Vjb25kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaW51dGVzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgOTAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgbWludXRlIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcbiAgICAgKiBAcmV0dXJuIGUuZy4gMiBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gaG91cnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA1NDAwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ob3VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgaG91ciBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgZGF5IGhhcyAyNCBob3VycyAod2hpY2ggaXMgbm90IHRoZSBjYXNlXG4gICAgICogZHVyaW5nIERTVCBjaGFuZ2VzKS5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgaG91ciBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKS5cbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBwYXJ0IGNhbiBleGNlZWQgMjMgaG91cnMsIGJlY2F1c2UgZm9yXG4gICAgICogbm93LCB3ZSBkbyBub3QgaGF2ZSBhIGRheXMoKSBmdW5jdGlvblxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG4gICAgICogQHJldHVybiBlLmcuIDI1IGZvciBhIC0yNTowMjowMy40MDAgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUud2hvbGVIb3VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gZGF5cyFcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBkYXkgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIG1vbnRoIGhhcyAzMCBkYXlzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tb250aHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBtb250aCBwYXJ0IG9mIGEgZHVyYXRpb24uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHllYXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUueWVhcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogTm9uLWZyYWN0aW9uYWwgcG9zaXRpdmUgeWVhcnNcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUud2hvbGVZZWFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMTIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC9cbiAgICAgICAgICAgICAgICBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFtb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB1bml0IHRoaXMgZHVyYXRpb24gd2FzIGNyZWF0ZWQgd2l0aFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS51bml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5pdDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNpZ25cbiAgICAgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zaWduID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2Ftb3VudCA8IDAgPyBcIi1cIiA6IFwiXCIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5sZXNzRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPD0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHZhciBjb252ZXJ0ZWQgPSBvdGhlci5jb252ZXJ0KHRoaXMuX3VuaXQpO1xuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcbiAgICAgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xuICAgICAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmVxdWFsc0V4YWN0ID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIGlmICh0aGlzLl91bml0ID09PSBvdGhlci5fdW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuICh0aGlzLl9hbW91bnQgPT09IG90aGVyLl9hbW91bnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPj0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgb3RoZXIudW5pdCgpID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtb250aHMgYW5kIHllYXJzXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA8IGJhc2ljc18xLlRpbWVVbml0LkRheSAmJiBvdGhlci51bml0KCkgPCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7IC8vIGNhbiBjb21wYXJlIG1pbGxpc2Vjb25kcyB0aHJvdWdoIGhvdXJzXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGNhbm5vdCBjb21wYXJlIGRheXMgdG8gYW55dGhpbmcgZWxzZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTYW1lIHVuaXQgYW5kIHNhbWUgYW1vdW50XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBvdGhlci5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBvdGhlci51bml0KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBpcyBhIG5vbi16ZXJvIGxlbmd0aCBkdXJhdGlvblxuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ub25aZXJvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICE9PSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgaXMgYSB6ZXJvLWxlbmd0aCBkdXJhdGlvblxuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS56ZXJvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID4gb3RoZXIubWlsbGlzZWNvbmRzKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIChtb3N0IG5lZ2F0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gKG1vc3QgcG9zaXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICogdmFsdWUsIHRoaXMuX3VuaXQpO1xuICAgIH07XG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgJiYgdmFsdWUgIT09IDAsIFwiQXJndW1lbnQuVmFsdWVcIiwgXCJjYW5ub3QgZGl2aWRlIGJ5ICVkXCIsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh2YWx1ZS5hbW91bnQoKSAhPT0gMCwgXCJBcmd1bWVudC5WYWx1ZVwiLCBcImNhbm5vdCBkaXZpZGUgYnkgMFwiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZCBhIGR1cmF0aW9uLlxuICAgICAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKyB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCArIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFN1YnRyYWN0IGEgZHVyYXRpb24uXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAtIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC0gdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZHVyYXRpb24gaS5lLiByZW1vdmUgdGhlIHNpZ24uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFicyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkoLTEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTdHJpbmcgaW4gWy1daGhoaDptbTpzcy5ubm4gbm90YXRpb24uIEFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9GdWxsU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50b0htc1N0cmluZyh0cnVlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFN0cmluZyBpbiBbLV1oaGhoOm1tWzpzc1subm5uXV0gbm90YXRpb24uXG4gICAgICogQHBhcmFtIGZ1bGwgSWYgdHJ1ZSwgdGhlbiBhbGwgZmllbGRzIGFyZSBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uIE90aGVyd2lzZSwgc2Vjb25kcyBhbmQgbWlsbGlzZWNvbmRzXG4gICAgICogYXJlIGNob3BwZWQgb2ZmIGlmIHplcm9cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9IbXNTdHJpbmcgPSBmdW5jdGlvbiAoZnVsbCkge1xuICAgICAgICBpZiAoZnVsbCA9PT0gdm9pZCAwKSB7IGZ1bGwgPSBmYWxzZTsgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICAgICAgaWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMuc2Vjb25kKCkgPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbnV0ZSgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJTXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZToge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlBUXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7IC8vIG5vdGUgdGhlIFwiVFwiIHRvIGRpc2FtYmlndWF0ZSB0aGUgXCJNXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjoge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiRFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiV1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDoge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjoge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIllcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQuXCIpOyAvLyBwcm9ncmFtbWluZyBlcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIHdpdGggYW1vdW50IGFuZCB1bml0IGUuZy4gJzEuNSB5ZWFycycgb3IgJy0xIGRheSdcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCIgXCIgKyBiYXNpY3MudGltZVVuaXRUb1N0cmluZyh0aGlzLl91bml0LCB0aGlzLl9hbW91bnQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGlzICUgdW5pdCwgYWx3YXlzIHBvc2l0aXZlXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLl9wYXJ0ID0gZnVuY3Rpb24gKHVuaXQpIHtcbiAgICAgICAgdmFyIG5leHRVbml0O1xuICAgICAgICAvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcbiAgICAgICAgc3dpdGNoICh1bml0KSB7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNlY3MgPSAoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpKSAlIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKG5leHRVbml0KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XG4gICAgfTtcbiAgICByZXR1cm4gRHVyYXRpb247XG59KCkpO1xuZXhwb3J0cy5EdXJhdGlvbiA9IER1cmF0aW9uO1xuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBEdXJhdGlvbi4gTm90ZSB0aGF0IGl0IGRvZXMgbm90IHdvcmsgZm9yIHN1YiBjbGFzc2VzLiBIb3dldmVyLCB1c2UgdGhpcyB0byBiZSByb2J1c3RcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gaXNEdXJhdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUua2luZCA9PT0gXCJEdXJhdGlvblwiO1xufVxuZXhwb3J0cy5pc0R1cmF0aW9uID0gaXNEdXJhdGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWR1cmF0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTkgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jb252ZXJ0RXJyb3IgPSBleHBvcnRzLmVycm9ySXMgPSBleHBvcnRzLmVycm9yID0gZXhwb3J0cy50aHJvd0Vycm9yID0gdm9pZCAwO1xudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcbi8qKlxuICogVGhyb3dzIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1lc3NhZ2VcbiAqIEBwYXJhbSBuYW1lIGVycm9yIG5hbWUsIHdpdGhvdXQgdGltZXpvbmVjb21wbGV0ZSBwcmVmaXhcbiAqIEBwYXJhbSBmb3JtYXQgbWVzc2FnZSB3aXRoIHBlcmNlbnQtc3R5bGUgcGxhY2Vob2xkZXJzXG4gKiBAcGFyYW0gYXJncyBhcmd1bWVudHMgZm9yIHRoZSBwbGFjZWhvbGRlcnNcbiAqIEB0aHJvd3MgdGhlIGdpdmVuIGVycm9yXG4gKi9cbmZ1bmN0aW9uIHRocm93RXJyb3IobmFtZSwgZm9ybWF0KSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDI7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IodXRpbC5mb3JtYXQoZm9ybWF0LCBhcmdzKSk7XG4gICAgZXJyb3IubmFtZSA9IFwidGltZXpvbmVjb21wbGV0ZS5cIiArIG5hbWU7XG4gICAgdGhyb3cgZXJyb3I7XG59XG5leHBvcnRzLnRocm93RXJyb3IgPSB0aHJvd0Vycm9yO1xuLyoqXG4gKiBSZXR1cm5zIGFuIGVycm9yIHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG1lc3NhZ2VcbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gZm9ybWF0XG4gKiBAcGFyYW0gYXJnc1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGVycm9yKG5hbWUsIGZvcm1hdCkge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgYXJnc1tfaSAtIDJdID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHV0aWwuZm9ybWF0KGZvcm1hdCwgYXJncykpO1xuICAgIGVycm9yLm5hbWUgPSBcInRpbWV6b25lY29tcGxldGUuXCIgKyBuYW1lO1xuICAgIHJldHVybiBlcnJvcjtcbn1cbmV4cG9ydHMuZXJyb3IgPSBlcnJvcjtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmZiBgZXJyb3IubmFtZWAgaXMgZXF1YWwgdG8gb3IgaW5jbHVkZWQgYnkgYG5hbWVgXG4gKiBAcGFyYW0gZXJyb3JcbiAqIEBwYXJhbSBuYW1lIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gZXJyb3JJcyhlcnJvciwgbmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gZXJyb3IubmFtZSA9PT0gXCJ0aW1lem9uZWNvbXBsZXRlLlwiICsgbmFtZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBlcnJvci5uYW1lLnN0YXJ0c1dpdGgoXCJ0aW1lem9uZWNvbXBsZXRlLlwiKSAmJiBuYW1lLmluY2x1ZGVzKGVycm9yLm5hbWUuc3Vic3RyKFwidGltZXpvbmVjb21wbGV0ZS5cIi5sZW5ndGgpKTtcbiAgICB9XG59XG5leHBvcnRzLmVycm9ySXMgPSBlcnJvcklzO1xuLyoqXG4gKiBDb252ZXJ0cyBhbGwgZXJyb3JzIHRocm93biBieSBgY2JgIHRvIHRoZSBnaXZlbiBlcnJvciBuYW1lXG4gKiBAcGFyYW0gZXJyb3JOYW1lXG4gKiBAcGFyYW0gY2JcbiAqIEB0aHJvd3MgW2Vycm9yTmFtZV1cbiAqL1xuZnVuY3Rpb24gY29udmVydEVycm9yKGVycm9yTmFtZSwgY2IpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2IoKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JOYW1lLCBlLm1lc3NhZ2UpO1xuICAgIH1cbn1cbmV4cG9ydHMuY29udmVydEVycm9yID0gY29udmVydEVycm9yO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXJyb3IuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5mb3JtYXQgPSB2b2lkIDA7XG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcbnZhciBsb2NhbGVfMSA9IHJlcXVpcmUoXCIuL2xvY2FsZVwiKTtcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcbnZhciB0b2tlbl8xID0gcmVxdWlyZShcIi4vdG9rZW5cIik7XG4vKipcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcbiAqIEBwYXJhbSBsb2NhbFpvbmUgVGhlIHpvbmUgdGhhdCBjdXJyZW50VGltZSBpcyBpblxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgTERNTCBmb3JtYXQgcGF0dGVybiAoc2VlIExETUwubWQpXG4gKiBAcGFyYW0gbG9jYWxlIE90aGVyIGZvcm1hdCBvcHRpb25zIHN1Y2ggYXMgbW9udGggbmFtZXNcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICovXG5mdW5jdGlvbiBmb3JtYXQoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSwgZm9ybWF0U3RyaW5nLCBsb2NhbGUpIHtcbiAgICBpZiAobG9jYWxlID09PSB2b2lkIDApIHsgbG9jYWxlID0ge307IH1cbiAgICB2YXIgbWVyZ2VkTG9jYWxlID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGxvY2FsZV8xLkRFRkFVTFRfTE9DQUxFKSwgbG9jYWxlKTtcbiAgICB2YXIgdG9rZW5zID0gdG9rZW5fMS50b2tlbml6ZShmb3JtYXRTdHJpbmcpO1xuICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgIGZvciAodmFyIF9pID0gMCwgdG9rZW5zXzEgPSB0b2tlbnM7IF9pIDwgdG9rZW5zXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc18xW19pXTtcbiAgICAgICAgdmFyIHRva2VuUmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuRVJBOlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLllFQVI6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5RVUFSVEVSOlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NT05USDpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWTpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFS0RBWTpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuREFZUEVSSU9EOlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkhPVVI6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0SG91cihkYXRlVGltZSwgdG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NSU5VVEU6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0TWludXRlKGRhdGVUaW1lLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlNFQ09ORDpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRTZWNvbmQoZGF0ZVRpbWUsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuWk9ORTpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRab25lKGRhdGVUaW1lLCB1dGNUaW1lLCBsb2NhbFpvbmUgPyBsb2NhbFpvbmUgOiB1bmRlZmluZWQsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFSzpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLklERU5USVRZOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaFxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSB0b2tlbi5yYXc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IHRva2VuUmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LnRyaW0oKTtcbn1cbmV4cG9ydHMuZm9ybWF0ID0gZm9ybWF0O1xuLyoqXG4gKiBGb3JtYXQgdGhlIGVyYSAoQkMgb3IgQUQpXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0RXJhKGRhdGVUaW1lLCB0b2tlbiwgbG9jYWxlKSB7XG4gICAgdmFyIEFEID0gZGF0ZVRpbWUueWVhciA+IDA7XG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBsb2NhbGUuZXJhQWJicmV2aWF0ZWRbMF0gOiBsb2NhbGUuZXJhQWJicmV2aWF0ZWRbMV0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYVdpZGVbMF0gOiBsb2NhbGUuZXJhV2lkZVsxXSk7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHJldHVybiAoQUQgPyBsb2NhbGUuZXJhTmFycm93WzBdIDogbG9jYWxlLmVyYU5hcnJvd1sxXSk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLyoqXG4gKiBGb3JtYXQgdGhlIHllYXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJ5XCI6XG4gICAgICAgIGNhc2UgXCJZXCI6XG4gICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICB2YXIgeWVhclZhbHVlID0gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcbiAgICAgICAgICAgICAgICB5ZWFyVmFsdWUgPSB5ZWFyVmFsdWUuc2xpY2UoLTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHllYXJWYWx1ZTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgcXVhcnRlclxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgbG9jYWxlKSB7XG4gICAgdmFyIHF1YXJ0ZXIgPSBNYXRoLmNlaWwoZGF0ZVRpbWUubW9udGggLyAzKTtcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHF1YXJ0ZXIudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5xdWFydGVyTGV0dGVyICsgcXVhcnRlcjtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUucXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBsb2NhbGUucXVhcnRlcldvcmQ7XG4gICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVhcnRlci50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcInFcIjpcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5zdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJXb3JkO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xuICAgIH1cbn1cbi8qKlxuICogRm9ybWF0IHRoZSBtb250aFxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJNXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5sb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5tb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJMXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZUxvbmdNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XG4gICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgbW9udGggcGF0dGVyblwiKTtcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgd2VlayBudW1iZXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRXZWVrKGRhdGVUaW1lLCB0b2tlbikge1xuICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwid1wiKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtOdW1iZXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrT2ZNb250aChkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKSB7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcImRcIjpcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuZGF5LnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuICAgICAgICBjYXNlIFwiRFwiOlxuICAgICAgICAgICAgdmFyIGRheU9mWWVhciA9IGJhc2ljcy5kYXlPZlllYXIoZGF0ZVRpbWUueWVhciwgZGF0ZVRpbWUubW9udGgsIGRhdGVUaW1lLmRheSkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXlPZlllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLyoqXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcbiAgICB2YXIgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcykudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzW3dlZWtEYXlOdW1iZXJdO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUud2Vla2RheUxldHRlcnNbd2Vla0RheU51bWJlcl07XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUud2Vla2RheVR3b0xldHRlcnNbd2Vla0RheU51bWJlcl07XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLyoqXG4gKiBGb3JtYXQgdGhlIERheSBQZXJpb2QgKEFNIG9yIFBNKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJhXCI6IHtcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPD0gMykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4ubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUuYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUucG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiYlwiOlxuICAgICAgICBjYXNlIFwiQlwiOiB7XG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoIDw9IDMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubWlkbmlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDEyICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5ub29uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodG9rZW4ubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDAgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDEyICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RXaWRlLm5vb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUuYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUucG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDAgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5taWRuaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5ub29uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgSG91clxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKSB7XG4gICAgdmFyIGhvdXIgPSBkYXRlVGltZS5ob3VyO1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJoXCI6XG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcbiAgICAgICAgICAgICAgICBob3VyID0gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIGNhc2UgXCJIXCI6XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIGNhc2UgXCJLXCI6XG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuICAgICAgICBjYXNlIFwia1wiOlxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcbiAgICAgICAgICAgICAgICBob3VyID0gMjQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLyoqXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pIHtcbiAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1pbnV0ZS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbn1cbi8qKlxuICogRm9ybWF0IHRoZSBzZWNvbmRzIChvciBmcmFjdGlvbiBvZiBhIHNlY29uZClcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LioqIGlmIGFueSBvZiB0aGUgZ2l2ZW4gZGF0ZVRpbWUgZWxlbWVudHMgYXJlIGludmFsaWRcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSBkYXRlVGltZS5taWxsaTtcbiAgICAgICAgICAgIHZhciBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkTGVmdChmcmFjdGlvbi50b1N0cmluZygpLCAzLCBcIjBcIik7XG4gICAgICAgICAgICBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkUmlnaHQoZnJhY3Rpb25TdHJpbmcsIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZyYWN0aW9uU3RyaW5nLnNsaWNlKDAsIHRva2VuLmxlbmd0aCk7XG4gICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy5zZWNvbmRPZkRheShkYXRlVGltZS5ob3VyLCBkYXRlVGltZS5taW51dGUsIGRhdGVUaW1lLnNlY29uZCkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLyoqXG4gKiBGb3JtYXQgdGhlIHRpbWUgem9uZS4gRm9yIHRoaXMsIHdlIG5lZWQgdGhlIGN1cnJlbnQgdGltZSwgdGhlIHRpbWUgaW4gVVRDIGFuZCB0aGUgdGltZSB6b25lXG4gKiBAcGFyYW0gY3VycmVudFRpbWUgVGhlIHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcbiAqIEBwYXJhbSB6b25lIFRoZSB0aW1lem9uZSBjdXJyZW50VGltZSBpcyBpblxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICovXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgdG9rZW4pIHtcbiAgICBpZiAoIXpvbmUpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHZhciBvZmZzZXQgPSBNYXRoLnJvdW5kKChjdXJyZW50VGltZS51bml4TWlsbGlzIC0gdXRjVGltZS51bml4TWlsbGlzKSAvIDYwMDAwKTtcbiAgICB2YXIgb2Zmc2V0SG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XG4gICAgdmFyIG9mZnNldEhvdXJzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldEhvdXJzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcbiAgICBvZmZzZXRIb3Vyc1N0cmluZyA9IChvZmZzZXQgPj0gMCA/IFwiK1wiICsgb2Zmc2V0SG91cnNTdHJpbmcgOiBcIi1cIiArIG9mZnNldEhvdXJzU3RyaW5nKTtcbiAgICB2YXIgb2Zmc2V0TWludXRlcyA9IE1hdGguYWJzKG9mZnNldCAlIDYwKTtcbiAgICB2YXIgb2Zmc2V0TWludXRlc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRNaW51dGVzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcbiAgICB2YXIgcmVzdWx0O1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJPXCI6XG4gICAgICAgICAgICByZXN1bHQgPSBcIkdNVFwiO1xuICAgICAgICAgICAgaWYgKG9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiK1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiLVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldEhvdXJzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID49IDQgfHwgb2Zmc2V0TWludXRlcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSB0b2tlbi5yYXcuc2xpY2UoNCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICBjYXNlIFwiWlwiOlxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUb2tlbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogXCJPT09PXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IFwiT1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdG9rZW5fMS5Ub2tlblR5cGUuWk9ORVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2Zvcm1hdFpvbmUoY3VycmVudFRpbWUsIHV0Y1RpbWUsIHpvbmUsIG5ld1Rva2VuKTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlpcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIFwielwiOlxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIFwidlwiOlxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcIlZcIjpcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgaW1wbGVtZW50ZWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidW5rXCI7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5uYW1lKCk7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiVW5rbm93blwiO1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcIlhcIjpcbiAgICAgICAgY2FzZSBcInhcIjpcbiAgICAgICAgICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlpcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBvZmZzZXRIb3Vyc1N0cmluZztcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBvZmZzZXRNaW51dGVzU3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgY2FzZSA1OiAvLyBObyBzZWNvbmRzIGluIG91ciBpbXBsZW1lbnRhdGlvbiwgc28gdGhpcyBpcyB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvcm1hdC5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogR2xvYmFsIGZ1bmN0aW9ucyBkZXBlbmRpbmcgb24gRGF0ZVRpbWUvRHVyYXRpb24gZXRjXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hYnMgPSBleHBvcnRzLm1heCA9IGV4cG9ydHMubWluID0gdm9pZCAwO1xudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRDEgaWYgZDEgaXMgdW5kZWZpbmVkL251bGxcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMiBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbCwgb3IgaWYgZDEgYW5kIGQyIGFyZSBub3QgYm90aCBkYXRldGltZXNcbiAqL1xuZnVuY3Rpb24gbWluKGQxLCBkMikge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEsIFwiQXJndW1lbnQuRDFcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQyLCBcIkFyZ3VtZW50LkQyXCIsIFwic2Vjb25kIGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMS5raW5kID09PSBkMi5raW5kLCBcIkFyZ3VtZW50LkQyXCIsIFwiZXhwZWN0ZWQgZWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9uc1wiKTtcbiAgICByZXR1cm4gZDEubWluKGQyKTtcbn1cbmV4cG9ydHMubWluID0gbWluO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRDEgaWYgZDEgaXMgdW5kZWZpbmVkL251bGxcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMiBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbCwgb3IgaWYgZDEgYW5kIGQyIGFyZSBub3QgYm90aCBkYXRldGltZXNcbiAqL1xuZnVuY3Rpb24gbWF4KGQxLCBkMikge1xuICAgIGFzc2VydF8xLmRlZmF1bHQoZDEsIFwiQXJndW1lbnQuRDFcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KGQyLCBcIkFyZ3VtZW50LkQyXCIsIFwic2Vjb25kIGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkMS5raW5kID09PSBkMi5raW5kLCBcIkFyZ3VtZW50LkQyXCIsIFwiZXhwZWN0ZWQgZWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9uc1wiKTtcbiAgICByZXR1cm4gZDEubWF4KGQyKTtcbn1cbmV4cG9ydHMubWF4ID0gbWF4O1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBhIER1cmF0aW9uXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRCBpZiBkIGlzIHVuZGVmaW5lZC9udWxsXG4gKi9cbmZ1bmN0aW9uIGFicyhkKSB7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChkLCBcIkFyZ3VtZW50LkRcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcbiAgICByZXR1cm4gZC5hYnMoKTtcbn1cbmV4cG9ydHMuYWJzID0gYWJzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2xvYmFscy5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5EYXRlRnVuY3Rpb25zID0gdm9pZCAwO1xuLyoqXG4gKiBJbmRpY2F0ZXMgaG93IGEgRGF0ZSBvYmplY3Qgc2hvdWxkIGJlIGludGVycHJldGVkLlxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxuICogdmFsdWVzLCBvciB3ZSBjYW4gdGFrZSBnZXRVVENZZWFyKCksIGdldFV0Y01vbnRoKCkgZXRjIHRvIGRvIHRoYXQuXG4gKi9cbnZhciBEYXRlRnVuY3Rpb25zO1xuKGZ1bmN0aW9uIChEYXRlRnVuY3Rpb25zKSB7XG4gICAgLyoqXG4gICAgICogVXNlIHRoZSBEYXRlLmdldEZ1bGxZZWFyKCksIERhdGUuZ2V0TW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cbiAgICAgKi9cbiAgICBEYXRlRnVuY3Rpb25zW0RhdGVGdW5jdGlvbnNbXCJHZXRcIl0gPSAwXSA9IFwiR2V0XCI7XG4gICAgLyoqXG4gICAgICogVXNlIHRoZSBEYXRlLmdldFVUQ0Z1bGxZZWFyKCksIERhdGUuZ2V0VVRDTW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cbiAgICAgKi9cbiAgICBEYXRlRnVuY3Rpb25zW0RhdGVGdW5jdGlvbnNbXCJHZXRVVENcIl0gPSAxXSA9IFwiR2V0VVRDXCI7XG59KShEYXRlRnVuY3Rpb25zID0gZXhwb3J0cy5EYXRlRnVuY3Rpb25zIHx8IChleHBvcnRzLkRhdGVGdW5jdGlvbnMgPSB7fSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9amF2YXNjcmlwdC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTcgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5ERUZBVUxUX0xPQ0FMRSA9IGV4cG9ydHMuREFZX1BFUklPRFNfTkFSUk9XID0gZXhwb3J0cy5EQVlfUEVSSU9EU19XSURFID0gZXhwb3J0cy5EQVlfUEVSSU9EU19BQkJSRVZJQVRFRCA9IGV4cG9ydHMuV0VFS0RBWV9MRVRURVJTID0gZXhwb3J0cy5XRUVLREFZX1RXT19MRVRURVJTID0gZXhwb3J0cy5TSE9SVF9XRUVLREFZX05BTUVTID0gZXhwb3J0cy5MT05HX1dFRUtEQVlfTkFNRVMgPSBleHBvcnRzLlNUQU5EX0FMT05FX01PTlRIX0xFVFRFUlMgPSBleHBvcnRzLlNUQU5EX0FMT05FX1NIT1JUX01PTlRIX05BTUVTID0gZXhwb3J0cy5TVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTID0gZXhwb3J0cy5NT05USF9MRVRURVJTID0gZXhwb3J0cy5TSE9SVF9NT05USF9OQU1FUyA9IGV4cG9ydHMuTE9OR19NT05USF9OQU1FUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9BQkJSRVZJQVRJT05TID0gZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX1dPUkQgPSBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfTEVUVEVSID0gZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMgPSBleHBvcnRzLlFVQVJURVJfV09SRCA9IGV4cG9ydHMuUVVBUlRFUl9MRVRURVIgPSBleHBvcnRzLkVSQV9OQU1FU19BQkJSRVZJQVRFRCA9IGV4cG9ydHMuRVJBX05BTUVTX1dJREUgPSBleHBvcnRzLkVSQV9OQU1FU19OQVJST1cgPSB2b2lkIDA7XG5leHBvcnRzLkVSQV9OQU1FU19OQVJST1cgPSBbXCJBXCIsIFwiQlwiXTtcbmV4cG9ydHMuRVJBX05BTUVTX1dJREUgPSBbXCJBbm5vIERvbWluaVwiLCBcIkJlZm9yZSBDaHJpc3RcIl07XG5leHBvcnRzLkVSQV9OQU1FU19BQkJSRVZJQVRFRCA9IFtcIkFEXCIsIFwiQkNcIl07XG5leHBvcnRzLlFVQVJURVJfTEVUVEVSID0gXCJRXCI7XG5leHBvcnRzLlFVQVJURVJfV09SRCA9IFwicXVhcnRlclwiO1xuZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMgPSBbXCIxc3RcIiwgXCIybmRcIiwgXCIzcmRcIiwgXCI0dGhcIl07XG4vKipcbiAqIEluIHNvbWUgbGFuZ3VhZ2VzLCBkaWZmZXJlbnQgd29yZHMgYXJlIG5lY2Vzc2FyeSBmb3Igc3RhbmQtYWxvbmUgcXVhcnRlciBuYW1lc1xuICovXG5leHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfTEVUVEVSID0gZXhwb3J0cy5RVUFSVEVSX0xFVFRFUjtcbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9XT1JEID0gZXhwb3J0cy5RVUFSVEVSX1dPUkQ7XG5leHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfQUJCUkVWSUFUSU9OUyA9IGV4cG9ydHMuUVVBUlRFUl9BQkJSRVZJQVRJT05TLnNsaWNlKCk7XG5leHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMgPSBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcbmV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMgPSBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XG5leHBvcnRzLk1PTlRIX0xFVFRFUlMgPSBbXCJKXCIsIFwiRlwiLCBcIk1cIiwgXCJBXCIsIFwiTVwiLCBcIkpcIiwgXCJKXCIsIFwiQVwiLCBcIlNcIiwgXCJPXCIsIFwiTlwiLCBcIkRcIl07XG5leHBvcnRzLlNUQU5EX0FMT05FX0xPTkdfTU9OVEhfTkFNRVMgPSBleHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMuc2xpY2UoKTtcbmV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMgPSBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTLnNsaWNlKCk7XG5leHBvcnRzLlNUQU5EX0FMT05FX01PTlRIX0xFVFRFUlMgPSBleHBvcnRzLk1PTlRIX0xFVFRFUlMuc2xpY2UoKTtcbmV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTID0gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl07XG5leHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG5leHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMgPSBbXCJTdVwiLCBcIk1vXCIsIFwiVHVcIiwgXCJXZVwiLCBcIlRoXCIsIFwiRnJcIiwgXCJTYVwiXTtcbmV4cG9ydHMuV0VFS0RBWV9MRVRURVJTID0gW1wiU1wiLCBcIk1cIiwgXCJUXCIsIFwiV1wiLCBcIlRcIiwgXCJGXCIsIFwiU1wiXTtcbmV4cG9ydHMuREFZX1BFUklPRFNfQUJCUkVWSUFURUQgPSB7IGFtOiBcIkFNXCIsIHBtOiBcIlBNXCIsIG5vb246IFwibm9vblwiLCBtaWRuaWdodDogXCJtaWQuXCIgfTtcbmV4cG9ydHMuREFZX1BFUklPRFNfV0lERSA9IHsgYW06IFwiQU1cIiwgcG06IFwiUE1cIiwgbm9vbjogXCJub29uXCIsIG1pZG5pZ2h0OiBcIm1pZG5pZ2h0XCIgfTtcbmV4cG9ydHMuREFZX1BFUklPRFNfTkFSUk9XID0geyBhbTogXCJBXCIsIHBtOiBcIlBcIiwgbm9vbjogXCJub29uXCIsIG1pZG5pZ2h0OiBcIm1kXCIgfTtcbmV4cG9ydHMuREVGQVVMVF9MT0NBTEUgPSB7XG4gICAgZXJhTmFycm93OiBleHBvcnRzLkVSQV9OQU1FU19OQVJST1csXG4gICAgZXJhV2lkZTogZXhwb3J0cy5FUkFfTkFNRVNfV0lERSxcbiAgICBlcmFBYmJyZXZpYXRlZDogZXhwb3J0cy5FUkFfTkFNRVNfQUJCUkVWSUFURUQsXG4gICAgcXVhcnRlckxldHRlcjogZXhwb3J0cy5RVUFSVEVSX0xFVFRFUixcbiAgICBxdWFydGVyV29yZDogZXhwb3J0cy5RVUFSVEVSX1dPUkQsXG4gICAgcXVhcnRlckFiYnJldmlhdGlvbnM6IGV4cG9ydHMuUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxuICAgIHN0YW5kQWxvbmVRdWFydGVyTGV0dGVyOiBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfTEVUVEVSLFxuICAgIHN0YW5kQWxvbmVRdWFydGVyV29yZDogZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX1dPUkQsXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfQUJCUkVWSUFUSU9OUyxcbiAgICBsb25nTW9udGhOYW1lczogZXhwb3J0cy5MT05HX01PTlRIX05BTUVTLFxuICAgIHNob3J0TW9udGhOYW1lczogZXhwb3J0cy5TSE9SVF9NT05USF9OQU1FUyxcbiAgICBtb250aExldHRlcnM6IGV4cG9ydHMuTU9OVEhfTEVUVEVSUyxcbiAgICBzdGFuZEFsb25lTG9uZ01vbnRoTmFtZXM6IGV4cG9ydHMuU1RBTkRfQUxPTkVfTE9OR19NT05USF9OQU1FUyxcbiAgICBzdGFuZEFsb25lU2hvcnRNb250aE5hbWVzOiBleHBvcnRzLlNUQU5EX0FMT05FX1NIT1JUX01PTlRIX05BTUVTLFxuICAgIHN0YW5kQWxvbmVNb250aExldHRlcnM6IGV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyxcbiAgICBsb25nV2Vla2RheU5hbWVzOiBleHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyxcbiAgICBzaG9ydFdlZWtkYXlOYW1lczogZXhwb3J0cy5TSE9SVF9XRUVLREFZX05BTUVTLFxuICAgIHdlZWtkYXlUd29MZXR0ZXJzOiBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMsXG4gICAgd2Vla2RheUxldHRlcnM6IGV4cG9ydHMuV0VFS0RBWV9MRVRURVJTLFxuICAgIGRheVBlcmlvZEFiYnJldmlhdGVkOiBleHBvcnRzLkRBWV9QRVJJT0RTX0FCQlJFVklBVEVELFxuICAgIGRheVBlcmlvZFdpZGU6IGV4cG9ydHMuREFZX1BFUklPRFNfV0lERSxcbiAgICBkYXlQZXJpb2ROYXJyb3c6IGV4cG9ydHMuREFZX1BFUklPRFNfTkFSUk9XXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxlLmpzLm1hcCIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBNYXRoIHV0aWxpdHkgZnVuY3Rpb25zXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5wb3NpdGl2ZU1vZHVsbyA9IGV4cG9ydHMuZmlsdGVyRmxvYXQgPSBleHBvcnRzLnJvdW5kU3ltID0gZXhwb3J0cy5pc0ludCA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbi8qKlxuICogQHJldHVybiB0cnVlIGlmZiBnaXZlbiBhcmd1bWVudCBpcyBhbiBpbnRlZ2VyIG51bWJlclxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGlzSW50KG4pIHtcbiAgICBpZiAobiA9PT0gbnVsbCB8fCAhaXNGaW5pdGUobikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gKE1hdGguZmxvb3IobikgPT09IG4pO1xufVxuZXhwb3J0cy5pc0ludCA9IGlzSW50O1xuLyoqXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXG4gKiBSb3VuZHMgKzEuNSB0byArMlxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk4gaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIHJvdW5kU3ltKG4pIHtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0Zpbml0ZShuKSwgXCJBcmd1bWVudC5OXCIsIFwibiBtdXN0IGJlIGEgZmluaXRlIG51bWJlciBidXQgaXM6ICVkXCIsIG4pO1xuICAgIGlmIChuIDwgMCkge1xuICAgICAgICByZXR1cm4gLTEgKiBNYXRoLnJvdW5kKC0xICogbik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChuKTtcbiAgICB9XG59XG5leHBvcnRzLnJvdW5kU3ltID0gcm91bmRTeW07XG4vKipcbiAqIFN0cmljdGVyIHZhcmlhbnQgb2YgcGFyc2VGbG9hdCgpLlxuICogQHBhcmFtIHZhbHVlXHRJbnB1dCBzdHJpbmdcbiAqIEByZXR1cm4gdGhlIGZsb2F0IGlmIHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBmbG9hdCwgTmFOIG90aGVyd2lzZVxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGZpbHRlckZsb2F0KHZhbHVlKSB7XG4gICAgaWYgKC9eKFxcLXxcXCspPyhbMC05XSsoXFwuWzAtOV0rKT98SW5maW5pdHkpJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBOYU47XG59XG5leHBvcnRzLmZpbHRlckZsb2F0ID0gZmlsdGVyRmxvYXQ7XG4vKipcbiAqIE1vZHVsbyBmdW5jdGlvbiB0aGF0IG9ubHkgcmV0dXJucyBhIHBvc2l0aXZlIHJlc3VsdCwgaW4gY29udHJhc3QgdG8gdGhlICUgb3BlcmF0b3JcbiAqIEBwYXJhbSB2YWx1ZVxuICogQHBhcmFtIG1vZHVsb1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlZhbHVlIGlmIHZhbHVlIGlzIG5vdCBmaW5pdGVcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb2R1bG8gaWYgbW9kdWxvIGlzIG5vdCBhIGZpbml0ZSBudW1iZXIgPj0gMVxuICovXG5mdW5jdGlvbiBwb3NpdGl2ZU1vZHVsbyh2YWx1ZSwgbW9kdWxvKSB7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUodmFsdWUpLCBcIkFyZ3VtZW50LlZhbHVlXCIsIFwidmFsdWUgc2hvdWxkIGJlIGZpbml0ZVwiKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0Zpbml0ZShtb2R1bG8pICYmIG1vZHVsbyA+PSAxLCBcIkFyZ3VtZW50Lk1vZHVsb1wiLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcbiAgICBpZiAodmFsdWUgPCAwKSB7XG4gICAgICAgIHJldHVybiAoKHZhbHVlICUgbW9kdWxvKSArIG1vZHVsbykgJSBtb2R1bG87XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWUgJSBtb2R1bG87XG4gICAgfVxufVxuZXhwb3J0cy5wb3NpdGl2ZU1vZHVsbyA9IHBvc2l0aXZlTW9kdWxvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXG4gKi9cbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnBhcnNlID0gZXhwb3J0cy5wYXJzZWFibGUgPSB2b2lkIDA7XG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xudmFyIGxvY2FsZV8xID0gcmVxdWlyZShcIi4vbG9jYWxlXCIpO1xudmFyIG1hdGhfMSA9IHJlcXVpcmUoXCIuL21hdGhcIik7XG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcbi8qKlxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gZGF0ZXRpbWUgc3RyaW5nIGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZm9ybWF0XG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIExETUwgZm9ybWF0IHN0cmluZyAoc2VlIExETUwubWQpXG4gKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBzdHJpbmcgYWZ0ZXIgdGhlIGRhdGUrdGltZVxuICogQHBhcmFtIGxvY2FsZSBMb2NhbGUtc3BlY2lmaWMgY29uc3RhbnRzIHN1Y2ggYXMgbW9udGggbmFtZXNcbiAqIEByZXR1cm5zIHRydWUgaWZmIHRoZSBzdHJpbmcgaXMgdmFsaWRcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBwYXJzZWFibGUoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgYWxsb3dUcmFpbGluZywgbG9jYWxlKSB7XG4gICAgaWYgKGFsbG93VHJhaWxpbmcgPT09IHZvaWQgMCkgeyBhbGxvd1RyYWlsaW5nID0gdHJ1ZTsgfVxuICAgIGlmIChsb2NhbGUgPT09IHZvaWQgMCkgeyBsb2NhbGUgPSB7fTsgfVxuICAgIHRyeSB7XG4gICAgICAgIHBhcnNlKGRhdGVUaW1lU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHVuZGVmaW5lZCwgYWxsb3dUcmFpbGluZywgbG9jYWxlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5leHBvcnRzLnBhcnNlYWJsZSA9IHBhcnNlYWJsZTtcbi8qKlxuICogUGFyc2UgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIGFzc3VtaW5nIHRoZSBnaXZlbiBmb3JtYXQuXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lU3RyaW5nIFRoZSBzdHJpbmcgdG8gcGFyc2VcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcbiAqIEBwYXJhbSBvdmVycmlkZVpvbmUgVXNlIHRoaXMgem9uZSBpbiB0aGUgcmVzdWx0XG4gKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBjaGFyYWN0ZXJzIGluIHRoZSBzb3VyY2Ugc3RyaW5nXG4gKiBAcGFyYW0gbG9jYWxlIExvY2FsZS1zcGVjaWZpYyBjb25zdGFudHMgc3VjaCBhcyBtb250aCBuYW1lc1xuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yIGlmIHRoZSBnaXZlbiBkYXRlVGltZVN0cmluZyBpcyB3cm9uZyBvciBub3QgYWNjb3JkaW5nIHRvIHRoZSBwYXR0ZXJuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGlmIHRoZSBnaXZlbiBmb3JtYXQgc3RyaW5nIGlzIGludmFsaWRcbiAqL1xuZnVuY3Rpb24gcGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgb3ZlcnJpZGVab25lLCBhbGxvd1RyYWlsaW5nLCBsb2NhbGUpIHtcbiAgICB2YXIgX2E7XG4gICAgaWYgKGFsbG93VHJhaWxpbmcgPT09IHZvaWQgMCkgeyBhbGxvd1RyYWlsaW5nID0gdHJ1ZTsgfVxuICAgIGlmIChsb2NhbGUgPT09IHZvaWQgMCkgeyBsb2NhbGUgPSB7fTsgfVxuICAgIGlmICghZGF0ZVRpbWVTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJubyBkYXRlIGdpdmVuXCIpO1xuICAgIH1cbiAgICBpZiAoIWZvcm1hdFN0cmluZykge1xuICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwibm8gZm9ybWF0IGdpdmVuXCIpO1xuICAgIH1cbiAgICB2YXIgbWVyZ2VkTG9jYWxlID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGxvY2FsZV8xLkRFRkFVTFRfTE9DQUxFKSwgbG9jYWxlKTtcbiAgICB2YXIgeWVhckN1dG9mZiA9IG1hdGhfMS5wb3NpdGl2ZU1vZHVsbygobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgNTApLCAxMDApO1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0b2tlbl8xLnRva2VuaXplKGZvcm1hdFN0cmluZyk7XG4gICAgICAgIHZhciB0aW1lID0geyB5ZWFyOiB1bmRlZmluZWQgfTtcbiAgICAgICAgdmFyIHpvbmUgPSB2b2lkIDA7XG4gICAgICAgIHZhciBwbnIgPSB2b2lkIDA7XG4gICAgICAgIHZhciBwenIgPSB2b2lkIDA7XG4gICAgICAgIHZhciBkcHIgPSB2b2lkIDA7XG4gICAgICAgIHZhciBlcmEgPSAxO1xuICAgICAgICB2YXIgcXVhcnRlciA9IHZvaWQgMDtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IGRhdGVUaW1lU3RyaW5nO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHRva2Vuc18xID0gdG9rZW5zOyBfaSA8IHRva2Vuc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHRva2VuID0gdG9rZW5zXzFbX2ldO1xuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5FUkE6XG4gICAgICAgICAgICAgICAgICAgIF9hID0gc3RyaXBFcmEodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKSwgZXJhID0gX2FbMF0sIHJlbWFpbmluZyA9IF9hWzFdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlFVQVJURVI6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByID0gc3RyaXBRdWFydGVyKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWFydGVyID0gci5uO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5XRUVLREFZOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBzdHJpcFdlZWtEYXkodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLldFRUs6XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMikucmVtYWluaW5nO1xuICAgICAgICAgICAgICAgICAgICBicmVhazsgLy8gbm90aGluZyB0byBsZWFybiBmcm9tIHRoaXNcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWVBFUklPRDpcbiAgICAgICAgICAgICAgICAgICAgZHByID0gc3RyaXBEYXlQZXJpb2QodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gZHByLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5ZRUFSOlxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIEluZmluaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBuci5uID4geWVhckN1dG9mZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IDE5MDAgKyBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IDIwMDAgKyBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IHBuci5uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuTU9OVEg6XG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTW9udGgodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IHBuci5uO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWTpcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgdGltZS5kYXkgPSBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5IT1VSOlxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcEhvdXIodG9rZW4sIHJlbWFpbmluZyk7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IHBuci5uO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLk1JTlVURTpcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5TRUNPTkQ6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwU2Vjb25kKHRva2VuLCByZW1haW5pbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5zZWNvbmQgPSBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDEwMDAgKiBwYXJzZUZsb2F0KFwiMC5cIiArIE1hdGguZmxvb3IocG5yLm4pLnRvU3RyaW5nKDEwKS5zbGljZSgwLCAzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IE1hdGguZmxvb3IoKHBuci5uIC8gMzYwMEUzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gTWF0aC5mbG9vcihtYXRoXzEucG9zaXRpdmVNb2R1bG8ocG5yLm4gLyA2MEUzLCA2MCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IE1hdGguZmxvb3IobWF0aF8xLnBvc2l0aXZlTW9kdWxvKHBuci5uIC8gMTAwMCwgNjApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IG1hdGhfMS5wb3NpdGl2ZU1vZHVsbyhwbnIubiwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJ1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICdcIiArIHRva2VuLnJhdyArIFwiJ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlpPTkU6XG4gICAgICAgICAgICAgICAgICAgIHB6ciA9IHN0cmlwWm9uZSh0b2tlbiwgcmVtYWluaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcHpyLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgem9uZSA9IHB6ci56b25lO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5JREVOVElUWTpcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZHByKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGRwci50eXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImFtXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgIT09IHVuZGVmaW5lZCAmJiB0aW1lLmhvdXIgPj0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciAtPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicG1cIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciAhPT0gdW5kZWZpbmVkICYmIHRpbWUuaG91ciA8IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgKz0gMTI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm5vb25cIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gdW5kZWZpbmVkIHx8IHRpbWUuaG91ciA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMTI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWludXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5zZWNvbmQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLm1pbGxpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgIT09IDEyIHx8IHRpbWUubWludXRlICE9PSAwIHx8IHRpbWUuc2Vjb25kICE9PSAwIHx8IHRpbWUubWlsbGkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCB0aW1lLCBjb250YWlucyAnbm9vbicgc3BlY2lmaWVyIGJ1dCB0aW1lIGRpZmZlcnMgZnJvbSBub29uXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtaWRuaWdodFwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyID09PSB1bmRlZmluZWQgfHwgdGltZS5ob3VyID09PSAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyID09PSAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5taW51dGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLnNlY29uZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWlsbGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciAhPT0gMCB8fCB0aW1lLm1pbnV0ZSAhPT0gMCB8fCB0aW1lLnNlY29uZCAhPT0gMCB8fCB0aW1lLm1pbGxpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgdGltZSwgY29udGFpbnMgJ21pZG5pZ2h0JyBzcGVjaWZpZXIgYnV0IHRpbWUgZGlmZmVycyBmcm9tIG1pZG5pZ2h0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lLnllYXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGltZS55ZWFyICo9IGVyYTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocXVhcnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodGltZS5tb250aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChxdWFydGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSA3O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSAxMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBlcnJvcl8yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChxdWFydGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gMSAmJiB0aW1lLm1vbnRoIDw9IDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gNCAmJiB0aW1lLm1vbnRoIDw9IDYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gNyAmJiB0aW1lLm1vbnRoIDw9IDkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gMTAgJiYgdGltZS5tb250aCA8PSAxMik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yXzIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJ0aGUgcXVhcnRlciBkb2VzIG5vdCBtYXRjaCB0aGUgbW9udGhcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lLnllYXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGltZS55ZWFyID0gMTk3MDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0geyB0aW1lOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0aW1lKSwgem9uZTogem9uZSB9O1xuICAgICAgICBpZiAoIXJlc3VsdC50aW1lLnZhbGlkYXRlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCByZXN1bHRpbmcgZGF0ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhbHdheXMgb3ZlcndyaXRlIHpvbmUgd2l0aCBnaXZlbiB6b25lXG4gICAgICAgIGlmIChvdmVycmlkZVpvbmUpIHtcbiAgICAgICAgICAgIHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZW1haW5pbmcgJiYgIWFsbG93VHJhaWxpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCBkYXRlICdcIiArIGRhdGVUaW1lU3RyaW5nICsgXCInIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICdcIiArIGZvcm1hdFN0cmluZyArIFwiJzogdHJhaWxpbmcgY2hhcmFjdGVyczogJ1wiICsgcmVtYWluaW5nICsgXCInXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCBkYXRlICdcIiArIGRhdGVUaW1lU3RyaW5nICsgXCInIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICdcIiArIGZvcm1hdFN0cmluZyArIFwiJzogXCIgKyBlLm1lc3NhZ2UpO1xuICAgIH1cbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbnZhciBXSElURVNQQUNFID0gW1wiIFwiLCBcIlxcdFwiLCBcIlxcclwiLCBcIlxcdlwiLCBcIlxcblwiXTtcbi8qKlxuICpcbiAqIEBwYXJhbSB0b2tlblxuICogQHBhcmFtIHNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RJbXBsZW1lbnRlZCBpZiBhIHBhdHRlcm4gaXMgdXNlZCB0aGF0IGlzbid0IGltcGxlbWVudGVkIHlldCAoeiwgWiwgdiwgViwgeCwgWClcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgbm90IHBhcnNlYWJsZVxuICovXG5mdW5jdGlvbiBzdHJpcFpvbmUodG9rZW4sIHMpIHtcbiAgICB2YXIgdW5zdXBwb3J0ZWQgPSAodG9rZW4uc3ltYm9sID09PSBcInpcIilcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA1KVxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcInZcIilcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJWXCIgJiYgdG9rZW4ubGVuZ3RoICE9PSAyKVxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcInhcIiAmJiB0b2tlbi5sZW5ndGggPj0gNClcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgdG9rZW4ubGVuZ3RoID49IDQpO1xuICAgIGlmICh1bnN1cHBvcnRlZCkge1xuICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiTm90SW1wbGVtZW50ZWRcIiwgXCJ0aW1lIHpvbmUgcGF0dGVybiAnXCIgKyB0b2tlbi5yYXcgKyBcIicgaXMgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICByZW1haW5pbmc6IHNcbiAgICB9O1xuICAgIC8vIGNob3Agb2ZmIFwiR01UXCIgcHJlZml4IGlmIG5lZWRlZFxuICAgIHZhciBoYWRHTVQgPSBmYWxzZTtcbiAgICBpZiAoKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA0KSB8fCB0b2tlbi5zeW1ib2wgPT09IFwiT1wiKSB7XG4gICAgICAgIGlmIChyZXN1bHQucmVtYWluaW5nLnRvVXBwZXJDYXNlKCkuc3RhcnRzV2l0aChcIkdNVFwiKSkge1xuICAgICAgICAgICAgcmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc2xpY2UoMyk7XG4gICAgICAgICAgICBoYWRHTVQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIHBhcnNlIGFueSB6b25lLCByZWdhcmRsZXNzIG9mIHNwZWNpZmllZCBmb3JtYXRcbiAgICB2YXIgem9uZVN0cmluZyA9IFwiXCI7XG4gICAgd2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiBXSElURVNQQUNFLmluZGV4T2YocmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkpID09PSAtMSkge1xuICAgICAgICB6b25lU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xuICAgICAgICByZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XG4gICAgfVxuICAgIHpvbmVTdHJpbmcgPSB6b25lU3RyaW5nLnRyaW0oKTtcbiAgICBpZiAoem9uZVN0cmluZykge1xuICAgICAgICAvLyBlbnN1cmUgY2hvcHBpbmcgb2ZmIEdNVCBkb2VzIG5vdCBoaWRlIHRpbWUgem9uZSBlcnJvcnMgKGJpdCBvZiBhIHNsb3BweSByZWdleCBidXQgT0spXG4gICAgICAgIGlmIChoYWRHTVQgJiYgIXpvbmVTdHJpbmcubWF0Y2goL1tcXCtcXC1dP1tcXGRcXDpdKy9pKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIHRpbWUgem9uZSAnR01UXCIgKyB6b25lU3RyaW5nICsgXCInXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQuem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUuem9uZSh6b25lU3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGVycm9yXzEuZXJyb3JJcyhlLCBbXCJBcmd1bWVudC5TXCIsIFwiTm90Rm91bmQuWm9uZVwiXSkpIHtcbiAgICAgICAgICAgICAgICBlID0gZXJyb3JfMS5lcnJvcihcIlBhcnNlRXJyb3JcIiwgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwibm8gdGltZSB6b25lIGdpdmVuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHNcbiAqIEBwYXJhbSBleHBlY3RlZFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcbiAqL1xuZnVuY3Rpb24gc3RyaXBSYXcocywgZXhwZWN0ZWQpIHtcbiAgICB2YXIgcmVtYWluaW5nID0gcztcbiAgICB2YXIgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xuICAgIHdoaWxlIChyZW1haW5pbmcubGVuZ3RoID4gMCAmJiBlcmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nLmNoYXJBdCgwKSA9PT0gZXJlbWFpbmluZy5jaGFyQXQoMCkpIHtcbiAgICAgICAgcmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcbiAgICAgICAgZXJlbWFpbmluZyA9IGVyZW1haW5pbmcuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBpZiAoZXJlbWFpbmluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwiZXhwZWN0ZWQgJ1wiICsgZXhwZWN0ZWQgKyBcIidcIik7XG4gICAgfVxuICAgIHJldHVybiByZW1haW5pbmc7XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gdG9rZW5cbiAqIEBwYXJhbSByZW1haW5pbmdcbiAqIEBwYXJhbSBsb2NhbGVcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKi9cbmZ1bmN0aW9uIHN0cmlwRGF5UGVyaW9kKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xuICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mO1xuICAgIHZhciBvZmZzZXRzO1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJhXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfYSA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX2FbbG9jYWxlLmRheVBlcmlvZFdpZGUuYW1dID0gXCJhbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2FbbG9jYWxlLmRheVBlcmlvZFdpZGUucG1dID0gXCJwbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2EpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2IgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW1dID0gXCJhbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2JbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbV0gPSBcInBtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfYik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2MgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbV0gPSBcImFtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfY1tsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG1dID0gXCJwbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2MpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2QgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLmFtXSA9IFwiYW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLm1pZG5pZ2h0XSA9IFwibWlkbmlnaHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLnBtXSA9IFwicG1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLm5vb25dID0gXCJub29uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfZSA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX2VbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbV0gPSBcImFtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZVtsb2NhbGUuZGF5UGVyaW9kTmFycm93Lm1pZG5pZ2h0XSA9IFwibWlkbmlnaHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cucG1dID0gXCJwbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2VbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5ub29uXSA9IFwibm9vblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9mID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBfZltsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW1dID0gXCJhbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm1pZG5pZ2h0XSA9IFwibWlkbmlnaHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbV0gPSBcInBtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZltsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubm9vbl0gPSBcIm5vb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gbWF0Y2ggbG9uZ2VzdCBwb3NzaWJsZSBkYXkgcGVyaW9kIHN0cmluZzsgc29ydCBrZXlzIGJ5IGxlbmd0aCBkZXNjZW5kaW5nXG4gICAgdmFyIHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyhvZmZzZXRzKVxuICAgICAgICAuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gKGEubGVuZ3RoIDwgYi5sZW5ndGggPyAxIDogYS5sZW5ndGggPiBiLmxlbmd0aCA/IC0xIDogMCk7IH0pO1xuICAgIHZhciB1cHBlciA9IHJlbWFpbmluZy50b1VwcGVyQ2FzZSgpO1xuICAgIGZvciAodmFyIF9pID0gMCwgc29ydGVkS2V5c18xID0gc29ydGVkS2V5czsgX2kgPCBzb3J0ZWRLZXlzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBzb3J0ZWRLZXlzXzFbX2ldO1xuICAgICAgICBpZiAodXBwZXIuc3RhcnRzV2l0aChrZXkudG9VcHBlckNhc2UoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogb2Zmc2V0c1trZXldLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZzogcmVtYWluaW5nLnNsaWNlKGtleS5sZW5ndGgpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJQYXJzZUVycm9yXCIsIFwibWlzc2luZyBkYXkgcGVyaW9kIGkuZS4gXCIgKyBPYmplY3Qua2V5cyhvZmZzZXRzKS5qb2luKFwiLCBcIikpO1xufVxuLyoqXG4gKiBSZXR1cm5zIGZhY3RvciAtMSBvciAxIGRlcGVuZGluZyBvbiBCQyBvciBBRFxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAcGFyYW0gbG9jYWxlXG4gKiBAcmV0dXJucyBbZmFjdG9yLCByZW1haW5pbmddXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxuICovXG5mdW5jdGlvbiBzdHJpcEVyYSh0b2tlbiwgcmVtYWluaW5nLCBsb2NhbGUpIHtcbiAgICB2YXIgYWxsb3dlZDtcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLmVyYVdpZGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5lcmFOYXJyb3c7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuZXJhQWJicmV2aWF0ZWQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcbiAgICByZXR1cm4gW2FsbG93ZWQuaW5kZXhPZihyZXN1bHQuY2hvc2VuKSA9PT0gMCA/IDEgOiAtMSwgcmVzdWx0LnJlbWFpbmluZ107XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gdG9rZW5cbiAqIEBwYXJhbSByZW1haW5pbmdcbiAqIEBwYXJhbSBsb2NhbGVcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHN0cmlwUXVhcnRlcih0b2tlbiwgcmVtYWluaW5nLCBsb2NhbGUpIHtcbiAgICB2YXIgcXVhcnRlckxldHRlcjtcbiAgICB2YXIgcXVhcnRlcldvcmQ7XG4gICAgdmFyIHF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICBxdWFydGVyTGV0dGVyID0gbG9jYWxlLnF1YXJ0ZXJMZXR0ZXI7XG4gICAgICAgICAgICBxdWFydGVyV29yZCA9IGxvY2FsZS5xdWFydGVyV29yZDtcbiAgICAgICAgICAgIHF1YXJ0ZXJBYmJyZXZpYXRpb25zID0gbG9jYWxlLnF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJxXCI6IHtcbiAgICAgICAgICAgIHF1YXJ0ZXJMZXR0ZXIgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI7XG4gICAgICAgICAgICBxdWFydGVyV29yZCA9IGxvY2FsZS5zdGFuZEFsb25lUXVhcnRlcldvcmQ7XG4gICAgICAgICAgICBxdWFydGVyQWJicmV2aWF0aW9ucyA9IGxvY2FsZS5zdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcbiAgICB9XG4gICAgdmFyIGFsbG93ZWQ7XG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAxKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBbMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uIChuKSB7IHJldHVybiBxdWFydGVyTGV0dGVyICsgbi50b1N0cmluZygxMCk7IH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBxdWFydGVyQWJicmV2aWF0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEgKyBcIiBcIiArIHF1YXJ0ZXJXb3JkOyB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcbiAgICB9XG4gICAgdmFyIHIgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XG4gICAgcmV0dXJuIHsgbjogYWxsb3dlZC5pbmRleE9mKHIuY2hvc2VuKSArIDEsIHJlbWFpbmluZzogci5yZW1haW5pbmcgfTtcbn1cbi8qKlxuICpcbiAqIEBwYXJhbSB0b2tlblxuICogQHBhcmFtIHJlbWFpbmluZ1xuICogQHBhcmFtIGxvY2FsZVxuICogQHJldHVybnMgcmVtYWluaW5nIHN0cmluZ1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gb3JtYXRTdHJpbmdcbiAqL1xuZnVuY3Rpb24gc3RyaXBXZWVrRGF5KHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xuICAgIHZhciBhbGxvd2VkO1xuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAxKS5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMikucmVtYWluaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lcztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLmxvbmdXZWVrZGF5TmFtZXM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS53ZWVrZGF5TGV0dGVycztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLndlZWtkYXlUd29MZXR0ZXJzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xuICAgIH1cbiAgICB2YXIgciA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcbiAgICByZXR1cm4gci5yZW1haW5pbmc7XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gdG9rZW5cbiAqIEBwYXJhbSByZW1haW5pbmdcbiAqIEBwYXJhbSBsb2NhbGVcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHN0cmlwTW9udGgodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XG4gICAgdmFyIHNob3J0TW9udGhOYW1lcztcbiAgICB2YXIgbG9uZ01vbnRoTmFtZXM7XG4gICAgdmFyIG1vbnRoTGV0dGVycztcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwiTVwiOlxuICAgICAgICAgICAgc2hvcnRNb250aE5hbWVzID0gbG9jYWxlLnNob3J0TW9udGhOYW1lcztcbiAgICAgICAgICAgIGxvbmdNb250aE5hbWVzID0gbG9jYWxlLmxvbmdNb250aE5hbWVzO1xuICAgICAgICAgICAgbW9udGhMZXR0ZXJzID0gbG9jYWxlLm1vbnRoTGV0dGVycztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiTFwiOlxuICAgICAgICAgICAgc2hvcnRNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM7XG4gICAgICAgICAgICBsb25nTW9udGhOYW1lcyA9IGxvY2FsZS5zdGFuZEFsb25lTG9uZ01vbnRoTmFtZXM7XG4gICAgICAgICAgICBtb250aExldHRlcnMgPSBsb2NhbGUuc3RhbmRBbG9uZU1vbnRoTGV0dGVycztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIG1vbnRoIHBhdHRlcm5cIik7XG4gICAgfVxuICAgIHZhciBhbGxvd2VkO1xuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBzaG9ydE1vbnRoTmFtZXM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvbmdNb250aE5hbWVzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBtb250aExldHRlcnM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xuICAgIH1cbiAgICB2YXIgciA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcbiAgICByZXR1cm4geyBuOiBhbGxvd2VkLmluZGV4T2Yoci5jaG9zZW4pICsgMSwgcmVtYWluaW5nOiByLnJlbWFpbmluZyB9O1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxuICovXG5mdW5jdGlvbiBzdHJpcEhvdXIodG9rZW4sIHJlbWFpbmluZykge1xuICAgIHZhciByZXN1bHQgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJoXCI6XG4gICAgICAgICAgICBpZiAocmVzdWx0Lm4gPT09IDEyKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm4gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJIXCI6XG4gICAgICAgICAgICAvLyBub3RoaW5nLCBpbiByYW5nZSAwLTIzXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIktcIjpcbiAgICAgICAgICAgIC8vIG5vdGhpbmcsIGluIHJhbmdlIDAtMTFcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwia1wiOlxuICAgICAgICAgICAgcmVzdWx0Lm4gLT0gMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xuICovXG5mdW5jdGlvbiBzdHJpcFNlY29uZCh0b2tlbiwgcmVtYWluaW5nKSB7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcInNcIjpcbiAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xuICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgdG9rZW4ubGVuZ3RoKTtcbiAgICAgICAgY2FzZSBcIkFcIjpcbiAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDgpO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHNlY29uZHMgcGF0dGVyblwiKTtcbiAgICB9XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gc1xuICogQHBhcmFtIG1heExlbmd0aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcbiAqL1xuZnVuY3Rpb24gc3RyaXBOdW1iZXIocywgbWF4TGVuZ3RoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgbjogTmFOLFxuICAgICAgICByZW1haW5pbmc6IHNcbiAgICB9O1xuICAgIHZhciBudW1iZXJTdHJpbmcgPSBcIlwiO1xuICAgIHdoaWxlIChudW1iZXJTdHJpbmcubGVuZ3RoIDwgbWF4TGVuZ3RoICYmIHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcbiAgICAgICAgbnVtYmVyU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xuICAgICAgICByZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XG4gICAgfVxuICAgIC8vIHJlbW92ZSBsZWFkaW5nIHplcm9lc1xuICAgIHdoaWxlIChudW1iZXJTdHJpbmcuY2hhckF0KDApID09PSBcIjBcIiAmJiBudW1iZXJTdHJpbmcubGVuZ3RoID4gMSkge1xuICAgICAgICBudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xuICAgIH1cbiAgICByZXN1bHQubiA9IHBhcnNlSW50KG51bWJlclN0cmluZywgMTApO1xuICAgIGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIU51bWJlci5pc0Zpbml0ZShyZXN1bHQubikpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIlBhcnNlRXJyb3JcIiwgXCJleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICdcIiArIG51bWJlclN0cmluZyArIFwiJ1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICpcbiAqIEBwYXJhbSB0b2tlblxuICogQHBhcmFtIHJlbWFpbmluZ1xuICogQHBhcmFtIGFsbG93ZWRcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKi9cbmZ1bmN0aW9uIHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKSB7XG4gICAgLy8gbWF0Y2ggbG9uZ2VzdCBwb3NzaWJsZSBzdHJpbmc7IHNvcnQga2V5cyBieSBsZW5ndGggZGVzY2VuZGluZ1xuICAgIHZhciBzb3J0ZWRLZXlzID0gYWxsb3dlZC5zbGljZSgpXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiAoYS5sZW5ndGggPCBiLmxlbmd0aCA/IDEgOiBhLmxlbmd0aCA+IGIubGVuZ3RoID8gLTEgOiAwKTsgfSk7XG4gICAgdmFyIHVwcGVyID0gcmVtYWluaW5nLnRvVXBwZXJDYXNlKCk7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBzb3J0ZWRLZXlzXzIgPSBzb3J0ZWRLZXlzOyBfaSA8IHNvcnRlZEtleXNfMi5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHNvcnRlZEtleXNfMltfaV07XG4gICAgICAgIGlmICh1cHBlci5zdGFydHNXaXRoKGtleS50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjaG9zZW46IGtleSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmc6IHJlbWFpbmluZy5zbGljZShrZXkubGVuZ3RoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgXCIgKyB0b2tlbl8xLlRva2VuVHlwZVt0b2tlbi50eXBlXS50b0xvd2VyQ2FzZSgpICsgXCIsIGV4cGVjdGVkIG9uZSBvZiBcIiArIGFsbG93ZWQuam9pbihcIiwgXCIpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnNlLmpzLm1hcCIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBQZXJpb2RpYyBpbnRlcnZhbCBmdW5jdGlvbnNcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnRpbWVzdGFtcE9uV2Vla1RpbWVMZXNzVGhhbiA9IGV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvID0gZXhwb3J0cy5pc1BlcmlvZCA9IGV4cG9ydHMuaXNWYWxpZFBlcmlvZEpzb24gPSBleHBvcnRzLlBlcmlvZCA9IGV4cG9ydHMucGVyaW9kRHN0VG9TdHJpbmcgPSBleHBvcnRzLlBlcmlvZERzdCA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZGF0ZXRpbWVfMSA9IHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpO1xudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XG52YXIgdGltZXpvbmVfMSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xuLyoqXG4gKiBTcGVjaWZpZXMgaG93IHRoZSBwZXJpb2Qgc2hvdWxkIHJlcGVhdCBhY3Jvc3MgdGhlIGRheVxuICogZHVyaW5nIERTVCBjaGFuZ2VzLlxuICovXG52YXIgUGVyaW9kRHN0O1xuKGZ1bmN0aW9uIChQZXJpb2REc3QpIHtcbiAgICAvKipcbiAgICAgKiBLZWVwIHJlcGVhdGluZyBpbiBzaW1pbGFyIGludGVydmFscyBtZWFzdXJlZCBpbiBVVEMsXG4gICAgICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cbiAgICAgKiBFLmcuIGEgcmVwZXRpdGlvbiBvZiBvbmUgaG91ciB3aWxsIHRha2Ugb25lIHJlYWwgaG91clxuICAgICAqIGV2ZXJ5IHRpbWUsIGV2ZW4gaW4gYSB0aW1lIHpvbmUgd2l0aCBEU1QuXG4gICAgICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxuICAgICAqIGRpZmZlcmVuY2VzIHdpbGwgc3RpbGwgbWFrZSB0aGUgaW50ZXJ2YWxzIGRpZmZlcmVudC5cbiAgICAgKi9cbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiUmVndWxhckludGVydmFsc1wiXSA9IDBdID0gXCJSZWd1bGFySW50ZXJ2YWxzXCI7XG4gICAgLyoqXG4gICAgICogRW5zdXJlIHRoYXQgdGhlIHRpbWUgYXQgd2hpY2ggdGhlIGludGVydmFscyBvY2N1ciBzdGF5XG4gICAgICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxuICAgICAqIGEgcGVyaW9kIG9mIG9uZSBkYXksIHJlZmVyZW5jZWluZyBhdCA4OjA1QU0gRXVyb3BlL0Ftc3RlcmRhbSB0aW1lXG4gICAgICogd2lsbCBhbHdheXMgcmVmZXJlbmNlIGF0IDg6MDUgRXVyb3BlL0Ftc3RlcmRhbS4gVGhpcyBtZWFucyB0aGF0XG4gICAgICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcbiAgICAgKiAyMyBob3VycyBkdXJpbmcgRFNUIGNoYW5nZXMuXG4gICAgICogQW5vdGhlciBleGFtcGxlOiBhbiBob3VybHkgaW50ZXJ2YWwgd2lsbCBiZSBob3VybHkgaW4gbG9jYWwgdGltZSxcbiAgICAgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxuICAgICAqL1xuICAgIFBlcmlvZERzdFtQZXJpb2REc3RbXCJSZWd1bGFyTG9jYWxUaW1lXCJdID0gMV0gPSBcIlJlZ3VsYXJMb2NhbFRpbWVcIjtcbiAgICAvKipcbiAgICAgKiBFbmQtb2YtZW51bSBtYXJrZXJcbiAgICAgKi9cbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiTUFYXCJdID0gMl0gPSBcIk1BWFwiO1xufSkoUGVyaW9kRHN0ID0gZXhwb3J0cy5QZXJpb2REc3QgfHwgKGV4cG9ydHMuUGVyaW9kRHN0ID0ge30pKTtcbi8qKlxuICogQ29udmVydCBhIFBlcmlvZERzdCB0byBhIHN0cmluZzogXCJyZWd1bGFyIGludGVydmFsc1wiIG9yIFwicmVndWxhciBsb2NhbCB0aW1lXCJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5QIGZvciBpbnZhbGlkIFBlcmlvZERzdCB2YWx1ZVxuICovXG5mdW5jdGlvbiBwZXJpb2REc3RUb1N0cmluZyhwKSB7XG4gICAgc3dpdGNoIChwKSB7XG4gICAgICAgIGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM6IHJldHVybiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCI7XG4gICAgICAgIGNhc2UgUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU6IHJldHVybiBcInJlZ3VsYXIgbG9jYWwgdGltZVwiO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5QXCIsIFwiaW52YWxpZCBQZXJpb0RzdCB2YWx1ZSAlZFwiLCBwKTtcbiAgICB9XG59XG5leHBvcnRzLnBlcmlvZERzdFRvU3RyaW5nID0gcGVyaW9kRHN0VG9TdHJpbmc7XG4vKipcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcbiAqIGEgdGltZSBsZW5ndGguIFRoaXMgY2xhc3MgYWNjb3VudHMgZm9yIGxlYXAgc2Vjb25kcyBhbmQgbGVhcCBkYXlzLlxuICovXG52YXIgUGVyaW9kID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLiBTZWUgb3RoZXIgY29uc3RydWN0b3JzIGZvciBleHBsYW5hdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBQZXJpb2QoYSwgYW1vdW50T3JJbnRlcnZhbCwgdW5pdE9yRHN0LCBnaXZlbkRzdCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMua2luZCA9IFwiUGVyaW9kXCI7XG4gICAgICAgIHZhciByZWZlcmVuY2U7XG4gICAgICAgIHZhciBpbnRlcnZhbDtcbiAgICAgICAgdmFyIGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xuICAgICAgICBpZiAoZGF0ZXRpbWVfMS5pc0RhdGVUaW1lKGEpKSB7XG4gICAgICAgICAgICByZWZlcmVuY2UgPSBhO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiAoYW1vdW50T3JJbnRlcnZhbCkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgZHN0ID0gdW5pdE9yRHN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IGJhc2ljc18xLlRpbWVVbml0Lk1BWCwgXCJBcmd1bWVudC5Vbml0XCIsIFwiSW52YWxpZCB1bml0XCIpO1xuICAgICAgICAgICAgICAgIGludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oYW1vdW50T3JJbnRlcnZhbCwgdW5pdE9yRHN0KTtcbiAgICAgICAgICAgICAgICBkc3QgPSBnaXZlbkRzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgZHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGEucmVmZXJlbmNlKTtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGEuZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIGRzdCA9IGEucGVyaW9kRHN0ID09PSBcInJlZ3VsYXJcIiA/IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIDogUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Kc29uXCIsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZHN0ID49IDAgJiYgZHN0IDwgUGVyaW9kRHN0Lk1BWCwgXCJBcmd1bWVudC5Ec3RcIiwgXCJJbnZhbGlkIFBlcmlvZERzdCBzZXR0aW5nXCIpO1xuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGludGVydmFsLmFtb3VudCgpID4gMCwgXCJBcmd1bWVudC5JbnRlcnZhbFwiLCBcIkFtb3VudCBtdXN0IGJlIHBvc2l0aXZlIG5vbi16ZXJvLlwiKTtcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNJbnRlZ2VyKGludGVydmFsLmFtb3VudCgpKSwgXCJBcmd1bWVudC5JbnRlcnZhbFwiLCBcIkFtb3VudCBtdXN0IGJlIGEgd2hvbGUgbnVtYmVyXCIpO1xuICAgICAgICB0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG4gICAgICAgIHRoaXMuX2ludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcbiAgICAgICAgdGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XG4gICAgICAgIC8vIHJlZ3VsYXIgbG9jYWwgdGltZSBrZWVwaW5nIGlzIG9ubHkgc3VwcG9ydGVkIGlmIHdlIGNhbiByZXNldCBlYWNoIGRheVxuICAgICAgICAvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXG4gICAgICAgIC8vIHRoZSBpbnB1dCBpcyBhIG11bHRpcGxlIG9mIG9uZSBkYXkuXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpICYmIGRzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwMDAwLCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA4NjQwMCwgXCJBcmd1bWVudC5JbnRlcnZhbC5Ob3RJbXBsZW1lbnRlZFwiLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCwgXCJBcmd1bWVudC5JbnRlcnZhbC5Ob3RJbXBsZW1lbnRlZFwiLCBcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDI0LCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSByZWZlcmVuY2UgZGF0ZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUucmVmZXJlbmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgaW50ZXJ2YWxcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmludGVydmFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5hbW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB1bml0IG9mIHRoZSBpbnRlcnZhbFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cbiAgICAgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XG4gICAgICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxuICAgICAqIEByZXR1cm4gdGhlIGZpcnN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBhZnRlciBmcm9tRGF0ZSwgZ2l2ZW4gaW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBmcm9tZGF0ZSBhbmQgdGhlIHJlZmVyZW5jZSBkYXRlIGFyZSBib3RoIGF3YXJlIG9yIHVuYXdhcmUgb2YgdGltZSB6b25lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoZnJvbURhdGUpIHtcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhZnJvbURhdGUuem9uZSgpLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XG4gICAgICAgIHZhciBhcHByb3g7XG4gICAgICAgIHZhciBhcHByb3gyO1xuICAgICAgICB2YXIgYXBwcm94TWluO1xuICAgICAgICB2YXIgcGVyaW9kcztcbiAgICAgICAgdmFyIGRpZmY7XG4gICAgICAgIHZhciBuZXdZZWFyO1xuICAgICAgICB2YXIgcmVtYWluZGVyO1xuICAgICAgICB2YXIgaW1heDtcbiAgICAgICAgdmFyIGltaW47XG4gICAgICAgIHZhciBpbWlkO1xuICAgICAgICB2YXIgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xuICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHNpbXBsZSBjYXNlczogYW1vdW50IGVxdWFscyAxIChlbGltaW5hdGVzIG5lZWQgZm9yIHNlYXJjaGluZyBmb3IgcmVmZXJlbmNlaW5nIHBvaW50KVxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0byBVVEMgdGltZVxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSwgbm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcIlVua25vd24gVGltZVVuaXRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgaW50ZXJ2YWxzXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLCBub3JtYWxGcm9tLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXNzZXJ0aW9uXCIsIFwiVW5rbm93biBUaW1lVW5pdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFtb3VudCBpcyBub3QgMSxcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdG8gVVRDIHRpbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLnNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsRnJvbS51dGNNb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCkpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgbWlsbGlzZWNvbmQgZWFjaCBzZWNvbmQsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW51cyBvbmUgc2Vjb25kIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaWxsaXNlY29uZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IGJpbmFyeSBzZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gTWF0aC5mbG9vcigoODY0MDAwMDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpbWF4ID49IGltaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3gyID0gYXBwcm94LmFkZExvY2FsKGltaWQgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gaW1pZCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWludXMgb25lIG1pbnV0ZSB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2Ugc2Vjb25kc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGFyZSBsZXNzIHRoYW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHJlZmVyZW5jZS1vZi1kYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGltYXggPj0gaW1pbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3gyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gaW1pZCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IGltaWQgLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIGhvdXIgdGhpcy5faW50UmVmZXJlbmNlYXJ5IGVhY2ggdGltZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZSBtaW51cyBvbmUgaG91clxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaW51dGVzLCBzZWNvbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigyNCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAobm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpKSAqIDEyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIC0xIGJlbG93IGlzIGJlY2F1c2UgdGhlIGRheS1vZi1tb250aCBvZiByZWZlcmVuY2UgZGF0ZSBtYXkgYmUgYWZ0ZXIgdGhlIGRheSBvZiB0aGUgZnJvbURhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1llYXIgPSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpICsgcGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobmV3WWVhciwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXNzZXJ0aW9uXCIsIFwiVW5rbm93biBUaW1lVW5pdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxuICAgICAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG4gICAgICogVGhpcyBmdW5jdGlvbiBoYXMgTVVDSCBiZXR0ZXIgcGVyZm9ybWFuY2UgdGhhbiBmaW5kRmlyc3QuXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZXRpbWUgXCJjb3VudFwiIHRpbWVzIGF3YXkgZnJvbSB0aGUgZ2l2ZW4gZGF0ZXRpbWUuXG4gICAgICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIGFkZC4gT3B0aW9uYWwuIE11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIsIG1heSBiZSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZGVmYXVsdCAxXG4gICAgICogQHJldHVybiAocHJldiArIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgcHJldi5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuUHJldiBpZiBwcmV2IGlzIHVuZGVmaW5lZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Db3VudCBpZiBjb3VudCBpcyBub3QgYW4gaW50ZWdlciBudW1iZXJcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKHByZXYsIGNvdW50KSB7XG4gICAgICAgIGlmIChjb3VudCA9PT0gdm9pZCAwKSB7IGNvdW50ID0gMTsgfVxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhcHJldiwgXCJBcmd1bWVudC5QcmV2XCIsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSwgXCJVbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb25cIiwgXCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoTnVtYmVyLmlzSW50ZWdlcihjb3VudCksIFwiQXJndW1lbnQuQ291bnRcIiwgXCJDb3VudCBtdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyXCIpO1xuICAgICAgICB2YXIgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xuICAgICAgICBpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSkuY29udmVydChwcmV2LnpvbmUoKSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBsZXNzIHRoYW5cbiAgICAgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcbiAgICAgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGJlZm9yZSB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxuICAgICAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cbiAgICAgKiAgICAgICAgIGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgbm90IGJvdGggYGZyb21gIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZSBvZiB0aW1lIHpvbmVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRMYXN0ID0gZnVuY3Rpb24gKGZyb20pIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZmluZFByZXYodGhpcy5maW5kRmlyc3QoZnJvbSkpO1xuICAgICAgICBpZiAocmVzdWx0LmVxdWFscyhmcm9tKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cbiAgICAgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxuICAgICAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG4gICAgICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTmV4dCBpZiBwcmV2IGlzIHVuZGVmaW5lZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Db3VudCBpZiBjb3VudCBpcyBub3QgYW4gaW50ZWdlciBudW1iZXJcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRQcmV2ID0gZnVuY3Rpb24gKG5leHQsIGNvdW50KSB7XG4gICAgICAgIGlmIChjb3VudCA9PT0gdm9pZCAwKSB7IGNvdW50ID0gMTsgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5leHQobmV4dCwgLTEgKiBjb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlcnJvcl8xLmVycm9ySXMoZSwgXCJBcmd1bWVudC5QcmV2XCIpKSB7XG4gICAgICAgICAgICAgICAgZSA9IGVycm9yXzEuZXJyb3IoXCJBcmd1bWVudC5OZXh0XCIsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZGF0ZSBpcyBvbiBhIHBlcmlvZCBib3VuZGFyeVxuICAgICAqIChleHBlbnNpdmUhKVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgbm90IGJvdGggYG9jY3VycmVuY2VgIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZSBvZiB0aW1lIHpvbmVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmlzQm91bmRhcnkgPSBmdW5jdGlvbiAob2NjdXJyZW5jZSkge1xuICAgICAgICBpZiAoIW9jY3VycmVuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFvY2N1cnJlbmNlLnpvbmUoKSwgXCJVbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb25cIiwgXCJUaGUgb2NjdXJyZW5jZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcbiAgICAgICAgcmV0dXJuICh0aGlzLmZpbmRGaXJzdChvY2N1cnJlbmNlLnN1YihkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGdpdmVuIG9uZS5cbiAgICAgKiBpLmUuIGEgcGVyaW9kIG9mIDI0IGhvdXJzIGlzIGVxdWFsIHRvIG9uZSBvZiAxIGRheSBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgVVRDIHJlZmVyZW5jZSBtb21lbnRcbiAgICAgKiBhbmQgc2FtZSBkc3QuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBgb3RoZXIjcmVmZXJlbmNlKClgIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZVxuICAgICAqIG9mIHRpbWUgem9uZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIC8vIG5vdGUgd2UgdGFrZSB0aGUgbm9uLW5vcm1hbGl6ZWQgX3JlZmVyZW5jZSBiZWNhdXNlIHRoaXMgaGFzIGFuIGluZmx1ZW5jZSBvbiB0aGUgb3V0Y29tZVxuICAgICAgICBpZiAoIXRoaXMuaXNCb3VuZGFyeShvdGhlci5fcmVmZXJlbmNlKSB8fCAhdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzKG90aGVyLl9pbnRJbnRlcnZhbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVmWm9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XG4gICAgICAgIHZhciBvdGhlclpvbmUgPSBvdGhlci5fcmVmZXJlbmNlLnpvbmUoKTtcbiAgICAgICAgdmFyIHRoaXNJc1JlZ3VsYXIgPSAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscyB8fCAhcmVmWm9uZSB8fCByZWZab25lLmlzVXRjKCkpO1xuICAgICAgICB2YXIgb3RoZXJJc1JlZ3VsYXIgPSAob3RoZXIuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIW90aGVyWm9uZSB8fCBvdGhlclpvbmUuaXNVdGMoKSk7XG4gICAgICAgIGlmICh0aGlzSXNSZWd1bGFyICYmIG90aGVySXNSZWd1bGFyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW50RHN0ID09PSBvdGhlci5faW50RHN0ICYmIHJlZlpvbmUgJiYgb3RoZXJab25lICYmIHJlZlpvbmUuZXF1YWxzKG90aGVyWm9uZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBwZXJpb2Qgd2FzIGNvbnN0cnVjdGVkIHdpdGggaWRlbnRpY2FsIGFyZ3VtZW50cyB0byB0aGUgb3RoZXIgb25lLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fcmVmZXJlbmNlLmlkZW50aWNhbChvdGhlci5fcmVmZXJlbmNlKVxuICAgICAgICAgICAgJiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLl9pbnRlcnZhbClcbiAgICAgICAgICAgICYmIHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIElTTyBkdXJhdGlvbiBzdHJpbmcgZS5nLlxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxSFxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1BUMU0gICAob25lIG1pbnV0ZSlcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMU0gICAob25lIG1vbnRoKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2UudG9Jc29TdHJpbmcoKSArIFwiL1wiICsgdGhpcy5faW50ZXJ2YWwudG9Jc29TdHJpbmcoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGUuZy5cbiAgICAgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2ludGVydmFsLnRvU3RyaW5nKCkgKyBcIiwgcmVmZXJlbmNlaW5nIGF0IFwiICsgdGhpcy5fcmVmZXJlbmNlLnRvU3RyaW5nKCk7XG4gICAgICAgIC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBcIiwga2VlcGluZyBcIiArIHBlcmlvZERzdFRvU3RyaW5nKHRoaXMuX2RzdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBKU09OLWNvbXBhdGlibGUgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBwZXJpb2RcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLnRvSnNvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZTogdGhpcy5yZWZlcmVuY2UoKS50b1N0cmluZygpLFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuaW50ZXJ2YWwoKS50b1N0cmluZygpLFxuICAgICAgICAgICAgcGVyaW9kRHN0OiB0aGlzLmRzdCgpID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscyA/IFwicmVndWxhclwiIDogXCJsb2NhbFwiXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb3JyZWN0cyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIF9yZWZlcmVuY2UgYW5kIF9pbnRSZWZlcmVuY2UuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fY29ycmVjdERheSA9IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGQueWVhcigpLCBkLm1vbnRoKCksIE1hdGgubWluKGJhc2ljcy5kYXlzSW5Nb250aChkLnllYXIoKSwgZC5tb250aCgpKSwgdGhpcy5fcmVmZXJlbmNlLmRheSgpKSwgZC5ob3VyKCksIGQubWludXRlKCksIGQuc2Vjb25kKCksIGQubWlsbGlzZWNvbmQoKSwgZC56b25lKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIElmIHRoaXMuX2ludGVybmFsVW5pdCBpbiBbTW9udGgsIFllYXJdLCBub3JtYWxpemVzIHRoZSBkYXktb2YtbW9udGhcbiAgICAgKiB0byA8PSAyOC5cbiAgICAgKiBAcmV0dXJuIGEgbmV3IGRhdGUgaWYgZGlmZmVyZW50LCBvdGhlcndpc2UgdGhlIGV4YWN0IHNhbWUgb2JqZWN0IChubyBjbG9uZSEpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fbm9ybWFsaXplRGF5ID0gZnVuY3Rpb24gKGQsIGFueW1vbnRoKSB7XG4gICAgICAgIGlmIChhbnltb250aCA9PT0gdm9pZCAwKSB7IGFueW1vbnRoID0gdHJ1ZTsgfVxuICAgICAgICBpZiAoKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgZC5kYXkoKSA+IDI4KVxuICAgICAgICAgICAgfHwgKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciAmJiAoZC5tb250aCgpID09PSAyIHx8IGFueW1vbnRoKSAmJiBkLmRheSgpID4gMjgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoZC55ZWFyKCksIGQubW9udGgoKSwgMjgsIGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLCBkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkOyAvLyBzYXZlIG9uIHRpbWUgYnkgbm90IHJldHVybmluZyBhIGNsb25lXG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxuICAgICAqIChpLmUuIGlmIHRoZSByZWZlcmVuY2UgdGltZSB6b25lIGhhcyBEU1QpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5fZHN0UmVsZXZhbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fcmVmZXJlbmNlLnpvbmUoKTtcbiAgICAgICAgcmV0dXJuICEhKHpvbmVcbiAgICAgICAgICAgICYmIHpvbmUua2luZCgpID09PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5Qcm9wZXJcbiAgICAgICAgICAgICYmIHpvbmUuaGFzRHN0KCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplIHRoZSB2YWx1ZXMgd2hlcmUgcG9zc2libGUgLSBub3QgYWxsIHZhbHVlc1xuICAgICAqIGFyZSBjb252ZXJ0aWJsZSBpbnRvIG9uZSBhbm90aGVyLiBXZWVrcyBhcmUgY29udmVydGVkIHRvIGRheXMuXG4gICAgICogRS5nLiBtb3JlIHRoYW4gNjAgbWludXRlcyBpcyB0cmFuc2ZlcnJlZCB0byBob3VycyxcbiAgICAgKiBidXQgc2Vjb25kcyBjYW5ub3QgYmUgdHJhbnNmZXJyZWQgdG8gbWludXRlcyBkdWUgdG8gbGVhcCBzZWNvbmRzLlxuICAgICAqIFdlZWtzIGFyZSBjb252ZXJ0ZWQgYmFjayB0byBkYXlzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NhbGNJbnRlcm5hbFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gbm9ybWFsaXplIGFueSBhYm92ZS11bml0IHZhbHVlc1xuICAgICAgICB2YXIgaW50QW1vdW50ID0gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XG4gICAgICAgIHZhciBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQgJiYgaW50QW1vdW50ID49IDEwMDAgJiYgaW50QW1vdW50ICUgMTAwMCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMDAwO1xuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LkhvdXIgJiYgaW50QW1vdW50ID49IDI0ICYmIGludEFtb3VudCAlIDI0ID09PSAwKSB7XG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAyNDtcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm93IHJlbW92ZSB3ZWVrcyBzbyB3ZSBoYXZlIG9uZSBsZXNzIGNhc2UgdG8gd29ycnkgYWJvdXRcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LldlZWspIHtcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAqIDc7XG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDEyO1xuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW50SW50ZXJ2YWwgPSBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbihpbnRBbW91bnQsIGludFVuaXQpO1xuICAgICAgICAvLyBub3JtYWxpemUgZHN0IGhhbmRsaW5nXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnREc3QgPSB0aGlzLl9kc3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9pbnREc3QgPSBQZXJpb2REc3QuUmVndWxhckludGVydmFscztcbiAgICAgICAgfVxuICAgICAgICAvLyBub3JtYWxpemUgcmVmZXJlbmNlIGRheVxuICAgICAgICB0aGlzLl9pbnRSZWZlcmVuY2UgPSB0aGlzLl9ub3JtYWxpemVEYXkodGhpcy5fcmVmZXJlbmNlLCBmYWxzZSk7XG4gICAgfTtcbiAgICByZXR1cm4gUGVyaW9kO1xufSgpKTtcbmV4cG9ydHMuUGVyaW9kID0gUGVyaW9kO1xuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiBqc29uIHZhbHVlIHJlcHJlc2VudHMgYSB2YWxpZCBwZXJpb2QgSlNPTlxuICogQHBhcmFtIGpzb25cbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBpc1ZhbGlkUGVyaW9kSnNvbihqc29uKSB7XG4gICAgaWYgKHR5cGVvZiBqc29uICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGpzb24gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGpzb24uZHVyYXRpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGpzb24ucGVyaW9kRHN0ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBqc29uLnJlZmVyZW5jZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghW1wicmVndWxhclwiLCBcImxvY2FsXCJdLmluY2x1ZGVzKGpzb24ucGVyaW9kRHN0KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tdW51c2VkLWV4cHJlc3Npb25cbiAgICAgICAgbmV3IFBlcmlvZChqc29uKTtcbiAgICB9XG4gICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5leHBvcnRzLmlzVmFsaWRQZXJpb2RKc29uID0gaXNWYWxpZFBlcmlvZEpzb247XG4vKipcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIFBlcmlvZC4gTm90ZSB0aGF0IGl0IGRvZXMgbm90IHdvcmsgZm9yIHN1YiBjbGFzc2VzLiBIb3dldmVyLCB1c2UgdGhpcyB0byBiZSByb2J1c3RcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gaXNQZXJpb2QodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmtpbmQgPT09IFwiUGVyaW9kXCI7XG59XG5leHBvcnRzLmlzUGVyaW9kID0gaXNQZXJpb2Q7XG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IHRpbWVzdGFtcCA+PSBgb3B0cy5yZWZlcmVuY2VgIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgdGltZS4gVXNlcyB0aGUgdGltZSB6b25lIGFuZCBEU1Qgc2V0dGluZ3NcbiAqIG9mIHRoZSBnaXZlbiByZWZlcmVuY2UgdGltZS5cbiAqIEBwYXJhbSBvcHRzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBpZiBvcHRzLmhvdXIgb3V0IG9mIHJhbmdlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGlmIG9wdHMubWludXRlIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBpZiBvcHRzLnNlY29uZCBvdXQgb2YgcmFuZ2VcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaWxsaXNlY29uZCBpZiBvcHRzLm1pbGxpc2Vjb25kIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtkYXkgaWYgb3B0cy53ZWVrZGF5IG91dCBvZiByYW5nZVxuICovXG5mdW5jdGlvbiB0aW1lc3RhbXBPbldlZWtUaW1lR3JlYXRlclRoYW5PckVxdWFsVG8ob3B0cykge1xuICAgIHZhciBfYSwgX2IsIF9jO1xuICAgIC8vIHRzbGludDpkaXNhYmxlOiBtYXgtbGluZS1sZW5ndGhcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMuaG91ciA+PSAwICYmIG9wdHMuaG91ciA8IDI0LCBcIkFyZ3VtZW50LkhvdXJcIiwgXCJvcHRzLmhvdXIgc2hvdWxkIGJlIHdpdGhpbiBbMC4uMjNdXCIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQob3B0cy5taW51dGUgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taW51dGUgPj0gMCAmJiBvcHRzLm1pbnV0ZSA8IDYwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taW51dGUpKSwgXCJBcmd1bWVudC5NaW51dGVcIiwgXCJvcHRzLm1pbnV0ZSBzaG91bGQgYmUgd2l0aGluIFswLi41OV1cIik7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChvcHRzLnNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLnNlY29uZCA+PSAwICYmIG9wdHMuc2Vjb25kIDwgNjAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLnNlY29uZCkpLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIm9wdHMuc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuLjU5XVwiKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMubWlsbGlzZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taWxsaXNlY29uZCA+PSAwICYmIG9wdHMubWlsbGlzZWNvbmQgPCAxMDAwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taWxsaXNlY29uZCkpLCBcIkFyZ3VtZW50Lk1pbGxpc2Vjb25kXCIsIFwib3B0cy5taWxsaXNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLjk5OV1cIik7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChvcHRzLndlZWtkYXkgPj0gMCAmJiBvcHRzLndlZWtkYXkgPCA3LCBcIkFyZ3VtZW50LldlZWtkYXlcIiwgXCJvcHRzLndlZWtkYXkgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNl1cIik7XG4gICAgLy8gdHNsaW50OmVuYWJsZTogbWF4LWxpbmUtbGVuZ3RoXG4gICAgdmFyIG1pZG5pZ2h0ID0gb3B0cy5yZWZlcmVuY2Uuc3RhcnRPZkRheSgpO1xuICAgIHdoaWxlIChtaWRuaWdodC53ZWVrRGF5KCkgIT09IG9wdHMud2Vla2RheSkge1xuICAgICAgICBtaWRuaWdodCA9IG1pZG5pZ2h0LmFkZExvY2FsKGR1cmF0aW9uXzEuZGF5cygxKSk7XG4gICAgfVxuICAgIHZhciBkdCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG1pZG5pZ2h0LnllYXIoKSwgbWlkbmlnaHQubW9udGgoKSwgbWlkbmlnaHQuZGF5KCksIG9wdHMuaG91ciwgKF9hID0gb3B0cy5taW51dGUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IDAsIChfYiA9IG9wdHMuc2Vjb25kKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiAwLCAoX2MgPSBvcHRzLm1pbGxpc2Vjb25kKSAhPT0gbnVsbCAmJiBfYyAhPT0gdm9pZCAwID8gX2MgOiAwLCBvcHRzLnJlZmVyZW5jZS56b25lKCkpO1xuICAgIGlmIChkdCA8IG9wdHMucmVmZXJlbmNlKSB7XG4gICAgICAgIC8vIHdlJ3ZlIHN0YXJ0ZWQgb3V0IG9uIHRoZSBjb3JyZWN0IHdlZWtkYXkgYW5kIHRoZSByZWZlcmVuY2UgdGltZXN0YW1wIHdhcyBncmVhdGVyIHRoYW4gdGhlIGdpdmVuIHRpbWUsIG5lZWQgdG8gc2tpcCBhIHdlZWtcbiAgICAgICAgcmV0dXJuIGR0LmFkZExvY2FsKGR1cmF0aW9uXzEuZGF5cyg3KSk7XG4gICAgfVxuICAgIHJldHVybiBkdDtcbn1cbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvID0gdGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB0aW1lc3RhbXAgPCBgb3B0cy5yZWZlcmVuY2VgIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgdGltZS4gVXNlcyB0aGUgdGltZSB6b25lIGFuZCBEU1Qgc2V0dGluZ3NcbiAqIG9mIHRoZSBnaXZlbiByZWZlcmVuY2UgdGltZS5cbiAqIEBwYXJhbSBvcHRzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBpZiBvcHRzLmhvdXIgb3V0IG9mIHJhbmdlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGlmIG9wdHMubWludXRlIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBpZiBvcHRzLnNlY29uZCBvdXQgb2YgcmFuZ2VcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaWxsaXNlY29uZCBpZiBvcHRzLm1pbGxpc2Vjb25kIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtkYXkgaWYgb3B0cy53ZWVrZGF5IG91dCBvZiByYW5nZVxuICovXG5mdW5jdGlvbiB0aW1lc3RhbXBPbldlZWtUaW1lTGVzc1RoYW4ob3B0cykge1xuICAgIHZhciBfYSwgX2IsIF9jO1xuICAgIC8vIHRzbGludDpkaXNhYmxlOiBtYXgtbGluZS1sZW5ndGhcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMuaG91ciA+PSAwICYmIG9wdHMuaG91ciA8IDI0LCBcIkFyZ3VtZW50LkhvdXJcIiwgXCJvcHRzLmhvdXIgc2hvdWxkIGJlIHdpdGhpbiBbMC4uMjNdXCIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQob3B0cy5taW51dGUgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taW51dGUgPj0gMCAmJiBvcHRzLm1pbnV0ZSA8IDYwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taW51dGUpKSwgXCJBcmd1bWVudC5NaW51dGVcIiwgXCJvcHRzLm1pbnV0ZSBzaG91bGQgYmUgd2l0aGluIFswLi41OV1cIik7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChvcHRzLnNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLnNlY29uZCA+PSAwICYmIG9wdHMuc2Vjb25kIDwgNjAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLnNlY29uZCkpLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIm9wdHMuc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuLjU5XVwiKTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KG9wdHMubWlsbGlzZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taWxsaXNlY29uZCA+PSAwICYmIG9wdHMubWlsbGlzZWNvbmQgPCAxMDAwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taWxsaXNlY29uZCkpLCBcIkFyZ3VtZW50Lk1pbGxpc2Vjb25kXCIsIFwib3B0cy5taWxsaXNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLjk5OV1cIik7XG4gICAgYXNzZXJ0XzEuZGVmYXVsdChvcHRzLndlZWtkYXkgPj0gMCAmJiBvcHRzLndlZWtkYXkgPCA3LCBcIkFyZ3VtZW50LldlZWtkYXlcIiwgXCJvcHRzLndlZWtkYXkgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNl1cIik7XG4gICAgLy8gdHNsaW50OmVuYWJsZTogbWF4LWxpbmUtbGVuZ3RoXG4gICAgdmFyIG1pZG5pZ2h0ID0gb3B0cy5yZWZlcmVuY2Uuc3RhcnRPZkRheSgpLmFkZExvY2FsKGR1cmF0aW9uXzEuZGF5cygxKSk7XG4gICAgd2hpbGUgKG1pZG5pZ2h0LndlZWtEYXkoKSAhPT0gb3B0cy53ZWVrZGF5KSB7XG4gICAgICAgIG1pZG5pZ2h0ID0gbWlkbmlnaHQuc3ViTG9jYWwoZHVyYXRpb25fMS5kYXlzKDEpKTtcbiAgICB9XG4gICAgdmFyIGR0ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobWlkbmlnaHQueWVhcigpLCBtaWRuaWdodC5tb250aCgpLCBtaWRuaWdodC5kYXkoKSwgb3B0cy5ob3VyLCAoX2EgPSBvcHRzLm1pbnV0ZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogMCwgKF9iID0gb3B0cy5zZWNvbmQpICE9PSBudWxsICYmIF9iICE9PSB2b2lkIDAgPyBfYiA6IDAsIChfYyA9IG9wdHMubWlsbGlzZWNvbmQpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IDAsIG9wdHMucmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgaWYgKGR0ID49IG9wdHMucmVmZXJlbmNlKSB7XG4gICAgICAgIC8vIHdlJ3ZlIHN0YXJ0ZWQgb3V0IG9uIHRoZSBjb3JyZWN0IHdlZWtkYXkgYW5kIHRoZSByZWZlcmVuY2UgdGltZXN0YW1wIHdhcyBsZXNzIHRoYW4gdGhlIGdpdmVuIHRpbWUsIG5lZWQgdG8gc2tpcCBhIHdlZWtcbiAgICAgICAgcmV0dXJuIGR0LnN1YkxvY2FsKGR1cmF0aW9uXzEuZGF5cyg3KSk7XG4gICAgfVxuICAgIHJldHVybiBkdDtcbn1cbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuID0gdGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGVyaW9kLmpzLm1hcCIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBTdHJpbmcgdXRpbGl0eSBmdW5jdGlvbnNcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnBhZFJpZ2h0ID0gZXhwb3J0cy5wYWRMZWZ0ID0gdm9pZCAwO1xudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xuLyoqXG4gKiBQYWQgYSBzdHJpbmcgYnkgYWRkaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGJlZ2lubmluZy5cbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxuICogQHBhcmFtIHdpZHRoXHR0aGUgZGVzaXJlZCBtaW5pbXVtIHN0cmluZyB3aWR0aFxuICogQHBhcmFtIGNoYXJcdHRoZSBzaW5nbGUgY2hhcmFjdGVyIHRvIHBhZCB3aXRoXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldpZHRoIGlmIHdpZHRoIGlzIG5vdCBhbiBpbnRlZ2VyIG51bWJlciA+PSAwXG4gKi9cbmZ1bmN0aW9uIHBhZExlZnQocywgd2lkdGgsIGNoYXIpIHtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIod2lkdGgpICYmIHdpZHRoID49IDAsIFwiQXJndW1lbnQuV2lkdGhcIiwgXCJ3aWR0aCBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXIgPj0gMCBidXQgaXM6ICVkXCIsIHdpZHRoKTtcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xuICAgICAgICBwYWRkaW5nICs9IGNoYXI7XG4gICAgfVxuICAgIHJldHVybiBwYWRkaW5nICsgcztcbn1cbmV4cG9ydHMucGFkTGVmdCA9IHBhZExlZnQ7XG4vKipcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgZW5kLlxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2lkdGggaWYgd2lkdGggaXMgbm90IGFuIGludGVnZXIgbnVtYmVyID49IDBcbiAqL1xuZnVuY3Rpb24gcGFkUmlnaHQocywgd2lkdGgsIGNoYXIpIHtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KE51bWJlci5pc0ludGVnZXIod2lkdGgpICYmIHdpZHRoID49IDAsIFwiQXJndW1lbnQuV2lkdGhcIiwgXCJ3aWR0aCBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXIgPj0gMCBidXQgaXM6ICVkXCIsIHdpZHRoKTtcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xuICAgICAgICBwYWRkaW5nICs9IGNoYXI7XG4gICAgfVxuICAgIHJldHVybiBzICsgcGFkZGluZztcbn1cbmV4cG9ydHMucGFkUmlnaHQgPSBwYWRSaWdodDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0cmluZ3MuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICovXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVhbFRpbWVTb3VyY2UgPSB2b2lkIDA7XG4vKipcbiAqIERlZmF1bHQgdGltZSBzb3VyY2UsIHJldHVybnMgYWN0dWFsIHRpbWVcbiAqL1xudmFyIFJlYWxUaW1lU291cmNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlYWxUaW1lU291cmNlKCkge1xuICAgIH1cbiAgICAvKiogQGluaGVyaXRkb2MgKi9cbiAgICBSZWFsVGltZVNvdXJjZS5wcm90b3R5cGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gUmVhbFRpbWVTb3VyY2U7XG59KCkpO1xuZXhwb3J0cy5SZWFsVGltZVNvdXJjZSA9IFJlYWxUaW1lU291cmNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZXNvdXJjZS5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogVGltZSB6b25lIHJlcHJlc2VudGF0aW9uIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmlzVGltZVpvbmUgPSBleHBvcnRzLlRpbWVab25lID0gZXhwb3J0cy5UaW1lWm9uZUtpbmQgPSBleHBvcnRzLnpvbmUgPSBleHBvcnRzLnV0YyA9IGV4cG9ydHMubG9jYWwgPSB2b2lkIDA7XG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcbi8qKlxuICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlIGFzIHBlciBPUyBzZXR0aW5ncy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGxvY2FsKCkge1xuICAgIHJldHVybiBUaW1lWm9uZS5sb2NhbCgpO1xufVxuZXhwb3J0cy5sb2NhbCA9IGxvY2FsO1xuLyoqXG4gKiBDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZSB6b25lLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHpvbmUgaXMgbm90IHByZXNlbnQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICovXG5mdW5jdGlvbiB1dGMoKSB7XG4gICAgcmV0dXJuIFRpbWVab25lLnV0YygpO1xufVxuZXhwb3J0cy51dGMgPSB1dGM7XG4vKipcbiAqIHpvbmUoKSBpbXBsZW1lbnRhdGlvblxuICovXG5mdW5jdGlvbiB6b25lKGEsIGRzdCkge1xuICAgIHJldHVybiBUaW1lWm9uZS56b25lKGEsIGRzdCk7XG59XG5leHBvcnRzLnpvbmUgPSB6b25lO1xuLyoqXG4gKiBUaGUgdHlwZSBvZiB0aW1lIHpvbmVcbiAqL1xudmFyIFRpbWVab25lS2luZDtcbihmdW5jdGlvbiAoVGltZVpvbmVLaW5kKSB7XG4gICAgLyoqXG4gICAgICogTG9jYWwgdGltZSBvZmZzZXQgYXMgZGV0ZXJtaW5lZCBieSBKYXZhU2NyaXB0IERhdGUgY2xhc3MuXG4gICAgICovXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIkxvY2FsXCJdID0gMF0gPSBcIkxvY2FsXCI7XG4gICAgLyoqXG4gICAgICogRml4ZWQgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cbiAgICAgKi9cbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xuICAgIC8qKlxuICAgICAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xuICAgICAqIERTVCBpZiBhcHBsaWNhYmxlLlxuICAgICAqL1xuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJQcm9wZXJcIl0gPSAyXSA9IFwiUHJvcGVyXCI7XG59KShUaW1lWm9uZUtpbmQgPSBleHBvcnRzLlRpbWVab25lS2luZCB8fCAoZXhwb3J0cy5UaW1lWm9uZUtpbmQgPSB7fSkpO1xuLyoqXG4gKiBUaW1lIHpvbmUuIFRoZSBvYmplY3QgaXMgaW1tdXRhYmxlIGJlY2F1c2UgaXQgaXMgY2FjaGVkOlxuICogcmVxdWVzdGluZyBhIHRpbWUgem9uZSB0d2ljZSB5aWVsZHMgdGhlIHZlcnkgc2FtZSBvYmplY3QuXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbiAqIGkuZS4gb2Zmc2V0IDkwIG1lYW5zICswMTozMC5cbiAqXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXG4gKiBhIGZpeGVkIG9mZnNldCAoXCIrMDE6MzBcIikgd2l0aG91dCBEU1QsIG9yIGEgSUFOQSB0aW1lem9uZSAoXCJFdXJvcGUvQW1zdGVyZGFtXCIpIHdpdGggRFNUXG4gKiBhcHBsaWVkIGRlcGVuZGluZyBvbiB0aGUgdGltZSB6b25lIHJ1bGVzLlxuICovXG52YXIgVGltZVpvbmUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xuICAgICAqIFRpbWVab25lLnpvbmUoKSBtZXRob2QgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxuICAgICAqIEBwYXJhbSBkc3QgQWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUsIGlnbm9yZWQgZm9yIGxvY2FsIHRpbWUgYW5kIGZpeGVkIG9mZnNldHNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGRvZXNuJ3QgZXhpc3RcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGlzIGludmFsaWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBUaW1lWm9uZShuYW1lLCBkc3QpIHtcbiAgICAgICAgaWYgKGRzdCA9PT0gdm9pZCAwKSB7IGRzdCA9IHRydWU7IH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFsbG93IG5vdCB1c2luZyBpbnN0YW5jZW9mXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzS2luZCA9IFwiVGltZVpvbmVcIjtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcbiAgICAgICAgaWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuTG9jYWw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IG5hbWUuY2hhckF0KDApID09PSBcIi1cIiB8fCBuYW1lLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykgfHwgbmFtZSA9PT0gXCJaXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcbiAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBcIk5vdEZvdW5kLlpvbmVcIiwgXCJub24tZXhpc3RpbmcgdGltZSB6b25lIG5hbWUgJyVzJ1wiLCBuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUuIE5vdGUgdGhhdFxuICAgICAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxuICAgICAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5sb2NhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJsb2NhbHRpbWVcIiwgdHJ1ZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgVVRDIHRpbWUgem9uZS5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUaW1lWm9uZS51dGMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIHpvbmUoKSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgKi9cbiAgICBUaW1lWm9uZS56b25lID0gZnVuY3Rpb24gKGEsIGRzdCkge1xuICAgICAgICBpZiAoZHN0ID09PSB2b2lkIDApIHsgZHN0ID0gdHJ1ZTsgfVxuICAgICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIChhKSkge1xuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBhO1xuICAgICAgICAgICAgICAgICAgICBpZiAocy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nKHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBhO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KG9mZnNldCA+IC0yNCAqIDYwICYmIG9mZnNldCA8IDI0ICogNjAsIFwiQXJndW1lbnQuT2Zmc2V0XCIsIFwiVGltZVpvbmUuem9uZSgpOiBvZmZzZXQgb3V0IG9mIHJhbmdlXCIpO1xuICAgICAgICAgICAgICAgICAgICBuYW1lID0gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcob2Zmc2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5BXCIsIFwidW5leHBlY3RlZCB0eXBlIGZvciBmaXJzdCBhcmd1bWVudDogJXNcIiwgdHlwZW9mIGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgaW1tdXRhYmxlIHlvdSB3aWxsIE5PVFxuICAgICAqIGFjdHVhbGx5IGdldCBhIGNsb25lIGJ1dCB0aGUgc2FtZSBvYmplY3QuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllci4gQ2FuIGJlIGFuIG9mZnNldCBcIi0wMTozMFwiIG9yIGFuXG4gICAgICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcbiAgICAgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgRFNUIGlzIGVuYWJsZWRcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5raW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fa2luZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xuICAgICAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxuICAgICAgICAgICAgICAgICYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyB3ZXJlIGlkZW50aWNhbCwgc28gVVRDICE9PSBHTVRcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogSXMgdGhpcyB6b25lIGVxdWl2YWxlbnQgdG8gVVRDP1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5pc1V0YyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xuICAgICAgICB2YXIgdXRjVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSkgOlxuICAgICAgICAgICAgdHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7fSkgOlxuICAgICAgICAgICAgICAgIGEpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSwgdXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldEZvclV0YyA9IGZ1bmN0aW9uIChhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcbiAgICAgICAgdmFyIHV0Y1RpbWUgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pIDpcbiAgICAgICAgICAgIHR5cGVvZiBhID09PSBcInVuZGVmaW5lZFwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3Qoe30pIDpcbiAgICAgICAgICAgICAgICBhKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEModXRjVGltZS5jb21wb25lbnRzLnllYXIsIDAsIDEsIDApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3Jab25lID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xuICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XG4gICAgICAgICAgICB0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHt9KSA6XG4gICAgICAgICAgICAgICAgYSk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuZGF5LCBsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGkpO1xuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcbiAgICAgICAgICAgICAgICAvLyBub3RlIHRoYXQgVHpEYXRhYmFzZSBub3JtYWxpemVzIHRoZSBnaXZlbiBkYXRlIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gaXRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXG4gICAgICpcbiAgICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xuICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcbiAgICAgKlxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxuICAgICAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcbiAgICAgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3Jab25lRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xuICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXRGb3Jab25lKGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoZGF0ZSwgZnVuY3MpKTtcbiAgICB9O1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5hYmJyZXZpYXRpb25Gb3JVdGMgPSBmdW5jdGlvbiAoYSwgYiwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGksIGMpIHtcbiAgICAgICAgdmFyIHV0Y1RpbWU7XG4gICAgICAgIHZhciBkc3REZXBlbmRlbnQgPSB0cnVlO1xuICAgICAgICBpZiAodHlwZW9mIGEgIT09IFwibnVtYmVyXCIgJiYgISFhKSB7XG4gICAgICAgICAgICB1dGNUaW1lID0gYTtcbiAgICAgICAgICAgIGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1dGNUaW1lID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xuICAgICAgICAgICAgZHN0RGVwZW5kZW50ID0gKGMgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibG9jYWxcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuYWJicmV2aWF0aW9uKHRoaXMuX25hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUubm9ybWFsaXplWm9uZVRpbWUgPSBmdW5jdGlvbiAobG9jYWxUaW1lLCBvcHQpIHtcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwOyB9XG4gICAgICAgIHZhciB0em9wdCA9IChvcHQgPT09IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24gPyB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duIDogdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXApO1xuICAgICAgICBpZiAodGhpcy5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZSksIHR6b3B0KS51bml4TWlsbGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSwgdHpvcHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVGltZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyIChub3JtYWxpemVkKS5cbiAgICAgKiBFaXRoZXIgXCJsb2NhbHRpbWVcIiwgSUFOQSBuYW1lLCBvciBcIitoaDptbVwiIG9mZnNldC5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLm5hbWUoKTtcbiAgICAgICAgaWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNEc3QoKSAmJiAhdGhpcy5kc3QoKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIiB3aXRob3V0IERTVFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGFuIG9mZnNldCBudW1iZXIgaW50byBhbiBvZmZzZXQgc3RyaW5nXG4gICAgICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluIElTTyBub3RhdGlvbiBcIiswMTozMFwiIGZvciArOTAgbWludXRlc1xuICAgICAqIEB0aHJvd3MgQXJndW1lbnQuT2Zmc2V0IGlmIG9mZnNldCBpcyBub3QgYSBmaW5pdGUgbnVtYmVyIG9yIG5vdCB3aXRoaW4gLTI0ICogNjAgLi4uICsyNCAqIDYwIG1pbnV0ZXNcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChOdW1iZXIuaXNGaW5pdGUob2Zmc2V0KSAmJiBvZmZzZXQgPj0gLTI0ICogNjAgJiYgb2Zmc2V0IDw9IDI0ICogNjAsIFwiQXJndW1lbnQuT2Zmc2V0XCIsIFwiaW52YWxpZCBvZmZzZXQgJWRcIiwgb2Zmc2V0KTtcbiAgICAgICAgdmFyIHNpZ24gPSAob2Zmc2V0IDwgMCA/IFwiLVwiIDogXCIrXCIpO1xuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xuICAgICAgICByZXR1cm4gc2lnbiArIHN0cmluZ3MucGFkTGVmdChob3Vycy50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KG1pbnV0ZXMudG9TdHJpbmcoMTApLCAyLCBcIjBcIik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTdHJpbmcgdG8gb2Zmc2V0IGNvbnZlcnNpb24uXG4gICAgICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcbiAgICAgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuUyBpZiBzIGNhbm5vdCBiZSBwYXJzZWRcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5zdHJpbmdUb09mZnNldCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XG4gICAgICAgIC8vIGVhc3kgY2FzZVxuICAgICAgICBpZiAodCA9PT0gXCJaXCIpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdCh0Lm1hdGNoKC9eWystXVxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCg6PylcXGRcXGQkLyksIFwiQXJndW1lbnQuU1wiLCBcIldyb25nIHRpbWUgem9uZSBmb3JtYXQ6IFxcXCJcIiArIHQgKyBcIlxcXCJcIik7XG4gICAgICAgIHZhciBzaWduID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XG4gICAgICAgIHZhciBob3VycyA9IDA7XG4gICAgICAgIHZhciBtaW51dGVzID0gMDtcbiAgICAgICAgc3dpdGNoICh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGhvdXJzID0gcGFyc2VJbnQodC5zbGljZSgxLCAyKSwgMTApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGhvdXJzID0gcGFyc2VJbnQodC5zbGljZSgxLCAzKSwgMTApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgIGhvdXJzID0gcGFyc2VJbnQodC5zbGljZSgxLCAzKSwgMTApO1xuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0LnNsaWNlKDMsIDUpLCAxMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgaG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XG4gICAgICAgICAgICAgICAgbWludXRlcyA9IHBhcnNlSW50KHQuc2xpY2UoNCwgNiksIDEwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCB0aW1lIHpvbmUgKGhvdXJzIG91dCBvZiByYW5nZSk6ICdcIiArIHQgKyBcIidcIik7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQobWludXRlcyA+PSAwICYmIG1pbnV0ZXMgPCA2MCwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCB0aW1lIHpvbmUgKG1pbnV0ZXMgb3V0IG9mIHJhbmdlKTogJ1wiICsgdCArIFwiJ1wiKTtcbiAgICAgICAgcmV0dXJuIHNpZ24gKiAoaG91cnMgKiA2MCArIG1pbnV0ZXMpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRmluZCBpbiBjYWNoZSBvciBjcmVhdGUgem9uZVxuICAgICAqIEBwYXJhbSBuYW1lXHRUaW1lIHpvbmUgbmFtZVxuICAgICAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZT9cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gKG5hbWUsIGRzdCkge1xuICAgICAgICB2YXIga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcbiAgICAgICAgaWYgKGtleSBpbiBUaW1lWm9uZS5fY2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiBUaW1lWm9uZS5fY2FjaGVba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XG4gICAgICAgICAgICBUaW1lWm9uZS5fY2FjaGVba2V5XSA9IHQ7XG4gICAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGZvciBhIGNhY2hlIGxvb2t1cFxuICAgICAqIEB0aHJvd3MgQXJndW1lbnQuUyBpZiBzIGlzIGVtcHR5XG4gICAgICovXG4gICAgVGltZVpvbmUuX25vcm1hbGl6ZVN0cmluZyA9IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodC5sZW5ndGggPiAwLCBcIkFyZ3VtZW50LlNcIiwgXCJFbXB0eSB0aW1lIHpvbmUgc3RyaW5nIGdpdmVuXCIpO1xuICAgICAgICBpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodCA9PT0gXCJaXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcIiswMDowMFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKFRpbWVab25lLl9pc09mZnNldFN0cmluZyh0KSkge1xuICAgICAgICAgICAgLy8gb2Zmc2V0IHN0cmluZ1xuICAgICAgICAgICAgLy8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yXzEuZXJyb3JJcyhlLCBcIkFyZ3VtZW50Lk9mZnNldFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBlID0gZXJyb3JfMS5lcnJvcihcIkFyZ3VtZW50LlNcIiwgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcbiAgICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBmaXJzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgb2YgcyBpcyArLCAtLCBvciBaXG4gICAgICogQHBhcmFtIHNcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcgPSBmdW5jdGlvbiAocykge1xuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xuICAgICAgICByZXR1cm4gKHQuY2hhckF0KDApID09PSBcIitcIiB8fCB0LmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgdCA9PT0gXCJaXCIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGltZSB6b25lIGNhY2hlLlxuICAgICAqL1xuICAgIFRpbWVab25lLl9jYWNoZSA9IHt9O1xuICAgIHJldHVybiBUaW1lWm9uZTtcbn0oKSk7XG5leHBvcnRzLlRpbWVab25lID0gVGltZVpvbmU7XG4vKipcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIFRpbWVab25lLiBOb3RlIHRoYXQgaXQgZG9lcyBub3Qgd29yayBmb3Igc3ViIGNsYXNzZXMuIEhvd2V2ZXIsIHVzZSB0aGlzIHRvIGJlIHJvYnVzdFxuICogYWdhaW5zdCBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIGxpYnJhcnkgaW4gb25lIHByb2Nlc3MgaW5zdGVhZCBvZiBpbnN0YW5jZW9mXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBpc1RpbWVab25lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5jbGFzc0tpbmQgPT09IFwiVGltZVpvbmVcIjtcbn1cbmV4cG9ydHMuaXNUaW1lWm9uZSA9IGlzVGltZVpvbmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lem9uZS5qcy5tYXAiLCIvKipcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnRva2VuaXplID0gZXhwb3J0cy5Ub2tlblR5cGUgPSB2b2lkIDA7XG4vKipcbiAqIERpZmZlcmVudCB0eXBlcyBvZiB0b2tlbnMsIGVhY2ggZm9yIGEgRGF0ZVRpbWUgXCJwZXJpb2QgdHlwZVwiIChsaWtlIHllYXIsIG1vbnRoLCBob3VyIGV0Yy4pXG4gKi9cbnZhciBUb2tlblR5cGU7XG4oZnVuY3Rpb24gKFRva2VuVHlwZSkge1xuICAgIC8qKlxuICAgICAqIFJhdyB0ZXh0XG4gICAgICovXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIklERU5USVRZXCJdID0gMF0gPSBcIklERU5USVRZXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkVSQVwiXSA9IDFdID0gXCJFUkFcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiWUVBUlwiXSA9IDJdID0gXCJZRUFSXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlFVQVJURVJcIl0gPSAzXSA9IFwiUVVBUlRFUlwiO1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJNT05USFwiXSA9IDRdID0gXCJNT05USFwiO1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJXRUVLXCJdID0gNV0gPSBcIldFRUtcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiREFZXCJdID0gNl0gPSBcIkRBWVwiO1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJXRUVLREFZXCJdID0gN10gPSBcIldFRUtEQVlcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiREFZUEVSSU9EXCJdID0gOF0gPSBcIkRBWVBFUklPRFwiO1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJIT1VSXCJdID0gOV0gPSBcIkhPVVJcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiTUlOVVRFXCJdID0gMTBdID0gXCJNSU5VVEVcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiU0VDT05EXCJdID0gMTFdID0gXCJTRUNPTkRcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiWk9ORVwiXSA9IDEyXSA9IFwiWk9ORVwiO1xufSkoVG9rZW5UeXBlID0gZXhwb3J0cy5Ub2tlblR5cGUgfHwgKGV4cG9ydHMuVG9rZW5UeXBlID0ge30pKTtcbi8qKlxuICogVG9rZW5pemUgYW4gTERNTCBkYXRlL3RpbWUgZm9ybWF0IHN0cmluZ1xuICogQHBhcmFtIGZvcm1hdFN0cmluZyB0aGUgc3RyaW5nIHRvIHRva2VuaXplXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gdG9rZW5pemUoZm9ybWF0U3RyaW5nKSB7XG4gICAgaWYgKCFmb3JtYXRTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGFwcGVuZFRva2VuID0gZnVuY3Rpb24gKHRva2VuU3RyaW5nLCByYXcpIHtcbiAgICAgICAgLy8gVGhlIHRva2VuU3RyaW5nIG1heSBiZSBsb25nZXIgdGhhbiBzdXBwb3J0ZWQgZm9yIGEgdG9rZW50eXBlLCBlLmcuIFwiaGhoaFwiIHdoaWNoIHdvdWxkIGJlIFRXTyBob3VyIHNwZWNzLlxuICAgICAgICAvLyBXZSBncmVlZGlseSBjb25zdW1lIExETUwgc3BlY3Mgd2hpbGUgcG9zc2libGVcbiAgICAgICAgd2hpbGUgKHRva2VuU3RyaW5nICE9PSBcIlwiKSB7XG4gICAgICAgICAgICBpZiAocmF3IHx8ICFTWU1CT0xfTUFQUElORy5oYXNPd25Qcm9wZXJ0eSh0b2tlblN0cmluZ1swXSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9rZW4gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICByYXc6IHRva2VuU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBUb2tlblR5cGUuSURFTlRJVFlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICB0b2tlblN0cmluZyA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdG9rZW4sIGRpZmZlcmVudCBsZW5ndGhzIG1heSBiZSBzdXBwb3J0ZWRcbiAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IFNZTUJPTF9NQVBQSU5HW3Rva2VuU3RyaW5nWzBdXTtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoXzEgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKGluZm8ubWF4TGVuZ3RoID09PSB1bmRlZmluZWQgJiYgKCFBcnJheS5pc0FycmF5KGluZm8ubGVuZ3RocykgfHwgaW5mby5sZW5ndGhzLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBpcyBhbGxvd2VkXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aF8xID0gdG9rZW5TdHJpbmcubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmZvLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGdyZWVkaWx5IGdvYmJsZSB1cFxuICAgICAgICAgICAgICAgICAgICBsZW5ndGhfMSA9IE1hdGgubWluKHRva2VuU3RyaW5nLmxlbmd0aCwgaW5mby5tYXhMZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovIGlmIChBcnJheS5pc0FycmF5KGluZm8ubGVuZ3RocykgJiYgaW5mby5sZW5ndGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBtYXhpbXVtIGFsbG93ZWQgbGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBpbmZvLmxlbmd0aHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsIDw9IHRva2VuU3RyaW5nLmxlbmd0aCAmJiAobGVuZ3RoXzEgPT09IHVuZGVmaW5lZCB8fCBsZW5ndGhfMSA8IGwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoXzEgPSBsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChsZW5ndGhfMSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vIGFsbG93ZWQgbGVuZ3RoIGZvdW5kIChub3QgcG9zc2libGUgd2l0aCBjdXJyZW50IHN5bWJvbCBtYXBwaW5nIHNpbmNlIGxlbmd0aCAxIGlzIGFsd2F5cyBhbGxvd2VkKVxuICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW4gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLklERU5USVRZXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW5TdHJpbmcgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlZml4IGZvdW5kXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogbGVuZ3RoXzEsXG4gICAgICAgICAgICAgICAgICAgICAgICByYXc6IHRva2VuU3RyaW5nLnNsaWNlKDAsIGxlbmd0aF8xKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBpbmZvLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlblN0cmluZyA9IHRva2VuU3RyaW5nLnNsaWNlKGxlbmd0aF8xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciBjdXJyZW50VG9rZW4gPSBcIlwiO1xuICAgIHZhciBwcmV2aW91c0NoYXIgPSBcIlwiO1xuICAgIHZhciBxdW90aW5nID0gZmFsc2U7XG4gICAgdmFyIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBfaSA9IDAsIGZvcm1hdFN0cmluZ18xID0gZm9ybWF0U3RyaW5nOyBfaSA8IGZvcm1hdFN0cmluZ18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgY3VycmVudENoYXIgPSBmb3JtYXRTdHJpbmdfMVtfaV07XG4gICAgICAgIC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xuICAgICAgICBpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICBpZiAoIXF1b3RpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9zc2libGVFc2NhcGluZykge1xuICAgICAgICAgICAgICAgICAgICAvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kVG9rZW4oY3VycmVudFRva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IFwiJ1wiO1xuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUd28gcG9zc2liaWxpdGllczogV2VyZSBhcmUgZG9uZSBxdW90aW5nLCBvciB3ZSBhcmUgZXNjYXBpbmcgYSAnIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEVzY2FwaW5nLCBhZGQgJyB0byB0aGUgdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBNYXliZSBlc2NhcGluZywgd2FpdCBmb3IgbmV4dCB0b2tlbiBpZiB3ZSBhcmUgZXNjYXBpbmdcbiAgICAgICAgICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwb3NzaWJsZUVzY2FwaW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBjaGFyYWN0ZXIgaXMgcmVsZXZhbnQsIHNvIHNhdmUgaXQgZm9yIGluc3BlY3RpbmcgbmV4dCByb3VuZFxuICAgICAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xuICAgICAgICAgICAgcXVvdGluZyA9ICFxdW90aW5nO1xuICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gRmx1c2ggY3VycmVudCB0b2tlblxuICAgICAgICAgICAgYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCAhcXVvdGluZyk7XG4gICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChxdW90aW5nKSB7XG4gICAgICAgICAgICAvLyBRdW90aW5nIG1vZGUsIGFkZCBjaGFyYWN0ZXIgdG8gdG9rZW4uXG4gICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XG4gICAgICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XG4gICAgICAgICAgICAvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxuICAgICAgICAgICAgYXBwZW5kVG9rZW4oY3VycmVudFRva2VuKTtcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IGN1cnJlbnRDaGFyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UgYXJlIHJlcGVhdGluZyB0aGUgdG9rZW4gd2l0aCBtb3JlIGNoYXJhY3RlcnNcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcbiAgICB9XG4gICAgLy8gRG9uJ3QgZm9yZ2V0IHRvIGFkZCB0aGUgbGFzdCB0b2tlbiB0byB0aGUgcmVzdWx0IVxuICAgIGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcXVvdGluZyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydHMudG9rZW5pemUgPSB0b2tlbml6ZTtcbnZhciBTWU1CT0xfTUFQUElORyA9IHtcbiAgICBHOiB7IHR5cGU6IFRva2VuVHlwZS5FUkEsIG1heExlbmd0aDogNSB9LFxuICAgIHk6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcbiAgICBZOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXG4gICAgdTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxuICAgIFU6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIsIG1heExlbmd0aDogNSB9LFxuICAgIHI6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcbiAgICBROiB7IHR5cGU6IFRva2VuVHlwZS5RVUFSVEVSLCBtYXhMZW5ndGg6IDUgfSxcbiAgICBxOiB7IHR5cGU6IFRva2VuVHlwZS5RVUFSVEVSLCBtYXhMZW5ndGg6IDUgfSxcbiAgICBNOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgTDogeyB0eXBlOiBUb2tlblR5cGUuTU9OVEgsIG1heExlbmd0aDogNSB9LFxuICAgIGw6IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDEgfSxcbiAgICB3OiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLLCBtYXhMZW5ndGg6IDIgfSxcbiAgICBXOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLLCBtYXhMZW5ndGg6IDEgfSxcbiAgICBkOiB7IHR5cGU6IFRva2VuVHlwZS5EQVksIG1heExlbmd0aDogMiB9LFxuICAgIEQ6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAzIH0sXG4gICAgRjogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDEgfSxcbiAgICBnOiB7IHR5cGU6IFRva2VuVHlwZS5EQVkgfSxcbiAgICBFOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcbiAgICBlOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcbiAgICBjOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcbiAgICBhOiB7IHR5cGU6IFRva2VuVHlwZS5EQVlQRVJJT0QsIG1heExlbmd0aDogNSB9LFxuICAgIGI6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgQjogeyB0eXBlOiBUb2tlblR5cGUuREFZUEVSSU9ELCBtYXhMZW5ndGg6IDUgfSxcbiAgICBoOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcbiAgICBIOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcbiAgICBrOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcbiAgICBLOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcbiAgICBqOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDYgfSxcbiAgICBKOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcbiAgICBtOiB7IHR5cGU6IFRva2VuVHlwZS5NSU5VVEUsIG1heExlbmd0aDogMiB9LFxuICAgIHM6IHsgdHlwZTogVG9rZW5UeXBlLlNFQ09ORCwgbWF4TGVuZ3RoOiAyIH0sXG4gICAgUzogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05EIH0sXG4gICAgQTogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05EIH0sXG4gICAgejogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA0IH0sXG4gICAgWjogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgTzogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbGVuZ3RoczogWzEsIDRdIH0sXG4gICAgdjogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbGVuZ3RoczogWzEsIDRdIH0sXG4gICAgVjogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA0IH0sXG4gICAgWDogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgeDogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dG9rZW4uanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxuICpcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKi9cblwidXNlIHN0cmljdFwiO1xudmFyIF9fc3ByZWFkQXJyYXlzID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5cykgfHwgZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcbiAgICByZXR1cm4gcjtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlR6RGF0YWJhc2UgPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuVHJhbnNpdGlvbiA9IGV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGV4cG9ydHMuWm9uZUluZm8gPSBleHBvcnRzLlJ1bGVUeXBlID0gZXhwb3J0cy5SdWxlSW5mbyA9IGV4cG9ydHMuQXRUeXBlID0gZXhwb3J0cy5PblR5cGUgPSBleHBvcnRzLlRvVHlwZSA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcbi8qKlxuICogVHlwZSBvZiBydWxlIFRPIGNvbHVtbiB2YWx1ZVxuICovXG52YXIgVG9UeXBlO1xuKGZ1bmN0aW9uIChUb1R5cGUpIHtcbiAgICAvKipcbiAgICAgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxuICAgICAqL1xuICAgIFRvVHlwZVtUb1R5cGVbXCJZZWFyXCJdID0gMF0gPSBcIlllYXJcIjtcbiAgICAvKipcbiAgICAgKiBcIm1heFwiXG4gICAgICovXG4gICAgVG9UeXBlW1RvVHlwZVtcIk1heFwiXSA9IDFdID0gXCJNYXhcIjtcbn0pKFRvVHlwZSA9IGV4cG9ydHMuVG9UeXBlIHx8IChleHBvcnRzLlRvVHlwZSA9IHt9KSk7XG4vKipcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcbiAqL1xudmFyIE9uVHlwZTtcbihmdW5jdGlvbiAoT25UeXBlKSB7XG4gICAgLyoqXG4gICAgICogRGF5LW9mLW1vbnRoIG51bWJlclxuICAgICAqL1xuICAgIE9uVHlwZVtPblR5cGVbXCJEYXlOdW1cIl0gPSAwXSA9IFwiRGF5TnVtXCI7XG4gICAgLyoqXG4gICAgICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXG4gICAgICovXG4gICAgT25UeXBlW09uVHlwZVtcIkxhc3RYXCJdID0gMV0gPSBcIkxhc3RYXCI7XG4gICAgLyoqXG4gICAgICogZS5nLiBcIlN1bj49OFwiXG4gICAgICovXG4gICAgT25UeXBlW09uVHlwZVtcIkdyZXFYXCJdID0gMl0gPSBcIkdyZXFYXCI7XG4gICAgLyoqXG4gICAgICogZS5nLiBcIlN1bjw9OFwiXG4gICAgICovXG4gICAgT25UeXBlW09uVHlwZVtcIkxlcVhcIl0gPSAzXSA9IFwiTGVxWFwiO1xufSkoT25UeXBlID0gZXhwb3J0cy5PblR5cGUgfHwgKGV4cG9ydHMuT25UeXBlID0ge30pKTtcbnZhciBBdFR5cGU7XG4oZnVuY3Rpb24gKEF0VHlwZSkge1xuICAgIC8qKlxuICAgICAqIExvY2FsIHRpbWUgKG5vIERTVClcbiAgICAgKi9cbiAgICBBdFR5cGVbQXRUeXBlW1wiU3RhbmRhcmRcIl0gPSAwXSA9IFwiU3RhbmRhcmRcIjtcbiAgICAvKipcbiAgICAgKiBXYWxsIGNsb2NrIHRpbWUgKGxvY2FsIHRpbWUgd2l0aCBEU1QpXG4gICAgICovXG4gICAgQXRUeXBlW0F0VHlwZVtcIldhbGxcIl0gPSAxXSA9IFwiV2FsbFwiO1xuICAgIC8qKlxuICAgICAqIFV0YyB0aW1lXG4gICAgICovXG4gICAgQXRUeXBlW0F0VHlwZVtcIlV0Y1wiXSA9IDJdID0gXCJVdGNcIjtcbn0pKEF0VHlwZSA9IGV4cG9ydHMuQXRUeXBlIHx8IChleHBvcnRzLkF0VHlwZSA9IHt9KSk7XG4vKipcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKlxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcbiAqL1xudmFyIFJ1bGVJbmZvID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGZyb21cbiAgICAgKiBAcGFyYW0gdG9UeXBlXG4gICAgICogQHBhcmFtIHRvWWVhclxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogQHBhcmFtIGluTW9udGhcbiAgICAgKiBAcGFyYW0gb25UeXBlXG4gICAgICogQHBhcmFtIG9uRGF5XG4gICAgICogQHBhcmFtIG9uV2Vla0RheVxuICAgICAqIEBwYXJhbSBhdEhvdXJcbiAgICAgKiBAcGFyYW0gYXRNaW51dGVcbiAgICAgKiBAcGFyYW0gYXRTZWNvbmRcbiAgICAgKiBAcGFyYW0gYXRUeXBlXG4gICAgICogQHBhcmFtIHNhdmVcbiAgICAgKiBAcGFyYW0gbGV0dGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgZnVuY3Rpb24gUnVsZUluZm8oXG4gICAgLyoqXG4gICAgICogRlJPTSBjb2x1bW4geWVhciBudW1iZXIuXG4gICAgICovXG4gICAgZnJvbSwgXG4gICAgLyoqXG4gICAgICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXG4gICAgICovXG4gICAgdG9UeXBlLCBcbiAgICAvKipcbiAgICAgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cbiAgICAgKi9cbiAgICB0b1llYXIsIFxuICAgIC8qKlxuICAgICAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcbiAgICAgKi9cbiAgICB0eXBlLCBcbiAgICAvKipcbiAgICAgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcbiAgICAgKi9cbiAgICBpbk1vbnRoLCBcbiAgICAvKipcbiAgICAgKiBPTiBjb2x1bW4gdHlwZVxuICAgICAqL1xuICAgIG9uVHlwZSwgXG4gICAgLyoqXG4gICAgICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcbiAgICAgKi9cbiAgICBvbkRheSwgXG4gICAgLyoqXG4gICAgICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XG4gICAgICovXG4gICAgb25XZWVrRGF5LCBcbiAgICAvKipcbiAgICAgKiBBVCBjb2x1bW4gaG91clxuICAgICAqL1xuICAgIGF0SG91ciwgXG4gICAgLyoqXG4gICAgICogQVQgY29sdW1uIG1pbnV0ZVxuICAgICAqL1xuICAgIGF0TWludXRlLCBcbiAgICAvKipcbiAgICAgKiBBVCBjb2x1bW4gc2Vjb25kXG4gICAgICovXG4gICAgYXRTZWNvbmQsIFxuICAgIC8qKlxuICAgICAqIEFUIGNvbHVtbiB0eXBlXG4gICAgICovXG4gICAgYXRUeXBlLCBcbiAgICAvKipcbiAgICAgKiBEU1Qgb2Zmc2V0IGZyb20gbG9jYWwgc3RhbmRhcmQgdGltZSAoTk9UIGZyb20gVVRDISlcbiAgICAgKi9cbiAgICBzYXZlLCBcbiAgICAvKipcbiAgICAgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXG4gICAgICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXG4gICAgICovXG4gICAgbGV0dGVyKSB7XG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XG4gICAgICAgIHRoaXMudG9UeXBlID0gdG9UeXBlO1xuICAgICAgICB0aGlzLnRvWWVhciA9IHRvWWVhcjtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5pbk1vbnRoID0gaW5Nb250aDtcbiAgICAgICAgdGhpcy5vblR5cGUgPSBvblR5cGU7XG4gICAgICAgIHRoaXMub25EYXkgPSBvbkRheTtcbiAgICAgICAgdGhpcy5vbldlZWtEYXkgPSBvbldlZWtEYXk7XG4gICAgICAgIHRoaXMuYXRIb3VyID0gYXRIb3VyO1xuICAgICAgICB0aGlzLmF0TWludXRlID0gYXRNaW51dGU7XG4gICAgICAgIHRoaXMuYXRTZWNvbmQgPSBhdFNlY29uZDtcbiAgICAgICAgdGhpcy5hdFR5cGUgPSBhdFR5cGU7XG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XG4gICAgICAgIHRoaXMubGV0dGVyID0gbGV0dGVyO1xuICAgICAgICBpZiAodGhpcy5zYXZlKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmFwcGxpY2FibGUgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgICBpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGhpcy50b1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlIFRvVHlwZS5ZZWFyOiByZXR1cm4gKHllYXIgPD0gdGhpcy50b1llYXIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cbiAgICAgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGlzIHJ1bGUgZGVwZW5kcyBvbiBhIHdlZWtkYXkgYW5kIHRoZSB3ZWVrZGF5IGluIHF1ZXN0aW9uIGRvZXNuJ3QgZXhpc3RcbiAgICAgKi9cbiAgICBSdWxlSW5mby5wcm90b3R5cGUuZWZmZWN0aXZlTGVzcyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5mcm9tIDwgb3RoZXIuZnJvbSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA+IG90aGVyLmluTW9udGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkgPCBvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNvcnQgY29tcGFyaXNvblxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgaW50ZXJuYWwgc3RydWN0dXJlIG9mIHRoZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5mcm9tICE9PSBvdGhlci5mcm9tKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCAhPT0gb3RoZXIuaW5Nb250aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkuZXF1YWxzKG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHllYXItcmVsYXRpdmUgZGF0ZSB0aGF0IHRoZSBydWxlIHRha2VzIGVmZmVjdC4gRGVwZW5kaW5nIG9uIHRoZSBydWxlIHRoaXMgY2FuIGJlIGEgVVRDIHRpbWUsIGEgd2FsbCBjbG9jayB0aW1lLCBvciBhXG4gICAgICogdGltZSBpbiBzdGFuZGFyZCBvZmZzZXQgKGkuZS4geW91IHN0aWxsIG5lZWQgdG8gY29tcGVuc2F0ZSBmb3IgdGhpcy5hdFR5cGUpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEFwcGxpY2FibGUgaWYgdGhpcyBydWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIHRoZSBnaXZlbiB5ZWFyXG4gICAgICovXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZURhdGUgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJ0aW1lem9uZWNvbXBsZXRlLk5vdEFwcGxpY2FibGVcIiwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluICVkXCIsIHllYXIpO1xuICAgICAgICAvLyB5ZWFyIGFuZCBtb250aCBhcmUgZ2l2ZW5cbiAgICAgICAgdmFyIHkgPSB5ZWFyO1xuICAgICAgICB2YXIgbSA9IHRoaXMuaW5Nb250aDtcbiAgICAgICAgdmFyIGQgPSAwO1xuICAgICAgICAvLyBjYWxjdWxhdGUgZGF5XG4gICAgICAgIHN3aXRjaCAodGhpcy5vblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkRheU51bTpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGQgPSB0aGlzLm9uRGF5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3Mud2Vla0RheU9uT3JBZnRlcih5LCBtLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcl8xLmVycm9ySXMoZSwgXCJOb3RGb3VuZFwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwciBTdW4+PTI3IGFjdHVhbGx5IG1lYW5zIGFueSBzdW5kYXkgYWZ0ZXIgQXByaWwgMjcsIGkuZS4gaXQgZG9lcyBub3QgaGF2ZSB0byBiZSBpbiBBcHJpbC4gVHJ5IG5leHQgbW9udGguXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG0gKyAxIDw9IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0gPSBtICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0gPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0geSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3MuZmlyc3RXZWVrRGF5T2ZNb250aCh5LCBtLCB0aGlzLm9uV2Vla0RheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5MZXFYOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeSwgbSwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JfMS5lcnJvcklzKGUsIFwiTm90Rm91bmRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSA9IG0gLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSA9IDEyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3MubGFzdFdlZWtEYXlPZk1vbnRoKHksIG0sIHRoaXMub25XZWVrRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxhc3RYOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeSwgbSwgdGhpcy5vbldlZWtEYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyh5LCBtLCBkLCB0aGlzLmF0SG91ciwgdGhpcy5hdE1pbnV0ZSwgdGhpcy5hdFNlY29uZCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFZmZlY3RpdmUgZGF0ZSBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXIsIGluIGEgc3BlY2lmaWMgdGltZSB6b25lXG4gICAgICogQHBhcmFtIHllYXJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXQgdGhlIHN0YW5kYXJkIG9mZnNldCBmcm9tIFVUIG9mIHRoZSB0aW1lIHpvbmVcbiAgICAgKiBAcGFyYW0gZHN0T2Zmc2V0IHRoZSBEU1Qgb2Zmc2V0IGJlZm9yZSB0aGUgcnVsZVxuICAgICAqL1xuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVEYXRlVXRjID0gZnVuY3Rpb24gKHllYXIsIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmVmZmVjdGl2ZURhdGUoeWVhcik7XG4gICAgICAgIHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLlV0YzogcmV0dXJuIGQ7XG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDoge1xuICAgICAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aG91dCBEU1RcbiAgICAgICAgICAgICAgICB2YXIgbWlsbGlzID0gZC51bml4TWlsbGlzO1xuICAgICAgICAgICAgICAgIG1pbGxpcyAtPSBzdGFuZGFyZE9mZnNldC5taWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLldhbGw6IHtcbiAgICAgICAgICAgICAgICAvLyB0cmFuc2l0aW9uIHRpbWUgaXMgaW4gem9uZSBsb2NhbCB0aW1lIHdpdGggRFNUXG4gICAgICAgICAgICAgICAgdmFyIG1pbGxpcyA9IGQudW5peE1pbGxpcztcbiAgICAgICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGRzdE9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICBtaWxsaXMgLT0gZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFJ1bGVJbmZvO1xufSgpKTtcbmV4cG9ydHMuUnVsZUluZm8gPSBSdWxlSW5mbztcbi8qKlxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcbiAqL1xudmFyIFJ1bGVUeXBlO1xuKGZ1bmN0aW9uIChSdWxlVHlwZSkge1xuICAgIC8qKlxuICAgICAqIE5vIHJ1bGUgYXBwbGllc1xuICAgICAqL1xuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gICAgLyoqXG4gICAgICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XG4gICAgICovXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJPZmZzZXRcIl0gPSAxXSA9IFwiT2Zmc2V0XCI7XG4gICAgLyoqXG4gICAgICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXG4gICAgICovXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJSdWxlTmFtZVwiXSA9IDJdID0gXCJSdWxlTmFtZVwiO1xufSkoUnVsZVR5cGUgPSBleHBvcnRzLlJ1bGVUeXBlIHx8IChleHBvcnRzLlJ1bGVUeXBlID0ge30pKTtcbi8qKlxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcbiAqXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xuICogYmUgYSBzaW5nbGUgcmVjb3JkIHdpdGggemVybyBvciBtb3JlIGNvbnRpbnVhdGlvbiBsaW5lcy4gVGh1cywgdGhlIGtleXdvcmQsIOKAnFpvbmUs4oCdIGFuZCB0aGUgem9uZSBuYW1lIGFyZSBub3QgcmVwZWF0ZWQuXG4gKiBUaGUgbGFzdCBsaW5lIGlzIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4uXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cbiAqIFRoZSBzdGF0ZSBleGlzdHMgZnJvbSB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgcHJldmlvdXMgbGluZeKAmXMgW1VOVElMXSBjb2x1bW4gdXAgdG8gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIGN1cnJlbnQgbGluZeKAmXNcbiAqIFtVTlRJTF0gY29sdW1uLiBJbiBvdGhlciB3b3JkcywgdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIFtVTlRJTF0gY29sdW1uIGlzIHRoZSBpbnN0YW50IHRoYXQgc2VwYXJhdGVzIHRoaXMgc3RhdGUgZnJvbSB0aGUgbmV4dC5cbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cbiAqIFRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIGxhc3QgbGluZSwgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbiwgY29udGludWVzIHRvIHRoZSBwcmVzZW50LlxuICogVGhlIGZpcnN0IGxpbmUgdHlwaWNhbGx5IHNwZWNpZmllcyB0aGUgbWVhbiBzb2xhciB0aW1lIG9ic2VydmVkIGJlZm9yZSB0aGUgaW50cm9kdWN0aW9uIG9mIHN0YW5kYXJkIHRpbWUuIFNpbmNlIHRoZXJl4oCZcyBubyBsaW5lIGJlZm9yZVxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XG4gKiAyNCBob3VyczsgdGhpcyBjb3JyZXNwb25kcyB0byBhIG1vdmVtZW50IG9mIHRoZSBEYXRlIExpbmUuIEZvciBleGFtcGxlOlxuICogIyBab25lXHROQU1FXHRcdEdNVE9GRlx0UlVMRVNcdEZPUk1BVFx0W1VOVElMXVxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcbiAqIFx0XHRcdCAtODo1Nzo0MSAtXHRMTVRcdC4uLlxuICogV2hlbiBBbGFza2Egd2FzIHB1cmNoYXNlZCBmcm9tIFJ1c3NpYSBpbiAxODY3LCB0aGUgRGF0ZSBMaW5lIG1vdmVkIGZyb20gdGhlIEFsYXNrYS9DYW5hZGEgYm9yZGVyIHRvIHRoZSBCZXJpbmcgU3RyYWl0OyBhbmQgdGhlIHRpbWUgaW5cbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcbiAqIHJlbGlnaW91cyByZWFzb25zLCB3YXMgZm9sbG93ZWQgYnkgYSBzZWNvbmQgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgZGF5IHdpdGggYSBkaWZmZXJlbnQgbmFtZSwgMTggT2N0b2JlciBpbiB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxuICogSXNu4oCZdCBjaXZpbCB0aW1lIHdvbmRlcmZ1bD8gOC0pKTwvYXNpZGU+XG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcbiAqIHVzZWQgZHVyaW5nIHRoZSBwZXJpb2QuIEZ1cnRoZXJtb3JlLCB0aGUgdmFsdWUgaXMgYWxtb3N0IGNlcnRhaW5seSB3cm9uZyBleGNlcHQgaW4gdGhlIGFyY2hldHlwYWwgcGxhY2UgYWZ0ZXIgd2hpY2ggdGhlIHpvbmUgaXMgbmFtZWQuXG4gKiAoVGhlIHR6IGRhdGFiYXNlIHVzdWFsbHkgZG9lc27igJl0IHByb3ZpZGUgYSBzZXBhcmF0ZSBab25lIHJlY29yZCBmb3IgcGxhY2VzIHdoZXJlIG5vdGhpbmcgc2lnbmlmaWNhbnQgaGFwcGVuZWQgYWZ0ZXIgMTk3MC4pXG4gKi9cbnZhciBab25lSW5mbyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBnbXRvZmZcbiAgICAgKiBAcGFyYW0gcnVsZVR5cGVcbiAgICAgKiBAcGFyYW0gcnVsZU9mZnNldFxuICAgICAqIEBwYXJhbSBydWxlTmFtZVxuICAgICAqIEBwYXJhbSBmb3JtYXRcbiAgICAgKiBAcGFyYW0gdW50aWxcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBab25lSW5mbyhcbiAgICAvKipcbiAgICAgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXG4gICAgICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXG4gICAgICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXG4gICAgICovXG4gICAgZ210b2ZmLCBcbiAgICAvKipcbiAgICAgKiBUaGUgUlVMRVMgY29sdW1uIHRlbGxzIHVzIHdoZXRoZXIgZGF5bGlnaHQgc2F2aW5nIHRpbWUgaXMgYmVpbmcgb2JzZXJ2ZWQ6XG4gICAgICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXG4gICAgICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cbiAgICAgKiBTb21lIGFscGhhYmV0aWMgc3RyaW5nIG1lYW5zIHRoYXQgd2UgbWlnaHQgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZDsgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhlIHJ1bGVcbiAgICAgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXG4gICAgICovXG4gICAgcnVsZVR5cGUsIFxuICAgIC8qKlxuICAgICAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhbiBvZmZzZXQsIHRoaXMgaXMgdGhlIG9mZnNldFxuICAgICAqL1xuICAgIHJ1bGVPZmZzZXQsIFxuICAgIC8qKlxuICAgICAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXG4gICAgICovXG4gICAgcnVsZU5hbWUsIFxuICAgIC8qKlxuICAgICAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XG4gICAgICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXG4gICAgICogYSBzaW5nbGUgYWxwaGFiZXRpYyBzdHJpbmcgb3RoZXIgdGhhbiDigJx6enos4oCdIGluIHdoaWNoIGNhc2UgdGhhdOKAmXMgdGhlIGFiYnJldmlhdGlvblxuICAgICAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cbiAgICAgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcbiAgICAgKiBhIHN0cmluZyBjb250YWluaW5nIOKAnCVzLOKAnSBpbiB3aGljaCBjYXNlIHRoZSDigJwlc+KAnSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSB0ZXh0IGluIHRoZSBhcHByb3ByaWF0ZSBSdWxl4oCZcyBMRVRURVIgY29sdW1uXG4gICAgICovXG4gICAgZm9ybWF0LCBcbiAgICAvKipcbiAgICAgKiBVbnRpbCB0aW1lc3RhbXAgaW4gdW5peCB1dGMgbWlsbGlzLiBUaGUgem9uZSBpbmZvIGlzIHZhbGlkIHVwIHRvXG4gICAgICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cbiAgICAgKiBOb3RlIHRoaXMgdmFsdWUgY2FuIGJlIHVuZGVmaW5lZCAoZm9yIHRoZSBmaXJzdCBydWxlKVxuICAgICAqL1xuICAgIHVudGlsKSB7XG4gICAgICAgIHRoaXMuZ210b2ZmID0gZ210b2ZmO1xuICAgICAgICB0aGlzLnJ1bGVUeXBlID0gcnVsZVR5cGU7XG4gICAgICAgIHRoaXMucnVsZU9mZnNldCA9IHJ1bGVPZmZzZXQ7XG4gICAgICAgIHRoaXMucnVsZU5hbWUgPSBydWxlTmFtZTtcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XG4gICAgICAgIHRoaXMudW50aWwgPSB1bnRpbDtcbiAgICAgICAgaWYgKHRoaXMucnVsZU9mZnNldCkge1xuICAgICAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBab25lSW5mbztcbn0oKSk7XG5leHBvcnRzLlpvbmVJbmZvID0gWm9uZUluZm87XG52YXIgVHpNb250aE5hbWVzO1xuKGZ1bmN0aW9uIChUek1vbnRoTmFtZXMpIHtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSmFuXCJdID0gMV0gPSBcIkphblwiO1xuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJGZWJcIl0gPSAyXSA9IFwiRmViXCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk1hclwiXSA9IDNdID0gXCJNYXJcIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiQXByXCJdID0gNF0gPSBcIkFwclwiO1xuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXlcIl0gPSA1XSA9IFwiTWF5XCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkp1blwiXSA9IDZdID0gXCJKdW5cIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVsXCJdID0gN10gPSBcIkp1bFwiO1xuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJBdWdcIl0gPSA4XSA9IFwiQXVnXCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIlNlcFwiXSA9IDldID0gXCJTZXBcIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiT2N0XCJdID0gMTBdID0gXCJPY3RcIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTm92XCJdID0gMTFdID0gXCJOb3ZcIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiRGVjXCJdID0gMTJdID0gXCJEZWNcIjtcbn0pKFR6TW9udGhOYW1lcyB8fCAoVHpNb250aE5hbWVzID0ge30pKTtcbi8qKlxuICogVHVybnMgYSBtb250aCBuYW1lIGZyb20gdGhlIFRaIGRhdGFiYXNlIGludG8gYSBudW1iZXIgMS0xMlxuICogQHBhcmFtIG5hbWVcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIG1vbnRoIG5hbWVcbiAqL1xuZnVuY3Rpb24gbW9udGhOYW1lVG9OdW1iZXIobmFtZSkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDEyOyArK2kpIHtcbiAgICAgICAgaWYgKFR6TW9udGhOYW1lc1tpXSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJJbnZhbGlkIG1vbnRoIG5hbWUgJyVzJ1wiLCBuYW1lKTtcbn1cbnZhciBUekRheU5hbWVzO1xuKGZ1bmN0aW9uIChUekRheU5hbWVzKSB7XG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU3VuXCJdID0gMF0gPSBcIlN1blwiO1xuICAgIFR6RGF5TmFtZXNbVHpEYXlOYW1lc1tcIk1vblwiXSA9IDFdID0gXCJNb25cIjtcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUdWVcIl0gPSAyXSA9IFwiVHVlXCI7XG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiV2VkXCJdID0gM10gPSBcIldlZFwiO1xuICAgIFR6RGF5TmFtZXNbVHpEYXlOYW1lc1tcIlRodVwiXSA9IDRdID0gXCJUaHVcIjtcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJGcmlcIl0gPSA1XSA9IFwiRnJpXCI7XG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU2F0XCJdID0gNl0gPSBcIlNhdFwiO1xufSkoVHpEYXlOYW1lcyB8fCAoVHpEYXlOYW1lcyA9IHt9KSk7XG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXG4gKiAxLCAtMSwgKzEsIDAxLCAxOjAwLCAxOjIzOjI1LjE0M1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcocykge1xuICAgIHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcbn1cbmV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGlzVmFsaWRPZmZzZXRTdHJpbmc7XG4vKipcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxuICovXG52YXIgVHJhbnNpdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBhdFxuICAgICAqIEBwYXJhbSBvZmZzZXRcbiAgICAgKiBAcGFyYW0gbGV0dGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgZnVuY3Rpb24gVHJhbnNpdGlvbihcbiAgICAvKipcbiAgICAgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xuICAgICAqL1xuICAgIGF0LCBcbiAgICAvKipcbiAgICAgKiBOZXcgb2Zmc2V0ICh0eXBlIG9mIG9mZnNldCBkZXBlbmRzIG9uIHRoZSBmdW5jdGlvbilcbiAgICAgKi9cbiAgICBvZmZzZXQsIFxuICAgIC8qKlxuICAgICAqIE5ldyB0aW16b25lIGFiYnJldmlhdGlvbiBsZXR0ZXJcbiAgICAgKi9cbiAgICBsZXR0ZXIpIHtcbiAgICAgICAgdGhpcy5hdCA9IGF0O1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZXR0ZXIgPSBsZXR0ZXI7XG4gICAgICAgIGlmICh0aGlzLm9mZnNldCkge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gVHJhbnNpdGlvbjtcbn0oKSk7XG5leHBvcnRzLlRyYW5zaXRpb24gPSBUcmFuc2l0aW9uO1xuLyoqXG4gKiBPcHRpb24gZm9yIFR6RGF0YWJhc2Ujbm9ybWFsaXplTG9jYWwoKVxuICovXG52YXIgTm9ybWFsaXplT3B0aW9uO1xuKGZ1bmN0aW9uIChOb3JtYWxpemVPcHRpb24pIHtcbiAgICAvKipcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxuICAgICAqL1xuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJVcFwiXSA9IDBdID0gXCJVcFwiO1xuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgU1VCVFJBQ1RJTkcgdGhlIERTVCBvZmZzZXRcbiAgICAgKi9cbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XG59KShOb3JtYWxpemVPcHRpb24gPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiB8fCAoZXhwb3J0cy5Ob3JtYWxpemVPcHRpb24gPSB7fSkpO1xuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIGEgd3JhcHBlciBhcm91bmQgdGltZSB6b25lIGRhdGEgSlNPTiBvYmplY3QgZnJvbSB0aGUgdHpkYXRhIE5QTSBtb2R1bGUuXG4gKiBZb3UgdXN1YWxseSBkbyBub3QgbmVlZCB0byB1c2UgdGhpcyBkaXJlY3RseSwgdXNlIFRpbWVab25lIGFuZCBEYXRlVGltZSBpbnN0ZWFkLlxuICovXG52YXIgVHpEYXRhYmFzZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciAtIGRvIG5vdCB1c2UsIHRoaXMgaXMgYSBzaW5nbGV0b24gY2xhc3MuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKCkgaW5zdGVhZFxuICAgICAqIEB0aHJvd3MgQWxyZWFkeUNyZWF0ZWQgaWYgYW4gaW5zdGFuY2UgYWxyZWFkeSBleGlzdHNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBgZGF0YWAgaXMgZW1wdHkgb3IgaW52YWxpZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFR6RGF0YWJhc2UoZGF0YSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHpvbmUgaW5mbyBjYWNoZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZSA9IHt9O1xuICAgICAgICAvKipcbiAgICAgICAgICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcnVsZUluZm9DYWNoZSA9IHt9O1xuICAgICAgICAvKipcbiAgICAgICAgICogcHJlLWNhbGN1bGF0ZWQgdHJhbnNpdGlvbnMgcGVyIHpvbmVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3pvbmVUcmFuc2l0aW9uc0NhY2hlID0gbmV3IE1hcCgpO1xuICAgICAgICAvKipcbiAgICAgICAgICogcHJlLWNhbGN1bGF0ZWQgdHJhbnNpdGlvbnMgcGVyIHJ1bGVzZXRcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3J1bGVUcmFuc2l0aW9uc0NhY2hlID0gbmV3IE1hcCgpO1xuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJBbHJlYWR5Q3JlYXRlZFwiLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcbiAgICAgICAgYXNzZXJ0XzEuZGVmYXVsdChkYXRhLmxlbmd0aCA+IDAsIFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlRpbWV6b25lY29tcGxldGUgbmVlZHMgdGltZSB6b25lIGRhdGEuIFlvdSBuZWVkIHRvIGluc3RhbGwgb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMgYmVmb3JlIHVzaW5nIHRpbWV6b25lY29tcGxldGUuXCIpO1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHsgem9uZXM6IHt9LCBydWxlczoge30gfTtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICAgIGlmIChkICYmIGQucnVsZXMgJiYgZC56b25lcykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZC5ydWxlcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2RhdGEucnVsZXNba2V5XSA9IGQucnVsZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYiA9IDAsIF9jID0gT2JqZWN0LmtleXMoZC56b25lcyk7IF9iIDwgX2MubGVuZ3RoOyBfYisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gX2NbX2JdO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21pbm1heCA9IHZhbGlkYXRlRGF0YSh0aGlzLl9kYXRhKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogKHJlLSkgaW5pdGlhbGl6ZSB0aW1lem9uZWNvbXBsZXRlIHdpdGggdGltZSB6b25lIGRhdGFcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRhIFRaIGRhdGEgYXMgSlNPTiBvYmplY3QgKGZyb20gb25lIG9mIHRoZSB0emRhdGEgTlBNIG1vZHVsZXMpLlxuICAgICAqICAgICAgICAgICAgIElmIG5vdCBnaXZlbiwgVGltZXpvbmVjb21wbGV0ZSB3aWxsIHNlYXJjaCBmb3IgaW5zdGFsbGVkIG1vZHVsZXMuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYGRhdGFgIG9yIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UuaW5pdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkOyAvLyBuZWVkZWQgZm9yIGFzc2VydCBpbiBjb25zdHJ1Y3RvclxuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgVHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YSA6IFtkYXRhXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZGF0YV8xID0gW107XG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGluIGdsb2JhbCB2YXJpYWJsZXNcbiAgICAgICAgICAgIHZhciBnID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBnID0gd2luZG93O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGcgPSBnbG9iYWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGcgPSBzZWxmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChcInR6ZGF0YVwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGdba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xuICAgICAgICAgICAgdmFyIGZpbmROb2RlTW9kdWxlcyA9IGZ1bmN0aW9uIChyZXF1aXJlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxuICAgICAgICAgICAgICAgICAgICB2YXIgdHpEYXRhTmFtZSA9IFwidHpkYXRhXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gcmVxdWlyZSh0ekRhdGFOYW1lKTsgLy8gdXNlIHZhcmlhYmxlIHRvIGF2b2lkIGJyb3dzZXJpZnkgYWN0aW5nIHVwXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHRyeSBzdWJzZXRzXG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2R1bGVOYW1lcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWFmcmljYVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYW50YXJjdGljYVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYXNpYVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYXVzdHJhbGFzaWFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1iYWNrd2FyZC11dGNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWV0Y2V0ZXJhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldXJvcGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLW5vcnRoYW1lcmljYVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtcGFjaWZpY25ld1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtc291dGhhbWVyaWNhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1zeXN0ZW12XCJcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUobW9kdWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChkYXRhXzEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmROb2RlTW9kdWxlcyhyZXF1aXJlKTsgLy8gbmVlZCB0byBwdXQgcmVxdWlyZSBpbnRvIGEgZnVuY3Rpb24gdG8gbWFrZSB3ZWJwYWNrIGhhcHB5XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgVHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShkYXRhXzEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTaW5nbGUgaW5zdGFuY2Ugb2YgdGhpcyBkYXRhYmFzZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UuaW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuaW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVOYW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl96b25lTmFtZXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3pvbmVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuX2RhdGEuem9uZXMpO1xuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fem9uZU5hbWVzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV4aXN0c1xuICAgICAqIEBwYXJhbSB6b25lTmFtZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmV4aXN0cyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIG5vbi16ZXJvIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG4gICAgICpcbiAgICAgKiBEb2VzIHJldHVybiB6ZXJvIGlmIGEgem9uZU5hbWUgaXMgZ2l2ZW4gYW5kIHRoZXJlIGlzIG5vIERTVCBhdCBhbGwgZm9yIHRoZSB6b25lLlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm1pbkRzdFNhdmUgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh6b25lTmFtZSkge1xuICAgICAgICAgICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICB2YXIgcnVsZU5hbWVzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfMSA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzFbX2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVPZmZzZXQubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSAmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9hID0gMCwgdGVtcF8xID0gdGVtcDsgX2EgPCB0ZW1wXzEubGVuZ3RoOyBfYSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gdGVtcF8xW19hXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4ocnVsZUluZm8uc2F2ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnNhdmUubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmIChlcnJvcl8xLmVycm9ySXMoZSwgW1wiTm90Rm91bmQuUnVsZVwiLCBcIkFyZ3VtZW50Lk5cIl0pKSB7XG4gICAgICAgICAgICAgICAgZSA9IGVycm9yXzEuZXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5tYXhEc3RTYXZlID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoem9uZU5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzIgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzIubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc18yW19pXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIHRlbXBfMiA9IHRlbXA7IF9hIDwgdGVtcF8yLmxlbmd0aDsgX2ErKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBfMltfYV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1heERzdFNhdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3JfMS5lcnJvcklzKGUsIFtcIk5vdEZvdW5kLlJ1bGVcIiwgXCJBcmd1bWVudC5OXCJdKSkge1xuICAgICAgICAgICAgICAgIGUgPSBlcnJvcl8xLmVycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIHpvbmUgaGFzIERTVCBhdCBhbGxcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcbiAgICB9O1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm5leHREc3RDaGFuZ2UgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGEpIHtcbiAgICAgICAgdmFyIHV0Y1RpbWUgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChhKSA6IGEpO1xuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XG4gICAgICAgIHZhciBpdGVyYXRvciA9IHpvbmUuZmluZEZpcnN0KCk7XG4gICAgICAgIGlmIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjID4gdXRjVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcztcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gem9uZS5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0YyA+IHV0Y1RpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xuICAgICAqIFwiRXRjL1VUQ1wiLCBcIkV0Yy9HTVRcIiBvciBcIkV0Yy9VQ1RcIiBpbiB0aGUgVFogZGF0YWJhc2UuIFRoaXMgaXMgdHJ1ZSBlLmcuIGZvclxuICAgICAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZS5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS56b25lSXNVdGMgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xuICAgICAgICAvLyBmb2xsb3cgbGlua3NcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxuICAgICAgICAgICAgICAgICAgICArIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XG4gICAgICAgICAgICB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xuICAgIH07XG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubm9ybWFsaXplTG9jYWwgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGEsIG9wdCkge1xuICAgICAgICBpZiAob3B0ID09PSB2b2lkIDApIHsgb3B0ID0gTm9ybWFsaXplT3B0aW9uLlVwOyB9XG4gICAgICAgIGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciBsb2NhbFRpbWUgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChhKSA6IGEpO1xuICAgICAgICAgICAgLy8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XG4gICAgICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxuICAgICAgICAgICAgLy8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xuICAgICAgICAgICAgLy8gVGhlcmVmb3JlLCBiaW5hcnkgc2VhcmNoaW5nIGlzIG5vdCBwb3NzaWJsZS5cbiAgICAgICAgICAgIC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxuICAgICAgICAgICAgLy8gZ2V0IGFsbCB0cmFuc2l0aW9ucyAobm90ZSB0aGlzIGluY2x1ZGVzIGZha2UgdHJhbnNpdGlvbiBydWxlcyBmb3Igem9uZSBvZmZzZXQgY2hhbmdlcylcbiAgICAgICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHpvbmUudHJhbnNpdGlvbnNJblllYXJzKGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMSk7XG4gICAgICAgICAgICAvLyBmaW5kIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9uc1xuICAgICAgICAgICAgdmFyIHByZXYgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB0cmFuc2l0aW9uc18xID0gdHJhbnNpdGlvbnM7IF9pIDwgdHJhbnNpdGlvbnNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zXzFbX2ldO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5hZGQodHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldCk7XG4gICAgICAgICAgICAgICAgLy8gZm9yd2FyZCB0cmFuc2l0aW9uP1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXQuZ3JlYXRlclRoYW4ocHJldikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQmVmb3JlID0gdHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzICsgcHJldi5taWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQWZ0ZXIgPSB0cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMgKyBvZmZzZXQubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbFRpbWUudW5peE1pbGxpcyA+PSBsb2NhbEJlZm9yZSAmJiBsb2NhbFRpbWUudW5peE1pbGxpcyA8IGxvY2FsQWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3J3YXJkQ2hhbmdlID0gb2Zmc2V0LnN1YihwcmV2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vbi1leGlzdGluZyB0aW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFjdG9yID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLlVwID8gMSA6IC0xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRNaWxsaXMgPSBsb2NhbFRpbWUudW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gcmVzdWx0TWlsbGlzIDogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QocmVzdWx0TWlsbGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldiA9IG9mZnNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG5vIG5vbi1leGlzdGluZyB0aW1lXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IGEgOiBhLmNsb25lKCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXG4gICAgICogVGhyb3dzIGlmIGluZm8gbm90IGZvdW5kLlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXQgPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUpIHtcbiAgICAgICAgdmFyIHpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XG4gICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XG4gICAgICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXG4gICAgICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnRvdGFsT2Zmc2V0ID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XG4gICAgICAgIHZhciB1ID0gdHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWU7XG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcbiAgICAgICAgdmFyIHN0YXRlID0gem9uZS5zdGF0ZUF0KHUpO1xuICAgICAgICByZXR1cm4gc3RhdGUuZHN0T2Zmc2V0LmFkZChzdGF0ZS5zdGFuZGFyZE9mZnNldCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgdGltZSB6b25lIHJ1bGUgYWJicmV2aWF0aW9uLCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXG4gICAgICogTm90ZSB0aGlzIGlzIGRlcGVuZGVudCBvbiB0aGUgdGltZSwgYmVjYXVzZSB3aXRoIHRpbWUgZGlmZmVyZW50IHJ1bGVzIGFyZSBpbiBlZmZlY3RcbiAgICAgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxuICAgICAqIEByZXR1cm5cdFRoZSBhYmJyZXZpYXRpb24gb2YgdGhlIHJ1bGUgdGhhdCBpcyBpbiBlZmZlY3RcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5hYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCkge1xuICAgICAgICBpZiAoZHN0RGVwZW5kZW50ID09PSB2b2lkIDApIHsgZHN0RGVwZW5kZW50ID0gdHJ1ZTsgfVxuICAgICAgICB2YXIgdSA9IHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lO1xuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XG4gICAgICAgIGlmIChkc3REZXBlbmRlbnQpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHpvbmUuc3RhdGVBdCh1KTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5hYmJyZXZpYXRpb247XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgbGFzdE5vbkRzdCA9IHpvbmUuaW5pdGlhbFN0YXRlLmRzdE9mZnNldC5taWxsaXNlY29uZHMoKSA9PT0gMCA/IHpvbmUuaW5pdGlhbFN0YXRlLmFiYnJldmlhdGlvbiA6IFwiXCI7XG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB6b25lLmZpbmRGaXJzdCgpO1xuICAgICAgICAgICAgaWYgKChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQubWlsbGlzZWNvbmRzKCkpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGFzdE5vbkRzdCA9IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuYWJicmV2aWF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPD0gdSkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gem9uZS5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgICAgICAgICAgaWYgKChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQubWlsbGlzZWNvbmRzKCkpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3ROb25Ec3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmFiYnJldmlhdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGFzdE5vbkRzdDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcbiAgICAgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLCBhZ2FpbiBleGNsdWRpbmcgRFNULlxuICAgICAqXG4gICAgICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxuICAgICAqIHRoZW4gdGhlIGZpcnN0IG9jY3VycmVuY2UgaXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmVOYW1lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0TG9jYWwgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGxvY2FsVGltZSkge1xuICAgICAgICB2YXIgdW5peE1pbGxpcyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbG9jYWxUaW1lIDogbG9jYWxUaW1lLnVuaXhNaWxsaXMpO1xuICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc18zID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc18zLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzNbX2ldO1xuICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiB1bml4TWlsbGlzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmVJbmZvLmdtdG9mZi5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJObyB6b25lIGluZm8gZm91bmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXG4gICAgICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxuICAgICAqIG5hbWVseSBkdXJpbmcgYSBiYWNrd2FyZCBEU1QgY2hhbmdlLiBUaGlzIHJldHVybnMgdGhlIEZJUlNUIHN1Y2ggb2Zmc2V0LlxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZU5hbWUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYW4gZXJyb3IgaXMgZGlzY292ZXJlZCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUudG90YWxPZmZzZXRMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgbG9jYWxUaW1lKSB7XG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XG4gICAgICAgIHZhciBub3JtYWxpemVkVG0gPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XG4gICAgICAgIC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgMyAgPC0tIG5vdGUgdGltZSBnb2luZyBCQUNLV0FSRFxuICAgICAgICAvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXG4gICAgICAgIC8vIGFuZCByZXR1cm4gdGhlIGZpcnN0IG9mZnNldCB0aGF0IG1hdGNoZXNcbiAgICAgICAgdmFyIHpvbmUgPSB0aGlzLl9nZXRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUpO1xuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB6b25lLnRyYW5zaXRpb25zSW5ZZWFycyhub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyIC0gMSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciArIDIpO1xuICAgICAgICB2YXIgcHJldjtcbiAgICAgICAgdmFyIHByZXZQcmV2O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHRyYW5zaXRpb25zXzIgPSB0cmFuc2l0aW9uczsgX2kgPCB0cmFuc2l0aW9uc18yLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc18yW19pXTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5hZGQodHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldCk7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzICsgb2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZQcmV2ID0gcHJldjtcbiAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcbiAgICAgICAgICAgIHZhciBwcmV2T2Zmc2V0ID0gcHJldi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHByZXYubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xuICAgICAgICAgICAgdmFyIHByZXZQcmV2T2Zmc2V0ID0gcHJldlByZXYgPyBwcmV2UHJldi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHByZXZQcmV2Lm5ld1N0YXRlLnN0YW5kYXJkT2Zmc2V0KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChwcmV2UHJldiAmJiBwcmV2UHJldk9mZnNldCAhPT0gdW5kZWZpbmVkICYmIHByZXZQcmV2T2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXZPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlXG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBwcmV2UHJldk9mZnNldC5zdWIocHJldk9mZnNldCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXRVdGMudW5peE1pbGxpcyArIHByZXZPZmZzZXQubWlsbGlzZWNvbmRzKClcbiAgICAgICAgICAgICAgICAgICAgJiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0VXRjLnVuaXhNaWxsaXMgKyBwcmV2T2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2UHJldk9mZnNldC5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZPZmZzZXQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldk9mZnNldC5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gem9uZS5zdGF0ZUF0KG5vcm1hbGl6ZWRUbSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUuZHN0T2Zmc2V0LmFkZChzdGF0ZS5zdGFuZGFyZE9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERFUFJFQ0FURUQgYmVjYXVzZSBEU1Qgb2Zmc2V0IGRlcGVuZHMgb24gdGhlIHpvbmUgdG9vLCBub3QganVzdCBvbiB0aGUgcnVsZXNldFxuICAgICAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXBcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5SdWxlIGlmIHJ1bGVOYW1lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmRzdE9mZnNldEZvclJ1bGUgPSBmdW5jdGlvbiAocnVsZU5hbWUsIHV0Y1RpbWUsIHN0YW5kYXJkT2Zmc2V0KSB7XG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXQpO1xuICAgICAgICAvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcbiAgICAgICAgdmFyIG9mZnNldDtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0LmNsb25lKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cbiAgICAgICAgICAgIG9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXG4gICAgICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlTmFtZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5sZXR0ZXJGb3JSdWxlID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCB1dGNUaW1lLCBzdGFuZGFyZE9mZnNldCkge1xuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xuICAgICAgICAvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0KTtcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXG4gICAgICAgIHZhciBsZXR0ZXI7XG4gICAgICAgIGZvciAodmFyIGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKCFsZXR0ZXIpIHtcbiAgICAgICAgICAgIC8vIGFwcGFyZW50bHkgbm8gbG9uZ2VyIERTVCwgYXMgZS5nLiBmb3IgQXNpYS9Ub2t5b1xuICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGV0dGVyO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogREVQUkVDQVRFRCBiZWNhdXNlIERTVCBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgem9uZSB0b28sIG5vdCBqdXN0IG9uIHRoZSBydWxlc2V0XG4gICAgICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcbiAgICAgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFRyYW5zaXRpb25zLCB3aXRoIERTVCBvZmZzZXRzIChubyBzdGFuZGFyZCBvZmZzZXQgaW5jbHVkZWQpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZyb21ZZWFyIGlmIGZyb21ZZWFyID4gdG9ZZWFyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZU5hbWUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYW4gZXJyb3IgaXMgZGlzY292ZXJlZCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyLCBzdGFuZGFyZE9mZnNldCkge1xuICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJBcmd1bWVudC5Gcm9tWWVhclwiLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9nZXRSdWxlVHJhbnNpdGlvbnMocnVsZU5hbWUpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBwcmV2RHN0ID0gZHVyYXRpb25fMS5ob3VycygwKTsgLy8gd3JvbmcsIGJ1dCB0aGF0J3Mgd2h5IHRoZSBmdW5jdGlvbiBpcyBkZXByZWNhdGVkXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHJ1bGVzLmZpbmRGaXJzdCgpO1xuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdC55ZWFyIDw9IHRvWWVhcikge1xuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLnRyYW5zaXRpb24uYXQueWVhciA+PSBmcm9tWWVhciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLmF0LnllYXIgPD0gdG9ZZWFyKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBhdDogcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIHByZXZEc3QpLnVuaXhNaWxsaXMsXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldkRzdCA9IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0O1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlcy5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmF0IC0gYi5hdDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cbiAgICAgKiBBZGRzIGFuIGluaXRpYWwgdHJhbnNpdGlvbiBpZiB0aGVyZSBpcyBub25lIHdpdGhpbiB0aGUgcmFuZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcbiAgICAgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gaW5jbHVkZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gcm9tWWVhciBpZiBmcm9tWWVhciA+IHRvWWVhclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmVOYW1lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyKSB7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcIkFyZ3VtZW50LkZyb21ZZWFyXCIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB2YXIgc3RhcnRTdGF0ZSA9IHpvbmUuc3RhdGVBdChuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGZyb21ZZWFyLCBtb250aDogMSwgZGF5OiAxIH0pKTtcbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgYXQ6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogZnJvbVllYXIgfSkudW5peE1pbGxpcyxcbiAgICAgICAgICAgIGxldHRlcjogc3RhcnRTdGF0ZS5sZXR0ZXIsXG4gICAgICAgICAgICBvZmZzZXQ6IHN0YXJ0U3RhdGUuZHN0T2Zmc2V0LmFkZChzdGFydFN0YXRlLnN0YW5kYXJkT2Zmc2V0KVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gem9uZS5maW5kRmlyc3QoKTtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA8PSB0b1llYXIpIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgPj0gZnJvbVllYXIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGF0OiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMsXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5hZGQoaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yID0gem9uZS5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmF0IC0gYi5hdDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHpvbmUgaW5mbyBmb3IgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuIFRocm93cyBpZiBub3QgZm91bmQuXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxuICAgICAqIEByZXR1cm5zXHRab25lSW5mbyBvYmplY3QuIERvIG5vdCBjaGFuZ2UsIHdlIGNhY2hlIHRoaXMgb2JqZWN0LlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzQgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzQubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfNFtfaV07XG4gICAgICAgICAgICBpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZUluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIk5vdEZvdW5kLlpvbmVcIiwgXCJubyB6b25lIGluZm8gZm91bmQgZm9yIHpvbmUgJyVzJ1wiLCB6b25lTmFtZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUgc29ydGVkIGJ5IFVOVElMLCBhZnRlclxuICAgICAqIGZvbGxvd2luZyBhbnkgbGlua3MuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcbiAgICAgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBkb2VzIG5vdCBleGlzdCBvciBhIGxpbmtlZCB6b25lIGRvZXMgbm90IGV4aXRcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mb3MgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcbiAgICAgICAgLy8gRklSU1QgdmFsaWRhdGUgem9uZSBuYW1lIGJlZm9yZSBzZWFyY2hpbmcgY2FjaGVcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSksIFwiTm90Rm91bmQuWm9uZVwiLCBcInpvbmUgbm90IGZvdW5kOiAnJXMnXCIsIHpvbmVOYW1lKTtcbiAgICAgICAgLy8gVGFrZSBmcm9tIGNhY2hlXG4gICAgICAgIGlmICh0aGlzLl96b25lSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xuICAgICAgICAvLyBmb2xsb3cgbGlua3NcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiTm90Rm91bmQuWm9uZVwiLCBcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmluYWwgem9uZSBpbmZvIGZvdW5kXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUVudHJpZXNfMSA9IHpvbmVFbnRyaWVzOyBfaSA8IHpvbmVFbnRyaWVzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgem9uZUVudHJ5ID0gem9uZUVudHJpZXNfMVtfaV07XG4gICAgICAgICAgICB2YXIgcnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcbiAgICAgICAgICAgIHZhciB1bnRpbCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcbiAgICAgICAgICAgIGlmIChpc05hTih1bnRpbCkpIHtcbiAgICAgICAgICAgICAgICB1bnRpbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLCBydWxlVHlwZSwgcnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbigpLCBydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUgPyB6b25lRW50cnlbMV0gOiBcIlwiLCB6b25lRW50cnlbMl0sIHVudGlsKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIC8vIHNvcnQgdW5kZWZpbmVkIGxhc3RcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhLnVudGlsICE9PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoYS51bnRpbCAtIGIudW50aWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBydWxlIHNldCB3aXRoIHRoZSBnaXZlbiBydWxlIG5hbWUsXG4gICAgICogc29ydGVkIGJ5IGZpcnN0IGVmZmVjdGl2ZSBkYXRlICh1bmNvbXBlbnNhdGVkIGZvciBcIndcIiBvciBcInNcIiBBdFRpbWUpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgcnVsZSBzZXRcbiAgICAgKiBAcmV0dXJuIFJ1bGVJbmZvIGFycmF5LiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5SdWxlIGlmIHJ1bGUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRSdWxlSW5mb3MgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcbiAgICAgICAgLy8gdmFsaWRhdGUgbmFtZSBCRUZPUkUgc2VhcmNoaW5nIGNhY2hlXG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQodGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSksIFwiTm90Rm91bmQuUnVsZVwiLCBcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XG4gICAgICAgIC8vIHJldHVybiBmcm9tIGNhY2hlXG4gICAgICAgIGlmICh0aGlzLl9ydWxlSW5mb0NhY2hlLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICB2YXIgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBydWxlU2V0XzEgPSBydWxlU2V0OyBfaSA8IHJ1bGVTZXRfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVTZXRfMVtfaV07XG4gICAgICAgICAgICAgICAgdmFyIGZyb21ZZWFyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xuICAgICAgICAgICAgICAgIHZhciB0b1R5cGUgPSB0aGlzLnBhcnNlVG9UeXBlKHJ1bGVbMV0pO1xuICAgICAgICAgICAgICAgIHZhciB0b1llYXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XG4gICAgICAgICAgICAgICAgdmFyIG9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XG4gICAgICAgICAgICAgICAgdmFyIG9uRGF5ID0gdGhpcy5wYXJzZU9uRGF5KHJ1bGVbNF0sIG9uVHlwZSk7XG4gICAgICAgICAgICAgICAgdmFyIG9uV2Vla0RheSA9IHRoaXMucGFyc2VPbldlZWtEYXkocnVsZVs0XSk7XG4gICAgICAgICAgICAgICAgdmFyIG1vbnRoTmFtZSA9IHJ1bGVbM107XG4gICAgICAgICAgICAgICAgdmFyIG1vbnRoTnVtYmVyID0gbW9udGhOYW1lVG9OdW1iZXIobW9udGhOYW1lKTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgUnVsZUluZm8oZnJvbVllYXIsIHRvVHlwZSwgdG9ZZWFyLCBydWxlWzJdLCBtb250aE51bWJlciwgb25UeXBlLCBvbkRheSwgb25XZWVrRGF5LCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcbiAgICAgICAgICAgICAgICBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLCB0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLCBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSwgcnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoYS5lZmZlY3RpdmVFcXVhbChiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYS5lZmZlY3RpdmVMZXNzKGIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3JfMS5lcnJvcklzKGUsIFtcIkFyZ3VtZW50LlRvXCIsIFwiQXJndW1lbnQuTlwiLCBcIkFyZ3VtZW50LlZhbHVlXCIsIFwiQXJndW1lbnQuQW1vdW50XCJdKSkge1xuICAgICAgICAgICAgICAgIGUgPSBlcnJvcl8xLmVycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlUnVsZVR5cGUgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICBpZiAocnVsZSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5Ob25lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5PZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUnVsZVR5cGUuUnVsZU5hbWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVG8gZm9yIGludmFsaWQgVE9cbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVRvVHlwZSA9IGZ1bmN0aW9uICh0bykge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuICAgICAgICBpZiAodG8gPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuTWF4O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuWWVhcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJBcmd1bWVudC5Ub1wiLCBcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6ICVzXCIsIHRvKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUGFyc2UgdGhlIE9OIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25UeXBlID0gZnVuY3Rpb24gKG9uKSB7XG4gICAgICAgIGlmIChvbi5sZW5ndGggPiA0ICYmIG9uLnN1YnN0cigwLCA0KSA9PT0gXCJsYXN0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBPblR5cGUuTGFzdFg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBPblR5cGUuTGVxWDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5HcmVxWDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT25UeXBlLkRheU51bTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25EYXkgPSBmdW5jdGlvbiAob24sIG9uVHlwZSkge1xuICAgICAgICBzd2l0Y2ggKG9uVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBPblR5cGUuRGF5TnVtOiByZXR1cm4gcGFyc2VJbnQob24sIDEwKTtcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIjw9XCIpICsgMiksIDEwKTtcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkdyZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI+PVwiKSArIDIpLCAxMCk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkYXktb2Ytd2VlayBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIFN1bmRheSBpZiBub3QgcHJlc2VudC5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZU9uV2Vla0RheSA9IGZ1bmN0aW9uIChvbikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgaWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzaWNzXzEuV2Vla0RheS5TdW5kYXk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSBBVCBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZUF0VHlwZSA9IGZ1bmN0aW9uIChhdCkge1xuICAgICAgICBzd2l0Y2ggKGF0KSB7XG4gICAgICAgICAgICBjYXNlIFwic1wiOiByZXR1cm4gQXRUeXBlLlN0YW5kYXJkO1xuICAgICAgICAgICAgY2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XG4gICAgICAgICAgICBjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcbiAgICAgICAgICAgIGNhc2UgXCJ6XCI6IHJldHVybiBBdFR5cGUuVXRjO1xuICAgICAgICAgICAgY2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xuICAgICAgICAgICAgY2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XG4gICAgICAgICAgICBjYXNlIG51bGw6IHJldHVybiBBdFR5cGUuV2FsbDtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gQXRUeXBlLldhbGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBHZXQgcHJlLWNhbGN1bGF0ZWQgem9uZSB0cmFuc2l0aW9uc1xuICAgICAqIEBwYXJhbSB6b25lTmFtZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgZG9lcyBub3QgZXhpc3Qgb3IgYSBsaW5rZWQgem9uZSBkb2VzIG5vdCBleGl0XG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5fZ2V0Wm9uZVRyYW5zaXRpb25zID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl96b25lVHJhbnNpdGlvbnNDYWNoZS5nZXQoem9uZU5hbWUpO1xuICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IENhY2hlZFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSwgdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpLCB0aGlzLl9nZXRSdWxlVHJhbnNpdGlvbnNGb3Jab25lKHpvbmVOYW1lKSk7XG4gICAgICAgICAgICB0aGlzLl96b25lVHJhbnNpdGlvbnNDYWNoZS5zZXQoem9uZU5hbWUsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEdldCBwcmUtY2FsY3VsYXRlZCBydWxlIHRyYW5zaXRpb25zXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLl9nZXRSdWxlVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3J1bGVUcmFuc2l0aW9uc0NhY2hlLmdldChydWxlTmFtZSk7XG4gICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQ2FjaGVkUnVsZVRyYW5zaXRpb25zKHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKSk7XG4gICAgICAgICAgICB0aGlzLl9ydWxlVHJhbnNpdGlvbnNDYWNoZS5zZXQocnVsZU5hbWUsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBtYXAgb2YgcnVsZU5hbWUtPkNhY2hlZFJ1bGVUcmFuc2l0aW9ucyBmb3IgYWxsIHJ1bGUgc2V0cyB0aGF0IGFyZSByZWZlcmVuY2VkIGJ5IGEgem9uZVxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgZG9lcyBub3QgZXhpc3Qgb3IgYSBsaW5rZWQgem9uZSBkb2VzIG5vdCBleGl0XG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLl9nZXRSdWxlVHJhbnNpdGlvbnNGb3Jab25lID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgTWFwKCk7XG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzUgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzUubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfNVtfaV07XG4gICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuaGFzKHpvbmVJbmZvLnJ1bGVOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuc2V0KHpvbmVJbmZvLnJ1bGVOYW1lLCB0aGlzLl9nZXRSdWxlVHJhbnNpdGlvbnMoem9uZUluZm8ucnVsZU5hbWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIHJldHVybiBUekRhdGFiYXNlO1xufSgpKTtcbmV4cG9ydHMuVHpEYXRhYmFzZSA9IFR6RGF0YWJhc2U7XG4vKipcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgZGF0YVxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YSkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBhc3NlcnRfMS5kZWZhdWx0KHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ0aW1lIHpvbmUgZGF0YSBzaG91bGQgYmUgYW4gb2JqZWN0XCIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ0aW1lIHpvbmUgZGF0YSBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggYSAncnVsZXMnIHByb3BlcnR5XCIpO1xuICAgIGFzc2VydF8xLmRlZmF1bHQoZGF0YS5oYXNPd25Qcm9wZXJ0eShcInpvbmVzXCIpLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ0aW1lIHpvbmUgZGF0YSBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggYSAnem9uZXMnIHByb3BlcnR5XCIpO1xuICAgIC8vIHZhbGlkYXRlIHpvbmVzXG4gICAgZm9yICh2YXIgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xuICAgICAgICBpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciB6b25lQXJyID0gZGF0YS56b25lc1t6b25lTmFtZV07XG4gICAgICAgICAgICBpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUFyciksIFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IGZvciB6b25lIFxcXCIlc1xcXCIgbGlua3MgdG8gXFxcIiVzXFxcIiBidXQgdGhhdCBkb2VzblxcJ3QgZXhpc3RcIiwgem9uZU5hbWUsIHpvbmVBcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgZm9yIHpvbmUgXFxcIiVzXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiLCB6b25lTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB6b25lQXJyW2ldO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBoYXMgbGVuZ3RoICE9IDRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMF0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGdtdG9mZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5tYXhHbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWF4R210T2ZmID0gZ210b2ZmO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWluR210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1pbkdtdE9mZiA9IGdtdG9mZjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyB2YWxpZGF0ZSBydWxlc1xuICAgIGZvciAodmFyIHJ1bGVOYW1lIGluIGRhdGEucnVsZXMpIHtcbiAgICAgICAgaWYgKGRhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgcnVsZUFyciA9IGRhdGEucnVsZXNbcnVsZU5hbWVdO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZUFycikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZUFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZUFycltpXTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhbiBhcnJheVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUubGVuZ3RoIDwgOCkgeyAvLyBub3RlIHNvbWUgcnVsZXMgPiA4IGV4aXN0cyBidXQgdGhhdCBzZWVtcyB0byBiZSBhIGJ1ZyBpbiB0eiBmaWxlIHBhcnNpbmdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBydWxlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdW1wiICsgai50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGEgc3RyaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbMV0gIT09IFwib25seVwiICYmIHJ1bGVbMV0gIT09IFwibWF4XCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVsxXSwgMTApKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMV0gaXMgbm90IGEgbnVtYmVyLCBvbmx5IG9yIG1heFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKCFUek1vbnRoTmFtZXMuaGFzT3duUHJvcGVydHkocnVsZVszXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcl8xLnRocm93RXJyb3IoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IGFuIGFycmF5XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAocnVsZVs1XS5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzFdIGlzIG5vdCBhIG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzYXZlID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihzYXZlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3JfMS50aHJvd0Vycm9yKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNl0gZG9lcyBub3QgY29udGFpbiBhIHZhbGlkIG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNhdmUgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5tYXhEc3RTYXZlID09PSB1bmRlZmluZWQgfHwgc2F2ZSA+IHJlc3VsdC5tYXhEc3RTYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5taW5Ec3RTYXZlID09PSB1bmRlZmluZWQgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluRHN0U2F2ZSA9IHNhdmU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICogUmVhZHktbWFkZSBzb3J0ZWQgcnVsZSB0cmFuc2l0aW9ucyAodW5jb21wZW5zYXRlZCBmb3Igc3Rkb2Zmc2V0LCBhcyBydWxlcyBhcmUgdXNlZCBieSBtdWx0aXBsZSB6b25lcyB3aXRoIGRpZmZlcmVudCBvZmZzZXRzKVxuICovXG52YXIgQ2FjaGVkUnVsZVRyYW5zaXRpb25zID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHJ1bGVJbmZvc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIENhY2hlZFJ1bGVUcmFuc2l0aW9ucyhydWxlSW5mb3MpIHtcbiAgICAgICAgLy8gZGV0ZXJtaW5lIG1heGltdW0geWVhciB0byBjYWxjdWxhdGUgdHJhbnNpdGlvbnMgZm9yXG4gICAgICAgIHZhciBtYXhZZWFyO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHJ1bGVJbmZvc18xID0gcnVsZUluZm9zOyBfaSA8IHJ1bGVJbmZvc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gcnVsZUluZm9zXzFbX2ldO1xuICAgICAgICAgICAgaWYgKHJ1bGVJbmZvLnRvVHlwZSA9PT0gVG9UeXBlLlllYXIpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF4WWVhciA9PT0gdW5kZWZpbmVkIHx8IHJ1bGVJbmZvLnRvWWVhciA+IG1heFllYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4WWVhciA9IHJ1bGVJbmZvLnRvWWVhcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1heFllYXIgPT09IHVuZGVmaW5lZCB8fCBydWxlSW5mby5mcm9tID4gbWF4WWVhcikge1xuICAgICAgICAgICAgICAgICAgICBtYXhZZWFyID0gcnVsZUluZm8uZnJvbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2FsY3VsYXRlIGFsbCB0cmFuc2l0aW9ucyB1bnRpbCAnbWF4JyBydWxlcyB0YWtlIGVmZmVjdFxuICAgICAgICB0aGlzLl90cmFuc2l0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfYSA9IDAsIHJ1bGVJbmZvc18yID0gcnVsZUluZm9zOyBfYSA8IHJ1bGVJbmZvc18yLmxlbmd0aDsgX2ErKykge1xuICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gcnVsZUluZm9zXzJbX2FdO1xuICAgICAgICAgICAgdmFyIG1pbiA9IHJ1bGVJbmZvLmZyb207XG4gICAgICAgICAgICB2YXIgbWF4ID0gcnVsZUluZm8udG9UeXBlID09PSBUb1R5cGUuWWVhciA/IHJ1bGVJbmZvLnRvWWVhciA6IG1heFllYXI7XG4gICAgICAgICAgICBpZiAobWF4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB5ZWFyID0gbWluOyB5ZWFyIDw9IG1heDsgKyt5ZWFyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXQ6IHJ1bGVJbmZvLmVmZmVjdGl2ZURhdGUoeWVhciksXG4gICAgICAgICAgICAgICAgICAgICAgICBhdFR5cGU6IHJ1bGVJbmZvLmF0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBydWxlSW5mby5zYXZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogcnVsZUluZm8ubGV0dGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBzb3J0IHRyYW5zaXRpb25zXG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25zID0gdGhpcy5fdHJhbnNpdGlvbnMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIChhLmF0IDwgYi5hdCA/IC0xIDpcbiAgICAgICAgICAgICAgICBhLmF0ID4gYi5hdCA/IDEgOlxuICAgICAgICAgICAgICAgICAgICAwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHNhdmUgdGhlICdtYXgnIHJ1bGVzIGZvciB0cmFuc2l0aW9ucyBhZnRlciB0aGF0XG4gICAgICAgIHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUgPSBydWxlSW5mb3MuZmlsdGVyKGZ1bmN0aW9uIChpbmZvKSB7IHJldHVybiBpbmZvLnRvVHlwZSA9PT0gVG9UeXBlLk1heDsgfSk7XG4gICAgICAgIHRoaXMuX2ZpbmFsUnVsZXNCeUVmZmVjdGl2ZSA9IF9fc3ByZWFkQXJyYXlzKHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUpO1xuICAgICAgICAvLyBzb3J0IGZpbmFsIHJ1bGVzIGJ5IEZST00gYW5kIHRoZW4gYnkgeWVhci1yZWxhdGl2ZSBkYXRlXG4gICAgICAgIHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUgPSB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIGlmIChhLmZyb20gPCBiLmZyb20pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYS5mcm9tID4gYi5mcm9tKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYWUgPSBhLmVmZmVjdGl2ZURhdGUoYS5mcm9tKTtcbiAgICAgICAgICAgIHZhciBiZSA9IGIuZWZmZWN0aXZlRGF0ZShiLmZyb20pO1xuICAgICAgICAgICAgcmV0dXJuIChhZSA8IGJlID8gLTEgOlxuICAgICAgICAgICAgICAgIGFlID4gYmUgPyAxIDpcbiAgICAgICAgICAgICAgICAgICAgMCk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBzb3J0IGZpbmFsIHJ1bGVzIGJ5IHllYXItcmVsYXRpdmUgZGF0ZVxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlFZmZlY3RpdmUgPSB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHZhciBhZSA9IGEuZWZmZWN0aXZlRGF0ZShhLmZyb20pO1xuICAgICAgICAgICAgdmFyIGJlID0gYi5lZmZlY3RpdmVEYXRlKGIuZnJvbSk7XG4gICAgICAgICAgICByZXR1cm4gKGFlIDwgYmUgPyAtMSA6XG4gICAgICAgICAgICAgICAgYWUgPiBiZSA/IDEgOlxuICAgICAgICAgICAgICAgICAgICAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLCBcImZpbmFsXCIsIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSAnbWF4JyB0eXBlIHJ1bGVzIGF0IHRoZSBlbmQsIHNvcnRlZCBieSB5ZWFyLXJlbGF0aXZlIGVmZmVjdGl2ZSBkYXRlXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maW5hbFJ1bGVzQnlFZmZlY3RpdmU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBldmVyIHRyYW5zaXRpb24gYXMgZGVmaW5lZCBieSB0aGUgcnVsZSBzZXRcbiAgICAgKi9cbiAgICBDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmRGaXJzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcy5fdHJhbnNpdGlvbnNbMF07XG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbixcbiAgICAgICAgICAgICAgICBpbmRleDogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgcnVsZSA9IHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmVbMF07XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBhdDogcnVsZS5lZmZlY3RpdmVEYXRlKHJ1bGUuZnJvbSksXG4gICAgICAgICAgICAgICAgYXRUeXBlOiBydWxlLmF0VHlwZSxcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGUuc2F2ZSxcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBydWxlLmxldHRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbixcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmV4dCB0cmFuc2l0aW9uLCBnaXZlbiBhbiBpdGVyYXRvclxuICAgICAqIEBwYXJhbSBwcmV2IHRoZSBpdGVyYXRvclxuICAgICAqL1xuICAgIENhY2hlZFJ1bGVUcmFuc2l0aW9ucy5wcm90b3R5cGUuZmluZE5leHQgPSBmdW5jdGlvbiAocHJldikge1xuICAgICAgICBpZiAoIXByZXYuZmluYWwgJiYgcHJldi5pbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAocHJldi5pbmRleCA8IHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb25zW3ByZXYuaW5kZXggKyAxXTtcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBwcmV2LmluZGV4ICsgMVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGZpbmQgbWluaW11bSBhcHBsaWNhYmxlIGZpbmFsIHJ1bGUgYWZ0ZXIgdGhlIHByZXYgdHJhbnNpdGlvblxuICAgICAgICB2YXIgZm91bmQ7XG4gICAgICAgIHZhciBmb3VuZEVmZmVjdGl2ZTtcbiAgICAgICAgZm9yICh2YXIgeWVhciA9IHByZXYudHJhbnNpdGlvbi5hdC55ZWFyOyB5ZWFyIDwgcHJldi50cmFuc2l0aW9uLmF0LnllYXIgKyAyOyArK3llYXIpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9maW5hbFJ1bGVzQnlFZmZlY3RpdmU7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUuYXBwbGljYWJsZSh5ZWFyKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWZmZWN0aXZlID0gcnVsZS5lZmZlY3RpdmVEYXRlKHllYXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWZmZWN0aXZlID4gcHJldi50cmFuc2l0aW9uLmF0ICYmICghZm91bmRFZmZlY3RpdmUgfHwgZWZmZWN0aXZlIDwgZm91bmRFZmZlY3RpdmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJ1bGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZEVmZmVjdGl2ZSA9IGVmZmVjdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZm91bmQgJiYgZm91bmRFZmZlY3RpdmUpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgIGF0OiBmb3VuZEVmZmVjdGl2ZSxcbiAgICAgICAgICAgICAgICBhdFR5cGU6IGZvdW5kLmF0VHlwZSxcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGZvdW5kLnNhdmUsXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogZm91bmQubGV0dGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uLFxuICAgICAgICAgICAgICAgIGZpbmFsOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBEaXJ0eSBmaW5kIGZ1bmN0aW9uIHRoYXQgb25seSB0YWtlcyBhIHN0YW5kYXJkIG9mZnNldCBmcm9tIFVUQyBpbnRvIGFjY291bnRcbiAgICAgKiBAcGFyYW0gYmVmb3JlVXRjIHRpbWVzdGFtcCB0byBzZWFyY2ggZm9yXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0IHpvbmUgc3RhbmRhcmQgb2Zmc2V0IHRvIGFwcGx5XG4gICAgICovXG4gICAgQ2FjaGVkUnVsZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kTGFzdExlc3NFcXVhbCA9IGZ1bmN0aW9uIChiZWZvcmVVdGMsIHN0YW5kYXJkT2Zmc2V0KSB7XG4gICAgICAgIHZhciBwcmV2VHJhbnNpdGlvbjtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcbiAgICAgICAgdmFyIGVmZmVjdGl2ZVV0YyA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPyBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgdW5kZWZpbmVkKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGVmZmVjdGl2ZVV0YyAmJiBlZmZlY3RpdmVVdGMgPD0gYmVmb3JlVXRjKSB7XG4gICAgICAgICAgICBwcmV2VHJhbnNpdGlvbiA9IGl0ZXJhdG9yLnRyYW5zaXRpb247XG4gICAgICAgICAgICBpdGVyYXRvciA9IHRoaXMuZmluZE5leHQoaXRlcmF0b3IpO1xuICAgICAgICAgICAgZWZmZWN0aXZlVXRjID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA/IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCB1bmRlZmluZWQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcmV2VHJhbnNpdGlvbjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGFmdGVyVXRjXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XG4gICAgICogQHBhcmFtIGRzdE9mZnNldFxuICAgICAqL1xuICAgIENhY2hlZFJ1bGVUcmFuc2l0aW9ucy5wcm90b3R5cGUuZmlyc3RUcmFuc2l0aW9uV2l0aG91dERzdEFmdGVyID0gZnVuY3Rpb24gKGFmdGVyVXRjLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgLy8gdG9kbyBpbmVmZmljaWVudCAtIG9wdGltaXplXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuZmluZEZpcnN0KCk7XG4gICAgICAgIHZhciBlZmZlY3RpdmVVdGMgPSAoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24pID8gcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIDogdW5kZWZpbmVkO1xuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgZWZmZWN0aXZlVXRjICYmICghKChfYSA9IGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubmV3U3RhdGUuZHN0T2Zmc2V0Lnplcm8oKSkgfHwgZWZmZWN0aXZlVXRjIDw9IGFmdGVyVXRjKSkge1xuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgICAgIGVmZmVjdGl2ZVV0YyA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPyBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIGRzdE9mZnNldCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uO1xuICAgIH07XG4gICAgcmV0dXJuIENhY2hlZFJ1bGVUcmFuc2l0aW9ucztcbn0oKSk7XG4vKipcbiAqIFJ1bGVzIGRlcGVuZCBvbiBwcmV2aW91cyBydWxlcywgaGVuY2UgeW91IGNhbm5vdCBjYWxjdWxhdGUgRFNUIHRyYW5zaXRpb25zIHdpdG91dCBzdGFydGluZyBhdCB0aGUgc3RhcnQuXG4gKiBOZXh0IHRvIHRoYXQsIHpvbmVzIHNvbWV0aW1lcyB0cmFuc2l0aW9uIGludG8gdGhlIG1pZGRsZSBvZiBhIHJ1bGUgc2V0LlxuICogRHVlIHRvIHRoaXMsIHdlIG1haW50YWluIGEgY2FjaGUgb2YgdHJhbnNpdGlvbnMgZm9yIHpvbmVzXG4gKi9cbnZhciBDYWNoZWRab25lVHJhbnNpdGlvbnMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcbiAgICAgKiBAcGFyYW0gem9uZUluZm9zXG4gICAgICogQHBhcmFtIHJ1bGVzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGFcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWm9uZUluZm9zIGlmIHpvbmVJbmZvcyBpcyBlbXB0eVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIENhY2hlZFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSwgem9uZUluZm9zLCBydWxlcykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGFzc2VydF8xLmRlZmF1bHQoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwidGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ab25lSW5mb3NcIiwgXCJ6b25lICclcycgd2l0aG91dCBpbmZvcm1hdGlvblwiLCB6b25lTmFtZSk7XG4gICAgICAgIHRoaXMuX2ZpbmFsWm9uZUluZm8gPSB6b25lSW5mb3Nbem9uZUluZm9zLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLl9pbml0aWFsU3RhdGUgPSB0aGlzLl9jYWxjSW5pdGlhbFN0YXRlKHpvbmVOYW1lLCB6b25lSW5mb3MsIHJ1bGVzKTtcbiAgICAgICAgX2EgPSB0aGlzLl9jYWxjVHJhbnNpdGlvbnMoem9uZU5hbWUsIHRoaXMuX2luaXRpYWxTdGF0ZSwgem9uZUluZm9zLCBydWxlcyksIHRoaXMuX3RyYW5zaXRpb25zID0gX2FbMF0sIHRoaXMuX2ZpbmFsUnVsZXMgPSBfYVsxXTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhY2hlZFpvbmVUcmFuc2l0aW9ucy5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5pdGlhbFN0YXRlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgZmlyc3QgdHJhbnNpdGlvbiwgaWYgaXQgZXhpc3RzXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl90cmFuc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMuX3RyYW5zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIGluZGV4OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGaW5kIG5leHQgdHJhbnNpdGlvbiwgaWYgaXQgZXhpc3RzXG4gICAgICogQHBhcmFtIGl0ZXJhdG9yIHByZXZpb3VzIGl0ZXJhdG9yXG4gICAgICogQHJldHVybnMgdGhlIG5leHQgaXRlcmF0b3JcbiAgICAgKi9cbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yKSB7XG4gICAgICAgIGlmICghaXRlcmF0b3IuZmluYWwpIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5pbmRleCA8IHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLl90cmFuc2l0aW9uc1tpdGVyYXRvci5pbmRleCArIDFdLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogaXRlcmF0b3IuaW5kZXggKyAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZm91bmQ7XG4gICAgICAgIGZvciAodmFyIHkgPSBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXI7IHkgPCBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgKyAyOyArK3kpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9maW5hbFJ1bGVzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0VXRjOiBydWxlSW5mby5lZmZlY3RpdmVEYXRlVXRjKHksIGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQsIGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHRoaXMuX2ZpbmFsWm9uZUluZm8uZm9ybWF0LCBydWxlSW5mby5zYXZlLm5vblplcm8oKSwgcnVsZUluZm8ubGV0dGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IHJ1bGVJbmZvLmxldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGVJbmZvLnNhdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXRVdGMgPiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZvdW5kIHx8IGZvdW5kLmF0VXRjID4gdHJhbnNpdGlvbi5hdFV0Yykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogZm91bmQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgZmluYWw6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHpvbmUgc3RhdGUgYXQgdGhlIGdpdmVuIFVUQyB0aW1lXG4gICAgICogQHBhcmFtIHV0Y1xuICAgICAqL1xuICAgIENhY2hlZFpvbmVUcmFuc2l0aW9ucy5wcm90b3R5cGUuc3RhdGVBdCA9IGZ1bmN0aW9uICh1dGMpIHtcbiAgICAgICAgdmFyIHByZXZTdGF0ZSA9IHRoaXMuX2luaXRpYWxTdGF0ZTtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPD0gdXRjKSB7XG4gICAgICAgICAgICBwcmV2U3RhdGUgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJldlN0YXRlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHRyYW5zaXRpb25zIGluIHllYXIgW3N0YXJ0LCBlbmQpXG4gICAgICogQHBhcmFtIHN0YXJ0IHN0YXJ0IHllYXIgKGluY2x1c2l2ZSlcbiAgICAgKiBAcGFyYW0gZW5kIGVuZCB5ZWFyIChleGNsdXNpdmUpXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS50cmFuc2l0aW9uc0luWWVhcnMgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAgICAgICAvLyBjaGVjayBpZiBzdGFydC0xIGlzIHdpdGhpbiB0aGUgaW5pdGlhbCB0cmFuc2l0aW9ucyBvciBub3QuIFdlIHVzZSBzdGFydC0xIGJlY2F1c2Ugd2UgdGFrZSBhbiBleHRyYSB5ZWFyIGluIHRoZSBlbHNlIGNsYXVzZSBiZWxvd1xuICAgICAgICB2YXIgZmluYWwgPSAodGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoID09PSAwIHx8IHRoaXMuX3RyYW5zaXRpb25zW3RoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCAtIDFdLmF0VXRjLnllYXIgPCBzdGFydCAtIDEpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGlmICghZmluYWwpIHtcbiAgICAgICAgICAgIC8vIHNpbXBseSBkbyBsaW5lYXIgc2VhcmNoXG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLmZpbmRGaXJzdCgpO1xuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA8IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgPj0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlcmF0b3IudHJhbnNpdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gdGhpcy5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnNXaXRoUnVsZXMgPSBbXTtcbiAgICAgICAgICAgIC8vIERvIHNvbWV0aGluZyBzbWFydDogZmlyc3QgZ2V0IGFsbCB0cmFuc2l0aW9ucyB3aXRoIGF0VXRjIE5PVCBjb21wZW5zYXRlZCBmb3Igc3RhbmRhcmQgb2Zmc2V0XG4gICAgICAgICAgICAvLyBUYWtlIGFuIGV4dHJhIHllYXIgYmVmb3JlIHN0YXJ0XG4gICAgICAgICAgICBmb3IgKHZhciB5ZWFyID0gc3RhcnQgLSAxOyB5ZWFyIDwgZW5kOyArK3llYXIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5fZmluYWxSdWxlczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5ZWFyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRVdGM6IHJ1bGVJbmZvLmVmZmVjdGl2ZURhdGVVdGMoeWVhciwgdGhpcy5fZmluYWxab25lSW5mby5nbXRvZmYsIGR1cmF0aW9uXzEuaG91cnMoMCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih0aGlzLl9maW5hbFpvbmVJbmZvLmZvcm1hdCwgcnVsZUluZm8uc2F2ZS5ub25aZXJvKCksIHJ1bGVJbmZvLmxldHRlciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogcnVsZUluZm8ubGV0dGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGVJbmZvLnNhdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiB0aGlzLl9maW5hbFpvbmVJbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uc1dpdGhSdWxlcy5wdXNoKHsgdHJhbnNpdGlvbjogdHJhbnNpdGlvbiwgcnVsZUluZm86IHJ1bGVJbmZvIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhbnNpdGlvbnNXaXRoUnVsZXMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMgLSBiLnRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpczsgfSk7XG4gICAgICAgICAgICAvLyBub3cgYXBwbHkgRFNUIG9mZnNldCByZXRyb2FjdGl2ZWx5XG4gICAgICAgICAgICB2YXIgcHJldkRzdCA9IGR1cmF0aW9uXzEuaG91cnMoMCk7XG4gICAgICAgICAgICBmb3IgKHZhciBfYiA9IDAsIHRyYW5zaXRpb25zV2l0aFJ1bGVzXzEgPSB0cmFuc2l0aW9uc1dpdGhSdWxlczsgX2IgPCB0cmFuc2l0aW9uc1dpdGhSdWxlc18xLmxlbmd0aDsgX2IrKykge1xuICAgICAgICAgICAgICAgIHZhciB0ciA9IHRyYW5zaXRpb25zV2l0aFJ1bGVzXzFbX2JdO1xuICAgICAgICAgICAgICAgIGlmICh0ci5ydWxlSW5mby5hdFR5cGUgPT09IEF0VHlwZS5XYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyLnRyYW5zaXRpb24uYXRVdGMgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0ci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMgLSBwcmV2RHN0Lm1pbGxpc2Vjb25kcygpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJldkRzdCA9IHRyLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmICh0ci50cmFuc2l0aW9uLmF0VXRjLnllYXIgPj0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godHIudHJhbnNpdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGUgdGhlIGluaXRpYWwgc3RhdGUgZm9yIHRoZSB6b25lXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXG4gICAgICogQHBhcmFtIGluZm9zXG4gICAgICogQHBhcmFtIHJ1bGVzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGFcbiAgICAgKi9cbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLl9jYWxjSW5pdGlhbFN0YXRlID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBpbmZvcywgcnVsZXMpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICAvLyBpbml0aWFsIHN0YXRlXG4gICAgICAgIGlmIChpbmZvcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiBcIlwiLFxuICAgICAgICAgICAgICAgIGxldHRlcjogXCJcIixcbiAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMCksXG4gICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZm8gPSBpbmZvc1swXTtcbiAgICAgICAgc3dpdGNoIChpbmZvLnJ1bGVUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKGluZm8uZm9ybWF0LCBmYWxzZSwgdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMCksXG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiBpbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk9mZnNldDpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24oaW5mby5mb3JtYXQsIGluZm8ucnVsZU9mZnNldC5ub25aZXJvKCksIHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBpbmZvLnJ1bGVPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiBpbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlcy5nZXQoaW5mby5ydWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFydWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ6b25lICclcycgcmVmZXJzIHRvIG5vbi1leGlzdGluZyBydWxlICclcydcIiwgem9uZU5hbWUsIGluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBmaW5kIGZpcnN0IHJ1bGUgdHJhbnNpdGlvbiB3aXRob3V0IERTVCBzbyB0aGF0IHdlIGhhdmUgYSBsZXR0ZXJcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBydWxlLmZpbmRGaXJzdCgpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5ub25aZXJvKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGxldHRlciA9IChfYSA9IGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlcikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24oaW5mby5mb3JtYXQsIGZhbHNlLCBsZXR0ZXIpLFxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IGR1cmF0aW9uXzEuaG91cnMoMCksXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogbGV0dGVyLFxuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogaW5mby5nbXRvZmZcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBhc3NlcnRfMS5kZWZhdWx0KGZhbHNlLCBcInRpbWV6b25lY29tcGxldGUuQXNzZXJ0aW9uXCIsIFwiVW5rbm93biBSdWxlVHlwZVwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUHJlLWNhbGN1bGF0ZSBhbGwgdHJhbnNpdGlvbnMgdW50aWwgdGhlcmUgYXJlIG9ubHkgJ21heCcgcnVsZXMgaW4gZWZmZWN0XG4gICAgICogQHBhcmFtIHpvbmVOYW1lXG4gICAgICogQHBhcmFtIGluaXRpYWxTdGF0ZVxuICAgICAqIEBwYXJhbSB6b25lSW5mb3NcbiAgICAgKiBAcGFyYW0gcnVsZXNcbiAgICAgKi9cbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLl9jYWxjVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGluaXRpYWxTdGF0ZSwgem9uZUluZm9zLCBydWxlcykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICh6b25lSW5mb3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW1tdLCBbXV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gd2FsayB0aHJvdWdoIHRoZSB6b25lIHJlY29yZHMgYW5kIGFkZCBhIHRyYW5zaXRpb24gZm9yIGVhY2hcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gW107XG4gICAgICAgIHZhciBwcmV2U3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gICAgICAgIHZhciBwcmV2VW50aWw7XG4gICAgICAgIHZhciBwcmV2UnVsZXM7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzYgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzYubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfNltfaV07XG4gICAgICAgICAgICAvLyB6b25lcyBjYW4gaGF2ZSBhIERTVCBvZmZzZXQgb3IgdGhleSBjYW4gcmVmZXIgdG8gYSBydWxlIHNldFxuICAgICAgICAgICAgc3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuTm9uZTpcbiAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk9mZnNldDpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZVbnRpbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdFV0YzogcHJldlVudGlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHpvbmVJbmZvLmZvcm1hdCwgZmFsc2UsIHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5Ob25lID8gZHVyYXRpb25fMS5ob3VycygwKSA6IHpvbmVJbmZvLnJ1bGVPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogem9uZUluZm8uZ210b2ZmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2UnVsZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlcy5nZXQoem9uZUluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFydWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yXzEudGhyb3dFcnJvcihcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJab25lICclcycgcmVmZXJzIHRvIG5vbi1leGlzdGluZyBydWxlICclcydcIiwgem9uZU5hbWUsIHpvbmVJbmZvLnJ1bGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ID0gdGhpcy5fem9uZVRyYW5zaXRpb25zKHByZXZVbnRpbCwgem9uZUluZm8sIHJ1bGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbnMgPSB0cmFuc2l0aW9ucy5jb25jYXQodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2UnVsZXMgPSBydWxlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydF8xLmRlZmF1bHQoZmFsc2UsIFwidGltZXpvbmVjb21wbGV0ZS5Bc3NlcnRpb25cIiwgXCJVbmtub3duIFJ1bGVUeXBlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldlVudGlsID0gem9uZUluZm8udW50aWwgIT09IHVuZGVmaW5lZCA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHpvbmVJbmZvLnVudGlsKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHByZXZTdGF0ZSA9IHRyYW5zaXRpb25zLmxlbmd0aCA+IDAgPyB0cmFuc2l0aW9uc1t0cmFuc2l0aW9ucy5sZW5ndGggLSAxXS5uZXdTdGF0ZSA6IHByZXZTdGF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3RyYW5zaXRpb25zLCAoX2EgPSBwcmV2UnVsZXMgPT09IG51bGwgfHwgcHJldlJ1bGVzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcmV2UnVsZXMuZmluYWwpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFtdXTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYWxsIHRoZSB0cmFuc2l0aW9ucyBmb3IgYSB0aW1lIHpvbmUgZnJvbSBmcm9tVXRjIChpbmNsdXNpdmUpIHRvIHpvbmVJbmZvLnVudGlsIChleGNsdXNpdmUpLlxuICAgICAqIFRoZSByZXN1bHQgYWx3YXlzIGNvbnRhaW5zIGFuIGluaXRpYWwgdHJhbnNpdGlvbiBhdCBmcm9tVXRjIHRoYXQgc2lnbmFscyB0aGUgc3dpdGNoIHRvIHRoaXMgcnVsZSBzZXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmcm9tVXRjIHByZXZpb3VzIHpvbmUgc3ViLXJlY29yZCBVTlRJTCB0aW1lOyB1bmRlZmluZWQgZm9yIGZpcnN0IHpvbmUgcmVjb3JkXG4gICAgICogQHBhcmFtIHpvbmVJbmZvIHRoZSBjdXJyZW50IHpvbmUgc3ViLXJlY29yZFxuICAgICAqIEBwYXJhbSBydWxlIHRoZSBjb3JyZXNwb25kaW5nIHJ1bGUgdHJhbnNpdGlvbnNcbiAgICAgKi9cbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLl96b25lVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoZnJvbVV0Yywgem9uZUluZm8sIHJ1bGUpIHtcbiAgICAgICAgLy8gZnJvbSB0ei1ob3ctdG8uaHRtbDpcbiAgICAgICAgLy8gT25lIHdyaW5rbGUsIG5vdCBmdWxseSBleHBsYWluZWQgaW4gemljLjgudHh0LCBpcyB3aGF0IGhhcHBlbnMgd2hlbiBzd2l0Y2hpbmcgdG8gYSBuYW1lZCBydWxlLiBUbyB3aGF0IHZhbHVlcyBzaG91bGQgdGhlIFNBVkUgYW5kXG4gICAgICAgIC8vIExFVFRFUiBkYXRhIGJlIGluaXRpYWxpemVkP1xuICAgICAgICAvLyAtIElmIGF0IGxlYXN0IG9uZSB0cmFuc2l0aW9uIGhhcyBoYXBwZW5lZCwgdXNlIHRoZSBTQVZFIGFuZCBMRVRURVIgZGF0YSBmcm9tIHRoZSBtb3N0IHJlY2VudC5cbiAgICAgICAgLy8gLSBJZiBzd2l0Y2hpbmcgdG8gYSBuYW1lZCBydWxlIGJlZm9yZSBhbnkgdHJhbnNpdGlvbiBoYXMgaGFwcGVuZWQsIGFzc3VtZSBzdGFuZGFyZCB0aW1lIChTQVZFIHplcm8pLCBhbmQgdXNlIHRoZSBMRVRURVIgZGF0YSBmcm9tXG4gICAgICAgIC8vIHRoZSBlYXJsaWVzdCB0cmFuc2l0aW9uIHdpdGggYSBTQVZFIG9mIHplcm8uXG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAvLyBleHRyYSBpbml0aWFsIHRyYW5zaXRpb24gZm9yIHN3aXRjaCB0byB0aGlzIHJ1bGUgc2V0IChidXQgbm90IGZvciBmaXJzdCB6b25lIGluZm8pXG4gICAgICAgIHZhciBpbml0aWFsO1xuICAgICAgICBpZiAoZnJvbVV0YyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID0gcnVsZS5maW5kTGFzdExlc3NFcXVhbChmcm9tVXRjLCB6b25lSW5mby5nbXRvZmYpO1xuICAgICAgICAgICAgaWYgKGluaXRpYWxSdWxlVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgIGluaXRpYWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIGF0VXRjOiBmcm9tVXRjLFxuICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHpvbmVJbmZvLmZvcm1hdCwgZmFsc2UsIGluaXRpYWxSdWxlVHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiAoX2EgPSBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBkdXJhdGlvbl8xLmhvdXJzKDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGluaXRpYWxSdWxlVHJhbnNpdGlvbiA9IHJ1bGUuZmlyc3RUcmFuc2l0aW9uV2l0aG91dERzdEFmdGVyKGZyb21VdGMsIHpvbmVJbmZvLmdtdG9mZiwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBpbml0aWFsID0ge1xuICAgICAgICAgICAgICAgICAgICBhdFV0YzogZnJvbVV0YyxcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCBpbml0aWFsUnVsZVRyYW5zaXRpb24gPT09IG51bGwgfHwgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogKF9iID0gaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSBudWxsIHx8IGluaXRpYWxSdWxlVHJhbnNpdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW5pdGlhbFJ1bGVUcmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlcikgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogZHVyYXRpb25fMS5ob3VycygwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiB6b25lSW5mby5nbXRvZmZcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQucHVzaChpbml0aWFsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhY3R1YWwgcnVsZSB0cmFuc2l0aW9uczsga2VlcCBhZGRpbmcgdW50aWwgdGhlIGVuZCBvZiB0aGlzIHpvbmUgaW5mbywgb3IgdW50aWwgb25seSAnbWF4JyBydWxlcyByZW1haW5cbiAgICAgICAgdmFyIHByZXZEc3QgPSAoX2MgPSBpbml0aWFsID09PSBudWxsIHx8IGluaXRpYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGluaXRpYWwubmV3U3RhdGUuZHN0T2Zmc2V0KSAhPT0gbnVsbCAmJiBfYyAhPT0gdm9pZCAwID8gX2MgOiBkdXJhdGlvbl8xLmhvdXJzKDApO1xuICAgICAgICB2YXIgaXRlcmF0b3IgPSBydWxlLmZpbmRGaXJzdCgpO1xuICAgICAgICB2YXIgZWZmZWN0aXZlID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSAmJiBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCB6b25lSW5mby5nbXRvZmYsIHByZXZEc3QpO1xuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgZWZmZWN0aXZlICYmXG4gICAgICAgICAgICAoKHpvbmVJbmZvLnVudGlsICYmIGVmZmVjdGl2ZS51bml4TWlsbGlzIDwgem9uZUluZm8udW50aWwpIHx8ICghem9uZUluZm8udW50aWwgJiYgIWl0ZXJhdG9yLmZpbmFsKSkpIHtcbiAgICAgICAgICAgIHByZXZEc3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldDtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBhdFV0YzogZWZmZWN0aXZlLFxuICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIHByZXZEc3Qubm9uWmVybygpLCBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlciksXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogKF9kID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpICE9PSBudWxsICYmIF9kICE9PSB2b2lkIDAgPyBfZCA6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcHJldkRzdCxcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgICAgIGVmZmVjdGl2ZSA9IGl0ZXJhdG9yICYmIHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yLnRyYW5zaXRpb24sIHpvbmVJbmZvLmdtdG9mZiwgcHJldkRzdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICAgIHJldHVybiBDYWNoZWRab25lVHJhbnNpdGlvbnM7XG59KCkpO1xuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIGZvcm1hdHRlZCBhYmJyZXZpYXRpb24gZm9yIGEgem9uZVxuICogQHBhcmFtIGZvcm1hdCB0aGUgYWJicmV2aWF0aW9uIGZvcm1hdCBzdHJpbmcuIEVpdGhlciAnenp6LCcgZm9yIE5VTEw7ICAnQS9CJyBmb3Igc3RkL2RzdCwgb3IgJ0Elc0InIGZvciBhIGZvcm1hdCBzdHJpbmcgd2hlcmUgJXMgaXNcbiAqIHJlcGxhY2VkIGJ5IGEgbGV0dGVyXG4gKiBAcGFyYW0gZHN0IHdoZXRoZXIgRFNUIGlzIG9ic2VydmVkXG4gKiBAcGFyYW0gbGV0dGVyIGN1cnJlbnQgcnVsZSBsZXR0ZXIsIGVtcHR5IGlmIG5vIHJ1bGVcbiAqIEByZXR1cm5zIGZ1bGx5IGZvcm1hdHRlZCBhYmJyZXZpYXRpb25cbiAqL1xuZnVuY3Rpb24gem9uZUFiYnJldmlhdGlvbihmb3JtYXQsIGRzdCwgbGV0dGVyKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gXCJ6enosXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGlmIChmb3JtYXQuaW5jbHVkZXMoXCIvXCIpKSB7XG4gICAgICAgIHJldHVybiAoZHN0ID8gZm9ybWF0LnNwbGl0KFwiL1wiKVsxXSA6IGZvcm1hdC5zcGxpdChcIi9cIilbMF0pO1xuICAgIH1cbiAgICBpZiAobGV0dGVyKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIGxldHRlcik7XG4gICAgfVxuICAgIHJldHVybiBmb3JtYXQucmVwbGFjZShcIiVzXCIsIFwiXCIpO1xufVxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIFVUQyB0aW1lIG9mIGEgcnVsZSB0cmFuc2l0aW9uLCBnaXZlbiBhIHBhcnRpY3VsYXIgdGltZSB6b25lXG4gKiBAcGFyYW0gdHJhbnNpdGlvblxuICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0IHpvbmUgb2Zmc2V0IGZyb20gVVRcbiAqIEBwYXJhbSBkc3RPZmZzZXQgcHJldmlvdXMgRFNUIG9mZnNldCBmcm9tIFVUK3N0YW5kYXJkT2Zmc2V0XG4gKiBAcmV0dXJucyBVVEMgdGltZVxuICovXG5mdW5jdGlvbiBydWxlVHJhbnNpdGlvblV0Yyh0cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSB7XG4gICAgc3dpdGNoICh0cmFuc2l0aW9uLmF0VHlwZSkge1xuICAgICAgICBjYXNlIEF0VHlwZS5VdGM6IHJldHVybiB0cmFuc2l0aW9uLmF0O1xuICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDoge1xuICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiB0aW1lIGlzIGluIHpvbmUgbG9jYWwgdGltZSB3aXRob3V0IERTVFxuICAgICAgICAgICAgdmFyIG1pbGxpcyA9IHRyYW5zaXRpb24uYXQudW5peE1pbGxpcztcbiAgICAgICAgICAgIG1pbGxpcyAtPSBzdGFuZGFyZE9mZnNldC5taWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgQXRUeXBlLldhbGw6IHtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aCBEU1RcbiAgICAgICAgICAgIHZhciBtaWxsaXMgPSB0cmFuc2l0aW9uLmF0LnVuaXhNaWxsaXM7XG4gICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICBpZiAoZHN0T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgbWlsbGlzIC09IGRzdE9mZnNldC5taWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHotZGF0YWJhc2UuanMubWFwIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxuICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9iYXNpY3NcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9kdXJhdGlvblwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZm9ybWF0XCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9nbG9iYWxzXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9sb2NhbGVcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3BhcnNlXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9wZXJpb2RcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2Jhc2ljc1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vdGltZXpvbmVcIiksIGV4cG9ydHMpO1xudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkF0VHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5BdFR5cGU7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJpc1ZhbGlkT2Zmc2V0U3RyaW5nXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLmlzVmFsaWRPZmZzZXRTdHJpbmc7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJOb3JtYWxpemVPcHRpb25cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiUnVsZUluZm9cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuUnVsZUluZm87IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJSdWxlVHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5SdWxlVHlwZTsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIk9uVHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5PblR5cGU7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJUb1R5cGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVG9UeXBlOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiVHJhbnNpdGlvblwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5UcmFuc2l0aW9uOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiVHpEYXRhYmFzZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiWm9uZUluZm9cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuWm9uZUluZm87IH0gfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXX0=
