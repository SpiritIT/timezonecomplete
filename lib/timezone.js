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
        return TimeZone._findOrCreate("UTC", true); // use 'true' for DST because we want it to display as "UTC", not "UTC without DST"
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWV6b25lLnRzIl0sIm5hbWVzIjpbImxvY2FsIiwidXRjIiwiem9uZSIsIlRpbWVab25lS2luZCIsIk5vcm1hbGl6ZU9wdGlvbiIsIlRpbWVab25lIiwiVGltZVpvbmUuY29uc3RydWN0b3IiLCJUaW1lWm9uZS5sb2NhbCIsIlRpbWVab25lLnV0YyIsIlRpbWVab25lLnpvbmUiLCJUaW1lWm9uZS5jbG9uZSIsIlRpbWVab25lLm5hbWUiLCJUaW1lWm9uZS5kc3QiLCJUaW1lWm9uZS5raW5kIiwiVGltZVpvbmUuZXF1YWxzIiwiVGltZVpvbmUuaWRlbnRpY2FsIiwiVGltZVpvbmUuaXNVdGMiLCJUaW1lWm9uZS5oYXNEc3QiLCJUaW1lWm9uZS5vZmZzZXRGb3JVdGMiLCJUaW1lWm9uZS5vZmZzZXRGb3Jab25lIiwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjRGF0ZSIsIlRpbWVab25lLm9mZnNldEZvclpvbmVEYXRlIiwiVGltZVpvbmUuYWJicmV2aWF0aW9uRm9yVXRjIiwiVGltZVpvbmUubm9ybWFsaXplWm9uZVRpbWUiLCJUaW1lWm9uZS50b1N0cmluZyIsIlRpbWVab25lLmluc3BlY3QiLCJUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyIsIlRpbWVab25lLnN0cmluZ1RvT2Zmc2V0IiwiVGltZVpvbmUuX2ZpbmRPckNyZWF0ZSIsIlRpbWVab25lLl9ub3JtYWxpemVTdHJpbmciLCJUaW1lWm9uZS5faXNPZmZzZXRTdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFFYixJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUNsQyxJQUFPLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUU5QixJQUFPLE1BQU0sV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFPLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBRXRDLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFD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Q0EsQ0FBQ0E7WUFDcEJBLEtBQUtBLGFBQWtCQSxFQUFFQSxDQUFDQTtnQkFDekJBLElBQUlBLElBQUlBLEdBQVNBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUM3RkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtZQUN0Q0EsQ0FBQ0E7WUFDREEsS0FBS0EsY0FBbUJBLEVBQUVBLENBQUNBO2dCQUMxQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7WUFDckJBLENBQUNBO1lBQ0RBLEtBQUtBLGNBQW1CQSxFQUFFQSxDQUFDQTtnQkFDMUJBLElBQUlBLEVBQUVBLEdBQWVBLElBQUlBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO2dCQUN6RkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2ZBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7Z0JBQ3ZGQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ1BBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLENBQUNBLGdCQUFnQkEs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Q0E7WUFDcEJBLE9BQU9BLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsT0FBT0EsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLEdBQUdBLEVBQUVBLEVBQUVBLDJDQUEyQ0EsQ0FBQ0EsQ0FBQ0E7UUFDOUVBLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLEtBQUtBLEdBQUdBLEVBQUVBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQVFEdEI7Ozs7T0FJR0E7SUFDWUEsc0JBQWFBLEdBQTVCQSxVQUE2QkEsSUFBWUEsRUFBRUEsR0FBWUE7UUFDdER1QixJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxNQUFNQSxHQUFHQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM1Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNQQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNoQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRUR2Qjs7O09BR0dBO0lBQ1lBLHlCQUFnQkEsR0FBL0JBLFVBQWdDQSxDQUFTQTtRQUN4Q3dCLElBQUlBLENBQUNBLEdBQVdBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ3pCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSw4QkFBOEJBLENBQUNBLENBQUNBO1FBQ3JEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsQUFFQUEsZ0JBRmdCQTtZQUNoQkEseUNBQXlDQTtZQUN6Q0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNURBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLEFBQ0FBLHlCQUR5QkE7WUFDekJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRWN4Qix3QkFBZUEsR0FBOUJBLFVBQStCQSxDQUFTQTtRQUN2Q3lCLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2pCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNsRUEsQ0FBQ0E7SUE3Q0R6Qjs7T0FFR0E7SUFDWUEsZUFBTUEsR0FBa0NBLEVBQUVBLENBQUNBO0lBMkMzREEsZUFBQ0E7QUFBREEsQ0EvakJBLEFBK2pCQ0EsSUFBQTtBQS9qQlksZ0JBQVEsR0FBUixRQStqQlosQ0FBQSIsImZpbGUiOiJsaWIvdGltZXpvbmUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6W251bGxdfQ==