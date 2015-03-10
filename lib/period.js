/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Periodic interval functions
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var basics = require("./basics");
var TimeUnit = basics.TimeUnit;
var duration = require("./duration");
var Duration = duration.Duration;
var datetime = require("./datetime");
var DateTime = datetime.DateTime;
var timezone = require("./timezone");
var TimeZone = timezone.TimeZone;
var TimeZoneKind = timezone.TimeZoneKind;
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
        case 0 /* RegularIntervals */: return "regular intervals";
        case 1 /* RegularLocalTime */: return "regular local time";
        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unknown PeriodDst");
            }
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
     *              if the time zone of the start datetime does not have DST.
     *              Defaults to RegularLocalTime.
     */
    function Period(start, amount, unit, dst) {
        if (dst === void 0) { dst = 1 /* RegularLocalTime */; }
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
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intAmount, this._intUnit);
                }
            }
            else {
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
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(normalFrom)) {
                    approx = approx.addLocal(this._intAmount, this._intUnit);
                }
            }
        }
        else {
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
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intAmount, this._intUnit);
                }
            }
            else {
                switch (this._intUnit) {
                    case 0 /* Second */:
                        if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
                            // optimization: same second each minute, so just take the fromDate minus one minute with the this._intStart seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 1 /* Minute */);
                        }
                        else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate start-of-day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 3600) % this._intAmount);
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 0 /* Second */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 3 /* Day */);
                                }
                            }
                            else {
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
                                }
                                else if (approx2.lessEqual(normalFrom)) {
                                    // change min index to search upper subarray
                                    imin = imid + 1;
                                }
                                else {
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
                        }
                        else {
                            // per constructor assert, the seconds fit in a day, so just go the fromDate previous day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 60) % this._intAmount);
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 1 /* Minute */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 3 /* Day */);
                                }
                            }
                            else {
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
                        }
                        else {
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
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
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
        if (count === void 0) { count = 1; }
        assert(prev !== null, "Prev must be non-null");
        assert((this._intStart.zone() === null) === (prev.zone() === null), "The fromDate and startDate must both be aware or unaware");
        assert(typeof (count) === "number", "Count must be a number");
        assert(count >= 1 && Math.floor(count) === count, "Count must be an integer >= 1");
        var normalizedPrev = this._normalizeDay(prev.toZone(this._start.zone()));
        if (this._intDst === 0 /* RegularIntervals */) {
            return this._correctDay(normalizedPrev.add(this._intAmount * count, this._intUnit)).convert(prev.zone());
        }
        else {
            return this._correctDay(normalizedPrev.addLocal(this._intAmount * count, this._intUnit)).convert(prev.zone());
        }
    };
    /**
     * Checks whether the given date is on a period boundary
     * (expensive!)
     */
    Period.prototype.isBoundary = function (occurrence) {
        if (!occurrence) {
            return false;
        }
        assert((this._intStart.zone() === null) === (occurrence.zone() === null), "The occurrence and startDate must both be aware or unaware");
        return (this.findFirst(occurrence.sub(Duration.milliseconds(1))).equals(occurrence));
    };
    Period.prototype._periodIsoString = function () {
        switch (this._unit) {
            case 0 /* Second */: {
                return "P" + this._amount.toString(10) + "S";
            }
            case 1 /* Minute */: {
                return "PT" + this._amount.toString(10) + "M"; // note the "T" to disambiguate the "M"
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
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
        }
    };
    /**
     * Returns true iff this period has the same effect as the given one.
     * i.e. a period of 24 hours is equal to one of 1 day if they have the same UTC start moment
     * and same dst.
     */
    Period.prototype.equals = function (other) {
        // note we take the non-normalized start() because this has an influence on the outcome
        return (this.start().equals(other.start()) && this._intAmount === other._intAmount && this._intUnit === other._intUnit && this._intDst === other._intDst);
    };
    /**
     * Returns true iff this period was constructed with identical arguments to the other one.
     */
    Period.prototype.identical = function (other) {
        return (this.start().identical(other.start()) && this.amount() === other.amount() && this.unit() === other.unit() && this.dst() === other.dst());
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
            result += ", keeping " + periodDstToString(this._dst);
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
            return new DateTime(d.year(), d.month(), Math.min(basics.daysInMonth(d.year(), d.month()), this._start.day()), d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        }
        else {
            return d;
        }
    };
    /**
     * If this._internalUnit in [Month, Year], normalizes the day-of-month
     * to <= 28.
     * @return a new date if different, otherwise the exact same object (no clone!)
     */
    Period.prototype._normalizeDay = function (d, anymonth) {
        if (anymonth === void 0) { anymonth = true; }
        if ((this._intUnit === 5 /* Month */ && d.day() > 28) || (this._intUnit === 6 /* Year */ && (d.month() === 2 || anymonth) && d.day() > 28)) {
            return new DateTime(d.year(), d.month(), 28, d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
        }
        else {
            return d; // save on time by not returning a clone
        }
    };
    /**
     * Returns true if DST handling is relevant for us.
     * (i.e. if the start time zone has DST)
     */
    Period.prototype._dstRelevant = function () {
        return (this._start.zone() != null && this._start.zone().kind() === 2 /* Proper */ && this._start.zone().hasDst());
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
        }
        else {
            this._intDst = 0 /* RegularIntervals */;
        }
        // normalize start day
        this._intStart = this._normalizeDay(this._start, false);
    };
    return Period;
})();
exports.Period = Period;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBlcmlvZC50cyJdLCJuYW1lcyI6WyJQZXJpb2REc3QiLCJwZXJpb2REc3RUb1N0cmluZyIsIlBlcmlvZCIsIlBlcmlvZC5jb25zdHJ1Y3RvciIsIlBlcmlvZC5zdGFydCIsIlBlcmlvZC5hbW91bnQiLCJQZXJpb2QudW5pdCIsIlBlcmlvZC5kc3QiLCJQZXJpb2QuZmluZEZpcnN0IiwiUGVyaW9kLmZpbmROZXh0IiwiUGVyaW9kLmlzQm91bmRhcnkiLCJQZXJpb2QuX3BlcmlvZElzb1N0cmluZyIsIlBlcmlvZC5lcXVhbHMiLCJQZXJpb2QuaWRlbnRpY2FsIiwiUGVyaW9kLnRvSXNvU3RyaW5nIiwiUGVyaW9kLnRvU3RyaW5nIiwiUGVyaW9kLmluc3BlY3QiLCJQZXJpb2QuX2NvcnJlY3REYXkiLCJQZXJpb2QuX25vcm1hbGl6ZURheSIsIlBlcmlvZC5fZHN0UmVsZXZhbnQiLCJQZXJpb2QuX2NhbGNJbnRlcm5hbFZhbHVlcyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILEFBRUEsMkNBRjJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWxDLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQU8sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFFbEMsSUFBTyxRQUFRLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFDeEMsSUFBTyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUVwQyxJQUFPLFFBQVEsV0FBVyxZQUFZLENBQUMsQ0FBQztBQUN4QyxJQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBRXBDLElBQU8sUUFBUSxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBQ3hDLElBQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDcEMsSUFBTyxZQUFZLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUc1QyxBQUlBOzs7R0FERztBQUNI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QSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDNUhBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxZQUFhQTt3QkFDakJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQ3JGQSxVQUFVQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDaElBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxXQUFZQTt3QkFDaEJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQ3JGQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDcElBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxhQUFjQTt3QkFDbEJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQ3pGQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDcElBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxZQUFhQTt3QkFDakJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQzdGQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFFQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDcElBLEtBQUtBLENBQUNBO29CQUVQQTt3QkFDQ0EsQUFFQUEsd0JBRndCQTt3QkFDeEJBLDBCQUEwQkE7d0JBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDVkEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQTt3QkFDckNBLENBQUNBO2dCQUNIQSxDQUFDQTtnQkFDREEsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7b0JBQ3RDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtnQkFDckRBLENBQUNBO1lBQ0ZBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUVQQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdkJBLEtBQUtBLGNBQWVBO3dCQUNuQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDNUVBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNuSEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGNBQWVBO3dCQUNuQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDNUVBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUN2SEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDNUVBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUMzSEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFdBQVlBO3dCQUNoQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDNUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUMvSEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGFBQWNBO3dCQUNsQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDaEZBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUMvSEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDcEZBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUMvSEEsS0FBS0EsQ0FBQ0E7b0JBRVBBO3dCQUNDQSxBQUVBQSx3QkFGd0JBO3dCQUN4QkEsMEJBQTBCQTt3QkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNWQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO3dCQUNyQ0EsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUNEQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQTtvQkFDeENBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO2dCQUMxREEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsQUFDQUEsbUJBRG1CQTtZQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsS0FBS0Esd0JBQTBCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFFakRBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUN2QkEsS0FBS0EsY0FBZUE7d0JBQ25CQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTt3QkFDakRBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO3dCQUM3Q0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7d0JBQ3RFQSxLQUFLQSxDQUFDQTtvQkFDUEEsS0FBS0EsY0FBZUE7d0JBQ25CQSxBQUNBQSx3RUFEd0VBO3dCQUN4RUEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7d0JBQ2pEQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTt3QkFDN0NBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO3dCQUN0RUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7d0JBQy9DQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTt3QkFDN0NBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO3dCQUN0RUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFdBQVlBO3dCQUNoQkEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7d0JBQ3BEQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTt3QkFDN0NBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO3dCQUN0RUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGFBQWNBO3dCQUNsQkEsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3hIQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTt3QkFDMURBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO3dCQUN0RUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsQUFDQUEsOEZBRDhGQTt3QkFDOUZBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO3dCQUNyREEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsRUFBRUEsNkJBQTZCQTt3QkFDeEZBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLFlBQWFBLENBQUNBLENBQUNBO3dCQUN0RUEsS0FBS0EsQ0FBQ0E7b0JBRVBBO3dCQUNDQSxBQUVBQSx3QkFGd0JBO3dCQUN4QkEsMEJBQTBCQTt3QkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNWQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO3dCQUNyQ0EsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUNEQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQTtvQkFDdENBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO2dCQUNyREEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBRVBBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUN2QkEsS0FBS0EsY0FBZUE7d0JBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDMURBLEFBQ0FBLG9IQURvSEE7NEJBQ3BIQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUM1RUEsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FDcEhBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLGNBQWVBLENBQUNBLENBQUNBO3dCQUNoQ0EsQ0FBQ0E7d0JBQUNBLElBQUlBLENBQUNBLENBQUNBOzRCQUNQQSxBQUNBQSxnR0FEZ0dBOzRCQUNoR0EsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDNUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBOzRCQUUvSEEsQUFDQUEscUhBRHFIQTs0QkFDckhBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBOzRCQUN0REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxjQUFlQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxD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LFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQ3hIQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxZQUFhQSxDQUFDQSxDQUFDQTt3QkFDOUJBLENBQUNBO3dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDUEEsQUFDQUEseUZBRHlGQTs0QkFDekZBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTs0QkFFL0hBLEFBQ0FBLHFIQURxSEE7NEJBQ3JIQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTs0QkFDcERBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dDQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsY0FBZUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQ3pFQSxBQUNBQSxvRUFEb0VBO29DQUNwRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0E7Z0NBQzNDQSxDQUFDQTs0QkFDRkEsQ0FBQ0E7NEJBQUNBLElBQUlBLENBQUNBLENBQUNBO2dDQUNQQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxXQUFZQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxjQUFlQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQ0FDakdBLEFBQ0FBLCtEQUQrREE7b0NBQy9EQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxXQUFZQSxDQUFDQSxDQUFDQTtnQ0FDM0NBLENBQUNBOzRCQUNGQSxDQUFDQTt3QkFDRkEsQ0FBQ0E7d0JBQ0RBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxZQUFhQTt3QkFDakJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFFL0hBLEFBQ0FBLHFIQURxSEE7d0JBQ3JIQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTt3QkFDN0NBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsWUFBYUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQ3ZFQSxBQUNBQSxvRUFEb0VBO2dDQUNwRUEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0E7NEJBQzNDQSxDQUFDQTt3QkFDRkEsQ0FBQ0E7d0JBQUNBLElBQUlBLENBQUNBLENBQUNBOzRCQUNQQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxXQUFZQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxZQUFhQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDL0ZBLEFBQ0FBLCtEQUQrREE7Z0NBQy9EQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxXQUFZQSxDQUFDQSxDQUFDQTs0QkFDM0NBLENBQUNBO3dCQUNGQSxDQUFDQTt3QkFDREEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFdBQVlBO3dCQUNoQkEsQUFDQUEsb0ZBRG9GQTt3QkFDcEZBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEtBQUtBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBO3dCQUNwREEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7d0JBQzdDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTt3QkFDM0VBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxhQUFjQTt3QkFDbEJBLEFBRUFBLG9GQUZvRkE7d0JBQ3BGQSw4RkFBOEZBO3dCQUM5RkEsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7d0JBQzVHQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSw2QkFBNkJBO3dCQUN4RkEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQzdFQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFL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LElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO1FBQy9HQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEUDs7O09BR0dBO0lBQ0lBLDJCQUFVQSxHQUFqQkEsVUFBa0JBLFVBQW9CQTtRQUNyQ1EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLElBQUlBLENBQUNBLEVBQ3ZFQSw0REFBNERBLENBQUNBLENBQUNBO1FBQy9EQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0RkEsQ0FBQ0E7SUFFT1IsaUNBQWdCQSxHQUF4QkE7UUFDQ1MsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLEtBQUtBLGNBQWVBLEVBQUVBLENBQUNBO2dCQUN0QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7WUFDOUNBLENBQUNBO1lBQ0RBLEtBQUtBLGNBQWVBLEVBQUVBLENBQUNBO2dCQUN0QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsdUNBQXVDQTtZQUN2RkEsQ0FBQ0EsR0FEOENBO1lBRS9DQSxLQUFLQSxZQUFhQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxXQUFZQSxFQUFFQSxDQUFDQTtnQkFDbkJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxZQUFhQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxhQUFjQSxFQUFFQSxDQUFDQTtnQkFDckJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUNEQSxLQUFLQSxZQUFhQSxFQUFFQSxDQUFDQTtnQkFDcEJBLE1BQU1BLENBQUNBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzlDQSxDQUFDQTtZQUVEQTtnQkFDQ0EsQUFFQUEsd0JBRndCQTtnQkFDeEJBLDBCQUEwQkE7Z0JBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxD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QUdBLENBQUNBLENBQUNBO1lBQ3RDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxXQUFZQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsS0FBS0EsYUFBY0EsSUFBSUEsSUFBSUEsQ0FBQ0EsVUFBVUEsSUFBSUEsRUFBRUEsSUFBSUEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0ZBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ3ZDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxZQUFhQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFFREEsQUFDQUEseUJBRHlCQTtRQUN6QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQzFCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNQQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSx3QkFBMEJBLENBQUNBO1FBQzNDQSxDQUFDQTtRQUVEQSxBQUNBQSxzQkFEc0JBO1FBQ3RCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN6REEsQ0FBQ0E7SUFFRmxCLGFBQUNBO0FBQURBLENBdG5CQSxBQXNuQkNBLElBQUE7QUF0bkJZLGNBQU0sR0FBTixNQXNuQlosQ0FBQSIsImZpbGUiOiJsaWIvcGVyaW9kLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOltudWxsXX0=