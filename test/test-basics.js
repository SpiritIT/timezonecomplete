/// <reference path="../typings/test.d.ts" />
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var basics = require("../lib/basics");
var javascript = require("../lib/javascript");

var DateFunctions = javascript.DateFunctions;
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

describe("firstWeekDayOfMonth()", function () {
    it("should work for month ending on Sunday", function () {
        expect(basics.firstWeekDayOfMonth(2014, 8, 0 /* Sunday */)).to.equal(3);
        expect(basics.firstWeekDayOfMonth(2014, 8, 1 /* Monday */)).to.equal(4);
        expect(basics.firstWeekDayOfMonth(2014, 8, 2 /* Tuesday */)).to.equal(5);
        expect(basics.firstWeekDayOfMonth(2014, 8, 3 /* Wednesday */)).to.equal(6);
        expect(basics.firstWeekDayOfMonth(2014, 8, 4 /* Thursday */)).to.equal(7);
        expect(basics.firstWeekDayOfMonth(2014, 8, 5 /* Friday */)).to.equal(1);
        expect(basics.firstWeekDayOfMonth(2014, 8, 6 /* Saturday */)).to.equal(2);
    });
    it("should work for month ending on Tuesday", function () {
        expect(basics.firstWeekDayOfMonth(2014, 9, 0 /* Sunday */)).to.equal(7);
        expect(basics.firstWeekDayOfMonth(2014, 9, 1 /* Monday */)).to.equal(1);
        expect(basics.firstWeekDayOfMonth(2014, 9, 2 /* Tuesday */)).to.equal(2);
        expect(basics.firstWeekDayOfMonth(2014, 9, 3 /* Wednesday */)).to.equal(3);
        expect(basics.firstWeekDayOfMonth(2014, 9, 4 /* Thursday */)).to.equal(4);
        expect(basics.firstWeekDayOfMonth(2014, 9, 5 /* Friday */)).to.equal(5);
        expect(basics.firstWeekDayOfMonth(2014, 9, 6 /* Saturday */)).to.equal(6);
    });
    it("should work for leap day", function () {
        expect(basics.firstWeekDayOfMonth(2004, 3, 0 /* Sunday */)).to.equal(7);
        expect(basics.firstWeekDayOfMonth(2004, 3, 1 /* Monday */)).to.equal(1);
        expect(basics.firstWeekDayOfMonth(2004, 3, 2 /* Tuesday */)).to.equal(2);
        expect(basics.firstWeekDayOfMonth(2004, 3, 3 /* Wednesday */)).to.equal(3);
        expect(basics.firstWeekDayOfMonth(2004, 3, 4 /* Thursday */)).to.equal(4);
        expect(basics.firstWeekDayOfMonth(2004, 3, 5 /* Friday */)).to.equal(5);
        expect(basics.firstWeekDayOfMonth(2004, 3, 6 /* Saturday */)).to.equal(6);
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
    describe("fromDate", function () {
        it("should work", function () {
            var d = new Date(2014, 0, 2, 3, 4, 5, 6);
            expect(TimeStruct.fromDate(d, 0 /* Get */)).to.deep.equal(new TimeStruct(2014, 1, 2, 3, 4, 5, 6));
            expect(TimeStruct.fromDate(new Date(2014, 0, 2, 3, 4, 5, 6), 1 /* GetUTC */)).to.deep.equal(new TimeStruct(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()));
        });
    });

    describe("fromString()", function () {
        it("should parse basic format", function () {
            expect(TimeStruct.fromString("2014")).to.deep.equal(new TimeStruct(2014, 1, 1, 0, 0, 0, 0));
            expect(TimeStruct.fromString("20140506")).to.deep.equal(new TimeStruct(2014, 5, 6, 0, 0, 0, 0));
            expect(TimeStruct.fromString("20140506T07")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
            expect(TimeStruct.fromString("20140506T0708")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
            expect(TimeStruct.fromString("20140506T070809")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
            expect(TimeStruct.fromString("2014050607")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
            expect(TimeStruct.fromString("201405060708")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
            expect(TimeStruct.fromString("20140506070809")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
        });
        it("should parse hyphenated format", function () {
            expect(TimeStruct.fromString("2014-05-06")).to.deep.equal(new TimeStruct(2014, 5, 6, 0, 0, 0, 0));
            expect(TimeStruct.fromString("2014-05-06T07")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
            expect(TimeStruct.fromString("2014-05-06T07:08")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
            expect(TimeStruct.fromString("2014-05-06T07:08:09")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
            expect(TimeStruct.fromString("2014-05-0607")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 0, 0, 0));
            expect(TimeStruct.fromString("2014-05-0607:08")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 0, 0));
            expect(TimeStruct.fromString("2014-05-0607:08:09")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
            expect(TimeStruct.fromString("1969-05-06T07:08:09")).to.deep.equal(new TimeStruct(1969, 5, 6, 7, 8, 9, 0));
            expect(TimeStruct.fromString("1972-02-29T07:08:09")).to.deep.equal(new TimeStruct(1972, 2, 29, 7, 8, 9, 0));
            expect(TimeStruct.fromString("1930-01-01T12:05:06.007")).to.deep.equal(new TimeStruct(1930, 1, 1, 12, 5, 6, 7));
        });
        it("should parse fraction", function () {
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
        it("should trim whitespace", function () {
            expect(TimeStruct.fromString(" 2014-05-06T07:08:09 ")).to.deep.equal(new TimeStruct(2014, 5, 6, 7, 8, 9, 0));
        });
        it("should throw on invalid format", function () {
            assert.throws(function () {
                TimeStruct.fromString("");
            });
            assert.throws(function () {
                TimeStruct.fromString("14");
            });
            assert.throws(function () {
                TimeStruct.fromString("14-03-01T16:48:23");
            });
            assert.throws(function () {
                TimeStruct.fromString("20145");
            });
            assert.throws(function () {
                TimeStruct.fromString("2014-5-1");
            });
            assert.throws(function () {
                TimeStruct.fromString("2014-02-29");
            });
        });
        it("should throw on invalid values", function () {
            assert.throws(function () {
                TimeStruct.fromString("2014-13");
            });
            assert.throws(function () {
                TimeStruct.fromString("2014-02-30");
            });
        });
        it("should throw on missing required field", function () {
            assert.throws(function () {
                TimeStruct.fromString("201505");
            });
            assert.throws(function () {
                TimeStruct.fromString("2015-05");
            });
        });
    });

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

        /* todo use this when implementing leap seconds
        it("should return true for valid leap second", (): void => {
        var t: TimeStruct;
        t = new TimeStruct(1976, 6, 30, 23, 59, 59);
        t.second = 60;
        expect(t.validate()).to.be.true;
        });
        */
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
        /* todo use this when implementing leap seconds
        it("should work for leap second in leap year", (): void => {
        expect((new TimeStruct(1972, 12, 31, 23, 59, 60, 999)).yearDay()).to.equal(365);
        });
        */
    });

    describe("valueOf()", function () {
        it("should return unix millis", function () {
            // note unix millisec conversion already tested elsewhere
            expect((new TimeStruct(1970, 1, 1)).valueOf()).to.equal(0);
            expect((new TimeStruct(1970, 1, 1, 0, 0, 0, 1)).valueOf()).to.equal(1);
            expect((new TimeStruct(1969, 12, 31, 23, 59, 59, 999)).valueOf()).to.equal(-1);
        });
    });

    describe("inspect()", function () {
        it("should a wrapped toString()", function () {
            var tm = new TimeStruct(1969, 12, 31, 23, 59, 59, 999);
            expect(tm.inspect()).to.equal("[TimeStruct: " + tm.toString() + "]");
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
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(2014, 1, 1, 0, 0, 0, 0))).to.equal(1388534400000);
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(2014, 12, 31, 23, 59, 59, 999))).to.equal(1420070399999);
    });
    it("should work for pre-1970", function () {
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(1960, 2, 3, 5, 6, 7, 1))).to.equal(-312749632999);
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(1930, 1, 1, 0, 0, 0, 0))).to.equal(-1262304000000);
        expect(basics.timeToUnixNoLeapSecs(new TimeStruct(1930, 12, 31, 23, 59, 59, 999))).to.equal(-1230768000001);
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

describe("weekNumber()", function () {
    it("should work", function () {
        // start of year
        expect(basics.weekNumber(2013, 12, 30)).to.equal(1);
        expect(basics.weekNumber(2013, 12, 31)).to.equal(1);
        expect(basics.weekNumber(2014, 1, 1)).to.equal(1);
        expect(basics.weekNumber(2014, 1, 2)).to.equal(1);
        expect(basics.weekNumber(2014, 1, 3)).to.equal(1);
        expect(basics.weekNumber(2014, 1, 4)).to.equal(1);
        expect(basics.weekNumber(2014, 1, 5)).to.equal(1);

        // mid-year
        expect(basics.weekNumber(2014, 5, 26)).to.equal(22);
        expect(basics.weekNumber(2014, 5, 27)).to.equal(22);
        expect(basics.weekNumber(2014, 5, 28)).to.equal(22);
        expect(basics.weekNumber(2014, 5, 29)).to.equal(22);
        expect(basics.weekNumber(2014, 5, 30)).to.equal(22);
        expect(basics.weekNumber(2014, 5, 31)).to.equal(22);
        expect(basics.weekNumber(2014, 6, 1)).to.equal(22);

        // end-year
        expect(basics.weekNumber(2014, 12, 28)).to.equal(52);
        expect(basics.weekNumber(2014, 12, 29)).to.equal(1);
        expect(basics.weekNumber(2014, 12, 30)).to.equal(1);
        expect(basics.weekNumber(2014, 12, 31)).to.equal(1);
        expect(basics.weekNumber(2015, 1, 1)).to.equal(1);
        expect(basics.weekNumber(2015, 1, 2)).to.equal(1);
        expect(basics.weekNumber(2015, 1, 3)).to.equal(1);
        expect(basics.weekNumber(2015, 1, 4)).to.equal(1);

        // week 53
        expect(basics.weekNumber(2015, 12, 28)).to.equal(53);
        expect(basics.weekNumber(2015, 12, 29)).to.equal(53);
        expect(basics.weekNumber(2015, 12, 30)).to.equal(53);
        expect(basics.weekNumber(2015, 12, 31)).to.equal(53);
        expect(basics.weekNumber(2016, 1, 1)).to.equal(53);
        expect(basics.weekNumber(2016, 1, 2)).to.equal(53);
        expect(basics.weekNumber(2016, 1, 3)).to.equal(53);
        expect(basics.weekNumber(2016, 1, 4)).to.equal(1);
    });
});

describe("weekOfMonth()", function () {
    it("should work", function () {
        // end of month
        expect(basics.weekOfMonth(2014, 7, 28)).to.equal(5);
        expect(basics.weekOfMonth(2014, 7, 29)).to.equal(5);
        expect(basics.weekOfMonth(2014, 7, 30)).to.equal(5);
        expect(basics.weekOfMonth(2014, 7, 31)).to.equal(5);
        expect(basics.weekOfMonth(2014, 8, 1)).to.equal(5);
        expect(basics.weekOfMonth(2014, 8, 2)).to.equal(5);
        expect(basics.weekOfMonth(2014, 8, 3)).to.equal(5);

        // mid-month
        expect(basics.weekOfMonth(2014, 8, 11)).to.equal(2);
        expect(basics.weekOfMonth(2014, 8, 12)).to.equal(2);
        expect(basics.weekOfMonth(2014, 8, 13)).to.equal(2);
        expect(basics.weekOfMonth(2014, 8, 14)).to.equal(2);
        expect(basics.weekOfMonth(2014, 8, 15)).to.equal(2);
        expect(basics.weekOfMonth(2014, 8, 16)).to.equal(2);
        expect(basics.weekOfMonth(2014, 8, 17)).to.equal(2);

        // begin-month
        expect(basics.weekOfMonth(2014, 4, 28)).to.equal(1);
        expect(basics.weekOfMonth(2014, 4, 29)).to.equal(1);
        expect(basics.weekOfMonth(2014, 4, 30)).to.equal(1);
        expect(basics.weekOfMonth(2014, 5, 1)).to.equal(1);
        expect(basics.weekOfMonth(2014, 5, 1)).to.equal(1);
        expect(basics.weekOfMonth(2014, 5, 1)).to.equal(1);
        expect(basics.weekOfMonth(2014, 5, 1)).to.equal(1);

        // end of year
        expect(basics.weekOfMonth(2015, 12, 28)).to.equal(5);
        expect(basics.weekOfMonth(2015, 12, 29)).to.equal(5);
        expect(basics.weekOfMonth(2015, 12, 30)).to.equal(5);
        expect(basics.weekOfMonth(2015, 12, 31)).to.equal(5);
        expect(basics.weekOfMonth(2016, 1, 1)).to.equal(5);
        expect(basics.weekOfMonth(2016, 1, 2)).to.equal(5);
        expect(basics.weekOfMonth(2016, 1, 3)).to.equal(5);
        expect(basics.weekOfMonth(2016, 1, 4)).to.equal(1);
    });
});

describe("secondsInDay()", function () {
    it("should work", function () {
        expect(basics.secondInDay(0, 0, 0)).to.equal(0);
        expect(basics.secondInDay(0, 0, 1)).to.equal(1);
        expect(basics.secondInDay(0, 1, 0)).to.equal(60);
        expect(basics.secondInDay(0, 1, 1)).to.equal(61);
        expect(basics.secondInDay(1, 0, 0)).to.equal(3600);
        expect(basics.secondInDay(1, 0, 1)).to.equal(3601);
        expect(basics.secondInDay(1, 1, 0)).to.equal(3660);
        expect(basics.secondInDay(1, 1, 1)).to.equal(3661);
    });
});
