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
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
export function min(d1: DateTime, d2: DateTime): DateTime;
/**
 * Returns the minimum of two Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
export function min(d1: Duration, d2: Duration): Duration;
/**
 * Returns the minimum of two DateTimes or Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
export function min(d1: DateTime | Duration, d2: DateTime | Duration): DateTime | Duration {
	assert(d1, "Argument.D1", "first argument is falsy");
	assert(d2, "Argument.D2", "second argument is falsy");
	/* istanbul ignore next */
	assert(d1.kind === d2.kind, "Argument.D2", "expected either two datetimes or two durations");
	return (d1 as any).min(d2);
}

/**
 * Returns the maximum of two DateTimes
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
export function max(d1: DateTime, d2: DateTime): DateTime;
/**
 * Returns the maximum of two Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
export function max(d1: Duration, d2: Duration): Duration;
/**
 * Returns the maximum of two DateTimes or Durations
 * @throws timezonecomplete.Argument.D1 if d1 is undefined/null
 * @throws timezonecomplete.Argument.D2 if d1 is undefined/null, or if d1 and d2 are not both datetimes
 */
export function max(d1: DateTime | Duration, d2: DateTime | Duration): DateTime | Duration {
	assert(d1, "Argument.D1", "first argument is falsy");
	assert(d2, "Argument.D2", "second argument is falsy");
	/* istanbul ignore next */
	assert(d1.kind === d2.kind, "Argument.D2", "expected either two datetimes or two durations");
	return (d1 as any).max(d2);
}

/**
 * Returns the absolute value of a Duration
 * @throws timezonecomplete.Argument.D if d is undefined/null
 */
export function abs(d: Duration): Duration {
	assert(d, "Argument.D", "first argument is falsy");
	return d.abs();
}

