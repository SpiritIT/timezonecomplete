/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time duration
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var basics = require("./basics");
var strings = require("./strings");
/**
 * Construct a time duration
 * @param n	Number of hours (may be fractional or negative)
 * @return A duration of n hours
 */
function hours(n) {
    return Duration.hours(n);
}
exports.hours = hours;
/**
 * Construct a time duration
 * @param n	Number of minutes (may be fractional or negative)
 * @return A duration of n minutes
 */
function minutes(n) {
    return Duration.minutes(n);
}
exports.minutes = minutes;
/**
 * Construct a time duration
 * @param n	Number of seconds (may be fractional or negative)
 * @return A duration of n seconds
 */
function seconds(n) {
    return Duration.seconds(n);
}
exports.seconds = seconds;
/**
 * Construct a time duration
 * @param n	Number of milliseconds (may be fractional or negative)
 * @return A duration of n milliseconds
 */
function milliseconds(n) {
    return Duration.milliseconds(n);
}
exports.milliseconds = milliseconds;
/**
 * Time duration. Create one e.g. like this: var d = Duration.hours(1).
 * Note that time durations do not take leap seconds etc. into account:
 * one hour is simply represented as 3600000 milliseconds.
 */
var Duration = (function () {
    /**
     * Constructor implementation
     */
    function Duration(i1, unit) {
        if (typeof (i1) === "number") {
            if (typeof (unit) === "number") {
                this._milliseconds = Math.round(Math.abs(basics.timeUnitToMilliseconds(unit) * i1));
                this._sign = (i1 < 0 ? -1 : 1);
            }
            else {
                this._milliseconds = Math.round(Math.abs(i1));
                this._sign = (i1 < 0 ? -1 : 1);
            }
        }
        else {
            if (typeof (i1) === "string") {
                this._fromString(i1);
            }
            else {
                this._milliseconds = 0;
                this._sign = 1;
            }
        }
    }
    /**
     * Construct a time duration
     * @param n	Number of hours (may be fractional or negative)
     * @return A duration of n hours
     */
    Duration.hours = function (n) {
        return new Duration(n * 3600000);
    };
    /**
     * Construct a time duration
     * @param n	Number of minutes (may be fractional or negative)
     * @return A duration of n minutes
     */
    Duration.minutes = function (n) {
        return new Duration(n * 60000);
    };
    /**
     * Construct a time duration
     * @param n	Number of seconds (may be fractional or negative)
     * @return A duration of n seconds
     */
    Duration.seconds = function (n) {
        return new Duration(n * 1000);
    };
    /**
     * Construct a time duration
     * @param n	Number of milliseconds (may be fractional or negative)
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
     * @return True iff (this <= other)
     */
    Duration.prototype.lessEqual = function (other) {
        return this.milliseconds() <= other.milliseconds();
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
     * @return True iff this >= other
     */
    Duration.prototype.greaterEqual = function (other) {
        return this.milliseconds() >= other.milliseconds();
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
    /**
     * The valueOf() method returns the primitive value of the specified object.
     */
    Duration.prototype.valueOf = function () {
        return this.milliseconds();
    };
    Duration.prototype._toString = function (full) {
        var result = "";
        if (full || this.millisecond() > 0) {
            result = "." + strings.padLeft(this.millisecond().toString(10), 3, "0");
        }
        if (full || result.length > 0 || this.second() > 0) {
            result = ":" + strings.padLeft(this.second().toString(10), 2, "0") + result;
        }
        if (full || result.length > 0 || this.minute() > 0) {
            result = ":" + strings.padLeft(this.minute().toString(10), 2, "0") + result;
        }
        return this.sign() + strings.padLeft(this.wholeHours().toString(10), 2, "0") + result;
    };
    Duration.prototype._fromString = function (s) {
        var trimmed = s.trim();
        assert(trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/), "Not a proper time duration string: \"" + trimmed + "\"");
        var sign = 1;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;
        var milliseconds = 0;
        var parts = trimmed.split(":");
        assert(parts.length > 0 && parts.length < 4, "Not a proper time duration string: \"" + trimmed + "\"");
        if (trimmed.charAt(0) === "-") {
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
                milliseconds = +strings.padRight(secondParts[1], 3, "0");
            }
        }
        this._milliseconds = Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
        this._sign = sign;
    };
    return Duration;
})();
exports.Duration = Duration;
;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImR1cmF0aW9uLnRzIl0sIm5hbWVzIjpbImhvdXJzIiwibWludXRlcyIsInNlY29uZHMiLCJtaWxsaXNlY29uZHMiLCJEdXJhdGlvbiIsIkR1cmF0aW9uLmNvbnN0cnVjdG9yIiwiRHVyYXRpb24uaG91cnMiLCJEdXJhdGlvbi5taW51dGVzIiwiRHVyYXRpb24uc2Vjb25kcyIsIkR1cmF0aW9uLm1pbGxpc2Vjb25kcyIsIkR1cmF0aW9uLmNsb25lIiwiRHVyYXRpb24ubWlsbGlzZWNvbmQiLCJEdXJhdGlvbi5zZWNvbmQiLCJEdXJhdGlvbi5taW51dGUiLCJEdXJhdGlvbi53aG9sZUhvdXJzIiwiRHVyYXRpb24uc2lnbiIsIkR1cmF0aW9uLmxlc3NUaGFuIiwiRHVyYXRpb24ubGVzc0VxdWFsIiwiRHVyYXRpb24uZXF1YWxzIiwiRHVyYXRpb24uZ3JlYXRlclRoYW4iLCJEdXJhdGlvbi5ncmVhdGVyRXF1YWwiLCJEdXJhdGlvbi5taW4iLCJEdXJhdGlvbi5tYXgiLCJEdXJhdGlvbi5tdWx0aXBseSIsIkR1cmF0aW9uLmRpdmlkZSIsIkR1cmF0aW9uLmFkZCIsIkR1cmF0aW9uLnN1YiIsIkR1cmF0aW9uLnRvRnVsbFN0cmluZyIsIkR1cmF0aW9uLnRvU3RyaW5nIiwiRHVyYXRpb24uaW5zcGVjdCIsIkR1cmF0aW9uLnZhbHVlT2YiLCJEdXJhdGlvbi5fdG9TdHJpbmciLCJEdXJhdGlvbi5fZnJvbVN0cmluZyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILEFBRUEsMkNBRjJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBR3BDLElBQU8sT0FBTyxXQUFXLFdBQVcsQ0FBQyxDQUFDO0FBR3RDLEFBS0E7Ozs7R0FERztTQUNhLEtBQUssQ0FBQyxDQUFTO0lBQzlCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFD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QUtBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3pDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSx1Q0FBdUNBLEdBQUdBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZHQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQkEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDVkEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxLQUFLQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE9BQU9BLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsSUFBSUEsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE9BQU9BLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLFlBQVlBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1lBQzFEQSxDQUFDQTtRQUNGQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxHQUFHQSxPQUFPQSxHQUFHQSxLQUFLQSxHQUFHQSxPQUFPQSxHQUFHQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNuR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbkJBLENBQUNBO0lBQ0Y1QixlQUFDQTtBQUFEQSxDQXRWQSxBQXNWQ0EsSUFBQTtBQXRWWSxnQkFBUSxHQUFSLFFBc1ZaLENBQUE7QUFBQSxDQUFDIiwiZmlsZSI6ImxpYi9kdXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19