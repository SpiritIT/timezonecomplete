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
                    this._utcDate = TimeStruct.fromDate(DateTime.timeSource.now(), DateFunctions.GetUTC);
                    this._utcDateToZoneDate();
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
    /**
     * Current date+time in local time
     */
    DateTime.nowLocal = function () {
        var n = DateTime.timeSource.now();
        return new DateTime(n, DateFunctions.Get, TimeZone.local());
    };
    /**
     * Current date+time in UTC time
     */
    DateTime.nowUtc = function () {
        return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc());
    };
    /**
     * Current date+time in the given time zone
     * @param timeZone	The desired time zone (optional, defaults to UTC).
     */
    DateTime.now = function (timeZone) {
        if (timeZone === void 0) { timeZone = TimeZone.utc(); }
        return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc()).toZone(timeZone);
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
            var direction = (amount >= 0 ? NormalizeOption.Up : NormalizeOption.Down);
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
            case TimeUnit.Millisecond: {
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount));
            }
            case TimeUnit.Second: {
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 1000));
            }
            case TimeUnit.Minute: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 60000));
            }
            case TimeUnit.Hour: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 3600000));
            }
            case TimeUnit.Day: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 86400000));
            }
            case TimeUnit.Week: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(math.roundSym(tm.toUnixNoLeapSecs() + amount * 7 * 86400000));
            }
            case TimeUnit.Month: {
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
            case TimeUnit.Year: {
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
        return (this._zoneDate.equals(other._zoneDate)
            && (this._zone === null) === (other._zone === null)
            && (this._zone === null || this._zone.identical(other._zone)));
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
            if (this._zone.kind() !== TimeZoneKind.Offset) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kYXRldGltZS50cyJdLCJuYW1lcyI6WyJub3dMb2NhbCIsIm5vd1V0YyIsIm5vdyIsIkRhdGVUaW1lIiwiRGF0ZVRpbWUuY29uc3RydWN0b3IiLCJEYXRlVGltZS5ub3dMb2NhbCIsIkRhdGVUaW1lLm5vd1V0YyIsIkRhdGVUaW1lLm5vdyIsIkRhdGVUaW1lLmZyb21FeGNlbCIsIkRhdGVUaW1lLmNsb25lIiwiRGF0ZVRpbWUuem9uZSIsIkRhdGVUaW1lLnpvbmVBYmJyZXZpYXRpb24iLCJEYXRlVGltZS5vZmZzZXQiLCJEYXRlVGltZS55ZWFyIiwiRGF0ZVRpbWUubW9udGgiLCJEYXRlVGltZS5kYXkiLCJEYXRlVGltZS5ob3VyIiwiRGF0ZVRpbWUubWludXRlIiwiRGF0ZVRpbWUuc2Vjb25kIiwiRGF0ZVRpbWUubWlsbGlzZWNvbmQiLCJEYXRlVGltZS53ZWVrRGF5IiwiRGF0ZVRpbWUuZGF5T2ZZZWFyIiwiRGF0ZVRpbWUud2Vla051bWJlciIsIkRhdGVUaW1lLndlZWtPZk1vbnRoIiwiRGF0ZVRpbWUuc2Vjb25kT2ZEYXkiLCJEYXRlVGltZS51bml4VXRjTWlsbGlzIiwiRGF0ZVRpbWUudXRjWWVhciIsIkRhdGVUaW1lLnV0Y01vbnRoIiwiRGF0ZVRpbWUudXRjRGF5IiwiRGF0ZVRpbWUudXRjSG91ciIsIkRhdGVUaW1lLnV0Y01pbnV0ZSIsIkRhdGVUaW1lLnV0Y1NlY29uZCIsIkRhdGVUaW1lLnV0Y0RheU9mWWVhciIsIkRhdGVUaW1lLnV0Y01pbGxpc2Vjb25kIiwiRGF0ZVRpbWUudXRjV2Vla0RheSIsIkRhdGVUaW1lLnV0Y1dlZWtOdW1iZXIiLCJEYXRlVGltZS51dGNXZWVrT2ZNb250aCIsIkRhdGVUaW1lLnV0Y1NlY29uZE9mRGF5IiwiRGF0ZVRpbWUud2l0aFpvbmUiLCJEYXRlVGltZS5jb252ZXJ0IiwiRGF0ZVRpbWUudG9ab25lIiwiRGF0ZVRpbWUudG9EYXRlIiwiRGF0ZVRpbWUudG9FeGNlbCIsIkRhdGVUaW1lLnRvVXRjRXhjZWwiLCJEYXRlVGltZS5fdW5peFRpbWVTdGFtcFRvRXhjZWwiLCJEYXRlVGltZS5hZGQiLCJEYXRlVGltZS5hZGRMb2NhbCIsIkRhdGVUaW1lLl9hZGRUb1RpbWVTdHJ1Y3QiLCJEYXRlVGltZS5zdWIiLCJEYXRlVGltZS5zdWJMb2NhbCIsIkRhdGVUaW1lLmRpZmYiLCJEYXRlVGltZS5zdGFydE9mRGF5IiwiRGF0ZVRpbWUuc3RhcnRPZk1vbnRoIiwiRGF0ZVRpbWUuc3RhcnRPZlllYXIiLCJEYXRlVGltZS5sZXNzVGhhbiIsIkRhdGVUaW1lLmxlc3NFcXVhbCIsIkRhdGVUaW1lLmVxdWFscyIsIkRhdGVUaW1lLmlkZW50aWNhbCIsIkRhdGVUaW1lLmdyZWF0ZXJUaGFuIiwiRGF0ZVRpbWUuZ3JlYXRlckVxdWFsIiwiRGF0ZVRpbWUubWluIiwiRGF0ZVRpbWUubWF4IiwiRGF0ZVRpbWUudG9Jc29TdHJpbmciLCJEYXRlVGltZS5mb3JtYXQiLCJEYXRlVGltZS50b1N0cmluZyIsIkRhdGVUaW1lLmluc3BlY3QiLCJEYXRlVGltZS52YWx1ZU9mIiwiRGF0ZVRpbWUudG9VdGNTdHJpbmciLCJEYXRlVGltZS5fdXRjRGF0ZVRvWm9uZURhdGUiLCJEYXRlVGltZS5fem9uZURhdGVUb1V0Y0RhdGUiLCJEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXBDLElBQU8sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDdEMsSUFBTyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUVsQyxJQUFPLFFBQVEsV0FBVyxZQUFZLENBQUMsQ0FBQztBQUN4QyxJQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBRXBDLElBQU8sVUFBVSxXQUFXLGNB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QSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzRUEsQ0FBQ0E7WUFDREEsS0FBS0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQ3RCQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtnQkFDdEJBLHVFQUF1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ25GQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLHVFQUF1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ3JGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDbkJBLHVFQUF1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLHVFQUF1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQzFGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDckJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLCtDQUErQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVFQSx5REFBeURBO2dCQUN6REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pCQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbEVBLFdBQVdBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO2dCQUNoRkEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNQQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbEVBLFdBQVdBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMvRUEsQ0FBQ0E7Z0JBQ0RBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxRUEsV0FBV0EsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQ3RCQSxhQUFhQSxHQUFHQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQTtnQkFDMUJBLGFBQWFBLEdBQUdBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBO2dCQUMxQkEsa0JBQWtCQSxHQUFHQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFDOUJBLE1BQU1BLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLFVBQVVBLEVBQUVBLFdBQVdBLEVBQUVBLFNBQVNBLEVBQUVBLFdBQVdBLEVBQUVBLGFBQWFBLEVBQUVBLGFBQWFBLEVBQUVBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7WUFDMUhBLENBQUNBO1lBQ0RBLEtBQUtBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO2dCQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsOENBQThDQSxDQUFDQSxDQUFDQTtnQkFDM0VBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBO2dCQUM5QkEsV0FBV0EsR0FBR0EsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ3ZCQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFH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Q0ZBLENBQUNBO0lBRURsRTs7T0FFR0E7SUFDWUEsK0JBQXNCQSxHQUFyQ0EsVUFBc0NBLENBQVNBO1FBQzlDbUUsSUFBSUEsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLElBQUlBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3RCQSxJQUFJQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0Q0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsS0FBS0EsR0FBR0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLEtBQUtBLEdBQUdBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ2xDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUNEQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0Esd0NBQXdDQTtRQUNyREEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDcEJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2ZBLENBQUNBO0lBaDlCRG5FOzs7O09BSUdBO0lBQ1dBLG1CQUFVQSxHQUFlQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtJQTQ4QjdEQSxlQUFDQTtBQUFEQSxDQTMrQkEsQUEyK0JDQSxJQUFBO0FBMytCWSxnQkFBUSxXQTIrQnBCLENBQUEiLCJmaWxlIjoibGliL2RhdGV0aW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBEYXRlK3RpbWUrdGltZXpvbmUgcmVwcmVzZW50YXRpb25cclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZC50c1wiLz5cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XHJcblxyXG5pbXBvcnQgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG5pbXBvcnQgV2Vla0RheSA9IGJhc2ljcy5XZWVrRGF5O1xyXG5pbXBvcnQgVGltZVN0cnVjdCA9IGJhc2ljcy5UaW1lU3RydWN0O1xyXG5pbXBvcnQgVGltZVVuaXQgPSBiYXNpY3MuVGltZVVuaXQ7XHJcblxyXG5pbXBvcnQgZHVyYXRpb24gPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxuaW1wb3J0IER1cmF0aW9uID0gZHVyYXRpb24uRHVyYXRpb247XHJcblxyXG5pbXBvcnQgamF2YXNjcmlwdCA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbmltcG9ydCBEYXRlRnVuY3Rpb25zID0gamF2YXNjcmlwdC5EYXRlRnVuY3Rpb25zO1xyXG5cclxuaW1wb3J0IG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xyXG5cclxuaW1wb3J0IHRpbWVzb3VyY2UgPSByZXF1aXJlKFwiLi90aW1lc291cmNlXCIpO1xyXG5pbXBvcnQgVGltZVNvdXJjZSA9IHRpbWVzb3VyY2UuVGltZVNvdXJjZTtcclxuaW1wb3J0IFJlYWxUaW1lU291cmNlID0gdGltZXNvdXJjZS5SZWFsVGltZVNvdXJjZTtcclxuXHJcbmltcG9ydCB0aW1lem9uZSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG5pbXBvcnQgTm9ybWFsaXplT3B0aW9uID0gdGltZXpvbmUuTm9ybWFsaXplT3B0aW9uO1xyXG5pbXBvcnQgVGltZVpvbmUgPSB0aW1lem9uZS5UaW1lWm9uZTtcclxuaW1wb3J0IFRpbWVab25lS2luZCA9IHRpbWV6b25lLlRpbWVab25lS2luZDtcclxuXHJcbmltcG9ydCBmb3JtYXQgPSByZXF1aXJlKFwiLi9mb3JtYXRcIik7XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93TG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRyZXR1cm4gRGF0ZVRpbWUubm93VXRjKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcbiAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3codGltZVpvbmU6IFRpbWVab25lID0gVGltZVpvbmUudXRjKCkpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vdyh0aW1lWm9uZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcclxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGF0ZVRpbWUge1xyXG5cclxuXHQvKipcclxuXHQgKiBEYXRlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXByZXNlbnRlZCBkYXRlIGNvbnZlcnRlZCB0byBVVEMgaW4gaXRzXHJcblx0ICogZ2V0VVRDWHh4KCkgZmllbGRzLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3V0Y0RhdGU6IFRpbWVTdHJ1Y3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhY2hlZCB2YWx1ZSBmb3IgdW5peFV0Y01pbGxpcygpLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIHZhbHVlT2YoKSB1c2VzIGl0IGFuZCBpdCBpc1xyXG5cdCAqIGxpa2VseSB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdW5peFV0Y01pbGxpc0NhY2hlOiBudW1iZXIgPSBudWxsO1xyXG5cclxuXHQvKipcclxuXHQgKiBEYXRlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXByZXNlbnRlZCBkYXRlIGNvbnZlcnRlZCB0byB0aGlzLl96b25lIGluIGl0c1xyXG5cdCAqIGdldFVUQ1h4eCgpIGZpZWxkcy4gTm90ZSB0aGF0IHRoZSBnZXRYeHgoKSBmaWVsZHMgYXJlIHVudXNhYmxlIGZvciB0aGlzIHB1cnBvc2VcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lRGF0ZTogVGltZVN0cnVjdDtcclxuXHJcblx0LyoqXHJcblx0ICogT3JpZ2luYWwgdGltZSB6b25lIHRoaXMgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgZm9yLlxyXG5cdCAqIENhbiBiZSBOVUxMIGZvciB1bmF3YXJlIHRpbWVzdGFtcHNcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lOiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogQWN0dWFsIHRpbWUgc291cmNlIGluIHVzZS4gU2V0dGluZyB0aGlzIHByb3BlcnR5IGFsbG93cyB0b1xyXG5cdCAqIGZha2UgdGltZSBpbiB0ZXN0cy4gRGF0ZVRpbWUubm93TG9jYWwoKSBhbmQgRGF0ZVRpbWUubm93VXRjKClcclxuXHQgKiB1c2UgdGhpcyBwcm9wZXJ0eSBmb3Igb2J0YWluaW5nIHRoZSBjdXJyZW50IHRpbWUuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB0aW1lU291cmNlOiBUaW1lU291cmNlID0gbmV3IFJlYWxUaW1lU291cmNlKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vd0xvY2FsKCk6IERhdGVUaW1lIHtcclxuXHRcdHZhciBuID0gRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobiwgRGF0ZUZ1bmN0aW9ucy5HZXQsIFRpbWVab25lLmxvY2FsKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gVVRDIHRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vd1V0YygpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDLCBUaW1lWm9uZS51dGMoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgZGVzaXJlZCB0aW1lIHpvbmUgKG9wdGlvbmFsLCBkZWZhdWx0cyB0byBVVEMpLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93KHRpbWVab25lOiBUaW1lWm9uZSA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aW1lWm9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYSBEYXRlVGltZSBmcm9tIGEgTG90dXMgMTIzIC8gTWljcm9zb2Z0IEV4Y2VsIGRhdGUtdGltZSB2YWx1ZVxyXG5cdCAqIGkuZS4gYSBkb3VibGUgcmVwcmVzZW50aW5nIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEBwYXJhbSBuIGV4Y2VsIGRhdGUvdGltZSBudW1iZXJcclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgVGltZSB6b25lIHRvIGFzc3VtZSB0aGF0IHRoZSBleGNlbCB2YWx1ZSBpcyBpblxyXG5cdCAqIEByZXR1cm5zIGEgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGZyb21FeGNlbChuOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRhc3NlcnQodHlwZW9mIG4gPT09IFwibnVtYmVyXCIsIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IGJlIGEgbnVtYmVyXCIpO1xyXG5cdFx0YXNzZXJ0KCFpc05hTihuKSwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3Qgbm90IGJlIE5hTlwiKTtcclxuXHRcdGFzc2VydChpc0Zpbml0ZShuKSwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3Qgbm90IGJlIE5hTlwiKTtcclxuXHRcdHZhciB1bml4VGltZXN0YW1wID0gTWF0aC5yb3VuZCgobiAtIDI1NTY5KSAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1bml4VGltZXN0YW1wLCB0aW1lWm9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gQ3JlYXRlcyBjdXJyZW50IHRpbWUgaW4gbG9jYWwgdGltZXpvbmUuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxyXG5cdCAqXHRcdCBpdCBtYXkgaW5jbHVkZSBhIHNwYWNlIGFuZCB0aGVuIGFuZCBJQU5BIHRpbWUgem9uZS5cclxuXHQgKiBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxyXG5cdCAqIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCswMTowMFwiXHRcdFx0XHQoVVRDIG9mZnNldCB3aXRob3V0IGRheWxpZ2h0IHNhdmluZyB0aW1lKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFpcIlx0XHRcdFx0XHQoVVRDKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0aWYgZ2l2ZW4sIHRoZSBkYXRlIGluIHRoZSBzdHJpbmcgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGlzIHRpbWUgem9uZS5cclxuXHQgKlx0XHRcdFx0XHROb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcclxuXHQgKlx0XHRcdFx0XHRmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoaXNvU3RyaW5nOiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBZb3UgcHJvdmlkZSBhIGRhdGUsIHRoZW4geW91IHNheSB3aGV0aGVyIHRvIHRha2UgdGhlXHJcblx0ICogZGF0ZS5nZXRZZWFyKCkvZ2V0WHh4IG1ldGhvZHMgb3IgdGhlIGRhdGUuZ2V0VVRDWWVhcigpL2RhdGUuZ2V0VVRDWHh4IG1ldGhvZHMsXHJcblx0ICogYW5kIHRoZW4geW91IHN0YXRlIHdoaWNoIHRpbWUgem9uZSB0aGF0IGRhdGUgaXMgaW4uXHJcblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXHJcblx0ICogTm90ZSB0aGF0IHRoZSBEYXRlIGNsYXNzIGhhcyBidWdzIGFuZCBpbmNvbnNpc3RlbmNpZXMgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlbSB3aXRoIHRpbWVzIGFyb3VuZFxyXG5cdCAqIERTVCBjaGFuZ2VzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGVcdEEgZGF0ZSBvYmplY3QuXHJcblx0ICogQHBhcmFtIGdldHRlcnNcdFNwZWNpZmllcyB3aGljaCBzZXQgb2YgRGF0ZSBnZXR0ZXJzIGNvbnRhaW5zIHRoZSBkYXRlIGluIHRoZSBnaXZlbiB0aW1lIHpvbmU6IHRoZVxyXG5cdCAqXHRcdFx0XHRcdERhdGUuZ2V0WHh4KCkgbWV0aG9kcyBvciB0aGUgRGF0ZS5nZXRVVENYeHgoKSBtZXRob2RzLlxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSB0aGF0IHRoZSBnaXZlbiBkYXRlIGlzIGFzc3VtZWQgdG8gYmUgaW4gKG1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGU6IERhdGUsIGdldEZ1bmNzOiBEYXRlRnVuY3Rpb25zLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gTm90ZSB0aGF0IHVubGlrZSBKYXZhU2NyaXB0IGRhdGVzIHdlIHJlcXVpcmUgZmllbGRzIHRvIGJlIGluIG5vcm1hbCByYW5nZXMuXHJcblx0ICogVXNlIHRoZSBhZGQoZHVyYXRpb24pIG9yIHN1YihkdXJhdGlvbikgZm9yIGFyaXRobWV0aWMuXHJcblx0ICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXIgKGUuZy4gMjAxNClcclxuXHQgKiBAcGFyYW0gbW9udGhcdFRoZSBtb250aCBbMS0xMl0gKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKiBAcGFyYW0gZGF5XHRUaGUgZGF5IG9mIHRoZSBtb250aCBbMS0zMV1cclxuXHQgKiBAcGFyYW0gaG91clx0VGhlIGhvdXIgb2YgdGhlIGRheSBbMC0yNClcclxuXHQgKiBAcGFyYW0gbWludXRlXHRUaGUgbWludXRlIG9mIHRoZSBob3VyIFswLTU5XVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFRoZSBzZWNvbmQgb2YgdGhlIG1pbnV0ZSBbMC01OV1cclxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmRcdFRoZSBtaWxsaXNlY29uZCBvZiB0aGUgc2Vjb25kIFswLTk5OV1cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSB0aW1lIHpvbmUsIG9yIG51bGwgKGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcixcclxuXHRcdGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaXNlY29uZD86IG51bWJlcixcclxuXHRcdHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHVuaXhUaW1lc3RhbXBcdG1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0dGhlIHRpbWUgem9uZSB0aGF0IHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBpbiAodXN1YWxseSBVVEMpLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLCBkbyBub3QgY2FsbFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0YTE/OiBhbnksIGEyPzogYW55LCBhMz86IGFueSxcclxuXHRcdGg/OiBudW1iZXIsIG0/OiBudW1iZXIsIHM/OiBudW1iZXIsIG1zPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBhbnkpIHtcclxuXHRcdHN3aXRjaCAodHlwZW9mIChhMSkpIHtcclxuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiB7XHJcblx0XHRcdFx0aWYgKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0Ly8gdW5peCB0aW1lc3RhbXAgY29uc3RydWN0b3JcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBleHBlY3QgdW5peFRpbWVzdGFtcCB0byBiZSBhIG51bWJlclwiKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IDxUaW1lWm9uZT5hMiA6IG51bGwpO1xyXG5cdFx0XHRcdFx0dmFyIG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wOiBudW1iZXI7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkVW5peFRpbWVzdGFtcCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobWF0aC5yb3VuZFN5bSg8bnVtYmVyPmExKSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkVW5peFRpbWVzdGFtcCA9IG1hdGgucm91bmRTeW0oPG51bWJlcj5hMSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgobm9ybWFsaXplZFVuaXhUaW1lc3RhbXApO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGVUb1V0Y0RhdGUoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8geWVhciBtb250aCBkYXkgY29uc3RydWN0b3JcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgeWVhciB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEzKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdHZhciB5ZWFyOiBudW1iZXIgPSA8bnVtYmVyPmExO1xyXG5cdFx0XHRcdFx0dmFyIG1vbnRoOiBudW1iZXIgPSA8bnVtYmVyPmEyO1xyXG5cdFx0XHRcdFx0dmFyIGRheTogbnVtYmVyID0gPG51bWJlcj5hMztcclxuXHRcdFx0XHRcdHZhciBob3VyOiBudW1iZXIgPSAodHlwZW9mIChoKSA9PT0gXCJudW1iZXJcIiA/IGggOiAwKTtcclxuXHRcdFx0XHRcdHZhciBtaW51dGU6IG51bWJlciA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xyXG5cdFx0XHRcdFx0dmFyIHNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XHJcblx0XHRcdFx0XHR2YXIgbWlsbGlzZWNvbmQ6IG51bWJlciA9ICh0eXBlb2YgKG1zKSA9PT0gXCJudW1iZXJcIiA/IG1zIDogMCk7XHJcblx0XHRcdFx0XHRhc3NlcnQobW9udGggPiAwICYmIG1vbnRoIDwgMTMsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogbW9udGggb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydChkYXkgPiAwICYmIGRheSA8IDMyLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGRheSBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KGhvdXIgPj0gMCAmJiBob3VyIDwgMjQsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogaG91ciBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8IDYwLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG1pbnV0ZSBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHNlY29uZCA+PSAwICYmIHNlY29uZCA8IDYwLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KG1pbGxpc2Vjb25kID49IDAgJiYgbWlsbGlzZWNvbmQgPCAxMDAwLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG1pbGxpc2Vjb25kIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuXHRcdFx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XHJcblx0XHRcdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcclxuXHRcdFx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0XHRcdG1pbGxpc2Vjb25kID0gbWF0aC5yb3VuZFN5bShtaWxsaXNlY29uZCk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKHRpbWVab25lKSA9PT0gXCJvYmplY3RcIiAmJiB0aW1lWm9uZSBpbnN0YW5jZW9mIFRpbWVab25lID8gdGltZVpvbmUgOiBudWxsKTtcclxuXHJcblx0XHRcdFx0XHQvLyBub3JtYWxpemUgbG9jYWwgdGltZSAocmVtb3ZlIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lKVxyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGxvY2FsTWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxNaWxsaXMpKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gbmV3IFRpbWVTdHJ1Y3QoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlVG9VdGNEYXRlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcclxuXHRcdFx0XHR2YXIgZ2l2ZW5TdHJpbmcgPSAoPHN0cmluZz5hMSkudHJpbSgpO1xyXG5cdFx0XHRcdHZhciBzczogc3RyaW5nW10gPSBEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lKGdpdmVuU3RyaW5nKTtcclxuXHRcdFx0XHRhc3NlcnQoc3MubGVuZ3RoID09PSAyLCBcIkludmFsaWQgZGF0ZSBzdHJpbmcgZ2l2ZW46IFxcXCJcIiArIDxzdHJpbmc+YTEgKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0aWYgKGEyIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSA8VGltZVpvbmU+KGEyKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IFRpbWVab25lLnpvbmUoc3NbMV0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvLyB1c2Ugb3VyIG93biBJU08gcGFyc2luZyBiZWNhdXNlIHRoYXQgaXQgcGxhdGZvcm0gaW5kZXBlbmRlbnRcclxuXHRcdFx0XHQvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVN0cmluZyhzc1swXSk7XHJcblx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZVRvVXRjRGF0ZSgpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHtcclxuXHRcdFx0XHRhc3NlcnQoYTEgaW5zdGFuY2VvZiBEYXRlLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG5vbi1EYXRlIG9iamVjdCBwYXNzZWQgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLFxyXG5cdFx0XHRcdFx0XCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRcdGFzc2VydCghYTMgfHwgYTMgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aW1lWm9uZSBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG5cdFx0XHRcdHZhciBkOiBEYXRlID0gPERhdGU+KGExKTtcclxuXHRcdFx0XHR2YXIgZGs6IERhdGVGdW5jdGlvbnMgPSA8RGF0ZUZ1bmN0aW9ucz4oYTIpO1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTMgPyBhMyA6IG51bGwpO1xyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcblx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZVRvVXRjRGF0ZSgpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHtcclxuXHRcdFx0XHQvLyBub3RoaW5nIGdpdmVuLCBtYWtlIGxvY2FsIGRhdGV0aW1lXHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IFRpbWVab25lLmxvY2FsKCk7XHJcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGVUb1pvbmVEYXRlKCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XHJcblx0XHRyZXN1bHQuX3V0Y0RhdGUgPSB0aGlzLl91dGNEYXRlLmNsb25lKCk7XHJcblx0XHRyZXN1bHQuX3pvbmVEYXRlID0gdGhpcy5fem9uZURhdGUuY2xvbmUoKTtcclxuXHRcdHJlc3VsdC5fdW5peFV0Y01pbGxpc0NhY2hlID0gdGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlO1xyXG5cdFx0cmVzdWx0Ll96b25lID0gdGhpcy5fem9uZTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZGF0ZSBpcyBpbi4gTWF5IGJlIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIHpvbmUoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBab25lIG5hbWUgYWJicmV2aWF0aW9uIGF0IHRoaXMgdGltZVxyXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuXHQgKiBAcmV0dXJuIFRoZSBhYmJyZXZpYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZUFiYnJldmlhdGlvbihkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcclxuXHRcdGlmICh0aGlzLnpvbmUoKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy56b25lKCkuYWJicmV2aWF0aW9uRm9yVXRjKFxyXG5cdFx0XHRcdHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCksXHJcblx0XHRcdFx0dGhpcy51dGNIb3VyKCksIHRoaXMudXRjTWludXRlKCksIHRoaXMudXRjU2Vjb25kKCksIHRoaXMudXRjTWlsbGlzZWNvbmQoKSwgZHN0RGVwZW5kZW50KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBcIlwiO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IHcuci50LiBVVEMgaW4gbWludXRlcy4gUmV0dXJucyAwIGZvciB1bmF3YXJlIGRhdGVzIGFuZCBmb3IgVVRDIGRhdGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKCh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgLSB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSkgLyA2MDAwMCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcblx0ICovXHJcblx0cHVibGljIHllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS55ZWFyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcblx0ICovXHJcblx0cHVibGljIGRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLmRheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGhvdXIgMC0yM1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBob3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUuaG91cjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG1pbnV0ZXMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5taW51dGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBzZWNvbmRzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUuc2Vjb25kO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgbWlsbGlzZWNvbmRzIDAtOTk5XHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUubWlsbGk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtEYXkoKTogV2Vla0RheSB7XHJcblx0XHRyZXR1cm4gPFdlZWtEYXk+YmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG5cdCAqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXlPZlllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3MuZGF5T2ZZZWFyKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIElTTyA4NjAxIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcblx0ICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtOdW1iZXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG5cdCAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuXHQgKi9cclxuXHRwdWJsaWMgd2Vla09mTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG5cdCAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG5cdCAqXHJcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmRPZkRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIE1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFpcclxuXHQgKi9cclxuXHRwdWJsaWMgdW5peFV0Y01pbGxpcygpOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZSA9PT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGUgPSB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBmdWxsIHllYXIgZS5nLiAyMDE0XHJcblx0ICovXHJcblx0cHVibGljIHV0Y1llYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnllYXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUubW9udGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgZGF5IG9mIHRoZSBtb250aCAxLTMxXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0RheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUuZGF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIGhvdXIgMC0yM1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNIb3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5ob3VyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1pbnV0ZXMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNaW51dGUoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLm1pbnV0ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBzZWNvbmRzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjU2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5zZWNvbmQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBVVEMgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjRGF5T2ZZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaWxsaXNlY29uZHMgMC05OTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgVVRDIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcblx0ICogd2VlayBkYXkgbnVtYmVycylcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla0RheSgpOiBXZWVrRGF5IHtcclxuXHRcdHJldHVybiA8V2Vla0RheT5iYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIElTTyA4NjAxIFVUQyB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjU2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy51dGNIb3VyKCksIHRoaXMudXRjTWludXRlKCksIHRoaXMudXRjU2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIG5ldyBEYXRlVGltZSB3aGljaCBpcyB0aGUgZGF0ZSt0aW1lIHJlaW50ZXJwcmV0ZWQgYXNcclxuXHQgKiBpbiB0aGUgbmV3IHpvbmUuIFNvIGUuZy4gMDg6MDAgQW1lcmljYS9DaGljYWdvIGNhbiBiZSBzZXQgdG8gMDg6MDAgRXVyb3BlL0JydXNzZWxzLlxyXG5cdCAqIE5vIGNvbnZlcnNpb24gaXMgZG9uZSwgdGhlIHZhbHVlIGlzIGp1c3QgYXNzdW1lZCB0byBiZSBpbiBhIGRpZmZlcmVudCB6b25lLlxyXG5cdCAqIFdvcmtzIGZvciBuYWl2ZSBhbmQgYXdhcmUgZGF0ZXMuIFRoZSBuZXcgem9uZSBtYXkgYmUgbnVsbC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lIFRoZSBuZXcgdGltZSB6b25lXHJcblx0ICogQHJldHVybiBBIG5ldyBEYXRlVGltZSB3aXRoIHRoZSBvcmlnaW5hbCB0aW1lc3RhbXAgYW5kIHRoZSBuZXcgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgd2l0aFpvbmUoem9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShcclxuXHRcdFx0dGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSxcclxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSxcclxuXHRcdFx0em9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRoaXMgZGF0ZSB0byB0aGUgZ2l2ZW4gdGltZSB6b25lIChpbi1wbGFjZSkuXHJcblx0ICogVGhyb3dzIGlmIHRoaXMgZGF0ZSBkb2VzIG5vdCBoYXZlIGEgdGltZSB6b25lLlxyXG5cdCAqIEByZXR1cm4gdGhpcyAoZm9yIGNoYWluaW5nKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjb252ZXJ0KHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuXHRcdFx0aWYgKHRoaXMuX3pvbmUuZXF1YWxzKHpvbmUpKSB7XHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IHpvbmU7IC8vIHN0aWxsIGFzc2lnbiwgYmVjYXVzZSB6b25lcyBtYXkgYmUgZXF1YWwgYnV0IG5vdCBpZGVudGljYWwgKFVUQy9HTVQvKzAwKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGVUb1pvbmVEYXRlKCk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX3pvbmUgPSBudWxsO1xyXG5cdFx0XHR0aGlzLl91dGNEYXRlID0gdGhpcy5fem9uZURhdGUuY2xvbmUoKTtcclxuXHRcdFx0dGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGlzIGRhdGUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogVW5hd2FyZSBkYXRlcyBjYW4gb25seSBiZSBjb252ZXJ0ZWQgdG8gdW5hd2FyZSBkYXRlcyAoY2xvbmUpXHJcblx0ICogQ29udmVydGluZyBhbiB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZSB0aHJvd3MgYW4gZXhjZXB0aW9uLiBVc2UgdGhlIGNvbnN0cnVjdG9yXHJcblx0ICogaWYgeW91IHJlYWxseSBuZWVkIHRvIGRvIHRoYXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZVx0VGhlIG5ldyB0aW1lIHpvbmUuIFRoaXMgbWF5IGJlIG51bGwgdG8gY3JlYXRlIHVuYXdhcmUgZGF0ZS5cclxuXHQgKiBAcmV0dXJuIFRoZSBjb252ZXJ0ZWQgZGF0ZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1pvbmUoem9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHpvbmUpIHtcclxuXHRcdFx0YXNzZXJ0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xyXG5cdFx0XHQvLyBnbyBmcm9tIHV0YyBkYXRlIHRvIHByZXNlcnZlIGl0IGluIHRoZSBwcmVzZW5jZSBvZiBEU1RcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMuY2xvbmUoKTtcclxuXHRcdFx0cmVzdWx0Ll96b25lID0gem9uZTtcclxuXHRcdFx0aWYgKCFyZXN1bHQuX3pvbmUuZXF1YWxzKHRoaXMuX3pvbmUpKSB7XHJcblx0XHRcdFx0cmVzdWx0Ll91dGNEYXRlVG9ab25lRGF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSwgbnVsbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRvIEphdmFTY3JpcHQgZGF0ZSB3aXRoIHRoZSB6b25lIHRpbWUgaW4gdGhlIGdldFgoKSBtZXRob2RzLlxyXG5cdCAqIFVubGVzcyB0aGUgdGltZXpvbmUgaXMgbG9jYWwsIHRoZSBEYXRlLmdldFVUQ1goKSBtZXRob2RzIHdpbGwgTk9UIGJlIGNvcnJlY3QuXHJcblx0ICogVGhpcyBpcyBiZWNhdXNlIERhdGUgY2FsY3VsYXRlcyBnZXRVVENYKCkgZnJvbSBnZXRYKCkgYXBwbHlpbmcgbG9jYWwgdGltZSB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0RhdGUoKTogRGF0ZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSAtIDEsIHRoaXMuZGF5KCksXHJcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHpvbmUuXHJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcblx0ICogQHBhcmFtIHRpbWVab25lIE9wdGlvbmFsLiBab25lIHRvIGNvbnZlcnQgdG8sIGRlZmF1bHQgdGhlIHpvbmUgdGhlIGRhdGV0aW1lIGlzIGFscmVhZHkgaW4uXHJcblx0ICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIHRvRXhjZWwodGltZVpvbmU/OiBUaW1lWm9uZSk6IG51bWJlciB7XHJcblx0XHR2YXIgZHQgPSB0aGlzO1xyXG5cdFx0aWYgKHRpbWVab25lICYmICF0aW1lWm9uZS5lcXVhbHModGhpcy56b25lKCkpKSB7XHJcblx0XHRcdGR0ID0gdGhpcy50b1pvbmUodGltZVpvbmUpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIG9mZnNldE1pbGxpcyA9IGR0Lm9mZnNldCgpICogNjAgKiAxMDAwO1xyXG5cdFx0dmFyIHVuaXhUaW1lc3RhbXAgPSBkdC51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCArIG9mZnNldE1pbGxpcyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byBVVENcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9VdGNFeGNlbCgpOiBudW1iZXIge1xyXG5cdFx0dmFyIHVuaXhUaW1lc3RhbXAgPSB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKG46IG51bWJlcik6IG51bWJlciB7XHJcblx0XHR2YXIgcmVzdWx0ID0gKChuKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKSkgKyAyNTU2OTtcclxuXHRcdC8vIHJvdW5kIHRvIG5lYXJlc3QgbWlsbGlzZWNvbmRcclxuXHRcdHZhciBtc2VjcyA9IHJlc3VsdCAvICgxIC8gODY0MDAwMDApO1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQobXNlY3MpICogKDEgLyA4NjQwMDAwMCk7XHJcblx0fVxyXG5cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgdGltZSBkdXJhdGlvbiByZWxhdGl2ZSB0byBVVEMuXHJcblx0ICogQHJldHVybiB0aGlzICsgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSByZWxhdGl2ZSB0byBVVEMsIGFzIHJlZ3VsYXJseSBhcyBwb3NzaWJsZS5cclxuXHQgKlxyXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgdXRjSG91cigpIGZpZWxkLCBhZGRpbmcgMSBtb250aFxyXG5cdCAqIGluY3JlbWVudHMgdGhlIHV0Y01vbnRoKCkgZmllbGQuXHJcblx0ICogQWRkaW5nIGFuIGFtb3VudCBvZiB1bml0cyBsZWF2ZXMgbG93ZXIgdW5pdHMgaW50YWN0LiBFLmcuXHJcblx0ICogYWRkaW5nIGEgbW9udGggd2lsbCBsZWF2ZSB0aGUgZGF5KCkgZmllbGQgdW50b3VjaGVkIGlmIHBvc3NpYmxlLlxyXG5cdCAqXHJcblx0ICogTm90ZSBhZGRpbmcgTW9udGhzIG9yIFllYXJzIHdpbGwgY2xhbXAgdGhlIGRhdGUgdG8gdGhlIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXHJcblx0ICpcclxuXHQgKiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdXRjIHRpbWUgZmllbGRzIGFyZSBzdGlsbCB1bnRvdWNoZWQgYnV0IGxvY2FsXHJcblx0ICogdGltZSBmaWVsZHMgbWF5IHNoaWZ0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogSW1wbGVtZW50YXRpb24uXHJcblx0ICovXHJcblx0cHVibGljIGFkZChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgYW1vdW50OiBudW1iZXI7XHJcblx0XHR2YXIgdTogVGltZVVuaXQ7XHJcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0dmFyIGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdDtcclxuXHRcdH1cclxuXHRcdHZhciB1dGNUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLl91dGNEYXRlLCBhbW91bnQsIHUpO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh1dGNUbS50b1VuaXhOb0xlYXBTZWNzKCksIFRpbWVab25lLnV0YygpKS50b1pvbmUodGhpcy5fem9uZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIHpvbmUgdGltZSwgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLlxyXG5cdCAqXHJcblx0ICogQWRkaW5nIGUuZy4gMSBob3VyIHdpbGwgaW5jcmVtZW50IHRoZSBob3VyKCkgZmllbGQgb2YgdGhlIHpvbmVcclxuXHQgKiBkYXRlIGJ5IG9uZS4gSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHRpbWUgZmllbGRzIG1heSBhZGRpdGlvbmFsbHlcclxuXHQgKiBpbmNyZWFzZSBieSB0aGUgRFNUIG9mZnNldCwgaWYgYSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSB3b3VsZFxyXG5cdCAqIGJlIHJlYWNoZWQgb3RoZXJ3aXNlLlxyXG5cdCAqXHJcblx0ICogQWRkaW5nIGEgdW5pdCBvZiB0aW1lIHdpbGwgbGVhdmUgbG93ZXItdW5pdCBmaWVsZHMgaW50YWN0LCB1bmxlc3MgdGhlIHJlc3VsdFxyXG5cdCAqIHdvdWxkIGJlIGEgbm9uLWV4aXN0aW5nIHRpbWUuIFRoZW4gYW4gZXh0cmEgRFNUIG9mZnNldCBpcyBhZGRlZC5cclxuXHQgKlxyXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcclxuXHQgKiB0aGUgc3RhcnQgZGF0ZSB3YXMgYXQgdGhlIGVuZCBvZiBhIG1vbnRoLCBpLmUuIGNvbnRyYXJ5IHRvIEphdmFTY3JpcHRcclxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGRMb2NhbChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgYWRkTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0cHVibGljIGFkZExvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdHZhciBhbW91bnQ6IG51bWJlcjtcclxuXHRcdHZhciB1OiBUaW1lVW5pdDtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHR2YXIgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhbW91bnQgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHUgPSB1bml0O1xyXG5cdFx0fVxyXG5cdFx0dmFyIGxvY2FsVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy5fem9uZURhdGUsIGFtb3VudCwgdSk7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHR2YXIgZGlyZWN0aW9uOiBOb3JtYWxpemVPcHRpb24gPSAoYW1vdW50ID49IDAgPyBOb3JtYWxpemVPcHRpb24uVXAgOiBOb3JtYWxpemVPcHRpb24uRG93bik7XHJcblx0XHRcdHZhciBub3JtYWxpemVkID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbFRtLnRvVW5peE5vTGVhcFNlY3MoKSwgZGlyZWN0aW9uKTtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShub3JtYWxpemVkLCB0aGlzLl96b25lKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobG9jYWxUbS50b1VuaXhOb0xlYXBTZWNzKCksIG51bGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSBnaXZlbiB0aW1lIHN0cnVjdC4gTm90ZTogZG9lcyBub3Qgbm9ybWFsaXplLlxyXG5cdCAqIEtlZXBzIGxvd2VyIHVuaXQgZmllbGRzIHRoZSBzYW1lIHdoZXJlIHBvc3NpYmxlLCBjbGFtcHMgZGF5IHRvIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIG5lY2Vzc2FyeS5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9hZGRUb1RpbWVTdHJ1Y3QodG06IFRpbWVTdHJ1Y3QsIGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0dmFyIHRhcmdldFllYXI6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRNb250aDogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldERheTogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldEhvdXJzOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0TWludXRlczogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldFNlY29uZHM6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRNaWxsaXNlY29uZHM6IG51bWJlcjtcclxuXHJcblx0XHRzd2l0Y2ggKHVuaXQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDoge1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50KSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDEwMDApKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbnV0ZToge1xyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQgKiA2MDAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuSG91cjoge1xyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQgKiAzNjAwMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IHtcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogODY0MDAwMDApKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LldlZWs6IHtcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogNyAqIDg2NDAwMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Nb250aDoge1xyXG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgbW9udGhzXCIpO1xyXG5cdFx0XHRcdC8vIGtlZXAgdGhlIGRheS1vZi1tb250aCB0aGUgc2FtZSAoY2xhbXAgdG8gZW5kLW9mLW1vbnRoKVxyXG5cdFx0XHRcdGlmIChhbW91bnQgPj0gMCkge1xyXG5cdFx0XHRcdFx0dGFyZ2V0WWVhciA9IHRtLnllYXIgKyBNYXRoLmNlaWwoKGFtb3VudCAtICgxMiAtIHRtLm1vbnRoKSkgLyAxMik7XHJcblx0XHRcdFx0XHR0YXJnZXRNb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5tb250aCAtIDEgKyBNYXRoLmZsb29yKGFtb3VudCkpLCAxMik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRhcmdldFllYXIgPSB0bS55ZWFyICsgTWF0aC5mbG9vcigoYW1vdW50ICsgKHRtLm1vbnRoIC0gMSkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0dGFyZ2V0TW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0ubW9udGggLSAxICsgTWF0aC5jZWlsKGFtb3VudCkpLCAxMik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRhcmdldERheSA9IE1hdGgubWluKHRtLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHRhcmdldFllYXIsIHRhcmdldE1vbnRoKSk7XHJcblx0XHRcdFx0dGFyZ2V0SG91cnMgPSB0bS5ob3VyO1xyXG5cdFx0XHRcdHRhcmdldE1pbnV0ZXMgPSB0bS5taW51dGU7XHJcblx0XHRcdFx0dGFyZ2V0U2Vjb25kcyA9IHRtLnNlY29uZDtcclxuXHRcdFx0XHR0YXJnZXRNaWxsaXNlY29uZHMgPSB0bS5taWxsaTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGFyZ2V0WWVhciwgdGFyZ2V0TW9udGgsIHRhcmdldERheSwgdGFyZ2V0SG91cnMsIHRhcmdldE1pbnV0ZXMsIHRhcmdldFNlY29uZHMsIHRhcmdldE1pbGxpc2Vjb25kcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5ZZWFyOiB7XHJcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiB5ZWFyc1wiKTtcclxuXHRcdFx0XHR0YXJnZXRZZWFyID0gdG0ueWVhciArIGFtb3VudDtcclxuXHRcdFx0XHR0YXJnZXRNb250aCA9IHRtLm1vbnRoO1xyXG5cdFx0XHRcdHRhcmdldERheSA9IE1hdGgubWluKHRtLmRheSwgYmFzaWNzLmRheXNJbk1vbnRoKHRhcmdldFllYXIsIHRhcmdldE1vbnRoKSk7XHJcblx0XHRcdFx0dGFyZ2V0SG91cnMgPSB0bS5ob3VyO1xyXG5cdFx0XHRcdHRhcmdldE1pbnV0ZXMgPSB0bS5taW51dGU7XHJcblx0XHRcdFx0dGFyZ2V0U2Vjb25kcyA9IHRtLnNlY29uZDtcclxuXHRcdFx0XHR0YXJnZXRNaWxsaXNlY29uZHMgPSB0bS5taWxsaTtcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFRpbWVTdHJ1Y3QodGFyZ2V0WWVhciwgdGFyZ2V0TW9udGgsIHRhcmdldERheSwgdGFyZ2V0SG91cnMsIHRhcmdldE1pbnV0ZXMsIHRhcmdldFNlY29uZHMsIHRhcmdldE1pbGxpc2Vjb25kcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHBlcmlvZCB1bml0LlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSpkdXJhdGlvbik7XHJcblx0ICovXHJcblx0cHVibGljIHN1YihkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpO1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWIoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YihhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIgJiYgYTEgaW5zdGFuY2VvZiBEdXJhdGlvbikge1xyXG5cdFx0XHR2YXIgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZChkdXJhdGlvbi5tdWx0aXBseSgtMSkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHR2YXIgYW1vdW50OiBudW1iZXIgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZCgtMSAqIGFtb3VudCwgdW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZExvY2FsKC0xKmFtb3VudCwgdW5pdCk7XHJcblx0ICovXHJcblx0cHVibGljIHN1YkxvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWJMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViTG9jYWwoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHR5cGVvZiBhMSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgoPER1cmF0aW9uPmExKS5tdWx0aXBseSgtMSkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoLTEgKiA8bnVtYmVyPmExLCB1bml0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byBEYXRlVGltZXNcclxuXHQgKiBAcmV0dXJuIHRoaXMgLSBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkaWZmKG90aGVyOiBEYXRlVGltZSk6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgLSBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0KiBDaG9wcyBvZmYgdGhlIHRpbWUgcGFydCwgeWllbGRzIHRoZSBzYW1lIGRhdGUgYXQgMDA6MDA6MDAuMDAwXHJcblx0KiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcblx0Ki9cclxuXHRwdWJsaWMgc3RhcnRPZkRheSgpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgbW9udGggYXQgMDA6MDA6MDBcclxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXJ0T2ZNb250aCgpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGZpcnN0IGRheSBvZiB0aGUgeWVhciBhdCAwMDowMDowMFxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhcnRPZlllYXIoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgMSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzVGhhbihvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSA8IG90aGVyLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPD0gb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSA8PSBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSBtb21lbnQgaW4gdGltZSBpbiBVVENcclxuXHQgKi9cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUuZXF1YWxzKG90aGVyLl91dGNEYXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgYW5kIHRoZSBzYW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgaWRlbnRpY2FsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICh0aGlzLl96b25lRGF0ZS5lcXVhbHMob3RoZXIuX3pvbmVEYXRlKVxyXG5cdFx0XHQmJiAodGhpcy5fem9uZSA9PT0gbnVsbCkgPT09IChvdGhlci5fem9uZSA9PT0gbnVsbClcclxuXHRcdFx0JiYgKHRoaXMuX3pvbmUgPT09IG51bGwgfHwgdGhpcy5fem9uZS5pZGVudGljYWwob3RoZXIuX3pvbmUpKVxyXG5cdFx0XHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgPiBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPj0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlckVxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpID49IG90aGVyLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1pbmltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluKG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0aGlzLmxlc3NUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1heChvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5ncmVhdGVyVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUHJvcGVyIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBhbnkgSUFOQSB6b25lIGNvbnZlcnRlZCB0byBJU08gb2Zmc2V0XHJcblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMrMDE6MDBcIiBmb3IgRXVyb3BlL0Ftc3RlcmRhbVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0lzb1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0dmFyIHM6IHN0cmluZyA9IHRoaXMuX3pvbmVEYXRlLnRvU3RyaW5nKCk7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRyZXR1cm4gcyArIFRpbWVab25lLm9mZnNldFRvU3RyaW5nKHRoaXMub2Zmc2V0KCkpOyAvLyBjb252ZXJ0IElBTkEgbmFtZSB0byBvZmZzZXRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgRGF0ZVRpbWUgYWNjb3JkaW5nIHRvIHRoZVxyXG5cdCAqIHNwZWNpZmllZCBmb3JtYXQuIFRoZSBmb3JtYXQgaXMgaW1wbGVtZW50ZWQgYXMgdGhlIExETUwgc3RhbmRhcmRcclxuXHQgKiAoaHR0cDovL3VuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9Gb3JtYXRfUGF0dGVybnMpXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZm9ybWF0U3RyaW5nIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiAoZS5nLiBcImRkL01NL3l5eXkgSEg6bW06c3NcIilcclxuXHQgKiBAcmV0dXJuIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBmb3JtYXQoZm9ybWF0U3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIGZvcm1hdC5mb3JtYXQodGhpcy5fem9uZURhdGUsIHRoaXMuX3V0Y0RhdGUsIHRoaXMuem9uZSgpLCBmb3JtYXRTdHJpbmcpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIElBTkEgbmFtZSBpZiBhcHBsaWNhYmxlLlxyXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzLjAwMCBFdXJvcGUvQW1zdGVyZGFtXCJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHZhciBzOiBzdHJpbmcgPSB0aGlzLl96b25lRGF0ZS50b1N0cmluZygpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0aWYgKHRoaXMuX3pvbmUua2luZCgpICE9PSBUaW1lWm9uZUtpbmQuT2Zmc2V0KSB7XHJcblx0XHRcdFx0cmV0dXJuIHMgKyBcIiBcIiArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gc2VwYXJhdGUgSUFOQSBuYW1lIG9yIFwibG9jYWx0aW1lXCIgd2l0aCBhIHNwYWNlXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHMgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIGRvIG5vdCBzZXBhcmF0ZSBJU08gem9uZVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0cHVibGljIGluc3BlY3QoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBcIltEYXRlVGltZTogXCIgKyB0aGlzLnRvU3RyaW5nKCkgKyBcIl1cIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB2YWx1ZU9mKCkgbWV0aG9kIHJldHVybnMgdGhlIHByaW1pdGl2ZSB2YWx1ZSBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgdmFsdWVPZigpOiBhbnkge1xyXG5cdFx0cmV0dXJuIHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTW9kaWZpZWQgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyBpbiBVVEMgd2l0aG91dCB0aW1lIHpvbmUgaW5mb1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1V0Y1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUudG9TdHJpbmcoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aGlzLl96b25lRGF0ZSBmcm9tIHRoaXMuX3V0Y0RhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF91dGNEYXRlVG9ab25lRGF0ZSgpOiB2b2lkIHtcclxuXHRcdHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZSA9IG51bGw7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0dmFyIG9mZnNldDogbnVtYmVyID0gdGhpcy5fem9uZS5vZmZzZXRGb3JVdGModGhpcy5fdXRjRGF0ZS55ZWFyLCB0aGlzLl91dGNEYXRlLm1vbnRoLCB0aGlzLl91dGNEYXRlLmRheSxcclxuXHRcdFx0XHR0aGlzLl91dGNEYXRlLmhvdXIsIHRoaXMuX3V0Y0RhdGUubWludXRlLCB0aGlzLl91dGNEYXRlLnNlY29uZCwgdGhpcy5fdXRjRGF0ZS5taWxsaSk7XHJcblx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpICsgb2Zmc2V0ICogNjAwMDApKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fdXRjRGF0ZS5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlIHRoaXMuX3V0Y0RhdGUgZnJvbSB0aGlzLl96b25lRGF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVEYXRlVG9VdGNEYXRlKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlID0gbnVsbDtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHZhciBvZmZzZXQ6IG51bWJlciA9IHRoaXMuX3pvbmUub2Zmc2V0Rm9yWm9uZSh0aGlzLl96b25lRGF0ZS55ZWFyLCB0aGlzLl96b25lRGF0ZS5tb250aCwgdGhpcy5fem9uZURhdGUuZGF5LFxyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlLmhvdXIsIHRoaXMuX3pvbmVEYXRlLm1pbnV0ZSwgdGhpcy5fem9uZURhdGUuc2Vjb25kLCB0aGlzLl96b25lRGF0ZS5taWxsaSk7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSAtIG9mZnNldCAqIDYwMDAwKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB0aGlzLl96b25lRGF0ZS5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3BsaXQgYSBjb21iaW5lZCBJU08gZGF0ZXRpbWUgYW5kIHRpbWV6b25lIGludG8gZGF0ZXRpbWUgYW5kIHRpbWV6b25lXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShzOiBzdHJpbmcpOiBzdHJpbmdbXSB7XHJcblx0XHR2YXIgdHJpbW1lZCA9IHMudHJpbSgpO1xyXG5cdFx0dmFyIHJlc3VsdCA9IFtcIlwiLCBcIlwiXTtcclxuXHRcdHZhciBpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIgXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCArIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiWlwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgsIDEpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiK1wiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiLVwiKTtcclxuXHRcdGlmIChpbmRleCA8IDgpIHtcclxuXHRcdFx0aW5kZXggPSAtMTsgLy8gYW55IFwiLVwiIHdlIGZvdW5kIHdhcyBhIGRhdGUgc2VwYXJhdG9yXHJcblx0XHR9XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdHJlc3VsdFswXSA9IHRyaW1tZWQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxufVxyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
