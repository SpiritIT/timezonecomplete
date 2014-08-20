/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Time zone representation and offset calculation
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

import basics = require("./basics");
import TimeStruct = basics.TimeStruct;

import javascript = require("./javascript");
import DateFunctions = javascript.DateFunctions;

import strings = require("./strings");

import tzDatabase = require("./tz-database");
import TzDatabase = tzDatabase.TzDatabase;

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
 * Option for TimeZone#normalizeLocal()
 */
export enum NormalizeOption {
	/**
	 * Normalize non-existing times by ADDING the DST offset
	 */
	Up,
	/**
	 * Normalize non-existing times by SUBTRACTING the DST offset
	 */
	Down
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
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("TimeZone.zone(): Unexpected argument type \"" + typeof (a) + "\"");
				}
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
		} else if (name.charAt(0) === "+" || name.charAt(0) === "-" || name.charAt(0).match(/\d/) || name === "Z") {
			this._kind = TimeZoneKind.Offset;
			this._offset = TimeZone.stringToOffset(name);
		} else {
			this._kind = TimeZoneKind.Proper;
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
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("Unknown time zone kind.");
				}
		}
	}

	/**
	 * Is this zone equivalent to UTC?
	 */
	public isUtc(): boolean {
		switch (this._kind) {
			case TimeZoneKind.Local: return false;
			case TimeZoneKind.Offset: return (this._offset === 0);
			case TimeZoneKind.Proper: return (TzDatabase.instance().zoneIsUtc(this._name));
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					return false;
				}
		}

	}

	/**
	 * Does this zone have Daylight Saving Time at all?
	 */
	public hasDst(): boolean {
		switch (this._kind) {
			case TimeZoneKind.Local: return false;
			case TimeZoneKind.Offset: return false;
			case TimeZoneKind.Proper: return (TzDatabase.instance().hasDst(this._name));
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					return false;
				}
		}

	}

	/**
	 * Calculate timezone offset from a UTC time.
	 *
	 * @param year Full year
	 * @param month Month 1-12 (note this deviates from JavaScript date)
	 * @param day Day of month 1-31
	 * @param hour Hour 0-23
	 * @param minute Minute 0-59
	 * @param second Second 0-59
	 * @param millisecond Millisecond 0-999
	 *
	 * @return the offset of this time zone with respect to UTC at the given time, in minutes.
	 */
	public offsetForUtc(
		year: number, month: number, day: number,
		hour: number = 0, minute: number = 0, second: number = 0,
		millisecond: number = 0): number {
		assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
		assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
		assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
		assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
		assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  second out of range.");
		assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
		switch (this._kind) {
			case TimeZoneKind.Local: {
				var date: Date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
				return -1 * date.getTimezoneOffset();
			}
			case TimeZoneKind.Offset: {
				return this._offset;
			}
			case TimeZoneKind.Proper: {
				var tm: TimeStruct = new TimeStruct(year, month, day, hour, minute, second, millisecond);
				return TzDatabase.instance().totalOffset(this._name, tm.toUnixNoLeapSecs()).minutes();
			}
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
				}
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
	 * @return the offset of this time zone with respect to UTC at the given time, in minutes.
	 */
	public offsetForZone(
		year: number, month: number, day: number,
		hour: number = 0, minute: number = 0, second: number = 0,
		millisecond: number = 0): number {
		assert(month > 0 && month < 13, "TimeZone.offsetForZone():  month out of range: " + month);
		assert(day > 0 && day < 32, "TimeZone.offsetForZone():  day out of range.");
		assert(hour >= 0 && hour < 24, "TimeZone.offsetForZone():  hour out of range.");
		assert(minute >= 0 && minute < 60, "TimeZone.offsetForZone():  minute out of range.");
		assert(second >= 0 && second < 60, "TimeZone.offsetForZone():  second out of range.");
		assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForZone():  millisecond out of range.");
		switch (this._kind) {
			case TimeZoneKind.Local: {
				var date: Date = new Date(year, month - 1, day, hour, minute, second, millisecond);
				return -1 * date.getTimezoneOffset();
			}
			case TimeZoneKind.Offset: {
				return this._offset;
			}
			case TimeZoneKind.Proper: {
				// note that TzDatabase normalizes the given date so we don't have to do it
				var tm: TimeStruct = new TimeStruct(year, month, day, hour, minute, second, millisecond);
				return TzDatabase.instance().totalOffsetLocal(this._name, tm.toUnixNoLeapSecs()).minutes();
			}
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
				}
		}
	}

	/**
	 * Note: will be removed in version 2.0.0
	 *
	 * Convenience function, takes values from a Javascript Date
	 * Calls offsetForUtc() with the contents of the date
	 *
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
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("Unknown DateFunctions value");
				}
		}
	}

	/**
	 * Note: will be removed in version 2.0.0
	 *
	 * Convenience function, takes values from a Javascript Date
	 * Calls offsetForUtc() with the contents of the date
	 *
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
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("Unknown DateFunctions value");
				}
		}
	}

	/**
	 * Zone abbreviation at given UTC timestamp e.g. CEST for Central European Summer Time.
	 *
	 * @param year Full year
	 * @param month Month 1-12 (note this deviates from JavaScript date)
	 * @param day Day of month 1-31
	 * @param hour Hour 0-23
	 * @param minute Minute 0-59
	 * @param second Second 0-59
	 * @param millisecond Millisecond 0-999
	 * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
	 *
	 * @return "local" for local timezone, the offset for an offset zone, or the abbreviation for a proper zone.
	 */
	public abbreviationForUtc(year: number, month: number, day: number,
		hour: number = 0, minute: number = 0, second: number = 0,
		millisecond: number = 0, dstDependent: boolean = true): string {
		assert(month > 0 && month < 13, "TimeZone.offsetForUtc():  month out of range.");
		assert(day > 0 && day < 32, "TimeZone.offsetForUtc():  day out of range.");
		assert(hour >= 0 && hour < 24, "TimeZone.offsetForUtc():  hour out of range.");
		assert(minute >= 0 && minute < 60, "TimeZone.offsetForUtc():  minute out of range.");
		assert(second >= 0 && second < 60, "TimeZone.offsetForUtc():  second out of range.");
		assert(millisecond >= 0 && millisecond < 1000, "TimeZone.offsetForUtc():  millisecond out of range.");
		switch (this._kind) {
			case TimeZoneKind.Local: {
				return "local";
			}
			case TimeZoneKind.Offset: {
				return this.toString();
			}
			case TimeZoneKind.Proper: {
				var tm: TimeStruct = new TimeStruct(year, month, day, hour, minute, second, millisecond);
				return TzDatabase.instance().abbreviation(this._name, tm.toUnixNoLeapSecs(), dstDependent);
			}
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("Unknown TimeZoneKind \"" + TimeZoneKind[this._kind] + "\"");
				}
		}
	}

	/**
	 * Normalizes non-existing local times by adding a forward offset change.
	 * During a forward standard offset change or DST offset change, some amount of
	 * local time is skipped. Therefore, this amount of local time does not exist.
	 * This function adds the amount of forward change to any non-existing time. After all,
	 * this is probably what the user meant.
	 *
	 * @param localUnixMillis	Unix timestamp in zone time
	 * @param opt	(optional) Round up or down? Default: up
	 *
	 * @returns	Unix timestamp in zone time, normalized.
	 */
	public normalizeZoneTime(localUnixMillis: number, opt: NormalizeOption = NormalizeOption.Up): number {
		if (this.kind() === TimeZoneKind.Proper) {
			var tzopt: tzDatabase.NormalizeOption =
				(opt === NormalizeOption.Down ? tzDatabase.NormalizeOption.Down : tzDatabase.NormalizeOption.Up);
			return TzDatabase.instance().normalizeLocal(this._name, localUnixMillis, tzopt);
		} else {
			return localUnixMillis;
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

}



