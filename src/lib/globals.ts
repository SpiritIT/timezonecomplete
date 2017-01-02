/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Global functions depending on DateTime/Duration etc
 */

"use strict";

import assert from "./assert";
import { DateTime } from "./datetime";
import { Duration } from "./duration";

/**
 * Returns the minimum of two DateTimes
 */
export function min(d1: DateTime, d2: DateTime): DateTime;
/**
 * Returns the minimum of two Durations
 */
export function min(d1: Duration, d2: Duration): Duration;
/**
 * Returns the minimum of two DateTimes or Durations
 */
export function min(d1: any, d2: any): any {
	assert(d1, "first argument is falsy");
	assert(d2, "first argument is falsy");
	/* istanbul ignore next */
	assert((d1 instanceof DateTime && d2 instanceof DateTime) || (d1 instanceof Duration && d2 instanceof Duration),
		"Either two datetimes or two durations expected");
	return d1.min(d2);
}

/**
 * Returns the maximum of two DateTimes
 */
export function max(d1: DateTime, d2: DateTime): DateTime;
/**
 * Returns the maximum of two Durations
 */
export function max(d1: Duration, d2: Duration): Duration;
/**
 * Returns the maximum of two DateTimes or Durations
 */
export function max(d1: any, d2: any): any {
	assert(d1, "first argument is falsy");
	assert(d2, "first argument is falsy");
	/* istanbul ignore next */
	assert((d1 instanceof DateTime && d2 instanceof DateTime) || (d1 instanceof Duration && d2 instanceof Duration),
		"Either two datetimes or two durations expected");
	return d1.max(d2);
}

/**
 * Returns the absolute value of a Duration
 */
export function abs(d: Duration): Duration {
	assert(d, "first argument is falsy");
	assert(d instanceof Duration, "first argument is not a Duration");
	return d.abs();
}

