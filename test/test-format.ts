

import chai = require("chai");
import expect = chai.expect;

import format = require("../lib/format");
import datetimeInterface = require("../lib/datetime-interface");
import timeZone = require("../lib/timezone");
import basics = require("../lib/basics");

/*
 * Dummy implementation of a DateTimeAccess class, for testing the Formatter
 */
class DateTimeDummy implements datetimeInterface.DateTimeAccess {
	dateYear: number;
	dateMonth: number;
	dateWeek: number;
	dateDay: number;
	dateWeekDay: basics.WeekDay;
	dateDayOfYear: number;

	dateHour: number;
	dateMinute: number;
	dateSecond: number;
	dateMilli: number;

	dateZone: timeZone.TimeZone;

	year(): number { return this.dateYear; }
	month(): number { return this.dateMonth; }
	day(): number { return this.dateDay; }
	weekDay(): basics.WeekDay { return this.dateWeekDay; }
	weekNumber(): number { return this.dateWeek; }
	dayOfYear(): number { return this.dateDayOfYear; }

	hour(): number { return this.dateHour; }
	minute(): number { return this.dateMinute; }
	second(): number { return this.dateSecond; }
	millisecond(): number { return this.dateMilli; }

	zone(): timeZone.TimeZone { return this.dateZone; }
}

describe("Formatter", (): void => {
	var dateTime: DateTimeDummy;
	var formatter: format.Formatter;
	beforeEach((): void => {
		dateTime = new DateTimeDummy();
		formatter = new format.Formatter();
	});

	describe("formatEra", (): void => {
		it("should return BC for years > 0", (): void => {
			dateTime.dateYear = -1;
			var result = formatter.format(dateTime, "G");
			expect(result).to.equal("BC");
		});
		it("should return AD for years < 0", (): void => {
			dateTime.dateYear = 1;
			var result = formatter.format(dateTime, "G");
			expect(result).to.equal("AD");
		});
		it("should return Before Christ for years > 0", (): void => {
			dateTime.dateYear = -1;
			var result = formatter.format(dateTime, "GGGG");
			expect(result).to.equal("Before Christ");
		});
		it("should return Anno Domini for years < 0", (): void => {
			dateTime.dateYear = 1;
			var result = formatter.format(dateTime, "GGGG");
			expect(result).to.equal("Anno Domini");
		});
		it("should return B for years > 0", (): void => {
			dateTime.dateYear = -1;
			var result = formatter.format(dateTime, "GGGGG");
			expect(result).to.equal("B");
		});
		it("should return A for years < 0", (): void => {
			dateTime.dateYear = 1;
			var result = formatter.format(dateTime, "GGGGG");
			expect(result).to.equal("A");
		});
	});

	describe("formatYear", (): void => {
		it("should return at least one digit year for y", (): void => {
			dateTime.dateYear = 123;
			var result = formatter.format(dateTime, "y");
			expect(result).to.equal("123");
		});
		it("should return at least two digit year for yy", (): void => {
			dateTime.dateYear = 3;
			var result = formatter.format(dateTime, "yy");
			expect(result).to.equal("03");
		});
		it("should return exactly two digit year for yy", (): void => {
			dateTime.dateYear = 1997;
			var result = formatter.format(dateTime, "yy");
			expect(result).to.equal("97");
		});
		it("should pad to four digit year for yyyy", (): void => {
			dateTime.dateYear = 123;
			var result = formatter.format(dateTime, "yyyy");
			expect(result).to.equal("0123");
		});
		it("should return at least four digit year for yyyy", (): void => {
			dateTime.dateYear = 12345;
			var result = formatter.format(dateTime, "yyyy");
			expect(result).to.equal("12345");
		});
	});

	describe("formatQuarter", (): void => {
		it("should return the numerical value of the quarter of q", (): void => {
			dateTime.dateMonth = 1;
			var result = formatter.format(dateTime, "q");
			expect(result).to.equal("01");
		});
		it("should return the numerical value of the quarter of qq", (): void => {
			dateTime.dateMonth = 3;
			var result = formatter.format(dateTime, "qq");
			expect(result).to.equal("01");
		});
		it("should return the short value of the quarter of qqq", (): void => {
			dateTime.dateMonth = 4;
			var result = formatter.format(dateTime, "qqq");
			expect(result).to.equal("Q2");
		});
		it("should return the long value of the quarter of qqqq", (): void => {
			dateTime.dateMonth = 12;
			var result = formatter.format(dateTime, "qqqq");
			expect(result).to.equal("4th quarter");
		});
		it("should return only the number of the quarter of qqqq", (): void => {
			dateTime.dateMonth = 9;
			var result = formatter.format(dateTime, "qqqqq");
			expect(result).to.equal("3");
		});
	});

	describe("formatMonth", (): void => {
		it("should return just the number of the month for M", (): void => {
			dateTime.dateMonth = 9;
			var result = formatter.format(dateTime, "M");
			expect(result).to.equal("9");
		});
		it("should return just the number of the month for M", (): void => {
			dateTime.dateMonth = 11;
			var result = formatter.format(dateTime, "M");
			expect(result).to.equal("11");
		});
		it("should return just the number of the month for MM, padded to two characters", (): void => {
			dateTime.dateMonth = 3;
			var result = formatter.format(dateTime, "MM");
			expect(result).to.equal("03");
		});
		it("should return the shortened name of the month with MMM", (): void => {
			dateTime.dateMonth = 8;
			var result = formatter.format(dateTime, "MMM");
			expect(result).to.equal("Aug");
		});
		it("should return the full name of the month with MMMM", (): void => {
			dateTime.dateMonth = 2;
			var result = formatter.format(dateTime, "MMMM");
			expect(result).to.equal("February");
		});
		it("should return the narrow name of the month with MMMMM", (): void => {
			dateTime.dateMonth = 11;
			var result = formatter.format(dateTime, "MMMMM");
			expect(result).to.equal("N");
		});
	});

	describe("formatWeek", (): void => {
		it("should format the week number with w", (): void => {
			dateTime.dateWeek = 3;
			var result = formatter.format(dateTime, "w");
			expect(result).to.equal("3");
		});
		it("should format the week number with w", (): void => {
			dateTime.dateWeek = 16;
			var result = formatter.format(dateTime, "w");
			expect(result).to.equal("16");
		});
		it("should format the week number with ww", (): void => {
			dateTime.dateWeek = 8;
			var result = formatter.format(dateTime, "ww");
			expect(result).to.equal("08");
		});
		it("should format the week number with ww", (): void => {
			dateTime.dateWeek = 45;
			var result = formatter.format(dateTime, "ww");
			expect(result).to.equal("45");
		});
	});

	describe("formatDay", (): void => {
		it("should return the number of the day with d", (): void => {
			dateTime.dateDay = 8;
			var result = formatter.format(dateTime, "d");
			expect(result).to.equal("8");
		});
		it("should return the number of the day with d", (): void => {
			dateTime.dateDay = 25;
			var result = formatter.format(dateTime, "d");
			expect(result).to.equal("25");
		});
		it("should return the number of the day with dd, padded to two characters", (): void => {
			dateTime.dateDay = 6;
			var result = formatter.format(dateTime, "dd");
			expect(result).to.equal("06");
		});
		it("should return the day of the year with D", (): void => {
			dateTime.dateDayOfYear = 105;
			var result = formatter.format(dateTime, "D");
			expect(result).to.equal("105");
		});
		it("should return the day of the year with DD", (): void => {
			dateTime.dateDayOfYear = 6;
			var result = formatter.format(dateTime, "DD");
			expect(result).to.equal("06");
		});

	});

	describe("formatWeekday", (): void => {
		it("should return the abbreviated name for E", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Saturday;
			var result = formatter.format(dateTime, "E");
			expect(result).to.equal("Sat");
		});
		it("should return the abbreviated name for EE", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Thursday;
			var result = formatter.format(dateTime, "EE");
			expect(result).to.equal("Thu");
		});
		it("should return the abbreviated name for EEE", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Monday;
			var result = formatter.format(dateTime, "EEE");
			expect(result).to.equal("Mon");
		});
		it("should return the full name for EEEE", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Wednesday;
			var result = formatter.format(dateTime, "EEEE");
			expect(result).to.equal("Wednesday");
		});
		it("should return the narrow name for EEEEE", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Friday;
			var result = formatter.format(dateTime, "EEEEE");
			expect(result).to.equal("F");
		});
		it("should return the short name for EEEEEE", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Sunday;
			var result = formatter.format(dateTime, "EEEEEE");
			expect(result).to.equal("Su");
		});

		it("should return the weekday number for e", (): void => {
			dateTime.dateWeekDay = basics.WeekDay.Tuesday;
			var result = formatter.format(dateTime, "e");
			expect(result).to.equal("2");
		});
	});

	describe("formatDayPeriod", (): void => {
		it("should return AM for the morning", (): void => {
			dateTime.dateHour = 11;
			var result = formatter.format(dateTime, "a");
			expect(result).to.equal("AM");
		});
		it("should return PM for the afternoon", (): void => {
			dateTime.dateHour = 23;
			var result = formatter.format(dateTime, "a");
			expect(result).to.equal("PM");
		});
	});

	describe("formatHour", (): void => {
		it("should return 1-12 hour period for format h", (): void => {
			dateTime.dateHour = 0;
			var result = formatter.format(dateTime, "h");
			expect(result).to.equal("12");
		});
		it("should return 1-12 hour period for format h", (): void => {
			dateTime.dateHour = 22;
			var result = formatter.format(dateTime, "h");
			expect(result).to.equal("10");
		});
		it("should return 1-12 hour period for format hh, padding to two characters", (): void => {
			dateTime.dateHour = 1;
			var result = formatter.format(dateTime, "hh");
			expect(result).to.equal("01");
		});
		it("should return 1-12 hour period for format hh", (): void => {
			dateTime.dateHour = 20;
			var result = formatter.format(dateTime, "hh");
			expect(result).to.equal("08");
		});
		it("should return 0-11 hour period for format K", (): void => {
			dateTime.dateHour = 0;
			var result = formatter.format(dateTime, "K");
			expect(result).to.equal("0");
		});
		it("should return 0-11 hour period for format K", (): void => {
			dateTime.dateHour = 22;
			var result = formatter.format(dateTime, "K");
			expect(result).to.equal("10");
		});
		it("should return 0-11 hour period for format KK, padding to two characters", (): void => {
			dateTime.dateHour = 1;
			var result = formatter.format(dateTime, "KK");
			expect(result).to.equal("01");
		});
		it("should return 0-11 hour period for format KK", (): void => {
			dateTime.dateHour = 20;
			var result = formatter.format(dateTime, "KK");
			expect(result).to.equal("08");
		});

		it("should return 1-24 hour period for format k", (): void => {
			dateTime.dateHour = 0;
			var result = formatter.format(dateTime, "k");
			expect(result).to.equal("24");
		});
		it("should return 1-24 hour period for format k", (): void => {
			dateTime.dateHour = 22;
			var result = formatter.format(dateTime, "k");
			expect(result).to.equal("22");
		});
		it("should return 1-24 hour period for format kk, padding to two characters", (): void => {
			dateTime.dateHour = 1;
			var result = formatter.format(dateTime, "kk");
			expect(result).to.equal("01");
		});
		it("should return 1-24 hour period for format kk", (): void => {
			dateTime.dateHour = 20;
			var result = formatter.format(dateTime, "kk");
			expect(result).to.equal("20");
		});
		it("should return 0-23 hour period for format H", (): void => {
			dateTime.dateHour = 0;
			var result = formatter.format(dateTime, "H");
			expect(result).to.equal("0");
		});
		it("should return 0-23 hour period for format H", (): void => {
			dateTime.dateHour = 22;
			var result = formatter.format(dateTime, "H");
			expect(result).to.equal("22");
		});
		it("should return 0-23 hour period for format HH, padding to two characters", (): void => {
			dateTime.dateHour = 1;
			var result = formatter.format(dateTime, "HH");
			expect(result).to.equal("01");
		});
		it("should return 0-23 hour period for format HH", (): void => {
			dateTime.dateHour = 20;
			var result = formatter.format(dateTime, "HH");
			expect(result).to.equal("20");
		});
	});

	describe("formatMinute", (): void => {
		it("should format minutes for format m", (): void => {
			dateTime.dateMinute = 5;
			var result = formatter.format(dateTime, "m");
			expect(result).to.equal("5");
		});
		it("should format minutes for format m", (): void => {
			dateTime.dateMinute = 38;
			var result = formatter.format(dateTime, "m");
			expect(result).to.equal("38");
		});
		it("should format minutes for format mm, padding to two characters", (): void => {
			dateTime.dateMinute = 5;
			var result = formatter.format(dateTime, "mm");
			expect(result).to.equal("05");
		});
		it("should format minutes for format mm", (): void => {
			dateTime.dateMinute = 38;
			var result = formatter.format(dateTime, "mm");
			expect(result).to.equal("38");
		});
	});

	describe("formatSecond", (): void => {
		it("should format seconds for format s", (): void => {
			dateTime.dateSecond = 5;
			var result = formatter.format(dateTime, "s");
			expect(result).to.equal("5");
		});
		it("should format seconds for format s", (): void => {
			dateTime.dateSecond = 38;
			var result = formatter.format(dateTime, "s");
			expect(result).to.equal("38");
		});
		it("should format seconds for format ss, padding to two characters", (): void => {
			dateTime.dateSecond = 5;
			var result = formatter.format(dateTime, "ss");
			expect(result).to.equal("05");
		});
		it("should format seconds for format ss", (): void => {
			dateTime.dateSecond = 38;
			var result = formatter.format(dateTime, "ss");
			expect(result).to.equal("38");
		});

		it("should get the fraction of a second for format S", (): void => {
			dateTime.dateMilli = 388;
			var result = formatter.format(dateTime, "S");
			expect(result).to.equal("3");
		});
		it("should get the fraction of a second for format SS", (): void => {
			dateTime.dateMilli = 2;
			var result = formatter.format(dateTime, "SS");
			expect(result).to.equal("00");
		});
		it("should get the fraction of a second for format SSS", (): void => {
			dateTime.dateMilli = 891;
			var result = formatter.format(dateTime, "SSS");
			expect(result).to.equal("891");
		});
		it("should get the fraction of a second for format SSSS", (): void => {
			dateTime.dateMilli = 44;
			var result = formatter.format(dateTime, "SSSS");
			expect(result).to.equal("0440");
		});
	});

	describe.skip("formatTimeZone", (): void => {
		it("should get the short specific name of the timezone for format z", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "z");
			expect(result).to.equal("CEST");
		});
		it("should get the short specific name of the timezone for format z", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 2;
			var result = formatter.format(dateTime, "z");
			expect(result).to.equal("CET");
		});
		it("should get the long specific name of the timezone for format zzzz", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "zzzz");
			expect(result).to.equal("Central European Summer Time");
		});
		it("should get the long specific name of the timezone for format zzzz", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "zzzz");
			expect(result).to.equal("Central European Time");
		});

		it("should get the short specific name of the timezone for format O", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "O");
			expect(result).to.equal("GMT+2");
		});
		it("should get the short specific name of the timezone for format O", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 2;
			var result = formatter.format(dateTime, "O");
			expect(result).to.equal("GMT+1");
		});
		it("should get the short specific name of the timezone for format OOOO", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "OOOO");
			expect(result).to.equal("GMT+2:00");
		});
		it("should get the short specific name of the timezone for format OOOO", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 2;
			var result = formatter.format(dateTime, "OOOO");
			expect(result).to.equal("GMT+1:00");
		});

		it("should get the short specific name of the timezone for format v", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "z");
			expect(result).to.equal("CET");
		});
		it("should get the short specific name of the timezone for format v", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 2;
			var result = formatter.format(dateTime, "z");
			expect(result).to.equal("CET");
		});
		it("should get the long specific name of the timezone for format vvvv", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "vvvv");
			expect(result).to.equal("Central European Time");
		});
		it("should get the long specific name of the timezone for format vvvv", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			dateTime.dateMonth = 7;
			var result = formatter.format(dateTime, "vvvv");
			expect(result).to.equal("Central European Time");
		});

		it("should get the long Timezone ID for format VV", (): void => {
			dateTime.dateZone = new timeZone.TimeZone("Europe/Amsterdam");
			var result = formatter.format(dateTime, "VV");
			expect(result).to.equal("Europe/Amsterdam");
		});

	});
});
