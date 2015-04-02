/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time zone representation and offset calculation
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var util = require("util");
var basics = require("./basics");
var TimeStruct = basics.TimeStruct;
var javascript = require("./javascript");
var DateFunctions = javascript.DateFunctions;
var strings = require("./strings");
var tzDatabase = require("./tz-database");
var TzDatabase = tzDatabase.TzDatabase;
/**
 * The local time zone for a given date as per OS settings. Note that time zones are cached
 * so you don't necessarily get a new object each time.
 */
function local() {
    return TimeZone.local();
}
exports.local = local;
/**
 * Coordinated Universal Time zone. Note that time zones are cached
 * so you don't necessarily get a new object each time.
 */
function utc() {
    return TimeZone.utc();
}
exports.utc = utc;
/**
 * See the descriptions for the other zone() method signatures.
 */
function zone(a, dst) {
    return TimeZone.zone(a, dst);
}
exports.zone = zone;
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
     * @param dst	Adhere to Daylight Saving Time if applicable, ignored for local time and fixed offsets
     */
    function TimeZone(name, dst) {
        if (dst === void 0) { dst = true; }
        this._name = name;
        this._dst = dst;
        if (name === "localtime") {
            this._kind = 0 /* Local */;
        }
        else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
            this._kind = 1 /* Offset */;
            this._offset = TimeZone.stringToOffset(name);
        }
        else {
            this._kind = 2 /* Proper */;
            assert(TzDatabase.instance().exists(name), util.format("Non-existing time zone name '%s'", name));
        }
    }
    /**
     * The local time zone for a given date. Note that
     * the time zone varies with the date: amsterdam time for
     * 2014-01-01 is +01:00 and amsterdam time for 2014-07-01 is +02:00
     */
    TimeZone.local = function () {
        return TimeZone._findOrCreate("localtime", true);
    };
    /**
     * The UTC time zone.
     */
    TimeZone.utc = function () {
        return TimeZone._findOrCreate("UTC", false);
    };
    /**
     * Zone implementations
     */
    TimeZone.zone = function (a, dst) {
        if (dst === void 0) { dst = true; }
        var name = "";
        switch (typeof (a)) {
            case "string":
                {
                    var s = a;
                    if (s.trim().length === 0) {
                        return null; // no time zone
                    }
                    else {
                        if (s.indexOf("without DST") >= 0) {
                            dst = false;
                            s = s.slice(0, s.indexOf("without DST") - 1);
                        }
                        name = TimeZone._normalizeString(s);
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
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("TimeZone.zone(): Unexpected argument type \"" + typeof (a) + "\"");
                }
        }
        return TimeZone._findOrCreate(name, dst);
    };
    /**
     * Makes this class appear clonable. NOTE as time zone objects are cached you will NOT
     * actually get a clone but the same object.
     */
    TimeZone.prototype.clone = function () {
        return this;
    };
    /**
     * The time zone identifier. Can be an offset "-01:30" or an
     * IANA time zone name "Europe/Amsterdam", or "localtime" for
     * the local time zone.
     */
    TimeZone.prototype.name = function () {
        return this._name;
    };
    TimeZone.prototype.dst = function () {
        return this._dst;
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
            case 0 /* Local */: return (other.kind() === 0 /* Local */);
            case 1 /* Offset */: return (other.kind() === 1 /* Offset */ && this._offset === other._offset);
            case 2 /* Proper */: return (other.kind() === 2 /* Proper */ && this._name === other._name && (this._dst === other._dst || !this.hasDst()));
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown time zone kind.");
                }
        }
    };
    /**
     * Returns true iff the constructor arguments were identical, so UTC !== GMT
     */
    TimeZone.prototype.identical = function (other) {
        switch (this._kind) {
            case 0 /* Local */: return (other.kind() === 0 /* Local */);
            case 1 /* Offset */: return (other.kind() === 1 /* Offset */ && this._offset === other._offset);
            case 2 /* Proper */: return (other.kind() === 2 /* Proper */ && this._name === other._name && this._dst === other._dst);
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown time zone kind.");
                }
        }
    };
    /**
     * Is this zone equivalent to UTC?
     */
    TimeZone.prototype.isUtc = function () {
        switch (this._kind) {
            case 0 /* Local */: return false;
            case 1 /* Offset */: return (this._offset === 0);
            case 2 /* Proper */: return (TzDatabase.instance().zoneIsUtc(this._name));
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return false;
                }
        }
    };
    /**
     * Does this zone have Daylight Saving Time at all?
     */
    TimeZone.prototype.hasDst = function () {
        switch (this._kind) {
            case 0 /* Local */: return false;
            case 1 /* Offset */: return false;
            case 2 /* Proper */: return (TzDatabase.instance().hasDst(this._name));
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return false;
                }
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
        if (hour === void 0) { hour = 0; }
        if (minute === void 0) { minute = 0; }
        if (second === void 0) { second = 0; }
        if (millisecond === void 0) { millisecond = 0; }
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
                if (this._dst) {
                    return TzDatabase.instance().totalOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
                else {
                    return TzDatabase.instance().standardOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
            }
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
                }
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
        if (hour === void 0) { hour = 0; }
        if (minute === void 0) { minute = 0; }
        if (second === void 0) { second = 0; }
        if (millisecond === void 0) { millisecond = 0; }
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
                if (this._dst) {
                    return TzDatabase.instance().totalOffsetLocal(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
                else {
                    return TzDatabase.instance().standardOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
            }
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
                }
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
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown DateFunctions value");
                }
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
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown DateFunctions value");
                }
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
     * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
     *
     * @return "local" for local timezone, the offset for an offset zone, or the abbreviation for a proper zone.
     */
    TimeZone.prototype.abbreviationForUtc = function (year, month, day, hour, minute, second, millisecond, dstDependent) {
        if (hour === void 0) { hour = 0; }
        if (minute === void 0) { minute = 0; }
        if (second === void 0) { second = 0; }
        if (millisecond === void 0) { millisecond = 0; }
        if (dstDependent === void 0) { dstDependent = true; }
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
                return TzDatabase.instance().abbreviation(this._name, tm.toUnixNoLeapSecs(), dstDependent);
            }
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
                }
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
        if (opt === void 0) { opt = 0 /* Up */; }
        if (this.kind() === 2 /* Proper */) {
            var tzopt = (opt === 1 /* Down */ ? 1 /* Down */ : 0 /* Up */);
            return TzDatabase.instance().normalizeLocal(this._name, localUnixMillis, tzopt);
        }
        else {
            return localUnixMillis;
        }
    };
    /**
     * The time zone identifier (normalized).
     * Either "localtime", IANA name, or "+hh:mm" offset.
     */
    TimeZone.prototype.toString = function () {
        var result = this.name();
        if (this.kind() === 2 /* Proper */) {
            if (this.hasDst() && !this.dst()) {
                result += " without DST";
            }
        }
        return result;
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
        }
        else if (t.length === 6) {
            minutes = parseInt(t.substr(4, 2), 10);
        }
        assert(hours >= 0 && hours < 24, "Offsets from UTC must be less than a day.");
        return sign * (hours * 60 + minutes);
    };
    /**
     * Find in cache or create zone
     * @param name	Time zone name
     * @param dst	Adhere to Daylight Saving Time?
     */
    TimeZone._findOrCreate = function (name, dst) {
        var key = name + (dst ? "_DST" : "_NO-DST");
        if (key in TimeZone._cache) {
            return TimeZone._cache[key];
        }
        else {
            var t = new TimeZone(name, dst);
            TimeZone._cache[key] = t;
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
        }
        else if (t === "Z") {
            return "+00:00";
        }
        else if (TimeZone._isOffsetString(t)) {
            // offset string
            // normalize by converting back and forth
            return TimeZone.offsetToString(TimeZone.stringToOffset(t));
        }
        else {
            // Olsen TZ database name
            return t;
        }
    };
    TimeZone._isOffsetString = function (s) {
        var t = s.trim();
        return (t.charAt(0) === "+" || t.charAt(0) === "-" || t === "Z");
    };
    /**
     * Time zone cache.
     */
    TimeZone._cache = {};
    return TimeZone;
})();
exports.TimeZone = TimeZone;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWV6b25lLnRzIl0sIm5hbWVzIjpbImxvY2FsIiwidXRjIiwiem9uZSIsIlRpbWVab25lS2luZCIsIk5vcm1hbGl6ZU9wdGlvbiIsIlRpbWVab25lIiwiVGltZVpvbmUuY29uc3RydWN0b3IiLCJUaW1lWm9uZS5sb2NhbCIsIlRpbWVab25lLnV0YyIsIlRpbWVab25lLnpvbmUiLCJUaW1lWm9uZS5jbG9uZSIsIlRpbWVab25lLm5hbWUiLCJUaW1lWm9uZS5kc3QiLCJUaW1lWm9uZS5raW5kIiwiVGltZVpvbmUuZXF1YWxzIiwiVGltZVpvbmUuaWRlbnRpY2FsIiwiVGltZVpvbmUuaXNVdGMiLCJUaW1lWm9uZS5oYXNEc3QiLCJUaW1lWm9uZS5vZmZzZXRGb3JVdGMiLCJUaW1lWm9uZS5vZmZzZXRGb3Jab25lIiwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjRGF0ZSIsIlRpbWVab25lLm9mZnNldEZvclpvbmVEYXRlIiwiVGltZVpvbmUuYWJicmV2aWF0aW9uRm9yVXRjIiwiVGltZVpvbmUubm9ybWFsaXplWm9uZVRpbWUiLCJUaW1lWm9uZS50b1N0cmluZyIsIlRpbWVab25lLmluc3BlY3QiLCJUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyIsIlRpbWVab25lLnN0cmluZ1RvT2Zmc2V0IiwiVGltZVpvbmUuX2ZpbmRPckNyZWF0ZSIsIlRpbWVab25lLl9ub3JtYWxpemVTdHJpbmciLCJUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFFYixJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUNsQyxJQUFPLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUU5QixJQUFPLE1BQU0sV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFPLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBRXRDLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFD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R0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxPQUFPQSxHQUFHQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsRUFBRUEsRUFBRUEsMkNBQTJDQSxDQUFDQSxDQUFDQTtRQUM5RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsRUFBRUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBUUR0Qjs7OztPQUlHQTtJQUNZQSxzQkFBYUEsR0FBNUJBLFVBQTZCQSxJQUFZQSxFQUFFQSxHQUFZQTtRQUN0RHVCLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBO1FBQzVDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2hDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFRHZCOzs7T0FHR0E7SUFDWUEseUJBQWdCQSxHQUEvQkEsVUFBZ0NBLENBQVNBO1FBQ3hDd0IsSUFBSUEsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDekJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNWQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxBQUVBQSxnQkFGZ0JBO1lBQ2hCQSx5Q0FBeUNBO1lBQ3pDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsQUFDQUEseUJBRHlCQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFY3hCLHdCQUFlQSxHQUE5QkEsVUFBK0JBLENBQVNBO1FBQ3ZDeUIsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDakJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQTdDRHpCOztPQUVHQTtJQUNZQSxlQUFNQSxHQUFrQ0EsRUFBRUEsQ0FBQ0E7SUEyQzNEQSxlQUFDQTtBQUFEQSxDQS9qQkEsQUErakJDQSxJQUFBO0FBL2pCWSxnQkFBUSxHQUFSLFFBK2pCWixDQUFBIiwiZmlsZSI6ImxpYi90aW1lem9uZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19