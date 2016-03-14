/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";


import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";

import { DateTime, Duration, Period, PeriodDst, TimeSource, TimeUnit, TimeZone } from "../lib/index";
import * as index from "../lib/index";

// Fake time source
class TestTimeSource implements TimeSource {
	public currentTime: Date = new Date("2014-01-03T04:05:06.007Z");

	now(): Date {
		return this.currentTime;
	}
}

// Insert fake time source so that now() is stable
const testTimeSource: TestTimeSource = new TestTimeSource();
DateTime.timeSource = testTimeSource;


describe("Period", function(): void {
	this.timeout(30000); // under istanbul these are a little slow

	describe("constructor()", (): void => {
		it("should work with a Duration", (): void => {
			const p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), new Duration(2, TimeUnit.Month), PeriodDst.RegularIntervals);
			expect(p.amount()).to.equal(2);
			expect(p.unit()).to.equal(TimeUnit.Month);
			expect(p.dst()).to.equal(PeriodDst.RegularIntervals);
		});
		it("should work with a Duration and provide default DST", (): void => {
			const p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), new Duration(2, TimeUnit.Month));
			expect(p.dst()).to.equal(PeriodDst.RegularLocalTime);
		});
		it("should work with an amount and unit", (): void => {
			const p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals);
			expect(p.amount()).to.equal(2);
			expect(p.unit()).to.equal(TimeUnit.Month);
			expect(p.dst()).to.equal(PeriodDst.RegularIntervals);
		});
		it("should work with an amount and unit and provide default DST", (): void => {
			const p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month);
			expect(p.dst()).to.equal(PeriodDst.RegularLocalTime);
		});
	});

	describe("reference()", (): void => {
		expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
			.reference().toString())
			.to.equal("2014-01-31T12:00:00.000 UTC");
	});

	describe("amount()", (): void => {
		expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
			.amount())
			.to.equal(2);
	});

	describe("unit()", (): void => {
		expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
			.unit())
			.to.equal(TimeUnit.Month);
	});

	describe("dst()", (): void => {
		expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
			.dst())
			.to.equal(PeriodDst.RegularIntervals);
	});

	describe("findFirst(<=reference)", (): void => {
		it("should return dates before the reference date", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2013-01-01T11:00:00.00 UTC")).toString())
				.to.equal("2013-01-01T12:00:00.000 UTC");
		});
		it("should return reference date", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T11:00:00.00 UTC")).toString())
				.to.equal("2014-01-01T12:00:00.000 UTC");
		});
		it("should work for 400-year leap year", (): void => {
			expect((new Period(new DateTime("2000-02-29T12:00:00.000 UTC"), 1, TimeUnit.Year, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("1999-12-31T12:00:00 UTC")).toString())
				.to.equal("2000-02-29T12:00:00.000 UTC");
		});
		it("should NOT return reference date for the reference date itself", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T14:00:00.00+02")).toString())
				.to.equal("2014-03-01T14:00:00.000+02:00");
		});
	});

	describe("Period(X, 1, X, RegularInterval).findFirst()", (): void => {
		it("should handle 1 millisecond", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Millisecond, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T01:59:59.999 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");

			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Millisecond, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:59:59.999 UTC")).toString())
				.to.equal("2014-10-26T01:00:00.000 UTC");
		});
		it("should handle 1 Second", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Second, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T01:59:59.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");

			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Second, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:59:59.000 UTC")).toString())
				.to.equal("2014-10-26T01:00:00.000 UTC");
		});
		it("should handle 1 Minute", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Minute, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T01:59:59.000 UTC")).toString())
				.to.equal("2014-03-30T02:00:00.000 UTC");
		});
		it("should handle 1 Hour", (): void => {
			// check around dst
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:10:00.000 UTC")).toString())
				.to.equal("2014-10-26T01:05:06.007 UTC");
			// check it returns OK in local time (which stays from 2AM at 2AM)
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString())
				.to.equal("2014-10-26T02:05:06.007 Europe/Amsterdam");
		});
		it("should handle 1 Hour in zone with DST !== 1h", (): void => {
			// Ghana had DST of 20 minutes
			expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString())
				.to.equal("1937-10-26T00:25:06.007 Africa/Accra");
		});
		it("should handle 1 Day", (): void => {
			// check it shifts local time from 12h to 13h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T13:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 1 Month", (): void => {
			// check it shifts local time from 12h to 13h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-04-01T13:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-02-01T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 1 Year", (): void => {
			// check it shifts local time (note in 2015 dst change is earlier)
			expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 1, TimeUnit.Year, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2015-03-29T05:00:00.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Year, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2015-01-01T12:05:06.007 Europe/Amsterdam");
		});
	});

	describe("Period(X, 1, X, RegularLocalTime).findFirst()", (): void => {
		it("should handle 1 Millisecond", (): void => {
			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:59:59.999 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("should handle 1 Second", (): void => {
			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:59:59.000 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("should handle 1 Minute", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:59:00.000 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("should handle 1 Hour", (): void => {
			// check around dst
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:00:00.000 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
			// check it returns OK in local time (which changes from 2AM to 3AM)
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:00:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString())
				.to.equal("2014-10-26T03:00:00.000 Europe/Amsterdam");
		});
		it("should handle 1 Hour in zone with DST !== 1h", (): void => {
			// Ghana had DST of 20 minutes
			expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString())
				.to.equal("1937-10-26T01:05:06.007 Africa/Accra");
		});
		it("should handle 1 Day", (): void => {
			// check it keeps local time @ 12h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T12:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 1 Month", (): void => {
			// check it keeps local time @ 12h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-04-01T12:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-02-01T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 1 Year", (): void => {
			// check it keeps local time (note in 2015 dst change is earlier)
			expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 1, TimeUnit.Year, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2015-03-29T04:00:00.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Year, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2015-01-01T12:05:06.007 Europe/Amsterdam");
		});
	});

	describe("Period(X, 2, X, RegularInterval).findFirst()", (): void => {
		it("should handle 2 Millisecond", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Millisecond, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T01:59:59.998 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");

			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Millisecond, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:59:59.998 UTC")).toString())
				.to.equal("2014-10-26T01:00:00.000 UTC");
		});
		it("should handle 2 Second", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Second, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T01:59:58.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");

			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Second, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:59:58.000 UTC")).toString())
				.to.equal("2014-10-26T01:00:00.000 UTC");
		});
		it("should handle 2 Minute", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Minute, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T01:58:00.000 UTC")).toString())
				.to.equal("2014-03-30T02:00:00.000 UTC");
		});
		it("should handle 2 Hour", (): void => {
			// check around dst
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-26T00:10:00.000 UTC")).toString())
				.to.equal("2014-10-26T01:05:06.007 UTC"); // note 1AM because reference time is 11AM UTC
			// check it returns OK in local time (which stays from 2AM at 2AM)
			expect((new Period(new DateTime("1970-01-01T01:00:00.000 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-25T23:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString())
				.to.equal("2014-10-26T02:00:00.000 Europe/Amsterdam");
		});
		it("should handle 2 Hour in zone with DST !== 1h", (): void => {
			// Ghana had DST of 20 minutes
			expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 2, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString())
				.to.equal("1937-10-26T00:25:06.007 Africa/Accra");
		});
		it("should handle 2 Day", (): void => {
			// check it shifts local time from 12h to 13h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-31T13:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-02T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-01-04T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 1 Week", (): void => {
			// check it shifts local time from 12h to 13h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Week, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-04-03T13:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, TimeUnit.Week, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-02T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-01-09T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 2 Month", (): void => {
			// check it shifts local time from 12h to 13h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-05-01T13:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 2 Year", (): void => {
			// check it shifts local time (note in 2015 dst change is earlier)
			expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 2, TimeUnit.Year, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2016-03-29T05:00:00.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Year, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2016-01-01T12:05:06.007 Europe/Amsterdam");
		});
	});

	describe("Period(X, 2, X, RegularLocalTime).findFirst()", (): void => {
		it("should handle 2 Millisecond", function (): void {
			this.timeout(60e3);
			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:59:59.998 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");

			// check reset on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 666, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:59:59.514 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 666, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:59:58.848 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T23:59:59.514 Europe/Amsterdam");
		});
		it("should handle 2 Second", (): void => {
			// note the target time is 2AM during DST backward, so 2AM exists twice.
			// Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:59:58.000 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("should handle 2 Minute", (): void => {
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:58:00.000 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("should handle 2 Hour", (): void => {
			// check around dst - because local time is kept in rythm, UTC time varies in hours
			expect((new Period(new DateTime("1970-01-01T11:00:00 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-25T23:00:00.000 UTC")).toString())
				.to.equal("2014-10-26T02:00:00.000 UTC");
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:00:00.000 UTC")).toString())
				.to.equal("2014-10-26T03:00:00.000 UTC");
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T01:00:00.000 UTC")).toString())
				.to.equal("2014-10-26T03:00:00.000 UTC");
			// check it returns OK in local time (which changes from 2AM to 3AM)
			expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-10-26T00:00:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString())
				.to.equal("2014-10-26T04:00:00.000 Europe/Amsterdam");
		});
		it("should handle 2 Hour in zone with DST !== 1h", (): void => {
			// Ghana had DST of 20 minutes
			expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString())
				.to.equal("1937-10-26T02:05:06.007 Africa/Accra");
		});
		it("should handle 2 Day", (): void => {
			// check it keeps local time @ 12h across DST
			expect((new Period(new DateTime("2014-03-26T12:00:00.000 Europe/Amsterdam"), 2, TimeUnit.Day, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-03-29T12:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T12:00:00.000 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("2014-03-26T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Day, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-03-28T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-03-30T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 2 Month", (): void => {
			// check it keeps local time @ 12h
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-02-28T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
		});
		it("should handle 2 Year", (): void => {
			// check it keeps local time (note in 2015 dst change is earlier)
			expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 2, TimeUnit.Year, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2013-04-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-03-29T04:00:00.007 Europe/Amsterdam");
			// check it returns greater time for boundary fromdate
			expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, TimeUnit.Year, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString())
				.to.equal("2016-01-01T12:05:06.007 Europe/Amsterdam");
		});
	});

	describe("Period(X, >X, X, RegularInterval).findFirst()", (): void => {
		it("should handle >1000 Millisecond", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2000, TimeUnit.Millisecond, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T00:00:02.000 Europe/Amsterdam");
			// check no effect on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 666, TimeUnit.Millisecond, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T23:59:59.514 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:00:00.180 Europe/Amsterdam");
		});
		it("should handle >60 Second", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, TimeUnit.Second, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T00:02:00.000 Europe/Amsterdam");
			// check no effect on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Second, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T23:59:54.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:01:00.000 Europe/Amsterdam");
		});
		it("should handle >60 Minute", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, TimeUnit.Minute, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T02:00:00.000 Europe/Amsterdam");
			// check no effect on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Minute, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T23:06:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:12:00.000 Europe/Amsterdam");
		});
		it("should handle >24 Hour", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 48, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-19T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-21T00:00:00.000 Europe/Amsterdam");
			// check that non-multiple of a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 25, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
		});
		it("should handle >31 Day", (): void => {
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 40, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-20T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-02-10T00:00:00.000 Europe/Amsterdam");
		});
		it("should handle >53 Week", (): void => {
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 54, TimeUnit.Week, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2015-01-14T00:00:00.000 Europe/Amsterdam");
		});
		it("should handle >12 Month", (): void => {
			// non-leap year
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 13, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2015-02-01T00:00:00.000 Europe/Amsterdam");
			// leap year should not make a difference
			expect((new Period(new DateTime("2016-01-01T00:00:00.000 Europe/Amsterdam"), 13, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2016-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2017-02-01T00:00:00.000 Europe/Amsterdam");
		});
	});

	describe("Period(X, >X, X, RegularLocalTime).findFirst()", (): void => {
		it("should handle >1000 Millisecond", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2000, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T00:00:02.000 Europe/Amsterdam");
			// check reset on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2666, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:59:57.334 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T23:59:59.728 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2666, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:59:59.728 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
			// half a day offset
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 2666, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-02T11:59:59.728 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T12:00:00.000 Europe/Amsterdam");
		});
		it("should handle >60 Second", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T00:02:00.000 Europe/Amsterdam");
			// check reset on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:59:54.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:59:53.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T23:59:54.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-02-02T11:59:53.000 Europe/Amsterdam")).toString())
				.to.equal("2014-02-02T11:59:54.000 Europe/Amsterdam");
		});
		it("should handle >60 Minute", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T02:00:00.000 Europe/Amsterdam");
			// check reset on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:06:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T23:05:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T23:06:00.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 66, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-02T11:05:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T11:06:00.000 Europe/Amsterdam");
		});
		it("should handle >24 Hour", (): void => {
			// check that twice a unit works
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 48, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-19T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-21T00:00:00.000 Europe/Amsterdam");

			// check reset on day boundary for non-factor of 24h
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 5, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T20:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 5, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-01T19:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T20:00:00.000 Europe/Amsterdam");
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 5, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-02T07:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-01-02T08:00:00.000 Europe/Amsterdam");
		});
		it("should handle >31 Day", (): void => {
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 40, TimeUnit.Day, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-20T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2014-02-10T00:00:00.000 Europe/Amsterdam");
		});
		it("should handle >53 Week", (): void => {
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 54, TimeUnit.Week, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2015-01-14T00:00:00.000 Europe/Amsterdam");
		});
		it("should handle >12 Month", (): void => {
			// non-leap year
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 13, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2015-02-01T00:00:00.000 Europe/Amsterdam");
			// multiple of 12 months
			expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 24, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
			// leap year should not make a difference
			expect((new Period(new DateTime("2016-01-01T00:00:00.000 Europe/Amsterdam"), 13, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.findFirst(new DateTime("2016-01-10T00:00:00.000 Europe/Amsterdam")).toString())
				.to.equal("2017-02-01T00:00:00.000 Europe/Amsterdam");
		});
	});

	describe("Period(RegularInterval).findNext()", (): void => {
		it("Should handle no count", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam")).toString())
				.to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
		});
		it("Should handle count 1", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
		});
		it("Should handle count >1", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString())
				.to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
		});
		it("Should return same zone as parameter", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 UTC"), 10).toString()).to.equal("2014-02-01T11:00:00.000 UTC");
		});
		it("Should not handle DST", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
		});
		it("Should throw on null datetime", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			assert.throws(function (): void {
				p.findNext(null);
			});
		});
		it("Should throw on non-integer count", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			assert.throws(function (): void {
				p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1.1);
			});
		});
		it("Should handle end-of-month for 28 < day < 31", (): void => {
			const p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString())
				.to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
		});
		it("Should handle end-of-month for day == 31", (): void => {
			const p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-03-31T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 3).toString())
				.to.equal("2014-04-30T01:00:00.000 Europe/Amsterdam"); // note local time changes because RegularIntervals is set
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString())
				.to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
		});
	});

	describe("Period(RegularLocalTime).findNext()", (): void => {
		it("Should handle DST", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("Should handle count >1", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString())
				.to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
		});
		it("Should handle end-of-month for 28 < day < 31", (): void => {
			const p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString())
				.to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
		});
		it("Should handle end-of-month for day == 31", (): void => {
			const p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-03-31T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 3).toString())
				.to.equal("2014-04-30T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString())
				.to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
		});
	});

	describe("findLast()", (): void => {
		it("should return the first date before a non-boundary date", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findLast(new DateTime("2014-10-10T13:00:00.00 UTC")).toString())
				.to.equal("2014-10-10T12:00:00.000 UTC");
		});
		it("should return the first date before a boundary date", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findLast(new DateTime("2014-10-10T12:00:00.00 UTC")).toString())
				.to.equal("2014-10-09T12:00:00.000 UTC");
		});
		it("should return the same timezone as given", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findLast(new DateTime("2014-10-10T13:00:00.00+01")).toString())
				.to.equal("2014-10-09T13:00:00.000+01:00");
		});
		it("should return a date from before the reference date", (): void => {
			expect((new Period(new DateTime("2014-02-10T12:00:00.000 UTC"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findLast(new DateTime("2014-01-10T13:00:00.00 UTC")).toString())
				.to.equal("2014-01-10T12:00:00.000 UTC");
		});
		it("should return a date before the reference date if reference date given", (): void => {
			expect((new Period(new DateTime("2014-02-10T12:00:00.000 UTC"), 1, TimeUnit.Day, PeriodDst.RegularIntervals))
				.findLast(new DateTime("2014-02-10T12:00:00.00 UTC")).toString())
				.to.equal("2014-02-09T12:00:00.000 UTC");
		});
	});

	describe("findPrev()", (): void => {
		it("should return a date before the reference date", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findPrev(new DateTime("2013-12-31T23:00:00 UTC")).toString()).to.equal("2013-12-31T22:00:00.000 UTC");
		});
		it("should return the reference date for first period", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findPrev(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam")).toString())
				.to.equal("2014-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should return the date in the zone of the given time", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findPrev(new DateTime("2014-01-01T01:00:00 UTC")).toString())
				.to.equal("2014-01-01T00:00:00.000 UTC");
		});
		it("Should handle end-of-month", (): void => {
			const p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime);
			expect(p.findPrev(new DateTime("2014-02-28T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-01-31T00:00:00.000 Europe/Amsterdam");
			expect(p.findPrev(new DateTime("2014-03-31T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-01-31T00:00:00.000 Europe/Amsterdam");
		});
		it("Should handle regular local time", (): void => {
			const p = new Period(new DateTime("2014-01-01T08:00:00 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularLocalTime);
			expect(p.findPrev(new DateTime("2014-03-30T08:00:00 Europe/Amsterdam")).toString())
				.to.equal("2014-03-29T08:00:00.000 Europe/Amsterdam");
		});
		it("Should handle regular intervals", (): void => {
			const p = new Period(new DateTime("2014-01-01T08:00:00 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularIntervals);
			expect(p.findPrev(new DateTime("2014-03-30T07:00:00 UTC")).toString())
				.to.equal("2014-03-29T07:00:00.000 UTC");
		});
		it("Should handle count > 1", (): void => {
			const p = new Period(new DateTime("2014-01-01T08:00:00 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularIntervals);
			expect(p.findPrev(new DateTime("2014-03-30T07:00:00 UTC"), 2).toString())
				.to.equal("2014-03-28T07:00:00.000 UTC");
		});
		it("Should handle count < 0", (): void => {
			const p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Day, PeriodDst.RegularLocalTime);
			expect(p.findPrev(new DateTime("2014-01-10T00:00:00 Europe/Amsterdam"), -10).toString())
				.to.equal("2014-01-20T00:00:00.000 Europe/Amsterdam");
		});
	});

	describe("isBoundary()", (): void => {
		it("should return true for reference date", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.isBoundary(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"))).to.equal(true);
		});
		it("should return true for boundary date", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.isBoundary(new DateTime("2014-01-02T02:00:00 Europe/Amsterdam"))).to.equal(true);
		});
		it("should return false for non-boundary date", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.isBoundary(new DateTime("2014-01-02T02:00:01 Europe/Amsterdam"))).to.equal(false);
		});
		it("should return false for null date", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.isBoundary(null)).to.equal(false);
		});
	});

	describe("equals()", (): void => {
		it("should return false for periods with different reference", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:01 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(false);
		});
		it("should return false for periods with equal reference but different time zone effect", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(false);
		});
		it("should return false for periods with different amount", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(false);
		});
		it("should return false for periods with different unit", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Minute, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(false);
		});
		it("should return false for periods with different DST setting that matters", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.equals(q)).to.equal(false);
		});
		it("should return true for periods different DST setting that does not matter", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.equals(q)).to.equal(true);
		});
		it("should return true for identical periods", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(true);
		});
		it("should return true for periods with equal but not identical reference", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 GMT"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(true);
		});
		it("should return true for periods with different unit and amount that adds up to same", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 60, TimeUnit.Minute, PeriodDst.RegularLocalTime);
			expect(p.equals(q)).to.equal(true);
		});
	});

	describe("identical()", (): void => {
		it("should return false for periods with different reference", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:01 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods with equal reference but different time zone effect", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods with different amount", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 2, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods with different unit", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Minute, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods with different DST setting that matters", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods different DST setting that does not matter", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods with equal but not identical reference", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 GMT"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return false for periods with different unit and amount that adds up to same", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 60, TimeUnit.Minute, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(false);
		});
		it("should return true for identical periods", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.identical(q)).to.equal(true);
		});
	});

	describe("toString()", (): void => {
		it("should work with naive date", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.toString()).to.equal("1 hour, referenceing at 2014-01-01T00:00:00.000");
		});
		it("should work with PeriodDst.RegularLocalTime", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.toString()).to.equal("1 hour, referenceing at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular local time");
		});
		it("should work with PeriodDst.RegularIntervals", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.toString()).to.equal("1 hour, referenceing at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");
		});
		it("should work with multiple hours", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.toString()).to.equal("2 hours, referenceing at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");
		});
	});

	describe("toIsoString()", (): void => {
		it("should work", (): void => {
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 60, TimeUnit.Millisecond, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P0.060S");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Second, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P1S");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Minute, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/PT1M");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P1H");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Day, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P1D");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Week, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P1W");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P1M");
			expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Year, PeriodDst.RegularLocalTime))
				.toIsoString())
				.to.equal("2014-01-01T00:00:00.000/P1Y");
		});
	});

	describe("inspect()", (): void => {
		it("should work", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.inspect()).to.equal("[Period: " + p.toString() + "]");
		});
	});

	describe("clone()", (): void => {
		it("should work", (): void => {
			const p = new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			const q = p.clone();
			expect(p).not.to.equal(q);
			expect(p.identical(q)).to.equal(true);
		});
	});

});
// todo test DST zone where DST save is not a whole hour (20 or 40 minutes)
// todo test zone with two DSTs
