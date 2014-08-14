/// <reference path="../typings/test.d.ts" />

import assert = require("assert");
import chai = require("chai");
import expect = chai.expect;

import math = require("../lib/math");


describe("isInt()", (): void => {
	it("should return true for integers", (): void => {
		expect(math.isInt(1)).to.be.true;
		expect(math.isInt(0)).to.be.true;
		expect(math.isInt(-1)).to.be.true;
	});
	it("should return false for rational numbers", (): void => {
		expect(math.isInt(1.1)).to.be.false;
		expect(math.isInt(0.1)).to.be.false;
		expect(math.isInt(-1.1)).to.be.false;
	});
	it("should return false for NaN", (): void => {
		expect(math.isInt(NaN)).to.be.false;
	});
	it("should return false for null", (): void => {
		expect(math.isInt(null)).to.be.false;
	});
});

describe("filterFloat()", (): void => {
	it("should return a number for valid input", (): void => {
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
	it("should return NaN for non-numbers", (): void => {
		expect(isNaN(math.filterFloat(""))).to.be.true;
		expect(isNaN(math.filterFloat("1a"))).to.be.true;
		expect(isNaN(math.filterFloat("a1"))).to.be.true;
		expect(isNaN(math.filterFloat(" 1"))).to.be.true;
		expect(isNaN(math.filterFloat("1 "))).to.be.true;
	});
});

describe("positiveModulo()", (): void => {
	it("should work for positive numbers", (): void => {
		expect(math.positiveModulo(0, 2)).to.equal(0);
		expect(math.positiveModulo(1, 2)).to.equal(1);
		expect(math.positiveModulo(2, 2)).to.equal(0);
	});
	it("should work for negative numbers", (): void => {
		expect(math.positiveModulo(0, 2)).to.equal(0);
		expect(math.positiveModulo(-1, 2)).to.equal(1);
		expect(math.positiveModulo(-2, 2)).to.equal(0);
	});
	it("should throw for modulo <= 0", (): void => {
		assert.throws((): void => {
			math.positiveModulo(0, 0);
		});
		assert.throws((): void => {
			math.positiveModulo(0, -1);
		});
	});
});
