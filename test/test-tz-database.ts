/// <reference path="../typings/test.d.ts" />

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
import OnType = tzDatabase.OnType;
import RuleType = tzDatabase.RuleType;
import RuleInfo = tzDatabase.RuleInfo;
import ToType = tzDatabase.ToType;
import Transition = tzDatabase.Transition;
import TzDatabase = tzDatabase.TzDatabase;
import ZoneInfo = tzDatabase.ZoneInfo;

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
	});

	describe("getTransitionsAround()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(util.inspect(TzDatabase.instance().getTransitionsAround("EU", 2014, Duration.hours(1)))).
				to.equal(util.inspect([
					new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(),
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
						)
					),
					new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(),
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
						),
					new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(),
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
							)
						),
					new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(),
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
						),
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
});
