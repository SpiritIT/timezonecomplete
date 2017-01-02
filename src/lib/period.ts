/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Periodic interval functions
 */

"use strict";

import assert from "./assert";
import { TimeUnit } from "./basics";
import * as basics from "./basics";
import { Duration } from "./duration";
import { DateTime } from "./datetime";
import { TimeZone, TimeZoneKind } from "./timezone";

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
	 * a period of one day, referenceing at 8:05AM Europe/Amsterdam time
	 * will always reference at 8:05 Europe/Amsterdam. This means that
	 * in UTC time, some intervals will be 25 hours and some
	 * 23 hours during DST changes.
	 * Another example: an hourly interval will be hourly in local time,
	 * skipping an hour in UTC for a DST backward change.
	 */
	RegularLocalTime,

	/**
	 * End-of-enum marker
	 */
	MAX
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
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unknown PeriodDst");
			}
	}
}

/**
 * Repeating time period: consists of a reference date and
 * a time length. This class accounts for leap seconds and leap days.
 */
export class Period {

	/**
	 * Reference moment of period
	 */
	private _reference: DateTime;

	/**
	 * Interval
	 */
	private _interval: Duration;

	/**
	 * DST handling
	 */
	private _dst: PeriodDst;

	/**
	 * Normalized reference date, has day-of-month <= 28 for Monthly
	 * period, or for Yearly period if month is February
	 */
	private _intReference: DateTime;

	/**
	 * Normalized interval
	 */
	private _intInterval: Duration;

	/**
	 * Normalized internal DST handling. If DST handling is irrelevant
	 * (because the reference time zone does not have DST)
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
	 * @param reference The reference date of the period. If the period is in Months or Years, and
	 *				the day is 29 or 30 or 31, the results are maximised to end-of-month.
	 * @param interval	The interval of the period
	 * @param dst	Specifies how to handle Daylight Saving Time. Not relevant
	 *              if the time zone of the reference datetime does not have DST.
	 *              Defaults to RegularLocalTime.
	 */
	constructor(
		reference: DateTime,
		interval: Duration,
		dst?: PeriodDst
	);
	/**
	 * Constructor
	 * LIMITATION: if dst equals RegularLocalTime, and unit is Second, Minute or Hour,
	 * then the amount must be a factor of 24. So 120 seconds is allowed while 121 seconds is not.
	 * This is due to the enormous processing power required by these cases. They are not
	 * implemented and you will get an assert.
	 *
	 * @param reference The reference of the period. If the period is in Months or Years, and
	 *				the day is 29 or 30 or 31, the results are maximised to end-of-month.
	 * @param amount	The amount of units.
	 * @param unit	The unit.
	 * @param dst	Specifies how to handle Daylight Saving Time. Not relevant
	 *              if the time zone of the reference datetime does not have DST.
	 *              Defaults to RegularLocalTime.
	 */
	constructor(
		reference: DateTime,
		amount: number,
		unit: TimeUnit,
		dst?: PeriodDst
	);
	/**
	 * Constructor implementation. See other constructors for explanation.
	 */
	constructor(
		reference: DateTime,
		amountOrInterval: any,
		unitOrDst?: any,
		givenDst?: PeriodDst
	) {

		let interval: Duration;
		let dst: PeriodDst = PeriodDst.RegularLocalTime;
		if (typeof (amountOrInterval) === "object") {
			interval = <Duration>amountOrInterval;
			dst = <PeriodDst>unitOrDst;
		} else {
			assert(typeof unitOrDst === "number" && unitOrDst >= 0 && unitOrDst < TimeUnit.MAX, "Invalid unit");
			interval = new Duration(<number>amountOrInterval, <TimeUnit>unitOrDst);
			dst = givenDst as PeriodDst;
		}
		if (typeof dst !== "number") {
			dst = PeriodDst.RegularLocalTime;
		}
		assert(dst >= 0 && dst < PeriodDst.MAX, "Invalid PeriodDst setting");
		assert(!!reference, "Reference time not given");
		assert(interval.amount() > 0, "Amount must be positive non-zero.");
		assert(Math.floor(interval.amount()) === interval.amount(), "Amount must be a whole number");

		this._reference = reference;
		this._interval = interval;
		this._dst = dst;
		this._calcInternalValues();

		// regular local time keeping is only supported if we can reset each day
		// Note we use internal amounts to decide this because actually it is supported if
		// the input is a multiple of one day.
		if (this._dstRelevant() && dst === PeriodDst.RegularLocalTime) {
			switch (this._intInterval.unit()) {
				case TimeUnit.Millisecond:
					assert(this._intInterval.amount() < 86400000,
						"When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
				case TimeUnit.Second:
					assert(this._intInterval.amount() < 86400,
						"When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
				case TimeUnit.Minute:
					assert(this._intInterval.amount() < 1440,
						"When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
				case TimeUnit.Hour:
					assert(this._intInterval.amount() < 24,
						"When using Hour, Minute or (Milli)Second units, with Regular Local Times, " +
						"then the amount must be either less than a day or a multiple of the next unit.");
					break;
			}
		}
	}

	/**
	 * Return a fresh copy of the period
	 */
	public clone(): Period {
		return new Period(this._reference, this._interval, this._dst);
	}

	/**
	 * The reference date
	 */
	public reference(): DateTime {
		return this._reference;
	}

	/**
	 * DEPRECATED: old name for the reference date
	 */
	public start(): DateTime {
		return this._reference;
	}

	/**
	 * The interval
	 */
	public interval(): Duration {
		return this._interval.clone();
	}

	/**
	 * The amount of units of the interval
	 */
	public amount(): number {
		return this._interval.amount();
	}

	/**
	 * The unit of the interval
	 */
	public unit(): TimeUnit {
		return this._interval.unit();
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
	 * Pre: the fromdate and reference date must either both have timezones or not
	 * @param fromDate: the date after which to return the next date
	 * @return the first date matching the period after fromDate, given
	 *			in the same zone as the fromDate.
	 */
	public findFirst(fromDate: DateTime): DateTime {
		assert(!!this._intReference.zone() === !!fromDate.zone(),
			"The fromDate and reference date must both be aware or unaware");
		let approx: DateTime;
		let approx2: DateTime;
		let approxMin: DateTime;
		let periods: number;
		let diff: number;
		let newYear: number;
		let remainder: number;
		let imax: number;
		let imin: number;
		let imid: number;

		const normalFrom = this._normalizeDay(fromDate.toZone(this._intReference.zone()));

		if (this._intInterval.amount() === 1) {
			// simple cases: amount equals 1 (eliminates need for searching for referenceing point)
			if (this._intDst === PeriodDst.RegularIntervals) {
				// apply to UTC time
				switch (this._intInterval.unit()) {
					case TimeUnit.Millisecond:
						approx = new DateTime(
							normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(),
							normalFrom.utcMillisecond(), TimeZone.utc()
						);
						break;
					case TimeUnit.Second:
						approx = new DateTime(
							normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), normalFrom.utcMinute(), normalFrom.utcSecond(),
							this._intReference.utcMillisecond(), TimeZone.utc()
						);
						break;
					case TimeUnit.Minute:
						approx = new DateTime(
							normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), normalFrom.utcMinute(), this._intReference.utcSecond(),
							this._intReference.utcMillisecond(), TimeZone.utc()
						);
						break;
					case TimeUnit.Hour:
						approx = new DateTime(
							normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							normalFrom.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(),
							this._intReference.utcMillisecond(), TimeZone.utc()
						);
						break;
					case TimeUnit.Day:
						approx = new DateTime(
							normalFrom.utcYear(), normalFrom.utcMonth(), normalFrom.utcDay(),
							this._intReference.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(),
							this._intReference.utcMillisecond(), TimeZone.utc()
						);
						break;
					case TimeUnit.Month:
						approx = new DateTime(
							normalFrom.utcYear(), normalFrom.utcMonth(), this._intReference.utcDay(),
							this._intReference.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(),
							this._intReference.utcMillisecond(), TimeZone.utc()
						);
						break;
					case TimeUnit.Year:
						approx = new DateTime(
							normalFrom.utcYear(), this._intReference.utcMonth(), this._intReference.utcDay(),
							this._intReference.utcHour(), this._intReference.utcMinute(), this._intReference.utcSecond(),
							this._intReference.utcMillisecond(), TimeZone.utc()
						);
						break;
					/* istanbul ignore next */
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
			} else {
				// Try to keep regular local intervals
				switch (this._intInterval.unit()) {
					case TimeUnit.Millisecond:
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), normalFrom.minute(), normalFrom.second(),
							normalFrom.millisecond(), this._intReference.zone()
						);
						break;
					case TimeUnit.Second:
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), normalFrom.minute(), normalFrom.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					case TimeUnit.Minute:
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), normalFrom.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					case TimeUnit.Hour:
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), normalFrom.day(),
							normalFrom.hour(), this._intReference.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					case TimeUnit.Day:
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), normalFrom.day(),
							this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					case TimeUnit.Month:
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), this._intReference.day(),
							this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					case TimeUnit.Year:
						approx = new DateTime(
							normalFrom.year(), this._intReference.month(), this._intReference.day(),
							this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					/* istanbul ignore next */
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
		} else {
			// Amount is not 1,
			if (this._intDst === PeriodDst.RegularIntervals) {
				// apply to UTC time
				switch (this._intInterval.unit()) {
					case TimeUnit.Millisecond:
						diff = normalFrom.diff(this._intReference).milliseconds();
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Second:
						diff = normalFrom.diff(this._intReference).seconds();
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Minute:
						// only 25 leap seconds have ever been added so this should still be OK.
						diff = normalFrom.diff(this._intReference).minutes();
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Hour:
						diff = normalFrom.diff(this._intReference).hours();
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Day:
						diff = normalFrom.diff(this._intReference).hours() / 24;
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Month:
						diff = (normalFrom.utcYear() - this._intReference.utcYear()) * 12 +
							(normalFrom.utcMonth() - this._intReference.utcMonth()) - 1;
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Year:
						// The -1 below is because the day-of-month of reference date may be after the day of the fromDate
						diff = normalFrom.year() - this._intReference.year() - 1;
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.add(periods * this._intInterval.amount(), TimeUnit.Year);
						break;
					/* istanbul ignore next */
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
			} else {
				// Try to keep regular local times. If the unit is less than a day, we reference each day anew
				switch (this._intInterval.unit()) {
					case TimeUnit.Millisecond:
						if (this._intInterval.amount() < 1000 && (1000 % this._intInterval.amount()) === 0) {
							// optimization: same millisecond each second, so just take the fromDate
							// minus one second with the this._intReference milliseconds
							approx = new DateTime(
								normalFrom.year(), normalFrom.month(), normalFrom.day(),
								normalFrom.hour(), normalFrom.minute(), normalFrom.second(),
								this._intReference.millisecond(), this._intReference.zone()
							)
							.subLocal(1, TimeUnit.Second);
						} else {
							// per constructor assert, the seconds are less than a day, so just go the fromDate reference-of-day
							approx = new DateTime(
								normalFrom.year(), normalFrom.month(), normalFrom.day(),
								this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
								this._intReference.millisecond(), this._intReference.zone()
							);

							// since we start counting from this._intReference each day, we have to
							// take care of the shorter interval at the boundary
							remainder = Math.floor((86400000) % this._intInterval.amount());
							if (approx.greaterThan(normalFrom)) {
								// todo
								/* istanbul ignore if */
								if (approx.subLocal(remainder, TimeUnit.Millisecond).greaterThan(normalFrom)) {
									// normalFrom lies outside the boundary period before the reference date
									approx = approx.subLocal(1, TimeUnit.Day);
								}
							} else {
								if (approx.addLocal(1, TimeUnit.Day).subLocal(remainder, TimeUnit.Millisecond).lessEqual(normalFrom)) {
									// normalFrom lies in the boundary period, move to the next day
									approx = approx.addLocal(1, TimeUnit.Day);
								}
							}

							// optimization: binary search
							imax = Math.floor((86400000) / this._intInterval.amount());
							imin = 0;
							while (imax >= imin) {
								// calculate the midpoint for roughly equal partition
								imid = Math.floor((imin + imax) / 2);
								approx2 = approx.addLocal(imid * this._intInterval.amount(), TimeUnit.Millisecond);
								approxMin = approx2.subLocal(this._intInterval.amount(), TimeUnit.Millisecond);
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
					case TimeUnit.Second:
						if (this._intInterval.amount() < 60 && (60 % this._intInterval.amount()) === 0) {
							// optimization: same second each minute, so just take the fromDate
							// minus one minute with the this._intReference seconds
							approx = new DateTime(
								normalFrom.year(), normalFrom.month(), normalFrom.day(),
								normalFrom.hour(), normalFrom.minute(), this._intReference.second(),
								this._intReference.millisecond(), this._intReference.zone()
							)
							.subLocal(1, TimeUnit.Minute);
						} else {
							// per constructor assert, the seconds are less than a day, so just go the fromDate reference-of-day
							approx = new DateTime(
								normalFrom.year(), normalFrom.month(), normalFrom.day(),
								this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
								this._intReference.millisecond(), this._intReference.zone()
							);

							// since we start counting from this._intReference each day, we have to take
							// are of the shorter interval at the boundary
							remainder = Math.floor((86400) % this._intInterval.amount());
							if (approx.greaterThan(normalFrom)) {
								if (approx.subLocal(remainder, TimeUnit.Second).greaterThan(normalFrom)) {
									// normalFrom lies outside the boundary period before the reference date
									approx = approx.subLocal(1, TimeUnit.Day);
								}
							} else {
								if (approx.addLocal(1, TimeUnit.Day).subLocal(remainder, TimeUnit.Second).lessEqual(normalFrom)) {
									// normalFrom lies in the boundary period, move to the next day
									approx = approx.addLocal(1, TimeUnit.Day);
								}
							}

							// optimization: binary search
							imax = Math.floor((86400) / this._intInterval.amount());
							imin = 0;
							while (imax >= imin) {
								// calculate the midpoint for roughly equal partition
								imid = Math.floor((imin + imax) / 2);
								approx2 = approx.addLocal(imid * this._intInterval.amount(), TimeUnit.Second);
								approxMin = approx2.subLocal(this._intInterval.amount(), TimeUnit.Second);
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
						if (this._intInterval.amount() < 60 && (60 % this._intInterval.amount()) === 0) {
							// optimization: same hour this._intReferenceary each time, so just take the fromDate minus one hour
							// with the this._intReference minutes, seconds
							approx = new DateTime(
								normalFrom.year(), normalFrom.month(), normalFrom.day(),
								normalFrom.hour(), this._intReference.minute(), this._intReference.second(),
								this._intReference.millisecond(), this._intReference.zone()
							)
							.subLocal(1, TimeUnit.Hour);
						} else {
							// per constructor assert, the seconds fit in a day, so just go the fromDate previous day
							approx = new DateTime(
								normalFrom.year(), normalFrom.month(), normalFrom.day(),
								this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
								this._intReference.millisecond(), this._intReference.zone()
							);

							// since we start counting from this._intReference each day,
							// we have to take care of the shorter interval at the boundary
							remainder = Math.floor((24 * 60) % this._intInterval.amount());
							if (approx.greaterThan(normalFrom)) {
								if (approx.subLocal(remainder, TimeUnit.Minute).greaterThan(normalFrom)) {
									// normalFrom lies outside the boundary period before the reference date
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
						approx = new DateTime(
							normalFrom.year(), normalFrom.month(), normalFrom.day(),
							this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);

						// since we start counting from this._intReference each day,
						// we have to take care of the shorter interval at the boundary
						remainder = Math.floor(24 % this._intInterval.amount());
						if (approx.greaterThan(normalFrom)) {
							if (approx.subLocal(remainder, TimeUnit.Hour).greaterThan(normalFrom)) {
								// normalFrom lies outside the boundary period before the reference date
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
						diff = normalFrom.diff(this._intReference).hours() / 24;
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.addLocal(periods * this._intInterval.amount(), this._intInterval.unit());
						break;
					case TimeUnit.Month:
						diff = (normalFrom.year() - this._intReference.year()) * 12 +
							(normalFrom.month() - this._intReference.month());
						periods = Math.floor(diff / this._intInterval.amount());
						approx = this._intReference.addLocal(this._interval.multiply(periods));
						break;
					case TimeUnit.Year:
						// The -1 below is because the day-of-month of reference date may be after the day of the fromDate
						diff = normalFrom.year() - this._intReference.year() - 1;
						periods = Math.floor(diff / this._intInterval.amount());
						newYear = this._intReference.year() + periods * this._intInterval.amount();
						approx = new DateTime(
							newYear, this._intReference.month(), this._intReference.day(),
							this._intReference.hour(), this._intReference.minute(), this._intReference.second(),
							this._intReference.millisecond(), this._intReference.zone()
						);
						break;
					/* istanbul ignore next */
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
	}

	/**
	 * Returns the next timestamp in the period. The given timestamp must
	 * be at a period boundary, otherwise the answer is incorrect.
	 * This function has MUCH better performance than findFirst.
	 * Returns the datetime "count" times away from the given datetime.
	 * @param prev	Boundary date. Must have a time zone (any time zone) iff the period reference date has one.
	 * @param count	Number of periods to add. Optional. Must be an integer number, may be negative.
	 * @return (prev + count * period), in the same timezone as prev.
	 */
	public findNext(prev: DateTime, count: number = 1): DateTime {
		assert(!!prev, "Prev must be given");
		assert(!!this._intReference.zone() === !!prev.zone(),
			"The fromDate and referenceDate must both be aware or unaware");
		assert(typeof (count) === "number", "Count must be a number");
		assert(Math.floor(count) === count, "Count must be an integer");
		const normalizedPrev = this._normalizeDay(prev.toZone(this._reference.zone()));
		if (this._intDst === PeriodDst.RegularIntervals) {
			return this._correctDay(normalizedPrev.add(
				this._intInterval.amount() * count, this._intInterval.unit())
			).convert(prev.zone());
		} else {
			return this._correctDay(normalizedPrev.addLocal(
				this._intInterval.amount() * count, this._intInterval.unit())
			).convert(prev.zone());
		}
	}

	/**
	 * The last occurrence of the period less than
	 * the given date. The given date need not be at a period boundary.
	 * Pre: the fromdate and the period reference date must either both have timezones or not
	 * @param fromDate: the date before which to return the next date
	 * @return the last date matching the period before fromDate, given
	 *			in the same zone as the fromDate.
	 */
	public findLast(from: DateTime): DateTime {
		let result = this.findPrev(this.findFirst(from));
		if (result.equals(from)) {
			result = this.findPrev(result);
		}
		return result;
	}

	/**
	 * Returns the previous timestamp in the period. The given timestamp must
	 * be at a period boundary, otherwise the answer is incorrect.
	 * @param prev	Boundary date. Must have a time zone (any time zone) iff the period reference date has one.
	 * @param count	Number of periods to subtract. Optional. Must be an integer number, may be negative.
	 * @return (next - count * period), in the same timezone as next.
	 */
	public findPrev(next: DateTime, count: number = 1): DateTime {
		return this.findNext(next, -1 * count);
	}

	/**
	 * Checks whether the given date is on a period boundary
	 * (expensive!)
	 */
	public isBoundary(occurrence: DateTime): boolean {
		if (!occurrence) {
			return false;
		}
		assert(
			!!this._intReference.zone() === !!occurrence.zone(),
			"The occurrence and referenceDate must both be aware or unaware"
		);
		return (this.findFirst(occurrence.sub(Duration.milliseconds(1))).equals(occurrence));
	}

	/**
	 * Returns true iff this period has the same effect as the given one.
	 * i.e. a period of 24 hours is equal to one of 1 day if they have the same UTC reference moment
	 * and same dst.
	 */
	public equals(other: Period): boolean {
		// note we take the non-normalized _reference because this has an influence on the outcome
		if (!this.isBoundary(other._reference) || !this._intInterval.equals(other._intInterval)) {
			return false;
		}
		const refZone = this._reference.zone();
		const otherZone = other._reference.zone();
		const thisIsRegular = (this._intDst === PeriodDst.RegularIntervals || !refZone || refZone.isUtc());
		const otherIsRegular = (other._intDst === PeriodDst.RegularIntervals || !otherZone || otherZone.isUtc());
		if (thisIsRegular && otherIsRegular) {
			return true;
		}
		if (this._intDst === other._intDst && refZone && otherZone && refZone.equals(otherZone)) {
			return true;
		}
		return false;
	}

	/**
	 * Returns true iff this period was constructed with identical arguments to the other one.
	 */
	public identical(other: Period): boolean {
		return (this._reference.identical(other._reference)
			&& this._interval.identical(other._interval)
			&& this._dst === other._dst);
	}

	/**
	 * Returns an ISO duration string e.g.
	 * 2014-01-01T12:00:00.000+01:00/P1H
	 * 2014-01-01T12:00:00.000+01:00/PT1M   (one minute)
	 * 2014-01-01T12:00:00.000+01:00/P1M   (one month)
	 */
	public toIsoString(): string {
		return this._reference.toIsoString() + "/" + this._interval.toIsoString();
	}

	/**
	 * A string representation e.g.
	 * "10 years, referenceing at 2014-03-01T12:00:00 Europe/Amsterdam, keeping regular intervals".
	 */
	public toString(): string {
		let result: string = this._interval.toString() + ", referenceing at " + this._reference.toString();
		// only add the DST handling if it is relevant
		if (this._dstRelevant()) {
			result += ", keeping " + periodDstToString(this._dst);
		}
		return result;
	}

	/**
	 * Used by util.inspect()
	 */
	public inspect(): string {
		return "[Period: " + this.toString() + "]";
	}

	/**
	 * Corrects the difference between _reference and _intReference.
	 */
	private _correctDay(d: DateTime): DateTime {
		if (this._reference !== this._intReference) {
			return new DateTime(
				d.year(), d.month(), Math.min(basics.daysInMonth(d.year(), d.month()), this._reference.day()),
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
		if ((this._intInterval.unit() === TimeUnit.Month && d.day() > 28)
			|| (this._intInterval.unit() === TimeUnit.Year && (d.month() === 2 || anymonth) && d.day() > 28)
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
	 * (i.e. if the reference time zone has DST)
	 */
	private _dstRelevant(): boolean {
		let zone = this._reference.zone();
		return !!(zone
			&& zone.kind() === TimeZoneKind.Proper
			&& zone.hasDst()
		);
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
		let intAmount = this._interval.amount();
		let intUnit = this._interval.unit();

		if (intUnit === TimeUnit.Millisecond && intAmount >= 1000 && intAmount % 1000 === 0) {
			// note this won't work if we account for leap seconds
			intAmount = intAmount / 1000;
			intUnit = TimeUnit.Second;
		}
		if (intUnit === TimeUnit.Second && intAmount >= 60 && intAmount % 60 === 0) {
			// note this won't work if we account for leap seconds
			intAmount = intAmount / 60;
			intUnit = TimeUnit.Minute;
		}
		if (intUnit === TimeUnit.Minute && intAmount >= 60 && intAmount % 60 === 0) {
			intAmount = intAmount / 60;
			intUnit = TimeUnit.Hour;
		}
		if (intUnit === TimeUnit.Hour && intAmount >= 24 && intAmount % 24 === 0) {
			intAmount = intAmount / 24;
			intUnit = TimeUnit.Day;
		}
		// now remove weeks so we have one less case to worry about
		if (intUnit === TimeUnit.Week) {
			intAmount = intAmount * 7;
			intUnit = TimeUnit.Day;
		}
		if (intUnit === TimeUnit.Month && intAmount >= 12 && intAmount % 12 === 0) {
			intAmount = intAmount / 12;
			intUnit = TimeUnit.Year;
		}

		this._intInterval = new Duration(intAmount, intUnit);

		// normalize dst handling
		if (this._dstRelevant()) {
			this._intDst = this._dst;
		} else {
			this._intDst = PeriodDst.RegularIntervals;
		}

		// normalize reference day
		this._intReference = this._normalizeDay(this._reference, false);
	}

}
