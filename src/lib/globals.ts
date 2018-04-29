/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
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
export function min(d1: DateTime | Duration, d2: DateTime | Duration): DateTime | Duration {
	assert(d1, "first argument is falsy");
	assert(d2, "second argument is falsy");
	/* istanbul ignore next */
	assert(d1.kind === d2.kind, "expected either two datetimes or two durations");
	return (d1 as any).min(d2);
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
export function max(d1: DateTime | Duration, d2: DateTime | Duration): DateTime | Duration {
	assert(d1, "first argument is falsy");
	assert(d2, "second argument is falsy");
	/* istanbul ignore next */
	assert(d1.kind === d2.kind, "expected either two datetimes or two durations");
	return (d1 as any).max(d2);
}

/**
 * Returns the absolute value of a Duration
 */
export function abs(d: Duration): Duration {
	assert(d, "first argument is falsy");
	return d.abs();
}

