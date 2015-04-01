/// <reference path="../typings/test.d.ts" />
var sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var datetimeFuncs = require("../lib/index");
var DateTime = datetimeFuncs.DateTime;
var Duration = datetimeFuncs.Duration;
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
    describe("constructor()", function () {
        it("should work with a Duration", function () {
            var p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), new Duration(2, 6 /* Month */), 0 /* RegularIntervals */);
            expect(p.amount()).to.equal(2);
            expect(p.unit()).to.equal(6 /* Month */);
            expect(p.dst()).to.equal(0 /* RegularIntervals */);
        });
        it("should work with a Duration and provide default DST", function () {
            var p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), new Duration(2, 6 /* Month */));
            expect(p.dst()).to.equal(1 /* RegularLocalTime */);
        });
        it("should work with an amount and unit", function () {
            var p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */);
            expect(p.amount()).to.equal(2);
            expect(p.unit()).to.equal(6 /* Month */);
            expect(p.dst()).to.equal(0 /* RegularIntervals */);
        });
        it("should work with an amount and unit and provide default DST", function () {
            var p = new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 6 /* Month */);
            expect(p.dst()).to.equal(1 /* RegularLocalTime */);
        });
    });
    describe("start()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */)).start().toString()).to.equal("2014-01-31T12:00:00.000 UTC");
    });
    describe("amount()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */)).amount()).to.equal(2);
    });
    describe("unit()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */)).unit()).to.equal(6 /* Month */);
    });
    describe("dst()", function () {
        expect((new Period(new DateTime("2014-01-31T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */)).dst()).to.equal(0 /* RegularIntervals */);
    });
    describe("findFirst(<=start)", function () {
        it("should return start date in fromDate zone", function () {
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2013-01-01T12:00:00.00+02")).toString()).to.equal("2014-01-01T14:00:00.000+02:00");
        });
        it("should work for 400-year leap year", function () {
            expect((new Period(new DateTime("2000-02-29T12:00:00.000 UTC"), 1, 7 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("1999-12-31T12:00:00 UTC")).toString()).to.equal("2000-02-29T12:00:00.000 UTC");
        });
        it("should NOT return start date for the start date itself", function () {
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 UTC"), 2, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T14:00:00.00+02")).toString()).to.equal("2014-03-01T14:00:00.000+02:00");
        });
    });
    describe("Period(X, 1, X, RegularInterval).findFirst()", function () {
        it("should handle 1 millisecond", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 0 /* Millisecond */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:59.999 Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 0 /* Millisecond */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:59:59.999 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle 1 Second", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 1 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:59.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 1 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:59:59.000 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle 1 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 2 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:59.000 UTC")).toString()).to.equal("2014-03-30T02:00:00.000 UTC");
        });
        it("should handle 1 Hour", function () {
            // check around dst
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:10:00.000 UTC")).toString()).to.equal("2014-10-26T01:05:06.007 UTC");
            // check it returns OK in local time (which stays from 2AM at 2AM)
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T02:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 1, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T00:25:06.007 Africa/Accra");
        });
        it("should handle 1 Day", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 4 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 4 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-02T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Month", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-04-01T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-02-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Year", function () {
            // check it shifts local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 1, 7 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-03-29T05:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 7 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2015-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, 1, X, RegularLocalTime).findFirst()", function () {
        it("should handle 1 Millisecond", function () {
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:59.999 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 1 Second", function () {
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 1 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:59.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 1 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 2 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 1 Hour", function () {
            // check around dst
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
            // check it returns OK in local time (which changes from 2AM to 3AM)
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T03:00:00.000 Europe/Amsterdam");
        });
        it("should handle 1 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 1, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T01:05:06.007 Africa/Accra");
        });
        it("should handle 1 Day", function () {
            // check it keeps local time @ 12h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 4 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T12:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 4 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-02T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Month", function () {
            // check it keeps local time @ 12h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-04-01T12:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-02-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Year", function () {
            // check it keeps local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 1, 7 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-03-29T04:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 7 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2015-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, 2, X, RegularInterval).findFirst()", function () {
        it("should handle 2 Millisecond", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 0 /* Millisecond */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:59.998 Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 0 /* Millisecond */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:59:59.998 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle 2 Second", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 1 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:59:58.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase utc time, we expect to go from the FIRST 02:59:59 to 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 1 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:59:58.000 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle 2 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 2 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T01:58:00.000 UTC")).toString()).to.equal("2014-03-30T02:00:00.000 UTC");
        });
        it("should handle 2 Hour", function () {
            // check around dst
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-26T00:10:00.000 UTC")).toString()).to.equal("2014-10-26T01:05:06.007 UTC"); // note 1AM because start time is 11AM UTC
            // check it returns OK in local time (which stays from 2AM at 2AM)
            expect((new Period(new DateTime("1970-01-01T01:00:00.000 Europe/Amsterdam"), 2, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-10-25T23:10:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T02:00:00.000 Europe/Amsterdam");
        });
        it("should handle 2 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 2, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T00:25:06.007 Africa/Accra");
        });
        it("should handle 2 Day", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 4 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-31T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 4 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-02T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-04T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 1 Week", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 5 /* Week */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-30T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-04-03T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 1, 5 /* Week */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-02T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-01-09T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Month", function () {
            // check it shifts local time from 12h to 13h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-03-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-05-01T13:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Year", function () {
            // check it shifts local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 2, 7 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2016-03-29T05:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 7 /* Year */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2016-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, 2, X, RegularLocalTime).findFirst()", function () {
        it("should handle 2 Millisecond", function () {
            this.timeout(30 * 1000);
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:59.998 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 666, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:59.514 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 666, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:58.848 Europe/Amsterdam")).toString()).to.equal("2014-01-01T23:59:59.514 Europe/Amsterdam");
        });
        it("should handle 2 Second", function () {
            // note the target time is 2AM during DST backward, so 2AM exists twice.
            // Because we want to increase local time, we expect to go from the FIRST 02:59:59 to 03:00:00, skippint the second 02:00:00
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 1 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:59:58.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 2 Minute", function () {
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 2 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:58:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should handle 2 Hour", function () {
            // check around dst - because local time is kept in rythm, UTC time varies in hours
            expect((new Period(new DateTime("1970-01-01T11:00:00 Europe/Amsterdam"), 2, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-25T23:00:00.000 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC")).toString()).to.equal("2014-10-26T03:00:00.000 UTC");
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T01:00:00.000 UTC")).toString()).to.equal("2014-10-26T03:00:00.000 UTC");
            // check it returns OK in local time (which changes from 2AM to 3AM)
            expect((new Period(new DateTime("1970-01-01T12:00:00 Europe/Amsterdam"), 2, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-10-26T00:00:00.000 UTC").toZone(TimeZone.zone("Europe/Amsterdam"))).toString()).to.equal("2014-10-26T04:00:00.000 Europe/Amsterdam");
        });
        it("should handle 2 Hour in zone with DST !== 1h", function () {
            // Ghana had DST of 20 minutes
            expect((new Period(new DateTime("1930-01-01T12:05:06.007 Africa/Accra"), 2, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("1937-10-26T00:10:00.000 Africa/Accra")).toString()).to.equal("1937-10-26T02:05:06.007 Africa/Accra");
        });
        it("should handle 2 Day", function () {
            // check it keeps local time @ 12h across DST
            expect((new Period(new DateTime("2014-03-26T12:00:00.000 Europe/Amsterdam"), 2, 4 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-29T12:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-30T12:00:00.000 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("2014-03-26T12:05:06.007 Europe/Amsterdam"), 2, 4 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-03-28T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-03-30T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Month", function () {
            // check it keeps local time @ 12h
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-02-28T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2014-03-01T12:05:06.007 Europe/Amsterdam");
        });
        it("should handle 2 Year", function () {
            // check it keeps local time (note in 2015 dst change is earlier)
            expect((new Period(new DateTime("2014-03-29T04:00:00.007 Europe/Amsterdam"), 2, 7 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2013-04-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-03-29T04:00:00.007 Europe/Amsterdam");
            // check it returns greater time for boundary fromdate
            expect((new Period(new DateTime("1970-01-01T12:05:06.007 Europe/Amsterdam"), 2, 7 /* Year */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T12:05:06.007 Europe/Amsterdam")).toString()).to.equal("2016-01-01T12:05:06.007 Europe/Amsterdam");
        });
    });
    describe("Period(X, >X, X, RegularInterval).findFirst()", function () {
        it("should handle >1000 Millisecond", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2000, 0 /* Millisecond */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:00:02.000 Europe/Amsterdam");
            // check no effect on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 666, 0 /* Millisecond */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T23:59:59.514 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.180 Europe/Amsterdam");
        });
        it("should handle >60 Second", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 1 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:02:00.000 Europe/Amsterdam");
            // check no effect on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 1 /* Second */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T23:59:54.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:01:00.000 Europe/Amsterdam");
        });
        it("should handle >60 Minute", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 2 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T02:00:00.000 Europe/Amsterdam");
            // check no effect on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 2 /* Minute */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T23:06:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:12:00.000 Europe/Amsterdam");
        });
        it("should handle >24 Hour", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 48, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-19T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-21T00:00:00.000 Europe/Amsterdam");
            // check that non-multiple of a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 25, 3 /* Hour */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
        });
        it("should handle >31 Day", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 40, 4 /* Day */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-20T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-02-10T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >53 Week", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 54, 5 /* Week */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-01-14T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >12 Month", function () {
            // non-leap year
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 13, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-02-01T00:00:00.000 Europe/Amsterdam");
            // leap year should not make a difference
            expect((new Period(new DateTime("2016-01-01T00:00:00.000 Europe/Amsterdam"), 13, 6 /* Month */, 0 /* RegularIntervals */)).findFirst(new DateTime("2016-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2017-02-01T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("Period(X, >X, X, RegularLocalTime).findFirst()", function () {
        it("should handle >1000 Millisecond", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2000, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:00:02.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2666, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:57.334 Europe/Amsterdam")).toString()).to.equal("2014-01-01T23:59:59.728 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 2666, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:59.728 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            // half a day offset
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 2666, 0 /* Millisecond */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-02T11:59:59.728 Europe/Amsterdam")).toString()).to.equal("2014-01-02T12:00:00.000 Europe/Amsterdam");
        });
        it("should handle >60 Second", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 1 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:02:00.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 1 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:54.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 1 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:59:53.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T23:59:54.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 66, 1 /* Second */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-02-02T11:59:53.000 Europe/Amsterdam")).toString()).to.equal("2014-02-02T11:59:54.000 Europe/Amsterdam");
        });
        it("should handle >60 Minute", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 120, 2 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T02:00:00.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 2 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:06:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 66, 2 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T23:05:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T23:06:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 66, 2 /* Minute */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-02T11:05:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T11:06:00.000 Europe/Amsterdam");
        });
        it("should handle >24 Hour", function () {
            // check that twice a unit works
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 48, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-19T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-21T00:00:00.000 Europe/Amsterdam");
            // check reset on day boundary for non-factor of 24h
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 5, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T20:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T00:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 5, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-01T19:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-01T20:00:00.000 Europe/Amsterdam");
            expect((new Period(new DateTime("2014-01-01T12:00:00.000 Europe/Amsterdam"), 5, 3 /* Hour */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-02T07:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-01-02T08:00:00.000 Europe/Amsterdam");
        });
        it("should handle >31 Day", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 40, 4 /* Day */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-20T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2014-02-10T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >53 Week", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 54, 5 /* Week */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-01-14T00:00:00.000 Europe/Amsterdam");
        });
        it("should handle >12 Month", function () {
            // non-leap year
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 13, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2015-02-01T00:00:00.000 Europe/Amsterdam");
            // multiple of 12 months
            expect((new Period(new DateTime("2014-01-01T00:00:00.000 Europe/Amsterdam"), 24, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2014-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
            // leap year should not make a difference
            expect((new Period(new DateTime("2016-01-01T00:00:00.000 Europe/Amsterdam"), 13, 6 /* Month */, 1 /* RegularLocalTime */)).findFirst(new DateTime("2016-01-10T00:00:00.000 Europe/Amsterdam")).toString()).to.equal("2017-02-01T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("Period(RegularInterval).findNext()", function () {
        it("Should handle no count", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam")).toString()).to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
        });
        it("Should handle count 1", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-01T02:00:00.000 Europe/Amsterdam");
        });
        it("Should handle count >1", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString()).to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
        });
        it("Should return same zone as parameter", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 UTC"), 10).toString()).to.equal("2014-02-01T11:00:00.000 UTC");
        });
        it("Should not handle DST", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("Should throw on null datetime", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            assert.throws(function () {
                p.findNext(null);
            });
        });
        it("Should throw on non-integer count", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            assert.throws(function () {
                p.findNext(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1.1);
            });
        });
        it("Should handle end-of-month for 28 < day < 31", function () {
            var p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, 6 /* Month */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
        it("Should handle end-of-month for day == 31", function () {
            var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, 6 /* Month */, 0 /* RegularIntervals */);
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-31T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 3).toString()).to.equal("2014-04-30T01:00:00.000 Europe/Amsterdam"); // note local time changes because RegularIntervals is set
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("Period(RegularLocalTime).findNext()", function () {
        it("Should handle DST", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-10-26T00:00:00 UTC")).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("Should handle count >1", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-02-01T01:00:00 Europe/Amsterdam"), 10).toString()).to.equal("2014-02-01T11:00:00.000 Europe/Amsterdam");
        });
        it("Should handle end-of-month for 28 < day < 31", function () {
            var p = new Period(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1, 6 /* Month */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-29T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
        it("Should handle end-of-month for day == 31", function () {
            var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, 6 /* Month */, 1 /* RegularLocalTime */);
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-03-31T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 3).toString()).to.equal("2014-04-30T00:00:00.000 Europe/Amsterdam");
            expect(p.findNext(new DateTime("2014-01-29T00:00:00 Europe/Amsterdam"), 25).toString()).to.equal("2016-02-29T00:00:00.000 Europe/Amsterdam");
        });
    });
    describe("findPrev()", function () {
        it("should return null for start date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findPrev(new DateTime("2013-12-31T23:00:00 UTC"))).to.equal(null);
        });
        it("should return null for before start date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findPrev(new DateTime("2013-12-31T23:00:00 UTC"))).to.equal(null);
        });
        it("should return the start date for first period", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findPrev(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam")).toString()).to.equal("2014-01-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should return the date in the zone of the given time", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.findPrev(new DateTime("2014-01-01T01:00:00 UTC")).toString()).to.equal("2014-01-01T00:00:00.000 UTC");
        });
        it("Should handle end-of-month", function () {
            var p = new Period(new DateTime("2014-01-31T00:00:00 Europe/Amsterdam"), 1, 6 /* Month */, 1 /* RegularLocalTime */);
            expect(p.findPrev(new DateTime("2014-02-28T00:00:00 Europe/Amsterdam"), 1).toString()).to.equal("2014-01-31T00:00:00.000 Europe/Amsterdam");
            expect(p.findPrev(new DateTime("2014-03-31T00:00:00 Europe/Amsterdam"), 2).toString()).to.equal("2014-01-31T00:00:00.000 Europe/Amsterdam");
        });
        it("Should handle regular local time", function () {
            var p = new Period(new DateTime("2014-01-01T08:00:00 Europe/Amsterdam"), 1, 4 /* Day */, 1 /* RegularLocalTime */);
            expect(p.findPrev(new DateTime("2014-03-30T08:00:00 Europe/Amsterdam")).toString()).to.equal("2014-03-29T08:00:00.000 Europe/Amsterdam");
        });
        it("Should handle regular intervals", function () {
            var p = new Period(new DateTime("2014-01-01T08:00:00 Europe/Amsterdam"), 1, 4 /* Day */, 0 /* RegularIntervals */);
            expect(p.findPrev(new DateTime("2014-03-30T07:00:00 UTC")).toString()).to.equal("2014-03-29T07:00:00.000 UTC");
        });
        it("Should handle count > 1", function () {
            var p = new Period(new DateTime("2014-01-01T08:00:00 Europe/Amsterdam"), 1, 4 /* Day */, 0 /* RegularIntervals */);
            expect(p.findPrev(new DateTime("2014-03-30T07:00:00 UTC"), 2).toString()).to.equal("2014-03-28T07:00:00.000 UTC");
        });
    });
    describe("isBoundary()", function () {
        it("should return true for start date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"))).to.equal(true);
        });
        it("should return true for boundary date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(new DateTime("2014-01-02T02:00:00 Europe/Amsterdam"))).to.equal(true);
        });
        it("should return false for non-boundary date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(new DateTime("2014-01-02T02:00:01 Europe/Amsterdam"))).to.equal(false);
        });
        it("should return false for null date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.isBoundary(null)).to.equal(false);
        });
    });
    describe("equals()", function () {
        it("should return false for periods with different start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:01 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with equal start but different time zone effect", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with different amount", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 2, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with different unit", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return false for periods with different DST setting that matters", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.equals(q)).to.equal(false);
        });
        it("should return true for periods different DST setting that does not matter", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.equals(q)).to.equal(true);
        });
        it("should return true for identical periods", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(true);
        });
        it("should return true for periods with equal but not identical start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 GMT"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(true);
        });
        it("should return true for periods with different unit and amount that adds up to same", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 60, 2 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.equals(q)).to.equal(true);
        });
    });
    describe("identical()", function () {
        it("should return false for periods with different start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:01 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with equal start but different time zone effect", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T01:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different amount", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 2, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different unit", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 2 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different DST setting that matters", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods different DST setting that does not matter", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with equal but not identical start", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 GMT"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return false for periods with different unit and amount that adds up to same", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 60, 2 /* Minute */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(false);
        });
        it("should return true for identical periods", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            var q = new Period(new DateTime("2014-01-01T00:00:00 UTC"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.identical(q)).to.equal(true);
        });
    });
    describe("toString()", function () {
        it("should work with naive date", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000");
        });
        it("should work with PeriodDst.RegularLocalTime", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular local time");
        });
        it("should work with PeriodDst.RegularIntervals", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 1, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.toString()).to.equal("1 hour, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");
        });
        it("should work with multiple hours", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00 Europe/Amsterdam"), 2, 3 /* Hour */, 0 /* RegularIntervals */);
            expect(p.toString()).to.equal("2 hours, starting at 2014-01-01T00:00:00.000 Europe/Amsterdam, keeping regular intervals");
        });
    });
    describe("toIsoString()", function () {
        it("should work", function () {
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 60, 0 /* Millisecond */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P0.060S");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 1 /* Second */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1S");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 2 /* Minute */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/PT1M");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 3 /* Hour */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1H");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 4 /* Day */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1D");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 5 /* Week */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1W");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 6 /* Month */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1M");
            expect((new Period(new DateTime("2014-01-01T00:00:00"), 1, 7 /* Year */, 1 /* RegularLocalTime */)).toIsoString()).to.equal("2014-01-01T00:00:00.000/P1Y");
        });
    });
    describe("inspect()", function () {
        it("should work", function () {
            var p = new Period(new DateTime("2014-01-01T00:00:00"), 1, 3 /* Hour */, 1 /* RegularLocalTime */);
            expect(p.inspect()).to.equal("[Period: " + p.toString() + "]");
        });
    });
});
// todo test DST zone where DST save is not a whole hour (20 or 40 minutes)
// todo test zone with two DSTs

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QtcGVyaW9kLnRzIl0sIm5hbWVzIjpbIlRlc3RUaW1lU291cmNlIiwiVGVzdFRpbWVTb3VyY2UuY29uc3RydWN0b3IiLCJUZXN0VGltZVNvdXJjZS5ub3ciXSwibWFwcGluZ3MiOiJBQUFBLDZDQUE2QztBQUU3QyxJQUFPLGdCQUFnQixXQUFXLG9CQUFvQixDQUFDLENBQUM7QUFDeEQsQUFDQSw4RkFEOEY7QUFDOUYsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsd0JBQXdCLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUc5RCxJQUFPLE1BQU0sV0FBVyxRQUFRLENBQUMsQ0FBQztBQUNsQyxJQUFPLElBQUksV0FBVyxNQUFNLENBQUMsQ0FBQztBQUM5QixJQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBRTVCLElBQU8sYUFBYSxXQUFXLGNBQWMsQ0FBQyxDQUFDO0FBRS9DLElBQU8sUUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7QUFDekMsSUFBTyxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQztBQUN6QyxJQUFPLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDO0FBQ3JDLElBQU8sU0FBUyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUM7QUFFM0MsSUFBTyxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQztBQUN6QyxJQUFPLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO0FBRXpDLEFBQ0EsbUJBRG1CO0lBQ2IsY0FBYztJQUFwQkEsU0FBTUEsY0FBY0E7UUFDWkMsZ0JBQVdBLEdBQVNBLElBQUlBLElBQUlBLENBQUNBLDBCQUEwQkEsQ0FBQ0EsQ0FBQ0E7SUFLakVBLENBQUNBO0lBSEFELDRCQUFHQSxHQUFIQTtRQUNDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUN6QkEsQ0FBQ0E7SUFDRkYscUJBQUNBO0FBQURBLENBTkEsQUFNQ0EsSUFBQTtBQUVELEFBQ0Esa0RB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Q0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFZLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN4SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxBQUNBLHNEQURzRDtZQUN0RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFZLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN4SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRTtZQUMzQixBQUNBLDZDQUQ2QztZQUM3QyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMxSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxBQUNBLHNEQURzRDtZQUN0RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFjLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUMxSCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENB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LFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQzNCLEFBQ0Esa0NBRGtDO1lBQ2xDLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWMsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzFILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELEFBQ0Esc0RBRHNEO1lBQ3RELE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWMsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzFILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHNCQUFzQixFQUFFO1lBQzFCLEFBQ0EsaUVBRGlFO1lBQ2pFLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQ3pILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxD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QUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDeEgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsc0JBQXNCLEVBQUU7WUFDMUIsQUFDQSw2Q0FENkM7WUFDN0MsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsQUFDQSw2Q0FENkM7WUFDN0MsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsc0JBQXNCLEVBQUU7WUFDMUIsQUFDQSxrRUFEa0U7WUFDbEUsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQywrQ0FBK0MsRUFBRTtRQUN6RCxFQUFFLENBQUMsNkJBQTZCLEVBQUU7WUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDeEIsQUFFQSx3RUFGd0U7WUFDeEUsNEhBQTRIO1lBQzVILE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLG1CQUFvQixFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDNUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNsRSxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFFMUMsQUFDQSxvREFEb0Q7WUFDcEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxHQUFHLEVBQUUsbUJBQW9CLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNsSSxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQy9FLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxtQkFBb0IsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQ2xJLFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdCQUF3QixFQUFFO1lBQzVCLEFBRUEsd0VBRndFO1lBQ3hFLDRIQUE0SDtZQUM1SCxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN2SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFlLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUN2SCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtZQUMxQixBQUNBLG1GQURtRjtZQUNuRixNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNySCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNySCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNySCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2xFLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUMxQyxBQUNBLG9FQURvRTtZQUNwRSxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQyxDQUNySCxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUM1RyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsOENBQThDLEVBQUU7WUFDbEQsQUFDQSw4QkFEOEI7WUFDOUIsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDckgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMzRSxFQUFFLENBQUMsS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMscUJBQXFCLEVBQUU7WUFDekIsQUFDQSw2Q0FENkM7WUFDN0MsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDeEgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDeEgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsQUFDQSxrQ0FEa0M7WUFDbEMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxzREFEc0Q7WUFDdEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixD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QyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsR0FBRyxFQUFFLGNBQWUsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzdILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELEFBQ0Esd0RBRHdEO1lBQ3hELE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsRUFBRSxFQUFFLGNBQWUsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzVILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdCQUF3QixFQUFFO1lBQzVCLEFBQ0EsZ0NBRGdDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzFILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDL0UsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELEFBQ0EsMENBRDBDO1lBQzFDLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDLENBQzFILFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsUUFBUSxF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RSxFQUFFLEVBQUUsY0FBZSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDNUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBZSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDNUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsMEJBQTBCLEVBQUU7WUFDOUIsQUFDQSxnQ0FEZ0M7WUFDaEMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxHQUFHLEVBQUUsY0FBZSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDN0gsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSxvREFEb0Q7WUFDcEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBZSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDNUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBZSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDNUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBZSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDNUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7WUFDNUIsQUFDQSxnQ0FEZ0M7WUFDaEMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFFdkQsQUFDQSxvREFEb0Q7WUFDcEQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsV0FBWSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDekgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7WUFDNUIsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDMUgsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMseUJBQXlCLEVBQUU7WUFDN0IsQUFDQSxnQkFEZ0I7WUFDaEIsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDM0gsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSx3QkFEd0I7WUFDeEIsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDM0gsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsQUFDQSx5Q0FEeUM7WUFDekMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDM0gsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRTtRQUM5QyxFQUFFLENBQUMsd0JBQXdCLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUM7WUFDdkgsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ2pGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRTtZQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3BGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3JGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRTtZQUMxQyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3BILENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQzNCLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQWEsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDO1lBQ3ZILE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUNoSCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywrQkFBK0IsRUFBRTtZQUNuQyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNiLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRTtZQUN2QyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNiLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN2RSxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDhDQUE4QyxFQUFFO1lBQ2xELElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWMsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDO1lBQ3hILE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDcEYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDcEYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDckYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDBDQUEwQyxFQUFFO1lBQzlDLElBQUksQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWMsRUFBRSx3QkFBMEIsQ0FBQyxDQUFDO1lBQ3hILE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDcEYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDcEYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FDcEYsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxFQUFFLDBEQUEwRDtZQUNsSCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQ3JGLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLHFDQUFxQyxFQUFFO1FBQy9DLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRTtZQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDaEgsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7WUFDNUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUM7WUFDdkgsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNyRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsOENBQThDLEVBQUU7WUFDbEQsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUM7WUFDeEgsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNwRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsc0NBQXNDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUNyRixFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsMENBQTBDLEVBQUU7WUFD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Q0FDcEcsV0FBVyxFQUFFLENBQUMsQ0FDZCxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYyxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDckcsV0FBVyxFQUFFLENBQUMsQ0FDZCxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBYSxFQUFFLHdCQUEwQixDQUFDLENBQUMsQ0FDcEcsV0FBVyxFQUFFLENBQUMsQ0FDZCxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxXQUFXLEVBQUU7UUFDckIsRUFBRSxDQUFDLGFBQWEsRUFBRTtZQUNqQixJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFhLEVBQUUsd0JBQTBCLENBQUMsQ0FBQztZQUN0RyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSixDQUFDLENBQUMsQ0FBQztBQUNILDJFQUEyRTtBQUMzRSwrQkFBK0IiLCJmaWxlIjoidGVzdC90ZXN0LXBlcmlvZC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19