/// <reference path="../typings/test.d.ts" />
var sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var basics = require("../lib/basics");
var TimeUnit = basics.TimeUnit;
var javascript = require("../lib/javascript");
var DateFunctions = javascript.DateFunctions;
var TimeStruct = basics.TimeStruct;
var WeekDay = basics.WeekDay;
describe("isLeapYear()", function () {
    it("should work", function () {
        expect(basics.isLeapYear(2001)).to.equal(false); // normal non-leap year
        expect(basics.isLeapYear(2004)).to.equal(true); // normal leap year
        expect(basics.isLeapYear(2200)).to.equal(false); // divisible by 100 but not 400
        expect(basics.isLeapYear(2000)).to.equal(true); // divisible by 400
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
describe("timeUnitToString()", function () {
    it("should return singular form by default", function () {
        expect(basics.timeUnitToString(0 /* Millisecond */)).to.equal("millisecond");
        expect(basics.timeUnitToString(1 /* Second */)).to.equal("second");
        expect(basics.timeUnitToString(2 /* Minute */)).to.equal("minute");
        expect(basics.timeUnitToString(4 /* Day */)).to.equal("day");
        expect(basics.timeUnitToString(6 /* Month */)).to.equal("month");
        expect(basics.timeUnitToString(5 /* Week */)).to.equal("week");
        expect(basics.timeUnitToString(7 /* Year */)).to.equal("year");
    });
    it("should return singular form for 1", function () {
        expect(basics.timeUnitToString(0 /* Millisecond */, 1)).to.equal("millisecond");
    });
    it("should return singular form for -1", function () {
        expect(basics.timeUnitToString(0 /* Millisecond */, -1)).to.equal("millisecond");
    });
    it("should return plural form for other numbers", function () {
        expect(basics.timeUnitToString(0 /* Millisecond */, 0)).to.equal("milliseconds");
        expect(basics.timeUnitToString(0 /* Millisecond */, 0.5)).to.equal("milliseconds");
        expect(basics.timeUnitToString(0 /* Millisecond */, -0.5)).to.equal("milliseconds");
        expect(basics.timeUnitToString(0 /* Millisecond */, 1.5)).to.equal("milliseconds");
        expect(basics.timeUnitToString(0 /* Millisecond */, -1.5)).to.equal("milliseconds");
        expect(basics.timeUnitToString(0 /* Millisecond */, 2)).to.equal("milliseconds");
        expect(basics.timeUnitToString(0 /* Millisecond */, -2)).to.equal("milliseconds");
    });
});
describe("stringToTimeUnit()", function () {
    it("should throw for invalid string", function () {
        assert.throws(function () {
            basics.stringToTimeUnit("");
        });
        assert.throws(function () {
            basics.stringToTimeUnit("epochs");
        });
    });
    it("should handle singular form", function () {
        expect(basics.stringToTimeUnit("day")).to.equal(4 /* Day */);
    });
    it("should handle plural form", function () {
        expect(basics.stringToTimeUnit("days")).to.equal(4 /* Day */);
    });
    it("should be case insensitive", function () {
        expect(basics.stringToTimeUnit("DaY")).to.equal(4 /* Day */);
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
            expect((new TimeStruct()).validate()).to.equal(true);
            expect((new TimeStruct(2014, 1, 1, 2, 2, 4)).validate()).to.equal(true);
        });
        it("should return false for non-numbers", function () {
            var t;
            t = new TimeStruct();
            t.hour = NaN;
            expect(t.validate()).to.equal(false);
        });
        it("should return false for non-integers", function () {
            var t;
            t = new TimeStruct();
            t.hour = 1.5;
            expect(t.validate()).to.equal(false);
        });
        it("should return false for invalid month", function () {
            var t;
            t = new TimeStruct();
            t.month = 0;
            expect(t.validate()).to.equal(false);
            t.month = 13;
            expect(t.validate()).to.equal(false);
        });
        it("should return false for invalid day", function () {
            var t;
            t = new TimeStruct();
            t.day = 0;
            expect(t.validate()).to.equal(false);
            t.day = 32;
            expect(t.validate()).to.equal(false);
            t.year = 2014;
            t.month = 2;
            t.day = 29;
            expect(t.validate()).to.equal(false);
        });
        it("should return true for valid leap day", function () {
            var t;
            t = new TimeStruct();
            t.year = 2008;
            t.month = 2;
            t.day = 29;
            expect(t.validate()).to.equal(true);
        });
        it("should return false for invalid hour", function () {
            var t;
            t = new TimeStruct();
            t.hour = -1;
            expect(t.validate()).to.equal(false);
            t.hour = 24;
            expect(t.validate()).to.equal(false);
        });
        it("should return false for invalid minute", function () {
            var t;
            t = new TimeStruct();
            t.minute = -1;
            expect(t.validate()).to.equal(false);
            t.minute = 60;
            expect(t.validate()).to.equal(false);
        });
        it("should return false for invalid second", function () {
            var t;
            t = new TimeStruct();
            t.second = -1;
            expect(t.validate()).to.equal(false);
            t.second = 62;
            expect(t.validate()).to.equal(false);
        });
        /* todo use this when implementing leap seconds
        it("should return true for valid leap second", (): void => {
            var t: TimeStruct;
            t = new TimeStruct(1976, 6, 30, 23, 59, 59);
            t.second = 60;
            expect(t.validate()).to.equal(true);
        });
        */
        it("should return false for invalid milli", function () {
            var t;
            t = new TimeStruct();
            t.milli = -1;
            expect(t.validate()).to.equal(false);
            t.milli = 1000;
            expect(t.validate()).to.equal(false);
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
    it("should work without arguments", function () {
        expect(basics.timeToUnixNoLeapSecs()).to.equal(0);
    });
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
        expect(basics.secondOfDay(0, 0, 0)).to.equal(0);
        expect(basics.secondOfDay(0, 0, 1)).to.equal(1);
        expect(basics.secondOfDay(0, 1, 0)).to.equal(60);
        expect(basics.secondOfDay(0, 1, 1)).to.equal(61);
        expect(basics.secondOfDay(1, 0, 0)).to.equal(3600);
        expect(basics.secondOfDay(1, 0, 1)).to.equal(3601);
        expect(basics.secondOfDay(1, 1, 0)).to.equal(3660);
        expect(basics.secondOfDay(1, 1, 1)).to.equal(3661);
    });
});

//# sourceMappingURL=data:application/json;base64,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QUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUMsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLGdDQUFnQyxFQUFFO1FBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDYixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDYixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDYixNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsc0JBQXNCLEVBQUU7SUFDaEMsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1FBQzVDLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzRSxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RSxNQUFNLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0UsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMseUNBQXlDLEVBQUU7UUFDN0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RSxNQUFN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LENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGdDQUFnQyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0csTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVHLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pILENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQzNCLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RixNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25HLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0csQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7WUFDNUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUcsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsZ0NBQWdDLEVBQUU7WUFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDYixVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDYixVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDYixVQUFVLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNiLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFD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LEVBQUU7WUFDekMsSUFBSSxDQUFhLENBQUM7WUFDbEIsQ0FBQyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDVixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO1lBQzNDLElBQUksQ0FBYSxDQUFDO1lBQ2xCLENBQUMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHNDQUFzQyxFQUFFO1lBQzFDLElBQUksQ0FBYSxDQUFDO1lBQ2xCLENBQUMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNaLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1lBQzVDLElBQUksQ0FBYSxDQUFDO1lBQ2xCLENBQUMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1lBQzVDLElBQUksQ0FBYSxDQUFDO1lBQ2xCLENBQUMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQUFRQTs7Ozs7OztVQURFO1FBQ0YsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO1lBQzNDLElBQUksQ0FBYSxDQUFDO1lBQ2xCLENBQUMsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDYixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNmLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsV0FBVyxFQUFFO1FBRXJCLEVBQUUsQ0FBQyxhQUFhLEVBQUU7WUFDakIsTUFBTSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakYsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsMkJBQTJCLEVBQUU7WUFDL0IsTUFBTSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUM7UUFDSDs7OztVQUlFO0lBRUgsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsV0FBVyxFQUFFO1FBQ3JCLEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtZQUMvQixBQUNBLHlEQUR5RDtZQUN6RCxNQUFNLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxXQUFXLEVBQUU7UUFDckIsRUFBRSxDQUFDLDZCQUE2QixFQUFFO1lBQ2pDLElBQUksRUFBRSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUVKLENBQUMsQ0FBQyxDQUFDO0FBRUgsUUFBUSxDQUFDLHdCQUF3QixFQUFFO0lBQ2xDLEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtRQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQy9ELElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsb0NBQW9DLEVBQUU7UUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUMvRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLDBCQUEwQixFQUFFO1FBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUMvRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLG1DQUFtQyxFQUFFO1FBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUM5RCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUU7SUFDbEMsRUFBRSxDQUFDLCtCQUErQixFQUFFO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsMkJBQTJCLEVBQUU7UUFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2RyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3BHLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDNUcsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsMEJBQTBCLEVBQUU7UUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BHLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDN0csQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7UUFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQzdELElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUMxRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLDhCQUE4QixFQUFFO1FBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hGLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMscUJBQXFCLEVBQUU7SUFDL0IsRUFBRSxDQUFDLGFBQWEsRUFBRTtRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzRSxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDO0FBRUgsUUFBUSxDQUFDLGNBQWMsRUFBRTtJQUN4QixFQUFFLENBQUMsYUFBYSxFQUFFO1FBQ2pCLEFBQ0EsZ0JBRGdCO1FBQ2hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxELEFBQ0EsV0FEVztRQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRW5ELEFBQ0EsV0FEVztRQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxELEFBQ0EsVUFEVTtRQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25ELENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsZUFBZSxFQUFFO0lBQ3pCLEVBQUUsQ0FBQyxhQUFhLEVBQUU7UUFDakIsQUFDQSxlQURlO1FBQ2YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkQsQUFDQSxZQURZO1FBQ1osTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEQsQUFDQSxjQURjO1FBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkQsQUFDQSxjQURjO1FBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQztBQUVILFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtJQUMxQixFQUFFLENBQUMsYUFBYSxFQUFFO1FBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVzdC90ZXN0LWJhc2ljcy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19