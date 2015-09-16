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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kYXRldGltZS50cyJdLCJuYW1lcyI6WyJub3dMb2NhbCIsIm5vd1V0YyIsIm5vdyIsIkRhdGVUaW1lIiwiRGF0ZVRpbWUuY29uc3RydWN0b3IiLCJEYXRlVGltZS5ub3dMb2NhbCIsIkRhdGVUaW1lLm5vd1V0YyIsIkRhdGVUaW1lLm5vdyIsIkRhdGVUaW1lLmZyb21FeGNlbCIsIkRhdGVUaW1lLmNsb25lIiwiRGF0ZVRpbWUuem9uZSIsIkRhdGVUaW1lLnpvbmVBYmJyZXZpYXRpb24iLCJEYXRlVGltZS5vZmZzZXQiLCJEYXRlVGltZS55ZWFyIiwiRGF0ZVRpbWUubW9udGgiLCJEYXRlVGltZS5kYXkiLCJEYXRlVGltZS5ob3VyIiwiRGF0ZVRpbWUubWludXRlIiwiRGF0ZVRpbWUuc2Vjb25kIiwiRGF0ZVRpbWUubWlsbGlzZWNvbmQiLCJEYXRlVGltZS53ZWVrRGF5IiwiRGF0ZVRpbWUuZGF5T2ZZZWFyIiwiRGF0ZVRpbWUud2Vla051bWJlciIsIkRhdGVUaW1lLndlZWtPZk1vbnRoIiwiRGF0ZVRpbWUuc2Vjb25kT2ZEYXkiLCJEYXRlVGltZS51bml4VXRjTWlsbGlzIiwiRGF0ZVRpbWUudXRjWWVhciIsIkRhdGVUaW1lLnV0Y01vbnRoIiwiRGF0ZVRpbWUudXRjRGF5IiwiRGF0ZVRpbWUudXRjSG91ciIsIkRhdGVUaW1lLnV0Y01pbnV0ZSIsIkRhdGVUaW1lLnV0Y1NlY29uZCIsIkRhdGVUaW1lLnV0Y0RheU9mWWVhciIsIkRhdGVUaW1lLnV0Y01pbGxpc2Vjb25kIiwiRGF0ZVRpbWUudXRjV2Vla0RheSIsIkRhdGVUaW1lLnV0Y1dlZWtOdW1iZXIiLCJEYXRlVGltZS51dGNXZWVrT2ZNb250aCIsIkRhdGVUaW1lLnV0Y1NlY29uZE9mRGF5IiwiRGF0ZVRpbWUud2l0aFpvbmUiLCJEYXRlVGltZS5jb252ZXJ0IiwiRGF0ZVRpbWUudG9ab25lIiwiRGF0ZVRpbWUudG9EYXRlIiwiRGF0ZVRpbWUudG9FeGNlbCIsIkRhdGVUaW1lLnRvVXRjRXhjZWwiLCJEYXRlVGltZS5fdW5peFRpbWVTdGFtcFRvRXhjZWwiLCJEYXRlVGltZS5hZGQiLCJEYXRlVGltZS5hZGRMb2NhbCIsIkRhdGVUaW1lLl9hZGRUb1RpbWVTdHJ1Y3QiLCJEYXRlVGltZS5zdWIiLCJEYXRlVGltZS5zdWJMb2NhbCIsIkRhdGVUaW1lLmRpZmYiLCJEYXRlVGltZS5zdGFydE9mRGF5IiwiRGF0ZVRpbWUuc3RhcnRPZk1vbnRoIiwiRGF0ZVRpbWUuc3RhcnRPZlllYXIiLCJEYXRlVGltZS5sZXNzVGhhbiIsIkRhdGVUaW1lLmxlc3NFcXVhbCIsIkRhdGVUaW1lLmVxdWFscyIsIkRhdGVUaW1lLmlkZW50aWNhbCIsIkRhdGVUaW1lLmdyZWF0ZXJUaGFuIiwiRGF0ZVRpbWUuZ3JlYXRlckVxdWFsIiwiRGF0ZVRpbWUubWluIiwiRGF0ZVRpbWUubWF4IiwiRGF0ZVRpbWUudG9Jc29TdHJpbmciLCJEYXRlVGltZS5mb3JtYXQiLCJEYXRlVGltZS50b1N0cmluZyIsIkRhdGVUaW1lLmluc3BlY3QiLCJEYXRlVGltZS52YWx1ZU9mIiwiRGF0ZVRpbWUudG9VdGNTdHJpbmciLCJEYXRlVGltZS5fdXRjRGF0ZVRvWm9uZURhdGUiLCJEYXRlVGltZS5fem9uZURhdGVUb1V0Y0RhdGUiLCJEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsQUFFQSwyQ0FGMkM7QUFFM0MsWUFBWSxDQUFDO0FBRWIsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFFbEMsSUFBTyxNQUFNLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFFcEMsSUFBTyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUN0QyxJQUFPLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBRWxDLElBQU8sUUFBUSxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBQ3hDLElBQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFFcEMsSUFBTyxVQUFVLFdB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Q0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxHQUFHQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzRUEsQ0FBQ0E7WUFDREEsS0FBS0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQ3RCQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtnQkFDdEJBLEFBQ0FBLHVFQUR1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ25GQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLEFBQ0FBLHVFQUR1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ3JGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDbkJBLEFBQ0FBLHVFQUR1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLEFBQ0FBLHVFQUR1RUE7Z0JBQ3ZFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQzFGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDckJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLCtDQUErQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVFQSxBQUNBQSx5REFEeURBO2dCQUN6REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pCQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbEVBLFdBQVdBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO2dCQUNoRkEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNQQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDbEVBLFdBQVdBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMvRUEsQ0FBQ0E7Z0JBQ0RBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxRUEsV0FBV0EsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQ3RCQSxhQUFhQSxHQUFHQSxFQUFFQSxDQUFDQSxNQUFNQSxDQUFDQTtnQkFDMUJBLGFBQWFBLEdBQUdBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBO2dCQUMxQkEsa0JBQWtCQSxHQUFHQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFDOUJBLE1BQU1BLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLFVBQVVBLEVBQUVBLFdBQVdBLEVBQUVBLFNBQVNBLEVBQUVBLFdBQVdBLEVBQUVBLGFBQWFBLEVBQUVBLGFBQWFBLEVBQUVBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7WUFDMUhBLENBQUNBO1lBQ0RBLEtBQUtBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO2dCQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsOENBQThDQSxDQUFDQSxDQUFDQTtnQkFDM0VBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBO2dCQUM5QkEsV0FBV0EsR0FBR0EsRUFBRUEs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LEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2SEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURqRTs7T0FFR0E7SUFDS0EscUNBQWtCQSxHQUExQkE7UUFDQ2tFLElBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDaENBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxJQUFJQSxNQUFNQSxHQUFXQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxFQUMxR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDMUZBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDekZBLENBQUNBO1FBQUNBLElBQUlBLENB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QUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBO1FBQ3BCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNmQSxDQUFDQTtJQWg5QkRuRTs7OztPQUlHQTtJQUNXQSxtQkFBVUEsR0FBZUEsSUFBSUEsY0FBY0EsRUFBRUEsQ0FBQ0E7SUE0OEI3REEsZUFBQ0E7QUFBREEsQ0EzK0JBLEFBMitCQ0EsSUFBQTtBQTMrQlksZ0JBQVEsV0EyK0JwQixDQUFBIiwiZmlsZSI6ImxpYi9kYXRldGltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmQudHNcIi8+XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xyXG5cclxuaW1wb3J0IGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxuaW1wb3J0IFdlZWtEYXkgPSBiYXNpY3MuV2Vla0RheTtcclxuaW1wb3J0IFRpbWVTdHJ1Y3QgPSBiYXNpY3MuVGltZVN0cnVjdDtcclxuaW1wb3J0IFRpbWVVbml0ID0gYmFzaWNzLlRpbWVVbml0O1xyXG5cclxuaW1wb3J0IGR1cmF0aW9uID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbmltcG9ydCBEdXJhdGlvbiA9IGR1cmF0aW9uLkR1cmF0aW9uO1xyXG5cclxuaW1wb3J0IGphdmFzY3JpcHQgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG5pbXBvcnQgRGF0ZUZ1bmN0aW9ucyA9IGphdmFzY3JpcHQuRGF0ZUZ1bmN0aW9ucztcclxuXHJcbmltcG9ydCBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxuXHJcbmltcG9ydCB0aW1lc291cmNlID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcclxuaW1wb3J0IFRpbWVTb3VyY2UgPSB0aW1lc291cmNlLlRpbWVTb3VyY2U7XHJcbmltcG9ydCBSZWFsVGltZVNvdXJjZSA9IHRpbWVzb3VyY2UuUmVhbFRpbWVTb3VyY2U7XHJcblxyXG5pbXBvcnQgdGltZXpvbmUgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuaW1wb3J0IE5vcm1hbGl6ZU9wdGlvbiA9IHRpbWV6b25lLk5vcm1hbGl6ZU9wdGlvbjtcclxuaW1wb3J0IFRpbWVab25lID0gdGltZXpvbmUuVGltZVpvbmU7XHJcbmltcG9ydCBUaW1lWm9uZUtpbmQgPSB0aW1lem9uZS5UaW1lWm9uZUtpbmQ7XHJcblxyXG5pbXBvcnQgZm9ybWF0ID0gcmVxdWlyZShcIi4vZm9ybWF0XCIpO1xyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd1V0YygpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93KHRpbWVab25lOiBUaW1lWm9uZSA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcblxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERhdGVUaW1lIHtcclxuXHJcblx0LyoqXHJcblx0ICogRGF0ZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVwcmVzZW50ZWQgZGF0ZSBjb252ZXJ0ZWQgdG8gVVRDIGluIGl0c1xyXG5cdCAqIGdldFVUQ1h4eCgpIGZpZWxkcy5cclxuXHQgKi9cclxuXHRwcml2YXRlIF91dGNEYXRlOiBUaW1lU3RydWN0O1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWNoZWQgdmFsdWUgZm9yIHVuaXhVdGNNaWxsaXMoKS4gVGhpcyBpcyB1c2VmdWwgYmVjYXVzZSB2YWx1ZU9mKCkgdXNlcyBpdCBhbmQgaXQgaXNcclxuXHQgKiBsaWtlbHkgdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3VuaXhVdGNNaWxsaXNDYWNoZTogbnVtYmVyID0gbnVsbDtcclxuXHJcblx0LyoqXHJcblx0ICogRGF0ZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVwcmVzZW50ZWQgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhpcy5fem9uZSBpbiBpdHNcclxuXHQgKiBnZXRVVENYeHgoKSBmaWVsZHMuIE5vdGUgdGhhdCB0aGUgZ2V0WHh4KCkgZmllbGRzIGFyZSB1bnVzYWJsZSBmb3IgdGhpcyBwdXJwb3NlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZURhdGU6IFRpbWVTdHJ1Y3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9yaWdpbmFsIHRpbWUgem9uZSB0aGlzIGluc3RhbmNlIHdhcyBjcmVhdGVkIGZvci5cclxuXHQgKiBDYW4gYmUgTlVMTCBmb3IgdW5hd2FyZSB0aW1lc3RhbXBzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZTogVGltZVpvbmU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cclxuXHQgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXHJcblx0ICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgdGltZVNvdXJjZTogVGltZVNvdXJjZSA9IG5ldyBSZWFsVGltZVNvdXJjZSgpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgbiA9IERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG4sIERhdGVGdW5jdGlvbnMuR2V0LCBUaW1lWm9uZS5sb2NhbCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3dVdGMoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vdyh0aW1lWm9uZTogVGltZVpvbmUgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgRGF0ZVRpbWUgZnJvbSBhIExvdHVzIDEyMyAvIE1pY3Jvc29mdCBFeGNlbCBkYXRlLXRpbWUgdmFsdWVcclxuXHQgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gbiBleGNlbCBkYXRlL3RpbWUgbnVtYmVyXHJcblx0ICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cclxuXHQgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tRXhjZWwobjogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0YXNzZXJ0KHR5cGVvZiBuID09PSBcIm51bWJlclwiLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuXHRcdGFzc2VydCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHRhc3NlcnQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHR2YXIgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIENyZWF0ZXMgY3VycmVudCB0aW1lIGluIGxvY2FsIHRpbWV6b25lLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKCk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBpc29TdHJpbmdcdFN0cmluZyBpbiBJU08gODYwMSBmb3JtYXQuIEluc3RlYWQgb2YgSVNPIHRpbWUgem9uZSxcclxuXHQgKlx0XHQgaXQgbWF5IGluY2x1ZGUgYSBzcGFjZSBhbmQgdGhlbiBhbmQgSUFOQSB0aW1lIHpvbmUuXHJcblx0ICogZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwXCJcdFx0XHRcdFx0KG5vIHRpbWUgem9uZSwgbmFpdmUgZGF0ZSlcclxuXHQgKiBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDArMDE6MDBcIlx0XHRcdFx0KFVUQyBvZmZzZXQgd2l0aG91dCBkYXlsaWdodCBzYXZpbmcgdGltZSlcclxuXHQgKiBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBaXCJcdFx0XHRcdFx0KFVUQylcclxuXHQgKiBvciAgIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHQoSUFOQSB0aW1lIHpvbmUsIHdpdGggZGF5bGlnaHQgc2F2aW5nIHRpbWUgaWYgYXBwbGljYWJsZSlcclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXHJcblx0ICpcdFx0XHRcdFx0Tm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXHJcblx0ICpcdFx0XHRcdFx0Zm9yIHN0cmluZ3Mgd2l0aG91dCBhIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGlzb1N0cmluZzogc3RyaW5nLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gWW91IHByb3ZpZGUgYSBkYXRlLCB0aGVuIHlvdSBzYXkgd2hldGhlciB0byB0YWtlIHRoZVxyXG5cdCAqIGRhdGUuZ2V0WWVhcigpL2dldFh4eCBtZXRob2RzIG9yIHRoZSBkYXRlLmdldFVUQ1llYXIoKS9kYXRlLmdldFVUQ1h4eCBtZXRob2RzLFxyXG5cdCAqIGFuZCB0aGVuIHlvdSBzdGF0ZSB3aGljaCB0aW1lIHpvbmUgdGhhdCBkYXRlIGlzIGluLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqIE5vdGUgdGhhdCB0aGUgRGF0ZSBjbGFzcyBoYXMgYnVncyBhbmQgaW5jb25zaXN0ZW5jaWVzIHdoZW4gY29uc3RydWN0aW5nIHRoZW0gd2l0aCB0aW1lcyBhcm91bmRcclxuXHQgKiBEU1QgY2hhbmdlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlXHRBIGRhdGUgb2JqZWN0LlxyXG5cdCAqIEBwYXJhbSBnZXR0ZXJzXHRTcGVjaWZpZXMgd2hpY2ggc2V0IG9mIERhdGUgZ2V0dGVycyBjb250YWlucyB0aGUgZGF0ZSBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lOiB0aGVcclxuXHQgKlx0XHRcdFx0XHREYXRlLmdldFh4eCgpIG1ldGhvZHMgb3IgdGhlIERhdGUuZ2V0VVRDWHh4KCkgbWV0aG9kcy5cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgZ2l2ZW4gZGF0ZSBpcyBhc3N1bWVkIHRvIGJlIGluIChtYXkgYmUgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcylcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihkYXRlOiBEYXRlLCBnZXRGdW5jczogRGF0ZUZ1bmN0aW9ucywgdGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIE5vdGUgdGhhdCB1bmxpa2UgSmF2YVNjcmlwdCBkYXRlcyB3ZSByZXF1aXJlIGZpZWxkcyB0byBiZSBpbiBub3JtYWwgcmFuZ2VzLlxyXG5cdCAqIFVzZSB0aGUgYWRkKGR1cmF0aW9uKSBvciBzdWIoZHVyYXRpb24pIGZvciBhcml0aG1ldGljLlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgZnVsbCB5ZWFyIChlLmcuIDIwMTQpXHJcblx0ICogQHBhcmFtIG1vbnRoXHRUaGUgbW9udGggWzEtMTJdIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcblx0ICogQHBhcmFtIGRheVx0VGhlIGRheSBvZiB0aGUgbW9udGggWzEtMzFdXHJcblx0ICogQHBhcmFtIGhvdXJcdFRoZSBob3VyIG9mIHRoZSBkYXkgWzAtMjQpXHJcblx0ICogQHBhcmFtIG1pbnV0ZVx0VGhlIG1pbnV0ZSBvZiB0aGUgaG91ciBbMC01OV1cclxuXHQgKiBAcGFyYW0gc2Vjb25kXHRUaGUgc2Vjb25kIG9mIHRoZSBtaW51dGUgWzAtNTldXHJcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kXHRUaGUgbWlsbGlzZWNvbmQgb2YgdGhlIHNlY29uZCBbMC05OTldXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgdGltZSB6b25lLCBvciBudWxsIChmb3IgdW5hd2FyZSBkYXRlcylcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF5OiBudW1iZXIsXHJcblx0XHRob3VyPzogbnVtYmVyLCBtaW51dGU/OiBudW1iZXIsIHNlY29uZD86IG51bWJlciwgbWlsbGlzZWNvbmQ/OiBudW1iZXIsXHJcblx0XHR0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvclxyXG5cdCAqIEBwYXJhbSB1bml4VGltZXN0YW1wXHRtaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBcclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdHRoZSB0aW1lIHpvbmUgdGhhdCB0aGUgdGltZXN0YW1wIGlzIGFzc3VtZWQgdG8gYmUgaW4gKHVzdWFsbHkgVVRDKS5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcih1bml4VGltZXN0YW1wOiBudW1iZXIsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvbiwgZG8gbm90IGNhbGxcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdGExPzogYW55LCBhMj86IGFueSwgYTM/OiBhbnksXHJcblx0XHRoPzogbnVtYmVyLCBtPzogbnVtYmVyLCBzPzogbnVtYmVyLCBtcz86IG51bWJlcixcclxuXHRcdHRpbWVab25lPzogYW55KSB7XHJcblx0XHRzd2l0Y2ggKHR5cGVvZiAoYTEpKSB7XHJcblx0XHRcdGNhc2UgXCJudW1iZXJcIjoge1xyXG5cdFx0XHRcdGlmIChhMiA9PT0gdW5kZWZpbmVkIHx8IGEyID09PSBudWxsIHx8IGEyIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdC8vIHVuaXggdGltZXN0YW1wIGNvbnN0cnVjdG9yXHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZXhwZWN0IHVuaXhUaW1lc3RhbXAgdG8gYmUgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAoYTIpID09PSBcIm9iamVjdFwiICYmIGEyIGluc3RhbmNlb2YgVGltZVpvbmUgPyA8VGltZVpvbmU+YTIgOiBudWxsKTtcclxuXHRcdFx0XHRcdHZhciBub3JtYWxpemVkVW5peFRpbWVzdGFtcDogbnVtYmVyO1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdFx0bm9ybWFsaXplZFVuaXhUaW1lc3RhbXAgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKG1hdGgucm91bmRTeW0oPG51bWJlcj5hMSkpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0bm9ybWFsaXplZFVuaXhUaW1lc3RhbXAgPSBtYXRoLnJvdW5kU3ltKDxudW1iZXI+YTEpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlVG9VdGNEYXRlKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIHllYXIgbW9udGggZGF5IGNvbnN0cnVjdG9yXHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IHllYXIgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBtb250aCB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMykgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IGRheSB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHR2YXIgeWVhcjogbnVtYmVyID0gPG51bWJlcj5hMTtcclxuXHRcdFx0XHRcdHZhciBtb250aDogbnVtYmVyID0gPG51bWJlcj5hMjtcclxuXHRcdFx0XHRcdHZhciBkYXk6IG51bWJlciA9IDxudW1iZXI+YTM7XHJcblx0XHRcdFx0XHR2YXIgaG91cjogbnVtYmVyID0gKHR5cGVvZiAoaCkgPT09IFwibnVtYmVyXCIgPyBoIDogMCk7XHJcblx0XHRcdFx0XHR2YXIgbWludXRlOiBudW1iZXIgPSAodHlwZW9mIChtKSA9PT0gXCJudW1iZXJcIiA/IG0gOiAwKTtcclxuXHRcdFx0XHRcdHZhciBzZWNvbmQ6IG51bWJlciA9ICh0eXBlb2YgKHMpID09PSBcIm51bWJlclwiID8gcyA6IDApO1xyXG5cdFx0XHRcdFx0dmFyIG1pbGxpc2Vjb25kOiBudW1iZXIgPSAodHlwZW9mIChtcykgPT09IFwibnVtYmVyXCIgPyBtcyA6IDApO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KG1vbnRoID4gMCAmJiBtb250aCA8IDEzLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG1vbnRoIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQoZGF5ID4gMCAmJiBkYXkgPCAzMiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBkYXkgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydChob3VyID49IDAgJiYgaG91ciA8IDI0LCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGhvdXIgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydChtaW51dGUgPj0gMCAmJiBtaW51dGUgPCA2MCwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBtaW51dGUgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydChzZWNvbmQgPj0gMCAmJiBzZWNvbmQgPCA2MCwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBzZWNvbmQgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydChtaWxsaXNlY29uZCA+PSAwICYmIG1pbGxpc2Vjb25kIDwgMTAwMCwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBtaWxsaXNlY29uZCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0eWVhciA9IG1hdGgucm91bmRTeW0oeWVhcik7XHJcblx0XHRcdFx0XHRtb250aCA9IG1hdGgucm91bmRTeW0obW9udGgpO1xyXG5cdFx0XHRcdFx0ZGF5ID0gbWF0aC5yb3VuZFN5bShkYXkpO1xyXG5cdFx0XHRcdFx0aG91ciA9IG1hdGgucm91bmRTeW0oaG91cik7XHJcblx0XHRcdFx0XHRtaW51dGUgPSBtYXRoLnJvdW5kU3ltKG1pbnV0ZSk7XHJcblx0XHRcdFx0XHRzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKHNlY29uZCk7XHJcblx0XHRcdFx0XHRtaWxsaXNlY29uZCA9IG1hdGgucm91bmRTeW0obWlsbGlzZWNvbmQpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mICh0aW1lWm9uZSkgPT09IFwib2JqZWN0XCIgJiYgdGltZVpvbmUgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IHRpbWVab25lIDogbnVsbCk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gbm9ybWFsaXplIGxvY2FsIHRpbWUgKHJlbW92ZSBub24tZXhpc3RpbmcgbG9jYWwgdGltZSlcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHZhciBsb2NhbE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCk7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsTWlsbGlzKSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IG5ldyBUaW1lU3RydWN0KHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZVRvVXRjRGF0ZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOiB7XHJcblx0XHRcdFx0dmFyIGdpdmVuU3RyaW5nID0gKDxzdHJpbmc+YTEpLnRyaW0oKTtcclxuXHRcdFx0XHR2YXIgc3M6IHN0cmluZ1tdID0gRGF0ZVRpbWUuX3NwbGl0RGF0ZUZyb21UaW1lWm9uZShnaXZlblN0cmluZyk7XHJcblx0XHRcdFx0YXNzZXJ0KHNzLmxlbmd0aCA9PT0gMiwgXCJJbnZhbGlkIGRhdGUgc3RyaW5nIGdpdmVuOiBcXFwiXCIgKyA8c3RyaW5nPmExICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRcdGlmIChhMiBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gPFRpbWVab25lPihhMik7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS56b25lKHNzWzFdKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Ly8gdXNlIG91ciBvd24gSVNPIHBhcnNpbmcgYmVjYXVzZSB0aGF0IGl0IHBsYXRmb3JtIGluZGVwZW5kZW50XHJcblx0XHRcdFx0Ly8gKGZyZWUgb2YgRGF0ZSBxdWlya3MpXHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21TdHJpbmcoc3NbMF0pO1xyXG5cdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgodGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGVUb1V0Y0RhdGUoKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcIm9iamVjdFwiOiB7XHJcblx0XHRcdFx0YXNzZXJ0KGExIGluc3RhbmNlb2YgRGF0ZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBub24tRGF0ZSBvYmplY3QgcGFzc2VkIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIixcclxuXHRcdFx0XHRcdFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZm9yIGEgRGF0ZSBvYmplY3QgYSBEYXRlRnVuY3Rpb25zIG11c3QgYmUgcGFzc2VkIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0XHRhc3NlcnQoIWEzIHx8IGEzIGluc3RhbmNlb2YgVGltZVpvbmUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdGltZVpvbmUgc2hvdWxkIGJlIGEgVGltZVpvbmUgb2JqZWN0LlwiKTtcclxuXHRcdFx0XHR2YXIgZDogRGF0ZSA9IDxEYXRlPihhMSk7XHJcblx0XHRcdFx0dmFyIGRrOiBEYXRlRnVuY3Rpb25zID0gPERhdGVGdW5jdGlvbnM+KGEyKTtcclxuXHRcdFx0XHR0aGlzLl96b25lID0gKGEzID8gYTMgOiBudWxsKTtcclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoZCwgZGspO1xyXG5cdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgodGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGVUb1V0Y0RhdGUoKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBcInVuZGVmaW5lZFwiOiB7XHJcblx0XHRcdFx0Ly8gbm90aGluZyBnaXZlbiwgbWFrZSBsb2NhbCBkYXRldGltZVxyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSBUaW1lWm9uZS5sb2NhbCgpO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGUgPSBUaW1lU3RydWN0LmZyb21EYXRlKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDKTtcclxuXHRcdFx0XHR0aGlzLl91dGNEYXRlVG9ab25lRGF0ZSgpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHVuZXhwZWN0ZWQgZmlyc3QgYXJndW1lbnQgdHlwZS5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBhIGNvcHkgb2YgdGhpcyBvYmplY3RcclxuXHQgKi9cclxuXHRwdWJsaWMgY2xvbmUoKTogRGF0ZVRpbWUge1xyXG5cdFx0dmFyIHJlc3VsdCA9IG5ldyBEYXRlVGltZSgpO1xyXG5cdFx0cmVzdWx0Ll91dGNEYXRlID0gdGhpcy5fdXRjRGF0ZS5jbG9uZSgpO1xyXG5cdFx0cmVzdWx0Ll96b25lRGF0ZSA9IHRoaXMuX3pvbmVEYXRlLmNsb25lKCk7XHJcblx0XHRyZXN1bHQuX3VuaXhVdGNNaWxsaXNDYWNoZSA9IHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZTtcclxuXHRcdHJlc3VsdC5fem9uZSA9IHRoaXMuX3pvbmU7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgdGltZSB6b25lIHRoYXQgdGhlIGRhdGUgaXMgaW4uIE1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lKCk6IFRpbWVab25lIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBuYW1lIGFiYnJldmlhdGlvbiBhdCB0aGlzIHRpbWVcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVBYmJyZXZpYXRpb24oZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRpZiAodGhpcy56b25lKCkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuem9uZSgpLmFiYnJldmlhdGlvbkZvclV0YyhcclxuXHRcdFx0XHR0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpLFxyXG5cdFx0XHRcdHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpLCB0aGlzLnV0Y01pbGxpc2Vjb25kKCksIGRzdERlcGVuZGVudCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gXCJcIjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMuIFJldHVybnMgMCBmb3IgdW5hd2FyZSBkYXRlcyBhbmQgZm9yIFVUQyBkYXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZCgodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpIC0gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpIC8gNjAwMDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUueWVhcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5tb250aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5kYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBob3VyIDAtMjNcclxuXHQgKi9cclxuXHRwdWJsaWMgaG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLmhvdXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBtaW51dGVzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUubWludXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaWxsaXNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuXHQgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrRGF5KCk6IFdlZWtEYXkge1xyXG5cdFx0cmV0dXJuIDxXZWVrRGF5PmJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5T2ZZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgc2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXHJcblx0ICovXHJcblx0cHVibGljIHVuaXhVdGNNaWxsaXMoKTogbnVtYmVyIHtcclxuXHRcdGlmICh0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGUgPT09IG51bGwpIHtcclxuXHRcdFx0dGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlID0gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS55ZWFyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLmRheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjSG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUuaG91cjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaW51dGVzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5taW51dGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUuc2Vjb25kO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0RheU9mWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y01pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIFVUQyBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtEYXkoKTogV2Vla0RheSB7XHJcblx0XHRyZXR1cm4gPFdlZWtEYXk+YmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuXHQgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla051bWJlcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrT2ZNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcblx0ICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZE9mRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXHJcblx0ICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cclxuXHQgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cclxuXHQgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxyXG5cdCAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHdpdGhab25lKHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksXHJcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCksXHJcblx0XHRcdHpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCB0aGlzIGRhdGUgdG8gdGhlIGdpdmVuIHRpbWUgem9uZSAoaW4tcGxhY2UpLlxyXG5cdCAqIFRocm93cyBpZiB0aGlzIGRhdGUgZG9lcyBub3QgaGF2ZSBhIHRpbWUgem9uZS5cclxuXHQgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcclxuXHQgKi9cclxuXHRwdWJsaWMgY29udmVydCh6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdGlmICh0aGlzLl96b25lLmVxdWFscyh6b25lKSkge1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTtcclxuXHRcdFx0XHR0aGlzLl91dGNEYXRlVG9ab25lRGF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl96b25lID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IHRoaXMuX3pvbmVEYXRlLmNsb25lKCk7XHJcblx0XHRcdHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZSA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhpcyBkYXRlIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG5cdCAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxyXG5cdCAqIENvbnZlcnRpbmcgYW4gdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGUgdGhyb3dzIGFuIGV4Y2VwdGlvbi4gVXNlIHRoZSBjb25zdHJ1Y3RvclxyXG5cdCAqIGlmIHlvdSByZWFsbHkgbmVlZCB0byBkbyB0aGF0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVcdFRoZSBuZXcgdGltZSB6b25lLiBUaGlzIG1heSBiZSBudWxsIHRvIGNyZWF0ZSB1bmF3YXJlIGRhdGUuXHJcblx0ICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9ab25lKHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuXHRcdFx0Ly8gZ28gZnJvbSB1dGMgZGF0ZSB0byBwcmVzZXJ2ZSBpdCBpbiB0aGUgcHJlc2VuY2Ugb2YgRFNUXHJcblx0XHRcdHZhciByZXN1bHQgPSB0aGlzLmNsb25lKCk7XHJcblx0XHRcdHJlc3VsdC5fem9uZSA9IHpvbmU7XHJcblx0XHRcdGlmICghcmVzdWx0Ll96b25lLmVxdWFscyh0aGlzLl96b25lKSkge1xyXG5cdFx0XHRcdHJlc3VsdC5fdXRjRGF0ZVRvWm9uZURhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCksIG51bGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cclxuXHQgKiBVbmxlc3MgdGhlIHRpbWV6b25lIGlzIGxvY2FsLCB0aGUgRGF0ZS5nZXRVVENYKCkgbWV0aG9kcyB3aWxsIE5PVCBiZSBjb3JyZWN0LlxyXG5cdCAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9EYXRlKCk6IERhdGUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkgLSAxLCB0aGlzLmRheSgpLFxyXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxyXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0V4Y2VsKHRpbWVab25lPzogVGltZVpvbmUpOiBudW1iZXIge1xyXG5cdFx0dmFyIGR0ID0gdGhpcztcclxuXHRcdGlmICh0aW1lWm9uZSAmJiAhdGltZVpvbmUuZXF1YWxzKHRoaXMuem9uZSgpKSkge1xyXG5cdFx0XHRkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcclxuXHRcdH1cclxuXHRcdHZhciBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcclxuXHRcdHZhciB1bml4VGltZXN0YW1wID0gZHQudW5peFV0Y01pbGxpcygpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXAgKyBvZmZzZXRNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXHJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcblx0ICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIHRvVXRjRXhjZWwoKTogbnVtYmVyIHtcclxuXHRcdHZhciB1bml4VGltZXN0YW1wID0gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF91bml4VGltZVN0YW1wVG9FeGNlbChuOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XHJcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcblx0XHR2YXIgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKG1zZWNzKSAqICgxIC8gODY0MDAwMDApO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhIHRpbWUgZHVyYXRpb24gcmVsYXRpdmUgdG8gVVRDLlxyXG5cdCAqIEByZXR1cm4gdGhpcyArIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGFkZChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgcmVsYXRpdmUgdG8gVVRDLCBhcyByZWd1bGFybHkgYXMgcG9zc2libGUuXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIHV0Y0hvdXIoKSBmaWVsZCwgYWRkaW5nIDEgbW9udGhcclxuXHQgKiBpbmNyZW1lbnRzIHRoZSB1dGNNb250aCgpIGZpZWxkLlxyXG5cdCAqIEFkZGluZyBhbiBhbW91bnQgb2YgdW5pdHMgbGVhdmVzIGxvd2VyIHVuaXRzIGludGFjdC4gRS5nLlxyXG5cdCAqIGFkZGluZyBhIG1vbnRoIHdpbGwgbGVhdmUgdGhlIGRheSgpIGZpZWxkIHVudG91Y2hlZCBpZiBwb3NzaWJsZS5cclxuXHQgKlxyXG5cdCAqIE5vdGUgYWRkaW5nIE1vbnRocyBvciBZZWFycyB3aWxsIGNsYW1wIHRoZSBkYXRlIHRvIHRoZSBlbmQtb2YtbW9udGggaWZcclxuXHQgKiB0aGUgc3RhcnQgZGF0ZSB3YXMgYXQgdGhlIGVuZCBvZiBhIG1vbnRoLCBpLmUuIGNvbnRyYXJ5IHRvIEphdmFTY3JpcHRcclxuXHQgKiBEYXRlI3NldFVUQ01vbnRoKCkgaXQgd2lsbCBub3Qgb3ZlcmZsb3cgaW50byB0aGUgbmV4dCBtb250aFxyXG5cdCAqXHJcblx0ICogSW4gY2FzZSBvZiBEU1QgY2hhbmdlcywgdGhlIHV0YyB0aW1lIGZpZWxkcyBhcmUgc3RpbGwgdW50b3VjaGVkIGJ1dCBsb2NhbFxyXG5cdCAqIHRpbWUgZmllbGRzIG1heSBzaGlmdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIEltcGxlbWVudGF0aW9uLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0dmFyIGFtb3VudDogbnVtYmVyO1xyXG5cdFx0dmFyIHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdHZhciBkdXJhdGlvbjogRHVyYXRpb24gPSA8RHVyYXRpb24+KGExKTtcclxuXHRcdFx0YW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcblx0XHRcdHUgPSBkdXJhdGlvbi51bml0KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcblx0XHRcdGFtb3VudCA9IDxudW1iZXI+KGExKTtcclxuXHRcdFx0dSA9IHVuaXQ7XHJcblx0XHR9XHJcblx0XHR2YXIgdXRjVG0gPSB0aGlzLl9hZGRUb1RpbWVTdHJ1Y3QodGhpcy5fdXRjRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodXRjVG0udG9Vbml4Tm9MZWFwU2VjcygpLCBUaW1lWm9uZS51dGMoKSkudG9ab25lKHRoaXMuX3pvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHRvIHRoZSB6b25lIHRpbWUsIGFzIHJlZ3VsYXJseSBhcyBwb3NzaWJsZS5cclxuXHQgKlxyXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgaG91cigpIGZpZWxkIG9mIHRoZSB6b25lXHJcblx0ICogZGF0ZSBieSBvbmUuIEluIGNhc2Ugb2YgRFNUIGNoYW5nZXMsIHRoZSB0aW1lIGZpZWxkcyBtYXkgYWRkaXRpb25hbGx5XHJcblx0ICogaW5jcmVhc2UgYnkgdGhlIERTVCBvZmZzZXQsIGlmIGEgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgd291bGRcclxuXHQgKiBiZSByZWFjaGVkIG90aGVyd2lzZS5cclxuXHQgKlxyXG5cdCAqIEFkZGluZyBhIHVuaXQgb2YgdGltZSB3aWxsIGxlYXZlIGxvd2VyLXVuaXQgZmllbGRzIGludGFjdCwgdW5sZXNzIHRoZSByZXN1bHRcclxuXHQgKiB3b3VsZCBiZSBhIG5vbi1leGlzdGluZyB0aW1lLiBUaGVuIGFuIGV4dHJhIERTVCBvZmZzZXQgaXMgYWRkZWQuXHJcblx0ICpcclxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXHJcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XHJcblx0ICogRGF0ZSNzZXRVVENNb250aCgpIGl0IHdpbGwgbm90IG92ZXJmbG93IGludG8gdGhlIG5leHQgbW9udGhcclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0cHVibGljIGFkZExvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgYW1vdW50OiBudW1iZXI7XHJcblx0XHR2YXIgdTogVGltZVVuaXQ7XHJcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0dmFyIGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdDtcclxuXHRcdH1cclxuXHRcdHZhciBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuX3pvbmVEYXRlLCBhbW91bnQsIHUpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0dmFyIGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xyXG5cdFx0XHR2YXIgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbS50b1VuaXhOb0xlYXBTZWNzKCksIGRpcmVjdGlvbik7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0udG9Vbml4Tm9MZWFwU2VjcygpLCBudWxsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cclxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcclxuXHQgKiBuZWNlc3NhcnkuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcclxuXHRcdHZhciB0YXJnZXRZZWFyOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0TW9udGg6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXREYXk6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRIb3VyczogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldE1pbnV0ZXM6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRTZWNvbmRzOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0TWlsbGlzZWNvbmRzOiBudW1iZXI7XHJcblxyXG5cdFx0c3dpdGNoICh1bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQgKiAxMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogNjAwMDApKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogMzYwMDAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDg2NDAwMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOiB7XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHtcclxuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIG1vbnRoc1wiKTtcclxuXHRcdFx0XHQvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcclxuXHRcdFx0XHRpZiAoYW1vdW50ID49IDApIHtcclxuXHRcdFx0XHRcdHRhcmdldFllYXIgPSB0bS55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5tb250aCkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0dGFyZ2V0TW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0ubW9udGggLSAxICsgTWF0aC5mbG9vcihhbW91bnQpKSwgMTIpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0YXJnZXRZZWFyID0gdG0ueWVhciArIE1hdGguZmxvb3IoKGFtb3VudCArICh0bS5tb250aCAtIDEpKSAvIDEyKTtcclxuXHRcdFx0XHRcdHRhcmdldE1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0YXJnZXREYXkgPSBNYXRoLm1pbih0bS5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh0YXJnZXRZZWFyLCB0YXJnZXRNb250aCkpO1xyXG5cdFx0XHRcdHRhcmdldEhvdXJzID0gdG0uaG91cjtcclxuXHRcdFx0XHR0YXJnZXRNaW51dGVzID0gdG0ubWludXRlO1xyXG5cdFx0XHRcdHRhcmdldFNlY29uZHMgPSB0bS5zZWNvbmQ7XHJcblx0XHRcdFx0dGFyZ2V0TWlsbGlzZWNvbmRzID0gdG0ubWlsbGk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRhcmdldFllYXIsIHRhcmdldE1vbnRoLCB0YXJnZXREYXksIHRhcmdldEhvdXJzLCB0YXJnZXRNaW51dGVzLCB0YXJnZXRTZWNvbmRzLCB0YXJnZXRNaWxsaXNlY29uZHMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgeWVhcnNcIik7XHJcblx0XHRcdFx0dGFyZ2V0WWVhciA9IHRtLnllYXIgKyBhbW91bnQ7XHJcblx0XHRcdFx0dGFyZ2V0TW9udGggPSB0bS5tb250aDtcclxuXHRcdFx0XHR0YXJnZXREYXkgPSBNYXRoLm1pbih0bS5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh0YXJnZXRZZWFyLCB0YXJnZXRNb250aCkpO1xyXG5cdFx0XHRcdHRhcmdldEhvdXJzID0gdG0uaG91cjtcclxuXHRcdFx0XHR0YXJnZXRNaW51dGVzID0gdG0ubWludXRlO1xyXG5cdFx0XHRcdHRhcmdldFNlY29uZHMgPSB0bS5zZWNvbmQ7XHJcblx0XHRcdFx0dGFyZ2V0TWlsbGlzZWNvbmRzID0gdG0ubWlsbGk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRhcmdldFllYXIsIHRhcmdldE1vbnRoLCB0YXJnZXREYXksIHRhcmdldEhvdXJzLCB0YXJnZXRNaW51dGVzLCB0YXJnZXRTZWNvbmRzLCB0YXJnZXRNaWxsaXNlY29uZHMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSBhcyBhZGQoLTEqZHVyYXRpb24pO1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWIoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogU2FtZSBhcyBhZGQoLTEqYW1vdW50LCB1bml0KTtcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWIoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiICYmIGExIGluc3RhbmNlb2YgRHVyYXRpb24pIHtcclxuXHRcdFx0dmFyIGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGQoZHVyYXRpb24ubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0dmFyIGFtb3VudDogbnVtYmVyID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGQoLTEgKiBhbW91bnQsIHVuaXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSBhcyBhZGRMb2NhbCgtMSphbW91bnQsIHVuaXQpO1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWJMb2NhbChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgYTEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoKDxEdXJhdGlvbj5hMSkubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogPG51bWJlcj5hMSwgdW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXHJcblx0ICogQHJldHVybiB0aGlzIC0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZGlmZihvdGhlcjogRGF0ZVRpbWUpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpIC0gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxyXG5cdCogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCovXHJcblx0cHVibGljIHN0YXJ0T2ZEYXkoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mTW9udGgoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcclxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXJ0T2ZZZWFyKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgPCBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgPD0gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLmVxdWFscyhvdGhlci5fdXRjRGF0ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGFuZCB0aGUgc2FtZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy5fem9uZURhdGUuZXF1YWxzKG90aGVyLl96b25lRGF0ZSlcclxuXHRcdFx0JiYgKHRoaXMuX3pvbmUgPT09IG51bGwpID09PSAob3RoZXIuX3pvbmUgPT09IG51bGwpXHJcblx0XHRcdCYmICh0aGlzLl96b25lID09PSBudWxsIHx8IHRoaXMuX3pvbmUuaWRlbnRpY2FsKG90aGVyLl96b25lKSlcclxuXHRcdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpID4gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSA+PSBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1pbihvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtYXgob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxyXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHZhciBzOiBzdHJpbmcgPSB0aGlzLl96b25lRGF0ZS50b1N0cmluZygpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0cmV0dXJuIHMgKyBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuXHQgKiBzcGVjaWZpZWQgZm9ybWF0LiBUaGUgZm9ybWF0IGlzIGltcGxlbWVudGVkIGFzIHRoZSBMRE1MIHN0YW5kYXJkXHJcblx0ICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXHJcblx0ICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgZm9ybWF0KGZvcm1hdFN0cmluZzogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBmb3JtYXQuZm9ybWF0KHRoaXMuX3pvbmVEYXRlLCB0aGlzLl91dGNEYXRlLCB0aGlzLnpvbmUoKSwgZm9ybWF0U3RyaW5nKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHR2YXIgczogc3RyaW5nID0gdGhpcy5fem9uZURhdGUudG9TdHJpbmcoKTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdGlmICh0aGlzLl96b25lLmtpbmQoKSAhPT0gVGltZVpvbmVLaW5kLk9mZnNldCkge1xyXG5cdFx0XHRcdHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBzICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBkbyBub3Qgc2VwYXJhdGUgSVNPIHpvbmVcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbRGF0ZVRpbWU6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIHZhbHVlT2YoKTogYW55IHtcclxuXHRcdHJldHVybiB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9VdGNTdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGhpcy5fem9uZURhdGUgZnJvbSB0aGlzLl91dGNEYXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdXRjRGF0ZVRvWm9uZURhdGUoKTogdm9pZCB7XHJcblx0XHR0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGUgPSBudWxsO1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHZhciBvZmZzZXQ6IG51bWJlciA9IHRoaXMuX3pvbmUub2Zmc2V0Rm9yVXRjKHRoaXMuX3V0Y0RhdGUueWVhciwgdGhpcy5fdXRjRGF0ZS5tb250aCwgdGhpcy5fdXRjRGF0ZS5kYXksXHJcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZS5ob3VyLCB0aGlzLl91dGNEYXRlLm1pbnV0ZSwgdGhpcy5fdXRjRGF0ZS5zZWNvbmQsIHRoaXMuX3V0Y0RhdGUubWlsbGkpO1xyXG5cdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgodGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZSh0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSArIG9mZnNldCAqIDYwMDAwKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl96b25lRGF0ZSA9IHRoaXMuX3V0Y0RhdGUuY2xvbmUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aGlzLl91dGNEYXRlIGZyb20gdGhpcy5fem9uZURhdGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF96b25lRGF0ZVRvVXRjRGF0ZSgpOiB2b2lkIHtcclxuXHRcdHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZSA9IG51bGw7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHR2YXIgb2Zmc2V0OiBudW1iZXIgPSB0aGlzLl96b25lLm9mZnNldEZvclpvbmUodGhpcy5fem9uZURhdGUueWVhciwgdGhpcy5fem9uZURhdGUubW9udGgsIHRoaXMuX3pvbmVEYXRlLmRheSxcclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZS5ob3VyLCB0aGlzLl96b25lRGF0ZS5taW51dGUsIHRoaXMuX3pvbmVEYXRlLnNlY29uZCwgdGhpcy5fem9uZURhdGUubWlsbGkpO1xyXG5cdFx0XHR0aGlzLl91dGNEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgLSBvZmZzZXQgKiA2MDAwMCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl91dGNEYXRlID0gdGhpcy5fem9uZURhdGUuY2xvbmUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNwbGl0IGEgY29tYmluZWQgSVNPIGRhdGV0aW1lIGFuZCB0aW1lem9uZSBpbnRvIGRhdGV0aW1lIGFuZCB0aW1lem9uZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9zcGxpdERhdGVGcm9tVGltZVpvbmUoczogc3RyaW5nKTogc3RyaW5nW10ge1xyXG5cdFx0dmFyIHRyaW1tZWQgPSBzLnRyaW0oKTtcclxuXHRcdHZhciByZXN1bHQgPSBbXCJcIiwgXCJcIl07XHJcblx0XHR2YXIgaW5kZXggPSB0cmltbWVkLmxhc3RJbmRleE9mKFwiIFwiKTtcclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXggKyAxKTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIlpcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4LCAxKTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIitcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4KTtcclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIi1cIik7XHJcblx0XHRpZiAoaW5kZXggPCA4KSB7XHJcblx0XHRcdGluZGV4ID0gLTE7IC8vIGFueSBcIi1cIiB3ZSBmb3VuZCB3YXMgYSBkYXRlIHNlcGFyYXRvclxyXG5cdFx0fVxyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRyZXN1bHRbMF0gPSB0cmltbWVkO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcbn1cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==