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

//# sourceMappingURL=data:application/json;base64,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QztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVzdC90ZXN0LXRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdGVzdC5kLnRzXCIgLz5cclxuXHJcbmltcG9ydCBzb3VyY2VtYXBzdXBwb3J0ID0gcmVxdWlyZShcInNvdXJjZS1tYXAtc3VwcG9ydFwiKTtcclxuLy8gRW5hYmxlIHNvdXJjZS1tYXAgc3VwcG9ydCBmb3IgYmFja3RyYWNlcy4gQ2F1c2VzIFRTIGZpbGVzICYgbGluZW51bWJlcnMgdG8gc2hvdyB1cCBpbiB0aGVtLlxyXG5zb3VyY2VtYXBzdXBwb3J0Lmluc3RhbGwoeyBoYW5kbGVVbmNhdWdodEV4Y2VwdGlvbnM6IGZhbHNlIH0pO1xyXG5cclxuaW1wb3J0IGNoYWkgPSByZXF1aXJlKFwiY2hhaVwiKTtcclxuaW1wb3J0IGV4cGVjdCA9IGNoYWkuZXhwZWN0O1xyXG5cclxuaW1wb3J0IHRva2VuID0gcmVxdWlyZShcIi4uL2xpYi90b2tlblwiKTtcclxuXHJcbmRlc2NyaWJlKFwiVG9rZW5cIiwgKCk6IHZvaWQgPT4ge1xyXG5cdGRlc2NyaWJlKFwiY29uc3RydWN0b3JcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0aXQoXCJzaG91bGQgYWNjZXB0IGFuIGluaXRpYWwgZm9ybWF0IHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiZm9vXCIpO1xyXG5cdFx0XHRleHBlY3QodG9rZW5pemVyLnBhcnNlVG9rZW5zKCkpLnRvLm5vdC5iZS5lbXB0eTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cdGRlc2NyaWJlKFwic2V0Rm9ybWF0U3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdGl0KFwic2hvdWxkIGFjY2VwdCBhIG5ldyBmb3JtYXQgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJcIik7XHJcblx0XHRcdHRva2VuaXplci5zZXRGb3JtYXRTdHJpbmcoXCJmb29cIik7XHJcblx0XHRcdGV4cGVjdCh0b2tlbml6ZXIucGFyc2VUb2tlbnMoKSkudG8ubm90LmJlLmVtcHR5O1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcblx0ZGVzY3JpYmUoXCJwYXJzZVRva2Vuc1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gdGhlIGVtcHR5IGxpc3QgZm9yIGFuIGVtcHR5IHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFtdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIG9uZSB0b2tlbiBmb3IgXFxcImFhYWFcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWFhXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiA0LFxyXG5cdFx0XHRcdHJhdzogXCJhYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIHR3byB0b2tlbnMgZm9yIFxcXCJhYWNjXFxcIlwiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFjY1wiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0cmF3OiBcImFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAyLFxyXG5cdFx0XHRcdFx0cmF3OiBcImNjXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImNcIlxyXG5cdFx0XHRcdH1dO1xyXG5cclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIHJldHVybiB0aHJlZSB0b2tlbnMgZm9yIFxcXCJhYSBjY1xcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhIGNjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMixcclxuXHRcdFx0XHRyYXc6IFwiYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiIFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiIFwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIG9uZSB0b2tlbiBmb3IgXFxcIiAgICBcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCIgICAgXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogNCxcclxuXHRcdFx0XHRyYXc6IFwiICAgIFwiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdHN5bWJvbDogXCIgXCJcclxuXHRcdFx0fV07XHJcblxyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgcmV0dXJuIGZpdmUgdG9rZW5zIGZvciBcXFwiMTIzNDVcXFwiXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCIxMjM0NVwiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0cmF3OiBcIjFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRzeW1ib2w6IFwiMVwiXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCIyXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCIyXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiM1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiM1wiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIjRcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIjRcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMSxcclxuXHRcdFx0XHRcdHJhdzogXCI1XCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCI1XCJcclxuXHRcdFx0XHR9XTtcclxuXHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCByZXR1cm4gb25lIHRva2VuIGZvciBcXFwiJ2hlbGxvJ1xcXCJcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIidoZWxsbydcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiA1LFxyXG5cdFx0XHRcdHJhdzogXCJoZWxsb1wiLFxyXG5cdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdHN5bWJvbDogXCJoXCJcclxuXHRcdFx0fV07XHJcblx0XHRcdGV4cGVjdChyZXN1bHQpLnRvLmVxbChleHBlY3RlZCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRpdChcInNob3VsZCBlc2NhcGUgYSBkb3VibGUgJydcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYScnY2NjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIidcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIidcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJjY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIHR3byBkb3VibGUgJydcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYScnJydkZGRjY2NcIik7XHJcblx0XHRcdHZhciByZXN1bHQgPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHJcblx0XHRcdHZhciBleHBlY3RlZDogdG9rZW4uVG9rZW5bXSA9IFt7XHJcblx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblx0XHRcdFx0c3ltYm9sOiBcImFcIlxyXG5cdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDIsXHJcblx0XHRcdFx0XHRyYXc6IFwiJydcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIidcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJkZGRcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJkXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NjXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImNcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSBhICcnIHdoaWxlIHF1b3RpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcImFhYSdIZWxsbyAnJ3RoZXJlJycgYnVkZHknY2NjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxOSxcclxuXHRcdFx0XHRcdHJhdzogXCJIZWxsbyAndGhlcmUnIGJ1ZGR5XCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJIXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwiY2NjXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5XRUVLREFZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcImNcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSB0d28gJycgd2hpbGUgcXVvdGluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhJ0hlbGxvICcnJyd0aGVyZScnJycgYnVkZHknY2NjXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAyMSxcclxuXHRcdFx0XHRcdHJhdzogXCJIZWxsbyAnJ3RoZXJlJycgYnVkZHlcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIkhcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJjY2NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiY1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIGEgJycgYXQgdGhlIGZyb250IG9mIHRoZSBzdHJpbmdcIiwgKCk6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5pemVyID0gbmV3IHRva2VuLlRva2VuaXplcihcIicnYWFhIHNzc1wiKTtcclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRva2VuaXplci5wYXJzZVRva2VucygpO1xyXG5cclxuXHRcdFx0dmFyIGV4cGVjdGVkOiB0b2tlbi5Ub2tlbltdID0gW3tcclxuXHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0cmF3OiBcIidcIixcclxuXHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRzeW1ib2w6IFwiJ1wiXHJcblx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJhYWFcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLkRBWVBFUklPRCxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiIFwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiIFwiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcInNzc1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcInNcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XTtcclxuXHRcdFx0ZXhwZWN0KHJlc3VsdCkudG8uZXFsKGV4cGVjdGVkKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGl0KFwic2hvdWxkIGVzY2FwZSBhICcnIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1wiLCAoKTogdm9pZCA9PiB7XHJcblx0XHRcdHZhciB0b2tlbml6ZXIgPSBuZXcgdG9rZW4uVG9rZW5pemVyKFwiYWFhIHNzcycnXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAxLFxyXG5cdFx0XHRcdFx0cmF3OiBcIiBcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLklERU5USVRZLFxyXG5cdFx0XHRcdFx0c3ltYm9sOiBcIiBcIlxyXG5cdFx0XHRcdH0sIHtcclxuXHRcdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRcdHJhdzogXCJzc3NcIixcclxuXHRcdFx0XHRcdHR5cGU6IHRva2VuLkRhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJzXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDEsXHJcblx0XHRcdFx0XHRyYXc6IFwiJ1wiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiJ1wiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0aXQoXCJzaG91bGQgZXNjYXBlIGEgJycgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXCIsICgpOiB2b2lkID0+IHtcclxuXHRcdFx0dmFyIHRva2VuaXplciA9IG5ldyB0b2tlbi5Ub2tlbml6ZXIoXCJhYWEnaGknc3NzYmJiXCIpO1xyXG5cdFx0XHR2YXIgcmVzdWx0ID0gdG9rZW5pemVyLnBhcnNlVG9rZW5zKCk7XHJcblxyXG5cdFx0XHR2YXIgZXhwZWN0ZWQ6IHRva2VuLlRva2VuW10gPSBbe1xyXG5cdFx0XHRcdGxlbmd0aDogMyxcclxuXHRcdFx0XHRyYXc6IFwiYWFhXCIsXHJcblx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuREFZUEVSSU9ELFxyXG5cdFx0XHRcdHN5bWJvbDogXCJhXCJcclxuXHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAyLFxyXG5cdFx0XHRcdFx0cmF3OiBcImhpXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSxcclxuXHRcdFx0XHRcdHN5bWJvbDogXCJoXCJcclxuXHRcdFx0XHR9LCB7XHJcblx0XHRcdFx0XHRsZW5ndGg6IDMsXHJcblx0XHRcdFx0XHRyYXc6IFwic3NzXCIsXHJcblx0XHRcdFx0XHR0eXBlOiB0b2tlbi5EYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwic1wiXHJcblx0XHRcdFx0fSwge1xyXG5cdFx0XHRcdFx0bGVuZ3RoOiAzLFxyXG5cdFx0XHRcdFx0cmF3OiBcImJiYlwiLFxyXG5cdFx0XHRcdFx0dHlwZTogdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFksXHJcblx0XHRcdFx0XHRzeW1ib2w6IFwiYlwiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0XHRleHBlY3QocmVzdWx0KS50by5lcWwoZXhwZWN0ZWQpO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn0pO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=