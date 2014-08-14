/// <reference path="../typings/test.d.ts" />
var assert = require("assert");
var chai = require("chai");
var expect = chai.expect;

var math = require("../lib/math");

describe("isInt()", function () {
    it("should return true for integers", function () {
        expect(math.isInt(1)).to.be.true;
        expect(math.isInt(0)).to.be.true;
        expect(math.isInt(-1)).to.be.true;
    });
    it("should return false for rational numbers", function () {
        expect(math.isInt(1.1)).to.be.false;
        expect(math.isInt(0.1)).to.be.false;
        expect(math.isInt(-1.1)).to.be.false;
    });
    it("should return false for NaN", function () {
        expect(math.isInt(NaN)).to.be.false;
    });
    it("should return false for null", function () {
        expect(math.isInt(null)).to.be.false;
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
        expect(isNaN(math.filterFloat(""))).to.be.true;
        expect(isNaN(math.filterFloat("1a"))).to.be.true;
        expect(isNaN(math.filterFloat("a1"))).to.be.true;
        expect(isNaN(math.filterFloat(" 1"))).to.be.true;
        expect(isNaN(math.filterFloat("1 "))).to.be.true;
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
