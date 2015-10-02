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
            this._kind = TimeZoneKind.Local;
        }
        else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
            this._kind = TimeZoneKind.Offset;
            this._offset = TimeZone.stringToOffset(name);
        }
        else {
            this._kind = TimeZoneKind.Proper;
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
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: return (other.kind() === TimeZoneKind.Local);
            case TimeZoneKind.Offset: return (other.kind() === TimeZoneKind.Offset && this._offset === other._offset);
            case TimeZoneKind.Proper: return (other.kind() === TimeZoneKind.Proper
                && this._name === other._name
                && (this._dst === other._dst || !this.hasDst()));
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: return (other.kind() === TimeZoneKind.Local);
            case TimeZoneKind.Offset: return (other.kind() === TimeZoneKind.Offset && this._offset === other._offset);
            case TimeZoneKind.Proper: return (other.kind() === TimeZoneKind.Proper && this._name === other._name && this._dst === other._dst);
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: return false;
            case TimeZoneKind.Offset: return (this._offset === 0);
            case TimeZoneKind.Proper: return (TzDatabase.instance().zoneIsUtc(this._name));
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: return false;
            case TimeZoneKind.Offset: return false;
            case TimeZoneKind.Proper: return (TzDatabase.instance().hasDst(this._name));
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: {
                var date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
                return -1 * date.getTimezoneOffset();
            }
            case TimeZoneKind.Offset: {
                return this._offset;
            }
            case TimeZoneKind.Proper: {
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                if (this._dst) {
                    return TzDatabase.instance().totalOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
                else {
                    return TzDatabase.instance().standardOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
            }
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: {
                var date = new Date(year, month - 1, day, hour, minute, second, millisecond);
                return -1 * date.getTimezoneOffset();
            }
            case TimeZoneKind.Offset: {
                return this._offset;
            }
            case TimeZoneKind.Proper: {
                // note that TzDatabase normalizes the given date so we don't have to do it
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                if (this._dst) {
                    return TzDatabase.instance().totalOffsetLocal(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
                else {
                    return TzDatabase.instance().standardOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
                }
            }
            /* istanbul ignore next */
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
            case DateFunctions.Get: {
                return this.offsetForUtc(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            case DateFunctions.GetUTC: {
                return this.offsetForUtc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
            }
            /* istanbul ignore next */
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
            case DateFunctions.Get: {
                return this.offsetForZone(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            }
            case DateFunctions.GetUTC: {
                return this.offsetForZone(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
            }
            /* istanbul ignore next */
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
            case TimeZoneKind.Local: {
                return "local";
            }
            case TimeZoneKind.Offset: {
                return this.toString();
            }
            case TimeZoneKind.Proper: {
                var tm = new TimeStruct(year, month, day, hour, minute, second, millisecond);
                return TzDatabase.instance().abbreviation(this._name, tm.toUnixNoLeapSecs(), dstDependent);
            }
            /* istanbul ignore next */
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
        if (opt === void 0) { opt = NormalizeOption.Up; }
        if (this.kind() === TimeZoneKind.Proper) {
            var tzopt = (opt === NormalizeOption.Down ? tzDatabase.NormalizeOption.Down : tzDatabase.NormalizeOption.Up);
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
        if (this.kind() === TimeZoneKind.Proper) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90aW1lem9uZS50cyJdLCJuYW1lcyI6WyJsb2NhbCIsInV0YyIsInpvbmUiLCJUaW1lWm9uZUtpbmQiLCJOb3JtYWxpemVPcHRpb24iLCJUaW1lWm9uZSIsIlRpbWVab25lLmNvbnN0cnVjdG9yIiwiVGltZVpvbmUubG9jYWwiLCJUaW1lWm9uZS51dGMiLCJUaW1lWm9uZS56b25lIiwiVGltZVpvbmUuY2xvbmUiLCJUaW1lWm9uZS5uYW1lIiwiVGltZVpvbmUuZHN0IiwiVGltZVpvbmUua2luZCIsIlRpbWVab25lLmVxdWFscyIsIlRpbWVab25lLmlkZW50aWNhbCIsIlRpbWVab25lLmlzVXRjIiwiVGltZVpvbmUuaGFzRHN0IiwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjIiwiVGltZVpvbmUub2Zmc2V0Rm9yWm9uZSIsIlRpbWVab25lLm9mZnNldEZvclV0Y0RhdGUiLCJUaW1lWm9uZS5vZmZzZXRGb3Jab25lRGF0ZSIsIlRpbWVab25lLmFiYnJldmlhdGlvbkZvclV0YyIsIlRpbWVab25lLm5vcm1hbGl6ZVpvbmVUaW1lIiwiVGltZVpvbmUudG9TdHJpbmciLCJUaW1lWm9uZS5pbnNwZWN0IiwiVGltZVpvbmUub2Zmc2V0VG9TdHJpbmciLCJUaW1lWm9uZS5zdHJpbmdUb09mZnNldCIsIlRpbWVab25lLl9maW5kT3JDcmVhdGUiLCJUaW1lWm9uZS5fbm9ybWFsaXplU3RyaW5nIiwiVGltZVpvbmUuX2lzT2Zmc2V0U3RyaW5nIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLElBQU8sSUFBSSxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBRTlCLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQU8sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFFdEMsSUFBTyxVQUFVLFdBQVcsY0FBYyxDQUFDLENBQUM7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UUFDREEsMERBQTBEQTtRQUMxREEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxDQUFDQSxFQUFFQSw0QkFBNEJBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBQ3hHQSxJQUFJQSxJQUFJQSxHQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNsREEsSUFBSUEsS0FBS0EsR0FBV0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDakRBLElBQUlBLE9BQU9BLEdBQVdBLENBQUNBLENBQUNBO1FBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsT0FBT0EsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxPQUFPQSxHQUFHQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsR0FBR0EsRUFBRUEsRUFBRUEsMkNBQTJDQSxDQUFDQSxDQUFDQTtRQUM5RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsRUFBRUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBUUR0Qjs7OztPQUlHQTtJQUNZQSxzQkFBYUEsR0FBNUJBLFVBQTZCQSxJQUFZQSxFQUFFQSxHQUFZQTtRQUN0RHVCLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBO1FBQzVDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2hDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFRHZCOzs7T0FHR0E7SUFDWUEseUJBQWdCQSxHQUEvQkEsVUFBZ0NBLENBQVNBO1FBQ3hDd0IsSUFBSUEsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDekJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNWQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hDQSxnQkFBZ0JBO1lBQ2hCQSx5Q0FBeUNBO1lBQ3pDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEseUJBQXlCQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFY3hCLHdCQUFlQSxHQUE5QkEsVUFBK0JBLENBQVNBO1FBQ3ZDeUIsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDakJBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQTdDRHpCOztPQUVHQTtJQUNZQSxlQUFNQSxHQUFrQ0EsRUFBRUEsQ0FBQ0E7SUEyQzNEQSxlQUFDQTtBQUFEQSxDQS9qQkEsQUErakJDQSxJQUFBO0FBL2pCWSxnQkFBUSxXQStqQnBCLENBQUEiLCJmaWxlIjoibGliL3RpbWV6b25lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBUaW1lIHpvbmUgcmVwcmVzZW50YXRpb24gYW5kIG9mZnNldCBjYWxjdWxhdGlvblxyXG4gKi9cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5kLnRzXCIvPlxyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcclxuaW1wb3J0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcclxuXHJcbmltcG9ydCBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbmltcG9ydCBUaW1lU3RydWN0ID0gYmFzaWNzLlRpbWVTdHJ1Y3Q7XHJcblxyXG5pbXBvcnQgamF2YXNjcmlwdCA9IHJlcXVpcmUoXCIuL2phdmFzY3JpcHRcIik7XHJcbmltcG9ydCBEYXRlRnVuY3Rpb25zID0gamF2YXNjcmlwdC5EYXRlRnVuY3Rpb25zO1xyXG5cclxuaW1wb3J0IHN0cmluZ3MgPSByZXF1aXJlKFwiLi9zdHJpbmdzXCIpO1xyXG5cclxuaW1wb3J0IHR6RGF0YWJhc2UgPSByZXF1aXJlKFwiLi90ei1kYXRhYmFzZVwiKTtcclxuaW1wb3J0IFR6RGF0YWJhc2UgPSB0ekRhdGFiYXNlLlR6RGF0YWJhc2U7XHJcblxyXG5cclxuLyoqXHJcbiAqIFRoZSBsb2NhbCB0aW1lIHpvbmUgZm9yIGEgZ2l2ZW4gZGF0ZSBhcyBwZXIgT1Mgc2V0dGluZ3MuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsKCk6IFRpbWVab25lIHtcclxuXHRyZXR1cm4gVGltZVpvbmUubG9jYWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lIHpvbmUuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHV0YygpOiBUaW1lWm9uZSB7XHJcblx0cmV0dXJuIFRpbWVab25lLnV0YygpO1xyXG59XHJcblxyXG4vKipcclxuICogQHBhcmFtIG9mZnNldCBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzAuIE5vdGUgdGhhdCB0aW1lIHpvbmVzIGFyZSBjYWNoZWRcclxuICogc28geW91IGRvbid0IG5lY2Vzc2FyaWx5IGdldCBhIG5ldyBvYmplY3QgZWFjaCB0aW1lLlxyXG4gKiBAcmV0dXJucyBhIHRpbWUgem9uZSB3aXRoIHRoZSBnaXZlbiBmaXhlZCBvZmZzZXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKG9mZnNldDogbnVtYmVyKTogVGltZVpvbmU7XHJcblxyXG4vKipcclxuICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG4gKiBzbyB5b3UgZG9uJ3QgbmVjZXNzYXJpbHkgZ2V0IGEgbmV3IG9iamVjdCBlYWNoIHRpbWUuXHJcbiAqIEBwYXJhbSBzIEVtcHR5IHN0cmluZyBmb3Igbm8gdGltZSB6b25lIChudWxsIGlzIHJldHVybmVkKSxcclxuICogICAgICAgICAgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcclxuICogICAgICAgICAgYSBUWiBkYXRhYmFzZSB0aW1lIHpvbmUgbmFtZSAoZS5nLiBFdXJvcGUvQW1zdGVyZGFtKSxcclxuICogICAgICAgICAgb3IgYW4gb2Zmc2V0IHN0cmluZyAoZWl0aGVyICswMTozMCwgKzAxMzAsICswMSwgWikuIEZvciBhIGZ1bGwgbGlzdCBvZiBuYW1lcywgc2VlOlxyXG4gKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcclxuICogQHBhcmFtIGRzdFx0T3B0aW9uYWwsIGRlZmF1bHQgdHJ1ZTogYWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGUuIE5vdGUgZm9yXHJcbiAqICAgICAgICAgICAgICBcImxvY2FsdGltZVwiLCB0aW1lem9uZWNvbXBsZXRlIHdpbGwgYWRoZXJlIHRvIHRoZSBjb21wdXRlciBzZXR0aW5ncywgdGhlIERTVCBmbGFnXHJcbiAqICAgICAgICAgICAgICBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gem9uZShuYW1lOiBzdHJpbmcsIGRzdD86IGJvb2xlYW4pOiBUaW1lWm9uZTtcclxuXHJcbi8qKlxyXG4gKiBTZWUgdGhlIGRlc2NyaXB0aW9ucyBmb3IgdGhlIG90aGVyIHpvbmUoKSBtZXRob2Qgc2lnbmF0dXJlcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB6b25lKGE6IGFueSwgZHN0PzogYm9vbGVhbik6IFRpbWVab25lIHtcclxuXHRyZXR1cm4gVGltZVpvbmUuem9uZShhLCBkc3QpO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIHR5cGUgb2YgdGltZSB6b25lXHJcbiAqL1xyXG5leHBvcnQgZW51bSBUaW1lWm9uZUtpbmQge1xyXG5cdC8qKlxyXG5cdCAqIExvY2FsIHRpbWUgb2Zmc2V0IGFzIGRldGVybWluZWQgYnkgSmF2YVNjcmlwdCBEYXRlIGNsYXNzLlxyXG5cdCAqL1xyXG5cdExvY2FsLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIG9mZnNldCBmcm9tIFVUQywgd2l0aG91dCBEU1QuXHJcblx0ICovXHJcblx0T2Zmc2V0LFxyXG5cdC8qKlxyXG5cdCAqIElBTkEgdGltZXpvbmUgbWFuYWdlZCB0aHJvdWdoIE9sc2VuIFRaIGRhdGFiYXNlLiBJbmNsdWRlc1xyXG5cdCAqIERTVCBpZiBhcHBsaWNhYmxlLlxyXG5cdCAqL1xyXG5cdFByb3BlclxyXG59XHJcblxyXG4vKipcclxuICogT3B0aW9uIGZvciBUaW1lWm9uZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG5leHBvcnQgZW51bSBOb3JtYWxpemVPcHRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcblx0ICovXHJcblx0VXAsXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdERvd25cclxufVxyXG5cclxuLyoqXHJcbiAqIFRpbWUgem9uZS4gVGhlIG9iamVjdCBpcyBpbW11dGFibGUgYmVjYXVzZSBpdCBpcyBjYWNoZWQ6XHJcbiAqIHJlcXVlc3RpbmcgYSB0aW1lIHpvbmUgdHdpY2UgeWllbGRzIHRoZSB2ZXJ5IHNhbWUgb2JqZWN0LlxyXG4gKiBOb3RlIHRoYXQgd2UgdXNlIHRpbWUgem9uZSBvZmZzZXRzIGludmVydGVkIHcuci50LiBKYXZhU2NyaXB0IERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSxcclxuICogaS5lLiBvZmZzZXQgOTAgbWVhbnMgKzAxOjMwLlxyXG4gKlxyXG4gKiBUaW1lIHpvbmVzIGNvbWUgaW4gdGhyZWUgZmxhdm9yczogdGhlIGxvY2FsIHRpbWUgem9uZSwgYXMgY2FsY3VsYXRlZCBieSBKYXZhU2NyaXB0IERhdGUsXHJcbiAqIGEgZml4ZWQgb2Zmc2V0IChcIiswMTozMFwiKSB3aXRob3V0IERTVCwgb3IgYSBJQU5BIHRpbWV6b25lIChcIkV1cm9wZS9BbXN0ZXJkYW1cIikgd2l0aCBEU1RcclxuICogYXBwbGllZCBkZXBlbmRpbmcgb24gdGhlIHRpbWUgem9uZSBydWxlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaW1lWm9uZSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRpbWUgem9uZSBpZGVudGlmaWVyOlxyXG5cdCAqICBcImxvY2FsdGltZVwiIHN0cmluZyBmb3IgbG9jYWwgdGltZVxyXG5cdCAqICBFLmcuIFwiLTAxOjMwXCIgZm9yIGEgZml4ZWQgb2Zmc2V0IGZyb20gVVRDXHJcblx0ICogIEUuZy4gXCJVVENcIiBvciBcIkV1cm9wZS9BbXN0ZXJkYW1cIiBmb3IgYW4gT2xzZW4gVFogZGF0YWJhc2UgdGltZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX25hbWU6IHN0cmluZztcclxuXHJcblx0LyoqXHJcblx0ICogQWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lIGlmIGFwcGxpY2FibGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9kc3Q6IGJvb2xlYW47XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBraW5kIG9mIHRpbWUgem9uZSBzcGVjaWZpZWQgYnkgX25hbWVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9raW5kOiBUaW1lWm9uZUtpbmQ7XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9ubHkgZm9yIGZpeGVkIG9mZnNldHM6IHRoZSBvZmZzZXQgaW4gbWludXRlc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgX29mZnNldDogbnVtYmVyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgbG9jYWwgdGltZSB6b25lIGZvciBhIGdpdmVuIGRhdGUuIE5vdGUgdGhhdFxyXG5cdCAqIHRoZSB0aW1lIHpvbmUgdmFyaWVzIHdpdGggdGhlIGRhdGU6IGFtc3RlcmRhbSB0aW1lIGZvclxyXG5cdCAqIDIwMTQtMDEtMDEgaXMgKzAxOjAwIGFuZCBhbXN0ZXJkYW0gdGltZSBmb3IgMjAxNC0wNy0wMSBpcyArMDI6MDBcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGxvY2FsKCk6IFRpbWVab25lIHtcclxuXHRcdHJldHVybiBUaW1lWm9uZS5fZmluZE9yQ3JlYXRlKFwibG9jYWx0aW1lXCIsIHRydWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIFVUQyB0aW1lIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB1dGMoKTogVGltZVpvbmUge1xyXG5cdFx0cmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUoXCJVVENcIiwgdHJ1ZSk7IC8vIHVzZSAndHJ1ZScgZm9yIERTVCBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gZGlzcGxheSBhcyBcIlVUQ1wiLCBub3QgXCJVVEMgd2l0aG91dCBEU1RcIlxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIHdpdGggYSBmaXhlZCBvZmZzZXRcclxuXHQgKiBAcGFyYW0gb2Zmc2V0XHRvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzLCBlLmcuIDkwIGZvciArMDE6MzBcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUob2Zmc2V0OiBudW1iZXIpOiBUaW1lWm9uZTtcclxuXHJcblx0LyoqXHJcblx0ICogVGltZSB6b25lIGZvciBhbiBvZmZzZXQgc3RyaW5nIG9yIGFuIElBTkEgdGltZSB6b25lIHN0cmluZy4gTm90ZSB0aGF0IHRpbWUgem9uZXMgYXJlIGNhY2hlZFxyXG5cdCAqIHNvIHlvdSBkb24ndCBuZWNlc3NhcmlseSBnZXQgYSBuZXcgb2JqZWN0IGVhY2ggdGltZS5cclxuXHQgKiBAcGFyYW0gcyBFbXB0eSBzdHJpbmcgZm9yIG5vIHRpbWUgem9uZSAobnVsbCBpcyByZXR1cm5lZCksXHJcblx0ICogICAgICAgICAgXCJsb2NhbHRpbWVcIiBmb3IgbG9jYWwgdGltZSxcclxuXHQgKiAgICAgICAgICBhIFRaIGRhdGFiYXNlIHRpbWUgem9uZSBuYW1lIChlLmcuIEV1cm9wZS9BbXN0ZXJkYW0pLFxyXG5cdCAqICAgICAgICAgIG9yIGFuIG9mZnNldCBzdHJpbmcgKGVpdGhlciArMDE6MzAsICswMTMwLCArMDEsIFopLiBGb3IgYSBmdWxsIGxpc3Qgb2YgbmFtZXMsIHNlZTpcclxuXHQgKiAgICAgICAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX3R6X2RhdGFiYXNlX3RpbWVfem9uZXNcclxuXHQgKiAgICAgICAgICBUWiBkYXRhYmFzZSB6b25lIG5hbWUgbWF5IGJlIHN1ZmZpeGVkIHdpdGggXCIgd2l0aG91dCBEU1RcIiB0byBpbmRpY2F0ZSBubyBEU1Qgc2hvdWxkIGJlIGFwcGxpZWQuXHJcblx0ICogICAgICAgICAgSW4gdGhhdCBjYXNlLCB0aGUgZHN0IHBhcmFtZXRlciBpcyBpZ25vcmVkLlxyXG5cdCAqIEBwYXJhbSBkc3RcdE9wdGlvbmFsLCBkZWZhdWx0IHRydWU6IGFkaGVyZSB0byBEYXlsaWdodCBTYXZpbmcgVGltZSBpZiBhcHBsaWNhYmxlLiBOb3RlIGZvclxyXG5cdCAqICAgICAgICAgICAgICBcImxvY2FsdGltZVwiLCB0aW1lem9uZWNvbXBsZXRlIHdpbGwgYWRoZXJlIHRvIHRoZSBjb21wdXRlciBzZXR0aW5ncywgdGhlIERTVCBmbGFnXHJcblx0ICogICAgICAgICAgICAgIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdC5cclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIHpvbmUoczogc3RyaW5nLCBkc3Q/OiBib29sZWFuKTogVGltZVpvbmU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFpvbmUgaW1wbGVtZW50YXRpb25zXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyB6b25lKGE6IGFueSwgZHN0OiBib29sZWFuID0gdHJ1ZSk6IFRpbWVab25lIHtcclxuXHRcdHZhciBuYW1lID0gXCJcIjtcclxuXHRcdHN3aXRjaCAodHlwZW9mIChhKSkge1xyXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6IHtcclxuXHRcdFx0XHR2YXIgcyA9IDxzdHJpbmc+YTtcclxuXHRcdFx0XHRpZiAocy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDsgLy8gbm8gdGltZSB6b25lXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGlmIChzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSA+PSAwKSB7XHJcblx0XHRcdFx0XHRcdGRzdCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRzID0gcy5zbGljZSgwLCBzLmluZGV4T2YoXCJ3aXRob3V0IERTVFwiKSAtIDEpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bmFtZSA9IFRpbWVab25lLl9ub3JtYWxpemVTdHJpbmcocyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwibnVtYmVyXCI6IHtcclxuXHRcdFx0XHR2YXIgb2Zmc2V0OiBudW1iZXIgPSA8bnVtYmVyPmE7XHJcblx0XHRcdFx0YXNzZXJ0KG9mZnNldCA+IC0yNCAqIDYwICYmIG9mZnNldCA8IDI0ICogNjAsIFwiVGltZVpvbmUuem9uZSgpOiBvZmZzZXQgb3V0IG9mIHJhbmdlXCIpO1xyXG5cdFx0XHRcdG5hbWUgPSBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhvZmZzZXQpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRpbWVab25lLnpvbmUoKTogVW5leHBlY3RlZCBhcmd1bWVudCB0eXBlIFxcXCJcIiArIHR5cGVvZiAoYSkgKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIFRpbWVab25lLl9maW5kT3JDcmVhdGUobmFtZSwgZHN0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERvIG5vdCB1c2UgdGhpcyBjb25zdHJ1Y3RvciwgdXNlIHRoZSBzdGF0aWNcclxuXHQgKiBUaW1lWm9uZS56b25lKCkgbWV0aG9kIGluc3RlYWQuXHJcblx0ICogQHBhcmFtIG5hbWUgTk9STUFMSVpFRCBuYW1lLCBhc3N1bWVkIHRvIGJlIGNvcnJlY3RcclxuXHQgKiBAcGFyYW0gZHN0XHRBZGhlcmUgdG8gRGF5bGlnaHQgU2F2aW5nIFRpbWUgaWYgYXBwbGljYWJsZSwgaWdub3JlZCBmb3IgbG9jYWwgdGltZSBhbmQgZml4ZWQgb2Zmc2V0c1xyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZHN0OiBib29sZWFuID0gdHJ1ZSkge1xyXG5cdFx0dGhpcy5fbmFtZSA9IG5hbWU7XHJcblx0XHR0aGlzLl9kc3QgPSBkc3Q7XHJcblx0XHRpZiAobmFtZSA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLkxvY2FsO1xyXG5cdFx0fSBlbHNlIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCIrXCIgfHwgbmFtZS5jaGFyQXQoMCkgPT09IFwiLVwiIHx8IG5hbWUuY2hhckF0KDApLm1hdGNoKC9cXGQvKSB8fCBuYW1lID09PSBcIlpcIikge1xyXG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLk9mZnNldDtcclxuXHRcdFx0dGhpcy5fb2Zmc2V0ID0gVGltZVpvbmUuc3RyaW5nVG9PZmZzZXQobmFtZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9raW5kID0gVGltZVpvbmVLaW5kLlByb3BlcjtcclxuXHRcdFx0YXNzZXJ0KFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5leGlzdHMobmFtZSksIHV0aWwuZm9ybWF0KFwiTm9uLWV4aXN0aW5nIHRpbWUgem9uZSBuYW1lICclcydcIiwgbmFtZSkpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWFrZXMgdGhpcyBjbGFzcyBhcHBlYXIgY2xvbmFibGUuIE5PVEUgYXMgdGltZSB6b25lIG9iamVjdHMgYXJlIGNhY2hlZCB5b3Ugd2lsbCBOT1RcclxuXHQgKiBhY3R1YWxseSBnZXQgYSBjbG9uZSBidXQgdGhlIHNhbWUgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBUaW1lWm9uZSB7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgaWRlbnRpZmllci4gQ2FuIGJlIGFuIG9mZnNldCBcIi0wMTozMFwiIG9yIGFuXHJcblx0ICogSUFOQSB0aW1lIHpvbmUgbmFtZSBcIkV1cm9wZS9BbXN0ZXJkYW1cIiwgb3IgXCJsb2NhbHRpbWVcIiBmb3JcclxuXHQgKiB0aGUgbG9jYWwgdGltZSB6b25lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBuYW1lKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkc3QoKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZHN0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtpbmQgb2YgdGltZSB6b25lIChMb2NhbC9PZmZzZXQvUHJvcGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBraW5kKCk6IFRpbWVab25lS2luZCB7XHJcblx0XHRyZXR1cm4gdGhpcy5fa2luZDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEVxdWFsaXR5IG9wZXJhdG9yLiBNYXBzIHplcm8gb2Zmc2V0cyBhbmQgZGlmZmVyZW50IG5hbWVzIGZvciBVVEMgb250b1xyXG5cdCAqIGVhY2ggb3RoZXIuIE90aGVyIHRpbWUgem9uZXMgYXJlIG5vdCBtYXBwZWQgb250byBlYWNoIG90aGVyLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlcXVhbHMob3RoZXI6IFRpbWVab25lKTogYm9vbGVhbiB7XHJcblx0XHRpZiAodGhpcy5pc1V0YygpICYmIG90aGVyLmlzVXRjKCkpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuTG9jYWwpO1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHJldHVybiAob3RoZXIua2luZCgpID09PSBUaW1lWm9uZUtpbmQuT2Zmc2V0ICYmIHRoaXMuX29mZnNldCA9PT0gb3RoZXIuX29mZnNldCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Qcm9wZXJcclxuXHRcdFx0XHQmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZVxyXG5cdFx0XHRcdCYmICh0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QgfHwgIXRoaXMuaGFzRHN0KCkpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRpbWUgem9uZSBraW5kLlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgd2VyZSBpZGVudGljYWwsIHNvIFVUQyAhPT0gR01UXHJcblx0ICovXHJcblx0cHVibGljIGlkZW50aWNhbChvdGhlcjogVGltZVpvbmUpOiBib29sZWFuIHtcclxuXHRcdHN3aXRjaCAodGhpcy5fa2luZCkge1xyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Mb2NhbDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5Mb2NhbCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDogcmV0dXJuIChvdGhlci5raW5kKCkgPT09IFRpbWVab25lS2luZC5PZmZzZXQgJiYgdGhpcy5fb2Zmc2V0ID09PSBvdGhlci5fb2Zmc2V0KTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiByZXR1cm4gKG90aGVyLmtpbmQoKSA9PT0gVGltZVpvbmVLaW5kLlByb3BlciAmJiB0aGlzLl9uYW1lID09PSBvdGhlci5fbmFtZSAmJiB0aGlzLl9kc3QgPT09IG90aGVyLl9kc3QpO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdGltZSB6b25lIGtpbmQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIElzIHRoaXMgem9uZSBlcXVpdmFsZW50IHRvIFVUQz9cclxuXHQgKi9cclxuXHRwdWJsaWMgaXNVdGMoKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gKHRoaXMuX29mZnNldCA9PT0gMCk7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuem9uZUlzVXRjKHRoaXMuX25hbWUpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERvZXMgdGhpcyB6b25lIGhhdmUgRGF5bGlnaHQgU2F2aW5nIFRpbWUgYXQgYWxsP1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNEc3QoKTogYm9vbGVhbiB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHJldHVybiBmYWxzZTtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiByZXR1cm4gZmFsc2U7XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3BlcjogcmV0dXJuIChUekRhdGFiYXNlLmluc3RhbmNlKCkuaGFzRHN0KHRoaXMuX25hbWUpKTtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgZnJvbSBhIFVUQyB0aW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHllYXIgRnVsbCB5ZWFyXHJcblx0ICogQHBhcmFtIG1vbnRoIE1vbnRoIDEtMTIgKG5vdGUgdGhpcyBkZXZpYXRlcyBmcm9tIEphdmFTY3JpcHQgZGF0ZSlcclxuXHQgKiBAcGFyYW0gZGF5IERheSBvZiBtb250aCAxLTMxXHJcblx0ICogQHBhcmFtIGhvdXIgSG91ciAwLTIzXHJcblx0ICogQHBhcmFtIG1pbnV0ZSBNaW51dGUgMC01OVxyXG5cdCAqIEBwYXJhbSBzZWNvbmQgU2Vjb25kIDAtNTlcclxuXHQgKiBAcGFyYW0gbWlsbGlzZWNvbmQgTWlsbGlzZWNvbmQgMC05OTlcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBvZiB0aGlzIHRpbWUgem9uZSB3aXRoIHJlc3BlY3QgdG8gVVRDIGF0IHRoZSBnaXZlbiB0aW1lLCBpbiBtaW51dGVzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXRGb3JVdGMoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsXHJcblx0XHRtaWxsaXNlY29uZDogbnVtYmVyID0gMCk6IG51bWJlciB7XHJcblx0XHRhc3NlcnQobW9udGggPiAwICYmIG1vbnRoIDwgMTMsIFwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjKCk6ICBtb250aCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KGRheSA+IDAgJiYgZGF5IDwgMzIsIFwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjKCk6ICBkYXkgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdGFzc2VydChob3VyID49IDAgJiYgaG91ciA8IDI0LCBcIlRpbWVab25lLm9mZnNldEZvclV0YygpOiAgaG91ciBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8IDYwLCBcIlRpbWVab25lLm9mZnNldEZvclV0YygpOiAgbWludXRlIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRhc3NlcnQoc2Vjb25kID49IDAgJiYgc2Vjb25kIDwgNjAsIFwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjKCk6ICBzZWNvbmQgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdGFzc2VydChtaWxsaXNlY29uZCA+PSAwICYmIG1pbGxpc2Vjb25kIDwgMTAwMCwgXCJUaW1lWm9uZS5vZmZzZXRGb3JVdGMoKTogIG1pbGxpc2Vjb25kIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHR2YXIgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQpKTtcclxuXHRcdFx0XHRyZXR1cm4gLTEgKiBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuT2Zmc2V0OiB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5Qcm9wZXI6IHtcclxuXHRcdFx0XHR2YXIgdG06IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh5ZWFyLCBtb250aCwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQpO1xyXG5cdFx0XHRcdGlmICh0aGlzLl9kc3QpIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkudG90YWxPZmZzZXQodGhpcy5fbmFtZSwgdG0udG9Vbml4Tm9MZWFwU2VjcygpKS5taW51dGVzKCk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBUekRhdGFiYXNlLmluc3RhbmNlKCkuc3RhbmRhcmRPZmZzZXQodGhpcy5fbmFtZSwgdG0udG9Vbml4Tm9MZWFwU2VjcygpKS5taW51dGVzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBUaW1lWm9uZUtpbmQgXFxcIlwiICsgVGltZVpvbmVLaW5kW3RoaXMuX2tpbmRdICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZSB0aW1lem9uZSBvZmZzZXQgZnJvbSBhIHpvbmUtbG9jYWwgdGltZSAoTk9UIGEgVVRDIHRpbWUpLlxyXG5cdCAqIEBwYXJhbSB5ZWFyIGxvY2FsIGZ1bGwgeWVhclxyXG5cdCAqIEBwYXJhbSBtb250aCBsb2NhbCBtb250aCAxLTEyIChub3RlIHRoaXMgZGV2aWF0ZXMgZnJvbSBKYXZhU2NyaXB0IGRhdGUpXHJcblx0ICogQHBhcmFtIGRheSBsb2NhbCBkYXkgb2YgbW9udGggMS0zMVxyXG5cdCAqIEBwYXJhbSBob3VyIGxvY2FsIGhvdXIgMC0yM1xyXG5cdCAqIEBwYXJhbSBtaW51dGUgbG9jYWwgbWludXRlIDAtNTlcclxuXHQgKiBAcGFyYW0gc2Vjb25kIGxvY2FsIHNlY29uZCAwLTU5XHJcblx0ICogQHBhcmFtIG1pbGxpc2Vjb25kIGxvY2FsIG1pbGxpc2Vjb25kIDAtOTk5XHJcblx0ICogQHJldHVybiB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZSB6b25lIHdpdGggcmVzcGVjdCB0byBVVEMgYXQgdGhlIGdpdmVuIHRpbWUsIGluIG1pbnV0ZXMuXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldEZvclpvbmUoXHJcblx0XHR5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsXHJcblx0XHRtaWxsaXNlY29uZDogbnVtYmVyID0gMCk6IG51bWJlciB7XHJcblx0XHRhc3NlcnQobW9udGggPiAwICYmIG1vbnRoIDwgMTMsIFwiVGltZVpvbmUub2Zmc2V0Rm9yWm9uZSgpOiAgbW9udGggb3V0IG9mIHJhbmdlOiBcIiArIG1vbnRoKTtcclxuXHRcdGFzc2VydChkYXkgPiAwICYmIGRheSA8IDMyLCBcIlRpbWVab25lLm9mZnNldEZvclpvbmUoKTogIGRheSBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KGhvdXIgPj0gMCAmJiBob3VyIDwgMjQsIFwiVGltZVpvbmUub2Zmc2V0Rm9yWm9uZSgpOiAgaG91ciBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8IDYwLCBcIlRpbWVab25lLm9mZnNldEZvclpvbmUoKTogIG1pbnV0ZSBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KHNlY29uZCA+PSAwICYmIHNlY29uZCA8IDYwLCBcIlRpbWVab25lLm9mZnNldEZvclpvbmUoKTogIHNlY29uZCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KG1pbGxpc2Vjb25kID49IDAgJiYgbWlsbGlzZWNvbmQgPCAxMDAwLCBcIlRpbWVab25lLm9mZnNldEZvclpvbmUoKTogIG1pbGxpc2Vjb25kIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHR2YXIgZGF0ZTogRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoIC0gMSwgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmQpO1xyXG5cdFx0XHRcdHJldHVybiAtMSAqIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVab25lS2luZC5PZmZzZXQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0O1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLlByb3Blcjoge1xyXG5cdFx0XHRcdC8vIG5vdGUgdGhhdCBUekRhdGFiYXNlIG5vcm1hbGl6ZXMgdGhlIGdpdmVuIGRhdGUgc28gd2UgZG9uJ3QgaGF2ZSB0byBkbyBpdFxyXG5cdFx0XHRcdHZhciB0bTogVGltZVN0cnVjdCA9IG5ldyBUaW1lU3RydWN0KHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZCk7XHJcblx0XHRcdFx0aWYgKHRoaXMuX2RzdCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS50b3RhbE9mZnNldExvY2FsKHRoaXMuX25hbWUsIHRtLnRvVW5peE5vTGVhcFNlY3MoKSkubWludXRlcygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLnN0YW5kYXJkT2Zmc2V0KHRoaXMuX25hbWUsIHRtLnRvVW5peE5vTGVhcFNlY3MoKSkubWludXRlcygpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gVGltZVpvbmVLaW5kIFxcXCJcIiArIFRpbWVab25lS2luZFt0aGlzLl9raW5kXSArIFwiXFxcIlwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3RlOiB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAyLjAuMFxyXG5cdCAqXHJcblx0ICogQ29udmVuaWVuY2UgZnVuY3Rpb24sIHRha2VzIHZhbHVlcyBmcm9tIGEgSmF2YXNjcmlwdCBEYXRlXHJcblx0ICogQ2FsbHMgb2Zmc2V0Rm9yVXRjKCkgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBkYXRlOiB0aGUgZGF0ZVxyXG5cdCAqIEBwYXJhbSBmdW5jczogdGhlIHNldCBvZiBmdW5jdGlvbnMgdG8gdXNlOiBnZXQoKSBvciBnZXRVVEMoKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBvZmZzZXRGb3JVdGNEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcclxuXHRcdHN3aXRjaCAoZnVuY3MpIHtcclxuXHRcdFx0Y2FzZSBEYXRlRnVuY3Rpb25zLkdldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLm9mZnNldEZvclV0YyhcclxuXHRcdFx0XHRcdGRhdGUuZ2V0RnVsbFllYXIoKSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0TW9udGgoKSArIDEsXHJcblx0XHRcdFx0XHRkYXRlLmdldERhdGUoKSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0SG91cnMoKSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0TWludXRlcygpLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRTZWNvbmRzKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldE1pbGxpc2Vjb25kcygpKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIERhdGVGdW5jdGlvbnMuR2V0VVRDOiB7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMub2Zmc2V0Rm9yVXRjKFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRVVENGdWxsWWVhcigpLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRVVENNb250aCgpICsgMSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0VVRDRGF0ZSgpLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRVVENIb3VycygpLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRVVENNaW51dGVzKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldFVUQ1NlY29uZHMoKSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0VVRDTWlsbGlzZWNvbmRzKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBEYXRlRnVuY3Rpb25zIHZhbHVlXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vdGU6IHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDIuMC4wXHJcblx0ICpcclxuXHQgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiwgdGFrZXMgdmFsdWVzIGZyb20gYSBKYXZhc2NyaXB0IERhdGVcclxuXHQgKiBDYWxscyBvZmZzZXRGb3JVdGMoKSB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgZGF0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGRhdGU6IHRoZSBkYXRlXHJcblx0ICogQHBhcmFtIGZ1bmNzOiB0aGUgc2V0IG9mIGZ1bmN0aW9ucyB0byB1c2U6IGdldCgpIG9yIGdldFVUQygpXHJcblx0ICovXHJcblx0cHVibGljIG9mZnNldEZvclpvbmVEYXRlKGRhdGU6IERhdGUsIGZ1bmNzOiBEYXRlRnVuY3Rpb25zKTogbnVtYmVyIHtcclxuXHRcdHN3aXRjaCAoZnVuY3MpIHtcclxuXHRcdFx0Y2FzZSBEYXRlRnVuY3Rpb25zLkdldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoXHJcblx0XHRcdFx0XHRkYXRlLmdldEZ1bGxZZWFyKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldE1vbnRoKCkgKyAxLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXREYXRlKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldEhvdXJzKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldE1pbnV0ZXMoKSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0U2Vjb25kcygpLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBEYXRlRnVuY3Rpb25zLkdldFVUQzoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLm9mZnNldEZvclpvbmUoXHJcblx0XHRcdFx0XHRkYXRlLmdldFVUQ0Z1bGxZZWFyKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldFVUQ01vbnRoKCkgKyAxLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRVVENEYXRlKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldFVUQ0hvdXJzKCksXHJcblx0XHRcdFx0XHRkYXRlLmdldFVUQ01pbnV0ZXMoKSxcclxuXHRcdFx0XHRcdGRhdGUuZ2V0VVRDU2Vjb25kcygpLFxyXG5cdFx0XHRcdFx0ZGF0ZS5nZXRVVENNaWxsaXNlY29uZHMoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIERhdGVGdW5jdGlvbnMgdmFsdWVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogWm9uZSBhYmJyZXZpYXRpb24gYXQgZ2l2ZW4gVVRDIHRpbWVzdGFtcCBlLmcuIENFU1QgZm9yIENlbnRyYWwgRXVyb3BlYW4gU3VtbWVyIFRpbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhciBGdWxsIHllYXJcclxuXHQgKiBAcGFyYW0gbW9udGggTW9udGggMS0xMiAobm90ZSB0aGlzIGRldmlhdGVzIGZyb20gSmF2YVNjcmlwdCBkYXRlKVxyXG5cdCAqIEBwYXJhbSBkYXkgRGF5IG9mIG1vbnRoIDEtMzFcclxuXHQgKiBAcGFyYW0gaG91ciBIb3VyIDAtMjNcclxuXHQgKiBAcGFyYW0gbWludXRlIE1pbnV0ZSAwLTU5XHJcblx0ICogQHBhcmFtIHNlY29uZCBTZWNvbmQgMC01OVxyXG5cdCAqIEBwYXJhbSBtaWxsaXNlY29uZCBNaWxsaXNlY29uZCAwLTk5OVxyXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gXCJsb2NhbFwiIGZvciBsb2NhbCB0aW1lem9uZSwgdGhlIG9mZnNldCBmb3IgYW4gb2Zmc2V0IHpvbmUsIG9yIHRoZSBhYmJyZXZpYXRpb24gZm9yIGEgcHJvcGVyIHpvbmUuXHJcblx0ICovXHJcblx0cHVibGljIGFiYnJldmlhdGlvbkZvclV0Yyh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRheTogbnVtYmVyLFxyXG5cdFx0aG91cjogbnVtYmVyID0gMCwgbWludXRlOiBudW1iZXIgPSAwLCBzZWNvbmQ6IG51bWJlciA9IDAsXHJcblx0XHRtaWxsaXNlY29uZDogbnVtYmVyID0gMCwgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHRhc3NlcnQobW9udGggPiAwICYmIG1vbnRoIDwgMTMsIFwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjKCk6ICBtb250aCBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KGRheSA+IDAgJiYgZGF5IDwgMzIsIFwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjKCk6ICBkYXkgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdGFzc2VydChob3VyID49IDAgJiYgaG91ciA8IDI0LCBcIlRpbWVab25lLm9mZnNldEZvclV0YygpOiAgaG91ciBvdXQgb2YgcmFuZ2UuXCIpO1xyXG5cdFx0YXNzZXJ0KG1pbnV0ZSA+PSAwICYmIG1pbnV0ZSA8IDYwLCBcIlRpbWVab25lLm9mZnNldEZvclV0YygpOiAgbWludXRlIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRhc3NlcnQoc2Vjb25kID49IDAgJiYgc2Vjb25kIDwgNjAsIFwiVGltZVpvbmUub2Zmc2V0Rm9yVXRjKCk6ICBzZWNvbmQgb3V0IG9mIHJhbmdlLlwiKTtcclxuXHRcdGFzc2VydChtaWxsaXNlY29uZCA+PSAwICYmIG1pbGxpc2Vjb25kIDwgMTAwMCwgXCJUaW1lWm9uZS5vZmZzZXRGb3JVdGMoKTogIG1pbGxpc2Vjb25kIG91dCBvZiByYW5nZS5cIik7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX2tpbmQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuTG9jYWw6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJsb2NhbFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVpvbmVLaW5kLk9mZnNldDoge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lWm9uZUtpbmQuUHJvcGVyOiB7XHJcblx0XHRcdFx0dmFyIHRtOiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kKTtcclxuXHRcdFx0XHRyZXR1cm4gVHpEYXRhYmFzZS5pbnN0YW5jZSgpLmFiYnJldmlhdGlvbih0aGlzLl9uYW1lLCB0bS50b1VuaXhOb0xlYXBTZWNzKCksIGRzdERlcGVuZGVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIFRpbWVab25lS2luZCBcXFwiXCIgKyBUaW1lWm9uZUtpbmRbdGhpcy5fa2luZF0gKyBcIlxcXCJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplcyBub24tZXhpc3RpbmcgbG9jYWwgdGltZXMgYnkgYWRkaW5nIGEgZm9yd2FyZCBvZmZzZXQgY2hhbmdlLlxyXG5cdCAqIER1cmluZyBhIGZvcndhcmQgc3RhbmRhcmQgb2Zmc2V0IGNoYW5nZSBvciBEU1Qgb2Zmc2V0IGNoYW5nZSwgc29tZSBhbW91bnQgb2ZcclxuXHQgKiBsb2NhbCB0aW1lIGlzIHNraXBwZWQuIFRoZXJlZm9yZSwgdGhpcyBhbW91bnQgb2YgbG9jYWwgdGltZSBkb2VzIG5vdCBleGlzdC5cclxuXHQgKiBUaGlzIGZ1bmN0aW9uIGFkZHMgdGhlIGFtb3VudCBvZiBmb3J3YXJkIGNoYW5nZSB0byBhbnkgbm9uLWV4aXN0aW5nIHRpbWUuIEFmdGVyIGFsbCxcclxuXHQgKiB0aGlzIGlzIHByb2JhYmx5IHdoYXQgdGhlIHVzZXIgbWVhbnQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gbG9jYWxVbml4TWlsbGlzXHRVbml4IHRpbWVzdGFtcCBpbiB6b25lIHRpbWVcclxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuc1x0VW5peCB0aW1lc3RhbXAgaW4gem9uZSB0aW1lLCBub3JtYWxpemVkLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBub3JtYWxpemVab25lVGltZShsb2NhbFVuaXhNaWxsaXM6IG51bWJlciwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcblx0XHRcdHZhciB0em9wdDogdHpEYXRhYmFzZS5Ob3JtYWxpemVPcHRpb24gPVxyXG5cdFx0XHRcdChvcHQgPT09IE5vcm1hbGl6ZU9wdGlvbi5Eb3duID8gdHpEYXRhYmFzZS5Ob3JtYWxpemVPcHRpb24uRG93biA6IHR6RGF0YWJhc2UuTm9ybWFsaXplT3B0aW9uLlVwKTtcclxuXHRcdFx0cmV0dXJuIFR6RGF0YWJhc2UuaW5zdGFuY2UoKS5ub3JtYWxpemVMb2NhbCh0aGlzLl9uYW1lLCBsb2NhbFVuaXhNaWxsaXMsIHR6b3B0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBsb2NhbFVuaXhNaWxsaXM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdGltZSB6b25lIGlkZW50aWZpZXIgKG5vcm1hbGl6ZWQpLlxyXG5cdCAqIEVpdGhlciBcImxvY2FsdGltZVwiLCBJQU5BIG5hbWUsIG9yIFwiK2hoOm1tXCIgb2Zmc2V0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMubmFtZSgpO1xyXG5cdFx0aWYgKHRoaXMua2luZCgpID09PSBUaW1lWm9uZUtpbmQuUHJvcGVyKSB7XHJcblx0XHRcdGlmICh0aGlzLmhhc0RzdCgpICYmICF0aGlzLmRzdCgpKSB7XHJcblx0XHRcdFx0cmVzdWx0ICs9IFwiIHdpdGhvdXQgRFNUXCI7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVc2VkIGJ5IHV0aWwuaW5zcGVjdCgpXHJcblx0ICovXHJcblx0aW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW1RpbWVab25lOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29udmVydCBhbiBvZmZzZXQgbnVtYmVyIGludG8gYW4gb2Zmc2V0IHN0cmluZ1xyXG5cdCAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCBpbiBtaW51dGVzIGZyb20gVVRDIGUuZy4gOTAgbWludXRlc1xyXG5cdCAqIEByZXR1cm4gdGhlIG9mZnNldCBpbiBJU08gbm90YXRpb24gXCIrMDE6MzBcIiBmb3IgKzkwIG1pbnV0ZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG9mZnNldFRvU3RyaW5nKG9mZnNldDogbnVtYmVyKTogc3RyaW5nIHtcclxuXHRcdHZhciBzaWduID0gKG9mZnNldCA8IDAgPyBcIi1cIiA6IFwiK1wiKTtcclxuXHRcdHZhciBob3VycyA9IE1hdGguZmxvb3IoTWF0aC5hYnMob2Zmc2V0KSAvIDYwKTtcclxuXHRcdHZhciBtaW51dGVzID0gTWF0aC5mbG9vcihNYXRoLmFicyhvZmZzZXQpICUgNjApO1xyXG5cdFx0cmV0dXJuIHNpZ24gKyBzdHJpbmdzLnBhZExlZnQoaG91cnMudG9TdHJpbmcoMTApLCAyLCBcIjBcIikgKyBcIjpcIiArIHN0cmluZ3MucGFkTGVmdChtaW51dGVzLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3RyaW5nIHRvIG9mZnNldCBjb252ZXJzaW9uLlxyXG5cdCAqIEBwYXJhbSBzXHRGb3JtYXRzOiBcIi0wMTowMFwiLCBcIi0wMTAwXCIsIFwiLTAxXCIsIFwiWlwiXHJcblx0ICogQHJldHVybiBvZmZzZXQgdy5yLnQuIFVUQyBpbiBtaW51dGVzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBzdHJpbmdUb09mZnNldChzOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdFx0dmFyIHQgPSBzLnRyaW0oKTtcclxuXHRcdC8vIGVhc3kgY2FzZVxyXG5cdFx0aWYgKHQgPT09IFwiWlwiKSB7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fVxyXG5cdFx0Ly8gY2hlY2sgdGhhdCB0aGUgcmVtYWluZGVyIGNvbmZvcm1zIHRvIElTTyB0aW1lIHpvbmUgc3BlY1xyXG5cdFx0YXNzZXJ0KHQubWF0Y2goL15bKy1dXFxkXFxkKDo/KVxcZFxcZCQvKSB8fCB0Lm1hdGNoKC9eWystXVxcZFxcZCQvKSwgXCJXcm9uZyB0aW1lIHpvbmUgZm9ybWF0OiBcXFwiXCIgKyB0ICsgXCJcXFwiXCIpO1xyXG5cdFx0dmFyIHNpZ246IG51bWJlciA9ICh0LmNoYXJBdCgwKSA9PT0gXCIrXCIgPyAxIDogLTEpO1xyXG5cdFx0dmFyIGhvdXJzOiBudW1iZXIgPSBwYXJzZUludCh0LnN1YnN0cigxLCAyKSwgMTApO1xyXG5cdFx0dmFyIG1pbnV0ZXM6IG51bWJlciA9IDA7XHJcblx0XHRpZiAodC5sZW5ndGggPT09IDUpIHtcclxuXHRcdFx0bWludXRlcyA9IHBhcnNlSW50KHQuc3Vic3RyKDMsIDIpLCAxMCk7XHJcblx0XHR9IGVsc2UgaWYgKHQubGVuZ3RoID09PSA2KSB7XHJcblx0XHRcdG1pbnV0ZXMgPSBwYXJzZUludCh0LnN1YnN0cig0LCAyKSwgMTApO1xyXG5cdFx0fVxyXG5cdFx0YXNzZXJ0KGhvdXJzID49IDAgJiYgaG91cnMgPCAyNCwgXCJPZmZzZXRzIGZyb20gVVRDIG11c3QgYmUgbGVzcyB0aGFuIGEgZGF5LlwiKTtcclxuXHRcdHJldHVybiBzaWduICogKGhvdXJzICogNjAgKyBtaW51dGVzKTtcclxuXHR9XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBUaW1lIHpvbmUgY2FjaGUuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogVGltZVpvbmUgfSA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBGaW5kIGluIGNhY2hlIG9yIGNyZWF0ZSB6b25lXHJcblx0ICogQHBhcmFtIG5hbWVcdFRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGRzdFx0QWRoZXJlIHRvIERheWxpZ2h0IFNhdmluZyBUaW1lP1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9maW5kT3JDcmVhdGUobmFtZTogc3RyaW5nLCBkc3Q6IGJvb2xlYW4pOiBUaW1lWm9uZSB7XHJcblx0XHR2YXIga2V5ID0gbmFtZSArIChkc3QgPyBcIl9EU1RcIiA6IFwiX05PLURTVFwiKTtcclxuXHRcdGlmIChrZXkgaW4gVGltZVpvbmUuX2NhY2hlKSB7XHJcblx0XHRcdHJldHVybiBUaW1lWm9uZS5fY2FjaGVba2V5XTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciB0ID0gbmV3IFRpbWVab25lKG5hbWUsIGRzdCk7XHJcblx0XHRcdFRpbWVab25lLl9jYWNoZVtrZXldID0gdDtcclxuXHRcdFx0cmV0dXJuIHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgZm9yIGFcclxuXHQgKiBjYWNoZSBsb29rdXBcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfbm9ybWFsaXplU3RyaW5nKHM6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHR2YXIgdDogc3RyaW5nID0gcy50cmltKCk7XHJcblx0XHRhc3NlcnQodC5sZW5ndGggPiAwLCBcIkVtcHR5IHRpbWUgem9uZSBzdHJpbmcgZ2l2ZW5cIik7XHJcblx0XHRpZiAodCA9PT0gXCJsb2NhbHRpbWVcIikge1xyXG5cdFx0XHRyZXR1cm4gdDtcclxuXHRcdH0gZWxzZSBpZiAodCA9PT0gXCJaXCIpIHtcclxuXHRcdFx0cmV0dXJuIFwiKzAwOjAwXCI7XHJcblx0XHR9IGVsc2UgaWYgKFRpbWVab25lLl9pc09mZnNldFN0cmluZyh0KSkge1xyXG5cdFx0XHQvLyBvZmZzZXQgc3RyaW5nXHJcblx0XHRcdC8vIG5vcm1hbGl6ZSBieSBjb252ZXJ0aW5nIGJhY2sgYW5kIGZvcnRoXHJcblx0XHRcdHJldHVybiBUaW1lWm9uZS5vZmZzZXRUb1N0cmluZyhUaW1lWm9uZS5zdHJpbmdUb09mZnNldCh0KSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBPbHNlbiBUWiBkYXRhYmFzZSBuYW1lXHJcblx0XHRcdHJldHVybiB0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2lzT2Zmc2V0U3RyaW5nKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0dmFyIHQgPSBzLnRyaW0oKTtcclxuXHRcdHJldHVybiAodC5jaGFyQXQoMCkgPT09IFwiK1wiIHx8IHQuY2hhckF0KDApID09PSBcIi1cIiB8fCB0ID09PSBcIlpcIik7XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
