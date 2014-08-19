var chai = require("chai");
var expect = chai.expect;

var token = require("../lib/token");

describe("format", function () {
    describe("separateTokens", function () {
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

            var expected = [
                {
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

            var expected = [
                {
                    length: 2,
                    raw: "aa",
                    type: 8 /* DAYPERIOD */,
                    symbol: "a"
                }, {
                    length: 1,
                    raw: " ",
                    type: 0 /* IDENTITY */,
                    symbol: " "
                },
                {
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

            var expected = [
                {
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

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });

        it("should escape two double ''", function () {
            var tokenizer = new token.Tokenizer("aaa''''dddccc");
            var result = tokenizer.parseTokens();

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });

        it("should escape a '' while quoting", function () {
            var tokenizer = new token.Tokenizer("aaa'Hello ''there'' buddy'ccc");
            var result = tokenizer.parseTokens();

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });

        it("should escape two '' while quoting", function () {
            var tokenizer = new token.Tokenizer("aaa'Hello ''''there'''' buddy'ccc");
            var result = tokenizer.parseTokens();

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });

        it("should escape a '' at the front of the string", function () {
            var tokenizer = new token.Tokenizer("''aaa sss");
            var result = tokenizer.parseTokens();

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });

        it("should escape a '' at the end of the string", function () {
            var tokenizer = new token.Tokenizer("aaa sss''");
            var result = tokenizer.parseTokens();

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });

        it("should escape a '' at the end of the string", function () {
            var tokenizer = new token.Tokenizer("aaa'hi'sssbbb");
            var result = tokenizer.parseTokens();

            var expected = [
                {
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
                }
            ];
            expect(result).to.eql(expected);
        });
    });
});
//# sourceMappingURL=test-token.js.map
