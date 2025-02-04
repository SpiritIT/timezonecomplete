/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 */

"use strict";

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";
import * as util from "util";

import {
	AtType, Duration, NormalizeOption, OnType, RuleInfo, RuleType, TimeStruct, ToType, Transition, TzDatabase, WeekDay, ZoneInfo
} from "../lib/index";

// inject test data into TzDatabase
/* tslint:disable */
const testData = require("./test-timezone-data.json");
/* tslint:enable */

/* tslint:disable:max-line-length */


describe("RuleInfo", (): void => {
	describe("effectiveDate()", (): void => {
		it("should work for DayNum", (): void => {
			const ri = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(1969)).to.deep.equal(TimeStruct.fromComponents(1969, 3, 25, 0, 0, 0, 0));
		});
		it("should work for GreqX", (): void => {
			const ri = new RuleInfo(2014, ToType.Year, 2015, "-", 8, OnType.GreqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(2014)).to.deep.equal(TimeStruct.fromComponents(2014, 8, 17, 0, 0, 0, 0));
		});
		it("should work for LeqX", (): void => {
			const ri = new RuleInfo(2014, ToType.Year, 2015, "-", 8, OnType.LeqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(2014)).to.deep.equal(TimeStruct.fromComponents(2014, 8, 10, 0, 0, 0, 0));
		});
		it("should work for LastX", (): void => {
			const ri = new RuleInfo(2014, ToType.Year, 2015, "-", 8, OnType.LastX, 0, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri.effectiveDate(2014)).to.deep.equal(TimeStruct.fromComponents(2014, 8, 31, 0, 0, 0, 0));
		});
		it("should throw if not applicable", (): void => {
			const ri = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
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
			const ri1 = new RuleInfo(1968, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.equal(true);
			expect(ri2.effectiveLess(ri1)).to.equal(false);
		});
		it("should work for different inMonth", (): void => {
			const ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 2, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.equal(true);
			expect(ri2.effectiveLess(ri1)).to.equal(false);
		});
		it("should work for different effective date", (): void => {
			const ri1 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.DayNum, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.GreqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.equal(true);
			expect(ri2.effectiveLess(ri1)).to.equal(false);
		});
		it("should work for equal", (): void => {
			const ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveLess(ri2)).to.equal(false);
			expect(ri2.effectiveLess(ri1)).to.equal(false);
		});
	});

	describe("effectiveEqual()", (): void => {
		it("should work for different from", (): void => {
			const ri1 = new RuleInfo(1968, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.equal(false);
			expect(ri2.effectiveEqual(ri1)).to.equal(false);
		});
		it("should work for different inMonth", (): void => {
			const ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 2, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.equal(false);
			expect(ri2.effectiveEqual(ri1)).to.equal(false);
		});
		it("should work for different effective date", (): void => {
			const ri1 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 25, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(1969, ToType.Year, 1977, "-", 3, OnType.DayNum, 26, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.equal(false);
			expect(ri2.effectiveEqual(ri1)).to.equal(false);
		});
		it("should work for equal objects", (): void => {
			const ri1 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.DayNum, 17, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(2014, ToType.Year, 2014, "-", 3, OnType.DayNum, 17, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.equal(true);
			expect(ri2.effectiveEqual(ri1)).to.equal(true);
		});
		it("should work for equivalent effective date specified differently", (): void => {
			const ri1 = new RuleInfo(2014, ToType.Year, 2014, "-", 8, OnType.DayNum, 17, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			const ri2 = new RuleInfo(2014, ToType.Year, 2014, "-", 8, OnType.GreqX, 15, WeekDay.Sunday, 0, 0, 0, AtType.Utc, Duration.hours(0), "S");
			expect(ri1.effectiveEqual(ri2)).to.equal(true);
			expect(ri2.effectiveEqual(ri1)).to.equal(true);
		});
	});
});

describe("TzDatabase", (): void => {

	describe("zoneNames()", (): void => {
		it("should contain zone names", (): void => {
			expect(TzDatabase.instance().zoneNames().indexOf("America/Chicago")).to.be.greaterThan(-1);
			expect(TzDatabase.instance().zoneNames().indexOf("UTC")).to.be.greaterThan(-1);
		});
	});

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
			expect(TzDatabase.instance().parseAtType(null)).to.equal(AtType.Wall);
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
					Duration.minutes(17.5),
					RuleType.None,
					Duration.hours(0),
					"",
					"LMT",
					-2808604800000
				),
				new ZoneInfo(
					Duration.minutes(17.5),
					RuleType.None,
					Duration.hours(0),
					"",
					"BMT",
					-2450994150000
				),
				new ZoneInfo(
					Duration.minutes(-0),
					RuleType.None,
					Duration.hours(0),
					"",
					"WET",
					-1740355200000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.None,
					Duration.hours(0),
					"",
					"CET",
					-1693699200000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"C-Eur",
					"CE%sT",
					-1613826000000
				),
				new ZoneInfo(
					Duration.minutes(-0),
					RuleType.RuleName,
					Duration.hours(0),
					"Belgium",
					"WE%sT",
					-934668000000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"C-Eur",
					"CE%sT",
					-799286400000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"Belgium",
					"CE%sT",
					252374400000
				),
				new ZoneInfo(
					Duration.minutes(60),
					RuleType.RuleName,
					Duration.hours(0),
					"EU",
					"CE%sT"
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
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", new TimeStruct(-2808604800001))))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[0]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", new TimeStruct(-2808604800000))))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[1]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", new TimeStruct(-1613826000001))))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[4]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", new TimeStruct(-1613826000000))))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
			expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", new TimeStruct(-934668000001))))
				.to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
		});
		it("should throw for invalid zone name", (): void => {
			assert.throws((): void => {
				TzDatabase.instance().getZoneInfo("rubbish", new TimeStruct(0));
			});
		});
	});

	describe("zoneIsUtc()", (): void => {
		it("should return true for equivalent zones", (): void => {
			expect(TzDatabase.instance().zoneIsUtc("Etc/GMT")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Etc/GMT+0")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Etc/UCT")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Etc/Universal")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Etc/UTC")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Etc/Zulu")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("GMT")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("GMT+0")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("GMT0")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("GMT-0")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Greenwich")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Universal")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("UTC")).to.equal(true);
			expect(TzDatabase.instance().zoneIsUtc("Zulu")).to.equal(true);
		});
		it("should return false for non-utc zones", (): void => {
			expect(TzDatabase.instance().zoneIsUtc("Europe/Amsterdam")).to.equal(false);
			expect(TzDatabase.instance().zoneIsUtc("W-SU")).to.equal(false);
		});
	});

	describe("getTransitionsDstOffsets()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(TzDatabase.instance().getTransitionsDstOffsets("EU", 2013, 2014, Duration.hours(1))).
				to.deep.equal([
					new Transition((TimeStruct.fromComponents(2013, 3, 31, 1, 0, 0, 0)).unixMillis, Duration.hours(1), "S"),
					new Transition((TimeStruct.fromComponents(2013, 10, 27, 1, 0, 0, 0)).unixMillis, Duration.hours(0), ""),
					new Transition((TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0)).unixMillis, Duration.hours(1), "S"),
					new Transition((TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 0)).unixMillis, Duration.hours(0), ""),
				]);
		});
		// todors other types of rules
	});

	describe("getTransitionsTotalOffsets()", (): void => {
		it("should work for UTC", (): void => {
			expect(TzDatabase.instance().getTransitionsTotalOffsets("Etc/UTC", 2013, 2014)).
				to.deep.equal([
					new Transition((TimeStruct.fromComponents(2013, 1, 1, 0, 0, 0, 0)).unixMillis, Duration.hours(0), ""),
				]);
		});
		it("should work for single zone info", (): void => {
			expect(TzDatabase.instance().getTransitionsTotalOffsets("Europe/Amsterdam", 2013, 2014)).
				to.deep.equal([
					new Transition((TimeStruct.fromComponents(2013, 1, 1, 0, 0, 0, 0)).unixMillis, Duration.hours(1), ""),
					new Transition((TimeStruct.fromComponents(2013, 3, 31, 1, 0, 0, 0)).unixMillis, Duration.hours(2), "S"),
					new Transition((TimeStruct.fromComponents(2013, 10, 27, 1, 0, 0, 0)).unixMillis, Duration.hours(1), ""),
					new Transition((TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0)).unixMillis, Duration.hours(2), "S"),
					new Transition((TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 0)).unixMillis, Duration.hours(1), ""),
				]);
		});
		it("should add zone info transition", (): void => {
			expect(TzDatabase.instance().getTransitionsTotalOffsets("Africa/Porto-Novo", 1969, 1969)).
				to.deep.equal([
					new Transition(TimeStruct.fromComponents(1969, 1, 1, 0, 0, 0, 0).unixMillis, Duration.hours(1), ""),
				]);
		});
	});

	describe("dstOffsetForRule()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (TimeStruct.fromComponents(2014, 3, 30, 0, 59, 59, 999)), Duration.hours(1)).hours()).to.equal(0);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0)), Duration.hours(1)).hours()).to.equal(1);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 1)), Duration.hours(1)).hours()).to.equal(1);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (TimeStruct.fromComponents(2014, 10, 26, 0, 59, 59, 999)), Duration.hours(1)).hours()).to.equal(1);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 0)), Duration.hours(1)).hours()).to.equal(0);
			expect(TzDatabase.instance().dstOffsetForRule(
				"EU", (TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 1)), Duration.hours(1)).hours()).to.equal(0);
		});
	});

	describe("totalOffset()", (): void => {
		it("should work for rules that use UTC in AT column", (): void => {
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 0, 59, 59, 999))).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0))).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 1))).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 10, 26, 0, 59, 59, 999))).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 0))).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 1))).hours()).to.equal(1);
		});
		it("should work for zones that have a fixed DST offset", (): void => {
			expect(TzDatabase.instance().totalOffset(
				"Pacific/Apia", new TimeStruct(1325203100000)).hours()).to.equal(-10);
		});
		// todors more info
	});

	describe("abbreviation()", (): void => {
		it("should work for zones with a slash format", (): void => {
			expect(TzDatabase.instance().abbreviation("Africa/Casablanca", (TimeStruct.fromComponents(1984, 1, 1, 1, 0, 0, 0)))).
				to.equal("+00");
			expect(TzDatabase.instance().abbreviation("Africa/Casablanca", (TimeStruct.fromComponents(1984, 7, 1, 1, 0, 0, 0)))).
				to.equal("+01");
		});
		it("should work for zones with a %s format", (): void => {
			expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 0, 59, 59, 999)))).
				to.equal("CET");
			expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0)))).
				to.equal("CEST");
		});
		it("should work around zone changes", (): void => {
			TzDatabase.init(testData);
			try {
				expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", new TimeStruct(1388534399999))).
					to.equal("TIR");
				expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", new TimeStruct(1388534400000))).
					to.equal("TST");
				expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", new TimeStruct(1388534400))).
					to.equal("TIR");
			} finally {
				TzDatabase.init();
			}
		});
		it("should work for zones that have a fixed DST offset", (): void => {
			expect(TzDatabase.instance().abbreviation("Africa/Algiers", new TimeStruct(-1855958400001))).to.equal("PMT");
		});
		it("should ignore DST if required so", (): void => {
			expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0)), false)).
				to.equal("CET");
		});
	});

	describe("totalOffsetLocal()", (): void => {
		it("should work for UTC", (): void => {
			expect(TzDatabase.instance().totalOffset(
				"Etc/GMT", (TimeStruct.fromComponents(2014, 3, 30, 0, 59, 59, 999))).hours()).to.equal(0);
		});
		it("should work for normal local time", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 1, 1, 1, 0, 0, 0))).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 12, 31, 23, 59, 59, 999))).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 7, 1, 1, 0, 0, 0))).hours()).to.equal(2);
		});
		it("should work around DST forward (1h)", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 1, 59, 59, 999))).hours()).to.equal(1);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 0))).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 1))).hours()).to.equal(2);
		});
		it("should normalize non-existing times up", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 2, 0, 0, 0))).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 2, 0, 0, 1))).hours()).to.equal(2);
		});
		it("should work around DST backward (1h)", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 10, 26, 2, 59, 59, 999))).hours()).to.equal(2);
			expect(TzDatabase.instance().totalOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 10, 26, 3, 0, 0, 0))).hours()).to.equal(1);
		});
		it("should work for time before first time zone info object", (): void => {
			expect(TzDatabase.instance().totalOffsetLocal(
				"America/Swift_Current", new TimeStruct(-3030227200000)).minutes()).to.be.within(-432, -431);
		});
		it("should work for time zones with fixed DST offset", (): void => {
			TzDatabase.init(testData);
			try {
				expect(
					TzDatabase.instance().totalOffsetLocal("TEST/OnlyOffset", new TimeStruct(-2486678340001)).hours()
				).to.equal(2);
				expect(
					TzDatabase.instance().totalOffsetLocal("TEST/OnlyOffset", new TimeStruct(-1486678340001)).hours()
				).to.equal(3);
			} finally {
				TzDatabase.init();
			}
		});
		it("should work for time zones with rule starting at start of zone", (): void => {
			TzDatabase.init(testData);
			try {
				expect(TzDatabase.instance().totalOffsetLocal(
					"TEST/ImmediateRule", (TimeStruct.fromComponents(2013, 12, 31, 23, 59, 59, 999))).hours()).to.equal(1);
				expect(TzDatabase.instance().totalOffsetLocal(
					"TEST/ImmediateRule", (TimeStruct.fromComponents(2014, 1, 1, 0, 0, 0, 0))).hours()).to.equal(1);
				expect(TzDatabase.instance().totalOffsetLocal(
					"TEST/ImmediateRule", (TimeStruct.fromComponents(2014, 1, 1, 1, 0, 0, 0))).hours()).to.equal(2);
			} finally {
				TzDatabase.init();
			}
		});
	});


	describe("standardOffset()", (): void => {
		it("should work", (): void => {
			// before first zone info
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", new TimeStruct(-4228761600001)).minutes()).to.be.within(17.5, 17.6);
			// at until of first zone info (return next)
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", new TimeStruct(-4228761600000)).minutes()).to.be.within(17.5, 17.6);
			// before until of third zone info
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", new TimeStruct(-1613826000001)).minutes()).to.equal(60);
			// at until of third zone info (return fourth)
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", new TimeStruct(-1613826000000)).hours()).to.equal(0);
			// after last zone info
			expect(TzDatabase.instance().standardOffset(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 0, 59, 59, 999))).hours()).to.equal(1);
		});
	});

	describe("standardOffsetLocal()", (): void => {
		it("should work", (): void => {
			// before first zone info (note that timestamps are LOCAL now)
			expect(TzDatabase.instance().standardOffsetLocal(
				"Europe/Amsterdam", new TimeStruct(-4228762772401)).minutes()).to.be.within(17.5, 17.6);
			// at until of first zone info (return next)
			expect(TzDatabase.instance().standardOffsetLocal(
				"Europe/Amsterdam", new TimeStruct(-4228762772400)).minutes()).to.be.within(17.5, 17.6);
			// before until of third zone info
			expect(TzDatabase.instance().standardOffsetLocal(
				"Europe/Amsterdam", new TimeStruct(-1613826000001)).minutes()).to.equal(60);
			// at until of third zone info (return fourth)
			expect(TzDatabase.instance().standardOffsetLocal(
				"Europe/Amsterdam", new TimeStruct(-1613826000000)).hours()).to.equal(1);
			// after last zone info
			expect(TzDatabase.instance().standardOffsetLocal(
				"Europe/Amsterdam", (TimeStruct.fromComponents(2014, 3, 30, 0, 59, 59, 999))).hours()).to.equal(1);
		});
	});

	describe("minDstSave()", (): void => {
		beforeEach(() => {
			TzDatabase.init(testData);
		});
		afterEach(() => {
			TzDatabase.init();
		});

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
		beforeEach(() => {
			TzDatabase.init(testData);
		});
		afterEach(() => {
			TzDatabase.init();
		});

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
			expect(TzDatabase.instance().hasDst("Europe/Amsterdam")).to.equal(true);
		});
		it("should return false for zone with DST", (): void => {
			expect(TzDatabase.instance().hasDst("Etc/GMT")).to.equal(false);
		});
	});

	describe("nextDstChange()", (): void => {
		it("should return the next winter to summer time change", (): void => {
			expect(TzDatabase.instance().nextDstChange("Europe/Amsterdam", new TimeStruct(1427590799999))).to.equal(1427590800000);
		});
		it("should return the next summer to winter time change", (): void => {
			expect(TzDatabase.instance().nextDstChange("Europe/Amsterdam", new TimeStruct(1445734799999))).to.equal(1445734800000);
		});
		it("should work with AtType=Wall", (): void => {
			expect(TzDatabase.instance().nextDstChange("America/Detroit", 1612199681000)).to.equal(1615701600000 + 3600000);
		});
	});

	describe("normalizeLocal()", (): void => {
		it("should not change dates outside DST changes", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 8, 14, 3, 0, 0, 0)).equals(
				TimeStruct.fromComponents(2014, 8, 14, 3, 0, 0, 0))).to.equal(true);
		});
		it("should not change dates around DST backward changes", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 0)).equals(
				TimeStruct.fromComponents(2014, 10, 26, 1, 0, 0, 0))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 10, 26, 2, 0, 0, 0)).equals(
				TimeStruct.fromComponents(2014, 10, 26, 2, 0, 0, 0))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 10, 26, 0, 59, 59, 999)).equals(
				TimeStruct.fromComponents(2014, 10, 26, 0, 59, 59, 999))).to.equal(true);
		});
		it("should round up date during DST forward change", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 2, 0, 0, 0)).equals(
				TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 0))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 2, 0, 0, 1)).equals(
				TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 1))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 2, 59, 59, 999)).equals(
				TimeStruct.fromComponents(2014, 3, 30, 3, 59, 59, 999))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 1, 59, 59, 999)).equals(
				TimeStruct.fromComponents(2014, 3, 30, 1, 59, 59, 999))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 0)).equals(
				TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 0))).to.equal(true);
		});
		it("should round down date during DST forward change", (): void => {
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 2, 0, 0, 0), NormalizeOption.Down).equals(
				TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 0))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 2, 0, 0, 1), NormalizeOption.Down).equals(
				TimeStruct.fromComponents(2014, 3, 30, 1, 0, 0, 1))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 2, 59, 59, 999), NormalizeOption.Down).equals(
				TimeStruct.fromComponents(2014, 3, 30, 1, 59, 59, 999))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 1, 59, 59, 999), NormalizeOption.Down).equals(
				TimeStruct.fromComponents(2014, 3, 30, 1, 59, 59, 999))).to.equal(true);
			expect(TzDatabase.instance().normalizeLocal(
				"Europe/Amsterdam", TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 0), NormalizeOption.Down).equals(
				TimeStruct.fromComponents(2014, 3, 30, 3, 0, 0, 0))).to.equal(true);
		});
	});


	describe("Issue #50", (): void => {
		it("should calculate correct offset for Detroit (issue)", (): void => {
			const utcTime = TzDatabase.instance().nextDstChange("America/Detroit", 1612199681000);
			expect(utcTime).to.equal(1615701600000 + 3600000);
		});

		it("should calculate correct offset for Detroit (forward)", (): void => {
			const utcTime = TzDatabase.instance().nextDstChange("America/Detroit", TimeStruct.fromComponents(2021, 3, 14, 6, 30, 0));
			expect(utcTime).to.equal(TimeStruct.fromComponents(2021, 3, 14, 7, 0, 0).unixMillis, TimeStruct.fromUnix(utcTime ?? 0).toString());
		});

		it("should calculate correct offset for Detroit (backward)", (): void => {
			const utcTime = TzDatabase.instance().nextDstChange("America/Detroit", TimeStruct.fromComponents(2021, 11, 7, 5, 30, 0));
			expect(utcTime).to.equal(TimeStruct.fromComponents(2021, 11, 7, 6, 0, 0).unixMillis, TimeStruct.fromUnix(utcTime ?? 0).toString());
		});

		it("should calculate correct offset for Amsterdam (forward)", (): void => {
			const utcTime = TzDatabase.instance().nextDstChange("Europe/Amsterdam", TimeStruct.fromComponents(2021, 3, 28, 0, 30, 0));
			expect(utcTime).to.equal(TimeStruct.fromComponents(2021, 3, 28, 1, 0, 0).unixMillis, TimeStruct.fromUnix(utcTime ?? 0).toString());
		});

		it("should calculate correct offset for Amsterdam (backward)", (): void => {
			const utcTime = TzDatabase.instance().nextDstChange("Europe/Amsterdam", TimeStruct.fromComponents(2021, 10, 31, 0, 30, 0));
			expect(utcTime).to.equal(TimeStruct.fromComponents(2021, 10, 31, 1, 0, 0).unixMillis, TimeStruct.fromUnix(utcTime ?? 0).toString());
		});
	});

	describe("issue with CET", (): void => {
		it("should calculate initial state", (): void => {
			const ts = TimeStruct.fromComponents(1800, 1, 1);
			expect(TzDatabase.instance().totalOffset("CET", ts.unixMillis).hours()).to.equal(1);
			expect(TzDatabase.instance().abbreviation("CET", ts.unixMillis)).to.equal("CET");
		});
		it("should apply DST changes from the C-Eur ruleset", (): void => {
			const ts = TimeStruct.fromComponents(1916, 5, 1);
			expect(TzDatabase.instance().totalOffset("CET", ts.unixMillis).hours()).to.equal(2);
			expect(TzDatabase.instance().abbreviation("CET", ts.unixMillis)).to.equal("CEST");
		});
	});
});
