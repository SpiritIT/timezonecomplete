/// <reference path="../typings/test.d.ts" />
var sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });
var chai = require("chai");
var expect = chai.expect;
var token = require("../lib/token");
describe("Token", function () {
    describe("constructor", function () {
        it("should accept an initial format string", function () {
            var tokenizer = new token.Tokenizer("foo");
            expect(tokenizer.parseTokens()).to.not.be.empty;
        });
    });
    describe("setFormatString", function () {
        it("should accept a new format string", function () {
            var tokenizer = new token.Tokenizer("");
            tokenizer.setFormatString("foo");
            expect(tokenizer.parseTokens()).to.not.be.empty;
        });
    });
    describe("parseTokens", function () {
        it("should return the empty list for an empty string", function () {
            var tokenizer = new token.Tokenizer("");
            var result = tokenizer.parseTokens();
            var expected = [];
            expect(result).to.eql(expected);
        });
        it("should return one token for \"aaaa\"", function () {
            var tokenizer = new token.Tokenizer("aaaa");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 4,
                raw: "aaaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }];
            expect(result).to.eql(expected);
        });
        it("should return two tokens for \"aacc\"", function () {
            var tokenizer = new token.Tokenizer("aacc");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 2,
                raw: "aa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 2,
                raw: "cc",
                type: 7 /* WEEKDAY */,
                symbol: "c"
            }];
            expect(result).to.eql(expected);
        });
        it("should return three tokens for \"aa cc\"", function () {
            var tokenizer = new token.Tokenizer("aa cc");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 2,
                raw: "aa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 1,
                raw: " ",
                type: 0 /* IDENTITY */,
                symbol: " "
            }, {
                length: 2,
                raw: "cc",
                type: 7 /* WEEKDAY */,
                symbol: "c"
            }];
            expect(result).to.eql(expected);
        });
        it("should return one token for \"    \"", function () {
            var tokenizer = new token.Tokenizer("    ");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 4,
                raw: "    ",
                type: 0 /* IDENTITY */,
                symbol: " "
            }];
            expect(result).to.eql(expected);
        });
        it("should return five tokens for \"12345\"", function () {
            var tokenizer = new token.Tokenizer("12345");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 1,
                raw: "1",
                type: 0 /* IDENTITY */,
                symbol: "1"
            }, {
                length: 1,
                raw: "2",
                type: 0 /* IDENTITY */,
                symbol: "2"
            }, {
                length: 1,
                raw: "3",
                type: 0 /* IDENTITY */,
                symbol: "3"
            }, {
                length: 1,
                raw: "4",
                type: 0 /* IDENTITY */,
                symbol: "4"
            }, {
                length: 1,
                raw: "5",
                type: 0 /* IDENTITY */,
                symbol: "5"
            }];
            expect(result).to.eql(expected);
        });
        it("should return one token for \"'hello'\"", function () {
            var tokenizer = new token.Tokenizer("'hello'");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 5,
                raw: "hello",
                type: 0 /* IDENTITY */,
                symbol: "h"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape a double ''", function () {
            var tokenizer = new token.Tokenizer("aaa''ccc");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 1,
                raw: "'",
                type: 0 /* IDENTITY */,
                symbol: "'"
            }, {
                length: 3,
                raw: "ccc",
                type: 7 /* WEEKDAY */,
                symbol: "c"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape two double ''", function () {
            var tokenizer = new token.Tokenizer("aaa''''dddccc");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 2,
                raw: "''",
                type: 0 /* IDENTITY */,
                symbol: "'"
            }, {
                length: 3,
                raw: "ddd",
                type: 6 /* DAY */,
                symbol: "d"
            }, {
                length: 3,
                raw: "ccc",
                type: 7 /* WEEKDAY */,
                symbol: "c"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape a '' while quoting", function () {
            var tokenizer = new token.Tokenizer("aaa'Hello ''there'' buddy'ccc");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 19,
                raw: "Hello 'there' buddy",
                type: 0 /* IDENTITY */,
                symbol: "H"
            }, {
                length: 3,
                raw: "ccc",
                type: 7 /* WEEKDAY */,
                symbol: "c"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape two '' while quoting", function () {
            var tokenizer = new token.Tokenizer("aaa'Hello ''''there'''' buddy'ccc");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 21,
                raw: "Hello ''there'' buddy",
                type: 0 /* IDENTITY */,
                symbol: "H"
            }, {
                length: 3,
                raw: "ccc",
                type: 7 /* WEEKDAY */,
                symbol: "c"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape a '' at the front of the string", function () {
            var tokenizer = new token.Tokenizer("''aaa sss");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 1,
                raw: "'",
                type: 0 /* IDENTITY */,
                symbol: "'"
            }, {
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 1,
                raw: " ",
                type: 0 /* IDENTITY */,
                symbol: " "
            }, {
                length: 3,
                raw: "sss",
                type: 11 /* SECOND */,
                symbol: "s"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape a '' at the end of the string", function () {
            var tokenizer = new token.Tokenizer("aaa sss''");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 1,
                raw: " ",
                type: 0 /* IDENTITY */,
                symbol: " "
            }, {
                length: 3,
                raw: "sss",
                type: 11 /* SECOND */,
                symbol: "s"
            }, {
                length: 1,
                raw: "'",
                type: 0 /* IDENTITY */,
                symbol: "'"
            }];
            expect(result).to.eql(expected);
        });
        it("should escape a '' at the end of the string", function () {
            var tokenizer = new token.Tokenizer("aaa'hi'sssbbb");
            var result = tokenizer.parseTokens();
            var expected = [{
                length: 3,
                raw: "aaa",
                type: 8 /* DAYPERIOD */,
                symbol: "a"
            }, {
                length: 2,
                raw: "hi",
                type: 0 /* IDENTITY */,
                symbol: "h"
            }, {
                length: 3,
                raw: "sss",
                type: 11 /* SECOND */,
                symbol: "s"
            }, {
                length: 3,
                raw: "bbb",
                type: 0 /* IDENTITY */,
                symbol: "b"
            }];
            expect(result).to.eql(expected);
        });
    });
});

//# sourceMappingURL=data:application/json;base64,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