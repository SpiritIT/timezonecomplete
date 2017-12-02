/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";

/**
 * For testing purposes, we often need to manipulate what the current
 * time is. This is an interface for a custom time source object
 * so in tests you can use a custom time source.
 */
export interface TimeSource {
	/**
	 * Return the current date+time as a javascript Date object
	 */
	now(): Date;
}

/**
 * Default time source, returns actual time
 */
export class RealTimeSource implements TimeSource {
	public now(): Date {
		/* istanbul ignore if */
		/* istanbul ignore next */
		if (true) {
			return new Date();
		}
	}
}
