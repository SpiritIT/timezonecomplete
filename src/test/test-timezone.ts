/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 */

"use strict";

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";

import { DateFunctions, DateTime, TimeSource, TimeZone } from "../lib/index";
import * as index from "../lib/index";

// Fake time source
class TestTimeSource implements TimeSource {
	public currentTime: Date = new Date("2014-01-03T04:05:06.007Z");

	public now(): Date {
		return this.currentTime;
	}
}

// Insert fake time source so that now() is stable
const testTimeSource: TestTimeSource = new TestTimeSource();
DateTime.timeSource = testTimeSource;

describe("timezone loose", (): void => {
	describe("local()", (): void => {
		it("should create a local time zone", (): void => {
			const t: TimeZone = index.local();
			const localOffset: number = (testTimeSource.now()).getTimezoneOffset();
			expect(t.offsetForZoneDate(testTimeSource.now(), DateFunctions.Get)).to.equal(-1 * localOffset);
			expect(t.offsetForUtcDate(testTimeSource.now(), DateFunctions.GetUTC)).to.equal(-1 * localOffset);
		});
		it("should cache the time zone objects", (): void => {
			const t: TimeZone = index.local();
			const u: TimeZone = index.local();
			expect(t).to.equal(u);
		});
	});

	describe("utc()", (): void => {
		it("should create a UTC zone", (): void => {
			const t: TimeZone = index.utc();
			expect(t.offsetForZone(2014, 2, 3, 4, 5, 6, 7)).to.equal(0);
			expect(t.offsetForUtc(2014, 2, 3, 4, 5, 6, 7)).to.equal(0);
		});
		it("should cache the time zone objects", (): void => {
			const t: TimeZone = index.utc();
			const u: TimeZone = index.utc();
			expect(t).to.equal(u);
		});
	});

	describe("zone(number)", (): void => {
		it("should create a time zone for a whole number", (): void => {
			const t: TimeZone = index.zone(60);
			expect(t.offsetForZone(2014, 7, 1, 2, 3, 4, 5)).to.equal(60);
			expect(t.offsetForUtc(2014, 7, 1, 2, 3, 4, 5)).to.equal(60);
		});
	});

	describe("zone(string)", (): void => {
		it("should create a time zone for a positive ISO offset", (): void => {
			const t: TimeZone = index.zone("+01:30");
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should throw for nonexisting name", (): void => {
			assert.throws((): void => {
				index.zone("Nederland/Lutjebroek");
			});
		});
	});

	describe("isTimeZone()", (): void => {
		it("should return true for Duration", (): void => {
			expect(index.isTimeZone(index.nowUtc().zone())).to.equal(true);
		});
		it("should return false for non-DateTime", (): void => {
			expect(index.isTimeZone(new Buffer("tralala"))).to.equal(false);
		});
		it("should return false for null", (): void => {
			expect(index.isTimeZone(null)).to.equal(false);
		});
	});
});

describe("TimeZone", (): void => {

	describe("local()", (): void => {
		it("should create a local time zone", (): void => {
			const t: TimeZone = TimeZone.local();
			const localOffset: number = (testTimeSource.now()).getTimezoneOffset();
			expect(t.offsetForZoneDate(testTimeSource.now(), DateFunctions.Get)).to.equal(-1 * localOffset);
			expect(t.offsetForUtcDate(testTimeSource.now(), DateFunctions.GetUTC)).to.equal(-1 * localOffset);
		});
		it("should cache the time zone objects", (): void => {
			const t: TimeZone = TimeZone.local();
			const u: TimeZone = TimeZone.local();
			expect(t).to.equal(u);
		});
	});

	describe("utc()", (): void => {
		it("should create a UTC zone", (): void => {
			const t: TimeZone = TimeZone.utc();
			expect(t.offsetForZone(2014, 2, 3, 4, 5, 6, 7)).to.equal(0);
			expect(t.offsetForUtc(2014, 2, 3, 4, 5, 6, 7)).to.equal(0);
		});
		it("should cache the time zone objects", (): void => {
			const t: TimeZone = TimeZone.utc();
			const u: TimeZone = TimeZone.utc();
			expect(t).to.equal(u);
		});
	});

	describe("zone(number)", (): void => {
		it("should create a time zone for a whole number", (): void => {
			const t: TimeZone = TimeZone.zone(60);
			expect(t.offsetForZone(2014, 7, 1, 2, 3, 4, 5)).to.equal(60);
			expect(t.offsetForUtc(2014, 7, 1, 2, 3, 4, 5)).to.equal(60);
		});
		it("should create a time zone for a negative number", (): void => {
			const t: TimeZone = TimeZone.zone(-60);
			expect(t.offsetForZone(2014, 7, 1, 2, 3, 4, 5)).to.equal(-60);
			expect(t.offsetForUtc(2014, 7, 1, 2, 3, 4, 5)).to.equal(-60);
		});
		it("should not handle DST", (): void => {
			const t: TimeZone = TimeZone.zone(-60);
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-60);
		});
		it("should cache the time zone objects", (): void => {
			const t: TimeZone = TimeZone.zone(-60);
			const u: TimeZone = TimeZone.zone(-60);
			expect(t).to.equal(u);
		});
		assert.throws((): void => { TimeZone.zone(-24 * 60); }, "zone(number) should throw on out of range offset");
		assert.throws((): void => { TimeZone.zone(24 * 60); }, "zone(number) should throw on out of range offset");
	});

	describe("zone(string)", (): void => {
		it("should create a time zone for a positive ISO offset", (): void => {
			const t: TimeZone = TimeZone.zone("+01:30");
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should create a time zone for a negative ISO offset", (): void => {
			const t: TimeZone = TimeZone.zone("-01:30");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-90);
		});
		it("should create a time zone for an ISO offset without a colon", (): void => {
			const t: TimeZone = TimeZone.zone("+0130");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should create a time zone for an ISO offset without minutes", (): void => {
			const t: TimeZone = TimeZone.zone("+01");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(60);
		});
		it("should create a time zone for Zulu", (): void => {
			const t: TimeZone = TimeZone.zone("Z");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(0);
		});
		it("should return a time zone for an IANA time zone string", (): void => {
			const t: TimeZone = TimeZone.zone("Africa/Asmara");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(180);
		});
		it("should apply DST by default", (): void => {
			const t: TimeZone = TimeZone.zone("Europe/Amsterdam");
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(120);
		});
		it("should not apply DST if asked", (): void => {
			const t: TimeZone = TimeZone.zone("Europe/Amsterdam", false);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(60);
		});
		it("should not apply DST if asked with string suffix 'without DST'", (): void => {
			const t: TimeZone = TimeZone.zone("Europe/Amsterdam without DST", true);
			const u: TimeZone = TimeZone.zone("Europe/Amsterdam without DST", false);
			expect(t).to.equal(u);
			expect(t.dst()).to.equal(false);
		});
		it("should return a time zone for local time", (): void => {
			const t: TimeZone = TimeZone.zone("localtime");
			expect(t.equals(TimeZone.local())).to.equal(true);
		});
		it("should cache the time zone objects", (): void => {
			const t: TimeZone = TimeZone.zone("-01:30");
			const u: TimeZone = TimeZone.zone("-01:30");
			expect(t).to.equal(u);
		});
		it("should cache the time zone objects with/without DST separately", (): void => {
			const t: TimeZone = TimeZone.zone("Europe/Amsterdam", true);
			const u: TimeZone = TimeZone.zone("Europe/Amsterdam", false);
			expect(t).not.to.equal(u);
		});
		it("should cache the time zone objects even when different formats given", (): void => {
			const t: TimeZone = TimeZone.zone("Z");
			const u: TimeZone = TimeZone.zone("+00:00");
			expect(t).to.equal(u);
		});
		it("should throw on out-of-range hours", (): void => {
			assert.throws((): void => { TimeZone.zone("+24:00"); }, "zone(string) should throw on out of range input");
			assert.throws((): void => { TimeZone.zone("-24:00"); }, "zone(string) should throw on out of range input");
		});
		it("should throw on out-of-range minutes", (): void => {
			assert.throws((): void => { TimeZone.zone("+01:60"); }, "zone(string) should throw on out of range input");
			assert.throws((): void => { TimeZone.zone("-01:60"); }, "zone(string) should throw on out of range input");
		});
	});

	describe("offsetForUtc()", (): void => {
		it("should work for local time", (): void => {
			const t = TimeZone.local();
			// check DST changes
			const d1 = new Date(2014, 1, 1, 1, 2, 3, 4);
			const d2 = new Date(2014, 7, 1, 1, 2, 3, 4);
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(-1 * d1.getTimezoneOffset());
			expect(t.offsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(-1 * d2.getTimezoneOffset());
		});
		it("should work for IANA zone", (): void => {
			const t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(-6 * 60);
		});
		it("should work for around DST", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam");
			expect(t.offsetForUtc(2014, 10, 26, 1, 59, 59, 0)).to.equal(60);
		});
		it("should work for IANA zone without DST", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam", false);
			expect(t.offsetForUtc(2014, 8, 26, 1, 59, 59, 0)).to.equal(60);
		});
		it("should work for fixed offset", (): void => {
			const t = TimeZone.zone("+0130");
			// check DST changes
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
			expect(t.offsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should work if time not given", (): void => {
			const t = TimeZone.zone("+0130");
			expect(t.offsetForUtc(2014, 1, 1, 0, 0, 0, 0)).to.equal(90);
		});
	});

	describe("standardOffsetForUtc()", (): void => {
		it("should work for local time", (): void => {
			const t = TimeZone.local();
			// check DST changes (should not happen)
			const d1 = new Date(2014, 1, 1, 0, 0, 0, 0);
			expect(t.standardOffsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(-1 * d1.getTimezoneOffset());
			expect(t.standardOffsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(-1 * d1.getTimezoneOffset());
		});
		it("should work for IANA zone", (): void => {
			const t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.standardOffsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.standardOffsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
		});
		it("should work for around DST", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam");
			expect(t.standardOffsetForUtc(2014, 10, 26, 1, 59, 59, 0)).to.equal(60);
		});
		it("should work for IANA zone without DST", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam", false);
			expect(t.standardOffsetForUtc(2014, 8, 26, 1, 59, 59, 0)).to.equal(60);
		});
		it("should work for fixed offset", (): void => {
			const t = TimeZone.zone("+0130");
			// check DST changes
			expect(t.standardOffsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
			expect(t.standardOffsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should work if time not given", (): void => {
			const t = TimeZone.zone("+0130");
			expect(t.standardOffsetForUtc(2014, 1, 1, 0, 0, 0, 0)).to.equal(90);
		});
	});

	describe("offsetForUtcDate()", (): void => {
		it("should with Get", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam");
			const d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForUtcDate(d, DateFunctions.Get)).to.equal(
				t.offsetForUtc(
					d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(),
					d.getMinutes(), d.getSeconds(), d.getMilliseconds()
				)
			);
		});
		it("should with GetUtc", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam");
			const d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForUtcDate(d, DateFunctions.GetUTC)).to.equal(
				t.offsetForUtc(
					d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(),
					d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
				)
			);
		});
	});


	describe("offsetForZone()", (): void => {
		it("should work for local time", (): void => {
			const t = TimeZone.local();
			// check DST changes
			const d1 = new Date(2014, 1, 1, 1, 2, 3, 4);
			const d2 = new Date(2014, 7, 1, 1, 2, 3, 4);
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-1 * d1.getTimezoneOffset());
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-1 * d2.getTimezoneOffset());
		});
		it("should work for IANA zone", (): void => {
			const t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-6 * 60);
		});
		it("should work for IANA zone wihtout DST", (): void => {
			const t = TimeZone.zone("America/Edmonton", false);
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
		});

		it("should work for non-existing DST forward time", (): void => {
			let t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-6 * 60);
			t = TimeZone.zone("Europe/Amsterdam");
			// non-existing europe/amsterdam date due to DST, should be processed as if rounded up to existing time
			expect(t.offsetForZone(2014, 3, 30, 2, 0, 0, 0)).to.equal(2 * 60);
		});
		it("should work for fixed offset", (): void => {
			const t = TimeZone.zone("+0130");
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should work if time not given", (): void => {
			const t = TimeZone.zone("+0130");
			expect(t.offsetForZone(2014, 1, 1, 0, 0, 0, 0)).to.equal(90);
		});
	});

	describe("offsetForZoneDate()", (): void => {
		it("should with Get", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam");
			const d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForZoneDate(d, DateFunctions.Get)).to.equal(
				t.offsetForZone(
					d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(),
					d.getMinutes(), d.getSeconds(), d.getMilliseconds()
				)
			);
		});
		it("should with GetUtc", (): void => {
			const t = TimeZone.zone("Europe/Amsterdam");
			const d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForZoneDate(d, DateFunctions.GetUTC)).to.equal(
				t.offsetForZone(
					d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(),
					d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
				)
			);
		});
	});

	describe("equals()", (): void => {
		it("should handle local zone", (): void => {
			expect(TimeZone.local().equals(TimeZone.local())).to.equal(true);
			expect(TimeZone.local().equals(TimeZone.zone("localtime"))).to.equal(true);
			expect(TimeZone.local().equals(TimeZone.zone("localtime", false))).to.equal(true);
			expect(TimeZone.local().equals(TimeZone.utc())).to.equal(false);
			expect(TimeZone.local().equals(TimeZone.zone(6))).to.equal(false);
		});
		it("should handle offset zone", (): void => {
			expect(TimeZone.zone(3).equals(TimeZone.zone(3))).to.equal(true);
			expect(TimeZone.zone(3).equals(TimeZone.utc())).to.equal(false);
			expect(TimeZone.zone(3).equals(TimeZone.local())).to.equal(false);
			expect(TimeZone.zone(3).equals(TimeZone.zone(-1))).to.equal(false);
			expect(TimeZone.zone("+03:00", false).equals(TimeZone.zone("+03:00", true))).to.equal(true);
			expect(TimeZone.zone("+03:00", false).equals(TimeZone.zone(180))).to.equal(true);
		});
		it("should handle proper zone", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.zone("Europe/Amsterdam"))).to.equal(true);
			expect(TimeZone.zone("Europe/Amsterdam", false).equals(TimeZone.zone("Europe/Amsterdam", false))).to.equal(true);
			expect(TimeZone.zone("Europe/Amsterdam", true).equals(TimeZone.zone("Europe/Amsterdam", false))).to.equal(false);
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.utc())).to.equal(false);
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.local())).to.equal(false);
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.zone(-1))).to.equal(false);
		});
		it("should handle UTC in different forms", (): void => {
			expect(TimeZone.utc().equals(TimeZone.zone("GMT"))).to.equal(true);
			expect(TimeZone.utc().equals(TimeZone.zone("UTC"))).to.equal(true);
			expect(TimeZone.utc().equals(TimeZone.zone(0))).to.equal(true);
		});
	});

	describe("identical()", (): void => {
		it("should handle local zone", (): void => {
			expect(TimeZone.local().identical(TimeZone.local())).to.equal(true);
			expect(TimeZone.local().identical(TimeZone.zone("localtime"))).to.equal(true);
			expect(TimeZone.local().identical(TimeZone.zone("localtime", false))).to.equal(true);
			expect(TimeZone.local().identical(TimeZone.utc())).to.equal(false);
			expect(TimeZone.local().identical(TimeZone.zone(6))).to.equal(false);
		});
		it("should handle offset zone", (): void => {
			expect(TimeZone.zone(3).identical(TimeZone.zone(3))).to.equal(true);
			expect(TimeZone.zone(3).identical(TimeZone.utc())).to.equal(false);
			expect(TimeZone.zone(3).identical(TimeZone.local())).to.equal(false);
			expect(TimeZone.zone(3).identical(TimeZone.zone(-1))).to.equal(false);
			expect(TimeZone.zone("+03:00", false).identical(TimeZone.zone("+03:00", true))).to.equal(true);
			expect(TimeZone.zone("+03:00", false).identical(TimeZone.zone(180))).to.equal(true);
		});
		it("should handle proper zone", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam").identical(TimeZone.zone("Europe/Amsterdam"))).to.equal(true);
			expect(TimeZone.zone("Europe/Amsterdam", false).identical(TimeZone.zone("Europe/Amsterdam", false))).to.equal(true);
			expect(TimeZone.zone("Europe/Amsterdam", true).identical(TimeZone.zone("Europe/Amsterdam", false))).to.equal(false);
			expect(TimeZone.zone("Europe/Amsterdam").identical(TimeZone.utc())).to.equal(false);
			expect(TimeZone.zone("Europe/Amsterdam").identical(TimeZone.local())).to.equal(false);
			expect(TimeZone.zone("Europe/Amsterdam").identical(TimeZone.zone(-1))).to.equal(false);
		});
		it("should handle UTC in different forms", (): void => {
			expect(TimeZone.zone("UTC").identical(TimeZone.zone("GMT"))).to.equal(false);
			expect(TimeZone.utc().identical(TimeZone.zone(0))).to.equal(false);
		});
	});

	describe("stringToOffset()", (): void => {
		it("should work for Z", (): void => {
			expect(TimeZone.stringToOffset("Z")).to.equal(0);
			expect(TimeZone.stringToOffset("+00:00")).to.equal(0);
			expect(TimeZone.stringToOffset("-01:30")).to.equal(-90);
			expect(TimeZone.stringToOffset("-01")).to.equal(-60);
		});
	});

	describe("dst()", (): void => {
		it("should work", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam", true).dst()).to.equal(true);
			expect(TimeZone.zone("Europe/Amsterdam", false).dst()).to.equal(false);
		});
	});

	describe("hasDst()", (): void => {
		it("should work for local timezone", (): void => {
			expect(TimeZone.local().hasDst()).to.equal(false);
		});
		it("should work for offset timezone", (): void => {
			expect(TimeZone.zone(3).hasDst()).to.equal(false);
		});
		it("should work for named zone without DST", (): void => {
			expect(TimeZone.zone("UTC").hasDst()).to.equal(false);
		});
		it("should work for named zone with DST", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam").hasDst()).to.equal(true);
		});
	});

	describe("abbreviationForUtc()", (): void => {
		it("should work for local timezone", (): void => {
			expect(TimeZone.local().abbreviationForUtc(2014, 1, 1, 0, 0, 0, 0)).to.equal("local");
		});
		it("should work for offset timezone", (): void => {
			expect(TimeZone.zone(3).abbreviationForUtc(2014, 1, 1, 0, 0, 0, 0)).to.equal(TimeZone.zone(3).toString());
		});
		it("should work for named zone without DST", (): void => {
			expect(TimeZone.zone("UTC").abbreviationForUtc(2014, 1, 1, 0, 0, 0, 0)).to.equal("UTC");
		});
		it("should work for named zone with DST", (): void => {
			// note that the underlying functionality is fully tested in test-tz-database
			expect(TimeZone.zone("Europe/Amsterdam").abbreviationForUtc(2014, 7, 1, 0, 0, 0, 0)).to.equal("CEST");
		});
	});

	describe("toString()", (): void => {
		it("should append 'no dst' for iana zone with false DST flag", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam", false).toString()).to.equal("Europe/Amsterdam without DST");
		});
		it("should not append 'no dst' for iana zone with true DST flag", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam", true).toString()).to.equal("Europe/Amsterdam");
		});
		it("should not append 'no dst' for iana zone that never has DST", (): void => {
			expect(TimeZone.zone("Etc/GMT", false).toString()).to.equal("Etc/GMT");
		});
		it("should not append 'no dst' for fixed offset", (): void => {
			expect(TimeZone.zone("+01:00", false).toString()).to.equal("+01:00");
		});
	});

	describe("clone()", (): void => {
		it("should not actually clone because time zones are cached", (): void => {
			const p = TimeZone.zone("Europe/Amsterdam");
			const q = p.clone();
			expect(p).to.equal(q);
		});
	});
});

