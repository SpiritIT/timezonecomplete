/// <reference path="../typings/test.d.ts" />
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var sourcemapsupport = require("source-map-support");

// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: true });

var globals = require("../lib/globals");

var datetimeFuncs = require("../lib/index");
var DateTime = datetimeFuncs.DateTime;
var Duration = datetimeFuncs.Duration;

describe("globals", function () {
    describe("min()", function () {
        it("should return the minimum of two Durations", function () {
            expect(globals.min(Duration.seconds(3), Duration.seconds(4)).seconds()).to.equal(3);
        });
        it("should return the minimum of two DateTimes", function () {
            expect(globals.min(new DateTime(1), new DateTime(2)).unixUtcMillis()).to.equal(1);
        });
        it("should throw on null input", function () {
            assert.throws(function () {
                globals.min(null, Duration.seconds(2));
            });
            assert.throws(function () {
                globals.min(Duration.seconds(2), null);
            });
        });
    });

    describe("max()", function () {
        it("should return the maximum of two Durations", function () {
            expect(globals.max(Duration.seconds(3), Duration.seconds(4)).seconds()).to.equal(4);
        });
        it("should return the maximum of two DateTimes", function () {
            expect(globals.max(new DateTime(1), new DateTime(2)).unixUtcMillis()).to.equal(2);
        });
        it("should throw on null input", function () {
            assert.throws(function () {
                globals.max(null, Duration.seconds(2));
            });
            assert.throws(function () {
                globals.max(Duration.seconds(2), null);
            });
        });
    });
});
//# sourceMappingURL=test-globals.js.map
