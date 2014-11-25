/// <reference path="../typings/test.d.ts" />
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var math = require("../lib/math");

describe("isInt()", function () {
    it("should return true for integers", function () {
        expect(math.isInt(1)).to.equal(true);
        expect(math.isInt(0)).to.equal(true);
        expect(math.isInt(-1)).to.equal(true);
    });
    it("should return false for rational numbers", function () {
        expect(math.isInt(1.1)).to.equal(false);
        expect(math.isInt(0.1)).to.equal(false);
        expect(math.isInt(-1.1)).to.equal(false);
    });
    it("should return false for NaN", function () {
        expect(math.isInt(NaN)).to.equal(false);
    });
    it("should return false for null", function () {
        expect(math.isInt(null)).to.equal(false);
    });
});

describe("filterFloat()", function () {
    it("should return a number for valid input", function () {
        expect(math.filterFloat("1")).to.equal(1);
        expect(math.filterFloat("1.1")).to.equal(1.1);
        expect(math.filterFloat("+1")).to.equal(1);
        expect(math.filterFloat("+1.1")).to.equal(1.1);
        expect(math.filterFloat("-1")).to.equal(-1);
        expect(math.filterFloat("-1.1")).to.equal(-1.1);
        expect(math.filterFloat("0")).to.equal(0);
        expect(math.filterFloat("+0")).to.equal(0);
        expect(math.filterFloat("-0")).to.equal(0);
    });
    it("should return NaN for non-numbers", function () {
        expect(isNaN(math.filterFloat(""))).to.equal(true);
        expect(isNaN(math.filterFloat("1a"))).to.equal(true);
        expect(isNaN(math.filterFloat("a1"))).to.equal(true);
        expect(isNaN(math.filterFloat(" 1"))).to.equal(true);
        expect(isNaN(math.filterFloat("1 "))).to.equal(true);
    });
});

describe("positiveModulo()", function () {
    it("should work for positive numbers", function () {
        expect(math.positiveModulo(0, 2)).to.equal(0);
        expect(math.positiveModulo(1, 2)).to.equal(1);
        expect(math.positiveModulo(2, 2)).to.equal(0);
    });
    it("should work for negative numbers", function () {
        expect(math.positiveModulo(0, 2)).to.equal(0);
        expect(math.positiveModulo(-1, 2)).to.equal(1);
        expect(math.positiveModulo(-2, 2)).to.equal(0);
    });
    it("should throw for modulo <= 0", function () {
        assert.throws(function () {
            math.positiveModulo(0, 0);
        });
        assert.throws(function () {
            math.positiveModulo(0, -1);
        });
    });
});
//# sourceMappingURL=test-math.js.map
