/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Date and Time utility functions - main index
 */

/// <reference path="../typings/lib.d.ts"/>

"use strict";

/* tslint:disable:no-unused-expression */

import basics = require("./basics"); basics;
export import TimeUnit = basics.TimeUnit;
export import WeekDay = basics.WeekDay;

export import timeUnitToMilliseconds = basics.timeUnitToMilliseconds;
export import isLeapYear = basics.isLeapYear;
export import daysInMonth = basics.daysInMonth;
export import daysInYear = basics.daysInYear;
export import firstWeekDayOfMonth = basics.firstWeekDayOfMonth;
export import lastWeekDayOfMonth = basics.lastWeekDayOfMonth;
export import weekDayOnOrAfter = basics.weekDayOnOrAfter;
export import weekDayOnOrBefore = basics.weekDayOnOrBefore;
export import weekNumber = basics.weekNumber;
export import weekOfMonth = basics.weekOfMonth;
export import dayOfYear = basics.dayOfYear;
export import secondOfDay = basics.secondOfDay;
export import timeUnitToString = basics.timeUnitToString;
export import stringToTimeUnit = basics.stringToTimeUnit;

import datetime = require("./datetime"); datetime;
export import DateTime = datetime.DateTime;
export import now = datetime.now;
export import nowLocal = datetime.nowLocal;
export import nowUtc = datetime.nowUtc;
export import UTC_MILLIS_CACHE = datetime.UTC_MILLIS_CACHE;

import duration = require("./duration"); duration;
export import Duration = duration.Duration;
export import years = duration.years;
export import months = duration.months;
export import days = duration.days;
export import hours = duration.hours;
export import minutes = duration.minutes;
export import seconds = duration.seconds;
export import milliseconds = duration.milliseconds;

import javascript = require("./javascript"); javascript;
export import DateFunctions = javascript.DateFunctions;

import period = require("./period"); period;
export import Period = period.Period;
export import PeriodDst = period.PeriodDst;
export import periodDstToString = period.periodDstToString;

import timesource = require("./timesource"); timesource;
export import TimeSource = timesource.TimeSource;
export import RealTimeSource = timesource.RealTimeSource;

import timezone = require("./timezone"); timezone;
export import NormalizeOption = timezone.NormalizeOption;
export import TimeZoneKind = timezone.TimeZoneKind;
export import TimeZone = timezone.TimeZone;
export import local = timezone.local;
export import utc = timezone.utc;
export import zone = timezone.zone;

import tzDatabase = require("./tz-database"); tzDatabase;
export import AtType = tzDatabase.AtType;
export import isValidOffsetString = tzDatabase.isValidOffsetString;
export import OnType = tzDatabase.OnType;
export import RuleInfo = tzDatabase.RuleInfo;
export import ToType = tzDatabase.ToType;
export import Transition = tzDatabase.Transition;
export import TzDatabase = tzDatabase.TzDatabase;
export import ZoneInfo = tzDatabase.ZoneInfo;


import globals = require("./globals"); globals;
export import min = globals.min;
export import max = globals.max;

