/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */

"use strict";

import { TimeStruct } from "./basics";
import * as basics from "./basics";
import { Tokenizer, Token, DateTimeTokenType as TokenType } from "./token";
import * as strings from "./strings";
import { TimeZone } from "./timezone";


export interface FormatOptions {
	/**
	 * The letter indicating a quarter e.g. "Q" (becomes Q1, Q2, Q3, Q4)
	 */
	quarterLetter?: string;
	/**
	 * The word for 'quarter'
	 */
	quarterWord?: string;
	/**
	 * Quarter abbreviations e.g. 1st, 2nd, 3rd, 4th
	 */
	quarterAbbreviations?: string[];

	/**
	 * Month names
	 */
	longMonthNames?: string[];
	/**
	 * Three-letter month names
	 */
	shortMonthNames?: string[];
	/**
	 * Month letters
	 */
	monthLetters?: string[];

	/**
	 * Week day names, starting with sunday
	 */
	longWeekdayNames?: string[];
	shortWeekdayNames?: string[];
	weekdayTwoLetters?: string[];
	weekdayLetters?: string[];
}

export const LONG_MONTH_NAMES =
	["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const SHORT_MONTH_NAMES =
	["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const MONTH_LETTERS =
	["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const LONG_WEEKDAY_NAMES =
	["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const SHORT_WEEKDAY_NAMES =
	["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const WEEKDAY_TWO_LETTERS =
	["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const WEEKDAY_LETTERS =
	["S", "M", "T", "W", "T", "F", "S"];

export const QUARTER_LETTER = "Q";
export const QUARTER_WORD = "quarter";
export const QUARTER_ABBREVIATIONS = ["1st", "2nd", "3rd", "4th"];

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
	quarterLetter: QUARTER_LETTER,
	quarterWord: QUARTER_WORD,
	quarterAbbreviations: QUARTER_ABBREVIATIONS,
	longMonthNames: LONG_MONTH_NAMES,
	shortMonthNames: SHORT_MONTH_NAMES,
	monthLetters: MONTH_LETTERS,
	longWeekdayNames: LONG_WEEKDAY_NAMES,
	shortWeekdayNames: SHORT_WEEKDAY_NAMES,
	weekdayTwoLetters: WEEKDAY_TWO_LETTERS,
	weekdayLetters: WEEKDAY_LETTERS
};


/**
 * Format the supplied dateTime with the formatting string.
 *
 * @param dateTime The current time to format
 * @param utcTime The time in UTC
 * @param localZone The zone that currentTime is in
 * @param formatString The formatting string to be applied
 * @param formatOptions Other format options such as month names
 * @return string
 */
export function format(
	dateTime: TimeStruct,
	utcTime: TimeStruct,
	localZone: TimeZone,
	formatString: string,
	formatOptions: FormatOptions = {}
): string {
	// merge format options with default format options
	// typecast to prevent error TS7017: Index signature of object type implicitly has an 'any' type.
	const givenFormatOptions: any = formatOptions;
	const defaultFormatOptions: any = DEFAULT_FORMAT_OPTIONS;
	const mergedFormatOptions: any = {};
	for (const name in DEFAULT_FORMAT_OPTIONS) {
		if (DEFAULT_FORMAT_OPTIONS.hasOwnProperty(name)) {
			const givenFormatOption: any = givenFormatOptions[name];
			const defaultFormatOption: any = defaultFormatOptions[name];
			mergedFormatOptions[name] = givenFormatOption || defaultFormatOption;
		}
	}
	formatOptions = mergedFormatOptions;

	const tokenizer = new Tokenizer(formatString);
	const tokens: Token[] = tokenizer.parseTokens();
	let result: string = "";
	tokens.forEach((token: Token): void => {
		let tokenResult: string;
		switch (token.type) {
			case TokenType.ERA:
				tokenResult = _formatEra(dateTime, token);
				break;
			case TokenType.YEAR:
				tokenResult = _formatYear(dateTime, token);
				break;
			case TokenType.QUARTER:
				tokenResult = _formatQuarter(dateTime, token, formatOptions);
				break;
			case TokenType.MONTH:
				tokenResult = _formatMonth(dateTime, token, formatOptions);
				break;
			case TokenType.DAY:
				tokenResult = _formatDay(dateTime, token);
				break;
			case TokenType.WEEKDAY:
				tokenResult = _formatWeekday(dateTime, token, formatOptions);
				break;
			case TokenType.DAYPERIOD:
				tokenResult = _formatDayPeriod(dateTime, token);
				break;
			case TokenType.HOUR:
				tokenResult = _formatHour(dateTime, token);
				break;
			case TokenType.MINUTE:
				tokenResult = _formatMinute(dateTime, token);
				break;
			case TokenType.SECOND:
				tokenResult = _formatSecond(dateTime, token);
				break;
			case TokenType.ZONE:
				tokenResult = _formatZone(dateTime, utcTime, localZone, token);
				break;
			case TokenType.WEEK:
				tokenResult = _formatWeek(dateTime, token);
				break;
			default:
			case TokenType.IDENTITY:
				tokenResult = token.raw;
				break;
		}
		result += tokenResult;
	});

	return result.trim();
}

/**
 * Format the era (BC or AD)
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatEra(dateTime: TimeStruct, token: Token): string {
	const AD: boolean = dateTime.year > 0;
	switch (token.length) {
		case 1:
		case 2:
		case 3:
			return (AD ? "AD" : "BC");
		case 4:
			return (AD ? "Anno Domini" : "Before Christ");
		case 5:
			return (AD ? "A" : "B");
		default:
			throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
	}
}

/**
 * Format the year
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatYear(dateTime: TimeStruct, token: Token): string {
	switch (token.symbol) {
		case "y":
		case "Y":
		case "r":
			let yearValue = strings.padLeft(dateTime.year.toString(), token.length, "0");
			if (token.length === 2) { // Special case: exactly two characters are expected
				yearValue = yearValue.slice(-2);
			}
			return yearValue;
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
			}
	}
}

/**
 * Format the quarter
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatQuarter(dateTime: TimeStruct, token: Token, formatOptions: FormatOptions): string {
	const quarter = Math.ceil(dateTime.month / 3);
	switch (token.length) {
		case 1:
		case 2:
			return strings.padLeft(quarter.toString(), 2, "0");
		case 3:
			return formatOptions.quarterLetter + quarter;
		case 4:
			return formatOptions.quarterAbbreviations[quarter - 1] + " " + formatOptions.quarterWord;
		case 5:
			return quarter.toString();
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
			}
	}
}

/**
 * Format the month
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatMonth(dateTime: TimeStruct, token: Token, formatOptions: FormatOptions): string {
	switch (token.length) {
		case 1:
		case 2:
			return strings.padLeft(dateTime.month.toString(), token.length, "0");
		case 3:
			return formatOptions.shortMonthNames[dateTime.month - 1];
		case 4:
			return formatOptions.longMonthNames[dateTime.month - 1];
		case 5:
			return formatOptions.monthLetters[dateTime.month - 1];
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
			}
	}
}

/**
 * Format the week number
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatWeek(dateTime: TimeStruct, token: Token): string {
	if (token.symbol === "w") {
		return strings.padLeft(basics.weekNumber(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
	} else {
		return strings.padLeft(basics.weekOfMonth(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
	}
}

/**
 * Format the day of the month (or year)
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatDay(dateTime: TimeStruct, token: Token): string {
	switch (token.symbol) {
		case "d":
			return strings.padLeft(dateTime.day.toString(), token.length, "0");
		case "D":
			const dayOfYear = basics.dayOfYear(dateTime.year, dateTime.month, dateTime.day) + 1;
			return strings.padLeft(dayOfYear.toString(), token.length, "0");
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
			}
	}
}

/**
 * Format the day of the week
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatWeekday(dateTime: TimeStruct, token: Token, formatOptions: FormatOptions): string {
	const weekDayNumber = basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs());

	switch (token.length) {
		case 1:
		case 2:
			if (token.symbol === "e") {
				return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs()).toString(), token.length, "0");
			} // No break, this is intentional fallthrough!
		case 3:
			return formatOptions.shortWeekdayNames[weekDayNumber];
		case 4:
			return formatOptions.longWeekdayNames[weekDayNumber];
		case 5:
			return formatOptions.weekdayLetters[weekDayNumber];
		case 6:
			return formatOptions.weekdayTwoLetters[weekDayNumber];
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
			}
	}
}

/**
 * Format the Day Period (AM or PM)
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatDayPeriod(dateTime: TimeStruct, token: Token): string {
	return (dateTime.hour < 12 ? "AM" : "PM");
}

/**
 * Format the Hour
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatHour(dateTime: TimeStruct, token: Token): string {
	let hour = dateTime.hour;
	switch (token.symbol) {
		case "h":
			hour = hour % 12;
			if (hour === 0) {
				hour = 12;
			};
			return strings.padLeft(hour.toString(), token.length, "0");
		case "H":
			return strings.padLeft(hour.toString(), token.length, "0");
		case "K":
			hour = hour % 12;
			return strings.padLeft(hour.toString(), token.length, "0");
		case "k":
			if (hour === 0) {
				hour = 24;
			};
			return strings.padLeft(hour.toString(), token.length, "0");
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
			}
	}
}

/**
 * Format the minute
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatMinute(dateTime: TimeStruct, token: Token): string {
	return strings.padLeft(dateTime.minute.toString(), token.length, "0");
}

/**
 * Format the seconds (or fraction of a second)
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatSecond(dateTime: TimeStruct, token: Token): string {
	switch (token.symbol) {
		case "s":
			return strings.padLeft(dateTime.second.toString(), token.length, "0");
		case "S":
			const fraction = dateTime.milli;
			let fractionString = strings.padLeft(fraction.toString(), 3, "0");
			fractionString = strings.padRight(fractionString, token.length, "0");
			return fractionString.slice(0, token.length);
		case "A":
			return strings.padLeft(basics.secondOfDay(dateTime.hour, dateTime.minute, dateTime.second).toString(), token.length, "0");
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
			}
	}
}

/**
 * Format the time zone. For this, we need the current time, the time in UTC and the time zone
 * @param currentTime The time to format
 * @param utcTime The time in UTC
 * @param zone The timezone currentTime is in
 * @param token The token passed
 * @return string
 */
function _formatZone(currentTime: TimeStruct, utcTime: TimeStruct, zone: TimeZone, token: Token): string {
	if (!zone) {
		return "";
	}
	const offset = Math.round((currentTime.toUnixNoLeapSecs() - utcTime.toUnixNoLeapSecs()) / 60000);

	const offsetHours: number = Math.floor(Math.abs(offset) / 60);
	let offsetHoursString = strings.padLeft(offsetHours.toString(), 2, "0");
	offsetHoursString = (offset >= 0 ? "+" + offsetHoursString : "-" + offsetHoursString);
	const offsetMinutes = Math.abs(offset % 60);
	const offsetMinutesString = strings.padLeft(offsetMinutes.toString(), 2, "0");
	let result: string;

	switch (token.symbol) {
		case "O":
			result = "UTC";
			if (offset >= 0) {
				result += "+";
			} else {
				result += "-";
			}
			result += offsetHours.toString();
			if (token.length >= 4 || offsetMinutes !== 0) {
				result += ":" + offsetMinutesString;
			}
			return result;
		case "Z":
			switch (token.length) {
				case 1:
				case 2:
				case 3:
					return offsetHoursString + offsetMinutesString;
				case 4:
					const newToken: Token = {
						length: 4,
						raw: "OOOO",
						symbol: "O",
						type: TokenType.ZONE
					};
					return _formatZone(currentTime, utcTime, zone, newToken);
				case 5:
					return offsetHoursString + ":" + offsetMinutesString;
				/* istanbul ignore next */
				default:
					/* istanbul ignore if */
					/* istanbul ignore next */
					if (true) {
						throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
					}
			}
		case "z":
			switch (token.length) {
				case 1:
				case 2:
				case 3:
					return zone.abbreviationForUtc(currentTime.year, currentTime.month, currentTime.day,
						currentTime.hour, currentTime.minute, currentTime.second, currentTime.milli, true);
				case 4:
					return zone.toString();
				/* istanbul ignore next */
				default:
					/* istanbul ignore if */
					/* istanbul ignore next */
					if (true) {
						throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
					}
			}
		case "v":
			if (token.length === 1) {
				return zone.abbreviationForUtc(currentTime.year, currentTime.month, currentTime.day,
					currentTime.hour, currentTime.minute, currentTime.second, currentTime.milli, false);
			} else {
				return zone.toString();
			}
		case "V":
			switch (token.length) {
				case 1:
					// Not implemented
					return "unk";
				case 2:
					return zone.name();
				case 3:
				case 4:
					return "Unknown";
				/* istanbul ignore next */
				default:
					/* istanbul ignore if */
					/* istanbul ignore next */
					if (true) {
						throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
					}
			}
		case "X":
			if (offset === 0) {
				return "Z";
			}
		case "x":
			switch (token.length) {
				case 1:
					result = offsetHoursString;
					if (offsetMinutes !== 0) {
						result += offsetMinutesString;
					}
					return result;
				case 2:
				case 4: // No seconds in our implementation, so this is the same
					return offsetHoursString + offsetMinutesString;
				case 3:
				case 5: // No seconds in our implementation, so this is the same
					return offsetHoursString + ":" + offsetMinutesString;
				/* istanbul ignore next */
				default:
					/* istanbul ignore if */
					/* istanbul ignore next */
					if (true) {
						throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
					}
			}
		/* istanbul ignore next */
		default:
			/* istanbul ignore if */
			/* istanbul ignore next */
			if (true) {
				throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
			}
	}
}

