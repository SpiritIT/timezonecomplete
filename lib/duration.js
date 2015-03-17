/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time duration
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var basics = require("./basics");
var TimeUnit = basics.TimeUnit;
var strings = require("./strings");
/**
 * Construct a time duration
 * @param n	Number of years (may be fractional or negative)
 * @return A duration of n years
 */
function years(n) {
    return Duration.years(n);
}
exports.years = years;
/**
 * Construct a time duration
 * @param n	Number of months (may be fractional or negative)
 * @return A duration of n months
 */
function months(n) {
    return Duration.months(n);
}
exports.months = months;
/**
 * Construct a time duration
 * @param n	Number of days (may be fractional or negative)
 * @return A duration of n days
 */
function days(n) {
    return Duration.days(n);
}
exports.days = days;
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
 * Time duration which is represented as an amount and a unit e.g.
 * '1 Month' or '166 Seconds'. The unit is preserved through calculations.
 *
 * It has two sets of getter functions:
 * - second(), minute(), hour() etc, singular form: these can be used to create string representations.
 *   These return a part of your string representation. E.g. for 2500 milliseconds, the millisecond() part would be 500
 * - seconds(), minutes(), hours() etc, plural form: these return the total amount represented in the corresponding unit.
 */
var Duration = (function () {
    /**
     * Constructor implementation
     */
    function Duration(i1, unit) {
        if (typeof (i1) === "number") {
            // amount+unit constructor
            var amount = i1;
            this._amount = amount;
            this._unit = (typeof unit === "number" ? unit : 0 /* Millisecond */);
        }
        else if (typeof (i1) === "string") {
            // string constructor
            this._fromString(i1);
        }
        else {
            // default constructor
            this._amount = 0;
            this._unit = 0 /* Millisecond */;
        }
    }
    /**
     * Construct a time duration
     * @param n	Number of years (may be fractional or negative)
     * @return A duration of n years
     */
    Duration.years = function (n) {
        return new Duration(n, 7 /* Year */);
    };
    /**
     * Construct a time duration
     * @param n	Number of months (may be fractional or negative)
     * @return A duration of n months
     */
    Duration.months = function (n) {
        return new Duration(n, 6 /* Month */);
    };
    /**
     * Construct a time duration
     * @param n	Number of days (may be fractional or negative)
     * @return A duration of n days
     */
    Duration.days = function (n) {
        return new Duration(n, 4 /* Day */);
    };
    /**
     * Construct a time duration
     * @param n	Number of hours (may be fractional or negative)
     * @return A duration of n hours
     */
    Duration.hours = function (n) {
        return new Duration(n, 3 /* Hour */);
    };
    /**
     * Construct a time duration
     * @param n	Number of minutes (may be fractional or negative)
     * @return A duration of n minutes
     */
    Duration.minutes = function (n) {
        return new Duration(n, 2 /* Minute */);
    };
    /**
     * Construct a time duration
     * @param n	Number of seconds (may be fractional or negative)
     * @return A duration of n seconds
     */
    Duration.seconds = function (n) {
        return new Duration(n, 1 /* Second */);
    };
    /**
     * Construct a time duration
     * @param n	Number of milliseconds (may be fractional or negative)
     * @return A duration of n milliseconds
     */
    Duration.milliseconds = function (n) {
        return new Duration(n, 0 /* Millisecond */);
    };
    /**
     * @return another instance of Duration with the same value.
     */
    Duration.prototype.clone = function () {
        return new Duration(this._amount, this._unit);
    };
    /**
     * Returns this duration expressed in different unit (positive or negative, fractional).
     * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
     * It is approximate for any other conversion
     */
    Duration.prototype.as = function (unit) {
        if (this._unit === unit) {
            return this._amount;
        }
        else if (this._unit >= 6 /* Month */ && unit >= 6 /* Month */) {
            var thisMonths = (this._unit === 7 /* Year */ ? 12 : 1);
            var reqMonths = (unit === 7 /* Year */ ? 12 : 1);
            return this._amount * thisMonths / reqMonths;
        }
        else {
            var thisMsec = basics.timeUnitToMilliseconds(this._unit);
            var reqMsec = basics.timeUnitToMilliseconds(unit);
            return this._amount * thisMsec / reqMsec;
        }
    };
    /**
     * Convert this duration to a Duration in another unit. You always get a clone even if you specify
     * the same unit.
     * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
     * It is approximate for any other conversion
     */
    Duration.prototype.convert = function (unit) {
        return new Duration(this.as(unit), unit);
    };
    /**
     * The entire duration in milliseconds (negative or positive)
     * For Day/Month/Year durations, this is approximate!
     */
    Duration.prototype.milliseconds = function () {
        return this.as(0 /* Millisecond */);
    };
    /**
     * The millisecond part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 400 for a -01:02:03.400 duration
     */
    Duration.prototype.millisecond = function () {
        return this._part(0 /* Millisecond */);
    };
    /**
     * The entire duration in seconds (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 1500 milliseconds duration
     */
    Duration.prototype.seconds = function () {
        return this.as(1 /* Second */);
    };
    /**
     * The second part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 3 for a -01:02:03.400 duration
     */
    Duration.prototype.second = function () {
        return this._part(1 /* Second */);
    };
    /**
     * The entire duration in minutes (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 90000 milliseconds duration
     */
    Duration.prototype.minutes = function () {
        return this.as(2 /* Minute */);
    };
    /**
     * The minute part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 2 for a -01:02:03.400 duration
     */
    Duration.prototype.minute = function () {
        return this._part(2 /* Minute */);
    };
    /**
     * The entire duration in hours (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 5400000 milliseconds duration
     */
    Duration.prototype.hours = function () {
        return this.as(3 /* Hour */);
    };
    /**
     * The hour part of a duration. This assumes that a day has 24 hours (which is not the case
     * during DST changes).
     */
    Duration.prototype.hour = function () {
        return this._part(3 /* Hour */);
    };
    /**
     * DEPRECATED
     * The hour part of the duration (always positive).
     * Note that this part can exceed 23 hours, because for
     * now, we do not have a days() function
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 25 for a -25:02:03.400 duration
     */
    Duration.prototype.wholeHours = function () {
        return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) / 3600000);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in days!
     */
    Duration.prototype.days = function () {
        return this.as(4 /* Day */);
    };
    /**
     * The day part of a duration. This assumes that a month has 30 days.
     */
    Duration.prototype.day = function () {
        return this._part(4 /* Day */);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     */
    Duration.prototype.months = function () {
        return this.as(6 /* Month */);
    };
    /**
     * The month part of a duration.
     */
    Duration.prototype.month = function () {
        return this._part(6 /* Month */);
    };
    /**
     * The entire duration in years (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     */
    Duration.prototype.years = function () {
        return this.as(7 /* Year */);
    };
    /**
     * Non-fractional positive years
     */
    Duration.prototype.wholeYears = function () {
        if (this._unit === 7 /* Year */) {
            return Math.floor(Math.abs(this._amount));
        }
        else if (this._unit === 6 /* Month */) {
            return Math.floor(Math.abs(this._amount) / 12);
        }
        else {
            return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) / basics.timeUnitToMilliseconds(7 /* Year */));
        }
    };
    /**
     * Amount of units (positive or negative, fractional)
     */
    Duration.prototype.amount = function () {
        return this._amount;
    };
    /**
     * The unit this duration was created with
     */
    Duration.prototype.unit = function () {
        return this._unit;
    };
    /**
     * Sign
     * @return "-" if the duration is negative
     */
    Duration.prototype.sign = function () {
        return (this._amount < 0 ? "-" : "");
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff (this < other)
     */
    Duration.prototype.lessThan = function (other) {
        return this.milliseconds() < other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff (this <= other)
     */
    Duration.prototype.lessEqual = function (other) {
        return this.milliseconds() <= other.milliseconds();
    };
    /**
     * Similar but not identical
     * Approximate if the durations have units that cannot be converted
     * @return True iff this and other represent the same time duration
     */
    Duration.prototype.equals = function (other) {
        var converted = other.convert(this._unit);
        return this._amount === converted.amount() && this._unit === converted.unit();
    };
    /**
     * Similar but not identical
     * Returns false if we cannot determine whether they are equal in all time zones
     * so e.g. 60 minutes equals 1 hour, but 24 hours do NOT equal 1 day
     *
     * @return True iff this and other represent the same time duration
     */
    Duration.prototype.equalsExact = function (other) {
        if (this._unit >= 6 /* Month */ && other.unit() >= 6 /* Month */) {
            return this.equals(other);
        }
        else if (this._unit <= 4 /* Day */ && other.unit() < 4 /* Day */) {
            return this.equals(other);
        }
        else {
            return false;
        }
    };
    /**
     * Same unit and same amount
     */
    Duration.prototype.identical = function (other) {
        return this._amount === other.amount() && this._unit === other.unit();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff this > other
     */
    Duration.prototype.greaterThan = function (other) {
        return this.milliseconds() > other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return True iff this >= other
     */
    Duration.prototype.greaterEqual = function (other) {
        return this.milliseconds() >= other.milliseconds();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return The minimum (most negative) of this and other
     */
    Duration.prototype.min = function (other) {
        if (this.lessThan(other)) {
            return this.clone();
        }
        return other.clone();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * @return The maximum (most positive) of this and other
     */
    Duration.prototype.max = function (other) {
        if (this.greaterThan(other)) {
            return this.clone();
        }
        return other.clone();
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * Multiply with a fixed number.
     * @return a new Duration of (this * value)
     */
    Duration.prototype.multiply = function (value) {
        return new Duration(this._amount * value, this._unit);
    };
    /**
     * Approximate if the durations have units that cannot be converted
     * Divide by a fixed number.
     * @return a new Duration of (this / value)
     */
    Duration.prototype.divide = function (value) {
        if (value === 0) {
            throw new Error("Duration.divide(): Divide by zero");
        }
        return new Duration(this._amount / value, this._unit);
    };
    /**
     * Add a duration.
     * @return a new Duration of (this + value) with the unit of this duration
     */
    Duration.prototype.add = function (value) {
        return new Duration(this._amount + value.as(this._unit), this._unit);
    };
    /**
     * Subtract a duration.
     * @return a new Duration of (this - value) with the unit of this duration
     */
    Duration.prototype.sub = function (value) {
        return new Duration(this._amount - value.as(this._unit), this._unit);
    };
    /**
     * Return the absolute value of the duration i.e. remove the sign.
     */
    Duration.prototype.abs = function () {
        if (this._amount >= 0) {
            return this.clone();
        }
        else {
            return this.multiply(-1);
        }
    };
    /**
     * DEPRECATED
     * String in [-]hhhh:mm:ss.nnn notation. All fields are
     * always present except the sign.
     */
    Duration.prototype.toFullString = function () {
        return this.toHmsString(true);
    };
    /**
     * String in [-]hhhh:mm[:ss[.nnn]] notation.
     * @param full If true, then all fields are always present except the sign. Otherwise, seconds and milliseconds
     *             are chopped off if zero
     */
    Duration.prototype.toHmsString = function (full) {
        if (full === void 0) { full = false; }
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
    /**
     * String in ISO 8601 notation e.g. 'P1M' for one month or 'PT1M' for one minute
     */
    Duration.prototype.toIsoString = function () {
        switch (this._unit) {
            case 0 /* Millisecond */: {
                return "P" + (this._amount / 1000).toFixed(3) + "S";
            }
            case 1 /* Second */: {
                return "P" + this._amount.toString(10) + "S";
            }
            case 2 /* Minute */: {
                return "PT" + this._amount.toString(10) + "M"; // note the "T" to disambiguate the "M"
            }
            case 3 /* Hour */: {
                return "P" + this._amount.toString(10) + "H";
            }
            case 4 /* Day */: {
                return "P" + this._amount.toString(10) + "D";
            }
            case 5 /* Week */: {
                return "P" + this._amount.toString(10) + "W";
            }
            case 6 /* Month */: {
                return "P" + this._amount.toString(10) + "M";
            }
            case 7 /* Year */: {
                return "P" + this._amount.toString(10) + "Y";
            }
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };
    /**
     * String representation with amount and unit e.g. '1.5 years' or '-1 day'
     */
    Duration.prototype.toString = function () {
        return this._amount.toString(10) + " " + basics.timeUnitToString(this._unit, this._amount);
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
    /**
     * Return this % unit, always positive
     */
    Duration.prototype._part = function (unit) {
        /* istanbul ignore if */
        if (unit === 7 /* Year */) {
            return Math.floor(Math.abs(this.as(7 /* Year */)));
        }
        var nextUnit;
        switch (unit) {
            case 0 /* Millisecond */:
                nextUnit = 1 /* Second */;
                break;
            case 1 /* Second */:
                nextUnit = 2 /* Minute */;
                break;
            case 2 /* Minute */:
                nextUnit = 3 /* Hour */;
                break;
            case 3 /* Hour */:
                nextUnit = 4 /* Day */;
                break;
            case 4 /* Day */:
                nextUnit = 6 /* Month */;
                break;
            case 6 /* Month */:
                nextUnit = 7 /* Year */;
                break;
        }
        var msecs = (basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount)) % basics.timeUnitToMilliseconds(nextUnit);
        return Math.floor(msecs / basics.timeUnitToMilliseconds(unit));
    };
    Duration.prototype._fromString = function (s) {
        var trimmed = s.trim();
        if (trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/)) {
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
            var amountMsec = sign * Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
            // find lowest non-zero number and take that as unit
            if (milliseconds !== 0) {
                this._unit = 0 /* Millisecond */;
            }
            else if (seconds !== 0) {
                this._unit = 1 /* Second */;
            }
            else if (minutes !== 0) {
                this._unit = 2 /* Minute */;
            }
            else if (hours !== 0) {
                this._unit = 3 /* Hour */;
            }
            else {
                this._unit = 0 /* Millisecond */;
            }
            this._amount = amountMsec / basics.timeUnitToMilliseconds(this._unit);
        }
        else {
            var split = trimmed.toLowerCase().split(" ");
            if (split.length !== 2) {
                throw new Error("Invalid time string '" + s + "'");
            }
            var amount = parseFloat(split[0]);
            assert(!isNaN(amount), "Invalid time string '" + s + "', cannot parse amount");
            assert(isFinite(amount), "Invalid time string '" + s + "', amount is infinite");
            this._amount = amount;
            this._unit = basics.stringToTimeUnit(split[1]);
        }
    };
    return Duration;
})();
exports.Duration = Duration;
;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImR1cmF0aW9uLnRzIl0sIm5hbWVzIjpbInllYXJzIiwibW9udGhzIiwiZGF5cyIsImhvdXJzIiwibWludXRlcyIsInNlY29uZHMiLCJtaWxsaXNlY29uZHMiLCJEdXJhdGlvbiIsIkR1cmF0aW9uLmNvbnN0cnVjdG9yIiwiRHVyYXRpb24ueWVhcnMiLCJEdXJhdGlvbi5tb250aHMiLCJEdXJhdGlvbi5kYXlzIiwiRHVyYXRpb24uaG91cnMiLCJEdXJhdGlvbi5taW51dGVzIiwiRHVyYXRpb24uc2Vjb25kcyIsIkR1cmF0aW9uLm1pbGxpc2Vjb25kcyIsIkR1cmF0aW9uLmNsb25lIiwiRHVyYXRpb24uYXMiLCJEdXJhdGlvbi5jb252ZXJ0IiwiRHVyYXRpb24ubWlsbGlzZWNvbmQiLCJEdXJhdGlvbi5zZWNvbmQiLCJEdXJhdGlvbi5taW51dGUiLCJEdXJhdGlvbi5ob3VyIiwiRHVyYXRpb24ud2hvbGVIb3VycyIsIkR1cmF0aW9uLmRheSIsIkR1cmF0aW9uLm1vbnRoIiwiRHVyYXRpb24ud2hvbGVZZWFycyIsIkR1cmF0aW9uLmFtb3VudCIsIkR1cmF0aW9uLnVuaXQiLCJEdXJhdGlvbi5zaWduIiwiRHVyYXRpb24ubGVzc1RoYW4iLCJEdXJhdGlvbi5sZXNzRXF1YWwiLCJEdXJhdGlvbi5lcXVhbHMiLCJEdXJhdGlvbi5lcXVhbHNFeGFjdCIsIkR1cmF0aW9uLmlkZW50aWNhbCIsIkR1cmF0aW9uLmdyZWF0ZXJUaGFuIiwiRHVyYXRpb24uZ3JlYXRlckVxdWFsIiwiRHVyYXRpb24ubWluIiwiRHVyYXRpb24ubWF4IiwiRHVyYXRpb24ubXVsdGlwbHkiLCJEdXJhdGlvbi5kaXZpZGUiLCJEdXJhdGlvbi5hZGQiLCJEdXJhdGlvbi5zdWIiLCJEdXJhdGlvbi5hYnMiLCJEdXJhdGlvbi50b0Z1bGxTdHJpbmciLCJEdXJhdGlvbi50b0htc1N0cmluZyIsIkR1cmF0aW9uLnRvSXNvU3RyaW5nIiwiRHVyYXRpb24udG9TdHJpbmciLCJEdXJhdGlvbi5pbnNwZWN0IiwiRHVyYXRpb24udmFsdWVPZiIsIkR1cmF0aW9uLl9wYXJ0IiwiRHVyYXRpb24uX2Zyb21TdHJpbmciXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFFYixJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUVsQyxJQUFPLE1BQU0sV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFPLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBRWxDLElBQU8sT0FBTyxXQUFXLFdBQVcsQ0FBQyxDQUFDO0FBR3RDLEFBS0E7Ozs7R0FERztTQUNhLEtBQUssQ0FBQyxDQUFTO0lBQzlCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMxQkEsQ0FBQ0E7QUFGZSxhQUFLLEdBQUwsS0FFZixDQUFBO0FBRUQsQUFLQTs7OztHQURHO1NBQ2EsTUFBTSxDQUFDLENBQVM7SUFDL0JDLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzNCQSxDQUFDQTtBQUZlLGNBQU0sR0FBTixNQUVmLENBQUE7QUFFRCxBQUtBOzs7O0dBREc7U0FDYSxJQUFJLENBQUMsQ0FBUztJQUM3QkMsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDekJBLENBQUNBO0FBRmUsWUFBSSxHQUFKLElBRWYsQ0FBQTtBQUVELEFBS0E7Ozs7R0FERztTQUNhLEtBQUssQ0FBQyxDQUFTO0lBQzlCQyxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMxQkEsQ0FBQ0E7QUFGZSxhQUFLLEdBQUwsS0FFZixDQUFBO0FBRUQsQUFLQTs7OztHQURHO1NBQ2EsT0FBTyxDQUFDLENBQVM7SUFDaENDLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENB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LG9CQUFxQkEsR0FBckJBLFlBQXFCQTtRQUN2Q0EsSUFBSUEsTUFBTUEsR0FBV0EsRUFBRUEsQ0FBQ0E7UUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BDQSxNQUFNQSxHQUFHQSxHQUFHQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6RUEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsTUFBTUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcERBLE1BQU1BLEdBQUdBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBO1FBQzdFQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwREEsTUFBTUEsR0FBR0EsR0FBR0EsR0FBR0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDN0VBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBO0lBQ3ZGQSxDQUFDQTtJQUVEdEM7O09BRUdBO0lBQ0lBLDhCQUFXQSxHQUFsQkE7UUFDQ3VDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxLQUFLQSxtQkFBb0JBLEVBQUVBLENBQUNBO2dCQUMzQkEsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7WUFDckRBLENBQUNBO1lBQ0RBLEtBQUtBLGNBQWVBLEVBQUVBLENBQUNBO2dCQUN0QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7WUFDOUNBLENBQUNBO1lBQ0RBLEtBQUtBLGNBQWVBLEVBQUVBLENBQUNBO2dCQUN0QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsdUNBQXVDQTtZQUN2RkEsQ0FBQ0EsR0FEOENBO1lBRS9DQSxLQUFLQSxZQUFhQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFL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QUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSx1Q0FBdUNBLEdBQUdBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1lBQ3ZHQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0JBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO2dCQUNWQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxLQUFLQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxPQUFPQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxJQUFJQSxXQUFXQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDdENBLE9BQU9BLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7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