/// <reference path="../typings/test.d.ts" />
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var basics = require("../lib/basics");

var TimeStruct = basics.TimeStruct;
var WeekDay = basics.WeekDay;

describe("isLeapYear()", function () {
    it("should work", function () {
        expect(basics.isLeapYear(2001)).to.be.false; // normal non-leap year
        expect(basics.isLeapYear(2004)).to.be.true; // normal leap year
        expect(basics.isLeapYear(2200)).to.be.false; // divisible by 100 but not 400
        expect(basics.isLeapYear(2000)).to.be.true; // divisible by 400
    });
});

describe("daysInYear()", function () {
    it("should work", function () {
        expect(basics.daysInYear(2001)).to.equal(365); // normal non-leap year
        expect(basics.daysInYear(2004)).to.equal(366); // normal leap year
        expect(basics.daysInYear(2200)).to.equal(365); // divisible by 100 but not 400
        expect(basics.daysInYear(2000)).to.equal(366); // divisible by 400
    });
});

describe("daysInMonth()", function () {
    it("should work", function () {
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
    it("should throw for invalid month", function () {
        assert.throws(function () {
            basics.daysInMonth(2001, 0);
        });
        assert.throws(function () {
            basics.daysInMonth(2001, 13);
        });
        assert.throws(function () {
            basics.daysInMonth(10, 2001);
        });
    });
});

describe("lastWeekDayOfMonth()", function () {
    it("should work for month ending on Sunday", function () {
        expect(basics.lastWeekDayOfMonth(2014, 8, 0 /* Sunday */)).to.equal(31);
        expect(basics.lastWeekDayOfMonth(2014, 8, 1 /* Monday */)).to.equal(25);
        expect(basics.lastWeekDayOfMonth(2014, 8, 2 /* Tuesday */)).to.equal(26);
        expect(basics.lastWeekDayOfMonth(2014, 8, 3 /* Wednesday */)).to.equal(27);
        expect(basics.lastWeekDayOfMonth(2014, 8, 4 /* Thursday */)).to.equal(28);
        expect(basics.lastWeekDayOfMonth(2014, 8, 5 /* Friday */)).to.equal(29);
        expect(basics.lastWeekDayOfMonth(2014, 8, 6 /* Saturday */)).to.equal(30);
    });
    it("should work for month ending on Tuesday", function () {
        expect(basics.lastWeekDayOfMonth(2014, 9, 0 /* Sunday */)).to.equal(28);
        expect(basics.lastWeekDayOfMonth(2014, 9, 1 /* Monday */)).to.equal(29);
        expect(basics.lastWeekDayOfMonth(2014, 9, 2 /* Tuesday */)).to.equal(30);
        expect(basics.lastWeekDayOfMonth(2014, 9, 3 /* Wednesday */)).to.equal(24);
        expect(basics.lastWeekDayOfMonth(2014, 9, 4 /* Thursday */)).to.equal(25);
        expect(basics.lastWeekDayOfMonth(2014, 9, 5 /* Friday */)).to.equal(26);
        expect(basics.lastWeekDayOfMonth(2014, 9, 6 /* Saturday */)).to.equal(27);
    });
    it("should work for leap day", function () {
        expect(basics.lastWeekDayOfMonth(2004, 2, 0 /* Sunday */)).to.equal(29);
        expect(basics.lastWeekDayOfMonth(2004, 2, 1 /* Monday */)).to.equal(23);
        expect(basics.lastWeekDayOfMonth(2004, 2, 2 /* Tuesday */)).to.equal(24);
        expect(basics.lastWeekDayOfMonth(2004, 2, 3 /* Wednesday */)).to.equal(25);
        expect(basics.lastWeekDayOfMonth(2004, 2, 4 /* Thursday */)).to.equal(26);
        expect(basics.lastWeekDayOfMonth(2004, 2, 5 /* Friday */)).to.equal(27);
        expect(basics.lastWeekDayOfMonth(2004, 2, 6 /* Saturday */)).to.equal(28);
    });
});

describe("weekDayOnOrAfter()", function () {
    it("should work", function () {
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 1 /* Monday */)).to.equal(11);
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 2 /* Tuesday */)).to.equal(12);
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 3 /* Wednesday */)).to.equal(13);
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 4 /* Thursday */)).to.equal(14);
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 5 /* Friday */)).to.equal(15);
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 6 /* Saturday */)).to.equal(16);
        expect(basics.weekDayOnOrAfter(2014, 8, 11, 0 /* Sunday */)).to.equal(17);
    });
});

describe("weekDayOnOrBefore()", function () {
    it("should work", function () {
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 1 /* Monday */)).to.equal(11);
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 2 /* Tuesday */)).to.equal(12);
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 3 /* Wednesday */)).to.equal(13);
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 4 /* Thursday */)).to.equal(14);
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 5 /* Friday */)).to.equal(15);
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 6 /* Saturday */)).to.equal(16);
        expect(basics.weekDayOnOrBefore(2014, 8, 17, 0 /* Sunday */)).to.equal(17);
    });
});

describe("TimeStruct", function () {
    describe("validate()", function () {
        it("should work for valid dates", function () {
            expect((new TimeStruct()).validate()).to.be.true;
            expect((new TimeStruct(2014, 1, 1, 2, 2, 4)).validate()).to.be.true;
        });
        it("should return false for non-numbers", function () {
            var t;
            t = new TimeStruct();
            t.hour = NaN;
            expect(t.validate()).to.be.false;
        });
        it("should return false for non-integers", function () {
            var t;
            t = new TimeStruct();
            t.hour = 1.5;
            expect(t.validate()).to.be.false;
        });
        it("should return false for invalid month", function () {
            var t;
            t = new TimeStruct();
            t.month = 0;
            expect(t.validate()).to.be.false;
            t.month = 13;
            expect(t.validate()).to.be.false;
        });
        it("should return false for invalid day", function () {
            var t;
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
        it("should return true for valid leap day", function () {
            var t;
            t = new TimeStruct();
            t.year = 2008;
            t.month = 2;
            t.day = 29;
            expect(t.validate()).to.be.true;
        });
        it("should return false for invalid hour", function () {
            var t;
            t = new TimeStruct();
            t.hour = -1;
            expect(t.validate()).to.be.false;
            t.hour = 24;
            expect(t.validate()).to.be.false;
        });
        it("should return false for invalid minute", function () {
            var t;
            t = new TimeStruct();
            t.minute = -1;
            expect(t.validate()).to.be.false;
            t.minute = 60;
            expect(t.validate()).to.be.false;
        });
        it("should return false for invalid second", function () {
            var t;
            t = new TimeStruct();
            t.second = -1;
            expect(t.validate()).to.be.false;
            t.second = 62;
            expect(t.validate()).to.be.false;
        });
        it("should return true for valid leap second", function () {
            var t;
            t = new TimeStruct(1976, 6, 30, 23, 59, 59);
            t.second = 60;
            expect(t.validate()).to.be.true;
        });
        it("should return false for invalid milli", function () {
            var t;
            t = new TimeStruct();
            t.milli = -1;
            expect(t.validate()).to.be.false;
            t.milli = 1000;
            expect(t.validate()).to.be.false;
        });
    });

    describe("yearDay()", function () {
        it("should work", function () {
            expect((new TimeStruct(2014, 1, 1, 0, 0, 0, 0)).yearDay()).to.equal(0);
            expect((new TimeStruct(2014, 12, 31, 0, 0, 0, 0)).yearDay()).to.equal(364);
            expect((new TimeStruct(2014, 12, 31, 23, 59, 59, 999)).yearDay()).to.equal(364);
        });
        it("should work for leap year", function () {
            expect((new TimeStruct(2004, 12, 31, 0, 0, 0, 0)).yearDay()).to.equal(365);
        });
        it("should work for leap second in leap year", function () {
            expect((new TimeStruct(1972, 12, 31, 23, 59, 60, 999)).yearDay()).to.equal(365);
        });
    });
});

describe("unixToTimeNoLeapSecs()", function () {
    it("should work for post-1970", function () {
        expect(basics.unixToTimeNoLeapSecs(1407859203010)).to.deep.equal(new TimeStruct(2014, 8, 12, 16, 0, 3, 10));
    });
    it("should work for post-1970 leap day", function () {
        expect(basics.unixToTimeNoLeapSecs(1078012800000)).to.deep.equal(new TimeStruct(2004, 2, 29, 0, 0, 0, 0));
    });
    it("should work for pre-1970", function () {
        expect(basics.unixToTimeNoLeapSecs(-312749632999)).to.deep.equal(new TimeStruct(1960, 2, 3, 5, 6, 7, 1));
    });
    it("should work for pre-1970 leap day", function () {
        expect(basics.unixToTimeNoLeapSecs(-58017600000)).to.deep.equal(new TimeStruct(1968, 2, 29, 12, 0, 0, 0));
    });
});

describe("timeToUnixNoLeapSecs()", function () {
    it("should work for post-1970", function () {
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(2014, 8, 12, 16, 0, 3, 10))).to.equal(1407859203010);
    });
    it("should work for pre-1970", function () {
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(1960, 2, 3, 5, 6, 7, 1))).to.equal(-312749632999);
    });
    it("should work roundtrip", function () {
        expect(basics.unixToTimeNoLeapSecs(basics.timeToUnixNoLeapSecs(new TimeStruct(2014, 8, 12, 16, 0, 3, 10)))).to.deep.equal(new TimeStruct(2014, 8, 12, 16, 0, 3, 10));
    });
    it("should work for loose values", function () {
        expect(basics.timeToUnixNoLeapSecs(2014, 8, 12, 16, 0, 3, 10)).to.equal(1407859203010);
    });
});

describe("weekDayNoLeapSecs()", function () {
    it("should work", function () {
        expect(basics.weekDayNoLeapSecs(1407852032000)).to.equal(2 /* Tuesday */);
    });
});
