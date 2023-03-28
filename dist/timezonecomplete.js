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
                                return (0, error_1.throwError)("ParseError", "unsupported second format '" + token.raw + "'");
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
            return (0, error_1.throwError)("ParseError", "invalid date '" + dateTimeString + "' not according to format '" + formatString + "': trailing characters: '" + remaining + "'");
        }
        return result;
    }
    catch (e) {
        return (0, error_1.throwError)("ParseError", "invalid date '" + dateTimeString + "' not according to format '" + formatString + "': " + e.message);
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
        return (0, error_1.throwError)("ParseError", "expected '" + expected + "'");
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
        return (0, error_1.throwError)("ParseError", "expected a number but got '" + numberString + "'");
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
        (0, assert_1.default)(hours >= 0 && hours < 24, "Argument.S", "Invalid time zone (hours out of range): '" + t + "'");
        (0, assert_1.default)(minutes >= 0 && minutes < 60, "Argument.S", "Invalid time zone (minutes out of range): '" + t + "'");
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
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2xpYi9hc3NlcnQuanMiLCJkaXN0L2xpYi9iYXNpY3MuanMiLCJkaXN0L2xpYi9kYXRldGltZS5qcyIsImRpc3QvbGliL2R1cmF0aW9uLmpzIiwiZGlzdC9saWIvZXJyb3IuanMiLCJkaXN0L2xpYi9mb3JtYXQuanMiLCJkaXN0L2xpYi9nbG9iYWxzLmpzIiwiZGlzdC9saWIvamF2YXNjcmlwdC5qcyIsImRpc3QvbGliL2xvY2FsZS5qcyIsImRpc3QvbGliL21hdGguanMiLCJkaXN0L2xpYi9wYXJzZS5qcyIsImRpc3QvbGliL3BlcmlvZC5qcyIsImRpc3QvbGliL3N0cmluZ3MuanMiLCJkaXN0L2xpYi90aW1lc291cmNlLmpzIiwiZGlzdC9saWIvdGltZXpvbmUuanMiLCJkaXN0L2xpYi90b2tlbi5qcyIsImRpc3QvbGliL3R6LWRhdGFiYXNlLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy91dGlsL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiZGlzdC9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzczQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMza0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3bEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeHNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2MUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcm9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE2IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIF9fc3ByZWFkQXJyYXkgPSAodGhpcyAmJiB0aGlzLl9fc3ByZWFkQXJyYXkpIHx8IGZ1bmN0aW9uICh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG4vKipcclxuICogVGhyb3dzIGFuIEFzc2VydGlvbiBlcnJvciBpZiB0aGUgZ2l2ZW4gY29uZGl0aW9uIGlzIGZhbHN5XHJcbiAqIEBwYXJhbSBjb25kaXRpb25cclxuICogQHBhcmFtIG5hbWUgZXJyb3IgbmFtZVxyXG4gKiBAcGFyYW0gZm9ybWF0IGVycm9yIG1lc3NhZ2Ugd2l0aCBwZXJjZW50LXN0eWxlIHBsYWNlaG9sZGVyc1xyXG4gKiBAcGFyYW0gYXJncyBhcmd1bWVudHMgZm9yIGVycm9yIG1lc3NhZ2UgZm9ybWF0IHN0cmluZ1xyXG4gKiBAdGhyb3dzIFtuYW1lXSBpZiBgY29uZGl0aW9uYCBpcyBmYWxzeVxyXG4gKi9cclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbmFtZSwgZm9ybWF0KSB7XHJcbiAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAzOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBhcmdzW19pIC0gM10gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgaWYgKCFjb25kaXRpb24pIHtcclxuICAgICAgICBlcnJvcl8xLnRocm93RXJyb3IuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtuYW1lLCBmb3JtYXRdLCBhcmdzLCBmYWxzZSkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuZGVmYXVsdCA9IGFzc2VydDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZXJ0LmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuYmluYXJ5SW5zZXJ0aW9uSW5kZXggPSBleHBvcnRzLlRpbWVTdHJ1Y3QgPSBleHBvcnRzLnNlY29uZE9mRGF5ID0gZXhwb3J0cy53ZWVrRGF5Tm9MZWFwU2VjcyA9IGV4cG9ydHMudGltZVRvVW5peE5vTGVhcFNlY3MgPSBleHBvcnRzLnVuaXhUb1RpbWVOb0xlYXBTZWNzID0gZXhwb3J0cy53ZWVrTnVtYmVyID0gZXhwb3J0cy53ZWVrT2ZNb250aCA9IGV4cG9ydHMud2Vla0RheU9uT3JCZWZvcmUgPSBleHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSBleHBvcnRzLmZpcnN0V2Vla0RheU9mTW9udGggPSBleHBvcnRzLmxhc3RXZWVrRGF5T2ZNb250aCA9IGV4cG9ydHMuZGF5T2ZZZWFyID0gZXhwb3J0cy5kYXlzSW5Nb250aCA9IGV4cG9ydHMuZGF5c0luWWVhciA9IGV4cG9ydHMuaXNMZWFwWWVhciA9IGV4cG9ydHMuc3RyaW5nVG9UaW1lVW5pdCA9IGV4cG9ydHMudGltZVVuaXRUb1N0cmluZyA9IGV4cG9ydHMudGltZVVuaXRUb01pbGxpc2Vjb25kcyA9IGV4cG9ydHMuVGltZVVuaXQgPSBleHBvcnRzLldlZWtEYXkgPSB2b2lkIDA7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcclxudmFyIGphdmFzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbnZhciBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxudmFyIHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG4vKipcclxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcclxuICogU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSBldGNcclxuICovXHJcbnZhciBXZWVrRGF5O1xyXG4oZnVuY3Rpb24gKFdlZWtEYXkpIHtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlN1bmRheVwiXSA9IDBdID0gXCJTdW5kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIk1vbmRheVwiXSA9IDFdID0gXCJNb25kYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlR1ZXNkYXlcIl0gPSAyXSA9IFwiVHVlc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiV2VkbmVzZGF5XCJdID0gM10gPSBcIldlZG5lc2RheVwiO1xyXG4gICAgV2Vla0RheVtXZWVrRGF5W1wiVGh1cnNkYXlcIl0gPSA0XSA9IFwiVGh1cnNkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIkZyaWRheVwiXSA9IDVdID0gXCJGcmlkYXlcIjtcclxuICAgIFdlZWtEYXlbV2Vla0RheVtcIlNhdHVyZGF5XCJdID0gNl0gPSBcIlNhdHVyZGF5XCI7XHJcbn0pKFdlZWtEYXkgPSBleHBvcnRzLldlZWtEYXkgfHwgKGV4cG9ydHMuV2Vla0RheSA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG52YXIgVGltZVVuaXQ7XHJcbihmdW5jdGlvbiAoVGltZVVuaXQpIHtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTWlsbGlzZWNvbmRcIl0gPSAwXSA9IFwiTWlsbGlzZWNvbmRcIjtcclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiU2Vjb25kXCJdID0gMV0gPSBcIlNlY29uZFwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNaW51dGVcIl0gPSAyXSA9IFwiTWludXRlXCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIkhvdXJcIl0gPSAzXSA9IFwiSG91clwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJEYXlcIl0gPSA0XSA9IFwiRGF5XCI7XHJcbiAgICBUaW1lVW5pdFtUaW1lVW5pdFtcIldlZWtcIl0gPSA1XSA9IFwiV2Vla1wiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJNb250aFwiXSA9IDZdID0gXCJNb250aFwiO1xyXG4gICAgVGltZVVuaXRbVGltZVVuaXRbXCJZZWFyXCJdID0gN10gPSBcIlllYXJcIjtcclxuICAgIC8qKlxyXG4gICAgICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXHJcbiAgICAgKi9cclxuICAgIFRpbWVVbml0W1RpbWVVbml0W1wiTUFYXCJdID0gOF0gPSBcIk1BWFwiO1xyXG59KShUaW1lVW5pdCA9IGV4cG9ydHMuVGltZVVuaXQgfHwgKGV4cG9ydHMuVGltZVVuaXQgPSB7fSkpO1xyXG4vKipcclxuICogQXBwcm94aW1hdGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYSB0aW1lIHVuaXQuXHJcbiAqIEEgZGF5IGlzIGFzc3VtZWQgdG8gaGF2ZSAyNCBob3VycywgYSBtb250aCBpcyBhc3N1bWVkIHRvIGVxdWFsIDMwIGRheXNcclxuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxyXG4gKlxyXG4gKiBAcGFyYW0gdW5pdFx0VGltZSB1bml0IGUuZy4gVGltZVVuaXQuTW9udGhcclxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5pdCBmb3IgaW52YWxpZCB1bml0XHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpIHtcclxuICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG4gICAgICAgIGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcclxuICAgICAgICBjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuVW5pdFwiLCBcInVua25vd24gdGltZSB1bml0ICVkXCIsIHVuaXQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMudGltZVVuaXRUb01pbGxpc2Vjb25kcyA9IHRpbWVVbml0VG9NaWxsaXNlY29uZHM7XHJcbi8qKlxyXG4gKiBUaW1lIHVuaXQgdG8gbG93ZXJjYXNlIHN0cmluZy4gSWYgYW1vdW50IGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgc3RyaW5nIGlzIHB1dCBpbiBwbHVyYWwgZm9ybVxyXG4gKiBpZiBuZWNlc3NhcnkuXHJcbiAqIEBwYXJhbSB1bml0IFRoZSB1bml0XHJcbiAqIEBwYXJhbSBhbW91bnQgSWYgdGhpcyBpcyB1bmVxdWFsIHRvIC0xIGFuZCAxLCB0aGVuIHRoZSByZXN1bHQgaXMgcGx1cmFsaXplZFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5pdCBmb3IgaW52YWxpZCB0aW1lIHVuaXRcclxuICovXHJcbmZ1bmN0aW9uIHRpbWVVbml0VG9TdHJpbmcodW5pdCwgYW1vdW50KSB7XHJcbiAgICBpZiAoYW1vdW50ID09PSB2b2lkIDApIHsgYW1vdW50ID0gMTsgfVxyXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHVuaXQpIHx8IHVuaXQgPCAwIHx8IHVuaXQgPj0gVGltZVVuaXQuTUFYKSB7XHJcbiAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuVW5pdFwiLCBcImludmFsaWQgdGltZSB1bml0ICVkXCIsIHVuaXQpO1xyXG4gICAgfVxyXG4gICAgdmFyIHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAoYW1vdW50ID09PSAxIHx8IGFtb3VudCA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIFwic1wiO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMudGltZVVuaXRUb1N0cmluZyA9IHRpbWVVbml0VG9TdHJpbmc7XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgbnVtZXJpYyBUaW1lVW5pdC4gQ2FzZS1pbnNlbnNpdGl2ZTsgdGltZSB1bml0cyBjYW4gYmUgc2luZ3VsYXIgb3IgcGx1cmFsLlxyXG4gKiBAcGFyYW0gc1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuUyBmb3IgaW52YWxpZCBzdHJpbmdcclxuICovXHJcbmZ1bmN0aW9uIHN0cmluZ1RvVGltZVVuaXQocykge1xyXG4gICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xyXG4gICAgICAgIHZhciBvdGhlciA9IHRpbWVVbml0VG9TdHJpbmcoaSwgMSk7XHJcbiAgICAgICAgaWYgKG90aGVyID09PSB0cmltbWVkIHx8IChvdGhlciArIFwic1wiKSA9PT0gdHJpbW1lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5TXCIsIFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICclcydcIiwgcyk7XHJcbn1cclxuZXhwb3J0cy5zdHJpbmdUb1RpbWVVbml0ID0gc3RyaW5nVG9UaW1lVW5pdDtcclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGlmIHllYXIgaXMgbm90IGludGVnZXJcclxuICovXHJcbmZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcikge1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIkludmFsaWQgeWVhciAlZFwiLCB5ZWFyKTtcclxuICAgIC8vIGZyb20gV2lraXBlZGlhOlxyXG4gICAgLy8gaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDQgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXHJcbiAgICAvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxyXG4gICAgLy8gZWxzZSBsZWFwIHllYXJcclxuICAgIGlmICh5ZWFyICUgNCAhPT0gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSAxMDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLmlzTGVhcFllYXIgPSBpc0xlYXBZZWFyO1xyXG4vKipcclxuICogVGhlIGRheXMgaW4gYSBnaXZlbiB5ZWFyXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGlmIHllYXIgaXMgbm90IGludGVnZXJcclxuICovXHJcbmZ1bmN0aW9uIGRheXNJblllYXIoeWVhcikge1xyXG4gICAgLy8gcmVseSBvbiB2YWxpZGF0aW9uIGJ5IGlzTGVhcFllYXJcclxuICAgIHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XHJcbn1cclxuZXhwb3J0cy5kYXlzSW5ZZWFyID0gZGF5c0luWWVhcjtcclxuLyoqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIDEtMTJcclxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGlmIHllYXIgaXMgbm90IGludGVnZXJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoIG51bWJlclxyXG4gKi9cclxuZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhciwgbW9udGgpIHtcclxuICAgIHN3aXRjaCAobW9udGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgY2FzZSA4OlxyXG4gICAgICAgIGNhc2UgMTA6XHJcbiAgICAgICAgY2FzZSAxMjpcclxuICAgICAgICAgICAgcmV0dXJuIDMxO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgcmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCk7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgIGNhc2UgNjpcclxuICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgY2FzZSAxMTpcclxuICAgICAgICAgICAgcmV0dXJuIDMwO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiSW52YWxpZCBtb250aDogJWRcIiwgbW9udGgpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuZGF5c0luTW9udGggPSBkYXlzSW5Nb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheSBvZiB0aGUgeWVhciBvZiB0aGUgZ2l2ZW4gZGF0ZSBbMC4uMzY1XS4gSmFudWFyeSBmaXJzdCBpcyAwLlxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZS5nLiAxOTg2XHJcbiAqIEBwYXJhbSBtb250aCBNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxyXG4gKi9cclxuZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoZGF5KSAmJiBkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICB2YXIgeWVhckRheSA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IG1vbnRoOyBpKyspIHtcclxuICAgICAgICB5ZWFyRGF5ICs9IGRheXNJbk1vbnRoKHllYXIsIGkpO1xyXG4gICAgfVxyXG4gICAgeWVhckRheSArPSAoZGF5IC0gMSk7XHJcbiAgICByZXR1cm4geWVhckRheTtcclxufVxyXG5leHBvcnRzLmRheU9mWWVhciA9IGRheU9mWWVhcjtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheSAwLTZcclxuICogQHJldHVybiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla0RheSBmb3IgaW52YWxpZCB3ZWVrIGRheVxyXG4gKi9cclxuZnVuY3Rpb24gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCB3ZWVrRGF5KSB7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih5ZWFyKSwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiWWVhciBvdXQgb2YgcmFuZ2U6ICVkXCIsIHllYXIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIobW9udGgpICYmIG1vbnRoID49IDEgJiYgbW9udGggPD0gMTIsIFwiQXJndW1lbnQuTW9udGhcIiwgXCJNb250aCBvdXQgb2YgcmFuZ2U6ICVkXCIsIG1vbnRoKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHdlZWtEYXkpICYmIHdlZWtEYXkgPj0gMCAmJiB3ZWVrRGF5IDw9IDYsIFwiQXJndW1lbnQuV2Vla0RheVwiLCBcIndlZWtEYXkgb3V0IG9mIHJhbmdlOiAlZFwiLCB3ZWVrRGF5KTtcclxuICAgIHZhciBlbmRPZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5c0luTW9udGgoeWVhciwgbW9udGgpIH0pO1xyXG4gICAgdmFyIGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aC51bml4TWlsbGlzKTtcclxuICAgIHZhciBkaWZmID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgZGlmZiAtPSA3O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcbmV4cG9ydHMubGFzdFdlZWtEYXlPZk1vbnRoID0gbGFzdFdlZWtEYXlPZk1vbnRoO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxyXG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhciAobm9uLWludGVnZXIpXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb250aCBmb3IgaW52YWxpZCBtb250aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla0RheSBmb3IgaW52YWxpZCB3ZWVrIGRheVxyXG4gKi9cclxuZnVuY3Rpb24gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgd2Vla0RheSkge1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoeWVhciksIFwiQXJndW1lbnQuWWVhclwiLCBcIlllYXIgb3V0IG9mIHJhbmdlOiAlZFwiLCB5ZWFyKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKG1vbnRoKSAmJiBtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiTW9udGggb3V0IG9mIHJhbmdlOiAlZFwiLCBtb250aCk7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XHJcbiAgICB2YXIgYmVnaW5PZk1vbnRoID0gbmV3IFRpbWVTdHJ1Y3QoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogMSB9KTtcclxuICAgIHZhciBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xyXG4gICAgdmFyIGRpZmYgPSB3ZWVrRGF5IC0gYmVnaW5PZk1vbnRoV2Vla0RheTtcclxuICAgIGlmIChkaWZmIDwgMCkge1xyXG4gICAgICAgIGRpZmYgKz0gNztcclxuICAgIH1cclxuICAgIHJldHVybiBiZWdpbk9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xyXG59XHJcbmV4cG9ydHMuZmlyc3RXZWVrRGF5T2ZNb250aCA9IGZpcnN0V2Vla0RheU9mTW9udGg7XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheTsgdGhyb3dzIGlmIG5vdCBmb3VuZFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XZWVrRGF5IGZvciBpbnZhbGlkIHdlZWsgZGF5XHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZCBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5XHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrRGF5T25PckFmdGVyKHllYXIsIG1vbnRoLCBkYXksIHdlZWtEYXkpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoZGF5KSAmJiBkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XHJcbiAgICB2YXIgc3RhcnQgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXkgfSk7XHJcbiAgICB2YXIgc3RhcnRXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICBkaWZmICs9IDc7XHJcbiAgICB9XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmIDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJOb3RGb3VuZFwiLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG4gICAgcmV0dXJuIHN0YXJ0LmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcclxufVxyXG5leHBvcnRzLndlZWtEYXlPbk9yQWZ0ZXIgPSB3ZWVrRGF5T25PckFmdGVyO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLW1vbnRoIHRoYXQgaXMgb24gdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHdoaWNoIGlzIDw9IHRoZSBnaXZlbiBkYXkuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTW9udGggZm9yIGludmFsaWQgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkRheSBmb3IgaW52YWxpZCBkYXkgb2YgbW9udGhcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtEYXkgZm9yIGludmFsaWQgd2VlayBkYXlcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXlcclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlPbk9yQmVmb3JlKHllYXIsIG1vbnRoLCBkYXksIHdlZWtEYXkpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJZZWFyIG91dCBvZiByYW5nZTogJWRcIiwgeWVhcik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihtb250aCkgJiYgbW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIk1vbnRoIG91dCBvZiByYW5nZTogJWRcIiwgbW9udGgpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoZGF5KSAmJiBkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih3ZWVrRGF5KSAmJiB3ZWVrRGF5ID49IDAgJiYgd2Vla0RheSA8PSA2LCBcIkFyZ3VtZW50LldlZWtEYXlcIiwgXCJ3ZWVrRGF5IG91dCBvZiByYW5nZTogJWRcIiwgd2Vla0RheSk7XHJcbiAgICB2YXIgc3RhcnQgPSBuZXcgVGltZVN0cnVjdCh7IHllYXI6IHllYXIsIG1vbnRoOiBtb250aCwgZGF5OiBkYXkgfSk7XHJcbiAgICB2YXIgc3RhcnRXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnQudW5peE1pbGxpcyk7XHJcbiAgICB2YXIgZGlmZiA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcbiAgICBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICBkaWZmIC09IDc7XHJcbiAgICB9XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmID49IDEsIFwiTm90Rm91bmRcIiwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuICAgIHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XHJcbn1cclxuZXhwb3J0cy53ZWVrRGF5T25PckJlZm9yZSA9IHdlZWtEYXlPbk9yQmVmb3JlO1xyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyOlxyXG4gKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0XHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCwgZGF5KSB7XHJcbiAgICAvLyByZWx5IG9uIHllYXIvbW9udGggdmFsaWRhdGlvbiBpbiBmaXJzdFdlZWtEYXlPZk1vbnRoXHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihkYXkpICYmIGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiQXJndW1lbnQuRGF5XCIsIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuICAgIHZhciBmaXJzdFRodXJzZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcbiAgICB2YXIgZmlyc3RNb25kYXkgPSBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XHJcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuICAgIGlmIChkYXkgPCBmaXJzdE1vbmRheSkge1xyXG4gICAgICAgIGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuICAgICAgICAgICAgLy8gV2VlayAxXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcbiAgICAgICAgICAgIGlmIChtb250aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vIERlZmF1bHQgY2FzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlZWtPZk1vbnRoKHllYXIsIG1vbnRoIC0gMSwgZGF5c0luTW9udGgoeWVhciwgbW9udGggLSAxKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBKYW51YXJ5XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2Vla09mTW9udGgoeWVhciAtIDEsIDEyLCAzMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG4gICAgdmFyIGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcbiAgICAvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcclxuICAgIGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xyXG4gICAgICAgIGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XHJcbiAgICAgICAgICAgIC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIE5vcm1hbCBjYXNlXHJcbiAgICB2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xyXG4gICAgaWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydHMud2Vla09mTW9udGggPSB3ZWVrT2ZNb250aDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi15ZWFyIG9mIHRoZSBNb25kYXkgb2Ygd2VlayAxIGluIHRoZSBnaXZlbiB5ZWFyLlxyXG4gKiBOb3RlIHRoYXQgdGhlIHJlc3VsdCBtYXkgbGllIGluIHRoZSBwcmV2aW91cyB5ZWFyLCBpbiB3aGljaCBjYXNlIGl0XHJcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXIgKG5vbi1pbnRlZ2VyKVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKSB7XHJcbiAgICAvLyByZWxheSBvbiB3ZWVrRGF5T25PckFmdGVyIGZvciB5ZWFyIHZhbGlkYXRpb25cclxuICAgIC8vIGZpcnN0IG1vbmRheSBvZiBKYW51YXJ5LCBtaW51cyBvbmUgYmVjYXVzZSB3ZSB3YW50IGRheS1vZi15ZWFyXHJcbiAgICB2YXIgcmVzdWx0ID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xyXG4gICAgaWYgKHJlc3VsdCA+IDMpIHsgLy8gZ3JlYXRlciB0aGFuIGphbiA0dGhcclxuICAgICAgICByZXN1bHQgLT0gNztcclxuICAgICAgICBpZiAocmVzdWx0IDwgMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG4gKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5ODhcclxuICogQHBhcmFtIG1vbnRoXHRNb250aCAxLTEyXHJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgMS01M1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuWWVhciBmb3IgaW52YWxpZCB5ZWFyIChub24taW50ZWdlcilcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqL1xyXG5mdW5jdGlvbiB3ZWVrTnVtYmVyKHllYXIsIG1vbnRoLCBkYXkpIHtcclxuICAgIHZhciBkb3kgPSBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSk7XHJcbiAgICAvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcclxuICAgIGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcclxuICAgICAgICB2YXIgbmV4dFllYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyICsgMSk7XHJcbiAgICAgICAgaWYgKG5leHRZZWFyV2Vla09uZSA+IDQgJiYgbmV4dFllYXJXZWVrT25lIDw9IGRveSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxyXG4gICAgdmFyIHRoaXNZZWFyV2Vla09uZSA9IGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcik7XHJcbiAgICBpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xyXG4gICAgICAgIC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXHJcbiAgICAgICAgdmFyIHdlZWtUd28gPSB0aGlzWWVhcldlZWtPbmUgKyA3IC0gZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcbiAgICAgICAgaWYgKGRveSA8IHdlZWtUd28pIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gV2VlayAxIGlzIGVudGlyZWx5IGluc2lkZSB0aGlzIHllYXIuXHJcbiAgICBpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XHJcbiAgICAgICAgLy8gVGhlIGRhdGUgaXMgcGFydCBvZiB0aGUgbGFzdCB3ZWVrIG9mIHByZXYgeWVhci5cclxuICAgICAgICByZXR1cm4gd2Vla051bWJlcih5ZWFyIC0gMSwgMTIsIDMxKTtcclxuICAgIH1cclxuICAgIC8vIG5vcm1hbCBjYXNlczsgbm90ZSB0aGF0IHdlZWsgbnVtYmVycyBzdGFydCBmcm9tIDEgc28gKzFcclxuICAgIHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB0aGlzWWVhcldlZWtPbmUpIC8gNykgKyAxO1xyXG59XHJcbmV4cG9ydHMud2Vla051bWJlciA9IHdlZWtOdW1iZXI7XHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Vbml4TWlsbGlzIGZvciBub24taW50ZWdlciBgdW5peE1pbGxpc2AgcGFyYW1ldGVyXHJcbiAqL1xyXG5mdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKSB7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih1bml4TWlsbGlzKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwidW5peE1pbGxpcyBzaG91bGQgYmUgYW4gaW50ZWdlciBudW1iZXJcIik7XHJcbiAgICB2YXIgdGVtcCA9IHVuaXhNaWxsaXM7XHJcbiAgICB2YXIgcmVzdWx0ID0geyB5ZWFyOiAwLCBtb250aDogMCwgZGF5OiAwLCBob3VyOiAwLCBtaW51dGU6IDAsIHNlY29uZDogMCwgbWlsbGk6IDAgfTtcclxuICAgIHZhciB5ZWFyO1xyXG4gICAgdmFyIG1vbnRoO1xyXG4gICAgaWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG4gICAgICAgIHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xyXG4gICAgICAgIHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG4gICAgICAgIHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcbiAgICAgICAgdGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcclxuICAgICAgICB5ZWFyID0gMTk3MDtcclxuICAgICAgICB3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XHJcbiAgICAgICAgICAgIHRlbXAgLT0gZGF5c0luWWVhcih5ZWFyKTtcclxuICAgICAgICAgICAgeWVhcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQueWVhciA9IHllYXI7XHJcbiAgICAgICAgbW9udGggPSAxO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wID49IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xyXG4gICAgICAgICAgICB0ZW1wIC09IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuICAgICAgICAgICAgbW9udGgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcbiAgICAgICAgcmVzdWx0LmRheSA9IHRlbXAgKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxyXG4gICAgICAgIC8vIFdlIG1ha2UgaXQgcG9zaXRpdmUgYnkgYWRkaW5nIHRoZSBtb2R1bG8uXHJcbiAgICAgICAgcmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcbiAgICAgICAgcmVzdWx0LnNlY29uZCA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcbiAgICAgICAgcmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcbiAgICAgICAgcmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcclxuICAgICAgICB0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG4gICAgICAgIHllYXIgPSAxOTY5O1xyXG4gICAgICAgIHdoaWxlICh0ZW1wIDwgLWRheXNJblllYXIoeWVhcikpIHtcclxuICAgICAgICAgICAgdGVtcCArPSBkYXlzSW5ZZWFyKHllYXIpO1xyXG4gICAgICAgICAgICB5ZWFyLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC55ZWFyID0geWVhcjtcclxuICAgICAgICBtb250aCA9IDEyO1xyXG4gICAgICAgIHdoaWxlICh0ZW1wIDwgLWRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xyXG4gICAgICAgICAgICB0ZW1wICs9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuICAgICAgICAgICAgbW9udGgtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcbiAgICAgICAgcmVzdWx0LmRheSA9IHRlbXAgKyAxICsgZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5leHBvcnRzLnVuaXhUb1RpbWVOb0xlYXBTZWNzID0gdW5peFRvVGltZU5vTGVhcFNlY3M7XHJcbi8qKlxyXG4gKiBGaWxsIHlvdSBhbnkgbWlzc2luZyB0aW1lIGNvbXBvbmVudCBwYXJ0cywgZGVmYXVsdHMgYXJlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ZZWFyIGZvciBpbnZhbGlkIHllYXJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EYXkgZm9yIGludmFsaWQgZGF5IG9mIG1vbnRoXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Ib3VyIGZvciBpbnZhbGlkIGhvdXJcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbnV0ZSBmb3IgaW52YWxpZCBtaW51dGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlNlY29uZCBmb3IgaW52YWxpZCBzZWNvbmRcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbGxpIGZvciBpbnZhbGlkIG1pbGxpc2Vjb25kc1xyXG4gKi9cclxuZnVuY3Rpb24gbm9ybWFsaXplVGltZUNvbXBvbmVudHMoY29tcG9uZW50cykge1xyXG4gICAgdmFyIGlucHV0ID0ge1xyXG4gICAgICAgIHllYXI6IHR5cGVvZiBjb21wb25lbnRzLnllYXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLnllYXIgOiAxOTcwLFxyXG4gICAgICAgIG1vbnRoOiB0eXBlb2YgY29tcG9uZW50cy5tb250aCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubW9udGggOiAxLFxyXG4gICAgICAgIGRheTogdHlwZW9mIGNvbXBvbmVudHMuZGF5ID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5kYXkgOiAxLFxyXG4gICAgICAgIGhvdXI6IHR5cGVvZiBjb21wb25lbnRzLmhvdXIgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLmhvdXIgOiAwLFxyXG4gICAgICAgIG1pbnV0ZTogdHlwZW9mIGNvbXBvbmVudHMubWludXRlID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5taW51dGUgOiAwLFxyXG4gICAgICAgIHNlY29uZDogdHlwZW9mIGNvbXBvbmVudHMuc2Vjb25kID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5zZWNvbmQgOiAwLFxyXG4gICAgICAgIG1pbGxpOiB0eXBlb2YgY29tcG9uZW50cy5taWxsaSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWlsbGkgOiAwLFxyXG4gICAgfTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGlucHV0LnllYXIpLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJpbnZhbGlkIHllYXIgJWRcIiwgaW5wdXQueWVhcik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5tb250aCkgJiYgaW5wdXQubW9udGggPj0gMSAmJiBpbnB1dC5tb250aCA8PSAxMiwgXCJBcmd1bWVudC5Nb250aFwiLCBcImludmFsaWQgbW9udGggJWRcIiwgaW5wdXQubW9udGgpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoaW5wdXQuZGF5KSAmJiBpbnB1dC5kYXkgPj0gMSAmJiBpbnB1dC5kYXkgPD0gZGF5c0luTW9udGgoaW5wdXQueWVhciwgaW5wdXQubW9udGgpLCBcIkFyZ3VtZW50LkRheVwiLCBcImludmFsaWQgZGF5ICVkXCIsIGlucHV0LmRheSk7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5ob3VyKSAmJiBpbnB1dC5ob3VyID49IDAgJiYgaW5wdXQuaG91ciA8PSAyMywgXCJBcmd1bWVudC5Ib3VyXCIsIFwiaW52YWxpZCBob3VyICVkXCIsIGlucHV0LmhvdXIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoaW5wdXQubWludXRlKSAmJiBpbnB1dC5taW51dGUgPj0gMCAmJiBpbnB1dC5taW51dGUgPD0gNTksIFwiQXJndW1lbnQuTWludXRlXCIsIFwiaW52YWxpZCBtaW51dGUgJWRcIiwgaW5wdXQubWludXRlKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGlucHV0LnNlY29uZCkgJiYgaW5wdXQuc2Vjb25kID49IDAgJiYgaW5wdXQuc2Vjb25kIDw9IDU5LCBcIkFyZ3VtZW50LlNlY29uZFwiLCBcImludmFsaWQgc2Vjb25kICVkXCIsIGlucHV0LnNlY29uZCk7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihpbnB1dC5taWxsaSkgJiYgaW5wdXQubWlsbGkgPj0gMCAmJiBpbnB1dC5taWxsaSA8PSA5OTksIFwiQXJndW1lbnQuTWlsbGlcIiwgXCJpbnZhbGlkIG1pbGxpICVkXCIsIGlucHV0Lm1pbGxpKTtcclxuICAgIHJldHVybiBpbnB1dDtcclxufVxyXG5mdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2VjcyhhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgIHZhciBjb21wb25lbnRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9IDogYSk7XHJcbiAgICB2YXIgaW5wdXQgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcclxuICAgIHJldHVybiBpbnB1dC5taWxsaSArIDEwMDAgKiAoaW5wdXQuc2Vjb25kICsgaW5wdXQubWludXRlICogNjAgKyBpbnB1dC5ob3VyICogMzYwMCArIGRheU9mWWVhcihpbnB1dC55ZWFyLCBpbnB1dC5tb250aCwgaW5wdXQuZGF5KSAqIDg2NDAwICtcclxuICAgICAgICAoaW5wdXQueWVhciAtIDE5NzApICogMzE1MzYwMDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTk2OSkgLyA0KSAqIDg2NDAwIC1cclxuICAgICAgICBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKChpbnB1dC55ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xyXG59XHJcbmV4cG9ydHMudGltZVRvVW5peE5vTGVhcFNlY3MgPSB0aW1lVG9Vbml4Tm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIFJldHVybiB0aGUgZGF5LW9mLXdlZWsuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuVW5peE1pbGxpcyBmb3IgaW52YWxpZCBgdW5peE1pbGxpc2AgYXJndW1lbnRcclxuICovXHJcbmZ1bmN0aW9uIHdlZWtEYXlOb0xlYXBTZWNzKHVuaXhNaWxsaXMpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHVuaXhNaWxsaXMpLCBcIkFyZ3VtZW50LlVuaXhNaWxsaXNcIiwgXCJ1bml4TWlsbGlzIHNob3VsZCBiZSBhbiBpbnRlZ2VyIG51bWJlclwiKTtcclxuICAgIHZhciBlcG9jaERheSA9IFdlZWtEYXkuVGh1cnNkYXk7XHJcbiAgICB2YXIgZGF5cyA9IE1hdGguZmxvb3IodW5peE1pbGxpcyAvIDEwMDAgLyA4NjQwMCk7XHJcbiAgICByZXR1cm4gbWF0aC5wb3NpdGl2ZU1vZHVsbyhlcG9jaERheSArIGRheXMsIDcpO1xyXG59XHJcbmV4cG9ydHMud2Vla0RheU5vTGVhcFNlY3MgPSB3ZWVrRGF5Tm9MZWFwU2VjcztcclxuLyoqXHJcbiAqIE4tdGggc2Vjb25kIGluIHRoZSBkYXksIGNvdW50aW5nIGZyb20gMFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBmb3IgaW52YWxpZCBob3VyXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaW51dGUgZm9yIGludmFsaWQgbWludXRlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgZm9yIGludmFsaWQgc2Vjb25kXHJcbiAqL1xyXG5mdW5jdGlvbiBzZWNvbmRPZkRheShob3VyLCBtaW51dGUsIHNlY29uZCkge1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoaG91cikgJiYgaG91ciA+PSAwICYmIGhvdXIgPD0gMjMsIFwiQXJndW1lbnQuSG91clwiLCBcImludmFsaWQgaG91ciAlZFwiLCBob3VyKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKG1pbnV0ZSkgJiYgbWludXRlID49IDAgJiYgbWludXRlIDw9IDU5LCBcIkFyZ3VtZW50Lk1pbnV0ZVwiLCBcImludmFsaWQgbWludXRlICVkXCIsIG1pbnV0ZSk7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihzZWNvbmQpICYmIHNlY29uZCA+PSAwICYmIHNlY29uZCA8PSA2MSwgXCJBcmd1bWVudC5TZWNvbmRcIiwgXCJpbnZhbGlkIHNlY29uZCAlZFwiLCBzZWNvbmQpO1xyXG4gICAgcmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xyXG59XHJcbmV4cG9ydHMuc2Vjb25kT2ZEYXkgPSBzZWNvbmRPZkRheTtcclxuLyoqXHJcbiAqIEJhc2ljIHJlcHJlc2VudGF0aW9uIG9mIGEgZGF0ZSBhbmQgdGltZVxyXG4gKi9cclxudmFyIFRpbWVTdHJ1Y3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRpbWVTdHJ1Y3QoYSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcihhKSwgXCJBcmd1bWVudC5Vbml4TWlsbGlzXCIsIFwiaW52YWxpZCB1bml4IG1pbGxpcyAlZFwiLCBhKTtcclxuICAgICAgICAgICAgdGhpcy5fdW5peE1pbGxpcyA9IGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodHlwZW9mIGEgPT09IFwib2JqZWN0XCIgJiYgYSAhPT0gbnVsbCwgXCJBcmd1bWVudC5Db21wb25lbnRzXCIsIFwiaW52YWxpZCBjb21wb25lbnRzIG9iamVjdFwiKTtcclxuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIFRpbWVTdHJ1Y3QgZnJvbSB0aGUgZ2l2ZW4geWVhciwgbW9udGgsIGRheSBldGNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuICAgICAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxyXG4gICAgICogQHBhcmFtIGRheVx0RGF5IDEtMzFcclxuICAgICAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuICAgICAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XHJcbiAgICAgKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxyXG4gICAgICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlllYXIgZm9yIGludmFsaWQgeWVhclxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1vbnRoIGZvciBpbnZhbGlkIG1vbnRoXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRGF5IGZvciBpbnZhbGlkIGRheSBvZiBtb250aFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkhvdXIgZm9yIGludmFsaWQgaG91clxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50Lk1pbnV0ZSBmb3IgaW52YWxpZCBtaW51dGVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgZm9yIGludmFsaWQgc2Vjb25kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWlsbGkgZm9yIGludmFsaWQgbWlsbGlzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QuZnJvbUNvbXBvbmVudHMgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBudW1iZXIgb2YgdW5peCBtaWxsaXNlY29uZHNcclxuICAgICAqIChiYWNrd2FyZCBjb21wYXRpYmlsaXR5KVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LlVuaXhNaWxsaXMgZm9yIG5vbi1pbnRlZ2VyIG1pbGxpc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21Vbml4ID0gZnVuY3Rpb24gKHVuaXhNaWxsaXMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZFx0VGhlIGRhdGVcclxuICAgICAqIEBwYXJhbSBkZiBXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LmZyb21EYXRlID0gZnVuY3Rpb24gKGQsIGRmKSB7XHJcbiAgICAgICAgaWYgKGRmID09PSBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0RnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0TW9udGgoKSArIDEsIGRheTogZC5nZXREYXRlKCksXHJcbiAgICAgICAgICAgICAgICBob3VyOiBkLmdldEhvdXJzKCksIG1pbnV0ZTogZC5nZXRNaW51dGVzKCksIHNlY29uZDogZC5nZXRTZWNvbmRzKCksIG1pbGxpOiBkLmdldE1pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcclxuICAgICAgICAgICAgICAgIHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXHJcbiAgICAgICAgICAgICAgICBob3VyOiBkLmdldFVUQ0hvdXJzKCksIG1pbnV0ZTogZC5nZXRVVENNaW51dGVzKCksIHNlY29uZDogZC5nZXRVVENTZWNvbmRzKCksIG1pbGxpOiBkLmdldFVUQ01pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuUyBpZiBgc2AgaXMgbm90IGEgcHJvcGVyIGlzbyBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5mcm9tU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgeWVhciA9IDE5NzA7XHJcbiAgICAgICAgICAgIHZhciBtb250aCA9IDE7XHJcbiAgICAgICAgICAgIHZhciBkYXkgPSAxO1xyXG4gICAgICAgICAgICB2YXIgaG91ciA9IDA7XHJcbiAgICAgICAgICAgIHZhciBtaW51dGUgPSAwO1xyXG4gICAgICAgICAgICB2YXIgc2Vjb25kID0gMDtcclxuICAgICAgICAgICAgdmFyIGZyYWN0aW9uTWlsbGlzID0gMDtcclxuICAgICAgICAgICAgdmFyIGxhc3RVbml0ID0gVGltZVVuaXQuWWVhcjtcclxuICAgICAgICAgICAgLy8gc2VwYXJhdGUgYW55IGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICB2YXIgc3BsaXQgPSBzLnRyaW0oKS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJBcmd1bWVudC5TXCIsIFwiRW1wdHkgc3RyaW5nIG9yIG11bHRpcGxlIGRvdHMuXCIpO1xyXG4gICAgICAgICAgICAvLyBwYXJzZSBtYWluIHBhcnRcclxuICAgICAgICAgICAgdmFyIGlzQmFzaWNGb3JtYXQgPSAocy5pbmRleE9mKFwiLVwiKSA9PT0gLTEpO1xyXG4gICAgICAgICAgICBpZiAoaXNCYXNpY0Zvcm1hdCkge1xyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHNwbGl0WzBdLm1hdGNoKC9eKChcXGQpKyl8KFxcZFxcZFxcZFxcZFxcZFxcZFxcZFxcZFQoXFxkKSspJC8pLCBcIkFyZ3VtZW50LlNcIiwgXCJJU08gc3RyaW5nIGluIGJhc2ljIG5vdGF0aW9uIG1heSBvbmx5IGNvbnRhaW4gbnVtYmVycyBiZWZvcmUgdGhlIGZyYWN0aW9uYWwgcGFydFwiKTtcclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBhbnkgXCJUXCIgc2VwYXJhdG9yXHJcbiAgICAgICAgICAgICAgICBzcGxpdFswXSA9IHNwbGl0WzBdLnJlcGxhY2UoXCJUXCIsIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLCBcIkFyZ3VtZW50LlNcIiwgXCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMCwgNCksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcclxuICAgICAgICAgICAgICAgICAgICBtb250aCA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig0LCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGRheSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig2LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTApIHtcclxuICAgICAgICAgICAgICAgICAgICBob3VyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDgsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMCwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWNvbmQgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTIsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoc3BsaXRbMF0ubWF0Y2goL15cXGRcXGRcXGRcXGQoLVxcZFxcZC1cXGRcXGQoKFQpP1xcZFxcZChcXDpcXGRcXGQoOlxcZFxcZCk/KT8pPyk/JC8pLCBcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIElTTyBzdHJpbmdcIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0ZUFuZFRpbWUgPSBbXTtcclxuICAgICAgICAgICAgICAgIGlmIChzLmluZGV4T2YoXCJUXCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVBbmRUaW1lID0gc3BsaXRbMF0uc3BsaXQoXCJUXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLnN1YnN0cigwLCAxMCksIHNwbGl0WzBdLnN1YnN0cigxMCldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0sIFwiXCJdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSwgXCJBcmd1bWVudC5TXCIsIFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSAxMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vbnRoID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDUsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuSG91cjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gcGFyc2UgZnJhY3Rpb25hbCBwYXJ0XHJcbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxICYmIHNwbGl0WzFdLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBmcmFjdGlvbiA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChsYXN0VW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25NaWxsaXMgPSBkYXlzSW5ZZWFyKHllYXIpICogODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gNjAwMDAgKiBmcmFjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBUaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxyXG4gICAgICAgICAgICB5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuICAgICAgICAgICAgbW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuICAgICAgICAgICAgZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG4gICAgICAgICAgICBob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuICAgICAgICAgICAgbWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG4gICAgICAgICAgICBzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcbiAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoeyB5ZWFyOiB5ZWFyLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQgfSk7XHJcbiAgICAgICAgICAgIHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFtcclxuICAgICAgICAgICAgICAgIFwiQXJndW1lbnQuU1wiLCBcIkFyZ3VtZW50LlllYXJcIiwgXCJBcmd1bWVudC5Nb250aFwiLCBcIkFyZ3VtZW50LkRheVwiLCBcIkFyZ3VtZW50LkhvdXJcIixcclxuICAgICAgICAgICAgICAgIFwiQXJndW1lbnQuTWludXRlXCIsIFwiQXJndW1lbnQuU2Vjb25kXCIsIFwiQXJndW1lbnQuTWlsbGlcIlxyXG4gICAgICAgICAgICBdKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgSVNPIDg2MDEgc3RyaW5nOiBcXFwiJXNcXFwiOiAlc1wiLCBzLCBlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTsgLy8gcHJvZ3JhbW1pbmcgZXJyb3JcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwidW5peE1pbGxpc1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl91bml4TWlsbGlzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VuaXhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0aGlzLl9jb21wb25lbnRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdW5peE1pbGxpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwiY29tcG9uZW50c1wiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJ5ZWFyXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy55ZWFyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJtb250aFwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGg7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcImRheVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZGF5O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJob3VyXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5ob3VyO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShUaW1lU3RydWN0LnByb3RvdHlwZSwgXCJtaW51dGVcIiwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVGltZVN0cnVjdC5wcm90b3R5cGUsIFwic2Vjb25kXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5zZWNvbmQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRpbWVTdHJ1Y3QucHJvdG90eXBlLCBcIm1pbGxpXCIsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5taWxsaTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnllYXJEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGRheU9mWWVhcih0aGlzLmNvbXBvbmVudHMueWVhciwgdGhpcy5jb21wb25lbnRzLm1vbnRoLCB0aGlzLmNvbXBvbmVudHMuZGF5KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEVxdWFsaXR5IGZ1bmN0aW9uXHJcbiAgICAgKiBAcGFyYW0gb3RoZXJcclxuICAgICAqIEB0aHJvd3MgVHlwZUVycm9yIGlmIG90aGVyIGlzIG5vdCBhbiBPYmplY3RcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVN0cnVjdC5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl91bml4TWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZSBhIHRpbWVzdGFtcC4gRmlsdGVycyBvdXQgbm9uLWV4aXN0aW5nIHZhbHVlcyBmb3IgYWxsIHRpbWUgY29tcG9uZW50c1xyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHRpbWVzdGFtcCBpcyB2YWxpZFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVTdHJ1Y3QucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGggPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMubW9udGggPD0gMTJcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMuZGF5IDw9IGRheXNJbk1vbnRoKHRoaXMuY29tcG9uZW50cy55ZWFyLCB0aGlzLmNvbXBvbmVudHMubW9udGgpXHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5ob3VyIDw9IDIzXHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLmNvbXBvbmVudHMubWludXRlID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA8PSA1OVxyXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5zZWNvbmQgPD0gNTlcclxuICAgICAgICAgICAgICAgICYmIHRoaXMuY29tcG9uZW50cy5taWxsaSA+PSAwICYmIHRoaXMuY29tcG9uZW50cy5taWxsaSA8PSA5OTk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJU08gODYwMSBzdHJpbmcgWVlZWS1NTS1ERFRoaDptbTpzcy5ubm5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lU3RydWN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLmRheS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcbiAgICAgICAgICAgICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG4gICAgICAgICAgICArIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5zZWNvbmQudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuICAgICAgICAgICAgKyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFRpbWVTdHJ1Y3Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVGltZVN0cnVjdCA9IFRpbWVTdHJ1Y3Q7XHJcbi8qKlxyXG4gKiBCaW5hcnkgc2VhcmNoXHJcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcclxuICogQHBhcmFtIGNvbXBhcmUgRnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIDwgMCBpZiBnaXZlbiBlbGVtZW50IGlzIGxlc3MgdGhhbiBzZWFyY2hlZCBlbGVtZW50IGV0Y1xyXG4gKiBAcmV0dXJucyBUaGUgaW5zZXJ0aW9uIGluZGV4IG9mIHRoZSBlbGVtZW50IHRvIGxvb2sgZm9yXHJcbiAqIEB0aHJvd3MgVHlwZUVycm9yIGlmIGFyciBpcyBub3QgYW4gYXJyYXlcclxuICogQHRocm93cyB3aGF0ZXZlciBgY29tcGFyZSgpYCB0aHJvd3NcclxuICovXHJcbmZ1bmN0aW9uIGJpbmFyeUluc2VydGlvbkluZGV4KGFyciwgY29tcGFyZSkge1xyXG4gICAgdmFyIG1pbkluZGV4ID0gMDtcclxuICAgIHZhciBtYXhJbmRleCA9IGFyci5sZW5ndGggLSAxO1xyXG4gICAgdmFyIGN1cnJlbnRJbmRleDtcclxuICAgIHZhciBjdXJyZW50RWxlbWVudDtcclxuICAgIC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcclxuICAgIGlmICghYXJyKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgLy8gb3V0IG9mIGJvdW5kc1xyXG4gICAgaWYgKGNvbXBhcmUoYXJyWzBdKSA+IDApIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmIChjb21wYXJlKGFyclttYXhJbmRleF0pIDwgMCkge1xyXG4gICAgICAgIHJldHVybiBtYXhJbmRleCArIDE7XHJcbiAgICB9XHJcbiAgICAvLyBlbGVtZW50IGluIHJhbmdlXHJcbiAgICB3aGlsZSAobWluSW5kZXggPD0gbWF4SW5kZXgpIHtcclxuICAgICAgICBjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xyXG4gICAgICAgIGN1cnJlbnRFbGVtZW50ID0gYXJyW2N1cnJlbnRJbmRleF07XHJcbiAgICAgICAgaWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpIDwgMCkge1xyXG4gICAgICAgICAgICBtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpID4gMCkge1xyXG4gICAgICAgICAgICBtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudEluZGV4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBtYXhJbmRleDtcclxufVxyXG5leHBvcnRzLmJpbmFyeUluc2VydGlvbkluZGV4ID0gYmluYXJ5SW5zZXJ0aW9uSW5kZXg7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJhc2ljcy5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLmlzRGF0ZVRpbWUgPSBleHBvcnRzLkRhdGVUaW1lID0gZXhwb3J0cy5ub3cgPSBleHBvcnRzLm5vd1V0YyA9IGV4cG9ydHMubm93TG9jYWwgPSB2b2lkIDA7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG52YXIgZm9ybWF0ID0gcmVxdWlyZShcIi4vZm9ybWF0XCIpO1xyXG52YXIgamF2YXNjcmlwdF8xID0gcmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKTtcclxudmFyIG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xyXG52YXIgcGFyc2VGdW5jcyA9IHJlcXVpcmUoXCIuL3BhcnNlXCIpO1xyXG52YXIgdGltZXNvdXJjZV8xID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBub3dMb2NhbCgpIHtcclxuICAgIHJldHVybiBEYXRlVGltZS5ub3dMb2NhbCgpO1xyXG59XHJcbmV4cG9ydHMubm93TG9jYWwgPSBub3dMb2NhbDtcclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gKi9cclxuZnVuY3Rpb24gbm93VXRjKCkge1xyXG4gICAgcmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xyXG59XHJcbmV4cG9ydHMubm93VXRjID0gbm93VXRjO1xyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gKi9cclxuZnVuY3Rpb24gbm93KHRpbWVab25lKSB7XHJcbiAgICBpZiAodGltZVpvbmUgPT09IHZvaWQgMCkgeyB0aW1lWm9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCk7IH1cclxuICAgIHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcbmV4cG9ydHMubm93ID0gbm93O1xyXG4vKipcclxuICpcclxuICogQHBhcmFtIGxvY2FsVGltZVxyXG4gKiBAcGFyYW0gZnJvbVpvbmVcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lLCBmcm9tWm9uZSkge1xyXG4gICAgaWYgKGZyb21ab25lKSB7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IGZyb21ab25lLm9mZnNldEZvclpvbmUobG9jYWxUaW1lKTtcclxuICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lLnVuaXhNaWxsaXMgLSBvZmZzZXQgKiA2MDAwMCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbG9jYWxUaW1lLmNsb25lKCk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB1dGNUaW1lXHJcbiAqIEBwYXJhbSB0b1pvbmVcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBjb252ZXJ0RnJvbVV0Yyh1dGNUaW1lLCB0b1pvbmUpIHtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXHJcbiAgICBpZiAodG9ab25lKSB7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IHRvWm9uZS5vZmZzZXRGb3JVdGModXRjVGltZSk7XHJcbiAgICAgICAgcmV0dXJuIHRvWm9uZS5ub3JtYWxpemVab25lVGltZShuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lLnVuaXhNaWxsaXMgKyBvZmZzZXQgKiA2MDAwMCkpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxudmFyIERhdGVUaW1lID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgQHNlZSBvdmVycmlkZXNcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRGF0ZVRpbWUoYTEsIGEyLCBhMywgaCwgbSwgcywgbXMsIHRpbWVab25lKSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmtpbmQgPSBcIkRhdGVUaW1lXCI7XHJcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgKGExKSkge1xyXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMiAhPT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEzXCIsIFwiZm9yIHVuaXggdGltZXN0YW1wIGRhdGV0aW1lIGNvbnN0cnVjdG9yLCB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBzZWNvbmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVuaXggdGltZXN0YW1wIGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZShhMikgPyBhMiA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bml4TWlsbGlzID0gKDAsIGVycm9yXzEuY29udmVydEVycm9yKShcIkFyZ3VtZW50LlVuaXhNaWxsaXNcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShhMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHVuaXhNaWxsaXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodW5peE1pbGxpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJBcmd1bWVudC5ZZWFyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkFyZ3VtZW50Lk1vbnRoXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IGRheSB0byBiZSBhIG51bWJlci5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aW1lWm9uZSA9PT0gdW5kZWZpbmVkIHx8IHRpbWVab25lID09PSBudWxsIHx8IGlzVGltZVpvbmUodGltZVpvbmUpLCBcIkFyZ3VtZW50LlRpbWVab25lXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZWlnaHRoIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeWVhcl8xID0gYTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb250aF8xID0gYTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXlfMSA9IGEzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaG91cl8xID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaW51dGVfMSA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kXzEgPSAodHlwZW9mIChzKSA9PT0gXCJudW1iZXJcIiA/IHMgOiAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1pbGxpXzEgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyXzEgPSAoMCwgZXJyb3JfMS5jb252ZXJ0RXJyb3IpKFwiQXJndW1lbnQuWWVhclwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKHllYXJfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aF8xID0gKDAsIGVycm9yXzEuY29udmVydEVycm9yKShcIkFyZ3VtZW50Lk1vbnRoXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0obW9udGhfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXlfMSA9ICgwLCBlcnJvcl8xLmNvbnZlcnRFcnJvcikoXCJBcmd1bWVudC5EYXlcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShkYXlfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3VyXzEgPSAoMCwgZXJyb3JfMS5jb252ZXJ0RXJyb3IpKFwiQXJndW1lbnQuSG91clwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRoLnJvdW5kU3ltKGhvdXJfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGVfMSA9ICgwLCBlcnJvcl8xLmNvbnZlcnRFcnJvcikoXCJBcmd1bWVudC5NaW51dGVcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShtaW51dGVfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRfMSA9ICgwLCBlcnJvcl8xLmNvbnZlcnRFcnJvcikoXCJBcmd1bWVudC5TZWNvbmRcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aC5yb3VuZFN5bShzZWNvbmRfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWxsaV8xID0gKDAsIGVycm9yXzEuY29udmVydEVycm9yKShcIkFyZ3VtZW50Lk1pbGxpXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGgucm91bmRTeW0obWlsbGlfMSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG0gPSBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh7IHllYXI6IHllYXJfMSwgbW9udGg6IG1vbnRoXzEsIGRheTogZGF5XzEsIGhvdXI6IGhvdXJfMSwgbWludXRlOiBtaW51dGVfMSwgc2Vjb25kOiBzZWNvbmRfMSwgbWlsbGk6IG1pbGxpXzEgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZSh0aW1lWm9uZSkgPyB0aW1lWm9uZSA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodG0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB0bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhMiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCwgXCJBcmd1bWVudC5BNFwiLCBcImZpcnN0IHR3byBhcmd1bWVudHMgYXJlIGEgc3RyaW5nLCB0aGVyZWZvcmUgdGhlIGZvdXJ0aCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEzID09PSB1bmRlZmluZWQgfHwgYTMgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMyksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aGlyZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9ybWF0IHN0cmluZyBnaXZlblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0ZVN0cmluZyA9IGExO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9ybWF0U3RyaW5nID0gYTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB6b25lID0gdm9pZCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGEzID09PSBcIm9iamVjdFwiICYmIGlzVGltZVpvbmUoYTMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b25lID0gKGEzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShkYXRlU3RyaW5nLCBmb3JtYXRTdHJpbmcsIHpvbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHBhcnNlZC50aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gcGFyc2VkLnpvbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEzXCIsIFwiZmlyc3QgYXJndW1lbnRzIGlzIGEgc3RyaW5nIGFuZCB0aGUgc2Vjb25kIGlzIG5vdCwgdGhlcmVmb3JlIHRoZSB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBzZWNvbmQgYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaXZlblN0cmluZyA9IGExLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNzID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShzcy5sZW5ndGggPT09IDIsIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNUaW1lWm9uZShhMikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChzc1sxXS50cmltKCkgPyB0aW1lem9uZV8xLlRpbWVab25lLnpvbmUoc3NbMV0pIDogdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGZyZWUgb2YgRGF0ZSBxdWlya3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tU3RyaW5nKHNzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChhMSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsIFwiQXJndW1lbnQuQTRcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBhIERhdGUsIHRoZXJlZm9yZSB0aGUgZm91cnRoIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIgJiYgKGEyID09PSBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQgfHwgYTIgPT09IGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQyksIFwiQXJndW1lbnQuR2V0RnVuY3NcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoYTMgPT09IHVuZGVmaW5lZCB8fCBhMyA9PT0gbnVsbCB8fCBpc1RpbWVab25lKGEzKSwgXCJBcmd1bWVudC5UaW1lWm9uZVwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRoaXJkIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IChhMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkayA9IChhMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmUgPSAoYTMgPyBhMyA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgeyAvLyBhMSBpbnN0YW5jZW9mIFRpbWVTdHJ1Y3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCwgXCJBcmd1bWVudC5BM1wiLCBcImZpcnN0IGFyZ3VtZW50IGlzIGEgVGltZVN0cnVjdCwgdGhlcmVmb3JlIHRoZSB0aGlyZCB0aHJvdWdoIDh0aCBhcmd1bWVudCBtdXN0IGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiQXJndW1lbnQuVGltZVpvbmVcIiwgXCJleHBlY3QgYSBUaW1lWm9uZSBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gYTEuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IChhMiA/IGEyIDogdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShhMiA9PT0gdW5kZWZpbmVkICYmIGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLCBcIkFyZ3VtZW50LkEyXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgdW5kZWZpbmVkLCB0aGVyZWZvcmUgdGhlIHJlc3QgbXVzdCBhbHNvIGJlIHVuZGVmaW5lZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBub3RoaW5nIGdpdmVuLCBtYWtlIGxvY2FsIGRhdGV0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tRGF0ZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgKDAsIGVycm9yXzEuZXJyb3IpKFwiQXJndW1lbnQuQTFcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwidXRjRGF0ZVwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVVRDIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcbiAgICAgICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fdXRjRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IGNvbnZlcnRUb1V0Yyh0aGlzLl96b25lRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3V0Y0RhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEYXRlVGltZS5wcm90b3R5cGUsIFwiem9uZURhdGVcIiwge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvY2FsIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXHJcbiAgICAgICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZURhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3pvbmVEYXRlID0gY29udmVydEZyb21VdGModGhpcy5fdXRjRGF0ZSwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVEYXRlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fem9uZURhdGUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fdXRjRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5ub3dMb2NhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbiA9IERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShuLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXQsIHRpbWV6b25lXzEuVGltZVpvbmUubG9jYWwoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIFVUQyB0aW1lIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLm5vd1V0YyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIGphdmFzY3JpcHRfMS5EYXRlRnVuY3Rpb25zLkdldFVUQywgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUubm93ID0gZnVuY3Rpb24gKHRpbWVab25lKSB7XHJcbiAgICAgICAgaWYgKHRpbWVab25lID09PSB2b2lkIDApIHsgdGltZVpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpOyB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBqYXZhc2NyaXB0XzEuRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxyXG4gICAgICogaS5lLiBhIGRvdWJsZSByZXByZXNlbnRpbmcgZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcbiAgICAgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuICAgICAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcclxuICAgICAqIEBwYXJhbSB0aW1lWm9uZSBUaW1lIHpvbmUgdG8gYXNzdW1lIHRoYXQgdGhlIGV4Y2VsIHZhbHVlIGlzIGluXHJcbiAgICAgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTiBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5UaW1lWm9uZSBpZiB0aGUgZ2l2ZW4gdGltZSB6b25lIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuZnJvbUV4Y2VsID0gZnVuY3Rpb24gKG4sIHRpbWVab25lKSB7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZShuKSwgXCJBcmd1bWVudC5OXCIsIFwiaW52YWxpZCBudW1iZXJcIik7XHJcbiAgICAgICAgdmFyIHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZGF0ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuICAgICAqIEUuZy4gMjAxNS0wMi0yOSByZXR1cm5zIGZhbHNlIChub3QgYSBsZWFwIHllYXIpXHJcbiAgICAgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXHJcbiAgICAgKiBhbmQgMjAxNS0wNC0zMSByZXR1cm5zIGZhbHNlIChBcHJpbCBoYXMgMzAgZGF5cykuXHJcbiAgICAgKiBCeSBkZWZhdWx0LCBwcmUtMTk3MCBkYXRlcyBhbHNvIHJldHVybiBmYWxzZSBzaW5jZSB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGRvZXMgbm90IGNvbnRhaW4gYWNjdXJhdGUgaW5mb1xyXG4gICAgICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGFsbG93UHJlMTk3MCAob3B0aW9uYWwsIGRlZmF1bHQgZmFsc2UpOiByZXR1cm4gdHJ1ZSBmb3IgcHJlLTE5NzAgZGF0ZXNcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5leGlzdHMgPSBmdW5jdGlvbiAoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lLCBhbGxvd1ByZTE5NzApIHtcclxuICAgICAgICBpZiAobW9udGggPT09IHZvaWQgMCkgeyBtb250aCA9IDE7IH1cclxuICAgICAgICBpZiAoZGF5ID09PSB2b2lkIDApIHsgZGF5ID0gMTsgfVxyXG4gICAgICAgIGlmIChob3VyID09PSB2b2lkIDApIHsgaG91ciA9IDA7IH1cclxuICAgICAgICBpZiAobWludXRlID09PSB2b2lkIDApIHsgbWludXRlID0gMDsgfVxyXG4gICAgICAgIGlmIChzZWNvbmQgPT09IHZvaWQgMCkgeyBzZWNvbmQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG1pbGxpc2Vjb25kID09PSB2b2lkIDApIHsgbWlsbGlzZWNvbmQgPSAwOyB9XHJcbiAgICAgICAgaWYgKGFsbG93UHJlMTk3MCA9PT0gdm9pZCAwKSB7IGFsbG93UHJlMTk3MCA9IGZhbHNlOyB9XHJcbiAgICAgICAgaWYgKCFpc0Zpbml0ZSh5ZWFyKSB8fCAhaXNGaW5pdGUobW9udGgpIHx8ICFpc0Zpbml0ZShkYXkpIHx8ICFpc0Zpbml0ZShob3VyKSB8fCAhaXNGaW5pdGUobWludXRlKSB8fCAhaXNGaW5pdGUoc2Vjb25kKVxyXG4gICAgICAgICAgICB8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFhbGxvd1ByZTE5NzAgJiYgeWVhciA8IDE5NzApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcclxuICAgICAgICAgICAgcmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxyXG4gICAgICAgICAgICAgICAgJiYgaG91ciA9PT0gZHQuaG91cigpICYmIG1pbnV0ZSA9PT0gZHQubWludXRlKCkgJiYgc2Vjb25kID09PSBkdC5zZWNvbmQoKSAmJiBtaWxsaXNlY29uZCA9PT0gZHQubWlsbGlzZWNvbmQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgdGltZSB6b25lIHRoYXQgdGhlIGRhdGUgaXMgaW4uIE1heSBiZSB1bmRlZmluZWQgZm9yIHVuYXdhcmUgZGF0ZXMuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnpvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBab25lIG5hbWUgYWJicmV2aWF0aW9uIGF0IHRoaXMgdGltZVxyXG4gICAgICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG4gICAgICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnpvbmVBYmJyZXZpYXRpb24gPSBmdW5jdGlvbiAoZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fem9uZS5hYmJyZXZpYXRpb25Gb3JVdGModGhpcy51dGNEYXRlLCBkc3REZXBlbmRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm9mZnNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCgodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5vZmZzZXREdXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taWxsaXNlY29uZHMoTWF0aC5yb3VuZCh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMgLSB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcykpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgc3RhbmRhcmQgb2Zmc2V0IFdJVEhPVVQgRFNUIHcuci50LiBVVEMgYXMgYSBEdXJhdGlvbi5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc3RhbmRhcmRPZmZzZXREdXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKHRoaXMuX3pvbmUuc3RhbmRhcmRPZmZzZXRGb3JVdGModGhpcy51dGNEYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy55ZWFyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmRheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBzZWNvbmRzIDAtNTlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLm1pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMubWlsbGk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG4gICAgICogd2VlayBkYXkgbnVtYmVycylcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla0RheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcbiAgICAgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5kYXlPZlllYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuem9uZURhdGUueWVhckRheSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuICAgICAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuICAgICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla051bWJlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuICAgICAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAgICAgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUud2Vla09mTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcbiAgICAgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnNlY29uZE9mRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnVuaXhVdGNNaWxsaXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNZZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy55ZWFyO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjTW9udGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLmRheTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjSG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuaG91cjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtaW51dGVzIDAtNTlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjTWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5taW51dGU7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1NlY29uZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuICAgICAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y0RheU9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIFVUQyBtaWxsaXNlY29uZHMgMC05OTlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudXRjTWlsbGlzZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcbiAgICAgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNXZWVrRGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcbiAgICAgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1dlZWtOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAgICAgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG4gICAgICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnV0Y1dlZWtPZk1vbnRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG4gICAgICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS51dGNTZWNvbmRPZkRheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXHJcbiAgICAgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxyXG4gICAgICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXHJcbiAgICAgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcclxuICAgICAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLndpdGhab25lID0gZnVuY3Rpb24gKHpvbmUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksIHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCksIHpvbmUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0aGlzIGRhdGUgdG8gdGhlIGdpdmVuIHRpbWUgem9uZSAoaW4tcGxhY2UpLlxyXG4gICAgICogQHJldHVybiB0aGlzIChmb3IgY2hhaW5pbmcpXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIHlvdSB0cnkgdG8gY29udmVydCBhIGRhdGV0aW1lIHdpdGhvdXQgYSB6b25lIHRvIGEgZGF0ZXRpbWUgd2l0aCBhIHpvbmVcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAoem9uZSkge1xyXG4gICAgICAgIGlmICh6b25lKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fem9uZSkgeyAvLyBpZi1zdGF0ZW1lbnQgc2F0aXNmaWVzIHRoZSBjb21waWxlclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lID0gem9uZTsgLy8gc3RpbGwgYXNzaWduLCBiZWNhdXNlIHpvbmVzIG1heSBiZSBlcXVhbCBidXQgbm90IGlkZW50aWNhbCAoVVRDL0dNVC8rMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91dGNEYXRlID0gY29udmVydFRvVXRjKHRoaXMuX3pvbmVEYXRlLCB0aGlzLl96b25lKTsgLy8gY2F1c2Ugem9uZSAtPiB1dGMgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fem9uZSA9IHpvbmU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3pvbmVEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl96b25lRGF0ZSA9IGNvbnZlcnRGcm9tVXRjKHRoaXMuX3V0Y0RhdGUsIHRoaXMuX3pvbmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3pvbmUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuICAgICAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxyXG4gICAgICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBpZiB5b3UgcmVhbGx5IG5lZWQgdG8gZG8gdGhhdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgb3IgdW5kZWZpbmVkIHRvIGNyZWF0ZSB1bmF3YXJlIGRhdGUuXHJcbiAgICAgKiBAcmV0dXJuIFRoZSBjb252ZXJ0ZWQgZGF0ZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiB5b3UgdHJ5IHRvIGNvbnZlcnQgYSBuYWl2ZSBkYXRldGltZSB0byBhbiBhd2FyZSBvbmUuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS50b1pvbmUgPSBmdW5jdGlvbiAoem9uZSkge1xyXG4gICAgICAgIGlmICh6b25lKSB7XHJcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl96b25lLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG4gICAgICAgICAgICByZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcclxuICAgICAgICAgICAgcmVzdWx0Ll96b25lID0gem9uZTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy56b25lRGF0ZSwgdW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHRvIEphdmFTY3JpcHQgZGF0ZSB3aXRoIHRoZSB6b25lIHRpbWUgaW4gdGhlIGdldFgoKSBtZXRob2RzLlxyXG4gICAgICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cclxuICAgICAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9EYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSwgdGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cclxuICAgICAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG4gICAgICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXHJcbiAgICAgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgeW91IHRyeSB0byBjb252ZXJ0IGEgbmFpdmUgZGF0ZXRpbWUgdG8gYW4gYXdhcmUgb25lLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9FeGNlbCA9IGZ1bmN0aW9uICh0aW1lWm9uZSkge1xyXG4gICAgICAgIHZhciBkdCA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHRpbWVab25lICYmICghdGhpcy5fem9uZSB8fCAhdGltZVpvbmUuZXF1YWxzKHRoaXMuX3pvbmUpKSkge1xyXG4gICAgICAgICAgICBkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG9mZnNldE1pbGxpcyA9IGR0Lm9mZnNldCgpICogNjAgKiAxMDAwO1xyXG4gICAgICAgIHZhciB1bml4VGltZXN0YW1wID0gZHQudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIFVUQ1xyXG4gICAgICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcbiAgICAgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNFeGNlbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5fdW5peFRpbWVTdGFtcFRvRXhjZWwgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAoKG4pIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKSArIDI1NTY5O1xyXG4gICAgICAgIC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcclxuICAgICAgICB2YXIgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEltcGxlbWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgdmFyIGFtb3VudDtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcbiAgICAgICAgICAgIHUgPSBkdXJhdGlvbi51bml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMudXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHV0Y1RtLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmFkZExvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgdmFyIGFtb3VudDtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICBpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gKGExKTtcclxuICAgICAgICAgICAgYW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcbiAgICAgICAgICAgIHUgPSBkdXJhdGlvbi51bml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhbW91bnQgPSAoYTEpO1xyXG4gICAgICAgICAgICB1ID0gdW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy56b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuICAgICAgICBpZiAodGhpcy5fem9uZSkge1xyXG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gKGFtb3VudCA+PSAwID8gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uVXAgOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5Eb3duKTtcclxuICAgICAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVG0sIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0sIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxyXG4gICAgICogS2VlcHMgbG93ZXIgdW5pdCBmaWVsZHMgdGhlIHNhbWUgd2hlcmUgcG9zc2libGUsIGNsYW1wcyBkYXkgdG8gZW5kLW9mLW1vbnRoIGlmXHJcbiAgICAgKiBuZWNlc3NhcnkuXHJcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50LkFtb3VudCBpZiBhbW91bnQgaXMgbm90IGZpbml0ZSBvciBpZiBpdCdzIG5vdCBhbiBpbnRlZ2VyIGFuZCB5b3UncmUgYWRkaW5nIG1vbnRocyBvciB5ZWFyc1xyXG4gICAgICogQHRocm93cyBBcmd1bWVudC5Vbml0IGZvciBpbnZhbGlkIHRpbWUgdW5pdFxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuX2FkZFRvVGltZVN0cnVjdCA9IGZ1bmN0aW9uICh0bSwgYW1vdW50LCB1bml0KSB7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZShhbW91bnQpLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcImFtb3VudCBtdXN0IGJlIGEgZmluaXRlIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgeWVhcjtcclxuICAgICAgICB2YXIgbW9udGg7XHJcbiAgICAgICAgdmFyIGRheTtcclxuICAgICAgICB2YXIgaG91cjtcclxuICAgICAgICB2YXIgbWludXRlO1xyXG4gICAgICAgIHZhciBzZWNvbmQ7XHJcbiAgICAgICAgdmFyIG1pbGxpO1xyXG4gICAgICAgIHN3aXRjaCAodW5pdCkge1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgLy8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA2MDAwMCkpO1xyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDM2MDAwMDApKTtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KG1hdGgucm91bmRTeW0odG0udW5peE1pbGxpcyArIGFtb3VudCAqIDg2NDAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuV2VlazpcclxuICAgICAgICAgICAgICAgIC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNyAqIDg2NDAwMDAwKSk7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6IHtcclxuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShtYXRoLmlzSW50KGFtb3VudCksIFwiQXJndW1lbnQuQW1vdW50XCIsIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8ga2VlcCB0aGUgZGF5LW9mLW1vbnRoIHRoZSBzYW1lIChjbGFtcCB0byBlbmQtb2YtbW9udGgpXHJcbiAgICAgICAgICAgICAgICBpZiAoYW1vdW50ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5jb21wb25lbnRzLm1vbnRoKSkgLyAxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgTWF0aC5mbG9vcigoYW1vdW50ICsgKHRtLmNvbXBvbmVudHMubW9udGggLSAxKSkgLyAxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0uY29tcG9uZW50cy5tb250aCAtIDEgKyBNYXRoLmNlaWwoYW1vdW50KSksIDEyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XHJcbiAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkobWF0aC5pc0ludChhbW91bnQpLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG4gICAgICAgICAgICAgICAgeWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIGFtb3VudDtcclxuICAgICAgICAgICAgICAgIG1vbnRoID0gdG0uY29tcG9uZW50cy5tb250aDtcclxuICAgICAgICAgICAgICAgIGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSB0bS5jb21wb25lbnRzLmhvdXI7XHJcbiAgICAgICAgICAgICAgICBtaW51dGUgPSB0bS5jb21wb25lbnRzLm1pbnV0ZTtcclxuICAgICAgICAgICAgICAgIHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgbWlsbGkgPSB0bS5jb21wb25lbnRzLm1pbGxpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogeWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Vbml0XCIsIFwiaW52YWxpZCB0aW1lIHVuaXRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiAoYTEsIHVuaXQpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGExID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBhMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IGExO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN1YkxvY2FsID0gZnVuY3Rpb24gKGExLCB1bml0KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhMSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIGExLCB1bml0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZExvY2FsKGExLm11bHRpcGx5KC0xKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xyXG4gICAgICogQHJldHVybiB0aGlzIC0gb3RoZXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbih0aGlzLnV0Y0RhdGUudW5peE1pbGxpcyAtIG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcyk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaG9wcyBvZmYgdGhlIHRpbWUgcGFydCwgeWllbGRzIHRoZSBzYW1lIGRhdGUgYXQgMDA6MDA6MDAuMDAwXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZEYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnN0YXJ0T2ZNb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxyXG4gICAgICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5zdGFydE9mWWVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDwgb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubGVzc0VxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDw9IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIG1vbWVudCBpbiB0aW1lIGluIFVUQ1xyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLmVxdWFscyhvdGhlci51dGNEYXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuem9uZURhdGUuZXF1YWxzKG90aGVyLnpvbmVEYXRlKVxyXG4gICAgICAgICAgICAmJiAoIXRoaXMuX3pvbmUpID09PSAoIW90aGVyLl96b25lKVxyXG4gICAgICAgICAgICAmJiAoKCF0aGlzLl96b25lICYmICFvdGhlci5fem9uZSkgfHwgKHRoaXMuX3pvbmUgJiYgb3RoZXIuX3pvbmUgJiYgdGhpcy5fem9uZS5pZGVudGljYWwob3RoZXIuX3pvbmUpKSkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPiBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUuZ3JlYXRlckVxdWFsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID49IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUubWluID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5tYXggPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG90aGVyLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQcm9wZXIgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIGFueSBJQU5BIHpvbmUgY29udmVydGVkIHRvIElTTyBvZmZzZXRcclxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cclxuICAgICAqIFVuYXdhcmUgZGF0ZXMgaGF2ZSBubyB6b25lIGluZm9ybWF0aW9uIGF0IHRoZSBlbmQuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucHJvdG90eXBlLnRvSXNvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xyXG4gICAgICAgIGlmICh0aGlzLl96b25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzICsgdGltZXpvbmVfMS5UaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB0byBVVEMgYW5kIHRoZW4gcmV0dXJuIElTTyBzdHJpbmcgZW5kaW5nIGluICdaJy4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIERhdGUjdG9JU09TdHJpbmcoKVxyXG4gICAgICogZS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMgRXVyb3BlL0Ftc3RlcmRhbVwiIGJlY29tZXMgXCIyMDE0LTAxLTAxVDIyOjE1OjMzWlwiLlxyXG4gICAgICogVW5hd2FyZSBkYXRlcyBhcmUgYXNzdW1lZCB0byBiZSBpbiBVVENcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNJc29TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9ab25lKHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpLmZvcm1hdChcInl5eXktTU0tZGRUSEg6bW06c3MuU1NTWlpaWlpcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aXRoWm9uZSh0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKS5mb3JtYXQoXCJ5eXl5LU1NLWRkVEhIOm1tOnNzLlNTU1paWlpaXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgRGF0ZVRpbWUgYWNjb3JkaW5nIHRvIHRoZVxyXG4gICAgICogc3BlY2lmaWVkIGZvcm1hdC4gU2VlIExETUwubWQgZm9yIHN1cHBvcnRlZCBmb3JtYXRzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIChlLmcuIFwiZGQvTU0veXl5eSBISDptbTpzc1wiKVxyXG4gICAgICogQHBhcmFtIGxvY2FsZSBPcHRpb25hbCwgbm9uLWVuZ2xpc2ggZm9ybWF0IG1vbnRoIG5hbWVzIGV0Yy5cclxuICAgICAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoZm9ybWF0U3RyaW5nLCBsb2NhbGUpIHtcclxuICAgICAgICByZXR1cm4gZm9ybWF0LmZvcm1hdCh0aGlzLnpvbmVEYXRlLCB0aGlzLnV0Y0RhdGUsIHRoaXMuX3pvbmUsIGZvcm1hdFN0cmluZywgbG9jYWxlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIGEgZGF0ZSBpbiBhIGdpdmVuIGZvcm1hdFxyXG4gICAgICogQHBhcmFtIHMgdGhlIHN0cmluZyB0byBwYXJzZVxyXG4gICAgICogQHBhcmFtIGZvcm1hdCB0aGUgZm9ybWF0IHRoZSBzdHJpbmcgaXMgaW4uIFNlZSBMRE1MLm1kIGZvciBzdXBwb3J0ZWQgZm9ybWF0cy5cclxuICAgICAqIEBwYXJhbSB6b25lIE9wdGlvbmFsLCB0aGUgem9uZSB0byBhZGQgKGlmIG5vIHpvbmUgaXMgZ2l2ZW4gaW4gdGhlIHN0cmluZylcclxuICAgICAqIEBwYXJhbSBsb2NhbGUgT3B0aW9uYWwsIGRpZmZlcmVudCBzZXR0aW5ncyBmb3IgY29uc3RhbnRzIGxpa2UgJ0FNJyBldGNcclxuICAgICAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIGNoYXJhY3RlcnMgaW4gdGhlIHNvdXJjZSBzdHJpbmdcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yIGlmIHRoZSBnaXZlbiBkYXRlVGltZVN0cmluZyBpcyB3cm9uZyBvciBub3QgYWNjb3JkaW5nIHRvIHRoZSBwYXR0ZXJuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGlmIHRoZSBnaXZlbiBmb3JtYXQgc3RyaW5nIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUucGFyc2UgPSBmdW5jdGlvbiAocywgZm9ybWF0LCB6b25lLCBsb2NhbGUsIGFsbG93VHJhaWxpbmcpIHtcclxuICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUsIGFsbG93VHJhaWxpbmcgfHwgZmFsc2UsIGxvY2FsZSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlVGltZShwYXJzZWQudGltZSwgcGFyc2VkLnpvbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBpZiAoISgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiSW52YWxpZFRpbWVab25lRGF0YVwiKSkge1xyXG4gICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIlBhcnNlRXJyb3JcIiwgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuICAgICAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnpvbmVEYXRlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSB0aW1lem9uZV8xLlRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIERhdGVUaW1lLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEYXRlVGltZS5wcm90b3R5cGUudG9VdGNTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjRGF0ZS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3BsaXQgYSBjb21iaW5lZCBJU08gZGF0ZXRpbWUgYW5kIHRpbWV6b25lIGludG8gZGF0ZXRpbWUgYW5kIHRpbWV6b25lXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZSA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW1wiXCIsIFwiXCJdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJ3aXRob3V0IERTVFwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0XzEgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKHMuc2xpY2UoMCwgaW5kZXggLSAxKSk7XHJcbiAgICAgICAgICAgIHJlc3VsdF8xWzFdICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRfMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XHJcbiAgICAgICAgaWYgKGluZGV4IDwgOCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IC0xOyAvLyBhbnkgXCItXCIgd2UgZm91bmQgd2FzIGEgZGF0ZSBzZXBhcmF0b3JcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG4gICAgICAgICAgICByZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cclxuICAgICAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcclxuICAgICAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cclxuICAgICAqL1xyXG4gICAgRGF0ZVRpbWUudGltZVNvdXJjZSA9IG5ldyB0aW1lc291cmNlXzEuUmVhbFRpbWVTb3VyY2UoKTtcclxuICAgIHJldHVybiBEYXRlVGltZTtcclxufSgpKTtcclxuZXhwb3J0cy5EYXRlVGltZSA9IERhdGVUaW1lO1xyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYGFgIGlzIHNpbWlsYXIgdG8gYSBUaW1lWm9uZSB3aXRob3V0IHVzaW5nIHRoZSBpbnN0YW5jZW9mIG9wZXJhdG9yLlxyXG4gKiBJdCBjaGVja3MgZm9yIHRoZSBhdmFpbGFiaWxpdHkgb2YgdGhlIGZ1bmN0aW9ucyB1c2VkIGluIHRoZSBEYXRlVGltZSBpbXBsZW1lbnRhdGlvblxyXG4gKiBAcGFyYW0gYSB0aGUgb2JqZWN0IHRvIGNoZWNrXHJcbiAqIEByZXR1cm5zIGEgaXMgVGltZVpvbmUtbGlrZVxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGlzVGltZVpvbmUoYSkge1xyXG4gICAgaWYgKGEgJiYgdHlwZW9mIGEgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGEubm9ybWFsaXplWm9uZVRpbWUgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5hYmJyZXZpYXRpb25Gb3JVdGMgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5zdGFuZGFyZE9mZnNldEZvclV0YyA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmlkZW50aWNhbCA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmVxdWFscyA9PT0gXCJmdW5jdGlvblwiXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiBhLmtpbmQgPT09IFwiZnVuY3Rpb25cIlxyXG4gICAgICAgICAgICAmJiB0eXBlb2YgYS5jbG9uZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gb2JqZWN0IGlzIG9mIHR5cGUgRGF0ZVRpbWUuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XHJcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxyXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0RhdGVUaW1lKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmtpbmQgPT09IFwiRGF0ZVRpbWVcIjtcclxufVxyXG5leHBvcnRzLmlzRGF0ZVRpbWUgPSBpc0RhdGVUaW1lO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRldGltZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogVGltZSBkdXJhdGlvblxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5pc0R1cmF0aW9uID0gZXhwb3J0cy5EdXJhdGlvbiA9IGV4cG9ydHMubWlsbGlzZWNvbmRzID0gZXhwb3J0cy5zZWNvbmRzID0gZXhwb3J0cy5taW51dGVzID0gZXhwb3J0cy5ob3VycyA9IGV4cG9ydHMuZGF5cyA9IGV4cG9ydHMubW9udGhzID0gZXhwb3J0cy55ZWFycyA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiB5ZWFycyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XHJcbn1cclxuZXhwb3J0cy55ZWFycyA9IHllYXJzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1vbnRoc1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxyXG4gKi9cclxuZnVuY3Rpb24gbW9udGhzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5tb250aHMobik7XHJcbn1cclxuZXhwb3J0cy5tb250aHMgPSBtb250aHM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIGRheXMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLmRheXMobik7XHJcbn1cclxuZXhwb3J0cy5kYXlzID0gZGF5cztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiBob3VycyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24uaG91cnMobik7XHJcbn1cclxuZXhwb3J0cy5ob3VycyA9IGhvdXJzO1xyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaW51dGVzXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAqL1xyXG5mdW5jdGlvbiBtaW51dGVzKG4pIHtcclxuICAgIHJldHVybiBEdXJhdGlvbi5taW51dGVzKG4pO1xyXG59XHJcbmV4cG9ydHMubWludXRlcyA9IG1pbnV0ZXM7XHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHNlY29uZHNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIHNlY29uZHMobikge1xyXG4gICAgcmV0dXJuIER1cmF0aW9uLnNlY29uZHMobik7XHJcbn1cclxuZXhwb3J0cy5zZWNvbmRzID0gc2Vjb25kcztcclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICovXHJcbmZ1bmN0aW9uIG1pbGxpc2Vjb25kcyhuKSB7XHJcbiAgICByZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKG4pO1xyXG59XHJcbmV4cG9ydHMubWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmRzO1xyXG4vKipcclxuICogVGltZSBkdXJhdGlvbiB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhbiBhbW91bnQgYW5kIGEgdW5pdCBlLmcuXHJcbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXHJcbiAqXHJcbiAqIEl0IGhhcyB0d28gc2V0cyBvZiBnZXR0ZXIgZnVuY3Rpb25zOlxyXG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXHJcbiAqICAgVGhlc2UgcmV0dXJuIGEgcGFydCBvZiB5b3VyIHN0cmluZyByZXByZXNlbnRhdGlvbi4gRS5nLiBmb3IgMjUwMCBtaWxsaXNlY29uZHMsIHRoZSBtaWxsaXNlY29uZCgpIHBhcnQgd291bGQgYmUgNTAwXHJcbiAqIC0gc2Vjb25kcygpLCBtaW51dGVzKCksIGhvdXJzKCkgZXRjLCBwbHVyYWwgZm9ybTogdGhlc2UgcmV0dXJuIHRoZSB0b3RhbCBhbW91bnQgcmVwcmVzZW50ZWQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgdW5pdC5cclxuICovXHJcbnZhciBEdXJhdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRHVyYXRpb24oaTEsIHVuaXQpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBbGxvdyBub3QgdXNpbmcgaW5zdGFuY2VvZlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMua2luZCA9IFwiRHVyYXRpb25cIjtcclxuICAgICAgICBpZiAodHlwZW9mIGkxID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIC8vIGFtb3VudCt1bml0IGNvbnN0cnVjdG9yXHJcbiAgICAgICAgICAgIHZhciBhbW91bnQgPSBpMTtcclxuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZShhbW91bnQpLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcImFtb3VudCBzaG91bGQgYmUgZmluaXRlOiAlZFwiLCBhbW91bnQpO1xyXG4gICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3VuaXQgPSAodHlwZW9mIHVuaXQgPT09IFwibnVtYmVyXCIgPyB1bml0IDogYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoTnVtYmVyLmlzSW50ZWdlcih0aGlzLl91bml0KSAmJiB0aGlzLl91bml0ID49IDAgJiYgdGhpcy5fdW5pdCA8IGJhc2ljc18xLlRpbWVVbml0Lk1BWCwgXCJBcmd1bWVudC5Vbml0XCIsIFwiSW52YWxpZCB0aW1lIHVuaXQgJWRcIiwgdGhpcy5fdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBpMSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvLyBzdHJpbmcgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdmFyIHMgPSBpMTtcclxuICAgICAgICAgICAgdmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2lnbiA9IDE7XHJcbiAgICAgICAgICAgICAgICB2YXIgaG91cnNfMSA9IDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWludXRlc18xID0gMDtcclxuICAgICAgICAgICAgICAgIHZhciBzZWNvbmRzXzEgPSAwO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1pbGxpc2Vjb25kc18xID0gMDtcclxuICAgICAgICAgICAgICAgIHZhciBwYXJ0cyA9IHRyaW1tZWQuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHBhcnRzLmxlbmd0aCA+IDAgJiYgcGFydHMubGVuZ3RoIDwgNCwgXCJBcmd1bWVudC5TXCIsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyaW1tZWQuY2hhckF0KDApID09PSBcIi1cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNpZ24gPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaG91cnNfMSA9ICtwYXJ0c1swXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlc18xID0gK3BhcnRzWzFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2Vjb25kUGFydHMgPSBwYXJ0c1syXS5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kc18xID0gK3NlY29uZFBhcnRzWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWNvbmRQYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbGxpc2Vjb25kc18xID0gK3N0cmluZ3MucGFkUmlnaHQoc2Vjb25kUGFydHNbMV0sIDMsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgYW1vdW50TXNlYyA9IHNpZ24gKiBNYXRoLnJvdW5kKG1pbGxpc2Vjb25kc18xICsgMTAwMCAqIHNlY29uZHNfMSArIDYwMDAwICogbWludXRlc18xICsgMzYwMDAwMCAqIGhvdXJzXzEpO1xyXG4gICAgICAgICAgICAgICAgLy8gZmluZCBsb3dlc3Qgbm9uLXplcm8gbnVtYmVyIGFuZCB0YWtlIHRoYXQgYXMgdW5pdFxyXG4gICAgICAgICAgICAgICAgaWYgKG1pbGxpc2Vjb25kc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2Vjb25kc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1pbnV0ZXNfMSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChob3Vyc18xICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnRNc2VjIC8gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3BsaXQgPSB0cmltbWVkLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHNwbGl0Lmxlbmd0aCA9PT0gMiwgXCJBcmd1bWVudC5TXCIsIFwiSW52YWxpZCB0aW1lIHN0cmluZyAnJXMnXCIsIHMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGFtb3VudCA9IHBhcnNlRmxvYXQoc3BsaXRbMF0pO1xyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZShhbW91bnQpLCBcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICclcycsIGNhbm5vdCBwYXJzZSBhbW91bnRcIiwgcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbW91bnQgPSBhbW91bnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bml0ID0gYmFzaWNzLnN0cmluZ1RvVGltZVVuaXQoc3BsaXRbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGkxID09PSB1bmRlZmluZWQgJiYgdW5pdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgY29uc3RydWN0b3JcclxuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fdW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGZhbHNlLCBcIkFyZ3VtZW50LkFtb3VudFwiLCBcImludmFsaWQgY29uc3RydWN0b3IgYXJndW1lbnRzXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4geWVhcnNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnllYXJzID0gZnVuY3Rpb24gKGFtb3VudCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1vbnRocyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuTW9udGgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQW1vdW50IGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5kYXlzID0gZnVuY3Rpb24gKGFtb3VudCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHBhcmFtIGFtb3VudCBOdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gaG91cnNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLmhvdXJzID0gZnVuY3Rpb24gKGFtb3VudCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24oYW1vdW50LCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ubWludXRlcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gICAgICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkFtb3VudCBpZiBuIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24uc2Vjb25kcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEBwYXJhbSBhbW91bnQgTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAgICAgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtaWxsaXNlY29uZHNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5BbW91bnQgaWYgbiBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uIChhbW91bnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKGFtb3VudCwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybiBhbm90aGVyIGluc3RhbmNlIG9mIER1cmF0aW9uIHdpdGggdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50LCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhpcyBkdXJhdGlvbiBleHByZXNzZWQgaW4gZGlmZmVyZW50IHVuaXQgKHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBmcmFjdGlvbmFsKS5cclxuICAgICAqIFRoaXMgaXMgcHJlY2lzZSBmb3IgWWVhciA8LT4gTW9udGggYW5kIGZvciB0aW1lLXRvLXRpbWUgY29udmVyc2lvbiAoaS5lLiBIb3VyLW9yLWxlc3MgdG8gSG91ci1vci1sZXNzKS5cclxuICAgICAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hcyA9IGZ1bmN0aW9uICh1bml0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IHVuaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdW5pdCA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiB1bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTW9udGhzID0gKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG4gICAgICAgICAgICB2YXIgcmVxTW9udGhzID0gKHVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIgPyAxMiA6IDEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01vbnRocyAvIHJlcU1vbnRocztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciB0aGlzTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG4gICAgICAgICAgICB2YXIgcmVxTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ICogdGhpc01zZWMgLyByZXFNc2VjO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdGhpcyBkdXJhdGlvbiB0byBhIER1cmF0aW9uIGluIGFub3RoZXIgdW5pdC4gWW91IGFsd2F5cyBnZXQgYSBjbG9uZSBldmVuIGlmIHlvdSBzcGVjaWZ5XHJcbiAgICAgKiB0aGUgc2FtZSB1bml0LlxyXG4gICAgICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG4gICAgICogSXQgaXMgYXBwcm94aW1hdGUgZm9yIGFueSBvdGhlciBjb252ZXJzaW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmNvbnZlcnQgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5hcyh1bml0KSwgdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5taWxsaXNlY29uZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pbGxpc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDQwMCBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbGxpc2Vjb25kID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gc2Vjb25kcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSAxNTAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2Vjb25kIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zZWNvbmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnQoYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWludXRlcyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG4gICAgICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA5MDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pbnV0ZSBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAyIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUubWludXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGhvdXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcbiAgICAgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmhvdXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGhvdXIgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIGRheSBoYXMgMjQgaG91cnMgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZVxyXG4gICAgICogZHVyaW5nIERTVCBjaGFuZ2VzKS5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBob3VyIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpLlxyXG4gICAgICogTm90ZSB0aGF0IHRoaXMgcGFydCBjYW4gZXhjZWVkIDIzIGhvdXJzLCBiZWNhdXNlIGZvclxyXG4gICAgICogbm93LCB3ZSBkbyBub3QgaGF2ZSBhIGRheXMoKSBmdW5jdGlvblxyXG4gICAgICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuICAgICAqIEByZXR1cm4gZS5nLiAyNSBmb3IgYSAtMjU6MDI6MDMuNDAwIGR1cmF0aW9uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlSG91cnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBkYXlzIVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5kYXlzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFzKGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGF5IHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBtb250aCBoYXMgMzAgZGF5cy5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0KGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG4gICAgICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1vbnRocyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbW9udGggcGFydCBvZiBhIGR1cmF0aW9uLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5tb250aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFydChiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHllYXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuICAgICAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS55ZWFycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hcyhiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vbi1mcmFjdGlvbmFsIHBvc2l0aXZlIHllYXJzXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLndob2xlWWVhcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LlllYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAxMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xyXG4gICAgICAgICAgICAgICAgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmFtb3VudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHVuaXQgdGhpcyBkdXJhdGlvbiB3YXMgY3JlYXRlZCB3aXRoXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnVuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VuaXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaWduXHJcbiAgICAgKiBAcmV0dXJuIFwiLVwiIGlmIHRoZSBkdXJhdGlvbiBpcyBuZWdhdGl2ZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zaWduID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPCBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmxlc3NFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDw9IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxyXG4gICAgICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG4gICAgICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgY29udmVydGVkID0gb3RoZXIuY29udmVydCh0aGlzLl91bml0KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuICAgICAqIFJldHVybnMgZmFsc2UgaWYgd2UgY2Fubm90IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWFsIGluIGFsbCB0aW1lIHpvbmVzXHJcbiAgICAgKiBzbyBlLmcuIDYwIG1pbnV0ZXMgZXF1YWxzIDEgaG91ciwgYnV0IDI0IGhvdXJzIGRvIE5PVCBlcXVhbCAxIGRheVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuZXF1YWxzRXhhY3QgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5fdW5pdCA9PT0gb3RoZXIuX3VuaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLl9hbW91bnQgPT09IG90aGVyLl9hbW91bnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLl91bml0ID49IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoICYmIG90aGVyLnVuaXQoKSA+PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtb250aHMgYW5kIHllYXJzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3VuaXQgPCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkgJiYgb3RoZXIudW5pdCgpIDwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7IC8vIGNhbiBjb21wYXJlIG1pbGxpc2Vjb25kcyB0aHJvdWdoIGhvdXJzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGNhbm5vdCBjb21wYXJlIGRheXMgdG8gYW55dGhpbmcgZWxzZVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFNhbWUgdW5pdCBhbmQgc2FtZSBhbW91bnRcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuaWRlbnRpY2FsID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gb3RoZXIuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gb3RoZXIudW5pdCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgaXMgYSBub24temVybyBsZW5ndGggZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm5vblplcm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCAhPT0gMDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGlzIGEgemVyby1sZW5ndGggZHVyYXRpb25cclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnplcm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Ftb3VudCA9PT0gMDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPiBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5ncmVhdGVyRXF1YWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1pbmltdW0gKG1vc3QgbmVnYXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gKG1vc3QgcG9zaXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm1heCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGx5IHdpdGggYSBmaXhlZCBudW1iZXIuXHJcbiAgICAgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICogdmFsdWUpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKiB2YWx1ZSwgdGhpcy5fdW5pdCk7XHJcbiAgICB9O1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgJiYgdmFsdWUgIT09IDAsIFwiQXJndW1lbnQuVmFsdWVcIiwgXCJjYW5ub3QgZGl2aWRlIGJ5ICVkXCIsIHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLyB2YWx1ZSwgdGhpcy5fdW5pdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodmFsdWUuYW1vdW50KCkgIT09IDAsIFwiQXJndW1lbnQuVmFsdWVcIiwgXCJjYW5ub3QgZGl2aWRlIGJ5IDBcIik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIC8gdmFsdWUubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgZHVyYXRpb24uXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzICsgdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCArIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0IGEgZHVyYXRpb24uXHJcbiAgICAgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC0gdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAtIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhlIGR1cmF0aW9uIGkuZS4gcmVtb3ZlIHRoZSBzaWduLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2Ftb3VudCA+PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseSgtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU3RyaW5nIGluIFstXWhoaGg6bW06c3Mubm5uIG5vdGF0aW9uLiBBbGwgZmllbGRzIGFyZSBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvRnVsbFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b0htc1N0cmluZyh0cnVlKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyBpbiBbLV1oaGhoOm1tWzpzc1subm5uXV0gbm90YXRpb24uXHJcbiAgICAgKiBAcGFyYW0gZnVsbCBJZiB0cnVlLCB0aGVuIGFsbCBmaWVsZHMgYXJlIGFsd2F5cyBwcmVzZW50IGV4Y2VwdCB0aGUgc2lnbi4gT3RoZXJ3aXNlLCBzZWNvbmRzIGFuZCBtaWxsaXNlY29uZHNcclxuICAgICAqIGFyZSBjaG9wcGVkIG9mZiBpZiB6ZXJvXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvSG1zU3RyaW5nID0gZnVuY3Rpb24gKGZ1bGwpIHtcclxuICAgICAgICBpZiAoZnVsbCA9PT0gdm9pZCAwKSB7IGZ1bGwgPSBmYWxzZTsgfVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xyXG4gICAgICAgIGlmIChmdWxsIHx8IHRoaXMubWlsbGlzZWNvbmQoKSA+IDApIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaXNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMywgXCIwXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLnNlY29uZCgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLm1pbnV0ZSgpID4gMCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbnV0ZSgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zaWduKCkgKyBzdHJpbmdzLnBhZExlZnQodGhpcy53aG9sZUhvdXJzKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdHJpbmcgaW4gSVNPIDg2MDEgbm90YXRpb24gZS5nLiAnUDFNJyBmb3Igb25lIG1vbnRoIG9yICdQVDFNJyBmb3Igb25lIG1pbnV0ZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgKHRoaXMuX2Ftb3VudCAvIDEwMDApLnRvRml4ZWQoMykgKyBcIlNcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQVFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiOyAvLyBub3RlIHRoZSBcIlRcIiB0byBkaXNhbWJpZ3VhdGUgdGhlIFwiTVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJIXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LldlZWs6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIldcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJNXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQuXCIpOyAvLyBwcm9ncmFtbWluZyBlcnJvclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyByZXByZXNlbnRhdGlvbiB3aXRoIGFtb3VudCBhbmQgdW5pdCBlLmcuICcxLjUgeWVhcnMnIG9yICctMSBkYXknXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgRHVyYXRpb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCIgXCIgKyBiYXNpY3MudGltZVVuaXRUb1N0cmluZyh0aGlzLl91bml0LCB0aGlzLl9hbW91bnQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIER1cmF0aW9uLnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoaXMgJSB1bml0LCBhbHdheXMgcG9zaXRpdmVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBEdXJhdGlvbi5wcm90b3R5cGUuX3BhcnQgPSBmdW5jdGlvbiAodW5pdCkge1xyXG4gICAgICAgIHZhciBuZXh0VW5pdDtcclxuICAgICAgICAvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcclxuICAgICAgICBzd2l0Y2ggKHVuaXQpIHtcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgIG5leHRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LkhvdXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgbmV4dFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTW9udGg6XHJcbiAgICAgICAgICAgICAgICBuZXh0VW5pdCA9IGJhc2ljc18xLlRpbWVVbml0LlllYXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuYXMoYmFzaWNzXzEuVGltZVVuaXQuWWVhcikpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1zZWNzID0gKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSkgJSBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyhuZXh0VW5pdCk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIER1cmF0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLkR1cmF0aW9uID0gRHVyYXRpb247XHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBEdXJhdGlvbi4gTm90ZSB0aGF0IGl0IGRvZXMgbm90IHdvcmsgZm9yIHN1YiBjbGFzc2VzLiBIb3dldmVyLCB1c2UgdGhpcyB0byBiZSByb2J1c3RcclxuICogYWdhaW5zdCBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIGxpYnJhcnkgaW4gb25lIHByb2Nlc3MgaW5zdGVhZCBvZiBpbnN0YW5jZW9mXHJcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBjaGVja1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGlzRHVyYXRpb24odmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUua2luZCA9PT0gXCJEdXJhdGlvblwiO1xyXG59XHJcbmV4cG9ydHMuaXNEdXJhdGlvbiA9IGlzRHVyYXRpb247XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWR1cmF0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG4vKipcclxuICogQ29weXJpZ2h0IChjKSAyMDE5IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqL1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuY29udmVydEVycm9yID0gZXhwb3J0cy5lcnJvcklzID0gZXhwb3J0cy5lcnJvciA9IGV4cG9ydHMudGhyb3dFcnJvciA9IHZvaWQgMDtcclxudmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcclxuLyoqXHJcbiAqIFRocm93cyBhbiBlcnJvciB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBtZXNzYWdlXHJcbiAqIEBwYXJhbSBuYW1lIGVycm9yIG5hbWUsIHdpdGhvdXQgdGltZXpvbmVjb21wbGV0ZSBwcmVmaXhcclxuICogQHBhcmFtIGZvcm1hdCBtZXNzYWdlIHdpdGggcGVyY2VudC1zdHlsZSBwbGFjZWhvbGRlcnNcclxuICogQHBhcmFtIGFyZ3MgYXJndW1lbnRzIGZvciB0aGUgcGxhY2Vob2xkZXJzXHJcbiAqIEB0aHJvd3MgdGhlIGdpdmVuIGVycm9yXHJcbiAqL1xyXG5mdW5jdGlvbiB0aHJvd0Vycm9yKG5hbWUsIGZvcm1hdCkge1xyXG4gICAgdmFyIGFyZ3MgPSBbXTtcclxuICAgIGZvciAodmFyIF9pID0gMjsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgYXJnc1tfaSAtIDJdID0gYXJndW1lbnRzW19pXTtcclxuICAgIH1cclxuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcih1dGlsLmZvcm1hdChmb3JtYXQsIGFyZ3MpKTtcclxuICAgIGVycm9yLm5hbWUgPSBcInRpbWV6b25lY29tcGxldGUuXCIgKyBuYW1lO1xyXG4gICAgdGhyb3cgZXJyb3I7XHJcbn1cclxuZXhwb3J0cy50aHJvd0Vycm9yID0gdGhyb3dFcnJvcjtcclxuLyoqXHJcbiAqIFJldHVybnMgYW4gZXJyb3Igd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWVzc2FnZVxyXG4gKiBAcGFyYW0gbmFtZVxyXG4gKiBAcGFyYW0gZm9ybWF0XHJcbiAqIEBwYXJhbSBhcmdzXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gZXJyb3IobmFtZSwgZm9ybWF0KSB7XHJcbiAgICB2YXIgYXJncyA9IFtdO1xyXG4gICAgZm9yICh2YXIgX2kgPSAyOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICBhcmdzW19pIC0gMl0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgfVxyXG4gICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHV0aWwuZm9ybWF0KGZvcm1hdCwgYXJncykpO1xyXG4gICAgZXJyb3IubmFtZSA9IFwidGltZXpvbmVjb21wbGV0ZS5cIiArIG5hbWU7XHJcbiAgICByZXR1cm4gZXJyb3I7XHJcbn1cclxuZXhwb3J0cy5lcnJvciA9IGVycm9yO1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmZiBgZXJyb3IubmFtZWAgaXMgZXF1YWwgdG8gb3IgaW5jbHVkZWQgYnkgYG5hbWVgXHJcbiAqIEBwYXJhbSBlcnJvclxyXG4gKiBAcGFyYW0gbmFtZSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5nc1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGVycm9ySXMoZXJyb3IsIG5hbWUpIHtcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIHJldHVybiBlcnJvci5uYW1lID09PSBcInRpbWV6b25lY29tcGxldGUuXCIgKyBuYW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yLm5hbWUuc3RhcnRzV2l0aChcInRpbWV6b25lY29tcGxldGUuXCIpICYmIG5hbWUuaW5jbHVkZXMoZXJyb3IubmFtZS5zdWJzdHIoXCJ0aW1lem9uZWNvbXBsZXRlLlwiLmxlbmd0aCkpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuZXJyb3JJcyA9IGVycm9ySXM7XHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBhbGwgZXJyb3JzIHRocm93biBieSBgY2JgIHRvIHRoZSBnaXZlbiBlcnJvciBuYW1lXHJcbiAqIEBwYXJhbSBlcnJvck5hbWVcclxuICogQHBhcmFtIGNiXHJcbiAqIEB0aHJvd3MgW2Vycm9yTmFtZV1cclxuICovXHJcbmZ1bmN0aW9uIGNvbnZlcnRFcnJvcihlcnJvck5hbWUsIGNiKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBjYigpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck5hbWUsIGUubWVzc2FnZSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5jb252ZXJ0RXJyb3IgPSBjb252ZXJ0RXJyb3I7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVycm9yLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxyXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuZm9ybWF0ID0gdm9pZCAwO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG52YXIgbG9jYWxlXzEgPSByZXF1aXJlKFwiLi9sb2NhbGVcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIGxvY2FsWm9uZSBUaGUgem9uZSB0aGF0IGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIExETUwgZm9ybWF0IHBhdHRlcm4gKHNlZSBMRE1MLm1kKVxyXG4gKiBAcGFyYW0gbG9jYWxlIE90aGVyIGZvcm1hdCBvcHRpb25zIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBmb3IgaW52YWxpZCBmb3JtYXQgcGF0dGVyblxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0KGRhdGVUaW1lLCB1dGNUaW1lLCBsb2NhbFpvbmUsIGZvcm1hdFN0cmluZywgbG9jYWxlKSB7XHJcbiAgICBpZiAobG9jYWxlID09PSB2b2lkIDApIHsgbG9jYWxlID0ge307IH1cclxuICAgIHZhciBtZXJnZWRMb2NhbGUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgbG9jYWxlXzEuREVGQVVMVF9MT0NBTEUpLCBsb2NhbGUpO1xyXG4gICAgdmFyIHRva2VucyA9ICgwLCB0b2tlbl8xLnRva2VuaXplKShmb3JtYXRTdHJpbmcpO1xyXG4gICAgdmFyIHJlc3VsdCA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIHRva2Vuc18xID0gdG9rZW5zOyBfaSA8IHRva2Vuc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciB0b2tlbiA9IHRva2Vuc18xW19pXTtcclxuICAgICAgICB2YXIgdG9rZW5SZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuRVJBOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RXJhKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLllFQVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5RVUFSVEVSOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0UXVhcnRlcihkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NT05USDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1vbnRoKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdERheShkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFS0RBWTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWtkYXkoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuREFZUEVSSU9EOlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5UGVyaW9kKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkhPVVI6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRIb3VyKGRhdGVUaW1lLCB0b2tlbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NSU5VVEU6XHJcbiAgICAgICAgICAgICAgICB0b2tlblJlc3VsdCA9IF9mb3JtYXRNaW51dGUoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlNFQ09ORDpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFpvbmUoZGF0ZVRpbWUsIHV0Y1RpbWUsIGxvY2FsWm9uZSA/IGxvY2FsWm9uZSA6IHVuZGVmaW5lZCwgdG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuV0VFSzpcclxuICAgICAgICAgICAgICAgIHRva2VuUmVzdWx0ID0gX2Zvcm1hdFdlZWsoZGF0ZVRpbWUsIHRva2VuKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLklERU5USVRZOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaFxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdG9rZW5SZXN1bHQgPSB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IHRva2VuUmVzdWx0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdC50cmltKCk7XHJcbn1cclxuZXhwb3J0cy5mb3JtYXQgPSBmb3JtYXQ7XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGVyYSAoQkMgb3IgQUQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcclxuICAgIHZhciBBRCA9IGRhdGVUaW1lLnllYXIgPiAwO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIChBRCA/IGxvY2FsZS5lcmFBYmJyZXZpYXRlZFswXSA6IGxvY2FsZS5lcmFBYmJyZXZpYXRlZFsxXSk7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYVdpZGVbMF0gOiBsb2NhbGUuZXJhV2lkZVsxXSk7XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gKEFEID8gbG9jYWxlLmVyYU5hcnJvd1swXSA6IGxvY2FsZS5lcmFOYXJyb3dbMV0pO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB5ZWFyXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXRZZWFyKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwieVwiOlxyXG4gICAgICAgIGNhc2UgXCJZXCI6XHJcbiAgICAgICAgY2FzZSBcInJcIjpcclxuICAgICAgICAgICAgdmFyIHllYXJWYWx1ZSA9IHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS55ZWFyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcclxuICAgICAgICAgICAgICAgIHllYXJWYWx1ZSA9IHllYXJWYWx1ZS5zbGljZSgtMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHllYXJWYWx1ZTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgcXVhcnRlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBmb3IgaW52YWxpZCBmb3JtYXQgcGF0dGVyblxyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcclxuICAgIHZhciBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJRXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChxdWFydGVyLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUucXVhcnRlckFiYnJldmlhdGlvbnNbcXVhcnRlciAtIDFdICsgXCIgXCIgKyBsb2NhbGUucXVhcnRlcldvcmQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1YXJ0ZXIudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInFcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHF1YXJ0ZXIudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyV29yZDtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcXVhcnRlci50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nIGZvciBpbnZhbGlkIGZvcm1hdCBwYXR0ZXJuXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcIk1cIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLm1vbnRoLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc2hvcnRNb250aE5hbWVzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5sb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUubW9udGhMZXR0ZXJzW2RhdGVUaW1lLm1vbnRoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJMXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVMb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZU1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgbW9udGggcGF0dGVyblwiKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogRm9ybWF0IHRoZSB3ZWVrIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwid1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLndlZWtPZk1vbnRoKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgbW9udGggKG9yIHllYXIpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXkoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJkXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUuZGF5LnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJEXCI6XHJcbiAgICAgICAgICAgIHZhciBkYXlPZlllYXIgPSBiYXNpY3MuZGF5T2ZZZWFyKGRhdGVUaW1lLnllYXIsIGRhdGVUaW1lLm1vbnRoLCBkYXRlVGltZS5kYXkpICsgMTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXlPZlllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIGxvY2FsZSkge1xyXG4gICAgdmFyIHdlZWtEYXlOdW1iZXIgPSBiYXNpY3Mud2Vla0RheU5vTGVhcFNlY3MoZGF0ZVRpbWUudW5peE1pbGxpcyk7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5zeW1ib2wgPT09IFwiZVwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLndlZWtkYXlMZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xyXG4gICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS53ZWVrZGF5VHdvTGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgRGF5IFBlcmlvZCAoQU0gb3IgUE0pXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuLCBsb2NhbGUpIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImFcIjoge1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoIDw9IDMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5sZW5ndGggPT09IDQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUuYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUucG07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwiYlwiOlxyXG4gICAgICAgIGNhc2UgXCJCXCI6IHtcclxuICAgICAgICAgICAgaWYgKHRva2VuLmxlbmd0aCA8PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5taWRuaWdodDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPT09IDEyICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm5vb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0b2tlbi5sZW5ndGggPT09IDQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyID09PSAxMiAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RXaWRlLm5vb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUuYW07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUucG07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMCAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cubWlkbmlnaHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRlVGltZS5ob3VyID09PSAxMiAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cubm9vbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGUuZGF5UGVyaW9kTmFycm93LmFtO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cucG07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIEhvdXJcclxuICpcclxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKSB7XHJcbiAgICB2YXIgaG91ciA9IGRhdGVUaW1lLmhvdXI7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJoXCI6XHJcbiAgICAgICAgICAgIGhvdXIgPSBob3VyICUgMTI7XHJcbiAgICAgICAgICAgIGlmIChob3VyID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBob3VyID0gMTI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xyXG4gICAgICAgIGNhc2UgXCJIXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICBjYXNlIFwiS1wiOlxyXG4gICAgICAgICAgICBob3VyID0gaG91ciAlIDEyO1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcImtcIjpcclxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGhvdXIgPSAyNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcclxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0TWludXRlKGRhdGVUaW1lLCB0b2tlbikge1xyXG4gICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5taW51dGUudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgc2Vjb25kcyAob3IgZnJhY3Rpb24gb2YgYSBzZWNvbmQpXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxyXG4gKiBAcmV0dXJuIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuKiogaWYgYW55IG9mIHRoZSBnaXZlbiBkYXRlVGltZSBlbGVtZW50cyBhcmUgaW52YWxpZFxyXG4gKi9cclxuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZSwgdG9rZW4pIHtcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcInNcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgY2FzZSBcIlNcIjpcclxuICAgICAgICAgICAgdmFyIGZyYWN0aW9uID0gZGF0ZVRpbWUubWlsbGk7XHJcbiAgICAgICAgICAgIHZhciBmcmFjdGlvblN0cmluZyA9IHN0cmluZ3MucGFkTGVmdChmcmFjdGlvbi50b1N0cmluZygpLCAzLCBcIjBcIik7XHJcbiAgICAgICAgICAgIGZyYWN0aW9uU3RyaW5nID0gc3RyaW5ncy5wYWRSaWdodChmcmFjdGlvblN0cmluZywgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBmcmFjdGlvblN0cmluZy5zbGljZSgwLCB0b2tlbi5sZW5ndGgpO1xyXG4gICAgICAgIGNhc2UgXCJBXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdzLnBhZExlZnQoYmFzaWNzLnNlY29uZE9mRGF5KGRhdGVUaW1lLmhvdXIsIGRhdGVUaW1lLm1pbnV0ZSwgZGF0ZVRpbWUuc2Vjb25kKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEZvcm1hdCB0aGUgdGltZSB6b25lLiBGb3IgdGhpcywgd2UgbmVlZCB0aGUgY3VycmVudCB0aW1lLCB0aGUgdGltZSBpbiBVVEMgYW5kIHRoZSB0aW1lIHpvbmVcclxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxyXG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcclxuICogQHBhcmFtIHpvbmUgVGhlIHRpbWV6b25lIGN1cnJlbnRUaW1lIGlzIGluXHJcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXHJcbiAqIEByZXR1cm4gc3RyaW5nXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXHJcbiAqL1xyXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZSwgdXRjVGltZSwgem9uZSwgdG9rZW4pIHtcclxuICAgIGlmICghem9uZSkge1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG4gICAgdmFyIG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xyXG4gICAgdmFyIG9mZnNldEhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG4gICAgdmFyIG9mZnNldEhvdXJzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldEhvdXJzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgIG9mZnNldEhvdXJzU3RyaW5nID0gKG9mZnNldCA+PSAwID8gXCIrXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyA6IFwiLVwiICsgb2Zmc2V0SG91cnNTdHJpbmcpO1xyXG4gICAgdmFyIG9mZnNldE1pbnV0ZXMgPSBNYXRoLmFicyhvZmZzZXQgJSA2MCk7XHJcbiAgICB2YXIgb2Zmc2V0TWludXRlc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRNaW51dGVzLnRvU3RyaW5nKCksIDIsIFwiMFwiKTtcclxuICAgIHZhciByZXN1bHQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJPXCI6XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFwiR01UXCI7XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiK1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiLVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdCArPSBvZmZzZXRIb3Vycy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID49IDQgfHwgb2Zmc2V0TWludXRlcyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID4gNCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHRva2VuLnJhdy5zbGljZSg0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIGNhc2UgXCJaXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VG9rZW4gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogNCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiBcIk9PT09cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sOiBcIk9cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogdG9rZW5fMS5Ub2tlblR5cGUuWk9ORVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCBuZXdUb2tlbik7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJaXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcInpcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB6b25lLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLnJhdztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJ2XCI6XHJcbiAgICAgICAgICAgIGlmICh0b2tlbi5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lLmFiYnJldmlhdGlvbkZvclV0YyhjdXJyZW50VGltZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJWXCI6XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IGltcGxlbWVudGVkXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidW5rXCI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUubmFtZSgpO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlVua25vd25cIjtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW4ucmF3O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBcIlhcIjpcclxuICAgICAgICBjYXNlIFwieFwiOlxyXG4gICAgICAgICAgICBpZiAodG9rZW4uc3ltYm9sID09PSBcIlhcIiAmJiBvZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlpcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9mZnNldEhvdXJzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXRNaW51dGVzICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiAvLyBObyBzZWNvbmRzIGluIG91ciBpbXBsZW1lbnRhdGlvbiwgc28gdGhpcyBpcyB0aGUgc2FtZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IC8vIE5vIHNlY29uZHMgaW4gb3VyIGltcGxlbWVudGF0aW9uLCBzbyB0aGlzIGlzIHRoZSBzYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mZnNldEhvdXJzU3RyaW5nICsgXCI6XCIgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbi5yYXc7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zm9ybWF0LmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBHbG9iYWwgZnVuY3Rpb25zIGRlcGVuZGluZyBvbiBEYXRlVGltZS9EdXJhdGlvbiBldGNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuYWJzID0gZXhwb3J0cy5tYXggPSBleHBvcnRzLm1pbiA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRDEgaWYgZDEgaXMgdW5kZWZpbmVkL251bGxcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkQyIGlmIGQxIGlzIHVuZGVmaW5lZC9udWxsLCBvciBpZiBkMSBhbmQgZDIgYXJlIG5vdCBib3RoIGRhdGV0aW1lc1xyXG4gKi9cclxuZnVuY3Rpb24gbWluKGQxLCBkMikge1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQxLCBcIkFyZ3VtZW50LkQxXCIsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZDIsIFwiQXJndW1lbnQuRDJcIiwgXCJzZWNvbmQgYXJndW1lbnQgaXMgZmFsc3lcIik7XHJcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGQxLmtpbmQgPT09IGQyLmtpbmQsIFwiQXJndW1lbnQuRDJcIiwgXCJleHBlY3RlZCBlaXRoZXIgdHdvIGRhdGV0aW1lcyBvciB0d28gZHVyYXRpb25zXCIpO1xyXG4gICAgcmV0dXJuIGQxLm1pbihkMik7XHJcbn1cclxuZXhwb3J0cy5taW4gPSBtaW47XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5EMSBpZiBkMSBpcyB1bmRlZmluZWQvbnVsbFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRDIgaWYgZDEgaXMgdW5kZWZpbmVkL251bGwsIG9yIGlmIGQxIGFuZCBkMiBhcmUgbm90IGJvdGggZGF0ZXRpbWVzXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXgoZDEsIGQyKSB7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZDEsIFwiQXJndW1lbnQuRDFcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShkMiwgXCJBcmd1bWVudC5EMlwiLCBcInNlY29uZCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZDEua2luZCA9PT0gZDIua2luZCwgXCJBcmd1bWVudC5EMlwiLCBcImV4cGVjdGVkIGVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnNcIik7XHJcbiAgICByZXR1cm4gZDEubWF4KGQyKTtcclxufVxyXG5leHBvcnRzLm1heCA9IG1heDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkQgaWYgZCBpcyB1bmRlZmluZWQvbnVsbFxyXG4gKi9cclxuZnVuY3Rpb24gYWJzKGQpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShkLCBcIkFyZ3VtZW50LkRcIiwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcclxuICAgIHJldHVybiBkLmFicygpO1xyXG59XHJcbmV4cG9ydHMuYWJzID0gYWJzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nbG9iYWxzLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5EYXRlRnVuY3Rpb25zID0gdm9pZCAwO1xyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbnZhciBEYXRlRnVuY3Rpb25zO1xyXG4oZnVuY3Rpb24gKERhdGVGdW5jdGlvbnMpIHtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIHRoZSBEYXRlLmdldEZ1bGxZZWFyKCksIERhdGUuZ2V0TW9udGgoKSwgLi4uIGZ1bmN0aW9ucy5cclxuICAgICAqL1xyXG4gICAgRGF0ZUZ1bmN0aW9uc1tEYXRlRnVuY3Rpb25zW1wiR2V0XCJdID0gMF0gPSBcIkdldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG4gICAgICovXHJcbiAgICBEYXRlRnVuY3Rpb25zW0RhdGVGdW5jdGlvbnNbXCJHZXRVVENcIl0gPSAxXSA9IFwiR2V0VVRDXCI7XHJcbn0pKERhdGVGdW5jdGlvbnMgPSBleHBvcnRzLkRhdGVGdW5jdGlvbnMgfHwgKGV4cG9ydHMuRGF0ZUZ1bmN0aW9ucyA9IHt9KSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWphdmFzY3JpcHQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNyBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKi9cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkRFRkFVTFRfTE9DQUxFID0gZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1cgPSBleHBvcnRzLkRBWV9QRVJJT0RTX1dJREUgPSBleHBvcnRzLkRBWV9QRVJJT0RTX0FCQlJFVklBVEVEID0gZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMgPSBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMgPSBleHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBleHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMgPSBleHBvcnRzLlNUQU5EX0FMT05FX0xPTkdfTU9OVEhfTkFNRVMgPSBleHBvcnRzLk1PTlRIX0xFVFRFUlMgPSBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTID0gZXhwb3J0cy5MT05HX01PTlRIX05BTUVTID0gZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX0FCQlJFVklBVElPTlMgPSBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfV09SRCA9IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIgPSBleHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IGV4cG9ydHMuUVVBUlRFUl9XT1JEID0gZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IGV4cG9ydHMuRVJBX05BTUVTX0FCQlJFVklBVEVEID0gZXhwb3J0cy5FUkFfTkFNRVNfV0lERSA9IGV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyA9IHZvaWQgMDtcclxuZXhwb3J0cy5FUkFfTkFNRVNfTkFSUk9XID0gW1wiQVwiLCBcIkJcIl07XHJcbmV4cG9ydHMuRVJBX05BTUVTX1dJREUgPSBbXCJBbm5vIERvbWluaVwiLCBcIkJlZm9yZSBDaHJpc3RcIl07XHJcbmV4cG9ydHMuRVJBX05BTUVTX0FCQlJFVklBVEVEID0gW1wiQURcIiwgXCJCQ1wiXTtcclxuZXhwb3J0cy5RVUFSVEVSX0xFVFRFUiA9IFwiUVwiO1xyXG5leHBvcnRzLlFVQVJURVJfV09SRCA9IFwicXVhcnRlclwiO1xyXG5leHBvcnRzLlFVQVJURVJfQUJCUkVWSUFUSU9OUyA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcclxuLyoqXHJcbiAqIEluIHNvbWUgbGFuZ3VhZ2VzLCBkaWZmZXJlbnQgd29yZHMgYXJlIG5lY2Vzc2FyeSBmb3Igc3RhbmQtYWxvbmUgcXVhcnRlciBuYW1lc1xyXG4gKi9cclxuZXhwb3J0cy5TVEFORF9BTE9ORV9RVUFSVEVSX0xFVFRFUiA9IGV4cG9ydHMuUVVBUlRFUl9MRVRURVI7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9XT1JEID0gZXhwb3J0cy5RVUFSVEVSX1dPUkQ7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9BQkJSRVZJQVRJT05TID0gZXhwb3J0cy5RVUFSVEVSX0FCQlJFVklBVElPTlMuc2xpY2UoKTtcclxuZXhwb3J0cy5MT05HX01PTlRIX05BTUVTID0gW1wiSmFudWFyeVwiLCBcIkZlYnJ1YXJ5XCIsIFwiTWFyY2hcIiwgXCJBcHJpbFwiLCBcIk1heVwiLCBcIkp1bmVcIiwgXCJKdWx5XCIsIFwiQXVndXN0XCIsIFwiU2VwdGVtYmVyXCIsIFwiT2N0b2JlclwiLCBcIk5vdmVtYmVyXCIsIFwiRGVjZW1iZXJcIl07XHJcbmV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMgPSBbXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XHJcbmV4cG9ydHMuTU9OVEhfTEVUVEVSUyA9IFtcIkpcIiwgXCJGXCIsIFwiTVwiLCBcIkFcIiwgXCJNXCIsIFwiSlwiLCBcIkpcIiwgXCJBXCIsIFwiU1wiLCBcIk9cIiwgXCJOXCIsIFwiRFwiXTtcclxuZXhwb3J0cy5TVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTID0gZXhwb3J0cy5MT05HX01PTlRIX05BTUVTLnNsaWNlKCk7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfU0hPUlRfTU9OVEhfTkFNRVMgPSBleHBvcnRzLlNIT1JUX01PTlRIX05BTUVTLnNsaWNlKCk7XHJcbmV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyA9IGV4cG9ydHMuTU9OVEhfTEVUVEVSUy5zbGljZSgpO1xyXG5leHBvcnRzLkxPTkdfV0VFS0RBWV9OQU1FUyA9IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xyXG5leHBvcnRzLlNIT1JUX1dFRUtEQVlfTkFNRVMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XHJcbmV4cG9ydHMuV0VFS0RBWV9UV09fTEVUVEVSUyA9IFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xyXG5leHBvcnRzLldFRUtEQVlfTEVUVEVSUyA9IFtcIlNcIiwgXCJNXCIsIFwiVFwiLCBcIldcIiwgXCJUXCIsIFwiRlwiLCBcIlNcIl07XHJcbmV4cG9ydHMuREFZX1BFUklPRFNfQUJCUkVWSUFURUQgPSB7IGFtOiBcIkFNXCIsIHBtOiBcIlBNXCIsIG5vb246IFwibm9vblwiLCBtaWRuaWdodDogXCJtaWQuXCIgfTtcclxuZXhwb3J0cy5EQVlfUEVSSU9EU19XSURFID0geyBhbTogXCJBTVwiLCBwbTogXCJQTVwiLCBub29uOiBcIm5vb25cIiwgbWlkbmlnaHQ6IFwibWlkbmlnaHRcIiB9O1xyXG5leHBvcnRzLkRBWV9QRVJJT0RTX05BUlJPVyA9IHsgYW06IFwiQVwiLCBwbTogXCJQXCIsIG5vb246IFwibm9vblwiLCBtaWRuaWdodDogXCJtZFwiIH07XHJcbmV4cG9ydHMuREVGQVVMVF9MT0NBTEUgPSB7XHJcbiAgICBlcmFOYXJyb3c6IGV4cG9ydHMuRVJBX05BTUVTX05BUlJPVyxcclxuICAgIGVyYVdpZGU6IGV4cG9ydHMuRVJBX05BTUVTX1dJREUsXHJcbiAgICBlcmFBYmJyZXZpYXRlZDogZXhwb3J0cy5FUkFfTkFNRVNfQUJCUkVWSUFURUQsXHJcbiAgICBxdWFydGVyTGV0dGVyOiBleHBvcnRzLlFVQVJURVJfTEVUVEVSLFxyXG4gICAgcXVhcnRlcldvcmQ6IGV4cG9ydHMuUVVBUlRFUl9XT1JELFxyXG4gICAgcXVhcnRlckFiYnJldmlhdGlvbnM6IGV4cG9ydHMuUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxyXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI6IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIsXHJcbiAgICBzdGFuZEFsb25lUXVhcnRlcldvcmQ6IGV4cG9ydHMuU1RBTkRfQUxPTkVfUVVBUlRFUl9XT1JELFxyXG4gICAgc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zOiBleHBvcnRzLlNUQU5EX0FMT05FX1FVQVJURVJfQUJCUkVWSUFUSU9OUyxcclxuICAgIGxvbmdNb250aE5hbWVzOiBleHBvcnRzLkxPTkdfTU9OVEhfTkFNRVMsXHJcbiAgICBzaG9ydE1vbnRoTmFtZXM6IGV4cG9ydHMuU0hPUlRfTU9OVEhfTkFNRVMsXHJcbiAgICBtb250aExldHRlcnM6IGV4cG9ydHMuTU9OVEhfTEVUVEVSUyxcclxuICAgIHN0YW5kQWxvbmVMb25nTW9udGhOYW1lczogZXhwb3J0cy5TVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTLFxyXG4gICAgc3RhbmRBbG9uZVNob3J0TW9udGhOYW1lczogZXhwb3J0cy5TVEFORF9BTE9ORV9TSE9SVF9NT05USF9OQU1FUyxcclxuICAgIHN0YW5kQWxvbmVNb250aExldHRlcnM6IGV4cG9ydHMuU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyxcclxuICAgIGxvbmdXZWVrZGF5TmFtZXM6IGV4cG9ydHMuTE9OR19XRUVLREFZX05BTUVTLFxyXG4gICAgc2hvcnRXZWVrZGF5TmFtZXM6IGV4cG9ydHMuU0hPUlRfV0VFS0RBWV9OQU1FUyxcclxuICAgIHdlZWtkYXlUd29MZXR0ZXJzOiBleHBvcnRzLldFRUtEQVlfVFdPX0xFVFRFUlMsXHJcbiAgICB3ZWVrZGF5TGV0dGVyczogZXhwb3J0cy5XRUVLREFZX0xFVFRFUlMsXHJcbiAgICBkYXlQZXJpb2RBYmJyZXZpYXRlZDogZXhwb3J0cy5EQVlfUEVSSU9EU19BQkJSRVZJQVRFRCxcclxuICAgIGRheVBlcmlvZFdpZGU6IGV4cG9ydHMuREFZX1BFUklPRFNfV0lERSxcclxuICAgIGRheVBlcmlvZE5hcnJvdzogZXhwb3J0cy5EQVlfUEVSSU9EU19OQVJST1dcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYWxlLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBNYXRoIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnBvc2l0aXZlTW9kdWxvID0gZXhwb3J0cy5maWx0ZXJGbG9hdCA9IGV4cG9ydHMucm91bmRTeW0gPSBleHBvcnRzLmlzSW50ID0gdm9pZCAwO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbi8qKlxyXG4gKiBAcmV0dXJuIHRydWUgaWZmIGdpdmVuIGFyZ3VtZW50IGlzIGFuIGludGVnZXIgbnVtYmVyXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNJbnQobikge1xyXG4gICAgaWYgKG4gPT09IG51bGwgfHwgIWlzRmluaXRlKG4pKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG4pID09PSBuKTtcclxufVxyXG5leHBvcnRzLmlzSW50ID0gaXNJbnQ7XHJcbi8qKlxyXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXHJcbiAqIFJvdW5kcyArMS41IHRvICsyXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5OIGlmIG4gaXMgbm90IGEgZmluaXRlIG51bWJlclxyXG4gKi9cclxuZnVuY3Rpb24gcm91bmRTeW0obikge1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZShuKSwgXCJBcmd1bWVudC5OXCIsIFwibiBtdXN0IGJlIGEgZmluaXRlIG51bWJlciBidXQgaXM6ICVkXCIsIG4pO1xyXG4gICAgaWYgKG4gPCAwKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xICogTWF0aC5yb3VuZCgtMSAqIG4pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQobik7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5yb3VuZFN5bSA9IHJvdW5kU3ltO1xyXG4vKipcclxuICogU3RyaWN0ZXIgdmFyaWFudCBvZiBwYXJzZUZsb2F0KCkuXHJcbiAqIEBwYXJhbSB2YWx1ZVx0SW5wdXQgc3RyaW5nXHJcbiAqIEByZXR1cm4gdGhlIGZsb2F0IGlmIHRoZSBzdHJpbmcgaXMgYSB2YWxpZCBmbG9hdCwgTmFOIG90aGVyd2lzZVxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGZpbHRlckZsb2F0KHZhbHVlKSB7XHJcbiAgICBpZiAoL14oXFwtfFxcKyk/KFswLTldKyhcXC5bMC05XSspP3xJbmZpbml0eSkkLy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5hTjtcclxufVxyXG5leHBvcnRzLmZpbHRlckZsb2F0ID0gZmlsdGVyRmxvYXQ7XHJcbi8qKlxyXG4gKiBNb2R1bG8gZnVuY3Rpb24gdGhhdCBvbmx5IHJldHVybnMgYSBwb3NpdGl2ZSByZXN1bHQsIGluIGNvbnRyYXN0IHRvIHRoZSAlIG9wZXJhdG9yXHJcbiAqIEBwYXJhbSB2YWx1ZVxyXG4gKiBAcGFyYW0gbW9kdWxvXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5WYWx1ZSBpZiB2YWx1ZSBpcyBub3QgZmluaXRlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5Nb2R1bG8gaWYgbW9kdWxvIGlzIG5vdCBhIGZpbml0ZSBudW1iZXIgPj0gMVxyXG4gKi9cclxuZnVuY3Rpb24gcG9zaXRpdmVNb2R1bG8odmFsdWUsIG1vZHVsbykge1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSksIFwiQXJndW1lbnQuVmFsdWVcIiwgXCJ2YWx1ZSBzaG91bGQgYmUgZmluaXRlXCIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0Zpbml0ZShtb2R1bG8pICYmIG1vZHVsbyA+PSAxLCBcIkFyZ3VtZW50Lk1vZHVsb1wiLCBcIm1vZHVsbyBzaG91bGQgYmUgPj0gMVwiKTtcclxuICAgIGlmICh2YWx1ZSA8IDApIHtcclxuICAgICAgICByZXR1cm4gKCh2YWx1ZSAlIG1vZHVsbykgKyBtb2R1bG8pICUgbW9kdWxvO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlICUgbW9kdWxvO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucG9zaXRpdmVNb2R1bG8gPSBwb3NpdGl2ZU1vZHVsbztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWF0aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcclxuLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcclxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnBhcnNlID0gZXhwb3J0cy5wYXJzZWFibGUgPSB2b2lkIDA7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcclxudmFyIGxvY2FsZV8xID0gcmVxdWlyZShcIi4vbG9jYWxlXCIpO1xyXG52YXIgbWF0aF8xID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxudmFyIHRva2VuXzEgPSByZXF1aXJlKFwiLi90b2tlblwiKTtcclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIGRhdGV0aW1lIHN0cmluZyBpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGZvcm1hdFxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byB0ZXN0XHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nIChzZWUgTERNTC5tZClcclxuICogQHBhcmFtIGFsbG93VHJhaWxpbmcgQWxsb3cgdHJhaWxpbmcgc3RyaW5nIGFmdGVyIHRoZSBkYXRlK3RpbWVcclxuICogQHBhcmFtIGxvY2FsZSBMb2NhbGUtc3BlY2lmaWMgY29uc3RhbnRzIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlYWJsZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBhbGxvd1RyYWlsaW5nLCBsb2NhbGUpIHtcclxuICAgIGlmIChhbGxvd1RyYWlsaW5nID09PSB2b2lkIDApIHsgYWxsb3dUcmFpbGluZyA9IHRydWU7IH1cclxuICAgIGlmIChsb2NhbGUgPT09IHZvaWQgMCkgeyBsb2NhbGUgPSB7fTsgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCB1bmRlZmluZWQsIGFsbG93VHJhaWxpbmcsIGxvY2FsZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBhcnNlYWJsZSA9IHBhcnNlYWJsZTtcclxuLyoqXHJcbiAqIFBhcnNlIHRoZSBzdXBwbGllZCBkYXRlVGltZSBhc3N1bWluZyB0aGUgZ2l2ZW4gZm9ybWF0LlxyXG4gKlxyXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxyXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXR0aW5nIHN0cmluZyB0byBiZSBhcHBsaWVkXHJcbiAqIEBwYXJhbSBvdmVycmlkZVpvbmUgVXNlIHRoaXMgem9uZSBpbiB0aGUgcmVzdWx0XHJcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIGNoYXJhY3RlcnMgaW4gdGhlIHNvdXJjZSBzdHJpbmdcclxuICogQHBhcmFtIGxvY2FsZSBMb2NhbGUtc3BlY2lmaWMgY29uc3RhbnRzIHN1Y2ggYXMgbW9udGggbmFtZXNcclxuICogQHJldHVybiBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3IgaWYgdGhlIGdpdmVuIGRhdGVUaW1lU3RyaW5nIGlzIHdyb25nIG9yIG5vdCBhY2NvcmRpbmcgdG8gdGhlIHBhdHRlcm5cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZyBpZiB0aGUgZ2l2ZW4gZm9ybWF0IHN0cmluZyBpcyBpbnZhbGlkXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCBvdmVycmlkZVpvbmUsIGFsbG93VHJhaWxpbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgaWYgKGFsbG93VHJhaWxpbmcgPT09IHZvaWQgMCkgeyBhbGxvd1RyYWlsaW5nID0gdHJ1ZTsgfVxyXG4gICAgaWYgKGxvY2FsZSA9PT0gdm9pZCAwKSB7IGxvY2FsZSA9IHt9OyB9XHJcbiAgICBpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcIm5vIGRhdGUgZ2l2ZW5cIik7XHJcbiAgICB9XHJcbiAgICBpZiAoIWZvcm1hdFN0cmluZykge1xyXG4gICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcIm5vIGZvcm1hdCBnaXZlblwiKTtcclxuICAgIH1cclxuICAgIHZhciBtZXJnZWRMb2NhbGUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgbG9jYWxlXzEuREVGQVVMVF9MT0NBTEUpLCBsb2NhbGUpO1xyXG4gICAgdmFyIHllYXJDdXRvZmYgPSAoMCwgbWF0aF8xLnBvc2l0aXZlTW9kdWxvKSgobmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICsgNTApLCAxMDApO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB2YXIgdG9rZW5zID0gKDAsIHRva2VuXzEudG9rZW5pemUpKGZvcm1hdFN0cmluZyk7XHJcbiAgICAgICAgdmFyIHRpbWUgPSB7IHllYXI6IHVuZGVmaW5lZCB9O1xyXG4gICAgICAgIHZhciB6b25lID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBwbnIgPSB2b2lkIDA7XHJcbiAgICAgICAgdmFyIHB6ciA9IHZvaWQgMDtcclxuICAgICAgICB2YXIgZHByID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciBlcmEgPSAxO1xyXG4gICAgICAgIHZhciBxdWFydGVyID0gdm9pZCAwO1xyXG4gICAgICAgIHZhciByZW1haW5pbmcgPSBkYXRlVGltZVN0cmluZztcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHRva2Vuc18xID0gdG9rZW5zOyBfaSA8IHRva2Vuc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0b2tlbnNfMVtfaV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5FUkE6XHJcbiAgICAgICAgICAgICAgICAgICAgX2EgPSBzdHJpcEVyYSh0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpLCBlcmEgPSBfYVswXSwgcmVtYWluaW5nID0gX2FbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLlFVQVJURVI6XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgciA9IHN0cmlwUXVhcnRlcih0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWFydGVyID0gci5uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSByLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLldFRUtEQVk6XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBzdHJpcFdlZWtEYXkodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLldFRUs6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKS5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIG5vdGhpbmcgdG8gbGVhcm4gZnJvbSB0aGlzXHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWVBFUklPRDpcclxuICAgICAgICAgICAgICAgICAgICBkcHIgPSBzdHJpcERheVBlcmlvZCh0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IGRwci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLllFQVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCBJbmZpbml0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbnIubiA+IHllYXJDdXRvZmYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IDE5MDAgKyBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUueWVhciA9IDIwMDAgKyBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS55ZWFyID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5NT05USDpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE1vbnRoKHRva2VuLCByZW1haW5pbmcsIG1lcmdlZExvY2FsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLm1vbnRoID0gcG5yLm47XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIHRva2VuXzEuVG9rZW5UeXBlLkRBWTpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5kYXkgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuSE9VUjpcclxuICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcEhvdXIodG9rZW4sIHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuTUlOVVRFOlxyXG4gICAgICAgICAgICAgICAgICAgIHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB0aW1lLm1pbnV0ZSA9IHBuci5uO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSB0b2tlbl8xLlRva2VuVHlwZS5TRUNPTkQ6XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwbnIgPSBzdHJpcFNlY29uZCh0b2tlbiwgcmVtYWluaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5zZWNvbmQgPSBwbnIubjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDEwMDAgKiBwYXJzZUZsb2F0KFwiMC5cIiArIE1hdGguZmxvb3IocG5yLm4pLnRvU3RyaW5nKDEwKS5zbGljZSgwLCAzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciA9IE1hdGguZmxvb3IoKHBuci5uIC8gMzYwMEUzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSBNYXRoLmZsb29yKCgwLCBtYXRoXzEucG9zaXRpdmVNb2R1bG8pKHBuci5uIC8gNjBFMywgNjApKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IE1hdGguZmxvb3IoKDAsIG1hdGhfMS5wb3NpdGl2ZU1vZHVsbykocG5yLm4gLyAxMDAwLCA2MCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSAoMCwgbWF0aF8xLnBvc2l0aXZlTW9kdWxvKShwbnIubiwgMTAwMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJ1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICdcIiArIHRva2VuLnJhdyArIFwiJ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuWk9ORTpcclxuICAgICAgICAgICAgICAgICAgICBwenIgPSBzdHJpcFpvbmUodG9rZW4sIHJlbWFpbmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gcHpyLnJlbWFpbmluZztcclxuICAgICAgICAgICAgICAgICAgICB6b25lID0gcHpyLnpvbmU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNhc2UgdG9rZW5fMS5Ub2tlblR5cGUuSURFTlRJVFk6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcHIpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChkcHIudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImFtXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciAhPT0gdW5kZWZpbmVkICYmIHRpbWUuaG91ciA+PSAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLmhvdXIgLT0gMTI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInBtXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciAhPT0gdW5kZWZpbmVkICYmIHRpbWUuaG91ciA8IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUuaG91ciArPSAxMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwibm9vblwiOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgPT09IHVuZGVmaW5lZCB8fCB0aW1lLmhvdXIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMTI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLm1pbnV0ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWludXRlID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuc2Vjb25kID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5zZWNvbmQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5taWxsaSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUubWlsbGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5ob3VyICE9PSAxMiB8fCB0aW1lLm1pbnV0ZSAhPT0gMCB8fCB0aW1lLnNlY29uZCAhPT0gMCB8fCB0aW1lLm1pbGxpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJpbnZhbGlkIHRpbWUsIGNvbnRhaW5zICdub29uJyBzcGVjaWZpZXIgYnV0IHRpbWUgZGlmZmVycyBmcm9tIG5vb25cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm1pZG5pZ2h0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gdW5kZWZpbmVkIHx8IHRpbWUuaG91ciA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUuaG91ciA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5ob3VyID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWUubWludXRlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taW51dGUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lLnNlY29uZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLm1pbGxpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5taWxsaSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lLmhvdXIgIT09IDAgfHwgdGltZS5taW51dGUgIT09IDAgfHwgdGltZS5zZWNvbmQgIT09IDAgfHwgdGltZS5taWxsaSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCB0aW1lLCBjb250YWlucyAnbWlkbmlnaHQnIHNwZWNpZmllciBidXQgdGltZSBkaWZmZXJzIGZyb20gbWlkbmlnaHRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aW1lLnllYXIgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aW1lLnllYXIgKj0gZXJhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocXVhcnRlciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmICh0aW1lLm1vbnRoID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAocXVhcnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IDQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IDc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZS5tb250aCA9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBlcnJvcl8yID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHF1YXJ0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gMSAmJiB0aW1lLm1vbnRoIDw9IDMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gNCAmJiB0aW1lLm1vbnRoIDw9IDYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gNyAmJiB0aW1lLm1vbnRoIDw9IDkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzIgPSAhKHRpbWUubW9udGggPj0gMTAgJiYgdGltZS5tb250aCA8PSAxMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yXzIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwidGhlIHF1YXJ0ZXIgZG9lcyBub3QgbWF0Y2ggdGhlIG1vbnRoXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aW1lLnllYXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aW1lLnllYXIgPSAxOTcwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVzdWx0ID0geyB0aW1lOiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh0aW1lKSwgem9uZTogem9uZSB9O1xyXG4gICAgICAgIGlmICghcmVzdWx0LnRpbWUudmFsaWRhdGUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCByZXN1bHRpbmcgZGF0ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxyXG4gICAgICAgIGlmIChvdmVycmlkZVpvbmUpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnpvbmUgPSBvdmVycmlkZVpvbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZW1haW5pbmcgJiYgIWFsbG93VHJhaWxpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgZGF0ZSAnXCIgKyBkYXRlVGltZVN0cmluZyArIFwiJyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnXCIgKyBmb3JtYXRTdHJpbmcgKyBcIic6IHRyYWlsaW5nIGNoYXJhY3RlcnM6ICdcIiArIHJlbWFpbmluZyArIFwiJ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiUGFyc2VFcnJvclwiLCBcImludmFsaWQgZGF0ZSAnXCIgKyBkYXRlVGltZVN0cmluZyArIFwiJyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnXCIgKyBmb3JtYXRTdHJpbmcgKyBcIic6IFwiICsgZS5tZXNzYWdlKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XHJcbnZhciBXSElURVNQQUNFID0gW1wiIFwiLCBcIlxcdFwiLCBcIlxcclwiLCBcIlxcdlwiLCBcIlxcblwiXTtcclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gc1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90SW1wbGVtZW50ZWQgaWYgYSBwYXR0ZXJuIGlzIHVzZWQgdGhhdCBpc24ndCBpbXBsZW1lbnRlZCB5ZXQgKHosIFosIHYsIFYsIHgsIFgpXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgbm90IHBhcnNlYWJsZVxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBab25lKHRva2VuLCBzKSB7XHJcbiAgICB2YXIgdW5zdXBwb3J0ZWQgPSAodG9rZW4uc3ltYm9sID09PSBcInpcIilcclxuICAgICAgICB8fCAodG9rZW4uc3ltYm9sID09PSBcIlpcIiAmJiB0b2tlbi5sZW5ndGggPT09IDUpXHJcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJ2XCIpXHJcbiAgICAgICAgfHwgKHRva2VuLnN5bWJvbCA9PT0gXCJWXCIgJiYgdG9rZW4ubGVuZ3RoICE9PSAyKVxyXG4gICAgICAgIHx8ICh0b2tlbi5zeW1ib2wgPT09IFwieFwiICYmIHRva2VuLmxlbmd0aCA+PSA0KVxyXG4gICAgICAgIHx8ICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIHRva2VuLmxlbmd0aCA+PSA0KTtcclxuICAgIGlmICh1bnN1cHBvcnRlZCkge1xyXG4gICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIk5vdEltcGxlbWVudGVkXCIsIFwidGltZSB6b25lIHBhdHRlcm4gJ1wiICsgdG9rZW4ucmF3ICsgXCInIGlzIG5vdCBpbXBsZW1lbnRlZFwiKTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSB7XHJcbiAgICAgICAgcmVtYWluaW5nOiBzXHJcbiAgICB9O1xyXG4gICAgLy8gY2hvcCBvZmYgXCJHTVRcIiBwcmVmaXggaWYgbmVlZGVkXHJcbiAgICB2YXIgaGFkR01UID0gZmFsc2U7XHJcbiAgICBpZiAoKHRva2VuLnN5bWJvbCA9PT0gXCJaXCIgJiYgdG9rZW4ubGVuZ3RoID09PSA0KSB8fCB0b2tlbi5zeW1ib2wgPT09IFwiT1wiKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5yZW1haW5pbmcudG9VcHBlckNhc2UoKS5zdGFydHNXaXRoKFwiR01UXCIpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnNsaWNlKDMpO1xyXG4gICAgICAgICAgICBoYWRHTVQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHBhcnNlIGFueSB6b25lLCByZWdhcmRsZXNzIG9mIHNwZWNpZmllZCBmb3JtYXRcclxuICAgIHZhciB6b25lU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgV0hJVEVTUEFDRS5pbmRleE9mKHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApKSA9PT0gLTEpIHtcclxuICAgICAgICB6b25lU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG4gICAgICAgIHJlc3VsdC5yZW1haW5pbmcgPSByZXN1bHQucmVtYWluaW5nLnN1YnN0cigxKTtcclxuICAgIH1cclxuICAgIHpvbmVTdHJpbmcgPSB6b25lU3RyaW5nLnRyaW0oKTtcclxuICAgIGlmICh6b25lU3RyaW5nKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlIGNob3BwaW5nIG9mZiBHTVQgZG9lcyBub3QgaGlkZSB0aW1lIHpvbmUgZXJyb3JzIChiaXQgb2YgYSBzbG9wcHkgcmVnZXggYnV0IE9LKVxyXG4gICAgICAgIGlmIChoYWRHTVQgJiYgIXpvbmVTdHJpbmcubWF0Y2goL1tcXCtcXC1dP1tcXGRcXDpdKy9pKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCB0aW1lIHpvbmUgJ0dNVFwiICsgem9uZVN0cmluZyArIFwiJ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0LnpvbmUgPSB0aW1lem9uZV8xLlRpbWVab25lLnpvbmUoem9uZVN0cmluZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmICgoMCwgZXJyb3JfMS5lcnJvcklzKShlLCBbXCJBcmd1bWVudC5TXCIsIFwiTm90Rm91bmQuWm9uZVwiXSkpIHtcclxuICAgICAgICAgICAgICAgIGUgPSAoMCwgZXJyb3JfMS5lcnJvcikoXCJQYXJzZUVycm9yXCIsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwibm8gdGltZSB6b25lIGdpdmVuXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHNcclxuICogQHBhcmFtIGV4cGVjdGVkXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBzdHJpcFJhdyhzLCBleHBlY3RlZCkge1xyXG4gICAgdmFyIHJlbWFpbmluZyA9IHM7XHJcbiAgICB2YXIgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xyXG4gICAgd2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIGVyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuY2hhckF0KDApID09PSBlcmVtYWluaW5nLmNoYXJBdCgwKSkge1xyXG4gICAgICAgIHJlbWFpbmluZyA9IHJlbWFpbmluZy5zdWJzdHIoMSk7XHJcbiAgICAgICAgZXJlbWFpbmluZyA9IGVyZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgaWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIlBhcnNlRXJyb3JcIiwgXCJleHBlY3RlZCAnXCIgKyBleHBlY3RlZCArIFwiJ1wiKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZW1haW5pbmc7XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEBwYXJhbSBsb2NhbGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICovXHJcbmZ1bmN0aW9uIHN0cmlwRGF5UGVyaW9kKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2Y7XHJcbiAgICB2YXIgb2Zmc2V0cztcclxuICAgIHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XHJcbiAgICAgICAgY2FzZSBcImFcIjpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9hID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hW2xvY2FsZS5kYXlQZXJpb2RXaWRlLmFtXSA9IFwiYW1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2FbbG9jYWxlLmRheVBlcmlvZFdpZGUucG1dID0gXCJwbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfYiA9IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYltsb2NhbGUuZGF5UGVyaW9kTmFycm93LmFtXSA9IFwiYW1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2JbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbV0gPSBcInBtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0cyA9IChfYyA9IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfY1tsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW1dID0gXCJhbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfY1tsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG1dID0gXCJwbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9kID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLmFtXSA9IFwiYW1cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2RbbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHRdID0gXCJtaWRuaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZFtsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbV0gPSBcInBtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kW2xvY2FsZS5kYXlQZXJpb2RXaWRlLm5vb25dID0gXCJub29uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9lID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW1dID0gXCJhbVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZVtsb2NhbGUuZGF5UGVyaW9kTmFycm93Lm1pZG5pZ2h0XSA9IFwibWlkbmlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2VbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbV0gPSBcInBtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lW2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cubm9vbl0gPSBcIm5vb25cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgX2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRzID0gKF9mID0ge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbV0gPSBcImFtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5taWRuaWdodF0gPSBcIm1pZG5pZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbV0gPSBcInBtXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mW2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5ub29uXSA9IFwibm9vblwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBfZik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICAvLyBtYXRjaCBsb25nZXN0IHBvc3NpYmxlIGRheSBwZXJpb2Qgc3RyaW5nOyBzb3J0IGtleXMgYnkgbGVuZ3RoIGRlc2NlbmRpbmdcclxuICAgIHZhciBzb3J0ZWRLZXlzID0gT2JqZWN0LmtleXMob2Zmc2V0cylcclxuICAgICAgICAuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gKGEubGVuZ3RoIDwgYi5sZW5ndGggPyAxIDogYS5sZW5ndGggPiBiLmxlbmd0aCA/IC0xIDogMCk7IH0pO1xyXG4gICAgdmFyIHVwcGVyID0gcmVtYWluaW5nLnRvVXBwZXJDYXNlKCk7XHJcbiAgICBmb3IgKHZhciBfaSA9IDAsIHNvcnRlZEtleXNfMSA9IHNvcnRlZEtleXM7IF9pIDwgc29ydGVkS2V5c18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgIHZhciBrZXkgPSBzb3J0ZWRLZXlzXzFbX2ldO1xyXG4gICAgICAgIGlmICh1cHBlci5zdGFydHNXaXRoKGtleS50b1VwcGVyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogb2Zmc2V0c1trZXldLFxyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmcuc2xpY2Uoa2V5Lmxlbmd0aClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwibWlzc2luZyBkYXkgcGVyaW9kIGkuZS4gXCIgKyBPYmplY3Qua2V5cyhvZmZzZXRzKS5qb2luKFwiLCBcIikpO1xyXG59XHJcbi8qKlxyXG4gKiBSZXR1cm5zIGZhY3RvciAtMSBvciAxIGRlcGVuZGluZyBvbiBCQyBvciBBRFxyXG4gKiBAcGFyYW0gdG9rZW5cclxuICogQHBhcmFtIHJlbWFpbmluZ1xyXG4gKiBAcGFyYW0gbG9jYWxlXHJcbiAqIEByZXR1cm5zIFtmYWN0b3IsIHJlbWFpbmluZ11cclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICovXHJcbmZ1bmN0aW9uIHN0cmlwRXJhKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIGFsbG93ZWQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5lcmFXaWRlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIGFsbG93ZWQgPSBsb2NhbGUuZXJhTmFycm93O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLmVyYUFiYnJldmlhdGVkO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XHJcbiAgICByZXR1cm4gW2FsbG93ZWQuaW5kZXhPZihyZXN1bHQuY2hvc2VuKSA9PT0gMCA/IDEgOiAtMSwgcmVzdWx0LnJlbWFpbmluZ107XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEBwYXJhbSBsb2NhbGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBRdWFydGVyKHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIHF1YXJ0ZXJMZXR0ZXI7XHJcbiAgICB2YXIgcXVhcnRlcldvcmQ7XHJcbiAgICB2YXIgcXVhcnRlckFiYnJldmlhdGlvbnM7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJRXCI6XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJMZXR0ZXIgPSBsb2NhbGUucXVhcnRlckxldHRlcjtcclxuICAgICAgICAgICAgcXVhcnRlcldvcmQgPSBsb2NhbGUucXVhcnRlcldvcmQ7XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJBYmJyZXZpYXRpb25zID0gbG9jYWxlLnF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwicVwiOiB7XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJMZXR0ZXIgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI7XHJcbiAgICAgICAgICAgIHF1YXJ0ZXJXb3JkID0gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyV29yZDtcclxuICAgICAgICAgICAgcXVhcnRlckFiYnJldmlhdGlvbnMgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcclxuICAgIH1cclxuICAgIHZhciBhbGxvd2VkO1xyXG4gICAgc3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAxKTtcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IFsxLCAyLCAzLCA0XS5tYXAoZnVuY3Rpb24gKG4pIHsgcmV0dXJuIHF1YXJ0ZXJMZXR0ZXIgKyBuLnRvU3RyaW5nKDEwKTsgfSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IHF1YXJ0ZXJBYmJyZXZpYXRpb25zLm1hcChmdW5jdGlvbiAoYSkgeyByZXR1cm4gYSArIFwiIFwiICsgcXVhcnRlcldvcmQ7IH0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIHIgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XHJcbiAgICByZXR1cm4geyBuOiBhbGxvd2VkLmluZGV4T2Yoci5jaG9zZW4pICsgMSwgcmVtYWluaW5nOiByLnJlbWFpbmluZyB9O1xyXG59XHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gdG9rZW5cclxuICogQHBhcmFtIHJlbWFpbmluZ1xyXG4gKiBAcGFyYW0gbG9jYWxlXHJcbiAqIEByZXR1cm5zIHJlbWFpbmluZyBzdHJpbmdcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBXZWVrRGF5KHRva2VuLCByZW1haW5pbmcsIGxvY2FsZSkge1xyXG4gICAgdmFyIGFsbG93ZWQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAxKS5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRva2VuLnN5bWJvbCA9PT0gXCJlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKS5yZW1haW5pbmc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLnNob3J0V2Vla2RheU5hbWVzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lcztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLmxvbmdXZWVrZGF5TmFtZXM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IGxvY2FsZS53ZWVrZGF5TGV0dGVycztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9jYWxlLndlZWtkYXlUd29MZXR0ZXJzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LkZvcm1hdFN0cmluZ1wiLCBcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIHIgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XHJcbiAgICByZXR1cm4gci5yZW1haW5pbmc7XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEBwYXJhbSBsb2NhbGVcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlBhcnNlRXJyb3JcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZvcm1hdFN0cmluZ1xyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBNb250aCh0b2tlbiwgcmVtYWluaW5nLCBsb2NhbGUpIHtcclxuICAgIHZhciBzaG9ydE1vbnRoTmFtZXM7XHJcbiAgICB2YXIgbG9uZ01vbnRoTmFtZXM7XHJcbiAgICB2YXIgbW9udGhMZXR0ZXJzO1xyXG4gICAgc3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcclxuICAgICAgICBjYXNlIFwiTVwiOlxyXG4gICAgICAgICAgICBzaG9ydE1vbnRoTmFtZXMgPSBsb2NhbGUuc2hvcnRNb250aE5hbWVzO1xyXG4gICAgICAgICAgICBsb25nTW9udGhOYW1lcyA9IGxvY2FsZS5sb25nTW9udGhOYW1lcztcclxuICAgICAgICAgICAgbW9udGhMZXR0ZXJzID0gbG9jYWxlLm1vbnRoTGV0dGVycztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkxcIjpcclxuICAgICAgICAgICAgc2hvcnRNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM7XHJcbiAgICAgICAgICAgIGxvbmdNb250aE5hbWVzID0gbG9jYWxlLnN0YW5kQWxvbmVMb25nTW9udGhOYW1lcztcclxuICAgICAgICAgICAgbW9udGhMZXR0ZXJzID0gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXJndW1lbnQuRm9ybWF0U3RyaW5nXCIsIFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIGFsbG93ZWQ7XHJcbiAgICBzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xyXG4gICAgICAgIGNhc2UgMTpcclxuICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xyXG4gICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IHNob3J0TW9udGhOYW1lcztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICBhbGxvd2VkID0gbG9uZ01vbnRoTmFtZXM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgYWxsb3dlZCA9IG1vbnRoTGV0dGVycztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIG1vbnRoIHBhdHRlcm5cIik7XHJcbiAgICB9XHJcbiAgICB2YXIgciA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcclxuICAgIHJldHVybiB7IG46IGFsbG93ZWQuaW5kZXhPZihyLmNob3NlbikgKyAxLCByZW1haW5pbmc6IHIucmVtYWluaW5nIH07XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB0b2tlblxyXG4gKiBAcGFyYW0gcmVtYWluaW5nXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5QYXJzZUVycm9yXHJcbiAqL1xyXG5mdW5jdGlvbiBzdHJpcEhvdXIodG9rZW4sIHJlbWFpbmluZykge1xyXG4gICAgdmFyIHJlc3VsdCA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJoXCI6XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQubiA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5uID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiSFwiOlxyXG4gICAgICAgICAgICAvLyBub3RoaW5nLCBpbiByYW5nZSAwLTIzXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJLXCI6XHJcbiAgICAgICAgICAgIC8vIG5vdGhpbmcsIGluIHJhbmdlIDAtMTFcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImtcIjpcclxuICAgICAgICAgICAgcmVzdWx0Lm4gLT0gMTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gdG9rZW5cclxuICogQHBhcmFtIHJlbWFpbmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRm9ybWF0U3RyaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBzdHJpcFNlY29uZCh0b2tlbiwgcmVtYWluaW5nKSB7XHJcbiAgICBzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xyXG4gICAgICAgIGNhc2UgXCJzXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xyXG4gICAgICAgIGNhc2UgXCJTXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIHRva2VuLmxlbmd0aCk7XHJcbiAgICAgICAgY2FzZSBcIkFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgOCk7XHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5Gb3JtYXRTdHJpbmdcIiwgXCJpbnZhbGlkIHNlY29uZHMgcGF0dGVyblwiKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHNcclxuICogQHBhcmFtIG1heExlbmd0aFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBOdW1iZXIocywgbWF4TGVuZ3RoKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgIG46IE5hTixcclxuICAgICAgICByZW1haW5pbmc6IHNcclxuICAgIH07XHJcbiAgICB2YXIgbnVtYmVyU3RyaW5nID0gXCJcIjtcclxuICAgIHdoaWxlIChudW1iZXJTdHJpbmcubGVuZ3RoIDwgbWF4TGVuZ3RoICYmIHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykpIHtcclxuICAgICAgICBudW1iZXJTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcbiAgICAgICAgcmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgLy8gcmVtb3ZlIGxlYWRpbmcgemVyb2VzXHJcbiAgICB3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBudW1iZXJTdHJpbmcgPSBudW1iZXJTdHJpbmcuc3Vic3RyKDEpO1xyXG4gICAgfVxyXG4gICAgcmVzdWx0Lm4gPSBwYXJzZUludChudW1iZXJTdHJpbmcsIDEwKTtcclxuICAgIGlmIChudW1iZXJTdHJpbmcgPT09IFwiXCIgfHwgIU51bWJlci5pc0Zpbml0ZShyZXN1bHQubikpIHtcclxuICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiZXhwZWN0ZWQgYSBudW1iZXIgYnV0IGdvdCAnXCIgKyBudW1iZXJTdHJpbmcgKyBcIidcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gdG9rZW5cclxuICogQHBhcmFtIHJlbWFpbmluZ1xyXG4gKiBAcGFyYW0gYWxsb3dlZFxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuUGFyc2VFcnJvclxyXG4gKi9cclxuZnVuY3Rpb24gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpIHtcclxuICAgIC8vIG1hdGNoIGxvbmdlc3QgcG9zc2libGUgc3RyaW5nOyBzb3J0IGtleXMgYnkgbGVuZ3RoIGRlc2NlbmRpbmdcclxuICAgIHZhciBzb3J0ZWRLZXlzID0gYWxsb3dlZC5zbGljZSgpXHJcbiAgICAgICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIChhLmxlbmd0aCA8IGIubGVuZ3RoID8gMSA6IGEubGVuZ3RoID4gYi5sZW5ndGggPyAtMSA6IDApOyB9KTtcclxuICAgIHZhciB1cHBlciA9IHJlbWFpbmluZy50b1VwcGVyQ2FzZSgpO1xyXG4gICAgZm9yICh2YXIgX2kgPSAwLCBzb3J0ZWRLZXlzXzIgPSBzb3J0ZWRLZXlzOyBfaSA8IHNvcnRlZEtleXNfMi5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICB2YXIga2V5ID0gc29ydGVkS2V5c18yW19pXTtcclxuICAgICAgICBpZiAodXBwZXIuc3RhcnRzV2l0aChrZXkudG9VcHBlckNhc2UoKSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNob3Nlbjoga2V5LFxyXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nOiByZW1haW5pbmcuc2xpY2Uoa2V5Lmxlbmd0aClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJQYXJzZUVycm9yXCIsIFwiaW52YWxpZCBcIiArIHRva2VuXzEuVG9rZW5UeXBlW3Rva2VuLnR5cGVdLnRvTG93ZXJDYXNlKCkgKyBcIiwgZXhwZWN0ZWQgb25lIG9mIFwiICsgYWxsb3dlZC5qb2luKFwiLCBcIikpO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnNlLmpzLm1hcCIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBQZXJpb2RpYyBpbnRlcnZhbCBmdW5jdGlvbnNcclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuID0gZXhwb3J0cy50aW1lc3RhbXBPbldlZWtUaW1lR3JlYXRlclRoYW5PckVxdWFsVG8gPSBleHBvcnRzLmlzUGVyaW9kID0gZXhwb3J0cy5pc1ZhbGlkUGVyaW9kSnNvbiA9IGV4cG9ydHMuUGVyaW9kID0gZXhwb3J0cy5wZXJpb2REc3RUb1N0cmluZyA9IGV4cG9ydHMuUGVyaW9kRHN0ID0gdm9pZCAwO1xyXG52YXIgYXNzZXJ0XzEgPSByZXF1aXJlKFwiLi9hc3NlcnRcIik7XHJcbnZhciBiYXNpY3NfMSA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxudmFyIGRhdGV0aW1lXzEgPSByZXF1aXJlKFwiLi9kYXRldGltZVwiKTtcclxudmFyIGR1cmF0aW9uXzEgPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxudmFyIGVycm9yXzEgPSByZXF1aXJlKFwiLi9lcnJvclwiKTtcclxudmFyIHRpbWV6b25lXzEgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuLyoqXHJcbiAqIFNwZWNpZmllcyBob3cgdGhlIHBlcmlvZCBzaG91bGQgcmVwZWF0IGFjcm9zcyB0aGUgZGF5XHJcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cclxuICovXHJcbnZhciBQZXJpb2REc3Q7XHJcbihmdW5jdGlvbiAoUGVyaW9kRHN0KSB7XHJcbiAgICAvKipcclxuICAgICAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcclxuICAgICAqIHVuYWZmZWN0ZWQgYnkgRGF5bGlnaHQgU2F2aW5nIFRpbWUuXHJcbiAgICAgKiBFLmcuIGEgcmVwZXRpdGlvbiBvZiBvbmUgaG91ciB3aWxsIHRha2Ugb25lIHJlYWwgaG91clxyXG4gICAgICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cclxuICAgICAqIExlYXAgc2Vjb25kcywgbGVhcCBkYXlzIGFuZCBtb250aCBsZW5ndGhcclxuICAgICAqIGRpZmZlcmVuY2VzIHdpbGwgc3RpbGwgbWFrZSB0aGUgaW50ZXJ2YWxzIGRpZmZlcmVudC5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJJbnRlcnZhbHNcIl0gPSAwXSA9IFwiUmVndWxhckludGVydmFsc1wiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcclxuICAgICAqIGF0IHRoZSBzYW1lIHBsYWNlIGluIHRoZSBkYXksIGxvY2FsIHRpbWUuIFNvIGUuZy5cclxuICAgICAqIGEgcGVyaW9kIG9mIG9uZSBkYXksIHJlZmVyZW5jZWluZyBhdCA4OjA1QU0gRXVyb3BlL0Ftc3RlcmRhbSB0aW1lXHJcbiAgICAgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcclxuICAgICAqIGluIFVUQyB0aW1lLCBzb21lIGludGVydmFscyB3aWxsIGJlIDI1IGhvdXJzIGFuZCBzb21lXHJcbiAgICAgKiAyMyBob3VycyBkdXJpbmcgRFNUIGNoYW5nZXMuXHJcbiAgICAgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxyXG4gICAgICogc2tpcHBpbmcgYW4gaG91ciBpbiBVVEMgZm9yIGEgRFNUIGJhY2t3YXJkIGNoYW5nZS5cclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIlJlZ3VsYXJMb2NhbFRpbWVcIl0gPSAxXSA9IFwiUmVndWxhckxvY2FsVGltZVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBFbmQtb2YtZW51bSBtYXJrZXJcclxuICAgICAqL1xyXG4gICAgUGVyaW9kRHN0W1BlcmlvZERzdFtcIk1BWFwiXSA9IDJdID0gXCJNQVhcIjtcclxufSkoUGVyaW9kRHN0ID0gZXhwb3J0cy5QZXJpb2REc3QgfHwgKGV4cG9ydHMuUGVyaW9kRHN0ID0ge30pKTtcclxuLyoqXHJcbiAqIENvbnZlcnQgYSBQZXJpb2REc3QgdG8gYSBzdHJpbmc6IFwicmVndWxhciBpbnRlcnZhbHNcIiBvciBcInJlZ3VsYXIgbG9jYWwgdGltZVwiXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5QIGZvciBpbnZhbGlkIFBlcmlvZERzdCB2YWx1ZVxyXG4gKi9cclxuZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocCkge1xyXG4gICAgc3dpdGNoIChwKSB7XHJcbiAgICAgICAgY2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcclxuICAgICAgICBjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LlBcIiwgXCJpbnZhbGlkIFBlcmlvRHN0IHZhbHVlICVkXCIsIHApO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucGVyaW9kRHN0VG9TdHJpbmcgPSBwZXJpb2REc3RUb1N0cmluZztcclxuLyoqXHJcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcclxuICogYSB0aW1lIGxlbmd0aC4gVGhpcyBjbGFzcyBhY2NvdW50cyBmb3IgbGVhcCBzZWNvbmRzIGFuZCBsZWFwIGRheXMuXHJcbiAqL1xyXG52YXIgUGVyaW9kID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFBlcmlvZChhLCBhbW91bnRPckludGVydmFsLCB1bml0T3JEc3QsIGdpdmVuRHN0KSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmtpbmQgPSBcIlBlcmlvZFwiO1xyXG4gICAgICAgIHZhciByZWZlcmVuY2U7XHJcbiAgICAgICAgdmFyIGludGVydmFsO1xyXG4gICAgICAgIHZhciBkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcclxuICAgICAgICBpZiAoKDAsIGRhdGV0aW1lXzEuaXNEYXRlVGltZSkoYSkpIHtcclxuICAgICAgICAgICAgcmVmZXJlbmNlID0gYTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoYW1vdW50T3JJbnRlcnZhbCkgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgIGludGVydmFsID0gYW1vdW50T3JJbnRlcnZhbDtcclxuICAgICAgICAgICAgICAgIGRzdCA9IHVuaXRPckRzdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0eXBlb2YgdW5pdE9yRHN0ID09PSBcIm51bWJlclwiICYmIHVuaXRPckRzdCA+PSAwICYmIHVuaXRPckRzdCA8IGJhc2ljc18xLlRpbWVVbml0Lk1BWCwgXCJBcmd1bWVudC5Vbml0XCIsIFwiSW52YWxpZCB1bml0XCIpO1xyXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbihhbW91bnRPckludGVydmFsLCB1bml0T3JEc3QpO1xyXG4gICAgICAgICAgICAgICAgZHN0ID0gZ2l2ZW5Ec3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkc3QgIT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGRzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoYS5yZWZlcmVuY2UpO1xyXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbihhLmR1cmF0aW9uKTtcclxuICAgICAgICAgICAgICAgIGRzdCA9IGEucGVyaW9kRHN0ID09PSBcInJlZ3VsYXJcIiA/IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIDogUGVyaW9kRHN0LlJlZ3VsYXJMb2NhbFRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50Lkpzb25cIiwgZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiQXJndW1lbnQuRHN0XCIsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcclxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoaW50ZXJ2YWwuYW1vdW50KCkgPiAwLCBcIkFyZ3VtZW50LkludGVydmFsXCIsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKGludGVydmFsLmFtb3VudCgpKSwgXCJBcmd1bWVudC5JbnRlcnZhbFwiLCBcIkFtb3VudCBtdXN0IGJlIGEgd2hvbGUgbnVtYmVyXCIpO1xyXG4gICAgICAgIHRoaXMuX3JlZmVyZW5jZSA9IHJlZmVyZW5jZTtcclxuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IGludGVydmFsO1xyXG4gICAgICAgIHRoaXMuX2RzdCA9IGRzdDtcclxuICAgICAgICB0aGlzLl9jYWxjSW50ZXJuYWxWYWx1ZXMoKTtcclxuICAgICAgICAvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcclxuICAgICAgICAvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXHJcbiAgICAgICAgLy8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cclxuICAgICAgICBpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDg2NDAwMDAwLCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAsIFwiQXJndW1lbnQuSW50ZXJ2YWwuTm90SW1wbGVtZW50ZWRcIiwgXCJXaGVuIHVzaW5nIEhvdXIsIE1pbnV0ZSBvciAoTWlsbGkpU2Vjb25kIHVuaXRzLCB3aXRoIFJlZ3VsYXIgTG9jYWwgVGltZXMsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxNDQwLCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDI0LCBcIkFyZ3VtZW50LkludGVydmFsLk5vdEltcGxlbWVudGVkXCIsIFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlbiB0aGUgYW1vdW50IG11c3QgYmUgZWl0aGVyIGxlc3MgdGhhbiBhIGRheSBvciBhIG11bHRpcGxlIG9mIHRoZSBuZXh0IHVuaXQuXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gYSBmcmVzaCBjb3B5IG9mIHRoZSBwZXJpb2RcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUGVyaW9kKHRoaXMuX3JlZmVyZW5jZSwgdGhpcy5faW50ZXJ2YWwsIHRoaXMuX2RzdCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnJlZmVyZW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBpbnRlcnZhbFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuaW50ZXJ2YWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVydmFsLmNsb25lKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYW1vdW50IG9mIHVuaXRzIG9mIHRoZSBpbnRlcnZhbFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuYW1vdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1bml0IG9mIHRoZSBpbnRlcnZhbFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUudW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRzdCBoYW5kbGluZyBtb2RlXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5kc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RzdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBwZXJpb2QgZ3JlYXRlciB0aGFuXHJcbiAgICAgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXHJcbiAgICAgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3RcclxuICAgICAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYWZ0ZXIgd2hpY2ggdG8gcmV0dXJuIHRoZSBuZXh0IGRhdGVcclxuICAgICAqIEByZXR1cm4gdGhlIGZpcnN0IGRhdGUgbWF0Y2hpbmcgdGhlIHBlcmlvZCBhZnRlciBmcm9tRGF0ZSwgZ2l2ZW4gaW4gdGhlIHNhbWUgem9uZSBhcyB0aGUgZnJvbURhdGUuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uIGlmIG5vdCBib3RoIGZyb21kYXRlIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZSBvZiB0aW1lIHpvbmVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRGaXJzdCA9IGZ1bmN0aW9uIChmcm9tRGF0ZSkge1xyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhZnJvbURhdGUuem9uZSgpLCBcIlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvblwiLCBcIlRoZSBmcm9tRGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgdmFyIGFwcHJveDtcclxuICAgICAgICB2YXIgYXBwcm94MjtcclxuICAgICAgICB2YXIgYXBwcm94TWluO1xyXG4gICAgICAgIHZhciBwZXJpb2RzO1xyXG4gICAgICAgIHZhciBkaWZmO1xyXG4gICAgICAgIHZhciBuZXdZZWFyO1xyXG4gICAgICAgIHZhciByZW1haW5kZXI7XHJcbiAgICAgICAgdmFyIGltYXg7XHJcbiAgICAgICAgdmFyIGltaW47XHJcbiAgICAgICAgdmFyIGltaWQ7XHJcbiAgICAgICAgdmFyIG5vcm1hbEZyb20gPSB0aGlzLl9ub3JtYWxpemVEYXkoZnJvbURhdGUudG9ab25lKHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpKTtcclxuICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPT09IDEpIHtcclxuICAgICAgICAgICAgLy8gc2ltcGxlIGNhc2VzOiBhbW91bnQgZXF1YWxzIDEgKGVsaW1pbmF0ZXMgbmVlZCBmb3Igc2VhcmNoaW5nIGZvciByZWZlcmVuY2VpbmcgcG9pbnQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhcHBseSB0byBVVEMgdGltZVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgbm9ybWFsRnJvbS51dGNTZWNvbmQoKSwgbm9ybWFsRnJvbS51dGNNaWxsaXNlY29uZCgpLCB0aW1lem9uZV8xLlRpbWVab25lLnV0YygpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksIG5vcm1hbEZyb20udXRjSG91cigpLCBub3JtYWxGcm9tLnV0Y01pbnV0ZSgpLCBub3JtYWxGcm9tLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCBub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSwgbm9ybWFsRnJvbS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIHRpbWV6b25lXzEuVGltZVpvbmUudXRjKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1vbnRoOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuWWVhcjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS51dGNZZWFyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgdGltZXpvbmVfMS5UaW1lWm9uZS51dGMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCBpbnRlcnZhbHNcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIG5vcm1hbEZyb20ubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkhvdXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksIG5vcm1hbEZyb20uaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LkRheTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5vcm1hbEZyb20ueWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwiVW5rbm93biBUaW1lVW5pdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEFtb3VudCBpcyBub3QgMSxcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHRvIFVUQyB0aW1lXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuc2Vjb25kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnV0Y1llYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNZZWFyKCkpICogMTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0LlllYXI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAtMSBiZWxvdyBpcyBiZWNhdXNlIHRoZSBkYXktb2YtbW9udGggb2YgcmVmZXJlbmNlIGRhdGUgbWF5IGJlIGFmdGVyIHRoZSBkYXkgb2YgdGhlIGZyb21EYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmYgPSBub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuWWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGtlZXAgcmVndWxhciBsb2NhbCB0aW1lcy4gSWYgdGhlIHVuaXQgaXMgbGVzcyB0aGFuIGEgZGF5LCB3ZSByZWZlcmVuY2UgZWFjaCBkYXkgYW5ld1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCAxMDAwICYmICgxMDAwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb246IHNhbWUgbWlsbGlzZWNvbmQgZWFjaCBzZWNvbmQsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogYmluYXJ5IHNlYXJjaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1heCA9IE1hdGguZmxvb3IoKDg2NDAwMDAwKSAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGltYXggPj0gaW1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWlkcG9pbnQgZm9yIHJvdWdobHkgZXF1YWwgcGFydGl0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pZCA9IE1hdGguZmxvb3IoKGltaW4gKyBpbWF4KSAvIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveDIgPSBhcHByb3guYWRkTG9jYWwoaW1pZCAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3gyLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pICYmIGFwcHJveE1pbi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94MjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFwcHJveDIubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltaW4gPSBpbWlkICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYXggPSBpbWlkIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBzYW1lIHNlY29uZCBlYWNoIG1pbnV0ZSwgc28ganVzdCB0YWtlIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWludXMgb25lIG1pbnV0ZSB3aXRoIHRoZSB0aGlzLl9pbnRSZWZlcmVuY2Ugc2Vjb25kc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgbm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YkxvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0Lk1pbnV0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwZXIgY29uc3RydWN0b3IgYXNzZXJ0LCB0aGUgc2Vjb25kcyBhcmUgbGVzcyB0aGFuIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSByZWZlcmVuY2Utb2YtZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksIHdlIGhhdmUgdG8gdGFrZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5TZWNvbmQpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gTWF0aC5mbG9vcigoODY0MDApIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1pbiA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaW1heCA+PSBpbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIGJhc2ljc18xLlRpbWVVbml0LlNlY29uZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveDI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWluIGluZGV4IHRvIHNlYXJjaCB1cHBlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWluID0gaW1pZCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgbWF4IGluZGV4IHRvIHNlYXJjaCBsb3dlciBzdWJhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWF4ID0gaW1pZCAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuTWludXRlOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgPCA2MCAmJiAoNjAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpdGggdGhlIHRoaXMuX2ludFJlZmVyZW5jZSBtaW51dGVzLCBzZWNvbmRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCBub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdWJMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5Ib3VyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHBlciBjb25zdHJ1Y3RvciBhc3NlcnQsIHRoZSBzZWNvbmRzIGZpdCBpbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcHJldmlvdXMgZGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBoYXZlIHRvIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpLmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSkuc3ViTG9jYWwocmVtYWluZGVyLCBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIGJhc2ljc18xLlRpbWVVbml0LkRheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuSG91cjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSwgdGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGlzLl9pbnRSZWZlcmVuY2UgZWFjaCBkYXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGhhdmUgdG8gdGFrZSBjYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgYmFzaWNzXzEuVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcHByb3guYWRkTG9jYWwoMSwgYmFzaWNzXzEuVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIGJhc2ljc18xLlRpbWVVbml0LkhvdXIpLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBiYXNpY3NfMS5UaW1lVW5pdC5EYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgYmFzaWNzXzEuVGltZVVuaXQuRGF5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBoYXZlIGxlYXAgZGF5cywgc28gd2UgY2FuIGFwcHJveGltYXRlIGJ5IGNhbGN1bGF0aW5nIHdpdGggVVRDIHRpbWVzdGFtcHNcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLmhvdXJzKCkgLyAyNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKG5vcm1hbEZyb20ubW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZExvY2FsKHRoaXMuX2ludGVydmFsLm11bHRpcGx5KHBlcmlvZHMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaWZmID0gbm9ybWFsRnJvbS55ZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UueWVhcigpIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksIHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJVbmtub3duIFRpbWVVbml0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY29ycmVjdERheShhcHByb3gpLmNvbnZlcnQoZnJvbURhdGUuem9uZSgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG5leHQgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxyXG4gICAgICogUmV0dXJucyB0aGUgZGF0ZXRpbWUgXCJjb3VudFwiIHRpbWVzIGF3YXkgZnJvbSB0aGUgZ2l2ZW4gZGF0ZXRpbWUuXHJcbiAgICAgKiBAcGFyYW0gcHJldlx0Qm91bmRhcnkgZGF0ZS4gTXVzdCBoYXZlIGEgdGltZSB6b25lIChhbnkgdGltZSB6b25lKSBpZmYgdGhlIHBlcmlvZCByZWZlcmVuY2UgZGF0ZSBoYXMgb25lLlxyXG4gICAgICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgcG9zaXRpdmUgb3IgbmVnYXRpdmUsIGRlZmF1bHQgMVxyXG4gICAgICogQHJldHVybiAocHJldiArIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgcHJldi5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5QcmV2IGlmIHByZXYgaXMgdW5kZWZpbmVkXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQ291bnQgaWYgY291bnQgaXMgbm90IGFuIGludGVnZXIgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZE5leHQgPSBmdW5jdGlvbiAocHJldiwgY291bnQpIHtcclxuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cclxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoISFwcmV2LCBcIkFyZ3VtZW50LlByZXZcIiwgXCJQcmV2IG11c3QgYmUgZ2l2ZW5cIik7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSwgXCJVbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb25cIiwgXCJUaGUgZnJvbURhdGUgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKE51bWJlci5pc0ludGVnZXIoY291bnQpLCBcIkFyZ3VtZW50LkNvdW50XCIsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlclwiKTtcclxuICAgICAgICB2YXIgbm9ybWFsaXplZFByZXYgPSB0aGlzLl9ub3JtYWxpemVEYXkocHJldi50b1pvbmUodGhpcy5fcmVmZXJlbmNlLnpvbmUoKSkpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpKS5jb252ZXJ0KHByZXYuem9uZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb3JyZWN0RGF5KG5vcm1hbGl6ZWRQcmV2LmFkZExvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpICogY291bnQsIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkpLmNvbnZlcnQocHJldi56b25lKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBsZXNzIHRoYW5cclxuICAgICAqIHRoZSBnaXZlbiBkYXRlLiBUaGUgZ2l2ZW4gZGF0ZSBuZWVkIG5vdCBiZSBhdCBhIHBlcmlvZCBib3VuZGFyeS5cclxuICAgICAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XHJcbiAgICAgKiBAcGFyYW0gZnJvbURhdGU6IHRoZSBkYXRlIGJlZm9yZSB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxyXG4gICAgICogQHJldHVybiB0aGUgbGFzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYmVmb3JlIGZyb21EYXRlLCBnaXZlblxyXG4gICAgICogICAgICAgICBpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgbm90IGJvdGggYGZyb21gIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZSBvZiB0aW1lIHpvbmVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmZpbmRMYXN0ID0gZnVuY3Rpb24gKGZyb20pIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5maW5kUHJldihyZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgdGltZXN0YW1wIGluIHRoZSBwZXJpb2QuIFRoZSBnaXZlbiB0aW1lc3RhbXAgbXVzdFxyXG4gICAgICogYmUgYXQgYSBwZXJpb2QgYm91bmRhcnksIG90aGVyd2lzZSB0aGUgYW5zd2VyIGlzIGluY29ycmVjdC5cclxuICAgICAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXHJcbiAgICAgKiBAcGFyYW0gY291bnRcdE51bWJlciBvZiBwZXJpb2RzIHRvIHN1YnRyYWN0LiBPcHRpb25hbC4gTXVzdCBiZSBhbiBpbnRlZ2VyIG51bWJlciwgbWF5IGJlIG5lZ2F0aXZlLlxyXG4gICAgICogQHJldHVybiAobmV4dCAtIGNvdW50ICogcGVyaW9kKSwgaW4gdGhlIHNhbWUgdGltZXpvbmUgYXMgbmV4dC5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5OZXh0IGlmIHByZXYgaXMgdW5kZWZpbmVkXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuQ291bnQgaWYgY291bnQgaXMgbm90IGFuIGludGVnZXIgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuZmluZFByZXYgPSBmdW5jdGlvbiAobmV4dCwgY291bnQpIHtcclxuICAgICAgICBpZiAoY291bnQgPT09IHZvaWQgMCkgeyBjb3VudCA9IDE7IH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maW5kTmV4dChuZXh0LCAtMSAqIGNvdW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiQXJndW1lbnQuUHJldlwiKSkge1xyXG4gICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIkFyZ3VtZW50Lk5leHRcIiwgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XHJcbiAgICAgKiAoZXhwZW5zaXZlISlcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5VbmF3YXJlVG9Bd2FyZUNvbnZlcnNpb24gaWYgbm90IGJvdGggYG9jY3VycmVuY2VgIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZSBvZiB0aW1lIHpvbmVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgdGltZSB6b25lIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLmlzQm91bmRhcnkgPSBmdW5jdGlvbiAob2NjdXJyZW5jZSkge1xyXG4gICAgICAgIGlmICghb2NjdXJyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghIXRoaXMuX2ludFJlZmVyZW5jZS56b25lKCkgPT09ICEhb2NjdXJyZW5jZS56b25lKCksIFwiVW5hd2FyZVRvQXdhcmVDb252ZXJzaW9uXCIsIFwiVGhlIG9jY3VycmVuY2UgYW5kIHJlZmVyZW5jZURhdGUgbXVzdCBib3RoIGJlIGF3YXJlIG9yIHVuYXdhcmVcIik7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmZpbmRGaXJzdChvY2N1cnJlbmNlLnN1YihkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcGVyaW9kIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXMgdGhlIGdpdmVuIG9uZS5cclxuICAgICAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxyXG4gICAgICogYW5kIHNhbWUgZHN0LlxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLlVuYXdhcmVUb0F3YXJlQ29udmVyc2lvbiBpZiBub3QgYm90aCBgb3RoZXIjcmVmZXJlbmNlKClgIGFuZCB0aGUgcmVmZXJlbmNlIGRhdGUgYXJlIGJvdGggYXdhcmUgb3IgdW5hd2FyZVxyXG4gICAgICogb2YgdGltZSB6b25lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICAvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcclxuICAgICAgICBpZiAoIXRoaXMuaXNCb3VuZGFyeShvdGhlci5fcmVmZXJlbmNlKSB8fCAhdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzKG90aGVyLl9pbnRJbnRlcnZhbCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVmWm9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XHJcbiAgICAgICAgdmFyIG90aGVyWm9uZSA9IG90aGVyLl9yZWZlcmVuY2Uuem9uZSgpO1xyXG4gICAgICAgIHZhciB0aGlzSXNSZWd1bGFyID0gKHRoaXMuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIXJlZlpvbmUgfHwgcmVmWm9uZS5pc1V0YygpKTtcclxuICAgICAgICB2YXIgb3RoZXJJc1JlZ3VsYXIgPSAob3RoZXIuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIW90aGVyWm9uZSB8fCBvdGhlclpvbmUuaXNVdGMoKSk7XHJcbiAgICAgICAgaWYgKHRoaXNJc1JlZ3VsYXIgJiYgb3RoZXJJc1JlZ3VsYXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9pbnREc3QgPT09IG90aGVyLl9pbnREc3QgJiYgcmVmWm9uZSAmJiBvdGhlclpvbmUgJiYgcmVmWm9uZS5lcXVhbHMob3RoZXJab25lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcclxuICAgICAgICAgICAgJiYgdGhpcy5faW50ZXJ2YWwuaWRlbnRpY2FsKG90aGVyLl9pbnRlcnZhbClcclxuICAgICAgICAgICAgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXHJcbiAgICAgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QMUhcclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1BUMU0gICAob25lIG1pbnV0ZSlcclxuICAgICAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b0lzb1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBlLmcuXHJcbiAgICAgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgUGVyaW9kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5faW50ZXJ2YWwudG9TdHJpbmcoKSArIFwiLCByZWZlcmVuY2VpbmcgYXQgXCIgKyB0aGlzLl9yZWZlcmVuY2UudG9TdHJpbmcoKTtcclxuICAgICAgICAvLyBvbmx5IGFkZCB0aGUgRFNUIGhhbmRsaW5nIGlmIGl0IGlzIHJlbGV2YW50XHJcbiAgICAgICAgaWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBKU09OLWNvbXBhdGlibGUgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBwZXJpb2RcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLnRvSnNvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZWZlcmVuY2U6IHRoaXMucmVmZXJlbmNlKCkudG9TdHJpbmcoKSxcclxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuaW50ZXJ2YWwoKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBwZXJpb2REc3Q6IHRoaXMuZHN0KCkgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzID8gXCJyZWd1bGFyXCIgOiBcImxvY2FsXCJcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29ycmVjdHMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBfcmVmZXJlbmNlIGFuZCBfaW50UmVmZXJlbmNlLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NvcnJlY3REYXkgPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUoZC55ZWFyKCksIGQubW9udGgoKSwgTWF0aC5taW4oYmFzaWNzLmRheXNJbk1vbnRoKGQueWVhcigpLCBkLm1vbnRoKCkpLCB0aGlzLl9yZWZlcmVuY2UuZGF5KCkpLCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXHJcbiAgICAgKiB0byA8PSAyOC5cclxuICAgICAqIEByZXR1cm4gYSBuZXcgZGF0ZSBpZiBkaWZmZXJlbnQsIG90aGVyd2lzZSB0aGUgZXhhY3Qgc2FtZSBvYmplY3QgKG5vIGNsb25lISlcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9ub3JtYWxpemVEYXkgPSBmdW5jdGlvbiAoZCwgYW55bW9udGgpIHtcclxuICAgICAgICBpZiAoYW55bW9udGggPT09IHZvaWQgMCkgeyBhbnltb250aCA9IHRydWU7IH1cclxuICAgICAgICBpZiAoKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gYmFzaWNzXzEuVGltZVVuaXQuTW9udGggJiYgZC5kYXkoKSA+IDI4KVxyXG4gICAgICAgICAgICB8fCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpID09PSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyICYmIChkLm1vbnRoKCkgPT09IDIgfHwgYW55bW9udGgpICYmIGQuZGF5KCkgPiAyOCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBkYXRldGltZV8xLkRhdGVUaW1lKGQueWVhcigpLCBkLm1vbnRoKCksIDI4LCBkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZDsgLy8gc2F2ZSBvbiB0aW1lIGJ5IG5vdCByZXR1cm5pbmcgYSBjbG9uZVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxyXG4gICAgICogKGkuZS4gaWYgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgaGFzIERTVClcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBQZXJpb2QucHJvdG90eXBlLl9kc3RSZWxldmFudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XHJcbiAgICAgICAgcmV0dXJuICEhKHpvbmVcclxuICAgICAgICAgICAgJiYgem9uZS5raW5kKCkgPT09IHRpbWV6b25lXzEuVGltZVpvbmVLaW5kLlByb3BlclxyXG4gICAgICAgICAgICAmJiB6b25lLmhhc0RzdCgpKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSB0aGUgdmFsdWVzIHdoZXJlIHBvc3NpYmxlIC0gbm90IGFsbCB2YWx1ZXNcclxuICAgICAqIGFyZSBjb252ZXJ0aWJsZSBpbnRvIG9uZSBhbm90aGVyLiBXZWVrcyBhcmUgY29udmVydGVkIHRvIGRheXMuXHJcbiAgICAgKiBFLmcuIG1vcmUgdGhhbiA2MCBtaW51dGVzIGlzIHRyYW5zZmVycmVkIHRvIGhvdXJzLFxyXG4gICAgICogYnV0IHNlY29uZHMgY2Fubm90IGJlIHRyYW5zZmVycmVkIHRvIG1pbnV0ZXMgZHVlIHRvIGxlYXAgc2Vjb25kcy5cclxuICAgICAqIFdlZWtzIGFyZSBjb252ZXJ0ZWQgYmFjayB0byBkYXlzLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFBlcmlvZC5wcm90b3R5cGUuX2NhbGNJbnRlcm5hbFZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBub3JtYWxpemUgYW55IGFib3ZlLXVuaXQgdmFsdWVzXHJcbiAgICAgICAgdmFyIGludEFtb3VudCA9IHRoaXMuX2ludGVydmFsLmFtb3VudCgpO1xyXG4gICAgICAgIHZhciBpbnRVbml0ID0gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaWxsaXNlY29uZCAmJiBpbnRBbW91bnQgPj0gMTAwMCAmJiBpbnRBbW91bnQgJSAxMDAwID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xyXG4gICAgICAgICAgICBpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMDAwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW50VW5pdCA9PT0gYmFzaWNzXzEuVGltZVVuaXQuU2Vjb25kICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBub3RlIHRoaXMgd29uJ3Qgd29yayBpZiB3ZSBhY2NvdW50IGZvciBsZWFwIHNlY29uZHNcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5NaW51dGUgJiYgaW50QW1vdW50ID49IDYwICYmIGludEFtb3VudCAlIDYwID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDYwO1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuSG91cjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGludFVuaXQgPT09IGJhc2ljc18xLlRpbWVVbml0LkhvdXIgJiYgaW50QW1vdW50ID49IDI0ICYmIGludEFtb3VudCAlIDI0ID09PSAwKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAvIDI0O1xyXG4gICAgICAgICAgICBpbnRVbml0ID0gYmFzaWNzXzEuVGltZVVuaXQuRGF5O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3cgcmVtb3ZlIHdlZWtzIHNvIHdlIGhhdmUgb25lIGxlc3MgY2FzZSB0byB3b3JyeSBhYm91dFxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5XZWVrKSB7XHJcbiAgICAgICAgICAgIGludEFtb3VudCA9IGludEFtb3VudCAqIDc7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5EYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnRVbml0ID09PSBiYXNpY3NfMS5UaW1lVW5pdC5Nb250aCAmJiBpbnRBbW91bnQgPj0gMTIgJiYgaW50QW1vdW50ICUgMTIgPT09IDApIHtcclxuICAgICAgICAgICAgaW50QW1vdW50ID0gaW50QW1vdW50IC8gMTI7XHJcbiAgICAgICAgICAgIGludFVuaXQgPSBiYXNpY3NfMS5UaW1lVW5pdC5ZZWFyO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnRJbnRlcnZhbCA9IG5ldyBkdXJhdGlvbl8xLkR1cmF0aW9uKGludEFtb3VudCwgaW50VW5pdCk7XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIGRzdCBoYW5kbGluZ1xyXG4gICAgICAgIGlmICh0aGlzLl9kc3RSZWxldmFudCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludERzdCA9IHRoaXMuX2RzdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ludERzdCA9IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3JtYWxpemUgcmVmZXJlbmNlIGRheVxyXG4gICAgICAgIHRoaXMuX2ludFJlZmVyZW5jZSA9IHRoaXMuX25vcm1hbGl6ZURheSh0aGlzLl9yZWZlcmVuY2UsIGZhbHNlKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUGVyaW9kO1xyXG59KCkpO1xyXG5leHBvcnRzLlBlcmlvZCA9IFBlcmlvZDtcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIGpzb24gdmFsdWUgcmVwcmVzZW50cyBhIHZhbGlkIHBlcmlvZCBKU09OXHJcbiAqIEBwYXJhbSBqc29uXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZFBlcmlvZEpzb24oanNvbikge1xyXG4gICAgaWYgKHR5cGVvZiBqc29uICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGpzb24gPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGpzb24uZHVyYXRpb24gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGpzb24ucGVyaW9kRHN0ICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBqc29uLnJlZmVyZW5jZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICghW1wicmVndWxhclwiLCBcImxvY2FsXCJdLmluY2x1ZGVzKGpzb24ucGVyaW9kRHN0KSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby11bnVzZWQtZXhwcmVzc2lvblxyXG4gICAgICAgIG5ldyBQZXJpb2QoanNvbik7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoX2EpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5leHBvcnRzLmlzVmFsaWRQZXJpb2RKc29uID0gaXNWYWxpZFBlcmlvZEpzb247XHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBQZXJpb2QuIE5vdGUgdGhhdCBpdCBkb2VzIG5vdCB3b3JrIGZvciBzdWIgY2xhc3Nlcy4gSG93ZXZlciwgdXNlIHRoaXMgdG8gYmUgcm9idXN0XHJcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxyXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1BlcmlvZCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIlBlcmlvZFwiO1xyXG59XHJcbmV4cG9ydHMuaXNQZXJpb2QgPSBpc1BlcmlvZDtcclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IHRpbWVzdGFtcCA+PSBgb3B0cy5yZWZlcmVuY2VgIHRoYXQgbWF0Y2hlcyB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgdGltZS4gVXNlcyB0aGUgdGltZSB6b25lIGFuZCBEU1Qgc2V0dGluZ3NcclxuICogb2YgdGhlIGdpdmVuIHJlZmVyZW5jZSB0aW1lLlxyXG4gKiBAcGFyYW0gb3B0c1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuSG91ciBpZiBvcHRzLmhvdXIgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaW51dGUgaWYgb3B0cy5taW51dGUgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TZWNvbmQgaWYgb3B0cy5zZWNvbmQgb3V0IG9mIHJhbmdlXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5NaWxsaXNlY29uZCBpZiBvcHRzLm1pbGxpc2Vjb25kIG91dCBvZiByYW5nZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2Vla2RheSBpZiBvcHRzLndlZWtkYXkgb3V0IG9mIHJhbmdlXHJcbiAqL1xyXG5mdW5jdGlvbiB0aW1lc3RhbXBPbldlZWtUaW1lR3JlYXRlclRoYW5PckVxdWFsVG8ob3B0cykge1xyXG4gICAgdmFyIF9hLCBfYiwgX2M7XHJcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5ob3VyID49IDAgJiYgb3B0cy5ob3VyIDwgMjQsIFwiQXJndW1lbnQuSG91clwiLCBcIm9wdHMuaG91ciBzaG91bGQgYmUgd2l0aGluIFswLi4yM11cIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5taW51dGUgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taW51dGUgPj0gMCAmJiBvcHRzLm1pbnV0ZSA8IDYwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taW51dGUpKSwgXCJBcmd1bWVudC5NaW51dGVcIiwgXCJvcHRzLm1pbnV0ZSBzaG91bGQgYmUgd2l0aGluIFswLi41OV1cIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5zZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5zZWNvbmQgPj0gMCAmJiBvcHRzLnNlY29uZCA8IDYwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5zZWNvbmQpKSwgXCJBcmd1bWVudC5TZWNvbmRcIiwgXCJvcHRzLnNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLi41OV1cIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy5taWxsaXNlY29uZCA9PT0gdW5kZWZpbmVkIHx8IChvcHRzLm1pbGxpc2Vjb25kID49IDAgJiYgb3B0cy5taWxsaXNlY29uZCA8IDEwMDAgJiYgTnVtYmVyLmlzSW50ZWdlcihvcHRzLm1pbGxpc2Vjb25kKSksIFwiQXJndW1lbnQuTWlsbGlzZWNvbmRcIiwgXCJvcHRzLm1pbGxpc2Vjb25kIHNob3VsZCBiZSB3aXRoaW4gWzAuOTk5XVwiKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShvcHRzLndlZWtkYXkgPj0gMCAmJiBvcHRzLndlZWtkYXkgPCA3LCBcIkFyZ3VtZW50LldlZWtkYXlcIiwgXCJvcHRzLndlZWtkYXkgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNl1cIik7XHJcbiAgICAvLyB0c2xpbnQ6ZW5hYmxlOiBtYXgtbGluZS1sZW5ndGhcclxuICAgIHZhciBtaWRuaWdodCA9IG9wdHMucmVmZXJlbmNlLnN0YXJ0T2ZEYXkoKTtcclxuICAgIHdoaWxlIChtaWRuaWdodC53ZWVrRGF5KCkgIT09IG9wdHMud2Vla2RheSkge1xyXG4gICAgICAgIG1pZG5pZ2h0ID0gbWlkbmlnaHQuYWRkTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoMSkpO1xyXG4gICAgfVxyXG4gICAgdmFyIGR0ID0gbmV3IGRhdGV0aW1lXzEuRGF0ZVRpbWUobWlkbmlnaHQueWVhcigpLCBtaWRuaWdodC5tb250aCgpLCBtaWRuaWdodC5kYXkoKSwgb3B0cy5ob3VyLCAoX2EgPSBvcHRzLm1pbnV0ZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogMCwgKF9iID0gb3B0cy5zZWNvbmQpICE9PSBudWxsICYmIF9iICE9PSB2b2lkIDAgPyBfYiA6IDAsIChfYyA9IG9wdHMubWlsbGlzZWNvbmQpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IDAsIG9wdHMucmVmZXJlbmNlLnpvbmUoKSk7XHJcbiAgICBpZiAoZHQgPCBvcHRzLnJlZmVyZW5jZSkge1xyXG4gICAgICAgIC8vIHdlJ3ZlIHN0YXJ0ZWQgb3V0IG9uIHRoZSBjb3JyZWN0IHdlZWtkYXkgYW5kIHRoZSByZWZlcmVuY2UgdGltZXN0YW1wIHdhcyBncmVhdGVyIHRoYW4gdGhlIGdpdmVuIHRpbWUsIG5lZWQgdG8gc2tpcCBhIHdlZWtcclxuICAgICAgICByZXR1cm4gZHQuYWRkTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoNykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGR0O1xyXG59XHJcbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvID0gdGltZXN0YW1wT25XZWVrVGltZUdyZWF0ZXJUaGFuT3JFcXVhbFRvO1xyXG4vKipcclxuICogUmV0dXJucyB0aGUgZmlyc3QgdGltZXN0YW1wIDwgYG9wdHMucmVmZXJlbmNlYCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIHdlZWtkYXkgYW5kIHRpbWUuIFVzZXMgdGhlIHRpbWUgem9uZSBhbmQgRFNUIHNldHRpbmdzXHJcbiAqIG9mIHRoZSBnaXZlbiByZWZlcmVuY2UgdGltZS5cclxuICogQHBhcmFtIG9wdHNcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkhvdXIgaWYgb3B0cy5ob3VyIG91dCBvZiByYW5nZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWludXRlIGlmIG9wdHMubWludXRlIG91dCBvZiByYW5nZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuU2Vjb25kIGlmIG9wdHMuc2Vjb25kIG91dCBvZiByYW5nZVxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuTWlsbGlzZWNvbmQgaWYgb3B0cy5taWxsaXNlY29uZCBvdXQgb2YgcmFuZ2VcclxuICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LldlZWtkYXkgaWYgb3B0cy53ZWVrZGF5IG91dCBvZiByYW5nZVxyXG4gKi9cclxuZnVuY3Rpb24gdGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuKG9wdHMpIHtcclxuICAgIHZhciBfYSwgX2IsIF9jO1xyXG4gICAgLy8gdHNsaW50OmRpc2FibGU6IG1heC1saW5lLWxlbmd0aFxyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMuaG91ciA+PSAwICYmIG9wdHMuaG91ciA8IDI0LCBcIkFyZ3VtZW50LkhvdXJcIiwgXCJvcHRzLmhvdXIgc2hvdWxkIGJlIHdpdGhpbiBbMC4uMjNdXCIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMubWludXRlID09PSB1bmRlZmluZWQgfHwgKG9wdHMubWludXRlID49IDAgJiYgb3B0cy5taW51dGUgPCA2MCAmJiBOdW1iZXIuaXNJbnRlZ2VyKG9wdHMubWludXRlKSksIFwiQXJndW1lbnQuTWludXRlXCIsIFwib3B0cy5taW51dGUgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNTldXCIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMuc2Vjb25kID09PSB1bmRlZmluZWQgfHwgKG9wdHMuc2Vjb25kID49IDAgJiYgb3B0cy5zZWNvbmQgPCA2MCAmJiBOdW1iZXIuaXNJbnRlZ2VyKG9wdHMuc2Vjb25kKSksIFwiQXJndW1lbnQuU2Vjb25kXCIsIFwib3B0cy5zZWNvbmQgc2hvdWxkIGJlIHdpdGhpbiBbMC4uNTldXCIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG9wdHMubWlsbGlzZWNvbmQgPT09IHVuZGVmaW5lZCB8fCAob3B0cy5taWxsaXNlY29uZCA+PSAwICYmIG9wdHMubWlsbGlzZWNvbmQgPCAxMDAwICYmIE51bWJlci5pc0ludGVnZXIob3B0cy5taWxsaXNlY29uZCkpLCBcIkFyZ3VtZW50Lk1pbGxpc2Vjb25kXCIsIFwib3B0cy5taWxsaXNlY29uZCBzaG91bGQgYmUgd2l0aGluIFswLjk5OV1cIik7XHJcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkob3B0cy53ZWVrZGF5ID49IDAgJiYgb3B0cy53ZWVrZGF5IDwgNywgXCJBcmd1bWVudC5XZWVrZGF5XCIsIFwib3B0cy53ZWVrZGF5IHNob3VsZCBiZSB3aXRoaW4gWzAuLjZdXCIpO1xyXG4gICAgLy8gdHNsaW50OmVuYWJsZTogbWF4LWxpbmUtbGVuZ3RoXHJcbiAgICB2YXIgbWlkbmlnaHQgPSBvcHRzLnJlZmVyZW5jZS5zdGFydE9mRGF5KCkuYWRkTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoMSkpO1xyXG4gICAgd2hpbGUgKG1pZG5pZ2h0LndlZWtEYXkoKSAhPT0gb3B0cy53ZWVrZGF5KSB7XHJcbiAgICAgICAgbWlkbmlnaHQgPSBtaWRuaWdodC5zdWJMb2NhbCgoMCwgZHVyYXRpb25fMS5kYXlzKSgxKSk7XHJcbiAgICB9XHJcbiAgICB2YXIgZHQgPSBuZXcgZGF0ZXRpbWVfMS5EYXRlVGltZShtaWRuaWdodC55ZWFyKCksIG1pZG5pZ2h0Lm1vbnRoKCksIG1pZG5pZ2h0LmRheSgpLCBvcHRzLmhvdXIsIChfYSA9IG9wdHMubWludXRlKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAwLCAoX2IgPSBvcHRzLnNlY29uZCkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMCwgKF9jID0gb3B0cy5taWxsaXNlY29uZCkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogMCwgb3B0cy5yZWZlcmVuY2Uuem9uZSgpKTtcclxuICAgIGlmIChkdCA+PSBvcHRzLnJlZmVyZW5jZSkge1xyXG4gICAgICAgIC8vIHdlJ3ZlIHN0YXJ0ZWQgb3V0IG9uIHRoZSBjb3JyZWN0IHdlZWtkYXkgYW5kIHRoZSByZWZlcmVuY2UgdGltZXN0YW1wIHdhcyBsZXNzIHRoYW4gdGhlIGdpdmVuIHRpbWUsIG5lZWQgdG8gc2tpcCBhIHdlZWtcclxuICAgICAgICByZXR1cm4gZHQuc3ViTG9jYWwoKDAsIGR1cmF0aW9uXzEuZGF5cykoNykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGR0O1xyXG59XHJcbmV4cG9ydHMudGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuID0gdGltZXN0YW1wT25XZWVrVGltZUxlc3NUaGFuO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJpb2QuanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIFN0cmluZyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5wYWRSaWdodCA9IGV4cG9ydHMucGFkTGVmdCA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG4vKipcclxuICogUGFkIGEgc3RyaW5nIGJ5IGFkZGluZyBjaGFyYWN0ZXJzIHRvIHRoZSBiZWdpbm5pbmcuXHJcbiAqIEBwYXJhbSBzXHR0aGUgc3RyaW5nIHRvIHBhZFxyXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXHJcbiAqIEBwYXJhbSBjaGFyXHR0aGUgc2luZ2xlIGNoYXJhY3RlciB0byBwYWQgd2l0aFxyXG4gKiBAcmV0dXJuXHR0aGUgcGFkZGVkIHN0cmluZ1xyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuV2lkdGggaWYgd2lkdGggaXMgbm90IGFuIGludGVnZXIgbnVtYmVyID49IDBcclxuICovXHJcbmZ1bmN0aW9uIHBhZExlZnQocywgd2lkdGgsIGNoYXIpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHdpZHRoKSAmJiB3aWR0aCA+PSAwLCBcIkFyZ3VtZW50LldpZHRoXCIsIFwid2lkdGggc2hvdWxkIGJlIGFuIGludGVnZXIgbnVtYmVyID49IDAgYnV0IGlzOiAlZFwiLCB3aWR0aCk7XHJcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgICAgcGFkZGluZyArPSBjaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhZGRpbmcgKyBzO1xyXG59XHJcbmV4cG9ydHMucGFkTGVmdCA9IHBhZExlZnQ7XHJcbi8qKlxyXG4gKiBQYWQgYSBzdHJpbmcgYnkgYWRkaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGVuZC5cclxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXHJcbiAqIEBwYXJhbSB3aWR0aFx0dGhlIGRlc2lyZWQgbWluaW11bSBzdHJpbmcgd2lkdGhcclxuICogQHBhcmFtIGNoYXJcdHRoZSBzaW5nbGUgY2hhcmFjdGVyIHRvIHBhZCB3aXRoXHJcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5XaWR0aCBpZiB3aWR0aCBpcyBub3QgYW4gaW50ZWdlciBudW1iZXIgPj0gMFxyXG4gKi9cclxuZnVuY3Rpb24gcGFkUmlnaHQocywgd2lkdGgsIGNoYXIpIHtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNJbnRlZ2VyKHdpZHRoKSAmJiB3aWR0aCA+PSAwLCBcIkFyZ3VtZW50LldpZHRoXCIsIFwid2lkdGggc2hvdWxkIGJlIGFuIGludGVnZXIgbnVtYmVyID49IDAgYnV0IGlzOiAlZFwiLCB3aWR0aCk7XHJcbiAgICB2YXIgcGFkZGluZyA9IFwiXCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XHJcbiAgICAgICAgcGFkZGluZyArPSBjaGFyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHMgKyBwYWRkaW5nO1xyXG59XHJcbmV4cG9ydHMucGFkUmlnaHQgPSBwYWRSaWdodDtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RyaW5ncy5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuUmVhbFRpbWVTb3VyY2UgPSB2b2lkIDA7XHJcbi8qKlxyXG4gKiBEZWZhdWx0IHRpbWUgc291cmNlLCByZXR1cm5zIGFjdHVhbCB0aW1lXHJcbiAqL1xyXG52YXIgUmVhbFRpbWVTb3VyY2UgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBSZWFsVGltZVNvdXJjZSgpIHtcclxuICAgIH1cclxuICAgIC8qKiBAaW5oZXJpdGRvYyAqL1xyXG4gICAgUmVhbFRpbWVTb3VyY2UucHJvdG90eXBlLm5vdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gUmVhbFRpbWVTb3VyY2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuUmVhbFRpbWVTb3VyY2UgPSBSZWFsVGltZVNvdXJjZTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGltZXNvdXJjZS5qcy5tYXAiLCIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cclxuICpcclxuICogVGltZSB6b25lIHJlcHJlc2VudGF0aW9uIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cclxuICovXHJcblwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuaXNUaW1lWm9uZSA9IGV4cG9ydHMuVGltZVpvbmUgPSBleHBvcnRzLlRpbWVab25lS2luZCA9IGV4cG9ydHMuem9uZSA9IGV4cG9ydHMudXRjID0gZXhwb3J0cy5sb2NhbCA9IHZvaWQgMDtcclxudmFyIGFzc2VydF8xID0gcmVxdWlyZShcIi4vYXNzZXJ0XCIpO1xyXG52YXIgYmFzaWNzXzEgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbnZhciBlcnJvcl8xID0gcmVxdWlyZShcIi4vZXJyb3JcIik7XHJcbnZhciBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxudmFyIHR6X2RhdGFiYXNlXzEgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxuLyoqXHJcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKiBAdGhyb3dzIG5vdGhpbmdcclxuICovXHJcbmZ1bmN0aW9uIGxvY2FsKCkge1xyXG4gICAgcmV0dXJuIFRpbWVab25lLmxvY2FsKCk7XHJcbn1cclxuZXhwb3J0cy5sb2NhbCA9IGxvY2FsO1xyXG4vKipcclxuICogQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUgem9uZS4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBVVEMgem9uZSBpcyBub3QgcHJlc2VudCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAqL1xyXG5mdW5jdGlvbiB1dGMoKSB7XHJcbiAgICByZXR1cm4gVGltZVpvbmUudXRjKCk7XHJcbn1cclxuZXhwb3J0cy51dGMgPSB1dGM7XHJcbi8qKlxyXG4gKiB6b25lKCkgaW1wbGVtZW50YXRpb25cclxuICovXHJcbmZ1bmN0aW9uIHpvbmUoYSwgZHN0KSB7XHJcbiAgICByZXR1cm4gVGltZVpvbmUuem9uZShhLCBkc3QpO1xyXG59XHJcbmV4cG9ydHMuem9uZSA9IHpvbmU7XHJcbi8qKlxyXG4gKiBUaGUgdHlwZSBvZiB0aW1lIHpvbmVcclxuICovXHJcbnZhciBUaW1lWm9uZUtpbmQ7XHJcbihmdW5jdGlvbiAoVGltZVpvbmVLaW5kKSB7XHJcbiAgICAvKipcclxuICAgICAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZUtpbmRbVGltZVpvbmVLaW5kW1wiTG9jYWxcIl0gPSAwXSA9IFwiTG9jYWxcIjtcclxuICAgIC8qKlxyXG4gICAgICogRml4ZWQgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIk9mZnNldFwiXSA9IDFdID0gXCJPZmZzZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogSUFOQSB0aW1lem9uZSBtYW5hZ2VkIHRocm91Z2ggT2xzZW4gVFogZGF0YWJhc2UuIEluY2x1ZGVzXHJcbiAgICAgKiBEU1QgaWYgYXBwbGljYWJsZS5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmVLaW5kW1RpbWVab25lS2luZFtcIlByb3BlclwiXSA9IDJdID0gXCJQcm9wZXJcIjtcclxufSkoVGltZVpvbmVLaW5kID0gZXhwb3J0cy5UaW1lWm9uZUtpbmQgfHwgKGV4cG9ydHMuVGltZVpvbmVLaW5kID0ge30pKTtcclxuLyoqXHJcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XHJcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxyXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcclxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxyXG4gKlxyXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXHJcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcclxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cclxuICovXHJcbnZhciBUaW1lWm9uZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xyXG4gICAgICogVGltZVpvbmUuem9uZSgpIG1ldGhvZCBpbnN0ZWFkLlxyXG4gICAgICogQHBhcmFtIG5hbWUgTk9STUFMSVpFRCBuYW1lLCBhc3N1bWVkIHRvIGJlIGNvcnJlY3RcclxuICAgICAqIEBwYXJhbSBkc3QgQWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUsIGlnbm9yZWQgZm9yIGxvY2FsIHRpbWUgYW5kIGZpeGVkIG9mZnNldHNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHRoZSBnaXZlbiB6b25lIG5hbWUgZG9lc24ndCBleGlzdFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBpcyBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRpbWVab25lKG5hbWUsIGRzdCkge1xyXG4gICAgICAgIGlmIChkc3QgPT09IHZvaWQgMCkgeyBkc3QgPSB0cnVlOyB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWxsb3cgbm90IHVzaW5nIGluc3RhbmNlb2ZcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmNsYXNzS2luZCA9IFwiVGltZVpvbmVcIjtcclxuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLl9kc3QgPSBkc3Q7XHJcbiAgICAgICAgaWYgKG5hbWUgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IG5hbWUuY2hhckF0KDApID09PSBcIi1cIiB8fCBuYW1lLmNoYXJBdCgwKS5tYXRjaCgvXFxkLykgfHwgbmFtZSA9PT0gXCJaXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5PZmZzZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Qcm9wZXI7XHJcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0el9kYXRhYmFzZV8xLlR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIFwiTm90Rm91bmQuWm9uZVwiLCBcIm5vbi1leGlzdGluZyB0aW1lIHpvbmUgbmFtZSAnJXMnXCIsIG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcclxuICAgICAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxyXG4gICAgICogMjAxNC0wMS0wMSBpcyArMDE6MDAgYW5kIGFtc3RlcmRhbSB0aW1lIGZvciAyMDE0LTA3LTAxIGlzICswMjowMFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLmxvY2FsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFVUQyB0aW1lIHpvbmUuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB0aGUgVVRDIHRpbWUgem9uZSBkb2Vzbid0IGV4aXN0IGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUudXRjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIHpvbmUoKSBpbXBsZW1lbnRhdGlvbnNcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuem9uZSA9IGZ1bmN0aW9uIChhLCBkc3QpIHtcclxuICAgICAgICBpZiAoZHN0ID09PSB2b2lkIDApIHsgZHN0ID0gdHJ1ZTsgfVxyXG4gICAgICAgIHZhciBuYW1lID0gXCJcIjtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiAoYSkpIHtcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gYTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3QgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMuc2xpY2UoMCwgcy5pbmRleE9mKFwid2l0aG91dCBEU1RcIikgLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcocyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBhO1xyXG4gICAgICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShvZmZzZXQgPiAtMjQgKiA2MCAmJiBvZmZzZXQgPCAyNCAqIDYwLCBcIkFyZ3VtZW50Lk9mZnNldFwiLCBcIlRpbWVab25lLnpvbmUoKTogb2Zmc2V0IG91dCBvZiByYW5nZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcob2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBcmd1bWVudC5BXCIsIFwidW5leHBlY3RlZCB0eXBlIGZvciBmaXJzdCBhcmd1bWVudDogJXNcIiwgdHlwZW9mIGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gVGltZVpvbmUuX2ZpbmRPckNyZWF0ZShuYW1lLCBkc3QpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogTWFrZXMgdGhpcyBjbGFzcyBhcHBlYXIgY2xvbmFibGUuIE5PVEUgYXMgdGltZSB6b25lIG9iamVjdHMgYXJlIGltbXV0YWJsZSB5b3Ugd2lsbCBOT1RcclxuICAgICAqIGFjdHVhbGx5IGdldCBhIGNsb25lIGJ1dCB0aGUgc2FtZSBvYmplY3QuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyLiBDYW4gYmUgYW4gb2Zmc2V0IFwiLTAxOjMwXCIgb3IgYW5cclxuICAgICAqIElBTkEgdGltZSB6b25lIG5hbWUgXCJFdXJvcGUvQW1zdGVyZGFtXCIsIG9yIFwibG9jYWx0aW1lXCIgZm9yXHJcbiAgICAgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciBEU1QgaXMgZW5hYmxlZFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5kc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RzdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSAoTG9jYWwvT2Zmc2V0L1Byb3BlcilcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUua2luZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2luZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xyXG4gICAgICogZWFjaCBvdGhlci4gT3RoZXIgdGltZSB6b25lcyBhcmUgbm90IG1hcHBlZCBvbnRvIGVhY2ggb3RoZXIuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB0aGUgZ2xvYmFsIHRpbWUgem9uZSBkYXRhIGlzIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmlzVXRjKCkgJiYgb3RoZXIuaXNVdGMoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLkxvY2FsKTtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXHJcbiAgICAgICAgICAgICAgICAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxyXG4gICAgICAgICAgICAgICAgJiYgKHRoaXMuX2RzdCA9PT0gb3RoZXIuX2RzdCB8fCAhdGhpcy5oYXNEc3QoKSkpO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcclxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgY29uc3RydWN0b3IgYXJndW1lbnRzIHdlcmUgaWRlbnRpY2FsLCBzbyBVVEMgIT09IEdNVFxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5pZGVudGljYWwgPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXIgJiYgdGhpcy5fbmFtZSA9PT0gb3RoZXIuX25hbWUgJiYgdGhpcy5fZHN0ID09PSBvdGhlci5fZHN0KTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUuaXNVdGMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuICh0aGlzLl9vZmZzZXQgPT09IDApO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdGhlIGdsb2JhbCB0aW1lIHpvbmUgZGF0YSBpcyBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLl9raW5kKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAodHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuaGFzRHN0KHRoaXMuX25hbWUpKTtcclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjID0gZnVuY3Rpb24gKGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSkge1xyXG4gICAgICAgIHZhciB1dGNUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogbW9udGgsIGRheTogZGF5LCBob3VyOiBob3VyLCBtaW51dGU6IG1pbnV0ZSwgc2Vjb25kOiBzZWNvbmQsIG1pbGxpOiBtaWxsaSB9KSA6XHJcbiAgICAgICAgICAgIHR5cGVvZiBhID09PSBcInVuZGVmaW5lZFwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3Qoe30pIDpcclxuICAgICAgICAgICAgICAgIGEpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Mb2NhbDoge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgdXRjVGltZS5jb21wb25lbnRzLm1vbnRoIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLmRheSwgdXRjVGltZS5jb21wb25lbnRzLmhvdXIsIHV0Y1RpbWUuY29tcG9uZW50cy5taW51dGUsIHV0Y1RpbWUuY29tcG9uZW50cy5zZWNvbmQsIHV0Y1RpbWUuY29tcG9uZW50cy5taWxsaSkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcclxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFzc2VydGlvblwiLCBcInVua25vd24gdGltZSB6b25lIGtpbmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRpbWVab25lLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldEZvclV0YyA9IGZ1bmN0aW9uIChhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkpIHtcclxuICAgICAgICB2YXIgdXRjVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSkgOlxyXG4gICAgICAgICAgICB0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHt9KSA6XHJcbiAgICAgICAgICAgICAgICBhKTtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEModXRjVGltZS5jb21wb25lbnRzLnllYXIsIDAsIDEsIDApKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgdXRjVGltZSkubWludXRlcygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclpvbmUgPSBmdW5jdGlvbiAoYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpKSB7XHJcbiAgICAgICAgdmFyIGxvY2FsVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgaG91cjogaG91ciwgbWludXRlOiBtaW51dGUsIHNlY29uZDogc2Vjb25kLCBtaWxsaTogbWlsbGkgfSkgOlxyXG4gICAgICAgICAgICB0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHt9KSA6XHJcbiAgICAgICAgICAgICAgICBhKTtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUobG9jYWxUaW1lLmNvbXBvbmVudHMueWVhciwgbG9jYWxUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy5kYXksIGxvY2FsVGltZS5jb21wb25lbnRzLmhvdXIsIGxvY2FsVGltZS5jb21wb25lbnRzLm1pbnV0ZSwgbG9jYWxUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taWxsaSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0TG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJBc3NlcnRpb25cIiwgXCJ1bmtub3duIHRpbWUgem9uZSBraW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcbiAgICAgKlxyXG4gICAgICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcbiAgICAgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG4gICAgICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5wcm90b3R5cGUub2Zmc2V0Rm9yVXRjRGF0ZSA9IGZ1bmN0aW9uIChkYXRlLCBmdW5jcykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9mZnNldEZvclV0YyhiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG4gICAgICpcclxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxyXG4gICAgICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcclxuICAgICAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm9mZnNldEZvclpvbmVEYXRlID0gZnVuY3Rpb24gKGRhdGUsIGZ1bmNzKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Rm9yWm9uZShiYXNpY3NfMS5UaW1lU3RydWN0LmZyb21EYXRlKGRhdGUsIGZ1bmNzKSk7XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLmFiYnJldmlhdGlvbkZvclV0YyA9IGZ1bmN0aW9uIChhLCBiLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSwgYykge1xyXG4gICAgICAgIHZhciB1dGNUaW1lO1xyXG4gICAgICAgIHZhciBkc3REZXBlbmRlbnQgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYSAhPT0gXCJudW1iZXJcIiAmJiAhIWEpIHtcclxuICAgICAgICAgICAgdXRjVGltZSA9IGE7XHJcbiAgICAgICAgICAgIGRzdERlcGVuZGVudCA9IChiID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB1dGNUaW1lID0gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBhLCBtb250aDogYiwgZGF5OiBkYXksIGhvdXI6IGhvdXIsIG1pbnV0ZTogbWludXRlLCBzZWNvbmQ6IHNlY29uZCwgbWlsbGk6IG1pbGxpIH0pO1xyXG4gICAgICAgICAgICBkc3REZXBlbmRlbnQgPSAoYyA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImxvY2FsXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB1dGNUaW1lLCBkc3REZXBlbmRlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiQXNzZXJ0aW9uXCIsIFwidW5rbm93biB0aW1lIHpvbmUga2luZFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgVGltZVpvbmUucHJvdG90eXBlLm5vcm1hbGl6ZVpvbmVUaW1lID0gZnVuY3Rpb24gKGxvY2FsVGltZSwgb3B0KSB7XHJcbiAgICAgICAgaWYgKG9wdCA9PT0gdm9pZCAwKSB7IG9wdCA9IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLlVwOyB9XHJcbiAgICAgICAgdmFyIHR6b3B0ID0gKG9wdCA9PT0gdHpfZGF0YWJhc2VfMS5Ob3JtYWxpemVPcHRpb24uRG93biA/IHR6X2RhdGFiYXNlXzEuTm9ybWFsaXplT3B0aW9uLkRvd24gOiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbi5VcCk7XHJcbiAgICAgICAgaWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobG9jYWxUaW1lKSwgdHpvcHQpLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHpfZGF0YWJhc2VfMS5UekRhdGFiYXNlLmluc3RhbmNlKCkubm9ybWFsaXplTG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lLCB0em9wdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFRpbWU7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyIChub3JtYWxpemVkKS5cclxuICAgICAqIEVpdGhlciBcImxvY2FsdGltZVwiLCBJQU5BIG5hbWUsIG9yIFwiK2hoOm1tXCIgb2Zmc2V0LlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5uYW1lKCk7XHJcbiAgICAgICAgaWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc0RzdCgpICYmICF0aGlzLmRzdCgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gXCIgd2l0aG91dCBEU1RcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBhbiBvZmZzZXQgbnVtYmVyIGludG8gYW4gb2Zmc2V0IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIG9mZnNldCBUaGUgb2Zmc2V0IGluIG1pbnV0ZXMgZnJvbSBVVEMgZS5nLiA5MCBtaW51dGVzXHJcbiAgICAgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW4gSVNPIG5vdGF0aW9uIFwiKzAxOjMwXCIgZm9yICs5MCBtaW51dGVzXHJcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50Lk9mZnNldCBpZiBvZmZzZXQgaXMgbm90IGEgZmluaXRlIG51bWJlciBvciBub3Qgd2l0aGluIC0yNCAqIDYwIC4uLiArMjQgKiA2MCBtaW51dGVzXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLm9mZnNldFRvU3RyaW5nID0gZnVuY3Rpb24gKG9mZnNldCkge1xyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShOdW1iZXIuaXNGaW5pdGUob2Zmc2V0KSAmJiBvZmZzZXQgPj0gLTI0ICogNjAgJiYgb2Zmc2V0IDw9IDI0ICogNjAsIFwiQXJndW1lbnQuT2Zmc2V0XCIsIFwiaW52YWxpZCBvZmZzZXQgJWRcIiwgb2Zmc2V0KTtcclxuICAgICAgICB2YXIgc2lnbiA9IChvZmZzZXQgPCAwID8gXCItXCIgOiBcIitcIik7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpIC8gNjApO1xyXG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xyXG4gICAgICAgIHJldHVybiBzaWduICsgc3RyaW5ncy5wYWRMZWZ0KGhvdXJzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQobWludXRlcy50b1N0cmluZygxMCksIDIsIFwiMFwiKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFN0cmluZyB0byBvZmZzZXQgY29udmVyc2lvbi5cclxuICAgICAqIEBwYXJhbSBzXHRGb3JtYXRzOiBcIi0wMTowMFwiLCBcIi0wMTAwXCIsIFwiLTAxXCIsIFwiWlwiXHJcbiAgICAgKiBAcmV0dXJuIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXNcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5TIGlmIHMgY2Fubm90IGJlIHBhcnNlZFxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5zdHJpbmdUb09mZnNldCA9IGZ1bmN0aW9uIChzKSB7XHJcbiAgICAgICAgdmFyIHQgPSBzLnRyaW0oKTtcclxuICAgICAgICAvLyBlYXN5IGNhc2VcclxuICAgICAgICBpZiAodCA9PT0gXCJaXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNoZWNrIHRoYXQgdGhlIHJlbWFpbmRlciBjb25mb3JtcyB0byBJU08gdGltZSB6b25lIHNwZWNcclxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodC5tYXRjaCgvXlsrLV1cXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQkLykgfHwgdC5tYXRjaCgvXlsrLV1cXGRcXGQoOj8pXFxkXFxkJC8pLCBcIkFyZ3VtZW50LlNcIiwgXCJXcm9uZyB0aW1lIHpvbmUgZm9ybWF0OiBcXFwiXCIgKyB0ICsgXCJcXFwiXCIpO1xyXG4gICAgICAgIHZhciBzaWduID0gKHQuY2hhckF0KDApID09PSBcIitcIiA/IDEgOiAtMSk7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gMDtcclxuICAgICAgICB2YXIgbWludXRlcyA9IDA7XHJcbiAgICAgICAgc3dpdGNoICh0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMiksIDEwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcclxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBwYXJzZUludCh0LnNsaWNlKDMsIDUpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgaG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBtaW51dGVzID0gcGFyc2VJbnQodC5zbGljZSg0LCA2KSwgMTApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShob3VycyA+PSAwICYmIGhvdXJzIDwgMjQsIFwiQXJndW1lbnQuU1wiLCBcIkludmFsaWQgdGltZSB6b25lIChob3VycyBvdXQgb2YgcmFuZ2UpOiAnXCIgKyB0ICsgXCInXCIpO1xyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShtaW51dGVzID49IDAgJiYgbWludXRlcyA8IDYwLCBcIkFyZ3VtZW50LlNcIiwgXCJJbnZhbGlkIHRpbWUgem9uZSAobWludXRlcyBvdXQgb2YgcmFuZ2UpOiAnXCIgKyB0ICsgXCInXCIpO1xyXG4gICAgICAgIHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgaW4gY2FjaGUgb3IgY3JlYXRlIHpvbmVcclxuICAgICAqIEBwYXJhbSBuYW1lXHRUaW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lP1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgdGhlIHpvbmUgZG9lc24ndCBleGlzdCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFRpbWVab25lLl9maW5kT3JDcmVhdGUgPSBmdW5jdGlvbiAobmFtZSwgZHN0KSB7XHJcbiAgICAgICAgdmFyIGtleSA9IG5hbWUgKyAoZHN0ID8gXCJfRFNUXCIgOiBcIl9OTy1EU1RcIik7XHJcbiAgICAgICAgaWYgKGtleSBpbiBUaW1lWm9uZS5fY2FjaGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLl9jYWNoZVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHQgPSBuZXcgVGltZVpvbmUobmFtZSwgZHN0KTtcclxuICAgICAgICAgICAgVGltZVpvbmUuX2NhY2hlW2tleV0gPSB0O1xyXG4gICAgICAgICAgICByZXR1cm4gdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgZm9yIGEgY2FjaGUgbG9va3VwXHJcbiAgICAgKiBAdGhyb3dzIEFyZ3VtZW50LlMgaWYgcyBpcyBlbXB0eVxyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nID0gZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICB2YXIgdCA9IHMudHJpbSgpO1xyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0Lmxlbmd0aCA+IDAsIFwiQXJndW1lbnQuU1wiLCBcIkVtcHR5IHRpbWUgem9uZSBzdHJpbmcgZ2l2ZW5cIik7XHJcbiAgICAgICAgaWYgKHQgPT09IFwibG9jYWx0aW1lXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHQgPT09IFwiWlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIiswMDowMFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcodCkpIHtcclxuICAgICAgICAgICAgLy8gb2Zmc2V0IHN0cmluZ1xyXG4gICAgICAgICAgICAvLyBub3JtYWxpemUgYnkgY29udmVydGluZyBiYWNrIGFuZCBmb3J0aFxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiQXJndW1lbnQuT2Zmc2V0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIkFyZ3VtZW50LlNcIiwgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyIG9mIHMgaXMgKywgLSwgb3IgWlxyXG4gICAgICogQHBhcmFtIHNcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmcgPSBmdW5jdGlvbiAocykge1xyXG4gICAgICAgIHZhciB0ID0gcy50cmltKCk7XHJcbiAgICAgICAgcmV0dXJuICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgdC5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IHQgPT09IFwiWlwiKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRpbWUgem9uZSBjYWNoZS5cclxuICAgICAqL1xyXG4gICAgVGltZVpvbmUuX2NhY2hlID0ge307XHJcbiAgICByZXR1cm4gVGltZVpvbmU7XHJcbn0oKSk7XHJcbmV4cG9ydHMuVGltZVpvbmUgPSBUaW1lWm9uZTtcclxuLyoqXHJcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIFRpbWVab25lLiBOb3RlIHRoYXQgaXQgZG9lcyBub3Qgd29yayBmb3Igc3ViIGNsYXNzZXMuIEhvd2V2ZXIsIHVzZSB0aGlzIHRvIGJlIHJvYnVzdFxyXG4gKiBhZ2FpbnN0IGRpZmZlcmVudCB2ZXJzaW9ucyBvZiB0aGUgbGlicmFyeSBpbiBvbmUgcHJvY2VzcyBpbnN0ZWFkIG9mIGluc3RhbmNlb2ZcclxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaXNUaW1lWm9uZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5jbGFzc0tpbmQgPT09IFwiVGltZVpvbmVcIjtcclxufVxyXG5leHBvcnRzLmlzVGltZVpvbmUgPSBpc1RpbWVab25lO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD10aW1lem9uZS5qcy5tYXAiLCIvKipcclxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy50b2tlbml6ZSA9IGV4cG9ydHMuVG9rZW5UeXBlID0gdm9pZCAwO1xyXG4vKipcclxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcclxuICovXHJcbnZhciBUb2tlblR5cGU7XHJcbihmdW5jdGlvbiAoVG9rZW5UeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIFJhdyB0ZXh0XHJcbiAgICAgKi9cclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJJREVOVElUWVwiXSA9IDBdID0gXCJJREVOVElUWVwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkVSQVwiXSA9IDFdID0gXCJFUkFcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJZRUFSXCJdID0gMl0gPSBcIllFQVJcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJRVUFSVEVSXCJdID0gM10gPSBcIlFVQVJURVJcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJNT05USFwiXSA9IDRdID0gXCJNT05USFwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIldFRUtcIl0gPSA1XSA9IFwiV0VFS1wiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIkRBWVwiXSA9IDZdID0gXCJEQVlcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJXRUVLREFZXCJdID0gN10gPSBcIldFRUtEQVlcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJEQVlQRVJJT0RcIl0gPSA4XSA9IFwiREFZUEVSSU9EXCI7XHJcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiSE9VUlwiXSA9IDldID0gXCJIT1VSXCI7XHJcbiAgICBUb2tlblR5cGVbVG9rZW5UeXBlW1wiTUlOVVRFXCJdID0gMTBdID0gXCJNSU5VVEVcIjtcclxuICAgIFRva2VuVHlwZVtUb2tlblR5cGVbXCJTRUNPTkRcIl0gPSAxMV0gPSBcIlNFQ09ORFwiO1xyXG4gICAgVG9rZW5UeXBlW1Rva2VuVHlwZVtcIlpPTkVcIl0gPSAxMl0gPSBcIlpPTkVcIjtcclxufSkoVG9rZW5UeXBlID0gZXhwb3J0cy5Ub2tlblR5cGUgfHwgKGV4cG9ydHMuVG9rZW5UeXBlID0ge30pKTtcclxuLyoqXHJcbiAqIFRva2VuaXplIGFuIExETUwgZGF0ZS90aW1lIGZvcm1hdCBzdHJpbmdcclxuICogQHBhcmFtIGZvcm1hdFN0cmluZyB0aGUgc3RyaW5nIHRvIHRva2VuaXplXHJcbiAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gdG9rZW5pemUoZm9ybWF0U3RyaW5nKSB7XHJcbiAgICBpZiAoIWZvcm1hdFN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgIHZhciBhcHBlbmRUb2tlbiA9IGZ1bmN0aW9uICh0b2tlblN0cmluZywgcmF3KSB7XHJcbiAgICAgICAgLy8gVGhlIHRva2VuU3RyaW5nIG1heSBiZSBsb25nZXIgdGhhbiBzdXBwb3J0ZWQgZm9yIGEgdG9rZW50eXBlLCBlLmcuIFwiaGhoaFwiIHdoaWNoIHdvdWxkIGJlIFRXTyBob3VyIHNwZWNzLlxyXG4gICAgICAgIC8vIFdlIGdyZWVkaWx5IGNvbnN1bWUgTERNTCBzcGVjcyB3aGlsZSBwb3NzaWJsZVxyXG4gICAgICAgIHdoaWxlICh0b2tlblN0cmluZyAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICBpZiAocmF3IHx8ICFTWU1CT0xfTUFQUElORy5oYXNPd25Qcm9wZXJ0eSh0b2tlblN0cmluZ1swXSkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICByYXc6IHRva2VuU3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogVG9rZW5UeXBlLklERU5USVRZXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgdG9rZW5TdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIHRva2VuLCBkaWZmZXJlbnQgbGVuZ3RocyBtYXkgYmUgc3VwcG9ydGVkXHJcbiAgICAgICAgICAgICAgICB2YXIgaW5mbyA9IFNZTUJPTF9NQVBQSU5HW3Rva2VuU3RyaW5nWzBdXTtcclxuICAgICAgICAgICAgICAgIHZhciBsZW5ndGhfMSA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIGlmIChpbmZvLm1heExlbmd0aCA9PT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheShpbmZvLmxlbmd0aHMpIHx8IGluZm8ubGVuZ3Rocy5sZW5ndGggPT09IDApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBpcyBhbGxvd2VkXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoXzEgPSB0b2tlblN0cmluZy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpbmZvLm1heExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ3JlZWRpbHkgZ29iYmxlIHVwXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoXzEgPSBNYXRoLm1pbih0b2tlblN0cmluZy5sZW5ndGgsIGluZm8ubWF4TGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi8gaWYgKEFycmF5LmlzQXJyYXkoaW5mby5sZW5ndGhzKSAmJiBpbmZvLmxlbmd0aHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGZpbmQgbWF4aW11bSBhbGxvd2VkIGxlbmd0aFxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBpbmZvLmxlbmd0aHM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobCA8PSB0b2tlblN0cmluZy5sZW5ndGggJiYgKGxlbmd0aF8xID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoXzEgPCBsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoXzEgPSBsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAobGVuZ3RoXzEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vIGFsbG93ZWQgbGVuZ3RoIGZvdW5kIChub3QgcG9zc2libGUgd2l0aCBjdXJyZW50IHN5bWJvbCBtYXBwaW5nIHNpbmNlIGxlbmd0aCAxIGlzIGFsd2F5cyBhbGxvd2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhdzogdG9rZW5TdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuVHlwZS5JREVOVElUWVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuU3RyaW5nID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHByZWZpeCBmb3VuZFxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBsZW5ndGhfMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmF3OiB0b2tlblN0cmluZy5zbGljZSgwLCBsZW5ndGhfMSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGluZm8udHlwZVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRva2VuU3RyaW5nID0gdG9rZW5TdHJpbmcuc2xpY2UobGVuZ3RoXzEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgdmFyIHByZXZpb3VzQ2hhciA9IFwiXCI7XHJcbiAgICB2YXIgcXVvdGluZyA9IGZhbHNlO1xyXG4gICAgdmFyIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIF9pID0gMCwgZm9ybWF0U3RyaW5nXzEgPSBmb3JtYXRTdHJpbmc7IF9pIDwgZm9ybWF0U3RyaW5nXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRDaGFyID0gZm9ybWF0U3RyaW5nXzFbX2ldO1xyXG4gICAgICAgIC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xyXG4gICAgICAgIGlmIChjdXJyZW50Q2hhciA9PT0gXCInXCIpIHtcclxuICAgICAgICAgICAgaWYgKCFxdW90aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVzY2FwZWQgYSBzaW5nbGUgJyBjaGFyYWN0ZXIgd2l0aG91dCBxdW90aW5nXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kVG9rZW4oY3VycmVudFRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRva2VuICs9IFwiJ1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVHdvIHBvc3NpYmlsaXRpZXM6IFdlcmUgYXJlIGRvbmUgcXVvdGluZywgb3Igd2UgYXJlIGVzY2FwaW5nIGEgJyBjaGFyYWN0ZXJcclxuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXNjYXBpbmcsIGFkZCAnIHRvIHRoZSB0b2tlblxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYXliZSBlc2NhcGluZywgd2FpdCBmb3IgbmV4dCB0b2tlbiBpZiB3ZSBhcmUgZXNjYXBpbmdcclxuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUVzY2FwaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXBvc3NpYmxlRXNjYXBpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgY2hhcmFjdGVyIGlzIHJlbGV2YW50LCBzbyBzYXZlIGl0IGZvciBpbnNwZWN0aW5nIG5leHQgcm91bmRcclxuICAgICAgICAgICAgICAgIHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XHJcbiAgICAgICAgICAgIHF1b3RpbmcgPSAhcXVvdGluZztcclxuICAgICAgICAgICAgcG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyBGbHVzaCBjdXJyZW50IHRva2VuXHJcbiAgICAgICAgICAgIGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgIXF1b3RpbmcpO1xyXG4gICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocXVvdGluZykge1xyXG4gICAgICAgICAgICAvLyBRdW90aW5nIG1vZGUsIGFkZCBjaGFyYWN0ZXIgdG8gdG9rZW4uXHJcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG4gICAgICAgICAgICAvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxyXG4gICAgICAgICAgICBhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4pO1xyXG4gICAgICAgICAgICBjdXJyZW50VG9rZW4gPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFdlIGFyZSByZXBlYXRpbmcgdGhlIHRva2VuIHdpdGggbW9yZSBjaGFyYWN0ZXJzXHJcbiAgICAgICAgICAgIGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcbiAgICB9XHJcbiAgICAvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXHJcbiAgICBhcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHF1b3RpbmcpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5leHBvcnRzLnRva2VuaXplID0gdG9rZW5pemU7XHJcbnZhciBTWU1CT0xfTUFQUElORyA9IHtcclxuICAgIEc6IHsgdHlwZTogVG9rZW5UeXBlLkVSQSwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICB5OiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXHJcbiAgICBZOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXHJcbiAgICB1OiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXHJcbiAgICBVOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSLCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIHI6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcclxuICAgIFE6IHsgdHlwZTogVG9rZW5UeXBlLlFVQVJURVIsIG1heExlbmd0aDogNSB9LFxyXG4gICAgcTogeyB0eXBlOiBUb2tlblR5cGUuUVVBUlRFUiwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBNOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBMOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBsOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiAxIH0sXHJcbiAgICB3OiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLLCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIFc6IHsgdHlwZTogVG9rZW5UeXBlLldFRUssIG1heExlbmd0aDogMSB9LFxyXG4gICAgZDogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIEQ6IHsgdHlwZTogVG9rZW5UeXBlLkRBWSwgbWF4TGVuZ3RoOiAzIH0sXHJcbiAgICBGOiB7IHR5cGU6IFRva2VuVHlwZS5EQVksIG1heExlbmd0aDogMSB9LFxyXG4gICAgZzogeyB0eXBlOiBUb2tlblR5cGUuREFZIH0sXHJcbiAgICBFOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcclxuICAgIGU6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxyXG4gICAgYzogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXHJcbiAgICBhOiB7IHR5cGU6IFRva2VuVHlwZS5EQVlQRVJJT0QsIG1heExlbmd0aDogNSB9LFxyXG4gICAgYjogeyB0eXBlOiBUb2tlblR5cGUuREFZUEVSSU9ELCBtYXhMZW5ndGg6IDUgfSxcclxuICAgIEI6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICBoOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIEg6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxyXG4gICAgazogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcbiAgICBLOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIGo6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogNiB9LFxyXG4gICAgSjogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXHJcbiAgICBtOiB7IHR5cGU6IFRva2VuVHlwZS5NSU5VVEUsIG1heExlbmd0aDogMiB9LFxyXG4gICAgczogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05ELCBtYXhMZW5ndGg6IDIgfSxcclxuICAgIFM6IHsgdHlwZTogVG9rZW5UeXBlLlNFQ09ORCB9LFxyXG4gICAgQTogeyB0eXBlOiBUb2tlblR5cGUuU0VDT05EIH0sXHJcbiAgICB6OiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDQgfSxcclxuICAgIFo6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxyXG4gICAgTzogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbGVuZ3RoczogWzEsIDRdIH0sXHJcbiAgICB2OiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBsZW5ndGhzOiBbMSwgNF0gfSxcclxuICAgIFY6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNCB9LFxyXG4gICAgWDogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXHJcbiAgICB4OiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dG9rZW4uanMubWFwIiwiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5UekRhdGFiYXNlID0gZXhwb3J0cy5Ob3JtYWxpemVPcHRpb24gPSBleHBvcnRzLlRyYW5zaXRpb24gPSBleHBvcnRzLmlzVmFsaWRPZmZzZXRTdHJpbmcgPSBleHBvcnRzLlpvbmVJbmZvID0gZXhwb3J0cy5SdWxlVHlwZSA9IGV4cG9ydHMuUnVsZUluZm8gPSBleHBvcnRzLkF0VHlwZSA9IGV4cG9ydHMuT25UeXBlID0gZXhwb3J0cy5Ub1R5cGUgPSB2b2lkIDA7XHJcbnZhciBhc3NlcnRfMSA9IHJlcXVpcmUoXCIuL2Fzc2VydFwiKTtcclxudmFyIGJhc2ljc18xID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG52YXIgZHVyYXRpb25fMSA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG52YXIgZXJyb3JfMSA9IHJlcXVpcmUoXCIuL2Vycm9yXCIpO1xyXG52YXIgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbi8qKlxyXG4gKiBUeXBlIG9mIHJ1bGUgVE8gY29sdW1uIHZhbHVlXHJcbiAqL1xyXG52YXIgVG9UeXBlO1xyXG4oZnVuY3Rpb24gKFRvVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxyXG4gICAgICovXHJcbiAgICBUb1R5cGVbVG9UeXBlW1wiWWVhclwiXSA9IDBdID0gXCJZZWFyXCI7XHJcbiAgICAvKipcclxuICAgICAqIFwibWF4XCJcclxuICAgICAqL1xyXG4gICAgVG9UeXBlW1RvVHlwZVtcIk1heFwiXSA9IDFdID0gXCJNYXhcIjtcclxufSkoVG9UeXBlID0gZXhwb3J0cy5Ub1R5cGUgfHwgKGV4cG9ydHMuVG9UeXBlID0ge30pKTtcclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcclxuICovXHJcbnZhciBPblR5cGU7XHJcbihmdW5jdGlvbiAoT25UeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIERheS1vZi1tb250aCBudW1iZXJcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkRheU51bVwiXSA9IDBdID0gXCJEYXlOdW1cIjtcclxuICAgIC8qKlxyXG4gICAgICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXHJcbiAgICAgKi9cclxuICAgIE9uVHlwZVtPblR5cGVbXCJMYXN0WFwiXSA9IDFdID0gXCJMYXN0WFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBlLmcuIFwiU3VuPj04XCJcclxuICAgICAqL1xyXG4gICAgT25UeXBlW09uVHlwZVtcIkdyZXFYXCJdID0gMl0gPSBcIkdyZXFYXCI7XHJcbiAgICAvKipcclxuICAgICAqIGUuZy4gXCJTdW48PThcIlxyXG4gICAgICovXHJcbiAgICBPblR5cGVbT25UeXBlW1wiTGVxWFwiXSA9IDNdID0gXCJMZXFYXCI7XHJcbn0pKE9uVHlwZSA9IGV4cG9ydHMuT25UeXBlIHx8IChleHBvcnRzLk9uVHlwZSA9IHt9KSk7XHJcbnZhciBBdFR5cGU7XHJcbihmdW5jdGlvbiAoQXRUeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIExvY2FsIHRpbWUgKG5vIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIlN0YW5kYXJkXCJdID0gMF0gPSBcIlN0YW5kYXJkXCI7XHJcbiAgICAvKipcclxuICAgICAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuICAgICAqL1xyXG4gICAgQXRUeXBlW0F0VHlwZVtcIldhbGxcIl0gPSAxXSA9IFwiV2FsbFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVdGMgdGltZVxyXG4gICAgICovXHJcbiAgICBBdFR5cGVbQXRUeXBlW1wiVXRjXCJdID0gMl0gPSBcIlV0Y1wiO1xyXG59KShBdFR5cGUgPSBleHBvcnRzLkF0VHlwZSB8fCAoZXhwb3J0cy5BdFR5cGUgPSB7fSkpO1xyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbnZhciBSdWxlSW5mbyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBmcm9tXHJcbiAgICAgKiBAcGFyYW0gdG9UeXBlXHJcbiAgICAgKiBAcGFyYW0gdG9ZZWFyXHJcbiAgICAgKiBAcGFyYW0gdHlwZVxyXG4gICAgICogQHBhcmFtIGluTW9udGhcclxuICAgICAqIEBwYXJhbSBvblR5cGVcclxuICAgICAqIEBwYXJhbSBvbkRheVxyXG4gICAgICogQHBhcmFtIG9uV2Vla0RheVxyXG4gICAgICogQHBhcmFtIGF0SG91clxyXG4gICAgICogQHBhcmFtIGF0TWludXRlXHJcbiAgICAgKiBAcGFyYW0gYXRTZWNvbmRcclxuICAgICAqIEBwYXJhbSBhdFR5cGVcclxuICAgICAqIEBwYXJhbSBzYXZlXHJcbiAgICAgKiBAcGFyYW0gbGV0dGVyXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUnVsZUluZm8oXHJcbiAgICAvKipcclxuICAgICAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBmcm9tLCBcclxuICAgIC8qKlxyXG4gICAgICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIHRvVHlwZSwgXHJcbiAgICAvKipcclxuICAgICAqIElmIFRPIGNvbHVtbiBpcyBhIHllYXIsIHRoZSB5ZWFyIG51bWJlci4gSWYgVE8gY29sdW1uIGlzIFwib25seVwiLCB0aGUgRlJPTSB5ZWFyLlxyXG4gICAgICovXHJcbiAgICB0b1llYXIsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBUWVBFIGNvbHVtbiwgbm90IHVzZWQgc28gZmFyXHJcbiAgICAgKi9cclxuICAgIHR5cGUsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcclxuICAgICAqL1xyXG4gICAgaW5Nb250aCwgXHJcbiAgICAvKipcclxuICAgICAqIE9OIGNvbHVtbiB0eXBlXHJcbiAgICAgKi9cclxuICAgIG9uVHlwZSwgXHJcbiAgICAvKipcclxuICAgICAqIElmIG9uVHlwZSBpcyBEYXlOdW0sIHRoZSBkYXkgbnVtYmVyXHJcbiAgICAgKi9cclxuICAgIG9uRGF5LCBcclxuICAgIC8qKlxyXG4gICAgICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XHJcbiAgICAgKi9cclxuICAgIG9uV2Vla0RheSwgXHJcbiAgICAvKipcclxuICAgICAqIEFUIGNvbHVtbiBob3VyXHJcbiAgICAgKi9cclxuICAgIGF0SG91ciwgXHJcbiAgICAvKipcclxuICAgICAqIEFUIGNvbHVtbiBtaW51dGVcclxuICAgICAqL1xyXG4gICAgYXRNaW51dGUsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBBVCBjb2x1bW4gc2Vjb25kXHJcbiAgICAgKi9cclxuICAgIGF0U2Vjb25kLCBcclxuICAgIC8qKlxyXG4gICAgICogQVQgY29sdW1uIHR5cGVcclxuICAgICAqL1xyXG4gICAgYXRUeXBlLCBcclxuICAgIC8qKlxyXG4gICAgICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcbiAgICAgKi9cclxuICAgIHNhdmUsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXHJcbiAgICAgKiBOb3RlIGlmIFRaIGRhdGFiYXNlIGluZGljYXRlcyBcIi1cIiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5mcm9tID0gZnJvbTtcclxuICAgICAgICB0aGlzLnRvVHlwZSA9IHRvVHlwZTtcclxuICAgICAgICB0aGlzLnRvWWVhciA9IHRvWWVhcjtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMuaW5Nb250aCA9IGluTW9udGg7XHJcbiAgICAgICAgdGhpcy5vblR5cGUgPSBvblR5cGU7XHJcbiAgICAgICAgdGhpcy5vbkRheSA9IG9uRGF5O1xyXG4gICAgICAgIHRoaXMub25XZWVrRGF5ID0gb25XZWVrRGF5O1xyXG4gICAgICAgIHRoaXMuYXRIb3VyID0gYXRIb3VyO1xyXG4gICAgICAgIHRoaXMuYXRNaW51dGUgPSBhdE1pbnV0ZTtcclxuICAgICAgICB0aGlzLmF0U2Vjb25kID0gYXRTZWNvbmQ7XHJcbiAgICAgICAgdGhpcy5hdFR5cGUgPSBhdFR5cGU7XHJcbiAgICAgICAgdGhpcy5zYXZlID0gc2F2ZTtcclxuICAgICAgICB0aGlzLmxldHRlciA9IGxldHRlcjtcclxuICAgICAgICBpZiAodGhpcy5zYXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KGJhc2ljc18xLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHJ1bGUgaXMgYXBwbGljYWJsZSBpbiB0aGUgeWVhclxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5hcHBsaWNhYmxlID0gZnVuY3Rpb24gKHllYXIpIHtcclxuICAgICAgICBpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy50b1R5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUb1R5cGUuTWF4OiByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cclxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdGhpcyBydWxlIGRlcGVuZHMgb24gYSB3ZWVrZGF5IGFuZCB0aGUgd2Vla2RheSBpbiBxdWVzdGlvbiBkb2Vzbid0IGV4aXN0XHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVMZXNzID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmZyb20gPiBvdGhlci5mcm9tKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pIDwgb3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IGNvbXBhcmlzb25cclxuICAgICAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgdGhlIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVFcXVhbCA9IGZ1bmN0aW9uIChvdGhlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmZyb20gIT09IG90aGVyLmZyb20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgeWVhci1yZWxhdGl2ZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBEZXBlbmRpbmcgb24gdGhlIHJ1bGUgdGhpcyBjYW4gYmUgYSBVVEMgdGltZSwgYSB3YWxsIGNsb2NrIHRpbWUsIG9yIGFcclxuICAgICAqIHRpbWUgaW4gc3RhbmRhcmQgb2Zmc2V0IChpLmUuIHlvdSBzdGlsbCBuZWVkIHRvIGNvbXBlbnNhdGUgZm9yIHRoaXMuYXRUeXBlKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEFwcGxpY2FibGUgaWYgdGhpcyBydWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIHRoZSBnaXZlbiB5ZWFyXHJcbiAgICAgKi9cclxuICAgIFJ1bGVJbmZvLnByb3RvdHlwZS5lZmZlY3RpdmVEYXRlID0gZnVuY3Rpb24gKHllYXIpIHtcclxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcInRpbWV6b25lY29tcGxldGUuTm90QXBwbGljYWJsZVwiLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gJWRcIiwgeWVhcik7XHJcbiAgICAgICAgLy8geWVhciBhbmQgbW9udGggYXJlIGdpdmVuXHJcbiAgICAgICAgdmFyIHkgPSB5ZWFyO1xyXG4gICAgICAgIHZhciBtID0gdGhpcy5pbk1vbnRoO1xyXG4gICAgICAgIHZhciBkID0gMDtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgZGF5XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLm9uVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5EYXlOdW06XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZCA9IHRoaXMub25EYXk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuR3JlcVg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHksIG0sIHRoaXMub25EYXksIHRoaXMub25XZWVrRGF5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFwiTm90Rm91bmRcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFwciBTdW4+PTI3IGFjdHVhbGx5IG1lYW5zIGFueSBzdW5kYXkgYWZ0ZXIgQXByaWwgMjcsIGkuZS4gaXQgZG9lcyBub3QgaGF2ZSB0byBiZSBpbiBBcHJpbC4gVHJ5IG5leHQgbW9udGguXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobSArIDEgPD0gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gbSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0geSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkID0gYmFzaWNzLmZpcnN0V2Vla0RheU9mTW9udGgoeSwgbSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxlcVg6XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy53ZWVrRGF5T25PckJlZm9yZSh5LCBtLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoMCwgZXJyb3JfMS5lcnJvcklzKShlLCBcIk5vdEZvdW5kXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobSA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gbSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtID0gMTI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHkgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZCA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeSwgbSwgdGhpcy5vbldlZWtEYXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgT25UeXBlLkxhc3RYOlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGQgPSBiYXNpY3MubGFzdFdlZWtEYXlPZk1vbnRoKHksIG0sIHRoaXMub25XZWVrRGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmFzaWNzXzEuVGltZVN0cnVjdC5mcm9tQ29tcG9uZW50cyh5LCBtLCBkLCB0aGlzLmF0SG91ciwgdGhpcy5hdE1pbnV0ZSwgdGhpcy5hdFNlY29uZCk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBFZmZlY3RpdmUgZGF0ZSBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXIsIGluIGEgc3BlY2lmaWMgdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0geWVhclxyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0IHRoZSBzdGFuZGFyZCBvZmZzZXQgZnJvbSBVVCBvZiB0aGUgdGltZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gZHN0T2Zmc2V0IHRoZSBEU1Qgb2Zmc2V0IGJlZm9yZSB0aGUgcnVsZVxyXG4gICAgICovXHJcbiAgICBSdWxlSW5mby5wcm90b3R5cGUuZWZmZWN0aXZlRGF0ZVV0YyA9IGZ1bmN0aW9uICh5ZWFyLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSB7XHJcbiAgICAgICAgdmFyIGQgPSB0aGlzLmVmZmVjdGl2ZURhdGUoeWVhcik7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmF0VHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5VdGM6IHJldHVybiBkO1xyXG4gICAgICAgICAgICBjYXNlIEF0VHlwZS5TdGFuZGFyZDoge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiB0aW1lIGlzIGluIHpvbmUgbG9jYWwgdGltZSB3aXRob3V0IERTVFxyXG4gICAgICAgICAgICAgICAgdmFyIG1pbGxpcyA9IGQudW5peE1pbGxpcztcclxuICAgICAgICAgICAgICAgIG1pbGxpcyAtPSBzdGFuZGFyZE9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgQXRUeXBlLldhbGw6IHtcclxuICAgICAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aCBEU1RcclxuICAgICAgICAgICAgICAgIHZhciBtaWxsaXMgPSBkLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgICAgICAgICBtaWxsaXMgLT0gc3RhbmRhcmRPZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHN0T2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWlsbGlzIC09IGRzdE9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChtaWxsaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBSdWxlSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5SdWxlSW5mbyA9IFJ1bGVJbmZvO1xyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbnZhciBSdWxlVHlwZTtcclxuKGZ1bmN0aW9uIChSdWxlVHlwZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBObyBydWxlIGFwcGxpZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogRml4ZWQgZ2l2ZW4gb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIFJ1bGVUeXBlW1J1bGVUeXBlW1wiT2Zmc2V0XCJdID0gMV0gPSBcIk9mZnNldFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuICAgICAqL1xyXG4gICAgUnVsZVR5cGVbUnVsZVR5cGVbXCJSdWxlTmFtZVwiXSA9IDJdID0gXCJSdWxlTmFtZVwiO1xyXG59KShSdWxlVHlwZSA9IGV4cG9ydHMuUnVsZVR5cGUgfHwgKGV4cG9ydHMuUnVsZVR5cGUgPSB7fSkpO1xyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xyXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cclxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxyXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cclxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xyXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXHJcbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cclxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXHJcbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcclxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XHJcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XHJcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cclxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcclxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXHJcbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXHJcbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXHJcbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxyXG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcclxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cclxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxyXG4gKi9cclxudmFyIFpvbmVJbmZvID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIGdtdG9mZlxyXG4gICAgICogQHBhcmFtIHJ1bGVUeXBlXHJcbiAgICAgKiBAcGFyYW0gcnVsZU9mZnNldFxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0XHJcbiAgICAgKiBAcGFyYW0gdW50aWxcclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBab25lSW5mbyhcclxuICAgIC8qKlxyXG4gICAgICogR01UIG9mZnNldCBpbiBmcmFjdGlvbmFsIG1pbnV0ZXMsIFBPU0lUSVZFIHRvIFVUQyAobm90ZSBKYXZhU2NyaXB0LkRhdGUgZ2l2ZXMgb2Zmc2V0c1xyXG4gICAgICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXHJcbiAgICAgKiBpdCBpcyBvbmUgaG91ciBhaGVhZCBvZiBVVENcclxuICAgICAqL1xyXG4gICAgZ210b2ZmLCBcclxuICAgIC8qKlxyXG4gICAgICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG4gICAgICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcbiAgICAgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxyXG4gICAgICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcbiAgICAgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcbiAgICAgKi9cclxuICAgIHJ1bGVUeXBlLCBcclxuICAgIC8qKlxyXG4gICAgICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGFuIG9mZnNldCwgdGhpcyBpcyB0aGUgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIHJ1bGVPZmZzZXQsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYSBydWxlIG5hbWUsIHRoaXMgaXMgdGhlIHJ1bGUgbmFtZVxyXG4gICAgICovXHJcbiAgICBydWxlTmFtZSwgXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBGT1JNQVQgY29sdW1uIHNwZWNpZmllcyB0aGUgdXN1YWwgYWJicmV2aWF0aW9uIG9mIHRoZSB0aW1lIHpvbmUgbmFtZS4gSXQgY2FuIGhhdmUgb25lIG9mIGZvdXIgZm9ybXM6XHJcbiAgICAgKiB0aGUgc3RyaW5nLCDigJx6enos4oCdIHdoaWNoIGlzIGEga2luZCBvZiBudWxsIHZhbHVlIChkb27igJl0IGFzaylcclxuICAgICAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAqIGEgcGFpciBvZiBzdHJpbmdzIHNlcGFyYXRlZCBieSBhIHNsYXNoICjigJgv4oCZKSwgaW4gd2hpY2ggY2FzZSB0aGUgZmlyc3Qgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb25cclxuICAgICAqIGZvciB0aGUgc3RhbmRhcmQgdGltZSBuYW1lIGFuZCB0aGUgc2Vjb25kIHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uIGZvciB0aGUgZGF5bGlnaHQgc2F2aW5nIHRpbWUgbmFtZVxyXG4gICAgICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxyXG4gICAgICovXHJcbiAgICBmb3JtYXQsIFxyXG4gICAgLyoqXHJcbiAgICAgKiBVbnRpbCB0aW1lc3RhbXAgaW4gdW5peCB1dGMgbWlsbGlzLiBUaGUgem9uZSBpbmZvIGlzIHZhbGlkIHVwIHRvXHJcbiAgICAgKiBhbmQgZXhjbHVkaW5nIHRoaXMgdGltZXN0YW1wLlxyXG4gICAgICogTm90ZSB0aGlzIHZhbHVlIGNhbiBiZSB1bmRlZmluZWQgKGZvciB0aGUgZmlyc3QgcnVsZSlcclxuICAgICAqL1xyXG4gICAgdW50aWwpIHtcclxuICAgICAgICB0aGlzLmdtdG9mZiA9IGdtdG9mZjtcclxuICAgICAgICB0aGlzLnJ1bGVUeXBlID0gcnVsZVR5cGU7XHJcbiAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gcnVsZU9mZnNldDtcclxuICAgICAgICB0aGlzLnJ1bGVOYW1lID0gcnVsZU5hbWU7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBmb3JtYXQ7XHJcbiAgICAgICAgdGhpcy51bnRpbCA9IHVudGlsO1xyXG4gICAgICAgIGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBab25lSW5mbztcclxufSgpKTtcclxuZXhwb3J0cy5ab25lSW5mbyA9IFpvbmVJbmZvO1xyXG52YXIgVHpNb250aE5hbWVzO1xyXG4oZnVuY3Rpb24gKFR6TW9udGhOYW1lcykge1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkphblwiXSA9IDFdID0gXCJKYW5cIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJGZWJcIl0gPSAyXSA9IFwiRmViXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTWFyXCJdID0gM10gPSBcIk1hclwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkFwclwiXSA9IDRdID0gXCJBcHJcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJNYXlcIl0gPSA1XSA9IFwiTWF5XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiSnVuXCJdID0gNl0gPSBcIkp1blwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIkp1bFwiXSA9IDddID0gXCJKdWxcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJBdWdcIl0gPSA4XSA9IFwiQXVnXCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiU2VwXCJdID0gOV0gPSBcIlNlcFwiO1xyXG4gICAgVHpNb250aE5hbWVzW1R6TW9udGhOYW1lc1tcIk9jdFwiXSA9IDEwXSA9IFwiT2N0XCI7XHJcbiAgICBUek1vbnRoTmFtZXNbVHpNb250aE5hbWVzW1wiTm92XCJdID0gMTFdID0gXCJOb3ZcIjtcclxuICAgIFR6TW9udGhOYW1lc1tUek1vbnRoTmFtZXNbXCJEZWNcIl0gPSAxMl0gPSBcIkRlY1wiO1xyXG59KShUek1vbnRoTmFtZXMgfHwgKFR6TW9udGhOYW1lcyA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUdXJucyBhIG1vbnRoIG5hbWUgZnJvbSB0aGUgVFogZGF0YWJhc2UgaW50byBhIG51bWJlciAxLTEyXHJcbiAqIEBwYXJhbSBuYW1lXHJcbiAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGZvciBpbnZhbGlkIG1vbnRoIG5hbWVcclxuICovXHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvTnVtYmVyKG5hbWUpIHtcclxuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IDEyOyArK2kpIHtcclxuICAgICAgICBpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJJbnZhbGlkIG1vbnRoIG5hbWUgJyVzJ1wiLCBuYW1lKTtcclxufVxyXG52YXIgVHpEYXlOYW1lcztcclxuKGZ1bmN0aW9uIChUekRheU5hbWVzKSB7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJTdW5cIl0gPSAwXSA9IFwiU3VuXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJNb25cIl0gPSAxXSA9IFwiTW9uXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUdWVcIl0gPSAyXSA9IFwiVHVlXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJXZWRcIl0gPSAzXSA9IFwiV2VkXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJUaHVcIl0gPSA0XSA9IFwiVGh1XCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJGcmlcIl0gPSA1XSA9IFwiRnJpXCI7XHJcbiAgICBUekRheU5hbWVzW1R6RGF5TmFtZXNbXCJTYXRcIl0gPSA2XSA9IFwiU2F0XCI7XHJcbn0pKFR6RGF5TmFtZXMgfHwgKFR6RGF5TmFtZXMgPSB7fSkpO1xyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICogQHRocm93cyBub3RoaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHMpIHtcclxuICAgIHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5leHBvcnRzLmlzVmFsaWRPZmZzZXRTdHJpbmcgPSBpc1ZhbGlkT2Zmc2V0U3RyaW5nO1xyXG4vKipcclxuICogRGVmaW5lcyBhIG1vbWVudCBhdCB3aGljaCB0aGUgZ2l2ZW4gcnVsZSBiZWNvbWVzIHZhbGlkXHJcbiAqL1xyXG52YXIgVHJhbnNpdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBhdFxyXG4gICAgICogQHBhcmFtIG9mZnNldFxyXG4gICAgICogQHBhcmFtIGxldHRlclxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFRyYW5zaXRpb24oXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zaXRpb24gdGltZSBpbiBVVEMgbWlsbGlzXHJcbiAgICAgKi9cclxuICAgIGF0LCBcclxuICAgIC8qKlxyXG4gICAgICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcbiAgICAgKi9cclxuICAgIG9mZnNldCwgXHJcbiAgICAvKipcclxuICAgICAqIE5ldyB0aW16b25lIGFiYnJldmlhdGlvbiBsZXR0ZXJcclxuICAgICAqL1xyXG4gICAgbGV0dGVyKSB7XHJcbiAgICAgICAgdGhpcy5hdCA9IGF0O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xyXG4gICAgICAgIHRoaXMubGV0dGVyID0gbGV0dGVyO1xyXG4gICAgICAgIGlmICh0aGlzLm9mZnNldCkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBUcmFuc2l0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLlRyYW5zaXRpb24gPSBUcmFuc2l0aW9uO1xyXG4vKipcclxuICogT3B0aW9uIGZvciBUekRhdGFiYXNlI25vcm1hbGl6ZUxvY2FsKClcclxuICovXHJcbnZhciBOb3JtYWxpemVPcHRpb247XHJcbihmdW5jdGlvbiAoTm9ybWFsaXplT3B0aW9uKSB7XHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJVcFwiXSA9IDBdID0gXCJVcFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IFNVQlRSQUNUSU5HIHRoZSBEU1Qgb2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIE5vcm1hbGl6ZU9wdGlvbltOb3JtYWxpemVPcHRpb25bXCJEb3duXCJdID0gMV0gPSBcIkRvd25cIjtcclxufSkoTm9ybWFsaXplT3B0aW9uID0gZXhwb3J0cy5Ob3JtYWxpemVPcHRpb24gfHwgKGV4cG9ydHMuTm9ybWFsaXplT3B0aW9uID0ge30pKTtcclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSB3cmFwcGVyIGFyb3VuZCB0aW1lIHpvbmUgZGF0YSBKU09OIG9iamVjdCBmcm9tIHRoZSB0emRhdGEgTlBNIG1vZHVsZS5cclxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cclxuICovXHJcbnZhciBUekRhdGFiYXNlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciAtIGRvIG5vdCB1c2UsIHRoaXMgaXMgYSBzaW5nbGV0b24gY2xhc3MuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKCkgaW5zdGVhZFxyXG4gICAgICogQHRocm93cyBBbHJlYWR5Q3JlYXRlZCBpZiBhbiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0c1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYGRhdGFgIGlzIGVtcHR5IG9yIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gVHpEYXRhYmFzZShkYXRhKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogem9uZSBpbmZvIGNhY2hlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZSA9IHt9O1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl9ydWxlSW5mb0NhY2hlID0ge307XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcHJlLWNhbGN1bGF0ZWQgdHJhbnNpdGlvbnMgcGVyIHpvbmVcclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLl96b25lVHJhbnNpdGlvbnNDYWNoZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwcmUtY2FsY3VsYXRlZCB0cmFuc2l0aW9ucyBwZXIgcnVsZXNldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHRoaXMuX3J1bGVUcmFuc2l0aW9uc0NhY2hlID0gbmV3IE1hcCgpO1xyXG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghVHpEYXRhYmFzZS5faW5zdGFuY2UsIFwiQWxyZWFkeUNyZWF0ZWRcIiwgXCJZb3Ugc2hvdWxkIG5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIFR6RGF0YWJhc2UgY2xhc3MgeW91cnNlbGYuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKClcIik7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGRhdGEubGVuZ3RoID4gMCwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiVGltZXpvbmVjb21wbGV0ZSBuZWVkcyB0aW1lIHpvbmUgZGF0YS4gWW91IG5lZWQgdG8gaW5zdGFsbCBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcyBiZWZvcmUgdXNpbmcgdGltZXpvbmVjb21wbGV0ZS5cIik7XHJcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fZGF0YSA9IHsgem9uZXM6IHt9LCBydWxlczoge30gfTtcclxuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZCAmJiBkLnJ1bGVzICYmIGQuem9uZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZC5ydWxlcyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9kYXRhLnJ1bGVzW2tleV0gPSBkLnJ1bGVzW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgX2MgPSBPYmplY3Qua2V5cyhkLnpvbmVzKTsgX2IgPCBfYy5sZW5ndGg7IF9iKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9jW19iXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIChyZS0pIGluaXRpYWxpemUgdGltZXpvbmVjb21wbGV0ZSB3aXRoIHRpbWUgem9uZSBkYXRhXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGRhdGEgVFogZGF0YSBhcyBKU09OIG9iamVjdCAoZnJvbSBvbmUgb2YgdGhlIHR6ZGF0YSBOUE0gbW9kdWxlcykuXHJcbiAgICAgKiAgICAgICAgICAgICBJZiBub3QgZ2l2ZW4sIFRpbWV6b25lY29tcGxldGUgd2lsbCBzZWFyY2ggZm9yIGluc3RhbGxlZCBtb2R1bGVzLlxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYGRhdGFgIG9yIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluaXQgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gdW5kZWZpbmVkOyAvLyBuZWVkZWQgZm9yIGFzc2VydCBpbiBjb25zdHJ1Y3RvclxyXG4gICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbZGF0YV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGRhdGFfMSA9IFtdO1xyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGluIGdsb2JhbCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgdmFyIGcgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBnID0gd2luZG93O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGcgPSBnbG9iYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGcgPSBzZWxmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZyA9IHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmtleXMoZyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoXCJ0emRhdGFcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZ1trZXldKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0cnkgdG8gZmluZCBUWiBkYXRhIGFzIGluc3RhbGxlZCBOUE0gbW9kdWxlc1xyXG4gICAgICAgICAgICB2YXIgZmluZE5vZGVNb2R1bGVzID0gZnVuY3Rpb24gKHJlcXVpcmUpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ekRhdGFOYW1lID0gXCJ0emRhdGFcIjtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHJlcXVpcmUodHpEYXRhTmFtZSk7IC8vIHVzZSB2YXJpYWJsZSB0byBhdm9pZCBicm93c2VyaWZ5IGFjdGluZyB1cFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFfMS5wdXNoKGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHRyeSBzdWJzZXRzXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1vZHVsZU5hbWVzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hZnJpY2FcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtYW50YXJjdGljYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1hc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWF1c3RyYWxhc2lhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldGNldGVyYVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInR6ZGF0YS1ldXJvcGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXBhY2lmaWNuZXdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0emRhdGEtc291dGhhbWVyaWNhXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHpkYXRhLXN5c3RlbXZcIlxyXG4gICAgICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YV8xLnB1c2goZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdGhpbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoZGF0YV8xLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGFfMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2VcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHRoZSBnbG9iYWwgdGltZSB6b25lIGRhdGEgaXMgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLmluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgVHpEYXRhYmFzZS5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiBhbGwgem9uZSBuYW1lc1xyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnpvbmVOYW1lcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xyXG4gICAgICAgICAgICB0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcclxuICAgICAgICAgICAgdGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBleGlzdHNcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmV4aXN0cyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG4gICAgICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG4gICAgICpcclxuICAgICAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHQob3B0aW9uYWwpIGlmIGdpdmVuLCB0aGUgcmVzdWx0IGZvciB0aGUgZ2l2ZW4gem9uZSBpcyByZXR1cm5lZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubWluRHN0U2F2ZSA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh6b25lTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZU5hbWVzID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc18xID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc18xW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lICYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCB0ZW1wXzEgPSB0ZW1wOyBfYSA8IHRlbXBfMS5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBfMVtfYV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmICgoMCwgZXJyb3JfMS5lcnJvcklzKShlLCBbXCJOb3RGb3VuZC5SdWxlXCIsIFwiQXJndW1lbnQuTlwiXSkpIHtcclxuICAgICAgICAgICAgICAgIGUgPSAoMCwgZXJyb3JfMS5lcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuICAgICAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5tYXhEc3RTYXZlID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgem9uZUluZm9zID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIHZhciBydWxlTmFtZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzIgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzIubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzJbX2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCB0ZW1wXzIgPSB0ZW1wOyBfYSA8IHRlbXBfMi5sZW5ndGg7IF9hKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHRlbXBfMltfYV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLmhvdXJzKDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgaWYgKCgwLCBlcnJvcl8xLmVycm9ySXMpKGUsIFtcIk5vdEZvdW5kLlJ1bGVcIiwgXCJBcmd1bWVudC5OXCJdKSkge1xyXG4gICAgICAgICAgICAgICAgZSA9ICgwLCBlcnJvcl8xLmVycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aHJvdyBlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5oYXNEc3QgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubWF4RHN0U2F2ZSh6b25lTmFtZSkubWlsbGlzZWNvbmRzKCkgIT09IDApO1xyXG4gICAgfTtcclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm5leHREc3RDaGFuZ2UgPSBmdW5jdGlvbiAoem9uZU5hbWUsIGEpIHtcclxuICAgICAgICB2YXIgdXRjVGltZSA9ICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KGEpIDogYSk7XHJcbiAgICAgICAgdmFyIHpvbmUgPSB0aGlzLl9nZXRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUpO1xyXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHpvbmUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgaWYgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPiB1dGNUaW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChpdGVyYXRvcikge1xyXG4gICAgICAgICAgICBpdGVyYXRvciA9IHpvbmUuZmluZE5leHQoaXRlcmF0b3IpO1xyXG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0YyA+IHV0Y1RpbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBldmVudHVhbGx5IGxpbmtzIHRvXHJcbiAgICAgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcclxuICAgICAqIFwiVVRDXCIsIFwiR01UXCIsIFwiRXRjL0dNVFwiIGV0Yy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuem9uZUlzVXRjID0gZnVuY3Rpb24gKHpvbmVOYW1lKSB7XHJcbiAgICAgICAgdmFyIGFjdHVhbFpvbmVOYW1lID0gem9uZU5hbWU7XHJcbiAgICAgICAgdmFyIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcbiAgICAgICAgLy8gZm9sbG93IGxpbmtzXHJcbiAgICAgICAgd2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG4gICAgICAgICAgICAgICAgICAgICsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcbiAgICAgICAgICAgIHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VUQ1wiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9HTVRcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVUNUXCIpO1xyXG4gICAgfTtcclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLm5vcm1hbGl6ZUxvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBhLCBvcHQpIHtcclxuICAgICAgICBpZiAob3B0ID09PSB2b2lkIDApIHsgb3B0ID0gTm9ybWFsaXplT3B0aW9uLlVwOyB9XHJcbiAgICAgICAgaWYgKHRoaXMuaGFzRHN0KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgbG9jYWxUaW1lID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoYSkgOiBhKTtcclxuICAgICAgICAgICAgLy8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcbiAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXHJcbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgYmluYXJ5IHNlYXJjaGluZyBpcyBub3QgcG9zc2libGUuXHJcbiAgICAgICAgICAgIC8vIEluc3RlYWQsIHdlIHNob3VsZCBjaGVjayB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnMgd2l0aGluIGEgd2luZG93IGFyb3VuZCB0aGUgbG9jYWwgdGltZVxyXG4gICAgICAgICAgICAvLyBnZXQgYWxsIHRyYW5zaXRpb25zIChub3RlIHRoaXMgaW5jbHVkZXMgZmFrZSB0cmFuc2l0aW9uIHJ1bGVzIGZvciB6b25lIG9mZnNldCBjaGFuZ2VzKVxyXG4gICAgICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XHJcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IHpvbmUudHJhbnNpdGlvbnNJblllYXJzKGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMSk7XHJcbiAgICAgICAgICAgIC8vIGZpbmQgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zXHJcbiAgICAgICAgICAgIHZhciBwcmV2ID0gZHVyYXRpb25fMS5EdXJhdGlvbi5ob3VycygwKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB0cmFuc2l0aW9uc18xID0gdHJhbnNpdGlvbnM7IF9pIDwgdHJhbnNpdGlvbnNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNfMVtfaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldC5ncmVhdGVyVGhhbihwcmV2KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2NhbEJlZm9yZSA9IHRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcyArIHByZXYubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxvY2FsQWZ0ZXIgPSB0cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMgKyBvZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxvY2FsVGltZS51bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIGxvY2FsVGltZS51bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9yd2FyZENoYW5nZSA9IG9mZnNldC5zdWIocHJldik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vbi1leGlzdGluZyB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYWN0b3IgPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uVXAgPyAxIDogLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0TWlsbGlzID0gbG9jYWxUaW1lLnVuaXhNaWxsaXMgKyBmYWN0b3IgKiBmb3J3YXJkQ2hhbmdlLm1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gcmVzdWx0TWlsbGlzIDogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QocmVzdWx0TWlsbGlzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJldiA9IG9mZnNldDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBubyBub24tZXhpc3RpbmcgdGltZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gYSA6IGEuY2xvbmUoKSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuICAgICAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnN0YW5kYXJkT2Zmc2V0ID0gZnVuY3Rpb24gKHpvbmVOYW1lLCB1dGNUaW1lKSB7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjVGltZSk7XHJcbiAgICAgICAgcmV0dXJuIHpvbmVJbmZvLmdtdG9mZi5jbG9uZSgpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLlxyXG4gICAgICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VGltZXN0YW1wIGluIFVUQywgZWl0aGVyIGFzIFRpbWVTdHJ1Y3Qgb3IgYXMgVW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZSBuYW1lIG5vdCBmb3VuZCBvciBhIGxpbmtlZCB6b25lIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgYXJlIGludmFsaWRcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUudG90YWxPZmZzZXQgPSBmdW5jdGlvbiAoem9uZU5hbWUsIHV0Y1RpbWUpIHtcclxuICAgICAgICB2YXIgdSA9IHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lO1xyXG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcclxuICAgICAgICB2YXIgc3RhdGUgPSB6b25lLnN0YXRlQXQodSk7XHJcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRzdE9mZnNldC5hZGQoc3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWUgem9uZSBydWxlIGFiYnJldmlhdGlvbiwgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxyXG4gICAgICogTm90ZSB0aGlzIGlzIGRlcGVuZGVudCBvbiB0aGUgdGltZSwgYmVjYXVzZSB3aXRoIHRpbWUgZGlmZmVyZW50IHJ1bGVzIGFyZSBpbiBlZmZlY3RcclxuICAgICAqIGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGFiYnJldmlhdGlvbnMuIFRoZXkgYWxzbyBjaGFuZ2Ugd2l0aCBEU1Q6IGUuZy4gQ0VTVCBvciBDRVQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMgdW5peCBtaWxsaXNlY29uZHNcclxuICAgICAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuICAgICAqIEByZXR1cm5cdFRoZSBhYmJyZXZpYXRpb24gb2YgdGhlIHJ1bGUgdGhhdCBpcyBpbiBlZmZlY3RcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgbmFtZSBub3QgZm91bmQgb3IgYSBsaW5rZWQgem9uZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIHZhbHVlcyBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGFyZSBpbnZhbGlkXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmFiYnJldmlhdGlvbiA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSwgZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGRzdERlcGVuZGVudCA9PT0gdm9pZCAwKSB7IGRzdERlcGVuZGVudCA9IHRydWU7IH1cclxuICAgICAgICB2YXIgdSA9IHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QodXRjVGltZSkgOiB1dGNUaW1lO1xyXG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcclxuICAgICAgICBpZiAoZHN0RGVwZW5kZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHpvbmUuc3RhdGVBdCh1KTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLmFiYnJldmlhdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBsYXN0Tm9uRHN0ID0gem9uZS5pbml0aWFsU3RhdGUuZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpID09PSAwID8gem9uZS5pbml0aWFsU3RhdGUuYWJicmV2aWF0aW9uIDogXCJcIjtcclxuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gem9uZS5maW5kRmlyc3QoKTtcclxuICAgICAgICAgICAgaWYgKChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQubWlsbGlzZWNvbmRzKCkpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0Tm9uRHN0ID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5hYmJyZXZpYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMgPD0gdSkge1xyXG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSB6b25lLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgICAgIGlmICgoaXRlcmF0b3IgPT09IG51bGwgfHwgaXRlcmF0b3IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0Lm1pbGxpc2Vjb25kcygpKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3ROb25Ec3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmFiYnJldmlhdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbGFzdE5vbkRzdDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBleGNsdWRpbmcgRFNULCBhdFxyXG4gICAgICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuICAgICAqXHJcbiAgICAgKiBJZiB0aGUgbG9jYWwgdGltZXN0YW1wIGV4aXN0cyB0d2ljZSAoYXMgY2FuIG9jY3VyIHZlcnkgcmFyZWx5IGR1ZSB0byB6b25lIGNoYW5nZXMpXHJcbiAgICAgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG4gICAgICpcclxuICAgICAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lTmFtZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5zdGFuZGFyZE9mZnNldExvY2FsID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBsb2NhbFRpbWUpIHtcclxuICAgICAgICB2YXIgdW5peE1pbGxpcyA9ICh0eXBlb2YgbG9jYWxUaW1lID09PSBcIm51bWJlclwiID8gbG9jYWxUaW1lIDogbG9jYWxUaW1lLnVuaXhNaWxsaXMpO1xyXG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfMyA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfMy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzNbX2ldO1xyXG4gICAgICAgICAgICBpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCArIHpvbmVJbmZvLmdtdG9mZi5taWxsaXNlY29uZHMoKSA+IHVuaXhNaWxsaXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuICAgICAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAuIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lIGlzIG5vcm1hbGl6ZWQgb3V0LlxyXG4gICAgICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIFVUQyB0aW1lcyBhbmQgdGhlcmVmb3JlIG11bHRpcGxlIG9mZnNldHMgZm9yIGEgbG9jYWwgdGltZVxyXG4gICAgICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXHJcbiAgICAgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuICAgICAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlpvbmUgaWYgem9uZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUudG90YWxPZmZzZXRMb2NhbCA9IGZ1bmN0aW9uICh6b25lTmFtZSwgbG9jYWxUaW1lKSB7XHJcbiAgICAgICAgdmFyIHRzID0gKHR5cGVvZiBsb2NhbFRpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdChsb2NhbFRpbWUpIDogbG9jYWxUaW1lKTtcclxuICAgICAgICB2YXIgbm9ybWFsaXplZFRtID0gdGhpcy5ub3JtYWxpemVMb2NhbCh6b25lTmFtZSwgdHMpO1xyXG4gICAgICAgIC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxyXG4gICAgICAgIC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcbiAgICAgICAgLy8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcclxuICAgICAgICAvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG4gICAgICAgIC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzICA8LS0gbm90ZSB0aW1lIGdvaW5nIEJBQ0tXQVJEXHJcbiAgICAgICAgLy8gVGhlcmVmb3JlIGJpbmFyeSBzZWFyY2ggZG9lcyBub3QgYXBwbHkuIExpbmVhciBzZWFyY2ggdGhyb3VnaCB0cmFuc2l0aW9uc1xyXG4gICAgICAgIC8vIGFuZCByZXR1cm4gdGhlIGZpcnN0IG9mZnNldCB0aGF0IG1hdGNoZXNcclxuICAgICAgICB2YXIgem9uZSA9IHRoaXMuX2dldFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSk7XHJcbiAgICAgICAgdmFyIHRyYW5zaXRpb25zID0gem9uZS50cmFuc2l0aW9uc0luWWVhcnMobm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAyKTtcclxuICAgICAgICB2YXIgcHJldjtcclxuICAgICAgICB2YXIgcHJldlByZXY7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB0cmFuc2l0aW9uc18yID0gdHJhbnNpdGlvbnM7IF9pIDwgdHJhbnNpdGlvbnNfMi5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc18yW19pXTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0LmFkZCh0cmFuc2l0aW9uLm5ld1N0YXRlLnN0YW5kYXJkT2Zmc2V0KTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcyArIG9mZnNldC5taWxsaXNlY29uZHMoKSA+IG5vcm1hbGl6ZWRUbS51bml4TWlsbGlzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZQcmV2ID0gcHJldjtcclxuICAgICAgICAgICAgcHJldiA9IHRyYW5zaXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXHJcbiAgICAgICAgaWYgKHByZXYpIHtcclxuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXJlIGR1cmluZyBiYWNrd2FyZCBjaGFuZ2U6IHRha2UgZmlyc3Qgb2NjdXJyZW5jZSBvZiBsb2NhbCB0aW1lXHJcbiAgICAgICAgICAgIHZhciBwcmV2T2Zmc2V0ID0gcHJldi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKHByZXYubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xyXG4gICAgICAgICAgICB2YXIgcHJldlByZXZPZmZzZXQgPSBwcmV2UHJldiA/IHByZXZQcmV2Lm5ld1N0YXRlLmRzdE9mZnNldC5hZGQocHJldlByZXYubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAocHJldlByZXYgJiYgcHJldlByZXZPZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBwcmV2UHJldk9mZnNldC5ncmVhdGVyVGhhbihwcmV2T2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYmFja3dhcmQgY2hhbmdlXHJcbiAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IHByZXZQcmV2T2Zmc2V0LnN1YihwcmV2T2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkVG0udW5peE1pbGxpcyA+PSBwcmV2LmF0VXRjLnVuaXhNaWxsaXMgKyBwcmV2T2Zmc2V0Lm1pbGxpc2Vjb25kcygpXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0VXRjLnVuaXhNaWxsaXMgKyBwcmV2T2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdpdGhpbiBkdXBsaWNhdGUgcmFuZ2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldlByZXZPZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2T2Zmc2V0LmNsb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldk9mZnNldC5jbG9uZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB6b25lLnN0YXRlQXQobm9ybWFsaXplZFRtKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLmRzdE9mZnNldC5hZGQoc3RhdGUuc3RhbmRhcmRPZmZzZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERFUFJFQ0FURUQgYmVjYXVzZSBEU1Qgb2Zmc2V0IGRlcGVuZHMgb24gdGhlIHpvbmUgdG9vLCBub3QganVzdCBvbiB0aGUgcnVsZXNldFxyXG4gICAgICogUmV0dXJucyB0aGUgRFNUIG9mZnNldCAoV0lUSE9VVCB0aGUgc3RhbmRhcmQgem9uZSBvZmZzZXQpIGZvciB0aGUgZ2l2ZW4gcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuICAgICAqXHJcbiAgICAgKiBAZGVwcmVjYXRlZFxyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuICAgICAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuZHN0T2Zmc2V0Rm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIG9mZnNldDtcclxuICAgICAgICBmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQuY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgIGlmICghb2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIC8vIGFwcGFyZW50bHkgbm8gbG9uZ2VyIERTVCwgYXMgZS5nLiBmb3IgQXNpYS9Ub2t5b1xyXG4gICAgICAgICAgICBvZmZzZXQgPSBkdXJhdGlvbl8xLkR1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB0aW1lIHpvbmUgbGV0dGVyIGZvciB0aGUgZ2l2ZW5cclxuICAgICAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXHJcbiAgICAgKlxyXG4gICAgICogQGRlcHJlY2F0ZWRcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcbiAgICAgKiBAcGFyYW0gdXRjVGltZVx0VVRDIHRpbWVzdGFtcCBhcyBUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzXHJcbiAgICAgKiBAcGFyYW0gc3RhbmRhcmRPZmZzZXRcdFN0YW5kYXJkIG9mZnNldCB3aXRob3V0IERTVCBmb3IgdGhlIHRpbWUgem9uZVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLk5vdEZvdW5kLlJ1bGUgaWYgcnVsZU5hbWUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiBhbiBlcnJvciBpcyBkaXNjb3ZlcmVkIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUubGV0dGVyRm9yUnVsZSA9IGZ1bmN0aW9uIChydWxlTmFtZSwgdXRjVGltZSwgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgdHMgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xyXG4gICAgICAgIC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcbiAgICAgICAgLy8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcbiAgICAgICAgdmFyIGxldHRlcjtcclxuICAgICAgICBmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICBpZiAoIWxldHRlcikge1xyXG4gICAgICAgICAgICAvLyBhcHBhcmVudGx5IG5vIGxvbmdlciBEU1QsIGFzIGUuZy4gZm9yIEFzaWEvVG9reW9cclxuICAgICAgICAgICAgbGV0dGVyID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxldHRlcjtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIERFUFJFQ0FURUQgYmVjYXVzZSBEU1Qgb2Zmc2V0IGRlcGVuZHMgb24gdGhlIHpvbmUgdG9vLCBub3QganVzdCBvbiB0aGUgcnVsZXNldFxyXG4gICAgICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXByZWNhdGVkXHJcbiAgICAgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XHJcbiAgICAgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG4gICAgICogQHBhcmFtIHRvWWVhclx0TGFzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiBUcmFuc2l0aW9ucywgd2l0aCBEU1Qgb2Zmc2V0cyAobm8gc3RhbmRhcmQgb2Zmc2V0IGluY2x1ZGVkKVxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkFyZ3VtZW50LkZyb21ZZWFyIGlmIGZyb21ZZWFyID4gdG9ZZWFyXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlTmFtZSBub3QgZm91bmRcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5JbnZhbGlkVGltZVpvbmVEYXRhIGlmIGFuIGVycm9yIGlzIGRpc2NvdmVyZWQgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMgPSBmdW5jdGlvbiAocnVsZU5hbWUsIGZyb21ZZWFyLCB0b1llYXIsIHN0YW5kYXJkT2Zmc2V0KSB7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGZyb21ZZWFyIDw9IHRvWWVhciwgXCJBcmd1bWVudC5Gcm9tWWVhclwiLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG4gICAgICAgIHZhciBydWxlcyA9IHRoaXMuX2dldFJ1bGVUcmFuc2l0aW9ucyhydWxlTmFtZSk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBwcmV2RHN0ID0gKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApOyAvLyB3cm9uZywgYnV0IHRoYXQncyB3aHkgdGhlIGZ1bmN0aW9uIGlzIGRlcHJlY2F0ZWRcclxuICAgICAgICB2YXIgaXRlcmF0b3IgPSBydWxlcy5maW5kRmlyc3QoKTtcclxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdC55ZWFyIDw9IHRvWWVhcikge1xyXG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IudHJhbnNpdGlvbi5hdC55ZWFyID49IGZyb21ZZWFyICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXQueWVhciA8PSB0b1llYXIpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBhdDogcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIHByZXZEc3QpLnVuaXhNaWxsaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlciB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZEc3QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldDtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlcy5maW5kTmV4dChpdGVyYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLmF0IC0gYi5hdDtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGJvdGggem9uZSBhbmQgcnVsZSBjaGFuZ2VzIGFzIHRvdGFsIChzdGQgKyBkc3QpIG9mZnNldHMuXHJcbiAgICAgKiBBZGRzIGFuIGluaXRpYWwgdHJhbnNpdGlvbiBpZiB0aGVyZSBpcyBub25lIHdpdGhpbiB0aGUgcmFuZ2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcclxuICAgICAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuQXJndW1lbnQuRnJvbVllYXIgaWYgZnJvbVllYXIgPiB0b1llYXJcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmVOYW1lIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgaWYgYW4gZXJyb3IgaXMgZGlzY292ZXJlZCBpbiB0aGUgdGltZSB6b25lIGRhdGFiYXNlXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBmcm9tWWVhciwgdG9ZZWFyKSB7XHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGZyb21ZZWFyIDw9IHRvWWVhciwgXCJBcmd1bWVudC5Gcm9tWWVhclwiLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG4gICAgICAgIHZhciB6b25lID0gdGhpcy5fZ2V0Wm9uZVRyYW5zaXRpb25zKHpvbmVOYW1lKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgdmFyIHN0YXJ0U3RhdGUgPSB6b25lLnN0YXRlQXQobmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBmcm9tWWVhciwgbW9udGg6IDEsIGRheTogMSB9KSk7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgICBhdDogbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QoeyB5ZWFyOiBmcm9tWWVhciB9KS51bml4TWlsbGlzLFxyXG4gICAgICAgICAgICBsZXR0ZXI6IHN0YXJ0U3RhdGUubGV0dGVyLFxyXG4gICAgICAgICAgICBvZmZzZXQ6IHN0YXJ0U3RhdGUuZHN0T2Zmc2V0LmFkZChzdGFydFN0YXRlLnN0YW5kYXJkT2Zmc2V0KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHpvbmUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA8PSB0b1llYXIpIHtcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMueWVhciA+PSBmcm9tWWVhcikge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGF0OiBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlciB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQuYWRkKGl0ZXJhdG9yLnRyYW5zaXRpb24ubmV3U3RhdGUuc3RhbmRhcmRPZmZzZXQpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpdGVyYXRvciA9IHpvbmUuZmluZE5leHQoaXRlcmF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5hdCAtIGIuYXQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuICAgICAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG4gICAgICogQHBhcmFtIHV0Y1RpbWVcdFVUQyB0aW1lIHN0YW1wIGFzIHVuaXggbWlsbGlzZWNvbmRzIG9yIGFzIGEgVGltZVN0cnVjdFxyXG4gICAgICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIG5hbWUgbm90IGZvdW5kIG9yIGEgbGlua2VkIHpvbmUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBpZiB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZSBhcmUgaW52YWxpZFxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRab25lSW5mbyA9IGZ1bmN0aW9uICh6b25lTmFtZSwgdXRjVGltZSkge1xyXG4gICAgICAgIHZhciB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XHJcbiAgICAgICAgdmFyIHpvbmVJbmZvcyA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHpvbmVJbmZvc180ID0gem9uZUluZm9zOyBfaSA8IHpvbmVJbmZvc180Lmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgem9uZUluZm8gPSB6b25lSW5mb3NfNFtfaV07XHJcbiAgICAgICAgICAgIGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsID4gdW5peE1pbGxpcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHpvbmVJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIk5vdEZvdW5kLlpvbmVcIiwgXCJubyB6b25lIGluZm8gZm91bmQgZm9yIHpvbmUgJyVzJ1wiLCB6b25lTmFtZSk7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUgc29ydGVkIGJ5IFVOVElMLCBhZnRlclxyXG4gICAgICogZm9sbG93aW5nIGFueSBsaW5rcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcclxuICAgICAqIEByZXR1cm4gQXJyYXkgb2Ygem9uZSBpbmZvcy4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgZG9lcyBub3QgZXhpc3Qgb3IgYSBsaW5rZWQgem9uZSBkb2VzIG5vdCBleGl0XHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLmdldFpvbmVJbmZvcyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIC8vIEZJUlNUIHZhbGlkYXRlIHpvbmUgbmFtZSBiZWZvcmUgc2VhcmNoaW5nIGNhY2hlXHJcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpLCBcIk5vdEZvdW5kLlpvbmVcIiwgXCJ6b25lIG5vdCBmb3VuZDogJyVzJ1wiLCB6b25lTmFtZSk7XHJcbiAgICAgICAgLy8gVGFrZSBmcm9tIGNhY2hlXHJcbiAgICAgICAgaWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHZhciBhY3R1YWxab25lTmFtZSA9IHpvbmVOYW1lO1xyXG4gICAgICAgIHZhciB6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgIC8vIGZvbGxvdyBsaW5rc1xyXG4gICAgICAgIHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiTm90Rm91bmQuWm9uZVwiLCBcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXHJcbiAgICAgICAgICAgICAgICAgICAgKyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuICAgICAgICAgICAgem9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmluYWwgem9uZSBpbmZvIGZvdW5kXHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lRW50cmllc18xID0gem9uZUVudHJpZXM7IF9pIDwgem9uZUVudHJpZXNfMS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVFbnRyeSA9IHpvbmVFbnRyaWVzXzFbX2ldO1xyXG4gICAgICAgICAgICB2YXIgcnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuICAgICAgICAgICAgdmFyIHVudGlsID0gbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbM10pO1xyXG4gICAgICAgICAgICBpZiAoaXNOYU4odW50aWwpKSB7XHJcbiAgICAgICAgICAgICAgICB1bnRpbCA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChuZXcgWm9uZUluZm8oZHVyYXRpb25fMS5EdXJhdGlvbi5taW51dGVzKC0xICogbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbMF0pKSwgcnVsZVR5cGUsIHJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQgPyBuZXcgZHVyYXRpb25fMS5EdXJhdGlvbih6b25lRW50cnlbMV0pIDogbmV3IGR1cmF0aW9uXzEuRHVyYXRpb24oKSwgcnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lID8gem9uZUVudHJ5WzFdIDogXCJcIiwgem9uZUVudHJ5WzJdLCB1bnRpbCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICAvLyBzb3J0IHVuZGVmaW5lZCBsYXN0XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGEudW50aWwgIT09IHVuZGVmaW5lZCAmJiBiLnVudGlsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIChhLnVudGlsIC0gYi51bnRpbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuICAgICAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG4gICAgICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5SdWxlIGlmIHJ1bGUgbm90IGZvdW5kXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCB2YWx1ZXMgaW4gdGhlIHRpbWUgem9uZSBkYXRhYmFzZVxyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5nZXRSdWxlSW5mb3MgPSBmdW5jdGlvbiAocnVsZU5hbWUpIHtcclxuICAgICAgICAvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSksIFwiTm90Rm91bmQuUnVsZVwiLCBcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XHJcbiAgICAgICAgLy8gcmV0dXJuIGZyb20gY2FjaGVcclxuICAgICAgICBpZiAodGhpcy5fcnVsZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIHZhciBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgcnVsZVNldF8xID0gcnVsZVNldDsgX2kgPCBydWxlU2V0XzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVTZXRfMVtfaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgZnJvbVllYXIgPSAocnVsZVswXSA9PT0gXCJOYU5cIiA/IC0xMDAwMCA6IHBhcnNlSW50KHJ1bGVbMF0sIDEwKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcclxuICAgICAgICAgICAgICAgIHZhciB0b1llYXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgb25UeXBlID0gdGhpcy5wYXJzZU9uVHlwZShydWxlWzRdKTtcclxuICAgICAgICAgICAgICAgIHZhciBvbkRheSA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG9uV2Vla0RheSA9IHRoaXMucGFyc2VPbldlZWtEYXkocnVsZVs0XSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbW9udGhOYW1lID0gcnVsZVszXTtcclxuICAgICAgICAgICAgICAgIHZhciBtb250aE51bWJlciA9IG1vbnRoTmFtZVRvTnVtYmVyKG1vbnRoTmFtZSk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChuZXcgUnVsZUluZm8oZnJvbVllYXIsIHRvVHlwZSwgdG9ZZWFyLCBydWxlWzJdLCBtb250aE51bWJlciwgb25UeXBlLCBvbkRheSwgb25XZWVrRGF5LCBtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcclxuICAgICAgICAgICAgICAgIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApLCA2MCksIG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApLCA2MCksIHRoaXMucGFyc2VBdFR5cGUocnVsZVs1XVszXSksIGR1cmF0aW9uXzEuRHVyYXRpb24ubWludXRlcyhwYXJzZUludChydWxlWzZdLCAxMCkpLCBydWxlWzddID09PSBcIi1cIiA/IFwiXCIgOiBydWxlWzddKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5fcnVsZUluZm9DYWNoZVtydWxlTmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGlmICgoMCwgZXJyb3JfMS5lcnJvcklzKShlLCBbXCJBcmd1bWVudC5Ub1wiLCBcIkFyZ3VtZW50Lk5cIiwgXCJBcmd1bWVudC5WYWx1ZVwiLCBcIkFyZ3VtZW50LkFtb3VudFwiXSkpIHtcclxuICAgICAgICAgICAgICAgIGUgPSAoMCwgZXJyb3JfMS5lcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgUlVMRVMgY29sdW1uIG9mIGEgem9uZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVJ1bGVUeXBlID0gZnVuY3Rpb24gKHJ1bGUpIHtcclxuICAgICAgICBpZiAocnVsZSA9PT0gXCItXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSdWxlVHlwZS5SdWxlTmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5UbyBmb3IgaW52YWxpZCBUT1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZVRvVHlwZSA9IGZ1bmN0aW9uICh0bykge1xyXG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXHJcbiAgICAgICAgaWYgKHRvID09PSBcIm1heFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuTWF4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIWlzTmFOKHBhcnNlSW50KHRvLCAxMCkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUb1R5cGUuWWVhcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkFyZ3VtZW50LlRvXCIsIFwiVE8gY29sdW1uIGluY29ycmVjdDogJXNcIiwgdG8pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuICAgICAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25UeXBlID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgaWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkxhc3RYO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gT25UeXBlLkxlcVg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvbi5pbmRleE9mKFwiPj1cIikgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPblR5cGUuR3JlcVg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBPblR5cGUuRGF5TnVtO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXHJcbiAgICAgKiBAdGhyb3dzIG5vdGhpbmdcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUucGFyc2VPbkRheSA9IGZ1bmN0aW9uIChvbiwgb25UeXBlKSB7XHJcbiAgICAgICAgc3dpdGNoIChvblR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuRGF5TnVtOiByZXR1cm4gcGFyc2VJbnQob24sIDEwKTtcclxuICAgICAgICAgICAgY2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xyXG4gICAgICAgICAgICBjYXNlIE9uVHlwZS5HcmVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPj1cIikgKyAyKSwgMTApO1xyXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGRheS1vZi13ZWVrIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgU3VuZGF5IGlmIG5vdCBwcmVzZW50LlxyXG4gICAgICogQHRocm93cyBub3RoaW5nXHJcbiAgICAgKi9cclxuICAgIFR6RGF0YWJhc2UucHJvdG90eXBlLnBhcnNlT25XZWVrRGF5ID0gZnVuY3Rpb24gKG9uKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG4gICAgICAgIGlmICh0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYXNpY3NfMS5XZWVrRGF5LlN1bmRheTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSB0aGUgQVQgY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcbiAgICAgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuICAgICAqIEB0aHJvd3Mgbm90aGluZ1xyXG4gICAgICovXHJcbiAgICBUekRhdGFiYXNlLnByb3RvdHlwZS5wYXJzZUF0VHlwZSA9IGZ1bmN0aW9uIChhdCkge1xyXG4gICAgICAgIHN3aXRjaCAoYXQpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNcIjogcmV0dXJuIEF0VHlwZS5TdGFuZGFyZDtcclxuICAgICAgICAgICAgY2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcbiAgICAgICAgICAgIGNhc2UgXCJnXCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG4gICAgICAgICAgICBjYXNlIFwielwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuICAgICAgICAgICAgY2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG4gICAgICAgICAgICBjYXNlIFwiXCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgY2FzZSBudWxsOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcbiAgICAgICAgICAgICAgICBpZiAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBdFR5cGUuV2FsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgcHJlLWNhbGN1bGF0ZWQgem9uZSB0cmFuc2l0aW9uc1xyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuWm9uZSBpZiB6b25lIGRvZXMgbm90IGV4aXN0IG9yIGEgbGlua2VkIHpvbmUgZG9lcyBub3QgZXhpdFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuX2dldFpvbmVUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uICh6b25lTmFtZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl96b25lVHJhbnNpdGlvbnNDYWNoZS5nZXQoem9uZU5hbWUpO1xyXG4gICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBDYWNoZWRab25lVHJhbnNpdGlvbnMoem9uZU5hbWUsIHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKSwgdGhpcy5fZ2V0UnVsZVRyYW5zaXRpb25zRm9yWm9uZSh6b25lTmFtZSkpO1xyXG4gICAgICAgICAgICB0aGlzLl96b25lVHJhbnNpdGlvbnNDYWNoZS5zZXQoem9uZU5hbWUsIHJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgcHJlLWNhbGN1bGF0ZWQgcnVsZSB0cmFuc2l0aW9uc1xyXG4gICAgICogQHBhcmFtIHJ1bGVOYW1lXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuX2dldFJ1bGVUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uIChydWxlTmFtZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9ydWxlVHJhbnNpdGlvbnNDYWNoZS5nZXQocnVsZU5hbWUpO1xyXG4gICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBDYWNoZWRSdWxlVHJhbnNpdGlvbnModGhpcy5nZXRSdWxlSW5mb3MocnVsZU5hbWUpKTtcclxuICAgICAgICAgICAgdGhpcy5fcnVsZVRyYW5zaXRpb25zQ2FjaGUuc2V0KHJ1bGVOYW1lLCByZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hcCBvZiBydWxlTmFtZS0+Q2FjaGVkUnVsZVRyYW5zaXRpb25zIGZvciBhbGwgcnVsZSBzZXRzIHRoYXQgYXJlIHJlZmVyZW5jZWQgYnkgYSB6b25lXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Ob3RGb3VuZC5ab25lIGlmIHpvbmUgZG9lcyBub3QgZXhpc3Qgb3IgYSBsaW5rZWQgem9uZSBkb2VzIG5vdCBleGl0XHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuTm90Rm91bmQuUnVsZSBpZiBydWxlIG5vdCBmb3VuZFxyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGEgZm9yIGludmFsaWQgdmFsdWVzIGluIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2VcclxuICAgICAqL1xyXG4gICAgVHpEYXRhYmFzZS5wcm90b3R5cGUuX2dldFJ1bGVUcmFuc2l0aW9uc0ZvclpvbmUgPSBmdW5jdGlvbiAoem9uZU5hbWUpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHZhciB6b25lSW5mb3MgPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCB6b25lSW5mb3NfNSA9IHpvbmVJbmZvczsgX2kgPCB6b25lSW5mb3NfNS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgdmFyIHpvbmVJbmZvID0gem9uZUluZm9zXzVbX2ldO1xyXG4gICAgICAgICAgICBpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5oYXMoem9uZUluZm8ucnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNldCh6b25lSW5mby5ydWxlTmFtZSwgdGhpcy5fZ2V0UnVsZVRyYW5zaXRpb25zKHpvbmVJbmZvLnJ1bGVOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVHpEYXRhYmFzZTtcclxufSgpKTtcclxuZXhwb3J0cy5UekRhdGFiYXNlID0gVHpEYXRhYmFzZTtcclxuLyoqXHJcbiAqIFNhbml0eSBjaGVjayBvbiBkYXRhLiBSZXR1cm5zIG1pbi9tYXggdmFsdWVzLlxyXG4gKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YSBmb3IgaW52YWxpZCBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YSkge1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiLCBcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJ0aW1lIHpvbmUgZGF0YSBzaG91bGQgYmUgYW4gb2JqZWN0XCIpO1xyXG4gICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGRhdGEuaGFzT3duUHJvcGVydHkoXCJydWxlc1wiKSwgXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwidGltZSB6b25lIGRhdGEgc2hvdWxkIGJlIGFuIG9iamVjdCB3aXRoIGEgJ3J1bGVzJyBwcm9wZXJ0eVwiKTtcclxuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIiksIFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcInRpbWUgem9uZSBkYXRhIHNob3VsZCBiZSBhbiBvYmplY3Qgd2l0aCBhICd6b25lcycgcHJvcGVydHlcIik7XHJcbiAgICAvLyB2YWxpZGF0ZSB6b25lc1xyXG4gICAgZm9yICh2YXIgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xyXG4gICAgICAgIGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG4gICAgICAgICAgICB2YXIgem9uZUFyciA9IGRhdGEuem9uZXNbem9uZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgLy8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG4gICAgICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUFyciksIFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IGZvciB6b25lIFxcXCIlc1xcXCIgbGlua3MgdG8gXFxcIiVzXFxcIiBidXQgdGhhdCBkb2VzblxcJ3QgZXhpc3RcIiwgem9uZU5hbWUsIHpvbmVBcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoem9uZUFycikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgZm9yIHpvbmUgXFxcIiVzXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiLCB6b25lTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZW50cnkgPSB6b25lQXJyW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBoYXMgbGVuZ3RoICE9IDRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlbMF0gIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ210b2ZmID0gbWF0aC5maWx0ZXJGbG9hdChlbnRyeVswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzTmFOKGdtdG9mZikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVsxXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHNlY29uZCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzJdICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nIG5vciBudWxsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5WzNdID09PSBcInN0cmluZ1wiICYmIGlzTmFOKG1hdGguZmlsdGVyRmxvYXQoZW50cnlbM10pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5tYXhHbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5tYXhHbXRPZmYgPSBnbXRvZmY7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubWluR210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHZhbGlkYXRlIHJ1bGVzXHJcbiAgICBmb3IgKHZhciBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XHJcbiAgICAgICAgaWYgKGRhdGEucnVsZXMuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlQXJyID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocnVsZUFycikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVBcnJbaV07XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUubGVuZ3RoIDwgOCkgeyAvLyBub3RlIHNvbWUgcnVsZXMgPiA4IGV4aXN0cyBidXQgdGhhdCBzZWVtcyB0byBiZSBhIGJ1ZyBpbiB0eiBmaWxlIHBhcnNpbmdcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJ1bGUubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVtcIiArIGoudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVsxXSBpcyBub3QgYSBudW1iZXIsIG9ubHkgb3IgbWF4XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoIVR6TW9udGhOYW1lcy5oYXNPd25Qcm9wZXJ0eShydWxlWzNdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcnVsZVs0XS5pbmRleE9mKFwiPD1cIikgPT09IC0xICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbNF0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV0gaXMgbm90IG9mIGxlbmd0aCA0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMl0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZVs1XVszXSAhPT0gXCJcIiAmJiBydWxlWzVdWzNdICE9PSBcInNcIiAmJiBydWxlWzVdWzNdICE9PSBcIndcIlxyXG4gICAgICAgICAgICAgICAgICAgICYmIHJ1bGVbNV1bM10gIT09IFwiZ1wiICYmIHJ1bGVbNV1bM10gIT09IFwidVwiICYmIHJ1bGVbNV1bM10gIT09IFwielwiICYmIHJ1bGVbNV1bM10gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVszXSBpcyBub3QgZW1wdHksIGcsIHosIHMsIHcsIHUgb3IgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBzYXZlID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xyXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oc2F2ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIGVycm9yXzEudGhyb3dFcnJvcikoXCJJbnZhbGlkVGltZVpvbmVEYXRhXCIsIFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNhdmUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1heERzdFNhdmUgPT09IHVuZGVmaW5lZCB8fCBzYXZlID4gcmVzdWx0Lm1heERzdFNhdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1heERzdFNhdmUgPSBzYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IHVuZGVmaW5lZCB8fCBzYXZlIDwgcmVzdWx0Lm1pbkRzdFNhdmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqIFJlYWR5LW1hZGUgc29ydGVkIHJ1bGUgdHJhbnNpdGlvbnMgKHVuY29tcGVuc2F0ZWQgZm9yIHN0ZG9mZnNldCwgYXMgcnVsZXMgYXJlIHVzZWQgYnkgbXVsdGlwbGUgem9uZXMgd2l0aCBkaWZmZXJlbnQgb2Zmc2V0cylcclxuICovXHJcbnZhciBDYWNoZWRSdWxlVHJhbnNpdGlvbnMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gcnVsZUluZm9zXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIENhY2hlZFJ1bGVUcmFuc2l0aW9ucyhydWxlSW5mb3MpIHtcclxuICAgICAgICAvLyBkZXRlcm1pbmUgbWF4aW11bSB5ZWFyIHRvIGNhbGN1bGF0ZSB0cmFuc2l0aW9ucyBmb3JcclxuICAgICAgICB2YXIgbWF4WWVhcjtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHJ1bGVJbmZvc18xID0gcnVsZUluZm9zOyBfaSA8IHJ1bGVJbmZvc18xLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBydWxlSW5mb3NfMVtfaV07XHJcbiAgICAgICAgICAgIGlmIChydWxlSW5mby50b1R5cGUgPT09IFRvVHlwZS5ZZWFyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF4WWVhciA9PT0gdW5kZWZpbmVkIHx8IHJ1bGVJbmZvLnRvWWVhciA+IG1heFllYXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhZZWFyID0gcnVsZUluZm8udG9ZZWFyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG1heFllYXIgPT09IHVuZGVmaW5lZCB8fCBydWxlSW5mby5mcm9tID4gbWF4WWVhcikge1xyXG4gICAgICAgICAgICAgICAgICAgIG1heFllYXIgPSBydWxlSW5mby5mcm9tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBhbGwgdHJhbnNpdGlvbnMgdW50aWwgJ21heCcgcnVsZXMgdGFrZSBlZmZlY3RcclxuICAgICAgICB0aGlzLl90cmFuc2l0aW9ucyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9hID0gMCwgcnVsZUluZm9zXzIgPSBydWxlSW5mb3M7IF9hIDwgcnVsZUluZm9zXzIubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IHJ1bGVJbmZvc18yW19hXTtcclxuICAgICAgICAgICAgdmFyIG1pbiA9IHJ1bGVJbmZvLmZyb207XHJcbiAgICAgICAgICAgIHZhciBtYXggPSBydWxlSW5mby50b1R5cGUgPT09IFRvVHlwZS5ZZWFyID8gcnVsZUluZm8udG9ZZWFyIDogbWF4WWVhcjtcclxuICAgICAgICAgICAgaWYgKG1heCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB5ZWFyID0gbWluOyB5ZWFyIDw9IG1heDsgKyt5ZWFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0OiBydWxlSW5mby5lZmZlY3RpdmVEYXRlKHllYXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdFR5cGU6IHJ1bGVJbmZvLmF0VHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcnVsZUluZm8uc2F2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogcnVsZUluZm8ubGV0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzb3J0IHRyYW5zaXRpb25zXHJcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvbnMgPSB0aGlzLl90cmFuc2l0aW9ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoYS5hdCA8IGIuYXQgPyAtMSA6XHJcbiAgICAgICAgICAgICAgICBhLmF0ID4gYi5hdCA/IDEgOlxyXG4gICAgICAgICAgICAgICAgICAgIDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIHNhdmUgdGhlICdtYXgnIHJ1bGVzIGZvciB0cmFuc2l0aW9ucyBhZnRlciB0aGF0XHJcbiAgICAgICAgdGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZSA9IHJ1bGVJbmZvcy5maWx0ZXIoZnVuY3Rpb24gKGluZm8pIHsgcmV0dXJuIGluZm8udG9UeXBlID09PSBUb1R5cGUuTWF4OyB9KTtcclxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlFZmZlY3RpdmUgPSBfX3NwcmVhZEFycmF5KFtdLCB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlLCB0cnVlKTtcclxuICAgICAgICAvLyBzb3J0IGZpbmFsIHJ1bGVzIGJ5IEZST00gYW5kIHRoZW4gYnkgeWVhci1yZWxhdGl2ZSBkYXRlXHJcbiAgICAgICAgdGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZSA9IHRoaXMuX2ZpbmFsUnVsZXNCeUZyb21FZmZlY3RpdmUuc29ydChmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgICAgICBpZiAoYS5mcm9tIDwgYi5mcm9tKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGEuZnJvbSA+IGIuZnJvbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFlID0gYS5lZmZlY3RpdmVEYXRlKGEuZnJvbSk7XHJcbiAgICAgICAgICAgIHZhciBiZSA9IGIuZWZmZWN0aXZlRGF0ZShiLmZyb20pO1xyXG4gICAgICAgICAgICByZXR1cm4gKGFlIDwgYmUgPyAtMSA6XHJcbiAgICAgICAgICAgICAgICBhZSA+IGJlID8gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gc29ydCBmaW5hbCBydWxlcyBieSB5ZWFyLXJlbGF0aXZlIGRhdGVcclxuICAgICAgICB0aGlzLl9maW5hbFJ1bGVzQnlFZmZlY3RpdmUgPSB0aGlzLl9maW5hbFJ1bGVzQnlGcm9tRWZmZWN0aXZlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgdmFyIGFlID0gYS5lZmZlY3RpdmVEYXRlKGEuZnJvbSk7XHJcbiAgICAgICAgICAgIHZhciBiZSA9IGIuZWZmZWN0aXZlRGF0ZShiLmZyb20pO1xyXG4gICAgICAgICAgICByZXR1cm4gKGFlIDwgYmUgPyAtMSA6XHJcbiAgICAgICAgICAgICAgICBhZSA+IGJlID8gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ2FjaGVkUnVsZVRyYW5zaXRpb25zLnByb3RvdHlwZSwgXCJmaW5hbFwiLCB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlICdtYXgnIHR5cGUgcnVsZXMgYXQgdGhlIGVuZCwgc29ydGVkIGJ5IHllYXItcmVsYXRpdmUgZWZmZWN0aXZlIGRhdGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmFsUnVsZXNCeUVmZmVjdGl2ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGV2ZXIgdHJhbnNpdGlvbiBhcyBkZWZpbmVkIGJ5IHRoZSBydWxlIHNldFxyXG4gICAgICovXHJcbiAgICBDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmRGaXJzdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb25zWzBdO1xyXG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBydWxlID0gdGhpcy5fZmluYWxSdWxlc0J5RnJvbUVmZmVjdGl2ZVswXTtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBhdDogcnVsZS5lZmZlY3RpdmVEYXRlKHJ1bGUuZnJvbSksXHJcbiAgICAgICAgICAgICAgICBhdFR5cGU6IHJ1bGUuYXRUeXBlLFxyXG4gICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGUuc2F2ZSxcclxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IHJ1bGUubGV0dGVyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXHJcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBuZXh0IHRyYW5zaXRpb24sIGdpdmVuIGFuIGl0ZXJhdG9yXHJcbiAgICAgKiBAcGFyYW0gcHJldiB0aGUgaXRlcmF0b3JcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkUnVsZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kTmV4dCA9IGZ1bmN0aW9uIChwcmV2KSB7XHJcbiAgICAgICAgaWYgKCFwcmV2LmZpbmFsICYmIHByZXYuaW5kZXggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBpZiAocHJldi5pbmRleCA8IHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gdGhpcy5fdHJhbnNpdGlvbnNbcHJldi5pbmRleCArIDFdO1xyXG4gICAgICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHByZXYuaW5kZXggKyAxXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpbmQgbWluaW11bSBhcHBsaWNhYmxlIGZpbmFsIHJ1bGUgYWZ0ZXIgdGhlIHByZXYgdHJhbnNpdGlvblxyXG4gICAgICAgIHZhciBmb3VuZDtcclxuICAgICAgICB2YXIgZm91bmRFZmZlY3RpdmU7XHJcbiAgICAgICAgZm9yICh2YXIgeWVhciA9IHByZXYudHJhbnNpdGlvbi5hdC55ZWFyOyB5ZWFyIDwgcHJldi50cmFuc2l0aW9uLmF0LnllYXIgKyAyOyArK3llYXIpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuX2ZpbmFsUnVsZXNCeUVmZmVjdGl2ZTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBydWxlID0gX2FbX2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUuYXBwbGljYWJsZSh5ZWFyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlZmZlY3RpdmUgPSBydWxlLmVmZmVjdGl2ZURhdGUoeWVhcik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVmZmVjdGl2ZSA+IHByZXYudHJhbnNpdGlvbi5hdCAmJiAoIWZvdW5kRWZmZWN0aXZlIHx8IGVmZmVjdGl2ZSA8IGZvdW5kRWZmZWN0aXZlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJ1bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kRWZmZWN0aXZlID0gZWZmZWN0aXZlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZm91bmQgJiYgZm91bmRFZmZlY3RpdmUpIHtcclxuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBhdDogZm91bmRFZmZlY3RpdmUsXHJcbiAgICAgICAgICAgICAgICBhdFR5cGU6IGZvdW5kLmF0VHlwZSxcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBmb3VuZC5zYXZlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxldHRlcjogZm91bmQubGV0dGVyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXHJcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBEaXJ0eSBmaW5kIGZ1bmN0aW9uIHRoYXQgb25seSB0YWtlcyBhIHN0YW5kYXJkIG9mZnNldCBmcm9tIFVUQyBpbnRvIGFjY291bnRcclxuICAgICAqIEBwYXJhbSBiZWZvcmVVdGMgdGltZXN0YW1wIHRvIHNlYXJjaCBmb3JcclxuICAgICAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldCB6b25lIHN0YW5kYXJkIG9mZnNldCB0byBhcHBseVxyXG4gICAgICovXHJcbiAgICBDYWNoZWRSdWxlVHJhbnNpdGlvbnMucHJvdG90eXBlLmZpbmRMYXN0TGVzc0VxdWFsID0gZnVuY3Rpb24gKGJlZm9yZVV0Yywgc3RhbmRhcmRPZmZzZXQpIHtcclxuICAgICAgICB2YXIgcHJldlRyYW5zaXRpb247XHJcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcclxuICAgICAgICB2YXIgZWZmZWN0aXZlVXRjID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA/IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yLnRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCB1bmRlZmluZWQpIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIHdoaWxlIChpdGVyYXRvciAmJiBlZmZlY3RpdmVVdGMgJiYgZWZmZWN0aXZlVXRjIDw9IGJlZm9yZVV0Yykge1xyXG4gICAgICAgICAgICBwcmV2VHJhbnNpdGlvbiA9IGl0ZXJhdG9yLnRyYW5zaXRpb247XHJcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gdGhpcy5maW5kTmV4dChpdGVyYXRvcik7XHJcbiAgICAgICAgICAgIGVmZmVjdGl2ZVV0YyA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPyBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgdW5kZWZpbmVkKSA6IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByZXZUcmFuc2l0aW9uO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBhZnRlclV0Y1xyXG4gICAgICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHJcbiAgICAgKiBAcGFyYW0gZHN0T2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIENhY2hlZFJ1bGVUcmFuc2l0aW9ucy5wcm90b3R5cGUuZmlyc3RUcmFuc2l0aW9uV2l0aG91dERzdEFmdGVyID0gZnVuY3Rpb24gKGFmdGVyVXRjLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIC8vIHRvZG8gaW5lZmZpY2llbnQgLSBvcHRpbWl6ZVxyXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgdmFyIGVmZmVjdGl2ZVV0YyA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPyBydWxlVHJhbnNpdGlvblV0YyhpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbiwgc3RhbmRhcmRPZmZzZXQsIGRzdE9mZnNldCkgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgd2hpbGUgKGl0ZXJhdG9yICYmIGVmZmVjdGl2ZVV0YyAmJiAoISgoX2EgPSBpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm5ld1N0YXRlLmRzdE9mZnNldC56ZXJvKCkpIHx8IGVmZmVjdGl2ZVV0YyA8PSBhZnRlclV0YykpIHtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgZWZmZWN0aXZlVXRjID0gKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uKSA/IHJ1bGVUcmFuc2l0aW9uVXRjKGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uLCBzdGFuZGFyZE9mZnNldCwgZHN0T2Zmc2V0KSA6IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yID09PSBudWxsIHx8IGl0ZXJhdG9yID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpdGVyYXRvci50cmFuc2l0aW9uO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDYWNoZWRSdWxlVHJhbnNpdGlvbnM7XHJcbn0oKSk7XHJcbi8qKlxyXG4gKiBSdWxlcyBkZXBlbmQgb24gcHJldmlvdXMgcnVsZXMsIGhlbmNlIHlvdSBjYW5ub3QgY2FsY3VsYXRlIERTVCB0cmFuc2l0aW9ucyB3aXRvdXQgc3RhcnRpbmcgYXQgdGhlIHN0YXJ0LlxyXG4gKiBOZXh0IHRvIHRoYXQsIHpvbmVzIHNvbWV0aW1lcyB0cmFuc2l0aW9uIGludG8gdGhlIG1pZGRsZSBvZiBhIHJ1bGUgc2V0LlxyXG4gKiBEdWUgdG8gdGhpcywgd2UgbWFpbnRhaW4gYSBjYWNoZSBvZiB0cmFuc2l0aW9ucyBmb3Igem9uZXNcclxuICovXHJcbnZhciBDYWNoZWRab25lVHJhbnNpdGlvbnMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcclxuICAgICAqIEBwYXJhbSB6b25lSW5mb3NcclxuICAgICAqIEBwYXJhbSBydWxlc1xyXG4gICAgICogQHRocm93cyB0aW1lem9uZWNvbXBsZXRlLkludmFsaWRUaW1lWm9uZURhdGFcclxuICAgICAqIEB0aHJvd3MgdGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ab25lSW5mb3MgaWYgem9uZUluZm9zIGlzIGVtcHR5XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIENhY2hlZFpvbmVUcmFuc2l0aW9ucyh6b25lTmFtZSwgem9uZUluZm9zLCBydWxlcykge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoem9uZUluZm9zLmxlbmd0aCA+IDAsIFwidGltZXpvbmVjb21wbGV0ZS5Bcmd1bWVudC5ab25lSW5mb3NcIiwgXCJ6b25lICclcycgd2l0aG91dCBpbmZvcm1hdGlvblwiLCB6b25lTmFtZSk7XHJcbiAgICAgICAgdGhpcy5fZmluYWxab25lSW5mbyA9IHpvbmVJbmZvc1t6b25lSW5mb3MubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgdGhpcy5faW5pdGlhbFN0YXRlID0gdGhpcy5fY2FsY0luaXRpYWxTdGF0ZSh6b25lTmFtZSwgem9uZUluZm9zLCBydWxlcyk7XHJcbiAgICAgICAgX2EgPSB0aGlzLl9jYWxjVHJhbnNpdGlvbnMoem9uZU5hbWUsIHRoaXMuX2luaXRpYWxTdGF0ZSwgem9uZUluZm9zLCBydWxlcyksIHRoaXMuX3RyYW5zaXRpb25zID0gX2FbMF0sIHRoaXMuX2ZpbmFsUnVsZXMgPSBfYVsxXTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLCBcImluaXRpYWxTdGF0ZVwiLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsU3RhdGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcclxuICAgIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIHRoZSBmaXJzdCB0cmFuc2l0aW9uLCBpZiBpdCBleGlzdHNcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMuX3RyYW5zaXRpb25zWzBdLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IDBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgbmV4dCB0cmFuc2l0aW9uLCBpZiBpdCBleGlzdHNcclxuICAgICAqIEBwYXJhbSBpdGVyYXRvciBwcmV2aW91cyBpdGVyYXRvclxyXG4gICAgICogQHJldHVybnMgdGhlIG5leHQgaXRlcmF0b3JcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5maW5kTmV4dCA9IGZ1bmN0aW9uIChpdGVyYXRvcikge1xyXG4gICAgICAgIGlmICghaXRlcmF0b3IuZmluYWwpIHtcclxuICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLmluZGV4IDwgdGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLl90cmFuc2l0aW9uc1tpdGVyYXRvci5pbmRleCArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpdGVyYXRvci5pbmRleCArIDFcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZvdW5kO1xyXG4gICAgICAgIGZvciAodmFyIHkgPSBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXI7IHkgPCBpdGVyYXRvci50cmFuc2l0aW9uLmF0VXRjLnllYXIgKyAyOyArK3kpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMuX2ZpbmFsUnVsZXM7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZUluZm8gPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdFV0YzogcnVsZUluZm8uZWZmZWN0aXZlRGF0ZVV0Yyh5LCBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLnN0YW5kYXJkT2Zmc2V0LCBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmRzdE9mZnNldCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24odGhpcy5fZmluYWxab25lSW5mby5mb3JtYXQsIHJ1bGVJbmZvLnNhdmUubm9uWmVybygpLCBydWxlSW5mby5sZXR0ZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBydWxlSW5mby5sZXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHJ1bGVJbmZvLnNhdmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5zdGFuZGFyZE9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNpdGlvbi5hdFV0YyA+IGl0ZXJhdG9yLnRyYW5zaXRpb24uYXRVdGMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmb3VuZCB8fCBmb3VuZC5hdFV0YyA+IHRyYW5zaXRpb24uYXRVdGMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJhbnNpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IGZvdW5kLFxyXG4gICAgICAgICAgICAgICAgaW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgem9uZSBzdGF0ZSBhdCB0aGUgZ2l2ZW4gVVRDIHRpbWVcclxuICAgICAqIEBwYXJhbSB1dGNcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5zdGF0ZUF0ID0gZnVuY3Rpb24gKHV0Yykge1xyXG4gICAgICAgIHZhciBwcmV2U3RhdGUgPSB0aGlzLl9pbml0aWFsU3RhdGU7XHJcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5maW5kRmlyc3QoKTtcclxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0YyA8PSB1dGMpIHtcclxuICAgICAgICAgICAgcHJldlN0YXRlID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZTtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSB0aGlzLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByZXZTdGF0ZTtcclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0cmFuc2l0aW9ucyBpbiB5ZWFyIFtzdGFydCwgZW5kKVxyXG4gICAgICogQHBhcmFtIHN0YXJ0IHN0YXJ0IHllYXIgKGluY2x1c2l2ZSlcclxuICAgICAqIEBwYXJhbSBlbmQgZW5kIHllYXIgKGV4Y2x1c2l2ZSlcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS50cmFuc2l0aW9uc0luWWVhcnMgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHN0YXJ0LTEgaXMgd2l0aGluIHRoZSBpbml0aWFsIHRyYW5zaXRpb25zIG9yIG5vdC4gV2UgdXNlIHN0YXJ0LTEgYmVjYXVzZSB3ZSB0YWtlIGFuIGV4dHJhIHllYXIgaW4gdGhlIGVsc2UgY2xhdXNlIGJlbG93XHJcbiAgICAgICAgdmFyIGZpbmFsID0gKHRoaXMuX3RyYW5zaXRpb25zLmxlbmd0aCA9PT0gMCB8fCB0aGlzLl90cmFuc2l0aW9uc1t0aGlzLl90cmFuc2l0aW9ucy5sZW5ndGggLSAxXS5hdFV0Yy55ZWFyIDwgc3RhcnQgLSAxKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgaWYgKCFmaW5hbCkge1xyXG4gICAgICAgICAgICAvLyBzaW1wbHkgZG8gbGluZWFyIHNlYXJjaFxyXG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLmZpbmRGaXJzdCgpO1xyXG4gICAgICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0Yy55ZWFyIDwgZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlcmF0b3IudHJhbnNpdGlvbi5hdFV0Yy55ZWFyID49IHN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlcmF0b3IudHJhbnNpdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IHRoaXMuZmluZE5leHQoaXRlcmF0b3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbnNXaXRoUnVsZXMgPSBbXTtcclxuICAgICAgICAgICAgLy8gRG8gc29tZXRoaW5nIHNtYXJ0OiBmaXJzdCBnZXQgYWxsIHRyYW5zaXRpb25zIHdpdGggYXRVdGMgTk9UIGNvbXBlbnNhdGVkIGZvciBzdGFuZGFyZCBvZmZzZXRcclxuICAgICAgICAgICAgLy8gVGFrZSBhbiBleHRyYSB5ZWFyIGJlZm9yZSBzdGFydFxyXG4gICAgICAgICAgICBmb3IgKHZhciB5ZWFyID0gc3RhcnQgLSAxOyB5ZWFyIDwgZW5kOyArK3llYXIpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSB0aGlzLl9maW5hbFJ1bGVzOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBydWxlSW5mbyA9IF9hW19pXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZUluZm8uYXBwbGljYWJsZSh5ZWFyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0VXRjOiBydWxlSW5mby5lZmZlY3RpdmVEYXRlVXRjKHllYXIsIHRoaXMuX2ZpbmFsWm9uZUluZm8uZ210b2ZmLCAoMCwgZHVyYXRpb25fMS5ob3VycykoMCkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYmJyZXZpYXRpb246IHpvbmVBYmJyZXZpYXRpb24odGhpcy5fZmluYWxab25lSW5mby5mb3JtYXQsIHJ1bGVJbmZvLnNhdmUubm9uWmVybygpLCBydWxlSW5mby5sZXR0ZXIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldHRlcjogcnVsZUluZm8ubGV0dGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogcnVsZUluZm8uc2F2ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogdGhpcy5fZmluYWxab25lSW5mby5nbXRvZmZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbnNXaXRoUnVsZXMucHVzaCh7IHRyYW5zaXRpb246IHRyYW5zaXRpb24sIHJ1bGVJbmZvOiBydWxlSW5mbyB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJhbnNpdGlvbnNXaXRoUnVsZXMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS50cmFuc2l0aW9uLmF0VXRjLnVuaXhNaWxsaXMgLSBiLnRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpczsgfSk7XHJcbiAgICAgICAgICAgIC8vIG5vdyBhcHBseSBEU1Qgb2Zmc2V0IHJldHJvYWN0aXZlbHlcclxuICAgICAgICAgICAgdmFyIHByZXZEc3QgPSAoMCwgZHVyYXRpb25fMS5ob3VycykoMCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIF9iID0gMCwgdHJhbnNpdGlvbnNXaXRoUnVsZXNfMSA9IHRyYW5zaXRpb25zV2l0aFJ1bGVzOyBfYiA8IHRyYW5zaXRpb25zV2l0aFJ1bGVzXzEubGVuZ3RoOyBfYisrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHIgPSB0cmFuc2l0aW9uc1dpdGhSdWxlc18xW19iXTtcclxuICAgICAgICAgICAgICAgIGlmICh0ci5ydWxlSW5mby5hdFR5cGUgPT09IEF0VHlwZS5XYWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHIudHJhbnNpdGlvbi5hdFV0YyA9IG5ldyBiYXNpY3NfMS5UaW1lU3RydWN0KHRyLnRyYW5zaXRpb24uYXRVdGMudW5peE1pbGxpcyAtIHByZXZEc3QubWlsbGlzZWNvbmRzKCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJldkRzdCA9IHRyLnRyYW5zaXRpb24ubmV3U3RhdGUuZHN0T2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyLnRyYW5zaXRpb24uYXRVdGMueWVhciA+PSBzdGFydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRyLnRyYW5zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgdGhlIGluaXRpYWwgc3RhdGUgZm9yIHRoZSB6b25lXHJcbiAgICAgKiBAcGFyYW0gem9uZU5hbWVcclxuICAgICAqIEBwYXJhbSBpbmZvc1xyXG4gICAgICogQHBhcmFtIHJ1bGVzXHJcbiAgICAgKiBAdGhyb3dzIHRpbWV6b25lY29tcGxldGUuSW52YWxpZFRpbWVab25lRGF0YVxyXG4gICAgICovXHJcbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLl9jYWxjSW5pdGlhbFN0YXRlID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBpbmZvcywgcnVsZXMpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy8gaW5pdGlhbCBzdGF0ZVxyXG4gICAgICAgIGlmIChpbmZvcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogXCJcIixcclxuICAgICAgICAgICAgICAgIGxldHRlcjogXCJcIixcclxuICAgICAgICAgICAgICAgIGRzdE9mZnNldDogKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApLFxyXG4gICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaW5mbyA9IGluZm9zWzBdO1xyXG4gICAgICAgIHN3aXRjaCAoaW5mby5ydWxlVHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbihpbmZvLmZvcm1hdCwgZmFsc2UsIHVuZGVmaW5lZCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YW5kYXJkT2Zmc2V0OiBpbmZvLmdtdG9mZlxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbihpbmZvLmZvcm1hdCwgaW5mby5ydWxlT2Zmc2V0Lm5vblplcm8oKSwgdW5kZWZpbmVkKSxcclxuICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiBpbmZvLnJ1bGVPZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGluZm8uZ210b2ZmXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzLmdldChpbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmICghcnVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICgwLCBlcnJvcl8xLnRocm93RXJyb3IpKFwiSW52YWxpZFRpbWVab25lRGF0YVwiLCBcInpvbmUgJyVzJyByZWZlcnMgdG8gbm9uLWV4aXN0aW5nIHJ1bGUgJyVzJ1wiLCB6b25lTmFtZSwgaW5mby5ydWxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBmaW5kIGZpcnN0IHJ1bGUgdHJhbnNpdGlvbiB3aXRob3V0IERTVCBzbyB0aGF0IHdlIGhhdmUgYSBsZXR0ZXJcclxuICAgICAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHJ1bGUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQubm9uWmVybygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBsZXR0ZXIgPSAoX2EgPSBpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5sZXR0ZXIpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IFwiXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbihpbmZvLmZvcm1hdCwgZmFsc2UsIGxldHRlciksXHJcbiAgICAgICAgICAgICAgICAgICAgZHN0T2Zmc2V0OiAoMCwgZHVyYXRpb25fMS5ob3VycykoMCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiBsZXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IGluZm8uZ210b2ZmXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZmFsc2UsIFwidGltZXpvbmVjb21wbGV0ZS5Bc3NlcnRpb25cIiwgXCJVbmtub3duIFJ1bGVUeXBlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICAvKipcclxuICAgICAqIFByZS1jYWxjdWxhdGUgYWxsIHRyYW5zaXRpb25zIHVudGlsIHRoZXJlIGFyZSBvbmx5ICdtYXgnIHJ1bGVzIGluIGVmZmVjdFxyXG4gICAgICogQHBhcmFtIHpvbmVOYW1lXHJcbiAgICAgKiBAcGFyYW0gaW5pdGlhbFN0YXRlXHJcbiAgICAgKiBAcGFyYW0gem9uZUluZm9zXHJcbiAgICAgKiBAcGFyYW0gcnVsZXNcclxuICAgICAqL1xyXG4gICAgQ2FjaGVkWm9uZVRyYW5zaXRpb25zLnByb3RvdHlwZS5fY2FsY1RyYW5zaXRpb25zID0gZnVuY3Rpb24gKHpvbmVOYW1lLCBpbml0aWFsU3RhdGUsIHpvbmVJbmZvcywgcnVsZXMpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgaWYgKHpvbmVJbmZvcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtbXSwgW11dO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB3YWxrIHRocm91Z2ggdGhlIHpvbmUgcmVjb3JkcyBhbmQgYWRkIGEgdHJhbnNpdGlvbiBmb3IgZWFjaFxyXG4gICAgICAgIHZhciB0cmFuc2l0aW9ucyA9IFtdO1xyXG4gICAgICAgIHZhciBwcmV2U3RhdGUgPSBpbml0aWFsU3RhdGU7XHJcbiAgICAgICAgdmFyIHByZXZVbnRpbDtcclxuICAgICAgICB2YXIgcHJldlJ1bGVzO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgem9uZUluZm9zXzYgPSB6b25lSW5mb3M7IF9pIDwgem9uZUluZm9zXzYubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc182W19pXTtcclxuICAgICAgICAgICAgLy8gem9uZXMgY2FuIGhhdmUgYSBEU1Qgb2Zmc2V0IG9yIHRoZXkgY2FuIHJlZmVyIHRvIGEgcnVsZSBzZXRcclxuICAgICAgICAgICAgc3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5Ob25lOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJldlVudGlsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9ucy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdFV0YzogcHJldlVudGlsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCB1bmRlZmluZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXR0ZXI6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRzdE9mZnNldDogem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk5vbmUgPyAoMCwgZHVyYXRpb25fMS5ob3VycykoMCkgOiB6b25lSW5mby5ydWxlT2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFuZGFyZE9mZnNldDogem9uZUluZm8uZ210b2ZmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2UnVsZXMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bGUgPSBydWxlcy5nZXQoem9uZUluZm8ucnVsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJ1bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgZXJyb3JfMS50aHJvd0Vycm9yKShcIkludmFsaWRUaW1lWm9uZURhdGFcIiwgXCJab25lICclcycgcmVmZXJzIHRvIG5vbi1leGlzdGluZyBydWxlICclcydcIiwgem9uZU5hbWUsIHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IHRoaXMuX3pvbmVUcmFuc2l0aW9ucyhwcmV2VW50aWwsIHpvbmVJbmZvLCBydWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbnMgPSB0cmFuc2l0aW9ucy5jb25jYXQodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZSdWxlcyA9IHJ1bGU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoZmFsc2UsIFwidGltZXpvbmVjb21wbGV0ZS5Bc3NlcnRpb25cIiwgXCJVbmtub3duIFJ1bGVUeXBlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByZXZVbnRpbCA9IHpvbmVJbmZvLnVudGlsICE9PSB1bmRlZmluZWQgPyBuZXcgYmFzaWNzXzEuVGltZVN0cnVjdCh6b25lSW5mby51bnRpbCkgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIHByZXZTdGF0ZSA9IHRyYW5zaXRpb25zLmxlbmd0aCA+IDAgPyB0cmFuc2l0aW9uc1t0cmFuc2l0aW9ucy5sZW5ndGggLSAxXS5uZXdTdGF0ZSA6IHByZXZTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFt0cmFuc2l0aW9ucywgKF9hID0gcHJldlJ1bGVzID09PSBudWxsIHx8IHByZXZSdWxlcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJldlJ1bGVzLmZpbmFsKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXV07XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFsbCB0aGUgdHJhbnNpdGlvbnMgZm9yIGEgdGltZSB6b25lIGZyb20gZnJvbVV0YyAoaW5jbHVzaXZlKSB0byB6b25lSW5mby51bnRpbCAoZXhjbHVzaXZlKS5cclxuICAgICAqIFRoZSByZXN1bHQgYWx3YXlzIGNvbnRhaW5zIGFuIGluaXRpYWwgdHJhbnNpdGlvbiBhdCBmcm9tVXRjIHRoYXQgc2lnbmFscyB0aGUgc3dpdGNoIHRvIHRoaXMgcnVsZSBzZXRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZnJvbVV0YyBwcmV2aW91cyB6b25lIHN1Yi1yZWNvcmQgVU5USUwgdGltZTsgdW5kZWZpbmVkIGZvciBmaXJzdCB6b25lIHJlY29yZFxyXG4gICAgICogQHBhcmFtIHpvbmVJbmZvIHRoZSBjdXJyZW50IHpvbmUgc3ViLXJlY29yZFxyXG4gICAgICogQHBhcmFtIHJ1bGUgdGhlIGNvcnJlc3BvbmRpbmcgcnVsZSB0cmFuc2l0aW9uc1xyXG4gICAgICovXHJcbiAgICBDYWNoZWRab25lVHJhbnNpdGlvbnMucHJvdG90eXBlLl96b25lVHJhbnNpdGlvbnMgPSBmdW5jdGlvbiAoZnJvbVV0Yywgem9uZUluZm8sIHJ1bGUpIHtcclxuICAgICAgICAvLyBmcm9tIHR6LWhvdy10by5odG1sOlxyXG4gICAgICAgIC8vIE9uZSB3cmlua2xlLCBub3QgZnVsbHkgZXhwbGFpbmVkIGluIHppYy44LnR4dCwgaXMgd2hhdCBoYXBwZW5zIHdoZW4gc3dpdGNoaW5nIHRvIGEgbmFtZWQgcnVsZS4gVG8gd2hhdCB2YWx1ZXMgc2hvdWxkIHRoZSBTQVZFIGFuZFxyXG4gICAgICAgIC8vIExFVFRFUiBkYXRhIGJlIGluaXRpYWxpemVkP1xyXG4gICAgICAgIC8vIC0gSWYgYXQgbGVhc3Qgb25lIHRyYW5zaXRpb24gaGFzIGhhcHBlbmVkLCB1c2UgdGhlIFNBVkUgYW5kIExFVFRFUiBkYXRhIGZyb20gdGhlIG1vc3QgcmVjZW50LlxyXG4gICAgICAgIC8vIC0gSWYgc3dpdGNoaW5nIHRvIGEgbmFtZWQgcnVsZSBiZWZvcmUgYW55IHRyYW5zaXRpb24gaGFzIGhhcHBlbmVkLCBhc3N1bWUgc3RhbmRhcmQgdGltZSAoU0FWRSB6ZXJvKSwgYW5kIHVzZSB0aGUgTEVUVEVSIGRhdGEgZnJvbVxyXG4gICAgICAgIC8vIHRoZSBlYXJsaWVzdCB0cmFuc2l0aW9uIHdpdGggYSBTQVZFIG9mIHplcm8uXHJcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcclxuICAgICAgICAvLyBleHRyYSBpbml0aWFsIHRyYW5zaXRpb24gZm9yIHN3aXRjaCB0byB0aGlzIHJ1bGUgc2V0IChidXQgbm90IGZvciBmaXJzdCB6b25lIGluZm8pXHJcbiAgICAgICAgdmFyIGluaXRpYWw7XHJcbiAgICAgICAgaWYgKGZyb21VdGMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YXIgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID0gcnVsZS5maW5kTGFzdExlc3NFcXVhbChmcm9tVXRjLCB6b25lSW5mby5nbXRvZmYpO1xyXG4gICAgICAgICAgICBpZiAoaW5pdGlhbFJ1bGVUcmFuc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpbml0aWFsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0VXRjOiBmcm9tVXRjLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiAoX2EgPSBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbml0aWFsUnVsZVRyYW5zaXRpb24gPSBydWxlLmZpcnN0VHJhbnNpdGlvbldpdGhvdXREc3RBZnRlcihmcm9tVXRjLCB6b25lSW5mby5nbXRvZmYsIHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgICAgICBpbml0aWFsID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0VXRjOiBmcm9tVXRjLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIGZhbHNlLCBpbml0aWFsUnVsZVRyYW5zaXRpb24gPT09IG51bGwgfHwgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiAoX2IgPSBpbml0aWFsUnVsZVRyYW5zaXRpb24gPT09IG51bGwgfHwgaW5pdGlhbFJ1bGVUcmFuc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsUnVsZVRyYW5zaXRpb24ubmV3U3RhdGUubGV0dGVyKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6ICgwLCBkdXJhdGlvbl8xLmhvdXJzKSgwKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaW5pdGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGFjdHVhbCBydWxlIHRyYW5zaXRpb25zOyBrZWVwIGFkZGluZyB1bnRpbCB0aGUgZW5kIG9mIHRoaXMgem9uZSBpbmZvLCBvciB1bnRpbCBvbmx5ICdtYXgnIHJ1bGVzIHJlbWFpblxyXG4gICAgICAgIHZhciBwcmV2RHN0ID0gKF9jID0gaW5pdGlhbCA9PT0gbnVsbCB8fCBpbml0aWFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0aWFsLm5ld1N0YXRlLmRzdE9mZnNldCkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogKDAsIGR1cmF0aW9uXzEuaG91cnMpKDApO1xyXG4gICAgICAgIHZhciBpdGVyYXRvciA9IHJ1bGUuZmluZEZpcnN0KCk7XHJcbiAgICAgICAgdmFyIGVmZmVjdGl2ZSA9IChpdGVyYXRvciA9PT0gbnVsbCB8fCBpdGVyYXRvciA9PT0gdm9pZCAwID8gdm9pZCAwIDogaXRlcmF0b3IudHJhbnNpdGlvbikgJiYgcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgem9uZUluZm8uZ210b2ZmLCBwcmV2RHN0KTtcclxuICAgICAgICB3aGlsZSAoaXRlcmF0b3IgJiYgZWZmZWN0aXZlICYmXHJcbiAgICAgICAgICAgICgoem9uZUluZm8udW50aWwgJiYgZWZmZWN0aXZlLnVuaXhNaWxsaXMgPCB6b25lSW5mby51bnRpbCkgfHwgKCF6b25lSW5mby51bnRpbCAmJiAhaXRlcmF0b3IuZmluYWwpKSkge1xyXG4gICAgICAgICAgICBwcmV2RHN0ID0gaXRlcmF0b3IudHJhbnNpdGlvbi5uZXdTdGF0ZS5kc3RPZmZzZXQ7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGF0VXRjOiBlZmZlY3RpdmUsXHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGFiYnJldmlhdGlvbjogem9uZUFiYnJldmlhdGlvbih6b25lSW5mby5mb3JtYXQsIHByZXZEc3Qubm9uWmVybygpLCBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlciksXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0dGVyOiAoX2QgPSBpdGVyYXRvci50cmFuc2l0aW9uLm5ld1N0YXRlLmxldHRlcikgIT09IG51bGwgJiYgX2QgIT09IHZvaWQgMCA/IF9kIDogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBkc3RPZmZzZXQ6IHByZXZEc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhbmRhcmRPZmZzZXQ6IHpvbmVJbmZvLmdtdG9mZlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaXRlcmF0b3IgPSBydWxlLmZpbmROZXh0KGl0ZXJhdG9yKTtcclxuICAgICAgICAgICAgZWZmZWN0aXZlID0gaXRlcmF0b3IgJiYgcnVsZVRyYW5zaXRpb25VdGMoaXRlcmF0b3IudHJhbnNpdGlvbiwgem9uZUluZm8uZ210b2ZmLCBwcmV2RHN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ2FjaGVkWm9uZVRyYW5zaXRpb25zO1xyXG59KCkpO1xyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSBmb3JtYXR0ZWQgYWJicmV2aWF0aW9uIGZvciBhIHpvbmVcclxuICogQHBhcmFtIGZvcm1hdCB0aGUgYWJicmV2aWF0aW9uIGZvcm1hdCBzdHJpbmcuIEVpdGhlciAnenp6LCcgZm9yIE5VTEw7ICAnQS9CJyBmb3Igc3RkL2RzdCwgb3IgJ0Elc0InIGZvciBhIGZvcm1hdCBzdHJpbmcgd2hlcmUgJXMgaXNcclxuICogcmVwbGFjZWQgYnkgYSBsZXR0ZXJcclxuICogQHBhcmFtIGRzdCB3aGV0aGVyIERTVCBpcyBvYnNlcnZlZFxyXG4gKiBAcGFyYW0gbGV0dGVyIGN1cnJlbnQgcnVsZSBsZXR0ZXIsIGVtcHR5IGlmIG5vIHJ1bGVcclxuICogQHJldHVybnMgZnVsbHkgZm9ybWF0dGVkIGFiYnJldmlhdGlvblxyXG4gKi9cclxuZnVuY3Rpb24gem9uZUFiYnJldmlhdGlvbihmb3JtYXQsIGRzdCwgbGV0dGVyKSB7XHJcbiAgICBpZiAoZm9ybWF0ID09PSBcInp6eixcIikge1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG4gICAgaWYgKGZvcm1hdC5pbmNsdWRlcyhcIi9cIikpIHtcclxuICAgICAgICByZXR1cm4gKGRzdCA/IGZvcm1hdC5zcGxpdChcIi9cIilbMV0gOiBmb3JtYXQuc3BsaXQoXCIvXCIpWzBdKTtcclxuICAgIH1cclxuICAgIGlmIChsZXR0ZXIpIHtcclxuICAgICAgICByZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZvcm1hdC5yZXBsYWNlKFwiJXNcIiwgXCJcIik7XHJcbn1cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSB0aGUgVVRDIHRpbWUgb2YgYSBydWxlIHRyYW5zaXRpb24sIGdpdmVuIGEgcGFydGljdWxhciB0aW1lIHpvbmVcclxuICogQHBhcmFtIHRyYW5zaXRpb25cclxuICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0IHpvbmUgb2Zmc2V0IGZyb20gVVRcclxuICogQHBhcmFtIGRzdE9mZnNldCBwcmV2aW91cyBEU1Qgb2Zmc2V0IGZyb20gVVQrc3RhbmRhcmRPZmZzZXRcclxuICogQHJldHVybnMgVVRDIHRpbWVcclxuICovXHJcbmZ1bmN0aW9uIHJ1bGVUcmFuc2l0aW9uVXRjKHRyYW5zaXRpb24sIHN0YW5kYXJkT2Zmc2V0LCBkc3RPZmZzZXQpIHtcclxuICAgIHN3aXRjaCAodHJhbnNpdGlvbi5hdFR5cGUpIHtcclxuICAgICAgICBjYXNlIEF0VHlwZS5VdGM6IHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG4gICAgICAgIGNhc2UgQXRUeXBlLlN0YW5kYXJkOiB7XHJcbiAgICAgICAgICAgIC8vIHRyYW5zaXRpb24gdGltZSBpcyBpbiB6b25lIGxvY2FsIHRpbWUgd2l0aG91dCBEU1RcclxuICAgICAgICAgICAgdmFyIG1pbGxpcyA9IHRyYW5zaXRpb24uYXQudW5peE1pbGxpcztcclxuICAgICAgICAgICAgbWlsbGlzIC09IHN0YW5kYXJkT2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSBBdFR5cGUuV2FsbDoge1xyXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIHRpbWUgaXMgaW4gem9uZSBsb2NhbCB0aW1lIHdpdGggRFNUXHJcbiAgICAgICAgICAgIHZhciBtaWxsaXMgPSB0cmFuc2l0aW9uLmF0LnVuaXhNaWxsaXM7XHJcbiAgICAgICAgICAgIG1pbGxpcyAtPSBzdGFuZGFyZE9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgaWYgKGRzdE9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgbWlsbGlzIC09IGRzdE9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IGJhc2ljc18xLlRpbWVTdHJ1Y3QobWlsbGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHotZGF0YWJhc2UuanMubWFwIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cbiIsIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxyXG4gKlxyXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxyXG4gKi9cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KSk7XHJcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuWm9uZUluZm8gPSBleHBvcnRzLlR6RGF0YWJhc2UgPSBleHBvcnRzLlRyYW5zaXRpb24gPSBleHBvcnRzLlRvVHlwZSA9IGV4cG9ydHMuT25UeXBlID0gZXhwb3J0cy5SdWxlVHlwZSA9IGV4cG9ydHMuUnVsZUluZm8gPSBleHBvcnRzLk5vcm1hbGl6ZU9wdGlvbiA9IGV4cG9ydHMuaXNWYWxpZE9mZnNldFN0cmluZyA9IGV4cG9ydHMuQXRUeXBlID0gdm9pZCAwO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vYmFzaWNzXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2RhdGV0aW1lXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2Zvcm1hdFwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9nbG9iYWxzXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vbG9jYWxlXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3BhcnNlXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3BlcmlvZFwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9iYXNpY3NcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi90aW1lem9uZVwiKSwgZXhwb3J0cyk7XHJcbnZhciB0el9kYXRhYmFzZV8xID0gcmVxdWlyZShcIi4vdHotZGF0YWJhc2VcIik7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkF0VHlwZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHpfZGF0YWJhc2VfMS5BdFR5cGU7IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImlzVmFsaWRPZmZzZXRTdHJpbmdcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuaXNWYWxpZE9mZnNldFN0cmluZzsgfSB9KTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiTm9ybWFsaXplT3B0aW9uXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLk5vcm1hbGl6ZU9wdGlvbjsgfSB9KTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiUnVsZUluZm9cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuUnVsZUluZm87IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlJ1bGVUeXBlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLlJ1bGVUeXBlOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJPblR5cGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuT25UeXBlOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJUb1R5cGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVG9UeXBlOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJUcmFuc2l0aW9uXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0el9kYXRhYmFzZV8xLlRyYW5zaXRpb247IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlR6RGF0YWJhc2VcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuVHpEYXRhYmFzZTsgfSB9KTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiWm9uZUluZm9cIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR6X2RhdGFiYXNlXzEuWm9uZUluZm87IH0gfSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdfQ==
