/**
* Copyright(c) 2014 Spirit IT BV
*
* Date+time+timezone representation
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

var basics = require("./basics");

var TimeUnit = basics.TimeUnit;

var duration = require("./duration");
var Duration = duration.Duration;

var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;

var strings = require("./strings");

var timesource = require("./timesource");

var RealTimeSource = timesource.RealTimeSource;

var timezone = require("./timezone");
var TimeZone = timezone.TimeZone;
var TimeZoneKind = timezone.TimeZoneKind;

/**
* DateTime class which is time zone-aware
* and which can be mocked for testing purposes
*/
var DateTime = (function () {
    /**
    * Constructor implementation, do not call
    */
    function DateTime(a1, a2, a3, h, m, s, ms, timeZone) {
        var tempDate;
        var offset;

        switch (typeof (a1)) {
            case "number":
                 {
                    if (a2 === undefined || a2 === null || a2 instanceof TimeZone) {
                        // unix timestamp constructor
                        assert(typeof (a1) === "number", "DateTime.DateTime(): expect unixTimestamp to be a number");
                        this._zone = (typeof (a2) === "object" && a2 instanceof TimeZone ? a2 : null);
                        this._zoneDate = new Date(a1);
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
                        var localMillis = basics.timeToUnixNoLeapSecs(year, month, day, hour, minute, second, millisecond);
                        if (this._zone) {
                            localMillis = this._zone.normalizeZoneTime(localMillis);
                        }
                        this._zoneDate = new Date(localMillis);
                        this._zoneDateToUtcDate();
                    }
                }
                break;
            case "string":
                 {
                    var ss = DateTime._splitDateFromTimeZone(a1);
                    assert(ss.length === 2, "Invalid date string given: \"" + a1 + "\"");
                    if (a2 instanceof TimeZone) {
                        this._zone = (a2);
                    } else {
                        this._zone = TimeZone.zone(ss[1]);
                    }
                    this._zoneDate = new Date(ss[0] + "Z");
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

                    // set time zone
                    // calculate internal time representation
                    // go through string conversion because JavaScript has a bug otherwise
                    if (dk === 0 /* Get */) {
                        tempDate = new Date(strings.isoString(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) + "Z");
                        offset = (this._zone ? this._zone.offsetForZoneDate(tempDate, 1 /* GetUTC */) : 0);
                        this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
                        this._utcDateToZoneDate();
                    } else {
                        tempDate = new Date(strings.isoString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()) + "Z");
                        offset = (this._zone ? this._zone.offsetForZoneDate(tempDate, 1 /* GetUTC */) : 0);
                        this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
                        this._utcDateToZoneDate();
                    }
                }
                break;
            case "undefined":
                 {
                    // nothing given, make local datetime
                    this._utcDate = DateTime.timeSource.now();
                    this._zone = TimeZone.local();
                    this._utcDateToZoneDate();
                }
                break;

            default:
                /* istanbul ignore next */
                assert(false, "DateTime.DateTime(): unexpected first argument type.");

                break;
        }
    }
    /**
    * Current date+time in local time (derived from DateTime.timeSource.now()).
    */
    DateTime.nowLocal = function () {
        var n = DateTime.timeSource.now();
        return new DateTime(n, 0 /* Get */, TimeZone.local());
    };

    /**
    * Current date+time in UTC time (derived from DateTime.timeSource.now()).
    */
    DateTime.nowUtc = function () {
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc());
    };

    /**
    * Current date+time in the given time zone (derived from DateTime.timeSource.now()).
    * @param timeZone	The desired time zone.
    */
    DateTime.now = function (timeZone) {
        return new DateTime(DateTime.timeSource.now(), 1 /* GetUTC */, TimeZone.utc()).toZone(timeZone);
    };

    /**
    * @return a copy of this object
    */
    DateTime.prototype.clone = function () {
        var result = new DateTime();
        result._utcDate = new Date(this._utcDate.valueOf());
        result._zoneDate = new Date(this._zoneDate.valueOf());
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
    * @return the offset w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
    */
    DateTime.prototype.offset = function () {
        return Math.round((this._zoneDate.valueOf() - this._utcDate.valueOf()) / 60000);
    };

    /**
    * @return The full year e.g. 2014
    */
    DateTime.prototype.year = function () {
        return this._zoneDate.getUTCFullYear();
    };

    /**
    * @return The month 1-12 (note this deviates from JavaScript Date)
    */
    DateTime.prototype.month = function () {
        return this._zoneDate.getUTCMonth() + 1;
    };

    /**
    * @return The day of the month 1-31
    */
    DateTime.prototype.day = function () {
        return this._zoneDate.getUTCDate();
    };

    /**
    * @return The hour 0-23
    */
    DateTime.prototype.hour = function () {
        return this._zoneDate.getUTCHours();
    };

    /**
    * @return the minutes 0-59
    */
    DateTime.prototype.minute = function () {
        return this._zoneDate.getUTCMinutes();
    };

    /**
    * @return the seconds 0-59
    */
    DateTime.prototype.second = function () {
        return this._zoneDate.getUTCSeconds();
    };

    /**
    * @return the milliseconds 0-999
    */
    DateTime.prototype.millisecond = function () {
        return this._zoneDate.getUTCMilliseconds();
    };

    /**
    * @return the day-of-week (the enum values correspond to JavaScript
    * week day numbers)
    */
    DateTime.prototype.weekDay = function () {
        return this._zoneDate.getUTCDay();
    };

    /**
    * @return Milliseconds since 1970-01-01T00:00:00.000Z
    */
    DateTime.prototype.unixUtcMillis = function () {
        return this._utcDate.valueOf();
    };

    /**
    * @return The full year e.g. 2014
    */
    DateTime.prototype.utcYear = function () {
        return this._utcDate.getUTCFullYear();
    };

    /**
    * @return The UTC month 1-12 (note this deviates from JavaScript Date)
    */
    DateTime.prototype.utcMonth = function () {
        return this._utcDate.getUTCMonth() + 1;
    };

    /**
    * @return The UTC day of the month 1-31
    */
    DateTime.prototype.utcDay = function () {
        return this._utcDate.getUTCDate();
    };

    /**
    * @return The UTC hour 0-23
    */
    DateTime.prototype.utcHour = function () {
        return this._utcDate.getUTCHours();
    };

    /**
    * @return The UTC minutes 0-59
    */
    DateTime.prototype.utcMinute = function () {
        return this._utcDate.getUTCMinutes();
    };

    /**
    * @return The UTC seconds 0-59
    */
    DateTime.prototype.utcSecond = function () {
        return this._utcDate.getUTCSeconds();
    };

    /**
    * @return The UTC milliseconds 0-999
    */
    DateTime.prototype.utcMillisecond = function () {
        return this._utcDate.getUTCMilliseconds();
    };

    /**
    * @return the UTC day-of-week (the enum values correspond to JavaScript
    * week day numbers)
    */
    DateTime.prototype.utcWeekDay = function () {
        return this._utcDate.getUTCDay();
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
            this._utcDate = new Date(this._zoneDate.valueOf());
        }
        return this;
    };

    /**
    * Returns this date converted to the given time zone.
    * Unaware dates can only be converted to unaware dates (clone)
    * For unaware dates, an exception is thrown
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
            return new DateTime(this._zoneDate.valueOf(), null);
        }
    };

    /**
    * Convert to JavaScript date with the zone time in the getX() methods.
    * Unless the timezone is local, the Date.getUTCX() methods will NOT be correct.
    */
    DateTime.prototype.toDate = function () {
        return new Date(this._zoneDate.valueOf() + this._utcDate.getTimezoneOffset() * 60000);
    };

    /**
    * Implementation.
    */
    DateTime.prototype.add = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof Duration) {
            var duration = (a1);
            var newTimestamp = this._utcDate.valueOf() + duration.milliseconds();
            if (this._zone) {
                newTimestamp += this._zone.offsetForUtcDate(new Date(newTimestamp), 1 /* GetUTC */) * 60000;
            }
            return new DateTime(newTimestamp, this.zone());
        } else {
            assert(typeof (a1) === "number", "expect number as first argument");
            assert(typeof (unit) === "number", "expect number as second argument");
            var amount = (a1);
            var utcDate = new Date(this._utcDate.valueOf());
            utcDate = this._addToDate(utcDate, amount, unit);
            assert(this._utcDate.valueOf() !== utcDate.valueOf() || amount === 0);
            var result = new DateTime(utcDate, 1 /* GetUTC */, TimeZone.utc()).toZone(this._zone);

            // TODO remove this once bug in V8 engine solved
            if (amount !== 0 && result.equals(this)) {
                // workaround for bug in javascript, at least prevent endless loops due to
                // date not changing
                result = this.add(amount * 2, unit);
            }
            return result;
        }
    };

    /**
    * Add an amount of time to the zone time, as regularly as possible.
    * Adding e.g. 1 hour will increment the hour() field of the zone
    * date by one. In case of DST changes, the utcHour() field may
    * increase by 1 or increase by 2. Adding a day will leave the time portion
    * intact. However, adding an hour around a forward DST change adds two hours,
    * since there is a zone time (e.g. 2AM in Amsterdam) that does not exist.
    *
    * Note adding Months or Years will clamp the date to the end-of-month if
    * the start date was at the end of a month, i.e. contrary to JavaScript
    * Date#setUTCMonth() it will not overflow into the next month
    */
    DateTime.prototype.addLocal = function (amount, unit) {
        var zoneDate = new Date(this._zoneDate.valueOf());
        zoneDate = this._addToDate(zoneDate, amount, unit);
        var result = new DateTime(zoneDate, 1 /* GetUTC */, this.zone());

        // TODO remove this once bug in V8 engine solved
        if (amount !== 0 && result.equals(this)) {
            // workaround for bug in javascript, at least prevent endless loops due to
            // date not changing
            result = this.addLocal(amount * 2, unit);
        }
        return result;
    };

    DateTime.prototype._addToDate = function (date, amount, unit) {
        var targetYear;
        var targetMonth;
        var targetDate;
        var targetHours;
        var targetMinutes;
        var targetSeconds;
        var targetMilliseconds;

        switch (unit) {
            case 0 /* Second */:
                 {
                    date.setUTCSeconds(date.getUTCSeconds() + amount);
                }
                break;
            case 1 /* Minute */:
                 {
                    date.setUTCMinutes(date.getUTCMinutes() + amount);
                }
                break;
            case 2 /* Hour */:
                 {
                    date.setUTCHours(date.getUTCHours() + amount);
                }
                break;
            case 3 /* Day */:
                 {
                    date.setUTCDate(date.getUTCDate() + amount);
                }
                break;
            case 4 /* Week */:
                 {
                    date.setUTCDate(date.getUTCDate() + amount * 7);
                }
                break;
            case 5 /* Month */:
                 {
                    targetYear = amount >= 0 ? (date.getUTCFullYear() + Math.floor((date.getUTCMonth() + amount) / 12)) : (date.getUTCFullYear() + Math.ceil((date.getUTCMonth() + amount) / 12));
                    targetMonth = amount >= 0 ? Math.floor((date.getUTCMonth() + amount) % 12) : Math.ceil((date.getUTCMonth() + amount) % 12);
                    targetDate = Math.min(date.getUTCDate(), basics.daysInMonth(targetYear, targetMonth + 1));
                    targetHours = date.getUTCHours();
                    targetMinutes = date.getUTCMinutes();
                    targetSeconds = date.getUTCSeconds();
                    targetMilliseconds = date.getUTCMilliseconds();

                    // setUTCYears can lead to an overflow in days if the current date is
                    // at the end of a month
                    date = new Date(Date.UTC(targetYear, targetMonth, targetDate, targetHours, targetMinutes, targetSeconds, targetMilliseconds));
                }
                break;
            case 6 /* Year */:
                 {
                    targetYear = date.getUTCFullYear() + amount;
                    targetMonth = date.getUTCMonth();
                    targetDate = Math.min(date.getUTCDate(), basics.daysInMonth(targetYear, targetMonth + 1)); // +1 because we don't count from 0
                    targetHours = date.getUTCHours();
                    targetMinutes = date.getUTCMinutes();
                    targetSeconds = date.getUTCSeconds();
                    targetMilliseconds = date.getUTCMilliseconds();

                    // setUTCYears can lead to an overflow in days if the current date is
                    // at the end of a month
                    date = new Date(Date.UTC(targetYear, targetMonth, targetDate, targetHours, targetMinutes, targetSeconds, targetMilliseconds));
                }
                break;

            default:
                /* istanbul ignore next */
                assert(false, "Unknown period unit.");

                break;
        }
        return date;
    };

    DateTime.prototype.sub = function (a1, unit) {
        if (typeof (a1) === "object" && a1 instanceof Duration) {
            var duration = (a1);
            var newTimestamp = this._utcDate.valueOf() - duration.milliseconds();
            if (this._zone) {
                newTimestamp += this._zone.offsetForUtcDate(new Date(newTimestamp), 1 /* GetUTC */) * 60000;
            }
            return new DateTime(newTimestamp, this.zone());
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
        return new Duration(this._utcDate.valueOf() - other._utcDate.valueOf());
    };

    /**
    * @return True iff (this < other)
    */
    DateTime.prototype.lessThan = function (other) {
        return this._utcDate.valueOf() < other._utcDate.valueOf();
    };

    /**
    * @return True iff (this <= other)
    */
    DateTime.prototype.lessEqual = function (other) {
        return this._utcDate.valueOf() <= other._utcDate.valueOf();
    };

    /**
    * @return True iff this and other represent the same time in UTC
    */
    DateTime.prototype.equals = function (other) {
        return this._utcDate.valueOf() === other._utcDate.valueOf();
    };

    /**
    * @return True iff this and other represent the same time and
    * have the same zone
    */
    DateTime.prototype.identical = function (other) {
        return (this._zoneDate.valueOf() === other._zoneDate.valueOf() && (this._zone === null) === (other._zone === null) && (this._zone === null || this._zone.equals(other._zone)));
    };

    /**
    * @return True iff this > other
    */
    DateTime.prototype.greaterThan = function (other) {
        return this._utcDate.valueOf() > other._utcDate.valueOf();
    };

    /**
    * @return True iff this >= other
    */
    DateTime.prototype.greaterEqual = function (other) {
        return this._utcDate.valueOf() >= other._utcDate.valueOf();
    };

    /**
    * Proper ISO 8601 format string with any IANA zone converted to ISO offset
    * E.g. "2014-01-01T23:15:33+01:00" for Europe/Amsterdam
    */
    DateTime.prototype.toIsoString = function () {
        var s = strings.isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
        if (this._zone) {
            return s + TimeZone.offsetToString(this.offset());
        } else {
            return s;
        }
    };

    /**
    * Modified ISO 8601 format string with IANA name if applicable.
    * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
    */
    DateTime.prototype.toString = function () {
        var s = strings.isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
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
    * Modified ISO 8601 format string in UTC without time zone info
    */
    DateTime.prototype.toUtcString = function () {
        return strings.isoString(this.utcYear(), this.utcMonth(), this.utcDay(), this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond());
    };

    /**
    * Calculate this._zoneDate from this._utcDate
    */
    DateTime.prototype._utcDateToZoneDate = function () {
        if (this._zone) {
            var offset = this._zone.offsetForUtcDate(this._utcDate, 1 /* GetUTC */);
            this._zoneDate = new Date(this._utcDate.valueOf() + offset * 60000);
        } else {
            this._zoneDate = new Date(this._utcDate.valueOf());
        }
    };

    /**
    * Calculate this._utcDate from this._zoneDate
    */
    DateTime.prototype._zoneDateToUtcDate = function () {
        if (this._zone) {
            var offset = this._zone.offsetForZoneDate(this._zoneDate, 1 /* GetUTC */);
            this._utcDate = new Date(this._zoneDate.valueOf() - offset * 60000);
        } else {
            this._utcDate = new Date(this._zoneDate.valueOf());
        }
    };

    /**
    * Split a combined ISO datetime and timezone into datetime and timezone
    */
    DateTime._splitDateFromTimeZone = function (s) {
        var result = ["", ""];
        var index = s.lastIndexOf(" ");
        if (index > -1) {
            result[0] = s.substr(0, index);
            result[1] = s.substr(index + 1);
            return result;
        }
        index = s.lastIndexOf("Z");
        if (index > -1) {
            result[0] = s.substr(0, index);
            result[1] = s.substr(index, 1);
            return result;
        }
        index = s.lastIndexOf("+");
        if (index > -1) {
            result[0] = s.substr(0, index);
            result[1] = s.substr(index);
            return result;
        }
        index = s.lastIndexOf("-");
        if (index < 8) {
            index = -1; // any "-" we found was a date separator
        }
        if (index > -1) {
            result[0] = s.substr(0, index);
            result[1] = s.substr(index);
            return result;
        }
        result[0] = s;
        return result;
    };
    DateTime.timeSource = new RealTimeSource();
    return DateTime;
})();
exports.DateTime = DateTime;
//# sourceMappingURL=datetime.js.map
