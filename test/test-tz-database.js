/// <reference path="../typings/test.d.ts" />
var sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var util = require("util");
var basics = require("../lib/basics");
var duration = require("../lib/duration");
var tzDatabase = require("../lib/tz-database");
var TimeStruct = basics.TimeStruct;
var WeekDay = basics.WeekDay;
var Duration = duration.Duration;
var AtType = tzDatabase.AtType;
var NormalizeOption = tzDatabase.NormalizeOption;
var OnType = tzDatabase.OnType;
var RuleType = tzDatabase.RuleType;
var RuleInfo = tzDatabase.RuleInfo;
var ToType = tzDatabase.ToType;
var Transition = tzDatabase.Transition;
var TzDatabase = tzDatabase.TzDatabase;
var ZoneInfo = tzDatabase.ZoneInfo;
// inject test data into TzDatabase
/* tslint:disable */
var testData = require("./test-timezone-data.json");
TzDatabase.inject(testData);
/* tslint:enable */
describe("RuleInfo", function () {
    describe("effectiveDate()", function () {
        it("should work for DayNum", function () {
            var ri = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri.effectiveDate(1969)).to.deep.equal(new TimeStruct(1969, 3, 25));
        });
        it("should work for GreqX", function () {
            var ri = new RuleInfo(2014, 0 /* Year */, 2015, "-", 8, 2 /* GreqX */, 15, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri.effectiveDate(2014)).to.deep.equal(new TimeStruct(2014, 8, 17));
        });
        it("should work for LeqX", function () {
            var ri = new RuleInfo(2014, 0 /* Year */, 2015, "-", 8, 3 /* LeqX */, 15, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri.effectiveDate(2014)).to.deep.equal(new TimeStruct(2014, 8, 10));
        });
        it("should work for LastX", function () {
            var ri = new RuleInfo(2014, 0 /* Year */, 2015, "-", 8, 1 /* LastX */, 0, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri.effectiveDate(2014)).to.deep.equal(new TimeStruct(2014, 8, 31));
        });
        it("should throw if not applicable", function () {
            var ri = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            assert.throws(function () {
                ri.effectiveDate(1968);
            });
            assert.throws(function () {
                ri.effectiveDate(1978);
            });
        });
    });
    describe("effectiveLess()", function () {
        it("should work for different from", function () {
            var ri1 = new RuleInfo(1968, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveLess(ri2)).to.equal(true);
            expect(ri2.effectiveLess(ri1)).to.equal(false);
        });
        it("should work for different inMonth", function () {
            var ri1 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 2, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveLess(ri2)).to.equal(true);
            expect(ri2.effectiveLess(ri1)).to.equal(false);
        });
        it("should work for different effective date", function () {
            var ri1 = new RuleInfo(2014, 0 /* Year */, 2014, "-", 3, 0 /* DayNum */, 15, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(2014, 0 /* Year */, 2014, "-", 3, 2 /* GreqX */, 15, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveLess(ri2)).to.equal(true);
            expect(ri2.effectiveLess(ri1)).to.equal(false);
        });
        it("should work for equal", function () {
            var ri1 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveLess(ri2)).to.equal(false);
            expect(ri2.effectiveLess(ri1)).to.equal(false);
        });
    });
    describe("effectiveEqual()", function () {
        it("should work for different from", function () {
            var ri1 = new RuleInfo(1968, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveEqual(ri2)).to.equal(false);
            expect(ri2.effectiveEqual(ri1)).to.equal(false);
        });
        it("should work for different inMonth", function () {
            var ri1 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 2, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveEqual(ri2)).to.equal(false);
            expect(ri2.effectiveEqual(ri1)).to.equal(false);
        });
        it("should work for different effective date", function () {
            var ri1 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 25, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(1969, 0 /* Year */, 1977, "-", 3, 0 /* DayNum */, 26, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveEqual(ri2)).to.equal(false);
            expect(ri2.effectiveEqual(ri1)).to.equal(false);
        });
        it("should work for equal objects", function () {
            var ri1 = new RuleInfo(2014, 0 /* Year */, 2014, "-", 3, 0 /* DayNum */, 17, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(2014, 0 /* Year */, 2014, "-", 3, 0 /* DayNum */, 17, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveEqual(ri2)).to.equal(true);
            expect(ri2.effectiveEqual(ri1)).to.equal(true);
        });
        it("should work for equivalent effective date specified differently", function () {
            var ri1 = new RuleInfo(2014, 0 /* Year */, 2014, "-", 8, 0 /* DayNum */, 17, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            var ri2 = new RuleInfo(2014, 0 /* Year */, 2014, "-", 8, 2 /* GreqX */, 15, 0 /* Sunday */, 0, 0, 0, 2 /* Utc */, Duration.hours(0), "S");
            expect(ri1.effectiveEqual(ri2)).to.equal(true);
            expect(ri2.effectiveEqual(ri1)).to.equal(true);
        });
    });
});
describe("TzDatabase", function () {
    describe("parseRuleType()", function () {
        it("should work for hyphens", function () {
            expect(TzDatabase.instance().parseRuleType("-")).to.equal(0 /* None */);
        });
        it("should work for offsets", function () {
            expect(TzDatabase.instance().parseRuleType("0")).to.equal(1 /* Offset */);
            expect(TzDatabase.instance().parseRuleType("1")).to.equal(1 /* Offset */);
            expect(TzDatabase.instance().parseRuleType("1:00")).to.equal(1 /* Offset */);
            expect(TzDatabase.instance().parseRuleType("-1:00")).to.equal(1 /* Offset */);
            expect(TzDatabase.instance().parseRuleType("-23:23:59")).to.equal(1 /* Offset */);
            expect(TzDatabase.instance().parseRuleType("+23:23:59")).to.equal(1 /* Offset */);
        });
        it("should work for names", function () {
            expect(TzDatabase.instance().parseRuleType("Harrie")).to.equal(2 /* RuleName */);
        });
    });
    describe("parseToType()", function () {
        it("should work for max", function () {
            expect(TzDatabase.instance().parseToType("max")).to.equal(1 /* Max */);
        });
        it("should work for only and return Year", function () {
            expect(TzDatabase.instance().parseToType("only")).to.equal(0 /* Year */);
        });
        it("should work for year", function () {
            expect(TzDatabase.instance().parseToType("1972")).to.equal(0 /* Year */);
        });
        it("should throw for invalid TO type", function () {
            assert.throws(function () {
                TzDatabase.instance().parseToType("NaN");
            });
        });
    });
    describe("parseOnType()", function () {
        it("should work for day number", function () {
            expect(TzDatabase.instance().parseOnType("23")).to.equal(0 /* DayNum */);
        });
        it("should work for >= X", function () {
            expect(TzDatabase.instance().parseOnType("Sun>=3")).to.equal(2 /* GreqX */);
        });
        it("should work for <= X", function () {
            expect(TzDatabase.instance().parseOnType("Sun<=3")).to.equal(3 /* LeqX */);
        });
        it("should work for lastX", function () {
            expect(TzDatabase.instance().parseOnType("lastMon")).to.equal(1 /* LastX */);
        });
    });
    describe("parseOnDay()", function () {
        it("should work for day number", function () {
            expect(TzDatabase.instance().parseOnDay("23", 0 /* DayNum */)).to.equal(23);
        });
        it("should work for >= X", function () {
            expect(TzDatabase.instance().parseOnDay("Sun>=23", 2 /* GreqX */)).to.equal(23);
        });
        it("should work for <= X", function () {
            expect(TzDatabase.instance().parseOnDay("Sun<=23", 3 /* LeqX */)).to.equal(23);
        });
        it("should work for lastX", function () {
            expect(TzDatabase.instance().parseOnDay("lastSun", 1 /* LastX */)).to.equal(0);
        });
    });
    describe("parseOnWeekDay()", function () {
        it("should work for day number", function () {
            expect(TzDatabase.instance().parseOnWeekDay("23")).to.equal(0 /* Sunday */);
        });
        it("should work for >= X", function () {
            expect(TzDatabase.instance().parseOnWeekDay("Mon>=23")).to.equal(1 /* Monday */);
        });
        it("should work for <= X", function () {
            expect(TzDatabase.instance().parseOnWeekDay("Wed<=23")).to.equal(3 /* Wednesday */);
        });
        it("should work for lastX", function () {
            expect(TzDatabase.instance().parseOnWeekDay("lastThu")).to.equal(4 /* Thursday */);
        });
    });
    describe("parseAtType()", function () {
        it("should work for chars", function () {
            expect(TzDatabase.instance().parseAtType("s")).to.equal(0 /* Standard */);
            expect(TzDatabase.instance().parseAtType("w")).to.equal(1 /* Wall */);
            expect(TzDatabase.instance().parseAtType("g")).to.equal(2 /* Utc */);
            expect(TzDatabase.instance().parseAtType("z")).to.equal(2 /* Utc */);
            expect(TzDatabase.instance().parseAtType("u")).to.equal(2 /* Utc */);
        });
        it("should work for empty", function () {
            expect(TzDatabase.instance().parseAtType("")).to.equal(1 /* Wall */);
        });
        it("should work for null", function () {
            expect(TzDatabase.instance().parseAtType("")).to.equal(1 /* Wall */);
        });
        it("should default to Wall", function () {
            expect(TzDatabase.instance().parseAtType("k")).to.equal(1 /* Wall */);
        });
    });
    describe("getZoneInfos()", function () {
        it("should work for normal zones", function () {
            expect(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam"))).to.equal(util.inspect([
                new ZoneInfo(Duration.minutes(19.53333333333333), 0 /* None */, Duration.hours(0), "", "LMT", -4228761600000),
                new ZoneInfo(Duration.minutes(19.53333333333333), 2 /* RuleName */, Duration.hours(0), "Neth", "%s", -1025740800000),
                new ZoneInfo(Duration.minutes(20), 2 /* RuleName */, Duration.hours(0), "Neth", "NE%sT", -935020800000),
                new ZoneInfo(Duration.minutes(60), 2 /* RuleName */, Duration.hours(0), "C-Eur", "CE%sT", -781048800000),
                new ZoneInfo(Duration.minutes(60), 2 /* RuleName */, Duration.hours(0), "Neth", "CE%sT", 252374400000),
                new ZoneInfo(Duration.minutes(60), 2 /* RuleName */, Duration.hours(0), "EU", "CE%sT", null)
            ]));
        });
        it("should work for linked zones", function () {
            expect(TzDatabase.instance().getZoneInfos("Arctic/Longyearbyen")).to.deep.equal(TzDatabase.instance().getZoneInfos("Europe/Oslo"));
        });
    });
    describe("getRuleInfos()", function () {
        it("should work for normal zones", function () {
            expect(util.inspect(TzDatabase.instance().getRuleInfos("EU"))).to.equal(util.inspect([
                new RuleInfo(1977, 0 /* Year */, 1980, "-", 4, 2 /* GreqX */, 1, 0 /* Sunday */, 1, 0, 0, 2 /* Utc */, Duration.hours(1), "S"),
                new RuleInfo(1977, 0 /* Year */, 1977, "-", 9, 1 /* LastX */, 0, 0 /* Sunday */, 1, 0, 0, 2 /* Utc */, Duration.hours(0), ""),
                new RuleInfo(1978, 0 /* Year */, 1978, "-", 10, 0 /* DayNum */, 1, 0 /* Sunday */, 1, 0, 0, 2 /* Utc */, Duration.hours(0), ""),
                new RuleInfo(1979, 0 /* Year */, 1995, "-", 9, 1 /* LastX */, 0, 0 /* Sunday */, 1, 0, 0, 2 /* Utc */, Duration.hours(0), ""),
                new RuleInfo(1981, 1 /* Max */, 0, "-", 3, 1 /* LastX */, 0, 0 /* Sunday */, 1, 0, 0, 2 /* Utc */, Duration.hours(1), "S"),
                new RuleInfo(1996, 1 /* Max */, 0, "-", 10, 1 /* LastX */, 0, 0 /* Sunday */, 1, 0, 0, 2 /* Utc */, Duration.hours(0), "")
            ]));
        });
        it("should throw for invalid rule name", function () {
            assert.throws(function () {
                TzDatabase.instance().getRuleInfos("rubbish");
            });
        });
    });
    describe("getZoneInfo()", function () {
        it("should work", function () {
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", -4228761600001))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[0]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", -4228761600000))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[1]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374399999))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[4]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374400000))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374400001))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
        });
        it("should throw for invalid zone name", function () {
            assert.throws(function () {
                TzDatabase.instance().getZoneInfo("rubbish", 0);
            });
        });
    });
    describe("zoneIsUtc()", function () {
        it("should return true for equivalent zones", function () {
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
        it("should return false for non-utc zones", function () {
            expect(TzDatabase.instance().zoneIsUtc("Europe/Amsterdam")).to.equal(false);
            expect(TzDatabase.instance().zoneIsUtc("W-SU")).to.equal(false);
        });
    });
    describe("getTransitionsDstOffsets()", function () {
        it("should work for rules that use UTC in AT column", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsDstOffsets("EU", 2013, 2014, Duration.hours(1)))).to.equal(util.inspect([
                new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), "S"),
                new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0), ""),
                new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), "S"),
                new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0), ""),
            ]));
        });
        // todors other types of rules
    });
    describe("getTransitionsTotalOffsets()", function () {
        it("should work for UTC", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Etc/GMT", 2013, 2014))).to.equal(util.inspect([
                new Transition((new TimeStruct(2013, 1, 1, 0, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0), ""),
            ]));
        });
        it("should work for single zone info", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Europe/Amsterdam", 2013, 2014))).to.equal(util.inspect([
                new Transition(252374400000, Duration.hours(1), ""),
                new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(2), "S"),
                new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), ""),
                new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(2), "S"),
                new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1), ""),
            ]));
        });
        it("should add zone info transition", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Africa/Porto-Novo", 1969, 1969))).to.equal(util.inspect([
                new Transition(-1131235200000, Duration.hours(1), ""),
            ]));
        });
    });
    describe("dstOffsetForRule()", function () {
        it("should work for rules that use UTC in AT column", function () {
            expect(TzDatabase.instance().dstOffsetForRule("EU", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(0);
            expect(TzDatabase.instance().dstOffsetForRule("EU", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(1);
            expect(TzDatabase.instance().dstOffsetForRule("EU", (new TimeStruct(2014, 3, 30, 1, 0, 0, 1)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(1);
            expect(TzDatabase.instance().dstOffsetForRule("EU", (new TimeStruct(2014, 10, 26, 0, 59, 59, 999)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(1);
            expect(TzDatabase.instance().dstOffsetForRule("EU", (new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(0);
            expect(TzDatabase.instance().dstOffsetForRule("EU", (new TimeStruct(2014, 10, 26, 1, 0, 0, 1)).toUnixNoLeapSecs(), Duration.hours(1)).hours()).to.equal(0);
        });
    });
    describe("totalOffset()", function () {
        it("should work for rules that use UTC in AT column", function () {
            expect(TzDatabase.instance().totalOffset("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffset("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffset("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffset("Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffset("Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffset("Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 1, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(1);
        });
        it("should work for zones that have a fixed DST offset", function () {
            expect(TzDatabase.instance().totalOffset("Pacific/Apia", 1325203100000).hours()).to.equal(-10);
        });
        // todors more info
    });
    describe("abbreviation()", function () {
        it("should work for zones with rules", function () {
            expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs())).to.equal("CET");
            expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs())).to.equal("CEST");
        });
        it("should work around zone changes", function () {
            expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", 1388534399999)).to.equal("TIR");
            expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", 1388534400000)).to.equal("TST");
            expect(TzDatabase.instance().abbreviation("TEST/ImmediateRule", 1388534400)).to.equal("TIR");
        });
        it("should work for zones that have a fixed DST offset", function () {
            expect(TzDatabase.instance().abbreviation("Africa/Algiers", -1855958400001)).to.equal("PMT");
        });
        it("should ignore DST if required so", function () {
            expect(TzDatabase.instance().abbreviation("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), false)).to.equal("CET");
        });
    });
    describe("totalOffsetLocal()", function () {
        it("should work for UTC", function () {
            expect(TzDatabase.instance().totalOffset("Etc/GMT", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(0);
        });
        it("should work for normal local time", function () {
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 1, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 12, 31, 23, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 7, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
        });
        it("should work around DST forward (1h)", function () {
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 1, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 3, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 3, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(2);
        });
        it("should normalize non-existing times up", function () {
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 2, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 2, 0, 0, 1)).toUnixNoLeapSecs()).hours()).to.equal(2);
        });
        it("should work around DST backward (1h)", function () {
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 2, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 10, 26, 3, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
        });
        it("should work for time before first time zone info object", function () {
            expect(TzDatabase.instance().totalOffsetLocal("America/Swift_Current", -3030227200000).minutes()).to.be.within(-432, -431);
        });
        it("should work for time zones with fixed DST offset", function () {
            expect(TzDatabase.instance().totalOffsetLocal("TEST/OnlyOffset", -2486678340001).hours()).to.equal(2);
            expect(TzDatabase.instance().totalOffsetLocal("TEST/OnlyOffset", -1486678340001).hours()).to.equal(3);
        });
        it("should work for time zones with rule starting at start of zone", function () {
            expect(TzDatabase.instance().totalOffsetLocal("TEST/ImmediateRule", (new TimeStruct(2013, 12, 31, 23, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffsetLocal("TEST/ImmediateRule", (new TimeStruct(2014, 1, 1, 0, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
            expect(TzDatabase.instance().totalOffsetLocal("TEST/ImmediateRule", (new TimeStruct(2014, 1, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(2);
        });
    });
    describe("standardOffset()", function () {
        it("should work", function () {
            // before first zone info
            expect(TzDatabase.instance().standardOffset("Europe/Amsterdam", -4228761600001).minutes()).to.be.within(19.5, 19.6);
            // at until of first zone info (return next)
            expect(TzDatabase.instance().standardOffset("Europe/Amsterdam", -4228761600000).minutes()).to.be.within(19.5, 19.6);
            // before until of third zone info
            expect(TzDatabase.instance().standardOffset("Europe/Amsterdam", -935020800001).minutes()).to.equal(20);
            // at until of third zone info (return fourth)
            expect(TzDatabase.instance().standardOffset("Europe/Amsterdam", -935020800000).hours()).to.equal(1);
            // after last zone info
            expect(TzDatabase.instance().standardOffset("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
        });
    });
    describe("standardOffsetLocal()", function () {
        it("should work", function () {
            // before first zone info (note that timestamps are LOCAL now)
            expect(TzDatabase.instance().standardOffsetLocal("Europe/Amsterdam", -4228762772401).minutes()).to.be.within(19.5, 19.6);
            // at until of first zone info (return next)
            expect(TzDatabase.instance().standardOffsetLocal("Europe/Amsterdam", -4228762772400).minutes()).to.be.within(19.5, 19.6);
            // before until of third zone info
            expect(TzDatabase.instance().standardOffsetLocal("Europe/Amsterdam", -935019600001).minutes()).to.equal(20);
            // at until of third zone info (return fourth)
            expect(TzDatabase.instance().standardOffsetLocal("Europe/Amsterdam", -935019600000).hours()).to.equal(1);
            // after last zone info
            expect(TzDatabase.instance().standardOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(1);
        });
    });
    describe("minDstSave()", function () {
        it("should return the minimum for the entire database", function () {
            expect(TzDatabase.instance().minDstSave().minutes()).to.equal(20);
        });
        it("should return zero for zone without DST", function () {
            expect(TzDatabase.instance().minDstSave("Etc/GMT").hours()).to.equal(0);
        });
        it("should work for zone with fixed DST offset", function () {
            expect(TzDatabase.instance().minDstSave("TEST/OnlyOffset").hours()).to.equal(1);
        });
        it("should return 1 for Europe/Amsterdam", function () {
            expect(TzDatabase.instance().minDstSave("Europe/Amsterdam").hours()).to.equal(1);
        });
    });
    describe("maxDstSave()", function () {
        it("should return the maximum for the entire database", function () {
            expect(TzDatabase.instance().maxDstSave().minutes()).to.equal(120);
        });
        it("should return zero for zone without DST", function () {
            expect(TzDatabase.instance().maxDstSave("Etc/GMT").hours()).to.equal(0);
        });
        it("should work for zone with fixed DST offset", function () {
            expect(TzDatabase.instance().maxDstSave("TEST/OnlyOffset").hours()).to.equal(2);
        });
        it("should return 1 for Europe/Amsterdam", function () {
            expect(TzDatabase.instance().maxDstSave("Europe/Amsterdam").hours()).to.equal(1);
        });
    });
    describe("hasDst()", function () {
        it("should return true for zone with DST", function () {
            expect(TzDatabase.instance().hasDst("Europe/Amsterdam")).to.equal(true);
        });
        it("should return false for zone with DST", function () {
            expect(TzDatabase.instance().hasDst("Etc/GMT")).to.equal(false);
        });
    });
    describe("normalizeLocal()", function () {
        it("should not change dates outside DST changes", function () {
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 8, 14, 3, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 8, 14, 3, 0, 0, 0));
        });
        it("should not change dates around DST backward changes", function () {
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 10, 26, 1, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 10, 26, 1, 0, 0, 0));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 10, 26, 2, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 10, 26, 2, 0, 0, 0));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 10, 26, 0, 59, 59, 999))).to.deep.equal(new TimeStruct(2014, 10, 26, 0, 59, 59, 999));
        });
        it("should round up date during DST forward change", function () {
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 1))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 1));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 59, 59, 999))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 59, 59, 999));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 1, 59, 59, 999))).to.deep.equal(new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 3, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
        });
        it("should round down date during DST forward change", function () {
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 0), 1 /* Down */)).to.deep.equal(new TimeStruct(2014, 3, 30, 1, 0, 0, 0));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 1), 1 /* Down */)).to.deep.equal(new TimeStruct(2014, 3, 30, 1, 0, 0, 1));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 59, 59, 999), 1 /* Down */)).to.deep.equal(new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 1, 59, 59, 999), 1 /* Down */)).to.deep.equal(new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 3, 0, 0, 0), 1 /* Down */)).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
        });
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QtdHotZGF0YWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDO0FBRTdDLElBQU8sZ0JBQWdCLFdBQVcsb0JBQW9CLENBQUMsQ0FBQztBQUN4RCxBQUNBLDhGQUQ4RjtBQUM5RixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRTlELElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLElBQU8sSUFBSSxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLElBQU8sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDNUIsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFFOUIsSUFBTyxNQUFNLFdBQVcsZUFBZSxDQUFDLENBQUM7QUFDekMsSUFBTyxRQUFRLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUM3QyxJQUFPLFVBQVUsV0FBVyxvQkFBb0IsQ0FBQyxDQUFDO0FBRWxELElBQU8sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFDdEMsSUFBTyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUVoQyxJQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDO0FBRXBDLElBQU8sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDbEMsSUFBTyxlQUFlLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQztBQUNwRCxJQUFPLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ2xDLElBQU8sUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDdEMsSUFBTyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztBQUN0QyxJQUFPLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ2xDLElBQU8sVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7QUFDMUMsSUFBTyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztBQUMxQyxJQUFPLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO0FBRXRDLEFBRUEsbUNBRm1DO0FBQ25DLG9CQUFvQjtJQUNoQixRQUFRLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDcEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixBQUdBLG1CQUhtQjtBQUduQixRQUFRLENBQUMsVUFBVSxFQUFFO0lBQ3BCLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtRQUMzQixFQUFFLENBQUMsd0JBQXdCLEVBQUU7WUFDNUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLFlBQVcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxjQUFhLEVBQUUsRUFBRSxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFVLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN2SSxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRTtZQUMzQixJQUFJLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBVyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGFBQVksRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3RJLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHNCQUFzQixFQUFFO1lBQzFCLElBQUksRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxZQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsWUFBVyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckksTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLFlBQVcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxhQUFZLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFVLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNySSxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMs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QUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTtZQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtRQUN0QyxFQUFFLENBQUMsaURBQWlELEVBQUU7WUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3hHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDckIsSUFBSSxVQUFVLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7Z0JBQ3BHLElBQUksVUFBVSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNwRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztnQkFDcEcsSUFBSSxVQUFVLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7YUFDcEcsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUNILDhCQUE4QjtJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyw4QkFBOEIsRUFBRTtRQUN4QyxFQUFFLENBQUMscUJBQXFCLEVBQUU7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUM1RixFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ3JCLElBQUksVUFBVSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ2xHLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsa0NBQWtDLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLDBCQUEwQixDQUFDLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQ3JHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDckIsSUFBSSxVQUFVLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLFVBQVUsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztnQkFDcEcsSUFBSSxVQUFVLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3BHLElBQUksVUFBVSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO2dCQUNwRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzthQUNwRyxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUN0RyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ3JCLElBQUksVUFBVSxDQUFDLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO2FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtRQUM5QixFQUFFLENBQUMsaURBQWlELEVBQUU7WUFDckQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDNUMsSUFBSSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakgsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDNUMsSUFBSSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDNUMsSUFBSSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDNUMsSUFBSSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEgsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDNUMsSUFBSSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFVBQVUs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QUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG1DQUFtQyxFQUFFO1lBQ3ZDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHFDQUFxQyxFQUFFO1lBQ3pDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1lBQzVDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHNDQUFzQyxFQUFFO1lBQzFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdHLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsZ0JBQWdCLENBQzVDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENB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QUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQzNFLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMscURBQXFELEVBQUU7WUFDekQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQzFDLGtCQUFrQixFQUFFLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDNUUsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FDMUMsa0JBQWtCLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUM1RSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsY0FBYyxDQUMxQyxrQkFBa0IsRUFBRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ2hGLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsZ0RBQWdELEVBQUU7WUFDcEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxjQUFjLENBQzFDLGtCQUFrQixFQUFFLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDM0UsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FDMUMsa0JBQWtCLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUMzRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsY0FB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QUMsUUFBUSxFQUFFLENBQUMsY0FBYyxDQUMxQyxrQkFBa0IsRUFBRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxZQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDckcsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsQ0FDMUMsa0JBQWtCLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsWUFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ2pHLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlc3QvdGVzdC10ei1kYXRhYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19