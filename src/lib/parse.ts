/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */

import { TimeComponentOpts, TimeStruct } from "./basics";
import { DEFAULT_LOCALE, Locale, PartialLocale } from "./locale";
import { TimeZone } from "./timezone";
import { Token, tokenize, TokenType } from "./token";

/**
 * TimeStruct plus zone
 */
export interface AwareTimeStruct {
	/**
	 * The time struct
	 */
	time: TimeStruct;
	/**
	 * The time zone (can be undefined)
	 */
	zone: TimeZone | undefined;
}

interface ParseNumberResult {
	n: number;
	remaining: string;
}

interface ParseZoneResult {
	zone?: TimeZone;
	remaining: string;
}

interface ParseDayPeriodResult {
	type: "am" | "pm" | "noon" | "midnight";
	remaining: string;
}


/**
 * Checks if a given datetime string is according to the given format
 * @param dateTimeString The string to test
 * @param formatString LDML format string (see LDML.md)
 * @param allowTrailing Allow trailing string after the date+time
 * @param locale Locale-specific constants such as month names
 * @returns true iff the string is valid
 */
export function parseable(
	dateTimeString: string,
	formatString: string,
	allowTrailing: boolean = true,
	locale: PartialLocale = {}
): boolean {
	try {
		parse(dateTimeString, formatString, undefined, allowTrailing, locale);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Parse the supplied dateTime assuming the given format.
 *
 * @param dateTimeString The string to parse
 * @param formatString The formatting string to be applied
 * @param locale Locale-specific constants such as month names
 * @return string
 */
export function parse(
	dateTimeString: string,
	formatString: string,
	overrideZone?: TimeZone | null | undefined,
	allowTrailing: boolean = true,
	locale: PartialLocale = {}
): AwareTimeStruct {
	if (!dateTimeString) {
		throw new Error("no date given");
	}
	if (!formatString) {
		throw new Error("no format given");
	}
	const mergedLocale: Locale = {
		...DEFAULT_LOCALE,
		...locale
	};
	try {
		const tokens: Token[] = tokenize(formatString);
		const time: TimeComponentOpts = { year: undefined };
		let zone: TimeZone | undefined;
		let pnr: ParseNumberResult | undefined;
		let pzr: ParseZoneResult | undefined;
		let dpr: ParseDayPeriodResult | undefined;
		let era: number = 1;
		let quarter: number | undefined;
		let remaining: string = dateTimeString;
		for (const token of tokens) {
			switch (token.type) {
				case TokenType.ERA:
					[era, remaining] = stripEra(token, remaining, mergedLocale);
					break;
				case TokenType.QUARTER: {
					const r = stripQuarter(token, remaining, mergedLocale);
					quarter = r.n;
					remaining = r.remaining;
				} break;
				/* istanbul ignore next */
				case TokenType.WEEKDAY:
				/* istanbul ignore next */
				case TokenType.WEEK:
					/* istanbul ignore next */
					break; // nothing to learn from this
				case TokenType.DAYPERIOD:
					dpr = stripDayPeriod(token, remaining, mergedLocale);
					remaining = dpr.remaining;
					break;
				case TokenType.YEAR:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					time.year = pnr.n;
					break;
				case TokenType.MONTH:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					time.month = pnr.n;
					break;
				case TokenType.DAY:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					time.day = pnr.n;
					break;
				case TokenType.HOUR:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					time.hour = pnr.n;
					break;
				case TokenType.MINUTE:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					time.minute = pnr.n;
					break;
				case TokenType.SECOND:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					if (token.raw.charAt(0) === "s") {
						time.second = pnr.n;
					} else /* istanbul ignore else */ if (token.raw.charAt(0) === "S") {
						time.milli = pnr.n;
					} else {
						throw new Error(`unsupported second format '${token.raw}'`);
					}
					break;
				case TokenType.ZONE:
					pzr = stripZone(remaining);
					remaining = pzr.remaining;
					zone = pzr.zone;
					break;
				/* istanbul ignore next */
				default:
				case TokenType.IDENTITY:
					remaining = stripRaw(remaining, token.raw);
					break;
			}
		}
		if (dpr) {
			switch (dpr.type) {
				case "am":
					if (time.hour !== undefined && time.hour >= 12) {
						time.hour -= 12;
					}
				break;
				case "pm":
					if (time.hour !== undefined && time.hour < 12) {
						time.hour += 12;
					}
				break;
				case "noon":
					if (time.hour === undefined) {
						time.hour = 12;
					}
					if (time.minute === undefined) {
						time.minute = 0;
					}
					if (time.second === undefined) {
						time.second = 0;
					}
					if (time.milli === undefined) {
						time.milli = 0;
					}
					if (time.hour !== 12 || time.minute !== 0 || time.second !== 0 || time.milli !== 0) {
						throw new Error(`invalid time, contains 'noon' specifier but time differs from noon`);
					}
				break;
				case "midnight":
					if (time.hour === undefined) {
						time.hour = 0;
					}
					if (time.hour === 12) {
						time.hour = 0;
					}
					if (time.minute === undefined) {
						time.minute = 0;
					}
					if (time.second === undefined) {
						time.second = 0;
					}
					if (time.milli === undefined) {
						time.milli = 0;
					}
					if (time.hour !== 0 || time.minute !== 0 || time.second !== 0 || time.milli !== 0) {
						throw new Error(`invalid time, contains 'midnight' specifier but time differs from midnight`);
					}
				break;
			}
		}
		if (time.year !== undefined) {
			time.year *= era;
		}
		if (quarter !== undefined) {
			if (time.month === undefined) {
				switch (quarter) {
					case 1: time.month = 1; break;
					case 2: time.month = 4; break;
					case 3: time.month = 7; break;
					case 4: time.month = 10; break;
				}
			} else {
				let error = false;
				switch (quarter) {
					case 1: error = !(time.month >= 1 && time.month <= 3); break;
					case 2: error = !(time.month >= 4 && time.month <= 6); break;
					case 3: error = !(time.month >= 7 && time.month <= 9); break;
					case 4: error = !(time.month >= 10 && time.month <= 12); break;
				}
				if (error) {
					throw new Error("the quarter does not match the month");
				}
			}
		}

		if (time.year === undefined) {
			time.year = 1970;
		}
		const result: AwareTimeStruct = { time: new TimeStruct(time), zone };
		if (!result.time.validate()) {
			throw new Error(`invalid resulting date`);
		}
		// always overwrite zone with given zone
		if (overrideZone) {
			result.zone = overrideZone;
		}
		if (remaining && !allowTrailing) {
			throw new Error(
				`invalid date '${dateTimeString}' not according to format '${formatString}': trailing characters: '${remaining}'`
			);
		}
		return result;
	} catch (e) {
		throw new Error(`invalid date '${dateTimeString}' not according to format '${formatString}': ${e.message}`);
	}
}


function stripNumber(s: string): ParseNumberResult {
	const result: ParseNumberResult = {
		n: NaN,
		remaining: s
	};
	let numberString = "";
	while (result.remaining.length > 0 && result.remaining.charAt(0).match(/\d/)) {
		numberString += result.remaining.charAt(0);
		result.remaining = result.remaining.substr(1);
	}
	// remove leading zeroes
	while (numberString.charAt(0) === "0" && numberString.length > 1) {
		numberString = numberString.substr(1);
	}
	result.n = parseInt(numberString, 10);
	if (numberString === "" || !isFinite(result.n)) {
		throw new Error(`expected a number but got '${numberString}'`);
	}
	return result;
}

const WHITESPACE = [" ", "\t", "\r", "\v", "\n"];

function stripZone(s: string): ParseZoneResult {
	if (s.length === 0) {
		throw new Error("no zone given");
	}
	const result: ParseZoneResult = {
		remaining: s
	};
	let zoneString = "";
	while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
		zoneString += result.remaining.charAt(0);
		result.remaining = result.remaining.substr(1);
	}
	/* istanbul ignore next */
	if (zoneString.trim()) {
		result.zone = TimeZone.zone(zoneString);
	}
	return result;
}

function stripRaw(s: string, expected: string): string {
	let remaining = s;
	let eremaining = expected;
	while (remaining.length > 0 && eremaining.length > 0 && remaining.charAt(0) === eremaining.charAt(0)) {
		remaining = remaining.substr(1);
		eremaining = eremaining.substr(1);
	}
	if (eremaining.length > 0) {
		throw new Error(`expected '${expected}'`);
	}
	return remaining;
}

function stripDayPeriod(token: Token, remaining: string, locale: Locale): ParseDayPeriodResult {
	let offsets: {[index: string]: "am" | "pm" | "noon" | "midnight"};
	switch (token.symbol) {
		case "a":
			switch (token.length) {
				case 4:
					offsets = {
						[locale.dayPeriodWide.am]: "am",
						[locale.dayPeriodWide.pm]: "pm"
					};
				break;
				case 5:
					offsets = {
						[locale.dayPeriodNarrow.am]: "am",
						[locale.dayPeriodNarrow.pm]: "pm"
					};
				break;
				default:
					offsets = {
						[locale.dayPeriodAbbreviated.am]: "am",
						[locale.dayPeriodAbbreviated.pm]: "pm"
					};
				break;
			}
		break;
		default:
			switch (token.length) {
				case 4:
					offsets = {
						[locale.dayPeriodWide.am]: "am",
						[locale.dayPeriodWide.midnight]: "midnight",
						[locale.dayPeriodWide.pm]: "pm",
						[locale.dayPeriodWide.noon]: "noon"
					};
				break;
				case 5:
					offsets = {
						[locale.dayPeriodNarrow.am]: "am",
						[locale.dayPeriodNarrow.midnight]: "midnight",
						[locale.dayPeriodNarrow.pm]: "pm",
						[locale.dayPeriodNarrow.noon]: "noon"
					};
				break;
				default:
					offsets = {
						[locale.dayPeriodAbbreviated.am]: "am",
						[locale.dayPeriodAbbreviated.midnight]: "midnight",
						[locale.dayPeriodAbbreviated.pm]: "pm",
						[locale.dayPeriodAbbreviated.noon]: "noon"
					};
				break;
			}
		break;
	}
	// match longest possible day period string; sort keys by length descending
	const sortedKeys: string[] = Object.keys(offsets)
		.sort((a: string, b: string): number => (a.length < b.length ? 1 : a.length > b.length ? -1 : 0));

	const upper = remaining.toUpperCase();
	for (const key of sortedKeys) {
		if (upper.startsWith(key.toUpperCase())) {
			return {
				type: offsets[key],
				remaining: remaining.slice(key.length)
			};
		}
	}
	throw new Error("missing day period i.e. " + Object.keys(offsets).join(", "));
}

/**
 * Returns factor -1 or 1 depending on BC or AD
 * @param token
 * @param remaining
 * @param locale
 * @returns [factor, remaining]
 */
function stripEra(token: Token, remaining: string, locale: Locale): [number, string] {
	let allowed: string[];
	switch (token.length) {
		case 4: allowed = locale.eraWide; break;
		case 5: allowed = locale.eraNarrow; break;
		default: allowed = locale.eraAbbreviated; break;
	}
	const result = stripStrings(token, remaining, allowed);
	return [allowed.indexOf(result.chosen) === 0 ? 1 : -1, result.remaining];
}

function stripQuarter(token: Token, remaining: string, locale: Locale): ParseNumberResult {
	switch (token.length) {
		case 1:
		case 2:
		case 5:
			return stripNumber(remaining);
		case 3: {
			const allowed = [1, 2, 3, 4].map((n: number): string => locale.quarterLetter + n.toString(10));
			const r = stripStrings(token, remaining, allowed);
			return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
		}
		case 4: {
			const allowed = locale.quarterAbbreviations.map((a: string): string => a + " " + locale.quarterWord);
			const r = stripStrings(token, remaining, allowed);
			return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
		}
		default:
			throw new Error("invalid quarter pattern");
	}
}

function stripStrings(token: Token, remaining: string, allowed: string[]): { remaining: string, chosen: string } {
	// match longest possible string; sort keys by length descending
	const sortedKeys: string[] = allowed.slice()
		.sort((a: string, b: string): number => (a.length < b.length ? 1 : a.length > b.length ? -1 : 0));

	const upper = remaining.toUpperCase();
	for (const key of sortedKeys) {
		if (upper.startsWith(key.toUpperCase())) {
			return {
				chosen: key,
				remaining: remaining.slice(key.length)
			};
		}
	}
	throw new Error("invalid " + TokenType[token.type].toLowerCase() + ", expected one of " + allowed.join(", "));
}
