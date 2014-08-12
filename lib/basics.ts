/**
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
export function daysInYear(year: number) {
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

export function isInt(n: number): boolean {
	if (typeof (n) !== "number") {
		return false;
	}
	if (isNaN(n)) {
		return false;
	}
	return (Math.floor(n) === n);
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
		return (typeof (this.year) === "number" && !isNaN(this.year) && isInt(this.year) && this.year >= 1970
			&& typeof (this.month) === "number" && !isNaN(this.month) && isInt(this.month) && this.month >= 1 && this.month <= 12
			&& typeof (this.day) === "number" && !isNaN(this.day) && isInt(this.day) && this.day >= 1
				&& this.day <= daysInMonth(this.year, this.month)
			&& typeof (this.hour) === "number" && !isNaN(this.hour) && isInt(this.hour) && this.hour >= 0 && this.hour <= 23
			&& typeof (this.minute) === "number" && !isNaN(this.minute) && isInt(this.minute) && this.minute >= 0 && this.minute <= 59
			&& typeof (this.second) === "number" && !isNaN(this.second) && isInt(this.second) && this.second >= 0 && this.second <= 61
			&& typeof (this.milli) === "number" && !isNaN(this.milli) && isInt(this.milli) && this.milli >= 0
			&& this.milli <= 999
			);
	}

	/**
	 * The day-of-year 0-365
	 */
	public yearDay(): number {
		assert(this.validate(), "Invalid TimeStruct value");
		var yearDay: number = 0;
		for (var i: number = 1; i < this.month; i++) {
			yearDay += daysInMonth(this.year, i);
		}
		yearDay += (this.day - 1);
		return yearDay;
	}

}

function assertUnixTimestamp(unixMillis: number): void {
	assert(typeof (unixMillis) === "number", "number input expected");
	assert(!isNaN(unixMillis), "NaN not expected as input");
	assert(isInt(unixMillis), "integer number expected");
	assert(unixMillis >= 0, "Unix timestamps before 1970 cannot be converted.");
}

/**
 * Convert a unix milli timestamp into a TimeT structure.
 * This does NOT take leap seconds into account.
 */
export function unixToTimeNoLeapSecs(unixMillis: number): TimeStruct {
	assertUnixTimestamp(unixMillis);

	var temp: number = unixMillis;
	var result: TimeStruct = new TimeStruct();

	result.milli = temp % 1000;
	temp = Math.floor(temp / 1000);
	result.second = temp % 60;
	temp = Math.floor(temp / 60);
	result.minute = temp % 60;
	temp = Math.floor(temp / 60);
	result.hour = temp % 24;
	temp = Math.floor(temp / 24);

	var year = 1970;
	while (temp >= daysInYear(year)) {
		temp -= daysInYear(year);
		year++;
	}
	result.year = year;

	var month = 1;
	while (temp >= daysInMonth(year, month)) {
		temp -= daysInMonth(year, month);
		month++;
	}
	result.month = month;
	result.day = temp + 1;

	return result;
}

/**
 * Convert a TimeT structure into a unix milli timestamp.
 * This does NOT take leap seconds into account.
 */
export function timeToUnixNoLeapSecs(tm: TimeStruct): number {
	assert(tm.validate(), "tm invalid");
	return tm.milli + 1000 * (
		tm.second + tm.minute * 60 + tm.hour * 3600 + tm.yearDay() * 86400 +
		(tm.year - 1970) * 31536000 + Math.floor((tm.year - 1969) / 4) * 86400 -
		Math.floor((tm.year - 1901) / 100) * 86400 + Math.floor((tm.year -1900 + 299) / 400) * 86400);
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
	Friday
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

