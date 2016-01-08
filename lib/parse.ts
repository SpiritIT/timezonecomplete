/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */

/// <reference path="../typings/lib.d.ts"/>

import util = require("util");

import basics = require("./basics");
import TimeStruct = basics.TimeStruct;

import token = require("./token");
import Tokenizer = token.Tokenizer;
import Token = token.Token;
import TokenType = token.DateTimeTokenType;

import strings = require("./strings");
import timeZone = require("./timezone");
import TimeZone = timeZone.TimeZone;

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
	zone?: timeZone.TimeZone;
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
 * Parse the supplied dateTime assuming the given format.
 *
 * @param dateTimeString The string to parse
 * @param formatString The formatting string to be applied
 * @return string
 */
export function parse(dateTimeString: string, formatString: string, zone?: TimeZone): AwareTimeStruct {
	if (!dateTimeString) {
		throw new Error("no date given");
	}
	if (!formatString) {
		throw new Error("no format given");
	}
	try {
		var tokenizer = new Tokenizer(formatString);
		var tokens: Token[] = tokenizer.parseTokens();
		var result: AwareTimeStruct = {
			time: new TimeStruct(0, 1, 1, 0, 0, 0, 0),
			zone: zone
		};
		var pnr: ParseNumberResult;
		var pzr: ParseZoneResult;
		var remaining: string = dateTimeString;
		tokens.forEach((token: Token): void => {
			var tokenResult: string;
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
						throw new Error(util.format("unsupported second format '%s'", token.raw));
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
		});
		if (!result.time.validate()) {
			throw new Error("resulting date invalid");
		}
		// always overwrite zone with given zone
		if (zone) {
			result.zone = zone;
		}
		return result;
	} catch (e) {
		throw new Error(util.format("Invalid date '%s' not according to format '%s': %s", dateTimeString, formatString, e.message));
	}
}


function stripNumber(s: string): ParseNumberResult {
	var result: ParseNumberResult = {
		n: NaN,
		remaining: s
	};
	var numberString = "";
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
		throw new Error(util.format("expected a number but got '%s'", numberString));
	}
	return result;
}

var WHITESPACE = [" ", "\t", "\r", "\v", "\n"];

function stripZone(s: string): ParseZoneResult {
	if (s.length === 0) {
		throw new Error("no zone given");
	}
	var result: ParseZoneResult = {
		zone: null,
		remaining: s
	};
	var zoneString = "";
	while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
		zoneString += result.remaining.charAt(0);
		result.remaining = result.remaining.substr(1);
	}
	result.zone = timeZone.zone(zoneString);
	return result;
}

function stripRaw(s: string, expected: string): string {
	var remaining = s;
	var eremaining = expected;
	while (remaining.length > 0 && eremaining.length > 0 && remaining.charAt(0) === eremaining.charAt(0)) {
		remaining = remaining.substr(1);
		eremaining = eremaining.substr(1);
	}
	if (eremaining.length > 0) {
		throw new Error(util.format("expected '%s'", expected));
	}
	return remaining;
}

