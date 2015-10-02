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

//# sourceMappingURL=data:application/json;base64,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cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdGVzdC5kLnRzXCIgLz5cclxuXHJcbmltcG9ydCBzb3VyY2VtYXBzdXBwb3J0ID0gcmVxdWlyZShcInNvdXJjZS1tYXAtc3VwcG9ydFwiKTtcclxuLy8gRW5hYmxlIHNvdXJjZS1tYXAgc3VwcG9ydCBmb3IgYmFja3RyYWNlcy4gQ2F1c2VzIFRTIGZpbGVzICYgbGluZW51bWJlcnMgdG8gc2hvdyB1cCBpbiB0aGVtLlxyXG5zb3VyY2VtYXBzdXBwb3J0Lmluc3RhbGwoeyBoYW5kbGVVbmNhdWdodEV4Y2VwdGlvbnM6IGZhbHNlIH0pO1xyXG5cclxuaW1wb3J0IGNoYWkgPSByZXF1aXJlKFwiY2hhaVwiKTtcclxuaW1wb3J0IGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xyXG5cclxuaW1wb3J0IHRva2VuID0gcmVxdWlyZShcIi4uL2xpYi90b2tlblwiKTtcclxuXHJcbmRlc2NyaWJlKFwiVG9rZW5cIiwgKCk6IHZvaWQgPT4ge1xyXG5cdGRlc2NyaWJlKFwiY29uc3RydWN0b3JcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0aXQoXCJzaG91bGQgYWNjZXB0IGFuIGluaXRpYWwgZm9ybWF0IHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiZm9vXCIpO1xyXG5cdFx0XHRleHBlY3QodG9rZW5pemVyLnBhcnNlVG9rZW5zKCkpLnRvLm5vdC5iZS5lbXB0eTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cdGRlc2NyaWJlKFwic2V0Rm9ybWF0U3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdGl0KFwic2hvdWxkIGFjY2VwdCBhIG5ldyBmb3JtYXQgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJcIik7XHJcblx0XHRcdHRva2VuaXplci5zZXRGb3JtYXRTdHJpbmcoXCJmb29cIik7XHJcblx0XHRcdGV4cGVjdCh0b2tlbml6ZXIucGFyc2VUb2tlbnMoKSkudG8ubm90LmJlLmVtcHR5O1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblx0ZGVzY3JpYmUoXCJwYXJzZVRva2Vuc1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gdGhlIGVtcHR5IGxpc3QgZm9yIGFuIGVtcHR5IHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFtdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIG9uZSB0b2tlbiBmb3IgXFxcImFhYWFcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWFhXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiA0LFxyXG5cdFx0XHRcdHJhdzogXCJhYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIHR3byB0b2tlbnMgZm9yIFxcXCJhYWNjXFxcIlwiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFjY1wiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0cmF3OiBcImFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAyLFxyXG5cdFx0XHRcdFx0cmF3OiBcImNjXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImNcIlxyXG5cdFx0XHRcdH1dO1xyXG5cclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIHJldHVybiB0aHJlZSB0b2tlbnMgZm9yIFxcXCJhYSBjY1xcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhIGNjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMixcclxuXHRcdFx0XHRyYXc6IFwiYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiIFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiIFwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIG9uZSB0b2tlbiBmb3IgXFxcIiAgICBcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCIgICAgXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogNCxcclxuXHRcdFx0XHRyYXc6IFwiICAgIFwiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdHN5bWJvbDogXCIgXCJcclxuXHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIGZpdmUgdG9rZW5zIGZvciBcXFwiMTIzNDVcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCIxMjM0NVwiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0cmF3OiBcIjFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRzeW1ib2w6IFwiMVwiXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCIyXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCIyXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiM1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiM1wiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIjRcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIjRcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCI1XCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCI1XCJcclxuXHRcdFx0XHR9XTtcclxuXHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gb25lIHRva2VuIGZvciBcXFwiJ2hlbGxvJ1xcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIidoZWxsbydcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiA1LFxyXG5cdFx0XHRcdHJhdzogXCJoZWxsb1wiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdHN5bWJvbDogXCJoXCJcclxuXHRcdFx0fV07XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCBlc2NhcGUgYSBkb3VibGUgJydcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYScnY2NjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIidcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIidcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJjY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIHR3byBkb3VibGUgJydcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYScnJydkZGRjY2NcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0XHRyYXc6IFwiJydcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIidcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJkZGRcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJkXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NjXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImNcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSBhICcnIHdoaWxlIHF1b3RpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYSdIZWxsbyAnJ3RoZXJlJycgYnVkZHknY2NjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxOSxcclxuXHRcdFx0XHRcdHJhdzogXCJIZWxsbyAndGhlcmUnIGJ1ZGR5XCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJIXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NjXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImNcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSB0d28gJycgd2hpbGUgcXVvdGluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhJ0hlbGxvICcnJyd0aGVyZScnJycgYnVkZHknY2NjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAyMSxcclxuXHRcdFx0XHRcdHJhdzogXCJIZWxsbyAnJ3RoZXJlJycgYnVkZHlcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIkhcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJjY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIGEgJycgYXQgdGhlIGZyb250IG9mIHRoZSBzdHJpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIicnYWFhIHNzc1wiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0cmF3OiBcIidcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRzeW1ib2w6IFwiJ1wiXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRCxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiIFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiIFwiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcInNzc1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcInNcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSBhICcnIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhIHNzcycnXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIiBcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIiBcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJzc3NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJzXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiJ1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiJ1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIGEgJycgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWEnaGknc3NzYmJiXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAyLFxyXG5cdFx0XHRcdFx0cmF3OiBcImhpXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJoXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwic3NzXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwic1wiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcImJiYlwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiYlwiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn0pO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
