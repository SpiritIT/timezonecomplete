/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time duration
 */

"use strict";

import * as assert from "assert";

import { TimeUnit } from "./basics";
import * as basics from "./basics";
import * as strings from "./strings";


/**
 * Construct a time duration
 * @param n	Number of years (may be fractional or negative)
 * @return A duration of n years
 */
export function years(n: number): Duration {
	return Duration.years(n);
}

/**
 * Construct a time duration
 * @param n	Number of months (may be fractional or negative)
 * @return A duration of n months
 */
export function months(n: number): Duration {
	return Duration.months(n);
}

/**
 * Construct a time duration
 * @param n	Number of days (may be fractional or negative)
 * @return A duration of n days
 */
export function days(n: number): Duration {
	return Duration.days(n);
}

/**
 * Construct a time duration
 * @param n	Number of hours (may be fractional or negative)
 * @return A duration of n hours
 */
export function hours(n: number): Duration {
	return Duration.hours(n);
}

/**
 * Construct a time duration
 * @param n	Number of minutes (may be fractional or negative)
 * @return A duration of n minutes
 */
export function minutes(n: number): Duration {
	return Duration.minutes(n);
}

/**
 * Construct a time duration
 * @param n	Number of seconds (may be fractional or negative)
 * @return A duration of n seconds
 */
export function seconds(n: number): Duration {
	return Duration.seconds(n);
}

/**
 * Construct a time duration
 * @param n	Number of milliseconds (may be fractional or negative)
 * @return A duration of n milliseconds
 */
export function milliseconds(n: number): Duration {
	return Duration.milliseconds(n);
}

/**
 * Time duration which is represented as an amount and a unit e.g.
 * '1 Month' or '166 Seconds'. The unit is preserved through calculations.
 *
 * It has two sets of getter functions:
 * - second(), minute(), hour() etc, singular form: these can be used to create string representations.
 *   These return a part of your string representation. E.g. for 2500 milliseconds, the millisecond() part would be 500
 * - seconds(), minutes(), hours() etc, plural form: these return the total amount represented in the corresponding unit.
 */
export class Duration {

	/**
	 * Given amount in constructor
	 */
	private _amount: number;

	/**
	 * Unit
	 */
	private _unit: TimeUnit;

	/**
	 * Construct a time duration
	 * @param n	Number of years (may be fractional or negative)
	 * @return A duration of n years
	 */
	public static years(n: number): Duration {
		return new Duration(n, TimeUnit.Year);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of months (may be fractional or negative)
	 * @return A duration of n months
	 */
	public static months(n: number): Duration {
		return new Duration(n, TimeUnit.Month);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of days (may be fractional or negative)
	 * @return A duration of n days
	 */
	public static days(n: number): Duration {
		return new Duration(n, TimeUnit.Day);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of hours (may be fractional or negative)
	 * @return A duration of n hours
	 */
	public static hours(n: number): Duration {
		return new Duration(n, TimeUnit.Hour);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of minutes (may be fractional or negative)
	 * @return A duration of n minutes
	 */
	public static minutes(n: number): Duration {
		return new Duration(n, TimeUnit.Minute);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of seconds (may be fractional or negative)
	 * @return A duration of n seconds
	 */
	public static seconds(n: number): Duration {
		return new Duration(n, TimeUnit.Second);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of milliseconds (may be fractional or negative)
	 * @return A duration of n milliseconds
	 */
	public static milliseconds(n: number): Duration {
		return new Duration(n, TimeUnit.Millisecond);
	}

	/**
	 * Construct a time duration of 0
	 */
	constructor();

	/**
	 * Construct a time duration from a string in one of two formats:
	 * 1) [-]hhhh[:mm[:ss[.nnn]]] e.g. '-01:00:30.501'
	 * 2) amount and unit e.g. '-1 days' or '1 year'. The unit may be in singular or plural form and is case-insensitive
	 */
	constructor(input: string);

	/**
	 * Construct a duration from an amount and a time unit.
	 * @param amount	Number of units
	 * @param unit	A time unit i.e. TimeUnit.Second, TimeUnit.Hour etc. Default Millisecond.
	 */
	constructor(amount: number, unit?: TimeUnit);

	/**
	 * Constructor implementation
	 */
	constructor(i1?: any, unit?: TimeUnit) {
		if (typeof (i1) === "number") {
			// amount+unit constructor
			const amount = <number>i1;
			this._amount = amount;
			this._unit = (typeof unit === "number" ? unit : TimeUnit.Millisecond);
		} else if (typeof (i1) === "string") {
			// string constructor
			this._fromString(<string>i1);
		} else {
			// default constructor
			this._amount = 0;
			this._unit = TimeUnit.Millisecond;
		}
	}

	/**
	 * @return another instance of Duration with the same value.
	 */
	public clone(): Duration {
		return new Duration(this._amount, this._unit);
	}

	/**
	 * Returns this duration expressed in different unit (positive or negative, fractional).
	 * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
	 * It is approximate for any other conversion
	 */
	public as(unit: TimeUnit): number {
		if (this._unit === unit) {
			return this._amount;
		} else if (this._unit >= TimeUnit.Month && unit >= TimeUnit.Month) {
			const thisMonths = (this._unit === TimeUnit.Year ? 12 : 1);
			const reqMonths = (unit === TimeUnit.Year ? 12 : 1);
			return this._amount * thisMonths / reqMonths;
		} else {
			const thisMsec = basics.timeUnitToMilliseconds(this._unit);
			const reqMsec = basics.timeUnitToMilliseconds(unit);
			return this._amount * thisMsec / reqMsec;
		}
	}

	/**
	 * Convert this duration to a Duration in another unit. You always get a clone even if you specify
	 * the same unit.
	 * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
	 * It is approximate for any other conversion
	 */
	public convert(unit: TimeUnit): Duration {
		return new Duration(this.as(unit), unit);
	}

	/**
	 * The entire duration in milliseconds (negative or positive)
	 * For Day/Month/Year durations, this is approximate!
	 */
	public milliseconds(): number {
		return this.as(TimeUnit.Millisecond);
	}

	/**
	 * The millisecond part of the duration (always positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 400 for a -01:02:03.400 duration
	 */
	public millisecond(): number {
		return this._part(TimeUnit.Millisecond);
	}

	/**
	 * The entire duration in seconds (negative or positive, fractional)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 1.5 for a 1500 milliseconds duration
	 */
	public seconds(): number {
		return this.as(TimeUnit.Second);
	}

	/**
	 * The second part of the duration (always positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 3 for a -01:02:03.400 duration
	 */
	public second(): number {
		return this._part(TimeUnit.Second);
	}

	/**
	 * The entire duration in minutes (negative or positive, fractional)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 1.5 for a 90000 milliseconds duration
	 */
	public minutes(): number {
		return this.as(TimeUnit.Minute);
	}

	/**
	 * The minute part of the duration (always positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 2 for a -01:02:03.400 duration
	 */
	public minute(): number {
		return this._part(TimeUnit.Minute);
	}

	/**
	 * The entire duration in hours (negative or positive, fractional)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 1.5 for a 5400000 milliseconds duration
	 */
	public hours(): number {
		return this.as(TimeUnit.Hour);
	}

	/**
	 * The hour part of a duration. This assumes that a day has 24 hours (which is not the case
	 * during DST changes).
	 */
	public hour(): number {
		return this._part(TimeUnit.Hour);
	}

	/**
	 * The hour part of the duration (always positive).
	 * Note that this part can exceed 23 hours, because for
	 * now, we do not have a days() function
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 25 for a -25:02:03.400 duration
	 */
	public wholeHours(): number {
		return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) / 3600000);
	}

	/**
	 * The entire duration in days (negative or positive, fractional)
	 * This is approximate if this duration is not in days!
	 */
	public days(): number {
		return this.as(TimeUnit.Day);
	}

	/**
	 * The day part of a duration. This assumes that a month has 30 days.
	 */
	public day(): number {
		return this._part(TimeUnit.Day);
	}

	/**
	 * The entire duration in days (negative or positive, fractional)
	 * This is approximate if this duration is not in Months or Years!
	 */
	public months(): number {
		return this.as(TimeUnit.Month);
	}

	/**
	 * The month part of a duration.
	 */
	public month(): number {
		return this._part(TimeUnit.Month);
	}

	/**
	 * The entire duration in years (negative or positive, fractional)
	 * This is approximate if this duration is not in Months or Years!
	 */
	public years(): number {
		return this.as(TimeUnit.Year);
	}

	/**
	 * Non-fractional positive years
	 */
	public wholeYears(): number {
		if (this._unit === TimeUnit.Year) {
			return Math.floor(Math.abs(this._amount));
		} else if (this._unit === TimeUnit.Month) {
			return Math.floor(Math.abs(this._amount) / 12);
		} else {
			return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) /
				basics.timeUnitToMilliseconds(TimeUnit.Year));
		}
	}

	/**
	 * Amount of units (positive or negative, fractional)
	 */
	public amount(): number {
		return this._amount;
	}

	/**
	 * The unit this duration was created with
	 */
	public unit(): TimeUnit {
		return this._unit;
	}

	/**
	 * Sign
	 * @return "-" if the duration is negative
	 */
	public sign(): string {
		return (this._amount < 0 ? "-" : "");
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff (this < other)
	 */
	public lessThan(other: Duration): boolean {
		return this.milliseconds() < other.milliseconds();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff (this <= other)
	 */
	public lessEqual(other: Duration): boolean {
		return this.milliseconds() <= other.milliseconds();
	}

	/**
	 * Similar but not identical
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff this and other represent the same time duration
	 */
	public equals(other: Duration): boolean {
		const converted = other.convert(this._unit);
		return this._amount === converted.amount() && this._unit === converted.unit();
	}

	/**
	 * Similar but not identical
	 * Returns false if we cannot determine whether they are equal in all time zones
	 * so e.g. 60 minutes equals 1 hour, but 24 hours do NOT equal 1 day
	 *
	 * @return True iff this and other represent the same time duration
	 */
	public equalsExact(other: Duration): boolean {
		if (this._unit >= TimeUnit.Month && other.unit() >= TimeUnit.Month) {
			return this.equals(other);
		} else if (this._unit <= TimeUnit.Day && other.unit() < TimeUnit.Day) {
			return this.equals(other);
		} else {
			return false;
		}
	}

	/**
	 * Same unit and same amount
	 */
	public identical(other: Duration): boolean {
		return this._amount === other.amount() && this._unit === other.unit();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff this > other
	 */
	public greaterThan(other: Duration): boolean {
		return this.milliseconds() > other.milliseconds();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff this >= other
	 */
	public greaterEqual(other: Duration): boolean {
		return this.milliseconds() >= other.milliseconds();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return The minimum (most negative) of this and other
	 */
	public min(other: Duration): Duration {
		if (this.lessThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return The maximum (most positive) of this and other
	 */
	public max(other: Duration): Duration {
		if (this.greaterThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * Multiply with a fixed number.
	 * @return a new Duration of (this * value)
	 */
	public multiply(value: number): Duration {
		return new Duration(this._amount * value, this._unit);
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * Divide by a fixed number.
	 * @return a new Duration of (this / value)
	 */
	public divide(value: number): Duration {
		if (value === 0) {
			throw new Error("Duration.divide(): Divide by zero");
		}
		return new Duration(this._amount / value, this._unit);
	}

	/**
	 * Add a duration.
	 * @return a new Duration of (this + value) with the unit of this duration
	 */
	public add(value: Duration): Duration {
		return new Duration(this._amount + value.as(this._unit), this._unit);
	}

	/**
	 * Subtract a duration.
	 * @return a new Duration of (this - value) with the unit of this duration
	 */
	public sub(value: Duration): Duration {
		return new Duration(this._amount - value.as(this._unit), this._unit);
	}

	/**
	 * Return the absolute value of the duration i.e. remove the sign.
	 */
	public abs(): Duration {
		if (this._amount >= 0) {
			return this.clone();
		} else {
			return this.multiply(-1);
		}
	}

	/**
	 * String in [-]hhhh:mm:ss.nnn notation. All fields are
	 * always present except the sign.
	 */
	public toFullString(): string {
		return this.toHmsString(true);
	}

	/**
	 * String in [-]hhhh:mm[:ss[.nnn]] notation.
	 * @param full If true, then all fields are always present except the sign. Otherwise, seconds and milliseconds
	 *             are chopped off if zero
	 */
	public toHmsString(full: boolean = false): string {
		let result: string = "";
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
	}

	/**
	 * String in ISO 8601 notation e.g. 'P1M' for one month or 'PT1M' for one minute
	 */
	public toIsoString(): string {
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
	}

	/**
	 * String representation with amount and unit e.g. '1.5 years' or '-1 day'
	 */
	public toString(): string {
		return this._amount.toString(10) + " " + basics.timeUnitToString(this._unit, this._amount);
	}

	/**
	 * Used by util.inspect()
	 */
	public inspect(): string {
		return "[Duration: " + this.toString() + "]";
	}

	/**
	 * The valueOf() method returns the primitive value of the specified object.
	 */
	public valueOf(): any {
		return this.milliseconds();
	}

	/**
	 * Return this % unit, always positive
	 */
	private _part(unit: TimeUnit): number {
		/* istanbul ignore if */
		if (unit === TimeUnit.Year) {
			return Math.floor(Math.abs(this.as(TimeUnit.Year)));
		}
		let nextUnit: TimeUnit;
		// note not all units are used here: Weeks and Years are ruled out
		switch (unit) {
			case TimeUnit.Millisecond: nextUnit = TimeUnit.Second; break;
			case TimeUnit.Second: nextUnit = TimeUnit.Minute; break;
			case TimeUnit.Minute: nextUnit = TimeUnit.Hour; break;
			case TimeUnit.Hour: nextUnit = TimeUnit.Day; break;
			case TimeUnit.Day: nextUnit = TimeUnit.Month; break;
			case TimeUnit.Month: nextUnit = TimeUnit.Year; break;
		}

		const msecs = (basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount)) % basics.timeUnitToMilliseconds(nextUnit);
		return Math.floor(msecs / basics.timeUnitToMilliseconds(unit));
	}


	private _fromString(s: string): void {
		const trimmed = s.trim();
		if (trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/)) {
			let sign: number = 1;
			let hours: number = 0;
			let minutes: number = 0;
			let seconds: number = 0;
			let milliseconds: number = 0;
			const parts: string[] = trimmed.split(":");
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
				const secondParts = parts[2].split(".");
				seconds = +secondParts[0];
				if (secondParts.length > 1) {
					milliseconds = +strings.padRight(secondParts[1], 3, "0");
				}
			}
			const amountMsec = sign * Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
			// find lowest non-zero number and take that as unit
			if (milliseconds !== 0) {
				this._unit = TimeUnit.Millisecond;
			} else if (seconds !== 0) {
				this._unit = TimeUnit.Second;
			} else if (minutes !== 0) {
				this._unit = TimeUnit.Minute;
			} else if (hours !== 0) {
				this._unit = TimeUnit.Hour;
			} else {
				this._unit = TimeUnit.Millisecond;
			}
			this._amount = amountMsec / basics.timeUnitToMilliseconds(this._unit);
		} else {
			const split = trimmed.toLowerCase().split(" ");
			if (split.length !== 2) {
				throw new Error("Invalid time string '" + s + "'");
			}
			const amount = parseFloat(split[0]);
			assert(!isNaN(amount), "Invalid time string '" + s + "', cannot parse amount");
			assert(isFinite(amount), "Invalid time string '" + s + "', amount is infinite");
			this._amount = amount;
			this._unit = basics.stringToTimeUnit(split[1]);
		}
	}
};

