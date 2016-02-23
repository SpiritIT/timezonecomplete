/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";

/**
 * Indicates how a Date object should be interpreted.
 * Either we can take getYear(), getMonth() etc for our field
 * values, or we can take getUTCYear(), getUtcMonth() etc to do that.
 */
export enum DateFunctions {
	/**
	 * Use the Date.getFullYear(), Date.getMonth(), ... functions.
	 */
	Get,
	/**
	 * Use the Date.getUTCFullYear(), Date.getUTCMonth(), ... functions.
	 */
	GetUTC
}

