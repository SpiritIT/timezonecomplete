/// <reference path="../typings/test.d.ts" />
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
var OnType = tzDatabase.OnType;
var RuleType = tzDatabase.RuleType;
var RuleInfo = tzDatabase.RuleInfo;
var ToType = tzDatabase.ToType;
var Transition = tzDatabase.Transition;
var TzDatabase = tzDatabase.TzDatabase;
var ZoneInfo = tzDatabase.ZoneInfo;

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
    });

    describe("getZoneInfo()", function () {
        it("should work", function () {
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", -4228761600001))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[0]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", -4228761600000))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[1]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374399999))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[4]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374400000))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
            expect(util.inspect(TzDatabase.instance().getZoneInfo("Europe/Amsterdam", 252374400001))).to.equal(util.inspect(TzDatabase.instance().getZoneInfos("Europe/Amsterdam")[5]));
        });
    });

    describe("getTransitionsDstOffsets()", function () {
        it("should work for rules that use UTC in AT column", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsDstOffsets("EU", 2013, 2014, Duration.hours(1)))).to.equal(util.inspect([
                new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)),
                new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0)),
                new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)),
                new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0))
            ]));
        });
        // todors other types of rules
    });

    describe("getTransitionsTotalOffsets()", function () {
        it("should work for UTC", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Etc/GMT", 2013, 2014))).to.equal(util.inspect([
                new Transition((new TimeStruct(2013, 1, 1, 0, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(0))
            ]));
        });
        it("should work for single zone info", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Europe/Amsterdam", 2013, 2014))).to.equal(util.inspect([
                new Transition(252374400000, Duration.hours(1)),
                new Transition((new TimeStruct(2013, 3, 31, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(2)),
                new Transition((new TimeStruct(2013, 10, 27, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1)),
                new Transition((new TimeStruct(2014, 3, 30, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(2)),
                new Transition((new TimeStruct(2014, 10, 26, 1, 0, 0, 0)).toUnixNoLeapSecs(), Duration.hours(1))
            ]));
        });
        it("should add zone info transition", function () {
            expect(util.inspect(TzDatabase.instance().getTransitionsTotalOffsets("Africa/Porto-Novo", 1969, 1969))).to.equal(util.inspect([
                new Transition(-1131235200000, Duration.hours(1))
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
        // todors more info
    });

    describe("totalOffsetLocal()", function () {
        it("should work for UTC", function () {
            expect(TzDatabase.instance().totalOffset("Etc/GMT", (new TimeStruct(2014, 3, 30, 0, 59, 59, 999)).toUnixNoLeapSecs()).hours()).to.equal(0);
        });
        it("should work for normal local time", function () {
            expect(TzDatabase.instance().totalOffsetLocal("Europe/Amsterdam", (new TimeStruct(2014, 1, 1, 1, 0, 0, 0)).toUnixNoLeapSecs()).hours()).to.equal(1);
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

    describe("minDstSave()", function () {
        it("should return zero for zone without DST", function () {
            expect(TzDatabase.instance().minDstSave("Etc/GMT").hours()).to.equal(0);
        });
        it("should return 1 for Europe/Amsterdam", function () {
            expect(TzDatabase.instance().minDstSave("Europe/Amsterdam").hours()).to.equal(1);
        });
    });

    describe("maxDstSave()", function () {
        it("should return zero for zone without DST", function () {
            expect(TzDatabase.instance().maxDstSave("Etc/GMT").hours()).to.equal(0);
        });
        it("should return 1 for Europe/Amsterdam", function () {
            expect(TzDatabase.instance().maxDstSave("Europe/Amsterdam").hours()).to.equal(1);
        });
    });

    describe("hasDst()", function () {
        it("should return true for zone with DST", function () {
            expect(TzDatabase.instance().hasDst("Europe/Amsterdam")).to.be.true;
        });
        it("should return false for zone with DST", function () {
            expect(TzDatabase.instance().hasDst("Etc/GMT")).to.be.false;
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
        it("should round down date during DST forward change", function () {
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 0, 0, 1))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 1));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 2, 59, 59, 999))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 59, 59, 999));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 1, 59, 59, 999))).to.deep.equal(new TimeStruct(2014, 3, 30, 1, 59, 59, 999));
            expect(TzDatabase.instance().normalizeLocal("Europe/Amsterdam", new TimeStruct(2014, 3, 30, 3, 0, 0, 0))).to.deep.equal(new TimeStruct(2014, 3, 30, 3, 0, 0, 0));
        });
    });
});
// todors time zones -11 and + 11
// todors time zones that have two DSTs in a year
