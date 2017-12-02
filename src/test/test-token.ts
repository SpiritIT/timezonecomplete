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

describe("token", (): void => {
	describe("tokenize()", (): void => {
		it("should return the empty list for an empty string", (): void => {
			const tokens = token.tokenize("");
			const result = tokens;
			const expected: token.Token[] = [];
			expect(result).to.eql(expected);
		});

		it("should return one token for \"aaaa\"", (): void => {
			const tokens = token.tokenize("aaaa");
			const result = tokens;
			const expected: token.Token[] = [{
				length: 4,
				raw: "aaaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}];

			expect(result).to.eql(expected);
		});

		it("should return two tokens for \"aacc\"", (): void => {
			const tokens = token.tokenize("aacc");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 2,
				raw: "aa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 2,
					raw: "cc",
					type: token.TokenType.WEEKDAY,
					symbol: "c"
			}];

			expect(result).to.eql(expected);
		});

		it("should return three tokens for \"aa cc\"", (): void => {
			const tokens = token.tokenize("aa cc");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 2,
				raw: "aa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 1,
					raw: " ",
					type: token.TokenType.IDENTITY,
					symbol: " "
				},
				{
					length: 2,
					raw: "cc",
					type: token.TokenType.WEEKDAY,
					symbol: "c"
				}];

			expect(result).to.eql(expected);
		});

		it("should return one token for \"    \"", (): void => {
			const tokens = token.tokenize("    ");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 4,
				raw: "    ",
				type: token.TokenType.IDENTITY,
				symbol: " "
			}];

			expect(result).to.eql(expected);
		});

		it("should return five tokens for \"12345\"", (): void => {
			const tokens = token.tokenize("12345");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 1,
				raw: "1",
				type: token.TokenType.IDENTITY,
				symbol: "1"
			}, {
					length: 1,
					raw: "2",
					type: token.TokenType.IDENTITY,
					symbol: "2"
				}, {
					length: 1,
					raw: "3",
					type: token.TokenType.IDENTITY,
					symbol: "3"
				}, {
					length: 1,
					raw: "4",
					type: token.TokenType.IDENTITY,
					symbol: "4"
				}, {
					length: 1,
					raw: "5",
					type: token.TokenType.IDENTITY,
					symbol: "5"
				}];

			expect(result).to.eql(expected);
		});

		it("should return one token for \"'hello'\"", (): void => {
			const tokens = token.tokenize("'hello'");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 5,
				raw: "hello",
				type: token.TokenType.IDENTITY,
				symbol: "h"
			}];
			expect(result).to.eql(expected);
		});

		it("should escape a double ''", (): void => {
			const tokens = token.tokenize("aaa''ccc");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 1,
					raw: "'",
					type: token.TokenType.IDENTITY,
					symbol: "'"
				}, {
					length: 3,
					raw: "ccc",
					type: token.TokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape two double ''", (): void => {
			const tokens = token.tokenize("aaa''''ddccc");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 2,
					raw: "''",
					type: token.TokenType.IDENTITY,
					symbol: "'"
				}, {
					length: 2,
					raw: "dd",
					type: token.TokenType.DAY,
					symbol: "d"
				}, {
					length: 3,
					raw: "ccc",
					type: token.TokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' while quoting", (): void => {
			const tokens = token.tokenize("aaa'Hello ''there'' buddy'ccc");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 19,
					raw: "Hello 'there' buddy",
					type: token.TokenType.IDENTITY,
					symbol: "H"
				}, {
					length: 3,
					raw: "ccc",
					type: token.TokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape two '' while quoting", (): void => {
			const tokens = token.tokenize("aaa'Hello ''''there'''' buddy'ccc");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 21,
					raw: "Hello ''there'' buddy",
					type: token.TokenType.IDENTITY,
					symbol: "H"
				}, {
					length: 3,
					raw: "ccc",
					type: token.TokenType.WEEKDAY,
					symbol: "c"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' at the front of the string", (): void => {
			const tokens = token.tokenize("''aaa ss");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 1,
				raw: "'",
				type: token.TokenType.IDENTITY,
				symbol: "'"
			}, {
					length: 3,
					raw: "aaa",
					type: token.TokenType.DAYPERIOD,
					symbol: "a"
				}, {
					length: 1,
					raw: " ",
					type: token.TokenType.IDENTITY,
					symbol: " "
				}, {
					length: 2,
					raw: "ss",
					type: token.TokenType.SECOND,
					symbol: "s"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' at the end of the string", (): void => {
			const tokens = token.tokenize("aaa ss''");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 1,
					raw: " ",
					type: token.TokenType.IDENTITY,
					symbol: " "
				}, {
					length: 2,
					raw: "ss",
					type: token.TokenType.SECOND,
					symbol: "s"
				}, {
					length: 1,
					raw: "'",
					type: token.TokenType.IDENTITY,
					symbol: "'"
				}
			];
			expect(result).to.eql(expected);
		});

		it("should escape a '' at the end of the string", (): void => {
			const tokens = token.tokenize("aaa'hi'ssbbb");
			const result = tokens;

			const expected: token.Token[] = [{
				length: 3,
				raw: "aaa",
				type: token.TokenType.DAYPERIOD,
				symbol: "a"
			}, {
					length: 2,
					raw: "hi",
					type: token.TokenType.IDENTITY,
					symbol: "h"
				}, {
					length: 2,
					raw: "ss",
					type: token.TokenType.SECOND,
					symbol: "s"
				}, {
					length: 3,
					raw: "bbb",
					type: token.TokenType.IDENTITY,
					symbol: "b"
				}
			];
			expect(result).to.eql(expected);
		});
	});
});
