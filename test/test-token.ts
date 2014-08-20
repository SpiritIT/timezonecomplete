import chai = require("chai");
import expect = chai.expect;

import token = require("../lib/token");

describe("Token", (): void => {
	describe("constructor", (): void => {
		it("should accept an initial format string", (): void => {
			var tokenizer = new token.Tokenizer("foo");
			expect(tokenizer.parseTokens()).to.not.be.empty;
		});
	});
	describe("setFormatString", (): void => {
		it("should accept a new format string", (): void => {
			var tokenizer = new token.Tokenizer("");
			tokenizer.setFormatString("foo");
			expect(tokenizer.parseTokens()).to.not.be.empty;
		});
	});
	describe("parseTokens", (): void => {
		it("should return the empty list for an empty string", (): void => {
			var tokenizer = new token.Tokenizer("");
			var result = tokenizer.parseTokens();
			var expected: token.Token[] = [];
			expect(result).to.eql(expected);
		});

		it("should return one token for \"aaaa\"", (): void => {
			var tokenizer = new token.Tokenizer("aaaa");
			var result = tokenizer.parseTokens();
			var expected: token.Token[] = [{
				length: 4,
				raw: "aaaa",
				type: token.DateTimeTokenType.DAYPERIOD,
				symbol: "a"
			}];

			expect(result).to.eql(expected);
		});

		it("should return two tokens for \"aacc\"", (): void => {
			var tokenizer = new token.Tokenizer("aacc");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("aa cc");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("    ");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
				length: 4,
				raw: "    ",
				type: token.DateTimeTokenType.IDENTITY,
				symbol: " "
			}];

			expect(result).to.eql(expected);
		});

		it("should return five tokens for \"12345\"", (): void => {
			var tokenizer = new token.Tokenizer("12345");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("'hello'");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
				length: 5,
				raw: "hello",
				type: token.DateTimeTokenType.IDENTITY,
				symbol: "h"
			}];
			expect(result).to.eql(expected);
		});

		it("should escape a double ''", (): void => {
			var tokenizer = new token.Tokenizer("aaa''ccc");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("aaa''''dddccc");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("aaa'Hello ''there'' buddy'ccc");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("aaa'Hello ''''there'''' buddy'ccc");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("''aaa sss");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("aaa sss''");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
			var tokenizer = new token.Tokenizer("aaa'hi'sssbbb");
			var result = tokenizer.parseTokens();

			var expected: token.Token[] = [{
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
