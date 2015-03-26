/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

import javascript = require("./javascript");
import DateFunctions = javascript.DateFunctions;

import math = require("./math");
import strings = require("./strings");

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
 * Time units
 */
export enum TimeUnit {
	Millisecond,
	Second,
	Minute,
	Hour,
	Day,
	Week,
	Month,
	Year,
	/**
	 * End-of-enum marker, do not use
	 */
	MAX
}

/**
 * Approximate number of milliseconds for a time unit.
 * A day is assumed to have 24 hours, a month is assumed to equal 30 days
 * and a year is set to 360 days (because 12 months of 30 days).
 *
 * @param unit	Time unit e.g. TimeUnit.Month
 * @returns	The number of milliseconds.
 */
export function timeUnitToMilliseconds(unit: TimeUnit): number {
	switch (unit) {
		case TimeUnit.Millisecond: return 1;
		case TimeUnit.Second: return 1000;
		case TimeUnit.Minute: return 60 * 1000;
		case TimeUnit.Hour: return 60 * 60 * 1000;
		case TimeUnit.Day: return 86400000;
		case TimeUnit.Week: return 7 * 86400000;
		case TimeUnit.Month: return 30 * 86400000;
		case TimeUnit.Year: return 12 * 30 * 86400000;
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unknown time unit");
			}
	}
}

/**
 * Time unit to lowercase string. If amount is specified, then the string is put in plural form
 * if necessary.
 * @param unit The unit
 * @param amount If this is unequal to -1 and 1, then the result is pluralized
 */
export function timeUnitToString(unit: TimeUnit, amount: number = 1): string {
	var result = TimeUnit[unit].toLowerCase();
	if (amount === 1 || amount === -1) {
		return result;
	} else {
		return result + "s";
	}
}

export function stringToTimeUnit(s: string): TimeUnit {
	var trimmed = s.trim().toLowerCase();
	for (var i = 0; i < TimeUnit.MAX; ++i) {
		var other = timeUnitToString(i, 1);
		if (other === trimmed || (other + "s") === trimmed) {
			return i;
		}
	}
	throw new Error("Unknown time unit string '" + s + "'");
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
 * The days in a given year
 */
export function daysInYear(year: number): number {
	return (isLeapYear(year) ? 366 : 365);
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
			throw new Error("Invalid month: " + month);
	}
}

/**
 * Returns the day of the year of the given date [0..365]. January first is 0.
 *
 * @param year	The year e.g. 1986
 * @param month Month 1-12
 * @param day Day of month 1-31
 */
export function dayOfYear(year: number, month: number, day: number): number {
	assert(month >= 1 && month <= 12, "Month out of range");
	assert(day >= 1 && day <= daysInMonth(year, month), "day out of range");
	var yearDay: number = 0;
	for (var i: number = 1; i < month; i++) {
		yearDay += daysInMonth(year, i);
	}
	yearDay += (day - 1);
	return yearDay;
}

/**
 * Returns the last instance of the given weekday in the given month
 *
 * @param year	The year
 * @param month	the month 1-12
 * @param weekDay	the desired week day
 *
 * @return the last occurrence of the week day in the month
 */
export function lastWeekDayOfMonth(year: number, month: number, weekDay: WeekDay): number {
	var endOfMonth: TimeStruct = new TimeStruct(year, month, daysInMonth(year, month));
	var endOfMonthMillis = timeToUnixNoLeapSecs(endOfMonth);
	var endOfMonthWeekDay = weekDayNoLeapSecs(endOfMonthMillis);
	var diff: number = weekDay - endOfMonthWeekDay;
	if (diff > 0) {
		diff -= 7;
	}
	return endOfMonth.day + diff;
}

/**
 * Returns the first instance of the given weekday in the given month
 *
 * @param year	The year
 * @param month	the month 1-12
 * @param weekDay	the desired week day
 *
 * @return the first occurrence of the week day in the month
 */
export function firstWeekDayOfMonth(year: number, month: number, weekDay: WeekDay): number {
	var beginOfMonth: TimeStruct = new TimeStruct(year, month, 1);
	var beginOfMonthMillis = timeToUnixNoLeapSecs(beginOfMonth);
	var beginOfMonthWeekDay = weekDayNoLeapSecs(beginOfMonthMillis);
	var diff: number = weekDay - beginOfMonthWeekDay;
	if (diff < 0) {
		diff += 7;
	}
	return beginOfMonth.day + diff;
}
/**
 * Returns the day-of-month that is on the given weekday and which is >= the given day.
 * Throws if the month has no such day.
 */
export function weekDayOnOrAfter(year: number, month: number, day: number, weekDay: WeekDay): number {
	var start: TimeStruct = new TimeStruct(year, month, day);
	var startMillis: number = timeToUnixNoLeapSecs(start);
	var startWeekDay: WeekDay = weekDayNoLeapSecs(startMillis);
	var diff: number = weekDay - startWeekDay;
	if (diff < 0) {
		diff += 7;
	}
	assert(start.day + diff <= daysInMonth(year, month), "The given month has no such weekday");
	return start.day + diff;
}

/**
 * Returns the day-of-month that is on the given weekday and which is <= the given day.
 * Throws if the month has no such day.
 */
export function weekDayOnOrBefore(year: number, month: number, day: number, weekDay: WeekDay): number {
	var start: TimeStruct = new TimeStruct(year, month, day);
	var startMillis: number = timeToUnixNoLeapSecs(start);
	var startWeekDay: WeekDay = weekDayNoLeapSecs(startMillis);
	var diff: number = weekDay - startWeekDay;
	if (diff > 0) {
		diff -= 7;
	}
	assert(start.day + diff >= 1, "The given month has no such weekday");
	return start.day + diff;
}

/**
 * The week of this month. There is no official standard for this,
 * but we assume the same rules for the weekNumber (i.e.
 * week 1 is the week that has the 4th day of the month in it)
 *
 * @param year The year
 * @param month The month [1-12]
 * @param day The day [1-31]
 * @return Week number [1-5]
 */
export function weekOfMonth(year: number, month: number, day: number): number {
	var firstThursday = firstWeekDayOfMonth(year, month, WeekDay.Thursday);
	var firstMonday = firstWeekDayOfMonth(year, month, WeekDay.Monday);
	// Corner case: check if we are in week 1 or last week of previous month
	if (day < firstMonday) {
		if (firstThursday < firstMonday) {
			// Week 1
			return 1;
		} else {
			// Last week of previous month
			if (month > 1) {
				// Default case
				return weekOfMonth(year, month - 1, 31);
			} else {
				// January
				return weekOfMonth(year - 1, 12, 31);
			}
		}
	}

	var lastMonday = lastWeekDayOfMonth(year, month, WeekDay.Monday);
	var lastThursday = lastWeekDayOfMonth(year, month, WeekDay.Thursday);
	// Corner case: check if we are in last week or week 1 of previous month
	if (day >= lastMonday) {
		if (lastMonday > lastThursday) {
			// Week 1 of next month
			return 1;
		}
	}

	// Normal case
	var result = Math.floor((day - firstMonday) / 7) + 1;
	if (firstThursday < 4) {
		result += 1;
	}

	return result;
}

/**
 * Returns the day-of-year of the Monday of week 1 in the given year.
 * Note that the result may lie in the previous year, in which case it
 * will be (much) greater than 4
 */
function getWeekOneDayOfYear(year: number): number {
	// first monday of January, minus one because we want day-of-year
	var result: number = weekDayOnOrAfter(year, 1, 1, WeekDay.Monday) - 1;
	if (result > 3) { // greater than jan 4th
		result -= 7;
		if (result < 0) {
			result += exports.daysInYear(year - 1);
		}
	}
	return result;
}

/**
 * The ISO 8601 week number for the given date. Week 1 is the week
 * that has January 4th in it, and it starts on Monday.
 * See https://en.wikipedia.org/wiki/ISO_week_date
 *
 * @param year	Year e.g. 1988
 * @param month	Month 1-12
 * @param day	Day of month 1-31
 *
 * @return Week number 1-53
 */
export function weekNumber(year: number, month: number, day: number): number {
	var doy = dayOfYear(year, month, day);

	// check end-of-year corner case: may be week 1 of next year
	if (doy >= dayOfYear(year, 12, 29)) {
		var nextYearWeekOne = getWeekOneDayOfYear(year + 1);
		if (nextYearWeekOne > 4 && nextYearWeekOne <= doy) {
			return 1;
		}
	}

	// check beginning-of-year corner case
	var thisYearWeekOne = getWeekOneDayOfYear(year);
	if (thisYearWeekOne > 4) {
		// week 1 is at end of last year
		var weekTwo = thisYearWeekOne + 7 - daysInYear(year - 1);
		if (doy < weekTwo) {
			return 1;
		} else {
			return Math.floor((doy - weekTwo) / 7) + 2;
		}
	}

	// Week 1 is entirely inside this year.
	if (doy < thisYearWeekOne) {
		// The date is part of the last week of prev year.
		return weekNumber(year - 1, 12, 31);
	}

	// normal cases; note that week numbers start from 1 so +1
	return Math.floor((doy - thisYearWeekOne) / 7) + 1;
}


function assertUnixTimestamp(unixMillis: number): void {
	assert(typeof (unixMillis) === "number", "number input expected");
	assert(!isNaN(unixMillis), "NaN not expected as input");
	assert(math.isInt(unixMillis), "Expect integer number for unix UTC timestamp");
}

/**
 * Convert a unix milli timestamp into a TimeT structure.
 * This does NOT take leap seconds into account.
 */
export function unixToTimeNoLeapSecs(unixMillis: number): TimeStruct {
	assertUnixTimestamp(unixMillis);

	var temp: number = unixMillis;
	var result: TimeStruct = new TimeStruct();
	var year: number;
	var month: number;

	if (unixMillis >= 0) {
		result.milli = temp % 1000;
		temp = Math.floor(temp / 1000);
		result.second = temp % 60;
		temp = Math.floor(temp / 60);
		result.minute = temp % 60;
		temp = Math.floor(temp / 60);
		result.hour = temp % 24;
		temp = Math.floor(temp / 24);

		year = 1970;
		while (temp >= daysInYear(year)) {
			temp -= daysInYear(year);
			year++;
		}
		result.year = year;

		month = 1;
		while (temp >= daysInMonth(year, month)) {
			temp -= daysInMonth(year, month);
			month++;
		}
		result.month = month;
		result.day = temp + 1;
	} else {
		// Note that a negative number modulo something yields a negative number.
		// We make it positive by adding the modulo.
		result.milli = math.positiveModulo(temp, 1000);
		temp = Math.floor(temp / 1000);
		result.second = math.positiveModulo(temp, 60);
		temp = Math.floor(temp / 60);
		result.minute = math.positiveModulo(temp, 60);
		temp = Math.floor(temp / 60);
		result.hour = math.positiveModulo(temp, 24);
		temp = Math.floor(temp / 24);

		year = 1969;
		while (temp < -daysInYear(year)) {
			temp += daysInYear(year);
			year--;
		}
		result.year = year;

		month = 12;
		while (temp < -daysInMonth(year, month)) {
			temp += daysInMonth(year, month);
			month--;
		}
		result.month = month;
		result.day = temp + 1 + daysInMonth(year, month);
	}

	return result;
}

/**
 * Convert a year, month, day etc into a unix milli timestamp.
 * This does NOT take leap seconds into account.
 *
 * @param year	Year e.g. 1970
 * @param month	Month 1-12
 * @param day	Day 1-31
 * @param hour	Hour 0-23
 * @param minute	Minute 0-59
 * @param second	Second 0-59 (no leap seconds)
 * @param milli	Millisecond 0-999
 */
export function timeToUnixNoLeapSecs(
	year?: number, month?: number, day?: number,
	hour?: number, minute?: number, second?: number, milli?: number): number;

/**
 * Convert a TimeT structure into a unix milli timestamp.
 * This does NOT take leap seconds into account.
 */
export function timeToUnixNoLeapSecs(tm: TimeStruct): number;

export function timeToUnixNoLeapSecs(
	a: any = 1970, month: number = 1, day: number = 1,
	hour: number = 0, minute: number = 0, second: number = 0, milli: number = 0): number {
	assert(typeof (a) === "object" || typeof (a) === "number", "Please give either a TimeStruct or a number as first argument.");

	if (typeof (a) === "object") {
		var tm: TimeStruct = <TimeStruct>a;
		assert(tm.validate(), "tm invalid");
		return timeToUnixNoLeapSecs(tm.year, tm.month, tm.day, tm.hour, tm.minute, tm.second, tm.milli);
	} else {
		var year: number = <number> a;
		assert(month >= 1 && month <= 12, "Month out of range");
		assert(day >= 1 && day <= daysInMonth(year, month), "day out of range");
		assert(hour >= 0 && hour <= 23, "hour out of range");
		assert(minute >= 0 && minute <= 59, "minute out of range");
		assert(second >= 0 && second <= 59, "second out of range");
		assert(milli >= 0 && milli <= 999, "milli out of range");
		return milli + 1000 * (
			second + minute * 60 + hour * 3600 + dayOfYear(year, month, day) * 86400 +
			(year - 1970) * 31536000 + Math.floor((year - 1969) / 4) * 86400 -
			Math.floor((year - 1901) / 100) * 86400 + Math.floor((year - 1900 + 299) / 400) * 86400);
	}
}

/**
 * Return the day-of-week.
 * This does NOT take leap seconds into account.
 */
export function weekDayNoLeapSecs(unixMillis: number): WeekDay {
	assertUnixTimestamp(unixMillis);

	var epochDay: WeekDay = WeekDay.Thursday;
	var days = Math.floor(unixMillis / 1000 / 86400);
	return (epochDay + days) % 7;
}

/**
 * N-th second in the day, counting from 0
 */
export function secondOfDay(hour: number, minute: number, second: number): number {
	return (((hour * 60) + minute) * 60) + second;
}

/**
 * Basic representation of a date and time
 */
export class TimeStruct {

	/**
	 * Create a TimeStruct from a number of unix milliseconds
	 */
	public static fromUnix(unixMillis: number): TimeStruct {
		return unixToTimeNoLeapSecs(unixMillis);
	}

	/**
	 * Create a TimeStruct from a JavaScript date
	 *
	 * @param d	The date
	 * @param df	Which functions to take (getX() or getUTCX())
	 */
	public static fromDate(d: Date, df: DateFunctions): TimeStruct {
		if (df === DateFunctions.Get) {
			return new TimeStruct(d.getFullYear(), d.getMonth() + 1, d.getDate(),
				d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
		} else {
			return new TimeStruct(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
				d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
		}
	}

	/**
	 * Returns a TimeStruct from an ISO 8601 string WITHOUT time zone
	 */
	public static fromString(s: string): TimeStruct {
		try {
			var year: number = 1970;
			var month: number = 1;
			var day: number = 1;
			var hour: number = 0;
			var minute: number = 0;
			var second: number = 0;
			var fractionMillis: number = 0;
			var lastUnit: TimeUnit = TimeUnit.Year;

			// separate any fractional part
			var split: string[] = s.trim().split(".");
			assert(split.length >= 1 && split.length <= 2, "Empty string or multiple dots.");

			// parse main part
			var isBasicFormat = (s.indexOf("-") === -1);
			if (isBasicFormat) {
				assert(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/),
					"ISO string in basic notation may only contain numbers before the fractional part");

				// remove any "T" separator
				split[0] = split[0].replace("T", "");

				assert([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1,
					"Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");

				if (split[0].length >= 4) {
					year = parseInt(split[0].substr(0, 4), 10);
					lastUnit = TimeUnit.Year;
				}
				if (split[0].length >= 8) {
					month = parseInt(split[0].substr(4, 2), 10);
					day = parseInt(split[0].substr(6, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
					lastUnit = TimeUnit.Day;
				}
				if (split[0].length >= 10) {
					hour = parseInt(split[0].substr(8, 2), 10);
					lastUnit = TimeUnit.Hour;
				}
				if (split[0].length >= 12) {
					minute = parseInt(split[0].substr(10, 2), 10);
					lastUnit = TimeUnit.Minute;
				}
				if (split[0].length >= 14) {
					second = parseInt(split[0].substr(12, 2), 10);
					lastUnit = TimeUnit.Second;
				}
			} else {
				assert(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Invalid ISO string");
				var dateAndTime: string[] = [];
				if (s.indexOf("T") !== -1) {
					dateAndTime = split[0].split("T");
				} else if (s.length > 10) {
					dateAndTime = [split[0].substr(0, 10), split[0].substr(10)];
				} else {
					dateAndTime = [split[0], ""];
				}
				assert([4, 10].indexOf(dateAndTime[0].length) !== -1,
					"Padding or required components are missing. Note that YYYYMM is not valid per ISO 8601");

				if (dateAndTime[0].length >= 4) {
					year = parseInt(dateAndTime[0].substr(0, 4), 10);
					lastUnit = TimeUnit.Year;
				}
				if (dateAndTime[0].length >= 10) {
					month = parseInt(dateAndTime[0].substr(5, 2), 10);
					day = parseInt(dateAndTime[0].substr(8, 2), 10); // note that YYYYMM format is disallowed so if month is present, day is too
					lastUnit = TimeUnit.Day;
				}
				if (dateAndTime[1].length >= 2) {
					hour = parseInt(dateAndTime[1].substr(0, 2), 10);
					lastUnit = TimeUnit.Hour;
				}
				if (dateAndTime[1].length >= 5) {
					minute = parseInt(dateAndTime[1].substr(3, 2), 10);
					lastUnit = TimeUnit.Minute;
				}
				if (dateAndTime[1].length >= 8) {
					second = parseInt(dateAndTime[1].substr(6, 2), 10);
					lastUnit = TimeUnit.Second;
				}
			}

			// parse fractional part
			if (split.length > 1 && split[1].length > 0) {
				var fraction: number = parseFloat("0." + split[1]);
				switch (lastUnit) {
					case TimeUnit.Year: {
						fractionMillis = daysInYear(year) * 86400000 * fraction;
					} break;
					case TimeUnit.Day: {
						fractionMillis = 86400000 * fraction;
					} break;
					case TimeUnit.Hour: {
						fractionMillis = 3600000 * fraction;
					} break;
					case TimeUnit.Minute: {
						fractionMillis = 60000 * fraction;
					} break;
					case TimeUnit.Second: {
						fractionMillis = 1000 * fraction;
					} break;
				}
			}

			// combine main and fractional part
			year = math.roundSym(year);
			month = math.roundSym(month);
			day = math.roundSym(day);
			hour = math.roundSym(hour);
			minute = math.roundSym(minute);
			second = math.roundSym(second);
			var unixMillis: number = timeToUnixNoLeapSecs(year, month, day, hour, minute, second);
			unixMillis = math.roundSym(unixMillis + fractionMillis);
			return unixToTimeNoLeapSecs(unixMillis);
		} catch (e) {
			throw new Error("Invalid ISO 8601 string: \"" + s + "\": " + e.message);
		}
	}

	/**
	 * Constructor
	 *
	 * @param year	Year e.g. 1970
	 * @param month	Month 1-12
	 * @param day	Day 1-31
	 * @param hour	Hour 0-23
	 * @param minute	Minute 0-59
	 * @param second	Second 0-59 (no leap seconds)
	 * @param milli	Millisecond 0-999
	 */
	constructor(
		/**
		 * Year, 1970-...
		 */
		public year: number = 1970,

		/**
		 * Month 1-12
		 */
		public month: number = 1,

		/**
		 * Day of month, 1-31
		 */
		public day: number = 1,

		/**
		 * Hour 0-23
		 */
		public hour: number = 0,

		/**
		 * Minute 0-59
		 */
		public minute: number = 0,

		/**
		 * Seconds, 0-59
		 */
		public second: number = 0,

		/**
		 * Milliseconds 0-999
		 */
		public milli: number = 0
		) {
		assert(this.validate(), "Invalid arguments: " + this.toString());
	}

	/**
	 * Validate a TimeStruct, returns false if invalid.
	 */
	public validate(): boolean {
		return (typeof (this.year) === "number" && !isNaN(this.year) && math.isInt(this.year) && this.year >= -10000 && this.year < 10000
			&& typeof (this.month) === "number" && !isNaN(this.month) && math.isInt(this.month) && this.month >= 1 && this.month <= 12
			&& typeof (this.day) === "number" && !isNaN(this.day) && math.isInt(this.day) && this.day >= 1
			&& this.day <= daysInMonth(this.year, this.month)
			&& typeof (this.hour) === "number" && !isNaN(this.hour) && math.isInt(this.hour) && this.hour >= 0 && this.hour <= 23
			&& typeof (this.minute) === "number" && !isNaN(this.minute) && math.isInt(this.minute) && this.minute >= 0 && this.minute <= 59
			&& typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 59
			&& typeof (this.milli) === "number" && !isNaN(this.milli) && math.isInt(this.milli) && this.milli >= 0
			&& this.milli <= 999
			);
	}

	/**
	 * The day-of-year 0-365
	 */
	public yearDay(): number {
		assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
		return dayOfYear(this.year, this.month, this.day);
	}

	/**
	 * Returns this time as a unix millisecond timestamp
	 * Does NOT take leap seconds into account.
	 */
	public toUnixNoLeapSecs(): number {
		assert(this.validate(), "Invalid TimeStruct value: " + this.toString());
		return timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
	}

	/**
	 * Deep equals
	 */
	public equals(other: TimeStruct): boolean {
		return (this.year === other.year
			&& this.month === other.month
			&& this.day === other.day
			&& this.hour === other.hour
			&& this.minute === other.minute
			&& this.second === other.second
			&& this.milli === other.milli);
	}

	/**
	 * < operator
	 */
	public lessThan(other: TimeStruct): boolean {
		return (this.toUnixNoLeapSecs() < other.toUnixNoLeapSecs());
	}

	public clone(): TimeStruct {
		return new TimeStruct(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
	}

	public valueOf(): number {
		return timeToUnixNoLeapSecs(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
	}

	/**
	 * ISO 8601 string YYYY-MM-DDThh:mm:ss.nnn
	 */
	public toString(): string {
		return strings.padLeft(this.year.toString(10), 4, "0")
			+ "-" + strings.padLeft(this.month.toString(10), 2, "0")
			+ "-" + strings.padLeft(this.day.toString(10), 2, "0")
			+ "T" + strings.padLeft(this.hour.toString(10), 2, "0")
			+ ":" + strings.padLeft(this.minute.toString(10), 2, "0")
			+ ":" + strings.padLeft(this.second.toString(10), 2, "0")
			+ "." + strings.padLeft(this.milli.toString(10), 3, "0");
	}

	public inspect(): string {
		return "[TimeStruct: " + this.toString() + "]";
	}

}

