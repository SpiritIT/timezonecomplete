/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";

import * as parse from "../lib/parse";

describe("parse", (): void => {
	describe("parseable()", (): void => {
		it("should return true for parseable strings", (): void => {
			expect(parse.parseable("2015-01-31", "yyyy-MM-dd")).to.equal(true);
		});
		it("should return false for not-to-format strings", (): void => {
			expect(parse.parseable("2015-31-01", "yyyy-MM-dd")).to.equal(false);
		});
		it("should return false for non-existing days", (): void => {
			expect(parse.parseable("2015-01-33", "yyyy-MM-dd")).to.equal(false);
		});
		it("should return false for trailing chars if trailing not allowed", (): void => {
			expect(parse.parseable("2015-01-31 UTC", "yyyy-MM-dd", false)).to.equal(false);
		});
		it("should return true for trailing chars if trailing allowed", (): void => {
			expect(parse.parseable("2015-01-31 UTC", "yyyy-MM-dd", true)).to.equal(true);
		});
	});
});
