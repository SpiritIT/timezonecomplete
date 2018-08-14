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
        /**
         * Allow not using instanceof
         */
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

},{"./assert":1,"./basics":2,"./strings":12}],5:[function(require,module,exports){
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
    var _a;
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
    throw new Error("missing day period i.e. " + Object.keys(offsets).join(", "));
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL2Fzc2VydC50cyIsInNyYy9saWIvYmFzaWNzLnRzIiwic3JjL2xpYi9kYXRldGltZS50cyIsInNyYy9saWIvZHVyYXRpb24udHMiLCJzcmMvbGliL2Zvcm1hdC50cyIsInNyYy9saWIvZ2xvYmFscy50cyIsInNyYy9saWIvamF2YXNjcmlwdC50cyIsInNyYy9saWIvbG9jYWxlLnRzIiwic3JjL2xpYi9tYXRoLnRzIiwic3JjL2xpYi9wYXJzZS50cyIsInNyYy9saWIvcGVyaW9kLnRzIiwic3JjL2xpYi9zdHJpbmdzLnRzIiwic3JjL2xpYi90aW1lc291cmNlLnRzIiwic3JjL2xpYi90aW1lem9uZS50cyIsInNyYy9saWIvdG9rZW4udHMiLCJkaXN0L2xpYi9zcmMvbGliL3R6LWRhdGFiYXNlLnRzIiwic3JjL2xpYi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztHQUVHO0FBRUgsWUFBWSxDQUFDOztBQUViLFNBQVMsTUFBTSxDQUFDLFNBQWMsRUFBRSxPQUFlO0lBQzlDLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDZixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3pCO0FBQ0YsQ0FBQztBQUVELGtCQUFlLE1BQU0sQ0FBQzs7O0FDWnRCOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7O0FBRWIsbUNBQThCO0FBQzlCLDJDQUE2QztBQUM3Qyw2QkFBK0I7QUFDL0IsbUNBQXFDO0FBc0VyQzs7O0dBR0c7QUFDSCxJQUFZLE9BUVg7QUFSRCxXQUFZLE9BQU87SUFDbEIseUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTiwyQ0FBTyxDQUFBO0lBQ1AsK0NBQVMsQ0FBQTtJQUNULDZDQUFRLENBQUE7SUFDUix5Q0FBTSxDQUFBO0lBQ04sNkNBQVEsQ0FBQTtBQUNULENBQUMsRUFSVyxPQUFPLEdBQVAsZUFBTyxLQUFQLGVB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RUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3hDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDeEMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN4QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRTtJQUMxQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzVDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDNUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUM1QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzlDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDOUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUM5QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDekMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDekMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQzNDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7SUFDM0MsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUU7SUFDN0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUU7SUFDN0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0lBQ3pDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtJQUM1QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7SUFDNUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtJQUN6QyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUs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LENBQUMsRUFBRSxDQUFDLEdBQUcsNkNBQTZDLENBQUMsQ0FBQztpQkFDM0c7Z0JBQ0QsSUFBTSxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0Msd0JBQXdCO2dCQUN4QixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLHNDQUFzQyxDQUFDLENBQUM7aUJBQ3BHO2dCQUNELElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtvQkFDZixJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFO3dCQUNoRSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztxQkFDekI7b0JBQ0QsSUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRTt3QkFDaEUsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7cUJBQ3pCO2lCQUNEO2FBQ0Q7U0FDRDtLQUNEO0lBRUQsT0FBTyxNQUFvQixDQUFDO0FBQzdCLENBQUM7Ozs7O0FDM2xERDs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOzs7OztBQUViLDhCQUF5QjtBQUN6QixnQ0FBMkI7QUFDM0IsZ0NBQTJCO0FBQzNCLDhCQUF5QjtBQUN6QiwrQkFBMEI7QUFDMUIsa0NBQTZCO0FBQzdCLDhCQUF5QjtBQUN6Qiw2QkFBd0I7QUFDeEIsOEJBQXlCO0FBQ3pCLDhCQUF5QjtBQUN6QixrQ0FBNkI7QUFDN0IsZ0NBQTJCO0FBQzNCLG1DQUE4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTYgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbjogYW55LCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcblx0aWYgKCFjb25kaXRpb24pIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXNzZXJ0O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xuaW1wb3J0ICogYXMgc3RyaW5ncyBmcm9tIFwiLi9zdHJpbmdzXCI7XG5cbi8qKlxuICogVXNlZCBmb3IgbWV0aG9kcyB0aGF0IHRha2UgYSB0aW1lc3RhbXAgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRPcHRzIHtcblx0LyoqXG5cdCAqIFllYXIsIGRlZmF1bHQgMTk3MFxuXHQgKi9cblx0eWVhcj86IG51bWJlcjtcblx0LyoqXG5cdCAqIE1vbnRoIDEtMTIsIGRlZmF1bHQgMVxuXHQgKi9cblx0bW9udGg/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEYXkgb2YgbW9udGggMS0zMSwgZGVmYXVsdCAxXG5cdCAqL1xuXHRkYXk/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBIb3VyIG9mIGRheSAwLTIzLCBkZWZhdWx0IDBcblx0ICovXG5cdGhvdXI/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNaW51dGUgMC01OSwgZGVmYXVsdCAwXG5cdCAqL1xuXHRtaW51dGU/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBTZWNvbmQgMC01OSwgZGVmYXVsdCAwXG5cdCAqL1xuXHRzZWNvbmQ/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZCAwLTk5OSwgZGVmYXVsdCAwXG5cdCAqL1xuXHRtaWxsaT86IG51bWJlcjtcbn1cblxuLyoqXG4gKiBUaW1lc3RhbXAgcmVwcmVzZW50ZWQgYXMgc2VwYXJhdGUgeWVhci9tb250aC8uLi4gY29tcG9uZW50c1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVDb21wb25lbnRzIHtcblx0LyoqXG5cdCAqIFllYXJcblx0ICovXG5cdHllYXI6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1vbnRoIDEtMTJcblx0ICovXG5cdG1vbnRoOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEYXkgb2YgbW9udGggMS0zMVxuXHQgKi9cblx0ZGF5OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBIb3VyIDAtMjNcblx0ICovXG5cdGhvdXI6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1pbnV0ZVxuXHQgKi9cblx0bWludXRlOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBTZWNvbmRcblx0ICovXG5cdHNlY29uZDogbnVtYmVyO1xuXHQvKipcblx0ICogTWlsbGlzZWNvbmQgMC05OTlcblx0ICovXG5cdG1pbGxpOiBudW1iZXI7XG59XG5cbi8qKlxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcbiAqIFN1bmRheSA9IDAsIE1vbmRheSA9IDEgZXRjXG4gKi9cbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xuXHRTdW5kYXksXG5cdE1vbmRheSxcblx0VHVlc2RheSxcblx0V2VkbmVzZGF5LFxuXHRUaHVyc2RheSxcblx0RnJpZGF5LFxuXHRTYXR1cmRheVxufVxuXG4vKipcbiAqIFRpbWUgdW5pdHNcbiAqL1xuZXhwb3J0IGVudW0gVGltZVVuaXQge1xuXHRNaWxsaXNlY29uZCxcblx0U2Vjb25kLFxuXHRNaW51dGUsXG5cdEhvdXIsXG5cdERheSxcblx0V2Vlayxcblx0TW9udGgsXG5cdFllYXIsXG5cdC8qKlxuXHQgKiBFbmQtb2YtZW51bSBtYXJrZXIsIGRvIG5vdCB1c2Vcblx0ICovXG5cdE1BWFxufVxuXG4vKipcbiAqIEFwcHJveGltYXRlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGEgdGltZSB1bml0LlxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xuICogYW5kIGEgeWVhciBpcyBzZXQgdG8gMzYwIGRheXMgKGJlY2F1c2UgMTIgbW9udGhzIG9mIDMwIGRheXMpLlxuICpcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxuICogQHJldHVybnNcdFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XG5cdHN3aXRjaCAodW5pdCkge1xuXHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xuXHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcblx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTogcmV0dXJuIDYwICogMTAwMDtcblx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcblx0XHRjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xuXHRcdGNhc2UgVGltZVVuaXQuV2VlazogcmV0dXJuIDcgKiA4NjQwMDAwMDtcblx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcblx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXRcIik7XG5cdFx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBUaW1lIHVuaXQgdG8gbG93ZXJjYXNlIHN0cmluZy4gSWYgYW1vdW50IGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgc3RyaW5nIGlzIHB1dCBpbiBwbHVyYWwgZm9ybVxuICogaWYgbmVjZXNzYXJ5LlxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcbiAqIEBwYXJhbSBhbW91bnQgSWYgdGhpcyBpcyB1bmVxdWFsIHRvIC0xIGFuZCAxLCB0aGVuIHRoZSByZXN1bHQgaXMgcGx1cmFsaXplZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb1N0cmluZyh1bml0OiBUaW1lVW5pdCwgYW1vdW50OiBudW1iZXIgPSAxKTogc3RyaW5nIHtcblx0Y29uc3QgcmVzdWx0ID0gVGltZVVuaXRbdW5pdF0udG9Mb3dlckNhc2UoKTtcblx0aWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gcmVzdWx0ICsgXCJzXCI7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvVGltZVVuaXQoczogc3RyaW5nKTogVGltZVVuaXQge1xuXHRjb25zdCB0cmltbWVkID0gcy50cmltKCkudG9Mb3dlckNhc2UoKTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xuXHRcdGNvbnN0IG90aGVyID0gdGltZVVuaXRUb1N0cmluZyhpLCAxKTtcblx0XHRpZiAob3RoZXIgPT09IHRyaW1tZWQgfHwgKG90aGVyICsgXCJzXCIpID09PSB0cmltbWVkKSB7XG5cdFx0XHRyZXR1cm4gaTtcblx0XHR9XG5cdH1cblx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXQgc3RyaW5nICdcIiArIHMgKyBcIidcIik7XG59XG5cbi8qKlxuICogQHJldHVybiBUcnVlIGlmZiB0aGUgZ2l2ZW4geWVhciBpcyBhIGxlYXAgeWVhci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XG5cdC8vIGZyb20gV2lraXBlZGlhOlxuXHQvLyBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNCB0aGVuIGNvbW1vbiB5ZWFyXG5cdC8vIGVsc2UgaWYgeWVhciBpcyBub3QgZGl2aXNpYmxlIGJ5IDEwMCB0aGVuIGxlYXAgeWVhclxuXHQvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxuXHQvLyBlbHNlIGxlYXAgeWVhclxuXHRpZiAoeWVhciAlIDQgIT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSBpZiAoeWVhciAlIDEwMCAhPT0gMCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGUgZGF5cyBpbiBhIGdpdmVuIHllYXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcblx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhclxuICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggMS0xMlxuICogQHJldHVybiBUaGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpOiBudW1iZXIge1xuXHRzd2l0Y2ggKG1vbnRoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgMzpcblx0XHRjYXNlIDU6XG5cdFx0Y2FzZSA3OlxuXHRcdGNhc2UgODpcblx0XHRjYXNlIDEwOlxuXHRcdGNhc2UgMTI6XG5cdFx0XHRyZXR1cm4gMzE7XG5cdFx0Y2FzZSAyOlxuXHRcdFx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCk7XG5cdFx0Y2FzZSA0OlxuXHRcdGNhc2UgNjpcblx0XHRjYXNlIDk6XG5cdFx0Y2FzZSAxMTpcblx0XHRcdHJldHVybiAzMDtcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XG5cdH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXkgb2YgdGhlIHllYXIgb2YgdGhlIGdpdmVuIGRhdGUgWzAuLjM2NV0uIEphbnVhcnkgZmlyc3QgaXMgMC5cbiAqXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZS5nLiAxOTg2XG4gKiBAcGFyYW0gbW9udGggTW9udGggMS0xMlxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xuXHRhc3NlcnQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XG5cdGFzc2VydChkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XG5cdGxldCB5ZWFyRGF5OiBudW1iZXIgPSAwO1xuXHRmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDwgbW9udGg7IGkrKykge1xuXHRcdHllYXJEYXkgKz0gZGF5c0luTW9udGgoeWVhciwgaSk7XG5cdH1cblx0eWVhckRheSArPSAoZGF5IC0gMSk7XG5cdHJldHVybiB5ZWFyRGF5O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXG4gKlxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcbiAqXG4gKiBAcmV0dXJuIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XG5cdGNvbnN0IGVuZE9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXk6IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB9KTtcblx0Y29uc3QgZW5kT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhlbmRPZk1vbnRoLnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xuXHRpZiAoZGlmZiA+IDApIHtcblx0XHRkaWZmIC09IDc7XG5cdH1cblx0cmV0dXJuIGVuZE9mTW9udGguY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxuICpcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxuICogQHBhcmFtIHdlZWtEYXlcdHRoZSBkZXNpcmVkIHdlZWsgZGF5XG4gKlxuICogQHJldHVybiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XG5cdGNvbnN0IGJlZ2luT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHsgeWVhciwgbW9udGgsIGRheTogMX0pO1xuXHRjb25zdCBiZWdpbk9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoLnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGJlZ2luT2ZNb250aFdlZWtEYXk7XG5cdGlmIChkaWZmIDwgMCkge1xuXHRcdGRpZmYgKz0gNztcblx0fVxuXHRyZXR1cm4gYmVnaW5PZk1vbnRoLmNvbXBvbmVudHMuZGF5ICsgZGlmZjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheS5cbiAqIFRocm93cyBpZiB0aGUgbW9udGggaGFzIG5vIHN1Y2ggZGF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcblx0Y29uc3Qgc3RhcnQ6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXkgfSk7XG5cdGNvbnN0IHN0YXJ0V2Vla0RheTogV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0LnVuaXhNaWxsaXMpO1xuXHRsZXQgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcblx0aWYgKGRpZmYgPCAwKSB7XG5cdFx0ZGlmZiArPSA3O1xuXHR9XG5cdGFzc2VydChzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmYgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xuXHRyZXR1cm4gc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcblx0Y29uc3Qgc3RhcnQ6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh7eWVhciwgbW9udGgsIGRheX0pO1xuXHRjb25zdCBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydC51bml4TWlsbGlzKTtcblx0bGV0IGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XG5cdGlmIChkaWZmID4gMCkge1xuXHRcdGRpZmYgLT0gNztcblx0fVxuXHRhc3NlcnQoc3RhcnQuY29tcG9uZW50cy5kYXkgKyBkaWZmID49IDEsIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XG5cdHJldHVybiBzdGFydC5jb21wb25lbnRzLmRheSArIGRpZmY7XG59XG5cbi8qKlxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXG4gKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxuICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcbiAqXG4gKiBAcGFyYW0geWVhciBUaGUgeWVhclxuICogQHBhcmFtIG1vbnRoIFRoZSBtb250aCBbMS0xMl1cbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cbiAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdlZWtPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xuXHRjb25zdCBmaXJzdFRodXJzZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XG5cdGNvbnN0IGZpcnN0TW9uZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcblx0aWYgKGRheSA8IGZpcnN0TW9uZGF5KSB7XG5cdFx0aWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xuXHRcdFx0Ly8gV2VlayAxXG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXG5cdFx0XHRpZiAobW9udGggPiAxKSB7XG5cdFx0XHRcdC8vIERlZmF1bHQgY2FzZVxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBKYW51YXJ5XG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBsYXN0TW9uZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5Lk1vbmRheSk7XG5cdGNvbnN0IGxhc3RUaHVyc2RheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XG5cdC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gbGFzdCB3ZWVrIG9yIHdlZWsgMSBvZiBwcmV2aW91cyBtb250aFxuXHRpZiAoZGF5ID49IGxhc3RNb25kYXkpIHtcblx0XHRpZiAobGFzdE1vbmRheSA+IGxhc3RUaHVyc2RheSkge1xuXHRcdFx0Ly8gV2VlayAxIG9mIG5leHQgbW9udGhcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblx0fVxuXG5cdC8vIE5vcm1hbCBjYXNlXG5cdGxldCByZXN1bHQgPSBNYXRoLmZsb29yKChkYXkgLSBmaXJzdE1vbmRheSkgLyA3KSArIDE7XG5cdGlmIChmaXJzdFRodXJzZGF5IDwgNCkge1xuXHRcdHJlc3VsdCArPSAxO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YteWVhciBvZiB0aGUgTW9uZGF5IG9mIHdlZWsgMSBpbiB0aGUgZ2l2ZW4geWVhci5cbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcbiAqIHdpbGwgYmUgKG11Y2gpIGdyZWF0ZXIgdGhhbiA0XG4gKi9cbmZ1bmN0aW9uIGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcblx0Ly8gZmlyc3QgbW9uZGF5IG9mIEphbnVhcnksIG1pbnVzIG9uZSBiZWNhdXNlIHdlIHdhbnQgZGF5LW9mLXllYXJcblx0bGV0IHJlc3VsdDogbnVtYmVyID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xuXHRpZiAocmVzdWx0ID4gMykgeyAvLyBncmVhdGVyIHRoYW4gamFuIDR0aFxuXHRcdHJlc3VsdCAtPSA3O1xuXHRcdGlmIChyZXN1bHQgPCAwKSB7XG5cdFx0XHRyZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIgZm9yIHRoZSBnaXZlbiBkYXRlLiBXZWVrIDEgaXMgdGhlIHdlZWtcbiAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG4gKlxuICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTg4XG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcbiAqIEBwYXJhbSBkYXlcdERheSBvZiBtb250aCAxLTMxXG4gKlxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3ZWVrTnVtYmVyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xuXHRjb25zdCBkb3kgPSBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSk7XG5cblx0Ly8gY2hlY2sgZW5kLW9mLXllYXIgY29ybmVyIGNhc2U6IG1heSBiZSB3ZWVrIDEgb2YgbmV4dCB5ZWFyXG5cdGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcblx0XHRjb25zdCBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcblx0XHRpZiAobmV4dFllYXJXZWVrT25lID4gNCAmJiBuZXh0WWVhcldlZWtPbmUgPD0gZG95KSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9XG5cdH1cblxuXHQvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxuXHRjb25zdCB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xuXHRpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xuXHRcdC8vIHdlZWsgMSBpcyBhdCBlbmQgb2YgbGFzdCB5ZWFyXG5cdFx0Y29uc3Qgd2Vla1R3byA9IHRoaXNZZWFyV2Vla09uZSArIDcgLSBkYXlzSW5ZZWFyKHllYXIgLSAxKTtcblx0XHRpZiAoZG95IDwgd2Vla1R3bykge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB3ZWVrVHdvKSAvIDcpICsgMjtcblx0XHR9XG5cdH1cblxuXHQvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cblx0aWYgKGRveSA8IHRoaXNZZWFyV2Vla09uZSkge1xuXHRcdC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXG5cdFx0cmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XG5cdH1cblxuXHQvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXG5cdHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB0aGlzWWVhcldlZWtPbmUpIC8gNykgKyAxO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXM6IG51bWJlcik6IHZvaWQge1xuXHRhc3NlcnQodHlwZW9mICh1bml4TWlsbGlzKSA9PT0gXCJudW1iZXJcIiwgXCJudW1iZXIgaW5wdXQgZXhwZWN0ZWRcIik7XG5cdGFzc2VydCghaXNOYU4odW5peE1pbGxpcyksIFwiTmFOIG5vdCBleHBlY3RlZCBhcyBpbnB1dFwiKTtcblx0YXNzZXJ0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHVuaXggbWlsbGkgdGltZXN0YW1wIGludG8gYSBUaW1lVCBzdHJ1Y3R1cmUuXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVDb21wb25lbnRzIHtcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcblxuXHRsZXQgdGVtcDogbnVtYmVyID0gdW5peE1pbGxpcztcblx0Y29uc3QgcmVzdWx0OiBUaW1lQ29tcG9uZW50cyA9IHsgeWVhcjogMCwgbW9udGg6IDAsIGRheTogMCwgaG91cjogMCwgbWludXRlOiAwLCBzZWNvbmQ6IDAsIG1pbGxpOiAwfTtcblx0bGV0IHllYXI6IG51bWJlcjtcblx0bGV0IG1vbnRoOiBudW1iZXI7XG5cblx0aWYgKHVuaXhNaWxsaXMgPj0gMCkge1xuXHRcdHJlc3VsdC5taWxsaSA9IHRlbXAgJSAxMDAwO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcblx0XHRyZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IHRlbXAgJSA2MDtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5ob3VyID0gdGVtcCAlIDI0O1xuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XG5cblx0XHR5ZWFyID0gMTk3MDtcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XG5cdFx0XHR0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XG5cdFx0XHR5ZWFyKys7XG5cdFx0fVxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcblxuXHRcdG1vbnRoID0gMTtcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcblx0XHRcdHRlbXAgLT0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuXHRcdFx0bW9udGgrKztcblx0XHR9XG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XG5cdFx0cmVzdWx0LmRheSA9IHRlbXAgKyAxO1xuXHR9IGVsc2Uge1xuXHRcdC8vIE5vdGUgdGhhdCBhIG5lZ2F0aXZlIG51bWJlciBtb2R1bG8gc29tZXRoaW5nIHlpZWxkcyBhIG5lZ2F0aXZlIG51bWJlci5cblx0XHQvLyBXZSBtYWtlIGl0IHBvc2l0aXZlIGJ5IGFkZGluZyB0aGUgbW9kdWxvLlxuXHRcdHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDEwMDApO1xuXHRcdHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5taW51dGUgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xuXHRcdHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDI0KTtcblxuXHRcdHllYXIgPSAxOTY5O1xuXHRcdHdoaWxlICh0ZW1wIDwgLWRheXNJblllYXIoeWVhcikpIHtcblx0XHRcdHRlbXAgKz0gZGF5c0luWWVhcih5ZWFyKTtcblx0XHRcdHllYXItLTtcblx0XHR9XG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xuXG5cdFx0bW9udGggPSAxMjtcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcblx0XHRcdHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuXHRcdFx0bW9udGgtLTtcblx0XHR9XG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XG5cdFx0cmVzdWx0LmRheSA9IHRlbXAgKyAxICsgZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBGaWxsIHlvdSBhbnkgbWlzc2luZyB0aW1lIGNvbXBvbmVudCBwYXJ0cywgZGVmYXVsdHMgYXJlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRpbWVDb21wb25lbnRzKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTogVGltZUNvbXBvbmVudHMge1xuXHRjb25zdCBpbnB1dCA9IHtcblx0XHR5ZWFyOiB0eXBlb2YgY29tcG9uZW50cy55ZWFyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy55ZWFyIDogMTk3MCxcblx0XHRtb250aDogdHlwZW9mIGNvbXBvbmVudHMubW9udGggPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1vbnRoIDogMSxcblx0XHRkYXk6IHR5cGVvZiBjb21wb25lbnRzLmRheSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuZGF5IDogMSxcblx0XHRob3VyOiB0eXBlb2YgY29tcG9uZW50cy5ob3VyID09PSBcIm51bWJlclwiID8gY29tcG9uZW50cy5ob3VyIDogMCxcblx0XHRtaW51dGU6IHR5cGVvZiBjb21wb25lbnRzLm1pbnV0ZSA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMubWludXRlIDogMCxcblx0XHRzZWNvbmQ6IHR5cGVvZiBjb21wb25lbnRzLnNlY29uZCA9PT0gXCJudW1iZXJcIiA/IGNvbXBvbmVudHMuc2Vjb25kIDogMCxcblx0XHRtaWxsaTogdHlwZW9mIGNvbXBvbmVudHMubWlsbGkgPT09IFwibnVtYmVyXCIgPyBjb21wb25lbnRzLm1pbGxpIDogMCxcblx0fTtcblx0cmV0dXJuIGlucHV0O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSB5ZWFyLCBtb250aCwgZGF5IGV0YyBpbnRvIGEgdW5peCBtaWxsaSB0aW1lc3RhbXAuXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cbiAqXG4gKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcbiAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxuICogQHBhcmFtIGRheVx0RGF5IDEtMzFcbiAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcbiAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XG4gKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxuICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxuICovXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXG5cdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyLCBtaWxsaTogbnVtYmVyXG4pOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoY29tcG9uZW50czogVGltZUNvbXBvbmVudE9wdHMpOiBudW1iZXI7XG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXG5cdGE6IFRpbWVDb21wb25lbnRPcHRzIHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcbik6IG51bWJlciB7XG5cdGNvbnN0IGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzID0gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8geyB5ZWFyOiBhLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGkgfSA6IGEpO1xuXHRjb25zdCBpbnB1dDogVGltZUNvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhjb21wb25lbnRzKTtcblx0cmV0dXJuIGlucHV0Lm1pbGxpICsgMTAwMCAqIChcblx0XHRpbnB1dC5zZWNvbmQgKyBpbnB1dC5taW51dGUgKiA2MCArIGlucHV0LmhvdXIgKiAzNjAwICsgZGF5T2ZZZWFyKGlucHV0LnllYXIsIGlucHV0Lm1vbnRoLCBpbnB1dC5kYXkpICogODY0MDAgK1xuXHRcdChpbnB1dC55ZWFyIC0gMTk3MCkgKiAzMTUzNjAwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTY5KSAvIDQpICogODY0MDAgLVxuXHRcdE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTAxKSAvIDEwMCkgKiA4NjQwMCArIE1hdGguZmxvb3IoKGlucHV0LnllYXIgLSAxOTAwICsgMjk5KSAvIDQwMCkgKiA4NjQwMCk7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkYXktb2Ytd2Vlay5cbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogV2Vla0RheSB7XG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XG5cblx0Y29uc3QgZXBvY2hEYXk6IFdlZWtEYXkgPSBXZWVrRGF5LlRodXJzZGF5O1xuXHRjb25zdCBkYXlzID0gTWF0aC5mbG9vcih1bml4TWlsbGlzIC8gMTAwMCAvIDg2NDAwKTtcblx0cmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcbn1cblxuLyoqXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyKTogbnVtYmVyIHtcblx0cmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xufVxuXG4vKipcbiAqIEJhc2ljIHJlcHJlc2VudGF0aW9uIG9mIGEgZGF0ZSBhbmQgdGltZVxuICovXG5leHBvcnQgY2xhc3MgVGltZVN0cnVjdCB7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gdGhlIGdpdmVuIHllYXIsIG1vbnRoLCBkYXkgZXRjXG5cdCAqXG5cdCAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxuXHQgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcblx0ICogQHBhcmFtIGRheVx0RGF5IDEtMzFcblx0ICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xuXHQgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxuXHQgKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21Db21wb25lbnRzKFxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IFRpbWVTdHJ1Y3Qge1xuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBudW1iZXIgb2YgdW5peCBtaWxsaXNlY29uZHNcblx0ICogKGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21Vbml4KHVuaXhNaWxsaXM6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcblx0ICpcblx0ICogQHBhcmFtIGRcdFRoZSBkYXRlXG5cdCAqIEBwYXJhbSBkZlx0V2hpY2ggZnVuY3Rpb25zIHRvIHRha2UgKGdldFgoKSBvciBnZXRVVENYKCkpXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21EYXRlKGQ6IERhdGUsIGRmOiBEYXRlRnVuY3Rpb25zKTogVGltZVN0cnVjdCB7XG5cdFx0aWYgKGRmID09PSBEYXRlRnVuY3Rpb25zLkdldCkge1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHtcblx0XHRcdFx0eWVhcjogZC5nZXRGdWxsWWVhcigpLCBtb250aDogZC5nZXRNb250aCgpICsgMSwgZGF5OiBkLmdldERhdGUoKSxcblx0XHRcdFx0aG91cjogZC5nZXRIb3VycygpLCBtaW51dGU6IGQuZ2V0TWludXRlcygpLCBzZWNvbmQ6IGQuZ2V0U2Vjb25kcygpLCBtaWxsaTogZC5nZXRNaWxsaXNlY29uZHMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7XG5cdFx0XHRcdHllYXI6IGQuZ2V0VVRDRnVsbFllYXIoKSwgbW9udGg6IGQuZ2V0VVRDTW9udGgoKSArIDEsIGRheTogZC5nZXRVVENEYXRlKCksXG5cdFx0XHRcdGhvdXI6IGQuZ2V0VVRDSG91cnMoKSwgbWludXRlOiBkLmdldFVUQ01pbnV0ZXMoKSwgc2Vjb25kOiBkLmdldFVUQ1NlY29uZHMoKSwgbWlsbGk6IGQuZ2V0VVRDTWlsbGlzZWNvbmRzKClcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHM6IHN0cmluZyk6IFRpbWVTdHJ1Y3Qge1xuXHRcdHRyeSB7XG5cdFx0XHRsZXQgeWVhcjogbnVtYmVyID0gMTk3MDtcblx0XHRcdGxldCBtb250aDogbnVtYmVyID0gMTtcblx0XHRcdGxldCBkYXk6IG51bWJlciA9IDE7XG5cdFx0XHRsZXQgaG91cjogbnVtYmVyID0gMDtcblx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgc2Vjb25kOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IGZyYWN0aW9uTWlsbGlzOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IGxhc3RVbml0OiBUaW1lVW5pdCA9IFRpbWVVbml0LlllYXI7XG5cblx0XHRcdC8vIHNlcGFyYXRlIGFueSBmcmFjdGlvbmFsIHBhcnRcblx0XHRcdGNvbnN0IHNwbGl0OiBzdHJpbmdbXSA9IHMudHJpbSgpLnNwbGl0KFwiLlwiKTtcblx0XHRcdGFzc2VydChzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XG5cblx0XHRcdC8vIHBhcnNlIG1haW4gcGFydFxuXHRcdFx0Y29uc3QgaXNCYXNpY0Zvcm1hdCA9IChzLmluZGV4T2YoXCItXCIpID09PSAtMSk7XG5cdFx0XHRpZiAoaXNCYXNpY0Zvcm1hdCkge1xuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksXG5cdFx0XHRcdFx0XCJJU08gc3RyaW5nIGluIGJhc2ljIG5vdGF0aW9uIG1heSBvbmx5IGNvbnRhaW4gbnVtYmVycyBiZWZvcmUgdGhlIGZyYWN0aW9uYWwgcGFydFwiKTtcblxuXHRcdFx0XHQvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxuXHRcdFx0XHRzcGxpdFswXSA9IHNwbGl0WzBdLnJlcGxhY2UoXCJUXCIsIFwiXCIpO1xuXG5cdFx0XHRcdGFzc2VydChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSxcblx0XHRcdFx0XHRcIlBhZGRpbmcgb3IgcmVxdWlyZWQgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gTm90ZSB0aGF0IFlZWVlNTSBpcyBub3QgdmFsaWQgcGVyIElTTyA4NjAxXCIpO1xuXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xuXHRcdFx0XHRcdHllYXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMCwgNCksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA4KSB7XG5cdFx0XHRcdFx0bW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xuXHRcdFx0XHRcdGhvdXIgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoOCwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMikge1xuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMCwgMiksIDEwKTtcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL15cXGRcXGRcXGRcXGQoLVxcZFxcZC1cXGRcXGQoKFQpP1xcZFxcZChcXDpcXGRcXGQoOlxcZFxcZCk/KT8pPyk/JC8pLCBcIkludmFsaWQgSVNPIHN0cmluZ1wiKTtcblx0XHRcdFx0bGV0IGRhdGVBbmRUaW1lOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRkYXRlQW5kVGltZSA9IHNwbGl0WzBdLnNwbGl0KFwiVFwiKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0sIFwiXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFzc2VydChbNCwgMTBdLmluZGV4T2YoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoKSAhPT0gLTEsXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcblxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDQpIHtcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gMTApIHtcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xuXHRcdFx0XHRcdGRheSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig4LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDIpIHtcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gNSkge1xuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xuXHRcdFx0XHRcdHNlY29uZCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cig2LCAyKSwgMTApO1xuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCA+IDEgJiYgc3BsaXRbMV0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zdCBmcmFjdGlvbjogbnVtYmVyID0gcGFyc2VGbG9hdChcIjAuXCIgKyBzcGxpdFsxXSk7XG5cdFx0XHRcdHN3aXRjaCAobGFzdFVuaXQpIHtcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDM2MDAwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6XG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XG5cdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcblx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XG5cdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XG5cdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcblx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcblx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcblx0XHRcdGxldCB1bml4TWlsbGlzOiBudW1iZXIgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kIH0pO1xuXHRcdFx0dW5peE1pbGxpcyA9IG1hdGgucm91bmRTeW0odW5peE1pbGxpcyArIGZyYWN0aW9uTWlsbGlzKTtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh1bml4TWlsbGlzKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIElTTyA4NjAxIHN0cmluZzogXFxcIlwiICsgcyArIFwiXFxcIjogXCIgKyBlLm1lc3NhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB2YWx1ZSBpbiB1bml4IG1pbGxpc2Vjb25kc1xuXHQgKi9cblx0cHJpdmF0ZSBfdW5peE1pbGxpczogbnVtYmVyO1xuXHRwdWJsaWMgZ2V0IHVuaXhNaWxsaXMoKTogbnVtYmVyIHtcblx0XHRpZiAodGhpcy5fdW5peE1pbGxpcyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl91bml4TWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy5fY29tcG9uZW50cyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl91bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHZhbHVlIGluIHNlcGFyYXRlIHllYXIvbW9udGgvLi4uIGNvbXBvbmVudHNcblx0ICovXG5cdHByaXZhdGUgX2NvbXBvbmVudHM6IFRpbWVDb21wb25lbnRzO1xuXHRwdWJsaWMgZ2V0IGNvbXBvbmVudHMoKTogVGltZUNvbXBvbmVudHMge1xuXHRcdGlmICghdGhpcy5fY29tcG9uZW50cykge1xuXHRcdFx0dGhpcy5fY29tcG9uZW50cyA9IHVuaXhUb1RpbWVOb0xlYXBTZWNzKHRoaXMuX3VuaXhNaWxsaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fY29tcG9uZW50cztcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gdW5peE1pbGxpcyBtaWxsaXNlY29uZHMgc2luY2UgMS0xLTE5NzBcblx0ICovXG5cdGNvbnN0cnVjdG9yKHVuaXhNaWxsaXM6IG51bWJlcik7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKlxuXHQgKiBAcGFyYW0gY29tcG9uZW50cyBTZXBhcmF0ZSB0aW1lc3RhbXAgY29tcG9uZW50cyAoeWVhciwgbW9udGgsIC4uLilcblx0ICovXG5cdGNvbnN0cnVjdG9yKGNvbXBvbmVudHM6IFRpbWVDb21wb25lbnRPcHRzKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihhOiBudW1iZXIgfCBUaW1lQ29tcG9uZW50T3B0cykge1xuXHRcdGlmICh0eXBlb2YgYSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0dGhpcy5fdW5peE1pbGxpcyA9IGE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2NvbXBvbmVudHMgPSBub3JtYWxpemVUaW1lQ29tcG9uZW50cyhhKTtcblx0XHR9XG5cdH1cblxuXHRnZXQgeWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMueWVhcjtcblx0fVxuXG5cdGdldCBtb250aCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGg7XG5cdH1cblxuXHRnZXQgZGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tcG9uZW50cy5kYXk7XG5cdH1cblxuXHRnZXQgaG91cigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMuaG91cjtcblx0fVxuXG5cdGdldCBtaW51dGUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLm1pbnV0ZTtcblx0fVxuXG5cdGdldCBzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21wb25lbnRzLnNlY29uZDtcblx0fVxuXG5cdGdldCBtaWxsaSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubWlsbGk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGRheS1vZi15ZWFyIDAtMzY1XG5cdCAqL1xuXHRwdWJsaWMgeWVhckRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiBkYXlPZlllYXIodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aCwgdGhpcy5jb21wb25lbnRzLmRheSk7XG5cdH1cblxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBUaW1lU3RydWN0KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmFsdWVPZigpID09PSBvdGhlci52YWx1ZU9mKCk7XG5cdH1cblxuXHRwdWJsaWMgdmFsdWVPZigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnVuaXhNaWxsaXM7XG5cdH1cblxuXHRwdWJsaWMgY2xvbmUoKTogVGltZVN0cnVjdCB7XG5cdFx0aWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLl9jb21wb25lbnRzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRoaXMuX3VuaXhNaWxsaXMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0ZSBhIHRpbWVzdGFtcC4gRmlsdGVycyBvdXQgbm9uLWV4aXN0aW5nIHZhbHVlcyBmb3IgYWxsIHRpbWUgY29tcG9uZW50c1xuXHQgKiBAcmV0dXJucyB0cnVlIGlmZiB0aGUgdGltZXN0YW1wIGlzIHZhbGlkXG5cdCAqL1xuXHRwdWJsaWMgdmFsaWRhdGUoKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuX2NvbXBvbmVudHMpIHtcblx0XHRcdHJldHVybiB0aGlzLmNvbXBvbmVudHMubW9udGggPj0gMSAmJiB0aGlzLmNvbXBvbmVudHMubW9udGggPD0gMTJcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLmRheSA+PSAxICYmIHRoaXMuY29tcG9uZW50cy5kYXkgPD0gZGF5c0luTW9udGgodGhpcy5jb21wb25lbnRzLnllYXIsIHRoaXMuY29tcG9uZW50cy5tb250aClcblx0XHRcdFx0JiYgdGhpcy5jb21wb25lbnRzLmhvdXIgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMuaG91ciA8PSAyM1xuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWludXRlID49IDAgJiYgdGhpcy5jb21wb25lbnRzLm1pbnV0ZSA8PSA1OVxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMuc2Vjb25kID49IDAgJiYgdGhpcy5jb21wb25lbnRzLnNlY29uZCA8PSA1OVxuXHRcdFx0XHQmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPj0gMCAmJiB0aGlzLmNvbXBvbmVudHMubWlsbGkgPD0gOTk5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSVNPIDg2MDEgc3RyaW5nIFlZWVktTU0tRERUaGg6bW06c3Mubm5uXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXG5cdFx0XHQrIFwiLVwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5tb250aC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiVFwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuY29tcG9uZW50cy5taW51dGUudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5jb21wb25lbnRzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxuXHRcdFx0KyBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmNvbXBvbmVudHMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XG5cdH1cbn1cblxuXG4vKipcbiAqIEJpbmFyeSBzZWFyY2hcbiAqIEBwYXJhbSBhcnJheSBBcnJheSB0byBzZWFyY2hcbiAqIEBwYXJhbSBjb21wYXJlIEZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiA8IDAgaWYgZ2l2ZW4gZWxlbWVudCBpcyBsZXNzIHRoYW4gc2VhcmNoZWQgZWxlbWVudCBldGNcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5SW5zZXJ0aW9uSW5kZXg8VD4oYXJyOiBUW10sIGNvbXBhcmU6IChhOiBUKSA9PiBudW1iZXIpOiBudW1iZXIge1xuXHRsZXQgbWluSW5kZXggPSAwO1xuXHRsZXQgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcblx0bGV0IGN1cnJlbnRJbmRleDogbnVtYmVyO1xuXHRsZXQgY3VycmVudEVsZW1lbnQ6IFQ7XG5cdC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcblx0aWYgKCFhcnIpIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHRpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cdC8vIG91dCBvZiBib3VuZHNcblx0aWYgKGNvbXBhcmUoYXJyWzBdKSA+IDApIHtcblx0XHRyZXR1cm4gMDtcblx0fVxuXHRpZiAoY29tcGFyZShhcnJbbWF4SW5kZXhdKSA8IDApIHtcblx0XHRyZXR1cm4gbWF4SW5kZXggKyAxO1xuXHR9XG5cdC8vIGVsZW1lbnQgaW4gcmFuZ2Vcblx0d2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XG5cdFx0Y3VycmVudEluZGV4ID0gTWF0aC5mbG9vcigobWluSW5kZXggKyBtYXhJbmRleCkgLyAyKTtcblx0XHRjdXJyZW50RWxlbWVudCA9IGFycltjdXJyZW50SW5kZXhdO1xuXG5cdFx0aWYgKGNvbXBhcmUoY3VycmVudEVsZW1lbnQpIDwgMCkge1xuXHRcdFx0bWluSW5kZXggPSBjdXJyZW50SW5kZXggKyAxO1xuXHRcdH0gZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XG5cdFx0XHRtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjdXJyZW50SW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG1heEluZGV4O1xufVxuXG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBUaW1lU3RydWN0LCBUaW1lVW5pdCwgV2Vla0RheSB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xuaW1wb3J0ICogYXMgZm9ybWF0IGZyb20gXCIuL2Zvcm1hdFwiO1xuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcbmltcG9ydCB7IFBhcnRpYWxMb2NhbGUgfSBmcm9tIFwiLi9sb2NhbGVcIjtcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xuaW1wb3J0ICogYXMgcGFyc2VGdW5jcyBmcm9tIFwiLi9wYXJzZVwiO1xuaW1wb3J0IHsgUmVhbFRpbWVTb3VyY2UsIFRpbWVTb3VyY2UgfSBmcm9tIFwiLi90aW1lc291cmNlXCI7XG5pbXBvcnQgeyBUaW1lWm9uZSwgVGltZVpvbmVLaW5kIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcbmltcG9ydCB7IE5vcm1hbGl6ZU9wdGlvbiB9IGZyb20gXCIuL3R6LWRhdGFiYXNlXCI7XG5cbi8qKlxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm93TG9jYWwoKTogRGF0ZVRpbWUge1xuXHRyZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcbn1cblxuLyoqXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbm93VXRjKCk6IERhdGVUaW1lIHtcblx0cmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xufVxuXG4vKipcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdyh0aW1lWm9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQgfCBudWxsID0gVGltZVpvbmUudXRjKCkpOiBEYXRlVGltZSB7XG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0VG9VdGMobG9jYWxUaW1lOiBUaW1lU3RydWN0LCBmcm9tWm9uZT86IFRpbWVab25lKTogVGltZVN0cnVjdCB7XG5cdGlmIChmcm9tWm9uZSkge1xuXHRcdGNvbnN0IG9mZnNldDogbnVtYmVyID0gZnJvbVpvbmUub2Zmc2V0Rm9yWm9uZShsb2NhbFRpbWUpO1xuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChsb2NhbFRpbWUudW5peE1pbGxpcyAtIG9mZnNldCAqIDYwMDAwKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbG9jYWxUaW1lLmNsb25lKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY29udmVydEZyb21VdGModXRjVGltZTogVGltZVN0cnVjdCwgdG9ab25lPzogVGltZVpvbmUpOiBUaW1lU3RydWN0IHtcblx0LyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cblx0aWYgKHRvWm9uZSkge1xuXHRcdGNvbnN0IG9mZnNldDogbnVtYmVyID0gdG9ab25lLm9mZnNldEZvclV0Yyh1dGNUaW1lKTtcblx0XHRyZXR1cm4gdG9ab25lLm5vcm1hbGl6ZVpvbmVUaW1lKG5ldyBUaW1lU3RydWN0KHV0Y1RpbWUudW5peE1pbGxpcyArIG9mZnNldCAqIDYwMDAwKSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHV0Y1RpbWUuY2xvbmUoKTtcblx0fVxufVxuXG4vKipcbiAqIERhdGVUaW1lIGNsYXNzIHdoaWNoIGlzIHRpbWUgem9uZS1hd2FyZVxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBEYXRlVGltZSB7XG5cblx0LyoqXG5cdCAqIEFsbG93IG5vdCB1c2luZyBpbnN0YW5jZW9mXG5cdCAqL1xuXHRwdWJsaWMga2luZCA9IFwiRGF0ZVRpbWVcIjtcblxuXHQvKipcblx0ICogVVRDIHRpbWVzdGFtcCAobGF6aWx5IGNhbGN1bGF0ZWQpXG5cdCAqL1xuXHRwcml2YXRlIF91dGNEYXRlPzogVGltZVN0cnVjdDtcblx0cHJpdmF0ZSBnZXQgdXRjRGF0ZSgpOiBUaW1lU3RydWN0IHtcblx0XHRpZiAoIXRoaXMuX3V0Y0RhdGUpIHtcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlO1xuXHR9XG5cdHByaXZhdGUgc2V0IHV0Y0RhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcblx0XHR0aGlzLl91dGNEYXRlID0gdmFsdWU7XG5cdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogTG9jYWwgdGltZXN0YW1wIChsYXppbHkgY2FsY3VsYXRlZClcblx0ICovXG5cdHByaXZhdGUgX3pvbmVEYXRlPzogVGltZVN0cnVjdDtcblx0cHJpdmF0ZSBnZXQgem9uZURhdGUoKTogVGltZVN0cnVjdCB7XG5cdFx0aWYgKCF0aGlzLl96b25lRGF0ZSkge1xuXHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGU7XG5cdH1cblx0cHJpdmF0ZSBzZXQgem9uZURhdGUodmFsdWU6IFRpbWVTdHJ1Y3QpIHtcblx0XHR0aGlzLl96b25lRGF0ZSA9IHZhbHVlO1xuXHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogT3JpZ2luYWwgdGltZSB6b25lIHRoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgZm9yLlxuXHQgKiBDYW4gYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIHRpbWVzdGFtcHNcblx0ICovXG5cdHByaXZhdGUgX3pvbmU/OiBUaW1lWm9uZTtcblxuXHQvKipcblx0ICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xuXHQgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXG5cdCAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGltZVNvdXJjZTogVGltZVNvdXJjZSA9IG5ldyBSZWFsVGltZVNvdXJjZSgpO1xuXG5cdC8qKlxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcblx0XHRjb25zdCBuID0gRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKTtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG4sIERhdGVGdW5jdGlvbnMuR2V0LCBUaW1lWm9uZS5sb2NhbCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBub3dVdGMoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbm93KHRpbWVab25lOiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDLCBUaW1lWm9uZS51dGMoKSkudG9ab25lKHRpbWVab25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxuXHQgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG5cdCAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcblx0ICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cblx0ICogQHJldHVybnMgYSBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmcm9tRXhjZWwobjogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcblx0XHRhc3NlcnQodHlwZW9mIG4gPT09IFwibnVtYmVyXCIsIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IGJlIGEgbnVtYmVyXCIpO1xuXHRcdGFzc2VydCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XG5cdFx0YXNzZXJ0KGlzRmluaXRlKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xuXHRcdGNvbnN0IHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG5cdCAqIEUuZy4gMjAxNS0wMi0yOSByZXR1cm5zIGZhbHNlIChub3QgYSBsZWFwIHllYXIpXG5cdCAqIGFuZCAyMDE1LTAzLTI5VDAyOjMwOjAwIHJldHVybnMgZmFsc2UgKGRheWxpZ2h0IHNhdmluZyB0aW1lIG1pc3NpbmcgaG91cilcblx0ICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxuXHQgKiBCeSBkZWZhdWx0LCBwcmUtMTk3MCBkYXRlcyBhbHNvIHJldHVybiBmYWxzZSBzaW5jZSB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGRvZXMgbm90IGNvbnRhaW4gYWNjdXJhdGUgaW5mb1xuXHQgKiBiZWZvcmUgdGhhdC4gWW91IGNhbiBjaGFuZ2UgdGhhdCB3aXRoIHRoZSBhbGxvd1ByZTE5NzAgZmxhZy5cblx0ICpcblx0ICogQHBhcmFtIGFsbG93UHJlMTk3MCAob3B0aW9uYWwsIGRlZmF1bHQgZmFsc2UpOiByZXR1cm4gdHJ1ZSBmb3IgcHJlLTE5NzAgZGF0ZXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZXhpc3RzKFxuXHRcdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciA9IDEsIGRheTogbnVtYmVyID0gMSxcblx0XHRob3VyOiBudW1iZXIgPSAwLCBtaW51dGU6IG51bWJlciA9IDAsIHNlY29uZDogbnVtYmVyID0gMCwgbWlsbGlzZWNvbmQ6IG51bWJlciA9IDAsXG5cdFx0em9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCwgYWxsb3dQcmUxOTcwOiBib29sZWFuID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKFxuXHRcdFx0IWlzRmluaXRlKHllYXIpIHx8ICFpc0Zpbml0ZShtb250aCkgfHwgIWlzRmluaXRlKGRheSkgfHwgIWlzRmluaXRlKGhvdXIpIHx8ICFpc0Zpbml0ZShtaW51dGUpIHx8ICFpc0Zpbml0ZShzZWNvbmQpXG5cdFx0XHR8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xuXHRcdFx0cmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxuXHRcdFx0XHQmJiBob3VyID09PSBkdC5ob3VyKCkgJiYgbWludXRlID09PSBkdC5taW51dGUoKSAmJiBzZWNvbmQgPT09IGR0LnNlY29uZCgpICYmIG1pbGxpc2Vjb25kID09PSBkdC5taWxsaXNlY29uZCgpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBDcmVhdGVzIGN1cnJlbnQgdGltZSBpbiBsb2NhbCB0aW1lem9uZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIElTTyB0aW1lc3RhbXAgc3RyaW5nLlxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cblx0ICpcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxuXHQgKiAgICAgICAgaXQgbWF5IGluY2x1ZGUgYSBzcGFjZSBhbmQgdGhlbiBhbmQgSUFOQSB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxuXHQgKiAgICAgICAgZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwKzAxOjAwXCJcdFx0XHRcdChVVEMgb2Zmc2V0IHdpdGhvdXQgZGF5bGlnaHQgc2F2aW5nIHRpbWUpXG5cdCAqICAgICAgICBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBaXCJcdFx0XHRcdFx0KFVUQylcblx0ICogICAgICAgIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXG5cdCAqICAgICAgICBOb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcblx0ICogICAgICAgIGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcblx0ICovXG5cdGNvbnN0cnVjdG9yKGlzb1N0cmluZzogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIHN0cmluZyBpbiBnaXZlbiBMRE1MIGZvcm1hdC5cblx0ICogTk9URTogZG9lcyBub3QgaGFuZGxlIGVyYXMvcXVhcnRlcnMvd2Vla3Mvd2Vla2RheXMuXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZVN0cmluZ1x0RGF0ZStUaW1lIHN0cmluZy5cblx0ICogQHBhcmFtIGZvcm1hdCBUaGUgTERNTCBmb3JtYXQgdGhhdCB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW5cblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxuXHQgKiAgICAgICAgTm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXG5cdCAqICAgICAgICBmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkYXRlU3RyaW5nOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci4gWW91IHByb3ZpZGUgYSBkYXRlLCB0aGVuIHlvdSBzYXkgd2hldGhlciB0byB0YWtlIHRoZVxuXHQgKiBkYXRlLmdldFllYXIoKS9nZXRYeHggbWV0aG9kcyBvciB0aGUgZGF0ZS5nZXRVVENZZWFyKCkvZGF0ZS5nZXRVVENYeHggbWV0aG9kcyxcblx0ICogYW5kIHRoZW4geW91IHN0YXRlIHdoaWNoIHRpbWUgem9uZSB0aGF0IGRhdGUgaXMgaW4uXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxuXHQgKiBOb3RlIHRoYXQgdGhlIERhdGUgY2xhc3MgaGFzIGJ1Z3MgYW5kIGluY29uc2lzdGVuY2llcyB3aGVuIGNvbnN0cnVjdGluZyB0aGVtIHdpdGggdGltZXMgYXJvdW5kXG5cdCAqIERTVCBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZVx0QSBkYXRlIG9iamVjdC5cblx0ICogQHBhcmFtIGdldHRlcnMgU3BlY2lmaWVzIHdoaWNoIHNldCBvZiBEYXRlIGdldHRlcnMgY29udGFpbnMgdGhlIGRhdGUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZTogdGhlXG5cdCAqICAgICAgICBEYXRlLmdldFh4eCgpIG1ldGhvZHMgb3IgdGhlIERhdGUuZ2V0VVRDWHh4KCkgbWV0aG9kcy5cblx0ICogQHBhcmFtIHRpbWVab25lIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyBhc3N1bWVkIHRvIGJlIGluIChtYXkgYmUgdW5kZWZpbmVkIG9yIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMpXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihkYXRlOiBEYXRlLCBnZXRGdW5jczogRGF0ZUZ1bmN0aW9ucywgdGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpO1xuXHQvKipcblx0ICogR2V0IGEgZGF0ZSBmcm9tIGEgVGltZVN0cnVjdFxuXHQgKi9cblx0Y29uc3RydWN0b3IodG06IFRpbWVTdHJ1Y3QsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLiBOb3RlIHRoYXQgdW5saWtlIEphdmFTY3JpcHQgZGF0ZXMgd2UgcmVxdWlyZSBmaWVsZHMgdG8gYmUgaW4gbm9ybWFsIHJhbmdlcy5cblx0ICogVXNlIHRoZSBhZGQoZHVyYXRpb24pIG9yIHN1YihkdXJhdGlvbikgZm9yIGFyaXRobWV0aWMuXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyIChlLmcuIDIwMTQpXG5cdCAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIFsxLTEyXSAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxuXHQgKiBAcGFyYW0gZGF5XHRUaGUgZGF5IG9mIHRoZSBtb250aCBbMS0zMV1cblx0ICogQHBhcmFtIGhvdXJcdFRoZSBob3VyIG9mIHRoZSBkYXkgWzAtMjQpXG5cdCAqIEBwYXJhbSBtaW51dGVcdFRoZSBtaW51dGUgb2YgdGhlIGhvdXIgWzAtNTldXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFRoZSBzZWNvbmQgb2YgdGhlIG1pbnV0ZSBbMC01OV1cblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kXHRUaGUgbWlsbGlzZWNvbmQgb2YgdGhlIHNlY29uZCBbMC05OTldXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSwgb3IgbnVsbC91bmRlZmluZWQgKGZvciB1bmF3YXJlIGRhdGVzKVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcixcblx0XHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGlzZWNvbmQ/OiBudW1iZXIsXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWRcblx0KTtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB1bml4VGltZXN0YW1wXHRtaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcblx0ICogQHBhcmFtIHRpbWVab25lXHR0aGUgdGltZSB6b25lIHRoYXQgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIGluICh1c3VhbGx5IFVUQykuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1bml4VGltZXN0YW1wOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRhMT86IGFueSwgYTI/OiBhbnksIGEzPzogYW55LFxuXHRcdGg/OiBudW1iZXIsIG0/OiBudW1iZXIsIHM/OiBudW1iZXIsIG1zPzogbnVtYmVyLFxuXHRcdHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsXG5cdCkge1xuXHRcdHN3aXRjaCAodHlwZW9mIChhMSkpIHtcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xuXHRcdFx0XHRpZiAodHlwZW9mIGEyICE9PSBcIm51bWJlclwiKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmb3IgdW5peCB0aW1lc3RhbXAgZGF0ZXRpbWUgY29uc3RydWN0b3IsIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTIpLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHQvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZShhMikgPyBhMiBhcyBUaW1lWm9uZSA6IHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKGExIGFzIG51bWJlcikpKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKGExIGFzIG51bWJlcikpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB5ZWFyIG1vbnRoIGRheSBjb25zdHJ1Y3RvclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgbW9udGggdG8gYmUgYSBudW1iZXIuXCIpO1xuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEzKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcblx0XHRcdFx0XHRhc3NlcnQoXG5cdFx0XHRcdFx0XHR0aW1lWm9uZSA9PT0gdW5kZWZpbmVkIHx8IHRpbWVab25lID09PSBudWxsIHx8IGlzVGltZVpvbmUodGltZVpvbmUpLFxuXHRcdFx0XHRcdFx0XCJEYXRlVGltZS5EYXRlVGltZSgpOiBlaWdodGggYXJnIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0bGV0IHllYXI6IG51bWJlciA9IGExIGFzIG51bWJlcjtcblx0XHRcdFx0XHRsZXQgbW9udGg6IG51bWJlciA9IGEyIGFzIG51bWJlcjtcblx0XHRcdFx0XHRsZXQgZGF5OiBudW1iZXIgPSBhMyBhcyBudW1iZXI7XG5cdFx0XHRcdFx0bGV0IGhvdXI6IG51bWJlciA9ICh0eXBlb2YgKGgpID09PSBcIm51bWJlclwiID8gaCA6IDApO1xuXHRcdFx0XHRcdGxldCBtaW51dGU6IG51bWJlciA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xuXHRcdFx0XHRcdGxldCBzZWNvbmQ6IG51bWJlciA9ICh0eXBlb2YgKHMpID09PSBcIm51bWJlclwiID8gcyA6IDApO1xuXHRcdFx0XHRcdGxldCBtaWxsaTogbnVtYmVyID0gKHR5cGVvZiAobXMpID09PSBcIm51bWJlclwiID8gbXMgOiAwKTtcblx0XHRcdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcblx0XHRcdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xuXHRcdFx0XHRcdGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcblx0XHRcdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcblx0XHRcdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XG5cdFx0XHRcdFx0c2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xuXHRcdFx0XHRcdG1pbGxpID0gbWF0aC5yb3VuZFN5bShtaWxsaSk7XG5cdFx0XHRcdFx0Y29uc3QgdG0gPSBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdFx0XHRhc3NlcnQodG0udmFsaWRhdGUoKSwgYGludmFsaWQgZGF0ZTogJHt0bS50b1N0cmluZygpfWApO1xuXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKHRpbWVab25lKSA9PT0gXCJvYmplY3RcIiAmJiBpc1RpbWVab25lKHRpbWVab25lKSA/IHRpbWVab25lIDogdW5kZWZpbmVkKTtcblxuXHRcdFx0XHRcdC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0bSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdG07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjoge1xuXHRcdFx0XHRpZiAodHlwZW9mIGEyID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0aCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0JiYgcyA9PT0gdW5kZWZpbmVkICYmIG1zID09PSB1bmRlZmluZWQgJiYgdGltZVpvbmUgPT09IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFwiZmlyc3QgdHdvIGFyZ3VtZW50cyBhcmUgYSBzdHJpbmcsIHRoZXJlZm9yZSB0aGUgZm91cnRoIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMyA9PT0gdW5kZWZpbmVkIHx8IGEzID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTMpLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRoaXJkIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuXHRcdFx0XHRcdC8vIGZvcm1hdCBzdHJpbmcgZ2l2ZW5cblx0XHRcdFx0XHRjb25zdCBkYXRlU3RyaW5nOiBzdHJpbmcgPSBhMSBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0Y29uc3QgZm9ybWF0U3RyaW5nOiBzdHJpbmcgPSBhMiBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0bGV0IHpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgYTMgPT09IFwib2JqZWN0XCIgJiYgaXNUaW1lWm9uZShhMykpIHtcblx0XHRcdFx0XHRcdHpvbmUgPSAoYTMpIGFzIFRpbWVab25lO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBwYXJzZWQudGltZTtcblx0XHRcdFx0XHR0aGlzLl96b25lID0gcGFyc2VkLnpvbmU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudHMgaXMgYSBzdHJpbmcgYW5kIHRoZSBzZWNvbmQgaXMgbm90LCB0aGVyZWZvcmUgdGhlIHRoaXJkIHRocm91Z2ggOHRoIGFyZ3VtZW50IG11c3QgYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTIpLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBhcmcgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcblx0XHRcdFx0XHRjb25zdCBnaXZlblN0cmluZyA9IChhMSBhcyBzdHJpbmcpLnRyaW0oKTtcblx0XHRcdFx0XHRjb25zdCBzczogc3RyaW5nW10gPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKGdpdmVuU3RyaW5nKTtcblx0XHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIGExIGFzIHN0cmluZyArIFwiXFxcIlwiKTtcblx0XHRcdFx0XHRpZiAoaXNUaW1lWm9uZShhMikpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTIpIGFzIFRpbWVab25lO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lID0gKHNzWzFdLnRyaW0oKSA/IFRpbWVab25lLnpvbmUoc3NbMV0pIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gdXNlIG91ciBvd24gSVNPIHBhcnNpbmcgYmVjYXVzZSB0aGF0IGl0IHBsYXRmb3JtIGluZGVwZW5kZW50XG5cdFx0XHRcdFx0Ly8gKGZyZWUgb2YgRGF0ZSBxdWlya3MpXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHtcblx0XHRcdFx0aWYgKGExIGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdGggPT09IHVuZGVmaW5lZCAmJiBtID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcImZpcnN0IGFyZ3VtZW50IGlzIGEgRGF0ZSwgdGhlcmVmb3JlIHRoZSBmb3VydGggdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0dHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIgJiYgKGEyID09PSBEYXRlRnVuY3Rpb25zLkdldCB8fCBhMiA9PT0gRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpLFxuXHRcdFx0XHRcdFx0XCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGFzc2VydChhMyA9PT0gdW5kZWZpbmVkIHx8IGEzID09PSBudWxsIHx8IGlzVGltZVpvbmUoYTMpLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRoaXJkIGFyZyBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xuXHRcdFx0XHRcdGNvbnN0IGQ6IERhdGUgPSAoYTEpIGFzIERhdGU7XG5cdFx0XHRcdFx0Y29uc3QgZGs6IERhdGVGdW5jdGlvbnMgPSAoYTIpIGFzIERhdGVGdW5jdGlvbnM7XG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IChhMyA/IGEzIDogdW5kZWZpbmVkKTtcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoZCwgZGspO1xuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHsgLy8gYTEgaW5zdGFuY2VvZiBUaW1lU3RydWN0XG5cdFx0XHRcdFx0YXNzZXJ0KFxuXHRcdFx0XHRcdFx0YTMgPT09IHVuZGVmaW5lZCAmJiBoID09PSB1bmRlZmluZWQgJiYgbSA9PT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQmJiBzID09PSB1bmRlZmluZWQgJiYgbXMgPT09IHVuZGVmaW5lZCAmJiB0aW1lWm9uZSA9PT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudCBpcyBhIFRpbWVTdHJ1Y3QsIHRoZXJlZm9yZSB0aGUgdGhpcmQgdGhyb3VnaCA4dGggYXJndW1lbnQgbXVzdCBiZSB1bmRlZmluZWRcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YXNzZXJ0KGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgaXNUaW1lWm9uZShhMiksIFwiZXhwZWN0IGEgVGltZVpvbmUgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gYTEuY2xvbmUoKTtcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKGEyID8gYTIgOiB1bmRlZmluZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGJyZWFrO1xuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XG5cdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRhMiA9PT0gdW5kZWZpbmVkICYmIGEzID09PSB1bmRlZmluZWQgJiYgaCA9PT0gdW5kZWZpbmVkICYmIG0gPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdCYmIHMgPT09IHVuZGVmaW5lZCAmJiBtcyA9PT0gdW5kZWZpbmVkICYmIHRpbWVab25lID09PSB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XCJmaXJzdCBhcmd1bWVudCBpcyB1bmRlZmluZWQsIHRoZXJlZm9yZSB0aGUgcmVzdCBtdXN0IGFsc28gYmUgdW5kZWZpbmVkXCJcblx0XHRcdFx0KTtcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxuXHRcdFx0XHR0aGlzLl96b25lID0gVGltZVpvbmUubG9jYWwoKTtcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xuXHRcdFx0fSAgICAgICAgICAgICAgICAgYnJlYWs7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHRoaXMuX3pvbmUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgdW5kZWZpbmVkIGZvciB1bmF3YXJlIGRhdGVzLlxuXHQgKi9cblx0cHVibGljIHpvbmUoKTogVGltZVpvbmUgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLl96b25lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cblx0ICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgem9uZUFiYnJldmlhdGlvbihkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmUuYWJicmV2aWF0aW9uRm9yVXRjKHRoaXMudXRjRGF0ZSwgZHN0RGVwZW5kZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbmNsdWRpbmcgRFNUIHcuci50LiBVVEMgaW4gbWludXRlcy4gUmV0dXJucyAwIGZvciB1bmF3YXJlIGRhdGVzIGFuZCBmb3IgVVRDIGRhdGVzLlxuXHQgKi9cblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKCh0aGlzLnpvbmVEYXRlLnVuaXhNaWxsaXMgLSB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcykgLyA2MDAwMCk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IGluY2x1ZGluZyBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIG9mZnNldER1cmF0aW9uKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKE1hdGgucm91bmQodGhpcy56b25lRGF0ZS51bml4TWlsbGlzIC0gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHRoZSBzdGFuZGFyZCBvZmZzZXQgV0lUSE9VVCBEU1Qgdy5yLnQuIFVUQyBhcyBhIER1cmF0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0RHVyYXRpb24oKTogRHVyYXRpb24ge1xuXHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl96b25lLnN0YW5kYXJkT2Zmc2V0Rm9yVXRjKHRoaXMudXRjRGF0ZSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcygwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XG5cdCAqL1xuXHRwdWJsaWMgeWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMueWVhcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqL1xuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1vbnRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxuXHQgKi9cblx0cHVibGljIGRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLmNvbXBvbmVudHMuZGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xuXHQgKi9cblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLmhvdXI7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgbWludXRlcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5taW51dGU7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgc2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuem9uZURhdGUuY29tcG9uZW50cy5zZWNvbmQ7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy56b25lRGF0ZS5jb21wb25lbnRzLm1pbGxpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXG5cdCAqL1xuXHRwdWJsaWMgd2Vla0RheSgpOiBXZWVrRGF5IHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuem9uZURhdGUudW5peE1pbGxpcykgYXMgV2Vla0RheTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cblx0ICpcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxuXHQgKi9cblx0cHVibGljIGRheU9mWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnpvbmVEYXRlLnllYXJEYXkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG5cdCAqXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG5cdCAqL1xuXHRwdWJsaWMgd2Vla051bWJlcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuXHQgKi9cblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcblx0ICpcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuXHQgKi9cblx0cHVibGljIHNlY29uZE9mRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXG5cdCAqL1xuXHRwdWJsaWMgdW5peFV0Y01pbGxpcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XG5cdCAqL1xuXHRwdWJsaWMgdXRjWWVhcigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy55ZWFyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXG5cdCAqL1xuXHRwdWJsaWMgdXRjTW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubW9udGg7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxuXHQgKi9cblx0cHVibGljIHV0Y0RheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUuY29tcG9uZW50cy5kYXk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgVVRDIGhvdXIgMC0yM1xuXHQgKi9cblx0cHVibGljIHV0Y0hvdXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMuaG91cjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgdXRjTWludXRlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLm1pbnV0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XG5cdCAqL1xuXHRwdWJsaWMgdXRjU2Vjb25kKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5jb21wb25lbnRzLnNlY29uZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBVVEMgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXG5cdCAqXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cblx0ICovXG5cdHB1YmxpYyB1dGNEYXlPZlllYXIoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XG5cdCAqL1xuXHRwdWJsaWMgdXRjTWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLmNvbXBvbmVudHMubWlsbGk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla0RheSgpOiBXZWVrRGF5IHtcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMudXRjRGF0ZS51bml4TWlsbGlzKSBhcyBXZWVrRGF5O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXG5cdCAqXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXG5cdCAqL1xuXHRwdWJsaWMgdXRjV2Vla051bWJlcigpOiBudW1iZXIge1xuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcblx0ICpcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxuXHQgKi9cblx0cHVibGljIHV0Y1dlZWtPZk1vbnRoKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcblx0ICpcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxuXHQgKi9cblx0cHVibGljIHV0Y1NlY29uZE9mRGF5KCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcblx0ICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cblx0ICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXG5cdCAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcblx0ICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cblx0ICovXG5cdHB1YmxpYyB3aXRoWm9uZSh6b25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHR0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLFxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSxcblx0XHRcdHpvbmVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cblx0ICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxuXHQgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcblx0ICovXG5cdHB1YmxpYyBjb252ZXJ0KHpvbmU/OiBUaW1lWm9uZSB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHpvbmUpIHtcblx0XHRcdGlmICghdGhpcy5fem9uZSkgeyAvLyBpZi1zdGF0ZW1lbnQgc2F0aXNmaWVzIHRoZSBjb21waWxlclxuXHRcdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghdGhpcy5fdXRjRGF0ZSkge1xuXHRcdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBjb252ZXJ0VG9VdGModGhpcy5fem9uZURhdGUgYXMgVGltZVN0cnVjdCwgdGhpcy5fem9uZSk7IC8vIGNhdXNlIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTtcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghdGhpcy5fem9uZSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcztcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5fem9uZURhdGUpIHtcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBjb252ZXJ0RnJvbVV0Yyh0aGlzLl91dGNEYXRlIGFzIFRpbWVTdHJ1Y3QsIHRoaXMuX3pvbmUpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fem9uZSA9IHVuZGVmaW5lZDtcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB1bmRlZmluZWQ7IC8vIGNhdXNlIGxhdGVyIHpvbmUgLT4gdXRjIGNvbnZlcnNpb25cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXG5cdCAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxuXHQgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3Jcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCBvciB1bmRlZmluZWQgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cblx0ICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcblx0ICovXG5cdHB1YmxpYyB0b1pvbmUoem9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGVUaW1lIHtcblx0XHRpZiAoem9uZSkge1xuXHRcdFx0YXNzZXJ0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XG5cdFx0XHRyZXN1bHQudXRjRGF0ZSA9IHRoaXMudXRjRGF0ZTtcblx0XHRcdHJlc3VsdC5fem9uZSA9IHpvbmU7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuem9uZURhdGUsIHVuZGVmaW5lZCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXG5cdCAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXG5cdCAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cblx0ICovXG5cdHB1YmxpYyB0b0RhdGUoKTogRGF0ZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlKFxuXHRcdFx0dGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICovXG5cdHB1YmxpYyB0b0V4Y2VsKHRpbWVab25lPzogVGltZVpvbmUgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcblx0XHRsZXQgZHQ6IERhdGVUaW1lID0gdGhpcztcblx0XHRpZiAodGltZVpvbmUgJiYgKCF0aGlzLl96b25lIHx8ICF0aW1lWm9uZS5lcXVhbHModGhpcy5fem9uZSkpKSB7XG5cdFx0XHRkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcblx0XHR9XG5cdFx0Y29uc3Qgb2Zmc2V0TWlsbGlzID0gZHQub2Zmc2V0KCkgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcblx0ICovXG5cdHB1YmxpYyB0b1V0Y0V4Y2VsKCk6IG51bWJlciB7XG5cdFx0Y29uc3QgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcblx0fVxuXG5cdHByaXZhdGUgX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKG46IG51bWJlcik6IG51bWJlciB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXG5cdFx0Y29uc3QgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIEFkZCBhIHRpbWUgZHVyYXRpb24gcmVsYXRpdmUgdG8gVVRDLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqIEByZXR1cm4gdGhpcyArIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgdXRjSG91cigpIGZpZWxkLCBhZGRpbmcgMSBtb250aFxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxuXHQgKiBBZGRpbmcgYW4gYW1vdW50IG9mIHVuaXRzIGxlYXZlcyBsb3dlciB1bml0cyBpbnRhY3QuIEUuZy5cblx0ICogYWRkaW5nIGEgbW9udGggd2lsbCBsZWF2ZSB0aGUgZGF5KCkgZmllbGQgdW50b3VjaGVkIGlmIHBvc3NpYmxlLlxuXHQgKlxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxuXHQgKlxuXHQgKiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdXRjIHRpbWUgZmllbGRzIGFyZSBzdGlsbCB1bnRvdWNoZWQgYnV0IGxvY2FsXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cblx0ICovXG5cdHB1YmxpYyBhZGQoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBJbXBsZW1lbnRhdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xuXHRcdGxldCBhbW91bnQ6IG51bWJlcjtcblx0XHRsZXQgdTogVGltZVVuaXQ7XG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRjb25zdCBkdXJhdGlvbjogRHVyYXRpb24gPSAoYTEpIGFzIER1cmF0aW9uO1xuXHRcdFx0YW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xuXHRcdFx0YW1vdW50ID0gKGExKSBhcyBudW1iZXI7XG5cdFx0XHR1ID0gdW5pdCBhcyBUaW1lVW5pdDtcblx0XHR9XG5cdFx0Y29uc3QgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy51dGNEYXRlLCBhbW91bnQsIHUpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0sIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSB6b25lIHRpbWUsIGFzIHJlZ3VsYXJseSBhcyBwb3NzaWJsZS4gUmV0dXJucyBhIG5ldyBEYXRlVGltZVxuXHQgKlxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxuXHQgKiBkYXRlIGJ5IG9uZS4gSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHRpbWUgZmllbGRzIG1heSBhZGRpdGlvbmFsbHlcblx0ICogaW5jcmVhc2UgYnkgdGhlIERTVCBvZmZzZXQsIGlmIGEgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgd291bGRcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXG5cdCAqXG5cdCAqIEFkZGluZyBhIHVuaXQgb2YgdGltZSB3aWxsIGxlYXZlIGxvd2VyLXVuaXQgZmllbGRzIGludGFjdCwgdW5sZXNzIHRoZSByZXN1bHRcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxuXHQgKlxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxuXHQgKi9cblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xuXHRwdWJsaWMgYWRkTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBhZGRMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XG5cdFx0bGV0IGFtb3VudDogbnVtYmVyO1xuXHRcdGxldCB1OiBUaW1lVW5pdDtcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGNvbnN0IGR1cmF0aW9uOiBEdXJhdGlvbiA9IChhMSkgYXMgRHVyYXRpb247XG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcblx0XHRcdHUgPSBkdXJhdGlvbi51bml0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XG5cdFx0XHRhbW91bnQgPSAoYTEpIGFzIG51bWJlcjtcblx0XHRcdHUgPSB1bml0IGFzIFRpbWVVbml0O1xuXHRcdH1cblx0XHRjb25zdCBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuem9uZURhdGUsIGFtb3VudCwgdSk7XG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcblx0XHRcdGNvbnN0IGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xuXHRcdFx0Y29uc3Qgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbSwgZGlyZWN0aW9uKTtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobG9jYWxUbSwgdW5kZWZpbmVkKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcblx0ICogbmVjZXNzYXJ5LlxuXHQgKi9cblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcblx0XHRsZXQgeWVhcjogbnVtYmVyO1xuXHRcdGxldCBtb250aDogbnVtYmVyO1xuXHRcdGxldCBkYXk6IG51bWJlcjtcblx0XHRsZXQgaG91cjogbnVtYmVyO1xuXHRcdGxldCBtaW51dGU6IG51bWJlcjtcblx0XHRsZXQgc2Vjb25kOiBudW1iZXI7XG5cdFx0bGV0IG1pbGxpOiBudW1iZXI7XG5cblx0XHRzd2l0Y2ggKHVuaXQpIHtcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQpKTtcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMTAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA2MDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogMzYwMDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChtYXRoLnJvdW5kU3ltKHRtLnVuaXhNaWxsaXMgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOlxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QobWF0aC5yb3VuZFN5bSh0bS51bml4TWlsbGlzICsgYW1vdW50ICogNyAqIDg2NDAwMDAwKSk7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xuXHRcdFx0XHQvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcblx0XHRcdFx0aWYgKGFtb3VudCA+PSAwKSB7XG5cdFx0XHRcdFx0eWVhciA9IHRtLmNvbXBvbmVudHMueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0uY29tcG9uZW50cy5tb250aCkpIC8gMTIpO1xuXHRcdFx0XHRcdG1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLmNvbXBvbmVudHMubW9udGggLSAxICsgTWF0aC5mbG9vcihhbW91bnQpKSwgMTIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHllYXIgPSB0bS5jb21wb25lbnRzLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0uY29tcG9uZW50cy5tb250aCAtIDEpKSAvIDEyKTtcblx0XHRcdFx0XHRtb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5jb21wb25lbnRzLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xuXHRcdFx0XHR5ZWFyID0gdG0uY29tcG9uZW50cy55ZWFyICsgYW1vdW50O1xuXHRcdFx0XHRtb250aCA9IHRtLmNvbXBvbmVudHMubW9udGg7XG5cdFx0XHRcdGRheSA9IE1hdGgubWluKHRtLmNvbXBvbmVudHMuZGF5LCBiYXNpY3MuZGF5c0luTW9udGgoeWVhciwgbW9udGgpKTtcblx0XHRcdFx0aG91ciA9IHRtLmNvbXBvbmVudHMuaG91cjtcblx0XHRcdFx0bWludXRlID0gdG0uY29tcG9uZW50cy5taW51dGU7XG5cdFx0XHRcdHNlY29uZCA9IHRtLmNvbXBvbmVudHMuc2Vjb25kO1xuXHRcdFx0XHRtaWxsaSA9IHRtLmNvbXBvbmVudHMubWlsbGk7XG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh7IHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZCgtMSpkdXJhdGlvbik7IFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdWIoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XG5cdC8qKlxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3ViKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xuXHRwdWJsaWMgc3ViKGExOiBudW1iZXIgfCBEdXJhdGlvbiwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xuXHRcdGlmICh0eXBlb2YgYTEgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdGFzc2VydCh0eXBlb2YgdW5pdCA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcblx0XHRcdGNvbnN0IGFtb3VudDogbnVtYmVyID0gYTEgYXMgbnVtYmVyO1xuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0IGFzIFRpbWVVbml0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZHVyYXRpb246IER1cmF0aW9uID0gYTEgYXMgRHVyYXRpb247XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2FtZSBhcyBhZGRMb2NhbCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXG5cdCAqL1xuXHRwdWJsaWMgc3ViTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XG5cdHB1YmxpYyBzdWJMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcblx0cHVibGljIHN1YkxvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcblx0XHRpZiAodHlwZW9mIGExID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgoYTEgYXMgRHVyYXRpb24pLm11bHRpcGx5KC0xKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogYTEgYXMgbnVtYmVyLCB1bml0IGFzIFRpbWVVbml0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xuXHQgKiBAcmV0dXJuIHRoaXMgLSBvdGhlclxuXHQgKi9cblx0cHVibGljIGRpZmYob3RoZXI6IERhdGVUaW1lKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgLSBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN0YXJ0T2ZEYXkoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgbW9udGggYXQgMDA6MDA6MDBcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxuXHQgKi9cblx0cHVibGljIHN0YXJ0T2ZNb250aCgpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyIGF0IDAwOjAwOjAwXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBzdGFydE9mWWVhcigpOiBEYXRlVGltZSB7XG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgMSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcblx0ICovXG5cdHB1YmxpYyBsZXNzVGhhbihvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPCBvdGhlci51dGNEYXRlLnVuaXhNaWxsaXM7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcblx0ICovXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzIDw9IG90aGVyLnV0Y0RhdGUudW5peE1pbGxpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSBtb21lbnQgaW4gdGltZSBpbiBVVENcblx0ICovXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS5lcXVhbHMob3RoZXIudXRjRGF0ZSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxuXHQgKi9cblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gISEodGhpcy56b25lRGF0ZS5lcXVhbHMob3RoZXIuem9uZURhdGUpXG5cdFx0XHQmJiAoIXRoaXMuX3pvbmUpID09PSAoIW90aGVyLl96b25lKVxuXHRcdFx0JiYgKCghdGhpcy5fem9uZSAmJiAhb3RoZXIuX3pvbmUpIHx8ICh0aGlzLl96b25lICYmIG90aGVyLl96b25lICYmIHRoaXMuX3pvbmUuaWRlbnRpY2FsKG90aGVyLl96b25lKSkpXG5cdFx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXRjRGF0ZS51bml4TWlsbGlzID4gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxuXHQgKi9cblx0cHVibGljIGdyZWF0ZXJFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy51dGNEYXRlLnVuaXhNaWxsaXMgPj0gb3RoZXIudXRjRGF0ZS51bml4TWlsbGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcblx0ICovXG5cdHB1YmxpYyBtaW4ob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxuXHQgKi9cblx0cHVibGljIG1heChvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9wZXIgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIGFueSBJQU5BIHpvbmUgY29udmVydGVkIHRvIElTTyBvZmZzZXRcblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMrMDE6MDBcIiBmb3IgRXVyb3BlL0Ftc3RlcmRhbVxuXHQgKi9cblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0Y29uc3Qgczogc3RyaW5nID0gdGhpcy56b25lRGF0ZS50b1N0cmluZygpO1xuXHRcdGlmICh0aGlzLl96b25lKSB7XG5cdFx0XHRyZXR1cm4gcyArIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKHRoaXMub2Zmc2V0KCkpOyAvLyBjb252ZXJ0IElBTkEgbmFtZSB0byBvZmZzZXRcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcblx0ICogc3BlY2lmaWVkIGZvcm1hdC4gU2VlIExETUwubWQgZm9yIHN1cHBvcnRlZCBmb3JtYXRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcblx0ICogQHBhcmFtIGxvY2FsZSBPcHRpb25hbCwgbm9uLWVuZ2xpc2ggZm9ybWF0IG1vbnRoIG5hbWVzIGV0Yy5cblx0ICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcblx0ICovXG5cdHB1YmxpYyBmb3JtYXQoZm9ybWF0U3RyaW5nOiBzdHJpbmcsIGxvY2FsZT86IFBhcnRpYWxMb2NhbGUpOiBzdHJpbmcge1xuXHRcdHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuem9uZURhdGUsIHRoaXMudXRjRGF0ZSwgdGhpcy5fem9uZSwgZm9ybWF0U3RyaW5nLCBsb2NhbGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZGF0ZSBpbiBhIGdpdmVuIGZvcm1hdFxuXHQgKiBAcGFyYW0gcyB0aGUgc3RyaW5nIHRvIHBhcnNlXG5cdCAqIEBwYXJhbSBmb3JtYXQgdGhlIGZvcm1hdCB0aGUgc3RyaW5nIGlzIGluLiBTZWUgTERNTC5tZCBmb3Igc3VwcG9ydGVkIGZvcm1hdHMuXG5cdCAqIEBwYXJhbSB6b25lIE9wdGlvbmFsLCB0aGUgem9uZSB0byBhZGQgKGlmIG5vIHpvbmUgaXMgZ2l2ZW4gaW4gdGhlIHN0cmluZylcblx0ICogQHBhcmFtIGxvY2FsZSBPcHRpb25hbCwgZGlmZmVyZW50IHNldHRpbmdzIGZvciBjb25zdGFudHMgbGlrZSAnQU0nIGV0Y1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBwYXJzZShzOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nLCB6b25lPzogVGltZVpvbmUsIGxvY2FsZT86IFBhcnRpYWxMb2NhbGUpOiBEYXRlVGltZSB7XG5cdFx0Y29uc3QgcGFyc2VkID0gcGFyc2VGdW5jcy5wYXJzZShzLCBmb3JtYXQsIHpvbmUsIGZhbHNlLCBsb2NhbGUpO1xuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUsIHBhcnNlZC56b25lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggSUFOQSBuYW1lIGlmIGFwcGxpY2FibGUuXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdGNvbnN0IHM6IHN0cmluZyA9IHRoaXMuem9uZURhdGUudG9TdHJpbmcoKTtcblx0XHRpZiAodGhpcy5fem9uZSkge1xuXHRcdFx0aWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSBUaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XG5cdFx0XHRcdHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cblx0ICovXG5cdHB1YmxpYyB0b1V0Y1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnV0Y0RhdGUudG9TdHJpbmcoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9zcGxpdERhdGVGcm9tVGltZVpvbmUoczogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHRyaW1tZWQgPSBzLnRyaW0oKTtcblx0XHRjb25zdCByZXN1bHQgPSBbXCJcIiwgXCJcIl07XG5cdFx0bGV0IGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIndpdGhvdXQgRFNUXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKHMuc2xpY2UoMCwgaW5kZXggLSAxKSk7XG5cdFx0XHRyZXN1bHRbMV0gKz0gXCIgd2l0aG91dCBEU1RcIjtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIiBcIik7XG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJaXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIrXCIpO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCItXCIpO1xuXHRcdGlmIChpbmRleCA8IDgpIHtcblx0XHRcdGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxuXHRcdH1cblx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cdFx0cmVzdWx0WzBdID0gdHJpbW1lZDtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYGFgIGlzIHNpbWlsYXIgdG8gYSBUaW1lWm9uZSB3aXRob3V0IHVzaW5nIHRoZSBpbnN0YW5jZW9mIG9wZXJhdG9yLlxuICogSXQgY2hlY2tzIGZvciB0aGUgYXZhaWxhYmlsaXR5IG9mIHRoZSBmdW5jdGlvbnMgdXNlZCBpbiB0aGUgRGF0ZVRpbWUgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSBhIHRoZSBvYmplY3QgdG8gY2hlY2tcbiAqIEByZXR1cm5zIGEgaXMgVGltZVpvbmUtbGlrZVxuICovXG5mdW5jdGlvbiBpc1RpbWVab25lKGE6IGFueSk6IGEgaXMgVGltZVpvbmUge1xuXHRpZiAoYSAmJiB0eXBlb2YgYSA9PT0gXCJvYmplY3RcIikge1xuXHRcdGlmIChcblx0XHRcdHR5cGVvZiBhLm5vcm1hbGl6ZVpvbmVUaW1lID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdCYmIHR5cGVvZiBhLmFiYnJldmlhdGlvbkZvclV0YyA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQmJiB0eXBlb2YgYS5zdGFuZGFyZE9mZnNldEZvclV0YyA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQmJiB0eXBlb2YgYS5pZGVudGljYWwgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0JiYgdHlwZW9mIGEuZXF1YWxzID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdCYmIHR5cGVvZiBhLmtpbmQgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0JiYgdHlwZW9mIGEuY2xvbmUgPT09IFwiZnVuY3Rpb25cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBEYXRlVGltZS4gTm90ZSB0aGF0IGl0IGRvZXMgbm90IHdvcmsgZm9yIHN1YiBjbGFzc2VzLiBIb3dldmVyLCB1c2UgdGhpcyB0byBiZSByb2J1c3RcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZVRpbWUodmFsdWU6IGFueSk6IHZhbHVlIGlzIERhdGVUaW1lIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIkRhdGVUaW1lXCI7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogVGltZSBkdXJhdGlvblxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgVGltZVVuaXQgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xuXG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xuICovXG5leHBvcnQgZnVuY3Rpb24geWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ueWVhcnMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ubW9udGhzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLmRheXMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24uaG91cnMobik7XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyhuKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdHJldHVybiBEdXJhdGlvbi5zZWNvbmRzKG4pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0cmV0dXJuIER1cmF0aW9uLm1pbGxpc2Vjb25kcyhuKTtcbn1cblxuLyoqXG4gKiBUaW1lIGR1cmF0aW9uIHdoaWNoIGlzIHJlcHJlc2VudGVkIGFzIGFuIGFtb3VudCBhbmQgYSB1bml0IGUuZy5cbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXG4gKlxuICogSXQgaGFzIHR3byBzZXRzIG9mIGdldHRlciBmdW5jdGlvbnM6XG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXG4gKiAgIFRoZXNlIHJldHVybiBhIHBhcnQgb2YgeW91ciBzdHJpbmcgcmVwcmVzZW50YXRpb24uIEUuZy4gZm9yIDI1MDAgbWlsbGlzZWNvbmRzLCB0aGUgbWlsbGlzZWNvbmQoKSBwYXJ0IHdvdWxkIGJlIDUwMFxuICogLSBzZWNvbmRzKCksIG1pbnV0ZXMoKSwgaG91cnMoKSBldGMsIHBsdXJhbCBmb3JtOiB0aGVzZSByZXR1cm4gdGhlIHRvdGFsIGFtb3VudCByZXByZXNlbnRlZCBpbiB0aGUgY29ycmVzcG9uZGluZyB1bml0LlxuICovXG5leHBvcnQgY2xhc3MgRHVyYXRpb24ge1xuXG5cdC8qKlxuXHQgKiBBbGxvdyBub3QgdXNpbmcgaW5zdGFuY2VvZlxuXHQgKi9cblx0cHVibGljIGtpbmQgPSBcIkR1cmF0aW9uXCI7XG5cblx0LyoqXG5cdCAqIEdpdmVuIGFtb3VudCBpbiBjb25zdHJ1Y3RvclxuXHQgKi9cblx0cHJpdmF0ZSBfYW1vdW50OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFVuaXRcblx0ICovXG5cdHByaXZhdGUgX3VuaXQ6IFRpbWVVbml0O1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgeWVhcnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyB5ZWFycyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5ZZWFyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbW9udGhzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG1vbnRocyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5Nb250aCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGRheXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGRheXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuRGF5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgaG91cnMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBob3VycyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5Ib3VyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWludXRlcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbWludXRlcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5NaW51dGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LlNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbGxpc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBtaWxsaXNlY29uZHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb24gb2YgMFxuXHQgKi9cblx0Y29uc3RydWN0b3IoKTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvbiBmcm9tIGEgc3RyaW5nIGluIG9uZSBvZiB0d28gZm9ybWF0czpcblx0ICogMSkgWy1daGhoaFs6bW1bOnNzWy5ubm5dXV0gZS5nLiAnLTAxOjAwOjMwLjUwMSdcblx0ICogMikgYW1vdW50IGFuZCB1bml0IGUuZy4gJy0xIGRheXMnIG9yICcxIHllYXInLiBUaGUgdW5pdCBtYXkgYmUgaW4gc2luZ3VsYXIgb3IgcGx1cmFsIGZvcm0gYW5kIGlzIGNhc2UtaW5zZW5zaXRpdmVcblx0ICovXG5cdGNvbnN0cnVjdG9yKGlucHV0OiBzdHJpbmcpO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3QgYSBkdXJhdGlvbiBmcm9tIGFuIGFtb3VudCBhbmQgYSB0aW1lIHVuaXQuXG5cdCAqIEBwYXJhbSBhbW91bnRcdE51bWJlciBvZiB1bml0c1xuXHQgKiBAcGFyYW0gdW5pdFx0QSB0aW1lIHVuaXQgaS5lLiBUaW1lVW5pdC5TZWNvbmQsIFRpbWVVbml0LkhvdXIgZXRjLiBEZWZhdWx0IE1pbGxpc2Vjb25kLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoYW1vdW50OiBudW1iZXIsIHVuaXQ/OiBUaW1lVW5pdCk7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihpMT86IGFueSwgdW5pdD86IFRpbWVVbml0KSB7XG5cdFx0aWYgKHR5cGVvZiAoaTEpID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHQvLyBhbW91bnQrdW5pdCBjb25zdHJ1Y3RvclxuXHRcdFx0Y29uc3QgYW1vdW50ID0gaTEgYXMgbnVtYmVyO1xuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xuXHRcdFx0dGhpcy5fdW5pdCA9ICh0eXBlb2YgdW5pdCA9PT0gXCJudW1iZXJcIiA/IHVuaXQgOiBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgKGkxKSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0Ly8gc3RyaW5nIGNvbnN0cnVjdG9yXG5cdFx0XHR0aGlzLl9mcm9tU3RyaW5nKGkxIGFzIHN0cmluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGRlZmF1bHQgY29uc3RydWN0b3Jcblx0XHRcdHRoaXMuX2Ftb3VudCA9IDA7XG5cdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGlzIGR1cmF0aW9uIGV4cHJlc3NlZCBpbiBkaWZmZXJlbnQgdW5pdCAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpLlxuXHQgKiBUaGlzIGlzIHByZWNpc2UgZm9yIFllYXIgPC0+IE1vbnRoIGFuZCBmb3IgdGltZS10by10aW1lIGNvbnZlcnNpb24gKGkuZS4gSG91ci1vci1sZXNzIHRvIEhvdXItb3ItbGVzcykuXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxuXHQgKi9cblx0cHVibGljIGFzKHVuaXQ6IFRpbWVVbml0KTogbnVtYmVyIHtcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudDtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPj0gVGltZVVuaXQuTW9udGggJiYgdW5pdCA+PSBUaW1lVW5pdC5Nb250aCkge1xuXHRcdFx0Y29uc3QgdGhpc01vbnRocyA9ICh0aGlzLl91bml0ID09PSBUaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcblx0XHRcdGNvbnN0IHJlcU1vbnRocyA9ICh1bml0ID09PSBUaW1lVW5pdC5ZZWFyID8gMTIgOiAxKTtcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTW9udGhzIC8gcmVxTW9udGhzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCB0aGlzTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xuXHRcdFx0Y29uc3QgcmVxTXNlYyA9IGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpO1xuXHRcdFx0cmV0dXJuIHRoaXMuX2Ftb3VudCAqIHRoaXNNc2VjIC8gcmVxTXNlYztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCB0aGlzIGR1cmF0aW9uIHRvIGEgRHVyYXRpb24gaW4gYW5vdGhlciB1bml0LiBZb3UgYWx3YXlzIGdldCBhIGNsb25lIGV2ZW4gaWYgeW91IHNwZWNpZnlcblx0ICogdGhlIHNhbWUgdW5pdC5cblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxuXHQgKiBJdCBpcyBhcHByb3hpbWF0ZSBmb3IgYW55IG90aGVyIGNvbnZlcnNpb25cblx0ICovXG5cdHB1YmxpYyBjb252ZXJ0KHVuaXQ6IFRpbWVVbml0KTogRHVyYXRpb24ge1xuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5hcyh1bml0KSwgdW5pdCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKi9cblx0cHVibGljIG1pbGxpc2Vjb25kcygpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWlsbGlzZWNvbmQgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDQwMCBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSAxNTAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIHNlY29uZHMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5TZWNvbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBzZWNvbmQgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LlNlY29uZCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBtaW51dGVzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA5MDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBtaW51dGVzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWludXRlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWludXRlIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXG5cdCAqIEByZXR1cm4gZS5nLiAyIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5NaW51dGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gaG91cnMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgaG91cnMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Ib3VyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaG91ciBwYXJ0IG9mIGEgZHVyYXRpb24uIFRoaXMgYXNzdW1lcyB0aGF0IGEgZGF5IGhhcyAyNCBob3VycyAod2hpY2ggaXMgbm90IHRoZSBjYXNlXG5cdCAqIGR1cmluZyBEU1QgY2hhbmdlcykuXG5cdCAqL1xuXHRwdWJsaWMgaG91cigpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LkhvdXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBob3VyIHBhcnQgb2YgdGhlIGR1cmF0aW9uIChhbHdheXMgcG9zaXRpdmUpLlxuXHQgKiBOb3RlIHRoYXQgdGhpcyBwYXJ0IGNhbiBleGNlZWQgMjMgaG91cnMsIGJlY2F1c2UgZm9yXG5cdCAqIG5vdywgd2UgZG8gbm90IGhhdmUgYSBkYXlzKCkgZnVuY3Rpb25cblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcblx0ICogQHJldHVybiBlLmcuIDI1IGZvciBhIC0yNTowMjowMy40MDAgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyB3aG9sZUhvdXJzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBkYXlzIVxuXHQgKi9cblx0cHVibGljIGRheXMoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5EYXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkYXkgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIG1vbnRoIGhhcyAzMCBkYXlzLlxuXHQgKi9cblx0cHVibGljIGRheSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LkRheSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBkYXlzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcblx0ICogVGhpcyBpcyBhcHByb3hpbWF0ZSBpZiB0aGlzIGR1cmF0aW9uIGlzIG5vdCBpbiBNb250aHMgb3IgWWVhcnMhXG5cdCAqL1xuXHRwdWJsaWMgbW9udGhzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTW9udGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtb250aCBwYXJ0IG9mIGEgZHVyYXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5Nb250aCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiB5ZWFycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxuXHQgKi9cblx0cHVibGljIHllYXJzKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuWWVhcik7XG5cdH1cblxuXHQvKipcblx0ICogTm9uLWZyYWN0aW9uYWwgcG9zaXRpdmUgeWVhcnNcblx0ICovXG5cdHB1YmxpYyB3aG9sZVllYXJzKCk6IG51bWJlciB7XG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IFRpbWVVbml0LlllYXIpIHtcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuTW9udGgpIHtcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAxMik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpICogTWF0aC5hYnModGhpcy5fYW1vdW50KSAvXG5cdFx0XHRcdGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKFRpbWVVbml0LlllYXIpKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQW1vdW50IG9mIHVuaXRzIChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbClcblx0ICovXG5cdHB1YmxpYyBhbW91bnQoKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB1bml0IHRoaXMgZHVyYXRpb24gd2FzIGNyZWF0ZWQgd2l0aFxuXHQgKi9cblx0cHVibGljIHVuaXQoKTogVGltZVVuaXQge1xuXHRcdHJldHVybiB0aGlzLl91bml0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNpZ25cblx0ICogQHJldHVybiBcIi1cIiBpZiB0aGUgZHVyYXRpb24gaXMgbmVnYXRpdmVcblx0ICovXG5cdHB1YmxpYyBzaWduKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuICh0aGlzLl9hbW91bnQgPCAwID8gXCItXCIgOiBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcblx0ICovXG5cdHB1YmxpYyBsZXNzVGhhbihvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA8IG90aGVyLm1pbGxpc2Vjb25kcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcblx0ICovXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPD0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2ltaWxhciBidXQgbm90IGlkZW50aWNhbFxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgY29udmVydGVkID0gb3RoZXIuY29udmVydCh0aGlzLl91bml0KTtcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXG5cdCAqIFJldHVybnMgZmFsc2UgaWYgd2UgY2Fubm90IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIGVxdWFsIGluIGFsbCB0aW1lIHpvbmVzXG5cdCAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XG5cdCAqXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cblx0ICovXG5cdHB1YmxpYyBlcXVhbHNFeGFjdChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gb3RoZXIuX3VuaXQpIHtcblx0XHRcdHJldHVybiAodGhpcy5fYW1vdW50ID09PSBvdGhlci5fYW1vdW50KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPj0gVGltZVVuaXQuTW9udGggJiYgb3RoZXIudW5pdCgpID49IFRpbWVVbml0Lk1vbnRoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpOyAvLyBjYW4gY29tcGFyZSBtb250aHMgYW5kIHllYXJzXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0IDwgVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IFRpbWVVbml0LkRheSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZXF1YWxzKG90aGVyKTsgLy8gY2FuIGNvbXBhcmUgbWlsbGlzZWNvbmRzIHRocm91Z2ggaG91cnNcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlOyAvLyBjYW5ub3QgY29tcGFyZSBkYXlzIHRvIGFueXRoaW5nIGVsc2Vcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2FtZSB1bml0IGFuZCBzYW1lIGFtb3VudFxuXHQgKi9cblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBvdGhlci5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBvdGhlci51bml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxuXHQgKi9cblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpID4gb3RoZXIubWlsbGlzZWNvbmRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcblx0ICovXG5cdHB1YmxpYyBncmVhdGVyRXF1YWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPj0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIChtb3N0IG5lZ2F0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxuXHQgKi9cblx0cHVibGljIG1pbihvdGhlcjogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0aWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXG5cdCAqIEByZXR1cm4gVGhlIG1heGltdW0gKG1vc3QgcG9zaXRpdmUpIG9mIHRoaXMgYW5kIG90aGVyXG5cdCAqL1xuXHRwdWJsaWMgbWF4KG90aGVyOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0XHRpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XG5cdFx0fVxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE11bHRpcGx5IHdpdGggYSBmaXhlZCBudW1iZXIuXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAqIHZhbHVlKVxuXHQgKi9cblx0cHVibGljIG11bHRpcGx5KHZhbHVlOiBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgKiB2YWx1ZSwgdGhpcy5fdW5pdCk7XG5cdH1cblxuXHQvKipcblx0ICogRGl2aWRlIGJ5IGEgdW5pdGxlc3MgbnVtYmVyLiBUaGUgcmVzdWx0IGlzIGEgRHVyYXRpb24sIGUuZy4gMSB5ZWFyIC8gMiA9IDAuNSB5ZWFyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAvIHZhbHVlKVxuXHQgKi9cblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb247XG5cdC8qKlxuXHQgKiBEaXZpZGUgdGhpcyBEdXJhdGlvbiBieSBhIER1cmF0aW9uLiBUaGUgcmVzdWx0IGlzIGEgdW5pdGxlc3MgbnVtYmVyIGUuZy4gMSB5ZWFyIC8gMSBtb250aCA9IDEyXG5cdCAqIFRoZSByZXN1bHQgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBhcyBhIHVuaXQgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgbnVtYmVyIChlLmcuIDEgbW9udGggaGFzIHZhcmlhYmxlIGxlbmd0aClcblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyAvIHZhbHVlKVxuXHQgKi9cblx0cHVibGljIGRpdmlkZSh2YWx1ZTogRHVyYXRpb24pOiBudW1iZXI7XG5cdHB1YmxpYyBkaXZpZGUodmFsdWU6IG51bWJlciB8IER1cmF0aW9uKTogRHVyYXRpb24gfCBudW1iZXIge1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEdXJhdGlvbi5kaXZpZGUoKTogRGl2aWRlIGJ5IHplcm9cIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCAvIHZhbHVlLCB0aGlzLl91bml0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHZhbHVlLl9hbW91bnQgPT09IDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24uZGl2aWRlKCk6IERpdmlkZSBieSB6ZXJvIGR1cmF0aW9uXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgLyB2YWx1ZS5taWxsaXNlY29uZHMoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGEgZHVyYXRpb24uXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKyB2YWx1ZSkgd2l0aCB0aGUgdW5pdCBvZiB0aGlzIGR1cmF0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkKHZhbHVlOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCArIHZhbHVlLmFzKHRoaXMuX3VuaXQpLCB0aGlzLl91bml0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdWJ0cmFjdCBhIGR1cmF0aW9uLlxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC0gdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxuXHQgKi9cblx0cHVibGljIHN1Yih2YWx1ZTogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLSB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZHVyYXRpb24gaS5lLiByZW1vdmUgdGhlIHNpZ24uXG5cdCAqL1xuXHRwdWJsaWMgYWJzKCk6IER1cmF0aW9uIHtcblx0XHRpZiAodGhpcy5fYW1vdW50ID49IDApIHtcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLm11bHRpcGx5KC0xKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3RyaW5nIGluIFstXWhoaGg6bW06c3Mubm5uIG5vdGF0aW9uLiBBbGwgZmllbGRzIGFyZVxuXHQgKiBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uXG5cdCAqL1xuXHRwdWJsaWMgdG9GdWxsU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMudG9IbXNTdHJpbmcodHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogU3RyaW5nIGluIFstXWhoaGg6bW1bOnNzWy5ubm5dXSBub3RhdGlvbi5cblx0ICogQHBhcmFtIGZ1bGwgSWYgdHJ1ZSwgdGhlbiBhbGwgZmllbGRzIGFyZSBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uIE90aGVyd2lzZSwgc2Vjb25kcyBhbmQgbWlsbGlzZWNvbmRzXG5cdCAqICAgICAgICAgICAgIGFyZSBjaG9wcGVkIG9mZiBpZiB6ZXJvXG5cdCAqL1xuXHRwdWJsaWMgdG9IbXNTdHJpbmcoZnVsbDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcblx0XHRsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xuXHRcdGlmIChmdWxsIHx8IHRoaXMubWlsbGlzZWNvbmQoKSA+IDApIHtcblx0XHRcdHJlc3VsdCA9IFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWlsbGlzZWNvbmQoKS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcblx0XHR9XG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5zZWNvbmQoKSA+IDApIHtcblx0XHRcdHJlc3VsdCA9IFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuc2Vjb25kKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XG5cdFx0fVxuXHRcdGlmIChmdWxsIHx8IHJlc3VsdC5sZW5ndGggPiAwIHx8IHRoaXMubWludXRlKCkgPiAwKSB7XG5cdFx0XHRyZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbnV0ZSgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zaWduKCkgKyBzdHJpbmdzLnBhZExlZnQodGhpcy53aG9sZUhvdXJzKCkudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogU3RyaW5nIGluIElTTyA4NjAxIG5vdGF0aW9uIGUuZy4gJ1AxTScgZm9yIG9uZSBtb250aCBvciAnUFQxTScgZm9yIG9uZSBtaW51dGVcblx0ICovXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHN3aXRjaCAodGhpcy5fdW5pdCkge1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyAodGhpcy5fYW1vdW50IC8gMTAwMCkudG9GaXhlZCgzKSArIFwiU1wiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiU1wiO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcblx0XHRcdFx0cmV0dXJuIFwiUFRcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjsgLy8gbm90ZSB0aGUgXCJUXCIgdG8gZGlzYW1iaWd1YXRlIHRoZSBcIk1cIlxuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkhcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIkRcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuV2Vlazoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJXXCI7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIk1cIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJZXCI7XG5cdFx0XHR9XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIHdpdGggYW1vdW50IGFuZCB1bml0IGUuZy4gJzEuNSB5ZWFycycgb3IgJy0xIGRheSdcblx0ICovXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCIgXCIgKyBiYXNpY3MudGltZVVuaXRUb1N0cmluZyh0aGlzLl91bml0LCB0aGlzLl9hbW91bnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIHRoaXMgJSB1bml0LCBhbHdheXMgcG9zaXRpdmVcblx0ICovXG5cdHByaXZhdGUgX3BhcnQodW5pdDogVGltZVVuaXQpOiBudW1iZXIge1xuXHRcdGxldCBuZXh0VW5pdDogVGltZVVuaXQ7XG5cdFx0Ly8gbm90ZSBub3QgYWxsIHVuaXRzIGFyZSB1c2VkIGhlcmU6IFdlZWtzIGFuZCBZZWFycyBhcmUgcnVsZWQgb3V0XG5cdFx0c3dpdGNoICh1bml0KSB7XG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiBuZXh0VW5pdCA9IFRpbWVVbml0LlNlY29uZDsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDogbmV4dFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7IGJyZWFrO1xuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IG5leHRVbml0ID0gVGltZVVuaXQuSG91cjsgYnJlYWs7XG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IG5leHRVbml0ID0gVGltZVVuaXQuRGF5OyBicmVhaztcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiBuZXh0VW5pdCA9IFRpbWVVbml0Lk1vbnRoOyBicmVhaztcblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IG5leHRVbml0ID0gVGltZVVuaXQuWWVhcjsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLmFzKFRpbWVVbml0LlllYXIpKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbXNlY3MgPSAoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpKSAlIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKG5leHRVbml0KTtcblx0XHRyZXR1cm4gTWF0aC5mbG9vcihtc2VjcyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQpKTtcblx0fVxuXG5cblx0cHJpdmF0ZSBfZnJvbVN0cmluZyhzOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCB0cmltbWVkID0gcy50cmltKCk7XG5cdFx0aWYgKHRyaW1tZWQubWF0Y2goL14tP1xcZFxcZD8oOlxcZFxcZD8oOlxcZFxcZD8oLlxcZFxcZD9cXGQ/KT8pPyk/JC8pKSB7XG5cdFx0XHRsZXQgc2lnbjogbnVtYmVyID0gMTtcblx0XHRcdGxldCBob3VyczogbnVtYmVyID0gMDtcblx0XHRcdGxldCBtaW51dGVzOiBudW1iZXIgPSAwO1xuXHRcdFx0bGV0IHNlY29uZHM6IG51bWJlciA9IDA7XG5cdFx0XHRsZXQgbWlsbGlzZWNvbmRzOiBudW1iZXIgPSAwO1xuXHRcdFx0Y29uc3QgcGFydHM6IHN0cmluZ1tdID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XG5cdFx0XHRhc3NlcnQocGFydHMubGVuZ3RoID4gMCAmJiBwYXJ0cy5sZW5ndGggPCA0LCBcIk5vdCBhIHByb3BlciB0aW1lIGR1cmF0aW9uIHN0cmluZzogXFxcIlwiICsgdHJpbW1lZCArIFwiXFxcIlwiKTtcblx0XHRcdGlmICh0cmltbWVkLmNoYXJBdCgwKSA9PT0gXCItXCIpIHtcblx0XHRcdFx0c2lnbiA9IC0xO1xuXHRcdFx0XHRwYXJ0c1swXSA9IHBhcnRzWzBdLnN1YnN0cigxKTtcblx0XHRcdH1cblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGhvdXJzID0gK3BhcnRzWzBdO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0bWludXRlcyA9ICtwYXJ0c1sxXTtcblx0XHRcdH1cblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdGNvbnN0IHNlY29uZFBhcnRzID0gcGFydHNbMl0uc3BsaXQoXCIuXCIpO1xuXHRcdFx0XHRzZWNvbmRzID0gK3NlY29uZFBhcnRzWzBdO1xuXHRcdFx0XHRpZiAoc2Vjb25kUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdG1pbGxpc2Vjb25kcyA9ICtzdHJpbmdzLnBhZFJpZ2h0KHNlY29uZFBhcnRzWzFdLCAzLCBcIjBcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNvbnN0IGFtb3VudE1zZWMgPSBzaWduICogTWF0aC5yb3VuZChtaWxsaXNlY29uZHMgKyAxMDAwICogc2Vjb25kcyArIDYwMDAwICogbWludXRlcyArIDM2MDAwMDAgKiBob3Vycyk7XG5cdFx0XHQvLyBmaW5kIGxvd2VzdCBub24temVybyBudW1iZXIgYW5kIHRha2UgdGhhdCBhcyB1bml0XG5cdFx0XHRpZiAobWlsbGlzZWNvbmRzICE9PSAwKSB7XG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcblx0XHRcdH0gZWxzZSBpZiAoc2Vjb25kcyAhPT0gMCkge1xuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuU2Vjb25kO1xuXHRcdFx0fSBlbHNlIGlmIChtaW51dGVzICE9PSAwKSB7XG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaW51dGU7XG5cdFx0XHR9IGVsc2UgaWYgKGhvdXJzICE9PSAwKSB7XG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5Ib3VyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fdW5pdCA9IFRpbWVVbml0Lk1pbGxpc2Vjb25kO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50TXNlYyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzcGxpdCA9IHRyaW1tZWQudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik7XG5cdFx0XHRpZiAoc3BsaXQubGVuZ3RoICE9PSAyKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGFtb3VudCA9IHBhcnNlRmxvYXQoc3BsaXRbMF0pO1xuXHRcdFx0YXNzZXJ0KCFpc05hTihhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgY2Fubm90IHBhcnNlIGFtb3VudFwiKTtcblx0XHRcdGFzc2VydChpc0Zpbml0ZShhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgYW1vdW50IGlzIGluZmluaXRlXCIpO1xuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xuXHRcdFx0dGhpcy5fdW5pdCA9IGJhc2ljcy5zdHJpbmdUb1RpbWVVbml0KHNwbGl0WzFdKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBvYmplY3QgaXMgb2YgdHlwZSBEdXJhdGlvbi4gTm90ZSB0aGF0IGl0IGRvZXMgbm90IHdvcmsgZm9yIHN1YiBjbGFzc2VzLiBIb3dldmVyLCB1c2UgdGhpcyB0byBiZSByb2J1c3RcbiAqIGFnYWluc3QgZGlmZmVyZW50IHZlcnNpb25zIG9mIHRoZSBsaWJyYXJ5IGluIG9uZSBwcm9jZXNzIGluc3RlYWQgb2YgaW5zdGFuY2VvZlxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGNoZWNrXG4gKiBAdGhyb3dzIG5vdGhpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRHVyYXRpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIER1cmF0aW9uIHtcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5raW5kID09PSBcIkR1cmF0aW9uXCI7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogRnVuY3Rpb25hbGl0eSB0byBwYXJzZSBhIERhdGVUaW1lIG9iamVjdCB0byBhIHN0cmluZ1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgeyBUaW1lU3RydWN0IH0gZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgKiBhcyBiYXNpY3MgZnJvbSBcIi4vYmFzaWNzXCI7XG5pbXBvcnQgeyBERUZBVUxUX0xPQ0FMRSwgTG9jYWxlLCBQYXJ0aWFsTG9jYWxlIH0gZnJvbSBcIi4vbG9jYWxlXCI7XG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gXCIuL3N0cmluZ3NcIjtcbmltcG9ydCB7IFRpbWVab25lIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcbmltcG9ydCB7IFRva2VuLCB0b2tlbml6ZSwgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcblxuXG4vKipcbiAqIEZvcm1hdCB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgd2l0aCB0aGUgZm9ybWF0dGluZyBzdHJpbmcuXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdXRjVGltZSBUaGUgdGltZSBpbiBVVENcbiAqIEBwYXJhbSBsb2NhbFpvbmUgVGhlIHpvbmUgdGhhdCBjdXJyZW50VGltZSBpcyBpblxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgTERNTCBmb3JtYXQgcGF0dGVybiAoc2VlIExETUwubWQpXG4gKiBAcGFyYW0gbG9jYWxlIE90aGVyIGZvcm1hdCBvcHRpb25zIHN1Y2ggYXMgbW9udGggbmFtZXNcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXQoXG5cdGRhdGVUaW1lOiBUaW1lU3RydWN0LFxuXHR1dGNUaW1lOiBUaW1lU3RydWN0LFxuXHRsb2NhbFpvbmU6IFRpbWVab25lIHwgdW5kZWZpbmVkIHwgbnVsbCxcblx0Zm9ybWF0U3RyaW5nOiBzdHJpbmcsXG5cdGxvY2FsZTogUGFydGlhbExvY2FsZSA9IHt9XG4pOiBzdHJpbmcge1xuXHRjb25zdCBtZXJnZWRMb2NhbGU6IExvY2FsZSA9IHtcblx0XHQuLi5ERUZBVUxUX0xPQ0FMRSxcblx0XHQuLi5sb2NhbGVcblx0fTtcblxuXHRjb25zdCB0b2tlbnM6IFRva2VuW10gPSB0b2tlbml6ZShmb3JtYXRTdHJpbmcpO1xuXHRsZXQgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xuXHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdGxldCB0b2tlblJlc3VsdDogc3RyaW5nO1xuXHRcdHN3aXRjaCAodG9rZW4udHlwZSkge1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRFcmEoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdFllYXIoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5RVUFSVEVSOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXRRdWFydGVyKGRhdGVUaW1lLCB0b2tlbiwgbWVyZ2VkTG9jYWxlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5NT05USDpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0TW9udGgoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWTpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0RGF5KGRhdGVUaW1lLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFS0RBWTpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2Vla2RheShkYXRlVGltZSwgdG9rZW4sIG1lcmdlZExvY2FsZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZUEVSSU9EOlxuXHRcdFx0XHR0b2tlblJlc3VsdCA9IF9mb3JtYXREYXlQZXJpb2QoZGF0ZVRpbWUsIHRva2VuLCBtZXJnZWRMb2NhbGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLkhPVVI6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdEhvdXIoZGF0ZVRpbWUsIHRva2VuKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gX2Zvcm1hdE1pbnV0ZShkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLlNFQ09ORDpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0U2Vjb25kKGRhdGVUaW1lLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuWk9ORTpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0Wm9uZShkYXRlVGltZSwgdXRjVGltZSwgbG9jYWxab25lID8gbG9jYWxab25lIDogdW5kZWZpbmVkLCB0b2tlbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBUb2tlblR5cGUuV0VFSzpcblx0XHRcdFx0dG9rZW5SZXN1bHQgPSBfZm9ybWF0V2VlayhkYXRlVGltZSwgdG9rZW4pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVG9rZW5UeXBlLklERU5USVRZOiAvLyBpbnRlbnRpb25hbCBmYWxsdGhyb3VnaFxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRva2VuUmVzdWx0ID0gdG9rZW4ucmF3O1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmVzdWx0ICs9IHRva2VuUmVzdWx0O1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdC50cmltKCk7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBlcmEgKEJDIG9yIEFEKVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRFcmEoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgbG9jYWxlOiBMb2NhbGUpOiBzdHJpbmcge1xuXHRjb25zdCBBRDogYm9vbGVhbiA9IGRhdGVUaW1lLnllYXIgPiAwO1xuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDI6XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIChBRCA/IGxvY2FsZS5lcmFBYmJyZXZpYXRlZFswXSA6IGxvY2FsZS5lcmFBYmJyZXZpYXRlZFsxXSk7XG5cdFx0Y2FzZSA0OlxuXHRcdFx0cmV0dXJuIChBRCA/IGxvY2FsZS5lcmFXaWRlWzBdIDogbG9jYWxlLmVyYVdpZGVbMV0pO1xuXHRcdGNhc2UgNTpcblx0XHRcdHJldHVybiAoQUQgPyBsb2NhbGUuZXJhTmFycm93WzBdIDogbG9jYWxlLmVyYU5hcnJvd1sxXSk7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSB5ZWFyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFllYXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcInlcIjpcblx0XHRjYXNlIFwiWVwiOlxuXHRcdGNhc2UgXCJyXCI6XG5cdFx0XHRsZXQgeWVhclZhbHVlID0gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLnllYXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID09PSAyKSB7IC8vIFNwZWNpYWwgY2FzZTogZXhhY3RseSB0d28gY2hhcmFjdGVycyBhcmUgZXhwZWN0ZWRcblx0XHRcdFx0eWVhclZhbHVlID0geWVhclZhbHVlLnNsaWNlKC0yKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB5ZWFyVmFsdWU7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBxdWFydGVyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFF1YXJ0ZXIoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbiwgbG9jYWxlOiBMb2NhbGUpOiBzdHJpbmcge1xuXHRjb25zdCBxdWFydGVyID0gTWF0aC5jZWlsKGRhdGVUaW1lLm1vbnRoIC8gMyk7XG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcIlFcIjpcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnF1YXJ0ZXJMZXR0ZXIgKyBxdWFydGVyO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5xdWFydGVyQWJicmV2aWF0aW9uc1txdWFydGVyIC0gMV0gKyBcIiBcIiArIGxvY2FsZS5xdWFydGVyV29yZDtcblx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdFx0XHR9XG5cdFx0Y2FzZSBcInFcIjpcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQocXVhcnRlci50b1N0cmluZygpLCAyLCBcIjBcIik7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyTGV0dGVyICsgcXVhcnRlcjtcblx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zW3F1YXJ0ZXIgLSAxXSArIFwiIFwiICsgbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyV29yZDtcblx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdHJldHVybiBxdWFydGVyLnRvU3RyaW5nKCk7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdFx0XHR9XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHRocm93IG5ldyBFcnJvcihcImludmFsaWQgcXVhcnRlciBwYXR0ZXJuXCIpO1xuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBtb250aFxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRNb250aChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBsb2NhbGU6IExvY2FsZSk6IHN0cmluZyB7XG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcIk1cIjpcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubW9udGgudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLnNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5sb25nTW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuXHRcdFx0XHRjYXNlIDU6XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5tb250aExldHRlcnNbZGF0ZVRpbWUubW9udGggLSAxXTtcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0XHRcdH1cblx0XHRjYXNlIFwiTFwiOlxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5tb250aC50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZVNob3J0TW9udGhOYW1lc1tkYXRlVGltZS5tb250aCAtIDFdO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5zdGFuZEFsb25lTG9uZ01vbnRoTmFtZXNbZGF0ZVRpbWUubW9udGggLSAxXTtcblx0XHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuc3RhbmRBbG9uZU1vbnRoTGV0dGVyc1tkYXRlVGltZS5tb250aCAtIDFdO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHRcdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIG1vbnRoIHBhdHRlcm5cIik7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHdlZWsgbnVtYmVyXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFdlZWsoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGlmICh0b2tlbi5zeW1ib2wgPT09IFwid1wiKSB7XG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChiYXNpY3Mud2Vla051bWJlcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrT2ZNb250aChkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgZGF5IG9mIHRoZSBtb250aCAob3IgeWVhcilcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0RGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4pOiBzdHJpbmcge1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJkXCI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRhdGVUaW1lLmRheS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRjYXNlIFwiRFwiOlxuXHRcdFx0Y29uc3QgZGF5T2ZZZWFyID0gYmFzaWNzLmRheU9mWWVhcihkYXRlVGltZS55ZWFyLCBkYXRlVGltZS5tb250aCwgZGF0ZVRpbWUuZGF5KSArIDE7XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGRheU9mWWVhci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIGRheSBvZiB0aGUgd2Vla1xuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRXZWVrZGF5KGRhdGVUaW1lOiBUaW1lU3RydWN0LCB0b2tlbjogVG9rZW4sIGxvY2FsZTogTG9jYWxlKTogc3RyaW5nIHtcblx0Y29uc3Qgd2Vla0RheU51bWJlciA9IGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKTtcblxuXHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDI6XG5cdFx0XHRpZiAodG9rZW4uc3ltYm9sID09PSBcImVcIikge1xuXHRcdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy53ZWVrRGF5Tm9MZWFwU2VjcyhkYXRlVGltZS51bml4TWlsbGlzKS50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBsb2NhbGUuc2hvcnRXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG5cdFx0XHR9XG5cdFx0Y2FzZSAzOlxuXHRcdFx0cmV0dXJuIGxvY2FsZS5zaG9ydFdlZWtkYXlOYW1lc1t3ZWVrRGF5TnVtYmVyXTtcblx0XHRjYXNlIDQ6XG5cdFx0XHRyZXR1cm4gbG9jYWxlLmxvbmdXZWVrZGF5TmFtZXNbd2Vla0RheU51bWJlcl07XG5cdFx0Y2FzZSA1OlxuXHRcdFx0cmV0dXJuIGxvY2FsZS53ZWVrZGF5TGV0dGVyc1t3ZWVrRGF5TnVtYmVyXTtcblx0XHRjYXNlIDY6XG5cdFx0XHRyZXR1cm4gbG9jYWxlLndlZWtkYXlUd29MZXR0ZXJzW3dlZWtEYXlOdW1iZXJdO1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0fVxufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgRGF5IFBlcmlvZCAoQU0gb3IgUE0pXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdERheVBlcmlvZChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuLCBsb2NhbGU6IExvY2FsZSk6IHN0cmluZyB7XG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcImFcIjoge1xuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA8PSAzKSB7XG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodG9rZW4ubGVuZ3RoID09PSA0KSB7XG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUuYW07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2RXaWRlLnBtO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoZGF0ZVRpbWUuaG91ciA8IDEyKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cucG07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y2FzZSBcImJcIjpcblx0XHRjYXNlIFwiQlwiOiB7XG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoIDw9IDMpIHtcblx0XHRcdFx0aWYgKGRhdGVUaW1lLmhvdXIgPT09IDAgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubWlkbmlnaHQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubm9vbjtcblx0XHRcdFx0fSBlbHNlIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLmFtO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodG9rZW4ubGVuZ3RoID09PSA0KSB7XG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGF0ZVRpbWUuaG91ciA9PT0gMTIgJiYgZGF0ZVRpbWUubWludXRlID09PSAwICYmIGRhdGVUaW1lLnNlY29uZCA9PT0gMCAmJiBkYXRlVGltZS5taWxsaSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5ub29uO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRhdGVUaW1lLmhvdXIgPCAxMikge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZFdpZGUucG07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChkYXRlVGltZS5ob3VyID09PSAwICYmIGRhdGVUaW1lLm1pbnV0ZSA9PT0gMCAmJiBkYXRlVGltZS5zZWNvbmQgPT09IDAgJiYgZGF0ZVRpbWUubWlsbGkgPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5taWRuaWdodDtcblx0XHRcdFx0fSBlbHNlIGlmIChkYXRlVGltZS5ob3VyID09PSAxMiAmJiBkYXRlVGltZS5taW51dGUgPT09IDAgJiYgZGF0ZVRpbWUuc2Vjb25kID09PSAwICYmIGRhdGVUaW1lLm1pbGxpID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsZS5kYXlQZXJpb2ROYXJyb3cubm9vbjtcblx0XHRcdFx0fSBlbHNlIGlmIChkYXRlVGltZS5ob3VyIDwgMTIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5hbTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5wbTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIEhvdXJcbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWUgVGhlIGN1cnJlbnQgdGltZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0SG91cihkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcblx0bGV0IGhvdXIgPSBkYXRlVGltZS5ob3VyO1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJoXCI6XG5cdFx0XHRob3VyID0gaG91ciAlIDEyO1xuXHRcdFx0aWYgKGhvdXIgPT09IDApIHtcblx0XHRcdFx0aG91ciA9IDEyO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChob3VyLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xuXHRcdGNhc2UgXCJIXCI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcIktcIjpcblx0XHRcdGhvdXIgPSBob3VyICUgMTI7XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGhvdXIudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcImtcIjpcblx0XHRcdGlmIChob3VyID09PSAwKSB7XG5cdFx0XHRcdGhvdXIgPSAyNDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQoaG91ci50b1N0cmluZygpLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdH1cbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIG1pbnV0ZVxuICpcbiAqIEBwYXJhbSBkYXRlVGltZSBUaGUgY3VycmVudCB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbiBwYXNzZWRcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIF9mb3JtYXRNaW51dGUoZGF0ZVRpbWU6IFRpbWVTdHJ1Y3QsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdHJldHVybiBzdHJpbmdzLnBhZExlZnQoZGF0ZVRpbWUubWludXRlLnRvU3RyaW5nKCksIHRva2VuLmxlbmd0aCwgXCIwXCIpO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgc2Vjb25kcyAob3IgZnJhY3Rpb24gb2YgYSBzZWNvbmQpXG4gKlxuICogQHBhcmFtIGRhdGVUaW1lIFRoZSBjdXJyZW50IHRpbWUgdG8gZm9ybWF0XG4gKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuIHBhc3NlZFxuICogQHJldHVybiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gX2Zvcm1hdFNlY29uZChkYXRlVGltZTogVGltZVN0cnVjdCwgdG9rZW46IFRva2VuKTogc3RyaW5nIHtcblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwic1wiOlxuXHRcdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdChkYXRlVGltZS5zZWNvbmQudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0Y2FzZSBcIlNcIjpcblx0XHRcdGNvbnN0IGZyYWN0aW9uID0gZGF0ZVRpbWUubWlsbGk7XG5cdFx0XHRsZXQgZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZExlZnQoZnJhY3Rpb24udG9TdHJpbmcoKSwgMywgXCIwXCIpO1xuXHRcdFx0ZnJhY3Rpb25TdHJpbmcgPSBzdHJpbmdzLnBhZFJpZ2h0KGZyYWN0aW9uU3RyaW5nLCB0b2tlbi5sZW5ndGgsIFwiMFwiKTtcblx0XHRcdHJldHVybiBmcmFjdGlvblN0cmluZy5zbGljZSgwLCB0b2tlbi5sZW5ndGgpO1xuXHRcdGNhc2UgXCJBXCI6XG5cdFx0XHRyZXR1cm4gc3RyaW5ncy5wYWRMZWZ0KGJhc2ljcy5zZWNvbmRPZkRheShkYXRlVGltZS5ob3VyLCBkYXRlVGltZS5taW51dGUsIGRhdGVUaW1lLnNlY29uZCkudG9TdHJpbmcoKSwgdG9rZW4ubGVuZ3RoLCBcIjBcIik7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHR9XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSB0aW1lIHpvbmUuIEZvciB0aGlzLCB3ZSBuZWVkIHRoZSBjdXJyZW50IHRpbWUsIHRoZSB0aW1lIGluIFVUQyBhbmQgdGhlIHRpbWUgem9uZVxuICogQHBhcmFtIGN1cnJlbnRUaW1lIFRoZSB0aW1lIHRvIGZvcm1hdFxuICogQHBhcmFtIHV0Y1RpbWUgVGhlIHRpbWUgaW4gVVRDXG4gKiBAcGFyYW0gem9uZSBUaGUgdGltZXpvbmUgY3VycmVudFRpbWUgaXMgaW5cbiAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4gcGFzc2VkXG4gKiBAcmV0dXJuIHN0cmluZ1xuICovXG5mdW5jdGlvbiBfZm9ybWF0Wm9uZShjdXJyZW50VGltZTogVGltZVN0cnVjdCwgdXRjVGltZTogVGltZVN0cnVjdCwgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQsIHRva2VuOiBUb2tlbik6IHN0cmluZyB7XG5cdGlmICghem9uZSkge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cdGNvbnN0IG9mZnNldCA9IE1hdGgucm91bmQoKGN1cnJlbnRUaW1lLnVuaXhNaWxsaXMgLSB1dGNUaW1lLnVuaXhNaWxsaXMpIC8gNjAwMDApO1xuXG5cdGNvbnN0IG9mZnNldEhvdXJzOiBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGguYWJzKG9mZnNldCkgLyA2MCk7XG5cdGxldCBvZmZzZXRIb3Vyc1N0cmluZyA9IHN0cmluZ3MucGFkTGVmdChvZmZzZXRIb3Vycy50b1N0cmluZygpLCAyLCBcIjBcIik7XG5cdG9mZnNldEhvdXJzU3RyaW5nID0gKG9mZnNldCA+PSAwID8gXCIrXCIgKyBvZmZzZXRIb3Vyc1N0cmluZyA6IFwiLVwiICsgb2Zmc2V0SG91cnNTdHJpbmcpO1xuXHRjb25zdCBvZmZzZXRNaW51dGVzID0gTWF0aC5hYnMob2Zmc2V0ICUgNjApO1xuXHRjb25zdCBvZmZzZXRNaW51dGVzU3RyaW5nID0gc3RyaW5ncy5wYWRMZWZ0KG9mZnNldE1pbnV0ZXMudG9TdHJpbmcoKSwgMiwgXCIwXCIpO1xuXHRsZXQgcmVzdWx0OiBzdHJpbmc7XG5cblx0c3dpdGNoICh0b2tlbi5zeW1ib2wpIHtcblx0XHRjYXNlIFwiT1wiOlxuXHRcdFx0cmVzdWx0ID0gXCJHTVRcIjtcblx0XHRcdGlmIChvZmZzZXQgPj0gMCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gXCIrXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQgKz0gXCItXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXN1bHQgKz0gb2Zmc2V0SG91cnMudG9TdHJpbmcoKTtcblx0XHRcdGlmICh0b2tlbi5sZW5ndGggPj0gNCB8fCBvZmZzZXRNaW51dGVzICE9PSAwKSB7XG5cdFx0XHRcdHJlc3VsdCArPSBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHR9XG5cdFx0XHRpZiAodG9rZW4ubGVuZ3RoID4gNCkge1xuXHRcdFx0XHRyZXN1bHQgKz0gdG9rZW4ucmF3LnNsaWNlKDQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRjYXNlIFwiWlwiOlxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0Y29uc3QgbmV3VG9rZW46IFRva2VuID0ge1xuXHRcdFx0XHRcdFx0bGVuZ3RoOiA0LFxuXHRcdFx0XHRcdFx0cmF3OiBcIk9PT09cIixcblx0XHRcdFx0XHRcdHN5bWJvbDogXCJPXCIsXG5cdFx0XHRcdFx0XHR0eXBlOiBUb2tlblR5cGUuWk9ORVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cmV0dXJuIF9mb3JtYXRab25lKGN1cnJlbnRUaW1lLCB1dGNUaW1lLCB6b25lLCBuZXdUb2tlbik7XG5cdFx0XHRcdGNhc2UgNTpcblx0XHRcdFx0XHRpZiAob2Zmc2V0ID09PSAwKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJaXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvZmZzZXRIb3Vyc1N0cmluZyArIFwiOlwiICsgb2Zmc2V0TWludXRlc1N0cmluZztcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0XHRcdH1cblx0XHRjYXNlIFwielwiOlxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIHRydWUpO1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIHpvbmUudG9TdHJpbmcoKTtcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHQvLyB0b2tlbml6ZXIgc2hvdWxkIHByZXZlbnQgdGhpc1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0cmV0dXJuIHRva2VuLnJhdztcblx0XHRcdH1cblx0XHRjYXNlIFwidlwiOlxuXHRcdFx0aWYgKHRva2VuLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRyZXR1cm4gem9uZS5hYmJyZXZpYXRpb25Gb3JVdGMoY3VycmVudFRpbWUsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB6b25lLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0Y2FzZSBcIlZcIjpcblx0XHRcdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHQvLyBOb3QgaW1wbGVtZW50ZWRcblx0XHRcdFx0XHRyZXR1cm4gXCJ1bmtcIjtcblx0XHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRcdHJldHVybiB6b25lLm5hbWUoKTtcblx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0cmV0dXJuIFwiVW5rbm93blwiO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIHRva2VuaXplciBzaG91bGQgcHJldmVudCB0aGlzXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHRcdFx0fVxuXHRcdGNhc2UgXCJYXCI6XG5cdFx0Y2FzZSBcInhcIjpcblx0XHRcdGlmICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIG9mZnNldCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gXCJaXCI7XG5cdFx0XHR9XG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0cmVzdWx0ID0gb2Zmc2V0SG91cnNTdHJpbmc7XG5cdFx0XHRcdFx0aWYgKG9mZnNldE1pbnV0ZXMgIT09IDApIHtcblx0XHRcdFx0XHRcdHJlc3VsdCArPSBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGNhc2UgNDogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBvZmZzZXRNaW51dGVzU3RyaW5nO1xuXHRcdFx0XHRjYXNlIDM6XG5cdFx0XHRcdGNhc2UgNTogLy8gTm8gc2Vjb25kcyBpbiBvdXIgaW1wbGVtZW50YXRpb24sIHNvIHRoaXMgaXMgdGhlIHNhbWVcblx0XHRcdFx0XHRyZXR1cm4gb2Zmc2V0SG91cnNTdHJpbmcgKyBcIjpcIiArIG9mZnNldE1pbnV0ZXNTdHJpbmc7XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdHJldHVybiB0b2tlbi5yYXc7XG5cdFx0XHR9XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0Ly8gdG9rZW5pemVyIHNob3VsZCBwcmV2ZW50IHRoaXNcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRyZXR1cm4gdG9rZW4ucmF3O1xuXHR9XG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBHbG9iYWwgZnVuY3Rpb25zIGRlcGVuZGluZyBvbiBEYXRlVGltZS9EdXJhdGlvbiBldGNcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGFzc2VydCBmcm9tIFwiLi9hc3NlcnRcIjtcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSBcIi4vZGF0ZXRpbWVcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihkMTogRGF0ZVRpbWUsIGQyOiBEYXRlVGltZSk6IERhdGVUaW1lO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEdXJhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihkMTogRHVyYXRpb24sIGQyOiBEdXJhdGlvbik6IER1cmF0aW9uO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byBEYXRlVGltZXMgb3IgRHVyYXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4oZDE6IERhdGVUaW1lIHwgRHVyYXRpb24sIGQyOiBEYXRlVGltZSB8IER1cmF0aW9uKTogRGF0ZVRpbWUgfCBEdXJhdGlvbiB7XG5cdGFzc2VydChkMSwgXCJmaXJzdCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0YXNzZXJ0KGQyLCBcInNlY29uZCBhcmd1bWVudCBpcyBmYWxzeVwiKTtcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0YXNzZXJ0KGQxLmtpbmQgPT09IGQyLmtpbmQsIFwiZXhwZWN0ZWQgZWl0aGVyIHR3byBkYXRldGltZXMgb3IgdHdvIGR1cmF0aW9uc1wiKTtcblx0cmV0dXJuIChkMSBhcyBhbnkpLm1pbihkMik7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IERhdGVUaW1lLCBkMjogRGF0ZVRpbWUpOiBEYXRlVGltZTtcbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRHVyYXRpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgoZDE6IER1cmF0aW9uLCBkMjogRHVyYXRpb24pOiBEdXJhdGlvbjtcbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gRGF0ZVRpbWVzIG9yIER1cmF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KGQxOiBEYXRlVGltZSB8IER1cmF0aW9uLCBkMjogRGF0ZVRpbWUgfCBEdXJhdGlvbik6IERhdGVUaW1lIHwgRHVyYXRpb24ge1xuXHRhc3NlcnQoZDEsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdGFzc2VydChkMiwgXCJzZWNvbmQgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdGFzc2VydChkMS5raW5kID09PSBkMi5raW5kLCBcImV4cGVjdGVkIGVpdGhlciB0d28gZGF0ZXRpbWVzIG9yIHR3byBkdXJhdGlvbnNcIik7XG5cdHJldHVybiAoZDEgYXMgYW55KS5tYXgoZDIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHZhbHVlIG9mIGEgRHVyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFicyhkOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcblx0YXNzZXJ0KGQsIFwiZmlyc3QgYXJndW1lbnQgaXMgZmFsc3lcIik7XG5cdHJldHVybiBkLmFicygpO1xufVxuXG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcbiAqIHZhbHVlcywgb3Igd2UgY2FuIHRha2UgZ2V0VVRDWWVhcigpLCBnZXRVdGNNb250aCgpIGV0YyB0byBkbyB0aGF0LlxuICovXG5leHBvcnQgZW51bSBEYXRlRnVuY3Rpb25zIHtcblx0LyoqXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXG5cdCAqL1xuXHRHZXQsXG5cdC8qKlxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxuXHQgKi9cblx0R2V0VVRDXG59XG5cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTcgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqL1xuXG4vKipcbiAqIEZpeGVkIGRheSBwZXJpb2QgcnVsZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXlQZXJpb2Qge1xuXHRhbTogc3RyaW5nO1xuXHRwbTogc3RyaW5nO1xuXHRtaWRuaWdodDogc3RyaW5nO1xuXHRub29uOiBzdHJpbmc7XG59XG5cbi8qKlxuICogTG9jYWxlIGZvciBmb3JtYXR0aW5nXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxlIHtcblx0LyoqXG5cdCAqIEVyYSBuYW1lczogQUQsIEJDXG5cdCAqL1xuXHRlcmFOYXJyb3c6IFtzdHJpbmcsIHN0cmluZ107XG5cdGVyYVdpZGU6IFtzdHJpbmcsIHN0cmluZ107XG5cdGVyYUFiYnJldmlhdGVkOiBbc3RyaW5nLCBzdHJpbmddO1xuXG5cdC8qKlxuXHQgKiBUaGUgbGV0dGVyIGluZGljYXRpbmcgYSBxdWFydGVyIGUuZy4gXCJRXCIgKGJlY29tZXMgUTEsIFEyLCBRMywgUTQpXG5cdCAqL1xuXHRxdWFydGVyTGV0dGVyOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXG5cdCAqL1xuXHRxdWFydGVyV29yZDogc3RyaW5nO1xuXHQvKipcblx0ICogUXVhcnRlciBhYmJyZXZpYXRpb25zIGUuZy4gMXN0LCAybmQsIDNyZCwgNHRoXG5cdCAqL1xuXHRxdWFydGVyQWJicmV2aWF0aW9uczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIEluIHNvbWUgbGFuZ3VhZ2VzLCBxdWFydGVycyBuZWVkIGRpZmZlcmVudCBuYW1lcyB3aGVuIHVzZWQgc3RhbmQtYWxvbmVcblx0ICovXG5cdHN0YW5kQWxvbmVRdWFydGVyTGV0dGVyOiBzdHJpbmc7XG5cdHN0YW5kQWxvbmVRdWFydGVyV29yZDogc3RyaW5nO1xuXHRzdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnM6IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBNb250aCBuYW1lc1xuXHQgKi9cblx0bG9uZ01vbnRoTmFtZXM6IHN0cmluZ1tdO1xuXHQvKipcblx0ICogVGhyZWUtbGV0dGVyIG1vbnRoIG5hbWVzXG5cdCAqL1xuXHRzaG9ydE1vbnRoTmFtZXM6IHN0cmluZ1tdO1xuXHQvKipcblx0ICogTW9udGggbGV0dGVyc1xuXHQgKi9cblx0bW9udGhMZXR0ZXJzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogSW4gc29tZSBsYW5ndWFnZXMsIG1vbnRocyBuZWVkIGRpZmZlcmVudCBuYW1lcyB3aGVuIHVzZWQgc3RhbmQtYWxvbmVcblx0ICovXG5cdHN0YW5kQWxvbmVMb25nTW9udGhOYW1lczogc3RyaW5nW107XG5cdHN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM6IHN0cmluZ1tdO1xuXHRzdGFuZEFsb25lTW9udGhMZXR0ZXJzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV2VlayBkYXkgbmFtZXMsIHN0YXJ0aW5nIHdpdGggc3VuZGF5XG5cdCAqL1xuXHRsb25nV2Vla2RheU5hbWVzOiBzdHJpbmdbXTtcblx0c2hvcnRXZWVrZGF5TmFtZXM6IHN0cmluZ1tdO1xuXHR3ZWVrZGF5VHdvTGV0dGVyczogc3RyaW5nW107XG5cdHdlZWtkYXlMZXR0ZXJzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogRml4ZWQgZGF5IHBlcmlvZCBuYW1lcyAoQU0vUE0vbm9vbi9taWRuaWdodCwgZm9ybWF0ICdhJyBhbmQgJ2InKVxuXHQgKi9cblx0ZGF5UGVyaW9kTmFycm93OiBEYXlQZXJpb2Q7XG5cdGRheVBlcmlvZFdpZGU6IERheVBlcmlvZDtcblx0ZGF5UGVyaW9kQWJicmV2aWF0ZWQ6IERheVBlcmlvZDtcbn1cblxuXG4vLyB0b2RvIHRoaXMgY2FuIGJlIFBhcnRpYWw8Rm9ybWF0T3B0aW9ucz4gYnV0IGZvciBjb21wYXRpYmlsaXR5IHdpdGhcbi8vIHByZS0yLjEgdHlwZXNjcmlwdCB1c2VycyB3ZSB3cml0ZSB0aGlzIG91dCBvdXJzZWx2ZXMgZm9yIGEgd2hpbGUgeWV0XG5leHBvcnQgaW50ZXJmYWNlIFBhcnRpYWxMb2NhbGUge1xuXHQvKipcblx0ICogRXJhIG5hbWVzOiBBRCwgQkNcblx0ICovXG5cdGVyYU5hcnJvdz86IFtzdHJpbmcsIHN0cmluZ107XG5cdGVyYVdpZGU/OiBbc3RyaW5nLCBzdHJpbmddO1xuXHRlcmFBYmJyZXZpYXRlZD86IFtzdHJpbmcsIHN0cmluZ107XG5cblx0LyoqXG5cdCAqIFRoZSBsZXR0ZXIgaW5kaWNhdGluZyBhIHF1YXJ0ZXIgZS5nLiBcIlFcIiAoYmVjb21lcyBRMSwgUTIsIFEzLCBRNClcblx0ICovXG5cdHF1YXJ0ZXJMZXR0ZXI/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgd29yZCBmb3IgJ3F1YXJ0ZXInXG5cdCAqL1xuXHRxdWFydGVyV29yZD86IHN0cmluZztcblx0LyoqXG5cdCAqIFF1YXJ0ZXIgYWJicmV2aWF0aW9ucyBlLmcuIDFzdCwgMm5kLCAzcmQsIDR0aFxuXHQgKi9cblx0cXVhcnRlckFiYnJldmlhdGlvbnM/OiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogSW4gc29tZSBsYW5ndWFnZXMsIHF1YXJ0ZXJzIG5lZWQgZGlmZmVyZW50IG5hbWVzIHdoZW4gdXNlZCBzdGFuZC1hbG9uZVxuXHQgKi9cblx0c3RhbmRBbG9uZVF1YXJ0ZXJMZXR0ZXI/OiBzdHJpbmc7XG5cdHN0YW5kQWxvbmVRdWFydGVyV29yZD86IHN0cmluZztcblx0c3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zPzogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIE1vbnRoIG5hbWVzXG5cdCAqL1xuXHRsb25nTW9udGhOYW1lcz86IHN0cmluZ1tdO1xuXHQvKipcblx0ICogVGhyZWUtbGV0dGVyIG1vbnRoIG5hbWVzXG5cdCAqL1xuXHRzaG9ydE1vbnRoTmFtZXM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIE1vbnRoIGxldHRlcnNcblx0ICovXG5cdG1vbnRoTGV0dGVycz86IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBJbiBzb21lIGxhbmd1YWdlcywgbW9udGhzIG5lZWQgZGlmZmVyZW50IG5hbWVzIHdoZW4gdXNlZCBzdGFuZC1hbG9uZVxuXHQgKi9cblx0c3RhbmRBbG9uZUxvbmdNb250aE5hbWVzPzogc3RyaW5nW107XG5cdHN0YW5kQWxvbmVTaG9ydE1vbnRoTmFtZXM/OiBzdHJpbmdbXTtcblx0c3RhbmRBbG9uZU1vbnRoTGV0dGVycz86IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBXZWVrIGRheSBuYW1lcywgc3RhcnRpbmcgd2l0aCBzdW5kYXlcblx0ICovXG5cdGxvbmdXZWVrZGF5TmFtZXM/OiBzdHJpbmdbXTtcblx0c2hvcnRXZWVrZGF5TmFtZXM/OiBzdHJpbmdbXTtcblx0d2Vla2RheVR3b0xldHRlcnM/OiBzdHJpbmdbXTtcblx0d2Vla2RheUxldHRlcnM/OiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogRml4ZWQgZGF5IHBlcmlvZCBuYW1lcyAoQU0vUE0vbm9vbi9taWRuaWdodCwgZm9ybWF0ICdhJyBhbmQgJ2InKVxuXHQgKi9cblx0ZGF5UGVyaW9kTmFycm93PzogRGF5UGVyaW9kO1xuXHRkYXlQZXJpb2RXaWRlPzogRGF5UGVyaW9kO1xuXHRkYXlQZXJpb2RBYmJyZXZpYXRlZD86IERheVBlcmlvZDtcbn1cblxuZXhwb3J0IGNvbnN0IEVSQV9OQU1FU19OQVJST1c6IFtzdHJpbmcsIHN0cmluZ10gPSBbXCJBXCIsIFwiQlwiXTtcbmV4cG9ydCBjb25zdCBFUkFfTkFNRVNfV0lERTogW3N0cmluZywgc3RyaW5nXSA9IFtcIkFubm8gRG9taW5pXCIsIFwiQmVmb3JlIENocmlzdFwiXTtcbmV4cG9ydCBjb25zdCBFUkFfTkFNRVNfQUJCUkVWSUFURUQ6IFtzdHJpbmcsIHN0cmluZ10gPSBbXCJBRFwiLCBcIkJDXCJdO1xuXG5leHBvcnQgY29uc3QgUVVBUlRFUl9MRVRURVI6IHN0cmluZyA9IFwiUVwiO1xuZXhwb3J0IGNvbnN0IFFVQVJURVJfV09SRDogc3RyaW5nID0gXCJxdWFydGVyXCI7XG5leHBvcnQgY29uc3QgUVVBUlRFUl9BQkJSRVZJQVRJT05TOiBzdHJpbmdbXSA9IFtcIjFzdFwiLCBcIjJuZFwiLCBcIjNyZFwiLCBcIjR0aFwiXTtcblxuLyoqXG4gKiBJbiBzb21lIGxhbmd1YWdlcywgZGlmZmVyZW50IHdvcmRzIGFyZSBuZWNlc3NhcnkgZm9yIHN0YW5kLWFsb25lIHF1YXJ0ZXIgbmFtZXNcbiAqL1xuZXhwb3J0IGNvbnN0IFNUQU5EX0FMT05FX1FVQVJURVJfTEVUVEVSOiBzdHJpbmcgPSBRVUFSVEVSX0xFVFRFUjtcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9RVUFSVEVSX1dPUkQ6IHN0cmluZyA9IFFVQVJURVJfV09SRDtcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9RVUFSVEVSX0FCQlJFVklBVElPTlM6IHN0cmluZ1tdID0gUVVBUlRFUl9BQkJSRVZJQVRJT05TLnNsaWNlKCk7XG5cbmV4cG9ydCBjb25zdCBMT05HX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9XG5cdFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xuXG5leHBvcnQgY29uc3QgU0hPUlRfTU9OVEhfTkFNRVM6IHN0cmluZ1tdID1cblx0W1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdO1xuXG5leHBvcnQgY29uc3QgTU9OVEhfTEVUVEVSUzogc3RyaW5nW10gPVxuXHRbXCJKXCIsIFwiRlwiLCBcIk1cIiwgXCJBXCIsIFwiTVwiLCBcIkpcIiwgXCJKXCIsIFwiQVwiLCBcIlNcIiwgXCJPXCIsIFwiTlwiLCBcIkRcIl07XG5cbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTOiBzdHJpbmdbXSA9IExPTkdfTU9OVEhfTkFNRVMuc2xpY2UoKTtcbmV4cG9ydCBjb25zdCBTVEFORF9BTE9ORV9TSE9SVF9NT05USF9OQU1FUzogc3RyaW5nW10gPSBTSE9SVF9NT05USF9OQU1FUy5zbGljZSgpO1xuZXhwb3J0IGNvbnN0IFNUQU5EX0FMT05FX01PTlRIX0xFVFRFUlM6IHN0cmluZ1tdID0gTU9OVEhfTEVUVEVSUy5zbGljZSgpO1xuXG5leHBvcnQgY29uc3QgTE9OR19XRUVLREFZX05BTUVTOiBzdHJpbmdbXSA9XG5cdFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdO1xuXG5leHBvcnQgY29uc3QgU0hPUlRfV0VFS0RBWV9OQU1FUzogc3RyaW5nW10gPVxuXHRbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG5cbmV4cG9ydCBjb25zdCBXRUVLREFZX1RXT19MRVRURVJTOiBzdHJpbmdbXSA9XG5cdFtcIlN1XCIsIFwiTW9cIiwgXCJUdVwiLCBcIldlXCIsIFwiVGhcIiwgXCJGclwiLCBcIlNhXCJdO1xuXG5leHBvcnQgY29uc3QgV0VFS0RBWV9MRVRURVJTOiBzdHJpbmdbXSA9XG5cdFtcIlNcIiwgXCJNXCIsIFwiVFwiLCBcIldcIiwgXCJUXCIsIFwiRlwiLCBcIlNcIl07XG5cbmV4cG9ydCBjb25zdCBEQVlfUEVSSU9EU19BQkJSRVZJQVRFRCA9IHsgYW06IFwiQU1cIiwgcG06IFwiUE1cIiwgbm9vbjogXCJub29uXCIsIG1pZG5pZ2h0OiBcIm1pZC5cIiB9O1xuZXhwb3J0IGNvbnN0IERBWV9QRVJJT0RTX1dJREUgPSB7IGFtOiBcIkFNXCIsIHBtOiBcIlBNXCIsIG5vb246IFwibm9vblwiLCBtaWRuaWdodDogXCJtaWRuaWdodFwiIH07XG5leHBvcnQgY29uc3QgREFZX1BFUklPRFNfTkFSUk9XID0geyBhbTogXCJBXCIsIHBtOiBcIlBcIiwgbm9vbjogXCJub29uXCIsIG1pZG5pZ2h0OiBcIm1kXCIgfTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9DQUxFOiBMb2NhbGUgPSB7XG5cdGVyYU5hcnJvdzogRVJBX05BTUVTX05BUlJPVyxcblx0ZXJhV2lkZTogRVJBX05BTUVTX1dJREUsXG5cdGVyYUFiYnJldmlhdGVkOiBFUkFfTkFNRVNfQUJCUkVWSUFURUQsXG5cdHF1YXJ0ZXJMZXR0ZXI6IFFVQVJURVJfTEVUVEVSLFxuXHRxdWFydGVyV29yZDogUVVBUlRFUl9XT1JELFxuXHRxdWFydGVyQWJicmV2aWF0aW9uczogUVVBUlRFUl9BQkJSRVZJQVRJT05TLFxuXHRzdGFuZEFsb25lUXVhcnRlckxldHRlcjogU1RBTkRfQUxPTkVfUVVBUlRFUl9MRVRURVIsXG5cdHN0YW5kQWxvbmVRdWFydGVyV29yZDogU1RBTkRfQUxPTkVfUVVBUlRFUl9XT1JELFxuXHRzdGFuZEFsb25lUXVhcnRlckFiYnJldmlhdGlvbnM6IFNUQU5EX0FMT05FX1FVQVJURVJfQUJCUkVWSUFUSU9OUyxcblx0bG9uZ01vbnRoTmFtZXM6IExPTkdfTU9OVEhfTkFNRVMsXG5cdHNob3J0TW9udGhOYW1lczogU0hPUlRfTU9OVEhfTkFNRVMsXG5cdG1vbnRoTGV0dGVyczogTU9OVEhfTEVUVEVSUyxcblx0c3RhbmRBbG9uZUxvbmdNb250aE5hbWVzOiBTVEFORF9BTE9ORV9MT05HX01PTlRIX05BTUVTLFxuXHRzdGFuZEFsb25lU2hvcnRNb250aE5hbWVzOiBTVEFORF9BTE9ORV9TSE9SVF9NT05USF9OQU1FUyxcblx0c3RhbmRBbG9uZU1vbnRoTGV0dGVyczogU1RBTkRfQUxPTkVfTU9OVEhfTEVUVEVSUyxcblx0bG9uZ1dlZWtkYXlOYW1lczogTE9OR19XRUVLREFZX05BTUVTLFxuXHRzaG9ydFdlZWtkYXlOYW1lczogU0hPUlRfV0VFS0RBWV9OQU1FUyxcblx0d2Vla2RheVR3b0xldHRlcnM6IFdFRUtEQVlfVFdPX0xFVFRFUlMsXG5cdHdlZWtkYXlMZXR0ZXJzOiBXRUVLREFZX0xFVFRFUlMsXG5cdGRheVBlcmlvZEFiYnJldmlhdGVkOiBEQVlfUEVSSU9EU19BQkJSRVZJQVRFRCxcblx0ZGF5UGVyaW9kV2lkZTogREFZX1BFUklPRFNfV0lERSxcblx0ZGF5UGVyaW9kTmFycm93OiBEQVlfUEVSSU9EU19OQVJST1dcbn07XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogTWF0aCB1dGlsaXR5IGZ1bmN0aW9uc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuXG4vKipcbiAqIEByZXR1cm4gdHJ1ZSBpZmYgZ2l2ZW4gYXJndW1lbnQgaXMgYW4gaW50ZWdlciBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzSW50KG46IG51bWJlcik6IGJvb2xlYW4ge1xuXHRpZiAobiA9PT0gbnVsbCB8fCAhaXNGaW5pdGUobikpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0cmV0dXJuIChNYXRoLmZsb29yKG4pID09PSBuKTtcbn1cblxuLyoqXG4gKiBSb3VuZHMgLTEuNSB0byAtMiBpbnN0ZWFkIG9mIC0xXG4gKiBSb3VuZHMgKzEuNSB0byArMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcm91bmRTeW0objogbnVtYmVyKTogbnVtYmVyIHtcblx0aWYgKG4gPCAwKSB7XG5cdFx0cmV0dXJuIC0xICogTWF0aC5yb3VuZCgtMSAqIG4pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBNYXRoLnJvdW5kKG4pO1xuXHR9XG59XG5cbi8qKlxuICogU3RyaWN0ZXIgdmFyaWFudCBvZiBwYXJzZUZsb2F0KCkuXG4gKiBAcGFyYW0gdmFsdWVcdElucHV0IHN0cmluZ1xuICogQHJldHVybiB0aGUgZmxvYXQgaWYgdGhlIHN0cmluZyBpcyBhIHZhbGlkIGZsb2F0LCBOYU4gb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJGbG9hdCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHtcblx0aWYgKC9eKFxcLXxcXCspPyhbMC05XSsoXFwuWzAtOV0rKT98SW5maW5pdHkpJC8udGVzdCh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gTnVtYmVyKHZhbHVlKTtcblx0fVxuXHRyZXR1cm4gTmFOO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpdmVNb2R1bG8odmFsdWU6IG51bWJlciwgbW9kdWxvOiBudW1iZXIpOiBudW1iZXIge1xuXHRhc3NlcnQobW9kdWxvID49IDEsIFwibW9kdWxvIHNob3VsZCBiZSA+PSAxXCIpO1xuXHRpZiAodmFsdWUgPCAwKSB7XG5cdFx0cmV0dXJuICgodmFsdWUgJSBtb2R1bG8pICsgbW9kdWxvKSAlIG1vZHVsbztcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdmFsdWUgJSBtb2R1bG87XG5cdH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXG4gKi9cblxuaW1wb3J0IHsgVGltZUNvbXBvbmVudE9wdHMsIFRpbWVTdHJ1Y3QgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IERFRkFVTFRfTE9DQUxFLCBMb2NhbGUsIFBhcnRpYWxMb2NhbGUgfSBmcm9tIFwiLi9sb2NhbGVcIjtcbmltcG9ydCB7IFRpbWVab25lIH0gZnJvbSBcIi4vdGltZXpvbmVcIjtcbmltcG9ydCB7IFRva2VuLCB0b2tlbml6ZSwgVG9rZW5UeXBlIH0gZnJvbSBcIi4vdG9rZW5cIjtcblxuLyoqXG4gKiBUaW1lU3RydWN0IHBsdXMgem9uZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF3YXJlVGltZVN0cnVjdCB7XG5cdC8qKlxuXHQgKiBUaGUgdGltZSBzdHJ1Y3Rcblx0ICovXG5cdHRpbWU6IFRpbWVTdHJ1Y3Q7XG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIChjYW4gYmUgdW5kZWZpbmVkKVxuXHQgKi9cblx0em9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XG59XG5cbmludGVyZmFjZSBQYXJzZU51bWJlclJlc3VsdCB7XG5cdG46IG51bWJlcjtcblx0cmVtYWluaW5nOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBQYXJzZVpvbmVSZXN1bHQge1xuXHR6b25lPzogVGltZVpvbmU7XG5cdHJlbWFpbmluZzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgUGFyc2VEYXlQZXJpb2RSZXN1bHQge1xuXHR0eXBlOiBcImFtXCIgfCBcInBtXCIgfCBcIm5vb25cIiB8IFwibWlkbmlnaHRcIjtcblx0cmVtYWluaW5nOiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBkYXRldGltZSBzdHJpbmcgaXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXRcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHRlc3RcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgTERNTCBmb3JtYXQgc3RyaW5nIChzZWUgTERNTC5tZClcbiAqIEBwYXJhbSBhbGxvd1RyYWlsaW5nIEFsbG93IHRyYWlsaW5nIHN0cmluZyBhZnRlciB0aGUgZGF0ZSt0aW1lXG4gKiBAcGFyYW0gbG9jYWxlIExvY2FsZS1zcGVjaWZpYyBjb25zdGFudHMgc3VjaCBhcyBtb250aCBuYW1lc1xuICogQHJldHVybnMgdHJ1ZSBpZmYgdGhlIHN0cmluZyBpcyB2YWxpZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VhYmxlKFxuXHRkYXRlVGltZVN0cmluZzogc3RyaW5nLFxuXHRmb3JtYXRTdHJpbmc6IHN0cmluZyxcblx0YWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWUsXG5cdGxvY2FsZTogUGFydGlhbExvY2FsZSA9IHt9XG4pOiBib29sZWFuIHtcblx0dHJ5IHtcblx0XHRwYXJzZShkYXRlVGltZVN0cmluZywgZm9ybWF0U3RyaW5nLCB1bmRlZmluZWQsIGFsbG93VHJhaWxpbmcsIGxvY2FsZSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgc3VwcGxpZWQgZGF0ZVRpbWUgYXNzdW1pbmcgdGhlIGdpdmVuIGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0gZGF0ZVRpbWVTdHJpbmcgVGhlIHN0cmluZyB0byBwYXJzZVxuICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0dGluZyBzdHJpbmcgdG8gYmUgYXBwbGllZFxuICogQHBhcmFtIGxvY2FsZSBMb2NhbGUtc3BlY2lmaWMgY29uc3RhbnRzIHN1Y2ggYXMgbW9udGggbmFtZXNcbiAqIEByZXR1cm4gc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShcblx0ZGF0ZVRpbWVTdHJpbmc6IHN0cmluZyxcblx0Zm9ybWF0U3RyaW5nOiBzdHJpbmcsXG5cdG92ZXJyaWRlWm9uZT86IFRpbWVab25lIHwgbnVsbCB8IHVuZGVmaW5lZCxcblx0YWxsb3dUcmFpbGluZzogYm9vbGVhbiA9IHRydWUsXG5cdGxvY2FsZTogUGFydGlhbExvY2FsZSA9IHt9XG4pOiBBd2FyZVRpbWVTdHJ1Y3Qge1xuXHRpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gZGF0ZSBnaXZlblwiKTtcblx0fVxuXHRpZiAoIWZvcm1hdFN0cmluZykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIm5vIGZvcm1hdCBnaXZlblwiKTtcblx0fVxuXHRjb25zdCBtZXJnZWRMb2NhbGU6IExvY2FsZSA9IHtcblx0XHQuLi5ERUZBVUxUX0xPQ0FMRSxcblx0XHQuLi5sb2NhbGVcblx0fTtcblx0dHJ5IHtcblx0XHRjb25zdCB0b2tlbnM6IFRva2VuW10gPSB0b2tlbml6ZShmb3JtYXRTdHJpbmcpO1xuXHRcdGNvbnN0IHRpbWU6IFRpbWVDb21wb25lbnRPcHRzID0geyB5ZWFyOiB1bmRlZmluZWQgfTtcblx0XHRsZXQgem9uZTogVGltZVpvbmUgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHBucjogUGFyc2VOdW1iZXJSZXN1bHQgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHB6cjogUGFyc2Vab25lUmVzdWx0IHwgdW5kZWZpbmVkO1xuXHRcdGxldCBkcHI6IFBhcnNlRGF5UGVyaW9kUmVzdWx0IHwgdW5kZWZpbmVkO1xuXHRcdGxldCBlcmE6IG51bWJlciA9IDE7XG5cdFx0bGV0IHF1YXJ0ZXI6IG51bWJlciB8IHVuZGVmaW5lZDtcblx0XHRsZXQgcmVtYWluaW5nOiBzdHJpbmcgPSBkYXRlVGltZVN0cmluZztcblx0XHRmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkVSQTpcblx0XHRcdFx0XHRbZXJhLCByZW1haW5pbmddID0gc3RyaXBFcmEodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjoge1xuXHRcdFx0XHRcdGNvbnN0IHIgPSBzdHJpcFF1YXJ0ZXIodG9rZW4sIHJlbWFpbmluZywgbWVyZ2VkTG9jYWxlKTtcblx0XHRcdFx0XHRxdWFydGVyID0gci5uO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHIucmVtYWluaW5nO1xuXHRcdFx0XHR9IGJyZWFrO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLREFZOlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5XRUVLOlxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0YnJlYWs7IC8vIG5vdGhpbmcgdG8gbGVhcm4gZnJvbSB0aGlzXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkRBWVBFUklPRDpcblx0XHRcdFx0XHRkcHIgPSBzdHJpcERheVBlcmlvZCh0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IGRwci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLllFQVI6XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCBJbmZpbml0eSk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcblx0XHRcdFx0XHR0aW1lLnllYXIgPSBwbnIubjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuTU9OVEg6XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBNb250aCh0b2tlbiwgcmVtYWluaW5nLCBtZXJnZWRMb2NhbGUpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5tb250aCA9IHBuci5uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVk6XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xuXHRcdFx0XHRcdHRpbWUuZGF5ID0gcG5yLm47XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLkhPVVI6XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBIb3VyKHRva2VuLCByZW1haW5pbmcpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5ob3VyID0gcG5yLm47XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1JTlVURTpcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XG5cdFx0XHRcdFx0dGltZS5taW51dGUgPSBwbnIubjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuU0VDT05EOiB7XG5cdFx0XHRcdFx0cG5yID0gc3RyaXBTZWNvbmQodG9rZW4sIHJlbWFpbmluZyk7XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcblx0XHRcdFx0XHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcInNcIjogdGltZS5zZWNvbmQgPSBwbnIubjsgYnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiU1wiOiB0aW1lLm1pbGxpID0gMTAwMCAqIHBhcnNlRmxvYXQoXCIwLlwiICsgTWF0aC5mbG9vcihwbnIubikudG9TdHJpbmcoMTApLnNsaWNlKDAsIDMpKTsgYnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiQVwiOlxuXHRcdFx0XHRcdFx0XHR0aW1lLmhvdXIgPSBNYXRoLmZsb29yKChwbnIubiAvIDM2MDBFMykpO1xuXHRcdFx0XHRcdFx0XHR0aW1lLm1pbnV0ZSA9IE1hdGguZmxvb3IoKHBuci5uIC8gNjBFMykgJSA2MCk7XG5cdFx0XHRcdFx0XHRcdHRpbWUuc2Vjb25kID0gTWF0aC5mbG9vcigocG5yLm4gLyAxMDAwKSAlIDYwKTtcblx0XHRcdFx0XHRcdFx0dGltZS5taWxsaSA9IHBuci5uICUgMTAwMDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICcke3Rva2VuLnJhd30nYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5aT05FOlxuXHRcdFx0XHRcdHB6ciA9IHN0cmlwWm9uZSh0b2tlbiwgcmVtYWluaW5nKTtcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwenIucmVtYWluaW5nO1xuXHRcdFx0XHRcdHpvbmUgPSBwenIuem9uZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuSURFTlRJVFk6XG5cdFx0XHRcdFx0cmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoZHByKSB7XG5cdFx0XHRzd2l0Y2ggKGRwci50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJhbVwiOlxuXHRcdFx0XHRcdGlmICh0aW1lLmhvdXIgIT09IHVuZGVmaW5lZCAmJiB0aW1lLmhvdXIgPj0gMTIpIHtcblx0XHRcdFx0XHRcdHRpbWUuaG91ciAtPSAxMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwicG1cIjpcblx0XHRcdFx0XHRpZiAodGltZS5ob3VyICE9PSB1bmRlZmluZWQgJiYgdGltZS5ob3VyIDwgMTIpIHtcblx0XHRcdFx0XHRcdHRpbWUuaG91ciArPSAxMjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwibm9vblwiOlxuXHRcdFx0XHRcdGlmICh0aW1lLmhvdXIgPT09IHVuZGVmaW5lZCB8fCB0aW1lLmhvdXIgPT09IDApIHtcblx0XHRcdFx0XHRcdHRpbWUuaG91ciA9IDEyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGltZS5taW51dGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0dGltZS5taW51dGUgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGltZS5zZWNvbmQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0dGltZS5zZWNvbmQgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGltZS5taWxsaSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aW1lLm1pbGxpID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRpbWUuaG91ciAhPT0gMTIgfHwgdGltZS5taW51dGUgIT09IDAgfHwgdGltZS5zZWNvbmQgIT09IDAgfHwgdGltZS5taWxsaSAhPT0gMCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHRpbWUsIGNvbnRhaW5zICdub29uJyBzcGVjaWZpZXIgYnV0IHRpbWUgZGlmZmVycyBmcm9tIG5vb25gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwibWlkbmlnaHRcIjpcblx0XHRcdFx0XHRpZiAodGltZS5ob3VyID09PSB1bmRlZmluZWQgfHwgdGltZS5ob3VyID09PSAxMikge1xuXHRcdFx0XHRcdFx0dGltZS5ob3VyID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRpbWUuaG91ciA9PT0gMTIpIHtcblx0XHRcdFx0XHRcdHRpbWUuaG91ciA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aW1lLm1pbnV0ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aW1lLm1pbnV0ZSA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aW1lLnNlY29uZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHR0aW1lLnNlY29uZCA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aW1lLm1pbGxpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdHRpbWUubWlsbGkgPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGltZS5ob3VyICE9PSAwIHx8IHRpbWUubWludXRlICE9PSAwIHx8IHRpbWUuc2Vjb25kICE9PSAwIHx8IHRpbWUubWlsbGkgIT09IDApIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgaW52YWxpZCB0aW1lLCBjb250YWlucyAnbWlkbmlnaHQnIHNwZWNpZmllciBidXQgdGltZSBkaWZmZXJzIGZyb20gbWlkbmlnaHRgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGltZS55ZWFyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRpbWUueWVhciAqPSBlcmE7XG5cdFx0fVxuXHRcdGlmIChxdWFydGVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmICh0aW1lLm1vbnRoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0c3dpdGNoIChxdWFydGVyKSB7XG5cdFx0XHRcdFx0Y2FzZSAxOiB0aW1lLm1vbnRoID0gMTsgYnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAyOiB0aW1lLm1vbnRoID0gNDsgYnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAzOiB0aW1lLm1vbnRoID0gNzsgYnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSA0OiB0aW1lLm1vbnRoID0gMTA7IGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgZXJyb3IgPSBmYWxzZTtcblx0XHRcdFx0c3dpdGNoIChxdWFydGVyKSB7XG5cdFx0XHRcdFx0Y2FzZSAxOiBlcnJvciA9ICEodGltZS5tb250aCA+PSAxICYmIHRpbWUubW9udGggPD0gMyk7IGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgMjogZXJyb3IgPSAhKHRpbWUubW9udGggPj0gNCAmJiB0aW1lLm1vbnRoIDw9IDYpOyBicmVhaztcblx0XHRcdFx0XHRjYXNlIDM6IGVycm9yID0gISh0aW1lLm1vbnRoID49IDcgJiYgdGltZS5tb250aCA8PSA5KTsgYnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSA0OiBlcnJvciA9ICEodGltZS5tb250aCA+PSAxMCAmJiB0aW1lLm1vbnRoIDw9IDEyKTsgYnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidGhlIHF1YXJ0ZXIgZG9lcyBub3QgbWF0Y2ggdGhlIG1vbnRoXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aW1lLnllYXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGltZS55ZWFyID0gMTk3MDtcblx0XHR9XG5cdFx0Y29uc3QgcmVzdWx0OiBBd2FyZVRpbWVTdHJ1Y3QgPSB7IHRpbWU6IG5ldyBUaW1lU3RydWN0KHRpbWUpLCB6b25lIH07XG5cdFx0aWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgcmVzdWx0aW5nIGRhdGVgKTtcblx0XHR9XG5cdFx0Ly8gYWx3YXlzIG92ZXJ3cml0ZSB6b25lIHdpdGggZ2l2ZW4gem9uZVxuXHRcdGlmIChvdmVycmlkZVpvbmUpIHtcblx0XHRcdHJlc3VsdC56b25lID0gb3ZlcnJpZGVab25lO1xuXHRcdH1cblx0XHRpZiAocmVtYWluaW5nICYmICFhbGxvd1RyYWlsaW5nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogdHJhaWxpbmcgY2hhcmFjdGVyczogJyR7cmVtYWluaW5nfSdgXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRhdGUgJyR7ZGF0ZVRpbWVTdHJpbmd9JyBub3QgYWNjb3JkaW5nIHRvIGZvcm1hdCAnJHtmb3JtYXRTdHJpbmd9JzogJHtlLm1lc3NhZ2V9YCk7XG5cdH1cbn1cblxuY29uc3QgV0hJVEVTUEFDRSA9IFtcIiBcIiwgXCJcXHRcIiwgXCJcXHJcIiwgXCJcXHZcIiwgXCJcXG5cIl07XG5cbmZ1bmN0aW9uIHN0cmlwWm9uZSh0b2tlbjogVG9rZW4sIHM6IHN0cmluZyk6IFBhcnNlWm9uZVJlc3VsdCB7XG5cdGNvbnN0IHVuc3VwcG9ydGVkOiBib29sZWFuID1cblx0XHQodG9rZW4uc3ltYm9sID09PSBcInpcIilcblx0XHR8fCAodG9rZW4uc3ltYm9sID09PSBcIlpcIiAmJiB0b2tlbi5sZW5ndGggPT09IDUpXG5cdFx0fHwgKHRva2VuLnN5bWJvbCA9PT0gXCJ2XCIpXG5cdFx0fHwgKHRva2VuLnN5bWJvbCA9PT0gXCJWXCIgJiYgdG9rZW4ubGVuZ3RoICE9PSAyKVxuXHRcdHx8ICh0b2tlbi5zeW1ib2wgPT09IFwieFwiICYmIHRva2VuLmxlbmd0aCA+PSA0KVxuXHRcdHx8ICh0b2tlbi5zeW1ib2wgPT09IFwiWFwiICYmIHRva2VuLmxlbmd0aCA+PSA0KVxuXHRcdDtcblx0aWYgKHVuc3VwcG9ydGVkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwidGltZSB6b25lIHBhdHRlcm4gJ1wiICsgdG9rZW4ucmF3ICsgXCInIGlzIG5vdCBpbXBsZW1lbnRlZFwiKTtcblx0fVxuXHRjb25zdCByZXN1bHQ6IFBhcnNlWm9uZVJlc3VsdCA9IHtcblx0XHRyZW1haW5pbmc6IHNcblx0fTtcblx0Ly8gY2hvcCBvZmYgXCJHTVRcIiBwcmVmaXggaWYgbmVlZGVkXG5cdGxldCBoYWRHTVQgPSBmYWxzZTtcblx0aWYgKCh0b2tlbi5zeW1ib2wgPT09IFwiWlwiICYmIHRva2VuLmxlbmd0aCA9PT0gNCkgfHwgdG9rZW4uc3ltYm9sID09PSBcIk9cIikge1xuXHRcdGlmIChyZXN1bHQucmVtYWluaW5nLnRvVXBwZXJDYXNlKCkuc3RhcnRzV2l0aChcIkdNVFwiKSkge1xuXHRcdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc2xpY2UoMyk7XG5cdFx0XHRoYWRHTVQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHQvLyBwYXJzZSBhbnkgem9uZSwgcmVnYXJkbGVzcyBvZiBzcGVjaWZpZWQgZm9ybWF0XG5cdGxldCB6b25lU3RyaW5nID0gXCJcIjtcblx0d2hpbGUgKHJlc3VsdC5yZW1haW5pbmcubGVuZ3RoID4gMCAmJiBXSElURVNQQUNFLmluZGV4T2YocmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCkpID09PSAtMSkge1xuXHRcdHpvbmVTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xuXHR9XG5cdHpvbmVTdHJpbmcgPSB6b25lU3RyaW5nLnRyaW0oKTtcblx0aWYgKHpvbmVTdHJpbmcpIHtcblx0XHQvLyBlbnN1cmUgY2hvcHBpbmcgb2ZmIEdNVCBkb2VzIG5vdCBoaWRlIHRpbWUgem9uZSBlcnJvcnMgKGJpdCBvZiBhIHNsb3BweSByZWdleCBidXQgT0spXG5cdFx0aWYgKGhhZEdNVCAmJiAhem9uZVN0cmluZy5tYXRjaCgvW1xcK1xcLV0/W1xcZFxcOl0rL2kpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHRpbWUgem9uZSAnR01UXCIgKyB6b25lU3RyaW5nICsgXCInXCIpO1xuXHRcdH1cblx0XHRyZXN1bHQuem9uZSA9IFRpbWVab25lLnpvbmUoem9uZVN0cmluZyk7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gdGltZSB6b25lIGdpdmVuXCIpO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHN0cmlwUmF3KHM6IHN0cmluZywgZXhwZWN0ZWQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCByZW1haW5pbmcgPSBzO1xuXHRsZXQgZXJlbWFpbmluZyA9IGV4cGVjdGVkO1xuXHR3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgZXJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5jaGFyQXQoMCkgPT09IGVyZW1haW5pbmcuY2hhckF0KDApKSB7XG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcblx0XHRlcmVtYWluaW5nID0gZXJlbWFpbmluZy5zdWJzdHIoMSk7XG5cdH1cblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgJyR7ZXhwZWN0ZWR9J2ApO1xuXHR9XG5cdHJldHVybiByZW1haW5pbmc7XG59XG5cbmZ1bmN0aW9uIHN0cmlwRGF5UGVyaW9kKHRva2VuOiBUb2tlbiwgcmVtYWluaW5nOiBzdHJpbmcsIGxvY2FsZTogTG9jYWxlKTogUGFyc2VEYXlQZXJpb2RSZXN1bHQge1xuXHRsZXQgb2Zmc2V0czoge1tpbmRleDogc3RyaW5nXTogXCJhbVwiIHwgXCJwbVwiIHwgXCJub29uXCIgfCBcIm1pZG5pZ2h0XCJ9O1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJhXCI6XG5cdFx0XHRzd2l0Y2ggKHRva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRjYXNlIDQ6XG5cdFx0XHRcdFx0b2Zmc2V0cyA9IHtcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kV2lkZS5hbV06IFwiYW1cIixcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kV2lkZS5wbV06IFwicG1cIlxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDU6XG5cdFx0XHRcdFx0b2Zmc2V0cyA9IHtcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kTmFycm93LmFtXTogXCJhbVwiLFxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cucG1dOiBcInBtXCJcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRvZmZzZXRzID0ge1xuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5hbV06IFwiYW1cIixcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQucG1dOiBcInBtXCJcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRcdFx0Y2FzZSA0OlxuXHRcdFx0XHRcdG9mZnNldHMgPSB7XG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZFdpZGUuYW1dOiBcImFtXCIsXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZFdpZGUubWlkbmlnaHRdOiBcIm1pZG5pZ2h0XCIsXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZFdpZGUucG1dOiBcInBtXCIsXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZFdpZGUubm9vbl06IFwibm9vblwiXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgNTpcblx0XHRcdFx0XHRvZmZzZXRzID0ge1xuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cuYW1dOiBcImFtXCIsXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZE5hcnJvdy5taWRuaWdodF06IFwibWlkbmlnaHRcIixcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kTmFycm93LnBtXTogXCJwbVwiLFxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2ROYXJyb3cubm9vbl06IFwibm9vblwiXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0b2Zmc2V0cyA9IHtcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQuYW1dOiBcImFtXCIsXG5cdFx0XHRcdFx0XHRbbG9jYWxlLmRheVBlcmlvZEFiYnJldmlhdGVkLm1pZG5pZ2h0XTogXCJtaWRuaWdodFwiLFxuXHRcdFx0XHRcdFx0W2xvY2FsZS5kYXlQZXJpb2RBYmJyZXZpYXRlZC5wbV06IFwicG1cIixcblx0XHRcdFx0XHRcdFtsb2NhbGUuZGF5UGVyaW9kQWJicmV2aWF0ZWQubm9vbl06IFwibm9vblwiXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0YnJlYWs7XG5cdH1cblx0Ly8gbWF0Y2ggbG9uZ2VzdCBwb3NzaWJsZSBkYXkgcGVyaW9kIHN0cmluZzsgc29ydCBrZXlzIGJ5IGxlbmd0aCBkZXNjZW5kaW5nXG5cdGNvbnN0IHNvcnRlZEtleXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMob2Zmc2V0cylcblx0XHQuc29ydCgoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBudW1iZXIgPT4gKGEubGVuZ3RoIDwgYi5sZW5ndGggPyAxIDogYS5sZW5ndGggPiBiLmxlbmd0aCA/IC0xIDogMCkpO1xuXG5cdGNvbnN0IHVwcGVyID0gcmVtYWluaW5nLnRvVXBwZXJDYXNlKCk7XG5cdGZvciAoY29uc3Qga2V5IG9mIHNvcnRlZEtleXMpIHtcblx0XHRpZiAodXBwZXIuc3RhcnRzV2l0aChrZXkudG9VcHBlckNhc2UoKSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IG9mZnNldHNba2V5XSxcblx0XHRcdFx0cmVtYWluaW5nOiByZW1haW5pbmcuc2xpY2Uoa2V5Lmxlbmd0aClcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cdHRocm93IG5ldyBFcnJvcihcIm1pc3NpbmcgZGF5IHBlcmlvZCBpLmUuIFwiICsgT2JqZWN0LmtleXMob2Zmc2V0cykuam9pbihcIiwgXCIpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGZhY3RvciAtMSBvciAxIGRlcGVuZGluZyBvbiBCQyBvciBBRFxuICogQHBhcmFtIHRva2VuXG4gKiBAcGFyYW0gcmVtYWluaW5nXG4gKiBAcGFyYW0gbG9jYWxlXG4gKiBAcmV0dXJucyBbZmFjdG9yLCByZW1haW5pbmddXG4gKi9cbmZ1bmN0aW9uIHN0cmlwRXJhKHRva2VuOiBUb2tlbiwgcmVtYWluaW5nOiBzdHJpbmcsIGxvY2FsZTogTG9jYWxlKTogW251bWJlciwgc3RyaW5nXSB7XG5cdGxldCBhbGxvd2VkOiBzdHJpbmdbXTtcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRjYXNlIDQ6IGFsbG93ZWQgPSBsb2NhbGUuZXJhV2lkZTsgYnJlYWs7XG5cdFx0Y2FzZSA1OiBhbGxvd2VkID0gbG9jYWxlLmVyYU5hcnJvdzsgYnJlYWs7XG5cdFx0ZGVmYXVsdDogYWxsb3dlZCA9IGxvY2FsZS5lcmFBYmJyZXZpYXRlZDsgYnJlYWs7XG5cdH1cblx0Y29uc3QgcmVzdWx0ID0gc3RyaXBTdHJpbmdzKHRva2VuLCByZW1haW5pbmcsIGFsbG93ZWQpO1xuXHRyZXR1cm4gW2FsbG93ZWQuaW5kZXhPZihyZXN1bHQuY2hvc2VuKSA9PT0gMCA/IDEgOiAtMSwgcmVzdWx0LnJlbWFpbmluZ107XG59XG5cbmZ1bmN0aW9uIHN0cmlwUXVhcnRlcih0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nLCBsb2NhbGU6IExvY2FsZSk6IFBhcnNlTnVtYmVyUmVzdWx0IHtcblx0bGV0IHF1YXJ0ZXJMZXR0ZXI6IHN0cmluZztcblx0bGV0IHF1YXJ0ZXJXb3JkOiBzdHJpbmc7XG5cdGxldCBxdWFydGVyQWJicmV2aWF0aW9uczogc3RyaW5nW107XG5cdHN3aXRjaCAodG9rZW4uc3ltYm9sKSB7XG5cdFx0Y2FzZSBcIlFcIjpcblx0XHRcdHF1YXJ0ZXJMZXR0ZXIgPSBsb2NhbGUucXVhcnRlckxldHRlcjtcblx0XHRcdHF1YXJ0ZXJXb3JkID0gbG9jYWxlLnF1YXJ0ZXJXb3JkO1xuXHRcdFx0cXVhcnRlckFiYnJldmlhdGlvbnMgPSBsb2NhbGUucXVhcnRlckFiYnJldmlhdGlvbnM7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwicVwiOiB7XG5cdFx0XHRxdWFydGVyTGV0dGVyID0gbG9jYWxlLnN0YW5kQWxvbmVRdWFydGVyTGV0dGVyO1xuXHRcdFx0cXVhcnRlcldvcmQgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJXb3JkO1xuXHRcdFx0cXVhcnRlckFiYnJldmlhdGlvbnMgPSBsb2NhbGUuc3RhbmRBbG9uZVF1YXJ0ZXJBYmJyZXZpYXRpb25zO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0ZGVmYXVsdDpcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHF1YXJ0ZXIgcGF0dGVyblwiKTtcblx0fVxuXHRsZXQgYWxsb3dlZDogc3RyaW5nW107XG5cdHN3aXRjaCAodG9rZW4ubGVuZ3RoKSB7XG5cdFx0Y2FzZSAxOlxuXHRcdGNhc2UgNTpcblx0XHRcdHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDEpO1xuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xuXHRcdGNhc2UgMzpcblx0XHRcdGFsbG93ZWQgPSBbMSwgMiwgMywgNF0ubWFwKChuOiBudW1iZXIpOiBzdHJpbmcgPT4gcXVhcnRlckxldHRlciArIG4udG9TdHJpbmcoMTApKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgNDpcblx0XHRcdGFsbG93ZWQgPSBxdWFydGVyQWJicmV2aWF0aW9ucy5tYXAoKGE6IHN0cmluZyk6IHN0cmluZyA9PiBhICsgXCIgXCIgKyBxdWFydGVyV29yZCk7XG5cdFx0XHRicmVhaztcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBxdWFydGVyIHBhdHRlcm5cIik7XG5cdH1cblx0Y29uc3QgciA9IHN0cmlwU3RyaW5ncyh0b2tlbiwgcmVtYWluaW5nLCBhbGxvd2VkKTtcblx0cmV0dXJuIHsgbjogYWxsb3dlZC5pbmRleE9mKHIuY2hvc2VuKSArIDEsIHJlbWFpbmluZzogci5yZW1haW5pbmcgfTtcbn1cblxuZnVuY3Rpb24gc3RyaXBNb250aCh0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nLCBsb2NhbGU6IExvY2FsZSk6IFBhcnNlTnVtYmVyUmVzdWx0IHtcblx0bGV0IHNob3J0TW9udGhOYW1lczogc3RyaW5nW107XG5cdGxldCBsb25nTW9udGhOYW1lczogc3RyaW5nW107XG5cdGxldCBtb250aExldHRlcnM6IHN0cmluZ1tdO1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJNXCI6XG5cdFx0XHRzaG9ydE1vbnRoTmFtZXMgPSBsb2NhbGUuc2hvcnRNb250aE5hbWVzO1xuXHRcdFx0bG9uZ01vbnRoTmFtZXMgPSBsb2NhbGUubG9uZ01vbnRoTmFtZXM7XG5cdFx0XHRtb250aExldHRlcnMgPSBsb2NhbGUubW9udGhMZXR0ZXJzO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkxcIjpcblx0XHRcdHNob3J0TW9udGhOYW1lcyA9IGxvY2FsZS5zdGFuZEFsb25lU2hvcnRNb250aE5hbWVzO1xuXHRcdFx0bG9uZ01vbnRoTmFtZXMgPSBsb2NhbGUuc3RhbmRBbG9uZUxvbmdNb250aE5hbWVzO1xuXHRcdFx0bW9udGhMZXR0ZXJzID0gbG9jYWxlLnN0YW5kQWxvbmVNb250aExldHRlcnM7XG5cdFx0XHRicmVhaztcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xuXHR9XG5cdGxldCBhbGxvd2VkOiBzdHJpbmdbXTtcblx0c3dpdGNoICh0b2tlbi5sZW5ndGgpIHtcblx0XHRjYXNlIDE6XG5cdFx0Y2FzZSAyOlxuXHRcdFx0cmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgMik7XG5cdFx0Y2FzZSAzOlxuXHRcdFx0YWxsb3dlZCA9IHNob3J0TW9udGhOYW1lcztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgNDpcblx0XHRcdGFsbG93ZWQgPSBsb25nTW9udGhOYW1lcztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgNTpcblx0XHRcdGFsbG93ZWQgPSBtb250aExldHRlcnM7XG5cdFx0XHRicmVhaztcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBtb250aCBwYXR0ZXJuXCIpO1xuXHR9XG5cdGNvbnN0IHIgPSBzdHJpcFN0cmluZ3ModG9rZW4sIHJlbWFpbmluZywgYWxsb3dlZCk7XG5cdHJldHVybiB7IG46IGFsbG93ZWQuaW5kZXhPZihyLmNob3NlbikgKyAxLCByZW1haW5pbmc6IHIucmVtYWluaW5nIH07XG59XG5cbmZ1bmN0aW9uIHN0cmlwSG91cih0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nKTogUGFyc2VOdW1iZXJSZXN1bHQge1xuXHRjb25zdCByZXN1bHQgPSBzdHJpcE51bWJlcihyZW1haW5pbmcsIDIpO1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJoXCI6XG5cdFx0XHRpZiAocmVzdWx0Lm4gPT09IDEyKSB7XG5cdFx0XHRcdHJlc3VsdC5uID0gMDtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJIXCI6XG5cdFx0XHQvLyBub3RoaW5nLCBpbiByYW5nZSAwLTIzXG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiS1wiOlxuXHRcdFx0Ly8gbm90aGluZywgaW4gcmFuZ2UgMC0xMVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcImtcIjpcblx0XHRcdHJlc3VsdC5uIC09IDE7XG5cdFx0XHRicmVhaztcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBzdHJpcFNlY29uZCh0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nKTogUGFyc2VOdW1iZXJSZXN1bHQge1xuXHRzd2l0Y2ggKHRva2VuLnN5bWJvbCkge1xuXHRcdGNhc2UgXCJzXCI6XG5cdFx0XHRyZXR1cm4gc3RyaXBOdW1iZXIocmVtYWluaW5nLCAyKTtcblx0XHRjYXNlIFwiU1wiOlxuXHRcdFx0cmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgdG9rZW4ubGVuZ3RoKTtcblx0XHRjYXNlIFwiQVwiOlxuXHRcdFx0cmV0dXJuIHN0cmlwTnVtYmVyKHJlbWFpbmluZywgOCk7XG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRkZWZhdWx0OlxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc2Vjb25kcyBwYXR0ZXJuXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHN0cmlwTnVtYmVyKHM6IHN0cmluZywgbWF4TGVuZ3RoOiBudW1iZXIpOiBQYXJzZU51bWJlclJlc3VsdCB7XG5cdGNvbnN0IHJlc3VsdDogUGFyc2VOdW1iZXJSZXN1bHQgPSB7XG5cdFx0bjogTmFOLFxuXHRcdHJlbWFpbmluZzogc1xuXHR9O1xuXHRsZXQgbnVtYmVyU3RyaW5nID0gXCJcIjtcblx0d2hpbGUgKG51bWJlclN0cmluZy5sZW5ndGggPCBtYXhMZW5ndGggJiYgcmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApLm1hdGNoKC9cXGQvKSkge1xuXHRcdG51bWJlclN0cmluZyArPSByZXN1bHQucmVtYWluaW5nLmNoYXJBdCgwKTtcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XG5cdH1cblx0Ly8gcmVtb3ZlIGxlYWRpbmcgemVyb2VzXG5cdHdoaWxlIChudW1iZXJTdHJpbmcuY2hhckF0KDApID09PSBcIjBcIiAmJiBudW1iZXJTdHJpbmcubGVuZ3RoID4gMSkge1xuXHRcdG51bWJlclN0cmluZyA9IG51bWJlclN0cmluZy5zdWJzdHIoMSk7XG5cdH1cblx0cmVzdWx0Lm4gPSBwYXJzZUludChudW1iZXJTdHJpbmcsIDEwKTtcblx0aWYgKG51bWJlclN0cmluZyA9PT0gXCJcIiB8fCAhTnVtYmVyLmlzRmluaXRlKHJlc3VsdC5uKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgZXhwZWN0ZWQgYSBudW1iZXIgYnV0IGdvdCAnJHtudW1iZXJTdHJpbmd9J2ApO1xuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHN0cmlwU3RyaW5ncyh0b2tlbjogVG9rZW4sIHJlbWFpbmluZzogc3RyaW5nLCBhbGxvd2VkOiBzdHJpbmdbXSk6IHsgcmVtYWluaW5nOiBzdHJpbmcsIGNob3Nlbjogc3RyaW5nIH0ge1xuXHQvLyBtYXRjaCBsb25nZXN0IHBvc3NpYmxlIHN0cmluZzsgc29ydCBrZXlzIGJ5IGxlbmd0aCBkZXNjZW5kaW5nXG5cdGNvbnN0IHNvcnRlZEtleXM6IHN0cmluZ1tdID0gYWxsb3dlZC5zbGljZSgpXG5cdFx0LnNvcnQoKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyID0+IChhLmxlbmd0aCA8IGIubGVuZ3RoID8gMSA6IGEubGVuZ3RoID4gYi5sZW5ndGggPyAtMSA6IDApKTtcblxuXHRjb25zdCB1cHBlciA9IHJlbWFpbmluZy50b1VwcGVyQ2FzZSgpO1xuXHRmb3IgKGNvbnN0IGtleSBvZiBzb3J0ZWRLZXlzKSB7XG5cdFx0aWYgKHVwcGVyLnN0YXJ0c1dpdGgoa2V5LnRvVXBwZXJDYXNlKCkpKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRjaG9zZW46IGtleSxcblx0XHRcdFx0cmVtYWluaW5nOiByZW1haW5pbmcuc2xpY2Uoa2V5Lmxlbmd0aClcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cdHRocm93IG5ldyBFcnJvcihcImludmFsaWQgXCIgKyBUb2tlblR5cGVbdG9rZW4udHlwZV0udG9Mb3dlckNhc2UoKSArIFwiLCBleHBlY3RlZCBvbmUgb2YgXCIgKyBhbGxvd2VkLmpvaW4oXCIsIFwiKSk7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodChjKSAyMDE0IEFCQiBTd2l0emVybGFuZCBMdGQuXG4gKlxuICogUGVyaW9kaWMgaW50ZXJ2YWwgZnVuY3Rpb25zXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lVW5pdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRGF0ZVRpbWUgfSBmcm9tIFwiLi9kYXRldGltZVwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiLi9kdXJhdGlvblwiO1xuaW1wb3J0IHsgVGltZVpvbmUsIFRpbWVab25lS2luZCB9IGZyb20gXCIuL3RpbWV6b25lXCI7XG5cbi8qKlxuICogU3BlY2lmaWVzIGhvdyB0aGUgcGVyaW9kIHNob3VsZCByZXBlYXQgYWNyb3NzIHRoZSBkYXlcbiAqIGR1cmluZyBEU1QgY2hhbmdlcy5cbiAqL1xuZXhwb3J0IGVudW0gUGVyaW9kRHN0IHtcblx0LyoqXG5cdCAqIEtlZXAgcmVwZWF0aW5nIGluIHNpbWlsYXIgaW50ZXJ2YWxzIG1lYXN1cmVkIGluIFVUQyxcblx0ICogdW5hZmZlY3RlZCBieSBEYXlsaWdodCBTYXZpbmcgVGltZS5cblx0ICogRS5nLiBhIHJlcGV0aXRpb24gb2Ygb25lIGhvdXIgd2lsbCB0YWtlIG9uZSByZWFsIGhvdXJcblx0ICogZXZlcnkgdGltZSwgZXZlbiBpbiBhIHRpbWUgem9uZSB3aXRoIERTVC5cblx0ICogTGVhcCBzZWNvbmRzLCBsZWFwIGRheXMgYW5kIG1vbnRoIGxlbmd0aFxuXHQgKiBkaWZmZXJlbmNlcyB3aWxsIHN0aWxsIG1ha2UgdGhlIGludGVydmFscyBkaWZmZXJlbnQuXG5cdCAqL1xuXHRSZWd1bGFySW50ZXJ2YWxzLFxuXG5cdC8qKlxuXHQgKiBFbnN1cmUgdGhhdCB0aGUgdGltZSBhdCB3aGljaCB0aGUgaW50ZXJ2YWxzIG9jY3VyIHN0YXlcblx0ICogYXQgdGhlIHNhbWUgcGxhY2UgaW4gdGhlIGRheSwgbG9jYWwgdGltZS4gU28gZS5nLlxuXHQgKiBhIHBlcmlvZCBvZiBvbmUgZGF5LCByZWZlcmVuY2VpbmcgYXQgODowNUFNIEV1cm9wZS9BbXN0ZXJkYW0gdGltZVxuXHQgKiB3aWxsIGFsd2F5cyByZWZlcmVuY2UgYXQgODowNSBFdXJvcGUvQW1zdGVyZGFtLiBUaGlzIG1lYW5zIHRoYXRcblx0ICogaW4gVVRDIHRpbWUsIHNvbWUgaW50ZXJ2YWxzIHdpbGwgYmUgMjUgaG91cnMgYW5kIHNvbWVcblx0ICogMjMgaG91cnMgZHVyaW5nIERTVCBjaGFuZ2VzLlxuXHQgKiBBbm90aGVyIGV4YW1wbGU6IGFuIGhvdXJseSBpbnRlcnZhbCB3aWxsIGJlIGhvdXJseSBpbiBsb2NhbCB0aW1lLFxuXHQgKiBza2lwcGluZyBhbiBob3VyIGluIFVUQyBmb3IgYSBEU1QgYmFja3dhcmQgY2hhbmdlLlxuXHQgKi9cblx0UmVndWxhckxvY2FsVGltZSxcblxuXHQvKipcblx0ICogRW5kLW9mLWVudW0gbWFya2VyXG5cdCAqL1xuXHRNQVhcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgUGVyaW9kRHN0IHRvIGEgc3RyaW5nOiBcInJlZ3VsYXIgaW50ZXJ2YWxzXCIgb3IgXCJyZWd1bGFyIGxvY2FsIHRpbWVcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyaW9kRHN0VG9TdHJpbmcocDogUGVyaW9kRHN0KTogc3RyaW5nIHtcblx0c3dpdGNoIChwKSB7XG5cdFx0Y2FzZSBQZXJpb2REc3QuUmVndWxhckludGVydmFsczogcmV0dXJuIFwicmVndWxhciBpbnRlcnZhbHNcIjtcblx0XHRjYXNlIFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lOiByZXR1cm4gXCJyZWd1bGFyIGxvY2FsIHRpbWVcIjtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFBlcmlvZERzdFwiKTtcblx0XHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFJlcGVhdGluZyB0aW1lIHBlcmlvZDogY29uc2lzdHMgb2YgYSByZWZlcmVuY2UgZGF0ZSBhbmRcbiAqIGEgdGltZSBsZW5ndGguIFRoaXMgY2xhc3MgYWNjb3VudHMgZm9yIGxlYXAgc2Vjb25kcyBhbmQgbGVhcCBkYXlzLlxuICovXG5leHBvcnQgY2xhc3MgUGVyaW9kIHtcblxuXHQvKipcblx0ICogUmVmZXJlbmNlIG1vbWVudCBvZiBwZXJpb2Rcblx0ICovXG5cdHByaXZhdGUgX3JlZmVyZW5jZTogRGF0ZVRpbWU7XG5cblx0LyoqXG5cdCAqIEludGVydmFsXG5cdCAqL1xuXHRwcml2YXRlIF9pbnRlcnZhbDogRHVyYXRpb247XG5cblx0LyoqXG5cdCAqIERTVCBoYW5kbGluZ1xuXHQgKi9cblx0cHJpdmF0ZSBfZHN0OiBQZXJpb2REc3Q7XG5cblx0LyoqXG5cdCAqIE5vcm1hbGl6ZWQgcmVmZXJlbmNlIGRhdGUsIGhhcyBkYXktb2YtbW9udGggPD0gMjggZm9yIE1vbnRobHlcblx0ICogcGVyaW9kLCBvciBmb3IgWWVhcmx5IHBlcmlvZCBpZiBtb250aCBpcyBGZWJydWFyeVxuXHQgKi9cblx0cHJpdmF0ZSBfaW50UmVmZXJlbmNlOiBEYXRlVGltZTtcblxuXHQvKipcblx0ICogTm9ybWFsaXplZCBpbnRlcnZhbFxuXHQgKi9cblx0cHJpdmF0ZSBfaW50SW50ZXJ2YWw6IER1cmF0aW9uO1xuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVkIGludGVybmFsIERTVCBoYW5kbGluZy4gSWYgRFNUIGhhbmRsaW5nIGlzIGlycmVsZXZhbnRcblx0ICogKGJlY2F1c2UgdGhlIHJlZmVyZW5jZSB0aW1lIHpvbmUgZG9lcyBub3QgaGF2ZSBEU1QpXG5cdCAqIHRoZW4gaXQgaXMgc2V0IHRvIFJlZ3VsYXJJbnRlcnZhbFxuXHQgKi9cblx0cHJpdmF0ZSBfaW50RHN0OiBQZXJpb2REc3Q7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqIExJTUlUQVRJT046IGlmIGRzdCBlcXVhbHMgUmVndWxhckxvY2FsVGltZSwgYW5kIHVuaXQgaXMgU2Vjb25kLCBNaW51dGUgb3IgSG91cixcblx0ICogdGhlbiB0aGUgYW1vdW50IG11c3QgYmUgYSBmYWN0b3Igb2YgMjQuIFNvIDEyMCBzZWNvbmRzIGlzIGFsbG93ZWQgd2hpbGUgMTIxIHNlY29uZHMgaXMgbm90LlxuXHQgKiBUaGlzIGlzIGR1ZSB0byB0aGUgZW5vcm1vdXMgcHJvY2Vzc2luZyBwb3dlciByZXF1aXJlZCBieSB0aGVzZSBjYXNlcy4gVGhleSBhcmUgbm90XG5cdCAqIGltcGxlbWVudGVkIGFuZCB5b3Ugd2lsbCBnZXQgYW4gYXNzZXJ0LlxuXHQgKlxuXHQgKiBAcGFyYW0gcmVmZXJlbmNlIFRoZSByZWZlcmVuY2UgZGF0ZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgdGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXG5cdCAqIEBwYXJhbSBpbnRlcnZhbCBUaGUgaW50ZXJ2YWwgb2YgdGhlIHBlcmlvZFxuXHQgKiBAcGFyYW0gZHN0IFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIERheWxpZ2h0IFNhdmluZyBUaW1lLiBOb3QgcmVsZXZhbnRcblx0ICogICAgICAgICAgICBpZiB0aGUgdGltZSB6b25lIG9mIHRoZSByZWZlcmVuY2UgZGF0ZXRpbWUgZG9lcyBub3QgaGF2ZSBEU1QuXG5cdCAqICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0aW50ZXJ2YWw6IER1cmF0aW9uLFxuXHRcdGRzdD86IFBlcmlvZERzdFxuXHQpO1xuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICogTElNSVRBVElPTjogaWYgZHN0IGVxdWFscyBSZWd1bGFyTG9jYWxUaW1lLCBhbmQgdW5pdCBpcyBTZWNvbmQsIE1pbnV0ZSBvciBIb3VyLFxuXHQgKiB0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBhIGZhY3RvciBvZiAyNC4gU28gMTIwIHNlY29uZHMgaXMgYWxsb3dlZCB3aGlsZSAxMjEgc2Vjb25kcyBpcyBub3QuXG5cdCAqIFRoaXMgaXMgZHVlIHRvIHRoZSBlbm9ybW91cyBwcm9jZXNzaW5nIHBvd2VyIHJlcXVpcmVkIGJ5IHRoZXNlIGNhc2VzLiBUaGV5IGFyZSBub3Rcblx0ICogaW1wbGVtZW50ZWQgYW5kIHlvdSB3aWxsIGdldCBhbiBhc3NlcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSByZWZlcmVuY2UgVGhlIHJlZmVyZW5jZSBvZiB0aGUgcGVyaW9kLiBJZiB0aGUgcGVyaW9kIGlzIGluIE1vbnRocyBvciBZZWFycywgYW5kXG5cdCAqICAgICAgICAgICAgICAgICAgdGhlIGRheSBpcyAyOSBvciAzMCBvciAzMSwgdGhlIHJlc3VsdHMgYXJlIG1heGltaXNlZCB0byBlbmQtb2YtbW9udGguXG5cdCAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBvZiB1bml0cy5cblx0ICogQHBhcmFtIHVuaXQgVGhlIHVuaXQuXG5cdCAqIEBwYXJhbSBkc3QgU3BlY2lmaWVzIGhvdyB0byBoYW5kbGUgRGF5bGlnaHQgU2F2aW5nIFRpbWUuIE5vdCByZWxldmFudFxuXHQgKiAgICAgICAgICAgICAgaWYgdGhlIHRpbWUgem9uZSBvZiB0aGUgcmVmZXJlbmNlIGRhdGV0aW1lIGRvZXMgbm90IGhhdmUgRFNULlxuXHQgKiAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gUmVndWxhckxvY2FsVGltZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJlZmVyZW5jZTogRGF0ZVRpbWUsXG5cdFx0YW1vdW50OiBudW1iZXIsXG5cdFx0dW5pdDogVGltZVVuaXQsXG5cdFx0ZHN0PzogUGVyaW9kRHN0XG5cdCk7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbi4gU2VlIG90aGVyIGNvbnN0cnVjdG9ycyBmb3IgZXhwbGFuYXRpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRyZWZlcmVuY2U6IERhdGVUaW1lLFxuXHRcdGFtb3VudE9ySW50ZXJ2YWw6IGFueSxcblx0XHR1bml0T3JEc3Q/OiBhbnksXG5cdFx0Z2l2ZW5Ec3Q/OiBQZXJpb2REc3Rcblx0KSB7XG5cblx0XHRsZXQgaW50ZXJ2YWw6IER1cmF0aW9uO1xuXHRcdGxldCBkc3Q6IFBlcmlvZERzdCA9IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lO1xuXHRcdGlmICh0eXBlb2YgKGFtb3VudE9ySW50ZXJ2YWwpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRpbnRlcnZhbCA9IGFtb3VudE9ySW50ZXJ2YWwgYXMgRHVyYXRpb247XG5cdFx0XHRkc3QgPSB1bml0T3JEc3QgYXMgUGVyaW9kRHN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhc3NlcnQodHlwZW9mIHVuaXRPckRzdCA9PT0gXCJudW1iZXJcIiAmJiB1bml0T3JEc3QgPj0gMCAmJiB1bml0T3JEc3QgPCBUaW1lVW5pdC5NQVgsIFwiSW52YWxpZCB1bml0XCIpO1xuXHRcdFx0aW50ZXJ2YWwgPSBuZXcgRHVyYXRpb24oYW1vdW50T3JJbnRlcnZhbCBhcyBudW1iZXIsIHVuaXRPckRzdCBhcyBUaW1lVW5pdCk7XG5cdFx0XHRkc3QgPSBnaXZlbkRzdCBhcyBQZXJpb2REc3Q7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgZHN0ICE9PSBcIm51bWJlclwiKSB7XG5cdFx0XHRkc3QgPSBQZXJpb2REc3QuUmVndWxhckxvY2FsVGltZTtcblx0XHR9XG5cdFx0YXNzZXJ0KGRzdCA+PSAwICYmIGRzdCA8IFBlcmlvZERzdC5NQVgsIFwiSW52YWxpZCBQZXJpb2REc3Qgc2V0dGluZ1wiKTtcblx0XHRhc3NlcnQoISFyZWZlcmVuY2UsIFwiUmVmZXJlbmNlIHRpbWUgbm90IGdpdmVuXCIpO1xuXHRcdGFzc2VydChpbnRlcnZhbC5hbW91bnQoKSA+IDAsIFwiQW1vdW50IG11c3QgYmUgcG9zaXRpdmUgbm9uLXplcm8uXCIpO1xuXHRcdGFzc2VydChNYXRoLmZsb29yKGludGVydmFsLmFtb3VudCgpKSA9PT0gaW50ZXJ2YWwuYW1vdW50KCksIFwiQW1vdW50IG11c3QgYmUgYSB3aG9sZSBudW1iZXJcIik7XG5cblx0XHR0aGlzLl9yZWZlcmVuY2UgPSByZWZlcmVuY2U7XG5cdFx0dGhpcy5faW50ZXJ2YWwgPSBpbnRlcnZhbDtcblx0XHR0aGlzLl9kc3QgPSBkc3Q7XG5cdFx0dGhpcy5fY2FsY0ludGVybmFsVmFsdWVzKCk7XG5cblx0XHQvLyByZWd1bGFyIGxvY2FsIHRpbWUga2VlcGluZyBpcyBvbmx5IHN1cHBvcnRlZCBpZiB3ZSBjYW4gcmVzZXQgZWFjaCBkYXlcblx0XHQvLyBOb3RlIHdlIHVzZSBpbnRlcm5hbCBhbW91bnRzIHRvIGRlY2lkZSB0aGlzIGJlY2F1c2UgYWN0dWFsbHkgaXQgaXMgc3VwcG9ydGVkIGlmXG5cdFx0Ly8gdGhlIGlucHV0IGlzIGEgbXVsdGlwbGUgb2Ygb25lIGRheS5cblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSAmJiBkc3QgPT09IFBlcmlvZERzdC5SZWd1bGFyTG9jYWxUaW1lKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAwMDAsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgODY0MDAsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMTQ0MCxcblx0XHRcdFx0XHRcdFwiV2hlbiB1c2luZyBIb3VyLCBNaW51dGUgb3IgKE1pbGxpKVNlY29uZCB1bml0cywgd2l0aCBSZWd1bGFyIExvY2FsIFRpbWVzLCBcIiArXG5cdFx0XHRcdFx0XHRcInRoZW4gdGhlIGFtb3VudCBtdXN0IGJlIGVpdGhlciBsZXNzIHRoYW4gYSBkYXkgb3IgYSBtdWx0aXBsZSBvZiB0aGUgbmV4dCB1bml0LlwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdGFzc2VydChcblx0XHRcdFx0XHRcdHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgMjQsXG5cdFx0XHRcdFx0XHRcIldoZW4gdXNpbmcgSG91ciwgTWludXRlIG9yIChNaWxsaSlTZWNvbmQgdW5pdHMsIHdpdGggUmVndWxhciBMb2NhbCBUaW1lcywgXCIgK1xuXHRcdFx0XHRcdFx0XCJ0aGVuIHRoZSBhbW91bnQgbXVzdCBiZSBlaXRoZXIgbGVzcyB0aGFuIGEgZGF5IG9yIGEgbXVsdGlwbGUgb2YgdGhlIG5leHQgdW5pdC5cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybiBhIGZyZXNoIGNvcHkgb2YgdGhlIHBlcmlvZFxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IFBlcmlvZCB7XG5cdFx0cmV0dXJuIG5ldyBQZXJpb2QodGhpcy5fcmVmZXJlbmNlLCB0aGlzLl9pbnRlcnZhbCwgdGhpcy5fZHN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgcmVmZXJlbmNlIGRhdGVcblx0ICovXG5cdHB1YmxpYyByZWZlcmVuY2UoKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLl9yZWZlcmVuY2U7XG5cdH1cblxuXHQvKipcblx0ICogREVQUkVDQVRFRDogb2xkIG5hbWUgZm9yIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHQgKi9cblx0cHVibGljIHN0YXJ0KCk6IERhdGVUaW1lIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIGludGVydmFsKCk6IER1cmF0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwuY2xvbmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHVuaXRzIG9mIHRoZSBpbnRlcnZhbFxuXHQgKi9cblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLl9pbnRlcnZhbC5hbW91bnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdW5pdCBvZiB0aGUgaW50ZXJ2YWxcblx0ICovXG5cdHB1YmxpYyB1bml0KCk6IFRpbWVVbml0IHtcblx0XHRyZXR1cm4gdGhpcy5faW50ZXJ2YWwudW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBkc3QgaGFuZGxpbmcgbW9kZVxuXHQgKi9cblx0cHVibGljIGRzdCgpOiBQZXJpb2REc3Qge1xuXHRcdHJldHVybiB0aGlzLl9kc3Q7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIHBlcmlvZCBncmVhdGVyIHRoYW5cblx0ICogdGhlIGdpdmVuIGRhdGUuIFRoZSBnaXZlbiBkYXRlIG5lZWQgbm90IGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LlxuXHQgKiBQcmU6IHRoZSBmcm9tZGF0ZSBhbmQgcmVmZXJlbmNlIGRhdGUgbXVzdCBlaXRoZXIgYm90aCBoYXZlIHRpbWV6b25lcyBvciBub3Rcblx0ICogQHBhcmFtIGZyb21EYXRlOiB0aGUgZGF0ZSBhZnRlciB3aGljaCB0byByZXR1cm4gdGhlIG5leHQgZGF0ZVxuXHQgKiBAcmV0dXJuIHRoZSBmaXJzdCBkYXRlIG1hdGNoaW5nIHRoZSBwZXJpb2QgYWZ0ZXIgZnJvbURhdGUsIGdpdmVuIGluIHRoZSBzYW1lIHpvbmUgYXMgdGhlIGZyb21EYXRlLlxuXHQgKi9cblx0cHVibGljIGZpbmRGaXJzdChmcm9tRGF0ZTogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIWZyb21EYXRlLnpvbmUoKSxcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2UgZGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiXG5cdFx0KTtcblx0XHRsZXQgYXBwcm94OiBEYXRlVGltZTtcblx0XHRsZXQgYXBwcm94MjogRGF0ZVRpbWU7XG5cdFx0bGV0IGFwcHJveE1pbjogRGF0ZVRpbWU7XG5cdFx0bGV0IHBlcmlvZHM6IG51bWJlcjtcblx0XHRsZXQgZGlmZjogbnVtYmVyO1xuXHRcdGxldCBuZXdZZWFyOiBudW1iZXI7XG5cdFx0bGV0IHJlbWFpbmRlcjogbnVtYmVyO1xuXHRcdGxldCBpbWF4OiBudW1iZXI7XG5cdFx0bGV0IGltaW46IG51bWJlcjtcblx0XHRsZXQgaW1pZDogbnVtYmVyO1xuXG5cdFx0Y29uc3Qgbm9ybWFsRnJvbSA9IHRoaXMuX25vcm1hbGl6ZURheShmcm9tRGF0ZS50b1pvbmUodGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSkpO1xuXG5cdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpID09PSAxKSB7XG5cdFx0XHQvLyBzaW1wbGUgY2FzZXM6IGFtb3VudCBlcXVhbHMgMSAoZWxpbWluYXRlcyBuZWVkIGZvciBzZWFyY2hpbmcgZm9yIHJlZmVyZW5jZWluZyBwb2ludClcblx0XHRcdGlmICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzKSB7XG5cdFx0XHRcdC8vIGFwcGx5IHRvIFVUQyB0aW1lXG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNZZWFyKCksIG5vcm1hbEZyb20udXRjTW9udGgoKSwgbm9ybWFsRnJvbS51dGNEYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS51dGNIb3VyKCksIG5vcm1hbEZyb20udXRjTWludXRlKCksIG5vcm1hbEZyb20udXRjU2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaWxsaXNlY29uZCgpLCBUaW1lWm9uZS51dGMoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCBub3JtYWxGcm9tLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y0hvdXIoKSwgbm9ybWFsRnJvbS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCBub3JtYWxGcm9tLnV0Y01vbnRoKCksIG5vcm1hbEZyb20udXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnV0Y1llYXIoKSwgbm9ybWFsRnJvbS51dGNNb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjRGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS51dGNIb3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNaW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y1NlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWlsbGlzZWNvbmQoKSwgVGltZVpvbmUudXRjKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20udXRjWWVhcigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTW9udGgoKSwgdGhpcy5faW50UmVmZXJlbmNlLnV0Y0RheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UudXRjSG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UudXRjTWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS51dGNTZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLnV0Y01pbGxpc2Vjb25kKCksIFRpbWVab25lLnV0YygpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIGludGVydmFsc1xuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCBub3JtYWxGcm9tLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGFwcHJveCA9IG5ldyBEYXRlVGltZShcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIG5vcm1hbEZyb20uc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20uaG91cigpLCBub3JtYWxGcm9tLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCksIHRoaXMuX2ludFJlZmVyZW5jZS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBBbW91bnQgaXMgbm90IDEsXG5cdFx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuXHRcdFx0XHQvLyBhcHBseSB0byBVVEMgdGltZVxuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSkge1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6XG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkubWlsbGlzZWNvbmRzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5zZWNvbmRzKCk7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZTpcblx0XHRcdFx0XHRcdC8vIG9ubHkgMjUgbGVhcCBzZWNvbmRzIGhhdmUgZXZlciBiZWVuIGFkZGVkIHNvIHRoaXMgc2hvdWxkIHN0aWxsIGJlIE9LLlxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20uZGlmZih0aGlzLl9pbnRSZWZlcmVuY2UpLm1pbnV0ZXMoKTtcblx0XHRcdFx0XHRcdHBlcmlvZHMgPSBNYXRoLmZsb29yKGRpZmYgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSB0aGlzLl9pbnRSZWZlcmVuY2UuYWRkKHBlcmlvZHMgKiB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjpcblx0XHRcdFx0XHRcdGRpZmYgPSBub3JtYWxGcm9tLmRpZmYodGhpcy5faW50UmVmZXJlbmNlKS5ob3VycygpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6XG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGQocGVyaW9kcyAqIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDpcblx0XHRcdFx0XHRcdGRpZmYgPSAobm9ybWFsRnJvbS51dGNZZWFyKCkgLSB0aGlzLl9pbnRSZWZlcmVuY2UudXRjWWVhcigpKSAqIDEyICtcblx0XHRcdFx0XHRcdFx0KG5vcm1hbEZyb20udXRjTW9udGgoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS51dGNNb250aCgpKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0YXBwcm94ID0gdGhpcy5faW50UmVmZXJlbmNlLmFkZChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlllYXIpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lVW5pdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR3aGlsZSAoIWFwcHJveC5ncmVhdGVyVGhhbihmcm9tRGF0ZSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUcnkgdG8ga2VlcCByZWd1bGFyIGxvY2FsIHRpbWVzLiBJZiB0aGUgdW5pdCBpcyBsZXNzIHRoYW4gYSBkYXksIHdlIHJlZmVyZW5jZSBlYWNoIGRheSBhbmV3XG5cdFx0XHRcdHN3aXRjaCAodGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKSB7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDpcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDEwMDAgJiYgKDEwMDAgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBzYW1lIG1pbGxpc2Vjb25kIGVhY2ggc2Vjb25kLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBzZWNvbmQgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbGxpc2Vjb25kc1xuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLmhvdXIoKSwgbm9ybWFsRnJvbS5taW51dGUoKSwgbm9ybWFsRnJvbS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5TZWNvbmQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvXG5cdFx0XHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvZiB0aGUgc2hvcnRlciBpbnRlcnZhbCBhdCB0aGUgYm91bmRhcnlcblx0XHRcdFx0XHRcdFx0cmVtYWluZGVyID0gTWF0aC5mbG9vcigoODY0MDAwMDApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG9kb1xuXHRcdFx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guc3ViTG9jYWwocmVtYWluZGVyLCBUaW1lVW5pdC5NaWxsaXNlY29uZCkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbGxpc2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMDAwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRhcHByb3hNaW4gPSBhcHByb3gyLnN1YkxvY2FsKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpLCBUaW1lVW5pdC5NaWxsaXNlY29uZCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveDIuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkgJiYgYXBwcm94TWluLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94Mjtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXBwcm94Mi5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtaW4gaW5kZXggdG8gc2VhcmNoIHVwcGVyIHN1YmFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpbWluID0gaW1pZCArIDE7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoYW5nZSBtYXggaW5kZXggdG8gc2VhcmNoIGxvd2VyIHN1YmFycmF5XG5cdFx0XHRcdFx0XHRcdFx0XHRpbWF4ID0gaW1pZCAtIDE7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDpcblx0XHRcdFx0XHRcdGlmICh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSA8IDYwICYmICg2MCAlIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHQvLyBvcHRpbWl6YXRpb246IHNhbWUgc2Vjb25kIGVhY2ggbWludXRlLCBzbyBqdXN0IHRha2UgdGhlIGZyb21EYXRlXG5cdFx0XHRcdFx0XHRcdC8vIG1pbnVzIG9uZSBtaW51dGUgd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIHNlY29uZHNcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIG5vcm1hbEZyb20ubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC5zdWJMb2NhbCgxLCBUaW1lVW5pdC5NaW51dGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgYXJlIGxlc3MgdGhhbiBhIGRheSwgc28ganVzdCBnbyB0aGUgZnJvbURhdGUgcmVmZXJlbmNlLW9mLWRheVxuXHRcdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS55ZWFyKCksIG5vcm1hbEZyb20ubW9udGgoKSwgbm9ybWFsRnJvbS5kYXkoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LCB3ZSBoYXZlIHRvIHRha2Vcblx0XHRcdFx0XHRcdFx0Ly8gYXJlIG9mIHRoZSBzaG9ydGVyIGludGVydmFsIGF0IHRoZSBib3VuZGFyeVxuXHRcdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKCg4NjQwMCkgJSB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGlmIChhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIG91dHNpZGUgdGhlIGJvdW5kYXJ5IHBlcmlvZCBiZWZvcmUgdGhlIHJlZmVyZW5jZSBkYXRlXG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuU2Vjb25kKS5sZXNzRXF1YWwobm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBpbiB0aGUgYm91bmRhcnkgcGVyaW9kLCBtb3ZlIHRvIHRoZSBuZXh0IGRheVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly8gb3B0aW1pemF0aW9uOiBiaW5hcnkgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdGltYXggPSBNYXRoLmZsb29yKCg4NjQwMCkgLyB0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSk7XG5cdFx0XHRcdFx0XHRcdGltaW4gPSAwO1xuXHRcdFx0XHRcdFx0XHR3aGlsZSAoaW1heCA+PSBpbWluKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIHRoZSBtaWRwb2ludCBmb3Igcm91Z2hseSBlcXVhbCBwYXJ0aXRpb25cblx0XHRcdFx0XHRcdFx0XHRpbWlkID0gTWF0aC5mbG9vcigoaW1pbiArIGltYXgpIC8gMik7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94MiA9IGFwcHJveC5hZGRMb2NhbChpbWlkICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIFRpbWVVbml0LlNlY29uZCk7XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94TWluID0gYXBwcm94Mi5zdWJMb2NhbCh0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSwgVGltZVVuaXQuU2Vjb25kKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94Mi5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSAmJiBhcHByb3hNaW4ubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3gyO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcHByb3gyLmxlc3NFcXVhbChub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1pbiBpbmRleCB0byBzZWFyY2ggdXBwZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltaW4gPSBpbWlkICsgMTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hhbmdlIG1heCBpbmRleCB0byBzZWFyY2ggbG93ZXIgc3ViYXJyYXlcblx0XHRcdFx0XHRcdFx0XHRcdGltYXggPSBpbWlkIC0gMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpIDwgNjAgJiYgKDYwICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG9wdGltaXphdGlvbjogc2FtZSBob3VyIHRoaXMuX2ludFJlZmVyZW5jZWFyeSBlYWNoIHRpbWUsIHNvIGp1c3QgdGFrZSB0aGUgZnJvbURhdGUgbWludXMgb25lIGhvdXJcblx0XHRcdFx0XHRcdFx0Ly8gd2l0aCB0aGUgdGhpcy5faW50UmVmZXJlbmNlIG1pbnV0ZXMsIHNlY29uZHNcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0bm9ybWFsRnJvbS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5taWxsaXNlY29uZCgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnN1YkxvY2FsKDEsIFRpbWVVbml0LkhvdXIpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gcGVyIGNvbnN0cnVjdG9yIGFzc2VydCwgdGhlIHNlY29uZHMgZml0IGluIGEgZGF5LCBzbyBqdXN0IGdvIHRoZSBmcm9tRGF0ZSBwcmV2aW91cyBkYXlcblx0XHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbEZyb20ueWVhcigpLCBub3JtYWxGcm9tLm1vbnRoKCksIG5vcm1hbEZyb20uZGF5KCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLmhvdXIoKSwgdGhpcy5faW50UmVmZXJlbmNlLm1pbnV0ZSgpLCB0aGlzLl9pbnRSZWZlcmVuY2Uuc2Vjb25kKCksXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHQvLyBzaW5jZSB3ZSBzdGFydCBjb3VudGluZyBmcm9tIHRoaXMuX2ludFJlZmVyZW5jZSBlYWNoIGRheSxcblx0XHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRcdHJlbWFpbmRlciA9IE1hdGguZmxvb3IoKDI0ICogNjApICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LmdyZWF0ZXJUaGFuKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIG5vcm1hbEZyb20gbGllcyBvdXRzaWRlIHRoZSBib3VuZGFyeSBwZXJpb2QgYmVmb3JlIHRoZSByZWZlcmVuY2UgZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LnN1YkxvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcHByb3guYWRkTG9jYWwoMSwgVGltZVVuaXQuRGF5KS5zdWJMb2NhbChyZW1haW5kZXIsIFRpbWVVbml0Lk1pbnV0ZSkubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgaW4gdGhlIGJvdW5kYXJ5IHBlcmlvZCwgbW92ZSB0byB0aGUgbmV4dCBkYXlcblx0XHRcdFx0XHRcdFx0XHRcdGFwcHJveCA9IGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOlxuXHRcdFx0XHRcdFx0YXBwcm94ID0gbmV3IERhdGVUaW1lKFxuXHRcdFx0XHRcdFx0XHRub3JtYWxGcm9tLnllYXIoKSwgbm9ybWFsRnJvbS5tb250aCgpLCBub3JtYWxGcm9tLmRheSgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UuaG91cigpLCB0aGlzLl9pbnRSZWZlcmVuY2UubWludXRlKCksIHRoaXMuX2ludFJlZmVyZW5jZS5zZWNvbmQoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50UmVmZXJlbmNlLm1pbGxpc2Vjb25kKCksIHRoaXMuX2ludFJlZmVyZW5jZS56b25lKClcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdC8vIHNpbmNlIHdlIHN0YXJ0IGNvdW50aW5nIGZyb20gdGhpcy5faW50UmVmZXJlbmNlIGVhY2ggZGF5LFxuXHRcdFx0XHRcdFx0Ly8gd2UgaGF2ZSB0byB0YWtlIGNhcmUgb2YgdGhlIHNob3J0ZXIgaW50ZXJ2YWwgYXQgdGhlIGJvdW5kYXJ5XG5cdFx0XHRcdFx0XHRyZW1haW5kZXIgPSBNYXRoLmZsb29yKDI0ICUgdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0aWYgKGFwcHJveC5ncmVhdGVyVGhhbihub3JtYWxGcm9tKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoYXBwcm94LnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikuZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBub3JtYWxGcm9tIGxpZXMgb3V0c2lkZSB0aGUgYm91bmRhcnkgcGVyaW9kIGJlZm9yZSB0aGUgcmVmZXJlbmNlIGRhdGVcblx0XHRcdFx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guc3ViTG9jYWwoMSwgVGltZVVuaXQuRGF5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKGFwcHJveC5hZGRMb2NhbCgxLCBUaW1lVW5pdC5EYXkpLnN1YkxvY2FsKHJlbWFpbmRlciwgVGltZVVuaXQuSG91cikubGVzc0VxdWFsKG5vcm1hbEZyb20pKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm9ybWFsRnJvbSBsaWVzIGluIHRoZSBib3VuZGFyeSBwZXJpb2QsIG1vdmUgdG8gdGhlIG5leHQgZGF5XG5cdFx0XHRcdFx0XHRcdFx0YXBwcm94ID0gYXBwcm94LmFkZExvY2FsKDEsIFRpbWVVbml0LkRheSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OlxuXHRcdFx0XHRcdFx0Ly8gd2UgZG9uJ3QgaGF2ZSBsZWFwIGRheXMsIHNvIHdlIGNhbiBhcHByb3hpbWF0ZSBieSBjYWxjdWxhdGluZyB3aXRoIFVUQyB0aW1lc3RhbXBzXG5cdFx0XHRcdFx0XHRkaWZmID0gbm9ybWFsRnJvbS5kaWZmKHRoaXMuX2ludFJlZmVyZW5jZSkuaG91cnMoKSAvIDI0O1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbChwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOlxuXHRcdFx0XHRcdFx0ZGlmZiA9IChub3JtYWxGcm9tLnllYXIoKSAtIHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkpICogMTIgK1xuXHRcdFx0XHRcdFx0XHQobm9ybWFsRnJvbS5tb250aCgpIC0gdGhpcy5faW50UmVmZXJlbmNlLm1vbnRoKCkpO1xuXHRcdFx0XHRcdFx0cGVyaW9kcyA9IE1hdGguZmxvb3IoZGlmZiAvIHRoaXMuX2ludEludGVydmFsLmFtb3VudCgpKTtcblx0XHRcdFx0XHRcdGFwcHJveCA9IHRoaXMuX2ludFJlZmVyZW5jZS5hZGRMb2NhbCh0aGlzLl9pbnRlcnZhbC5tdWx0aXBseShwZXJpb2RzKSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6XG5cdFx0XHRcdFx0XHQvLyBUaGUgLTEgYmVsb3cgaXMgYmVjYXVzZSB0aGUgZGF5LW9mLW1vbnRoIG9mIHJlZmVyZW5jZSBkYXRlIG1heSBiZSBhZnRlciB0aGUgZGF5IG9mIHRoZSBmcm9tRGF0ZVxuXHRcdFx0XHRcdFx0ZGlmZiA9IG5vcm1hbEZyb20ueWVhcigpIC0gdGhpcy5faW50UmVmZXJlbmNlLnllYXIoKSAtIDE7XG5cdFx0XHRcdFx0XHRwZXJpb2RzID0gTWF0aC5mbG9vcihkaWZmIC8gdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkpO1xuXHRcdFx0XHRcdFx0bmV3WWVhciA9IHRoaXMuX2ludFJlZmVyZW5jZS55ZWFyKCkgKyBwZXJpb2RzICogdGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCk7XG5cdFx0XHRcdFx0XHRhcHByb3ggPSBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdFx0XHRcdG5ld1llYXIsIHRoaXMuX2ludFJlZmVyZW5jZS5tb250aCgpLCB0aGlzLl9pbnRSZWZlcmVuY2UuZGF5KCksXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludFJlZmVyZW5jZS5ob3VyKCksIHRoaXMuX2ludFJlZmVyZW5jZS5taW51dGUoKSwgdGhpcy5faW50UmVmZXJlbmNlLnNlY29uZCgpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRSZWZlcmVuY2UubWlsbGlzZWNvbmQoKSwgdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVVuaXRcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0d2hpbGUgKCFhcHByb3guZ3JlYXRlclRoYW4obm9ybWFsRnJvbSkpIHtcblx0XHRcdFx0XHRhcHByb3ggPSBhcHByb3guYWRkTG9jYWwodGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCksIHRoaXMuX2ludEludGVydmFsLnVuaXQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkoYXBwcm94KS5jb252ZXJ0KGZyb21EYXRlLnpvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbmV4dCB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gaGFzIE1VQ0ggYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW4gZmluZEZpcnN0LlxuXHQgKiBSZXR1cm5zIHRoZSBkYXRldGltZSBcImNvdW50XCIgdGltZXMgYXdheSBmcm9tIHRoZSBnaXZlbiBkYXRldGltZS5cblx0ICogQHBhcmFtIHByZXZcdEJvdW5kYXJ5IGRhdGUuIE11c3QgaGF2ZSBhIHRpbWUgem9uZSAoYW55IHRpbWUgem9uZSkgaWZmIHRoZSBwZXJpb2QgcmVmZXJlbmNlIGRhdGUgaGFzIG9uZS5cblx0ICogQHBhcmFtIGNvdW50XHROdW1iZXIgb2YgcGVyaW9kcyB0byBhZGQuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG5cdCAqIEByZXR1cm4gKHByZXYgKyBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIHByZXYuXG5cdCAqL1xuXHRwdWJsaWMgZmluZE5leHQocHJldjogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xuXHRcdGFzc2VydCghIXByZXYsIFwiUHJldiBtdXN0IGJlIGdpdmVuXCIpO1xuXHRcdGFzc2VydChcblx0XHRcdCEhdGhpcy5faW50UmVmZXJlbmNlLnpvbmUoKSA9PT0gISFwcmV2LnpvbmUoKSxcblx0XHRcdFwiVGhlIGZyb21EYXRlIGFuZCByZWZlcmVuY2VEYXRlIG11c3QgYm90aCBiZSBhd2FyZSBvciB1bmF3YXJlXCJcblx0XHQpO1xuXHRcdGFzc2VydCh0eXBlb2YgKGNvdW50KSA9PT0gXCJudW1iZXJcIiwgXCJDb3VudCBtdXN0IGJlIGEgbnVtYmVyXCIpO1xuXHRcdGFzc2VydChNYXRoLmZsb29yKGNvdW50KSA9PT0gY291bnQsIFwiQ291bnQgbXVzdCBiZSBhbiBpbnRlZ2VyXCIpO1xuXHRcdGNvbnN0IG5vcm1hbGl6ZWRQcmV2ID0gdGhpcy5fbm9ybWFsaXplRGF5KHByZXYudG9ab25lKHRoaXMuX3JlZmVyZW5jZS56b25lKCkpKTtcblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBQZXJpb2REc3QuUmVndWxhckludGVydmFscykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2NvcnJlY3REYXkobm9ybWFsaXplZFByZXYuYWRkKFxuXHRcdFx0XHR0aGlzLl9pbnRJbnRlcnZhbC5hbW91bnQoKSAqIGNvdW50LCB0aGlzLl9pbnRJbnRlcnZhbC51bml0KCkpXG5cdFx0XHQpLmNvbnZlcnQocHJldi56b25lKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY29ycmVjdERheShub3JtYWxpemVkUHJldi5hZGRMb2NhbChcblx0XHRcdFx0dGhpcy5faW50SW50ZXJ2YWwuYW1vdW50KCkgKiBjb3VudCwgdGhpcy5faW50SW50ZXJ2YWwudW5pdCgpKVxuXHRcdFx0KS5jb252ZXJ0KHByZXYuem9uZSgpKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgcGVyaW9kIGxlc3MgdGhhblxuXHQgKiB0aGUgZ2l2ZW4gZGF0ZS4gVGhlIGdpdmVuIGRhdGUgbmVlZCBub3QgYmUgYXQgYSBwZXJpb2QgYm91bmRhcnkuXG5cdCAqIFByZTogdGhlIGZyb21kYXRlIGFuZCB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIG11c3QgZWl0aGVyIGJvdGggaGF2ZSB0aW1lem9uZXMgb3Igbm90XG5cdCAqIEBwYXJhbSBmcm9tRGF0ZTogdGhlIGRhdGUgYmVmb3JlIHdoaWNoIHRvIHJldHVybiB0aGUgbmV4dCBkYXRlXG5cdCAqIEByZXR1cm4gdGhlIGxhc3QgZGF0ZSBtYXRjaGluZyB0aGUgcGVyaW9kIGJlZm9yZSBmcm9tRGF0ZSwgZ2l2ZW5cblx0ICogICAgICAgICBpbiB0aGUgc2FtZSB6b25lIGFzIHRoZSBmcm9tRGF0ZS5cblx0ICovXG5cdHB1YmxpYyBmaW5kTGFzdChmcm9tOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5maW5kUHJldih0aGlzLmZpbmRGaXJzdChmcm9tKSk7XG5cdFx0aWYgKHJlc3VsdC5lcXVhbHMoZnJvbSkpIHtcblx0XHRcdHJlc3VsdCA9IHRoaXMuZmluZFByZXYocmVzdWx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyB0aW1lc3RhbXAgaW4gdGhlIHBlcmlvZC4gVGhlIGdpdmVuIHRpbWVzdGFtcCBtdXN0XG5cdCAqIGJlIGF0IGEgcGVyaW9kIGJvdW5kYXJ5LCBvdGhlcndpc2UgdGhlIGFuc3dlciBpcyBpbmNvcnJlY3QuXG5cdCAqIEBwYXJhbSBwcmV2XHRCb3VuZGFyeSBkYXRlLiBNdXN0IGhhdmUgYSB0aW1lIHpvbmUgKGFueSB0aW1lIHpvbmUpIGlmZiB0aGUgcGVyaW9kIHJlZmVyZW5jZSBkYXRlIGhhcyBvbmUuXG5cdCAqIEBwYXJhbSBjb3VudFx0TnVtYmVyIG9mIHBlcmlvZHMgdG8gc3VidHJhY3QuIE9wdGlvbmFsLiBNdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLCBtYXkgYmUgbmVnYXRpdmUuXG5cdCAqIEByZXR1cm4gKG5leHQgLSBjb3VudCAqIHBlcmlvZCksIGluIHRoZSBzYW1lIHRpbWV6b25lIGFzIG5leHQuXG5cdCAqL1xuXHRwdWJsaWMgZmluZFByZXYobmV4dDogRGF0ZVRpbWUsIGNvdW50OiBudW1iZXIgPSAxKTogRGF0ZVRpbWUge1xuXHRcdHJldHVybiB0aGlzLmZpbmROZXh0KG5leHQsIC0xICogY291bnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBkYXRlIGlzIG9uIGEgcGVyaW9kIGJvdW5kYXJ5XG5cdCAqIChleHBlbnNpdmUhKVxuXHQgKi9cblx0cHVibGljIGlzQm91bmRhcnkob2NjdXJyZW5jZTogRGF0ZVRpbWUpOiBib29sZWFuIHtcblx0XHRpZiAoIW9jY3VycmVuY2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ISF0aGlzLl9pbnRSZWZlcmVuY2Uuem9uZSgpID09PSAhIW9jY3VycmVuY2Uuem9uZSgpLFxuXHRcdFx0XCJUaGUgb2NjdXJyZW5jZSBhbmQgcmVmZXJlbmNlRGF0ZSBtdXN0IGJvdGggYmUgYXdhcmUgb3IgdW5hd2FyZVwiXG5cdFx0KTtcblx0XHRyZXR1cm4gKHRoaXMuZmluZEZpcnN0KG9jY3VycmVuY2Uuc3ViKER1cmF0aW9uLm1pbGxpc2Vjb25kcygxKSkpLmVxdWFscyhvY2N1cnJlbmNlKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzIHRoZSBnaXZlbiBvbmUuXG5cdCAqIGkuZS4gYSBwZXJpb2Qgb2YgMjQgaG91cnMgaXMgZXF1YWwgdG8gb25lIG9mIDEgZGF5IGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSBVVEMgcmVmZXJlbmNlIG1vbWVudFxuXHQgKiBhbmQgc2FtZSBkc3QuXG5cdCAqL1xuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcblx0XHQvLyBub3RlIHdlIHRha2UgdGhlIG5vbi1ub3JtYWxpemVkIF9yZWZlcmVuY2UgYmVjYXVzZSB0aGlzIGhhcyBhbiBpbmZsdWVuY2Ugb24gdGhlIG91dGNvbWVcblx0XHRpZiAoIXRoaXMuaXNCb3VuZGFyeShvdGhlci5fcmVmZXJlbmNlKSB8fCAhdGhpcy5faW50SW50ZXJ2YWwuZXF1YWxzKG90aGVyLl9pbnRJbnRlcnZhbCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmWm9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0Y29uc3Qgb3RoZXJab25lID0gb3RoZXIuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0Y29uc3QgdGhpc0lzUmVndWxhciA9ICh0aGlzLl9pbnREc3QgPT09IFBlcmlvZERzdC5SZWd1bGFySW50ZXJ2YWxzIHx8ICFyZWZab25lIHx8IHJlZlpvbmUuaXNVdGMoKSk7XG5cdFx0Y29uc3Qgb3RoZXJJc1JlZ3VsYXIgPSAob3RoZXIuX2ludERzdCA9PT0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHMgfHwgIW90aGVyWm9uZSB8fCBvdGhlclpvbmUuaXNVdGMoKSk7XG5cdFx0aWYgKHRoaXNJc1JlZ3VsYXIgJiYgb3RoZXJJc1JlZ3VsYXIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5faW50RHN0ID09PSBvdGhlci5faW50RHN0ICYmIHJlZlpvbmUgJiYgb3RoZXJab25lICYmIHJlZlpvbmUuZXF1YWxzKG90aGVyWm9uZSkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGlzIHBlcmlvZCB3YXMgY29uc3RydWN0ZWQgd2l0aCBpZGVudGljYWwgYXJndW1lbnRzIHRvIHRoZSBvdGhlciBvbmUuXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBQZXJpb2QpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMuX3JlZmVyZW5jZS5pZGVudGljYWwob3RoZXIuX3JlZmVyZW5jZSlcblx0XHRcdCYmIHRoaXMuX2ludGVydmFsLmlkZW50aWNhbChvdGhlci5faW50ZXJ2YWwpXG5cdFx0XHQmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gSVNPIGR1cmF0aW9uIHN0cmluZyBlLmcuXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxSFxuXHQgKiAyMDE0LTAxLTAxVDEyOjAwOjAwLjAwMCswMTowMC9QVDFNICAgKG9uZSBtaW51dGUpXG5cdCAqIDIwMTQtMDEtMDFUMTI6MDA6MDAuMDAwKzAxOjAwL1AxTSAgIChvbmUgbW9udGgpXG5cdCAqL1xuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVmZXJlbmNlLnRvSXNvU3RyaW5nKCkgKyBcIi9cIiArIHRoaXMuX2ludGVydmFsLnRvSXNvU3RyaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZS5nLlxuXHQgKiBcIjEwIHllYXJzLCByZWZlcmVuY2VpbmcgYXQgMjAxNC0wMy0wMVQxMjowMDowMCBFdXJvcGUvQW1zdGVyZGFtLCBrZWVwaW5nIHJlZ3VsYXIgaW50ZXJ2YWxzXCIuXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRsZXQgcmVzdWx0OiBzdHJpbmcgPSB0aGlzLl9pbnRlcnZhbC50b1N0cmluZygpICsgXCIsIHJlZmVyZW5jZWluZyBhdCBcIiArIHRoaXMuX3JlZmVyZW5jZS50b1N0cmluZygpO1xuXHRcdC8vIG9ubHkgYWRkIHRoZSBEU1QgaGFuZGxpbmcgaWYgaXQgaXMgcmVsZXZhbnRcblx0XHRpZiAodGhpcy5fZHN0UmVsZXZhbnQoKSkge1xuXHRcdFx0cmVzdWx0ICs9IFwiLCBrZWVwaW5nIFwiICsgcGVyaW9kRHN0VG9TdHJpbmcodGhpcy5fZHN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb3JyZWN0cyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIF9yZWZlcmVuY2UgYW5kIF9pbnRSZWZlcmVuY2UuXG5cdCAqL1xuXHRwcml2YXRlIF9jb3JyZWN0RGF5KGQ6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xuXHRcdGlmICh0aGlzLl9yZWZlcmVuY2UgIT09IHRoaXMuX2ludFJlZmVyZW5jZSkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcblx0XHRcdFx0ZC55ZWFyKCksIGQubW9udGgoKSwgTWF0aC5taW4oYmFzaWNzLmRheXNJbk1vbnRoKGQueWVhcigpLCBkLm1vbnRoKCkpLCB0aGlzLl9yZWZlcmVuY2UuZGF5KCkpLFxuXHRcdFx0XHRkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSwgZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBkO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJZiB0aGlzLl9pbnRlcm5hbFVuaXQgaW4gW01vbnRoLCBZZWFyXSwgbm9ybWFsaXplcyB0aGUgZGF5LW9mLW1vbnRoXG5cdCAqIHRvIDw9IDI4LlxuXHQgKiBAcmV0dXJuIGEgbmV3IGRhdGUgaWYgZGlmZmVyZW50LCBvdGhlcndpc2UgdGhlIGV4YWN0IHNhbWUgb2JqZWN0IChubyBjbG9uZSEpXG5cdCAqL1xuXHRwcml2YXRlIF9ub3JtYWxpemVEYXkoZDogRGF0ZVRpbWUsIGFueW1vbnRoOiBib29sZWFuID0gdHJ1ZSk6IERhdGVUaW1lIHtcblx0XHRpZiAoKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gVGltZVVuaXQuTW9udGggJiYgZC5kYXkoKSA+IDI4KVxuXHRcdFx0fHwgKHRoaXMuX2ludEludGVydmFsLnVuaXQoKSA9PT0gVGltZVVuaXQuWWVhciAmJiAoZC5tb250aCgpID09PSAyIHx8IGFueW1vbnRoKSAmJiBkLmRheSgpID4gMjgpXG5cdFx0XHQpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXG5cdFx0XHRcdGQueWVhcigpLCBkLm1vbnRoKCksIDI4LFxuXHRcdFx0XHRkLmhvdXIoKSwgZC5taW51dGUoKSwgZC5zZWNvbmQoKSxcblx0XHRcdFx0ZC5taWxsaXNlY29uZCgpLCBkLnpvbmUoKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBkOyAvLyBzYXZlIG9uIHRpbWUgYnkgbm90IHJldHVybmluZyBhIGNsb25lXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiBEU1QgaGFuZGxpbmcgaXMgcmVsZXZhbnQgZm9yIHVzLlxuXHQgKiAoaS5lLiBpZiB0aGUgcmVmZXJlbmNlIHRpbWUgem9uZSBoYXMgRFNUKVxuXHQgKi9cblx0cHJpdmF0ZSBfZHN0UmVsZXZhbnQoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgem9uZSA9IHRoaXMuX3JlZmVyZW5jZS56b25lKCk7XG5cdFx0cmV0dXJuICEhKHpvbmVcblx0XHRcdCYmIHpvbmUua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXG5cdFx0XHQmJiB6b25lLmhhc0RzdCgpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgdGhlIHZhbHVlcyB3aGVyZSBwb3NzaWJsZSAtIG5vdCBhbGwgdmFsdWVzXG5cdCAqIGFyZSBjb252ZXJ0aWJsZSBpbnRvIG9uZSBhbm90aGVyLiBXZWVrcyBhcmUgY29udmVydGVkIHRvIGRheXMuXG5cdCAqIEUuZy4gbW9yZSB0aGFuIDYwIG1pbnV0ZXMgaXMgdHJhbnNmZXJyZWQgdG8gaG91cnMsXG5cdCAqIGJ1dCBzZWNvbmRzIGNhbm5vdCBiZSB0cmFuc2ZlcnJlZCB0byBtaW51dGVzIGR1ZSB0byBsZWFwIHNlY29uZHMuXG5cdCAqIFdlZWtzIGFyZSBjb252ZXJ0ZWQgYmFjayB0byBkYXlzLlxuXHQgKi9cblx0cHJpdmF0ZSBfY2FsY0ludGVybmFsVmFsdWVzKCk6IHZvaWQge1xuXHRcdC8vIG5vcm1hbGl6ZSBhbnkgYWJvdmUtdW5pdCB2YWx1ZXNcblx0XHRsZXQgaW50QW1vdW50ID0gdGhpcy5faW50ZXJ2YWwuYW1vdW50KCk7XG5cdFx0bGV0IGludFVuaXQgPSB0aGlzLl9pbnRlcnZhbC51bml0KCk7XG5cblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTWlsbGlzZWNvbmQgJiYgaW50QW1vdW50ID49IDEwMDAgJiYgaW50QW1vdW50ICUgMTAwMCA9PT0gMCkge1xuXHRcdFx0Ly8gbm90ZSB0aGlzIHdvbid0IHdvcmsgaWYgd2UgYWNjb3VudCBmb3IgbGVhcCBzZWNvbmRzXG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMDAwO1xuXHRcdFx0aW50VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcblx0XHR9XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LlNlY29uZCAmJiBpbnRBbW91bnQgPj0gNjAgJiYgaW50QW1vdW50ICUgNjAgPT09IDApIHtcblx0XHRcdC8vIG5vdGUgdGhpcyB3b24ndCB3b3JrIGlmIHdlIGFjY291bnQgZm9yIGxlYXAgc2Vjb25kc1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuTWludXRlO1xuXHRcdH1cblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTWludXRlICYmIGludEFtb3VudCA+PSA2MCAmJiBpbnRBbW91bnQgJSA2MCA9PT0gMCkge1xuXHRcdFx0aW50QW1vdW50ID0gaW50QW1vdW50IC8gNjA7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuSG91cjtcblx0XHR9XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LkhvdXIgJiYgaW50QW1vdW50ID49IDI0ICYmIGludEFtb3VudCAlIDI0ID09PSAwKSB7XG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAyNDtcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5EYXk7XG5cdFx0fVxuXHRcdC8vIG5vdyByZW1vdmUgd2Vla3Mgc28gd2UgaGF2ZSBvbmUgbGVzcyBjYXNlIHRvIHdvcnJ5IGFib3V0XG5cdFx0aWYgKGludFVuaXQgPT09IFRpbWVVbml0LldlZWspIHtcblx0XHRcdGludEFtb3VudCA9IGludEFtb3VudCAqIDc7XG5cdFx0XHRpbnRVbml0ID0gVGltZVVuaXQuRGF5O1xuXHRcdH1cblx0XHRpZiAoaW50VW5pdCA9PT0gVGltZVVuaXQuTW9udGggJiYgaW50QW1vdW50ID49IDEyICYmIGludEFtb3VudCAlIDEyID09PSAwKSB7XG5cdFx0XHRpbnRBbW91bnQgPSBpbnRBbW91bnQgLyAxMjtcblx0XHRcdGludFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xuXHRcdH1cblxuXHRcdHRoaXMuX2ludEludGVydmFsID0gbmV3IER1cmF0aW9uKGludEFtb3VudCwgaW50VW5pdCk7XG5cblx0XHQvLyBub3JtYWxpemUgZHN0IGhhbmRsaW5nXG5cdFx0aWYgKHRoaXMuX2RzdFJlbGV2YW50KCkpIHtcblx0XHRcdHRoaXMuX2ludERzdCA9IHRoaXMuX2RzdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW50RHN0ID0gUGVyaW9kRHN0LlJlZ3VsYXJJbnRlcnZhbHM7XG5cdFx0fVxuXG5cdFx0Ly8gbm9ybWFsaXplIHJlZmVyZW5jZSBkYXlcblx0XHR0aGlzLl9pbnRSZWZlcmVuY2UgPSB0aGlzLl9ub3JtYWxpemVEYXkodGhpcy5fcmVmZXJlbmNlLCBmYWxzZSk7XG5cdH1cblxufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIFN0cmluZyB1dGlsaXR5IGZ1bmN0aW9uc1xuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgYmVnaW5uaW5nLlxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWRMZWZ0KHM6IHN0cmluZywgd2lkdGg6IG51bWJlciwgY2hhcjogc3RyaW5nKTogc3RyaW5nIHtcblx0bGV0IHBhZGRpbmc6IHN0cmluZyA9IFwiXCI7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgKHdpZHRoIC0gcy5sZW5ndGgpOyBpKyspIHtcblx0XHRwYWRkaW5nICs9IGNoYXI7XG5cdH1cblx0cmV0dXJuIHBhZGRpbmcgKyBzO1xufVxuXG4vKipcbiAqIFBhZCBhIHN0cmluZyBieSBhZGRpbmcgY2hhcmFjdGVycyB0byB0aGUgZW5kLlxuICogQHBhcmFtIHNcdHRoZSBzdHJpbmcgdG8gcGFkXG4gKiBAcGFyYW0gd2lkdGhcdHRoZSBkZXNpcmVkIG1pbmltdW0gc3RyaW5nIHdpZHRoXG4gKiBAcGFyYW0gY2hhclx0dGhlIHNpbmdsZSBjaGFyYWN0ZXIgdG8gcGFkIHdpdGhcbiAqIEByZXR1cm5cdHRoZSBwYWRkZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWRSaWdodChzOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIsIGNoYXI6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCBwYWRkaW5nOiBzdHJpbmcgPSBcIlwiO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8ICh3aWR0aCAtIHMubGVuZ3RoKTsgaSsrKSB7XG5cdFx0cGFkZGluZyArPSBjaGFyO1xuXHR9XG5cdHJldHVybiBzICsgcGFkZGluZztcbn1cblxuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEZvciB0ZXN0aW5nIHB1cnBvc2VzLCB3ZSBvZnRlbiBuZWVkIHRvIG1hbmlwdWxhdGUgd2hhdCB0aGUgY3VycmVudFxuICogdGltZSBpcy4gVGhpcyBpcyBhbiBpbnRlcmZhY2UgZm9yIGEgY3VzdG9tIHRpbWUgc291cmNlIG9iamVjdFxuICogc28gaW4gdGVzdHMgeW91IGNhbiB1c2UgYSBjdXN0b20gdGltZSBzb3VyY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZVNvdXJjZSB7XG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGN1cnJlbnQgZGF0ZSt0aW1lIGFzIGEgamF2YXNjcmlwdCBEYXRlIG9iamVjdFxuXHQgKi9cblx0bm93KCk6IERhdGU7XG59XG5cbi8qKlxuICogRGVmYXVsdCB0aW1lIHNvdXJjZSwgcmV0dXJucyBhY3R1YWwgdGltZVxuICovXG5leHBvcnQgY2xhc3MgUmVhbFRpbWVTb3VyY2UgaW1wbGVtZW50cyBUaW1lU291cmNlIHtcblx0cHVibGljIG5vdygpOiBEYXRlIHtcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGlmICh0cnVlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoKTtcblx0XHR9XG5cdH1cbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBUaW1lIHpvbmUgcmVwcmVzZW50YXRpb24gYW5kIG9mZnNldCBjYWxjdWxhdGlvblxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gXCIuL2Fzc2VydFwiO1xuaW1wb3J0IHsgVGltZVN0cnVjdCB9IGZyb20gXCIuL2Jhc2ljc1wiO1xuaW1wb3J0IHsgRGF0ZUZ1bmN0aW9ucyB9IGZyb20gXCIuL2phdmFzY3JpcHRcIjtcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSBcIi4vc3RyaW5nc1wiO1xuaW1wb3J0IHsgTm9ybWFsaXplT3B0aW9uLCBUekRhdGFiYXNlIH0gZnJvbSBcIi4vdHotZGF0YWJhc2VcIjtcblxuLyoqXG4gKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUgYXMgcGVyIE9TIHNldHRpbmdzLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2NhbCgpOiBUaW1lWm9uZSB7XG5cdHJldHVybiBUaW1lWm9uZS5sb2NhbCgpO1xufVxuXG4vKipcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcbiAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV0YygpOiBUaW1lWm9uZSB7XG5cdHJldHVybiBUaW1lWm9uZS51dGMoKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gb2Zmc2V0IG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMsIGUuZy4gOTAgZm9yICswMTozMC4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICogQHJldHVybnMgYSB0aW1lIHpvbmUgd2l0aCB0aGUgZ2l2ZW4gZml4ZWQgb2Zmc2V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6b25lKG9mZnNldDogbnVtYmVyKTogVGltZVpvbmU7XG5cbi8qKlxuICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxuICogQHBhcmFtIHMgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcbiAqICAgICAgICAgIGEgVFogZGF0YWJhc2UgdGltZSB6b25lIG5hbWUgKGUuZy4gRXVyb3BlL0Ftc3RlcmRhbSksXG4gKiAgICAgICAgICBvciBhbiBvZmZzZXQgc3RyaW5nIChlaXRoZXIgKzAxOjMwLCArMDEzMCwgKzAxLCBaKS4gRm9yIGEgZnVsbCBsaXN0IG9mIG5hbWVzLCBzZWU6XG4gKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcbiAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxuICogICAgICAgICAgICAgIFwibG9jYWx0aW1lXCIsIHRpbWV6b25lY29tcGxldGUgd2lsbCBhZGhlcmUgdG8gdGhlIGNvbXB1dGVyIHNldHRpbmdzLCB0aGUgRFNUIGZsYWdcbiAqICAgICAgICAgICAgICBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB6b25lKG5hbWU6IHN0cmluZywgZHN0PzogYm9vbGVhbik6IFRpbWVab25lO1xuXG4vKipcbiAqIFNlZSB0aGUgZGVzY3JpcHRpb25zIGZvciB0aGUgb3RoZXIgem9uZSgpIG1ldGhvZCBzaWduYXR1cmVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gem9uZShhOiBhbnksIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZSB7XG5cdHJldHVybiBUaW1lWm9uZS56b25lKGEsIGRzdCk7XG59XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXG4gKi9cbmV4cG9ydCBlbnVtIFRpbWVab25lS2luZCB7XG5cdC8qKlxuXHQgKiBMb2NhbCB0aW1lIG9mZnNldCBhcyBkZXRlcm1pbmVkIGJ5IEphdmFTY3JpcHQgRGF0ZSBjbGFzcy5cblx0ICovXG5cdExvY2FsLFxuXHQvKipcblx0ICogRml4ZWQgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cblx0ICovXG5cdE9mZnNldCxcblx0LyoqXG5cdCAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xuXHQgKiBEU1QgaWYgYXBwbGljYWJsZS5cblx0ICovXG5cdFByb3BlclxufVxuXG4vKipcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XG4gKiByZXF1ZXN0aW5nIGEgdGltZSB6b25lIHR3aWNlIHlpZWxkcyB0aGUgdmVyeSBzYW1lIG9iamVjdC5cbiAqIE5vdGUgdGhhdCB3ZSB1c2UgdGltZSB6b25lIG9mZnNldHMgaW52ZXJ0ZWQgdy5yLnQuIEphdmFTY3JpcHQgRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpLFxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxuICpcbiAqIFRpbWUgem9uZXMgY29tZSBpbiB0aHJlZSBmbGF2b3JzOiB0aGUgbG9jYWwgdGltZSB6b25lLCBhcyBjYWxjdWxhdGVkIGJ5IEphdmFTY3JpcHQgRGF0ZSxcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcbiAqIGFwcGxpZWQgZGVwZW5kaW5nIG9uIHRoZSB0aW1lIHpvbmUgcnVsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaW1lWm9uZSB7XG5cdC8qKlxuXHQgKiBBbGxvdyBub3QgdXNpbmcgaW5zdGFuY2VvZlxuXHQgKi9cblx0cHVibGljIGNsYXNzS2luZCA9IFwiVGltZVpvbmVcIjtcblxuXHQvKipcblx0ICogVGltZSB6b25lIGlkZW50aWZpZXI6XG5cdCAqICBcImxvY2FsdGltZVwiIHN0cmluZyBmb3IgbG9jYWwgdGltZVxuXHQgKiAgRS5nLiBcIi0wMTozMFwiIGZvciBhIGZpeGVkIG9mZnNldCBmcm9tIFVUQ1xuXHQgKiAgRS5nLiBcIlVUQ1wiIG9yIFwiRXVyb3BlL0Ftc3RlcmRhbVwiIGZvciBhbiBPbHNlbiBUWiBkYXRhYmFzZSB0aW1lXG5cdCAqL1xuXHRwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlXG5cdCAqL1xuXHRwcml2YXRlIF9kc3Q6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSBzcGVjaWZpZWQgYnkgX25hbWVcblx0ICovXG5cdHByaXZhdGUgX2tpbmQ6IFRpbWVab25lS2luZDtcblxuXHQvKipcblx0ICogT25seSBmb3IgZml4ZWQgb2Zmc2V0czogdGhlIG9mZnNldCBpbiBtaW51dGVzXG5cdCAqL1xuXHRwcml2YXRlIF9vZmZzZXQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGxvY2FsIHRpbWUgem9uZSBmb3IgYSBnaXZlbiBkYXRlLiBOb3RlIHRoYXRcblx0ICogdGhlIHRpbWUgem9uZSB2YXJpZXMgd2l0aCB0aGUgZGF0ZTogYW1zdGVyZGFtIHRpbWUgZm9yXG5cdCAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgbG9jYWwoKTogVGltZVpvbmUge1xuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBVVEMgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB1dGMoKTogVGltZVpvbmUge1xuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwiVVRDXCIsIHRydWUpOyAvLyB1c2UgJ3RydWUnIGZvciBEU1QgYmVjYXVzZSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgYXMgXCJVVENcIiwgbm90IFwiVVRDIHdpdGhvdXQgRFNUXCJcblx0fVxuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgd2l0aCBhIGZpeGVkIG9mZnNldFxuXHQgKiBAcGFyYW0gb2Zmc2V0XHRvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzBcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgem9uZShvZmZzZXQ6IG51bWJlcik6IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBUaW1lIHpvbmUgZm9yIGFuIG9mZnNldCBzdHJpbmcgb3IgYW4gSUFOQSB0aW1lIHpvbmUgc3RyaW5nLiBOb3RlIHRoYXQgdGltZSB6b25lcyBhcmUgY2FjaGVkXG5cdCAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cblx0ICogQHBhcmFtIHMgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcblx0ICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcblx0ICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxuXHQgKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcblx0ICogICAgICAgICAgVFogZGF0YWJhc2Ugem9uZSBuYW1lIG1heSBiZSBzdWZmaXhlZCB3aXRoIFwiIHdpdGhvdXQgRFNUXCIgdG8gaW5kaWNhdGUgbm8gRFNUIHNob3VsZCBiZSBhcHBsaWVkLlxuXHQgKiAgICAgICAgICBJbiB0aGF0IGNhc2UsIHRoZSBkc3QgcGFyYW1ldGVyIGlzIGlnbm9yZWQuXG5cdCAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxuXHQgKiAgICAgICAgICAgICAgXCJsb2NhbHRpbWVcIiwgdGltZXpvbmVjb21wbGV0ZSB3aWxsIGFkaGVyZSB0byB0aGUgY29tcHV0ZXIgc2V0dGluZ3MsIHRoZSBEU1QgZmxhZ1xuXHQgKiAgICAgICAgICAgICAgZG9lcyBub3QgaGF2ZSBhbnkgZWZmZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB6b25lKHM6IHN0cmluZywgZHN0PzogYm9vbGVhbik6IFRpbWVab25lO1xuXG5cdC8qKlxuXHQgKiBab25lIGltcGxlbWVudGF0aW9uc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyB6b25lKGE6IGFueSwgZHN0OiBib29sZWFuID0gdHJ1ZSk6IFRpbWVab25lIHtcblx0XHRsZXQgbmFtZSA9IFwiXCI7XG5cdFx0c3dpdGNoICh0eXBlb2YgKGEpKSB7XG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcblx0XHRcdFx0bGV0IHMgPSBhIGFzIHN0cmluZztcblx0XHRcdFx0aWYgKHMuaW5kZXhPZihcIndpdGhvdXQgRFNUXCIpID49IDApIHtcblx0XHRcdFx0XHRkc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nKHMpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xuXHRcdFx0XHRjb25zdCBvZmZzZXQ6IG51bWJlciA9IGEgYXMgbnVtYmVyO1xuXHRcdFx0XHRhc3NlcnQob2Zmc2V0ID4gLTI0ICogNjAgJiYgb2Zmc2V0IDwgMjQgKiA2MCwgXCJUaW1lWm9uZS56b25lKCk6IG9mZnNldCBvdXQgb2YgcmFuZ2VcIik7XG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhvZmZzZXQpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaW1lWm9uZS56b25lKCk6IFVuZXhwZWN0ZWQgYXJndW1lbnQgdHlwZSBcXFwiXCIgKyB0eXBlb2YgKGEpICsgXCJcXFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKG5hbWUsIGRzdCk7XG5cdH1cblxuXHQvKipcblx0ICogRG8gbm90IHVzZSB0aGlzIGNvbnN0cnVjdG9yLCB1c2UgdGhlIHN0YXRpY1xuXHQgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXG5cdCAqIEBwYXJhbSBuYW1lIE5PUk1BTElaRUQgbmFtZSwgYXNzdW1lZCB0byBiZSBjb3JyZWN0XG5cdCAqIEBwYXJhbSBkc3RcdEFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLCBpZ25vcmVkIGZvciBsb2NhbCB0aW1lIGFuZCBmaXhlZCBvZmZzZXRzXG5cdCAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZHN0OiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuX2RzdCA9IGRzdDtcblx0XHRpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xuXHRcdFx0dGhpcy5fa2luZCA9IFRpbWVab25lS2luZC5Mb2NhbDtcblx0XHR9IGVsc2UgaWYgKG5hbWUuY2hhckF0KDApID09PSBcIitcIiB8fCBuYW1lLmNoYXJBdCgwKSA9PT0gXCItXCIgfHwgbmFtZS5jaGFyQXQoMCkubWF0Y2goL1xcZC8pIHx8IG5hbWUgPT09IFwiWlwiKSB7XG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcblx0XHRcdHRoaXMuX29mZnNldCA9IFRpbWVab25lLnN0cmluZ1RvT2Zmc2V0KG5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3Blcjtcblx0XHRcdGFzc2VydChUekRhdGFiYXNlLmluc3RhbmNlKCkuZXhpc3RzKG5hbWUpLCBgbm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICcke25hbWV9J2ApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyB0aGlzIGNsYXNzIGFwcGVhciBjbG9uYWJsZS4gTk9URSBhcyB0aW1lIHpvbmUgb2JqZWN0cyBhcmUgY2FjaGVkIHlvdSB3aWxsIE5PVFxuXHQgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6IFRpbWVab25lIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIuIENhbiBiZSBhbiBvZmZzZXQgXCItMDE6MzBcIiBvciBhblxuXHQgKiBJQU5BIHRpbWUgem9uZSBuYW1lIFwiRXVyb3BlL0Ftc3RlcmRhbVwiLCBvciBcImxvY2FsdGltZVwiIGZvclxuXHQgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxuXHQgKi9cblx0cHVibGljIG5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcblx0fVxuXG5cdHB1YmxpYyBkc3QoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2RzdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUga2luZCBvZiB0aW1lIHpvbmUgKExvY2FsL09mZnNldC9Qcm9wZXIpXG5cdCAqL1xuXHRwdWJsaWMga2luZCgpOiBUaW1lWm9uZUtpbmQge1xuXHRcdHJldHVybiB0aGlzLl9raW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xuXHQgKiBlYWNoIG90aGVyLiBPdGhlciB0aW1lIHpvbmVzIGFyZSBub3QgbWFwcGVkIG9udG8gZWFjaCBvdGhlci5cblx0ICovXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuaXNVdGMoKSAmJiBvdGhlci5pc1V0YygpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyXG5cdFx0XHRcdCYmIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXG5cdFx0XHRcdCYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXG5cdCAqL1xuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBUaW1lWm9uZSk6IGJvb2xlYW4ge1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLk9mZnNldCAmJiB0aGlzLl9vZmZzZXQgPT09IG90aGVyLl9vZmZzZXQpO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cblx0ICovXG5cdHB1YmxpYyBpc1V0YygpOiBib29sZWFuIHtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAodGhpcy5fb2Zmc2V0ID09PSAwKTtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBEb2VzIHRoaXMgem9uZSBoYXZlIERheWxpZ2h0IFNhdmluZyBUaW1lIGF0IGFsbD9cblx0ICovXG5cdHB1YmxpYyBoYXNEc3QoKTogYm9vbGVhbiB7XG5cdFx0c3dpdGNoICh0aGlzLl9raW5kKSB7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHJldHVybiAoVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmhhc0RzdCh0aGlzLl9uYW1lKSk7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIG9mZnNldCBpbmNsdWRpbmcgRFNUIGZyb20gYSBVVEMgdGltZS5cblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yVXRjKG9mZnNldEZvclV0YzogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclV0Yyh5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XG5cdHB1YmxpYyBvZmZzZXRGb3JVdGMoXG5cdFx0YT86IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlclxuXHQpOiBudW1iZXIge1xuXHRcdGNvbnN0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgPSAoXG5cdFx0XHR0eXBlb2YgYSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpIH0pIDpcblx0XHRcdHR5cGVvZiBhID09PSBcInVuZGVmaW5lZFwiID8gbmV3IFRpbWVTdHJ1Y3Qoe30pIDpcblx0XHRcdGFcblx0XHQpO1xuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcblx0XHRcdFx0Y29uc3QgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKFxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyLCB1dGNUaW1lLmNvbXBvbmVudHMubW9udGggLSAxLCB1dGNUaW1lLmNvbXBvbmVudHMuZGF5LFxuXHRcdFx0XHRcdHV0Y1RpbWUuY29tcG9uZW50cy5ob3VyLCB1dGNUaW1lLmNvbXBvbmVudHMubWludXRlLCB1dGNUaW1lLmNvbXBvbmVudHMuc2Vjb25kLCB1dGNUaW1lLmNvbXBvbmVudHMubWlsbGlcblx0XHRcdFx0KSk7XG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRpbWV6b25lIHN0YW5kYXJkIG9mZnNldCBleGNsdWRpbmcgRFNUIGZyb20gYSBVVEMgdGltZS5cblx0ICogQHJldHVybiB0aGUgc3RhbmRhcmQgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMob2Zmc2V0Rm9yVXRjOiBUaW1lU3RydWN0KTogbnVtYmVyO1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXRGb3JVdGMoXG5cdFx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlcjtcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0Rm9yVXRjKFxuXHRcdGE/OiBUaW1lU3RydWN0IHwgbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLCBob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXJcblx0KTogbnVtYmVyIHtcblx0XHRjb25zdCB1dGNUaW1lOiBUaW1lU3RydWN0ID0gKFxuXHRcdFx0dHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSA6XG5cdFx0XHR0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBUaW1lU3RydWN0KHt9KSA6XG5cdFx0XHRhXG5cdFx0KTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQyh1dGNUaW1lLmNvbXBvbmVudHMueWVhciwgMCwgMSwgMCkpO1xuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHV0Y1RpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdH1cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVua25vd24gVGltZVpvbmVLaW5kICcke3RoaXMuX2tpbmR9J2ApO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgZnJvbSBhIHpvbmUtbG9jYWwgdGltZSAoTk9UIGEgVVRDIHRpbWUpLlxuXHQgKiBAcGFyYW0geWVhciBsb2NhbCBmdWxsIHllYXJcblx0ICogQHBhcmFtIG1vbnRoIGxvY2FsIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcblx0ICogQHBhcmFtIGRheSBsb2NhbCBkYXkgb2YgbW9udGggMS0zMVxuXHQgKiBAcGFyYW0gaG91ciBsb2NhbCBob3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZSBsb2NhbCBtaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kIGxvY2FsIHNlY29uZCAwLTU5XG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBsb2NhbCBtaWxsaXNlY29uZCAwLTk5OVxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgb2YgdGhpcyB0aW1lIHpvbmUgd2l0aCByZXNwZWN0IHRvIFVUQyBhdCB0aGUgZ2l2ZW4gdGltZSwgaW4gbWludXRlcy5cblx0ICovXG5cdHB1YmxpYyBvZmZzZXRGb3Jab25lKGxvY2FsVGltZTogVGltZVN0cnVjdCk6IG51bWJlcjtcblx0cHVibGljIG9mZnNldEZvclpvbmUoeWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyKTogbnVtYmVyO1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZShcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyXG5cdCk6IG51bWJlciB7XG5cdFx0Y29uc3QgbG9jYWxUaW1lOiBUaW1lU3RydWN0ID0gKFxuXHRcdFx0dHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh7IHllYXI6IGEsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KSA6XG5cdFx0XHR0eXBlb2YgYSA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBUaW1lU3RydWN0KHt9KSA6XG5cdFx0XHRhXG5cdFx0KTtcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLkxvY2FsOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZShcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5tb250aCAtIDEsIGxvY2FsVGltZS5jb21wb25lbnRzLmRheSxcblx0XHRcdFx0XHRsb2NhbFRpbWUuY29tcG9uZW50cy5ob3VyLCBsb2NhbFRpbWUuY29tcG9uZW50cy5taW51dGUsIGxvY2FsVGltZS5jb21wb25lbnRzLnNlY29uZCwgbG9jYWxUaW1lLmNvbXBvbmVudHMubWlsbGlcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9vZmZzZXQ7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcblx0XHRcdFx0Ly8gbm90ZSB0aGF0IFR6RGF0YWJhc2Ugbm9ybWFsaXplcyB0aGUgZ2l2ZW4gZGF0ZSBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0XG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnRvdGFsT2Zmc2V0TG9jYWwodGhpcy5fbmFtZSwgbG9jYWxUaW1lKS5taW51dGVzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5zdGFuZGFyZE9mZnNldCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUpLm1pbnV0ZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihgdW5rbm93biBUaW1lWm9uZUtpbmQgJyR7dGhpcy5fa2luZH0nYCk7XG5cdFx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm90ZTogd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMi4wLjBcblx0ICpcblx0ICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXG5cdCAqIENhbGxzIG9mZnNldEZvclV0YygpIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBkYXRlXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxuXHQgKiBAcGFyYW0gZnVuY3M6IHRoZSBzZXQgb2YgZnVuY3Rpb25zIHRvIHVzZTogZ2V0KCkgb3IgZ2V0VVRDKClcblx0ICovXG5cdHB1YmxpYyBvZmZzZXRGb3JVdGNEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gdGhpcy5vZmZzZXRGb3JVdGMoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXG5cdCAqXG5cdCAqIENvbnZlbmllbmNlIGZ1bmN0aW9uLCB0YWtlcyB2YWx1ZXMgZnJvbSBhIEphdmFzY3JpcHQgRGF0ZVxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0ZTogdGhlIGRhdGVcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXG5cdCAqL1xuXHRwdWJsaWMgb2Zmc2V0Rm9yWm9uZURhdGUoZGF0ZTogRGF0ZSwgZnVuY3M6IERhdGVGdW5jdGlvbnMpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoVGltZVN0cnVjdC5mcm9tRGF0ZShkYXRlLCBmdW5jcykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFpvbmUgYWJicmV2aWF0aW9uIGF0IGdpdmVuIFVUQyB0aW1lc3RhbXAgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0geWVhciBGdWxsIHllYXJcblx0ICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcblx0ICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxuXHQgKiBAcGFyYW0gaG91ciBIb3VyIDAtMjNcblx0ICogQHBhcmFtIG1pbnV0ZSBNaW51dGUgMC01OVxuXHQgKiBAcGFyYW0gc2Vjb25kIFNlY29uZCAwLTU5XG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBNaWxsaXNlY29uZCAwLTk5OVxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXG5cdCAqXG5cdCAqIEByZXR1cm4gXCJsb2NhbFwiIGZvciBsb2NhbCB0aW1lem9uZSwgdGhlIG9mZnNldCBmb3IgYW4gb2Zmc2V0IHpvbmUsIG9yIHRoZSBhYmJyZXZpYXRpb24gZm9yIGEgcHJvcGVyIHpvbmUuXG5cdCAqL1xuXHRwdWJsaWMgYWJicmV2aWF0aW9uRm9yVXRjKFxuXHRcdHllYXI/OiBudW1iZXIsIG1vbnRoPzogbnVtYmVyLCBkYXk/OiBudW1iZXIsIGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlciwgZHN0RGVwZW5kZW50PzogYm9vbGVhblxuXHQpOiBzdHJpbmc7XG5cdHB1YmxpYyBhYmJyZXZpYXRpb25Gb3JVdGModXRjVGltZTogVGltZVN0cnVjdCwgZHN0RGVwZW5kZW50PzogYm9vbGVhbik6IHN0cmluZztcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0Yyhcblx0XHRhPzogVGltZVN0cnVjdCB8IG51bWJlciwgYj86IG51bWJlciB8IGJvb2xlYW4sIGRheT86IG51bWJlciwgaG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpPzogbnVtYmVyLCBjPzogYm9vbGVhblxuXHQpOiBzdHJpbmcge1xuXHRcdGxldCB1dGNUaW1lOiBUaW1lU3RydWN0O1xuXHRcdGxldCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlO1xuXHRcdGlmICh0eXBlb2YgYSAhPT0gXCJudW1iZXJcIiAmJiAhIWEpIHtcblx0XHRcdHV0Y1RpbWUgPSBhO1xuXHRcdFx0ZHN0RGVwZW5kZW50ID0gKGIgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dXRjVGltZSA9IG5ldyBUaW1lU3RydWN0KHsgeWVhcjogYSwgbW9udGg6IGIgYXMgbnVtYmVyLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaSB9KTtcblx0XHRcdGRzdERlcGVuZGVudCA9IChjID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSk7XG5cdFx0fVxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcblx0XHRcdFx0cmV0dXJuIFwibG9jYWxcIjtcblx0XHRcdH1cblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XG5cdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuYWJicmV2aWF0aW9uKHRoaXMuX25hbWUsIHV0Y1RpbWUsIGRzdERlcGVuZGVudCk7XG5cdFx0XHR9XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmtub3duIFRpbWVab25lS2luZCAnJHt0aGlzLl9raW5kfSdgKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2Zcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdHpvbmUgdGltZSB0aW1lc3RhbXAgYXMgdW5peCBtaWxsaXNlY29uZHNcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cFxuXHQgKlxuXHQgKiBAcmV0dXJuc1x0dW5peCBtaWxsaXNlY29uZHMgaW4gem9uZSB0aW1lLCBub3JtYWxpemVkLlxuXHQgKi9cblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVW5peE1pbGxpczogbnVtYmVyLCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBudW1iZXI7XG5cdC8qKlxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2Zcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdHpvbmUgdGltZSB0aW1lc3RhbXBcblx0ICogQHBhcmFtIG9wdFx0KG9wdGlvbmFsKSBSb3VuZCB1cCBvciBkb3duPyBEZWZhdWx0OiB1cFxuXHQgKlxuXHQgKiBAcmV0dXJuc1x0dGltZSBzdHJ1Y3QgaW4gem9uZSB0aW1lLCBub3JtYWxpemVkLlxuXHQgKi9cblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVGltZTogVGltZVN0cnVjdCwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogVGltZVN0cnVjdDtcblx0cHVibGljIG5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVGltZTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcblx0XHRjb25zdCB0em9wdDogTm9ybWFsaXplT3B0aW9uID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLkRvd24gPyBOb3JtYWxpemVPcHRpb24uRG93biA6IE5vcm1hbGl6ZU9wdGlvbi5VcCk7XG5cdFx0aWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XG5cdFx0XHRpZiAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLm5vcm1hbGl6ZUxvY2FsKHRoaXMuX25hbWUsIG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZSksIHR6b3B0KS51bml4TWlsbGlzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFRpbWUsIHR6b3B0KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGxvY2FsVGltZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWUgem9uZSBpZGVudGlmaWVyIChub3JtYWxpemVkKS5cblx0ICogRWl0aGVyIFwibG9jYWx0aW1lXCIsIElBTkEgbmFtZSwgb3IgXCIraGg6bW1cIiBvZmZzZXQuXG5cdCAqL1xuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRsZXQgcmVzdWx0ID0gdGhpcy5uYW1lKCk7XG5cdFx0aWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XG5cdFx0XHRpZiAodGhpcy5oYXNEc3QoKSAmJiAhdGhpcy5kc3QoKSkge1xuXHRcdFx0XHRyZXN1bHQgKz0gXCIgd2l0aG91dCBEU1RcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IGFuIG9mZnNldCBudW1iZXIgaW50byBhbiBvZmZzZXQgc3RyaW5nXG5cdCAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgaW4gSVNPIG5vdGF0aW9uIFwiKzAxOjMwXCIgZm9yICs5MCBtaW51dGVzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIG9mZnNldFRvU3RyaW5nKG9mZnNldDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRjb25zdCBzaWduID0gKG9mZnNldCA8IDAgPyBcIi1cIiA6IFwiK1wiKTtcblx0XHRjb25zdCBob3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcblx0XHRjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xuXHRcdHJldHVybiBzaWduICsgc3RyaW5ncy5wYWRMZWZ0KGhvdXJzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQobWludXRlcy50b1N0cmluZygxMCksIDIsIFwiMFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpbmcgdG8gb2Zmc2V0IGNvbnZlcnNpb24uXG5cdCAqIEBwYXJhbSBzXHRGb3JtYXRzOiBcIi0wMTowMFwiLCBcIi0wMTAwXCIsIFwiLTAxXCIsIFwiWlwiXG5cdCAqIEByZXR1cm4gb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBzdHJpbmdUb09mZnNldChzOiBzdHJpbmcpOiBudW1iZXIge1xuXHRcdGNvbnN0IHQgPSBzLnRyaW0oKTtcblx0XHQvLyBlYXN5IGNhc2Vcblx0XHRpZiAodCA9PT0gXCJaXCIpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH1cblx0XHQvLyBjaGVjayB0aGF0IHRoZSByZW1haW5kZXIgY29uZm9ybXMgdG8gSVNPIHRpbWUgem9uZSBzcGVjXG5cdFx0YXNzZXJ0KHQubWF0Y2goL15bKy1dXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkJC8pIHx8IHQubWF0Y2goL15bKy1dXFxkXFxkKDo/KVxcZFxcZCQvKSwgXCJXcm9uZyB0aW1lIHpvbmUgZm9ybWF0OiBcXFwiXCIgKyB0ICsgXCJcXFwiXCIpO1xuXHRcdGNvbnN0IHNpZ246IG51bWJlciA9ICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgPyAxIDogLTEpO1xuXHRcdGxldCBob3VyczogbnVtYmVyID0gMDtcblx0XHRsZXQgbWludXRlczogbnVtYmVyID0gMDtcblx0XHRzd2l0Y2ggKHQubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdGhvdXJzID0gcGFyc2VJbnQodC5zbGljZSgxLCAyKSwgMTApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMzpcblx0XHRcdFx0aG91cnMgPSBwYXJzZUludCh0LnNsaWNlKDEsIDMpLCAxMCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSA1OlxuXHRcdFx0XHRob3VycyA9IHBhcnNlSW50KHQuc2xpY2UoMSwgMyksIDEwKTtcblx0XHRcdFx0bWludXRlcyA9IHBhcnNlSW50KHQuc2xpY2UoMywgNSksIDEwKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDY6XG5cdFx0XHRcdGhvdXJzID0gcGFyc2VJbnQodC5zbGljZSgxLCAzKSwgMTApO1xuXHRcdFx0XHRtaW51dGVzID0gcGFyc2VJbnQodC5zbGljZSg0LCA2KSwgMTApO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0YXNzZXJ0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgYEludmFsaWQgdGltZSB6b25lIChob3VycyBvdXQgb2YgcmFuZ2UpOiAnJHt0fSdgKTtcblx0XHRhc3NlcnQobWludXRlcyA+PSAwICYmIG1pbnV0ZXMgPCA2MCwgYEludmFsaWQgdGltZSB6b25lIChtaW51dGVzIG91dCBvZiByYW5nZSk6ICcke3R9J2ApO1xuXHRcdHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIFRpbWUgem9uZSBjYWNoZS5cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIF9jYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFRpbWVab25lIH0gPSB7fTtcblxuXHQvKipcblx0ICogRmluZCBpbiBjYWNoZSBvciBjcmVhdGUgem9uZVxuXHQgKiBAcGFyYW0gbmFtZVx0VGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lP1xuXHQgKi9cblx0cHJpdmF0ZSBzdGF0aWMgX2ZpbmRPckNyZWF0ZShuYW1lOiBzdHJpbmcsIGRzdDogYm9vbGVhbik6IFRpbWVab25lIHtcblx0XHRjb25zdCBrZXkgPSBuYW1lICsgKGRzdCA/IFwiX0RTVFwiIDogXCJfTk8tRFNUXCIpO1xuXHRcdGlmIChrZXkgaW4gVGltZVpvbmUuX2NhY2hlKSB7XG5cdFx0XHRyZXR1cm4gVGltZVpvbmUuX2NhY2hlW2tleV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHQgPSBuZXcgVGltZVpvbmUobmFtZSwgZHN0KTtcblx0XHRcdFRpbWVab25lLl9jYWNoZVtrZXldID0gdDtcblx0XHRcdHJldHVybiB0O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgZm9yIGFcblx0ICogY2FjaGUgbG9va3VwXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfbm9ybWFsaXplU3RyaW5nKHM6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0Y29uc3QgdDogc3RyaW5nID0gcy50cmltKCk7XG5cdFx0YXNzZXJ0KHQubGVuZ3RoID4gMCwgXCJFbXB0eSB0aW1lIHpvbmUgc3RyaW5nIGdpdmVuXCIpO1xuXHRcdGlmICh0ID09PSBcImxvY2FsdGltZVwiKSB7XG5cdFx0XHRyZXR1cm4gdDtcblx0XHR9IGVsc2UgaWYgKHQgPT09IFwiWlwiKSB7XG5cdFx0XHRyZXR1cm4gXCIrMDA6MDBcIjtcblx0XHR9IGVsc2UgaWYgKFRpbWVab25lLl9pc09mZnNldFN0cmluZyh0KSkge1xuXHRcdFx0Ly8gb2Zmc2V0IHN0cmluZ1xuXHRcdFx0Ly8gbm9ybWFsaXplIGJ5IGNvbnZlcnRpbmcgYmFjayBhbmQgZm9ydGhcblx0XHRcdHJldHVybiBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhUaW1lWm9uZS5zdHJpbmdUb09mZnNldCh0KSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE9sc2VuIFRaIGRhdGFiYXNlIG5hbWVcblx0XHRcdHJldHVybiB0O1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc3RhdGljIF9pc09mZnNldFN0cmluZyhzOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRjb25zdCB0ID0gcy50cmltKCk7XG5cdFx0cmV0dXJuICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgdC5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IHQgPT09IFwiWlwiKTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhIGdpdmVuIG9iamVjdCBpcyBvZiB0eXBlIFRpbWVab25lLiBOb3RlIHRoYXQgaXQgZG9lcyBub3Qgd29yayBmb3Igc3ViIGNsYXNzZXMuIEhvd2V2ZXIsIHVzZSB0aGlzIHRvIGJlIHJvYnVzdFxuICogYWdhaW5zdCBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgdGhlIGxpYnJhcnkgaW4gb25lIHByb2Nlc3MgaW5zdGVhZCBvZiBpbnN0YW5jZW9mXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gY2hlY2tcbiAqIEB0aHJvd3Mgbm90aGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUaW1lWm9uZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgVGltZVpvbmUge1xuXHRyZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmNsYXNzS2luZCA9PT0gXCJUaW1lWm9uZVwiO1xufVxuIiwiLyoqXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcbiAqL1xuZXhwb3J0IGVudW0gVG9rZW5UeXBlIHtcblx0LyoqXG5cdCAqIFJhdyB0ZXh0XG5cdCAqL1xuXHRJREVOVElUWSxcblx0RVJBLFxuXHRZRUFSLFxuXHRRVUFSVEVSLFxuXHRNT05USCxcblx0V0VFSyxcblx0REFZLFxuXHRXRUVLREFZLFxuXHREQVlQRVJJT0QsXG5cdEhPVVIsXG5cdE1JTlVURSxcblx0U0VDT05ELFxuXHRaT05FXG59XG5cbi8qKlxuICogQmFzaWMgdG9rZW5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUb2tlbiB7XG5cdC8qKlxuXHQgKiBUaGUgdHlwZSBvZiB0b2tlblxuXHQgKi9cblx0dHlwZTogVG9rZW5UeXBlO1xuXG5cdC8qKlxuXHQgKiBUaGUgc3ltYm9sIGZyb20gd2hpY2ggdGhlIHRva2VuIHdhcyBwYXJzZWRcblx0ICovXG5cdHN5bWJvbDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSB0b2tlblxuXHQgKi9cblx0bGVuZ3RoOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBvcmlnaW5hbCBzdHJpbmcgdGhhdCBwcm9kdWNlZCB0aGlzIHRva2VuXG5cdCAqL1xuXHRyYXc6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUb2tlbml6ZSBhbiBMRE1MIGRhdGUvdGltZSBmb3JtYXQgc3RyaW5nXG4gKiBAcGFyYW0gZm9ybWF0U3RyaW5nIHRoZSBzdHJpbmcgdG8gdG9rZW5pemVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKGZvcm1hdFN0cmluZzogc3RyaW5nKTogVG9rZW5bXSB7XG5cdGlmICghZm9ybWF0U3RyaW5nKSB7XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cblx0Y29uc3QgcmVzdWx0OiBUb2tlbltdID0gW107XG5cblx0Y29uc3QgYXBwZW5kVG9rZW4gPSAodG9rZW5TdHJpbmc6IHN0cmluZywgcmF3PzogYm9vbGVhbik6IHZvaWQgPT4ge1xuXHRcdC8vIFRoZSB0b2tlblN0cmluZyBtYXkgYmUgbG9uZ2VyIHRoYW4gc3VwcG9ydGVkIGZvciBhIHRva2VudHlwZSwgZS5nLiBcImhoaGhcIiB3aGljaCB3b3VsZCBiZSBUV08gaG91ciBzcGVjcy5cblx0XHQvLyBXZSBncmVlZGlseSBjb25zdW1lIExETUwgc3BlY3Mgd2hpbGUgcG9zc2libGVcblx0XHR3aGlsZSAodG9rZW5TdHJpbmcgIT09IFwiXCIpIHtcblx0XHRcdGlmIChyYXcgfHwgIVNZTUJPTF9NQVBQSU5HLmhhc093blByb3BlcnR5KHRva2VuU3RyaW5nWzBdKSkge1xuXHRcdFx0XHRjb25zdCB0b2tlbjogVG9rZW4gPSB7XG5cdFx0XHRcdFx0bGVuZ3RoOiB0b2tlblN0cmluZy5sZW5ndGgsXG5cdFx0XHRcdFx0cmF3OiB0b2tlblN0cmluZyxcblx0XHRcdFx0XHRzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxuXHRcdFx0XHRcdHR5cGU6IFRva2VuVHlwZS5JREVOVElUWVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXN1bHQucHVzaCh0b2tlbik7XG5cdFx0XHRcdHRva2VuU3RyaW5nID0gXCJcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0b2tlbiwgZGlmZmVyZW50IGxlbmd0aHMgbWF5IGJlIHN1cHBvcnRlZFxuXHRcdFx0XHRjb25zdCBpbmZvID0gU1lNQk9MX01BUFBJTkdbdG9rZW5TdHJpbmdbMF1dO1xuXHRcdFx0XHRsZXQgbGVuZ3RoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdGlmIChpbmZvLm1heExlbmd0aCA9PT0gdW5kZWZpbmVkICYmICghQXJyYXkuaXNBcnJheShpbmZvLmxlbmd0aHMpIHx8IGluZm8ubGVuZ3Rocy5sZW5ndGggPT09IDApKSB7XG5cdFx0XHRcdFx0Ly8gZXZlcnl0aGluZyBpcyBhbGxvd2VkXG5cdFx0XHRcdFx0bGVuZ3RoID0gdG9rZW5TdHJpbmcubGVuZ3RoO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGluZm8ubWF4TGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQvLyBncmVlZGlseSBnb2JibGUgdXBcblx0XHRcdFx0XHRsZW5ndGggPSBNYXRoLm1pbih0b2tlblN0cmluZy5sZW5ndGgsIGluZm8ubWF4TGVuZ3RoKTtcblx0XHRcdFx0fSBlbHNlIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovIGlmIChBcnJheS5pc0FycmF5KGluZm8ubGVuZ3RocykgJiYgaW5mby5sZW5ndGhzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQvLyBmaW5kIG1heGltdW0gYWxsb3dlZCBsZW5ndGhcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGwgb2YgaW5mby5sZW5ndGhzKSB7XG5cdFx0XHRcdFx0XHRpZiAobCA8PSB0b2tlblN0cmluZy5sZW5ndGggJiYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA8IGwpKSB7XG5cdFx0XHRcdFx0XHRcdGxlbmd0aCA9IGw7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQvLyBubyBhbGxvd2VkIGxlbmd0aCBmb3VuZCAobm90IHBvc3NpYmxlIHdpdGggY3VycmVudCBzeW1ib2wgbWFwcGluZyBzaW5jZSBsZW5ndGggMSBpcyBhbHdheXMgYWxsb3dlZClcblx0XHRcdFx0XHRjb25zdCB0b2tlbjogVG9rZW4gPSB7XG5cdFx0XHRcdFx0XHRsZW5ndGg6IHRva2VuU3RyaW5nLmxlbmd0aCxcblx0XHRcdFx0XHRcdHJhdzogdG9rZW5TdHJpbmcsXG5cdFx0XHRcdFx0XHRzeW1ib2w6IHRva2VuU3RyaW5nWzBdLFxuXHRcdFx0XHRcdFx0dHlwZTogVG9rZW5UeXBlLklERU5USVRZXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZXN1bHQucHVzaCh0b2tlbik7XG5cdFx0XHRcdFx0dG9rZW5TdHJpbmcgPSBcIlwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHByZWZpeCBmb3VuZFxuXHRcdFx0XHRcdGNvbnN0IHRva2VuOiBUb2tlbiA9IHtcblx0XHRcdFx0XHRcdGxlbmd0aCxcblx0XHRcdFx0XHRcdHJhdzogdG9rZW5TdHJpbmcuc2xpY2UoMCwgbGVuZ3RoKSxcblx0XHRcdFx0XHRcdHN5bWJvbDogdG9rZW5TdHJpbmdbMF0sXG5cdFx0XHRcdFx0XHR0eXBlOiBpbmZvLnR5cGVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHRva2VuKTtcblx0XHRcdFx0XHR0b2tlblN0cmluZyA9IHRva2VuU3RyaW5nLnNsaWNlKGxlbmd0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0bGV0IGN1cnJlbnRUb2tlbjogc3RyaW5nID0gXCJcIjtcblx0bGV0IHByZXZpb3VzQ2hhcjogc3RyaW5nID0gXCJcIjtcblx0bGV0IHF1b3Rpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblx0bGV0IHBvc3NpYmxlRXNjYXBpbmc6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRmb3IgKGNvbnN0IGN1cnJlbnRDaGFyIG9mIGZvcm1hdFN0cmluZykge1xuXHRcdC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xuXHRcdGlmIChjdXJyZW50Q2hhciA9PT0gXCInXCIpIHtcblx0XHRcdGlmICghcXVvdGluZykge1xuXHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0XHRcdC8vIEVzY2FwZWQgYSBzaW5nbGUgJyBjaGFyYWN0ZXIgd2l0aG91dCBxdW90aW5nXG5cdFx0XHRcdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcblx0XHRcdFx0XHRcdGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbik7XG5cdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gXCInXCI7XG5cdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUd28gcG9zc2liaWxpdGllczogV2VyZSBhcmUgZG9uZSBxdW90aW5nLCBvciB3ZSBhcmUgZXNjYXBpbmcgYSAnIGNoYXJhY3RlclxuXHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0XHRcdC8vIEVzY2FwaW5nLCBhZGQgJyB0byB0aGUgdG9rZW5cblx0XHRcdFx0XHRjdXJyZW50VG9rZW4gKz0gY3VycmVudENoYXI7XG5cdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIE1heWJlIGVzY2FwaW5nLCB3YWl0IGZvciBuZXh0IHRva2VuIGlmIHdlIGFyZSBlc2NhcGluZ1xuXHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHRcdGlmICghcG9zc2libGVFc2NhcGluZykge1xuXHRcdFx0XHQvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXG5cdFx0XHRcdHByZXZpb3VzQ2hhciA9IGN1cnJlbnRDaGFyO1xuXHRcdFx0fVxuXHRcdFx0Y29udGludWU7XG5cdFx0fSBlbHNlIGlmIChwb3NzaWJsZUVzY2FwaW5nKSB7XG5cdFx0XHRxdW90aW5nID0gIXF1b3Rpbmc7XG5cdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XG5cblx0XHRcdC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cblx0XHRcdGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgIXF1b3RpbmcpO1xuXHRcdFx0Y3VycmVudFRva2VuID0gXCJcIjtcblx0XHR9XG5cblx0XHRpZiAocXVvdGluZykge1xuXHRcdFx0Ly8gUXVvdGluZyBtb2RlLCBhZGQgY2hhcmFjdGVyIHRvIHRva2VuLlxuXHRcdFx0Y3VycmVudFRva2VuICs9IGN1cnJlbnRDaGFyO1xuXHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xuXHRcdFx0Ly8gV2Ugc3R1bWJsZWQgdXBvbiBhIG5ldyB0b2tlbiFcblx0XHRcdGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbik7XG5cdFx0XHRjdXJyZW50VG9rZW4gPSBjdXJyZW50Q2hhcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gV2UgYXJlIHJlcGVhdGluZyB0aGUgdG9rZW4gd2l0aCBtb3JlIGNoYXJhY3RlcnNcblx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcblx0XHR9XG5cblx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcblx0fVxuXHQvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXG5cdGFwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcXVvdGluZyk7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIFN5bWJvbEluZm8ge1xuXHQvKipcblx0ICogVG9rZW4gdHlwZVxuXHQgKi9cblx0dHlwZTogVG9rZW5UeXBlO1xuXHQvKipcblx0ICogTWF4aW11bSB0b2tlbiBsZW5ndGggKHVuZGVmaW5lZCBmb3IgdW5saW1pdGVkIHRva2Vucylcblx0ICovXG5cdG1heExlbmd0aD86IG51bWJlcjtcblx0LyoqXG5cdCAqIEFsbG93ZWQgdG9rZW4gbGVuZ3RocyAoaW5zdGVhZCBvZiBtaW5MZW5ndGgvbWF4TGVuZ3RoKVxuXHQgKi9cblx0bGVuZ3Rocz86IG51bWJlcltdO1xufVxuXG5jb25zdCBTWU1CT0xfTUFQUElORzogeyBbY2hhcjogc3RyaW5nXTogU3ltYm9sSW5mbyB9ID0ge1xuXHRHOiB7IHR5cGU6IFRva2VuVHlwZS5FUkEsIG1heExlbmd0aDogNSB9LFxuXHR5OiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSIH0sXG5cdFk6IHsgdHlwZTogVG9rZW5UeXBlLllFQVIgfSxcblx0dTogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxuXHRVOiB7IHR5cGU6IFRva2VuVHlwZS5ZRUFSLCBtYXhMZW5ndGg6IDUgfSxcblx0cjogeyB0eXBlOiBUb2tlblR5cGUuWUVBUiB9LFxuXHRROiB7IHR5cGU6IFRva2VuVHlwZS5RVUFSVEVSLCBtYXhMZW5ndGg6IDUgfSxcblx0cTogeyB0eXBlOiBUb2tlblR5cGUuUVVBUlRFUiwgbWF4TGVuZ3RoOiA1IH0sXG5cdE06IHsgdHlwZTogVG9rZW5UeXBlLk1PTlRILCBtYXhMZW5ndGg6IDUgfSxcblx0TDogeyB0eXBlOiBUb2tlblR5cGUuTU9OVEgsIG1heExlbmd0aDogNSB9LFxuXHRsOiB7IHR5cGU6IFRva2VuVHlwZS5NT05USCwgbWF4TGVuZ3RoOiAxIH0sXG5cdHc6IHsgdHlwZTogVG9rZW5UeXBlLldFRUssIG1heExlbmd0aDogMiB9LFxuXHRXOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLLCBtYXhMZW5ndGg6IDEgfSxcblx0ZDogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDIgfSxcblx0RDogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDMgfSxcblx0RjogeyB0eXBlOiBUb2tlblR5cGUuREFZLCBtYXhMZW5ndGg6IDEgfSxcblx0ZzogeyB0eXBlOiBUb2tlblR5cGUuREFZIH0sXG5cdEU6IHsgdHlwZTogVG9rZW5UeXBlLldFRUtEQVksIG1heExlbmd0aDogNiB9LFxuXHRlOiB7IHR5cGU6IFRva2VuVHlwZS5XRUVLREFZLCBtYXhMZW5ndGg6IDYgfSxcblx0YzogeyB0eXBlOiBUb2tlblR5cGUuV0VFS0RBWSwgbWF4TGVuZ3RoOiA2IH0sXG5cdGE6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXG5cdGI6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXG5cdEI6IHsgdHlwZTogVG9rZW5UeXBlLkRBWVBFUklPRCwgbWF4TGVuZ3RoOiA1IH0sXG5cdGg6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuXHRIOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDIgfSxcblx0azogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXG5cdEs6IHsgdHlwZTogVG9rZW5UeXBlLkhPVVIsIG1heExlbmd0aDogMiB9LFxuXHRqOiB7IHR5cGU6IFRva2VuVHlwZS5IT1VSLCBtYXhMZW5ndGg6IDYgfSxcblx0SjogeyB0eXBlOiBUb2tlblR5cGUuSE9VUiwgbWF4TGVuZ3RoOiAyIH0sXG5cdG06IHsgdHlwZTogVG9rZW5UeXBlLk1JTlVURSwgbWF4TGVuZ3RoOiAyIH0sXG5cdHM6IHsgdHlwZTogVG9rZW5UeXBlLlNFQ09ORCwgbWF4TGVuZ3RoOiAyIH0sXG5cdFM6IHsgdHlwZTogVG9rZW5UeXBlLlNFQ09ORCB9LFxuXHRBOiB7IHR5cGU6IFRva2VuVHlwZS5TRUNPTkQgfSxcblx0ejogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA0IH0sXG5cdFo6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNSB9LFxuXHRPOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBsZW5ndGhzOiBbMSwgNF0gfSxcblx0djogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbGVuZ3RoczogWzEsIDRdIH0sXG5cdFY6IHsgdHlwZTogVG9rZW5UeXBlLlpPTkUsIG1heExlbmd0aDogNCB9LFxuXHRYOiB7IHR5cGU6IFRva2VuVHlwZS5aT05FLCBtYXhMZW5ndGg6IDUgfSxcblx0eDogeyB0eXBlOiBUb2tlblR5cGUuWk9ORSwgbWF4TGVuZ3RoOiA1IH0sXG59O1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBBQkIgU3dpdHplcmxhbmQgTHRkLlxuICpcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxuICpcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBhc3NlcnQgZnJvbSBcIi4vYXNzZXJ0XCI7XG5pbXBvcnQgeyBUaW1lQ29tcG9uZW50T3B0cywgVGltZVN0cnVjdCwgVGltZVVuaXQsIFdlZWtEYXkgfSBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCAqIGFzIGJhc2ljcyBmcm9tIFwiLi9iYXNpY3NcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcIi4vZHVyYXRpb25cIjtcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiO1xuXG4vKipcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcbiAqL1xuZXhwb3J0IGVudW0gVG9UeXBlIHtcblx0LyoqXG5cdCAqIEVpdGhlciBhIHllYXIgbnVtYmVyIG9yIFwib25seVwiXG5cdCAqL1xuXHRZZWFyLFxuXHQvKipcblx0ICogXCJtYXhcIlxuXHQgKi9cblx0TWF4XG59XG5cbi8qKlxuICogVHlwZSBvZiBydWxlIE9OIGNvbHVtbiB2YWx1ZVxuICovXG5leHBvcnQgZW51bSBPblR5cGUge1xuXHQvKipcblx0ICogRGF5LW9mLW1vbnRoIG51bWJlclxuXHQgKi9cblx0RGF5TnVtLFxuXHQvKipcblx0ICogXCJsYXN0U3VuXCIgb3IgXCJsYXN0V2VkXCIgZXRjXG5cdCAqL1xuXHRMYXN0WCxcblx0LyoqXG5cdCAqIGUuZy4gXCJTdW4+PThcIlxuXHQgKi9cblx0R3JlcVgsXG5cdC8qKlxuXHQgKiBlLmcuIFwiU3VuPD04XCJcblx0ICovXG5cdExlcVhcbn1cblxuZXhwb3J0IGVudW0gQXRUeXBlIHtcblx0LyoqXG5cdCAqIExvY2FsIHRpbWUgKG5vIERTVClcblx0ICovXG5cdFN0YW5kYXJkLFxuXHQvKipcblx0ICogV2FsbCBjbG9jayB0aW1lIChsb2NhbCB0aW1lIHdpdGggRFNUKVxuXHQgKi9cblx0V2FsbCxcblx0LyoqXG5cdCAqIFV0YyB0aW1lXG5cdCAqL1xuXHRVdGMsXG59XG5cbi8qKlxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcbiAqXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxuICovXG5leHBvcnQgY2xhc3MgUnVsZUluZm8ge1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdC8qKlxuXHRcdCAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxuXHRcdCAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXG5cdFx0ICovXG5cdFx0cHVibGljIGZyb206IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBUTyBjb2x1bW4gdHlwZTogWWVhciBmb3IgeWVhciBudW1iZXJzIGFuZCBcIm9ubHlcIiB2YWx1ZXMsIE1heCBmb3IgXCJtYXhcIiB2YWx1ZS5cblx0XHQgKi9cblx0XHRwdWJsaWMgdG9UeXBlOiBUb1R5cGUsXG5cdFx0LyoqXG5cdFx0ICogSWYgVE8gY29sdW1uIGlzIGEgeWVhciwgdGhlIHllYXIgbnVtYmVyLiBJZiBUTyBjb2x1bW4gaXMgXCJvbmx5XCIsIHRoZSBGUk9NIHllYXIuXG5cdFx0ICovXG5cdFx0cHVibGljIHRvWWVhcjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcblx0XHQgKi9cblx0XHRwdWJsaWMgdHlwZTogc3RyaW5nLFxuXHRcdC8qKlxuXHRcdCAqIElOIGNvbHVtbiBtb250aCBudW1iZXIgMS0xMlxuXHRcdCAqL1xuXHRcdHB1YmxpYyBpbk1vbnRoOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogT04gY29sdW1uIHR5cGVcblx0XHQgKi9cblx0XHRwdWJsaWMgb25UeXBlOiBPblR5cGUsXG5cdFx0LyoqXG5cdFx0ICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcblx0XHQgKi9cblx0XHRwdWJsaWMgb25EYXk6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBJZiBvblR5cGUgaXMgbm90IERheU51bSwgdGhlIHdlZWtkYXlcblx0XHQgKi9cblx0XHRwdWJsaWMgb25XZWVrRGF5OiBXZWVrRGF5LFxuXHRcdC8qKlxuXHRcdCAqIEFUIGNvbHVtbiBob3VyXG5cdFx0ICovXG5cdFx0cHVibGljIGF0SG91cjogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIEFUIGNvbHVtbiBtaW51dGVcblx0XHQgKi9cblx0XHRwdWJsaWMgYXRNaW51dGU6IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBBVCBjb2x1bW4gc2Vjb25kXG5cdFx0ICovXG5cdFx0cHVibGljIGF0U2Vjb25kOiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogQVQgY29sdW1uIHR5cGVcblx0XHQgKi9cblx0XHRwdWJsaWMgYXRUeXBlOiBBdFR5cGUsXG5cdFx0LyoqXG5cdFx0ICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXG5cdFx0ICovXG5cdFx0cHVibGljIHNhdmU6IER1cmF0aW9uLFxuXHRcdC8qKlxuXHRcdCAqIENoYXJhY3RlciB0byBpbnNlcnQgaW4gJXMgZm9yIHRpbWUgem9uZSBhYmJyZXZpYXRpb25cblx0XHQgKiBOb3RlIGlmIFRaIGRhdGFiYXNlIGluZGljYXRlcyBcIi1cIiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcblx0XHQgKi9cblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcblx0XHQpIHtcblxuXHRcdGlmICh0aGlzLnNhdmUpIHtcblx0XHRcdHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KFRpbWVVbml0LkhvdXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXG5cdCAqL1xuXHRwdWJsaWMgYXBwbGljYWJsZSh5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcblx0XHRpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XG5cdFx0XHRjYXNlIFRvVHlwZS5NYXg6IHJldHVybiB0cnVlO1xuXHRcdFx0Y2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU29ydCBjb21wYXJpc29uXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxuXHQgKi9cblx0cHVibGljIGVmZmVjdGl2ZUxlc3Mob3RoZXI6IFJ1bGVJbmZvKTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5mcm9tID4gb3RoZXIuZnJvbSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSA8IG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTb3J0IGNvbXBhcmlzb25cblx0ICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgZXF1YWwgdG8gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcblx0ICovXG5cdHB1YmxpYyBlZmZlY3RpdmVFcXVhbChvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcblx0XHRpZiAodGhpcy5mcm9tICE9PSBvdGhlci5mcm9tKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmluTW9udGggIT09IG90aGVyLmluTW9udGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcblx0ICogaXMgTk9UIGFkanVzdGVkIGZvciB3YWxsIGNsb2NrIHRpbWUgb3Igc3RhbmRhcmQgdGltZSwgaS5lLiB0aGlzLmF0VHlwZSBpc1xuXHQgKiBub3QgdGFrZW4gaW50byBhY2NvdW50XG5cdCAqL1xuXHRwdWJsaWMgZWZmZWN0aXZlRGF0ZSh5ZWFyOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcblx0XHRhc3NlcnQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gXCIgKyB5ZWFyLnRvU3RyaW5nKDEwKSk7XG5cblx0XHQvLyB5ZWFyIGFuZCBtb250aCBhcmUgZ2l2ZW5cblx0XHRjb25zdCB0bTogVGltZUNvbXBvbmVudE9wdHMgPSB7eWVhciwgbW9udGg6IHRoaXMuaW5Nb250aCB9O1xuXG5cdFx0Ly8gY2FsY3VsYXRlIGRheVxuXHRcdHN3aXRjaCAodGhpcy5vblR5cGUpIHtcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bToge1xuXHRcdFx0XHR0bS5kYXkgPSB0aGlzLm9uRGF5O1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiB7XG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckFmdGVyKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHtcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQmVmb3JlKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbkRheSwgdGhpcy5vbldlZWtEYXkpO1xuXHRcdFx0fSBicmVhaztcblx0XHRcdGNhc2UgT25UeXBlLkxhc3RYOiB7XG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy5sYXN0V2Vla0RheU9mTW9udGgoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uV2Vla0RheSk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdH1cblxuXHRcdC8vIGNhbGN1bGF0ZSB0aW1lXG5cdFx0dG0uaG91ciA9IHRoaXMuYXRIb3VyO1xuXHRcdHRtLm1pbnV0ZSA9IHRoaXMuYXRNaW51dGU7XG5cdFx0dG0uc2Vjb25kID0gdGhpcy5hdFNlY29uZDtcblxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0bSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdHJhbnNpdGlvbiBtb21lbnQgaW4gVVRDIGluIHRoZSBnaXZlbiB5ZWFyXG5cdCAqXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0VGhlIHN0YW5kYXJkIG9mZnNldCBmb3IgdGhlIHRpbWV6b25lIHdpdGhvdXQgRFNUXG5cdCAqIEBwYXJhbSBwcmV2UnVsZVx0VGhlIHByZXZpb3VzIHJ1bGVcblx0ICovXG5cdHB1YmxpYyB0cmFuc2l0aW9uVGltZVV0Yyh5ZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbiwgcHJldlJ1bGU/OiBSdWxlSW5mbyk6IG51bWJlciB7XG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIG5vdCBhcHBsaWNhYmxlIGluIGdpdmVuIHllYXJcIik7XG5cdFx0Y29uc3QgdW5peE1pbGxpcyA9IHRoaXMuZWZmZWN0aXZlRGF0ZSh5ZWFyKS51bml4TWlsbGlzO1xuXG5cdFx0Ly8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcblx0XHRsZXQgb2Zmc2V0OiBEdXJhdGlvbjtcblx0XHRzd2l0Y2ggKHRoaXMuYXRUeXBlKSB7XG5cdFx0XHRjYXNlIEF0VHlwZS5VdGM6XG5cdFx0XHRcdG9mZnNldCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQXRUeXBlLlN0YW5kYXJkOlxuXHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEF0VHlwZS5XYWxsOlxuXHRcdFx0XHRpZiAocHJldlJ1bGUpIHtcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldC5hZGQocHJldlJ1bGUuc2F2ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRcdGlmICh0cnVlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XG5cdFx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdW5peE1pbGxpcyAtIG9mZnNldC5taWxsaXNlY29uZHMoKTtcblx0fVxuXG5cbn1cblxuLyoqXG4gKiBUeXBlIG9mIHJlZmVyZW5jZSBmcm9tIHpvbmUgdG8gcnVsZVxuICovXG5leHBvcnQgZW51bSBSdWxlVHlwZSB7XG5cdC8qKlxuXHQgKiBObyBydWxlIGFwcGxpZXNcblx0ICovXG5cdE5vbmUsXG5cdC8qKlxuXHQgKiBGaXhlZCBnaXZlbiBvZmZzZXRcblx0ICovXG5cdE9mZnNldCxcblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byBhIG5hbWVkIHNldCBvZiBydWxlc1xuXHQgKi9cblx0UnVsZU5hbWVcbn1cblxuLyoqXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxuICpcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXG4gKiBGaXJzdCwgYW5kIHNvbWV3aGF0IHRyaXZpYWxseSwgd2hlcmVhcyBSdWxlcyBhcmUgY29uc2lkZXJlZCB0byBjb250YWluIG9uZSBvciBtb3JlIHJlY29yZHMsIGEgWm9uZSBpcyBjb25zaWRlcmVkIHRvXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cbiAqIFRoZSBsYXN0IGxpbmUgaXMgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbi5cbiAqIFNlY29uZCwgYW5kIG1vcmUgZnVuZGFtZW50YWxseSwgZWFjaCBsaW5lIG9mIGEgWm9uZSByZXByZXNlbnRzIGEgc3RlYWR5IHN0YXRlLCBub3QgYSB0cmFuc2l0aW9uIGJldHdlZW4gc3RhdGVzLlxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xuICogW1VOVElMXSBjb2x1bW4uIEluIG90aGVyIHdvcmRzLCB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgW1VOVElMXSBjb2x1bW4gaXMgdGhlIGluc3RhbnQgdGhhdCBzZXBhcmF0ZXMgdGhpcyBzdGF0ZSBmcm9tIHRoZSBuZXh0LlxuICogV2hlcmUgdGhhdCB3b3VsZCBiZSBhbWJpZ3VvdXMgYmVjYXVzZSB3ZeKAmXJlIHNldHRpbmcgb3VyIGNsb2NrcyBiYWNrLCB0aGUgW1VOVElMXSBjb2x1bW4gc3BlY2lmaWVzIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBpbnN0YW50LlxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXG4gKiBUaGUgZmlyc3QgbGluZSB0eXBpY2FsbHkgc3BlY2lmaWVzIHRoZSBtZWFuIHNvbGFyIHRpbWUgb2JzZXJ2ZWQgYmVmb3JlIHRoZSBpbnRyb2R1Y3Rpb24gb2Ygc3RhbmRhcmQgdGltZS4gU2luY2UgdGhlcmXigJlzIG5vIGxpbmUgYmVmb3JlXG4gKiB0aGF0LCBpdCBoYXMgbm8gYmVnaW5uaW5nLiA4LSkgRm9yIHNvbWUgcGxhY2VzIG5lYXIgdGhlIEludGVybmF0aW9uYWwgRGF0ZSBMaW5lLCB0aGUgZmlyc3QgdHdvIGxpbmVzIHdpbGwgc2hvdyBzb2xhciB0aW1lcyBkaWZmZXJpbmcgYnlcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XG4gKiAjIFpvbmVcdE5BTUVcdFx0R01UT0ZGXHRSVUxFU1x0Rk9STUFUXHRbVU5USUxdXG4gKiBab25lIEFtZXJpY2EvSnVuZWF1XHQgMTU6MDI6MTkgLVx0TE1UXHQxODY3IE9jdCAxOFxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXG4gKiBXaGVuIEFsYXNrYSB3YXMgcHVyY2hhc2VkIGZyb20gUnVzc2lhIGluIDE4NjcsIHRoZSBEYXRlIExpbmUgbW92ZWQgZnJvbSB0aGUgQWxhc2thL0NhbmFkYSBib3JkZXIgdG8gdGhlIEJlcmluZyBTdHJhaXQ7IGFuZCB0aGUgdGltZSBpblxuICogQWxhc2thIHdhcyB0aGVuIDI0IGhvdXJzIGVhcmxpZXIgdGhhbiBpdCBoYWQgYmVlbi4gPGFzaWRlPig2IE9jdG9iZXIgaW4gdGhlIEp1bGlhbiBjYWxlbmRhciwgd2hpY2ggUnVzc2lhIHdhcyBzdGlsbCB1c2luZyB0aGVuIGZvclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXG4gKiBJc27igJl0IGNpdmlsIHRpbWUgd29uZGVyZnVsPyA4LSkpPC9hc2lkZT5cbiAqIFRoZSBhYmJyZXZpYXRpb24sIOKAnExNVCzigJ0gc3RhbmRzIGZvciDigJxsb2NhbCBtZWFuIHRpbWUs4oCdIHdoaWNoIGlzIGFuIGludmVudGlvbiBvZiB0aGUgdHogZGF0YWJhc2UgYW5kIHdhcyBwcm9iYWJseSBuZXZlciBhY3R1YWxseVxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cbiAqIChUaGUgdHogZGF0YWJhc2UgdXN1YWxseSBkb2VzbuKAmXQgcHJvdmlkZSBhIHNlcGFyYXRlIFpvbmUgcmVjb3JkIGZvciBwbGFjZXMgd2hlcmUgbm90aGluZyBzaWduaWZpY2FudCBoYXBwZW5lZCBhZnRlciAxOTcwLilcbiAqL1xuZXhwb3J0IGNsYXNzIFpvbmVJbmZvIHtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHQvKipcblx0XHQgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXG5cdFx0ICogY29udHJhcnkgdG8gd2hhdCB5b3UgbWlnaHQgZXhwZWN0KS4gIEUuZy4gRXVyb3BlL0Ftc3RlcmRhbSBoYXMgKzYwIG1pbnV0ZXMgaW4gdGhpcyBmaWVsZCBiZWNhdXNlXG5cdFx0ICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXG5cdFx0ICovXG5cdFx0cHVibGljIGdtdG9mZjogRHVyYXRpb24sXG5cblx0XHQvKipcblx0XHQgKiBUaGUgUlVMRVMgY29sdW1uIHRlbGxzIHVzIHdoZXRoZXIgZGF5bGlnaHQgc2F2aW5nIHRpbWUgaXMgYmVpbmcgb2JzZXJ2ZWQ6XG5cdFx0ICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXG5cdFx0ICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cblx0XHQgKiBTb21lIGFscGhhYmV0aWMgc3RyaW5nIG1lYW5zIHRoYXQgd2UgbWlnaHQgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZDsgYW5kIHdlIG5lZWQgdG8gY2hlY2sgdGhlIHJ1bGVcblx0XHQgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXG5cdFx0ICovXG5cdFx0cHVibGljIHJ1bGVUeXBlOiBSdWxlVHlwZSxcblxuXHRcdC8qKlxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhbiBvZmZzZXQsIHRoaXMgaXMgdGhlIG9mZnNldFxuXHRcdCAqL1xuXHRcdHB1YmxpYyBydWxlT2Zmc2V0OiBEdXJhdGlvbixcblxuXHRcdC8qKlxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXG5cdFx0ICovXG5cdFx0cHVibGljIHJ1bGVOYW1lOiBzdHJpbmcsXG5cblx0XHQvKipcblx0XHQgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxuXHRcdCAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxuXHRcdCAqIGEgc2luZ2xlIGFscGhhYmV0aWMgc3RyaW5nIG90aGVyIHRoYW4g4oCcenp6LOKAnSBpbiB3aGljaCBjYXNlIHRoYXTigJlzIHRoZSBhYmJyZXZpYXRpb25cblx0XHQgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXG5cdFx0ICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXG5cdFx0ICogYSBzdHJpbmcgY29udGFpbmluZyDigJwlcyzigJ0gaW4gd2hpY2ggY2FzZSB0aGUg4oCcJXPigJ0gd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgdGV4dCBpbiB0aGUgYXBwcm9wcmlhdGUgUnVsZeKAmXMgTEVUVEVSIGNvbHVtblxuXHRcdCAqL1xuXHRcdHB1YmxpYyBmb3JtYXQ6IHN0cmluZyxcblxuXHRcdC8qKlxuXHRcdCAqIFVudGlsIHRpbWVzdGFtcCBpbiB1bml4IHV0YyBtaWxsaXMuIFRoZSB6b25lIGluZm8gaXMgdmFsaWQgdXAgdG9cblx0XHQgKiBhbmQgZXhjbHVkaW5nIHRoaXMgdGltZXN0YW1wLlxuXHRcdCAqIE5vdGUgdGhpcyB2YWx1ZSBjYW4gYmUgdW5kZWZpbmVkIChmb3IgdGhlIGZpcnN0IHJ1bGUpXG5cdFx0ICovXG5cdFx0cHVibGljIHVudGlsPzogbnVtYmVyXG5cdCkge1xuXHRcdGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcblx0XHRcdHRoaXMucnVsZU9mZnNldCA9IHRoaXMucnVsZU9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcblx0XHR9XG5cdH1cbn1cblxuXG5lbnVtIFR6TW9udGhOYW1lcyB7XG5cdEphbiA9IDEsXG5cdEZlYiA9IDIsXG5cdE1hciA9IDMsXG5cdEFwciA9IDQsXG5cdE1heSA9IDUsXG5cdEp1biA9IDYsXG5cdEp1bCA9IDcsXG5cdEF1ZyA9IDgsXG5cdFNlcCA9IDksXG5cdE9jdCA9IDEwLFxuXHROb3YgPSAxMSxcblx0RGVjID0gMTJcbn1cblxuZnVuY3Rpb24gbW9udGhOYW1lVG9TdHJpbmcobmFtZTogc3RyaW5nKTogbnVtYmVyIHtcblx0Zm9yIChsZXQgaTogbnVtYmVyID0gMTsgaSA8PSAxMjsgKytpKSB7XG5cdFx0aWYgKFR6TW9udGhOYW1lc1tpXSA9PT0gbmFtZSkge1xuXHRcdFx0cmV0dXJuIGk7XG5cdFx0fVxuXHR9XG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRpZiAodHJ1ZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbW9udGggbmFtZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiXCIpO1xuXHR9XG59XG5cbmVudW0gVHpEYXlOYW1lcyB7XG5cdFN1biA9IDAsXG5cdE1vbiA9IDEsXG5cdFR1ZSA9IDIsXG5cdFdlZCA9IDMsXG5cdFRodSA9IDQsXG5cdEZyaSA9IDUsXG5cdFNhdCA9IDZcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBhIHZhbGlkIG9mZnNldCBzdHJpbmcgaS5lLlxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRPZmZzZXRTdHJpbmcoczogc3RyaW5nKTogYm9vbGVhbiB7XG5cdHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGEgbW9tZW50IGF0IHdoaWNoIHRoZSBnaXZlbiBydWxlIGJlY29tZXMgdmFsaWRcbiAqL1xuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb24ge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHQvKipcblx0XHQgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xuXHRcdCAqL1xuXHRcdHB1YmxpYyBhdDogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxuXHRcdCAqL1xuXHRcdHB1YmxpYyBvZmZzZXQ6IER1cmF0aW9uLFxuXG5cdFx0LyoqXG5cdFx0ICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxuXHRcdCAqL1xuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xuXG5cdFx0KSB7XG5cdFx0aWYgKHRoaXMub2Zmc2V0KSB7XG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXG4gKi9cbmV4cG9ydCBlbnVtIE5vcm1hbGl6ZU9wdGlvbiB7XG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxuXHQgKi9cblx0VXAsXG5cdC8qKlxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IFNVQlRSQUNUSU5HIHRoZSBEU1Qgb2Zmc2V0XG5cdCAqL1xuXHREb3duXG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBpcyBhIHdyYXBwZXIgYXJvdW5kIHRpbWUgem9uZSBkYXRhIEpTT04gb2JqZWN0IGZyb20gdGhlIHR6ZGF0YSBOUE0gbW9kdWxlLlxuICogWW91IHVzdWFsbHkgZG8gbm90IG5lZWQgdG8gdXNlIHRoaXMgZGlyZWN0bHksIHVzZSBUaW1lWm9uZSBhbmQgRGF0ZVRpbWUgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFR6RGF0YWJhc2Uge1xuXG5cdC8qKlxuXHQgKiBTaW5nbGUgaW5zdGFuY2UgbWVtYmVyXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U/OiBUekRhdGFiYXNlO1xuXG5cdC8qKlxuXHQgKiAocmUtKSBpbml0aWFsaXplIHRpbWV6b25lY29tcGxldGUgd2l0aCB0aW1lIHpvbmUgZGF0YVxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YSBUWiBkYXRhIGFzIEpTT04gb2JqZWN0IChmcm9tIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzKS5cblx0ICogICAgICAgICAgICAgSWYgbm90IGdpdmVuLCBUaW1lem9uZWNvbXBsZXRlIHdpbGwgc2VhcmNoIGZvciBpbnN0YWxsZWQgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW5pdChkYXRhPzogYW55IHwgYW55W10pOiB2b2lkIHtcblx0XHRpZiAoZGF0YSkge1xuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSB1bmRlZmluZWQ7IC8vIG5lZWRlZCBmb3IgYXNzZXJ0IGluIGNvbnN0cnVjdG9yXG5cdFx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogW2RhdGFdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZGF0YTogYW55W10gPSBbXTtcblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgaW4gZ2xvYmFsIHZhcmlhYmxlc1xuXHRcdFx0bGV0IGc6IGFueTtcblx0XHRcdGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdGcgPSB3aW5kb3c7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0ZyA9IGdsb2JhbDtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0ZyA9IHNlbGY7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRnID0ge307XG5cdFx0XHR9XG5cdFx0XHRpZiAoZykge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhnKSkge1xuXHRcdFx0XHRcdGlmIChrZXkuc3RhcnRzV2l0aChcInR6ZGF0YVwiKSkge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBnW2tleV0gPT09IFwib2JqZWN0XCIgJiYgZ1trZXldLnJ1bGVzICYmIGdba2V5XS56b25lcykge1xuXHRcdFx0XHRcdFx0XHRkYXRhLnB1c2goZ1trZXldKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIHRyeSB0byBmaW5kIFRaIGRhdGEgYXMgaW5zdGFsbGVkIE5QTSBtb2R1bGVzXG5cdFx0XHRjb25zdCBmaW5kTm9kZU1vZHVsZXMgPSAocmVxdWlyZTogYW55KTogdm9pZCA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Ly8gZmlyc3QgdHJ5IHR6ZGF0YSB3aGljaCBjb250YWlucyBhbGwgZGF0YVxuXHRcdFx0XHRcdGNvbnN0IHR6RGF0YU5hbWUgPSBcInR6ZGF0YVwiO1xuXHRcdFx0XHRcdGNvbnN0IGQgPSByZXF1aXJlKHR6RGF0YU5hbWUpOyAvLyB1c2UgdmFyaWFibGUgdG8gYXZvaWQgYnJvd3NlcmlmeSBhY3RpbmcgdXBcblx0XHRcdFx0XHRkYXRhLnB1c2goZCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHQvLyB0aGVuIHRyeSBzdWJzZXRzXG5cdFx0XHRcdFx0Y29uc3QgbW9kdWxlTmFtZXM6IHN0cmluZ1tdID0gW1xuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYWZyaWNhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hbnRhcmN0aWNhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hc2lhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1hdXN0cmFsYXNpYVwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtYmFja3dhcmRcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWJhY2t3YXJkLXV0Y1wiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtZXRjZXRlcmFcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLWV1cm9wZVwiLFxuXHRcdFx0XHRcdFx0XCJ0emRhdGEtbm9ydGhhbWVyaWNhXCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1wYWNpZmljbmV3XCIsXG5cdFx0XHRcdFx0XHRcInR6ZGF0YS1zb3V0aGFtZXJpY2FcIixcblx0XHRcdFx0XHRcdFwidHpkYXRhLXN5c3RlbXZcIlxuXHRcdFx0XHRcdF07XG5cdFx0XHRcdFx0bW9kdWxlTmFtZXMuZm9yRWFjaCgobW9kdWxlTmFtZTogc3RyaW5nKTogdm9pZCA9PiB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkID0gcmVxdWlyZShtb2R1bGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0ZGF0YS5wdXNoKGQpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0XHQvLyBub3RoaW5nXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0ZmluZE5vZGVNb2R1bGVzKHJlcXVpcmUpOyAvLyBuZWVkIHRvIHB1dCByZXF1aXJlIGludG8gYSBmdW5jdGlvbiB0byBtYWtlIHdlYnBhY2sgaGFwcHlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShkYXRhKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2luZ2xlIGluc3RhbmNlIG9mIHRoaXMgZGF0YWJhc2Vcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW5zdGFuY2UoKTogVHpEYXRhYmFzZSB7XG5cdFx0aWYgKCFUekRhdGFiYXNlLl9pbnN0YW5jZSkge1xuXHRcdFx0VHpEYXRhYmFzZS5pbml0KCk7XG5cdFx0fVxuXHRcdHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZSBhcyBUekRhdGFiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRpbWUgem9uZSBkYXRhYmFzZSBkYXRhXG5cdCAqL1xuXHRwcml2YXRlIF9kYXRhOiBhbnk7XG5cblx0LyoqXG5cdCAqIENhY2hlZCBtaW4vbWF4IERTVCB2YWx1ZXNcblx0ICovXG5cdHByaXZhdGUgX21pbm1heDogTWluTWF4SW5mbztcblxuXHQvKipcblx0ICogQ2FjaGVkIHpvbmUgbmFtZXNcblx0ICovXG5cdHByaXZhdGUgX3pvbmVOYW1lczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIC0gZG8gbm90IHVzZSwgdGhpcyBpcyBhIHNpbmdsZXRvbiBjbGFzcy4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKSBpbnN0ZWFkXG5cdCAqL1xuXHRwcml2YXRlIGNvbnN0cnVjdG9yKGRhdGE6IGFueVtdKSB7XG5cdFx0YXNzZXJ0KCFUekRhdGFiYXNlLl9pbnN0YW5jZSwgXCJZb3Ugc2hvdWxkIG5vdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIFR6RGF0YWJhc2UgY2xhc3MgeW91cnNlbGYuIFVzZSBUekRhdGFiYXNlLmluc3RhbmNlKClcIik7XG5cdFx0YXNzZXJ0KFxuXHRcdFx0ZGF0YS5sZW5ndGggPiAwLFxuXHRcdFx0XCJUaW1lem9uZWNvbXBsZXRlIG5lZWRzIHRpbWUgem9uZSBkYXRhLiBZb3UgbmVlZCB0byBpbnN0YWxsIG9uZSBvZiB0aGUgdHpkYXRhIE5QTSBtb2R1bGVzIGJlZm9yZSB1c2luZyB0aW1lem9uZWNvbXBsZXRlLlwiXG5cdFx0KTtcblx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDEpIHtcblx0XHRcdHRoaXMuX2RhdGEgPSBkYXRhWzBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9kYXRhID0geyB6b25lczoge30sIHJ1bGVzOiB7fSB9O1xuXHRcdFx0ZGF0YS5mb3JFYWNoKChkOiBhbnkpOiB2b2lkID0+IHtcblx0XHRcdFx0aWYgKGQgJiYgZC5ydWxlcyAmJiBkLnpvbmVzKSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC5ydWxlcykpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2RhdGEucnVsZXNba2V5XSA9IGQucnVsZXNba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoZC56b25lcykpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2RhdGEuem9uZXNba2V5XSA9IGQuem9uZXNba2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEodGhpcy5fZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXG5cdCAqL1xuXHRwdWJsaWMgem9uZU5hbWVzKCk6IHN0cmluZ1tdIHtcblx0XHRpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xuXHRcdFx0dGhpcy5fem9uZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5fZGF0YS56b25lcyk7XG5cdFx0XHR0aGlzLl96b25lTmFtZXMuc29ydCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5fem9uZU5hbWVzO1xuXHR9XG5cblx0cHVibGljIGV4aXN0cyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG5cdCAqXG5cdCAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcblx0ICovXG5cdHB1YmxpYyBtaW5Ec3RTYXZlKHpvbmVOYW1lPzogc3RyaW5nKTogRHVyYXRpb24ge1xuXHRcdGlmICh6b25lTmFtZSkge1xuXHRcdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdFx0bGV0IHJlc3VsdDogRHVyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHpvbmVJbmZvcykge1xuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xuXHRcdFx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVPZmZzZXQubWlsbGlzZWNvbmRzKCkgIT09IDApIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxuXHRcdFx0XHRcdCYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XG5cdFx0XHRcdFx0Y29uc3QgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHJ1bGVJbmZvIG9mIHRlbXApIHtcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdHJlc3VsdCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1heGltdW0gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXG5cdCAqXG5cdCAqIFJldHVybnMgMCBpZiB6b25lTmFtZSBnaXZlbiBhbmQgbm8gRFNUIG9ic2VydmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXG5cdCAqL1xuXHRwdWJsaWMgbWF4RHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcblx0XHRpZiAoem9uZU5hbWUpIHtcblx0XHRcdGNvbnN0IHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcblx0XHRcdGxldCByZXN1bHQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgcnVsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcblx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4oem9uZUluZm8ucnVsZU9mZnNldCkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xuXHRcdFx0XHRcdGNvbnN0IHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiB0ZW1wKSB7XG5cdFx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQubGVzc1RoYW4ocnVsZUluZm8uc2F2ZSkpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdHJlc3VsdCA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSB6b25lIGhhcyBEU1QgYXQgYWxsXG5cdCAqL1xuXHRwdWJsaWMgaGFzRHN0KHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMubWF4RHN0U2F2ZSh6b25lTmFtZSkubWlsbGlzZWNvbmRzKCkgIT09IDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpcnN0IERTVCBjaGFuZ2UgbW9tZW50IEFGVEVSIHRoZSBnaXZlbiBVVEMgZGF0ZSBpbiBVVEMgbWlsbGlzZWNvbmRzLCB3aXRoaW4gb25lIHllYXIsXG5cdCAqIHJldHVybnMgdW5kZWZpbmVkIGlmIG5vIHN1Y2ggY2hhbmdlXG5cdCAqL1xuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QpOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdHB1YmxpYyBuZXh0RHN0Q2hhbmdlKHpvbmVOYW1lOiBzdHJpbmcsIGE6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xuXG5cdFx0Ly8gZ2V0IGFsbCB6b25lIGluZm9zIGZvciBbZGF0ZSwgZGF0ZSsxeWVhcilcblx0XHRjb25zdCBhbGxab25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0Y29uc3QgcmVsZXZhbnRab25lSW5mb3M6IFpvbmVJbmZvW10gPSBbXTtcblx0XHRjb25zdCByYW5nZVN0YXJ0OiBudW1iZXIgPSB1dGNUaW1lLnVuaXhNaWxsaXM7XG5cdFx0Y29uc3QgcmFuZ2VFbmQ6IG51bWJlciA9IHJhbmdlU3RhcnQgKyAzNjUgKiA4NjQwMEUzO1xuXHRcdGxldCBwcmV2RW5kOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiBhbGxab25lSW5mb3MpIHtcblx0XHRcdGlmICgocHJldkVuZCA9PT0gdW5kZWZpbmVkIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xuXHRcdFx0XHRyZWxldmFudFpvbmVJbmZvcy5wdXNoKHpvbmVJbmZvKTtcblx0XHRcdH1cblx0XHRcdHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcblx0XHR9XG5cblx0XHQvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXG5cdFx0bGV0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSBbXTtcblx0XHRmb3IgKGNvbnN0IHpvbmVJbmZvIG9mIHJlbGV2YW50Wm9uZUluZm9zKSB7XG5cdFx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXG5cdFx0XHR0cmFuc2l0aW9ucyA9IHRyYW5zaXRpb25zLmNvbmNhdChcblx0XHRcdFx0dGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoem9uZUluZm8ucnVsZU5hbWUsIHV0Y1RpbWUuY29tcG9uZW50cy55ZWFyIC0gMSwgdXRjVGltZS5jb21wb25lbnRzLnllYXIgKyAxLCB6b25lSW5mby5nbXRvZmYpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR0cmFuc2l0aW9ucy5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcblx0XHR9KTtcblxuXHRcdC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxuXHRcdGxldCBwcmV2U2F2ZTogRHVyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIHRyYW5zaXRpb25zKSB7XG5cdFx0XHRpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLmF0ID4gdXRjVGltZS51bml4TWlsbGlzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRyYW5zaXRpb24uYXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHByZXZTYXZlID0gdHJhbnNpdGlvbi5vZmZzZXQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBnaXZlbiB6b25lIG5hbWUgZXZlbnR1YWxseSBsaW5rcyB0b1xuXHQgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3Jcblx0ICogXCJVVENcIiwgXCJHTVRcIiwgXCJFdGMvR01UXCIgZXRjLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXG5cdCAqL1xuXHRwdWJsaWMgem9uZUlzVXRjKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRsZXQgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xuXHRcdGxldCB6b25lRW50cmllczogYW55ID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XG5cdFx0Ly8gZm9sbG93IGxpbmtzXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcblx0XHRcdFx0XHQrIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcblx0XHRcdH1cblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XG5cdFx0XHR6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xuXHRcdH1cblx0XHRyZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcvc3VidHJhY3RpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2Zcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxuXHQgKiBAcGFyYW0gbG9jYWxUaW1lXHRBIGxvY2FsIHRpbWUsIGVpdGhlciBhcyBhIFRpbWVTdHJ1Y3Qgb3IgYXMgYSB1bml4IG1pbGxpc2Vjb25kIHZhbHVlXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXAuXG5cdCAqXG5cdCAqIEByZXR1cm5cdFRoZSBub3JtYWxpemVkIHRpbWUsIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB0aGUgbG9jYWxUaW1lIHBhcmFtZXRlciAoVGltZVN0cnVjdCBvciB1bml4IG1pbGxpcylcblx0ICovXG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IG51bWJlciwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogbnVtYmVyO1xuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0LCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBUaW1lU3RydWN0O1xuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgYTogVGltZVN0cnVjdCB8IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBUaW1lU3RydWN0IHwgbnVtYmVyIHtcblx0XHRpZiAodGhpcy5oYXNEc3Qoem9uZU5hbWUpKSB7XG5cdFx0XHRjb25zdCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdChhKSA6IGEpO1xuXHRcdFx0Ly8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XG5cdFx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxuXHRcdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XG5cdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xuXG5cdFx0XHQvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxuXHRcdFx0Ly8gSW5zdGVhZCwgd2Ugc2hvdWxkIGNoZWNrIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9ucyB3aXRoaW4gYSB3aW5kb3cgYXJvdW5kIHRoZSBsb2NhbCB0aW1lXG5cblx0XHRcdC8vIGdldCBhbGwgdHJhbnNpdGlvbnMgKG5vdGUgdGhpcyBpbmNsdWRlcyBmYWtlIHRyYW5zaXRpb24gcnVsZXMgZm9yIHpvbmUgb2Zmc2V0IGNoYW5nZXMpXG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyhcblx0XHRcdFx0em9uZU5hbWUsIGxvY2FsVGltZS5jb21wb25lbnRzLnllYXIgLSAxLCBsb2NhbFRpbWUuY29tcG9uZW50cy55ZWFyICsgMVxuXHRcdFx0KTtcblxuXHRcdFx0Ly8gZmluZCB0aGUgRFNUIGZvcndhcmQgdHJhbnNpdGlvbnNcblx0XHRcdGxldCBwcmV2OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xuXHRcdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIHRyYW5zaXRpb25zKSB7XG5cdFx0XHRcdC8vIGZvcndhcmQgdHJhbnNpdGlvbj9cblx0XHRcdFx0aWYgKHRyYW5zaXRpb24ub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbG9jYWxCZWZvcmU6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyBwcmV2Lm1pbGxpc2Vjb25kcygpO1xuXHRcdFx0XHRcdGNvbnN0IGxvY2FsQWZ0ZXI6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcblx0XHRcdFx0XHRpZiAobG9jYWxUaW1lLnVuaXhNaWxsaXMgPj0gbG9jYWxCZWZvcmUgJiYgbG9jYWxUaW1lLnVuaXhNaWxsaXMgPCBsb2NhbEFmdGVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xuXHRcdFx0XHRcdFx0Ly8gbm9uLWV4aXN0aW5nIHRpbWVcblx0XHRcdFx0XHRcdGNvbnN0IGZhY3RvcjogbnVtYmVyID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLlVwID8gMSA6IC0xKTtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdE1pbGxpcyA9IGxvY2FsVGltZS51bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKTtcblx0XHRcdFx0XHRcdHJldHVybiAodHlwZW9mIGEgPT09IFwibnVtYmVyXCIgPyByZXN1bHRNaWxsaXMgOiBuZXcgVGltZVN0cnVjdChyZXN1bHRNaWxsaXMpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cHJldiA9IHRyYW5zaXRpb24ub2Zmc2V0O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBubyBub24tZXhpc3RpbmcgdGltZVxuXHRcdH1cblx0XHRyZXR1cm4gKHR5cGVvZiBhID09PSBcIm51bWJlclwiID8gYSA6IGEuY2xvbmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXG5cdCAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDLCBlaXRoZXIgYXMgVGltZVN0cnVjdCBvciBhcyBVbml4IG1pbGxpc2Vjb25kIHZhbHVlXG5cdCAqL1xuXHRwdWJsaWMgc3RhbmRhcmRPZmZzZXQoem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IER1cmF0aW9uIHtcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcblx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcblx0ICogdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXAuXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIHV0Y1RpbWVcdFRpbWVzdGFtcCBpbiBVVEMsIGVpdGhlciBhcyBUaW1lU3RydWN0IG9yIGFzIFVuaXggbWlsbGlzZWNvbmQgdmFsdWVcblx0ICovXG5cdHB1YmxpYyB0b3RhbE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdGNvbnN0IHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y1RpbWUpO1xuXHRcdGxldCBkc3RPZmZzZXQ6IER1cmF0aW9uO1xuXG5cdFx0c3dpdGNoICh6b25lSW5mby5ydWxlVHlwZSkge1xuXHRcdFx0Y2FzZSBSdWxlVHlwZS5Ob25lOiB7XG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XG5cdFx0XHR9IGJyZWFrO1xuXHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6IHtcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XG5cdFx0XHRcdGRzdE9mZnNldCA9IHRoaXMuZHN0T2Zmc2V0Rm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcblx0XHRcdH0gYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiAvLyBjYW5ub3QgaGFwcGVuLCBidXQgdGhlIGNvbXBpbGVyIGRvZXNudCByZWFsaXplIGl0XG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBkc3RPZmZzZXQuYWRkKHpvbmVJbmZvLmdtdG9mZik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWUgem9uZSBydWxlIGFiYnJldmlhdGlvbiwgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxuXHQgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxuXHQgKiBhbmQgdGhlcmVmb3JlIGRpZmZlcmVudCBhYmJyZXZpYXRpb25zLiBUaGV5IGFsc28gY2hhbmdlIHdpdGggRFNUOiBlLmcuIENFU1Qgb3IgQ0VULlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cblx0ICogQHJldHVyblx0VGhlIGFiYnJldmlhdGlvbiBvZiB0aGUgcnVsZSB0aGF0IGlzIGluIGVmZmVjdFxuXHQgKi9cblx0cHVibGljIGFiYnJldmlhdGlvbih6b25lTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcblx0XHRjb25zdCB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNUaW1lKTtcblx0XHRjb25zdCBmb3JtYXQ6IHN0cmluZyA9IHpvbmVJbmZvLmZvcm1hdDtcblxuXHRcdC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xuXHRcdGlmIChmb3JtYXQuaW5kZXhPZihcIiVzXCIpICE9PSAtMVxuXHRcdFx0JiYgem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XG5cdFx0XHRsZXQgbGV0dGVyOiBzdHJpbmc7XG5cdFx0XHQvLyBwbGFjZSBpbiBmb3JtYXQgc3RyaW5nXG5cdFx0XHRpZiAoZHN0RGVwZW5kZW50KSB7XG5cdFx0XHRcdGxldHRlciA9IHRoaXMubGV0dGVyRm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjVGltZSwgem9uZUluZm8uZ210b2ZmKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxldHRlciA9IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZm9ybWF0LnJlcGxhY2UoXCIlc1wiLCBsZXR0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3JtYXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cblx0ICpcblx0ICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxuXHQgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxuXHQgKlxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxuXHQgKi9cblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0TG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyKTogRHVyYXRpb24ge1xuXHRcdGNvbnN0IHVuaXhNaWxsaXMgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IGxvY2FsVGltZSA6IGxvY2FsVGltZS51bml4TWlsbGlzKTtcblx0XHRjb25zdCB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gdW5kZWZpbmVkIHx8IHpvbmVJbmZvLnVudGlsICsgem9uZUluZm8uZ210b2ZmLm1pbGxpc2Vjb25kcygpID4gdW5peE1pbGxpcykge1xuXHRcdFx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0aWYgKHRydWUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHpvbmUgaW5mbyBmb3VuZFwiKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcC4gTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgaXMgbm9ybWFsaXplZCBvdXQuXG5cdCAqIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBVVEMgdGltZXMgYW5kIHRoZXJlZm9yZSBtdWx0aXBsZSBvZmZzZXRzIGZvciBhIGxvY2FsIHRpbWVcblx0ICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXG5cdCAqL1xuXHRwdWJsaWMgdG90YWxPZmZzZXRMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIpOiBEdXJhdGlvbiB7XG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIGxvY2FsVGltZSA9PT0gXCJudW1iZXJcIiA/IG5ldyBUaW1lU3RydWN0KGxvY2FsVGltZSkgOiBsb2NhbFRpbWUpO1xuXHRcdGNvbnN0IG5vcm1hbGl6ZWRUbTogVGltZVN0cnVjdCA9IHRoaXMubm9ybWFsaXplTG9jYWwoem9uZU5hbWUsIHRzKTtcblxuXHRcdC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDJoKTogICAwIDEgNCA1IDZcblx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzICA8LS0gbm90ZSB0aW1lIGdvaW5nIEJBQ0tXQVJEXG5cblx0XHQvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXG5cdFx0Ly8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xuXG5cdFx0Y29uc3QgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoXG5cdFx0XHR6b25lTmFtZSwgbm9ybWFsaXplZFRtLmNvbXBvbmVudHMueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS5jb21wb25lbnRzLnllYXIgKyAxXG5cdFx0KTtcblx0XHRsZXQgcHJldjogVHJhbnNpdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRsZXQgcHJldlByZXY6IFRyYW5zaXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIHRyYW5zaXRpb25zKSB7XG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMpIHtcblx0XHRcdFx0Ly8gZm91bmQgb2Zmc2V0OiBwcmV2Lm9mZnNldCBhcHBsaWVzXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cHJldlByZXYgPSBwcmV2O1xuXHRcdFx0cHJldiA9IHRyYW5zaXRpb247XG5cdFx0fVxuXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cblx0XHRpZiAocHJldikge1xuXHRcdFx0Ly8gc3BlY2lhbCBjYXJlIGR1cmluZyBiYWNrd2FyZCBjaGFuZ2U6IHRha2UgZmlyc3Qgb2NjdXJyZW5jZSBvZiBsb2NhbCB0aW1lXG5cdFx0XHRpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xuXHRcdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2Vcblx0XHRcdFx0Y29uc3QgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xuXHRcdFx0XHRpZiAobm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPj0gcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpXG5cdFx0XHRcdFx0JiYgbm9ybWFsaXplZFRtLnVuaXhNaWxsaXMgPCBwcmV2LmF0ICsgcHJldi5vZmZzZXQubWlsbGlzZWNvbmRzKCkgKyBkaWZmLm1pbGxpc2Vjb25kcygpKSB7XG5cdFx0XHRcdFx0Ly8gd2l0aGluIGR1cGxpY2F0ZSByYW5nZVxuXHRcdFx0XHRcdHJldHVybiBwcmV2UHJldi5vZmZzZXQuY2xvbmUoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRoaXMgY2Fubm90IGhhcHBlbiBhcyB0aGUgdHJhbnNpdGlvbnMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBjb250YWluIGEgdHJhbnNpdGlvbiBhdCB0aGVcblx0XHRcdC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXG5cdCAqXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXG5cdCAqL1xuXHRwdWJsaWMgZHN0T2Zmc2V0Rm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNUaW1lOiBUaW1lU3RydWN0IHwgbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBEdXJhdGlvbiB7XG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xuXG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xuXHRcdGNvbnN0IHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcblx0XHRcdHJ1bGVOYW1lLCB0cy5jb21wb25lbnRzLnllYXIgLSAxLCB0cy5jb21wb25lbnRzLnllYXIsIHN0YW5kYXJkT2Zmc2V0XG5cdFx0KTtcblxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxuXHRcdGxldCBvZmZzZXQ6IER1cmF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGZvciAobGV0IGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0Y29uc3QgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPD0gdHMudW5peE1pbGxpcykge1xuXHRcdFx0XHRvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRpZiAoIW9mZnNldCkge1xuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXG5cdFx0XHRvZmZzZXQgPSBEdXJhdGlvbi5taW51dGVzKDApO1xuXHRcdH1cblxuXHRcdHJldHVybiBvZmZzZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXG5cdCAqIHJ1bGVzZXQgYW5kIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wXG5cdCAqXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZXN0YW1wIGFzIFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXNcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcblx0ICovXG5cdHB1YmxpYyBsZXR0ZXJGb3JSdWxlKHJ1bGVOYW1lOiBzdHJpbmcsIHV0Y1RpbWU6IFRpbWVTdHJ1Y3QgfCBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IHN0cmluZyB7XG5cdFx0Y29uc3QgdHM6IFRpbWVTdHJ1Y3QgPSAodHlwZW9mIHV0Y1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXcgVGltZVN0cnVjdCh1dGNUaW1lKSA6IHV0Y1RpbWUpO1xuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcblx0XHRjb25zdCB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXG5cdFx0XHRydWxlTmFtZSwgdHMuY29tcG9uZW50cy55ZWFyIC0gMSwgdHMuY29tcG9uZW50cy55ZWFyLCBzdGFuZGFyZE9mZnNldFxuXHRcdCk7XG5cblx0XHQvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcblx0XHRsZXQgbGV0dGVyOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChsZXQgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRjb25zdCB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB0cy51bml4TWlsbGlzKSB7XG5cdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRpZiAoIWxldHRlcikge1xuXHRcdFx0Ly8gYXBwYXJlbnRseSBubyBsb25nZXIgRFNULCBhcyBlLmcuIGZvciBBc2lhL1Rva3lvXG5cdFx0XHRsZXR0ZXIgPSBcIlwiO1xuXHRcdH1cblxuXHRcdHJldHVybiBsZXR0ZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIGEgbGlzdCBvZiBhbGwgdHJhbnNpdGlvbnMgaW4gW2Zyb21ZZWFyLi50b1llYXJdIHNvcnRlZCBieSBlZmZlY3RpdmUgZGF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XG5cdCAqIEBwYXJhbSBmcm9tWWVhclx0Zmlyc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXG5cdCAqXG5cdCAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcblx0ICovXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWU6IHN0cmluZywgZnJvbVllYXI6IG51bWJlciwgdG9ZZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IFRyYW5zaXRpb25bXSB7XG5cdFx0YXNzZXJ0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcblxuXHRcdGNvbnN0IHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcblx0XHRjb25zdCByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xuXG5cdFx0Zm9yIChsZXQgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XG5cdFx0XHRsZXQgcHJldkluZm86IFJ1bGVJbmZvIHwgdW5kZWZpbmVkO1xuXHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiBydWxlSW5mb3MpIHtcblx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihcblx0XHRcdFx0XHRcdHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHksIHN0YW5kYXJkT2Zmc2V0LCBwcmV2SW5mbyksXG5cdFx0XHRcdFx0XHRydWxlSW5mby5zYXZlLFxuXHRcdFx0XHRcdFx0cnVsZUluZm8ubGV0dGVyKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cHJldkluZm8gPSBydWxlSW5mbztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XG5cdFx0XHRyZXR1cm4gYS5hdCAtIGIuYXQ7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gYm90aCB6b25lIGFuZCBydWxlIGNoYW5nZXMgYXMgdG90YWwgKHN0ZCArIGRzdCkgb2Zmc2V0cy5cblx0ICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cblx0ICpcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHpvbmUgbmFtZVxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gaW5jbHVkZVxuXHQgKi9cblx0cHVibGljIGdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyKTogVHJhbnNpdGlvbltdIHtcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xuXG5cdFx0Y29uc3Qgc3RhcnRNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh7IHllYXI6IGZyb21ZZWFyIH0pO1xuXHRcdGNvbnN0IGVuZE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHsgeWVhcjogdG9ZZWFyICsgMSB9KTtcblxuXG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdGFzc2VydCh6b25lSW5mb3MubGVuZ3RoID4gMCwgXCJFbXB0eSB6b25lSW5mb3MgYXJyYXkgcmV0dXJuZWQgZnJvbSBnZXRab25lSW5mb3MoKVwiKTtcblxuXHRcdGNvbnN0IHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XG5cblx0XHRsZXQgcHJldlpvbmU6IFpvbmVJbmZvIHwgdW5kZWZpbmVkO1xuXHRcdGxldCBwcmV2VW50aWxZZWFyOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHByZXZTdGRPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0bGV0IHByZXZEc3RPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XG5cdFx0bGV0IHByZXZMZXR0ZXI6IHN0cmluZyA9IFwiXCI7XG5cdFx0Zm9yIChjb25zdCB6b25lSW5mbyBvZiB6b25lSW5mb3MpIHtcblx0XHRcdGNvbnN0IHVudGlsWWVhcjogbnVtYmVyID0gem9uZUluZm8udW50aWwgIT09IHVuZGVmaW5lZCA/IG5ldyBUaW1lU3RydWN0KHpvbmVJbmZvLnVudGlsKS5jb21wb25lbnRzLnllYXIgOiB0b1llYXIgKyAxO1xuXHRcdFx0bGV0IHN0ZE9mZnNldDogRHVyYXRpb24gPSBwcmV2U3RkT2Zmc2V0O1xuXHRcdFx0bGV0IGRzdE9mZnNldDogRHVyYXRpb24gPSBwcmV2RHN0T2Zmc2V0O1xuXHRcdFx0bGV0IGxldHRlcjogc3RyaW5nID0gcHJldkxldHRlcjtcblxuXHRcdFx0Ly8gem9uZSBhcHBsaWNhYmxlP1xuXHRcdFx0aWYgKCghcHJldlpvbmUgfHwgcHJldlpvbmUudW50aWwhIDwgZW5kTWlsbGlzIC0gMSkgJiYgKHpvbmVJbmZvLnVudGlsID09PSB1bmRlZmluZWQgfHwgem9uZUluZm8udW50aWwgPj0gc3RhcnRNaWxsaXMpKSB7XG5cblx0XHRcdFx0c3RkT2Zmc2V0ID0gem9uZUluZm8uZ210b2ZmO1xuXG5cdFx0XHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk5vbmU6XG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBEdXJhdGlvbi5ob3VycygwKTtcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk9mZnNldDpcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcblx0XHRcdFx0XHRcdC8vIGNoZWNrIHdoZXRoZXIgdGhlIGZpcnN0IHJ1bGUgdGFrZXMgZWZmZWN0IGltbWVkaWF0ZWx5IG9uIHRoZSB6b25lIHRyYW5zaXRpb25cblx0XHRcdFx0XHRcdC8vIChlLmcuIEx5YmlhKVxuXHRcdFx0XHRcdFx0aWYgKHByZXZab25lKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBydWxlSW5mbyBvZiBydWxlSW5mb3MpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHByZXZVbnRpbFllYXIgPT09IFwibnVtYmVyXCIgJiYgcnVsZUluZm8uYXBwbGljYWJsZShwcmV2VW50aWxZZWFyKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFllYXIsIHN0ZE9mZnNldCwgdW5kZWZpbmVkKSA9PT0gcHJldlpvbmUudW50aWwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gcnVsZUluZm8uc2F2ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0dGVyID0gcnVsZUluZm8ubGV0dGVyO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBhZGQgYSB0cmFuc2l0aW9uIGZvciB0aGUgem9uZSB0cmFuc2l0aW9uXG5cdFx0XHRcdGNvbnN0IGF0OiBudW1iZXIgPSAocHJldlpvbmUgJiYgcHJldlpvbmUudW50aWwgIT09IHVuZGVmaW5lZCA/IHByZXZab25lLnVudGlsIDogc3RhcnRNaWxsaXMpO1xuXHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihhdCwgc3RkT2Zmc2V0LmFkZChkc3RPZmZzZXQpLCBsZXR0ZXIpKTtcblxuXHRcdFx0XHQvLyBhZGQgdHJhbnNpdGlvbnMgZm9yIHRoZSB6b25lIHJ1bGVzIGluIHRoZSByYW5nZVxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lKSB7XG5cdFx0XHRcdFx0Y29uc3QgZHN0VHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKFxuXHRcdFx0XHRcdFx0em9uZUluZm8ucnVsZU5hbWUsXG5cdFx0XHRcdFx0XHRwcmV2VW50aWxZZWFyICE9PSB1bmRlZmluZWQgPyBNYXRoLm1heChwcmV2VW50aWxZZWFyLCBmcm9tWWVhcikgOiBmcm9tWWVhcixcblx0XHRcdFx0XHRcdE1hdGgubWluKHVudGlsWWVhciwgdG9ZZWFyKSxcblx0XHRcdFx0XHRcdHN0ZE9mZnNldFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCB0cmFuc2l0aW9uIG9mIGRzdFRyYW5zaXRpb25zKSB7XG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0O1xuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHByZXZab25lID0gem9uZUluZm87XG5cdFx0XHRwcmV2VW50aWxZZWFyID0gdW50aWxZZWFyO1xuXHRcdFx0cHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcblx0XHRcdHByZXZEc3RPZmZzZXQgPSBkc3RPZmZzZXQ7XG5cdFx0XHRwcmV2TGV0dGVyID0gbGV0dGVyO1xuXHRcdH1cblxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXG5cdCAqIEBwYXJhbSB1dGNUaW1lXHRVVEMgdGltZSBzdGFtcCBhcyB1bml4IG1pbGxpc2Vjb25kcyBvciBhcyBhIFRpbWVTdHJ1Y3Rcblx0ICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0Wm9uZUluZm8oem9uZU5hbWU6IHN0cmluZywgdXRjVGltZTogVGltZVN0cnVjdCB8IG51bWJlcik6IFpvbmVJbmZvIHtcblx0XHRjb25zdCB1bml4TWlsbGlzID0gKHR5cGVvZiB1dGNUaW1lID09PSBcIm51bWJlclwiID8gdXRjVGltZSA6IHV0Y1RpbWUudW5peE1pbGxpcyk7XG5cdFx0Y29uc3Qgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xuXHRcdGZvciAoY29uc3Qgem9uZUluZm8gb2Ygem9uZUluZm9zKSB7XG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IHVuZGVmaW5lZCB8fCB6b25lSW5mby51bnRpbCA+IHVuaXhNaWxsaXMpIHtcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdGlmICh0cnVlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiB6b25lIGluZm8gY2FjaGVcblx0ICovXG5cdHByaXZhdGUgX3pvbmVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBab25lSW5mb1tdIH0gPSB7fTtcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSB6b25lIHJlY29yZHMgZm9yIGEgZ2l2ZW4gem9uZSBuYW1lLCBhZnRlclxuXHQgKiBmb2xsb3dpbmcgYW55IGxpbmtzLlxuXHQgKlxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcblx0ICogQHJldHVybiBBcnJheSBvZiB6b25lIGluZm9zLiBEbyBub3QgY2hhbmdlLCB0aGlzIGlzIGEgY2FjaGVkIHZhbHVlLlxuXHQgKi9cblx0cHVibGljIGdldFpvbmVJbmZvcyh6b25lTmFtZTogc3RyaW5nKTogWm9uZUluZm9bXSB7XG5cdFx0Ly8gRklSU1QgdmFsaWRhdGUgem9uZSBuYW1lIGJlZm9yZSBzZWFyY2hpbmcgY2FjaGVcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVGFrZSBmcm9tIGNhY2hlXG5cdFx0aWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV07XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzdWx0OiBab25lSW5mb1tdID0gW107XG5cdFx0bGV0IGFjdHVhbFpvbmVOYW1lOiBzdHJpbmcgPSB6b25lTmFtZTtcblx0XHRsZXQgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xuXHRcdC8vIGZvbGxvdyBsaW5rc1xuXHRcdHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcblx0XHR9XG5cdFx0Ly8gZmluYWwgem9uZSBpbmZvIGZvdW5kXG5cdFx0Zm9yIChjb25zdCB6b25lRW50cnkgb2Ygem9uZUVudHJpZXMpIHtcblx0XHRcdGNvbnN0IHJ1bGVUeXBlOiBSdWxlVHlwZSA9IHRoaXMucGFyc2VSdWxlVHlwZSh6b25lRW50cnlbMV0pO1xuXHRcdFx0bGV0IHVudGlsOiBudW1iZXIgfCB1bmRlZmluZWQgPSBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVszXSk7XG5cdFx0XHRpZiAoaXNOYU4odW50aWwpKSB7XG5cdFx0XHRcdHVudGlsID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXN1bHQucHVzaChuZXcgWm9uZUluZm8oXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLFxuXHRcdFx0XHRydWxlVHlwZSxcblx0XHRcdFx0cnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCA/IG5ldyBEdXJhdGlvbih6b25lRW50cnlbMV0pIDogbmV3IER1cmF0aW9uKCksXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsXG5cdFx0XHRcdHpvbmVFbnRyeVsyXSxcblx0XHRcdFx0dW50aWxcblx0XHRcdCkpO1xuXHRcdH1cblxuXHRcdHJlc3VsdC5zb3J0KChhOiBab25lSW5mbywgYjogWm9uZUluZm8pOiBudW1iZXIgPT4ge1xuXHRcdFx0Ly8gc29ydCB1bmRlZmluZWQgbGFzdFxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRpZiAoYS51bnRpbCA9PT0gdW5kZWZpbmVkICYmIGIudW50aWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdGlmIChhLnVudGlsICE9PSB1bmRlZmluZWQgJiYgYi51bnRpbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH1cblx0XHRcdGlmIChhLnVudGlsID09PSB1bmRlZmluZWQgJiYgYi51bnRpbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIChhLnVudGlsISAtIGIudW50aWwhKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdID0gcmVzdWx0O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxuXHQgKi9cblx0cHJpdmF0ZSBfcnVsZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFJ1bGVJbmZvW10gfSA9IHt9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBydWxlIHNldCB3aXRoIHRoZSBnaXZlbiBydWxlIG5hbWUsXG5cdCAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxuXHQgKlxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgcnVsZSBzZXRcblx0ICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBnZXRSdWxlSW5mb3MocnVsZU5hbWU6IHN0cmluZyk6IFJ1bGVJbmZvW10ge1xuXHRcdC8vIHZhbGlkYXRlIG5hbWUgQkVGT1JFIHNlYXJjaGluZyBjYWNoZVxuXHRcdGlmICghdGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgc2V0IFxcXCJcIiArIHJ1bGVOYW1lICsgXCJcXFwiIG5vdCBmb3VuZC5cIik7XG5cdFx0fVxuXG5cdFx0Ly8gcmV0dXJuIGZyb20gY2FjaGVcblx0XHRpZiAodGhpcy5fcnVsZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcblx0XHRcdHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcblx0XHR9XG5cblx0XHRjb25zdCByZXN1bHQ6IFJ1bGVJbmZvW10gPSBbXTtcblx0XHRjb25zdCBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XG5cdFx0Zm9yIChjb25zdCBydWxlIG9mIHJ1bGVTZXQpIHtcblxuXHRcdFx0Y29uc3QgZnJvbVllYXI6IG51bWJlciA9IChydWxlWzBdID09PSBcIk5hTlwiID8gLTEwMDAwIDogcGFyc2VJbnQocnVsZVswXSwgMTApKTtcblx0XHRcdGNvbnN0IHRvVHlwZTogVG9UeXBlID0gdGhpcy5wYXJzZVRvVHlwZShydWxlWzFdKTtcblx0XHRcdGNvbnN0IHRvWWVhcjogbnVtYmVyID0gKHRvVHlwZSA9PT0gVG9UeXBlLk1heCA/IDAgOiAocnVsZVsxXSA9PT0gXCJvbmx5XCIgPyBmcm9tWWVhciA6IHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpO1xuXHRcdFx0Y29uc3Qgb25UeXBlOiBPblR5cGUgPSB0aGlzLnBhcnNlT25UeXBlKHJ1bGVbNF0pO1xuXHRcdFx0Y29uc3Qgb25EYXk6IG51bWJlciA9IHRoaXMucGFyc2VPbkRheShydWxlWzRdLCBvblR5cGUpO1xuXHRcdFx0Y29uc3Qgb25XZWVrRGF5OiBXZWVrRGF5ID0gdGhpcy5wYXJzZU9uV2Vla0RheShydWxlWzRdKTtcblx0XHRcdGNvbnN0IG1vbnRoTmFtZTogc3RyaW5nID0gcnVsZVszXSBhcyBzdHJpbmc7XG5cdFx0XHRjb25zdCBtb250aE51bWJlcjogbnVtYmVyID0gbW9udGhOYW1lVG9TdHJpbmcobW9udGhOYW1lKTtcblxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFJ1bGVJbmZvKFxuXHRcdFx0XHRmcm9tWWVhcixcblx0XHRcdFx0dG9UeXBlLFxuXHRcdFx0XHR0b1llYXIsXG5cdFx0XHRcdHJ1bGVbMl0sXG5cdFx0XHRcdG1vbnRoTnVtYmVyLFxuXHRcdFx0XHRvblR5cGUsXG5cdFx0XHRcdG9uRGF5LFxuXHRcdFx0XHRvbldlZWtEYXksXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLFxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMl0sIDEwKSwgNjApLFxuXHRcdFx0XHR0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLFxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksXG5cdFx0XHRcdHJ1bGVbN10gPT09IFwiLVwiID8gXCJcIiA6IHJ1bGVbN11cblx0XHRcdFx0KSk7XG5cblx0XHR9XG5cblx0XHRyZXN1bHQuc29ydCgoYTogUnVsZUluZm8sIGI6IFJ1bGVJbmZvKTogbnVtYmVyID0+IHtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0aWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHR9IGVsc2UgaWYgKGEuZWZmZWN0aXZlTGVzcyhiKSkge1xuXHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdID0gcmVzdWx0O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgdGhlIFJVTEVTIGNvbHVtbiBvZiBhIHpvbmUgaW5mbyBlbnRyeVxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZVJ1bGVUeXBlKHJ1bGU6IHN0cmluZyk6IFJ1bGVUeXBlIHtcblx0XHRpZiAocnVsZSA9PT0gXCItXCIpIHtcblx0XHRcdHJldHVybiBSdWxlVHlwZS5Ob25lO1xuXHRcdH0gZWxzZSBpZiAoaXNWYWxpZE9mZnNldFN0cmluZyhydWxlKSkge1xuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLlJ1bGVOYW1lO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XG5cdCAqIGFuZCBzZWUgd2hhdCBraW5kIG9mIGVudHJ5IGl0IGlzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlVG9UeXBlKHRvOiBzdHJpbmcpOiBUb1R5cGUge1xuXHRcdGlmICh0byA9PT0gXCJtYXhcIikge1xuXHRcdFx0cmV0dXJuIFRvVHlwZS5NYXg7XG5cdFx0fSBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjsgLy8geWVzIHdlIHJldHVybiBZZWFyIGZvciBvbmx5XG5cdFx0fSBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVE8gY29sdW1uIGluY29ycmVjdDogXCIgKyB0byk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VPblR5cGUob246IHN0cmluZyk6IE9uVHlwZSB7XG5cdFx0aWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xuXHRcdFx0cmV0dXJuIE9uVHlwZS5MYXN0WDtcblx0XHR9XG5cdFx0aWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcblx0XHRcdHJldHVybiBPblR5cGUuTGVxWDtcblx0XHR9XG5cdFx0aWYgKG9uLmluZGV4T2YoXCI+PVwiKSAhPT0gLTEpIHtcblx0XHRcdHJldHVybiBPblR5cGUuR3JlcVg7XG5cdFx0fVxuXHRcdHJldHVybiBPblR5cGUuRGF5TnVtO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZGF5IG51bWJlciBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIDAgaWYgbm8gZGF5LlxuXHQgKi9cblx0cHVibGljIHBhcnNlT25EYXkob246IHN0cmluZywgb25UeXBlOiBPblR5cGUpOiBudW1iZXIge1xuXHRcdHN3aXRjaCAob25UeXBlKSB7XG5cdFx0XHRjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xuXHRcdFx0Y2FzZSBPblR5cGUuR3JlcVg6IHJldHVybiBwYXJzZUludChvbi5zdWJzdHIob24uaW5kZXhPZihcIj49XCIpICsgMiksIDEwKTtcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblx0XHRcdFx0aWYgKHRydWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGRheS1vZi13ZWVrIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgU3VuZGF5IGlmIG5vdCBwcmVzZW50LlxuXHQgKi9cblx0cHVibGljIHBhcnNlT25XZWVrRGF5KG9uOiBzdHJpbmcpOiBXZWVrRGF5IHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xuXHRcdFx0aWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XG5cdFx0XHRcdHJldHVybiBpIGFzIFdlZWtEYXk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cdFx0aWYgKHRydWUpIHtcblx0XHRcdHJldHVybiBXZWVrRGF5LlN1bmRheTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgdGhlIEFUIGNvbHVtbiBvZiBhIHJ1bGUgaW5mbyBlbnRyeVxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZUF0VHlwZShhdDogYW55KTogQXRUeXBlIHtcblx0XHRzd2l0Y2ggKGF0KSB7XG5cdFx0XHRjYXNlIFwic1wiOiByZXR1cm4gQXRUeXBlLlN0YW5kYXJkO1xuXHRcdFx0Y2FzZSBcInVcIjogcmV0dXJuIEF0VHlwZS5VdGM7XG5cdFx0XHRjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0Yztcblx0XHRcdGNhc2UgXCJ6XCI6IHJldHVybiBBdFR5cGUuVXRjO1xuXHRcdFx0Y2FzZSBcIndcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xuXHRcdFx0Y2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBBdFR5cGUuV2FsbDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXHRcdFx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0XHRcdHJldHVybiBBdFR5cGUuV2FsbDtcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXG59XG5cbmludGVyZmFjZSBNaW5NYXhJbmZvIHtcblx0bWluRHN0U2F2ZTogbnVtYmVyO1xuXHRtYXhEc3RTYXZlOiBudW1iZXI7XG5cdG1pbkdtdE9mZjogbnVtYmVyO1xuXHRtYXhHbXRPZmY6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTYW5pdHkgY2hlY2sgb24gZGF0YS4gUmV0dXJucyBtaW4vbWF4IHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVEYXRhKGRhdGE6IGFueSk6IE1pbk1heEluZm8ge1xuXHRjb25zdCByZXN1bHQ6IFBhcnRpYWw8TWluTWF4SW5mbz4gPSB7fTtcblxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaXMgbm90IGFuIG9iamVjdFwiKTtcblx0fVxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwicnVsZXNcIikpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyBydWxlcyBwcm9wZXJ0eVwiKTtcblx0fVxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIikpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyB6b25lcyBwcm9wZXJ0eVwiKTtcblx0fVxuXG5cdC8vIHZhbGlkYXRlIHpvbmVzXG5cdGZvciAoY29uc3Qgem9uZU5hbWUgaW4gZGF0YS56b25lcykge1xuXHRcdGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xuXHRcdFx0Y29uc3Qgem9uZUFycjogYW55ID0gZGF0YS56b25lc1t6b25lTmFtZV07XG5cdFx0XHRpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHQvLyBvaywgaXMgbGluayB0byBvdGhlciB6b25lLCBjaGVjayBsaW5rXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUFyciBhcyBzdHJpbmcpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgem9uZUFyciBhcyBzdHJpbmcgKyBcIlxcXCIgYnV0IHRoYXQgZG9lc25cXCd0IGV4aXN0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gYXJyYXlcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB6b25lQXJyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0Y29uc3QgZW50cnk6IGFueSA9IHpvbmVBcnJbaV07XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5vdCBhbiBhcnJheVwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKGVudHJ5Lmxlbmd0aCAhPT0gNCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGdtdG9mZiA9IG1hdGguZmlsdGVyRmxvYXQoZW50cnlbMF0pO1xuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdGlmIChpc05hTihnbXRvZmYpKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMV0gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHRoaXJkIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gIT09IFwic3RyaW5nXCIgJiYgZW50cnlbM10gIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGlzIG5vdCBhIHN0cmluZyBub3IgbnVsbFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSA9PT0gXCJzdHJpbmdcIiAmJiBpc05hTihtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzNdKSkpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWF4R210T2ZmID09PSB1bmRlZmluZWQgfHwgZ210b2ZmID4gcmVzdWx0Lm1heEdtdE9mZikge1xuXHRcdFx0XHRcdFx0cmVzdWx0Lm1heEdtdE9mZiA9IGdtdG9mZjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IHVuZGVmaW5lZCB8fCBnbXRvZmYgPCByZXN1bHQubWluR210T2ZmKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIHZhbGlkYXRlIHJ1bGVzXG5cdGZvciAoY29uc3QgcnVsZU5hbWUgaW4gZGF0YS5ydWxlcykge1xuXHRcdGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xuXHRcdFx0Y29uc3QgcnVsZUFycjogYW55ID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlQXJyKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgcnVsZSA9IHJ1bGVBcnJbaV07XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlLmxlbmd0aCA8IDgpIHsgLy8gbm90ZSBzb21lIHJ1bGVzID4gOCBleGlzdHMgYnV0IHRoYXQgc2VlbXMgdG8gYmUgYSBidWcgaW4gdHogZmlsZSBwYXJzaW5nXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBydWxlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdFx0aWYgKGogIT09IDUgJiYgdHlwZW9mIHJ1bGVbal0gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bXCIgKyBqLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYSBzdHJpbmdcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAocnVsZVswXSAhPT0gXCJOYU5cIiAmJiBpc05hTihwYXJzZUludChydWxlWzBdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVswXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlWzFdICE9PSBcIm9ubHlcIiAmJiBydWxlWzFdICE9PSBcIm1heFwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMV0sIDEwKSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVszXSBpcyBub3QgYSBtb250aCBuYW1lXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAocnVsZVs0XS5zdWJzdHIoMCwgNCkgIT09IFwibGFzdFwiICYmIHJ1bGVbNF0uaW5kZXhPZihcIj49XCIpID09PSAtMVxuXHRcdFx0XHRcdCYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNF0gaXMgbm90IGEga25vd24gdHlwZSBvZiBleHByZXNzaW9uXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZVs1XSkpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3Qgb2YgbGVuZ3RoIDRcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzBdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVswXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzFdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsyXSBpcyBub3QgYSBudW1iZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXG5cdFx0XHRcdGlmIChydWxlWzVdWzNdICE9PSBcIlwiICYmIHJ1bGVbNV1bM10gIT09IFwic1wiICYmIHJ1bGVbNV1bM10gIT09IFwid1wiXG5cdFx0XHRcdFx0JiYgcnVsZVs1XVszXSAhPT0gXCJnXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ1XCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ6XCIgJiYgcnVsZVs1XVszXSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgc2F2ZTogbnVtYmVyID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cblx0XHRcdFx0aWYgKGlzTmFOKHNhdmUpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzYXZlICE9PSAwKSB7XG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5tYXhEc3RTYXZlID09PSB1bmRlZmluZWQgfHwgc2F2ZSA+IHJlc3VsdC5tYXhEc3RTYXZlKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWluRHN0U2F2ZSA9PT0gdW5kZWZpbmVkIHx8IHNhdmUgPCByZXN1bHQubWluRHN0U2F2ZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQgYXMgTWluTWF4SW5mbztcbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0KGMpIDIwMTQgQUJCIFN3aXR6ZXJsYW5kIEx0ZC5cbiAqXG4gKiBEYXRlIGFuZCBUaW1lIHV0aWxpdHkgZnVuY3Rpb25zIC0gbWFpbiBpbmRleFxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9iYXNpY3NcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2RhdGV0aW1lXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9kdXJhdGlvblwiO1xuZXhwb3J0ICogZnJvbSBcIi4vZm9ybWF0XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9nbG9iYWxzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9qYXZhc2NyaXB0XCI7XG5leHBvcnQgKiBmcm9tIFwiLi9sb2NhbGVcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3BhcnNlXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9wZXJpb2RcIjtcbmV4cG9ydCAqIGZyb20gXCIuL2Jhc2ljc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vdGltZXNvdXJjZVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vdGltZXpvbmVcIjtcbmV4cG9ydCAqIGZyb20gXCIuL3R6LWRhdGFiYXNlXCI7XG4iXX0=
