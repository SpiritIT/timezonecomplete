/**
 * Copyright(c) 2014 ABB Switzerland Ltd.
 */

"use strict";

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";

import * as parse from "../lib/parse";

describe("parse", (): void => {

	describe("parse()", (): void => {
		it("should throw on empty date string", (): void => {
			assert.throws(() => parse.parse("", "yyyy-MM-dd"));
		});
		it("should throw on empty format string", (): void => {
			assert.throws(() => parse.parse("2017-01-01", ""));
		});
		it("should throw on invalid date", (): void => {
			assert.throws(() => parse.parse("aaaa-bb-cc", "yyyy-MM-dd"));
		});
		it("should throw when zone not given when in format", (): void => {
			assert.throws(() => parse.parse("2017-11-01 ", "yyyy-MM-dd ZZZZ"));
		});
		it("should throw when raw text not given when in format", (): void => {
			assert.throws(() => parse.parse("2017-11-01", "yyyy-MM-dd 'foo'"));
		});
	});

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
