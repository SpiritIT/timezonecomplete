/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Olsen Timezone Database container
 */

"use strict";

import assert from "./assert";
import { errorIs, throwError } from "./error";
import { DateFunctions } from "./javascript";
import * as math from "./math";
import * as strings from "./strings";

/**
 * Used for methods that take a timestamp as separate year/month/... components
 */
export interface TimeComponentOpts {
	/**
	 * Year, default 1970
	 */
	year?: number;
	/**
	 * Month 1-12, default 1
	 */
	month?: number;
	/**
	 * Day of month 1-31, default 1
	 */
	day?: number;
	/**
	 * Hour of day 0-23, default 0
	 */
	hour?: number;
	/**
	 * Minute 0-59, default 0
	 */
	minute?: number;
	/**
	 * Second 0-59, default 0
	 */
	second?: number;
	/**
	 * Millisecond 0-999, default 0
	 */
	milli?: number;
}

/**
 * Timestamp represented as separate year/month/... components
 */
export interface TimeComponents {
	/**
	 * Year
	 */
	year: number;
	/**
	 * Month 1-12
	 */
	month: number;
	/**
	 * Day of month 1-31
	 */
	day: number;
	/**
	 * Hour 0-23
	 */
	hour: number;
	/**
	 * Minute
	 */
	minute: number;
	/**
	 * Second
	 */
	second: number;
	/**
	 * Millisecond 0-999
	 */
	milli: number;
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
 * @throws timezonecomplete.Argument.Unit for invalid unit
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
		default:
			return throwError("Argument.Unit", `unknown time unit ${unit}`);
	}
}

/**
 * Time unit to lowercase string. If amount is specified, then the string is put in plural form
 * if necessary.
 * @param unit The unit
 * @param amount If this is unequal to -1 and 1, then the result is pluralized
 * @throws timezonecomplete.Argument.Unit for invalid time unit
 */
export function timeUnitToString(unit: TimeUnit, amount: number = 1): string {
	if (!Number.isInteger(unit) || unit < 0 || unit >= TimeUnit.MAX) {
		return throwError("Argument.Unit", `invalid time unit ${unit}`);
	}
	const result = TimeUnit[unit].toLowerCase();
	if (amount === 1 || amount === -1) {
		return result;
	} else {
		return result + "s";
	}
}

/**
 * Convert a string to a numeric TimeUnit. Case-insensitive; time units can be singular or plural.
 * @param s
 * @throws timezonecomplete.Argument.S for invalid string
 */
export function stringToTimeUnit(s: string): TimeUnit {
	const trimmed = s.trim().toLowerCase();
	for (let i = 0; i < TimeUnit.MAX; ++i) {
		const other = timeUnitToString(i, 1);
		if (other === trimmed || (other + "s") === trimmed) {
			return i;
		}
	}
	return throwError("Argument.S", `Unknown time unit string '${s}'`);
}

/**
 * @return True iff the given year is a leap year.
 * @throws timezonecomplete.Argument.Year if year is not integer
 */
export function isLeapYear(year: number): boolean {
	assert(Number.isInteger(year), "Argument.Year", `Invalid year ${year}`);
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
 * @throws timezonecomplete.Argument.Year if year is not integer
 */
export function daysInYear(year: number): number {
	// rely on validation by isLeapYear
	return (isLeapYear(year) ? 366 : 365);
}

/**
 * @param year	The full year
 * @param month	The month 1-12
 * @return The number of days in the given month
 * @throws timezonecomplete.Argument.Year if year is not integer
 * @throws timezonecomplete.Argument.Month for invalid month number
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
			return throwError("Argument.Month", `Invalid month: ${month}`);
	}
}

/**
 * Returns the day of the year of the given date [0..365]. January first is 0.
 *
 * @param year	The year e.g. 1986
 * @param month Month 1-12
 * @param day Day of month 1-31
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
export function dayOfYear(year: number, month: number, day: number): number {
	assert(Number.isInteger(year), "Argument.Year", `Year out of range: ${year}`);
	assert(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", `Month out of range: ${month}`);
	assert(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
	let yearDay: number = 0;
	for (let i: number = 1; i < month; i++) {
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
 * @param weekDay	the desired week day 0-6
 * @return the last occurrence of the week day in the month
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 */
export function lastWeekDayOfMonth(year: number, month: number, weekDay: WeekDay): number {
	assert(Number.isInteger(year), "Argument.Year", `Year out of range: ${year}`);
	assert(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", `Month out of range: ${month}`);
	assert(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", `weekDay out of range: ${weekDay}`);
	const endOfMonth: TimeStruct = new TimeStruct({ year, month, day: daysInMonth(year, month) });
	const endOfMonthWeekDay = weekDayNoLeapSecs(endOfMonth.unixMillis);
	let diff: number = weekDay - endOfMonthWeekDay;
	if (diff > 0) {
		diff -= 7;
	}
	return endOfMonth.components.day + diff;
}

/**
 * Returns the first instance of the given weekday in the given month
 *
 * @param year	The year
 * @param month	the month 1-12
 * @param weekDay	the desired week day
 * @return the first occurrence of the week day in the month
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 */
export function firstWeekDayOfMonth(year: number, month: number, weekDay: WeekDay): number {
	assert(Number.isInteger(year), "Argument.Year", `Year out of range: ${year}`);
	assert(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", `Month out of range: ${month}`);
	assert(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", `weekDay out of range: ${weekDay}`);
	const beginOfMonth: TimeStruct = new TimeStruct({ year, month, day: 1 });
	const beginOfMonthWeekDay = weekDayNoLeapSecs(beginOfMonth.unixMillis);
	let diff: number = weekDay - beginOfMonthWeekDay;
	if (diff < 0) {
		diff += 7;
	}
	return beginOfMonth.components.day + diff;
}

/**
 * Returns the nth instance of the given weekday in the given month; throws if not found
 *
 * @param year	The year
 * @param month	the month 1-12
 * @param weekDay	the desired week day
 * @param dayInstance	the desired week day instance, n
 * @return the first occurrence of the week day in the month
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 * @throws timezonecomplete.Arugment.DayInstance for invalid day instance (not 1-5)
 * @throws timezonecomplete.NotFound if the month has no such instance (i.e. 5th instance, where only 4 exist)
 */
export function nthWeekDayOfMonth(year: number, month: number, weekDay: WeekDay, dayInstance: number): number {
	assert(Number.isInteger(year), "Argument.Year", `Year out of range: ${year}`);
	assert(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", `Month out of range: ${month}`);
	assert(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", `weekDay out of range: ${weekDay}`);
	assert(Number.isInteger(dayInstance) && dayInstance >= 1 && dayInstance <= 5, "Argument.DayInstance", `dayInstance out of range: ${dayInstance}`);

	const beginOfMonth: TimeStruct = new TimeStruct({ year, month, day: 1 });
	const beginOfMonthWeekDay = weekDayNoLeapSecs(beginOfMonth.unixMillis);
	let diff: number = weekDay - beginOfMonthWeekDay;
	if (diff < 0) {
		diff += 7;
	}
	diff += (dayInstance - 1) * 7;

	assert(beginOfMonth.components.day + diff <= daysInMonth(year, month), "NotFound", "The given month has no such day");
	return beginOfMonth.components.day + diff;
}

/**
 * Returns the day-of-month that is on the given weekday and which is >= the given day; throws if not found
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 * @throws timezonecomplete.NotFound if the month has no such day
 */
export function weekDayOnOrAfter(year: number, month: number, day: number, weekDay: WeekDay): number {
	assert(Number.isInteger(year), "Argument.Year", `Year out of range: ${year}`);
	assert(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", `Month out of range: ${month}`);
	assert(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
	assert(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", `weekDay out of range: ${weekDay}`);
	const start: TimeStruct = new TimeStruct({ year, month, day });
	const startWeekDay: WeekDay = weekDayNoLeapSecs(start.unixMillis);
	let diff: number = weekDay - startWeekDay;
	if (diff < 0) {
		diff += 7;
	}
	assert(start.components.day + diff <= daysInMonth(year, month), "NotFound", "The given month has no such weekday");
	return start.components.day + diff;
}

/**
 * Returns the day-of-month that is on the given weekday and which is <= the given day.
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.WeekDay for invalid week day
 * @throws timezonecomplete.NotFound if the month has no such day
 */
export function weekDayOnOrBefore(year: number, month: number, day: number, weekDay: WeekDay): number {
	assert(Number.isInteger(year), "Argument.Year", `Year out of range: ${year}`);
	assert(Number.isInteger(month) && month >= 1 && month <= 12, "Argument.Month", `Month out of range: ${month}`);
	assert(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
	assert(Number.isInteger(weekDay) && weekDay >= 0 && weekDay <= 6, "Argument.WeekDay", `weekDay out of range: ${weekDay}`);
	const start: TimeStruct = new TimeStruct({ year, month, day });
	const startWeekDay: WeekDay = weekDayNoLeapSecs(start.unixMillis);
	let diff: number = weekDay - startWeekDay;
	if (diff > 0) {
		diff -= 7;
	}
	assert(start.components.day + diff >= 1, "NotFound", "The given month has no such weekday");
	return start.components.day + diff;
}

/**
 * The week of this month. There is no official standard for this, but we assume the same rules for the weekNumber:
 * week 1 is the week that has the 4th day of the month in it
 *
 * @param year The year
 * @param month The month [1-12]
 * @param day The day [1-31]
 * @return Week number [1-5]
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
export function weekOfMonth(year: number, month: number, day: number): number {
	// rely on year/month validation in firstWeekDayOfMonth
	assert(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
	const firstThursday = firstWeekDayOfMonth(year, month, WeekDay.Thursday);
	const firstMonday = firstWeekDayOfMonth(year, month, WeekDay.Monday);
	// Corner case: check if we are in week 1 or last week of previous month
	if (day < firstMonday) {
		if (firstThursday < firstMonday) {
			// Week 1
			return 1;
		} else {
			// Last week of previous month
			if (month > 1) {
				// Default case
				return weekOfMonth(year, month - 1, daysInMonth(year, month - 1));
			} else {
				// January
				return weekOfMonth(year - 1, 12, 31);
			}
		}
	}

	const lastMonday = lastWeekDayOfMonth(year, month, WeekDay.Monday);
	const lastThursday = lastWeekDayOfMonth(year, month, WeekDay.Thursday);
	// Corner case: check if we are in last week or week 1 of previous month
	if (day >= lastMonday) {
		if (lastMonday > lastThursday) {
			// Week 1 of next month
			return 1;
		}
	}

	// Normal case
	let result = Math.floor((day - firstMonday) / 7) + 1;
	if (firstThursday < 4) {
		result += 1;
	}

	return result;
}

/**
 * The week of this month, based on counting calendar weeks. Unlike weekOfMonth() the first day of the month is
 * always week 1, and no days count as the last week of the previous month. The week number returned can be from 1-6,
 * as a month can span up to 6 different weeks on the calendar. The first day of the week, i.e. when the week number
 * increases, is customizable, and defaults to Monday.
 *
 * @param year The year
 * @param month The month [1-12]
 * @param day The day [1-31]
 * @param weekStartDay The week day to use as the start of the week
 * @return Week number [1-6]
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
export function calendarWeekInMonth(year: number, month: number, day: number, weekStartDay: WeekDay = WeekDay.Monday): number {
	// rely on year/month validation in weekDayOnOrAfter
	assert(Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month), "Argument.Day", "day out of range");
	const firstFullWeekStartDay: number = weekDayOnOrAfter(year, month, 1, weekStartDay);
	let result = Math.floor((day - firstFullWeekStartDay + 7) / 7 );
	if (firstFullWeekStartDay > 1) {
		result++;
	}
	return result;
}

/**
 * Returns the weekday instance number in the month for the given date
 *
 * @param year The year
 * @param month The month [1-12]
 * @param day The day [1-31]
 * @return Instance number [1-5]
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
export function weekDayInstanceInMonth(year: number, month: number, day: number): number {
	// rely on year/month validation in firstWeekDayOfMonth
	const weekDay = weekDayNoLeapSecs(new TimeStruct({ year, month, day }).unixMillis);
	const firstInstanceOfDay = firstWeekDayOfMonth(year, month, weekDay);
	const result = ((day - firstInstanceOfDay) / 7) + 1;
	return result;
}

/**
 * Returns the day-of-year of the Monday of week 1 in the given year.
 * Note that the result may lie in the previous year, in which case it
 * will be (much) greater than 4
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 */
function getWeekOneDayOfYear(year: number): number {
	// relay on weekDayOnOrAfter for year validation
	// first monday of January, minus one because we want day-of-year
	let result: number = weekDayOnOrAfter(year, 1, 1, WeekDay.Monday) - 1;
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
 * @return Week number 1-53
 * @throws timezonecomplete.Argument.Year for invalid year (non-integer)
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 */
export function weekNumber(year: number, month: number, day: number): number {
	const doy = dayOfYear(year, month, day);

	// check end-of-year corner case: may be week 1 of next year
	if (doy >= dayOfYear(year, 12, 29)) {
		const nextYearWeekOne = getWeekOneDayOfYear(year + 1);
		if (nextYearWeekOne > 4 && nextYearWeekOne <= doy) {
			return 1;
		}
	}

	// check beginning-of-year corner case
	const thisYearWeekOne = getWeekOneDayOfYear(year);
	if (thisYearWeekOne > 4) {
		// week 1 is at end of last year
		const weekTwo = thisYearWeekOne + 7 - daysInYear(year - 1);
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

/**
 * Convert a unix milli timestamp into a TimeT structure.
 * This does NOT take leap seconds into account.
 * @throws timezonecomplete.Argument.UnixMillis for non-integer `unixMillis` parameter
 */
export function unixToTimeNoLeapSecs(unixMillis: number): TimeComponents {
	assert(Number.isInteger(unixMillis), "Argument.UnixMillis", "unixMillis should be an integer number");

	let temp: number = unixMillis;
	const result: TimeComponents = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0, milli: 0 };
	let year: number;
	let month: number;

	if (unixMillis >= 0) {
		result.milli = math.positiveModulo(temp, 1000);
		temp = Math.floor(temp / 1000);
		result.second = math.positiveModulo(temp, 60);
		temp = Math.floor(temp / 60);
		result.minute = math.positiveModulo(temp, 60);
		temp = Math.floor(temp / 60);
		result.hour = math.positiveModulo(temp, 24);
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
 * Fill you any missing time component parts, defaults are 1970-01-01T00:00:00.000
 * @throws timezonecomplete.Argument.Year for invalid year
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.Hour for invalid hour
 * @throws timezonecomplete.Argument.Minute for invalid minute
 * @throws timezonecomplete.Argument.Second for invalid second
 * @throws timezonecomplete.Argument.Milli for invalid milliseconds
 */
function normalizeTimeComponents(components: TimeComponentOpts): TimeComponents {
	const input = {
		year: typeof components.year === "number" ? components.year : 1970,
		month: typeof components.month === "number" ? components.month : 1,
		day: typeof components.day === "number" ? components.day : 1,
		hour: typeof components.hour === "number" ? components.hour : 0,
		minute: typeof components.minute === "number" ? components.minute : 0,
		second: typeof components.second === "number" ? components.second : 0,
		milli: typeof components.milli === "number" ? components.milli : 0,
	};
	assert(Number.isInteger(input.year), "Argument.Year", `invalid year ${input.year}`);
	assert(Number.isInteger(input.month) && input.month >= 1 && input.month <= 12, "Argument.Month", `invalid month ${input.month}`);
	assert(
		Number.isInteger(input.day) && input.day >= 1 && input.day <= daysInMonth(input.year, input.month), "Argument.Day",
		`invalid day ${input.day}`
	);
	assert(Number.isInteger(input.hour) && input.hour >= 0 && input.hour <= 23, "Argument.Hour", `invalid hour ${input.hour}`);
	assert(Number.isInteger(input.minute) && input.minute >= 0 && input.minute <= 59, "Argument.Minute", `invalid minute ${input.minute}`);
	assert(Number.isInteger(input.second) && input.second >= 0 && input.second <= 59, "Argument.Second", `invalid second ${input.second}`);
	assert(Number.isInteger(input.milli) && input.milli >= 0 && input.milli <= 999, "Argument.Milli", `invalid milli ${input.milli}`);
	return input;
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
 * @throws timezonecomplete.Argument.Year for invalid year
 * @throws timezonecomplete.Argument.Month for invalid month
 * @throws timezonecomplete.Argument.Day for invalid day of month
 * @throws timezonecomplete.Argument.Hour for invalid hour
 * @throws timezonecomplete.Argument.Minute for invalid minute
 * @throws timezonecomplete.Argument.Second for invalid second
 * @throws timezonecomplete.Argument.Milli for invalid milliseconds
 */
export function timeToUnixNoLeapSecs(
	year: number, month: number, day: number, hour: number, minute: number, second: number, milli: number
): number;
export function timeToUnixNoLeapSecs(components: TimeComponentOpts): number;
export function timeToUnixNoLeapSecs(
	a: TimeComponentOpts | number, month?: number, day?: number, hour?: number, minute?: number, second?: number, milli?: number
): number {
	const components: TimeComponentOpts = (typeof a === "number" ? { year: a, month, day, hour, minute, second, milli } : a);
	const input: TimeComponents = normalizeTimeComponents(components);
	return input.milli + 1000 * (
		input.second + input.minute * 60 + input.hour * 3600 + dayOfYear(input.year, input.month, input.day) * 86400 +
		(input.year - 1970) * 31536000 + Math.floor((input.year - 1969) / 4) * 86400 -
		Math.floor((input.year - 1901) / 100) * 86400 + Math.floor((input.year - 1900 + 299) / 400) * 86400);
}

/**
 * Return the day-of-week.
 * This does NOT take leap seconds into account.
 * @throws timezonecomplete.Argument.UnixMillis for invalid `unixMillis` argument
 */
export function weekDayNoLeapSecs(unixMillis: number): WeekDay {
	assert(Number.isInteger(unixMillis), "Argument.UnixMillis", "unixMillis should be an integer number");

	const epochDay: WeekDay = WeekDay.Thursday;
	const days = Math.floor(unixMillis / 1000 / 86400);
	return math.positiveModulo(epochDay + days, 7);
}

/**
 * N-th second in the day, counting from 0
 * @throws timezonecomplete.Argument.Hour for invalid hour
 * @throws timezonecomplete.Argument.Minute for invalid minute
 * @throws timezonecomplete.Argument.Second for invalid second
 */
export function secondOfDay(hour: number, minute: number, second: number): number {
	assert(Number.isInteger(hour) && hour >= 0 && hour <= 23, "Argument.Hour", `invalid hour ${hour}`);
	assert(Number.isInteger(minute) && minute >= 0 && minute <= 59, "Argument.Minute", `invalid minute ${minute}`);
	assert(Number.isInteger(second) && second >= 0 && second <= 61, "Argument.Second", `invalid second ${second}`);
	return (((hour * 60) + minute) * 60) + second;
}

/**
 * Basic representation of a date and time
 */
export class TimeStruct {

	/**
	 * Returns a TimeStruct from the given year, month, day etc
	 *
	 * @param year	Year e.g. 1970
	 * @param month	Month 1-12
	 * @param day	Day 1-31
	 * @param hour	Hour 0-23
	 * @param minute	Minute 0-59
	 * @param second	Second 0-59 (no leap seconds)
	 * @param milli	Millisecond 0-999
	 * @throws timezonecomplete.Argument.Year for invalid year
	 * @throws timezonecomplete.Argument.Month for invalid month
	 * @throws timezonecomplete.Argument.Day for invalid day of month
	 * @throws timezonecomplete.Argument.Hour for invalid hour
	 * @throws timezonecomplete.Argument.Minute for invalid minute
	 * @throws timezonecomplete.Argument.Second for invalid second
	 * @throws timezonecomplete.Argument.Milli for invalid milliseconds
	 */
	public static fromComponents(
		year?: number, month?: number, day?: number,
		hour?: number, minute?: number, second?: number, milli?: number
	): TimeStruct {
		return new TimeStruct({ year, month, day, hour, minute, second, milli });
	}

	/**
	 * Create a TimeStruct from a number of unix milliseconds
	 * (backward compatibility)
	 * @throws timezonecomplete.Argument.UnixMillis for non-integer milliseconds
	 */
	public static fromUnix(unixMillis: number): TimeStruct {
		return new TimeStruct(unixMillis);
	}

	/**
	 * Create a TimeStruct from a JavaScript date
	 *
	 * @param d	The date
	 * @param df Which functions to take (getX() or getUTCX())
	 * @throws nothing
	 */
	public static fromDate(d: Date, df: DateFunctions): TimeStruct {
		if (df === DateFunctions.Get) {
			return new TimeStruct({
				year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
				hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), milli: d.getMilliseconds()
			});
		} else {
			return new TimeStruct({
				year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(),
				hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(), milli: d.getUTCMilliseconds()
			});
		}
	}

	/**
	 * Returns a TimeStruct from an ISO 8601 string WITHOUT time zone
	 * @throws timezonecomplete.Argument.S if `s` is not a proper iso string
	 */
	public static fromString(s: string): TimeStruct {
		try {
			let year: number = 1970;
			let month: number = 1;
			let day: number = 1;
			let hour: number = 0;
			let minute: number = 0;
			let second: number = 0;
			let fractionMillis: number = 0;
			let lastUnit: TimeUnit = TimeUnit.Year;

			// separate any fractional part
			const split: string[] = s.trim().split(".");
			assert(split.length >= 1 && split.length <= 2, "Argument.S", "Empty string or multiple dots.");

			// parse main part
			const isBasicFormat = (s.indexOf("-") === -1);
			if (isBasicFormat) {
				assert(split[0].match(/^((\d)+)|(\d\d\d\d\d\d\d\dT(\d)+)$/), "Argument.S",
					"ISO string in basic notation may only contain numbers before the fractional part");

				// remove any "T" separator
				split[0] = split[0].replace("T", "");

				assert([4, 8, 10, 12, 14].indexOf(split[0].length) !== -1, "Argument.S",
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
				assert(split[0].match(/^\d\d\d\d(-\d\d-\d\d((T)?\d\d(\:\d\d(:\d\d)?)?)?)?$/), "Argument.S", "Invalid ISO string");
				let dateAndTime: string[] = [];
				if (s.indexOf("T") !== -1) {
					dateAndTime = split[0].split("T");
				} else if (s.length > 10) {
					dateAndTime = [split[0].substr(0, 10), split[0].substr(10)];
				} else {
					dateAndTime = [split[0], ""];
				}
				assert([4, 10].indexOf(dateAndTime[0].length) !== -1, "Argument.S",
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
				const fraction: number = parseFloat("0." + split[1]);
				switch (lastUnit) {
					case TimeUnit.Year:
						fractionMillis = daysInYear(year) * 86400000 * fraction;
						break;
					case TimeUnit.Day:
						fractionMillis = 86400000 * fraction;
						break;
					case TimeUnit.Hour:
						fractionMillis = 3600000 * fraction;
						break;
					case TimeUnit.Minute:
						fractionMillis = 60000 * fraction;
						break;
					case TimeUnit.Second:
						fractionMillis = 1000 * fraction;
						break;
				}
			}

			// combine main and fractional part
			year = math.roundSym(year);
			month = math.roundSym(month);
			day = math.roundSym(day);
			hour = math.roundSym(hour);
			minute = math.roundSym(minute);
			second = math.roundSym(second);
			let unixMillis: number = timeToUnixNoLeapSecs({ year, month, day, hour, minute, second });
			unixMillis = math.roundSym(unixMillis + fractionMillis);
			return new TimeStruct(unixMillis);
		} catch (e) {
			if (errorIs(e, [
				"Argument.S", "Argument.Year", "Argument.Month", "Argument.Day", "Argument.Hour",
				"Argument.Minute", "Argument.Second", "Argument.Milli"
			])) {
				return throwError("Argument.S", `Invalid ISO 8601 string: "${s}": ${e.message}`);
			} else {
				throw e; // programming error
			}
		}
	}

	/**
	 * The time value in unix milliseconds
	 */
	private _unixMillis: number;
	public get unixMillis(): number {
		if (this._unixMillis === undefined) {
			this._unixMillis = timeToUnixNoLeapSecs(this._components);
		}
		return this._unixMillis;
	}

	/**
	 * The time value in separate year/month/... components
	 */
	private _components: TimeComponents;
	public get components(): TimeComponents {
		if (!this._components) {
			this._components = unixToTimeNoLeapSecs(this._unixMillis);
		}
		return this._components;
	}

	/**
	 * Constructor
	 *
	 * @param unixMillis milliseconds since 1-1-1970
	 * @throws timezonecomplete.Argument.UnixMillis for non-integer unixMillis
	 */
	constructor(unixMillis: number);
	/**
	 * Constructor
	 *
	 * @param components Separate timestamp components (year, month, ...)
	 * @throws timezonecomplete.Argument.Components if `components` is not an object
	 * @throws timezonecomplete.Argument.* for invalid components (* = Year, Month, Day, Hour, Minute, Second, Milli)
	 */
	constructor(components: TimeComponentOpts);
	/**
	 * Constructor implementation
	 */
	constructor(a: number | TimeComponentOpts) {
		if (typeof a === "number") {
			assert(Number.isInteger(a), "Argument.UnixMillis", `invalid unix millis ${a}`);
			this._unixMillis = a;
		} else {
			assert(typeof a === "object" && a !== null, "Argument.Components", "invalid components object");
			this._components = normalizeTimeComponents(a);
		}
	}

	get year(): number {
		return this.components.year;
	}

	get month(): number {
		return this.components.month;
	}

	get day(): number {
		return this.components.day;
	}

	get hour(): number {
		return this.components.hour;
	}

	get minute(): number {
		return this.components.minute;
	}

	get second(): number {
		return this.components.second;
	}

	get milli(): number {
		return this.components.milli;
	}

	/**
	 * The day-of-year 0-365
	 * @throws nothing
	 */
	public yearDay(): number {
		return dayOfYear(this.components.year, this.components.month, this.components.day);
	}

	/**
	 * Equality function
	 * @param other
	 * @throws TypeError if other is not an Object
	 */
	public equals(other: TimeStruct): boolean {
		return this.valueOf() === other.valueOf();
	}

	/**
	 * @throws nothing
	 */
	public valueOf(): number {
		return this.unixMillis;
	}

	/**
	 * @throws nothing
	 */
	public clone(): TimeStruct {
		if (this._components) {
			return new TimeStruct(this._components);
		} else {
			return new TimeStruct(this._unixMillis);
		}
	}

	/**
	 * Validate a timestamp. Filters out non-existing values for all time components
	 * @returns true iff the timestamp is valid
	 * @throws nothing
	 */
	public validate(): boolean {
		if (this._components) {
			return this.components.month >= 1 && this.components.month <= 12
				&& this.components.day >= 1 && this.components.day <= daysInMonth(this.components.year, this.components.month)
				&& this.components.hour >= 0 && this.components.hour <= 23
				&& this.components.minute >= 0 && this.components.minute <= 59
				&& this.components.second >= 0 && this.components.second <= 59
				&& this.components.milli >= 0 && this.components.milli <= 999;
		} else {
			return true;
		}
	}

	/**
	 * ISO 8601 string YYYY-MM-DDThh:mm:ss.nnn
	 * @throws nothing
	 */
	public toString(): string {
		return strings.padLeft(this.components.year.toString(10), 4, "0")
			+ "-" + strings.padLeft(this.components.month.toString(10), 2, "0")
			+ "-" + strings.padLeft(this.components.day.toString(10), 2, "0")
			+ "T" + strings.padLeft(this.components.hour.toString(10), 2, "0")
			+ ":" + strings.padLeft(this.components.minute.toString(10), 2, "0")
			+ ":" + strings.padLeft(this.components.second.toString(10), 2, "0")
			+ "." + strings.padLeft(this.components.milli.toString(10), 3, "0");
	}
}


/**
 * Binary search
 * @param array Array to search
 * @param compare Function that should return < 0 if given element is less than searched element etc
 * @returns The insertion index of the element to look for
 * @throws TypeError if arr is not an array
 * @throws whatever `compare()` throws
 */
export function binaryInsertionIndex<T>(arr: T[], compare: (a: T) => number): number {
	let minIndex = 0;
	let maxIndex = arr.length - 1;
	let currentIndex: number;
	let currentElement: T;
	// no array / empty array
	if (!arr) {
		return 0;
	}
	if (arr.length === 0) {
		return 0;
	}
	// out of bounds
	if (compare(arr[0]) > 0) {
		return 0;
	}
	if (compare(arr[maxIndex]) < 0) {
		return maxIndex + 1;
	}
	// element in range
	while (minIndex <= maxIndex) {
		currentIndex = Math.floor((minIndex + maxIndex) / 2);
		currentElement = arr[currentIndex];

		if (compare(currentElement) < 0) {
			minIndex = currentIndex + 1;
		} else if (compare(currentElement) > 0) {
			maxIndex = currentIndex - 1;
		} else {
			return currentIndex;
		}
	}

	return maxIndex;
}

