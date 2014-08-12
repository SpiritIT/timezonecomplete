/// <reference path="../typings/test.d.ts" />

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;

import basics = require("../lib/basics");

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

describe("isInt()", (): void => {
	it("should return true for integers", (): void => {
		expect(basics.isInt(1)).to.be.true;
		expect(basics.isInt(0)).to.be.true;
		expect(basics.isInt(-1)).to.be.true;
	});
	it("should return false for rational numbers", (): void => {
		expect(basics.isInt(1.1)).to.be.false;
		expect(basics.isInt(0.1)).to.be.false;
		expect(basics.isInt(-1.1)).to.be.false;
	});
	it("should return false for NaN", (): void => {
		expect(basics.isInt(NaN)).to.be.false;
	});
});

describe("TimeStruct", (): void => {

	describe("validate()", (): void => {
		it("should work for valid dates", (): void => {
			expect((new TimeStruct()).validate()).to.be.true;
			//expect((new TimeStruct(2014, 1, 1, 2, 2, 4)).validate()).to.be.true;
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
		it("should return false for invalid year", (): void => {
			var t: TimeStruct;
			t = new TimeStruct();
			t.year = 1969;
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
		it("should return true for valid leap second", (): void => {
			var t: TimeStruct;
			t = new TimeStruct(1976,6,30,23,59,59);
			t.second = 60;
			expect(t.validate()).to.be.true;
		});
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
		it("should work for leap second in leap year", (): void => {
			expect((new TimeStruct(1972, 12, 31, 23, 59, 60, 999)).yearDay()).to.equal(365);
		});

	});

});

describe("unixToTimeNoLeapSecs()", (): void => {
	it("should work", (): void => {
		expect(basics.unixToTimeNoLeapSecs(1407859203010)).to.deep.equal(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10));
	});
});

describe("timeToUnixNoLeapSecs()", (): void => {
	it("should work", (): void => {
		expect(basics.timeToUnixNoLeapSecs(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10))).to.equal(1407859203010);
	});
	it("should work roundtrip", (): void => {
		expect(basics.unixToTimeNoLeapSecs(basics.timeToUnixNoLeapSecs(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10)))).to.deep.equal(
			new TimeStruct(2014, 8, 12, 16, 0, 3, 10));
	});
});

describe("weekDayNoLeapSecs()", (): void => {
	it("should work", (): void => {
		expect(basics.weekDayNoLeapSecs(1407852032000)).to.equal(WeekDay.Tuesday);
	});
});

