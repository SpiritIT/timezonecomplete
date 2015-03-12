/// <reference path="../typings/test.d.ts" />

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;

import globals = require("../lib/globals");

import datetimeFuncs = require("../lib/index");
import DateTime = datetimeFuncs.DateTime;
import Duration = datetimeFuncs.Duration;

describe("globals", (): void => {

	describe("min()", (): void => {
		it("should return the minimum of two Durations", (): void => {
			expect(globals.min(Duration.seconds(3), Duration.seconds(4)).seconds()).to.equal(3);
		});
		it("should return the minimum of two DateTimes", (): void => {
			expect(globals.min(new DateTime(1), new DateTime(2)).unixUtcMillis()).to.equal(1);
		});
		it("should throw on null input", (): void => {
			assert.throws((): void => {
				globals.min(null, Duration.seconds(2));
			});
			assert.throws((): void => {
				globals.min(Duration.seconds(2), null);
			});
		});
	});

	describe("max()", (): void => {
		it("should return the maximum of two Durations", (): void => {
			expect(globals.max(Duration.seconds(3), Duration.seconds(4)).seconds()).to.equal(4);
		});
		it("should return the maximum of two DateTimes", (): void => {
			expect(globals.max(new DateTime(1), new DateTime(2)).unixUtcMillis()).to.equal(2);
		});
		it("should throw on null input", (): void => {
			assert.throws((): void => {
				globals.max(null, Duration.seconds(2));
			});
			assert.throws((): void => {
				globals.max(Duration.seconds(2), null);
			});
		});
	});

	describe("abs()", (): void => {
		it("should return the same value for a positive duration", (): void => {
			expect(globals.abs(Duration.milliseconds(2)).milliseconds()).to.equal(2);
		});
		it("should return the same value for a zero duration", (): void => {
			expect(globals.abs(Duration.milliseconds(0)).milliseconds()).to.equal(0);
		});
		it("should return the inverted value for a negative duration", (): void => {
			expect(globals.abs(Duration.milliseconds(-2)).milliseconds()).to.equal(2);
		});
		it("should return a clone", (): void => {
			var d: Duration = Duration.milliseconds(2);
			expect(globals.abs(d)).not.to.equal(d);
		});
	});

});
