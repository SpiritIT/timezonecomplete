/// <reference path="../typings/test.d.ts" />

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;
import util = require("util");

import basics = require("../lib/basics");
import duration = require("../lib/duration");
import tzDatabase = require("../lib/tz-database");

import TimeStruct = basics.TimeStruct;
import WeekDay = basics.WeekDay;

import Duration = duration.Duration;

import AtType = tzDatabase.AtType;
import NormalizeOption = tzDatabase.NormalizeOption;
import OnType = tzDatabase.OnType;
import RuleType = tzDatabase.RuleType;
import RuleInfo = tzDatabase.RuleInfo;
import ToType = tzDatabase.ToType;
import Transition = tzDatabase.Transition;
import TzDatabase = tzDatabase.TzDatabase;
import ZoneInfo = tzDatabase.ZoneInfo;

// inject test data into TzDatabase
/* tslint:disable */
var testData = require("./test-timezone-data.json");
TzDatabase.inject(testData);
/* tslint:enable */


describe("RuleInfo", (): void => {
	describe("effectiveDate()", (): void => {
		it("should work for DayNum", (): void => {
			var ri = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(1969)).to.deep.equal(new TimeStruct(1969, 3, 25));
		});
		it("should work for GreqX", (): void => {
			var ri = new RuleInfo(2014, ToType.Year, 2015, "-", 8, OnType.GreqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(2014)).to.deep.equal(new TimeStruct(2014, 8, 17));
		});
		it("should work for LeqX", (): void => {
			var ri = new RuleInfo(2014, ToType.Year, 2015, "-", 8, OnType.LeqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(2014)).to.deep.equal(new TimeStruct(2014, 8, 10));
		});
		it("should work for LastX", (): void => {
			var ri = new RuleInfo(2014, ToType.Year, 2015, "-", 8, OnType.LastX, 0, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(2014)).to.deep.equal(new TimeStruct(2014, 8, 31));
		});
		it("should throw if not applicable", (): void => {
			var ri = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			assert.throws((): void => {
				ri.effectiveDate(1968);
			});
			assert.throws((): void => {
				ri.effectiveDate(1978);
			});
		});
	});

	describe("effectiveLess()", (): void => {
		it("should work for different from", (): void => {
			var ri1 = new RuleInfo(1968, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.be.true;
			expect(ri2.effectiveLess(ri1)).to.be.false;
		});
		it("should work for different inMonth", (): void => {
			var ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 2, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.be.true;
			expect(ri2.effectiveLess(ri1)).to.be.false;
		});
		it("should work for different effective date", (): void => {
			var ri1 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.DayNum, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.GreqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.be.true;
			expect(ri2.effectiveLess(ri1)).to.be.false;
		});
		it("should work for equal", (): void => {
			var ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.be.false;
			expect(ri2.effectiveLess(ri1)).to.be.false;
		});
	});

	describe("effectiveEqual()", (): void => {
		it("should work for different from", (): void => {
			var ri1 = new RuleInfo(1968, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.be.false;
			expect(ri2.effectiveEqual(ri1)).to.be.false;
		});
		it("should work for different inMonth", (): void => {
			var ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 2, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.be.false;
			expect(ri2.effectiveEqual(ri1)).to.be.false;
		});
		it("should work for different effective date", (): void => {
			var ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 26, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.be.false;
			expect(ri2.effectiveEqual(ri1)).to.be.false;
		});
		it("should work for equal objects", (): void => {
			var ri1 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.DayNum, 17, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.DayNum, 17, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.be.true;
			expect(ri2.effectiveEqual(ri1)).to.be.true;
		});
		it("should work for equivalent effective date specified differently", (): void => {
			var ri1 = new RuleInfo(2014, ToType.Year, 2014, "-", 8, OnType.DayNum, 17, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			var ri2 = new RuleInfo(2014, ToType.Year, 2014, "-", 8, OnType.GreqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.be.true;
			expect(ri2.effectiveEqual(ri1)).to.be.true;
		});
	});
});

describe("TzDatabase", (): void => {

	describe("parseRuleType()", (): void => {
		it("should work for hyphens", (): void => {
			expect(TzDatabase.instance().parseRuleType("-")).to.equal(RuleType.None);
		});
		it("should work for offsets", (): void => {
			expect(TzDatabase.instance().parseRuleType("0")).to.equal(RuleType.Offset);
			expect(TzDatabase.instance().parseRuleType("1")).to.equal(RuleType.Offset);
			expect(TzDatabase.instance().parseRuleType("1:00")).to.equal(RuleType.Offset);
			expect(TzDatabase.instance().parseRuleType("-1:00")).to.equal(RuleType.Offset);
			expect(TzDatabase.instance().parseRuleType("-23:23:59")).to.equal(RuleType.Offset);
			expect(TzDatabase.instance().parseRuleType("+23:23:59")).to.equal(RuleType.Offset);
		});
		it("should work for names", (): void => {
			expect(TzDatabase.instance().parseRuleType("Harrie")).to.equal(RuleType.RuleName);
		});
	});

	describe("parseToType()", (): void => {
		it("should work for max", (): void => {
			expect(TzDatabase.instance().parseToType("max")).to.equal(ToType.Max);
		});
		it("should work for only and return Year", (): void => {
			expect(TzDatabase.instance().parseToType("only")).to.equal(ToType.Year);
		});
		it("should work for year", (): void => {
			expect(TzDatabase.instance().parseToType("1972")).to.equal(ToType.Year);
		});
		it("should throw for invalid TO type", (): void => {
			assert.throws((): void => {
				TzDatabase.instance().parseToType("NaN");
			});
		});
	});

	describe("parseOnType()", (): void => {
		it("should work for day number", (): void => {
			expect(TzDatabase.instance().parseOnType("23")).to.equal(OnType.DayNum);
		});
		it("should work for >= X", (): void => {
			expect(TzDatabase.instance().parseOnType("Sun>=3")).to.equal(OnType.GreqX);
		});
		it("should work for <= X", (): void => {
			expect(TzDatabase.instance().parseOnType("Sun<=3")).to.equal(OnType.LeqX);
		});
		it("should work for lastX", (): void => {
			expect(TzDatabase.instance().parseOnType("lastMon")).to.equal(OnType.LastX);
		});
	});

	describe("parseOnDay()", (): void => {
		it("should work for day number", (): void => {
			expect(TzDatabase.instance().parseOnDay("23", OnType.DayNum)).to.equal(23);
		});
		it("should work for >= X", (): void => {
			expect(TzDatabase.instance().parseOnDay("Sun>=23", OnType.GreqX)).to.equal(23);
		});
		it("should work for <= X", (): void => {
			expect(TzDatabase.instance().parseOnDay("Sun<=23", OnType.LeqX)).to.equal(23);
		});
		it("should work for lastX", (): void => {
			expect(TzDatabase.instance().parseOnDay("lastSun", OnType.LastX)).to.equal(0);
		});
	});

	describe("parseOnWeekDay()", (): void => {
		it("should work for day number", (): void => {
			expect(TzDatabase.instance().parseOnWeekDay("23")).to.equal(WeekDay.Sunday);
		});
		it("should work for >= X", (): void => {
			expect(TzDatabase.instance().parseOnWeekDay("Mon>=23")).to.equal(WeekDay.Monday);
		});
		it("should work for <= X", (): void => {
			expect(TzDatabase.instance().parseOnWeekDay("Wed<=23")).to.equal(WeekDay.Wednesday);
		});
		it("should work for lastX", (): void => {
			expect(TzDatabase.instance().parseOnWeekDay("lastThu")).to.equal(WeekDay.Thursday);
		});
	});

	describe("parseAtType()", (): void => {
		it("should work for chars", (): void => {
			expect(TzDatabase.instance().parseAtType("s")).to.equal(AtType.Standard);
			expect(TzDatabase.instance().parseAtType("w")).to.equal(AtType.Wall);
			expect(TzDatabase.instance().parseAtType("g")).to.equal(AtType.Utc);
			expect(TzDatabase.instance().parseAtType("z")).to.equal(AtType.Utc);
			expect(TzDatabase.instance().parseAtType("u")).to.equal(AtType.Utc);
		});
		it("should work for empty", (): void => {
			expect(TzDatabase.instance().parseAtType("")).to.equal(AtType.Wall);
		});
		it("should work for null", (): void => {
			expect(TzDatabase.instance().parseAtType("")).to.equal(AtType.Wall);
		});
		it("should default to Wall", (): void => {
			expect(TzDatabase.instance().parseAtType("k")).to.equal(AtType.Wall);
		});
	});

	describe("getZoneInfos()", (): void => {
		it("should work for normal zones", (): void => {
			expect(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam"))).to.equal(
				util.inspect([
				new ZoneInfo(
					Duration.minutes(19.53333333333333),
					RuleType.None,
					Duration.hours(0),
					"",
					"LMT",
					-4228761600000
				),
				new ZoneInfo(
					Duration.minutes(19.53333333333333),
					RuleType.RuleName,
					Duration.hours(0),
					"Neth",
					"%s",
					-1025740800000
				),
				new ZoneInfo(
					Duration.minutes(20),
					RuleType.RuleName,
					Duration.hours(0),
					"Neth",
					"NE%sT",
					-935020800000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"C-Eur",
					"CE%sT",
					-781048800000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"Neth",
					"CE%sT",
					252374400000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"EU",
					"CE%sT",
					null
				)
			]));
		});
		it("should work for linked zones", (): void => {
			expect(TzDatabase.instance().getZoneInfos("Arctic/Longyearbyen")).to.deep.equal(
				TzDatabase.instance().getZoneInfos("Europe/Oslo"));
		});
	});

	describe("getRuleInfos()", (): void => {
		it("should work for normal zones", (): void => {
			expect(util.inspect(TzDatabase.instance().getRuleInfos("EU"))).to.equal(
				util.inspect([
					new RuleInfo(
						1977,
						ToType.Year,
						1980,
						"-",
						4,
						OnType.GreqX,
						1,
						WeekDay.Sunday,
						1, 0, 0, AtType.Utc,
						Duration.hours(1),
						"S"
					),
					new RuleInfo(
						1977,
						ToType.Year,
						1977,
						"-",
						9,
						OnType.LastX,
						0,
						WeekDay.Sunday,
						1, 0, 0, AtType.Utc,
						Duration.hours(0),
						""
					),
					new RuleInfo(
						1978,
						ToType.Year,
						1978,
						"-",
						10,
						OnType.DayNum,
						1,
						WeekDay.Sunday,
						1, 0, 0, AtType.Utc,
						Duration.hours(0),
						""
					),
					new RuleInfo(
						1979,
						ToType.Year,
						1995,
						"-",
						9,
						OnType.LastX,
						0,
						WeekDay.Sunday,
						1, 0, 0, AtType.Utc,
						Duration.hours(0),
						""
					),
					new RuleInfo(
						1981,
						ToType.Max,
						0,
						"-",
						3,
						OnType.LastX,
						0,
						WeekDay.Sunday,
						1, 0, 0, AtType.Utc,
						Duration.hours(1),
						"S"
					),
					new RuleInfo(
						1996,
						ToType.Max,
						0,
						"-",
						10,
						OnType.LastX,
						0,
						WeekDay.Sunday,
						1, 0, 0, AtType.Utc,
						Duration.hours(0),
						""
					)
				]));
		});

		it("should throw for invalid rule name", (): void => {
			assert.throws((): void => {
				TzDatabase.instance().getRuleInfos("rubbish");
			});
		});
	});

	describe("getZoneInfo()", (): void => {
		it("should work", (): void => {
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", -4228761600001)))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[0]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", -4228761600000)))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[1]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374399999)))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[4]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374400000)))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374400001)))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
		});
		it("should throw for invalid zone name", (): void => {
			assert.throws((): void => {
				TzDatabase.instance().getZoneInfo("rubbish", 0);
			});
		});
	});

	describe("zoneIsUtc()", (): void => {
		it("should return true for equivalent zones", (): void => {
			expect(TzDatabase.instance().zoneIsUtc("Etc/GMT")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Etc/GMT+0")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Etc/UCT")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Etc/Universal")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Etc/UTC")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Etc/Zulu")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("GMT")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("GMT+0")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("GMT0")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("GMT-0")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Greenwich")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Universal")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("UTC")).to.be.true;
			expect(TzDatabase.instance().zoneIsUtc("Zulu")).to.be.true;
		});
		it("should return false for non-utc zones", (): void => {
			expect(TzDatabase.instance().zoneIsUtc("Europe/Amsterdam")).to.be.false;
			expect(TzDatabase.instance().zoneIsUtc("W-SU")).to.be.false;
		});
	});

	describe("getTransitionsDstOffsets()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(util.inspect(TzDatabase.instance().getTransitionsDstOffsets("EU", 2013, 2014, Duration.hours(1)))).
				to.equal(util.inspect([
					new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), "S"),
					new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0), ""),
					new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), "S"),
					new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0), ""),
				]));
		});
		// todors other types of rules
	});

	describe("getTransitionsTotalOffsets()", (): void => {
		it("should work for UTC", (): void => {
			expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Etc/GMT", 2013, 2014))).
				to.equal(util.inspect([
					new Transition((new TimeStruct(2013, 1, 1, 0, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0), ""),
				]));
		});
		it("should work for single zone info", (): void => {
			expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Europe/Amsterdam", 2013, 2014))).
				to.equal(util.inspect([
					new Transition(252374400000, Duration.hours(1), ""), // time zone offset
					new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(2), "S"),
					new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), ""),
					new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(2), "S"),
					new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), ""),
				]));
		});
		it("should add zone info transition", (): void => {
			expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Africa/Porto-Novo", 1969, 1969))).
				to.equal(util.inspect([
					new Transition(-1131235200000, Duration.hours(1), ""),
				]));
		});
	});

	describe("dstOffsetForRule()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs(),	Duration.hours(1)).hours()).to.equal(0);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(1);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (new TimeStruct(2014, 3, 30, 1, 0, 0, 1)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(1);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (new TimeStruct(2014, 10, 26, 0, 59, 59, 999)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(1);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(0);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (new TimeStruct(2014, 10, 26, 1, 0, 0, 1)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(0);
		});
	});

	describe("totalOffset()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 1, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(1);
		});
		it("should work for zones that have a fixed DST offset", (): void => {
			expect(TzDatabase.instance().totalOffset(
				"Pacific/Apia", 1325203100000).hours()).to.equal(-10);
		});
		// todors more info
	});

	describe("abbreviation()", (): void => {
		it("should work for zones with rules", (): void => {
			expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs())).
				to.equal("CET");
			expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs())).
				to.equal("CEST");
		});
		it("should work around zone changes", (): void => {
			expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", 1388534399999)).
				to.equal("TIR");
			expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", 1388534400000)).
				to.equal("TST");
			expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", 1388534400)).
				to.equal("TIR");
		});
		it("should work for zones that have a fixed DST offset", (): void => {
			expect(TzDatabase.instance().abbreviation("Africa/Algiers", -1855958400001)).to.equal("PMT");
		});
		it("should ignore DST if required so", (): void => {
			expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), false)).
				to.equal("CET");
		});
	});

	describe("totalOffsetLocal()", (): void => {
		it("should work for UTC", (): void => {
			expect(TzDatabase.instance().totalOffset(
				"Etc/GMT", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(0);
		});
		it("should work for normal local time", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 1, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 12, 31, 23, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 7, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
		});
		it("should work around DST forward (1h)", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 3, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 3, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(2);
		});
		it("should normalize non-existing times up", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 2, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 2, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(2);
		});
		it("should work around DST backward (1h)", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 2, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 3, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
		});
		it("should work for time before first time zone info object", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"America/Swift_Current", -3030227200000).minutes()).to.be.within(-432, -431);
		});
		it("should work for time zones with fixed DST offset", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"TEST/OnlyOffset", -2486678340001).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"TEST/OnlyOffset", -1486678340001).hours()).to.equal(3);
		});
		it("should work for time zones with rule starting at start of zone", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"TEST/ImmediateRule", (new TimeStruct(2013, 12, 31, 23, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"TEST/ImmediateRule", (new TimeStruct(2014, 1, 1, 0, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"TEST/ImmediateRule", (new TimeStruct(2014, 1, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
		});
	});


	describe("standardOffset()", (): void => {
		it("should work", (): void => {
			// before first zone info
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", -4228761600001).minutes()).to.be.within(19.5, 19.6);
			// at until of first zone info (return next)
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", -4228761600000).minutes()).to.be.within(19.5, 19.6);
			// before until of third zone info
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", -935020800001).minutes()).to.equal(20);
			// at until of third zone info (return fourth)
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", -935020800000).hours()).to.equal(1);
			// after last zone info
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
		});
	});

	describe("minDstSave()", (): void => {
		it("should return the minimum for the entire database", (): void => {
			expect(TzDatabase.instance().minDstSave().minutes()).to.equal(20);
		});
		it("should return zero for zone without DST", (): void => {
			expect(TzDatabase.instance().minDstSave("Etc/GMT").hours()).to.equal(0);
		});
		it("should work for zone with fixed DST offset", (): void => {
			expect(TzDatabase.instance().minDstSave("TEST/OnlyOffset").hours()).to.equal(1);
		});
		it("should return 1 for Europe/Amsterdam", (): void => {
			expect(TzDatabase.instance().minDstSave("Europe/Amsterdam").hours()).to.equal(1);
		});
	});

	describe("maxDstSave()", (): void => {
		it("should return the maximum for the entire database", (): void => {
			expect(TzDatabase.instance().maxDstSave().minutes()).to.equal(120);
		});
		it("should return zero for zone without DST", (): void => {
			expect(TzDatabase.instance().maxDstSave("Etc/GMT").hours()).to.equal(0);
		});
		it("should work for zone with fixed DST offset", (): void => {
			expect(TzDatabase.instance().maxDstSave("TEST/OnlyOffset").hours()).to.equal(2);
		});
		it("should return 1 for Europe/Amsterdam", (): void => {
			expect(TzDatabase.instance().maxDstSave("Europe/Amsterdam").hours()).to.equal(1);
		});
	});

	describe("hasDst()", (): void => {
		it("should return true for zone with DST", (): void => {
			expect(TzDatabase.instance().hasDst("Europe/Amsterdam")).to.be.true;
		});
		it("should return false for zone with DST", (): void => {
			expect(TzDatabase.instance().hasDst("Etc/GMT")).to.be.false;
		});
	});

	describe("normalizeLocal()", (): void => {
		it("should not change dates outside DST changes", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 8, 14, 3, 0, 0, 0))).to.deep.equal(
				new TimeStruct(2014, 8, 14, 3, 0, 0, 0));
		});
		it("should not change dates around DST backward changes", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 10, 26, 1, 0, 0, 0))).to.deep.equal(
				new TimeStruct(2014, 10, 26, 1, 0, 0, 0));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 10, 26, 2, 0, 0, 0))).to.deep.equal(
				new TimeStruct(2014, 10, 26, 2, 0, 0, 0));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 10, 26, 0, 59, 59, 999))).to.deep.equal(
				new TimeStruct(2014, 10, 26, 0, 59, 59, 999));
		});
		it("should round up date during DST forward change", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 0))).to.deep.equal(
				new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 1))).to.deep.equal(
				new TimeStruct(2014, 3, 30, 3, 0, 0, 1));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 59, 59, 999))).to.deep.equal(
				new TimeStruct(2014, 3, 30, 3, 59, 59, 999));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 1, 59, 59, 999))).to.deep.equal(
				new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 3, 0, 0, 0))).to.deep.equal(
				new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
		});
		it("should round down date during DST forward change", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 0), NormalizeOption.Down)).to.deep.equal(
				new TimeStruct(2014, 3, 30, 1, 0, 0, 0));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 1), NormalizeOption.Down)).to.deep.equal(
				new TimeStruct(2014, 3, 30, 1, 0, 0, 1));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 59, 59, 999), NormalizeOption.Down)).to.deep.equal(
				new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 1, 59, 59, 999), NormalizeOption.Down)).to.deep.equal(
				new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", new TimeStruct(2014, 3, 30, 3, 0, 0, 0), NormalizeOption.Down)).to.deep.equal(
				new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
		});
	});
});
