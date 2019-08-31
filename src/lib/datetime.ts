/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Date+time+timezone representation
 */

"use strict";

import assert from "./assert";
import * as basics from "./basics";
import { TimeStruct, TimeUnit, WeekDay } from "./basics";
import { Duration } from "./duration";
import { convertError, error, errorIs, throwError } from "./error";
import * as format from "./format";
import { DateFunctions } from "./javascript";
import { PartialLocale } from "./locale";
import * as math from "./math";
import * as parseFuncs from "./parse";
import { RealTimeSource, TimeSource } from "./timesource";
import { TimeZone, TimeZoneKind } from "./timezone";
import { NormalizeOption } from "./tz-database";

/**
 * Current date+time in local time
 * @throws nothing
 */
export function nowLocal(): DateTime {
	return DateTime.nowLocal();
}

/**
 * Current date+time in UTC time
 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
 */
export function nowUtc(): DateTime {
	return DateTime.nowUtc();
}

/**
 * Current date+time in the given time zone
 * @param timeZone	The desired time zone (optional, defaults to UTC).
 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
 */
export function now(timeZone: TimeZone | undefined | null = TimeZone.utc()): DateTime {
	return DateTime.now(timeZone);
}

/**
 *
 * @param localTime
 * @param fromZone
 * @throws nothing
 */
function convertToUtc(localTime: TimeStruct, fromZone?: TimeZone): TimeStruct {
	if (fromZone) {
		const offset: number = fromZone.offsetForZone(localTime);
		return new TimeStruct(localTime.unixMillis - offset * 60000);
	} else {
		return localTime.clone();
	}
}

/**
 *
 * @param utcTime
 * @param toZone
 * @throws nothing
 */
function convertFromUtc(utcTime: TimeStruct, toZone?: TimeZone): TimeStruct {
	/* istanbul ignore else */
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
	 * Allow not using instanceof
	 */
	public kind = "DateTime";

	/**
	 * UTC timestamp (lazily calculated, use getter for utcDate instead)
	 */
	private _utcDate?: TimeStruct;

	/**
	 * UTC timestamp (lazily calculated)
	 * @throws nothing
	 */
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

	/**
	 * Local timestamp (lazily calculated)
	 * @throws nothing
	 */
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
	 * @throws nothing
	 */
	public static nowLocal(): DateTime {
		const n = DateTime.timeSource.now();
		return new DateTime(n, DateFunctions.Get, TimeZone.local());
	}

	/**
	 * Current date+time in UTC time
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
	 */
	public static nowUtc(): DateTime {
		return new DateTime(DateTime.timeSource.now(), DateFunctions.GetUTC, TimeZone.utc());
	}

	/**
	 * Current date+time in the given time zone
	 * @param timeZone	The desired time zone (optional, defaults to UTC).
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
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
	 * @throws timezonecomplete.Argument.N if n is not a finite number
	 * @throws timezonecomplete.Argument.TimeZone if the given time zone is invalid
	 */
	public static fromExcel(n: number, timeZone?: TimeZone | null | undefined): DateTime {
		assert(Number.isFinite(n), "Argument.N", "invalid number");
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
	 * @throws nothing
	 */
	public static exists(
		year: number, month: number = 1, day: number = 1,
		hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0,
		zone?: TimeZone | null | undefined, allowPre1970: boolean = false
	): boolean {
		if (
			!isFinite(year) || !isFinite(month) || !isFinite(day) || !isFinite(hour) || !isFinite(minute) || !isFinite(second)
			|| !isFinite(millisecond)
		) {
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
	 * @throws nothing
	 */
	constructor();
	/**
	 * Constructor. Parses ISO timestamp string.
	 * Non-existing local times are normalized by rounding up to the next DST offset.
	 *
	 * @param isoString	String in ISO 8601 format. Instead of ISO time zone,
	 *        it may include a space and then and IANA time zone.
	 *        e.g. "2007-04-05T12:30:40.500"					(no time zone, naive date)
	 *        e.g. "2007-04-05T12:30:40.500+01:00"				(UTC offset without daylight saving time)
	 *        or   "2007-04-05T12:30:40.500Z"					(UTC)
	 *        or   "2007-04-05T12:30:40.500 Europe/Amsterdam"	(IANA time zone, with daylight saving time if applicable)
	 * @param timeZone	if given, the date in the string is assumed to be in this time zone.
	 *        Note that it is NOT CONVERTED to the time zone. Useful
	 *        for strings without a time zone
	 * @throws timezonecomplete.Argument.S if the given string is invalid
	 * @throws timezonecomplete.Argument.TimeZone if the given time zone is invalid
	 */
	constructor(isoString: string, timeZone?: TimeZone | null | undefined);
	/**
	 * Constructor. Parses string in given LDML format.
	 * NOTE: does not handle eras/quarters/weeks/weekdays.
	 * Non-existing local times are normalized by rounding up to the next DST offset.
	 *
	 * @param dateString	Date+Time string.
	 * @param formatString The LDML format that the string is assumed to be in
	 * @param timeZone	if given, the date in the string is assumed to be in this time zone.
	 *        Note that it is NOT CONVERTED to the time zone. Useful
	 *        for strings without a time zone
	 * @throws timezonecomplete.ParseError if the given dateTimeString is wrong or not according to the pattern
	 * @throws timezonecomplete.Argument.FormatString if the given format string is invalid
	 * @throws timezonecomplete.Argument.Timezone if the given time zone is invalid
	 */
	constructor(dateString: string, formatString: string, timeZone?: TimeZone | null | undefined);
	/**
	 * Constructor. You provide a date, then you say whether to take the
	 * date.getYear()/getXxx methods or the date.getUTCYear()/date.getUTCXxx methods,
	 * and then you state which time zone that date is in.
	 * Non-existing local times are normalized by rounding up to the next DST offset.
	 * Note that the Date class has bugs and inconsistencies when constructing them with times around
	 * DST changes.
	 *
	 * @param date	A date object.
	 * @param getters Specifies which set of Date getters contains the date in the given time zone: the
	 *        Date.getXxx() methods or the Date.getUTCXxx() methods.
	 * @param timeZone The time zone that the given date is assumed to be in (may be undefined or null for unaware dates)
	 * @throws timezonecomplete.Argument.GetFuncs if the getFuncs argument is invalid
	 * @throws timezonecomplete.Argument.TimeZone if the time zone argument is invalid
	 */
	constructor(date: Date, getFuncs: DateFunctions, timeZone?: TimeZone | null | undefined);
	/**
	 * Get a date from a TimeStruct
	 * @throws timezonecomplete.Argument.TimeZone if the given time zone argument is invalid
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
	 * @throws timezonecomplete.Argument.Year if year invalid
	 * @throws timezonecomplete.Argument.Month if month invalid
	 * @throws timezonecomplete.Argument.Day if day invalid
	 * @throws timezonecomplete.Argument.Hour if hour invalid
	 * @throws timezonecomplete.Argument.Minute if minute invalid
	 * @throws timezonecomplete.Argument.Second if second invalid
	 * @throws timezonecomplete.Argument.Milli if milliseconds invalid
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
	 * @throws timezonecomplete.Argument.TimeZone if the given time zone is invalid
	 */
	constructor(unixTimestamp: number, timeZone?: TimeZone | null | undefined);

	/**
	 * Constructor implementation, @see overrides
	 */
	constructor(
		a1?: any, a2?: any, a3?: any,
		h?: number, m?: number, s?: number, ms?: number,
		timeZone?: TimeZone | null
	) {
		switch (typeof (a1)) {
			case "number": {
				if (typeof a2 !== "number") {
					assert(
						a3 === undefined && h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined,
						"Argument.A3",
						"for unix timestamp datetime constructor, third through 8th argument must be undefined"
					);
					assert(
						a2 === undefined || a2 === null || isTimeZone(a2),
						"Argument.TimeZone", "DateTime.DateTime(): second arg should be a TimeZone object."
					);
					// unix timestamp constructor
					this._zone = (typeof (a2) === "object" && isTimeZone(a2) ? a2 as TimeZone : undefined);
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(new TimeStruct(math.roundSym(a1 as number)));
					} else {
						this._zoneDate = new TimeStruct(math.roundSym(a1 as number));
					}
				} else {
					// year month day constructor
					assert(typeof (a2) === "number", "Argument.Year", "DateTime.DateTime(): Expect month to be a number.");
					assert(typeof (a3) === "number", "Argument.Month", "DateTime.DateTime(): Expect day to be a number.");
					assert(
						timeZone === undefined || timeZone === null || isTimeZone(timeZone), "Argument.TimeZone",
						"DateTime.DateTime(): eighth arg should be a TimeZone object."
					);
					let year: number = a1 as number;
					let month: number = a2 as number;
					let day: number = a3 as number;
					let hour: number = (typeof (h) === "number" ? h : 0);
					let minute: number = (typeof (m) === "number" ? m : 0);
					let second: number = (typeof (s) === "number" ? s : 0);
					let milli: number = (typeof (ms) === "number" ? ms : 0);
					year = convertError("Argument.Year", () => math.roundSym(year));
					month = convertError("Argument.Month", () => math.roundSym(month));
					day = convertError("Argument.Day", () => math.roundSym(day));
					hour = convertError("Argument.Hour", () => math.roundSym(hour));
					minute = convertError("Argument.Minute", () => math.roundSym(minute));
					second = convertError("Argument.Second", () => math.roundSym(second));
					milli = convertError("Argument.Milli", () => math.roundSym(milli));
					const tm = new TimeStruct({ year, month, day, hour, minute, second, milli });
					this._zone = (typeof (timeZone) === "object" && isTimeZone(timeZone) ? timeZone : undefined);

					// normalize local time (remove non-existing local time)
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(tm);
					} else {
						this._zoneDate = tm;
					}
				}
			}
			break;
			case "string": {
				if (typeof a2 === "string") {
					assert(
						h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined, "Argument.A4",
						"first two arguments are a string, therefore the fourth through 8th argument must be undefined"
					);
					assert(
						a3 === undefined || a3 === null || isTimeZone(a3),
						"Argument.TimeZone", "DateTime.DateTime(): third arg should be a TimeZone object."
					);
					// format string given
					const dateString: string = a1 as string;
					const formatString: string = a2 as string;
					let zone: TimeZone | undefined;
					if (typeof a3 === "object" && isTimeZone(a3)) {
						zone = (a3) as TimeZone;
					}
					const parsed = parseFuncs.parse(dateString, formatString, zone);
					this._zoneDate = parsed.time;
					this._zone = parsed.zone;
				} else {
					assert(
						a3 === undefined && h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined, "Argument.A3",
						"first arguments is a string and the second is not, therefore the third through 8th argument must be undefined"
					);
					assert(
						a2 === undefined || a2 === null || isTimeZone(a2),
						"Argument.TimeZone", "DateTime.DateTime(): second arg should be a TimeZone object."
					);
					const givenString = (a1 as string).trim();
					const ss: string[] = DateTime._splitDateFromTimeZone(givenString);
					assert(ss.length === 2, "Argument.S", "Invalid date string given: \"" + a1 as string + "\"");
					if (isTimeZone(a2)) {
						this._zone = (a2) as TimeZone;
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
			}
			break;
			case "object": {
				if (a1 instanceof Date) {
					assert(
						h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined, "Argument.A4",
						"first argument is a Date, therefore the fourth through 8th argument must be undefined"
					);
					assert(
						typeof (a2) === "number" && (a2 === DateFunctions.Get || a2 === DateFunctions.GetUTC), "Argument.GetFuncs",
						"DateTime.DateTime(): for a Date object a DateFunctions must be passed as second argument"
					);
					assert(
						a3 === undefined || a3 === null || isTimeZone(a3),
						"Argument.TimeZone", "DateTime.DateTime(): third arg should be a TimeZone object."
					);
					const d: Date = (a1) as Date;
					const dk: DateFunctions = (a2) as DateFunctions;
					this._zone = (a3 ? a3 : undefined);
					this._zoneDate = TimeStruct.fromDate(d, dk);
					if (this._zone) {
						this._zoneDate = this._zone.normalizeZoneTime(this._zoneDate);
					}
				} else { // a1 instanceof TimeStruct
					assert(
						a3 === undefined && h === undefined && m === undefined
						&& s === undefined && ms === undefined && timeZone === undefined, "Argument.A3",
						"first argument is a TimeStruct, therefore the third through 8th argument must be undefined"
					);
					assert(a2 === undefined || a2 === null || isTimeZone(a2), "Argument.TimeZone", "expect a TimeZone as second argument");
					this._zoneDate = a1.clone();
					this._zone = (a2 ? a2 : undefined);
				}
			} break;
			case "undefined": {
				assert(
					a2 === undefined && a3 === undefined && h === undefined && m === undefined
					&& s === undefined && ms === undefined && timeZone === undefined, "Argument.A2",
					"first argument is undefined, therefore the rest must also be undefined"
				);
				// nothing given, make local datetime
				this._zone = TimeZone.local();
				this._utcDate = TimeStruct.fromDate(DateTime.timeSource.now(), DateFunctions.GetUTC);
			}                 break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw error("Argument.A1", "DateTime.DateTime(): unexpected first argument type.");
		}
	}

	/**
	 * @return a copy of this object
	 * @throws nothing
	 */
	public clone(): DateTime {
		return new DateTime(this.zoneDate, this._zone);
	}

	/**
	 * @return The time zone that the date is in. May be undefined for unaware dates.
	 * @throws nothing
	 */
	public zone(): TimeZone | undefined {
		return this._zone;
	}

	/**
	 * Zone name abbreviation at this time
	 * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
	 * @return The abbreviation
	 * @throws nothing
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
	 * @throws nothing
	 */
	public offset(): number {
		return Math.round((this.zoneDate.unixMillis - this.utcDate.unixMillis) / 60000);
	}

	/**
	 * @return the offset including DST w.r.t. UTC as a Duration.
	 * @throws nothing
	 */
	public offsetDuration(): Duration {
		return Duration.milliseconds(Math.round(this.zoneDate.unixMillis - this.utcDate.unixMillis));
	}

	/**
	 * @return the standard offset WITHOUT DST w.r.t. UTC as a Duration.
	 * @throws nothing
	 */
	public standardOffsetDuration(): Duration {
		if (this._zone) {
			return Duration.minutes(this._zone.standardOffsetForUtc(this.utcDate));
		}
		return Duration.minutes(0);
	}

	/**
	 * @return The full year e.g. 2014
	 * @throws nothing
	 */
	public year(): number {
		return this.zoneDate.components.year;
	}

	/**
	 * @return The month 1-12 (note this deviates from JavaScript Date)
	 * @throws nothing
	 */
	public month(): number {
		return this.zoneDate.components.month;
	}

	/**
	 * @return The day of the month 1-31
	 * @throws nothing
	 */
	public day(): number {
		return this.zoneDate.components.day;
	}

	/**
	 * @return The hour 0-23
	 * @throws nothing
	 */
	public hour(): number {
		return this.zoneDate.components.hour;
	}

	/**
	 * @return the minutes 0-59
	 * @throws nothing
	 */
	public minute(): number {
		return this.zoneDate.components.minute;
	}

	/**
	 * @return the seconds 0-59
	 * @throws nothing
	 */
	public second(): number {
		return this.zoneDate.components.second;
	}

	/**
	 * @return the milliseconds 0-999
	 * @throws nothing
	 */
	public millisecond(): number {
		return this.zoneDate.components.milli;
	}

	/**
	 * @return the day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 * @throws nothing
	 */
	public weekDay(): WeekDay {
		return basics.weekDayNoLeapSecs(this.zoneDate.unixMillis) as WeekDay;
	}

	/**
	 * Returns the day number within the year: Jan 1st has number 0,
	 * Jan 2nd has number 1 etc.
	 *
	 * @return the day-of-year [0-366]
	 * @throws nothing
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
	 * @throws nothing
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
	 * @throws nothing
	 */
	public weekOfMonth(): number {
		return basics.weekOfMonth(this.year(), this.month(), this.day());
	}

	/**
	 * Returns the number of seconds that have passed on the current day
	 * Does not consider leap seconds
	 *
	 * @return seconds [0-86399]
	 * @throws nothing
	 */
	public secondOfDay(): number {
		return basics.secondOfDay(this.hour(), this.minute(), this.second());
	}

	/**
	 * @return Milliseconds since 1970-01-01T00:00:00.000Z
	 * @throws nothing
	 */
	public unixUtcMillis(): number {
		return this.utcDate.unixMillis;
	}

	/**
	 * @return The full year e.g. 2014
	 * @throws nothing
	 */
	public utcYear(): number {
		return this.utcDate.components.year;
	}

	/**
	 * @return The UTC month 1-12 (note this deviates from JavaScript Date)
	 * @throws nothing
	 */
	public utcMonth(): number {
		return this.utcDate.components.month;
	}

	/**
	 * @return The UTC day of the month 1-31
	 * @throws nothing
	 */
	public utcDay(): number {
		return this.utcDate.components.day;
	}

	/**
	 * @return The UTC hour 0-23
	 * @throws nothing
	 */
	public utcHour(): number {
		return this.utcDate.components.hour;
	}

	/**
	 * @return The UTC minutes 0-59
	 * @throws nothing
	 */
	public utcMinute(): number {
		return this.utcDate.components.minute;
	}

	/**
	 * @return The UTC seconds 0-59
	 * @throws nothing
	 */
	public utcSecond(): number {
		return this.utcDate.components.second;
	}

	/**
	 * Returns the UTC day number within the year: Jan 1st has number 0,
	 * Jan 2nd has number 1 etc.
	 *
	 * @return the day-of-year [0-366]
	 * @throws nothing
	 */
	public utcDayOfYear(): number {
		return basics.dayOfYear(this.utcYear(), this.utcMonth(), this.utcDay());
	}

	/**
	 * @return The UTC milliseconds 0-999
	 * @throws nothing
	 */
	public utcMillisecond(): number {
		return this.utcDate.components.milli;
	}

	/**
	 * @return the UTC day-of-week (the enum values correspond to JavaScript
	 * week day numbers)
	 * @throws nothing
	 */
	public utcWeekDay(): WeekDay {
		return basics.weekDayNoLeapSecs(this.utcDate.unixMillis) as WeekDay;
	}

	/**
	 * The ISO 8601 UTC week number. Week 1 is the week
	 * that has January 4th in it, and it starts on Monday.
	 * See https://en.wikipedia.org/wiki/ISO_week_date
	 *
	 * @return Week number [1-53]
	 * @throws nothing
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
	 * @throws nothing
	 */
	public utcWeekOfMonth(): number {
		return basics.weekOfMonth(this.utcYear(), this.utcMonth(), this.utcDay());
	}

	/**
	 * Returns the number of seconds that have passed on the current day
	 * Does not consider leap seconds
	 *
	 * @return seconds [0-86399]
	 * @throws nothing
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
	 * @throws nothing
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
	 * @return this (for chaining)
	 * @throws timezonecomplete.UnawareToAwareConversion if you try to convert a datetime without a zone to a datetime with a zone
	 */
	public convert(zone?: TimeZone | null | undefined): DateTime {
		if (zone) {
			if (!this._zone) { // if-statement satisfies the compiler
				return throwError("UnawareToAwareConversion", "DateTime.toZone(): Cannot convert unaware date to an aware date");
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
	 * @throws timezonecomplete.UnawareToAwareConversion if you try to convert a naive datetime to an aware one.
	 */
	public toZone(zone?: TimeZone | null | undefined): DateTime {
		if (zone) {
			assert(this._zone, "UnawareToAwareConversion", "DateTime.toZone(): Cannot convert unaware date to an aware date");
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
	 * @throws nothing
	 */
	public toDate(): Date {
		return new Date(
			this.year(), this.month() - 1, this.day(),
			this.hour(), this.minute(), this.second(), this.millisecond()
		);
	}

	/**
	 * Create an Excel timestamp for this datetime converted to the given zone.
	 * Does not work for dates < 1900
	 * @param timeZone Optional. Zone to convert to, default the zone the datetime is already in.
	 * @return an Excel date/time number i.e. days since 1-1-1900 where 1900 is incorrectly seen as leap year
	 * @throws timezonecomplete.UnawareToAwareConversion if you try to convert a naive datetime to an aware one.
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
	 * @throws nothing
	 */
	public toUtcExcel(): number {
		const unixTimestamp = this.unixUtcMillis();
		return this._unixTimeStampToExcel(unixTimestamp);
	}

	/**
	 *
	 * @param n
	 * @throws nothing
	 */
	private _unixTimeStampToExcel(n: number): number {
		const result = ((n) / (24 * 60 * 60 * 1000)) + 25569;
		// round to nearest millisecond
		const msecs = result / (1 / 86400000);
		return Math.round(msecs) * (1 / 86400000);
	}


	/**
	 * Add a time duration relative to UTC. Returns a new DateTime
	 * @return this + duration
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
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
	 * @throws Argument.Amount if amount is not a finite number or if you're trying to add a non-integer amount of years or months
	 * @throws Argument.Unit for invalid time unit
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
	 */
	public add(amount: number, unit: TimeUnit): DateTime;
	/**
	 * Implementation.
	 */
	public add(a1: any, unit?: TimeUnit): DateTime {
		let amount: number;
		let u: TimeUnit;
		if (typeof (a1) === "object") {
			const duration: Duration = (a1) as Duration;
			amount = duration.amount();
			u = duration.unit();
		} else {
			amount = (a1) as number;
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
	 * @param amount
	 * @param unit
	 * @throws Argument.Amount if amount is not a finite number or if you're trying to add a non-integer amount of years or months
	 * @throws Argument.Unit for invalid time unit
	 */
	public addLocal(amount: number, unit: TimeUnit): DateTime;
	public addLocal(a1: any, unit?: TimeUnit): DateTime {
		let amount: number;
		let u: TimeUnit;
		if (typeof (a1) === "object") {
			const duration: Duration = (a1) as Duration;
			amount = duration.amount();
			u = duration.unit();
		} else {
			amount = (a1) as number;
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
	 * @throws Argument.Amount if amount is not finite or if it's not an integer and you're adding months or years
	 * @throws Argument.Unit for invalid time unit
	 */
	private _addToTimeStruct(tm: TimeStruct, amount: number, unit: TimeUnit): TimeStruct {
		assert(Number.isFinite(amount), "Argument.Amount", "amount must be a finite number");
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
				assert(math.isInt(amount), "Argument.Amount", "Cannot add/sub a non-integer amount of months");
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
				assert(math.isInt(amount), "Argument.Amount", "Cannot add/sub a non-integer amount of years");
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
				/* istanbul ignore next */
				return throwError("Argument.Unit", "invalid time unit");
		}
	}

	/**
	 * Same as add(-1*duration); Returns a new DateTime
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
	 */
	public sub(duration: Duration): DateTime;
	/**
	 * Same as add(-1*amount, unit); Returns a new DateTime
	 * @throws Argument.Amount if amount is not a finite number or if you're trying to add a non-integer amount of years or months
	 * @throws Argument.Unit for invalid time unit
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
	 */
	public sub(amount: number, unit: TimeUnit): DateTime;
	public sub(a1: number | Duration, unit?: TimeUnit): DateTime {
		if (typeof a1 === "number") {
			const amount: number = a1 as number;
			return this.add(-1 * amount, unit as TimeUnit);
		} else {
			const duration: Duration = a1 as Duration;
			return this.add(duration.multiply(-1));
		}
	}

	/**
	 * Same as addLocal(-1*amount, unit); Returns a new DateTime
	 * @throws nothing
	 */
	public subLocal(duration: Duration): DateTime;
	/**
	 * Same as addLocal(-1*amount, unit); Returns a new DateTime
	 * @param amount
	 * @param unit
	 * @throws Argument.Amount if amount is not a finite number or if you're trying to add a non-integer amount of years or months
	 * @throws Argument.Unit for invalid time unit
	 */
	public subLocal(amount: number, unit: TimeUnit): DateTime;
	public subLocal(a1: any, unit?: TimeUnit): DateTime {
		if (typeof a1 === "number") {
			return this.addLocal(-1 * a1 as number, unit as TimeUnit);
		} else {
			return this.addLocal((a1 as Duration).multiply(-1));
		}
	}

	/**
	 * Time difference between two DateTimes
	 * @return this - other
	 * @throws nothing
	 */
	public diff(other: DateTime): Duration {
		return new Duration(this.utcDate.unixMillis - other.utcDate.unixMillis);
	}

	/**
	 * Chops off the time part, yields the same date at 00:00:00.000
	 * @return a new DateTime
	 * @throws nothing
	 */
	public startOfDay(): DateTime {
		return new DateTime(this.year(), this.month(), this.day(), 0, 0, 0, 0, this.zone());
	}

	/**
	 * Returns the first day of the month at 00:00:00
	 * @return a new DateTime
	 * @throws nothing
	 */
	public startOfMonth(): DateTime {
		return new DateTime(this.year(), this.month(), 1, 0, 0, 0, 0, this.zone());
	}

	/**
	 * Returns the first day of the year at 00:00:00
	 * @return a new DateTime
	 * @throws nothing
	 */
	public startOfYear(): DateTime {
		return new DateTime(this.year(), 1, 1, 0, 0, 0, 0, this.zone());
	}

	/**
	 * @return True iff (this < other)
	 * @throws nothing
	 */
	public lessThan(other: DateTime): boolean {
		return this.utcDate.unixMillis < other.utcDate.unixMillis;
	}

	/**
	 * @return True iff (this <= other)
	 * @throws nothing
	 */
	public lessEqual(other: DateTime): boolean {
		return this.utcDate.unixMillis <= other.utcDate.unixMillis;
	}

	/**
	 * @return True iff this and other represent the same moment in time in UTC
	 * @throws nothing
	 */
	public equals(other: DateTime): boolean {
		return this.utcDate.equals(other.utcDate);
	}

	/**
	 * @return True iff this and other represent the same time and the same zone
	 * @throws nothing
	 */
	public identical(other: DateTime): boolean {
		return !!(this.zoneDate.equals(other.zoneDate)
			&& (!this._zone) === (!other._zone)
			&& ((!this._zone && !other._zone) || (this._zone && other._zone && this._zone.identical(other._zone)))
			);
	}

	/**
	 * @return True iff this > other
	 * @throws nothing
	 */
	public greaterThan(other: DateTime): boolean {
		return this.utcDate.unixMillis > other.utcDate.unixMillis;
	}

	/**
	 * @return True iff this >= other
	 * @throws nothing
	 */
	public greaterEqual(other: DateTime): boolean {
		return this.utcDate.unixMillis >= other.utcDate.unixMillis;
	}

	/**
	 * @return The minimum of this and other
	 * @throws nothing
	 */
	public min(other: DateTime): DateTime {
		if (this.lessThan(other)) {
			return this.clone();
		}
		return other.clone();
	}

	/**
	 * @return The maximum of this and other
	 * @throws nothing
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
	 * Unaware dates have no zone information at the end.
	 * @throws nothing
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
	 * Convert to UTC and then return ISO string ending in 'Z'. This is equivalent to Date#toISOString()
	 * e.g. "2014-01-01T23:15:33 Europe/Amsterdam" becomes "2014-01-01T22:15:33Z".
	 * Unaware dates are assumed to be in UTC
	 * @throws timezonecomplete.NotFound.Zone if the UTC time zone doesn't exist in the time zone database
	 */
	public toUtcIsoString(): string {
		if (this._zone) {
			return this.toZone(TimeZone.utc()).format("yyyy-MM-ddTHH:mm:ss.SSSZZZZZ");
		} else {
			return this.withZone(TimeZone.utc()).format("yyyy-MM-ddTHH:mm:ss.SSSZZZZZ");
		}
	}

	/**
	 * Return a string representation of the DateTime according to the
	 * specified format. See LDML.md for supported formats.
	 *
	 * @param formatString The format specification (e.g. "dd/MM/yyyy HH:mm:ss")
	 * @param locale Optional, non-english format month names etc.
	 * @return The string representation of this DateTime
	 * @throws timezonecomplete.Argument.FormatString for invalid format pattern
	 */
	public format(formatString: string, locale?: PartialLocale): string {
		return format.format(this.zoneDate, this.utcDate, this._zone, formatString, locale);
	}

	/**
	 * Parse a date in a given format
	 * @param s the string to parse
	 * @param format the format the string is in. See LDML.md for supported formats.
	 * @param zone Optional, the zone to add (if no zone is given in the string)
	 * @param locale Optional, different settings for constants like 'AM' etc
	 * @param allowTrailing Allow trailing characters in the source string
	 * @throws timezonecomplete.ParseError if the given dateTimeString is wrong or not according to the pattern
	 * @throws timezonecomplete.Argument.FormatString if the given format string is invalid
	 */
	public static parse(s: string, format: string, zone?: TimeZone, locale?: PartialLocale, allowTrailing?: boolean): DateTime {
		const parsed = parseFuncs.parse(s, format, zone, allowTrailing || false, locale);
		try {
			return new DateTime(parsed.time, parsed.zone);
		} catch (e) {
			if (!errorIs(e, "InvalidTimeZoneData")) {
				e = error("ParseError", e.message);
			}
			throw e;
		}
	}

	/**
	 * Modified ISO 8601 format string with IANA name if applicable.
	 * E.g. "2014-01-01T23:15:33.000 Europe/Amsterdam"
	 * @throws nothing
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
	 * The valueOf() method returns the primitive value of the specified object.
	 * @throws nothing
	 */
	public valueOf(): any {
		return this.unixUtcMillis();
	}

	/**
	 * Modified ISO 8601 format string in UTC without time zone info
	 * @throws nothing
	 */
	public toUtcString(): string {
		return this.utcDate.toString();
	}

	/**
	 * Split a combined ISO datetime and timezone into datetime and timezone
	 * @throws nothing
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

/**
 * Checks whether `a` is similar to a TimeZone without using the instanceof operator.
 * It checks for the availability of the functions used in the DateTime implementation
 * @param a the object to check
 * @returns a is TimeZone-like
 * @throws nothing
 */
function isTimeZone(a: any): a is TimeZone {
	if (a && typeof a === "object") {
		if (
			typeof a.normalizeZoneTime === "function"
			&& typeof a.abbreviationForUtc === "function"
			&& typeof a.standardOffsetForUtc === "function"
			&& typeof a.identical === "function"
			&& typeof a.equals === "function"
			&& typeof a.kind === "function"
			&& typeof a.clone === "function"
		) {
			return true;
		}
	}
	return false;
}

/**
 * Checks if a given object is of type DateTime. Note that it does not work for sub classes. However, use this to be robust
 * against different versions of the library in one process instead of instanceof
 * @param value Value to check
 * @throws nothing
 */
export function isDateTime(value: any): value is DateTime {
	return typeof value === "object" && value !== null && value.kind === "DateTime";
}
