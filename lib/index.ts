/**
 * Copyright(c) 2014 Spirit IT BV
 * 
 * Date and Time utility functions
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");
import path = require("path");
import timezoneJS = require("timezone-js");

// timezone-js initialization
timezoneJS.timezone.zoneFileBasePath = path.join(__dirname, "tz");
// need to preload all names in order to validate them
timezoneJS.timezone.loadingScheme = timezoneJS.timezone.loadingSchemes.PRELOAD_ALL;
timezoneJS.timezone.init({ async: false });

/**
 * Pad a string by adding characters to the beginning.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
function padLeft(s: string, width: number, char: string): string {
	assert(width > 0, "expect width > 0");
	assert(char.length === 1, "expect single character in char");
	var padding: string = "";
	for (var i = 0; i < (width - s.length); i++) {
		padding += char;
	}
	return padding + s;
}

/**
 * Pad a string by adding characters to the end.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
function padRight(s: string, width: number, char: string): string {
	assert(width > 0, "expect width > 0");
	assert(char.length === 1, "expect single character in char");
	var padding: string = "";
	for (var i = 0; i < (width - s.length); i++) {
		padding += char;
	}
	return s + padding;
}

/**
 * @return True iff the given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
	// from Wikipedia:
	// if year is not divisible by 4 then common year
	// else if year is not divisible by 100 then leap year
	// else if year is not divisible by 400 then common year
	// else leap year
	if (year % 4 !== 0) {
		return false;
	} else if (year % 100 !== 0) {
		return true;
	} else if (year % 400 !== 0) {
		return false;
	} else {
		return true;
	}
}

/**
 * @param year	The full year
 * @param month	The month 1-12
 * @return The number of days in the given month
 */
export function daysInMonth(year: number, month: number): number {
	switch (month) {
		case 1:
		case 3:
		case 5:
		case 7:
		case 8:
		case 10:
		case 12:
			return 31;
		case 2:
			return (isLeapYear(year) ? 29 : 28);
		case 4:
		case 6:
		case 9:
		case 11:
			return 30;
		default:
			assert(false, "Invalid month: " + month);
			/* istanbul ignore next */
			return 0;
	}
}

/**
 * Returns an ISO time string. Note that months are 1-12.
 */
export function isoString(year: number, month: number, day: number,
	hour: number, minute: number, second: number, millisecond: number): string {
	return padLeft(year.toString(10), 4, "0")
		+ "-" + padLeft(month.toString(10), 2, "0")
		+ "-" + padLeft(day.toString(10), 2, "0")
		+ "T" + padLeft(hour.toString(10), 2, "0")
		+ ":" + padLeft(minute.toString(10), 2, "0")
		+ ":" + padLeft(second.toString(10), 2, "0")
		+ "." + padLeft(millisecond.toString(10), 3, "0")
		;
}

/**
 * Time units
 */
export enum TimeUnit {
	Second,
	Minute,
	Hour,
	Day,
	Week,
	Month,
	Year
}

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
	clone(): Duration {
		return Duration.milliseconds(this.milliseconds());
	}

	/** 
	 * The entire duration in milliseconds (negative or positive)
	 */
	milliseconds(): number {
		return this._sign * this._milliseconds;
	}

	/** 
	 * The millisecond part of the duration (always positive)
	 * @return e.g. 400 for a -01:02:03.400 duration
	 */
	millisecond(): number {
		return this._milliseconds % 1000;
	}

	/** 
	 * The entire duration in seconds (negative or positive, fractional)
	 * @return e.g. 1.5 for a 1500 milliseconds duration
	 */
	seconds(): number {
		return this._sign * this._milliseconds / 1000;
	}

	/** 
	 * The second part of the duration (always positive)
	 * @return e.g. 3 for a -01:02:03.400 duration
	 */
	second(): number {
		return Math.floor(this._milliseconds / 1000) % 60;
	}

	/** 
	 * The entire duration in minutes (negative or positive, fractional)
	 * @return e.g. 1.5 for a 90000 milliseconds duration
	 */
	minutes(): number {
		return this._sign * this._milliseconds / 60000;
	}

	/** 
	 * The minute part of the duration (always positive)
	 * @return e.g. 2 for a -01:02:03.400 duration
	 */
	minute(): number {
		return Math.floor(this._milliseconds / 60000) % 60;
	}

	/** 
	 * The entire duration in hours (negative or positive, fractional)
	 * @return e.g. 1.5 for a 5400000 milliseconds duration
	 */
	hours(): number {
		return this._sign * this._milliseconds / 3600000;
	}

	/** 
	 * The hour part of the duration (always positive).
	 * Note that this part can exceed 23 hours, because for 
	 * now, we do not have a days() function
	 * @return e.g. 25 for a -25:02:03.400 duration
	 */
	wholeHours(): number {
		return Math.floor(this._milliseconds / 3600000);
	}

	// note there is no hour() method as that would only make sense if we
	// also had a days() method.

	/**
	 * Sign
	 * @return "-" if the duration is negative
	 */
	sign(): string {
		return (this._sign < 0 ? "-" : "");
	}

	/**
	 * @return True iff (this < other)
	 */
	lessThan(other: Duration): boolean {
		return this.milliseconds() < other.milliseconds();
	}

	/**
	 * @return True iff this and other represent the same time duration
	 */
	equals(other: Duration): boolean {
		return this.milliseconds() === other.milliseconds();
	}

	/**
	 * @return True iff this > other
	 */
	greaterThan(other: Duration): boolean {
		return this.milliseconds() > other.milliseconds();
	}

	/**
	 * @return The minimum (most negative) of this and other
	 */
	min(other: Duration): Duration {
		if (this.lessThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * @return The maximum (most positive) of this and other
	 */
	max(other: Duration): Duration {
		if (this.greaterThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * Multiply with a fixed number.
	 * @return a new Duration of (this * value)
	 */
	multiply(value: number): Duration {
		return new Duration(this.milliseconds() * value);
	}

	/**
	 * Divide by a fixed number.
	 * @return a new Duration of (this / value)
	 */
	divide(value: number): Duration {
		if (value === 0) {
			throw new Error("Duration.divide(): Divide by zero");
		}
		return new Duration(this.milliseconds() / value);
	}

	/**
	 * Add a duration.
	 * @return a new Duration of (this + value)
	 */
	add(value: Duration): Duration {
		return new Duration(this.milliseconds() + value.milliseconds());
	}

	/**
	 * Subtract a duration.
	 * @return a new Duration of (this - value)
	 */
	sub(value: Duration): Duration {
		return new Duration(this.milliseconds() - value.milliseconds());
	}

	/**
	 * String in [-]hh:mm:ss.nnn notation. All fields are 
	 * always present except the sign.
	 */
	toFullString(): string {
		return this._toString(true);
	}

	/**
	 * String in [-]hh[:mm[:ss[.nnn]]] notation. Fields are 
	 * added as necessary
	 */
	toString(): string {
		return this._toString(false);
	}
	
	/**
	 * Used by util.inspect()
	 */
	inspect(): string {
		return "[Duration: " + this.toString() + "]";
	}

	private _toString(full: boolean): string {
		var result: string = "";
		if (full || this.millisecond() > 0) {
			result = "." + padLeft(this.millisecond().toString(10), 3, "0");
		}
		if (full || result.length > 0 || this.second() > 0) {
			result = ":" + padLeft(this.second().toString(10), 2, "0") + result;
		}
		if (full || result.length > 0 || this.minute() > 0) {
			result = ":" + padLeft(this.minute().toString(10), 2, "0") + result;
		}
		return this.sign() + padLeft(this.wholeHours().toString(10), 2, "0") + result;
	}

	private _fromString(s: string): void {
		assert(s.match(/^-?\d\d?(:\d\d?(:\d\d?(.\d\d?\d?)?)?)?$/), "Not a proper time duration string: \"" + s + "\"");
		var sign: number = 1;
		var hours: number = 0;
		var minutes: number = 0;
		var seconds: number = 0;
		var milliseconds: number = 0;
		var parts: string[] = s.split(":");
		assert(parts.length > 0 && parts.length < 4, "Not a proper time duration string: \"" + s + "\"");
		if (s.charAt(0) === "-") {
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
				milliseconds = +padRight(secondParts[1], 3, "0");
			}
		}
		this._milliseconds = Math.round(milliseconds + 1000 * seconds + 60000 * minutes + 3600000 * hours);
		this._sign = sign;
	}
};


/**
 * The type of time zone
 */
export enum TimeZoneKind {
	/** 
	 * Local time offset as determined by JavaScript Date class.
	 */
	Local,
	/** 
	 * Fixed offset from UTC, without DST.
	 */
	Offset,
	/** 
	 * IANA timezone managed through Olsen TZ database. Includes
	 * DST if applicable.
	 */
	Proper
}

/**
 * Time zone. The object is immutable because it is cached: 
 * requesting a time zone twice yields the very same object.
 * Note that we use time zone offsets inverted w.r.t. JavaScript Date.getTimezoneOffset(),
 * i.e. offset 90 means +01:30. 
 *
 * Time zones come in three flavors: the local time zone, as calculated by JavaScript Date, 
 * a fixed offset ("+01:30") without DST, or a IANA timezone ("Europe/Amsterdam") with DST 
 * applied depending on the time zone rules.
 */
export class TimeZone {

	/**
	 * Time zone identifier:
	 *  "localtime" string for local time
	 *  E.g. "-01:30" for a fixed offset from UTC
	 *  E.g. "UTC" or "Europe/Amsterdam" for an Olsen TZ database time
	 */
	private _name: string;

	/**
	 * The kind of time zone specified by _name
	 */
	private _kind: TimeZoneKind;

	/**
	 * Only for fixed offsets: the offset in minutes
	 */
	private _offset: number;

	/**
	 * Timezone-JS object used in calculations.
	 * This is cached in a member to avoid creating one on the fly 
	 * for every calculation.
	 */
	private _tjs: timezoneJS.Date;

	/** 
	 * JavaScript Date object used in calculations.
	 * This is cached in a member to avoid creating one on the fly 
	 * for every calculation.
	 */
	private _date: Date;


	/**
	 * The local time zone for a given date. Note that 
	 * the time zone varies with the date: amsterdam time for 
	 * 2014-01-01 is +01:00 and amsterdam time for 2014-07-01 is +02:00
	 */
	public static local(): TimeZone {
		return TimeZone._findOrCreate("localtime");
	}

	/**
	 * The UTC time zone.
	 */
	public static utc(): TimeZone {
		return TimeZone._findOrCreate("UTC");
	}


	/**
	 * Returns a time zone object from the cache. If it does not exist, it is created.
	 * @return The time zone with the given offset w.r.t. UTC in minutes, e.g. 90 for +01:30
	 */
	public static zone(offset: number): TimeZone;

	/**
	 * Returns a time zone object from the cache. If it does not exist, it is created.
	 * @param s: Empty string for local time, a TZ database time zone name (e.g. Europe/Amsterdam) 
	 *			 or an offset string (either +01:30, +0130, +01, Z). For a full list of names, see:
	 *			 https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
	 */
	public static zone(s: string): TimeZone;

	/**
	 * Zone implementations
	 */
	public static zone(a?: any): TimeZone {
		var name = "";
		switch (typeof (a)) {
			case "string": {
				if ((<string>a).trim().length === 0) {
					return null; // no time zone
				} else {
					name = TimeZone._normalizeString(<string>a);
				}
			} break;
			case "number": {
				var offset: number = <number>a;
				assert(offset > -24 * 60 && offset < 24 * 60, "TimeZone.zone(): offset out of range");
				name = TimeZone.offsetToString(offset);
			} break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				assert(false, "TimeZone.zone(): Unexpected argument type \"" + typeof (a) + "\"");
				/* istanbul ignore next */
				break;
		}
		return TimeZone._findOrCreate(name);
	}

	/**
	 * Do not use this constructor, use the static
	 * TimeZone.zone() method instead.
	 * @param name NORMALIZED name, assumed to be correct
	 */
	constructor(name: string) {
		this._name = name;
		if (name === "localtime") {
			this._kind = TimeZoneKind.Local;
			this._date = new Date();
		} else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
			this._kind = TimeZoneKind.Offset;
			this._offset = TimeZone.stringToOffset(name);
		} else {
			this._kind = TimeZoneKind.Proper;
			this._tjs = new timezoneJS.Date(this._name);
		}
	}

	/**
	 * The time zone identifier. Can be an offset "-01:30" or an
	 * IANA time zone name "Europe/Amsterdam", or "localtime" for 
	 * the local time zone.
	 */
	public name(): string {
		return this._name;
	}

	/**
	 * The kind of time zone (Local/Offset/Proper)
	 */
	public kind(): TimeZoneKind {
		return this._kind;
	}

	/**
	 * Equality operator. Maps zero offsets and different names for UTC onto
	 * each other. Other time zones are not mapped onto each other.
	 */
	public equals(other: TimeZone): boolean {
		if (this.isUtc() && other.isUtc()) {
			return true;
		}
		switch (this._kind) {
			case TimeZoneKind.Local: return (other.kind() === TimeZoneKind.Local);
			case TimeZoneKind.Offset: return (other.kind() === TimeZoneKind.Offset && this._offset === other._offset);
			case TimeZoneKind.Proper: return (other.kind() === TimeZoneKind.Proper && this._name === other._name);
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				assert(false, "Unknown time zone kind.");
				/* istanbul ignore next */
				return false;
		}
	}

	/**
	 * Is this zone equivalent to UTC?
	 */
	public isUtc(): boolean {
		switch (this._kind) {
			case TimeZoneKind.Local: return false;
			case TimeZoneKind.Offset: return (this._offset === 0);
			case TimeZoneKind.Proper: return (
				this._name === "Etc/GMT"
				|| this._name === "Etc/GMT+0"
				|| this._name === "Etc/UCT"
				|| this._name === "Etc/Universal"
				|| this._name === "Etc/UTC"
				|| this._name === "Etc/Zulu"
				|| this._name === "GMT"
				|| this._name === "GMT+0"
				|| this._name === "GMT0"
				|| this._name === "GMT-0"
				|| this._name === "Greenwich"
				|| this._name === "Universal"
				|| this._name === "UTC"
				|| this._name === "Zulu"
				);
			/* istanbul ignore next */
			default: 
				/* istanbul ignore next */
				return false;
		}

	}

	/**
	 * Calculate timezone offset from a UTC time.
	 * @param year local full year
	 * @param month local month 1-12 (note this deviates from JavaScript date)
	 * @param day local day of month 1-31
	 * @param hour local hour 0-23
	 * @param minute local minute 0-59
	 * @param second local second 0-59
	 * @param millisecond local millisecond 0-999
	 * @return the offset of this time zone with respect to UTC at the given time.
	 */
	public offsetForUtc(
		year: number, month: number, day: number,
		hour: number = 0, minute: number = 0, second: number = 0,
		millisecond: number = 0): number {

		assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
		assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
		assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
		assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
		assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  hour out of range.");
		assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
		switch (this._kind) {
			case TimeZoneKind.Local: {
				this._date = new Date(Date.UTC(year, month-1, day, hour, minute, second, millisecond));
				return -1 * this._date.getTimezoneOffset();
			} 
			case TimeZoneKind.Offset: {
				return this._offset;
			} 
			case TimeZoneKind.Proper: {
				if (this.isUtc()) {
					// due to a bug in TimezoneJS a UTC time entered into the 
					// setUTCx methods of a UTC timezoneJS.Date will result in a
					// non-zero offset.
					return 0;
				} else {
					this._tjs.setUTCFullYear(year);
					this._tjs.setUTCMonth(month - 1);
					this._tjs.setUTCDate(day);
					this._tjs.setUTCHours(hour);
					this._tjs.setUTCMinutes(minute);
					this._tjs.setUTCSeconds(second);
					this._tjs.setUTCMilliseconds(millisecond);
					return this._diff(
						this._tjs.getFullYear(), this._tjs.getMonth() + 1, this._tjs.getDate(),
						this._tjs.getHours(), this._tjs.getMinutes(), this._tjs.getSeconds(),
						this._tjs.getMilliseconds(),
						year, month, day, hour, minute, second, millisecond);
				}
			} 
			/* istanbul ignore next */
			default: 
				/* istanbul ignore next */
				assert(false, "Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
				/* istanbul ignore next */
				break;
		}
	}

	/**
	 * Calculate timezone offset from a zone-local time (NOT a UTC time).
	 * @param year local full year
	 * @param month local month 1-12 (note this deviates from JavaScript date)
	 * @param day local day of month 1-31
	 * @param hour local hour 0-23
	 * @param minute local minute 0-59
	 * @param second local second 0-59
	 * @param millisecond local millisecond 0-999
	 * @return the offset of this time zone with respect to UTC at the given time.
	 */
	public offsetForZone(
		year: number, month: number, day: number,
		hour: number = 0, minute: number = 0, second: number = 0,
		millisecond: number = 0): number {

		assert(month > 0 && month < 13, "TimeZone.offsetForZone():  month out of range: " + month);
		assert(day > 0 && day < 32, "TimeZone.offsetForZone():  day out of range.");
		assert(hour >= 0 && hour < 24, "TimeZone.offsetForZone():  hour out of range.");
		assert(minute >= 0 && minute < 60, "TimeZone.offsetForZone():  minute out of range.");
		assert(second >= 0 && second < 60, "TimeZone.offsetForZone():  hour out of range.");
		assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForZone():  millisecond out of range.");
		switch (this._kind) {
			case TimeZoneKind.Local: {
				this._date = new Date(year, month - 1, day, hour, minute, second, millisecond);
				return -1 * this._date.getTimezoneOffset();
			} 
			case TimeZoneKind.Offset: {
				return this._offset;
			} 
			case TimeZoneKind.Proper: {
				this._tjs.setFullYear(year);
				this._tjs.setMonth(month - 1);
				this._tjs.setDate(day);
				this._tjs.setHours(hour);
				this._tjs.setMinutes(minute);
				this._tjs.setSeconds(second);
				this._tjs.setMilliseconds(millisecond);
				return -1 * this._tjs.getTimezoneOffset();
			} 
			/* istanbul ignore next */
			default: 
				/* istanbul ignore next */
				assert(false, "Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
				/* istanbul ignore next */
				break;
		}
	}

	/**
	 * Convenience function, takes values from a Javascript Date
	 * Calls offsetForUtc() with the contents of the date
	 * @param date: the date
	 * @param funcs: the set of functions to use: get() or getUTC()
	 */
	public offsetForUtcDate(date: Date, funcs: DateFunctions): number {
		switch (funcs) {
			case DateFunctions.Get: {
				return this.offsetForUtc(
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate(),
					date.getHours(),
					date.getMinutes(),
					date.getSeconds(),
					date.getMilliseconds());
			} 
			case DateFunctions.GetUTC: {
				return this.offsetForUtc(
					date.getUTCFullYear(),
					date.getUTCMonth() + 1,
					date.getUTCDate(),
					date.getUTCHours(),
					date.getUTCMinutes(),
					date.getUTCSeconds(),
					date.getUTCMilliseconds());
			} 
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				assert(false, "Unknown DateFunctions value");
				/* istanbul ignore next */
				break;
		}
	}

	/**
	 * Convenience function, takes values from a Javascript Date
	 * Calls offsetForUtc() with the contents of the date
	 * @param date: the date
	 * @param funcs: the set of functions to use: get() or getUTC()
	 */
	public offsetForZoneDate(date: Date, funcs: DateFunctions): number {
		switch (funcs) {
			case DateFunctions.Get: {
				return this.offsetForZone(
					date.getFullYear(),
					date.getMonth() + 1,
					date.getDate(),
					date.getHours(),
					date.getMinutes(),
					date.getSeconds(),
					date.getMilliseconds());
			} 
			case DateFunctions.GetUTC: {
				return this.offsetForZone(
					date.getUTCFullYear(),
					date.getUTCMonth() + 1,
					date.getUTCDate(),
					date.getUTCHours(),
					date.getUTCMinutes(),
					date.getUTCSeconds(),
					date.getUTCMilliseconds());
			} 
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				assert(false, "Unknown DateFunctions value");
				/* istanbul ignore next */
				break;
		}
	}

	/**
	 * The time zone identifier (normalized).
	 * Either "localtime", IANA name, or "+hh:mm" offset.
	 */
	public toString(): string {
		return this._name;
	}

	/**
	 * Used by util.inspect()
	 */
	inspect(): string {
		return "[TimeZone: " + this.toString() + "]";
	}

	/**
	 * Convert an offset number into an offset string
	 * @param offset The offset in minutes from UTC e.g. 90 minutes
	 * @return the offset in ISO notation "+01:30" for +90 minutes
	 */
	public static offsetToString(offset: number): string {
		var sign = (offset < 0 ? "-" : "+");
		var hours = Math.floor(Math.abs(offset) / 60);
		var minutes = Math.floor(Math.abs(offset) % 60);
		return sign + padLeft(hours.toString(10), 2, "0") + ":" + padLeft(minutes.toString(10), 2, "0");
	}

	/** 
	 * String to offset conversion. 
	 * @param s	Formats: "-01:00", "-0100", "-01", "Z"
	 * @return offset w.r.t. UTC in minutes
	 */
	public static stringToOffset(s: string): number {
		var t = s.trim();
		// easy case
		if (t === "Z") {
			return 0;
		}
		// check that the remainder conforms to ISO time zone spec
		assert(t.match(/^[+-]\d\d(:?)\d\d$/) || t.match(/^[+-]\d\d$/), "Wrong time zone format: \"" + t + "\"");
		var sign: number = (t.charAt(0) === "+" ? 1 : -1);
		var hours: number = parseInt(t.substr(1, 2), 10);
		var minutes: number = 0;
		if (t.length === 5) {
			minutes = parseInt(t.substr(3, 2), 10);
		} else if (t.length === 6) {
			minutes = parseInt(t.substr(4, 2), 10);
		}
		assert(hours >= 0 && hours < 24, "Offsets from UTC must be less than a day.");
		return sign * (hours * 60 + minutes);
	}


	/**
	 * Time zone cache.
	 */
	private static _cache: { [index: string]: TimeZone } = {};

	/**
	 * Find in cache or create zone
	 * @param name	Time zone name
	 */
	private static _findOrCreate(name: string): TimeZone {
		if (name in TimeZone._cache) {
			return TimeZone._cache[name];
		} else {
			var t = new TimeZone(name);
			TimeZone._cache[name] = t;
			return t;
		}
	}

	/**
	 * Normalize a string so it can be used as a key for a 
	 * cache lookup
	 */
	private static _normalizeString(s: string): string {
		var t: string = s.trim();
		assert(t.length > 0, "Empty time zone string given");
		if (t === "localtime") {
			return t;
		} else if (t === "Z") {
			return "+00:00";
		} else if (t.charAt(0) === "+" || t.charAt(0) === "-" || t === "Z") {
			// offset string
			// normalize by converting back and forth
			return TimeZone.offsetToString(TimeZone.stringToOffset(t));
		} else {
			// Olsen TZ database name
			return t;
		}
	}

	/**
	 * Assuming that the difference in the dates is less than a day, returns
	 * date1 - date2 in fractional minutes.
	 */
	private _diff(
		year1: number, month1: number, day1: number,
		hour1: number, minute1: number, second1: number,
		millisecond1: number,
		year2: number, month2: number, day2: number,
		hour2: number, minute2: number, second2: number,
		millisecond2: number): number {

		var smaller1: boolean =
			(year1 < year2)
			|| (year1 === year2 && month1 < month2)
			|| (year1 === year2 && month1 === month2 && day1 < day2)
			|| (year1 === year2 && month1 === month2 && day1 === day2
			&& hour1 < hour2)
			|| (year1 === year2 && month1 === month2 && day1 === day2
			&& hour1 === hour2 && minute1 < minute2)
			|| (year1 === year2 && month1 === month2 && day1 === day2
			&& hour1 === hour2 && minute1 === minute2 && second1 < second2)
			|| (year1 === year2 && month1 === month2 && day1 === day2
			&& hour1 === hour2 && minute1 === minute2 && second1 === second2
			&& millisecond1 < millisecond2);

		var seconds1: number = hour1 * 3600 + minute1 * 60 + second1 + 0.001 * millisecond1;
		var seconds2: number = hour2 * 3600 + minute2 * 60 + second2 + 0.001 * millisecond2;
		var secondDiff: number = seconds1 - seconds2;
		if (smaller1 && secondDiff > 0) {
			secondDiff -= 24 * 3600;
		} else if (!smaller1 && secondDiff < 0) {
			secondDiff += 24 * 3600;
		}

		return secondDiff / 60;
	}

}

/**
 * For testing purposes, we often need to manipulate what the current
 * time is. This is an interface for a custom time source object
 * so in tests you can use a custom time source.
 */
export interface TimeSource {
	/**
	 * Return the current date+time as a javascript Date object
	 */
	now(): Date;
}

/**
 * Default time source, returns actual time
 */
export class RealTimeSource implements TimeSource {
	now(): Date {
		/* istanbul ignore next */
		return new Date();
	}
}

/** 
 * Indicates how a Date object should be interpreted.
 * Either we can take getYear(), getMonth() etc for our field 
 * values, or we can take getUTCYear() etc to do that.
 */
export enum DateFunctions {
	/**
	 * Use the Date.getFullYear(), Date.getMonth(), ... functions.
	 */
	Get,
	/**
	 * Use the Date.getUTCFullYear(), Date.getUTCMonth(), ... functions.
	 */
	GetUTC
}

/**
 * Day-of-week. Note the enum values correspond to JavaScript day-of-week:
 * Sunday = 0, Monday = 1 etc
 */
export enum WeekDay {
	Sunday,
	Monday,
	Tuesday,
	Wednesday,
	Thursday,
	Friday,
	Saturday
}

/**
 * Our very own DateTime class which is time zone-aware
 * and which can be mocked for testing purposes
 */
export class DateTime {

	/**
	 * Date object that contains the represented date converted to UTC in its
	 * getUTCXxx() fields.
	 */
	private _utcDate: Date;

	/**
	 * Date object that contains the represented date converted to this._zone in its
	 * getUTCXxx() fields. Note that the getXxx() fields are unusable for this purpose
	 */
	private _zoneDate: Date;

	/** 
	 * Original time zone this instance was created for.
	 * Can be NULL for unaware timestamps
	 */
	private _zone: TimeZone;

	/**
	 * Actual time source in use. Setting this property allows to
	 * fake time in tests. DateTime.nowLocal() and DateTime.nowUtc() 
	 * use this property for obtaining the current time.
	 */
	public static timeSource: TimeSource = new RealTimeSource();

	/** 
	 * Current date+time in local time (derived from DateTime.timeSource.now()).
	 */
	public static nowLocal(): DateTime {
		var n = DateTime.timeSource.now();
		return new DateTime(n, DateFunctions.Get, TimeZone.local());
	}

	/** 
	 * Current date+time in UTC time (derived from DateTime.timeSource.now()).
	 */
	public static nowUtc(): DateTime {
		return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc());
	}

	/** 
	 * Current date+time in the given time zone (derived from DateTime.timeSource.now()).
	 * @param timeZone	The desired time zone.
	 */
	public static now(timeZone: TimeZone): DateTime {
		return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc()).toZone(timeZone);
	}

	/**
	 * Constructor. Creates current time in local timezone.
	 */
	constructor();
	/**
	 * Constructor 
	 * @param isoString	String in ISO 8601 format. Instead of ISO time zone, 
	*		 it may include a space and then and IANA time zone.
	 * e.g. "2007-04-05T12:30:40.500"					(no time zone, naive date)
	 * e.g. "2007-04-05T12:30:40.500+01:00"				(UTC offset without daylight saving time)
	 * or   "2007-04-05T12:30:40.500Z"					(UTC)
	 * or   "2007-04-05T12:30:40.500 Europe/Amsterdam"	(IANA time zone, with daylight saving time if applicable)
	 * @param timeZone	if given, the date in the string is assumed to be in this time zone.
	 *					Note that it is NOT CONVERTED to the time zone. Useful
	 *					for strings without a time zone
	 */
	constructor(isoString: string, timeZone?: TimeZone);
	/**
	 * Constructor. You provide a date, then you say whether to take the 
	 * date.getYear()/getXxx methods or the date.getUTCYear()/date.getUTCXxx methods,
	 * and then you state which time zone that date is in.
	 * 
	 * @param date	A date object.
	 * @param getters	Specifies which set of Date getters contains the date in the given time zone: the 
	 *					Date.getXxx() methods or the Date.getUTCXxx() methods.
	 * @param timeZone	The time zone that the given date is assumed to be in (may be null for unaware dates)
	 */
	constructor(date: Date, getFuncs: DateFunctions, timeZone?: TimeZone);
	/** 
	 * Constructor. Note that unlike JavaScript dates we require fields to be in normal ranges.
	 * Use the add(duration) or sub(duration) for arithmetic.
	 * @param year	The full year (e.g. 2014)
	 * @param month	The month [1-12] (note this deviates from JavaScript Date)
	 * @param day	The day of the month [1-31]
	 * @param hour	The hour of the day [0-24) 
	 * @param minute	The minute of the hour [0-59]
	 * @param second	The second of the minute [0-59]
	 * @param millisecond	The millisecond of the second [0-999]
	 * @param timeZone	The time zone, or null (for unaware dates)
	 */
	constructor(
		year: number, month: number, day: number,
		hour?: number, minute?: number, second?: number, millisecond?: number,
		timeZone?: TimeZone);
	/** 
	 * Constructor
	 * @param unixTimestamp	milliseconds since 1970-01-01T00:00:00.000
	 * @param timeZone	the time zone that the timestamp is assumed to be in (usually UTC).
	 */
	constructor(unixTimestamp: number, timeZone?: TimeZone);

	/**
	 * Constructor implementation, do not call 
	 */
	constructor(
		a1?: any, a2?: any, a3?: any,
		h?: number, m?: number, s?: number, ms?: number,
		timeZone?: any) {
		var tempDate: Date;
		var offset: number;

		switch (typeof (a1)) {
			case "number": {
				if (a2 === undefined || a2 === null || a2 instanceof TimeZone) {
					// unix timestamp constructor
					assert(typeof (a1) === "number", "DateTime.DateTime(): expect unixTimestamp to be a number");
					this._zone = (typeof (a2) === "object" && a2 instanceof TimeZone ? <TimeZone>a2 : null);
					this._zoneDate = new Date(<number>a1);
					this._zoneDateToUtcDate();
				} else {
					// year month day constructor
					assert(typeof (a1) === "number", "DateTime.DateTime(): Expect year to be a number.");
					assert(typeof (a2) === "number", "DateTime.DateTime(): Expect month to be a number.");
					assert(typeof (a3) === "number", "DateTime.DateTime(): Expect day to be a number.");
					var year: number = <number>a1;
					var month: number = <number>a2;
					var day: number = <number>a3;
					var hour: number = (typeof (h) === "number" ? h : 0);
					var minute: number = (typeof (m) === "number" ? m : 0);
					var second: number = (typeof (s) === "number" ? s : 0);
					var millisecond: number = (typeof (ms) === "number" ? ms : 0);
					assert(month > 0 && month < 13, "DateTime.DateTime(): month out of range.");
					assert(day > 0 && day < 32, "DateTime.DateTime(): day out of range.");
					assert(hour >= 0 && hour < 24, "DateTime.DateTime(): hour out of range.");
					assert(minute >= 0 && minute < 60, "DateTime.DateTime(): minute out of range.");
					assert(second >= 0 && second < 60, "DateTime.DateTime(): second out of range.");
					assert(millisecond >= 0 && millisecond < 1000, "DateTime.DateTime(): millisecond out of range.");

					this._zone = (typeof (timeZone) === "object" && timeZone instanceof TimeZone ? timeZone : null);

					// Bug in JavaScript: date.getTimezoneOffset() returns wrong value for non-existing local time
					// during DST. Therefore do it ourselves.
					// pretend that the date was in UTC (strings without zone are interpreted by Date as UTC)
					tempDate = new Date(isoString(year, month, day, hour, minute, second, millisecond) + "Z");
					offset = (this._zone ? this._zone.offsetForZone(year, month, day, hour, minute, second, millisecond) : 0);
					this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
					this._utcDateToZoneDate();
				}
			} break;
			case "string": {
				var strings: string[] = DateTime._splitDateFromTimeZone(<string>a1);
				assert(strings.length === 2, "Invalid date string given: \"" + <string>a1 + "\"");
				if (a2 instanceof TimeZone) {
					this._zone = <TimeZone>(a2);
				} else {
					this._zone = TimeZone.zone(strings[1]);
				}
				this._zoneDate = new Date(strings[0] + "Z");
				this._zoneDateToUtcDate();
			} break;
			case "object": {
				assert(a1 instanceof Date, "DateTime.DateTime(): non-Date object passed as first argument");
				assert(typeof (a2) === "number",
					"DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
				assert(!a3 || a3 instanceof TimeZone, "DateTime.DateTime(): timeZone should be a TimeZone object.");
				var d: Date = <Date>(a1);
				var dk: DateFunctions = <DateFunctions>(a2);
				this._zone = (a3 ? a3 : null);
				// set time zone
				// calculate internal time representation
				// go through string conversion because JavaScript has a bug otherwise
				if (dk === DateFunctions.Get) {
					tempDate = new Date(isoString(d.getFullYear(), d.getMonth() + 1, d.getDate(),
						d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) + "Z");
					offset = (this._zone ? this._zone.offsetForZoneDate(tempDate, DateFunctions.GetUTC) : 0);
					this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
					this._utcDateToZoneDate();
				} else {
					tempDate = new Date(isoString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
						d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()) + "Z");
					offset = (this._zone ? this._zone.offsetForZoneDate(tempDate, DateFunctions.GetUTC) : 0);
					this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
					this._utcDateToZoneDate();
				}
			} break;
			case "undefined": {
				// nothing given, make local datetime
				this._utcDate = DateTime.timeSource.now();
				this._zone = TimeZone.local();
				this._utcDateToZoneDate();
			} break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				assert(false, "DateTime.DateTime(): unexpected first argument type.");
				/* istanbul ignore next */
				break;
		}
	}

	/**
	 * @return a copy of this object
	 */
	public clone(): DateTime {
		var result = new DateTime();
		result._utcDate = new Date(this._utcDate.valueOf());
		result._zoneDate = new Date(this._zoneDate.valueOf());
		result._zone = this._zone;
		return result;
	}

	/**
	 * @return The time zone that the date is in. May be null for unaware dates.
	 */
	public zone(): TimeZone {
		return this._zone;
	}

	/**
	 * @return the offset w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
	 */
	public offset(): number {
		return Math.round((this._zoneDate.valueOf() - this._utcDate.valueOf()) / 60000);
	}

	/** 
	 * @return The full year e.g. 2014
	 */
	public year(): number {
		return this._zoneDate.getUTCFullYear();
	}

	/** 
	 * @return The month 1-12 (note this deviates from JavaScript Date)
	 */
	public month(): number {
		return this._zoneDate.getUTCMonth() + 1;
	}

	/** 
	 * @return The day of the month 1-31 
	 */
	public day(): number {
		return this._zoneDate.getUTCDate();
	}

	/** 
	 * @return The hour 0-23
	 */
	public hour(): number {
		return this._zoneDate.getUTCHours();
	}

	/**
	 * @return the minutes 0-59
	 */
	public minute(): number {
		return this._zoneDate.getUTCMinutes();
	}

	/**
	 * @return the seconds 0-59
	 */
	public second(): number {
		return this._zoneDate.getUTCSeconds();
	}

	/**
	 * @return the milliseconds 0-999
	 */
	public millisecond(): number {
		return this._zoneDate.getUTCMilliseconds();
	}
	
	/**
	 * @return the day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 */
	 public weekDay(): WeekDay {
		return <WeekDay>this._zoneDate.getUTCDay();
	 }

	/**
	 * @return Milliseconds since 1970-01-01T00:00:00.000Z
	 */
	public unixUtcMillis(): number {
		return this._utcDate.valueOf();
	}

	/** 
	 * @return The full year e.g. 2014
	 */
	public utcYear(): number {
		return this._utcDate.getUTCFullYear();
	}

	/** 
	 * @return The UTC month 1-12 (note this deviates from JavaScript Date)
	 */
	public utcMonth(): number {
		return this._utcDate.getUTCMonth() + 1;
	}

	/** 
	 * @return The UTC day of the month 1-31 
	 */
	public utcDay(): number {
		return this._utcDate.getUTCDate();
	}

	/** 
	 * @return The UTC hour 0-23
	 */
	public utcHour(): number {
		return this._utcDate.getUTCHours();
	}

	/**
	 * @return The UTC minutes 0-59
	 */
	public utcMinute(): number {
		return this._utcDate.getUTCMinutes();
	}

	/**
	 * @return The UTC seconds 0-59
	 */
	public utcSecond(): number {
		return this._utcDate.getUTCSeconds();
	}

	/**
	 * @return The UTC milliseconds 0-999
	 */
	public utcMillisecond(): number {
		return this._utcDate.getUTCMilliseconds();
	}

	/**
	 * @return the UTC day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 */
	 public utcWeekDay(): WeekDay {
		return <WeekDay>this._utcDate.getUTCDay();
	 }


	/**
	 * Convert this date to the given time zone (in-place).
	 * Throws if this date does not have a time zone.
	 * @return this (for chaining)
	 */
	public convert(zone?: TimeZone): DateTime {
		if (zone) {
			assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
			if (this._zone.equals(zone)) {
				this._zone = zone; // still assign, because zones may be equal but not identical (UTC/GMT/+00)
			} else {
				this._zone = zone;
				this._utcDateToZoneDate();
			}
		} else {
			this._zone = null;
			this._utcDate = new Date(this._zoneDate.valueOf());
		}
		return this;
	}

	/**
	 * Returns this date converted to the given time zone.
	 * Unaware dates can only be converted to unaware dates (clone)
	 * For unaware dates, an exception is thrown
	 * @param zone	The new time zone. This may be null to create unaware date.
	 * @return The converted date
	 */
	public toZone(zone?: TimeZone): DateTime {
		if (zone) {
			assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
			// go from utc date to preserve it in the presence of DST
			var result = this.clone();
			result._zone = zone;
			if (!result._zone.equals(this._zone)) {
				result._utcDateToZoneDate();
			}
			return result;
		} else {
			return new DateTime(this._zoneDate.valueOf(), null);
		}
	}

	/**
	 * Convert to JavaScript date with the zone time in the getX() methods.
	 * Unless the timezone is local, the Date.getUTCX() methods will NOT be correct.
	 */
	public toDate(): Date {
		return new Date(this._zoneDate.valueOf() + this._utcDate.getTimezoneOffset() * 60000);
	}

	/**
	 * Add a time duration. Note that this simply adds a number
	 * of milliseconds to UTC and converts back to zone(), 
	 * so in the presence of e.g. leap seconds there may be a
	 * shift in the seconds field if you add an hour.
	 * There is not DST handling and no leap second handling.
	 * @return this + duration
	 */
	public add(duration: Duration): DateTime;
	/**
	 * Add an amount of time to UTC, taking leap seconds etc into account.
	 * Adding e.g. 1 hour will increment the utcHour() field 
	 * date by one. In case of DST changes, the local hour() field
	 * may not increase or increase by 2 hours. So if you add a month, the 
	 * local time may vary by an hour. There will not be a shift
	 * in seconds due to leap seconds. 
	 */
	public add(amount: number, unit: TimeUnit): DateTime;
	/**
	 * Implementation.
	 */
	public add(a1: any, unit?: TimeUnit): DateTime {
		if (typeof (a1) === "object" && a1 instanceof Duration) {
			var duration: Duration = <Duration>(a1);
			var newTimestamp: number = this._utcDate.valueOf() + duration.milliseconds();
			if (this._zone) {
				newTimestamp += this._zone.offsetForUtcDate(new Date(newTimestamp), DateFunctions.GetUTC) * 60000;
			}
			return new DateTime(newTimestamp, this.zone());
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			var amount: number = <number>(a1);
			var utcDate: Date = new Date(this._utcDate.valueOf());
			utcDate = this._addToDate(utcDate, amount, unit);
			assert(this._utcDate.valueOf() !== utcDate.valueOf() || amount === 0);
			var result = new DateTime(utcDate, DateFunctions.GetUTC, TimeZone.utc()).toZone(this._zone);
			// TODO remove this once bug in V8 engine solved
			if (amount !== 0 && result.equals(this)) {
				// workaround for bug in javascript, at least prevent endless loops due to
				// date not changing
				result = this.add(amount * 2, unit);				
			}
			return result;
		}
	}
	
	/**
	 * Add an amount of time to the zone time, as regularly as possible.
	 * Adding e.g. 1 hour will increment the hour() field of the zone
	 * date by one. In case of DST changes, the utcHour() field may 
	 * increase by 1 or increase by 2. Adding a day will leave the time portion
	 * intact. However, adding an hour around a forward DST change adds two hours,
	 * since there is a zone time (e.g. 2AM in Amsterdam) that does not exist.
	 *
	 * Note adding Months or Years will clamp the date to the end-of-month if 
	 * the start date was at the end of a month, i.e. contrary to JavaScript 
	 * Date#setUTCMonth() it will not overflow into the next month
	 */
	public addLocal(amount: number, unit: TimeUnit): DateTime {
		var zoneDate = new Date(this._zoneDate.valueOf());
		zoneDate = this._addToDate(zoneDate, amount, unit);
		var result = new DateTime(zoneDate, DateFunctions.GetUTC, this.zone());
		// TODO remove this once bug in V8 engine solved
		if (amount !== 0 && result.equals(this)) {
			// workaround for bug in javascript, at least prevent endless loops due to
			// date not changing
			result = this.addLocal(amount * 2, unit);				
		}
		return result;
	}

	private _addToDate(date: Date, amount: number, unit: TimeUnit): Date {
		var targetYear: number;
		var targetMonth: number;
		var targetDate: number;
		var targetHours: number;
		var targetMinutes: number;
		var targetSeconds: number;
		var targetMilliseconds: number;

		switch (unit) {
			case TimeUnit.Second: {
				date.setUTCSeconds(date.getUTCSeconds() + amount);
			} break;
			case TimeUnit.Minute: {
				date.setUTCMinutes(date.getUTCMinutes() + amount);
			} break;
			case TimeUnit.Hour: {
				date.setUTCHours(date.getUTCHours() + amount);
			} break;
			case TimeUnit.Day: {
				date.setUTCDate(date.getUTCDate() + amount);
			} break;
			case TimeUnit.Week: {
				date.setUTCDate(date.getUTCDate() + amount * 7);
			} break;
			case TimeUnit.Month: {
				targetYear = amount >= 0 ? (date.getUTCFullYear() + Math.floor((date.getUTCMonth() + amount) / 12)) 
					: (date.getUTCFullYear() + Math.ceil((date.getUTCMonth() + amount) / 12));
				targetMonth = amount >= 0 ? Math.floor((date.getUTCMonth() + amount) % 12) 
					: Math.ceil((date.getUTCMonth() + amount) % 12);
				targetDate = Math.min(date.getUTCDate(), daysInMonth(targetYear, targetMonth + 1));
				targetHours = date.getUTCHours();
				targetMinutes = date.getUTCMinutes();
				targetSeconds = date.getUTCSeconds();
				targetMilliseconds = date.getUTCMilliseconds();
				// setUTCYears can lead to an overflow in days if the current date is
				// at the end of a month
				date = new Date(Date.UTC(targetYear, targetMonth, targetDate, 
					targetHours, targetMinutes, targetSeconds, targetMilliseconds)); 					
			} break;
			case TimeUnit.Year: {
				targetYear = date.getUTCFullYear() + amount;
				targetMonth = date.getUTCMonth();
				targetDate = Math.min(date.getUTCDate(), daysInMonth(targetYear, targetMonth + 1)); // +1 because we don't count from 0
				targetHours = date.getUTCHours();
				targetMinutes = date.getUTCMinutes();
				targetSeconds = date.getUTCSeconds();
				targetMilliseconds = date.getUTCMilliseconds();
				// setUTCYears can lead to an overflow in days if the current date is
				// at the end of a month
				date = new Date(Date.UTC(targetYear, targetMonth, targetDate, 
					targetHours, targetMinutes, targetSeconds, targetMilliseconds)); 					
			} break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				assert(false, "Unknown period unit.");
				/* istanbul ignore next */
				break;
		}
		return date;
	}
	
	/**
	 * Same as add(-1*duration);
	 */
	public sub(duration: Duration): DateTime;
	/**
	 * Same as add(-1*amount, unit);
	 */
	public sub(amount: number, unit: TimeUnit): DateTime;
	public sub(a1: any, unit?: TimeUnit): DateTime {
		if (typeof (a1) === "object" && a1 instanceof Duration) {
			var duration: Duration = <Duration>(a1);
			var newTimestamp: number = this._utcDate.valueOf() - duration.milliseconds();
			if (this._zone) {
				newTimestamp += this._zone.offsetForUtcDate(new Date(newTimestamp), DateFunctions.GetUTC) * 60000;
			}
			return new DateTime(newTimestamp, this.zone());
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			var amount: number = <number>(a1);
			return this.add(-1 * amount, unit);
		}
	}

	/**
	 * Same as addLocal(-1*amount, unit);
	 */
	public subLocal(amount: number, unit: TimeUnit): DateTime {
		return this.addLocal(-1 * amount, unit);
	}

	/**
	 * Time difference between two DateTimes
	 * @return this - other
	 */
	public diff(other: DateTime): Duration {
		return new Duration(this._utcDate.valueOf() - other._utcDate.valueOf());
	}

	/**
	 * @return True iff (this < other)
	 */
	lessThan(other: DateTime): boolean {
		return this._utcDate.valueOf() < other._utcDate.valueOf();
	}

	/**
	 * @return True iff (this <= other)
	 */
	lessEqual(other: DateTime): boolean {
		return this._utcDate.valueOf() <= other._utcDate.valueOf();
	}

	/**
	 * @return True iff this and other represent the same time in UTC
	 */
	equals(other: DateTime): boolean {
		return this._utcDate.valueOf() === other._utcDate.valueOf();
	}

	/**
	 * @return True iff this and other represent the same time and 
	 * have the same zone
	 */
	identical(other: DateTime): boolean {
		return (this._zoneDate.valueOf() === other._zoneDate.valueOf()
			&& (this._zone === null) === (other._zone === null)
			&& (this._zone === null || this._zone.equals(other._zone))
			);
	}

	/**
	 * @return True iff this > other
	 */
	greaterThan(other: DateTime): boolean {
		return this._utcDate.valueOf() > other._utcDate.valueOf();
	}

	/**
	 * @return True iff this >= other
	 */
	greaterEqual(other: DateTime): boolean {
		return this._utcDate.valueOf() >= other._utcDate.valueOf();
	}

	/**
	 * Proper ISO 8601 format string with any IANA zone converted to ISO offset
	 * E.g. "2014-01-01T23:15:33+01:00" for Europe/Amsterdam
	 */
	public toIsoString(): string {
		var s: string = isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
		if (this._zone) {
			return s + TimeZone.offsetToString(this.offset()); // convert IANA name to offset
		} else {
			return s; // no zone present
		}
	}

	/**
	 * Modified ISO 8601 format string with IANA name if applicable. 
	 * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
	 */
	public toString(): string {
		var s: string = isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
		if (this._zone) {
			if (this._zone.kind() !== TimeZoneKind.Offset) {
				return s + " " + this._zone.toString(); // separate IANA name or "localtime" with a space
			} else {
				return s + this._zone.toString(); // do not separate ISO zone
			}
		} else {
			return s; // no zone present
		}
	}

	/**
	 * Used by util.inspect()
	 */
	inspect(): string {
		return "[DateTime: " + this.toString() + "]";
	}
	
	/**
	 * Modified ISO 8601 format string in UTC without time zone info
	 */
	public toUtcString(): string {
		return isoString(this.utcYear(), this.utcMonth(), this.utcDay(),
			this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond());
	}

	/**
	 * Calculate this._zoneDate from this._utcDate
	 */
	private _utcDateToZoneDate(): void {
		if (this._zone) {
			var offset: number = this._zone.offsetForUtcDate(this._utcDate, DateFunctions.GetUTC);
			this._zoneDate = new Date(this._utcDate.valueOf() + offset * 60000);
		} else {
			this._zoneDate = new Date(this._utcDate.valueOf());
		}
	}

	/**
	 * Calculate this._utcDate from this._zoneDate
	 */
	private _zoneDateToUtcDate(): void {
		if (this._zone) {
			var offset: number = this._zone.offsetForZoneDate(this._zoneDate, DateFunctions.GetUTC);
			this._utcDate = new Date(this._zoneDate.valueOf() - offset * 60000);
		} else {
			this._utcDate = new Date(this._zoneDate.valueOf());
		}
	}

	/**
	 * Split a combined ISO datetime and timezone into datetime and timezone
	 */
	private static _splitDateFromTimeZone(s: string): string[] {
		var result = ["", ""];
		var index = s.lastIndexOf(" ");
		if (index > -1) {
			result[0] = s.substr(0, index);
			result[1] = s.substr(index + 1);
			return result;
		}
		index = s.lastIndexOf("Z");
		if (index > -1) {
			result[0] = s.substr(0, index);
			result[1] = s.substr(index, 1);
			return result;
		}
		index = s.lastIndexOf("+");
		if (index > -1) {
			result[0] = s.substr(0, index);
			result[1] = s.substr(index);
			return result;
		}
		index = s.lastIndexOf("-");
		if (index < 8) {
			index = -1; // any "-" we found was a date separator
		}
		if (index > -1) {
			result[0] = s.substr(0, index);
			result[1] = s.substr(index);
			return result;
		}
		result[0] = s;
		return result;
	}
}

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
		var temp: DateTime;
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
						periods = Math.floor(Math.max(0, diff)  / this._intAmount); // max needed due to -1 above
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
				d.year(), d.month(), Math.min(daysInMonth(d.year(), d.month()), this._start.day()),
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
			&& this._start.zone().isUtc() === false);
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

