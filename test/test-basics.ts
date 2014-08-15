/// <reference path="../typings/test.d.ts" />

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;

import basics = require("../lib/basics");
import javascript = require("../lib/javascript");

import DateFunctions = javascript.DateFunctions;
import TimeStruct = basics.TimeStruct;
import WeekDay = basics.WeekDay;

describe("isLeapYear()", (): void => {
	it("should work", (): void => {
		expect(basics.isLeapYear(2001)).to.be.false; // normal non-leap year
		expect(basics.isLeapYear(2004)).to.be.true; // normal leap year
		expect(basics.isLeapYear(2200)).to.be.false; // divisible by 100 but not 400
		expect(basics.isLeapYear(2000)).to.be.true; // divisible by 400
	});
});

describe("daysInYear()", (): void => {
	it("should work", (): void => {
		expect(basics.daysInYear(2001)).to.equal(365); // normal non-leap year
		expect(basics.daysInYear(2004)).to.equal(366); // normal leap year
		expect(basics.daysInYear(2200)).to.equal(365); // divisible by 100 but not 400
		expect(basics.daysInYear(2000)).to.equal(366); // divisible by 400
	});
});

describe("daysInMonth()", (): void => {
	it("should work", (): void => {
		expect(basics.daysInMonth(2001, 1)).to.equal(31);
		expect(basics.daysInMonth(2001, 2)).to.equal(28);
		expect(basics.daysInMonth(2004, 2)).to.equal(29);
		expect(basics.daysInMonth(2200, 2)).to.equal(28);
		expect(basics.daysInMonth(2000, 2)).to.equal(29);
		expect(basics.daysInMonth(2001, 3)).to.equal(31);
		expect(basics.daysInMonth(2001, 4)).to.equal(30);
		expect(basics.daysInMonth(2001, 5)).to.equal(31);
		expect(basics.daysInMonth(2001, 6)).to.equal(30);
		expect(basics.daysInMonth(2001, 7)).to.equal(31);
		expect(basics.daysInMonth(2001, 8)).to.equal(31);
		expect(basics.daysInMonth(2001, 9)).to.equal(30);
		expect(basics.daysInMonth(2001, 10)).to.equal(31);
		expect(basics.daysInMonth(2001, 11)).to.equal(30);
		expect(basics.daysInMonth(2001, 12)).to.equal(31);
	});
	it("should throw for invalid month", (): void => {
		assert.throws((): void => {
			basics.daysInMonth(2001, 0);
		});
		assert.throws((): void => {
			basics.daysInMonth(2001, 13);
		});
		assert.throws((): void => {
			basics.daysInMonth(10, 2001);
		});
	});
});

describe("lastWeekDayOfMonth()", (): void => {
	it("should work for month ending on Sunday", (): void => {
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Sunday)).to.equal(31);
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Monday)).to.equal(25);
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Tuesday)).to.equal(26);
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Wednesday)).to.equal(27);
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Thursday)).to.equal(28);
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Friday)).to.equal(29);
		expect(basics.lastWeekDayOfMonth(2014, 8, WeekDay.Saturday)).to.equal(30);
	});
	it("should work for month ending on Tuesday", (): void => {
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Sunday)).to.equal(28);
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Monday)).to.equal(29);
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Tuesday)).to.equal(30);
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Wednesday)).to.equal(24);
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Thursday)).to.equal(25);
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Friday)).to.equal(26);
		expect(basics.lastWeekDayOfMonth(2014, 9, WeekDay.Saturday)).to.equal(27);
	});
	it("should work for leap day", (): void => {
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Sunday)).to.equal(29);
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Monday)).to.equal(23);
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Tuesday)).to.equal(24);
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Wednesday)).to.equal(25);
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Thursday)).to.equal(26);
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Friday)).to.equal(27);
		expect(basics.lastWeekDayOfMonth(2004, 2, WeekDay.Saturday)).to.equal(28);
	});
});

describe("weekDayOnOrAfter()", (): void => {
	it("should work", (): void => {
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Monday)).to.equal(11);
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Tuesday)).to.equal(12);
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Wednesday)).to.equal(13);
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Thursday)).to.equal(14);
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Friday)).to.equal(15);
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Saturday)).to.equal(16);
		expect(basics.weekDayOnOrAfter(2014, 8, 11, WeekDay.Sunday)).to.equal(17);
	});
});

describe("weekDayOnOrBefore()", (): void => {
	it("should work", (): void => {
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Monday)).to.equal(11);
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Tuesday)).to.equal(12);
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Wednesday)).to.equal(13);
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Thursday)).to.equal(14);
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Friday)).to.equal(15);
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Saturday)).to.equal(16);
		expect(basics.weekDayOnOrBefore(2014, 8, 17, WeekDay.Sunday)).to.equal(17);
	});
});

describe("TimeStruct", (): void => {

	describe("fromDate", (): void => {
		it("should work", (): void => {
			var d: Date = new Date(2014, 0, 2, 3, 4, 5, 6);
			expect(TimeStruct.fromDate(d, DateFunctions.Get)).to.deep.equal(
				new TimeStruct(2014, 1, 2, 3, 4, 5, 6));
			expect(TimeStruct.fromDate(new Date(2014, 0, 2, 3, 4, 5, 6), DateFunctions.GetUTC)).to.deep.equal(
				new TimeStruct(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(),
					d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()));
		});
	});

	describe("fromString()", (): void => {
		it("should parse basic format", (): void => {
			expect(TimeStruct.fromString("2014")).to.deep.equal(new TimeStruct(2014, 1, 1, 0, 0, 0, 0));
			expect(TimeStruct.fromString("20140506")).to.deep.equal(new TimeStruct(2014, 5, 6, 0, 0, 0, 0));
			expect(TimeStruct.fromString("20140506T07")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
			expect(TimeStruct.fromString("20140506T0708")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
			expect(TimeStruct.fromString("20140506T070809")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
			expect(TimeStruct.fromString("2014050607")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
			expect(TimeStruct.fromString("201405060708")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
			expect(TimeStruct.fromString("20140506070809")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
		});
		it("should parse hyphenated format", (): void => {
			expect(TimeStruct.fromString("2014-05-06")).to.deep.equal(new TimeStruct(2014, 5, 6, 0, 0, 0, 0));
			expect(TimeStruct.fromString("2014-05-06T07")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
			expect(TimeStruct.fromString("2014-05-06T07:08")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
			expect(TimeStruct.fromString("2014-05-06T07:08:09")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
			expect(TimeStruct.fromString("2014-05-0607")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
			expect(TimeStruct.fromString("2014-05-0607:08")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
			expect(TimeStruct.fromString("2014-05-0607:08:09")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
			expect(TimeStruct.fromString("1969-05-06T07:08:09")).to.deep.equal(new TimeStruct(1969, 5, 6, 7, 8, 9, 0));
			expect(TimeStruct.fromString("1972-02-29T07:08:09")).to.deep.equal(new TimeStruct(1972, 2, 29, 7, 8, 9, 0));
		});
		it("should parse fraction", (): void => {
			expect(TimeStruct.fromString("2014.0")).to.deep.equal(new TimeStruct(2014, 1, 1, 0, 0, 0, 0));
			expect(TimeStruct.fromString("2014.1")).to.deep.equal(new TimeStruct(2014, 2, 6, 12, 0, 0, 0));
			expect(TimeStruct.fromString("20140506.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 12, 0, 0, 0));
			expect(TimeStruct.fromString("20140506T07.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 30, 0, 0));
			expect(TimeStruct.fromString("20140506T0708.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 30, 0));
			expect(TimeStruct.fromString("20140506T070809.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 500));
			expect(TimeStruct.fromString("20140506T070809.001")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 1));
			expect(TimeStruct.fromString("2014050607.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 30, 0, 0));
			expect(TimeStruct.fromString("201405060708.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 30, 0));
			expect(TimeStruct.fromString("20140506070809.5")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 500));
		});
		it("should trim whitespace", (): void => {
			expect(TimeStruct.fromString(" 2014-05-06T07:08:09 ")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
		});
		it("should throw on invalid format", (): void => {
			assert.throws((): void => {
				TimeStruct.fromString("");
			});
			assert.throws((): void => {
				TimeStruct.fromString("14");
			});
			assert.throws((): void => {
				TimeStruct.fromString("14-03-01T16:48:23");
			});
			assert.throws((): void => {
				TimeStruct.fromString("20145");
			});
			assert.throws((): void => {
				TimeStruct.fromString("2014-5-1");
			});
			assert.throws((): void => {
				TimeStruct.fromString("2014-02-29");
			});
		});
		it("should throw on invalid values", (): void => {
			assert.throws((): void => {
				TimeStruct.fromString("2014-13");
			});
			assert.throws((): void => {
				TimeStruct.fromString("2014-02-30");
			});
		});
		it("should throw on missing required field", (): void => {
			assert.throws((): void => {
				TimeStruct.fromString("201505");
			});
			assert.throws((): void => {
				TimeStruct.fromString("2015-05");
			});
		});
	});


	describe("validate()", (): void => {
		it("should work for valid dates", (): void => {
			expect((new TimeStruct()).validate()).to.be.true;
			expect((new TimeStruct(2014, 1, 1, 2, 2, 4)).validate()).to.be.true;
		});
		it("should return false for non-numbers", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.hour = NaN;
			expect(t.validate()).to.be.false;
		});
		it("should return false for non-integers", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.hour = 1.5;
			expect(t.validate()).to.be.false;
		});
		it("should return false for invalid month", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.month = 0;
			expect(t.validate()).to.be.false;
			t.month = 13;
			expect(t.validate()).to.be.false;
		});
		it("should return false for invalid day", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.day = 0;
			expect(t.validate()).to.be.false;
			t.day = 32;
			expect(t.validate()).to.be.false;
			t.year = 2014;
			t.month = 2;
			t.day = 29;
			expect(t.validate()).to.be.false;
		});
		it("should return true for valid leap day", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.year = 2008;
			t.month = 2;
			t.day = 29;
			expect(t.validate()).to.be.true;
		});
		it("should return false for invalid hour", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.hour = -1;
			expect(t.validate()).to.be.false;
			t.hour = 24;
			expect(t.validate()).to.be.false;
		});
		it("should return false for invalid minute", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.minute = -1;
			expect(t.validate()).to.be.false;
			t.minute = 60;
			expect(t.validate()).to.be.false;
		});
		it("should return false for invalid second", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.second = -1;
			expect(t.validate()).to.be.false;
			t.second = 62;
			expect(t.validate()).to.be.false;
		});
		/* todo use this when implementing leap seconds
		it("should return true for valid leap second", (): void => {
			var t: TimeStruct;
			t = new TimeStruct(1976, 6, 30, 23, 59, 59);
			t.second = 60;
			expect(t.validate()).to.be.true;
		});
		*/
		it("should return false for invalid milli", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.milli = -1;
			expect(t.validate()).to.be.false;
			t.milli = 1000;
			expect(t.validate()).to.be.false;
		});
	});

	describe("yearDay()", (): void => {

		it("should work", (): void => {
			expect((new TimeStruct(2014, 1, 1, 0, 0, 0, 0)).yearDay()).to.equal(0);
			expect((new TimeStruct(2014, 12, 31, 0, 0, 0, 0)).yearDay()).to.equal(364);
			expect((new TimeStruct(2014, 12, 31, 23, 59, 59, 999)).yearDay()).to.equal(364);
		});
		it("should work for leap year", (): void => {
			expect((new TimeStruct(2004, 12, 31, 0, 0, 0, 0)).yearDay()).to.equal(365);
		});
		/* todo use this when implementing leap seconds
		it("should work for leap second in leap year", (): void => {
			expect((new TimeStruct(1972, 12, 31, 23, 59, 60, 999)).yearDay()).to.equal(365);
		});
		*/

	});

});

describe("unixToTimeNoLeapSecs()", (): void => {
	it("should work for post-1970", (): void => {
		expect(basics.unixToTimeNoLeapSecs(1407859203010)).to.deep.equal(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10));
	});
	it("should work for post-1970 leap day", (): void => {
		expect(basics.unixToTimeNoLeapSecs(1078012800000)).to.deep.equal(
			new TimeStruct(2004, 2, 29, 0, 0, 0, 0));
	});
	it("should work for pre-1970", (): void => {
		expect(basics.unixToTimeNoLeapSecs(-312749632999)).to.deep.equal(
			new TimeStruct(1960, 2, 3, 5, 6, 7, 1));
	});
	it("should work for pre-1970 leap day", (): void => {
		expect(basics.unixToTimeNoLeapSecs(-58017600000)).to.deep.equal(
			new TimeStruct(1968, 2, 29, 12, 0, 0, 0));
	});
});

describe("timeToUnixNoLeapSecs()", (): void => {
	it("should work for post-1970", (): void => {
		expect(basics.timeToUnixNoLeapSecs(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10))).to.equal(1407859203010);
	});
	it("should work for pre-1970", (): void => {
		expect(basics.timeToUnixNoLeapSecs(
			new TimeStruct(1960, 2, 3, 5, 6, 7, 1))).to.equal(-312749632999);
	});
	it("should work roundtrip", (): void => {
		expect(basics.unixToTimeNoLeapSecs(basics.timeToUnixNoLeapSecs(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10)))).to.deep.equal(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10));
	});
	it("should work for loose values", (): void => {
		expect(basics.timeToUnixNoLeapSecs(2014, 8, 12, 16, 0, 3, 10)).to.equal(1407859203010);
	});
});

describe("weekDayNoLeapSecs()", (): void => {
	it("should work", (): void => {
		expect(basics.weekDayNoLeapSecs(1407852032000)).to.equal(WeekDay.Tuesday);
	});
});

