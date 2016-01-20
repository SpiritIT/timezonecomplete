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
var parseFuncs = require("./parse");
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
 * Cache for timestruct -> utc millis conversion
 */
var UtcMillisCache = (function () {
    function UtcMillisCache() {
        this.MAX_CACHE_SIZE = 1000;
        this._lastSeqNo = 0;
        this._cache = [];
    }
    /**
     * Returns the unix milliseconds for a given time struct
     */
    UtcMillisCache.prototype.timeStruct2UtcMillis = function (timeStruct) {
        var _this = this;
        var cacheElement;
        var isoString = timeStruct.toString();
        var index = basics.binaryInsertionIndex(this._cache, function (a) {
            return (a.isoString < isoString ? -1 : (a.isoString > isoString ? 1 : 0));
        });
        // element found in cache?
        if (index >= 0 && index < this._cache.length && this._cache[index].isoString === isoString) {
            cacheElement = this._cache[index];
            // mark cache element as recently used
            if (cacheElement.seqNo < this._lastSeqNo) {
                this._lastSeqNo++;
                cacheElement.seqNo = this._lastSeqNo;
            }
            return cacheElement.unixUtcMillis;
        }
        else {
            // if oversized, trim cache by throwing away elements not recently used
            if (this._cache.length >= this.MAX_CACHE_SIZE) {
                this._cache = this._cache.filter(function (element) {
                    return (element.seqNo >= _this._lastSeqNo - _this.MAX_CACHE_SIZE / 2);
                });
            }
            // add element to cache
            var unixUtcMillis = timeStruct.toUnixNoLeapSecs();
            this._lastSeqNo++;
            cacheElement = {
                isoString: isoString,
                unixUtcMillis: unixUtcMillis,
                seqNo: this._lastSeqNo
            };
            this._cache.splice(index, 0, cacheElement);
            return unixUtcMillis;
        }
    };
    /**
     * The current cache size, for testing purposes
     */
    UtcMillisCache.prototype.size = function () {
        return this._cache.length;
    };
    return UtcMillisCache;
})();
exports.UtcMillisCache = UtcMillisCache;
exports.UTC_MILLIS_CACHE = new UtcMillisCache();
/**
 * DateTime class which is time zone-aware
 * and which can be mocked for testing purposes.
 */
var DateTime = (function () {
    /**
     * Constructor implementation, do not call
     */
    function DateTime(a1, a2, a3, h, m, s, ms, timeZone) {
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
                    if (typeof a2 === "string") {
                        // format string given
                        var dateString = a1;
                        var formatString = a2;
                        var zone = null;
                        if (typeof a3 === "object" && a3 instanceof TimeZone) {
                            zone = (a3);
                        }
                        var parsed = parseFuncs.parse(dateString, formatString, zone);
                        this._zoneDate = parsed.time;
                        this._zone = parsed.zone;
                    }
                    else {
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
        return exports.UTC_MILLIS_CACHE.timeStruct2UtcMillis(this._utcDate);
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
     * @param formatOptions Optional, non-english format month names etc.
     * @return The string representation of this DateTime
     */
    DateTime.prototype.format = function (formatString, formatOptions) {
        return format.format(this._zoneDate, this._utcDate, this.zone(), formatString, formatOptions);
    };
    /**
     * Parse a date in a given format
     * @param s the string to parse
     * @param format the format the string is in
     * @param zone Optional, the zone to add (if no zone is given in the string)
     */
    DateTime.parse = function (s, format, zone) {
        var parsed = parseFuncs.parse(s, format, zone);
        return new DateTime(parsed.time.year, parsed.time.month, parsed.time.day, parsed.time.hour, parsed.time.minute, parsed.time.second, parsed.time.milli, parsed.zone);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kYXRldGltZS50cyJdLCJuYW1lcyI6WyJub3dMb2NhbCIsIm5vd1V0YyIsIm5vdyIsIlV0Y01pbGxpc0NhY2hlIiwiVXRjTWlsbGlzQ2FjaGUuY29uc3RydWN0b3IiLCJVdGNNaWxsaXNDYWNoZS50aW1lU3RydWN0MlV0Y01pbGxpcyIsIlV0Y01pbGxpc0NhY2hlLnNpemUiLCJEYXRlVGltZSIsIkRhdGVUaW1lLmNvbnN0cnVjdG9yIiwiRGF0ZVRpbWUubm93TG9jYWwiLCJEYXRlVGltZS5ub3dVdGMiLCJEYXRlVGltZS5ub3ciLCJEYXRlVGltZS5mcm9tRXhjZWwiLCJEYXRlVGltZS5leGlzdHMiLCJEYXRlVGltZS5jbG9uZSIsIkRhdGVUaW1lLnpvbmUiLCJEYXRlVGltZS56b25lQWJicmV2aWF0aW9uIiwiRGF0ZVRpbWUub2Zmc2V0IiwiRGF0ZVRpbWUueWVhciIsIkRhdGVUaW1lLm1vbnRoIiwiRGF0ZVRpbWUuZGF5IiwiRGF0ZVRpbWUuaG91ciIsIkRhdGVUaW1lLm1pbnV0ZSIsIkRhdGVUaW1lLnNlY29uZCIsIkRhdGVUaW1lLm1pbGxpc2Vjb25kIiwiRGF0ZVRpbWUud2Vla0RheSIsIkRhdGVUaW1lLmRheU9mWWVhciIsIkRhdGVUaW1lLndlZWtOdW1iZXIiLCJEYXRlVGltZS53ZWVrT2ZNb250aCIsIkRhdGVUaW1lLnNlY29uZE9mRGF5IiwiRGF0ZVRpbWUudW5peFV0Y01pbGxpcyIsIkRhdGVUaW1lLnV0Y1llYXIiLCJEYXRlVGltZS51dGNNb250aCIsIkRhdGVUaW1lLnV0Y0RheSIsIkRhdGVUaW1lLnV0Y0hvdXIiLCJEYXRlVGltZS51dGNNaW51dGUiLCJEYXRlVGltZS51dGNTZWNvbmQiLCJEYXRlVGltZS51dGNEYXlPZlllYXIiLCJEYXRlVGltZS51dGNNaWxsaXNlY29uZCIsIkRhdGVUaW1lLnV0Y1dlZWtEYXkiLCJEYXRlVGltZS51dGNXZWVrTnVtYmVyIiwiRGF0ZVRpbWUudXRjV2Vla09mTW9udGgiLCJEYXRlVGltZS51dGNTZWNvbmRPZkRheSIsIkRhdGVUaW1lLndpdGhab25lIiwiRGF0ZVRpbWUuY29udmVydCIsIkRhdGVUaW1lLnRvWm9uZSIsIkRhdGVUaW1lLnRvRGF0ZSIsIkRhdGVUaW1lLnRvRXhjZWwiLCJEYXRlVGltZS50b1V0Y0V4Y2VsIiwiRGF0ZVRpbWUuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsIiwiRGF0ZVRpbWUuYWRkIiwiRGF0ZVRpbWUuYWRkTG9jYWwiLCJEYXRlVGltZS5fYWRkVG9UaW1lU3RydWN0IiwiRGF0ZVRpbWUuc3ViIiwiRGF0ZVRpbWUuc3ViTG9jYWwiLCJEYXRlVGltZS5kaWZmIiwiRGF0ZVRpbWUuc3RhcnRPZkRheSIsIkRhdGVUaW1lLnN0YXJ0T2ZNb250aCIsIkRhdGVUaW1lLnN0YXJ0T2ZZZWFyIiwiRGF0ZVRpbWUubGVzc1RoYW4iLCJEYXRlVGltZS5sZXNzRXF1YWwiLCJEYXRlVGltZS5lcXVhbHMiLCJEYXRlVGltZS5pZGVudGljYWwiLCJEYXRlVGltZS5ncmVhdGVyVGhhbiIsIkRhdGVUaW1lLmdyZWF0ZXJFcXVhbCIsIkRhdGVUaW1lLm1pbiIsIkRhdGVUaW1lLm1heCIsIkRhdGVUaW1lLnRvSXNvU3RyaW5nIiwiRGF0ZVRpbWUuZm9ybWF0IiwiRGF0ZVRpbWUucGFyc2UiLCJEYXRlVGltZS50b1N0cmluZyIsIkRhdGVUaW1lLmluc3BlY3QiLCJEYXRlVGltZS52YWx1ZU9mIiwiRGF0ZVRpbWUudG9VdGNTdHJpbmciLCJEYXRlVGltZS5fdXRjRGF0ZVRvWm9uZURhdGUiLCJEYXRlVGltZS5fem9uZURhdGVUb1V0Y0RhdGUiLCJEYXRlVGltZS5fc3BsaXREYXRlRnJvbVRpbWVab25lIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBRXBDLElBQU8sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7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QUM3QkEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3pCQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDM0JBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO3dCQUMvQkEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7d0JBQy9CQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTt3QkFFekNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLFFBQVFBLElBQUlBLFFBQVFBLFlBQVlBLFFBQVFBLEdBQUdBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO3dCQUVoR0Esd0RBQXdEQTt3QkFDeERBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBOzRCQUNoQkEsSUFBSUEsV0FBV0EsR0FBV0EsTUFBTUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxNQUFNQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQTs0QkFDM0dBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ2pGQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLEVB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QkE7UUFBRUEsMkJBQXVCQSxHQUF2QkEsZUFBdUJBO1FBQ2pGQSxvQkFBcUJBLEdBQXJCQSxXQUFxQkE7UUFBRUEsNEJBQTZCQSxHQUE3QkEsb0JBQTZCQTtRQUVwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7ZUFDckRBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pGQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxZQUFZQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0E7WUFDSkEsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDakZBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEtBQUtBLEtBQUtBLEVBQUVBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLEdBQUdBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBO21CQUNsRUEsSUFBSUEsS0FBS0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEs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QUFtQkEsQ0FBQ0E7UUFDeEJBLElBQUlBLFNBQWlCQSxDQUFDQTtRQUN0QkEsSUFBSUEsV0FBbUJBLENBQUNBO1FBQ3hCQSxJQUFJQSxhQUFxQkEsQ0FBQ0E7UUFDMUJBLElBQUlBLGFBQXFCQSxDQUFDQTtRQUMxQkEsSUFBSUEsa0JBQTBCQSxDQUFDQTtRQUUvQkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZEEsS0FBS0EsUUFBUUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7Z0JBQzNCQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQzNFQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtnQkFDdEJBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEZBLENBQUNBO1lBQ0RBLEtBQUtBLFFBQVFBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO2dCQUN0QkEsdUVBQXVFQTtnQkFDdkVBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsR0FBR0EsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkZBLENBQUNBO1lBQ0RBLEtBQUtBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO2dCQUNwQkEsdUVBQXVFQTtnQkFDdkVBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVB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InNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICpcclxuICogRGF0ZSt0aW1lK3RpbWV6b25lIHJlcHJlc2VudGF0aW9uXHJcbiAqL1xyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmQudHNcIi8+XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCBhc3NlcnQgPSByZXF1aXJlKFwiYXNzZXJ0XCIpO1xyXG5cclxuaW1wb3J0IGJhc2ljcyA9IHJlcXVpcmUoXCIuL2Jhc2ljc1wiKTtcclxuaW1wb3J0IFdlZWtEYXkgPSBiYXNpY3MuV2Vla0RheTtcclxuaW1wb3J0IFRpbWVTdHJ1Y3QgPSBiYXNpY3MuVGltZVN0cnVjdDtcclxuaW1wb3J0IFRpbWVVbml0ID0gYmFzaWNzLlRpbWVVbml0O1xyXG5cclxuaW1wb3J0IGR1cmF0aW9uID0gcmVxdWlyZShcIi4vZHVyYXRpb25cIik7XHJcbmltcG9ydCBEdXJhdGlvbiA9IGR1cmF0aW9uLkR1cmF0aW9uO1xyXG5cclxuaW1wb3J0IGphdmFzY3JpcHQgPSByZXF1aXJlKFwiLi9qYXZhc2NyaXB0XCIpO1xyXG5pbXBvcnQgRGF0ZUZ1bmN0aW9ucyA9IGphdmFzY3JpcHQuRGF0ZUZ1bmN0aW9ucztcclxuXHJcbmltcG9ydCBtYXRoID0gcmVxdWlyZShcIi4vbWF0aFwiKTtcclxuXHJcbmltcG9ydCB0aW1lc291cmNlID0gcmVxdWlyZShcIi4vdGltZXNvdXJjZVwiKTtcclxuaW1wb3J0IFRpbWVTb3VyY2UgPSB0aW1lc291cmNlLlRpbWVTb3VyY2U7XHJcbmltcG9ydCBSZWFsVGltZVNvdXJjZSA9IHRpbWVzb3VyY2UuUmVhbFRpbWVTb3VyY2U7XHJcblxyXG5pbXBvcnQgdGltZXpvbmUgPSByZXF1aXJlKFwiLi90aW1lem9uZVwiKTtcclxuaW1wb3J0IE5vcm1hbGl6ZU9wdGlvbiA9IHRpbWV6b25lLk5vcm1hbGl6ZU9wdGlvbjtcclxuaW1wb3J0IFRpbWVab25lID0gdGltZXpvbmUuVGltZVpvbmU7XHJcbmltcG9ydCBUaW1lWm9uZUtpbmQgPSB0aW1lem9uZS5UaW1lWm9uZUtpbmQ7XHJcblxyXG5pbXBvcnQgZm9ybWF0ID0gcmVxdWlyZShcIi4vZm9ybWF0XCIpO1xyXG5pbXBvcnQgcGFyc2VGdW5jcyA9IHJlcXVpcmUoXCIuL3BhcnNlXCIpO1xyXG5cclxuLyoqXHJcbiAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIGxvY2FsIHRpbWVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3dMb2NhbCgpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd0xvY2FsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG5vd1V0YygpOiBEYXRlVGltZSB7XHJcblx0cmV0dXJuIERhdGVUaW1lLm5vd1V0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VycmVudCBkYXRlK3RpbWUgaW4gdGhlIGdpdmVuIHRpbWUgem9uZVxyXG4gKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm93KHRpbWVab25lOiBUaW1lWm9uZSA9IFRpbWVab25lLnV0YygpKTogRGF0ZVRpbWUge1xyXG5cdHJldHVybiBEYXRlVGltZS5ub3codGltZVpvbmUpO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2FjaGVFbGVtZW50IHtcclxuXHQvKipcclxuXHQgKiBUaW1lIHRvIHJlcHJlc2VudFxyXG5cdCAqL1xyXG5cdGlzb1N0cmluZzogc3RyaW5nO1xyXG5cdC8qKlxyXG5cdCAqIFNhbWUgdGltZSBpbiB1bml4IHV0YyBtaWxsaXNcclxuXHQgKi9cclxuXHR1bml4VXRjTWlsbGlzOiBudW1iZXI7XHJcblx0LyoqXHJcblx0ICogSW5kaWNhdGVzIGhvdyByZWNlbnRseSB0aGUgZWxlbWVudCB3YXMgdXNlZFxyXG5cdCAqL1xyXG5cdHNlcU5vOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWNoZSBmb3IgdGltZXN0cnVjdCAtPiB1dGMgbWlsbGlzIGNvbnZlcnNpb25cclxuICovXHJcbmV4cG9ydCBjbGFzcyBVdGNNaWxsaXNDYWNoZSB7XHJcblxyXG5cdHB1YmxpYyBNQVhfQ0FDSEVfU0laRTogbnVtYmVyID0gMTAwMDtcclxuXHJcblx0cHJpdmF0ZSBfbGFzdFNlcU5vOiBudW1iZXIgPSAwO1xyXG5cdHByaXZhdGUgX2NhY2hlOiBDYWNoZUVsZW1lbnRbXSA9IFtdO1xyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB1bml4IG1pbGxpc2Vjb25kcyBmb3IgYSBnaXZlbiB0aW1lIHN0cnVjdFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0aW1lU3RydWN0MlV0Y01pbGxpcyh0aW1lU3RydWN0OiBUaW1lU3RydWN0KTogbnVtYmVyIHtcclxuXHRcdHZhciBjYWNoZUVsZW1lbnQ6IENhY2hlRWxlbWVudDtcclxuXHRcdHZhciBpc29TdHJpbmcgPSB0aW1lU3RydWN0LnRvU3RyaW5nKCk7XHJcblx0XHR2YXIgaW5kZXggPSBiYXNpY3MuYmluYXJ5SW5zZXJ0aW9uSW5kZXgodGhpcy5fY2FjaGUsIChhOiBDYWNoZUVsZW1lbnQpOiBudW1iZXIgPT4ge1xyXG5cdFx0XHRyZXR1cm4gKGEuaXNvU3RyaW5nIDwgaXNvU3RyaW5nID8gLTEgOiAoYS5pc29TdHJpbmcgPiBpc29TdHJpbmcgPyAxIDogMCkpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gZWxlbWVudCBmb3VuZCBpbiBjYWNoZT9cclxuXHRcdGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5fY2FjaGUubGVuZ3RoICYmIHRoaXMuX2NhY2hlW2luZGV4XS5pc29TdHJpbmcgPT09IGlzb1N0cmluZykge1xyXG5cdFx0XHRjYWNoZUVsZW1lbnQgPSB0aGlzLl9jYWNoZVtpbmRleF07XHJcblx0XHRcdC8vIG1hcmsgY2FjaGUgZWxlbWVudCBhcyByZWNlbnRseSB1c2VkXHJcblx0XHRcdGlmIChjYWNoZUVsZW1lbnQuc2VxTm8gPCB0aGlzLl9sYXN0U2VxTm8pIHtcclxuXHRcdFx0XHR0aGlzLl9sYXN0U2VxTm8rKztcclxuXHRcdFx0XHRjYWNoZUVsZW1lbnQuc2VxTm8gPSB0aGlzLl9sYXN0U2VxTm87XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGNhY2hlRWxlbWVudC51bml4VXRjTWlsbGlzO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gaWYgb3ZlcnNpemVkLCB0cmltIGNhY2hlIGJ5IHRocm93aW5nIGF3YXkgZWxlbWVudHMgbm90IHJlY2VudGx5IHVzZWRcclxuXHRcdFx0aWYgKHRoaXMuX2NhY2hlLmxlbmd0aCA+PSB0aGlzLk1BWF9DQUNIRV9TSVpFKSB7XHJcblx0XHRcdFx0dGhpcy5fY2FjaGUgPSB0aGlzLl9jYWNoZS5maWx0ZXIoKGVsZW1lbnQ6IENhY2hlRWxlbWVudCk6IGJvb2xlYW4gPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuIChlbGVtZW50LnNlcU5vID49IHRoaXMuX2xhc3RTZXFObyAtIHRoaXMuTUFYX0NBQ0hFX1NJWkUgLyAyKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyBhZGQgZWxlbWVudCB0byBjYWNoZVxyXG5cdFx0XHR2YXIgdW5peFV0Y01pbGxpcyA9IHRpbWVTdHJ1Y3QudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdFx0XHR0aGlzLl9sYXN0U2VxTm8rKztcclxuXHRcdFx0Y2FjaGVFbGVtZW50ID0ge1xyXG5cdFx0XHRcdGlzb1N0cmluZzogaXNvU3RyaW5nLFxyXG5cdFx0XHRcdHVuaXhVdGNNaWxsaXM6IHVuaXhVdGNNaWxsaXMsXHJcblx0XHRcdFx0c2VxTm86IHRoaXMuX2xhc3RTZXFOb1xyXG5cdFx0XHR9O1xyXG5cdFx0XHR0aGlzLl9jYWNoZS5zcGxpY2UoaW5kZXgsIDAsIGNhY2hlRWxlbWVudCk7XHJcblx0XHRcdHJldHVybiB1bml4VXRjTWlsbGlzO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGN1cnJlbnQgY2FjaGUgc2l6ZSwgZm9yIHRlc3RpbmcgcHVycG9zZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc2l6ZSgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2NhY2hlLmxlbmd0aDtcclxuXHR9XHJcblxyXG59XHJcblxyXG5leHBvcnQgdmFyIFVUQ19NSUxMSVNfQ0FDSEUgPSBuZXcgVXRjTWlsbGlzQ2FjaGUoKTtcclxuXHJcbi8qKlxyXG4gKiBEYXRlVGltZSBjbGFzcyB3aGljaCBpcyB0aW1lIHpvbmUtYXdhcmVcclxuICogYW5kIHdoaWNoIGNhbiBiZSBtb2NrZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGF0ZVRpbWUge1xyXG5cclxuXHQvKipcclxuXHQgKiBEYXRlIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXByZXNlbnRlZCBkYXRlIGNvbnZlcnRlZCB0byBVVEMgaW4gaXRzXHJcblx0ICogZ2V0VVRDWHh4KCkgZmllbGRzLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3V0Y0RhdGU6IFRpbWVTdHJ1Y3Q7XHJcblxyXG5cdC8qKlxyXG5cdCAqIERhdGUgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHJlcHJlc2VudGVkIGRhdGUgY29udmVydGVkIHRvIHRoaXMuX3pvbmUgaW4gaXRzXHJcblx0ICogZ2V0VVRDWHh4KCkgZmllbGRzLiBOb3RlIHRoYXQgdGhlIGdldFh4eCgpIGZpZWxkcyBhcmUgdW51c2FibGUgZm9yIHRoaXMgcHVycG9zZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVEYXRlOiBUaW1lU3RydWN0O1xyXG5cclxuXHQvKipcclxuXHQgKiBPcmlnaW5hbCB0aW1lIHpvbmUgdGhpcyBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmb3IuXHJcblx0ICogQ2FuIGJlIE5VTEwgZm9yIHVuYXdhcmUgdGltZXN0YW1wc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmU6IFRpbWVab25lO1xyXG5cclxuXHQvKipcclxuXHQgKiBBY3R1YWwgdGltZSBzb3VyY2UgaW4gdXNlLiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgYWxsb3dzIHRvXHJcblx0ICogZmFrZSB0aW1lIGluIHRlc3RzLiBEYXRlVGltZS5ub3dMb2NhbCgpIGFuZCBEYXRlVGltZS5ub3dVdGMoKVxyXG5cdCAqIHVzZSB0aGlzIHByb3BlcnR5IGZvciBvYnRhaW5pbmcgdGhlIGN1cnJlbnQgdGltZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHRpbWVTb3VyY2U6IFRpbWVTb3VyY2UgPSBuZXcgUmVhbFRpbWVTb3VyY2UoKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ3VycmVudCBkYXRlK3RpbWUgaW4gbG9jYWwgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93TG9jYWwoKTogRGF0ZVRpbWUge1xyXG5cdFx0dmFyIG4gPSBEYXRlVGltZS50aW1lU291cmNlLm5vdygpO1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZShuLCBEYXRlRnVuY3Rpb25zLkdldCwgVGltZVpvbmUubG9jYWwoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDdXJyZW50IGRhdGUrdGltZSBpbiBVVEMgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbm93VXRjKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMsIFRpbWVab25lLnV0YygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEN1cnJlbnQgZGF0ZSt0aW1lIGluIHRoZSBnaXZlbiB0aW1lIHpvbmVcclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSBkZXNpcmVkIHRpbWUgem9uZSAob3B0aW9uYWwsIGRlZmF1bHRzIHRvIFVUQykuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBub3codGltZVpvbmU6IFRpbWVab25lID0gVGltZVpvbmUudXRjKCkpOiBEYXRlVGltZSB7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKERhdGVUaW1lLnRpbWVTb3VyY2Uubm93KCksIERhdGVGdW5jdGlvbnMuR2V0VVRDLCBUaW1lWm9uZS51dGMoKSkudG9ab25lKHRpbWVab25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIERhdGVUaW1lIGZyb20gYSBMb3R1cyAxMjMgLyBNaWNyb3NvZnQgRXhjZWwgZGF0ZS10aW1lIHZhbHVlXHJcblx0ICogaS5lLiBhIGRvdWJsZSByZXByZXNlbnRpbmcgZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcblx0ICogQHBhcmFtIG4gZXhjZWwgZGF0ZS90aW1lIG51bWJlclxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBUaW1lIHpvbmUgdG8gYXNzdW1lIHRoYXQgdGhlIGV4Y2VsIHZhbHVlIGlzIGluXHJcblx0ICogQHJldHVybnMgYSBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUV4Y2VsKG46IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGFzc2VydCh0eXBlb2YgbiA9PT0gXCJudW1iZXJcIiwgXCJmcm9tRXhjZWwoKTogZmlyc3QgcGFyYW1ldGVyIG11c3QgYmUgYSBudW1iZXJcIik7XHJcblx0XHRhc3NlcnQoIWlzTmFOKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG5cdFx0YXNzZXJ0KGlzRmluaXRlKG4pLCBcImZyb21FeGNlbCgpOiBmaXJzdCBwYXJhbWV0ZXIgbXVzdCBub3QgYmUgTmFOXCIpO1xyXG5cdFx0dmFyIHVuaXhUaW1lc3RhbXAgPSBNYXRoLnJvdW5kKChuIC0gMjU1NjkpICogMjQgKiA2MCAqIDYwICogMTAwMCk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHVuaXhUaW1lc3RhbXAsIHRpbWVab25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIHdoZXRoZXIgYSBnaXZlbiBkYXRlIGV4aXN0cyBpbiB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG5cdCAqIEUuZy4gMjAxNS0wMi0yOSByZXR1cm5zIGZhbHNlIChub3QgYSBsZWFwIHllYXIpXHJcblx0ICogYW5kIDIwMTUtMDMtMjlUMDI6MzA6MDAgcmV0dXJucyBmYWxzZSAoZGF5bGlnaHQgc2F2aW5nIHRpbWUgbWlzc2luZyBob3VyKVxyXG5cdCAqIGFuZCAyMDE1LTA0LTMxIHJldHVybnMgZmFsc2UgKEFwcmlsIGhhcyAzMCBkYXlzKS5cclxuXHQgKiBCeSBkZWZhdWx0LCBwcmUtMTk3MCBkYXRlcyBhbHNvIHJldHVybiBmYWxzZSBzaW5jZSB0aGUgdGltZSB6b25lIGRhdGFiYXNlIGRvZXMgbm90IGNvbnRhaW4gYWNjdXJhdGUgaW5mb1xyXG5cdCAqIGJlZm9yZSB0aGF0LiBZb3UgY2FuIGNoYW5nZSB0aGF0IHdpdGggdGhlIGFsbG93UHJlMTk3MCBmbGFnLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGFsbG93UHJlMTk3MCAob3B0aW9uYWwsIGRlZmF1bHQgZmFsc2UpOiByZXR1cm4gdHJ1ZSBmb3IgcHJlLTE5NzAgZGF0ZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGV4aXN0cyhcclxuXHRcdHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciA9IDEsIGRheTogbnVtYmVyID0gMSxcclxuXHRcdGhvdXI6IG51bWJlciA9IDAsIG1pbnV0ZTogbnVtYmVyID0gMCwgc2Vjb25kOiBudW1iZXIgPSAwLCBtaWxsaXNlY29uZDogbnVtYmVyID0gMCxcclxuXHRcdHpvbmU6IFRpbWVab25lID0gbnVsbCwgYWxsb3dQcmUxOTcwOiBib29sZWFuID0gZmFsc2VcclxuXHQpOiBib29sZWFuIHtcclxuXHRcdGlmICghaXNGaW5pdGUoeWVhcikgfHwgIWlzRmluaXRlKG1vbnRoKSB8fCAhaXNGaW5pdGUoZGF5KVxyXG5cdFx0XHR8fCAhaXNGaW5pdGUoaG91cikgfHwgIWlzRmluaXRlKG1pbnV0ZSkgfHwgIWlzRmluaXRlKHNlY29uZCkgfHwgIWlzRmluaXRlKG1pbGxpc2Vjb25kKSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAoIWFsbG93UHJlMTk3MCAmJiB5ZWFyIDwgMTk3MCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgZHQgPSBuZXcgRGF0ZVRpbWUoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kLCB6b25lKTtcclxuXHRcdFx0cmV0dXJuICh5ZWFyID09PSBkdC55ZWFyKCkgJiYgbW9udGggPT09IGR0Lm1vbnRoKCkgJiYgZGF5ID09PSBkdC5kYXkoKVxyXG5cdFx0XHRcdCYmIGhvdXIgPT09IGR0LmhvdXIoKSAmJiBtaW51dGUgPT09IGR0Lm1pbnV0ZSgpICYmIHNlY29uZCA9PT0gZHQuc2Vjb25kKCkgJiYgbWlsbGlzZWNvbmQgPT09IGR0Lm1pbGxpc2Vjb25kKCkpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gQ3JlYXRlcyBjdXJyZW50IHRpbWUgaW4gbG9jYWwgdGltZXpvbmUuXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gUGFyc2VzIElTTyB0aW1lc3RhbXAgc3RyaW5nLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGlzb1N0cmluZ1x0U3RyaW5nIGluIElTTyA4NjAxIGZvcm1hdC4gSW5zdGVhZCBvZiBJU08gdGltZSB6b25lLFxyXG5cdCAqXHRcdCBpdCBtYXkgaW5jbHVkZSBhIHNwYWNlIGFuZCB0aGVuIGFuZCBJQU5BIHRpbWUgem9uZS5cclxuXHQgKiBlLmcuIFwiMjAwNy0wNC0wNVQxMjozMDo0MC41MDBcIlx0XHRcdFx0XHQobm8gdGltZSB6b25lLCBuYWl2ZSBkYXRlKVxyXG5cdCAqIGUuZy4gXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCswMTowMFwiXHRcdFx0XHQoVVRDIG9mZnNldCB3aXRob3V0IGRheWxpZ2h0IHNhdmluZyB0aW1lKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMFpcIlx0XHRcdFx0XHQoVVRDKVxyXG5cdCAqIG9yICAgXCIyMDA3LTA0LTA1VDEyOjMwOjQwLjUwMCBFdXJvcGUvQW1zdGVyZGFtXCJcdChJQU5BIHRpbWUgem9uZSwgd2l0aCBkYXlsaWdodCBzYXZpbmcgdGltZSBpZiBhcHBsaWNhYmxlKVxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0aWYgZ2l2ZW4sIHRoZSBkYXRlIGluIHRoZSBzdHJpbmcgaXMgYXNzdW1lZCB0byBiZSBpbiB0aGlzIHRpbWUgem9uZS5cclxuXHQgKlx0XHRcdFx0XHROb3RlIHRoYXQgaXQgaXMgTk9UIENPTlZFUlRFRCB0byB0aGUgdGltZSB6b25lLiBVc2VmdWxcclxuXHQgKlx0XHRcdFx0XHRmb3Igc3RyaW5ncyB3aXRob3V0IGEgdGltZSB6b25lXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoaXNvU3RyaW5nOiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBQYXJzZXMgc3RyaW5nIGluIGdpdmVuIExETUwgZm9ybWF0LlxyXG5cdCAqIE5PVEU6IGRvZXMgbm90IGhhbmRsZSBlcmFzL3F1YXJ0ZXJzL3dlZWtzL3dlZWtkYXlzLlxyXG5cdCAqIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBhcmUgbm9ybWFsaXplZCBieSByb3VuZGluZyB1cCB0byB0aGUgbmV4dCBEU1Qgb2Zmc2V0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGVTdHJpbmdcdERhdGUrVGltZSBzdHJpbmcuXHJcblx0ICogQHBhcmFtIGZvcm1hdCBUaGUgTERNTCBmb3JtYXQgdGhhdCB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW5cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdGlmIGdpdmVuLCB0aGUgZGF0ZSBpbiB0aGUgc3RyaW5nIGlzIGFzc3VtZWQgdG8gYmUgaW4gdGhpcyB0aW1lIHpvbmUuXHJcblx0ICpcdFx0XHRcdFx0Tm90ZSB0aGF0IGl0IGlzIE5PVCBDT05WRVJURUQgdG8gdGhlIHRpbWUgem9uZS4gVXNlZnVsXHJcblx0ICpcdFx0XHRcdFx0Zm9yIHN0cmluZ3Mgd2l0aG91dCBhIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGVTdHJpbmc6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcsIHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yLiBZb3UgcHJvdmlkZSBhIGRhdGUsIHRoZW4geW91IHNheSB3aGV0aGVyIHRvIHRha2UgdGhlXHJcblx0ICogZGF0ZS5nZXRZZWFyKCkvZ2V0WHh4IG1ldGhvZHMgb3IgdGhlIGRhdGUuZ2V0VVRDWWVhcigpL2RhdGUuZ2V0VVRDWHh4IG1ldGhvZHMsXHJcblx0ICogYW5kIHRoZW4geW91IHN0YXRlIHdoaWNoIHRpbWUgem9uZSB0aGF0IGRhdGUgaXMgaW4uXHJcblx0ICogTm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGFyZSBub3JtYWxpemVkIGJ5IHJvdW5kaW5nIHVwIHRvIHRoZSBuZXh0IERTVCBvZmZzZXQuXHJcblx0ICogTm90ZSB0aGF0IHRoZSBEYXRlIGNsYXNzIGhhcyBidWdzIGFuZCBpbmNvbnNpc3RlbmNpZXMgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlbSB3aXRoIHRpbWVzIGFyb3VuZFxyXG5cdCAqIERTVCBjaGFuZ2VzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGVcdEEgZGF0ZSBvYmplY3QuXHJcblx0ICogQHBhcmFtIGdldHRlcnNcdFNwZWNpZmllcyB3aGljaCBzZXQgb2YgRGF0ZSBnZXR0ZXJzIGNvbnRhaW5zIHRoZSBkYXRlIGluIHRoZSBnaXZlbiB0aW1lIHpvbmU6IHRoZVxyXG5cdCAqXHRcdFx0XHRcdERhdGUuZ2V0WHh4KCkgbWV0aG9kcyBvciB0aGUgRGF0ZS5nZXRVVENYeHgoKSBtZXRob2RzLlxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0VGhlIHRpbWUgem9uZSB0aGF0IHRoZSBnaXZlbiBkYXRlIGlzIGFzc3VtZWQgdG8gYmUgaW4gKG1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGU6IERhdGUsIGdldEZ1bmNzOiBEYXRlRnVuY3Rpb25zLCB0aW1lWm9uZT86IFRpbWVab25lKTtcclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3Rvci4gTm90ZSB0aGF0IHVubGlrZSBKYXZhU2NyaXB0IGRhdGVzIHdlIHJlcXVpcmUgZmllbGRzIHRvIGJlIGluIG5vcm1hbCByYW5nZXMuXHJcblx0ICogVXNlIHRoZSBhZGQoZHVyYXRpb24pIG9yIHN1YihkdXJhdGlvbikgZm9yIGFyaXRobWV0aWMuXHJcblx0ICogQHBhcmFtIHllYXJcdFRoZSBmdWxsIHllYXIgKGUuZy4gMjAxNClcclxuXHQgKiBAcGFyYW0gbW9udGhcdFRoZSBtb250aCBbMS0xMl0gKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKiBAcGFyYW0gZGF5XHRUaGUgZGF5IG9mIHRoZSBtb250aCBbMS0zMV1cclxuXHQgKiBAcGFyYW0gaG91clx0VGhlIGhvdXIgb2YgdGhlIGRheSBbMC0yNClcclxuXHQgKiBAcGFyYW0gbWludXRlXHRUaGUgbWludXRlIG9mIHRoZSBob3VyIFswLTU5XVxyXG5cdCAqIEBwYXJhbSBzZWNvbmRcdFRoZSBzZWNvbmQgb2YgdGhlIG1pbnV0ZSBbMC01OV1cclxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmRcdFRoZSBtaWxsaXNlY29uZCBvZiB0aGUgc2Vjb25kIFswLTk5OV1cclxuXHQgKiBAcGFyYW0gdGltZVpvbmVcdFRoZSB0aW1lIHpvbmUsIG9yIG51bGwgKGZvciB1bmF3YXJlIGRhdGVzKVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0eWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyLCBkYXk6IG51bWJlcixcclxuXHRcdGhvdXI/OiBudW1iZXIsIG1pbnV0ZT86IG51bWJlciwgc2Vjb25kPzogbnVtYmVyLCBtaWxsaXNlY29uZD86IG51bWJlcixcclxuXHRcdHRpbWVab25lPzogVGltZVpvbmUpO1xyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yXHJcblx0ICogQHBhcmFtIHVuaXhUaW1lc3RhbXBcdG1pbGxpc2Vjb25kcyBzaW5jZSAxOTcwLTAxLTAxVDAwOjAwOjAwLjAwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZVx0dGhlIHRpbWUgem9uZSB0aGF0IHRoZSB0aW1lc3RhbXAgaXMgYXNzdW1lZCB0byBiZSBpbiAodXN1YWxseSBVVEMpLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHVuaXhUaW1lc3RhbXA6IG51bWJlciwgdGltZVpvbmU/OiBUaW1lWm9uZSk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdG9yIGltcGxlbWVudGF0aW9uLCBkbyBub3QgY2FsbFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0YTE/OiBhbnksIGEyPzogYW55LCBhMz86IGFueSxcclxuXHRcdGg/OiBudW1iZXIsIG0/OiBudW1iZXIsIHM/OiBudW1iZXIsIG1zPzogbnVtYmVyLFxyXG5cdFx0dGltZVpvbmU/OiBhbnkpIHtcclxuXHRcdHN3aXRjaCAodHlwZW9mIChhMSkpIHtcclxuXHRcdFx0Y2FzZSBcIm51bWJlclwiOiB7XHJcblx0XHRcdFx0aWYgKGEyID09PSB1bmRlZmluZWQgfHwgYTIgPT09IG51bGwgfHwgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSkge1xyXG5cdFx0XHRcdFx0Ly8gdW5peCB0aW1lc3RhbXAgY29uc3RydWN0b3JcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBleHBlY3QgdW5peFRpbWVzdGFtcCB0byBiZSBhIG51bWJlclwiKTtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmUgPSAodHlwZW9mIChhMikgPT09IFwib2JqZWN0XCIgJiYgYTIgaW5zdGFuY2VvZiBUaW1lWm9uZSA/IDxUaW1lWm9uZT5hMiA6IG51bGwpO1xyXG5cdFx0XHRcdFx0dmFyIG5vcm1hbGl6ZWRVbml4VGltZXN0YW1wOiBudW1iZXI7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5fem9uZSkge1xyXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkVW5peFRpbWVzdGFtcCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobWF0aC5yb3VuZFN5bSg8bnVtYmVyPmExKSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkVW5peFRpbWVzdGFtcCA9IG1hdGgucm91bmRTeW0oPG51bWJlcj5hMSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgobm9ybWFsaXplZFVuaXhUaW1lc3RhbXApO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZURhdGVUb1V0Y0RhdGUoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8geWVhciBtb250aCBkYXkgY29uc3RydWN0b3JcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgeWVhciB0byBiZSBhIG51bWJlci5cIik7XHJcblx0XHRcdFx0XHRhc3NlcnQodHlwZW9mIChhMikgPT09IFwibnVtYmVyXCIsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogRXhwZWN0IG1vbnRoIHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydCh0eXBlb2YgKGEzKSA9PT0gXCJudW1iZXJcIiwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiBFeHBlY3QgZGF5IHRvIGJlIGEgbnVtYmVyLlwiKTtcclxuXHRcdFx0XHRcdHZhciB5ZWFyOiBudW1iZXIgPSA8bnVtYmVyPmExO1xyXG5cdFx0XHRcdFx0dmFyIG1vbnRoOiBudW1iZXIgPSA8bnVtYmVyPmEyO1xyXG5cdFx0XHRcdFx0dmFyIGRheTogbnVtYmVyID0gPG51bWJlcj5hMztcclxuXHRcdFx0XHRcdHZhciBob3VyOiBudW1iZXIgPSAodHlwZW9mIChoKSA9PT0gXCJudW1iZXJcIiA/IGggOiAwKTtcclxuXHRcdFx0XHRcdHZhciBtaW51dGU6IG51bWJlciA9ICh0eXBlb2YgKG0pID09PSBcIm51bWJlclwiID8gbSA6IDApO1xyXG5cdFx0XHRcdFx0dmFyIHNlY29uZDogbnVtYmVyID0gKHR5cGVvZiAocykgPT09IFwibnVtYmVyXCIgPyBzIDogMCk7XHJcblx0XHRcdFx0XHR2YXIgbWlsbGlzZWNvbmQ6IG51bWJlciA9ICh0eXBlb2YgKG1zKSA9PT0gXCJudW1iZXJcIiA/IG1zIDogMCk7XHJcblx0XHRcdFx0XHRhc3NlcnQobW9udGggPiAwICYmIG1vbnRoIDwgMTMsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogbW9udGggb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdFx0XHRcdGFzc2VydChkYXkgPiAwICYmIGRheSA8IDMyLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IGRheSBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KGhvdXIgPj0gMCAmJiBob3VyIDwgMjQsIFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogaG91ciBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8IDYwLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG1pbnV0ZSBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHNlY29uZCA+PSAwICYmIHNlY29uZCA8IDYwLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IHNlY29uZCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KG1pbGxpc2Vjb25kID49IDAgJiYgbWlsbGlzZWNvbmQgPCAxMDAwLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG1pbGxpc2Vjb25kIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRcdFx0XHR5ZWFyID0gbWF0aC5yb3VuZFN5bSh5ZWFyKTtcclxuXHRcdFx0XHRcdG1vbnRoID0gbWF0aC5yb3VuZFN5bShtb250aCk7XHJcblx0XHRcdFx0XHRkYXkgPSBtYXRoLnJvdW5kU3ltKGRheSk7XHJcblx0XHRcdFx0XHRob3VyID0gbWF0aC5yb3VuZFN5bShob3VyKTtcclxuXHRcdFx0XHRcdG1pbnV0ZSA9IG1hdGgucm91bmRTeW0obWludXRlKTtcclxuXHRcdFx0XHRcdHNlY29uZCA9IG1hdGgucm91bmRTeW0oc2Vjb25kKTtcclxuXHRcdFx0XHRcdG1pbGxpc2Vjb25kID0gbWF0aC5yb3VuZFN5bShtaWxsaXNlY29uZCk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9ICh0eXBlb2YgKHRpbWVab25lKSA9PT0gXCJvYmplY3RcIiAmJiB0aW1lWm9uZSBpbnN0YW5jZW9mIFRpbWVab25lID8gdGltZVpvbmUgOiBudWxsKTtcclxuXHJcblx0XHRcdFx0XHQvLyBub3JtYWxpemUgbG9jYWwgdGltZSAocmVtb3ZlIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lKVxyXG5cdFx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdFx0dmFyIGxvY2FsTWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZURhdGUgPSBUaW1lU3RydWN0LmZyb21Vbml4KHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxNaWxsaXMpKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gbmV3IFRpbWVTdHJ1Y3QoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlVG9VdGNEYXRlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGEyID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHQvLyBmb3JtYXQgc3RyaW5nIGdpdmVuXHJcblx0XHRcdFx0XHR2YXIgZGF0ZVN0cmluZzogc3RyaW5nID0gPHN0cmluZz5hMTtcclxuXHRcdFx0XHRcdHZhciBmb3JtYXRTdHJpbmc6IHN0cmluZyA9IDxzdHJpbmc+YTI7XHJcblx0XHRcdFx0XHR2YXIgem9uZTogVGltZVpvbmUgPSBudWxsO1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBhMyA9PT0gXCJvYmplY3RcIiAmJiBhMyBpbnN0YW5jZW9mIFRpbWVab25lKSB7XHJcblx0XHRcdFx0XHRcdHpvbmUgPSA8VGltZVpvbmU+KGEzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBwYXJzZWQgPSBwYXJzZUZ1bmNzLnBhcnNlKGRhdGVTdHJpbmcsIGZvcm1hdFN0cmluZywgem9uZSk7XHJcblx0XHRcdFx0XHR0aGlzLl96b25lRGF0ZSA9IHBhcnNlZC50aW1lO1xyXG5cdFx0XHRcdFx0dGhpcy5fem9uZSA9IHBhcnNlZC56b25lO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2YXIgZ2l2ZW5TdHJpbmcgPSAoPHN0cmluZz5hMSkudHJpbSgpO1xyXG5cdFx0XHRcdFx0dmFyIHNzOiBzdHJpbmdbXSA9IERhdGVUaW1lLl9zcGxpdERhdGVGcm9tVGltZVpvbmUoZ2l2ZW5TdHJpbmcpO1xyXG5cdFx0XHRcdFx0YXNzZXJ0KHNzLmxlbmd0aCA9PT0gMiwgXCJJbnZhbGlkIGRhdGUgc3RyaW5nIGdpdmVuOiBcXFwiXCIgKyA8c3RyaW5nPmExICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRcdFx0aWYgKGEyIGluc3RhbmNlb2YgVGltZVpvbmUpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZSA9IDxUaW1lWm9uZT4oYTIpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fem9uZSA9IFRpbWVab25lLnpvbmUoc3NbMV0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gdXNlIG91ciBvd24gSVNPIHBhcnNpbmcgYmVjYXVzZSB0aGF0IGl0IHBsYXRmb3JtIGluZGVwZW5kZW50XHJcblx0XHRcdFx0XHQvLyAoZnJlZSBvZiBEYXRlIHF1aXJrcylcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tU3RyaW5nKHNzWzBdKTtcclxuXHRcdFx0XHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZVRvVXRjRGF0ZSgpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwib2JqZWN0XCI6IHtcclxuXHRcdFx0XHRhc3NlcnQoYTEgaW5zdGFuY2VvZiBEYXRlLCBcIkRhdGVUaW1lLkRhdGVUaW1lKCk6IG5vbi1EYXRlIG9iamVjdCBwYXNzZWQgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTIpID09PSBcIm51bWJlclwiLFxyXG5cdFx0XHRcdFx0XCJEYXRlVGltZS5EYXRlVGltZSgpOiBmb3IgYSBEYXRlIG9iamVjdCBhIERhdGVGdW5jdGlvbnMgbXVzdCBiZSBwYXNzZWQgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRcdGFzc2VydCghYTMgfHwgYTMgaW5zdGFuY2VvZiBUaW1lWm9uZSwgXCJEYXRlVGltZS5EYXRlVGltZSgpOiB0aW1lWm9uZSBzaG91bGQgYmUgYSBUaW1lWm9uZSBvYmplY3QuXCIpO1xyXG5cdFx0XHRcdHZhciBkOiBEYXRlID0gPERhdGU+KGExKTtcclxuXHRcdFx0XHR2YXIgZGs6IERhdGVGdW5jdGlvbnMgPSA8RGF0ZUZ1bmN0aW9ucz4oYTIpO1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSAoYTMgPyBhMyA6IG51bGwpO1xyXG5cdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tRGF0ZShkLCBkayk7XHJcblx0XHRcdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3pvbmVEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLl96b25lRGF0ZVRvVXRjRGF0ZSgpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwidW5kZWZpbmVkXCI6IHtcclxuXHRcdFx0XHQvLyBub3RoaW5nIGdpdmVuLCBtYWtlIGxvY2FsIGRhdGV0aW1lXHJcblx0XHRcdFx0dGhpcy5fem9uZSA9IFRpbWVab25lLmxvY2FsKCk7XHJcblx0XHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbURhdGUoRGF0ZVRpbWUudGltZVNvdXJjZS5ub3coKSwgRGF0ZUZ1bmN0aW9ucy5HZXRVVEMpO1xyXG5cdFx0XHRcdHRoaXMuX3V0Y0RhdGVUb1pvbmVEYXRlKCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRGF0ZVRpbWUuRGF0ZVRpbWUoKTogdW5leHBlY3RlZCBmaXJzdCBhcmd1bWVudCB0eXBlLlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIGEgY29weSBvZiB0aGlzIG9iamVjdFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IERhdGVUaW1lKCk7XHJcblx0XHRyZXN1bHQuX3V0Y0RhdGUgPSB0aGlzLl91dGNEYXRlLmNsb25lKCk7XHJcblx0XHRyZXN1bHQuX3pvbmVEYXRlID0gdGhpcy5fem9uZURhdGUuY2xvbmUoKTtcclxuXHRcdHJlc3VsdC5fem9uZSA9IHRoaXMuX3pvbmU7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgdGltZSB6b25lIHRoYXQgdGhlIGRhdGUgaXMgaW4uIE1heSBiZSBudWxsIGZvciB1bmF3YXJlIGRhdGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lKCk6IFRpbWVab25lIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBuYW1lIGFiYnJldmlhdGlvbiBhdCB0aGlzIHRpbWVcclxuXHQgKiBAcGFyYW0gZHN0RGVwZW5kZW50IChkZWZhdWx0IHRydWUpIHNldCB0byBmYWxzZSBmb3IgYSBEU1QtYWdub3N0aWMgYWJicmV2aWF0aW9uXHJcblx0ICogQHJldHVybiBUaGUgYWJicmV2aWF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVBYmJyZXZpYXRpb24oZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRpZiAodGhpcy56b25lKCkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuem9uZSgpLmFiYnJldmlhdGlvbkZvclV0YyhcclxuXHRcdFx0XHR0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpLFxyXG5cdFx0XHRcdHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpLCB0aGlzLnV0Y01pbGxpc2Vjb25kKCksIGRzdERlcGVuZGVudCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gXCJcIjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCB3LnIudC4gVVRDIGluIG1pbnV0ZXMuIFJldHVybnMgMCBmb3IgdW5hd2FyZSBkYXRlcyBhbmQgZm9yIFVUQyBkYXRlcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgb2Zmc2V0KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZCgodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpIC0gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpIC8gNjAwMDApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB5ZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUueWVhcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgbW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5tb250aDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl96b25lRGF0ZS5kYXk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBob3VyIDAtMjNcclxuXHQgKi9cclxuXHRwdWJsaWMgaG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLmhvdXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIHRoZSBtaW51dGVzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fem9uZURhdGUubWludXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLnNlY29uZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIG1pbGxpc2Vjb25kcyAwLTk5OVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaWxsaXNlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVEYXRlLm1pbGxpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiB0aGUgZGF5LW9mLXdlZWsgKHRoZSBlbnVtIHZhbHVlcyBjb3JyZXNwb25kIHRvIEphdmFTY3JpcHRcclxuXHQgKiB3ZWVrIGRheSBudW1iZXJzKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrRGF5KCk6IFdlZWtEYXkge1xyXG5cdFx0cmV0dXJuIDxXZWVrRGF5PmJhc2ljcy53ZWVrRGF5Tm9MZWFwU2Vjcyh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgZGF5IG51bWJlciB3aXRoaW4gdGhlIHllYXI6IEphbiAxc3QgaGFzIG51bWJlciAwLFxyXG5cdCAqIEphbiAybmQgaGFzIG51bWJlciAxIGV0Yy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gdGhlIGRheS1vZi15ZWFyIFswLTM2Nl1cclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5T2ZZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLmRheU9mWWVhcih0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSB3ZWVrIG51bWJlci4gV2VlayAxIGlzIHRoZSB3ZWVrXHJcblx0ICogdGhhdCBoYXMgSmFudWFyeSA0dGggaW4gaXQsIGFuZCBpdCBzdGFydHMgb24gTW9uZGF5LlxyXG5cdCAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTUzXVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB3ZWVrTnVtYmVyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtOdW1iZXIodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSwgdGhpcy5kYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgd2VlayBvZiB0aGlzIG1vbnRoLiBUaGVyZSBpcyBubyBvZmZpY2lhbCBzdGFuZGFyZCBmb3IgdGhpcyxcclxuXHQgKiBidXQgd2UgYXNzdW1lIHRoZSBzYW1lIHJ1bGVzIGZvciB0aGUgd2Vla051bWJlciAoaS5lLlxyXG5cdCAqIHdlZWsgMSBpcyB0aGUgd2VlayB0aGF0IGhhcyB0aGUgNHRoIGRheSBvZiB0aGUgbW9udGggaW4gaXQpXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFdlZWsgbnVtYmVyIFsxLTVdXHJcblx0ICovXHJcblx0cHVibGljIHdlZWtPZk1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLndlZWtPZk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgdGhhdCBoYXZlIHBhc3NlZCBvbiB0aGUgY3VycmVudCBkYXlcclxuXHQgKiBEb2VzIG5vdCBjb25zaWRlciBsZWFwIHNlY29uZHNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gc2Vjb25kcyBbMC04NjM5OV1cclxuXHQgKi9cclxuXHRwdWJsaWMgc2Vjb25kT2ZEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBiYXNpY3Muc2Vjb25kT2ZEYXkodGhpcy5ob3VyKCksIHRoaXMubWludXRlKCksIHRoaXMuc2Vjb25kKCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBNaWxsaXNlY29uZHMgc2luY2UgMTk3MC0wMS0wMVQwMDowMDowMC4wMDBaXHJcblx0ICovXHJcblx0cHVibGljIHVuaXhVdGNNaWxsaXMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiBVVENfTUlMTElTX0NBQ0hFLnRpbWVTdHJ1Y3QyVXRjTWlsbGlzKHRoaXMuX3V0Y0RhdGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgZnVsbCB5ZWFyIGUuZy4gMjAxNFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNZZWFyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS55ZWFyO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIG1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgRGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTW9udGgoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLm1vbnRoO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgVVRDIGRheSBvZiB0aGUgbW9udGggMS0zMVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNEYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLmRheTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBob3VyIDAtMjNcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjSG91cigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUuaG91cjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVGhlIFVUQyBtaW51dGVzIDAtNTlcclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjTWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5taW51dGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgc2Vjb25kcyAwLTU5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUuc2Vjb25kO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgVVRDIGRheSBudW1iZXIgd2l0aGluIHRoZSB5ZWFyOiBKYW4gMXN0IGhhcyBudW1iZXIgMCxcclxuXHQgKiBKYW4gMm5kIGhhcyBudW1iZXIgMSBldGMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHRoZSBkYXktb2YteWVhciBbMC0zNjZdXHJcblx0ICovXHJcblx0cHVibGljIHV0Y0RheU9mWWVhcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy5kYXlPZlllYXIodGhpcy51dGNZZWFyKCksIHRoaXMudXRjTW9udGgoKSwgdGhpcy51dGNEYXkoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBVVEMgbWlsbGlzZWNvbmRzIDAtOTk5XHJcblx0ICovXHJcblx0cHVibGljIHV0Y01pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS5taWxsaTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gdGhlIFVUQyBkYXktb2Ytd2VlayAodGhlIGVudW0gdmFsdWVzIGNvcnJlc3BvbmQgdG8gSmF2YVNjcmlwdFxyXG5cdCAqIHdlZWsgZGF5IG51bWJlcnMpXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1dlZWtEYXkoKTogV2Vla0RheSB7XHJcblx0XHRyZXR1cm4gPFdlZWtEYXk+YmFzaWNzLndlZWtEYXlOb0xlYXBTZWNzKHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBJU08gODYwMSBVVEMgd2VlayBudW1iZXIuIFdlZWsgMSBpcyB0aGUgd2Vla1xyXG5cdCAqIHRoYXQgaGFzIEphbnVhcnkgNHRoIGluIGl0LCBhbmQgaXQgc3RhcnRzIG9uIE1vbmRheS5cclxuXHQgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01M11cclxuXHQgKi9cclxuXHRwdWJsaWMgdXRjV2Vla051bWJlcigpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrTnVtYmVyKHRoaXMudXRjWWVhcigpLCB0aGlzLnV0Y01vbnRoKCksIHRoaXMudXRjRGF5KCkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHdlZWsgb2YgdGhpcyBtb250aC4gVGhlcmUgaXMgbm8gb2ZmaWNpYWwgc3RhbmRhcmQgZm9yIHRoaXMsXHJcblx0ICogYnV0IHdlIGFzc3VtZSB0aGUgc2FtZSBydWxlcyBmb3IgdGhlIHdlZWtOdW1iZXIgKGkuZS5cclxuXHQgKiB3ZWVrIDEgaXMgdGhlIHdlZWsgdGhhdCBoYXMgdGhlIDR0aCBkYXkgb2YgdGhlIG1vbnRoIGluIGl0KVxyXG5cdCAqXHJcblx0ICogQHJldHVybiBXZWVrIG51bWJlciBbMS01XVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1dGNXZWVrT2ZNb250aCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIGJhc2ljcy53ZWVrT2ZNb250aCh0aGlzLnV0Y1llYXIoKSwgdGhpcy51dGNNb250aCgpLCB0aGlzLnV0Y0RheSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIG51bWJlciBvZiBzZWNvbmRzIHRoYXQgaGF2ZSBwYXNzZWQgb24gdGhlIGN1cnJlbnQgZGF5XHJcblx0ICogRG9lcyBub3QgY29uc2lkZXIgbGVhcCBzZWNvbmRzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHNlY29uZHMgWzAtODYzOTldXHJcblx0ICovXHJcblx0cHVibGljIHV0Y1NlY29uZE9mRGF5KCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gYmFzaWNzLnNlY29uZE9mRGF5KHRoaXMudXRjSG91cigpLCB0aGlzLnV0Y01pbnV0ZSgpLCB0aGlzLnV0Y1NlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBuZXcgRGF0ZVRpbWUgd2hpY2ggaXMgdGhlIGRhdGUrdGltZSByZWludGVycHJldGVkIGFzXHJcblx0ICogaW4gdGhlIG5ldyB6b25lLiBTbyBlLmcuIDA4OjAwIEFtZXJpY2EvQ2hpY2FnbyBjYW4gYmUgc2V0IHRvIDA4OjAwIEV1cm9wZS9CcnVzc2Vscy5cclxuXHQgKiBObyBjb252ZXJzaW9uIGlzIGRvbmUsIHRoZSB2YWx1ZSBpcyBqdXN0IGFzc3VtZWQgdG8gYmUgaW4gYSBkaWZmZXJlbnQgem9uZS5cclxuXHQgKiBXb3JrcyBmb3IgbmFpdmUgYW5kIGF3YXJlIGRhdGVzLiBUaGUgbmV3IHpvbmUgbWF5IGJlIG51bGwuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZSBUaGUgbmV3IHRpbWUgem9uZVxyXG5cdCAqIEByZXR1cm4gQSBuZXcgRGF0ZVRpbWUgd2l0aCB0aGUgb3JpZ2luYWwgdGltZXN0YW1wIGFuZCB0aGUgbmV3IHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHdpdGhab25lKHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUoXHJcblx0XHRcdHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCksIHRoaXMuZGF5KCksXHJcblx0XHRcdHRoaXMuaG91cigpLCB0aGlzLm1pbnV0ZSgpLCB0aGlzLnNlY29uZCgpLCB0aGlzLm1pbGxpc2Vjb25kKCksXHJcblx0XHRcdHpvbmUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCB0aGlzIGRhdGUgdG8gdGhlIGdpdmVuIHRpbWUgem9uZSAoaW4tcGxhY2UpLlxyXG5cdCAqIFRocm93cyBpZiB0aGlzIGRhdGUgZG9lcyBub3QgaGF2ZSBhIHRpbWUgem9uZS5cclxuXHQgKiBAcmV0dXJuIHRoaXMgKGZvciBjaGFpbmluZylcclxuXHQgKi9cclxuXHRwdWJsaWMgY29udmVydCh6b25lPzogVGltZVpvbmUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAoem9uZSkge1xyXG5cdFx0XHRhc3NlcnQodGhpcy5fem9uZSwgXCJEYXRlVGltZS50b1pvbmUoKTogQ2Fubm90IGNvbnZlcnQgdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGVcIik7XHJcblx0XHRcdGlmICh0aGlzLl96b25lLmVxdWFscyh6b25lKSkge1xyXG5cdFx0XHRcdHRoaXMuX3pvbmUgPSB6b25lOyAvLyBzdGlsbCBhc3NpZ24sIGJlY2F1c2Ugem9uZXMgbWF5IGJlIGVxdWFsIGJ1dCBub3QgaWRlbnRpY2FsIChVVEMvR01ULyswMClcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl96b25lID0gem9uZTtcclxuXHRcdFx0XHR0aGlzLl91dGNEYXRlVG9ab25lRGF0ZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl96b25lID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IHRoaXMuX3pvbmVEYXRlLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhpcyBkYXRlIGNvbnZlcnRlZCB0byB0aGUgZ2l2ZW4gdGltZSB6b25lLlxyXG5cdCAqIFVuYXdhcmUgZGF0ZXMgY2FuIG9ubHkgYmUgY29udmVydGVkIHRvIHVuYXdhcmUgZGF0ZXMgKGNsb25lKVxyXG5cdCAqIENvbnZlcnRpbmcgYW4gdW5hd2FyZSBkYXRlIHRvIGFuIGF3YXJlIGRhdGUgdGhyb3dzIGFuIGV4Y2VwdGlvbi4gVXNlIHRoZSBjb25zdHJ1Y3RvclxyXG5cdCAqIGlmIHlvdSByZWFsbHkgbmVlZCB0byBkbyB0aGF0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVcdFRoZSBuZXcgdGltZSB6b25lLiBUaGlzIG1heSBiZSBudWxsIHRvIGNyZWF0ZSB1bmF3YXJlIGRhdGUuXHJcblx0ICogQHJldHVybiBUaGUgY29udmVydGVkIGRhdGVcclxuXHQgKi9cclxuXHRwdWJsaWMgdG9ab25lKHpvbmU/OiBUaW1lWm9uZSk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdGFzc2VydCh0aGlzLl96b25lLCBcIkRhdGVUaW1lLnRvWm9uZSgpOiBDYW5ub3QgY29udmVydCB1bmF3YXJlIGRhdGUgdG8gYW4gYXdhcmUgZGF0ZVwiKTtcclxuXHRcdFx0Ly8gZ28gZnJvbSB1dGMgZGF0ZSB0byBwcmVzZXJ2ZSBpdCBpbiB0aGUgcHJlc2VuY2Ugb2YgRFNUXHJcblx0XHRcdHZhciByZXN1bHQgPSB0aGlzLmNsb25lKCk7XHJcblx0XHRcdHJlc3VsdC5fem9uZSA9IHpvbmU7XHJcblx0XHRcdGlmICghcmVzdWx0Ll96b25lLmVxdWFscyh0aGlzLl96b25lKSkge1xyXG5cdFx0XHRcdHJlc3VsdC5fdXRjRGF0ZVRvWm9uZURhdGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLl96b25lRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCksIG51bGwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCB0byBKYXZhU2NyaXB0IGRhdGUgd2l0aCB0aGUgem9uZSB0aW1lIGluIHRoZSBnZXRYKCkgbWV0aG9kcy5cclxuXHQgKiBVbmxlc3MgdGhlIHRpbWV6b25lIGlzIGxvY2FsLCB0aGUgRGF0ZS5nZXRVVENYKCkgbWV0aG9kcyB3aWxsIE5PVCBiZSBjb3JyZWN0LlxyXG5cdCAqIFRoaXMgaXMgYmVjYXVzZSBEYXRlIGNhbGN1bGF0ZXMgZ2V0VVRDWCgpIGZyb20gZ2V0WCgpIGFwcGx5aW5nIGxvY2FsIHRpbWUgem9uZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9EYXRlKCk6IERhdGUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkgLSAxLCB0aGlzLmRheSgpLFxyXG5cdFx0XHR0aGlzLmhvdXIoKSwgdGhpcy5taW51dGUoKSwgdGhpcy5zZWNvbmQoKSwgdGhpcy5taWxsaXNlY29uZCgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhbiBFeGNlbCB0aW1lc3RhbXAgZm9yIHRoaXMgZGF0ZXRpbWUgY29udmVydGVkIHRvIHRoZSBnaXZlbiB6b25lLlxyXG5cdCAqIERvZXMgbm90IHdvcmsgZm9yIGRhdGVzIDwgMTkwMFxyXG5cdCAqIEBwYXJhbSB0aW1lWm9uZSBPcHRpb25hbC4gWm9uZSB0byBjb252ZXJ0IHRvLCBkZWZhdWx0IHRoZSB6b25lIHRoZSBkYXRldGltZSBpcyBhbHJlYWR5IGluLlxyXG5cdCAqIEByZXR1cm4gYW4gRXhjZWwgZGF0ZS90aW1lIG51bWJlciBpLmUuIGRheXMgc2luY2UgMS0xLTE5MDAgd2hlcmUgMTkwMCBpcyBpbmNvcnJlY3RseSBzZWVuIGFzIGxlYXAgeWVhclxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b0V4Y2VsKHRpbWVab25lPzogVGltZVpvbmUpOiBudW1iZXIge1xyXG5cdFx0dmFyIGR0ID0gdGhpcztcclxuXHRcdGlmICh0aW1lWm9uZSAmJiAhdGltZVpvbmUuZXF1YWxzKHRoaXMuem9uZSgpKSkge1xyXG5cdFx0XHRkdCA9IHRoaXMudG9ab25lKHRpbWVab25lKTtcclxuXHRcdH1cclxuXHRcdHZhciBvZmZzZXRNaWxsaXMgPSBkdC5vZmZzZXQoKSAqIDYwICogMTAwMDtcclxuXHRcdHZhciB1bml4VGltZXN0YW1wID0gZHQudW5peFV0Y01pbGxpcygpO1xyXG5cdFx0cmV0dXJuIHRoaXMuX3VuaXhUaW1lU3RhbXBUb0V4Y2VsKHVuaXhUaW1lc3RhbXAgKyBvZmZzZXRNaWxsaXMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIEV4Y2VsIHRpbWVzdGFtcCBmb3IgdGhpcyBkYXRldGltZSBjb252ZXJ0ZWQgdG8gVVRDXHJcblx0ICogRG9lcyBub3Qgd29yayBmb3IgZGF0ZXMgPCAxOTAwXHJcblx0ICogQHJldHVybiBhbiBFeGNlbCBkYXRlL3RpbWUgbnVtYmVyIGkuZS4gZGF5cyBzaW5jZSAxLTEtMTkwMCB3aGVyZSAxOTAwIGlzIGluY29ycmVjdGx5IHNlZW4gYXMgbGVhcCB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIHRvVXRjRXhjZWwoKTogbnVtYmVyIHtcclxuXHRcdHZhciB1bml4VGltZXN0YW1wID0gdGhpcy51bml4VXRjTWlsbGlzKCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fdW5peFRpbWVTdGFtcFRvRXhjZWwodW5peFRpbWVzdGFtcCk7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIF91bml4VGltZVN0YW1wVG9FeGNlbChuOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIHJlc3VsdCA9ICgobikgLyAoMjQgKiA2MCAqIDYwICogMTAwMCkpICsgMjU1Njk7XHJcblx0XHQvLyByb3VuZCB0byBuZWFyZXN0IG1pbGxpc2Vjb25kXHJcblx0XHR2YXIgbXNlY3MgPSByZXN1bHQgLyAoMSAvIDg2NDAwMDAwKTtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKG1zZWNzKSAqICgxIC8gODY0MDAwMDApO1xyXG5cdH1cclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhIHRpbWUgZHVyYXRpb24gcmVsYXRpdmUgdG8gVVRDLiBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICogQHJldHVybiB0aGlzICsgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGR1cmF0aW9uOiBEdXJhdGlvbik6IERhdGVUaW1lO1xyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSByZWxhdGl2ZSB0byBVVEMsIGFzIHJlZ3VsYXJseSBhcyBwb3NzaWJsZS4gUmV0dXJucyBhIG5ldyBEYXRlVGltZVxyXG5cdCAqXHJcblx0ICogQWRkaW5nIGUuZy4gMSBob3VyIHdpbGwgaW5jcmVtZW50IHRoZSB1dGNIb3VyKCkgZmllbGQsIGFkZGluZyAxIG1vbnRoXHJcblx0ICogaW5jcmVtZW50cyB0aGUgdXRjTW9udGgoKSBmaWVsZC5cclxuXHQgKiBBZGRpbmcgYW4gYW1vdW50IG9mIHVuaXRzIGxlYXZlcyBsb3dlciB1bml0cyBpbnRhY3QuIEUuZy5cclxuXHQgKiBhZGRpbmcgYSBtb250aCB3aWxsIGxlYXZlIHRoZSBkYXkoKSBmaWVsZCB1bnRvdWNoZWQgaWYgcG9zc2libGUuXHJcblx0ICpcclxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXHJcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XHJcblx0ICogRGF0ZSNzZXRVVENNb250aCgpIGl0IHdpbGwgbm90IG92ZXJmbG93IGludG8gdGhlIG5leHQgbW9udGhcclxuXHQgKlxyXG5cdCAqIEluIGNhc2Ugb2YgRFNUIGNoYW5nZXMsIHRoZSB1dGMgdGltZSBmaWVsZHMgYXJlIHN0aWxsIHVudG91Y2hlZCBidXQgbG9jYWxcclxuXHQgKiB0aW1lIGZpZWxkcyBtYXkgc2hpZnQuXHJcblx0ICovXHJcblx0cHVibGljIGFkZChhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBJbXBsZW1lbnRhdGlvbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdHZhciBhbW91bnQ6IG51bWJlcjtcclxuXHRcdHZhciB1OiBUaW1lVW5pdDtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHR2YXIgZHVyYXRpb246IER1cmF0aW9uID0gPER1cmF0aW9uPihhMSk7XHJcblx0XHRcdGFtb3VudCA9IGR1cmF0aW9uLmFtb3VudCgpO1xyXG5cdFx0XHR1ID0gZHVyYXRpb24udW5pdCgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAoYTEpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgZmlyc3QgYXJndW1lbnRcIik7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKHVuaXQpID09PSBcIm51bWJlclwiLCBcImV4cGVjdCBudW1iZXIgYXMgc2Vjb25kIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhbW91bnQgPSA8bnVtYmVyPihhMSk7XHJcblx0XHRcdHUgPSB1bml0O1xyXG5cdFx0fVxyXG5cdFx0dmFyIHV0Y1RtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuX3V0Y0RhdGUsIGFtb3VudCwgdSk7XHJcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKHV0Y1RtLnRvVW5peE5vTGVhcFNlY3MoKSwgVGltZVpvbmUudXRjKCkpLnRvWm9uZSh0aGlzLl96b25lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgem9uZSB0aW1lLCBhcyByZWd1bGFybHkgYXMgcG9zc2libGUuIFJldHVybnMgYSBuZXcgRGF0ZVRpbWVcclxuXHQgKlxyXG5cdCAqIEFkZGluZyBlLmcuIDEgaG91ciB3aWxsIGluY3JlbWVudCB0aGUgaG91cigpIGZpZWxkIG9mIHRoZSB6b25lXHJcblx0ICogZGF0ZSBieSBvbmUuIEluIGNhc2Ugb2YgRFNUIGNoYW5nZXMsIHRoZSB0aW1lIGZpZWxkcyBtYXkgYWRkaXRpb25hbGx5XHJcblx0ICogaW5jcmVhc2UgYnkgdGhlIERTVCBvZmZzZXQsIGlmIGEgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWUgd291bGRcclxuXHQgKiBiZSByZWFjaGVkIG90aGVyd2lzZS5cclxuXHQgKlxyXG5cdCAqIEFkZGluZyBhIHVuaXQgb2YgdGltZSB3aWxsIGxlYXZlIGxvd2VyLXVuaXQgZmllbGRzIGludGFjdCwgdW5sZXNzIHRoZSByZXN1bHRcclxuXHQgKiB3b3VsZCBiZSBhIG5vbi1leGlzdGluZyB0aW1lLiBUaGVuIGFuIGV4dHJhIERTVCBvZmZzZXQgaXMgYWRkZWQuXHJcblx0ICpcclxuXHQgKiBOb3RlIGFkZGluZyBNb250aHMgb3IgWWVhcnMgd2lsbCBjbGFtcCB0aGUgZGF0ZSB0byB0aGUgZW5kLW9mLW1vbnRoIGlmXHJcblx0ICogdGhlIHN0YXJ0IGRhdGUgd2FzIGF0IHRoZSBlbmQgb2YgYSBtb250aCwgaS5lLiBjb250cmFyeSB0byBKYXZhU2NyaXB0XHJcblx0ICogRGF0ZSNzZXRVVENNb250aCgpIGl0IHdpbGwgbm90IG92ZXJmbG93IGludG8gdGhlIG5leHQgbW9udGhcclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkTG9jYWwoZHVyYXRpb246IER1cmF0aW9uKTogRGF0ZVRpbWU7XHJcblx0cHVibGljIGFkZExvY2FsKGFtb3VudDogbnVtYmVyLCB1bml0OiBUaW1lVW5pdCk6IERhdGVUaW1lO1xyXG5cdHB1YmxpYyBhZGRMb2NhbChhMTogYW55LCB1bml0PzogVGltZVVuaXQpOiBEYXRlVGltZSB7XHJcblx0XHR2YXIgYW1vdW50OiBudW1iZXI7XHJcblx0XHR2YXIgdTogVGltZVVuaXQ7XHJcblx0XHRpZiAodHlwZW9mIChhMSkgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0dmFyIGR1cmF0aW9uOiBEdXJhdGlvbiA9IDxEdXJhdGlvbj4oYTEpO1xyXG5cdFx0XHRhbW91bnQgPSBkdXJhdGlvbi5hbW91bnQoKTtcclxuXHRcdFx0dSA9IGR1cmF0aW9uLnVuaXQoKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFzc2VydCh0eXBlb2YgKGExKSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIGZpcnN0IGFyZ3VtZW50XCIpO1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mICh1bml0KSA9PT0gXCJudW1iZXJcIiwgXCJleHBlY3QgbnVtYmVyIGFzIHNlY29uZCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YW1vdW50ID0gPG51bWJlcj4oYTEpO1xyXG5cdFx0XHR1ID0gdW5pdDtcclxuXHRcdH1cclxuXHRcdHZhciBsb2NhbFRtID0gdGhpcy5fYWRkVG9UaW1lU3RydWN0KHRoaXMuX3pvbmVEYXRlLCBhbW91bnQsIHUpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0dmFyIGRpcmVjdGlvbjogTm9ybWFsaXplT3B0aW9uID0gKGFtb3VudCA+PSAwID8gTm9ybWFsaXplT3B0aW9uLlVwIDogTm9ybWFsaXplT3B0aW9uLkRvd24pO1xyXG5cdFx0XHR2YXIgbm9ybWFsaXplZCA9IHRoaXMuX3pvbmUubm9ybWFsaXplWm9uZVRpbWUobG9jYWxUbS50b1VuaXhOb0xlYXBTZWNzKCksIGRpcmVjdGlvbik7XHJcblx0XHRcdHJldHVybiBuZXcgRGF0ZVRpbWUobm9ybWFsaXplZCwgdGhpcy5fem9uZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbmV3IERhdGVUaW1lKGxvY2FsVG0udG9Vbml4Tm9MZWFwU2VjcygpLCBudWxsKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhbiBhbW91bnQgb2YgdGltZSB0byB0aGUgZ2l2ZW4gdGltZSBzdHJ1Y3QuIE5vdGU6IGRvZXMgbm90IG5vcm1hbGl6ZS5cclxuXHQgKiBLZWVwcyBsb3dlciB1bml0IGZpZWxkcyB0aGUgc2FtZSB3aGVyZSBwb3NzaWJsZSwgY2xhbXBzIGRheSB0byBlbmQtb2YtbW9udGggaWZcclxuXHQgKiBuZWNlc3NhcnkuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfYWRkVG9UaW1lU3RydWN0KHRtOiBUaW1lU3RydWN0LCBhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBUaW1lU3RydWN0IHtcclxuXHRcdHZhciB0YXJnZXRZZWFyOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0TW9udGg6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXREYXk6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRIb3VyczogbnVtYmVyO1xyXG5cdFx0dmFyIHRhcmdldE1pbnV0ZXM6IG51bWJlcjtcclxuXHRcdHZhciB0YXJnZXRTZWNvbmRzOiBudW1iZXI7XHJcblx0XHR2YXIgdGFyZ2V0TWlsbGlzZWNvbmRzOiBudW1iZXI7XHJcblxyXG5cdFx0c3dpdGNoICh1bml0KSB7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWlsbGlzZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiB7XHJcblx0XHRcdFx0cmV0dXJuIFRpbWVTdHJ1Y3QuZnJvbVVuaXgobWF0aC5yb3VuZFN5bSh0bS50b1VuaXhOb0xlYXBTZWNzKCkgKyBhbW91bnQgKiAxMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogNjAwMDApKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IHtcclxuXHRcdFx0XHQvLyB0b2RvIG1vcmUgaW50ZWxsaWdlbnQgYXBwcm9hY2ggbmVlZGVkIHdoZW4gaW1wbGVtZW50aW5nIGxlYXAgc2Vjb25kc1xyXG5cdFx0XHRcdHJldHVybiBUaW1lU3RydWN0LmZyb21Vbml4KG1hdGgucm91bmRTeW0odG0udG9Vbml4Tm9MZWFwU2VjcygpICsgYW1vdW50ICogMzYwMDAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDg2NDAwMDAwKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5XZWVrOiB7XHJcblx0XHRcdFx0Ly8gdG9kbyBtb3JlIGludGVsbGlnZW50IGFwcHJvYWNoIG5lZWRlZCB3aGVuIGltcGxlbWVudGluZyBsZWFwIHNlY29uZHNcclxuXHRcdFx0XHRyZXR1cm4gVGltZVN0cnVjdC5mcm9tVW5peChtYXRoLnJvdW5kU3ltKHRtLnRvVW5peE5vTGVhcFNlY3MoKSArIGFtb3VudCAqIDcgKiA4NjQwMDAwMCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTW9udGg6IHtcclxuXHRcdFx0XHRhc3NlcnQobWF0aC5pc0ludChhbW91bnQpLCBcIkNhbm5vdCBhZGQvc3ViIGEgbm9uLWludGVnZXIgYW1vdW50IG9mIG1vbnRoc1wiKTtcclxuXHRcdFx0XHQvLyBrZWVwIHRoZSBkYXktb2YtbW9udGggdGhlIHNhbWUgKGNsYW1wIHRvIGVuZC1vZi1tb250aClcclxuXHRcdFx0XHRpZiAoYW1vdW50ID49IDApIHtcclxuXHRcdFx0XHRcdHRhcmdldFllYXIgPSB0bS55ZWFyICsgTWF0aC5jZWlsKChhbW91bnQgLSAoMTIgLSB0bS5tb250aCkpIC8gMTIpO1xyXG5cdFx0XHRcdFx0dGFyZ2V0TW9udGggPSAxICsgbWF0aC5wb3NpdGl2ZU1vZHVsbygodG0ubW9udGggLSAxICsgTWF0aC5mbG9vcihhbW91bnQpKSwgMTIpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR0YXJnZXRZZWFyID0gdG0ueWVhciArIE1hdGguZmxvb3IoKGFtb3VudCArICh0bS5tb250aCAtIDEpKSAvIDEyKTtcclxuXHRcdFx0XHRcdHRhcmdldE1vbnRoID0gMSArIG1hdGgucG9zaXRpdmVNb2R1bG8oKHRtLm1vbnRoIC0gMSArIE1hdGguY2VpbChhbW91bnQpKSwgMTIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0YXJnZXREYXkgPSBNYXRoLm1pbih0bS5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh0YXJnZXRZZWFyLCB0YXJnZXRNb250aCkpO1xyXG5cdFx0XHRcdHRhcmdldEhvdXJzID0gdG0uaG91cjtcclxuXHRcdFx0XHR0YXJnZXRNaW51dGVzID0gdG0ubWludXRlO1xyXG5cdFx0XHRcdHRhcmdldFNlY29uZHMgPSB0bS5zZWNvbmQ7XHJcblx0XHRcdFx0dGFyZ2V0TWlsbGlzZWNvbmRzID0gdG0ubWlsbGk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRhcmdldFllYXIsIHRhcmdldE1vbnRoLCB0YXJnZXREYXksIHRhcmdldEhvdXJzLCB0YXJnZXRNaW51dGVzLCB0YXJnZXRTZWNvbmRzLCB0YXJnZXRNaWxsaXNlY29uZHMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdGFzc2VydChtYXRoLmlzSW50KGFtb3VudCksIFwiQ2Fubm90IGFkZC9zdWIgYSBub24taW50ZWdlciBhbW91bnQgb2YgeWVhcnNcIik7XHJcblx0XHRcdFx0dGFyZ2V0WWVhciA9IHRtLnllYXIgKyBhbW91bnQ7XHJcblx0XHRcdFx0dGFyZ2V0TW9udGggPSB0bS5tb250aDtcclxuXHRcdFx0XHR0YXJnZXREYXkgPSBNYXRoLm1pbih0bS5kYXksIGJhc2ljcy5kYXlzSW5Nb250aCh0YXJnZXRZZWFyLCB0YXJnZXRNb250aCkpO1xyXG5cdFx0XHRcdHRhcmdldEhvdXJzID0gdG0uaG91cjtcclxuXHRcdFx0XHR0YXJnZXRNaW51dGVzID0gdG0ubWludXRlO1xyXG5cdFx0XHRcdHRhcmdldFNlY29uZHMgPSB0bS5zZWNvbmQ7XHJcblx0XHRcdFx0dGFyZ2V0TWlsbGlzZWNvbmRzID0gdG0ubWlsbGk7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBUaW1lU3RydWN0KHRhcmdldFllYXIsIHRhcmdldE1vbnRoLCB0YXJnZXREYXksIHRhcmdldEhvdXJzLCB0YXJnZXRNaW51dGVzLCB0YXJnZXRTZWNvbmRzLCB0YXJnZXRNaWxsaXNlY29uZHMpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBwZXJpb2QgdW5pdC5cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSBhcyBhZGQoLTEqZHVyYXRpb24pOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN1YihkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHQvKipcclxuXHQgKiBTYW1lIGFzIGFkZCgtMSphbW91bnQsIHVuaXQpOyBSZXR1cm5zIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN1YihhbW91bnQ6IG51bWJlciwgdW5pdDogVGltZVVuaXQpOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgKGExKSA9PT0gXCJvYmplY3RcIiAmJiBhMSBpbnN0YW5jZW9mIER1cmF0aW9uKSB7XHJcblx0XHRcdHZhciBkdXJhdGlvbjogRHVyYXRpb24gPSA8RHVyYXRpb24+KGExKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKGR1cmF0aW9uLm11bHRpcGx5KC0xKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhc3NlcnQodHlwZW9mIChhMSkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBmaXJzdCBhcmd1bWVudFwiKTtcclxuXHRcdFx0YXNzZXJ0KHR5cGVvZiAodW5pdCkgPT09IFwibnVtYmVyXCIsIFwiZXhwZWN0IG51bWJlciBhcyBzZWNvbmQgYXJndW1lbnRcIik7XHJcblx0XHRcdHZhciBhbW91bnQ6IG51bWJlciA9IDxudW1iZXI+KGExKTtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkKC0xICogYW1vdW50LCB1bml0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNhbWUgYXMgYWRkTG9jYWwoLTEqYW1vdW50LCB1bml0KTsgUmV0dXJucyBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWJMb2NhbChkdXJhdGlvbjogRHVyYXRpb24pOiBEYXRlVGltZTtcclxuXHRwdWJsaWMgc3ViTG9jYWwoYW1vdW50OiBudW1iZXIsIHVuaXQ6IFRpbWVVbml0KTogRGF0ZVRpbWU7XHJcblx0cHVibGljIHN1YkxvY2FsKGExOiBhbnksIHVuaXQ/OiBUaW1lVW5pdCk6IERhdGVUaW1lIHtcclxuXHRcdGlmICh0eXBlb2YgYTEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYWRkTG9jYWwoKDxEdXJhdGlvbj5hMSkubXVsdGlwbHkoLTEpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmFkZExvY2FsKC0xICogPG51bWJlcj5hMSwgdW5pdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIGRpZmZlcmVuY2UgYmV0d2VlbiB0d28gRGF0ZVRpbWVzXHJcblx0ICogQHJldHVybiB0aGlzIC0gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZGlmZihvdGhlcjogRGF0ZVRpbWUpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpIC0gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCogQ2hvcHMgb2ZmIHRoZSB0aW1lIHBhcnQsIHlpZWxkcyB0aGUgc2FtZSBkYXRlIGF0IDAwOjAwOjAwLjAwMFxyXG5cdCogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCovXHJcblx0cHVibGljIHN0YXJ0T2ZEYXkoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCB0aGlzLmRheSgpLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIG1vbnRoIGF0IDAwOjAwOjAwXHJcblx0ICogQHJldHVybiBhIG5ldyBEYXRlVGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFydE9mTW9udGgoKTogRGF0ZVRpbWUge1xyXG5cdFx0cmV0dXJuIG5ldyBEYXRlVGltZSh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpLCAxLCAwLCAwLCAwLCAwLCB0aGlzLnpvbmUoKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHllYXIgYXQgMDA6MDA6MDBcclxuXHQgKiBAcmV0dXJuIGEgbmV3IERhdGVUaW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YXJ0T2ZZZWFyKCk6IERhdGVUaW1lIHtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUodGhpcy55ZWFyKCksIDEsIDEsIDAsIDAsIDAsIDAsIHRoaXMuem9uZSgpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgKHRoaXMgPCBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc1RoYW4ob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgPCBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmICh0aGlzIDw9IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzRXF1YWwob3RoZXI6IERhdGVUaW1lKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCkgPD0gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzIGFuZCBvdGhlciByZXByZXNlbnQgdGhlIHNhbWUgbW9tZW50IGluIHRpbWUgaW4gVVRDXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFscyhvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLmVxdWFscyhvdGhlci5fdXRjRGF0ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGFuZCB0aGUgc2FtZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy5fem9uZURhdGUuZXF1YWxzKG90aGVyLl96b25lRGF0ZSlcclxuXHRcdFx0JiYgKHRoaXMuX3pvbmUgPT09IG51bGwpID09PSAob3RoZXIuX3pvbmUgPT09IG51bGwpXHJcblx0XHRcdCYmICh0aGlzLl96b25lID09PSBudWxsIHx8IHRoaXMuX3pvbmUuaWRlbnRpY2FsKG90aGVyLl96b25lKSlcclxuXHRcdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJUaGFuKG90aGVyOiBEYXRlVGltZSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpID4gb3RoZXIuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID49IG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIGdyZWF0ZXJFcXVhbChvdGhlcjogRGF0ZVRpbWUpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvVW5peE5vTGVhcFNlY3MoKSA+PSBvdGhlci5fdXRjRGF0ZS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIG9mIHRoaXMgYW5kIG90aGVyXHJcblx0ICovXHJcblx0cHVibGljIG1pbihvdGhlcjogRGF0ZVRpbWUpOiBEYXRlVGltZSB7XHJcblx0XHRpZiAodGhpcy5sZXNzVGhhbihvdGhlcikpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuY2xvbmUoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBvdGhlci5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybiBUaGUgbWF4aW11bSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtYXgob3RoZXI6IERhdGVUaW1lKTogRGF0ZVRpbWUge1xyXG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFByb3BlciBJU08gODYwMSBmb3JtYXQgc3RyaW5nIHdpdGggYW55IElBTkEgem9uZSBjb252ZXJ0ZWQgdG8gSVNPIG9mZnNldFxyXG5cdCAqIEUuZy4gXCIyMDE0LTAxLTAxVDIzOjE1OjMzKzAxOjAwXCIgZm9yIEV1cm9wZS9BbXN0ZXJkYW1cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9Jc29TdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHZhciBzOiBzdHJpbmcgPSB0aGlzLl96b25lRGF0ZS50b1N0cmluZygpO1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0cmV0dXJuIHMgKyBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyh0aGlzLm9mZnNldCgpKTsgLy8gY29udmVydCBJQU5BIG5hbWUgdG8gb2Zmc2V0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gczsgLy8gbm8gem9uZSBwcmVzZW50XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIERhdGVUaW1lIGFjY29yZGluZyB0byB0aGVcclxuXHQgKiBzcGVjaWZpZWQgZm9ybWF0LiBUaGUgZm9ybWF0IGlzIGltcGxlbWVudGVkIGFzIHRoZSBMRE1MIHN0YW5kYXJkXHJcblx0ICogKGh0dHA6Ly91bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X1BhdHRlcm5zKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZvcm1hdFN0cmluZyBUaGUgZm9ybWF0IHNwZWNpZmljYXRpb24gKGUuZy4gXCJkZC9NTS95eXl5IEhIOm1tOnNzXCIpXHJcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT3B0aW9uYWwsIG5vbi1lbmdsaXNoIGZvcm1hdCBtb250aCBuYW1lcyBldGMuXHJcblx0ICogQHJldHVybiBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgRGF0ZVRpbWVcclxuXHQgKi9cclxuXHRwdWJsaWMgZm9ybWF0KGZvcm1hdFN0cmluZzogc3RyaW5nLCBmb3JtYXRPcHRpb25zPzogZm9ybWF0LkZvcm1hdE9wdGlvbnMpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIGZvcm1hdC5mb3JtYXQodGhpcy5fem9uZURhdGUsIHRoaXMuX3V0Y0RhdGUsIHRoaXMuem9uZSgpLCBmb3JtYXRTdHJpbmcsIGZvcm1hdE9wdGlvbnMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgYSBkYXRlIGluIGEgZ2l2ZW4gZm9ybWF0XHJcblx0ICogQHBhcmFtIHMgdGhlIHN0cmluZyB0byBwYXJzZVxyXG5cdCAqIEBwYXJhbSBmb3JtYXQgdGhlIGZvcm1hdCB0aGUgc3RyaW5nIGlzIGluXHJcblx0ICogQHBhcmFtIHpvbmUgT3B0aW9uYWwsIHRoZSB6b25lIHRvIGFkZCAoaWYgbm8gem9uZSBpcyBnaXZlbiBpbiB0aGUgc3RyaW5nKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgcGFyc2Uoczogc3RyaW5nLCBmb3JtYXQ6IHN0cmluZywgem9uZT86IFRpbWVab25lKTogRGF0ZVRpbWUge1xyXG5cdFx0dmFyIHBhcnNlZCA9IHBhcnNlRnVuY3MucGFyc2UocywgZm9ybWF0LCB6b25lKTtcclxuXHRcdHJldHVybiBuZXcgRGF0ZVRpbWUocGFyc2VkLnRpbWUueWVhciwgcGFyc2VkLnRpbWUubW9udGgsIHBhcnNlZC50aW1lLmRheSxcclxuXHRcdFx0cGFyc2VkLnRpbWUuaG91ciwgcGFyc2VkLnRpbWUubWludXRlLCBwYXJzZWQudGltZS5zZWNvbmQsIHBhcnNlZC50aW1lLm1pbGxpLFxyXG5cdFx0XHRwYXJzZWQuem9uZVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgd2l0aCBJQU5BIG5hbWUgaWYgYXBwbGljYWJsZS5cclxuXHQgKiBFLmcuIFwiMjAxNC0wMS0wMVQyMzoxNTozMy4wMDAgRXVyb3BlL0Ftc3RlcmRhbVwiXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHR2YXIgczogc3RyaW5nID0gdGhpcy5fem9uZURhdGUudG9TdHJpbmcoKTtcclxuXHRcdGlmICh0aGlzLl96b25lKSB7XHJcblx0XHRcdGlmICh0aGlzLl96b25lLmtpbmQoKSAhPT0gVGltZVpvbmVLaW5kLk9mZnNldCkge1xyXG5cdFx0XHRcdHJldHVybiBzICsgXCIgXCIgKyB0aGlzLl96b25lLnRvU3RyaW5nKCk7IC8vIHNlcGFyYXRlIElBTkEgbmFtZSBvciBcImxvY2FsdGltZVwiIHdpdGggYSBzcGFjZVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBzICsgdGhpcy5fem9uZS50b1N0cmluZygpOyAvLyBkbyBub3Qgc2VwYXJhdGUgSVNPIHpvbmVcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHM7IC8vIG5vIHpvbmUgcHJlc2VudFxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXNlZCBieSB1dGlsLmluc3BlY3QoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gXCJbRGF0ZVRpbWU6IFwiICsgdGhpcy50b1N0cmluZygpICsgXCJdXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdmFsdWVPZigpIG1ldGhvZCByZXR1cm5zIHRoZSBwcmltaXRpdmUgdmFsdWUgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIHZhbHVlT2YoKTogYW55IHtcclxuXHRcdHJldHVybiB0aGlzLnVuaXhVdGNNaWxsaXMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1vZGlmaWVkIElTTyA4NjAxIGZvcm1hdCBzdHJpbmcgaW4gVVRDIHdpdGhvdXQgdGltZSB6b25lIGluZm9cclxuXHQgKi9cclxuXHRwdWJsaWMgdG9VdGNTdHJpbmcoKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiB0aGlzLl91dGNEYXRlLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGUgdGhpcy5fem9uZURhdGUgZnJvbSB0aGlzLl91dGNEYXRlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdXRjRGF0ZVRvWm9uZURhdGUoKTogdm9pZCB7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0dmFyIG9mZnNldDogbnVtYmVyID0gdGhpcy5fem9uZS5vZmZzZXRGb3JVdGModGhpcy5fdXRjRGF0ZS55ZWFyLCB0aGlzLl91dGNEYXRlLm1vbnRoLCB0aGlzLl91dGNEYXRlLmRheSxcclxuXHRcdFx0XHR0aGlzLl91dGNEYXRlLmhvdXIsIHRoaXMuX3V0Y0RhdGUubWludXRlLCB0aGlzLl91dGNEYXRlLnNlY29uZCwgdGhpcy5fdXRjRGF0ZS5taWxsaSk7XHJcblx0XHRcdHRoaXMuX3pvbmVEYXRlID0gVGltZVN0cnVjdC5mcm9tVW5peCh0aGlzLl96b25lLm5vcm1hbGl6ZVpvbmVUaW1lKHRoaXMuX3V0Y0RhdGUudG9Vbml4Tm9MZWFwU2VjcygpICsgb2Zmc2V0ICogNjAwMDApKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX3pvbmVEYXRlID0gdGhpcy5fdXRjRGF0ZS5jbG9uZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlIHRoaXMuX3V0Y0RhdGUgZnJvbSB0aGlzLl96b25lRGF0ZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVEYXRlVG9VdGNEYXRlKCk6IHZvaWQge1xyXG5cdFx0aWYgKHRoaXMuX3pvbmUpIHtcclxuXHRcdFx0dmFyIG9mZnNldDogbnVtYmVyID0gdGhpcy5fem9uZS5vZmZzZXRGb3Jab25lKHRoaXMuX3pvbmVEYXRlLnllYXIsIHRoaXMuX3pvbmVEYXRlLm1vbnRoLCB0aGlzLl96b25lRGF0ZS5kYXksXHJcblx0XHRcdFx0dGhpcy5fem9uZURhdGUuaG91ciwgdGhpcy5fem9uZURhdGUubWludXRlLCB0aGlzLl96b25lRGF0ZS5zZWNvbmQsIHRoaXMuX3pvbmVEYXRlLm1pbGxpKTtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IFRpbWVTdHJ1Y3QuZnJvbVVuaXgodGhpcy5fem9uZURhdGUudG9Vbml4Tm9MZWFwU2VjcygpIC0gb2Zmc2V0ICogNjAwMDApO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy5fdXRjRGF0ZSA9IHRoaXMuX3pvbmVEYXRlLmNsb25lKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTcGxpdCBhIGNvbWJpbmVkIElTTyBkYXRldGltZSBhbmQgdGltZXpvbmUgaW50byBkYXRldGltZSBhbmQgdGltZXpvbmVcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfc3BsaXREYXRlRnJvbVRpbWVab25lKHM6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuXHRcdHZhciB0cmltbWVkID0gcy50cmltKCk7XHJcblx0XHR2YXIgcmVzdWx0ID0gW1wiXCIsIFwiXCJdO1xyXG5cdFx0dmFyIGluZGV4ID0gdHJpbW1lZC5sYXN0SW5kZXhPZihcIiBcIik7XHJcblx0XHRpZiAoaW5kZXggPiAtMSkge1xyXG5cdFx0XHRyZXN1bHRbMF0gPSB0cmltbWVkLnN1YnN0cigwLCBpbmRleCk7XHJcblx0XHRcdHJlc3VsdFsxXSA9IHRyaW1tZWQuc3Vic3RyKGluZGV4ICsgMSk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCJaXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCwgMSk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCIrXCIpO1xyXG5cdFx0aWYgKGluZGV4ID4gLTEpIHtcclxuXHRcdFx0cmVzdWx0WzBdID0gdHJpbW1lZC5zdWJzdHIoMCwgaW5kZXgpO1xyXG5cdFx0XHRyZXN1bHRbMV0gPSB0cmltbWVkLnN1YnN0cihpbmRleCk7XHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHR9XHJcblx0XHRpbmRleCA9IHRyaW1tZWQubGFzdEluZGV4T2YoXCItXCIpO1xyXG5cdFx0aWYgKGluZGV4IDwgOCkge1xyXG5cdFx0XHRpbmRleCA9IC0xOyAvLyBhbnkgXCItXCIgd2UgZm91bmQgd2FzIGEgZGF0ZSBzZXBhcmF0b3JcclxuXHRcdH1cclxuXHRcdGlmIChpbmRleCA+IC0xKSB7XHJcblx0XHRcdHJlc3VsdFswXSA9IHRyaW1tZWQuc3Vic3RyKDAsIGluZGV4KTtcclxuXHRcdFx0cmVzdWx0WzFdID0gdHJpbW1lZC5zdWJzdHIoaW5kZXgpO1xyXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0WzBdID0gdHJpbW1lZDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG59XHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
