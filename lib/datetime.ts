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
import TimeStruct = basics.TimeStruct;
import TimeUnit = basics.TimeUnit;

import duration = require("./duration");
import Duration = duration.Duration;

import javascript = require("./javascript");
import DateFunctions = javascript.DateFunctions;

import math = require("./math");

import timesource = require("./timesource");
import TimeSource = timesource.TimeSource;
import RealTimeSource = timesource.RealTimeSource;

import timezone = require("./timezone");
import NormalizeOption = timezone.NormalizeOption;
import TimeZone = timezone.TimeZone;
import TimeZoneKind = timezone.TimeZoneKind;

import format = require("./format");

/**
 * Current date+time in local time
 */
export function nowLocal(): DateTime {
	return DateTime.nowLocal();
}

/**
 * Current date+time in UTC time
 */
export function nowUtc(): DateTime {
	return DateTime.nowUtc();
}

/**
 * Current date+time in the given time zone
 * @param timeZone	The desired time zone (optional, defaults to UTC).
 */
export function now(timeZone: TimeZone = TimeZone.utc()): DateTime {
	return DateTime.now(timeZone);
}

/**
 * DateTime class which is time zone-aware
 * and which can be mocked for testing purposes.
 */
export class DateTime {

	/**
	 * Date object that contains the represented date converted to UTC in its
	 * getUTCXxx() fields.
	 */
	private _utcDate: TimeStruct;

	/**
	 * Cached value for unixUtcMillis(). This is useful because valueOf() uses it and it is
	 * likely to be called multiple times.
	 */
	private _unixUtcMillisCache: number = null;

	/**
	 * Date object that contains the represented date converted to this._zone in its
	 * getUTCXxx() fields. Note that the getXxx() fields are unusable for this purpose
	 */
	private _zoneDate: TimeStruct;

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
	 * Current date+time in local time
	 */
	public static nowLocal(): DateTime {
		var n = DateTime.timeSource.now();
		return new DateTime(n, DateFunctions.Get, TimeZone.local());
	}

	/**
	 * Current date+time in UTC time
	 */
	public static nowUtc(): DateTime {
		return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc());
	}

	/**
	 * Current date+time in the given time zone
	 * @param timeZone	The desired time zone (optional, defaults to UTC).
	 */
	public static now(timeZone: TimeZone = TimeZone.utc()): DateTime {
		return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc()).toZone(timeZone);
	}

	/**
	 * Create a DateTime from a Lotus 123 / Microsoft Excel date-time value
	 * i.e. a double representing days since 1-1-1900 where 1900 is incorrectly seen as leap year
	 */
	public static fromExcel(n: number, timeZone?: TimeZone): DateTime {
		var unixTimestamp = Math.round((n - 25569) * 24 * 60 * 60 * 1000);
		return new DateTime(unixTimestamp, timeZone);
	}

	/**
	 * Constructor. Creates current time in local timezone.
	 */
	constructor();
	/**
	 * Constructor
	 * Non-existing local times are normalized by rounding up to the next DST offset.
	 *
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
	 * Non-existing local times are normalized by rounding up to the next DST offset.
	 * Note that the Date class has bugs and inconsistencies when constructing them with times around
	 * DST changes.
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
		switch (typeof (a1)) {
			case "number": {
				if (a2 === undefined || a2 === null || a2 instanceof TimeZone) {
					// unix timestamp constructor
					assert(typeof (a1) === "number", "DateTime.DateTime(): expect unixTimestamp to be a number");
					this._zone = (typeof (a2) === "object" && a2 instanceof TimeZone ? <TimeZone>a2 : null);
					var normalizedUnixTimestamp: number;
					if (this._zone) {
						normalizedUnixTimestamp = this._zone.normalizeZoneTime(<number>a1);
					} else {
						normalizedUnixTimestamp = <number>a1;
					}
					this._zoneDate = TimeStruct.fromUnix(normalizedUnixTimestamp);
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
					if (this._zone) {
						var localMillis: number = basics.timeToUnixNoLeapSecs(year, month, day, hour, minute, second, millisecond);
						this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(localMillis));
					} else {
						this._zoneDate = new TimeStruct(year, month, day, hour, minute, second, millisecond);
					}
					this._zoneDateToUtcDate();
				}
			} break;
			case "string": {
				var givenString = (<string>a1).trim();
				var ss: string[] = DateTime._splitDateFromTimeZone(givenString);
				assert(ss.length === 2, "Invalid date string given: \"" + <string>a1 + "\"");
				if (a2 instanceof TimeZone) {
					this._zone = <TimeZone>(a2);
				} else {
					this._zone = TimeZone.zone(ss[1]);
				}
				// use our own ISO parsing because that it platform independent
				// (free of Date quirks)
				this._zoneDate = TimeStruct.fromString(ss[0]);
				if (this._zone) {
					this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._zoneDate.toUnixNoLeapSecs()));
				}
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
				this._zoneDate = TimeStruct.fromDate(d, dk);
				if (this._zone) {
					this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._zoneDate.toUnixNoLeapSecs()));
				}
				this._zoneDateToUtcDate();
			} break;
			case "undefined": {
				// nothing given, make local datetime
				this._zone = TimeZone.local();
				this._utcDate = TimeStruct.fromDate(DateTime.timeSource.now(), DateFunctions.GetUTC);
				this._utcDateToZoneDate();
			} break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("DateTime.DateTime(): unexpected first argument type.");
				}
		}
	}

	/**
	 * @return a copy of this object
	 */
	public clone(): DateTime {
		var result = new DateTime();
		result._utcDate = this._utcDate.clone();
		result._zoneDate = this._zoneDate.clone();
		result._unixUtcMillisCache = this._unixUtcMillisCache;
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
	 * Zone name abbreviation at this time
	 * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
	 * @return The abbreviation
	 */
	public zoneAbbreviation(dstDependent: boolean = true): string {
		if (this.zone()) {
			return this.zone().abbreviationForUtc(
				this.utcYear(), this.utcMonth(), this.utcDay(),
				this.utcHour(), this.utcMinute(), this.utcSecond(), this.utcMillisecond(), dstDependent);
		} else {
			return "";
		}
	}

	/**
	 * @return the offset w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
	 */
	public offset(): number {
		return Math.round((this._zoneDate.toUnixNoLeapSecs() - this._utcDate.toUnixNoLeapSecs()) / 60000);
	}

	/**
	 * @return The full year e.g. 2014
	 */
	public year(): number {
		return this._zoneDate.year;
	}

	/**
	 * @return The month 1-12 (note this deviates from JavaScript Date)
	 */
	public month(): number {
		return this._zoneDate.month;
	}

	/**
	 * @return The day of the month 1-31
	 */
	public day(): number {
		return this._zoneDate.day;
	}

	/**
	 * @return The hour 0-23
	 */
	public hour(): number {
		return this._zoneDate.hour;
	}

	/**
	 * @return the minutes 0-59
	 */
	public minute(): number {
		return this._zoneDate.minute;
	}

	/**
	 * @return the seconds 0-59
	 */
	public second(): number {
		return this._zoneDate.second;
	}

	/**
	 * @return the milliseconds 0-999
	 */
	public millisecond(): number {
		return this._zoneDate.milli;
	}

	/**
	 * @return the day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 */
	public weekDay(): WeekDay {
		return <WeekDay>basics.weekDayNoLeapSecs(this._zoneDate.toUnixNoLeapSecs());
	}

	/**
	 * Returns the day number within the year: Jan 1st has number 0,
	 * Jan 2nd has number 1 etc.
	 *
	 * @return the day-of-year [0-366]
	 */
	public dayOfYear(): number {
		return basics.dayOfYear(this.year(), this.month(), this.day());
	}

	/**
	 * The ISO 8601 week number. Week 1 is the week
	 * that has January 4th in it, and it starts on Monday.
	 * See https://en.wikipedia.org/wiki/ISO_week_date
	 *
	 * @return Week number [1-53]
	 */
	public weekNumber(): number {
		return basics.weekNumber(this.year(), this.month(), this.day());
	}

	/**
	 * The week of this month. There is no official standard for this,
	 * but we assume the same rules for the weekNumber (i.e.
	 * week 1 is the week that has the 4th day of the month in it)
	 *
	 * @return Week number [1-5]
	 */
	public weekOfMonth(): number {
		return basics.weekOfMonth(this.year(), this.month(), this.day());
	}

	/**
	 * Returns the number of seconds that have passed on the current day
	 * Does not consider leap seconds
	 *
	 * @return seconds [0-86399]
	 */
	public secondOfDay(): number {
		return basics.secondOfDay(this.hour(), this.minute(), this.second());
	}

	/**
	 * @return Milliseconds since 1970-01-01T00:00:00.000Z
	 */
	public unixUtcMillis(): number {
		if (this._unixUtcMillisCache === null) {
			this._unixUtcMillisCache = this._utcDate.toUnixNoLeapSecs();
		}
		return this._unixUtcMillisCache;
	}

	/**
	 * @return The full year e.g. 2014
	 */
	public utcYear(): number {
		return this._utcDate.year;
	}

	/**
	 * @return The UTC month 1-12 (note this deviates from JavaScript Date)
	 */
	public utcMonth(): number {
		return this._utcDate.month;
	}

	/**
	 * @return The UTC day of the month 1-31
	 */
	public utcDay(): number {
		return this._utcDate.day;
	}

	/**
	 * @return The UTC hour 0-23
	 */
	public utcHour(): number {
		return this._utcDate.hour;
	}

	/**
	 * @return The UTC minutes 0-59
	 */
	public utcMinute(): number {
		return this._utcDate.minute;
	}

	/**
	 * @return The UTC seconds 0-59
	 */
	public utcSecond(): number {
		return this._utcDate.second;
	}

	/**
	 * Returns the UTC day number within the year: Jan 1st has number 0,
	 * Jan 2nd has number 1 etc.
	 *
	 * @return the day-of-year [0-366]
	 */
	public utcDayOfYear(): number {
		return basics.dayOfYear(this.utcYear(), this.utcMonth(), this.utcDay());
	}

	/**
	 * @return The UTC milliseconds 0-999
	 */
	public utcMillisecond(): number {
		return this._utcDate.milli;
	}

	/**
	 * @return the UTC day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 */
	public utcWeekDay(): WeekDay {
		return <WeekDay>basics.weekDayNoLeapSecs(this._utcDate.toUnixNoLeapSecs());
	}

	/**
	 * The ISO 8601 UTC week number. Week 1 is the week
	 * that has January 4th in it, and it starts on Monday.
	 * See https://en.wikipedia.org/wiki/ISO_week_date
	 *
	 * @return Week number [1-53]
	 */
	public utcWeekNumber(): number {
		return basics.weekNumber(this.utcYear(), this.utcMonth(), this.utcDay());
	}

	/**
	 * The week of this month. There is no official standard for this,
	 * but we assume the same rules for the weekNumber (i.e.
	 * week 1 is the week that has the 4th day of the month in it)
	 *
	 * @return Week number [1-5]
	 */
	public utcWeekOfMonth(): number {
		return basics.weekOfMonth(this.utcYear(), this.utcMonth(), this.utcDay());
	}

	/**
	 * Returns the number of seconds that have passed on the current day
	 * Does not consider leap seconds
	 *
	 * @return seconds [0-86399]
	 */
	public utcSecondOfDay(): number {
		return basics.secondOfDay(this.utcHour(), this.utcMinute(), this.utcSecond());
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
			this._utcDate = this._zoneDate.clone();
			this._unixUtcMillisCache = null;
		}
		return this;
	}

	/**
	 * Returns this date converted to the given time zone.
	 * Unaware dates can only be converted to unaware dates (clone)
	 * Converting an unaware date to an aware date throws an exception. Use the constructor
	 * if you really need to do that.
	 *
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
			return new DateTime(this._zoneDate.toUnixNoLeapSecs(), null);
		}
	}

	/**
	 * Convert to JavaScript date with the zone time in the getX() methods.
	 * Unless the timezone is local, the Date.getUTCX() methods will NOT be correct.
	 * This is because Date calculates getUTCX() from getX() applying local time zone.
	 */
	public toDate(): Date {
		return new Date(this.year(), this.month() - 1, this.day(),
			this.hour(), this.minute(), this.second(), this.millisecond());
	}

	/**
	 * Add a time duration relative to UTC.
	 * @return this + duration
	 */
	public add(duration: Duration): DateTime;
	/**
	 * Add an amount of time relative to UTC, as regularly as possible.
	 *
	 * Adding e.g. 1 hour will increment the utcHour() field, adding 1 month
	 * increments the utcMonth() field.
	 * Adding an amount of units leaves lower units intact. E.g.
	 * adding a month will leave the day() field untouched if possible.
	 *
	 * Note adding Months or Years will clamp the date to the end-of-month if
	 * the start date was at the end of a month, i.e. contrary to JavaScript
	 * Date#setUTCMonth() it will not overflow into the next month
	 *
	 * In case of DST changes, the utc time fields are still untouched but local
	 * time fields may shift.
	 */
	public add(amount: number, unit: TimeUnit): DateTime;
	/**
	 * Implementation.
	 */
	public add(a1: any, unit?: TimeUnit): DateTime {
		var amount: number;
		var u: TimeUnit;
		if (typeof (a1) === "object") {
			var duration: Duration = <Duration>(a1);
			amount = duration.amount();
			u = duration.unit();
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			amount = <number>(a1);
			u = unit;
		}
		var utcTm = this._addToTimeStruct(this._utcDate, amount, u);
		return new DateTime(utcTm.toUnixNoLeapSecs(), TimeZone.utc()).toZone(this._zone);
	}

	/**
	 * Add an amount of time to the zone time, as regularly as possible.
	 *
	 * Adding e.g. 1 hour will increment the hour() field of the zone
	 * date by one. In case of DST changes, the time fields may additionally
	 * increase by the DST offset, if a non-existing local time would
	 * be reached otherwise.
	 *
	 * Adding a unit of time will leave lower-unit fields intact, unless the result
	 * would be a non-existing time. Then an extra DST offset is added.
	 *
	 * Note adding Months or Years will clamp the date to the end-of-month if
	 * the start date was at the end of a month, i.e. contrary to JavaScript
	 * Date#setUTCMonth() it will not overflow into the next month
	 */
	public addLocal(duration: Duration): DateTime;
	public addLocal(amount: number, unit: TimeUnit): DateTime;
	public addLocal(a1: any, unit?: TimeUnit): DateTime {
		var amount: number;
		var u: TimeUnit;
		if (typeof (a1) === "object") {
			var duration: Duration = <Duration>(a1);
			amount = duration.amount();
			u = duration.unit();
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			amount = <number>(a1);
			u = unit;
		}
		var localTm = this._addToTimeStruct(this._zoneDate, amount, u);
		if (this._zone) {
			var direction: NormalizeOption = (amount >= 0 ? NormalizeOption.Up : NormalizeOption.Down);
			var normalized = this._zone.normalizeZoneTime(localTm.toUnixNoLeapSecs(), direction);
			return new DateTime(normalized, this._zone);
		} else {
			return new DateTime(localTm.toUnixNoLeapSecs(), null);
		}
	}

	/**
	 * Add an amount of time to the given time struct. Note: does not normalize.
	 * Keeps lower unit fields the same where possible, clamps day to end-of-month if
	 * necessary.
	 */
	private _addToTimeStruct(tm: TimeStruct, amount: number, unit: TimeUnit): TimeStruct {
		var targetYear: number;
		var targetMonth: number;
		var targetDay: number;
		var targetHours: number;
		var targetMinutes: number;
		var targetSeconds: number;
		var targetMilliseconds: number;

		switch (unit) {
			case TimeUnit.Millisecond: {
				return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount);
			}
			case TimeUnit.Second: {
				return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 1000);
			}
			case TimeUnit.Minute: {
				// todo more intelligent approach needed when implementing leap seconds
				return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 60000);
			}
			case TimeUnit.Hour: {
				// todo more intelligent approach needed when implementing leap seconds
				return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 3600000);
			}
			case TimeUnit.Day: {
				// todo more intelligent approach needed when implementing leap seconds
				return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 86400000);
			}
			case TimeUnit.Week: {
				// todo more intelligent approach needed when implementing leap seconds
				return TimeStruct.fromUnix(tm.toUnixNoLeapSecs() + amount * 7 * 86400000);
			}
			case TimeUnit.Month: {
				// keep the day-of-month the same (clamp to end-of-month)
				if (amount >= 0) {
					targetYear = tm.year + Math.ceil((amount - (12 - tm.month)) / 12);
					targetMonth = 1 + math.positiveModulo((tm.month - 1 + Math.floor(amount)), 12);
				} else {
					targetYear = tm.year + Math.floor((amount + (tm.month - 1)) / 12);
					targetMonth = 1 + math.positiveModulo((tm.month - 1 + Math.ceil(amount)), 12);
				}
				targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
				targetHours = tm.hour;
				targetMinutes = tm.minute;
				targetSeconds = tm.second;
				targetMilliseconds = tm.milli;
				return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
			}
			case TimeUnit.Year: {
				targetYear = tm.year + amount;
				targetMonth = tm.month;
				targetDay = Math.min(tm.day, basics.daysInMonth(targetYear, targetMonth));
				targetHours = tm.hour;
				targetMinutes = tm.minute;
				targetSeconds = tm.second;
				targetMilliseconds = tm.milli;
				return new TimeStruct(targetYear, targetMonth, targetDay, targetHours, targetMinutes, targetSeconds, targetMilliseconds);
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
			return this.add(duration.multiply(-1));
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
	public subLocal(duration: Duration): DateTime;
	public subLocal(amount: number, unit: TimeUnit): DateTime;
	public subLocal(a1: any, unit?: TimeUnit): DateTime {
		if (typeof a1 === "object") {
			return this.addLocal((<Duration>a1).multiply(-1));
		} else {
			return this.addLocal(-1 * <number>a1, unit);
		}
	}

	/**
	 * Time difference between two DateTimes
	 * @return this - other
	 */
	public diff(other: DateTime): Duration {
		return new Duration(this._utcDate.toUnixNoLeapSecs() - other._utcDate.toUnixNoLeapSecs());
	}

	/**
	* Chops off the time part, yields the same date at 00:00:00.000
	* @return a new DateTime
	*/
	public startOfDay(): DateTime {
		return new DateTime(this.year(), this.month(), this.day(), 0, 0, 0, 0, this.zone());
	}

	/**
	 * @return True iff (this < other)
	 */
	public lessThan(other: DateTime): boolean {
		return this._utcDate.toUnixNoLeapSecs() < other._utcDate.toUnixNoLeapSecs();
	}

	/**
	 * @return True iff (this <= other)
	 */
	public lessEqual(other: DateTime): boolean {
		return this._utcDate.toUnixNoLeapSecs() <= other._utcDate.toUnixNoLeapSecs();
	}

	/**
	 * @return True iff this and other represent the same moment in time in UTC
	 */
	public equals(other: DateTime): boolean {
		return this._utcDate.equals(other._utcDate);
	}

	/**
	 * @return True iff this and other represent the same time and the same zone
	 */
	public identical(other: DateTime): boolean {
		return (this._zoneDate.equals(other._zoneDate)
			&& (this._zone === null) === (other._zone === null)
			&& (this._zone === null || this._zone.identical(other._zone))
			);
	}

	/**
	 * @return True iff this > other
	 */
	public greaterThan(other: DateTime): boolean {
		return this._utcDate.toUnixNoLeapSecs() > other._utcDate.toUnixNoLeapSecs();
	}

	/**
	 * @return True iff this >= other
	 */
	public greaterEqual(other: DateTime): boolean {
		return this._utcDate.toUnixNoLeapSecs() >= other._utcDate.toUnixNoLeapSecs();
	}

	/**
	 * @return The minimum of this and other
	 */
	public min(other: DateTime): DateTime {
		if (this.lessThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * @return The maximum of this and other
	 */
	public max(other: DateTime): DateTime {
		if (this.greaterThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * Proper ISO 8601 format string with any IANA zone converted to ISO offset
	 * E.g. "2014-01-01T23:15:33+01:00" for Europe/Amsterdam
	 */
	public toIsoString(): string {
		var s: string = this._zoneDate.toString();
		if (this._zone) {
			return s + TimeZone.offsetToString(this.offset()); // convert IANA name to offset
		} else {
			return s; // no zone present
		}
	}

	/**
	 * Return a string representation of the DateTime according to the
	 * specified format. The format is implemented as the LDML standard
	 * (http://unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns)
	 *
	 * @param formatString The format specification (e.g. "dd/MM/yyyy HH:mm:ss")
	 * @return The string representation of this DateTime
	 */
	public format(formatString: string): string {
		return format.format(this._zoneDate, this._utcDate, this.zone(), formatString);
	}

	/**
	 * Modified ISO 8601 format string with IANA name if applicable.
	 * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
	 */
	public toString(): string {
		var s: string = this._zoneDate.toString();
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
	public inspect(): string {
		return "[DateTime: " + this.toString() + "]";
	}

	/**
	 * The valueOf() method returns the primitive value of the specified object.
	 */
	public valueOf(): any {
		return this.unixUtcMillis();
	}

	/**
	 * Modified ISO 8601 format string in UTC without time zone info
	 */
	public toUtcString(): string {
		return this._utcDate.toString();
	}

	/**
	 * Calculate this._zoneDate from this._utcDate
	 */
	private _utcDateToZoneDate(): void {
		this._unixUtcMillisCache = null;
		/* istanbul ignore else */
		if (this._zone) {
			var offset: number = this._zone.offsetForUtc(this._utcDate.year, this._utcDate.month, this._utcDate.day,
				this._utcDate.hour, this._utcDate.minute, this._utcDate.second, this._utcDate.milli);
			this._zoneDate = TimeStruct.fromUnix(this._zone.normalizeZoneTime(this._utcDate.toUnixNoLeapSecs() + offset * 60000));
		} else {
			this._zoneDate = this._utcDate.clone();
		}
	}

	/**
	 * Calculate this._utcDate from this._zoneDate
	 */
	private _zoneDateToUtcDate(): void {
		this._unixUtcMillisCache = null;
		if (this._zone) {
			var offset: number = this._zone.offsetForZone(this._zoneDate.year, this._zoneDate.month, this._zoneDate.day,
				this._zoneDate.hour, this._zoneDate.minute, this._zoneDate.second, this._zoneDate.milli);
			this._utcDate = TimeStruct.fromUnix(this._zoneDate.toUnixNoLeapSecs() - offset * 60000);
		} else {
			this._utcDate = this._zoneDate.clone();
		}
	}

	/**
	 * Split a combined ISO datetime and timezone into datetime and timezone
	 */
	private static _splitDateFromTimeZone(s: string): string[] {
		var trimmed = s.trim();
		var result = ["", ""];
		var index = trimmed.lastIndexOf(" ");
		if (index > -1) {
			result[0] = trimmed.substr(0, index);
			result[1] = trimmed.substr(index + 1);
			return result;
		}
		index = trimmed.lastIndexOf("Z");
		if (index > -1) {
			result[0] = trimmed.substr(0, index);
			result[1] = trimmed.substr(index, 1);
			return result;
		}
		index = trimmed.lastIndexOf("+");
		if (index > -1) {
			result[0] = trimmed.substr(0, index);
			result[1] = trimmed.substr(index);
			return result;
		}
		index = trimmed.lastIndexOf("-");
		if (index < 8) {
			index = -1; // any "-" we found was a date separator
		}
		if (index > -1) {
			result[0] = trimmed.substr(0, index);
			result[1] = trimmed.substr(index);
			return result;
		}
		result[0] = trimmed;
		return result;
	}
}

