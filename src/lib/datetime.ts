/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Date+time+timezone representation
 */

"use strict";

import assert from "./assert";
import { WeekDay, TimeStruct, TimeUnit } from "./basics";
import * as basics from "./basics";
import { Duration } from "./duration";
import { DateFunctions } from "./javascript";
import * as math from "./math";
import { TimeSource, RealTimeSource } from "./timesource";
import { TimeZone, TimeZoneKind } from "./timezone";
import { NormalizeOption } from "./tz-database";
import * as format from "./format";
import * as parseFuncs from "./parse";

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
export function now(timeZone: TimeZone | undefined | null = TimeZone.utc()): DateTime {
	return DateTime.now(timeZone);
}

function convertToUtc(localTime: TimeStruct, fromZone?: TimeZone): TimeStruct {
	if (fromZone) {
		const offset: number = fromZone.offsetForZone(localTime);
		return new TimeStruct(localTime.unixMillis - offset * 60000);
	} else {
		return localTime.clone();
	}
}

function convertFromUtc(utcTime: TimeStruct, toZone?: TimeZone): TimeStruct {
	if (toZone) {
		const offset: number = toZone.offsetForUtc(utcTime);
		return toZone.normalizeZoneTime(new TimeStruct(utcTime.unixMillis + offset * 60000));
	} else {
		return utcTime.clone();
	}
}

/**
 * DateTime class which is time zone-aware
 * and which can be mocked for testing purposes.
 */
export class DateTime {

	/**
	 * UTC timestamp (lazily calculated)
	 */
	private _utcDate?: TimeStruct;
	private get utcDate(): TimeStruct {
		if (!this._utcDate) {
			this._utcDate = convertToUtc(this._zoneDate as TimeStruct, this._zone);
		}
		return this._utcDate;
	}
	private set utcDate(value: TimeStruct) {
		this._utcDate = value;
		this._zoneDate = undefined;
	}

	/**
	 * Local timestamp (lazily calculated)
	 */
	private _zoneDate?: TimeStruct;
	private get zoneDate(): TimeStruct {
		if (!this._zoneDate) {
			this._zoneDate = convertFromUtc(this._utcDate as TimeStruct, this._zone);
		}
		return this._zoneDate;
	}
	private set zoneDate(value: TimeStruct) {
		this._zoneDate = value;
		this._utcDate = undefined;
	}

	/**
	 * Original time zone this instance was created for.
	 * Can be undefined for unaware timestamps
	 */
	private _zone?: TimeZone;

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
		const n = DateTime.timeSource.now();
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
	public static now(timeZone: TimeZone | null | undefined = TimeZone.utc()): DateTime {
		return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc()).toZone(timeZone);
	}

	/**
	 * Create a DateTime from a Lotus 123 / Microsoft Excel date-time value
	 * i.e. a double representing days since 1-1-1900 where 1900 is incorrectly seen as leap year
	 * Does not work for dates < 1900
	 * @param n excel date/time number
	 * @param timeZone Time zone to assume that the excel value is in
	 * @returns a DateTime
	 */
	public static fromExcel(n: number, timeZone?: TimeZone | null | undefined): DateTime {
		assert(typeof n === "number", "fromExcel(): first parameter must be a number");
		assert(!isNaN(n), "fromExcel(): first parameter must not be NaN");
		assert(isFinite(n), "fromExcel(): first parameter must not be NaN");
		const unixTimestamp = Math.round((n - 25569) * 24 * 60 * 60 * 1000);
		return new DateTime(unixTimestamp, timeZone);
	}

	/**
	 * Check whether a given date exists in the given time zone.
	 * E.g. 2015-02-29 returns false (not a leap year)
	 * and 2015-03-29T02:30:00 returns false (daylight saving time missing hour)
	 * and 2015-04-31 returns false (April has 30 days).
	 * By default, pre-1970 dates also return false since the time zone database does not contain accurate info
	 * before that. You can change that with the allowPre1970 flag.
	 *
	 * @param allowPre1970 (optional, default false): return true for pre-1970 dates
	 */
	public static exists(
		year: number, month: number = 1, day: number = 1,
		hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0,
		zone: TimeZone | null | undefined = undefined, allowPre1970: boolean = false
	): boolean {
		if (!isFinite(year) || !isFinite(month) || !isFinite(day)
			|| !isFinite(hour) || !isFinite(minute) || !isFinite(second) || !isFinite(millisecond)) {
			return false;
		}
		if (!allowPre1970 && year < 1970) {
			return false;
		}
		try {
			const dt = new DateTime(year, month, day, hour, minute, second, millisecond, zone);
			return (year === dt.year() && month === dt.month() && day === dt.day()
				&& hour === dt.hour() && minute === dt.minute() && second === dt.second() && millisecond === dt.millisecond());
		} catch (e) {
			return false;
		}
	}

	/**
	 * Constructor. Creates current time in local timezone.
	 */
	constructor();
	/**
	 * Constructor. Parses ISO timestamp string.
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
	constructor(isoString: string, timeZone?: TimeZone | null | undefined);
	/**
	 * Constructor. Parses string in given LDML format.
	 * NOTE: does not handle eras/quarters/weeks/weekdays.
	 * Non-existing local times are normalized by rounding up to the next DST offset.
	 *
	 * @param dateString	Date+Time string.
	 * @param format The LDML format that the string is assumed to be in
	 * @param timeZone	if given, the date in the string is assumed to be in this time zone.
	 *					Note that it is NOT CONVERTED to the time zone. Useful
	 *					for strings without a time zone
	 */
	constructor(dateString: string, format: string, timeZone?: TimeZone | null | undefined);
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
	 * @param timeZone	The time zone that the given date is assumed to be in (may be undefined or null for unaware dates)
	 */
	constructor(date: Date, getFuncs: DateFunctions, timeZone?: TimeZone | null | undefined);
	/**
	 * Get a date from a TimeStruct
	 */
	constructor(tm: TimeStruct, timeZone?: TimeZone | null | undefined);
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
	 * @param timeZone	The time zone, or null/undefined (for unaware dates)
	 */
	constructor(
		year: number, month: number, day: number,
		hour?: number, minute?: number, second?: number, millisecond?: number,
		timeZone?: TimeZone | null | undefined
	);
	/**
	 * Constructor
	 * @param unixTimestamp	milliseconds since 1970-01-01T00:00:00.000
	 * @param timeZone	the time zone that the timestamp is assumed to be in (usually UTC).
	 */
	constructor(unixTimestamp: number, timeZone?: TimeZone | null | undefined);

	/**
	 * Constructor implementation, do not call
	 */
	constructor(
		a1?: any, a2?: any, a3?: any,
		h?: number, m?: number, s?: number, ms?: number,
		timeZone?: TimeZone | null
	) {
		switch (typeof (a1)) {
			case "number": {
				if (a2 === undefined || a2 === null || a2 instanceof TimeZone) {
					assert(
						a3 === undefined && h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined,
						"for unix timestamp datetime constructor, third through 8th argument must be undefined"
					);
					assert(a2 === undefined || a2 === null  || a2 instanceof TimeZone, "DateTime.DateTime(): second arg should be a TimeZone object.");
					// unix timestamp constructor
					this._zone = (typeof (a2) === "object" && a2 instanceof TimeZone ? <TimeZone>a2 : undefined);
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(new TimeStruct(math.roundSym(<number>a1)));
					} else {
						this._zoneDate = new TimeStruct(math.roundSym(<number>a1));
					}
				} else {
					// year month day constructor
					assert(typeof (a2) === "number", "DateTime.DateTime(): Expect month to be a number.");
					assert(typeof (a3) === "number", "DateTime.DateTime(): Expect day to be a number.");
					assert(timeZone === undefined || timeZone === null  || timeZone instanceof TimeZone,
						"DateTime.DateTime(): eighth arg should be a TimeZone object."
					);
					let year: number = <number>a1;
					let month: number = <number>a2;
					let day: number = <number>a3;
					let hour: number = (typeof (h) === "number" ? h : 0);
					let minute: number = (typeof (m) === "number" ? m : 0);
					let second: number = (typeof (s) === "number" ? s : 0);
					let milli: number = (typeof (ms) === "number" ? ms : 0);
					year = math.roundSym(year);
					month = math.roundSym(month);
					day = math.roundSym(day);
					hour = math.roundSym(hour);
					minute = math.roundSym(minute);
					second = math.roundSym(second);
					milli = math.roundSym(milli);
					const tm = new TimeStruct({ year, month, day, hour, minute, second, milli });
					assert(tm.validate(), `invalid date: ${tm.toString()}`);

					this._zone = (typeof (timeZone) === "object" && timeZone instanceof TimeZone ? timeZone : undefined);

					// normalize local time (remove non-existing local time)
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(tm);
					} else {
						this._zoneDate = tm;
					}
				}
			} break;
			case "string": {
				if (typeof a2 === "string") {
					assert(
						h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined,
						"first two arguments are a string, therefore the fourth through 8th argument must be undefined"
					);
					assert(a3 === undefined || a3 === null  || a3 instanceof TimeZone, "DateTime.DateTime(): third arg should be a TimeZone object.");
					// format string given
					const dateString: string = <string>a1;
					const formatString: string = <string>a2;
					let zone: TimeZone | undefined;
					if (typeof a3 === "object" && a3 instanceof TimeZone) {
						zone = <TimeZone>(a3);
					}
					const parsed = parseFuncs.parse(dateString, formatString, zone);
					this._zoneDate = parsed.time;
					this._zone = parsed.zone;
				} else {
					assert(
						a3 === undefined && h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined,
						"first arguments is a string and the second is not, therefore the third through 8th argument must be undefined"
					);
					assert(a2 === undefined || a2 === null  || a2 instanceof TimeZone, "DateTime.DateTime(): second arg should be a TimeZone object.");
					const givenString = (<string>a1).trim();
					const ss: string[] = DateTime._splitDateFromTimeZone(givenString);
					assert(ss.length === 2, "Invalid date string given: \"" + <string>a1 + "\"");
					if (a2 instanceof TimeZone) {
						this._zone = <TimeZone>(a2);
					} else {
						this._zone = (ss[1].trim() ? TimeZone.zone(ss[1]) : undefined);
					}
					// use our own ISO parsing because that it platform independent
					// (free of Date quirks)
					this._zoneDate = TimeStruct.fromString(ss[0]);
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
					}
				}
			} break;
			case "object": {
				if (a1 instanceof TimeStruct) {
					assert(
						a3 === undefined && h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined,
						"first argument is a TimeStruct, therefore the third through 8th argument must be undefined"
					);
					assert(a2 === undefined || a2 === null || a2 instanceof TimeZone, "expect a TimeZone as second argument");
					this._zoneDate = a1.clone();
					this._zone = (a2 ? a2 : undefined);
				} else if (a1 instanceof Date) {
					assert(
						h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined,
						"first argument is a Date, therefore the fourth through 8th argument must be undefined"
					);
					assert(typeof (a2) === "number" && (a2 === DateFunctions.Get || a2 === DateFunctions.GetUTC),
						"DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument");
					assert(a3 === undefined || a3 === null  || a3 instanceof TimeZone, "DateTime.DateTime(): third arg should be a TimeZone object.");
					const d: Date = <Date>(a1);
					const dk: DateFunctions = <DateFunctions>(a2);
					this._zone = (a3 ? a3 : undefined);
					this._zoneDate = TimeStruct.fromDate(d, dk);
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
					}
				} else {
					assert(false, `DateTime constructor expected a Date or a TimeStruct but got a ${a1}`);
				}
			} break;
			case "undefined": {
				assert(
					a2 === undefined && a3 === undefined && h === undefined && m === undefined
					&& s === undefined && ms === undefined && timeZone === undefined,
					"first argument is undefined, therefore the rest must also be undefined"
				);
				// nothing given, make local datetime
				this._zone = TimeZone.local();
				this._utcDate = TimeStruct.fromDate(DateTime.timeSource.now(), DateFunctions.GetUTC);
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
		return new DateTime(this.zoneDate, this._zone);
	}

	/**
	 * @return The time zone that the date is in. May be undefined for unaware dates.
	 */
	public zone(): TimeZone | undefined {
		return this._zone;
	}

	/**
	 * Zone name abbreviation at this time
	 * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
	 * @return The abbreviation
	 */
	public zoneAbbreviation(dstDependent: boolean = true): string {
		if (this._zone) {
			return this._zone.abbreviationForUtc(this.utcDate, dstDependent);
		} else {
			return "";
		}
	}

	/**
	 * @return the offset including DST w.r.t. UTC in minutes. Returns 0 for unaware dates and for UTC dates.
	 */
	public offset(): number {
		return Math.round((this.zoneDate.unixMillis - this.utcDate.unixMillis) / 60000);
	}

	/**
	 * @return the offset including DST w.r.t. UTC as a Duration.
	 */
	public offsetDuration(): Duration {
		return Duration.milliseconds(Math.round(this.zoneDate.unixMillis - this.utcDate.unixMillis));
	}

	/**
	 * @return the standard offset WITHOUT DST w.r.t. UTC as a Duration.
	 */
	public standardOffsetDuration(): Duration {
		if (this._zone) {
			return Duration.minutes(this._zone.standardOffsetForUtc(this.utcDate));
		}
		return Duration.minutes(0);
	}

	/**
	 * @return The full year e.g. 2014
	 */
	public year(): number {
		return this.zoneDate.components.year;
	}

	/**
	 * @return The month 1-12 (note this deviates from JavaScript Date)
	 */
	public month(): number {
		return this.zoneDate.components.month;
	}

	/**
	 * @return The day of the month 1-31
	 */
	public day(): number {
		return this.zoneDate.components.day;
	}

	/**
	 * @return The hour 0-23
	 */
	public hour(): number {
		return this.zoneDate.components.hour;
	}

	/**
	 * @return the minutes 0-59
	 */
	public minute(): number {
		return this.zoneDate.components.minute;
	}

	/**
	 * @return the seconds 0-59
	 */
	public second(): number {
		return this.zoneDate.components.second;
	}

	/**
	 * @return the milliseconds 0-999
	 */
	public millisecond(): number {
		return this.zoneDate.components.milli;
	}

	/**
	 * @return the day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 */
	public weekDay(): WeekDay {
		return <WeekDay>basics.weekDayNoLeapSecs(this.zoneDate.unixMillis);
	}

	/**
	 * Returns the day number within the year: Jan 1st has number 0,
	 * Jan 2nd has number 1 etc.
	 *
	 * @return the day-of-year [0-366]
	 */
	public dayOfYear(): number {
		return this.zoneDate.yearDay();
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
		return this.utcDate.unixMillis;
	}

	/**
	 * @return The full year e.g. 2014
	 */
	public utcYear(): number {
		return this.utcDate.components.year;
	}

	/**
	 * @return The UTC month 1-12 (note this deviates from JavaScript Date)
	 */
	public utcMonth(): number {
		return this.utcDate.components.month;
	}

	/**
	 * @return The UTC day of the month 1-31
	 */
	public utcDay(): number {
		return this.utcDate.components.day;
	}

	/**
	 * @return The UTC hour 0-23
	 */
	public utcHour(): number {
		return this.utcDate.components.hour;
	}

	/**
	 * @return The UTC minutes 0-59
	 */
	public utcMinute(): number {
		return this.utcDate.components.minute;
	}

	/**
	 * @return The UTC seconds 0-59
	 */
	public utcSecond(): number {
		return this.utcDate.components.second;
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
		return this.utcDate.components.milli;
	}

	/**
	 * @return the UTC day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 */
	public utcWeekDay(): WeekDay {
		return <WeekDay>basics.weekDayNoLeapSecs(this.utcDate.unixMillis);
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
	 * Returns a new DateTime which is the date+time reinterpreted as
	 * in the new zone. So e.g. 08:00 America/Chicago can be set to 08:00 Europe/Brussels.
	 * No conversion is done, the value is just assumed to be in a different zone.
	 * Works for naive and aware dates. The new zone may be null.
	 *
	 * @param zone The new time zone
	 * @return A new DateTime with the original timestamp and the new zone.
	 */
	public withZone(zone?: TimeZone | null | undefined): DateTime {
		return new DateTime(
			this.year(), this.month(), this.day(),
			this.hour(), this.minute(), this.second(), this.millisecond(),
			zone
		);
	}

	/**
	 * Convert this date to the given time zone (in-place).
	 * Throws if this date does not have a time zone.
	 * @return this (for chaining)
	 */
	public convert(zone?: TimeZone | null | undefined): DateTime {
		if (zone) {
			if (!this._zone) { // if-statement satisfies the compiler
				assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
			} else if (this._zone.equals(zone)) {
				this._zone = zone; // still assign, because zones may be equal but not identical (UTC/GMT/+00)
			} else {
				if (!this._utcDate) {
					this._utcDate = convertToUtc(this._zoneDate as TimeStruct, this._zone); // cause zone -> utc conversion
				}
				this._zone = zone;
				this._zoneDate = undefined;
			}
		} else {
			if (!this._zone) {
				return this;
			}
			if (!this._zoneDate) {
				this._zoneDate = convertFromUtc(this._utcDate as TimeStruct, this._zone);
			}
			this._zone = undefined;
			this._utcDate = undefined; // cause later zone -> utc conversion
		}
		return this;
	}

	/**
	 * Returns this date converted to the given time zone.
	 * Unaware dates can only be converted to unaware dates (clone)
	 * Converting an unaware date to an aware date throws an exception. Use the constructor
	 * if you really need to do that.
	 *
	 * @param zone	The new time zone. This may be null or undefined to create unaware date.
	 * @return The converted date
	 */
	public toZone(zone?: TimeZone | null | undefined): DateTime {
		if (zone) {
			assert(this._zone, "DateTime.toZone(): Cannot convert unaware date to an aware date");
			const result = new DateTime();
			result.utcDate = this.utcDate;
			result._zone = zone;
			return result;
		} else {
			return new DateTime(this.zoneDate, undefined);
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
	 * Create an Excel timestamp for this datetime converted to the given zone.
	 * Does not work for dates < 1900
	 * @param timeZone Optional. Zone to convert to, default the zone the datetime is already in.
	 * @return an Excel date/time number i.e. days since 1-1-1900 where 1900 is incorrectly seen as leap year
	 */
	public toExcel(timeZone?: TimeZone | null | undefined): number {
		let dt: DateTime = this;
		if (timeZone && (!this._zone || !timeZone.equals(this._zone))) {
			dt = this.toZone(timeZone);
		}
		const offsetMillis = dt.offset() * 60 * 1000;
		const unixTimestamp = dt.unixUtcMillis();
		return this._unixTimeStampToExcel(unixTimestamp + offsetMillis);
	}

	/**
	 * Create an Excel timestamp for this datetime converted to UTC
	 * Does not work for dates < 1900
	 * @return an Excel date/time number i.e. days since 1-1-1900 where 1900 is incorrectly seen as leap year
	 */
	public toUtcExcel(): number {
		const unixTimestamp = this.unixUtcMillis();
		return this._unixTimeStampToExcel(unixTimestamp);
	}

	private _unixTimeStampToExcel(n: number): number {
		const result = ((n) / (24 * 60 * 60 * 1000)) + 25569;
		// round to nearest millisecond
		const msecs = result / (1 / 86400000);
		return Math.round(msecs) * (1 / 86400000);
	}


	/**
	 * Add a time duration relative to UTC. Returns a new DateTime
	 * @return this + duration
	 */
	public add(duration: Duration): DateTime;
	/**
	 * Add an amount of time relative to UTC, as regularly as possible. Returns a new DateTime
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
		let amount: number;
		let u: TimeUnit;
		if (typeof (a1) === "object") {
			const duration: Duration = <Duration>(a1);
			amount = duration.amount();
			u = duration.unit();
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			amount = <number>(a1);
			u = unit as TimeUnit;
		}
		const utcTm = this._addToTimeStruct(this.utcDate, amount, u);
		return new DateTime(utcTm, TimeZone.utc()).toZone(this._zone);
	}

	/**
	 * Add an amount of time to the zone time, as regularly as possible. Returns a new DateTime
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
		let amount: number;
		let u: TimeUnit;
		if (typeof (a1) === "object") {
			const duration: Duration = <Duration>(a1);
			amount = duration.amount();
			u = duration.unit();
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			amount = <number>(a1);
			u = unit as TimeUnit;
		}
		const localTm = this._addToTimeStruct(this.zoneDate, amount, u);
		if (this._zone) {
			const direction: NormalizeOption = (amount >= 0 ? NormalizeOption.Up : NormalizeOption.Down);
			const normalized = this._zone.normalizeZoneTime(localTm, direction);
			return new DateTime(normalized, this._zone);
		} else {
			return new DateTime(localTm, undefined);
		}
	}

	/**
	 * Add an amount of time to the given time struct. Note: does not normalize.
	 * Keeps lower unit fields the same where possible, clamps day to end-of-month if
	 * necessary.
	 */
	private _addToTimeStruct(tm: TimeStruct, amount: number, unit: TimeUnit): TimeStruct {
		let year: number;
		let month: number;
		let day: number;
		let hour: number;
		let minute: number;
		let second: number;
		let milli: number;

		switch (unit) {
			case TimeUnit.Millisecond:
				return new TimeStruct(math.roundSym(tm.unixMillis + amount));
			case TimeUnit.Second:
				return new TimeStruct(math.roundSym(tm.unixMillis + amount * 1000));
			case TimeUnit.Minute:
				// todo more intelligent approach needed when implementing leap seconds
				return new TimeStruct(math.roundSym(tm.unixMillis + amount * 60000));
			case TimeUnit.Hour:
				// todo more intelligent approach needed when implementing leap seconds
				return new TimeStruct(math.roundSym(tm.unixMillis + amount * 3600000));
			case TimeUnit.Day:
				// todo more intelligent approach needed when implementing leap seconds
				return new TimeStruct(math.roundSym(tm.unixMillis + amount * 86400000));
			case TimeUnit.Week:
				// todo more intelligent approach needed when implementing leap seconds
				return new TimeStruct(math.roundSym(tm.unixMillis + amount * 7 * 86400000));
			case TimeUnit.Month: {
				assert(math.isInt(amount), "Cannot add/sub a non-integer amount of months");
				// keep the day-of-month the same (clamp to end-of-month)
				if (amount >= 0) {
					year = tm.components.year + Math.ceil((amount - (12 - tm.components.month)) / 12);
					month = 1 + math.positiveModulo((tm.components.month - 1 + Math.floor(amount)), 12);
				} else {
					year = tm.components.year + Math.floor((amount + (tm.components.month - 1)) / 12);
					month = 1 + math.positiveModulo((tm.components.month - 1 + Math.ceil(amount)), 12);
				}
				day = Math.min(tm.components.day, basics.daysInMonth(year, month));
				hour = tm.components.hour;
				minute = tm.components.minute;
				second = tm.components.second;
				milli = tm.components.milli;
				return new TimeStruct({ year, month, day, hour, minute, second, milli });
			}
			case TimeUnit.Year: {
				assert(math.isInt(amount), "Cannot add/sub a non-integer amount of years");
				year = tm.components.year + amount;
				month = tm.components.month;
				day = Math.min(tm.components.day, basics.daysInMonth(year, month));
				hour = tm.components.hour;
				minute = tm.components.minute;
				second = tm.components.second;
				milli = tm.components.milli;
				return new TimeStruct({ year, month, day, hour, minute, second, milli });
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
	 * Same as add(-1*duration); Returns a new DateTime
	 */
	public sub(duration: Duration): DateTime;
	/**
	 * Same as add(-1*amount, unit); Returns a new DateTime
	 */
	public sub(amount: number, unit: TimeUnit): DateTime;
	public sub(a1: any, unit?: TimeUnit): DateTime {
		if (typeof (a1) === "object" && a1 instanceof Duration) {
			const duration: Duration = <Duration>(a1);
			return this.add(duration.multiply(-1));
		} else {
			assert(typeof (a1) === "number", "expect number as first argument");
			assert(typeof (unit) === "number", "expect number as second argument");
			const amount: number = <number>(a1);
			return this.add(-1 * amount, unit as TimeUnit);
		}
	}

	/**
	 * Same as addLocal(-1*amount, unit); Returns a new DateTime
	 */
	public subLocal(duration: Duration): DateTime;
	public subLocal(amount: number, unit: TimeUnit): DateTime;
	public subLocal(a1: any, unit?: TimeUnit): DateTime {
		if (typeof a1 === "object") {
			return this.addLocal((<Duration>a1).multiply(-1));
		} else {
			return this.addLocal(-1 * <number>a1, unit as TimeUnit);
		}
	}

	/**
	 * Time difference between two DateTimes
	 * @return this - other
	 */
	public diff(other: DateTime): Duration {
		return new Duration(this.utcDate.unixMillis - other.utcDate.unixMillis);
	}

	/**
	* Chops off the time part, yields the same date at 00:00:00.000
	* @return a new DateTime
	*/
	public startOfDay(): DateTime {
		return new DateTime(this.year(), this.month(), this.day(), 0, 0, 0, 0, this.zone());
	}

	/**
	 * Returns the first day of the month at 00:00:00
	 * @return a new DateTime
	 */
	public startOfMonth(): DateTime {
		return new DateTime(this.year(), this.month(), 1, 0, 0, 0, 0, this.zone());
	}

	/**
	 * Returns the first day of the year at 00:00:00
	 * @return a new DateTime
	 */
	public startOfYear(): DateTime {
		return new DateTime(this.year(), 1, 1, 0, 0, 0, 0, this.zone());
	}

	/**
	 * @return True iff (this < other)
	 */
	public lessThan(other: DateTime): boolean {
		return this.utcDate.unixMillis < other.utcDate.unixMillis;
	}

	/**
	 * @return True iff (this <= other)
	 */
	public lessEqual(other: DateTime): boolean {
		return this.utcDate.unixMillis <= other.utcDate.unixMillis;
	}

	/**
	 * @return True iff this and other represent the same moment in time in UTC
	 */
	public equals(other: DateTime): boolean {
		return this.utcDate.equals(other.utcDate);
	}

	/**
	 * @return True iff this and other represent the same time and the same zone
	 */
	public identical(other: DateTime): boolean {
		return !!(this.zoneDate.equals(other.zoneDate)
			&& (!this._zone) === (!other._zone)
			&& ((!this._zone && !other._zone) || (this._zone && other._zone && this._zone.identical(other._zone)))
			);
	}

	/**
	 * @return True iff this > other
	 */
	public greaterThan(other: DateTime): boolean {
		return this.utcDate.unixMillis > other.utcDate.unixMillis;
	}

	/**
	 * @return True iff this >= other
	 */
	public greaterEqual(other: DateTime): boolean {
		return this.utcDate.unixMillis >= other.utcDate.unixMillis;
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
		const s: string = this.zoneDate.toString();
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
	 * @param formatOptions Optional, non-english format month names etc.
	 * @return The string representation of this DateTime
	 */
	public format(formatString: string, formatOptions?: format.PartialFormatOptions): string {
		return format.format(this.zoneDate, this.utcDate, this._zone, formatString, formatOptions);
	}

	/**
	 * Parse a date in a given format
	 * @param s the string to parse
	 * @param format the format the string is in
	 * @param zone Optional, the zone to add (if no zone is given in the string)
	 */
	public static parse(s: string, format: string, zone?: TimeZone): DateTime {
		const parsed = parseFuncs.parse(s, format, zone);
		return new DateTime(parsed.time, parsed.zone);
	}

	/**
	 * Modified ISO 8601 format string with IANA name if applicable.
	 * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
	 */
	public toString(): string {
		const s: string = this.zoneDate.toString();
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
		return this.utcDate.toString();
	}

	/**
	 * Split a combined ISO datetime and timezone into datetime and timezone
	 */
	private static _splitDateFromTimeZone(s: string): string[] {
		const trimmed = s.trim();
		const result = ["", ""];
		let index = trimmed.lastIndexOf("without DST");
		if (index > -1) {
			const result = DateTime._splitDateFromTimeZone(s.slice(0, index - 1));
			result[1] += " without DST";
			return result;
		}
		index = trimmed.lastIndexOf(" ");
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

