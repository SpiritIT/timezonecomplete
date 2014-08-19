/**
* Copyright(c) 2014 Spirit IT BV
*
* Time zone representation and offset calculation
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

var basics = require("./basics");
var TimeStruct = basics.TimeStruct;

var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;

var strings = require("./strings");

var tzDatabase = require("./tz-database");
var TzDatabase = tzDatabase.TzDatabase;

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
* Option for TimeZone#normalizeLocal()
*/
(function (NormalizeOption) {
    /**
    * Normalize non-existing times by ADDING the DST offset
    */
    NormalizeOption[NormalizeOption["Up"] = 0] = "Up";

    /**
    * Normalize non-existing times by SUBTRACTING the DST offset
    */
    NormalizeOption[NormalizeOption["Down"] = 1] = "Down";
})(exports.NormalizeOption || (exports.NormalizeOption = {}));
var NormalizeOption = exports.NormalizeOption;

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
        } else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
            this._kind = 1 /* Offset */;
            this._offset = TimeZone.stringToOffset(name);
        } else {
            this._kind = 2 /* Proper */;
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
                return (TzDatabase.instance().zoneIsUtc(this._name));

            default:
                /* istanbul ignore next */
                return false;
        }
    };

    /**
    * Does this zone have Daylight Saving Time at all?
    */
    TimeZone.prototype.hasDst = function () {
        switch (this._kind) {
            case 0 /* Local */:
                return false;
            case 1 /* Offset */:
                return false;
            case 2 /* Proper */:
                return (TzDatabase.instance().hasDst(this._name));

            default:
                /* istanbul ignore next */
                return false;
        }
    };

    /**
    * Calculate timezone offset from a UTC time.
    *
    * @param year Full year
    * @param month Month 1-12 (note this deviates from JavaScript date)
    * @param day Day of month 1-31
    * @param hour Hour 0-23
    * @param minute Minute 0-59
    * @param second Second 0-59
    * @param millisecond Millisecond 0-999
    *
    * @return the offset of this time zone with respect to UTC at the given time, in minutes.
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
        assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  second out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                var date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
                return -1 * date.getTimezoneOffset();
            }
            case 1 /* Offset */: {
                return this._offset;
            }
            case 2 /* Proper */: {
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().totalOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
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
    * @return the offset of this time zone with respect to UTC at the given time, in minutes.
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
        assert(second >= 0 && second < 60, "TimeZone.offsetForZone():  second out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForZone():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                var date = new Date(year, month - 1, day, hour, minute, second, millisecond);
                return -1 * date.getTimezoneOffset();
            }
            case 1 /* Offset */: {
                return this._offset;
            }
            case 2 /* Proper */: {
                // note that TzDatabase normalizes the given date so we don't have to do it
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().totalOffsetLocal(this._name, tm.toUnixNoLeapSecs()).minutes();
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");

                break;
        }
    };

    /**
    * Note: will be removed in version 2.0.0
    *
    * Convenience function, takes values from a Javascript Date
    * Calls offsetForUtc() with the contents of the date
    *
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
    * Note: will be removed in version 2.0.0
    *
    * Convenience function, takes values from a Javascript Date
    * Calls offsetForUtc() with the contents of the date
    *
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
    * Zone abbreviation at given UTC timestamp e.g. CEST for Central European Summer Time.
    *
    * @param year Full year
    * @param month Month 1-12 (note this deviates from JavaScript date)
    * @param day Day of month 1-31
    * @param hour Hour 0-23
    * @param minute Minute 0-59
    * @param second Second 0-59
    * @param millisecond Millisecond 0-999
    *
    * @return "local" for local timezone, the offset for an offset zone, or the abbreviation for a proper zone.
    */
    TimeZone.prototype.abbreviationForUtc = function (year, month, day, hour, minute, second, millisecond) {
        if (typeof hour === "undefined") { hour = 0; }
        if (typeof minute === "undefined") { minute = 0; }
        if (typeof second === "undefined") { second = 0; }
        if (typeof millisecond === "undefined") { millisecond = 0; }
        assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
        assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
        assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
        assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
        assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  second out of range.");
        assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
        switch (this._kind) {
            case 0 /* Local */: {
                return "local";
            }
            case 1 /* Offset */: {
                return this.toString();
            }
            case 2 /* Proper */: {
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().abbreviation(this._name, tm.toUnixNoLeapSecs());
            }

            default:
                /* istanbul ignore next */
                assert(false, "Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");

                break;
        }
    };

    /**
    * Normalizes non-existing local times by adding a forward offset change.
    * During a forward standard offset change or DST offset change, some amount of
    * local time is skipped. Therefore, this amount of local time does not exist.
    * This function adds the amount of forward change to any non-existing time. After all,
    * this is probably what the user meant.
    *
    * @param localUnixMillis	Unix timestamp in zone time
    * @param opt	(optional) Round up or down? Default: up
    *
    * @returns	Unix timestamp in zone time, normalized.
    */
    TimeZone.prototype.normalizeZoneTime = function (localUnixMillis, opt) {
        if (typeof opt === "undefined") { opt = 0 /* Up */; }
        if (this.kind() === 2 /* Proper */) {
            var tzopt = (opt === 1 /* Down */ ? 1 /* Down */ : 0 /* Up */);
            return TzDatabase.instance().normalizeLocal(this._name, localUnixMillis, tzopt);
        } else {
            return localUnixMillis;
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
        return sign + strings.padLeft(hours.toString(10), 2, "0") + ":" + strings.padLeft(minutes.toString(10), 2, "0");
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
    TimeZone._cache = {};
    return TimeZone;
})();
exports.TimeZone = TimeZone;
