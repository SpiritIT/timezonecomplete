/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */

import { TimeStruct } from "./basics";
import { Tokenizer, Token, DateTimeTokenType as TokenType } from "./token";
import * as strings from "./strings";
import { TimeZone } from "./timezone";

/**
 * TimeStruct plus zone
 */
export interface AwareTimeStruct {
	/**
	 * The time struct
	 */
	time: TimeStruct;
	/**
	 * The time zone
	 */
	zone?: TimeZone;
}

interface ParseNumberResult {
	n: number;
	remaining: string;
}

interface ParseZoneResult {
	zone: TimeZone;
	remaining: string;
}


/**
 * Checks if a given datetime string is according to the given format
 * @param dateTimeString The string to test
 * @param formatString LDML format string
 * @param allowTrailing Allow trailing string after the date+time
 * @returns true iff the string is valid
 */
export function parseable(dateTimeString: string, formatString: string, allowTrailing: boolean = true): boolean {
	try {
		parse(dateTimeString, formatString, null, allowTrailing);
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
 * @return string
 */
export function parse(dateTimeString: string, formatString: string, zone?: TimeZone, allowTrailing: boolean = true): AwareTimeStruct {
	if (!dateTimeString) {
		throw new Error("no date given");
	}
	if (!formatString) {
		throw new Error("no format given");
	}
	try {
		const tokenizer = new Tokenizer(formatString);
		const tokens: Token[] = tokenizer.parseTokens();
		const result: AwareTimeStruct = {
			time: new TimeStruct(0, 1, 1, 0, 0, 0, 0),
			zone: zone
		};
		let pnr: ParseNumberResult;
		let pzr: ParseZoneResult;
		let remaining: string = dateTimeString;
		for (let i = 0; i < tokens.length; ++i) {
			const token = tokens[i];
			let tokenResult: string;
			switch (token.type) {
				case TokenType.ERA:
					// nothing
					break;
				case TokenType.YEAR:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					result.time.year = pnr.n;
					break;
				case TokenType.QUARTER:
					// nothing
					break;
				case TokenType.MONTH:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					result.time.month = pnr.n;
					break;
				case TokenType.DAY:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					result.time.day = pnr.n;
					break;
				case TokenType.WEEKDAY:
					// nothing
					break;
				case TokenType.DAYPERIOD:
					// nothing
					break;
				case TokenType.HOUR:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					result.time.hour = pnr.n;
					break;
				case TokenType.MINUTE:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					result.time.minute = pnr.n;
					break;
				case TokenType.SECOND:
					pnr = stripNumber(remaining);
					remaining = pnr.remaining;
					if (token.raw.charAt(0) === "s") {
						result.time.second = pnr.n;
					} else if (token.raw.charAt(0) === "S") {
						result.time.milli = pnr.n;
					} else {
						throw new Error(`unsupported second format '${token.raw}'`);
					}
					break;
				case TokenType.ZONE:
					pzr = stripZone(remaining);
					remaining = pzr.remaining;
					result.zone = pzr.zone;
					break;
				case TokenType.WEEK:
					// nothing
					break;
				default:
				case TokenType.IDENTITY:
					remaining = stripRaw(remaining, token.raw);
					break;
			}
		};
		if (!result.time.validate()) {
			throw new Error("resulting date invalid");
		}
		// always overwrite zone with given zone
		if (zone) {
			result.zone = zone;
		}
		if (remaining && !allowTrailing) {
			throw new Error(
				`invalid date '${dateTimeString}' not according to format '${formatString}': trailing characters: 'remaining'`
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
		zone: null,
		remaining: s
	};
	let zoneString = "";
	while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
		zoneString += result.remaining.charAt(0);
		result.remaining = result.remaining.substr(1);
	}
	result.zone = TimeZone.zone(zoneString);
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

