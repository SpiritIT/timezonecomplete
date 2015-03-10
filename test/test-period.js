/// <reference path="../typings/test.d.ts" />
var sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var datetimeFuncs = require("../lib/index");
var DateTime = datetimeFuncs.DateTime;
var Period = datetimeFuncs.Period;
var PeriodDst = datetimeFuncs.PeriodDst;
var TimeUnit = datetimeFuncs.TimeUnit;
var TimeZone = datetimeFuncs.TimeZone;
// Fake time source
var TestTimeSource = (function () {
    function TestTimeSource() {
        this.currentTime = new Date("2014-01-03T04:05:06.007Z");
    }
    TestTimeSource.prototype.now = function () {
        return this.currentTime;
    };
    return TestTimeSource;
})();
// Insert fake time source so that now() is stable
var testTimeSource = new TestTimeSource();
DateTime.timeSource = testTimeSource;
describe("Period", function () {
    describe("start()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 5 /* Month */, 0 /* RegularIntervals */)).start().toString()).to.equal("2014-01-31T12:00:00.000 UTC");
    });
    describe("amount()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 5 /* Month */, 0 /* RegularIntervals */)).amount()).to.equal(2);
    });
    describe("unit()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 5 /* Month */, 0 /* RegularIntervals */)).unit()).to.equal(5 /* Month */);
    });
    describe("dst()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 5 /* Month */, 0 /* RegularIntervals */)).dst()).to.equal(0 /* RegularIntervals */);
    });
    describe("next(<=start)", function () {
        it("should return start date in fromDate zone", function () {
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2013-01-01T12:00:00.00+02")).toString()).to.equal("2014-01-01T14:00:00.000+02:00");
        });
        it("should work for 400-year leap year", function () {
            expect((new Period(new DateTime("2000-02-29T12:00:00.000 UTC"), 1, 6 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("1999-12-31T12:00:00 UTC")).toString()).to.equal("2000-02-29T12:00:00.000 UTC");
        });
        it("should NOT return start date for the start date itself", function () {
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T14:00:00.00+02")).toString()).to.equal("2014-03-01T14:00:00.000+02:00");
        });
    });
    describe("Period(X, 1, X, RegularInterval).findFirst()", function () {
        it("should handle 1 Second", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 0 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:59.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 0 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:59:59.000 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle 1 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 1 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:59.000 UTC")).toString()).to.equal("2014-03-30T02:00:00.000 UTC");
        });
        it("should handle 1 Hour", function () {
            // check around dst
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:10:00.000 UTC")).toString()).to.equal("2014-10-26T01:05:06.007 UTC");
            // check it returns OK in local time (which stays from 2AM at 2AM)
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T02:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 1, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T00:25:06.007 Africa/Accra");
        });
        it("should handle 1 Day", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 3 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 3 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-02T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Month", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-04-01T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-02-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Year", function () {
            // check it shifts local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 1, 6 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-03-29T05:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 6 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2015-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, 1, X, RegularLocalTime).findFirst()", function () {
        it("should handle 1 Second", function () {
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 0 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:59.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 1 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 1 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 1 Hour", function () {
            // check around dst
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
            // check it returns OK in local time (which changes from 2AM to 3AM)
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T03:00:00.000 Europe/Amsterdam");
        });
        it("should handle 1 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 1, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T01:05:06.007 Africa/Accra");
        });
        it("should handle 1 Day", function () {
            // check it keeps local time @ 12h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 3 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T12:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 3 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-02T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Month", function () {
            // check it keeps local time @ 12h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-04-01T12:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-02-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Year", function () {
            // check it keeps local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 1, 6 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-03-29T04:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 6 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2015-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, 2, X, RegularInterval).findFirst()", function () {
        it("should handle 2 Second", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 0 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:58.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 0 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:59:58.000 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle 2 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 1 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:58:00.000 UTC")).toString()).to.equal("2014-03-30T02:00:00.000 UTC");
        });
        it("should handle 2 Hour", function () {
            // check around dst
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:10:00.000 UTC")).toString()).to.equal("2014-10-26T01:05:06.007 UTC"); // note 1AM because start time is 11AM UTC
            // check it returns OK in local time (which stays from 2AM at 2AM)
            expect((new Period(new DateTime("1970-01-01T01:00:00.000 Europe/Amsterdam"), 2, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-25T23:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T02:00:00.000 Europe/Amsterdam");
        });
        it("should handle 2 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 2, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T00:25:06.007 Africa/Accra");
        });
        it("should handle 2 Day", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 3 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-31T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 3 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-02T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-04T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Week", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 4 /* Week */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-04-03T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 4 /* Week */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-02T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-09T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Month", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-05-01T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Year", function () {
            // check it shifts local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 2, 6 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2016-03-29T05:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 6 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2016-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, 2, X, RegularLocalTime).findFirst()", function () {
        it("should handle 2 Second", function () {
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 0 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:58.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 2 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 1 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:58:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 2 Hour", function () {
            // check around dst - because local time is kept in rythm, UTC time varies in hours
            expect((new Period(new DateTime("1970-01-01T11:00:00 Europe/Amsterdam"), 2, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-25T23:00:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC")).toString()).to.equal("2014-10-26T03:00:00.000 UTC");
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T01:00:00.000 UTC")).toString()).to.equal("2014-10-26T03:00:00.000 UTC");
            // check it returns OK in local time (which changes from 2AM to 3AM)
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T04:00:00.000 Europe/Amsterdam");
        });
        it("should handle 2 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 2, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T02:05:06.007 Africa/Accra");
        });
        it("should handle 2 Day", function () {
            // check it keeps local time @ 12h across DST
            expect((new Period(new DateTime("2014-03-26T12:00:00.000 Europe/Amsterdam"), 2, 3 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-29T12:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T12:00:00.000 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("2014-03-26T12:05:06.007 Europe/Amsterdam"), 2, 3 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-28T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-03-30T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Month", function () {
            // check it keeps local time @ 12h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-02-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Year", function () {
            // check it keeps local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 2, 6 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2013-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-29T04:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 6 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2016-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, >X, X, RegularInterval).findFirst()", function () {
        it("should handle >60 Second", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 0 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:02:00.000 Europe/Amsterdam");
            // check no effect on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 0 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T23:59:54.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:01:00.000 Europe/Amsterdam");
        });
        it("should handle >60 Minute", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 1 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T02:00:00.000 Europe/Amsterdam");
            // check no effect on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 1 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T23:06:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:12:00.000 Europe/Amsterdam");
        });
        it("should handle >24 Hour", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 48, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-19T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-21T00:00:00.000 Europe/Amsterdam");
            // check that non-multiple of a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 25, 2 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
        });
        it("should handle >31 Day", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 40, 3 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-20T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-02-10T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >53 Week", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 54, 4 /* Week */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-01-14T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >12 Month", function () {
            // non-leap year
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 13, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-02-01T00:00:00.000 Europe/Amsterdam");
            // leap year should not make a difference
            expect((new Period(new DateTime("2016-01-01T00:00:00.000 Europe/Amsterdam"), 13, 5 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2016-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2017-02-01T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("Period(X, >X, X, RegularLocalTime).findFirst()", function () {
        it("should handle >60 Second", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 0 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:02:00.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 0 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:54.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 0 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:53.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T23:59:54.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 66, 0 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-02-02T11:59:53.000 Europe/Amsterdam")).toString()).to.equal("2014-02-02T11:59:54.000 Europe/Amsterdam");
        });
        it("should handle >60 Minute", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 1 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T02:00:00.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 1 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:06:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 1 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:05:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T23:06:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 66, 1 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-02T11:05:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T11:06:00.000 Europe/Amsterdam");
        });
        it("should handle >24 Hour", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 48, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-19T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-21T00:00:00.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 5, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T20:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 5, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T19:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T20:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 5, 2 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-02T07:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T08:00:00.000 Europe/Amsterdam");
        });
        it("should handle >31 Day", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 40, 3 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-20T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-02-10T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >53 Week", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 54, 4 /* Week */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-01-14T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >12 Month", function () {
            // non-leap year
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 13, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-02-01T00:00:00.000 Europe/Amsterdam");
            // multiple of 12 months
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 24, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
            // leap year should not make a difference
            expect((new Period(new DateTime("2016-01-01T00:00:00.000 Europe/Amsterdam"), 13, 5 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2016-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2017-02-01T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("Period(RegularInterval).findNext()", function () {
        it("Should handle no count", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam")).toString()).to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
        });
        it("Should handle count 1", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
        });
        it("Should handle count >1", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString()).to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
        });
        it("Should return same zone as parameter", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 UTC"), 10).toString()).to.equal("2014-02-01T11:00:00.000 UTC");
        });
        it("Should not handle DST", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("Should throw on null datetime", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            assert.throws(function () {
                p.findNext(null);
            });
        });
        it("Should throw on <1 count", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            assert.throws(function () {
                p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 0);
            });
            assert.throws(function () {
                p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), -1);
            });
        });
        it("Should throw on non-integer count", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            assert.throws(function () {
                p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1.1);
            });
        });
        it("Should handle end-of-month for 28 < day < 31", function () {
            var p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, 5 /* Month */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
        it("Should handle end-of-month for day == 31", function () {
            var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, 5 /* Month */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-31T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 3).toString()).to.equal("2014-04-30T01:00:00.000 Europe/Amsterdam"); // note local time changes because RegularIntervals is set
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("Period(RegularLocalTime).findNext()", function () {
        it("Should handle DST", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("Should handle count >1", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString()).to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
        });
        it("Should handle end-of-month for 28 < day < 31", function () {
            var p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, 5 /* Month */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
        it("Should handle end-of-month for day == 31", function () {
            var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, 5 /* Month */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-31T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 3).toString()).to.equal("2014-04-30T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("isBoundary()", function () {
        it("should return true for start date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"))).to.equal(true);
        });
        it("should return true for boundary date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(new DateTime("2014-01-02T02:00:00 Europe/Amsterdam"))).to.equal(true);
        });
        it("should return false for non-boundary date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(new DateTime("2014-01-02T02:00:01 Europe/Amsterdam"))).to.equal(false);
        });
        it("should return false for null date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(null)).to.equal(false);
        });
    });
    describe("equals()", function () {
        it("should return false for periods with different start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:01 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with equal start but different time zone effect", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with different amount", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 2, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with different unit", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 1 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with different DST setting that matters", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return true for periods different DST setting that does not matter", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.equals(q)).to.equal(true);
        });
        it("should return true for identical periods", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(true);
        });
        it("should return true for periods with equal but not identical start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 GMT"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(true);
        });
        it("should return true for periods with different unit and amount that adds up to same", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 60, 1 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(true);
        });
    });
    describe("identical()", function () {
        it("should return false for periods with different start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:01 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with equal start but different time zone effect", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different amount", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 2, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different unit", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 1 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different DST setting that matters", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods different DST setting that does not matter", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with equal but not identical start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 GMT"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different unit and amount that adds up to same", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 60, 1 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return true for identical periods", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(true);
        });
    });
    describe("toString()", function () {
        it("should work with naive date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000");
        });
        it("should work with PeriodDst.RegularLocalTime", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular local time");
        });
        it("should work with PeriodDst.RegularIntervals", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");
        });
        it("should work with multiple hours", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 2, 2 /* Hour */, 0 /* RegularIntervals */);
            expect(p.toString()).to.equal("2 hours, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");
        });
    });
    describe("toIsoString()", function () {
        it("should work", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 0 /* Second */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1S");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 1 /* Minute */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/PT1M");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 2 /* Hour */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1H");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 3 /* Day */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1D");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 4 /* Week */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1W");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 5 /* Month */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1M");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 6 /* Year */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1Y");
        });
    });
    describe("inspect()", function () {
        it("should work", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00"), 1, 2 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.inspect()).to.equal("[Period: " + p.toString() + "]");
        });
    });
});
// todo test DST zone where DST save is not a whole hour (20 or 40 minutes)
// todo test zone with two DSTs

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QtcGVyaW9kLnRzIl0sIm5hbWVzIjpbIlRlc3RUaW1lU291cmNlIiwiVGVzdFRpbWVTb3VyY2UuY29uc3RydWN0b3IiLCJUZXN0VGltZVNvdXJjZS5ub3ciXSwibWFwcGluZ3MiOiJBQUFBLDZDQUE2QztBQUU3QyxJQUFPLGdCQUFnQixXQUFXLG9CQUFvQixDQUFDLENBQUM7QUFDeEQsQUFDQSw4RkFEOEY7QUFDOUYsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUc5RCxJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUNsQyxJQUFPLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUM5QixJQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBRTVCLElBQU8sYUFBYSxXQUFXLGNBQWMsQ0FBQyxDQUFDO0FBRS9DLElBQU8sUUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7QUFDekMsSUFBTyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztBQUNyQyxJQUFPLFNBQVMsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDO0FBRTNDLElBQU8sUUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7QUFDekMsSUFBTyxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQztBQUV6QyxBQUNBLG1CQURtQjtJQUNiLGNBQWM7SUFBcEJBLFNBQU1BLGNBQWNBO1FBQ1pDLGdCQUFXQSxHQUFTQSxJQUFJQSxJQUFJQSxDQUFDQSwwQkFBMEJBLENBQUNBLENBQUNBO0lBS2pFQSxDQUFDQTtJQUhBRCw0QkFBR0EsR0FBSEE7UUFDQ0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7SUFDekJBLENBQUNBO0lBQ0ZGLHFCQUFDQTtBQUFEQSxDQU5BLEFBTUNBLElBQUE7QUFFRCxBQUNBLGtEQURrRDtJQUM5QyxjQUFjLEdBQW1CLElBQUksY0FBYyxFQUFFLENBQUM7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QywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELEFBQ0Esc0RBRHNEO1lBQ3RELE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVksRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQ3hILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQzNCLEFBQ0EsNkNBRDZDO1lBQzdDLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWMsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzFILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELEFBQ0Esc0RBRHNEO1lBQ3RELE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWMsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzFILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHNCQUFzQixFQUFFO1lBQzFCLEFBQ0Esa0VBRGtFO1lBQ2xFLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQ3pILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELEFBQ0Esc0RBRHNEO1lBQ3RELE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQ3pILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsK0NBQStDLEVBQUU7UUFDekQsRUFBRSxDQUFDLHdCQUF3QixFQUFFO1lBQzVCLEFBRUEsd0VBRndFO1lBQ3hFLDRIQUE0SDtZQUM1SCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN2SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN2SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtZQUMxQixBQUNBLG1CQURtQjtZQUNuQixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNySCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMxQyxBQUNBLG9FQURvRTtZQUNwRSxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNySCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUM1RyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsOENBQThDLEVBQUU7WUFDbEQsQUFDQSw4QkFEOEI7WUFDOUIsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDckgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMzRSxFQUFFLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMscUJBQXFCLEVBQUU7WUFDekIsQUFDQSxrQ0FEa0M7WUFDbEMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDeEgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDeEgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsQUFDQSxrQ0FEa0M7WUFDbEMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENB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QUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDeEgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsc0JBQXNCLEVBQUU7WUFDMUIsQUFDQSw2Q0FENkM7WUFDN0MsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsQUFDQSw2Q0FENkM7WUFDN0MsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsc0JBQXNCLEVBQUU7WUFDMUIsQUFDQSxrRUFEa0U7WUFDbEUsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFD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QTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixBQUNBLGdDQURnQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMxSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxBQUNBLDBDQUQwQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMxSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRTtZQUMzQixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxXQUFZLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN6SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMxSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRTtZQUM3QixBQUNBLGdCQURnQjtZQUNoQixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMzSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxBQUNBLHlDQUR5QztZQUN6QyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMzSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGdEQUFnRCxFQUFFO1FBQzFELEVBQUUsQ0FBQywwQkFBMEIsRUFBRTtZQUM5QixBQUNBLGdDQURnQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM3SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxBQUNBLG9EQURvRDtZQUNwRCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM1SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM1SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM1SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywwQkFBMEIsRUFBRTtZQUM5QixBQUNBLGdDQURnQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM3SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxBQUNBLG9EQURvRDtZQUNwRCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM1SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM1SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUM1SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixBQUNBLGdDQURnQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMxSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUV2RCxBQUNBLG9EQURvRDtZQUNwRCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN6SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN6SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN6SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FB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c0MsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsOENBQThDLEVBQUU7WUFDbEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUM7WUFDeEgsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNyRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsMENBQTBDLEVBQUU7WUFDOUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUM7WUFDeEgsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsMERBQTBEO1lBQ2xILE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDckYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMscUNBQXFDLEVBQUU7UUFDL0MsRUFBRSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDO1lBQ3ZILE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUNoSCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3JGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyw4Q0FBOEMsRUFBRTtZQUNsRCxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN4SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3BGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3BGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3JGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywwQ0FBMEMsRUFBRTtZQUM5QyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FB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QUUsQ0FBQyxDQUNkLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNyRyxXQUFXLEVBQUUsQ0FBQyxDQUNkLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNwRyxXQUFXLEVBQUUsQ0FBQyxDQUNkLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLFdBQVcsRUFBRTtRQUNyQixFQUFFLENBQUMsYUFBYSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDaEUsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUVKLENBQUMsQ0FBQyxDQUFDO0FBQ0gsMkVBQTJFO0FBQzNFLCtCQUErQiIsImZpbGUiOiJ0ZXN0L3Rlc3QtcGVyaW9kLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOltudWxsXX0=