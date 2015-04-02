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
    /**
     * End-of-enum marker
     */
    PeriodDst[PeriodDst["MAX"] = 2] = "MAX";
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
     * Constructor implementation. See other constructors for explanation.
     */
    function Period(start, amountOrInterval, unitOrDst, givenDst) {
        var interval;
        var dst = 1 /* RegularLocalTime */;
        if (typeof (amountOrInterval) === "object") {
            interval = amountOrInterval;
            dst = unitOrDst;
        }
        else {
            assert(typeof unitOrDst === "number" && unitOrDst >= 0 && unitOrDst < 8 /* MAX */, "Invalid unit");
            interval = new Duration(amountOrInterval, unitOrDst);
            dst = givenDst;
        }
        if (typeof dst !== "number") {
            dst = 1 /* RegularLocalTime */;
        }
        assert(dst >= 0 && dst < 2 /* MAX */, "Invalid PeriodDst setting");
        assert(start !== null, "Start time may not be null");
        assert(interval.amount() > 0, "Amount must be positive non-zero.");
        assert(Math.floor(interval.amount()) === interval.amount(), "Amount must be a whole number");
        this._start = start;
        this._interval = interval;
        this._dst = dst;
        this._calcInternalValues();
        // regular local time keeping is only supported if we can reset each day
        // Note we use internal amounts to decide this because actually it is supported if
        // the input is a multiple of one day.
        if (this._dstRelevant() && dst === 1 /* RegularLocalTime */) {
            switch (this._intInterval.unit()) {
                case 0 /* Millisecond */:
                    assert(this._intInterval.amount() < 86400000, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 1 /* Second */:
                    assert(this._intInterval.amount() < 86400, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 2 /* Minute */:
                    assert(this._intInterval.amount() < 1440, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
                case 3 /* Hour */:
                    assert(this._intInterval.amount() < 24, "When using Hour, Minute or (Milli)Second units, with Regular Local Times, " + "then the amount must be either less than a day or a multiple of the next unit.");
                    break;
            }
        }
    }
    /**
     * Return a fresh copy of the period
     */
    Period.prototype.clone = function () {
        return new Period(this._start, this._interval, this._dst);
    };
    /**
     * The start date
     */
    Period.prototype.start = function () {
        return this._start;
    };
    /**
     * The interval
     */
    Period.prototype.interval = function () {
        return this._interval.clone();
    };
    /**
     * DEPRECATED
     * The amount of units of the interval
     */
    Period.prototype.amount = function () {
        return this._interval.amount();
    };
    /**
     * DEPRECATED
     * The unit of the interval
     */
    Period.prototype.unit = function () {
        return this._interval.unit();
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
        var approx2;
        var approxMin;
        var periods;
        var diff;
        var newYear;
        var newMonth;
        var remainder;
        var imax;
        var imin;
        var imid;
        var normalFrom = this._normalizeDay(fromDate.toZone(this._intStart.zone()));
        // Simple case: period has not started yet.
        if (normalFrom.lessThan(this._intStart)) {
            // use toZone because we don't want to return a reference to our internal member
            return this._correctDay(this._intStart).toZone(fromDate.zone());
        }
        if (this._intInterval.amount() === 1) {
            // simple cases: amount equals 1 (eliminates need for searching for starting point)
            if (this._intDst === 0 /* RegularIntervals */) {
                switch (this._intInterval.unit()) {
                    case 0 /* Millisecond */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), normalFrom.utcMillisecond(), TimeZone.utc());
                        break;
                    case 1 /* Second */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 2 /* Minute */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), normalFrom.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 3 /* Hour */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), normalFrom.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 4 /* Day */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 6 /* Month */:
                        approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), this._intStart.utcDay(), this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
                        break;
                    case 7 /* Year */:
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
                    approx = approx.add(this._intInterval.amount(), this._intInterval.unit());
                }
            }
            else {
                switch (this._intInterval.unit()) {
                    case 0 /* Millisecond */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), normalFrom.millisecond(), this._intStart.zone());
                        break;
                    case 1 /* Second */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 2 /* Minute */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 3 /* Hour */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 4 /* Day */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 6 /* Month */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 7 /* Year */:
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
                    approx = approx.addLocal(this._intInterval.amount(), this._intInterval.unit());
                }
            }
        }
        else {
            // Amount is not 1,
            if (this._intDst === 0 /* RegularIntervals */) {
                switch (this._intInterval.unit()) {
                    case 0 /* Millisecond */:
                        diff = normalFrom.diff(this._intStart).milliseconds();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intStart.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 1 /* Second */:
                        diff = normalFrom.diff(this._intStart).seconds();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intStart.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 2 /* Minute */:
                        // only 25 leap seconds have ever been added so this should still be OK.
                        diff = normalFrom.diff(this._intStart).minutes();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intStart.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 3 /* Hour */:
                        diff = normalFrom.diff(this._intStart).hours();
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intStart.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 4 /* Day */:
                        diff = normalFrom.diff(this._intStart).hours() / 24;
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intStart.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 6 /* Month */:
                        diff = (normalFrom.utcYear() - this._intStart.utcYear()) * 12 + (normalFrom.utcMonth() - this._intStart.utcMonth()) - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intInterval.amount());
                        approx = this._intStart.add(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 7 /* Year */:
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intStart.year() - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intInterval.amount()); // max needed due to -1 above
                        approx = this._intStart.add(periods * this._intInterval.amount(), 7 /* Year */);
                        break;
                    default:
                        /* istanbul ignore if */
                        /* istanbul ignore next */
                        if (true) {
                            throw new Error("Unknown TimeUnit");
                        }
                }
                while (!approx.greaterThan(fromDate)) {
                    approx = approx.add(this._intInterval.amount(), this._intInterval.unit());
                }
            }
            else {
                switch (this._intInterval.unit()) {
                    case 0 /* Millisecond */:
                        if (this._intInterval.amount() < 1000 && (1000 % this._intInterval.amount()) === 0) {
                            // optimization: same millisecond each second, so just take the fromDate minus one second with the this._intStart milliseconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 1 /* Second */);
                        }
                        else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate start-of-day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 3600 * 1000) % this._intInterval.amount());
                            if (approx.greaterThan(normalFrom)) {
                                // todo
                                /* istanbul ignore if */
                                if (approx.subLocal(remainder, 0 /* Millisecond */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 4 /* Day */);
                                }
                            }
                            else {
                                if (approx.addLocal(1, 4 /* Day */).subLocal(remainder, 0 /* Millisecond */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 4 /* Day */);
                                }
                            }
                            // optimization: binary search
                            imax = Math.floor((24 * 3600 * 1000) / this._intInterval.amount());
                            imin = 0;
                            while (imax >= imin) {
                                // calculate the midpoint for roughly equal partition
                                imid = Math.floor((imin + imax) / 2);
                                approx2 = approx.addLocal(imid * this._intInterval.amount(), 0 /* Millisecond */);
                                approxMin = approx2.subLocal(this._intInterval.amount(), 0 /* Millisecond */);
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
                    case 1 /* Second */:
                        if (this._intInterval.amount() < 60 && (60 % this._intInterval.amount()) === 0) {
                            // optimization: same second each minute, so just take the fromDate minus one minute with the this._intStart seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 2 /* Minute */);
                        }
                        else {
                            // per constructor assert, the seconds are less than a day, so just go the fromDate start-of-day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 3600) % this._intInterval.amount());
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 1 /* Second */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 4 /* Day */);
                                }
                            }
                            else {
                                if (approx.addLocal(1, 4 /* Day */).subLocal(remainder, 1 /* Second */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 4 /* Day */);
                                }
                            }
                            // optimization: binary search
                            imax = Math.floor((24 * 3600) / this._intInterval.amount());
                            imin = 0;
                            while (imax >= imin) {
                                // calculate the midpoint for roughly equal partition
                                imid = Math.floor((imin + imax) / 2);
                                approx2 = approx.addLocal(imid * this._intInterval.amount(), 1 /* Second */);
                                approxMin = approx2.subLocal(this._intInterval.amount(), 1 /* Second */);
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
                    case 2 /* Minute */:
                        if (this._intInterval.amount() < 60 && (60 % this._intInterval.amount()) === 0) {
                            // optimization: same hour this._intStartary each time, so just take the fromDate minus one hour
                            // with the this._intStart minutes, seconds
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone()).subLocal(1, 3 /* Hour */);
                        }
                        else {
                            // per constructor assert, the seconds fit in a day, so just go the fromDate previous day
                            approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                            // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                            remainder = Math.floor((24 * 60) % this._intInterval.amount());
                            if (approx.greaterThan(normalFrom)) {
                                if (approx.subLocal(remainder, 2 /* Minute */).greaterThan(normalFrom)) {
                                    // normalFrom lies outside the boundary period before the start date
                                    approx = approx.subLocal(1, 4 /* Day */);
                                }
                            }
                            else {
                                if (approx.addLocal(1, 4 /* Day */).subLocal(remainder, 2 /* Minute */).lessEqual(normalFrom)) {
                                    // normalFrom lies in the boundary period, move to the next day
                                    approx = approx.addLocal(1, 4 /* Day */);
                                }
                            }
                        }
                        break;
                    case 3 /* Hour */:
                        approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        // since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
                        remainder = Math.floor(24 % this._intInterval.amount());
                        if (approx.greaterThan(normalFrom)) {
                            if (approx.subLocal(remainder, 3 /* Hour */).greaterThan(normalFrom)) {
                                // normalFrom lies outside the boundary period before the start date
                                approx = approx.subLocal(1, 4 /* Day */);
                            }
                        }
                        else {
                            if (approx.addLocal(1, 4 /* Day */).subLocal(remainder, 3 /* Hour */).lessEqual(normalFrom)) {
                                // normalFrom lies in the boundary period, move to the next day
                                approx = approx.addLocal(1, 4 /* Day */);
                            }
                        }
                        break;
                    case 4 /* Day */:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        diff = normalFrom.diff(this._intStart).hours() / 24;
                        periods = Math.floor(diff / this._intInterval.amount());
                        approx = this._intStart.addLocal(periods * this._intInterval.amount(), this._intInterval.unit());
                        break;
                    case 6 /* Month */:
                        // we don't have leap days, so we can approximate by calculating with UTC timestamps
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = (normalFrom.year() - this._intStart.year()) * 12 + (normalFrom.month() - this._intStart.month()) - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intInterval.amount()); // max needed due to -1 above
                        newYear = this._intStart.year() + Math.floor(periods * this._intInterval.amount() / 12);
                        newMonth = ((this._intStart.month() - 1 + Math.floor(periods * this._intInterval.amount())) % 12) + 1;
                        // note that newYear-newMonth-this._intStart.day() is a valid date due to our start day normalization
                        approx = new DateTime(newYear, newMonth, this._intStart.day(), this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
                        break;
                    case 7 /* Year */:
                        // The -1 below is because the day-of-month of start date may be after the day of the fromDate
                        diff = normalFrom.year() - this._intStart.year() - 1;
                        periods = Math.floor(Math.max(0, diff) / this._intInterval.amount()); // max needed due to -1 above
                        newYear = this._intStart.year() + periods * this._intInterval.amount();
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
                    approx = approx.addLocal(this._intInterval.amount(), this._intInterval.unit());
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
     * @param count	Number of periods to add. Optional. Must be an integer number.
     * @return (prev + count * period), in the same timezone as prev.
     */
    Period.prototype.findNext = function (prev, count) {
        if (count === void 0) { count = 1; }
        assert(prev !== null, "Prev must be non-null");
        assert((this._intStart.zone() === null) === (prev.zone() === null), "The fromDate and startDate must both be aware or unaware");
        assert(typeof (count) === "number", "Count must be a number");
        assert(Math.floor(count) === count, "Count must be an integer");
        if (count < 0 && prev.lessEqual(this.start())) {
            return null;
        }
        var normalizedPrev = this._normalizeDay(prev.toZone(this._start.zone()));
        if (this._intDst === 0 /* RegularIntervals */) {
            return this._correctDay(normalizedPrev.add(this._intInterval.amount() * count, this._intInterval.unit())).convert(prev.zone());
        }
        else {
            return this._correctDay(normalizedPrev.addLocal(this._intInterval.amount() * count, this._intInterval.unit())).convert(prev.zone());
        }
    };
    /**
     * Returns the previous timestamp in the period. The given timestamp must
     * be at a period boundary, otherwise the answer is incorrect.
     * Returns NULL if the previous occurrence is before the start date
     * @param prev	Boundary date. Must have a time zone (any time zone) iff the period start date has one.
     * @param count	Number of periods to subtract. Optional. Must be an integer number.
     * @return (next - count * period), in the same timezone as next.
     */
    Period.prototype.findPrev = function (next, count) {
        if (count === void 0) { count = 1; }
        return this.findNext(next, -1 * count);
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
    /**
     * Returns true iff this period has the same effect as the given one.
     * i.e. a period of 24 hours is equal to one of 1 day if they have the same UTC start moment
     * and same dst.
     */
    Period.prototype.equals = function (other) {
        // note we take the non-normalized start() because this has an influence on the outcome
        return (this._start.equals(other.start()) && this._intInterval.equalsExact(other.interval()) && this._intDst === other._intDst);
    };
    /**
     * Returns true iff this period was constructed with identical arguments to the other one.
     */
    Period.prototype.identical = function (other) {
        return (this._start.identical(other.start()) && this._interval.identical(other.interval()) && this.dst() === other.dst());
    };
    /**
     * Returns an ISO duration string e.g.
     * 2014-01-01T12:00:00.000+01:00/P1H
     * 2014-01-01T12:00:00.000+01:00/PT1M   (one minute)
     * 2014-01-01T12:00:00.000+01:00/P1M   (one month)
     */
    Period.prototype.toIsoString = function () {
        return this._start.toIsoString() + "/" + this._interval.toIsoString();
    };
    /**
     * A string representation e.g.
     * "10 years, starting at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
     */
    Period.prototype.toString = function () {
        var result = this._interval.toString() + ", starting at " + this._start.toString();
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
        if ((this._intInterval.unit() === 6 /* Month */ && d.day() > 28) || (this._intInterval.unit() === 7 /* Year */ && (d.month() === 2 || anymonth) && d.day() > 28)) {
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
        var intAmount = this._interval.amount();
        var intUnit = this._interval.unit();
        if (intUnit === 0 /* Millisecond */ && intAmount >= 1000 && intAmount % 1000 === 0) {
            // note this won't work if we account for leap seconds
            intAmount = intAmount / 1000;
            intUnit = 1 /* Second */;
        }
        if (intUnit === 1 /* Second */ && intAmount >= 60 && intAmount % 60 === 0) {
            // note this won't work if we account for leap seconds
            intAmount = intAmount / 60;
            intUnit = 2 /* Minute */;
        }
        if (intUnit === 2 /* Minute */ && intAmount >= 60 && intAmount % 60 === 0) {
            intAmount = intAmount / 60;
            intUnit = 3 /* Hour */;
        }
        if (intUnit === 3 /* Hour */ && intAmount >= 24 && intAmount % 24 === 0) {
            intAmount = intAmount / 24;
            intUnit = 4 /* Day */;
        }
        // now remove weeks so we have one less case to worry about
        if (intUnit === 5 /* Week */) {
            intAmount = intAmount * 7;
            intUnit = 4 /* Day */;
        }
        if (intUnit === 6 /* Month */ && intAmount >= 12 && intAmount % 12 === 0) {
            intAmount = intAmount / 12;
            intUnit = 7 /* Year */;
        }
        this._intInterval = new Duration(intAmount, intUnit);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBlcmlvZC50cyJdLCJuYW1lcyI6WyJQZXJpb2REc3QiLCJwZXJpb2REc3RUb1N0cmluZyIsIlBlcmlvZCIsIlBlcmlvZC5jb25zdHJ1Y3RvciIsIlBlcmlvZC5jbG9uZSIsIlBlcmlvZC5zdGFydCIsIlBlcmlvZC5pbnRlcnZhbCIsIlBlcmlvZC5hbW91bnQiLCJQZXJpb2QudW5pdCIsIlBlcmlvZC5kc3QiLCJQZXJpb2QuZmluZEZpcnN0IiwiUGVyaW9kLmZpbmROZXh0IiwiUGVyaW9kLmZpbmRQcmV2IiwiUGVyaW9kLmlzQm91bmRhcnkiLCJQZXJpb2QuZXF1YWxzIiwiUGVyaW9kLmlkZW50aWNhbCIsIlBlcmlvZC50b0lzb1N0cmluZyIsIlBlcmlvZC50b1N0cmluZyIsIlBlcmlvZC5pbnNwZWN0IiwiUGVyaW9kLl9jb3JyZWN0RGF5IiwiUGVyaW9kLl9ub3JtYWxpemVEYXkiLCJQZXJpb2QuX2RzdFJlbGV2YW50IiwiUGVyaW9kLl9jYWxjSW50ZXJuYWxWYWx1ZXMiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFFYixJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUVsQyxJQUFPLE1BQU0sV0FBVyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFPLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBRWxDLElBQU8sUUFBUSxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBQ3hDLElBQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFFcEMsSUFBTyxRQUFRLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFDeEMsSUFBTyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUVwQyxJQUFPLFFBQVEsV0FBVyxZQUFZLENBQUMsQ0FBQztBQUN4QyxJQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBQ3BDLElBQU8sWUFBWSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENB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QSxLQUFLQSxtQkFBb0JBO3dCQUN4QkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDckZBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNwSEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGNBQWVBO3dCQUNuQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDckZBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUN4SEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGNBQWVBO3dCQUNuQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDckZBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUM1SEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDckZBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNoSUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFdBQVlBO3dCQUNoQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDckZBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNwSUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGFBQWNBO3dCQUNsQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDekZBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNwSUEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFDN0ZBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLEVBQUVBLEVBQUVBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNwSUEsS0FBS0EsQ0FBQ0E7b0JBRVBBO3dCQUNDQSxBQUVBQSx3QkFGd0JBO3dCQUN4QkEsMEJBQTBCQTt3QkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNWQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO3dCQUNyQ0EsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUNEQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQTtvQkFDdENBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMzRUEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBRVBBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO29CQUNsQ0EsS0FBS0EsbUJBQW9CQTt3QkFDeEJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDL0dBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxjQUFlQTt3QkFDbkJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDbkhBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxjQUFlQTt3QkFDbkJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDdkhBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxZQUFhQTt3QkFDakJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDM0hBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxXQUFZQTt3QkFDaEJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDL0hBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxhQUFjQTt3QkFDbEJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLEVBQUVBLEVBQ2hGQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDL0hBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxZQUFhQTt3QkFDakJBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLEVBQUVBLEVBQ3BGQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDL0hBLEtBQUtBLENBQUNBO29CQUVQQTt3QkFDQ0EsQUFFQUEsd0JBRndCQTt3QkFDeEJBLDBCQUEwQkE7d0JBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDVkEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQTt3QkFDckNBLENBQUNBO2dCQUNIQSxDQUFDQTtnQkFDREEsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7b0JBQ3hDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDaEZBLENBQUNBO1lBQ0ZBLENBQUNBO1FBQ0ZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ1BBLEFBQ0FBLG1CQURtQkE7WUFDbkJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEtBQUtBLHdCQUEwQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBRWpEQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDbENBLEtBQUtBLG1CQUFvQkE7d0JBQ3hCQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTt3QkFDdERBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLENBQUNBO3dCQUN4REEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQzVGQSxLQUFLQSxDQUFDQTtvQkFDUEEsS0FBS0EsY0FBZUE7d0JBQ25CQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTt3QkFDakRBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLENBQUNBO3dCQUN4REEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQzVGQSxLQUFLQSxDQUFDQTtvQkFDUEEsS0FBS0EsY0FBZUE7d0JBQ25CQSxBQUNBQSx3RUFEd0VBO3dCQUN4RUEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7d0JBQ2pEQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDeERBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUM1RkEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7d0JBQy9DQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDeERBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUM1RkEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFdBQVlBO3dCQUNoQkEsSUFBSUEsR0FBR0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7d0JBQ3BEQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDeERBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUM1RkEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGFBQWNBO3dCQUNsQkEsSUFBSUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3hIQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTt3QkFDckVBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUM1RkEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsQUFDQUEsOEZBRDhGQTt3QkFDOUZBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO3dCQUNyREEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsNkJBQTZCQTt3QkFDbkdBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLFlBQWFBLENBQUNBLENBQUNBO3dCQUNqRkEsS0FBS0EsQ0FBQ0E7b0JBRVBBO3dCQUNDQSxBQUVBQSx3QkFGd0JBO3dCQUN4QkEsMEJBQTBCQTt3QkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNWQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO3dCQUNyQ0EsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUNEQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQTtvQkFDdENBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMzRUEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBRVBBLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO29CQUNsQ0EsS0FBS0EsbUJBQW9CQTt3QkFDeEJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUNwRkEsQUFDQUEsOEhBRDhIQTs0QkFDOUhBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUNoSEEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsY0FBZUEsQ0FBQ0EsQ0FBQ0E7d0JBQ2hDQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLEFBQ0FBLGdHQURnR0E7NEJBQ2hHQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUM1RUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7NEJBRS9IQSxBQUNBQSxxSEFEcUhBOzRCQUNySEEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7NEJBQ3hFQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDcENBLEFBRUFBLE9BRk9BO2dDQUNQQSx3QkFBd0JBO2dDQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsbUJBQW9CQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQ0FDOUVBLEFBQ0FBLG9FQURvRUE7b0NBQ3BFQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxFQUFFQSxXQUFZQSxDQUFDQSxDQUFDQTtnQ0FDM0NBLENBQUNBOzRCQUNGQSxDQUFDQTs0QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0NBQ1BBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLFdBQVlBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLG1CQUFvQkEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQ3RHQSxBQUNBQSwrREFEK0RBO29DQUMvREEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0E7Z0NBQzNDQSxDQUFDQTs0QkFDRkEsQ0FBQ0E7NEJBRURBLEFBQ0FBLDhCQUQ4QkE7NEJBQzlCQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTs0QkFDbkVBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBOzRCQUNUQSxPQUFPQSxJQUFJQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQTtnQ0FDckJBLEFBQ0FBLHFEQURxREE7Z0NBQ3JEQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDckNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLG1CQUFvQkEsQ0FBQ0EsQ0FBQ0E7Z0NBQ25GQSxTQUFTQSxHQUFHQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxtQkFBb0JBLENBQUNBLENBQUNBO2dDQUMvRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQ3hFQSxNQUFNQSxHQUFHQSxPQUFPQSxDQUFDQTtvQ0FDakJBLEtBQUtBLENBQUNBO2dDQUNQQSxDQUFDQTtnQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQzFDQSxBQUNBQSw0Q0FENENBO29DQUM1Q0EsSUFBSUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7Z0NBQ2pCQSxDQUFDQTtnQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0NBQ1BBLEFBQ0FBLDRDQUQ0Q0E7b0NBQzVDQSxJQUFJQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtnQ0FDakJBLENBQUNBOzRCQUNGQSxDQUFDQTt3QkFDRkEsQ0FBQ0E7d0JBQ0RBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxjQUFlQTt3QkFDbkJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzRCQUNoRkEsQUFDQUEsb0hBRG9IQTs0QkFDcEhBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUNwSEEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsY0FBZUEsQ0FBQ0EsQ0FBQ0E7d0JBQ2hDQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLEFBQ0FBLGdHQURnR0E7NEJBQ2hHQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUM1RUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7NEJBRS9IQSxBQUNBQSxxSEFEcUhBOzRCQUNySEEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7NEJBQ2pFQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDcENBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLGNBQWVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29DQUN6RUEsQUFDQUEsb0VBRG9FQTtvQ0FDcEVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLFdBQVlBLENBQUNBLENBQUNBO2dDQUMzQ0EsQ0FBQ0E7NEJBQ0ZBLENBQUNBOzRCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQ0FDUEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsY0FBZUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQ2pHQSxBQUNBQSwrREFEK0RBO29DQUMvREEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0E7Z0NBQzNDQSxDQUFDQTs0QkFDRkEsQ0FBQ0E7NEJBRURBLEFBQ0FBLDhCQUQ4QkE7NEJBQzlCQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTs0QkFDNURBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBOzRCQUNUQSxPQUFPQSxJQUFJQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQTtnQ0FDckJBLEFBQ0FBLHFEQURxREE7Z0NBQ3JEQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDckNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLGNBQWVBLENBQUNBLENBQUNBO2dDQUM5RUEsU0FBU0EsR0FBR0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsY0FBZUEsQ0FBQ0EsQ0FBQ0E7Z0NBQzFFQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQ0FDeEVBLE1BQU1BLEdBQUdBLE9BQU9BLENBQUNBO29DQUNqQkEsS0FBS0EsQ0FBQ0E7Z0NBQ1BBLENBQUNBO2dDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQ0FDMUNBLEFBQ0FBLDRDQUQ0Q0E7b0NBQzVDQSxJQUFJQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQTtnQ0FDakJBLENBQUNBO2dDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQ0FDUEEsQUFDQUEsNENBRDRDQTtvQ0FDNUNBLElBQUlBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBO2dDQUNqQkEsQ0FBQ0E7NEJBQ0ZBLENBQUNBO3dCQUNGQSxDQUFDQTt3QkFDREEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLGNBQWVBO3dCQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7NEJBQ2hGQSxBQUVBQSxnR0FGZ0dBOzRCQUNoR0EsMkNBQTJDQTs0QkFDM0NBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQzVFQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUN4SEEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsWUFBYUEsQ0FBQ0EsQ0FBQ0E7d0JBQzlCQSxDQUFDQTt3QkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7NEJBQ1BBLEFBQ0FBLHlGQUR5RkE7NEJBQ3pGQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUM1RUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7NEJBRS9IQSxBQUNBQSxxSEFEcUhBOzRCQUNySEEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7NEJBQy9EQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQ0FDcENBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLGNBQWVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29DQUN6RUEsQUFDQUEsb0VBRG9FQTtvQ0FDcEVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLFdBQVlBLENBQUNBLENBQUNBO2dDQUMzQ0EsQ0FBQ0E7NEJBQ0ZBLENBQUNBOzRCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQ0FDUEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsY0FBZUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0NBQ2pHQSxBQUNBQSwrREFEK0RBO29DQUMvREEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0E7Z0NBQzNDQSxDQUFDQTs0QkFDRkEsQ0FBQ0E7d0JBQ0ZBLENBQUNBO3dCQUNEQSxLQUFLQSxDQUFDQTtvQkFDUEEsS0FBS0EsWUFBYUE7d0JBQ2pCQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxHQUFHQSxFQUFFQSxFQUM1RUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBRS9IQSxBQUNBQSxxSEFEcUhBO3dCQUNySEEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDcENBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLEVBQUVBLFlBQWFBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dDQUN2RUEsQUFDQUEsb0VBRG9FQTtnQ0FDcEVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEVBQUVBLFdBQVlBLENBQUNBLENBQUNBOzRCQUMzQ0EsQ0FBQ0E7d0JBQ0ZBLENBQUNBO3dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTs0QkFDUEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsWUFBYUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0NBQy9GQSxBQUNBQSwrREFEK0RBO2dDQUMvREEsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsV0FBWUEsQ0FBQ0EsQ0FBQ0E7NEJBQzNDQSxDQUFDQTt3QkFDRkEsQ0FBQ0E7d0JBQ0RBLEtBQUtBLENBQUNBO29CQUNQQSxLQUFLQSxXQUFZQTt3QkFDaEJBLEFBQ0FBLG9GQURvRkE7d0JBQ3BGQSxJQUFJQSxHQUFHQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTt3QkFDcERBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLENBQUNBO3dCQUN4REEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7d0JBQ2pHQSxLQUFLQSxDQUFDQTtvQkFDUEEsS0FBS0EsYUFBY0E7d0JBQ2xCQSxBQUVBQSxvRkFGb0ZBO3dCQUNwRkEsOEZBQThGQTt3QkFDOUZBLElBQUlBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO3dCQUM1R0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsNkJBQTZCQTt3QkFDbkdBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO3dCQUN4RkEsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7d0JBQ3RHQSxBQUNBQSxxR0FEcUdBO3dCQUNyR0EsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDNURBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUMvSEEsS0FBS0EsQ0FBQ0E7b0JBQ1BBLEtBQUtBLFlBQWFBO3dCQUNqQkEsQUFDQUEsOEZBRDhGQTt3QkFDOUZBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO3dCQUNyREEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsNkJBQTZCQTt3QkFDbkdBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEdBQUdBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO3dCQUN2RUEsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFDMUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO3dCQUMvSEEsS0FBS0EsQ0FBQ0E7b0JBRVBBO3dCQUNDQSxBQUVBQSx3QkFGd0JBO3dCQUN4QkEsMEJBQTBCQTt3QkFDMUJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBOzRCQUNWQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO3dCQUNyQ0EsQ0FBQ0E7Z0JBQ0hBLENBQUNBO2dCQUNEQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQTtvQkFDeENBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO2dCQUNoRkEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDMURBLENBQUNBO0lBRURSOzs7Ozs7OztPQVFHQTtJQUNJQSx5QkFBUUEsR0FBZkEsVUFBZ0JBLElBQWNBLEVBQUVBLEtBQWlCQTtRQUFqQlMscUJBQWlCQSxHQUFqQkEsU0FBaUJBO1FBQ2hEQSxNQUFNQSxDQUFDQSxJQUFJQSxLQUFLQSxJQUFJQSxFQUFFQSx1QkFBdUJBLENBQUNBLENBQUNBO1FBQy9DQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxJQUFJQSxDQUFDQSxFQUNqRUEsMERBQTBEQSxDQUFDQSxDQUFDQTtRQUM3REEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsUUFBUUEsRUFBRUEsd0JBQXdCQSxDQUFDQSxDQUFDQTtRQUM5REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsS0FBS0EsRUFBRUEsMEJBQTBCQSxDQUFDQSxDQUFDQTtRQUNoRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2JBLENBQUNBO1FBQ0RBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3pFQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxLQUFLQSx3QkFBMEJBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFHQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNoSUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsY0FB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T0FBT0EsS0FBS0EsY0FBZUEsSUFBSUEsU0FBU0EsSUFBSUEsRUFBRUEsSUFBSUEsU0FBU0EsR0FBR0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUVBLFNBQVNBLEdBQUdBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQzNCQSxPQUFPQSxHQUFHQSxZQUFhQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsWUFBYUEsSUFBSUEsU0FBU0EsSUFBSUEsRUFBRUEsSUFBSUEsU0FBU0EsR0FBR0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUVBLFNBQVNBLEdBQUdBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQzNCQSxPQUFPQSxHQUFHQSxXQUFZQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFDREEsQUFDQUEsMkRBRDJEQTtRQUMzREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsWUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLFNBQVNBLEdBQUdBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBO1lBQzFCQSxPQUFPQSxHQUFHQSxXQUFZQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsS0FBS0EsYUFBY0EsSUFBSUEsU0FBU0EsSUFBSUEsRUFBRUEsSUFBSUEsU0FBU0EsR0FBR0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0VBLFNBQVNBLEdBQUdBLFNBQVNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQzNCQSxPQUFPQSxHQUFHQSxZQUFhQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsU0FBU0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFFckRBLEFBQ0FBLHlCQUR5QkE7UUFDekJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDUEEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0Esd0JBQTBCQSxDQUFDQTtRQUMzQ0EsQ0FBQ0E7UUFFREEsQUFDQUEsc0JBRHNCQTtRQUN0QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekRBLENBQUNBO0lBRUZwQixhQUFDQTtBQUFEQSxDQTF0QkEsQUEwdEJDQSxJQUFBO0FBMXRCWSxjQUFNLEdBQU4sTUEwdEJaLENBQUEiLCJmaWxlIjoibGliL3BlcmlvZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19