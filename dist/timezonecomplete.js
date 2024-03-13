(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Copyright(c) 2016 ABB Switzerland Ltd.
 */
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
        error_1.throwError.apply(void 0, __spreadArray([name, format], args, false));
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
})(WeekDay || (exports.WeekDay = WeekDay = {}));
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
})(TimeUnit || (exports.TimeUnit = TimeUnit = {}));
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
            return (0, error_1.throwError)("Argument.Unit", "unknown time unit %d", unit);
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
        return (0, error_1.throwError)("Argument.Unit", "invalid time unit %d", unit);
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
    return (0, error_1.throwError)("Argument.S", "Unknown time unit string '%s'", s);
}
exports.stringToTimeUnit = stringToTimeUnit;
/**
 * @return True iff the given year is a leap year.
 * @throws timezonecomplete.Argument.Year if year is not integer
 */
function isLeapYear(year) {
    (0, assert_1.default)(Number.isInteger(year), "Argument.Year", "Invalid year %d", year);
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
            return (0, error_1.throwError)("Argument.Month", "Invalid month: %d", month);
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
    (0, assert_1.default)(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    (0, assert_1.default)(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    (0, assert_1.default)(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
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
    (0, assert_1.default)(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    (0, assert_1.default)(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    (0, assert_1.default)(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
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
    (0, assert_1.default)(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    (0, assert_1.default)(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    (0, assert_1.default)(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
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
    (0, assert_1.default)(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    (0, assert_1.default)(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    (0, assert_1.default)(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
    (0, assert_1.default)(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
    var start = new TimeStruct({ year: year, month: month, day: day });
    var startWeekDay = weekDayNoLeapSecs(start.unixMillis);
    var diff = weekDay - startWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    (0, assert_1.default)(start.components.day + diff <= daysInMonth(year, month), "NotFound", "The given month has no such weekday");
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
    (0, assert_1.default)(Number.isInteger(year), "Argument.Year", "Year out of range: %d", year);
    (0, assert_1.default)(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", "Month out of range: %d", month);
    (0, assert_1.default)(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
    (0, assert_1.default)(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", "weekDay out of range: %d", weekDay);
    var start = new TimeStruct({ year: year, month: month, day: day });
    var startWeekDay = weekDayNoLeapSecs(start.unixMillis);
    var diff = weekDay - startWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    (0, assert_1.default)(start.components.day + diff >= 1, "NotFound", "The given month has no such weekday");
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
    (0, assert_1.default)(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
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
    (0, assert_1.default)(Number.isInteger(unixMillis), "Argument.UnixMillis", "unixMillis should be an integer number");
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
    (0, assert_1.default)(Number.isInteger(input.year), "Argument.Year", "invalid year %d", input.year);
    (0, assert_1.default)(Number.isInteger(input.month) && input.month >= 1 && input.month <= 12, "Argument.Month", "invalid month %d", input.month);
    (0, assert_1.default)(Number.isInteger(input.day) && input.day >= 1 && input.day <= daysInMonth(input.year, input.month), "Argument.Day", "invalid day %d", input.day);
    (0, assert_1.default)(Number.isInteger(input.hour) && input.hour >= 0 && input.hour <= 23, "Argument.Hour", "invalid hour %d", input.hour);
    (0, assert_1.default)(Number.isInteger(input.minute) && input.minute >= 0 && input.minute <= 59, "Argument.Minute", "invalid minute %d", input.minute);
    (0, assert_1.default)(Number.isInteger(input.second) && input.second >= 0 && input.second <= 59, "Argument.Second", "invalid second %d", input.second);
    (0, assert_1.default)(Number.isInteger(input.milli) && input.milli >= 0 && input.milli <= 999, "Argument.Milli", "invalid milli %d", input.milli);
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
    (0, assert_1.default)(Number.isInteger(unixMillis), "Argument.UnixMillis", "unixMillis should be an integer number");
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
    (0, assert_1.default)(Number.isInteger(hour) && hour >= 0 && hour <= 23, "Argument.Hour", "invalid hour %d", hour);
    (0, assert_1.default)(Number.isInteger(minute) && minute >= 0 && minute <= 59, "Argument.Minute", "invalid minute %d", minute);
    (0, assert_1.default)(Number.isInteger(second) && second >= 0 && second <= 61, "Argument.Second", "invalid second %d", second);
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
            (0, assert_1.default)(Number.isInteger(a), "Argument.UnixMillis", "invalid unix millis %d", a);
            this._unixMillis = a;
        }
        else {
            (0, assert_1.default)(typeof a === "object" && a !== null, "Argument.Components", "invalid components object");
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
            (0, assert_1.default)(split.length >= 1 && split.length <= 2, "Argument.S", "Empty string or multiple dots.");
            // parse main part
            var isBasicFormat = (s.indexOf("-") === -1);
            if (isBasicFormat) {
                (0, assert_1.default)(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/), "Argument.S", "ISO string in basic notation may only contain numbers before the fractional part");
                // remove any "T" separator
                split[0] = split[0].replace("T", "");
                (0, assert_1.default)([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1, "Argument.S", "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
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
                (0, assert_1.default)(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Argument.S", "Invalid ISO string");
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
                (0, assert_1.default)([4, 10].indexOf(dateAndTime[0].length) !== -1, "Argument.S", "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
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
            if ((0, error_1.errorIs)(e, [
                "Argument.S", "Argument.Year", "Argument.Month", "Argument.Day", "Argument.Hour",
                "Argument.Minute", "Argument.Second", "Argument.Milli"
            ])) {
                return (0, error_1.throwError)("Argument.S", "Invalid ISO 8601 string: \"%s\": %s", s, e.message);
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
                        (0, assert_1.default)(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A3", "for unix timestamp datetime constructor, third through 8th argument must be undefined");
                        (0, assert_1.default)(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "DateTime.DateTime(): second arg should be a TimeZone object.");
                        // unix timestamp constructor
                        this._zone = (typeof (a2) === "object" && isTimeZone(a2) ? a2 : undefined);
                        var unixMillis = (0, error_1.convertError)("Argument.UnixMillis", function () { return math.roundSym(a1); });
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(new basics_1.TimeStruct(unixMillis));
                        }
                        else {
                            this._zoneDate = new basics_1.TimeStruct(unixMillis);
                        }
                    }
                    else {
                        // year month day constructor
                        (0, assert_1.default)(typeof (a2) === "number", "Argument.Year", "DateTime.DateTime(): Expect month to be a number.");
                        (0, assert_1.default)(typeof (a3) === "number", "Argument.Month", "DateTime.DateTime(): Expect day to be a number.");
                        (0, assert_1.default)(timeZone === undefined || timeZone === null || isTimeZone(timeZone), "Argument.TimeZone", "DateTime.DateTime(): eighth arg should be a TimeZone object.");
                        var year_1 = a1;
                        var month_1 = a2;
                        var day_1 = a3;
                        var hour_1 = (typeof (h) === "number" ? h : 0);
                        var minute_1 = (typeof (m) === "number" ? m : 0);
                        var second_1 = (typeof (s) === "number" ? s : 0);
                        var milli_1 = (typeof (ms) === "number" ? ms : 0);
                        year_1 = (0, error_1.convertError)("Argument.Year", function () { return math.roundSym(year_1); });
                        month_1 = (0, error_1.convertError)("Argument.Month", function () { return math.roundSym(month_1); });
                        day_1 = (0, error_1.convertError)("Argument.Day", function () { return math.roundSym(day_1); });
                        hour_1 = (0, error_1.convertError)("Argument.Hour", function () { return math.roundSym(hour_1); });
                        minute_1 = (0, error_1.convertError)("Argument.Minute", function () { return math.roundSym(minute_1); });
                        second_1 = (0, error_1.convertError)("Argument.Second", function () { return math.roundSym(second_1); });
                        milli_1 = (0, error_1.convertError)("Argument.Milli", function () { return math.roundSym(milli_1); });
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
                        (0, assert_1.default)(h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A4", "first two arguments are a string, therefore the fourth through 8th argument must be undefined");
                        (0, assert_1.default)(a3 === undefined || a3 === null || isTimeZone(a3), "Argument.TimeZone", "DateTime.DateTime(): third arg should be a TimeZone object.");
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
                        (0, assert_1.default)(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A3", "first arguments is a string and the second is not, therefore the third through 8th argument must be undefined");
                        (0, assert_1.default)(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "DateTime.DateTime(): second arg should be a TimeZone object.");
                        var givenString = a1.trim();
                        var ss = DateTime._splitDateFromTimeZone(givenString);
                        (0, assert_1.default)(ss.length === 2, "Argument.S", "Invalid date string given: \"" + a1 + "\"");
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
                        (0, assert_1.default)(h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A4", "first argument is a Date, therefore the fourth through 8th argument must be undefined");
                        (0, assert_1.default)(typeof (a2) === "number" && (a2 === javascript_1.DateFunctions.Get || a2 === javascript_1.DateFunctions.GetUTC), "Argument.GetFuncs", "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                        (0, assert_1.default)(a3 === undefined || a3 === null || isTimeZone(a3), "Argument.TimeZone", "DateTime.DateTime(): third arg should be a TimeZone object.");
                        var d = (a1);
                        var dk = (a2);
                        this._zone = (a3 ? a3 : undefined);
                        this._zoneDate = basics_1.TimeStruct.fromDate(d, dk);
                        if (this._zone) {
                            this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
                        }
                    }
                    else { // a1 instanceof TimeStruct
                        (0, assert_1.default)(a3 === undefined && h === undefined && m === undefined
                            && s === undefined && ms === undefined && timeZone === undefined, "Argument.A3", "first argument is a TimeStruct, therefore the third through 8th argument must be undefined");
                        (0, assert_1.default)(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "expect a TimeZone as second argument");
                        this._zoneDate = a1.clone();
                        this._zone = (a2 ? a2 : undefined);
                    }
                }
                break;
            case "undefined":
                {
                    (0, assert_1.default)(a2 === undefined && a3 === undefined && h === undefined && m === undefined
                        && s === undefined && ms === undefined && timeZone === undefined, "Argument.A2", "first argument is undefined, therefore the rest must also be undefined");
                    // nothing given, make local datetime
                    this._zone = timezone_1.TimeZone.local();
                    this._utcDate = basics_1.TimeStruct.fromDate(DateTime.timeSource.now(), javascript_1.DateFunctions.GetUTC);
                }
                break;
            /* istanbul ignore next */
            default:
                /* istanbul ignore next */
                throw (0, error_1.error)("Argument.A1", "DateTime.DateTime(): unexpected first argument type.");
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
        (0, assert_1.default)(Number.isFinite(n), "Argument.N", "invalid number");
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
                return (0, error_1.throwError)("UnawareToAwareConversion", "DateTime.toZone(): Cannot convert unaware date to an aware date");
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
            (0, assert_1.default)(this._zone, "UnawareToAwareConversion", "DateTime.toZone(): Cannot convert unaware date to an aware date");
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
        (0, assert_1.default)(Number.isFinite(amount), "Argument.Amount", "amount must be a finite number");
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
                (0, assert_1.default)(math.isInt(amount), "Argument.Amount", "Cannot add/sub a non-integer amount of months");
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
                (0, assert_1.default)(math.isInt(amount), "Argument.Amount", "Cannot add/sub a non-integer amount of years");
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
                return (0, error_1.throwError)("Argument.Unit", "invalid time unit");
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
            if (!(0, error_1.errorIs)(e, "InvalidTimeZoneData")) {
                e = (0, error_1.error)("ParseError", e.message);
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
            (0, assert_1.default)(Number.isFinite(amount), "Argument.Amount", "amount should be finite: %d", amount);
            this._amount = amount;
            this._unit = (typeof unit === "number" ? unit : basics_1.TimeUnit.Millisecond);
            (0, assert_1.default)(Number.isInteger(this._unit) && this._unit >= 0 && this._unit < basics_1.TimeUnit.MAX, "Argument.Unit", "Invalid time unit %d", this._unit);
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
                (0, assert_1.default)(parts.length > 0 && parts.length < 4, "Argument.S", "Not a proper time duration string: \"" + trimmed + "\"");
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
                (0, assert_1.default)(split.length === 2, "Argument.S", "Invalid time string '%s'", s);
                var amount = parseFloat(split[0]);
                (0, assert_1.default)(Number.isFinite(amount), "Argument.S", "Invalid time string '%s', cannot parse amount", s);
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
            (0, assert_1.default)(false, "Argument.Amount", "invalid constructor arguments");
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
            (0, assert_1.default)(Number.isFinite(value) && value !== 0, "Argument.Value", "cannot divide by %d", value);
            return new Duration(this._amount / value, this._unit);
        }
        else {
            (0, assert_1.default)(value.amount() !== 0, "Argument.Value", "cannot divide by 0");
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
    var tokens = (0, token_1.tokenize)(formatString);
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid quarter pattern");
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid month pattern");
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
    (0, assert_1.default)(d1, "Argument.D1", "first argument is falsy");
    (0, assert_1.default)(d2, "Argument.D2", "second argument is falsy");
    /* istanbul ignore next */
    (0, assert_1.default)(d1.kind === d2.kind, "Argument.D2", "expected either two datetimes or two durations");
    return d1.min(d2);
}
exports.min = min;
/**
 * Returns the maximum of two DateTimes or Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
function max(d1, d2) {
    (0, assert_1.default)(d1, "Argument.D1", "first argument is falsy");
    (0, assert_1.default)(d2, "Argument.D2", "second argument is falsy");
    /* istanbul ignore next */
    (0, assert_1.default)(d1.kind === d2.kind, "Argument.D2", "expected either two datetimes or two durations");
    return d1.max(d2);
}
exports.max = max;
/**
 * Returns the absolute value of a Duration
 * @throws timezonecomplete.Argument.D if d is undefined/null
 */
function abs(d) {
    (0, assert_1.default)(d, "Argument.D", "first argument is falsy");
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
})(DateFunctions || (exports.DateFunctions = DateFunctions = {}));

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
    (0, assert_1.default)(Number.isFinite(n), "Argument.N", "n must be a finite number but is: %d", n);
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
    (0, assert_1.default)(Number.isFinite(value), "Argument.Value", "value should be finite");
    (0, assert_1.default)(Number.isFinite(modulo) && modulo >= 1, "Argument.Modulo", "modulo should be >= 1");
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
        return (0, error_1.throwError)("ParseError", "no date given");
    }
    if (!formatString) {
        return (0, error_1.throwError)("Argument.FormatString", "no format given");
    }
    var mergedLocale = __assign(__assign({}, locale_1.DEFAULT_LOCALE), locale);
    var yearCutoff = (0, math_1.positiveModulo)((new Date().getFullYear() + 50), 100);
    try {
        var tokens = (0, token_1.tokenize)(formatString);
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
                                time.minute = Math.floor((0, math_1.positiveModulo)(pnr.n / 60E3, 60));
                                time.second = Math.floor((0, math_1.positiveModulo)(pnr.n / 1000, 60));
                                time.milli = (0, math_1.positiveModulo)(pnr.n, 1000);
                                break;
                            /* istanbul ignore next */
                            default:
                                /* istanbul ignore next */
                                return (0, error_1.throwError)("ParseError", "unsupported second format '".concat(token.raw, "'"));
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
                        return (0, error_1.throwError)("ParseError", "invalid time, contains 'noon' specifier but time differs from noon");
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
                        return (0, error_1.throwError)("ParseError", "invalid time, contains 'midnight' specifier but time differs from midnight");
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
                    return (0, error_1.throwError)("ParseError", "the quarter does not match the month");
                }
            }
        }
        if (time.year === undefined) {
            time.year = 1970;
        }
        var result = { time: new basics_1.TimeStruct(time), zone: zone };
        if (!result.time.validate()) {
            return (0, error_1.throwError)("ParseError", "invalid resulting date");
        }
        // always overwrite zone with given zone
        if (overrideZone) {
            result.zone = overrideZone;
        }
        if (remaining && !allowTrailing) {
            return (0, error_1.throwError)("ParseError", "invalid date '".concat(dateTimeString, "' not according to format '").concat(formatString, "': trailing characters: '").concat(remaining, "'"));
        }
        return result;
    }
    catch (e) {
        return (0, error_1.throwError)("ParseError", "invalid date '".concat(dateTimeString, "' not according to format '").concat(formatString, "': ").concat(e.message));
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
        return (0, error_1.throwError)("NotImplemented", "time zone pattern '" + token.raw + "' is not implemented");
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
            return (0, error_1.throwError)("ParseError", "invalid time zone 'GMT" + zoneString + "'");
        }
        try {
            result.zone = timezone_1.TimeZone.zone(zoneString);
        }
        catch (e) {
            if ((0, error_1.errorIs)(e, ["Argument.S", "NotFound.Zone"])) {
                e = (0, error_1.error)("ParseError", e.message);
            }
            throw e;
        }
    }
    else {
        return (0, error_1.throwError)("ParseError", "no time zone given");
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
        return (0, error_1.throwError)("ParseError", "expected '".concat(expected, "'"));
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
    return (0, error_1.throwError)("ParseError", "missing day period i.e. " + Object.keys(offsets).join(", "));
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid quarter pattern");
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid quarter pattern");
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid quarter pattern");
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid month pattern");
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid month pattern");
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
            return (0, error_1.throwError)("Argument.FormatString", "invalid seconds pattern");
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
        return (0, error_1.throwError)("ParseError", "expected a number but got '".concat(numberString, "'"));
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
    return (0, error_1.throwError)("ParseError", "invalid " + token_1.TokenType[token.type].toLowerCase() + ", expected one of " + allowed.join(", "));
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
})(PeriodDst || (exports.PeriodDst = PeriodDst = {}));
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
            return (0, error_1.throwError)("Argument.P", "invalid PerioDst value %d", p);
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
        if ((0, datetime_1.isDateTime)(a)) {
            reference = a;
            if (typeof (amountOrInterval) === "object") {
                interval = amountOrInterval;
                dst = unitOrDst;
            }
            else {
                (0, assert_1.default)(typeof unitOrDst === "number" && unitOrDst >= 0 && unitOrDst < basics_1.TimeUnit.MAX, "Argument.Unit", "Invalid unit");
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
                return (0, error_1.throwError)("Argument.Json", e);
            }
        }
        (0, assert_1.default)(dst >= 0 && dst < PeriodDst.MAX, "Argument.Dst", "Invalid PeriodDst setting");
        (0, assert_1.default)(interval.amount() > 0, "Argument.Interval", "Amount must be positive non-zero.");
        (0, assert_1.default)(Number.isInteger(interval.amount()), "Argument.Interval", "Amount must be a whole number");
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
                    (0, assert_1.default)(this._intInterval.amount() < 86400000, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Second:
                    (0, assert_1.default)(this._intInterval.amount() < 86400, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Minute:
                    (0, assert_1.default)(this._intInterval.amount() < 1440, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
                        "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case basics_1.TimeUnit.Hour:
                    (0, assert_1.default)(this._intInterval.amount() < 24, "Argument.Interval.NotImplemented", "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
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
        (0, assert_1.default)(!!this._intReference.zone() === !!fromDate.zone(), "UnawareToAwareConversion", "The fromDate and reference date must both be aware or unaware");
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
                            return (0, error_1.throwError)("Assertion", "Unknown TimeUnit");
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
                            return (0, error_1.throwError)("Assertion", "Unknown TimeUnit");
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
                            return (0, error_1.throwError)("Assertion", "Unknown TimeUnit");
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
                            return (0, error_1.throwError)("Assertion", "Unknown TimeUnit");
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
        (0, assert_1.default)(!!prev, "Argument.Prev", "Prev must be given");
        (0, assert_1.default)(!!this._intReference.zone() === !!prev.zone(), "UnawareToAwareConversion", "The fromDate and referenceDate must both be aware or unaware");
        (0, assert_1.default)(Number.isInteger(count), "Argument.Count", "Count must be an integer number");
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
            if ((0, error_1.errorIs)(e, "Argument.Prev")) {
                e = (0, error_1.error)("Argument.Next", e.message);
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
        (0, assert_1.default)(!!this._intReference.zone() === !!occurrence.zone(), "UnawareToAwareConversion", "The occurrence and referenceDate must both be aware or unaware");
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
    (0, assert_1.default)(opts.hour >= 0 && opts.hour < 24, "Argument.Hour", "opts.hour should be within [0..23]");
    (0, assert_1.default)(opts.minute === undefined || (opts.minute >= 0 && opts.minute < 60 && Number.isInteger(opts.minute)), "Argument.Minute", "opts.minute should be within [0..59]");
    (0, assert_1.default)(opts.second === undefined || (opts.second >= 0 && opts.second < 60 && Number.isInteger(opts.second)), "Argument.Second", "opts.second should be within [0..59]");
    (0, assert_1.default)(opts.millisecond === undefined || (opts.millisecond >= 0 && opts.millisecond < 1000 && Number.isInteger(opts.millisecond)), "Argument.Millisecond", "opts.millisecond should be within [0.999]");
    (0, assert_1.default)(opts.weekday >= 0 && opts.weekday < 7, "Argument.Weekday", "opts.weekday should be within [0..6]");
    // tslint:enable: max-line-length
    var midnight = opts.reference.startOfDay();
    while (midnight.weekDay() !== opts.weekday) {
        midnight = midnight.addLocal((0, duration_1.days)(1));
    }
    var dt = new datetime_1.DateTime(midnight.year(), midnight.month(), midnight.day(), opts.hour, (_a = opts.minute) !== null && _a !== void 0 ? _a : 0, (_b = opts.second) !== null && _b !== void 0 ? _b : 0, (_c = opts.millisecond) !== null && _c !== void 0 ? _c : 0, opts.reference.zone());
    if (dt < opts.reference) {
        // we've started out on the correct weekday and the reference timestamp was greater than the given time, need to skip a week
        return dt.addLocal((0, duration_1.days)(7));
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
    (0, assert_1.default)(opts.hour >= 0 && opts.hour < 24, "Argument.Hour", "opts.hour should be within [0..23]");
    (0, assert_1.default)(opts.minute === undefined || (opts.minute >= 0 && opts.minute < 60 && Number.isInteger(opts.minute)), "Argument.Minute", "opts.minute should be within [0..59]");
    (0, assert_1.default)(opts.second === undefined || (opts.second >= 0 && opts.second < 60 && Number.isInteger(opts.second)), "Argument.Second", "opts.second should be within [0..59]");
    (0, assert_1.default)(opts.millisecond === undefined || (opts.millisecond >= 0 && opts.millisecond < 1000 && Number.isInteger(opts.millisecond)), "Argument.Millisecond", "opts.millisecond should be within [0.999]");
    (0, assert_1.default)(opts.weekday >= 0 && opts.weekday < 7, "Argument.Weekday", "opts.weekday should be within [0..6]");
    // tslint:enable: max-line-length
    var midnight = opts.reference.startOfDay().addLocal((0, duration_1.days)(1));
    while (midnight.weekDay() !== opts.weekday) {
        midnight = midnight.subLocal((0, duration_1.days)(1));
    }
    var dt = new datetime_1.DateTime(midnight.year(), midnight.month(), midnight.day(), opts.hour, (_a = opts.minute) !== null && _a !== void 0 ? _a : 0, (_b = opts.second) !== null && _b !== void 0 ? _b : 0, (_c = opts.millisecond) !== null && _c !== void 0 ? _c : 0, opts.reference.zone());
    if (dt >= opts.reference) {
        // we've started out on the correct weekday and the reference timestamp was less than the given time, need to skip a week
        return dt.subLocal((0, duration_1.days)(7));
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
    (0, assert_1.default)(Number.isInteger(width) && width >= 0, "Argument.Width", "width should be an integer number >= 0 but is: %d", width);
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
    (0, assert_1.default)(Number.isInteger(width) && width >= 0, "Argument.Width", "width should be an integer number >= 0 but is: %d", width);
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
})(TimeZoneKind || (exports.TimeZoneKind = TimeZoneKind = {}));
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
            (0, assert_1.default)(tz_database_1.TzDatabase.instance().exists(name), "NotFound.Zone", "non-existing time zone name '%s'", name);
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
                    (0, assert_1.default)(offset > -24 * 60 && offset < 24 * 60, "Argument.Offset", "TimeZone.zone(): offset out of range");
                    name = TimeZone.offsetToString(offset);
                }
                break;
            /* istanbul ignore next */
            default:
                (0, error_1.throwError)("Argument.A", "unexpected type for first argument: %s", typeof a);
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
                return (0, error_1.throwError)("Assertion", "unknown time zone kind");
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
        (0, assert_1.default)(Number.isFinite(offset) && offset >= -24 * 60 && offset <= 24 * 60, "Argument.Offset", "invalid offset %d", offset);
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
        (0, assert_1.default)(t.match(/^[+-]\d$/) || t.match(/^[+-]\d\d$/) || t.match(/^[+-]\d\d(:?)\d\d$/), "Argument.S", "Wrong time zone format: \"" + t + "\"");
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
        (0, assert_1.default)(hours >= 0 && hours < 24, "Argument.S", "Invalid time zone (hours out of range): '".concat(t, "'"));
        (0, assert_1.default)(minutes >= 0 && minutes < 60, "Argument.S", "Invalid time zone (minutes out of range): '".concat(t, "'"));
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
        (0, assert_1.default)(t.length > 0, "Argument.S", "Empty time zone string given");
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
                if ((0, error_1.errorIs)(e, "Argument.Offset")) {
                    e = (0, error_1.error)("Argument.S", e.message);
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
})(TokenType || (exports.TokenType = TokenType = {}));
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
})(ToType || (exports.ToType = ToType = {}));
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
})(OnType || (exports.OnType = OnType = {}));
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
})(AtType || (exports.AtType = AtType = {}));
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
        (0, assert_1.default)(this.applicable(year), "timezonecomplete.NotApplicable", "Rule is not applicable in %d", year);
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
                        if ((0, error_1.errorIs)(e, "NotFound")) {
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
                        if ((0, error_1.errorIs)(e, "NotFound")) {
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
})(RuleType || (exports.RuleType = RuleType = {}));
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
    return (0, error_1.throwError)("InvalidTimeZoneData", "Invalid month name '%s'", name);
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
})(NormalizeOption || (exports.NormalizeOption = NormalizeOption = {}));
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
        (0, assert_1.default)(!TzDatabase._instance, "AlreadyCreated", "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
        (0, assert_1.default)(data.length > 0, "InvalidTimeZoneData", "Timezonecomplete needs time zone data. You need to install one of the tzdata NPM modules before using timezonecomplete.");
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
            if ((0, error_1.errorIs)(e, ["NotFound.Rule", "Argument.N"])) {
                e = (0, error_1.error)("InvalidTimeZoneData", e.message);
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
            if ((0, error_1.errorIs)(e, ["NotFound.Rule", "Argument.N"])) {
                e = (0, error_1.error)("InvalidTimeZoneData", e.message);
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
            return (0, error_1.throwError)("InvalidTimeZoneData", "No zone info found");
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
        (0, assert_1.default)(fromYear <= toYear, "Argument.FromYear", "fromYear must be <= toYear");
        var rules = this._getRuleTransitions(ruleName);
        var result = [];
        var prevDst = (0, duration_1.hours)(0); // wrong, but that's why the function is deprecated
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
        (0, assert_1.default)(fromYear <= toYear, "Argument.FromYear", "fromYear must be <= toYear");
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
        return (0, error_1.throwError)("NotFound.Zone", "no zone info found for zone '%s'", zoneName);
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
        (0, assert_1.default)(this._data.zones.hasOwnProperty(zoneName), "NotFound.Zone", "zone not found: '%s'", zoneName);
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
                return (0, error_1.throwError)("NotFound.Zone", "Zone \"" + zoneEntries + "\" not found (referred to in link from \""
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
        (0, assert_1.default)(this._data.rules.hasOwnProperty(ruleName), "NotFound.Rule", "Rule set \"" + ruleName + "\" not found.");
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
            if ((0, error_1.errorIs)(e, ["Argument.To", "Argument.N", "Argument.Value", "Argument.Amount"])) {
                e = (0, error_1.error)("InvalidTimeZoneData", e.message);
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
            return (0, error_1.throwError)("Argument.To", "TO column incorrect: %s", to);
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
    (0, assert_1.default)(typeof data === "object", "InvalidTimeZoneData", "time zone data should be an object");
    (0, assert_1.default)(data.hasOwnProperty("rules"), "InvalidTimeZoneData", "time zone data should be an object with a 'rules' property");
    (0, assert_1.default)(data.hasOwnProperty("zones"), "InvalidTimeZoneData", "time zone data should be an object with a 'zones' property");
    // validate zones
    for (var zoneName in data.zones) {
        if (data.zones.hasOwnProperty(zoneName)) {
            var zoneArr = data.zones[zoneName];
            if (typeof (zoneArr) === "string") {
                // ok, is link to other zone, check link
                (0, assert_1.default)(data.zones.hasOwnProperty(zoneArr), "InvalidTimeZoneData", "Entry for zone \"%s\" links to \"%s\" but that doesn\'t exist", zoneName, zoneArr);
            }
            else {
                /* istanbul ignore if */
                if (!Array.isArray(zoneArr)) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Entry for zone \"%s\" is neither a string nor an array", zoneName);
                }
                for (var i = 0; i < zoneArr.length; i++) {
                    var entry = zoneArr[i];
                    /* istanbul ignore if */
                    if (!Array.isArray(entry)) {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
                    }
                    /* istanbul ignore if */
                    if (entry.length !== 4) {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[0] !== "string") {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
                    }
                    var gmtoff = math.filterFloat(entry[0]);
                    /* istanbul ignore if */
                    if (isNaN(gmtoff)) {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[1] !== "string") {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[2] !== "string") {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[3] !== "string" && entry[3] !== null) {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number");
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
                return (0, error_1.throwError)("InvalidTimeZoneData", "Entry for rule \"" + ruleName + "\" is not an array");
            }
            for (var i = 0; i < ruleArr.length; i++) {
                var rule = ruleArr[i];
                /* istanbul ignore if */
                if (!Array.isArray(rule)) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
                }
                /* istanbul ignore if */
                if (rule.length < 8) { // note some rules > 8 exists but that seems to be a bug in tz file parsing
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
                }
                for (var j = 0; j < rule.length; j++) {
                    /* istanbul ignore if */
                    if (j !== 5 && typeof rule[j] !== "string") {
                        return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
                    }
                }
                /* istanbul ignore if */
                if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
                }
                /* istanbul ignore if */
                if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
                }
                /* istanbul ignore if */
                if (!TzMonthNames.hasOwnProperty(rule[3])) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
                }
                /* istanbul ignore if */
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1
                    && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
                }
                /* istanbul ignore if */
                if (!Array.isArray(rule[5])) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
                }
                /* istanbul ignore if */
                if (rule[5].length !== 4) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][0], 10))) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][1], 10))) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][2], 10))) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
                }
                /* istanbul ignore if */
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w"
                    && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
                }
                var save = parseInt(rule[6], 10);
                /* istanbul ignore if */
                if (isNaN(save)) {
                    return (0, error_1.throwError)("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
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
        this._finalRulesByEffective = __spreadArray([], this._finalRulesByFromEffective, true);
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
        (0, assert_1.default)(zoneInfos.length > 0, "timezonecomplete.Argument.ZoneInfos", "zone '%s' without information", zoneName);
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
                            atUtc: ruleInfo.effectiveDateUtc(year, this._finalZoneInfo.gmtoff, (0, duration_1.hours)(0)),
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
            var prevDst = (0, duration_1.hours)(0);
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
                dstOffset: (0, duration_1.hours)(0),
                standardOffset: (0, duration_1.hours)(0)
            };
        }
        var info = infos[0];
        switch (info.ruleType) {
            case RuleType.None:
                return {
                    abbreviation: zoneAbbreviation(info.format, false, undefined),
                    letter: "",
                    dstOffset: (0, duration_1.hours)(0),
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
                    (0, error_1.throwError)("InvalidTimeZoneData", "zone '%s' refers to non-existing rule '%s'", zoneName, info.ruleName);
                }
                // find first rule transition without DST so that we have a letter
                var iterator = rule.findFirst();
                while (iterator && iterator.transition.newState.dstOffset.nonZero()) {
                    iterator = rule.findNext(iterator);
                }
                var letter = (_a = iterator === null || iterator === void 0 ? void 0 : iterator.transition.newState.letter) !== null && _a !== void 0 ? _a : "";
                return {
                    abbreviation: zoneAbbreviation(info.format, false, letter),
                    dstOffset: (0, duration_1.hours)(0),
                    letter: letter,
                    standardOffset: info.gmtoff
                };
            }
            default:
                (0, assert_1.default)(false, "timezonecomplete.Assertion", "Unknown RuleType");
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
                                    dstOffset: zoneInfo.ruleType === RuleType.None ? (0, duration_1.hours)(0) : zoneInfo.ruleOffset,
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
                            return (0, error_1.throwError)("InvalidTimeZoneData", "Zone '%s' refers to non-existing rule '%s'", zoneName, zoneInfo.ruleName);
                        }
                        var t = this._zoneTransitions(prevUntil, zoneInfo, rule);
                        transitions = transitions.concat(t);
                        prevRules = rule;
                    }
                    break;
                default:
                    (0, assert_1.default)(false, "timezonecomplete.Assertion", "Unknown RuleType");
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
                        dstOffset: (0, duration_1.hours)(0),
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
                        dstOffset: (0, duration_1.hours)(0),
                        standardOffset: zoneInfo.gmtoff
                    }
                };
            }
            result.push(initial);
        }
        // actual rule transitions; keep adding until the end of this zone info, or until only 'max' rules remain
        var prevDst = (_c = initial === null || initial === void 0 ? void 0 : initial.newState.dstOffset) !== null && _c !== void 0 ? _c : (0, duration_1.hours)(0);
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
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneInfo = exports.TzDatabase = exports.Transition = exports.ToType = exports.OnType = exports.RuleType = exports.RuleInfo = exports.NormalizeOption = exports.isValidOffsetString = exports.AtType = void 0;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZXJyb3IuanMiLCJkaXN0L2xpYi9mb3JtYXQuanMiLCJkaXN0L2xpYi9nbG9iYWxzLmpzIiwiZGlzdC9saWIvamF2YXNjcmlwdC5qcyIsImRpc3QvbGliL2xvY2FsZS5qcyIsImRpc3QvbGliL21hdGguanMiLCJkaXN0L2xpYi9wYXJzZS5qcyIsImRpc3QvbGliL3BlcmlvZC5qcyIsImRpc3QvbGliL3N0cmluZ3MuanMiLCJkaXN0L2xpYi90aW1lc291cmNlLmpzIiwiZGlzdC9saWIvdGltZXpvbmUuanMiLCJkaXN0L2xpYi90b2tlbi5qcyIsImRpc3QvbGliL3R6LWRhdGFiYXNlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiZGlzdC9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzczQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMza0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeHNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2MUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcm9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE2IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKi9cblwidXNlIHN0cmljdFwiO1xudmFyIF9fc3ByZWFkQXJyYXkgPSAodGhpcyAmJiB0aGlzLl9fc3ByZWFkQXJyYXkpIHx8IGZ1bmN0aW9uICh0bywgZnJvbSwgcGFjaykge1xuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcbi8qKlxuICogVGhyb3dzIGFuIEFzc2VydGlvbiBlcnJvciBpZiB0aGUgZ2l2ZW4gY29uZGl0aW9uIGlzIGZhbHN5XG4gKiBAcGFyYW0gY29uZGl0aW9uXG4gKiBAcGFyYW0gbmFtZSBlcnJvciBuYW1lXG4gKiBAcGFyYW0gZm9ybWF0IGVycm9yIG1lc3NhZ2Ugd2l0aCBwZXJjZW50LXN0eWxlIHBsYWNlaG9sZGVyc1xuICogQHBhcmFtIGFyZ3MgYXJndW1lbnRzIGZvciBlcnJvciBtZXNzYWdlIGZvcm1hdCBzdHJpbmdcbiAqIEB0aHJvd3MgW25hbWVdIGlmIGBjb25kaXRpb25gIGlzIGZhbHN5XG4gKi9cbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG5hbWUsIGZvcm1hdCkge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAzOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgYXJnc1tfaSAtIDNdID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgZXJyb3JfMS50aHJvd0Vycm9yLmFwcGx5KHZvaWQgMCwgX19zcHJlYWRBcnJheShbbmFtZSwgZm9ybWF0XSwgYXJncywgZmFsc2UpKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBhc3NlcnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hc3NlcnQuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxuICovXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBleHBvcnRzLlRpbWVTdHJ1Y3QgPSBleHBvcnRzLnNlY29uZE9mRGF5ID0gZXhwb3J0cy53ZWVrRGF5Tm9MZWFwU2VjcyA9IGV4cG9ydHMudGltZVRvVW5peE5vTGVhcFNlY3MgPSBleHBvcnRzLnVuaXhUb1RpbWVOb0xlYXBTZWNzID0gZXhwb3J0cy53ZWVrTnVtYmVyID0gZXhwb3J0cy53ZWVrT2ZNb250aCA9IGV4cG9ydHMud2Vla0RheU9uT3JCZWZvcmUgPSBleHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSBleHBvcnRzLmZpcnN0V2Vla0RheU9mTW9udGggPSBleHBvcnRzLmxhc3RXZWVrRGF5T2ZNb250aCA9IGV4cG9ydHMuZGF5T2ZZZWFyID0gZXhwb3J0cy5kYXlzSW5Nb250aCA9IGV4cG9ydHMuZGF5c0luWWVhciA9IGV4cG9ydHMuaXNMZWFwWWVhciA9IGV4cG9ydHMuc3RyaW5nVG9UaW1lVW5pdCA9IGV4cG9ydHMudGltZVVuaXRUb1N0cmluZyA9IGV4cG9ydHMudGltZVVuaXRUb01pbGxpc2Vjb25kcyA9IGV4cG9ydHMuVGltZVVuaXQgPSBleHBvcnRzLldlZWtEYXkgPSB2b2lkIDA7XG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xudmFyIGphdmFzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XG4vKipcbiAqIERheS1vZi13ZWVrLiBOb3RlIHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHQgZGF5LW9mLXdlZWs6XG4gKiBTdW5kYXkgPSAwLCBNb25kYXkgPSAxIGV0Y1xuICovXG52YXIgV2Vla0RheTtcbihmdW5jdGlvbiAoV2Vla0RheSkge1xuICAgIFdlZWtEYXlbV2Vla0RheVtcIlN1bmRheVwiXSA9IDBdID0gXCJTdW5kYXlcIjtcbiAgICBXZWVrRGF5W1dlZWtEYXlbXCJNb25kYXlcIl0gPSAxXSA9IFwiTW9uZGF5XCI7XG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVHVlc2RheVwiXSA9IDJdID0gXCJUdWVzZGF5XCI7XG4gICAgV2Vla0RheVtXZWVrRGF5W1wiV2VkbmVzZGF5XCJdID0gM10gPSBcIldlZG5lc2RheVwiO1xuICAgIFdlZWtEYXlbV2Vla0RheVtcIlRodXJzZGF5XCJdID0gNF0gPSBcIlRodXJzZGF5XCI7XG4gICAgV2Vla0RheVtXZWVrRGF5W1wiRnJpZGF5XCJdID0gNV0gPSBcIkZyaWRheVwiO1xuICAgIFdlZWtEYXlbV2Vla0RheVtcIlNhdHVyZGF5XCJdID0gNl0gPSBcIlNhdHVyZGF5XCI7XG59KShXZWVrRGF5IHx8IChleHBvcnRzLldlZWtEYXkgPSBXZWVrRGF5ID0ge30pKTtcbi8qKlxuICogVGltZSB1bml0c1xuICovXG52YXIgVGltZVVuaXQ7XG4oZnVuY3Rpb24gKFRpbWVVbml0KSB7XG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNaWxsaXNlY29uZFwiXSA9IDBdID0gXCJNaWxsaXNlY29uZFwiO1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiU2Vjb25kXCJdID0gMV0gPSBcIlNlY29uZFwiO1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWludXRlXCJdID0gMl0gPSBcIk1pbnV0ZVwiO1xuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiSG91clwiXSA9IDNdID0gXCJIb3VyXCI7XG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJEYXlcIl0gPSA0XSA9IFwiRGF5XCI7XG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJXZWVrXCJdID0gNV0gPSBcIldlZWtcIjtcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1vbnRoXCJdID0gNl0gPSBcIk1vbnRoXCI7XG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJZZWFyXCJdID0gN10gPSBcIlllYXJcIjtcbiAgICAvKipcbiAgICAgKiBFbmQtb2YtZW51bSBtYXJrZXIsIGRvIG5vdCB1c2VcbiAgICAgKi9cbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIk1BWFwiXSA9IDhdID0gXCJNQVhcIjtcbn0pKFRpbWVVbml0IHx8IChleHBvcnRzLlRpbWVVbml0ID0gVGltZVVuaXQgPSB7fSkpO1xuLyoqXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcbiAqIGFuZCBhIHllYXIgaXMgc2V0IHRvIDM2MCBkYXlzIChiZWNhdXNlIDEyIG1vbnRocyBvZiAzMCBkYXlzKS5cbiAqXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcbiAqIEByZXR1cm5zXHRUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Vbml0IGZvciBpbnZhbGlkIHVuaXRcbiAqL1xuZnVuY3Rpb24gdGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSB7XG4gICAgc3dpdGNoICh1bml0KSB7XG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xuICAgICAgICBjYXNlIFRpbWVVbml0LlNlY29uZDogcmV0dXJuIDEwMDA7XG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWludXRlOiByZXR1cm4gNjAgKiAxMDAwO1xuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5EYXk6IHJldHVybiA4NjQwMDAwMDtcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5XZWVrOiByZXR1cm4gNyAqIDg2NDAwMDAwO1xuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcbiAgICAgICAgY2FzZSBUaW1lVW5pdC5ZZWFyOiByZXR1cm4gMTIgKiAzMCAqIDg2NDAwMDAwO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuVW5pdFwiLCBcInVua25vd24gdGltZSB1bml0ICVkXCIsIHVuaXQpO1xuICAgIH1cbn1cbmV4cG9ydHMudGltZVVuaXRUb01pbGxpc2Vjb25kcyA9IHRpbWVVbml0VG9NaWxsaXNlY29uZHM7XG4vKipcbiAqIFRpbWUgdW5pdCB0byBsb3dlcmNhc2Ugc3RyaW5nLiBJZiBhbW91bnQgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBzdHJpbmcgaXMgcHV0IGluIHBsdXJhbCBmb3JtXG4gKiBpZiBuZWNlc3NhcnkuXG4gKiBAcGFyYW0gdW5pdCBUaGUgdW5pdFxuICogQHBhcmFtIGFtb3VudCBJZiB0aGlzIGlzIHVuZXF1YWwgdG8gLTEgYW5kIDEsIHRoZW4gdGhlIHJlc3VsdCBpcyBwbHVyYWxpemVkXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5pdCBmb3IgaW52YWxpZCB0aW1lIHVuaXRcbiAqL1xuZnVuY3Rpb24gdGltZVVuaXRUb1N0cmluZyh1bml0LCBhbW91bnQpIHtcbiAgICBpZiAoYW1vdW50ID09PSB2b2lkIDApIHsgYW1vdW50ID0gMTsgfVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcih1bml0KSB8fCB1bml0IDwgMCB8fCB1bml0ID49IFRpbWVVbml0Lk1BWCkge1xuICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Vbml0XCIsIFwiaW52YWxpZCB0aW1lIHVuaXQgJWRcIiwgdW5pdCk7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBUaW1lVW5pdFt1bml0XS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChhbW91bnQgPT09IDEgfHwgYW1vdW50ID09PSAtMSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIFwic1wiO1xuICAgIH1cbn1cbmV4cG9ydHMudGltZVVuaXRUb1N0cmluZyA9IHRpbWVVbml0VG9TdHJpbmc7XG4vKipcbiAqIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBudW1lcmljIFRpbWVVbml0LiBDYXNlLWluc2Vuc2l0aXZlOyB0aW1lIHVuaXRzIGNhbiBiZSBzaW5ndWxhciBvciBwbHVyYWwuXG4gKiBAcGFyYW0gc1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlMgZm9yIGludmFsaWQgc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHN0cmluZ1RvVGltZVVuaXQocykge1xuICAgIHZhciB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IFRpbWVVbml0Lk1BWDsgKytpKSB7XG4gICAgICAgIHZhciBvdGhlciA9IHRpbWVVbml0VG9TdHJpbmcoaSwgMSk7XG4gICAgICAgIGlmIChvdGhlciA9PT0gdHJpbW1lZCB8fCAob3RoZXIgKyBcInNcIikgPT09IHRyaW1tZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LlNcIiwgXCJVbmtub3duIHRpbWUgdW5pdCBzdHJpbmcgJyVzJ1wiLCBzKTtcbn1cbmV4cG9ydHMuc3RyaW5nVG9UaW1lVW5pdCA9IHN0cmluZ1RvVGltZVVuaXQ7XG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBpZiB5ZWFyIGlzIG5vdCBpbnRlZ2VyXG4gKi9cbmZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcikge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJJbnZhbGlkIHllYXIgJWRcIiwgeWVhcik7XG4gICAgLy8gZnJvbSBXaWtpcGVkaWE6XG4gICAgLy8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxuICAgIC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxuICAgIC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQwMCB0aGVuIGNvbW1vbiB5ZWFyXG4gICAgLy8gZWxzZSBsZWFwIHllYXJcbiAgICBpZiAoeWVhciAlIDQgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICh5ZWFyICUgMTAwICE9PSAwKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmICh5ZWFyICUgNDAwICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbmV4cG9ydHMuaXNMZWFwWWVhciA9IGlzTGVhcFllYXI7XG4vKipcbiAqIFRoZSBkYXlzIGluIGEgZ2l2ZW4geWVhclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgaWYgeWVhciBpcyBub3QgaW50ZWdlclxuICovXG5mdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcbiAgICAvLyByZWx5IG9uIHZhbGlkYXRpb24gYnkgaXNMZWFwWWVhclxuICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XG59XG5leHBvcnRzLmRheXNJblllYXIgPSBkYXlzSW5ZZWFyO1xuLyoqXG4gKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhclxuICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggMS0xMlxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBpZiB5ZWFyIGlzIG5vdCBpbnRlZ2VyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGggbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XG4gICAgc3dpdGNoIChtb250aCkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIHJldHVybiAzMTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDk6XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICByZXR1cm4gMzA7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Nb250aFwiLCBcIkludmFsaWQgbW9udGg6ICVkXCIsIG1vbnRoKTtcbiAgICB9XG59XG5leHBvcnRzLmRheXNJbk1vbnRoID0gZGF5c0luTW9udGg7XG4vKipcbiAqIFJldHVybnMgdGhlIGRheSBvZiB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZSBbMC4uMzY1XS4gSmFudWFyeSBmaXJzdCBpcyAwLlxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcbiAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyXG4gKiBAcGFyYW0gZGF5IERheSBvZiBtb250aCAxLTMxXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcbiAqL1xuZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpIHtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKG1vbnRoKSAmJiBtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiTW9udGggb3V0IG9mIHJhbmdlOiAlZFwiLCBtb250aCk7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoZGF5KSAmJiBkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XG4gICAgdmFyIHllYXJEYXkgPSAwO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbW9udGg7IGkrKykge1xuICAgICAgICB5ZWFyRGF5ICs9IGRheXNJbk1vbnRoKHllYXIsIGkpO1xuICAgIH1cbiAgICB5ZWFyRGF5ICs9IChkYXkgLSAxKTtcbiAgICByZXR1cm4geWVhckRheTtcbn1cbmV4cG9ydHMuZGF5T2ZZZWFyID0gZGF5T2ZZZWFyO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBsYXN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5IDAtNlxuICogQHJldHVybiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla0RheSBmb3IgaW52YWxpZCB3ZWVrIGRheVxuICovXG5mdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIHdlZWtEYXkpIHtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKG1vbnRoKSAmJiBtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiTW9udGggb3V0IG9mIHJhbmdlOiAlZFwiLCBtb250aCk7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIod2Vla0RheSkgJiYgd2Vla0RheSA+PSAwICYmIHdlZWtEYXkgPD0gNiwgXCJBcmd1bWVudC5XZWVrRGF5XCIsIFwid2Vla0RheSBvdXQgb2YgcmFuZ2U6ICVkXCIsIHdlZWtEYXkpO1xuICAgIHZhciBlbmRPZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xuICAgIHZhciBlbmRPZk1vbnRoV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKGVuZE9mTW9udGgudW5peE1pbGxpcyk7XG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gZW5kT2ZNb250aFdlZWtEYXk7XG4gICAgaWYgKGRpZmYgPiAwKSB7XG4gICAgICAgIGRpZmYgLT0gNztcbiAgICB9XG4gICAgcmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuZXhwb3J0cy5sYXN0V2Vla0RheU9mTW9udGggPSBsYXN0V2Vla0RheU9mTW9udGg7XG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla0RheSBmb3IgaW52YWxpZCB3ZWVrIGRheVxuICovXG5mdW5jdGlvbiBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCB3ZWVrRGF5KSB7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIlllYXIgb3V0IG9mIHJhbmdlOiAlZFwiLCB5ZWFyKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHdlZWtEYXkpICYmIHdlZWtEYXkgPj0gMCAmJiB3ZWVrRGF5IDw9IDYsIFwiQXJndW1lbnQuV2Vla0RheVwiLCBcIndlZWtEYXkgb3V0IG9mIHJhbmdlOiAlZFwiLCB3ZWVrRGF5KTtcbiAgICB2YXIgYmVnaW5PZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogMSB9KTtcbiAgICB2YXIgYmVnaW5PZk1vbnRoV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKGJlZ2luT2ZNb250aC51bml4TWlsbGlzKTtcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xuICAgIGlmIChkaWZmIDwgMCkge1xuICAgICAgICBkaWZmICs9IDc7XG4gICAgfVxuICAgIHJldHVybiBiZWdpbk9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuZXhwb3J0cy5maXJzdFdlZWtEYXlPZk1vbnRoID0gZmlyc3RXZWVrRGF5T2ZNb250aDtcbi8qKlxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzID49IHRoZSBnaXZlbiBkYXk7IHRocm93cyBpZiBub3QgZm91bmRcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtEYXkgZm9yIGludmFsaWQgd2VlayBkYXlcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZCBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5XG4gKi9cbmZ1bmN0aW9uIHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgbW9udGgsIGRheSwgd2Vla0RheSkge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIobW9udGgpICYmIG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJNb250aCBvdXQgb2YgcmFuZ2U6ICVkXCIsIG1vbnRoKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XG4gICAgdmFyIHN0YXJ0ID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5IH0pO1xuICAgIHZhciBzdGFydFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XG4gICAgaWYgKGRpZmYgPCAwKSB7XG4gICAgICAgIGRpZmYgKz0gNztcbiAgICB9XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiTm90Rm91bmRcIiwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcbiAgICByZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuZXhwb3J0cy53ZWVrRGF5T25PckFmdGVyID0gd2Vla0RheU9uT3JBZnRlcjtcbi8qKlxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheVxuICovXG5mdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyLCBtb250aCwgZGF5LCB3ZWVrRGF5KSB7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIlllYXIgb3V0IG9mIHJhbmdlOiAlZFwiLCB5ZWFyKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGRheSkgJiYgZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJBcmd1bWVudC5EYXlcIiwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHdlZWtEYXkpICYmIHdlZWtEYXkgPj0gMCAmJiB3ZWVrRGF5IDw9IDYsIFwiQXJndW1lbnQuV2Vla0RheVwiLCBcIndlZWtEYXkgb3V0IG9mIHJhbmdlOiAlZFwiLCB3ZWVrRGF5KTtcbiAgICB2YXIgc3RhcnQgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXkgfSk7XG4gICAgdmFyIHN0YXJ0V2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcbiAgICBpZiAoZGlmZiA+IDApIHtcbiAgICAgICAgZGlmZiAtPSA3O1xuICAgIH1cbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmID49IDEsIFwiTm90Rm91bmRcIiwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcbiAgICByZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xuLyoqXG4gKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcywgYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXI6XG4gKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0XG4gKlxuICogQHBhcmFtIHllYXIgVGhlIHllYXJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXG4gKiBAcGFyYW0gZGF5IFRoZSBkYXkgWzEtMzFdXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcbiAqL1xuZnVuY3Rpb24gd2Vla09mTW9udGgoeWVhciwgbW9udGgsIGRheSkge1xuICAgIC8vIHJlbHkgb24geWVhci9tb250aCB2YWxpZGF0aW9uIGluIGZpcnN0V2Vla0RheU9mTW9udGhcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcbiAgICB2YXIgZmlyc3RUaHVyc2RheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xuICAgIHZhciBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcbiAgICBpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcbiAgICAgICAgaWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xuICAgICAgICAgICAgLy8gV2VlayAxXG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIExhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxuICAgICAgICAgICAgaWYgKG1vbnRoID4gMSkge1xuICAgICAgICAgICAgICAgIC8vIERlZmF1bHQgY2FzZVxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCAtIDEsIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoIC0gMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSmFudWFyeVxuICAgICAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xuICAgIHZhciBsYXN0VGh1cnNkYXkgPSBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xuICAgIC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gbGFzdCB3ZWVrIG9yIHdlZWsgMSBvZiBwcmV2aW91cyBtb250aFxuICAgIGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xuICAgICAgICBpZiAobGFzdE1vbmRheSA+IGxhc3RUaHVyc2RheSkge1xuICAgICAgICAgICAgLy8gV2VlayAxIG9mIG5leHQgbW9udGhcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIE5vcm1hbCBjYXNlXG4gICAgdmFyIHJlc3VsdCA9IE1hdGguZmxvb3IoKGRheSAtIGZpcnN0TW9uZGF5KSAvIDcpICsgMTtcbiAgICBpZiAoZmlyc3RUaHVyc2RheSA8IDQpIHtcbiAgICAgICAgcmVzdWx0ICs9IDE7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLndlZWtPZk1vbnRoID0gd2Vla09mTW9udGg7XG4vKipcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxuICogTm90ZSB0aGF0IHRoZSByZXN1bHQgbWF5IGxpZSBpbiB0aGUgcHJldmlvdXMgeWVhciwgaW4gd2hpY2ggY2FzZSBpdFxuICogd2lsbCBiZSAobXVjaCkgZ3JlYXRlciB0aGFuIDRcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxuICovXG5mdW5jdGlvbiBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpIHtcbiAgICAvLyByZWxheSBvbiB3ZWVrRGF5T25PckFmdGVyIGZvciB5ZWFyIHZhbGlkYXRpb25cbiAgICAvLyBmaXJzdCBtb25kYXkgb2YgSmFudWFyeSwgbWludXMgb25lIGJlY2F1c2Ugd2Ugd2FudCBkYXktb2YteWVhclxuICAgIHZhciByZXN1bHQgPSB3ZWVrRGF5T25PckFmdGVyKHllYXIsIDEsIDEsIFdlZWtEYXkuTW9uZGF5KSAtIDE7XG4gICAgaWYgKHJlc3VsdCA+IDMpIHsgLy8gZ3JlYXRlciB0aGFuIGphbiA0dGhcbiAgICAgICAgcmVzdWx0IC09IDc7XG4gICAgICAgIGlmIChyZXN1bHQgPCAwKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcbiAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG4gKlxuICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTg4XG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIDEtNTNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxuICovXG5mdW5jdGlvbiB3ZWVrTnVtYmVyKHllYXIsIG1vbnRoLCBkYXkpIHtcbiAgICB2YXIgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xuICAgIC8vIGNoZWNrIGVuZC1vZi15ZWFyIGNvcm5lciBjYXNlOiBtYXkgYmUgd2VlayAxIG9mIG5leHQgeWVhclxuICAgIGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcbiAgICAgICAgdmFyIG5leHRZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhciArIDEpO1xuICAgICAgICBpZiAobmV4dFllYXJXZWVrT25lID4gNCAmJiBuZXh0WWVhcldlZWtPbmUgPD0gZG95KSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxuICAgIHZhciB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xuICAgIGlmICh0aGlzWWVhcldlZWtPbmUgPiA0KSB7XG4gICAgICAgIC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXG4gICAgICAgIHZhciB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xuICAgICAgICBpZiAoZG95IDwgd2Vla1R3bykge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gV2VlayAxIGlzIGVudGlyZWx5IGluc2lkZSB0aGlzIHllYXIuXG4gICAgaWYgKGRveSA8IHRoaXNZZWFyV2Vla09uZSkge1xuICAgICAgICAvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxuICAgICAgICByZXR1cm4gd2Vla051bWJlcih5ZWFyIC0gMSwgMTIsIDMxKTtcbiAgICB9XG4gICAgLy8gbm9ybWFsIGNhc2VzOyBub3RlIHRoYXQgd2VlayBudW1iZXJzIHN0YXJ0IGZyb20gMSBzbyArMVxuICAgIHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB0aGlzWWVhcldlZWtPbmUpIC8gNykgKyAxO1xufVxuZXhwb3J0cy53ZWVrTnVtYmVyID0gd2Vla051bWJlcjtcbi8qKlxuICogQ29udmVydCBhIHVuaXggbWlsbGkgdGltZXN0YW1wIGludG8gYSBUaW1lVCBzdHJ1Y3R1cmUuXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Vbml4TWlsbGlzIGZvciBub24taW50ZWdlciBgdW5peE1pbGxpc2AgcGFyYW1ldGVyXG4gKi9cbmZ1bmN0aW9uIHVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih1bml4TWlsbGlzKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwidW5peE1pbGxpcyBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXJcIik7XG4gICAgdmFyIHRlbXAgPSB1bml4TWlsbGlzO1xuICAgIHZhciByZXN1bHQgPSB7IHllYXI6IDAsIG1vbnRoOiAwLCBkYXk6IDAsIGhvdXI6IDAsIG1pbnV0ZTogMCwgc2Vjb25kOiAwLCBtaWxsaTogMCB9O1xuICAgIHZhciB5ZWFyO1xuICAgIHZhciBtb250aDtcbiAgICBpZiAodW5peE1pbGxpcyA+PSAwKSB7XG4gICAgICAgIHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuICAgICAgICByZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG4gICAgICAgIHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XG4gICAgICAgIHllYXIgPSAxOTcwO1xuICAgICAgICB3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XG4gICAgICAgICAgICB0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XG4gICAgICAgICAgICB5ZWFyKys7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnllYXIgPSB5ZWFyO1xuICAgICAgICBtb250aCA9IDE7XG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xuICAgICAgICAgICAgdGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XG4gICAgICAgICAgICBtb250aCsrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5tb250aCA9IG1vbnRoO1xuICAgICAgICByZXN1bHQuZGF5ID0gdGVtcCArIDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXG4gICAgICAgIC8vIFdlIG1ha2UgaXQgcG9zaXRpdmUgYnkgYWRkaW5nIHRoZSBtb2R1bG8uXG4gICAgICAgIHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuICAgICAgICByZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG4gICAgICAgIHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XG4gICAgICAgIHllYXIgPSAxOTY5O1xuICAgICAgICB3aGlsZSAodGVtcCA8IC1kYXlzSW5ZZWFyKHllYXIpKSB7XG4gICAgICAgICAgICB0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XG4gICAgICAgICAgICB5ZWFyLS07XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnllYXIgPSB5ZWFyO1xuICAgICAgICBtb250aCA9IDEyO1xuICAgICAgICB3aGlsZSAodGVtcCA8IC1kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcbiAgICAgICAgICAgIHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuICAgICAgICAgICAgbW9udGgtLTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQubW9udGggPSBtb250aDtcbiAgICAgICAgcmVzdWx0LmRheSA9IHRlbXAgKyAxICsgZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy51bml4VG9UaW1lTm9MZWFwU2VjcyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzO1xuLyoqXG4gKiBGaWxsIHlvdSBhbnkgbWlzc2luZyB0aW1lIGNvbXBvbmVudCBwYXJ0cywgZGVmYXVsdHMgYXJlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBmb3IgaW52YWxpZCBob3VyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGZvciBpbnZhbGlkIG1pbnV0ZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBmb3IgaW52YWxpZCBzZWNvbmRcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaWxsaSBmb3IgaW52YWxpZCBtaWxsaXNlY29uZHNcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cykge1xuICAgIHZhciBpbnB1dCA9IHtcbiAgICAgICAgeWVhcjogdHlwZW9mIGNvbXBvbmVudHMueWVhciA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMueWVhciA6IDE5NzAsXG4gICAgICAgIG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxuICAgICAgICBkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcbiAgICAgICAgaG91cjogdHlwZW9mIGNvbXBvbmVudHMuaG91ciA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuaG91ciA6IDAsXG4gICAgICAgIG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxuICAgICAgICBzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcbiAgICAgICAgbWlsbGk6IHR5cGVvZiBjb21wb25lbnRzLm1pbGxpID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taWxsaSA6IDAsXG4gICAgfTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC55ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiaW52YWxpZCB5ZWFyICVkXCIsIGlucHV0LnllYXIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGlucHV0Lm1vbnRoKSAmJiBpbnB1dC5tb250aCA+PSAxICYmIGlucHV0Lm1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiaW52YWxpZCBtb250aCAlZFwiLCBpbnB1dC5tb250aCk7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoaW5wdXQuZGF5KSAmJiBpbnB1dC5kYXkgPj0gMSAmJiBpbnB1dC5kYXkgPD0gZGF5c0luTW9udGgoaW5wdXQueWVhciwgaW5wdXQubW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImludmFsaWQgZGF5ICVkXCIsIGlucHV0LmRheSk7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoaW5wdXQuaG91cikgJiYgaW5wdXQuaG91ciA+PSAwICYmIGlucHV0LmhvdXIgPD0gMjMsIFwiQXJndW1lbnQuSG91clwiLCBcImludmFsaWQgaG91ciAlZFwiLCBpbnB1dC5ob3VyKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5taW51dGUpICYmIGlucHV0Lm1pbnV0ZSA+PSAwICYmIGlucHV0Lm1pbnV0ZSA8PSA1OSwgXCJBcmd1bWVudC5NaW51dGVcIiwgXCJpbnZhbGlkIG1pbnV0ZSAlZFwiLCBpbnB1dC5taW51dGUpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGlucHV0LnNlY29uZCkgJiYgaW5wdXQuc2Vjb25kID49IDAgJiYgaW5wdXQuc2Vjb25kIDw9IDU5LCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcImludmFsaWQgc2Vjb25kICVkXCIsIGlucHV0LnNlY29uZCk7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoaW5wdXQubWlsbGkpICYmIGlucHV0Lm1pbGxpID49IDAgJiYgaW5wdXQubWlsbGkgPD0gOTk5LCBcIkFyZ3VtZW50Lk1pbGxpXCIsIFwiaW52YWxpZCBtaWxsaSAlZFwiLCBpbnB1dC5taWxsaSk7XG4gICAgcmV0dXJuIGlucHV0O1xufVxuZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XG4gICAgdmFyIGNvbXBvbmVudHMgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyB7IHllYXI6IGEsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0gOiBhKTtcbiAgICB2YXIgaW5wdXQgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcbiAgICByZXR1cm4gaW5wdXQubWlsbGkgKyAxMDAwICogKGlucHV0LnNlY29uZCArIGlucHV0Lm1pbnV0ZSAqIDYwICsgaW5wdXQuaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoaW5wdXQueWVhciwgaW5wdXQubW9udGgsIGlucHV0LmRheSkgKiA4NjQwMCArXG4gICAgICAgIChpbnB1dC55ZWFyIC0gMTk3MCkgKiAzMTUzNjAwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTY5KSAvIDQpICogODY0MDAgLVxuICAgICAgICBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xufVxuZXhwb3J0cy50aW1lVG9Vbml4Tm9MZWFwU2VjcyA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzO1xuLyoqXG4gKiBSZXR1cm4gdGhlIGRheS1vZi13ZWVrLlxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5peE1pbGxpcyBmb3IgaW52YWxpZCBgdW5peE1pbGxpc2AgYXJndW1lbnRcbiAqL1xuZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpcykge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHVuaXhNaWxsaXMpLCBcIkFyZ3VtZW50LlVuaXhNaWxsaXNcIiwgXCJ1bml4TWlsbGlzIHNob3VsZCBiZSBhbiBpbnRlZ2VyIG51bWJlclwiKTtcbiAgICB2YXIgZXBvY2hEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xuICAgIHZhciBkYXlzID0gTWF0aC5mbG9vcih1bml4TWlsbGlzIC8gMTAwMCAvIDg2NDAwKTtcbiAgICByZXR1cm4gbWF0aC5wb3NpdGl2ZU1vZHVsbyhlcG9jaERheSArIGRheXMsIDcpO1xufVxuZXhwb3J0cy53ZWVrRGF5Tm9MZWFwU2VjcyA9IHdlZWtEYXlOb0xlYXBTZWNzO1xuLyoqXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaW51dGUgZm9yIGludmFsaWQgbWludXRlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuU2Vjb25kIGZvciBpbnZhbGlkIHNlY29uZFxuICovXG5mdW5jdGlvbiBzZWNvbmRPZkRheShob3VyLCBtaW51dGUsIHNlY29uZCkge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGhvdXIpICYmIGhvdXIgPj0gMCAmJiBob3VyIDw9IDIzLCBcIkFyZ3VtZW50LkhvdXJcIiwgXCJpbnZhbGlkIGhvdXIgJWRcIiwgaG91cik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIobWludXRlKSAmJiBtaW51dGUgPj0gMCAmJiBtaW51dGUgPD0gNTksIFwiQXJndW1lbnQuTWludXRlXCIsIFwiaW52YWxpZCBtaW51dGUgJWRcIiwgbWludXRlKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihzZWNvbmQpICYmIHNlY29uZCA+PSAwICYmIHNlY29uZCA8PSA2MSwgXCJBcmd1bWVudC5TZWNvbmRcIiwgXCJpbnZhbGlkIHNlY29uZCAlZFwiLCBzZWNvbmQpO1xuICAgIHJldHVybiAoKChob3VyICogNjApICsgbWludXRlKSAqIDYwKSArIHNlY29uZDtcbn1cbmV4cG9ydHMuc2Vjb25kT2ZEYXkgPSBzZWNvbmRPZkRheTtcbi8qKlxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXG4gKi9cbnZhciBUaW1lU3RydWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gVGltZVN0cnVjdChhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoYSksIFwiQXJndW1lbnQuVW5peE1pbGxpc1wiLCBcImludmFsaWQgdW5peCBtaWxsaXMgJWRcIiwgYSk7XG4gICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gYTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0eXBlb2YgYSA9PT0gXCJvYmplY3RcIiAmJiBhICE9PSBudWxsLCBcIkFyZ3VtZW50LkNvbXBvbmVudHNcIiwgXCJpbnZhbGlkIGNvbXBvbmVudHMgb2JqZWN0XCIpO1xuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXG4gICAgICpcbiAgICAgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcbiAgICAgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcbiAgICAgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxuICAgICAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcbiAgICAgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxuICAgICAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXG4gICAgICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGZvciBpbnZhbGlkIG1pbnV0ZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgZm9yIGludmFsaWQgc2Vjb25kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpIGZvciBpbnZhbGlkIG1pbGxpc2Vjb25kc1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QuZnJvbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgbnVtYmVyIG9mIHVuaXggbWlsbGlzZWNvbmRzXG4gICAgICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXhNaWxsaXMgZm9yIG5vbi1pbnRlZ2VyIG1pbGxpc2Vjb25kc1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QuZnJvbVVuaXggPSBmdW5jdGlvbiAodW5peE1pbGxpcykge1xuICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxuICAgICAqIEBwYXJhbSBkZiBXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lU3RydWN0LmZyb21EYXRlID0gZnVuY3Rpb24gKGQsIGRmKSB7XG4gICAgICAgIGlmIChkZiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0RnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0TW9udGgoKSArIDEsIGRheTogZC5nZXREYXRlKCksXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3Qoe1xuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXG4gICAgICAgICAgICAgICAgaG91cjogZC5nZXRVVENIb3VycygpLCBtaW51dGU6IGQuZ2V0VVRDTWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0VVRDU2Vjb25kcygpLCBtaWxsaTogZC5nZXRVVENNaWxsaXNlY29uZHMoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlMgaWYgYHNgIGlzIG5vdCBhIHByb3BlciBpc28gc3RyaW5nXG4gICAgICovXG4gICAgVGltZVN0cnVjdC5mcm9tU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB5ZWFyID0gMTk3MDtcbiAgICAgICAgICAgIHZhciBtb250aCA9IDE7XG4gICAgICAgICAgICB2YXIgZGF5ID0gMTtcbiAgICAgICAgICAgIHZhciBob3VyID0gMDtcbiAgICAgICAgICAgIHZhciBtaW51dGUgPSAwO1xuICAgICAgICAgICAgdmFyIHNlY29uZCA9IDA7XG4gICAgICAgICAgICB2YXIgZnJhY3Rpb25NaWxsaXMgPSAwO1xuICAgICAgICAgICAgdmFyIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcbiAgICAgICAgICAgIC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcbiAgICAgICAgICAgIHZhciBzcGxpdCA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJBcmd1bWVudC5TXCIsIFwiRW1wdHkgc3RyaW5nIG9yIG11bHRpcGxlIGRvdHMuXCIpO1xuICAgICAgICAgICAgLy8gcGFyc2UgbWFpbiBwYXJ0XG4gICAgICAgICAgICB2YXIgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XG4gICAgICAgICAgICBpZiAoaXNCYXNpY0Zvcm1hdCkge1xuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShzcGxpdFswXS5tYXRjaCgvXigoXFxkKSspfChcXGRcXGRcXGRcXGRcXGRcXGRcXGRcXGRUKFxcZCkrKSQvKSwgXCJBcmd1bWVudC5TXCIsIFwiSVNPIHN0cmluZyBpbiBiYXNpYyBub3RhdGlvbiBtYXkgb25seSBjb250YWluIG51bWJlcnMgYmVmb3JlIHRoZSBmcmFjdGlvbmFsIHBhcnRcIik7XG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGFueSBcIlRcIiBzZXBhcmF0b3JcbiAgICAgICAgICAgICAgICBzcGxpdFswXSA9IHNwbGl0WzBdLnJlcGxhY2UoXCJUXCIsIFwiXCIpO1xuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSwgXCJBcmd1bWVudC5TXCIsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMCwgNCksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDYsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDgsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMikge1xuICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMiwgMiksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHNwbGl0WzBdLm1hdGNoKC9eXFxkXFxkXFxkXFxkKC1cXGRcXGQtXFxkXFxkKChUKT9cXGRcXGQoXFw6XFxkXFxkKDpcXGRcXGQpPyk/KT8pPyQvKSwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xuICAgICAgICAgICAgICAgIHZhciBkYXRlQW5kVGltZSA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChzLmluZGV4T2YoXCJUXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IHNwbGl0WzBdLnNwbGl0KFwiVFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRlQW5kVGltZSA9IFtzcGxpdFswXS5zdWJzdHIoMCwgMTApLCBzcGxpdFswXS5zdWJzdHIoMTApXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSwgXCJBcmd1bWVudC5TXCIsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoMCwgNCksIDEwKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDUsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGRheSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig4LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA4KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cig2LCAyKSwgMTApO1xuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBwYXJzZSBmcmFjdGlvbmFsIHBhcnRcbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxICYmIHNwbGl0WzFdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJhY3Rpb24gPSBwYXJzZUZsb2F0KFwiMC5cIiArIHNwbGl0WzFdKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGxhc3RVbml0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuWWVhcjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gZGF5c0luWWVhcih5ZWFyKSAqIDg2NDAwMDAwICogZnJhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5EYXk6XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5Ib3VyOlxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSAzNjAwMDAwICogZnJhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5NaW51dGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDYwMDAwICogZnJhY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XG4gICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcbiAgICAgICAgICAgIG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XG4gICAgICAgICAgICBkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XG4gICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcbiAgICAgICAgICAgIG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcbiAgICAgICAgICAgIHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcbiAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQgfSk7XG4gICAgICAgICAgICB1bml4TWlsbGlzID0gbWF0aC5yb3VuZFN5bSh1bml4TWlsbGlzICsgZnJhY3Rpb25NaWxsaXMpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHVuaXhNaWxsaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoKDAsIGVycm9yXzEuZXJyb3JJcykoZSwgW1xuICAgICAgICAgICAgICAgIFwiQXJndW1lbnQuU1wiLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIkFyZ3VtZW50LkRheVwiLCBcIkFyZ3VtZW50LkhvdXJcIixcbiAgICAgICAgICAgICAgICBcIkFyZ3VtZW50Lk1pbnV0ZVwiLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIkFyZ3VtZW50Lk1pbGxpXCJcbiAgICAgICAgICAgIF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgSVNPIDg2MDEgc3RyaW5nOiBcXFwiJXNcXFwiOiAlc1wiLCBzLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTsgLy8gcHJvZ3JhbW1pbmcgZXJyb3JcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcInVuaXhNaWxsaXNcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl91bml4TWlsbGlzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJjb21wb25lbnRzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2NvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wb25lbnRzID0gdW5peFRvVGltZU5vTGVhcFNlY3ModGhpcy5fdW5peE1pbGxpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50cztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJ5ZWFyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnllYXI7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibW9udGhcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGg7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiZGF5XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmRheTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJob3VyXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmhvdXI7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwibWludXRlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbnV0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJzZWNvbmRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcIm1pbGxpXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbGxpO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogVGhlIGRheS1vZi15ZWFyIDAtMzY1XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUueWVhckRheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRheU9mWWVhcih0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoLCB0aGlzLmNvbXBvbmVudHMuZGF5KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVxdWFsaXR5IGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIG90aGVyXG4gICAgICogQHRocm93cyBUeXBlRXJyb3IgaWYgb3RoZXIgaXMgbm90IGFuIE9iamVjdFxuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZU9mKCkgPT09IG90aGVyLnZhbHVlT2YoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgYSB0aW1lc3RhbXAuIEZpbHRlcnMgb3V0IG5vbi1leGlzdGluZyB2YWx1ZXMgZm9yIGFsbCB0aW1lIGNvbXBvbmVudHNcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgdGltZXN0YW1wIGlzIHZhbGlkXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1vbnRoID49IDEgJiYgdGhpcy5jb21wb25lbnRzLm1vbnRoIDw9IDEyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5ob3VyIDw9IDIzXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5taW51dGUgPD0gNTlcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taWxsaSA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5taWxsaSA8PSA5OTk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnllYXIudG9TdHJpbmcoMTApLCA0LCBcIjBcIilcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG4gICAgICAgICAgICArIFwiLVwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5kYXkudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcbiAgICAgICAgICAgICsgXCJUXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmhvdXIudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuICAgICAgICAgICAgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuc2Vjb25kLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG4gICAgICAgICAgICArIFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taWxsaS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcbiAgICB9O1xuICAgIHJldHVybiBUaW1lU3RydWN0O1xufSgpKTtcbmV4cG9ydHMuVGltZVN0cnVjdCA9IFRpbWVTdHJ1Y3Q7XG4vKipcbiAqIEJpbmFyeSBzZWFyY2hcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcbiAqIEBwYXJhbSBjb21wYXJlIEZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiA8IDAgaWYgZ2l2ZW4gZWxlbWVudCBpcyBsZXNzIHRoYW4gc2VhcmNoZWQgZWxlbWVudCBldGNcbiAqIEByZXR1cm5zIFRoZSBpbnNlcnRpb24gaW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gbG9vayBmb3JcbiAqIEB0aHJvd3MgVHlwZUVycm9yIGlmIGFyciBpcyBub3QgYW4gYXJyYXlcbiAqIEB0aHJvd3Mgd2hhdGV2ZXIgYGNvbXBhcmUoKWAgdGhyb3dzXG4gKi9cbmZ1bmN0aW9uIGJpbmFyeUluc2VydGlvbkluZGV4KGFyciwgY29tcGFyZSkge1xuICAgIHZhciBtaW5JbmRleCA9IDA7XG4gICAgdmFyIG1heEluZGV4ID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgdmFyIGN1cnJlbnRJbmRleDtcbiAgICB2YXIgY3VycmVudEVsZW1lbnQ7XG4gICAgLy8gbm8gYXJyYXkgLyBlbXB0eSBhcnJheVxuICAgIGlmICghYXJyKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgLy8gb3V0IG9mIGJvdW5kc1xuICAgIGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoY29tcGFyZShhcnJbbWF4SW5kZXhdKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG1heEluZGV4ICsgMTtcbiAgICB9XG4gICAgLy8gZWxlbWVudCBpbiByYW5nZVxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xuICAgICAgICBjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xuICAgICAgICBjdXJyZW50RWxlbWVudCA9IGFycltjdXJyZW50SW5kZXhdO1xuICAgICAgICBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XG4gICAgICAgICAgICBtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XG4gICAgICAgICAgICBtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudEluZGV4O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXhJbmRleDtcbn1cbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBiaW5hcnlJbnNlcnRpb25JbmRleDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJhc2ljcy5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5pc0RhdGVUaW1lID0gZXhwb3J0cy5EYXRlVGltZSA9IGV4cG9ydHMubm93ID0gZXhwb3J0cy5ub3dVdGMgPSBleHBvcnRzLm5vd0xvY2FsID0gdm9pZCAwO1xudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xudmFyIGZvcm1hdCA9IHJlcXVpcmUoXCIuL2Zvcm1hdFwiKTtcbnZhciBqYXZhc2NyaXB0XzEgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xudmFyIG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xudmFyIHBhcnNlRnVuY3MgPSByZXF1aXJlKFwiLi9wYXJzZVwiKTtcbnZhciB0aW1lc291cmNlXzEgPSByZXF1aXJlKFwiLi90aW1lc291cmNlXCIpO1xudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcbnZhciB0el9kYXRhYmFzZV8xID0gcmVxdWlyZShcIi4vdHotZGF0YWJhc2VcIik7XG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBub3dMb2NhbCgpIHtcbiAgICByZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcbn1cbmV4cG9ydHMubm93TG9jYWwgPSBub3dMb2NhbDtcbi8qKlxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICovXG5mdW5jdGlvbiBub3dVdGMoKSB7XG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xufVxuZXhwb3J0cy5ub3dVdGMgPSBub3dVdGM7XG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICovXG5mdW5jdGlvbiBub3codGltZVpvbmUpIHtcbiAgICBpZiAodGltZVpvbmUgPT09IHZvaWQgMCkgeyB0aW1lWm9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCk7IH1cbiAgICByZXR1cm4gRGF0ZVRpbWUubm93KHRpbWVab25lKTtcbn1cbmV4cG9ydHMubm93ID0gbm93O1xuLyoqXG4gKlxuICogQHBhcmFtIGxvY2FsVGltZVxuICogQHBhcmFtIGZyb21ab25lXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gY29udmVydFRvVXRjKGxvY2FsVGltZSwgZnJvbVpvbmUpIHtcbiAgICBpZiAoZnJvbVpvbmUpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcbiAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGxvY2FsVGltZS51bml4TWlsbGlzIC0gb2Zmc2V0ICogNjAwMDApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsVGltZS5jbG9uZSgpO1xuICAgIH1cbn1cbi8qKlxuICpcbiAqIEBwYXJhbSB1dGNUaW1lXG4gKiBAcGFyYW0gdG9ab25lXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gY29udmVydEZyb21VdGModXRjVGltZSwgdG9ab25lKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAodG9ab25lKSB7XG4gICAgICAgIHZhciBvZmZzZXQgPSB0b1pvbmUub2Zmc2V0Rm9yVXRjKHV0Y1RpbWUpO1xuICAgICAgICByZXR1cm4gdG9ab25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUudW5peE1pbGxpcyArIG9mZnNldCAqIDYwMDAwKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdXRjVGltZS5jbG9uZSgpO1xuICAgIH1cbn1cbi8qKlxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXG4gKiBhbmQgd2hpY2ggY2FuIGJlIG1vY2tlZCBmb3IgdGVzdGluZyBwdXJwb3Nlcy5cbiAqL1xudmFyIERhdGVUaW1lID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLCBAc2VlIG92ZXJyaWRlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIERhdGVUaW1lKGExLCBhMiwgYTMsIGgsIG0sIHMsIG1zLCB0aW1lWm9uZSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMua2luZCA9IFwiRGF0ZVRpbWVcIjtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgKGExKSkge1xuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMiAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTNcIiwgXCJmb3IgdW5peCB0aW1lc3RhbXAgZGF0ZXRpbWUgY29uc3RydWN0b3IsIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBzZWNvbmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9ICh0eXBlb2YgKGEyKSA9PT0gXCJvYmplY3RcIiAmJiBpc1RpbWVab25lKGEyKSA/IGEyIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gKDAsIGVycm9yXzEuY29udmVydEVycm9yKShcIkFyZ3VtZW50LlVuaXhNaWxsaXNcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShhMSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodW5peE1pbGxpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsIFwiQXJndW1lbnQuWWVhclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodHlwZW9mIChhMykgPT09IFwibnVtYmVyXCIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aW1lWm9uZSA9PT0gdW5kZWZpbmVkIHx8IHRpbWVab25lID09PSBudWxsIHx8IGlzVGltZVpvbmUodGltZVpvbmUpLCBcIkFyZ3VtZW50LlRpbWVab25lXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZWlnaHRoIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHllYXJfMSA9IGExO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1vbnRoXzEgPSBhMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXlfMSA9IGEzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhvdXJfMSA9ICh0eXBlb2YgKGgpID09PSBcIm51bWJlclwiID8gaCA6IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbnV0ZV8xID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kXzEgPSAodHlwZW9mIChzKSA9PT0gXCJudW1iZXJcIiA/IHMgOiAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaWxsaV8xID0gKHR5cGVvZiAobXMpID09PSBcIm51bWJlclwiID8gbXMgOiAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHllYXJfMSA9ICgwLCBlcnJvcl8xLmNvbnZlcnRFcnJvcikoXCJBcmd1bWVudC5ZZWFyXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0oeWVhcl8xKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aF8xID0gKDAsIGVycm9yXzEuY29udmVydEVycm9yKShcIkFyZ3VtZW50Lk1vbnRoXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0obW9udGhfMSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF5XzEgPSAoMCwgZXJyb3JfMS5jb252ZXJ0RXJyb3IpKFwiQXJndW1lbnQuRGF5XCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0oZGF5XzEpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdXJfMSA9ICgwLCBlcnJvcl8xLmNvbnZlcnRFcnJvcikoXCJBcmd1bWVudC5Ib3VyXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0oaG91cl8xKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGVfMSA9ICgwLCBlcnJvcl8xLmNvbnZlcnRFcnJvcikoXCJBcmd1bWVudC5NaW51dGVcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShtaW51dGVfMSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kXzEgPSAoMCwgZXJyb3JfMS5jb252ZXJ0RXJyb3IpKFwiQXJndW1lbnQuU2Vjb25kXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0oc2Vjb25kXzEpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpXzEgPSAoMCwgZXJyb3JfMS5jb252ZXJ0RXJyb3IpKFwiQXJndW1lbnQuTWlsbGlcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShtaWxsaV8xKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG0gPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXJfMSwgbW9udGg6IG1vbnRoXzEsIGRheTogZGF5XzEsIGhvdXI6IGhvdXJfMSwgbWludXRlOiBtaW51dGVfMSwgc2Vjb25kOiBzZWNvbmRfMSwgbWlsbGk6IG1pbGxpXzEgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIGlzVGltZVpvbmUodGltZVpvbmUpID8gdGltZVpvbmUgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdG07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGEyID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTRcIiwgXCJmaXJzdCB0d28gYXJndW1lbnRzIGFyZSBhIHN0cmluZywgdGhlcmVmb3JlIHRoZSBmb3VydGggdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTMgPT09IHVuZGVmaW5lZCB8fCBhMyA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEzKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRoaXJkIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9ybWF0IHN0cmluZyBnaXZlblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGVTdHJpbmcgPSBhMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXRTdHJpbmcgPSBhMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB6b25lID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMyA9PT0gXCJvYmplY3RcIiAmJiBpc1RpbWVab25lKGEzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHpvbmUgPSAoYTMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UoZGF0ZVN0cmluZywgZm9ybWF0U3RyaW5nLCB6b25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gcGFyc2VkLnRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gcGFyc2VkLnpvbmU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCwgXCJBcmd1bWVudC5BM1wiLCBcImZpcnN0IGFyZ3VtZW50cyBpcyBhIHN0cmluZyBhbmQgdGhlIHNlY29uZCBpcyBub3QsIHRoZXJlZm9yZSB0aGUgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEyKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaXZlblN0cmluZyA9IGExLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcyA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHNzLmxlbmd0aCA9PT0gMiwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCBkYXRlIHN0cmluZyBnaXZlbjogXFxcIlwiICsgYTEgKyBcIlxcXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNUaW1lWm9uZShhMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoc3NbMV0udHJpbSgpID8gdGltZXpvbmVfMS5UaW1lWm9uZS56b25lKHNzWzFdKSA6IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIChmcmVlIG9mIERhdGUgcXVpcmtzKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSBiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGExIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkE0XCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgYSBEYXRlLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiAmJiAoYTIgPT09IGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldCB8fCBhMiA9PT0gamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDKSwgXCJBcmd1bWVudC5HZXRGdW5jc1wiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTMgPT09IHVuZGVmaW5lZCB8fCBhMyA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEzKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRoaXJkIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSAoYTEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRrID0gKGEyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTMgPyBhMyA6IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGJhc2ljc18xLlRpbWVTdHJ1Y3QuZnJvbURhdGUoZCwgZGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgeyAvLyBhMSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3RcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShhMyA9PT0gdW5kZWZpbmVkICYmIGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEzXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgYSBUaW1lU3RydWN0LCB0aGVyZWZvcmUgdGhlIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJleHBlY3QgYSBUaW1lWm9uZSBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGExLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gKGEyID8gYTIgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEyID09PSB1bmRlZmluZWQgJiYgYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEyXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgdW5kZWZpbmVkLCB0aGVyZWZvcmUgdGhlIHJlc3QgbXVzdCBhbHNvIGJlIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gdGltZXpvbmVfMS5UaW1lWm9uZS5sb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgdGhyb3cgKDAsIGVycm9yXzEuZXJyb3IpKFwiQXJndW1lbnQuQTFcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwidXRjRGF0ZVwiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVVEMgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcbiAgICAgICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUsIHRoaXMuX3pvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3V0Y0RhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwiem9uZURhdGVcIiwge1xuICAgICAgICAvKipcbiAgICAgICAgICogTG9jYWwgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcbiAgICAgICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICAgICAqL1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVEYXRlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUubm93TG9jYWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBuID0gRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShuLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQsIHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIERhdGVUaW1lLm5vd1V0YyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxuICAgICAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBEYXRlVGltZS5ub3cgPSBmdW5jdGlvbiAodGltZVpvbmUpIHtcbiAgICAgICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgamF2YXNjcmlwdF8xLkRhdGVGdW5jdGlvbnMuR2V0VVRDLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgRGF0ZVRpbWUgZnJvbSBhIExvdHVzIDEyMyAvIE1pY3Jvc29mdCBFeGNlbCBkYXRlLXRpbWUgdmFsdWVcbiAgICAgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcbiAgICAgKiBAcGFyYW0gbiBleGNlbCBkYXRlL3RpbWUgbnVtYmVyXG4gICAgICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cbiAgICAgKiBAcmV0dXJucyBhIERhdGVUaW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk4gaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlRpbWVab25lIGlmIHRoZSBnaXZlbiB0aW1lIHpvbmUgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIERhdGVUaW1lLmZyb21FeGNlbCA9IGZ1bmN0aW9uIChuLCB0aW1lWm9uZSkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzRmluaXRlKG4pLCBcIkFyZ3VtZW50Lk5cIiwgXCJpbnZhbGlkIG51bWJlclwiKTtcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG4gICAgICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcbiAgICAgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXG4gICAgICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxuICAgICAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXG4gICAgICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLmV4aXN0cyA9IGZ1bmN0aW9uICh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUsIGFsbG93UHJlMTk3MCkge1xuICAgICAgICBpZiAobW9udGggPT09IHZvaWQgMCkgeyBtb250aCA9IDE7IH1cbiAgICAgICAgaWYgKGRheSA9PT0gdm9pZCAwKSB7IGRheSA9IDE7IH1cbiAgICAgICAgaWYgKGhvdXIgPT09IHZvaWQgMCkgeyBob3VyID0gMDsgfVxuICAgICAgICBpZiAobWludXRlID09PSB2b2lkIDApIHsgbWludXRlID0gMDsgfVxuICAgICAgICBpZiAoc2Vjb25kID09PSB2b2lkIDApIHsgc2Vjb25kID0gMDsgfVxuICAgICAgICBpZiAobWlsbGlzZWNvbmQgPT09IHZvaWQgMCkgeyBtaWxsaXNlY29uZCA9IDA7IH1cbiAgICAgICAgaWYgKGFsbG93UHJlMTk3MCA9PT0gdm9pZCAwKSB7IGFsbG93UHJlMTk3MCA9IGZhbHNlOyB9XG4gICAgICAgIGlmICghaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KSB8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZClcbiAgICAgICAgICAgIHx8ICFpc0Zpbml0ZShtaWxsaXNlY29uZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFsbG93UHJlMTk3MCAmJiB5ZWFyIDwgMTk3MCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcbiAgICAgICAgICAgIHJldHVybiAoeWVhciA9PT0gZHQueWVhcigpICYmIG1vbnRoID09PSBkdC5tb250aCgpICYmIGRheSA9PT0gZHQuZGF5KClcbiAgICAgICAgICAgICAgICAmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnpvbmVEYXRlLCB0aGlzLl96b25lKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIGRhdGVzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fem9uZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxuICAgICAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS56b25lQWJicmV2aWF0aW9uID0gZnVuY3Rpb24gKGRzdERlcGVuZGVudCkge1xuICAgICAgICBpZiAoZHN0RGVwZW5kZW50ID09PSB2b2lkIDApIHsgZHN0RGVwZW5kZW50ID0gdHJ1ZTsgfVxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW5jbHVkaW5nIERTVCB3LnIudC4gVVRDIGluIG1pbnV0ZXMuIFJldHVybnMgMCBmb3IgdW5hd2FyZSBkYXRlcyBhbmQgZm9yIFVUQyBkYXRlcy5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5vZmZzZXREdXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gdGhlIHN0YW5kYXJkIG9mZnNldCBXSVRIT1VUIERTVCB3LnIudC4gVVRDIGFzIGEgRHVyYXRpb24uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0RHVyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHRoaXMuX3pvbmUuc3RhbmRhcmRPZmZzZXRGb3JVdGModGhpcy51dGNEYXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygwKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUueWVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5tb250aDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUaGUgaG91ciAwLTIzXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmhvdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWludXRlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxuICAgICAqIHdlZWsgZGF5IG51bWJlcnMpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtEYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy56b25lRGF0ZS51bml4TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUueWVhckRheSgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG4gICAgICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndlZWtOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxuICAgICAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXG4gICAgICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcbiAgICAgKlxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla09mTW9udGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuICAgICAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xuICAgICAqXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudW5peFV0Y01pbGxpcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNZZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMueWVhcjtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjSG91ciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmhvdXI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbnV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjU2Vjb25kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y01pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcbiAgICAgKiB3ZWVrIGRheSBudW1iZXJzKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrRGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuICAgICAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxuICAgICAqXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjV2Vla051bWJlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXG4gICAgICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cbiAgICAgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxuICAgICAqXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrT2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1NlY29uZE9mRGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXG4gICAgICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cbiAgICAgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cbiAgICAgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxuICAgICAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndpdGhab25lID0gZnVuY3Rpb24gKHpvbmUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLCB6b25lKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cbiAgICAgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIHlvdSB0cnkgdG8gY29udmVydCBhIGRhdGV0aW1lIHdpdGhvdXQgYSB6b25lIHRvIGEgZGF0ZXRpbWUgd2l0aCBhIHpvbmVcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuY29udmVydCA9IGZ1bmN0aW9uICh6b25lKSB7XG4gICAgICAgIGlmICh6b25lKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmUpIHsgLy8gaWYtc3RhdGVtZW50IHNhdGlzZmllcyB0aGUgY29tcGlsZXJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJVbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb25cIiwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl96b25lLmVxdWFscyh6b25lKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlLCB0aGlzLl96b25lKTsgLy8gY2F1c2Ugem9uZSAtPiB1dGMgY29udmVyc2lvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTtcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lRGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl96b25lID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDsgLy8gY2F1c2UgbGF0ZXIgem9uZSAtPiB1dGMgY29udmVyc2lvblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG4gICAgICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXG4gICAgICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXG4gICAgICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgb3IgdW5kZWZpbmVkIHRvIGNyZWF0ZSB1bmF3YXJlIGRhdGUuXG4gICAgICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIHlvdSB0cnkgdG8gY29udmVydCBhIG5haXZlIGRhdGV0aW1lIHRvIGFuIGF3YXJlIG9uZS5cbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9ab25lID0gZnVuY3Rpb24gKHpvbmUpIHtcbiAgICAgICAgaWYgKHpvbmUpIHtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl96b25lLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBuZXcgRGF0ZVRpbWUoKTtcbiAgICAgICAgICAgIHJlc3VsdC51dGNEYXRlID0gdGhpcy51dGNEYXRlO1xuICAgICAgICAgICAgcmVzdWx0Ll96b25lID0gem9uZTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXG4gICAgICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cbiAgICAgKiBUaGlzIGlzIGJlY2F1c2UgRGF0ZSBjYWxjdWxhdGVzIGdldFVUQ1goKSBmcm9tIGdldFgoKSBhcHBseWluZyBsb2NhbCB0aW1lIHpvbmUuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvRGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkgLSAxLCB0aGlzLmRheSgpLCB0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxuICAgICAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxuICAgICAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgeW91IHRyeSB0byBjb252ZXJ0IGEgbmFpdmUgZGF0ZXRpbWUgdG8gYW4gYXdhcmUgb25lLlxuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b0V4Y2VsID0gZnVuY3Rpb24gKHRpbWVab25lKSB7XG4gICAgICAgIHZhciBkdCA9IHRoaXM7XG4gICAgICAgIGlmICh0aW1lWm9uZSAmJiAoIXRoaXMuX3pvbmUgfHwgIXRpbWVab25lLmVxdWFscyh0aGlzLl96b25lKSkpIHtcbiAgICAgICAgICAgIGR0ID0gdGhpcy50b1pvbmUodGltZVpvbmUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIFVUQ1xuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxuICAgICAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y0V4Y2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLl91bml4VGltZVN0YW1wVG9FeGNlbCA9IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAoKG4pIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKSArIDI1NTY5O1xuICAgICAgICAvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXG4gICAgICAgIHZhciBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEltcGxlbWVudGF0aW9uLlxuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcbiAgICAgICAgdmFyIGFtb3VudDtcbiAgICAgICAgdmFyIHU7XG4gICAgICAgIGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcbiAgICAgICAgICAgIGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xuICAgICAgICAgICAgdSA9IGR1cmF0aW9uLnVuaXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFtb3VudCA9IChhMSk7XG4gICAgICAgICAgICB1ID0gdW5pdDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHV0Y1RtLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XG4gICAgfTtcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuYWRkTG9jYWwgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcbiAgICAgICAgdmFyIGFtb3VudDtcbiAgICAgICAgdmFyIHU7XG4gICAgICAgIGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcbiAgICAgICAgICAgIGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xuICAgICAgICAgICAgdSA9IGR1cmF0aW9uLnVuaXQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFtb3VudCA9IChhMSk7XG4gICAgICAgICAgICB1ID0gdW5pdDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbG9jYWxUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLnpvbmVEYXRlLCBhbW91bnQsIHUpO1xuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IChhbW91bnQgPj0gMCA/IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwIDogdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uRG93bik7XG4gICAgICAgICAgICB2YXIgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbSwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0sIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cbiAgICAgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcbiAgICAgKiBuZWNlc3NhcnkuXG4gICAgICogQHRocm93cyBBcmd1bWVudC5BbW91bnQgaWYgYW1vdW50IGlzIG5vdCBmaW5pdGUgb3IgaWYgaXQncyBub3QgYW4gaW50ZWdlciBhbmQgeW91J3JlIGFkZGluZyBtb250aHMgb3IgeWVhcnNcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50LlVuaXQgZm9yIGludmFsaWQgdGltZSB1bml0XG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLl9hZGRUb1RpbWVTdHJ1Y3QgPSBmdW5jdGlvbiAodG0sIGFtb3VudCwgdW5pdCkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzRmluaXRlKGFtb3VudCksIFwiQXJndW1lbnQuQW1vdW50XCIsIFwiYW1vdW50IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyXCIpO1xuICAgICAgICB2YXIgeWVhcjtcbiAgICAgICAgdmFyIG1vbnRoO1xuICAgICAgICB2YXIgZGF5O1xuICAgICAgICB2YXIgaG91cjtcbiAgICAgICAgdmFyIG1pbnV0ZTtcbiAgICAgICAgdmFyIHNlY29uZDtcbiAgICAgICAgdmFyIG1pbGxpO1xuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCkpO1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDEwMDApKTtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDYwMDAwKSk7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMzYwMDAwMCkpO1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogODY0MDAwMDApKTtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuV2VlazpcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6IHtcbiAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkobWF0aC5pc0ludChhbW91bnQpLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIG1vbnRoc1wiKTtcbiAgICAgICAgICAgICAgICAvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcbiAgICAgICAgICAgICAgICBpZiAoYW1vdW50ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xuICAgICAgICAgICAgICAgICAgICBtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmNlaWwoYW1vdW50KSksIDEyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF5ID0gTWF0aC5taW4odG0uY29tcG9uZW50cy5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XG4gICAgICAgICAgICAgICAgbWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG4gICAgICAgICAgICAgICAgc2Vjb25kID0gdG0uY29tcG9uZW50cy5zZWNvbmQ7XG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG1hdGguaXNJbnQoYW1vdW50KSwgXCJBcmd1bWVudC5BbW91bnRcIiwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiB5ZWFyc1wiKTtcbiAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xuICAgICAgICAgICAgICAgIG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcbiAgICAgICAgICAgICAgICBkYXkgPSBNYXRoLm1pbih0bS5jb21wb25lbnRzLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSk7XG4gICAgICAgICAgICAgICAgaG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcbiAgICAgICAgICAgICAgICBzZWNvbmQgPSB0bS5jb21wb25lbnRzLnNlY29uZDtcbiAgICAgICAgICAgICAgICBtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LlVuaXRcIiwgXCJpbnZhbGlkIHRpbWUgdW5pdFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YiA9IGZ1bmN0aW9uIChhMSwgdW5pdCkge1xuICAgICAgICBpZiAodHlwZW9mIGExID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gYTE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoLTEgKiBhbW91bnQsIHVuaXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gYTE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YkxvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgYTEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogYTEsIHVuaXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkTG9jYWwoYTEubXVsdGlwbHkoLTEpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xuICAgICAqIEByZXR1cm4gdGhpcyAtIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRpZmYgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIC0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZEYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxuICAgICAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhcnRPZlllYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA8PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSBtb21lbnQgaW4gdGltZSBpbiBVVENcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuZXF1YWxzKG90aGVyLnV0Y0RhdGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxuICAgICAgICAgICAgJiYgKCF0aGlzLl96b25lKSA9PT0gKCFvdGhlci5fem9uZSlcbiAgICAgICAgICAgICYmICgoIXRoaXMuX3pvbmUgJiYgIW90aGVyLl96b25lKSB8fCAodGhpcy5fem9uZSAmJiBvdGhlci5fem9uZSAmJiB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlckVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyA+PSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQcm9wZXIgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIGFueSBJQU5BIHpvbmUgY29udmVydGVkIHRvIElTTyBvZmZzZXRcbiAgICAgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMyswMTowMFwiIGZvciBFdXJvcGUvQW1zdGVyZGFtXG4gICAgICogVW5hd2FyZSBkYXRlcyBoYXZlIG5vIHpvbmUgaW5mb3JtYXRpb24gYXQgdGhlIGVuZC5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHMgKyB0aW1lem9uZV8xLlRpbWVab25lLm9mZnNldFRvU3RyaW5nKHRoaXMub2Zmc2V0KCkpOyAvLyBjb252ZXJ0IElBTkEgbmFtZSB0byBvZmZzZXRcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBVVEMgYW5kIHRoZW4gcmV0dXJuIElTTyBzdHJpbmcgZW5kaW5nIGluICdaJy4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIERhdGUjdG9JU09TdHJpbmcoKVxuICAgICAqIGUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzIEV1cm9wZS9BbXN0ZXJkYW1cIiBiZWNvbWVzIFwiMjAxNC0wMS0wMVQyMjoxNTozM1pcIi5cbiAgICAgKiBVbmF3YXJlIGRhdGVzIGFyZSBhc3N1bWVkIHRvIGJlIGluIFVUQ1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvWm9uZSh0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS5mb3JtYXQoXCJ5eXl5LU1NLWRkVEhIOm1tOnNzLlNTU1paWlpaXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2l0aFpvbmUodGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSkuZm9ybWF0KFwieXl5eS1NTS1kZFRISDptbTpzcy5TU1NaWlpaWlwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXG4gICAgICogc3BlY2lmaWVkIGZvcm1hdC4gU2VlIExETUwubWQgZm9yIHN1cHBvcnRlZCBmb3JtYXRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXG4gICAgICogQHBhcmFtIGxvY2FsZSBPcHRpb25hbCwgbm9uLWVuZ2xpc2ggZm9ybWF0IG1vbnRoIG5hbWVzIGV0Yy5cbiAgICAgKiBAcmV0dXJuIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBEYXRlVGltZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gb3JtYXRTdHJpbmcgZm9yIGludmFsaWQgZm9ybWF0IHBhdHRlcm5cbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGZvcm1hdFN0cmluZywgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy5fem9uZSwgZm9ybWF0U3RyaW5nLCBsb2NhbGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XG4gICAgICogQHBhcmFtIHMgdGhlIHN0cmluZyB0byBwYXJzZVxuICAgICAqIEBwYXJhbSBmb3JtYXQgdGhlIGZvcm1hdCB0aGUgc3RyaW5nIGlzIGluLiBTZWUgTERNTC5tZCBmb3Igc3VwcG9ydGVkIGZvcm1hdHMuXG4gICAgICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxuICAgICAqIEBwYXJhbSBsb2NhbGUgT3B0aW9uYWwsIGRpZmZlcmVudCBzZXR0aW5ncyBmb3IgY29uc3RhbnRzIGxpa2UgJ0FNJyBldGNcbiAgICAgKiBAcGFyYW0gYWxsb3dUcmFpbGluZyBBbGxvdyB0cmFpbGluZyBjaGFyYWN0ZXJzIGluIHRoZSBzb3VyY2Ugc3RyaW5nXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3IgaWYgdGhlIGdpdmVuIGRhdGVUaW1lU3RyaW5nIGlzIHdyb25nIG9yIG5vdCBhY2NvcmRpbmcgdG8gdGhlIHBhdHRlcm5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGlmIHRoZSBnaXZlbiBmb3JtYXQgc3RyaW5nIGlzIGludmFsaWRcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wYXJzZSA9IGZ1bmN0aW9uIChzLCBmb3JtYXQsIHpvbmUsIGxvY2FsZSwgYWxsb3dUcmFpbGluZykge1xuICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUsIGFsbG93VHJhaWxpbmcgfHwgZmFsc2UsIGxvY2FsZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHBhcnNlZC50aW1lLCBwYXJzZWQuem9uZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICghKDAsIGVycm9yXzEuZXJyb3JJcykoZSwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIpKSB7XG4gICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIlBhcnNlRXJyb3JcIiwgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cbiAgICAgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl96b25lLmtpbmQoKSAhPT0gdGltZXpvbmVfMS5UaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgKyBcIiBcIiArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gc2VwYXJhdGUgSUFOQSBuYW1lIG9yIFwibG9jYWx0aW1lXCIgd2l0aCBhIHNwYWNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEYXRlVGltZS5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyBpbiBVVEMgd2l0aG91dCB0aW1lIHpvbmUgaW5mb1xuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1V0Y1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS50b1N0cmluZygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU3BsaXQgYSBjb21iaW5lZCBJU08gZGF0ZXRpbWUgYW5kIHRpbWV6b25lIGludG8gZGF0ZXRpbWUgYW5kIHRpbWV6b25lXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZSA9IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgIHZhciB0cmltbWVkID0gcy50cmltKCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXCJcIiwgXCJcIl07XG4gICAgICAgIHZhciBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJ3aXRob3V0IERTVFwiKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRfMSA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUocy5zbGljZSgwLCBpbmRleCAtIDEpKTtcbiAgICAgICAgICAgIHJlc3VsdF8xWzFdICs9IFwiIHdpdGhvdXQgRFNUXCI7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XzE7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XG4gICAgICAgIGlmIChpbmRleCA8IDgpIHtcbiAgICAgICAgICAgIGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBY3R1YWwgdGltZSBzb3VyY2UgaW4gdXNlLiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgYWxsb3dzIHRvXG4gICAgICogZmFrZSB0aW1lIGluIHRlc3RzLiBEYXRlVGltZS5ub3dMb2NhbCgpIGFuZCBEYXRlVGltZS5ub3dVdGMoKVxuICAgICAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cbiAgICAgKi9cbiAgICBEYXRlVGltZS50aW1lU291cmNlID0gbmV3IHRpbWVzb3VyY2VfMS5SZWFsVGltZVNvdXJjZSgpO1xuICAgIHJldHVybiBEYXRlVGltZTtcbn0oKSk7XG5leHBvcnRzLkRhdGVUaW1lID0gRGF0ZVRpbWU7XG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGBhYCBpcyBzaW1pbGFyIHRvIGEgVGltZVpvbmUgd2l0aG91dCB1c2luZyB0aGUgaW5zdGFuY2VvZiBvcGVyYXRvci5cbiAqIEl0IGNoZWNrcyBmb3IgdGhlIGF2YWlsYWJpbGl0eSBvZiB0aGUgZnVuY3Rpb25zIHVzZWQgaW4gdGhlIERhdGVUaW1lIGltcGxlbWVudGF0aW9uXG4gKiBAcGFyYW0gYSB0aGUgb2JqZWN0IHRvIGNoZWNrXG4gKiBAcmV0dXJucyBhIGlzIFRpbWVab25lLWxpa2VcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBpc1RpbWVab25lKGEpIHtcbiAgICBpZiAoYSAmJiB0eXBlb2YgYSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBpZiAodHlwZW9mIGEubm9ybWFsaXplWm9uZVRpbWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgJiYgdHlwZW9mIGEuYWJicmV2aWF0aW9uRm9yVXRjID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLnN0YW5kYXJkT2Zmc2V0Rm9yVXRjID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmlkZW50aWNhbCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5lcXVhbHMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgJiYgdHlwZW9mIGEua2luZCA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5jbG9uZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG4vKipcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIERhdGVUaW1lLiBOb3RlIHRoYXQgaXQgZG9lcyBub3Qgd29yayBmb3Igc3ViIGNsYXNzZXMuIEhvd2V2ZXIsIHVzZSB0aGlzIHRvIGJlIHJvYnVzdFxuICogYWdhaW5zdCBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIGxpYnJhcnkgaW4gb25lIHByb2Nlc3MgaW5zdGVhZCBvZiBpbnN0YW5jZW9mXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBpc0RhdGVUaW1lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIkRhdGVUaW1lXCI7XG59XG5leHBvcnRzLmlzRGF0ZVRpbWUgPSBpc0RhdGVUaW1lO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0ZXRpbWUuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIFRpbWUgZHVyYXRpb25cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmlzRHVyYXRpb24gPSBleHBvcnRzLkR1cmF0aW9uID0gZXhwb3J0cy5taWxsaXNlY29uZHMgPSBleHBvcnRzLnNlY29uZHMgPSBleHBvcnRzLm1pbnV0ZXMgPSBleHBvcnRzLmhvdXJzID0gZXhwb3J0cy5kYXlzID0gZXhwb3J0cy5tb250aHMgPSBleHBvcnRzLnllYXJzID0gdm9pZCAwO1xudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZnVuY3Rpb24geWVhcnMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi55ZWFycyhuKTtcbn1cbmV4cG9ydHMueWVhcnMgPSB5ZWFycztcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICovXG5mdW5jdGlvbiBtb250aHMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi5tb250aHMobik7XG59XG5leHBvcnRzLm1vbnRocyA9IG1vbnRocztcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIGRheXMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi5kYXlzKG4pO1xufVxuZXhwb3J0cy5kYXlzID0gZGF5cztcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gaG91cnMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi5ob3VycyhuKTtcbn1cbmV4cG9ydHMuaG91cnMgPSBob3Vycztcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIG1pbnV0ZXMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi5taW51dGVzKG4pO1xufVxuZXhwb3J0cy5taW51dGVzID0gbWludXRlcztcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmZ1bmN0aW9uIHNlY29uZHMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xufVxuZXhwb3J0cy5zZWNvbmRzID0gc2Vjb25kcztcbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICovXG5mdW5jdGlvbiBtaWxsaXNlY29uZHMobikge1xuICAgIHJldHVybiBEdXJhdGlvbi5taWxsaXNlY29uZHMobik7XG59XG5leHBvcnRzLm1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kcztcbi8qKlxuICogVGltZSBkdXJhdGlvbiB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhbiBhbW91bnQgYW5kIGEgdW5pdCBlLmcuXG4gKiAnMSBNb250aCcgb3IgJzE2NiBTZWNvbmRzJy4gVGhlIHVuaXQgaXMgcHJlc2VydmVkIHRocm91Z2ggY2FsY3VsYXRpb25zLlxuICpcbiAqIEl0IGhhcyB0d28gc2V0cyBvZiBnZXR0ZXIgZnVuY3Rpb25zOlxuICogLSBzZWNvbmQoKSwgbWludXRlKCksIGhvdXIoKSBldGMsIHNpbmd1bGFyIGZvcm06IHRoZXNlIGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zLlxuICogICBUaGVzZSByZXR1cm4gYSBwYXJ0IG9mIHlvdXIgc3RyaW5nIHJlcHJlc2VudGF0aW9uLiBFLmcuIGZvciAyNTAwIG1pbGxpc2Vjb25kcywgdGhlIG1pbGxpc2Vjb25kKCkgcGFydCB3b3VsZCBiZSA1MDBcbiAqIC0gc2Vjb25kcygpLCBtaW51dGVzKCksIGhvdXJzKCkgZXRjLCBwbHVyYWwgZm9ybTogdGhlc2UgcmV0dXJuIHRoZSB0b3RhbCBhbW91bnQgcmVwcmVzZW50ZWQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgdW5pdC5cbiAqL1xudmFyIER1cmF0aW9uID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gRHVyYXRpb24oaTEsIHVuaXQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFsbG93IG5vdCB1c2luZyBpbnN0YW5jZW9mXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmtpbmQgPSBcIkR1cmF0aW9uXCI7XG4gICAgICAgIGlmICh0eXBlb2YgaTEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIC8vIGFtb3VudCt1bml0IGNvbnN0cnVjdG9yXG4gICAgICAgICAgICB2YXIgYW1vdW50ID0gaTE7XG4gICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzRmluaXRlKGFtb3VudCksIFwiQXJndW1lbnQuQW1vdW50XCIsIFwiYW1vdW50IHNob3VsZCBiZSBmaW5pdGU6ICVkXCIsIGFtb3VudCk7XG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG4gICAgICAgICAgICB0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHRoaXMuX3VuaXQpICYmIHRoaXMuX3VuaXQgPj0gMCAmJiB0aGlzLl91bml0IDwgYmFzaWNzXzEuVGltZVVuaXQuTUFYLCBcIkFyZ3VtZW50LlVuaXRcIiwgXCJJbnZhbGlkIHRpbWUgdW5pdCAlZFwiLCB0aGlzLl91bml0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgaTEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIC8vIHN0cmluZyBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgdmFyIHMgPSBpMTtcbiAgICAgICAgICAgIHZhciB0cmltbWVkID0gcy50cmltKCk7XG4gICAgICAgICAgICBpZiAodHJpbW1lZC5tYXRjaCgvXi0/XFxkXFxkPyg6XFxkXFxkPyg6XFxkXFxkPyguXFxkXFxkP1xcZD8pPyk/KT8kLykpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2lnbiA9IDE7XG4gICAgICAgICAgICAgICAgdmFyIGhvdXJzXzEgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBtaW51dGVzXzEgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBzZWNvbmRzXzEgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBtaWxsaXNlY29uZHNfMSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHBhcnRzID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHBhcnRzLmxlbmd0aCA+IDAgJiYgcGFydHMubGVuZ3RoIDwgNCwgXCJBcmd1bWVudC5TXCIsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0cmltbWVkLmNoYXJBdCgwKSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnbiA9IC0xO1xuICAgICAgICAgICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaG91cnNfMSA9ICtwYXJ0c1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbWludXRlc18xID0gK3BhcnRzWzFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZHNfMSA9ICtzZWNvbmRQYXJ0c1swXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlY29uZFBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kc18xID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kc18xICsgMTAwMCAqIHNlY29uZHNfMSArIDYwMDAwICogbWludXRlc18xICsgMzYwMDAwMCAqIGhvdXJzXzEpO1xuICAgICAgICAgICAgICAgIC8vIGZpbmQgbG93ZXN0IG5vbi16ZXJvIG51bWJlciBhbmQgdGFrZSB0aGF0IGFzIHVuaXRcbiAgICAgICAgICAgICAgICBpZiAobWlsbGlzZWNvbmRzXzEgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzZWNvbmRzXzEgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobWludXRlc18xICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGhvdXJzXzEgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2Ftb3VudCA9IGFtb3VudE1zZWMgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzcGxpdCA9IHRyaW1tZWQudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHNwbGl0Lmxlbmd0aCA9PT0gMiwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnJXMnXCIsIHMpO1xuICAgICAgICAgICAgICAgIHZhciBhbW91bnQgPSBwYXJzZUZsb2F0KHNwbGl0WzBdKTtcbiAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzRmluaXRlKGFtb3VudCksIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJyVzJywgY2Fubm90IHBhcnNlIGFtb3VudFwiLCBzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljcy5zdHJpbmdUb1RpbWVVbml0KHNwbGl0WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpMSA9PT0gdW5kZWZpbmVkICYmIHVuaXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gZGVmYXVsdCBjb25zdHJ1Y3RvclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gMDtcbiAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShmYWxzZSwgXCJBcmd1bWVudC5BbW91bnRcIiwgXCJpbnZhbGlkIGNvbnN0cnVjdG9yIGFyZ3VtZW50c1wiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAgICAgKi9cbiAgICBEdXJhdGlvbi55ZWFycyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5tb250aHMgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gZGF5c1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gICAgICovXG4gICAgRHVyYXRpb24uZGF5cyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5ob3VycyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbihhbW91bnQsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICAgICAqL1xuICAgIER1cmF0aW9uLm1pbnV0ZXMgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICAgICAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxuICAgICAqL1xuICAgIER1cmF0aW9uLnNlY29uZHMgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5taWxsaXNlY29uZHMgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIGFub3RoZXIgaW5zdGFuY2Ugb2YgRHVyYXRpb24gd2l0aCB0aGUgc2FtZSB2YWx1ZS5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50LCB0aGlzLl91bml0KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhpcyBkdXJhdGlvbiBleHByZXNzZWQgaW4gZGlmZmVyZW50IHVuaXQgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKS5cbiAgICAgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXG4gICAgICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFzID0gZnVuY3Rpb24gKHVuaXQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiB1bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XG4gICAgICAgICAgICB2YXIgdGhpc01vbnRocyA9ICh0aGlzLl91bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcbiAgICAgICAgICAgIHZhciByZXFNb250aHMgPSAodW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0aGlzTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xuICAgICAgICAgICAgdmFyIHJlcU1zZWMgPSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XG4gICAgICogdGhlIHNhbWUgdW5pdC5cbiAgICAgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXG4gICAgICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAodW5pdCkge1xuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuYXModW5pdCksIHVuaXQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlKVxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcbiAgICAgKiBAcmV0dXJuIGUuZy4gNDAwIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDE1MDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnNlY29uZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcbiAgICAgKiBAcmV0dXJuIGUuZy4gMyBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDkwMDAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW51dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG4gICAgICogQHJldHVybiBlLmcuIDIgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuICAgICAqIEByZXR1cm4gZS5nLiAxLjUgZm9yIGEgNTQwMDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaG91cnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxuICAgICAqIGR1cmluZyBEU1QgY2hhbmdlcykuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmhvdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSkuXG4gICAgICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxuICAgICAqIG5vdywgd2UgZG8gbm90IGhhdmUgYSBkYXlzKCkgZnVuY3Rpb25cbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuICAgICAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlSG91cnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDM2MDAwMDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIGRheXMhXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRheXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcbiAgICAgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubW9udGhzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnllYXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlWWVhcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl91bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9hbW91bnQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSAvIDEyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvXG4gICAgICAgICAgICAgICAgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBbW91bnQgb2YgdW5pdHMgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hbW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgdW5pdCB0aGlzIGR1cmF0aW9uIHdhcyBjcmVhdGVkIHdpdGhcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTaWduXG4gICAgICogQHJldHVybiBcIi1cIiBpZiB0aGUgZHVyYXRpb24gaXMgbmVnYXRpdmVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuc2lnbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hbW91bnQgPCAwID8gXCItXCIgOiBcIlwiKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDwgb3RoZXIubWlsbGlzZWNvbmRzKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICB2YXIgY29udmVydGVkID0gb3RoZXIuY29udmVydCh0aGlzLl91bml0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gY29udmVydGVkLmFtb3VudCgpICYmIHRoaXMuX3VuaXQgPT09IGNvbnZlcnRlZC51bml0KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXG4gICAgICogUmV0dXJucyBmYWxzZSBpZiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHdoZXRoZXIgdGhleSBhcmUgZXF1YWwgaW4gYWxsIHRpbWUgem9uZXNcbiAgICAgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxuICAgICAqXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5lcXVhbHNFeGFjdCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gb3RoZXIuX3VuaXQpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5fYW1vdW50ID09PSBvdGhlci5fYW1vdW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTsgLy8gY2FuIGNvbXBhcmUgbW9udGhzIGFuZCB5ZWFyc1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkgJiYgb3RoZXIudW5pdCgpIDwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtaWxsaXNlY29uZHMgdGhyb3VnaCBob3Vyc1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBjYW5ub3QgY29tcGFyZSBkYXlzIHRvIGFueXRoaW5nIGVsc2VcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogU2FtZSB1bml0IGFuZCBzYW1lIGFtb3VudFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgaXMgYSBub24temVybyBsZW5ndGggZHVyYXRpb25cbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubm9uWmVybyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCAhPT0gMDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGlzIGEgemVyby1sZW5ndGggZHVyYXRpb25cbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuemVybyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gMDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPj0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG4gICAgICogQHJldHVybiBUaGUgbWluaW11bSAobW9zdCBuZWdhdGl2ZSkgb2YgdGhpcyBhbmQgb3RoZXJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIChtb3N0IHBvc2l0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogTXVsdGlwbHkgd2l0aCBhIGZpeGVkIG51bWJlci5cbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAqIHZhbHVlKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAqIHZhbHVlLCB0aGlzLl91bml0KTtcbiAgICB9O1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgJiYgdmFsdWUgIT09IDAsIFwiQXJndW1lbnQuVmFsdWVcIiwgXCJjYW5ub3QgZGl2aWRlIGJ5ICVkXCIsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHZhbHVlLmFtb3VudCgpICE9PSAwLCBcIkFyZ3VtZW50LlZhbHVlXCIsIFwiY2Fubm90IGRpdmlkZSBieSAwXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgLyB2YWx1ZS5taWxsaXNlY29uZHMoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQWRkIGEgZHVyYXRpb24uXG4gICAgICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyArIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICsgdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU3VidHJhY3QgYSBkdXJhdGlvbi5cbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC0gdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLSB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoZSBkdXJhdGlvbiBpLmUuIHJlbW92ZSB0aGUgc2lnbi5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fYW1vdW50ID49IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFN0cmluZyBpbiBbLV1oaGhoOm1tOnNzLm5ubiBub3RhdGlvbi4gQWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0Z1bGxTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvSG1zU3RyaW5nKHRydWUpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcbiAgICAgKiBhcmUgY2hvcHBlZCBvZmYgaWYgemVyb1xuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0htc1N0cmluZyA9IGZ1bmN0aW9uIChmdWxsKSB7XG4gICAgICAgIGlmIChmdWxsID09PSB2b2lkIDApIHsgZnVsbCA9IGZhbHNlOyB9XG4gICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgICAgICBpZiAoZnVsbCB8fCB0aGlzLm1pbGxpc2Vjb25kKCkgPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5zZWNvbmQoKSA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuc2Vjb25kKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5taW51dGUoKSA+IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWludXRlKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc2lnbigpICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMud2hvbGVIb3VycygpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU3RyaW5nIGluIElTTyA4NjAxIG5vdGF0aW9uIGUuZy4gJ1AxTScgZm9yIG9uZSBtb250aCBvciAnUFQxTScgZm9yIG9uZSBtaW51dGVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUudG9Jc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fdW5pdCkge1xuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDoge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArICh0aGlzLl9hbW91bnQgLyAxMDAwKS50b0ZpeGVkKDMpICsgXCJTXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDoge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIlNcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFRcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjsgLy8gbm90ZSB0aGUgXCJUXCIgdG8gZGlzYW1iaWd1YXRlIHRoZSBcIk1cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiSFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJEXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJXXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiWVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdC5cIik7IC8vIHByb2dyYW1taW5nIGVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gd2l0aCBhbW91bnQgYW5kIHVuaXQgZS5nLiAnMS41IHllYXJzJyBvciAnLTEgZGF5J1xuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIiBcIiArIGJhc2ljcy50aW1lVW5pdFRvU3RyaW5nKHRoaXMuX3VuaXQsIHRoaXMuX2Ftb3VudCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoaXMgJSB1bml0LCBhbHdheXMgcG9zaXRpdmVcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuX3BhcnQgPSBmdW5jdGlvbiAodW5pdCkge1xuICAgICAgICB2YXIgbmV4dFVuaXQ7XG4gICAgICAgIC8vIG5vdGUgbm90IGFsbCB1bml0cyBhcmUgdXNlZCBoZXJlOiBXZWVrcyBhbmQgWWVhcnMgYXJlIHJ1bGVkIG91dFxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuWWVhcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKSkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtc2VjcyA9IChiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpICUgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMobmV4dFVuaXQpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcbiAgICB9O1xuICAgIHJldHVybiBEdXJhdGlvbjtcbn0oKSk7XG5leHBvcnRzLkR1cmF0aW9uID0gRHVyYXRpb247XG4vKipcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIER1cmF0aW9uLiBOb3RlIHRoYXQgaXQgZG9lcyBub3Qgd29yayBmb3Igc3ViIGNsYXNzZXMuIEhvd2V2ZXIsIHVzZSB0aGlzIHRvIGJlIHJvYnVzdFxuICogYWdhaW5zdCBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIGxpYnJhcnkgaW4gb25lIHByb2Nlc3MgaW5zdGVhZCBvZiBpbnN0YW5jZW9mXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBpc0R1cmF0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIkR1cmF0aW9uXCI7XG59XG5leHBvcnRzLmlzRHVyYXRpb24gPSBpc0R1cmF0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZHVyYXRpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKipcbiAqIENvcHlyaWdodCAoYykgMjAxOSBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNvbnZlcnRFcnJvciA9IGV4cG9ydHMuZXJyb3JJcyA9IGV4cG9ydHMuZXJyb3IgPSBleHBvcnRzLnRocm93RXJyb3IgPSB2b2lkIDA7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpO1xuLyoqXG4gKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWVzc2FnZVxuICogQHBhcmFtIG5hbWUgZXJyb3IgbmFtZSwgd2l0aG91dCB0aW1lem9uZWNvbXBsZXRlIHByZWZpeFxuICogQHBhcmFtIGZvcm1hdCBtZXNzYWdlIHdpdGggcGVyY2VudC1zdHlsZSBwbGFjZWhvbGRlcnNcbiAqIEBwYXJhbSBhcmdzIGFyZ3VtZW50cyBmb3IgdGhlIHBsYWNlaG9sZGVyc1xuICogQHRocm93cyB0aGUgZ2l2ZW4gZXJyb3JcbiAqL1xuZnVuY3Rpb24gdGhyb3dFcnJvcihuYW1lLCBmb3JtYXQpIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMjsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGFyZ3NbX2kgLSAyXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgfVxuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcih1dGlsLmZvcm1hdChmb3JtYXQsIGFyZ3MpKTtcbiAgICBlcnJvci5uYW1lID0gXCJ0aW1lem9uZWNvbXBsZXRlLlwiICsgbmFtZTtcbiAgICB0aHJvdyBlcnJvcjtcbn1cbmV4cG9ydHMudGhyb3dFcnJvciA9IHRocm93RXJyb3I7XG4vKipcbiAqIFJldHVybnMgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWVzc2FnZVxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSBmb3JtYXRcbiAqIEBwYXJhbSBhcmdzXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gZXJyb3IobmFtZSwgZm9ybWF0KSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDI7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICBhcmdzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IodXRpbC5mb3JtYXQoZm9ybWF0LCBhcmdzKSk7XG4gICAgZXJyb3IubmFtZSA9IFwidGltZXpvbmVjb21wbGV0ZS5cIiArIG5hbWU7XG4gICAgcmV0dXJuIGVycm9yO1xufVxuZXhwb3J0cy5lcnJvciA9IGVycm9yO1xuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWZmIGBlcnJvci5uYW1lYCBpcyBlcXVhbCB0byBvciBpbmNsdWRlZCBieSBgbmFtZWBcbiAqIEBwYXJhbSBlcnJvclxuICogQHBhcmFtIG5hbWUgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3NcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBlcnJvcklzKGVycm9yLCBuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBlcnJvci5uYW1lID09PSBcInRpbWV6b25lY29tcGxldGUuXCIgKyBuYW1lO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVycm9yLm5hbWUuc3RhcnRzV2l0aChcInRpbWV6b25lY29tcGxldGUuXCIpICYmIG5hbWUuaW5jbHVkZXMoZXJyb3IubmFtZS5zdWJzdHIoXCJ0aW1lem9uZWNvbXBsZXRlLlwiLmxlbmd0aCkpO1xuICAgIH1cbn1cbmV4cG9ydHMuZXJyb3JJcyA9IGVycm9ySXM7XG4vKipcbiAqIENvbnZlcnRzIGFsbCBlcnJvcnMgdGhyb3duIGJ5IGBjYmAgdG8gdGhlIGdpdmVuIGVycm9yIG5hbWVcbiAqIEBwYXJhbSBlcnJvck5hbWVcbiAqIEBwYXJhbSBjYlxuICogQHRocm93cyBbZXJyb3JOYW1lXVxuICovXG5mdW5jdGlvbiBjb252ZXJ0RXJyb3IoZXJyb3JOYW1lLCBjYikge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjYigpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck5hbWUsIGUubWVzc2FnZSk7XG4gICAgfVxufVxuZXhwb3J0cy5jb252ZXJ0RXJyb3IgPSBjb252ZXJ0RXJyb3I7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1lcnJvci5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xuICovXG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmZvcm1hdCA9IHZvaWQgMDtcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xudmFyIGxvY2FsZV8xID0gcmVxdWlyZShcIi4vbG9jYWxlXCIpO1xudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcbi8qKlxuICogRm9ybWF0IHRoZSBzdXBwbGllZCBkYXRlVGltZSB3aXRoIHRoZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBMRE1MIGZvcm1hdCBwYXR0ZXJuIChzZWUgTERNTC5tZClcbiAqIEBwYXJhbSBsb2NhbGUgT3RoZXIgZm9ybWF0IG9wdGlvbnMgc3VjaCBhcyBtb250aCBuYW1lc1xuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gb3JtYXRTdHJpbmcgZm9yIGludmFsaWQgZm9ybWF0IHBhdHRlcm5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gKi9cbmZ1bmN0aW9uIGZvcm1hdChkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lLCBmb3JtYXRTdHJpbmcsIGxvY2FsZSkge1xuICAgIGlmIChsb2NhbGUgPT09IHZvaWQgMCkgeyBsb2NhbGUgPSB7fTsgfVxuICAgIHZhciBtZXJnZWRMb2NhbGUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgbG9jYWxlXzEuREVGQVVMVF9MT0NBTEUpLCBsb2NhbGUpO1xuICAgIHZhciB0b2tlbnMgPSAoMCwgdG9rZW5fMS50b2tlbml6ZSkoZm9ybWF0U3RyaW5nKTtcbiAgICB2YXIgcmVzdWx0ID0gXCJcIjtcbiAgICBmb3IgKHZhciBfaSA9IDAsIHRva2Vuc18xID0gdG9rZW5zOyBfaSA8IHRva2Vuc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNfMVtfaV07XG4gICAgICAgIHZhciB0b2tlblJlc3VsdCA9IHZvaWQgMDtcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkVSQTpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5ZRUFSOlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuUVVBUlRFUjpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuTU9OVEg6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5EQVk6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLldFRUtEQVk6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWVBFUklPRDpcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5IT1VSOlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuTUlOVVRFOlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5TRUNPTkQ6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlpPTkU6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0Wm9uZShkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lID8gbG9jYWxab25lIDogdW5kZWZpbmVkLCB0b2tlbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLldFRUs6XG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5JREVOVElUWTogLy8gaW50ZW50aW9uYWwgZmFsbHRocm91Z2hcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSB0b2tlblJlc3VsdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC50cmltKCk7XG59XG5leHBvcnRzLmZvcm1hdCA9IGZvcm1hdDtcbi8qKlxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdEVyYShkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xuICAgIHZhciBBRCA9IGRhdGVUaW1lLnllYXIgPiAwO1xuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYUFiYnJldmlhdGVkWzBdIDogbG9jYWxlLmVyYUFiYnJldmlhdGVkWzFdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IGxvY2FsZS5lcmFXaWRlWzBdIDogbG9jYWxlLmVyYVdpZGVbMV0pO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYU5hcnJvd1swXSA6IGxvY2FsZS5lcmFOYXJyb3dbMV0pO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgIH1cbn1cbi8qKlxuICogRm9ybWF0IHRoZSB5ZWFyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0WWVhcihkYXRlVGltZSwgdG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwieVwiOlxuICAgICAgICBjYXNlIFwiWVwiOlxuICAgICAgICBjYXNlIFwiclwiOlxuICAgICAgICAgICAgdmFyIHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA9PT0gMikgeyAvLyBTcGVjaWFsIGNhc2U6IGV4YWN0bHkgdHdvIGNoYXJhY3RlcnMgYXJlIGV4cGVjdGVkXG4gICAgICAgICAgICAgICAgeWVhclZhbHVlID0geWVhclZhbHVlLnNsaWNlKC0yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB5ZWFyVmFsdWU7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLyoqXG4gKiBGb3JtYXQgdGhlIHF1YXJ0ZXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBmb3IgaW52YWxpZCBmb3JtYXQgcGF0dGVyblxuICovXG5mdW5jdGlvbiBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xuICAgIHZhciBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcIlFcIjpcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUucXVhcnRlckxldHRlciArIHF1YXJ0ZXI7XG4gICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgbG9jYWxlLnF1YXJ0ZXJXb3JkO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJxXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyTGV0dGVyICsgcXVhcnRlcjtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyV29yZDtcbiAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xuICAgIH1cbn1cbi8qKlxuICogRm9ybWF0IHRoZSBtb250aFxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRNb250aChkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJNXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5sb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5tb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJMXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZUxvbmdNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XG4gICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xuICAgIH1cbn1cbi8qKlxuICogRm9ybWF0IHRoZSB3ZWVrIG51bWJlclxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKSB7XG4gICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJ3XCIpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtPZk1vbnRoKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuICAgIH1cbn1cbi8qKlxuICogRm9ybWF0IHRoZSBkYXkgb2YgdGhlIG1vbnRoIChvciB5ZWFyKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pIHtcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwiZFwiOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5kYXkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIGNhc2UgXCJEXCI6XG4gICAgICAgICAgICB2YXIgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSB3ZWVrXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xuICAgIHZhciB3ZWVrRGF5TnVtYmVyID0gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKGRhdGVUaW1lLnVuaXhNaWxsaXMpO1xuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUubG9uZ1dlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS53ZWVrZGF5TGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgRGF5IFBlcmlvZCAoQU0gb3IgUE0pXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lLCB0b2tlbiwgbG9jYWxlKSB7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcImFcIjoge1xuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA8PSAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93LmFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cucG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJiXCI6XG4gICAgICAgIGNhc2UgXCJCXCI6IHtcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPD0gMykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5taWRuaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm5vb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5taWRuaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubm9vbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93Lm1pZG5pZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyID09PSAxMiAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93Lm5vb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgIH1cbn1cbi8qKlxuICogRm9ybWF0IHRoZSBIb3VyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZSwgdG9rZW4pIHtcbiAgICB2YXIgaG91ciA9IGRhdGVUaW1lLmhvdXI7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcImhcIjpcbiAgICAgICAgICAgIGhvdXIgPSBob3VyICUgMTI7XG4gICAgICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGhvdXIgPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgY2FzZSBcIkhcIjpcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgY2FzZSBcIktcIjpcbiAgICAgICAgICAgIGhvdXIgPSBob3VyICUgMTI7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgIGNhc2UgXCJrXCI6XG4gICAgICAgICAgICBpZiAoaG91ciA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGhvdXIgPSAyNDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgbWludXRlXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0TWludXRlKGRhdGVUaW1lLCB0b2tlbikge1xuICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubWludXRlLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xufVxuLyoqXG4gKiBGb3JtYXQgdGhlIHNlY29uZHMgKG9yIGZyYWN0aW9uIG9mIGEgc2Vjb25kKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuKiogaWYgYW55IG9mIHRoZSBnaXZlbiBkYXRlVGltZSBlbGVtZW50cyBhcmUgaW52YWxpZFxuICovXG5mdW5jdGlvbiBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbikge1xuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG4gICAgICAgIGNhc2UgXCJzXCI6XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnNlY29uZC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgIHZhciBmcmFjdGlvbiA9IGRhdGVUaW1lLm1pbGxpO1xuICAgICAgICAgICAgdmFyIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KGZyYWN0aW9uLnRvU3RyaW5nKCksIDMsIFwiMFwiKTtcbiAgICAgICAgICAgIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRSaWdodChmcmFjdGlvblN0cmluZywgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG4gICAgICAgICAgICByZXR1cm4gZnJhY3Rpb25TdHJpbmcuc2xpY2UoMCwgdG9rZW4ubGVuZ3RoKTtcbiAgICAgICAgY2FzZSBcIkFcIjpcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLnNlY29uZE9mRGF5KGRhdGVUaW1lLmhvdXIsIGRhdGVUaW1lLm1pbnV0ZSwgZGF0ZVRpbWUuc2Vjb25kKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcbiAgICB9XG59XG4vKipcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcbiAqIEBwYXJhbSBjdXJyZW50VGltZSBUaGUgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB1dGNUaW1lIFRoZSB0aW1lIGluIFVUQ1xuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCB0b2tlbikge1xuICAgIGlmICghem9uZSkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgdmFyIG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xuICAgIHZhciBvZmZzZXRIb3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcbiAgICB2YXIgb2Zmc2V0SG91cnNTdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQob2Zmc2V0SG91cnMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuICAgIG9mZnNldEhvdXJzU3RyaW5nID0gKG9mZnNldCA+PSAwID8gXCIrXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyA6IFwiLVwiICsgb2Zmc2V0SG91cnNTdHJpbmcpO1xuICAgIHZhciBvZmZzZXRNaW51dGVzID0gTWF0aC5hYnMob2Zmc2V0ICUgNjApO1xuICAgIHZhciBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuICAgIHZhciByZXN1bHQ7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcIk9cIjpcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiR01UXCI7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID49IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIrXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCItXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgKz0gb2Zmc2V0SG91cnMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHRva2VuLnJhdy5zbGljZSg0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIGNhc2UgXCJaXCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1Rva2VuID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiA0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiBcIk9PT09cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogXCJPXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiB0b2tlbl8xLlRva2VuVHlwZS5aT05FXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgbmV3VG9rZW4pO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiWlwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJ6XCI6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJ2XCI6XG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUuYWJicmV2aWF0aW9uRm9yVXRjKGN1cnJlbnRUaW1lLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZS50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIFwiVlwiOlxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdCBpbXBsZW1lbnRlZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJ1bmtcIjtcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLm5hbWUoKTtcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJVbmtub3duXCI7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIFwiWFwiOlxuICAgICAgICBjYXNlIFwieFwiOlxuICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgb2Zmc2V0ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiWlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9mZnNldEhvdXJzU3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2Zmc2V0TWludXRlcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IG9mZnNldE1pbnV0ZXNTdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgY2FzZSA0OiAvLyBObyBzZWNvbmRzIGluIG91ciBpbXBsZW1lbnRhdGlvbiwgc28gdGhpcyBpcyB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjYXNlIDU6IC8vIE5vIHNlY29uZHMgaW4gb3VyIGltcGxlbWVudGF0aW9uLCBzbyB0aGlzIGlzIHRoZSBzYW1lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zm9ybWF0LmpzLm1hcCIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBHbG9iYWwgZnVuY3Rpb25zIGRlcGVuZGluZyBvbiBEYXRlVGltZS9EdXJhdGlvbiBldGNcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmFicyA9IGV4cG9ydHMubWF4ID0gZXhwb3J0cy5taW4gPSB2b2lkIDA7XG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMSBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkQyIGlmIGQxIGlzIHVuZGVmaW5lZC9udWxsLCBvciBpZiBkMSBhbmQgZDIgYXJlIG5vdCBib3RoIGRhdGV0aW1lc1xuICovXG5mdW5jdGlvbiBtaW4oZDEsIGQyKSB7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQxLCBcIkFyZ3VtZW50LkQxXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQyLCBcIkFyZ3VtZW50LkQyXCIsIFwic2Vjb25kIGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQxLmtpbmQgPT09IGQyLmtpbmQsIFwiQXJndW1lbnQuRDJcIiwgXCJleHBlY3RlZCBlaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zXCIpO1xuICAgIHJldHVybiBkMS5taW4oZDIpO1xufVxuZXhwb3J0cy5taW4gPSBtaW47XG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIERhdGVUaW1lcyBvciBEdXJhdGlvbnNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMSBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkQyIGlmIGQxIGlzIHVuZGVmaW5lZC9udWxsLCBvciBpZiBkMSBhbmQgZDIgYXJlIG5vdCBib3RoIGRhdGV0aW1lc1xuICovXG5mdW5jdGlvbiBtYXgoZDEsIGQyKSB7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQxLCBcIkFyZ3VtZW50LkQxXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQyLCBcIkFyZ3VtZW50LkQyXCIsIFwic2Vjb25kIGFyZ3VtZW50IGlzIGZhbHN5XCIpO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQxLmtpbmQgPT09IGQyLmtpbmQsIFwiQXJndW1lbnQuRDJcIiwgXCJleHBlY3RlZCBlaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zXCIpO1xuICAgIHJldHVybiBkMS5tYXgoZDIpO1xufVxuZXhwb3J0cy5tYXggPSBtYXg7XG4vKipcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EIGlmIGQgaXMgdW5kZWZpbmVkL251bGxcbiAqL1xuZnVuY3Rpb24gYWJzKGQpIHtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZCwgXCJBcmd1bWVudC5EXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG4gICAgcmV0dXJuIGQuYWJzKCk7XG59XG5leHBvcnRzLmFicyA9IGFicztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdsb2JhbHMuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICovXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRGF0ZUZ1bmN0aW9ucyA9IHZvaWQgMDtcbi8qKlxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcbiAqIHZhbHVlcywgb3Igd2UgY2FuIHRha2UgZ2V0VVRDWWVhcigpLCBnZXRVdGNNb250aCgpIGV0YyB0byBkbyB0aGF0LlxuICovXG52YXIgRGF0ZUZ1bmN0aW9ucztcbihmdW5jdGlvbiAoRGF0ZUZ1bmN0aW9ucykge1xuICAgIC8qKlxuICAgICAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXG4gICAgICovXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0XCJdID0gMF0gPSBcIkdldFwiO1xuICAgIC8qKlxuICAgICAqIFVzZSB0aGUgRGF0ZS5nZXRVVENGdWxsWWVhcigpLCBEYXRlLmdldFVUQ01vbnRoKCksIC4uLiBmdW5jdGlvbnMuXG4gICAgICovXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0VVRDXCJdID0gMV0gPSBcIkdldFVUQ1wiO1xufSkoRGF0ZUZ1bmN0aW9ucyB8fCAoZXhwb3J0cy5EYXRlRnVuY3Rpb25zID0gRGF0ZUZ1bmN0aW9ucyA9IHt9KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qYXZhc2NyaXB0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNyBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkRFRkFVTFRfTE9DQUxFID0gZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1cgPSBleHBvcnRzLkRBWV9QRVJJT0RTX1dJREUgPSBleHBvcnRzLkRBWV9QRVJJT0RTX0FCQlJFVklBVEVEID0gZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMgPSBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMgPSBleHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBleHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMgPSBleHBvcnRzLlNUQU5EX0FMT05FX0xPTkdfTU9OVEhfTkFNRVMgPSBleHBvcnRzLk1PTlRIX0xFVFRFUlMgPSBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTID0gZXhwb3J0cy5MT05HX01PTlRIX05BTUVTID0gZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX0FCQlJFVklBVElPTlMgPSBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfV09SRCA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIgPSBleHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IGV4cG9ydHMuUVVBUlRFUl9XT1JEID0gZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IGV4cG9ydHMuRVJBX05BTUVTX0FCQlJFVklBVEVEID0gZXhwb3J0cy5FUkFfTkFNRVNfV0lERSA9IGV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyA9IHZvaWQgMDtcbmV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyA9IFtcIkFcIiwgXCJCXCJdO1xuZXhwb3J0cy5FUkFfTkFNRVNfV0lERSA9IFtcIkFubm8gRG9taW5pXCIsIFwiQmVmb3JlIENocmlzdFwiXTtcbmV4cG9ydHMuRVJBX05BTUVTX0FCQlJFVklBVEVEID0gW1wiQURcIiwgXCJCQ1wiXTtcbmV4cG9ydHMuUVVBUlRFUl9MRVRURVIgPSBcIlFcIjtcbmV4cG9ydHMuUVVBUlRFUl9XT1JEID0gXCJxdWFydGVyXCI7XG5leHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcbi8qKlxuICogSW4gc29tZSBsYW5ndWFnZXMsIGRpZmZlcmVudCB3b3JkcyBhcmUgbmVjZXNzYXJ5IGZvciBzdGFuZC1hbG9uZSBxdWFydGVyIG5hbWVzXG4gKi9cbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIgPSBleHBvcnRzLlFVQVJURVJfTEVUVEVSO1xuZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX1dPUkQgPSBleHBvcnRzLlFVQVJURVJfV09SRDtcbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9BQkJSRVZJQVRJT05TID0gZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMuc2xpY2UoKTtcbmV4cG9ydHMuTE9OR19NT05USF9OQU1FUyA9IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xuZXhwb3J0cy5TSE9SVF9NT05USF9OQU1FUyA9IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXTtcbmV4cG9ydHMuTU9OVEhfTEVUVEVSUyA9IFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcbmV4cG9ydHMuU1RBTkRfQUxPTkVfTE9OR19NT05USF9OQU1FUyA9IGV4cG9ydHMuTE9OR19NT05USF9OQU1FUy5zbGljZSgpO1xuZXhwb3J0cy5TVEFORF9BTE9ORV9TSE9SVF9NT05USF9OQU1FUyA9IGV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMuc2xpY2UoKTtcbmV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyA9IGV4cG9ydHMuTU9OVEhfTEVUVEVSUy5zbGljZSgpO1xuZXhwb3J0cy5MT05HX1dFRUtEQVlfTkFNRVMgPSBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcbmV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyA9IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcbmV4cG9ydHMuV0VFS0RBWV9UV09fTEVUVEVSUyA9IFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xuZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMgPSBbXCJTXCIsIFwiTVwiLCBcIlRcIiwgXCJXXCIsIFwiVFwiLCBcIkZcIiwgXCJTXCJdO1xuZXhwb3J0cy5EQVlfUEVSSU9EU19BQkJSRVZJQVRFRCA9IHsgYW06IFwiQU1cIiwgcG06IFwiUE1cIiwgbm9vbjogXCJub29uXCIsIG1pZG5pZ2h0OiBcIm1pZC5cIiB9O1xuZXhwb3J0cy5EQVlfUEVSSU9EU19XSURFID0geyBhbTogXCJBTVwiLCBwbTogXCJQTVwiLCBub29uOiBcIm5vb25cIiwgbWlkbmlnaHQ6IFwibWlkbmlnaHRcIiB9O1xuZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1cgPSB7IGFtOiBcIkFcIiwgcG06IFwiUFwiLCBub29uOiBcIm5vb25cIiwgbWlkbmlnaHQ6IFwibWRcIiB9O1xuZXhwb3J0cy5ERUZBVUxUX0xPQ0FMRSA9IHtcbiAgICBlcmFOYXJyb3c6IGV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyxcbiAgICBlcmFXaWRlOiBleHBvcnRzLkVSQV9OQU1FU19XSURFLFxuICAgIGVyYUFiYnJldmlhdGVkOiBleHBvcnRzLkVSQV9OQU1FU19BQkJSRVZJQVRFRCxcbiAgICBxdWFydGVyTGV0dGVyOiBleHBvcnRzLlFVQVJURVJfTEVUVEVSLFxuICAgIHF1YXJ0ZXJXb3JkOiBleHBvcnRzLlFVQVJURVJfV09SRCxcbiAgICBxdWFydGVyQWJicmV2aWF0aW9uczogZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMsXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI6IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIsXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJXb3JkOiBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfV09SRCxcbiAgICBzdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnM6IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxuICAgIGxvbmdNb250aE5hbWVzOiBleHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMsXG4gICAgc2hvcnRNb250aE5hbWVzOiBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTLFxuICAgIG1vbnRoTGV0dGVyczogZXhwb3J0cy5NT05USF9MRVRURVJTLFxuICAgIHN0YW5kQWxvbmVMb25nTW9udGhOYW1lczogZXhwb3J0cy5TVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTLFxuICAgIHN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM6IGV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMsXG4gICAgc3RhbmRBbG9uZU1vbnRoTGV0dGVyczogZXhwb3J0cy5TVEFORF9BTE9ORV9NT05USF9MRVRURVJTLFxuICAgIGxvbmdXZWVrZGF5TmFtZXM6IGV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTLFxuICAgIHNob3J0V2Vla2RheU5hbWVzOiBleHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMsXG4gICAgd2Vla2RheVR3b0xldHRlcnM6IGV4cG9ydHMuV0VFS0RBWV9UV09fTEVUVEVSUyxcbiAgICB3ZWVrZGF5TGV0dGVyczogZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMsXG4gICAgZGF5UGVyaW9kQWJicmV2aWF0ZWQ6IGV4cG9ydHMuREFZX1BFUklPRFNfQUJCUkVWSUFURUQsXG4gICAgZGF5UGVyaW9kV2lkZTogZXhwb3J0cy5EQVlfUEVSSU9EU19XSURFLFxuICAgIGRheVBlcmlvZE5hcnJvdzogZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1dcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2NhbGUuanMubWFwIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIE1hdGggdXRpbGl0eSBmdW5jdGlvbnNcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnBvc2l0aXZlTW9kdWxvID0gZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGV4cG9ydHMucm91bmRTeW0gPSBleHBvcnRzLmlzSW50ID0gdm9pZCAwO1xudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xuLyoqXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gaXNJbnQobikge1xuICAgIGlmIChuID09PSBudWxsIHx8ICFpc0Zpbml0ZShuKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAoTWF0aC5mbG9vcihuKSA9PT0gbik7XG59XG5leHBvcnRzLmlzSW50ID0gaXNJbnQ7XG4vKipcbiAqIFJvdW5kcyAtMS41IHRvIC0yIGluc3RlYWQgb2YgLTFcbiAqIFJvdW5kcyArMS41IHRvICsyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTiBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZnVuY3Rpb24gcm91bmRTeW0obikge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNGaW5pdGUobiksIFwiQXJndW1lbnQuTlwiLCBcIm4gbXVzdCBiZSBhIGZpbml0ZSBudW1iZXIgYnV0IGlzOiAlZFwiLCBuKTtcbiAgICBpZiAobiA8IDApIHtcbiAgICAgICAgcmV0dXJuIC0xICogTWF0aC5yb3VuZCgtMSAqIG4pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobik7XG4gICAgfVxufVxuZXhwb3J0cy5yb3VuZFN5bSA9IHJvdW5kU3ltO1xuLyoqXG4gKiBTdHJpY3RlciB2YXJpYW50IG9mIHBhcnNlRmxvYXQoKS5cbiAqIEBwYXJhbSB2YWx1ZVx0SW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJuIHRoZSBmbG9hdCBpZiB0aGUgc3RyaW5nIGlzIGEgdmFsaWQgZmxvYXQsIE5hTiBvdGhlcndpc2VcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZSkge1xuICAgIGlmICgvXihcXC18XFwrKT8oWzAtOV0rKFxcLlswLTldKyk/fEluZmluaXR5KSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gTmFOO1xufVxuZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGZpbHRlckZsb2F0O1xuLyoqXG4gKiBNb2R1bG8gZnVuY3Rpb24gdGhhdCBvbmx5IHJldHVybnMgYSBwb3NpdGl2ZSByZXN1bHQsIGluIGNvbnRyYXN0IHRvIHRoZSAlIG9wZXJhdG9yXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBtb2R1bG9cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5WYWx1ZSBpZiB2YWx1ZSBpcyBub3QgZmluaXRlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9kdWxvIGlmIG1vZHVsbyBpcyBub3QgYSBmaW5pdGUgbnVtYmVyID49IDFcbiAqL1xuZnVuY3Rpb24gcG9zaXRpdmVNb2R1bG8odmFsdWUsIG1vZHVsbykge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNGaW5pdGUodmFsdWUpLCBcIkFyZ3VtZW50LlZhbHVlXCIsIFwidmFsdWUgc2hvdWxkIGJlIGZpbml0ZVwiKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzRmluaXRlKG1vZHVsbykgJiYgbW9kdWxvID49IDEsIFwiQXJndW1lbnQuTW9kdWxvXCIsIFwibW9kdWxvIHNob3VsZCBiZSA+PSAxXCIpO1xuICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgcmV0dXJuICgodmFsdWUgJSBtb2R1bG8pICsgbW9kdWxvKSAlIG1vZHVsbztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSAlIG1vZHVsbztcbiAgICB9XG59XG5leHBvcnRzLnBvc2l0aXZlTW9kdWxvID0gcG9zaXRpdmVNb2R1bG87XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tYXRoLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcbiAqL1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucGFyc2UgPSBleHBvcnRzLnBhcnNlYWJsZSA9IHZvaWQgMDtcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XG52YXIgbG9jYWxlXzEgPSByZXF1aXJlKFwiLi9sb2NhbGVcIik7XG52YXIgbWF0aF8xID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcbnZhciB0aW1lem9uZV8xID0gcmVxdWlyZShcIi4vdGltZXpvbmVcIik7XG52YXIgdG9rZW5fMSA9IHJlcXVpcmUoXCIuL3Rva2VuXCIpO1xuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBkYXRldGltZSBzdHJpbmcgaXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXRcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHRlc3RcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nIChzZWUgTERNTC5tZClcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIHN0cmluZyBhZnRlciB0aGUgZGF0ZSt0aW1lXG4gKiBAcGFyYW0gbG9jYWxlIExvY2FsZS1zcGVjaWZpYyBjb25zdGFudHMgc3VjaCBhcyBtb250aCBuYW1lc1xuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIHBhcnNlYWJsZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBhbGxvd1RyYWlsaW5nLCBsb2NhbGUpIHtcbiAgICBpZiAoYWxsb3dUcmFpbGluZyA9PT0gdm9pZCAwKSB7IGFsbG93VHJhaWxpbmcgPSB0cnVlOyB9XG4gICAgaWYgKGxvY2FsZSA9PT0gdm9pZCAwKSB7IGxvY2FsZSA9IHt9OyB9XG4gICAgdHJ5IHtcbiAgICAgICAgcGFyc2UoZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgdW5kZWZpbmVkLCBhbGxvd1RyYWlsaW5nLCBsb2NhbGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydHMucGFyc2VhYmxlID0gcGFyc2VhYmxlO1xuLyoqXG4gKiBQYXJzZSB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgYXNzdW1pbmcgdGhlIGdpdmVuIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxuICogQHBhcmFtIG92ZXJyaWRlWm9uZSBVc2UgdGhpcyB6b25lIGluIHRoZSByZXN1bHRcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIGNoYXJhY3RlcnMgaW4gdGhlIHNvdXJjZSBzdHJpbmdcbiAqIEBwYXJhbSBsb2NhbGUgTG9jYWxlLXNwZWNpZmljIGNvbnN0YW50cyBzdWNoIGFzIG1vbnRoIG5hbWVzXG4gKiBAcmV0dXJuIHN0cmluZ1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3IgaWYgdGhlIGdpdmVuIGRhdGVUaW1lU3RyaW5nIGlzIHdyb25nIG9yIG5vdCBhY2NvcmRpbmcgdG8gdGhlIHBhdHRlcm5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Gb3JtYXRTdHJpbmcgaWYgdGhlIGdpdmVuIGZvcm1hdCBzdHJpbmcgaXMgaW52YWxpZFxuICovXG5mdW5jdGlvbiBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBvdmVycmlkZVpvbmUsIGFsbG93VHJhaWxpbmcsIGxvY2FsZSkge1xuICAgIHZhciBfYTtcbiAgICBpZiAoYWxsb3dUcmFpbGluZyA9PT0gdm9pZCAwKSB7IGFsbG93VHJhaWxpbmcgPSB0cnVlOyB9XG4gICAgaWYgKGxvY2FsZSA9PT0gdm9pZCAwKSB7IGxvY2FsZSA9IHt9OyB9XG4gICAgaWYgKCFkYXRlVGltZVN0cmluZykge1xuICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwibm8gZGF0ZSBnaXZlblwiKTtcbiAgICB9XG4gICAgaWYgKCFmb3JtYXRTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwibm8gZm9ybWF0IGdpdmVuXCIpO1xuICAgIH1cbiAgICB2YXIgbWVyZ2VkTG9jYWxlID0gX19hc3NpZ24oX19hc3NpZ24oe30sIGxvY2FsZV8xLkRFRkFVTFRfTE9DQUxFKSwgbG9jYWxlKTtcbiAgICB2YXIgeWVhckN1dG9mZiA9ICgwLCBtYXRoXzEucG9zaXRpdmVNb2R1bG8pKChuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkgKyA1MCksIDEwMCk7XG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIHRva2VucyA9ICgwLCB0b2tlbl8xLnRva2VuaXplKShmb3JtYXRTdHJpbmcpO1xuICAgICAgICB2YXIgdGltZSA9IHsgeWVhcjogdW5kZWZpbmVkIH07XG4gICAgICAgIHZhciB6b25lID0gdm9pZCAwO1xuICAgICAgICB2YXIgcG5yID0gdm9pZCAwO1xuICAgICAgICB2YXIgcHpyID0gdm9pZCAwO1xuICAgICAgICB2YXIgZHByID0gdm9pZCAwO1xuICAgICAgICB2YXIgZXJhID0gMTtcbiAgICAgICAgdmFyIHF1YXJ0ZXIgPSB2b2lkIDA7XG4gICAgICAgIHZhciByZW1haW5pbmcgPSBkYXRlVGltZVN0cmluZztcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB0b2tlbnNfMSA9IHRva2VuczsgX2kgPCB0b2tlbnNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc18xW19pXTtcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuRVJBOlxuICAgICAgICAgICAgICAgICAgICBfYSA9IHN0cmlwRXJhKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSksIGVyYSA9IF9hWzBdLCByZW1haW5pbmcgPSBfYVsxXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5RVUFSVEVSOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgciA9IHN0cmlwUXVhcnRlcih0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVhcnRlciA9IHIubjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHIucmVtYWluaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFS0RBWTpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBXZWVrRGF5KHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5XRUVLOlxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIG5vdGhpbmcgdG8gbGVhcm4gZnJvbSB0aGlzXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5EQVlQRVJJT0Q6XG4gICAgICAgICAgICAgICAgICAgIGRwciA9IHN0cmlwRGF5UGVyaW9kKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IGRwci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuWUVBUjpcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCBJbmZpbml0eSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbnIubiA+IHllYXJDdXRvZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSAxOTAwICsgcG5yLm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSAyMDAwICsgcG5yLm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnllYXIgPSBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLk1PTlRIOlxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE1vbnRoKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5EQVk6XG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIHRpbWUuZGF5ID0gcG5yLm47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuSE9VUjpcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBIb3VyKHRva2VuLCByZW1haW5pbmcpO1xuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xuICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSBwbnIubjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NSU5VVEU6XG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gcG5yLm47XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuU0VDT05EOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcFNlY29uZCh0b2tlbiwgcmVtYWluaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuc2Vjb25kID0gcG5yLm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSAxMDAwICogcGFyc2VGbG9hdChcIjAuXCIgKyBNYXRoLmZsb29yKHBuci5uKS50b1N0cmluZygxMCkuc2xpY2UoMCwgMykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSBNYXRoLmZsb29yKChwbnIubiAvIDM2MDBFMykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLm1pbnV0ZSA9IE1hdGguZmxvb3IoKDAsIG1hdGhfMS5wb3NpdGl2ZU1vZHVsbykocG5yLm4gLyA2MEUzLCA2MCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IE1hdGguZmxvb3IoKDAsIG1hdGhfMS5wb3NpdGl2ZU1vZHVsbykocG5yLm4gLyAxMDAwLCA2MCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLm1pbGxpID0gKDAsIG1hdGhfMS5wb3NpdGl2ZU1vZHVsbykocG5yLm4sIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJ1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICdcIi5jb25jYXQodG9rZW4ucmF3LCBcIidcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuWk9ORTpcbiAgICAgICAgICAgICAgICAgICAgcHpyID0gc3RyaXBab25lKHRva2VuLCByZW1haW5pbmcpO1xuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwenIucmVtYWluaW5nO1xuICAgICAgICAgICAgICAgICAgICB6b25lID0gcHpyLnpvbmU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLklERU5USVRZOlxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBzdHJpcFJhdyhyZW1haW5pbmcsIHRva2VuLnJhdyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkcHIpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoZHByLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYW1cIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciAhPT0gdW5kZWZpbmVkICYmIHRpbWUuaG91ciA+PSAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyIC09IDEyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwbVwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyICE9PSB1bmRlZmluZWQgJiYgdGltZS5ob3VyIDwgMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciArPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwibm9vblwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyID09PSB1bmRlZmluZWQgfHwgdGltZS5ob3VyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5taW51dGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLnNlY29uZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWlsbGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciAhPT0gMTIgfHwgdGltZS5taW51dGUgIT09IDAgfHwgdGltZS5zZWNvbmQgIT09IDAgfHwgdGltZS5taWxsaSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgdGltZSwgY29udGFpbnMgJ25vb24nIHNwZWNpZmllciBidXQgdGltZSBkaWZmZXJzIGZyb20gbm9vblwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwibWlkbmlnaHRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gdW5kZWZpbmVkIHx8IHRpbWUuaG91ciA9PT0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWludXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5zZWNvbmQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLm1pbGxpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgIT09IDAgfHwgdGltZS5taW51dGUgIT09IDAgfHwgdGltZS5zZWNvbmQgIT09IDAgfHwgdGltZS5taWxsaSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgdGltZSwgY29udGFpbnMgJ21pZG5pZ2h0JyBzcGVjaWZpZXIgYnV0IHRpbWUgZGlmZmVycyBmcm9tIG1pZG5pZ2h0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lLnllYXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGltZS55ZWFyICo9IGVyYTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocXVhcnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodGltZS5tb250aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChxdWFydGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSA3O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubW9udGggPSAxMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBlcnJvcl8yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChxdWFydGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gMSAmJiB0aW1lLm1vbnRoIDw9IDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gNCAmJiB0aW1lLm1vbnRoIDw9IDYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gNyAmJiB0aW1lLm1vbnRoIDw9IDkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gMTAgJiYgdGltZS5tb250aCA8PSAxMik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yXzIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcInRoZSBxdWFydGVyIGRvZXMgbm90IG1hdGNoIHRoZSBtb250aFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpbWUueWVhciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aW1lLnllYXIgPSAxOTcwO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSB7IHRpbWU6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHRpbWUpLCB6b25lOiB6b25lIH07XG4gICAgICAgIGlmICghcmVzdWx0LnRpbWUudmFsaWRhdGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgcmVzdWx0aW5nIGRhdGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxuICAgICAgICBpZiAob3ZlcnJpZGVab25lKSB7XG4gICAgICAgICAgICByZXN1bHQuem9uZSA9IG92ZXJyaWRlWm9uZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCBkYXRlICdcIi5jb25jYXQoZGF0ZVRpbWVTdHJpbmcsIFwiJyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnXCIpLmNvbmNhdChmb3JtYXRTdHJpbmcsIFwiJzogdHJhaWxpbmcgY2hhcmFjdGVyczogJ1wiKS5jb25jYXQocmVtYWluaW5nLCBcIidcIikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIGRhdGUgJ1wiLmNvbmNhdChkYXRlVGltZVN0cmluZywgXCInIG5vdCBhY2NvcmRpbmcgdG8gZm9ybWF0ICdcIikuY29uY2F0KGZvcm1hdFN0cmluZywgXCInOiBcIikuY29uY2F0KGUubWVzc2FnZSkpO1xuICAgIH1cbn1cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbnZhciBXSElURVNQQUNFID0gW1wiIFwiLCBcIlxcdFwiLCBcIlxcclwiLCBcIlxcdlwiLCBcIlxcblwiXTtcbi8qKlxuICpcbiAqIEBwYXJhbSB0b2tlblxuICogQHBhcmFtIHNcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RJbXBsZW1lbnRlZCBpZiBhIHBhdHRlcm4gaXMgdXNlZCB0aGF0IGlzbid0IGltcGxlbWVudGVkIHlldCAoeiwgWiwgdiwgViwgeCwgWClcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgbm90IHBhcnNlYWJsZVxuICovXG5mdW5jdGlvbiBzdHJpcFpvbmUodG9rZW4sIHMpIHtcbiAgICB2YXIgdW5zdXBwb3J0ZWQgPSAodG9rZW4uc3ltYm9sID09PSBcInpcIilcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA1KVxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcInZcIilcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJWXCIgJiYgdG9rZW4ubGVuZ3RoICE9PSAyKVxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcInhcIiAmJiB0b2tlbi5sZW5ndGggPj0gNClcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJYXCIgJiYgdG9rZW4ubGVuZ3RoID49IDQpO1xuICAgIGlmICh1bnN1cHBvcnRlZCkge1xuICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJOb3RJbXBsZW1lbnRlZFwiLCBcInRpbWUgem9uZSBwYXR0ZXJuICdcIiArIHRva2VuLnJhdyArIFwiJyBpcyBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgIHJlbWFpbmluZzogc1xuICAgIH07XG4gICAgLy8gY2hvcCBvZmYgXCJHTVRcIiBwcmVmaXggaWYgbmVlZGVkXG4gICAgdmFyIGhhZEdNVCA9IGZhbHNlO1xuICAgIGlmICgodG9rZW4uc3ltYm9sID09PSBcIlpcIiAmJiB0b2tlbi5sZW5ndGggPT09IDQpIHx8IHRva2VuLnN5bWJvbCA9PT0gXCJPXCIpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5yZW1haW5pbmcudG9VcHBlckNhc2UoKS5zdGFydHNXaXRoKFwiR01UXCIpKSB7XG4gICAgICAgICAgICByZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zbGljZSgzKTtcbiAgICAgICAgICAgIGhhZEdNVCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gcGFyc2UgYW55IHpvbmUsIHJlZ2FyZGxlc3Mgb2Ygc3BlY2lmaWVkIGZvcm1hdFxuICAgIHZhciB6b25lU3RyaW5nID0gXCJcIjtcbiAgICB3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIFdISVRFU1BBQ0UuaW5kZXhPZihyZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKSkgPT09IC0xKSB7XG4gICAgICAgIHpvbmVTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XG4gICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcbiAgICB9XG4gICAgem9uZVN0cmluZyA9IHpvbmVTdHJpbmcudHJpbSgpO1xuICAgIGlmICh6b25lU3RyaW5nKSB7XG4gICAgICAgIC8vIGVuc3VyZSBjaG9wcGluZyBvZmYgR01UIGRvZXMgbm90IGhpZGUgdGltZSB6b25lIGVycm9ycyAoYml0IG9mIGEgc2xvcHB5IHJlZ2V4IGJ1dCBPSylcbiAgICAgICAgaWYgKGhhZEdNVCAmJiAhem9uZVN0cmluZy5tYXRjaCgvW1xcK1xcLV0/W1xcZFxcOl0rL2kpKSB7XG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCB0aW1lIHpvbmUgJ0dNVFwiICsgem9uZVN0cmluZyArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0LnpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnpvbmUoem9uZVN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICgoMCwgZXJyb3JfMS5lcnJvcklzKShlLCBbXCJBcmd1bWVudC5TXCIsIFwiTm90Rm91bmQuWm9uZVwiXSkpIHtcbiAgICAgICAgICAgICAgICBlID0gKDAsIGVycm9yXzEuZXJyb3IpKFwiUGFyc2VFcnJvclwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcIm5vIHRpbWUgem9uZSBnaXZlblwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxuICpcbiAqIEBwYXJhbSBzXG4gKiBAcGFyYW0gZXhwZWN0ZWRcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKi9cbmZ1bmN0aW9uIHN0cmlwUmF3KHMsIGV4cGVjdGVkKSB7XG4gICAgdmFyIHJlbWFpbmluZyA9IHM7XG4gICAgdmFyIGVyZW1haW5pbmcgPSBleHBlY3RlZDtcbiAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgZXJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5jaGFyQXQoMCkgPT09IGVyZW1haW5pbmcuY2hhckF0KDApKSB7XG4gICAgICAgIHJlbWFpbmluZyA9IHJlbWFpbmluZy5zdWJzdHIoMSk7XG4gICAgICAgIGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcbiAgICB9XG4gICAgaWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiZXhwZWN0ZWQgJ1wiLmNvbmNhdChleHBlY3RlZCwgXCInXCIpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlbWFpbmluZztcbn1cbi8qKlxuICpcbiAqIEBwYXJhbSB0b2tlblxuICogQHBhcmFtIHJlbWFpbmluZ1xuICogQHBhcmFtIGxvY2FsZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcbiAqL1xuZnVuY3Rpb24gc3RyaXBEYXlQZXJpb2QodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XG4gICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2Y7XG4gICAgdmFyIG9mZnNldHM7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcImFcIjpcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9hID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBfYVtsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbV0gPSBcImFtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfYVtsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbV0gPSBcInBtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfYSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfYiA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX2JbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbV0gPSBcImFtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfYltsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtXSA9IFwicG1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfYyA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX2NbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtXSA9IFwiYW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbV0gPSBcInBtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfYyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfZCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUuYW1dID0gXCJhbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHRdID0gXCJtaWRuaWdodFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUucG1dID0gXCJwbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUubm9vbl0gPSBcIm5vb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9lID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBfZVtsb2NhbGUuZGF5UGVyaW9kTmFycm93LmFtXSA9IFwiYW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cubWlkbmlnaHRdID0gXCJtaWRuaWdodFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2VbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbV0gPSBcInBtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZVtsb2NhbGUuZGF5UGVyaW9kTmFycm93Lm5vb25dID0gXCJub29uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHMgPSAoX2YgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbV0gPSBcImFtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBfZltsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubWlkbmlnaHRdID0gXCJtaWRuaWdodFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2ZbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLnBtXSA9IFwicG1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5ub29uXSA9IFwibm9vblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2YpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBtYXRjaCBsb25nZXN0IHBvc3NpYmxlIGRheSBwZXJpb2Qgc3RyaW5nOyBzb3J0IGtleXMgYnkgbGVuZ3RoIGRlc2NlbmRpbmdcbiAgICB2YXIgc29ydGVkS2V5cyA9IE9iamVjdC5rZXlzKG9mZnNldHMpXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiAoYS5sZW5ndGggPCBiLmxlbmd0aCA/IDEgOiBhLmxlbmd0aCA+IGIubGVuZ3RoID8gLTEgOiAwKTsgfSk7XG4gICAgdmFyIHVwcGVyID0gcmVtYWluaW5nLnRvVXBwZXJDYXNlKCk7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBzb3J0ZWRLZXlzXzEgPSBzb3J0ZWRLZXlzOyBfaSA8IHNvcnRlZEtleXNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHNvcnRlZEtleXNfMVtfaV07XG4gICAgICAgIGlmICh1cHBlci5zdGFydHNXaXRoKGtleS50b1VwcGVyQ2FzZSgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBvZmZzZXRzW2tleV0sXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmcuc2xpY2Uoa2V5Lmxlbmd0aClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcIm1pc3NpbmcgZGF5IHBlcmlvZCBpLmUuIFwiICsgT2JqZWN0LmtleXMob2Zmc2V0cykuam9pbihcIiwgXCIpKTtcbn1cbi8qKlxuICogUmV0dXJucyBmYWN0b3IgLTEgb3IgMSBkZXBlbmRpbmcgb24gQkMgb3IgQURcbiAqIEBwYXJhbSB0b2tlblxuICogQHBhcmFtIHJlbWFpbmluZ1xuICogQHBhcmFtIGxvY2FsZVxuICogQHJldHVybnMgW2ZhY3RvciwgcmVtYWluaW5nXVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcbiAqL1xuZnVuY3Rpb24gc3RyaXBFcmEodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XG4gICAgdmFyIGFsbG93ZWQ7XG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5lcmFXaWRlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuZXJhTmFycm93O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLmVyYUFiYnJldmlhdGVkO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XG4gICAgcmV0dXJuIFthbGxvd2VkLmluZGV4T2YocmVzdWx0LmNob3NlbikgPT09IDAgPyAxIDogLTEsIHJlc3VsdC5yZW1haW5pbmddO1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAcGFyYW0gbG9jYWxlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xuICovXG5mdW5jdGlvbiBzdHJpcFF1YXJ0ZXIodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XG4gICAgdmFyIHF1YXJ0ZXJMZXR0ZXI7XG4gICAgdmFyIHF1YXJ0ZXJXb3JkO1xuICAgIHZhciBxdWFydGVyQWJicmV2aWF0aW9ucztcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgcXVhcnRlckxldHRlciA9IGxvY2FsZS5xdWFydGVyTGV0dGVyO1xuICAgICAgICAgICAgcXVhcnRlcldvcmQgPSBsb2NhbGUucXVhcnRlcldvcmQ7XG4gICAgICAgICAgICBxdWFydGVyQWJicmV2aWF0aW9ucyA9IGxvY2FsZS5xdWFydGVyQWJicmV2aWF0aW9ucztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicVwiOiB7XG4gICAgICAgICAgICBxdWFydGVyTGV0dGVyID0gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyTGV0dGVyO1xuICAgICAgICAgICAgcXVhcnRlcldvcmQgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJXb3JkO1xuICAgICAgICAgICAgcXVhcnRlckFiYnJldmlhdGlvbnMgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcbiAgICB9XG4gICAgdmFyIGFsbG93ZWQ7XG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAxKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBbMSwgMiwgMywgNF0ubWFwKGZ1bmN0aW9uIChuKSB7IHJldHVybiBxdWFydGVyTGV0dGVyICsgbi50b1N0cmluZygxMCk7IH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBxdWFydGVyQWJicmV2aWF0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEgKyBcIiBcIiArIHF1YXJ0ZXJXb3JkOyB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xuICAgIH1cbiAgICB2YXIgciA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcbiAgICByZXR1cm4geyBuOiBhbGxvd2VkLmluZGV4T2Yoci5jaG9zZW4pICsgMSwgcmVtYWluaW5nOiByLnJlbWFpbmluZyB9O1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAcGFyYW0gbG9jYWxlXG4gKiBAcmV0dXJucyByZW1haW5pbmcgc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xuICovXG5mdW5jdGlvbiBzdHJpcFdlZWtEYXkodG9rZW4sIHJlbWFpbmluZywgbG9jYWxlKSB7XG4gICAgdmFyIGFsbG93ZWQ7XG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDEpLnJlbWFpbmluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKS5yZW1haW5pbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUubG9uZ1dlZWtkYXlOYW1lcztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLndlZWtkYXlMZXR0ZXJzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUud2Vla2RheVR3b0xldHRlcnM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcbiAgICB9XG4gICAgdmFyIHIgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XG4gICAgcmV0dXJuIHIucmVtYWluaW5nO1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAcGFyYW0gbG9jYWxlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xuICovXG5mdW5jdGlvbiBzdHJpcE1vbnRoKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xuICAgIHZhciBzaG9ydE1vbnRoTmFtZXM7XG4gICAgdmFyIGxvbmdNb250aE5hbWVzO1xuICAgIHZhciBtb250aExldHRlcnM7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcIk1cIjpcbiAgICAgICAgICAgIHNob3J0TW9udGhOYW1lcyA9IGxvY2FsZS5zaG9ydE1vbnRoTmFtZXM7XG4gICAgICAgICAgICBsb25nTW9udGhOYW1lcyA9IGxvY2FsZS5sb25nTW9udGhOYW1lcztcbiAgICAgICAgICAgIG1vbnRoTGV0dGVycyA9IGxvY2FsZS5tb250aExldHRlcnM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkxcIjpcbiAgICAgICAgICAgIHNob3J0TW9udGhOYW1lcyA9IGxvY2FsZS5zdGFuZEFsb25lU2hvcnRNb250aE5hbWVzO1xuICAgICAgICAgICAgbG9uZ01vbnRoTmFtZXMgPSBsb2NhbGUuc3RhbmRBbG9uZUxvbmdNb250aE5hbWVzO1xuICAgICAgICAgICAgbW9udGhMZXR0ZXJzID0gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIG1vbnRoIHBhdHRlcm5cIik7XG4gICAgfVxuICAgIHZhciBhbGxvd2VkO1xuICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBzaG9ydE1vbnRoTmFtZXM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvbmdNb250aE5hbWVzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGFsbG93ZWQgPSBtb250aExldHRlcnM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIG1vbnRoIHBhdHRlcm5cIik7XG4gICAgfVxuICAgIHZhciByID0gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpO1xuICAgIHJldHVybiB7IG46IGFsbG93ZWQuaW5kZXhPZihyLmNob3NlbikgKyAxLCByZW1haW5pbmc6IHIucmVtYWluaW5nIH07XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gdG9rZW5cbiAqIEBwYXJhbSByZW1haW5pbmdcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKi9cbmZ1bmN0aW9uIHN0cmlwSG91cih0b2tlbiwgcmVtYWluaW5nKSB7XG4gICAgdmFyIHJlc3VsdCA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcbiAgICAgICAgY2FzZSBcImhcIjpcbiAgICAgICAgICAgIGlmIChyZXN1bHQubiA9PT0gMTIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQubiA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIkhcIjpcbiAgICAgICAgICAgIC8vIG5vdGhpbmcsIGluIHJhbmdlIDAtMjNcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiS1wiOlxuICAgICAgICAgICAgLy8gbm90aGluZywgaW4gcmFuZ2UgMC0xMVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJrXCI6XG4gICAgICAgICAgICByZXN1bHQubiAtPSAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqXG4gKiBAcGFyYW0gdG9rZW5cbiAqIEBwYXJhbSByZW1haW5pbmdcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHN0cmlwU2Vjb25kKHRva2VuLCByZW1haW5pbmcpIHtcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuICAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG4gICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCB0b2tlbi5sZW5ndGgpO1xuICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgOCk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBzZWNvbmRzIHBhdHRlcm5cIik7XG4gICAgfVxufVxuLyoqXG4gKlxuICogQHBhcmFtIHNcbiAqIEBwYXJhbSBtYXhMZW5ndGhcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXG4gKi9cbmZ1bmN0aW9uIHN0cmlwTnVtYmVyKHMsIG1heExlbmd0aCkge1xuICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgIG46IE5hTixcbiAgICAgICAgcmVtYWluaW5nOiBzXG4gICAgfTtcbiAgICB2YXIgbnVtYmVyU3RyaW5nID0gXCJcIjtcbiAgICB3aGlsZSAobnVtYmVyU3RyaW5nLmxlbmd0aCA8IG1heExlbmd0aCAmJiByZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkubWF0Y2goL1xcZC8pKSB7XG4gICAgICAgIG51bWJlclN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcbiAgICAgICAgcmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xuICAgIH1cbiAgICAvLyByZW1vdmUgbGVhZGluZyB6ZXJvZXNcbiAgICB3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbnVtYmVyU3RyaW5nID0gbnVtYmVyU3RyaW5nLnN1YnN0cigxKTtcbiAgICB9XG4gICAgcmVzdWx0Lm4gPSBwYXJzZUludChudW1iZXJTdHJpbmcsIDEwKTtcbiAgICBpZiAobnVtYmVyU3RyaW5nID09PSBcIlwiIHx8ICFOdW1iZXIuaXNGaW5pdGUocmVzdWx0Lm4pKSB7XG4gICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICdcIi5jb25jYXQobnVtYmVyU3RyaW5nLCBcIidcIikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKlxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAcGFyYW0gYWxsb3dlZFxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcbiAqL1xuZnVuY3Rpb24gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpIHtcbiAgICAvLyBtYXRjaCBsb25nZXN0IHBvc3NpYmxlIHN0cmluZzsgc29ydCBrZXlzIGJ5IGxlbmd0aCBkZXNjZW5kaW5nXG4gICAgdmFyIHNvcnRlZEtleXMgPSBhbGxvd2VkLnNsaWNlKClcbiAgICAgICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIChhLmxlbmd0aCA8IGIubGVuZ3RoID8gMSA6IGEubGVuZ3RoID4gYi5sZW5ndGggPyAtMSA6IDApOyB9KTtcbiAgICB2YXIgdXBwZXIgPSByZW1haW5pbmcudG9VcHBlckNhc2UoKTtcbiAgICBmb3IgKHZhciBfaSA9IDAsIHNvcnRlZEtleXNfMiA9IHNvcnRlZEtleXM7IF9pIDwgc29ydGVkS2V5c18yLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIga2V5ID0gc29ydGVkS2V5c18yW19pXTtcbiAgICAgICAgaWYgKHVwcGVyLnN0YXJ0c1dpdGgoa2V5LnRvVXBwZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNob3Nlbjoga2V5LFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZzogcmVtYWluaW5nLnNsaWNlKGtleS5sZW5ndGgpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIFwiICsgdG9rZW5fMS5Ub2tlblR5cGVbdG9rZW4udHlwZV0udG9Mb3dlckNhc2UoKSArIFwiLCBleHBlY3RlZCBvbmUgb2YgXCIgKyBhbGxvd2VkLmpvaW4oXCIsIFwiKSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZS5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy50aW1lc3RhbXBPbldlZWtUaW1lTGVzc1RoYW4gPSBleHBvcnRzLnRpbWVzdGFtcE9uV2Vla1RpbWVHcmVhdGVyVGhhbk9yRXF1YWxUbyA9IGV4cG9ydHMuaXNQZXJpb2QgPSBleHBvcnRzLmlzVmFsaWRQZXJpb2RKc29uID0gZXhwb3J0cy5QZXJpb2QgPSBleHBvcnRzLnBlcmlvZERzdFRvU3RyaW5nID0gZXhwb3J0cy5QZXJpb2REc3QgPSB2b2lkIDA7XG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xudmFyIGRhdGV0aW1lXzEgPSByZXF1aXJlKFwiLi9kYXRldGltZVwiKTtcbnZhciBkdXJhdGlvbl8xID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcbi8qKlxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cbiAqL1xudmFyIFBlcmlvZERzdDtcbihmdW5jdGlvbiAoUGVyaW9kRHN0KSB7XG4gICAgLyoqXG4gICAgICogS2VlcCByZXBlYXRpbmcgaW4gc2ltaWxhciBpbnRlcnZhbHMgbWVhc3VyZWQgaW4gVVRDLFxuICAgICAqIHVuYWZmZWN0ZWQgYnkgRGF5bGlnaHQgU2F2aW5nIFRpbWUuXG4gICAgICogRS5nLiBhIHJlcGV0aXRpb24gb2Ygb25lIGhvdXIgd2lsbCB0YWtlIG9uZSByZWFsIGhvdXJcbiAgICAgKiBldmVyeSB0aW1lLCBldmVuIGluIGEgdGltZSB6b25lIHdpdGggRFNULlxuICAgICAqIExlYXAgc2Vjb25kcywgbGVhcCBkYXlzIGFuZCBtb250aCBsZW5ndGhcbiAgICAgKiBkaWZmZXJlbmNlcyB3aWxsIHN0aWxsIG1ha2UgdGhlIGludGVydmFscyBkaWZmZXJlbnQuXG4gICAgICovXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJJbnRlcnZhbHNcIl0gPSAwXSA9IFwiUmVndWxhckludGVydmFsc1wiO1xuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGF0IHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBpbnRlcnZhbHMgb2NjdXIgc3RheVxuICAgICAqIGF0IHRoZSBzYW1lIHBsYWNlIGluIHRoZSBkYXksIGxvY2FsIHRpbWUuIFNvIGUuZy5cbiAgICAgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxuICAgICAqIHdpbGwgYWx3YXlzIHJlZmVyZW5jZSBhdCA4OjA1IEV1cm9wZS9BbXN0ZXJkYW0uIFRoaXMgbWVhbnMgdGhhdFxuICAgICAqIGluIFVUQyB0aW1lLCBzb21lIGludGVydmFscyB3aWxsIGJlIDI1IGhvdXJzIGFuZCBzb21lXG4gICAgICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxuICAgICAqIEFub3RoZXIgZXhhbXBsZTogYW4gaG91cmx5IGludGVydmFsIHdpbGwgYmUgaG91cmx5IGluIGxvY2FsIHRpbWUsXG4gICAgICogc2tpcHBpbmcgYW4gaG91ciBpbiBVVEMgZm9yIGEgRFNUIGJhY2t3YXJkIGNoYW5nZS5cbiAgICAgKi9cbiAgICBQZXJpb2REc3RbUGVyaW9kRHN0W1wiUmVndWxhckxvY2FsVGltZVwiXSA9IDFdID0gXCJSZWd1bGFyTG9jYWxUaW1lXCI7XG4gICAgLyoqXG4gICAgICogRW5kLW9mLWVudW0gbWFya2VyXG4gICAgICovXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIk1BWFwiXSA9IDJdID0gXCJNQVhcIjtcbn0pKFBlcmlvZERzdCB8fCAoZXhwb3J0cy5QZXJpb2REc3QgPSBQZXJpb2REc3QgPSB7fSkpO1xuLyoqXG4gKiBDb252ZXJ0IGEgUGVyaW9kRHN0IHRvIGEgc3RyaW5nOiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCIgb3IgXCJyZWd1bGFyIGxvY2FsIHRpbWVcIlxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlAgZm9yIGludmFsaWQgUGVyaW9kRHN0IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHBlcmlvZERzdFRvU3RyaW5nKHApIHtcbiAgICBzd2l0Y2ggKHApIHtcbiAgICAgICAgY2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcbiAgICAgICAgY2FzZSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTogcmV0dXJuIFwicmVndWxhciBsb2NhbCB0aW1lXCI7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuUFwiLCBcImludmFsaWQgUGVyaW9Ec3QgdmFsdWUgJWRcIiwgcCk7XG4gICAgfVxufVxuZXhwb3J0cy5wZXJpb2REc3RUb1N0cmluZyA9IHBlcmlvZERzdFRvU3RyaW5nO1xuLyoqXG4gKiBSZXBlYXRpbmcgdGltZSBwZXJpb2Q6IGNvbnNpc3RzIG9mIGEgcmVmZXJlbmNlIGRhdGUgYW5kXG4gKiBhIHRpbWUgbGVuZ3RoLiBUaGlzIGNsYXNzIGFjY291bnRzIGZvciBsZWFwIHNlY29uZHMgYW5kIGxlYXAgZGF5cy5cbiAqL1xudmFyIFBlcmlvZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gUGVyaW9kKGEsIGFtb3VudE9ySW50ZXJ2YWwsIHVuaXRPckRzdCwgZ2l2ZW5Ec3QpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFsbG93IG5vdCB1c2luZyBpbnN0YW5jZW9mXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmtpbmQgPSBcIlBlcmlvZFwiO1xuICAgICAgICB2YXIgcmVmZXJlbmNlO1xuICAgICAgICB2YXIgaW50ZXJ2YWw7XG4gICAgICAgIHZhciBkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcbiAgICAgICAgaWYgKCgwLCBkYXRldGltZV8xLmlzRGF0ZVRpbWUpKGEpKSB7XG4gICAgICAgICAgICByZWZlcmVuY2UgPSBhO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiAoYW1vdW50T3JJbnRlcnZhbCkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgZHN0ID0gdW5pdE9yRHN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHR5cGVvZiB1bml0T3JEc3QgPT09IFwibnVtYmVyXCIgJiYgdW5pdE9yRHN0ID49IDAgJiYgdW5pdE9yRHN0IDwgYmFzaWNzXzEuVGltZVVuaXQuTUFYLCBcIkFyZ3VtZW50LlVuaXRcIiwgXCJJbnZhbGlkIHVuaXRcIik7XG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbihhbW91bnRPckludGVydmFsLCB1bml0T3JEc3QpO1xuICAgICAgICAgICAgICAgIGRzdCA9IGdpdmVuRHN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkc3QgIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICBkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoYS5yZWZlcmVuY2UpO1xuICAgICAgICAgICAgICAgIGludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oYS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgZHN0ID0gYS5wZXJpb2REc3QgPT09IFwicmVndWxhclwiID8gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgOiBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuSnNvblwiLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZHN0ID49IDAgJiYgZHN0IDwgUGVyaW9kRHN0Lk1BWCwgXCJBcmd1bWVudC5Ec3RcIiwgXCJJbnZhbGlkIFBlcmlvZERzdCBzZXR0aW5nXCIpO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoaW50ZXJ2YWwuYW1vdW50KCkgPiAwLCBcIkFyZ3VtZW50LkludGVydmFsXCIsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihpbnRlcnZhbC5hbW91bnQoKSksIFwiQXJndW1lbnQuSW50ZXJ2YWxcIiwgXCJBbW91bnQgbXVzdCBiZSBhIHdob2xlIG51bWJlclwiKTtcbiAgICAgICAgdGhpcy5fcmVmZXJlbmNlID0gcmVmZXJlbmNlO1xuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xuICAgICAgICB0aGlzLl9kc3QgPSBkc3Q7XG4gICAgICAgIHRoaXMuX2NhbGNJbnRlcm5hbFZhbHVlcygpO1xuICAgICAgICAvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcbiAgICAgICAgLy8gTm90ZSB3ZSB1c2UgaW50ZXJuYWwgYW1vdW50cyB0byBkZWNpZGUgdGhpcyBiZWNhdXNlIGFjdHVhbGx5IGl0IGlzIHN1cHBvcnRlZCBpZlxuICAgICAgICAvLyB0aGUgaW5wdXQgaXMgYSBtdWx0aXBsZSBvZiBvbmUgZGF5LlxuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwMDAwLCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwLCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDE0NDAsIFwiQXJndW1lbnQuSW50ZXJ2YWwuTm90SW1wbGVtZW50ZWRcIiwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDI0LCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGEgZnJlc2ggY29weSBvZiB0aGUgcGVyaW9kXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSByZWZlcmVuY2UgZGF0ZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUucmVmZXJlbmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgaW50ZXJ2YWxcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmludGVydmFsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBhbW91bnQgb2YgdW5pdHMgb2YgdGhlIGludGVydmFsXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5hbW91bnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB1bml0IG9mIHRoZSBpbnRlcnZhbFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLnVuaXQoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cbiAgICAgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG4gICAgICogUHJlOiB0aGUgZnJvbWRhdGUgYW5kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XG4gICAgICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxuICAgICAqIEByZXR1cm4gdGhlIGZpcnN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBhZnRlciBmcm9tRGF0ZSwgZ2l2ZW4gaW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBmcm9tZGF0ZSBhbmQgdGhlIHJlZmVyZW5jZSBkYXRlIGFyZSBib3RoIGF3YXJlIG9yIHVuYXdhcmUgb2YgdGltZSB6b25lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoZnJvbURhdGUpIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFmcm9tRGF0ZS56b25lKCksIFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcbiAgICAgICAgdmFyIGFwcHJveDtcbiAgICAgICAgdmFyIGFwcHJveDI7XG4gICAgICAgIHZhciBhcHByb3hNaW47XG4gICAgICAgIHZhciBwZXJpb2RzO1xuICAgICAgICB2YXIgZGlmZjtcbiAgICAgICAgdmFyIG5ld1llYXI7XG4gICAgICAgIHZhciByZW1haW5kZXI7XG4gICAgICAgIHZhciBpbWF4O1xuICAgICAgICB2YXIgaW1pbjtcbiAgICAgICAgdmFyIGltaWQ7XG4gICAgICAgIHZhciBub3JtYWxGcm9tID0gdGhpcy5fbm9ybWFsaXplRGF5KGZyb21EYXRlLnRvWm9uZSh0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKSk7XG4gICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA9PT0gMSkge1xuICAgICAgICAgICAgLy8gc2ltcGxlIGNhc2VzOiBhbW91bnQgZXF1YWxzIDEgKGVsaW1pbmF0ZXMgbmVlZCBmb3Igc2VhcmNoaW5nIGZvciByZWZlcmVuY2VpbmcgcG9pbnQpXG4gICAgICAgICAgICBpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRvIFVUQyB0aW1lXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCBub3JtYWxGcm9tLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNEYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0hvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjU2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIGludGVydmFsc1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgbm9ybWFsRnJvbS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwiVW5rbm93biBUaW1lVW5pdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFtb3VudCBpcyBub3QgMSxcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgdG8gVVRDIHRpbWVcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLnNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAobm9ybWFsRnJvbS51dGNNb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLnV0Y01vbnRoKCkpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlllYXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcIlVua25vd24gVGltZVVuaXRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKGZyb21EYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRyeSB0byBrZWVwIHJlZ3VsYXIgbG9jYWwgdGltZXMuIElmIHRoZSB1bml0IGlzIGxlc3MgdGhhbiBhIGRheSwgd2UgcmVmZXJlbmNlIGVhY2ggZGF5IGFuZXdcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTAwMCAmJiAoMTAwMCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBtaWxsaXNlY29uZCBlYWNoIHNlY29uZCwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSwgd2UgaGF2ZSB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0b2RvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGltYXggPj0gaW1pbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG1pZHBvaW50IGZvciByb3VnaGx5IGVxdWFsIHBhcnRpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94MjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IGltaWQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBpbWlkIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBzZWNvbmQgZWFjaCBtaW51dGUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtaW51cyBvbmUgbWludXRlIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBzZWNvbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG8gdGFrZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IE1hdGguZmxvb3IoKDg2NDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaW1heCA+PSBpbWluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaWQgPSBNYXRoLmZsb29yKChpbWluICsgaW1heCkgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveE1pbiA9IGFwcHJveDIuc3ViTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveDI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gaW1pZCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgaG91ciB0aGlzLl9pbnRSZWZlcmVuY2VhcnkgZWFjaCB0aW1lLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlIG1pbnVzIG9uZSBob3VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuSG91cik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBmaXQgaW4gYSBkYXksIHNvIGp1c3QgZ28gdGhlIGZyb21EYXRlIHByZXZpb3VzIGRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoMjQgKiA2MCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBoYXZlIGxlYXAgZGF5cywgc28gd2UgY2FuIGFwcHJveGltYXRlIGJ5IGNhbGN1bGF0aW5nIHdpdGggVVRDIHRpbWVzdGFtcHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpIC8gMjQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChub3JtYWxGcm9tLm1vbnRoKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHRoaXMuX2ludGVydmFsLm11bHRpcGx5KHBlcmlvZHMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShuZXdZZWFyLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcIlVua25vd24gVGltZVVuaXRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlICghYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvcnJlY3REYXkoYXBwcm94KS5jb252ZXJ0KGZyb21EYXRlLnpvbmUoKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBuZXh0IHRpbWVzdGFtcCBpbiB0aGUgcGVyaW9kLiBUaGUgZ2l2ZW4gdGltZXN0YW1wIG11c3RcbiAgICAgKiBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeSwgb3RoZXJ3aXNlIHRoZSBhbnN3ZXIgaXMgaW5jb3JyZWN0LlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxuICAgICAqIFJldHVybnMgdGhlIGRhdGV0aW1lIFwiY291bnRcIiB0aW1lcyBhd2F5IGZyb20gdGhlIGdpdmVuIGRhdGV0aW1lLlxuICAgICAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXG4gICAgICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgcG9zaXRpdmUgb3IgbmVnYXRpdmUsIGRlZmF1bHQgMVxuICAgICAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlByZXYgaWYgcHJldiBpcyB1bmRlZmluZWRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQ291bnQgaWYgY291bnQgaXMgbm90IGFuIGludGVnZXIgbnVtYmVyXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kTmV4dCA9IGZ1bmN0aW9uIChwcmV2LCBjb3VudCkge1xuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCEhcHJldiwgXCJBcmd1bWVudC5QcmV2XCIsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIXByZXYuem9uZSgpLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiKTtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoY291bnQpLCBcIkFyZ3VtZW50LkNvdW50XCIsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlclwiKTtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRQcmV2ID0gdGhpcy5fbm9ybWFsaXplRGF5KHByZXYudG9ab25lKHRoaXMuX3JlZmVyZW5jZS56b25lKCkpKTtcbiAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpKS5jb252ZXJ0KHByZXYuem9uZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBUaGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgbGVzcyB0aGFuXG4gICAgICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxuICAgICAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XG4gICAgICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBiZWZvcmUgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcbiAgICAgKiBAcmV0dXJuIHRoZSBsYXN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBiZWZvcmUgZnJvbURhdGUsIGdpdmVuXG4gICAgICogICAgICAgICBpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIG5vdCBib3RoIGBmcm9tYCBhbmQgdGhlIHJlZmVyZW5jZSBkYXRlIGFyZSBib3RoIGF3YXJlIG9yIHVuYXdhcmUgb2YgdGltZSB6b25lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kTGFzdCA9IGZ1bmN0aW9uIChmcm9tKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmZpbmRQcmV2KHRoaXMuZmluZEZpcnN0KGZyb20pKTtcbiAgICAgICAgaWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxuICAgICAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG4gICAgICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIHN1YnRyYWN0LiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxuICAgICAqIEByZXR1cm4gKG5leHQgLSBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIG5leHQuXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk5leHQgaWYgcHJldiBpcyB1bmRlZmluZWRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQ291bnQgaWYgY291bnQgaXMgbm90IGFuIGludGVnZXIgbnVtYmVyXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS5maW5kUHJldiA9IGZ1bmN0aW9uIChuZXh0LCBjb3VudCkge1xuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoKDAsIGVycm9yXzEuZXJyb3JJcykoZSwgXCJBcmd1bWVudC5QcmV2XCIpKSB7XG4gICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIkFyZ3VtZW50Lk5leHRcIiwgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XG4gICAgICogKGV4cGVuc2l2ZSEpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBgb2NjdXJyZW5jZWAgYW5kIHRoZSByZWZlcmVuY2UgZGF0ZSBhcmUgYm90aCBhd2FyZSBvciB1bmF3YXJlIG9mIHRpbWUgem9uZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuaXNCb3VuZGFyeSA9IGZ1bmN0aW9uIChvY2N1cnJlbmNlKSB7XG4gICAgICAgIGlmICghb2NjdXJyZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhb2NjdXJyZW5jZS56b25lKCksIFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiVGhlIG9jY3VycmVuY2UgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XG4gICAgICAgIHJldHVybiAodGhpcy5maW5kRmlyc3Qob2NjdXJyZW5jZS5zdWIoZHVyYXRpb25fMS5EdXJhdGlvbi5taWxsaXNlY29uZHMoMSkpKS5lcXVhbHMob2NjdXJyZW5jZSkpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXG4gICAgICogaS5lLiBhIHBlcmlvZCBvZiAyNCBob3VycyBpcyBlcXVhbCB0byBvbmUgb2YgMSBkYXkgaWYgdGhleSBoYXZlIHRoZSBzYW1lIFVUQyByZWZlcmVuY2UgbW9tZW50XG4gICAgICogYW5kIHNhbWUgZHN0LlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgbm90IGJvdGggYG90aGVyI3JlZmVyZW5jZSgpYCBhbmQgdGhlIHJlZmVyZW5jZSBkYXRlIGFyZSBib3RoIGF3YXJlIG9yIHVuYXdhcmVcbiAgICAgKiBvZiB0aW1lIHpvbmVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICAvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcbiAgICAgICAgaWYgKCF0aGlzLmlzQm91bmRhcnkob3RoZXIuX3JlZmVyZW5jZSkgfHwgIXRoaXMuX2ludEludGVydmFsLmVxdWFscyhvdGhlci5faW50SW50ZXJ2YWwpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlZlpvbmUgPSB0aGlzLl9yZWZlcmVuY2Uuem9uZSgpO1xuICAgICAgICB2YXIgb3RoZXJab25lID0gb3RoZXIuX3JlZmVyZW5jZS56b25lKCk7XG4gICAgICAgIHZhciB0aGlzSXNSZWd1bGFyID0gKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIXJlZlpvbmUgfHwgcmVmWm9uZS5pc1V0YygpKTtcbiAgICAgICAgdmFyIG90aGVySXNSZWd1bGFyID0gKG90aGVyLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIHx8ICFvdGhlclpvbmUgfHwgb3RoZXJab25lLmlzVXRjKCkpO1xuICAgICAgICBpZiAodGhpc0lzUmVndWxhciAmJiBvdGhlcklzUmVndWxhcikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gb3RoZXIuX2ludERzdCAmJiByZWZab25lICYmIG90aGVyWm9uZSAmJiByZWZab25lLmVxdWFscyhvdGhlclpvbmUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIHdhcyBjb25zdHJ1Y3RlZCB3aXRoIGlkZW50aWNhbCBhcmd1bWVudHMgdG8gdGhlIG90aGVyIG9uZS5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLmlkZW50aWNhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICByZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcbiAgICAgICAgICAgICYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5faW50ZXJ2YWwpXG4gICAgICAgICAgICAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBJU08gZHVyYXRpb24gc3RyaW5nIGUuZy5cbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMUhcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXG4gICAgICogMjAxNC0wMS0wMVQxMjowMDowMC4wMDArMDE6MDAvUDFNICAgKG9uZSBtb250aClcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXG4gICAgICogXCIxMCB5ZWFycywgcmVmZXJlbmNlaW5nIGF0IDIwMTQtMDMtMDFUMTI6MDA6MDAgRXVyb3BlL0Ftc3RlcmRhbSwga2VlcGluZyByZWd1bGFyIGludGVydmFsc1wiLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9pbnRlcnZhbC50b1N0cmluZygpICsgXCIsIHJlZmVyZW5jZWluZyBhdCBcIiArIHRoaXMuX3JlZmVyZW5jZS50b1N0cmluZygpO1xuICAgICAgICAvLyBvbmx5IGFkZCB0aGUgRFNUIGhhbmRsaW5nIGlmIGl0IGlzIHJlbGV2YW50XG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gXCIsIGtlZXBpbmcgXCIgKyBwZXJpb2REc3RUb1N0cmluZyh0aGlzLl9kc3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgSlNPTi1jb21wYXRpYmxlIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgcGVyaW9kXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b0pzb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6IHRoaXMucmVmZXJlbmNlKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLmludGVydmFsKCkudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIHBlcmlvZERzdDogdGhpcy5kc3QoKSA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgPyBcInJlZ3VsYXJcIiA6IFwibG9jYWxcIlxuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NvcnJlY3REYXkgPSBmdW5jdGlvbiAoZCkge1xuICAgICAgICBpZiAodGhpcy5fcmVmZXJlbmNlICE9PSB0aGlzLl9pbnRSZWZlcmVuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShkLnllYXIoKSwgZC5tb250aCgpLCBNYXRoLm1pbihiYXNpY3MuZGF5c0luTW9udGgoZC55ZWFyKCksIGQubW9udGgoKSksIHRoaXMuX3JlZmVyZW5jZS5kYXkoKSksIGQuaG91cigpLCBkLm1pbnV0ZSgpLCBkLnNlY29uZCgpLCBkLm1pbGxpc2Vjb25kKCksIGQuem9uZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXG4gICAgICogdG8gPD0gMjguXG4gICAgICogQHJldHVybiBhIG5ldyBkYXRlIGlmIGRpZmZlcmVudCwgb3RoZXJ3aXNlIHRoZSBleGFjdCBzYW1lIG9iamVjdCAobm8gY2xvbmUhKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuX25vcm1hbGl6ZURheSA9IGZ1bmN0aW9uIChkLCBhbnltb250aCkge1xuICAgICAgICBpZiAoYW55bW9udGggPT09IHZvaWQgMCkgeyBhbnltb250aCA9IHRydWU7IH1cbiAgICAgICAgaWYgKCh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIGQuZGF5KCkgPiAyOClcbiAgICAgICAgICAgIHx8ICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgJiYgKGQubW9udGgoKSA9PT0gMiB8fCBhbnltb250aCkgJiYgZC5kYXkoKSA+IDI4KSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGQueWVhcigpLCBkLm1vbnRoKCksIDI4LCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgRFNUIGhhbmRsaW5nIGlzIHJlbGV2YW50IGZvciB1cy5cbiAgICAgKiAoaS5lLiBpZiB0aGUgcmVmZXJlbmNlIHRpbWUgem9uZSBoYXMgRFNUKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFBlcmlvZC5wcm90b3R5cGUuX2RzdFJlbGV2YW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XG4gICAgICAgIHJldHVybiAhISh6b25lXG4gICAgICAgICAgICAmJiB6b25lLmtpbmQoKSA9PT0gdGltZXpvbmVfMS5UaW1lWm9uZUtpbmQuUHJvcGVyXG4gICAgICAgICAgICAmJiB6b25lLmhhc0RzdCgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSB0aGUgdmFsdWVzIHdoZXJlIHBvc3NpYmxlIC0gbm90IGFsbCB2YWx1ZXNcbiAgICAgKiBhcmUgY29udmVydGlibGUgaW50byBvbmUgYW5vdGhlci4gV2Vla3MgYXJlIGNvbnZlcnRlZCB0byBkYXlzLlxuICAgICAqIEUuZy4gbW9yZSB0aGFuIDYwIG1pbnV0ZXMgaXMgdHJhbnNmZXJyZWQgdG8gaG91cnMsXG4gICAgICogYnV0IHNlY29uZHMgY2Fubm90IGJlIHRyYW5zZmVycmVkIHRvIG1pbnV0ZXMgZHVlIHRvIGxlYXAgc2Vjb25kcy5cbiAgICAgKiBXZWVrcyBhcmUgY29udmVydGVkIGJhY2sgdG8gZGF5cy5cbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBQZXJpb2QucHJvdG90eXBlLl9jYWxjSW50ZXJuYWxWYWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIG5vcm1hbGl6ZSBhbnkgYWJvdmUtdW5pdCB2YWx1ZXNcbiAgICAgICAgdmFyIGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xuICAgICAgICB2YXIgaW50VW5pdCA9IHRoaXMuX2ludGVydmFsLnVuaXQoKTtcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kICYmIGludEFtb3VudCA+PSAxMDAwICYmIGludEFtb3VudCAlIDEwMDAgPT09IDApIHtcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMTAwMDtcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWludXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyA2MDtcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyICYmIGludEFtb3VudCA+PSAyNCAmJiBpbnRBbW91bnQgJSAyNCA9PT0gMCkge1xuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMjQ7XG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xuICAgICAgICB9XG4gICAgICAgIC8vIG5vdyByZW1vdmUgd2Vla3Mgc28gd2UgaGF2ZSBvbmUgbGVzcyBjYXNlIHRvIHdvcnJ5IGFib3V0XG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrKSB7XG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgKiA3O1xuICAgICAgICAgICAgaW50VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkRheTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgaW50QW1vdW50ID49IDEyICYmIGludEFtb3VudCAlIDEyID09PSAwKSB7XG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMjtcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludEludGVydmFsID0gbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oaW50QW1vdW50LCBpbnRVbml0KTtcbiAgICAgICAgLy8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xuICAgICAgICAgICAgdGhpcy5faW50RHN0ID0gdGhpcy5fZHN0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faW50RHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm9ybWFsaXplIHJlZmVyZW5jZSBkYXlcbiAgICAgICAgdGhpcy5faW50UmVmZXJlbmNlID0gdGhpcy5fbm9ybWFsaXplRGF5KHRoaXMuX3JlZmVyZW5jZSwgZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIFBlcmlvZDtcbn0oKSk7XG5leHBvcnRzLlBlcmlvZCA9IFBlcmlvZDtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4ganNvbiB2YWx1ZSByZXByZXNlbnRzIGEgdmFsaWQgcGVyaW9kIEpTT05cbiAqIEBwYXJhbSBqc29uXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gaXNWYWxpZFBlcmlvZEpzb24oanNvbikge1xuICAgIGlmICh0eXBlb2YganNvbiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChqc29uID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBqc29uLmR1cmF0aW9uICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBqc29uLnBlcmlvZERzdCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YganNvbi5yZWZlcmVuY2UgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIVtcInJlZ3VsYXJcIiwgXCJsb2NhbFwiXS5pbmNsdWRlcyhqc29uLnBlcmlvZERzdCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLXVudXNlZC1leHByZXNzaW9uXG4gICAgICAgIG5ldyBQZXJpb2QoanNvbik7XG4gICAgfVxuICAgIGNhdGNoIChfYSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0cy5pc1ZhbGlkUGVyaW9kSnNvbiA9IGlzVmFsaWRQZXJpb2RKc29uO1xuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBQZXJpb2QuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XG4gKiBhZ2FpbnN0IGRpZmZlcmVudCB2ZXJzaW9ucyBvZiB0aGUgbGlicmFyeSBpbiBvbmUgcHJvY2VzcyBpbnN0ZWFkIG9mIGluc3RhbmNlb2ZcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBjaGVja1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGlzUGVyaW9kKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIlBlcmlvZFwiO1xufVxuZXhwb3J0cy5pc1BlcmlvZCA9IGlzUGVyaW9kO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB0aW1lc3RhbXAgPj0gYG9wdHMucmVmZXJlbmNlYCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHRpbWUuIFVzZXMgdGhlIHRpbWUgem9uZSBhbmQgRFNUIHNldHRpbmdzXG4gKiBvZiB0aGUgZ2l2ZW4gcmVmZXJlbmNlIHRpbWUuXG4gKiBAcGFyYW0gb3B0c1xuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkhvdXIgaWYgb3B0cy5ob3VyIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbnV0ZSBpZiBvcHRzLm1pbnV0ZSBvdXQgb2YgcmFuZ2VcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgaWYgb3B0cy5zZWNvbmQgb3V0IG9mIHJhbmdlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWlsbGlzZWNvbmQgaWYgb3B0cy5taWxsaXNlY29uZCBvdXQgb2YgcmFuZ2VcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrZGF5IGlmIG9wdHMud2Vla2RheSBvdXQgb2YgcmFuZ2VcbiAqL1xuZnVuY3Rpb24gdGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvKG9wdHMpIHtcbiAgICB2YXIgX2EsIF9iLCBfYztcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZTogbWF4LWxpbmUtbGVuZ3RoXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMuaG91ciA+PSAwICYmIG9wdHMuaG91ciA8IDI0LCBcIkFyZ3VtZW50LkhvdXJcIiwgXCJvcHRzLmhvdXIgc2hvdWxkIGJlIHdpdGhpbiBbMC4uMjNdXCIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShvcHRzLm1pbnV0ZSA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLm1pbnV0ZSA+PSAwICYmIG9wdHMubWludXRlIDwgNjAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLm1pbnV0ZSkpLCBcIkFyZ3VtZW50Lk1pbnV0ZVwiLCBcIm9wdHMubWludXRlIHNob3VsZCBiZSB3aXRoaW4gWzAuLjU5XVwiKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5zZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5zZWNvbmQgPj0gMCAmJiBvcHRzLnNlY29uZCA8IDYwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5zZWNvbmQpKSwgXCJBcmd1bWVudC5TZWNvbmRcIiwgXCJvcHRzLnNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLi41OV1cIik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMubWlsbGlzZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taWxsaXNlY29uZCA+PSAwICYmIG9wdHMubWlsbGlzZWNvbmQgPCAxMDAwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taWxsaXNlY29uZCkpLCBcIkFyZ3VtZW50Lk1pbGxpc2Vjb25kXCIsIFwib3B0cy5taWxsaXNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLjk5OV1cIik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMud2Vla2RheSA+PSAwICYmIG9wdHMud2Vla2RheSA8IDcsIFwiQXJndW1lbnQuV2Vla2RheVwiLCBcIm9wdHMud2Vla2RheSBzaG91bGQgYmUgd2l0aGluIFswLi42XVwiKTtcbiAgICAvLyB0c2xpbnQ6ZW5hYmxlOiBtYXgtbGluZS1sZW5ndGhcbiAgICB2YXIgbWlkbmlnaHQgPSBvcHRzLnJlZmVyZW5jZS5zdGFydE9mRGF5KCk7XG4gICAgd2hpbGUgKG1pZG5pZ2h0LndlZWtEYXkoKSAhPT0gb3B0cy53ZWVrZGF5KSB7XG4gICAgICAgIG1pZG5pZ2h0ID0gbWlkbmlnaHQuYWRkTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoMSkpO1xuICAgIH1cbiAgICB2YXIgZHQgPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShtaWRuaWdodC55ZWFyKCksIG1pZG5pZ2h0Lm1vbnRoKCksIG1pZG5pZ2h0LmRheSgpLCBvcHRzLmhvdXIsIChfYSA9IG9wdHMubWludXRlKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAwLCAoX2IgPSBvcHRzLnNlY29uZCkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMCwgKF9jID0gb3B0cy5taWxsaXNlY29uZCkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogMCwgb3B0cy5yZWZlcmVuY2Uuem9uZSgpKTtcbiAgICBpZiAoZHQgPCBvcHRzLnJlZmVyZW5jZSkge1xuICAgICAgICAvLyB3ZSd2ZSBzdGFydGVkIG91dCBvbiB0aGUgY29ycmVjdCB3ZWVrZGF5IGFuZCB0aGUgcmVmZXJlbmNlIHRpbWVzdGFtcCB3YXMgZ3JlYXRlciB0aGFuIHRoZSBnaXZlbiB0aW1lLCBuZWVkIHRvIHNraXAgYSB3ZWVrXG4gICAgICAgIHJldHVybiBkdC5hZGRMb2NhbCgoMCwgZHVyYXRpb25fMS5kYXlzKSg3KSk7XG4gICAgfVxuICAgIHJldHVybiBkdDtcbn1cbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvID0gdGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB0aW1lc3RhbXAgPCBgb3B0cy5yZWZlcmVuY2VgIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgdGltZS4gVXNlcyB0aGUgdGltZSB6b25lIGFuZCBEU1Qgc2V0dGluZ3NcbiAqIG9mIHRoZSBnaXZlbiByZWZlcmVuY2UgdGltZS5cbiAqIEBwYXJhbSBvcHRzXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBpZiBvcHRzLmhvdXIgb3V0IG9mIHJhbmdlXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGlmIG9wdHMubWludXRlIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBpZiBvcHRzLnNlY29uZCBvdXQgb2YgcmFuZ2VcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaWxsaXNlY29uZCBpZiBvcHRzLm1pbGxpc2Vjb25kIG91dCBvZiByYW5nZVxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtkYXkgaWYgb3B0cy53ZWVrZGF5IG91dCBvZiByYW5nZVxuICovXG5mdW5jdGlvbiB0aW1lc3RhbXBPbldlZWtUaW1lTGVzc1RoYW4ob3B0cykge1xuICAgIHZhciBfYSwgX2IsIF9jO1xuICAgIC8vIHRzbGludDpkaXNhYmxlOiBtYXgtbGluZS1sZW5ndGhcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5ob3VyID49IDAgJiYgb3B0cy5ob3VyIDwgMjQsIFwiQXJndW1lbnQuSG91clwiLCBcIm9wdHMuaG91ciBzaG91bGQgYmUgd2l0aGluIFswLi4yM11cIik7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMubWludXRlID09PSB1bmRlZmluZWQgfHwgKG9wdHMubWludXRlID49IDAgJiYgb3B0cy5taW51dGUgPCA2MCAmJiBOdW1iZXIuaXNJbnRlZ2VyKG9wdHMubWludXRlKSksIFwiQXJndW1lbnQuTWludXRlXCIsIFwib3B0cy5taW51dGUgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNTldXCIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShvcHRzLnNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLnNlY29uZCA+PSAwICYmIG9wdHMuc2Vjb25kIDwgNjAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLnNlY29uZCkpLCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcIm9wdHMuc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuLjU5XVwiKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5taWxsaXNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLm1pbGxpc2Vjb25kID49IDAgJiYgb3B0cy5taWxsaXNlY29uZCA8IDEwMDAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLm1pbGxpc2Vjb25kKSksIFwiQXJndW1lbnQuTWlsbGlzZWNvbmRcIiwgXCJvcHRzLm1pbGxpc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuOTk5XVwiKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy53ZWVrZGF5ID49IDAgJiYgb3B0cy53ZWVrZGF5IDwgNywgXCJBcmd1bWVudC5XZWVrZGF5XCIsIFwib3B0cy53ZWVrZGF5IHNob3VsZCBiZSB3aXRoaW4gWzAuLjZdXCIpO1xuICAgIC8vIHRzbGludDplbmFibGU6IG1heC1saW5lLWxlbmd0aFxuICAgIHZhciBtaWRuaWdodCA9IG9wdHMucmVmZXJlbmNlLnN0YXJ0T2ZEYXkoKS5hZGRMb2NhbCgoMCwgZHVyYXRpb25fMS5kYXlzKSgxKSk7XG4gICAgd2hpbGUgKG1pZG5pZ2h0LndlZWtEYXkoKSAhPT0gb3B0cy53ZWVrZGF5KSB7XG4gICAgICAgIG1pZG5pZ2h0ID0gbWlkbmlnaHQuc3ViTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoMSkpO1xuICAgIH1cbiAgICB2YXIgZHQgPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShtaWRuaWdodC55ZWFyKCksIG1pZG5pZ2h0Lm1vbnRoKCksIG1pZG5pZ2h0LmRheSgpLCBvcHRzLmhvdXIsIChfYSA9IG9wdHMubWludXRlKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAwLCAoX2IgPSBvcHRzLnNlY29uZCkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMCwgKF9jID0gb3B0cy5taWxsaXNlY29uZCkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogMCwgb3B0cy5yZWZlcmVuY2Uuem9uZSgpKTtcbiAgICBpZiAoZHQgPj0gb3B0cy5yZWZlcmVuY2UpIHtcbiAgICAgICAgLy8gd2UndmUgc3RhcnRlZCBvdXQgb24gdGhlIGNvcnJlY3Qgd2Vla2RheSBhbmQgdGhlIHJlZmVyZW5jZSB0aW1lc3RhbXAgd2FzIGxlc3MgdGhhbiB0aGUgZ2l2ZW4gdGltZSwgbmVlZCB0byBza2lwIGEgd2Vla1xuICAgICAgICByZXR1cm4gZHQuc3ViTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoNykpO1xuICAgIH1cbiAgICByZXR1cm4gZHQ7XG59XG5leHBvcnRzLnRpbWVzdGFtcE9uV2Vla1RpbWVMZXNzVGhhbiA9IHRpbWVzdGFtcE9uV2Vla1RpbWVMZXNzVGhhbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBlcmlvZC5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogU3RyaW5nIHV0aWxpdHkgZnVuY3Rpb25zXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5wYWRSaWdodCA9IGV4cG9ydHMucGFkTGVmdCA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbi8qKlxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXG4gKiBAcGFyYW0gc1x0dGhlIHN0cmluZyB0byBwYWRcbiAqIEBwYXJhbSB3aWR0aFx0dGhlIGRlc2lyZWQgbWluaW11bSBzdHJpbmcgd2lkdGhcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxuICogQHJldHVyblx0dGhlIHBhZGRlZCBzdHJpbmdcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XaWR0aCBpZiB3aWR0aCBpcyBub3QgYW4gaW50ZWdlciBudW1iZXIgPj0gMFxuICovXG5mdW5jdGlvbiBwYWRMZWZ0KHMsIHdpZHRoLCBjaGFyKSB7XG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIod2lkdGgpICYmIHdpZHRoID49IDAsIFwiQXJndW1lbnQuV2lkdGhcIiwgXCJ3aWR0aCBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXIgPj0gMCBidXQgaXM6ICVkXCIsIHdpZHRoKTtcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAod2lkdGggLSBzLmxlbmd0aCk7IGkrKykge1xuICAgICAgICBwYWRkaW5nICs9IGNoYXI7XG4gICAgfVxuICAgIHJldHVybiBwYWRkaW5nICsgcztcbn1cbmV4cG9ydHMucGFkTGVmdCA9IHBhZExlZnQ7XG4vKipcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgZW5kLlxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2lkdGggaWYgd2lkdGggaXMgbm90IGFuIGludGVnZXIgbnVtYmVyID49IDBcbiAqL1xuZnVuY3Rpb24gcGFkUmlnaHQocywgd2lkdGgsIGNoYXIpIHtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih3aWR0aCkgJiYgd2lkdGggPj0gMCwgXCJBcmd1bWVudC5XaWR0aFwiLCBcIndpZHRoIHNob3VsZCBiZSBhbiBpbnRlZ2VyIG51bWJlciA+PSAwIGJ1dCBpczogJWRcIiwgd2lkdGgpO1xuICAgIHZhciBwYWRkaW5nID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XG4gICAgICAgIHBhZGRpbmcgKz0gY2hhcjtcbiAgICB9XG4gICAgcmV0dXJuIHMgKyBwYWRkaW5nO1xufVxuZXhwb3J0cy5wYWRSaWdodCA9IHBhZFJpZ2h0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RyaW5ncy5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5SZWFsVGltZVNvdXJjZSA9IHZvaWQgMDtcbi8qKlxuICogRGVmYXVsdCB0aW1lIHNvdXJjZSwgcmV0dXJucyBhY3R1YWwgdGltZVxuICovXG52YXIgUmVhbFRpbWVTb3VyY2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUmVhbFRpbWVTb3VyY2UoKSB7XG4gICAgfVxuICAgIC8qKiBAaW5oZXJpdGRvYyAqL1xuICAgIFJlYWxUaW1lU291cmNlLnByb3RvdHlwZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBpZiAodHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBSZWFsVGltZVNvdXJjZTtcbn0oKSk7XG5leHBvcnRzLlJlYWxUaW1lU291cmNlID0gUmVhbFRpbWVTb3VyY2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lc291cmNlLmpzLm1hcCIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBUaW1lIHpvbmUgcmVwcmVzZW50YXRpb24gYW5kIG9mZnNldCBjYWxjdWxhdGlvblxuICovXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaXNUaW1lWm9uZSA9IGV4cG9ydHMuVGltZVpvbmUgPSBleHBvcnRzLlRpbWVab25lS2luZCA9IGV4cG9ydHMuem9uZSA9IGV4cG9ydHMudXRjID0gZXhwb3J0cy5sb2NhbCA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XG52YXIgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xuLyoqXG4gKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUgYXMgcGVyIE9TIHNldHRpbmdzLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gbG9jYWwoKSB7XG4gICAgcmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XG59XG5leHBvcnRzLmxvY2FsID0gbG9jYWw7XG4vKipcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgem9uZSBpcyBub3QgcHJlc2VudCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gKi9cbmZ1bmN0aW9uIHV0YygpIHtcbiAgICByZXR1cm4gVGltZVpvbmUudXRjKCk7XG59XG5leHBvcnRzLnV0YyA9IHV0Yztcbi8qKlxuICogem9uZSgpIGltcGxlbWVudGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHpvbmUoYSwgZHN0KSB7XG4gICAgcmV0dXJuIFRpbWVab25lLnpvbmUoYSwgZHN0KTtcbn1cbmV4cG9ydHMuem9uZSA9IHpvbmU7XG4vKipcbiAqIFRoZSB0eXBlIG9mIHRpbWUgem9uZVxuICovXG52YXIgVGltZVpvbmVLaW5kO1xuKGZ1bmN0aW9uIChUaW1lWm9uZUtpbmQpIHtcbiAgICAvKipcbiAgICAgKiBMb2NhbCB0aW1lIG9mZnNldCBhcyBkZXRlcm1pbmVkIGJ5IEphdmFTY3JpcHQgRGF0ZSBjbGFzcy5cbiAgICAgKi9cbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiTG9jYWxcIl0gPSAwXSA9IFwiTG9jYWxcIjtcbiAgICAvKipcbiAgICAgKiBGaXhlZCBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxuICAgICAqL1xuICAgIFRpbWVab25lS2luZFtUaW1lWm9uZUtpbmRbXCJPZmZzZXRcIl0gPSAxXSA9IFwiT2Zmc2V0XCI7XG4gICAgLyoqXG4gICAgICogSUFOQSB0aW1lem9uZSBtYW5hZ2VkIHRocm91Z2ggT2xzZW4gVFogZGF0YWJhc2UuIEluY2x1ZGVzXG4gICAgICogRFNUIGlmIGFwcGxpY2FibGUuXG4gICAgICovXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIlByb3BlclwiXSA9IDJdID0gXCJQcm9wZXJcIjtcbn0pKFRpbWVab25lS2luZCB8fCAoZXhwb3J0cy5UaW1lWm9uZUtpbmQgPSBUaW1lWm9uZUtpbmQgPSB7fSkpO1xuLyoqXG4gKiBUaW1lIHpvbmUuIFRoZSBvYmplY3QgaXMgaW1tdXRhYmxlIGJlY2F1c2UgaXQgaXMgY2FjaGVkOlxuICogcmVxdWVzdGluZyBhIHRpbWUgem9uZSB0d2ljZSB5aWVsZHMgdGhlIHZlcnkgc2FtZSBvYmplY3QuXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcbiAqIGkuZS4gb2Zmc2V0IDkwIG1lYW5zICswMTozMC5cbiAqXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXG4gKiBhIGZpeGVkIG9mZnNldCAoXCIrMDE6MzBcIikgd2l0aG91dCBEU1QsIG9yIGEgSUFOQSB0aW1lem9uZSAoXCJFdXJvcGUvQW1zdGVyZGFtXCIpIHdpdGggRFNUXG4gKiBhcHBsaWVkIGRlcGVuZGluZyBvbiB0aGUgdGltZSB6b25lIHJ1bGVzLlxuICovXG52YXIgVGltZVpvbmUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xuICAgICAqIFRpbWVab25lLnpvbmUoKSBtZXRob2QgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gbmFtZSBOT1JNQUxJWkVEIG5hbWUsIGFzc3VtZWQgdG8gYmUgY29ycmVjdFxuICAgICAqIEBwYXJhbSBkc3QgQWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUsIGlnbm9yZWQgZm9yIGxvY2FsIHRpbWUgYW5kIGZpeGVkIG9mZnNldHNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGRvZXNuJ3QgZXhpc3RcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGlzIGludmFsaWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBUaW1lWm9uZShuYW1lLCBkc3QpIHtcbiAgICAgICAgaWYgKGRzdCA9PT0gdm9pZCAwKSB7IGRzdCA9IHRydWU7IH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFsbG93IG5vdCB1c2luZyBpbnN0YW5jZW9mXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsYXNzS2luZCA9IFwiVGltZVpvbmVcIjtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcbiAgICAgICAgaWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuTG9jYWw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IG5hbWUuY2hhckF0KDApID09PSBcIi1cIiB8fCBuYW1lLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykgfHwgbmFtZSA9PT0gXCJaXCIpIHtcbiAgICAgICAgICAgIHRoaXMuX2tpbmQgPSBUaW1lWm9uZUtpbmQuT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIFwiTm90Rm91bmQuWm9uZVwiLCBcIm5vbi1leGlzdGluZyB0aW1lIHpvbmUgbmFtZSAnJXMnXCIsIG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZS4gTm90ZSB0aGF0XG4gICAgICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXG4gICAgICogMjAxNC0wMS0wMSBpcyArMDE6MDAgYW5kIGFtc3RlcmRhbSB0aW1lIGZvciAyMDE0LTA3LTAxIGlzICswMjowMFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVab25lLmxvY2FsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShcImxvY2FsdGltZVwiLCB0cnVlKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSBVVEMgdGltZSB6b25lLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFRpbWVab25lLnV0YyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJVVENcIiwgdHJ1ZSk7IC8vIHVzZSAndHJ1ZScgZm9yIERTVCBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gZGlzcGxheSBhcyBcIlVUQ1wiLCBub3QgXCJVVEMgd2l0aG91dCBEU1RcIlxuICAgIH07XG4gICAgLyoqXG4gICAgICogem9uZSgpIGltcGxlbWVudGF0aW9uc1xuICAgICAqL1xuICAgIFRpbWVab25lLnpvbmUgPSBmdW5jdGlvbiAoYSwgZHN0KSB7XG4gICAgICAgIGlmIChkc3QgPT09IHZvaWQgMCkgeyBkc3QgPSB0cnVlOyB9XG4gICAgICAgIHZhciBuYW1lID0gXCJcIjtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgKGEpKSB7XG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IGE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgPSBzLnNsaWNlKDAsIHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IGE7XG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShvZmZzZXQgPiAtMjQgKiA2MCAmJiBvZmZzZXQgPCAyNCAqIDYwLCBcIkFyZ3VtZW50Lk9mZnNldFwiLCBcIlRpbWVab25lLnpvbmUoKTogb2Zmc2V0IG91dCBvZiByYW5nZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLm9mZnNldFRvU3RyaW5nKG9mZnNldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5BXCIsIFwidW5leHBlY3RlZCB0eXBlIGZvciBmaXJzdCBhcmd1bWVudDogJXNcIiwgdHlwZW9mIGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgaW1tdXRhYmxlIHlvdSB3aWxsIE5PVFxuICAgICAqIGFjdHVhbGx5IGdldCBhIGNsb25lIGJ1dCB0aGUgc2FtZSBvYmplY3QuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllci4gQ2FuIGJlIGFuIG9mZnNldCBcIi0wMTozMFwiIG9yIGFuXG4gICAgICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcbiAgICAgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgRFNUIGlzIGVuYWJsZWRcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuZHN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHN0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5raW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fa2luZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xuICAgICAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxuICAgICAgICAgICAgICAgICYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgY29uc3RydWN0b3IgYXJndW1lbnRzIHdlcmUgaWRlbnRpY2FsLCBzbyBVVEMgIT09IEdNVFxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyICYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lICYmIHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgZ2xvYmFsIHRpbWUgem9uZSBkYXRhIGlzIGludmFsaWRcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaXNVdGMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuICh0aGlzLl9vZmZzZXQgPT09IDApO1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnpvbmVJc1V0Yyh0aGlzLl9uYW1lKSk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3JVdGMgPSBmdW5jdGlvbiAoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XG4gICAgICAgICAgICB0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHt9KSA6XG4gICAgICAgICAgICAgICAgYSk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LCB1dGNUaW1lLmNvbXBvbmVudHMuaG91ciwgdXRjVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgdXRjVGltZS5jb21wb25lbnRzLnNlY29uZCwgdXRjVGltZS5jb21wb25lbnRzLm1pbGxpKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXRGb3JVdGMgPSBmdW5jdGlvbiAoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XG4gICAgICAgICAgICB0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHt9KSA6XG4gICAgICAgICAgICAgICAgYSk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCAwLCAxLCAwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCB1dGNUaW1lKS5taW51dGVzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3Jab25lID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xuICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XG4gICAgICAgICAgICB0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHt9KSA6XG4gICAgICAgICAgICAgICAgYSk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuZGF5LCBsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGkpO1xuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcbiAgICAgICAgICAgICAgICAvLyBub3RlIHRoYXQgVHpEYXRhYmFzZSBub3JtYWxpemVzIHRoZSBnaXZlbiBkYXRlIHNvIHdlIGRvbid0IGhhdmUgdG8gZG8gaXRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIGxvY2FsVGltZSkubWludXRlcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcbiAgICAgKlxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxuICAgICAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcbiAgICAgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFRpbWVab25lLnByb3RvdHlwZS5vZmZzZXRGb3JVdGNEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclV0YyhiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxuICAgICAqXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXG4gICAgICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxuICAgICAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gICAgICovXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclpvbmVEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuICAgIH07XG4gICAgVGltZVpvbmUucHJvdG90eXBlLmFiYnJldmlhdGlvbkZvclV0YyA9IGZ1bmN0aW9uIChhLCBiLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSwgYykge1xuICAgICAgICB2YXIgdXRjVGltZTtcbiAgICAgICAgdmFyIGRzdERlcGVuZGVudCA9IHRydWU7XG4gICAgICAgIGlmICh0eXBlb2YgYSAhPT0gXCJudW1iZXJcIiAmJiAhIWEpIHtcbiAgICAgICAgICAgIHV0Y1RpbWUgPSBhO1xuICAgICAgICAgICAgZHN0RGVwZW5kZW50ID0gKGIgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHV0Y1RpbWUgPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoOiBiLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XG4gICAgICAgICAgICBkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJsb2NhbFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5hYmJyZXZpYXRpb24odGhpcy5fbmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgVGltZVpvbmUucHJvdG90eXBlLm5vcm1hbGl6ZVpvbmVUaW1lID0gZnVuY3Rpb24gKGxvY2FsVGltZSwgb3B0KSB7XG4gICAgICAgIGlmIChvcHQgPT09IHZvaWQgMCkgeyBvcHQgPSB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxuICAgICAgICB2YXIgdHpvcHQgPSAob3B0ID09PSB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uRG93biA6IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwKTtcbiAgICAgICAgaWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChsb2NhbFRpbWUpLCB0em9wdCkudW5peE1pbGxpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUsIHR6b3B0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFRpbWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllciAobm9ybWFsaXplZCkuXG4gICAgICogRWl0aGVyIFwibG9jYWx0aW1lXCIsIElBTkEgbmFtZSwgb3IgXCIraGg6bW1cIiBvZmZzZXQuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVpvbmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5uYW1lKCk7XG4gICAgICAgIGlmICh0aGlzLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3Blcikge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRHN0KCkgJiYgIXRoaXMuZHN0KCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgd2l0aG91dCBEU1RcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ29udmVydCBhbiBvZmZzZXQgbnVtYmVyIGludG8gYW4gb2Zmc2V0IHN0cmluZ1xuICAgICAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xuICAgICAqIEByZXR1cm4gdGhlIG9mZnNldCBpbiBJU08gbm90YXRpb24gXCIrMDE6MzBcIiBmb3IgKzkwIG1pbnV0ZXNcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50Lk9mZnNldCBpZiBvZmZzZXQgaXMgbm90IGEgZmluaXRlIG51bWJlciBvciBub3Qgd2l0aGluIC0yNCAqIDYwIC4uLiArMjQgKiA2MCBtaW51dGVzXG4gICAgICovXG4gICAgVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNGaW5pdGUob2Zmc2V0KSAmJiBvZmZzZXQgPj0gLTI0ICogNjAgJiYgb2Zmc2V0IDw9IDI0ICogNjAsIFwiQXJndW1lbnQuT2Zmc2V0XCIsIFwiaW52YWxpZCBvZmZzZXQgJWRcIiwgb2Zmc2V0KTtcbiAgICAgICAgdmFyIHNpZ24gPSAob2Zmc2V0IDwgMCA/IFwiLVwiIDogXCIrXCIpO1xuICAgICAgICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xuICAgICAgICByZXR1cm4gc2lnbiArIHN0cmluZ3MucGFkTGVmdChob3Vycy50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KG1pbnV0ZXMudG9TdHJpbmcoMTApLCAyLCBcIjBcIik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTdHJpbmcgdG8gb2Zmc2V0IGNvbnZlcnNpb24uXG4gICAgICogQHBhcmFtIHNcdEZvcm1hdHM6IFwiLTAxOjAwXCIsIFwiLTAxMDBcIiwgXCItMDFcIiwgXCJaXCJcbiAgICAgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuUyBpZiBzIGNhbm5vdCBiZSBwYXJzZWRcbiAgICAgKi9cbiAgICBUaW1lWm9uZS5zdHJpbmdUb09mZnNldCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XG4gICAgICAgIC8vIGVhc3kgY2FzZVxuICAgICAgICBpZiAodCA9PT0gXCJaXCIpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHQubWF0Y2goL15bKy1dXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkKDo/KVxcZFxcZCQvKSwgXCJBcmd1bWVudC5TXCIsIFwiV3JvbmcgdGltZSB6b25lIGZvcm1hdDogXFxcIlwiICsgdCArIFwiXFxcIlwiKTtcbiAgICAgICAgdmFyIHNpZ24gPSAodC5jaGFyQXQoMCkgPT09IFwiK1wiID8gMSA6IC0xKTtcbiAgICAgICAgdmFyIGhvdXJzID0gMDtcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSAwO1xuICAgICAgICBzd2l0Y2ggKHQubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgaG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDIpLCAxMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgaG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgaG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XG4gICAgICAgICAgICAgICAgbWludXRlcyA9IHBhcnNlSW50KHQuc2xpY2UoMywgNSksIDEwKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcbiAgICAgICAgICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQodC5zbGljZSg0LCA2KSwgMTApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShob3VycyA+PSAwICYmIGhvdXJzIDwgMjQsIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgdGltZSB6b25lIChob3VycyBvdXQgb2YgcmFuZ2UpOiAnXCIuY29uY2F0KHQsIFwiJ1wiKSk7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShtaW51dGVzID49IDAgJiYgbWludXRlcyA8IDYwLCBcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIHRpbWUgem9uZSAobWludXRlcyBvdXQgb2YgcmFuZ2UpOiAnXCIuY29uY2F0KHQsIFwiJ1wiKSk7XG4gICAgICAgIHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcbiAgICAgKiBAcGFyYW0gbmFtZVx0VGltZSB6b25lIG5hbWVcbiAgICAgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWU/XG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVGltZVpvbmUuX2ZpbmRPckNyZWF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBkc3QpIHtcbiAgICAgICAgdmFyIGtleSA9IG5hbWUgKyAoZHN0ID8gXCJfRFNUXCIgOiBcIl9OTy1EU1RcIik7XG4gICAgICAgIGlmIChrZXkgaW4gVGltZVpvbmUuX2NhY2hlKSB7XG4gICAgICAgICAgICByZXR1cm4gVGltZVpvbmUuX2NhY2hlW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgdCA9IG5ldyBUaW1lWm9uZShuYW1lLCBkc3QpO1xuICAgICAgICAgICAgVGltZVpvbmUuX2NhY2hlW2tleV0gPSB0O1xuICAgICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBhIHN0cmluZyBzbyBpdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBmb3IgYSBjYWNoZSBsb29rdXBcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50LlMgaWYgcyBpcyBlbXB0eVxuICAgICAqL1xuICAgIFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcgPSBmdW5jdGlvbiAocykge1xuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodC5sZW5ndGggPiAwLCBcIkFyZ3VtZW50LlNcIiwgXCJFbXB0eSB0aW1lIHpvbmUgc3RyaW5nIGdpdmVuXCIpO1xuICAgICAgICBpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xuICAgICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodCA9PT0gXCJaXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcIiswMDowMFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKFRpbWVab25lLl9pc09mZnNldFN0cmluZyh0KSkge1xuICAgICAgICAgICAgLy8gb2Zmc2V0IHN0cmluZ1xuICAgICAgICAgICAgLy8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiQXJndW1lbnQuT2Zmc2V0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGUgPSAoMCwgZXJyb3JfMS5lcnJvcikoXCJBcmd1bWVudC5TXCIsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXG4gICAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyIG9mIHMgaXMgKywgLSwgb3IgWlxuICAgICAqIEBwYXJhbSBzXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcbiAgICAgICAgcmV0dXJuICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgdC5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IHQgPT09IFwiWlwiKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRpbWUgem9uZSBjYWNoZS5cbiAgICAgKi9cbiAgICBUaW1lWm9uZS5fY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gVGltZVpvbmU7XG59KCkpO1xuZXhwb3J0cy5UaW1lWm9uZSA9IFRpbWVab25lO1xuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBUaW1lWm9uZS4gTm90ZSB0aGF0IGl0IGRvZXMgbm90IHdvcmsgZm9yIHN1YiBjbGFzc2VzLiBIb3dldmVyLCB1c2UgdGhpcyB0byBiZSByb2J1c3RcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZnVuY3Rpb24gaXNUaW1lWm9uZSh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUuY2xhc3NLaW5kID09PSBcIlRpbWVab25lXCI7XG59XG5leHBvcnRzLmlzVGltZVpvbmUgPSBpc1RpbWVab25lO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZXpvbmUuanMubWFwIiwiLyoqXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXG4gKi9cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy50b2tlbml6ZSA9IGV4cG9ydHMuVG9rZW5UeXBlID0gdm9pZCAwO1xuLyoqXG4gKiBEaWZmZXJlbnQgdHlwZXMgb2YgdG9rZW5zLCBlYWNoIGZvciBhIERhdGVUaW1lIFwicGVyaW9kIHR5cGVcIiAobGlrZSB5ZWFyLCBtb250aCwgaG91ciBldGMuKVxuICovXG52YXIgVG9rZW5UeXBlO1xuKGZ1bmN0aW9uIChUb2tlblR5cGUpIHtcbiAgICAvKipcbiAgICAgKiBSYXcgdGV4dFxuICAgICAqL1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJJREVOVElUWVwiXSA9IDBdID0gXCJJREVOVElUWVwiO1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJFUkFcIl0gPSAxXSA9IFwiRVJBXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIllFQVJcIl0gPSAyXSA9IFwiWUVBUlwiO1xuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJRVUFSVEVSXCJdID0gM10gPSBcIlFVQVJURVJcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiTU9OVEhcIl0gPSA0XSA9IFwiTU9OVEhcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiV0VFS1wiXSA9IDVdID0gXCJXRUVLXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkRBWVwiXSA9IDZdID0gXCJEQVlcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiV0VFS0RBWVwiXSA9IDddID0gXCJXRUVLREFZXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkRBWVBFUklPRFwiXSA9IDhdID0gXCJEQVlQRVJJT0RcIjtcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiSE9VUlwiXSA9IDldID0gXCJIT1VSXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIk1JTlVURVwiXSA9IDEwXSA9IFwiTUlOVVRFXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlNFQ09ORFwiXSA9IDExXSA9IFwiU0VDT05EXCI7XG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlpPTkVcIl0gPSAxMl0gPSBcIlpPTkVcIjtcbn0pKFRva2VuVHlwZSB8fCAoZXhwb3J0cy5Ub2tlblR5cGUgPSBUb2tlblR5cGUgPSB7fSkpO1xuLyoqXG4gKiBUb2tlbml6ZSBhbiBMRE1MIGRhdGUvdGltZSBmb3JtYXQgc3RyaW5nXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIHRoZSBzdHJpbmcgdG8gdG9rZW5pemVcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5mdW5jdGlvbiB0b2tlbml6ZShmb3JtYXRTdHJpbmcpIHtcbiAgICBpZiAoIWZvcm1hdFN0cmluZykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXBwZW5kVG9rZW4gPSBmdW5jdGlvbiAodG9rZW5TdHJpbmcsIHJhdykge1xuICAgICAgICAvLyBUaGUgdG9rZW5TdHJpbmcgbWF5IGJlIGxvbmdlciB0aGFuIHN1cHBvcnRlZCBmb3IgYSB0b2tlbnR5cGUsIGUuZy4gXCJoaGhoXCIgd2hpY2ggd291bGQgYmUgVFdPIGhvdXIgc3BlY3MuXG4gICAgICAgIC8vIFdlIGdyZWVkaWx5IGNvbnN1bWUgTERNTCBzcGVjcyB3aGlsZSBwb3NzaWJsZVxuICAgICAgICB3aGlsZSAodG9rZW5TdHJpbmcgIT09IFwiXCIpIHtcbiAgICAgICAgICAgIGlmIChyYXcgfHwgIVNZTUJPTF9NQVBQSU5HLmhhc093blByb3BlcnR5KHRva2VuU3RyaW5nWzBdKSkge1xuICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5JREVOVElUWVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIHRva2VuU3RyaW5nID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0b2tlbiwgZGlmZmVyZW50IGxlbmd0aHMgbWF5IGJlIHN1cHBvcnRlZFxuICAgICAgICAgICAgICAgIHZhciBpbmZvID0gU1lNQk9MX01BUFBJTkdbdG9rZW5TdHJpbmdbMF1dO1xuICAgICAgICAgICAgICAgIHZhciBsZW5ndGhfMSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaW5mby5tYXhMZW5ndGggPT09IHVuZGVmaW5lZCAmJiAoIUFycmF5LmlzQXJyYXkoaW5mby5sZW5ndGhzKSB8fCBpbmZvLmxlbmd0aHMubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBldmVyeXRoaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoXzEgPSB0b2tlblN0cmluZy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluZm8ubWF4TGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ3JlZWRpbHkgZ29iYmxlIHVwXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aF8xID0gTWF0aC5taW4odG9rZW5TdHJpbmcubGVuZ3RoLCBpbmZvLm1heExlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi8gaWYgKEFycmF5LmlzQXJyYXkoaW5mby5sZW5ndGhzKSAmJiBpbmZvLmxlbmd0aHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIG1heGltdW0gYWxsb3dlZCBsZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGluZm8ubGVuZ3RoczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGwgPD0gdG9rZW5TdHJpbmcubGVuZ3RoICYmIChsZW5ndGhfMSA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aF8xIDwgbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGhfMSA9IGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGxlbmd0aF8xID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbm8gYWxsb3dlZCBsZW5ndGggZm91bmQgKG5vdCBwb3NzaWJsZSB3aXRoIGN1cnJlbnQgc3ltYm9sIG1hcHBpbmcgc2luY2UgbGVuZ3RoIDEgaXMgYWx3YXlzIGFsbG93ZWQpXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiB0b2tlblN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBUb2tlblR5cGUuSURFTlRJVFlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICB0b2tlblN0cmluZyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmVmaXggZm91bmRcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBsZW5ndGhfMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcuc2xpY2UoMCwgbGVuZ3RoXzEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiB0b2tlblN0cmluZ1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGluZm8udHlwZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgICAgIHRva2VuU3RyaW5nID0gdG9rZW5TdHJpbmcuc2xpY2UobGVuZ3RoXzEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGN1cnJlbnRUb2tlbiA9IFwiXCI7XG4gICAgdmFyIHByZXZpb3VzQ2hhciA9IFwiXCI7XG4gICAgdmFyIHF1b3RpbmcgPSBmYWxzZTtcbiAgICB2YXIgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuICAgIGZvciAodmFyIF9pID0gMCwgZm9ybWF0U3RyaW5nXzEgPSBmb3JtYXRTdHJpbmc7IF9pIDwgZm9ybWF0U3RyaW5nXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBjdXJyZW50Q2hhciA9IGZvcm1hdFN0cmluZ18xW19pXTtcbiAgICAgICAgLy8gSGFubGRlIGVzY2FwaW5nIGFuZCBxdW90aW5nXG4gICAgICAgIGlmIChjdXJyZW50Q2hhciA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgIGlmICghcXVvdGluZykge1xuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEVzY2FwZWQgYSBzaW5nbGUgJyBjaGFyYWN0ZXIgd2l0aG91dCBxdW90aW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q2hhciAhPT0gcHJldmlvdXNDaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gXCInXCI7XG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFR3byBwb3NzaWJpbGl0aWVzOiBXZXJlIGFyZSBkb25lIHF1b3RpbmcsIG9yIHdlIGFyZSBlc2NhcGluZyBhICcgY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlRXNjYXBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRXNjYXBpbmcsIGFkZCAnIHRvIHRoZSB0b2tlblxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1heWJlIGVzY2FwaW5nLCB3YWl0IGZvciBuZXh0IHRva2VuIGlmIHdlIGFyZSBlc2NhcGluZ1xuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXBvc3NpYmxlRXNjYXBpbmcpIHtcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXG4gICAgICAgICAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XG4gICAgICAgICAgICBxdW90aW5nID0gIXF1b3Rpbmc7XG4gICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBGbHVzaCBjdXJyZW50IHRva2VuXG4gICAgICAgICAgICBhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sICFxdW90aW5nKTtcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHF1b3RpbmcpIHtcbiAgICAgICAgICAgIC8vIFF1b3RpbmcgbW9kZSwgYWRkIGNoYXJhY3RlciB0byB0b2tlbi5cbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcbiAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcbiAgICAgICAgICAgIC8vIFdlIHN0dW1ibGVkIHVwb24gYSBuZXcgdG9rZW4hXG4gICAgICAgICAgICBhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4pO1xuICAgICAgICAgICAgY3VycmVudFRva2VuID0gY3VycmVudENoYXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xuICAgICAgICAgICAgY3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xuICAgIH1cbiAgICAvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXG4gICAgYXBwZW5kVG9rZW4oY3VycmVudFRva2VuLCBxdW90aW5nKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy50b2tlbml6ZSA9IHRva2VuaXplO1xudmFyIFNZTUJPTF9NQVBQSU5HID0ge1xuICAgIEc6IHsgdHlwZTogVG9rZW5UeXBlLkVSQSwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgeTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxuICAgIFk6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcbiAgICB1OiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXG4gICAgVTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgcjogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxuICAgIFE6IHsgdHlwZTogVG9rZW5UeXBlLlFVQVJURVIsIG1heExlbmd0aDogNSB9LFxuICAgIHE6IHsgdHlwZTogVG9rZW5UeXBlLlFVQVJURVIsIG1heExlbmd0aDogNSB9LFxuICAgIE06IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDUgfSxcbiAgICBMOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgbDogeyB0eXBlOiBUb2tlblR5cGUuTU9OVEgsIG1heExlbmd0aDogMSB9LFxuICAgIHc6IHsgdHlwZTogVG9rZW5UeXBlLldFRUssIG1heExlbmd0aDogMiB9LFxuICAgIFc6IHsgdHlwZTogVG9rZW5UeXBlLldFRUssIG1heExlbmd0aDogMSB9LFxuICAgIGQ6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAyIH0sXG4gICAgRDogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDMgfSxcbiAgICBGOiB7IHR5cGU6IFRva2VuVHlwZS5EQVksIG1heExlbmd0aDogMSB9LFxuICAgIGc6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSB9LFxuICAgIEU6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxuICAgIGU6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxuICAgIGM6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxuICAgIGE6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXG4gICAgYjogeyB0eXBlOiBUb2tlblR5cGUuREFZUEVSSU9ELCBtYXhMZW5ndGg6IDUgfSxcbiAgICBCOiB7IHR5cGU6IFRva2VuVHlwZS5EQVlQRVJJT0QsIG1heExlbmd0aDogNSB9LFxuICAgIGg6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuICAgIEg6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuICAgIGs6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuICAgIEs6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuICAgIGo6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogNiB9LFxuICAgIEo6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuICAgIG06IHsgdHlwZTogVG9rZW5UeXBlLk1JTlVURSwgbWF4TGVuZ3RoOiAyIH0sXG4gICAgczogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05ELCBtYXhMZW5ndGg6IDIgfSxcbiAgICBTOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQgfSxcbiAgICBBOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQgfSxcbiAgICB6OiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDQgfSxcbiAgICBaOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcbiAgICBPOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBsZW5ndGhzOiBbMSwgNF0gfSxcbiAgICB2OiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBsZW5ndGhzOiBbMSwgNF0gfSxcbiAgICBWOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDQgfSxcbiAgICBYOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcbiAgICB4OiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD10b2tlbi5qcy5tYXAiLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogT2xzZW4gVGltZXpvbmUgRGF0YWJhc2UgY29udGFpbmVyXG4gKlxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tLCBwYWNrKSB7XG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlR6RGF0YWJhc2UgPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuVHJhbnNpdGlvbiA9IGV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGV4cG9ydHMuWm9uZUluZm8gPSBleHBvcnRzLlJ1bGVUeXBlID0gZXhwb3J0cy5SdWxlSW5mbyA9IGV4cG9ydHMuQXRUeXBlID0gZXhwb3J0cy5PblR5cGUgPSBleHBvcnRzLlRvVHlwZSA9IHZvaWQgMDtcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcbi8qKlxuICogVHlwZSBvZiBydWxlIFRPIGNvbHVtbiB2YWx1ZVxuICovXG52YXIgVG9UeXBlO1xuKGZ1bmN0aW9uIChUb1R5cGUpIHtcbiAgICAvKipcbiAgICAgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxuICAgICAqL1xuICAgIFRvVHlwZVtUb1R5cGVbXCJZZWFyXCJdID0gMF0gPSBcIlllYXJcIjtcbiAgICAvKipcbiAgICAgKiBcIm1heFwiXG4gICAgICovXG4gICAgVG9UeXBlW1RvVHlwZVtcIk1heFwiXSA9IDFdID0gXCJNYXhcIjtcbn0pKFRvVHlwZSB8fCAoZXhwb3J0cy5Ub1R5cGUgPSBUb1R5cGUgPSB7fSkpO1xuLyoqXG4gKiBUeXBlIG9mIHJ1bGUgT04gY29sdW1uIHZhbHVlXG4gKi9cbnZhciBPblR5cGU7XG4oZnVuY3Rpb24gKE9uVHlwZSkge1xuICAgIC8qKlxuICAgICAqIERheS1vZi1tb250aCBudW1iZXJcbiAgICAgKi9cbiAgICBPblR5cGVbT25UeXBlW1wiRGF5TnVtXCJdID0gMF0gPSBcIkRheU51bVwiO1xuICAgIC8qKlxuICAgICAqIFwibGFzdFN1blwiIG9yIFwibGFzdFdlZFwiIGV0Y1xuICAgICAqL1xuICAgIE9uVHlwZVtPblR5cGVbXCJMYXN0WFwiXSA9IDFdID0gXCJMYXN0WFwiO1xuICAgIC8qKlxuICAgICAqIGUuZy4gXCJTdW4+PThcIlxuICAgICAqL1xuICAgIE9uVHlwZVtPblR5cGVbXCJHcmVxWFwiXSA9IDJdID0gXCJHcmVxWFwiO1xuICAgIC8qKlxuICAgICAqIGUuZy4gXCJTdW48PThcIlxuICAgICAqL1xuICAgIE9uVHlwZVtPblR5cGVbXCJMZXFYXCJdID0gM10gPSBcIkxlcVhcIjtcbn0pKE9uVHlwZSB8fCAoZXhwb3J0cy5PblR5cGUgPSBPblR5cGUgPSB7fSkpO1xudmFyIEF0VHlwZTtcbihmdW5jdGlvbiAoQXRUeXBlKSB7XG4gICAgLyoqXG4gICAgICogTG9jYWwgdGltZSAobm8gRFNUKVxuICAgICAqL1xuICAgIEF0VHlwZVtBdFR5cGVbXCJTdGFuZGFyZFwiXSA9IDBdID0gXCJTdGFuZGFyZFwiO1xuICAgIC8qKlxuICAgICAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcbiAgICAgKi9cbiAgICBBdFR5cGVbQXRUeXBlW1wiV2FsbFwiXSA9IDFdID0gXCJXYWxsXCI7XG4gICAgLyoqXG4gICAgICogVXRjIHRpbWVcbiAgICAgKi9cbiAgICBBdFR5cGVbQXRUeXBlW1wiVXRjXCJdID0gMl0gPSBcIlV0Y1wiO1xufSkoQXRUeXBlIHx8IChleHBvcnRzLkF0VHlwZSA9IEF0VHlwZSA9IHt9KSk7XG4vKipcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKlxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcbiAqL1xudmFyIFJ1bGVJbmZvID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIGZyb21cbiAgICAgKiBAcGFyYW0gdG9UeXBlXG4gICAgICogQHBhcmFtIHRvWWVhclxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogQHBhcmFtIGluTW9udGhcbiAgICAgKiBAcGFyYW0gb25UeXBlXG4gICAgICogQHBhcmFtIG9uRGF5XG4gICAgICogQHBhcmFtIG9uV2Vla0RheVxuICAgICAqIEBwYXJhbSBhdEhvdXJcbiAgICAgKiBAcGFyYW0gYXRNaW51dGVcbiAgICAgKiBAcGFyYW0gYXRTZWNvbmRcbiAgICAgKiBAcGFyYW0gYXRUeXBlXG4gICAgICogQHBhcmFtIHNhdmVcbiAgICAgKiBAcGFyYW0gbGV0dGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgZnVuY3Rpb24gUnVsZUluZm8oXG4gICAgLyoqXG4gICAgICogRlJPTSBjb2x1bW4geWVhciBudW1iZXIuXG4gICAgICovXG4gICAgZnJvbSwgXG4gICAgLyoqXG4gICAgICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXG4gICAgICovXG4gICAgdG9UeXBlLCBcbiAgICAvKipcbiAgICAgKiBJZiBUTyBjb2x1bW4gaXMgYSB5ZWFyLCB0aGUgeWVhciBudW1iZXIuIElmIFRPIGNvbHVtbiBpcyBcIm9ubHlcIiwgdGhlIEZST00geWVhci5cbiAgICAgKi9cbiAgICB0b1llYXIsIFxuICAgIC8qKlxuICAgICAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcbiAgICAgKi9cbiAgICB0eXBlLCBcbiAgICAvKipcbiAgICAgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcbiAgICAgKi9cbiAgICBpbk1vbnRoLCBcbiAgICAvKipcbiAgICAgKiBPTiBjb2x1bW4gdHlwZVxuICAgICAqL1xuICAgIG9uVHlwZSwgXG4gICAgLyoqXG4gICAgICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcbiAgICAgKi9cbiAgICBvbkRheSwgXG4gICAgLyoqXG4gICAgICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XG4gICAgICovXG4gICAgb25XZWVrRGF5LCBcbiAgICAvKipcbiAgICAgKiBBVCBjb2x1bW4gaG91clxuICAgICAqL1xuICAgIGF0SG91ciwgXG4gICAgLyoqXG4gICAgICogQVQgY29sdW1uIG1pbnV0ZVxuICAgICAqL1xuICAgIGF0TWludXRlLCBcbiAgICAvKipcbiAgICAgKiBBVCBjb2x1bW4gc2Vjb25kXG4gICAgICovXG4gICAgYXRTZWNvbmQsIFxuICAgIC8qKlxuICAgICAqIEFUIGNvbHVtbiB0eXBlXG4gICAgICovXG4gICAgYXRUeXBlLCBcbiAgICAvKipcbiAgICAgKiBEU1Qgb2Zmc2V0IGZyb20gbG9jYWwgc3RhbmRhcmQgdGltZSAoTk9UIGZyb20gVVRDISlcbiAgICAgKi9cbiAgICBzYXZlLCBcbiAgICAvKipcbiAgICAgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXG4gICAgICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXG4gICAgICovXG4gICAgbGV0dGVyKSB7XG4gICAgICAgIHRoaXMuZnJvbSA9IGZyb207XG4gICAgICAgIHRoaXMudG9UeXBlID0gdG9UeXBlO1xuICAgICAgICB0aGlzLnRvWWVhciA9IHRvWWVhcjtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5pbk1vbnRoID0gaW5Nb250aDtcbiAgICAgICAgdGhpcy5vblR5cGUgPSBvblR5cGU7XG4gICAgICAgIHRoaXMub25EYXkgPSBvbkRheTtcbiAgICAgICAgdGhpcy5vbldlZWtEYXkgPSBvbldlZWtEYXk7XG4gICAgICAgIHRoaXMuYXRIb3VyID0gYXRIb3VyO1xuICAgICAgICB0aGlzLmF0TWludXRlID0gYXRNaW51dGU7XG4gICAgICAgIHRoaXMuYXRTZWNvbmQgPSBhdFNlY29uZDtcbiAgICAgICAgdGhpcy5hdFR5cGUgPSBhdFR5cGU7XG4gICAgICAgIHRoaXMuc2F2ZSA9IHNhdmU7XG4gICAgICAgIHRoaXMubGV0dGVyID0gbGV0dGVyO1xuICAgICAgICBpZiAodGhpcy5zYXZlKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmFwcGxpY2FibGUgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgICBpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGhpcy50b1R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlIFRvVHlwZS5ZZWFyOiByZXR1cm4gKHllYXIgPD0gdGhpcy50b1llYXIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cbiAgICAgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGlzIHJ1bGUgZGVwZW5kcyBvbiBhIHdlZWtkYXkgYW5kIHRoZSB3ZWVrZGF5IGluIHF1ZXN0aW9uIGRvZXNuJ3QgZXhpc3RcbiAgICAgKi9cbiAgICBSdWxlSW5mby5wcm90b3R5cGUuZWZmZWN0aXZlTGVzcyA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5mcm9tIDwgb3RoZXIuZnJvbSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA+IG90aGVyLmluTW9udGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkgPCBvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNvcnQgY29tcGFyaXNvblxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgaW50ZXJuYWwgc3RydWN0dXJlIG9mIHRoZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICBpZiAodGhpcy5mcm9tICE9PSBvdGhlci5mcm9tKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCAhPT0gb3RoZXIuaW5Nb250aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkuZXF1YWxzKG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHllYXItcmVsYXRpdmUgZGF0ZSB0aGF0IHRoZSBydWxlIHRha2VzIGVmZmVjdC4gRGVwZW5kaW5nIG9uIHRoZSBydWxlIHRoaXMgY2FuIGJlIGEgVVRDIHRpbWUsIGEgd2FsbCBjbG9jayB0aW1lLCBvciBhXG4gICAgICogdGltZSBpbiBzdGFuZGFyZCBvZmZzZXQgKGkuZS4geW91IHN0aWxsIG5lZWQgdG8gY29tcGVuc2F0ZSBmb3IgdGhpcy5hdFR5cGUpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEFwcGxpY2FibGUgaWYgdGhpcyBydWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIHRoZSBnaXZlbiB5ZWFyXG4gICAgICovXG4gICAgUnVsZUluZm8ucHJvdG90eXBlLmVmZmVjdGl2ZURhdGUgPSBmdW5jdGlvbiAoeWVhcikge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcInRpbWV6b25lY29tcGxldGUuTm90QXBwbGljYWJsZVwiLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gJWRcIiwgeWVhcik7XG4gICAgICAgIC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxuICAgICAgICB2YXIgeSA9IHllYXI7XG4gICAgICAgIHZhciBtID0gdGhpcy5pbk1vbnRoO1xuICAgICAgICB2YXIgZCA9IDA7XG4gICAgICAgIC8vIGNhbGN1bGF0ZSBkYXlcbiAgICAgICAgc3dpdGNoICh0aGlzLm9uVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBPblR5cGUuRGF5TnVtOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9IHRoaXMub25EYXk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHksIG0sIHRoaXMub25EYXksIHRoaXMub25XZWVrRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiTm90Rm91bmRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcHIgU3VuPj0yNyBhY3R1YWxseSBtZWFucyBhbnkgc3VuZGF5IGFmdGVyIEFwcmlsIDI3LCBpLmUuIGl0IGRvZXMgbm90IGhhdmUgdG8gYmUgaW4gQXByaWwuIFRyeSBuZXh0IG1vbnRoLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtICsgMSA8PSAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gbSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHkgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkID0gYmFzaWNzLmZpcnN0V2Vla0RheU9mTW9udGgoeSwgbSwgdGhpcy5vbldlZWtEYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGVxWDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHksIG0sIHRoaXMub25EYXksIHRoaXMub25XZWVrRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiTm90Rm91bmRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSA9IG0gLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSA9IDEyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0geSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3MubGFzdFdlZWtEYXlPZk1vbnRoKHksIG0sIHRoaXMub25XZWVrRGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxhc3RYOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeSwgbSwgdGhpcy5vbldlZWtEYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyh5LCBtLCBkLCB0aGlzLmF0SG91ciwgdGhpcy5hdE1pbnV0ZSwgdGhpcy5hdFNlY29uZCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFZmZlY3RpdmUgZGF0ZSBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXIsIGluIGEgc3BlY2lmaWMgdGltZSB6b25lXG4gICAgICogQHBhcmFtIHllYXJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXQgdGhlIHN0YW5kYXJkIG9mZnNldCBmcm9tIFVUIG9mIHRoZSB0aW1lIHpvbmVcbiAgICAgKiBAcGFyYW0gZHN0T2Zmc2V0IHRoZSBEU1Qgb2Zmc2V0IGJlZm9yZSB0aGUgcnVsZVxuICAgICAqL1xuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVEYXRlVXRjID0gZnVuY3Rpb24gKHllYXIsIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmVmZmVjdGl2ZURhdGUoeWVhcik7XG4gICAgICAgIHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLlV0YzogcmV0dXJuIGQ7XG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDoge1xuICAgICAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aG91dCBEU1RcbiAgICAgICAgICAgICAgICB2YXIgbWlsbGlzID0gZC51bml4TWlsbGlzO1xuICAgICAgICAgICAgICAgIG1pbGxpcyAtPSBzdGFuZGFyZE9mZnNldC5taWxsaXNlY29uZHMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLldhbGw6IHtcbiAgICAgICAgICAgICAgICAvLyB0cmFuc2l0aW9uIHRpbWUgaXMgaW4gem9uZSBsb2NhbCB0aW1lIHdpdGggRFNUXG4gICAgICAgICAgICAgICAgdmFyIG1pbGxpcyA9IGQudW5peE1pbGxpcztcbiAgICAgICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGRzdE9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICBtaWxsaXMgLT0gZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFJ1bGVJbmZvO1xufSgpKTtcbmV4cG9ydHMuUnVsZUluZm8gPSBSdWxlSW5mbztcbi8qKlxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcbiAqL1xudmFyIFJ1bGVUeXBlO1xuKGZ1bmN0aW9uIChSdWxlVHlwZSkge1xuICAgIC8qKlxuICAgICAqIE5vIHJ1bGUgYXBwbGllc1xuICAgICAqL1xuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gICAgLyoqXG4gICAgICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XG4gICAgICovXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJPZmZzZXRcIl0gPSAxXSA9IFwiT2Zmc2V0XCI7XG4gICAgLyoqXG4gICAgICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXG4gICAgICovXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJSdWxlTmFtZVwiXSA9IDJdID0gXCJSdWxlTmFtZVwiO1xufSkoUnVsZVR5cGUgfHwgKGV4cG9ydHMuUnVsZVR5cGUgPSBSdWxlVHlwZSA9IHt9KSk7XG4vKipcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKlxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcbiAqIEZpcnN0LCBhbmQgc29tZXdoYXQgdHJpdmlhbGx5LCB3aGVyZWFzIFJ1bGVzIGFyZSBjb25zaWRlcmVkIHRvIGNvbnRhaW4gb25lIG9yIG1vcmUgcmVjb3JkcywgYSBab25lIGlzIGNvbnNpZGVyZWQgdG9cbiAqIGJlIGEgc2luZ2xlIHJlY29yZCB3aXRoIHplcm8gb3IgbW9yZSBjb250aW51YXRpb24gbGluZXMuIFRodXMsIHRoZSBrZXl3b3JkLCDigJxab25lLOKAnSBhbmQgdGhlIHpvbmUgbmFtZSBhcmUgbm90IHJlcGVhdGVkLlxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxuICogU2Vjb25kLCBhbmQgbW9yZSBmdW5kYW1lbnRhbGx5LCBlYWNoIGxpbmUgb2YgYSBab25lIHJlcHJlc2VudHMgYSBzdGVhZHkgc3RhdGUsIG5vdCBhIHRyYW5zaXRpb24gYmV0d2VlbiBzdGF0ZXMuXG4gKiBUaGUgc3RhdGUgZXhpc3RzIGZyb20gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIHByZXZpb3VzIGxpbmXigJlzIFtVTlRJTF0gY29sdW1uIHVwIHRvIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBjdXJyZW50IGxpbmXigJlzXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXG4gKiBXaGVyZSB0aGF0IHdvdWxkIGJlIGFtYmlndW91cyBiZWNhdXNlIHdl4oCZcmUgc2V0dGluZyBvdXIgY2xvY2tzIGJhY2ssIHRoZSBbVU5USUxdIGNvbHVtbiBzcGVjaWZpZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGluc3RhbnQuXG4gKiBUaGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSBsYXN0IGxpbmUsIHRoZSBvbmUgd2l0aG91dCBhbnl0aGluZyBpbiB0aGUgW1VOVElMXSBjb2x1bW4sIGNvbnRpbnVlcyB0byB0aGUgcHJlc2VudC5cbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcbiAqIHRoYXQsIGl0IGhhcyBubyBiZWdpbm5pbmcuIDgtKSBGb3Igc29tZSBwbGFjZXMgbmVhciB0aGUgSW50ZXJuYXRpb25hbCBEYXRlIExpbmUsIHRoZSBmaXJzdCB0d28gbGluZXMgd2lsbCBzaG93IHNvbGFyIHRpbWVzIGRpZmZlcmluZyBieVxuICogMjQgaG91cnM7IHRoaXMgY29ycmVzcG9uZHMgdG8gYSBtb3ZlbWVudCBvZiB0aGUgRGF0ZSBMaW5lLiBGb3IgZXhhbXBsZTpcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cbiAqIFpvbmUgQW1lcmljYS9KdW5lYXVcdCAxNTowMjoxOSAtXHRMTVRcdDE4NjcgT2N0IDE4XG4gKiBcdFx0XHQgLTg6NTc6NDEgLVx0TE1UXHQuLi5cbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXG4gKiBBbGFza2Egd2FzIHRoZW4gMjQgaG91cnMgZWFybGllciB0aGFuIGl0IGhhZCBiZWVuLiA8YXNpZGU+KDYgT2N0b2JlciBpbiB0aGUgSnVsaWFuIGNhbGVuZGFyLCB3aGljaCBSdXNzaWEgd2FzIHN0aWxsIHVzaW5nIHRoZW4gZm9yXG4gKiByZWxpZ2lvdXMgcmVhc29ucywgd2FzIGZvbGxvd2VkIGJ5IGEgc2Vjb25kIGluc3RhbmNlIG9mIHRoZSBzYW1lIGRheSB3aXRoIGEgZGlmZmVyZW50IG5hbWUsIDE4IE9jdG9iZXIgaW4gdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxuICogVGhlIGFiYnJldmlhdGlvbiwg4oCcTE1ULOKAnSBzdGFuZHMgZm9yIOKAnGxvY2FsIG1lYW4gdGltZSzigJ0gd2hpY2ggaXMgYW4gaW52ZW50aW9uIG9mIHRoZSB0eiBkYXRhYmFzZSBhbmQgd2FzIHByb2JhYmx5IG5ldmVyIGFjdHVhbGx5XG4gKiB1c2VkIGR1cmluZyB0aGUgcGVyaW9kLiBGdXJ0aGVybW9yZSwgdGhlIHZhbHVlIGlzIGFsbW9zdCBjZXJ0YWlubHkgd3JvbmcgZXhjZXB0IGluIHRoZSBhcmNoZXR5cGFsIHBsYWNlIGFmdGVyIHdoaWNoIHRoZSB6b25lIGlzIG5hbWVkLlxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxuICovXG52YXIgWm9uZUluZm8gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gZ210b2ZmXG4gICAgICogQHBhcmFtIHJ1bGVUeXBlXG4gICAgICogQHBhcmFtIHJ1bGVPZmZzZXRcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcbiAgICAgKiBAcGFyYW0gZm9ybWF0XG4gICAgICogQHBhcmFtIHVudGlsXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgZnVuY3Rpb24gWm9uZUluZm8oXG4gICAgLyoqXG4gICAgICogR01UIG9mZnNldCBpbiBmcmFjdGlvbmFsIG1pbnV0ZXMsIFBPU0lUSVZFIHRvIFVUQyAobm90ZSBKYXZhU2NyaXB0LkRhdGUgZ2l2ZXMgb2Zmc2V0c1xuICAgICAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxuICAgICAqIGl0IGlzIG9uZSBob3VyIGFoZWFkIG9mIFVUQ1xuICAgICAqL1xuICAgIGdtdG9mZiwgXG4gICAgLyoqXG4gICAgICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxuICAgICAqIEEgaHlwaGVuLCBhIGtpbmQgb2YgbnVsbCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBoYXZlIG5vdCBzZXQgb3VyIGNsb2NrcyBhaGVhZCBvZiBzdGFuZGFyZCB0aW1lLlxuICAgICAqIEFuIGFtb3VudCBvZiB0aW1lICh1c3VhbGx5IGJ1dCBub3QgbmVjZXNzYXJpbHkg4oCcMTowMOKAnSBtZWFuaW5nIG9uZSBob3VyKSBtZWFucyB0aGF0IHdlIGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQgYnkgdGhhdCBhbW91bnQuXG4gICAgICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXG4gICAgICogdGhlIG5hbWUgb2Ygd2hpY2ggaXMgdGhlIGdpdmVuIGFscGhhYmV0aWMgc3RyaW5nLlxuICAgICAqL1xuICAgIHJ1bGVUeXBlLCBcbiAgICAvKipcbiAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcbiAgICAgKi9cbiAgICBydWxlT2Zmc2V0LCBcbiAgICAvKipcbiAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYSBydWxlIG5hbWUsIHRoaXMgaXMgdGhlIHJ1bGUgbmFtZVxuICAgICAqL1xuICAgIHJ1bGVOYW1lLCBcbiAgICAvKipcbiAgICAgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxuICAgICAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxuICAgICAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cbiAgICAgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXG4gICAgICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXG4gICAgICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxuICAgICAqL1xuICAgIGZvcm1hdCwgXG4gICAgLyoqXG4gICAgICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xuICAgICAqIGFuZCBleGNsdWRpbmcgdGhpcyB0aW1lc3RhbXAuXG4gICAgICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSB1bmRlZmluZWQgKGZvciB0aGUgZmlyc3QgcnVsZSlcbiAgICAgKi9cbiAgICB1bnRpbCkge1xuICAgICAgICB0aGlzLmdtdG9mZiA9IGdtdG9mZjtcbiAgICAgICAgdGhpcy5ydWxlVHlwZSA9IHJ1bGVUeXBlO1xuICAgICAgICB0aGlzLnJ1bGVPZmZzZXQgPSBydWxlT2Zmc2V0O1xuICAgICAgICB0aGlzLnJ1bGVOYW1lID0gcnVsZU5hbWU7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0O1xuICAgICAgICB0aGlzLnVudGlsID0gdW50aWw7XG4gICAgICAgIGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcbiAgICAgICAgICAgIHRoaXMucnVsZU9mZnNldCA9IHRoaXMucnVsZU9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gWm9uZUluZm87XG59KCkpO1xuZXhwb3J0cy5ab25lSW5mbyA9IFpvbmVJbmZvO1xudmFyIFR6TW9udGhOYW1lcztcbihmdW5jdGlvbiAoVHpNb250aE5hbWVzKSB7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkphblwiXSA9IDFdID0gXCJKYW5cIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiRmViXCJdID0gMl0gPSBcIkZlYlwiO1xuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXJcIl0gPSAzXSA9IFwiTWFyXCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkFwclwiXSA9IDRdID0gXCJBcHJcIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTWF5XCJdID0gNV0gPSBcIk1heVwiO1xuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJKdW5cIl0gPSA2XSA9IFwiSnVuXCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkp1bFwiXSA9IDddID0gXCJKdWxcIjtcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiQXVnXCJdID0gOF0gPSBcIkF1Z1wiO1xuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJTZXBcIl0gPSA5XSA9IFwiU2VwXCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk9jdFwiXSA9IDEwXSA9IFwiT2N0XCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk5vdlwiXSA9IDExXSA9IFwiTm92XCI7XG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkRlY1wiXSA9IDEyXSA9IFwiRGVjXCI7XG59KShUek1vbnRoTmFtZXMgfHwgKFR6TW9udGhOYW1lcyA9IHt9KSk7XG4vKipcbiAqIFR1cm5zIGEgbW9udGggbmFtZSBmcm9tIHRoZSBUWiBkYXRhYmFzZSBpbnRvIGEgbnVtYmVyIDEtMTJcbiAqIEBwYXJhbSBuYW1lXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCBtb250aCBuYW1lXG4gKi9cbmZ1bmN0aW9uIG1vbnRoTmFtZVRvTnVtYmVyKG5hbWUpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSAxMjsgKytpKSB7XG4gICAgICAgIGlmIChUek1vbnRoTmFtZXNbaV0gPT09IG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJJbnZhbGlkIG1vbnRoIG5hbWUgJyVzJ1wiLCBuYW1lKTtcbn1cbnZhciBUekRheU5hbWVzO1xuKGZ1bmN0aW9uIChUekRheU5hbWVzKSB7XG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU3VuXCJdID0gMF0gPSBcIlN1blwiO1xuICAgIFR6RGF5TmFtZXNbVHpEYXlOYW1lc1tcIk1vblwiXSA9IDFdID0gXCJNb25cIjtcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUdWVcIl0gPSAyXSA9IFwiVHVlXCI7XG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiV2VkXCJdID0gM10gPSBcIldlZFwiO1xuICAgIFR6RGF5TmFtZXNbVHpEYXlOYW1lc1tcIlRodVwiXSA9IDRdID0gXCJUaHVcIjtcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJGcmlcIl0gPSA1XSA9IFwiRnJpXCI7XG4gICAgVHpEYXlOYW1lc1tUekRheU5hbWVzW1wiU2F0XCJdID0gNl0gPSBcIlNhdFwiO1xufSkoVHpEYXlOYW1lcyB8fCAoVHpEYXlOYW1lcyA9IHt9KSk7XG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXG4gKiAxLCAtMSwgKzEsIDAxLCAxOjAwLCAxOjIzOjI1LjE0M1xuICogQHRocm93cyBub3RoaW5nXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcocykge1xuICAgIHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcbn1cbmV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGlzVmFsaWRPZmZzZXRTdHJpbmc7XG4vKipcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxuICovXG52YXIgVHJhbnNpdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBhdFxuICAgICAqIEBwYXJhbSBvZmZzZXRcbiAgICAgKiBAcGFyYW0gbGV0dGVyXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgZnVuY3Rpb24gVHJhbnNpdGlvbihcbiAgICAvKipcbiAgICAgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xuICAgICAqL1xuICAgIGF0LCBcbiAgICAvKipcbiAgICAgKiBOZXcgb2Zmc2V0ICh0eXBlIG9mIG9mZnNldCBkZXBlbmRzIG9uIHRoZSBmdW5jdGlvbilcbiAgICAgKi9cbiAgICBvZmZzZXQsIFxuICAgIC8qKlxuICAgICAqIE5ldyB0aW16b25lIGFiYnJldmlhdGlvbiBsZXR0ZXJcbiAgICAgKi9cbiAgICBsZXR0ZXIpIHtcbiAgICAgICAgdGhpcy5hdCA9IGF0O1xuICAgICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgdGhpcy5sZXR0ZXIgPSBsZXR0ZXI7XG4gICAgICAgIGlmICh0aGlzLm9mZnNldCkge1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gVHJhbnNpdGlvbjtcbn0oKSk7XG5leHBvcnRzLlRyYW5zaXRpb24gPSBUcmFuc2l0aW9uO1xuLyoqXG4gKiBPcHRpb24gZm9yIFR6RGF0YWJhc2Ujbm9ybWFsaXplTG9jYWwoKVxuICovXG52YXIgTm9ybWFsaXplT3B0aW9uO1xuKGZ1bmN0aW9uIChOb3JtYWxpemVPcHRpb24pIHtcbiAgICAvKipcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxuICAgICAqL1xuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJVcFwiXSA9IDBdID0gXCJVcFwiO1xuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgU1VCVFJBQ1RJTkcgdGhlIERTVCBvZmZzZXRcbiAgICAgKi9cbiAgICBOb3JtYWxpemVPcHRpb25bTm9ybWFsaXplT3B0aW9uW1wiRG93blwiXSA9IDFdID0gXCJEb3duXCI7XG59KShOb3JtYWxpemVPcHRpb24gfHwgKGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uID0gTm9ybWFsaXplT3B0aW9uID0ge30pKTtcbi8qKlxuICogVGhpcyBjbGFzcyBpcyBhIHdyYXBwZXIgYXJvdW5kIHRpbWUgem9uZSBkYXRhIEpTT04gb2JqZWN0IGZyb20gdGhlIHR6ZGF0YSBOUE0gbW9kdWxlLlxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cbiAqL1xudmFyIFR6RGF0YWJhc2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgLSBkbyBub3QgdXNlLCB0aGlzIGlzIGEgc2luZ2xldG9uIGNsYXNzLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpIGluc3RlYWRcbiAgICAgKiBAdGhyb3dzIEFscmVhZHlDcmVhdGVkIGlmIGFuIGluc3RhbmNlIGFscmVhZHkgZXhpc3RzXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYGRhdGFgIGlzIGVtcHR5IG9yIGludmFsaWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBUekRhdGFiYXNlKGRhdGEpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiB6b25lIGluZm8gY2FjaGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3pvbmVJbmZvQ2FjaGUgPSB7fTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3J1bGVJbmZvQ2FjaGUgPSB7fTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIHByZS1jYWxjdWxhdGVkIHRyYW5zaXRpb25zIHBlciB6b25lXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl96b25lVHJhbnNpdGlvbnNDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIHByZS1jYWxjdWxhdGVkIHRyYW5zaXRpb25zIHBlciBydWxlc2V0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ydWxlVHJhbnNpdGlvbnNDYWNoZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJBbHJlYWR5Q3JlYXRlZFwiLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGRhdGEubGVuZ3RoID4gMCwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIik7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IGRhdGFbMF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRhID0geyB6b25lczoge30sIHJ1bGVzOiB7fSB9O1xuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3Qua2V5cyhkLnJ1bGVzKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fZGF0YS5ydWxlc1trZXldID0gZC5ydWxlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSBPYmplY3Qua2V5cyhkLnpvbmVzKTsgX2IgPCBfYy5sZW5ndGg7IF9iKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfY1tfYl07XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fZGF0YS56b25lc1trZXldID0gZC56b25lc1trZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbWlubWF4ID0gdmFsaWRhdGVEYXRhKHRoaXMuX2RhdGEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAocmUtKSBpbml0aWFsaXplIHRpbWV6b25lY29tcGxldGUgd2l0aCB0aW1lIHpvbmUgZGF0YVxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGEgVFogZGF0YSBhcyBKU09OIG9iamVjdCAoZnJvbSBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcykuXG4gICAgICogICAgICAgICAgICAgSWYgbm90IGdpdmVuLCBUaW1lem9uZWNvbXBsZXRlIHdpbGwgc2VhcmNoIGZvciBpbnN0YWxsZWQgbW9kdWxlcy5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBgZGF0YWAgb3IgdGhlIGdsb2JhbCB0aW1lIHpvbmUgZGF0YSBpcyBpbnZhbGlkXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5pbml0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgVHpEYXRhYmFzZS5faW5zdGFuY2UgPSB1bmRlZmluZWQ7IC8vIG5lZWRlZCBmb3IgYXNzZXJ0IGluIGNvbnN0cnVjdG9yXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBkYXRhXzEgPSBbXTtcbiAgICAgICAgICAgIC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xuICAgICAgICAgICAgdmFyIGcgPSB2b2lkIDA7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGcgPSB3aW5kb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgZyA9IGdsb2JhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgZyA9IHNlbGY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3Qua2V5cyhnKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKFwidHpkYXRhXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGdba2V5XSA9PT0gXCJvYmplY3RcIiAmJiBnW2tleV0ucnVsZXMgJiYgZ1trZXldLnpvbmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZ1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgYXMgaW5zdGFsbGVkIE5QTSBtb2R1bGVzXG4gICAgICAgICAgICB2YXIgZmluZE5vZGVNb2R1bGVzID0gZnVuY3Rpb24gKHJlcXVpcmUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaXJzdCB0cnkgdHpkYXRhIHdoaWNoIGNvbnRhaW5zIGFsbCBkYXRhXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ekRhdGFOYW1lID0gXCJ0emRhdGFcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSByZXF1aXJlKHR6RGF0YU5hbWUpOyAvLyB1c2UgdmFyaWFibGUgdG8gYXZvaWQgYnJvd3NlcmlmeSBhY3RpbmcgdXBcbiAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gdHJ5IHN1YnNldHNcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZHVsZU5hbWVzID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYWZyaWNhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hbnRhcmN0aWNhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hc2lhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYmFja3dhcmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtZXRjZXRlcmFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWV1cm9wZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1wYWNpZmljbmV3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1zb3V0aGFtZXJpY2FcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXN5c3RlbXZcIlxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGVOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChtb2R1bGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhXzEucHVzaChkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm90aGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGRhdGFfMS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGFfMSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNpbmdsZSBpbnN0YW5jZSBvZiB0aGlzIGRhdGFiYXNlXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdGhlIGdsb2JhbCB0aW1lIHpvbmUgZGF0YSBpcyBpbnZhbGlkXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5pbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFUekRhdGFiYXNlLl9pbnN0YW5jZSkge1xuICAgICAgICAgICAgVHpEYXRhYmFzZS5pbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFR6RGF0YWJhc2UuX2luc3RhbmNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuem9uZU5hbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XG4gICAgICAgICAgICB0aGlzLl96b25lTmFtZXMuc29ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl96b25lTmFtZXM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXhpc3RzXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZXhpc3RzID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxuICAgICAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cbiAgICAgKlxuICAgICAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWluRHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHpvbmVOYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIHZhciBydWxlTmFtZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc18xID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfMVtfaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZU9mZnNldC5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lICYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCB0ZW1wXzEgPSB0ZW1wOyBfYSA8IHRlbXBfMS5sZW5ndGg7IF9hKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSB0ZW1wXzFbX2FdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LmNsb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHRoaXMuX21pbm1heC5taW5Ec3RTYXZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFtcIk5vdEZvdW5kLlJ1bGVcIiwgXCJBcmd1bWVudC5OXCJdKSkge1xuICAgICAgICAgICAgICAgIGUgPSAoMCwgZXJyb3JfMS5lcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cbiAgICAgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5tYXhEc3RTYXZlID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoem9uZU5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bGVOYW1lcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzIgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzIubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc18yW19pXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIHRlbXBfMiA9IHRlbXA7IF9hIDwgdGVtcF8yLmxlbmd0aDsgX2ErKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBfMltfYV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGR1cmF0aW9uXzEuRHVyYXRpb24uaG91cnMoMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1heERzdFNhdmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoKDAsIGVycm9yXzEuZXJyb3JJcykoZSwgW1wiTm90Rm91bmQuUnVsZVwiLCBcIkFyZ3VtZW50Lk5cIl0pKSB7XG4gICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuaGFzRHN0ID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5tYXhEc3RTYXZlKHpvbmVOYW1lKS5taWxsaXNlY29uZHMoKSAhPT0gMCk7XG4gICAgfTtcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5uZXh0RHN0Q2hhbmdlID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhKSB7XG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcbiAgICAgICAgdmFyIHpvbmUgPSB0aGlzLl9nZXRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUpO1xuICAgICAgICB2YXIgaXRlcmF0b3IgPSB6b25lLmZpbmRGaXJzdCgpO1xuICAgICAgICBpZiAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0YyA+IHV0Y1RpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXM7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICBpdGVyYXRvciA9IHpvbmUuZmluZE5leHQoaXRlcmF0b3IpO1xuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPiB1dGNUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV2ZW50dWFsbHkgbGlua3MgdG9cbiAgICAgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcbiAgICAgKiBcIlVUQ1wiLCBcIkdNVFwiLCBcIkV0Yy9HTVRcIiBldGMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuem9uZUlzVXRjID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xuICAgICAgICB2YXIgem9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcbiAgICAgICAgICAgICAgICAgICAgKyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xuICAgICAgICAgICAgem9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcbiAgICB9O1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm5vcm1hbGl6ZUxvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhLCBvcHQpIHtcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IE5vcm1hbGl6ZU9wdGlvbi5VcDsgfVxuICAgICAgICBpZiAodGhpcy5oYXNEc3Qoem9uZU5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcbiAgICAgICAgICAgIC8vIGxvY2FsIHRpbWVzIGJlaGF2ZSBsaWtlIHRoaXMgZHVyaW5nIERTVCBjaGFuZ2VzOlxuICAgICAgICAgICAgLy8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XG4gICAgICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxuICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDNcbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXG4gICAgICAgICAgICAvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcbiAgICAgICAgICAgIC8vIGdldCBhbGwgdHJhbnNpdGlvbnMgKG5vdGUgdGhpcyBpbmNsdWRlcyBmYWtlIHRyYW5zaXRpb24gcnVsZXMgZm9yIHpvbmUgb2Zmc2V0IGNoYW5nZXMpXG4gICAgICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB6b25lLnRyYW5zaXRpb25zSW5ZZWFycyhsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgbG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciArIDEpO1xuICAgICAgICAgICAgLy8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcbiAgICAgICAgICAgIHZhciBwcmV2ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgdHJhbnNpdGlvbnNfMSA9IHRyYW5zaXRpb25zOyBfaSA8IHRyYW5zaXRpb25zXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc18xW19pXTtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xuICAgICAgICAgICAgICAgIC8vIGZvcndhcmQgdHJhbnNpdGlvbj9cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhbEJlZm9yZSA9IHRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcyArIHByZXYubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhbEFmdGVyID0gdHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzICsgb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxUaW1lLnVuaXhNaWxsaXMgPj0gbG9jYWxCZWZvcmUgJiYgbG9jYWxUaW1lLnVuaXhNaWxsaXMgPCBsb2NhbEFmdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9yd2FyZENoYW5nZSA9IG9mZnNldC5zdWIocHJldik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub24tZXhpc3RpbmcgdGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhY3RvciA9IChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5VcCA/IDEgOiAtMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0TWlsbGlzID0gbG9jYWxUaW1lLnVuaXhNaWxsaXMgKyBmYWN0b3IgKiBmb3J3YXJkQ2hhbmdlLm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IHJlc3VsdE1pbGxpcyA6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHJlc3VsdE1pbGxpcykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXYgPSBvZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBubyBub24tZXhpc3RpbmcgdGltZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBhIDogYS5jbG9uZSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxuICAgICAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0ID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XG4gICAgICAgIHZhciB6b25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xuICAgICAgICByZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxuICAgICAqIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLlxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS50b3RhbE9mZnNldCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xuICAgICAgICB2YXIgdSA9IHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lO1xuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XG4gICAgICAgIHZhciBzdGF0ZSA9IHpvbmUuc3RhdGVBdCh1KTtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRzdE9mZnNldC5hZGQoc3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHRpbWUgem9uZSBydWxlIGFiYnJldmlhdGlvbiwgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxuICAgICAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XG4gICAgICogYW5kIHRoZXJlZm9yZSBkaWZmZXJlbnQgYWJicmV2aWF0aW9ucy4gVGhleSBhbHNvIGNoYW5nZSB3aXRoIERTVDogZS5nLiBDRVNUIG9yIENFVC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQyB1bml4IG1pbGxpc2Vjb25kc1xuICAgICAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cbiAgICAgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuYWJicmV2aWF0aW9uID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpIHtcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cbiAgICAgICAgdmFyIHUgPSB0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZTtcbiAgICAgICAgdmFyIHpvbmUgPSB0aGlzLl9nZXRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUpO1xuICAgICAgICBpZiAoZHN0RGVwZW5kZW50KSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB6b25lLnN0YXRlQXQodSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUuYWJicmV2aWF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGxhc3ROb25Ec3QgPSB6b25lLmluaXRpYWxTdGF0ZS5kc3RPZmZzZXQubWlsbGlzZWNvbmRzKCkgPT09IDAgPyB6b25lLmluaXRpYWxTdGF0ZS5hYmJyZXZpYXRpb24gOiBcIlwiO1xuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gem9uZS5maW5kRmlyc3QoKTtcbiAgICAgICAgICAgIGlmICgoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxhc3ROb25Ec3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmFiYnJldmlhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjIDw9IHUpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IHpvbmUuZmluZE5leHQoaXRlcmF0b3IpO1xuICAgICAgICAgICAgICAgIGlmICgoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0Tm9uRHN0ID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5hYmJyZXZpYXRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxhc3ROb25Ec3Q7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGV4Y2x1ZGluZyBEU1QsIGF0XG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cbiAgICAgKlxuICAgICAqIElmIHRoZSBsb2NhbCB0aW1lc3RhbXAgZXhpc3RzIHR3aWNlIChhcyBjYW4gb2NjdXIgdmVyeSByYXJlbHkgZHVlIHRvIHpvbmUgY2hhbmdlcylcbiAgICAgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcbiAgICAgKiBAcGFyYW0gbG9jYWxUaW1lXHRUaW1lc3RhbXAgaW4gdGltZSB6b25lIHRpbWVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lTmFtZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcbiAgICAgICAgdmFyIHVuaXhNaWxsaXMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IGxvY2FsVGltZSA6IGxvY2FsVGltZS51bml4TWlsbGlzKTtcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfMyA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfMy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc18zW19pXTtcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsICsgem9uZUluZm8uZ210b2ZmLm1pbGxpc2Vjb25kcygpID4gdW5peE1pbGxpcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJObyB6b25lIGluZm8gZm91bmRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHRvdGFsIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGluY2x1ZGluZyBEU1QsIGF0XG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXG4gICAgICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxuICAgICAqIG5hbWVseSBkdXJpbmcgYSBiYWNrd2FyZCBEU1QgY2hhbmdlLiBUaGlzIHJldHVybnMgdGhlIEZJUlNUIHN1Y2ggb2Zmc2V0LlxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZU5hbWUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYW4gZXJyb3IgaXMgZGlzY292ZXJlZCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUudG90YWxPZmZzZXRMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgbG9jYWxUaW1lKSB7XG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lKSA6IGxvY2FsVGltZSk7XG4gICAgICAgIHZhciBub3JtYWxpemVkVG0gPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCB0cyk7XG4gICAgICAgIC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxuICAgICAgICAvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgMyAgPC0tIG5vdGUgdGltZSBnb2luZyBCQUNLV0FSRFxuICAgICAgICAvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXG4gICAgICAgIC8vIGFuZCByZXR1cm4gdGhlIGZpcnN0IG9mZnNldCB0aGF0IG1hdGNoZXNcbiAgICAgICAgdmFyIHpvbmUgPSB0aGlzLl9nZXRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUpO1xuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB6b25lLnRyYW5zaXRpb25zSW5ZZWFycyhub3JtYWxpemVkVG0uY29tcG9uZW50cy55ZWFyIC0gMSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciArIDIpO1xuICAgICAgICB2YXIgcHJldjtcbiAgICAgICAgdmFyIHByZXZQcmV2O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHRyYW5zaXRpb25zXzIgPSB0cmFuc2l0aW9uczsgX2kgPCB0cmFuc2l0aW9uc18yLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc18yW19pXTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5hZGQodHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldCk7XG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzICsgb2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZQcmV2ID0gcHJldjtcbiAgICAgICAgICAgIHByZXYgPSB0cmFuc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcbiAgICAgICAgICAgIHZhciBwcmV2T2Zmc2V0ID0gcHJldi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHByZXYubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xuICAgICAgICAgICAgdmFyIHByZXZQcmV2T2Zmc2V0ID0gcHJldlByZXYgPyBwcmV2UHJldi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHByZXZQcmV2Lm5ld1N0YXRlLnN0YW5kYXJkT2Zmc2V0KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChwcmV2UHJldiAmJiBwcmV2UHJldk9mZnNldCAhPT0gdW5kZWZpbmVkICYmIHByZXZQcmV2T2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXZPZmZzZXQpKSB7XG4gICAgICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlXG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSBwcmV2UHJldk9mZnNldC5zdWIocHJldk9mZnNldCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzID49IHByZXYuYXRVdGMudW5peE1pbGxpcyArIHByZXZPZmZzZXQubWlsbGlzZWNvbmRzKClcbiAgICAgICAgICAgICAgICAgICAgJiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0VXRjLnVuaXhNaWxsaXMgKyBwcmV2T2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aXRoaW4gZHVwbGljYXRlIHJhbmdlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2UHJldk9mZnNldC5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXZPZmZzZXQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldk9mZnNldC5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gem9uZS5zdGF0ZUF0KG5vcm1hbGl6ZWRUbSk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUuZHN0T2Zmc2V0LmFkZChzdGF0ZS5zdGFuZGFyZE9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIERFUFJFQ0FURUQgYmVjYXVzZSBEU1Qgb2Zmc2V0IGRlcGVuZHMgb24gdGhlIHpvbmUgdG9vLCBub3QganVzdCBvbiB0aGUgcnVsZXNldFxuICAgICAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lc3RhbXBcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5SdWxlIGlmIHJ1bGVOYW1lIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmRzdE9mZnNldEZvclJ1bGUgPSBmdW5jdGlvbiAocnVsZU5hbWUsIHV0Y1RpbWUsIHN0YW5kYXJkT2Zmc2V0KSB7XG4gICAgICAgIHZhciB0cyA9ICh0eXBlb2YgdXRjVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHV0Y1RpbWUpIDogdXRjVGltZSk7XG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWUsIHRzLmNvbXBvbmVudHMueWVhciAtIDEsIHRzLmNvbXBvbmVudHMueWVhciwgc3RhbmRhcmRPZmZzZXQpO1xuICAgICAgICAvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcbiAgICAgICAgdmFyIG9mZnNldDtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0LmNsb25lKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICghb2Zmc2V0KSB7XG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cbiAgICAgICAgICAgIG9mZnNldCA9IGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcygwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXG4gICAgICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlTmFtZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5sZXR0ZXJGb3JSdWxlID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCB1dGNUaW1lLCBzdGFuZGFyZE9mZnNldCkge1xuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xuICAgICAgICAvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0KTtcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXG4gICAgICAgIHZhciBsZXR0ZXI7XG4gICAgICAgIGZvciAodmFyIGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uLmF0IDw9IHRzLnVuaXhNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICBsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKCFsZXR0ZXIpIHtcbiAgICAgICAgICAgIC8vIGFwcGFyZW50bHkgbm8gbG9uZ2VyIERTVCwgYXMgZS5nLiBmb3IgQXNpYS9Ub2t5b1xuICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGV0dGVyO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogREVQUkVDQVRFRCBiZWNhdXNlIERTVCBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgem9uZSB0b28sIG5vdCBqdXN0IG9uIHRoZSBydWxlc2V0XG4gICAgICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcbiAgICAgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIFRyYW5zaXRpb25zLCB3aXRoIERTVCBvZmZzZXRzIChubyBzdGFuZGFyZCBvZmZzZXQgaW5jbHVkZWQpXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZyb21ZZWFyIGlmIGZyb21ZZWFyID4gdG9ZZWFyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZU5hbWUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYW4gZXJyb3IgaXMgZGlzY292ZXJlZCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyLCBzdGFuZGFyZE9mZnNldCkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZnJvbVllYXIgPD0gdG9ZZWFyLCBcIkFyZ3VtZW50LkZyb21ZZWFyXCIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XG4gICAgICAgIHZhciBydWxlcyA9IHRoaXMuX2dldFJ1bGVUcmFuc2l0aW9ucyhydWxlTmFtZSk7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgdmFyIHByZXZEc3QgPSAoMCwgZHVyYXRpb25fMS5ob3VycykoMCk7IC8vIHdyb25nLCBidXQgdGhhdCdzIHdoeSB0aGUgZnVuY3Rpb24gaXMgZGVwcmVjYXRlZFxuICAgICAgICB2YXIgaXRlcmF0b3IgPSBydWxlcy5maW5kRmlyc3QoKTtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXQueWVhciA8PSB0b1llYXIpIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci50cmFuc2l0aW9uLmF0LnllYXIgPj0gZnJvbVllYXIgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdC55ZWFyIDw9IHRvWWVhcikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgYXQ6IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCBwcmV2RHN0KS51bml4TWlsbGlzLFxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZEc3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldDtcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gcnVsZXMuZmluZE5leHQoaXRlcmF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJuIGJvdGggem9uZSBhbmQgcnVsZSBjaGFuZ2VzIGFzIHRvdGFsIChzdGQgKyBkc3QpIG9mZnNldHMuXG4gICAgICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm9uZSB3aXRoaW4gdGhlIHJhbmdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxuICAgICAqIEBwYXJhbSBmcm9tWWVhclx0Rmlyc3QgeWVhciB0byBpbmNsdWRlXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIGluY2x1ZGVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRnJvbVllYXIgaWYgZnJvbVllYXIgPiB0b1llYXJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lTmFtZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyA9IGZ1bmN0aW9uICh6b25lTmFtZSwgZnJvbVllYXIsIHRvWWVhcikge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZnJvbVllYXIgPD0gdG9ZZWFyLCBcIkFyZ3VtZW50LkZyb21ZZWFyXCIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICB2YXIgc3RhcnRTdGF0ZSA9IHpvbmUuc3RhdGVBdChuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IGZyb21ZZWFyLCBtb250aDogMSwgZGF5OiAxIH0pKTtcbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgYXQ6IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogZnJvbVllYXIgfSkudW5peE1pbGxpcyxcbiAgICAgICAgICAgIGxldHRlcjogc3RhcnRTdGF0ZS5sZXR0ZXIsXG4gICAgICAgICAgICBvZmZzZXQ6IHN0YXJ0U3RhdGUuZHN0T2Zmc2V0LmFkZChzdGFydFN0YXRlLnN0YW5kYXJkT2Zmc2V0KVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gem9uZS5maW5kRmlyc3QoKTtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA8PSB0b1llYXIpIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgPj0gZnJvbVllYXIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGF0OiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMsXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5hZGQoaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yID0gem9uZS5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmF0IC0gYi5hdDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHpvbmUgaW5mbyBmb3IgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuIFRocm93cyBpZiBub3QgZm91bmQuXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxuICAgICAqIEByZXR1cm5zXHRab25lSW5mbyBvYmplY3QuIERvIG5vdCBjaGFuZ2UsIHdlIGNhY2hlIHRoaXMgb2JqZWN0LlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzQgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzQubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfNFtfaV07XG4gICAgICAgICAgICBpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZUluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiTm90Rm91bmQuWm9uZVwiLCBcIm5vIHpvbmUgaW5mbyBmb3VuZCBmb3Igem9uZSAnJXMnXCIsIHpvbmVOYW1lKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgem9uZSByZWNvcmRzIGZvciBhIGdpdmVuIHpvbmUgbmFtZSBzb3J0ZWQgYnkgVU5USUwsIGFmdGVyXG4gICAgICogZm9sbG93aW5nIGFueSBsaW5rcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxuICAgICAqIEByZXR1cm4gQXJyYXkgb2Ygem9uZSBpbmZvcy4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIGRvZXMgbm90IGV4aXN0IG9yIGEgbGlua2VkIHpvbmUgZG9lcyBub3QgZXhpdFxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvcyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xuICAgICAgICAvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpLCBcIk5vdEZvdW5kLlpvbmVcIiwgXCJ6b25lIG5vdCBmb3VuZDogJyVzJ1wiLCB6b25lTmFtZSk7XG4gICAgICAgIC8vIFRha2UgZnJvbSBjYWNoZVxuICAgICAgICBpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xuICAgICAgICB2YXIgem9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiTm90Rm91bmQuWm9uZVwiLCBcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmluYWwgem9uZSBpbmZvIGZvdW5kXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUVudHJpZXNfMSA9IHpvbmVFbnRyaWVzOyBfaSA8IHpvbmVFbnRyaWVzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgem9uZUVudHJ5ID0gem9uZUVudHJpZXNfMVtfaV07XG4gICAgICAgICAgICB2YXIgcnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcbiAgICAgICAgICAgIHZhciB1bnRpbCA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcbiAgICAgICAgICAgIGlmIChpc05hTih1bnRpbCkpIHtcbiAgICAgICAgICAgICAgICB1bnRpbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLCBydWxlVHlwZSwgcnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbigpLCBydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUgPyB6b25lRW50cnlbMV0gOiBcIlwiLCB6b25lRW50cnlbMl0sIHVudGlsKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIC8vIHNvcnQgdW5kZWZpbmVkIGxhc3RcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhLnVudGlsICE9PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGEudW50aWwgPT09IHVuZGVmaW5lZCAmJiBiLnVudGlsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoYS51bnRpbCAtIGIudW50aWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBydWxlIHNldCB3aXRoIHRoZSBnaXZlbiBydWxlIG5hbWUsXG4gICAgICogc29ydGVkIGJ5IGZpcnN0IGVmZmVjdGl2ZSBkYXRlICh1bmNvbXBlbnNhdGVkIGZvciBcIndcIiBvciBcInNcIiBBdFRpbWUpXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgcnVsZSBzZXRcbiAgICAgKiBAcmV0dXJuIFJ1bGVJbmZvIGFycmF5LiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5SdWxlIGlmIHJ1bGUgbm90IGZvdW5kXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRSdWxlSW5mb3MgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcbiAgICAgICAgLy8gdmFsaWRhdGUgbmFtZSBCRUZPUkUgc2VhcmNoaW5nIGNhY2hlXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSwgXCJOb3RGb3VuZC5SdWxlXCIsIFwiUnVsZSBzZXQgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgLy8gcmV0dXJuIGZyb20gY2FjaGVcbiAgICAgICAgaWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIHZhciBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHJ1bGVTZXRfMSA9IHJ1bGVTZXQ7IF9pIDwgcnVsZVNldF8xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZVNldF8xW19pXTtcbiAgICAgICAgICAgICAgICB2YXIgZnJvbVllYXIgPSAocnVsZVswXSA9PT0gXCJOYU5cIiA/IC0xMDAwMCA6IHBhcnNlSW50KHJ1bGVbMF0sIDEwKSk7XG4gICAgICAgICAgICAgICAgdmFyIHRvVHlwZSA9IHRoaXMucGFyc2VUb1R5cGUocnVsZVsxXSk7XG4gICAgICAgICAgICAgICAgdmFyIHRvWWVhciA9ICh0b1R5cGUgPT09IFRvVHlwZS5NYXggPyAwIDogKHJ1bGVbMV0gPT09IFwib25seVwiID8gZnJvbVllYXIgOiBwYXJzZUludChydWxlWzFdLCAxMCkpKTtcbiAgICAgICAgICAgICAgICB2YXIgb25UeXBlID0gdGhpcy5wYXJzZU9uVHlwZShydWxlWzRdKTtcbiAgICAgICAgICAgICAgICB2YXIgb25EYXkgPSB0aGlzLnBhcnNlT25EYXkocnVsZVs0XSwgb25UeXBlKTtcbiAgICAgICAgICAgICAgICB2YXIgb25XZWVrRGF5ID0gdGhpcy5wYXJzZU9uV2Vla0RheShydWxlWzRdKTtcbiAgICAgICAgICAgICAgICB2YXIgbW9udGhOYW1lID0gcnVsZVszXTtcbiAgICAgICAgICAgICAgICB2YXIgbW9udGhOdW1iZXIgPSBtb250aE5hbWVUb051bWJlcihtb250aE5hbWUpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ldyBSdWxlSW5mbyhmcm9tWWVhciwgdG9UeXBlLCB0b1llYXIsIHJ1bGVbMl0sIG1vbnRoTnVtYmVyLCBvblR5cGUsIG9uRGF5LCBvbldlZWtEYXksIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxuICAgICAgICAgICAgICAgIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApLCA2MCksIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApLCA2MCksIHRoaXMucGFyc2VBdFR5cGUocnVsZVs1XVszXSksIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyhwYXJzZUludChydWxlWzZdLCAxMCkpLCBydWxlWzddID09PSBcIi1cIiA/IFwiXCIgOiBydWxlWzddKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhLmVmZmVjdGl2ZUxlc3MoYikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXSA9IHJlc3VsdDtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICgoMCwgZXJyb3JfMS5lcnJvcklzKShlLCBbXCJBcmd1bWVudC5Ub1wiLCBcIkFyZ3VtZW50Lk5cIiwgXCJBcmd1bWVudC5WYWx1ZVwiLCBcIkFyZ3VtZW50LkFtb3VudFwiXSkpIHtcbiAgICAgICAgICAgICAgICBlID0gKDAsIGVycm9yXzEuZXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlUnVsZVR5cGUgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgICAgICBpZiAocnVsZSA9PT0gXCItXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5Ob25lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5PZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUnVsZVR5cGUuUnVsZU5hbWU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVG8gZm9yIGludmFsaWQgVE9cbiAgICAgKi9cbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVRvVHlwZSA9IGZ1bmN0aW9uICh0bykge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuICAgICAgICBpZiAodG8gPT09IFwibWF4XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuTWF4O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuWWVhcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LlRvXCIsIFwiVE8gY29sdW1uIGluY29ycmVjdDogJXNcIiwgdG8pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQYXJzZSB0aGUgT04gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XG4gICAgICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VPblR5cGUgPSBmdW5jdGlvbiAob24pIHtcbiAgICAgICAgaWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MYXN0WDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIE9uVHlwZS5MZXFYO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvbi5pbmRleE9mKFwiPj1cIikgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkdyZXFYO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPblR5cGUuRGF5TnVtO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXG4gICAgICogQHRocm93cyBub3RoaW5nXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VPbkRheSA9IGZ1bmN0aW9uIChvbiwgb25UeXBlKSB7XG4gICAgICAgIHN3aXRjaCAob25UeXBlKSB7XG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRheS1vZi13ZWVrIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgU3VuZGF5IGlmIG5vdCBwcmVzZW50LlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25XZWVrRGF5ID0gZnVuY3Rpb24gKG9uKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICBpZiAob24uaW5kZXhPZihUekRheU5hbWVzW2ldKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNpY3NfMS5XZWVrRGF5LlN1bmRheTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUGFyc2UgdGhlIEFUIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlQXRUeXBlID0gZnVuY3Rpb24gKGF0KSB7XG4gICAgICAgIHN3aXRjaCAoYXQpIHtcbiAgICAgICAgICAgIGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XG4gICAgICAgICAgICBjYXNlIFwidVwiOiByZXR1cm4gQXRUeXBlLlV0YztcbiAgICAgICAgICAgIGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xuICAgICAgICAgICAgY2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XG4gICAgICAgICAgICBjYXNlIFwid1wiOiByZXR1cm4gQXRUeXBlLldhbGw7XG4gICAgICAgICAgICBjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcbiAgICAgICAgICAgIGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBdFR5cGUuV2FsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEdldCBwcmUtY2FsY3VsYXRlZCB6b25lIHRyYW5zaXRpb25zXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBkb2VzIG5vdCBleGlzdCBvciBhIGxpbmtlZCB6b25lIGRvZXMgbm90IGV4aXRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxuICAgICAqL1xuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLl9nZXRab25lVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3pvbmVUcmFuc2l0aW9uc0NhY2hlLmdldCh6b25lTmFtZSk7XG4gICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgQ2FjaGVkWm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lLCB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSksIHRoaXMuX2dldFJ1bGVUcmFuc2l0aW9uc0ZvclpvbmUoem9uZU5hbWUpKTtcbiAgICAgICAgICAgIHRoaXMuX3pvbmVUcmFuc2l0aW9uc0NhY2hlLnNldCh6b25lTmFtZSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogR2V0IHByZS1jYWxjdWxhdGVkIHJ1bGUgdHJhbnNpdGlvbnNcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuX2dldFJ1bGVUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uIChydWxlTmFtZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fcnVsZVRyYW5zaXRpb25zQ2FjaGUuZ2V0KHJ1bGVOYW1lKTtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBDYWNoZWRSdWxlVHJhbnNpdGlvbnModGhpcy5nZXRSdWxlSW5mb3MocnVsZU5hbWUpKTtcbiAgICAgICAgICAgIHRoaXMuX3J1bGVUcmFuc2l0aW9uc0NhY2hlLnNldChydWxlTmFtZSwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG1hcCBvZiBydWxlTmFtZS0+Q2FjaGVkUnVsZVRyYW5zaXRpb25zIGZvciBhbGwgcnVsZSBzZXRzIHRoYXQgYXJlIHJlZmVyZW5jZWQgYnkgYSB6b25lXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBkb2VzIG5vdCBleGlzdCBvciBhIGxpbmtlZCB6b25lIGRvZXMgbm90IGV4aXRcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlIG5vdCBmb3VuZFxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXG4gICAgICovXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuX2dldFJ1bGVUcmFuc2l0aW9uc0ZvclpvbmUgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBNYXAoKTtcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfNSA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfNS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc181W19pXTtcbiAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5oYXMoem9uZUluZm8ucnVsZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5zZXQoem9uZUluZm8ucnVsZU5hbWUsIHRoaXMuX2dldFJ1bGVUcmFuc2l0aW9ucyh6b25lSW5mby5ydWxlTmFtZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgcmV0dXJuIFR6RGF0YWJhc2U7XG59KCkpO1xuZXhwb3J0cy5UekRhdGFiYXNlID0gVHpEYXRhYmFzZTtcbi8qKlxuICogU2FuaXR5IGNoZWNrIG9uIGRhdGEuIFJldHVybnMgbWluL21heCB2YWx1ZXMuXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCBkYXRhXG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRGF0YShkYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwidGltZSB6b25lIGRhdGEgc2hvdWxkIGJlIGFuIG9iamVjdFwiKTtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ0aW1lIHpvbmUgZGF0YSBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggYSAncnVsZXMnIHByb3BlcnR5XCIpO1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIiksIFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcInRpbWUgem9uZSBkYXRhIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCBhICd6b25lcycgcHJvcGVydHlcIik7XG4gICAgLy8gdmFsaWRhdGUgem9uZXNcbiAgICBmb3IgKHZhciB6b25lTmFtZSBpbiBkYXRhLnpvbmVzKSB7XG4gICAgICAgIGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xuICAgICAgICAgICAgdmFyIHpvbmVBcnIgPSBkYXRhLnpvbmVzW3pvbmVOYW1lXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKHpvbmVBcnIpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgLy8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVBcnIpLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBmb3Igem9uZSBcXFwiJXNcXFwiIGxpbmtzIHRvIFxcXCIlc1xcXCIgYnV0IHRoYXQgZG9lc25cXCd0IGV4aXN0XCIsIHpvbmVOYW1lLCB6b25lQXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh6b25lQXJyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgZm9yIHpvbmUgXFxcIiVzXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiLCB6b25lTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB6b25lQXJyW2ldO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaGFzIGxlbmd0aCAhPSA0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzBdICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGdtdG9mZikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMV0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgc2Vjb25kIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMl0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGlzIG5vdCBhIHN0cmluZyBub3IgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzNdKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4R210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmID4gcmVzdWx0Lm1heEdtdE9mZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1pbkdtdE9mZiA9PT0gdW5kZWZpbmVkIHx8IGdtdG9mZiA8IHJlc3VsdC5taW5HbXRPZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5taW5HbXRPZmYgPSBnbXRvZmY7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gdmFsaWRhdGUgcnVsZXNcbiAgICBmb3IgKHZhciBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XG4gICAgICAgIGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuICAgICAgICAgICAgdmFyIHJ1bGVBcnIgPSBkYXRhLnJ1bGVzW3J1bGVOYW1lXTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGVBcnIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IGZvciBydWxlIFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZUFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZUFycltpXTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAocnVsZS5sZW5ndGggPCA4KSB7IC8vIG5vdGUgc29tZSBydWxlcyA+IDggZXhpc3RzIGJ1dCB0aGF0IHNlZW1zIHRvIGJlIGEgYnVnIGluIHR6IGZpbGUgcGFyc2luZ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcnVsZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKGogIT09IDUgJiYgdHlwZW9mIHJ1bGVbal0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdW1wiICsgai50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGEgc3RyaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAocnVsZVsxXSAhPT0gXCJvbmx5XCIgJiYgcnVsZVsxXSAhPT0gXCJtYXhcIiAmJiBpc05hTihwYXJzZUludChydWxlWzFdLCAxMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzRdIGlzIG5vdCBhIGtub3duIHR5cGUgb2YgZXhwcmVzc2lvblwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJ1bGVbNV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVszXSBpcyBub3QgZW1wdHksIGcsIHosIHMsIHcsIHUgb3IgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNhdmUgPSBwYXJzZUludChydWxlWzZdLCAxMCk7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHNhdmUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzYXZlICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWF4RHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPiByZXN1bHQubWF4RHN0U2F2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heERzdFNhdmUgPSBzYXZlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWluRHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIFJlYWR5LW1hZGUgc29ydGVkIHJ1bGUgdHJhbnNpdGlvbnMgKHVuY29tcGVuc2F0ZWQgZm9yIHN0ZG9mZnNldCwgYXMgcnVsZXMgYXJlIHVzZWQgYnkgbXVsdGlwbGUgem9uZXMgd2l0aCBkaWZmZXJlbnQgb2Zmc2V0cylcbiAqL1xudmFyIENhY2hlZFJ1bGVUcmFuc2l0aW9ucyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBydWxlSW5mb3NcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBDYWNoZWRSdWxlVHJhbnNpdGlvbnMocnVsZUluZm9zKSB7XG4gICAgICAgIC8vIGRldGVybWluZSBtYXhpbXVtIHllYXIgdG8gY2FsY3VsYXRlIHRyYW5zaXRpb25zIGZvclxuICAgICAgICB2YXIgbWF4WWVhcjtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBydWxlSW5mb3NfMSA9IHJ1bGVJbmZvczsgX2kgPCBydWxlSW5mb3NfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHJ1bGVJbmZvc18xW19pXTtcbiAgICAgICAgICAgIGlmIChydWxlSW5mby50b1R5cGUgPT09IFRvVHlwZS5ZZWFyKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1heFllYXIgPT09IHVuZGVmaW5lZCB8fCBydWxlSW5mby50b1llYXIgPiBtYXhZZWFyKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heFllYXIgPSBydWxlSW5mby50b1llYXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtYXhZZWFyID09PSB1bmRlZmluZWQgfHwgcnVsZUluZm8uZnJvbSA+IG1heFllYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4WWVhciA9IHJ1bGVJbmZvLmZyb207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhbGwgdHJhbnNpdGlvbnMgdW50aWwgJ21heCcgcnVsZXMgdGFrZSBlZmZlY3RcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2EgPSAwLCBydWxlSW5mb3NfMiA9IHJ1bGVJbmZvczsgX2EgPCBydWxlSW5mb3NfMi5sZW5ndGg7IF9hKyspIHtcbiAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHJ1bGVJbmZvc18yW19hXTtcbiAgICAgICAgICAgIHZhciBtaW4gPSBydWxlSW5mby5mcm9tO1xuICAgICAgICAgICAgdmFyIG1heCA9IHJ1bGVJbmZvLnRvVHlwZSA9PT0gVG9UeXBlLlllYXIgPyBydWxlSW5mby50b1llYXIgOiBtYXhZZWFyO1xuICAgICAgICAgICAgaWYgKG1heCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgeWVhciA9IG1pbjsgeWVhciA8PSBtYXg7ICsreWVhcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90cmFuc2l0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0OiBydWxlSW5mby5lZmZlY3RpdmVEYXRlKHllYXIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXRUeXBlOiBydWxlSW5mby5hdFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcnVsZUluZm8uc2F2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IHJ1bGVJbmZvLmxldHRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc29ydCB0cmFuc2l0aW9uc1xuICAgICAgICB0aGlzLl90cmFuc2l0aW9ucyA9IHRoaXMuX3RyYW5zaXRpb25zLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiAoYS5hdCA8IGIuYXQgPyAtMSA6XG4gICAgICAgICAgICAgICAgYS5hdCA+IGIuYXQgPyAxIDpcbiAgICAgICAgICAgICAgICAgICAgMCk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBzYXZlIHRoZSAnbWF4JyBydWxlcyBmb3IgdHJhbnNpdGlvbnMgYWZ0ZXIgdGhhdFxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlID0gcnVsZUluZm9zLmZpbHRlcihmdW5jdGlvbiAoaW5mbykgeyByZXR1cm4gaW5mby50b1R5cGUgPT09IFRvVHlwZS5NYXg7IH0pO1xuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlFZmZlY3RpdmUgPSBfX3NwcmVhZEFycmF5KFtdLCB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlLCB0cnVlKTtcbiAgICAgICAgLy8gc29ydCBmaW5hbCBydWxlcyBieSBGUk9NIGFuZCB0aGVuIGJ5IHllYXItcmVsYXRpdmUgZGF0ZVxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlID0gdGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICBpZiAoYS5mcm9tIDwgYi5mcm9tKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGEuZnJvbSA+IGIuZnJvbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFlID0gYS5lZmZlY3RpdmVEYXRlKGEuZnJvbSk7XG4gICAgICAgICAgICB2YXIgYmUgPSBiLmVmZmVjdGl2ZURhdGUoYi5mcm9tKTtcbiAgICAgICAgICAgIHJldHVybiAoYWUgPCBiZSA/IC0xIDpcbiAgICAgICAgICAgICAgICBhZSA+IGJlID8gMSA6XG4gICAgICAgICAgICAgICAgICAgIDApO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gc29ydCBmaW5hbCBydWxlcyBieSB5ZWFyLXJlbGF0aXZlIGRhdGVcbiAgICAgICAgdGhpcy5fZmluYWxSdWxlc0J5RWZmZWN0aXZlID0gdGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICB2YXIgYWUgPSBhLmVmZmVjdGl2ZURhdGUoYS5mcm9tKTtcbiAgICAgICAgICAgIHZhciBiZSA9IGIuZWZmZWN0aXZlRGF0ZShiLmZyb20pO1xuICAgICAgICAgICAgcmV0dXJuIChhZSA8IGJlID8gLTEgOlxuICAgICAgICAgICAgICAgIGFlID4gYmUgPyAxIDpcbiAgICAgICAgICAgICAgICAgICAgMCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2FjaGVkUnVsZVRyYW5zaXRpb25zLnByb3RvdHlwZSwgXCJmaW5hbFwiLCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgJ21heCcgdHlwZSBydWxlcyBhdCB0aGUgZW5kLCBzb3J0ZWQgYnkgeWVhci1yZWxhdGl2ZSBlZmZlY3RpdmUgZGF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmluYWxSdWxlc0J5RWZmZWN0aXZlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZmlyc3QgZXZlciB0cmFuc2l0aW9uIGFzIGRlZmluZWQgYnkgdGhlIHJ1bGUgc2V0XG4gICAgICovXG4gICAgQ2FjaGVkUnVsZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl90cmFuc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb25zWzBdO1xuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXG4gICAgICAgICAgICAgICAgaW5kZXg6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIHJ1bGUgPSB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlWzBdO1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgYXQ6IHJ1bGUuZWZmZWN0aXZlRGF0ZShydWxlLmZyb20pLFxuICAgICAgICAgICAgICAgIGF0VHlwZTogcnVsZS5hdFR5cGUsXG4gICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBydWxlLnNhdmUsXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogcnVsZS5sZXR0ZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXG4gICAgICAgICAgICAgICAgZmluYWw6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3I7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdHJhbnNpdGlvbiwgZ2l2ZW4gYW4gaXRlcmF0b3JcbiAgICAgKiBAcGFyYW0gcHJldiB0aGUgaXRlcmF0b3JcbiAgICAgKi9cbiAgICBDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKHByZXYpIHtcbiAgICAgICAgaWYgKCFwcmV2LmZpbmFsICYmIHByZXYuaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHByZXYuaW5kZXggPCB0aGlzLl90cmFuc2l0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0aGlzLl90cmFuc2l0aW9uc1twcmV2LmluZGV4ICsgMV07XG4gICAgICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogcHJldi5pbmRleCArIDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBmaW5kIG1pbmltdW0gYXBwbGljYWJsZSBmaW5hbCBydWxlIGFmdGVyIHRoZSBwcmV2IHRyYW5zaXRpb25cbiAgICAgICAgdmFyIGZvdW5kO1xuICAgICAgICB2YXIgZm91bmRFZmZlY3RpdmU7XG4gICAgICAgIGZvciAodmFyIHllYXIgPSBwcmV2LnRyYW5zaXRpb24uYXQueWVhcjsgeWVhciA8IHByZXYudHJhbnNpdGlvbi5hdC55ZWFyICsgMjsgKyt5ZWFyKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5fZmluYWxSdWxlc0J5RWZmZWN0aXZlOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBydWxlID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgIGlmIChydWxlLmFwcGxpY2FibGUoeWVhcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVmZmVjdGl2ZSA9IHJ1bGUuZWZmZWN0aXZlRGF0ZSh5ZWFyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVmZmVjdGl2ZSA+IHByZXYudHJhbnNpdGlvbi5hdCAmJiAoIWZvdW5kRWZmZWN0aXZlIHx8IGVmZmVjdGl2ZSA8IGZvdW5kRWZmZWN0aXZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBydWxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRFZmZlY3RpdmUgPSBlZmZlY3RpdmU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvdW5kICYmIGZvdW5kRWZmZWN0aXZlKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBhdDogZm91bmRFZmZlY3RpdmUsXG4gICAgICAgICAgICAgICAgYXRUeXBlOiBmb3VuZC5hdFR5cGUsXG4gICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBmb3VuZC5zYXZlLFxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IGZvdW5kLmxldHRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbixcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRGlydHkgZmluZCBmdW5jdGlvbiB0aGF0IG9ubHkgdGFrZXMgYSBzdGFuZGFyZCBvZmZzZXQgZnJvbSBVVEMgaW50byBhY2NvdW50XG4gICAgICogQHBhcmFtIGJlZm9yZVV0YyB0aW1lc3RhbXAgdG8gc2VhcmNoIGZvclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldCB6b25lIHN0YW5kYXJkIG9mZnNldCB0byBhcHBseVxuICAgICAqL1xuICAgIENhY2hlZFJ1bGVUcmFuc2l0aW9ucy5wcm90b3R5cGUuZmluZExhc3RMZXNzRXF1YWwgPSBmdW5jdGlvbiAoYmVmb3JlVXRjLCBzdGFuZGFyZE9mZnNldCkge1xuICAgICAgICB2YXIgcHJldlRyYW5zaXRpb247XG4gICAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuZmluZEZpcnN0KCk7XG4gICAgICAgIHZhciBlZmZlY3RpdmVVdGMgPSAoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24pID8gcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIHVuZGVmaW5lZCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBlZmZlY3RpdmVVdGMgJiYgZWZmZWN0aXZlVXRjIDw9IGJlZm9yZVV0Yykge1xuICAgICAgICAgICAgcHJldlRyYW5zaXRpb24gPSBpdGVyYXRvci50cmFuc2l0aW9uO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgICAgIGVmZmVjdGl2ZVV0YyA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPyBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgdW5kZWZpbmVkKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJldlRyYW5zaXRpb247XG4gICAgfTtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhZnRlclV0Y1xuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFxuICAgICAqIEBwYXJhbSBkc3RPZmZzZXRcbiAgICAgKi9cbiAgICBDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpcnN0VHJhbnNpdGlvbldpdGhvdXREc3RBZnRlciA9IGZ1bmN0aW9uIChhZnRlclV0Yywgc3RhbmRhcmRPZmZzZXQsIGRzdE9mZnNldCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIC8vIHRvZG8gaW5lZmZpY2llbnQgLSBvcHRpbWl6ZVxuICAgICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLmZpbmRGaXJzdCgpO1xuICAgICAgICB2YXIgZWZmZWN0aXZlVXRjID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA/IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGVmZmVjdGl2ZVV0YyAmJiAoISgoX2EgPSBpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm5ld1N0YXRlLmRzdE9mZnNldC56ZXJvKCkpIHx8IGVmZmVjdGl2ZVV0YyA8PSBhZnRlclV0YykpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gdGhpcy5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgICAgICBlZmZlY3RpdmVVdGMgPSAoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24pID8gcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbjtcbiAgICB9O1xuICAgIHJldHVybiBDYWNoZWRSdWxlVHJhbnNpdGlvbnM7XG59KCkpO1xuLyoqXG4gKiBSdWxlcyBkZXBlbmQgb24gcHJldmlvdXMgcnVsZXMsIGhlbmNlIHlvdSBjYW5ub3QgY2FsY3VsYXRlIERTVCB0cmFuc2l0aW9ucyB3aXRvdXQgc3RhcnRpbmcgYXQgdGhlIHN0YXJ0LlxuICogTmV4dCB0byB0aGF0LCB6b25lcyBzb21ldGltZXMgdHJhbnNpdGlvbiBpbnRvIHRoZSBtaWRkbGUgb2YgYSBydWxlIHNldC5cbiAqIER1ZSB0byB0aGlzLCB3ZSBtYWludGFpbiBhIGNhY2hlIG9mIHRyYW5zaXRpb25zIGZvciB6b25lc1xuICovXG52YXIgQ2FjaGVkWm9uZVRyYW5zaXRpb25zID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXG4gICAgICogQHBhcmFtIHpvbmVJbmZvc1xuICAgICAqIEBwYXJhbSBydWxlc1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlpvbmVJbmZvcyBpZiB6b25lSW5mb3MgaXMgZW1wdHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBDYWNoZWRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUsIHpvbmVJbmZvcywgcnVsZXMpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwidGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ab25lSW5mb3NcIiwgXCJ6b25lICclcycgd2l0aG91dCBpbmZvcm1hdGlvblwiLCB6b25lTmFtZSk7XG4gICAgICAgIHRoaXMuX2ZpbmFsWm9uZUluZm8gPSB6b25lSW5mb3Nbem9uZUluZm9zLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLl9pbml0aWFsU3RhdGUgPSB0aGlzLl9jYWxjSW5pdGlhbFN0YXRlKHpvbmVOYW1lLCB6b25lSW5mb3MsIHJ1bGVzKTtcbiAgICAgICAgX2EgPSB0aGlzLl9jYWxjVHJhbnNpdGlvbnMoem9uZU5hbWUsIHRoaXMuX2luaXRpYWxTdGF0ZSwgem9uZUluZm9zLCBydWxlcyksIHRoaXMuX3RyYW5zaXRpb25zID0gX2FbMF0sIHRoaXMuX2ZpbmFsUnVsZXMgPSBfYVsxXTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENhY2hlZFpvbmVUcmFuc2l0aW9ucy5wcm90b3R5cGUsIFwiaW5pdGlhbFN0YXRlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW5pdGlhbFN0YXRlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgZmlyc3QgdHJhbnNpdGlvbiwgaWYgaXQgZXhpc3RzXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl90cmFuc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMuX3RyYW5zaXRpb25zWzBdLFxuICAgICAgICAgICAgICAgIGluZGV4OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGaW5kIG5leHQgdHJhbnNpdGlvbiwgaWYgaXQgZXhpc3RzXG4gICAgICogQHBhcmFtIGl0ZXJhdG9yIHByZXZpb3VzIGl0ZXJhdG9yXG4gICAgICogQHJldHVybnMgdGhlIG5leHQgaXRlcmF0b3JcbiAgICAgKi9cbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmROZXh0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yKSB7XG4gICAgICAgIGlmICghaXRlcmF0b3IuZmluYWwpIHtcbiAgICAgICAgICAgIGlmIChpdGVyYXRvci5pbmRleCA8IHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLl90cmFuc2l0aW9uc1tpdGVyYXRvci5pbmRleCArIDFdLFxuICAgICAgICAgICAgICAgICAgICBpbmRleDogaXRlcmF0b3IuaW5kZXggKyAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZm91bmQ7XG4gICAgICAgIGZvciAodmFyIHkgPSBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXI7IHkgPCBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgKyAyOyArK3kpIHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9maW5hbFJ1bGVzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0VXRjOiBydWxlSW5mby5lZmZlY3RpdmVEYXRlVXRjKHksIGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQsIGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHRoaXMuX2ZpbmFsWm9uZUluZm8uZm9ybWF0LCBydWxlSW5mby5zYXZlLm5vblplcm8oKSwgcnVsZUluZm8ubGV0dGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IHJ1bGVJbmZvLmxldHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGVJbmZvLnNhdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXRVdGMgPiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZvdW5kIHx8IGZvdW5kLmF0VXRjID4gdHJhbnNpdGlvbi5hdFV0Yykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogZm91bmQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgZmluYWw6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHpvbmUgc3RhdGUgYXQgdGhlIGdpdmVuIFVUQyB0aW1lXG4gICAgICogQHBhcmFtIHV0Y1xuICAgICAqL1xuICAgIENhY2hlZFpvbmVUcmFuc2l0aW9ucy5wcm90b3R5cGUuc3RhdGVBdCA9IGZ1bmN0aW9uICh1dGMpIHtcbiAgICAgICAgdmFyIHByZXZTdGF0ZSA9IHRoaXMuX2luaXRpYWxTdGF0ZTtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPD0gdXRjKSB7XG4gICAgICAgICAgICBwcmV2U3RhdGUgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJldlN0YXRlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogVGhlIHRyYW5zaXRpb25zIGluIHllYXIgW3N0YXJ0LCBlbmQpXG4gICAgICogQHBhcmFtIHN0YXJ0IHN0YXJ0IHllYXIgKGluY2x1c2l2ZSlcbiAgICAgKiBAcGFyYW0gZW5kIGVuZCB5ZWFyIChleGNsdXNpdmUpXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS50cmFuc2l0aW9uc0luWWVhcnMgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAgICAgICAvLyBjaGVjayBpZiBzdGFydC0xIGlzIHdpdGhpbiB0aGUgaW5pdGlhbCB0cmFuc2l0aW9ucyBvciBub3QuIFdlIHVzZSBzdGFydC0xIGJlY2F1c2Ugd2UgdGFrZSBhbiBleHRyYSB5ZWFyIGluIHRoZSBlbHNlIGNsYXVzZSBiZWxvd1xuICAgICAgICB2YXIgZmluYWwgPSAodGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoID09PSAwIHx8IHRoaXMuX3RyYW5zaXRpb25zW3RoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCAtIDFdLmF0VXRjLnllYXIgPCBzdGFydCAtIDEpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGlmICghZmluYWwpIHtcbiAgICAgICAgICAgIC8vIHNpbXBseSBkbyBsaW5lYXIgc2VhcmNoXG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLmZpbmRGaXJzdCgpO1xuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA8IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgPj0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlcmF0b3IudHJhbnNpdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZXJhdG9yID0gdGhpcy5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnNXaXRoUnVsZXMgPSBbXTtcbiAgICAgICAgICAgIC8vIERvIHNvbWV0aGluZyBzbWFydDogZmlyc3QgZ2V0IGFsbCB0cmFuc2l0aW9ucyB3aXRoIGF0VXRjIE5PVCBjb21wZW5zYXRlZCBmb3Igc3RhbmRhcmQgb2Zmc2V0XG4gICAgICAgICAgICAvLyBUYWtlIGFuIGV4dHJhIHllYXIgYmVmb3JlIHN0YXJ0XG4gICAgICAgICAgICBmb3IgKHZhciB5ZWFyID0gc3RhcnQgLSAxOyB5ZWFyIDwgZW5kOyArK3llYXIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gdGhpcy5fZmluYWxSdWxlczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGVJbmZvID0gX2FbX2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5ZWFyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRVdGM6IHJ1bGVJbmZvLmVmZmVjdGl2ZURhdGVVdGMoeWVhciwgdGhpcy5fZmluYWxab25lSW5mby5nbXRvZmYsICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKHRoaXMuX2ZpbmFsWm9uZUluZm8uZm9ybWF0LCBydWxlSW5mby5zYXZlLm5vblplcm8oKSwgcnVsZUluZm8ubGV0dGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBydWxlSW5mby5sZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcnVsZUluZm8uc2F2ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHRoaXMuX2ZpbmFsWm9uZUluZm8uZ210b2ZmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25zV2l0aFJ1bGVzLnB1c2goeyB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uLCBydWxlSW5mbzogcnVsZUluZm8gfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFuc2l0aW9uc1dpdGhSdWxlcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLnRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcyAtIGIudHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzOyB9KTtcbiAgICAgICAgICAgIC8vIG5vdyBhcHBseSBEU1Qgb2Zmc2V0IHJldHJvYWN0aXZlbHlcbiAgICAgICAgICAgIHZhciBwcmV2RHN0ID0gKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApO1xuICAgICAgICAgICAgZm9yICh2YXIgX2IgPSAwLCB0cmFuc2l0aW9uc1dpdGhSdWxlc18xID0gdHJhbnNpdGlvbnNXaXRoUnVsZXM7IF9iIDwgdHJhbnNpdGlvbnNXaXRoUnVsZXNfMS5sZW5ndGg7IF9iKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgdHIgPSB0cmFuc2l0aW9uc1dpdGhSdWxlc18xW19iXTtcbiAgICAgICAgICAgICAgICBpZiAodHIucnVsZUluZm8uYXRUeXBlID09PSBBdFR5cGUuV2FsbCkge1xuICAgICAgICAgICAgICAgICAgICB0ci50cmFuc2l0aW9uLmF0VXRjID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodHIudHJhbnNpdGlvbi5hdFV0Yy51bml4TWlsbGlzIC0gcHJldkRzdC5taWxsaXNlY29uZHMoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZEc3QgPSB0ci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAodHIudHJhbnNpdGlvbi5hdFV0Yy55ZWFyID49IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRyLnRyYW5zaXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIHRoZSBpbml0aWFsIHN0YXRlIGZvciB0aGUgem9uZVxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxuICAgICAqIEBwYXJhbSBpbmZvc1xuICAgICAqIEBwYXJhbSBydWxlc1xuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5fY2FsY0luaXRpYWxTdGF0ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSwgaW5mb3MsIHJ1bGVzKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgLy8gaW5pdGlhbCBzdGF0ZVxuICAgICAgICBpZiAoaW5mb3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogXCJcIixcbiAgICAgICAgICAgICAgICBsZXR0ZXI6IFwiXCIsXG4gICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiAoMCwgZHVyYXRpb25fMS5ob3VycykoMCksXG4gICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5mbyA9IGluZm9zWzBdO1xuICAgICAgICBzd2l0Y2ggKGluZm8ucnVsZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUnVsZVR5cGUuTm9uZTpcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24oaW5mby5mb3JtYXQsIGZhbHNlLCB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApLFxuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogaW5mby5nbXRvZmZcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5PZmZzZXQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgYWJicmV2aWF0aW9uOiB6b25lQWJicmV2aWF0aW9uKGluZm8uZm9ybWF0LCBpbmZvLnJ1bGVPZmZzZXQubm9uWmVybygpLCB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogaW5mby5ydWxlT2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogaW5mby5nbXRvZmZcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZToge1xuICAgICAgICAgICAgICAgIHZhciBydWxlID0gcnVsZXMuZ2V0KGluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICghcnVsZSkge1xuICAgICAgICAgICAgICAgICAgICAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ6b25lICclcycgcmVmZXJzIHRvIG5vbi1leGlzdGluZyBydWxlICclcydcIiwgem9uZU5hbWUsIGluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBmaW5kIGZpcnN0IHJ1bGUgdHJhbnNpdGlvbiB3aXRob3V0IERTVCBzbyB0aGF0IHdlIGhhdmUgYSBsZXR0ZXJcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBydWxlLmZpbmRGaXJzdCgpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldC5ub25aZXJvKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlLmZpbmROZXh0KGl0ZXJhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGxldHRlciA9IChfYSA9IGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlcikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24oaW5mby5mb3JtYXQsIGZhbHNlLCBsZXR0ZXIpLFxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKSxcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBsZXR0ZXIsXG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiBpbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShmYWxzZSwgXCJ0aW1lem9uZWNvbXBsZXRlLkFzc2VydGlvblwiLCBcIlVua25vd24gUnVsZVR5cGVcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFByZS1jYWxjdWxhdGUgYWxsIHRyYW5zaXRpb25zIHVudGlsIHRoZXJlIGFyZSBvbmx5ICdtYXgnIHJ1bGVzIGluIGVmZmVjdFxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxuICAgICAqIEBwYXJhbSBpbml0aWFsU3RhdGVcbiAgICAgKiBAcGFyYW0gem9uZUluZm9zXG4gICAgICogQHBhcmFtIHJ1bGVzXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5fY2FsY1RyYW5zaXRpb25zID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBpbml0aWFsU3RhdGUsIHpvbmVJbmZvcywgcnVsZXMpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoem9uZUluZm9zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtbXSwgW11dO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdhbGsgdGhyb3VnaCB0aGUgem9uZSByZWNvcmRzIGFuZCBhZGQgYSB0cmFuc2l0aW9uIGZvciBlYWNoXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IFtdO1xuICAgICAgICB2YXIgcHJldlN0YXRlID0gaW5pdGlhbFN0YXRlO1xuICAgICAgICB2YXIgcHJldlVudGlsO1xuICAgICAgICB2YXIgcHJldlJ1bGVzO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc182ID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc182Lmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzZbX2ldO1xuICAgICAgICAgICAgLy8gem9uZXMgY2FuIGhhdmUgYSBEU1Qgb2Zmc2V0IG9yIHRoZXkgY2FuIHJlZmVyIHRvIGEgcnVsZSBzZXRcbiAgICAgICAgICAgIHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XG4gICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5PZmZzZXQ6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2VW50aWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRVdGM6IHByZXZVbnRpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuTm9uZSA/ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKSA6IHpvbmVJbmZvLnJ1bGVPZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogem9uZUluZm8uZ210b2ZmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2UnVsZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlcy5nZXQoem9uZUluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFydWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlpvbmUgJyVzJyByZWZlcnMgdG8gbm9uLWV4aXN0aW5nIHJ1bGUgJyVzJ1wiLCB6b25lTmFtZSwgem9uZUluZm8ucnVsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHQgPSB0aGlzLl96b25lVHJhbnNpdGlvbnMocHJldlVudGlsLCB6b25lSW5mbywgcnVsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdCh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZSdWxlcyA9IHJ1bGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGZhbHNlLCBcInRpbWV6b25lY29tcGxldGUuQXNzZXJ0aW9uXCIsIFwiVW5rbm93biBSdWxlVHlwZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZVbnRpbCA9IHpvbmVJbmZvLnVudGlsICE9PSB1bmRlZmluZWQgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh6b25lSW5mby51bnRpbCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBwcmV2U3RhdGUgPSB0cmFuc2l0aW9ucy5sZW5ndGggPiAwID8gdHJhbnNpdGlvbnNbdHJhbnNpdGlvbnMubGVuZ3RoIC0gMV0ubmV3U3RhdGUgOiBwcmV2U3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFt0cmFuc2l0aW9ucywgKF9hID0gcHJldlJ1bGVzID09PSBudWxsIHx8IHByZXZSdWxlcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJldlJ1bGVzLmZpbmFsKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXV07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFsbCB0aGUgdHJhbnNpdGlvbnMgZm9yIGEgdGltZSB6b25lIGZyb20gZnJvbVV0YyAoaW5jbHVzaXZlKSB0byB6b25lSW5mby51bnRpbCAoZXhjbHVzaXZlKS5cbiAgICAgKiBUaGUgcmVzdWx0IGFsd2F5cyBjb250YWlucyBhbiBpbml0aWFsIHRyYW5zaXRpb24gYXQgZnJvbVV0YyB0aGF0IHNpZ25hbHMgdGhlIHN3aXRjaCB0byB0aGlzIHJ1bGUgc2V0XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZnJvbVV0YyBwcmV2aW91cyB6b25lIHN1Yi1yZWNvcmQgVU5USUwgdGltZTsgdW5kZWZpbmVkIGZvciBmaXJzdCB6b25lIHJlY29yZFxuICAgICAqIEBwYXJhbSB6b25lSW5mbyB0aGUgY3VycmVudCB6b25lIHN1Yi1yZWNvcmRcbiAgICAgKiBAcGFyYW0gcnVsZSB0aGUgY29ycmVzcG9uZGluZyBydWxlIHRyYW5zaXRpb25zXG4gICAgICovXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5fem9uZVRyYW5zaXRpb25zID0gZnVuY3Rpb24gKGZyb21VdGMsIHpvbmVJbmZvLCBydWxlKSB7XG4gICAgICAgIC8vIGZyb20gdHotaG93LXRvLmh0bWw6XG4gICAgICAgIC8vIE9uZSB3cmlua2xlLCBub3QgZnVsbHkgZXhwbGFpbmVkIGluIHppYy44LnR4dCwgaXMgd2hhdCBoYXBwZW5zIHdoZW4gc3dpdGNoaW5nIHRvIGEgbmFtZWQgcnVsZS4gVG8gd2hhdCB2YWx1ZXMgc2hvdWxkIHRoZSBTQVZFIGFuZFxuICAgICAgICAvLyBMRVRURVIgZGF0YSBiZSBpbml0aWFsaXplZD9cbiAgICAgICAgLy8gLSBJZiBhdCBsZWFzdCBvbmUgdHJhbnNpdGlvbiBoYXMgaGFwcGVuZWQsIHVzZSB0aGUgU0FWRSBhbmQgTEVUVEVSIGRhdGEgZnJvbSB0aGUgbW9zdCByZWNlbnQuXG4gICAgICAgIC8vIC0gSWYgc3dpdGNoaW5nIHRvIGEgbmFtZWQgcnVsZSBiZWZvcmUgYW55IHRyYW5zaXRpb24gaGFzIGhhcHBlbmVkLCBhc3N1bWUgc3RhbmRhcmQgdGltZSAoU0FWRSB6ZXJvKSwgYW5kIHVzZSB0aGUgTEVUVEVSIGRhdGEgZnJvbVxuICAgICAgICAvLyB0aGUgZWFybGllc3QgdHJhbnNpdGlvbiB3aXRoIGEgU0FWRSBvZiB6ZXJvLlxuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2Q7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgLy8gZXh0cmEgaW5pdGlhbCB0cmFuc2l0aW9uIGZvciBzd2l0Y2ggdG8gdGhpcyBydWxlIHNldCAoYnV0IG5vdCBmb3IgZmlyc3Qgem9uZSBpbmZvKVxuICAgICAgICB2YXIgaW5pdGlhbDtcbiAgICAgICAgaWYgKGZyb21VdGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIGluaXRpYWxSdWxlVHJhbnNpdGlvbiA9IHJ1bGUuZmluZExhc3RMZXNzRXF1YWwoZnJvbVV0Yywgem9uZUluZm8uZ210b2ZmKTtcbiAgICAgICAgICAgIGlmIChpbml0aWFsUnVsZVRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsID0ge1xuICAgICAgICAgICAgICAgICAgICBhdFV0YzogZnJvbVV0YyxcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogKF9hID0gaW5pdGlhbFJ1bGVUcmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlcikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGluaXRpYWxSdWxlVHJhbnNpdGlvbiA9IHJ1bGUuZmlyc3RUcmFuc2l0aW9uV2l0aG91dERzdEFmdGVyKGZyb21VdGMsIHpvbmVJbmZvLmdtdG9mZiwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBpbml0aWFsID0ge1xuICAgICAgICAgICAgICAgICAgICBhdFV0YzogZnJvbVV0YyxcbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCBpbml0aWFsUnVsZVRyYW5zaXRpb24gPT09IG51bGwgfHwgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogKF9iID0gaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSBudWxsIHx8IGluaXRpYWxSdWxlVHJhbnNpdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW5pdGlhbFJ1bGVUcmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlcikgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGluaXRpYWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFjdHVhbCBydWxlIHRyYW5zaXRpb25zOyBrZWVwIGFkZGluZyB1bnRpbCB0aGUgZW5kIG9mIHRoaXMgem9uZSBpbmZvLCBvciB1bnRpbCBvbmx5ICdtYXgnIHJ1bGVzIHJlbWFpblxuICAgICAgICB2YXIgcHJldkRzdCA9IChfYyA9IGluaXRpYWwgPT09IG51bGwgfHwgaW5pdGlhbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW5pdGlhbC5uZXdTdGF0ZS5kc3RPZmZzZXQpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKTtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gcnVsZS5maW5kRmlyc3QoKTtcbiAgICAgICAgdmFyIGVmZmVjdGl2ZSA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgJiYgcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgem9uZUluZm8uZ210b2ZmLCBwcmV2RHN0KTtcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGVmZmVjdGl2ZSAmJlxuICAgICAgICAgICAgKCh6b25lSW5mby51bnRpbCAmJiBlZmZlY3RpdmUudW5peE1pbGxpcyA8IHpvbmVJbmZvLnVudGlsKSB8fCAoIXpvbmVJbmZvLnVudGlsICYmICFpdGVyYXRvci5maW5hbCkpKSB7XG4gICAgICAgICAgICBwcmV2RHN0ID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQ7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgYXRVdGM6IGVmZmVjdGl2ZSxcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24oem9uZUluZm8uZm9ybWF0LCBwcmV2RHN0Lm5vblplcm8oKSwgaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpLFxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IChfZCA9IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSAhPT0gbnVsbCAmJiBfZCAhPT0gdm9pZCAwID8gX2QgOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHByZXZEc3QsXG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiB6b25lSW5mby5nbXRvZmZcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gcnVsZS5maW5kTmV4dChpdGVyYXRvcik7XG4gICAgICAgICAgICBlZmZlY3RpdmUgPSBpdGVyYXRvciAmJiBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCB6b25lSW5mby5nbXRvZmYsIHByZXZEc3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICByZXR1cm4gQ2FjaGVkWm9uZVRyYW5zaXRpb25zO1xufSgpKTtcbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBmb3JtYXR0ZWQgYWJicmV2aWF0aW9uIGZvciBhIHpvbmVcbiAqIEBwYXJhbSBmb3JtYXQgdGhlIGFiYnJldmlhdGlvbiBmb3JtYXQgc3RyaW5nLiBFaXRoZXIgJ3p6eiwnIGZvciBOVUxMOyAgJ0EvQicgZm9yIHN0ZC9kc3QsIG9yICdBJXNCJyBmb3IgYSBmb3JtYXQgc3RyaW5nIHdoZXJlICVzIGlzXG4gKiByZXBsYWNlZCBieSBhIGxldHRlclxuICogQHBhcmFtIGRzdCB3aGV0aGVyIERTVCBpcyBvYnNlcnZlZFxuICogQHBhcmFtIGxldHRlciBjdXJyZW50IHJ1bGUgbGV0dGVyLCBlbXB0eSBpZiBubyBydWxlXG4gKiBAcmV0dXJucyBmdWxseSBmb3JtYXR0ZWQgYWJicmV2aWF0aW9uXG4gKi9cbmZ1bmN0aW9uIHpvbmVBYmJyZXZpYXRpb24oZm9ybWF0LCBkc3QsIGxldHRlcikge1xuICAgIGlmIChmb3JtYXQgPT09IFwienp6LFwiKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAoZm9ybWF0LmluY2x1ZGVzKFwiL1wiKSkge1xuICAgICAgICByZXR1cm4gKGRzdCA/IGZvcm1hdC5zcGxpdChcIi9cIilbMV0gOiBmb3JtYXQuc3BsaXQoXCIvXCIpWzBdKTtcbiAgICB9XG4gICAgaWYgKGxldHRlcikge1xuICAgICAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBcIlwiKTtcbn1cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSBVVEMgdGltZSBvZiBhIHJ1bGUgdHJhbnNpdGlvbiwgZ2l2ZW4gYSBwYXJ0aWN1bGFyIHRpbWUgem9uZVxuICogQHBhcmFtIHRyYW5zaXRpb25cbiAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldCB6b25lIG9mZnNldCBmcm9tIFVUXG4gKiBAcGFyYW0gZHN0T2Zmc2V0IHByZXZpb3VzIERTVCBvZmZzZXQgZnJvbSBVVCtzdGFuZGFyZE9mZnNldFxuICogQHJldHVybnMgVVRDIHRpbWVcbiAqL1xuZnVuY3Rpb24gcnVsZVRyYW5zaXRpb25VdGModHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIGRzdE9mZnNldCkge1xuICAgIHN3aXRjaCAodHJhbnNpdGlvbi5hdFR5cGUpIHtcbiAgICAgICAgY2FzZSBBdFR5cGUuVXRjOiByZXR1cm4gdHJhbnNpdGlvbi5hdDtcbiAgICAgICAgY2FzZSBBdFR5cGUuU3RhbmRhcmQ6IHtcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aG91dCBEU1RcbiAgICAgICAgICAgIHZhciBtaWxsaXMgPSB0cmFuc2l0aW9uLmF0LnVuaXhNaWxsaXM7XG4gICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEF0VHlwZS5XYWxsOiB7XG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIHRpbWUgaXMgaW4gem9uZSBsb2NhbCB0aW1lIHdpdGggRFNUXG4gICAgICAgICAgICB2YXIgbWlsbGlzID0gdHJhbnNpdGlvbi5hdC51bml4TWlsbGlzO1xuICAgICAgICAgICAgbWlsbGlzIC09IHN0YW5kYXJkT2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xuICAgICAgICAgICAgaWYgKGRzdE9mZnNldCkge1xuICAgICAgICAgICAgICAgIG1pbGxpcyAtPSBkc3RPZmZzZXQubWlsbGlzZWNvbmRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR6LWRhdGFiYXNlLmpzLm1hcCIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogRGF0ZSBhbmQgVGltZSB1dGlsaXR5IGZ1bmN0aW9ucyAtIG1haW4gaW5kZXhcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuWm9uZUluZm8gPSBleHBvcnRzLlR6RGF0YWJhc2UgPSBleHBvcnRzLlRyYW5zaXRpb24gPSBleHBvcnRzLlRvVHlwZSA9IGV4cG9ydHMuT25UeXBlID0gZXhwb3J0cy5SdWxlVHlwZSA9IGV4cG9ydHMuUnVsZUluZm8gPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGV4cG9ydHMuQXRUeXBlID0gdm9pZCAwO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2Jhc2ljc1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vZGF0ZXRpbWVcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9mb3JtYXRcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2dsb2JhbHNcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2xvY2FsZVwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vcGFyc2VcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3BlcmlvZFwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vYmFzaWNzXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi90aW1lc291cmNlXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi90aW1lem9uZVwiKSwgZXhwb3J0cyk7XG52YXIgdHpfZGF0YWJhc2VfMSA9IHJlcXVpcmUoXCIuL3R6LWRhdGFiYXNlXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQXRUeXBlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLkF0VHlwZTsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImlzVmFsaWRPZmZzZXRTdHJpbmdcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuaXNWYWxpZE9mZnNldFN0cmluZzsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIk5vcm1hbGl6ZU9wdGlvblwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb247IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJSdWxlSW5mb1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5SdWxlSW5mbzsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlJ1bGVUeXBlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLlJ1bGVUeXBlOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiT25UeXBlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLk9uVHlwZTsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlRvVHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5Ub1R5cGU7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJUcmFuc2l0aW9uXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLlRyYW5zaXRpb247IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJUekRhdGFiYXNlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2U7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJab25lSW5mb1wiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5ab25lSW5mbzsgfSB9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdfQ==
