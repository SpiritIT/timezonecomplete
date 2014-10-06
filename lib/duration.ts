/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time duration
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

import strings = require("./strings");

/**
 * Time duration. Create one e.g. like this: var d = Duration.hours(1).
 * Note that time durations do not take leap seconds etc. into account:
 * one hour is simply represented as 3600000 milliseconds.
 */
export class Duration {

	/**
	 * Positive number of milliseconds
	 * Stored positive because otherwise we constantly have to choose
	 * between Math.floor() and Math.ceil()
	 */
	private _milliseconds: number;

	/**
	 * Sign: 1 or -1
	 */
	private _sign: number;

	/**
	 * Construct a time duration
	 * @param n	Number of hours
	 * @return A duration of n hours
	 */
	public static hours(n: number): Duration {
		return new Duration(n * 3600000);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of minutes
	 * @return A duration of n minutes
	 */
	public static minutes(n: number): Duration {
		return new Duration(n * 60000);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of seconds
	 * @return A duration of n seconds
	 */
	public static seconds(n: number): Duration {
		return new Duration(n * 1000);
	}

	/**
	 * Construct a time duration
	 * @param n	Number of milliseconds
	 * @return A duration of n milliseconds
	 */
	public static milliseconds(n: number): Duration {
		return new Duration(n);
	}

	/**
	 * Construct a time duration of 0
	 */
	constructor();

	/**
	 * Construct a time duration from a number of milliseconds
	 */
	constructor(milliseconds: number);

	/**
	 * Construct a time duration from a string in format
	 * [-]h[:m[:s[.n]]] e.g. -01:00:30.501
	 */
	constructor(input: string);

	/**
	 * Constructor implementation
	 */
	constructor(i1?: any) {
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
	 * @return another instance of Duration with the same value.
	 */
	public clone(): Duration {
		return Duration.milliseconds(this.milliseconds());
	}

	/**
	 * The entire duration in milliseconds (negative or positive)
	 */
	public milliseconds(): number {
		return this._sign * this._milliseconds;
	}

	/**
	 * The millisecond part of the duration (always positive)
	 * @return e.g. 400 for a -01:02:03.400 duration
	 */
	public millisecond(): number {
		return this._milliseconds % 1000;
	}

	/**
	 * The entire duration in seconds (negative or positive, fractional)
	 * @return e.g. 1.5 for a 1500 milliseconds duration
	 */
	public seconds(): number {
		return this._sign * this._milliseconds / 1000;
	}

	/**
	 * The second part of the duration (always positive)
	 * @return e.g. 3 for a -01:02:03.400 duration
	 */
	public second(): number {
		return Math.floor(this._milliseconds / 1000) % 60;
	}

	/**
	 * The entire duration in minutes (negative or positive, fractional)
	 * @return e.g. 1.5 for a 90000 milliseconds duration
	 */
	public minutes(): number {
		return this._sign * this._milliseconds / 60000;
	}

	/**
	 * The minute part of the duration (always positive)
	 * @return e.g. 2 for a -01:02:03.400 duration
	 */
	public minute(): number {
		return Math.floor(this._milliseconds / 60000) % 60;
	}

	/**
	 * The entire duration in hours (negative or positive, fractional)
	 * @return e.g. 1.5 for a 5400000 milliseconds duration
	 */
	public hours(): number {
		return this._sign * this._milliseconds / 3600000;
	}

	/**
	 * The hour part of the duration (always positive).
	 * Note that this part can exceed 23 hours, because for
	 * now, we do not have a days() function
	 * @return e.g. 25 for a -25:02:03.400 duration
	 */
	public wholeHours(): number {
		return Math.floor(this._milliseconds / 3600000);
	}

	// note there is no hour() method as that would only make sense if we
	// also had a days() method.

	/**
	 * Sign
	 * @return "-" if the duration is negative
	 */
	public sign(): string {
		return (this._sign < 0 ? "-" : "");
	}

	/**
	 * @return True iff (this < other)
	 */
	public lessThan(other: Duration): boolean {
		return this.milliseconds() < other.milliseconds();
	}

	/**
	 * @return True iff (this <= other)
	 */
	public lessEqual(other: Duration): boolean {
		return this.milliseconds() <= other.milliseconds();
	}

	/**
	 * @return True iff this and other represent the same time duration
	 */
	public equals(other: Duration): boolean {
		return this.milliseconds() === other.milliseconds();
	}

	/**
	 * @return True iff this > other
	 */
	public greaterThan(other: Duration): boolean {
		return this.milliseconds() > other.milliseconds();
	}

	/**
	 * @return True iff this >= other
	 */
	public greaterEqual(other: Duration): boolean {
		return this.milliseconds() >= other.milliseconds();
	}

	/**
	 * @return The minimum (most negative) of this and other
	 */
	public min(other: Duration): Duration {
		if (this.lessThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * @return The maximum (most positive) of this and other
	 */
	public max(other: Duration): Duration {
		if (this.greaterThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * Multiply with a fixed number.
	 * @return a new Duration of (this * value)
	 */
	public multiply(value: number): Duration {
		return new Duration(this.milliseconds() * value);
	}

	/**
	 * Divide by a fixed number.
	 * @return a new Duration of (this / value)
	 */
	public divide(value: number): Duration {
		if (value === 0) {
			throw new Error("Duration.divide(): Divide by zero");
		}
		return new Duration(this.milliseconds() / value);
	}

	/**
	 * Add a duration.
	 * @return a new Duration of (this + value)
	 */
	public add(value: Duration): Duration {
		return new Duration(this.milliseconds() + value.milliseconds());
	}

	/**
	 * Subtract a duration.
	 * @return a new Duration of (this - value)
	 */
	public sub(value: Duration): Duration {
		return new Duration(this.milliseconds() - value.milliseconds());
	}

	/**
	 * String in [-]hh:mm:ss.nnn notation. All fields are
	 * always present except the sign.
	 */
	public toFullString(): string {
		return this._toString(true);
	}

	/**
	 * String in [-]hh[:mm[:ss[.nnn]]] notation. Fields are
	 * added as necessary
	 */
	public toString(): string {
		return this._toString(false);
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

	private _toString(full: boolean): string {
		var result: string = "";
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

	private _fromString(s: string): void {
		var trimmed = s.trim();
		assert(trimmed.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/), "Not a proper time duration string: \"" + trimmed + "\"");
		var sign: number = 1;
		var hours: number = 0;
		var minutes: number = 0;
		var seconds: number = 0;
		var milliseconds: number = 0;
		var parts: string[] = trimmed.split(":");
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
		this._milliseconds = Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
		this._sign = sign;
	}
};

