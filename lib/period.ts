/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Periodic interval functions
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");
import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

import basics = require("./basics");
import TimeUnit = basics.TimeUnit;

import datetime = require("./datetime");
import DateTime = datetime.DateTime;

import timezone = require("./timezone");
import TimeZone = timezone.TimeZone;
import TimeZoneKind = timezone.TimeZoneKind;


/**
 * Specifies how the period should repeat across the day
 * during DST changes.
 */
export enum PeriodDst {
	/**
	 * Keep repeating in similar intervals measured in UTC,
	 * unaffected by Daylight Saving Time.
	 * E.g. a repetition of one hour will take one real hour
	 * every time, even in a time zone with DST.
	 * Leap seconds, leap days and month length
	 * differences will still make the intervals different.
	 */
	RegularIntervals,

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
	RegularLocalTime
}

/**
 * Convert a PeriodDst to a string: "regular intervals" or "regular local time"
 */
export function periodDstToString(p: PeriodDst): string {
	switch (p) {
		case PeriodDst.RegularIntervals: return "regular intervals";
		case PeriodDst.RegularLocalTime: return "regular local time";
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			assert(false, "Unknown PeriodDst");
			/* istanbul ignore next */
			return "";
	}
}

/**
 * Repeating time period: consists of a starting point and
 * a time length. This class accounts for leap seconds and leap days.
 */
export class Period {

	/**
	 * Start moment of period
	 */
	private _start: DateTime;

	/**
	 * Amount of units as given in constructor
	 */
	private _amount: number;

	/**
	 * Units as given in constructor
	 */
	private _unit: TimeUnit;

	/**
	 * DST handling
	 */
	private _dst: PeriodDst;

	/**
	 * Normalized start date, has day-of-month <= 28 for Monthly
	 * period, or for Yearly period if month is February
	 */
	private _intStart: DateTime;

	/**
	 * Normalized amount: excludes weeks (converted to days) and
	 * where possible, amounts are converted to bigger units.
	 */
	private _intAmount: number;

	/**
	 * Normalized unit.
	 */
	private _intUnit: TimeUnit;

	/**
	 * Normalized internal DST handling. If DST handling is irrelevant
	 * (because the start time zone does not have DST)
	 * then it is set to RegularInterval
	 */
	private _intDst: PeriodDst;

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
	constructor(
		start: DateTime,
		amount: number,
		unit: TimeUnit,
		dst: PeriodDst) {
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
		if (this._dstRelevant() && dst === PeriodDst.RegularLocalTime) {
			switch (this._intUnit) {
				case TimeUnit.Second:
					assert(this._intAmount < 86400,
						"When using Hour, Minute or Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
				case TimeUnit.Minute:
					assert(this._intAmount < 1440,
						"When using Hour, Minute or Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
				case TimeUnit.Hour:
					assert(this._intAmount < 24,
						"When using Hour, Minute or Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
			}
		}
	}

	/**
	 * The start date
	 */
	public start(): DateTime {
		return this._start;
	}

	/**
	 * The amount of units
	 */
	public amount(): number {
		return this._amount;
	}

	/**
	 * The unit
	 */
	public unit(): TimeUnit {
		return this._unit;
	}

	/**
	 * The dst handling mode
	 */
	public dst(): PeriodDst {
		return this._dst;
	}

	/**
	 * The first occurrence of the period greater than
	 * the given date. The given date need not be at a period boundary.
	 * Pre: the fromdate and startdate must either both have timezones or not
	 * @param fromDate: the date after which to return the next date
	 * @return the first date matching the period after fromDate, given
	 *			in the same zone as the fromDate.
	 */
	public findFirst(fromDate: DateTime): DateTime {
		assert((this._intStart.zone() === null) === (fromDate.zone() === null),
			"The fromDate and startDate must both be aware or unaware");
		var approx: DateTime;
		var periods: number;
		var diff: number;
		var newYear: number;
		var newMonth: number;
		var remainder: number;

		var normalFrom = this._normalizeDay(fromDate.toZone(this._intStart.zone()));

		// Simple case: period has not started yet.
		if (normalFrom.lessThan(this._intStart)) {
			// use toZone because we don't want to return a reference to our internal member
			return this._correctDay(this._intStart).toZone(fromDate.zone());
		}

		if (this._intAmount === 1) {
			// simple cases: amount equals 1 (eliminates need for searching for starting point)
			if (this._intDst === PeriodDst.RegularIntervals) {
				// apply to UTC time
				switch (this._intUnit) {
					case TimeUnit.Second:
						approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
						break;
					case TimeUnit.Minute:
						approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), normalFrom.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
						break;
					case TimeUnit.Hour:
						approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
						break;
					case TimeUnit.Day:
						approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
						break;
					case TimeUnit.Month:
						approx = new DateTime(normalFrom.utcYear(), normalFrom.utcMonth(), this._intStart.utcDay(),
							this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
						break;
					case TimeUnit.Year:
						approx = new DateTime(normalFrom.utcYear(), this._intStart.utcMonth(), this._intStart.utcDay(),
							this._intStart.utcHour(), this._intStart.utcMinute(), this._intStart.utcSecond(), this._intStart.utcMillisecond(), TimeZone.utc());
						break;
					/* istanbul ignore next */
					default:
						/* istanbul ignore next */
						assert(false, "Unknown TimeUnit");
						/* istanbul ignore next */
						break;
				}
				while (!approx.greaterThan(fromDate)) {
					approx = approx.add(this._intAmount, this._intUnit);
				}
			} else {
				// Try to keep regular local intervals
				switch (this._intUnit) {
					case TimeUnit.Second:
						approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), normalFrom.minute(), normalFrom.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					case TimeUnit.Minute:
						approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					case TimeUnit.Hour:
						approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					case TimeUnit.Day:
						approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
							this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					case TimeUnit.Month:
						approx = new DateTime(normalFrom.year(), normalFrom.month(), this._intStart.day(),
							this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					case TimeUnit.Year:
						approx = new DateTime(normalFrom.year(), this._intStart.month(), this._intStart.day(),
							this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					/* istanbul ignore next */
					default:
						/* istanbul ignore next */
						assert(false, "Unknown TimeUnit");
						/* istanbul ignore next */
						break;
				}
				while (!approx.greaterThan(normalFrom)) {
					approx = approx.addLocal(this._intAmount, this._intUnit);
				}
			}
		} else {
			// Amount is not 1,
			if (this._intDst === PeriodDst.RegularIntervals) {
				// apply to UTC time
				switch (this._intUnit) {
					case TimeUnit.Second:
						diff = normalFrom.diff(this._intStart).seconds();
						periods = Math.floor(diff / this._intAmount);
						approx = this._intStart.add(periods * this._intAmount, this._intUnit);
						break;
					case TimeUnit.Minute:
						// only 25 leap seconds have ever been added so this should still be OK.
						diff = normalFrom.diff(this._intStart).minutes();
						periods = Math.floor(diff / this._intAmount);
						approx = this._intStart.add(periods * this._intAmount, this._intUnit);
						break;
					case TimeUnit.Hour:
						diff = normalFrom.diff(this._intStart).hours();
						periods = Math.floor(diff / this._intAmount);
						approx = this._intStart.add(periods * this._intAmount, this._intUnit);
						break;
					case TimeUnit.Day:
						diff = normalFrom.diff(this._intStart).hours() / 24;
						periods = Math.floor(diff / this._intAmount);
						approx = this._intStart.add(periods * this._intAmount, this._intUnit);
						break;
					case TimeUnit.Month:
						diff = (normalFrom.utcYear() - this._intStart.utcYear()) * 12 + (normalFrom.utcMonth() - this._intStart.utcMonth()) - 1;
						periods = Math.floor(Math.max(0, diff) / this._intAmount);
						approx = this._intStart.add(periods * this._intAmount, this._intUnit);
						break;
					case TimeUnit.Year:
						// The -1 below is because the day-of-month of start date may be after the day of the fromDate
						diff = normalFrom.year() - this._intStart.year() - 1;
						periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
						approx = this._intStart.add(periods * this._intAmount, TimeUnit.Year);
						break;
					/* istanbul ignore next */
					default:
						/* istanbul ignore next */
						assert(false, "Unknown TimeUnit");
						/* istanbul ignore next */
						break;
				}
				while (!approx.greaterThan(fromDate)) {
					approx = approx.add(this._intAmount, this._intUnit);
				}
			} else {
				// Try to keep regular local times. If the unit is less than a day, we start each day anew
				switch (this._intUnit) {
					case TimeUnit.Second:
						if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
							// optimization: same second each minute, so just take the fromDate minus one minute with the this._intStart seconds
							approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
								normalFrom.hour(), normalFrom.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone())
								.subLocal(1, TimeUnit.Minute);
						} else {
							// per constructor assert, the seconds are less than a day, so just go the fromDate start-of-day
							approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
								this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

							// since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
							remainder = Math.floor((24 * 3600) % this._intAmount);
							if (approx.greaterThan(normalFrom)) {
								if (approx.subLocal(remainder, TimeUnit.Second).greaterThan(normalFrom)) {
									// normalFrom lies outside the boundary period before the start date
									approx = approx.subLocal(1, TimeUnit.Day);
								}
							} else {
								if (approx.addLocal(1, TimeUnit.Day).subLocal(remainder, TimeUnit.Second).lessEqual(normalFrom)) {
									// normalFrom lies in the boundary period, move to the next day
									approx = approx.addLocal(1, TimeUnit.Day);
								}
							}

							// optimization: binary search
							var imax: number = Math.floor((24 * 3600) / this._intAmount);
							var imin: number = 0;
							while (imax >= imin) {
								// calculate the midpoint for roughly equal partition
								var imid = Math.floor((imin + imax) / 2);
								var approx2 = approx.addLocal(imid * this._intAmount, TimeUnit.Second);
								var approxMin = approx2.subLocal(this._intAmount, TimeUnit.Second);
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
					case TimeUnit.Minute:
						if (this._intAmount < 60 && (60 % this._intAmount) === 0) {
							// optimization: same hour this._intStartary each time, so just take the fromDate minus one hour
							// with the this._intStart minutes, seconds
							approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
								normalFrom.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone())
								.subLocal(1, TimeUnit.Hour);
						} else {
							// per constructor assert, the seconds fit in a day, so just go the fromDate previous day
							approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
								this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

							// since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
							remainder = Math.floor((24 * 60) % this._intAmount);
							if (approx.greaterThan(normalFrom)) {
								if (approx.subLocal(remainder, TimeUnit.Minute).greaterThan(normalFrom)) {
									// normalFrom lies outside the boundary period before the start date
									approx = approx.subLocal(1, TimeUnit.Day);
								}
							} else {
								if (approx.addLocal(1, TimeUnit.Day).subLocal(remainder, TimeUnit.Minute).lessEqual(normalFrom)) {
									// normalFrom lies in the boundary period, move to the next day
									approx = approx.addLocal(1, TimeUnit.Day);
								}
							}
						}
						break;
					case TimeUnit.Hour:
						approx = new DateTime(normalFrom.year(), normalFrom.month(), normalFrom.day(),
							this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());

						// since we start counting from this._intStart each day, we have to take care of the shorter interval at the boundary
						remainder = Math.floor(24 % this._intAmount);
						if (approx.greaterThan(normalFrom)) {
							if (approx.subLocal(remainder, TimeUnit.Hour).greaterThan(normalFrom)) {
								// normalFrom lies outside the boundary period before the start date
								approx = approx.subLocal(1, TimeUnit.Day);
							}
						} else {
							if (approx.addLocal(1, TimeUnit.Day).subLocal(remainder, TimeUnit.Hour).lessEqual(normalFrom)) {
								// normalFrom lies in the boundary period, move to the next day
								approx = approx.addLocal(1, TimeUnit.Day);
							}
						}
						break;
					case TimeUnit.Day:
						// we don't have leap days, so we can approximate by calculating with UTC timestamps
						diff = normalFrom.diff(this._intStart).hours() / 24;
						periods = Math.floor(diff / this._intAmount);
						approx = this._intStart.addLocal(periods * this._intAmount, this._intUnit);
						break;
					case TimeUnit.Month:
						// we don't have leap days, so we can approximate by calculating with UTC timestamps
						// The -1 below is because the day-of-month of start date may be after the day of the fromDate
						diff = (normalFrom.year() - this._intStart.year()) * 12 + (normalFrom.month() - this._intStart.month()) - 1;
						periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
						newYear = this._intStart.year() + Math.floor(periods * this._intAmount / 12);
						newMonth = ((this._intStart.month() - 1 + Math.floor(periods * this._intAmount)) % 12) + 1;
						// note that newYear-newMonth-this._intStart.day() is a valid date due to our start day normalization
						approx = new DateTime(newYear, newMonth, this._intStart.day(),
							this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					case TimeUnit.Year:
						// The -1 below is because the day-of-month of start date may be after the day of the fromDate
						diff = normalFrom.year() - this._intStart.year() - 1;
						periods = Math.floor(Math.max(0, diff) / this._intAmount); // max needed due to -1 above
						newYear = this._intStart.year() + periods * this._intAmount;
						approx = new DateTime(newYear, this._intStart.month(), this._intStart.day(),
							this._intStart.hour(), this._intStart.minute(), this._intStart.second(), this._intStart.millisecond(), this._intStart.zone());
						break;
					/* istanbul ignore next */
					default:
						/* istanbul ignore next */
						assert(false, "Unknown TimeUnit");
						/* istanbul ignore next */
						break;
				}
				while (!approx.greaterThan(normalFrom)) {
					approx = approx.addLocal(this._intAmount, this._intUnit);
				}
			}
		}
		return this._correctDay(approx).convert(fromDate.zone());
	}

	/**
	 * Returns the next timestamp in the period. The given timestamp must
	 * be at a period boundary, otherwise the answer is incorrect.
	 * This function has MUCH better performance than findFirst.
	 * Returns the datetime "count" times away from the given datetime.
	 * @param prev	Boundary date. Must have a time zone (any time zone) iff the period start date has one.
	 * @param count	Optional, must be >= 1 and whole.
	 * @return (prev + count * period), in the same timezone as prev.
	 */
	public findNext(prev: DateTime, count: number = 1): DateTime {
		assert(prev !== null, "Prev must be non-null");
		assert((this._intStart.zone() === null) === (prev.zone() === null),
			"The fromDate and startDate must both be aware or unaware");
		assert(typeof (count) === "number", "Count must be a number");
		assert(count >= 1 && Math.floor(count) === count, "Count must be an integer >= 1");

		var normalizedPrev = this._normalizeDay(prev.toZone(this._start.zone()));
		if (this._intDst === PeriodDst.RegularIntervals) {
			return this._correctDay(normalizedPrev.add(this._intAmount * count, this._intUnit)).convert(prev.zone());
		} else {
			return this._correctDay(normalizedPrev.addLocal(this._intAmount * count, this._intUnit)).convert(prev.zone());
		}
	}

	private _periodIsoString(): string {
		switch (this._unit) {
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
				/* istanbul ignore next */
				assert(false, "Unknown period unit.");
				/* istanbul ignore next */
				return "";
		}
	}

	/**
	 * Returns an ISO duration string e.g.
	 * 2014-01-01T12:00:00.000+01:00/P1H
	 * 2014-01-01T12:00:00.000+01:00/PT1M   (one minute)
	 * 2014-01-01T12:00:00.000+01:00/P1M   (one month)
	 */
	public toIsoString(): string {
		return this.start().toIsoString() + "/" + this._periodIsoString();
	}

	/**
	 * A string representation e.g.
	 * "10 years, starting at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
	 */
	public toString(): string {
		var result: string =
			this._amount.toString(10) + " " + TimeUnit[this._unit].toLowerCase() + (this._amount > 1 ? "s" : "")
			+ ", starting at " + this._start.toString();
		// only add the DST handling if it is relevant
		if (this._dstRelevant()) {
			result += ", keeping " + periodDstToString(this._dst);
		}
		return result;
	}

	/**
	 * Used by util.inspect()
	 */
	inspect(): string {
		return "[Period: " + this.toString() + "]";
	}

	/**
	 * Corrects the difference between _start and _intStart.
	 */
	private _correctDay(d: DateTime): DateTime {
		if (this._start !== this._intStart) {
			return new DateTime(
				d.year(), d.month(), Math.min(basics.daysInMonth(d.year(), d.month()), this._start.day()),
				d.hour(), d.minute(), d.second(), d.millisecond(), d.zone());
		} else {
			return d;
		}
	}

	/**
	 * If this._internalUnit in [Month, Year], normalizes the day-of-month
	 * to <= 28.
	 * @return a new date if different, otherwise the exact same object (no clone!)
	 */
	private _normalizeDay(d: DateTime, anymonth: boolean = true): DateTime {
		if ((this._intUnit === TimeUnit.Month && d.day() > 28)
			|| (this._intUnit === TimeUnit.Year && (d.month() === 2 || anymonth) && d.day() > 28)
			) {
			return new DateTime(
				d.year(), d.month(), 28,
				d.hour(), d.minute(), d.second(),
				d.millisecond(), d.zone());
		} else {
			return d; // save on time by not returning a clone
		}
	}

	/**
	 * Returns true if DST handling is relevant for us.
	 * (i.e. if the start time zone has DST)
	 */
	private _dstRelevant(): boolean {
		return (this._start.zone() != null
			&& this._start.zone().kind() === TimeZoneKind.Proper
			&& this._start.zone().hasDst());
	}

	/**
	 * Normalize the values where possible - not all values
	 * are convertible into one another. Weeks are converted to days.
	 * E.g. more than 60 minutes is transferred to hours,
	 * but seconds cannot be transferred to minutes due to leap seconds.
	 * Weeks are converted back to days.
	 */
	private _calcInternalValues(): void {
		// normalize any above-unit values
		this._intAmount = this._amount;
		this._intUnit = this._unit;

		if (this._intUnit === TimeUnit.Second && this._intAmount >= 60 && this._intAmount % 60 === 0
			&& this._dstRelevant() && this._dst === PeriodDst.RegularLocalTime) {
			// cannot convert seconds to minutes if regular intervals are required due to
			// leap seconds, but for regular local time it does not matter
			this._intAmount = this._intAmount / 60;
			this._intUnit = TimeUnit.Minute;
		}
		if (this._intUnit === TimeUnit.Minute && this._intAmount >= 60 && this._intAmount % 60 === 0) {
			this._intAmount = this._intAmount / 60;
			this._intUnit = TimeUnit.Hour;
		}
		if (this._intUnit === TimeUnit.Hour && this._intAmount >= 24 && this._intAmount % 24 === 0) {
			this._intAmount = this._intAmount / 24;
			this._intUnit = TimeUnit.Day;
		}
		// now remove weeks as they are not a concept in datetime
		if (this._intUnit === TimeUnit.Week) {
			this._intAmount = this._intAmount * 7;
			this._intUnit = TimeUnit.Day;
		}
		if (this._intUnit === TimeUnit.Month && this._intAmount >= 12 && this._intAmount % 12 === 0) {
			this._intAmount = this._intAmount / 12;
			this._intUnit = TimeUnit.Year;
		}

		// normalize dst handling
		if (this._dstRelevant()) {
			this._intDst = this._dst;
		} else {
			this._intDst = PeriodDst.RegularIntervals;
		}

		// normalize start day
		this._intStart = this._normalizeDay(this._start, false);
	}

}
