/**
* Copyright(c) 2014 Spirit IT BV
*
* Periodic interval functions
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

var basics = require("./basics");
var TimeUnit = basics.TimeUnit;

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
        case 0 /* RegularIntervals */:
            return "regular intervals";
        case 1 /* RegularLocalTime */:
            return "regular local time";

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
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
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
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("Unknown period unit.");
                }
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
            return new DateTime(d.year(), d.month(), Math.min(basics.daysInMonth(d.year(), d.month()), this._start.day()), d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
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
        } else {
            this._intDst = 0 /* RegularIntervals */;
        }

        // normalize start day
        this._intStart = this._normalizeDay(this._start, false);
    };
    return Period;
})();
exports.Period = Period;
//# sourceMappingURL=period.js.map
