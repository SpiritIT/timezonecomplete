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
        if (zone === void 0) { zone = null; }
        if (allowPre1970 === void 0) { allowPre1970 = false; }
        if (!isFinite(year) || !isFinite(month) || !isFinite(day)
            || !isFinite(hour) || !isFinite(minute) || !isFinite(second) || !isFinite(millisecond)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kYXRldGltZS50cyJdLCJuYW1lcyI6WyJub3dMb2NhbCIsIm5vd1V0YyIsIm5vdyIsIkRhdGVUaW1lIiwiRGF0ZVRpbWUuY29uc3RydWN0b3IiLCJEYXRlVGltZS5ub3dMb2NhbCIsIkRhdGVUaW1lLm5vd1V0YyIsIkRhdGVUaW1lLm5vdyIsIkRhdGVUaW1lLmZyb21FeGNlbCIsIkRhdGVUaW1lLmV4aXN0cyIsIkRhdGVUaW1lLmNsb25lIiwiRGF0ZVRpbWUuem9uZSIsIkRhdGVUaW1lLnpvbmVBYmJyZXZpYXRpb24iLCJEYXRlVGltZS5vZmZzZXQiLCJEYXRlVGltZS55ZWFyIiwiRGF0ZVRpbWUubW9udGgiLCJEYXRlVGltZS5kYXkiLCJEYXRlVGltZS5ob3VyIiwiRGF0ZVRpbWUubWludXRlIiwiRGF0ZVRpbWUuc2Vjb25kIiwiRGF0ZVRpbWUubWlsbGlzZWNvbmQiLCJEYXRlVGltZS53ZWVrRGF5IiwiRGF0ZVRpbWUuZGF5T2ZZZWFyIiwiRGF0ZVRpbWUud2Vla051bWJlciIsIkRhdGVUaW1lLndlZWtPZk1vbnRoIiwiRGF0ZVRpbWUuc2Vjb25kT2ZEYXkiLCJEYXRlVGltZS51bml4VXRjTWlsbGlzIiwiRGF0ZVRpbWUudXRjWWVhciIsIkRhdGVUaW1lLnV0Y01vbnRoIiwiRGF0ZVRpbWUudXRjRGF5IiwiRGF0ZVRpbWUudXRjSG91ciIsIkRhdGVUaW1lLnV0Y01pbnV0ZSIsIkRhdGVUaW1lLnV0Y1NlY29uZCIsIkRhdGVUaW1lLnV0Y0RheU9mWWVhciIsIkRhdGVUaW1lLnV0Y01pbGxpc2Vjb25kIiwiRGF0ZVRpbWUudXRjV2Vla0RheSIsIkRhdGVUaW1lLnV0Y1dlZWtOdW1iZXIiLCJEYXRlVGltZS51dGNXZWVrT2ZNb250aCIsIkRhdGVUaW1lLnV0Y1NlY29uZE9mRGF5IiwiRGF0ZVRpbWUud2l0aFpvbmUiLCJEYXRlVGltZS5jb252ZXJ0IiwiRGF0ZVRpbWUudG9ab25lIiwiRGF0ZVRpbWUudG9EYXRlIiwiRGF0ZVRpbWUudG9FeGNlbCIsIkRhdGVUaW1lLnRvVXRjRXhjZWwiLCJEYXRlVGltZS5fdW5peFRpbWVTdGFtcFRvRXhjZWwiLCJEYXRlVGltZS5hZGQiLCJEYXRlVGltZS5hZGRMb2NhbCIsIkRhdGVUaW1lLl9hZGRUb1RpbWVTdHJ1Y3QiLCJEYXRlVGltZS5zdWIiLCJEYXRlVGltZS5zdWJMb2NhbCIsIkRhdGVUaW1lLmRpZmYiLCJEYXRlVGltZS5zdGFydE9mRGF5IiwiRGF0ZVRpbWUuc3RhcnRPZk1vbnRoIiwiRGF0ZVRpbWUuc3RhcnRPZlllYXIiLCJEYXRlVGltZS5sZXNzVGhhbiIsIkRhdGVUaW1lLmxlc3NFcXVhbCIsIkRhdGVUaW1lLmVxdWFscyIsIkRhdGVUaW1lLmlkZW50aWNhbCIsIkRhdGVUaW1lLmdyZWF0ZXJUaGFuIiwiRGF0ZVRpbWUuZ3JlYXRlckVxdWFsIiwiRGF0ZVRpbWUubWluIiwiRGF0ZVRpbWUubWF4IiwiRGF0ZVRpbWUudG9Jc29TdHJpbmciLCJEYXRlVGltZS5mb3JtYXQiLCJEYXRlVGltZS50b1N0cmluZyIsIkRhdGVUaW1lLmluc3BlY3QiLCJEYXRlVGltZS52YWx1ZU9mIiwiRGF0ZVRpbWUudG9VdGNTdHJpbmciLCJEYXRlVGltZS5fdXRjRGF0ZVRvWm9uZURhdGUiLCJEYXRlVGltZS5fem9uZURhdGVUb1V0Y0RhdGUiLCJEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXBDLElBQU8sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDdEMsSUFBTyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUVsQyxJQUFPLFFBQVEsV0FBVyxZQUFZLENBQUMsQ0FBQztBQUN4QyxJQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBRXBD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MkJBQXVCQSxHQUF2QkEsZUFBdUJBO1FBQ2pGQSxvQkFBcUJBLEdBQXJCQSxXQUFxQkE7UUFBRUEsNEJBQTZCQSxHQUE3QkEsb0JBQTZCQTtRQUVwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7ZUFDckRBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0E7WUFDSkEsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDakZBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEtBQUtBLEtBQUtBLEVBQUVBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLEdBQUdBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBO21CQUNsRUEsSUFBSUEsS0FBS0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsTUFBTUEsS0FB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LElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNqQkEsVUFBVUEsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xFQSxXQUFXQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDaEZBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDUEEsVUFBVUEsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ2xFQSxXQUFXQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDL0VBLENBQUNBO2dCQUNEQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUVBLFdBQVdBLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBO2dC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Q2tFLElBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDaENBLDBCQUEwQkE7UUFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxJQUFJQSxNQUFNQSxHQUFXQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUN0R0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDdEZBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxHQUFHQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2SEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURsRTs7T0FFR0E7SUFDS0EscUNBQWtCQSxHQUExQkE7UUFDQ21FLElBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDaENBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxJQUFJQSxNQUFNQSxHQUFXQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxFQUMxR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDMUZBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDekZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1FBQ3hDQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEbkU7O09BRUdBO0lBQ1lBLCtCQUFzQkEsR0FBckNBLFVBQXNDQSxDQUFTQTtRQUM5Q29FLElBQUlBLE9BQU9BLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ3ZCQSxJQUFJQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN0QkEsSUFBSUEsS0FBS0EsR0FBR0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLEtBQUtBLEdBQUdBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2pDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUNEQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3JDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsS0FBS0EsR0FBR0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2ZBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLHdDQUF3Q0E7UUFDckRBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNyQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLE9BQU9BLENBQUNBO1FBQ3BCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNmQSxDQUFDQTtJQS8rQkRwRTs7OztPQUlHQTtJQUNXQSxtQkFBVUEsR0FBZUEsSUFBSUEsY0FBY0EsRUFBRUEsQ0FBQ0E7SUEyK0I3REEsZUFBQ0E7QUFBREEsQ0ExZ0NBLEFBMGdDQ0EsSUFBQTtBQTFnQ1ksZ0JBQVEsV0EwZ0NwQixDQUFBIiwiZmlsZSI6ImxpYi9kYXRldGltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmQudHNcIi8+XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xyXG5cclxuaW1wb3J0IGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxuaW1wb3J0IFdlZWtEYXkgPSBiYXNpY3MuV2Vla0RheTtcclxuaW1wb3J0IFRpbWVTdHJ1Y3QgPSBiYXNpY3MuVGltZVN0cnVjdDtcclxuaW1wb3J0IFRpbWVVbml0ID0gYmFzaWNzLlRpbWVVbml0O1xyXG5cclxuaW1wb3J0IGR1cmF0aW9uID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbmltcG9ydCBEdXJhdGlvbiA9IGR1cmF0aW9uLkR1cmF0aW9uO1xyXG5cclxuaW1wb3J0IGphdmFzY3JpcHQgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG5pbXBvcnQgRGF0ZUZ1bmN0aW9ucyA9IGphdmFzY3JpcHQuRGF0ZUZ1bmN0aW9ucztcclxuXHJcbmltcG9ydCBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxuXHJcbmltcG9ydCB0aW1lc291cmNlID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcclxuaW1wb3J0IFRpbWVTb3VyY2UgPSB0aW1lc291cmNlLlRpbWVTb3VyY2U7XHJcbmltcG9ydCBSZWFsVGltZVNvdXJjZSA9IHRpbWVzb3VyY2UuUmVhbFRpbWVTb3VyY2U7XHJcblxyXG5pbXBvcnQgdGltZXpvbmUgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuaW1wb3J0IE5vcm1hbGl6ZU9wdGlvbiA9IHRpbWV6b25lLk5vcm1hbGl6ZU9wdGlvbjtcclxuaW1wb3J0IFRpbWVab25lID0gdGltZXpvbmUuVGltZVpvbmU7XHJcbmltcG9ydCBUaW1lWm9uZUtpbmQgPSB0aW1lem9uZS5UaW1lWm9uZUtpbmQ7XHJcblxyXG5pbXBvcnQgZm9ybWF0ID0gcmVxdWlyZShcIi4vZm9ybWF0XCIpO1xyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd1V0YygpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93KHRpbWVab25lOiBUaW1lWm9uZSA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcblxyXG4vKipcclxuICogRGF0ZVRpbWUgY2xhc3Mgd2hpY2ggaXMgdGltZSB6b25lLWF3YXJlXHJcbiAqIGFuZCB3aGljaCBjYW4gYmUgbW9ja2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERhdGVUaW1lIHtcclxuXHJcblx0LyoqXHJcblx0ICogRGF0ZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVwcmVzZW50ZWQgZGF0ZSBjb252ZXJ0ZWQgdG8gVVRDIGluIGl0c1xyXG5cdCAqIGdldFVUQ1h4eCgpIGZpZWxkcy5cclxuXHQgKi9cclxuXHRwcml2YXRlIF91dGNEYXRlOiBUaW1lU3RydWN0O1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWNoZWQgdmFsdWUgZm9yIHVuaXhVdGNNaWxsaXMoKS4gVGhpcyBpcyB1c2VmdWwgYmVjYXVzZSB2YWx1ZU9mKCkgdXNlcyBpdCBhbmQgaXQgaXNcclxuXHQgKiBsaWtlbHkgdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3VuaXhVdGNNaWxsaXNDYWNoZTogbnVtYmVyID0gbnVsbDtcclxuXHJcblx0LyoqXHJcblx0ICogRGF0ZSBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVwcmVzZW50ZWQgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhpcy5fem9uZSBpbiBpdHNcclxuXHQgKiBnZXRVVENYeHgoKSBmaWVsZHMuIE5vdGUgdGhhdCB0aGUgZ2V0WHh4KCkgZmllbGRzIGFyZSB1bnVzYWJsZSBmb3IgdGhpcyBwdXJwb3NlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZURhdGU6IFRpbWVTdHJ1Y3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9yaWdpbmFsIHRpbWUgem9uZSB0aGlzIGluc3RhbmNlIHdhcyBjcmVhdGVkIGZvci5cclxuXHQgKiBDYW4gYmUgTlVMTCBmb3IgdW5hd2FyZSB0aW1lc3RhbXBzXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZTogVGltZVpvbmU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFjdHVhbCB0aW1lIHNvdXJjZSBpbiB1c2UuIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBhbGxvd3MgdG9cclxuXHQgKiBmYWtlIHRpbWUgaW4gdGVzdHMuIERhdGVUaW1lLm5vd0xvY2FsKCkgYW5kIERhdGVUaW1lLm5vd1V0YygpXHJcblx0ICogdXNlIHRoaXMgcHJvcGVydHkgZm9yIG9idGFpbmluZyB0aGUgY3VycmVudCB0aW1lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgdGltZVNvdXJjZTogVGltZVNvdXJjZSA9IG5ldyBSZWFsVGltZVNvdXJjZSgpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBsb2NhbCB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgbiA9IERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG4sIERhdGVGdW5jdGlvbnMuR2V0LCBUaW1lWm9uZS5sb2NhbCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIFVUQyB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3dVdGMoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQywgVGltZVpvbmUudXRjKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIGRlc2lyZWQgdGltZSB6b25lIChvcHRpb25hbCwgZGVmYXVsdHMgdG8gVVRDKS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG5vdyh0aW1lWm9uZTogVGltZVpvbmUgPSBUaW1lWm9uZS51dGMoKSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKS50b1pvbmUodGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGEgRGF0ZVRpbWUgZnJvbSBhIExvdHVzIDEyMyAvIE1pY3Jvc29mdCBFeGNlbCBkYXRlLXRpbWUgdmFsdWVcclxuXHQgKiBpLmUuIGEgZG91YmxlIHJlcHJlc2VudGluZyBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gbiBleGNlbCBkYXRlL3RpbWUgbnVtYmVyXHJcblx0ICogQHBhcmFtIHRpbWVab25lIFRpbWUgem9uZSB0byBhc3N1bWUgdGhhdCB0aGUgZXhjZWwgdmFsdWUgaXMgaW5cclxuXHQgKiBAcmV0dXJucyBhIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBmcm9tRXhjZWwobjogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0YXNzZXJ0KHR5cGVvZiBuID09PSBcIm51bWJlclwiLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBiZSBhIG51bWJlclwiKTtcclxuXHRcdGFzc2VydCghaXNOYU4obiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHRhc3NlcnQoaXNGaW5pdGUobiksIFwiZnJvbUV4Y2VsKCk6IGZpcnN0IHBhcmFtZXRlciBtdXN0IG5vdCBiZSBOYU5cIik7XHJcblx0XHR2YXIgdW5peFRpbWVzdGFtcCA9IE1hdGgucm91bmQoKG4gLSAyNTU2OSkgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodW5peFRpbWVzdGFtcCwgdGltZVpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGRhdGUgZXhpc3RzIGluIHRoZSBnaXZlbiB0aW1lIHpvbmUuXHJcblx0ICogRS5nLiAyMDE1LTAyLTI5IHJldHVybnMgZmFsc2UgKG5vdCBhIGxlYXAgeWVhcilcclxuXHQgKiBhbmQgMjAxNS0wMy0yOVQwMjozMDowMCByZXR1cm5zIGZhbHNlIChkYXlsaWdodCBzYXZpbmcgdGltZSBtaXNzaW5nIGhvdXIpXHJcblx0ICogYW5kIDIwMTUtMDQtMzEgcmV0dXJucyBmYWxzZSAoQXByaWwgaGFzIDMwIGRheXMpLlxyXG5cdCAqIEJ5IGRlZmF1bHQsIHByZS0xOTcwIGRhdGVzIGFsc28gcmV0dXJuIGZhbHNlIHNpbmNlIHRoZSB0aW1lIHpvbmUgZGF0YWJhc2UgZG9lcyBub3QgY29udGFpbiBhY2N1cmF0ZSBpbmZvXHJcblx0ICogYmVmb3JlIHRoYXQuIFlvdSBjYW4gY2hhbmdlIHRoYXQgd2l0aCB0aGUgYWxsb3dQcmUxOTcwIGZsYWcuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gYWxsb3dQcmUxOTcwIChvcHRpb25hbCwgZGVmYXVsdCBmYWxzZSk6IHJldHVybiB0cnVlIGZvciBwcmUtMTk3MCBkYXRlc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZXhpc3RzKFxyXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyID0gMSwgZGF5OiBudW1iZXIgPSAxLFxyXG5cdFx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsIG1pbGxpc2Vjb25kOiBudW1iZXIgPSAwLFxyXG5cdFx0em9uZTogVGltZVpvbmUgPSBudWxsLCBhbGxvd1ByZTE5NzA6IGJvb2xlYW4gPSBmYWxzZVxyXG5cdCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKCFpc0Zpbml0ZSh5ZWFyKSB8fCAhaXNGaW5pdGUobW9udGgpIHx8ICFpc0Zpbml0ZShkYXkpXHJcblx0XHRcdHx8ICFpc0Zpbml0ZShob3VyKSB8fCAhaXNGaW5pdGUobWludXRlKSB8fCAhaXNGaW5pdGUoc2Vjb25kKSB8fCAhaXNGaW5pdGUobWlsbGlzZWNvbmQpKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICghYWxsb3dQcmUxOTcwICYmIHllYXIgPCAxOTcwKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHRyeSB7XHJcblx0XHRcdHZhciBkdCA9IG5ldyBEYXRlVGltZSh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQsIHpvbmUpO1xyXG5cdFx0XHRyZXR1cm4gKHllYXIgPT09IGR0LnllYXIoKSAmJiBtb250aCA9PT0gZHQubW9udGgoKSAmJiBkYXkgPT09IGR0LmRheSgpXHJcblx0XHRcdFx0JiYgaG91ciA9PT0gZHQuaG91cigpICYmIG1pbnV0ZSA9PT0gZHQubWludXRlKCkgJiYgc2Vjb25kID09PSBkdC5zZWNvbmQoKSAmJiBtaWxsaXNlY29uZCA9PT0gZHQubWlsbGlzZWNvbmQoKSk7XHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBDcmVhdGVzIGN1cnJlbnQgdGltZSBpbiBsb2NhbCB0aW1lem9uZS5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcigpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gaXNvU3RyaW5nXHRTdHJpbmcgaW4gSVNPIDg2MDEgZm9ybWF0LiBJbnN0ZWFkIG9mIElTTyB0aW1lIHpvbmUsXHJcblx0ICpcdFx0IGl0IG1heSBpbmNsdWRlIGEgc3BhY2UgYW5kIHRoZW4gYW5kIElBTkEgdGltZSB6b25lLlxyXG5cdCAqIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFwiXHRcdFx0XHRcdChubyB0aW1lIHpvbmUsIG5haXZlIGRhdGUpXHJcblx0ICogZS5nLiBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwKzAxOjAwXCJcdFx0XHRcdChVVEMgb2Zmc2V0IHdpdGhvdXQgZGF5bGlnaHQgc2F2aW5nIHRpbWUpXHJcblx0ICogb3IgICBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwWlwiXHRcdFx0XHRcdChVVEMpXHJcblx0ICogb3IgICBcIjIwMDctMDQtMDVUMTI6MzA6NDAuNTAwIEV1cm9wZS9BbXN0ZXJkYW1cIlx0KElBTkEgdGltZSB6b25lLCB3aXRoIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlmIGFwcGxpY2FibGUpXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRpZiBnaXZlbiwgdGhlIGRhdGUgaW4gdGhlIHN0cmluZyBpcyBhc3N1bWVkIHRvIGJlIGluIHRoaXMgdGltZSB6b25lLlxyXG5cdCAqXHRcdFx0XHRcdE5vdGUgdGhhdCBpdCBpcyBOT1QgQ09OVkVSVEVEIHRvIHRoZSB0aW1lIHpvbmUuIFVzZWZ1bFxyXG5cdCAqXHRcdFx0XHRcdGZvciBzdHJpbmdzIHdpdGhvdXQgYSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3Rvcihpc29TdHJpbmc6IHN0cmluZywgdGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IuIFlvdSBwcm92aWRlIGEgZGF0ZSwgdGhlbiB5b3Ugc2F5IHdoZXRoZXIgdG8gdGFrZSB0aGVcclxuXHQgKiBkYXRlLmdldFllYXIoKS9nZXRYeHggbWV0aG9kcyBvciB0aGUgZGF0ZS5nZXRVVENZZWFyKCkvZGF0ZS5nZXRVVENYeHggbWV0aG9kcyxcclxuXHQgKiBhbmQgdGhlbiB5b3Ugc3RhdGUgd2hpY2ggdGltZSB6b25lIHRoYXQgZGF0ZSBpcyBpbi5cclxuXHQgKiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYXJlIG5vcm1hbGl6ZWQgYnkgcm91bmRpbmcgdXAgdG8gdGhlIG5leHQgRFNUIG9mZnNldC5cclxuXHQgKiBOb3RlIHRoYXQgdGhlIERhdGUgY2xhc3MgaGFzIGJ1Z3MgYW5kIGluY29uc2lzdGVuY2llcyB3aGVuIGNvbnN0cnVjdGluZyB0aGVtIHdpdGggdGltZXMgYXJvdW5kXHJcblx0ICogRFNUIGNoYW5nZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZGF0ZVx0QSBkYXRlIG9iamVjdC5cclxuXHQgKiBAcGFyYW0gZ2V0dGVyc1x0U3BlY2lmaWVzIHdoaWNoIHNldCBvZiBEYXRlIGdldHRlcnMgY29udGFpbnMgdGhlIGRhdGUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZTogdGhlXHJcblx0ICpcdFx0XHRcdFx0RGF0ZS5nZXRYeHgoKSBtZXRob2RzIG9yIHRoZSBEYXRlLmdldFVUQ1h4eCgpIG1ldGhvZHMuXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHRUaGUgdGltZSB6b25lIHRoYXQgdGhlIGdpdmVuIGRhdGUgaXMgYXNzdW1lZCB0byBiZSBpbiAobWF5IGJlIG51bGwgZm9yIHVuYXdhcmUgZGF0ZXMpXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoZGF0ZTogRGF0ZSwgZ2V0RnVuY3M6IERhdGVGdW5jdGlvbnMsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBOb3RlIHRoYXQgdW5saWtlIEphdmFTY3JpcHQgZGF0ZXMgd2UgcmVxdWlyZSBmaWVsZHMgdG8gYmUgaW4gbm9ybWFsIHJhbmdlcy5cclxuXHQgKiBVc2UgdGhlIGFkZChkdXJhdGlvbikgb3Igc3ViKGR1cmF0aW9uKSBmb3IgYXJpdGhtZXRpYy5cclxuXHQgKiBAcGFyYW0geWVhclx0VGhlIGZ1bGwgeWVhciAoZS5nLiAyMDE0KVxyXG5cdCAqIEBwYXJhbSBtb250aFx0VGhlIG1vbnRoIFsxLTEyXSAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBEYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXlcdFRoZSBkYXkgb2YgdGhlIG1vbnRoIFsxLTMxXVxyXG5cdCAqIEBwYXJhbSBob3VyXHRUaGUgaG91ciBvZiB0aGUgZGF5IFswLTI0KVxyXG5cdCAqIEBwYXJhbSBtaW51dGVcdFRoZSBtaW51dGUgb2YgdGhlIGhvdXIgWzAtNTldXHJcblx0ICogQHBhcmFtIHNlY29uZFx0VGhlIHNlY29uZCBvZiB0aGUgbWludXRlIFswLTU5XVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZFx0VGhlIG1pbGxpc2Vjb25kIG9mIHRoZSBzZWNvbmQgWzAtOTk5XVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSwgb3IgbnVsbCAoZm9yIHVuYXdhcmUgZGF0ZXMpXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cj86IG51bWJlciwgbWludXRlPzogbnVtYmVyLCBzZWNvbmQ/OiBudW1iZXIsIG1pbGxpc2Vjb25kPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0gdW5peFRpbWVzdGFtcFx0bWlsbGlzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwXHJcblx0ICogQHBhcmFtIHRpbWVab25lXHR0aGUgdGltZSB6b25lIHRoYXQgdGhlIHRpbWVzdGFtcCBpcyBhc3N1bWVkIHRvIGJlIGluICh1c3VhbGx5IFVUQykuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IodW5peFRpbWVzdGFtcDogbnVtYmVyLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3IgaW1wbGVtZW50YXRpb24sIGRvIG5vdCBjYWxsXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHRhMT86IGFueSwgYTI/OiBhbnksIGEzPzogYW55LFxyXG5cdFx0aD86IG51bWJlciwgbT86IG51bWJlciwgcz86IG51bWJlciwgbXM/OiBudW1iZXIsXHJcblx0XHR0aW1lWm9uZT86IGFueSkge1xyXG5cdFx0c3dpdGNoICh0eXBlb2YgKGExKSkge1xyXG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcclxuXHRcdFx0XHRpZiAoYTIgPT09IHVuZGVmaW5lZCB8fCBhMiA9PT0gbnVsbCB8fCBhMiBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHQvLyB1bml4IHRpbWVzdGFtcCBjb25zdHJ1Y3RvclxyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGV4cGVjdCB1bml4VGltZXN0YW1wIHRvIGJlIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKGEyKSA9PT0gXCJvYmplY3RcIiAmJiBhMiBpbnN0YW5jZW9mIFRpbWVab25lID8gPFRpbWVab25lPmEyIDogbnVsbCk7XHJcblx0XHRcdFx0XHR2YXIgbm9ybWFsaXplZFVuaXhUaW1lc3RhbXA6IG51bWJlcjtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wID0gdGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShtYXRoLnJvdW5kU3ltKDxudW1iZXI+YTEpKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wID0gbWF0aC5yb3VuZFN5bSg8bnVtYmVyPmExKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peChub3JtYWxpemVkVW5peFRpbWVzdGFtcCk7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZVRvVXRjRGF0ZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyB5ZWFyIG1vbnRoIGRheSBjb25zdHJ1Y3RvclxyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCB5ZWFyIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEyKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgbW9udGggdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTMpID09PSBcIm51bWJlclwiLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IEV4cGVjdCBkYXkgdG8gYmUgYSBudW1iZXIuXCIpO1xyXG5cdFx0XHRcdFx0dmFyIHllYXI6IG51bWJlciA9IDxudW1iZXI+YTE7XHJcblx0XHRcdFx0XHR2YXIgbW9udGg6IG51bWJlciA9IDxudW1iZXI+YTI7XHJcblx0XHRcdFx0XHR2YXIgZGF5OiBudW1iZXIgPSA8bnVtYmVyPmEzO1xyXG5cdFx0XHRcdFx0dmFyIGhvdXI6IG51bWJlciA9ICh0eXBlb2YgKGgpID09PSBcIm51bWJlclwiID8gaCA6IDApO1xyXG5cdFx0XHRcdFx0dmFyIG1pbnV0ZTogbnVtYmVyID0gKHR5cGVvZiAobSkgPT09IFwibnVtYmVyXCIgPyBtIDogMCk7XHJcblx0XHRcdFx0XHR2YXIgc2Vjb25kOiBudW1iZXIgPSAodHlwZW9mIChzKSA9PT0gXCJudW1iZXJcIiA/IHMgOiAwKTtcclxuXHRcdFx0XHRcdHZhciBtaWxsaXNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAobXMpID09PSBcIm51bWJlclwiID8gbXMgOiAwKTtcclxuXHRcdFx0XHRcdGFzc2VydChtb250aCA+IDAgJiYgbW9udGggPCAxMywgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBtb250aCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KGRheSA+IDAgJiYgZGF5IDwgMzIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogZGF5IG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQoaG91ciA+PSAwICYmIGhvdXIgPCAyNCwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBob3VyIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQobWludXRlID49IDAgJiYgbWludXRlIDwgNjAsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogbWludXRlIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQoc2Vjb25kID49IDAgJiYgc2Vjb25kIDwgNjAsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogc2Vjb25kIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQobWlsbGlzZWNvbmQgPj0gMCAmJiBtaWxsaXNlY29uZCA8IDEwMDAsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogbWlsbGlzZWNvbmQgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdHllYXIgPSBtYXRoLnJvdW5kU3ltKHllYXIpO1xyXG5cdFx0XHRcdFx0bW9udGggPSBtYXRoLnJvdW5kU3ltKG1vbnRoKTtcclxuXHRcdFx0XHRcdGRheSA9IG1hdGgucm91bmRTeW0oZGF5KTtcclxuXHRcdFx0XHRcdGhvdXIgPSBtYXRoLnJvdW5kU3ltKGhvdXIpO1xyXG5cdFx0XHRcdFx0bWludXRlID0gbWF0aC5yb3VuZFN5bShtaW51dGUpO1xyXG5cdFx0XHRcdFx0c2Vjb25kID0gbWF0aC5yb3VuZFN5bShzZWNvbmQpO1xyXG5cdFx0XHRcdFx0bWlsbGlzZWNvbmQgPSBtYXRoLnJvdW5kU3ltKG1pbGxpc2Vjb25kKTtcclxuXHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gKHR5cGVvZiAodGltZVpvbmUpID09PSBcIm9iamVjdFwiICYmIHRpbWVab25lIGluc3RhbmNlb2YgVGltZVpvbmUgPyB0aW1lWm9uZSA6IG51bGwpO1xyXG5cclxuXHRcdFx0XHRcdC8vIG5vcm1hbGl6ZSBsb2NhbCB0aW1lIChyZW1vdmUgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUpXHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgbG9jYWxNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgodGhpcy5fem9uZS5ub3JtYWxpemVab25lVGltZShsb2NhbE1pbGxpcykpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBuZXcgVGltZVN0cnVjdCh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGVUb1V0Y0RhdGUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJzdHJpbmdcIjoge1xyXG5cdFx0XHRcdHZhciBnaXZlblN0cmluZyA9ICg8c3RyaW5nPmExKS50cmltKCk7XHJcblx0XHRcdFx0dmFyIHNzOiBzdHJpbmdbXSA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xyXG5cdFx0XHRcdGFzc2VydChzcy5sZW5ndGggPT09IDIsIFwiSW52YWxpZCBkYXRlIHN0cmluZyBnaXZlbjogXFxcIlwiICsgPHN0cmluZz5hMSArIFwiXFxcIlwiKTtcclxuXHRcdFx0XHRpZiAoYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IDxUaW1lWm9uZT4oYTIpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lID0gVGltZVpvbmUuem9uZShzc1sxXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8vIHVzZSBvdXIgb3duIElTTyBwYXJzaW5nIGJlY2F1c2UgdGhhdCBpdCBwbGF0Zm9ybSBpbmRlcGVuZGVudFxyXG5cdFx0XHRcdC8vIChmcmVlIG9mIERhdGUgcXVpcmtzKVxyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tU3RyaW5nKHNzWzBdKTtcclxuXHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlVG9VdGNEYXRlKCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJvYmplY3RcIjoge1xyXG5cdFx0XHRcdGFzc2VydChhMSBpbnN0YW5jZW9mIERhdGUsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogbm9uLURhdGUgb2JqZWN0IHBhc3NlZCBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuXHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsXHJcblx0XHRcdFx0XHRcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGZvciBhIERhdGUgb2JqZWN0IGEgRGF0ZUZ1bmN0aW9ucyBtdXN0IGJlIHBhc3NlZCBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcblx0XHRcdFx0YXNzZXJ0KCFhMyB8fCBhMyBpbnN0YW5jZW9mIFRpbWVab25lLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHRpbWVab25lIHNob3VsZCBiZSBhIFRpbWVab25lIG9iamVjdC5cIik7XHJcblx0XHRcdFx0dmFyIGQ6IERhdGUgPSA8RGF0ZT4oYTEpO1xyXG5cdFx0XHRcdHZhciBkazogRGF0ZUZ1bmN0aW9ucyA9IDxEYXRlRnVuY3Rpb25zPihhMik7XHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IChhMyA/IGEzIDogbnVsbCk7XHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21EYXRlKGQsIGRrKTtcclxuXHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlVG9VdGNEYXRlKCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgXCJ1bmRlZmluZWRcIjoge1xyXG5cdFx0XHRcdC8vIG5vdGhpbmcgZ2l2ZW4sIG1ha2UgbG9jYWwgZGF0ZXRpbWVcclxuXHRcdFx0XHR0aGlzLl96b25lID0gVGltZVpvbmUubG9jYWwoKTtcclxuXHRcdFx0XHR0aGlzLl91dGNEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShEYXRlVGltZS50aW1lU291cmNlLm5vdygpLCBEYXRlRnVuY3Rpb25zLkdldFVUQyk7XHJcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZVRvWm9uZURhdGUoKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJEYXRlVGltZS5EYXRlVGltZSgpOiB1bmV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHR5cGUuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYSBjb3B5IG9mIHRoaXMgb2JqZWN0XHJcblx0ICovXHJcblx0cHVibGljIGNsb25lKCk6IERhdGVUaW1lIHtcclxuXHRcdHZhciByZXN1bHQgPSBuZXcgRGF0ZVRpbWUoKTtcclxuXHRcdHJlc3VsdC5fdXRjRGF0ZSA9IHRoaXMuX3V0Y0RhdGUuY2xvbmUoKTtcclxuXHRcdHJlc3VsdC5fem9uZURhdGUgPSB0aGlzLl96b25lRGF0ZS5jbG9uZSgpO1xyXG5cdFx0cmVzdWx0Ll91bml4VXRjTWlsbGlzQ2FjaGUgPSB0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGU7XHJcblx0XHRyZXN1bHQuX3pvbmUgPSB0aGlzLl96b25lO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIHRpbWUgem9uZSB0aGF0IHRoZSBkYXRlIGlzIGluLiBNYXkgYmUgbnVsbCBmb3IgdW5hd2FyZSBkYXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZSgpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgbmFtZSBhYmJyZXZpYXRpb24gYXQgdGhpcyB0aW1lXHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqIEByZXR1cm4gVGhlIGFiYnJldmlhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lQWJicmV2aWF0aW9uKGRzdERlcGVuZGVudDogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmcge1xyXG5cdFx0aWYgKHRoaXMuem9uZSgpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnpvbmUoKS5hYmJyZXZpYXRpb25Gb3JVdGMoXHJcblx0XHRcdFx0dGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSxcclxuXHRcdFx0XHR0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSwgdGhpcy51dGNNaWxsaXNlY29uZCgpLCBkc3REZXBlbmRlbnQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLiBSZXR1cm5zIDAgZm9yIHVuYXdhcmUgZGF0ZXMgYW5kIGZvciBVVEMgZGF0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSAtIHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpKSAvIDYwMDAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuXHQgKi9cclxuXHRwdWJsaWMgeWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLnllYXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcblx0ICovXHJcblx0cHVibGljIG1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUubW9udGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUuZGF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgaG91ciAwLTIzXHJcblx0ICovXHJcblx0cHVibGljIGhvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5ob3VyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgbWludXRlcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIG1pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLm1pbnV0ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIHNlY29uZHMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5zZWNvbmQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBtaWxsaXNlY29uZHMgMC05OTlcclxuXHQgKi9cclxuXHRwdWJsaWMgbWlsbGlzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi13ZWVrICh0aGUgZW51bSB2YWx1ZXMgY29ycmVzcG9uZCB0byBKYXZhU2NyaXB0XHJcblx0ICogd2VlayBkYXkgbnVtYmVycylcclxuXHQgKi9cclxuXHRwdWJsaWMgd2Vla0RheSgpOiBXZWVrRGF5IHtcclxuXHRcdHJldHVybiA8V2Vla0RheT5iYXNpY3Mud2Vla0RheU5vTGVhcFNlY3ModGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcblx0ICovXHJcblx0cHVibGljIGRheU9mWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgSVNPIDg2MDEgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuXHQgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuXHQgKi9cclxuXHRwdWJsaWMgd2Vla051bWJlcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrT2ZNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcblx0ICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZE9mRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gTWlsbGlzZWNvbmRzIHNpbmNlIDE5NzAtMDEtMDFUMDA6MDA6MDAuMDAwWlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1bml4VXRjTWlsbGlzKCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlID09PSBudWxsKSB7XHJcblx0XHRcdHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZSA9IHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhVdGNNaWxsaXNDYWNoZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGZ1bGwgeWVhciBlLmcuIDIwMTRcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUueWVhcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IERhdGUpXHJcblx0ICovXHJcblx0cHVibGljIHV0Y01vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5tb250aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBkYXkgb2YgdGhlIG1vbnRoIDEtMzFcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5kYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgaG91ciAwLTIzXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0hvdXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLmhvdXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWludXRlcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y01pbnV0ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUubWludXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIHNlY29uZHMgMC01OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNTZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIFVUQyBkYXkgbnVtYmVyIHdpdGhpbiB0aGUgeWVhcjogSmFuIDFzdCBoYXMgbnVtYmVyIDAsXHJcblx0ICogSmFuIDJuZCBoYXMgbnVtYmVyIDEgZXRjLlxyXG5cdCAqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXllYXIgWzAtMzY2XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXlPZlllYXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3MuZGF5T2ZZZWFyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNNaWxsaXNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUubWlsbGk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBVVEMgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuXHQgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrRGF5KCk6IFdlZWtEYXkge1xyXG5cdFx0cmV0dXJuIDxXZWVrRGF5PmJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgSVNPIDg2MDEgVVRDIHdlZWsgbnVtYmVyLiBXZWVrIDEgaXMgdGhlIHdlZWtcclxuXHQgKiB0aGF0IGhhcyBKYW51YXJ5IDR0aCBpbiBpdCwgYW5kIGl0IHN0YXJ0cyBvbiBNb25kYXkuXHJcblx0ICogU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNTNdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtOdW1iZXIoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla051bWJlcih0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB3ZWVrIG9mIHRoaXMgbW9udGguIFRoZXJlIGlzIG5vIG9mZmljaWFsIHN0YW5kYXJkIGZvciB0aGlzLFxyXG5cdCAqIGJ1dCB3ZSBhc3N1bWUgdGhlIHNhbWUgcnVsZXMgZm9yIHRoZSB3ZWVrTnVtYmVyIChpLmUuXHJcblx0ICogd2VlayAxIGlzIHRoZSB3ZWVrIHRoYXQgaGFzIHRoZSA0dGggZGF5IG9mIHRoZSBtb250aCBpbiBpdClcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gV2VlayBudW1iZXIgWzEtNV1cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla09mTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Mud2Vla09mTW9udGgodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyB0aGF0IGhhdmUgcGFzc2VkIG9uIHRoZSBjdXJyZW50IGRheVxyXG5cdCAqIERvZXMgbm90IGNvbnNpZGVyIGxlYXAgc2Vjb25kc1xyXG5cdCAqXHJcblx0ICogQHJldHVybiBzZWNvbmRzIFswLTg2Mzk5XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNTZWNvbmRPZkRheSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5zZWNvbmRPZkRheSh0aGlzLnV0Y0hvdXIoKSwgdGhpcy51dGNNaW51dGUoKSwgdGhpcy51dGNTZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lIHdoaWNoIGlzIHRoZSBkYXRlK3RpbWUgcmVpbnRlcnByZXRlZCBhc1xyXG5cdCAqIGluIHRoZSBuZXcgem9uZS4gU28gZS5nLiAwODowMCBBbWVyaWNhL0NoaWNhZ28gY2FuIGJlIHNldCB0byAwODowMCBFdXJvcGUvQnJ1c3NlbHMuXHJcblx0ICogTm8gY29udmVyc2lvbiBpcyBkb25lLCB0aGUgdmFsdWUgaXMganVzdCBhc3N1bWVkIHRvIGJlIGluIGEgZGlmZmVyZW50IHpvbmUuXHJcblx0ICogV29ya3MgZm9yIG5haXZlIGFuZCBhd2FyZSBkYXRlcy4gVGhlIG5ldyB6b25lIG1heSBiZSBudWxsLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmUgVGhlIG5ldyB0aW1lIHpvbmVcclxuXHQgKiBAcmV0dXJuIEEgbmV3IERhdGVUaW1lIHdpdGggdGhlIG9yaWdpbmFsIHRpbWVzdGFtcCBhbmQgdGhlIG5ldyB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3aXRoWm9uZSh6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKFxyXG5cdFx0XHR0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLFxyXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpLFxyXG5cdFx0XHR6b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdGhpcyBkYXRlIHRvIHRoZSBnaXZlbiB0aW1lIHpvbmUgKGluLXBsYWNlKS5cclxuXHQgKiBUaHJvd3MgaWYgdGhpcyBkYXRlIGRvZXMgbm90IGhhdmUgYSB0aW1lIHpvbmUuXHJcblx0ICogQHJldHVybiB0aGlzIChmb3IgY2hhaW5pbmcpXHJcblx0ICovXHJcblx0cHVibGljIGNvbnZlcnQoem9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHpvbmUpIHtcclxuXHRcdFx0YXNzZXJ0KHRoaXMuX3pvbmUsIFwiRGF0ZVRpbWUudG9ab25lKCk6IENhbm5vdCBjb252ZXJ0IHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlXCIpO1xyXG5cdFx0XHRpZiAodGhpcy5fem9uZS5lcXVhbHMoem9uZSkpIHtcclxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTsgLy8gc3RpbGwgYXNzaWduLCBiZWNhdXNlIHpvbmVzIG1heSBiZSBlcXVhbCBidXQgbm90IGlkZW50aWNhbCAoVVRDL0dNVC8rMDApXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IHpvbmU7XHJcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZVRvWm9uZURhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fem9uZSA9IG51bGw7XHJcblx0XHRcdHRoaXMuX3V0Y0RhdGUgPSB0aGlzLl96b25lRGF0ZS5jbG9uZSgpO1xyXG5cdFx0XHR0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGUgPSBudWxsO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoaXMgZGF0ZSBjb252ZXJ0ZWQgdG8gdGhlIGdpdmVuIHRpbWUgem9uZS5cclxuXHQgKiBVbmF3YXJlIGRhdGVzIGNhbiBvbmx5IGJlIGNvbnZlcnRlZCB0byB1bmF3YXJlIGRhdGVzIChjbG9uZSlcclxuXHQgKiBDb252ZXJ0aW5nIGFuIHVuYXdhcmUgZGF0ZSB0byBhbiBhd2FyZSBkYXRlIHRocm93cyBhbiBleGNlcHRpb24uIFVzZSB0aGUgY29uc3RydWN0b3JcclxuXHQgKiBpZiB5b3UgcmVhbGx5IG5lZWQgdG8gZG8gdGhhdC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lXHRUaGUgbmV3IHRpbWUgem9uZS4gVGhpcyBtYXkgYmUgbnVsbCB0byBjcmVhdGUgdW5hd2FyZSBkYXRlLlxyXG5cdCAqIEByZXR1cm4gVGhlIGNvbnZlcnRlZCBkYXRlXHJcblx0ICovXHJcblx0cHVibGljIHRvWm9uZSh6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdC8vIGdvIGZyb20gdXRjIGRhdGUgdG8gcHJlc2VydmUgaXQgaW4gdGhlIHByZXNlbmNlIG9mIERTVFxyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdGhpcy5jbG9uZSgpO1xyXG5cdFx0XHRyZXN1bHQuX3pvbmUgPSB6b25lO1xyXG5cdFx0XHRpZiAoIXJlc3VsdC5fem9uZS5lcXVhbHModGhpcy5fem9uZSkpIHtcclxuXHRcdFx0XHRyZXN1bHQuX3V0Y0RhdGVUb1pvbmVEYXRlKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpLCBudWxsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgdG8gSmF2YVNjcmlwdCBkYXRlIHdpdGggdGhlIHpvbmUgdGltZSBpbiB0aGUgZ2V0WCgpIG1ldGhvZHMuXHJcblx0ICogVW5sZXNzIHRoZSB0aW1lem9uZSBpcyBsb2NhbCwgdGhlIERhdGUuZ2V0VVRDWCgpIG1ldGhvZHMgd2lsbCBOT1QgYmUgY29ycmVjdC5cclxuXHQgKiBUaGlzIGlzIGJlY2F1c2UgRGF0ZSBjYWxjdWxhdGVzIGdldFVUQ1goKSBmcm9tIGdldFgoKSBhcHBseWluZyBsb2NhbCB0aW1lIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHRvRGF0ZSgpOiBEYXRlIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpIC0gMSwgdGhpcy5kYXkoKSxcclxuXHRcdFx0dGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCksIHRoaXMubWlsbGlzZWNvbmQoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgYW4gRXhjZWwgdGltZXN0YW1wIGZvciB0aGlzIGRhdGV0aW1lIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gem9uZS5cclxuXHQgKiBEb2VzIG5vdCB3b3JrIGZvciBkYXRlcyA8IDE5MDBcclxuXHQgKiBAcGFyYW0gdGltZVpvbmUgT3B0aW9uYWwuIFpvbmUgdG8gY29udmVydCB0bywgZGVmYXVsdCB0aGUgem9uZSB0aGUgZGF0ZXRpbWUgaXMgYWxyZWFkeSBpbi5cclxuXHQgKiBAcmV0dXJuIGFuIEV4Y2VsIGRhdGUvdGltZSBudW1iZXIgaS5lLiBkYXlzIHNpbmNlIDEtMS0xOTAwIHdoZXJlIDE5MDAgaXMgaW5jb3JyZWN0bHkgc2VlbiBhcyBsZWFwIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9FeGNlbCh0aW1lWm9uZT86IFRpbWVab25lKTogbnVtYmVyIHtcclxuXHRcdHZhciBkdCA9IHRoaXM7XHJcblx0XHRpZiAodGltZVpvbmUgJiYgIXRpbWVab25lLmVxdWFscyh0aGlzLnpvbmUoKSkpIHtcclxuXHRcdFx0ZHQgPSB0aGlzLnRvWm9uZSh0aW1lWm9uZSk7XHJcblx0XHR9XHJcblx0XHR2YXIgb2Zmc2V0TWlsbGlzID0gZHQub2Zmc2V0KCkgKiA2MCAqIDEwMDA7XHJcblx0XHR2YXIgdW5peFRpbWVzdGFtcCA9IGR0LnVuaXhVdGNNaWxsaXMoKTtcclxuXHRcdHJldHVybiB0aGlzLl91bml4VGltZVN0YW1wVG9FeGNlbCh1bml4VGltZXN0YW1wICsgb2Zmc2V0TWlsbGlzKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIFVUQ1xyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1V0Y0V4Y2VsKCk6IG51bWJlciB7XHJcblx0XHR2YXIgdW5peFRpbWVzdGFtcCA9IHRoaXMudW5peFV0Y01pbGxpcygpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXApO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBfdW5peFRpbWVTdGFtcFRvRXhjZWwobjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdHZhciByZXN1bHQgPSAoKG4pIC8gKDI0ICogNjAgKiA2MCAqIDEwMDApKSArIDI1NTY5O1xyXG5cdFx0Ly8gcm91bmQgdG8gbmVhcmVzdCBtaWxsaXNlY29uZFxyXG5cdFx0dmFyIG1zZWNzID0gcmVzdWx0IC8gKDEgLyA4NjQwMDAwMCk7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChtc2VjcykgKiAoMSAvIDg2NDAwMDAwKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYSB0aW1lIGR1cmF0aW9uIHJlbGF0aXZlIHRvIFVUQy5cclxuXHQgKiBAcmV0dXJuIHRoaXMgKyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhZGQoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0LyoqXHJcblx0ICogQWRkIGFuIGFtb3VudCBvZiB0aW1lIHJlbGF0aXZlIHRvIFVUQywgYXMgcmVndWxhcmx5IGFzIHBvc3NpYmxlLlxyXG5cdCAqXHJcblx0ICogQWRkaW5nIGUuZy4gMSBob3VyIHdpbGwgaW5jcmVtZW50IHRoZSB1dGNIb3VyKCkgZmllbGQsIGFkZGluZyAxIG1vbnRoXHJcblx0ICogaW5jcmVtZW50cyB0aGUgdXRjTW9udGgoKSBmaWVsZC5cclxuXHQgKiBBZGRpbmcgYW4gYW1vdW50IG9mIHVuaXRzIGxlYXZlcyBsb3dlciB1bml0cyBpbnRhY3QuIEUuZy5cclxuXHQgKiBhZGRpbmcgYSBtb250aCB3aWxsIGxlYXZlIHRoZSBkYXkoKSBmaWVsZCB1bnRvdWNoZWQgaWYgcG9zc2libGUuXHJcblx0ICpcclxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXHJcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XHJcblx0ICogRGF0ZSNzZXRVVENNb250aCgpIGl0IHdpbGwgbm90IG92ZXJmbG93IGludG8gdGhlIG5leHQgbW9udGhcclxuXHQgKlxyXG5cdCAqIEluIGNhc2Ugb2YgRFNUIGNoYW5nZXMsIHRoZSB1dGMgdGltZSBmaWVsZHMgYXJlIHN0aWxsIHVudG91Y2hlZCBidXQgbG9jYWxcclxuXHQgKiB0aW1lIGZpZWxkcyBtYXkgc2hpZnQuXHJcblx0ICovXHJcblx0cHVibGljIGFkZChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBJbXBsZW1lbnRhdGlvbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdHZhciBhbW91bnQ6IG51bWJlcjtcclxuXHRcdHZhciB1OiBUaW1lVW5pdDtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHR2YXIgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhbW91bnQgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHUgPSB1bml0O1xyXG5cdFx0fVxyXG5cdFx0dmFyIHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuX3V0Y0RhdGUsIGFtb3VudCwgdSk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHV0Y1RtLnRvVW5peE5vTGVhcFNlY3MoKSwgVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgem9uZSB0aW1lLCBhcyByZWd1bGFybHkgYXMgcG9zc2libGUuXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgZS5nLiAxIGhvdXIgd2lsbCBpbmNyZW1lbnQgdGhlIGhvdXIoKSBmaWVsZCBvZiB0aGUgem9uZVxyXG5cdCAqIGRhdGUgYnkgb25lLiBJbiBjYXNlIG9mIERTVCBjaGFuZ2VzLCB0aGUgdGltZSBmaWVsZHMgbWF5IGFkZGl0aW9uYWxseVxyXG5cdCAqIGluY3JlYXNlIGJ5IHRoZSBEU1Qgb2Zmc2V0LCBpZiBhIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lIHdvdWxkXHJcblx0ICogYmUgcmVhY2hlZCBvdGhlcndpc2UuXHJcblx0ICpcclxuXHQgKiBBZGRpbmcgYSB1bml0IG9mIHRpbWUgd2lsbCBsZWF2ZSBsb3dlci11bml0IGZpZWxkcyBpbnRhY3QsIHVubGVzcyB0aGUgcmVzdWx0XHJcblx0ICogd291bGQgYmUgYSBub24tZXhpc3RpbmcgdGltZS4gVGhlbiBhbiBleHRyYSBEU1Qgb2Zmc2V0IGlzIGFkZGVkLlxyXG5cdCAqXHJcblx0ICogTm90ZSBhZGRpbmcgTW9udGhzIG9yIFllYXJzIHdpbGwgY2xhbXAgdGhlIGRhdGUgdG8gdGhlIGVuZC1vZi1tb250aCBpZlxyXG5cdCAqIHRoZSBzdGFydCBkYXRlIHdhcyBhdCB0aGUgZW5kIG9mIGEgbW9udGgsIGkuZS4gY29udHJhcnkgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIERhdGUjc2V0VVRDTW9udGgoKSBpdCB3aWxsIG5vdCBvdmVyZmxvdyBpbnRvIHRoZSBuZXh0IG1vbnRoXHJcblx0ICovXHJcblx0cHVibGljIGFkZExvY2FsKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgYWRkTG9jYWwoYTE6IGFueSwgdW5pdD86IFRpbWVVbml0KTogRGF0ZVRpbWUge1xyXG5cdFx0dmFyIGFtb3VudDogbnVtYmVyO1xyXG5cdFx0dmFyIHU6IFRpbWVVbml0O1xyXG5cdFx0aWYgKHR5cGVvZiAoYTEpID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdHZhciBkdXJhdGlvbjogRHVyYXRpb24gPSA8RHVyYXRpb24+KGExKTtcclxuXHRcdFx0YW1vdW50ID0gZHVyYXRpb24uYW1vdW50KCk7XHJcblx0XHRcdHUgPSBkdXJhdGlvbi51bml0KCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcblx0XHRcdGFtb3VudCA9IDxudW1iZXI+KGExKTtcclxuXHRcdFx0dSA9IHVuaXQ7XHJcblx0XHR9XHJcblx0XHR2YXIgbG9jYWxUbSA9IHRoaXMuX2FkZFRvVGltZVN0cnVjdCh0aGlzLl96b25lRGF0ZSwgYW1vdW50LCB1KTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHZhciBkaXJlY3Rpb246IE5vcm1hbGl6ZU9wdGlvbiA9IChhbW91bnQgPj0gMCA/IE5vcm1hbGl6ZU9wdGlvbi5VcCA6IE5vcm1hbGl6ZU9wdGlvbi5Eb3duKTtcclxuXHRcdFx0dmFyIG5vcm1hbGl6ZWQgPSB0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKGxvY2FsVG0udG9Vbml4Tm9MZWFwU2VjcygpLCBkaXJlY3Rpb24pO1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKG5vcm1hbGl6ZWQsIHRoaXMuX3pvbmUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZShsb2NhbFRtLnRvVW5peE5vTGVhcFNlY3MoKSwgbnVsbCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgYW4gYW1vdW50IG9mIHRpbWUgdG8gdGhlIGdpdmVuIHRpbWUgc3RydWN0LiBOb3RlOiBkb2VzIG5vdCBub3JtYWxpemUuXHJcblx0ICogS2VlcHMgbG93ZXIgdW5pdCBmaWVsZHMgdGhlIHNhbWUgd2hlcmUgcG9zc2libGUsIGNsYW1wcyBkYXkgdG8gZW5kLW9mLW1vbnRoIGlmXHJcblx0ICogbmVjZXNzYXJ5LlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2FkZFRvVGltZVN0cnVjdCh0bTogVGltZVN0cnVjdCwgYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogVGltZVN0cnVjdCB7XHJcblx0XHR2YXIgdGFyZ2V0WWVhcjogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldE1vbnRoOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0RGF5OiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0SG91cnM6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRNaW51dGVzOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0U2Vjb25kczogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldE1pbGxpc2Vjb25kczogbnVtYmVyO1xyXG5cclxuXHRcdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiB7XHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlNlY29uZDoge1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogMTAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiB7XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDYwMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiB7XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDM2MDAwMDApKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkRheToge1xyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQgKiA4NjQwMDAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuV2Vlazoge1xyXG5cdFx0XHRcdC8vIHRvZG8gbW9yZSBpbnRlbGxpZ2VudCBhcHByb2FjaCBuZWVkZWQgd2hlbiBpbXBsZW1lbnRpbmcgbGVhcCBzZWNvbmRzXHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQgKiA3ICogODY0MDAwMDApKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XHJcblx0XHRcdFx0YXNzZXJ0KG1hdGguaXNJbnQoYW1vdW50KSwgXCJDYW5ub3QgYWRkL3N1YiBhIG5vbi1pbnRlZ2VyIGFtb3VudCBvZiBtb250aHNcIik7XHJcblx0XHRcdFx0Ly8ga2VlcCB0aGUgZGF5LW9mLW1vbnRoIHRoZSBzYW1lIChjbGFtcCB0byBlbmQtb2YtbW9udGgpXHJcblx0XHRcdFx0aWYgKGFtb3VudCA+PSAwKSB7XHJcblx0XHRcdFx0XHR0YXJnZXRZZWFyID0gdG0ueWVhciArIE1hdGguY2VpbCgoYW1vdW50IC0gKDEyIC0gdG0ubW9udGgpKSAvIDEyKTtcclxuXHRcdFx0XHRcdHRhcmdldE1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLm1vbnRoIC0gMSArIE1hdGguZmxvb3IoYW1vdW50KSksIDEyKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGFyZ2V0WWVhciA9IHRtLnllYXIgKyBNYXRoLmZsb29yKChhbW91bnQgKyAodG0ubW9udGggLSAxKSkgLyAxMik7XHJcblx0XHRcdFx0XHR0YXJnZXRNb250aCA9IDEgKyBtYXRoLnBvc2l0aXZlTW9kdWxvKCh0bS5tb250aCAtIDEgKyBNYXRoLmNlaWwoYW1vdW50KSksIDEyKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGFyZ2V0RGF5ID0gTWF0aC5taW4odG0uZGF5LCBiYXNpY3MuZGF5c0luTW9udGgodGFyZ2V0WWVhciwgdGFyZ2V0TW9udGgpKTtcclxuXHRcdFx0XHR0YXJnZXRIb3VycyA9IHRtLmhvdXI7XHJcblx0XHRcdFx0dGFyZ2V0TWludXRlcyA9IHRtLm1pbnV0ZTtcclxuXHRcdFx0XHR0YXJnZXRTZWNvbmRzID0gdG0uc2Vjb25kO1xyXG5cdFx0XHRcdHRhcmdldE1pbGxpc2Vjb25kcyA9IHRtLm1pbGxpO1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0YXJnZXRZZWFyLCB0YXJnZXRNb250aCwgdGFyZ2V0RGF5LCB0YXJnZXRIb3VycywgdGFyZ2V0TWludXRlcywgdGFyZ2V0U2Vjb25kcywgdGFyZ2V0TWlsbGlzZWNvbmRzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LlllYXI6IHtcclxuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIHllYXJzXCIpO1xyXG5cdFx0XHRcdHRhcmdldFllYXIgPSB0bS55ZWFyICsgYW1vdW50O1xyXG5cdFx0XHRcdHRhcmdldE1vbnRoID0gdG0ubW9udGg7XHJcblx0XHRcdFx0dGFyZ2V0RGF5ID0gTWF0aC5taW4odG0uZGF5LCBiYXNpY3MuZGF5c0luTW9udGgodGFyZ2V0WWVhciwgdGFyZ2V0TW9udGgpKTtcclxuXHRcdFx0XHR0YXJnZXRIb3VycyA9IHRtLmhvdXI7XHJcblx0XHRcdFx0dGFyZ2V0TWludXRlcyA9IHRtLm1pbnV0ZTtcclxuXHRcdFx0XHR0YXJnZXRTZWNvbmRzID0gdG0uc2Vjb25kO1xyXG5cdFx0XHRcdHRhcmdldE1pbGxpc2Vjb25kcyA9IHRtLm1pbGxpO1xyXG5cdFx0XHRcdHJldHVybiBuZXcgVGltZVN0cnVjdCh0YXJnZXRZZWFyLCB0YXJnZXRNb250aCwgdGFyZ2V0RGF5LCB0YXJnZXRIb3VycywgdGFyZ2V0TWludXRlcywgdGFyZ2V0U2Vjb25kcywgdGFyZ2V0TWlsbGlzZWNvbmRzKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkKC0xKmR1cmF0aW9uKTtcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkKC0xKmFtb3VudCwgdW5pdCk7XHJcblx0ICovXHJcblx0cHVibGljIHN1YihhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIiAmJiBhMSBpbnN0YW5jZW9mIER1cmF0aW9uKSB7XHJcblx0XHRcdHZhciBkdXJhdGlvbjogRHVyYXRpb24gPSA8RHVyYXRpb24+KGExKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKGR1cmF0aW9uLm11bHRpcGx5KC0xKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcblx0XHRcdHZhciBhbW91bnQ6IG51bWJlciA9IDxudW1iZXI+KGExKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkTG9jYWwoLTEqYW1vdW50LCB1bml0KTtcclxuXHQgKi9cclxuXHRwdWJsaWMgc3ViTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBzdWJMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodHlwZW9mIGExID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKCg8RHVyYXRpb24+YTEpLm11bHRpcGx5KC0xKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRMb2NhbCgtMSAqIDxudW1iZXI+YTEsIHVuaXQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSBkaWZmZXJlbmNlIGJldHdlZW4gdHdvIERhdGVUaW1lc1xyXG5cdCAqIEByZXR1cm4gdGhpcyAtIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGRpZmYob3RoZXI6IERhdGVUaW1lKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSAtIG90aGVyLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQqIENob3BzIG9mZiB0aGUgdGltZSBwYXJ0LCB5aWVsZHMgdGhlIHNhbWUgZGF0ZSBhdCAwMDowMDowMC4wMDBcclxuXHQqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQqL1xyXG5cdHB1YmxpYyBzdGFydE9mRGF5KCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSBtb250aCBhdCAwMDowMDowMFxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhcnRPZk1vbnRoKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgMSwgMCwgMCwgMCwgMCwgdGhpcy56b25lKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB5ZWFyIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mWWVhcigpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHRoaXMueWVhcigpLCAxLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDwgb3RoZXIpXHJcblx0ICovXHJcblx0cHVibGljIGxlc3NUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpIDwgb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpIDw9IG90aGVyLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIG1vbWVudCBpbiB0aW1lIGluIFVUQ1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5lcXVhbHMob3RoZXIuX3V0Y0RhdGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgdGltZSBhbmQgdGhlIHNhbWUgem9uZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX3pvbmVEYXRlLmVxdWFscyhvdGhlci5fem9uZURhdGUpXHJcblx0XHRcdCYmICh0aGlzLl96b25lID09PSBudWxsKSA9PT0gKG90aGVyLl96b25lID09PSBudWxsKVxyXG5cdFx0XHQmJiAodGhpcy5fem9uZSA9PT0gbnVsbCB8fCB0aGlzLl96b25lLmlkZW50aWNhbChvdGhlci5fem9uZSkpXHJcblx0XHRcdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgPiBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBncmVhdGVyVGhhbihvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSA+IG90aGVyLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBncmVhdGVyRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgPj0gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbWluaW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW4ob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1heGltdW0gb2YgdGhpcyBhbmQgb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4KG90aGVyOiBEYXRlVGltZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0aGlzLmdyZWF0ZXJUaGFuKG90aGVyKSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG90aGVyLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQcm9wZXIgSVNPIDg2MDEgZm9ybWF0IHN0cmluZyB3aXRoIGFueSBJQU5BIHpvbmUgY29udmVydGVkIHRvIElTTyBvZmZzZXRcclxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMyswMTowMFwiIGZvciBFdXJvcGUvQW1zdGVyZGFtXHJcblx0ICovXHJcblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHR2YXIgczogc3RyaW5nID0gdGhpcy5fem9uZURhdGUudG9TdHJpbmcoKTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdHJldHVybiBzICsgVGltZVpvbmUub2Zmc2V0VG9TdHJpbmcodGhpcy5vZmZzZXQoKSk7IC8vIGNvbnZlcnQgSUFOQSBuYW1lIHRvIG9mZnNldFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBEYXRlVGltZSBhY2NvcmRpbmcgdG8gdGhlXHJcblx0ICogc3BlY2lmaWVkIGZvcm1hdC4gVGhlIGZvcm1hdCBpcyBpbXBsZW1lbnRlZCBhcyB0aGUgTERNTCBzdGFuZGFyZFxyXG5cdCAqIChodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0Zvcm1hdF9QYXR0ZXJucylcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIChlLmcuIFwiZGQvTU0veXl5eSBISDptbTpzc1wiKVxyXG5cdCAqIEByZXR1cm4gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIGZvcm1hdChmb3JtYXRTdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gZm9ybWF0LmZvcm1hdCh0aGlzLl96b25lRGF0ZSwgdGhpcy5fdXRjRGF0ZSwgdGhpcy56b25lKCksIGZvcm1hdFN0cmluZyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggSUFOQSBuYW1lIGlmIGFwcGxpY2FibGUuXHJcblx0ICogRS5nLiBcIjIwMTQtMDEtMDFUMjM6MTU6MzMuMDAwIEV1cm9wZS9BbXN0ZXJkYW1cIlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0dmFyIHM6IHN0cmluZyA9IHRoaXMuX3pvbmVEYXRlLnRvU3RyaW5nKCk7XHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRpZiAodGhpcy5fem9uZS5raW5kKCkgIT09IFRpbWVab25lS2luZC5PZmZzZXQpIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIFwiIFwiICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBzZXBhcmF0ZSBJQU5BIG5hbWUgb3IgXCJsb2NhbHRpbWVcIiB3aXRoIGEgc3BhY2VcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gcyArIHRoaXMuX3pvbmUudG9TdHJpbmcoKTsgLy8gZG8gbm90IHNlcGFyYXRlIElTTyB6b25lXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBzOyAvLyBubyB6b25lIHByZXNlbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW0RhdGVUaW1lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XHJcblx0XHRyZXR1cm4gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNb2RpZmllZCBJU08gODYwMSBmb3JtYXQgc3RyaW5nIGluIFVUQyB3aXRob3V0IHRpbWUgem9uZSBpbmZvXHJcblx0ICovXHJcblx0cHVibGljIHRvVXRjU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1N0cmluZygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlIHRoaXMuX3pvbmVEYXRlIGZyb20gdGhpcy5fdXRjRGF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3V0Y0RhdGVUb1pvbmVEYXRlKCk6IHZvaWQge1xyXG5cdFx0dGhpcy5fdW5peFV0Y01pbGxpc0NhY2hlID0gbnVsbDtcclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXHJcblx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHR2YXIgb2Zmc2V0OiBudW1iZXIgPSB0aGlzLl96b25lLm9mZnNldEZvclV0Yyh0aGlzLl91dGNEYXRlLnllYXIsIHRoaXMuX3V0Y0RhdGUubW9udGgsIHRoaXMuX3V0Y0RhdGUuZGF5LFxyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGUuaG91ciwgdGhpcy5fdXRjRGF0ZS5taW51dGUsIHRoaXMuX3V0Y0RhdGUuc2Vjb25kLCB0aGlzLl91dGNEYXRlLm1pbGxpKTtcclxuXHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUodGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgKyBvZmZzZXQgKiA2MDAwMCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fem9uZURhdGUgPSB0aGlzLl91dGNEYXRlLmNsb25lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGhpcy5fdXRjRGF0ZSBmcm9tIHRoaXMuX3pvbmVEYXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZURhdGVUb1V0Y0RhdGUoKTogdm9pZCB7XHJcblx0XHR0aGlzLl91bml4VXRjTWlsbGlzQ2FjaGUgPSBudWxsO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0dmFyIG9mZnNldDogbnVtYmVyID0gdGhpcy5fem9uZS5vZmZzZXRGb3Jab25lKHRoaXMuX3pvbmVEYXRlLnllYXIsIHRoaXMuX3pvbmVEYXRlLm1vbnRoLCB0aGlzLl96b25lRGF0ZS5kYXksXHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUuaG91ciwgdGhpcy5fem9uZURhdGUubWludXRlLCB0aGlzLl96b25lRGF0ZS5zZWNvbmQsIHRoaXMuX3pvbmVEYXRlLm1pbGxpKTtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpIC0gb2Zmc2V0ICogNjAwMDApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IHRoaXMuX3pvbmVEYXRlLmNsb25lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfc3BsaXREYXRlRnJvbVRpbWVab25lKHM6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRcdHZhciB0cmltbWVkID0gcy50cmltKCk7XHJcblx0XHR2YXIgcmVzdWx0ID0gW1wiXCIsIFwiXCJdO1xyXG5cdFx0dmFyIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIiBcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJaXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIrXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCItXCIpO1xyXG5cdFx0aWYgKGluZGV4IDwgOCkge1xyXG5cdFx0XHRpbmRleCA9IC0xOyAvLyBhbnkgXCItXCIgd2UgZm91bmQgd2FzIGEgZGF0ZSBzZXBhcmF0b3JcclxuXHRcdH1cclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0WzBdID0gdHJpbW1lZDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG59XHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
