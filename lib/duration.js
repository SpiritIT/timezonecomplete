/**
* Copyright(c) 2014 Spirit IT BV
*
* Time duration
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

var strings = require("./strings");

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
//# sourceMappingURL=duration.js.map
