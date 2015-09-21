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
            this._unit = (typeof unit === "number" ? unit : TimeUnit.Millisecond);
        }
        else if (typeof (i1) === "string") {
            // string constructor
            this._fromString(i1);
        }
        else {
            // default constructor
            this._amount = 0;
            this._unit = TimeUnit.Millisecond;
        }
    }
    /**
     * Construct a time duration
     * @param n	Number of years (may be fractional or negative)
     * @return A duration of n years
     */
    Duration.years = function (n) {
        return new Duration(n, TimeUnit.Year);
    };
    /**
     * Construct a time duration
     * @param n	Number of months (may be fractional or negative)
     * @return A duration of n months
     */
    Duration.months = function (n) {
        return new Duration(n, TimeUnit.Month);
    };
    /**
     * Construct a time duration
     * @param n	Number of days (may be fractional or negative)
     * @return A duration of n days
     */
    Duration.days = function (n) {
        return new Duration(n, TimeUnit.Day);
    };
    /**
     * Construct a time duration
     * @param n	Number of hours (may be fractional or negative)
     * @return A duration of n hours
     */
    Duration.hours = function (n) {
        return new Duration(n, TimeUnit.Hour);
    };
    /**
     * Construct a time duration
     * @param n	Number of minutes (may be fractional or negative)
     * @return A duration of n minutes
     */
    Duration.minutes = function (n) {
        return new Duration(n, TimeUnit.Minute);
    };
    /**
     * Construct a time duration
     * @param n	Number of seconds (may be fractional or negative)
     * @return A duration of n seconds
     */
    Duration.seconds = function (n) {
        return new Duration(n, TimeUnit.Second);
    };
    /**
     * Construct a time duration
     * @param n	Number of milliseconds (may be fractional or negative)
     * @return A duration of n milliseconds
     */
    Duration.milliseconds = function (n) {
        return new Duration(n, TimeUnit.Millisecond);
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
        else if (this._unit >= TimeUnit.Month && unit >= TimeUnit.Month) {
            var thisMonths = (this._unit === TimeUnit.Year ? 12 : 1);
            var reqMonths = (unit === TimeUnit.Year ? 12 : 1);
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
        return this.as(TimeUnit.Millisecond);
    };
    /**
     * The millisecond part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 400 for a -01:02:03.400 duration
     */
    Duration.prototype.millisecond = function () {
        return this._part(TimeUnit.Millisecond);
    };
    /**
     * The entire duration in seconds (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 1500 milliseconds duration
     */
    Duration.prototype.seconds = function () {
        return this.as(TimeUnit.Second);
    };
    /**
     * The second part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 3 for a -01:02:03.400 duration
     */
    Duration.prototype.second = function () {
        return this._part(TimeUnit.Second);
    };
    /**
     * The entire duration in minutes (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 90000 milliseconds duration
     */
    Duration.prototype.minutes = function () {
        return this.as(TimeUnit.Minute);
    };
    /**
     * The minute part of the duration (always positive)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 2 for a -01:02:03.400 duration
     */
    Duration.prototype.minute = function () {
        return this._part(TimeUnit.Minute);
    };
    /**
     * The entire duration in hours (negative or positive, fractional)
     * For Day/Month/Year durations, this is approximate!
     * @return e.g. 1.5 for a 5400000 milliseconds duration
     */
    Duration.prototype.hours = function () {
        return this.as(TimeUnit.Hour);
    };
    /**
     * The hour part of a duration. This assumes that a day has 24 hours (which is not the case
     * during DST changes).
     */
    Duration.prototype.hour = function () {
        return this._part(TimeUnit.Hour);
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
        return this.as(TimeUnit.Day);
    };
    /**
     * The day part of a duration. This assumes that a month has 30 days.
     */
    Duration.prototype.day = function () {
        return this._part(TimeUnit.Day);
    };
    /**
     * The entire duration in days (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     */
    Duration.prototype.months = function () {
        return this.as(TimeUnit.Month);
    };
    /**
     * The month part of a duration.
     */
    Duration.prototype.month = function () {
        return this._part(TimeUnit.Month);
    };
    /**
     * The entire duration in years (negative or positive, fractional)
     * This is approximate if this duration is not in Months or Years!
     */
    Duration.prototype.years = function () {
        return this.as(TimeUnit.Year);
    };
    /**
     * Non-fractional positive years
     */
    Duration.prototype.wholeYears = function () {
        if (this._unit === TimeUnit.Year) {
            return Math.floor(Math.abs(this._amount));
        }
        else if (this._unit === TimeUnit.Month) {
            return Math.floor(Math.abs(this._amount) / 12);
        }
        else {
            return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) /
                basics.timeUnitToMilliseconds(TimeUnit.Year));
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
        if (this._unit >= TimeUnit.Month && other.unit() >= TimeUnit.Month) {
            return this.equals(other);
        }
        else if (this._unit <= TimeUnit.Day && other.unit() < TimeUnit.Day) {
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
            case TimeUnit.Millisecond: {
                return "P" + (this._amount / 1000).toFixed(3) + "S";
            }
            case TimeUnit.Second: {
                return "P" + this._amount.toString(10) + "S";
            }
            case TimeUnit.Minute: {
                return "PT" + this._amount.toString(10) + "M"; // note the "T" to disambiguate the "M"
            }
            case TimeUnit.Hour: {
                return "P" + this._amount.toString(10) + "H";
            }
            case TimeUnit.Day: {
                return "P" + this._amount.toString(10) + "D";
            }
            case TimeUnit.Week: {
                return "P" + this._amount.toString(10) + "W";
            }
            case TimeUnit.Month: {
                return "P" + this._amount.toString(10) + "M";
            }
            case TimeUnit.Year: {
                return "P" + this._amount.toString(10) + "Y";
            }
            /* istanbul ignore next */
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
        if (unit === TimeUnit.Year) {
            return Math.floor(Math.abs(this.as(TimeUnit.Year)));
        }
        var nextUnit;
        // note not all units are used here: Weeks and Years are ruled out
        switch (unit) {
            case TimeUnit.Millisecond:
                nextUnit = TimeUnit.Second;
                break;
            case TimeUnit.Second:
                nextUnit = TimeUnit.Minute;
                break;
            case TimeUnit.Minute:
                nextUnit = TimeUnit.Hour;
                break;
            case TimeUnit.Hour:
                nextUnit = TimeUnit.Day;
                break;
            case TimeUnit.Day:
                nextUnit = TimeUnit.Month;
                break;
            case TimeUnit.Month:
                nextUnit = TimeUnit.Year;
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
                this._unit = TimeUnit.Millisecond;
            }
            else if (seconds !== 0) {
                this._unit = TimeUnit.Second;
            }
            else if (minutes !== 0) {
                this._unit = TimeUnit.Minute;
            }
            else if (hours !== 0) {
                this._unit = TimeUnit.Hour;
            }
            else {
                this._unit = TimeUnit.Millisecond;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kdXJhdGlvbi50cyJdLCJuYW1lcyI6WyJ5ZWFycyIsIm1vbnRocyIsImRheXMiLCJob3VycyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwibWlsbGlzZWNvbmRzIiwiRHVyYXRpb24iLCJEdXJhdGlvbi5jb25zdHJ1Y3RvciIsIkR1cmF0aW9uLnllYXJzIiwiRHVyYXRpb24ubW9udGhzIiwiRHVyYXRpb24uZGF5cyIsIkR1cmF0aW9uLmhvdXJzIiwiRHVyYXRpb24ubWludXRlcyIsIkR1cmF0aW9uLnNlY29uZHMiLCJEdXJhdGlvbi5taWxsaXNlY29uZHMiLCJEdXJhdGlvbi5jbG9uZSIsIkR1cmF0aW9uLmFzIiwiRHVyYXRpb24uY29udmVydCIsIkR1cmF0aW9uLm1pbGxpc2Vjb25kIiwiRHVyYXRpb24uc2Vjb25kIiwiRHVyYXRpb24ubWludXRlIiwiRHVyYXRpb24uaG91ciIsIkR1cmF0aW9uLndob2xlSG91cnMiLCJEdXJhdGlvbi5kYXkiLCJEdXJhdGlvbi5tb250aCIsIkR1cmF0aW9uLndob2xlWWVhcnMiLCJEdXJhdGlvbi5hbW91bnQiLCJEdXJhdGlvbi51bml0IiwiRHVyYXRpb24uc2lnbiIsIkR1cmF0aW9uLmxlc3NUaGFuIiwiRHVyYXRpb24ubGVzc0VxdWFsIiwiRHVyYXRpb24uZXF1YWxzIiwiRHVyYXRpb24uZXF1YWxzRXhhY3QiLCJEdXJhdGlvbi5pZGVudGljYWwiLCJEdXJhdGlvbi5ncmVhdGVyVGhhbiIsIkR1cmF0aW9uLmdyZWF0ZXJFcXVhbCIsIkR1cmF0aW9uLm1pbiIsIkR1cmF0aW9uLm1heCIsIkR1cmF0aW9uLm11bHRpcGx5IiwiRHVyYXRpb24uZGl2aWRlIiwiRHVyYXRpb24uYWRkIiwiRHVyYXRpb24uc3ViIiwiRHVyYXRpb24uYWJzIiwiRHVyYXRpb24udG9GdWxsU3RyaW5nIiwiRHVyYXRpb24udG9IbXNTdHJpbmciLCJEdXJhdGlvbi50b0lzb1N0cmluZyIsIkR1cmF0aW9uLnRvU3RyaW5nIiwiRHVyYXRpb24uaW5zcGVjdCIsIkR1cmF0aW9uLnZhbHVlT2YiLCJEdXJhdGlvbi5fcGFydCIsIkR1cmF0aW9uLl9mcm9tU3RyaW5nIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQU8sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFFbEMsSUFBTyxPQUFPLFdBQVcsV0FBVyxDQUFDLENBQUM7QUFHdEM7Ozs7R0FJRztBQUNILGVBQXNCLENBQVM7SUFDOUJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzFCQSxDQUFDQTtBQUZlLGFBQUssUUFFcEIsQ0FBQTtBQUVEOzs7O0dBSUc7QUFDSCxnQkFBdUIsQ0FBUztJQUMvQkMsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDM0JBLENBQUNBO0FBRmUsY0FBTSxTQUVyQixDQUFBO0FBRUQ7Ozs7R0FJRztBQUNILGNBQXFCLENBQVM7SUFDN0JDLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ3pCQSxDQUFDQTtBQUZlLFlBQUksT0FFbkIsQ0FBQTtBQUVEOzs7O0dBSUc7QUFDSCxlQUFzQixDQUFTO0lBQzlCQyxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMxQkEsQ0FBQ0E7QUFGZSxhQUFLLFFBRXBCLENBQUE7QUFFRDs7OztHQUlHO0FBQ0gsaUJBQXdCLENBQVM7SUFDaENDLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzVCQSxDQUFDQTtBQUZlLGVBQU8sVUFFdEIsQ0FBQTtBQUVEOzs7O0dBSUc7QUFDSCxpQkFBd0IsQ0FBUztJQUNoQ0MsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDNUJBLENBQUNBO0FBRmUsZUFBTyxVQUV0QixDQUFBO0FBRUQ7Ozs7R0FJRztBQUNILHNCQUE2QixDQUFTO0lBQ3JDQyxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNqQ0EsQ0FBQ0E7QUFGZSxvQkFBWSxlQUUzQixDQUFBO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSDtJQThGQ0M7O09BRUdBO0lBQ0hBLGtCQUFZQSxFQUFRQSxFQUFFQSxJQUFlQTtRQUNwQ0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLDBCQUEwQkE7WUFDMUJBLElBQUlBLE1BQU1BLEdBQVdBLEVBQUVBLENBQUNBO1lBQ3hCQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxNQUFNQSxDQUFDQTtZQUN0QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsT0FBT0EsSUFBSUEsS0FBS0EsUUFBUUEsR0FBR0EsSUFBSUEsR0FBR0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEVBQUVBLENBQUNBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxxQkFBcUJBO1lBQ3JCQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFTQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsc0JBQXNCQTtZQUN0QkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDakJBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBO1FBQ25DQSxDQUFDQTtJQUNGQSxDQUFDQTtJQW5HREQ7Ozs7T0FJR0E7SUFDV0EsY0FBS0EsR0FBbkJBLFVBQW9CQSxDQUFTQTtRQUM1QkUsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdkNBLENBQUNBO0lBRURGOzs7O09BSUdBO0lBQ1dBLGVBQU1BLEdBQXBCQSxVQUFxQkEsQ0FBU0E7UUFDN0JHLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQTtJQUVESDs7OztPQUlHQTtJQUNXQSxhQUFJQSxHQUFsQkEsVUFBbUJBLENBQVNBO1FBQzNCSSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN0Q0EsQ0FBQ0E7SUFFREo7Ozs7T0FJR0E7SUFDV0EsY0FBS0EsR0FBbkJBLFVBQW9CQSxDQUFTQTtRQUM1QkssTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdkNBLENBQUNBO0lBRURMOzs7O09BSUdBO0lBQ1dBLGdCQUFPQSxHQUFyQkEsVUFBc0JBLENBQVNBO1FBQzlCTSxNQUFNQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFRE47Ozs7T0FJR0E7SUFDV0EsZ0JBQU9BLEdBQXJCQSxVQUFzQkEsQ0FBU0E7UUFDOUJPLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUVEUDs7OztPQUlHQTtJQUNXQSxxQkFBWUEsR0FBMUJBLFVBQTJCQSxDQUFTQTtRQUNuQ1EsTUFBTUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDOUNBLENBQUNBO0lBd0NEUjs7T0FFR0E7SUFDSUEsd0JBQUtBLEdBQVpBO1FBQ0NTLE1BQU1BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVEVDs7OztPQUlHQTtJQUNJQSxxQkFBRUEsR0FBVEEsVUFBVUEsSUFBY0E7UUFDdkJVLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsSUFBSUEsSUFBSUEsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkVBLElBQUlBLFVBQVVBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEtBQUtBLFFBQVFBLENBQUNBLElBQUlBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pEQSxJQUFJQSxTQUFTQSxHQUFHQSxDQUFDQSxJQUFJQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsVUFBVUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDOUNBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLElBQUlBLFFBQVFBLEdBQUdBLE1BQU1BLENBQUNBLHNC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SUEsTUFBTUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcERBLE1BQU1BLEdBQUdBLEdBQUdBLEdBQUdBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBO1FBQzdFQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQTtJQUN2RkEsQ0FBQ0E7SUFFRHRDOztPQUVHQTtJQUNJQSw4QkFBV0EsR0FBbEJBO1FBQ0N1QyxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsS0FBS0EsUUFBUUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7Z0JBQzNCQSxNQUFNQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtZQUNyREEsQ0FBQ0E7WUFDREEsS0FBS0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQ3RCQSxNQUFNQSxDQUFDQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtZQUM5Q0EsQ0FBQ0E7WUFDREEsS0FBS0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQ3RCQSxNQUFNQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSx1Q0FBdUNBO1lBQ3ZGQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtnQkFDbkJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtnQkFDckJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSwwQkFBMEJBO1lBQzFCQTtnQkFDQ0Esd0JBQXdCQTtnQkFDeEJBLDBCQUEwQkE7Z0JBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDVkEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQTtnQkFDekNBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRUR2Qzs7T0FFR0E7SUFDSUEsMkJBQVFBLEdBQWZBO1FBQ0N3QyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQzVGQSxDQUFDQTtJQUVEeEM7O09BRUdBO0lBQ0lBLDBCQUFPQSxHQUFkQTtRQUNDeUMsTUFBTUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDOUNBLENBQUNBO0lBRUR6Qzs7T0FFR0E7SUFDSUEsMEJBQU9BLEdBQWRBO1FBQ0MwQyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtJQUM1QkEsQ0FBQ0E7SUFFRDFDOztPQUVHQTtJQUNLQSx3QkFBS0EsR0FBYkEsVUFBY0EsSUFBY0E7UUFDM0IyQyx3QkFBd0JBO1FBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQ0RBLElBQUlBLFFBQWtCQSxDQUFDQTtRQUN2QkEsa0VBQWtFQTtRQUNsRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZEEsS0FBS0EsUUFBUUEsQ0FBQ0EsV0FBV0E7Z0JBQUVBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBO2dCQUFDQSxLQUFLQSxDQUFDQTtZQUM3REEsS0FBS0EsUUFBUUEsQ0FBQ0EsTUFBTUE7Z0JBQUVBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBO2dCQUFDQSxLQUFLQSxDQUFDQTtZQUN4REEsS0FBS0EsUUFBUUEsQ0FBQ0EsTUFBTUE7Z0JBQUVBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBO2dCQUFDQSxLQUFLQSxDQUFDQTtZQUN0REEsS0FBS0EsUUFBUUEsQ0FBQ0EsSUFBSUE7Z0JBQUVBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBO2dCQUFDQSxLQUFLQSxDQUFDQTtZQUNuREEsS0FBS0EsUUFBUUEsQ0FBQ0EsR0FBR0E7Z0JBQUVBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBO2dCQUFDQSxLQUFLQSxDQUFDQTtZQUNwREEsS0FBS0EsUUFBUUEsQ0FBQ0EsS0FBS0E7Z0JBQUVBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBO2dCQUFDQSxLQUFLQSxDQUFDQTtRQUN0REEsQ0FBQ0E7UUFFREEsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQzNIQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ2hFQSxDQUFDQTtJQUdPM0MsOEJBQVdBLEdBQW5CQSxVQUFvQkEsQ0FBU0E7UUFDNUI0QyxJQUFJQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EseUNBQXlDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5REEsSUFBSUEsSUFBSUEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLEtBQUtBLEdBQVdBLENBQUNBLENBQUNBO1lBQ3RCQSxJQUFJQSxPQUFPQSxHQUFXQSxDQUFDQSxDQUFDQTtZQUN4QkEsSUFBSUEsT0FBT0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLElBQUlBLFlBQVlBLEdBQVdBLENBQUNBLENBQUNBO1lBQzdCQSxJQUFJQSxLQUFLQSxHQUFhQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUN6Q0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsRUFBRUEsdUNBQXVDQSxHQUFHQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUN2R0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9CQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDVkEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsS0FBS0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkJBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsT0FBT0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLENBQUNBO1lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsV0FBV0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RDQSxPQUFPQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM1QkEsWUFBWUEsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFEQSxDQUFDQTtZQUNGQSxDQUFDQTtZQUNEQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxHQUFHQSxPQUFPQSxHQUFHQSxLQUFLQSxHQUFHQSxPQUFPQSxHQUFHQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUN0R0Esb0RBQW9EQTtZQUNwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUNuQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQTtZQUM5QkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUM1QkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ1BBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBLFdBQVdBLENBQUNBO1lBQ25DQSxDQUFDQTtZQUNEQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxVQUFVQSxHQUFHQSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3ZFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNQQSxJQUFJQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSx1QkFBdUJBLEdBQUdBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO1lBQ3BEQSxDQUFDQTtZQUNEQSxJQUFJQSxNQUFNQSxHQUFHQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsdUJBQXVCQSxHQUFHQSxDQUFDQSxHQUFHQSx3QkFBd0JBLENBQUNBLENBQUNBO1lBQy9FQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSx1QkFBdUJBLEdBQUdBLENBQUNBLEdBQUdBLHVCQUF1QkEsQ0FBQ0EsQ0FBQ0E7WUFDaEZBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO1lBQ3RCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2hEQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUNGNUMsZUFBQ0E7QUFBREEsQ0E5bEJBLEFBOGxCQ0EsSUFBQTtBQTlsQlksZ0JBQVEsV0E4bEJwQixDQUFBO0FBQUEsQ0FBQyIsImZpbGUiOiJsaWIvZHVyYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIFRpbWUgZHVyYXRpb25cclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZC50c1wiLz5cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XHJcblxyXG5pbXBvcnQgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG5pbXBvcnQgVGltZVVuaXQgPSBiYXNpY3MuVGltZVVuaXQ7XHJcblxyXG5pbXBvcnQgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcblxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiB5ZWFycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIHllYXJzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24geWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi55ZWFycyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtb250aHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBtb250aHNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5tb250aHMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgZGF5cyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGRheXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24uZGF5cyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBob3VycyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcbiAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIGhvdXJzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5ob3VycyhuKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuICogQHBhcmFtIG5cdE51bWJlciBvZiBtaW51dGVzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWludXRlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdHJldHVybiBEdXJhdGlvbi5taW51dGVzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG4gKiBAcGFyYW0gblx0TnVtYmVyIG9mIHNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG4gKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBzZWNvbmRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0cmV0dXJuIER1cmF0aW9uLnNlY29uZHMobik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcbiAqIEBwYXJhbSBuXHROdW1iZXIgb2YgbWlsbGlzZWNvbmRzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbWlsbGlzZWNvbmRzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRyZXR1cm4gRHVyYXRpb24ubWlsbGlzZWNvbmRzKG4pO1xyXG59XHJcblxyXG4vKipcclxuICogVGltZSBkdXJhdGlvbiB3aGljaCBpcyByZXByZXNlbnRlZCBhcyBhbiBhbW91bnQgYW5kIGEgdW5pdCBlLmcuXHJcbiAqICcxIE1vbnRoJyBvciAnMTY2IFNlY29uZHMnLiBUaGUgdW5pdCBpcyBwcmVzZXJ2ZWQgdGhyb3VnaCBjYWxjdWxhdGlvbnMuXHJcbiAqXHJcbiAqIEl0IGhhcyB0d28gc2V0cyBvZiBnZXR0ZXIgZnVuY3Rpb25zOlxyXG4gKiAtIHNlY29uZCgpLCBtaW51dGUoKSwgaG91cigpIGV0Yywgc2luZ3VsYXIgZm9ybTogdGhlc2UgY2FuIGJlIHVzZWQgdG8gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMuXHJcbiAqICAgVGhlc2UgcmV0dXJuIGEgcGFydCBvZiB5b3VyIHN0cmluZyByZXByZXNlbnRhdGlvbi4gRS5nLiBmb3IgMjUwMCBtaWxsaXNlY29uZHMsIHRoZSBtaWxsaXNlY29uZCgpIHBhcnQgd291bGQgYmUgNTAwXHJcbiAqIC0gc2Vjb25kcygpLCBtaW51dGVzKCksIGhvdXJzKCkgZXRjLCBwbHVyYWwgZm9ybTogdGhlc2UgcmV0dXJuIHRoZSB0b3RhbCBhbW91bnQgcmVwcmVzZW50ZWQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgdW5pdC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBEdXJhdGlvbiB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdpdmVuIGFtb3VudCBpbiBjb25zdHJ1Y3RvclxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2Ftb3VudDogbnVtYmVyO1xyXG5cclxuXHQvKipcclxuXHQgKiBVbml0XHJcblx0ICovXHJcblx0cHJpdmF0ZSBfdW5pdDogVGltZVVuaXQ7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIHllYXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiB5ZWFyc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgeWVhcnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5ZZWFyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1vbnRocyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gbW9udGhzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBtb250aHMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5Nb250aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBkYXlzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBkYXlzXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBkYXlzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuRGF5KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIGhvdXJzIChtYXkgYmUgZnJhY3Rpb25hbCBvciBuZWdhdGl2ZSlcclxuXHQgKiBAcmV0dXJuIEEgZHVyYXRpb24gb2YgbiBob3Vyc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaG91cnMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5Ib3VyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIHRpbWUgZHVyYXRpb25cclxuXHQgKiBAcGFyYW0gblx0TnVtYmVyIG9mIG1pbnV0ZXMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbnV0ZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIG1pbnV0ZXMobjogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbihuLCBUaW1lVW5pdC5NaW51dGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvblxyXG5cdCAqIEBwYXJhbSBuXHROdW1iZXIgb2Ygc2Vjb25kcyAobWF5IGJlIGZyYWN0aW9uYWwgb3IgbmVnYXRpdmUpXHJcblx0ICogQHJldHVybiBBIGR1cmF0aW9uIG9mIG4gc2Vjb25kc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgc2Vjb25kcyhuOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKG4sIFRpbWVVbml0LlNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3QgYSB0aW1lIGR1cmF0aW9uXHJcblx0ICogQHBhcmFtIG5cdE51bWJlciBvZiBtaWxsaXNlY29uZHMgKG1heSBiZSBmcmFjdGlvbmFsIG9yIG5lZ2F0aXZlKVxyXG5cdCAqIEByZXR1cm4gQSBkdXJhdGlvbiBvZiBuIG1pbGxpc2Vjb25kc1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgbWlsbGlzZWNvbmRzKG46IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24obiwgVGltZVVuaXQuTWlsbGlzZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvbiBvZiAwXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0IGEgdGltZSBkdXJhdGlvbiBmcm9tIGEgc3RyaW5nIGluIG9uZSBvZiB0d28gZm9ybWF0czpcclxuXHQgKiAxKSBbLV1oaGhoWzptbVs6c3NbLm5ubl1dXSBlLmcuICctMDE6MDA6MzAuNTAxJ1xyXG5cdCAqIDIpIGFtb3VudCBhbmQgdW5pdCBlLmcuICctMSBkYXlzJyBvciAnMSB5ZWFyJy4gVGhlIHVuaXQgbWF5IGJlIGluIHNpbmd1bGFyIG9yIHBsdXJhbCBmb3JtIGFuZCBpcyBjYXNlLWluc2Vuc2l0aXZlXHJcblx0ICovXHJcblx0Y29uc3RydWN0b3IoaW5wdXQ6IHN0cmluZyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnN0cnVjdCBhIGR1cmF0aW9uIGZyb20gYW4gYW1vdW50IGFuZCBhIHRpbWUgdW5pdC5cclxuXHQgKiBAcGFyYW0gYW1vdW50XHROdW1iZXIgb2YgdW5pdHNcclxuXHQgKiBAcGFyYW0gdW5pdFx0QSB0aW1lIHVuaXQgaS5lLiBUaW1lVW5pdC5TZWNvbmQsIFRpbWVVbml0LkhvdXIgZXRjLiBEZWZhdWx0IE1pbGxpc2Vjb25kLlxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGFtb3VudDogbnVtYmVyLCB1bml0PzogVGltZVVuaXQpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDb25zdHJ1Y3RvciBpbXBsZW1lbnRhdGlvblxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGkxPzogYW55LCB1bml0PzogVGltZVVuaXQpIHtcclxuXHRcdGlmICh0eXBlb2YgKGkxKSA9PT0gXCJudW1iZXJcIikge1xyXG5cdFx0XHQvLyBhbW91bnQrdW5pdCBjb25zdHJ1Y3RvclxyXG5cdFx0XHR2YXIgYW1vdW50ID0gPG51bWJlcj5pMTtcclxuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50O1xyXG5cdFx0XHR0aGlzLl91bml0ID0gKHR5cGVvZiB1bml0ID09PSBcIm51bWJlclwiID8gdW5pdCA6IFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIChpMSkgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0Ly8gc3RyaW5nIGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Zyb21TdHJpbmcoPHN0cmluZz5pMSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXHJcblx0XHRcdHRoaXMuX2Ftb3VudCA9IDA7XHJcblx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaWxsaXNlY29uZDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm4gYW5vdGhlciBpbnN0YW5jZSBvZiBEdXJhdGlvbiB3aXRoIHRoZSBzYW1lIHZhbHVlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjbG9uZSgpOiBEdXJhdGlvbiB7XHJcblx0XHRyZXR1cm4gbmV3IER1cmF0aW9uKHRoaXMuX2Ftb3VudCwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoaXMgZHVyYXRpb24gZXhwcmVzc2VkIGluIGRpZmZlcmVudCB1bml0IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgZnJhY3Rpb25hbCkuXHJcblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhcyh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0XHRpZiAodGhpcy5fdW5pdCA9PT0gdW5pdCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYW1vdW50O1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLl91bml0ID49IFRpbWVVbml0Lk1vbnRoICYmIHVuaXQgPj0gVGltZVVuaXQuTW9udGgpIHtcclxuXHRcdFx0dmFyIHRoaXNNb250aHMgPSAodGhpcy5fdW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcblx0XHRcdHZhciByZXFNb250aHMgPSAodW5pdCA9PT0gVGltZVVuaXQuWWVhciA/IDEyIDogMSk7XHJcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTW9udGhzIC8gcmVxTW9udGhzO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIHRoaXNNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCk7XHJcblx0XHRcdHZhciByZXFNc2VjID0gYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModW5pdCk7XHJcblx0XHRcdHJldHVybiB0aGlzLl9hbW91bnQgKiB0aGlzTXNlYyAvIHJlcU1zZWM7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDb252ZXJ0IHRoaXMgZHVyYXRpb24gdG8gYSBEdXJhdGlvbiBpbiBhbm90aGVyIHVuaXQuIFlvdSBhbHdheXMgZ2V0IGEgY2xvbmUgZXZlbiBpZiB5b3Ugc3BlY2lmeVxyXG5cdCAqIHRoZSBzYW1lIHVuaXQuXHJcblx0ICogVGhpcyBpcyBwcmVjaXNlIGZvciBZZWFyIDwtPiBNb250aCBhbmQgZm9yIHRpbWUtdG8tdGltZSBjb252ZXJzaW9uIChpLmUuIEhvdXItb3ItbGVzcyB0byBIb3VyLW9yLWxlc3MpLlxyXG5cdCAqIEl0IGlzIGFwcHJveGltYXRlIGZvciBhbnkgb3RoZXIgY29udmVyc2lvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBjb252ZXJ0KHVuaXQ6IFRpbWVVbml0KTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLmFzKHVuaXQpLCB1bml0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBlbnRpcmUgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSlcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaWxsaXNlY29uZHMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1pbGxpc2Vjb25kKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBtaWxsaXNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDQwMCBmb3IgYSAtMDE6MDI6MDMuNDAwIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIG1pbGxpc2Vjb25kKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5NaWxsaXNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHNlY29uZHMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSAxNTAwIG1pbGxpc2Vjb25kcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmRzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5TZWNvbmQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNlY29uZCBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDMgZm9yIGEgLTAxOjAyOjAzLjQwMCBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzZWNvbmQoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LlNlY29uZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIG1pbnV0ZXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDEuNSBmb3IgYSA5MDAwMCBtaWxsaXNlY29uZHMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlcygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuTWludXRlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBtaW51dGUgcGFydCBvZiB0aGUgZHVyYXRpb24gKGFsd2F5cyBwb3NpdGl2ZSlcclxuXHQgKiBGb3IgRGF5L01vbnRoL1llYXIgZHVyYXRpb25zLCB0aGlzIGlzIGFwcHJveGltYXRlIVxyXG5cdCAqIEByZXR1cm4gZS5nLiAyIGZvciBhIC0wMTowMjowMy40MDAgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgbWludXRlKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5NaW51dGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGVudGlyZSBkdXJhdGlvbiBpbiBob3VycyAobmVnYXRpdmUgb3IgcG9zaXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICogRm9yIERheS9Nb250aC9ZZWFyIGR1cmF0aW9ucywgdGhpcyBpcyBhcHByb3hpbWF0ZSFcclxuXHQgKiBAcmV0dXJuIGUuZy4gMS41IGZvciBhIDU0MDAwMDAgbWlsbGlzZWNvbmRzIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGhvdXJzKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5hcyhUaW1lVW5pdC5Ib3VyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBob3VyIHBhcnQgb2YgYSBkdXJhdGlvbi4gVGhpcyBhc3N1bWVzIHRoYXQgYSBkYXkgaGFzIDI0IGhvdXJzICh3aGljaCBpcyBub3QgdGhlIGNhc2VcclxuXHQgKiBkdXJpbmcgRFNUIGNoYW5nZXMpLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBob3VyKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5Ib3VyKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERFUFJFQ0FURURcclxuXHQgKiBUaGUgaG91ciBwYXJ0IG9mIHRoZSBkdXJhdGlvbiAoYWx3YXlzIHBvc2l0aXZlKS5cclxuXHQgKiBOb3RlIHRoYXQgdGhpcyBwYXJ0IGNhbiBleGNlZWQgMjMgaG91cnMsIGJlY2F1c2UgZm9yXHJcblx0ICogbm93LCB3ZSBkbyBub3QgaGF2ZSBhIGRheXMoKSBmdW5jdGlvblxyXG5cdCAqIEZvciBEYXkvTW9udGgvWWVhciBkdXJhdGlvbnMsIHRoaXMgaXMgYXBwcm94aW1hdGUhXHJcblx0ICogQHJldHVybiBlLmcuIDI1IGZvciBhIC0yNTowMjowMy40MDAgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgd2hvbGVIb3VycygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHModGhpcy5fdW5pdCkgKiBNYXRoLmFicyh0aGlzLl9hbW91bnQpIC8gMzYwMDAwMCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gZGF5cyFcclxuXHQgKi9cclxuXHRwdWJsaWMgZGF5cygpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuYXMoVGltZVVuaXQuRGF5KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBkYXkgcGFydCBvZiBhIGR1cmF0aW9uLiBUaGlzIGFzc3VtZXMgdGhhdCBhIG1vbnRoIGhhcyAzMCBkYXlzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBkYXkoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLl9wYXJ0KFRpbWVVbml0LkRheSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIGRheXMgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlLCBmcmFjdGlvbmFsKVxyXG5cdCAqIFRoaXMgaXMgYXBwcm94aW1hdGUgaWYgdGhpcyBkdXJhdGlvbiBpcyBub3QgaW4gTW9udGhzIG9yIFllYXJzIVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtb250aHMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0Lk1vbnRoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBtb250aCBwYXJ0IG9mIGEgZHVyYXRpb24uXHJcblx0ICovXHJcblx0cHVibGljIG1vbnRoKCk6IG51bWJlciB7XHJcblx0XHRyZXR1cm4gdGhpcy5fcGFydChUaW1lVW5pdC5Nb250aCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgZW50aXJlIGR1cmF0aW9uIGluIHllYXJzIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSwgZnJhY3Rpb25hbClcclxuXHQgKiBUaGlzIGlzIGFwcHJveGltYXRlIGlmIHRoaXMgZHVyYXRpb24gaXMgbm90IGluIE1vbnRocyBvciBZZWFycyFcclxuXHQgKi9cclxuXHRwdWJsaWMgeWVhcnMoKTogbnVtYmVyIHtcclxuXHRcdHJldHVybiB0aGlzLmFzKFRpbWVVbml0LlllYXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTm9uLWZyYWN0aW9uYWwgcG9zaXRpdmUgeWVhcnNcclxuXHQgKi9cclxuXHRwdWJsaWMgd2hvbGVZZWFycygpOiBudW1iZXIge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXQgPT09IFRpbWVVbml0LlllYXIpIHtcclxuXHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModGhpcy5fYW1vdW50KSk7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPT09IFRpbWVVbml0Lk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgLyAxMik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkgL1xyXG5cdFx0XHRcdGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKFRpbWVVbml0LlllYXIpKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFtb3VudCBvZiB1bml0cyAocG9zaXRpdmUgb3IgbmVnYXRpdmUsIGZyYWN0aW9uYWwpXHJcblx0ICovXHJcblx0cHVibGljIGFtb3VudCgpOiBudW1iZXIge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2Ftb3VudDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB1bml0IHRoaXMgZHVyYXRpb24gd2FzIGNyZWF0ZWQgd2l0aFxyXG5cdCAqL1xyXG5cdHB1YmxpYyB1bml0KCk6IFRpbWVVbml0IHtcclxuXHRcdHJldHVybiB0aGlzLl91bml0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2lnblxyXG5cdCAqIEByZXR1cm4gXCItXCIgaWYgdGhlIGR1cmF0aW9uIGlzIG5lZ2F0aXZlXHJcblx0ICovXHJcblx0cHVibGljIHNpZ24oKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiAodGhpcy5fYW1vdW50IDwgMCA/IFwiLVwiIDogXCJcIik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8IG90aGVyKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBsZXNzVGhhbihvdGhlcjogRHVyYXRpb24pOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLm1pbGxpc2Vjb25kcygpIDwgb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiAodGhpcyA8PSBvdGhlcilcclxuXHQgKi9cclxuXHRwdWJsaWMgbGVzc0VxdWFsKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMubWlsbGlzZWNvbmRzKCkgPD0gb3RoZXIubWlsbGlzZWNvbmRzKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTaW1pbGFyIGJ1dCBub3QgaWRlbnRpY2FsXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyBhbmQgb3RoZXIgcmVwcmVzZW50IHRoZSBzYW1lIHRpbWUgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgZXF1YWxzKG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0dmFyIGNvbnZlcnRlZCA9IG90aGVyLmNvbnZlcnQodGhpcy5fdW5pdCk7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBjb252ZXJ0ZWQuYW1vdW50KCkgJiYgdGhpcy5fdW5pdCA9PT0gY29udmVydGVkLnVuaXQoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbWlsYXIgYnV0IG5vdCBpZGVudGljYWxcclxuXHQgKiBSZXR1cm5zIGZhbHNlIGlmIHdlIGNhbm5vdCBkZXRlcm1pbmUgd2hldGhlciB0aGV5IGFyZSBlcXVhbCBpbiBhbGwgdGltZSB6b25lc1xyXG5cdCAqIHNvIGUuZy4gNjAgbWludXRlcyBlcXVhbHMgMSBob3VyLCBidXQgMjQgaG91cnMgZG8gTk9UIGVxdWFsIDEgZGF5XHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFRydWUgaWZmIHRoaXMgYW5kIG90aGVyIHJlcHJlc2VudCB0aGUgc2FtZSB0aW1lIGR1cmF0aW9uXHJcblx0ICovXHJcblx0cHVibGljIGVxdWFsc0V4YWN0KG90aGVyOiBEdXJhdGlvbik6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuX3VuaXQgPj0gVGltZVVuaXQuTW9udGggJiYgb3RoZXIudW5pdCgpID49IFRpbWVVbml0Lk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVxdWFscyhvdGhlcik7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3VuaXQgPD0gVGltZVVuaXQuRGF5ICYmIG90aGVyLnVuaXQoKSA8IFRpbWVVbml0LkRheSkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5lcXVhbHMob3RoZXIpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2FtZSB1bml0IGFuZCBzYW1lIGFtb3VudFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBpZGVudGljYWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50ID09PSBvdGhlci5hbW91bnQoKSAmJiB0aGlzLl91bml0ID09PSBvdGhlci51bml0KCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHByb3hpbWF0ZSBpZiB0aGUgZHVyYXRpb25zIGhhdmUgdW5pdHMgdGhhdCBjYW5ub3QgYmUgY29udmVydGVkXHJcblx0ICogQHJldHVybiBUcnVlIGlmZiB0aGlzID4gb3RoZXJcclxuXHQgKi9cclxuXHRwdWJsaWMgZ3JlYXRlclRoYW4ob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+IG90aGVyLm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIEByZXR1cm4gVHJ1ZSBpZmYgdGhpcyA+PSBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBncmVhdGVyRXF1YWwob3RoZXI6IER1cmF0aW9uKTogYm9vbGVhbiB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKSA+PSBvdGhlci5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRoZSBtaW5pbXVtIChtb3N0IG5lZ2F0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtaW4ob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMubGVzc1RoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBAcmV0dXJuIFRoZSBtYXhpbXVtIChtb3N0IHBvc2l0aXZlKSBvZiB0aGlzIGFuZCBvdGhlclxyXG5cdCAqL1xyXG5cdHB1YmxpYyBtYXgob3RoZXI6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHRoaXMuZ3JlYXRlclRoYW4ob3RoZXIpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmNsb25lKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gb3RoZXIuY2xvbmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFwcHJveGltYXRlIGlmIHRoZSBkdXJhdGlvbnMgaGF2ZSB1bml0cyB0aGF0IGNhbm5vdCBiZSBjb252ZXJ0ZWRcclxuXHQgKiBNdWx0aXBseSB3aXRoIGEgZml4ZWQgbnVtYmVyLlxyXG5cdCAqIEByZXR1cm4gYSBuZXcgRHVyYXRpb24gb2YgKHRoaXMgKiB2YWx1ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgbXVsdGlwbHkodmFsdWU6IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICogdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQXBwcm94aW1hdGUgaWYgdGhlIGR1cmF0aW9ucyBoYXZlIHVuaXRzIHRoYXQgY2Fubm90IGJlIGNvbnZlcnRlZFxyXG5cdCAqIERpdmlkZSBieSBhIGZpeGVkIG51bWJlci5cclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC8gdmFsdWUpXHJcblx0ICovXHJcblx0cHVibGljIGRpdmlkZSh2YWx1ZTogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0aWYgKHZhbHVlID09PSAwKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkR1cmF0aW9uLmRpdmlkZSgpOiBEaXZpZGUgYnkgemVyb1wiKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50IC8gdmFsdWUsIHRoaXMuX3VuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGEgZHVyYXRpb24uXHJcblx0ICogQHJldHVybiBhIG5ldyBEdXJhdGlvbiBvZiAodGhpcyArIHZhbHVlKSB3aXRoIHRoZSB1bml0IG9mIHRoaXMgZHVyYXRpb25cclxuXHQgKi9cclxuXHRwdWJsaWMgYWRkKHZhbHVlOiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdHJldHVybiBuZXcgRHVyYXRpb24odGhpcy5fYW1vdW50ICsgdmFsdWUuYXModGhpcy5fdW5pdCksIHRoaXMuX3VuaXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU3VidHJhY3QgYSBkdXJhdGlvbi5cclxuXHQgKiBAcmV0dXJuIGEgbmV3IER1cmF0aW9uIG9mICh0aGlzIC0gdmFsdWUpIHdpdGggdGhlIHVuaXQgb2YgdGhpcyBkdXJhdGlvblxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdWIodmFsdWU6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0cmV0dXJuIG5ldyBEdXJhdGlvbih0aGlzLl9hbW91bnQgLSB2YWx1ZS5hcyh0aGlzLl91bml0KSwgdGhpcy5fdW5pdCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoZSBkdXJhdGlvbiBpLmUuIHJlbW92ZSB0aGUgc2lnbi5cclxuXHQgKi9cclxuXHRwdWJsaWMgYWJzKCk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh0aGlzLl9hbW91bnQgPj0gMCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMubXVsdGlwbHkoLTEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogREVQUkVDQVRFRFxyXG5cdCAqIFN0cmluZyBpbiBbLV1oaGhoOm1tOnNzLm5ubiBub3RhdGlvbi4gQWxsIGZpZWxkcyBhcmVcclxuXHQgKiBhbHdheXMgcHJlc2VudCBleGNlcHQgdGhlIHNpZ24uXHJcblx0ICovXHJcblx0cHVibGljIHRvRnVsbFN0cmluZygpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIHRoaXMudG9IbXNTdHJpbmcodHJ1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdHJpbmcgaW4gWy1daGhoaDptbVs6c3NbLm5ubl1dIG5vdGF0aW9uLlxyXG5cdCAqIEBwYXJhbSBmdWxsIElmIHRydWUsIHRoZW4gYWxsIGZpZWxkcyBhcmUgYWx3YXlzIHByZXNlbnQgZXhjZXB0IHRoZSBzaWduLiBPdGhlcndpc2UsIHNlY29uZHMgYW5kIG1pbGxpc2Vjb25kc1xyXG5cdCAqICAgICAgICAgICAgIGFyZSBjaG9wcGVkIG9mZiBpZiB6ZXJvXHJcblx0ICovXHJcblx0cHVibGljIHRvSG1zU3RyaW5nKGZ1bGw6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XHJcblx0XHR2YXIgcmVzdWx0OiBzdHJpbmcgPSBcIlwiO1xyXG5cdFx0aWYgKGZ1bGwgfHwgdGhpcy5taWxsaXNlY29uZCgpID4gMCkge1xyXG5cdFx0XHRyZXN1bHQgPSBcIi5cIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLm1pbGxpc2Vjb25kKCkudG9TdHJpbmcoMTApLCAzLCBcIjBcIik7XHJcblx0XHR9XHJcblx0XHRpZiAoZnVsbCB8fCByZXN1bHQubGVuZ3RoID4gMCB8fCB0aGlzLnNlY29uZCgpID4gMCkge1xyXG5cdFx0XHRyZXN1bHQgPSBcIjpcIiArIHN0cmluZ3MucGFkTGVmdCh0aGlzLnNlY29uZCgpLnRvU3RyaW5nKDEwKSwgMiwgXCIwXCIpICsgcmVzdWx0O1xyXG5cdFx0fVxyXG5cdFx0aWYgKGZ1bGwgfHwgcmVzdWx0Lmxlbmd0aCA+IDAgfHwgdGhpcy5taW51dGUoKSA+IDApIHtcclxuXHRcdFx0cmVzdWx0ID0gXCI6XCIgKyBzdHJpbmdzLnBhZExlZnQodGhpcy5taW51dGUoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLnNpZ24oKSArIHN0cmluZ3MucGFkTGVmdCh0aGlzLndob2xlSG91cnMoKS50b1N0cmluZygxMCksIDIsIFwiMFwiKSArIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0cmluZyBpbiBJU08gODYwMSBub3RhdGlvbiBlLmcuICdQMU0nIGZvciBvbmUgbW9udGggb3IgJ1BUMU0nIGZvciBvbmUgbWludXRlXHJcblx0ICovXHJcblx0cHVibGljIHRvSXNvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRzd2l0Y2ggKHRoaXMuX3VuaXQpIHtcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaWxsaXNlY29uZDoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArICh0aGlzLl9hbW91bnQgLyAxMDAwKS50b0ZpeGVkKDMpICsgXCJTXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5TZWNvbmQ6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQXCIgKyB0aGlzLl9hbW91bnQudG9TdHJpbmcoMTApICsgXCJTXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5NaW51dGU6IHtcclxuXHRcdFx0XHRyZXR1cm4gXCJQVFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiOyAvLyBub3RlIHRoZSBcIlRcIiB0byBkaXNhbWJpZ3VhdGUgdGhlIFwiTVwiXHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5Ib3VyOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiSFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuRGF5OiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiRFwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuV2Vlazoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIldcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiB7XHJcblx0XHRcdFx0cmV0dXJuIFwiUFwiICsgdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiTVwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuWWVhcjoge1xyXG5cdFx0XHRcdHJldHVybiBcIlBcIiArIHRoaXMuX2Ftb3VudC50b1N0cmluZygxMCkgKyBcIllcIjtcclxuXHRcdFx0fVxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcGVyaW9kIHVuaXQuXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0cmluZyByZXByZXNlbnRhdGlvbiB3aXRoIGFtb3VudCBhbmQgdW5pdCBlLmcuICcxLjUgeWVhcnMnIG9yICctMSBkYXknXHJcblx0ICovXHJcblx0cHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gdGhpcy5fYW1vdW50LnRvU3RyaW5nKDEwKSArIFwiIFwiICsgYmFzaWNzLnRpbWVVbml0VG9TdHJpbmcodGhpcy5fdW5pdCwgdGhpcy5fYW1vdW50KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVzZWQgYnkgdXRpbC5pbnNwZWN0KClcclxuXHQgKi9cclxuXHRwdWJsaWMgaW5zcGVjdCgpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFwiW0R1cmF0aW9uOiBcIiArIHRoaXMudG9TdHJpbmcoKSArIFwiXVwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHZhbHVlT2YoKSBtZXRob2QgcmV0dXJucyB0aGUgcHJpbWl0aXZlIHZhbHVlIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB2YWx1ZU9mKCk6IGFueSB7XHJcblx0XHRyZXR1cm4gdGhpcy5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiB0aGlzICUgdW5pdCwgYWx3YXlzIHBvc2l0aXZlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfcGFydCh1bml0OiBUaW1lVW5pdCk6IG51bWJlciB7XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICh1bml0ID09PSBUaW1lVW5pdC5ZZWFyKSB7XHJcblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGguYWJzKHRoaXMuYXMoVGltZVVuaXQuWWVhcikpKTtcclxuXHRcdH1cclxuXHRcdHZhciBuZXh0VW5pdDogVGltZVVuaXQ7XHJcblx0XHQvLyBub3RlIG5vdCBhbGwgdW5pdHMgYXJlIHVzZWQgaGVyZTogV2Vla3MgYW5kIFllYXJzIGFyZSBydWxlZCBvdXRcclxuXHRcdHN3aXRjaCAodW5pdCkge1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1pbGxpc2Vjb25kOiBuZXh0VW5pdCA9IFRpbWVVbml0LlNlY29uZDsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuU2Vjb25kOiBuZXh0VW5pdCA9IFRpbWVVbml0Lk1pbnV0ZTsgYnJlYWs7XHJcblx0XHRcdGNhc2UgVGltZVVuaXQuTWludXRlOiBuZXh0VW5pdCA9IFRpbWVVbml0LkhvdXI7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0LkhvdXI6IG5leHRVbml0ID0gVGltZVVuaXQuRGF5OyBicmVhaztcclxuXHRcdFx0Y2FzZSBUaW1lVW5pdC5EYXk6IG5leHRVbml0ID0gVGltZVVuaXQuTW9udGg7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFRpbWVVbml0Lk1vbnRoOiBuZXh0VW5pdCA9IFRpbWVVbml0LlllYXI7IGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBtc2VjcyA9IChiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh0aGlzLl91bml0KSAqIE1hdGguYWJzKHRoaXMuX2Ftb3VudCkpICUgYmFzaWNzLnRpbWVVbml0VG9NaWxsaXNlY29uZHMobmV4dFVuaXQpO1xyXG5cdFx0cmV0dXJuIE1hdGguZmxvb3IobXNlY3MgLyBiYXNpY3MudGltZVVuaXRUb01pbGxpc2Vjb25kcyh1bml0KSk7XHJcblx0fVxyXG5cclxuXHJcblx0cHJpdmF0ZSBfZnJvbVN0cmluZyhzOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdHZhciB0cmltbWVkID0gcy50cmltKCk7XHJcblx0XHRpZiAodHJpbW1lZC5tYXRjaCgvXi0/XFxkXFxkPyg6XFxkXFxkPyg6XFxkXFxkPyguXFxkXFxkP1xcZD8pPyk/KT8kLykpIHtcclxuXHRcdFx0dmFyIHNpZ246IG51bWJlciA9IDE7XHJcblx0XHRcdHZhciBob3VyczogbnVtYmVyID0gMDtcclxuXHRcdFx0dmFyIG1pbnV0ZXM6IG51bWJlciA9IDA7XHJcblx0XHRcdHZhciBzZWNvbmRzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHR2YXIgbWlsbGlzZWNvbmRzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHR2YXIgcGFydHM6IHN0cmluZ1tdID0gdHJpbW1lZC5zcGxpdChcIjpcIik7XHJcblx0XHRcdGFzc2VydChwYXJ0cy5sZW5ndGggPiAwICYmIHBhcnRzLmxlbmd0aCA8IDQsIFwiTm90IGEgcHJvcGVyIHRpbWUgZHVyYXRpb24gc3RyaW5nOiBcXFwiXCIgKyB0cmltbWVkICsgXCJcXFwiXCIpO1xyXG5cdFx0XHRpZiAodHJpbW1lZC5jaGFyQXQoMCkgPT09IFwiLVwiKSB7XHJcblx0XHRcdFx0c2lnbiA9IC0xO1xyXG5cdFx0XHRcdHBhcnRzWzBdID0gcGFydHNbMF0uc3Vic3RyKDEpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0aG91cnMgPSArcGFydHNbMF07XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRtaW51dGVzID0gK3BhcnRzWzFdO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChwYXJ0cy5sZW5ndGggPiAyKSB7XHJcblx0XHRcdFx0dmFyIHNlY29uZFBhcnRzID0gcGFydHNbMl0uc3BsaXQoXCIuXCIpO1xyXG5cdFx0XHRcdHNlY29uZHMgPSArc2Vjb25kUGFydHNbMF07XHJcblx0XHRcdFx0aWYgKHNlY29uZFBhcnRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRcdG1pbGxpc2Vjb25kcyA9ICtzdHJpbmdzLnBhZFJpZ2h0KHNlY29uZFBhcnRzWzFdLCAzLCBcIjBcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHZhciBhbW91bnRNc2VjID0gc2lnbiAqIE1hdGgucm91bmQobWlsbGlzZWNvbmRzICsgMTAwMCAqIHNlY29uZHMgKyA2MDAwMCAqIG1pbnV0ZXMgKyAzNjAwMDAwICogaG91cnMpO1xyXG5cdFx0XHQvLyBmaW5kIGxvd2VzdCBub24temVybyBudW1iZXIgYW5kIHRha2UgdGhhdCBhcyB1bml0XHJcblx0XHRcdGlmIChtaWxsaXNlY29uZHMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcblx0XHRcdH0gZWxzZSBpZiAoc2Vjb25kcyAhPT0gMCkge1xyXG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5TZWNvbmQ7XHJcblx0XHRcdH0gZWxzZSBpZiAobWludXRlcyAhPT0gMCkge1xyXG5cdFx0XHRcdHRoaXMuX3VuaXQgPSBUaW1lVW5pdC5NaW51dGU7XHJcblx0XHRcdH0gZWxzZSBpZiAoaG91cnMgIT09IDApIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuSG91cjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLl91bml0ID0gVGltZVVuaXQuTWlsbGlzZWNvbmQ7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5fYW1vdW50ID0gYW1vdW50TXNlYyAvIGJhc2ljcy50aW1lVW5pdFRvTWlsbGlzZWNvbmRzKHRoaXMuX3VuaXQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dmFyIHNwbGl0ID0gdHJpbW1lZC50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0aWYgKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJ1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHR2YXIgYW1vdW50ID0gcGFyc2VGbG9hdChzcGxpdFswXSk7XHJcblx0XHRcdGFzc2VydCghaXNOYU4oYW1vdW50KSwgXCJJbnZhbGlkIHRpbWUgc3RyaW5nICdcIiArIHMgKyBcIicsIGNhbm5vdCBwYXJzZSBhbW91bnRcIik7XHJcblx0XHRcdGFzc2VydChpc0Zpbml0ZShhbW91bnQpLCBcIkludmFsaWQgdGltZSBzdHJpbmcgJ1wiICsgcyArIFwiJywgYW1vdW50IGlzIGluZmluaXRlXCIpO1xyXG5cdFx0XHR0aGlzLl9hbW91bnQgPSBhbW91bnQ7XHJcblx0XHRcdHRoaXMuX3VuaXQgPSBiYXNpY3Muc3RyaW5nVG9UaW1lVW5pdChzcGxpdFsxXSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9