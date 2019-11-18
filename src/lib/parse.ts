/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */

import { TimeComponentOpts, TimeStruct } from "./basics";
import { error, errorIs, throwError } from "./error";
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
 * @throws nothing
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
 * @param overrideZone Use this zone in the result
 * @param allowTrailing Allow trailing characters in the source string
 * @param locale Locale-specific constants such as month names
 * @return string
 * @throws timezonecomplete.ParseError if the given dateTimeString is wrong or not according to the pattern
 * @throws timezonecomplete.Argument.FormatString if the given format string is invalid
 */
export function parse(
	dateTimeString: string,
	formatString: string,
	overrideZone?: TimeZone | null | undefined,
	allowTrailing: boolean = true,
	locale: PartialLocale = {}
): AwareTimeStruct {
	if (!dateTimeString) {
		return throwError("ParseError", "no date given");
	}
	if (!formatString) {
		return throwError("Argument.FormatString", "no format given");
	}
	const mergedLocale: Locale = {
		...DEFAULT_LOCALE,
		...locale
	};
	const yearCutoff = (new Date().getFullYear() + 50) % 100;

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
				case TokenType.WEEKDAY: {
					remaining = stripWeekDay(token, remaining, mergedLocale);
				} break;
				case TokenType.WEEK:
					remaining = stripNumber(remaining, 2).remaining;
					break; // nothing to learn from this
				case TokenType.DAYPERIOD:
					dpr = stripDayPeriod(token, remaining, mergedLocale);
					remaining = dpr.remaining;
					break;
				case TokenType.YEAR:
					pnr = stripNumber(remaining, Infinity);
					remaining = pnr.remaining;
					if (token.length === 2) {
						if (pnr.n > yearCutoff) {
							time.year = 1900 + pnr.n;
						} else {
							time.year = 2000 + pnr.n;
						}
					} else {
						time.year = pnr.n;
					}
					break;
				case TokenType.MONTH:
					pnr = stripMonth(token, remaining, mergedLocale);
					remaining = pnr.remaining;
					time.month = pnr.n;
					break;
				case TokenType.DAY:
					pnr = stripNumber(remaining, 2);
					remaining = pnr.remaining;
					time.day = pnr.n;
					break;
				case TokenType.HOUR:
					pnr = stripHour(token, remaining);
					remaining = pnr.remaining;
					time.hour = pnr.n;
					break;
				case TokenType.MINUTE:
					pnr = stripNumber(remaining, 2);
					remaining = pnr.remaining;
					time.minute = pnr.n;
					break;
				case TokenType.SECOND: {
					pnr = stripSecond(token, remaining);
					remaining = pnr.remaining;
					switch (token.symbol) {
						case "s": time.second = pnr.n; break;
						case "S": time.milli = 1000 * parseFloat("0." + Math.floor(pnr.n).toString(10).slice(0, 3)); break;
						case "A":
							time.hour = Math.floor((pnr.n / 3600E3));
							time.minute = Math.floor((pnr.n / 60E3) % 60);
							time.second = Math.floor((pnr.n / 1000) % 60);
							time.milli = pnr.n % 1000;
							break;
						/* istanbul ignore next */
						default:
							/* istanbul ignore next */
							return throwError("ParseError", `unsupported second format '${token.raw}'`);
					}
				} break;
				case TokenType.ZONE:
					pzr = stripZone(token, remaining);
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
					if (time.hour === undefined || time.hour === 0) {
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
						return throwError("ParseError", `invalid time, contains 'noon' specifier but time differs from noon`);
					}
				break;
				case "midnight":
					if (time.hour === undefined || time.hour === 12) {
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
						return throwError("ParseError", `invalid time, contains 'midnight' specifier but time differs from midnight`);
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
					return throwError("ParseError", "the quarter does not match the month");
				}
			}
		}
		if (time.year === undefined) {
			time.year = 1970;
		}
		const result: AwareTimeStruct = { time: new TimeStruct(time), zone };
		if (!result.time.validate()) {
			return throwError("ParseError", `invalid resulting date`);
		}
		// always overwrite zone with given zone
		if (overrideZone) {
			result.zone = overrideZone;
		}
		if (remaining && !allowTrailing) {
			return throwError("ParseError",
				`invalid date '${dateTimeString}' not according to format '${formatString}': trailing characters: '${remaining}'`
			);
		}
		return result;
	} catch (e) {
		return throwError("ParseError", `invalid date '${dateTimeString}' not according to format '${formatString}': ${e.message}`);
	}
}

const WHITESPACE = [" ", "\t", "\r", "\v", "\n"];

/**
 *
 * @param token
 * @param s
 * @throws timezonecomplete.NotImplemented if a pattern is used that isn't implemented yet (z, Z, v, V, x, X)
 * @throws timezonecomplete.ParseError if the given string is not parseable
 */
function stripZone(token: Token, s: string): ParseZoneResult {
	const unsupported: boolean =
		(token.symbol === "z")
		|| (token.symbol === "Z" && token.length === 5)
		|| (token.symbol === "v")
		|| (token.symbol === "V" && token.length !== 2)
		|| (token.symbol === "x" && token.length >= 4)
		|| (token.symbol === "X" && token.length >= 4)
		;
	if (unsupported) {
		return throwError("NotImplemented", "time zone pattern '" + token.raw + "' is not implemented");
	}
	const result: ParseZoneResult = {
		remaining: s
	};
	// chop off "GMT" prefix if needed
	let hadGMT = false;
	if ((token.symbol === "Z" && token.length === 4) || token.symbol === "O") {
		if (result.remaining.toUpperCase().startsWith("GMT")) {
			result.remaining = result.remaining.slice(3);
			hadGMT = true;
		}
	}
	// parse any zone, regardless of specified format
	let zoneString = "";
	while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
		zoneString += result.remaining.charAt(0);
		result.remaining = result.remaining.substr(1);
	}
	zoneString = zoneString.trim();
	if (zoneString) {
		// ensure chopping off GMT does not hide time zone errors (bit of a sloppy regex but OK)
		if (hadGMT && !zoneString.match(/[\+\-]?[\d\:]+/i)) {
			return throwError("ParseError", "invalid time zone 'GMT" + zoneString + "'");
		}
		try {
			result.zone = TimeZone.zone(zoneString);
		} catch (e) {
			if (errorIs(e, ["Argument.S", "NotFound.Zone"])) {
				e = error("ParseError", e.message);
			}
			throw e;
		}
	} else {
		return throwError("ParseError", "no time zone given");
	}
	return result;
}

/**
 *
 * @param s
 * @param expected
 * @throws timezonecomplete.ParseError
 */
function stripRaw(s: string, expected: string): string {
	let remaining = s;
	let eremaining = expected;
	while (remaining.length > 0 && eremaining.length > 0 && remaining.charAt(0) === eremaining.charAt(0)) {
		remaining = remaining.substr(1);
		eremaining = eremaining.substr(1);
	}
	if (eremaining.length > 0) {
		return throwError("ParseError", `expected '${expected}'`);
	}
	return remaining;
}

/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @throws timezonecomplete.ParseError
 */
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
	return throwError("ParseError", "missing day period i.e. " + Object.keys(offsets).join(", "));
}

/**
 * Returns factor -1 or 1 depending on BC or AD
 * @param token
 * @param remaining
 * @param locale
 * @returns [factor, remaining]
 * @throws timezonecomplete.ParseError
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

/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
function stripQuarter(token: Token, remaining: string, locale: Locale): ParseNumberResult {
	let quarterLetter: string;
	let quarterWord: string;
	let quarterAbbreviations: string[];
	switch (token.symbol) {
		case "Q":
			quarterLetter = locale.quarterLetter;
			quarterWord = locale.quarterWord;
			quarterAbbreviations = locale.quarterAbbreviations;
			break;
		case "q": {
			quarterLetter = locale.standAloneQuarterLetter;
			quarterWord = locale.standAloneQuarterWord;
			quarterAbbreviations = locale.standAloneQuarterAbbreviations;
			break;
		}
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			return throwError("Argument.FormatString", "invalid quarter pattern");
	}
	let allowed: string[];
	switch (token.length) {
		case 1:
		case 5:
			return stripNumber(remaining, 1);
		case 2:
			return stripNumber(remaining, 2);
		case 3:
			allowed = [1, 2, 3, 4].map((n: number): string => quarterLetter + n.toString(10));
			break;
		case 4:
			allowed = quarterAbbreviations.map((a: string): string => a + " " + quarterWord);
			break;
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			return throwError("Argument.FormatString", "invalid quarter pattern");
	}
	const r = stripStrings(token, remaining, allowed);
	return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
}

/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @returns remaining string
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
function stripWeekDay(token: Token, remaining: string, locale: Locale): string {
	let allowed: string[];
	switch (token.length) {
		case 1: {
			if (token.symbol === "e") {
				return stripNumber(remaining, 1).remaining;
			} else {
				allowed = locale.shortWeekdayNames;
			}
		} break;
		case 2: {
			if (token.symbol === "e") {
				return stripNumber(remaining, 2).remaining;
			} else {
				allowed = locale.shortWeekdayNames;
			}
		} break;
		case 3: allowed = locale.shortWeekdayNames; break;
		case 4: allowed = locale.longWeekdayNames; break;
		case 5: allowed = locale.weekdayLetters; break;
		case 6: allowed = locale.weekdayTwoLetters; break;
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			return throwError("Argument.FormatString", "invalid quarter pattern");
	}
	const r = stripStrings(token, remaining, allowed);
	return r.remaining;
}

/**
 *
 * @param token
 * @param remaining
 * @param locale
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
function stripMonth(token: Token, remaining: string, locale: Locale): ParseNumberResult {
	let shortMonthNames: string[];
	let longMonthNames: string[];
	let monthLetters: string[];
	switch (token.symbol) {
		case "M":
			shortMonthNames = locale.shortMonthNames;
			longMonthNames = locale.longMonthNames;
			monthLetters = locale.monthLetters;
			break;
		case "L":
			shortMonthNames = locale.standAloneShortMonthNames;
			longMonthNames = locale.standAloneLongMonthNames;
			monthLetters = locale.standAloneMonthLetters;
			break;
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			return throwError("Argument.FormatString", "invalid month pattern");
	}
	let allowed: string[];
	switch (token.length) {
		case 1:
		case 2:
			return stripNumber(remaining, 2);
		case 3:
			allowed = shortMonthNames;
			break;
		case 4:
			allowed = longMonthNames;
			break;
		case 5:
			allowed = monthLetters;
			break;
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			return throwError("Argument.FormatString", "invalid month pattern");
	}
	const r = stripStrings(token, remaining, allowed);
	return { n: allowed.indexOf(r.chosen) + 1, remaining: r.remaining };
}

/**
 *
 * @param token
 * @param remaining
 * @throws timezonecomplete.ParseError
 */
function stripHour(token: Token, remaining: string): ParseNumberResult {
	const result = stripNumber(remaining, 2);
	switch (token.symbol) {
		case "h":
			if (result.n === 12) {
				result.n = 0;
			}
			break;
		case "H":
			// nothing, in range 0-23
			break;
		case "K":
			// nothing, in range 0-11
			break;
		case "k":
			result.n -= 1;
			break;
	}
	return result;
}

/**
 *
 * @param token
 * @param remaining
 * @throws timezonecomplete.ParseError
 * @throws timezonecomplete.Argument.FormatString
 */
function stripSecond(token: Token, remaining: string): ParseNumberResult {
	switch (token.symbol) {
		case "s":
			return stripNumber(remaining, 2);
		case "S":
			return stripNumber(remaining, token.length);
		case "A":
			return stripNumber(remaining, 8);
		/* istanbul ignore next */
		default:
			/* istanbul ignore next */
			return throwError("Argument.FormatString", "invalid seconds pattern");
	}
}

/**
 *
 * @param s
 * @param maxLength
 * @throws timezonecomplete.ParseError
 */
function stripNumber(s: string, maxLength: number): ParseNumberResult {
	const result: ParseNumberResult = {
		n: NaN,
		remaining: s
	};
	let numberString = "";
	while (numberString.length < maxLength && result.remaining.length > 0 && result.remaining.charAt(0).match(/\d/)) {
		numberString += result.remaining.charAt(0);
		result.remaining = result.remaining.substr(1);
	}
	// remove leading zeroes
	while (numberString.charAt(0) === "0" && numberString.length > 1) {
		numberString = numberString.substr(1);
	}
	result.n = parseInt(numberString, 10);
	if (numberString === "" || !Number.isFinite(result.n)) {
		return throwError("ParseError", `expected a number but got '${numberString}'`);
	}
	return result;
}

/**
 *
 * @param token
 * @param remaining
 * @param allowed
 * @throws timezonecomplete.ParseError
 */
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
	return throwError("ParseError", "invalid " + TokenType[token.type].toLowerCase() + ", expected one of " + allowed.join(", "));
}
