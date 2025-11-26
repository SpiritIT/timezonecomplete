/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 *
 * Math utility functions
 */

"use strict";

import assert from "./assert";

/**
 * @return true iff given argument is an integer number
 * @throws nothing
 */
export function isInt(n: number): boolean {
	if (n === null || !isFinite(n)) {
		return false;
	}
	return (Math.floor(n) === n);
}

/**
 * Rounds -1.5 to -2 instead of -1
 * Rounds +1.5 to +2
 * @throws timezonecomplete.Argument.N if n is not a finite number
 */
export function roundSym(n: number): number {
	assert(Number.isFinite(n), "Argument.N", `n must be a finite number but is: ${n}`);
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
 * @throws nothing
 */
export function filterFloat(value: string): number {
	if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
		return Number(value);
	}
	return NaN;
}

/**
 * Modulo function that only returns a positive result, in contrast to the % operator
 * @param value
 * @param modulo
 * @throws timezonecomplete.Argument.Value if value is not finite
 * @throws timezonecomplete.Argument.Modulo if modulo is not a finite number >= 1
 */
export function positiveModulo(value: number, modulo: number): number {
	assert(Number.isFinite(value), "Argument.Value", "value should be finite");
	assert(Number.isFinite(modulo) && modulo >= 1, "Argument.Modulo", "modulo should be >= 1");
	if (value < 0) {
		return ((value % modulo) + modulo) % modulo;
	} else {
		return value % modulo;
	}
}
