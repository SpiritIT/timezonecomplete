/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Date+time+timezone representation
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var basics = require("./basics");
var TimeStruct = basics.TimeStruct;
var TimeUnit = basics.TimeUnit;
var duration = require("./duration");
var Duration = duration.Duration;
var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;
var math = require("./math");
var timesource = require("./timesource");
var RealTimeSource = timesource.RealTimeSource;
var timezone = require("./timezone");
var NormalizeOption = timezone.NormalizeOption;
var TimeZone = timezone.TimeZone;
var TimeZoneKind = timezone.TimeZoneKind;
var format = require("./format");
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
    if (timeZone === void 0) { timeZone = TimeZone.utc(); }
    return DateTime.now(timeZone);
}
exports.now = now;
/**
 * DateTime class which is time zone-aware
 * and which can be mocked for testing purposes.
 */
var DateTime = (function () {
    /**
     * Constructor implementation, do not call
     */
    function DateTime(a1, a2, a3, h, m, s, ms, timeZone) {
        /**
         * Cached value for unixUtcMillis(). This is useful because valueOf() uses it and it is
         * likely to be called multiple times.
         */
        this._unixUtcMillisCache = null;
        switch (typeof (a1)) {
            case "number":
                {
                    if (a2 === undefined || a2 === null || a2 instanceof TimeZone) {
                        // unix timestamp constructor
                        assert(typeof (a1) === "number", "DateTime.DateTime(): expect unixTimestamp to be a number");
                        this._zone = (typeof (a2) === "object" && a2 instanceof TimeZone ? a2 : null);
                        var normalizedUnixTimestamp;
                        if (this._zone) {
                            normalizedUnixTimestamp = this._zone.normalizeZoneTime(math.roundSym(a1));
                        }
                        else {
                            normalizedUnixTimestamp = math.roundSym(a1);
                        }
                        this._zoneDate = TimeStruct.fromUnix(normalizedUnixTimestamp);
                        this._zoneDateToUtcDate();
                    }
                    else {
                        // year month day constructor
                        assert(typeof (a1) === "number", "DateTime.DateTime(): Expect year to be a number.");
                        assert(typeof (a2) === "number", "DateTime.DateTime(): Expect month to be a number.");
                        assert(typeof (a3) === "number", "DateTime.DateTime(): Expect day to be a number.");
                        var year = a1;
                        var month = a2;
                        var day = a3;
                        var hour = (typeof (h) === "number" ? h : 0);
                        var minute = (typeof (m) === "number" ? m : 0);
                        var second = (typeof (s) === "number" ? s : 0);
                        var millisecond = (typeof (ms) === "number" ? ms : 0);
                        assert(month > 0 && month < 13, "DateTime.DateTime(): month out of range.");
                        assert(day > 0 && day < 32, "DateTime.DateTime(): day out of range.");
                        assert(hour >= 0 && hour < 24, "DateTime.DateTime(): hour out of range.");
                        assert(minute >= 0 && minute < 60, "DateTime.DateTime(): minute out of range.");
                        assert(second >= 0 && second < 60, "DateTime.DateTime(): second out of range.");
                        assert(millisecond >= 0 && millisecond < 1000, "DateTime.DateTime(): millisecond out of range.");
                        year = math.roundSym(year);
                        month = math.roundSym(month);
                        day = math.roundSym(day);
                        hour = math.roundSym(hour);
                        minute = math.roundSym(minute);
                        second = math.roundSym(second);
                        millisecond = math.roundSym(millisecond);
                        this._zone = (typeof (timeZone) === "object" && timeZone instanceof TimeZone ? timeZone : null);
                        // normalize local time (remove non-existing local time)
                        if (this._zone) {
                            var localMillis = basics.timeToUnixNoLeapSecs(year, month, day, hour, minute, second, millisecond);
                            this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(localMillis));
                        }
                        else {
                            this._zoneDate = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                        }
                        this._zoneDateToUtcDate();
                    }
                }
                break;
            case "string":
                {
                    var givenString = a1.trim();
                    var ss = DateTime._splitDateFromTimeZone(givenString);
                    assert(ss.length === 2, "Invalid date string given: \"" + a1 + "\"");
                    if (a2 instanceof TimeZone) {
                        this._zone = (a2);
                    }
                    else {
                        this._zone = TimeZone.zone(ss[1]);
                    }
                    // use our own ISO parsing because that it platform independent
                    // (free of Date quirks)
                    this._zoneDate = TimeStruct.fromString(ss[0]);
                    if (this._zone) {
                        this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._zoneDate.toUnixNoLeapSecs()));
                    }
                    this._zoneDateToUtcDate();
                }
                break;
            case "object":
                {
                    assert(a1 instanceof Date, "DateTime.DateTime(): non-Date object passed as first argument");
                    assert(typeof (a2) === "number", "DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
                    assert(!a3 || a3 instanceof TimeZone, "DateTime.DateTime(): timeZone should be a TimeZone object.");
                    var d = (a1);
                    var dk = (a2);
                    this._zone = (a3 ? a3 : null);
                    this._zoneDate = TimeStruct.fromDate(d, dk);
                    if (this._zone) {
                        this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._zoneDate.toUnixNoLeapSecs()));
                    }
                    this._zoneDateToUtcDate();
                }
                break;
            case "undefined":
                {
                    // nothing given, make local datetime
                    this._zone = TimeZone.local();
                    this._utcDate = TimeStruct.fromDate(DateTime.timeSource.now(), 1 /* GetUTC */);
                    this._utcDateToZoneDate();
                }
                break;
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("DateTime.DateTime(): unexpected first argument type.");
                }
        }
    }
    /**
     * Current date+time in local time
     */
    DateTime.nowLocal = function () {
        var n = DateTime.timeSource.now();
        return new DateTime(n, 0 /* Get */, TimeZone.local());
    };
    /**
     * Current date+time in UTC time
     */
    DateTime.nowUtc = function () {
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc());
    };
    /**
     * Current date+time in the given time zone
     * @param timeZone	The desired time zone (optional, defaults to UTC).
     */
    DateTime.now = function (timeZone) {
        if (timeZone === void 0) { timeZone = TimeZone.utc(); }
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc()).toZone(timeZone);
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
        assert(typeof n === "number", "fromExcel(): first parameter must be a number");
        assert(!isNaN(n), "fromExcel(): first parameter must not be NaN");
        assert(isFinite(n), "fromExcel(): first parameter must not be NaN");
        var unixTimestamp = Math.round((n - 25569) * 24 * 60 * 60 * 1000);
        return new DateTime(unixTimestamp, timeZone);
    };
    /**
     * @return a copy of this object
     */
    DateTime.prototype.clone = function () {
        var result = new DateTime();
        result._utcDate = this._utcDate.clone();
        result._zoneDate = this._zoneDate.clone();
        result._unixUtcMillisCache = this._unixUtcMillisCache;
        result._zone = this._zone;
        return result;
    };
    /**
     * @return The time zone that the date is in. May be null for unaware dates.
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
        if (this.zone()) {
            return this.zone().abbreviationForUtc(this.utcYear(), this.utcMonth(), this.utcDay(), this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond(), dstDependent);
        }
        else {
            return "";
        }
    };
    /**
     * @return the offset w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
     */
    DateTime.prototype.offset = function () {
        return Math.round((this._zoneDate.toUnixNoLeapSecs() - this._utcDate.toUnixNoLeapSecs()) / 60000);
    };
    /**
     * @return The full year e.g. 2014
     */
    DateTime.prototype.year = function () {
        return this._zoneDate.year;
    };
    /**
     * @return The month 1-12 (note this deviates from JavaScript Date)
     */
    DateTime.prototype.month = function () {
        return this._zoneDate.month;
    };
    /**
     * @return The day of the month 1-31
     */
    DateTime.prototype.day = function () {
        return this._zoneDate.day;
    };
    /**
     * @return The hour 0-23
     */
    DateTime.prototype.hour = function () {
        return this._zoneDate.hour;
    };
    /**
     * @return the minutes 0-59
     */
    DateTime.prototype.minute = function () {
        return this._zoneDate.minute;
    };
    /**
     * @return the seconds 0-59
     */
    DateTime.prototype.second = function () {
        return this._zoneDate.second;
    };
    /**
     * @return the milliseconds 0-999
     */
    DateTime.prototype.millisecond = function () {
        return this._zoneDate.milli;
    };
    /**
     * @return the day-of-week (the enum values correspond to JavaScript
     * week day numbers)
     */
    DateTime.prototype.weekDay = function () {
        return basics.weekDayNoLeapSecs(this._zoneDate.toUnixNoLeapSecs());
    };
    /**
     * Returns the day number within the year: Jan 1st has number 0,
     * Jan 2nd has number 1 etc.
     *
     * @return the day-of-year [0-366]
     */
    DateTime.prototype.dayOfYear = function () {
        return basics.dayOfYear(this.year(), this.month(), this.day());
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
        if (this._unixUtcMillisCache === null) {
            this._unixUtcMillisCache = this._utcDate.toUnixNoLeapSecs();
        }
        return this._unixUtcMillisCache;
    };
    /**
     * @return The full year e.g. 2014
     */
    DateTime.prototype.utcYear = function () {
        return this._utcDate.year;
    };
    /**
     * @return The UTC month 1-12 (note this deviates from JavaScript Date)
     */
    DateTime.prototype.utcMonth = function () {
        return this._utcDate.month;
    };
    /**
     * @return The UTC day of the month 1-31
     */
    DateTime.prototype.utcDay = function () {
        return this._utcDate.day;
    };
    /**
     * @return The UTC hour 0-23
     */
    DateTime.prototype.utcHour = function () {
        return this._utcDate.hour;
    };
    /**
     * @return The UTC minutes 0-59
     */
    DateTime.prototype.utcMinute = function () {
        return this._utcDate.minute;
    };
    /**
     * @return The UTC seconds 0-59
     */
    DateTime.prototype.utcSecond = function () {
        return this._utcDate.second;
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
        return this._utcDate.milli;
    };
    /**
     * @return the UTC day-of-week (the enum values correspond to JavaScript
     * week day numbers)
     */
    DateTime.prototype.utcWeekDay = function () {
        return basics.weekDayNoLeapSecs(this._utcDate.toUnixNoLeapSecs());
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
            assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            if (this._zone.equals(zone)) {
                this._zone = zone; // still assign, because zones may be equal but not identical (UTC/GMT/+00)
            }
            else {
                this._zone = zone;
                this._utcDateToZoneDate();
            }
        }
        else {
            this._zone = null;
            this._utcDate = this._zoneDate.clone();
            this._unixUtcMillisCache = null;
        }
        return this;
    };
    /**
     * Returns this date converted to the given time zone.
     * Unaware dates can only be converted to unaware dates (clone)
     * Converting an unaware date to an aware date throws an exception. Use the constructor
     * if you really need to do that.
     *
     * @param zone	The new time zone. This may be null to create unaware date.
     * @return The converted date
     */
    DateTime.prototype.toZone = function (zone) {
        if (zone) {
            assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            // go from utc date to preserve it in the presence of DST
            var result = this.clone();
            result._zone = zone;
            if (!result._zone.equals(this._zone)) {
                result._utcDateToZoneDate();
            }
            return result;
        }
        else {
            return new DateTime(this._zoneDate.toUnixNoLeapSecs(), null);
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
        if (timeZone && !timeZone.equals(this.zone())) {
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
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            amount = (a1);
            u = unit;
        }
        var utcTm = this._addToTimeStruct(this._utcDate, amount, u);
        return new DateTime(utcTm.toUnixNoLeapSecs(), TimeZone.utc()).toZone(this._zone);
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
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            amount = (a1);
            u = unit;
        }
        var localTm = this._addToTimeStruct(this._zoneDate, amount, u);
        if (this._zone) {
            var direction = (amount >= 0 ? 0 /* Up */ : 1 /* Down */);
            var normalized = this._zone.normalizeZoneTime(localTm.toUnixNoLeapSecs(), direction);
            return new DateTime(normalized, this._zone);
        }
        else {
            return new DateTime(localTm.toUnixNoLeapSecs(), null);
        }
    };
    /**
     * Add an amount of time to the given time struct. Note: does not normalize.
     * Keeps lower unit fields the same where possible, clamps day to end-of-month if
     * necessary.
     */
    DateTime.prototype._addToTimeStruct = function (tm, amount, unit) {
        var targetYear;
        var targetMonth;
        var targetDay;
        var targetHours;
        var targetMinutes;
        var targetSeconds;
        var targetMilliseconds;
        switch (unit) {
            case 0 /* Millisecond */: {
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount));
            }
            case 1 /* Second */: {
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 1000));
            }
            case 2 /* Minute */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 60000));
            }
            case 3 /* Hour */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 3600000));
            }
            case 4 /* Day */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 86400000));
            }
            case 5 /* Week */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 7 * 86400000));
            }
            case 6 /* Month */: {
                assert(math.isInt(amount), "Cannot add/sub a non-integer amount of months");
                // keep the day-of-month the same (clamp to end-of-month)
                if (amount >= 0) {
                    targetYear = tm.year + Math.ceil((amount - (12 - tm.month)) / 12);
                    targetMonth = 1 + math.positiveModulo((tm.month - 1 + Math.floor(amount)), 12);
                }
                else {
                    targetYear = tm.year + Math.floor((amount + (tm.month - 1)) / 12);
                    targetMonth = 1 + math.positiveModulo((tm.month - 1 + Math.ceil(amount)), 12);
                }
                targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
                targetHours = tm.hour;
                targetMinutes = tm.minute;
                targetSeconds = tm.second;
                targetMilliseconds = tm.milli;
                return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
            }
            case 7 /* Year */: {
                assert(math.isInt(amount), "Cannot add/sub a non-integer amount of years");
                targetYear = tm.year + amount;
                targetMonth = tm.month;
                targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
                targetHours = tm.hour;
                targetMinutes = tm.minute;
                targetSeconds = tm.second;
                targetMilliseconds = tm.milli;
                return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
            }
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };
    DateTime.prototype.sub = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof Duration) {
            var duration = (a1);
            return this.add(duration.multiply(-1));
        }
        else {
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
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
        return new Duration(this._utcDate.toUnixNoLeapSecs() - other._utcDate.toUnixNoLeapSecs());
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
        return this._utcDate.toUnixNoLeapSecs() < other._utcDate.toUnixNoLeapSecs();
    };
    /**
     * @return True iff (this <= other)
     */
    DateTime.prototype.lessEqual = function (other) {
        return this._utcDate.toUnixNoLeapSecs() <= other._utcDate.toUnixNoLeapSecs();
    };
    /**
     * @return True iff this and other represent the same moment in time in UTC
     */
    DateTime.prototype.equals = function (other) {
        return this._utcDate.equals(other._utcDate);
    };
    /**
     * @return True iff this and other represent the same time and the same zone
     */
    DateTime.prototype.identical = function (other) {
        return (this._zoneDate.equals(other._zoneDate) && (this._zone === null) === (other._zone === null) && (this._zone === null || this._zone.identical(other._zone)));
    };
    /**
     * @return True iff this > other
     */
    DateTime.prototype.greaterThan = function (other) {
        return this._utcDate.toUnixNoLeapSecs() > other._utcDate.toUnixNoLeapSecs();
    };
    /**
     * @return True iff this >= other
     */
    DateTime.prototype.greaterEqual = function (other) {
        return this._utcDate.toUnixNoLeapSecs() >= other._utcDate.toUnixNoLeapSecs();
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
        var s = this._zoneDate.toString();
        if (this._zone) {
            return s + TimeZone.offsetToString(this.offset()); // convert IANA name to offset
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
     * @return The string representation of this DateTime
     */
    DateTime.prototype.format = function (formatString) {
        return format.format(this._zoneDate, this._utcDate, this.zone(), formatString);
    };
    /**
     * Modified ISO 8601 format string with IANA name if applicable.
     * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
     */
    DateTime.prototype.toString = function () {
        var s = this._zoneDate.toString();
        if (this._zone) {
            if (this._zone.kind() !== 1 /* Offset */) {
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
        return this._utcDate.toString();
    };
    /**
     * Calculate this._zoneDate from this._utcDate
     */
    DateTime.prototype._utcDateToZoneDate = function () {
        this._unixUtcMillisCache = null;
        /* istanbul ignore else */
        if (this._zone) {
            var offset = this._zone.offsetForUtc(this._utcDate.year, this._utcDate.month, this._utcDate.day, this._utcDate.hour, this._utcDate.minute, this._utcDate.second, this._utcDate.milli);
            this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._utcDate.toUnixNoLeapSecs() + offset * 60000));
        }
        else {
            this._zoneDate = this._utcDate.clone();
        }
    };
    /**
     * Calculate this._utcDate from this._zoneDate
     */
    DateTime.prototype._zoneDateToUtcDate = function () {
        this._unixUtcMillisCache = null;
        if (this._zone) {
            var offset = this._zone.offsetForZone(this._zoneDate.year, this._zoneDate.month, this._zoneDate.day, this._zoneDate.hour, this._zoneDate.minute, this._zoneDate.second, this._zoneDate.milli);
            this._utcDate = TimeStruct.fromUnix(this._zoneDate.toUnixNoLeapSecs() - offset * 60000);
        }
        else {
            this._utcDate = this._zoneDate.clone();
        }
    };
    /**
     * Split a combined ISO datetime and timezone into datetime and timezone
     */
    DateTime._splitDateFromTimeZone = function (s) {
        var trimmed = s.trim();
        var result = ["", ""];
        var index = trimmed.lastIndexOf(" ");
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
    DateTime.timeSource = new RealTimeSource();
    return DateTime;
})();
exports.DateTime = DateTime;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRhdGV0aW1lLnRzIl0sIm5hbWVzIjpbIm5vd0xvY2FsIiwibm93VXRjIiwibm93IiwiRGF0ZVRpbWUiLCJEYXRlVGltZS5jb25zdHJ1Y3RvciIsIkRhdGVUaW1lLm5vd0xvY2FsIiwiRGF0ZVRpbWUubm93VXRjIiwiRGF0ZVRpbWUubm93IiwiRGF0ZVRpbWUuZnJvbUV4Y2VsIiwiRGF0ZVRpbWUuY2xvbmUiLCJEYXRlVGltZS56b25lIiwiRGF0ZVRpbWUuem9uZUFiYnJldmlhdGlvbiIsIkRhdGVUaW1lLm9mZnNldCIsIkRhdGVUaW1lLnllYXIiLCJEYXRlVGltZS5tb250aCIsIkRhdGVUaW1lLmRheSIsIkRhdGVUaW1lLmhvdXIiLCJEYXRlVGltZS5taW51dGUiLCJEYXRlVGltZS5zZWNvbmQiLCJEYXRlVGltZS5taWxsaXNlY29uZCIsIkRhdGVUaW1lLndlZWtEYXkiLCJEYXRlVGltZS5kYXlPZlllYXIiLCJEYXRlVGltZS53ZWVrTnVtYmVyIiwiRGF0ZVRpbWUud2Vla09mTW9udGgiLCJEYXRlVGltZS5zZWNvbmRPZkRheSIsIkRhdGVUaW1lLnVuaXhVdGNNaWxsaXMiLCJEYXRlVGltZS51dGNZZWFyIiwiRGF0ZVRpbWUudXRjTW9udGgiLCJEYXRlVGltZS51dGNEYXkiLCJEYXRlVGltZS51dGNIb3VyIiwiRGF0ZVRpbWUudXRjTWludXRlIiwiRGF0ZVRpbWUudXRjU2Vjb25kIiwiRGF0ZVRpbWUudXRjRGF5T2ZZZWFyIiwiRGF0ZVRpbWUudXRjTWlsbGlzZWNvbmQiLCJEYXRlVGltZS51dGNXZWVrRGF5IiwiRGF0ZVRpbWUudXRjV2Vla051bWJlciIsIkRhdGVUaW1lLnV0Y1dlZWtPZk1vbnRoIiwiRGF0ZVRpbWUudXRjU2Vjb25kT2ZEYXkiLCJEYXRlVGltZS53aXRoWm9uZSIsIkRhdGVUaW1lLmNvbnZlcnQiLCJEYXRlVGltZS50b1pvbmUiLCJEYXRlVGltZS50b0RhdGUiLCJEYXRlVGltZS50b0V4Y2VsIiwiRGF0ZVRpbWUudG9VdGNFeGNlbCIsIkRhdGVUaW1lLl91bml4VGltZVN0YW1wVG9FeGNlbCIsIkRhdGVUaW1lLmFkZCIsIkRhdGVUaW1lLmFkZExvY2FsIiwiRGF0ZVRpbWUuX2FkZFRvVGltZVN0cnVjdCIsIkRhdGVUaW1lLnN1YiIsIkRhdGVUaW1lLnN1YkxvY2FsIiwiRGF0ZVRpbWUuZGlmZiIsIkRhdGVUaW1lLnN0YXJ0T2ZEYXkiLCJEYXRlVGltZS5zdGFydE9mTW9udGgiLCJEYXRlVGltZS5zdGFydE9mWWVhciIsIkRhdGVUaW1lLmxlc3NUaGFuIiwiRGF0ZVRpbWUubGVzc0VxdWFsIiwiRGF0ZVRpbWUuZXF1YWxzIiwiRGF0ZVRpbWUuaWRlbnRpY2FsIiwiRGF0ZVRpbWUuZ3JlYXRlclRoYW4iLCJEYXRlVGltZS5ncmVhdGVyRXF1YWwiLCJEYXRlVGltZS5taW4iLCJEYXRlVGltZS5tYXgiLCJEYXRlVGltZS50b0lzb1N0cmluZyIsIkRhdGVUaW1lLmZvcm1hdCIsIkRhdGVUaW1lLnRvU3RyaW5nIiwiRGF0ZVRpbWUuaW5zcGVjdCIsIkRhdGVUaW1lLnZhbHVlT2YiLCJEYXRlVGltZS50b1V0Y1N0cmluZyIsIkRhdGVUaW1lLl91dGNEYXRlVG9ab25lRGF0ZSIsIkRhdGVUaW1lLl96b25lRGF0ZVRvVXRjRGF0ZSIsIkRhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFFYixJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUVsQyxJQUFPLE1BQU0sV0FBVyxVQUFVLENBQUMsQ0FBQztBQUVwQyxJQUFPLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3RDLElBQU8sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFFbEMsSUFBTyxRQUFRLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFDeEMsSUFBTyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUVwQyxJQUFPLFVBQVUsV0FBVyxj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QkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQzNFQSxDQUFDQTtZQUNEQSxLQUFLQSxjQUFlQSxFQUFFQSxDQUFDQTtnQkFDdEJBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEZBLENBQUNBO1lBQ0RBLEtBQUtBLGNBQWVBLEVBQUVBLENBQUNBO2dCQUN0QkEsQUFDQUEsdUVBRHVFQTtnQkFDdkVBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkZBLENBQUNBO1lBQ0RBLEtBQUtBLFlBQWFBLEVBQUVBLENBQUNBO2dCQUNwQkEsQUFDQUEsdUVBRHVFQTtnQkFDdkVBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLENBQUNBO1lBQ0RBLEtBQUtBLFdBQVlBLEVBQUVBLENBQUNBO2dCQUNuQkEsQUFDQUEsdUVBRHVFQTtnQkFDdkVBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEZBLENBQUNBO1lBQ0RBLEtBQUtBLFlBQWFBLEVBQUVBLENBQUNBO2dCQUNwQkEsQUFDQUEsdUVBRHVFQTtnQkFDdkVBLE1B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VUFBc0NBLENBQVNBO1FBQzlDbUUsSUFBSUEsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLElBQUlBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3RCQSxJQUFJQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0Q0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsS0FBS0EsR0FBR0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLEtBQUtBLEdBQUdBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUNEQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsd0NBQXdDQTtRQUNyREEsQ0FBQ0EsR0FEV0E7UUFFWkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDcEJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2ZBLENBQUNBO0lBaDlCRG5FOzs7O09BSUdBO0lBQ1dBLG1CQUFVQSxHQUFlQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtJQTQ4QjdEQSxlQUFDQTtBQUFEQSxDQTMrQkEsQUEyK0JDQSxJQUFBO0FBMytCWSxnQkFBUSxHQUFSLFFBMitCWixDQUFBIiwiZmlsZSI6ImxpYi9kYXRldGltZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19