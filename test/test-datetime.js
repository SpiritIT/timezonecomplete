/// <reference path="../typings/test.d.ts" />
var sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;
var basics = require("../lib/basics");
var datetimeFuncs = require("../lib/index");
var DateFunctions = datetimeFuncs.DateFunctions;
var DateTime = datetimeFuncs.DateTime;
var Duration = datetimeFuncs.Duration;
var TimeUnit = datetimeFuncs.TimeUnit;
var TimeZone = datetimeFuncs.TimeZone;
var WeekDay = datetimeFuncs.WeekDay;
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
describe("datetime loose", function () {
    // ensure time faked
    beforeEach(function () {
        testTimeSource.currentTime = new Date("2014-01-03T04:05:06.007Z");
        DateTime.timeSource = testTimeSource;
    });
    describe("nowLocal()", function () {
        it("should return something with a local time zone", function () {
            expect(datetimeFuncs.nowLocal().offset()).to.equal(-1 * testTimeSource.now().getTimezoneOffset());
        });
        it("should return the local time", function () {
            expect(datetimeFuncs.nowLocal().year()).to.equal(testTimeSource.currentTime.getFullYear());
            expect(datetimeFuncs.nowLocal().month()).to.equal(testTimeSource.currentTime.getMonth() + 1); // javascript starts from 0
            expect(datetimeFuncs.nowLocal().day()).to.equal(testTimeSource.currentTime.getDate());
            expect(datetimeFuncs.nowLocal().hour()).to.equal(testTimeSource.currentTime.getHours());
            expect(datetimeFuncs.nowLocal().minute()).to.equal(testTimeSource.currentTime.getMinutes());
            expect(datetimeFuncs.nowLocal().second()).to.equal(testTimeSource.currentTime.getSeconds());
            expect(datetimeFuncs.nowLocal().millisecond()).to.equal(testTimeSource.currentTime.getMilliseconds());
        });
    });
    describe("nowUtc()", function () {
        it("should return something with a local time zone", function () {
            expect(datetimeFuncs.nowUtc().zone()).to.equal(TimeZone.utc());
        });
        it("should return the local time", function () {
            expect(datetimeFuncs.nowUtc().year()).to.equal(testTimeSource.currentTime.getUTCFullYear());
            expect(datetimeFuncs.nowUtc().month()).to.equal(testTimeSource.currentTime.getUTCMonth() + 1); // javascript starts from 0
            expect(datetimeFuncs.nowUtc().day()).to.equal(testTimeSource.currentTime.getUTCDate());
            expect(datetimeFuncs.nowUtc().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
            expect(datetimeFuncs.nowUtc().minute()).to.equal(testTimeSource.currentTime.getUTCMinutes());
            expect(datetimeFuncs.nowUtc().second()).to.equal(testTimeSource.currentTime.getUTCSeconds());
            expect(datetimeFuncs.nowUtc().millisecond()).to.equal(testTimeSource.currentTime.getUTCMilliseconds());
        });
    });
    describe("now", function () {
        it("should return something with the given zone", function () {
            expect(datetimeFuncs.now(TimeZone.zone("+03:00")).zone()).to.equal(TimeZone.zone("+03:00"));
        });
        it("should return the zone time", function () {
            expect(datetimeFuncs.now(TimeZone.zone("+03:00")).hour()).to.equal(testTimeSource.currentTime.getUTCHours() + 3);
        });
        it("should default to UTC", function () {
            expect(datetimeFuncs.now().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
        });
    });
});
describe("DateTime", function () {
    // ensure time faked
    beforeEach(function () {
        testTimeSource.currentTime = new Date("2014-01-03T04:05:06.007Z");
        DateTime.timeSource = testTimeSource;
    });
    describe("nowLocal()", function () {
        it("should return something with a local time zone", function () {
            expect(DateTime.nowLocal().offset()).to.equal(-1 * testTimeSource.now().getTimezoneOffset());
        });
        it("should return the local time", function () {
            expect(DateTime.nowLocal().year()).to.equal(testTimeSource.currentTime.getFullYear());
            expect(DateTime.nowLocal().month()).to.equal(testTimeSource.currentTime.getMonth() + 1); // javascript starts from 0
            expect(DateTime.nowLocal().day()).to.equal(testTimeSource.currentTime.getDate());
            expect(DateTime.nowLocal().hour()).to.equal(testTimeSource.currentTime.getHours());
            expect(DateTime.nowLocal().minute()).to.equal(testTimeSource.currentTime.getMinutes());
            expect(DateTime.nowLocal().second()).to.equal(testTimeSource.currentTime.getSeconds());
            expect(DateTime.nowLocal().millisecond()).to.equal(testTimeSource.currentTime.getMilliseconds());
        });
    });
    describe("nowUtc()", function () {
        it("should return something with a local time zone", function () {
            expect(DateTime.nowUtc().zone()).to.equal(TimeZone.utc());
        });
        it("should return the local time", function () {
            expect(DateTime.nowUtc().year()).to.equal(testTimeSource.currentTime.getUTCFullYear());
            expect(DateTime.nowUtc().month()).to.equal(testTimeSource.currentTime.getUTCMonth() + 1); // javascript starts from 0
            expect(DateTime.nowUtc().day()).to.equal(testTimeSource.currentTime.getUTCDate());
            expect(DateTime.nowUtc().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
            expect(DateTime.nowUtc().minute()).to.equal(testTimeSource.currentTime.getUTCMinutes());
            expect(DateTime.nowUtc().second()).to.equal(testTimeSource.currentTime.getUTCSeconds());
            expect(DateTime.nowUtc().millisecond()).to.equal(testTimeSource.currentTime.getUTCMilliseconds());
        });
    });
    describe("now", function () {
        it("should return something with the given zone", function () {
            expect(DateTime.now(TimeZone.zone("+03:00")).zone()).to.equal(TimeZone.zone("+03:00"));
        });
        it("should return the zone time", function () {
            expect(DateTime.now(TimeZone.zone("+03:00")).hour()).to.equal(testTimeSource.currentTime.getUTCHours() + 3);
        });
        it("should default to UTC", function () {
            expect(DateTime.now().hour()).to.equal(testTimeSource.currentTime.getUTCHours());
        });
    });
    describe("fromExcelDate()", function () {
        it("should perform correct conversion", function () {
            expect(DateTime.fromExcel(42005.5430555556).toString()).to.equal("2015-01-01T13:02:00.000");
        });
        it("should add timezone if given", function () {
            expect(DateTime.fromExcel(42005.5430555556, TimeZone.zone("+03:00")).toString()).to.equal("2015-01-01T13:02:00.000+03:00");
        });
    });
    describe("constructor()", function () {
        it("should return something with a local time zone", function () {
            expect((new DateTime()).offset()).to.equal(-1 * testTimeSource.now().getTimezoneOffset());
        });
        it("should return the local time", function () {
            expect((new DateTime()).year()).to.equal(testTimeSource.currentTime.getFullYear());
            expect((new DateTime()).month()).to.equal(testTimeSource.currentTime.getMonth() + 1); // javascript starts from 0
            expect((new DateTime()).day()).to.equal(testTimeSource.currentTime.getDate());
            expect((new DateTime()).hour()).to.equal(testTimeSource.currentTime.getHours());
            expect((new DateTime()).minute()).to.equal(testTimeSource.currentTime.getMinutes());
            expect((new DateTime()).second()).to.equal(testTimeSource.currentTime.getSeconds());
            expect((new DateTime()).millisecond()).to.equal(testTimeSource.currentTime.getMilliseconds());
        });
    });
    describe("constructor(string)", function () {
        it("should parse unaware date", function () {
            var d = new DateTime("2014-05-06T07:08:09.010");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone()).to.be.null;
            expect(d.offset()).to.equal(0);
        });
        it("should parse only date", function () {
            var d = new DateTime("2014-05-06");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(0);
            expect(d.zone()).to.be.null;
            expect(d.offset()).to.equal(0);
        });
        it("should parse Zulu date", function () {
            var d = new DateTime("2014-05-06T07:08:09.010Z");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone().name()).to.equal("+00:00");
            expect(d.offset()).to.equal(0);
        });
        it("should parse zero-offset date", function () {
            var d = new DateTime("2014-05-06T07:08:09.010+00:00");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone().name()).to.equal("+00:00");
            expect(d.offset()).to.equal(0);
        });
        it("should parse positive-offset date", function () {
            var d = new DateTime("2014-05-06T07:08:09.010+01:30");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone()).to.equal(TimeZone.zone(90));
            expect(d.offset()).to.equal(90);
        });
        it("should parse negative-offset date", function () {
            var d = new DateTime("2014-05-06T07:08:09.010-01:30");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone()).to.equal(TimeZone.zone(-90));
            expect(d.offset()).to.equal(-90);
        });
        it("should parse IANA time zone", function () {
            var d = new DateTime("2014-05-06T07:08:09.010 Europe/Amsterdam");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone()).to.equal(TimeZone.zone("Europe/Amsterdam"));
            expect(d.offset()).to.equal(120);
        });
        it("should take care of whitespace", function () {
            var d = new DateTime(" \n\t2014-05-06T07:08:09.010 Europe/Amsterdam \n\t");
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(7);
            expect(d.minute()).to.equal(8);
            expect(d.second()).to.equal(9);
            expect(d.millisecond()).to.equal(10);
            expect(d.zone()).to.equal(TimeZone.zone("Europe/Amsterdam"));
            expect(d.offset()).to.equal(120);
        });
        it("should add given time zone", function () {
            var d = new DateTime("2014-05-06", TimeZone.zone(6));
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(0);
            expect(d.zone()).not.to.be.null;
            expect(d.offset()).to.equal(6);
        });
        it("should override time zone in string", function () {
            var d = new DateTime("2014-05-06T00:00:00+05", TimeZone.zone(6));
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(5);
            expect(d.day()).to.equal(6);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(0);
            expect(d.zone()).not.to.be.null;
            expect(d.offset()).to.equal(6);
        });
    });
    describe("constructor(date: Date, dateKind: DateFunctions, timeZone?: TimeZone)", function () {
        it("should parse date as local,unaware (winter time)", function () {
            var date = new Date("2014-01-02T03:04:05.006Z");
            var d = new DateTime(date, 0 /* Get */, null);
            expect(d.year()).to.equal(date.getFullYear());
            expect(d.month()).to.equal(date.getMonth() + 1);
            expect(d.day()).to.equal(date.getDate());
            expect(d.hour()).to.equal(date.getHours());
            expect(d.minute()).to.equal(date.getMinutes());
            expect(d.second()).to.equal(date.getSeconds());
            expect(d.millisecond()).to.equal(date.getMilliseconds());
            expect(d.zone()).to.be.null;
        });
        it("should parse date as utc,unaware (winter time)", function () {
            var date = new Date("2014-01-02T03:04:05.006Z");
            var d = new DateTime(date, 1 /* GetUTC */, null);
            expect(d.year()).to.equal(date.getUTCFullYear());
            expect(d.month()).to.equal(date.getUTCMonth() + 1);
            expect(d.day()).to.equal(date.getUTCDate());
            expect(d.hour()).to.equal(date.getUTCHours());
            expect(d.minute()).to.equal(date.getUTCMinutes());
            expect(d.second()).to.equal(date.getUTCSeconds());
            expect(d.millisecond()).to.equal(date.getUTCMilliseconds());
            expect(d.zone()).to.be.null;
        });
        it("should parse date as local,unaware (summer time)", function () {
            var date = new Date("2014-07-02T03:04:05.006Z");
            var d = new DateTime(date, 0 /* Get */, null);
            expect(d.year()).to.equal(date.getFullYear());
            expect(d.month()).to.equal(date.getMonth() + 1);
            expect(d.day()).to.equal(date.getDate());
            expect(d.hour()).to.equal(date.getHours());
            expect(d.minute()).to.equal(date.getMinutes());
            expect(d.second()).to.equal(date.getSeconds());
            expect(d.millisecond()).to.equal(date.getMilliseconds());
            expect(d.zone()).to.be.null;
        });
        it("should parse date as utc,unaware (summer time)", function () {
            var date = new Date("2014-07-02T03:04:05.006Z");
            var d = new DateTime(date, 1 /* GetUTC */, null);
            expect(d.year()).to.equal(date.getUTCFullYear());
            expect(d.month()).to.equal(date.getUTCMonth() + 1);
            expect(d.day()).to.equal(date.getUTCDate());
            expect(d.hour()).to.equal(date.getUTCHours());
            expect(d.minute()).to.equal(date.getUTCMinutes());
            expect(d.second()).to.equal(date.getUTCSeconds());
            expect(d.millisecond()).to.equal(date.getUTCMilliseconds());
            expect(d.zone()).to.be.null;
        });
        it("should parse date local,aware", function () {
            var date = new Date("2014-01-02T03:04:05.006Z");
            var d = new DateTime(date, 0 /* Get */, TimeZone.zone(90));
            expect(d.year()).to.equal(date.getFullYear());
            expect(d.month()).to.equal(date.getMonth() + 1);
            expect(d.day()).to.equal(date.getDate());
            expect(d.hour()).to.equal(date.getHours());
            expect(d.minute()).to.equal(date.getMinutes());
            expect(d.second()).to.equal(date.getSeconds());
            expect(d.millisecond()).to.equal(date.getMilliseconds());
            expect(d.offset()).to.equal(90);
        });
        it("should parse date utc,aware", function () {
            var date = new Date("2014-01-02T03:04:05.006Z");
            var d = new DateTime(date, 1 /* GetUTC */, TimeZone.zone(90));
            expect(d.year()).to.equal(date.getUTCFullYear());
            expect(d.month()).to.equal(date.getUTCMonth() + 1);
            expect(d.day()).to.equal(date.getUTCDate());
            expect(d.hour()).to.equal(date.getUTCHours());
            expect(d.minute()).to.equal(date.getUTCMinutes());
            expect(d.second()).to.equal(date.getUTCSeconds());
            expect(d.millisecond()).to.equal(date.getUTCMilliseconds());
            expect(d.offset()).to.equal(90);
        });
    });
    describe("constructor(year, month, ..., millisecond, timeZone?: TimeZone)", function () {
        it("full entries, unaware", function () {
            var d = new DateTime(2014, 1, 2, 3, 4, 5, 6, null);
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(1);
            expect(d.day()).to.equal(2);
            expect(d.hour()).to.equal(3);
            expect(d.minute()).to.equal(4);
            expect(d.second()).to.equal(5);
            expect(d.millisecond()).to.equal(6);
            expect(d.zone()).to.be.null;
        });
        it("missing entries, unaware", function () {
            var d = new DateTime(2014, 1, 2);
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(1);
            expect(d.day()).to.equal(2);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(0);
            expect(d.zone()).to.be.null;
        });
        it("full entries, aware", function () {
            var d = new DateTime(2014, 1, 2, 3, 4, 5, 6, TimeZone.zone(90));
            expect(d.year()).to.equal(2014);
            expect(d.month()).to.equal(1);
            expect(d.day()).to.equal(2);
            expect(d.hour()).to.equal(3);
            expect(d.minute()).to.equal(4);
            expect(d.second()).to.equal(5);
            expect(d.millisecond()).to.equal(6);
            expect(d.zone()).to.equal(TimeZone.zone(90));
        });
        it("should normalize around DST", function () {
            var d = new DateTime(2014, 3, 30, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // non-existing due to DST forward
            expect(d.hour()).to.equal(3); // should be normalized to 3AM
        });
        it("should throw on wrong input", function () {
            /* tslint:disable:no-unused-expression */
            assert.throws(function () {
                new DateTime(2014, 0, 1);
            }, "doesn't throw on invalid month");
            assert.throws(function () {
                new DateTime(2014, 13, 1);
            }, "doesn't throw on invalid month");
            assert.throws(function () {
                new DateTime(2014, 1, 0);
            }, "doesn't throw on invalid day");
            assert.throws(function () {
                new DateTime(2014, 1, 32);
            }, "doesn't throw on invalid day");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 24);
            }, "doesn't throw on invalid hour");
            assert.throws(function () {
                new DateTime(2014, 1, 30, -1);
            }, "doesn't throw on invalid hour");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 1, 60);
            }, "doesn't throw on invalid minute");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 1, -1);
            }, "doesn't throw on invalid minute");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 1, 1, 60);
            }, "doesn't throw on invalid second");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 1, 1, -1);
            }, "doesn't throw on invalid second");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 1, 1, 1, -1);
            }, "doesn't throw on invalid millisecond");
            assert.throws(function () {
                new DateTime(2014, 1, 30, 1, 1, 1, 1000);
            }, "doesn't throw on invalid millisecond");
            /* tslint:enable:no-unused-expression */
        });
    });
    describe("constructor(utcUnixTime: number, timeZone?: TimeZone)", function () {
        it("unaware", function () {
            var d = new DateTime(1);
            expect(d.year()).to.equal(1970);
            expect(d.month()).to.equal(1);
            expect(d.day()).to.equal(1);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(1);
            expect(d.zone()).to.be.null;
        });
        it("UTC", function () {
            var d = new DateTime(1, TimeZone.utc());
            expect(d.year()).to.equal(1970);
            expect(d.month()).to.equal(1);
            expect(d.day()).to.equal(1);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(1);
            expect(d.zone()).to.equal(TimeZone.utc());
        });
        it("non-utc", function () {
            var d = new DateTime(1, TimeZone.zone(240));
            expect(d.year()).to.equal(1970);
            expect(d.month()).to.equal(1);
            expect(d.day()).to.equal(1);
            expect(d.hour()).to.equal(0);
            expect(d.minute()).to.equal(0);
            expect(d.second()).to.equal(0);
            expect(d.millisecond()).to.equal(1);
            expect(d.zone()).to.equal(TimeZone.zone(240));
        });
        it("non-existing", function () {
            // non-existing due to DST forward
            var d = new DateTime(basics.timeToUnixNoLeapSecs(2014, 3, 30, 2, 0, 0, 0), TimeZone.zone("Europe/Amsterdam"));
            expect(d.hour()).to.equal(3); // should be normalized to 3AM
        });
    });
    describe("clone", function () {
        it("should return an object with the same value", function () {
            var d = new DateTime(2015, 2, 3, 4, 5, 6, 7, TimeZone.zone("+03"));
            expect(d.clone().unixUtcMillis()).to.equal(d.unixUtcMillis());
        });
        it("should return a new object", function () {
            var d = new DateTime(2015, 2, 3, 4, 5, 6, 7, TimeZone.zone("+03"));
            expect(d.clone() === d).to.equal(false);
        });
    });
    describe("withZone()", function () {
        it("should allow changing naive date to aware date", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, null);
            var e = d.withZone(TimeZone.zone(1));
            expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone(1)))).to.equal(true);
        });
        it("should allow changing aware date to naive date", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone(1));
            var e = d.withZone(null);
            expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0, null))).to.equal(true);
        });
        it("should allow changing aware date to aware date", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone(1));
            var e = d.withZone(TimeZone.zone("America/Chicago"));
            expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("America/Chicago")))).to.equal(true);
        });
        it("should return a new object", function () {
            var d = new DateTime(2015, 2, 3, 4, 5, 6, 7, TimeZone.zone("+03"));
            expect(d.withZone(d.zone()) === d).to.equal(false);
        });
    });
    describe("convert()", function () {
        it("unaware to aware", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            assert.throws(function () {
                d.convert(TimeZone.zone("Europe/Amsterdam"));
            });
        });
        it("unaware to unaware", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            d.convert(null);
            expect(d.equals(new DateTime(2014, 1, 1, 0, 0, 0, 0))).to.equal(true);
        });
        it("aware", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
            d.convert(TimeZone.zone("-01:00"));
            expect(d.hour()).to.equal(10);
        });
        it("aware to unaware", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
            d.convert(null);
            expect(d.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0))).to.equal(true);
        });
    });
    describe("toZone()", function () {
        it("unaware to aware", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            assert.throws(function () {
                d.toZone(TimeZone.zone("Europe/Amsterdam"));
            });
        });
        it("unaware to unaware", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            expect(d.equals(d.toZone(null))).to.equal(true);
        });
        it("aware", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
            var e = d.toZone(TimeZone.zone("-01:00"));
            expect(d.hour()).to.equal(12);
            expect(e.hour()).to.equal(10);
        });
        it("aware to unaware", function () {
            var d = new DateTime(2014, 1, 1, 12, 0, 0, 0, TimeZone.zone("+01:00"));
            var e = d.toZone(null);
            expect(e.equals(new DateTime(2014, 1, 1, 12, 0, 0, 0))).to.equal(true);
        });
        it("Europe/Amsterdam DST forward to UTC", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T00:59:59.000 UTC");
            d = new DateTime(2014, 3, 30, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:00:00.000 UTC");
        });
        it("Europe/Amsterdam DST forward to UTC (nonexisting)", function () {
            var d = new DateTime(2014, 3, 30, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // non-existing date
            expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:00:00.000 UTC");
        });
        it("Europe/Amsterdam DST backward to UTC", function () {
            var d = new DateTime(2014, 10, 26, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-10-25T23:59:59.000 UTC");
            d = new DateTime(2014, 10, 26, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
            d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam")); // could mean either of two dates
            expect(d.toZone(TimeZone.utc()).toString()).to.satisfy(function (s) {
                return (s === "2014-10-26T00:59:59.000 UTC" || s === "2014-10-26T01:59:59.000	 UTC");
            });
        });
        it("Europe/Amsterdam DST forward from UTC", function () {
            var d = new DateTime("2014-03-30T00:59:59.000 UTC");
            expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-03-30T01:59:59.000 Europe/Amsterdam");
            d = new DateTime("2014-03-30T01:00:00.000 UTC");
            expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
        });
        it("Europe/Amsterdam DST backward from UTC", function () {
            var d = new DateTime("2014-10-25T23:59:59.000 UTC");
            expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T01:59:59.000 Europe/Amsterdam");
            d = new DateTime("2014-10-26T02:00:00.000 UTC");
            expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T03:00:00.000 Europe/Amsterdam");
            d = new DateTime("2014-10-26T00:59:59.000 UTC");
            expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T02:59:59.000 Europe/Amsterdam");
            d = new DateTime("2014-10-26T01:59:59.000 UTC");
            expect(d.toZone(TimeZone.zone("Europe/Amsterdam")).toString()).to.equal("2014-10-26T02:59:59.000 Europe/Amsterdam");
        });
        it("maintains UTC through conversions", function () {
            // expect UTC to be maintained through conversions in the presence of DST switch
            var d = (new DateTime(2014, 10, 26, 0, 0, 0, 0, TimeZone.utc())).toZone(TimeZone.zone("Europe/Amsterdam")).toZone(TimeZone.utc());
            expect(d.toString()).to.equal("2014-10-26T00:00:00.000 UTC");
            d = (new DateTime(2014, 10, 26, 1, 0, 0, 0, TimeZone.utc())).toZone(TimeZone.zone("Europe/Amsterdam")).toZone(TimeZone.utc());
            expect(d.toString()).to.equal("2014-10-26T01:00:00.000 UTC");
            d = (new DateTime(2014, 10, 26, 2, 0, 0, 0, TimeZone.utc())).toZone(TimeZone.zone("Europe/Amsterdam")).toZone(TimeZone.utc());
            expect(d.toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
    });
    describe("toDate()", function () {
        it("unaware", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            var date = d.toDate();
            expect(date.getFullYear()).to.equal(2014);
            expect(date.getMonth()).to.equal(0);
            expect(date.getDate()).to.equal(1);
            expect(date.getHours()).to.equal(0);
            expect(date.getMinutes()).to.equal(0);
            expect(date.getSeconds()).to.equal(0);
            expect(date.getMilliseconds()).to.equal(0);
        });
        it("aware", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("+01:00"));
            var date = d.toDate();
            expect(date.getFullYear()).to.equal(2014);
            expect(date.getMonth()).to.equal(0);
            expect(date.getDate()).to.equal(1);
            expect(date.getHours()).to.equal(0);
            expect(date.getMinutes()).to.equal(0);
            expect(date.getSeconds()).to.equal(0);
            expect(date.getMilliseconds()).to.equal(0);
        });
    });
    // todo check normalization
    describe("add(duration)", function () {
        it("should add zero", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            var e = d.add(Duration.hours(0));
            expect(d.toString()).to.equal(e.toString());
        });
        it("should add positive value", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            var e = d.add(Duration.hours(1));
            expect(d.hour()).to.equal(0);
            expect(e.hour()).to.equal(1);
        });
        it("should add negative value", function () {
            var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
            var e = d.add(Duration.hours(-1));
            expect(d.hour()).to.equal(1);
            expect(e.hour()).to.equal(0);
        });
        it("should account for DST forward", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(Duration.hours(1));
            expect(e.toString()).to.equal("2014-03-30T03:59:59.000 Europe/Amsterdam");
        });
        it("should account for DST forward (2)", function () {
            var d = new DateTime(2014, 3, 30, 1, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(Duration.hours(1));
            expect(e.toString()).to.equal("2014-03-30T03:00:00.000 Europe/Amsterdam");
        });
        it("should account for DST backward", function () {
            // the conversion to UTC for this date is not well-defined, could mean either
            // the first 02:59:59 or the second one of that day
            var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(Duration.hours(1));
            expect(e.toString()).to.satisfy(function (s) {
                return (s === "2014-10-26T02:59:59.000 Europe/Amsterdam" || s === "2014-10-26T03:59:59.000 Europe/Amsterdam");
            });
        });
    });
    describe("add(amount, unit)", function () {
        it("should add 0", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.add(0, 0 /* Millisecond */).toString()).to.equal(d.toString());
            expect(d.add(0, 1 /* Second */).toString()).to.equal(d.toString());
            expect(d.add(0, 2 /* Minute */).toString()).to.equal(d.toString());
            expect(d.add(0, 3 /* Hour */).toString()).to.equal(d.toString());
            expect(d.add(0, 4 /* Day */).toString()).to.equal(d.toString());
            expect(d.add(0, 5 /* Week */).toString()).to.equal(d.toString());
            expect(d.add(0, 6 /* Month */).toString()).to.equal(d.toString());
            expect(d.add(0, 7 /* Year */).toString()).to.equal(d.toString());
        });
        it("should add milliseconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(23, 0 /* Millisecond */);
            expect(e.toString()).to.equal("2014-01-01T00:00:00.023 Europe/Amsterdam");
        });
        it("should add more than 1000 milliseconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1001, 0 /* Millisecond */);
            expect(e.toString()).to.equal("2014-01-01T00:00:01.001 Europe/Amsterdam");
        });
        it("should add seconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(23, 1 /* Second */);
            expect(e.toString()).to.equal("2014-01-01T00:00:23.000 Europe/Amsterdam");
        });
        it("should add more than 60 seconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(61, 1 /* Second */);
            expect(e.toString()).to.equal("2014-01-01T00:01:01.000 Europe/Amsterdam");
        });
        it("should add minutes", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(23, 2 /* Minute */);
            expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
        });
        it("should add more than 60 minutes", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(61, 2 /* Minute */);
            expect(e.toString()).to.equal("2014-01-01T01:01:00.000 Europe/Amsterdam");
        });
        it("should add hours", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(23, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-01-01T23:00:00.000 Europe/Amsterdam");
        });
        it("should add more than 24 hours", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(25, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
        });
        it("should add days", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(23, 4 /* Day */);
            expect(e.toString()).to.equal("2014-01-24T00:00:00.000 Europe/Amsterdam");
        });
        it("should add more than 30 days", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(31, 4 /* Day */);
            expect(e.toString()).to.equal("2014-02-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should add weeks", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(2, 5 /* Week */);
            expect(e.toString()).to.equal("2014-01-15T00:00:00.000 Europe/Amsterdam");
        });
        it("should add months", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(2, 6 /* Month */);
            expect(e.toString()).to.equal("2014-03-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should add months across year boundary", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(12, 6 /* Month */);
            expect(e.toString()).to.equal("2015-01-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should add years", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(2, 7 /* Year */);
            expect(e.toString()).to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should add negative numbers", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(-2, 4 /* Day */);
            expect(e.toString()).to.equal("2013-12-30T00:00:00.000 Europe/Amsterdam");
        });
        it("should add to unaware", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, null);
            var e = d.add(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T02:59:59.000");
        });
        it("should add to UTC", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.utc());
            var e = d.add(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T02:59:59.000 UTC");
        });
        it("should account for DST forward", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T03:59:59.000 Europe/Amsterdam");
        });
        it("should account for DST backward", function () {
            // this could mean either of two UTC times
            var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 3 /* Hour */);
            expect(e.toString()).to.satisfy(function (s) {
                return (s === "2014-10-26T02:59:59.000 Europe/Amsterdam" || s === "2014-10-26T03:59:59.000 Europe/Amsterdam");
            });
        });
        it("should keep incrementing UTC even if local time does not increase", function () {
            // check that UTC moves forward even though local date is not deterministic
            var d = (new DateTime(2014, 10, 26, 0, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
            expect(d.add(1, 3 /* Hour */).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
            d = (new DateTime(2014, 10, 26, 1, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
            expect(d.add(1, 3 /* Hour */).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T02:00:00.000 UTC");
        });
        it("should shift local time when adding days across DST fw", function () {
            var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-03-30T09:00:00.000 Europe/Amsterdam");
        });
        it("should shift local time when adding days across DST bw", function () {
            var d = new DateTime(2014, 10, 25, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-10-26T07:00:00.000 Europe/Amsterdam");
        });
        it("should shift local time when adding negative days across DST fw", function () {
            var d = new DateTime(2014, 3, 30, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(-1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-03-29T07:00:00.000 Europe/Amsterdam");
        });
        it("should shift local time when adding negative days across DST bw", function () {
            var d = new DateTime(2014, 10, 26, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(-1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-10-25T09:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time when adding year across 2 DSTs", function () {
            var d = new DateTime(2014, 1, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 7 /* Year */);
            expect(e.toString()).to.equal("2015-01-29T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time when adding negative year across 2 DSTs", function () {
            var d = new DateTime(2014, 1, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(-1, 7 /* Year */);
            expect(e.toString()).to.equal("2013-01-29T08:00:00.000 Europe/Amsterdam");
        });
        it("should shift local time when adding year across 1 DSTs", function () {
            var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 7 /* Year */); // note in 2015 DST shift is on march 29 iso march 30
            expect(e.toString()).to.equal("2015-03-29T09:00:00.000 Europe/Amsterdam");
        });
        it("should shift local time when adding month across 1 DST", function () {
            var d = new DateTime(2014, 3, 3, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.add(1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-04-03T09:00:00.000 Europe/Amsterdam");
            d = new DateTime(2014, 9, 26, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            e = d.add(1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-10-26T02:00:00.000 Europe/Amsterdam");
        });
        it("should shift remote zone time when adding month across 1 DST", function () {
            var d = new DateTime(2014, 3, 3, 8, 0, 0, 0, TimeZone.zone("Asia/Gaza"));
            var e = d.add(1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-04-03T09:00:00.000 Asia/Gaza");
        });
        it("should not shift remote zone time when adding month across 1 local DST ", function () {
            // this is already in summer time Gaza but winter time Europe/Amsterdam
            var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Asia/Gaza"));
            var e = d.add(1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-04-29T08:00:00.000 Asia/Gaza");
        });
    });
    describe("addLocal()", function () {
        it("should work with a Duration object", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(Duration.minutes(23));
            expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
        });
        it("should add 0", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.addLocal(0, 0 /* Millisecond */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 1 /* Second */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 2 /* Minute */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 3 /* Hour */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 4 /* Day */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 5 /* Week */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 6 /* Month */).toString()).to.equal(d.toString());
            expect(d.addLocal(0, 7 /* Year */).toString()).to.equal(d.toString());
        });
        it("should add milliseconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(23, 0 /* Millisecond */);
            expect(e.toString()).to.equal("2014-01-01T00:00:00.023 Europe/Amsterdam");
        });
        it("should add more than 1000 milliseconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1001, 0 /* Millisecond */);
            expect(e.toString()).to.equal("2014-01-01T00:00:01.001 Europe/Amsterdam");
        });
        it("should add seconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(23, 1 /* Second */);
            expect(e.toString()).to.equal("2014-01-01T00:00:23.000 Europe/Amsterdam");
        });
        it("should add more than 60 seconds", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(61, 1 /* Second */);
            expect(e.toString()).to.equal("2014-01-01T00:01:01.000 Europe/Amsterdam");
        });
        it("should add minutes", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(23, 2 /* Minute */);
            expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
        });
        it("should add more than 60 minutes", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(61, 2 /* Minute */);
            expect(e.toString()).to.equal("2014-01-01T01:01:00.000 Europe/Amsterdam");
        });
        it("should add hours", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(23, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-01-01T23:00:00.000 Europe/Amsterdam");
        });
        it("should add more than 24 hours", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(25, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-01-02T01:00:00.000 Europe/Amsterdam");
        });
        it("should add days", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(23, 4 /* Day */);
            expect(e.toString()).to.equal("2014-01-24T00:00:00.000 Europe/Amsterdam");
        });
        it("should add more than 30 days", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(31, 4 /* Day */);
            expect(e.toString()).to.equal("2014-02-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should add weeks", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(2, 5 /* Week */);
            expect(e.toString()).to.equal("2014-01-15T00:00:00.000 Europe/Amsterdam");
        });
        it("should add months", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(2, 6 /* Month */);
            expect(e.toString()).to.equal("2014-03-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should clamp end-of-month", function () {
            var d = new DateTime(2014, 1, 31, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-02-28T00:00:00.000 Europe/Amsterdam");
        });
        it("should clamp end-of-month (leap year)", function () {
            var d = new DateTime(2004, 1, 31, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 6 /* Month */);
            expect(e.toString()).to.equal("2004-02-29T00:00:00.000 Europe/Amsterdam");
        });
        it("should add months across year boundary", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(12, 6 /* Month */);
            expect(e.toString()).to.equal("2015-01-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should add years", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(2, 7 /* Year */);
            expect(e.toString()).to.equal("2016-01-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should clamp end-of-month (leap year)", function () {
            var d = new DateTime(2004, 2, 29, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 7 /* Year */);
            expect(e.toString()).to.equal("2005-02-28T00:00:00.000 Europe/Amsterdam");
        });
        it("should add negative numbers", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(-2, 4 /* Day */);
            expect(e.toString()).to.equal("2013-12-30T00:00:00.000 Europe/Amsterdam");
        });
        it("should add to unaware", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, null);
            var e = d.addLocal(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T02:59:59.000");
        });
        it("should add to UTC", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.utc());
            var e = d.addLocal(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T02:59:59.000 UTC");
        });
        it("should account for DST forward", function () {
            var d = new DateTime(2014, 3, 30, 1, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T03:59:59.000 Europe/Amsterdam");
        });
        it("should account for DST forward, -1", function () {
            // it should skip over 02:59 since that does not exist
            var d = new DateTime(2014, 3, 30, 3, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(-1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-03-30T01:59:59.000 Europe/Amsterdam");
        });
        it("should account for DST backward", function () {
            // this could mean either of two UTC times
            var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            // but addLocal should increment the local hour field regardless
            var e = d.addLocal(1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-10-26T03:59:59.000 Europe/Amsterdam");
            // similar with subtraction: local hour field should decrease
            e = d.addLocal(-1, 3 /* Hour */);
            expect(e.toString()).to.equal("2014-10-26T01:59:59.000 Europe/Amsterdam");
        });
        it("should keep local time same when adding days across DST fw", function () {
            var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-03-30T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time same when adding days across DST bw", function () {
            var d = new DateTime(2014, 10, 25, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-10-26T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time same when adding negative days across DST fw", function () {
            var d = new DateTime(2014, 3, 30, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(-1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-03-29T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time same when adding negative days across DST bw", function () {
            var d = new DateTime(2014, 10, 26, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(-1, 4 /* Day */);
            expect(e.toString()).to.equal("2014-10-25T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time same when adding year across 2 DSTs", function () {
            var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 7 /* Year */);
            expect(e.toString()).to.equal("2015-03-29T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time same when adding negative year across 2 DSTs", function () {
            var d = new DateTime(2014, 3, 29, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(-1, 7 /* Year */);
            expect(e.toString()).to.equal("2013-03-29T08:00:00.000 Europe/Amsterdam");
        });
        it("should keep local time when adding month across 1 DST", function () {
            var d = new DateTime(2014, 3, 3, 8, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.addLocal(1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-04-03T08:00:00.000 Europe/Amsterdam");
        });
    });
    describe("subLocal()", function () {
        // this calls addLocal(-duration) so we rely on the addLocal tests
        it("should work with a Duration object", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.subLocal(Duration.minutes(-23));
            expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
        });
        it("should work with amount & unit", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.subLocal(-23, 2 /* Minute */);
            expect(e.toString()).to.equal("2014-01-01T00:23:00.000 Europe/Amsterdam");
        });
    });
    describe("sub(Duration)", function () {
        it("should subtract zero", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            var e = d.sub(Duration.hours(0));
            expect(d.toString()).to.equal(e.toString());
        });
        it("should sub positive value", function () {
            var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
            var e = d.sub(Duration.hours(1));
            expect(d.hour()).to.equal(1);
            expect(e.hour()).to.equal(0);
        });
        it("should sub negative value", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            var e = d.sub(Duration.hours(-1));
            expect(d.hour()).to.equal(0);
            expect(e.hour()).to.equal(1);
        });
        it("should sub value in presence of time zone", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0, TimeZone.zone(3));
            var e = d.sub(Duration.hours(1));
            expect(d.hour()).to.equal(0);
            expect(e.hour()).to.equal(23);
            expect(e.day()).to.equal(31);
        });
    });
    describe("sub(amount, unit)", function () {
        // not thoroughly tested since implementation is routed to add(-amount, unit)
        it("should account for DST forward", function () {
            var d = new DateTime(2014, 3, 30, 3, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T01:59:59.000 UTC");
            var e = d.sub(1, 3 /* Hour */);
            expect(e.toZone(TimeZone.utc()).toString()).to.equal("2014-03-30T00:59:59.000 UTC");
            expect(e.toString()).to.equal("2014-03-30T01:59:59.000 Europe/Amsterdam");
        });
        it("should account for DST backward", function () {
            var d = new DateTime(2014, 10, 26, 2, 59, 59, 0, TimeZone.zone("Europe/Amsterdam"));
            var e = d.sub(1, 3 /* Hour */);
            expect(e.toString()).to.satisfy(function (s) {
                return (s === "2014-10-26T02:59:59.000 Europe/Amsterdam" || s === "2014-10-26T01:59:59.000 Europe/Amsterdam");
            });
        });
        it("should keep decrementing UTC even if local time does not decrease", function () {
            // check that UTC moves forward even though local date is not deterministic
            var d = (new DateTime(2014, 10, 26, 1, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
            expect(d.sub(1, 3 /* Hour */).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T00:00:00.000 UTC");
            d = (new DateTime(2014, 10, 26, 2, 0, 0, 0, TimeZone.zone("UTC"))).toZone(TimeZone.zone("Europe/Amsterdam"));
            expect(d.sub(1, 3 /* Hour */).toZone(TimeZone.utc()).toString()).to.equal("2014-10-26T01:00:00.000 UTC");
        });
        it("should handle subtracting from january", function () {
            var d = new DateTime(2014, 1, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
            var e = d.sub(1, 6 /* Month */);
            expect(e.toString()).to.equal("2013-12-15T00:00:00.000 UTC");
        });
        it("should handle adding to december", function () {
            var d = new DateTime(2013, 12, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
            var e = d.sub(-1, 6 /* Month */);
            expect(e.toString()).to.equal("2014-01-15T00:00:00.000 UTC");
        });
        it("should handle adding more than a year in months", function () {
            var d = new DateTime(2013, 9, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
            var e = d.sub(-24, 6 /* Month */);
            expect(e.toString()).to.equal("2015-09-15T00:00:00.000 UTC");
        });
        it("should handle subtracting more than a year in months", function () {
            var d = new DateTime(2013, 9, 15, 0, 0, 0, 0, TimeZone.zone("UTC"));
            var e = d.sub(24, 6 /* Month */);
            expect(e.toString()).to.equal("2011-09-15T00:00:00.000 UTC");
        });
    });
    describe("diff()", function () {
        it("should diff identical dates zero", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 0, 0);
            var diff = d.diff(d);
            expect(diff.milliseconds()).to.equal(0);
        });
        it("should diff positive value", function () {
            var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
            var diff = d.diff(new DateTime(2014, 1, 1, 2, 0, 0, 0));
            expect(diff.milliseconds()).to.equal(Duration.hours(-1).milliseconds());
        });
        it("should diff negative value", function () {
            var d = new DateTime(2014, 1, 1, 1, 0, 0, 0);
            var diff = d.diff(new DateTime(2014, 1, 1, 0, 0, 0, 0));
            expect(diff.milliseconds()).to.equal(Duration.hours(1).milliseconds());
        });
        it("should diff across time zones", function () {
            var d = new DateTime(2014, 1, 1, 1, 0, 0, 0, new TimeZone("+0100"));
            var e = new DateTime(2014, 1, 1, 1, 0, 0, 0, new TimeZone("-0100"));
            var diff = d.diff(e);
            expect(diff.milliseconds()).to.equal(Duration.hours(-2).milliseconds());
        });
    });
    describe("startOfDay()", function () {
        it("should work for a date with a zone", function () {
            expect((new DateTime(2014, 1, 1, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam"))).startOfDay().toString()).to.equal("2014-01-01T00:00:00.000 Europe/Amsterdam");
        });
        it("should work for a date without a zone", function () {
            expect((new DateTime(2014, 1, 24, 23, 59, 59, 999)).startOfDay().toString()).to.equal("2014-01-24T00:00:00.000");
        });
        it("should work for already truncated date", function () {
            expect((new DateTime(2014, 1, 1)).startOfDay().toString()).to.equal("2014-01-01T00:00:00.000");
        });
        it("should return a fresh clone", function () {
            var d = new DateTime(2014, 1, 1);
            expect(d.startOfDay()).not.to.equal(d);
        });
    });
    describe("lessThan()", function () {
        it("should return true for a greater other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").lessThan(new DateTime("2014-02-02T02:02:02.003"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(true);
        });
        it("should return false for an equal other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").lessThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
        });
        it("should return false for a lesser other", function () {
            expect(new DateTime("2014-02-02T02:02:02.003").lessThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:03.002+01").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+00").lessThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
        });
    });
    describe("lessEqual()", function () {
        it("should return true for a greater other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").lessEqual(new DateTime("2014-02-02T02:02:02.003"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(true);
        });
        it("should return true for an equal other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").lessEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
        });
        it("should return false for a lesser other", function () {
            expect(new DateTime("2014-02-02T02:02:02.003").lessEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:03.002+01").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+00").lessEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
        });
    });
    describe("equals()", function () {
        it("should return false for a greater other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").equals(new DateTime("2014-02-02T02:02:02.003"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(false);
        });
        it("should return true for an equal other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").equals(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
        });
        it("should return false for a lesser other", function () {
            expect(new DateTime("2014-02-02T02:02:02.003").equals(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:03.002+01").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+00").equals(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
        });
    });
    describe("identical()", function () {
        it("should return false if time zone differs", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").identical(new DateTime("2014-02-02T02:02:02.002+01:00"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+02:00").identical(new DateTime("2014-02-02T03:02:02.002+01:00"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").identical(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002 GMT").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.equal(false);
        });
        it("should return true for an identical other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").identical(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").identical(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
        });
        it("should return false if time zones are not identical but equal", function () {
            expect(new DateTime("2014-02-02T02:02:02.002+00:00").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002 GMT").identical(new DateTime("2014-02-02T02:02:02.002 UTC"))).to.equal(false);
        });
    });
    describe("greaterThan()", function () {
        it("should return false for a greater other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").greaterThan(new DateTime("2014-02-02T02:02:02.003"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(false);
        });
        it("should return false for an equal other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").greaterThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(false);
        });
        it("should return true for a lesser other", function () {
            expect(new DateTime("2014-02-02T02:02:02.003").greaterThan(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:03.002+01").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+00").greaterThan(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
        });
    });
    describe("greaterEqual()", function () {
        it("should return false for a greater other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").greaterEqual(new DateTime("2014-02-02T02:02:02.003"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:03.002+01"))).to.equal(false);
            expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+00"))).to.equal(false);
        });
        it("should return true for an equal other", function () {
            expect(new DateTime("2014-02-02T02:02:02.002").greaterEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002 Europe/Amsterdam").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
        });
        it("should return true for a lesser other", function () {
            expect(new DateTime("2014-02-02T02:02:02.003").greaterEqual(new DateTime("2014-02-02T02:02:02.002"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:03.002+01").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
            expect(new DateTime("2014-02-02T02:02:02.002+00").greaterEqual(new DateTime("2014-02-02T02:02:02.002+01"))).to.equal(true);
        });
    });
    describe("min()", function () {
        it("should return a value equal to this if this is smaller", function () {
            expect(new DateTime(1).min(new DateTime(2)).unixUtcMillis()).to.equal(1);
        });
        it("should any of the values if they are equal", function () {
            expect(new DateTime(2).min(new DateTime(2)).unixUtcMillis()).to.equal(2);
        });
        it("should the other value if it is smaller", function () {
            expect(new DateTime(2).min(new DateTime(1)).unixUtcMillis()).to.equal(1);
        });
    });
    describe("max()", function () {
        it("should return a value equal to other if this is smaller", function () {
            expect(new DateTime(1).max(new DateTime(2)).unixUtcMillis()).to.equal(2);
        });
        it("should any of the values if they are equal", function () {
            expect(new DateTime(2).max(new DateTime(2)).unixUtcMillis()).to.equal(2);
        });
        it("should this value if this is greater", function () {
            expect(new DateTime(2).max(new DateTime(1)).unixUtcMillis()).to.equal(2);
        });
    });
    describe("toIsoString()", function () {
        it("should work for unaware date", function () {
            expect((new DateTime("2014-02-03T05:06:07.008")).toIsoString()).to.equal("2014-02-03T05:06:07.008");
        });
        it("should work for proper timezone", function () {
            expect((new DateTime("2014-02-03T05:06:07.008 Europe/Amsterdam")).toIsoString()).to.equal("2014-02-03T05:06:07.008+01:00");
        });
        it("should work for offset timezone", function () {
            expect((new DateTime("2014-02-03T05:06:07.008+02:00")).toIsoString()).to.equal("2014-02-03T05:06:07.008+02:00");
        });
        it("should work for local timezone", function () {
            expect((new DateTime("2014-02-03T05:06:07.008 localtime")).toIsoString()).to.equal("2014-02-03T05:06:07.008" + TimeZone.offsetToString(TimeZone.local().offsetForZone(2014, 2, 3, 5, 6, 7, 8)));
        });
    });
    describe("toUtcString()", function () {
        it("should work for unaware date", function () {
            expect((new DateTime("2014-02-03T05:06:07.008")).toUtcString()).to.equal("2014-02-03T05:06:07.008");
        });
        it("should work for offset zone", function () {
            expect((new DateTime("2014-02-03T05:06:07.008+01")).toUtcString()).to.equal("2014-02-03T04:06:07.008");
        });
        it("should work for proper zone", function () {
            expect((new DateTime("2014-02-03T05:06:07.008 Europe/Amsterdam")).toUtcString()).to.equal("2014-02-03T04:06:07.008");
        });
    });
    describe("inspect()", function () {
        it("should work", function () {
            expect((new DateTime("2014-02-03T05:06:07.008")).inspect()).to.equal("[DateTime: " + (new DateTime("2014-02-03T05:06:07.008")).toString() + "]");
        });
    });
    describe("valueOf()", function () {
        it("should work", function () {
            expect((new DateTime("2014-02-03T05:06:07.008")).valueOf()).to.equal((new DateTime("2014-02-03T05:06:07.008")).unixUtcMillis());
        });
    });
    describe("weekDay()", function () {
        it("should return a local week day", function () {
            expect(new DateTime("2014-07-07T00:00:00.00 Europe/Amsterdam").weekDay()).to.equal(1 /* Monday */);
            expect(new DateTime("2014-07-07T23:59:59.999 Europe/Amsterdam").weekDay()).to.equal(1 /* Monday */);
        });
    });
    describe("utcWeekDay()", function () {
        it("should return a UTC week day", function () {
            expect(new DateTime("2014-07-07T00:00:00.00 Europe/Amsterdam").utcWeekDay()).to.equal(0 /* Sunday */);
        });
    });
    describe("dayOfYear()", function () {
        it("should return a local dayOfYear", function () {
            expect(new DateTime("2014-01-01T00:00:00.00 Europe/Amsterdam").dayOfYear()).to.equal(0);
            expect(new DateTime("2014-12-31T23:59:59.999 Europe/Amsterdam").dayOfYear()).to.equal(364);
        });
    });
    describe("utcDayOfYear()", function () {
        it("should return a UTC week day", function () {
            // note this is still january 1st in utc
            expect(new DateTime("2014-01-02T00:00:00.00 Europe/Amsterdam").utcDayOfYear()).to.equal(0);
        });
    });
    describe("weekNumber()", function () {
        // note already thoroughly tested in basics.weekDay()
        it("should work on local date", function () {
            var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone(60));
            expect(d.weekNumber()).to.equal(22);
        });
    });
    describe("utcWeekNumber()", function () {
        // note already thoroughly tested in basics.weekDay()
        it("should work on utc date", function () {
            var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone(60));
            expect(d.utcWeekNumber()).to.equal(21);
        });
    });
    describe("weekOfMonth()", function () {
        // note already thoroughly tested in basics.weekOfMonth()
        it("should work", function () {
            var d = new DateTime(2014, 8, 11, 0, 0, 0, 0, TimeZone.zone(60));
            expect(d.weekOfMonth()).to.equal(2);
        });
    });
    describe("utcWeekOfMonth()", function () {
        // note already thoroughly tested in basics.weekOfMonth()
        it("should work", function () {
            var d = new DateTime(2014, 8, 11, 0, 0, 0, 0, TimeZone.zone(60));
            expect(d.utcWeekOfMonth()).to.equal(1);
        });
    });
    describe("secondOfDay()", function () {
        // note already thoroughly tested in basics.secondOfDay()
        it("should work", function () {
            var d = new DateTime(2014, 1, 1, 0, 0, 3, 0, TimeZone.zone(60));
            expect(d.secondOfDay()).to.equal(3);
        });
    });
    describe("utcSecondOfDay()", function () {
        // note already thoroughly tested in basics.secondOfDay()
        it("should work", function () {
            var d = new DateTime(2014, 1, 1, 1, 0, 0, 0, TimeZone.zone(60));
            expect(d.utcSecondOfDay()).to.equal(0);
        });
    });
    describe("zoneAbbreviation()", function () {
        it("should return nothing for naive date", function () {
            var d = new DateTime(2014, 5, 26, 0, 30, 0, 0);
            expect(d.zoneAbbreviation()).to.equal("");
        });
        it("should return the zone abbrev for aware date", function () {
            // note already tested in test-tz-database
            var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.zoneAbbreviation()).to.equal("CEST");
        });
    });
    describe("format()", function () {
        it("should format to a user-defined string", function () {
            var d = new DateTime(2014, 5, 26, 0, 30, 0, 0, TimeZone.zone("Europe/Amsterdam"));
            expect(d.format("dd/MM/yyyy HH:mm:ss")).to.equal("26/05/2014 00:30:00");
        });
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QtZGF0ZXRpbWUudHMiXSwibmFtZXMiOlsiVGVzdFRpbWVTb3VyY2UiLCJUZXN0VGltZVNvdXJjZS5jb25zdHJ1Y3RvciIsIlRlc3RUaW1lU291cmNlLm5vdyJdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDO0FBRTdDLElBQU8sZ0JBQWdCLFdBQVcsb0JBQW9CLENBQUMsQ0FBQztBQUN4RCxBQUNBLDhGQUQ4RjtBQUM5RixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRTlELElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLElBQU8sSUFBSSxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLElBQU8sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFFNUIsSUFBTyxNQUFNLFdBQVcsZUFBZSxDQUFDLENBQUM7QUFDekMsSUFBTyxhQUFhLFdBQVcsY0FBYyxDQUFDLENBQUM7QUFFL0MsSUFBTyxhQUFhLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQztBQUNuRCxJQUFPLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO0FBQ3pDLElBQU8sUUFBUSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7QUFFekMsSUFBTyxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQztBQUN6QyxJQUFPLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO0FBQ3pDLElBQU8sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7QUFFdkMsQUFDQSxtQkFEbUI7SUFDYixjQUFjO0lBQXBCQSxTQUFNQSxjQUFjQTtRQUNaQyxnQkFBV0EsR0FBU0EsSUFBSUEsSUFBSUEsQ0FBQ0EsMEJBQTBCQSxDQUFDQSxDQUFDQTtJQUtqRUEsQ0FBQ0E7SUFIQUQsNEJBQUdBLEdBQUhBO1FBQ0NFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBO0lBQ3pCQSxDQUFDQTtJQUNGRixxQkFB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QyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdCQUF3QixFQUFFO1lBQzVCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztZQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTtZQUM1QixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLCtCQUErQixFQUFFO1lBQ25DLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsbUNBQW1DLEVBQUU7WUFDdkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsbUNBQW1DLEVBQUU7WUFDdkMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsQ0FBQyxD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QyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyw0QkFBNEIsRUFBRTtZQUNoQyxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMscUNBQXFDLEVBQUU7WUFDekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsd0JBQXdCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FB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QyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxpRUFBaUUsRUFBRTtRQUMzRSxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywwQkFBMEIsRUFBRTtZQUM5QixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxxQkFBcUIsRUFBRTtZQUN6QixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMs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QUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsS0FBSyxFQUFFO1lBQ1QsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLFNBQVMsRUFBRTtZQUNiLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGNBQWMsRUFBRTtZQUNsQixBQUNBLGtDQURrQztnQkFDOUIsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM5RyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSw4QkFBOEI7UUFDN0QsQ0FBQyxDQUFDLENBQUMsQ0FEMkI7SUFFL0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsT0FBTyxFQUFFO1FBQ2pCLEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRTtZQUNqRCxJQUFJLENBQUMsR0FBYSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDRCQUE0QixFQUFFO1lBQ2hDLElBQUksQ0FBQyxHQUFhLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0UsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsWUFBWSxFQUFFO1FBQ3RCLEVBQUUsQ0FBQyxnREFBZ0QsRUFBRTtZQUNwRCxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRTtZQUNwRCxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElB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QUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDcEgsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDcEgsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDcEgsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDckgsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsbUNBQW1DLEVBQUU7WUFDdkMsQUFDQSxnRkFEZ0Y7Z0JBQzVFLENBQUMsR0FBYSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDaEYsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDN0QsQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM5SCxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQzdELENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDOUgsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztJQUVKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLFVBQVUsRUFBRTtRQUNwQixFQUFFLENBQUMsU0FBUyxFQUFFO1lBQ2IsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLE9BQU8sRUFBRTtZQUNYLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxBQUNBLDJCQUQyQjtJQUMzQixRQUFRLENBQUMsZUFBZSxFQUFFO1FBQ3pCLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtZQUNyQixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtZQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtZQUMvQixJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMs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LElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG9CQUFvQixFQUFFO1lBQ3hCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLCtCQUErQixFQUFFO1lBQ25DLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlCQUFpQixFQUFFO1lBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFZLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDhCQUE4QixFQUFFO1lBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFZLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxhQUFjLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1lBQzVDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxhQUFjLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxD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Q0FBQztRQUMzRyxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3REFBd0QsRUFBRTtZQUM1RCxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBWSxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3REFBd0QsRUFBRTtZQUM1RCxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBWSxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxpRUFBaUUsRUFBRTtZQUNyRSxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDakYsSUFB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QyxDQUFDO1lBQzlFLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxjQUFlLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDekUsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLGNBQWUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsWUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFZLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFlBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN2RSxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsYUFBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDeEUsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMseUJBQXlCLEVBQUU7WUFDN0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLG1CQUFvQixDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRTtZQUM1QyxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW9CLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG9CQUFvQixFQUFFO1lBQ3hCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG9CQUFvQixFQUFFO1lBQ3hCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxjQUFlLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLCtCQUErQixFQUFFO1lBQ25DLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlCQUFpQixFQUFFO1lBQ3JCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFZLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDhCQUE4QixFQUFFO1lBQ2xDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxXQUFZLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLG1CQUFtQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxhQUFjLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDJCQUEyQixFQUFFO1lBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxhQUFjLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO1lBQzNDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxhQUFjLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1lBQzVDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxhQUFjLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGtCQUFrQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHVDQUF1QyxFQUFFO1lBQzNDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDZCQUE2QixFQUFFO1lBQ2pDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVksQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUJBQXVCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFlBQWEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsbUJBQW1CLEVBQUU7WUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFlBQWEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsZ0NBQWdDLEVBQUU7WUFDcEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFlBQWEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsb0NBQW9DLEVBQUU7WUFDeEMsQUFDQSxzREFEc0Q7Z0JBQ2xELENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDbkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO1lBQ3JDLEFBQ0EsMENBRDBDO2dCQUN0QyxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLEFBQ0EsZ0VBRGdFO2dCQUM1RCxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsWUFBYSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUMxRSxBQUNBLDZEQUQ2RDtZQUM3RCxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFhLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDREQUE0RCxFQUFFO1lBQ2hFLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFZLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDREQUE0RCxFQUFFO1lBQ2hFLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxXQUFZLENBQUMsQ0FBQztZQUNwQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHFFQUFxRSxFQUFFO1lBQ3pFLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFB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QUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDJCQUEyQixFQUFFO1lBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDJCQUEyQixFQUFFO1lBQy9CLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsMkNBQTJDLEVBQUU7WUFDL0MsSUFB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UUFDSCxFQUFFLENBQUMsa0NBQWtDLEVBQUU7WUFDdEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLGFBQWMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsaURBQWlELEVBQUU7WUFDckQsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLGFBQWMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsc0RBQXNELEVBQUU7WUFDMUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMs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QUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSixRQUFRLENBQUMsWUFBWSxFQUFFO1FBQ3RCLEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRTtZQUM1QyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqSCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2SCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4SCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRTtZQUM1QyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsSCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4SCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2SSxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRTtZQUM1QyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsSCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4SCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6SCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGFBQWEsRUFBRTtRQUN2QixFQUFFLENBQUMsd0NBQXdDLEVBQUU7WUFDNUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekgsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUNBQXVDLEVBQUU7WUFDM0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkksQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsd0NBQXdDLEVBQUU7WUFDNUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENB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QyxLQUFLLENBQUMsQ0FBQztZQUN6SCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvSCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsMENBQTBDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2SSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1SCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywyQ0FBMkMsRUFBRTtZQUMvQyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsSCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6SCxDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQywrREFBK0QsRUFBRTtZQUNuRSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsK0JBQStCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3SCxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1SCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGVBQWUsRUFBRTtRQUN6QixFQUFFLENBQUMseUNBQXlDLEVBQUU7WUFDN0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0gsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUgsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsd0NBQXdDLEVBQUU7WUFDNUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0gsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUksQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUNBQXVDLEVBQUU7WUFDM0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtRQUMxQixFQUFFLENBQUMseUNBQXlDLEVBQUU7WUFDN0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUNBQXVDLEVBQUU7WUFDM0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckgsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0gsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUksQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsdUNBQXVDLEVBQUU7WUFDM0MsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksUUFBUSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7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LEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG9CQUFvQixFQUFFO1FBQzlCLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRTtZQUMxQyxJQUFJLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDhDQUE4QyxFQUFFO1lBQ2xELEFBQ0EsMENBRDBDO2dCQUN0QyxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxVQUFVLEVBQUU7UUFDcEIsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO1lBQzVDLElBQUksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNsRixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3pFLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJ0ZXN0L3Rlc3QtZGF0ZXRpbWUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6W251bGxdfQ==