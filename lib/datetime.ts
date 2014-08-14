/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Date+time+timezone representation
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

import basics = require("./basics");
import WeekDay = basics.WeekDay;
import TimeUnit = basics.TimeUnit;

import duration = require("./duration");
import Duration = duration.Duration;

import javascript = require("./javascript");
import DateFunctions = javascript.DateFunctions;

import strings = require("./strings");

import timesource = require("./timesource");
import TimeSource = timesource.TimeSource;
import RealTimeSource = timesource.RealTimeSource;

import timezone = require("./timezone");
import TimeZone = timezone.TimeZone;
import TimeZoneKind = timezone.TimeZoneKind;


/**
 * DateTime class which is time zone-aware
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

					// normalize local time (remove non-existing local time)
					var localMillis: number = basics.timeToUnixNoLeapSecs(year, month, day, hour, minute, second, millisecond);
					if (this._zone) {
						localMillis = this._zone.normalizeZoneTime(localMillis);
					}
					this._zoneDate = new Date(localMillis);
					this._zoneDateToUtcDate();
				}
			} break;
			case "string": {
				var ss: string[] = DateTime._splitDateFromTimeZone(<string>a1);
				assert(ss.length === 2, "Invalid date string given: \"" + <string>a1 + "\"");
				if (a2 instanceof TimeZone) {
					this._zone = <TimeZone>(a2);
				} else {
					this._zone = TimeZone.zone(ss[1]);
				}
				this._zoneDate = new Date(ss[0] + "Z");
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
					tempDate = new Date(strings.isoString(d.getFullYear(), d.getMonth() + 1, d.getDate(),
						d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) + "Z");
					offset = (this._zone ? this._zone.offsetForZoneDate(tempDate, DateFunctions.GetUTC) : 0);
					this._utcDate = new Date(tempDate.valueOf() - offset * 60000);
					this._utcDateToZoneDate();
				} else {
					tempDate = new Date(strings.isoString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
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
				targetDate = Math.min(date.getUTCDate(), basics.daysInMonth(targetYear, targetMonth + 1));
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
				targetDate = Math.min(date.getUTCDate(), basics.daysInMonth(targetYear, targetMonth + 1)); // +1 because we don't count from 0
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
		var s: string = strings.isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
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
		var s: string = strings.isoString(this.year(), this.month(), this.day(), this.hour(), this.minute(), this.second(), this.millisecond());
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
		return strings.isoString(this.utcYear(), this.utcMonth(), this.utcDay(),
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

