/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Math utility functions
 */

"use strict";

import * as assert from "assert";

/**
 * @return true iff given argument is an integer number
 */
export function isInt(n: number): boolean {
	if (typeof (n) !== "number") {
		return false;
	}
	if (isNaN(n)) {
		return false;
	}
	return (Math.floor(n) === n);
}

/**
 * Rounds -1.5 to -2 instead of -1
 * Rounds +1.5 to +2
 */
export function roundSym(n: number): number {
	if (n < 0) {
		return -1 * Math.round(-1 * n);
	} else {
		return Math.round(n);
	}
}

/**
 * Stricter variant of parseFloat().
 * @param value	Input string
 * @return the float if the string is a valid float, NaN otherwise
 */
export function filterFloat(value: string): number {
	if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
		return Number(value);
	}
	return NaN;
}

export function positiveModulo(value: number, modulo: number): number {
	assert(modulo >= 1, "modulo should be >= 1");
	if (value < 0) {
		return ((value % modulo) + modulo) % modulo;
	} else {
		return value % modulo;
	}
}
