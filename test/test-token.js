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
                    type: token.DateTimeTokenType.DAYPERIOD,
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
        it("should return three tokens for \"aa cc\"", function () {
            var tokenizer = new token.Tokenizer("aa cc");
            var result = tokenizer.parseTokens();
            var expected = [{
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
        it("should return one token for \"    \"", function () {
            var tokenizer = new token.Tokenizer("    ");
            var result = tokenizer.parseTokens();
            var expected = [{
                    length: 4,
                    raw: "    ",
                    type: token.DateTimeTokenType.IDENTITY,
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
        it("should return one token for \"'hello'\"", function () {
            var tokenizer = new token.Tokenizer("'hello'");
            var result = tokenizer.parseTokens();
            var expected = [{
                    length: 5,
                    raw: "hello",
                    type: token.DateTimeTokenType.IDENTITY,
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
        it("should escape two double ''", function () {
            var tokenizer = new token.Tokenizer("aaa''''dddccc");
            var result = tokenizer.parseTokens();
            var expected = [{
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
        it("should escape a '' while quoting", function () {
            var tokenizer = new token.Tokenizer("aaa'Hello ''there'' buddy'ccc");
            var result = tokenizer.parseTokens();
            var expected = [{
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
        it("should escape two '' while quoting", function () {
            var tokenizer = new token.Tokenizer("aaa'Hello ''''there'''' buddy'ccc");
            var result = tokenizer.parseTokens();
            var expected = [{
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
        it("should escape a '' at the front of the string", function () {
            var tokenizer = new token.Tokenizer("''aaa sss");
            var result = tokenizer.parseTokens();
            var expected = [{
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
        it("should escape a '' at the end of the string", function () {
            var tokenizer = new token.Tokenizer("aaa sss''");
            var result = tokenizer.parseTokens();
            var expected = [{
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
        it("should escape a '' at the end of the string", function () {
            var tokenizer = new token.Tokenizer("aaa'hi'sssbbb");
            var result = tokenizer.parseTokens();
            var expected = [{
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

//# sourceMappingURL=data:application/json;base64,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LCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90ZXN0LmQudHNcIiAvPlxyXG5cclxuaW1wb3J0IHNvdXJjZW1hcHN1cHBvcnQgPSByZXF1aXJlKFwic291cmNlLW1hcC1zdXBwb3J0XCIpO1xyXG4vLyBFbmFibGUgc291cmNlLW1hcCBzdXBwb3J0IGZvciBiYWNrdHJhY2VzLiBDYXVzZXMgVFMgZmlsZXMgJiBsaW5lbnVtYmVycyB0byBzaG93IHVwIGluIHRoZW0uXHJcbnNvdXJjZW1hcHN1cHBvcnQuaW5zdGFsbCh7IGhhbmRsZVVuY2F1Z2h0RXhjZXB0aW9uczogZmFsc2UgfSk7XHJcblxyXG5pbXBvcnQgY2hhaSA9IHJlcXVpcmUoXCJjaGFpXCIpO1xyXG5pbXBvcnQgZXhwZWN0ID0gY2hhaS5leHBlY3Q7XHJcblxyXG5pbXBvcnQgdG9rZW4gPSByZXF1aXJlKFwiLi4vbGliL3Rva2VuXCIpO1xyXG5cclxuZGVzY3JpYmUoXCJUb2tlblwiLCAoKTogdm9pZCA9PiB7XHJcblx0ZGVzY3JpYmUoXCJjb25zdHJ1Y3RvclwiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRpdChcInNob3VsZCBhY2NlcHQgYW4gaW5pdGlhbCBmb3JtYXQgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJmb29cIik7XHJcblx0XHRcdGV4cGVjdCh0b2tlbml6ZXIucGFyc2VUb2tlbnMoKSkudG8ubm90LmJlLmVtcHR5O1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblx0ZGVzY3JpYmUoXCJzZXRGb3JtYXRTdHJpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0aXQoXCJzaG91bGQgYWNjZXB0IGEgbmV3IGZvcm1hdCBzdHJpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIlwiKTtcclxuXHRcdFx0dG9rZW5pemVyLnNldEZvcm1hdFN0cmluZyhcImZvb1wiKTtcclxuXHRcdFx0ZXhwZWN0KHRva2VuaXplci5wYXJzZVRva2VucygpKS50by5ub3QuYmUuZW1wdHk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxuXHRkZXNjcmliZShcInBhcnNlVG9rZW5zXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdGl0KFwic2hvdWxkIHJldHVybiB0aGUgZW1wdHkgbGlzdCBmb3IgYW4gZW1wdHkgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW107XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gb25lIHRva2VuIGZvciBcXFwiYWFhYVxcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYWFcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDQsXHJcblx0XHRcdFx0cmF3OiBcImFhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9XTtcclxuXHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gdHdvIHRva2VucyBmb3IgXFxcImFhY2NcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWNjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMixcclxuXHRcdFx0XHRyYXc6IFwiYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIHRocmVlIHRva2VucyBmb3IgXFxcImFhIGNjXFxcIlwiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWEgY2NcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAyLFxyXG5cdFx0XHRcdHJhdzogXCJhYVwiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRCxcclxuXHRcdFx0XHRzeW1ib2w6IFwiYVwiXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCIgXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCIgXCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMixcclxuXHRcdFx0XHRcdHJhdzogXCJjY1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJjXCJcclxuXHRcdFx0XHR9XTtcclxuXHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gb25lIHRva2VuIGZvciBcXFwiICAgIFxcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIiAgICBcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiA0LFxyXG5cdFx0XHRcdHJhdzogXCIgICAgXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0c3ltYm9sOiBcIiBcIlxyXG5cdFx0XHR9XTtcclxuXHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gZml2ZSB0b2tlbnMgZm9yIFxcXCIxMjM0NVxcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIjEyMzQ1XCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRyYXc6IFwiMVwiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdHN5bWJvbDogXCIxXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIjJcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIjJcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCIzXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCIzXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiNFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiNFwiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIjVcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIjVcIlxyXG5cdFx0XHRcdH1dO1xyXG5cclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIHJldHVybiBvbmUgdG9rZW4gZm9yIFxcXCInaGVsbG8nXFxcIlwiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiJ2hlbGxvJ1wiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDUsXHJcblx0XHRcdFx0cmF3OiBcImhlbGxvXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0c3ltYm9sOiBcImhcIlxyXG5cdFx0XHR9XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSBhIGRvdWJsZSAnJ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhJydjY2NcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiJ1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiJ1wiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcImNjY1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJjXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdF07XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCBlc2NhcGUgdHdvIGRvdWJsZSAnJ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhJycnJ2RkZGNjY1wiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0cmF3OiBcImFhYVwiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRCxcclxuXHRcdFx0XHRzeW1ib2w6IFwiYVwiXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMixcclxuXHRcdFx0XHRcdHJhdzogXCInJ1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiJ1wiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcImRkZFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImRcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJjY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIGEgJycgd2hpbGUgcXVvdGluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhJ0hlbGxvICcndGhlcmUnJyBidWRkeSdjY2NcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDE5LFxyXG5cdFx0XHRcdFx0cmF3OiBcIkhlbGxvICd0aGVyZScgYnVkZHlcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIkhcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJjY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIHR3byAnJyB3aGlsZSBxdW90aW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWEnSGVsbG8gJycnJ3RoZXJlJycnJyBidWRkeSdjY2NcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIkhlbGxvICcndGhlcmUnJyBidWRkeVwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiSFwiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcImNjY1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuV0VFS0RBWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJjXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdF07XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCBlc2NhcGUgYSAnJyBhdCB0aGUgZnJvbnQgb2YgdGhlIHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiJydhYWEgc3NzXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRyYXc6IFwiJ1wiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdHN5bWJvbDogXCInXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcImFhYVwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCIgXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCIgXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwic3NzXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwic1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIGEgJycgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWEgc3NzJydcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiIFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiIFwiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcInNzc1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcInNcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCInXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCInXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdF07XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCBlc2NhcGUgYSAnJyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYSdoaSdzc3NiYmJcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0XHRyYXc6IFwiaGlcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImhcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJzc3NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJzXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwiYmJiXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJiXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdF07XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHR9KTtcclxufSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==