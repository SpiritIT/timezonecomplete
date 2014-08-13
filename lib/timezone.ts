/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time zone representation and offset calculation
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

import javascript = require("./javascript");
import DateFunctions = javascript.DateFunctions;

import strings = require("./strings");

import timezoneJS = require("timezone-js");
// timezone-js initialization
/* tslint:disable:no-var-requires */
var timezoneData: Object = require("./timezone-data.json");
/* tslint:enable:no-var-requires */
// need to preload all names in order to validate them
timezoneJS.timezone.loadingScheme = timezoneJS.timezone.loadingSchemes.MANUAL_LOAD;
timezoneJS.timezone.loadZoneDataFromObject(timezoneData);

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
				this._date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
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
		return sign + strings.padLeft(hours.toString(10), 2, "0") + ":" + strings.padLeft(minutes.toString(10), 2, "0");
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



