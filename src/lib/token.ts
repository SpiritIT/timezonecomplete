/**
 * Functionality to parse a DateTime object to a string
 */

"use strict";

/**
 * Different types of tokens, each for a DateTime "period type" (like year, month, hour etc.)
 */
export enum TokenType {
	/**
	 * Raw text
	 */
	IDENTITY,
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
	type: TokenType;

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

/**
 * Tokenize an LDML date/time format string
 * @param formatString the string to tokenize
 */
export function tokenize(formatString: string): Token[] {
	if (!formatString) {
		return [];
	}

	const result: Token[] = [];

	const appendToken = (tokenString: string, raw?: boolean): void => {
		// The tokenString may be longer than supported for a tokentype, e.g. "hhhh" which would be TWO hour specs.
		// We greedily consume LDML specs while possible
		while (tokenString !== "") {
			if (raw || !SYMBOL_MAPPING.hasOwnProperty(tokenString[0])) {
				const token: Token = {
					length: tokenString.length,
					raw: tokenString,
					symbol: tokenString[0],
					type: TokenType.IDENTITY
				};
				result.push(token);
				tokenString = "";
			} else {
				// depending on the type of token, different lengths may be supported
				const info = SYMBOL_MAPPING[tokenString[0]];
				let length: number | undefined;
				if (info.maxLength === undefined && (!Array.isArray(info.lengths) || info.lengths.length === 0)) {
					// everything is allowed
					length = tokenString.length;
				} else if (info.maxLength !== undefined) {
					// greedily gobble up
					length = Math.min(tokenString.length, info.maxLength);
				} else /* istanbul ignore else */ if (Array.isArray(info.lengths) && info.lengths.length > 0) {
					// find maximum allowed length
					for (const l of info.lengths) {
						if (l <= tokenString.length && (length === undefined || length < l)) {
							length = l;
						}
					}
				}
				/* istanbul ignore if */
				if (length === undefined) {
					// no allowed length found (not possible with current symbol mapping since length 1 is always allowed)
					const token: Token = {
						length: tokenString.length,
						raw: tokenString,
						symbol: tokenString[0],
						type: TokenType.IDENTITY
					};
					result.push(token);
					tokenString = "";
				} else {
					// prefix found
					const token: Token = {
						length,
						raw: tokenString.slice(0, length),
						symbol: tokenString[0],
						type: info.type
					};
					result.push(token);
					tokenString = tokenString.slice(length);
				}
			}
		}
	};

	let currentToken: string = "";
	let previousChar: string = "";
	let quoting: boolean = false;
	let possibleEscaping: boolean = false;

	for (const currentChar of formatString) {
		// Hanlde escaping and quoting
		if (currentChar === "'") {
			if (!quoting) {
				if (possibleEscaping) {
					// Escaped a single ' character without quoting
					if (currentChar !== previousChar) {
						appendToken(currentToken);
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
			appendToken(currentToken, !quoting);
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
			appendToken(currentToken);
			currentToken = currentChar;
		} else {
			// We are repeating the token with more characters
			currentToken += currentChar;
		}

		previousChar = currentChar;
	}
	// Don't forget to add the last token to the result!
	appendToken(currentToken, quoting);

	return result;
}

interface SymbolInfo {
	/**
	 * Token type
	 */
	type: TokenType;
	/**
	 * Maximum token length (undefined for unlimited tokens)
	 */
	maxLength?: number;
	/**
	 * Allowed token lengths (instead of minLength/maxLength)
	 */
	lengths?: number[];
}

const SYMBOL_MAPPING: { [char: string]: SymbolInfo } = {
	G: { type: TokenType.ERA, maxLength: 5 },
	y: { type: TokenType.YEAR },
	Y: { type: TokenType.YEAR },
	u: { type: TokenType.YEAR },
	U: { type: TokenType.YEAR, maxLength: 5 },
	r: { type: TokenType.YEAR },
	Q: { type: TokenType.QUARTER, maxLength: 5 },
	q: { type: TokenType.QUARTER, maxLength: 5 },
	M: { type: TokenType.MONTH, maxLength: 5 },
	L: { type: TokenType.MONTH, maxLength: 5 },
	l: { type: TokenType.MONTH, maxLength: 1 },
	w: { type: TokenType.WEEK, maxLength: 2 },
	W: { type: TokenType.WEEK, maxLength: 1 },
	d: { type: TokenType.DAY, maxLength: 2 },
	D: { type: TokenType.DAY, maxLength: 3 },
	F: { type: TokenType.DAY, maxLength: 1 },
	g: { type: TokenType.DAY },
	E: { type: TokenType.WEEKDAY, maxLength: 6 },
	e: { type: TokenType.WEEKDAY, maxLength: 6 },
	c: { type: TokenType.WEEKDAY, maxLength: 6 },
	a: { type: TokenType.DAYPERIOD, maxLength: 5 },
	b: { type: TokenType.DAYPERIOD, maxLength: 5 },
	B: { type: TokenType.DAYPERIOD, maxLength: 5 },
	h: { type: TokenType.HOUR, maxLength: 2 },
	H: { type: TokenType.HOUR, maxLength: 2 },
	k: { type: TokenType.HOUR, maxLength: 2 },
	K: { type: TokenType.HOUR, maxLength: 2 },
	j: { type: TokenType.HOUR, maxLength: 6 },
	J: { type: TokenType.HOUR, maxLength: 2 },
	m: { type: TokenType.MINUTE, maxLength: 2 },
	s: { type: TokenType.SECOND, maxLength: 2 },
	S: { type: TokenType.SECOND },
	A: { type: TokenType.SECOND },
	z: { type: TokenType.ZONE, maxLength: 4 },
	Z: { type: TokenType.ZONE, maxLength: 5 },
	O: { type: TokenType.ZONE, lengths: [1, 4] },
	v: { type: TokenType.ZONE, lengths: [1, 4] },
	V: { type: TokenType.ZONE, maxLength: 4 },
	X: { type: TokenType.ZONE, maxLength: 5 },
	x: { type: TokenType.ZONE, maxLength: 5 },
};
