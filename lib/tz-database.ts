/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

/* tslint:disable */

import assert = require("assert");
import basics = require("basics");
import duration = require("duration");

/* tslint:disable:no-var-requires */
var data: any = require("./timezone-data.json");
/* tslint:enable:no-var-requires */

import Duration = duration.Duration;
import TimeStruct = basics.TimeStruct;
import WeekDay = basics.WeekDay;

class TzDatabase {

	/**
	 * Time zone offset for a time expressed in UTC.
	 */
	public offsetForUtc(timeZone: string, unixTimestamp: number): Duration;
	public offsetForUtc(timeZone: string, tm: TimeStruct): Duration;
	public offsetForUtc(timeZone: string, a: any): Duration {

		return Duration.hours(1);
	}

}

