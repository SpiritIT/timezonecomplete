/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 *
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 */

"use strict";

import assert from "./assert";
import { TimeComponentOpts, TimeStruct, TimeUnit, WeekDay } from "./basics";
import * as basics from "./basics";
import { Duration } from "./duration";
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

	constructor(
		/**
		 * FROM column year number.
		 * Note, can be -10000 for NaN value (e.g. for "SystemV" rules)
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
	 * Returns the date that the rule takes effect. Note that the time
	 * is NOT adjusted for wall clock time or standard time, i.e. this.atType is
	 * not taken into account
	 */
	public effectiveDate(year: number): TimeStruct {
		assert(this.applicable(year), "Rule is not applicable in " + year.toString(10));

		// year and month are given
		const tm: TimeComponentOpts = {year, month: this.inMonth };

		// calculate day
		switch (this.onType) {
			case OnType.DayNum: {
				tm.day = this.onDay;
			} break;
			case OnType.GreqX: {
				tm.day = basics.weekDayOnOrAfter(year, this.inMonth, this.onDay, this.onWeekDay);
			} break;
			case OnType.LeqX: {
				tm.day = basics.weekDayOnOrBefore(year, this.inMonth, this.onDay, this.onWeekDay);
			} break;
			case OnType.LastX: {
				tm.day = basics.lastWeekDayOfMonth(year, this.inMonth, this.onWeekDay);
			} break;
		}

		// calculate time
		tm.hour = this.atHour;
		tm.minute = this.atMinute;
		tm.second = this.atSecond;

		return new TimeStruct(tm);
	}

	/**
	 * Returns the transition moment in UTC in the given year
	 *
	 * @param year	The year for which to return the transition
	 * @param standardOffset	The standard offset for the timezone without DST
	 * @param prevRule	The previous rule
	 */
	public transitionTimeUtc(year: number, standardOffset: Duration, prevRule?: RuleInfo): number {
		assert(this.applicable(year), "Rule not applicable in given year");
		const unixMillis = this.effectiveDate(year).unixMillis;

		// adjust for given offset
		let offset: Duration;
		switch (this.atType) {
			case AtType.Utc:
				offset = Duration.hours(0);
				break;
			case AtType.Standard:
				offset = standardOffset;
				break;
			case AtType.Wall:
				if (prevRule) {
					offset = standardOffset.add(prevRule.save);
				} else {
					offset = standardOffset;
				}
				break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore if */
				/* istanbul ignore next */
				if (true) {
					throw new Error("unknown AtType");
				}
		}

		return unixMillis - offset.milliseconds();
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

function monthNameToString(name: string): number {
	for (let i: number = 1; i <= 12; ++i) {
		if (TzMonthNames[i] === name) {
			return i;
		}
	}
	/* istanbul ignore if */
	/* istanbul ignore next */
	if (true) {
		throw new Error("Invalid month name \"" + name + "\"");
	}
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
 */
export function isValidOffsetString(s: string): boolean {
	return /^(\-|\+)?([0-9]+((\:[0-9]+)?(\:[0-9]+(\.[0-9]+)?)?))$/.test(s);
}

/**
 * Defines a moment at which the given rule becomes valid
 */
export class Transition {
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
	 */
	public static init(data?: any | any[]): void {
		if (data) {
			TzDatabase._instance = undefined; // needed for assert in constructor
			TzDatabase._instance = new TzDatabase(Array.isArray(data) ? data : [data]);
		} else {
			const data: any[] = [];
			// try to find TZ data in global variables
			const g: any = (global ? global : window);
			if (g) {
				for (const key of Object.keys(g)) {
					if (key.indexOf("tzdata") === 0) {
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
	 */
	private constructor(data: any[]) {
		assert(!TzDatabase._instance, "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
		assert(data.length > 0,
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
	 */
	public zoneNames(): string[] {
		if (!this._zoneNames) {
			this._zoneNames = Object.keys(this._data.zones);
			this._zoneNames.sort();
		}
		return this._zoneNames;
	}

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
	 */
	public minDstSave(zoneName?: string): Duration {
		if (zoneName) {
			const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
			let result: Duration | undefined;
			const ruleNames: string[] = [];
			for (let i = 0; i < zoneInfos.length; ++i) {
				const zoneInfo = zoneInfos[i];
				if (zoneInfo.ruleType === RuleType.Offset) {
					if (!result || result.greaterThan(zoneInfo.ruleOffset)) {
						if (zoneInfo.ruleOffset.milliseconds() !== 0) {
							result = zoneInfo.ruleOffset;
						}
					}
				}
				if (zoneInfo.ruleType === RuleType.RuleName
					&& ruleNames.indexOf(zoneInfo.ruleName) === -1) {
					ruleNames.push(zoneInfo.ruleName);
					const temp = this.getRuleInfos(zoneInfo.ruleName);
					for (let j = 0; j < temp.length; ++j) {
						const ruleInfo = temp[j];
						if (!result || result.greaterThan(ruleInfo.save)) {
							if (ruleInfo.save.milliseconds() !== 0) {
								result = ruleInfo.save;
							}
						}
					};
				}
			};
			if (!result) {
				result = Duration.hours(0);
			}
			return result.clone();
		} else {
			return Duration.minutes(this._minmax.minDstSave);
		}
	}

	/**
	 * Maximum DST offset (which excludes standard offset) of all rules in the database.
	 * Note that DST offsets need not be whole hours.
	 *
	 * Returns 0 if zoneName given and no DST observed.
	 *
	 * @param zoneName	(optional) if given, the result for the given zone is returned
	 */
	public maxDstSave(zoneName?: string): Duration {
		if (zoneName) {
			const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
			let result: Duration | undefined;
			const ruleNames: string[] = [];
			for (let i = 0; i < zoneInfos.length; ++i) {
				const zoneInfo = zoneInfos[i];
				if (zoneInfo.ruleType === RuleType.Offset) {
					if (!result || result.lessThan(zoneInfo.ruleOffset)) {
						result = zoneInfo.ruleOffset;
					}
				}
				if (zoneInfo.ruleType === RuleType.RuleName
					&& ruleNames.indexOf(zoneInfo.ruleName) === -1) {
					ruleNames.push(zoneInfo.ruleName);
					const temp = this.getRuleInfos(zoneInfo.ruleName);
					for (let j = 0; j < temp.length; ++j) {
						const ruleInfo = temp[j];
						if (!result || result.lessThan(ruleInfo.save)) {
							result = ruleInfo.save;
						}
					};
				}
			};
			if (!result) {
				result = Duration.hours(0);
			}
			return result.clone();
		} else {
			return Duration.minutes(this._minmax.maxDstSave);
		}
	}

	/**
	 * Checks whether the zone has DST at all
	 */
	public hasDst(zoneName: string): boolean {
		return (this.maxDstSave(zoneName).milliseconds() !== 0);
	}

	/**
	 * First DST change moment AFTER the given UTC date in UTC milliseconds, within one year,
	 * returns undefined if no such change
	 */
	public nextDstChange(zoneName: string, utcTime: number): number | undefined;
	public nextDstChange(zoneName: string, utcTime: TimeStruct): number | undefined;
	public nextDstChange(zoneName: string, a: TimeStruct | number): number | undefined {
		let zoneInfo: ZoneInfo;
		const utcTime: TimeStruct = (typeof a === "number" ? new TimeStruct(a) : a);

		// get all zone infos for [date, date+1year)
		const allZoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
		const relevantZoneInfos: ZoneInfo[] = [];
		const rangeStart: number = utcTime.unixMillis;
		const rangeEnd: number = rangeStart + 365 * 86400E3;
		let prevEnd: number | undefined;
		for (let i = 0; i < allZoneInfos.length; ++i) {
			zoneInfo = allZoneInfos[i];
			if ((prevEnd === undefined || prevEnd < rangeEnd) && (zoneInfo.until === undefined || zoneInfo.until > rangeStart)) {
				relevantZoneInfos.push(zoneInfo);
			}
			prevEnd = zoneInfo.until;
		}

		// collect all transitions in the zones for the year
		let transitions: Transition[] = [];
		for (let i = 0; i < relevantZoneInfos.length; ++i) {
			zoneInfo = relevantZoneInfos[i];
			// find applicable transition moments
			transitions = transitions.concat(
				this.getTransitionsDstOffsets(zoneInfo.ruleName, utcTime.components.year - 1, utcTime.components.year + 1, zoneInfo.gmtoff)
			);
		}
		transitions.sort((a: Transition, b: Transition): number => {
			return a.at - b.at;
		});

		// find the first after the given date that has a different offset
		let prevSave: Duration | undefined;
		for (let i = 0; i < transitions.length; ++i) {
			const transition = transitions[i];
			if (!prevSave || !prevSave.equals(transition.offset)) {
				if (transition.at > utcTime.unixMillis) {
					return transition.at;
				}
			}
			prevSave = transition.offset;
		}

		return undefined;
	}

	/**
	 * Returns true iff the given zone name eventually links to
	 * "Etc/UTC", "Etc/GMT" or "Etc/UCT" in the TZ database. This is true e.g. for
	 * "UTC", "GMT", "Etc/GMT" etc.
	 *
	 * @param zoneName	IANA time zone name.
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
	 * @param localTime	A local time, either as a TimeStruct or as a unix millisecond value
	 * @param opt	(optional) Round up or down? Default: up.
	 *
	 * @return	The normalized time, in the same format as the localTime parameter (TimeStruct or unix millis)
	 */
	public normalizeLocal(zoneName: string, localTime: number, opt?: NormalizeOption): number;
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
			const transitions: Transition[] = this.getTransitionsTotalOffsets(
				zoneName, localTime.components.year - 1, localTime.components.year + 1
			);

			// find the DST forward transitions
			let prev: Duration = Duration.hours(0);
			for (let i = 0; i < transitions.length; ++i) {
				const transition = transitions[i];
				// forward transition?
				if (transition.offset.greaterThan(prev)) {
					const localBefore: number = transition.at + prev.milliseconds();
					const localAfter: number = transition.at + transition.offset.milliseconds();
					if (localTime.unixMillis >= localBefore && localTime.unixMillis < localAfter) {
						const forwardChange = transition.offset.sub(prev);
						// non-existing time
						const factor: number = (opt === NormalizeOption.Up ? 1 : -1);
						const resultMillis = localTime.unixMillis + factor * forwardChange.milliseconds();
						return (typeof a === "number" ? resultMillis : new TimeStruct(resultMillis));
					}
				}
				prev = transition.offset;
			};

			// no non-existing time
		}
		return (typeof a === "number" ? a : a.clone());
	}

	/**
	 * Returns the standard time zone offset from UTC, without DST.
	 * Throws if info not found.
	 * @param zoneName	IANA time zone name
	 * @param utcTime	Timestamp in UTC, either as TimeStruct or as Unix millisecond value
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
	 */
	public totalOffset(zoneName: string, utcTime: TimeStruct | number): Duration {
		const zoneInfo: ZoneInfo = this.getZoneInfo(zoneName, utcTime);
		let dstOffset: Duration;

		switch (zoneInfo.ruleType) {
			case RuleType.None: {
				dstOffset = Duration.minutes(0);
			} break;
			case RuleType.Offset: {
				dstOffset = zoneInfo.ruleOffset;
			} break;
			case RuleType.RuleName: {
				dstOffset = this.dstOffsetForRule(zoneInfo.ruleName, utcTime, zoneInfo.gmtoff);
			} break;
			default: // cannot happen, but the compiler doesnt realize it
				dstOffset = Duration.minutes(0);
				break;
		}

		return dstOffset.add(zoneInfo.gmtoff);
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
	 */
	public abbreviation(zoneName: string, utcTime: TimeStruct | number, dstDependent: boolean = true): string {
		const zoneInfo: ZoneInfo = this.getZoneInfo(zoneName, utcTime);
		const format: string = zoneInfo.format;

		// is format dependent on DST?
		if (format.indexOf("%s") !== -1
			&& zoneInfo.ruleType === RuleType.RuleName) {
			let letter: string;
			// place in format string
			if (dstDependent) {
				letter = this.letterForRule(zoneInfo.ruleName, utcTime, zoneInfo.gmtoff);
			} else {
				letter = "";
			}
			return format.replace("%s", letter);
		}

		return format;
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
	 */
	public standardOffsetLocal(zoneName: string, localTime: TimeStruct | number): Duration {
		const unixMillis = (typeof localTime === "number" ? localTime : localTime.unixMillis);
		const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
		for (let i = 0; i < zoneInfos.length; ++i) {
			const zoneInfo = zoneInfos[i];
			if (zoneInfo.until === undefined || zoneInfo.until + zoneInfo.gmtoff.milliseconds() > unixMillis) {
				return zoneInfo.gmtoff.clone();
			}
		}
		/* istanbul ignore if */
		/* istanbul ignore next */
		if (true) {
			throw new Error("No zone info found");
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

		const transitions: Transition[] = this.getTransitionsTotalOffsets(
			zoneName, normalizedTm.components.year - 1, normalizedTm.components.year + 1
		);
		let prev: Transition | undefined;
		let prevPrev: Transition | undefined;
		for (let i = 0; i < transitions.length; ++i) {
			const transition = transitions[i];
			if (transition.at + transition.offset.milliseconds() > normalizedTm.unixMillis) {
				// found offset: prev.offset applies
				break;
			}
			prevPrev = prev;
			prev = transition;
		}

		/* istanbul ignore else */
		if (prev) {
			// special care during backward change: take first occurrence of local time
			if (prevPrev && prevPrev.offset.greaterThan(prev.offset)) {
				// backward change
				const diff = prevPrev.offset.sub(prev.offset);
				if (normalizedTm.unixMillis >= prev.at + prev.offset.milliseconds()
					&& normalizedTm.unixMillis < prev.at + prev.offset.milliseconds() + diff.milliseconds()) {
					// within duplicate range
					return prevPrev.offset.clone();
				} else {
					return prev.offset.clone();
				}
			} else {
				return prev.offset.clone();
			}
		} else {
			// this cannot happen as the transitions array is guaranteed to contain a transition at the
			// beginning of the requested fromYear
			return Duration.hours(0);
		}
	}

	/**
	 * Returns the DST offset (WITHOUT the standard zone offset) for the given
	 * ruleset and the given UTC timestamp
	 *
	 * @param ruleName	name of ruleset
	 * @param utcTime	UTC timestamp
	 * @param standardOffset	Standard offset without DST for the time zone
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
	 * @param ruleName	name of ruleset
	 * @param utcTime	UTC timestamp as TimeStruct or unix millis
	 * @param standardOffset	Standard offset without DST for the time zone
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
	 * Return a list of all transitions in [fromYear..toYear] sorted by effective date
	 *
	 * @param ruleName	Name of the rule set
	 * @param fromYear	first year to return transitions for
	 * @param toYear	Last year to return transitions for
	 * @param standardOffset	Standard offset without DST for the time zone
	 *
	 * @return Transitions, with DST offsets (no standard offset included)
	 */
	public getTransitionsDstOffsets(ruleName: string, fromYear: number, toYear: number, standardOffset: Duration): Transition[] {
		assert(fromYear <= toYear, "fromYear must be <= toYear");

		const ruleInfos: RuleInfo[] = this.getRuleInfos(ruleName);
		const result: Transition[] = [];

		for (let y = fromYear; y <= toYear; y++) {
			let prevInfo: RuleInfo | undefined;
			for (let i = 0; i < ruleInfos.length; i++) {
				const ruleInfo: RuleInfo = ruleInfos[i];
				if (ruleInfo.applicable(y)) {
					result.push(new Transition(
						ruleInfo.transitionTimeUtc(y, standardOffset, prevInfo),
						ruleInfo.save,
						ruleInfo.letter));
				}
				prevInfo = ruleInfo;
			}
		}

		result.sort((a: Transition, b: Transition): number => {
			return a.at - b.at;
		});
		return result;
	}

	/**
	 * Return both zone and rule changes as total (std + dst) offsets.
	 * Adds an initial transition if there is no zone change within the range.
	 *
	 * @param zoneName	IANA zone name
	 * @param fromYear	First year to include
	 * @param toYear	Last year to include
	 */
	public getTransitionsTotalOffsets(zoneName: string, fromYear: number, toYear: number): Transition[] {
		assert(fromYear <= toYear, "fromYear must be <= toYear");

		const startMillis: number = basics.timeToUnixNoLeapSecs({ year: fromYear });
		const endMillis: number = basics.timeToUnixNoLeapSecs({ year: toYear + 1 });


		const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
		assert(zoneInfos.length > 0, "Empty zoneInfos array returned from getZoneInfos()");

		const result: Transition[] = [];

		let prevZone: ZoneInfo | undefined;
		let prevUntilYear: number | undefined;
		let prevStdOffset: Duration = Duration.hours(0);
		let prevDstOffset: Duration = Duration.hours(0);
		let prevLetter: string = "";
		for (let i = 0; i < zoneInfos.length; ++i) {
			const zoneInfo = zoneInfos[i];
			const untilYear: number = zoneInfo.until !== undefined ? new TimeStruct(zoneInfo.until).components.year : toYear + 1;
			let stdOffset: Duration = prevStdOffset;
			let dstOffset: Duration = prevDstOffset;
			let letter: string = prevLetter;

			// zone applicable?
			if ((!prevZone || prevZone.until < endMillis - 1) && (zoneInfo.until === undefined || zoneInfo.until >= startMillis)) {

				stdOffset = zoneInfo.gmtoff;

				switch (zoneInfo.ruleType) {
					case RuleType.None:
						dstOffset = Duration.hours(0);
						letter = "";
						break;
					case RuleType.Offset:
						dstOffset = zoneInfo.ruleOffset;
						letter = "";
						break;
					case RuleType.RuleName:
						// check whether the first rule takes effect immediately on the zone transition
						// (e.g. Lybia)
						if (prevZone) {
							const ruleInfos: RuleInfo[] = this.getRuleInfos(zoneInfo.ruleName);
							for (let j = 0; j < ruleInfos.length; ++j) {
								const ruleInfo = ruleInfos[j];
								if (typeof prevUntilYear === "number" && ruleInfo.applicable(prevUntilYear)) {
									if (ruleInfo.transitionTimeUtc(prevUntilYear, stdOffset, undefined) === prevZone.until) {
										dstOffset = ruleInfo.save;
										letter = ruleInfo.letter;
									}
								}
							};
						}
						break;
				}

				// add a transition for the zone transition
				const at: number = (prevZone && prevZone.until !== undefined ? prevZone.until : startMillis);
				result.push(new Transition(at, stdOffset.add(dstOffset), letter));

				// add transitions for the zone rules in the range
				if (zoneInfo.ruleType === RuleType.RuleName) {
					const dstTransitions: Transition[] = this.getTransitionsDstOffsets(
						zoneInfo.ruleName,
						prevUntilYear !== undefined ? Math.max(prevUntilYear, fromYear) : fromYear,
						Math.min(untilYear, toYear),
						stdOffset
					);
					for (let k = 0; k < dstTransitions.length; ++k) {
						const transition = dstTransitions[k];
						letter = transition.letter;
						dstOffset = transition.offset;
						result.push(new Transition(transition.at, transition.offset.add(stdOffset), transition.letter));
					};
				}
			}

			prevZone = zoneInfo;
			prevUntilYear = untilYear;
			prevStdOffset = stdOffset;
			prevDstOffset = dstOffset;
			prevLetter = letter;
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
	 */
	public getZoneInfo(zoneName: string, utcTime: TimeStruct | number): ZoneInfo {
		const unixMillis = (typeof utcTime === "number" ? utcTime : utcTime.unixMillis);
		const zoneInfos: ZoneInfo[] = this.getZoneInfos(zoneName);
		for (let i = 0; i < zoneInfos.length; ++i) {
			const zoneInfo = zoneInfos[i];
			if (zoneInfo.until === undefined || zoneInfo.until > unixMillis) {
				return zoneInfo;
			}
		}
		/* istanbul ignore if */
		/* istanbul ignore next */
		if (true) {
			throw new Error("No zone info found");
		}
	}

	/**
	 * Performance improvement: zone info cache
	 */
	private _zoneInfoCache: { [index: string]: ZoneInfo[] } = {};

	/**
	 * Return the zone records for a given zone name, after
	 * following any links.
	 *
	 * @param zoneName	IANA zone name like "Pacific/Efate"
	 * @return Array of zone infos. Do not change, this is a cached value.
	 */
	public getZoneInfos(zoneName: string): ZoneInfo[] {
		// FIRST validate zone name before searching cache
		/* istanbul ignore if */
		if (!this._data.zones.hasOwnProperty(zoneName)) {
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Zone \"" + zoneName + "\" not found.");
			}
		}

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
				throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \""
					+ zoneName + "\" via \"" + actualZoneName + "\"");
			}
			actualZoneName = zoneEntries;
			zoneEntries = this._data.zones[actualZoneName];
		}
		// final zone info found
		for (let i: number = 0; i < zoneEntries.length; ++i) {
			const zoneEntry = zoneEntries[i];
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
			return (a.until - b.until);
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
	 */
	public getRuleInfos(ruleName: string): RuleInfo[] {
		// validate name BEFORE searching cache
		if (!this._data.rules.hasOwnProperty(ruleName)) {
			throw new Error("Rule set \"" + ruleName + "\" not found.");
		}

		// return from cache
		if (this._ruleInfoCache.hasOwnProperty(ruleName)) {
			return this._ruleInfoCache[ruleName];
		}

		const result: RuleInfo[] = [];
		const ruleSet = this._data.rules[ruleName];
		for (let i = 0; i < ruleSet.length; ++i) {
			const rule = ruleSet[i];

			const fromYear: number = (rule[0] === "NaN" ? -10000 : parseInt(rule[0], 10));
			const toType: ToType = this.parseToType(rule[1]);
			const toYear: number = (toType === ToType.Max ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
			const onType: OnType = this.parseOnType(rule[4]);
			const onDay: number = this.parseOnDay(rule[4], onType);
			const onWeekDay: WeekDay = this.parseOnWeekDay(rule[4]);
			const monthName: string = <string>rule[3];
			const monthNumber: number = monthNameToString(monthName);

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
	}

	/**
	 * Parse the RULES column of a zone info entry
	 * and see what kind of entry it is.
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
	 */
	public parseToType(to: string): ToType {
		if (to === "max") {
			return ToType.Max;
		} else if (to === "only") {
			return ToType.Year; // yes we return Year for only
		} else if (!isNaN(parseInt(to, 10))) {
			return ToType.Year;
		} else {
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("TO column incorrect: " + to);
			}
		}
	}

	/**
	 * Parse the ON column of a rule info entry
	 * and see what kind of entry it is.
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
	 */
	public parseOnWeekDay(on: string): WeekDay {
		for (let i = 0; i < 7; i++) {
			if (on.indexOf(TzDayNames[i]) !== -1) {
				return <WeekDay>i;
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

}

interface MinMaxInfo {
	minDstSave: number;
	maxDstSave: number;
	minGmtOff: number;
	maxGmtOff: number;
}

/**
 * Sanity check on data. Returns min/max values.
 */
function validateData(data: any): MinMaxInfo {
	const result: Partial<MinMaxInfo> = {
	};

	/* istanbul ignore if */
	if (typeof(data) !== "object") {
		throw new Error("data is not an object");
	}
	/* istanbul ignore if */
	if (!data.hasOwnProperty("rules")) {
		throw new Error("data has no rules property");
	}
	/* istanbul ignore if */
	if (!data.hasOwnProperty("zones")) {
		throw new Error("data has no zones property");
	}

	// validate zones
	for (let zoneName in data.zones) {
		if (data.zones.hasOwnProperty(zoneName)) {
			const zoneArr: any = data.zones[zoneName];
			if (typeof (zoneArr) === "string") {
				// ok, is link to other zone, check link
				/* istanbul ignore if */
				if (!data.zones.hasOwnProperty(<string>zoneArr)) {
					throw new Error("Entry for zone \"" + zoneName + "\" links to \"" + <string>zoneArr + "\" but that doesn\'t exist");
				}
			} else {
				/* istanbul ignore if */
				if (!Array.isArray(zoneArr)) {
					throw new Error("Entry for zone \"" + zoneName + "\" is neither a string nor an array");
				}
				for (let i = 0; i < zoneArr.length; i++) {
					const entry: any = zoneArr[i];
					/* istanbul ignore if */
					if (!Array.isArray(entry)) {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
					}
					/* istanbul ignore if */
					if (entry.length !== 4) {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
					}
					/* istanbul ignore if */
					if (typeof entry[0] !== "string") {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
					}
					const gmtoff = math.filterFloat(entry[0]);
					/* istanbul ignore if */
					if (isNaN(gmtoff)) {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number");
					}
					/* istanbul ignore if */
					if (typeof entry[1] !== "string") {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
					}
					/* istanbul ignore if */
					if (typeof entry[2] !== "string") {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
					}
					/* istanbul ignore if */
					if (typeof entry[3] !== "string" && entry[3] !== null) {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null");
					}
					/* istanbul ignore if */
					if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
						throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number");
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
	for (let ruleName in data.rules) {
		if (data.rules.hasOwnProperty(ruleName)) {
			const ruleArr: any = data.rules[ruleName];
			/* istanbul ignore if */
			if (!Array.isArray(ruleArr)) {
				throw new Error("Entry for rule \"" + ruleName + "\" is not an array");
			}
			for (let i = 0; i < ruleArr.length; i++) {
				const rule = ruleArr[i];
					/* istanbul ignore if */
				if (!Array.isArray(rule)) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
				}
					/* istanbul ignore if */
				if (rule.length < 8) { // note some rules > 8 exists but that seems to be a bug in tz file parsing
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
				}
				for (let j = 0; j < rule.length; j++) {
					/* istanbul ignore if */
					if (j !== 5 && typeof rule[j] !== "string") {
						throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
					}
				}
				/* istanbul ignore if */
				if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
				}
				/* istanbul ignore if */
				if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
				}
				/* istanbul ignore if */
				if (!TzMonthNames.hasOwnProperty(rule[3])) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
				}
				/* istanbul ignore if */
				if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1
					&& rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))
				) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
				}
				/* istanbul ignore if */
				if (!Array.isArray(rule[5])) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
				}
				/* istanbul ignore if */
				if (rule[5].length !== 4) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
				}
				/* istanbul ignore if */
				if (isNaN(parseInt(rule[5][0], 10))) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
				}
				/* istanbul ignore if */
				if (isNaN(parseInt(rule[5][1], 10))) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
				}
				/* istanbul ignore if */
				if (isNaN(parseInt(rule[5][2], 10))) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
				}
				/* istanbul ignore if */
				if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w"
					&& rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
				}
				const save: number = parseInt(rule[6], 10);
				/* istanbul ignore if */
				if (isNaN(save)) {
					throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
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
