/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * String utility functions
 */

"use strict";

/**
 * Pad a string by adding characters to the beginning.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
export function padLeft(s: string, width: number, char: string): string {
	let padding: string = "";
	for (let i = 0; i < (width - s.length); i++) {
		padding += char;
	}
	return padding + s;
}

/**
 * Pad a string by adding characters to the end.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
export function padRight(s: string, width: number, char: string): string {
	let padding: string = "";
	for (let i = 0; i < (width - s.length); i++) {
		padding += char;
	}
	return s + padding;
}

