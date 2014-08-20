/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */

/// <reference path="../typings/lib.d.ts"/>

import basics = require("./basics");
import TimeStruct = basics.TimeStruct;

import token = require("./token");
import Tokenizer = token.Tokenizer;
import Token = token.Token;
import TokenType = token.DateTimeTokenType;

import strings = require("./strings");
import timeZone = require("./timezone");

/**
 * Format the supplied dateTime with the formatting string.
 *
 * @param dateTime The current time to format
 * @param utcTime The time in UTC
 * @param localZone The zone that currentTime is in
 * @param formatString The formatting string to be applied
 * @return string
 */
export function format(dateTime: TimeStruct, utcTime: TimeStruct, localZone: timeZone.TimeZone, formatString: string): string {
	var tokenizer = new Tokenizer(formatString);
	var tokens: Token[] = tokenizer.parseTokens();
	var result: string = "";
	tokens.forEach((token: Token): void => {
		var tokenResult: string;
		switch (token.type) {
			case TokenType.ERA:
				tokenResult = _formatEra(dateTime, token);
				break;
			case TokenType.YEAR:
				tokenResult = _formatYear(dateTime, token);
				break;
			case TokenType.QUARTER:
				tokenResult = _formatQuarter(dateTime, token);
				break;
			case TokenType.MONTH:
				tokenResult = _formatMonth(dateTime, token);
				break;
			case TokenType.DAY:
				tokenResult = _formatDay(dateTime, token);
				break;
			case TokenType.WEEKDAY:
				tokenResult = _formatWeekday(dateTime, token);
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

	return result;
}

/**
 * Format the era (BC or AD)
 *
 * @param dateTime The current time to format
 * @param token The token passed
 * @return string
 */
function _formatEra(dateTime: TimeStruct, token: Token): string {
	var AD: boolean = dateTime.year > 0;
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
			var yearValue = strings.padLeft(dateTime.year.toString(), token.length, "0");
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
function _formatQuarter(dateTime: TimeStruct, token: Token): string {
	var quarterAbbr = ["1st", "2nd", "3rd", "4th"];
	var quarter = Math.ceil(dateTime.month / 3);
	switch (token.length) {
		case 1:
		case 2:
			return strings.padLeft(quarter.toString(), 2, "0");
		case 3:
			return "Q" + quarter;
		case 4:
			return quarterAbbr[quarter - 1] + " quarter";
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
function _formatMonth(dateTime: TimeStruct, token: Token): string {
	var monthStrings = ["January", "February", "March", "April", "May",
		"June", "July", "August", "September", "October", "November", "December"];
	var monthString = monthStrings[dateTime.month - 1];
	switch (token.length) {
		case 1:
		case 2:
			return strings.padLeft(dateTime.month.toString(), token.length, "0");
		case 3:
			return monthString.slice(0, 3);
		case 4:
			return monthString;
		case 5:
			return monthString.slice(0, 1);
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
			var dayOfYear = basics.dayOfYear(dateTime.year, dateTime.month, dateTime.day) + 1;
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
function _formatWeekday(dateTime: TimeStruct, token: Token): string {
	var weekDay = basics.WeekDay[basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs())];

	switch (token.length) {
		case 1:
		case 2:
			if (token.symbol === "e") {
				return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs()).toString(), token.length, "0");
			} // No break, this is intentional fallthrough!
		case 3:
			return weekDay.slice(0, 3);
		case 4:
			return weekDay;
		case 5:
			return weekDay.slice(0, 1);
		case 6:
			return weekDay.slice(0, 2);
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
	var hour = dateTime.hour;
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
			var fraction = dateTime.milli;
			var fractionString = strings.padLeft(fraction.toString(), 3, "0");
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
function _formatZone(currentTime: TimeStruct, utcTime: TimeStruct, zone: timeZone.TimeZone, token: Token): string {
	var offset = Math.round((currentTime.toUnixNoLeapSecs() - utcTime.toUnixNoLeapSecs()) / 60000);

	var offsetHours: number = Math.floor(Math.abs(offset) / 60);
	var offsetHoursString = strings.padLeft(offsetHours.toString(), 2, "0");
	offsetHoursString = (offset >= 0 ? "+" + offsetHoursString : "-" + offsetHoursString);
	var offsetMinutes = Math.abs(offset % 60);
	var offsetMinutesString = strings.padLeft(offsetMinutes.toString(), 2, "0");
	var result: string;

	switch (token.symbol) {
		case "O":
			result = "GMT";
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
					var newToken: Token = {
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

