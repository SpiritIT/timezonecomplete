/// <reference path="../typings/test.d.ts" />

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;

import basics = require("../lib/basics");
import datetimeFuncs = require("../lib/index");

import DateFunctions = datetimeFuncs.DateFunctions;
import DateTime = datetimeFuncs.DateTime;
import Duration = datetimeFuncs.Duration;
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

describe("datetime loose", (): void => {
	// ensure time faked
	beforeEach(function (): void {
		testTimeSource.currentTime = new Date("2014-01-03T04:05:06.007Z");
		DateTime.timeSource = testTimeSource;
	});

	describe("nowLocal()", (): void => {
		it("should return something with a local time zone", (): void => {
			expect(datetimeFuncs.nowLocal().offset()).to.equal(-1 * testTimeSource.now().getTimezoneOffset());
		});
		it("should return the local time", (): void => {
			expect(datetimeFuncs.nowLocal().year()).to.equal(testTimeSource.currentTime.getFullYear());
			expect(datetimeFuncs.nowLocal().month()).to.equal(testTimeSource.currentTime.getMonth() + 1); // javascript starts from 0
			expect(datetimeFuncs.nowLocal().day()).to.equal(testTimeSource.currentTime.getDate());
			expect(datetimeFuncs.nowLocal().hour()).to.equal(testTimeSource.currentTime.getHours());
			expect(datetimeFuncs.nowLocal().minute()).to.equal(testTimeSource.currentTime.getMinutes());
			expect(datetimeFuncs.nowLocal().second()).to.equal(testTimeSource.currentTime.getSeconds());
			expect(datetimeFuncs.nowLocal().millisecond()).to.equal(testTimeSource.currentTime.getMilliseconds());
		});
	});

	describe("nowUtc()", (): void => {
		it("should return something with a local time zone", (): void => {
			expect(datetimeFuncs.nowUtc().zone()).to.equal(TimeZone.utc());
		});
		it("should return the local time", (): void => {
			expect(datetimeFuncs.nowUtc().year()).to.equal(testTimeSource.currentTime.getUTCFullYear());
			expect(datetimeFuncs.nowUtc().month()).to.equal(testTimeSource.currentTime.getUTCMonth() + 1); // javascript starts from 0
			expect(datetimeFuncs.nowUtc().day()).to.equal(testTimeSource.currentTime.getUTCDate());
			expect(datetimeFuncs.nowUtc().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
			expect(datetimeFuncs.nowUtc().minute()).to.equal(testTimeSource.currentTime.getUTCMinutes());
			expect(datetimeFuncs.nowUtc().second()).to.equal(testTimeSource.currentTime.getUTCSeconds());
			expect(datetimeFuncs.nowUtc().millisecond()).to.equal(testTimeSource.currentTime.getUTCMilliseconds());
		});
	});

	describe("now", (): void => {
		it("should return something with the given zone", (): void => {
			expect(datetimeFuncs.now(TimeZone.zone("+03:00")).zone()).to.equal(TimeZone.zone("+03:00"));
		});
		it("should return the zone time", (): void => {
			expect(datetimeFuncs.now(TimeZone.zone("+03:00")).hour()).to.equal(testTimeSource.currentTime.getUTCHours() + 3);
		});
		it("should default to UTC", (): void => {
			expect(datetimeFuncs.now().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
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
		it("should default to UTC", (): void => {
			expect(DateTime.now().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
		});
	});

	describe("fromExcel()", (): void => {
		it("should perform correct conversion", (): void => {
			expect(DateTime.fromExcel(42005.5430555556).toString()).to.equal("2015-01-01T13:02:00.000");
		});
		it("should add timezone if given", (): void => {
			expect(DateTime.fromExcel(42005.5430555556, TimeZone.zone("+03:00")).toString()).to.equal("2015-01-01T13:02:00.000+03:00");
		});
	});

	describe("toExcel()", (): void => {
		var oneMsec = (1 / 86400000);
		it("should perform correct conversion", (): void => {
			expect((new DateTime("2015-01-01T13:02:00.000")).toExcel()).to.be.within(42005.5430555556 - oneMsec, 42005.5430555556 + oneMsec);
		});
		it("should add timezone if given", (): void => {
			expect((new DateTime("2015-01-01T13:02:00.000 UTC")).toExcel(TimeZone.zone("+01:00")))
				.to.be.within(42005.5430555556 + 1 / 24 - oneMsec, 42005.5430555556 + 1 / 24 + oneMsec);
		});
		it("should add timezone if given", (): void => {
			expect((new DateTime("2015-01-01T13:02:00.000 UTC")).toExcel(TimeZone.zone("+01:00")))
				.to.be.within(42005.5430555556 + 1 / 24 - oneMsec, 42005.5430555556 + 1 / 24 + oneMsec);
		});
	});

	describe("toUtcExcel()", (): void => {
		var oneMsec = (1 / 86400000);
		it("should perform correct conversion", (): void => {
			expect((new DateTime("2015-01-01T13:02:00.000")).toUtcExcel()).to.be.within(42005.5430555556 - oneMsec, 42005.5430555556 + oneMsec);
		});
		it("should use the UTC value", (): void => {
			expect((new DateTime("2015-01-01T13:02:00.000+01:00")).toUtcExcel()).
				to.be.within(42005.5430555556 - 1 / 24 - oneMsec, 42005.5430555556 - 1 / 24 + oneMsec);
		});
	});

	describe("exists", (): void => {
		it("should handle leap years", (): void => {
			expect(DateTime.exists(2012, 2, 29)).to.equal(true);
			expect(DateTime.exists(2013, 2, 29)).to.equal(false);
		});
		it("should handle # days in month", (): void => {
			expect(DateTime.exists(2012, 4, 30)).to.equal(true);
			expect(DateTime.exists(2012, 4, 31)).to.equal(false);
		});
		it("should handle DST changes", (): void => {
			expect(DateTime.exists(2015, 3, 29, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"))).to.equal(false);
			expect(DateTime.exists(2015, 3, 29, 1, 59, 59, 999, TimeZone.zone("Europe/Amsterdam"))).to.equal(true);
			expect(DateTime.exists(2015, 3, 29, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"))).to.equal(true);
		});
		it("should handle pre-1970 dates", (): void => {
			expect(DateTime.exists(1969, 12, 31, 23, 59, 59, 999, null, false)).to.equal(false);
			expect(DateTime.exists(1969, 12, 31, 23, 59, 59, 999, null, true)).to.equal(true);
			expect(DateTime.exists(1969, 12, 31, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam"), false)).to.equal(false);
			expect(DateTime.exists(1969, 12, 31, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam"), true)).to.equal(true);
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
		it("should round the milliseconds", (): void => {
			var d = new DateTime("2014-05-06T07:08:09.0105");
			expect(d.millisecond()).to.equal(11);
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
		it("should take care of whitespace", (): void => {
			var d = new DateTime(" \n\t2014-05-06T07:08:09.010 Europe/Amsterdam \n\t");
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

	describe("constructor(string, string, zone?)", (): void => {
		it("should parse ISO date", (): void => {
			var d = new DateTime("2015-03-02T23:44:12.233", "yyyy-MM-ddTHH:mm:ss.SSS");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone()).to.be.null;
		});
		it("should parse unaware NL date", (): void => {
			var d = new DateTime("02-03-2015 23:44:12.233", "dd-MM-yyyy HH:mm:ss.SSS");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone()).to.be.null;
		});
		it("should parse unaware NL date without leading zeroes", (): void => {
			var d = new DateTime("2-3-2015 23:44:12.233", "dd-MM-yyyy HH:mm:ss.SSS");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone()).to.be.null;
		});
		it("should parse unaware US date", (): void => {
			var d = new DateTime("3/2/2015 23:44:12.233", "MM/dd/yyyy HH:mm:ss.SSS");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone()).to.be.null;
		});
		it("should add given zone", (): void => {
			var d = new DateTime("3/2/2015 23:44:12.233", "MM/dd/yyyy HH:mm:ss.SSS", TimeZone.utc());
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone().identical(TimeZone.utc())).to.equal(true);
		});
		it("should parse date with offset", (): void => {
			var d = new DateTime("3/2/2015 23:44:12.233+02:30", "MM/dd/yyyy HH:mm:ss.SSSzzzz");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone().identical(TimeZone.zone("+02:30"))).to.equal(true);
		});
		it("should parse date with zone name", (): void => {
			var d = new DateTime("3/2/2015 23:44:12.233 America/Chicago", "MM/dd/yyyy HH:mm:ss.SSS zzzz");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(44);
			expect(d.second()).to.equal(12);
			expect(d.millisecond()).to.equal(233);
			expect(d.zone().identical(TimeZone.zone("America/Chicago"))).to.equal(true);
		});
		it("should parse date with zeroes", (): void => {
			var d = new DateTime("3/2/2015 06:00:00.000 America/Chicago", "MM/dd/yyyy HH:mm:ss.SSS zzzz");
			expect(d.year()).to.equal(2015);
			expect(d.month()).to.equal(3);
			expect(d.day()).to.equal(2);
			expect(d.hour()).to.equal(6);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(0);
			expect(d.zone().identical(TimeZone.zone("America/Chicago"))).to.equal(true);
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
		it("should round the numbers", (): void => {
			var d = new DateTime(2014.1, 1.1, 2.1, 3.1, 4.1, 5.1, 6.1);
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
		it("should round to millisecs", (): void => {
			var d = new DateTime(1.1);
			expect(d.year()).to.equal(1970);
			expect(d.month()).to.equal(1);
			expect(d.day()).to.equal(1);
			expect(d.hour()).to.equal(0);
			expect(d.minute()).to.equal(0);
			expect(d.second()).to.equal(0);
			expect(d.millisecond()).to.equal(1);
			expect(d.zone()).to.be.null;
		});
		it("should round to millisecs, negative", (): void => {
			var d = new DateTime(-1.5);
			expect(d.year()).to.equal(1969);
			expect(d.month()).to.equal(12);
			expect(d.day()).to.equal(31);
			expect(d.hour()).to.equal(23);
			expect(d.minute()).to.equal(59);
			expect(d.second()).to.equal(59);
			expect(d.millisecond()).to.equal(998);
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
		it("non-existing", (): void => {
			// non-existing due to DST forward
			var d = new DateTime(basics.timeToUnixNoLeapSecs(2014, 3, 30, 2, 0, 0, 0), TimeZone.zone("Europe/Amsterdam"));
			expect(d.hour()).to.equal(3); // should be normalized to 3AM
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

	describe("withZone()", (): void => {
		it("should allow changing naive date to aware date", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, null);
			var e = d.withZone(TimeZone.zone(1));
			expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone(1)))).to.equal(true);
		});
		it("should allow changing aware date to naive date", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone(1));
			var e = d.withZone(null);
			expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0, null))).to.equal(true);
		});
		it("should allow changing aware date to aware date", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone(1));
			var e = d.withZone(TimeZone.zone("America/Chicago"));
			expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("America/Chicago")))).to.equal(true);
		});
		it("should return a new object", (): void => {
			var d: DateTime = new DateTime(2015, 2, 3, 4, 5, 6, 7, TimeZone.zone("+03"));
			expect(d.withZone(d.zone()) === d).to.equal(false);
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
			expect(d.equals(new DateTime(2014, 1, 1, 0, 0, 0, 0))).to.equal(true);
		});
		it("aware", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
			d.convert(TimeZone.zone("-01:00"));
			expect(d.hour()).to.equal(10);
		});
		it("aware to unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
			d.convert(null);
			expect(d.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0))).to.equal(true);
		});
	});

	describe("toZone()", (): void => {
		it("unaware to aware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			assert.throws(function (): void { d.toZone(TimeZone.zone("Europe/Amsterdam")); });
		});
		it("unaware to unaware", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
			expect(d.equals(d.toZone(null))).to.equal(true);
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
			expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0))).to.equal(true);
		});
		it("Europe/Amsterdam DST forward to UTC", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T00:59:59.000 UTC");
			d = new DateTime(2014, 3, 30, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:00:00.000 UTC");
		});
		it("Europe/Amsterdam DST forward to UTC (nonexisting)", (): void => {
			var d = new DateTime(2014, 3, 30, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // non-existing date
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

	// todo check normalization
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
		it("should account for DST forward (2)", (): void => {
			var d = new DateTime(2014, 3, 30, 1, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(Duration.hours(1));
			expect(e.toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
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
		it("should add 0", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.add(0, TimeUnit.Millisecond).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Second).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Minute).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Hour).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Day).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Week).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Month).toString()).to.equal(d.toString());
			expect(d.add(0, TimeUnit.Year).toString()).to.equal(d.toString());
		});
		it("should add milliseconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23, TimeUnit.Millisecond);
			expect(e.toString()).to.equal("2014-01-01T00:00:00.023 Europe/Amsterdam");
		});
		it("should add more than 1000 milliseconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(1001, TimeUnit.Millisecond);
			expect(e.toString()).to.equal("2014-01-01T00:00:01.001 Europe/Amsterdam");
		});
		it("should add seconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23, TimeUnit.Second);
			expect(e.toString()).to.equal("2014-01-01T00:00:23.000 Europe/Amsterdam");
		});
		it("should add fractional seconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.add(23.5, TimeUnit.Second);
			expect(e.toString()).to.equal("2014-01-01T00:00:23.500 Europe/Amsterdam");
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
		it("should throw on adding fractional months", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			assert.throws((): void => {
				d.add(2.1, TimeUnit.Month);
			});
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
		it("should throw on adding fractional years", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			assert.throws((): void => {
				d.add(2.1, TimeUnit.Year);
			});
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

	describe("addLocal()", (): void => {
		it("should work with a Duration object", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(Duration.minutes(23));
			expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
		});
		it("should add 0", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.addLocal(0, TimeUnit.Millisecond).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Second).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Minute).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Hour).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Day).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Week).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Month).toString()).to.equal(d.toString());
			expect(d.addLocal(0, TimeUnit.Year).toString()).to.equal(d.toString());
		});
		it("should add milliseconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(23, TimeUnit.Millisecond);
			expect(e.toString()).to.equal("2014-01-01T00:00:00.023 Europe/Amsterdam");
		});
		it("should add more than 1000 milliseconds", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1001, TimeUnit.Millisecond);
			expect(e.toString()).to.equal("2014-01-01T00:00:01.001 Europe/Amsterdam");
		});
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
		it("should clamp end-of-month", (): void => {
			var d = new DateTime(2014, 1, 31, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
		});
		it("should clamp end-of-month (leap year)", (): void => {
			var d = new DateTime(2004, 1, 31, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2004-02-29T00:00:00.000 Europe/Amsterdam");
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
		it("should clamp end-of-month (leap year)", (): void => {
			var d = new DateTime(2004, 2, 29, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(1, TimeUnit.Year);
			expect(e.toString()).to.equal("2005-02-28T00:00:00.000 Europe/Amsterdam");
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
		});
		it("should account for DST forward, -1", (): void => {
			// it should skip over 02:59 since that does not exist
			var d = new DateTime(2014, 3, 30, 3, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.addLocal(-1, TimeUnit.Hour);
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

	describe("subLocal()", (): void => {
		// this calls addLocal(-duration) so we rely on the addLocal tests
		it("should work with a Duration object", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.subLocal(Duration.minutes(-23));
			expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
		});
		it("should work with amount & unit", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			var e = d.subLocal(-23, TimeUnit.Minute);
			expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
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
		it("should handle subtracting from january", (): void => {
			var d = new DateTime(2014, 1, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
			var e = d.sub(1, TimeUnit.Month);
			expect(e.toString()).to.equal("2013-12-15T00:00:00.000 UTC");
		});
		it("should handle adding to december", (): void => {
			var d = new DateTime(2013, 12, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
			var e = d.sub(-1, TimeUnit.Month);
			expect(e.toString()).to.equal("2014-01-15T00:00:00.000 UTC");
		});
		it("should handle adding more than a year in months", (): void => {
			var d = new DateTime(2013, 9, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
			var e = d.sub(-24, TimeUnit.Month);
			expect(e.toString()).to.equal("2015-09-15T00:00:00.000 UTC");
		});
		it("should handle subtracting more than a year in months", (): void => {
			var d = new DateTime(2013, 9, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
			var e = d.sub(24, TimeUnit.Month);
			expect(e.toString()).to.equal("2011-09-15T00:00:00.000 UTC");
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

	describe("startOfDay()", (): void => {
		it("should work for a date with a zone", (): void => {
			expect((new DateTime(2014, 1, 1, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam")))
				.startOfDay().toString()).to.equal("2014-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should work for a date without a zone", (): void => {
			expect((new DateTime(2014, 1, 24, 23, 59, 59, 999)).startOfDay().toString()).to.equal("2014-01-24T00:00:00.000");
		});
		it("should work for already truncated date", (): void => {
			expect((new DateTime(2014, 1, 1)).startOfDay().toString()).to.equal("2014-01-01T00:00:00.000");
		});
		it("should return a fresh clone", (): void => {
			var d = new DateTime(2014, 1, 1);
			expect(d.startOfDay()).not.to.equal(d);
		});
	});

	describe("startOfMonth()", (): void => {
		it("should work for a date with a zone", (): void => {
			expect((new DateTime(2014, 1, 31, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam")))
				.startOfMonth().toString()).to.equal("2014-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should work for a date without a zone", (): void => {
			expect((new DateTime(2014, 1, 24, 23, 59, 59, 999)).startOfMonth().toString()).to.equal("2014-01-01T00:00:00.000");
		});
		it("should work for already truncated date", (): void => {
			expect((new DateTime(2014, 1, 1)).startOfMonth().toString()).to.equal("2014-01-01T00:00:00.000");
		});
		it("should return a fresh clone", (): void => {
			var d = new DateTime(2014, 1, 1);
			expect(d.startOfMonth()).not.to.equal(d);
		});
	});

	describe("startOfYear()", (): void => {
		it("should work for a date with a zone", (): void => {
			expect((new DateTime(2014, 2, 28, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam")))
				.startOfYear().toString()).to.equal("2014-01-01T00:00:00.000 Europe/Amsterdam");
		});
		it("should work for a date without a zone", (): void => {
			expect((new DateTime(2014, 2, 24, 23, 59, 59, 999)).startOfYear().toString()).to.equal("2014-01-01T00:00:00.000");
		});
		it("should work for already truncated date", (): void => {
			expect((new DateTime(2014, 1, 1)).startOfYear().toString()).to.equal("2014-01-01T00:00:00.000");
		});
		it("should return a fresh clone", (): void => {
			var d = new DateTime(2014, 1, 1);
			expect(d.startOfYear()).not.to.equal(d);
		});
	});

	describe("lessThan()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessThan(new DateTime("2014-02-02T02:02:02.003"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(true);
		});
		it("should return false for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
		});
		it("should return false for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").lessThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:03.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+00").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
		});
	});

	describe("lessEqual()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessEqual(new DateTime("2014-02-02T02:02:02.003"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(true);
		});
		it("should return true for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").lessEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
		});
		it("should return false for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").lessEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:03.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+00").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
		});
	});

	describe("equals()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").equals(new DateTime("2014-02-02T02:02:02.003"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(false);
		});
		it("should return true for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").equals(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
		});
		it("should return false for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").equals(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:03.002+01").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+00").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
		});
	});

	describe("identical()", (): void => {
		it("should return false if time zone differs", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").identical(new DateTime("2014-02-02T02:02:02.002+01:00"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+02:00").identical(new DateTime("2014-02-02T03:02:02.002+01:00"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").identical(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002 GMT").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.equal(false);
		});
		it("should return true for an identical other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").identical(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").identical(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
		});
		it("should return false if time zones are not identical but equal", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002+00:00").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002 GMT").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.equal(false);
		});
	});

	describe("greaterThan()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterThan(new DateTime("2014-02-02T02:02:02.003"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(false);
		});
		it("should return false for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
		});
		it("should return true for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").greaterThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:03.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+00").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
		});
	});

	describe("greaterEqual()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterEqual(new DateTime("2014-02-02T02:02:02.003"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(false);
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(false);
		});
		it("should return true for an equal other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.002").greaterEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
		});
		it("should return true for a lesser other", (): void => {
			expect(new DateTime("2014-02-02T02:02:02.003").greaterEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:03.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
			expect(new DateTime("2014-02-02T02:02:02.002+00").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
		});
	});

	describe("min()", (): void => {
		it("should return a value equal to this if this is smaller", (): void => {
			expect(new DateTime(1).min(new DateTime(2)).unixUtcMillis()).to.equal(1);
		});
		it("should any of the values if they are equal", (): void => {
			expect(new DateTime(2).min(new DateTime(2)).unixUtcMillis()).to.equal(2);
		});
		it("should the other value if it is smaller", (): void => {
			expect(new DateTime(2).min(new DateTime(1)).unixUtcMillis()).to.equal(1);
		});
	});

	describe("max()", (): void => {
		it("should return a value equal to other if this is smaller", (): void => {
			expect(new DateTime(1).max(new DateTime(2)).unixUtcMillis()).to.equal(2);
		});
		it("should any of the values if they are equal", (): void => {
			expect(new DateTime(2).max(new DateTime(2)).unixUtcMillis()).to.equal(2);
		});
		it("should this value if this is greater", (): void => {
			expect(new DateTime(2).max(new DateTime(1)).unixUtcMillis()).to.equal(2);
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
				"2014-02-03T05:06:07.008" + TimeZone.offsetToString(TimeZone.local().offsetForZone(2014, 2, 3, 5, 6, 7, 8)));
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

	describe("valueOf()", (): void => {
		it("should work", (): void => {
			expect((new DateTime("2014-02-03T05:06:07.008")).valueOf()).to.equal(
				(new DateTime("2014-02-03T05:06:07.008")).unixUtcMillis());
		});
	});

	describe("weekDay()", (): void => {
		it("should return a local week day", (): void => {
			expect(new DateTime("2014-07-07T00:00:00.00 Europe/Amsterdam").weekDay()).to.equal(WeekDay.Monday);
			expect(new DateTime("2014-07-07T23:59:59.999 Europe/Amsterdam").weekDay()).to.equal(WeekDay.Monday);
		});
	});

	describe("utcWeekDay()", (): void => {
		it("should return a UTC week day", (): void => {
			expect(new DateTime("2014-07-07T00:00:00.00 Europe/Amsterdam").utcWeekDay()).to.equal(WeekDay.Sunday);
		});
	});

	describe("dayOfYear()", (): void => {
		it("should return a local dayOfYear", (): void => {
			expect(new DateTime("2014-01-01T00:00:00.00 Europe/Amsterdam").dayOfYear()).to.equal(0);
			expect(new DateTime("2014-12-31T23:59:59.999 Europe/Amsterdam").dayOfYear()).to.equal(364);
		});
	});

	describe("utcDayOfYear()", (): void => {
		it("should return a UTC week day", (): void => {
			// note this is still january 1st in utc
			expect(new DateTime("2014-01-02T00:00:00.00 Europe/Amsterdam").utcDayOfYear()).to.equal(0);
		});
	});

	describe("weekNumber()", (): void => {
		// note already thoroughly tested in basics.weekDay()
		it("should work on local date", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone(60));
			expect(d.weekNumber()).to.equal(22);
		});
	});

	describe("utcWeekNumber()", (): void => {
		// note already thoroughly tested in basics.weekDay()
		it("should work on utc date", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone(60));
			expect(d.utcWeekNumber()).to.equal(21);
		});
	});

	describe("weekOfMonth()", (): void => {
		// note already thoroughly tested in basics.weekOfMonth()
		it("should work", (): void => {
			var d = new DateTime(2014, 8, 11, 0, 0, 0, 0, TimeZone.zone(60));
			expect(d.weekOfMonth()).to.equal(2);
		});
	});

	describe("utcWeekOfMonth()", (): void => {
		// note already thoroughly tested in basics.weekOfMonth()
		it("should work", (): void => {
			var d = new DateTime(2014, 8, 11, 0, 0, 0, 0, TimeZone.zone(60));
			expect(d.utcWeekOfMonth()).to.equal(1);
		});
	});

	describe("secondOfDay()", (): void => {
		// note already thoroughly tested in basics.secondOfDay()
		it("should work", (): void => {
			var d = new DateTime(2014, 1, 1, 0, 0, 3, 0, TimeZone.zone(60));
			expect(d.secondOfDay()).to.equal(3);
		});
	});

	describe("utcSecondOfDay()", (): void => {
		// note already thoroughly tested in basics.secondOfDay()
		it("should work", (): void => {
			var d = new DateTime(2014, 1, 1, 1, 0, 0, 0, TimeZone.zone(60));
			expect(d.utcSecondOfDay()).to.equal(0);
		});
	});

	describe("zoneAbbreviation()", (): void => {
		it("should return nothing for naive date", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0);
			expect(d.zoneAbbreviation()).to.equal("");
		});
		it("should return the zone abbrev for aware date", (): void => {
			// note already tested in test-tz-database
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.zoneAbbreviation()).to.equal("CEST");
		});
	});

	describe("format()", (): void => {
		it("should format to a user-defined string", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone("Europe/Amsterdam"));
			expect(d.format("dd/MM/yyyy HH:mm:ss")).to.equal("26/05/2014 00:30:00");
		});
		it("should not care about NULL time zone", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, null);
			expect(d.format("dd/MM/yyyy HH:mm:ss zzzz")).to.equal("26/05/2014 00:30:00");
		});
		it("should add non-null time zone", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone("America/Chicago"));
			expect(d.format("dd/MM/yyyy HH:mm:ss zzzz")).to.equal("26/05/2014 00:30:00 America/Chicago");
		});
		it("should use given format options", (): void => {
			var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone("America/Chicago"));
			expect(d.format("MMM", {
				shortMonthNames: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
			})).to.equal("E");
		});
	});

	describe("unixUtcMillis()", (): void => {
		it("should trim the cache", function(): void {
			this.timeout(10000);
			for (var i = 0; i < 2 * datetimeFuncs.UTC_MILLIS_CACHE.MAX_CACHE_SIZE; ++i) {
				var d = new DateTime(i, TimeZone.utc());
				expect(d.unixUtcMillis()).to.equal(i);
			}
			expect(datetimeFuncs.UTC_MILLIS_CACHE.size()).to.be.lessThan(datetimeFuncs.UTC_MILLIS_CACHE.MAX_CACHE_SIZE + 1);
		});
	});

	describe("issue #22", (): void => {
		it("should not crash", (): void => {
			var arrivalTime = new DateTime(2016, 2, 12, 11, 0, 0, 0, TimeZone.zone("Asia/Tokyo"));
			arrivalTime = arrivalTime.add(Duration.days(1));
			expect(arrivalTime.toString()).to.equal("2016-02-13T11:00:00.000 Asia/Tokyo");
		});
	});
});



