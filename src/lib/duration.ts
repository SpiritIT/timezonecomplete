/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Time duration
 */

"use strict";

import assert from "./assert";
import { TimeUnit } from "./basics";
import * as basics from "./basics";
import * as strings from "./strings";


/**
 * Construct a time duration
 * @param n	Number of years (may be fractional or negative)
 * @return A duration of n years
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
export function years(n: number): Duration {
	return Duration.years(n);
}

/**
 * Construct a time duration
 * @param n	Number of months (may be fractional or negative)
 * @return A duration of n months
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
export function months(n: number): Duration {
	return Duration.months(n);
}

/**
 * Construct a time duration
 * @param n	Number of days (may be fractional or negative)
 * @return A duration of n days
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
export function days(n: number): Duration {
	return Duration.days(n);
}

/**
 * Construct a time duration
 * @param n	Number of hours (may be fractional or negative)
 * @return A duration of n hours
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
export function hours(n: number): Duration {
	return Duration.hours(n);
}

/**
 * Construct a time duration
 * @param n	Number of minutes (may be fractional or negative)
 * @return A duration of n minutes
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
export function minutes(n: number): Duration {
	return Duration.minutes(n);
}

/**
 * Construct a time duration
 * @param n	Number of seconds (may be fractional or negative)
 * @return A duration of n seconds
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
 */
export function seconds(n: number): Duration {
	return Duration.seconds(n);
}

/**
 * Construct a time duration
 * @param n	Number of milliseconds (may be fractional or negative)
 * @return A duration of n milliseconds
 * @throws timezonecomplete.Argument.Amount if n is not a finite number
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
	 * Allow not using instanceof
	 */
	public kind = "Duration";

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
	 * @param amount Number of years (may be fractional or negative)
	 * @return A duration of n years
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static years(amount: number): Duration {
		return new Duration(amount, TimeUnit.Year);
	}

	/**
	 * Construct a time duration
	 * @param amount Number of months (may be fractional or negative)
	 * @return A duration of n months
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static months(amount: number): Duration {
		return new Duration(amount, TimeUnit.Month);
	}

	/**
	 * Construct a time duration
	 * @param amount Number of days (may be fractional or negative)
	 * @return A duration of n days
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static days(amount: number): Duration {
		return new Duration(amount, TimeUnit.Day);
	}

	/**
	 * Construct a time duration
	 * @param amount Number of hours (may be fractional or negative)
	 * @return A duration of n hours
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static hours(amount: number): Duration {
		return new Duration(amount, TimeUnit.Hour);
	}

	/**
	 * Construct a time duration
	 * @param amount Number of minutes (may be fractional or negative)
	 * @return A duration of n minutes
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static minutes(amount: number): Duration {
		return new Duration(amount, TimeUnit.Minute);
	}

	/**
	 * Construct a time duration
	 * @param amount Number of seconds (may be fractional or negative)
	 * @return A duration of n seconds
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static seconds(amount: number): Duration {
		return new Duration(amount, TimeUnit.Second);
	}

	/**
	 * Construct a time duration
	 * @param amount Number of milliseconds (may be fractional or negative)
	 * @return A duration of n milliseconds
	 * @throws timezonecomplete.Argument.Amount if n is not a finite number
	 */
	public static milliseconds(amount: number): Duration {
		return new Duration(amount, TimeUnit.Millisecond);
	}

	/**
	 * Construct a time duration of 0 milliseconds
	 * @throws nothing
	 */
	constructor();

	/**
	 * Construct a time duration from a string in one of two formats:
	 * 1) [-]hhhh[:mm[:ss[.nnn]]] e.g. '-01:00:30.501'
	 * 2) amount and unit e.g. '-1 days' or '1 year'. The unit may be in singular or plural form and is case-insensitive
	 * @throws timezonecomplete.Argument.S for invalid string
	 */
	constructor(s: string);

	/**
	 * Construct a duration from an amount and a time unit.
	 * @param amount	Number of units
	 * @param unit	A time unit i.e. TimeUnit.Second, TimeUnit.Hour etc. Default Millisecond.
	 * @throws timezonecomplete.Argument.Amount if `amount` is not a finite number
	 * @throws timezonecomplete.Argument.Unit for invalid `unit`
	 */
	constructor(amount: number, unit?: TimeUnit);

	/**
	 * Constructor implementation
	 */
	constructor(i1?: any, unit?: TimeUnit) {
		if (typeof i1 === "number") {
			// amount+unit constructor
			const amount = i1 as number;
			assert(Number.isFinite(amount), "Argument.Amount", "amount should be finite: %d", amount);
			this._amount = amount;
			this._unit = (typeof unit === "number" ? unit : TimeUnit.Millisecond);
			assert(
				Number.isInteger(this._unit) && this._unit >= 0 && this._unit < TimeUnit.MAX,
				"Argument.Unit", "Invalid time unit %d", this._unit
			);
		} else if (typeof i1 === "string") {
			// string constructor
			const s = i1 as string;
			const trimmed = s.trim();
			if (trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/)) {
				let sign: number = 1;
				let hours: number = 0;
				let minutes: number = 0;
				let seconds: number = 0;
				let milliseconds: number = 0;
				const parts: string[] = trimmed.split(":");
				assert(parts.length > 0 && parts.length < 4, "Argument.S", "Not a proper time duration string: \"" + trimmed + "\"");
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
				assert(split.length === 2, "Argument.S", "Invalid time string '%s'", s);
				const amount = parseFloat(split[0]);
				assert(Number.isFinite(amount), "Argument.S", "Invalid time string '%s', cannot parse amount", s);
				this._amount = amount;
				this._unit = basics.stringToTimeUnit(split[1]);
			}
		} else if (i1 === undefined && unit === undefined) {
			// default constructor
			this._amount = 0;
			this._unit = TimeUnit.Millisecond;
		} else {
			assert(false, "Argument.Amount", "invalid constructor arguments");
		}
	}

	/**
	 * @return another instance of Duration with the same value.
	 * @throws nothing
	 */
	public clone(): Duration {
		return new Duration(this._amount, this._unit);
	}

	/**
	 * Returns this duration expressed in different unit (positive or negative, fractional).
	 * This is precise for Year <-> Month and for time-to-time conversion (i.e. Hour-or-less to Hour-or-less).
	 * It is approximate for any other conversion
	 * @throws nothing
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
	 * @throws nothing
	 */
	public convert(unit: TimeUnit): Duration {
		return new Duration(this.as(unit), unit);
	}

	/**
	 * The entire duration in milliseconds (negative or positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @throws nothing
	 */
	public milliseconds(): number {
		return this.as(TimeUnit.Millisecond);
	}

	/**
	 * The millisecond part of the duration (always positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 400 for a -01:02:03.400 duration
	 * @throws nothing
	 */
	public millisecond(): number {
		return this._part(TimeUnit.Millisecond);
	}

	/**
	 * The entire duration in seconds (negative or positive, fractional)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 1.5 for a 1500 milliseconds duration
	 * @throws nothing
	 */
	public seconds(): number {
		return this.as(TimeUnit.Second);
	}

	/**
	 * The second part of the duration (always positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 3 for a -01:02:03.400 duration
	 * @throws nothing
	 */
	public second(): number {
		return this._part(TimeUnit.Second);
	}

	/**
	 * The entire duration in minutes (negative or positive, fractional)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 1.5 for a 90000 milliseconds duration
	 * @throws nothing
	 */
	public minutes(): number {
		return this.as(TimeUnit.Minute);
	}

	/**
	 * The minute part of the duration (always positive)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 2 for a -01:02:03.400 duration
	 * @throws nothing
	 */
	public minute(): number {
		return this._part(TimeUnit.Minute);
	}

	/**
	 * The entire duration in hours (negative or positive, fractional)
	 * For Day/Month/Year durations, this is approximate!
	 * @return e.g. 1.5 for a 5400000 milliseconds duration
	 * @throws nothing
	 */
	public hours(): number {
		return this.as(TimeUnit.Hour);
	}

	/**
	 * The hour part of a duration. This assumes that a day has 24 hours (which is not the case
	 * during DST changes).
	 * @throws nothing
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
	 * @throws nothing
	 */
	public wholeHours(): number {
		return Math.floor(basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount) / 3600000);
	}

	/**
	 * The entire duration in days (negative or positive, fractional)
	 * This is approximate if this duration is not in days!
	 * @throws nothing
	 */
	public days(): number {
		return this.as(TimeUnit.Day);
	}

	/**
	 * The day part of a duration. This assumes that a month has 30 days.
	 * @throws nothing
	 */
	public day(): number {
		return this._part(TimeUnit.Day);
	}

	/**
	 * The entire duration in days (negative or positive, fractional)
	 * This is approximate if this duration is not in Months or Years!
	 * @throws nothing
	 */
	public months(): number {
		return this.as(TimeUnit.Month);
	}

	/**
	 * The month part of a duration.
	 * @throws nothing
	 */
	public month(): number {
		return this._part(TimeUnit.Month);
	}

	/**
	 * The entire duration in years (negative or positive, fractional)
	 * This is approximate if this duration is not in Months or Years!
	 * @throws nothing
	 */
	public years(): number {
		return this.as(TimeUnit.Year);
	}

	/**
	 * Non-fractional positive years
	 * @throws nothing
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
	 * @throws nothing
	 */
	public amount(): number {
		return this._amount;
	}

	/**
	 * The unit this duration was created with
	 * @throws nothing
	 */
	public unit(): TimeUnit {
		return this._unit;
	}

	/**
	 * Sign
	 * @return "-" if the duration is negative
	 * @throws nothing
	 */
	public sign(): string {
		return (this._amount < 0 ? "-" : "");
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff (this < other)
	 * @throws nothing
	 */
	public lessThan(other: Duration): boolean {
		return this.milliseconds() < other.milliseconds();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff (this <= other)
	 * @throws nothing
	 */
	public lessEqual(other: Duration): boolean {
		return this.milliseconds() <= other.milliseconds();
	}

	/**
	 * Similar but not identical
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff this and other represent the same time duration
	 * @throws nothing
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
	 * @throws nothing
	 */
	public equalsExact(other: Duration): boolean {
		if (this._unit === other._unit) {
			return (this._amount === other._amount);
		} else if (this._unit >= TimeUnit.Month && other.unit() >= TimeUnit.Month) {
			return this.equals(other); // can compare months and years
		} else if (this._unit < TimeUnit.Day && other.unit() < TimeUnit.Day) {
			return this.equals(other); // can compare milliseconds through hours
		} else {
			return false; // cannot compare days to anything else
		}
	}

	/**
	 * Same unit and same amount
	 * @throws nothing
	 */
	public identical(other: Duration): boolean {
		return this._amount === other.amount() && this._unit === other.unit();
	}

	/**
	 * Returns true if this is a non-zero length duration
	 */
	public nonZero(): boolean {
		return this._amount !== 0;
	}

	/**
	 * Returns true if this is a zero-length duration
	 */
	public zero(): boolean {
		return this._amount === 0;
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff this > other
	 * @throws nothing
	 */
	public greaterThan(other: Duration): boolean {
		return this.milliseconds() > other.milliseconds();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return True iff this >= other
	 * @throws nothing
	 */
	public greaterEqual(other: Duration): boolean {
		return this.milliseconds() >= other.milliseconds();
	}

	/**
	 * Approximate if the durations have units that cannot be converted
	 * @return The minimum (most negative) of this and other
	 * @throws nothing
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
	 * @throws nothing
	 */
	public max(other: Duration): Duration {
		if (this.greaterThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * Multiply with a fixed number.
	 * Approximate if the durations have units that cannot be converted
	 * @return a new Duration of (this * value)
	 * @throws nothing
	 */
	public multiply(value: number): Duration {
		return new Duration(this._amount * value, this._unit);
	}

	/**
	 * Divide by a unitless number. The result is a Duration, e.g. 1 year / 2 = 0.5 year
	 * The result is approximate if this duration as a unit that cannot be converted to a number (e.g. 1 month has variable length)
	 * @return a new Duration of (this / value)
	 * @throws timezonecomplete.Argument.Value if value is 0 or non-finite
	 */
	public divide(value: number): Duration;
	/**
	 * Divide this Duration by a Duration. The result is a unitless number e.g. 1 year / 1 month = 12
	 * The result is approximate if this duration as a unit that cannot be converted to a number (e.g. 1 month has variable length)
	 * @return a new Duration of (this / value)
	 * @throws timezonecomplete.Argument.Value if the duration is 0
	 */
	public divide(value: Duration): number;
	public divide(value: number | Duration): Duration | number {
		if (typeof value === "number") {
			assert(Number.isFinite(value) && value !== 0, "Argument.Value", "cannot divide by %d", value);
			return new Duration(this._amount / value, this._unit);
		} else {
			assert(value.amount() !== 0, "Argument.Value", "cannot divide by 0");
			return this.milliseconds() / value.milliseconds();
		}
	}

	/**
	 * Add a duration.
	 * @return a new Duration of (this + value) with the unit of this duration
	 * @throws nothing
	 */
	public add(value: Duration): Duration {
		return new Duration(this._amount + value.as(this._unit), this._unit);
	}

	/**
	 * Subtract a duration.
	 * @return a new Duration of (this - value) with the unit of this duration
	 * @throws nothing
	 */
	public sub(value: Duration): Duration {
		return new Duration(this._amount - value.as(this._unit), this._unit);
	}

	/**
	 * Return the absolute value of the duration i.e. remove the sign.
	 * @throws nothing
	 */
	public abs(): Duration {
		if (this._amount >= 0) {
			return this.clone();
		} else {
			return this.multiply(-1);
		}
	}

	/**
	 * String in [-]hhhh:mm:ss.nnn notation. All fields are always present except the sign.
	 * @throws nothing
	 */
	public toFullString(): string {
		return this.toHmsString(true);
	}

	/**
	 * String in [-]hhhh:mm[:ss[.nnn]] notation.
	 * @param full If true, then all fields are always present except the sign. Otherwise, seconds and milliseconds
	 * are chopped off if zero
	 * @throws nothing
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
	 * @throws nothing
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
					throw new Error("Unknown time unit."); // programming error
				}
		}
	}

	/**
	 * String representation with amount and unit e.g. '1.5 years' or '-1 day'
	 * @throws nothing
	 */
	public toString(): string {
		return this._amount.toString(10) + " " + basics.timeUnitToString(this._unit, this._amount);
	}

	/**
	 * The valueOf() method returns the primitive value of the specified object.
	 * @throws nothing
	 */
	public valueOf(): number {
		return this.milliseconds();
	}

	/**
	 * Return this % unit, always positive
	 * @throws nothing
	 */
	private _part(unit: TimeUnit): number {
		let nextUnit: TimeUnit;
		// note not all units are used here: Weeks and Years are ruled out
		switch (unit) {
			case TimeUnit.Millisecond: nextUnit = TimeUnit.Second; break;
			case TimeUnit.Second: nextUnit = TimeUnit.Minute; break;
			case TimeUnit.Minute: nextUnit = TimeUnit.Hour; break;
			case TimeUnit.Hour: nextUnit = TimeUnit.Day; break;
			case TimeUnit.Day: nextUnit = TimeUnit.Month; break;
			case TimeUnit.Month: nextUnit = TimeUnit.Year; break;
			default:
				return Math.floor(Math.abs(this.as(TimeUnit.Year)));
		}

		const msecs = (basics.timeUnitToMilliseconds(this._unit) * Math.abs(this._amount)) % basics.timeUnitToMilliseconds(nextUnit);
		return Math.floor(msecs / basics.timeUnitToMilliseconds(unit));
	}

}

/**
 * Checks if a given object is of type Duration. Note that it does not work for sub classes. However, use this to be robust
 * against different versions of the library in one process instead of instanceof
 * @param value Value to check
 * @throws nothing
 */
export function isDuration(value: any): value is Duration {
	return typeof value === "object" && value !== null && value.kind === "Duration";
}
