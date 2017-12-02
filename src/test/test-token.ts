/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";

// tslint:disable:no-unused-expression

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import { expect } from "chai";

import * as token from "../lib/token";

describe("Token", (): void => {
	describe("constructor()", (): void => {
		it("should accept an initial format string", (): void => {
			const tokenizer = new token.Tokenizer("foo");
			expect(tokenizer.parseTokens()).to.not.be.empty;
		});
	});
	describe("setFormatString", (): void => {
		it("should accept a new format string", (): void => {
			const tokenizer = new token.Tokenizer("");
			tokenizer.setFormatString("foo");
			expect(tokenizer.parseTokens()).to.not.be.empty;
		});
	});
	describe("parseTokens", (): void => {
		it("should return the empty list for an empty string", (): void => {
			const tokenizer = new token.Tokenizer("");
			const result = tokenizer.parseTokens();
			const expected: token.Token[] = [];
			expect(result).to.eql(expected);
		});

		it("should return one token for \"aaaa\"", (): void => {
			const tokenizer = new token.Tokenizer("aaaa");
			const result = tokenizer.parseTokens();
			const expected: token.Token[] = [{
				length: 4,
				raw: "aaaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}];

			expect(result).to.eql(expected);
		});

		it("should return two tokens for \"aacc\"", (): void => {
			const tokenizer = new token.Tokenizer("aacc");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 2,
				raw: "aa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 2,
					raw: "cc",
					type: token.DateTimeTokenType.WEEKDAY,
					symbol: "c"
			}];

			expect(result).to.eql(expected);
		});

		it("should return three tokens for \"aa cc\"", (): void => {
			const tokenizer = new token.Tokenizer("aa cc");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 2,
				raw: "aa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 1,
					raw: " ",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: " "
				},
				{
					length: 2,
					raw: "cc",
					type: token.DateTimeTokenType.WEEKDAY,
					symbol: "c"
				}];

			expect(result).to.eql(expected);
		});

		it("should return one token for \"    \"", (): void => {
			const tokenizer = new token.Tokenizer("    ");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 4,
				raw: "    ",
				type: token.DateTimeTokenType.IDENTITY,
				symbol: " "
			}];

			expect(result).to.eql(expected);
		});

		it("should return five tokens for \"12345\"", (): void => {
			const tokenizer = new token.Tokenizer("12345");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 1,
				raw: "1",
				type: token.DateTimeTokenType.IDENTITY,
				symbol: "1"
			}, {
					length: 1,
					raw: "2",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "2"
				}, {
					length: 1,
					raw: "3",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "3"
				}, {
					length: 1,
					raw: "4",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "4"
				}, {
					length: 1,
					raw: "5",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "5"
				}];

			expect(result).to.eql(expected);
		});

		it("should return one token for \"'hello'\"", (): void => {
			const tokenizer = new token.Tokenizer("'hello'");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 5,
				raw: "hello",
				type: token.DateTimeTokenType.IDENTITY,
				symbol: "h"
			}];
			expect(result).to.eql(expected);
		});

		it("should escape a double ''", (): void => {
			const tokenizer = new token.Tokenizer("aaa''ccc");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 1,
					raw: "'",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "'"
				}, {
					length: 3,
					raw: "ccc",
					type: token.DateTimeTokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape two double ''", (): void => {
			const tokenizer = new token.Tokenizer("aaa''''dddccc");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 2,
					raw: "''",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "'"
				}, {
					length: 3,
					raw: "ddd",
					type: token.DateTimeTokenType.DAY,
					symbol: "d"
				}, {
					length: 3,
					raw: "ccc",
					type: token.DateTimeTokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' while quoting", (): void => {
			const tokenizer = new token.Tokenizer("aaa'Hello ''there'' buddy'ccc");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 19,
					raw: "Hello 'there' buddy",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "H"
				}, {
					length: 3,
					raw: "ccc",
					type: token.DateTimeTokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape two '' while quoting", (): void => {
			const tokenizer = new token.Tokenizer("aaa'Hello ''''there'''' buddy'ccc");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 21,
					raw: "Hello ''there'' buddy",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "H"
				}, {
					length: 3,
					raw: "ccc",
					type: token.DateTimeTokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' at the front of the string", (): void => {
			const tokenizer = new token.Tokenizer("''aaa sss");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 1,
				raw: "'",
				type: token.DateTimeTokenType.IDENTITY,
				symbol: "'"
			}, {
					length: 3,
					raw: "aaa",
					type: token.DateTimeTokenType.DAYPERIOD,
					symbol: "a"
				}, {
					length: 1,
					raw: " ",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: " "
				}, {
					length: 3,
					raw: "sss",
					type: token.DateTimeTokenType.SECOND,
					symbol: "s"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' at the end of the string", (): void => {
			const tokenizer = new token.Tokenizer("aaa sss''");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 1,
					raw: " ",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: " "
				}, {
					length: 3,
					raw: "sss",
					type: token.DateTimeTokenType.SECOND,
					symbol: "s"
				}, {
					length: 1,
					raw: "'",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "'"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' at the end of the string", (): void => {
			const tokenizer = new token.Tokenizer("aaa'hi'sssbbb");
			const result = tokenizer.parseTokens();

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 2,
					raw: "hi",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "h"
				}, {
					length: 3,
					raw: "sss",
					type: token.DateTimeTokenType.SECOND,
					symbol: "s"
				}, {
					length: 3,
					raw: "bbb",
					type: token.DateTimeTokenType.IDENTITY,
					symbol: "b"
				}
			];
			expect(result).to.eql(expected);
		});
	});
});
