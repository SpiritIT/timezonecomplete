/// <reference path="../typings/test.d.ts" />
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var duration = require("../lib/duration");

var Duration = duration.Duration;

describe("Duration()", function () {
    describe("constructor", function () {
        it("construct by hour", function () {
            expect(Duration.hours(2).milliseconds()).to.equal(2 * 60 * 60 * 1000);
        });

        it("construct by minute", function () {
            expect(Duration.minutes(2).milliseconds()).to.equal(2 * 60 * 1000);
        });

        it("construct by second", function () {
            expect(Duration.seconds(2).milliseconds()).to.equal(2 * 1000);
        });

        it("construct by milliseconds", function () {
            expect(Duration.milliseconds(2).milliseconds()).to.equal(2);
        });

        it("construct no args", function () {
            expect((new Duration()).milliseconds()).to.equal(0);
        });

        it("construct from number", function () {
            expect((new Duration(1)).milliseconds()).to.equal(1);
            expect((new Duration(-1)).milliseconds()).to.equal(-1);
        });

        it("construct from string", function () {
            expect((new Duration("0")).milliseconds()).to.equal(0);
            expect((new Duration("1")).milliseconds()).to.equal(1 * 3600 * 1000);
            expect((new Duration("01")).milliseconds()).to.equal(1 * 3600 * 1000);
            expect((new Duration("01:01")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000);
            expect((new Duration("01:01:01")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000);
            expect((new Duration("01:01:01.1")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 100);
            expect((new Duration("01:01:01.101")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101);
            expect((new Duration("-01:01:01.101")).milliseconds()).to.equal(-1 * (1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101));
            expect((new Duration("-1:1:1.101")).milliseconds()).to.equal(-1 * (1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101));
            expect((new Duration("25")).milliseconds()).to.equal(25 * 3600 * 1000);
            expect((new Duration("-01:02:03.004")).milliseconds()).to.equal(-1 * (1 * 3600 * 1000 + 2 * 60 * 1000 + 3 * 1000 + 4));
        });

        it("throws on invalid string", function () {
            /* tslint:disable:no-unused-expression */
            assert.throws(function () {
                new Duration("harrie");
            });
            assert.throws(function () {
                new Duration("01:01:01:01");
            });
            assert.throws(function () {
                new Duration("01.001");
            });
            assert.throws(function () {
                new Duration("01:02.003");
            });
            assert.throws(function () {
                new Duration("01:01:01:-2.003");
            });
            assert.throws(function () {
                new Duration(".001");
            });
            assert.throws(function () {
                new Duration(":01:01");
            });
            /* tslint:enable:no-unused-expression */
        });
    });

    describe("clone", function () {
        it("should return an object with the same value", function () {
            var d = new Duration("01:00:00.000");
            expect(d.clone().milliseconds()).to.equal(3600000);
        });
        it("should return a new object", function () {
            var d = new Duration("01:00:00.000");
            expect(d.clone() === d).to.be.false;
        });
    });

    describe("getters", function () {
        it("getters", function () {
            var duration = new Duration("-01:02:03.004");
            var millis = -1 * (1 * 3600 * 1000 + 2 * 60 * 1000 + 3 * 1000 + 4);
            expect(duration.sign()).to.equal("-");
            expect(duration.hours()).to.equal(millis / 3600000);
            expect(duration.minutes()).to.equal(millis / 60000);
            expect(duration.minute()).to.equal(2);
            expect(duration.seconds()).to.equal(millis / 1000);
            expect(duration.second()).to.equal(3);
            expect(duration.milliseconds()).to.equal(millis);
            expect(duration.millisecond()).to.equal(4);
            var duration2 = new Duration("01:02:03.004");
            expect(duration2.sign()).to.equal("");
        });
    });

    describe("lessThan()", function () {
        it("should return true for a greater other", function () {
            expect(Duration.milliseconds(-1).lessThan(Duration.milliseconds(0))).to.be.true;
            expect(Duration.milliseconds(-1).lessThan(Duration.milliseconds(1))).to.be.true;
            expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(2))).to.be.true;
            expect(Duration.seconds(1).lessThan(Duration.seconds(2))).to.be.true;
            expect(Duration.seconds(1).lessThan(Duration.hours(1))).to.be.true;
            expect(Duration.hours(-1).lessThan(Duration.seconds(1))).to.be.true;
        });
        it("should return false for an equal other", function () {
            expect(Duration.milliseconds(60000).lessThan(Duration.milliseconds(60000))).to.be.false;
            expect(Duration.milliseconds(60000).lessThan(Duration.minutes(1))).to.be.false;
        });
        it("should return false for a lesser other", function () {
            expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(-1))).to.be.false;
            expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(-1))).to.be.false;
            expect(Duration.milliseconds(2).lessThan(Duration.milliseconds(1))).to.be.false;
            expect(Duration.seconds(1).lessThan(Duration.seconds(1))).to.be.false;
            expect(Duration.hours(1).lessThan(Duration.seconds(1))).to.be.false;
            expect(Duration.seconds(1).lessThan(Duration.hours(-1))).to.be.false;
        });
    });

    describe("equals()", function () {
        it("should return false for a greater other", function () {
            expect(Duration.milliseconds(-1).equals(Duration.milliseconds(0))).to.be.false;
            expect(Duration.milliseconds(-1).equals(Duration.milliseconds(1))).to.be.false;
            expect(Duration.milliseconds(1).equals(Duration.milliseconds(2))).to.be.false;
            expect(Duration.seconds(1).equals(Duration.seconds(2))).to.be.false;
            expect(Duration.seconds(1).equals(Duration.hours(1))).to.be.false;
            expect(Duration.hours(-1).equals(Duration.seconds(1))).to.be.false;
        });
        it("should return true for an equal other", function () {
            expect(Duration.milliseconds(60000).equals(Duration.milliseconds(60000))).to.be.true;
            expect(Duration.milliseconds(60000).equals(Duration.minutes(1))).to.be.true;
        });
        it("should return false for a lesser other", function () {
            expect(Duration.milliseconds(1).equals(Duration.milliseconds(-1))).to.be.false;
            expect(Duration.milliseconds(1).equals(Duration.milliseconds(-1))).to.be.false;
            expect(Duration.milliseconds(2).equals(Duration.milliseconds(1))).to.be.false;
            expect(Duration.seconds(2).equals(Duration.seconds(1))).to.be.false;
            expect(Duration.hours(1).equals(Duration.seconds(1))).to.be.false;
            expect(Duration.seconds(1).equals(Duration.hours(-1))).to.be.false;
        });
    });

    describe("greaterThan()", function () {
        it("should return false for a greater other", function () {
            expect(Duration.milliseconds(-1).greaterThan(Duration.milliseconds(0))).to.be.false;
            expect(Duration.milliseconds(-1).greaterThan(Duration.milliseconds(1))).to.be.false;
            expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(2))).to.be.false;
            expect(Duration.seconds(1).greaterThan(Duration.seconds(2))).to.be.false;
            expect(Duration.seconds(1).greaterThan(Duration.hours(1))).to.be.false;
            expect(Duration.hours(-1).greaterThan(Duration.seconds(1))).to.be.false;
        });
        it("should return false for an equal other", function () {
            expect(Duration.milliseconds(60000).greaterThan(Duration.milliseconds(60000))).to.be.false;
            expect(Duration.milliseconds(60000).greaterThan(Duration.minutes(1))).to.be.false;
        });
        it("should return true for a lesser other", function () {
            expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(-1))).to.be.true;
            expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(-1))).to.be.true;
            expect(Duration.milliseconds(2).greaterThan(Duration.milliseconds(1))).to.be.true;
            expect(Duration.seconds(2).greaterThan(Duration.seconds(1))).to.be.true;
            expect(Duration.hours(1).greaterThan(Duration.seconds(1))).to.be.true;
            expect(Duration.seconds(1).greaterThan(Duration.hours(-1))).to.be.true;
        });
    });

    describe("min()", function () {
        it("should return a value equal to this if this is smaller", function () {
            expect(Duration.milliseconds(1).min(Duration.milliseconds(2)).milliseconds()).to.equal(1);
        });
        it("should any of the values if they are equal", function () {
            expect(Duration.milliseconds(1).min(Duration.milliseconds(1)).milliseconds()).to.equal(1);
        });
        it("should the other value if it is smaller", function () {
            expect(Duration.milliseconds(2).min(Duration.milliseconds(1)).milliseconds()).to.equal(1);
        });
    });

    describe("max()", function () {
        it("should return a value equal to other if this is smaller", function () {
            expect(Duration.milliseconds(1).max(Duration.milliseconds(2)).milliseconds()).to.equal(2);
        });
        it("should any of the values if they are equal", function () {
            expect(Duration.milliseconds(1).max(Duration.milliseconds(1)).milliseconds()).to.equal(1);
        });
        it("should this value if this is greater", function () {
            expect(Duration.milliseconds(2).max(Duration.milliseconds(1)).milliseconds()).to.equal(2);
        });
    });

    describe("multiply()", function () {
        it("should multiply by positive number", function () {
            expect(Duration.milliseconds(2).multiply(3).milliseconds()).to.equal(6);
        });
        it("should multiply by 0", function () {
            expect(Duration.milliseconds(2).multiply(0).milliseconds()).to.equal(0);
        });
        it("should multiply by negative number", function () {
            expect(Duration.milliseconds(2).multiply(-3).milliseconds()).to.equal(-6);
        });
    });

    describe("divide()", function () {
        it("should divide by positive number", function () {
            expect(Duration.milliseconds(6).divide(3).milliseconds()).to.equal(2);
        });
        it("should throw on divide by 0", function () {
            assert.throws(function () {
                Duration.milliseconds(6).divide(0);
            });
        });
        it("should divide by negative number", function () {
            expect(Duration.milliseconds(6).divide(-3).milliseconds()).to.equal(-2);
        });
    });

    describe("add()", function () {
        it("should add positive number", function () {
            expect(Duration.milliseconds(2).add(Duration.milliseconds(3)).milliseconds()).to.equal(5);
        });
        it("should add 0", function () {
            expect(Duration.milliseconds(2).add(Duration.milliseconds(0)).milliseconds()).to.equal(2);
        });
        it("should add negative number", function () {
            expect(Duration.milliseconds(2).add(Duration.milliseconds(-3)).milliseconds()).to.equal(-1);
        });
        it("should return a new object always", function () {
            var d = Duration.milliseconds(2);
            var e = Duration.milliseconds(0);
            expect(d.add(e) === d).to.be.false;
            expect(d.add(e) === e).to.be.false;
        });
    });

    describe("sub()", function () {
        it("should sub positive number", function () {
            expect(Duration.milliseconds(2).sub(Duration.milliseconds(3)).milliseconds()).to.equal(-1);
        });
        it("should sub 0", function () {
            expect(Duration.milliseconds(2).sub(Duration.milliseconds(0)).milliseconds()).to.equal(2);
        });
        it("should sub negative number", function () {
            expect(Duration.milliseconds(2).sub(Duration.milliseconds(-3)).milliseconds()).to.equal(5);
        });
        it("should return a new object always", function () {
            var d = Duration.milliseconds(2);
            var e = Duration.milliseconds(0);
            expect(d.sub(e) === d).to.be.false;
            expect(d.sub(e) === e).to.be.false;
        });
    });

    describe("toFullString()", function () {
        it("toFullString", function () {
            expect((new Duration("-30:02:03.004")).toFullString()).to.equal("-30:02:03.004");
            expect((new Duration("-01:02:03.004")).toFullString()).to.equal("-01:02:03.004");
            expect((new Duration("-01:02:03.4")).toFullString()).to.equal("-01:02:03.400");
            expect((new Duration("01")).toFullString()).to.equal("01:00:00.000");
        });
    });

    describe("toString()", function () {
        it("should handle hours above 23", function () {
            expect((new Duration("-30:02:03.004")).toString()).to.equal("-30:02:03.004");
        });
        it("should handle hours below 24", function () {
            expect((new Duration("-01:02:03.004")).toString()).to.equal("-01:02:03.004");
        });
        it("should shorten the string if possible", function () {
            expect((new Duration("-01:02:03.4")).toString()).to.equal("-01:02:03.400");
            expect((new Duration("01")).toString()).to.equal("01");
            expect((new Duration("01:02")).toString()).to.equal("01:02");
            expect((new Duration("01:02:03")).toString()).to.equal("01:02:03");
            expect((new Duration("01:02:03.000")).toString()).to.equal("01:02:03");
        });
    });

    describe("inspect()", function () {
        it("should work", function () {
            var d = new Duration("-01:02:03.4");
            expect(d.inspect()).to.equal("[Duration: " + d.toString() + "]");
        });
    });
});
