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
        case 0 /* Millisecond */: return 1;
        case 1 /* Second */: return 1000;
        case 2 /* Minute */: return 60 * 1000;
        case 3 /* Hour */: return 60 * 60 * 1000;
        case 4 /* Day */: return 86400000;
        case 5 /* Week */: return 7 * 86400000;
        case 6 /* Month */: return 30 * 86400000;
        case 7 /* Year */: return 12 * 30 * 86400000;
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
    for (var i = 0; i < 8 /* MAX */; ++i) {
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
    var firstThursday = firstWeekDayOfMonth(year, month, 4 /* Thursday */);
    var firstMonday = firstWeekDayOfMonth(year, month, 1 /* Monday */);
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
    var lastMonday = lastWeekDayOfMonth(year, month, 1 /* Monday */);
    var lastThursday = lastWeekDayOfMonth(year, month, 4 /* Thursday */);
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
    var result = weekDayOnOrAfter(year, 1, 1, 1 /* Monday */) - 1;
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
        return milli + 1000 * (second + minute * 60 + hour * 3600 + dayOfYear(year, month, day) * 86400 + (year - 1970) * 31536000 + Math.floor((year - 1969) / 4) * 86400 - Math.floor((year - 1901) / 100) * 86400 + Math.floor((year - 1900 + 299) / 400) * 86400);
    }
}
exports.timeToUnixNoLeapSecs = timeToUnixNoLeapSecs;
/**
 * Return the day-of-week.
 * This does NOT take leap seconds into account.
 */
function weekDayNoLeapSecs(unixMillis) {
    assertUnixTimestamp(unixMillis);
    var epochDay = 4 /* Thursday */;
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
        if (df === 0 /* Get */) {
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
            var lastUnit = 7 /* Year */;
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
                    lastUnit = 7 /* Year */;
                }
                if (split[0].length >= 8) {
                    month = parseInt(split[0].substr(4, 2), 10);
                    day = parseInt(split[0].substr(6, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = 4 /* Day */;
                }
                if (split[0].length >= 10) {
                    hour = parseInt(split[0].substr(8, 2), 10);
                    lastUnit = 3 /* Hour */;
                }
                if (split[0].length >= 12) {
                    minute = parseInt(split[0].substr(10, 2), 10);
                    lastUnit = 2 /* Minute */;
                }
                if (split[0].length >= 14) {
                    second = parseInt(split[0].substr(12, 2), 10);
                    lastUnit = 1 /* Second */;
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
                    lastUnit = 7 /* Year */;
                }
                if (dateAndTime[0].length >= 10) {
                    month = parseInt(dateAndTime[0].substr(5, 2), 10);
                    day = parseInt(dateAndTime[0].substr(8, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
                    lastUnit = 4 /* Day */;
                }
                if (dateAndTime[1].length >= 2) {
                    hour = parseInt(dateAndTime[1].substr(0, 2), 10);
                    lastUnit = 3 /* Hour */;
                }
                if (dateAndTime[1].length >= 5) {
                    minute = parseInt(dateAndTime[1].substr(3, 2), 10);
                    lastUnit = 2 /* Minute */;
                }
                if (dateAndTime[1].length >= 8) {
                    second = parseInt(dateAndTime[1].substr(6, 2), 10);
                    lastUnit = 1 /* Second */;
                }
            }
            // parse fractional part
            if (split.length > 1 && split[1].length > 0) {
                var fraction = parseFloat("0." + split[1]);
                switch (lastUnit) {
                    case 7 /* Year */:
                        {
                            fractionMillis = daysInYear(year) * 86400000 * fraction;
                        }
                        break;
                    case 4 /* Day */:
                        {
                            fractionMillis = 86400000 * fraction;
                        }
                        break;
                    case 3 /* Hour */:
                        {
                            fractionMillis = 3600000 * fraction;
                        }
                        break;
                    case 2 /* Minute */:
                        {
                            fractionMillis = 60000 * fraction;
                        }
                        break;
                    case 1 /* Second */:
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
        return (typeof (this.year) === "number" && !isNaN(this.year) && math.isInt(this.year) && this.year >= -10000 && this.year < 10000 && typeof (this.month) === "number" && !isNaN(this.month) && math.isInt(this.month) && this.month >= 1 && this.month <= 12 && typeof (this.day) === "number" && !isNaN(this.day) && math.isInt(this.day) && this.day >= 1 && this.day <= daysInMonth(this.year, this.month) && typeof (this.hour) === "number" && !isNaN(this.hour) && math.isInt(this.hour) && this.hour >= 0 && this.hour <= 23 && typeof (this.minute) === "number" && !isNaN(this.minute) && math.isInt(this.minute) && this.minute >= 0 && this.minute <= 59 && typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 59 && typeof (this.milli) === "number" && !isNaN(this.milli) && math.isInt(this.milli) && this.milli >= 0 && this.milli <= 999);
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
        return (this.year === other.year && this.month === other.month && this.day === other.day && this.hour === other.hour && this.minute === other.minute && this.second === other.second && this.milli === other.milli);
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
        return strings.padLeft(this.year.toString(10), 4, "0") + "-" + strings.padLeft(this.month.toString(10), 2, "0") + "-" + strings.padLeft(this.day.toString(10), 2, "0") + "T" + strings.padLeft(this.hour.toString(10), 2, "0") + ":" + strings.padLeft(this.minute.toString(10), 2, "0") + ":" + strings.padLeft(this.second.toString(10), 2, "0") + "." + strings.padLeft(this.milli.toString(10), 3, "0");
    };
    TimeStruct.prototype.inspect = function () {
        return "[TimeStruct: " + this.toString() + "]";
    };
    return TimeStruct;
})();
exports.TimeStruct = TimeStruct;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9iYXNpY3MudHMiXSwibmFtZXMiOlsiV2Vla0RheSIsIlRpbWVVbml0IiwidGltZVVuaXRUb01pbGxpc2Vjb25kcyIsInRpbWVVbml0VG9TdHJpbmciLCJzdHJpbmdUb1RpbWVVbml0IiwiaXNMZWFwWWVhciIsImRheXNJblllYXIiLCJkYXlzSW5Nb250aCIsImRheU9mWWVhciIsImxhc3RXZWVrRGF5T2ZNb250aCIsImZpcnN0V2Vla0RheU9mTW9udGgiLCJ3ZWVrRGF5T25PckFmdGVyIiwid2Vla0RheU9uT3JCZWZvcmUiLCJ3ZWVrT2ZNb250aCIsImdldFdlZWtPbmVEYXlPZlllYXIiLCJ3ZWVrTnVtYmVyIiwiYXNzZXJ0VW5peFRpbWVzdGFtcCIsInVuaXhUb1RpbWVOb0xlYXBTZWNzIiwidGltZVRvVW5peE5vTGVhcFNlY3MiLCJ3ZWVrRGF5Tm9MZWFwU2VjcyIsInNlY29uZE9mRGF5IiwiVGltZVN0cnVjdCIsIlRpbWVTdHJ1Y3QuY29uc3RydWN0b3IiLCJUaW1lU3RydWN0LmZyb21Vbml4IiwiVGltZVN0cnVjdC5mcm9tRGF0ZSIsIlRpbWVTdHJ1Y3QuZnJvbVN0cmluZyIsIlRpbWVTdHJ1Y3QudmFsaWRhdGUiLCJUaW1lU3RydWN0LnllYXJEYXkiLCJUaW1lU3RydWN0LnRvVW5peE5vTGVhcFNlY3MiLCJUaW1lU3RydWN0LmVxdWFscyIsIlRpbWVTdHJ1Y3QubGVzc1RoYW4iLCJUaW1lU3RydWN0LmNsb25lIiwiVGltZVN0cnVjdC52YWx1ZU9mIiwiVGltZVN0cnVjdC50b1N0cmluZyIsIlRpbWVTdHJ1Y3QuaW5zcGVjdCJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILEFBRUEsMkNBRjJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLElBQU8sYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7QUFFaEQs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LEtBQUtBLENBQUNBO0lBQ2RBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ1BBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2JBLENBQUNBO0FBQ0ZBLENBQUNBO0FBZmUsa0JBQVUsR0FBVixVQWVmLENBQUE7QUFFRCxBQUdBOztHQURHO1NBQ2EsVUFBVSxDQUFDLElBQVk7SUFDdENDLE1BQU1BLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO0FBQ3ZDQSxDQUFDQTtBQUZlLGtCQUFVLEdBQVYsVUFFZixDQUFBO0FBRUQsQUFLQTs7OztHQURHO1NBQ2EsV0FBVyxDQUFDLElBQVksRUFBRSxLQUFhO0lBQ3REQyxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNmQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNQQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNQQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNQQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNQQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNQQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUNSQSxLQUFLQSxFQUFFQTtZQUNOQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUNYQSxLQUFLQSxDQUFDQTtZQUNMQSxNQUFNQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNyQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDUEEsS0FBS0EsRUFBRUE7WUFDTkEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDWEE7WUFDQ0EsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsaUJBQWlCQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7QUFDRkEsQ0FBQ0E7QUFwQmUs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Q0EsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO1FBQzdCQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQzVDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUU3QkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDWkEsT0FBT0EsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDakNBLElBQUlBLElBQUlBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ3pCQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNSQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUVuQkEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDWEEsT0FBT0EsSUFBSUEsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDekNBLElBQUlBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ2pDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUNUQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNyQkEsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsR0FBR0EsV0FBV0EsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDbERBLENBQUNBO0lBRURBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0FBQ2ZBLENBQUNBO0FBN0RlLDRCQUFvQixHQUFwQixvQkE2RGYsQ0FBQTtBQXdCRCxTQUFnQixvQkFBb0IsQ0FDbkMsQ0FBYSxFQUFFLEtBQWlCLEVBQUUsR0FBZSxFQUNqRCxJQUFnQixFQUFFLE1BQWtCLEVBQUUsTUFBa0IsRUFBRSxLQUFpQjtJQUQzRUMsaUJBQWFBLEdBQWJBLFFBQWFBO0lBQUVBLHFCQUFpQkEsR0FBakJBLFNBQWlCQTtJQUFFQSxtQkFBZUEsR0FBZkEsT0FBZUE7SUFDakRBLG9CQUFnQkEsR0FBaEJBLFFBQWdCQTtJQUFFQSxzQkFBa0JBLEdBQWxCQSxVQUFrQkE7SUFBRUEsc0JBQWtCQSxHQUFsQkEsVUFBa0JBO0lBQUVBLHFCQUFpQkEsR0FBakJBLFNBQWlCQTtJQUMzRUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsUUFBUUEsRUFBRUEsZ0VBQWdFQSxDQUFDQSxDQUFDQTtJQUU3SEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLElBQUlBLEVBQUVBLEdBQTJCQSxDQUFDQSxDQUFDQTtRQUNuQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDcENBLE1BQU1BLENBQUNBLG9CQUFvQkEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDakdBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ1BBLElBQUlBLElBQUlBLEdBQW9CQSxDQUFDQSxDQUFDQTtRQUM5QkEsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsRUFBRUEsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUN4REEsTUFBTUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsQ0FBQ0EsRUFBRUEsa0JBQWtCQSxDQUFDQSxDQUFDQTtRQUN4RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsSUFBSUEsRUFBRUEsRUFBRUEsbUJBQW1CQSxDQUFDQSxDQUFDQTtRQUNyREEsTUFBTUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsSUFBSUEsTUFBTUEsSUFBSUEsRUFBRUEsRUFBRUEscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUMzREEsTUFBTUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsSUFBSUEsTUFBTUEsSUFBSUEsRUFBRUEsRUFBRUEscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUMzREEsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsSUFBSUEsR0FBR0EsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUN6REEsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsR0FBR0EsQ0FDckJBLE1BQU1BLEdBQUdBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLEdBQUdBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLEtBQUtBLEdBQ3hFQSxDQUFDQSxJQUFJQSxHQUFH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QUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEVBQ3hEQSx3RkFBd0ZBLENBQUNBLENBQUNBO2dCQUUzRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDM0NBLFFBQVFBLEdBQUdBLFlBQWFBLENBQUNBO2dCQUMxQkEsQ0FBQ0E7Z0JBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUMxQkEsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzVDQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSwyRUFBMkVBO29CQUN0SEEsUUFBUUEsR0FBR0EsV0FBWUEsQ0FBQ0E7Z0JBQ3pCQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxJQUFJQSxHQUFHQSxRQUFRQSxDQUFDQSxL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Q0EsQ0FBQ0E7d0JBQUNBLEtBQUtBLENBQUNBO29CQUNSQSxLQUFLQSxjQUFlQTt3QkFBRUEsQ0FBQ0E7NEJBQ3RCQSxjQUFjQSxHQUFHQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQTt3QkFDbkNBLENBQUNBO3dCQUFDQSxLQUFLQSxDQUFDQTtvQkFDUkEsS0FBS0EsY0FBZUE7d0JBQUVBLENBQUNBOzRCQUN0QkEsY0FBY0EsR0FBR0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0E7d0JBQ2xDQSxDQUFDQTt3QkFBQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ1RBLENBQUNBO1lBQ0ZBLENBQUNBO1lBRURBLEFBQ0FBLG1DQURtQ0E7WUFDbkNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQzNCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUM3QkEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQzNCQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUMvQkEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLElBQUlBLFVBQVVBLEdBQVdBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDdEZBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFVBQVVBLEdBQUdBLGNBQWNBLENBQUNBLENBQUNBO1lBQ3hEQSxNQUFNQSxDQUFDQSxvQkFBb0JBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQ3pDQSxDQUFFQTtRQUFBQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNaQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSw2QkFBNkJBLEdBQUdBLENBQUNBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3pFQSxDQUFDQTtJQUNGQSxDQUFDQTtJQW9EREo7O09BRUdBO0lBQ0lBLDZCQUFRQSxHQUFmQTtRQUNDSyxNQUFNQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFLQSxJQUM3SEEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsRUFBRUEsSUFDdkhBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQzNGQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUM5Q0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsSUFDbEhBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLEVBQUVBLElBQzVIQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxRQUFRQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxFQUFFQSxJQUM1SEEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsUUFBUUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0Es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QUVHQTtJQUNJQSw2QkFBUUEsR0FBZkE7UUFDQ1ksTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FDbkRBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQ3REQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUNwREEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FDckRBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQ3ZEQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUN2REEsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDM0RBLENBQUNBO0lBRU1aLDRCQUFPQSxHQUFkQTtRQUNDYSxNQUFNQSxDQUFDQSxlQUFlQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFFRmIsaUJBQUNBO0FBQURBLENBclJBLEFBcVJDQSxJQUFBO0FBclJZLGtCQUFVLEdBQVYsVUFxUlosQ0FBQSIsImZpbGUiOiJsaWIvYmFzaWNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZC50c1wiLz5cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XHJcblxyXG5pbXBvcnQgamF2YXNjcmlwdCA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbmltcG9ydCBEYXRlRnVuY3Rpb25zID0gamF2YXNjcmlwdC5EYXRlRnVuY3Rpb25zO1xyXG5cclxuaW1wb3J0IG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xyXG5pbXBvcnQgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcblxyXG4vKipcclxuICogRGF5LW9mLXdlZWsuIE5vdGUgdGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdCBkYXktb2Ytd2VlazpcclxuICogU3VuZGF5ID0gMCwgTW9uZGF5ID0gMSBldGNcclxuICovXHJcbmV4cG9ydCBlbnVtIFdlZWtEYXkge1xyXG5cdFN1bmRheSxcclxuXHRNb25kYXksXHJcblx0VHVlc2RheSxcclxuXHRXZWRuZXNkYXksXHJcblx0VGh1cnNkYXksXHJcblx0RnJpZGF5LFxyXG5cdFNhdHVyZGF5XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaW1lIHVuaXRzXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUaW1lVW5pdCB7XHJcblx0TWlsbGlzZWNvbmQsXHJcblx0U2Vjb25kLFxyXG5cdE1pbnV0ZSxcclxuXHRIb3VyLFxyXG5cdERheSxcclxuXHRXZWVrLFxyXG5cdE1vbnRoLFxyXG5cdFllYXIsXHJcblx0LyoqXHJcblx0ICogRW5kLW9mLWVudW0gbWFya2VyLCBkbyBub3QgdXNlXHJcblx0ICovXHJcblx0TUFYXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBcHByb3hpbWF0ZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhIHRpbWUgdW5pdC5cclxuICogQSBkYXkgaXMgYXNzdW1lZCB0byBoYXZlIDI0IGhvdXJzLCBhIG1vbnRoIGlzIGFzc3VtZWQgdG8gZXF1YWwgMzAgZGF5c1xyXG4gKiBhbmQgYSB5ZWFyIGlzIHNldCB0byAzNjAgZGF5cyAoYmVjYXVzZSAxMiBtb250aHMgb2YgMzAgZGF5cykuXHJcbiAqXHJcbiAqIEBwYXJhbSB1bml0XHRUaW1lIHVuaXQgZS5nLiBUaW1lVW5pdC5Nb250aFxyXG4gKiBAcmV0dXJuc1x0VGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0c3dpdGNoICh1bml0KSB7XHJcblx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiByZXR1cm4gMTtcclxuXHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiByZXR1cm4gMTAwMDtcclxuXHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiByZXR1cm4gNjAgKiAxMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiByZXR1cm4gNjAgKiA2MCAqIDEwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0LkRheTogcmV0dXJuIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOiByZXR1cm4gNyAqIDg2NDAwMDAwO1xyXG5cdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDogcmV0dXJuIDMwICogODY0MDAwMDA7XHJcblx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHJldHVybiAxMiAqIDMwICogODY0MDAwMDA7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0aW1lIHVuaXRcIik7XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaW1lIHVuaXQgdG8gbG93ZXJjYXNlIHN0cmluZy4gSWYgYW1vdW50IGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgc3RyaW5nIGlzIHB1dCBpbiBwbHVyYWwgZm9ybVxyXG4gKiBpZiBuZWNlc3NhcnkuXHJcbiAqIEBwYXJhbSB1bml0IFRoZSB1bml0XHJcbiAqIEBwYXJhbSBhbW91bnQgSWYgdGhpcyBpcyB1bmVxdWFsIHRvIC0xIGFuZCAxLCB0aGVuIHRoZSByZXN1bHQgaXMgcGx1cmFsaXplZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVVbml0VG9TdHJpbmcodW5pdDogVGltZVVuaXQsIGFtb3VudDogbnVtYmVyID0gMSk6IHN0cmluZyB7XHJcblx0dmFyIHJlc3VsdCA9IFRpbWVVbml0W3VuaXRdLnRvTG93ZXJDYXNlKCk7XHJcblx0aWYgKGFtb3VudCA9PT0gMSB8fCBhbW91bnQgPT09IC0xKSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gcmVzdWx0ICsgXCJzXCI7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9UaW1lVW5pdChzOiBzdHJpbmcpOiBUaW1lVW5pdCB7XHJcblx0dmFyIHRyaW1tZWQgPSBzLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgVGltZVVuaXQuTUFYOyArK2kpIHtcclxuXHRcdHZhciBvdGhlciA9IHRpbWVVbml0VG9TdHJpbmcoaSwgMSk7XHJcblx0XHRpZiAob3RoZXIgPT09IHRyaW1tZWQgfHwgKG90aGVyICsgXCJzXCIpID09PSB0cmltbWVkKSB7XHJcblx0XHRcdHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgdW5pdCBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhlIGdpdmVuIHllYXIgaXMgYSBsZWFwIHllYXIuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNMZWFwWWVhcih5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHQvLyBmcm9tIFdpa2lwZWRpYTpcclxuXHQvLyBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNCB0aGVuIGNvbW1vbiB5ZWFyXHJcblx0Ly8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgMTAwIHRoZW4gbGVhcCB5ZWFyXHJcblx0Ly8gZWxzZSBpZiB5ZWFyIGlzIG5vdCBkaXZpc2libGUgYnkgNDAwIHRoZW4gY29tbW9uIHllYXJcclxuXHQvLyBlbHNlIGxlYXAgeWVhclxyXG5cdGlmICh5ZWFyICUgNCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH0gZWxzZSBpZiAoeWVhciAlIDEwMCAhPT0gMCkge1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIGlmICh5ZWFyICUgNDAwICE9PSAwKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSBlbHNlIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBkYXlzIGluIGEgZ2l2ZW4geWVhclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRyZXR1cm4gKGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjUpO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggMS0xMlxyXG4gKiBAcmV0dXJuIFRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgZ2l2ZW4gbW9udGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdHN3aXRjaCAobW9udGgpIHtcclxuXHRcdGNhc2UgMTpcclxuXHRcdGNhc2UgMzpcclxuXHRcdGNhc2UgNTpcclxuXHRcdGNhc2UgNzpcclxuXHRcdGNhc2UgODpcclxuXHRcdGNhc2UgMTA6XHJcblx0XHRjYXNlIDEyOlxyXG5cdFx0XHRyZXR1cm4gMzE7XHJcblx0XHRjYXNlIDI6XHJcblx0XHRcdHJldHVybiAoaXNMZWFwWWVhcih5ZWFyKSA/IDI5IDogMjgpO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0Y2FzZSA2OlxyXG5cdFx0Y2FzZSA5OlxyXG5cdFx0Y2FzZSAxMTpcclxuXHRcdFx0cmV0dXJuIDMwO1xyXG5cdFx0ZGVmYXVsdDpcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aDogXCIgKyBtb250aCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5IG9mIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlIFswLi4zNjVdLiBKYW51YXJ5IGZpcnN0IGlzIDAuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBlLmcuIDE5ODZcclxuICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheSBEYXkgb2YgbW9udGggMS0zMVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRheU9mWWVhcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRhc3NlcnQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XHJcblx0YXNzZXJ0KGRheSA+PSAxICYmIGRheSA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiZGF5IG91dCBvZiByYW5nZVwiKTtcclxuXHR2YXIgeWVhckRheTogbnVtYmVyID0gMDtcclxuXHRmb3IgKHZhciBpOiBudW1iZXIgPSAxOyBpIDwgbW9udGg7IGkrKykge1xyXG5cdFx0eWVhckRheSArPSBkYXlzSW5Nb250aCh5ZWFyLCBpKTtcclxuXHR9XHJcblx0eWVhckRheSArPSAoZGF5IC0gMSk7XHJcblx0cmV0dXJuIHllYXJEYXk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBsYXN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcclxuICpcclxuICogQHJldHVybiB0aGUgbGFzdCBvY2N1cnJlbmNlIG9mIHRoZSB3ZWVrIGRheSBpbiB0aGUgbW9udGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsYXN0V2Vla0RheU9mTW9udGgoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHR2YXIgZW5kT2ZNb250aDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHllYXIsIG1vbnRoLCBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpO1xyXG5cdHZhciBlbmRPZk1vbnRoTWlsbGlzID0gdGltZVRvVW5peE5vTGVhcFNlY3MoZW5kT2ZNb250aCk7XHJcblx0dmFyIGVuZE9mTW9udGhXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3MoZW5kT2ZNb250aE1pbGxpcyk7XHJcblx0dmFyIGRpZmY6IG51bWJlciA9IHdlZWtEYXkgLSBlbmRPZk1vbnRoV2Vla0RheTtcclxuXHRpZiAoZGlmZiA+IDApIHtcclxuXHRcdGRpZmYgLT0gNztcclxuXHR9XHJcblx0cmV0dXJuIGVuZE9mTW9udGguZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoZSBnaXZlbiB3ZWVrZGF5IGluIHRoZSBnaXZlbiBtb250aFxyXG4gKlxyXG4gKiBAcGFyYW0geWVhclx0VGhlIHllYXJcclxuICogQHBhcmFtIG1vbnRoXHR0aGUgbW9udGggMS0xMlxyXG4gKiBAcGFyYW0gd2Vla0RheVx0dGhlIGRlc2lyZWQgd2VlayBkYXlcclxuICpcclxuICogQHJldHVybiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgd2VlayBkYXkgaW4gdGhlIG1vbnRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmlyc3RXZWVrRGF5T2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIHdlZWtEYXk6IFdlZWtEYXkpOiBudW1iZXIge1xyXG5cdHZhciBiZWdpbk9mTW9udGg6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh5ZWFyLCBtb250aCwgMSk7XHJcblx0dmFyIGJlZ2luT2ZNb250aE1pbGxpcyA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKGJlZ2luT2ZNb250aCk7XHJcblx0dmFyIGJlZ2luT2ZNb250aFdlZWtEYXkgPSB3ZWVrRGF5Tm9MZWFwU2VjcyhiZWdpbk9mTW9udGhNaWxsaXMpO1xyXG5cdHZhciBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gYmVnaW5PZk1vbnRoV2Vla0RheTtcclxuXHRpZiAoZGlmZiA8IDApIHtcclxuXHRcdGRpZmYgKz0gNztcclxuXHR9XHJcblx0cmV0dXJuIGJlZ2luT2ZNb250aC5kYXkgKyBkaWZmO1xyXG59XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPj0gdGhlIGdpdmVuIGRheS5cclxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JBZnRlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLCB3ZWVrRGF5OiBXZWVrRGF5KTogbnVtYmVyIHtcclxuXHR2YXIgc3RhcnQ6IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh5ZWFyLCBtb250aCwgZGF5KTtcclxuXHR2YXIgc3RhcnRNaWxsaXM6IG51bWJlciA9IHRpbWVUb1VuaXhOb0xlYXBTZWNzKHN0YXJ0KTtcclxuXHR2YXIgc3RhcnRXZWVrRGF5OiBXZWVrRGF5ID0gd2Vla0RheU5vTGVhcFNlY3Moc3RhcnRNaWxsaXMpO1xyXG5cdHZhciBkaWZmOiBudW1iZXIgPSB3ZWVrRGF5IC0gc3RhcnRXZWVrRGF5O1xyXG5cdGlmIChkaWZmIDwgMCkge1xyXG5cdFx0ZGlmZiArPSA3O1xyXG5cdH1cclxuXHRhc3NlcnQoc3RhcnQuZGF5ICsgZGlmZiA8PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCksIFwiVGhlIGdpdmVuIG1vbnRoIGhhcyBubyBzdWNoIHdlZWtkYXlcIik7XHJcblx0cmV0dXJuIHN0YXJ0LmRheSArIGRpZmY7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkYXktb2YtbW9udGggdGhhdCBpcyBvbiB0aGUgZ2l2ZW4gd2Vla2RheSBhbmQgd2hpY2ggaXMgPD0gdGhlIGdpdmVuIGRheS5cclxuICogVGhyb3dzIGlmIHRoZSBtb250aCBoYXMgbm8gc3VjaCBkYXkuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla0RheU9uT3JCZWZvcmUoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlciwgd2Vla0RheTogV2Vla0RheSk6IG51bWJlciB7XHJcblx0dmFyIHN0YXJ0OiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeWVhciwgbW9udGgsIGRheSk7XHJcblx0dmFyIHN0YXJ0TWlsbGlzOiBudW1iZXIgPSB0aW1lVG9Vbml4Tm9MZWFwU2VjcyhzdGFydCk7XHJcblx0dmFyIHN0YXJ0V2Vla0RheTogV2Vla0RheSA9IHdlZWtEYXlOb0xlYXBTZWNzKHN0YXJ0TWlsbGlzKTtcclxuXHR2YXIgZGlmZjogbnVtYmVyID0gd2Vla0RheSAtIHN0YXJ0V2Vla0RheTtcclxuXHRpZiAoZGlmZiA+IDApIHtcclxuXHRcdGRpZmYgLT0gNztcclxuXHR9XHJcblx0YXNzZXJ0KHN0YXJ0LmRheSArIGRpZmYgPj0gMSwgXCJUaGUgZ2l2ZW4gbW9udGggaGFzIG5vIHN1Y2ggd2Vla2RheVwiKTtcclxuXHRyZXR1cm4gc3RhcnQuZGF5ICsgZGlmZjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG4gKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG4gKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG4gKlxyXG4gKiBAcGFyYW0geWVhciBUaGUgeWVhclxyXG4gKiBAcGFyYW0gbW9udGggVGhlIG1vbnRoIFsxLTEyXVxyXG4gKiBAcGFyYW0gZGF5IFRoZSBkYXkgWzEtMzFdXHJcbiAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB3ZWVrT2ZNb250aCh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcclxuXHR2YXIgZmlyc3RUaHVyc2RheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuVGh1cnNkYXkpO1xyXG5cdHZhciBmaXJzdE1vbmRheSA9IGZpcnN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIHdlZWsgMSBvciBsYXN0IHdlZWsgb2YgcHJldmlvdXMgbW9udGhcclxuXHRpZiAoZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdGlmIChmaXJzdFRodXJzZGF5IDwgZmlyc3RNb25kYXkpIHtcclxuXHRcdFx0Ly8gV2VlayAxXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gTGFzdCB3ZWVrIG9mIHByZXZpb3VzIG1vbnRoXHJcblx0XHRcdGlmIChtb250aCA+IDEpIHtcclxuXHRcdFx0XHQvLyBEZWZhdWx0IGNhc2VcclxuXHRcdFx0XHRyZXR1cm4gd2Vla09mTW9udGgoeWVhciwgbW9udGggLSAxLCAzMSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gSmFudWFyeVxyXG5cdFx0XHRcdHJldHVybiB3ZWVrT2ZNb250aCh5ZWFyIC0gMSwgMTIsIDMxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dmFyIGxhc3RNb25kYXkgPSBsYXN0V2Vla0RheU9mTW9udGgoeWVhciwgbW9udGgsIFdlZWtEYXkuTW9uZGF5KTtcclxuXHR2YXIgbGFzdFRodXJzZGF5ID0gbGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIG1vbnRoLCBXZWVrRGF5LlRodXJzZGF5KTtcclxuXHQvLyBDb3JuZXIgY2FzZTogY2hlY2sgaWYgd2UgYXJlIGluIGxhc3Qgd2VlayBvciB3ZWVrIDEgb2YgcHJldmlvdXMgbW9udGhcclxuXHRpZiAoZGF5ID49IGxhc3RNb25kYXkpIHtcclxuXHRcdGlmIChsYXN0TW9uZGF5ID4gbGFzdFRodXJzZGF5KSB7XHJcblx0XHRcdC8vIFdlZWsgMSBvZiBuZXh0IG1vbnRoXHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gTm9ybWFsIGNhc2VcclxuXHR2YXIgcmVzdWx0ID0gTWF0aC5mbG9vcigoZGF5IC0gZmlyc3RNb25kYXkpIC8gNykgKyAxO1xyXG5cdGlmIChmaXJzdFRodXJzZGF5IDwgNCkge1xyXG5cdFx0cmVzdWx0ICs9IDE7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGF5LW9mLXllYXIgb2YgdGhlIE1vbmRheSBvZiB3ZWVrIDEgaW4gdGhlIGdpdmVuIHllYXIuXHJcbiAqIE5vdGUgdGhhdCB0aGUgcmVzdWx0IG1heSBsaWUgaW4gdGhlIHByZXZpb3VzIHllYXIsIGluIHdoaWNoIGNhc2UgaXRcclxuICogd2lsbCBiZSAobXVjaCkgZ3JlYXRlciB0aGFuIDRcclxuICovXHJcbmZ1bmN0aW9uIGdldFdlZWtPbmVEYXlPZlllYXIoeWVhcjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHQvLyBmaXJzdCBtb25kYXkgb2YgSmFudWFyeSwgbWludXMgb25lIGJlY2F1c2Ugd2Ugd2FudCBkYXktb2YteWVhclxyXG5cdHZhciByZXN1bHQ6IG51bWJlciA9IHdlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgMSwgMSwgV2Vla0RheS5Nb25kYXkpIC0gMTtcclxuXHRpZiAocmVzdWx0ID4gMykgeyAvLyBncmVhdGVyIHRoYW4gamFuIDR0aFxyXG5cdFx0cmVzdWx0IC09IDc7XHJcblx0XHRpZiAocmVzdWx0IDwgMCkge1xyXG5cdFx0XHRyZXN1bHQgKz0gZXhwb3J0cy5kYXlzSW5ZZWFyKHllYXIgLSAxKTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlciBmb3IgdGhlIGdpdmVuIGRhdGUuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG4gKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcbiAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk4OFxyXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheVx0RGF5IG9mIG1vbnRoIDEtMzFcclxuICpcclxuICogQHJldHVybiBXZWVrIG51bWJlciAxLTUzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2Vla051bWJlcih5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyKTogbnVtYmVyIHtcclxuXHR2YXIgZG95ID0gZGF5T2ZZZWFyKHllYXIsIG1vbnRoLCBkYXkpO1xyXG5cclxuXHQvLyBjaGVjayBlbmQtb2YteWVhciBjb3JuZXIgY2FzZTogbWF5IGJlIHdlZWsgMSBvZiBuZXh0IHllYXJcclxuXHRpZiAoZG95ID49IGRheU9mWWVhcih5ZWFyLCAxMiwgMjkpKSB7XHJcblx0XHR2YXIgbmV4dFllYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyICsgMSk7XHJcblx0XHRpZiAobmV4dFllYXJXZWVrT25lID4gNCAmJiBuZXh0WWVhcldlZWtPbmUgPD0gZG95KSB7XHJcblx0XHRcdHJldHVybiAxO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gY2hlY2sgYmVnaW5uaW5nLW9mLXllYXIgY29ybmVyIGNhc2VcclxuXHR2YXIgdGhpc1llYXJXZWVrT25lID0gZ2V0V2Vla09uZURheU9mWWVhcih5ZWFyKTtcclxuXHRpZiAodGhpc1llYXJXZWVrT25lID4gNCkge1xyXG5cdFx0Ly8gd2VlayAxIGlzIGF0IGVuZCBvZiBsYXN0IHllYXJcclxuXHRcdHZhciB3ZWVrVHdvID0gdGhpc1llYXJXZWVrT25lICsgNyAtIGRheXNJblllYXIoeWVhciAtIDEpO1xyXG5cdFx0aWYgKGRveSA8IHdlZWtUd28pIHtcclxuXHRcdFx0cmV0dXJuIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcigoZG95IC0gd2Vla1R3bykgLyA3KSArIDI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyBXZWVrIDEgaXMgZW50aXJlbHkgaW5zaWRlIHRoaXMgeWVhci5cclxuXHRpZiAoZG95IDwgdGhpc1llYXJXZWVrT25lKSB7XHJcblx0XHQvLyBUaGUgZGF0ZSBpcyBwYXJ0IG9mIHRoZSBsYXN0IHdlZWsgb2YgcHJldiB5ZWFyLlxyXG5cdFx0cmV0dXJuIHdlZWtOdW1iZXIoeWVhciAtIDEsIDEyLCAzMSk7XHJcblx0fVxyXG5cclxuXHQvLyBub3JtYWwgY2FzZXM7IG5vdGUgdGhhdCB3ZWVrIG51bWJlcnMgc3RhcnQgZnJvbSAxIHNvICsxXHJcblx0cmV0dXJuIE1hdGguZmxvb3IoKGRveSAtIHRoaXNZZWFyV2Vla09uZSkgLyA3KSArIDE7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBhc3NlcnRVbml4VGltZXN0YW1wKHVuaXhNaWxsaXM6IG51bWJlcik6IHZvaWQge1xyXG5cdGFzc2VydCh0eXBlb2YgKHVuaXhNaWxsaXMpID09PSBcIm51bWJlclwiLCBcIm51bWJlciBpbnB1dCBleHBlY3RlZFwiKTtcclxuXHRhc3NlcnQoIWlzTmFOKHVuaXhNaWxsaXMpLCBcIk5hTiBub3QgZXhwZWN0ZWQgYXMgaW5wdXRcIik7XHJcblx0YXNzZXJ0KG1hdGguaXNJbnQodW5peE1pbGxpcyksIFwiRXhwZWN0IGludGVnZXIgbnVtYmVyIGZvciB1bml4IFVUQyB0aW1lc3RhbXBcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IGEgdW5peCBtaWxsaSB0aW1lc3RhbXAgaW50byBhIFRpbWVUIHN0cnVjdHVyZS5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpczogbnVtYmVyKTogVGltZVN0cnVjdCB7XHJcblx0YXNzZXJ0VW5peFRpbWVzdGFtcCh1bml4TWlsbGlzKTtcclxuXHJcblx0dmFyIHRlbXA6IG51bWJlciA9IHVuaXhNaWxsaXM7XHJcblx0dmFyIHJlc3VsdDogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KCk7XHJcblx0dmFyIHllYXI6IG51bWJlcjtcclxuXHR2YXIgbW9udGg6IG51bWJlcjtcclxuXHJcblx0aWYgKHVuaXhNaWxsaXMgPj0gMCkge1xyXG5cdFx0cmVzdWx0Lm1pbGxpID0gdGVtcCAlIDEwMDA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gdGVtcCAlIDYwO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5taW51dGUgPSB0ZW1wICUgNjA7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0LmhvdXIgPSB0ZW1wICUgMjQ7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTcwO1xyXG5cdFx0d2hpbGUgKHRlbXAgPj0gZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wIC09IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXIrKztcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDE7XHJcblx0XHR3aGlsZSAodGVtcCA+PSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkpIHtcclxuXHRcdFx0dGVtcCAtPSBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0XHRcdG1vbnRoKys7XHJcblx0XHR9XHJcblx0XHRyZXN1bHQubW9udGggPSBtb250aDtcclxuXHRcdHJlc3VsdC5kYXkgPSB0ZW1wICsgMTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gTm90ZSB0aGF0IGEgbmVnYXRpdmUgbnVtYmVyIG1vZHVsbyBzb21ldGhpbmcgeWllbGRzIGEgbmVnYXRpdmUgbnVtYmVyLlxyXG5cdFx0Ly8gV2UgbWFrZSBpdCBwb3NpdGl2ZSBieSBhZGRpbmcgdGhlIG1vZHVsby5cclxuXHRcdHJlc3VsdC5taWxsaSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgMTAwMCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMTAwMCk7XHJcblx0XHRyZXN1bHQuc2Vjb25kID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCA2MCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gNjApO1xyXG5cdFx0cmVzdWx0Lm1pbnV0ZSA9IG1hdGgucG9zaXRpdmVNb2R1bG8odGVtcCwgNjApO1xyXG5cdFx0dGVtcCA9IE1hdGguZmxvb3IodGVtcCAvIDYwKTtcclxuXHRcdHJlc3VsdC5ob3VyID0gbWF0aC5wb3NpdGl2ZU1vZHVsbyh0ZW1wLCAyNCk7XHJcblx0XHR0ZW1wID0gTWF0aC5mbG9vcih0ZW1wIC8gMjQpO1xyXG5cclxuXHRcdHllYXIgPSAxOTY5O1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luWWVhcih5ZWFyKSkge1xyXG5cdFx0XHR0ZW1wICs9IGRheXNJblllYXIoeWVhcik7XHJcblx0XHRcdHllYXItLTtcclxuXHRcdH1cclxuXHRcdHJlc3VsdC55ZWFyID0geWVhcjtcclxuXHJcblx0XHRtb250aCA9IDEyO1xyXG5cdFx0d2hpbGUgKHRlbXAgPCAtZGF5c0luTW9udGgoeWVhciwgbW9udGgpKSB7XHJcblx0XHRcdHRlbXAgKz0gZGF5c0luTW9udGgoeWVhciwgbW9udGgpO1xyXG5cdFx0XHRtb250aC0tO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0Lm1vbnRoID0gbW9udGg7XHJcblx0XHRyZXN1bHQuZGF5ID0gdGVtcCArIDEgKyBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vKipcclxuICogQ29udmVydCBhIHllYXIsIG1vbnRoLCBkYXkgZXRjIGludG8gYSB1bml4IG1pbGxpIHRpbWVzdGFtcC5cclxuICogVGhpcyBkb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcbiAqXHJcbiAqIEBwYXJhbSB5ZWFyXHRZZWFyIGUuZy4gMTk3MFxyXG4gKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuICogQHBhcmFtIGRheVx0RGF5IDEtMzFcclxuICogQHBhcmFtIGhvdXJcdEhvdXIgMC0yM1xyXG4gKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG4gKiBAcGFyYW0gc2Vjb25kXHRTZWNvbmQgMC01OSAobm8gbGVhcCBzZWNvbmRzKVxyXG4gKiBAcGFyYW0gbWlsbGlcdE1pbGxpc2Vjb25kIDAtOTk5XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGltZVRvVW5peE5vTGVhcFNlY3MoXHJcblx0eWVhcj86IG51bWJlciwgbW9udGg/OiBudW1iZXIsIGRheT86IG51bWJlcixcclxuXHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGk/OiBudW1iZXIpOiBudW1iZXI7XHJcblxyXG4vKipcclxuICogQ29udmVydCBhIFRpbWVUIHN0cnVjdHVyZSBpbnRvIGEgdW5peCBtaWxsaSB0aW1lc3RhbXAuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKHRtOiBUaW1lU3RydWN0KTogbnVtYmVyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVUb1VuaXhOb0xlYXBTZWNzKFxyXG5cdGE6IGFueSA9IDE5NzAsIG1vbnRoOiBudW1iZXIgPSAxLCBkYXk6IG51bWJlciA9IDEsXHJcblx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsIG1pbGxpOiBudW1iZXIgPSAwKTogbnVtYmVyIHtcclxuXHRhc3NlcnQodHlwZW9mIChhKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgKGEpID09PSBcIm51bWJlclwiLCBcIlBsZWFzZSBnaXZlIGVpdGhlciBhIFRpbWVTdHJ1Y3Qgb3IgYSBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnQuXCIpO1xyXG5cclxuXHRpZiAodHlwZW9mIChhKSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0dmFyIHRtOiBUaW1lU3RydWN0ID0gPFRpbWVTdHJ1Y3Q+YTtcclxuXHRcdGFzc2VydCh0bS52YWxpZGF0ZSgpLCBcInRtIGludmFsaWRcIik7XHJcblx0XHRyZXR1cm4gdGltZVRvVW5peE5vTGVhcFNlY3ModG0ueWVhciwgdG0ubW9udGgsIHRtLmRheSwgdG0uaG91ciwgdG0ubWludXRlLCB0bS5zZWNvbmQsIHRtLm1pbGxpKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dmFyIHllYXI6IG51bWJlciA9IDxudW1iZXI+IGE7XHJcblx0XHRhc3NlcnQobW9udGggPj0gMSAmJiBtb250aCA8PSAxMiwgXCJNb250aCBvdXQgb2YgcmFuZ2VcIik7XHJcblx0XHRhc3NlcnQoZGF5ID49IDEgJiYgZGF5IDw9IGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSwgXCJkYXkgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0YXNzZXJ0KGhvdXIgPj0gMCAmJiBob3VyIDw9IDIzLCBcImhvdXIgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0YXNzZXJ0KG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8PSA1OSwgXCJtaW51dGUgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0YXNzZXJ0KHNlY29uZCA+PSAwICYmIHNlY29uZCA8PSA1OSwgXCJzZWNvbmQgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0YXNzZXJ0KG1pbGxpID49IDAgJiYgbWlsbGkgPD0gOTk5LCBcIm1pbGxpIG91dCBvZiByYW5nZVwiKTtcclxuXHRcdHJldHVybiBtaWxsaSArIDEwMDAgKiAoXHJcblx0XHRcdHNlY29uZCArIG1pbnV0ZSAqIDYwICsgaG91ciAqIDM2MDAgKyBkYXlPZlllYXIoeWVhciwgbW9udGgsIGRheSkgKiA4NjQwMCArXHJcblx0XHRcdCh5ZWFyIC0gMTk3MCkgKiAzMTUzNjAwMCArIE1hdGguZmxvb3IoKHllYXIgLSAxOTY5KSAvIDQpICogODY0MDAgLVxyXG5cdFx0XHRNYXRoLmZsb29yKCh5ZWFyIC0gMTkwMSkgLyAxMDApICogODY0MDAgKyBNYXRoLmZsb29yKCh5ZWFyIC0gMTkwMCArIDI5OSkgLyA0MDApICogODY0MDApO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybiB0aGUgZGF5LW9mLXdlZWsuXHJcbiAqIFRoaXMgZG9lcyBOT1QgdGFrZSBsZWFwIHNlY29uZHMgaW50byBhY2NvdW50LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHdlZWtEYXlOb0xlYXBTZWNzKHVuaXhNaWxsaXM6IG51bWJlcik6IFdlZWtEYXkge1xyXG5cdGFzc2VydFVuaXhUaW1lc3RhbXAodW5peE1pbGxpcyk7XHJcblxyXG5cdHZhciBlcG9jaERheTogV2Vla0RheSA9IFdlZWtEYXkuVGh1cnNkYXk7XHJcblx0dmFyIGRheXMgPSBNYXRoLmZsb29yKHVuaXhNaWxsaXMgLyAxMDAwIC8gODY0MDApO1xyXG5cdHJldHVybiAoZXBvY2hEYXkgKyBkYXlzKSAlIDc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOLXRoIHNlY29uZCBpbiB0aGUgZGF5LCBjb3VudGluZyBmcm9tIDBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzZWNvbmRPZkRheShob3VyOiBudW1iZXIsIG1pbnV0ZTogbnVtYmVyLCBzZWNvbmQ6IG51bWJlcik6IG51bWJlciB7XHJcblx0cmV0dXJuICgoKGhvdXIgKiA2MCkgKyBtaW51dGUpICogNjApICsgc2Vjb25kO1xyXG59XHJcblxyXG4vKipcclxuICogQmFzaWMgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIGFuZCB0aW1lXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGltZVN0cnVjdCB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIFRpbWVTdHJ1Y3QgZnJvbSBhIG51bWJlciBvZiB1bml4IG1pbGxpc2Vjb25kc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbVVuaXgodW5peE1pbGxpczogbnVtYmVyKTogVGltZVN0cnVjdCB7XHJcblx0XHRyZXR1cm4gdW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBUaW1lU3RydWN0IGZyb20gYSBKYXZhU2NyaXB0IGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkXHRUaGUgZGF0ZVxyXG5cdCAqIEBwYXJhbSBkZlx0V2hpY2ggZnVuY3Rpb25zIHRvIHRha2UgKGdldFgoKSBvciBnZXRVVENYKCkpXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tRGF0ZShkOiBEYXRlLCBkZjogRGF0ZUZ1bmN0aW9ucyk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0aWYgKGRmID09PSBEYXRlRnVuY3Rpb25zLkdldCkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCkgKyAxLCBkLmdldERhdGUoKSxcclxuXHRcdFx0XHRkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpLCBkLmdldFNlY29uZHMoKSwgZC5nZXRNaWxsaXNlY29uZHMoKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QoZC5nZXRVVENGdWxsWWVhcigpLCBkLmdldFVUQ01vbnRoKCkgKyAxLCBkLmdldFVUQ0RhdGUoKSxcclxuXHRcdFx0XHRkLmdldFVUQ0hvdXJzKCksIGQuZ2V0VVRDTWludXRlcygpLCBkLmdldFVUQ1NlY29uZHMoKSwgZC5nZXRVVENNaWxsaXNlY29uZHMoKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgVGltZVN0cnVjdCBmcm9tIGFuIElTTyA4NjAxIHN0cmluZyBXSVRIT1VUIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZyhzOiBzdHJpbmcpOiBUaW1lU3RydWN0IHtcclxuXHRcdHRyeSB7XHJcblx0XHRcdHZhciB5ZWFyOiBudW1iZXIgPSAxOTcwO1xyXG5cdFx0XHR2YXIgbW9udGg6IG51bWJlciA9IDE7XHJcblx0XHRcdHZhciBkYXk6IG51bWJlciA9IDE7XHJcblx0XHRcdHZhciBob3VyOiBudW1iZXIgPSAwO1xyXG5cdFx0XHR2YXIgbWludXRlOiBudW1iZXIgPSAwO1xyXG5cdFx0XHR2YXIgc2Vjb25kOiBudW1iZXIgPSAwO1xyXG5cdFx0XHR2YXIgZnJhY3Rpb25NaWxsaXM6IG51bWJlciA9IDA7XHJcblx0XHRcdHZhciBsYXN0VW5pdDogVGltZVVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cclxuXHRcdFx0Ly8gc2VwYXJhdGUgYW55IGZyYWN0aW9uYWwgcGFydFxyXG5cdFx0XHR2YXIgc3BsaXQ6IHN0cmluZ1tdID0gcy50cmltKCkuc3BsaXQoXCIuXCIpO1xyXG5cdFx0XHRhc3NlcnQoc3BsaXQubGVuZ3RoID49IDEgJiYgc3BsaXQubGVuZ3RoIDw9IDIsIFwiRW1wdHkgc3RyaW5nIG9yIG11bHRpcGxlIGRvdHMuXCIpO1xyXG5cclxuXHRcdFx0Ly8gcGFyc2UgbWFpbiBwYXJ0XHJcblx0XHRcdHZhciBpc0Jhc2ljRm9ybWF0ID0gKHMuaW5kZXhPZihcIi1cIikgPT09IC0xKTtcclxuXHRcdFx0aWYgKGlzQmFzaWNGb3JtYXQpIHtcclxuXHRcdFx0XHRhc3NlcnQoc3BsaXRbMF0ubWF0Y2goL14oKFxcZCkrKXwoXFxkXFxkXFxkXFxkXFxkXFxkXFxkXFxkVChcXGQpKykkLyksXHJcblx0XHRcdFx0XHRcIklTTyBzdHJpbmcgaW4gYmFzaWMgbm90YXRpb24gbWF5IG9ubHkgY29udGFpbiBudW1iZXJzIGJlZm9yZSB0aGUgZnJhY3Rpb25hbCBwYXJ0XCIpO1xyXG5cclxuXHRcdFx0XHQvLyByZW1vdmUgYW55IFwiVFwiIHNlcGFyYXRvclxyXG5cdFx0XHRcdHNwbGl0WzBdID0gc3BsaXRbMF0ucmVwbGFjZShcIlRcIiwgXCJcIik7XHJcblxyXG5cdFx0XHRcdGFzc2VydChbNCwgOCwgMTAsIDEyLCAxNF0uaW5kZXhPZihzcGxpdFswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChzcGxpdFswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDgpIHtcclxuXHRcdFx0XHRcdG1vbnRoID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDQsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRkYXkgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoNiwgMiksIDEwKTsgLy8gbm90ZSB0aGF0IFlZWVlNTSBmb3JtYXQgaXMgZGlzYWxsb3dlZCBzbyBpZiBtb250aCBpcyBwcmVzZW50LCBkYXkgaXMgdG9vXHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LkRheTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxMCkge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KHNwbGl0WzBdLnN1YnN0cig4LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc3BsaXRbMF0ubGVuZ3RoID49IDEyKSB7XHJcblx0XHRcdFx0XHRtaW51dGUgPSBwYXJzZUludChzcGxpdFswXS5zdWJzdHIoMTAsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHNwbGl0WzBdLmxlbmd0aCA+PSAxNCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoc3BsaXRbMF0uc3Vic3RyKDEyLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGFzc2VydChzcGxpdFswXS5tYXRjaCgvXlxcZFxcZFxcZFxcZCgtXFxkXFxkLVxcZFxcZCgoVCk/XFxkXFxkKFxcOlxcZFxcZCg6XFxkXFxkKT8pPyk/KT8kLyksIFwiSW52YWxpZCBJU08gc3RyaW5nXCIpO1xyXG5cdFx0XHRcdHZhciBkYXRlQW5kVGltZTogc3RyaW5nW10gPSBbXTtcclxuXHRcdFx0XHRpZiAocy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gc3BsaXRbMF0uc3BsaXQoXCJUXCIpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAocy5sZW5ndGggPiAxMCkge1xyXG5cdFx0XHRcdFx0ZGF0ZUFuZFRpbWUgPSBbc3BsaXRbMF0uc3Vic3RyKDAsIDEwKSwgc3BsaXRbMF0uc3Vic3RyKDEwKV07XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGRhdGVBbmRUaW1lID0gW3NwbGl0WzBdLCBcIlwiXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YXNzZXJ0KFs0LCAxMF0uaW5kZXhPZihkYXRlQW5kVGltZVswXS5sZW5ndGgpICE9PSAtMSxcclxuXHRcdFx0XHRcdFwiUGFkZGluZyBvciByZXF1aXJlZCBjb21wb25lbnRzIGFyZSBtaXNzaW5nLiBOb3RlIHRoYXQgWVlZWU1NIGlzIG5vdCB2YWxpZCBwZXIgSVNPIDg2MDFcIik7XHJcblxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVswXS5sZW5ndGggPj0gNCkge1xyXG5cdFx0XHRcdFx0eWVhciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cigwLCA0KSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5ZZWFyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMF0ubGVuZ3RoID49IDEwKSB7XHJcblx0XHRcdFx0XHRtb250aCA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzBdLnN1YnN0cig1LCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0ZGF5ID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMF0uc3Vic3RyKDgsIDIpLCAxMCk7IC8vIG5vdGUgdGhhdCBZWVlZTU0gZm9ybWF0IGlzIGRpc2FsbG93ZWQgc28gaWYgbW9udGggaXMgcHJlc2VudCwgZGF5IGlzIHRvb1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5EYXk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gMikge1xyXG5cdFx0XHRcdFx0aG91ciA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigwLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5Ib3VyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGF0ZUFuZFRpbWVbMV0ubGVuZ3RoID49IDUpIHtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IHBhcnNlSW50KGRhdGVBbmRUaW1lWzFdLnN1YnN0cigzLCAyKSwgMTApO1xyXG5cdFx0XHRcdFx0bGFzdFVuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChkYXRlQW5kVGltZVsxXS5sZW5ndGggPj0gOCkge1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gcGFyc2VJbnQoZGF0ZUFuZFRpbWVbMV0uc3Vic3RyKDYsIDIpLCAxMCk7XHJcblx0XHRcdFx0XHRsYXN0VW5pdCA9IFRpbWVVbml0LlNlY29uZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHBhcnNlIGZyYWN0aW9uYWwgcGFydFxyXG5cdFx0XHRpZiAoc3BsaXQubGVuZ3RoID4gMSAmJiBzcGxpdFsxXS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0dmFyIGZyYWN0aW9uOiBudW1iZXIgPSBwYXJzZUZsb2F0KFwiMC5cIiArIHNwbGl0WzFdKTtcclxuXHRcdFx0XHRzd2l0Y2ggKGxhc3RVbml0KSB7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRcdFx0ZnJhY3Rpb25NaWxsaXMgPSBkYXlzSW5ZZWFyKHllYXIpICogODY0MDAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDg2NDAwMDAwICogZnJhY3Rpb247XHJcblx0XHRcdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gMzYwMDAwMCAqIGZyYWN0aW9uO1xyXG5cdFx0XHRcdFx0fSBicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XHJcblx0XHRcdFx0XHRcdGZyYWN0aW9uTWlsbGlzID0gNjAwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDoge1xyXG5cdFx0XHRcdFx0XHRmcmFjdGlvbk1pbGxpcyA9IDEwMDAgKiBmcmFjdGlvbjtcclxuXHRcdFx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBjb21iaW5lIG1haW4gYW5kIGZyYWN0aW9uYWwgcGFydFxyXG5cdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuXHRcdFx0bW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuXHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG5cdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuXHRcdFx0bWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG5cdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcblx0XHRcdHZhciB1bml4TWlsbGlzOiBudW1iZXIgPSB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCk7XHJcblx0XHRcdHVuaXhNaWxsaXMgPSBtYXRoLnJvdW5kU3ltKHVuaXhNaWxsaXMgKyBmcmFjdGlvbk1pbGxpcyk7XHJcblx0XHRcdHJldHVybiB1bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBJU08gODYwMSBzdHJpbmc6IFxcXCJcIiArIHMgKyBcIlxcXCI6IFwiICsgZS5tZXNzYWdlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhclx0WWVhciBlLmcuIDE5NzBcclxuXHQgKiBAcGFyYW0gbW9udGhcdE1vbnRoIDEtMTJcclxuXHQgKiBAcGFyYW0gZGF5XHREYXkgMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyXHRIb3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlXHRNaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFNlY29uZCAwLTU5IChubyBsZWFwIHNlY29uZHMpXHJcblx0ICogQHBhcmFtIG1pbGxpXHRNaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBZZWFyLCAxOTcwLS4uLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgeWVhcjogbnVtYmVyID0gMTk3MCxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE1vbnRoIDEtMTJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG1vbnRoOiBudW1iZXIgPSAxLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRGF5IG9mIG1vbnRoLCAxLTMxXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBkYXk6IG51bWJlciA9IDEsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBIb3VyIDAtMjNcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGhvdXI6IG51bWJlciA9IDAsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBNaW51dGUgMC01OVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbWludXRlOiBudW1iZXIgPSAwLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2Vjb25kcywgMC01OVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgc2Vjb25kOiBudW1iZXIgPSAwLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTWlsbGlzZWNvbmRzIDAtOTk5XHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBtaWxsaTogbnVtYmVyID0gMFxyXG5cdFx0KSB7XHJcblx0XHRhc3NlcnQodGhpcy52YWxpZGF0ZSgpLCBcIkludmFsaWQgYXJndW1lbnRzOiBcIiArIHRoaXMudG9TdHJpbmcoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBWYWxpZGF0ZSBhIFRpbWVTdHJ1Y3QsIHJldHVybnMgZmFsc2UgaWYgaW52YWxpZC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdmFsaWRhdGUoKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHR5cGVvZiAodGhpcy55ZWFyKSA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4odGhpcy55ZWFyKSAmJiBtYXRoLmlzSW50KHRoaXMueWVhcikgJiYgdGhpcy55ZWFyID49IC0xMDAwMCAmJiB0aGlzLnllYXIgPCAxMDAwMFxyXG5cdFx0XHQmJiB0eXBlb2YgKHRoaXMubW9udGgpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLm1vbnRoKSAmJiBtYXRoLmlzSW50KHRoaXMubW9udGgpICYmIHRoaXMubW9udGggPj0gMSAmJiB0aGlzLm1vbnRoIDw9IDEyXHJcblx0XHRcdCYmIHR5cGVvZiAodGhpcy5kYXkpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLmRheSkgJiYgbWF0aC5pc0ludCh0aGlzLmRheSkgJiYgdGhpcy5kYXkgPj0gMVxyXG5cdFx0XHQmJiB0aGlzLmRheSA8PSBkYXlzSW5Nb250aCh0aGlzLnllYXIsIHRoaXMubW9udGgpXHJcblx0XHRcdCYmIHR5cGVvZiAodGhpcy5ob3VyKSA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4odGhpcy5ob3VyKSAmJiBtYXRoLmlzSW50KHRoaXMuaG91cikgJiYgdGhpcy5ob3VyID49IDAgJiYgdGhpcy5ob3VyIDw9IDIzXHJcblx0XHRcdCYmIHR5cGVvZiAodGhpcy5taW51dGUpID09PSBcIm51bWJlclwiICYmICFpc05hTih0aGlzLm1pbnV0ZSkgJiYgbWF0aC5pc0ludCh0aGlzLm1pbnV0ZSkgJiYgdGhpcy5taW51dGUgPj0gMCAmJiB0aGlzLm1pbnV0ZSA8PSA1OVxyXG5cdFx0XHQmJiB0eXBlb2YgKHRoaXMuc2Vjb25kKSA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4odGhpcy5zZWNvbmQpICYmIG1hdGguaXNJbnQodGhpcy5zZWNvbmQpICYmIHRoaXMuc2Vjb25kID49IDAgJiYgdGhpcy5zZWNvbmQgPD0gNTlcclxuXHRcdFx0JiYgdHlwZW9mICh0aGlzLm1pbGxpKSA9PT0gXCJudW1iZXJcIiAmJiAhaXNOYU4odGhpcy5taWxsaSkgJiYgbWF0aC5pc0ludCh0aGlzLm1pbGxpKSAmJiB0aGlzLm1pbGxpID49IDBcclxuXHRcdFx0JiYgdGhpcy5taWxsaSA8PSA5OTlcclxuXHRcdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkYXktb2YteWVhciAwLTM2NVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyRGF5KCk6IG51bWJlciB7XHJcblx0XHRhc3NlcnQodGhpcy52YWxpZGF0ZSgpLCBcIkludmFsaWQgVGltZVN0cnVjdCB2YWx1ZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkpO1xyXG5cdFx0cmV0dXJuIGRheU9mWWVhcih0aGlzLnllYXIsIHRoaXMubW9udGgsIHRoaXMuZGF5KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhpcyB0aW1lIGFzIGEgdW5peCBtaWxsaXNlY29uZCB0aW1lc3RhbXBcclxuXHQgKiBEb2VzIE5PVCB0YWtlIGxlYXAgc2Vjb25kcyBpbnRvIGFjY291bnQuXHJcblx0ICovXHJcblx0cHVibGljIHRvVW5peE5vTGVhcFNlY3MoKTogbnVtYmVyIHtcclxuXHRcdGFzc2VydCh0aGlzLnZhbGlkYXRlKCksIFwiSW52YWxpZCBUaW1lU3RydWN0IHZhbHVlOiBcIiArIHRoaXMudG9TdHJpbmcoKSk7XHJcblx0XHRyZXR1cm4gdGltZVRvVW5peE5vTGVhcFNlY3ModGhpcy55ZWFyLCB0aGlzLm1vbnRoLCB0aGlzLmRheSwgdGhpcy5ob3VyLCB0aGlzLm1pbnV0ZSwgdGhpcy5zZWNvbmQsIHRoaXMubWlsbGkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRGVlcCBlcXVhbHNcclxuXHQgKi9cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBUaW1lU3RydWN0KTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMueWVhciA9PT0gb3RoZXIueWVhclxyXG5cdFx0XHQmJiB0aGlzLm1vbnRoID09PSBvdGhlci5tb250aFxyXG5cdFx0XHQmJiB0aGlzLmRheSA9PT0gb3RoZXIuZGF5XHJcblx0XHRcdCYmIHRoaXMuaG91ciA9PT0gb3RoZXIuaG91clxyXG5cdFx0XHQmJiB0aGlzLm1pbnV0ZSA9PT0gb3RoZXIubWludXRlXHJcblx0XHRcdCYmIHRoaXMuc2Vjb25kID09PSBvdGhlci5zZWNvbmRcclxuXHRcdFx0JiYgdGhpcy5taWxsaSA9PT0gb3RoZXIubWlsbGkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogPCBvcGVyYXRvclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzVGhhbihvdGhlcjogVGltZVN0cnVjdCk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICh0aGlzLnRvVW5peE5vTGVhcFNlY3MoKSA8IG90aGVyLnRvVW5peE5vTGVhcFNlY3MoKSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgY2xvbmUoKTogVGltZVN0cnVjdCB7XHJcblx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGhpcy55ZWFyLCB0aGlzLm1vbnRoLCB0aGlzLmRheSwgdGhpcy5ob3VyLCB0aGlzLm1pbnV0ZSwgdGhpcy5zZWNvbmQsIHRoaXMubWlsbGkpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHZhbHVlT2YoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0aGlzLnllYXIsIHRoaXMubW9udGgsIHRoaXMuZGF5LCB0aGlzLmhvdXIsIHRoaXMubWludXRlLCB0aGlzLnNlY29uZCwgdGhpcy5taWxsaSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJU08gODYwMSBzdHJpbmcgWVlZWS1NTS1ERFRoaDptbTpzcy5ubm5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBzdHJpbmdzLnBhZExlZnQodGhpcy55ZWFyLnRvU3RyaW5nKDEwKSwgNCwgXCIwXCIpXHJcblx0XHRcdCsgXCItXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5tb250aC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiLVwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMuZGF5LnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCJUXCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5ob3VyLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpXHJcblx0XHRcdCsgXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taW51dGUudG9TdHJpbmcoMTApLCAyLCBcIjBcIilcclxuXHRcdFx0KyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZC50b1N0cmluZygxMCksIDIsIFwiMFwiKVxyXG5cdFx0XHQrIFwiLlwiICsgc3RyaW5ncy5wYWRMZWZ0KHRoaXMubWlsbGkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1RpbWVTdHJ1Y3Q6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxufVxyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9