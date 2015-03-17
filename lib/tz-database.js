/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Olsen Timezone Database container
 *
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
var util = require("util");
var basics = require("./basics");
var duration = require("./duration");
var math = require("./math");
/* tslint:disable */
var data = require("./timezone-data.json");
/* tslint:enable */
var Duration = duration.Duration;
var TimeStruct = basics.TimeStruct;
var WeekDay = basics.WeekDay;
/**
 * Type of rule TO column value
 */
(function (ToType) {
    /**
     * Either a year number or "only"
     */
    ToType[ToType["Year"] = 0] = "Year";
    /**
     * "max"
     */
    ToType[ToType["Max"] = 1] = "Max";
})(exports.ToType || (exports.ToType = {}));
var ToType = exports.ToType;
/**
 * Type of rule ON column value
 */
(function (OnType) {
    /**
     * Day-of-month number
     */
    OnType[OnType["DayNum"] = 0] = "DayNum";
    /**
     * "lastSun" or "lastWed" etc
     */
    OnType[OnType["LastX"] = 1] = "LastX";
    /**
     * e.g. "Sun>=8"
     */
    OnType[OnType["GreqX"] = 2] = "GreqX";
    /**
     * e.g. "Sun<=8"
     */
    OnType[OnType["LeqX"] = 3] = "LeqX";
})(exports.OnType || (exports.OnType = {}));
var OnType = exports.OnType;
(function (AtType) {
    /**
     * Local time (no DST)
     */
    AtType[AtType["Standard"] = 0] = "Standard";
    /**
     * Wall clock time (local time with DST)
     */
    AtType[AtType["Wall"] = 1] = "Wall";
    /**
     * Utc time
     */
    AtType[AtType["Utc"] = 2] = "Utc";
})(exports.AtType || (exports.AtType = {}));
var AtType = exports.AtType;
/**
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 *
 * See http://www.cstdbill.com/tzdb/tz-how-to.html
 */
var RuleInfo = (function () {
    function RuleInfo(
        /**
         * FROM column year number.
         * Note, can be -10000 for NaN value (e.g. for "SystemV" rules)
         */
        from, 
        /**
         * TO column type: Year for year numbers and "only" values, Max for "max" value.
         */
        toType, 
        /**
         * If TO column is a year, the year number. If TO column is "only", the FROM year.
         */
        toYear, 
        /**
         * TYPE column, not used so far
         */
        type, 
        /**
         * IN column month number 1-12
         */
        inMonth, 
        /**
         * ON column type
         */
        onType, 
        /**
         * If onType is DayNum, the day number
         */
        onDay, 
        /**
         * If onType is not DayNum, the weekday
         */
        onWeekDay, 
        /**
         * AT column hour
         */
        atHour, 
        /**
         * AT column minute
         */
        atMinute, 
        /**
         * AT column second
         */
        atSecond, 
        /**
         * AT column type
         */
        atType, 
        /**
         * DST offset from local standard time (NOT from UTC!)
         */
        save, 
        /**
         * Character to insert in %s for time zone abbreviation
         * Note if TZ database indicates "-" this is the empty string
         */
        letter) {
        this.from = from;
        this.toType = toType;
        this.toYear = toYear;
        this.type = type;
        this.inMonth = inMonth;
        this.onType = onType;
        this.onDay = onDay;
        this.onWeekDay = onWeekDay;
        this.atHour = atHour;
        this.atMinute = atMinute;
        this.atSecond = atSecond;
        this.atType = atType;
        this.save = save;
        this.letter = letter;
        if (this.save) {
            this.save = this.save.convert(3 /* Hour */);
        }
    }
    /**
     * Returns true iff this rule is applicable in the year
     */
    RuleInfo.prototype.applicable = function (year) {
        if (year < this.from) {
            return false;
        }
        switch (this.toType) {
            case 1 /* Max */: return true;
            case 0 /* Year */: return (year <= this.toYear);
        }
    };
    /**
     * Sort comparison
     * @return (first effective date is less than other's first effective date)
     */
    RuleInfo.prototype.effectiveLess = function (other) {
        if (this.from < other.from) {
            return true;
        }
        if (this.from > other.from) {
            return false;
        }
        if (this.inMonth < other.inMonth) {
            return true;
        }
        if (this.inMonth > other.inMonth) {
            return false;
        }
        if (this.effectiveDate(this.from).lessThan(other.effectiveDate(this.from))) {
            return true;
        }
        return false;
    };
    /**
     * Sort comparison
     * @return (first effective date is equal to other's first effective date)
     */
    RuleInfo.prototype.effectiveEqual = function (other) {
        if (this.from !== other.from) {
            return false;
        }
        if (this.inMonth !== other.inMonth) {
            return false;
        }
        if (!this.effectiveDate(this.from).equals(other.effectiveDate(this.from))) {
            return false;
        }
        return true;
    };
    /**
     * Returns the date that the rule takes effect. Note that the time
     * is NOT adjusted for wall clock time or standard time, i.e. this.atType is
     * not taken into account
     */
    RuleInfo.prototype.effectiveDate = function (year) {
        assert(this.applicable(year), "Rule is not applicable in " + year.toString(10));
        // year and month are given
        var tm = new TimeStruct(year, this.inMonth);
        switch (this.onType) {
            case 0 /* DayNum */:
                {
                    tm.day = this.onDay;
                }
                break;
            case 2 /* GreqX */:
                {
                    tm.day = basics.weekDayOnOrAfter(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case 3 /* LeqX */:
                {
                    tm.day = basics.weekDayOnOrBefore(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case 1 /* LastX */:
                {
                    tm.day = basics.lastWeekDayOfMonth(year, this.inMonth, this.onWeekDay);
                }
                break;
        }
        // calculate time
        tm.hour = this.atHour;
        tm.minute = this.atMinute;
        tm.second = this.atSecond;
        return tm;
    };
    /**
     * Returns the transition moment in UTC in the given year
     *
     * @param year	The year for which to return the transition
     * @param standardOffset	The standard offset for the timezone without DST
     * @param prevRule	The previous rule
     */
    RuleInfo.prototype.transitionTimeUtc = function (year, standardOffset, prevRule) {
        assert(this.applicable(year), "Rule not applicable in given year");
        var unixMillis = this.effectiveDate(year).toUnixNoLeapSecs();
        // adjust for given offset
        var offset;
        switch (this.atType) {
            case 2 /* Utc */:
                offset = Duration.hours(0);
                break;
            case 0 /* Standard */:
                offset = standardOffset;
                break;
            case 1 /* Wall */:
                if (prevRule) {
                    offset = standardOffset.add(prevRule.save);
                }
                else {
                    offset = standardOffset;
                }
                break;
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    throw new Error("unknown AtType");
                }
        }
        return unixMillis - offset.milliseconds();
    };
    return RuleInfo;
})();
exports.RuleInfo = RuleInfo;
/**
 * Type of reference from zone to rule
 */
(function (RuleType) {
    /**
     * No rule applies
     */
    RuleType[RuleType["None"] = 0] = "None";
    /**
     * Fixed given offset
     */
    RuleType[RuleType["Offset"] = 1] = "Offset";
    /**
     * Reference to a named set of rules
     */
    RuleType[RuleType["RuleName"] = 2] = "RuleName";
})(exports.RuleType || (exports.RuleType = {}));
var RuleType = exports.RuleType;
/**
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 *
 * See http://www.cstdbill.com/tzdb/tz-how-to.html
 * First, and somewhat trivially, whereas Rules are considered to contain one or more records, a Zone is considered to
 * be a single record with zero or more continuation lines. Thus, the keyword, “Zone,” and the zone name are not repeated.
 * The last line is the one without anything in the [UNTIL] column.
 * Second, and more fundamentally, each line of a Zone represents a steady state, not a transition between states.
 * The state exists from the date and time in the previous line’s [UNTIL] column up to the date and time in the current line’s
 * [UNTIL] column. In other words, the date and time in the [UNTIL] column is the instant that separates this state from the next.
 * Where that would be ambiguous because we’re setting our clocks back, the [UNTIL] column specifies the first occurrence of the instant.
 * The state specified by the last line, the one without anything in the [UNTIL] column, continues to the present.
 * The first line typically specifies the mean solar time observed before the introduction of standard time. Since there’s no line before
 * that, it has no beginning. 8-) For some places near the International Date Line, the first two lines will show solar times differing by
 * 24 hours; this corresponds to a movement of the Date Line. For example:
 * # Zone	NAME		GMTOFF	RULES	FORMAT	[UNTIL]
 * Zone America/Juneau	 15:02:19 -	LMT	1867 Oct 18
 * 			 -8:57:41 -	LMT	...
 * When Alaska was purchased from Russia in 1867, the Date Line moved from the Alaska/Canada border to the Bering Strait; and the time in
 * Alaska was then 24 hours earlier than it had been. <aside>(6 October in the Julian calendar, which Russia was still using then for
 * religious reasons, was followed by a second instance of the same day with a different name, 18 October in the Gregorian calendar.
 * Isn’t civil time wonderful? 8-))</aside>
 * The abbreviation, “LMT,” stands for “local mean time,” which is an invention of the tz database and was probably never actually
 * used during the period. Furthermore, the value is almost certainly wrong except in the archetypal place after which the zone is named.
 * (The tz database usually doesn’t provide a separate Zone record for places where nothing significant happened after 1970.)
 */
var ZoneInfo = (function () {
    function ZoneInfo(
        /**
         * GMT offset in fractional minutes, POSITIVE to UTC (note JavaScript.Date gives offsets
         * contrary to what you might expect).  E.g. Europe/Amsterdam has +60 minutes in this field because
         * it is one hour ahead of UTC
         */
        gmtoff, 
        /**
         * The RULES column tells us whether daylight saving time is being observed:
         * A hyphen, a kind of null value, means that we have not set our clocks ahead of standard time.
         * An amount of time (usually but not necessarily “1:00” meaning one hour) means that we have set our clocks ahead by that amount.
         * Some alphabetic string means that we might have set our clocks ahead; and we need to check the rule
         * the name of which is the given alphabetic string.
         */
        ruleType, 
        /**
         * If the rule column is an offset, this is the offset
         */
        ruleOffset, 
        /**
         * If the rule column is a rule name, this is the rule name
         */
        ruleName, 
        /**
         * The FORMAT column specifies the usual abbreviation of the time zone name. It can have one of four forms:
         * the string, “zzz,” which is a kind of null value (don’t ask)
         * a single alphabetic string other than “zzz,” in which case that’s the abbreviation
         * a pair of strings separated by a slash (‘/’), in which case the first string is the abbreviation
         * for the standard time name and the second string is the abbreviation for the daylight saving time name
         * a string containing “%s,” in which case the “%s” will be replaced by the text in the appropriate Rule’s LETTER column
         */
        format, 
        /**
         * Until timestamp in unix utc millis. The zone info is valid up to
         * and excluding this timestamp.
         * Note this value can be NULL (for the first rule)
         */
        until) {
        this.gmtoff = gmtoff;
        this.ruleType = ruleType;
        this.ruleOffset = ruleOffset;
        this.ruleName = ruleName;
        this.format = format;
        this.until = until;
        if (this.ruleOffset) {
            this.ruleOffset = this.ruleOffset.convert(3 /* Hour */);
        }
    }
    return ZoneInfo;
})();
exports.ZoneInfo = ZoneInfo;
var TzMonthNames;
(function (TzMonthNames) {
    TzMonthNames[TzMonthNames["Jan"] = 1] = "Jan";
    TzMonthNames[TzMonthNames["Feb"] = 2] = "Feb";
    TzMonthNames[TzMonthNames["Mar"] = 3] = "Mar";
    TzMonthNames[TzMonthNames["Apr"] = 4] = "Apr";
    TzMonthNames[TzMonthNames["May"] = 5] = "May";
    TzMonthNames[TzMonthNames["Jun"] = 6] = "Jun";
    TzMonthNames[TzMonthNames["Jul"] = 7] = "Jul";
    TzMonthNames[TzMonthNames["Aug"] = 8] = "Aug";
    TzMonthNames[TzMonthNames["Sep"] = 9] = "Sep";
    TzMonthNames[TzMonthNames["Oct"] = 10] = "Oct";
    TzMonthNames[TzMonthNames["Nov"] = 11] = "Nov";
    TzMonthNames[TzMonthNames["Dec"] = 12] = "Dec";
})(TzMonthNames || (TzMonthNames = {}));
function monthNameToString(name) {
    for (var i = 1; i <= 12; ++i) {
        if (TzMonthNames[i] === name) {
            return i;
        }
    }
    /* istanbul ignore if */
    /* istanbul ignore next */
    if (true) {
        throw new Error("Invalid month name \"" + name + "\"");
    }
}
var TzDayNames;
(function (TzDayNames) {
    TzDayNames[TzDayNames["Sun"] = 0] = "Sun";
    TzDayNames[TzDayNames["Mon"] = 1] = "Mon";
    TzDayNames[TzDayNames["Tue"] = 2] = "Tue";
    TzDayNames[TzDayNames["Wed"] = 3] = "Wed";
    TzDayNames[TzDayNames["Thu"] = 4] = "Thu";
    TzDayNames[TzDayNames["Fri"] = 5] = "Fri";
    TzDayNames[TzDayNames["Sat"] = 6] = "Sat";
})(TzDayNames || (TzDayNames = {}));
/**
 * Returns true if the given string is a valid offset string i.e.
 * 1, -1, +1, 01, 1:00, 1:23:25.143
 */
function isValidOffsetString(s) {
    return /^(\-|\+)?([0-9]+((\:[0-9]+)?(\:[0-9]+(\.[0-9]+)?)?))$/.test(s);
}
exports.isValidOffsetString = isValidOffsetString;
/**
 * Defines a moment at which the given rule becomes valid
 */
var Transition = (function () {
    function Transition(
        /**
         * Transition time in UTC millis
         */
        at, 
        /**
         * New offset (type of offset depends on the function)
         */
        offset, 
        /**
         * New timzone abbreviation letter
         */
        letter) {
        this.at = at;
        this.offset = offset;
        this.letter = letter;
        if (this.offset) {
            this.offset = this.offset.convert(3 /* Hour */);
        }
    }
    return Transition;
})();
exports.Transition = Transition;
/**
 * Option for TzDatabase#normalizeLocal()
 */
(function (NormalizeOption) {
    /**
     * Normalize non-existing times by ADDING the DST offset
     */
    NormalizeOption[NormalizeOption["Up"] = 0] = "Up";
    /**
     * Normalize non-existing times by SUBTRACTING the DST offset
     */
    NormalizeOption[NormalizeOption["Down"] = 1] = "Down";
})(exports.NormalizeOption || (exports.NormalizeOption = {}));
var NormalizeOption = exports.NormalizeOption;
/**
 * DO NOT USE THIS CLASS DIRECTLY, USE TimeZone
 *
 * This class typescriptifies reading the TZ data
 */
var TzDatabase = (function () {
    function TzDatabase(data) {
        /**
         * Performance improvement: zone info cache
         */
        this._zoneInfoCache = {};
        /**
         * Performance improvement: rule info cache
         */
        this._ruleInfoCache = {};
        assert(!TzDatabase._instance, "You should not create an instance of the TzDatabase class yourself. Use TzDatabase.instance()");
        this._data = data;
        this._minmax = validateData(data);
    }
    /**
     * Single instance of this database
     */
    TzDatabase.instance = function () {
        if (!TzDatabase._instance) {
            TzDatabase._instance = new TzDatabase(data);
        }
        return TzDatabase._instance;
    };
    /**
     * Inject test timezone data for unittests
     */
    TzDatabase.inject = function (data) {
        TzDatabase._instance = null; // circumvent constructor check on duplicate instances
        TzDatabase._instance = new TzDatabase(data);
    };
    TzDatabase.prototype.exists = function (zoneName) {
        return this._data.zones.hasOwnProperty(zoneName);
    };
    /**
     * Minimum non-zero DST offset (which excludes standard offset) of all rules in the database.
     * Note that DST offsets need not be whole hours.
     *
     * Does return zero if a zoneName is given and there is no DST at all for the zone.
     *
     * @param zoneName	(optional) if given, the result for the given zone is returned
     */
    TzDatabase.prototype.minDstSave = function (zoneName) {
        var _this = this;
        if (zoneName) {
            var zoneInfos = this.getZoneInfos(zoneName);
            var result = null;
            var ruleNames = [];
            zoneInfos.forEach(function (zoneInfo) {
                if (zoneInfo.ruleType === 1 /* Offset */) {
                    if (!result || result.greaterThan(zoneInfo.ruleOffset)) {
                        if (zoneInfo.ruleOffset.milliseconds() !== 0) {
                            result = zoneInfo.ruleOffset;
                        }
                    }
                }
                if (zoneInfo.ruleType === 2 /* RuleName */ && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = _this.getRuleInfos(zoneInfo.ruleName);
                    temp.forEach(function (ruleInfo) {
                        if (!result || result.greaterThan(ruleInfo.save)) {
                            if (ruleInfo.save.milliseconds() !== 0) {
                                result = ruleInfo.save;
                            }
                        }
                    });
                }
            });
            if (!result) {
                result = Duration.hours(0);
            }
            return result.clone();
        }
        else {
            return Duration.minutes(this._minmax.minDstSave);
        }
    };
    /**
     * Maximum DST offset (which excludes standard offset) of all rules in the database.
     * Note that DST offsets need not be whole hours.
     *
     * Returns 0 if zoneName given and no DST observed.
     *
     * @param zoneName	(optional) if given, the result for the given zone is returned
     */
    TzDatabase.prototype.maxDstSave = function (zoneName) {
        var _this = this;
        if (zoneName) {
            var zoneInfos = this.getZoneInfos(zoneName);
            var result = null;
            var ruleNames = [];
            zoneInfos.forEach(function (zoneInfo) {
                if (zoneInfo.ruleType === 1 /* Offset */) {
                    if (!result || result.lessThan(zoneInfo.ruleOffset)) {
                        result = zoneInfo.ruleOffset;
                    }
                }
                if (zoneInfo.ruleType === 2 /* RuleName */ && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
                    ruleNames.push(zoneInfo.ruleName);
                    var temp = _this.getRuleInfos(zoneInfo.ruleName);
                    temp.forEach(function (ruleInfo) {
                        if (!result || result.lessThan(ruleInfo.save)) {
                            result = ruleInfo.save;
                        }
                    });
                }
            });
            if (!result) {
                result = Duration.hours(0);
            }
            return result.clone();
        }
        else {
            return Duration.minutes(this._minmax.maxDstSave);
        }
    };
    /**
     * Checks whether the zone has DST at all
     */
    TzDatabase.prototype.hasDst = function (zoneName) {
        return (this.maxDstSave(zoneName).milliseconds() !== 0);
    };
    /**
     * Returns true iff the given zone name eventually links to
     * "Etc/UTC", "Etc/GMT" or "Etc/UCT" in the TZ database. This is true e.g. for
     * "UTC", "GMT", "Etc/GMT" etc.
     *
     * @param zoneName	IANA time zone name.
     */
    TzDatabase.prototype.zoneIsUtc = function (zoneName) {
        var actualZoneName = zoneName;
        var zoneEntries = this._data.zones[zoneName];
        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \"" + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        return (actualZoneName === "Etc/UTC" || actualZoneName === "Etc/GMT" || actualZoneName === "Etc/UCT");
    };
    TzDatabase.prototype.normalizeLocal = function (zoneName, a, opt) {
        if (opt === void 0) { opt = 0 /* Up */; }
        assert(typeof (a) === "number" || typeof (a) === "object", "number or object expected");
        assert(typeof (a) !== "object" || a, "a is null");
        if (this.hasDst(zoneName)) {
            var unixMillis = 0;
            var tm = null;
            if (typeof a === "object") {
                unixMillis = (a).toUnixNoLeapSecs();
                tm = (a);
            }
            else {
                unixMillis = a;
                tm = basics.unixToTimeNoLeapSecs(unixMillis);
            }
            // local times behave like this during DST changes:
            // forward change (1h):   0 1 3 4 5
            // forward change (2h):   0 1 4 5 6
            // backward change (1h):  1 2 2 3 4
            // backward change (2h):  1 2 1 2 3
            // Therefore, binary searching is not possible.
            // Instead, we should check the DST forward transitions within a window around the local time
            // get all transitions (note this includes fake transition rules for zone offset changes)
            var transitions = this.getTransitionsTotalOffsets(zoneName, tm.year - 1, tm.year + 1);
            // find the DST forward transitions
            var prev = Duration.hours(0);
            for (var i = 0; i < transitions.length; ++i) {
                var transition = transitions[i];
                // forward transition?
                if (transition.offset.greaterThan(prev)) {
                    var localBefore = transition.at + prev.milliseconds();
                    var localAfter = transition.at + transition.offset.milliseconds();
                    if (unixMillis >= localBefore && unixMillis < localAfter) {
                        var forwardChange = transition.offset.sub(prev);
                        // non-existing time
                        var factor = (opt === 0 /* Up */ ? 1 : -1);
                        if (typeof a === "object") {
                            return basics.unixToTimeNoLeapSecs(unixMillis + factor * forwardChange.milliseconds());
                        }
                        else {
                            return unixMillis + factor * forwardChange.milliseconds();
                        }
                    }
                }
                prev = transition.offset;
            }
            ;
            // no non-existing time
            return a;
        }
        else {
            return a;
        }
    };
    /**
     * Returns the standard time zone offset from UTC, without DST.
     * Throws if info not found.
     * @param zoneName	IANA time zone name
     * @param utcMillis	Timestamp in UTC
     */
    TzDatabase.prototype.standardOffset = function (zoneName, utcMillis) {
        var zoneInfo = this.getZoneInfo(zoneName, utcMillis);
        return zoneInfo.gmtoff.clone();
    };
    /**
     * Returns the total time zone offset from UTC, including DST, at
     * the given UTC timestamp.
     * Throws if zone info not found.
     *
     * @param zoneName	IANA time zone name
     * @param utcMillis	Timestamp in UTC
     */
    TzDatabase.prototype.totalOffset = function (zoneName, utcMillis) {
        var zoneInfo = this.getZoneInfo(zoneName, utcMillis);
        var dstOffset = null;
        switch (zoneInfo.ruleType) {
            case 0 /* None */:
                {
                    dstOffset = Duration.minutes(0);
                }
                break;
            case 1 /* Offset */:
                {
                    dstOffset = zoneInfo.ruleOffset;
                }
                break;
            case 2 /* RuleName */: {
                dstOffset = this.dstOffsetForRule(zoneInfo.ruleName, utcMillis, zoneInfo.gmtoff);
            }
        }
        return dstOffset.add(zoneInfo.gmtoff);
    };
    /**
     * The time zone rule abbreviation, e.g. CEST for Central European Summer Time.
     * Note this is dependent on the time, because with time different rules are in effect
     * and therefore different abbreviations. They also change with DST: e.g. CEST or CET.
     *
     * @param zoneName	IANA zone name
     * @param utcMillis	Timestamp in UTC unix milliseconds
     * @param dstDependent (default true) set to false for a DST-agnostic abbreviation
     * @return	The abbreviation of the rule that is in effect
     */
    TzDatabase.prototype.abbreviation = function (zoneName, utcMillis, dstDependent) {
        if (dstDependent === void 0) { dstDependent = true; }
        var zoneInfo = this.getZoneInfo(zoneName, utcMillis);
        var format = zoneInfo.format;
        // is format dependent on DST?
        if (format.indexOf("%s") !== -1 && zoneInfo.ruleType === 2 /* RuleName */) {
            var letter;
            // place in format string
            if (dstDependent) {
                letter = this.letterForRule(zoneInfo.ruleName, utcMillis, zoneInfo.gmtoff);
            }
            else {
                letter = "";
            }
            return util.format(format, letter);
        }
        return format;
    };
    /**
     * Returns the standard time zone offset from UTC, excluding DST, at
     * the given LOCAL timestamp, again excluding DST.
     *
     * If the local timestamp exists twice (as can occur very rarely due to zone changes)
     * then the first occurrence is returned.
     *
     * Throws if zone info not found.
     *
     * @param zoneName	IANA time zone name
     * @param localMillis	Timestamp in time zone time
     */
    TzDatabase.prototype.standardOffsetLocal = function (zoneName, localMillis) {
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            if (zoneInfo.until === null || zoneInfo.until + zoneInfo.gmtoff.milliseconds() > localMillis) {
                return zoneInfo.gmtoff.clone();
            }
        }
        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            throw new Error("No zone info found");
        }
    };
    /**
     * Returns the total time zone offset from UTC, including DST, at
     * the given LOCAL timestamp. Non-existing local time is normalized out.
     * There can be multiple UTC times and therefore multiple offsets for a local time
     * namely during a backward DST change. This returns the FIRST such offset.
     * Throws if zone info not found.
     *
     * @param zoneName	IANA time zone name
     * @param localMillis	Timestamp in time zone time
     */
    TzDatabase.prototype.totalOffsetLocal = function (zoneName, localMillis) {
        var normalized = this.normalizeLocal(zoneName, localMillis);
        var normalizedTm = basics.unixToTimeNoLeapSecs(normalized);
        /// Note: during offset changes, local time can behave like:
        // forward change (1h):   0 1 3 4 5
        // forward change (2h):   0 1 4 5 6
        // backward change (1h):  1 2 2 3 4
        // backward change (2h):  1 2 1 2 3  <-- note time going BACKWARD
        // Therefore binary search does not apply. Linear search through transitions
        // and return the first offset that matches
        var transitions = this.getTransitionsTotalOffsets(zoneName, normalizedTm.year - 1, normalizedTm.year + 1);
        var prev = null;
        var prevPrev = null;
        for (var i = 0; i < transitions.length; ++i) {
            var transition = transitions[i];
            if (transition.at + transition.offset.milliseconds() > normalized) {
                break;
            }
            prevPrev = prev;
            prev = transition;
        }
        /* istanbul ignore else */
        if (prev) {
            // special care during backward change: take first occurrence of local time
            if (prevPrev && prevPrev.offset.greaterThan(prev.offset)) {
                // backward change
                var diff = prevPrev.offset.sub(prev.offset);
                if (normalized >= prev.at + prev.offset.milliseconds() && normalized < prev.at + prev.offset.milliseconds() + diff.milliseconds()) {
                    // within duplicate range
                    return prevPrev.offset.clone();
                }
                else {
                    return prev.offset.clone();
                }
            }
            else {
                return prev.offset.clone();
            }
        }
        else {
            // this cannot happen as the transitions array is guaranteed to contain a transition at the
            // beginning of the requested fromYear
            return Duration.hours(0);
        }
    };
    /**
     * Returns the DST offset (WITHOUT the standard zone offset) for the given
     * ruleset and the given UTC timestamp
     *
     * @param ruleName	name of ruleset
     * @param utcMillis	UTC timestamp
     * @param standardOffset	Standard offset without DST for the time zone
     */
    TzDatabase.prototype.dstOffsetForRule = function (ruleName, utcMillis, standardOffset) {
        var tm = basics.unixToTimeNoLeapSecs(utcMillis);
        // find applicable transition moments
        var transitions = this.getTransitionsDstOffsets(ruleName, tm.year - 1, tm.year, standardOffset);
        // find the last prior to given date
        var offset = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= utcMillis) {
                offset = transition.offset.clone();
                break;
            }
        }
        /* istanbul ignore if */
        if (!offset) {
            throw new Error("No offset found.");
        }
        return offset;
    };
    /**
     * Returns the time zone letter for the given
     * ruleset and the given UTC timestamp
     *
     * @param ruleName	name of ruleset
     * @param utcMillis	UTC timestamp
     * @param standardOffset	Standard offset without DST for the time zone
     */
    TzDatabase.prototype.letterForRule = function (ruleName, utcMillis, standardOffset) {
        var tm = basics.unixToTimeNoLeapSecs(utcMillis);
        // find applicable transition moments
        var transitions = this.getTransitionsDstOffsets(ruleName, tm.year - 1, tm.year, standardOffset);
        // find the last prior to given date
        var letter = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= utcMillis) {
                letter = transition.letter;
                break;
            }
        }
        /* istanbul ignore if */
        if (letter === null) {
            throw new Error("No offset found.");
        }
        return letter;
    };
    /**
     * Return a list of all transitions in [fromYear..toYear] sorted by effective date
     *
     * @param ruleName	Name of the rule set
     * @param fromYear	first year to return transitions for
     * @param toYear	Last year to return transitions for
     * @param standardOffset	Standard offset without DST for the time zone
     *
     * @return Transitions, with DST offsets (no standard offset included)
     */
    TzDatabase.prototype.getTransitionsDstOffsets = function (ruleName, fromYear, toYear, standardOffset) {
        assert(fromYear <= toYear, "fromYear must be <= toYear");
        var ruleInfos = this.getRuleInfos(ruleName);
        var result = [];
        for (var y = fromYear; y <= toYear; y++) {
            var prevInfo = null;
            for (var i = 0; i < ruleInfos.length; i++) {
                var ruleInfo = ruleInfos[i];
                if (ruleInfo.applicable(y)) {
                    result.push(new Transition(ruleInfo.transitionTimeUtc(y, standardOffset, prevInfo), ruleInfo.save, ruleInfo.letter));
                }
                prevInfo = ruleInfo;
            }
        }
        result.sort(function (a, b) {
            return a.at - b.at;
        });
        return result;
    };
    /**
     * Return both zone and rule changes as total (std + dst) offsets.
     * Adds an initial transition if there is no zone change within the range.
     *
     * @param zoneName	IANA zone name
     * @param fromYear	First year to include
     * @param toYear	Last year to include
     */
    TzDatabase.prototype.getTransitionsTotalOffsets = function (zoneName, fromYear, toYear) {
        assert(fromYear <= toYear, "fromYear must be <= toYear");
        var startMillis = basics.timeToUnixNoLeapSecs(fromYear);
        var endMillis = basics.timeToUnixNoLeapSecs(toYear + 1);
        var zoneInfos = this.getZoneInfos(zoneName);
        assert(zoneInfos.length > 0, "Empty zoneInfos array returned from getZoneInfos()");
        var result = [];
        var prevZone = null;
        var prevUntilTm = null;
        var prevStdOffset = Duration.hours(0);
        var prevDstOffset = Duration.hours(0);
        var prevLetter = "";
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            var untilTm = (zoneInfo.until ? basics.unixToTimeNoLeapSecs(zoneInfo.until) : new TimeStruct(toYear + 1));
            var stdOffset = prevStdOffset;
            var dstOffset = prevDstOffset;
            var letter = prevLetter;
            // zone applicable?
            if ((prevZone === null || prevZone.until < endMillis - 1) && (zoneInfo.until === null || zoneInfo.until >= startMillis)) {
                stdOffset = zoneInfo.gmtoff;
                switch (zoneInfo.ruleType) {
                    case 0 /* None */:
                        dstOffset = Duration.hours(0);
                        letter = "";
                        break;
                    case 1 /* Offset */:
                        dstOffset = zoneInfo.ruleOffset;
                        letter = "";
                        break;
                    case 2 /* RuleName */:
                        // check whether the first rule takes effect immediately on the zone transition
                        // (e.g. Lybia)
                        if (prevZone) {
                            var ruleInfos = this.getRuleInfos(zoneInfo.ruleName);
                            ruleInfos.forEach(function (ruleInfo) {
                                if (ruleInfo.applicable(prevUntilTm.year)) {
                                    if (ruleInfo.transitionTimeUtc(prevUntilTm.year, stdOffset, null) === prevZone.until) {
                                        dstOffset = ruleInfo.save;
                                        letter = ruleInfo.letter;
                                    }
                                }
                            });
                        }
                        break;
                }
                // add a transition for the zone transition
                var at = (prevZone ? prevZone.until : startMillis);
                result.push(new Transition(at, stdOffset.add(dstOffset), letter));
                // add transitions for the zone rules in the range
                if (zoneInfo.ruleType === 2 /* RuleName */) {
                    var dstTransitions = this.getTransitionsDstOffsets(zoneInfo.ruleName, prevUntilTm ? Math.max(prevUntilTm.year, fromYear) : fromYear, Math.min(untilTm.year, toYear), stdOffset);
                    dstTransitions.forEach(function (transition) {
                        letter = transition.letter;
                        dstOffset = transition.offset;
                        result.push(new Transition(transition.at, transition.offset.add(stdOffset), transition.letter));
                    });
                }
            }
            prevZone = zoneInfo;
            prevUntilTm = untilTm;
            prevStdOffset = stdOffset;
            prevDstOffset = dstOffset;
            prevLetter = letter;
        }
        result.sort(function (a, b) {
            return a.at - b.at;
        });
        return result;
    };
    /**
     * Get the zone info for the given UTC timestamp. Throws if not found.
     * @param zoneName	IANA time zone name
     * @param utcMillis	UTC time stamp
     * @returns	ZoneInfo object. Do not change, we cache this object.
     */
    TzDatabase.prototype.getZoneInfo = function (zoneName, utcMillis) {
        var zoneInfos = this.getZoneInfos(zoneName);
        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            if (zoneInfo.until === null || zoneInfo.until > utcMillis) {
                return zoneInfo;
            }
        }
        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            throw new Error("No zone info found");
        }
    };
    /**
     * Return the zone records for a given zone name, after
     * following any links.
     *
     * @param zoneName	IANA zone name like "Pacific/Efate"
     * @return Array of zone infos. Do not change, this is a cached value.
     */
    TzDatabase.prototype.getZoneInfos = function (zoneName) {
        // FIRST validate zone name before searching cache
        /* istanbul ignore if */
        if (!this._data.zones.hasOwnProperty(zoneName)) {
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Zone \"" + zoneName + "\" not found.");
            }
        }
        // Take from cache
        if (this._zoneInfoCache.hasOwnProperty(zoneName)) {
            return this._zoneInfoCache[zoneName];
        }
        var result = [];
        var actualZoneName = zoneName;
        var zoneEntries = this._data.zones[zoneName];
        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \"" + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        for (var i = 0; i < zoneEntries.length; ++i) {
            var zoneEntry = zoneEntries[i];
            var ruleType = this.parseRuleType(zoneEntry[1]);
            var until = math.filterFloat(zoneEntry[3]);
            if (isNaN(until)) {
                until = null;
            }
            result.push(new ZoneInfo(Duration.minutes(-1 * math.filterFloat(zoneEntry[0])), ruleType, ruleType === 1 /* Offset */ ? new Duration(zoneEntry[1]) : new Duration(), ruleType === 2 /* RuleName */ ? zoneEntry[1] : "", zoneEntry[2], until));
        }
        result.sort(function (a, b) {
            // sort null last
            /* istanbul ignore if */
            if (a.until === null && b.until === null) {
                return 0;
            }
            if (a.until !== null && b.until === null) {
                return -1;
            }
            if (a.until === null && b.until !== null) {
                return 1;
            }
            return (a.until - b.until);
        });
        this._zoneInfoCache[zoneName] = result;
        return result;
    };
    /**
     * Returns the rule set with the given rule name,
     * sorted by first effective date (uncompensated for "w" or "s" AtTime)
     *
     * @param ruleName	Name of rule set
     * @return RuleInfo array. Do not change, this is a cached value.
     */
    TzDatabase.prototype.getRuleInfos = function (ruleName) {
        // validate name BEFORE searching cache
        if (!this._data.rules.hasOwnProperty(ruleName)) {
            throw new Error("Rule set \"" + ruleName + "\" not found.");
        }
        // return from cache
        if (this._ruleInfoCache.hasOwnProperty(ruleName)) {
            return this._ruleInfoCache[ruleName];
        }
        var result = [];
        var ruleSet = this._data.rules[ruleName];
        for (var i = 0; i < ruleSet.length; ++i) {
            var rule = ruleSet[i];
            var fromYear = (rule[0] === "NaN" ? -10000 : parseInt(rule[0], 10));
            var toType = this.parseToType(rule[1]);
            var toYear = (toType === 1 /* Max */ ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
            var onType = this.parseOnType(rule[4]);
            var onDay = this.parseOnDay(rule[4], onType);
            var onWeekDay = this.parseOnWeekDay(rule[4]);
            var monthName = rule[3];
            var monthNumber = monthNameToString(monthName);
            result.push(new RuleInfo(fromYear, toType, toYear, rule[2], monthNumber, onType, onDay, onWeekDay, math.positiveModulo(parseInt(rule[5][0], 10), 24), math.positiveModulo(parseInt(rule[5][1], 10), 60), math.positiveModulo(parseInt(rule[5][2], 10), 60), this.parseAtType(rule[5][3]), Duration.minutes(parseInt(rule[6], 10)), rule[7] === "-" ? "" : rule[7]));
        }
        result.sort(function (a, b) {
            /* istanbul ignore if */
            if (a.effectiveEqual(b)) {
                return 0;
            }
            else if (a.effectiveLess(b)) {
                return -1;
            }
            else {
                return 1;
            }
        });
        this._ruleInfoCache[ruleName] = result;
        return result;
    };
    /**
     * Parse the RULES column of a zone info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseRuleType = function (rule) {
        if (rule === "-") {
            return 0 /* None */;
        }
        else if (isValidOffsetString(rule)) {
            return 1 /* Offset */;
        }
        else {
            return 2 /* RuleName */;
        }
    };
    /**
     * Parse the TO column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseToType = function (to) {
        if (to === "max") {
            return 1 /* Max */;
        }
        else if (to === "only") {
            return 0 /* Year */; // yes we return Year for only
        }
        else if (!isNaN(parseInt(to, 10))) {
            return 0 /* Year */;
        }
        else {
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("TO column incorrect: " + to);
            }
        }
    };
    /**
     * Parse the ON column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseOnType = function (on) {
        if (on.length > 4 && on.substr(0, 4) === "last") {
            return 1 /* LastX */;
        }
        if (on.indexOf("<=") !== -1) {
            return 3 /* LeqX */;
        }
        if (on.indexOf(">=") !== -1) {
            return 2 /* GreqX */;
        }
        return 0 /* DayNum */;
    };
    /**
     * Get the day number from an ON column string, 0 if no day.
     */
    TzDatabase.prototype.parseOnDay = function (on, onType) {
        switch (onType) {
            case 0 /* DayNum */: return parseInt(on, 10);
            case 3 /* LeqX */: return parseInt(on.substr(on.indexOf("<=") + 2), 10);
            case 2 /* GreqX */: return parseInt(on.substr(on.indexOf(">=") + 2), 10);
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return 0;
                }
        }
    };
    /**
     * Get the day-of-week from an ON column string, Sunday if not present.
     */
    TzDatabase.prototype.parseOnWeekDay = function (on) {
        for (var i = 0; i < 7; i++) {
            if (on.indexOf(TzDayNames[i]) !== -1) {
                return i;
            }
        }
        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            return 0 /* Sunday */;
        }
    };
    /**
     * Parse the AT column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseAtType = function (at) {
        switch (at) {
            case "s": return 0 /* Standard */;
            case "u": return 2 /* Utc */;
            case "g": return 2 /* Utc */;
            case "z": return 2 /* Utc */;
            case "w": return 1 /* Wall */;
            case "": return 1 /* Wall */;
            case null: return 1 /* Wall */;
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return 1 /* Wall */;
                }
        }
    };
    /**
     * Single instance member
     */
    TzDatabase._instance = null;
    return TzDatabase;
})();
exports.TzDatabase = TzDatabase;
/**
 * Sanity check on data. Returns min/max values.
 */
function validateData(data) {
    var i;
    var result = {
        minDstSave: null,
        maxDstSave: null,
        minGmtOff: null,
        maxGmtOff: null
    };
    /* istanbul ignore if */
    if (typeof (data) !== "object") {
        throw new Error("data is not an object");
    }
    /* istanbul ignore if */
    if (!data.hasOwnProperty("rules")) {
        throw new Error("data has no rules property");
    }
    /* istanbul ignore if */
    if (!data.hasOwnProperty("zones")) {
        throw new Error("data has no zones property");
    }
    for (var zoneName in data.zones) {
        if (data.zones.hasOwnProperty(zoneName)) {
            var zoneArr = data.zones[zoneName];
            if (typeof (zoneArr) === "string") {
                // ok, is link to other zone, check link
                /* istanbul ignore if */
                if (!data.zones.hasOwnProperty(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" links to \"" + zoneArr + "\" but that doesn\'t exist");
                }
            }
            else {
                /* istanbul ignore if */
                if (!Array.isArray(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" is neither a string nor an array");
                }
                for (i = 0; i < zoneArr.length; i++) {
                    var entry = zoneArr[i];
                    /* istanbul ignore if */
                    if (!Array.isArray(entry)) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
                    }
                    /* istanbul ignore if */
                    if (entry.length !== 4) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[0] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
                    }
                    var gmtoff = math.filterFloat(entry[0]);
                    /* istanbul ignore if */
                    if (isNaN(gmtoff)) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[1] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[2] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[3] !== "string" && entry[3] !== null) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null");
                    }
                    /* istanbul ignore if */
                    if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number");
                    }
                    if (result.maxGmtOff === null || gmtoff > result.maxGmtOff) {
                        result.maxGmtOff = gmtoff;
                    }
                    if (result.minGmtOff === null || gmtoff < result.minGmtOff) {
                        result.minGmtOff = gmtoff;
                    }
                }
            }
        }
    }
    for (var ruleName in data.rules) {
        if (data.rules.hasOwnProperty(ruleName)) {
            var ruleArr = data.rules[ruleName];
            /* istanbul ignore if */
            if (!Array.isArray(ruleArr)) {
                throw new Error("Entry for rule \"" + ruleName + "\" is not an array");
            }
            for (i = 0; i < ruleArr.length; i++) {
                var rule = ruleArr[i];
                /* istanbul ignore if */
                if (!Array.isArray(rule)) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
                }
                /* istanbul ignore if */
                if (rule.length < 8) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
                }
                for (var j = 0; j < rule.length; j++) {
                    /* istanbul ignore if */
                    if (j !== 5 && typeof rule[j] !== "string") {
                        throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
                    }
                }
                /* istanbul ignore if */
                if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
                }
                /* istanbul ignore if */
                if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
                }
                /* istanbul ignore if */
                if (!TzMonthNames.hasOwnProperty(rule[3])) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
                }
                /* istanbul ignore if */
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1 && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
                }
                /* istanbul ignore if */
                if (!Array.isArray(rule[5])) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
                }
                /* istanbul ignore if */
                if (rule[5].length !== 4) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][0], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][1], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
                }
                /* istanbul ignore if */
                if (isNaN(parseInt(rule[5][2], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
                }
                /* istanbul ignore if */
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w" && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
                }
                var save = parseInt(rule[6], 10);
                /* istanbul ignore if */
                if (isNaN(save)) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
                }
                if (save !== 0) {
                    if (result.maxDstSave === null || save > result.maxDstSave) {
                        result.maxDstSave = save;
                    }
                    if (result.minDstSave === null || save < result.minDstSave) {
                        result.minDstSave = save;
                    }
                }
            }
        }
    }
    return result;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInR6LWRhdGFiYXNlLnRzIl0sIm5hbWVzIjpbIlRvVHlwZSIsIk9uVHlwZSIsIkF0VHlwZSIsIlJ1bGVJbmZvIiwiUnVsZUluZm8uY29uc3RydWN0b3IiLCJSdWxlSW5mby5hcHBsaWNhYmxlIiwiUnVsZUluZm8uZWZmZWN0aXZlTGVzcyIsIlJ1bGVJbmZvLmVmZmVjdGl2ZUVxdWFsIiwiUnVsZUluZm8uZWZmZWN0aXZlRGF0ZSIsIlJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjIiwiUnVsZVR5cGUiLCJab25lSW5mbyIsIlpvbmVJbmZvLmNvbnN0cnVjdG9yIiwiVHpNb250aE5hbWVzIiwibW9udGhOYW1lVG9TdHJpbmciLCJUekRheU5hbWVzIiwiaXNWYWxpZE9mZnNldFN0cmluZyIsIlRyYW5zaXRpb24iLCJUcmFuc2l0aW9uLmNvbnN0cnVjdG9yIiwiTm9ybWFsaXplT3B0aW9uIiwiVHpEYXRhYmFzZSIsIlR6RGF0YWJhc2UuY29uc3RydWN0b3IiLCJUekRhdGFiYXNlLmluc3RhbmNlIiwiVHpEYXRhYmFzZS5pbmplY3QiLCJUekRhdGFiYXNlLmV4aXN0cyIsIlR6RGF0YWJhc2UubWluRHN0U2F2ZSIsIlR6RGF0YWJhc2UubWF4RHN0U2F2ZSIsIlR6RGF0YWJhc2UuaGFzRHN0IiwiVHpEYXRhYmFzZS56b25lSXNVdGMiLCJUekRhdGFiYXNlLm5vcm1hbGl6ZUxvY2FsIiwiVHpEYXRhYmFzZS5zdGFuZGFyZE9mZnNldCIsIlR6RGF0YWJhc2UudG90YWxPZmZzZXQiLCJUekRhdGFiYXNlLmFiYnJldmlhdGlvbiIsIlR6RGF0YWJhc2Uuc3RhbmRhcmRPZmZzZXRMb2NhbCIsIlR6RGF0YWJhc2UudG90YWxPZmZzZXRMb2NhbCIsIlR6RGF0YWJhc2UuZHN0T2Zmc2V0Rm9yUnVsZSIsIlR6RGF0YWJhc2UubGV0dGVyRm9yUnVsZSIsIlR6RGF0YWJhc2UuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzIiwiVHpEYXRhYmFzZS5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyIsIlR6RGF0YWJhc2UuZ2V0Wm9uZUluZm8iLCJUekRhdGFiYXNlLmdldFpvbmVJbmZvcyIsIlR6RGF0YWJhc2UuZ2V0UnVsZUluZm9zIiwiVHpEYXRhYmFzZS5wYXJzZVJ1bGVUeXBlIiwiVHpEYXRhYmFzZS5wYXJzZVRvVHlwZSIsIlR6RGF0YWJhc2UucGFyc2VPblR5cGUiLCJUekRhdGFiYXNlLnBhcnNlT25EYXkiLCJUekRhdGFiYXNlLnBhcnNlT25XZWVrRGF5IiwiVHpEYXRhYmFzZS5wYXJzZUF0VHlwZSIsInZhbGlkYXRlRGF0YSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsQUFFQSwyQ0FGMkM7QUFFM0MsWUFBWSxDQUFDO0FBRWIsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFDbEMsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFFOUIsSUFBTyxNQUFNLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDcEMsSUFBTyxRQUFRLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFDeEMsSUFBTyxJQUFJLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFFaEMsQUFDQSxvQkFEb0I7SUFDaEIsSUFBSSxHQUFRLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2hELEFBRUEsbUJBRm1CO0FBRW5CLElBQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDcEMsSUFBTyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUN0QyxJQUFPLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBR2hDLEFBR0E7O0dBREc7QUFDSCxXQUFZLE1BQU07SUFDakJBOztPQUVHQTtJQUNIQSxtQ0FBSUE7SUFDSkE7O09BRUdBO0lBQ0hBLGlDQUFHQTtBQUNKQSxDQUFDQSxFQVRXLGNBQU0sS0FBTixjQUFNLFFBU2pCO0FBVEQsSUFBWSxNQUFNLEdBQU4sY0FTWCxDQUFBO0FBRUQsQUFHQTs7R0FERztBQUNILFdBQVksTUFBTTtJQUNqQkM7O09BRUdBO0lBQ0hBLHVD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QkEsQ0FBQ0EsQ0FBQ0E7UUFDakVBLENBQUNBO0lBQ0ZBLENBQUNBO0lBQ0ZELGVBQUNBO0FBQURBLENBbERBLEFBa0RDQSxJQUFBO0FBbERZLGdCQUFRLEdBQVIsUUFrRFosQ0FBQTtBQUdELElBQUssWUFhSjtBQWJELFdBQUssWUFBWTtJQUNoQkUsbUNBQU1BLENBQUNBLFNBQUFBO0lBQ1BBLG1DQUFNQSxDQUFDQSxTQUFBQTtJQUNQQSxtQ0FBTUEsQ0FBQ0EsU0FBQUE7SUFDUEEsbUNBQU1BLENBQUNBLFNBQUFBO0lBQ1BBLG1DQUFNQSxDQUFDQSxTQUFBQTtJQUNQQSxtQ0FBTUEsQ0FBQ0EsU0FBQUE7SUFDUEEsbUNBQU1BLENBQUNBLFNBQUFBO0lBQ1BBLG1DQUFNQSxDQUFDQSxTQUFBQTtJQUNQQSxtQ0FBTUEsQ0FBQ0EsU0FBQUE7SUFDUEEsbUNBQU1BLEVBQUVBLFNBQUFBO0lBQ1JBLG1DQUFNQSxFQUFFQSxTQUFBQTtJQUNSQSxtQ0FBTUEsRUFBRUEsU0FBQUE7QUFDVEEsQ0FBQ0EsRUFiSSxZQUFZLEtBQVosWUFBWSxRQWFoQjtBQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBWTtJQUN0Q0MsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQzlCQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNWQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUNEQSxBQUVBQSx3QkFGd0JBO0lBQ3hCQSwwQkFBMEJBO0lBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNWQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSx1QkFBdUJBLEdBQUdBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLENBQUNB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LElBQUlBLElBQUlBLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBRXRCQSxJQUFJQSxRQUFRQSxHQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxHQUFHQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1RUEsSUFBSUEsTUFBTUEsR0FBV0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLElBQUlBLE1BQU1BLEdBQVdBLENBQUNBLE1BQU1BLEtBQUtBLFdBQVVBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLE1BQU1BLEdBQUdBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNHQSxJQUFJQSxNQUFNQSxHQUFXQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQ0EsSUFBSUEsS0FBS0EsR0FBV0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFDckRBLElBQUlBLFNBQVNBLEdBQVlBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxTQUFTQSxHQUFtQkEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeENBLElBQUlBLFdBQVdBLEdBQVdBLGlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFFdkRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFFBQVFBLENBQ3ZCQSxRQUFRQSxFQUNSQSxNQUFNQSxFQUNOQSxNQUFNQSxFQUNOQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUNQQSxXQUFXQSxFQUNYQSxNQUFNQSxFQUNOQSxLQUFLQSxFQUNMQSxTQUFTQSxFQUNUQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUNqREEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFDakRBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQ2pEQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUM1QkEsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFDdkNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLEdBQUdBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQzdCQSxDQUFDQSxDQUFDQTtRQUVMQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxDQUFXQSxFQUFFQSxDQUFXQTtZQUNwQ0EsQUFDQUEsd0JBRHdCQTtZQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0Es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QSxDQUFDQTtvQkFDckJBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLFFBQVFBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JGQSxDQUFDQTtnQkFDREEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7b0JBQ3RDQSxBQUNBQSx3QkFEd0JBO29CQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsT0FBT0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQzVDQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxRQUFRQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxtQkFBbUJBLENBQUNBLENBQUNBO29CQUMxR0EsQ0FBQ0E7Z0JBQ0ZBLENBQUNBO2dCQUNEQSxBQUNBQSx3QkFEd0JBO2dCQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsS0FBS0EsSUFBSUEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3ZEQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxRQUFRQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxH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LENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQzdEQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDM0ZBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLFFBQVFBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLDZDQUE2Q0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVHQSxDQUFDQTtnQkFDREEsSUFBSUEsSUFBSUEsR0FBV0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pDQSxBQUNBQSx3QkFEd0JBO2dCQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2pCQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxRQUFRQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxzQ0FBc0NBLENBQUNBLENBQUNBO2dCQUNyR0EsQ0FBQ0E7Z0JBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNoQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsS0FBS0EsSUFBSUEsSUFBSUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQzVEQSxNQUFNQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQTtvQkFDMUJBLENBQUNBO29CQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDNURBLE1BQU1BLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO29CQUMxQkEsQ0FBQ0E7Z0JBQ0ZBLENBQUNBO1lBQ0ZBLENBQUNBO1FBQ0ZBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0FBQ2ZBLENBQUNBIiwiZmlsZSI6ImxpYi90ei1kYXRhYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19