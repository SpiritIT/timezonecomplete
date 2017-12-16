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

	describe("era", (): void => {
		describe("G..GGG", (): void => {
			it("should parse '2017 AD'", (): void => {
				expect(parse.parse("2017 AD", "yyyy G", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should parse '2017 BC'", (): void => {
				expect(parse.parse("2017 BC", "yyyy G", undefined, false).time.toString()).to.equal("-2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy G", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy G", undefined, false)).to.throw();
			});
		});
		describe("GGGG", (): void => {
			it("should parse '2017 Anno Domini'", (): void => {
				expect(parse.parse("2017 Anno Domini", "yyyy GGGG", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should parse '2017 Before Christ'", (): void => {
				expect(parse.parse("2017 Before Christ", "yyyy GGGG", undefined, false).time.toString()).to.equal("-2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy GGGG", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy GGGG", undefined, false)).to.throw();
			});
		});
		describe("GGGGG", (): void => {
			it("should parse '2017 Anno Domini'", (): void => {
				expect(parse.parse("2017 A", "yyyy GGGGG", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should parse '2017 Before Christ'", (): void => {
				expect(parse.parse("2017 B", "yyyy GGGGG", undefined, false).time.toString()).to.equal("-2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy GGGGG", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy GGGGG", undefined, false)).to.throw();
			});
		});
	});

	describe("day period", (): void => {
		describe("a", (): void => {
			it("should parse '12 AM'", (): void => {
				expect(parse.parse("2017-12-15 12 AM", "yyyy-MM-dd hh a", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 PM'", (): void => {
				expect(parse.parse("2017-12-15 12 PM", "yyyy-MM-dd hh a", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should be OK with '13 PM'", (): void => {
				expect(parse.parse("2017-12-15 13 PM", "yyyy-MM-dd hh a", undefined, false).time.toString()).to.equal("2017-12-15T13:00:00.000");
			});
			it("should parse different casing", (): void => {
				expect(parse.parse("2017-12-15 12 pm", "yyyy-MM-dd hh a", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should not parse '12 A'", (): void => {
				expect(() => parse.parse("2017-12-15 12 A", "yyyy-MM-dd hh a", undefined, false)).to.throw();
			});
			it("should not parse '12 noon'", (): void => {
				expect(() => parse.parse("2017-12-15 12 noon", "yyyy-MM-dd hh a", undefined, false)).to.throw();
			});
			it("should not parse '12 mid.'", (): void => {
				expect(() => parse.parse("2017-12-15 12 mid.", "yyyy-MM-dd hh a", undefined, false)).to.throw();
			});
			it("should not parse '12 foo'", (): void => {
				expect(() => parse.parse("2017-12-15 12 foo", "yyyy-MM-dd hh a", undefined, false)).to.throw();
			});
		});

		describe("aaaa", (): void => {
			it("should parse '12 AM'", (): void => {
				expect(parse.parse("2017-12-15 12 AM", "yyyy-MM-dd hh aaaa", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 PM'", (): void => {
				expect(parse.parse("2017-12-15 12 PM", "yyyy-MM-dd hh aaaa", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should be OK with '13 PM'", (): void => {
				expect(parse.parse("2017-12-15 13 PM", "yyyy-MM-dd hh aaaa", undefined, false).time.toString()).to.equal("2017-12-15T13:00:00.000");
			});
			it("should parse different casing", (): void => {
				expect(parse.parse("2017-12-15 12 pm", "yyyy-MM-dd hh aaaa", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should not parse '12 A'", (): void => {
				expect(() => parse.parse("2017-12-15 12 A", "yyyy-MM-dd hh aaaa", undefined, false)).to.throw();
			});
			it("should not parse '12 noon'", (): void => {
				expect(() => parse.parse("2017-12-15 12 noon", "yyyy-MM-dd hh aaaa", undefined, false)).to.throw();
			});
			it("should not parse '12 midnight'", (): void => {
				expect(() => parse.parse("2017-12-15 12 mid.", "yyyy-MM-dd hh aaaa", undefined, false)).to.throw();
			});
			it("should not parse '12 foo'", (): void => {
				expect(() => parse.parse("2017-12-15 12 foo", "yyyy-MM-dd hh aaaa", undefined, false)).to.throw();
			});
		});

		describe("aaaaa", (): void => {
			it("should parse '12 A'", (): void => {
				expect(parse.parse("2017-12-15 12 A", "yyyy-MM-dd hh aaaaa", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 P'", (): void => {
				expect(parse.parse("2017-12-15 12 P", "yyyy-MM-dd hh aaaaa", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should be OK with '13 P'", (): void => {
				expect(parse.parse("2017-12-15 13 P", "yyyy-MM-dd hh aaaaa", undefined, false).time.toString()).to.equal("2017-12-15T13:00:00.000");
			});
			it("should parse different casing", (): void => {
				expect(parse.parse("2017-12-15 12 p", "yyyy-MM-dd hh aaaaa", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should not parse '12 AM'", (): void => {
				expect(() => parse.parse("2017-12-15 12 AM", "yyyy-MM-dd hh aaaaa", undefined, false)).to.throw();
			});
			it("should not parse '12 noon'", (): void => {
				expect(() => parse.parse("2017-12-15 12 noon", "yyyy-MM-dd hh aaaaa", undefined, false)).to.throw();
			});
			it("should not parse '12 md'", (): void => {
				expect(() => parse.parse("2017-12-15 12 mid.", "yyyy-MM-dd hh aaaaa", undefined, false)).to.throw();
			});
			it("should not parse '12 foo'", (): void => {
				expect(() => parse.parse("2017-12-15 12 foo", "yyyy-MM-dd hh aaaaa", undefined, false)).to.throw();
			});
		});

		describe("b", (): void => {
			it("should parse '12 AM'", (): void => {
				expect(parse.parse("2017-12-15 12 AM", "yyyy-MM-dd hh b", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 mid.'", (): void => {
				expect(parse.parse("2017-12-15 12 mid.", "yyyy-MM-dd hh b", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 PM'", (): void => {
				expect(parse.parse("2017-12-15 12 PM", "yyyy-MM-dd hh b", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should parse '12 noon'", (): void => {
				expect(parse.parse("2017-12-15 12 noon", "yyyy-MM-dd hh b", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should parse 'noon'", (): void => {
				expect(parse.parse("2017-12-15 noon", "yyyy-MM-dd b", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should parse 'mid.'", (): void => {
				expect(parse.parse("2017-12-15 mid.", "yyyy-MM-dd b", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should be OK with '13 PM'", (): void => {
				expect(parse.parse("2017-12-15 13 PM", "yyyy-MM-dd hh b", undefined, false).time.toString()).to.equal("2017-12-15T13:00:00.000");
			});
			it("should parse different casing", (): void => {
				expect(parse.parse("2017-12-15 12 pm", "yyyy-MM-dd hh b", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should not parse '12 A'", (): void => {
				expect(() => parse.parse("2017-12-15 12 A", "yyyy-MM-dd hh b", undefined, false)).to.throw();
			});
			it("should not parse '13 noon'", (): void => {
				expect(() => parse.parse("2017-12-15 13 noon", "yyyy-MM-dd hh b", undefined, false)).to.throw();
			});
			it("should not parse '12:01 noon'", (): void => {
				expect(() => parse.parse("2017-12-15 12:01 noon", "yyyy-MM-dd hh:mm b", undefined, false)).to.throw();
			});
			it("should not parse '12 foo'", (): void => {
				expect(() => parse.parse("2017-12-15 12 foo", "yyyy-MM-dd hh b", undefined, false)).to.throw();
			});
		});

		describe("bbbb", (): void => {
			it("should parse '12 AM'", (): void => {
				expect(parse.parse("2017-12-15 12 AM", "yyyy-MM-dd hh bbbb", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 midnight'", (): void => {
				expect(parse.parse("2017-12-15 12 midnight", "yyyy-MM-dd hh bbbb", undefined, false).time.toString())
					.to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 PM'", (): void => {
				expect(parse.parse("2017-12-15 12 PM", "yyyy-MM-dd hh bbbb", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should parse '12 noon'", (): void => {
				expect(parse.parse("2017-12-15 12 noon", "yyyy-MM-dd hh bbbb", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should be OK with '13 PM'", (): void => {
				expect(parse.parse("2017-12-15 13 PM", "yyyy-MM-dd hh bbbb", undefined, false).time.toString()).to.equal("2017-12-15T13:00:00.000");
			});
			it("should parse different casing", (): void => {
				expect(parse.parse("2017-12-15 12 pm", "yyyy-MM-dd hh bbbb", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should not parse '12 A'", (): void => {
				expect(() => parse.parse("2017-12-15 12 A", "yyyy-MM-dd hh bbbb", undefined, false)).to.throw();
			});
			it("should not parse '12 mid.'", (): void => {
				expect(() => parse.parse("2017-12-15 12 mid.", "yyyy-MM-dd hh bbbb", undefined, false)).to.throw();
			});
			it("should not parse '12 foo'", (): void => {
				expect(() => parse.parse("2017-12-15 12 foo", "yyyy-MM-dd hh bbbb", undefined, false)).to.throw();
			});
		});

		describe("bbbbb", (): void => {
			it("should parse '12 A'", (): void => {
				expect(parse.parse("2017-12-15 12 A", "yyyy-MM-dd hh bbbbb", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 md'", (): void => {
				expect(parse.parse("2017-12-15 12 md", "yyyy-MM-dd hh bbbbb", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should parse '12 P'", (): void => {
				expect(parse.parse("2017-12-15 12 P", "yyyy-MM-dd hh bbbbb", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should parse '12 noon'", (): void => {
				expect(parse.parse("2017-12-15 12 noon", "yyyy-MM-dd hh bbbbb", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should be OK with '13 P'", (): void => {
				expect(parse.parse("2017-12-15 13 P", "yyyy-MM-dd hh bbbbb", undefined, false).time.toString()).to.equal("2017-12-15T13:00:00.000");
			});
			it("should parse different casing", (): void => {
				expect(parse.parse("2017-12-15 12 p", "yyyy-MM-dd hh bbbbb", undefined, false).time.toString()).to.equal("2017-12-15T12:00:00.000");
			});
			it("should not parse '12 AM'", (): void => {
				expect(() => parse.parse("2017-12-15 12 AM", "yyyy-MM-dd hh bbbbb", undefined, false)).to.throw();
			});
			it("should not parse '12 foo'", (): void => {
				expect(() => parse.parse("2017-12-15 12 foo", "yyyy-MM-dd hh bbbbb", undefined, false)).to.throw();
			});
		});

		describe("issue #35", (): void => {
			it("should parse 'YYYY-MM-dd h:mma' format for PM time", (): void => {
				expect(parse.parse("2017-12-15 2:00PM", "YYYY-MM-dd h:mma", undefined, false).time.toString()).to.equal("2017-12-15T14:00:00.000");
			});
		});
	});
});
