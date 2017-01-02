/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";

import { DateTime, Duration } from "../lib/index";
import * as index from "../lib/index";

describe("globals", (): void => {

	describe("min()", (): void => {
		it("should return the minimum of two Durations", (): void => {
			expect(index.min(Duration.seconds(3), Duration.seconds(4)).seconds()).to.equal(3);
		});
		it("should return the minimum of two DateTimes", (): void => {
			expect(index.min(new DateTime(1), new DateTime(2)).unixUtcMillis()).to.equal(1);
		});
		it("should throw on null input", (): void => {
			assert.throws((): void => {
				index.min(null as any as  Duration, Duration.seconds(2));
			});
			assert.throws((): void => {
				index.min(Duration.seconds(2), null as any as Duration);
			});
		});
	});

	describe("max()", (): void => {
		it("should return the maximum of two Durations", (): void => {
			expect(index.max(Duration.seconds(3), Duration.seconds(4)).seconds()).to.equal(4);
		});
		it("should return the maximum of two DateTimes", (): void => {
			expect(index.max(new DateTime(1), new DateTime(2)).unixUtcMillis()).to.equal(2);
		});
		it("should throw on null input", (): void => {
			assert.throws((): void => {
				index.max(null as any as Duration, Duration.seconds(2));
			});
			assert.throws((): void => {
				index.max(Duration.seconds(2), null as any as Duration);
			});
		});
	});

	describe("abs()", (): void => {
		it("should return the same value for a positive duration", (): void => {
			expect(index.abs(Duration.milliseconds(2)).milliseconds()).to.equal(2);
		});
		it("should return the same value for a zero duration", (): void => {
			expect(index.abs(Duration.milliseconds(0)).milliseconds()).to.equal(0);
		});
		it("should return the inverted value for a negative duration", (): void => {
			expect(index.abs(Duration.milliseconds(-2)).milliseconds()).to.equal(2);
		});
		it("should return a clone", (): void => {
			const d: Duration = Duration.milliseconds(2);
			expect(index.abs(d)).not.to.equal(d);
		});
	});

});
