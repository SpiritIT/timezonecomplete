/**
 * Copyright(c) 2014 Spirit IT BV
 */

"use strict";

import sourcemapsupport = require("source-map-support");
// Enable source-map support for backtraces. Causes TS files & linenumbers to show up in them.
sourcemapsupport.install({ handleUncaughtExceptions: false });

import * as assert from "assert";
import { expect } from "chai";

import { Duration, TimeUnit } from "../lib/index";
import * as index from "../lib/index";

describe("duration loose", (): void => {
	it("milliseconds()", (): void => {
		const d = index.milliseconds(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Millisecond);
	});
	it("seconds()", (): void => {
		const d = index.seconds(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Second);
	});
	it("minutes()", (): void => {
		const d = index.minutes(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Minute);
	});
	it("hours()", (): void => {
		const d = index.hours(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Hour);
	});
	it("days()", (): void => {
		const d = index.days(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Day);
	});
	it("months()", (): void => {
		const d = index.months(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Month);
	});
	it("years()", (): void => {
		const d = index.years(2);
		expect(d.amount()).to.equal(2);
		expect(d.unit()).to.equal(TimeUnit.Year);
	});
});

describe("Duration()", (): void => {

	describe("constructor()", (): void => {
		it("default constructor", (): void => {
			const d = new Duration();
			expect(d.amount()).to.equal(0);
			expect(d.unit()).to.equal(TimeUnit.Millisecond);
		});
		it("construct from number", (): void => {
			expect((new Duration(1)).milliseconds()).to.equal(1);
			expect((new Duration(-1)).milliseconds()).to.equal(-1);
		});
		it("construct from HMS string", (): void => {
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
			expect((new Duration(" \n\t01:01:01.101 \n\t")).milliseconds()).to.equal(1 * 3600 * 1000 + 1 * 60 * 1000 + 1 * 1000 + 101);
		});
		it("construct from amount+unit string", (): void => {
			expect((new Duration("1 hour")).hours()).to.equal(1);
			expect((new Duration("1 HoUr")).hours()).to.equal(1);
			expect((new Duration("2 hours")).hours()).to.equal(2);
			expect((new Duration("   1 hour  ")).hours()).to.equal(1);
		});

		it("throws on invalid string", (): void => {
			/* tslint:disable:no-unused-expression */
			assert.throws((): void => { new Duration("harrie"); });
			assert.throws((): void => { new Duration("01:01:01:01"); });
			assert.throws((): void => { new Duration("01.001"); });
			assert.throws((): void => { new Duration("01:02.003"); });
			assert.throws((): void => { new Duration("01:01:01:-2.003"); });
			assert.throws((): void => { new Duration(".001"); });
			assert.throws((): void => { new Duration(":01:01"); });
			/* tslint:enable:no-unused-expression */
		});

		it("construct from time unit", (): void => {
			expect((new Duration(1, index.TimeUnit.Millisecond)).milliseconds()).to.equal(1);
			expect((new Duration(1, index.TimeUnit.Second)).seconds()).to.equal(1);
			expect((new Duration(1, index.TimeUnit.Minute)).minutes()).to.equal(1);
			expect((new Duration(1, index.TimeUnit.Hour)).hours()).to.equal(1);
			expect((new Duration(1, index.TimeUnit.Day)).hours()).to.equal(24);
			expect((new Duration(1, index.TimeUnit.Week)).hours()).to.equal(7 * 24);
			expect((new Duration(1, index.TimeUnit.Month)).hours()).to.equal(30 * 24);
			expect((new Duration(1, index.TimeUnit.Year)).hours()).to.equal(360 * 24);
			expect((new Duration(-2.5, index.TimeUnit.Second)).seconds()).to.equal(-2.5);
		});

	});

	describe("clone", (): void => {
		it("should return an object with the same value", (): void => {
			const d: Duration = new Duration("01:00:00.000");
			expect(d.clone().milliseconds()).to.equal(3600000);
		});
		it("should return a new object", (): void => {
			const d: Duration = new Duration("01:00:00.000");
			expect(d.clone() === d).to.equal(false);
		});
	});

	describe("getters", (): void => {
		it("time getters", (): void => {
			const duration = new Duration("-25:02:03.004");
			const millis = -1 * (25 * 3600 * 1000 + 2 * 60 * 1000 + 3 * 1000 + 4);
			expect(duration.sign()).to.equal("-");

			expect(duration.days()).to.equal(millis / (24 * 60 * 60 * 1000));
			expect(duration.day()).to.equal(1);
			expect(duration.hours()).to.equal(millis / 3600000);
			expect(duration.hour()).to.equal(1);
			expect(duration.wholeHours()).to.equal(25);
			expect(duration.minutes()).to.equal(millis / 60000);
			expect(duration.minute()).to.equal(2);
			expect(duration.seconds()).to.equal(millis / 1000);
			expect(duration.second()).to.equal(3);
			expect(duration.milliseconds()).to.equal(millis);
			expect(duration.millisecond()).to.equal(4);
			const duration2 = new Duration("01:02:03.004");
			expect(duration2.sign()).to.equal("");
		});
		it("date getters", (): void => {
			const duration = new Duration("2.75 years");
			expect(duration.sign()).to.equal("");

			expect(duration.days()).to.equal(360 * 2.75);
			expect(duration.day()).to.equal(0);
			expect(duration.months()).to.equal(12 * 2.75);
			expect(duration.month()).to.equal(9);
			expect(duration.years()).to.equal(2.75);
			expect(duration.wholeYears()).to.equal(2);
		});
		it("wholeYears", (): void => {
			expect(Duration.months(25).wholeYears()).to.equal(2);
			expect(Duration.days(722).wholeYears()).to.equal(2);
		});
	});

	describe("lessThan()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(Duration.milliseconds(-1).lessThan(Duration.milliseconds(0))).to.equal(true);
			expect(Duration.milliseconds(-1).lessThan(Duration.milliseconds(1))).to.equal(true);
			expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(2))).to.equal(true);
			expect(Duration.seconds(1).lessThan(Duration.seconds(2))).to.equal(true);
			expect(Duration.seconds(1).lessThan(Duration.hours(1))).to.equal(true);
			expect(Duration.hours(-1).lessThan(Duration.seconds(1))).to.equal(true);
			expect(Duration.months(-1).lessThan(Duration.seconds(1))).to.equal(true);
		});
		it("should return false for an equal other", (): void => {
			expect(Duration.milliseconds(60000).lessThan(Duration.milliseconds(60000))).to.equal(false);
			expect(Duration.milliseconds(60000).lessThan(Duration.minutes(1))).to.equal(false);
		});
		it("should return false for a lesser other", (): void => {
			expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(-1))).to.equal(false);
			expect(Duration.milliseconds(1).lessThan(Duration.milliseconds(-1))).to.equal(false);
			expect(Duration.milliseconds(2).lessThan(Duration.milliseconds(1))).to.equal(false);
			expect(Duration.seconds(2).lessThan(Duration.seconds(1))).to.equal(false);
			expect(Duration.hours(1).lessThan(Duration.seconds(1))).to.equal(false);
			expect(Duration.seconds(1).lessThan(Duration.hours(-1))).to.equal(false);
		});
	});

	describe("lessEqual()", (): void => {
		it("should return true for a greater other", (): void => {
			expect(Duration.milliseconds(-1).lessEqual(Duration.milliseconds(0))).to.equal(true);
			expect(Duration.milliseconds(-1).lessEqual(Duration.milliseconds(1))).to.equal(true);
			expect(Duration.milliseconds(1).lessEqual(Duration.milliseconds(2))).to.equal(true);
			expect(Duration.seconds(1).lessEqual(Duration.seconds(2))).to.equal(true);
			expect(Duration.seconds(1).lessEqual(Duration.hours(1))).to.equal(true);
			expect(Duration.hours(-1).lessEqual(Duration.seconds(1))).to.equal(true);
		});
		it("should return true for an equal other", (): void => {
			expect(Duration.milliseconds(60000).lessEqual(Duration.milliseconds(60000))).to.equal(true);
			expect(Duration.milliseconds(60000).lessEqual(Duration.minutes(1))).to.equal(true);
		});
		it("should return false for a lesser other", (): void => {
			expect(Duration.milliseconds(1).lessEqual(Duration.milliseconds(-1))).to.equal(false);
			expect(Duration.milliseconds(1).lessEqual(Duration.milliseconds(-1))).to.equal(false);
			expect(Duration.milliseconds(2).lessEqual(Duration.milliseconds(1))).to.equal(false);
			expect(Duration.seconds(2).lessEqual(Duration.seconds(1))).to.equal(false);
			expect(Duration.hours(1).lessEqual(Duration.seconds(1))).to.equal(false);
			expect(Duration.seconds(1).lessEqual(Duration.hours(-1))).to.equal(false);
		});
	});

	describe("equals()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(Duration.milliseconds(-1).equals(Duration.milliseconds(0))).to.equal(false);
			expect(Duration.milliseconds(-1).equals(Duration.milliseconds(1))).to.equal(false);
			expect(Duration.milliseconds(1).equals(Duration.milliseconds(2))).to.equal(false);
			expect(Duration.seconds(1).equals(Duration.seconds(2))).to.equal(false);
			expect(Duration.seconds(1).equals(Duration.hours(1))).to.equal(false);
			expect(Duration.hours(-1).equals(Duration.seconds(1))).to.equal(false);
		});
		it("should return true for an equal other", (): void => {
			expect(Duration.milliseconds(60000).equals(Duration.milliseconds(60000))).to.equal(true);
			expect(Duration.milliseconds(60000).equals(Duration.minutes(1))).to.equal(true);
			expect(Duration.hours(24).equals(Duration.days(1))).to.equal(true);
			expect(Duration.days(30).equals(Duration.months(1))).to.equal(true);
		});
		it("should return false for a lesser other", (): void => {
			expect(Duration.milliseconds(1).equals(Duration.milliseconds(-1))).to.equal(false);
			expect(Duration.milliseconds(1).equals(Duration.milliseconds(-1))).to.equal(false);
			expect(Duration.milliseconds(2).equals(Duration.milliseconds(1))).to.equal(false);
			expect(Duration.seconds(2).equals(Duration.seconds(1))).to.equal(false);
			expect(Duration.hours(1).equals(Duration.seconds(1))).to.equal(false);
			expect(Duration.seconds(1).equals(Duration.hours(-1))).to.equal(false);
		});
	});

	describe("identical()", (): void => {
		it("should return false for equal other with different unit", (): void => {
			expect(Duration.seconds(60).identical(Duration.minutes(1))).to.equal(false);
			expect(Duration.hours(24).identical(Duration.days(1))).to.equal(false);
			expect(Duration.days(30).identical(Duration.months(1))).to.equal(false);
		});
		it("should return true for an identical other", (): void => {
			expect(Duration.seconds(60).identical(Duration.seconds(60))).to.equal(true);
		});
	});

	describe("equalsExact()", (): void => {
		it("should return true for same unit and amount", (): void => {
			expect(Duration.milliseconds(1).equalsExact(Duration.milliseconds(1))).to.equal(true);
			expect(Duration.hours(1).equalsExact(Duration.hours(1))).to.equal(true);
			expect(Duration.days(1).equalsExact(Duration.days(1))).to.equal(true);
			expect(Duration.months(1).equalsExact(Duration.months(1))).to.equal(true);
			expect(Duration.years(1).equalsExact(Duration.years(1))).to.equal(true);
		});
		it("should return false approximately equal units", (): void => {
			expect(Duration.hours(24).equalsExact(Duration.days(1))).to.equal(false);
			expect(Duration.days(30).equalsExact(Duration.months(1))).to.equal(false);
		});
		it("should return true for an exactly equal other with different unit", (): void => {
			expect(Duration.seconds(60).equalsExact(Duration.seconds(60))).to.equal(true);
			expect(Duration.seconds(60).equalsExact(Duration.minutes(1))).to.equal(true);
			expect(Duration.seconds(3600).equalsExact(Duration.hours(1))).to.equal(true);
			expect(Duration.months(12).equalsExact(Duration.years(1))).to.equal(true);
		});
	});

	describe("greaterThan()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(Duration.milliseconds(-1).greaterThan(Duration.milliseconds(0))).to.equal(false);
			expect(Duration.milliseconds(-1).greaterThan(Duration.milliseconds(1))).to.equal(false);
			expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(2))).to.equal(false);
			expect(Duration.seconds(1).greaterThan(Duration.seconds(2))).to.equal(false);
			expect(Duration.seconds(1).greaterThan(Duration.hours(1))).to.equal(false);
			expect(Duration.hours(-1).greaterThan(Duration.seconds(1))).to.equal(false);
		});
		it("should return false for an equal other", (): void => {
			expect(Duration.milliseconds(60000).greaterThan(Duration.milliseconds(60000))).to.equal(false);
			expect(Duration.milliseconds(60000).greaterThan(Duration.minutes(1))).to.equal(false);
		});
		it("should return true for a lesser other", (): void => {
			expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(-1))).to.equal(true);
			expect(Duration.milliseconds(1).greaterThan(Duration.milliseconds(-1))).to.equal(true);
			expect(Duration.milliseconds(2).greaterThan(Duration.milliseconds(1))).to.equal(true);
			expect(Duration.seconds(2).greaterThan(Duration.seconds(1))).to.equal(true);
			expect(Duration.hours(1).greaterThan(Duration.seconds(1))).to.equal(true);
			expect(Duration.seconds(1).greaterThan(Duration.hours(-1))).to.equal(true);
		});
	});

	describe("greaterEqual()", (): void => {
		it("should return false for a greater other", (): void => {
			expect(Duration.milliseconds(-1).greaterEqual(Duration.milliseconds(0))).to.equal(false);
			expect(Duration.milliseconds(-1).greaterEqual(Duration.milliseconds(1))).to.equal(false);
			expect(Duration.milliseconds(1).greaterEqual(Duration.milliseconds(2))).to.equal(false);
			expect(Duration.seconds(1).greaterEqual(Duration.seconds(2))).to.equal(false);
			expect(Duration.seconds(1).greaterEqual(Duration.hours(1))).to.equal(false);
			expect(Duration.hours(-1).greaterEqual(Duration.seconds(1))).to.equal(false);
		});
		it("should return true for an equal other", (): void => {
			expect(Duration.milliseconds(60000).greaterEqual(Duration.milliseconds(60000))).to.equal(true);
			expect(Duration.milliseconds(60000).greaterEqual(Duration.minutes(1))).to.equal(true);
		});
		it("should return true for a lesser other", (): void => {
			expect(Duration.milliseconds(1).greaterEqual(Duration.milliseconds(-1))).to.equal(true);
			expect(Duration.milliseconds(1).greaterEqual(Duration.milliseconds(-1))).to.equal(true);
			expect(Duration.milliseconds(2).greaterEqual(Duration.milliseconds(1))).to.equal(true);
			expect(Duration.seconds(2).greaterEqual(Duration.seconds(1))).to.equal(true);
			expect(Duration.hours(1).greaterEqual(Duration.seconds(1))).to.equal(true);
			expect(Duration.seconds(1).greaterEqual(Duration.hours(-1))).to.equal(true);
		});
	});

	describe("min()", (): void => {
		it("should return a value equal to this if this is smaller", (): void => {
			expect(Duration.milliseconds(1).min(Duration.milliseconds(2)).milliseconds()).to.equal(1);
		});
		it("should any of the values if they are equal", (): void => {
			expect(Duration.milliseconds(1).min(Duration.milliseconds(1)).milliseconds()).to.equal(1);
		});
		it("should the other value if it is smaller", (): void => {
			expect(Duration.milliseconds(2).min(Duration.milliseconds(1)).milliseconds()).to.equal(1);
		});
	});

	describe("max()", (): void => {
		it("should return a value equal to other if this is smaller", (): void => {
			expect(Duration.milliseconds(1).max(Duration.milliseconds(2)).milliseconds()).to.equal(2);
		});
		it("should any of the values if they are equal", (): void => {
			expect(Duration.milliseconds(1).max(Duration.milliseconds(1)).milliseconds()).to.equal(1);
		});
		it("should this value if this is greater", (): void => {
			expect(Duration.milliseconds(2).max(Duration.milliseconds(1)).milliseconds()).to.equal(2);
		});
	});

	describe("multiply()", (): void => {
		it("should multiply by positive number", (): void => {
			expect(Duration.milliseconds(2).multiply(3).milliseconds()).to.equal(6);
		});
		it("should multiply by 0", (): void => {
			expect(Duration.milliseconds(2).multiply(0).milliseconds()).to.equal(0);
		});
		it("should multiply by negative number", (): void => {
			expect(Duration.milliseconds(2).multiply(-3).milliseconds()).to.equal(-6);
		});
	});

	describe("divide() by number", (): void => {
		it("should divide by positive number", (): void => {
			expect(Duration.milliseconds(6).divide(3).milliseconds()).to.equal(2);
		});
		it("should throw on divide by 0", (): void => {
			assert.throws((): void => {
				Duration.milliseconds(6).divide(0);
			});
		});
		it("should divide by negative number", (): void => {
			expect(Duration.milliseconds(6).divide(-3).milliseconds()).to.equal(-2);
		});
	});

	describe("divide() by Duration", (): void => {
		it("should divide by positive Duration", (): void => {
			expect(Duration.years(1).divide(Duration.months(2))).to.equal(6);
		});
		it("should throw on divide by 0", (): void => {
			assert.throws((): void => {
				Duration.milliseconds(6).divide(Duration.months(0));
			});
		});
		it("should divide by negative number", (): void => {
			expect(Duration.years(1).divide(Duration.months(-2))).to.equal(-6);
		});
	});

	describe("add()", (): void => {
		it("should add positive number", (): void => {
			expect(Duration.milliseconds(2).add(Duration.milliseconds(3)).milliseconds()).to.equal(5);
		});
		it("should add 0", (): void => {
			expect(Duration.milliseconds(2).add(Duration.milliseconds(0)).milliseconds()).to.equal(2);
		});
		it("should add negative number", (): void => {
			expect(Duration.milliseconds(2).add(Duration.milliseconds(-3)).milliseconds()).to.equal(-1);
		});
		it("should return a new object always", (): void => {
			const d: Duration = Duration.milliseconds(2);
			const e: Duration = Duration.milliseconds(0);
			expect(d.add(e) === d).to.equal(false);
			expect(d.add(e) === e).to.equal(false);
		});
	});

	describe("sub()", (): void => {
		it("should sub positive number", (): void => {
			expect(Duration.milliseconds(2).sub(Duration.milliseconds(3)).milliseconds()).to.equal(-1);
		});
		it("should sub 0", (): void => {
			expect(Duration.milliseconds(2).sub(Duration.milliseconds(0)).milliseconds()).to.equal(2);
		});
		it("should sub negative number", (): void => {
			expect(Duration.milliseconds(2).sub(Duration.milliseconds(-3)).milliseconds()).to.equal(5);
		});
		it("should return a new object always", (): void => {
			const d: Duration = Duration.milliseconds(2);
			const e: Duration = Duration.milliseconds(0);
			expect(d.sub(e) === d).to.equal(false);
			expect(d.sub(e) === e).to.equal(false);
		});
	});

	describe("abs()", (): void => {
		it("should return the same value for a positive duration", (): void => {
			expect(Duration.milliseconds(2).abs().milliseconds()).to.equal(2);
		});
		it("should return the same value for a zero duration", (): void => {
			expect(Duration.milliseconds(0).abs().milliseconds()).to.equal(0);
		});
		it("should return the inverted value for a negative duration", (): void => {
			expect(Duration.milliseconds(-2).abs().milliseconds()).to.equal(2);
		});
		it("should return a clone", (): void => {
			const d: Duration = Duration.milliseconds(2);
			expect(d.abs()).not.to.equal(d);
		});
	});

	describe("toFullString()", (): void => {
		it("toFullString", (): void => {
			expect((new Duration("-30:02:03.004")).toFullString()).to.equal("-30:02:03.004");
			expect((new Duration("-01:02:03.004")).toFullString()).to.equal("-01:02:03.004");
			expect((new Duration("-01:02:03.4")).toFullString()).to.equal("-01:02:03.400");
			expect((new Duration("01")).toFullString()).to.equal("01:00:00.000");
		});
	});

	describe("toHmsString()", (): void => {
		it("should handle hours above 23", (): void => {
			expect((new Duration("-30:02:03.004")).toHmsString()).to.equal("-30:02:03.004");
		});
		it("should handle hours below 24", (): void => {
			expect((new Duration("-01:02:03.004")).toHmsString()).to.equal("-01:02:03.004");
		});
		it("should shorten the string if possible", (): void => {
			expect((new Duration("-01:02:03.4")).toHmsString()).to.equal("-01:02:03.400");
			expect((new Duration("01")).toHmsString()).to.equal("01");
			expect((new Duration("01:02")).toHmsString()).to.equal("01:02");
			expect((new Duration("01:02:03")).toHmsString()).to.equal("01:02:03");
			expect((new Duration("01:02:03.000")).toHmsString()).to.equal("01:02:03");
		});
	});

	describe("inspect()", (): void => {
		it("should work", (): void => {
			const d: Duration = new Duration("-01:02:03.4");
			expect(d.inspect()).to.equal("[Duration: " + d.toString() + "]");
		});
	});

	describe("valueOf()", (): void => {
		it("should work", (): void => {
			const d: Duration = new Duration("-01:02:03.4");
			expect(d.valueOf()).to.equal(d.milliseconds());
		});
	});
});

