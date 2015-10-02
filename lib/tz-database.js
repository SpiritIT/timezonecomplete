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
            this.save = this.save.convert(basics.TimeUnit.Hour);
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
            case ToType.Max: return true;
            case ToType.Year: return (year <= this.toYear);
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
        // calculate day
        switch (this.onType) {
            case OnType.DayNum:
                {
                    tm.day = this.onDay;
                }
                break;
            case OnType.GreqX:
                {
                    tm.day = basics.weekDayOnOrAfter(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case OnType.LeqX:
                {
                    tm.day = basics.weekDayOnOrBefore(year, this.inMonth, this.onDay, this.onWeekDay);
                }
                break;
            case OnType.LastX:
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
            case AtType.Utc:
                offset = Duration.hours(0);
                break;
            case AtType.Standard:
                offset = standardOffset;
                break;
            case AtType.Wall:
                if (prevRule) {
                    offset = standardOffset.add(prevRule.save);
                }
                else {
                    offset = standardOffset;
                }
                break;
            /* istanbul ignore next */
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
            this.ruleOffset = this.ruleOffset.convert(basics.TimeUnit.Hour);
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
            this.offset = this.offset.convert(basics.TimeUnit.Hour);
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
    /**
     * Returns a sorted list of all zone names
     */
    TzDatabase.prototype.zoneNames = function () {
        if (!this._zoneNames) {
            this._zoneNames = Object.keys(this._data.zones);
            this._zoneNames.sort();
        }
        return this._zoneNames;
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
                if (zoneInfo.ruleType === RuleType.Offset) {
                    if (!result || result.greaterThan(zoneInfo.ruleOffset)) {
                        if (zoneInfo.ruleOffset.milliseconds() !== 0) {
                            result = zoneInfo.ruleOffset;
                        }
                    }
                }
                if (zoneInfo.ruleType === RuleType.RuleName
                    && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
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
                if (zoneInfo.ruleType === RuleType.Offset) {
                    if (!result || result.lessThan(zoneInfo.ruleOffset)) {
                        result = zoneInfo.ruleOffset;
                    }
                }
                if (zoneInfo.ruleType === RuleType.RuleName
                    && ruleNames.indexOf(zoneInfo.ruleName) === -1) {
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
     * First DST change moment AFTER the given UTC date in UTC milliseconds, within one year
     */
    TzDatabase.prototype.nextDstChange = function (zoneName, utcMillis) {
        var tm = basics.unixToTimeNoLeapSecs(utcMillis);
        var zoneInfo;
        var i;
        // get all zone infos for [date, date+1year)
        var allZoneInfos = this.getZoneInfos(zoneName);
        var relevantZoneInfos = [];
        var rangeStart = utcMillis;
        var rangeEnd = utcMillis + 365 * 24 * 3600 * 1000;
        var prevEnd = null;
        for (i = 0; i < allZoneInfos.length; ++i) {
            zoneInfo = allZoneInfos[i];
            if ((prevEnd === null || prevEnd < rangeEnd) && (zoneInfo.until === null || zoneInfo.until > rangeStart)) {
                relevantZoneInfos.push(zoneInfo);
            }
            prevEnd = zoneInfo.until;
        }
        // collect all transitions in the zones for the year
        var transitions = [];
        for (i = 0; i < relevantZoneInfos.length; ++i) {
            zoneInfo = relevantZoneInfos[i];
            // find applicable transition moments
            transitions = transitions.concat(this.getTransitionsDstOffsets(zoneInfo.ruleName, tm.year - 1, tm.year + 1, zoneInfo.gmtoff));
        }
        transitions.sort(function (a, b) {
            return a.at - b.at;
        });
        // find the first after the given date that has a different offset
        var prevSave = null;
        for (i = 0; i < transitions.length; ++i) {
            var transition = transitions[i];
            if (!prevSave || !prevSave.equals(transition.offset)) {
                if (transition.at > utcMillis) {
                    return transition.at;
                }
            }
            prevSave = transition.offset;
        }
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
        // follow links
        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \""
                    + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        return (actualZoneName === "Etc/UTC" || actualZoneName === "Etc/GMT" || actualZoneName === "Etc/UCT");
    };
    TzDatabase.prototype.normalizeLocal = function (zoneName, a, opt) {
        if (opt === void 0) { opt = NormalizeOption.Up; }
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
                        var factor = (opt === NormalizeOption.Up ? 1 : -1);
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
            case RuleType.None:
                {
                    dstOffset = Duration.minutes(0);
                }
                break;
            case RuleType.Offset:
                {
                    dstOffset = zoneInfo.ruleOffset;
                }
                break;
            case RuleType.RuleName: {
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
        if (format.indexOf("%s") !== -1
            && zoneInfo.ruleType === RuleType.RuleName) {
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
                // found offset: prev.offset applies
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
                if (normalized >= prev.at + prev.offset.milliseconds()
                    && normalized < prev.at + prev.offset.milliseconds() + diff.milliseconds()) {
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
            if ((prevZone === null || prevZone.until < endMillis - 1)
                && (zoneInfo.until === null || zoneInfo.until >= startMillis)) {
                stdOffset = zoneInfo.gmtoff;
                switch (zoneInfo.ruleType) {
                    case RuleType.None:
                        dstOffset = Duration.hours(0);
                        letter = "";
                        break;
                    case RuleType.Offset:
                        dstOffset = zoneInfo.ruleOffset;
                        letter = "";
                        break;
                    case RuleType.RuleName:
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
                if (zoneInfo.ruleType === RuleType.RuleName) {
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
        // follow links
        while (typeof (zoneEntries) === "string") {
            /* istanbul ignore if */
            if (!this._data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \""
                    + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = this._data.zones[actualZoneName];
        }
        // final zone info found
        for (var i = 0; i < zoneEntries.length; ++i) {
            var zoneEntry = zoneEntries[i];
            var ruleType = this.parseRuleType(zoneEntry[1]);
            var until = math.filterFloat(zoneEntry[3]);
            if (isNaN(until)) {
                until = null;
            }
            result.push(new ZoneInfo(Duration.minutes(-1 * math.filterFloat(zoneEntry[0])), ruleType, ruleType === RuleType.Offset ? new Duration(zoneEntry[1]) : new Duration(), ruleType === RuleType.RuleName ? zoneEntry[1] : "", zoneEntry[2], until));
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
            var toYear = (toType === ToType.Max ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
            var onType = this.parseOnType(rule[4]);
            var onDay = this.parseOnDay(rule[4], onType);
            var onWeekDay = this.parseOnWeekDay(rule[4]);
            var monthName = rule[3];
            var monthNumber = monthNameToString(monthName);
            result.push(new RuleInfo(fromYear, toType, toYear, rule[2], monthNumber, onType, onDay, onWeekDay, math.positiveModulo(parseInt(rule[5][0], 10), 24), // note the database sometimes contains "24" as hour value
            math.positiveModulo(parseInt(rule[5][1], 10), 60), math.positiveModulo(parseInt(rule[5][2], 10), 60), this.parseAtType(rule[5][3]), Duration.minutes(parseInt(rule[6], 10)), rule[7] === "-" ? "" : rule[7]));
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
            return RuleType.None;
        }
        else if (isValidOffsetString(rule)) {
            return RuleType.Offset;
        }
        else {
            return RuleType.RuleName;
        }
    };
    /**
     * Parse the TO column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseToType = function (to) {
        if (to === "max") {
            return ToType.Max;
        }
        else if (to === "only") {
            return ToType.Year; // yes we return Year for only
        }
        else if (!isNaN(parseInt(to, 10))) {
            return ToType.Year;
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
            return OnType.LastX;
        }
        if (on.indexOf("<=") !== -1) {
            return OnType.LeqX;
        }
        if (on.indexOf(">=") !== -1) {
            return OnType.GreqX;
        }
        return OnType.DayNum;
    };
    /**
     * Get the day number from an ON column string, 0 if no day.
     */
    TzDatabase.prototype.parseOnDay = function (on, onType) {
        switch (onType) {
            case OnType.DayNum: return parseInt(on, 10);
            case OnType.LeqX: return parseInt(on.substr(on.indexOf("<=") + 2), 10);
            case OnType.GreqX: return parseInt(on.substr(on.indexOf(">=") + 2), 10);
            /* istanbul ignore next */
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
            return WeekDay.Sunday;
        }
    };
    /**
     * Parse the AT column of a rule info entry
     * and see what kind of entry it is.
     */
    TzDatabase.prototype.parseAtType = function (at) {
        switch (at) {
            case "s": return AtType.Standard;
            case "u": return AtType.Utc;
            case "g": return AtType.Utc;
            case "z": return AtType.Utc;
            case "w": return AtType.Wall;
            case "": return AtType.Wall;
            case null: return AtType.Wall;
            default:
                /* istanbul ignore if */
                /* istanbul ignore next */
                if (true) {
                    return AtType.Wall;
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
    // validate zones
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
    // validate rules
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
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1
                    && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
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
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w"
                    && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90ei1kYXRhYmFzZS50cyJdLCJuYW1lcyI6WyJUb1R5cGUiLCJPblR5cGUiLCJBdFR5cGUiLCJSdWxlSW5mbyIsIlJ1bGVJbmZvLmNvbnN0cnVjdG9yIiwiUnVsZUluZm8uYXBwbGljYWJsZSIsIlJ1bGVJbmZvLmVmZmVjdGl2ZUxlc3MiLCJSdWxlSW5mby5lZmZlY3RpdmVFcXVhbCIsIlJ1bGVJbmZvLmVmZmVjdGl2ZURhdGUiLCJSdWxlSW5mby50cmFuc2l0aW9uVGltZVV0YyIsIlJ1bGVUeXBlIiwiWm9uZUluZm8iLCJab25lSW5mby5jb25zdHJ1Y3RvciIsIlR6TW9udGhOYW1lcyIsIm1vbnRoTmFtZVRvU3RyaW5nIiwiVHpEYXlOYW1lcyIsImlzVmFsaWRPZmZzZXRTdHJpbmciLCJUcmFuc2l0aW9uIiwiVHJhbnNpdGlvbi5jb25zdHJ1Y3RvciIsIk5vcm1hbGl6ZU9wdGlvbiIsIlR6RGF0YWJhc2UiLCJUekRhdGFiYXNlLmNvbnN0cnVjdG9yIiwiVHpEYXRhYmFzZS5pbnN0YW5jZSIsIlR6RGF0YWJhc2UuaW5qZWN0IiwiVHpEYXRhYmFzZS56b25lTmFtZXMiLCJUekRhdGFiYXNlLmV4aXN0cyIsIlR6RGF0YWJhc2UubWluRHN0U2F2ZSIsIlR6RGF0YWJhc2UubWF4RHN0U2F2ZSIsIlR6RGF0YWJhc2UuaGFzRHN0IiwiVHpEYXRhYmFzZS5uZXh0RHN0Q2hhbmdlIiwiVHpEYXRhYmFzZS56b25lSXNVdGMiLCJUekRhdGFiYXNlLm5vcm1hbGl6ZUxvY2FsIiwiVHpEYXRhYmFzZS5zdGFuZGFyZE9mZnNldCIsIlR6RGF0YWJhc2UudG90YWxPZmZzZXQiLCJUekRhdGFiYXNlLmFiYnJldmlhdGlvbiIsIlR6RGF0YWJhc2Uuc3RhbmRhcmRPZmZzZXRMb2NhbCIsIlR6RGF0YWJhc2UudG90YWxPZmZzZXRMb2NhbCIsIlR6RGF0YWJhc2UuZHN0T2Zmc2V0Rm9yUnVsZSIsIlR6RGF0YWJhc2UubGV0dGVyRm9yUnVsZSIsIlR6RGF0YWJhc2UuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzIiwiVHpEYXRhYmFzZS5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyIsIlR6RGF0YWJhc2UuZ2V0Wm9uZUluZm8iLCJUekRhdGFiYXNlLmdldFpvbmVJbmZvcyIsIlR6RGF0YWJhc2UuZ2V0UnVsZUluZm9zIiwiVHpEYXRhYmFzZS5wYXJzZVJ1bGVUeXBlIiwiVHpEYXRhYmFzZS5wYXJzZVRvVHlwZSIsIlR6RGF0YWJhc2UucGFyc2VPblR5cGUiLCJUekRhdGFiYXNlLnBhcnNlT25EYXkiLCJUekRhdGFiYXNlLnBhcnNlT25XZWVrRGF5IiwiVHpEYXRhYmFzZS5wYXJzZUF0VHlwZSIsInZhbGlkYXRlRGF0YSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViLElBQU8sTUFBTSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLElBQU8sSUFBSSxXQUFXLE1BQU0sQ0FBQyxDQUFDO0FBRTlCLElBQU8sTUFBTSxXQUFXLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQU8sUUFBUSxXQUFXLFlBQVksQ0FBQyxDQUFDO0FBQ3hDLElBQU8sSUFBSSxXQUFXLFFBQVEsQ0FBQyxDQUFDO0FBRWhDLG9CQUFvQjtBQUNwQixJQUFJLElBQUksR0FBUSxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNoRCxtQkFBbUI7QUFFbkIsSUFBTyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztBQUNwQyxJQUFPLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3RDLElBQU8sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFHaEM7O0dBRUc7QUFDSCxXQUFZLE1BQU07SUFDakJBOztPQUVHQTtJQUNIQSxtQ0FBSUEsQ0FBQUE7SUFDSkE7O09BRUdBO0lBQ0hBLGlDQUFHQSxDQUFBQTtBQUNKQSxDQUFDQSxFQVRXLGNBQU0sS0FBTixjQUFNLFFBU2pCO0FBVEQsSUFBWSxNQUFNLEdBQU4sY0FTWCxDQUFBO0FB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V0EsQ0FBQ0EsTUFBTUEsS0FBS0EsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsTUFBTUEsR0FBR0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0dBLElBQUlBLE1BQU1BLEdBQVdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9DQSxJQUFJQSxLQUFLQSxHQUFXQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNyREEsSUFBSUEsU0FBU0EsR0FBWUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLFNBQVNBLEdBQW1CQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsSUFBSUEsV0FBV0EsR0FBV0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUV2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FDdkJBLFFBQVFBLEVBQ1JBLE1BQU1BLEVBQ05BLE1BQU1BLEVBQ05BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQ1BBLFdBQVdBLEVBQ1hBLE1BQU1BLEVBQ05BLEtBQUtBLEVBQ0xBLFNBQVNBLEVBQ1RBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLDBEQUEwREE7WUFDN0dBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENB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QXNCQSxDQUFDQSxDQUFDQTtnQkFDckZBLENBQUNBO2dCQUNEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtvQkFDdENBLHdCQUF3QkE7b0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxPQUFPQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDNUNBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLFFBQVFBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0E7b0JBQzFHQSxDQUFDQTtnQkFDRkEsQ0FBQ0E7Z0JBQ0RBLHdCQUF3QkE7Z0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxLQUFLQSxJQUFJQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdkRBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLFFBQVFBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JGQSxDQUFDQTtnQkFDREEsd0JBQXdCQTtnQkFDeEJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLE1BQU1BLElBQUlBLElBQUlBLENBQUNB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QkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsS0FBS0EsSUFBSUEsSUFBSUEsSUFBSUEsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQzVEQSxNQUFNQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQTtvQkFDMUJBLENBQUNBO2dCQUNGQSxDQUFDQTtZQUNGQSxDQUFDQTtRQUNGQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtBQUNmQSxDQUFDQSIsImZpbGUiOiJsaWIvdHotZGF0YWJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIE9sc2VuIFRpbWV6b25lIERhdGFiYXNlIGNvbnRhaW5lclxyXG4gKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKi9cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5kLnRzXCIvPlxyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcclxuaW1wb3J0IHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcclxuXHJcbmltcG9ydCBiYXNpY3MgPSByZXF1aXJlKFwiLi9iYXNpY3NcIik7XHJcbmltcG9ydCBkdXJhdGlvbiA9IHJlcXVpcmUoXCIuL2R1cmF0aW9uXCIpO1xyXG5pbXBvcnQgbWF0aCA9IHJlcXVpcmUoXCIuL21hdGhcIik7XHJcblxyXG4vKiB0c2xpbnQ6ZGlzYWJsZSAqL1xyXG52YXIgZGF0YTogYW55ID0gcmVxdWlyZShcIi4vdGltZXpvbmUtZGF0YS5qc29uXCIpO1xyXG4vKiB0c2xpbnQ6ZW5hYmxlICovXHJcblxyXG5pbXBvcnQgRHVyYXRpb24gPSBkdXJhdGlvbi5EdXJhdGlvbjtcclxuaW1wb3J0IFRpbWVTdHJ1Y3QgPSBiYXNpY3MuVGltZVN0cnVjdDtcclxuaW1wb3J0IFdlZWtEYXkgPSBiYXNpY3MuV2Vla0RheTtcclxuXHJcblxyXG4vKipcclxuICogVHlwZSBvZiBydWxlIFRPIGNvbHVtbiB2YWx1ZVxyXG4gKi9cclxuZXhwb3J0IGVudW0gVG9UeXBlIHtcclxuXHQvKipcclxuXHQgKiBFaXRoZXIgYSB5ZWFyIG51bWJlciBvciBcIm9ubHlcIlxyXG5cdCAqL1xyXG5cdFllYXIsXHJcblx0LyoqXHJcblx0ICogXCJtYXhcIlxyXG5cdCAqL1xyXG5cdE1heFxyXG59XHJcblxyXG4vKipcclxuICogVHlwZSBvZiBydWxlIE9OIGNvbHVtbiB2YWx1ZVxyXG4gKi9cclxuZXhwb3J0IGVudW0gT25UeXBlIHtcclxuXHQvKipcclxuXHQgKiBEYXktb2YtbW9udGggbnVtYmVyXHJcblx0ICovXHJcblx0RGF5TnVtLFxyXG5cdC8qKlxyXG5cdCAqIFwibGFzdFN1blwiIG9yIFwibGFzdFdlZFwiIGV0Y1xyXG5cdCAqL1xyXG5cdExhc3RYLFxyXG5cdC8qKlxyXG5cdCAqIGUuZy4gXCJTdW4+PThcIlxyXG5cdCAqL1xyXG5cdEdyZXFYLFxyXG5cdC8qKlxyXG5cdCAqIGUuZy4gXCJTdW48PThcIlxyXG5cdCAqL1xyXG5cdExlcVhcclxufVxyXG5cclxuZXhwb3J0IGVudW0gQXRUeXBlIHtcclxuXHQvKipcclxuXHQgKiBMb2NhbCB0aW1lIChubyBEU1QpXHJcblx0ICovXHJcblx0U3RhbmRhcmQsXHJcblx0LyoqXHJcblx0ICogV2FsbCBjbG9jayB0aW1lIChsb2NhbCB0aW1lIHdpdGggRFNUKVxyXG5cdCAqL1xyXG5cdFdhbGwsXHJcblx0LyoqXHJcblx0ICogVXRjIHRpbWVcclxuXHQgKi9cclxuXHRVdGMsXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBTZWUgaHR0cDovL3d3dy5jc3RkYmlsbC5jb20vdHpkYi90ei1ob3ctdG8uaHRtbFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJ1bGVJbmZvIHtcclxuXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIEZST00gY29sdW1uIHllYXIgbnVtYmVyLlxyXG5cdFx0ICogTm90ZSwgY2FuIGJlIC0xMDAwMCBmb3IgTmFOIHZhbHVlIChlLmcuIGZvciBcIlN5c3RlbVZcIiBydWxlcylcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGZyb206IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogVE8gY29sdW1uIHR5cGU6IFllYXIgZm9yIHllYXIgbnVtYmVycyBhbmQgXCJvbmx5XCIgdmFsdWVzLCBNYXggZm9yIFwibWF4XCIgdmFsdWUuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB0b1R5cGU6IFRvVHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgVE8gY29sdW1uIGlzIGEgeWVhciwgdGhlIHllYXIgbnVtYmVyLiBJZiBUTyBjb2x1bW4gaXMgXCJvbmx5XCIsIHRoZSBGUk9NIHllYXIuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyB0b1llYXI6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogVFlQRSBjb2x1bW4sIG5vdCB1c2VkIHNvIGZhclxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdHlwZTogc3RyaW5nLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTiBjb2x1bW4gbW9udGggbnVtYmVyIDEtMTJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGluTW9udGg6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogT04gY29sdW1uIHR5cGVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uVHlwZTogT25UeXBlLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiBvblR5cGUgaXMgRGF5TnVtLCB0aGUgZGF5IG51bWJlclxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25EYXk6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgb25UeXBlIGlzIG5vdCBEYXlOdW0sIHRoZSB3ZWVrZGF5XHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvbldlZWtEYXk6IFdlZWtEYXksXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBob3VyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdEhvdXI6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogQVQgY29sdW1uIG1pbnV0ZVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRNaW51dGU6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogQVQgY29sdW1uIHNlY29uZFxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRTZWNvbmQ6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogQVQgY29sdW1uIHR5cGVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0VHlwZTogQXRUeXBlLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBEU1Qgb2Zmc2V0IGZyb20gbG9jYWwgc3RhbmRhcmQgdGltZSAoTk9UIGZyb20gVVRDISlcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHNhdmU6IER1cmF0aW9uLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGFyYWN0ZXIgdG8gaW5zZXJ0IGluICVzIGZvciB0aW1lIHpvbmUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBOb3RlIGlmIFRaIGRhdGFiYXNlIGluZGljYXRlcyBcIi1cIiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxldHRlcjogc3RyaW5nXHJcblx0XHQpIHtcclxuXHJcblx0XHRpZiAodGhpcy5zYXZlKSB7XHJcblx0XHRcdHRoaXMuc2F2ZSA9IHRoaXMuc2F2ZS5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhpcyBydWxlIGlzIGFwcGxpY2FibGUgaW4gdGhlIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgYXBwbGljYWJsZSh5ZWFyOiBudW1iZXIpOiBib29sZWFuIHtcclxuXHRcdGlmICh5ZWFyIDwgdGhpcy5mcm9tKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHN3aXRjaCAodGhpcy50b1R5cGUpIHtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuTWF4OiByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0Y2FzZSBUb1R5cGUuWWVhcjogcmV0dXJuICh5ZWFyIDw9IHRoaXMudG9ZZWFyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGxlc3MgdGhhbiBvdGhlcidzIGZpcnN0IGVmZmVjdGl2ZSBkYXRlKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVMZXNzKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSA8IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5mcm9tID4gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoIDwgb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmluTW9udGggPiBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5sZXNzVGhhbihvdGhlci5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkpKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU29ydCBjb21wYXJpc29uXHJcblx0ICogQHJldHVybiAoZmlyc3QgZWZmZWN0aXZlIGRhdGUgaXMgZXF1YWwgdG8gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgZWZmZWN0aXZlRXF1YWwob3RoZXI6IFJ1bGVJbmZvKTogYm9vbGVhbiB7XHJcblx0XHRpZiAodGhpcy5mcm9tICE9PSBvdGhlci5mcm9tKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmluTW9udGggIT09IG90aGVyLmluTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCF0aGlzLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKS5lcXVhbHMob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGRhdGUgdGhhdCB0aGUgcnVsZSB0YWtlcyBlZmZlY3QuIE5vdGUgdGhhdCB0aGUgdGltZVxyXG5cdCAqIGlzIE5PVCBhZGp1c3RlZCBmb3Igd2FsbCBjbG9jayB0aW1lIG9yIHN0YW5kYXJkIHRpbWUsIGkuZS4gdGhpcy5hdFR5cGUgaXNcclxuXHQgKiBub3QgdGFrZW4gaW50byBhY2NvdW50XHJcblx0ICovXHJcblx0cHVibGljIGVmZmVjdGl2ZURhdGUoeWVhcjogbnVtYmVyKTogVGltZVN0cnVjdCB7XHJcblx0XHRhc3NlcnQodGhpcy5hcHBsaWNhYmxlKHllYXIpLCBcIlJ1bGUgaXMgbm90IGFwcGxpY2FibGUgaW4gXCIgKyB5ZWFyLnRvU3RyaW5nKDEwKSk7XHJcblxyXG5cdFx0Ly8geWVhciBhbmQgbW9udGggYXJlIGdpdmVuXHJcblx0XHR2YXIgdG06IFRpbWVTdHJ1Y3QgPSBuZXcgVGltZVN0cnVjdCh5ZWFyLCB0aGlzLmluTW9udGgpO1xyXG5cclxuXHRcdC8vIGNhbGN1bGF0ZSBkYXlcclxuXHRcdHN3aXRjaCAodGhpcy5vblR5cGUpIHtcclxuXHRcdFx0Y2FzZSBPblR5cGUuRGF5TnVtOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gdGhpcy5vbkRheTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBPblR5cGUuR3JlcVg6IHtcclxuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JBZnRlcih5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25EYXksIHRoaXMub25XZWVrRGF5KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDoge1xyXG5cdFx0XHRcdHRtLmRheSA9IGJhc2ljcy53ZWVrRGF5T25PckJlZm9yZSh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25EYXksIHRoaXMub25XZWVrRGF5KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBPblR5cGUuTGFzdFg6IHtcclxuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3MubGFzdFdlZWtEYXlPZk1vbnRoKHllYXIsIHRoaXMuaW5Nb250aCwgdGhpcy5vbldlZWtEYXkpO1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGNhbGN1bGF0ZSB0aW1lXHJcblx0XHR0bS5ob3VyID0gdGhpcy5hdEhvdXI7XHJcblx0XHR0bS5taW51dGUgPSB0aGlzLmF0TWludXRlO1xyXG5cdFx0dG0uc2Vjb25kID0gdGhpcy5hdFNlY29uZDtcclxuXHJcblx0XHRyZXR1cm4gdG07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0cmFuc2l0aW9uIG1vbWVudCBpbiBVVEMgaW4gdGhlIGdpdmVuIHllYXJcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB5ZWFyXHRUaGUgeWVhciBmb3Igd2hpY2ggdG8gcmV0dXJuIHRoZSB0cmFuc2l0aW9uXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRUaGUgc3RhbmRhcmQgb2Zmc2V0IGZvciB0aGUgdGltZXpvbmUgd2l0aG91dCBEU1RcclxuXHQgKiBAcGFyYW0gcHJldlJ1bGVcdFRoZSBwcmV2aW91cyBydWxlXHJcblx0ICovXHJcblx0cHVibGljIHRyYW5zaXRpb25UaW1lVXRjKHllYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uLCBwcmV2UnVsZTogUnVsZUluZm8pOiBudW1iZXIge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIG5vdCBhcHBsaWNhYmxlIGluIGdpdmVuIHllYXJcIik7XHJcblx0XHR2YXIgdW5peE1pbGxpcyA9IHRoaXMuZWZmZWN0aXZlRGF0ZSh5ZWFyKS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblxyXG5cdFx0Ly8gYWRqdXN0IGZvciBnaXZlbiBvZmZzZXRcclxuXHRcdHZhciBvZmZzZXQ6IER1cmF0aW9uO1xyXG5cdFx0c3dpdGNoICh0aGlzLmF0VHlwZSkge1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5VdGM6XHJcblx0XHRcdFx0b2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgQXRUeXBlLlN0YW5kYXJkOlxyXG5cdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5XYWxsOlxyXG5cdFx0XHRcdGlmIChwcmV2UnVsZSkge1xyXG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQuYWRkKHByZXZSdWxlLnNhdmUpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwidW5rbm93biBBdFR5cGVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB1bml4TWlsbGlzIC0gb2Zmc2V0Lm1pbGxpc2Vjb25kcygpO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZSBvZiByZWZlcmVuY2UgZnJvbSB6b25lIHRvIHJ1bGVcclxuICovXHJcbmV4cG9ydCBlbnVtIFJ1bGVUeXBlIHtcclxuXHQvKipcclxuXHQgKiBObyBydWxlIGFwcGxpZXNcclxuXHQgKi9cclxuXHROb25lLFxyXG5cdC8qKlxyXG5cdCAqIEZpeGVkIGdpdmVuIG9mZnNldFxyXG5cdCAqL1xyXG5cdE9mZnNldCxcclxuXHQvKipcclxuXHQgKiBSZWZlcmVuY2UgdG8gYSBuYW1lZCBzZXQgb2YgcnVsZXNcclxuXHQgKi9cclxuXHRSdWxlTmFtZVxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICogRmlyc3QsIGFuZCBzb21ld2hhdCB0cml2aWFsbHksIHdoZXJlYXMgUnVsZXMgYXJlIGNvbnNpZGVyZWQgdG8gY29udGFpbiBvbmUgb3IgbW9yZSByZWNvcmRzLCBhIFpvbmUgaXMgY29uc2lkZXJlZCB0b1xyXG4gKiBiZSBhIHNpbmdsZSByZWNvcmQgd2l0aCB6ZXJvIG9yIG1vcmUgY29udGludWF0aW9uIGxpbmVzLiBUaHVzLCB0aGUga2V5d29yZCwg4oCcWm9uZSzigJ0gYW5kIHRoZSB6b25lIG5hbWUgYXJlIG5vdCByZXBlYXRlZC5cclxuICogVGhlIGxhc3QgbGluZSBpcyB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLlxyXG4gKiBTZWNvbmQsIGFuZCBtb3JlIGZ1bmRhbWVudGFsbHksIGVhY2ggbGluZSBvZiBhIFpvbmUgcmVwcmVzZW50cyBhIHN0ZWFkeSBzdGF0ZSwgbm90IGEgdHJhbnNpdGlvbiBiZXR3ZWVuIHN0YXRlcy5cclxuICogVGhlIHN0YXRlIGV4aXN0cyBmcm9tIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBwcmV2aW91cyBsaW5l4oCZcyBbVU5USUxdIGNvbHVtbiB1cCB0byB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgY3VycmVudCBsaW5l4oCZc1xyXG4gKiBbVU5USUxdIGNvbHVtbi4gSW4gb3RoZXIgd29yZHMsIHRoZSBkYXRlIGFuZCB0aW1lIGluIHRoZSBbVU5USUxdIGNvbHVtbiBpcyB0aGUgaW5zdGFudCB0aGF0IHNlcGFyYXRlcyB0aGlzIHN0YXRlIGZyb20gdGhlIG5leHQuXHJcbiAqIFdoZXJlIHRoYXQgd291bGQgYmUgYW1iaWd1b3VzIGJlY2F1c2Ugd2XigJlyZSBzZXR0aW5nIG91ciBjbG9ja3MgYmFjaywgdGhlIFtVTlRJTF0gY29sdW1uIHNwZWNpZmllcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgaW5zdGFudC5cclxuICogVGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgbGFzdCBsaW5lLCB0aGUgb25lIHdpdGhvdXQgYW55dGhpbmcgaW4gdGhlIFtVTlRJTF0gY29sdW1uLCBjb250aW51ZXMgdG8gdGhlIHByZXNlbnQuXHJcbiAqIFRoZSBmaXJzdCBsaW5lIHR5cGljYWxseSBzcGVjaWZpZXMgdGhlIG1lYW4gc29sYXIgdGltZSBvYnNlcnZlZCBiZWZvcmUgdGhlIGludHJvZHVjdGlvbiBvZiBzdGFuZGFyZCB0aW1lLiBTaW5jZSB0aGVyZeKAmXMgbm8gbGluZSBiZWZvcmVcclxuICogdGhhdCwgaXQgaGFzIG5vIGJlZ2lubmluZy4gOC0pIEZvciBzb21lIHBsYWNlcyBuZWFyIHRoZSBJbnRlcm5hdGlvbmFsIERhdGUgTGluZSwgdGhlIGZpcnN0IHR3byBsaW5lcyB3aWxsIHNob3cgc29sYXIgdGltZXMgZGlmZmVyaW5nIGJ5XHJcbiAqIDI0IGhvdXJzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgbW92ZW1lbnQgb2YgdGhlIERhdGUgTGluZS4gRm9yIGV4YW1wbGU6XHJcbiAqICMgWm9uZVx0TkFNRVx0XHRHTVRPRkZcdFJVTEVTXHRGT1JNQVRcdFtVTlRJTF1cclxuICogWm9uZSBBbWVyaWNhL0p1bmVhdVx0IDE1OjAyOjE5IC1cdExNVFx0MTg2NyBPY3QgMThcclxuICogXHRcdFx0IC04OjU3OjQxIC1cdExNVFx0Li4uXHJcbiAqIFdoZW4gQWxhc2thIHdhcyBwdXJjaGFzZWQgZnJvbSBSdXNzaWEgaW4gMTg2NywgdGhlIERhdGUgTGluZSBtb3ZlZCBmcm9tIHRoZSBBbGFza2EvQ2FuYWRhIGJvcmRlciB0byB0aGUgQmVyaW5nIFN0cmFpdDsgYW5kIHRoZSB0aW1lIGluXHJcbiAqIEFsYXNrYSB3YXMgdGhlbiAyNCBob3VycyBlYXJsaWVyIHRoYW4gaXQgaGFkIGJlZW4uIDxhc2lkZT4oNiBPY3RvYmVyIGluIHRoZSBKdWxpYW4gY2FsZW5kYXIsIHdoaWNoIFJ1c3NpYSB3YXMgc3RpbGwgdXNpbmcgdGhlbiBmb3JcclxuICogcmVsaWdpb3VzIHJlYXNvbnMsIHdhcyBmb2xsb3dlZCBieSBhIHNlY29uZCBpbnN0YW5jZSBvZiB0aGUgc2FtZSBkYXkgd2l0aCBhIGRpZmZlcmVudCBuYW1lLCAxOCBPY3RvYmVyIGluIHRoZSBHcmVnb3JpYW4gY2FsZW5kYXIuXHJcbiAqIElzbuKAmXQgY2l2aWwgdGltZSB3b25kZXJmdWw/IDgtKSk8L2FzaWRlPlxyXG4gKiBUaGUgYWJicmV2aWF0aW9uLCDigJxMTVQs4oCdIHN0YW5kcyBmb3Ig4oCcbG9jYWwgbWVhbiB0aW1lLOKAnSB3aGljaCBpcyBhbiBpbnZlbnRpb24gb2YgdGhlIHR6IGRhdGFiYXNlIGFuZCB3YXMgcHJvYmFibHkgbmV2ZXIgYWN0dWFsbHlcclxuICogdXNlZCBkdXJpbmcgdGhlIHBlcmlvZC4gRnVydGhlcm1vcmUsIHRoZSB2YWx1ZSBpcyBhbG1vc3QgY2VydGFpbmx5IHdyb25nIGV4Y2VwdCBpbiB0aGUgYXJjaGV0eXBhbCBwbGFjZSBhZnRlciB3aGljaCB0aGUgem9uZSBpcyBuYW1lZC5cclxuICogKFRoZSB0eiBkYXRhYmFzZSB1c3VhbGx5IGRvZXNu4oCZdCBwcm92aWRlIGEgc2VwYXJhdGUgWm9uZSByZWNvcmQgZm9yIHBsYWNlcyB3aGVyZSBub3RoaW5nIHNpZ25pZmljYW50IGhhcHBlbmVkIGFmdGVyIDE5NzAuKVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFpvbmVJbmZvIHtcclxuXHJcblx0Y29uc3RydWN0b3IoXHJcblx0XHQvKipcclxuXHRcdCAqIEdNVCBvZmZzZXQgaW4gZnJhY3Rpb25hbCBtaW51dGVzLCBQT1NJVElWRSB0byBVVEMgKG5vdGUgSmF2YVNjcmlwdC5EYXRlIGdpdmVzIG9mZnNldHNcclxuXHRcdCAqIGNvbnRyYXJ5IHRvIHdoYXQgeW91IG1pZ2h0IGV4cGVjdCkuICBFLmcuIEV1cm9wZS9BbXN0ZXJkYW0gaGFzICs2MCBtaW51dGVzIGluIHRoaXMgZmllbGQgYmVjYXVzZVxyXG5cdFx0ICogaXQgaXMgb25lIGhvdXIgYWhlYWQgb2YgVVRDXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBnbXRvZmY6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGhlIFJVTEVTIGNvbHVtbiB0ZWxscyB1cyB3aGV0aGVyIGRheWxpZ2h0IHNhdmluZyB0aW1lIGlzIGJlaW5nIG9ic2VydmVkOlxyXG5cdFx0ICogQSBoeXBoZW4sIGEga2luZCBvZiBudWxsIHZhbHVlLCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCBvdXIgY2xvY2tzIGFoZWFkIG9mIHN0YW5kYXJkIHRpbWUuXHJcblx0XHQgKiBBbiBhbW91bnQgb2YgdGltZSAodXN1YWxseSBidXQgbm90IG5lY2Vzc2FyaWx5IOKAnDE6MDDigJ0gbWVhbmluZyBvbmUgaG91cikgbWVhbnMgdGhhdCB3ZSBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkIGJ5IHRoYXQgYW1vdW50LlxyXG5cdFx0ICogU29tZSBhbHBoYWJldGljIHN0cmluZyBtZWFucyB0aGF0IHdlIG1pZ2h0IGhhdmUgc2V0IG91ciBjbG9ja3MgYWhlYWQ7IGFuZCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBydWxlXHJcblx0XHQgKiB0aGUgbmFtZSBvZiB3aGljaCBpcyB0aGUgZ2l2ZW4gYWxwaGFiZXRpYyBzdHJpbmcuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlVHlwZTogUnVsZVR5cGUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB0aGUgcnVsZSBjb2x1bW4gaXMgYW4gb2Zmc2V0LCB0aGlzIGlzIHRoZSBvZmZzZXRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVPZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGEgcnVsZSBuYW1lLCB0aGlzIGlzIHRoZSBydWxlIG5hbWVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHJ1bGVOYW1lOiBzdHJpbmcsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBUaGUgRk9STUFUIGNvbHVtbiBzcGVjaWZpZXMgdGhlIHVzdWFsIGFiYnJldmlhdGlvbiBvZiB0aGUgdGltZSB6b25lIG5hbWUuIEl0IGNhbiBoYXZlIG9uZSBvZiBmb3VyIGZvcm1zOlxyXG5cdFx0ICogdGhlIHN0cmluZywg4oCcenp6LOKAnSB3aGljaCBpcyBhIGtpbmQgb2YgbnVsbCB2YWx1ZSAoZG9u4oCZdCBhc2spXHJcblx0XHQgKiBhIHNpbmdsZSBhbHBoYWJldGljIHN0cmluZyBvdGhlciB0aGFuIOKAnHp6eizigJ0gaW4gd2hpY2ggY2FzZSB0aGF04oCZcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBhIHBhaXIgb2Ygc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBzbGFzaCAo4oCYL+KAmSksIGluIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHN0cmluZyBpcyB0aGUgYWJicmV2aWF0aW9uXHJcblx0XHQgKiBmb3IgdGhlIHN0YW5kYXJkIHRpbWUgbmFtZSBhbmQgdGhlIHNlY29uZCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvbiBmb3IgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIG5hbWVcclxuXHRcdCAqIGEgc3RyaW5nIGNvbnRhaW5pbmcg4oCcJXMs4oCdIGluIHdoaWNoIGNhc2UgdGhlIOKAnCVz4oCdIHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIHRleHQgaW4gdGhlIGFwcHJvcHJpYXRlIFJ1bGXigJlzIExFVFRFUiBjb2x1bW5cclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGZvcm1hdDogc3RyaW5nLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVW50aWwgdGltZXN0YW1wIGluIHVuaXggdXRjIG1pbGxpcy4gVGhlIHpvbmUgaW5mbyBpcyB2YWxpZCB1cCB0b1xyXG5cdFx0ICogYW5kIGV4Y2x1ZGluZyB0aGlzIHRpbWVzdGFtcC5cclxuXHRcdCAqIE5vdGUgdGhpcyB2YWx1ZSBjYW4gYmUgTlVMTCAoZm9yIHRoZSBmaXJzdCBydWxlKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdW50aWw6IG51bWJlclxyXG5cdCkge1xyXG5cdFx0aWYgKHRoaXMucnVsZU9mZnNldCkge1xyXG5cdFx0XHR0aGlzLnJ1bGVPZmZzZXQgPSB0aGlzLnJ1bGVPZmZzZXQuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuZW51bSBUek1vbnRoTmFtZXMge1xyXG5cdEphbiA9IDEsXHJcblx0RmViID0gMixcclxuXHRNYXIgPSAzLFxyXG5cdEFwciA9IDQsXHJcblx0TWF5ID0gNSxcclxuXHRKdW4gPSA2LFxyXG5cdEp1bCA9IDcsXHJcblx0QXVnID0gOCxcclxuXHRTZXAgPSA5LFxyXG5cdE9jdCA9IDEwLFxyXG5cdE5vdiA9IDExLFxyXG5cdERlYyA9IDEyXHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vbnRoTmFtZVRvU3RyaW5nKG5hbWU6IHN0cmluZyk6IG51bWJlciB7XHJcblx0Zm9yICh2YXIgaTogbnVtYmVyID0gMTsgaSA8PSAxMjsgKytpKSB7XHJcblx0XHRpZiAoVHpNb250aE5hbWVzW2ldID09PSBuYW1lKSB7XHJcblx0XHRcdHJldHVybiBpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdGlmICh0cnVlKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG1vbnRoIG5hbWUgXFxcIlwiICsgbmFtZSArIFwiXFxcIlwiKTtcclxuXHR9XHJcbn1cclxuXHJcbmVudW0gVHpEYXlOYW1lcyB7XHJcblx0U3VuID0gMCxcclxuXHRNb24gPSAxLFxyXG5cdFR1ZSA9IDIsXHJcblx0V2VkID0gMyxcclxuXHRUaHUgPSA0LFxyXG5cdEZyaSA9IDUsXHJcblx0U2F0ID0gNlxyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBvZmZzZXQgc3RyaW5nIGkuZS5cclxuICogMSwgLTEsICsxLCAwMSwgMTowMCwgMToyMzoyNS4xNDNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkT2Zmc2V0U3RyaW5nKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdHJldHVybiAvXihcXC18XFwrKT8oWzAtOV0rKChcXDpbMC05XSspPyhcXDpbMC05XSsoXFwuWzAtOV0rKT8pPykpJC8udGVzdChzKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBtb21lbnQgYXQgd2hpY2ggdGhlIGdpdmVuIHJ1bGUgYmVjb21lcyB2YWxpZFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRyYW5zaXRpb24ge1xyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUcmFuc2l0aW9uIHRpbWUgaW4gVVRDIG1pbGxpc1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXQ6IG51bWJlcixcclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IG9mZnNldCAodHlwZSBvZiBvZmZzZXQgZGVwZW5kcyBvbiB0aGUgZnVuY3Rpb24pXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvZmZzZXQ6IER1cmF0aW9uLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTmV3IHRpbXpvbmUgYWJicmV2aWF0aW9uIGxldHRlclxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgbGV0dGVyOiBzdHJpbmdcclxuXHJcblx0XHQpIHtcclxuXHRcdGlmICh0aGlzLm9mZnNldCkge1xyXG5cdFx0XHR0aGlzLm9mZnNldCA9IHRoaXMub2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbiBmb3IgVHpEYXRhYmFzZSNub3JtYWxpemVMb2NhbCgpXHJcbiAqL1xyXG5leHBvcnQgZW51bSBOb3JtYWxpemVPcHRpb24ge1xyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgQURESU5HIHRoZSBEU1Qgb2Zmc2V0XHJcblx0ICovXHJcblx0VXAsXHJcblx0LyoqXHJcblx0ICogTm9ybWFsaXplIG5vbi1leGlzdGluZyB0aW1lcyBieSBTVUJUUkFDVElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdERvd25cclxufVxyXG5cclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFRoaXMgY2xhc3MgdHlwZXNjcmlwdGlmaWVzIHJlYWRpbmcgdGhlIFRaIGRhdGFcclxuICovXHJcbmV4cG9ydCBjbGFzcyBUekRhdGFiYXNlIHtcclxuXHJcblx0LyoqXHJcblx0ICogU2luZ2xlIGluc3RhbmNlIG1lbWJlclxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZTogVHpEYXRhYmFzZSA9IG51bGw7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbmdsZSBpbnN0YW5jZSBvZiB0aGlzIGRhdGFiYXNlXHJcblx0ICovXHJcblx0cHVibGljIHN0YXRpYyBpbnN0YW5jZSgpOiBUekRhdGFiYXNlIHtcclxuXHRcdGlmICghVHpEYXRhYmFzZS5faW5zdGFuY2UpIHtcclxuXHRcdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSBuZXcgVHpEYXRhYmFzZShkYXRhKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBUekRhdGFiYXNlLl9pbnN0YW5jZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluamVjdCB0ZXN0IHRpbWV6b25lIGRhdGEgZm9yIHVuaXR0ZXN0c1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaW5qZWN0KGRhdGE6IGFueSk6IHZvaWQge1xyXG5cdFx0VHpEYXRhYmFzZS5faW5zdGFuY2UgPSBudWxsOyAvLyBjaXJjdW12ZW50IGNvbnN0cnVjdG9yIGNoZWNrIG9uIGR1cGxpY2F0ZSBpbnN0YW5jZXNcclxuXHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoZGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbmZvcm1hdGlvbiBvbiBhZ2dyZWdhdGUgdmFsdWVzIGluIHRoZSBkYXRhYmFzZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX21pbm1heDogTWluTWF4SW5mbztcclxuXHJcblx0cHJpdmF0ZSBfZGF0YTogYW55O1xyXG5cclxuXHRwcml2YXRlIF96b25lTmFtZXM6IHN0cmluZ1tdO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihkYXRhOiBhbnkpIHtcclxuXHRcdGFzc2VydCghVHpEYXRhYmFzZS5faW5zdGFuY2UsIFwiWW91IHNob3VsZCBub3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBUekRhdGFiYXNlIGNsYXNzIHlvdXJzZWxmLiBVc2UgVHpEYXRhYmFzZS5pbnN0YW5jZSgpXCIpO1xyXG5cdFx0dGhpcy5fZGF0YSA9IGRhdGE7XHJcblx0XHR0aGlzLl9taW5tYXggPSB2YWxpZGF0ZURhdGEoZGF0YSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGEgc29ydGVkIGxpc3Qgb2YgYWxsIHpvbmUgbmFtZXNcclxuXHQgKi9cclxuXHRwdWJsaWMgem9uZU5hbWVzKCk6IHN0cmluZ1tdIHtcclxuXHRcdGlmICghdGhpcy5fem9uZU5hbWVzKSB7XHJcblx0XHRcdHRoaXMuX3pvbmVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuX2RhdGEuem9uZXMpO1xyXG5cdFx0XHR0aGlzLl96b25lTmFtZXMuc29ydCgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXMuX3pvbmVOYW1lcztcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBleGlzdHMoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWluaW11bSBub24temVybyBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcblx0ICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG5cdCAqXHJcblx0ICogRG9lcyByZXR1cm4gemVybyBpZiBhIHpvbmVOYW1lIGlzIGdpdmVuIGFuZCB0aGVyZSBpcyBubyBEU1QgYXQgYWxsIGZvciB0aGUgem9uZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWluRHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHR2YXIgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRcdHZhciBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdHpvbmVJbmZvcy5mb3JFYWNoKCh6b25lSW5mbzogWm9uZUluZm8pOiB2b2lkID0+IHtcclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG5cdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0LmdyZWF0ZXJUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcblx0XHRcdFx0XHRcdGlmICh6b25lSW5mby5ydWxlT2Zmc2V0Lm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHR2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdHRlbXAuZm9yRWFjaCgocnVsZUluZm86IFJ1bGVJbmZvKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChydWxlSW5mby5zYXZlLm1pbGxpc2Vjb25kcygpICE9PSAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQgPSBydWxlSW5mby5zYXZlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWluRHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXhpbXVtIERTVCBvZmZzZXQgKHdoaWNoIGV4Y2x1ZGVzIHN0YW5kYXJkIG9mZnNldCkgb2YgYWxsIHJ1bGVzIGluIHRoZSBkYXRhYmFzZS5cclxuXHQgKiBOb3RlIHRoYXQgRFNUIG9mZnNldHMgbmVlZCBub3QgYmUgd2hvbGUgaG91cnMuXHJcblx0ICpcclxuXHQgKiBSZXR1cm5zIDAgaWYgem9uZU5hbWUgZ2l2ZW4gYW5kIG5vIERTVCBvYnNlcnZlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0KG9wdGlvbmFsKSBpZiBnaXZlbiwgdGhlIHJlc3VsdCBmb3IgdGhlIGdpdmVuIHpvbmUgaXMgcmV0dXJuZWRcclxuXHQgKi9cclxuXHRwdWJsaWMgbWF4RHN0U2F2ZSh6b25lTmFtZT86IHN0cmluZyk6IER1cmF0aW9uIHtcclxuXHRcdGlmICh6b25lTmFtZSkge1xyXG5cdFx0XHR2YXIgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0XHR2YXIgcmVzdWx0OiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRcdHZhciBydWxlTmFtZXM6IHN0cmluZ1tdID0gW107XHJcblx0XHRcdHpvbmVJbmZvcy5mb3JFYWNoKCh6b25lSW5mbzogWm9uZUluZm8pOiB2b2lkID0+IHtcclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLk9mZnNldCkge1xyXG5cdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHpvbmVJbmZvLnJ1bGVPZmZzZXQpKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWVcclxuXHRcdFx0XHRcdCYmIHJ1bGVOYW1lcy5pbmRleE9mKHpvbmVJbmZvLnJ1bGVOYW1lKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdHJ1bGVOYW1lcy5wdXNoKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdHZhciB0ZW1wID0gdGhpcy5nZXRSdWxlSW5mb3Moem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0dGVtcC5mb3JFYWNoKChydWxlSW5mbzogUnVsZUluZm8pOiB2b2lkID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKCFyZXN1bHQgfHwgcmVzdWx0Lmxlc3NUaGFuKHJ1bGVJbmZvLnNhdmUpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWYgKCFyZXN1bHQpIHtcclxuXHRcdFx0XHRyZXN1bHQgPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmNsb25lKCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gRHVyYXRpb24ubWludXRlcyh0aGlzLl9taW5tYXgubWF4RHN0U2F2ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgem9uZSBoYXMgRFNUIGF0IGFsbFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBoYXNEc3Qoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuICh0aGlzLm1heERzdFNhdmUoem9uZU5hbWUpLm1pbGxpc2Vjb25kcygpICE9PSAwKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpcnN0IERTVCBjaGFuZ2UgbW9tZW50IEFGVEVSIHRoZSBnaXZlbiBVVEMgZGF0ZSBpbiBVVEMgbWlsbGlzZWNvbmRzLCB3aXRoaW4gb25lIHllYXJcclxuXHQgKi9cclxuXHRwdWJsaWMgbmV4dERzdENoYW5nZSh6b25lTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlcik6IG51bWJlciB7XHJcblx0XHR2YXIgdG06IFRpbWVTdHJ1Y3QgPSBiYXNpY3MudW5peFRvVGltZU5vTGVhcFNlY3ModXRjTWlsbGlzKTtcclxuXHRcdHZhciB6b25lSW5mbzogWm9uZUluZm87XHJcblx0XHR2YXIgaTogbnVtYmVyO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgem9uZSBpbmZvcyBmb3IgW2RhdGUsIGRhdGUrMXllYXIpXHJcblx0XHR2YXIgYWxsWm9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0dmFyIHJlbGV2YW50Wm9uZUluZm9zOiBab25lSW5mb1tdID0gW107XHJcblx0XHR2YXIgcmFuZ2VTdGFydDogbnVtYmVyID0gdXRjTWlsbGlzO1xyXG5cdFx0dmFyIHJhbmdlRW5kOiBudW1iZXIgPSB1dGNNaWxsaXMgKyAzNjUgKiAyNCAqIDM2MDAgKiAxMDAwO1xyXG5cdFx0dmFyIHByZXZFbmQ6IG51bWJlciA9IG51bGw7XHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgYWxsWm9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHpvbmVJbmZvID0gYWxsWm9uZUluZm9zW2ldO1xyXG5cdFx0XHRpZiAoKHByZXZFbmQgPT09IG51bGwgfHwgcHJldkVuZCA8IHJhbmdlRW5kKSAmJiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgPiByYW5nZVN0YXJ0KSkge1xyXG5cdFx0XHRcdHJlbGV2YW50Wm9uZUluZm9zLnB1c2goem9uZUluZm8pO1xyXG5cdFx0XHR9XHJcblx0XHRcdHByZXZFbmQgPSB6b25lSW5mby51bnRpbDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjb2xsZWN0IGFsbCB0cmFuc2l0aW9ucyBpbiB0aGUgem9uZXMgZm9yIHRoZSB5ZWFyXHJcblx0XHR2YXIgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cdFx0Zm9yIChpID0gMDsgaSA8IHJlbGV2YW50Wm9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHpvbmVJbmZvID0gcmVsZXZhbnRab25lSW5mb3NbaV07XHJcblx0XHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdFx0dHJhbnNpdGlvbnMgPSB0cmFuc2l0aW9ucy5jb25jYXQodGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoem9uZUluZm8ucnVsZU5hbWUsIHRtLnllYXIgLSAxLCB0bS55ZWFyICsgMSwgem9uZUluZm8uZ210b2ZmKSk7XHJcblx0XHR9XHJcblx0XHR0cmFuc2l0aW9ucy5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgZmlyc3QgYWZ0ZXIgdGhlIGdpdmVuIGRhdGUgdGhhdCBoYXMgYSBkaWZmZXJlbnQgb2Zmc2V0XHJcblx0XHR2YXIgcHJldlNhdmU6IER1cmF0aW9uID0gbnVsbDtcclxuXHRcdGZvciAoaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAoIXByZXZTYXZlIHx8ICFwcmV2U2F2ZS5lcXVhbHModHJhbnNpdGlvbi5vZmZzZXQpKSB7XHJcblx0XHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPiB1dGNNaWxsaXMpIHtcclxuXHRcdFx0XHRcdHJldHVybiB0cmFuc2l0aW9uLmF0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2U2F2ZSA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZ2l2ZW4gem9uZSBuYW1lIGV2ZW50dWFsbHkgbGlua3MgdG9cclxuXHQgKiBcIkV0Yy9VVENcIiwgXCJFdGMvR01UXCIgb3IgXCJFdGMvVUNUXCIgaW4gdGhlIFRaIGRhdGFiYXNlLiBUaGlzIGlzIHRydWUgZS5nLiBmb3JcclxuXHQgKiBcIlVUQ1wiLCBcIkdNVFwiLCBcIkV0Yy9HTVRcIiBldGMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWUuXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVJc1V0Yyh6b25lTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHR2YXIgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xyXG5cdFx0dmFyIHpvbmVFbnRyaWVzOiBhbnkgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuXHRcdC8vIGZvbGxvdyBsaW5rc1xyXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuXHRcdFx0XHRcdCsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcblx0XHRcdHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gKGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VVENcIiB8fCBhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvR01UXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL1VDVFwiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZXMgbm9uLWV4aXN0aW5nIGxvY2FsIHRpbWVzIGJ5IGFkZGluZy9zdWJ0cmFjdGluZyBhIGZvcndhcmQgb2Zmc2V0IGNoYW5nZS5cclxuXHQgKiBEdXJpbmcgYSBmb3J3YXJkIHN0YW5kYXJkIG9mZnNldCBjaGFuZ2Ugb3IgRFNUIG9mZnNldCBjaGFuZ2UsIHNvbWUgYW1vdW50IG9mXHJcblx0ICogbG9jYWwgdGltZSBpcyBza2lwcGVkLiBUaGVyZWZvcmUsIHRoaXMgYW1vdW50IG9mIGxvY2FsIHRpbWUgZG9lcyBub3QgZXhpc3QuXHJcblx0ICogVGhpcyBmdW5jdGlvbiBhZGRzIHRoZSBhbW91bnQgb2YgZm9yd2FyZCBjaGFuZ2UgdG8gYW55IG5vbi1leGlzdGluZyB0aW1lLiBBZnRlciBhbGwsXHJcblx0ICogdGhpcyBpcyBwcm9iYWJseSB3aGF0IHRoZSB1c2VyIG1lYW50LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGxvY2FsVGltZVx0QSBsb2NhbCB0aW1lLCBlaXRoZXIgYXMgYSBUaW1lU3RydWN0IG9yIGFzIGEgdW5peCBtaWxsaXNlY29uZCB2YWx1ZVxyXG5cdCAqIEBwYXJhbSBvcHRcdChvcHRpb25hbCkgUm91bmQgdXAgb3IgZG93bj8gRGVmYXVsdDogdXAuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuXHRUaGUgbm9ybWFsaXplZCB0aW1lLCBpbiB0aGUgc2FtZSBmb3JtYXQgYXMgdGhlIGxvY2FsVGltZSBwYXJhbWV0ZXIgKFRpbWVTdHJ1Y3Qgb3IgdW5peCBtaWxsaXMpXHJcblx0ICovXHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogVGltZVN0cnVjdCwgb3B0PzogTm9ybWFsaXplT3B0aW9uKTogVGltZVN0cnVjdDtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxUaW1lOiBudW1iZXIsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IG51bWJlcjtcclxuXHRwdWJsaWMgbm9ybWFsaXplTG9jYWwoem9uZU5hbWU6IHN0cmluZywgYTogYW55LCBvcHQ6IE5vcm1hbGl6ZU9wdGlvbiA9IE5vcm1hbGl6ZU9wdGlvbi5VcCk6IGFueSB7XHJcblx0XHRhc3NlcnQodHlwZW9mIChhKSA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgKGEpID09PSBcIm9iamVjdFwiLCBcIm51bWJlciBvciBvYmplY3QgZXhwZWN0ZWRcIik7XHJcblx0XHRhc3NlcnQodHlwZW9mKGEpICE9PSBcIm9iamVjdFwiIHx8IGEsIFwiYSBpcyBudWxsXCIpO1xyXG5cclxuXHRcdGlmICh0aGlzLmhhc0RzdCh6b25lTmFtZSkpIHtcclxuXHRcdFx0dmFyIHVuaXhNaWxsaXM6IG51bWJlciA9IDA7XHJcblx0XHRcdHZhciB0bTogVGltZVN0cnVjdCA9IG51bGw7XHJcblx0XHRcdGlmICh0eXBlb2YgYSA9PT0gXCJvYmplY3RcIikge1xyXG5cdFx0XHRcdHVuaXhNaWxsaXMgPSAoPFRpbWVTdHJ1Y3Q+KGEpKS50b1VuaXhOb0xlYXBTZWNzKCk7XHJcblx0XHRcdFx0dG0gPSA8VGltZVN0cnVjdD4oYSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dW5peE1pbGxpcyA9IDxudW1iZXI+YTtcclxuXHRcdFx0XHR0bSA9IGJhc2ljcy51bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gbG9jYWwgdGltZXMgYmVoYXZlIGxpa2UgdGhpcyBkdXJpbmcgRFNUIGNoYW5nZXM6XHJcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcblx0XHRcdC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMWgpOiAgMSAyIDIgMyA0XHJcblx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzXHJcblxyXG5cdFx0XHQvLyBUaGVyZWZvcmUsIGJpbmFyeSBzZWFyY2hpbmcgaXMgbm90IHBvc3NpYmxlLlxyXG5cdFx0XHQvLyBJbnN0ZWFkLCB3ZSBzaG91bGQgY2hlY2sgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zIHdpdGhpbiBhIHdpbmRvdyBhcm91bmQgdGhlIGxvY2FsIHRpbWVcclxuXHJcblx0XHRcdC8vIGdldCBhbGwgdHJhbnNpdGlvbnMgKG5vdGUgdGhpcyBpbmNsdWRlcyBmYWtlIHRyYW5zaXRpb24gcnVsZXMgZm9yIHpvbmUgb2Zmc2V0IGNoYW5nZXMpXHJcblx0XHRcdHZhciB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZSwgdG0ueWVhciAtIDEsIHRtLnllYXIgKyAxKTtcclxuXHJcblx0XHRcdC8vIGZpbmQgdGhlIERTVCBmb3J3YXJkIHRyYW5zaXRpb25zXHJcblx0XHRcdHZhciBwcmV2OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0dmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0XHQvLyBmb3J3YXJkIHRyYW5zaXRpb24/XHJcblx0XHRcdFx0aWYgKHRyYW5zaXRpb24ub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYpKSB7XHJcblx0XHRcdFx0XHR2YXIgbG9jYWxCZWZvcmU6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyBwcmV2Lm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0dmFyIGxvY2FsQWZ0ZXI6IG51bWJlciA9IHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdGlmICh1bml4TWlsbGlzID49IGxvY2FsQmVmb3JlICYmIHVuaXhNaWxsaXMgPCBsb2NhbEFmdGVyKSB7XHJcblx0XHRcdFx0XHRcdHZhciBmb3J3YXJkQ2hhbmdlID0gdHJhbnNpdGlvbi5vZmZzZXQuc3ViKHByZXYpO1xyXG5cdFx0XHRcdFx0XHQvLyBub24tZXhpc3RpbmcgdGltZVxyXG5cdFx0XHRcdFx0XHR2YXIgZmFjdG9yOiBudW1iZXIgPSAob3B0ID09PSBOb3JtYWxpemVPcHRpb24uVXAgPyAxIDogLTEpO1xyXG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYmFzaWNzLnVuaXhUb1RpbWVOb0xlYXBTZWNzKHVuaXhNaWxsaXMgKyBmYWN0b3IgKiBmb3J3YXJkQ2hhbmdlLm1pbGxpc2Vjb25kcygpKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5peE1pbGxpcyArIGZhY3RvciAqIGZvcndhcmRDaGFuZ2UubWlsbGlzZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldiA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0Ly8gbm8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdFx0cmV0dXJuIGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gYTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIHdpdGhvdXQgRFNULlxyXG5cdCAqIFRocm93cyBpZiBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjTWlsbGlzXHRUaW1lc3RhbXAgaW4gVVRDXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0KHpvbmVOYW1lOiBzdHJpbmcsIHV0Y01pbGxpczogbnVtYmVyKTogRHVyYXRpb24ge1xyXG5cdFx0dmFyIHpvbmVJbmZvOiBab25lSW5mbyA9IHRoaXMuZ2V0Wm9uZUluZm8oem9uZU5hbWUsIHV0Y01pbGxpcyk7XHJcblx0XHRyZXR1cm4gem9uZUluZm8uZ210b2ZmLmNsb25lKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLlxyXG5cdCAqIFRocm93cyBpZiB6b25lIGluZm8gbm90IGZvdW5kLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y01pbGxpc1x0VGltZXN0YW1wIGluIFVUQ1xyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHZhciB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNNaWxsaXMpO1xyXG5cdFx0dmFyIGRzdE9mZnNldDogRHVyYXRpb24gPSBudWxsO1xyXG5cclxuXHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5Ob25lOiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24ubWludXRlcygwKTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6IHtcclxuXHRcdFx0XHRkc3RPZmZzZXQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG5cdFx0XHR9IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFJ1bGVUeXBlLlJ1bGVOYW1lOiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gdGhpcy5kc3RPZmZzZXRGb3JSdWxlKHpvbmVJbmZvLnJ1bGVOYW1lLCB1dGNNaWxsaXMsIHpvbmVJbmZvLmdtdG9mZik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZHN0T2Zmc2V0LmFkZCh6b25lSW5mby5nbXRvZmYpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZSBydWxlIGFiYnJldmlhdGlvbiwgZS5nLiBDRVNUIGZvciBDZW50cmFsIEV1cm9wZWFuIFN1bW1lciBUaW1lLlxyXG5cdCAqIE5vdGUgdGhpcyBpcyBkZXBlbmRlbnQgb24gdGhlIHRpbWUsIGJlY2F1c2Ugd2l0aCB0aW1lIGRpZmZlcmVudCBydWxlcyBhcmUgaW4gZWZmZWN0XHJcblx0ICogYW5kIHRoZXJlZm9yZSBkaWZmZXJlbnQgYWJicmV2aWF0aW9ucy4gVGhleSBhbHNvIGNoYW5nZSB3aXRoIERTVDogZS5nLiBDRVNUIG9yIENFVC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjTWlsbGlzXHRUaW1lc3RhbXAgaW4gVVRDIHVuaXggbWlsbGlzZWNvbmRzXHJcblx0ICogQHBhcmFtIGRzdERlcGVuZGVudCAoZGVmYXVsdCB0cnVlKSBzZXQgdG8gZmFsc2UgZm9yIGEgRFNULWFnbm9zdGljIGFiYnJldmlhdGlvblxyXG5cdCAqIEByZXR1cm5cdFRoZSBhYmJyZXZpYXRpb24gb2YgdGhlIHJ1bGUgdGhhdCBpcyBpbiBlZmZlY3RcclxuXHQgKi9cclxuXHRwdWJsaWMgYWJicmV2aWF0aW9uKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y01pbGxpczogbnVtYmVyLCBkc3REZXBlbmRlbnQ6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nIHtcclxuXHRcdHZhciB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNNaWxsaXMpO1xyXG5cdFx0dmFyIGZvcm1hdDogc3RyaW5nID0gem9uZUluZm8uZm9ybWF0O1xyXG5cclxuXHRcdC8vIGlzIGZvcm1hdCBkZXBlbmRlbnQgb24gRFNUP1xyXG5cdFx0aWYgKGZvcm1hdC5pbmRleE9mKFwiJXNcIikgIT09IC0xXHJcblx0XHRcdCYmIHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHR2YXIgbGV0dGVyOiBzdHJpbmc7XHJcblx0XHRcdC8vIHBsYWNlIGluIGZvcm1hdCBzdHJpbmdcclxuXHRcdFx0aWYgKGRzdERlcGVuZGVudCkge1xyXG5cdFx0XHRcdGxldHRlciA9IHRoaXMubGV0dGVyRm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjTWlsbGlzLCB6b25lSW5mby5nbXRvZmYpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHV0aWwuZm9ybWF0KGZvcm1hdCwgbGV0dGVyKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZm9ybWF0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgc3RhbmRhcmQgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgZXhjbHVkaW5nIERTVCwgYXRcclxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLCBhZ2FpbiBleGNsdWRpbmcgRFNULlxyXG5cdCAqXHJcblx0ICogSWYgdGhlIGxvY2FsIHRpbWVzdGFtcCBleGlzdHMgdHdpY2UgKGFzIGNhbiBvY2N1ciB2ZXJ5IHJhcmVseSBkdWUgdG8gem9uZSBjaGFuZ2VzKVxyXG5cdCAqIHRoZW4gdGhlIGZpcnN0IG9jY3VycmVuY2UgaXMgcmV0dXJuZWQuXHJcblx0ICpcclxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBsb2NhbE1pbGxpc1x0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHN0YW5kYXJkT2Zmc2V0TG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxNaWxsaXM6IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHZhciB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCArIHpvbmVJbmZvLmdtdG9mZi5taWxsaXNlY29uZHMoKSA+IGxvY2FsTWlsbGlzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvLmdtdG9mZi5jbG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0b3RhbCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCBpbmNsdWRpbmcgRFNULCBhdFxyXG5cdCAqIHRoZSBnaXZlbiBMT0NBTCB0aW1lc3RhbXAuIE5vbi1leGlzdGluZyBsb2NhbCB0aW1lIGlzIG5vcm1hbGl6ZWQgb3V0LlxyXG5cdCAqIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBVVEMgdGltZXMgYW5kIHRoZXJlZm9yZSBtdWx0aXBsZSBvZmZzZXRzIGZvciBhIGxvY2FsIHRpbWVcclxuXHQgKiBuYW1lbHkgZHVyaW5nIGEgYmFja3dhcmQgRFNUIGNoYW5nZS4gVGhpcyByZXR1cm5zIHRoZSBGSVJTVCBzdWNoIG9mZnNldC5cclxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBsb2NhbE1pbGxpc1x0VGltZXN0YW1wIGluIHRpbWUgem9uZSB0aW1lXHJcblx0ICovXHJcblx0cHVibGljIHRvdGFsT2Zmc2V0TG9jYWwoem9uZU5hbWU6IHN0cmluZywgbG9jYWxNaWxsaXM6IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHZhciBub3JtYWxpemVkOiBudW1iZXIgPSB0aGlzLm5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lLCBsb2NhbE1pbGxpcyk7XHJcblx0XHR2YXIgbm9ybWFsaXplZFRtOiBUaW1lU3RydWN0ID0gYmFzaWNzLnVuaXhUb1RpbWVOb0xlYXBTZWNzKG5vcm1hbGl6ZWQpO1xyXG5cclxuXHRcdC8vLyBOb3RlOiBkdXJpbmcgb2Zmc2V0IGNoYW5nZXMsIGxvY2FsIHRpbWUgY2FuIGJlaGF2ZSBsaWtlOlxyXG5cdFx0Ly8gZm9yd2FyZCBjaGFuZ2UgKDFoKTogICAwIDEgMyA0IDVcclxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgyaCk6ICAgMCAxIDQgNSA2XHJcblx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG5cdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgyaCk6ICAxIDIgMSAyIDMgIDwtLSBub3RlIHRpbWUgZ29pbmcgQkFDS1dBUkRcclxuXHJcblx0XHQvLyBUaGVyZWZvcmUgYmluYXJ5IHNlYXJjaCBkb2VzIG5vdCBhcHBseS4gTGluZWFyIHNlYXJjaCB0aHJvdWdoIHRyYW5zaXRpb25zXHJcblx0XHQvLyBhbmQgcmV0dXJuIHRoZSBmaXJzdCBvZmZzZXQgdGhhdCBtYXRjaGVzXHJcblxyXG5cdFx0dmFyIHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lLCBub3JtYWxpemVkVG0ueWVhciAtIDEsIG5vcm1hbGl6ZWRUbS55ZWFyICsgMSk7XHJcblx0XHR2YXIgcHJldjogVHJhbnNpdGlvbiA9IG51bGw7XHJcblx0XHR2YXIgcHJldlByZXY6IFRyYW5zaXRpb24gPSBudWxsO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCArIHRyYW5zaXRpb24ub2Zmc2V0Lm1pbGxpc2Vjb25kcygpID4gbm9ybWFsaXplZCkge1xyXG5cdFx0XHRcdC8vIGZvdW5kIG9mZnNldDogcHJldi5vZmZzZXQgYXBwbGllc1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHRcdHByZXZQcmV2ID0gcHJldjtcclxuXHRcdFx0cHJldiA9IHRyYW5zaXRpb247XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cclxuXHRcdGlmIChwcmV2KSB7XHJcblx0XHRcdC8vIHNwZWNpYWwgY2FyZSBkdXJpbmcgYmFja3dhcmQgY2hhbmdlOiB0YWtlIGZpcnN0IG9jY3VycmVuY2Ugb2YgbG9jYWwgdGltZVxyXG5cdFx0XHRpZiAocHJldlByZXYgJiYgcHJldlByZXYub2Zmc2V0LmdyZWF0ZXJUaGFuKHByZXYub2Zmc2V0KSkge1xyXG5cdFx0XHRcdC8vIGJhY2t3YXJkIGNoYW5nZVxyXG5cdFx0XHRcdHZhciBkaWZmID0gcHJldlByZXYub2Zmc2V0LnN1YihwcmV2Lm9mZnNldCk7XHJcblx0XHRcdFx0aWYgKG5vcm1hbGl6ZWQgPj0gcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpXHJcblx0XHRcdFx0XHQmJiBub3JtYWxpemVkIDwgcHJldi5hdCArIHByZXYub2Zmc2V0Lm1pbGxpc2Vjb25kcygpICsgZGlmZi5taWxsaXNlY29uZHMoKSkge1xyXG5cdFx0XHRcdFx0Ly8gd2l0aGluIGR1cGxpY2F0ZSByYW5nZVxyXG5cdFx0XHRcdFx0cmV0dXJuIHByZXZQcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gcHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRoaXMgY2Fubm90IGhhcHBlbiBhcyB0aGUgdHJhbnNpdGlvbnMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBjb250YWluIGEgdHJhbnNpdGlvbiBhdCB0aGVcclxuXHRcdFx0Ly8gYmVnaW5uaW5nIG9mIHRoZSByZXF1ZXN0ZWQgZnJvbVllYXJcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgRFNUIG9mZnNldCAoV0lUSE9VVCB0aGUgc3RhbmRhcmQgem9uZSBvZmZzZXQpIGZvciB0aGUgZ2l2ZW5cclxuXHQgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuXHQgKiBAcGFyYW0gdXRjTWlsbGlzXHRVVEMgdGltZXN0YW1wXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgZHN0T2Zmc2V0Rm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogRHVyYXRpb24ge1xyXG5cdFx0dmFyIHRtOiBUaW1lU3RydWN0ID0gYmFzaWNzLnVuaXhUb1RpbWVOb0xlYXBTZWNzKHV0Y01pbGxpcyk7XHJcblxyXG5cdFx0Ly8gZmluZCBhcHBsaWNhYmxlIHRyYW5zaXRpb24gbW9tZW50c1xyXG5cdFx0dmFyIHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZSwgdG0ueWVhciAtIDEsIHRtLnllYXIsIHN0YW5kYXJkT2Zmc2V0KTtcclxuXHJcblx0XHQvLyBmaW5kIHRoZSBsYXN0IHByaW9yIHRvIGdpdmVuIGRhdGVcclxuXHRcdHZhciBvZmZzZXQ6IER1cmF0aW9uID0gbnVsbDtcclxuXHRcdGZvciAodmFyIGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHR2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB1dGNNaWxsaXMpIHtcclxuXHRcdFx0XHRvZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIW9mZnNldCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBvZmZzZXQgZm91bmQuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBvZmZzZXQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSB0aW1lIHpvbmUgbGV0dGVyIGZvciB0aGUgZ2l2ZW5cclxuXHQgKiBydWxlc2V0IGFuZCB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHRuYW1lIG9mIHJ1bGVzZXRcclxuXHQgKiBAcGFyYW0gdXRjTWlsbGlzXHRVVEMgdGltZXN0YW1wXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKi9cclxuXHRwdWJsaWMgbGV0dGVyRm9yUnVsZShydWxlTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogc3RyaW5nIHtcclxuXHRcdHZhciB0bTogVGltZVN0cnVjdCA9IGJhc2ljcy51bml4VG9UaW1lTm9MZWFwU2Vjcyh1dGNNaWxsaXMpO1xyXG5cclxuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdHZhciB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWUsIHRtLnllYXIgLSAxLCB0bS55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcblx0XHR2YXIgbGV0dGVyOiBzdHJpbmcgPSBudWxsO1xyXG5cdFx0Zm9yICh2YXIgaSA9IHRyYW5zaXRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcblx0XHRcdHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdGlmICh0cmFuc2l0aW9uLmF0IDw9IHV0Y01pbGxpcykge1xyXG5cdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAobGV0dGVyID09PSBudWxsKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIG9mZnNldCBmb3VuZC5cIik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGxldHRlcjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBhIGxpc3Qgb2YgYWxsIHRyYW5zaXRpb25zIGluIFtmcm9tWWVhci4udG9ZZWFyXSBzb3J0ZWQgYnkgZWZmZWN0aXZlIGRhdGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiB0aGUgcnVsZSBzZXRcclxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdGZpcnN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byByZXR1cm4gdHJhbnNpdGlvbnMgZm9yXHJcblx0ICogQHBhcmFtIHN0YW5kYXJkT2Zmc2V0XHRTdGFuZGFyZCBvZmZzZXQgd2l0aG91dCBEU1QgZm9yIHRoZSB0aW1lIHpvbmVcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4gVHJhbnNpdGlvbnMsIHdpdGggRFNUIG9mZnNldHMgKG5vIHN0YW5kYXJkIG9mZnNldCBpbmNsdWRlZClcclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyLCBzdGFuZGFyZE9mZnNldDogRHVyYXRpb24pOiBUcmFuc2l0aW9uW10ge1xyXG5cdFx0YXNzZXJ0KGZyb21ZZWFyIDw9IHRvWWVhciwgXCJmcm9tWWVhciBtdXN0IGJlIDw9IHRvWWVhclwiKTtcclxuXHJcblx0XHR2YXIgcnVsZUluZm9zOiBSdWxlSW5mb1tdID0gdGhpcy5nZXRSdWxlSW5mb3MocnVsZU5hbWUpO1xyXG5cdFx0dmFyIHJlc3VsdDogVHJhbnNpdGlvbltdID0gW107XHJcblxyXG5cdFx0Zm9yICh2YXIgeSA9IGZyb21ZZWFyOyB5IDw9IHRvWWVhcjsgeSsrKSB7XHJcblx0XHRcdHZhciBwcmV2SW5mbzogUnVsZUluZm8gPSBudWxsO1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVJbmZvcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdHZhciBydWxlSW5mbzogUnVsZUluZm8gPSBydWxlSW5mb3NbaV07XHJcblx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUoeSkpIHtcclxuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby50cmFuc2l0aW9uVGltZVV0Yyh5LCBzdGFuZGFyZE9mZnNldCwgcHJldkluZm8pLFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby5zYXZlLFxyXG5cdFx0XHRcdFx0XHRydWxlSW5mby5sZXR0ZXIpKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cHJldkluZm8gPSBydWxlSW5mbztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIGJvdGggem9uZSBhbmQgcnVsZSBjaGFuZ2VzIGFzIHRvdGFsIChzdGQgKyBkc3QpIG9mZnNldHMuXHJcblx0ICogQWRkcyBhbiBpbml0aWFsIHRyYW5zaXRpb24gaWYgdGhlcmUgaXMgbm8gem9uZSBjaGFuZ2Ugd2l0aGluIHRoZSByYW5nZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gZnJvbVllYXJcdEZpcnN0IHllYXIgdG8gaW5jbHVkZVxyXG5cdCAqIEBwYXJhbSB0b1llYXJcdExhc3QgeWVhciB0byBpbmNsdWRlXHJcblx0ICovXHJcblx0cHVibGljIGdldFRyYW5zaXRpb25zVG90YWxPZmZzZXRzKHpvbmVOYW1lOiBzdHJpbmcsIGZyb21ZZWFyOiBudW1iZXIsIHRvWWVhcjogbnVtYmVyKTogVHJhbnNpdGlvbltdIHtcclxuXHRcdGFzc2VydChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcblxyXG5cdFx0dmFyIHN0YXJ0TWlsbGlzOiBudW1iZXIgPSBiYXNpY3MudGltZVRvVW5peE5vTGVhcFNlY3MoZnJvbVllYXIpO1xyXG5cdFx0dmFyIGVuZE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKHRvWWVhciArIDEpO1xyXG5cclxuXHJcblx0XHR2YXIgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0YXNzZXJ0KHpvbmVJbmZvcy5sZW5ndGggPiAwLCBcIkVtcHR5IHpvbmVJbmZvcyBhcnJheSByZXR1cm5lZCBmcm9tIGdldFpvbmVJbmZvcygpXCIpO1xyXG5cclxuXHRcdHZhciByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cclxuXHRcdHZhciBwcmV2Wm9uZTogWm9uZUluZm8gPSBudWxsO1xyXG5cdFx0dmFyIHByZXZVbnRpbFRtOiBUaW1lU3RydWN0ID0gbnVsbDtcclxuXHRcdHZhciBwcmV2U3RkT2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0dmFyIHByZXZEc3RPZmZzZXQ6IER1cmF0aW9uID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHR2YXIgcHJldkxldHRlcjogc3RyaW5nID0gXCJcIjtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0dmFyIHVudGlsVG06IFRpbWVTdHJ1Y3QgPSAoem9uZUluZm8udW50aWwgPyBiYXNpY3MudW5peFRvVGltZU5vTGVhcFNlY3Moem9uZUluZm8udW50aWwpIDogbmV3IFRpbWVTdHJ1Y3QodG9ZZWFyICsgMSkpO1xyXG5cdFx0XHR2YXIgc3RkT2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZTdGRPZmZzZXQ7XHJcblx0XHRcdHZhciBkc3RPZmZzZXQ6IER1cmF0aW9uID0gcHJldkRzdE9mZnNldDtcclxuXHRcdFx0dmFyIGxldHRlcjogc3RyaW5nID0gcHJldkxldHRlcjtcclxuXHJcblx0XHRcdC8vIHpvbmUgYXBwbGljYWJsZT9cclxuXHRcdFx0aWYgKChwcmV2Wm9uZSA9PT0gbnVsbCB8fCBwcmV2Wm9uZS51bnRpbCA8IGVuZE1pbGxpcyAtIDEpXHJcblx0XHRcdFx0JiYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID49IHN0YXJ0TWlsbGlzKSkge1xyXG5cclxuXHRcdFx0XHRzdGRPZmZzZXQgPSB6b25lSW5mby5nbXRvZmY7XHJcblxyXG5cdFx0XHRcdHN3aXRjaCAoem9uZUluZm8ucnVsZVR5cGUpIHtcclxuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZTpcclxuXHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5PZmZzZXQ6XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZTpcclxuXHRcdFx0XHRcdFx0Ly8gY2hlY2sgd2hldGhlciB0aGUgZmlyc3QgcnVsZSB0YWtlcyBlZmZlY3QgaW1tZWRpYXRlbHkgb24gdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdFx0XHQvLyAoZS5nLiBMeWJpYSlcclxuXHRcdFx0XHRcdFx0aWYgKHByZXZab25lKSB7XHJcblx0XHRcdFx0XHRcdFx0dmFyIHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdFx0XHRydWxlSW5mb3MuZm9yRWFjaCgocnVsZUluZm86IFJ1bGVJbmZvKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8uYXBwbGljYWJsZShwcmV2VW50aWxUbS55ZWFyKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMocHJldlVudGlsVG0ueWVhciwgc3RkT2Zmc2V0LCBudWxsKSA9PT0gcHJldlpvbmUudW50aWwpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSBydWxlSW5mby5zYXZlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldHRlciA9IHJ1bGVJbmZvLmxldHRlcjtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gYWRkIGEgdHJhbnNpdGlvbiBmb3IgdGhlIHpvbmUgdHJhbnNpdGlvblxyXG5cdFx0XHRcdHZhciBhdDogbnVtYmVyID0gKHByZXZab25lID8gcHJldlpvbmUudW50aWwgOiBzdGFydE1pbGxpcyk7XHJcblx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24oYXQsIHN0ZE9mZnNldC5hZGQoZHN0T2Zmc2V0KSwgbGV0dGVyKSk7XHJcblxyXG5cdFx0XHRcdC8vIGFkZCB0cmFuc2l0aW9ucyBmb3IgdGhlIHpvbmUgcnVsZXMgaW4gdGhlIHJhbmdlXHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSkge1xyXG5cdFx0XHRcdFx0dmFyIGRzdFRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSB0aGlzLmdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhcclxuXHRcdFx0XHRcdFx0em9uZUluZm8ucnVsZU5hbWUsXHJcblx0XHRcdFx0XHRcdHByZXZVbnRpbFRtID8gTWF0aC5tYXgocHJldlVudGlsVG0ueWVhciwgZnJvbVllYXIpIDogZnJvbVllYXIsXHJcblx0XHRcdFx0XHRcdE1hdGgubWluKHVudGlsVG0ueWVhciwgdG9ZZWFyKSwgc3RkT2Zmc2V0KTtcclxuXHRcdFx0XHRcdGRzdFRyYW5zaXRpb25zLmZvckVhY2goKHRyYW5zaXRpb246IFRyYW5zaXRpb24pOiB2b2lkID0+IHtcclxuXHRcdFx0XHRcdFx0bGV0dGVyID0gdHJhbnNpdGlvbi5sZXR0ZXI7XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IHRyYW5zaXRpb24ub2Zmc2V0O1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbih0cmFuc2l0aW9uLmF0LCB0cmFuc2l0aW9uLm9mZnNldC5hZGQoc3RkT2Zmc2V0KSwgdHJhbnNpdGlvbi5sZXR0ZXIpKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldlpvbmUgPSB6b25lSW5mbztcclxuXHRcdFx0cHJldlVudGlsVG0gPSB1bnRpbFRtO1xyXG5cdFx0XHRwcmV2U3RkT2Zmc2V0ID0gc3RkT2Zmc2V0O1xyXG5cdFx0XHRwcmV2RHN0T2Zmc2V0ID0gZHN0T2Zmc2V0O1xyXG5cdFx0XHRwcmV2TGV0dGVyID0gbGV0dGVyO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBUcmFuc2l0aW9uLCBiOiBUcmFuc2l0aW9uKTogbnVtYmVyID0+IHtcclxuXHRcdFx0cmV0dXJuIGEuYXQgLSBiLmF0O1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSB6b25lIGluZm8gZm9yIHRoZSBnaXZlbiBVVEMgdGltZXN0YW1wLiBUaHJvd3MgaWYgbm90IGZvdW5kLlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNNaWxsaXNcdFVUQyB0aW1lIHN0YW1wXHJcblx0ICogQHJldHVybnNcdFpvbmVJbmZvIG9iamVjdC4gRG8gbm90IGNoYW5nZSwgd2UgY2FjaGUgdGhpcyBvYmplY3QuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvKHpvbmVOYW1lOiBzdHJpbmcsIHV0Y01pbGxpczogbnVtYmVyKTogWm9uZUluZm8ge1xyXG5cdFx0dmFyIHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgem9uZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHZhciB6b25lSW5mbyA9IHpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gdXRjTWlsbGlzKSB7XHJcblx0XHRcdFx0cmV0dXJuIHpvbmVJbmZvO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyB6b25lIGluZm8gZm91bmRcIik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQZXJmb3JtYW5jZSBpbXByb3ZlbWVudDogem9uZSBpbmZvIGNhY2hlXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfem9uZUluZm9DYWNoZTogeyBbaW5kZXg6IHN0cmluZ106IFpvbmVJbmZvW10gfSA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gdGhlIHpvbmUgcmVjb3JkcyBmb3IgYSBnaXZlbiB6b25lIG5hbWUsIGFmdGVyXHJcblx0ICogZm9sbG93aW5nIGFueSBsaW5rcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB6b25lIG5hbWUgbGlrZSBcIlBhY2lmaWMvRWZhdGVcIlxyXG5cdCAqIEByZXR1cm4gQXJyYXkgb2Ygem9uZSBpbmZvcy4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0Wm9uZUluZm9zKHpvbmVOYW1lOiBzdHJpbmcpOiBab25lSW5mb1tdIHtcclxuXHRcdC8vIEZJUlNUIHZhbGlkYXRlIHpvbmUgbmFtZSBiZWZvcmUgc2VhcmNoaW5nIGNhY2hlXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gVGFrZSBmcm9tIGNhY2hlXHJcblx0XHRpZiAodGhpcy5fem9uZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciByZXN1bHQ6IFpvbmVJbmZvW10gPSBbXTtcclxuXHRcdHZhciBhY3R1YWxab25lTmFtZTogc3RyaW5nID0gem9uZU5hbWU7XHJcblx0XHR2YXIgem9uZUVudHJpZXM6IGFueSA9IHRoaXMuX2RhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0Ly8gZm9sbG93IGxpbmtzXHJcblx0XHR3aGlsZSAodHlwZW9mICh6b25lRW50cmllcykgPT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmICghdGhpcy5fZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lRW50cmllcykpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJab25lIFxcXCJcIiArIHpvbmVFbnRyaWVzICsgXCJcXFwiIG5vdCBmb3VuZCAocmVmZXJyZWQgdG8gaW4gbGluayBmcm9tIFxcXCJcIlxyXG5cdFx0XHRcdFx0KyB6b25lTmFtZSArIFwiXFxcIiB2aWEgXFxcIlwiICsgYWN0dWFsWm9uZU5hbWUgKyBcIlxcXCJcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0YWN0dWFsWm9uZU5hbWUgPSB6b25lRW50cmllcztcclxuXHRcdFx0em9uZUVudHJpZXMgPSB0aGlzLl9kYXRhLnpvbmVzW2FjdHVhbFpvbmVOYW1lXTtcclxuXHRcdH1cclxuXHRcdC8vIGZpbmFsIHpvbmUgaW5mbyBmb3VuZFxyXG5cdFx0Zm9yICh2YXIgaTogbnVtYmVyID0gMDsgaSA8IHpvbmVFbnRyaWVzLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHZhciB6b25lRW50cnkgPSB6b25lRW50cmllc1tpXTtcclxuXHRcdFx0dmFyIHJ1bGVUeXBlOiBSdWxlVHlwZSA9IHRoaXMucGFyc2VSdWxlVHlwZSh6b25lRW50cnlbMV0pO1xyXG5cdFx0XHR2YXIgdW50aWw6IG51bWJlciA9IG1hdGguZmlsdGVyRmxvYXQoem9uZUVudHJ5WzNdKTtcclxuXHRcdFx0aWYgKGlzTmFOKHVudGlsKSkge1xyXG5cdFx0XHRcdHVudGlsID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFpvbmVJbmZvKFxyXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMoLTEgKiBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVswXSkpLFxyXG5cdFx0XHRcdHJ1bGVUeXBlLFxyXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQgPyBuZXcgRHVyYXRpb24oem9uZUVudHJ5WzFdKSA6IG5ldyBEdXJhdGlvbigpLFxyXG5cdFx0XHRcdHJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZSA/IHpvbmVFbnRyeVsxXSA6IFwiXCIsXHJcblx0XHRcdFx0em9uZUVudHJ5WzJdLFxyXG5cdFx0XHRcdHVudGlsXHJcblx0XHRcdCkpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBab25lSW5mbywgYjogWm9uZUluZm8pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHQvLyBzb3J0IG51bGwgbGFzdFxyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKGEudW50aWwgPT09IG51bGwgJiYgYi51bnRpbCA9PT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhLnVudGlsICE9PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGEudW50aWwgPT09IG51bGwgJiYgYi51bnRpbCAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAoYS51bnRpbCAtIGIudW50aWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5fem9uZUluZm9DYWNoZVt6b25lTmFtZV0gPSByZXN1bHQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHJ1bGUgaW5mbyBjYWNoZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3J1bGVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBSdWxlSW5mb1tdIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgcnVsZSBzZXQgd2l0aCB0aGUgZ2l2ZW4gcnVsZSBuYW1lLFxyXG5cdCAqIHNvcnRlZCBieSBmaXJzdCBlZmZlY3RpdmUgZGF0ZSAodW5jb21wZW5zYXRlZCBmb3IgXCJ3XCIgb3IgXCJzXCIgQXRUaW1lKVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHJ1bGVOYW1lXHROYW1lIG9mIHJ1bGUgc2V0XHJcblx0ICogQHJldHVybiBSdWxlSW5mbyBhcnJheS4gRG8gbm90IGNoYW5nZSwgdGhpcyBpcyBhIGNhY2hlZCB2YWx1ZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgZ2V0UnVsZUluZm9zKHJ1bGVOYW1lOiBzdHJpbmcpOiBSdWxlSW5mb1tdIHtcclxuXHRcdC8vIHZhbGlkYXRlIG5hbWUgQkVGT1JFIHNlYXJjaGluZyBjYWNoZVxyXG5cdFx0aWYgKCF0aGlzLl9kYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIHNldCBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBub3QgZm91bmQuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHJldHVybiBmcm9tIGNhY2hlXHJcblx0XHRpZiAodGhpcy5fcnVsZUluZm9DYWNoZS5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciByZXN1bHQ6IFJ1bGVJbmZvW10gPSBbXTtcclxuXHRcdHZhciBydWxlU2V0ID0gdGhpcy5fZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVTZXQubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0dmFyIHJ1bGUgPSBydWxlU2V0W2ldO1xyXG5cclxuXHRcdFx0dmFyIGZyb21ZZWFyOiBudW1iZXIgPSAocnVsZVswXSA9PT0gXCJOYU5cIiA/IC0xMDAwMCA6IHBhcnNlSW50KHJ1bGVbMF0sIDEwKSk7XHJcblx0XHRcdHZhciB0b1R5cGU6IFRvVHlwZSA9IHRoaXMucGFyc2VUb1R5cGUocnVsZVsxXSk7XHJcblx0XHRcdHZhciB0b1llYXI6IG51bWJlciA9ICh0b1R5cGUgPT09IFRvVHlwZS5NYXggPyAwIDogKHJ1bGVbMV0gPT09IFwib25seVwiID8gZnJvbVllYXIgOiBwYXJzZUludChydWxlWzFdLCAxMCkpKTtcclxuXHRcdFx0dmFyIG9uVHlwZTogT25UeXBlID0gdGhpcy5wYXJzZU9uVHlwZShydWxlWzRdKTtcclxuXHRcdFx0dmFyIG9uRGF5OiBudW1iZXIgPSB0aGlzLnBhcnNlT25EYXkocnVsZVs0XSwgb25UeXBlKTtcclxuXHRcdFx0dmFyIG9uV2Vla0RheTogV2Vla0RheSA9IHRoaXMucGFyc2VPbldlZWtEYXkocnVsZVs0XSk7XHJcblx0XHRcdHZhciBtb250aE5hbWU6IHN0cmluZyA9IDxzdHJpbmc+cnVsZVszXTtcclxuXHRcdFx0dmFyIG1vbnRoTnVtYmVyOiBudW1iZXIgPSBtb250aE5hbWVUb1N0cmluZyhtb250aE5hbWUpO1xyXG5cclxuXHRcdFx0cmVzdWx0LnB1c2gobmV3IFJ1bGVJbmZvKFxyXG5cdFx0XHRcdGZyb21ZZWFyLFxyXG5cdFx0XHRcdHRvVHlwZSxcclxuXHRcdFx0XHR0b1llYXIsXHJcblx0XHRcdFx0cnVsZVsyXSxcclxuXHRcdFx0XHRtb250aE51bWJlcixcclxuXHRcdFx0XHRvblR5cGUsXHJcblx0XHRcdFx0b25EYXksXHJcblx0XHRcdFx0b25XZWVrRGF5LFxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVswXSwgMTApLCAyNCksIC8vIG5vdGUgdGhlIGRhdGFiYXNlIHNvbWV0aW1lcyBjb250YWlucyBcIjI0XCIgYXMgaG91ciB2YWx1ZVxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApLCA2MCksXHJcblx0XHRcdFx0bWF0aC5wb3NpdGl2ZU1vZHVsbyhwYXJzZUludChydWxlWzVdWzJdLCAxMCksIDYwKSxcclxuXHRcdFx0XHR0aGlzLnBhcnNlQXRUeXBlKHJ1bGVbNV1bM10pLFxyXG5cdFx0XHRcdER1cmF0aW9uLm1pbnV0ZXMocGFyc2VJbnQocnVsZVs2XSwgMTApKSxcclxuXHRcdFx0XHRydWxlWzddID09PSBcIi1cIiA/IFwiXCIgOiBydWxlWzddXHJcblx0XHRcdFx0KSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdHJlc3VsdC5zb3J0KChhOiBSdWxlSW5mbywgYjogUnVsZUluZm8pOiBudW1iZXIgPT4ge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKGEuZWZmZWN0aXZlRXF1YWwoYikpIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fSBlbHNlIGlmIChhLmVmZmVjdGl2ZUxlc3MoYikpIHtcclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIDE7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX3J1bGVJbmZvQ2FjaGVbcnVsZU5hbWVdID0gcmVzdWx0O1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBSVUxFUyBjb2x1bW4gb2YgYSB6b25lIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VSdWxlVHlwZShydWxlOiBzdHJpbmcpOiBSdWxlVHlwZSB7XHJcblx0XHRpZiAocnVsZSA9PT0gXCItXCIpIHtcclxuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk5vbmU7XHJcblx0XHR9IGVsc2UgaWYgKGlzVmFsaWRPZmZzZXRTdHJpbmcocnVsZSkpIHtcclxuXHRcdFx0cmV0dXJuIFJ1bGVUeXBlLk9mZnNldDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5SdWxlTmFtZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBUTyBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VUb1R5cGUodG86IHN0cmluZyk6IFRvVHlwZSB7XHJcblx0XHRpZiAodG8gPT09IFwibWF4XCIpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5NYXg7XHJcblx0XHR9IGVsc2UgaWYgKHRvID09PSBcIm9ubHlcIikge1xyXG5cdFx0XHRyZXR1cm4gVG9UeXBlLlllYXI7IC8vIHllcyB3ZSByZXR1cm4gWWVhciBmb3Igb25seVxyXG5cdFx0fSBlbHNlIGlmICghaXNOYU4ocGFyc2VJbnQodG8sIDEwKSkpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVE8gY29sdW1uIGluY29ycmVjdDogXCIgKyB0byk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBPTiBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VPblR5cGUob246IHN0cmluZyk6IE9uVHlwZSB7XHJcblx0XHRpZiAob24ubGVuZ3RoID4gNCAmJiBvbi5zdWJzdHIoMCwgNCkgPT09IFwibGFzdFwiKSB7XHJcblx0XHRcdHJldHVybiBPblR5cGUuTGFzdFg7XHJcblx0XHR9XHJcblx0XHRpZiAob24uaW5kZXhPZihcIjw9XCIpICE9PSAtMSkge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkxlcVg7XHJcblx0XHR9XHJcblx0XHRpZiAob24uaW5kZXhPZihcIj49XCIpICE9PSAtMSkge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkdyZXFYO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIE9uVHlwZS5EYXlOdW07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGRheSBudW1iZXIgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCAwIGlmIG5vIGRheS5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VPbkRheShvbjogc3RyaW5nLCBvblR5cGU6IE9uVHlwZSk6IG51bWJlciB7XHJcblx0XHRzd2l0Y2ggKG9uVHlwZSkge1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5EYXlOdW06IHJldHVybiBwYXJzZUludChvbiwgMTApO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5MZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI8PVwiKSArIDIpLCAxMCk7XHJcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiByZXR1cm4gcGFyc2VJbnQob24uc3Vic3RyKG9uLmluZGV4T2YoXCI+PVwiKSArIDIpLCAxMCk7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBkYXktb2Ytd2VlayBmcm9tIGFuIE9OIGNvbHVtbiBzdHJpbmcsIFN1bmRheSBpZiBub3QgcHJlc2VudC5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VPbldlZWtEYXkob246IHN0cmluZyk6IFdlZWtEYXkge1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuXHRcdFx0aWYgKG9uLmluZGV4T2YoVHpEYXlOYW1lc1tpXSkgIT09IC0xKSB7XHJcblx0XHRcdFx0cmV0dXJuIDxXZWVrRGF5Pmk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdHJldHVybiBXZWVrRGF5LlN1bmRheTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIHRoZSBBVCBjb2x1bW4gb2YgYSBydWxlIGluZm8gZW50cnlcclxuXHQgKiBhbmQgc2VlIHdoYXQga2luZCBvZiBlbnRyeSBpdCBpcy5cclxuXHQgKi9cclxuXHRwdWJsaWMgcGFyc2VBdFR5cGUoYXQ6IGFueSk6IEF0VHlwZSB7XHJcblx0XHRzd2l0Y2ggKGF0KSB7XHJcblx0XHRcdGNhc2UgXCJzXCI6IHJldHVybiBBdFR5cGUuU3RhbmRhcmQ7XHJcblx0XHRcdGNhc2UgXCJ1XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwiZ1wiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcInpcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJ3XCI6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0Y2FzZSBcIlwiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGNhc2UgbnVsbDogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG5cclxuaW50ZXJmYWNlIE1pbk1heEluZm8ge1xyXG5cdG1pbkRzdFNhdmU6IG51bWJlcjtcclxuXHRtYXhEc3RTYXZlOiBudW1iZXI7XHJcblx0bWluR210T2ZmOiBudW1iZXI7XHJcblx0bWF4R210T2ZmOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYW5pdHkgY2hlY2sgb24gZGF0YS4gUmV0dXJucyBtaW4vbWF4IHZhbHVlcy5cclxuICovXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRGF0YShkYXRhOiBhbnkpOiBNaW5NYXhJbmZvIHtcclxuXHR2YXIgaTogbnVtYmVyO1xyXG5cdHZhciByZXN1bHQ6IE1pbk1heEluZm8gPSB7XHJcblx0XHRtaW5Ec3RTYXZlOiBudWxsLFxyXG5cdFx0bWF4RHN0U2F2ZTogbnVsbCxcclxuXHRcdG1pbkdtdE9mZjogbnVsbCxcclxuXHRcdG1heEdtdE9mZjogbnVsbFxyXG5cdH07XHJcblxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICh0eXBlb2YoZGF0YSkgIT09IFwib2JqZWN0XCIpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaXMgbm90IGFuIG9iamVjdFwiKTtcclxuXHR9XHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwicnVsZXNcIikpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHJ1bGVzIHByb3BlcnR5XCIpO1xyXG5cdH1cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAoIWRhdGEuaGFzT3duUHJvcGVydHkoXCJ6b25lc1wiKSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiZGF0YSBoYXMgbm8gem9uZXMgcHJvcGVydHlcIik7XHJcblx0fVxyXG5cclxuXHQvLyB2YWxpZGF0ZSB6b25lc1xyXG5cdGZvciAodmFyIHpvbmVOYW1lIGluIGRhdGEuem9uZXMpIHtcclxuXHRcdGlmIChkYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKSkge1xyXG5cdFx0XHR2YXIgem9uZUFycjogYW55ID0gZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHRcdGlmICh0eXBlb2YgKHpvbmVBcnIpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0Ly8gb2ssIGlzIGxpbmsgdG8gb3RoZXIgem9uZSwgY2hlY2sgbGlua1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSg8c3RyaW5nPnpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBsaW5rcyB0byBcXFwiXCIgKyA8c3RyaW5nPnpvbmVBcnIgKyBcIlxcXCIgYnV0IHRoYXQgZG9lc25cXCd0IGV4aXN0XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoem9uZUFycikpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgem9uZUFyci5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIGVudHJ5OiBhbnkgPSB6b25lQXJyW2ldO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZW50cnkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmIChlbnRyeS5sZW5ndGggIT09IDQpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGhhcyBsZW5ndGggIT0gNFwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVswXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZmlyc3QgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBnbXRvZmYgPSBtYXRoLmZpbHRlckZsb2F0KGVudHJ5WzBdKTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKGlzTmFOKGdtdG9mZikpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzFdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBzZWNvbmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsyXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgdGhpcmQgY29sdW1uIGlzIG5vdCBhIHN0cmluZ1wiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVszXSAhPT0gXCJzdHJpbmdcIiAmJiBlbnRyeVszXSAhPT0gbnVsbCkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBpcyBub3QgYSBzdHJpbmcgbm9yIG51bGxcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gPT09IFwic3RyaW5nXCIgJiYgaXNOYU4obWF0aC5maWx0ZXJGbG9hdChlbnRyeVszXSkpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmb3VydGggY29sdW1uIGRvZXMgbm90IGNvbnRhaW4gYSBudW1iZXJcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heEdtdE9mZiA9PT0gbnVsbCB8fCBnbXRvZmYgPiByZXN1bHQubWF4R210T2ZmKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5tYXhHbXRPZmYgPSBnbXRvZmY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkdtdE9mZiA9PT0gbnVsbCB8fCBnbXRvZmYgPCByZXN1bHQubWluR210T2ZmKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5HbXRPZmYgPSBnbXRvZmY7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyB2YWxpZGF0ZSBydWxlc1xyXG5cdGZvciAodmFyIHJ1bGVOYW1lIGluIGRhdGEucnVsZXMpIHtcclxuXHRcdGlmIChkYXRhLnJ1bGVzLmhhc093blByb3BlcnR5KHJ1bGVOYW1lKSkge1xyXG5cdFx0XHR2YXIgcnVsZUFycjogYW55ID0gZGF0YS5ydWxlc1tydWxlTmFtZV07XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZUFycikpIHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3IgcnVsZSBcXFwiXCIgKyBydWxlTmFtZSArIFwiXFxcIiBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yIChpID0gMDsgaSA8IHJ1bGVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR2YXIgcnVsZSA9IHJ1bGVBcnJbaV07XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocnVsZSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlLmxlbmd0aCA8IDgpIHsgLy8gbm90ZSBzb21lIHJ1bGVzID4gOCBleGlzdHMgYnV0IHRoYXQgc2VlbXMgdG8gYmUgYSBidWcgaW4gdHogZmlsZSBwYXJzaW5nXHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBvZiBsZW5ndGggOFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBydWxlLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmIChqICE9PSA1ICYmIHR5cGVvZiBydWxlW2pdICE9PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bXCIgKyBqLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzBdICE9PSBcIk5hTlwiICYmIGlzTmFOKHBhcnNlSW50KHJ1bGVbMF0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVsxXSAhPT0gXCJvbmx5XCIgJiYgcnVsZVsxXSAhPT0gXCJtYXhcIiAmJiBpc05hTihwYXJzZUludChydWxlWzFdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzFdIGlzIG5vdCBhIG51bWJlciwgb25seSBvciBtYXhcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghVHpNb250aE5hbWVzLmhhc093blByb3BlcnR5KHJ1bGVbM10pKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzNdIGlzIG5vdCBhIG1vbnRoIG5hbWVcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzRdLnN1YnN0cigwLCA0KSAhPT0gXCJsYXN0XCIgJiYgcnVsZVs0XS5pbmRleE9mKFwiPj1cIikgPT09IC0xXHJcblx0XHRcdFx0ICYmIHJ1bGVbNF0uaW5kZXhPZihcIjw9XCIpID09PSAtMSAmJiBpc05hTihwYXJzZUludChydWxlWzRdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzRdIGlzIG5vdCBhIGtub3duIHR5cGUgb2YgZXhwcmVzc2lvblwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVbNV0pKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV0ubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdIGlzIG5vdCBvZiBsZW5ndGggNFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMF0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsxXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsxXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzJdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzJdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbNV1bM10gIT09IFwiXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJzXCIgJiYgcnVsZVs1XVszXSAhPT0gXCJ3XCJcclxuXHRcdFx0XHRcdCYmIHJ1bGVbNV1bM10gIT09IFwiZ1wiICYmIHJ1bGVbNV1bM10gIT09IFwidVwiICYmIHJ1bGVbNV1bM10gIT09IFwielwiICYmIHJ1bGVbNV1bM10gIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bM10gaXMgbm90IGVtcHR5LCBnLCB6LCBzLCB3LCB1IG9yIG51bGxcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHZhciBzYXZlOiBudW1iZXIgPSBwYXJzZUludChydWxlWzZdLCAxMCk7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHNhdmUpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzZdIGRvZXMgbm90IGNvbnRhaW4gYSB2YWxpZCBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChzYXZlICE9PSAwKSB7XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1heERzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA+IHJlc3VsdC5tYXhEc3RTYXZlKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5tYXhEc3RTYXZlID0gc2F2ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGlmIChyZXN1bHQubWluRHN0U2F2ZSA9PT0gbnVsbCB8fCBzYXZlIDwgcmVzdWx0Lm1pbkRzdFNhdmUpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0Lm1pbkRzdFNhdmUgPSBzYXZlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
