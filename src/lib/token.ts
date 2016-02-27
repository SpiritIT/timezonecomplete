/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */

"use strict";

export class Tokenizer {

	/**
	 * Create a new tokenizer
	 * @param _formatString (optional) Set the format string
	 */
	constructor(private _formatString?: string) {

	}

	/**
	 * Set the format string
	 * @param formatString The new string to use for formatting
	 */
	setFormatString(formatString: string): void {
		this._formatString = formatString;
	}

	/**
	 * Append a new token to the current list of tokens.
	 *
	 * @param tokenString The string that makes up the token
	 * @param tokenArray The existing array of tokens
	 * @param raw (optional) If true, don't parse the token but insert it as is
	 * @return Token[] The resulting array of tokens.
	 */
	private _appendToken(tokenString: string, tokenArray: Token[], raw?: boolean): Token[] {
		if (tokenString !== "") {
			const token: Token = {
				length: tokenString.length,
				raw: tokenString,
				symbol: tokenString[0],
				type: DateTimeTokenType.IDENTITY
			};

			if (!raw) {
				token.type = mapSymbolToType(token.symbol);
			}
			tokenArray.push(token);
		}
		return tokenArray;
	}

	/**
	 * Parse the internal string and return an array of tokens.
	 * @return Token[]
	 */
	parseTokens(): Token[] {
		let result: Token[] = [];

		let currentToken: string = "";
		let previousChar: string = "";
		let quoting: boolean = false;
		let possibleEscaping: boolean = false;

		for (let i = 0; i < this._formatString.length; ++i) {
			const currentChar = this._formatString[i];

			// Hanlde escaping and quoting
			if (currentChar === "'") {
				if (!quoting) {
					if (possibleEscaping) {
						// Escaped a single ' character without quoting
						if (currentChar !== previousChar) {
							result = this._appendToken(currentToken, result);
							currentToken = "";
						}
						currentToken += "'";
						possibleEscaping = false;
					} else {
						possibleEscaping = true;
					}
				} else {
					// Two possibilities: Were are done quoting, or we are escaping a ' character
					if (possibleEscaping) {
						// Escaping, add ' to the token
						currentToken += currentChar;
						possibleEscaping = false;
					} else {
						// Maybe escaping, wait for next token if we are escaping
						possibleEscaping = true;
					}

				}
				if (!possibleEscaping) {
					// Current character is relevant, so save it for inspecting next round
					previousChar = currentChar;
				}
				continue;
			} else if (possibleEscaping) {
				quoting = !quoting;
				possibleEscaping = false;

				// Flush current token
				result = this._appendToken(currentToken, result, !quoting);
				currentToken = "";
			}

			if (quoting) {
				// Quoting mode, add character to token.
				currentToken += currentChar;
				previousChar = currentChar;
				continue;
			}

			if (currentChar !== previousChar) {
				// We stumbled upon a new token!
				result = this._appendToken(currentToken, result);
				currentToken = currentChar;
			} else {
				// We are repeating the token with more characters
				currentToken += currentChar;
			}

			previousChar = currentChar;
		}
		// Don't forget to add the last token to the result!
		result = this._appendToken(currentToken, result, quoting);

		return result;
	}

}

/**
 * Different types of tokens, each for a DateTime "period type" (like year, month, hour etc.)
 */
export enum DateTimeTokenType {
	IDENTITY, // Special, do not "format" this, but just output what went in

	ERA,
	YEAR,
	QUARTER,
	MONTH,
	WEEK,
	DAY,
	WEEKDAY,
	DAYPERIOD,
	HOUR,
	MINUTE,
	SECOND,
	ZONE
}

/**
 * Basic token
 */
export interface Token {
	/**
	 * The type of token
	 */
	type: DateTimeTokenType;

	/**
	 * The symbol from which the token was parsed
	 */
	symbol: string;

	/**
	 * The total length of the token
	 */
	length: number;

	/**
	 * The original string that produced this token
	 */
	raw: string;
}

const symbolMapping: { [char: string]: DateTimeTokenType } = {
	"G": DateTimeTokenType.ERA,

	"y": DateTimeTokenType.YEAR,
	"Y": DateTimeTokenType.YEAR,
	"u": DateTimeTokenType.YEAR,
	"U": DateTimeTokenType.YEAR,
	"r": DateTimeTokenType.YEAR,

	"Q": DateTimeTokenType.QUARTER,
	"q": DateTimeTokenType.QUARTER,

	"M": DateTimeTokenType.MONTH,
	"L": DateTimeTokenType.MONTH,
	"l": DateTimeTokenType.MONTH,

	"w": DateTimeTokenType.WEEK,
	"W": DateTimeTokenType.WEEK,

	"d": DateTimeTokenType.DAY,
	"D": DateTimeTokenType.DAY,
	"F": DateTimeTokenType.DAY,
	"g": DateTimeTokenType.DAY,

	"E": DateTimeTokenType.WEEKDAY,
	"e": DateTimeTokenType.WEEKDAY,
	"c": DateTimeTokenType.WEEKDAY,

	"a": DateTimeTokenType.DAYPERIOD,

	"h": DateTimeTokenType.HOUR,
	"H": DateTimeTokenType.HOUR,
	"k": DateTimeTokenType.HOUR,
	"K": DateTimeTokenType.HOUR,
	"j": DateTimeTokenType.HOUR,
	"J": DateTimeTokenType.HOUR,

	"m": DateTimeTokenType.MINUTE,

	"s": DateTimeTokenType.SECOND,
	"S": DateTimeTokenType.SECOND,
	"A": DateTimeTokenType.SECOND,

	"z": DateTimeTokenType.ZONE,
	"Z": DateTimeTokenType.ZONE,
	"O": DateTimeTokenType.ZONE,
	"v": DateTimeTokenType.ZONE,
	"V": DateTimeTokenType.ZONE,
	"X": DateTimeTokenType.ZONE,
	"x": DateTimeTokenType.ZONE
};

/**
 * Map the given symbol to one of the DateTimeTokenTypes
 * If there is no mapping, DateTimeTokenType.IDENTITY is used
 *
 * @param symbol The single-character symbol used to map the token
 * @return DateTimeTokenType The Type of token this symbol represents
 */
function mapSymbolToType(symbol: string): DateTimeTokenType {
	if (symbolMapping.hasOwnProperty(symbol)) {
		return symbolMapping[symbol];
	} else {
		return DateTimeTokenType.IDENTITY;
	}
}
