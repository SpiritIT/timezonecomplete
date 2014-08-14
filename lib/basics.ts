﻿/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

import math = require("./math");
import strings = require("./strings");


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
			assert(false, "Invalid month: " + month);
			/* istanbul ignore next */
			return 0;
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
 * Basic representation of a date and time
 */
export class TimeStruct {

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
		 * Seconds, 0-61 (60, 61 for leap seconds)
		 */
		public second: number = 0,

		/**
		 * Milliseconds 0-999
		 */
		public milli: number = 0
		) {
		assert(this.validate(), "Invalid arguments");
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
			&& typeof (this.second) === "number" && !isNaN(this.second) && math.isInt(this.second) && this.second >= 0 && this.second <= 61
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

	public clone(): TimeStruct {
		return new TimeStruct(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
	}

	public toString(): string {
		return strings.isoString(this.year, this.month, this.day, this.hour, this.minute, this.second, this.milli);
	}

	public inspect(): string {
		return "[TimeStruct: " + this.toString() + "]";
	}

}

function assertUnixTimestamp(unixMillis: number): void {
	assert(typeof (unixMillis) === "number", "number input expected");
	assert(!isNaN(unixMillis), "NaN not expected as input");
	assert(math.isInt(unixMillis), "integer number expected");
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
		result.milli = ((temp % 1000) + 1000) % 1000;
		temp = Math.floor(temp / 1000);
		result.second = ((temp % 60) + 60) % 60;
		temp = Math.floor(temp / 60);
		result.minute = ((temp % 60) + 60) % 60;
		temp = Math.floor(temp / 60);
		result.hour = ((temp % 24) + 24) % 24;
		temp = Math.floor(temp / 24);

		year = 1969;
		while (temp <= -daysInYear(year)) {
			temp += daysInYear(year);
			year--;
		}
		result.year = year;

		month = 12;
		while (temp <= -daysInMonth(year, month)) {
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
	a: any = 0, month: number = 1, day: number = 1,
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
	Second,
	Minute,
	Hour,
	Day,
	Week,
	Month,
	Year
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
