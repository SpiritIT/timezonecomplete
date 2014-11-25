/**
* Copyright(c) 2014 Spirit IT BV
*
* Date+time+timezone representation
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

var basics = require("./basics");

var TimeStruct = basics.TimeStruct;
var TimeUnit = basics.TimeUnit;

var duration = require("./duration");
var Duration = duration.Duration;

var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;

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
    if (typeof timeZone === "undefined") { timeZone = TimeZone.utc(); }
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
                            normalizedUnixTimestamp = this._zone.normalizeZoneTime(a1);
                        } else {
                            normalizedUnixTimestamp = a1;
                        }
                        this._zoneDate = TimeStruct.fromUnix(normalizedUnixTimestamp);
                        this._zoneDateToUtcDate();
                    } else {
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

                        this._zone = (typeof (timeZone) === "object" && timeZone instanceof TimeZone ? timeZone : null);

                        // normalize local time (remove non-existing local time)
                        if (this._zone) {
                            var localMillis = basics.timeToUnixNoLeapSecs(year, month, day, hour, minute, second, millisecond);
                            this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(localMillis));
                        } else {
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
                    } else {
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
        if (typeof timeZone === "undefined") { timeZone = TimeZone.utc(); }
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc()).toZone(timeZone);
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
        if (typeof dstDependent === "undefined") { dstDependent = true; }
        if (this.zone()) {
            return this.zone().abbreviationForUtc(this.utcYear(), this.utcMonth(), this.utcDay(), this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond(), dstDependent);
        } else {
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
    * Convert this date to the given time zone (in-place).
    * Throws if this date does not have a time zone.
    * @return this (for chaining)
    */
    DateTime.prototype.convert = function (zone) {
        if (zone) {
            assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
            if (this._zone.equals(zone)) {
                this._zone = zone; // still assign, because zones may be equal but not identical (UTC/GMT/+00)
            } else {
                this._zone = zone;
                this._utcDateToZoneDate();
            }
        } else {
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
        } else {
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
    * Implementation.
    */
    DateTime.prototype.add = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof Duration) {
            var duration = (a1);
            var newMillis = this._utcDate.toUnixNoLeapSecs() + duration.milliseconds();
            if (this._zone) {
                var tm = TimeStruct.fromUnix(newMillis);
                newMillis += this._zone.offsetForUtc(tm.year, tm.month, tm.day, tm.hour, tm.minute, tm.second, tm.milli) * 60000;
            }
            return new DateTime(newMillis, this.zone());
        } else {
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            var amount = (a1);
            var utcTm = this._addToTimeStruct(this._utcDate, amount, unit);
            return new DateTime(utcTm.toUnixNoLeapSecs(), TimeZone.utc()).toZone(this._zone);
        }
    };

    /**
    * Add an amount of time to the zone time, as regularly as possible.
    *
    * Adding e.g. 1 hour will increment the hour() field of the zone
    * date by one. In case of DST changes, the time fields may additionally
    * increase by the DST offset, if a non-existing local time would
    * be reached otherwise.
    *
    * Adding a unit of time will leave lower-unit fields intact, unless the result
    * would be a non-existing time. Then an extra DST offset is added.
    *
    * Note adding Months or Years will clamp the date to the end-of-month if
    * the start date was at the end of a month, i.e. contrary to JavaScript
    * Date#setUTCMonth() it will not overflow into the next month
    */
    DateTime.prototype.addLocal = function (amount, unit) {
        var localTm = this._addToTimeStruct(this._zoneDate, amount, unit);
        if (this._zone) {
            var direction = (amount >= 0 ? 0 /* Up */ : 1 /* Down */);
            var normalized = this._zone.normalizeZoneTime(localTm.toUnixNoLeapSecs(), direction);
            return new DateTime(normalized, this._zone);
        } else {
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
            case 0 /* Second */: {
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 1000);
            }
            case 1 /* Minute */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 60000);
            }
            case 2 /* Hour */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 3600000);
            }
            case 3 /* Day */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 86400000);
            }
            case 4 /* Week */: {
                // todo more intelligent approach needed when implementing leap seconds
                return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 7 * 86400000);
            }
            case 5 /* Month */: {
                // keep the day-of-month the same (clamp to end-of-month)
                targetYear = amount >= 0 ? (tm.year + Math.floor((tm.month - 1 + amount) / 12)) : (tm.year + Math.ceil((tm.month - 1 + amount) / 12));
                targetMonth = 1 + (amount >= 0 ? Math.floor((tm.month - 1 + amount) % 12) : Math.ceil((tm.month - 1 + amount) % 12));
                targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
                targetHours = tm.hour;
                targetMinutes = tm.minute;
                targetSeconds = tm.second;
                targetMilliseconds = tm.milli;
                return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
            }
            case 6 /* Year */: {
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
        } else {
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            var amount = (a1);
            return this.add(-1 * amount, unit);
        }
    };

    /**
    * Same as addLocal(-1*amount, unit);
    */
    DateTime.prototype.subLocal = function (amount, unit) {
        return this.addLocal(-1 * amount, unit);
    };

    /**
    * Time difference between two DateTimes
    * @return this - other
    */
    DateTime.prototype.diff = function (other) {
        return new Duration(this._utcDate.toUnixNoLeapSecs() - other._utcDate.toUnixNoLeapSecs());
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
    * @return True iff this and other represent the same time in UTC
    */
    DateTime.prototype.equals = function (other) {
        return this._utcDate.equals(other._utcDate);
    };

    /**
    * @return True iff this and other represent the same time and
    * have the same zone
    */
    DateTime.prototype.identical = function (other) {
        return (this._zoneDate.equals(other._zoneDate) && (this._zone === null) === (other._zone === null) && (this._zone === null || this._zone.equals(other._zone)));
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
            return s + TimeZone.offsetToString(this.offset());
        } else {
            return s;
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
                return s + " " + this._zone.toString();
            } else {
                return s + this._zone.toString();
            }
        } else {
            return s;
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
        } else {
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
        } else {
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
    DateTime.timeSource = new RealTimeSource();
    return DateTime;
})();
exports.DateTime = DateTime;
//# sourceMappingURL=datetime.js.map
