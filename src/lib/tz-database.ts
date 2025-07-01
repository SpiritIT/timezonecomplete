/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Olsen Timezone Database container
 *
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 */

"use strict";

import assert from "./assert";
import { TimeStruct, TimeUnit, WeekDay } from "./basics";
import * as basics from "./basics";
import { Duration, hours } from "./duration";
import { error, errorIs, throwError } from "./error";
import * as math from "./math";

/**
 * Type of rule TO column value
 */
export enum ToType {
	/**
	 * Either a year number or "only"
	 */
	Year,
	/**
	 * "max"
	 */
	Max
}

/**
 * Type of rule ON column value
 */
export enum OnType {
	/**
	 * Day-of-month number
	 */
	DayNum,
	/**
	 * "lastSun" or "lastWed" etc
	 */
	LastX,
	/**
	 * e.g. "Sun>=8"
	 */
	GreqX,
	/**
	 * e.g. "Sun<=8"
	 */
	LeqX
}

export enum AtType {
	/**
	 * Local time (no DST)
	 */
	Standard,
	/**
	 * Wall clock time (local time with DST)
	 */
	Wall,
	/**
	 * Utc time
	 */
	Utc,
}

/**
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 *
 * See http://www.cstdbill.com/tzdb/tz-how-to.html
 */
export class RuleInfo {

	/**
	 * Constructor
	 * @param from
	 * @param toType
	 * @param toYear
	 * @param type
	 * @param inMonth
	 * @param onType
	 * @param onDay
	 * @param onWeekDay
	 * @param atHour
	 * @param atMinute
	 * @param atSecond
	 * @param atType
	 * @param save
	 * @param letter
	 * @throws nothing
	 */
	constructor(
		/**
		 * FROM column year number.
		 */
		public from: number,
		/**
		 * TO column type: Year for year numbers and "only" values, Max for "max" value.
		 */
		public toType: ToType,
		/**
		 * If TO column is a year, the year number. If TO column is "only", the FROM year.
		 */
		public toYear: number,
		/**
		 * TYPE column, not used so far
		 */
		public type: string,
		/**
		 * IN column month number 1-12
		 */
		public inMonth: number,
		/**
		 * ON column type
		 */
		public onType: OnType,
		/**
		 * If onType is DayNum, the day number
		 */
		public onDay: number,
		/**
		 * If onType is not DayNum, the weekday
		 */
		public onWeekDay: WeekDay,
		/**
		 * AT column hour
		 */
		public atHour: number,
		/**
		 * AT column minute
		 */
		public atMinute: number,
		/**
		 * AT column second
		 */
		public atSecond: number,
		/**
		 * AT column type
		 */
		public atType: AtType,
		/**
		 * DST offset from local standard time (NOT from UTC!)
		 */
		public save: Duration,
		/**
		 * Character to insert in %s for time zone abbreviation
		 * Note if TZ database indicates "-" this is the empty string
		 */
		public letter: string
	) {

		if (this.save) {
			this.save = this.save.convert(TimeUnit.Hour);
		}
	}

	/**
	 * Returns true iff this rule is applicable in the year
	 * @throws nothing
	 */
	public applicable(year: number): boolean {
		if (year < this.from) {
			return false;
		}
		switch (this.toType) {
			case ToType.Max: return true;
			case ToType.Year: return (year <= this.toYear);
		}
	}

	/**
	 * Sort comparison
	 * @return (first effective date is less than other's first effective date)
	 * @throws timezonecomplete.InvalidTimeZoneData if this rule depends on a weekday and the weekday in question doesn't exist
	 */
	public effectiveLess(other: RuleInfo): boolean {
		if (this.from < other.from) {
			return true;
		}
		if (this.from > other.from) {
			return false;
		}
		if (this.inMonth < other.inMonth) {
			return true;
		}
		if (this.inMonth > other.inMonth) {
			return false;
		}
		if (this.effectiveDate(this.from) < other.effectiveDate(this.from)) {
			return true;
		}
		return false;
	}

	/**
	 * Sort comparison
	 * @return (first effective date is equal to other's first effective date)
	 * @throws timezonecomplete.InvalidTimeZoneData for invalid internal structure of the database
	 */
	public effectiveEqual(other: RuleInfo): boolean {
		if (this.from !== other.from) {
			return false;
		}
		if (this.inMonth !== other.inMonth) {
			return false;
		}
		if (!this.effectiveDate(this.from).equals(other.effectiveDate(this.from))) {
			return false;
		}
		return true;
	}

	/**
	 * Returns the year-relative date that the rule takes effect. Depending on the rule this can be a UTC time, a wall clock time, or a
	 * time in standard offset (i.e. you still need to compensate for this.atType)
	 * @throws timezonecomplete.NotApplicable if this rule is not applicable in the given year
	 */
	public effectiveDate(year: number): TimeStruct {
		assert(this.applicable(year), "timezonecomplete.NotApplicable", "Rule is not applicable in %d", year);
		// year and month are given
		let y = year;
		let m = this.inMonth;
		let d: number = 0;

		// calculate day
		switch (this.onType) {
			case OnType.DayNum: {
				d = this.onDay;
			} break;
			case OnType.GreqX: {
				try {
					d = basics.weekDayOnOrAfter(y, m, this.onDay, this.onWeekDay);
				} catch (e) {
					if (errorIs(e, "NotFound")) {
						// Apr Sun>=27 actually means any sunday after April 27, i.e. it does not have to be in April. Try next month.
						if (m + 1 <= 12) {
							m = m + 1;
						} else {
							m = 1;
							y = y + 1;
						}
						d = basics.firstWeekDayOfMonth(y, m, this.onWeekDay);
					}
				}
			} break;
			case OnType.LeqX: {
				try {
					d = basics.weekDayOnOrBefore(y, m, this.onDay, this.onWeekDay);
				} catch (e) {
					if (errorIs(e, "NotFound")) {
						if (m > 1) {
							m = m - 1;
						} else {
							m = 12;
							y = y - 1;
						}
						d = basics.lastWeekDayOfMonth(y, m, this.onWeekDay);
					}
				}
			} break;
			case OnType.LastX: {
				d = basics.lastWeekDayOfMonth(y, m, this.onWeekDay);
			} break;
		}

		return TimeStruct.fromComponents(y, m, d, this.atHour, this.atMinute, this.atSecond);
	}

	/**
	 * Effective date in UTC in the given year, in a specific time zone
	 * @param year
	 * @param standardOffset the standard offset from UT of the time zone
	 * @param dstOffset the DST offset before the rule
	 */
	public effectiveDateUtc(year: number, standardOffset: Duration, dstOffset: Duration | undefined): TimeStruct {
		const d = this.effectiveDate(year);
		switch (this.atType) {
			case AtType.Utc: return d;
			case AtType.Standard: {
				// transition time is in zone local time without DST
				let millis = d.unixMillis;
				millis -= standardOffset.milliseconds();
				return new TimeStruct(millis);
			}
			case AtType.Wall: {
				// transition time is in zone local time with DST
				let millis = d.unixMillis;
				millis -= standardOffset.milliseconds();
				if (dstOffset) {
					millis -= dstOffset.milliseconds();
				}
				return new TimeStruct(millis);
			}
		}
	}

}

/**
 * Type of reference from zone to rule
 */
export enum RuleType {
	/**
	 * No rule applies
	 */
	None,
	/**
	 * Fixed given offset
	 */
	Offset,
	/**
	 * Reference to a named set of rules
	 */
	RuleName
}

/**
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 *
 * See http://www.cstdbill.com/tzdb/tz-how-to.html
 * First, and somewhat trivially, whereas Rules are considered to contain one or more records, a Zone is considered to
 * be a single record with zero or more continuation lines. Thus, the keyword, “Zone,” and the zone name are not repeated.
 * The last line is the one without anything in the [UNTIL] column.
 * Second, and more fundamentally, each line of a Zone represents a steady state, not a transition between states.
 * The state exists from the date and time in the previous line’s [UNTIL] column up to the date and time in the current line’s
 * [UNTIL] column. In other words, the date and time in the [UNTIL] column is the instant that separates this state from the next.
 * Where that would be ambiguous because we’re setting our clocks back, the [UNTIL] column specifies the first occurrence of the instant.
 * The state specified by the last line, the one without anything in the [UNTIL] column, continues to the present.
 * The first line typically specifies the mean solar time observed before the introduction of standard time. Since there’s no line before
 * that, it has no beginning. 8-) For some places near the International Date Line, the first two lines will show solar times differing by
 * 24 hours; this corresponds to a movement of the Date Line. For example:
 * # Zone	NAME		GMTOFF	RULES	FORMAT	[UNTIL]
 * Zone America/Juneau	 15:02:19 -	LMT	1867 Oct 18
 * 			 -8:57:41 -	LMT	...
 * When Alaska was purchased from Russia in 1867, the Date Line moved from the Alaska/Canada border to the Bering Strait; and the time in
 * Alaska was then 24 hours earlier than it had been. <aside>(6 October in the Julian calendar, which Russia was still using then for
 * religious reasons, was followed by a second instance of the same day with a different name, 18 October in the Gregorian calendar.
 * Isn’t civil time wonderful? 8-))</aside>
 * The abbreviation, “LMT,” stands for “local mean time,” which is an invention of the tz database and was probably never actually
 * used during the period. Furthermore, the value is almost certainly wrong except in the archetypal place after which the zone is named.
 * (The tz database usually doesn’t provide a separate Zone record for places where nothing significant happened after 1970.)
 */
export class ZoneInfo {

	/**
	 * Constructor
	 * @param gmtoff
	 * @param ruleType
	 * @param ruleOffset
	 * @param ruleName
	 * @param format
	 * @param until
	 * @throws nothing
	 */
	constructor(
		/**
		 * GMT offset in fractional minutes, POSITIVE to UTC (note JavaScript.Date gives offsets
		 * contrary to what you might expect).  E.g. Europe/Amsterdam has +60 minutes in this field because
		 * it is one hour ahead of UTC
		 */
		public gmtoff: Duration,

		/**
		 * The RULES column tells us whether daylight saving time is being observed:
		 * A hyphen, a kind of null value, means that we have not set our clocks ahead of standard time.
		 * An amount of time (usually but not necessarily “1:00” meaning one hour) means that we have set our clocks ahead by that amount.
		 * Some alphabetic string means that we might have set our clocks ahead; and we need to check the rule
		 * the name of which is the given alphabetic string.
		 */
		public ruleType: RuleType,

		/**
		 * If the rule column is an offset, this is the offset
		 */
		public ruleOffset: Duration,

		/**
		 * If the rule column is a rule name, this is the rule name
		 */
		public ruleName: string,

		/**
		 * The FORMAT column specifies the usual abbreviation of the time zone name. It can have one of four forms:
		 * the string, “zzz,” which is a kind of null value (don’t ask)
		 * a single alphabetic string other than “zzz,” in which case that’s the abbreviation
		 * a pair of strings separated by a slash (‘/’), in which case the first string is the abbreviation
		 * for the standard time name and the second string is the abbreviation for the daylight saving time name
		 * a string containing “%s,” in which case the “%s” will be replaced by the text in the appropriate Rule’s LETTER column
		 */
		public format: string,

		/**
		 * Until timestamp in unix utc millis. The zone info is valid up to
		 * and excluding this timestamp.
		 * Note this value can be undefined (for the first rule)
		 */
		public until?: number
	) {
		if (this.ruleOffset) {
			this.ruleOffset = this.ruleOffset.convert(basics.TimeUnit.Hour);
		}
	}
}


enum TzMonthNames {
	Jan = 1,
	Feb = 2,
	Mar = 3,
	Apr = 4,
	May = 5,
	Jun = 6,
	Jul = 7,
	Aug = 8,
	Sep = 9,
	Oct = 10,
	Nov = 11,
	Dec = 12
}

/**
 * Turns a month name from the TZ database into a number 1-12
 * @param name
 * @throws timezonecomplete.InvalidTimeZoneData for invalid month name
 */
function monthNameToNumber(name: string): number {
	for (let i: number = 1; i <= 12; ++i) {
		if (TzMonthNames[i] === name) {
			return i;
		}
	}
	return throwError("InvalidTimeZoneData", "Invalid month name '%s'", name);
}

enum TzDayNames {
	Sun = 0,
	Mon = 1,
	Tue = 2,
	Wed = 3,
	Thu = 4,
	Fri = 5,
	Sat = 6
}

/**
 * Returns true if the given string is a valid offset string i.e.
 * 1, -1, +1, 01, 1:00, 1:23:25.143
 * @throws nothing
 */
export function isValidOffsetString(s: string): boolean {
	return /^(\-|\+)?([0-9]+((\:[0-9]+)?(\:[0-9]+(\.[0-9]+)?)?))$/.test(s);
}

/**
 * Defines a moment at which the given rule becomes valid
 */
export class Transition {
	/**
	 * Constructor
	 * @param at
	 * @param offset
	 * @param letter
	 * @throws nothing
	 */
	constructor(
		/**
		 * Transition time in UTC millis
		 */
		public at: number,
		/**
		 * New offset (type of offset depends on the function)
		 */
		public offset: Duration,

		/**
		 * New timzone abbreviation letter
		 */
		public letter: string

	) {
		if (this.offset) {
			this.offset = this.offset.convert(basics.TimeUnit.Hour);
		}
	}
}

/**
 * Option for TzDatabase#normalizeLocal()
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
 * This class is a wrapper around time zone data JSON object from the tzdata NPM module.
 * You usually do not need to use this directly, use TimeZone and DateTime instead.
 */
export class TzDatabase {

	/**
	 * Single instance member
	 */
	private static _instance?: TzDatabase;

	/**
	 * (re-) initialize timezonecomplete with time zone data
	 *
	 * @param data TZ data as JSON object (from one of the tzdata NPM modules).
	 *             If not given, Timezonecomplete will search for installed modules.
	 * @throws timezonecomplete.InvalidTimeZoneData if `data` or the global time zone data is invalid
	 */
	public static init(data?: any | any[]): void {
		TzDatabase._instance = undefined; // needed for assert in constructor
		if (data) {
			TzDatabase._instance = new TzDatabase(Array.isArray(data) ? data : [data]);
		} else {
			const data: any[] = [];
			// try to find TZ data in global variables
			let g: any;
			if (typeof window !== "undefined") {
				g = window;
			} else if (typeof global !== "undefined") {
				g = global;
			} else if (typeof self !== "undefined") {
				g = self;
			} else {
				g = {};
			}
			if (g) {
				for (const key of Object.keys(g)) {
					if (key.startsWith("tzdata")) {
						if (typeof g[key] === "object" && g[key].rules && g[key].zones) {
							data.push(g[key]);
						}
					}
				}
			}
			// try to find TZ data as installed NPM modules
			const findNodeModules = (require: any): void => {
				try {
					// first try tzdata which contains all data
					const tzDataName = "tzdata";
					const d = require(tzDataName); // use variable to avoid browserify acting up
					data.push(d);
				} catch (e) {
					// then try subsets
					const moduleNames: string[] = [
						"tzdata-africa",
						"tzdata-antarctica",
						"tzdata-asia",
						"tzdata-australasia",
						"tzdata-backward",
						"tzdata-backward-utc",
						"tzdata-etcetera",
						"tzdata-europe",
						"tzdata-northamerica",
						"tzdata-pacificnew",
						"tzdata-southamerica",
						"tzdata-systemv"
					];
					moduleNames.forEach((moduleName: string): void => {
						try {
							const d = require(moduleName);
							data.push(d);
						} catch (e) {
							// nothing
						}
					});
				}
			};
			if (data.length === 0) {
				if (typeof module === "object" && typeof module.exports === "object") {
					findNodeModules(require); // need to put require into a function to make webpack happy
				}
			}
			TzDatabase._instance = new TzDatabase(data);
		}
	}

	/**
	 * Single instance of this database
	 * @throws timezonecomplete.InvalidTimeZoneData if the global time zone data is invalid
	 */
	public static instance(): TzDatabase {
		if (!TzDatabase._instance) {
			TzDatabase.init();
		}
		return TzDatabase._instance as TzDatabase;
	}

	/**
	 * Time zone database data
	 */
	private _data: any;

	/**
	 * Cached min/max DST values
	 */
	private _minmax: MinMaxInfo;

	/**
	 * Cached zone names
	 */
	private _zoneNames: string[];

	/**
	 * Constructor - do not use, this is a singleton class. Use TzDatabase.instance() instead
	 * @throws AlreadyCreated if an instance already exists
	 * @throws timezonecomplete.InvalidTimeZoneData if `data` is empty or invalid
	 */
	private constructor(data: any[]) {
		assert(
			!TzDatabase._instance, "AlreadyCreated",
			"You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()"
		);
		assert(
			data.length > 0, "InvalidTimeZoneData",
			"Timezonecomplete needs time zone data. You need to install one of the tzdata NPM modules before using timezonecomplete."
		);
		if (data.length === 1) {
			this._data = data[0];
		} else {
			this._data = { zones: {}, rules: {} };
			data.forEach((d: any): void => {
				if (d && d.rules && d.zones) {
					for (const key of Object.keys(d.rules)) {
						this._data.rules[key] = d.rules[key];
					}
					for (const key of Object.keys(d.zones)) {
						this._data.zones[key] = d.zones[key];
					}
				}
			});
		}
		this._minmax = validateData(this._data);
	}

	/**
	 * Returns a sorted list of all zone names
	 * @throws nothing
	 */
	public zoneNames(): string[] {
		if (!this._zoneNames) {
			this._zoneNames = Object.keys(this._data.zones);
			this._zoneNames.sort();
		}
		return this._zoneNames;
	}

	/**
	 * Returns true iff the given zone name exists
	 * @param zoneName
	 * @throws nothing
	 */
	public exists(zoneName: string): boolean {
		return this._data.zones.hasOwnProperty(zoneName);
	}

	/**
	 * Minimum non-zero DST offset (which excludes standard offset) of all rules in the database.
	 * Note that DST offsets need not be whole hours.
	 *
	 * Does return zero if a zoneName is given and there is no DST at all for the zone.
	 *
	 * @param zoneName	(optional) if given, the result for the given zone is returned
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public minDstSave(zoneName?: string): Duration {
		try {
			if (zoneName) {
				const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
				let result: Duration | undefined;
				const ruleNames: string[] = [];
				for (const zoneInfo of zoneInfos) {
					if (zoneInfo.ruleType === RuleType.Offset) {
						if (!result || result.greaterThan(zoneInfo.ruleOffset)) {
							if (zoneInfo.ruleOffset.milliseconds() !== 0) {
								result = zoneInfo.ruleOffset;
							}
						}
					}
					if (zoneInfo.ruleType === RuleType.RuleName && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
						ruleNames.push(zoneInfo.ruleName);
						const temp = this.getRuleInfos(zoneInfo.ruleName);
						for (const ruleInfo of temp) {
							if (!result || result.greaterThan(ruleInfo.save)) {
								if (ruleInfo.save.milliseconds() !== 0) {
									result = ruleInfo.save;
								}
							}
						}
					}
				}
				if (!result) {
					result = Duration.hours(0);
				}
				return result.clone();
			} else {
				return Duration.minutes(this._minmax.minDstSave);
			}
		} catch (e) {
			if (errorIs(e, ["NotFound.Rule", "Argument.N"])) {
				e = error("InvalidTimeZoneData", e.message);
			}
			throw e;
		}
	}

	/**
	 * Maximum DST offset (which excludes standard offset) of all rules in the database.
	 * Note that DST offsets need not be whole hours.
	 *
	 * Returns 0 if zoneName given and no DST observed.
	 *
	 * @param zoneName	(optional) if given, the result for the given zone is returned
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public maxDstSave(zoneName?: string): Duration {
		try {
			if (zoneName) {
				const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
				let result: Duration | undefined;
				const ruleNames: string[] = [];
				for (const zoneInfo of zoneInfos) {
					if (zoneInfo.ruleType === RuleType.Offset) {
						if (!result || result.lessThan(zoneInfo.ruleOffset)) {
							result = zoneInfo.ruleOffset;
						}
					}
					if (zoneInfo.ruleType === RuleType.RuleName
						&& ruleNames.indexOf(zoneInfo.ruleName) === -1) {
						ruleNames.push(zoneInfo.ruleName);
						const temp = this.getRuleInfos(zoneInfo.ruleName);
						for (const ruleInfo of temp) {
							if (!result || result.lessThan(ruleInfo.save)) {
								result = ruleInfo.save;
							}
						}
					}
				}
				if (!result) {
					result = Duration.hours(0);
				}
				return result.clone();
			} else {
				return Duration.minutes(this._minmax.maxDstSave);
			}
		} catch (e) {
			if (errorIs(e, ["NotFound.Rule", "Argument.N"])) {
				e = error("InvalidTimeZoneData", e.message);
			}
			throw e;
		}
	}

	/**
	 * Checks whether the zone has DST at all
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public hasDst(zoneName: string): boolean {
		return (this.maxDstSave(zoneName).milliseconds() !== 0);
	}

	/**
	 * First DST change moment AFTER the given UTC date in UTC milliseconds, within one year,
	 * returns undefined if no such change
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public nextDstChange(zoneName: string, utcTime: number): number | undefined;
	public nextDstChange(zoneName: string, utcTime: TimeStruct): number | undefined;
	public nextDstChange(zoneName: string, a: TimeStruct | number): number | undefined {
		const utcTime: TimeStruct = (typeof a === "number" ? new TimeStruct(a) : a);
		const zone = this._getZoneTransitions(zoneName);
		let iterator = zone.findFirst();
		if (iterator && iterator.transition.atUtc > utcTime) {
			return iterator.transition.atUtc.unixMillis;
		}
		while (iterator) {
			iterator = zone.findNext(iterator);
			if (iterator && iterator.transition.atUtc > utcTime) {
				return iterator.transition.atUtc.unixMillis;
			}
		}
		return undefined;
	}

	/**
	 * Last DST change (moment AFTER) of the given UTC date in UTC milliseconds, within one year,
	 * returns undefined if no such change
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public lastDstChange(zoneName: string, utcTime: number): number | undefined;
	public lastDstChange(zoneName: string, utcTime: TimeStruct): number | undefined;
	public lastDstChange(zoneName: string, a: TimeStruct | number): number | undefined {
		const utcTime: TimeStruct = (typeof a === "number" ? new TimeStruct(a) : a);
		const zone = this._getZoneTransitions(zoneName);
		let iterator = zone.findFirst();
		let lastChange: number | undefined;
		while (iterator) {
			if (iterator.transition.atUtc > utcTime) {
				break;
			}
			lastChange = iterator.transition.atUtc.unixMillis;
			iterator = zone.findNext(iterator);
		}

		return lastChange;
	}

	/**
	 * Returns true iff the given zone name eventually links to
	 * "Etc/UTC", "Etc/GMT" or "Etc/UCT" in the TZ database. This is true e.g. for
	 * "UTC", "GMT", "Etc/GMT" etc.
	 *
	 * @param zoneName	IANA time zone name.
	 * @throws nothing
	 */
	public zoneIsUtc(zoneName: string): boolean {
		let actualZoneName: string = zoneName;
		let zoneEntries: any = this._data.zones[zoneName];
		// follow links
		while (typeof (zoneEntries) === "string") {
			/* istanbul ignore if */
			if (!this._data.zones.hasOwnProperty(zoneEntries)) {
				throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \""
					+ zoneName + "\" via \"" + actualZoneName + "\"");
			}
			actualZoneName = zoneEntries;
			zoneEntries = this._data.zones[actualZoneName];
		}
		return (actualZoneName === "Etc/UTC" || actualZoneName === "Etc/GMT" || actualZoneName === "Etc/UCT");
	}

	/**
	 * Normalizes non-existing local times by adding/subtracting a forward offset change.
	 * During a forward standard offset change or DST offset change, some amount of
	 * local time is skipped. Therefore, this amount of local time does not exist.
	 * This function adds the amount of forward change to any non-existing time. After all,
	 * this is probably what the user meant.
	 *
	 * @param zoneName	IANA time zone name
	 * @param localTime	A local time as a unix millisecond value
	 * @param opt	(optional) Round up or down? Default: up.
	 *
	 * @return	The normalized time, in the same format as the localTime parameter (TimeStruct or unix millis)
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public normalizeLocal(zoneName: string, localTime: number, opt?: NormalizeOption): number;
	/**
	 * Normalizes non-existing local times by adding/subtracting a forward offset change.
	 * During a forward standard offset change or DST offset change, some amount of
	 * local time is skipped. Therefore, this amount of local time does not exist.
	 * This function adds the amount of forward change to any non-existing time. After all,
	 * this is probably what the user meant.
	 *
	 * @param zoneName	IANA time zone name
	 * @param localTime	A local time, as a TimeStruct
	 * @param opt	(optional) Round up or down? Default: up.
	 *
	 * @return	The normalized time, in the same format as the localTime parameter (TimeStruct or unix millis)
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public normalizeLocal(zoneName: string, localTime: TimeStruct, opt?: NormalizeOption): TimeStruct;
	public normalizeLocal(zoneName: string, a: TimeStruct | number, opt: NormalizeOption = NormalizeOption.Up): TimeStruct | number {
		if (this.hasDst(zoneName)) {
			const localTime: TimeStruct = (typeof a === "number" ? new TimeStruct(a) : a);
			// local times behave like this during DST changes:
			// forward change (1h):   0 1 3 4 5
			// forward change (2h):   0 1 4 5 6
			// backward change (1h):  1 2 2 3 4
			// backward change (2h):  1 2 1 2 3

			// Therefore, binary searching is not possible.
			// Instead, we should check the DST forward transitions within a window around the local time

			// get all transitions (note this includes fake transition rules for zone offset changes)

			const zone = this._getZoneTransitions(zoneName);
			const transitions: ZoneTransition[] = zone.transitionsInYears(localTime.components.year - 1, localTime.components.year + 1);

			// find the DST forward transitions
			let prev: Duration = Duration.hours(0);
			for (const transition of transitions) {
				const offset = transition.newState.dstOffset.add(transition.newState.standardOffset);
				// forward transition?
				if (offset.greaterThan(prev)) {
					const localBefore: number = transition.atUtc.unixMillis + prev.milliseconds();
					const localAfter: number = transition.atUtc.unixMillis + offset.milliseconds();
					if (localTime.unixMillis >= localBefore && localTime.unixMillis < localAfter) {
						const forwardChange = offset.sub(prev);
						// non-existing time
						const factor: number = (opt === NormalizeOption.Up ? 1 : -1);
						const resultMillis = localTime.unixMillis + factor * forwardChange.milliseconds();
						return (typeof a === "number" ? resultMillis : new TimeStruct(resultMillis));
					}
				}
				prev = offset;
			}

			// no non-existing time
		}
		return (typeof a === "number" ? a : a.clone());
	}

	/**
	 * Returns the standard time zone offset from UTC, without DST.
	 * Throws if info not found.
	 * @param zoneName	IANA time zone name
	 * @param utcTime	Timestamp in UTC, either as TimeStruct or as Unix millisecond value
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public standardOffset(zoneName: string, utcTime: TimeStruct | number): Duration {
		const zoneInfo: ZoneInfo = this.getZoneInfo(zoneName, utcTime);
		return zoneInfo.gmtoff.clone();
	}

	/**
	 * Returns the total time zone offset from UTC, including DST, at
	 * the given UTC timestamp.
	 * Throws if zone info not found.
	 *
	 * @param zoneName	IANA time zone name
	 * @param utcTime	Timestamp in UTC, either as TimeStruct or as Unix millisecond value
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public totalOffset(zoneName: string, utcTime: TimeStruct | number): Duration {
		const u: TimeStruct = typeof utcTime === "number" ? new TimeStruct(utcTime) : utcTime;
		const zone = this._getZoneTransitions(zoneName);
		const state: ZoneState = zone.stateAt(u);
		return state.dstOffset.add(state.standardOffset);
	}

	/**
	 * The time zone rule abbreviation, e.g. CEST for Central European Summer Time.
	 * Note this is dependent on the time, because with time different rules are in effect
	 * and therefore different abbreviations. They also change with DST: e.g. CEST or CET.
	 *
	 * @param zoneName	IANA zone name
	 * @param utcTime	Timestamp in UTC unix milliseconds
	 * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
	 * @return	The abbreviation of the rule that is in effect
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public abbreviation(zoneName: string, utcTime: TimeStruct | number, dstDependent: boolean = true): string {
		const u: TimeStruct = typeof utcTime === "number" ? new TimeStruct(utcTime) : utcTime;
		const zone = this._getZoneTransitions(zoneName);
		if (dstDependent) {
			const state: ZoneState = zone.stateAt(u);
			return state.abbreviation;
		} else {
			let lastNonDst: string = zone.initialState.dstOffset.milliseconds() === 0 ? zone.initialState.abbreviation : "";
			let iterator = zone.findFirst();
			if (iterator?.transition.newState.dstOffset.milliseconds() === 0) {
				lastNonDst = iterator.transition.newState.abbreviation;
			}
			while (iterator && iterator.transition.atUtc <= u) {
				iterator = zone.findNext(iterator);
				if (iterator?.transition.newState.dstOffset.milliseconds() === 0) {
					lastNonDst = iterator.transition.newState.abbreviation;
				}
			}
			return lastNonDst;
		}
	}

	/**
	 * Returns the standard time zone offset from UTC, excluding DST, at
	 * the given LOCAL timestamp, again excluding DST.
	 *
	 * If the local timestamp exists twice (as can occur very rarely due to zone changes)
	 * then the first occurrence is returned.
	 *
	 * Throws if zone info not found.
	 *
	 * @param zoneName	IANA time zone name
	 * @param localTime	Timestamp in time zone time
	 * @throws timezonecomplete.NotFound.Zone if zoneName not found
	 * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
	 */
	public standardOffsetLocal(zoneName: string, localTime: TimeStruct | number): Duration {
		const unixMillis = (typeof localTime === "number" ? localTime : localTime.unixMillis);
		const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
		for (const zoneInfo of zoneInfos) {
			if (zoneInfo.until === undefined || zoneInfo.until + zoneInfo.gmtoff.milliseconds() > unixMillis) {
				return zoneInfo.gmtoff.clone();
			}
		}
		/* istanbul ignore if */
		/* istanbul ignore next */
		if (true) {
			return throwError("InvalidTimeZoneData", "No zone info found");
		}
	}

	/**
	 * Returns the total time zone offset from UTC, including DST, at
	 * the given LOCAL timestamp. Non-existing local time is normalized out.
	 * There can be multiple UTC times and therefore multiple offsets for a local time
	 * namely during a backward DST change. This returns the FIRST such offset.
	 * Throws if zone info not found.
	 *
	 * @param zoneName	IANA time zone name
	 * @param localTime	Timestamp in time zone time
	 * @throws timezonecomplete.NotFound.Zone if zoneName not found
	 * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
	 */
	public totalOffsetLocal(zoneName: string, localTime: TimeStruct | number): Duration {
		const ts: TimeStruct = (typeof localTime === "number" ? new TimeStruct(localTime) : localTime);
		const normalizedTm: TimeStruct = this.normalizeLocal(zoneName, ts);

		/// Note: during offset changes, local time can behave like:
		// forward change (1h):   0 1 3 4 5
		// forward change (2h):   0 1 4 5 6
		// backward change (1h):  1 2 2 3 4
		// backward change (2h):  1 2 1 2 3  <-- note time going BACKWARD

		// Therefore binary search does not apply. Linear search through transitions
		// and return the first offset that matches

		const zone = this._getZoneTransitions(zoneName);
		const transitions = zone.transitionsInYears(normalizedTm.components.year - 1, normalizedTm.components.year + 2);
		let prev: ZoneTransition | undefined;
		let prevPrev: ZoneTransition | undefined;
		for (const transition of transitions) {
			const offset = transition.newState.dstOffset.add(transition.newState.standardOffset);
			if (transition.atUtc.unixMillis + offset.milliseconds() > normalizedTm.unixMillis) {
				// found offset: prev.offset applies
				break;
			}
			prevPrev = prev;
			prev = transition;
		}

		/* istanbul ignore else */
		if (prev) {
			// special care during backward change: take first occurrence of local time
			const prevOffset = prev.newState.dstOffset.add(prev.newState.standardOffset);
			const prevPrevOffset = prevPrev ? prevPrev.newState.dstOffset.add(prevPrev.newState.standardOffset) : undefined;
			if (prevPrev && prevPrevOffset !== undefined && prevPrevOffset.greaterThan(prevOffset)) {
				// backward change
				const diff = prevPrevOffset.sub(prevOffset);
				if (normalizedTm.unixMillis >= prev.atUtc.unixMillis + prevOffset.milliseconds()
					&& normalizedTm.unixMillis < prev.atUtc.unixMillis + prevOffset.milliseconds() + diff.milliseconds()) {
					// within duplicate range
					return prevPrevOffset.clone();
				} else {
					return prevOffset.clone();
				}
			} else {
				return prevOffset.clone();
			}
		} else {
			const state = zone.stateAt(normalizedTm);
			return state.dstOffset.add(state.standardOffset);
		}
	}

	/**
	 * DEPRECATED because DST offset depends on the zone too, not just on the ruleset
	 * Returns the DST offset (WITHOUT the standard zone offset) for the given ruleset and the given UTC timestamp
	 *
	 * @deprecated
	 * @param ruleName	name of ruleset
	 * @param utcTime	UTC timestamp
	 * @param standardOffset	Standard offset without DST for the time zone
	 * @throws timezonecomplete.NotFound.Rule if ruleName not found
	 * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
	 */
	public dstOffsetForRule(ruleName: string, utcTime: TimeStruct | number, standardOffset: Duration): Duration {
		const ts: TimeStruct = (typeof utcTime === "number" ? new TimeStruct(utcTime) : utcTime);

		// find applicable transition moments
		const transitions: Transition[] = this.getTransitionsDstOffsets(
			ruleName, ts.components.year - 1, ts.components.year, standardOffset
		);

		// find the last prior to given date
		let offset: Duration | undefined;
		for (let i = transitions.length - 1; i >= 0; i--) {
			const transition = transitions[i];
			if (transition.at <= ts.unixMillis) {
				offset = transition.offset.clone();
				break;
			}
		}

		/* istanbul ignore if */
		if (!offset) {
			// apparently no longer DST, as e.g. for Asia/Tokyo
			offset = Duration.minutes(0);
		}

		return offset;
	}

	/**
	 * Returns the time zone letter for the given
	 * ruleset and the given UTC timestamp
	 *
	 * @deprecated
	 * @param ruleName	name of ruleset
	 * @param utcTime	UTC timestamp as TimeStruct or unix millis
	 * @param standardOffset	Standard offset without DST for the time zone
	 * @throws timezonecomplete.NotFound.Rule if ruleName not found
	 * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
	 */
	public letterForRule(ruleName: string, utcTime: TimeStruct | number, standardOffset: Duration): string {
		const ts: TimeStruct = (typeof utcTime === "number" ? new TimeStruct(utcTime) : utcTime);
		// find applicable transition moments
		const transitions: Transition[] = this.getTransitionsDstOffsets(
			ruleName, ts.components.year - 1, ts.components.year, standardOffset
		);

		// find the last prior to given date
		let letter: string | undefined;
		for (let i = transitions.length - 1; i >= 0; i--) {
			const transition = transitions[i];
			if (transition.at <= ts.unixMillis) {
				letter = transition.letter;
				break;
			}
		}

		/* istanbul ignore if */
		if (!letter) {
			// apparently no longer DST, as e.g. for Asia/Tokyo
			letter = "";
		}

		return letter;
	}

	/**
	 * DEPRECATED because DST offset depends on the zone too, not just on the ruleset
	 * Return a list of all transitions in [fromYear..toYear] sorted by effective date
	 *
	 * @deprecated
	 * @param ruleName	Name of the rule set
	 * @param fromYear	first year to return transitions for
	 * @param toYear	Last year to return transitions for
	 * @param standardOffset	Standard offset without DST for the time zone
	 *
	 * @return Transitions, with DST offsets (no standard offset included)
	 * @throws timezonecomplete.Argument.FromYear if fromYear > toYear
	 * @throws timezonecomplete.NotFound.Rule if ruleName not found
	 * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
	 */
	public getTransitionsDstOffsets(ruleName: string, fromYear: number, toYear: number, standardOffset: Duration): Transition[] {
		assert(fromYear <= toYear, "Argument.FromYear", "fromYear must be <= toYear");
		const rules = this._getRuleTransitions(ruleName);
		const result: Transition[] = [];
		let prevDst = hours(0); // wrong, but that's why the function is deprecated
		let iterator = rules.findFirst();
		while (iterator && iterator.transition.at.year <= toYear) {
			if (iterator.transition.at.year >= fromYear && iterator.transition.at.year <= toYear) {
				result.push({
					at: ruleTransitionUtc(iterator.transition, standardOffset, prevDst).unixMillis,
					letter: iterator.transition.newState.letter || "",
					offset: iterator.transition.newState.dstOffset
				});
			}
			prevDst = iterator.transition.newState.dstOffset;
			iterator = rules.findNext(iterator);
		}
		result.sort((a: Transition, b: Transition): number => {
			return a.at - b.at;
		});
		return result;
	}

	/**
	 * Return both zone and rule changes as total (std + dst) offsets.
	 * Adds an initial transition if there is none within the range.
	 *
	 * @param zoneName	IANA zone name
	 * @param fromYear	First year to include
	 * @param toYear	Last year to include
	 * @throws timezonecomplete.Argument.FromYear if fromYear > toYear
	 * @throws timezonecomplete.NotFound.Zone if zoneName not found
	 * @throws timezonecomplete.InvalidTimeZoneData if an error is discovered in the time zone database
	 */
	public getTransitionsTotalOffsets(zoneName: string, fromYear: number, toYear: number): Transition[] {
		assert(fromYear <= toYear, "Argument.FromYear", "fromYear must be <= toYear");
		const zone = this._getZoneTransitions(zoneName);
		const result: Transition[] = [];
		const startState = zone.stateAt(new TimeStruct({ year: fromYear, month: 1, day: 1 }));
		result.push({
			at: new TimeStruct({ year: fromYear }).unixMillis,
			letter: startState.letter,
			offset: startState.dstOffset.add(startState.standardOffset)
		});
		let iterator = zone.findFirst();
		while (iterator && iterator.transition.atUtc.year <= toYear) {
			if (iterator.transition.atUtc.year >= fromYear) {
				result.push({
					at: iterator.transition.atUtc.unixMillis,
					letter: iterator.transition.newState.letter || "",
					offset: iterator.transition.newState.dstOffset.add(iterator.transition.newState.standardOffset)
				});
			}
			iterator = zone.findNext(iterator);
		}
		result.sort((a: Transition, b: Transition): number => {
			return a.at - b.at;
		});
		return result;
	}

	/**
	 * Get the zone info for the given UTC timestamp. Throws if not found.
	 * @param zoneName	IANA time zone name
	 * @param utcTime	UTC time stamp as unix milliseconds or as a TimeStruct
	 * @returns	ZoneInfo object. Do not change, we cache this object.
	 * @throws timezonecomplete.NotFound.Zone if zone name not found or a linked zone not found
	 * @throws timezonecomplete.InvalidTimeZoneData if values in the time zone database are invalid
	 */
	public getZoneInfo(zoneName: string, utcTime: TimeStruct | number): ZoneInfo {
		const unixMillis = (typeof utcTime === "number" ? utcTime : utcTime.unixMillis);
		const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
		for (const zoneInfo of zoneInfos) {
			if (zoneInfo.until === undefined || zoneInfo.until > unixMillis) {
				return zoneInfo;
			}
		}
		return throwError("NotFound.Zone", "no zone info found for zone '%s'", zoneName);
	}

	/**
	 * Performance improvement: zone info cache
	 */
	private _zoneInfoCache: { [index: string]: ZoneInfo[] } = {};

	/**
	 * Return the zone records for a given zone name sorted by UNTIL, after
	 * following any links.
	 *
	 * @param zoneName	IANA zone name like "Pacific/Efate"
	 * @return Array of zone infos. Do not change, this is a cached value.
	 * @throws timezonecomplete.NotFound.Zone if zone does not exist or a linked zone does not exit
	 */
	public getZoneInfos(zoneName: string): ZoneInfo[] {
		// FIRST validate zone name before searching cache
		/* istanbul ignore if */
		assert(this._data.zones.hasOwnProperty(zoneName), "NotFound.Zone", "zone not found: '%s'", zoneName);

		// Take from cache
		if (this._zoneInfoCache.hasOwnProperty(zoneName)) {
			return this._zoneInfoCache[zoneName];
		}

		const result: ZoneInfo[] = [];
		let actualZoneName: string = zoneName;
		let zoneEntries: any = this._data.zones[zoneName];
		// follow links
		while (typeof (zoneEntries) === "string") {
			/* istanbul ignore if */
			if (!this._data.zones.hasOwnProperty(zoneEntries)) {
				return throwError("NotFound.Zone", "Zone \"" + zoneEntries + "\" not found (referred to in link from \""
					+ zoneName + "\" via \"" + actualZoneName + "\"");
			}
			actualZoneName = zoneEntries;
			zoneEntries = this._data.zones[actualZoneName];
		}
		// final zone info found
		for (const zoneEntry of zoneEntries) {
			const ruleType: RuleType = this.parseRuleType(zoneEntry[1]);
			let until: number | undefined = math.filterFloat(zoneEntry[3]);
			if (isNaN(until)) {
				until = undefined;
			}

			result.push(new ZoneInfo(
				Duration.minutes(-1 * math.filterFloat(zoneEntry[0])),
				ruleType,
				ruleType === RuleType.Offset ? new Duration(zoneEntry[1]) : new Duration(),
				ruleType === RuleType.RuleName ? zoneEntry[1] : "",
				zoneEntry[2],
				until
			));
		}

		result.sort((a: ZoneInfo, b: ZoneInfo): number => {
			// sort undefined last
			/* istanbul ignore if */
			if (a.until === undefined && b.until === undefined) {
				return 0;
			}
			if (a.until !== undefined && b.until === undefined) {
				return -1;
			}
			if (a.until === undefined && b.until !== undefined) {
				return 1;
			}
			return (a.until! - b.until!);
		});

		this._zoneInfoCache[zoneName] = result;
		return result;
	}

	/**
	 * Performance improvement: rule info cache
	 */
	private _ruleInfoCache: { [index: string]: RuleInfo[] } = {};

	/**
	 * Returns the rule set with the given rule name,
	 * sorted by first effective date (uncompensated for "w" or "s" AtTime)
	 *
	 * @param ruleName	Name of rule set
	 * @return RuleInfo array. Do not change, this is a cached value.
	 * @throws timezonecomplete.NotFound.Rule if rule not found
	 * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
	 */
	public getRuleInfos(ruleName: string): RuleInfo[] {
		// validate name BEFORE searching cache
		assert(this._data.rules.hasOwnProperty(ruleName), "NotFound.Rule", "Rule set \"" + ruleName + "\" not found.");

		// return from cache
		if (this._ruleInfoCache.hasOwnProperty(ruleName)) {
			return this._ruleInfoCache[ruleName];
		}

		try {
			const result: RuleInfo[] = [];
			const ruleSet = this._data.rules[ruleName];
			for (const rule of ruleSet) {

				const fromYear: number = (rule[0] === "NaN" ? -10000 : parseInt(rule[0], 10));
				const toType: ToType = this.parseToType(rule[1]);
				const toYear: number = (toType === ToType.Max ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
				const onType: OnType = this.parseOnType(rule[4]);
				const onDay: number = this.parseOnDay(rule[4], onType);
				const onWeekDay: WeekDay = this.parseOnWeekDay(rule[4]);
				const monthName: string = rule[3] as string;
				const monthNumber: number = monthNameToNumber(monthName);

				result.push(new RuleInfo(
					fromYear,
					toType,
					toYear,
					rule[2],
					monthNumber,
					onType,
					onDay,
					onWeekDay,
					math.positiveModulo(parseInt(rule[5][0], 10), 24), // note the database sometimes contains "24" as hour value
					math.positiveModulo(parseInt(rule[5][1], 10), 60),
					math.positiveModulo(parseInt(rule[5][2], 10), 60),
					this.parseAtType(rule[5][3]),
					Duration.minutes(parseInt(rule[6], 10)),
					rule[7] === "-" ? "" : rule[7]
					));

			}

			result.sort((a: RuleInfo, b: RuleInfo): number => {
				/* istanbul ignore if */
				if (a.effectiveEqual(b)) {
					return 0;
				} else if (a.effectiveLess(b)) {
					return -1;
				} else {
					return 1;
				}
			});

			this._ruleInfoCache[ruleName] = result;
			return result;
		} catch (e) {
			if (errorIs(e, ["Argument.To", "Argument.N", "Argument.Value", "Argument.Amount"])) {
				e = error("InvalidTimeZoneData", e.message);
			}
			throw e;
		}
	}

	/**
	 * Parse the RULES column of a zone info entry
	 * and see what kind of entry it is.
	 * @throws nothing
	 */
	public parseRuleType(rule: string): RuleType {
		if (rule === "-") {
			return RuleType.None;
		} else if (isValidOffsetString(rule)) {
			return RuleType.Offset;
		} else {
			return RuleType.RuleName;
		}
	}

	/**
	 * Parse the TO column of a rule info entry
	 * and see what kind of entry it is.
	 * @throws timezonecomplete.Argument.To for invalid TO
	 */
	public parseToType(to: string): ToType {
		// istanbul ignore else
		if (to === "max") {
			return ToType.Max;
		} else if (to === "only") {
			return ToType.Year; // yes we return Year for only
		} else if (!isNaN(parseInt(to, 10))) {
			return ToType.Year;
		} else {
			return throwError("Argument.To", "TO column incorrect: %s", to);
		}
	}

	/**
	 * Parse the ON column of a rule info entry
	 * and see what kind of entry it is.
	 * @throws nothing
	 */
	public parseOnType(on: string): OnType {
		if (on.length > 4 && on.substr(0, 4) === "last") {
			return OnType.LastX;
		}
		if (on.indexOf("<=") !== -1) {
			return OnType.LeqX;
		}
		if (on.indexOf(">=") !== -1) {
			return OnType.GreqX;
		}
		return OnType.DayNum;
	}

	/**
	 * Get the day number from an ON column string, 0 if no day.
	 * @throws nothing
	 */
	public parseOnDay(on: string, onType: OnType): number {
		switch (onType) {
			case OnType.DayNum: return parseInt(on, 10);
			case OnType.LeqX: return parseInt(on.substr(on.indexOf("<=") + 2), 10);
			case OnType.GreqX: return parseInt(on.substr(on.indexOf(">=") + 2), 10);
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					return 0;
				}
		}
	}

	/**
	 * Get the day-of-week from an ON column string, Sunday if not present.
	 * @throws nothing
	 */
	public parseOnWeekDay(on: string): WeekDay {
		for (let i = 0; i < 7; i++) {
			if (on.indexOf(TzDayNames[i]) !== -1) {
				return i as WeekDay;
			}
		}
		/* istanbul ignore if */
		/* istanbul ignore next */
		if (true) {
			return WeekDay.Sunday;
		}
	}

	/**
	 * Parse the AT column of a rule info entry
	 * and see what kind of entry it is.
	 * @throws nothing
	 */
	public parseAtType(at: any): AtType {
		switch (at) {
			case "s": return AtType.Standard;
			case "u": return AtType.Utc;
			case "g": return AtType.Utc;
			case "z": return AtType.Utc;
			case "w": return AtType.Wall;
			case "": return AtType.Wall;
			case null: return AtType.Wall;
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					return AtType.Wall;
				}
		}
	}


	/**
	 * pre-calculated transitions per zone
	 */
	private _zoneTransitionsCache = new Map<string, CachedZoneTransitions>();
	/**
	 * pre-calculated transitions per ruleset
	 */
	private _ruleTransitionsCache = new Map<string, CachedRuleTransitions>();

	/**
	 * Get pre-calculated zone transitions
	 * @param zoneName
	 * @throws timezonecomplete.NotFound.Zone if zone does not exist or a linked zone does not exit
	 * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
	 */
	private _getZoneTransitions(zoneName: string): CachedZoneTransitions {
		let result = this._zoneTransitionsCache.get(zoneName);
		if (!result) {
			result = new CachedZoneTransitions(zoneName, this.getZoneInfos(zoneName), this._getRuleTransitionsForZone(zoneName));
			this._zoneTransitionsCache.set(zoneName, result);
		}
		return result;
	}

	/**
	 * Get pre-calculated rule transitions
	 * @param ruleName
	 * @throws timezonecomplete.NotFound.Rule if rule not found
	 * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
	 */
	private _getRuleTransitions(ruleName: string): CachedRuleTransitions {
		let result = this._ruleTransitionsCache.get(ruleName);
		if (!result) {
			result = new CachedRuleTransitions(this.getRuleInfos(ruleName));
			this._ruleTransitionsCache.set(ruleName, result);
		}
		return result;
	}

	/**
	 * Returns a map of ruleName->CachedRuleTransitions for all rule sets that are referenced by a zone
	 * @param zoneName
	 * @throws timezonecomplete.NotFound.Zone if zone does not exist or a linked zone does not exit
	 * @throws timezonecomplete.NotFound.Rule if rule not found
	 * @throws timezonecomplete.InvalidTimeZoneData for invalid values in the time zone database
	 */
	private _getRuleTransitionsForZone(zoneName: string): Map<string, CachedRuleTransitions> {
		const result = new Map<string, CachedRuleTransitions>();
		const zoneInfos = this.getZoneInfos(zoneName);
		for (const zoneInfo of zoneInfos) {
			if (zoneInfo.ruleType === RuleType.RuleName) {
				if (!result.has(zoneInfo.ruleName)) {
					result.set(zoneInfo.ruleName, this._getRuleTransitions(zoneInfo.ruleName));
				}
			}
		}
		return result;
	}
}

interface MinMaxInfo {
	minDstSave: number;
	maxDstSave: number;
	minGmtOff: number;
	maxGmtOff: number;
}

/**
 * Sanity check on data. Returns min/max values.
 * @throws timezonecomplete.InvalidTimeZoneData for invalid data
 */
function validateData(data: any): MinMaxInfo {
	const result: Partial<MinMaxInfo> = {};

	assert(typeof data === "object", "InvalidTimeZoneData", "time zone data should be an object");
	assert(data.hasOwnProperty("rules"), "InvalidTimeZoneData", "time zone data should be an object with a 'rules' property");
	assert(data.hasOwnProperty("zones"), "InvalidTimeZoneData", "time zone data should be an object with a 'zones' property");

	// validate zones
	for (const zoneName in data.zones) {
		if (data.zones.hasOwnProperty(zoneName)) {
			const zoneArr: any = data.zones[zoneName];
			if (typeof (zoneArr) === "string") {
				// ok, is link to other zone, check link
				assert(
					data.zones.hasOwnProperty(zoneArr as string), "InvalidTimeZoneData",
					"Entry for zone \"%s\" links to \"%s\" but that doesn\'t exist", zoneName, zoneArr
				);
			} else {
				/* istanbul ignore if */
				if (!Array.isArray(zoneArr)) {
					return throwError("InvalidTimeZoneData", "Entry for zone \"%s\" is neither a string nor an array", zoneName);
				}
				for (let i = 0; i < zoneArr.length; i++) {
					const entry: any = zoneArr[i];
					/* istanbul ignore if */
					if (!Array.isArray(entry)) {
						return throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
					}
					/* istanbul ignore if */
					if (entry.length !== 4) {
						return throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
					}
					/* istanbul ignore if */
					if (typeof entry[0] !== "string") {
						return throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
					}
					const gmtoff = math.filterFloat(entry[0]);
					/* istanbul ignore if */
					if (isNaN(gmtoff)) {
						return throwError(
							"InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number"
						);
					}
					/* istanbul ignore if */
					if (typeof entry[1] !== "string") {
						return throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
					}
					/* istanbul ignore if */
					if (typeof entry[2] !== "string") {
						return throwError("InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
					}
					/* istanbul ignore if */
					if (typeof entry[3] !== "string" && entry[3] !== null) {
						return throwError(
							"InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null"
						);
					}
					/* istanbul ignore if */
					if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
						return throwError(
							"InvalidTimeZoneData", "Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number"
						);
					}
					if (result.maxGmtOff === undefined || gmtoff > result.maxGmtOff) {
						result.maxGmtOff = gmtoff;
					}
					if (result.minGmtOff === undefined || gmtoff < result.minGmtOff) {
						result.minGmtOff = gmtoff;
					}
				}
			}
		}
	}

	// validate rules
	for (const ruleName in data.rules) {
		if (data.rules.hasOwnProperty(ruleName)) {
			const ruleArr: any = data.rules[ruleName];
			/* istanbul ignore if */
			if (!Array.isArray(ruleArr)) {
				return throwError("InvalidTimeZoneData", "Entry for rule \"" + ruleName + "\" is not an array");
			}
			for (let i = 0; i < ruleArr.length; i++) {
				const rule = ruleArr[i];
					/* istanbul ignore if */
				if (!Array.isArray(rule)) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
				}
					/* istanbul ignore if */
				if (rule.length < 8) { // note some rules > 8 exists but that seems to be a bug in tz file parsing
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
				}
				for (let j = 0; j < rule.length; j++) {
					/* istanbul ignore if */
					if (j !== 5 && typeof rule[j] !== "string") {
						return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
					}
				}
				/* istanbul ignore if */
				if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
				}
				/* istanbul ignore if */
				if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
				}
				/* istanbul ignore if */
				if (!TzMonthNames.hasOwnProperty(rule[3])) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
				}
				/* istanbul ignore if */
				if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1
					&& rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))
				) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
				}
				/* istanbul ignore if */
				if (!Array.isArray(rule[5])) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
				}
				/* istanbul ignore if */
				if (rule[5].length !== 4) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
				}
				/* istanbul ignore if */
				if (isNaN(parseInt(rule[5][0], 10))) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
				}
				/* istanbul ignore if */
				if (isNaN(parseInt(rule[5][1], 10))) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
				}
				/* istanbul ignore if */
				if (isNaN(parseInt(rule[5][2], 10))) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
				}
				/* istanbul ignore if */
				if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w"
					&& rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
				}
				const save: number = parseInt(rule[6], 10);
				/* istanbul ignore if */
				if (isNaN(save)) {
					return throwError("InvalidTimeZoneData", "Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
				}
				if (save !== 0) {
					if (result.maxDstSave === undefined || save > result.maxDstSave) {
						result.maxDstSave = save;
					}
					if (result.minDstSave === undefined || save < result.minDstSave) {
						result.minDstSave = save;
					}
				}
			}
		}
	}
	return result as MinMaxInfo;
}

/**
 * Steady-state of a rule at a given point in time
 */
interface RuleState {
	/**
	 * Offset from stdoffset
	 */
	dstOffset: Duration;
	/**
	 *
	 */
	letter?: string;
}

/**
 * DST transition as given by a rule
 */
interface RuleTransition {
	/**
	 * Time of transitioning (type of time determined by atType)
	 */
	at: TimeStruct;
	/**
	 * Type of at time (standard, wall, UTC)
	 */
	atType: AtType;
	/**
	 * State after transition
	 */
	newState: RuleState;
}

/**
 * Used for iterating over transitions
 */
interface RuleTransitionIterator {
	/**
	 * The current transition
	 */
	transition: RuleTransition;
	/**
	 * The index of the transition in the pre-calculated transitions, if pre-calculated
	 */
	index?: number;
	/**
	 * Final === not pre-calculated
	 */
	final?: boolean;
}

/**
 * Ready-made sorted rule transitions (uncompensated for stdoffset, as rules are used by multiple zones with different offsets)
 */
class CachedRuleTransitions {

	/**
	 * All known transitions until the time that only 'max' type rules are left
	 */
	private _transitions: RuleTransition[];
	/**
	 * The 'max' rules at the end of the set. These are sorted by FROM and then year-relative effective date
	 */
	private _finalRulesByFromEffective: RuleInfo[];
	/**
	 * The 'max' rules at the end of the set. These are sorted by year-relative effective date
	 */
	private _finalRulesByEffective: RuleInfo[];

	/**
	 * The 'max' type rules at the end, sorted by year-relative effective date
	 */
	public get final(): RuleInfo[] {
		return this._finalRulesByEffective;
	}

	/**
	 * Constructor
	 * @param ruleInfos
	 */
	constructor(ruleInfos: RuleInfo[]) {
		// determine maximum year to calculate transitions for
		let maxYear: number|undefined;
		for (const ruleInfo of ruleInfos) {
			if (ruleInfo.toType === ToType.Year) {
				if (maxYear === undefined || ruleInfo.toYear > maxYear) {
					maxYear = ruleInfo.toYear;
				}
				if (maxYear === undefined || ruleInfo.from > maxYear) {
					maxYear = ruleInfo.from;
				}
			}
		}

		// calculate all transitions until 'max' rules take effect
		this._transitions = [];
		for (const ruleInfo of ruleInfos) {
			const min = ruleInfo.from;
			const max = ruleInfo.toType === ToType.Year ? ruleInfo.toYear : maxYear;
			if (max !== undefined) {
				for (let year = min; year <= max; ++year) {
					this._transitions.push({
						at: ruleInfo.effectiveDate(year),
						atType: ruleInfo.atType,
						newState: {
							dstOffset: ruleInfo.save,
							letter: ruleInfo.letter
						}
					});
				}
			}
		}

		// sort transitions
		this._transitions = this._transitions.sort((a: RuleTransition, b: RuleTransition): number => {
			return (
				a.at < b.at ? -1 :
				a.at > b.at ? 1 :
				0
			);
		});

		// save the 'max' rules for transitions after that
		this._finalRulesByFromEffective = ruleInfos.filter((info: RuleInfo) => info.toType === ToType.Max);
		this._finalRulesByEffective = [...this._finalRulesByFromEffective];

		// sort final rules by FROM and then by year-relative date
		this._finalRulesByFromEffective = this._finalRulesByFromEffective.sort((a: RuleInfo, b: RuleInfo): number => {
			if (a.from < b.from) {
				return -1;
			}
			if (a.from > b.from) {
				return 1;
			}
			const ae = a.effectiveDate(a.from);
			const be = b.effectiveDate(b.from);
			return (
				ae < be ? -1 :
				ae > be ? 1 :
				0
			);
		});

		// sort final rules by year-relative date
		this._finalRulesByEffective = this._finalRulesByFromEffective.sort((a: RuleInfo, b: RuleInfo): number => {
			const ae = a.effectiveDate(a.from);
			const be = b.effectiveDate(b.from);
			return (
				ae < be ? -1 :
				ae > be ? 1 :
				0
			);
		});
	}

	/**
	 * Returns the first ever transition as defined by the rule set
	 */
	public findFirst(): RuleTransitionIterator | undefined {
		if (this._transitions.length > 0) {
			const transition = this._transitions[0];
			const iterator: RuleTransitionIterator = {
				transition,
				index: 0
			};
			return iterator;
		}
		if (this._finalRulesByFromEffective.length > 0) {
			const rule = this._finalRulesByFromEffective[0];
			const transition: RuleTransition = {
				at: rule.effectiveDate(rule.from),
				atType: rule.atType,
				newState: {
					dstOffset: rule.save,
					letter: rule.letter
				}
			};
			const iterator: RuleTransitionIterator = {
				transition,
				final: true
			};
			return iterator;
		}
		return undefined;
	}

	/**
	 * Returns the next transition, given an iterator
	 * @param prev the iterator
	 */
	public findNext(prev: RuleTransitionIterator): RuleTransitionIterator | undefined {
		if (!prev.final && prev.index !== undefined) {
			if (prev.index < this._transitions.length - 1) {
				const transition = this._transitions[prev.index + 1];
				const iterator: RuleTransitionIterator = {
					transition,
					index: prev.index + 1
				};
				return iterator;
			}
		}
		// find minimum applicable final rule after the prev transition
		let found: RuleInfo | undefined;
		let foundEffective: TimeStruct | undefined;
		for (let year = prev.transition.at.year; year < prev.transition.at.year + 2; ++year) {
			for (const rule of this._finalRulesByEffective) {
				if (rule.applicable(year)) {
					const effective = rule.effectiveDate(year);
					if (effective > prev.transition.at && (!foundEffective || effective < foundEffective)) {
						found = rule;
						foundEffective = effective;
					}
				}
			}
		}
		if (found && foundEffective) {
			const transition: RuleTransition = {
				at: foundEffective,
				atType: found.atType,
				newState: {
					dstOffset: found.save,
					letter: found.letter
				}
			};
			const iterator: RuleTransitionIterator = {
				transition,
				final: true
			};
			return iterator;
		}
		return undefined;
	}

	/**
	 * Dirty find function that only takes a standard offset from UTC into account
	 * @param beforeUtc timestamp to search for
	 * @param standardOffset zone standard offset to apply
	 */
	public findLastLessEqual(beforeUtc: TimeStruct, standardOffset: Duration): RuleTransition | undefined {
		let prevTransition: RuleTransition | undefined;
		let iterator = this.findFirst();
		let effectiveUtc: TimeStruct | undefined =
			iterator?.transition ? ruleTransitionUtc(iterator.transition, standardOffset, undefined) : undefined;
		while (iterator && effectiveUtc && effectiveUtc <= beforeUtc) {
			prevTransition = iterator.transition;
			iterator = this.findNext(iterator);
			effectiveUtc = iterator?.transition ? ruleTransitionUtc(iterator.transition, standardOffset, undefined) : undefined;
		}
		return prevTransition;
	}

	/**
	 *
	 * @param afterUtc
	 * @param standardOffset
	 * @param dstOffset
	 */
	public firstTransitionWithoutDstAfter(
		afterUtc: TimeStruct,
		standardOffset: Duration,
		dstOffset: Duration | undefined
	): RuleTransition | undefined {
		// todo inefficient - optimize
		let iterator = this.findFirst();
		let effectiveUtc: TimeStruct | undefined =
			iterator?.transition ? ruleTransitionUtc(iterator?.transition, standardOffset, dstOffset) : undefined;
		while (iterator && effectiveUtc && (!iterator?.transition?.newState.dstOffset.zero() || effectiveUtc <= afterUtc)) {
			iterator = this.findNext(iterator);
			effectiveUtc = iterator?.transition ? ruleTransitionUtc(iterator?.transition, standardOffset, dstOffset) : undefined;
		}
		return iterator?.transition;
	}
}


/**
 * Steady-state zone information
 */
interface ZoneState {
	/**
	 * Zone standard offset from UTC from now on
	 */
	standardOffset: Duration;
	/**
	 * DST offset from the standard offset
	 */
	dstOffset: Duration;
	/**
	 * Zone name abbreviation from this time on
	 */
	abbreviation: string;
	/**
	 * Zone abbreviation rule letter
	 */
	letter: string;
}

/**
 * Transition moment for a time zone
 */
interface ZoneTransition {
	/**
	 * Transition time in UTC millis
	 */
	atUtc: TimeStruct;
	/**
	 * New state of time zone
	 */
	newState: ZoneState;
}

/**
 * Iterator object
 */
interface ZoneTransitionIterator {
	/**
	 * The current transition
	 */
	transition: ZoneTransition;
	/**
	 * The index of the current transition in the array of pre-calculated transitions (or 0)
	 */
	index: number;
	/**
	 * Indicates that the transition is not pre-calculated
	 */
	final?: boolean;
}

/**
 * Rules depend on previous rules, hence you cannot calculate DST transitions witout starting at the start.
 * Next to that, zones sometimes transition into the middle of a rule set.
 * Due to this, we maintain a cache of transitions for zones
 */
class CachedZoneTransitions {
	/**
	 * Initial offsets
	 */
	private _initialState: ZoneState;
	public get initialState(): ZoneState {
		return this._initialState;
	}
	/**
	 * Pre-calculated transitions until we run into 'max' type rules
	 */
	private _transitions: ZoneTransition[];
	/**
	 * The final zone info
	 */
	private _finalZoneInfo: ZoneInfo;
	/**
	 * The 'max' rules for modulo calculation
	 */
	private _finalRules: RuleInfo[];

	/**
	 * Constructor
	 * @param zoneName
	 * @param zoneInfos
	 * @param rules
	 * @throws timezonecomplete.InvalidTimeZoneData
	 * @throws timezonecomplete.Argument.ZoneInfos if zoneInfos is empty
	 */
	constructor(zoneName: string, zoneInfos: ZoneInfo[], rules: Map<string, CachedRuleTransitions>) {
		assert(zoneInfos.length > 0, "timezonecomplete.Argument.ZoneInfos", "zone '%s' without information", zoneName);
		this._finalZoneInfo = zoneInfos[zoneInfos.length - 1];
		this._initialState = this._calcInitialState(zoneName, zoneInfos, rules);
		[this._transitions, this._finalRules] = this._calcTransitions(zoneName, this._initialState, zoneInfos, rules);
	}

	/**
	 * Find the first transition, if it exists
	 */
	public findFirst(): ZoneTransitionIterator | undefined {
		if (this._transitions.length > 0) {
			return {
				transition: this._transitions[0],
				index: 0
			};
		}
		return undefined;
	}

	/**
	 * Find next transition, if it exists
	 * @param iterator previous iterator
	 * @returns the next iterator
	 */
	public findNext(iterator: ZoneTransitionIterator): ZoneTransitionIterator | undefined {
		if (!iterator.final) {
			if (iterator.index < this._transitions.length - 1) {
				return {
					transition: this._transitions[iterator.index + 1],
					index: iterator.index + 1
				};
			}
		}
		let found: ZoneTransition | undefined;
		for (let y = iterator.transition.atUtc.year; y < iterator.transition.atUtc.year + 2; ++y) {
			for (const ruleInfo of this._finalRules) {
				if (ruleInfo.applicable(y)) {
					const transition: ZoneTransition = {
						atUtc: ruleInfo.effectiveDateUtc(y, iterator.transition.newState.standardOffset, iterator.transition.newState.dstOffset),
						newState: {
							abbreviation: zoneAbbreviation(this._finalZoneInfo.format, ruleInfo.save.nonZero(), ruleInfo.letter),
							letter: ruleInfo.letter,
							dstOffset: ruleInfo.save,
							standardOffset: iterator.transition.newState.standardOffset
						}
					};
					if (transition.atUtc > iterator.transition.atUtc) {
						if (!found || found.atUtc > transition.atUtc) {
							found = transition;
						}
					}
				}
			}
		}
		if (found) {
			return {
				transition: found,
				index: 0,
				final: true
			};
		}
		return undefined;
	}

	/**
	 * Returns the zone state at the given UTC time
	 * @param utc
	 */
	public stateAt(utc: TimeStruct): ZoneState {
		let prevState = this._initialState;
		let iterator = this.findFirst();
		while (iterator && iterator.transition.atUtc <= utc) {
			prevState = iterator.transition.newState;
			iterator = this.findNext(iterator);
		}
		return prevState;
	}

	/**
	 * The transitions in year [start, end)
	 * @param start start year (inclusive)
	 * @param end end year (exclusive)
	 */
	public transitionsInYears(start: number, end: number): ZoneTransition[] {
		// check if start-1 is within the initial transitions or not. We use start-1 because we take an extra year in the else clause below
		const final = (this._transitions.length === 0 || this._transitions[this._transitions.length - 1].atUtc.year < start - 1);
		const result: ZoneTransition[] = [];
		if (!final) {
			// simply do linear search
			let iterator = this.findFirst();
			while (iterator && iterator.transition.atUtc.year < end) {
				if (iterator.transition.atUtc.year >= start) {
					result.push(iterator.transition);
				}
				iterator = this.findNext(iterator);
			}
		} else {
			const transitionsWithRules: { transition: ZoneTransition, ruleInfo: RuleInfo }[] = [];
			// Do something smart: first get all transitions with atUtc NOT compensated for standard offset
			// Take an extra year before start
			for (let year = start - 1; year < end; ++year) {
				for (const ruleInfo of this._finalRules) {
					if (ruleInfo.applicable(year)) {
						const transition: ZoneTransition = {
							atUtc: ruleInfo.effectiveDateUtc(year, this._finalZoneInfo.gmtoff, hours(0)),
							newState: {
								abbreviation: zoneAbbreviation(this._finalZoneInfo.format, ruleInfo.save.nonZero(), ruleInfo.letter),
								letter: ruleInfo.letter,
								dstOffset: ruleInfo.save,
								standardOffset: this._finalZoneInfo.gmtoff
							}
						};
						transitionsWithRules.push({ transition, ruleInfo });
					}
				}
			}
			transitionsWithRules.sort((a, b): number => a.transition.atUtc.unixMillis - b.transition.atUtc.unixMillis);
			// now apply DST offset retroactively
			let prevDst = hours(0);
			for (const tr of transitionsWithRules) {
				if (tr.ruleInfo.atType === AtType.Wall) {
					tr.transition.atUtc = new TimeStruct(tr.transition.atUtc.unixMillis - prevDst.milliseconds());
				}
				prevDst = tr.transition.newState.dstOffset;
				if (tr.transition.atUtc.year >= start) {
					result.push(tr.transition);
				}
			}
		}
		return result;
	}

	/**
	 * Calculate the initial state for the zone
	 * @param zoneName
	 * @param infos
	 * @param rules
	 * @throws timezonecomplete.InvalidTimeZoneData
	 */
	private _calcInitialState(
		zoneName: string,
		infos: ZoneInfo[],
		rules: Map<string, CachedRuleTransitions>
	): ZoneState {
		// initial state
		if (infos.length === 0) {
			return {
				abbreviation: "",
				letter: "",
				dstOffset: hours(0),
				standardOffset: hours(0)
			};
		}
		const info = infos[0];
		switch (info.ruleType) {
			case RuleType.None:
				return {
					abbreviation: zoneAbbreviation(info.format, false, undefined),
					letter: "",
					dstOffset: hours(0),
					standardOffset: info.gmtoff
				};
			case RuleType.Offset:
				return {
					abbreviation: zoneAbbreviation(info.format, info.ruleOffset.nonZero(), undefined),
					letter: "",
					dstOffset: info.ruleOffset,
					standardOffset: info.gmtoff
				};
			case RuleType.RuleName: {
				const rule = rules.get(info.ruleName);
				if (!rule) {
					throwError("InvalidTimeZoneData", "zone '%s' refers to non-existing rule '%s'", zoneName, info.ruleName);
				}
				// find first rule transition without DST so that we have a letter
				let iterator = rule.findFirst();
				while (iterator && iterator.transition.newState.dstOffset.nonZero()) {
					iterator = rule.findNext(iterator);
				}
				const letter = iterator?.transition.newState.letter ?? "";
				return {
					abbreviation: zoneAbbreviation(info.format, false, letter),
					dstOffset: hours(0),
					letter,
					standardOffset: info.gmtoff
				};
			}
			default:
				assert(false, "timezonecomplete.Assertion", "Unknown RuleType");
		}
	}

	/**
	 * Pre-calculate all transitions until there are only 'max' rules in effect
	 * @param zoneName
	 * @param initialState
	 * @param zoneInfos
	 * @param rules
	 */
	private _calcTransitions(
		zoneName: string,
		initialState: ZoneState,
		zoneInfos: ZoneInfo[],
		rules: Map<string, CachedRuleTransitions>
	): [ZoneTransition[], RuleInfo[]] {
		if (zoneInfos.length === 0) {
			return [[], []];
		}
		// walk through the zone records and add a transition for each
		let transitions: ZoneTransition[] = [];
		let prevState = initialState;
		let prevUntil: TimeStruct | undefined;
		let prevRules: CachedRuleTransitions | undefined;
		for (const zoneInfo of zoneInfos) {
			// zones can have a DST offset or they can refer to a rule set
			switch (zoneInfo.ruleType) {
				case RuleType.None:
				case RuleType.Offset: {
					if (prevUntil) {
						transitions.push({
							atUtc: prevUntil,
							newState: {
								abbreviation: zoneAbbreviation(zoneInfo.format, false, undefined),
								letter: "",
								dstOffset: zoneInfo.ruleType === RuleType.None ? hours(0) : zoneInfo.ruleOffset,
								standardOffset: zoneInfo.gmtoff
							}
						});
						prevRules = undefined;
					}
				} break;
				case RuleType.RuleName: {
					const rule = rules.get(zoneInfo.ruleName);
					if (!rule) {
						return throwError("InvalidTimeZoneData", "Zone '%s' refers to non-existing rule '%s'", zoneName, zoneInfo.ruleName);
					}
					const t = this._zoneTransitions(prevUntil, zoneInfo, rule);
					transitions = transitions.concat(t);
					prevRules = rule;
				} break;
				default:
					assert(false, "timezonecomplete.Assertion", "Unknown RuleType");
			}
			prevUntil = zoneInfo.until !== undefined ? new TimeStruct(zoneInfo.until) : undefined;
			prevState = transitions.length > 0 ? transitions[transitions.length - 1].newState : prevState;
		}
		return [transitions, prevRules?.final ?? []];
	}

	/**
	 * Creates all the transitions for a time zone from fromUtc (inclusive) to zoneInfo.until (exclusive).
	 * The result always contains an initial transition at fromUtc that signals the switch to this rule set
	 *
	 * @param fromUtc previous zone sub-record UNTIL time; undefined for first zone record
	 * @param zoneInfo the current zone sub-record
	 * @param rule the corresponding rule transitions
	 */
	private _zoneTransitions(fromUtc: TimeStruct | undefined, zoneInfo: ZoneInfo, rule: CachedRuleTransitions): ZoneTransition[] {
		// from tz-how-to.html:
		// One wrinkle, not fully explained in zic.8.txt, is what happens when switching to a named rule. To what values should the SAVE and
		// LETTER data be initialized?
		// - If at least one transition has happened, use the SAVE and LETTER data from the most recent.
		// - If switching to a named rule before any transition has happened, assume standard time (SAVE zero), and use the LETTER data from
		// the earliest transition with a SAVE of zero.

		const result: ZoneTransition[] = [];

		// extra initial transition for switch to this rule set (but not for first zone info)
		let initial: ZoneTransition | undefined;
		if (fromUtc !== undefined) {
			let initialRuleTransition = rule.findLastLessEqual(fromUtc, zoneInfo.gmtoff);
			if (initialRuleTransition) {
				initial = {
					atUtc: fromUtc,
					newState: {
						abbreviation: zoneAbbreviation(zoneInfo.format, false, initialRuleTransition.newState.letter),
						letter: initialRuleTransition.newState.letter ?? "",
						dstOffset: hours(0),
						standardOffset: zoneInfo.gmtoff
					}
				};
			} else {
				initialRuleTransition = rule.firstTransitionWithoutDstAfter(fromUtc, zoneInfo.gmtoff, undefined);
				initial = {
					atUtc: fromUtc,
					newState: {
						abbreviation: zoneAbbreviation(zoneInfo.format, false, initialRuleTransition?.newState.letter),
						letter: initialRuleTransition?.newState.letter ?? "",
						dstOffset: hours(0),
						standardOffset: zoneInfo.gmtoff
					}
				};
			}
			result.push(initial);
		}

		// actual rule transitions; keep adding until the end of this zone info, or until only 'max' rules remain
		let prevDst = initial?.newState.dstOffset ?? hours(0);
		let iterator = rule.findFirst();
		let effective: TimeStruct | undefined = iterator?.transition && ruleTransitionUtc(iterator.transition, zoneInfo.gmtoff, prevDst);
		while (
			iterator && effective &&
			((zoneInfo.until && effective.unixMillis < zoneInfo.until) || (!zoneInfo.until && !iterator.final))
		) {
			prevDst = iterator.transition.newState.dstOffset;
			result.push({
				atUtc: effective,
				newState: {
					abbreviation: zoneAbbreviation(zoneInfo.format, prevDst.nonZero(), iterator.transition.newState.letter),
					letter: iterator.transition.newState.letter ?? "",
					dstOffset: prevDst,
					standardOffset: zoneInfo.gmtoff
				}
			});
			iterator = rule.findNext(iterator);
			effective = iterator && ruleTransitionUtc(iterator.transition, zoneInfo.gmtoff, prevDst);
		}

		return result;
	}
}


/**
 * Calculate the formatted abbreviation for a zone
 * @param format the abbreviation format string. Either 'zzz,' for NULL;  'A/B' for std/dst, or 'A%sB' for a format string where %s is
 * replaced by a letter
 * @param dst whether DST is observed
 * @param letter current rule letter, empty if no rule
 * @returns fully formatted abbreviation
 */
function zoneAbbreviation(format: string, dst: boolean, letter: string|undefined): string {
	if (format === "zzz,") {
		return "";
	}
	if (format.includes("/")) {
		return (dst ? format.split("/")[1] : format.split("/")[0]);
	}
	if (letter) {
		return format.replace("%s", letter);
	}
	return format.replace("%s", "");
}

/**
 * Calculate the UTC time of a rule transition, given a particular time zone
 * @param transition
 * @param standardOffset zone offset from UT
 * @param dstOffset previous DST offset from UT+standardOffset
 * @returns UTC time
 */
function ruleTransitionUtc(transition: RuleTransition, standardOffset: Duration, dstOffset: Duration | undefined): TimeStruct {
	switch (transition.atType) {
		case AtType.Utc: return transition.at;
		case AtType.Standard: {
			// transition time is in zone local time without DST
			let millis = transition.at.unixMillis;
			millis -= standardOffset.milliseconds();
			return new TimeStruct(millis);
		}
		case AtType.Wall: {
			// transition time is in zone local time with DST
			let millis = transition.at.unixMillis;
			millis -= standardOffset.milliseconds();
			if (dstOffset) {
				millis -= dstOffset.milliseconds();
			}
			return new TimeStruct(millis);
		}
	}
}
