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
		it("parse a time only", (): void => {
			expect(parse.parse("10:59:50", "HH:mm:ss", undefined, false).time.toString()).to.equal("1970-01-01T10:59:50.000");
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

	describe("quarter", (): void => {
		describe("Q", (): void => {
			it("should parse '2017 1'", (): void => {
				expect(parse.parse("2017 1", "yyyy Q", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should parse '2017 2'", (): void => {
				expect(parse.parse("2017 2", "yyyy Q", undefined, false).time.toString()).to.equal("2017-04-01T00:00:00.000");
			});
			it("should parse '2017 3'", (): void => {
				expect(parse.parse("2017 3", "yyyy Q", undefined, false).time.toString()).to.equal("2017-07-01T00:00:00.000");
			});
			it("should parse '2017 4'", (): void => {
				expect(parse.parse("2017 4", "yyyy Q", undefined, false).time.toString()).to.equal("2017-10-01T00:00:00.000");
			});
			it("should keep the date if present", (): void => {
				expect(parse.parse("2017-12-15 4", "yyyy-MM-dd Q", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should throw when quarter conflicts with date", (): void => {
				expect(() => parse.parse("2017-01-15 4", "yyyy-MM-dd Q", undefined, false)).to.throw();
			});
			it("should use year 1970 when nothing specified", (): void => {
				expect(parse.parse("4", "Q", undefined, false).time.toString()).to.equal("1970-10-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy Q", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy Q", undefined, false)).to.throw();
			});
		});
		describe("QQ", (): void => {
			it("should parse '2017 01'", (): void => {
				expect(parse.parse("2017 01", "yyyy QQ", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy QQ", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy QQ", undefined, false)).to.throw();
			});
		});
		describe("QQQ", (): void => {
			it("should parse '2017 Q3'", (): void => {
				expect(parse.parse("2017 Q3", "yyyy QQQ", undefined, false).time.toString()).to.equal("2017-07-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy QQQ", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy QQQ", undefined, false)).to.throw();
			});
		});
		describe("QQQQ", (): void => {
			it("should parse '2017 3rd quarter'", (): void => {
				expect(parse.parse("2017 3rd quarter", "yyyy QQQQ", undefined, false).time.toString()).to.equal("2017-07-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy QQQQ", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy QQQQ", undefined, false)).to.throw();
			});
		});
		describe("QQQQQ", (): void => {
			it("should parse '2017 1'", (): void => {
				expect(parse.parse("2017 1", "yyyy QQQQQ", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy QQQQQ", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy QQQQQ", undefined, false)).to.throw();
			});
		});
		describe("q", (): void => {
			it("should parse '2017 1'", (): void => {
				expect(parse.parse("2017 1", "yyyy q", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should parse '2017 2'", (): void => {
				expect(parse.parse("2017 2", "yyyy q", undefined, false).time.toString()).to.equal("2017-04-01T00:00:00.000");
			});
			it("should parse '2017 3'", (): void => {
				expect(parse.parse("2017 3", "yyyy q", undefined, false).time.toString()).to.equal("2017-07-01T00:00:00.000");
			});
			it("should parse '2017 4'", (): void => {
				expect(parse.parse("2017 4", "yyyy q", undefined, false).time.toString()).to.equal("2017-10-01T00:00:00.000");
			});
			it("should keep the date if present", (): void => {
				expect(parse.parse("2017-12-15 4", "yyyy-MM-dd q", undefined, false).time.toString()).to.equal("2017-12-15T00:00:00.000");
			});
			it("should throw when quarter conflicts with date", (): void => {
				expect(() => parse.parse("2017-01-15 4", "yyyy-MM-dd q", undefined, false)).to.throw();
			});
			it("should use year 1970 when nothing specified", (): void => {
				expect(parse.parse("4", "q", undefined, false).time.toString()).to.equal("1970-10-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy q", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy q", undefined, false)).to.throw();
			});
		});
		describe("qq", (): void => {
			it("should parse '2017 01'", (): void => {
				expect(parse.parse("2017 01", "yyyy qq", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy qq", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy qq", undefined, false)).to.throw();
			});
		});
		describe("qqq", (): void => {
			it("should parse '2017 q3'", (): void => {
				expect(parse.parse("2017 q3", "yyyy qqq", undefined, false).time.toString()).to.equal("2017-07-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy qqq", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy qqq", undefined, false)).to.throw();
			});
		});
		describe("qqqq", (): void => {
			it("should parse '2017 3rd quarter'", (): void => {
				expect(parse.parse("2017 3rd quarter", "yyyy qqqq", undefined, false).time.toString()).to.equal("2017-07-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy qqqq", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy qqqq", undefined, false)).to.throw();
			});
		});
		describe("qqqqq", (): void => {
			it("should parse '2017 1'", (): void => {
				expect(parse.parse("2017 1", "yyyy qqqqq", undefined, false).time.toString()).to.equal("2017-01-01T00:00:00.000");
			});
			it("should not parse '2017 foo'", (): void => {
				expect(() => parse.parse("2017 foo", "yyyy qqqqq", undefined, false)).to.throw();
			});
			it("should not parse '2017'", (): void => {
				expect(() => parse.parse("2017", "yyyy qqqqq", undefined, false)).to.throw();
			});
		});
	});

	describe("month", (): void => {
		describe("M", (): void => {
			it("should parse '3'", (): void => {
				expect(parse.parse("3", "M", undefined, false).time.toString()).to.equal("1970-03-01T00:00:00.000");
			});
			it("should not parse '13'", (): void => {
				expect(() => parse.parse("13", "M", undefined, false)).to.throw();
			});
			it("should not parse '0'", (): void => {
				expect(() => parse.parse("0", "M", undefined, false)).to.throw();
			});
		});
		describe("MM", (): void => {
			it("should parse '3'", (): void => {
				expect(parse.parse("3", "MM", undefined, false).time.toString()).to.equal("1970-03-01T00:00:00.000");
			});
			it("should parse '03'", (): void => {
				expect(parse.parse("03", "MM", undefined, false).time.toString()).to.equal("1970-03-01T00:00:00.000");
			});
			it("should not parse '13'", (): void => {
				expect(() => parse.parse("13", "MM", undefined, false)).to.throw();
			});
			it("should not parse '00'", (): void => {
				expect(() => parse.parse("00", "MM", undefined, false)).to.throw();
			});
		});
		describe("MMM", (): void => {
			it("should parse 'Sep'", (): void => {
				expect(parse.parse("Sep", "MMM", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should parse 'sEP'", (): void => {
				expect(parse.parse("sEP", "MMM", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should not parse 'Sap'", (): void => {
				expect(() => parse.parse("Sap", "MMM", undefined, false)).to.throw();
			});
		});
		describe("MMMM", (): void => {
			it("should parse 'September'", (): void => {
				expect(parse.parse("September", "MMMM", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should parse 'september'", (): void => {
				expect(parse.parse("september", "MMMM", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should not parse 'Saptember'", (): void => {
				expect(() => parse.parse("Sap", "MMMM", undefined, false)).to.throw();
			});
		});
		describe("MMMMM", (): void => {
			it("should parse 'D'", (): void => {
				expect(parse.parse("D", "MMMMM", undefined, false).time.toString()).to.equal("1970-12-01T00:00:00.000");
			});
			it("should parse 'j'", (): void => {
				expect(parse.parse("j", "MMMMM", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should not parse 'E'", (): void => {
				expect(() => parse.parse("E", "MMMMM", undefined, false)).to.throw();
			});
		});
		describe("L", (): void => {
			it("should parse '3'", (): void => {
				expect(parse.parse("3", "L", undefined, false).time.toString()).to.equal("1970-03-01T00:00:00.000");
			});
			it("should not parse '13'", (): void => {
				expect(() => parse.parse("13", "L", undefined, false)).to.throw();
			});
			it("should not parse '0'", (): void => {
				expect(() => parse.parse("0", "L", undefined, false)).to.throw();
			});
		});
		describe("LL", (): void => {
			it("should parse '3'", (): void => {
				expect(parse.parse("3", "LL", undefined, false).time.toString()).to.equal("1970-03-01T00:00:00.000");
			});
			it("should parse '03'", (): void => {
				expect(parse.parse("03", "LL", undefined, false).time.toString()).to.equal("1970-03-01T00:00:00.000");
			});
			it("should not parse '13'", (): void => {
				expect(() => parse.parse("13", "LL", undefined, false)).to.throw();
			});
			it("should not parse '00'", (): void => {
				expect(() => parse.parse("00", "LL", undefined, false)).to.throw();
			});
		});
		describe("LLL", (): void => {
			it("should parse 'Sep'", (): void => {
				expect(parse.parse("Sep", "LLL", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should parse 'sEP'", (): void => {
				expect(parse.parse("sEP", "LLL", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should not parse 'Sap'", (): void => {
				expect(() => parse.parse("Sap", "LLL", undefined, false)).to.throw();
			});
		});
		describe("LLLL", (): void => {
			it("should parse 'September'", (): void => {
				expect(parse.parse("September", "LLLL", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should parse 'september'", (): void => {
				expect(parse.parse("september", "LLLL", undefined, false).time.toString()).to.equal("1970-09-01T00:00:00.000");
			});
			it("should not parse 'Saptember'", (): void => {
				expect(() => parse.parse("Sap", "LLLL", undefined, false)).to.throw();
			});
		});
		describe("LLLLL", (): void => {
			it("should parse 'D'", (): void => {
				expect(parse.parse("D", "LLLLL", undefined, false).time.toString()).to.equal("1970-12-01T00:00:00.000");
			});
			it("should parse 'j'", (): void => {
				expect(parse.parse("j", "LLLLL", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should not parse 'E'", (): void => {
				expect(() => parse.parse("E", "LLLLL", undefined, false)).to.throw();
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

	describe("hour", (): void => {
		describe("h", (): void => {
			it("should parse '1'", (): void => {
				expect(parse.parse("1", "h", undefined, false).time.toString()).to.equal("1970-01-01T01:00:00.000");
			});
			it("should parse '12'", (): void => {
				expect(parse.parse("12", "h", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '1 PM'", (): void => {
				expect(parse.parse("1 PM", "h a", undefined, false).time.toString()).to.equal("1970-01-01T13:00:00.000");
			});
			it("should parse '12 PM'", (): void => {
				expect(parse.parse("12 PM", "h a", undefined, false).time.toString()).to.equal("1970-01-01T12:00:00.000");
			});
			it("should parse '0'", (): void => {
				expect(parse.parse("0", "h", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '23'", (): void => {
				expect(parse.parse("23", "h", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '24'", (): void => {
				expect(() => parse.parse("24", "h", undefined, false)).to.throw();
			});
		});
		describe("hh", (): void => {
			it("should parse '01'", (): void => {
				expect(parse.parse("01", "hh", undefined, false).time.toString()).to.equal("1970-01-01T01:00:00.000");
			});
			it("should parse '12'", (): void => {
				expect(parse.parse("12", "hh", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '01 PM'", (): void => {
				expect(parse.parse("01 PM", "hh a", undefined, false).time.toString()).to.equal("1970-01-01T13:00:00.000");
			});
			it("should parse '12 PM'", (): void => {
				expect(parse.parse("12 PM", "hh a", undefined, false).time.toString()).to.equal("1970-01-01T12:00:00.000");
			});
			it("should parse '00'", (): void => {
				expect(parse.parse("00", "hh", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '23'", (): void => {
				expect(parse.parse("23", "hh", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '24'", (): void => {
				expect(() => parse.parse("24", "hh", undefined, false)).to.throw();
			});
		});
		describe("H", (): void => {
			it("should parse '0'", (): void => {
				expect(parse.parse("0", "H", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '23'", (): void => {
				expect(parse.parse("23", "H", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '24'", (): void => {
				expect(() => parse.parse("24", "H", undefined, false)).to.throw();
			});
		});
		describe("HH", (): void => {
			it("should parse '00'", (): void => {
				expect(parse.parse("00", "HH", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '23'", (): void => {
				expect(parse.parse("23", "HH", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '24'", (): void => {
				expect(() => parse.parse("24", "HH", undefined, false)).to.throw();
			});
		});
		describe("K", (): void => {
			it("should parse '0'", (): void => {
				expect(parse.parse("0", "K", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '11'", (): void => {
				expect(parse.parse("11", "K", undefined, false).time.toString()).to.equal("1970-01-01T11:00:00.000");
			});
			it("should parse '23'", (): void => {
				expect(parse.parse("23", "K", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '24'", (): void => {
				expect(() => parse.parse("24", "K", undefined, false)).to.throw();
			});
		});
		describe("KK", (): void => {
			it("should parse '00'", (): void => {
				expect(parse.parse("00", "KK", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '11'", (): void => {
				expect(parse.parse("11", "KK", undefined, false).time.toString()).to.equal("1970-01-01T11:00:00.000");
			});
			it("should parse '23'", (): void => {
				expect(parse.parse("23", "KK", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '24'", (): void => {
				expect(() => parse.parse("24", "KK", undefined, false)).to.throw();
			});
		});
		describe("k", (): void => {
			it("should parse '1'", (): void => {
				expect(parse.parse("1", "k", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '24'", (): void => {
				expect(parse.parse("24", "k", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '0'", (): void => {
				expect(() => parse.parse("0", "k", undefined, false)).to.throw();
			});
			it("should throw on '25'", (): void => {
				expect(() => parse.parse("25", "k", undefined, false)).to.throw();
			});
		});
		describe("kk", (): void => {
			it("should parse '01'", (): void => {
				expect(parse.parse("01", "kk", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '24'", (): void => {
				expect(parse.parse("24", "kk", undefined, false).time.toString()).to.equal("1970-01-01T23:00:00.000");
			});
			it("should throw on '00'", (): void => {
				expect(() => parse.parse("00", "kk", undefined, false)).to.throw();
			});
			it("should throw on '25'", (): void => {
				expect(() => parse.parse("25", "kk", undefined, false)).to.throw();
			});
		});
		describe("A", (): void => {
			it("should parse '0'", (): void => {
				expect(parse.parse("0", "A", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '1'", (): void => {
				expect(parse.parse("1", "A", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.001");
			});
			it("should parse '1000'", (): void => {
				expect(parse.parse("1000", "A", undefined, false).time.toString()).to.equal("1970-01-01T00:00:01.000");
			});
			it("should parse '86399999'", (): void => {
				expect(parse.parse("86399999", "A", undefined, false).time.toString()).to.equal("1970-01-01T23:59:59.999");
			});
			it("should throw on '86400000'", (): void => {
				expect(() => parse.parse("86400000", "A", undefined, false)).to.throw();
			});
		});
	});

	describe("second", (): void => {
		describe("s", (): void => {
			it("should parse '1'", (): void => {
				expect(parse.parse("1", "s", undefined, false).time.toString()).to.equal("1970-01-01T00:00:01.000");
			});
			it("should parse '59'", (): void => {
				expect(parse.parse("59", "s", undefined, false).time.toString()).to.equal("1970-01-01T00:00:59.000");
			});
			it("should throw on '62'", (): void => {
				// note 60, 61 could be leap seconds and we don't test them since we don't support them yet
				expect(() => parse.parse("62", "s", undefined, false)).to.throw();
			});
		});
		describe("ss", (): void => {
			it("should parse '1'", (): void => {
				expect(parse.parse("1", "ss", undefined, false).time.toString()).to.equal("1970-01-01T00:00:01.000");
			});
			it("should parse '01'", (): void => {
				expect(parse.parse("01", "ss", undefined, false).time.toString()).to.equal("1970-01-01T00:00:01.000");
			});
			it("should parse '59'", (): void => {
				expect(parse.parse("59", "ss", undefined, false).time.toString()).to.equal("1970-01-01T00:00:59.000");
			});
			it("should throw on '62'", (): void => {
				// note 60, 61 could be leap seconds and we don't test them since we don't support them yet
				expect(() => parse.parse("62", "ss", undefined, false)).to.throw();
			});
		});
		describe("S", (): void => {
			it("should parse '0'", (): void => {
				expect(parse.parse("0", "S", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '9'", (): void => {
				expect(parse.parse("9", "S", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.900");
			});
		});
		describe("SS", (): void => {
			it("should parse '00'", (): void => {
				expect(parse.parse("00", "SS", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '99'", (): void => {
				expect(parse.parse("99", "SS", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.990");
			});
		});
		describe("SSS", (): void => {
			it("should parse '000'", (): void => {
				expect(parse.parse("000", "SSS", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '999'", (): void => {
				expect(parse.parse("999", "SSS", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.999");
			});
		});
		describe("SSSS", (): void => {
			it("should parse '0000'", (): void => {
				expect(parse.parse("0000", "SSSS", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '9999' and truncate", (): void => {
				expect(parse.parse("9999", "SSSS", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.999");
			});
		});
		describe("A", (): void => {
			it("should parse '0'", (): void => {
				expect(parse.parse("0", "A", undefined, false).time.toString()).to.equal("1970-01-01T00:00:00.000");
			});
			it("should parse '86399999'", (): void => {
				expect(parse.parse("86399999", "A", undefined, false).time.toString()).to.equal("1970-01-01T23:59:59.999");
			});
			it("should throw on bigger-than-day value", (): void => {
				expect(() => parse.parse("86400000", "A", undefined, false)).to.throw();
			});
		});
	});
});
