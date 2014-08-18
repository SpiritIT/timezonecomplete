/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */

/// <reference path="../typings/lib.d.ts"/>

import dateTime = require("./datetime-interface");
import DateTimeAccess = dateTime.DateTimeAccess;

import basics = require("./basics");

import token = require("./token");
import Tokenizer = token.Tokenizer;
import Token = token.Token;
import TokenType = token.DateTimeTokenType;

import strings = require("./strings");

export class Formatter {
	private _tokenizer: Tokenizer;

	constructor() {
		this._tokenizer = new Tokenizer();
	}

	format(dateTime: DateTimeAccess, formatString: string): string {
		this._tokenizer.setFormatString(formatString);
		var tokens: Token[] = this._tokenizer.parseTokens();
		var result: string = "";
		tokens.forEach((token: Token): void => {
			result += this._formatToken(dateTime, token);
		});

		return result;
	}

	private _formatToken(dateTime: DateTimeAccess, token: Token): string {
		switch (token.type) {
			case TokenType.ERA: return this._formatEra(dateTime, token);
			case TokenType.YEAR: return this._formatYear(dateTime, token);
			case TokenType.QUARTER: return this._formatQuarter(dateTime, token);
			case TokenType.MONTH: return this._formatMonth(dateTime, token);
			case TokenType.DAY: return this._formatDay(dateTime, token);
			case TokenType.WEEKDAY: return this._formatWeekday(dateTime, token);
			case TokenType.DAYPERIOD: return this._formatDayPeriod(dateTime, token);
			case TokenType.HOUR: return this._formatHour(dateTime, token);
			case TokenType.MINUTE: return this._formatMinute(dateTime, token);
			case TokenType.SECOND: return this._formatSecond(dateTime, token);
			case TokenType.ZONE: return this._formatZone(dateTime, token);
			case TokenType.WEEK: return this._formatWeek(dateTime, token);
			default:
			case TokenType.IDENTITY: return token.raw;
		}
	}

	private _formatEra(dateTime: DateTimeAccess, token: Token): string {
		var AD: boolean = dateTime.year() > 0;
		switch (token.length) {
			case 1:
			case 2:
			case 3:
			default:
				return (AD ? "AD" : "BC");
			case 4:
				return (AD ? "Anno Domini" : "Before Christ");
			case 5:
				return (AD ? "A" : "B");
		}
	}

	private _formatYear(dateTime: DateTimeAccess, token: Token): string {
		switch (token.symbol) {
			case "y":
			case "Y":
			case "r":
			default:
				var yearValue = strings.padLeft(dateTime.year().toString(), token.length, "0");
				if (token.length === 2) { // Special case: exactly two characters are expected
					yearValue = yearValue.slice(-2);
				}
				return yearValue;
		}
	}

	private _formatQuarter(dateTime: DateTimeAccess, token: Token): string {
		var quarterAbbr = ["1st", "2nd", "3rd", "4th"];
		var quarter = Math.ceil(dateTime.month() / 3);
		switch (token.length) {
			case 1:
			case 2:
				return strings.padLeft(quarter.toString(), 2, "0");
			case 3:
			default:
				return "Q" + quarter;
			case 4:
				return quarterAbbr[quarter - 1] + " quarter";
			case 5:
				return quarter.toString();
		}
	}

	private _formatMonth(dateTime: DateTimeAccess, token: Token): string {
		var monthStrings = ["January", "February", "March", "April", "May",
			"June", "July", "August", "September", "October", "November", "December"];
		var monthString = monthStrings[dateTime.month() - 1];
		switch (token.length) {
			case 1:
			case 2:
				return strings.padLeft(dateTime.month().toString(), token.length, "0");
			case 3:
				return monthString.slice(0, 3);
			case 4:
			default:
				return monthString;
			case 5:
				return monthString.slice(0, 1);
		}
	}

	private _formatWeek(dateTime: DateTimeAccess, token: Token): string {
		if (token.symbol === "w") {
			return strings.padLeft(dateTime.weekNumber().toString(), token.length, "0");
		} else {
			// return strings.padLeft(dateTime.weekOfMonth().toString(), token.length, "0");
			// TODO: Week of month is not implemented yet in DateTime
			return "-1";
		}
	}

	private _formatDay(dateTime: DateTimeAccess, token: Token): string {
		switch (token.symbol) {
			case "d":
			default:
				return strings.padLeft(dateTime.day().toString(), token.length, "0");
			case "D":
				// return strings.padLeft(dateTime.dayOfYear().toString(), token.length, "0");
				// TODO: Day of year is not implemented yet in DateTime 
				return "-1";
		}
	}

	private _formatWeekday(dateTime: DateTimeAccess, token: Token): string {
		var weekDay = basics.WeekDay[dateTime.weekDay()];

		switch (token.length) {
			case 1:
			case 2:
				if (token.symbol === "e") {
					return strings.padLeft(dateTime.weekDay().toString(), token.length, "0");
				}
			case 3:
				return weekDay.slice(0, 3);
			case 4:
			default:
				return weekDay;
			case 5:
				return weekDay.slice(0, 1);
			case 6:
				return weekDay.slice(0, 2);
		}
	}

	private _formatDayPeriod(dateTime: DateTimeAccess, token: Token): string {
		return (dateTime.hour() < 12 ? "AM" : "PM");
	}

	private _formatHour(dateTime: DateTimeAccess, token: Token): string {
		var hour = dateTime.hour();
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
		}
	}

	private _formatMinute(dateTime: DateTimeAccess, token: Token): string {
		return strings.padLeft(dateTime.minute().toString(), token.length, "0");
	}

	private _formatSecond(dateTime: DateTimeAccess, token: Token): string {
		switch (token.symbol) {
			case "s":
				return strings.padLeft(dateTime.second().toString(), token.length, "0");
			case "S":
				var fraction = dateTime.millisecond();
				var fractionString = strings.padLeft(fraction.toString(), 3, "0");
				fractionString = strings.padRight(fractionString, token.length, "0");
				return fractionString.slice(0, token.length);
			case "A":
				// return strings.padLeft(dateTime.secondOfDay().toString(), token.length, "0");
				// TODO: Second of day is not implemented yet in DateTime
				return "-1";
		}
	}

	private _formatZone(dateTime: DateTimeAccess, token: Token): string {
		var zone = dateTime.zone();
		return zone.toString(); // Best we can do for now...
	}
}
