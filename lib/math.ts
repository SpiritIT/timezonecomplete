/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Math utility functions
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";


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
