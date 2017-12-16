/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Functionality to parse a DateTime object to a string
 */

"use strict";

import { TimeStruct } from "./basics";
import * as basics from "./basics";
import { DEFAULT_LOCALE, Locale, PartialLocale } from "./locale";
import * as strings from "./strings";
import { TimeZone } from "./timezone";
import { Token, tokenize, TokenType } from "./token";


/**
 * Format the supplied dateTime with the formatting string.
 *
 * @param dateTime The current time to format
 * @param utcTime The time in UTC
 * @param localZone The zone that currentTime is in
 * @param formatString The formatting string to be applied
 * @param locale Other format options such as month names
 * @return string
 */
export function format(
	dateTime: TimeStruct,
	utcTime: TimeStruct,
	localZone: TimeZone | undefined | null,
	formatString: string,
	locale: PartialLocale = {}
): string {
	const mergedLocale: Locale = {
		...DEFAULT_LOCALE,
		...locale
	};

	const tokens: Token[] = tokenize(formatString);
	let result: string = "";
	for (const token of tokens) {
		let tokenResult: string;
		switch (token.type) {
			case TokenType.ERA:
				tokenResult = _formatEra(dateTime, token);
				break;
			case TokenType.YEAR:
				tokenResult = _formatYear(dateTime, token);
				break;
			case TokenType.QUARTER:
				tokenResult = _formatQuarter(dateTime, token, mergedLocale);
				break;
			case TokenType.MONTH:
				tokenResult = _formatMonth(dateTime, token, mergedLocale);
				break;
			case TokenType.DAY:
				tokenResult = _formatDay(dateTime, token);
				break;
			case TokenType.WEEKDAY:
				tokenResult = _formatWeekday(dateTime, token, mergedLocale);
				break;
			case TokenType.DAYPERIOD:
				tokenResult = _formatDayPeriod(dateTime, token, mergedLocale);
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
				tokenResult = _formatZone(dateTime, utcTime, localZone ? localZone : undefined, token);
				break;
			case TokenType.WEEK:
				tokenResult = _formatWeek(dateTime, token);
				break;
			case TokenType.IDENTITY: // intentional fallthrough
			/* istanbul ignore next */
			default:
				tokenResult = token.raw;
				break;
		}
		result += tokenResult;
	}

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
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
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
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
	}
}

/**
 * Format the quarter
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatQuarter(dateTime: TimeStruct, token: Token, locale: Locale): string {
	const quarter = Math.ceil(dateTime.month / 3);
	switch (token.length) {
		case 1:
		case 2:
			return strings.padLeft(quarter.toString(), 2, "0");
		case 3:
			return locale.quarterLetter + quarter;
		case 4:
			return locale.quarterAbbreviations[quarter - 1] + " " + locale.quarterWord;
		case 5:
			return quarter.toString();
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
	}
}

/**
 * Format the month
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatMonth(dateTime: TimeStruct, token: Token, locale: Locale): string {
	switch (token.length) {
		case 1:
		case 2:
			return strings.padLeft(dateTime.month.toString(), token.length, "0");
		case 3:
			return locale.shortMonthNames[dateTime.month - 1];
		case 4:
			return locale.longMonthNames[dateTime.month - 1];
		case 5:
			return locale.monthLetters[dateTime.month - 1];
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
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
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
	}
}

/**
 * Format the day of the week
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatWeekday(dateTime: TimeStruct, token: Token, locale: Locale): string {
	const weekDayNumber = basics.weekDayNoLeapSecs(dateTime.unixMillis);

	switch (token.length) {
		case 1:
		case 2:
			if (token.symbol === "e") {
				return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.unixMillis).toString(), token.length, "0");
			} else {
				return locale.shortWeekdayNames[weekDayNumber];
			}
		case 3:
			return locale.shortWeekdayNames[weekDayNumber];
		case 4:
			return locale.longWeekdayNames[weekDayNumber];
		case 5:
			return locale.weekdayLetters[weekDayNumber];
		case 6:
			return locale.weekdayTwoLetters[weekDayNumber];
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
	}
}

/**
 * Format the Day Period (AM or PM)
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatDayPeriod(dateTime: TimeStruct, token: Token, locale: Locale): string {
	switch (token.symbol) {
		case "a": {
			if (token.length <= 3) {
				if (dateTime.hour < 12) {
					return locale.dayPeriodAbbreviated.am;
				} else {
					return locale.dayPeriodAbbreviated.pm;
				}
			} else if (token.length === 4) {
				if (dateTime.hour < 12) {
					return locale.dayPeriodWide.am;
				} else {
					return locale.dayPeriodWide.pm;
				}
			} else {
				if (dateTime.hour < 12) {
					return locale.dayPeriodNarrow.am;
				} else {
					return locale.dayPeriodNarrow.pm;
				}
			}
		}
		case "b":
		case "B": {
			if (token.length <= 3) {
				if (dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
					return locale.dayPeriodAbbreviated.midnight;
				} else if (dateTime.hour === 12 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
					return locale.dayPeriodAbbreviated.noon;
				} else if (dateTime.hour < 12) {
					return locale.dayPeriodAbbreviated.am;
				} else {
					return locale.dayPeriodAbbreviated.pm;
				}
			} else if (token.length === 4) {
				if (dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
					return locale.dayPeriodWide.midnight;
				} else if (dateTime.hour === 12 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
					return locale.dayPeriodWide.noon;
				} else if (dateTime.hour < 12) {
					return locale.dayPeriodWide.am;
				} else {
					return locale.dayPeriodWide.pm;
				}
			} else {
				if (dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
					return locale.dayPeriodNarrow.midnight;
				} else if (dateTime.hour === 12 && dateTime.minute === 0 && dateTime.second === 0 && dateTime.milli === 0) {
					return locale.dayPeriodNarrow.noon;
				} else if (dateTime.hour < 12) {
					return locale.dayPeriodNarrow.am;
				} else {
					return locale.dayPeriodNarrow.pm;
				}
			}
		}
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
	}
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
			}
			return strings.padLeft(hour.toString(), token.length, "0");
		case "H":
			return strings.padLeft(hour.toString(), token.length, "0");
		case "K":
			hour = hour % 12;
			return strings.padLeft(hour.toString(), token.length, "0");
		case "k":
			if (hour === 0) {
				hour = 24;
			}
			return strings.padLeft(hour.toString(), token.length, "0");
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
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
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
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
function _formatZone(currentTime: TimeStruct, utcTime: TimeStruct, zone: TimeZone | undefined, token: Token): string {
	if (!zone) {
		return "";
	}
	const offset = Math.round((currentTime.unixMillis - utcTime.unixMillis) / 60000);

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
			if (token.length > 4) {
				result += token.raw.slice(4);
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
					// tokenizer should prevent this
					/* istanbul ignore next */
					return token.raw;
			}
		case "z":
			switch (token.length) {
				case 1:
				case 2:
				case 3:
					return zone.abbreviationForUtc(currentTime, true);
				case 4:
					return zone.toString();
				/* istanbul ignore next */
				default:
					// tokenizer should prevent this
					/* istanbul ignore next */
					return token.raw;
			}
		case "v":
			if (token.length === 1) {
				return zone.abbreviationForUtc(currentTime, false);
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
					// tokenizer should prevent this
					/* istanbul ignore next */
					return token.raw;
			}
		case "X":
		case "x":
			if (token.symbol === "X" && offset === 0) {
				return "Z";
			}
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
					// tokenizer should prevent this
					/* istanbul ignore next */
					return token.raw;
			}
		/* istanbul ignore next */
		default:
			// tokenizer should prevent this
			/* istanbul ignore next */
			return token.raw;
	}
}

