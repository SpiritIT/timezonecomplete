var chai = require("chai");
var expect = chai.expect;

var format = require("../lib/format");

var timeZone = require("../lib/timezone");
var basics = require("../lib/basics");

/*
* Dummy implementation of a DateTimeAccess class, for testing the Formatter
*/
var DateTimeDummy = (function () {
    function DateTimeDummy() {
    }
    DateTimeDummy.prototype.year = function () {
        return this.dateYear;
    };
    DateTimeDummy.prototype.month = function () {
        return this.dateMonth;
    };
    DateTimeDummy.prototype.day = function () {
        return this.dateDay;
    };
    DateTimeDummy.prototype.weekDay = function () {
        return this.dateWeekDay;
    };
    DateTimeDummy.prototype.weekNumber = function () {
        return this.dateWeek;
    };

    DateTimeDummy.prototype.hour = function () {
        return this.dateHour;
    };
    DateTimeDummy.prototype.minute = function () {
        return this.dateMinute;
    };
    DateTimeDummy.prototype.second = function () {
        return this.dateSecond;
    };
    DateTimeDummy.prototype.millisecond = function () {
        return this.dateMilli;
    };

    DateTimeDummy.prototype.zone = function () {
        return this.dateZone;
    };
    return DateTimeDummy;
})();

describe("Formatter", function () {
    var dateTime;
    var formatter;
    beforeEach(function () {
        dateTime = new DateTimeDummy();
        formatter = new format.Formatter();
    });

    describe("formatEra", function () {
        it("should return BC for years > 0", function () {
            dateTime.dateYear = -1;
            var result = formatter.format(dateTime, "G");
            expect(result).to.equal("BC");
        });
        it("should return AD for years < 0", function () {
            dateTime.dateYear = 1;
            var result = formatter.format(dateTime, "G");
            expect(result).to.equal("AD");
        });
        it("should return Before Christ for years > 0", function () {
            dateTime.dateYear = -1;
            var result = formatter.format(dateTime, "GGGG");
            expect(result).to.equal("Before Christ");
        });
        it("should return Anno Domini for years < 0", function () {
            dateTime.dateYear = 1;
            var result = formatter.format(dateTime, "GGGG");
            expect(result).to.equal("Anno Domini");
        });
        it("should return B for years > 0", function () {
            dateTime.dateYear = -1;
            var result = formatter.format(dateTime, "GGGGG");
            expect(result).to.equal("B");
        });
        it("should return A for years < 0", function () {
            dateTime.dateYear = 1;
            var result = formatter.format(dateTime, "GGGGG");
            expect(result).to.equal("A");
        });
    });

    describe("formatYear", function () {
        it("should return at least one digit year for y", function () {
            dateTime.dateYear = 123;
            var result = formatter.format(dateTime, "y");
            expect(result).to.equal("123");
        });
        it("should return at least two digit year for yy", function () {
            dateTime.dateYear = 3;
            var result = formatter.format(dateTime, "yy");
            expect(result).to.equal("03");
        });
        it("should return exactly two digit year for yy", function () {
            dateTime.dateYear = 1997;
            var result = formatter.format(dateTime, "yy");
            expect(result).to.equal("97");
        });
        it("should pad to four digit year for yyyy", function () {
            dateTime.dateYear = 123;
            var result = formatter.format(dateTime, "yyyy");
            expect(result).to.equal("0123");
        });
        it("should return at least four digit year for yyyy", function () {
            dateTime.dateYear = 12345;
            var result = formatter.format(dateTime, "yyyy");
            expect(result).to.equal("12345");
        });
    });

    describe("formatQuarter", function () {
        it("should return the numerical value of the quarter of q", function () {
            dateTime.dateMonth = 1;
            var result = formatter.format(dateTime, "q");
            expect(result).to.equal("01");
        });
        it("should return the numerical value of the quarter of qq", function () {
            dateTime.dateMonth = 3;
            var result = formatter.format(dateTime, "qq");
            expect(result).to.equal("01");
        });
        it("should return the short value of the quarter of qqq", function () {
            dateTime.dateMonth = 4;
            var result = formatter.format(dateTime, "qqq");
            expect(result).to.equal("Q2");
        });
        it("should return the long value of the quarter of qqqq", function () {
            dateTime.dateMonth = 12;
            var result = formatter.format(dateTime, "qqqq");
            expect(result).to.equal("4th quarter");
        });
        it("should return only the number of the quarter of qqqq", function () {
            dateTime.dateMonth = 9;
            var result = formatter.format(dateTime, "qqqqq");
            expect(result).to.equal("3");
        });
    });

    describe("formatMonth", function () {
        it("should return just the number of the month for M", function () {
            dateTime.dateMonth = 9;
            var result = formatter.format(dateTime, "M");
            expect(result).to.equal("9");
        });
        it("should return just the number of the month for M", function () {
            dateTime.dateMonth = 11;
            var result = formatter.format(dateTime, "M");
            expect(result).to.equal("11");
        });
        it("should return just the number of the month for MM, padded to two characters", function () {
            dateTime.dateMonth = 3;
            var result = formatter.format(dateTime, "MM");
            expect(result).to.equal("03");
        });
        it("should return the shortened name of the month with MMM", function () {
            dateTime.dateMonth = 8;
            var result = formatter.format(dateTime, "MMM");
            expect(result).to.equal("Aug");
        });
        it("should return the full name of the month with MMMM", function () {
            dateTime.dateMonth = 2;
            var result = formatter.format(dateTime, "MMMM");
            expect(result).to.equal("February");
        });
        it("should return the narrow name of the month with MMMMM", function () {
            dateTime.dateMonth = 11;
            var result = formatter.format(dateTime, "MMMMM");
            expect(result).to.equal("N");
        });
    });

    describe("formatWeek", function () {
        it("should format the week number with w", function () {
            dateTime.dateWeek = 3;
            var result = formatter.format(dateTime, "w");
            expect(result).to.equal("3");
        });
        it("should format the week number with w", function () {
            dateTime.dateWeek = 16;
            var result = formatter.format(dateTime, "w");
            expect(result).to.equal("16");
        });
        it("should format the week number with ww", function () {
            dateTime.dateWeek = 8;
            var result = formatter.format(dateTime, "ww");
            expect(result).to.equal("08");
        });
        it("should format the week number with ww", function () {
            dateTime.dateWeek = 45;
            var result = formatter.format(dateTime, "ww");
            expect(result).to.equal("45");
        });
    });

    describe("formatDay", function () {
        it("should return the number of the day with d", function () {
            dateTime.dateDay = 8;
            var result = formatter.format(dateTime, "d");
            expect(result).to.equal("8");
        });
        it("should return the number of the day with d", function () {
            dateTime.dateDay = 25;
            var result = formatter.format(dateTime, "d");
            expect(result).to.equal("25");
        });
        it("should return the number of the day with dd, padded to two characters", function () {
            dateTime.dateDay = 6;
            var result = formatter.format(dateTime, "dd");
            expect(result).to.equal("06");
        });
        it.skip("should return the day of the year with D", function () {
            dateTime.dateDay = 15;
            dateTime.dateMonth = 4;
            var result = formatter.format(dateTime, "D");
            expect(result).to.equal("105");
        });
    });

    describe("formatWeekday", function () {
        it("should return the abbreviated name for E", function () {
            dateTime.dateWeekDay = 6 /* Saturday */;
            var result = formatter.format(dateTime, "E");
            expect(result).to.equal("Sat");
        });
        it("should return the abbreviated name for EE", function () {
            dateTime.dateWeekDay = 4 /* Thursday */;
            var result = formatter.format(dateTime, "EE");
            expect(result).to.equal("Thu");
        });
        it("should return the abbreviated name for EEE", function () {
            dateTime.dateWeekDay = 1 /* Monday */;
            var result = formatter.format(dateTime, "EEE");
            expect(result).to.equal("Mon");
        });
        it("should return the full name for EEEE", function () {
            dateTime.dateWeekDay = 3 /* Wednesday */;
            var result = formatter.format(dateTime, "EEEE");
            expect(result).to.equal("Wednesday");
        });
        it("should return the narrow name for EEEEE", function () {
            dateTime.dateWeekDay = 5 /* Friday */;
            var result = formatter.format(dateTime, "EEEEE");
            expect(result).to.equal("F");
        });
        it("should return the short name for EEEEEE", function () {
            dateTime.dateWeekDay = 0 /* Sunday */;
            var result = formatter.format(dateTime, "EEEEEE");
            expect(result).to.equal("Su");
        });

        it("should return the weekday number for e", function () {
            dateTime.dateWeekDay = 2 /* Tuesday */;
            var result = formatter.format(dateTime, "e");
            expect(result).to.equal("2");
        });
    });

    describe("formatDayPeriod", function () {
        it("should return AM for the morning", function () {
            dateTime.dateHour = 11;
            var result = formatter.format(dateTime, "a");
            expect(result).to.equal("AM");
        });
        it("should return PM for the afternoon", function () {
            dateTime.dateHour = 23;
            var result = formatter.format(dateTime, "a");
            expect(result).to.equal("PM");
        });
    });

    describe("formatHour", function () {
        it("should return 1-12 hour period for format h", function () {
            dateTime.dateHour = 0;
            var result = formatter.format(dateTime, "h");
            expect(result).to.equal("12");
        });
        it("should return 1-12 hour period for format h", function () {
            dateTime.dateHour = 22;
            var result = formatter.format(dateTime, "h");
            expect(result).to.equal("10");
        });
        it("should return 1-12 hour period for format hh, padding to two characters", function () {
            dateTime.dateHour = 1;
            var result = formatter.format(dateTime, "hh");
            expect(result).to.equal("01");
        });
        it("should return 1-12 hour period for format hh", function () {
            dateTime.dateHour = 20;
            var result = formatter.format(dateTime, "hh");
            expect(result).to.equal("08");
        });
        it("should return 0-11 hour period for format K", function () {
            dateTime.dateHour = 0;
            var result = formatter.format(dateTime, "K");
            expect(result).to.equal("0");
        });
        it("should return 0-11 hour period for format K", function () {
            dateTime.dateHour = 22;
            var result = formatter.format(dateTime, "K");
            expect(result).to.equal("10");
        });
        it("should return 0-11 hour period for format KK, padding to two characters", function () {
            dateTime.dateHour = 1;
            var result = formatter.format(dateTime, "KK");
            expect(result).to.equal("01");
        });
        it("should return 0-11 hour period for format KK", function () {
            dateTime.dateHour = 20;
            var result = formatter.format(dateTime, "KK");
            expect(result).to.equal("08");
        });

        it("should return 1-24 hour period for format k", function () {
            dateTime.dateHour = 0;
            var result = formatter.format(dateTime, "k");
            expect(result).to.equal("24");
        });
        it("should return 1-24 hour period for format k", function () {
            dateTime.dateHour = 22;
            var result = formatter.format(dateTime, "k");
            expect(result).to.equal("22");
        });
        it("should return 1-24 hour period for format kk, padding to two characters", function () {
            dateTime.dateHour = 1;
            var result = formatter.format(dateTime, "kk");
            expect(result).to.equal("01");
        });
        it("should return 1-24 hour period for format kk", function () {
            dateTime.dateHour = 20;
            var result = formatter.format(dateTime, "kk");
            expect(result).to.equal("20");
        });
        it("should return 0-23 hour period for format H", function () {
            dateTime.dateHour = 0;
            var result = formatter.format(dateTime, "H");
            expect(result).to.equal("0");
        });
        it("should return 0-23 hour period for format H", function () {
            dateTime.dateHour = 22;
            var result = formatter.format(dateTime, "H");
            expect(result).to.equal("22");
        });
        it("should return 0-23 hour period for format HH, padding to two characters", function () {
            dateTime.dateHour = 1;
            var result = formatter.format(dateTime, "HH");
            expect(result).to.equal("01");
        });
        it("should return 0-23 hour period for format HH", function () {
            dateTime.dateHour = 20;
            var result = formatter.format(dateTime, "HH");
            expect(result).to.equal("20");
        });
    });

    describe("formatMinute", function () {
        it("should format minutes for format m", function () {
            dateTime.dateMinute = 5;
            var result = formatter.format(dateTime, "m");
            expect(result).to.equal("5");
        });
        it("should format minutes for format m", function () {
            dateTime.dateMinute = 38;
            var result = formatter.format(dateTime, "m");
            expect(result).to.equal("38");
        });
        it("should format minutes for format mm, padding to two characters", function () {
            dateTime.dateMinute = 5;
            var result = formatter.format(dateTime, "mm");
            expect(result).to.equal("05");
        });
        it("should format minutes for format mm", function () {
            dateTime.dateMinute = 38;
            var result = formatter.format(dateTime, "mm");
            expect(result).to.equal("38");
        });
    });

    describe("formatSecond", function () {
        it("should format seconds for format s", function () {
            dateTime.dateSecond = 5;
            var result = formatter.format(dateTime, "s");
            expect(result).to.equal("5");
        });
        it("should format seconds for format s", function () {
            dateTime.dateSecond = 38;
            var result = formatter.format(dateTime, "s");
            expect(result).to.equal("38");
        });
        it("should format seconds for format ss, padding to two characters", function () {
            dateTime.dateSecond = 5;
            var result = formatter.format(dateTime, "ss");
            expect(result).to.equal("05");
        });
        it("should format seconds for format ss", function () {
            dateTime.dateSecond = 38;
            var result = formatter.format(dateTime, "ss");
            expect(result).to.equal("38");
        });

        it("should get the fraction of a second for format S", function () {
            dateTime.dateMilli = 388;
            var result = formatter.format(dateTime, "S");
            expect(result).to.equal("3");
        });
        it("should get the fraction of a second for format SS", function () {
            dateTime.dateMilli = 2;
            var result = formatter.format(dateTime, "SS");
            expect(result).to.equal("00");
        });
        it("should get the fraction of a second for format SSS", function () {
            dateTime.dateMilli = 891;
            var result = formatter.format(dateTime, "SSS");
            expect(result).to.equal("891");
        });
        it("should get the fraction of a second for format SSSS", function () {
            dateTime.dateMilli = 44;
            var result = formatter.format(dateTime, "SSSS");
            expect(result).to.equal("0440");
        });
    });

    describe.skip("formatTimeZone", function () {
        it("should get the short specific name of the timezone for format z", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "z");
            expect(result).to.equal("CEST");
        });
        it("should get the short specific name of the timezone for format z", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 2;
            var result = formatter.format(dateTime, "z");
            expect(result).to.equal("CET");
        });
        it("should get the long specific name of the timezone for format zzzz", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "zzzz");
            expect(result).to.equal("Central European Summer Time");
        });
        it("should get the long specific name of the timezone for format zzzz", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "zzzz");
            expect(result).to.equal("Central European Time");
        });

        it("should get the short specific name of the timezone for format O", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "O");
            expect(result).to.equal("GMT+2");
        });
        it("should get the short specific name of the timezone for format O", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 2;
            var result = formatter.format(dateTime, "O");
            expect(result).to.equal("GMT+1");
        });
        it("should get the short specific name of the timezone for format OOOO", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "OOOO");
            expect(result).to.equal("GMT+2:00");
        });
        it("should get the short specific name of the timezone for format OOOO", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 2;
            var result = formatter.format(dateTime, "OOOO");
            expect(result).to.equal("GMT+1:00");
        });

        it("should get the short specific name of the timezone for format v", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "z");
            expect(result).to.equal("CET");
        });
        it("should get the short specific name of the timezone for format v", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 2;
            var result = formatter.format(dateTime, "z");
            expect(result).to.equal("CET");
        });
        it("should get the long specific name of the timezone for format vvvv", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "vvvv");
            expect(result).to.equal("Central European Time");
        });
        it("should get the long specific name of the timezone for format vvvv", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            dateTime.dateMonth = 7;
            var result = formatter.format(dateTime, "vvvv");
            expect(result).to.equal("Central European Time");
        });

        it("should get the long Timezone ID for format VV", function () {
            dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
            var result = formatter.format(dateTime, "VV");
            expect(result).to.equal("Europe/Amsterdam");
        });
    });
});
//# sourceMappingURL=test-format.js.map
