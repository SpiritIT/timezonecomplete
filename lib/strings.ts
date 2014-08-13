/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * String utility functions
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

import assert = require("assert");

/**
 * Pad a string by adding characters to the beginning.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
export function padLeft(s: string, width: number, char: string): string {
	assert(width > 0, "expect width > 0");
	assert(char.length === 1, "expect single character in char");
	var padding: string = "";
	for (var i = 0; i < (width - s.length); i++) {
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
	assert(width > 0, "expect width > 0");
	assert(char.length === 1, "expect single character in char");
	var padding: string = "";
	for (var i = 0; i < (width - s.length); i++) {
		padding += char;
	}
	return s + padding;
}

/**
 * Returns an ISO time string. Note that months are 1-12.
 */
export function isoString(year: number, month: number, day: number,
	hour: number, minute: number, second: number, millisecond: number): string {
	return padLeft(year.toString(10), 4, "0")
		+ "-" + padLeft(month.toString(10), 2, "0")
		+ "-" + padLeft(day.toString(10), 2, "0")
		+ "T" + padLeft(hour.toString(10), 2, "0")
		+ ":" + padLeft(minute.toString(10), 2, "0")
		+ ":" + padLeft(second.toString(10), 2, "0")
		+ "." + padLeft(millisecond.toString(10), 3, "0")
		;
}
