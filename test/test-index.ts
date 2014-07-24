/// <reference path="../typings/test.d.ts" />

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;

import datetimeFuncs = require("../lib/index");

import DateFunctions = datetimeFuncs.DateFunctions;
import DateTime = datetimeFuncs.DateTime;
import Duration = datetimeFuncs.Duration;
import Period = datetimeFuncs.Period;
import PeriodDst = datetimeFuncs.PeriodDst;
import TimeSource = datetimeFuncs.TimeSource;
import TimeUnit = datetimeFuncs.TimeUnit;
import TimeZone = datetimeFuncs.TimeZone;
import WeekDay = datetimeFuncs.WeekDay;

// Fake time source
class TestTimeSource implements TimeSource {
	public currentTime: Date = new Date("2014-01-03T04:05:06.007Z");

	now(): Date {
		return this.currentTime;
	}
}

// Insert fake time source so that now() is stable
var testTimeSource: TestTimeSource = new TestTimeSource();
DateTime.timeSource = testTimeSource;

describe("isLeapYear()", (): void => {
	it("should work", (): void => {	
		expect(datetimeFuncs.isLeapYear(2001)).to.be.false; // normal non-leap year
		expect(datetimeFuncs.isLeapYear(2004)).to.be.true; // normal leap year
		expect(datetimeFuncs.isLeapYear(2200)).to.be.false; // divisible by 100 but not 400
		expect(datetimeFuncs.isLeapYear(2000)).to.be.true; // divisible by 400
	});
});

describe("daysInMonth()", (): void => {
	it("should work", (): void => {	
		expect(datetimeFuncs.daysInMonth(2001, 1)).to.equal(31); 
		expect(datetimeFuncs.daysInMonth(2001, 2)).to.equal(28); 
		expect(datetimeFuncs.daysInMonth(2004, 2)).to.equal(29); 
		expect(datetimeFuncs.daysInMonth(2200, 2)).to.equal(28); 
		expect(datetimeFuncs.daysInMonth(2000, 2)).to.equal(29); 
		expect(datetimeFuncs.daysInMonth(2001, 3)).to.equal(31); 
		expect(datetimeFuncs.daysInMonth(2001, 4)).to.equal(30); 
		expect(datetimeFuncs.daysInMonth(2001, 5)).to.equal(31); 
		expect(datetimeFuncs.daysInMonth(2001, 6)).to.equal(30); 
		expect(datetimeFuncs.daysInMonth(2001, 7)).to.equal(31); 
		expect(datetimeFuncs.daysInMonth(2001, 8)).to.equal(31); 
		expect(datetimeFuncs.daysInMonth(2001, 9)).to.equal(30); 
		expect(datetimeFuncs.daysInMonth(2001, 10)).to.equal(31); 
		expect(datetimeFuncs.daysInMonth(2001, 11)).to.equal(30); 
		expect(datetimeFuncs.daysInMonth(2001, 12)).to.equal(31); 
	});
	it("should throw for invalid month", (): void => {
		assert.throws((): void => {
			datetimeFuncs.daysInMonth(2001, 0);
		});
		assert.throws((): void => {
			datetimeFuncs.daysInMonth(2001, 13);
		});
		assert.throws((): void => {
			datetimeFuncs.daysInMonth(10, 2001);
		});
	});
});

describe("Duration()", (): void => {

	describe("constructor", (): void => {

		it("construct by hour", (): void => {
			expect(Duration.hours(2).milliseconds()).to.equal(2 * 60 * 60 * 1000);
		});

		it("construct by minute", (): void => {
			expect(Duration.minutes(2).milliseconds()).to.equal(2 * 60 * 1000);
		});

		it("construct by second", (): void => {
			expect(Duration.seconds(2).milliseconds()).to.equal(2 * 1000);
		});

		it("construct by milliseconds", (): void => {
			expect(Duration.milliseconds(2).milliseconds()).to.equal(2);
		});

		it("construct no args", (): void => {
			expect((new Duration()).milliseconds()).to.equal(0);
		});

		it("construct from number", (): void => {
			expect((new Duration(1)).milliseconds()).to.equal(1);
			expect((new Duration(-1)).milliseconds()).to.equal(-1);
		});

		it("construct from string", (): void => {
			expect((new Duration("01")).milliseconds()).to.equal(1 * 3600 * 1000);
			expect((new Duration("01:01")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000);
			expect((new Duration("01:01:01")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000);
			expect((new Duration("01:01:01.1")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 100);
			expect((new Duration("01:01:01.101")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101);
			expect((new Duration("-01:01:01.101")).milliseconds()).to.equal(-1 * (1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101));
			expect((new Duration("-1:1:1.101")).milliseconds()).to.equal(-1 * (1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101));
			expect((new Duration("25")).milliseconds()).to.equal(25 * 3600 * 1000);
			expect((new Duration("-01:02:03.004")).milliseconds()).to.equal(-1 * (1 * 3600 * 1000 + 2 * 60 * 1000 + 3 * 1000 + 4));
		});

		it("throws on invalid string", (): void => {
			/* tslint:disable:no-unused-expression */
			assert.throws(function (): void { new Duration("harrie"); });
			assert.throws(function (): void { new Duration("01:01:01:01"); });
			assert.throws(function (): void { new Duration("01.001"); });
			assert.throws(function (): void { new Duration("01:02.003"); });
			assert.throws(function (): void { new Duration("01:01:01:-2.003"); });
			assert.throws(function (): void { new Duration(".001"); });
			assert.throws(function (): void { new Duration(":01:01"); });
			/* tslint:enable:no-unused-expression */
		});
	});

	describe("clone", (): void => {
		it("should return an object with the same value", (): void => {
			var d: Duration = new Duration("01:00:00.000");
			expect(d.clone().milliseconds()).to.equal(3600000);
		});
		it("should return a new object", (): void => {
			var d: Duration = new Duration("01:00:00.000");
			expect(d.clone() === d).to.be.false;
		});
	});

	describe("getters", (): void => {
		it("getters", (): void => {
			var duration = new Duration("-01:02:03.004");
			var millis = -1 * (1 * 3600 * 1000 + 2 * 60 * 1000 + 3 * 1000 + 4);
			expect(duration.sign()).to.equal("-");
			expect(duration.hours()).to.equal(millis / 3600000);
			expect(duration.minutes()).to.equal(millis / 60000);
			expect(duration.minute()).to.equal(2);
			expect(duration.seconds()).to.equal(millis / 1000);
			expect(duration.second()).to.equal(3);
			expect(duration.milliseconds()).to.equal(millis);
			expect(duration.millisecond()).to.equal(4);
			var duration2 = new Duration("01:02:03.004");
			expect(duration2.sign()).to.equal("");
		});
	});

	describe("lessThan()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(Duration.milliseconds(-1).lessThan(Duration.milliseconds(0))).to.be.true;
			expect(Duration.milliseconds(-1).lessThan(Duration.milliseconds(1))).to.be.true;
			expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(2))).to.be.true;
			expect(Duration.seconds(1).lessThan(Duration.seconds(2))).to.be.true;
			expect(Duration.seconds(1).lessThan(Duration.hours(1))).to.be.true;
			expect(Duration.hours(-1).lessThan(Duration.seconds(1))).to.be.true;
		});
		it("should return false for an equal other", (): void => {
			expect(Duration.milliseconds(60000).lessThan(Duration.milliseconds(60000))).to.be.false;
			expect(Duration.milliseconds(60000).lessThan(Duration.minutes(1))).to.be.false;
		});
		it("should return false for a lesser other", (): void => {
			expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(-1))).to.be.false;
			expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(-1))).to.be.false;
			expect(Duration.milliseconds(2).lessThan(Duration.milliseconds(1))).to.be.false;
			expect(Duration.seconds(1).lessThan(Duration.seconds(1))).to.be.false;
			expect(Duration.hours(1).lessThan(Duration.seconds(1))).to.be.false;
			expect(Duration.seconds(1).lessThan(Duration.hours(-1))).to.be.false;
		});
	});

	describe("equals()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(Duration.milliseconds(-1).equals(Duration.milliseconds(0))).to.be.false;
			expect(Duration.milliseconds(-1).equals(Duration.milliseconds(1))).to.be.false;
			expect(Duration.milliseconds(1).equals(Duration.milliseconds(2))).to.be.false;
			expect(Duration.seconds(1).equals(Duration.seconds(2))).to.be.false;
			expect(Duration.seconds(1).equals(Duration.hours(1))).to.be.false;
			expect(Duration.hours(-1).equals(Duration.seconds(1))).to.be.false;
		});
		it("should return true for an equal other", (): void => {
			expect(Duration.milliseconds(60000).equals(Duration.milliseconds(60000))).to.be.true;
			expect(Duration.milliseconds(60000).equals(Duration.minutes(1))).to.be.true;
		});
		it("should return false for a lesser other", (): void => {
			expect(Duration.milliseconds(1).equals(Duration.milliseconds(-1))).to.be.false;
			expect(Duration.milliseconds(1).equals(Duration.milliseconds(-1))).to.be.false;
			expect(Duration.milliseconds(2).equals(Duration.milliseconds(1))).to.be.false;
			expect(Duration.seconds(2).equals(Duration.seconds(1))).to.be.false;
			expect(Duration.hours(1).equals(Duration.seconds(1))).to.be.false;
			expect(Duration.seconds(1).equals(Duration.hours(-1))).to.be.false;
		});
	});

	describe("greaterThan()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(Duration.milliseconds(-1).greaterThan(Duration.milliseconds(0))).to.be.false;
			expect(Duration.milliseconds(-1).greaterThan(Duration.milliseconds(1))).to.be.false;
			expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(2))).to.be.false;
			expect(Duration.seconds(1).greaterThan(Duration.seconds(2))).to.be.false;
			expect(Duration.seconds(1).greaterThan(Duration.hours(1))).to.be.false;
			expect(Duration.hours(-1).greaterThan(Duration.seconds(1))).to.be.false;
		});
		it("should return false for an equal other", (): void => {
			expect(Duration.milliseconds(60000).greaterThan(Duration.milliseconds(60000))).to.be.false;
			expect(Duration.milliseconds(60000).greaterThan(Duration.minutes(1))).to.be.false;
		});
		it("should return true for a lesser other", (): void => {
			expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(-1))).to.be.true;
			expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(-1))).to.be.true;
			expect(Duration.milliseconds(2).greaterThan(Duration.milliseconds(1))).to.be.true;
			expect(Duration.seconds(2).greaterThan(Duration.seconds(1))).to.be.true;
			expect(Duration.hours(1).greaterThan(Duration.seconds(1))).to.be.true;
			expect(Duration.seconds(1).greaterThan(Duration.hours(-1))).to.be.true;
		});
	});

	describe("min()", (): void => {
		it("should return a value equal to this if this is smaller", (): void => {
			expect(Duration.milliseconds(1).min(Duration.milliseconds(2)).milliseconds()).to.equal(1);
		});
		it("should any of the values if they are equal", (): void => {
			expect(Duration.milliseconds(1).min(Duration.milliseconds(1)).milliseconds()).to.equal(1);
		});
		it("should the other value if it is smaller", (): void => {
			expect(Duration.milliseconds(2).min(Duration.milliseconds(1)).milliseconds()).to.equal(1);
		});
	});

	describe("max()", (): void => {
		it("should return a value equal to other if this is smaller", (): void => {
			expect(Duration.milliseconds(1).max(Duration.milliseconds(2)).milliseconds()).to.equal(2);
		});
		it("should any of the values if they are equal", (): void => {
			expect(Duration.milliseconds(1).max(Duration.milliseconds(1)).milliseconds()).to.equal(1);
		});
		it("should this value if this is greater", (): void => {
			expect(Duration.milliseconds(2).max(Duration.milliseconds(1)).milliseconds()).to.equal(2);
		});
	});

	describe("multiply()", (): void => {
		it("should multiply by positive number", (): void => {
			expect(Duration.milliseconds(2).multiply(3).milliseconds()).to.equal(6);
		});
		it("should multiply by 0", (): void => {
			expect(Duration.milliseconds(2).multiply(0).milliseconds()).to.equal(0);
		});
		it("should multiply by negative number", (): void => {
			expect(Duration.milliseconds(2).multiply(-3).milliseconds()).to.equal(-6);
		});
	});

	describe("divide()", (): void => {
		it("should divide by positive number", (): void => {
			expect(Duration.milliseconds(6).divide(3).milliseconds()).to.equal(2);
		});
		it("should throw on divide by 0", (): void => {
			assert.throws((): void => {
				Duration.milliseconds(6).divide(0);
			});
		});
		it("should divide by negative number", (): void => {
			expect(Duration.milliseconds(6).divide(-3).milliseconds()).to.equal(-2);
		});
	});

	describe("add()", (): void => {
		it("should add positive number", (): void => {
			expect(Duration.milliseconds(2).add(Duration.milliseconds(3)).milliseconds()).to.equal(5);
		});
		it("should add 0", (): void => {
			expect(Duration.milliseconds(2).add(Duration.milliseconds(0)).milliseconds()).to.equal(2);
		});
		it("should add negative number", (): void => {
			expect(Duration.milliseconds(2).add(Duration.milliseconds(-3)).milliseconds()).to.equal(-1);
		});
		it("should return a new object always", (): void => {
			var d: Duration = Duration.milliseconds(2);
			var e: Duration = Duration.milliseconds(0);
			expect(d.add(e) === d).to.be.false;
			expect(d.add(e) === e).to.be.false;
		});
	});

	describe("sub()", (): void => {
		it("should sub positive number", (): void => {
			expect(Duration.milliseconds(2).sub(Duration.milliseconds(3)).milliseconds()).to.equal(-1);
		});
		it("should sub 0", (): void => {
			expect(Duration.milliseconds(2).sub(Duration.milliseconds(0)).milliseconds()).to.equal(2);
		});
		it("should sub negative number", (): void => {
			expect(Duration.milliseconds(2).sub(Duration.milliseconds(-3)).milliseconds()).to.equal(5);
		});
		it("should return a new object always", (): void => {
			var d: Duration = Duration.milliseconds(2);
			var e: Duration = Duration.milliseconds(0);
			expect(d.sub(e) === d).to.be.false;
			expect(d.sub(e) === e).to.be.false;
		});
	});

	describe("toFullString()", (): void => {
		it("toFullString", (): void => {
			expect((new Duration("-30:02:03.004")).toFullString()).to.equal("-30:02:03.004");
			expect((new Duration("-01:02:03.004")).toFullString()).to.equal("-01:02:03.004");
			expect((new Duration("-01:02:03.4")).toFullString()).to.equal("-01:02:03.400");
			expect((new Duration("01")).toFullString()).to.equal("01:00:00.000");
		});
	});

	describe("toString()", (): void => {
		it("should handle hours above 23", (): void => {
			expect((new Duration("-30:02:03.004")).toString()).to.equal("-30:02:03.004");
		});
		it("should handle hours below 24", (): void => {
			expect((new Duration("-01:02:03.004")).toString()).to.equal("-01:02:03.004");
		});
		it("should shorten the string if possible", (): void => {
			expect((new Duration("-01:02:03.4")).toString()).to.equal("-01:02:03.400");
			expect((new Duration("01")).toString()).to.equal("01");
			expect((new Duration("01:02")).toString()).to.equal("01:02");
			expect((new Duration("01:02:03")).toString()).to.equal("01:02:03");
			expect((new Duration("01:02:03.000")).toString()).to.equal("01:02:03");
		});
	});
	
	describe("inspect()", (): void => {
		it("should work", (): void => {
			var d: Duration = new Duration("-01:02:03.4");
			expect(d.inspect()).to.equal("[Duration: " + d.toString() + "]");
		});
	});

});

describe("TimeZone", (): void => {

	describe("local()", (): void => {
		it("should create a local time zone", (): void => {
			var t: TimeZone = TimeZone.local();
			var localOffset: number = (testTimeSource.now()).getTimezoneOffset();
			expect(t.offsetForZoneDate(testTimeSource.now(), DateFunctions.Get)).to.equal(-1 * localOffset);
			expect(t.offsetForUtcDate(testTimeSource.now(), DateFunctions.GetUTC)).to.equal(-1 * localOffset);
		});
		it("should cache the time zone objects", (): void => {
			var t: TimeZone = TimeZone.local();
			var u: TimeZone = TimeZone.local();
			expect(t).to.equal(u);
		});
	});

	describe("utc()", (): void => {
		it("should create a UTC zone", (): void => {
			var t: TimeZone = TimeZone.utc();
			expect(t.offsetForZone(2014, 2, 3, 4, 5, 6, 7)).to.equal(0);
			expect(t.offsetForUtc(2014, 2, 3, 4, 5, 6, 7)).to.equal(0);
		});
		it("should cache the time zone objects", (): void => {
			var t: TimeZone = TimeZone.utc();
			var u: TimeZone = TimeZone.utc();
			expect(t).to.equal(u);
		});
	});

	describe("zone(number)", (): void => {
		it("should create a time zone for a whole number", (): void => {
			var t: TimeZone = TimeZone.zone(60);
			expect(t.offsetForZone(2014, 7, 1, 2, 3, 4, 5)).to.equal(60);
			expect(t.offsetForUtc(2014, 7, 1, 2, 3, 4, 5)).to.equal(60);
		});
		it("should create a time zone for a negative number", (): void => {
			var t: TimeZone = TimeZone.zone(-60);
			expect(t.offsetForZone(2014, 7, 1, 2, 3, 4, 5)).to.equal(-60);
			expect(t.offsetForUtc(2014, 7, 1, 2, 3, 4, 5)).to.equal(-60);
		});
		it("should not handle DST", (): void => {
			var t: TimeZone = TimeZone.zone(-60);
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-60);
		});
		it("should cache the time zone objects", (): void => {
			var t: TimeZone = TimeZone.zone(-60);
			var u: TimeZone = TimeZone.zone(-60);
			expect(t).to.equal(u);
		});
		assert.throws(function (): void { TimeZone.zone(-24 * 60); }, "zone(number) should throw on out of range offset");
		assert.throws(function (): void { TimeZone.zone(24 * 60); }, "zone(number) should throw on out of range offset");
	});

	describe("zone(string)", (): void => {
		it("should return NULL for an empty string", (): void => {
			var t: TimeZone = TimeZone.zone("");
			expect(t).to.be.null;
		});
		it("should create a time zone for a positive ISO offset", (): void => {
			var t: TimeZone = TimeZone.zone("+01:30");
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should create a time zone for a negative ISO offset", (): void => {
			var t: TimeZone = TimeZone.zone("-01:30");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-90);
		});
		it("should create a time zone for an ISO offset without a colon", (): void => {
			var t: TimeZone = TimeZone.zone("+0130");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should create a time zone for an ISO offset without minutes", (): void => {
			var t: TimeZone = TimeZone.zone("+01");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(60);
		});
		it("should create a time zone for Zulu", (): void => {
			var t: TimeZone = TimeZone.zone("Z");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(0);
		});
		it("should return a time zone for an IANA time zone string", (): void => {
			var t: TimeZone = TimeZone.zone("Africa/Asmara");
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(180);
		});
		it("should return a time zone for local time", (): void => {
			var t: TimeZone = TimeZone.zone("localtime");
			expect(t.equals(TimeZone.local())).to.be.true;
		});
		it("should cache the time zone objects", (): void => {
			var t: TimeZone = TimeZone.zone("-01:30");
			var u: TimeZone = TimeZone.zone("-01:30");
			expect(t).to.equal(u);
		});
		it("should cache the time zone objects even when different formats given", (): void => {
			var t: TimeZone = TimeZone.zone("Z");
			var u: TimeZone = TimeZone.zone("+00:00");
			expect(t).to.equal(u);
		});
		assert.throws(function (): void { TimeZone.zone("+24:00"); }, "zone(string) should throw on out of range input");
		assert.throws(function (): void { TimeZone.zone("-24:00"); }, "zone(string) should throw on out of range input");
	});

	describe("offsetForUtc()", (): void => {
		it("should work for local time", (): void => {
			var t = TimeZone.local();
			// check DST changes
			var d1 = new Date(2014, 1, 1, 1, 2, 3, 4);
			var d2 = new Date(2014, 7, 1, 1, 2, 3, 4);
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(-1 * d1.getTimezoneOffset());
			expect(t.offsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(-1 * d2.getTimezoneOffset());
		});
		it("should work for IANA zone", (): void => {
			var t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(-6 * 60);
		});
		it("should work for around DST", (): void => {
			var t = TimeZone.zone("Europe/Amsterdam");
			expect(t.offsetForUtc(2014, 10, 26, 1, 59, 59, 0)).to.equal(60);
		});
		it("should work for fixed offset", (): void => {
			var t = TimeZone.zone("+0130");
			// check DST changes
			expect(t.offsetForUtc(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
			expect(t.offsetForUtc(2014, 7, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should work if time not given", (): void => {
			var t = TimeZone.zone("+0130");
			expect(t.offsetForUtc(2014, 1, 1)).to.equal(90);
		});			
	});
	
	describe("offsetForUtcDate()", (): void => {
		it("should with Get", (): void => {
			var t = TimeZone.zone("Europe/Amsterdam");
			var d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForUtcDate(d, DateFunctions.Get)).to.equal(
				t.offsetForUtc(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), 
				d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
		});			
		it("should with GetUtc", (): void => {
			var t = TimeZone.zone("Europe/Amsterdam");
			var d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForUtcDate(d, DateFunctions.GetUTC)).to.equal(
				t.offsetForUtc(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), 
				d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()));
		});			
	});


	describe("offsetForZone()", (): void => {
		it("should work for local time", (): void => {
			var t = TimeZone.local();
			// check DST changes
			var d1 = new Date(2014, 1, 1, 1, 2, 3, 4);
			var d2 = new Date(2014, 7, 1, 1, 2, 3, 4);
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-1 * d1.getTimezoneOffset());
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-1 * d2.getTimezoneOffset());
		});
		it("should work for IANA zone", (): void => {
			var t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-6 * 60);
		});
		it("should work for non-existing DST forward time", (): void => {
			var t = TimeZone.zone("America/Edmonton");
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(-7 * 60);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(-6 * 60);
			t = TimeZone.zone("Europe/Amsterdam");
			// non-existing europe/amsterdam date due to DST, should be processed as if no DST
			expect(t.offsetForZone(2014, 3, 30, 2, 0, 0, 0)).to.equal(1 * 60);
		});
		it("should work for fixed offset", (): void => {
			var t = TimeZone.zone("+0130");
			// check DST changes
			expect(t.offsetForZone(2014, 1, 1, 1, 2, 3, 4)).to.equal(90);
			expect(t.offsetForZone(2014, 7, 1, 1, 2, 3, 4)).to.equal(90);
		});
		it("should work if time not given", (): void => {
			var t = TimeZone.zone("+0130");
			expect(t.offsetForZone(2014, 1, 1)).to.equal(90);
		});			
	});
	
	describe("offsetForZoneDate()", (): void => {
		it("should with Get", (): void => {
			var t = TimeZone.zone("Europe/Amsterdam");
			var d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForZoneDate(d, DateFunctions.Get)).to.equal(
				t.offsetForZone(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), 
				d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
		});			
		it("should with GetUtc", (): void => {
			var t = TimeZone.zone("Europe/Amsterdam");
			var d = new Date(2014, 2, 26, 3, 0, 1, 0);
			expect(t.offsetForZoneDate(d, DateFunctions.GetUTC)).to.equal(
				t.offsetForZone(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), 
				d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()));
		});			
	});

	describe("equals()", (): void => {
		it("should handle local zone", (): void => {
			expect(TimeZone.local().equals(TimeZone.local())).to.be.true;
			expect(TimeZone.local().equals(TimeZone.utc())).to.be.false;
			expect(TimeZone.local().equals(TimeZone.zone(6))).to.be.false;
		});
		it("should handle offset zone", (): void => {
			expect(TimeZone.zone(3).equals(TimeZone.zone(3))).to.be.true;
			expect(TimeZone.zone(3).equals(TimeZone.utc())).to.be.false;
			expect(TimeZone.zone(3).equals(TimeZone.local())).to.be.false;
			expect(TimeZone.zone(3).equals(TimeZone.zone(-1))).to.be.false;
		});
		it("should handle proper zone", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.zone("Europe/Amsterdam"))).to.be.true;
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.utc())).to.be.false;
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.local())).to.be.false;
			expect(TimeZone.zone("Europe/Amsterdam").equals(TimeZone.zone(-1))).to.be.false;
		});
		it("should handle UTC in different forms", (): void => {
			expect(TimeZone.utc().equals(TimeZone.zone("GMT"))).to.be.true;
			expect(TimeZone.utc().equals(TimeZone.zone("UTC"))).to.be.true;
			expect(TimeZone.utc().equals(TimeZone.zone(0))).to.be.true;
		});
	});
	
	describe("inspect()", (): void => {
		it("should work", (): void => {
			expect(TimeZone.zone("Europe/Amsterdam").inspect()).to.equal("[TimeZone: Europe/Amsterdam]");
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

});

describe("DateTime", (): void => {
	// ensure time faked
	beforeEach(function (): void {
		testTimeSource.currentTime = new Date("2014-01-03T04:05:06.007Z");
		DateTime.timeSource = testTimeSource;
	});

	describe("nowLocal()", (): void => {
		it("should return something with a local time zone", (): void => {
			expect(DateTime.nowLocal().offset()).to.equal(-1 * testTimeSource.now().getTimezoneOffset());
		});
		it("should return the local time", (): void => {
			expect(DateTime.nowLocal().year()).to.equal(testTimeSource.currentTime.getFullYear());
			expect(DateTime.nowLocal().month()).to.equal(testTimeSource.currentTime.getMonth() + 1); // javascript starts from 0
			expect(DateTime.nowLocal().day()).to.equal(testTimeSource.currentTime.getDate());
			expect(DateTime.nowLocal().hour()).to.equal(testTimeSource.currentTime.getHours());
			expect(DateTime.nowLocal().minute()).to.equal(testTimeSource.currentTime.getMinutes());
			expect(DateTime.nowLocal().second()).to.equal(testTimeSource.currentTime.getSeconds());
			expect(DateTime.nowLocal().millisecond()).to.equal(testTimeSource.currentTime.getMilliseconds());
		});
	});

	describe("nowUtc()", (): void => {
		it("should return something with a local time zone", (): void => {
			expect(DateTime.nowUtc().zone()).to.equal(TimeZone.utc());
		});
		it("should return the local time", (): void => {
			expect(DateTime.nowUtc().year()).to.equal(testTimeSource.currentTime.getUTCFullYear());
			expect(DateTime.nowUtc().month()).to.equal(testTimeSource.currentTime.getUTCMonth() + 1); // javascript starts from 0
			expect(DateTime.nowUtc().day()).to.equal(testTimeSource.currentTime.getUTCDate());
			expect(DateTime.nowUtc().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
			expect(DateTime.nowUtc().minute()).to.equal(testTimeSource.currentTime.getUTCMinutes());
			expect(DateTime.nowUtc().second()).to.equal(testTimeSource.currentTime.getUTCSeconds());
			expect(DateTime.nowUtc().millisecond()).to.equal(testTimeSource.currentTime.getUTCMilliseconds());
		});
	});

	describe("now", (): void => {
		it("should return something with the given zone", (): void => {
			expect(DateTime.now(TimeZone.zone("+03:00")).zone()).to.equal(TimeZone.zone("+03:00"));
		});
		it("should return the zone time", (): void => {
			expect(DateTime.now(TimeZone.zone("+03:00")).hour()).to.equal(testTimeSource.currentTime.getUTCHours() + 3);
		});
	});

	describe("constructor()", (): void => {
		it("should return something with a local time zone", (): void => {
			expect((new DateTime()).offset()).to.equal(-1 * testTimeSource.now().getTimezoneOffset());
		});
		it("should return the local time", (): void => {
			expect((new DateTime()).year()).to.equal(testTimeSource.currentTime.getFullYear());
			expect((new DateTime()).month()).to.equal(testTimeSource.currentTime.getMonth() + 1); // javascript starts from 0
			expect((new DateTime()).day()).to.equal(testTimeSource.currentTime.getDate());
			expect((new DateTime()).hour()).to.equal(testTimeSource.currentTime.getHours());
			expect((new DateTime()).minute()).to.equal(testTimeSource.currentTime.getMinutes());
			expect((new DateTime()).second()).to.equal(testTimeSource.currentTime.getSeconds());
			expect((new DateTime()).millisecond()).to.equal(testTimeSource.currentTime.getMilliseconds());
		});
	});

	describe("constructor(string)", (): void => {
		it("should parse unaware date", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.010");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(7);
			expect(d.minute()).to.equal(8);
			expect(d.second()).to.equal(9);
			expect(d.millisecond()).to.equal(10);
			expect(d.zone()).to.be.null;
			expect(d.offset()).to.equal(0);
		});
		it("should parse only date", (): void => {
			var d = new DateTime("2014-05-06");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(0);
			expect(d.zone()).to.be.null;
			expect(d.offset()).to.equal(0);
		});
		it("should parse Zulu date", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.010Z");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(7);
			expect(d.minute()).to.equal(8);
			expect(d.second()).to.equal(9);
			expect(d.millisecond()).to.equal(10);
			expect(d.zone().name()).to.equal("+00:00");
			expect(d.offset()).to.equal(0);
		});
		it("should parse zero-offset date", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.010+00:00");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(7);
			expect(d.minute()).to.equal(8);
			expect(d.second()).to.equal(9);
			expect(d.millisecond()).to.equal(10);
			expect(d.zone().name()).to.equal("+00:00");
			expect(d.offset()).to.equal(0);
		});
		it("should parse positive-offset date", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.010+01:30");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(7);
			expect(d.minute()).to.equal(8);
			expect(d.second()).to.equal(9);
			expect(d.millisecond()).to.equal(10);
			expect(d.zone()).to.equal(TimeZone.zone(90));
			expect(d.offset()).to.equal(90);
		});
		it("should parse negative-offset date", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.010-01:30");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(7);
			expect(d.minute()).to.equal(8);
			expect(d.second()).to.equal(9);
			expect(d.millisecond()).to.equal(10);
			expect(d.zone()).to.equal(TimeZone.zone(-90));
			expect(d.offset()).to.equal(-90);
		});
		it("should parse IANA time zone", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.010 Europe/Amsterdam");
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(7);
			expect(d.minute()).to.equal(8);
			expect(d.second()).to.equal(9);
			expect(d.millisecond()).to.equal(10);
			expect(d.zone()).to.equal(TimeZone.zone("Europe/Amsterdam"));
			expect(d.offset()).to.equal(120);
		});
		it("should add given time zone", (): void => {
			var d = new DateTime("2014-05-06", TimeZone.zone(6));
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(0);
			expect(d.zone()).not.to.be.null;
			expect(d.offset()).to.equal(6);
		});
		it("should override time zone in string", (): void => {
			var d = new DateTime("2014-05-06T00:00:00+05", TimeZone.zone(6));
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(5);
			expect(d.day()).to.equal(6);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(0);
			expect(d.zone()).not.to.be.null;
			expect(d.offset()).to.equal(6);
		});
	});	

	describe("constructor(date: Date, dateKind: DateFunctions, timeZone?: TimeZone)", (): void => {
		it("should parse date as local,unaware (winter time)", (): void => {
			var date = new Date("2014-01-02T03:04:05.006Z");
			var d = new DateTime(date, DateFunctions.Get, null);
			expect(d.year()).to.equal(date.getFullYear());
			expect(d.month()).to.equal(date.getMonth() + 1);
			expect(d.day()).to.equal(date.getDate());
			expect(d.hour()).to.equal(date.getHours());
			expect(d.minute()).to.equal(date.getMinutes());
			expect(d.second()).to.equal(date.getSeconds());
			expect(d.millisecond()).to.equal(date.getMilliseconds());
			expect(d.zone()).to.be.null;
		});
		it("should parse date as utc,unaware (winter time)", (): void => {
			var date = new Date("2014-01-02T03:04:05.006Z");
			var d = new DateTime(date, DateFunctions.GetUTC, null);
			expect(d.year()).to.equal(date.getUTCFullYear());
			expect(d.month()).to.equal(date.getUTCMonth() + 1);
			expect(d.day()).to.equal(date.getUTCDate());
			expect(d.hour()).to.equal(date.getUTCHours());
			expect(d.minute()).to.equal(date.getUTCMinutes());
			expect(d.second()).to.equal(date.getUTCSeconds());
			expect(d.millisecond()).to.equal(date.getUTCMilliseconds());
			expect(d.zone()).to.be.null;
		});
		it("should parse date as local,unaware (summer time)", (): void => {
			var date = new Date("2014-07-02T03:04:05.006Z");
			var d = new DateTime(date, DateFunctions.Get, null);
			expect(d.year()).to.equal(date.getFullYear());
			expect(d.month()).to.equal(date.getMonth() + 1);
			expect(d.day()).to.equal(date.getDate());
			expect(d.hour()).to.equal(date.getHours());
			expect(d.minute()).to.equal(date.getMinutes());
			expect(d.second()).to.equal(date.getSeconds());
			expect(d.millisecond()).to.equal(date.getMilliseconds());
			expect(d.zone()).to.be.null;
		});
		it("should parse date as utc,unaware (summer time)", (): void => {
			var date = new Date("2014-07-02T03:04:05.006Z");
			var d = new DateTime(date, DateFunctions.GetUTC, null);
			expect(d.year()).to.equal(date.getUTCFullYear());
			expect(d.month()).to.equal(date.getUTCMonth() + 1);
			expect(d.day()).to.equal(date.getUTCDate());
			expect(d.hour()).to.equal(date.getUTCHours());
			expect(d.minute()).to.equal(date.getUTCMinutes());
			expect(d.second()).to.equal(date.getUTCSeconds());
			expect(d.millisecond()).to.equal(date.getUTCMilliseconds());
			expect(d.zone()).to.be.null;
		});
		it("should parse date local,aware", (): void => {
			var date = new Date("2014-01-02T03:04:05.006Z");
			var d = new DateTime(date, DateFunctions.Get, TimeZone.zone(90));
			expect(d.year()).to.equal(date.getFullYear());
			expect(d.month()).to.equal(date.getMonth() + 1);
			expect(d.day()).to.equal(date.getDate());
			expect(d.hour()).to.equal(date.getHours());
			expect(d.minute()).to.equal(date.getMinutes());
			expect(d.second()).to.equal(date.getSeconds());
			expect(d.millisecond()).to.equal(date.getMilliseconds());
			expect(d.offset()).to.equal(90);
		});
		it("should parse date utc,aware", (): void => {
			var date = new Date("2014-01-02T03:04:05.006Z");
			var d = new DateTime(date, DateFunctions.GetUTC, TimeZone.zone(90));
			expect(d.year()).to.equal(date.getUTCFullYear());
			expect(d.month()).to.equal(date.getUTCMonth() + 1);
			expect(d.day()).to.equal(date.getUTCDate());
			expect(d.hour()).to.equal(date.getUTCHours());
			expect(d.minute()).to.equal(date.getUTCMinutes());
			expect(d.second()).to.equal(date.getUTCSeconds());
			expect(d.millisecond()).to.equal(date.getUTCMilliseconds());
			expect(d.offset()).to.equal(90);
		});
	});

	describe("constructor(year, month, ..., millisecond, timeZone?: TimeZone)", (): void => {
		it("full entries, unaware", (): void => {
			var d = new DateTime(2014, 1, 2, 3, 4, 5, 6, null);
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(3);
			expect(d.minute()).to.equal(4);
			expect(d.second()).to.equal(5);
			expect(d.millisecond()).to.equal(6);
			expect(d.zone()).to.be.null;
		});
		it("missing entries, unaware", (): void => {
			var d = new DateTime(2014, 1, 2);
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(0);
			expect(d.zone()).to.be.null;
		});
		it("full entries, aware", (): void => {
			var d = new DateTime(2014, 1, 2, 3, 4, 5, 6, TimeZone.zone(90));
			expect(d.year()).to.equal(2014);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(3);
			expect(d.minute()).to.equal(4);
			expect(d.second()).to.equal(5);
			expect(d.millisecond()).to.equal(6);
			expect(d.zone()).to.equal(TimeZone.zone(90));
		});
		it("should normalize around DST", (): void => {
			var d = new DateTime(2014, 3, 30, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // non-existing due to DST forward
			expect(d.hour()).to.equal(3); // should be normalized to 3AM
		});
		it("should throw on wrong input", (): void => {
			/* tslint:disable:no-unused-expression */
			assert.throws(function (): void { new DateTime(2014, 0, 1); }, "doesn't throw on invalid month");
			assert.throws(function (): void { new DateTime(2014, 13, 1); }, "doesn't throw on invalid month");
			assert.throws(function (): void { new DateTime(2014, 1, 0); }, "doesn't throw on invalid day");
			assert.throws(function (): void { new DateTime(2014, 1, 32); }, "doesn't throw on invalid day");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 24); }, "doesn't throw on invalid hour");
			assert.throws(function (): void { new DateTime(2014, 1, 30, -1); }, "doesn't throw on invalid hour");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 1, 60); }, "doesn't throw on invalid minute");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 1, -1); }, "doesn't throw on invalid minute");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 1, 1, 60); }, "doesn't throw on invalid second");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 1, 1, -1); }, "doesn't throw on invalid second");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 1, 1, 1, -1); }, "doesn't throw on invalid millisecond");
			assert.throws(function (): void { new DateTime(2014, 1, 30, 1, 1, 1, 1000); }, "doesn't throw on invalid millisecond");
			/* tslint:enable:no-unused-expression */
		});
	});

	describe("constructor(utcUnixTime: number, timeZone?: TimeZone)", (): void => {
		it("unaware", (): void => {
			var d = new DateTime(1);
			expect(d.year()).to.equal(1970);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(1);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(1);
			expect(d.zone()).to.be.null;
		});
		it("UTC", (): void => {
			var d = new DateTime(1, TimeZone.utc());
			expect(d.year()).to.equal(1970);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(1);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(1);
			expect(d.zone()).to.equal(TimeZone.utc());
		});
		it("non-utc", (): void => {
			var d = new DateTime(1, TimeZone.zone(240));
			expect(d.year()).to.equal(1970);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(1);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(1);
			expect(d.zone()).to.equal(TimeZone.zone(240));
		});
	});

	describe("clone", (): void => {
		it("should return an object with the same value", (): void => {
			var d: DateTime = new DateTime(2015, 2, 3, 4, 5, 6, 7, TimeZone.zone("+03"));
			expect(d.clone().unixUtcMillis()).to.equal(d.unixUtcMillis());
		});
		it("should return a new object", (): void => {
			var d: DateTime = new DateTime(2015, 2, 3, 4, 5, 6, 7, TimeZone.zone("+03"));
			expect(d.clone() === d).to.equal(false);
		});
	});

	describe("convert()", (): void => {
		it("unaware to aware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			assert.throws(function (): void { d.convert(TimeZone.zone("Europe/Amsterdam")); });
		});
		it("unaware to unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			d.convert(null);
			expect(d.equals(new DateTime(2014, 1, 1, 0, 0, 0, 0))).to.be.true;
		});
		it("aware", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
			d.convert(TimeZone.zone("-01:00"));
			expect(d.hour()).to.equal(10);
		});
		it("aware to unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
			d.convert(null);
			expect(d.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0))).to.be.true;
		});
	});

	describe("toZone()", (): void => {
		it("unaware to aware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			assert.throws(function (): void { d.toZone(TimeZone.zone("Europe/Amsterdam")); });
		});
		it("unaware to unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			expect(d.equals(d.toZone(null))).to.be.true;
		});
		it("aware", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
			var e = d.toZone(TimeZone.zone("-01:00"));
			expect(d.hour()).to.equal(12);
			expect(e.hour()).to.equal(10);
		});
		it("aware to unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
			var e = d.toZone(null);
			expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0))).to.be.true;
		});
		it("Europe/Amsterdam DST forward to UTC", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T00:59:59.000 UTC");
			d = new DateTime(2014, 3, 30, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:00:00.000 UTC");
			d = new DateTime(2014, 3, 30, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // non-existing date
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:00:00.000 UTC");
		});
		it("Europe/Amsterdam DST backward to UTC", (): void => {
			var d = new DateTime(2014, 10, 26, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-10-25T23:59:59.000 UTC");
			d = new DateTime(2014, 10, 26, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
			d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam")); // could mean either of two dates
			expect(d.toZone(TimeZone.utc()).toString()).to.satisfy((s: string): boolean => {
				return (s === "2014-10-26T00:59:59.000 UTC" || s === "2014-10-26T01:59:59.000	 UTC");
			});
		});
		it("Europe/Amsterdam DST forward from UTC", (): void => {
			var d = new DateTime("2014-03-30T00:59:59.000 UTC");
			expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-03-30T01:59:59.000 Europe/Amsterdam");
			d = new DateTime("2014-03-30T01:00:00.000 UTC");
			expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
		});
		it("Europe/Amsterdam DST backward from UTC", (): void => {
			var d = new DateTime("2014-10-25T23:59:59.000 UTC");
			expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T01:59:59.000 Europe/Amsterdam");
			d = new DateTime("2014-10-26T02:00:00.000 UTC");
			expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T03:00:00.000 Europe/Amsterdam");
			d = new DateTime("2014-10-26T00:59:59.000 UTC");
			expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T02:59:59.000 Europe/Amsterdam");
			d = new DateTime("2014-10-26T01:59:59.000 UTC");
			expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T02:59:59.000 Europe/Amsterdam");
		});
		it("maintains UTC through conversions", (): void => {
			// expect UTC to be maintained through conversions in the presence of DST switch
			var d: DateTime = (new DateTime(2014, 10, 26, 0, 0, 0, 0, TimeZone.utc())).toZone(
				TimeZone.zone("Europe/Amsterdam")).toZone(TimeZone.utc());
			expect(d.toString()).to.equal("2014-10-26T00:00:00.000 UTC");
			d = (new DateTime(2014, 10, 26, 1, 0, 0, 0, TimeZone.utc())).toZone(TimeZone.zone("Europe/Amsterdam")).toZone(TimeZone.utc());
			expect(d.toString()).to.equal("2014-10-26T01:00:00.000 UTC");
			d = (new DateTime(2014, 10, 26, 2, 0, 0, 0, TimeZone.utc())).toZone(TimeZone.zone("Europe/Amsterdam")).toZone(TimeZone.utc());
			expect(d.toString()).to.equal("2014-10-26T02:00:00.000 UTC");
		});

	});

	describe("toDate()", (): void => {
		it("unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			var date = d.toDate();
			expect(date.getFullYear()).to.equal(2014);
			expect(date.getMonth()).to.equal(0);
			expect(date.getDate()).to.equal(1);
			expect(date.getHours()).to.equal(0);
			expect(date.getMinutes()).to.equal(0);
			expect(date.getSeconds()).to.equal(0);
			expect(date.getMilliseconds()).to.equal(0);
		});
		it("aware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("+01:00"));
			var date = d.toDate();
			expect(date.getFullYear()).to.equal(2014);
			expect(date.getMonth()).to.equal(0);
			expect(date.getDate()).to.equal(1);
			expect(date.getHours()).to.equal(0);
			expect(date.getMinutes()).to.equal(0);
			expect(date.getSeconds()).to.equal(0);
			expect(date.getMilliseconds()).to.equal(0);
		});
	});

	describe("add(duration)", (): void => {
		it("should add zero", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			var e = d.add(Duration.hours(0));
			expect(d.toString()).to.equal(e.toString());
		});
		it("should add positive value", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			var e = d.add(Duration.hours(1));
			expect(d.hour()).to.equal(0);
			expect(e.hour()).to.equal(1);
		});
		it("should add negative value", (): void => {
			var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
			var e = d.add(Duration.hours(-1));
			expect(d.hour()).to.equal(1);
			expect(e.hour()).to.equal(0);
		});
		it("should account for DST forward", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(Duration.hours(1));
			expect(e.toString()).to.equal("2014-03-30T03:59:59.000 Europe/Amsterdam");
		});
		it("should account for DST backward", (): void => {
			// the conversion to UTC for this date is not well-defined, could mean either 
			// the first 02:59:59 or the second one of that day
			var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(Duration.hours(1));
			expect(e.toString()).to.satisfy((s: string): boolean => {
				return (s === "2014-10-26T02:59:59.000 Europe/Amsterdam" || s === "2014-10-26T03:59:59.000 Europe/Amsterdam");
			});
		});
	});

	describe("add(amount, unit)", (): void => {
		it("should add seconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23, TimeUnit.Second);
			expect(e.toString()).to.equal("2014-01-01T00:00:23.000 Europe/Amsterdam");
		});
		it("should add more than 60 seconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(61, TimeUnit.Second);
			expect(e.toString()).to.equal("2014-01-01T00:01:01.000 Europe/Amsterdam");
		});
		it("should add minutes", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23, TimeUnit.Minute);
			expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
		});
		it("should add more than 60 minutes", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(61, TimeUnit.Minute);
			expect(e.toString()).to.equal("2014-01-01T01:01:00.000 Europe/Amsterdam");
		});
		it("should add hours", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-01-01T23:00:00.000 Europe/Amsterdam");
		});
		it("should add more than 24 hours", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(25, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
		});
		it("should add days", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-01-24T00:00:00.000 Europe/Amsterdam");
		});
		it("should add more than 30 days", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(31, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-02-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add weeks", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(2, TimeUnit.Week);
			expect(e.toString()).to.equal("2014-01-15T00:00:00.000 Europe/Amsterdam");
		});
		it("should add months", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(2, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-03-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add months across year boundary", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(12, TimeUnit.Month);
			expect(e.toString()).to.equal("2015-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add years", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(2, TimeUnit.Year);
			expect(e.toString()).to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add negative numbers", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(-2, TimeUnit.Day);
			expect(e.toString()).to.equal("2013-12-30T00:00:00.000 Europe/Amsterdam");
		});
		it("should add to unaware", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, null);
			var e = d.add(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T02:59:59.000");
		});
		it("should add to UTC", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.utc());
			var e = d.add(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T02:59:59.000 UTC");
		});
		it("should account for DST forward", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T03:59:59.000 Europe/Amsterdam");
		});
		it("should account for DST backward", (): void => {
			// this could mean either of two UTC times
			var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Hour);
			expect(e.toString()).to.satisfy((s: string): boolean => {
				return (s === "2014-10-26T02:59:59.000 Europe/Amsterdam" || s === "2014-10-26T03:59:59.000 Europe/Amsterdam");
			});
		});
		it("should keep incrementing UTC even if local time does not increase", (): void => {
			// check that UTC moves forward even though local date is not deterministic
			var d = (new DateTime(2014, 10, 26, 0, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
			expect(d.add(1, TimeUnit.Hour).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T01:00:00.000 UTC");

			d = (new DateTime(2014, 10, 26, 1, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
			expect(d.add(1, TimeUnit.Hour).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("should shift local time when adding days across DST fw", (): void => {
			var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-03-30T09:00:00.000 Europe/Amsterdam");
		});
		it("should shift local time when adding days across DST bw", (): void => {
			var d = new DateTime(2014, 10, 25, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-10-26T07:00:00.000 Europe/Amsterdam");
		});
		it("should shift local time when adding negative days across DST fw", (): void => {
			var d = new DateTime(2014, 3, 30, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(-1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-03-29T07:00:00.000 Europe/Amsterdam");
		});
		it("should shift local time when adding negative days across DST bw", (): void => {
			var d = new DateTime(2014, 10, 26, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(-1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-10-25T09:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time when adding year across 2 DSTs", (): void => {
			var d = new DateTime(2014, 1, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Year);
			expect(e.toString()).to.equal("2015-01-29T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time when adding negative year across 2 DSTs", (): void => {
			var d = new DateTime(2014, 1, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(-1, TimeUnit.Year);
			expect(e.toString()).to.equal("2013-01-29T08:00:00.000 Europe/Amsterdam");
		});
		it("should shift local time when adding year across 1 DSTs", (): void => {
			var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Year); // note in 2015 DST shift is on march 29 iso march 30
			expect(e.toString()).to.equal("2015-03-29T09:00:00.000 Europe/Amsterdam");
		});
		it("should shift local time when adding month across 1 DST", (): void => {
			var d = new DateTime(2014, 3, 3, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-04-03T09:00:00.000 Europe/Amsterdam");
			d = new DateTime(2014, 9, 26, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			e = d.add(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-10-26T02:00:00.000 Europe/Amsterdam");
		});
		it("should shift remote zone time when adding month across 1 DST", (): void => {
			var d = new DateTime(2014, 3, 3, 8, 0, 0, 0, TimeZone.zone("Asia/Gaza"));
			var e = d.add(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-04-03T09:00:00.000 Asia/Gaza");
		});
		it("should not shift remote zone time when adding month across 1 local DST ", (): void => {
			// this is already in summer time Gaza but winter time Europe/Amsterdam
			var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Asia/Gaza"));
			var e = d.add(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-04-29T08:00:00.000 Asia/Gaza");
		});
	});

	describe("addLocal(amount, unit)", (): void => {
		it("should add seconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(23, TimeUnit.Second);
			expect(e.toString()).to.equal("2014-01-01T00:00:23.000 Europe/Amsterdam");
		});
		it("should add more than 60 seconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(61, TimeUnit.Second);
			expect(e.toString()).to.equal("2014-01-01T00:01:01.000 Europe/Amsterdam");
		});
		it("should add minutes", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(23, TimeUnit.Minute);
			expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
		});
		it("should add more than 60 minutes", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(61, TimeUnit.Minute);
			expect(e.toString()).to.equal("2014-01-01T01:01:00.000 Europe/Amsterdam");
		});
		it("should add hours", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(23, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-01-01T23:00:00.000 Europe/Amsterdam");
		});
		it("should add more than 24 hours", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(25, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
		});
		it("should add days", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(23, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-01-24T00:00:00.000 Europe/Amsterdam");
		});
		it("should add more than 30 days", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(31, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-02-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add weeks", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(2, TimeUnit.Week);
			expect(e.toString()).to.equal("2014-01-15T00:00:00.000 Europe/Amsterdam");
		});
		it("should add months", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(2, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-03-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add months across year boundary", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(12, TimeUnit.Month);
			expect(e.toString()).to.equal("2015-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add years", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(2, TimeUnit.Year);
			expect(e.toString()).to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should add negative numbers", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(-2, TimeUnit.Day);
			expect(e.toString()).to.equal("2013-12-30T00:00:00.000 Europe/Amsterdam");
		});
		it("should add to unaware", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, null);
			var e = d.addLocal(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T02:59:59.000");
		});
		it("should add to UTC", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.utc());
			var e = d.addLocal(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T02:59:59.000 UTC");
		});
		it("should account for DST forward", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T03:59:59.000 Europe/Amsterdam");
			d = new DateTime(2014, 3, 30, 3, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			// it should skip over 02:59 since that does not exist
			d = new DateTime(2014, 3, 30, 3, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			e = d.addLocal(-1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-03-30T01:59:59.000 Europe/Amsterdam");
		});
		it("should account for DST backward", (): void => {
			// this could mean either of two UTC times
			var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			// but addLocal should increment the local hour field regardless
			var e = d.addLocal(1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-10-26T03:59:59.000 Europe/Amsterdam");
			// similar with subtraction: local hour field should decrease
			e = d.addLocal(-1, TimeUnit.Hour);
			expect(e.toString()).to.equal("2014-10-26T01:59:59.000 Europe/Amsterdam");
		});
		it("should keep local time same when adding days across DST fw", (): void => {
			var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-03-30T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time same when adding days across DST bw", (): void => {
			var d = new DateTime(2014, 10, 25, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-10-26T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time same when adding negative days across DST fw", (): void => {
			var d = new DateTime(2014, 3, 30, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(-1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-03-29T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time same when adding negative days across DST bw", (): void => {
			var d = new DateTime(2014, 10, 26, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(-1, TimeUnit.Day);
			expect(e.toString()).to.equal("2014-10-25T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time same when adding year across 2 DSTs", (): void => {
			var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Year);
			expect(e.toString()).to.equal("2015-03-29T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time same when adding negative year across 2 DSTs", (): void => {
			var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(-1, TimeUnit.Year);
			expect(e.toString()).to.equal("2013-03-29T08:00:00.000 Europe/Amsterdam");
		});
		it("should keep local time when adding month across 1 DST", (): void => {
			var d = new DateTime(2014, 3, 3, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-04-03T08:00:00.000 Europe/Amsterdam");
		});
	});

	describe("sub(Duration)", (): void => {
		it("should subtract zero", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			var e = d.sub(Duration.hours(0));
			expect(d.toString()).to.equal(e.toString());
		});
		it("should sub positive value", (): void => {
			var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
			var e = d.sub(Duration.hours(1));
			expect(d.hour()).to.equal(1);
			expect(e.hour()).to.equal(0);
		});
		it("should sub negative value", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			var e = d.sub(Duration.hours(-1));
			expect(d.hour()).to.equal(0);
			expect(e.hour()).to.equal(1);
		});
		it("should sub value in presence of time zone", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone(3));
			var e = d.sub(Duration.hours(1));
			expect(d.hour()).to.equal(0);
			expect(e.hour()).to.equal(23);
			expect(e.day()).to.equal(31);
		});
	});

	describe("sub(amount, unit)", (): void => {
		// not thoroughly tested since implementation is routed to add(-amount, unit)
		it("should account for DST forward", (): void => {
			var d = new DateTime(2014, 3, 30, 3, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:59:59.000 UTC");
			var e = d.sub(1, TimeUnit.Hour);
			expect(e.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T00:59:59.000 UTC");
			expect(e.toString()).to.equal("2014-03-30T01:59:59.000 Europe/Amsterdam");
		});
		it("should account for DST backward", (): void => {
			var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.sub(1, TimeUnit.Hour);
			expect(e.toString()).to.satisfy((s: string): boolean => {
				return (s === "2014-10-26T02:59:59.000 Europe/Amsterdam" || s === "2014-10-26T01:59:59.000 Europe/Amsterdam");
			});
		});
		it("should keep decrementing UTC even if local time does not decrease", (): void => {
			// check that UTC moves forward even though local date is not deterministic
			var d = (new DateTime(2014, 10, 26, 1, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
			expect(d.sub(1, TimeUnit.Hour).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T00:00:00.000 UTC");

			d = (new DateTime(2014, 10, 26, 2, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
			expect(d.sub(1, TimeUnit.Hour).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
		});
	});

	describe("diff()", (): void => {
		it("should diff identical dates zero", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			var diff = d.diff(d);
			expect(diff.milliseconds()).to.equal(0);
		});
		it("should diff positive value", (): void => {
			var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
			var diff = d.diff(new DateTime(2014, 1, 1, 2, 0, 0, 0));
			expect(diff.milliseconds()).to.equal(Duration.hours(-1).milliseconds());
		});
		it("should diff negative value", (): void => {
			var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
			var diff = d.diff(new DateTime(2014, 1, 1, 0, 0, 0, 0));
			expect(diff.milliseconds()).to.equal(Duration.hours(1).milliseconds());
		});
		it("should diff across time zones", (): void => {
			var d = new DateTime(2014, 1, 1, 1, 0, 0, 0, new TimeZone("+0100"));
			var e = new DateTime(2014, 1, 1, 1, 0, 0, 0, new TimeZone("-0100"));
			var diff = d.diff(e);
			expect(diff.milliseconds()).to.equal(Duration.hours(-2).milliseconds());
		});
	});

	describe("lessThan()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessThan(new DateTime("2014-02-02T02:02:02.003"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:03.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+00"))).to.be.true;
		});
		it("should return false for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessThan(new DateTime("2014-02-02T02:02:02.002"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
		});
		it("should return false for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").lessThan(new DateTime("2014-02-02T02:02:02.002"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:03.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+00").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
		});
	});

	describe("lessEqual()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessEqual(new DateTime("2014-02-02T02:02:02.003"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:03.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+00"))).to.be.true;
		});
		it("should return true for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessEqual(new DateTime("2014-02-02T02:02:02.002"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
		});
		it("should return false for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").lessEqual(new DateTime("2014-02-02T02:02:02.002"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:03.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+00").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
		});
	});

	describe("equals()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").equals(new DateTime("2014-02-02T02:02:02.003"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:03.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:02.002+00"))).to.be.false;
		});
		it("should return true for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").equals(new DateTime("2014-02-02T02:02:02.002"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
		});
		it("should return false for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").equals(new DateTime("2014-02-02T02:02:02.002"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:03.002+01").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+00").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
		});
	});

	describe("identical()", (): void => {
		it("should return false if time zone differs", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").identical(new DateTime("2014-02-02T02:02:02.002+01:00"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+02:00").identical(new DateTime("2014-02-02T03:02:02.002+01:00"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").identical(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
		});
		it("should return true for an identical other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").identical(new DateTime("2014-02-02T02:02:02.002"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").identical(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
		});
		it("should return true if time zones are not identical but equal", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002+00:00").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.be.true;
		});
	});

	describe("greaterThan()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterThan(new DateTime("2014-02-02T02:02:02.003"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:03.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+00"))).to.be.false;
		});
		it("should return false for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterThan(new DateTime("2014-02-02T02:02:02.002"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.false;
		});
		it("should return true for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").greaterThan(new DateTime("2014-02-02T02:02:02.002"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:03.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+00").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
		});
	});

	describe("greaterEqual()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterEqual(new DateTime("2014-02-02T02:02:02.003"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:03.002+01"))).to.be.false;
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+00"))).to.be.false;
		});
		it("should return true for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterEqual(new DateTime("2014-02-02T02:02:02.002"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
		});
		it("should return true for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").greaterEqual(new DateTime("2014-02-02T02:02:02.002"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:03.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
			expect(new DateTime("2014-02-02T02:02:02.002+00").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.be.true;
		});
	});
	
	describe("toIsoString()", (): void => {
		it("should work for unaware date", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008")).toIsoString()).to.equal("2014-02-03T05:06:07.008");
		});
		it("should work for proper timezone", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008 Europe/Amsterdam")).toIsoString()).to.equal("2014-02-03T05:06:07.008+01:00");
		});
		it("should work for offset timezone", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008+02:00")).toIsoString()).to.equal("2014-02-03T05:06:07.008+02:00");
		});
		it("should work for local timezone", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008 localtime")).toIsoString()).to.equal(
				"2014-02-03T05:06:07.008" + TimeZone.offsetToString(TimeZone.local().offsetForZone(2014,2,3,5,6,7,8)));
		});
	});

	describe("toUtcString()", (): void => {
		it("should work for unaware date", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008")).toUtcString()).to.equal("2014-02-03T05:06:07.008");
		});
		it("should work for offset zone", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008+01")).toUtcString()).to.equal("2014-02-03T04:06:07.008");
		});
		it("should work for proper zone", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008 Europe/Amsterdam")).toUtcString()).to.equal("2014-02-03T04:06:07.008");
		});
	});

	describe("inspect()", (): void => {
		it("should work", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008")).inspect()).to.equal(
				"[DateTime: " + (new DateTime("2014-02-03T05:06:07.008")).toString() + "]");
		});
	});
	
	describe("weekDay()", (): void => {
		it("should return a local week day", (): void => {
			expect(new DateTime("2014-07-07T00:00:00.00 Europe/Amsterdam").weekDay()).to.equal(WeekDay.Monday);
		});
	});

	describe("utcWeekDay()", (): void => {
		it("should return a UTC week day", (): void => {
			expect(new DateTime("2014-07-07T00:00:00.00 Europe/Amsterdam").utcWeekDay()).to.equal(WeekDay.Sunday);
		});
	});

});


describe("Period", (): void => {

	describe("start()", (): void => {
		expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
			.start().toString())
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

	describe("next(<=start)", (): void => {
		it("should return start date in fromDate zone", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2013-01-01T12:00:00.00+02")).toString())
				.to.equal("2014-01-01T14:00:00.000+02:00");
		});
		it("should work for 400-year leap year", (): void => {
			expect((new Period(new DateTime("2000-02-29T12:00:00.000 UTC"), 1, TimeUnit.Year, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("1999-12-31T12:00:00 UTC")).toString())
				.to.equal("2000-02-29T12:00:00.000 UTC");
		});
		it("should NOT return start date for the start date itself", (): void => {
			expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, TimeUnit.Month, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-01-01T14:00:00.00+02")).toString())
				.to.equal("2014-03-01T14:00:00.000+02:00");
		});
	});

	describe("Period(X, 1, X, RegularInterval).findFirst()", (): void => {
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
				.to.equal("2014-10-26T01:05:06.007 UTC"); // note 1AM because start time is 11AM UTC
			// check it returns OK in local time (which stays from 2AM at 2AM)
			expect((new Period(new DateTime("1970-01-01T01:00:00.000 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularIntervals))
				.findFirst(new DateTime("2014-10-25T23:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString())
				.to.equal("2014-10-26T02:00:00.000 Europe/Amsterdam");
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
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam")).toString())
				.to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
		});
		it("Should handle count 1", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
		});
		it("Should handle count >1", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString())
				.to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
		});
		it("Should return same zone as parameter", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 UTC"), 10).toString()).to.equal("2014-02-01T11:00:00.000 UTC");
		});
		it("Should not handle DST", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
		});
		it("Should throw on null datetime", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			assert.throws(function (): void {
				p.findNext(null);
			});
		});
		it("Should throw on <1 count", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			assert.throws(function (): void {
				p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 0);
			});
			assert.throws(function (): void {
				p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), -1);
			});
		});
		it("Should throw on non-integer count", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			assert.throws(function (): void {
				p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1.1);
			});
		});
		it("Should handle end-of-month for 28 < day < 31", (): void => {
			var p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularIntervals);
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString())
				.to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
		});
		it("Should handle end-of-month for day == 31", (): void => {
			var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularIntervals);
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
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
		});
		it("Should handle count >1", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString())
				.to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
		});
		it("Should handle end-of-month for 28 < day < 31", (): void => {
			var p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime);
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString())
				.to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString())
				.to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
			expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString())
				.to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
		});
		it("Should handle end-of-month for day == 31", (): void => {
			var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Month, PeriodDst.RegularLocalTime);
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
	
	describe("toString()", (): void => {
		it("should work with naive date", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000");			
		});
		it("should work with PeriodDst.RegularLocalTime", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular local time");			
		});
		it("should work with PeriodDst.RegularIntervals", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");			
		});
		it("should work with multiple hours", (): void => {
			var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 2, TimeUnit.Hour, PeriodDst.RegularIntervals);
			expect(p.toString()).to.equal("2 hours, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");			
		});
	});

	describe("toIsoString()", (): void => {
		it("should work", (): void => {
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
			var p = new Period(new DateTime("2014-01-01T00:00:00"), 1, TimeUnit.Hour, PeriodDst.RegularLocalTime);
			expect(p.inspect()).to.equal("[Period: " + p.toString() + "]");			
		});
	});

});
