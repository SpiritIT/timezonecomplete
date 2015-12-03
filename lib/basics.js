/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;
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
    assert(month >= 1 && month <= 12, "Month out of range");
    assert(day >= 1 && day <= daysInMonth(year, month), "day out of range");
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
    var endOfMonth = new TimeStruct(year, month, daysInMonth(year, month));
    var endOfMonthMillis = timeToUnixNoLeapSecs(endOfMonth);
    var endOfMonthWeekDay = weekDayNoLeapSecs(endOfMonthMillis);
    var diff = weekDay - endOfMonthWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    return endOfMonth.day + diff;
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
    var beginOfMonth = new TimeStruct(year, month, 1);
    var beginOfMonthMillis = timeToUnixNoLeapSecs(beginOfMonth);
    var beginOfMonthWeekDay = weekDayNoLeapSecs(beginOfMonthMillis);
    var diff = weekDay - beginOfMonthWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    return beginOfMonth.day + diff;
}
exports.firstWeekDayOfMonth = firstWeekDayOfMonth;
/**
 * Returns the day-of-month that is on the given weekday and which is >= the given day.
 * Throws if the month has no such day.
 */
function weekDayOnOrAfter(year, month, day, weekDay) {
    var start = new TimeStruct(year, month, day);
    var startMillis = timeToUnixNoLeapSecs(start);
    var startWeekDay = weekDayNoLeapSecs(startMillis);
    var diff = weekDay - startWeekDay;
    if (diff < 0) {
        diff += 7;
    }
    assert(start.day + diff <= daysInMonth(year, month), "The given month has no such weekday");
    return start.day + diff;
}
exports.weekDayOnOrAfter = weekDayOnOrAfter;
/**
 * Returns the day-of-month that is on the given weekday and which is <= the given day.
 * Throws if the month has no such day.
 */
function weekDayOnOrBefore(year, month, day, weekDay) {
    var start = new TimeStruct(year, month, day);
    var startMillis = timeToUnixNoLeapSecs(start);
    var startWeekDay = weekDayNoLeapSecs(startMillis);
    var diff = weekDay - startWeekDay;
    if (diff > 0) {
        diff -= 7;
    }
    assert(start.day + diff >= 1, "The given month has no such weekday");
    return start.day + diff;
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
    assert(typeof (unixMillis) === "number", "number input expected");
    assert(!isNaN(unixMillis), "NaN not expected as input");
    assert(math.isInt(unixMillis), "Expect integer number for unix UTC timestamp");
}
/**
 * Convert a unix milli timestamp into a TimeT structure.
 * This does NOT take leap seconds into account.
 */
function unixToTimeNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);
    var temp = unixMillis;
    var result = new TimeStruct();
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
function timeToUnixNoLeapSecs(a, month, day, hour, minute, second, milli) {
    if (a === void 0) { a = 1970; }
    if (month === void 0) { month = 1; }
    if (day === void 0) { day = 1; }
    if (hour === void 0) { hour = 0; }
    if (minute === void 0) { minute = 0; }
    if (second === void 0) { second = 0; }
    if (milli === void 0) { milli = 0; }
    assert(typeof (a) === "object" || typeof (a) === "number", "Please give either a TimeStruct or a number as first argument.");
    if (typeof (a) === "object") {
        var tm = a;
        assert(tm.validate(), "tm invalid");
        return timeToUnixNoLeapSecs(tm.year, tm.month, tm.day, tm.hour, tm.minute, tm.second, tm.milli);
    }
    else {
        var year = a;
        assert(month >= 1 && month <= 12, "Month out of range");
        assert(day >= 1 && day <= daysInMonth(year, month), "day out of range");
        assert(hour >= 0 && hour <= 23, "hour out of range");
        assert(minute >= 0 && minute <= 59, "minute out of range");
        assert(second >= 0 && second <= 59, "second out of range");
        assert(milli >= 0 && milli <= 999, "milli out of range");
        return milli + 1000 * (second + minute * 60 + hour * 3600 + dayOfYear(year, month, day) * 86400 +
            (year - 1970) * 31536000 + Math.floor((year - 1969) / 4) * 86400 -
            Math.floor((year - 1901) / 100) * 86400 + Math.floor((year - 1900 + 299) / 400) * 86400);
    }
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
     * Constructor
     *
     * @param year	Year e.g. 1970
     * @param month	Month 1-12
     * @param day	Day 1-31
     * @param hour	Hour 0-23
     * @param minute	Minute 0-59
     * @param second	Second 0-59 (no leap seconds)
     * @param milli	Millisecond 0-999
     */
    function TimeStruct(
        /**
         * Year, 1970-...
         */
        year, 
        /**
         * Month 1-12
         */
        month, 
        /**
         * Day of month, 1-31
         */
        day, 
        /**
         * Hour 0-23
         */
        hour, 
        /**
         * Minute 0-59
         */
        minute, 
        /**
         * Seconds, 0-59
         */
        second, 
        /**
         * Milliseconds 0-999
         */
        milli) {
        if (year === void 0) { year = 1970; }
        if (month === void 0) { month = 1; }
        if (day === void 0) { day = 1; }
        if (hour === void 0) { hour = 0; }
        if (minute === void 0) { minute = 0; }
        if (second === void 0) { second = 0; }
        if (milli === void 0) { milli = 0; }
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.milli = milli;
        assert(this.validate(), "Invalid arguments: " + this.toString());
    }
    /**
     * Create a TimeStruct from a number of unix milliseconds
     */
    TimeStruct.fromUnix = function (unixMillis) {
        return unixToTimeNoLeapSecs(unixMillis);
    };
    /**
     * Create a TimeStruct from a JavaScript date
     *
     * @param d	The date
     * @param df	Which functions to take (getX() or getUTCX())
     */
    TimeStruct.fromDate = function (d, df) {
        if (df === DateFunctions.Get) {
            return new TimeStruct(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
        }
        else {
            return new TimeStruct(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
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
            assert(split.length >= 1 && split.length <= 2, "Empty string or multiple dots.");
            // parse main part
            var isBasicFormat = (s.indexOf("-") === -1);
            if (isBasicFormat) {
                assert(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/), "ISO string in basic notation may only contain numbers before the fractional part");
                // remove any "T" separator
                split[0] = split[0].replace("T", "");
                assert([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
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
                assert(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Invalid ISO string");
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
                assert([4, 10].indexOf(dateAndTime[0].length) !== -1, "Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");
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
            var unixMillis = timeToUnixNoLeapSecs(year, month, day, hour, minute, second);
            unixMillis = math.roundSym(unixMillis + fractionMillis);
            return unixToTimeNoLeapSecs(unixMillis);
        }
        catch (e) {
            throw new Error("Invalid ISO 8601 string: \"" + s + "\": " + e.message);
        }
    };
    /**
     * Validate a TimeStruct, returns false if invalid.
     */
    TimeStruct.prototype.validate = function () {
        return (typeof (this.year) === "number" && !isNaN(this.year) && math.isInt(this.year) && this.year >= -10000 && this.year < 10000
            && typeof (this.month) === "number" && !isNaN(this.month) && math.isInt(this.month) && this.month >= 1 && this.month <= 12
            && typeof (this.day) === "number" && !isNaN(this.day) && math.isInt(this.day) && this.day >= 1
            && this.day <= daysInMonth(this.year, this.month)
            && typeof (this.hour) === "number" && !isNaN(this.hour) && math.isInt(this.hour) && this.hour >= 0 && this.hour <= 23
            && typeof (this.minute) === "number" && !isNaN(this.minute) && math.isInt(this.minute) && this.minute >= 0 && this.minute <= 59
            && typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 59
            && typeof (this.milli) === "number" && !isNaN(this.milli) && math.isInt(this.milli) && this.milli >= 0
            && this.milli <= 999);
    };
    /**
     * The day-of-year 0-365
     */
    TimeStruct.prototype.yearDay = function () {
        assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
        return dayOfYear(this.year, this.month, this.day);
    };
    /**
     * Returns this time as a unix millisecond timestamp
     * Does NOT take leap seconds into account.
     */
    TimeStruct.prototype.toUnixNoLeapSecs = function () {
        assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
        return timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };
    /**
     * Deep equals
     */
    TimeStruct.prototype.equals = function (other) {
        return (this.year === other.year
            && this.month === other.month
            && this.day === other.day
            && this.hour === other.hour
            && this.minute === other.minute
            && this.second === other.second
            && this.milli === other.milli);
    };
    /**
     * < operator
     */
    TimeStruct.prototype.lessThan = function (other) {
        return (this.toUnixNoLeapSecs() < other.toUnixNoLeapSecs());
    };
    TimeStruct.prototype.clone = function () {
        return new TimeStruct(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };
    TimeStruct.prototype.valueOf = function () {
        return timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
    };
    /**
     * ISO 8601 string YYYY-MM-DDThh:mm:ss.nnn
     */
    TimeStruct.prototype.toString = function () {
        return strings.padLeft(this.year.toString(10), 4, "0")
            + "-" + strings.padLeft(this.month.toString(10), 2, "0")
            + "-" + strings.padLeft(this.day.toString(10), 2, "0")
            + "T" + strings.padLeft(this.hour.toString(10), 2, "0")
            + ":" + strings.padLeft(this.minute.toString(10), 2, "0")
            + ":" + strings.padLeft(this.second.toString(10), 2, "0")
            + "." + strings.padLeft(this.milli.toString(10), 3, "0");
    };
    TimeStruct.prototype.inspect = function () {
        return "[TimeStruct: " + this.toString() + "]";
    };
    return TimeStruct;
})();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9iYXNpY3MudHMiXSwibmFtZXMiOlsiV2Vla0RheSIsIlRpbWVVbml0IiwidGltZVVuaXRUb01pbGxpc2Vjb25kcyIsInRpbWVVbml0VG9TdHJpbmciLCJzdHJpbmdUb1RpbWVVbml0IiwiaXNMZWFwWWVhciIsImRheXNJblllYXIiLCJkYXlzSW5Nb250aCIsImRheU9mWWVhciIsImxhc3RXZWVrRGF5T2ZNb250aCIsImZpcnN0V2Vla0RheU9mTW9udGgiLCJ3ZWVrRGF5T25PckFmdGVyIiwid2Vla0RheU9uT3JCZWZvcmUiLCJ3ZWVrT2ZNb250aCIsImdldFdlZWtPbmVEYXlPZlllYXIiLCJ3ZWVrTnVtYmVyIiwiYXNzZXJ0VW5peFRpbWVzdGFtcCIsInVuaXhUb1RpbWVOb0xlYXBTZWNzIiwidGltZVRvVW5peE5vTGVhcFNlY3MiLCJ3ZWVrRGF5Tm9MZWFwU2VjcyIsInNlY29uZE9mRGF5IiwiVGltZVN0cnVjdCIsIlRpbWVTdHJ1Y3QuY29uc3RydWN0b3IiLCJUaW1lU3RydWN0LmZyb21Vbml4IiwiVGltZVN0cnVjdC5mcm9tRGF0ZSIsIlRpbWVTdHJ1Y3QuZnJvbVN0cmluZyIsIlRpbWVTdHJ1Y3QudmFsaWRhdGUiLCJUaW1lU3RydWN0LnllYXJEYXkiLCJUaW1lU3RydWN0LnRvVW5peE5vTGVhcFNlY3MiLCJUaW1lU3RydWN0LmVxdWFscyIsIlRpbWVTdHJ1Y3QubGVzc1RoYW4iLCJUaW1lU3RydWN0LmNsb25lIiwiVGltZVN0cnVjdC52YWx1ZU9mIiwiVGltZVN0cnVjdC50b1N0cmluZyIsIlRpbWVTdHJ1Y3QuaW5zcGVjdCIsImJpbmFyeUluc2VydGlvbkluZGV4Il0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLElBQU8sYUFBYSxHQUFHLFVBQVUsQ0FB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QUVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ2pHQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNQQSxJQUFJQSxJQUFJQSxHQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFDOUJBLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLElBQUlBLEVBQUVBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFDeERBLE1BQU1BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLEVBQUVBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLEVBQUVBLEVBQUVBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLE1BQU1BLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLElBQUlBLE1BQU1BLElBQUlBLEVBQUVBLEVBQUVBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLE1BQU1BLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLElBQUlBLE1BQU1BLElBQUlBLEVBQUVBLEVBQUVBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLElBQUlBLEdBQUdBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFDekRBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLEdBQUdBLENBQ3JCQSxNQUFNQSxHQUFHQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxLQUFLQTtZQUN4RUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsUUFBUUEsR0FB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eERBLHdGQUF3RkEsQ0FBQ0EsQ0FBQ0E7Z0JBRTNGQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDMUJBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUMzQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDNUNBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLDJFQUEyRUE7b0JBQ3RIQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQTtnQkFDekJBLENBQUNBO2dCQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDM0JBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUMzQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxNQUFNQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDOUNBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBO2dCQUM1QkEsQ0FBQ0E7Z0JBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO29CQUMzQkEsTUFBTUEsR0FBR0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzlDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQTtnQkFDNUJBLENBQUNBO1lBQ0ZBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNQQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxxREFBcURBLENBQUNBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BHQSxJQUFJQSxXQUFXQSxHQUFhQSxFQUFFQSxDQUFDQTtnQkFDL0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUMzQkEsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxXQUFXQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0RBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDUEEsV0FBV0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzlCQSxDQUFDQTtnQkFDREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFDbkRBLHdGQUF3RkEsQ0FBQ0EsQ0FBQ0E7Z0JBRTNGQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDaENBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUNqREEsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FB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R0FBR0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7WUFDeERBLE1BQU1BLENBQUNBLG9CQUFvQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDekNBLENBQUVBO1FBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ1pBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLDZCQUE2QkEsR0FBR0EsQ0FBQ0EsR0FBR0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDekVBLENBQUNBO0lBQ0ZBLENBQUNBO0lBb0RESjs7T0FFR0E7SUFDSUEsNkJBQVFBLEdBQWZBO1FBQ0NLLE1BQU1BLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBO2VBQzdIQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxFQUFFQTtlQUN2SEEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7ZUFDM0ZBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO2VBQzlDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQTtlQUNsSEEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsRUFBRUE7ZUFDNUhBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLEVBQUVBO2VBQzVIQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxRQUFRQSxJ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QSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUMvR0EsQ0FBQ0E7SUFFRFg7O09BRUdBO0lBQ0lBLDZCQUFRQSxHQUFmQTtRQUNDWSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQTtjQUNuREEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0E7Y0FDdERBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBO2NBQ3BEQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQTtjQUNyREEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0E7Y0FDdkRBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBO2NBQ3ZEQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMzREEsQ0FBQ0E7SUFFTVosNEJBQU9BLEdBQWRBO1FBQ0NhLE1BQU1BLENBQUNBLGVBQWVBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEdBQUdBLENBQUNBO0lBQ2hEQSxDQUFDQTtJQUVGYixpQkFBQ0E7QUFBREEsQ0FyUkEsQUFxUkNBLElBQUE7QUFyUlksa0JBQVUsYUFxUnRCLENBQUE7QUFHRDs7Ozs7R0FLRztBQUNILDhCQUF3QyxHQUFRLEVBQUUsT0FBMEI7SUFDM0VjLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2pCQSxJQUFJQSxRQUFRQSxHQUFHQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5QkEsSUFBSUEsWUFBb0JBLENBQUNBO0lBQ3pCQSxJQUFJQSxjQUFpQkEsQ0FBQ0E7SUFDdEJBLHlCQUF5QkE7SUFDekJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ1ZBLENBQUNBO0lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3RCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNWQSxDQUFDQTtJQUNEQSxnQkFBZ0JBO0lBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDVkEsQ0FBQ0E7SUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDaENBLE1BQU1BLENBQUNBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUNEQSxtQkFBbUJBO0lBQ25CQSxPQUFPQSxRQUFRQSxJQUFJQSxRQUFRQSxFQUFFQSxDQUFDQTtRQUM3QkEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLGNBQWNBLEdBQUdBLEdBQUdBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBRW5DQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsUUFBUUEsR0FBR0EsWUFBWUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxRQUFRQSxHQUFHQSxZQUFZQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM3QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7UUFDckJBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBO0FBQ2pCQSxDQUFDQTtBQWxDZSw0QkFBb0IsdUJBa0NuQyxDQUFBIiwiZmlsZSI6ImxpYi9iYXNpY3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKi9cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5kLnRzXCIvPlxyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcclxuXHJcbmltcG9ydCBqYXZhc2NyaXB0ID0gcmVxdWlyZShcIi4vamF2YXNjcmlwdFwiKTtcclxuaW1wb3J0IERhdGVGdW5jdGlvbnMgPSBqYXZhc2NyaXB0LkRhdGVGdW5jdGlvbnM7XHJcblxyXG5pbXBvcnQgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcbmltcG9ydCBzdHJpbmdzID0gcmVxdWlyZShcIi4vc3RyaW5nc1wiKTtcclxuXHJcbi8qKlxyXG4gKiBEYXktb2Ytd2Vlay4gTm90ZSB0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0IGRheS1vZi13ZWVrOlxyXG4gKiBTdW5kYXkgPSAwLCBNb25kYXkgPSAxIGV0Y1xyXG4gKi9cclxuZXhwb3J0IGVudW0gV2Vla0RheSB7XHJcblx0U3VuZGF5LFxyXG5cdE1vbmRheSxcclxuXHRUdWVzZGF5LFxyXG5cdFdlZG5lc2RheSxcclxuXHRUaHVyc2RheSxcclxuXHRGcmlkYXksXHJcblx0U2F0dXJkYXlcclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgdW5pdHNcclxuICovXHJcbmV4cG9ydCBlbnVtIFRpbWVVbml0IHtcclxuXHRNaWxsaXNlY29uZCxcclxuXHRTZWNvbmQsXHJcblx0TWludXRlLFxyXG5cdEhvdXIsXHJcblx0RGF5LFxyXG5cdFdlZWssXHJcblx0TW9udGgsXHJcblx0WWVhcixcclxuXHQvKipcclxuXHQgKiBFbmQtb2YtZW51bSBtYXJrZXIsIGRvIG5vdCB1c2VcclxuXHQgKi9cclxuXHRNQVhcclxufVxyXG5cclxuLyoqXHJcbiAqIEFwcHJveGltYXRlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGEgdGltZSB1bml0LlxyXG4gKiBBIGRheSBpcyBhc3N1bWVkIHRvIGhhdmUgMjQgaG91cnMsIGEgbW9udGggaXMgYXNzdW1lZCB0byBlcXVhbCAzMCBkYXlzXHJcbiAqIGFuZCBhIHllYXIgaXMgc2V0IHRvIDM2MCBkYXlzIChiZWNhdXNlIDEyIG1vbnRocyBvZiAzMCBkYXlzKS5cclxuICpcclxuICogQHBhcmFtIHVuaXRcdFRpbWUgdW5pdCBlLmcuIFRpbWVVbml0Lk1vbnRoXHJcbiAqIEByZXR1cm5zXHRUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHVuaXQ6IFRpbWVVbml0KTogbnVtYmVyIHtcclxuXHRzd2l0Y2ggKHVuaXQpIHtcclxuXHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHJldHVybiAxO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHJldHVybiAxMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHJldHVybiA2MCAqIDEwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHJldHVybiA2MCAqIDYwICogMTAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuRGF5OiByZXR1cm4gODY0MDAwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHJldHVybiA3ICogODY0MDAwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiByZXR1cm4gMzAgKiA4NjQwMDAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuWWVhcjogcmV0dXJuIDEyICogMzAgKiA4NjQwMDAwMDtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdFwiKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgdW5pdCB0byBsb3dlcmNhc2Ugc3RyaW5nLiBJZiBhbW91bnQgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBzdHJpbmcgaXMgcHV0IGluIHBsdXJhbCBmb3JtXHJcbiAqIGlmIG5lY2Vzc2FyeS5cclxuICogQHBhcmFtIHVuaXQgVGhlIHVuaXRcclxuICogQHBhcmFtIGFtb3VudCBJZiB0aGlzIGlzIHVuZXF1YWwgdG8gLTEgYW5kIDEsIHRoZW4gdGhlIHJlc3VsdCBpcyBwbHVyYWxpemVkXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb1N0cmluZyh1bml0OiBUaW1lVW5pdCwgYW1vdW50OiBudW1iZXIgPSAxKTogc3RyaW5nIHtcclxuXHR2YXIgcmVzdWx0ID0gVGltZVVuaXRbdW5pdF0udG9Mb3dlckNhc2UoKTtcclxuXHRpZiAoYW1vdW50ID09PSAxIHx8IGFtb3VudCA9PT0gLTEpIHtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiByZXN1bHQgKyBcInNcIjtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb1RpbWVVbml0KHM6IHN0cmluZyk6IFRpbWVVbml0IHtcclxuXHR2YXIgdHJpbW1lZCA9IHMudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBUaW1lVW5pdC5NQVg7ICsraSkge1xyXG5cdFx0dmFyIG90aGVyID0gdGltZVVuaXRUb1N0cmluZyhpLCAxKTtcclxuXHRcdGlmIChvdGhlciA9PT0gdHJpbW1lZCB8fCAob3RoZXIgKyBcInNcIikgPT09IHRyaW1tZWQpIHtcclxuXHRcdFx0cmV0dXJuIGk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB1bml0IHN0cmluZyAnXCIgKyBzICsgXCInXCIpO1xyXG59XHJcblxyXG4vKipcclxuICogQHJldHVybiBUcnVlIGlmZiB0aGUgZ2l2ZW4geWVhciBpcyBhIGxlYXAgeWVhci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0xlYXBZZWFyKHllYXI6IG51bWJlcik6IGJvb2xlYW4ge1xyXG5cdC8vIGZyb20gV2lraXBlZGlhOlxyXG5cdC8vIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0IHRoZW4gY29tbW9uIHllYXJcclxuXHQvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSAxMDAgdGhlbiBsZWFwIHllYXJcclxuXHQvLyBlbHNlIGlmIHllYXIgaXMgbm90IGRpdmlzaWJsZSBieSA0MDAgdGhlbiBjb21tb24geWVhclxyXG5cdC8vIGVsc2UgbGVhcCB5ZWFyXHJcblx0aWYgKHllYXIgJSA0ICE9PSAwKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSBlbHNlIGlmICh5ZWFyICUgMTAwICE9PSAwKSB7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9IGVsc2UgaWYgKHllYXIgJSA0MDAgIT09IDApIHtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogVGhlIGRheXMgaW4gYSBnaXZlbiB5ZWFyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5c0luWWVhcih5ZWFyOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdFRoZSBtb250aCAxLTEyXHJcbiAqIEByZXR1cm4gVGhlIG51bWJlciBvZiBkYXlzIGluIHRoZSBnaXZlbiBtb250aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcik6IG51bWJlciB7XHJcblx0c3dpdGNoIChtb250aCkge1xyXG5cdFx0Y2FzZSAxOlxyXG5cdFx0Y2FzZSAzOlxyXG5cdFx0Y2FzZSA1OlxyXG5cdFx0Y2FzZSA3OlxyXG5cdFx0Y2FzZSA4OlxyXG5cdFx0Y2FzZSAxMDpcclxuXHRcdGNhc2UgMTI6XHJcblx0XHRcdHJldHVybiAzMTtcclxuXHRcdGNhc2UgMjpcclxuXHRcdFx0cmV0dXJuIChpc0xlYXBZZWFyKHllYXIpID8gMjkgOiAyOCk7XHJcblx0XHRjYXNlIDQ6XHJcblx0XHRjYXNlIDY6XHJcblx0XHRjYXNlIDk6XHJcblx0XHRjYXNlIDExOlxyXG5cdFx0XHRyZXR1cm4gMzA7XHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoOiBcIiArIG1vbnRoKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXkgb2YgdGhlIHllYXIgb2YgdGhlIGdpdmVuIGRhdGUgWzAuLjM2NV0uIEphbnVhcnkgZmlyc3QgaXMgMC5cclxuICpcclxuICogQHBhcmFtIHllYXJcdFRoZSB5ZWFyIGUuZy4gMTk4NlxyXG4gKiBAcGFyYW0gbW9udGggTW9udGggMS0xMlxyXG4gKiBAcGFyYW0gZGF5IERheSBvZiBtb250aCAxLTMxXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGF5T2ZZZWFyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdGFzc2VydChtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIk1vbnRoIG91dCBvZiByYW5nZVwiKTtcclxuXHRhc3NlcnQoZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdHZhciB5ZWFyRGF5OiBudW1iZXIgPSAwO1xyXG5cdGZvciAodmFyIGk6IG51bWJlciA9IDE7IGkgPCBtb250aDsgaSsrKSB7XHJcblx0XHR5ZWFyRGF5ICs9IGRheXNJbk1vbnRoKHllYXIsIGkpO1xyXG5cdH1cclxuXHR5ZWFyRGF5ICs9IChkYXkgLSAxKTtcclxuXHRyZXR1cm4geWVhckRheTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxyXG4gKlxyXG4gKiBAcmV0dXJuIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgdGhlIHdlZWsgZGF5IGluIHRoZSBtb250aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xyXG5cdHZhciBlbmRPZk1vbnRoOiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeWVhciwgbW9udGgsIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSk7XHJcblx0dmFyIGVuZE9mTW9udGhNaWxsaXMgPSB0aW1lVG9Vbml4Tm9MZWFwU2VjcyhlbmRPZk1vbnRoKTtcclxuXHR2YXIgZW5kT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhlbmRPZk1vbnRoTWlsbGlzKTtcclxuXHR2YXIgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIGVuZE9mTW9udGhXZWVrRGF5O1xyXG5cdGlmIChkaWZmID4gMCkge1xyXG5cdFx0ZGlmZiAtPSA3O1xyXG5cdH1cclxuXHRyZXR1cm4gZW5kT2ZNb250aC5kYXkgKyBkaWZmO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgdGhlIGdpdmVuIHdlZWtkYXkgaW4gdGhlIGdpdmVuIG1vbnRoXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGhcdHRoZSBtb250aCAxLTEyXHJcbiAqIEBwYXJhbSB3ZWVrRGF5XHR0aGUgZGVzaXJlZCB3ZWVrIGRheVxyXG4gKlxyXG4gKiBAcmV0dXJuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaXJzdFdlZWtEYXlPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XHJcblx0dmFyIGJlZ2luT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHllYXIsIG1vbnRoLCAxKTtcclxuXHR2YXIgYmVnaW5PZk1vbnRoTWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoYmVnaW5PZk1vbnRoKTtcclxuXHR2YXIgYmVnaW5PZk1vbnRoV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKGJlZ2luT2ZNb250aE1pbGxpcyk7XHJcblx0dmFyIGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBiZWdpbk9mTW9udGhXZWVrRGF5O1xyXG5cdGlmIChkaWZmIDwgMCkge1xyXG5cdFx0ZGlmZiArPSA3O1xyXG5cdH1cclxuXHRyZXR1cm4gYmVnaW5PZk1vbnRoLmRheSArIGRpZmY7XHJcbn1cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA+PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckFmdGVyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xyXG5cdHZhciBzdGFydDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHllYXIsIG1vbnRoLCBkYXkpO1xyXG5cdHZhciBzdGFydE1pbGxpczogbnVtYmVyID0gdGltZVRvVW5peE5vTGVhcFNlY3Moc3RhcnQpO1xyXG5cdHZhciBzdGFydFdlZWtEYXk6IFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhzdGFydE1pbGxpcyk7XHJcblx0dmFyIGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBzdGFydFdlZWtEYXk7XHJcblx0aWYgKGRpZmYgPCAwKSB7XHJcblx0XHRkaWZmICs9IDc7XHJcblx0fVxyXG5cdGFzc2VydChzdGFydC5kYXkgKyBkaWZmIDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuXHRyZXR1cm4gc3RhcnQuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGRheS1vZi1tb250aCB0aGF0IGlzIG9uIHRoZSBnaXZlbiB3ZWVrZGF5IGFuZCB3aGljaCBpcyA8PSB0aGUgZ2l2ZW4gZGF5LlxyXG4gKiBUaHJvd3MgaWYgdGhlIG1vbnRoIGhhcyBubyBzdWNoIGRheS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrRGF5T25PckJlZm9yZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHR2YXIgc3RhcnQ6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh5ZWFyLCBtb250aCwgZGF5KTtcclxuXHR2YXIgc3RhcnRNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHN0YXJ0KTtcclxuXHR2YXIgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnRNaWxsaXMpO1xyXG5cdHZhciBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG5cdGlmIChkaWZmID4gMCkge1xyXG5cdFx0ZGlmZiAtPSA3O1xyXG5cdH1cclxuXHRhc3NlcnQoc3RhcnQuZGF5ICsgZGlmZiA+PSAxLCBcIlRoZSBnaXZlbiBtb250aCBoYXMgbm8gc3VjaCB3ZWVrZGF5XCIpO1xyXG5cdHJldHVybiBzdGFydC5kYXkgKyBkaWZmO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcbiAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcbiAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyIFRoZSB5ZWFyXHJcbiAqIEBwYXJhbSBtb250aCBUaGUgbW9udGggWzEtMTJdXHJcbiAqIEBwYXJhbSBkYXkgVGhlIGRheSBbMS0zMV1cclxuICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtPZk1vbnRoKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdHZhciBmaXJzdFRodXJzZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5UaHVyc2RheSk7XHJcblx0dmFyIGZpcnN0TW9uZGF5ID0gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG5cdC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gd2VlayAxIG9yIGxhc3Qgd2VlayBvZiBwcmV2aW91cyBtb250aFxyXG5cdGlmIChkYXkgPCBmaXJzdE1vbmRheSkge1xyXG5cdFx0aWYgKGZpcnN0VGh1cnNkYXkgPCBmaXJzdE1vbmRheSkge1xyXG5cdFx0XHQvLyBXZWVrIDFcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBMYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuXHRcdFx0aWYgKG1vbnRoID4gMSkge1xyXG5cdFx0XHRcdC8vIERlZmF1bHQgY2FzZVxyXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyLCBtb250aCAtIDEsIDMxKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBKYW51YXJ5XHJcblx0XHRcdFx0cmV0dXJuIHdlZWtPZk1vbnRoKHllYXIgLSAxLCAxMiwgMzEpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR2YXIgbGFzdE1vbmRheSA9IGxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCBtb250aCwgV2Vla0RheS5Nb25kYXkpO1xyXG5cdHZhciBsYXN0VGh1cnNkYXkgPSBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xyXG5cdC8vIENvcm5lciBjYXNlOiBjaGVjayBpZiB3ZSBhcmUgaW4gbGFzdCB3ZWVrIG9yIHdlZWsgMSBvZiBwcmV2aW91cyBtb250aFxyXG5cdGlmIChkYXkgPj0gbGFzdE1vbmRheSkge1xyXG5cdFx0aWYgKGxhc3RNb25kYXkgPiBsYXN0VGh1cnNkYXkpIHtcclxuXHRcdFx0Ly8gV2VlayAxIG9mIG5leHQgbW9udGhcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBOb3JtYWwgY2FzZVxyXG5cdHZhciByZXN1bHQgPSBNYXRoLmZsb29yKChkYXkgLSBmaXJzdE1vbmRheSkgLyA3KSArIDE7XHJcblx0aWYgKGZpcnN0VGh1cnNkYXkgPCA0KSB7XHJcblx0XHRyZXN1bHQgKz0gMTtcclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YteWVhciBvZiB0aGUgTW9uZGF5IG9mIHdlZWsgMSBpbiB0aGUgZ2l2ZW4geWVhci5cclxuICogTm90ZSB0aGF0IHRoZSByZXN1bHQgbWF5IGxpZSBpbiB0aGUgcHJldmlvdXMgeWVhciwgaW4gd2hpY2ggY2FzZSBpdFxyXG4gKiB3aWxsIGJlIChtdWNoKSBncmVhdGVyIHRoYW4gNFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdC8vIGZpcnN0IG1vbmRheSBvZiBKYW51YXJ5LCBtaW51cyBvbmUgYmVjYXVzZSB3ZSB3YW50IGRheS1vZi15ZWFyXHJcblx0dmFyIHJlc3VsdDogbnVtYmVyID0gd2Vla0RheU9uT3JBZnRlcih5ZWFyLCAxLCAxLCBXZWVrRGF5Lk1vbmRheSkgLSAxO1xyXG5cdGlmIChyZXN1bHQgPiAzKSB7IC8vIGdyZWF0ZXIgdGhhbiBqYW4gNHRoXHJcblx0XHRyZXN1bHQgLT0gNztcclxuXHRcdGlmIChyZXN1bHQgPCAwKSB7XHJcblx0XHRcdHJlc3VsdCArPSBleHBvcnRzLmRheXNJblllYXIoeWVhciAtIDEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyIGZvciB0aGUgZ2l2ZW4gZGF0ZS4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcbiAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuICpcclxuICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTg4XHJcbiAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxyXG4gKiBAcGFyYW0gZGF5XHREYXkgb2YgbW9udGggMS0zMVxyXG4gKlxyXG4gKiBAcmV0dXJuIFdlZWsgbnVtYmVyIDEtNTNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrTnVtYmVyKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIpOiBudW1iZXIge1xyXG5cdHZhciBkb3kgPSBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSk7XHJcblxyXG5cdC8vIGNoZWNrIGVuZC1vZi15ZWFyIGNvcm5lciBjYXNlOiBtYXkgYmUgd2VlayAxIG9mIG5leHQgeWVhclxyXG5cdGlmIChkb3kgPj0gZGF5T2ZZZWFyKHllYXIsIDEyLCAyOSkpIHtcclxuXHRcdHZhciBuZXh0WWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIgKyAxKTtcclxuXHRcdGlmIChuZXh0WWVhcldlZWtPbmUgPiA0ICYmIG5leHRZZWFyV2Vla09uZSA8PSBkb3kpIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBjaGVjayBiZWdpbm5pbmctb2YteWVhciBjb3JuZXIgY2FzZVxyXG5cdHZhciB0aGlzWWVhcldlZWtPbmUgPSBnZXRXZWVrT25lRGF5T2ZZZWFyKHllYXIpO1xyXG5cdGlmICh0aGlzWWVhcldlZWtPbmUgPiA0KSB7XHJcblx0XHQvLyB3ZWVrIDEgaXMgYXQgZW5kIG9mIGxhc3QgeWVhclxyXG5cdFx0dmFyIHdlZWtUd28gPSB0aGlzWWVhcldlZWtPbmUgKyA3IC0gZGF5c0luWWVhcih5ZWFyIC0gMSk7XHJcblx0XHRpZiAoZG95IDwgd2Vla1R3bykge1xyXG5cdFx0XHRyZXR1cm4gMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKChkb3kgLSB3ZWVrVHdvKSAvIDcpICsgMjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFdlZWsgMSBpcyBlbnRpcmVseSBpbnNpZGUgdGhpcyB5ZWFyLlxyXG5cdGlmIChkb3kgPCB0aGlzWWVhcldlZWtPbmUpIHtcclxuXHRcdC8vIFRoZSBkYXRlIGlzIHBhcnQgb2YgdGhlIGxhc3Qgd2VlayBvZiBwcmV2IHllYXIuXHJcblx0XHRyZXR1cm4gd2Vla051bWJlcih5ZWFyIC0gMSwgMTIsIDMxKTtcclxuXHR9XHJcblxyXG5cdC8vIG5vcm1hbCBjYXNlczsgbm90ZSB0aGF0IHdlZWsgbnVtYmVycyBzdGFydCBmcm9tIDEgc28gKzFcclxuXHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gdGhpc1llYXJXZWVrT25lKSAvIDcpICsgMTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpczogbnVtYmVyKTogdm9pZCB7XHJcblx0YXNzZXJ0KHR5cGVvZiAodW5peE1pbGxpcykgPT09IFwibnVtYmVyXCIsIFwibnVtYmVyIGlucHV0IGV4cGVjdGVkXCIpO1xyXG5cdGFzc2VydCghaXNOYU4odW5peE1pbGxpcyksIFwiTmFOIG5vdCBleHBlY3RlZCBhcyBpbnB1dFwiKTtcclxuXHRhc3NlcnQobWF0aC5pc0ludCh1bml4TWlsbGlzKSwgXCJFeHBlY3QgaW50ZWdlciBudW1iZXIgZm9yIHVuaXggVVRDIHRpbWVzdGFtcFwiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgYSB1bml4IG1pbGxpIHRpbWVzdGFtcCBpbnRvIGEgVGltZVQgc3RydWN0dXJlLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcclxuXHRhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXMpO1xyXG5cclxuXHR2YXIgdGVtcDogbnVtYmVyID0gdW5peE1pbGxpcztcclxuXHR2YXIgcmVzdWx0OiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoKTtcclxuXHR2YXIgeWVhcjogbnVtYmVyO1xyXG5cdHZhciBtb250aDogbnVtYmVyO1xyXG5cclxuXHRpZiAodW5peE1pbGxpcyA+PSAwKSB7XHJcblx0XHRyZXN1bHQubWlsbGkgPSB0ZW1wICUgMTAwMDtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuXHRcdHJlc3VsdC5zZWNvbmQgPSB0ZW1wICUgNjA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IHRlbXAgJSA2MDtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcblx0XHRyZXN1bHQuaG91ciA9IHRlbXAgJSAyNDtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcblxyXG5cdFx0eWVhciA9IDE5NzA7XHJcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5ZZWFyKHllYXIpKSB7XHJcblx0XHRcdHRlbXAgLT0gZGF5c0luWWVhcih5ZWFyKTtcclxuXHRcdFx0eWVhcisrO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xyXG5cclxuXHRcdG1vbnRoID0gMTtcclxuXHRcdHdoaWxlICh0ZW1wID49IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSkge1xyXG5cdFx0XHR0ZW1wIC09IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuXHRcdFx0bW9udGgrKztcclxuXHRcdH1cclxuXHRcdHJlc3VsdC5tb250aCA9IG1vbnRoO1xyXG5cdFx0cmVzdWx0LmRheSA9IHRlbXAgKyAxO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBOb3RlIHRoYXQgYSBuZWdhdGl2ZSBudW1iZXIgbW9kdWxvIHNvbWV0aGluZyB5aWVsZHMgYSBuZWdhdGl2ZSBudW1iZXIuXHJcblx0XHQvLyBXZSBtYWtlIGl0IHBvc2l0aXZlIGJ5IGFkZGluZyB0aGUgbW9kdWxvLlxyXG5cdFx0cmVzdWx0Lm1pbGxpID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAxMDAwKTtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAxMDAwKTtcclxuXHRcdHJlc3VsdC5zZWNvbmQgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDYwKTtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyA2MCk7XHJcblx0XHRyZXN1bHQubWludXRlID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0LmhvdXIgPSBtYXRoLnBvc2l0aXZlTW9kdWxvKHRlbXAsIDI0KTtcclxuXHRcdHRlbXAgPSBNYXRoLmZsb29yKHRlbXAgLyAyNCk7XHJcblxyXG5cdFx0eWVhciA9IDE5Njk7XHJcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5ZZWFyKHllYXIpKSB7XHJcblx0XHRcdHRlbXAgKz0gZGF5c0luWWVhcih5ZWFyKTtcclxuXHRcdFx0eWVhci0tO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0LnllYXIgPSB5ZWFyO1xyXG5cclxuXHRcdG1vbnRoID0gMTI7XHJcblx0XHR3aGlsZSAodGVtcCA8IC1kYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuXHRcdFx0dGVtcCArPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0XHRcdG1vbnRoLS07XHJcblx0XHR9XHJcblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcclxuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMSArIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgeWVhciwgbW9udGgsIGRheSBldGMgaW50byBhIHVuaXggbWlsbGkgdGltZXN0YW1wLlxyXG4gKiBUaGlzIGRvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuICpcclxuICogQHBhcmFtIHllYXJcdFllYXIgZS5nLiAxOTcwXHJcbiAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxyXG4gKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxyXG4gKiBAcGFyYW0gaG91clx0SG91ciAwLTIzXHJcbiAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XHJcbiAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXHJcbiAqIEBwYXJhbSBtaWxsaVx0TWlsbGlzZWNvbmQgMC05OTlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lVG9Vbml4Tm9MZWFwU2VjcyhcclxuXHR5ZWFyPzogbnVtYmVyLCBtb250aD86IG51bWJlciwgZGF5PzogbnVtYmVyLFxyXG5cdGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaT86IG51bWJlcik6IG51bWJlcjtcclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgVGltZVQgc3RydWN0dXJlIGludG8gYSB1bml4IG1pbGxpIHRpbWVzdGFtcC5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3ModG06IFRpbWVTdHJ1Y3QpOiBudW1iZXI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXHJcblx0YTogYW55ID0gMTk3MCwgbW9udGg6IG51bWJlciA9IDEsIGRheTogbnVtYmVyID0gMSxcclxuXHRob3VyOiBudW1iZXIgPSAwLCBtaW51dGU6IG51bWJlciA9IDAsIHNlY29uZDogbnVtYmVyID0gMCwgbWlsbGk6IG51bWJlciA9IDApOiBudW1iZXIge1xyXG5cdGFzc2VydCh0eXBlb2YgKGEpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiAoYSkgPT09IFwibnVtYmVyXCIsIFwiUGxlYXNlIGdpdmUgZWl0aGVyIGEgVGltZVN0cnVjdCBvciBhIG51bWJlciBhcyBmaXJzdCBhcmd1bWVudC5cIik7XHJcblxyXG5cdGlmICh0eXBlb2YgKGEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHR2YXIgdG06IFRpbWVTdHJ1Y3QgPSA8VGltZVN0cnVjdD5hO1xyXG5cdFx0YXNzZXJ0KHRtLnZhbGlkYXRlKCksIFwidG0gaW52YWxpZFwiKTtcclxuXHRcdHJldHVybiB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0bS55ZWFyLCB0bS5tb250aCwgdG0uZGF5LCB0bS5ob3VyLCB0bS5taW51dGUsIHRtLnNlY29uZCwgdG0ubWlsbGkpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHR2YXIgeWVhcjogbnVtYmVyID0gPG51bWJlcj4gYTtcclxuXHRcdGFzc2VydChtb250aCA+PSAxICYmIG1vbnRoIDw9IDEyLCBcIk1vbnRoIG91dCBvZiByYW5nZVwiKTtcclxuXHRcdGFzc2VydChkYXkgPj0gMSAmJiBkYXkgPD0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpLCBcImRheSBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRhc3NlcnQoaG91ciA+PSAwICYmIGhvdXIgPD0gMjMsIFwiaG91ciBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRhc3NlcnQobWludXRlID49IDAgJiYgbWludXRlIDw9IDU5LCBcIm1pbnV0ZSBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRhc3NlcnQoc2Vjb25kID49IDAgJiYgc2Vjb25kIDw9IDU5LCBcInNlY29uZCBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRhc3NlcnQobWlsbGkgPj0gMCAmJiBtaWxsaSA8PSA5OTksIFwibWlsbGkgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0cmV0dXJuIG1pbGxpICsgMTAwMCAqIChcclxuXHRcdFx0c2Vjb25kICsgbWludXRlICogNjAgKyBob3VyICogMzYwMCArIGRheU9mWWVhcih5ZWFyLCBtb250aCwgZGF5KSAqIDg2NDAwICtcclxuXHRcdFx0KHllYXIgLSAxOTcwKSAqIDMxNTM2MDAwICsgTWF0aC5mbG9vcigoeWVhciAtIDE5NjkpIC8gNCkgKiA4NjQwMCAtXHJcblx0XHRcdE1hdGguZmxvb3IoKHllYXIgLSAxOTAxKSAvIDEwMCkgKiA4NjQwMCArIE1hdGguZmxvb3IoKHllYXIgLSAxOTAwICsgMjk5KSAvIDQwMCkgKiA4NjQwMCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJuIHRoZSBkYXktb2Ytd2Vlay5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogV2Vla0RheSB7XHJcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuXHJcblx0dmFyIGVwb2NoRGF5OiBXZWVrRGF5ID0gV2Vla0RheS5UaHVyc2RheTtcclxuXHR2YXIgZGF5cyA9IE1hdGguZmxvb3IodW5peE1pbGxpcyAvIDEwMDAgLyA4NjQwMCk7XHJcblx0cmV0dXJuIChlcG9jaERheSArIGRheXMpICUgNztcclxufVxyXG5cclxuLyoqXHJcbiAqIE4tdGggc2Vjb25kIGluIHRoZSBkYXksIGNvdW50aW5nIGZyb20gMFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNlY29uZE9mRGF5KGhvdXI6IG51bWJlciwgbWludXRlOiBudW1iZXIsIHNlY29uZDogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRyZXR1cm4gKCgoaG91ciAqIDYwKSArIG1pbnV0ZSkgKiA2MCkgKyBzZWNvbmQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNpYyByZXByZXNlbnRhdGlvbiBvZiBhIGRhdGUgYW5kIHRpbWVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaW1lU3RydWN0IHtcclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgVGltZVN0cnVjdCBmcm9tIGEgbnVtYmVyIG9mIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tVW5peCh1bml4TWlsbGlzOiBudW1iZXIpOiBUaW1lU3RydWN0IHtcclxuXHRcdHJldHVybiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIEphdmFTY3JpcHQgZGF0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRcdFRoZSBkYXRlXHJcblx0ICogQHBhcmFtIGRmXHRXaGljaCBmdW5jdGlvbnMgdG8gdGFrZSAoZ2V0WCgpIG9yIGdldFVUQ1goKSlcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21EYXRlKGQ6IERhdGUsIGRmOiBEYXRlRnVuY3Rpb25zKTogVGltZVN0cnVjdCB7XHJcblx0XHRpZiAoZGYgPT09IERhdGVGdW5jdGlvbnMuR2V0KSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChkLmdldEZ1bGxZZWFyKCksIGQuZ2V0TW9udGgoKSArIDEsIGQuZ2V0RGF0ZSgpLFxyXG5cdFx0XHRcdGQuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCksIGQuZ2V0U2Vjb25kcygpLCBkLmdldE1pbGxpc2Vjb25kcygpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdChkLmdldFVUQ0Z1bGxZZWFyKCksIGQuZ2V0VVRDTW9udGgoKSArIDEsIGQuZ2V0VVRDRGF0ZSgpLFxyXG5cdFx0XHRcdGQuZ2V0VVRDSG91cnMoKSwgZC5nZXRVVENNaW51dGVzKCksIGQuZ2V0VVRDU2Vjb25kcygpLCBkLmdldFVUQ01pbGxpc2Vjb25kcygpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBUaW1lU3RydWN0IGZyb20gYW4gSVNPIDg2MDEgc3RyaW5nIFdJVEhPVVQgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHM6IHN0cmluZyk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0dmFyIHllYXI6IG51bWJlciA9IDE5NzA7XHJcblx0XHRcdHZhciBtb250aDogbnVtYmVyID0gMTtcclxuXHRcdFx0dmFyIGRheTogbnVtYmVyID0gMTtcclxuXHRcdFx0dmFyIGhvdXI6IG51bWJlciA9IDA7XHJcblx0XHRcdHZhciBtaW51dGU6IG51bWJlciA9IDA7XHJcblx0XHRcdHZhciBzZWNvbmQ6IG51bWJlciA9IDA7XHJcblx0XHRcdHZhciBmcmFjdGlvbk1pbGxpczogbnVtYmVyID0gMDtcclxuXHRcdFx0dmFyIGxhc3RVbml0OiBUaW1lVW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblxyXG5cdFx0XHQvLyBzZXBhcmF0ZSBhbnkgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdHZhciBzcGxpdDogc3RyaW5nW10gPSBzLnRyaW0oKS5zcGxpdChcIi5cIik7XHJcblx0XHRcdGFzc2VydChzcGxpdC5sZW5ndGggPj0gMSAmJiBzcGxpdC5sZW5ndGggPD0gMiwgXCJFbXB0eSBzdHJpbmcgb3IgbXVsdGlwbGUgZG90cy5cIik7XHJcblxyXG5cdFx0XHQvLyBwYXJzZSBtYWluIHBhcnRcclxuXHRcdFx0dmFyIGlzQmFzaWNGb3JtYXQgPSAocy5pbmRleE9mKFwiLVwiKSA9PT0gLTEpO1xyXG5cdFx0XHRpZiAoaXNCYXNpY0Zvcm1hdCkge1xyXG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXigoXFxkKSspfChcXGRcXGRcXGRcXGRcXGRcXGRcXGRcXGRUKFxcZCkrKSQvKSxcclxuXHRcdFx0XHRcdFwiSVNPIHN0cmluZyBpbiBiYXNpYyBub3RhdGlvbiBtYXkgb25seSBjb250YWluIG51bWJlcnMgYmVmb3JlIHRoZSBmcmFjdGlvbmFsIHBhcnRcIik7XHJcblxyXG5cdFx0XHRcdC8vIHJlbW92ZSBhbnkgXCJUXCIgc2VwYXJhdG9yXHJcblx0XHRcdFx0c3BsaXRbMF0gPSBzcGxpdFswXS5yZXBsYWNlKFwiVFwiLCBcIlwiKTtcclxuXHJcblx0XHRcdFx0YXNzZXJ0KFs0LCA4LCAxMCwgMTIsIDE0XS5pbmRleE9mKHNwbGl0WzBdLmxlbmd0aCkgIT09IC0xLFxyXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuXHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSA0KSB7XHJcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gOCkge1xyXG5cdFx0XHRcdFx0bW9udGggPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNCwgMiksIDEwKTtcclxuXHRcdFx0XHRcdGRheSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig2LCAyKSwgMTApOyAvLyBub3RlIHRoYXQgWVlZWU1NIGZvcm1hdCBpcyBkaXNhbGxvd2VkIHNvIGlmIG1vbnRoIGlzIHByZXNlbnQsIGRheSBpcyB0b29cclxuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuRGF5O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEwKSB7XHJcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDgsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gMTIpIHtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigxMCwgMiksIDEwKTtcclxuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuTWludXRlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDE0KSB7XHJcblx0XHRcdFx0XHRzZWNvbmQgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTIsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YXNzZXJ0KHNwbGl0WzBdLm1hdGNoKC9eXFxkXFxkXFxkXFxkKC1cXGRcXGQtXFxkXFxkKChUKT9cXGRcXGQoXFw6XFxkXFxkKDpcXGRcXGQpPyk/KT8pPyQvKSwgXCJJbnZhbGlkIElTTyBzdHJpbmdcIik7XHJcblx0XHRcdFx0dmFyIGRhdGVBbmRUaW1lOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHRcdGlmIChzLmluZGV4T2YoXCJUXCIpICE9PSAtMSkge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBzcGxpdFswXS5zcGxpdChcIlRcIik7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChzLmxlbmd0aCA+IDEwKSB7XHJcblx0XHRcdFx0XHRkYXRlQW5kVGltZSA9IFtzcGxpdFswXS5zdWJzdHIoMCwgMTApLCBzcGxpdFswXS5zdWJzdHIoMTApXTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0sIFwiXCJdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRhc3NlcnQoWzQsIDEwXS5pbmRleE9mKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCkgIT09IC0xLFxyXG5cdFx0XHRcdFx0XCJQYWRkaW5nIG9yIHJlcXVpcmVkIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIE5vdGUgdGhhdCBZWVlZTU0gaXMgbm90IHZhbGlkIHBlciBJU08gODYwMVwiKTtcclxuXHJcblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzBdLmxlbmd0aCA+PSA0KSB7XHJcblx0XHRcdFx0XHR5ZWFyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDAsIDQpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlllYXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gMTApIHtcclxuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDUsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChkYXRlQW5kVGltZVswXS5zdWJzdHIoOCwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSAyKSB7XHJcblx0XHRcdFx0XHRob3VyID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDAsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkhvdXI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gNSkge1xyXG5cdFx0XHRcdFx0bWludXRlID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDMsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGRhdGVBbmRUaW1lWzFdLmxlbmd0aCA+PSA4KSB7XHJcblx0XHRcdFx0XHRzZWNvbmQgPSBwYXJzZUludChkYXRlQW5kVGltZVsxXS5zdWJzdHIoNiwgMiksIDEwKTtcclxuXHRcdFx0XHRcdGxhc3RVbml0ID0gVGltZVVuaXQuU2Vjb25kO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gcGFyc2UgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdGlmIChzcGxpdC5sZW5ndGggPiAxICYmIHNwbGl0WzFdLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHR2YXIgZnJhY3Rpb246IG51bWJlciA9IHBhcnNlRmxvYXQoXCIwLlwiICsgc3BsaXRbMV0pO1xyXG5cdFx0XHRcdHN3aXRjaCAobGFzdFVuaXQpIHtcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IGRheXNJblllYXIoeWVhcikgKiA4NjQwMDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSAzNjAwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSA2MDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMTAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNvbWJpbmUgbWFpbiBhbmQgZnJhY3Rpb25hbCBwYXJ0XHJcblx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG5cdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcblx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0dmFyIHVuaXhNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kKTtcclxuXHRcdFx0dW5peE1pbGxpcyA9IG1hdGgucm91bmRTeW0odW5peE1pbGxpcyArIGZyYWN0aW9uTWlsbGlzKTtcclxuXHRcdFx0cmV0dXJuIHVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXMpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIElTTyA4NjAxIHN0cmluZzogXFxcIlwiICsgcyArIFwiXFxcIjogXCIgKyBlLm1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxyXG5cdCAqIEBwYXJhbSBtb250aFx0TW9udGggMS0xMlxyXG5cdCAqIEBwYXJhbSBkYXlcdERheSAxLTMxXHJcblx0ICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xyXG5cdCAqIEBwYXJhbSBtaW51dGVcdE1pbnV0ZSAwLTU5XHJcblx0ICogQHBhcmFtIHNlY29uZFx0U2Vjb25kIDAtNTkgKG5vIGxlYXAgc2Vjb25kcylcclxuXHQgKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIFllYXIsIDE5NzAtLi4uXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB5ZWFyOiBudW1iZXIgPSAxOTcwLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTW9udGggMS0xMlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbW9udGg6IG51bWJlciA9IDEsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBEYXkgb2YgbW9udGgsIDEtMzFcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGRheTogbnVtYmVyID0gMSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEhvdXIgMC0yM1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgaG91cjogbnVtYmVyID0gMCxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE1pbnV0ZSAwLTU5XHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBtaW51dGU6IG51bWJlciA9IDAsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZWNvbmRzLCAwLTU5XHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBzZWNvbmQ6IG51bWJlciA9IDAsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBNaWxsaXNlY29uZHMgMC05OTlcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG1pbGxpOiBudW1iZXIgPSAwXHJcblx0XHQpIHtcclxuXHRcdGFzc2VydCh0aGlzLnZhbGlkYXRlKCksIFwiSW52YWxpZCBhcmd1bWVudHM6IFwiICsgdGhpcy50b1N0cmluZygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZhbGlkYXRlIGEgVGltZVN0cnVjdCwgcmV0dXJucyBmYWxzZSBpZiBpbnZhbGlkLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWxpZGF0ZSgpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodHlwZW9mICh0aGlzLnllYXIpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLnllYXIpICYmIG1hdGguaXNJbnQodGhpcy55ZWFyKSAmJiB0aGlzLnllYXIgPj0gLTEwMDAwICYmIHRoaXMueWVhciA8IDEwMDAwXHJcblx0XHRcdCYmIHR5cGVvZiAodGhpcy5tb250aCkgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHRoaXMubW9udGgpICYmIG1hdGguaXNJbnQodGhpcy5tb250aCkgJiYgdGhpcy5tb250aCA+PSAxICYmIHRoaXMubW9udGggPD0gMTJcclxuXHRcdFx0JiYgdHlwZW9mICh0aGlzLmRheSkgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHRoaXMuZGF5KSAmJiBtYXRoLmlzSW50KHRoaXMuZGF5KSAmJiB0aGlzLmRheSA+PSAxXHJcblx0XHRcdCYmIHRoaXMuZGF5IDw9IGRheXNJbk1vbnRoKHRoaXMueWVhciwgdGhpcy5tb250aClcclxuXHRcdFx0JiYgdHlwZW9mICh0aGlzLmhvdXIpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLmhvdXIpICYmIG1hdGguaXNJbnQodGhpcy5ob3VyKSAmJiB0aGlzLmhvdXIgPj0gMCAmJiB0aGlzLmhvdXIgPD0gMjNcclxuXHRcdFx0JiYgdHlwZW9mICh0aGlzLm1pbnV0ZSkgPT09IFwibnVtYmVyXCIgJiYgIWlzTmFOKHRoaXMubWludXRlKSAmJiBtYXRoLmlzSW50KHRoaXMubWludXRlKSAmJiB0aGlzLm1pbnV0ZSA+PSAwICYmIHRoaXMubWludXRlIDw9IDU5XHJcblx0XHRcdCYmIHR5cGVvZiAodGhpcy5zZWNvbmQpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLnNlY29uZCkgJiYgbWF0aC5pc0ludCh0aGlzLnNlY29uZCkgJiYgdGhpcy5zZWNvbmQgPj0gMCAmJiB0aGlzLnNlY29uZCA8PSA1OVxyXG5cdFx0XHQmJiB0eXBlb2YgKHRoaXMubWlsbGkpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLm1pbGxpKSAmJiBtYXRoLmlzSW50KHRoaXMubWlsbGkpICYmIHRoaXMubWlsbGkgPj0gMFxyXG5cdFx0XHQmJiB0aGlzLm1pbGxpIDw9IDk5OVxyXG5cdFx0XHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGRheS1vZi15ZWFyIDAtMzY1XHJcblx0ICovXHJcblx0cHVibGljIHllYXJEYXkoKTogbnVtYmVyIHtcclxuXHRcdGFzc2VydCh0aGlzLnZhbGlkYXRlKCksIFwiSW52YWxpZCBUaW1lU3RydWN0IHZhbHVlOiBcIiArIHRoaXMudG9TdHJpbmcoKSk7XHJcblx0XHRyZXR1cm4gZGF5T2ZZZWFyKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGlzIHRpbWUgYXMgYSB1bml4IG1pbGxpc2Vjb25kIHRpbWVzdGFtcFxyXG5cdCAqIERvZXMgTk9UIHRha2UgbGVhcCBzZWNvbmRzIGludG8gYWNjb3VudC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9Vbml4Tm9MZWFwU2VjcygpOiBudW1iZXIge1xyXG5cdFx0YXNzZXJ0KHRoaXMudmFsaWRhdGUoKSwgXCJJbnZhbGlkIFRpbWVTdHJ1Y3QgdmFsdWU6IFwiICsgdGhpcy50b1N0cmluZygpKTtcclxuXHRcdHJldHVybiB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0aGlzLnllYXIsIHRoaXMubW9udGgsIHRoaXMuZGF5LCB0aGlzLmhvdXIsIHRoaXMubWludXRlLCB0aGlzLnNlY29uZCwgdGhpcy5taWxsaSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZWVwIGVxdWFsc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVTdHJ1Y3QpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy55ZWFyID09PSBvdGhlci55ZWFyXHJcblx0XHRcdCYmIHRoaXMubW9udGggPT09IG90aGVyLm1vbnRoXHJcblx0XHRcdCYmIHRoaXMuZGF5ID09PSBvdGhlci5kYXlcclxuXHRcdFx0JiYgdGhpcy5ob3VyID09PSBvdGhlci5ob3VyXHJcblx0XHRcdCYmIHRoaXMubWludXRlID09PSBvdGhlci5taW51dGVcclxuXHRcdFx0JiYgdGhpcy5zZWNvbmQgPT09IG90aGVyLnNlY29uZFxyXG5cdFx0XHQmJiB0aGlzLm1pbGxpID09PSBvdGhlci5taWxsaSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiA8IG9wZXJhdG9yXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBUaW1lU3RydWN0KTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMudG9Vbml4Tm9MZWFwU2VjcygpIDwgb3RoZXIudG9Vbml4Tm9MZWFwU2VjcygpKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lU3RydWN0IHtcclxuXHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0aGlzLnllYXIsIHRoaXMubW9udGgsIHRoaXMuZGF5LCB0aGlzLmhvdXIsIHRoaXMubWludXRlLCB0aGlzLnNlY29uZCwgdGhpcy5taWxsaSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRpbWVUb1VuaXhOb0xlYXBTZWNzKHRoaXMueWVhciwgdGhpcy5tb250aCwgdGhpcy5kYXksIHRoaXMuaG91ciwgdGhpcy5taW51dGUsIHRoaXMuc2Vjb25kLCB0aGlzLm1pbGxpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIElTTyA4NjAxIHN0cmluZyBZWVlZLU1NLUREVGhoOm1tOnNzLm5ublxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHN0cmluZ3MucGFkTGVmdCh0aGlzLnllYXIudG9TdHJpbmcoMTApLCA0LCBcIjBcIilcclxuXHRcdFx0KyBcIi1cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1vbnRoLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5kYXkudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIlRcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLmhvdXIudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbnV0ZS50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiOlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuc2Vjb25kLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCIuXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taWxsaS50b1N0cmluZygxMCksIDMsIFwiMFwiKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbVGltZVN0cnVjdDogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIEJpbmFyeSBzZWFyY2hcclxuICogQHBhcmFtIGFycmF5IEFycmF5IHRvIHNlYXJjaFxyXG4gKiBAcGFyYW0gY29tcGFyZSBGdW5jdGlvbiB0aGF0IHNob3VsZCByZXR1cm4gPCAwIGlmIGdpdmVuIGVsZW1lbnQgaXMgbGVzcyB0aGFuIHNlYXJjaGVkIGVsZW1lbnQgZXRjXHJcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluc2VydGlvbiBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBsb29rIGZvclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeUluc2VydGlvbkluZGV4PFQ+KGFycjogVFtdLCBjb21wYXJlPzogKGE6IFQpID0+IG51bWJlcik6IG51bWJlciB7XHJcblx0dmFyIG1pbkluZGV4ID0gMDtcclxuXHR2YXIgbWF4SW5kZXggPSBhcnIubGVuZ3RoIC0gMTtcclxuXHR2YXIgY3VycmVudEluZGV4OiBudW1iZXI7XHJcblx0dmFyIGN1cnJlbnRFbGVtZW50OiBUO1xyXG5cdC8vIG5vIGFycmF5IC8gZW1wdHkgYXJyYXlcclxuXHRpZiAoIWFycikge1xyXG5cdFx0cmV0dXJuIDA7XHJcblx0fVxyXG5cdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0Ly8gb3V0IG9mIGJvdW5kc1xyXG5cdGlmIChjb21wYXJlKGFyclswXSkgPiAwKSB7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9XHJcblx0aWYgKGNvbXBhcmUoYXJyW21heEluZGV4XSkgPCAwKSB7XHJcblx0XHRyZXR1cm4gbWF4SW5kZXggKyAxO1xyXG5cdH1cclxuXHQvLyBlbGVtZW50IGluIHJhbmdlXHJcblx0d2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XHJcblx0XHRjdXJyZW50SW5kZXggPSBNYXRoLmZsb29yKChtaW5JbmRleCArIG1heEluZGV4KSAvIDIpO1xyXG5cdFx0Y3VycmVudEVsZW1lbnQgPSBhcnJbY3VycmVudEluZGV4XTtcclxuXHJcblx0XHRpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPCAwKSB7XHJcblx0XHRcdG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMTtcclxuXHRcdH0gZWxzZSBpZiAoY29tcGFyZShjdXJyZW50RWxlbWVudCkgPiAwKSB7XHJcblx0XHRcdG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBjdXJyZW50SW5kZXg7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbWF4SW5kZXg7XHJcbn1cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
