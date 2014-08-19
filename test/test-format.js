var chai = require("chai");
var expect = chai.expect;

var format = require("../lib/format");
var timeZone = require("../lib/timezone");
var basics = require("../lib/basics");

/*
* Dummy implementation of a DateTimeAccess class, for testing the format
*/
describe("format", function () {
    var dateTime;
    var utcTime;
    var localZone;

    beforeEach(function () {
        dateTime = new basics.TimeStruct();
    });

    describe("identity", function () {
        it("should return the raw contents", function () {
            dateTime.year = 18;
            var result = format.format(dateTime, utcTime, localZone, "'abcdefghijklmnopqrstuvwxyz'");
            expect(result).to.equal("abcdefghijklmnopqrstuvwxyz");
        });
    });

    describe("formatEra", function () {
        it("should return BC for years > 0", function () {
            dateTime.year = -1;
            var result = format.format(dateTime, utcTime, localZone, "G");
            expect(result).to.equal("BC");
        });
        it("should return AD for years < 0", function () {
            dateTime.year = 1;
            var result = format.format(dateTime, utcTime, localZone, "G");
            expect(result).to.equal("AD");
        });
        it("should return Before Christ for years > 0", function () {
            dateTime.year = -1;
            var result = format.format(dateTime, utcTime, localZone, "GGGG");
            expect(result).to.equal("Before Christ");
        });
        it("should return Anno Domini for years < 0", function () {
            dateTime.year = 1;
            var result = format.format(dateTime, utcTime, localZone, "GGGG");
            expect(result).to.equal("Anno Domini");
        });
        it("should return B for years > 0", function () {
            dateTime.year = -1;
            var result = format.format(dateTime, utcTime, localZone, "GGGGG");
            expect(result).to.equal("B");
        });
        it("should return A for years < 0", function () {
            dateTime.year = 1;
            var result = format.format(dateTime, utcTime, localZone, "GGGGG");
            expect(result).to.equal("A");
        });
    });

    describe("formatYear", function () {
        it("should return at least one digit year for y", function () {
            dateTime.year = 123;
            var result = format.format(dateTime, utcTime, localZone, "y");
            expect(result).to.equal("123");
        });
        it("should return at least two digit year for yy", function () {
            dateTime.year = 3;
            var result = format.format(dateTime, utcTime, localZone, "yy");
            expect(result).to.equal("03");
        });
        it("should return exactly two digit year for yy", function () {
            dateTime.year = 1997;
            var result = format.format(dateTime, utcTime, localZone, "yy");
            expect(result).to.equal("97");
        });
        it("should pad to four digit year for yyyy", function () {
            dateTime.year = 123;
            var result = format.format(dateTime, utcTime, localZone, "yyyy");
            expect(result).to.equal("0123");
        });
        it("should return at least four digit year for yyyy", function () {
            dateTime.year = 12345;
            var result = format.format(dateTime, utcTime, localZone, "yyyy");
            expect(result).to.equal("12345");
        });
    });

    describe("formatQuarter", function () {
        it("should return the numerical value of the quarter of q", function () {
            dateTime.month = 1;
            var result = format.format(dateTime, utcTime, localZone, "q");
            expect(result).to.equal("01");
        });
        it("should return the numerical value of the quarter of qq", function () {
            dateTime.month = 3;
            var result = format.format(dateTime, utcTime, localZone, "qq");
            expect(result).to.equal("01");
        });
        it("should return the short value of the quarter of qqq", function () {
            dateTime.month = 4;
            var result = format.format(dateTime, utcTime, localZone, "qqq");
            expect(result).to.equal("Q2");
        });
        it("should return the long value of the quarter of qqqq", function () {
            dateTime.month = 12;
            var result = format.format(dateTime, utcTime, localZone, "qqqq");
            expect(result).to.equal("4th quarter");
        });
        it("should return only the number of the quarter of qqqq", function () {
            dateTime.month = 9;
            var result = format.format(dateTime, utcTime, localZone, "qqqqq");
            expect(result).to.equal("3");
        });
    });

    describe("formatMonth", function () {
        it("should return just the number of the month for M", function () {
            dateTime.month = 9;
            var result = format.format(dateTime, utcTime, localZone, "M");
            expect(result).to.equal("9");
        });
        it("should return just the number of the month for M", function () {
            dateTime.month = 11;
            var result = format.format(dateTime, utcTime, localZone, "M");
            expect(result).to.equal("11");
        });
        it("should return just the number of the month for MM, padded to two characters", function () {
            dateTime.month = 3;
            var result = format.format(dateTime, utcTime, localZone, "MM");
            expect(result).to.equal("03");
        });
        it("should return the shortened name of the month with MMM", function () {
            dateTime.month = 8;
            var result = format.format(dateTime, utcTime, localZone, "MMM");
            expect(result).to.equal("Aug");
        });
        it("should return the full name of the month with MMMM", function () {
            dateTime.month = 2;
            var result = format.format(dateTime, utcTime, localZone, "MMMM");
            expect(result).to.equal("February");
        });
        it("should return the narrow name of the month with MMMMM", function () {
            dateTime.month = 11;
            var result = format.format(dateTime, utcTime, localZone, "MMMMM");
            expect(result).to.equal("N");
        });
    });

    describe("formatWeek", function () {
        it("should format the week number with w", function () {
            dateTime.year = 2014;
            dateTime.month = 1;
            dateTime.day = 4;
            var result = format.format(dateTime, utcTime, localZone, "w");
            expect(result).to.equal("1");
        });
        it("should format the week number with w", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 17;
            var result = format.format(dateTime, utcTime, localZone, "w");
            expect(result).to.equal("33");
        });
        it("should format the week number with ww", function () {
            dateTime.year = 2014;
            dateTime.month = 1;
            dateTime.day = 4;
            var result = format.format(dateTime, utcTime, localZone, "ww");
            expect(result).to.equal("01");
        });
        it("should format the week number with ww", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 17;
            var result = format.format(dateTime, utcTime, localZone, "ww");
            expect(result).to.equal("33");
        });
        it("should format the month week number with W", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 17;
            var result = format.format(dateTime, utcTime, localZone, "W");
            expect(result).to.equal("2");
        });
    });

    describe("formatDay", function () {
        it("should return the number of the day with d", function () {
            dateTime.day = 8;
            var result = format.format(dateTime, utcTime, localZone, "d");
            expect(result).to.equal("8");
        });
        it("should return the number of the day with d", function () {
            dateTime.day = 25;
            var result = format.format(dateTime, utcTime, localZone, "d");
            expect(result).to.equal("25");
        });
        it("should return the number of the day with dd, padded to two characters", function () {
            dateTime.day = 6;
            var result = format.format(dateTime, utcTime, localZone, "dd");
            expect(result).to.equal("06");
        });
        it("should return the day of the year with D", function () {
            dateTime.year = 2014;
            dateTime.month = 2;
            dateTime.day = 1;
            var result = format.format(dateTime, utcTime, localZone, "D");
            expect(result).to.equal("32");
        });
        it("should return the day of the year with DD", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 17;
            var result = format.format(dateTime, utcTime, localZone, "DD");
            expect(result).to.equal("229");
        });
    });

    describe("formatWeekday", function () {
        it("should return the abbreviated name for E", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 16;
            var result = format.format(dateTime, utcTime, localZone, "E");
            expect(result).to.equal("Sat");
        });
        it("should return the abbreviated name for EE", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 21;
            var result = format.format(dateTime, utcTime, localZone, "EE");
            expect(result).to.equal("Thu");
        });
        it("should return the abbreviated name for EEE", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 18;
            var result = format.format(dateTime, utcTime, localZone, "EEE");
            expect(result).to.equal("Mon");
        });
        it("should return the full name for EEEE", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 20;
            var result = format.format(dateTime, utcTime, localZone, "EEEE");
            expect(result).to.equal("Wednesday");
        });
        it("should return the narrow name for EEEEE", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 15;
            var result = format.format(dateTime, utcTime, localZone, "EEEEE");
            expect(result).to.equal("F");
        });
        it("should return the short name for EEEEEE", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 17;
            var result = format.format(dateTime, utcTime, localZone, "EEEEEE");
            expect(result).to.equal("Su");
        });

        it("should return the weekday number for e", function () {
            dateTime.year = 2014;
            dateTime.month = 8;
            dateTime.day = 19;
            var result = format.format(dateTime, utcTime, localZone, "e");
            expect(result).to.equal("2");
        });
    });

    describe("formatDayPeriod", function () {
        it("should return AM for the morning", function () {
            dateTime.hour = 11;
            var result = format.format(dateTime, utcTime, localZone, "a");
            expect(result).to.equal("AM");
        });
        it("should return PM for the afternoon", function () {
            dateTime.hour = 23;
            var result = format.format(dateTime, utcTime, localZone, "a");
            expect(result).to.equal("PM");
        });
    });

    describe("formatHour", function () {
        it("should return 1-12 hour period for format h", function () {
            dateTime.hour = 0;
            var result = format.format(dateTime, utcTime, localZone, "h");
            expect(result).to.equal("12");
        });
        it("should return 1-12 hour period for format h", function () {
            dateTime.hour = 22;
            var result = format.format(dateTime, utcTime, localZone, "h");
            expect(result).to.equal("10");
        });
        it("should return 1-12 hour period for format hh, padding to two characters", function () {
            dateTime.hour = 1;
            var result = format.format(dateTime, utcTime, localZone, "hh");
            expect(result).to.equal("01");
        });
        it("should return 1-12 hour period for format hh", function () {
            dateTime.hour = 20;
            var result = format.format(dateTime, utcTime, localZone, "hh");
            expect(result).to.equal("08");
        });
        it("should return 0-11 hour period for format K", function () {
            dateTime.hour = 0;
            var result = format.format(dateTime, utcTime, localZone, "K");
            expect(result).to.equal("0");
        });
        it("should return 0-11 hour period for format K", function () {
            dateTime.hour = 22;
            var result = format.format(dateTime, utcTime, localZone, "K");
            expect(result).to.equal("10");
        });
        it("should return 0-11 hour period for format KK, padding to two characters", function () {
            dateTime.hour = 1;
            var result = format.format(dateTime, utcTime, localZone, "KK");
            expect(result).to.equal("01");
        });
        it("should return 0-11 hour period for format KK", function () {
            dateTime.hour = 20;
            var result = format.format(dateTime, utcTime, localZone, "KK");
            expect(result).to.equal("08");
        });

        it("should return 1-24 hour period for format k", function () {
            dateTime.hour = 0;
            var result = format.format(dateTime, utcTime, localZone, "k");
            expect(result).to.equal("24");
        });
        it("should return 1-24 hour period for format k", function () {
            dateTime.hour = 22;
            var result = format.format(dateTime, utcTime, localZone, "k");
            expect(result).to.equal("22");
        });
        it("should return 1-24 hour period for format kk, padding to two characters", function () {
            dateTime.hour = 1;
            var result = format.format(dateTime, utcTime, localZone, "kk");
            expect(result).to.equal("01");
        });
        it("should return 1-24 hour period for format kk", function () {
            dateTime.hour = 20;
            var result = format.format(dateTime, utcTime, localZone, "kk");
            expect(result).to.equal("20");
        });
        it("should return 0-23 hour period for format H", function () {
            dateTime.hour = 0;
            var result = format.format(dateTime, utcTime, localZone, "H");
            expect(result).to.equal("0");
        });
        it("should return 0-23 hour period for format H", function () {
            dateTime.hour = 22;
            var result = format.format(dateTime, utcTime, localZone, "H");
            expect(result).to.equal("22");
        });
        it("should return 0-23 hour period for format HH, padding to two characters", function () {
            dateTime.hour = 1;
            var result = format.format(dateTime, utcTime, localZone, "HH");
            expect(result).to.equal("01");
        });
        it("should return 0-23 hour period for format HH", function () {
            dateTime.hour = 20;
            var result = format.format(dateTime, utcTime, localZone, "HH");
            expect(result).to.equal("20");
        });
    });

    describe("formatMinute", function () {
        it("should format minutes for format m", function () {
            dateTime.minute = 5;
            var result = format.format(dateTime, utcTime, localZone, "m");
            expect(result).to.equal("5");
        });
        it("should format minutes for format m", function () {
            dateTime.minute = 38;
            var result = format.format(dateTime, utcTime, localZone, "m");
            expect(result).to.equal("38");
        });
        it("should format minutes for format mm, padding to two characters", function () {
            dateTime.minute = 5;
            var result = format.format(dateTime, utcTime, localZone, "mm");
            expect(result).to.equal("05");
        });
        it("should format minutes for format mm", function () {
            dateTime.minute = 38;
            var result = format.format(dateTime, utcTime, localZone, "mm");
            expect(result).to.equal("38");
        });
    });

    describe("formatSecond", function () {
        it("should format seconds for format s", function () {
            dateTime.second = 5;
            var result = format.format(dateTime, utcTime, localZone, "s");
            expect(result).to.equal("5");
        });
        it("should format seconds for format s", function () {
            dateTime.second = 38;
            var result = format.format(dateTime, utcTime, localZone, "s");
            expect(result).to.equal("38");
        });
        it("should format seconds for format ss, padding to two characters", function () {
            dateTime.second = 5;
            var result = format.format(dateTime, utcTime, localZone, "ss");
            expect(result).to.equal("05");
        });
        it("should format seconds for format ss", function () {
            dateTime.second = 38;
            var result = format.format(dateTime, utcTime, localZone, "ss");
            expect(result).to.equal("38");
        });

        it("should get the fraction of a second for format S", function () {
            dateTime.milli = 388;
            var result = format.format(dateTime, utcTime, localZone, "S");
            expect(result).to.equal("3");
        });
        it("should get the fraction of a second for format SS", function () {
            dateTime.milli = 2;
            var result = format.format(dateTime, utcTime, localZone, "SS");
            expect(result).to.equal("00");
        });
        it("should get the fraction of a second for format SSS", function () {
            dateTime.milli = 891;
            var result = format.format(dateTime, utcTime, localZone, "SSS");
            expect(result).to.equal("891");
        });
        it("should get the fraction of a second for format SSSS", function () {
            dateTime.milli = 44;
            var result = format.format(dateTime, utcTime, localZone, "SSSS");
            expect(result).to.equal("0440");
        });

        it("should get the seconds of a day for format A", function () {
            dateTime.hour = 3;
            dateTime.minute = 14;
            dateTime.second = 15;
            var result = format.format(dateTime, utcTime, localZone, "A");
            expect(result).to.equal("11655");
        });
    });

    describe("formatTimeZone", function () {
        it("should get the short specific name of the timezone for format z", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "z");
            expect(result).to.equal("CEST");
        });
        it("should get the short specific name of the timezone for format z", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            dateTime.month = 2;
            var result = format.format(dateTime, utcTime, localZone, "z");
            expect(result).to.equal("CET");
        });
        it("should get the long specific name of the timezone for format zzzz", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "zzzz");
            expect(result).to.equal("Central European Summer Time");
        });
        it("should get the long specific name of the timezone for format zzzz", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "zzzz");
            expect(result).to.equal("Central European Time");
        });

        it("should get the short specific name of the timezone for format O", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "O");
            expect(result).to.equal("GMT+2");
        });
        it("should get the short specific name of the timezone for format O", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (60 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "O");
            expect(result).to.equal("GMT+1");
        });
        it("should get the short specific name of the timezone for format OOOO", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "OOOO");
            expect(result).to.equal("GMT+2:00");
        });
        it("should get the short specific name of the timezone for format OOOO", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (60 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "OOOO");
            expect(result).to.equal("GMT+1:00");
        });

        it("should get the short specific name of the timezone for format v", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "v");
            expect(result).to.equal("CET");
        });
        it("should get the short specific name of the timezone for format v", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 2;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (60 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "v");
            expect(result).to.equal("CET");
        });
        it("should get the long specific name of the timezone for format vvvv", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "vvvv");
            expect(result).to.equal("Central European Time");
        });
        it("should get the long specific name of the timezone for format vvvv", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "vvvv");
            expect(result).to.equal("Central European Time");
        });

        it("should get the long Timezone ID for format VV", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (120 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "VV");
            expect(result).to.equal("Europe/Amsterdam");
        });

        it("should get the basic ISO format for format X with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "X");
            expect(result).to.equal("+0230");
        });
        it("should get the basic ISO format for format X with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "X");
            expect(result).to.equal("-08");
        });
        it("should get the basic ISO format for format X with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "X");
            expect(result).to.equal("Z");
        });

        it("should get the basic ISO format for format XX with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XX");
            expect(result).to.equal("+0230");
        });
        it("should get the basic ISO format for format XX with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XX");
            expect(result).to.equal("-0800");
        });
        it("should get the basic ISO format for format XX with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XX");
            expect(result).to.equal("Z");
        });

        it("should get the basic ISO format for format XXX with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXX");
            expect(result).to.equal("+02:30");
        });
        it("should get the basic ISO format for format XXX with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXX");
            expect(result).to.equal("-08:00");
        });
        it("should get the basic ISO format for format XXX with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXX");
            expect(result).to.equal("Z");
        });

        it("should get the basic ISO format for format XXXX with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXXX");
            expect(result).to.equal("+0230");
        });
        it("should get the basic ISO format for format XXXX with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXXX");
            expect(result).to.equal("-0800");
        });
        it("should get the basic ISO format for format XXXX with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXXX");
            expect(result).to.equal("Z");
        });

        it("should get the basic ISO format for format XXXXX with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXXXX");
            expect(result).to.equal("+02:30");
        });
        it("should get the basic ISO format for format XXXXX with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXXXX");
            expect(result).to.equal("-08:00");
        });
        it("should get the basic ISO format for format XXXXX with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "XXXXX");
            expect(result).to.equal("Z");
        });

        it("should get the basic ISO format for format x with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "x");
            expect(result).to.equal("+0230");
        });
        it("should get the basic ISO format for format x with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "x");
            expect(result).to.equal("-08");
        });
        it("should get the basic ISO format for format x with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "x");
            expect(result).to.equal("+00");
        });

        it("should get the basic ISO format for format xx with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xx");
            expect(result).to.equal("+0230");
        });
        it("should get the basic ISO format for format xx with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xx");
            expect(result).to.equal("-0800");
        });
        it("should get the basic ISO format for format xx with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xx");
            expect(result).to.equal("+0000");
        });

        it("should get the basic ISO format for format xxx with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxx");
            expect(result).to.equal("+02:30");
        });
        it("should get the basic ISO format for format xxx with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxx");
            expect(result).to.equal("-08:00");
        });
        it("should get the basic ISO format for format xxx with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxx");
            expect(result).to.equal("+00:00");
        });

        it("should get the basic ISO format for format xxxx with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxxx");
            expect(result).to.equal("+0230");
        });
        it("should get the basic ISO format for format xxxx with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxxx");
            expect(result).to.equal("-0800");
        });
        it("should get the basic ISO format for format xxxx with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxxx");
            expect(result).to.equal("+0000");
        });

        it("should get the basic ISO format for format xxxxx with positive offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (150 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxxxx");
            expect(result).to.equal("+02:30");
        });
        it("should get the basic ISO format for format xxxxx with negative offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (-480 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxxxx");
            expect(result).to.equal("-08:00");
        });
        it("should get the basic ISO format for format xxxxx with 0 offset", function () {
            localZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.year = 2014;
            dateTime.month = 7;
            dateTime.day = 15;
            utcTime = basics.unixToTimeNoLeapSecs(dateTime.toUnixNoLeapSecs() - (0 * 60 * 1000));
            var result = format.format(dateTime, utcTime, localZone, "xxxxx");
            expect(result).to.equal("+00:00");
        });
    });
});
//# sourceMappingURL=test-format.js.map
