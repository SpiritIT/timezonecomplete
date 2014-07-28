
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["timezone-js"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('timezone-js'));
  } else {
    root.timezonecomplete = factory(root.timezoneJS);
  }
}(this, function(timezoneJS) {
var require = function(name) {
	return {"timezone-js":timezoneJS}[name];
};

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (__dirname){
/**
* Copyright(c) 2014 Spirit IT BV
*
* Date and Time utility functions
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var path = require("path");
var timezoneJS = require("timezone-js");

// timezone-js initialization
timezoneJS.timezone.zoneFileBasePath = path.join(__dirname, "tz");

// need to preload all names in order to validate them
timezoneJS.timezone.loadingScheme = timezoneJS.timezone.loadingSchemes.PRELOAD_ALL;
timezoneJS.timezone.init({ async: false });

/**
* Pad a string by adding characters to the beginning.
* @param s	the string to pad
* @param width	the desired minimum string width
* @param char	the single character to pad with
* @return	the padded string
*/
function padLeft(s, width, char) {
    assert(width > 0, "expect width > 0");
    assert(char.length === 1, "expect single character in char");
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return padding + s;
}

/**
* Pad a string by adding characters to the end.
* @param s	the string to pad
* @param width	the desired minimum string width
* @param char	the single character to pad with
* @return	the padded string
*/
function padRight(s, width, char) {
    assert(width > 0, "expect width > 0");
    assert(char.length === 1, "expect single character in char");
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return s + padding;
}

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
    } else if (year % 100 !== 0) {
        return true;
    } else if (year % 400 !== 0) {
        return false;
    } else {
        return true;
    }
}
exports.isLeapYear = isLeapYear;

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
            return (exports.isLeapYear(year) ? 29 : 28);
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
        default:
            assert(false, "Invalid month: " + month);

            /* istanbul ignore next */
            return 0;
    }
}
exports.daysInMonth = daysInMonth;

/**
* Returns an ISO time string. Note that months are 1-12.
*/
function isoString(year, month, day, hour, minute, second, millisecond) {
    return padLeft(year.toString(10), 4, "0") + "-" + padLeft(month.toString(10), 2, "0") + "-" + padLeft(day.toString(10), 2, "0") + "T" + padLeft(hour.toString(10), 2, "0") + ":" + padLeft(minute.toString(10), 2, "0") + ":" + padLeft(second.toString(10), 2, "0") + "." + padLeft(millisecond.toString(10), 3, "0");
}
exports.isoString = isoString;

/**
* Time units
*/
(function (TimeUnit) {
    TimeUnit[TimeUnit["Second"] = 0] = "Second";
    TimeUnit[TimeUnit["Minute"] = 1] = "Minute";
    TimeUnit[TimeUnit["Hour"] = 2] = "Hour";
    TimeUnit[TimeUnit["Day"] = 3] = "Day";
    TimeUnit[TimeUnit["Week"] = 4] = "Week";
    TimeUnit[TimeUnit["Month"] = 5] = "Month";
    TimeUnit[TimeUnit["Year"] = 6] = "Year";
})(exports.TimeUnit || (exports.TimeUnit = {}));
var TimeUnit = exports.TimeUnit;

/**
* Time duration. Create one e.g. like this: var d = Duration.hours(1).
* Note that time durations do not take leap seconds etc. into account:
* one hour is simply represented as 3600000 milliseconds.
*/
var Duration = (function () {
    /**
    * Constructor implementation
    */
    function Duration(i1) {
        if (typeof (i1) === "number") {
            this._milliseconds = Math.round(Math.abs(i1));
            this._sign = (i1 < 0 ? -1 : 1);
        } else {
            if (typeof (i1) === "string") {
                this._fromString(i1);
            } else {
                this._milliseconds = 0;
                this._sign = 1;
            }
        }
    }
    /**
    * Construct a time duration
    * @param n	Number of hours
    * @return A duration of n hours
    */
    Duration.hours = function (n) {
        return new Duration(n * 3600000);
    };

    /**
    * Construct a time duration
    * @param n	Number of minutes
    * @return A duration of n minutes
    */
    Duration.minutes = function (n) {
        return new Duration(n * 60000);
    };

    /**
    * Construct a time duration
    * @param n	Number of seconds
    * @return A duration of n seconds
    */
    Duration.seconds = function (n) {
        return new Duration(n * 1000);
    };

    /**
    * Construct a time duration
    * @param n	Number of milliseconds
    * @return A duration of n milliseconds
    */
    Duration.milliseconds = function (n) {
        return new Duration(n);
    };

    /**
    * @return another instance of Duration with the same value.
    */
    Duration.prototype.clone = function () {
        return Duration.milliseconds(this.milliseconds());
    };

    /**
    * The entire duration in milliseconds (negative or positive)
    */
    Duration.prototype.milliseconds = function () {
        return this._sign * this._milliseconds;
    };

    /**
    * The millisecond part of the duration (always positive)
    * @return e.g. 400 for a -01:02:03.400 duration
    */
    Duration.prototype.millisecond = function () {
        return this._milliseconds % 1000;
    };

    /**
    * The entire duration in seconds (negative or positive, fractional)
    * @return e.g. 1.5 for a 1500 milliseconds duration
    */
    Duration.prototype.seconds = function () {
        return this._sign * this._milliseconds / 1000;
    };

    /**
    * The second part of the duration (always positive)
    * @return e.g. 3 for a -01:02:03.400 duration
    */
    Duration.prototype.second = function () {
        return Math.floor(this._milliseconds / 1000) % 60;
    };

    /**
    * The entire duration in minutes (negative or positive, fractional)
    * @return e.g. 1.5 for a 90000 milliseconds duration
    */
    Duration.prototype.minutes = function () {
        return this._sign * this._milliseconds / 60000;
    };

    /**
    * The minute part of the duration (always positive)
    * @return e.g. 2 for a -01:02:03.400 duration
    */
    Duration.prototype.minute = function () {
        return Math.floor(this._milliseconds / 60000) % 60;
    };

    /**
    * The entire duration in hours (negative or positive, fractional)
    * @return e.g. 1.5 for a 5400000 milliseconds duration
    */
    Duration.prototype.hours = function () {
        return this._sign * this._milliseconds / 3600000;
    };

    /**
    * The hour part of the duration (always positive).
    * Note that this part can exceed 23 hours, because for
    * now, we do not have a days() function
    * @return e.g. 25 for a -25:02:03.400 duration
    */
    Duration.prototype.wholeHours = function () {
        return Math.floor(this._milliseconds / 3600000);
    };

    // note there is no hour() method as that would only make sense if we
    // also had a days() method.
    /**
    * Sign
    * @return "-" if the duration is negative
    */
    Duration.prototype.sign = function () {
        return (this._sign < 0 ? "-" : "");
    };

    /**
    * @return True iff (this < other)
    */
    Duration.prototype.lessThan = function (other) {
        return this.milliseconds() < other.milliseconds();
    };

    /**
    * @return True iff this and other represent the same time duration
    */
    Duration.prototype.equals = function (other) {
        return this.milliseconds() === other.milliseconds();
    };

    /**
    * @return True iff this > other
    */
    Duration.prototype.greaterThan = function (other) {
        return this.milliseconds() > other.milliseconds();
    };

    /**
    * @return The minimum (most negative) of this and other
    */
    Duration.prototype.min = function (other) {
        if (this.lessThan(other)) {
            return this.clone();
        }
        return other.clone();
    };

    /**
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
    * @return a new Duration of (this * value)
    */
    Duration.prototype.multiply = function (value) {
        return new Duration(this.milliseconds() * value);
    };

    /**
    * Divide by a fixed number.
    * @return a new Duration of (this / value)
    */
    Duration.prototype.divide = function (value) {
        if (value === 0) {
            throw new Error("Duration.divide(): Divide by zero");
        }
        return new Duration(this.milliseconds() / value);
    };

    /**
    * Add a duration.
    * @return a new Duration of (this + value)
    */
    Duration.prototype.add = function (value) {
        return new Duration(this.milliseconds() + value.milliseconds());
    };

    /**
    * Subtract a duration.
    * @return a new Duration of (this - value)
    */
    Duration.prototype.sub = function (value) {
        return new Duration(this.milliseconds() - value.milliseconds());
    };

    /**
    * String in [-]hh:mm:ss.nnn notation. All fields are
    * always present except the sign.
    */
    Duration.prototype.toFullString = function () {
        return this._toString(true);
    };

    /**
    * String in [-]hh[:mm[:ss[.nnn]]] notation. Fields are
    * added as necessary
    */
    Duration.prototype.toString = function () {
        return this._toString(false);
    };

    /**
    * Used by util.inspect()
    */
    Duration.prototype.inspect = function () {
        return "[Duration: " + this.toString() + "]";
    };

    Duration.prototype._toString = function (full) {
        var result = "";
        if (full || this.millisecond() > 0) {
            result = "." + padLeft(this.millisecond().toString(10), 3, "0");
        }
        if (full || result.length > 0 || this.second() > 0) {
            result = ":" + padLeft(this.second().toString(10), 2, "0") + result;
        }
        if (full || result.length > 0 || this.minute() > 0) {
            result = ":" + padLeft(this.minute().toString(10), 2, "0") + result;
        }
        return this.sign() + padLeft(this.wholeHours().toString(10), 2, "0") + result;
    };

    Duration.prototype._fromString = function (s) {
        assert(s.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/), "Not a proper time duration string: \"" + s + "\"");
        var sign = 1;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        var milliseconds = 0;
        var parts = s.split(":");
        assert(parts.length > 0 && parts.length < 4, "Not a proper time duration string: \"" + s + "\"");
        if (s.charAt(0) === "-") {
            sign = -1;
            parts[0] = parts[0].substr(1);
        }
        if (parts.length > 0) {
            hours = +parts[0];
        }
        if (parts.length > 1) {
            minutes = +parts[1];
        }
        if (parts.length > 2) {
            var secondParts = parts[2].split(".");
            seconds = +secondParts[0];
            if (secondParts.length > 1) {
                milliseconds = +padRight(secondParts[1], 3, "0");
            }
        }
        this._milliseconds = Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
        this._sign = sign;
    };
    return Duration;
})();
exports.Duration = Duration;
;

/**
* The type of time zone
*/
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
})(exports.TimeZoneKind || (exports.TimeZoneKind = {}));
var TimeZoneKind = exports.TimeZoneKind;

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
var TimeZone = (function () {
    /**
    * Do not use this constructor, use the static
    * TimeZone.zone() method instead.
    * @param name NORMALIZED name, assumed to be correct
    */
    function TimeZone(name) {
        this._name = name;
        if (name === "localtime") {
            this._kind = 0 /* Local */;
            this._date = new Date();
        } else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
            this._kind = 1 /* Offset */;
            this._offset = TimeZone.stringToOffset(name);
        } else {
            this._kind = 2 /* Proper */;
            this._tjs = new timezoneJS.Date(this._name);
        }
    }
    /**
    * The local time zone for a given date. Note that
    * the time zone varies with the date: amsterdam time for
    * 2014-01-01 is +01:00 and amsterdam time for 2014-07-01 is +02:00
    */
    TimeZone.local = function () {
        return TimeZone._findOrCreate("localtime");
    };

    /**
    * The UTC time zone.
    */
    TimeZone.utc = function () {
        return TimeZone._findOrCreate("UTC");
    };

    /**
    * Zone implementations
    */
    TimeZone.zone = function (a) {
        var name = "";
        switch (typeof (a)) {
            case "string":
                 {
                    if (a.trim().length === 0) {
                        return null;
                    } else {
                        name = TimeZone._normalizeString(a);
                    }
                }
                break;
            case "number":
                 {
                    var offset = a;
                    assert(offset > -24 * 60 && offset < 24 * 60, "TimeZone.zone(): offset out of range");
                    name = TimeZone.offsetToString(offset);
                }
                break;

            default:
                /* istanbul ignore next */
                assert(false, "TimeZone.zone(): Unexpected argument type \"" + typeof (a) + "\"");

                break;
        }
        return TimeZone._findOrCreate(name);
    };

    /**
    * The time zone identifier. Can be an offset "-01:30" or an
    * IANA time zone name "Europe/Amsterdam", or "localtime" for
    * the local time zone.
    */
    TimeZone.prototype.name = function () {
        return this._name;
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
            case 0 /* Local */:
                return (other.kind() === 0 /* Local */);
            case 1 /* Offset */:
                return (other.kind() === 1 /* Offset */ && this._offset === other._offset);
            case 2 /* Proper */:
                return (other.kind() === 2 /* Proper */ && this._name === other._name);

            default:
                /* istanbul ignore next */
                assert(false, "Unknown time zone kind.");

                /* istanbul ignore next */
                return false;
        }
    };

    /**
    * Is this zone equivalent to UTC?
    */
    TimeZone.prototype.isUtc = function () {
        switch (this._kind) {
            case 0 /* Local */:
                return false;
            case 1 /* Offset */:
                return (this._offset === 0);
            case 2 /* Proper */:
                return (this._name === "Etc/GMT" || this._name === "Etc/GMT+0" || this._name === "Etc/UCT" || this._name === "Etc/Universal" || this._name === "Etc/UTC" || this._name === "Etc/Zulu" || this._name === "GMT" || this._name === "GMT+0" || this._name === "GMT0" || this._name === "GMT-0" || this._name === "Greenwich" || this._name === "Universal" || this._name === "UTC" || this._name === "Zulu");

            default:
                /* istanbul ignore next */
                return false;
        }
    };

    /**
    * Calculate timezone offset from a UTC time.
    * @param year local full year
    * @param month local month 1-12 (note this deviates from JavaScript date)
    * @param day local day of month 1-31
    * @param hour local hour 0-23
    * @param minute local minute 0-59
    * @param second local second 0-59
    * @param millisecond local millisecond 0-999
    * @return the offset of this time zone with respect to UTC at the given time.
    */
    TimeZone.prototype.offsetForUtc = function (year, month, day, hour, minute, second, millisecond) {
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof millisecond === "undefined") { millisecond = 0; }
        assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
        assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
        assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
        assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
        assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  hour out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                this._date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
                return -1 * this._date.getTimezoneOffset();
            }
            case 1 /* Offset */: {
                return this._offset;
            }
            case 2 /* Proper */: {
                if (this.isUtc()) {
                    // due to a bug in TimezoneJS a UTC time entered into the
                    // setUTCx methods of a UTC timezoneJS.Date will result in a
                    // non-zero offset.
                    return 0;
                } else {
                    this._tjs.setUTCFullYear(year);
                    this._tjs.setUTCMonth(month - 1);
                    this._tjs.setUTCDate(day);
                    this._tjs.setUTCHours(hour);
                    this._tjs.setUTCMinutes(minute);
                    this._tjs.setUTCSeconds(second);
                    this._tjs.setUTCMilliseconds(millisecond);
                    return this._diff(this._tjs.getFullYear(), this._tjs.getMonth() + 1, this._tjs.getDate(), this._tjs.getHours(), this._tjs.getMinutes(), this._tjs.getSeconds(), this._tjs.getMilliseconds(), year, month, day, hour, minute, second, millisecond);
                }
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");

                break;
        }
    };

    /**
    * Calculate timezone offset from a zone-local time (NOT a UTC time).
    * @param year local full year
    * @param month local month 1-12 (note this deviates from JavaScript date)
    * @param day local day of month 1-31
    * @param hour local hour 0-23
    * @param minute local minute 0-59
    * @param second local second 0-59
    * @param millisecond local millisecond 0-999
    * @return the offset of this time zone with respect to UTC at the given time.
    */
    TimeZone.prototype.offsetForZone = function (year, month, day, hour, minute, second, millisecond) {
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof millisecond === "undefined") { millisecond = 0; }
        assert(month > 0 && month < 13, "TimeZone.offsetForZone():  month out of range: " + month);
        assert(day > 0 && day < 32, "TimeZone.offsetForZone():  day out of range.");
        assert(hour >= 0 && hour < 24, "TimeZone.offsetForZone():  hour out of range.");
        assert(minute >= 0 && minute < 60, "TimeZone.offsetForZone():  minute out of range.");
        assert(second >= 0 && second < 60, "TimeZone.offsetForZone():  hour out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForZone():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                this._date = new Date(year, month - 1, day, hour, minute, second, millisecond);
                return -1 * this._date.getTimezoneOffset();
            }
            case 1 /* Offset */: {
                return this._offset;
            }
            case 2 /* Proper */: {
                this._tjs.setFullYear(year);
                this._tjs.setMonth(month - 1);
                this._tjs.setDate(day);
                this._tjs.setHours(hour);
                this._tjs.setMinutes(minute);
                this._tjs.setSeconds(second);
                this._tjs.setMilliseconds(millisecond);
                return -1 * this._tjs.getTimezoneOffset();
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");

                break;
        }
    };

    /**
    * Convenience function, takes values from a Javascript Date
    * Calls offsetForUtc() with the contents of the date
    * @param date: the date
    * @param funcs: the set of functions to use: get() or getUTC()
    */
    TimeZone.prototype.offsetForUtcDate = function (date, funcs) {
        switch (funcs) {
            case 0 /* Get */: {
                return this.offsetForUtc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            case 1 /* GetUTC */: {
                return this.offsetForUtc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown DateFunctions value");

                break;
        }
    };

    /**
    * Convenience function, takes values from a Javascript Date
    * Calls offsetForUtc() with the contents of the date
    * @param date: the date
    * @param funcs: the set of functions to use: get() or getUTC()
    */
    TimeZone.prototype.offsetForZoneDate = function (date, funcs) {
        switch (funcs) {
            case 0 /* Get */: {
                return this.offsetForZone(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            case 1 /* GetUTC */: {
                return this.offsetForZone(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown DateFunctions value");

                break;
        }
    };

    /**
    * The time zone identifier (normalized).
    * Either "localtime", IANA name, or "+hh:mm" offset.
    */
    TimeZone.prototype.toString = function () {
        return this._name;
    };

    /**
    * Used by util.inspect()
    */
    TimeZone.prototype.inspect = function () {
        return "[TimeZone: " + this.toString() + "]";
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
        return sign + padLeft(hours.toString(10), 2, "0") + ":" + padLeft(minutes.toString(10), 2, "0");
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
        assert(t.match(/^[+-]\d\d(:?)\d\d$/) || t.match(/^[+-]\d\d$/), "Wrong time zone format: \"" + t + "\"");
        var sign = (t.charAt(0) === "+" ? 1 : -1);
        var hours = parseInt(t.substr(1, 2), 10);
        var minutes = 0;
        if (t.length === 5) {
            minutes = parseInt(t.substr(3, 2), 10);
        } else if (t.length === 6) {
            minutes = parseInt(t.substr(4, 2), 10);
        }
        assert(hours >= 0 && hours < 24, "Offsets from UTC must be less than a day.");
        return sign * (hours * 60 + minutes);
    };

    /**
    * Find in cache or create zone
    * @param name	Time zone name
    */
    TimeZone._findOrCreate = function (name) {
        if (name in TimeZone._cache) {
            return TimeZone._cache[name];
        } else {
            var t = new TimeZone(name);
            TimeZone._cache[name] = t;
            return t;
        }
    };

    /**
    * Normalize a string so it can be used as a key for a
    * cache lookup
    */
    TimeZone._normalizeString = function (s) {
        var t = s.trim();
        assert(t.length > 0, "Empty time zone string given");
        if (t === "localtime") {
            return t;
        } else if (t === "Z") {
            return "+00:00";
        } else if (t.charAt(0) === "+" || t.charAt(0) === "-" || t === "Z") {
            // offset string
            // normalize by converting back and forth
            return TimeZone.offsetToString(TimeZone.stringToOffset(t));
        } else {
            // Olsen TZ database name
            return t;
        }
    };

    /**
    * Assuming that the difference in the dates is less than a day, returns
    * date1 - date2 in fractional minutes.
    */
    TimeZone.prototype._diff = function (year1, month1, day1, hour1, minute1, second1, millisecond1, year2, month2, day2, hour2, minute2, second2, millisecond2) {
        var smaller1 = (year1 < year2) || (year1 === year2 && month1 < month2) || (year1 === year2 && month1 === month2 && day1 < day2) || (year1 === year2 && month1 === month2 && day1 === day2 && hour1 < hour2) || (year1 === year2 && month1 === month2 && day1 === day2 && hour1 === hour2 && minute1 < minute2) || (year1 === year2 && month1 === month2 && day1 === day2 && hour1 === hour2 && minute1 === minute2 && second1 < second2) || (year1 === year2 && month1 === month2 && day1 === day2 && hour1 === hour2 && minute1 === minute2 && second1 === second2 && millisecond1 < millisecond2);

        var seconds1 = hour1 * 3600 + minute1 * 60 + second1 + 0.001 * millisecond1;
        var seconds2 = hour2 * 3600 + minute2 * 60 + second2 + 0.001 * millisecond2;
        var secondDiff = seconds1 - seconds2;
        if (smaller1 && secondDiff > 0) {
            secondDiff -= 24 * 3600;
        } else if (!smaller1 && secondDiff < 0) {
            secondDiff += 24 * 3600;
        }

        return secondDiff / 60;
    };
    TimeZone._cache = {};
    return TimeZone;
})();
exports.TimeZone = TimeZone;


/**
* Default time source, returns actual time
*/
var RealTimeSource = (function () {
    function RealTimeSource() {
    }
    RealTimeSource.prototype.now = function () {
        /* istanbul ignore next */
        return new Date();
    };
    return RealTimeSource;
})();
exports.RealTimeSource = RealTimeSource;

/**
* Indicates how a Date object should be interpreted.
* Either we can take getYear(), getMonth() etc for our field
* values, or we can take getUTCYear() etc to do that.
*/
(function (DateFunctions) {
    /**
    * Use the Date.getFullYear(), Date.getMonth(), ... functions.
    */
    DateFunctions[DateFunctions["Get"] = 0] = "Get";

    /**
    * Use the Date.getUTCFullYear(), Date.getUTCMonth(), ... functions.
    */
    DateFunctions[DateFunctions["GetUTC"] = 1] = "GetUTC";
})(exports.DateFunctions || (exports.DateFunctions = {}));
var DateFunctions = exports.DateFunctions;

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
* Our very own DateTime class which is time zone-aware
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

                        // Bug in JavaScript: date.getTimezoneOffset() returns wrong value for non-existing local time
                        // during DST. Therefore do it ourselves.
                        // pretend that the date was in UTC (strings without zone are interpreted by Date as UTC)
                        tempDate = new Date(exports.isoString(year, month, day, hour, minute, second, millisecond) + "Z");
                        offset = (this._zone ? this._zone.offsetForZone(year, month, day, hour, minute, second, millisecond) : 0);
                        this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
                        this._utcDateToZoneDate();
                    }
                }
                break;
            case "string":
                 {
                    var strings = DateTime._splitDateFromTimeZone(a1);
                    assert(strings.length === 2, "Invalid date string given: \"" + a1 + "\"");
                    if (a2 instanceof TimeZone) {
                        this._zone = (a2);
                    } else {
                        this._zone = TimeZone.zone(strings[1]);
                    }
                    this._zoneDate = new Date(strings[0] + "Z");
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
                        tempDate = new Date(exports.isoString(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) + "Z");
                        offset = (this._zone ? this._zone.offsetForZoneDate(tempDate, 1 /* GetUTC */) : 0);
                        this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
                        this._utcDateToZoneDate();
                    } else {
                        tempDate = new Date(exports.isoString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()) + "Z");
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
        return this._zoneDate.getDay();
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
                    targetDate = Math.min(date.getUTCDate(), exports.daysInMonth(targetYear, targetMonth + 1));
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
                    targetDate = Math.min(date.getUTCDate(), exports.daysInMonth(targetYear, targetMonth + 1)); // +1 because we don't count from 0
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
        var s = exports.isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
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
        var s = exports.isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
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
        return exports.isoString(this.utcYear(), this.utcMonth(), this.utcDay(), this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond());
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

/**
* Specifies how the period should repeat across the day
* during DST changes.
*/
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
    * a period of one day, starting at 8:05AM Europe/Amsterdam time
    * will always start at 8:05 Europe/Amsterdam. This means that
    * in UTC time, some intervals will be 25 hours and some
    * 23 hours during DST changes.
    * Another example: an hourly interval will be hourly in local time,
    * skipping an hour in UTC for a DST backward change.
    */
    PeriodDst[PeriodDst["RegularLocalTime"] = 1] = "RegularLocalTime";
})(exports.PeriodDst || (exports.PeriodDst = {}));
var PeriodDst = exports.PeriodDst;

/**
* Convert a PeriodDst to a string: "regular intervals" or "regular local time"
*/
function periodDstToString(p) {
    switch (p) {
        case 0 /* RegularIntervals */:
            return "regular intervals";
        case 1 /* RegularLocalTime */:
            return "regular local time";

        default:
            /* istanbul ignore next */
            assert(false, "Unknown PeriodDst");

            /* istanbul ignore next */
            return "";
    }
}
exports.periodDstToString = periodDstToString;

/**
* Repeating time period: consists of a starting point and
* a time length. This class accounts for leap seconds and leap days.
*/
var Period = (function () {
    /**
    * Constructor
    * LIMITATION: if dst equals RegularLocalTime, and unit is Second, Minute or Hour,
    * then the amount must be a factor of 24. So 120 seconds is allowed while 121 seconds is not.
    * This is due to the enormous processing power required by these cases. They are not
    * implemented and you will get an assert.
    *
    * @param start The start of the period. If the period is in Months or Years, and
    *				the day is 29 or 30 or 31, the results are maximised to end-of-month.
    * @param amount	The amount of units.
    * @param unit	The unit.
    * @param dst	Specifies how to handle Daylight Saving Time. Not relevant
    *				if the time zone of the start datetime does not have DST.
    */
    function Period(start, amount, unit, dst) {
        assert(start !== null, "Start time may not be null");
        assert(amount > 0, "Amount must be positive non-zero.");
        assert(Math.floor(amount) === amount, "Amount must be a whole number");

        this._start = start;
        this._amount = amount;
        this._unit = unit;
        this._dst = dst;
        this._calcInternalValues();

        // regular local time keeping is only supported if we can reset each day
        // Note we use internal amounts to decide this because actually it is supported if
        // the input is a multiple of one day.
        if (this._dstRelevant() && dst === 1 /* RegularLocalTime */) {
            switch (this._intUnit) {
                case 0 /* Second */:
                    assert(this._intAmount < 86400, "When using Hour, Minute or Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 1 /* Minute */:
                    assert(this._intAmount < 1440, "When using Hour, Minute or Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 2 /* Hour */:
                    assert(this._intAmount < 24, "When using Hour, Minute or Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
            }
        }
    }
    /**
    * The start date
    */
    Period.prototype.start = function () {
        return this._start;
    };

    /**
    * The amount of units
    */
    Period.prototype.amount = function () {
        return this._amount;
    };

    /**
    * The unit
    */
    Period.prototype.unit = function () {
        return this._unit;
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
    * Pre: the fromdate and startdate must either both have timezones or not
    * @param fromDate: the date after which to return the next date
    * @return the first date matching the period after fromDate, given
    *			in the same zone as the fromDate.
    */
    Period.prototype.findFirst = function (fromDate) {
        assert((this._intStart.zone() === null) === (fromDate.zone() === null), "The fromDate and startDate must both be aware or unaware");
        var approx;
        var temp;
        var periods;
        var diff;
        var newYear;
        var newMonth;
        var remainder;

        var normalFrom = this._normalizeDay(fromDate.toZone(this._intStart.zone()));

        // Simple case: period has not started yet.
        if (normalFrom.lessThan(this._intStart)) {
            // use toZone because we don't want to return a reference to our internal member
            return this._correctDay(this._intStart).toZone(fromDate.zone());
        }

        if (this._intAmount === 1) {
            // simple cases: amount equals 1 (eliminates need for searching for starting point)
            if (this._intDst === 0 /* RegularIntervals */) {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 1 /* Minute */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 2 /* Hour */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 3 /* Day */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 5 /* Month */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), this._intStart.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 6 /* Year */:
                        approx = new DateTime(normalFrom.utcYear(), this._intStart.utcMonth(), this._intStart.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;

                    default:
                        /* istanbul ignore next */
                        assert(false, "Unknown TimeUnit");

                        break;
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intAmount, this._intUnit);
                }
            } else {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 1 /* Minute */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 2 /* Hour */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 3 /* Day */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 5 /* Month */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 6 /* Year */:
                        approx = new DateTime(normalFrom.year(), this._intStart.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;

                    default:
                        /* istanbul ignore next */
                        assert(false, "Unknown TimeUnit");

                        break;
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intAmount, this._intUnit);
                }
            }
        } else {
            // Amount is not 1,
            if (this._intDst === 0 /* RegularIntervals */) {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        diff = normalFrom.diff(this._intStart).seconds();
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 1 /* Minute */:
                        // only 25 leap seconds have ever been added so this should still be OK.
                        diff = normalFrom.diff(this._intStart).minutes();
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 2 /* Hour */:
                        diff = normalFrom.diff(this._intStart).hours();
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 3 /* Day */:
                        diff = normalFrom.diff(this._intStart).hours() / 24;
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 5 /* Month */:
                        diff = (normalFrom.utcYear() - this._intStart.utcYear()) * 12 + (normalFrom.utcMonth() - this._intStart.utcMonth()) - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount);
                        approx = this._intStart.add(periods * this._intAmount, this._intUnit);
                        break;
                    case 6 /* Year */:
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intStart.year() - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
                        approx = this._intStart.add(periods * this._intAmount, 6 /* Year */);
                        break;

                    default:
                        /* istanbul ignore next */
                        assert(false, "Unknown TimeUnit");

                        break;
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intAmount, this._intUnit);
                }
            } else {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
                            // optimization: same second each minute, so just take the fromDate minus one minute with the this._intStart seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 1 /* Minute */);
                        } else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate start-of-day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 3600) % this._intAmount);
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 0 /* Second */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 3 /* Day */);
                                }
                            } else {
                                if (approx.addLocal(1, 3 /* Day */).subLocal(remainder, 0 /* Second */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 3 /* Day */);
                                }
                            }

                            // optimization: binary search
                            var imax = Math.floor((24 * 3600) / this._intAmount);
                            var imin = 0;
                            while (imax >= imin) {
                                // calculate the midpoint for roughly equal partition
                                var imid = Math.floor((imin + imax) / 2);
                                var approx2 = approx.addLocal(imid * this._intAmount, 0 /* Second */);
                                var approxMin = approx2.subLocal(this._intAmount, 0 /* Second */);
                                if (approx2.greaterThan(normalFrom) && approxMin.lessEqual(normalFrom)) {
                                    approx = approx2;
                                    break;
                                } else if (approx2.lessEqual(normalFrom)) {
                                    // change min index to search upper subarray
                                    imin = imid + 1;
                                } else {
                                    // change max index to search lower subarray
                                    imax = imid - 1;
                                }
                            }
                        }
                        break;
                    case 1 /* Minute */:
                        if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
                            // optimization: same hour this._intStartary each time, so just take the fromDate minus one hour
                            // with the this._intStart minutes, seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 2 /* Hour */);
                        } else {
                            // per constructor assert, the seconds fit in a day, so just go the fromDate previous day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 60) % this._intAmount);
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 1 /* Minute */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 3 /* Day */);
                                }
                            } else {
                                if (approx.addLocal(1, 3 /* Day */).subLocal(remainder, 1 /* Minute */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 3 /* Day */);
                                }
                            }
                        }
                        break;
                    case 2 /* Hour */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

                        // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                        remainder = Math.floor(24 % this._intAmount);
                        if (approx.greaterThan(normalFrom)) {
                            if (approx.subLocal(remainder, 2 /* Hour */).greaterThan(normalFrom)) {
                                // normalFrom lies outside the boundary period before the start date
                                approx = approx.subLocal(1, 3 /* Day */);
                            }
                        } else {
                            if (approx.addLocal(1, 3 /* Day */).subLocal(remainder, 2 /* Hour */).lessEqual(normalFrom)) {
                                // normalFrom lies in the boundary period, move to the next day
                                approx = approx.addLocal(1, 3 /* Day */);
                            }
                        }
                        break;
                    case 3 /* Day */:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        diff = normalFrom.diff(this._intStart).hours() / 24;
                        periods = Math.floor(diff / this._intAmount);
                        approx = this._intStart.addLocal(periods * this._intAmount, this._intUnit);
                        break;
                    case 5 /* Month */:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = (normalFrom.year() - this._intStart.year()) * 12 + (normalFrom.month() - this._intStart.month()) - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
                        newYear = this._intStart.year() + Math.floor(periods * this._intAmount / 12);
                        newMonth = ((this._intStart.month() - 1 + Math.floor(periods * this._intAmount)) % 12) + 1;

                        // note that newYear-newMonth-this._intStart.day() is a valid date due to our start day normalization
                        approx = new DateTime(newYear, newMonth, this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 6 /* Year */:
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intStart.year() - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
                        newYear = this._intStart.year() + periods * this._intAmount;
                        approx = new DateTime(newYear, this._intStart.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;

                    default:
                        /* istanbul ignore next */
                        assert(false, "Unknown TimeUnit");

                        break;
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intAmount, this._intUnit);
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
    * @param prev	Boundary date. Must have a time zone (any time zone) iff the period start date has one.
    * @param count	Optional, must be >= 1 and whole.
    * @return (prev + count * period), in the same timezone as prev.
    */
    Period.prototype.findNext = function (prev, count) {
        if (typeof count === "undefined") { count = 1; }
        assert(prev !== null, "Prev must be non-null");
        assert((this._intStart.zone() === null) === (prev.zone() === null), "The fromDate and startDate must both be aware or unaware");
        assert(typeof (count) === "number", "Count must be a number");
        assert(count >= 1 && Math.floor(count) === count, "Count must be an integer >= 1");

        var normalizedPrev = this._normalizeDay(prev.toZone(this._start.zone()));
        if (this._intDst === 0 /* RegularIntervals */) {
            return this._correctDay(normalizedPrev.add(this._intAmount * count, this._intUnit)).convert(prev.zone());
        } else {
            return this._correctDay(normalizedPrev.addLocal(this._intAmount * count, this._intUnit)).convert(prev.zone());
        }
    };

    Period.prototype._periodIsoString = function () {
        switch (this._unit) {
            case 0 /* Second */: {
                return "P" + this._amount.toString(10) + "S";
            }
            case 1 /* Minute */: {
                return "PT" + this._amount.toString(10) + "M";
            }
            case 2 /* Hour */: {
                return "P" + this._amount.toString(10) + "H";
            }
            case 3 /* Day */: {
                return "P" + this._amount.toString(10) + "D";
            }
            case 4 /* Week */: {
                return "P" + this._amount.toString(10) + "W";
            }
            case 5 /* Month */: {
                return "P" + this._amount.toString(10) + "M";
            }
            case 6 /* Year */: {
                return "P" + this._amount.toString(10) + "Y";
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown period unit.");

                /* istanbul ignore next */
                return "";
        }
    };

    /**
    * Returns an ISO duration string e.g.
    * 2014-01-01T12:00:00.000+01:00/P1H
    * 2014-01-01T12:00:00.000+01:00/PT1M   (one minute)
    * 2014-01-01T12:00:00.000+01:00/P1M   (one month)
    */
    Period.prototype.toIsoString = function () {
        return this.start().toIsoString() + "/" + this._periodIsoString();
    };

    /**
    * A string representation e.g.
    * "10 years, starting at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
    */
    Period.prototype.toString = function () {
        var result = this._amount.toString(10) + " " + TimeUnit[this._unit].toLowerCase() + (this._amount > 1 ? "s" : "") + ", starting at " + this._start.toString();

        // only add the DST handling if it is relevant
        if (this._dstRelevant()) {
            result += ", keeping " + exports.periodDstToString(this._dst);
        }
        return result;
    };

    /**
    * Used by util.inspect()
    */
    Period.prototype.inspect = function () {
        return "[Period: " + this.toString() + "]";
    };

    /**
    * Corrects the difference between _start and _intStart.
    */
    Period.prototype._correctDay = function (d) {
        if (this._start !== this._intStart) {
            return new DateTime(d.year(), d.month(), Math.min(exports.daysInMonth(d.year(), d.month()), this._start.day()), d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        } else {
            return d;
        }
    };

    /**
    * If this._internalUnit in [Month, Year], normalizes the day-of-month
    * to <= 28.
    * @return a new date if different, otherwise the exact same object (no clone!)
    */
    Period.prototype._normalizeDay = function (d, anymonth) {
        if (typeof anymonth === "undefined") { anymonth = true; }
        if ((this._intUnit === 5 /* Month */ && d.day() > 28) || (this._intUnit === 6 /* Year */ && (d.month() === 2 || anymonth) && d.day() > 28)) {
            return new DateTime(d.year(), d.month(), 28, d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        } else {
            return d;
        }
    };

    /**
    * Returns true if DST handling is relevant for us.
    * (i.e. if the start time zone has DST)
    */
    Period.prototype._dstRelevant = function () {
        return (this._start.zone() != null && this._start.zone().kind() === 2 /* Proper */ && this._start.zone().isUtc() === false);
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
        this._intAmount = this._amount;
        this._intUnit = this._unit;

        if (this._intUnit === 0 /* Second */ && this._intAmount >= 60 && this._intAmount % 60 === 0 && this._dstRelevant() && this._dst === 1 /* RegularLocalTime */) {
            // cannot convert seconds to minutes if regular intervals are required due to
            // leap seconds, but for regular local time it does not matter
            this._intAmount = this._intAmount / 60;
            this._intUnit = 1 /* Minute */;
        }
        if (this._intUnit === 1 /* Minute */ && this._intAmount >= 60 && this._intAmount % 60 === 0) {
            this._intAmount = this._intAmount / 60;
            this._intUnit = 2 /* Hour */;
        }
        if (this._intUnit === 2 /* Hour */ && this._intAmount >= 24 && this._intAmount % 24 === 0) {
            this._intAmount = this._intAmount / 24;
            this._intUnit = 3 /* Day */;
        }

        // now remove weeks as they are not a concept in datetime
        if (this._intUnit === 4 /* Week */) {
            this._intAmount = this._intAmount * 7;
            this._intUnit = 3 /* Day */;
        }
        if (this._intUnit === 5 /* Month */ && this._intAmount >= 12 && this._intAmount % 12 === 0) {
            this._intAmount = this._intAmount / 12;
            this._intUnit = 6 /* Year */;
        }

        // normalize dst handling
        if (this._dstRelevant()) {
            this._intDst = this._dst;
        } else {
            this._intDst = 0 /* RegularIntervals */;
        }

        // normalize start day
        this._intStart = this._normalizeDay(this._start, false);
    };
    return Period;
})();
exports.Period = Period;

}).call(this,"/")
},{"assert":4,"path":8}],"Focm2+":[function(require,module,exports){
module.exports=require(1)
},{"assert":4,"path":8}],"timezonecomplete":[function(require,module,exports){
module.exports=require('Focm2+');
},{}],4:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":6}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("VCmEsw"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"VCmEsw":9,"inherits":7}],7:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],8:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("VCmEsw"))
},{"VCmEsw":9}],9:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1]);
return require("timezonecomplete");

}));
