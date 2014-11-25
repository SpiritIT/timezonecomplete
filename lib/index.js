/**
* Copyright(c) 2014 Spirit IT BV
*
* Date and Time utility functions - main index
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
/* tslint:disable:no-unused-expression */
var basics = require("./basics");
basics;
var TimeUnit = basics.TimeUnit;
exports.TimeUnit = TimeUnit;
var WeekDay = basics.WeekDay;
exports.WeekDay = WeekDay;

var timeUnitToMilliseconds = basics.timeUnitToMilliseconds;
exports.timeUnitToMilliseconds = timeUnitToMilliseconds;
var isLeapYear = basics.isLeapYear;
exports.isLeapYear = isLeapYear;
var daysInMonth = basics.daysInMonth;
exports.daysInMonth = daysInMonth;
var daysInYear = basics.daysInYear;
exports.daysInYear = daysInYear;
var firstWeekDayOfMonth = basics.firstWeekDayOfMonth;
exports.firstWeekDayOfMonth = firstWeekDayOfMonth;
var lastWeekDayOfMonth = basics.lastWeekDayOfMonth;
exports.lastWeekDayOfMonth = lastWeekDayOfMonth;
var weekDayOnOrAfter = basics.weekDayOnOrAfter;
exports.weekDayOnOrAfter = weekDayOnOrAfter;
var weekDayOnOrBefore = basics.weekDayOnOrBefore;
exports.weekDayOnOrBefore = weekDayOnOrBefore;
var weekNumber = basics.weekNumber;
exports.weekNumber = weekNumber;
var weekOfMonth = basics.weekOfMonth;
exports.weekOfMonth = weekOfMonth;
var dayOfYear = basics.dayOfYear;
exports.dayOfYear = dayOfYear;
var secondOfDay = basics.secondOfDay;
exports.secondOfDay = secondOfDay;

var datetime = require("./datetime");
datetime;
var DateTime = datetime.DateTime;
exports.DateTime = DateTime;
var now = datetime.now;
exports.now = now;
var nowLocal = datetime.nowLocal;
exports.nowLocal = nowLocal;
var nowUtc = datetime.nowUtc;
exports.nowUtc = nowUtc;

var duration = require("./duration");
duration;
var Duration = duration.Duration;
exports.Duration = Duration;
var hours = duration.hours;
exports.hours = hours;
var minutes = duration.minutes;
exports.minutes = minutes;
var seconds = duration.seconds;
exports.seconds = seconds;
var milliseconds = duration.milliseconds;
exports.milliseconds = milliseconds;

var javascript = require("./javascript");
javascript;
var DateFunctions = javascript.DateFunctions;
exports.DateFunctions = DateFunctions;

var period = require("./period");
period;
var Period = period.Period;
exports.Period = Period;
var PeriodDst = period.PeriodDst;
exports.PeriodDst = PeriodDst;
var periodDstToString = period.periodDstToString;
exports.periodDstToString = periodDstToString;

var timesource = require("./timesource");
timesource;

var RealTimeSource = timesource.RealTimeSource;
exports.RealTimeSource = RealTimeSource;

var timezone = require("./timezone");
timezone;
var NormalizeOption = timezone.NormalizeOption;
exports.NormalizeOption = NormalizeOption;
var TimeZoneKind = timezone.TimeZoneKind;
exports.TimeZoneKind = TimeZoneKind;
var TimeZone = timezone.TimeZone;
exports.TimeZone = TimeZone;
var local = timezone.local;
exports.local = local;
var utc = timezone.utc;
exports.utc = utc;
var zone = timezone.zone;
exports.zone = zone;

var globals = require("./globals");
globals;
var min = globals.min;
exports.min = min;
var max = globals.max;
exports.max = max;
//# sourceMappingURL=index.js.map
