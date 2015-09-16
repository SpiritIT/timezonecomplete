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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90ei1kYXRhYmFzZS50cyJdLCJuYW1lcyI6WyJUb1R5cGUiLCJPblR5cGUiLCJBdFR5cGUiLCJSdWxlSW5mbyIsIlJ1bGVJbmZvLmNvbnN0cnVjdG9yIiwiUnVsZUluZm8uYXBwbGljYWJsZSIsIlJ1bGVJbmZvLmVmZmVjdGl2ZUxlc3MiLCJSdWxlSW5mby5lZmZlY3RpdmVFcXVhbCIsIlJ1bGVJbmZvLmVmZmVjdGl2ZURhdGUiLCJSdWxlSW5mby50cmFuc2l0aW9uVGltZVV0YyIsIlJ1bGVUeXBlIiwiWm9uZUluZm8iLCJab25lSW5mby5jb25zdHJ1Y3RvciIsIlR6TW9udGhOYW1lcyIsIm1vbnRoTmFtZVRvU3RyaW5nIiwiVHpEYXlOYW1lcyIsImlzVmFsaWRPZmZzZXRTdHJpbmciLCJUcmFuc2l0aW9uIiwiVHJhbnNpdGlvbi5jb25zdHJ1Y3RvciIsIk5vcm1hbGl6ZU9wdGlvbiIsIlR6RGF0YWJhc2UiLCJUekRhdGFiYXNlLmNvbnN0cnVjdG9yIiwiVHpEYXRhYmFzZS5pbnN0YW5jZSIsIlR6RGF0YWJhc2UuaW5qZWN0IiwiVHpEYXRhYmFzZS56b25lTmFtZXMiLCJUekRhdGFiYXNlLmV4aXN0cyIsIlR6RGF0YWJhc2UubWluRHN0U2F2ZSIsIlR6RGF0YWJhc2UubWF4RHN0U2F2ZSIsIlR6RGF0YWJhc2UuaGFzRHN0IiwiVHpEYXRhYmFzZS5uZXh0RHN0Q2hhbmdlIiwiVHpEYXRhYmFzZS56b25lSXNVdGMiLCJUekRhdGFiYXNlLm5vcm1hbGl6ZUxvY2FsIiwiVHpEYXRhYmFzZS5zdGFuZGFyZE9mZnNldCIsIlR6RGF0YWJhc2UudG90YWxPZmZzZXQiLCJUekRhdGFiYXNlLmFiYnJldmlhdGlvbiIsIlR6RGF0YWJhc2Uuc3RhbmRhcmRPZmZzZXRMb2NhbCIsIlR6RGF0YWJhc2UudG90YWxPZmZzZXRMb2NhbCIsIlR6RGF0YWJhc2UuZHN0T2Zmc2V0Rm9yUnVsZSIsIlR6RGF0YWJhc2UubGV0dGVyRm9yUnVsZSIsIlR6RGF0YWJhc2UuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzIiwiVHpEYXRhYmFzZS5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyIsIlR6RGF0YWJhc2UuZ2V0Wm9uZUluZm8iLCJUekRhdGFiYXNlLmdldFpvbmVJbmZvcyIsIlR6RGF0YWJhc2UuZ2V0UnVsZUluZm9zIiwiVHpEYXRhYmFzZS5wYXJzZVJ1bGVUeXBlIiwiVHpEYXRhYmFzZS5wYXJzZVRvVHlwZSIsIlR6RGF0YWJhc2UucGFyc2VPblR5cGUiLCJUekRhdGFiYXNlLnBhcnNlT25EYXkiLCJUekRhdGFiYXNlLnBhcnNlT25XZWVrRGF5IiwiVHpEYXRhYmFzZS5wYXJzZUF0VHlwZSIsInZhbGlkYXRlRGF0YSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsQUFFQSwyQ0FGMkM7QUFFM0MsWUFBWSxDQUFDO0FBRWIsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFDbEMsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFFOUIsSUFBTyxNQUFNLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDcEMsSUFBTyxRQUFRLFdBQVcsWUFBWSxDQUFDLENBQUM7QUFDeEMsSUFBTyxJQUFJLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFFaEMsQUFDQSxvQkFEb0I7SUFDaEIsSUFBSSxHQUFRLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2hELEFBRUEsbUJBRm1CO0FBRW5CLElBQU8sUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDcEMsSUFBTyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUN0QyxJQUFPLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBR2hDLEFBR0E7O0dBREc7QUFDSCxXQUFZLE1BQU07SUFDakJBLEFBR0FBOztPQURHQTtJQUNIQSxtQ0FBSUEsQ0FBQUE7SUFDSkEsQUFHQUE7O09BREdBO0lBQ0hBLGlDQUFHQSxDQUFBQTtBQUNKQSxDQUFDQSxFQVRXLGNBQU0sS0FBTixjQUFNLFFBU2pCO0FBVEQs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ckJBLEtBQUtBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1lBQzdCQSxLQUFLQSxNQUFNQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNoREEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFREY7OztPQUdHQTtJQUNJQSxnQ0FBYUEsR0FBcEJBLFVBQXFCQSxLQUFlQTtRQUNuQ0csRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2JBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lB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QTtZQUMxQ0EsUUFBUUEsR0FBR0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLElBQUlBLElBQUlBLE9BQU9BLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEtBQUtBLElBQUlBLElBQUlBLFFBQVFBLENBQUNBLEtBQUtBLEdBQUdBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxR0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUNsQ0EsQ0FBQ0E7WUFDREEsT0FBT0EsR0FBR0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDMUJBLENBQUNBO1FBRURBLEFBQ0FBLG9EQURvREE7WUFDaERBLFdBQVdBLEdBQWlCQSxFQUFFQSxDQUFDQTtRQUNuQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsaUJBQWlCQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUMvQ0EsUUFBUUEsR0FBR0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsQUFDQUEscUNBRHFDQTtZQUNyQ0EsV0FBV0EsR0FBR0EsV0FBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxFQUFFQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvSEEsQ0FBQ0E7UUFDREEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBYUEsRUFBRUEsQ0FBYUE7WUFDN0NBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENB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QSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUN6Q0EsSUFBSUEsSUFBSUEsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFdEJBLElBQUlBLFFBQVFBLEdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEtBQUtBLEdBQUdBLENBQUNBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQzVFQSxJQUFJQSxNQUFNQSxHQUFXQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQ0EsSUFBSUEsTUFBTUEsR0FBV0EsQ0FBQ0EsTUFBTUEsS0FBS0EsTUFBTUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsTUFBTUEsR0FBR0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0dBLElBQUlBLE1BQU1BLEdBQVdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9DQSxJQUFJQSxLQUFLQSxHQUFXQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUNyREEsSUFBSUEsU0FBU0EsR0FBWUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLFNBQVNBLEdBQW1CQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsSUFBSUEsV0FBV0EsR0FBV0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtZQUV2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FDdkJBLFFBQVFBLEVBQ1JBLE1BQU1BLEVBQ05BLE1BQU1BLEVBQ05BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEVBQ1BBLFdBQVdBLEVBQ1hBLE1BQU1BLEVBQ05BLEtBQUtBLEVBQ0xBLFNBQVNBLEVBQ1RBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLEVBQ2pEQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUNqREEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFDakRBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQzVCQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUN2Q0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsR0FBR0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FDN0JBLENBQUNBLENBQUNBO1FB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LENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLGNBQWNBLEdBQUdBLFFBQVFBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7b0JBQy9GQSxDQUFDQTtvQkFDREEsQUFDQUEsd0JBRHdCQTtvQkFDeEJBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO3dCQUNsQ0EsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsY0FBY0EsR0FBR0EsUUFBUUEsR0FBR0EsaUNBQWlDQSxDQUFDQSxDQUFDQTtvQkFDNUdBLENBQUNBO29CQUNEQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDeENBLEFBQ0FBLHdCQUR3QkE7b0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDbkJBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLGNBQWNBLEdBQUdBLFFBQVFBLEdBQUdBLDJDQUEyQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3RIQSxDQUFDQTtvQkFDREEsQUFDQUEsd0JBRHdCQTtvQkFDeEJBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO3dCQUNsQ0EsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsY0FBY0EsR0FBR0EsUUFBUUEsR0FBR0Esa0NBQWtDQSxDQUFD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UUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EseUJBQXlCQSxDQUFDQSxDQUFDQTtnQkFDeEZBLENBQUNBO2dCQUNEQSxBQUNBQSx3QkFEd0JBO2dCQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3JDQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxRQUFRQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSx5QkFBeUJBLENBQUNBLENBQUNBO2dCQUN4RkEsQ0FBQ0E7Z0JBQ0RBLEFBQ0FBLHdCQUR3QkE7Z0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQTt1QkFDN0RBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO29CQUMzRkEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsUUFBUUEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsNkNBQTZDQSxDQUFDQSxDQUFDQTtnQkFDNUdBLENBQUNBO2dCQUNEQSxJQUFJQSxJQUFJQSxHQUFXQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDekNBLEFBQ0FBLHdCQUR3QkE7Z0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDakJBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLEdBQUdBLFFBQVFBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JHQSxDQUFDQTtnQkFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDNURBLE1BQU1BLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBO29CQUMxQkEsQ0FBQ0E7b0JBQ0RBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLEtBQUtBLElBQUlBLElBQUlBLElBQUlBLEdBQUdBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO3dCQUM1REEsTUFBTUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7b0JBQzFCQSxDQUFDQTtnQkFDRkEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7QUFDZkEsQ0FBQ0EiLCJmaWxlIjoibGliL3R6LWRhdGFiYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBPbHNlbiBUaW1lem9uZSBEYXRhYmFzZSBjb250YWluZXJcclxuICpcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZC50c1wiLz5cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0IGFzc2VydCA9IHJlcXVpcmUoXCJhc3NlcnRcIik7XHJcbmltcG9ydCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XHJcblxyXG5pbXBvcnQgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG5pbXBvcnQgZHVyYXRpb24gPSByZXF1aXJlKFwiLi9kdXJhdGlvblwiKTtcclxuaW1wb3J0IG1hdGggPSByZXF1aXJlKFwiLi9tYXRoXCIpO1xyXG5cclxuLyogdHNsaW50OmRpc2FibGUgKi9cclxudmFyIGRhdGE6IGFueSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lLWRhdGEuanNvblwiKTtcclxuLyogdHNsaW50OmVuYWJsZSAqL1xyXG5cclxuaW1wb3J0IER1cmF0aW9uID0gZHVyYXRpb24uRHVyYXRpb247XHJcbmltcG9ydCBUaW1lU3RydWN0ID0gYmFzaWNzLlRpbWVTdHJ1Y3Q7XHJcbmltcG9ydCBXZWVrRGF5ID0gYmFzaWNzLldlZWtEYXk7XHJcblxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBUTyBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIFRvVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRWl0aGVyIGEgeWVhciBudW1iZXIgb3IgXCJvbmx5XCJcclxuXHQgKi9cclxuXHRZZWFyLFxyXG5cdC8qKlxyXG5cdCAqIFwibWF4XCJcclxuXHQgKi9cclxuXHRNYXhcclxufVxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcnVsZSBPTiBjb2x1bW4gdmFsdWVcclxuICovXHJcbmV4cG9ydCBlbnVtIE9uVHlwZSB7XHJcblx0LyoqXHJcblx0ICogRGF5LW9mLW1vbnRoIG51bWJlclxyXG5cdCAqL1xyXG5cdERheU51bSxcclxuXHQvKipcclxuXHQgKiBcImxhc3RTdW5cIiBvciBcImxhc3RXZWRcIiBldGNcclxuXHQgKi9cclxuXHRMYXN0WCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPj04XCJcclxuXHQgKi9cclxuXHRHcmVxWCxcclxuXHQvKipcclxuXHQgKiBlLmcuIFwiU3VuPD04XCJcclxuXHQgKi9cclxuXHRMZXFYXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEF0VHlwZSB7XHJcblx0LyoqXHJcblx0ICogTG9jYWwgdGltZSAobm8gRFNUKVxyXG5cdCAqL1xyXG5cdFN0YW5kYXJkLFxyXG5cdC8qKlxyXG5cdCAqIFdhbGwgY2xvY2sgdGltZSAobG9jYWwgdGltZSB3aXRoIERTVClcclxuXHQgKi9cclxuXHRXYWxsLFxyXG5cdC8qKlxyXG5cdCAqIFV0YyB0aW1lXHJcblx0ICovXHJcblx0VXRjLFxyXG59XHJcblxyXG4vKipcclxuICogRE8gTk9UIFVTRSBUSElTIENMQVNTIERJUkVDVExZLCBVU0UgVGltZVpvbmVcclxuICpcclxuICogU2VlIGh0dHA6Ly93d3cuY3N0ZGJpbGwuY29tL3R6ZGIvdHotaG93LXRvLmh0bWxcclxuICovXHJcbmV4cG9ydCBjbGFzcyBSdWxlSW5mbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBGUk9NIGNvbHVtbiB5ZWFyIG51bWJlci5cclxuXHRcdCAqIE5vdGUsIGNhbiBiZSAtMTAwMDAgZm9yIE5hTiB2YWx1ZSAoZS5nLiBmb3IgXCJTeXN0ZW1WXCIgcnVsZXMpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBmcm9tOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRPIGNvbHVtbiB0eXBlOiBZZWFyIGZvciB5ZWFyIG51bWJlcnMgYW5kIFwib25seVwiIHZhbHVlcywgTWF4IGZvciBcIm1heFwiIHZhbHVlLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9UeXBlOiBUb1R5cGUsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIFRPIGNvbHVtbiBpcyBhIHllYXIsIHRoZSB5ZWFyIG51bWJlci4gSWYgVE8gY29sdW1uIGlzIFwib25seVwiLCB0aGUgRlJPTSB5ZWFyLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdG9ZZWFyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIFRZUEUgY29sdW1uLCBub3QgdXNlZCBzbyBmYXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHR5cGU6IHN0cmluZyxcclxuXHRcdC8qKlxyXG5cdFx0ICogSU4gY29sdW1uIG1vbnRoIG51bWJlciAxLTEyXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBpbk1vbnRoOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIE9OIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBvblR5cGU6IE9uVHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgb25UeXBlIGlzIERheU51bSwgdGhlIGRheSBudW1iZXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIG9uRGF5OiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIElmIG9uVHlwZSBpcyBub3QgRGF5TnVtLCB0aGUgd2Vla2RheVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb25XZWVrRGF5OiBXZWVrRGF5LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBBVCBjb2x1bW4gaG91clxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgYXRIb3VyOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBtaW51dGVcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0TWludXRlOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiBzZWNvbmRcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0U2Vjb25kOiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIEFUIGNvbHVtbiB0eXBlXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBhdFR5cGU6IEF0VHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogRFNUIG9mZnNldCBmcm9tIGxvY2FsIHN0YW5kYXJkIHRpbWUgKE5PVCBmcm9tIFVUQyEpXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBzYXZlOiBEdXJhdGlvbixcclxuXHRcdC8qKlxyXG5cdFx0ICogQ2hhcmFjdGVyIHRvIGluc2VydCBpbiAlcyBmb3IgdGltZSB6b25lIGFiYnJldmlhdGlvblxyXG5cdFx0ICogTm90ZSBpZiBUWiBkYXRhYmFzZSBpbmRpY2F0ZXMgXCItXCIgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBsZXR0ZXI6IHN0cmluZ1xyXG5cdFx0KSB7XHJcblxyXG5cdFx0aWYgKHRoaXMuc2F2ZSkge1xyXG5cdFx0XHR0aGlzLnNhdmUgPSB0aGlzLnNhdmUuY29udmVydChiYXNpY3MuVGltZVVuaXQuSG91cik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWZmIHRoaXMgcnVsZSBpcyBhcHBsaWNhYmxlIGluIHRoZSB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIGFwcGxpY2FibGUoeWVhcjogbnVtYmVyKTogYm9vbGVhbiB7XHJcblx0XHRpZiAoeWVhciA8IHRoaXMuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRzd2l0Y2ggKHRoaXMudG9UeXBlKSB7XHJcblx0XHRcdGNhc2UgVG9UeXBlLk1heDogcmV0dXJuIHRydWU7XHJcblx0XHRcdGNhc2UgVG9UeXBlLlllYXI6IHJldHVybiAoeWVhciA8PSB0aGlzLnRvWWVhcik7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTb3J0IGNvbXBhcmlzb25cclxuXHQgKiBAcmV0dXJuIChmaXJzdCBlZmZlY3RpdmUgZGF0ZSBpcyBsZXNzIHRoYW4gb3RoZXIncyBmaXJzdCBlZmZlY3RpdmUgZGF0ZSlcclxuXHQgKi9cclxuXHRwdWJsaWMgZWZmZWN0aXZlTGVzcyhvdGhlcjogUnVsZUluZm8pOiBib29sZWFuIHtcclxuXHRcdGlmICh0aGlzLmZyb20gPCBvdGhlci5mcm9tKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuZnJvbSA+IG90aGVyLmZyb20pIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMuaW5Nb250aCA8IG90aGVyLmluTW9udGgpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoID4gb3RoZXIuaW5Nb250aCkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkubGVzc1RoYW4ob3RoZXIuZWZmZWN0aXZlRGF0ZSh0aGlzLmZyb20pKSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvcnQgY29tcGFyaXNvblxyXG5cdCAqIEByZXR1cm4gKGZpcnN0IGVmZmVjdGl2ZSBkYXRlIGlzIGVxdWFsIHRvIG90aGVyJ3MgZmlyc3QgZWZmZWN0aXZlIGRhdGUpXHJcblx0ICovXHJcblx0cHVibGljIGVmZmVjdGl2ZUVxdWFsKG90aGVyOiBSdWxlSW5mbyk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuZnJvbSAhPT0gb3RoZXIuZnJvbSkge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5pbk1vbnRoICE9PSBvdGhlci5pbk1vbnRoKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGlmICghdGhpcy5lZmZlY3RpdmVEYXRlKHRoaXMuZnJvbSkuZXF1YWxzKG90aGVyLmVmZmVjdGl2ZURhdGUodGhpcy5mcm9tKSkpIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBkYXRlIHRoYXQgdGhlIHJ1bGUgdGFrZXMgZWZmZWN0LiBOb3RlIHRoYXQgdGhlIHRpbWVcclxuXHQgKiBpcyBOT1QgYWRqdXN0ZWQgZm9yIHdhbGwgY2xvY2sgdGltZSBvciBzdGFuZGFyZCB0aW1lLCBpLmUuIHRoaXMuYXRUeXBlIGlzXHJcblx0ICogbm90IHRha2VuIGludG8gYWNjb3VudFxyXG5cdCAqL1xyXG5cdHB1YmxpYyBlZmZlY3RpdmVEYXRlKHllYXI6IG51bWJlcik6IFRpbWVTdHJ1Y3Qge1xyXG5cdFx0YXNzZXJ0KHRoaXMuYXBwbGljYWJsZSh5ZWFyKSwgXCJSdWxlIGlzIG5vdCBhcHBsaWNhYmxlIGluIFwiICsgeWVhci50b1N0cmluZygxMCkpO1xyXG5cclxuXHRcdC8vIHllYXIgYW5kIG1vbnRoIGFyZSBnaXZlblxyXG5cdFx0dmFyIHRtOiBUaW1lU3RydWN0ID0gbmV3IFRpbWVTdHJ1Y3QoeWVhciwgdGhpcy5pbk1vbnRoKTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgZGF5XHJcblx0XHRzd2l0Y2ggKHRoaXMub25UeXBlKSB7XHJcblx0XHRcdGNhc2UgT25UeXBlLkRheU51bToge1xyXG5cdFx0XHRcdHRtLmRheSA9IHRoaXMub25EYXk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkdyZXFYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLndlZWtEYXlPbk9yQWZ0ZXIoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxlcVg6IHtcclxuXHRcdFx0XHR0bS5kYXkgPSBiYXNpY3Mud2Vla0RheU9uT3JCZWZvcmUoeWVhciwgdGhpcy5pbk1vbnRoLCB0aGlzLm9uRGF5LCB0aGlzLm9uV2Vla0RheSk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgT25UeXBlLkxhc3RYOiB7XHJcblx0XHRcdFx0dG0uZGF5ID0gYmFzaWNzLmxhc3RXZWVrRGF5T2ZNb250aCh5ZWFyLCB0aGlzLmluTW9udGgsIHRoaXMub25XZWVrRGF5KTtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGltZVxyXG5cdFx0dG0uaG91ciA9IHRoaXMuYXRIb3VyO1xyXG5cdFx0dG0ubWludXRlID0gdGhpcy5hdE1pbnV0ZTtcclxuXHRcdHRtLnNlY29uZCA9IHRoaXMuYXRTZWNvbmQ7XHJcblxyXG5cdFx0cmV0dXJuIHRtO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdHJhbnNpdGlvbiBtb21lbnQgaW4gVVRDIGluIHRoZSBnaXZlbiB5ZWFyXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geWVhclx0VGhlIHllYXIgZm9yIHdoaWNoIHRvIHJldHVybiB0aGUgdHJhbnNpdGlvblxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0VGhlIHN0YW5kYXJkIG9mZnNldCBmb3IgdGhlIHRpbWV6b25lIHdpdGhvdXQgRFNUXHJcblx0ICogQHBhcmFtIHByZXZSdWxlXHRUaGUgcHJldmlvdXMgcnVsZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0cmFuc2l0aW9uVGltZVV0Yyh5ZWFyOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbiwgcHJldlJ1bGU6IFJ1bGVJbmZvKTogbnVtYmVyIHtcclxuXHRcdGFzc2VydCh0aGlzLmFwcGxpY2FibGUoeWVhciksIFwiUnVsZSBub3QgYXBwbGljYWJsZSBpbiBnaXZlbiB5ZWFyXCIpO1xyXG5cdFx0dmFyIHVuaXhNaWxsaXMgPSB0aGlzLmVmZmVjdGl2ZURhdGUoeWVhcikudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cclxuXHRcdC8vIGFkanVzdCBmb3IgZ2l2ZW4gb2Zmc2V0XHJcblx0XHR2YXIgb2Zmc2V0OiBEdXJhdGlvbjtcclxuXHRcdHN3aXRjaCAodGhpcy5hdFR5cGUpIHtcclxuXHRcdFx0Y2FzZSBBdFR5cGUuVXRjOlxyXG5cdFx0XHRcdG9mZnNldCA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIEF0VHlwZS5TdGFuZGFyZDpcclxuXHRcdFx0XHRvZmZzZXQgPSBzdGFuZGFyZE9mZnNldDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBBdFR5cGUuV2FsbDpcclxuXHRcdFx0XHRpZiAocHJldlJ1bGUpIHtcclxuXHRcdFx0XHRcdG9mZnNldCA9IHN0YW5kYXJkT2Zmc2V0LmFkZChwcmV2UnVsZS5zYXZlKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0b2Zmc2V0ID0gc3RhbmRhcmRPZmZzZXQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInVua25vd24gQXRUeXBlXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdW5peE1pbGxpcyAtIG9mZnNldC5taWxsaXNlY29uZHMoKTtcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIFR5cGUgb2YgcmVmZXJlbmNlIGZyb20gem9uZSB0byBydWxlXHJcbiAqL1xyXG5leHBvcnQgZW51bSBSdWxlVHlwZSB7XHJcblx0LyoqXHJcblx0ICogTm8gcnVsZSBhcHBsaWVzXHJcblx0ICovXHJcblx0Tm9uZSxcclxuXHQvKipcclxuXHQgKiBGaXhlZCBnaXZlbiBvZmZzZXRcclxuXHQgKi9cclxuXHRPZmZzZXQsXHJcblx0LyoqXHJcblx0ICogUmVmZXJlbmNlIHRvIGEgbmFtZWQgc2V0IG9mIHJ1bGVzXHJcblx0ICovXHJcblx0UnVsZU5hbWVcclxufVxyXG5cclxuLyoqXHJcbiAqIERPIE5PVCBVU0UgVEhJUyBDTEFTUyBESVJFQ1RMWSwgVVNFIFRpbWVab25lXHJcbiAqXHJcbiAqIFNlZSBodHRwOi8vd3d3LmNzdGRiaWxsLmNvbS90emRiL3R6LWhvdy10by5odG1sXHJcbiAqIEZpcnN0LCBhbmQgc29tZXdoYXQgdHJpdmlhbGx5LCB3aGVyZWFzIFJ1bGVzIGFyZSBjb25zaWRlcmVkIHRvIGNvbnRhaW4gb25lIG9yIG1vcmUgcmVjb3JkcywgYSBab25lIGlzIGNvbnNpZGVyZWQgdG9cclxuICogYmUgYSBzaW5nbGUgcmVjb3JkIHdpdGggemVybyBvciBtb3JlIGNvbnRpbnVhdGlvbiBsaW5lcy4gVGh1cywgdGhlIGtleXdvcmQsIOKAnFpvbmUs4oCdIGFuZCB0aGUgem9uZSBuYW1lIGFyZSBub3QgcmVwZWF0ZWQuXHJcbiAqIFRoZSBsYXN0IGxpbmUgaXMgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbi5cclxuICogU2Vjb25kLCBhbmQgbW9yZSBmdW5kYW1lbnRhbGx5LCBlYWNoIGxpbmUgb2YgYSBab25lIHJlcHJlc2VudHMgYSBzdGVhZHkgc3RhdGUsIG5vdCBhIHRyYW5zaXRpb24gYmV0d2VlbiBzdGF0ZXMuXHJcbiAqIFRoZSBzdGF0ZSBleGlzdHMgZnJvbSB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgcHJldmlvdXMgbGluZeKAmXMgW1VOVElMXSBjb2x1bW4gdXAgdG8gdGhlIGRhdGUgYW5kIHRpbWUgaW4gdGhlIGN1cnJlbnQgbGluZeKAmXNcclxuICogW1VOVElMXSBjb2x1bW4uIEluIG90aGVyIHdvcmRzLCB0aGUgZGF0ZSBhbmQgdGltZSBpbiB0aGUgW1VOVElMXSBjb2x1bW4gaXMgdGhlIGluc3RhbnQgdGhhdCBzZXBhcmF0ZXMgdGhpcyBzdGF0ZSBmcm9tIHRoZSBuZXh0LlxyXG4gKiBXaGVyZSB0aGF0IHdvdWxkIGJlIGFtYmlndW91cyBiZWNhdXNlIHdl4oCZcmUgc2V0dGluZyBvdXIgY2xvY2tzIGJhY2ssIHRoZSBbVU5USUxdIGNvbHVtbiBzcGVjaWZpZXMgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGluc3RhbnQuXHJcbiAqIFRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIGxhc3QgbGluZSwgdGhlIG9uZSB3aXRob3V0IGFueXRoaW5nIGluIHRoZSBbVU5USUxdIGNvbHVtbiwgY29udGludWVzIHRvIHRoZSBwcmVzZW50LlxyXG4gKiBUaGUgZmlyc3QgbGluZSB0eXBpY2FsbHkgc3BlY2lmaWVzIHRoZSBtZWFuIHNvbGFyIHRpbWUgb2JzZXJ2ZWQgYmVmb3JlIHRoZSBpbnRyb2R1Y3Rpb24gb2Ygc3RhbmRhcmQgdGltZS4gU2luY2UgdGhlcmXigJlzIG5vIGxpbmUgYmVmb3JlXHJcbiAqIHRoYXQsIGl0IGhhcyBubyBiZWdpbm5pbmcuIDgtKSBGb3Igc29tZSBwbGFjZXMgbmVhciB0aGUgSW50ZXJuYXRpb25hbCBEYXRlIExpbmUsIHRoZSBmaXJzdCB0d28gbGluZXMgd2lsbCBzaG93IHNvbGFyIHRpbWVzIGRpZmZlcmluZyBieVxyXG4gKiAyNCBob3VyczsgdGhpcyBjb3JyZXNwb25kcyB0byBhIG1vdmVtZW50IG9mIHRoZSBEYXRlIExpbmUuIEZvciBleGFtcGxlOlxyXG4gKiAjIFpvbmVcdE5BTUVcdFx0R01UT0ZGXHRSVUxFU1x0Rk9STUFUXHRbVU5USUxdXHJcbiAqIFpvbmUgQW1lcmljYS9KdW5lYXVcdCAxNTowMjoxOSAtXHRMTVRcdDE4NjcgT2N0IDE4XHJcbiAqIFx0XHRcdCAtODo1Nzo0MSAtXHRMTVRcdC4uLlxyXG4gKiBXaGVuIEFsYXNrYSB3YXMgcHVyY2hhc2VkIGZyb20gUnVzc2lhIGluIDE4NjcsIHRoZSBEYXRlIExpbmUgbW92ZWQgZnJvbSB0aGUgQWxhc2thL0NhbmFkYSBib3JkZXIgdG8gdGhlIEJlcmluZyBTdHJhaXQ7IGFuZCB0aGUgdGltZSBpblxyXG4gKiBBbGFza2Egd2FzIHRoZW4gMjQgaG91cnMgZWFybGllciB0aGFuIGl0IGhhZCBiZWVuLiA8YXNpZGU+KDYgT2N0b2JlciBpbiB0aGUgSnVsaWFuIGNhbGVuZGFyLCB3aGljaCBSdXNzaWEgd2FzIHN0aWxsIHVzaW5nIHRoZW4gZm9yXHJcbiAqIHJlbGlnaW91cyByZWFzb25zLCB3YXMgZm9sbG93ZWQgYnkgYSBzZWNvbmQgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgZGF5IHdpdGggYSBkaWZmZXJlbnQgbmFtZSwgMTggT2N0b2JlciBpbiB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLlxyXG4gKiBJc27igJl0IGNpdmlsIHRpbWUgd29uZGVyZnVsPyA4LSkpPC9hc2lkZT5cclxuICogVGhlIGFiYnJldmlhdGlvbiwg4oCcTE1ULOKAnSBzdGFuZHMgZm9yIOKAnGxvY2FsIG1lYW4gdGltZSzigJ0gd2hpY2ggaXMgYW4gaW52ZW50aW9uIG9mIHRoZSB0eiBkYXRhYmFzZSBhbmQgd2FzIHByb2JhYmx5IG5ldmVyIGFjdHVhbGx5XHJcbiAqIHVzZWQgZHVyaW5nIHRoZSBwZXJpb2QuIEZ1cnRoZXJtb3JlLCB0aGUgdmFsdWUgaXMgYWxtb3N0IGNlcnRhaW5seSB3cm9uZyBleGNlcHQgaW4gdGhlIGFyY2hldHlwYWwgcGxhY2UgYWZ0ZXIgd2hpY2ggdGhlIHpvbmUgaXMgbmFtZWQuXHJcbiAqIChUaGUgdHogZGF0YWJhc2UgdXN1YWxseSBkb2VzbuKAmXQgcHJvdmlkZSBhIHNlcGFyYXRlIFpvbmUgcmVjb3JkIGZvciBwbGFjZXMgd2hlcmUgbm90aGluZyBzaWduaWZpY2FudCBoYXBwZW5lZCBhZnRlciAxOTcwLilcclxuICovXHJcbmV4cG9ydCBjbGFzcyBab25lSW5mbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKFxyXG5cdFx0LyoqXHJcblx0XHQgKiBHTVQgb2Zmc2V0IGluIGZyYWN0aW9uYWwgbWludXRlcywgUE9TSVRJVkUgdG8gVVRDIChub3RlIEphdmFTY3JpcHQuRGF0ZSBnaXZlcyBvZmZzZXRzXHJcblx0XHQgKiBjb250cmFyeSB0byB3aGF0IHlvdSBtaWdodCBleHBlY3QpLiAgRS5nLiBFdXJvcGUvQW1zdGVyZGFtIGhhcyArNjAgbWludXRlcyBpbiB0aGlzIGZpZWxkIGJlY2F1c2VcclxuXHRcdCAqIGl0IGlzIG9uZSBob3VyIGFoZWFkIG9mIFVUQ1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgZ210b2ZmOiBEdXJhdGlvbixcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFRoZSBSVUxFUyBjb2x1bW4gdGVsbHMgdXMgd2hldGhlciBkYXlsaWdodCBzYXZpbmcgdGltZSBpcyBiZWluZyBvYnNlcnZlZDpcclxuXHRcdCAqIEEgaHlwaGVuLCBhIGtpbmQgb2YgbnVsbCB2YWx1ZSwgbWVhbnMgdGhhdCB3ZSBoYXZlIG5vdCBzZXQgb3VyIGNsb2NrcyBhaGVhZCBvZiBzdGFuZGFyZCB0aW1lLlxyXG5cdFx0ICogQW4gYW1vdW50IG9mIHRpbWUgKHVzdWFsbHkgYnV0IG5vdCBuZWNlc3NhcmlseSDigJwxOjAw4oCdIG1lYW5pbmcgb25lIGhvdXIpIG1lYW5zIHRoYXQgd2UgaGF2ZSBzZXQgb3VyIGNsb2NrcyBhaGVhZCBieSB0aGF0IGFtb3VudC5cclxuXHRcdCAqIFNvbWUgYWxwaGFiZXRpYyBzdHJpbmcgbWVhbnMgdGhhdCB3ZSBtaWdodCBoYXZlIHNldCBvdXIgY2xvY2tzIGFoZWFkOyBhbmQgd2UgbmVlZCB0byBjaGVjayB0aGUgcnVsZVxyXG5cdFx0ICogdGhlIG5hbWUgb2Ygd2hpY2ggaXMgdGhlIGdpdmVuIGFscGhhYmV0aWMgc3RyaW5nLlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgcnVsZVR5cGU6IFJ1bGVUeXBlLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSWYgdGhlIHJ1bGUgY29sdW1uIGlzIGFuIG9mZnNldCwgdGhpcyBpcyB0aGUgb2Zmc2V0XHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlT2Zmc2V0OiBEdXJhdGlvbixcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHRoZSBydWxlIGNvbHVtbiBpcyBhIHJ1bGUgbmFtZSwgdGhpcyBpcyB0aGUgcnVsZSBuYW1lXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBydWxlTmFtZTogc3RyaW5nLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogVGhlIEZPUk1BVCBjb2x1bW4gc3BlY2lmaWVzIHRoZSB1c3VhbCBhYmJyZXZpYXRpb24gb2YgdGhlIHRpbWUgem9uZSBuYW1lLiBJdCBjYW4gaGF2ZSBvbmUgb2YgZm91ciBmb3JtczpcclxuXHRcdCAqIHRoZSBzdHJpbmcsIOKAnHp6eizigJ0gd2hpY2ggaXMgYSBraW5kIG9mIG51bGwgdmFsdWUgKGRvbuKAmXQgYXNrKVxyXG5cdFx0ICogYSBzaW5nbGUgYWxwaGFiZXRpYyBzdHJpbmcgb3RoZXIgdGhhbiDigJx6enos4oCdIGluIHdoaWNoIGNhc2UgdGhhdOKAmXMgdGhlIGFiYnJldmlhdGlvblxyXG5cdFx0ICogYSBwYWlyIG9mIHN0cmluZ3Mgc2VwYXJhdGVkIGJ5IGEgc2xhc2ggKOKAmC/igJkpLCBpbiB3aGljaCBjYXNlIHRoZSBmaXJzdCBzdHJpbmcgaXMgdGhlIGFiYnJldmlhdGlvblxyXG5cdFx0ICogZm9yIHRoZSBzdGFuZGFyZCB0aW1lIG5hbWUgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBhYmJyZXZpYXRpb24gZm9yIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBuYW1lXHJcblx0XHQgKiBhIHN0cmluZyBjb250YWluaW5nIOKAnCVzLOKAnSBpbiB3aGljaCBjYXNlIHRoZSDigJwlc+KAnSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSB0ZXh0IGluIHRoZSBhcHByb3ByaWF0ZSBSdWxl4oCZcyBMRVRURVIgY29sdW1uXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBmb3JtYXQ6IHN0cmluZyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVudGlsIHRpbWVzdGFtcCBpbiB1bml4IHV0YyBtaWxsaXMuIFRoZSB6b25lIGluZm8gaXMgdmFsaWQgdXAgdG9cclxuXHRcdCAqIGFuZCBleGNsdWRpbmcgdGhpcyB0aW1lc3RhbXAuXHJcblx0XHQgKiBOb3RlIHRoaXMgdmFsdWUgY2FuIGJlIE5VTEwgKGZvciB0aGUgZmlyc3QgcnVsZSlcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIHVudGlsOiBudW1iZXJcclxuXHQpIHtcclxuXHRcdGlmICh0aGlzLnJ1bGVPZmZzZXQpIHtcclxuXHRcdFx0dGhpcy5ydWxlT2Zmc2V0ID0gdGhpcy5ydWxlT2Zmc2V0LmNvbnZlcnQoYmFzaWNzLlRpbWVVbml0LkhvdXIpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuXHJcbmVudW0gVHpNb250aE5hbWVzIHtcclxuXHRKYW4gPSAxLFxyXG5cdEZlYiA9IDIsXHJcblx0TWFyID0gMyxcclxuXHRBcHIgPSA0LFxyXG5cdE1heSA9IDUsXHJcblx0SnVuID0gNixcclxuXHRKdWwgPSA3LFxyXG5cdEF1ZyA9IDgsXHJcblx0U2VwID0gOSxcclxuXHRPY3QgPSAxMCxcclxuXHROb3YgPSAxMSxcclxuXHREZWMgPSAxMlxyXG59XHJcblxyXG5mdW5jdGlvbiBtb250aE5hbWVUb1N0cmluZyhuYW1lOiBzdHJpbmcpOiBudW1iZXIge1xyXG5cdGZvciAodmFyIGk6IG51bWJlciA9IDE7IGkgPD0gMTI7ICsraSkge1xyXG5cdFx0aWYgKFR6TW9udGhOYW1lc1tpXSA9PT0gbmFtZSkge1xyXG5cdFx0XHRyZXR1cm4gaTtcclxuXHRcdH1cclxuXHR9XHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0LyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cclxuXHRpZiAodHJ1ZSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtb250aCBuYW1lIFxcXCJcIiArIG5hbWUgKyBcIlxcXCJcIik7XHJcblx0fVxyXG59XHJcblxyXG5lbnVtIFR6RGF5TmFtZXMge1xyXG5cdFN1biA9IDAsXHJcblx0TW9uID0gMSxcclxuXHRUdWUgPSAyLFxyXG5cdFdlZCA9IDMsXHJcblx0VGh1ID0gNCxcclxuXHRGcmkgPSA1LFxyXG5cdFNhdCA9IDZcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgb2Zmc2V0IHN0cmluZyBpLmUuXHJcbiAqIDEsIC0xLCArMSwgMDEsIDE6MDAsIDE6MjM6MjUuMTQzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZE9mZnNldFN0cmluZyhzOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRyZXR1cm4gL14oXFwtfFxcKyk/KFswLTldKygoXFw6WzAtOV0rKT8oXFw6WzAtOV0rKFxcLlswLTldKyk/KT8pKSQvLnRlc3Qocyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbW9tZW50IGF0IHdoaWNoIHRoZSBnaXZlbiBydWxlIGJlY29tZXMgdmFsaWRcclxuICovXHJcbmV4cG9ydCBjbGFzcyBUcmFuc2l0aW9uIHtcclxuXHRjb25zdHJ1Y3RvcihcclxuXHRcdC8qKlxyXG5cdFx0ICogVHJhbnNpdGlvbiB0aW1lIGluIFVUQyBtaWxsaXNcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGF0OiBudW1iZXIsXHJcblx0XHQvKipcclxuXHRcdCAqIE5ldyBvZmZzZXQgKHR5cGUgb2Ygb2Zmc2V0IGRlcGVuZHMgb24gdGhlIGZ1bmN0aW9uKVxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgb2Zmc2V0OiBEdXJhdGlvbixcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIE5ldyB0aW16b25lIGFiYnJldmlhdGlvbiBsZXR0ZXJcclxuXHRcdCAqL1xyXG5cdFx0cHVibGljIGxldHRlcjogc3RyaW5nXHJcblxyXG5cdFx0KSB7XHJcblx0XHRpZiAodGhpcy5vZmZzZXQpIHtcclxuXHRcdFx0dGhpcy5vZmZzZXQgPSB0aGlzLm9mZnNldC5jb252ZXJ0KGJhc2ljcy5UaW1lVW5pdC5Ib3VyKTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPcHRpb24gZm9yIFR6RGF0YWJhc2Ujbm9ybWFsaXplTG9jYWwoKVxyXG4gKi9cclxuZXhwb3J0IGVudW0gTm9ybWFsaXplT3B0aW9uIHtcclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgbm9uLWV4aXN0aW5nIHRpbWVzIGJ5IEFERElORyB0aGUgRFNUIG9mZnNldFxyXG5cdCAqL1xyXG5cdFVwLFxyXG5cdC8qKlxyXG5cdCAqIE5vcm1hbGl6ZSBub24tZXhpc3RpbmcgdGltZXMgYnkgU1VCVFJBQ1RJTkcgdGhlIERTVCBvZmZzZXRcclxuXHQgKi9cclxuXHREb3duXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBETyBOT1QgVVNFIFRISVMgQ0xBU1MgRElSRUNUTFksIFVTRSBUaW1lWm9uZVxyXG4gKlxyXG4gKiBUaGlzIGNsYXNzIHR5cGVzY3JpcHRpZmllcyByZWFkaW5nIHRoZSBUWiBkYXRhXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHpEYXRhYmFzZSB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNpbmdsZSBpbnN0YW5jZSBtZW1iZXJcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IFR6RGF0YWJhc2UgPSBudWxsO1xyXG5cclxuXHQvKipcclxuXHQgKiBTaW5nbGUgaW5zdGFuY2Ugb2YgdGhpcyBkYXRhYmFzZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGF0aWMgaW5zdGFuY2UoKTogVHpEYXRhYmFzZSB7XHJcblx0XHRpZiAoIVR6RGF0YWJhc2UuX2luc3RhbmNlKSB7XHJcblx0XHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbmV3IFR6RGF0YWJhc2UoZGF0YSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gVHpEYXRhYmFzZS5faW5zdGFuY2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbmplY3QgdGVzdCB0aW1lem9uZSBkYXRhIGZvciB1bml0dGVzdHNcclxuXHQgKi9cclxuXHRwdWJsaWMgc3RhdGljIGluamVjdChkYXRhOiBhbnkpOiB2b2lkIHtcclxuXHRcdFR6RGF0YWJhc2UuX2luc3RhbmNlID0gbnVsbDsgLy8gY2lyY3VtdmVudCBjb25zdHJ1Y3RvciBjaGVjayBvbiBkdXBsaWNhdGUgaW5zdGFuY2VzXHJcblx0XHRUekRhdGFiYXNlLl9pbnN0YW5jZSA9IG5ldyBUekRhdGFiYXNlKGRhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5mb3JtYXRpb24gb24gYWdncmVnYXRlIHZhbHVlcyBpbiB0aGUgZGF0YWJhc2VcclxuXHQgKi9cclxuXHRwcml2YXRlIF9taW5tYXg6IE1pbk1heEluZm87XHJcblxyXG5cdHByaXZhdGUgX2RhdGE6IGFueTtcclxuXHJcblx0cHJpdmF0ZSBfem9uZU5hbWVzOiBzdHJpbmdbXTtcclxuXHJcblx0Y29uc3RydWN0b3IoZGF0YTogYW55KSB7XHJcblx0XHRhc3NlcnQoIVR6RGF0YWJhc2UuX2luc3RhbmNlLCBcIllvdSBzaG91bGQgbm90IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgVHpEYXRhYmFzZSBjbGFzcyB5b3Vyc2VsZi4gVXNlIFR6RGF0YWJhc2UuaW5zdGFuY2UoKVwiKTtcclxuXHRcdHRoaXMuX2RhdGEgPSBkYXRhO1xyXG5cdFx0dGhpcy5fbWlubWF4ID0gdmFsaWRhdGVEYXRhKGRhdGEpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIHNvcnRlZCBsaXN0IG9mIGFsbCB6b25lIG5hbWVzXHJcblx0ICovXHJcblx0cHVibGljIHpvbmVOYW1lcygpOiBzdHJpbmdbXSB7XHJcblx0XHRpZiAoIXRoaXMuX3pvbmVOYW1lcykge1xyXG5cdFx0XHR0aGlzLl96b25lTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnpvbmVzKTtcclxuXHRcdFx0dGhpcy5fem9uZU5hbWVzLnNvcnQoKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl96b25lTmFtZXM7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgZXhpc3RzKHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiB0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVOYW1lKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1pbmltdW0gbm9uLXplcm8gRFNUIG9mZnNldCAod2hpY2ggZXhjbHVkZXMgc3RhbmRhcmQgb2Zmc2V0KSBvZiBhbGwgcnVsZXMgaW4gdGhlIGRhdGFiYXNlLlxyXG5cdCAqIE5vdGUgdGhhdCBEU1Qgb2Zmc2V0cyBuZWVkIG5vdCBiZSB3aG9sZSBob3Vycy5cclxuXHQgKlxyXG5cdCAqIERvZXMgcmV0dXJuIHplcm8gaWYgYSB6b25lTmFtZSBpcyBnaXZlbiBhbmQgdGhlcmUgaXMgbm8gRFNUIGF0IGFsbCBmb3IgdGhlIHpvbmUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcblx0ICovXHJcblx0cHVibGljIG1pbkRzdFNhdmUoem9uZU5hbWU/OiBzdHJpbmcpOiBEdXJhdGlvbiB7XHJcblx0XHRpZiAoem9uZU5hbWUpIHtcclxuXHRcdFx0dmFyIHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdFx0dmFyIHJlc3VsdDogRHVyYXRpb24gPSBudWxsO1xyXG5cdFx0XHR2YXIgcnVsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHR6b25lSW5mb3MuZm9yRWFjaCgoem9uZUluZm86IFpvbmVJbmZvKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5ncmVhdGVyVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZU9mZnNldC5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHpvbmVJbmZvLnJ1bGVPZmZzZXQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5SdWxlTmFtZVxyXG5cdFx0XHRcdFx0JiYgcnVsZU5hbWVzLmluZGV4T2Yoem9uZUluZm8ucnVsZU5hbWUpID09PSAtMSkge1xyXG5cdFx0XHRcdFx0cnVsZU5hbWVzLnB1c2goem9uZUluZm8ucnVsZU5hbWUpO1xyXG5cdFx0XHRcdFx0dmFyIHRlbXAgPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHR0ZW1wLmZvckVhY2goKHJ1bGVJbmZvOiBSdWxlSW5mbyk6IHZvaWQgPT4ge1xyXG5cdFx0XHRcdFx0XHRpZiAoIXJlc3VsdCB8fCByZXN1bHQuZ3JlYXRlclRoYW4ocnVsZUluZm8uc2F2ZSkpIHtcclxuXHRcdFx0XHRcdFx0XHRpZiAocnVsZUluZm8uc2F2ZS5taWxsaXNlY29uZHMoKSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdGlmICghcmVzdWx0KSB7XHJcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1pbkRzdFNhdmUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTWF4aW11bSBEU1Qgb2Zmc2V0ICh3aGljaCBleGNsdWRlcyBzdGFuZGFyZCBvZmZzZXQpIG9mIGFsbCBydWxlcyBpbiB0aGUgZGF0YWJhc2UuXHJcblx0ICogTm90ZSB0aGF0IERTVCBvZmZzZXRzIG5lZWQgbm90IGJlIHdob2xlIGhvdXJzLlxyXG5cdCAqXHJcblx0ICogUmV0dXJucyAwIGlmIHpvbmVOYW1lIGdpdmVuIGFuZCBubyBEU1Qgb2JzZXJ2ZWQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdChvcHRpb25hbCkgaWYgZ2l2ZW4sIHRoZSByZXN1bHQgZm9yIHRoZSBnaXZlbiB6b25lIGlzIHJldHVybmVkXHJcblx0ICovXHJcblx0cHVibGljIG1heERzdFNhdmUoem9uZU5hbWU/OiBzdHJpbmcpOiBEdXJhdGlvbiB7XHJcblx0XHRpZiAoem9uZU5hbWUpIHtcclxuXHRcdFx0dmFyIHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdFx0dmFyIHJlc3VsdDogRHVyYXRpb24gPSBudWxsO1xyXG5cdFx0XHR2YXIgcnVsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG5cdFx0XHR6b25lSW5mb3MuZm9yRWFjaCgoem9uZUluZm86IFpvbmVJbmZvKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0aWYgKHpvbmVJbmZvLnJ1bGVUeXBlID09PSBSdWxlVHlwZS5PZmZzZXQpIHtcclxuXHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbih6b25lSW5mby5ydWxlT2Zmc2V0KSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoem9uZUluZm8ucnVsZVR5cGUgPT09IFJ1bGVUeXBlLlJ1bGVOYW1lXHJcblx0XHRcdFx0XHQmJiBydWxlTmFtZXMuaW5kZXhPZih6b25lSW5mby5ydWxlTmFtZSkgPT09IC0xKSB7XHJcblx0XHRcdFx0XHRydWxlTmFtZXMucHVzaCh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHR2YXIgdGVtcCA9IHRoaXMuZ2V0UnVsZUluZm9zKHpvbmVJbmZvLnJ1bGVOYW1lKTtcclxuXHRcdFx0XHRcdHRlbXAuZm9yRWFjaCgocnVsZUluZm86IFJ1bGVJbmZvKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0XHRcdGlmICghcmVzdWx0IHx8IHJlc3VsdC5sZXNzVGhhbihydWxlSW5mby5zYXZlKSkge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHJ1bGVJbmZvLnNhdmU7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdGlmICghcmVzdWx0KSB7XHJcblx0XHRcdFx0cmVzdWx0ID0gRHVyYXRpb24uaG91cnMoMCk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHJlc3VsdC5jbG9uZSgpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIER1cmF0aW9uLm1pbnV0ZXModGhpcy5fbWlubWF4Lm1heERzdFNhdmUpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIHpvbmUgaGFzIERTVCBhdCBhbGxcclxuXHQgKi9cclxuXHRwdWJsaWMgaGFzRHN0KHpvbmVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAodGhpcy5tYXhEc3RTYXZlKHpvbmVOYW1lKS5taWxsaXNlY29uZHMoKSAhPT0gMCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGaXJzdCBEU1QgY2hhbmdlIG1vbWVudCBBRlRFUiB0aGUgZ2l2ZW4gVVRDIGRhdGUgaW4gVVRDIG1pbGxpc2Vjb25kcywgd2l0aGluIG9uZSB5ZWFyXHJcblx0ICovXHJcblx0cHVibGljIG5leHREc3RDaGFuZ2Uoem9uZU5hbWU6IHN0cmluZywgdXRjTWlsbGlzOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0dmFyIHRtOiBUaW1lU3RydWN0ID0gYmFzaWNzLnVuaXhUb1RpbWVOb0xlYXBTZWNzKHV0Y01pbGxpcyk7XHJcblx0XHR2YXIgem9uZUluZm86IFpvbmVJbmZvO1xyXG5cdFx0dmFyIGk6IG51bWJlcjtcclxuXHJcblx0XHQvLyBnZXQgYWxsIHpvbmUgaW5mb3MgZm9yIFtkYXRlLCBkYXRlKzF5ZWFyKVxyXG5cdFx0dmFyIGFsbFpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdHZhciByZWxldmFudFpvbmVJbmZvczogWm9uZUluZm9bXSA9IFtdO1xyXG5cdFx0dmFyIHJhbmdlU3RhcnQ6IG51bWJlciA9IHV0Y01pbGxpcztcclxuXHRcdHZhciByYW5nZUVuZDogbnVtYmVyID0gdXRjTWlsbGlzICsgMzY1ICogMjQgKiAzNjAwICogMTAwMDtcclxuXHRcdHZhciBwcmV2RW5kOiBudW1iZXIgPSBudWxsO1xyXG5cdFx0Zm9yIChpID0gMDsgaSA8IGFsbFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR6b25lSW5mbyA9IGFsbFpvbmVJbmZvc1tpXTtcclxuXHRcdFx0aWYgKChwcmV2RW5kID09PSBudWxsIHx8IHByZXZFbmQgPCByYW5nZUVuZCkgJiYgKHpvbmVJbmZvLnVudGlsID09PSBudWxsIHx8IHpvbmVJbmZvLnVudGlsID4gcmFuZ2VTdGFydCkpIHtcclxuXHRcdFx0XHRyZWxldmFudFpvbmVJbmZvcy5wdXNoKHpvbmVJbmZvKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2RW5kID0gem9uZUluZm8udW50aWw7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY29sbGVjdCBhbGwgdHJhbnNpdGlvbnMgaW4gdGhlIHpvbmVzIGZvciB0aGUgeWVhclxyXG5cdFx0dmFyIHRyYW5zaXRpb25zOiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHRcdGZvciAoaSA9IDA7IGkgPCByZWxldmFudFpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR6b25lSW5mbyA9IHJlbGV2YW50Wm9uZUluZm9zW2ldO1xyXG5cdFx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHRcdHRyYW5zaXRpb25zID0gdHJhbnNpdGlvbnMuY29uY2F0KHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHpvbmVJbmZvLnJ1bGVOYW1lLCB0bS55ZWFyIC0gMSwgdG0ueWVhciArIDEsIHpvbmVJbmZvLmdtdG9mZikpO1xyXG5cdFx0fVxyXG5cdFx0dHJhbnNpdGlvbnMuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGZpcnN0IGFmdGVyIHRoZSBnaXZlbiBkYXRlIHRoYXQgaGFzIGEgZGlmZmVyZW50IG9mZnNldFxyXG5cdFx0dmFyIHByZXZTYXZlOiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0dmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKCFwcmV2U2F2ZSB8fCAhcHJldlNhdmUuZXF1YWxzKHRyYW5zaXRpb24ub2Zmc2V0KSkge1xyXG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLmF0ID4gdXRjTWlsbGlzKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJhbnNpdGlvbi5hdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cHJldlNhdmUgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGdpdmVuIHpvbmUgbmFtZSBldmVudHVhbGx5IGxpbmtzIHRvXHJcblx0ICogXCJFdGMvVVRDXCIsIFwiRXRjL0dNVFwiIG9yIFwiRXRjL1VDVFwiIGluIHRoZSBUWiBkYXRhYmFzZS4gVGhpcyBpcyB0cnVlIGUuZy4gZm9yXHJcblx0ICogXCJVVENcIiwgXCJHTVRcIiwgXCJFdGMvR01UXCIgZXRjLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyB6b25lSXNVdGMoem9uZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0dmFyIGFjdHVhbFpvbmVOYW1lOiBzdHJpbmcgPSB6b25lTmFtZTtcclxuXHRcdHZhciB6b25lRW50cmllczogYW55ID0gdGhpcy5fZGF0YS56b25lc1t6b25lTmFtZV07XHJcblx0XHQvLyBmb2xsb3cgbGlua3NcclxuXHRcdHdoaWxlICh0eXBlb2YgKHpvbmVFbnRyaWVzKSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKCF0aGlzLl9kYXRhLnpvbmVzLmhhc093blByb3BlcnR5KHpvbmVFbnRyaWVzKSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZUVudHJpZXMgKyBcIlxcXCIgbm90IGZvdW5kIChyZWZlcnJlZCB0byBpbiBsaW5rIGZyb20gXFxcIlwiXHJcblx0XHRcdFx0XHQrIHpvbmVOYW1lICsgXCJcXFwiIHZpYSBcXFwiXCIgKyBhY3R1YWxab25lTmFtZSArIFwiXFxcIlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRhY3R1YWxab25lTmFtZSA9IHpvbmVFbnRyaWVzO1xyXG5cdFx0XHR6b25lRW50cmllcyA9IHRoaXMuX2RhdGEuem9uZXNbYWN0dWFsWm9uZU5hbWVdO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIChhY3R1YWxab25lTmFtZSA9PT0gXCJFdGMvVVRDXCIgfHwgYWN0dWFsWm9uZU5hbWUgPT09IFwiRXRjL0dNVFwiIHx8IGFjdHVhbFpvbmVOYW1lID09PSBcIkV0Yy9VQ1RcIik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemVzIG5vbi1leGlzdGluZyBsb2NhbCB0aW1lcyBieSBhZGRpbmcvc3VidHJhY3RpbmcgYSBmb3J3YXJkIG9mZnNldCBjaGFuZ2UuXHJcblx0ICogRHVyaW5nIGEgZm9yd2FyZCBzdGFuZGFyZCBvZmZzZXQgY2hhbmdlIG9yIERTVCBvZmZzZXQgY2hhbmdlLCBzb21lIGFtb3VudCBvZlxyXG5cdCAqIGxvY2FsIHRpbWUgaXMgc2tpcHBlZC4gVGhlcmVmb3JlLCB0aGlzIGFtb3VudCBvZiBsb2NhbCB0aW1lIGRvZXMgbm90IGV4aXN0LlxyXG5cdCAqIFRoaXMgZnVuY3Rpb24gYWRkcyB0aGUgYW1vdW50IG9mIGZvcndhcmQgY2hhbmdlIHRvIGFueSBub24tZXhpc3RpbmcgdGltZS4gQWZ0ZXIgYWxsLFxyXG5cdCAqIHRoaXMgaXMgcHJvYmFibHkgd2hhdCB0aGUgdXNlciBtZWFudC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSBsb2NhbFRpbWVcdEEgbG9jYWwgdGltZSwgZWl0aGVyIGFzIGEgVGltZVN0cnVjdCBvciBhcyBhIHVuaXggbWlsbGlzZWNvbmQgdmFsdWVcclxuXHQgKiBAcGFyYW0gb3B0XHQob3B0aW9uYWwpIFJvdW5kIHVwIG9yIGRvd24/IERlZmF1bHQ6IHVwLlxyXG5cdCAqXHJcblx0ICogQHJldHVyblx0VGhlIG5vcm1hbGl6ZWQgdGltZSwgaW4gdGhlIHNhbWUgZm9ybWF0IGFzIHRoZSBsb2NhbFRpbWUgcGFyYW1ldGVyIChUaW1lU3RydWN0IG9yIHVuaXggbWlsbGlzKVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBub3JtYWxpemVMb2NhbCh6b25lTmFtZTogc3RyaW5nLCBsb2NhbFRpbWU6IFRpbWVTdHJ1Y3QsIG9wdD86IE5vcm1hbGl6ZU9wdGlvbik6IFRpbWVTdHJ1Y3Q7XHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsVGltZTogbnVtYmVyLCBvcHQ/OiBOb3JtYWxpemVPcHRpb24pOiBudW1iZXI7XHJcblx0cHVibGljIG5vcm1hbGl6ZUxvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGE6IGFueSwgb3B0OiBOb3JtYWxpemVPcHRpb24gPSBOb3JtYWxpemVPcHRpb24uVXApOiBhbnkge1xyXG5cdFx0YXNzZXJ0KHR5cGVvZiAoYSkgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIChhKSA9PT0gXCJvYmplY3RcIiwgXCJudW1iZXIgb3Igb2JqZWN0IGV4cGVjdGVkXCIpO1xyXG5cdFx0YXNzZXJ0KHR5cGVvZihhKSAhPT0gXCJvYmplY3RcIiB8fCBhLCBcImEgaXMgbnVsbFwiKTtcclxuXHJcblx0XHRpZiAodGhpcy5oYXNEc3Qoem9uZU5hbWUpKSB7XHJcblx0XHRcdHZhciB1bml4TWlsbGlzOiBudW1iZXIgPSAwO1xyXG5cdFx0XHR2YXIgdG06IFRpbWVTdHJ1Y3QgPSBudWxsO1xyXG5cdFx0XHRpZiAodHlwZW9mIGEgPT09IFwib2JqZWN0XCIpIHtcclxuXHRcdFx0XHR1bml4TWlsbGlzID0gKDxUaW1lU3RydWN0PihhKSkudG9Vbml4Tm9MZWFwU2VjcygpO1xyXG5cdFx0XHRcdHRtID0gPFRpbWVTdHJ1Y3Q+KGEpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHVuaXhNaWxsaXMgPSA8bnVtYmVyPmE7XHJcblx0XHRcdFx0dG0gPSBiYXNpY3MudW5peFRvVGltZU5vTGVhcFNlY3ModW5peE1pbGxpcyk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGxvY2FsIHRpbWVzIGJlaGF2ZSBsaWtlIHRoaXMgZHVyaW5nIERTVCBjaGFuZ2VzOlxyXG5cdFx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMWgpOiAgIDAgMSAzIDQgNVxyXG5cdFx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG5cdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDFoKTogIDEgMiAyIDMgNFxyXG5cdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2UgKDJoKTogIDEgMiAxIDIgM1xyXG5cclxuXHRcdFx0Ly8gVGhlcmVmb3JlLCBiaW5hcnkgc2VhcmNoaW5nIGlzIG5vdCBwb3NzaWJsZS5cclxuXHRcdFx0Ly8gSW5zdGVhZCwgd2Ugc2hvdWxkIGNoZWNrIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9ucyB3aXRoaW4gYSB3aW5kb3cgYXJvdW5kIHRoZSBsb2NhbCB0aW1lXHJcblxyXG5cdFx0XHQvLyBnZXQgYWxsIHRyYW5zaXRpb25zIChub3RlIHRoaXMgaW5jbHVkZXMgZmFrZSB0cmFuc2l0aW9uIHJ1bGVzIGZvciB6b25lIG9mZnNldCBjaGFuZ2VzKVxyXG5cdFx0XHR2YXIgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNUb3RhbE9mZnNldHMoem9uZU5hbWUsIHRtLnllYXIgLSAxLCB0bS55ZWFyICsgMSk7XHJcblxyXG5cdFx0XHQvLyBmaW5kIHRoZSBEU1QgZm9yd2FyZCB0cmFuc2l0aW9uc1xyXG5cdFx0XHR2YXIgcHJldjogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0cmFuc2l0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdHZhciB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbnNbaV07XHJcblx0XHRcdFx0Ly8gZm9yd2FyZCB0cmFuc2l0aW9uP1xyXG5cdFx0XHRcdGlmICh0cmFuc2l0aW9uLm9mZnNldC5ncmVhdGVyVGhhbihwcmV2KSkge1xyXG5cdFx0XHRcdFx0dmFyIGxvY2FsQmVmb3JlOiBudW1iZXIgPSB0cmFuc2l0aW9uLmF0ICsgcHJldi5taWxsaXNlY29uZHMoKTtcclxuXHRcdFx0XHRcdHZhciBsb2NhbEFmdGVyOiBudW1iZXIgPSB0cmFuc2l0aW9uLmF0ICsgdHJhbnNpdGlvbi5vZmZzZXQubWlsbGlzZWNvbmRzKCk7XHJcblx0XHRcdFx0XHRpZiAodW5peE1pbGxpcyA+PSBsb2NhbEJlZm9yZSAmJiB1bml4TWlsbGlzIDwgbG9jYWxBZnRlcikge1xyXG5cdFx0XHRcdFx0XHR2YXIgZm9yd2FyZENoYW5nZSA9IHRyYW5zaXRpb24ub2Zmc2V0LnN1YihwcmV2KTtcclxuXHRcdFx0XHRcdFx0Ly8gbm9uLWV4aXN0aW5nIHRpbWVcclxuXHRcdFx0XHRcdFx0dmFyIGZhY3RvcjogbnVtYmVyID0gKG9wdCA9PT0gTm9ybWFsaXplT3B0aW9uLlVwID8gMSA6IC0xKTtcclxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBhID09PSBcIm9iamVjdFwiKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGJhc2ljcy51bml4VG9UaW1lTm9MZWFwU2Vjcyh1bml4TWlsbGlzICsgZmFjdG9yICogZm9yd2FyZENoYW5nZS5taWxsaXNlY29uZHMoKSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHVuaXhNaWxsaXMgKyBmYWN0b3IgKiBmb3J3YXJkQ2hhbmdlLm1pbGxpc2Vjb25kcygpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHByZXYgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdC8vIG5vIG5vbi1leGlzdGluZyB0aW1lXHJcblx0XHRcdHJldHVybiBhO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIGE7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBzdGFuZGFyZCB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gVVRDLCB3aXRob3V0IERTVC5cclxuXHQgKiBUaHJvd3MgaWYgaW5mbyBub3QgZm91bmQuXHJcblx0ICogQHBhcmFtIHpvbmVOYW1lXHRJQU5BIHRpbWUgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y01pbGxpc1x0VGltZXN0YW1wIGluIFVUQ1xyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldCh6b25lTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlcik6IER1cmF0aW9uIHtcclxuXHRcdHZhciB6b25lSW5mbzogWm9uZUluZm8gPSB0aGlzLmdldFpvbmVJbmZvKHpvbmVOYW1lLCB1dGNNaWxsaXMpO1xyXG5cdFx0cmV0dXJuIHpvbmVJbmZvLmdtdG9mZi5jbG9uZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuXHQgKiB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC5cclxuXHQgKiBUaHJvd3MgaWYgem9uZSBpbmZvIG5vdCBmb3VuZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB6b25lTmFtZVx0SUFOQSB0aW1lIHpvbmUgbmFtZVxyXG5cdCAqIEBwYXJhbSB1dGNNaWxsaXNcdFRpbWVzdGFtcCBpbiBVVENcclxuXHQgKi9cclxuXHRwdWJsaWMgdG90YWxPZmZzZXQoem9uZU5hbWU6IHN0cmluZywgdXRjTWlsbGlzOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHR2YXIgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjTWlsbGlzKTtcclxuXHRcdHZhciBkc3RPZmZzZXQ6IER1cmF0aW9uID0gbnVsbDtcclxuXHJcblx0XHRzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuTm9uZToge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLm1pbnV0ZXMoMCk7XHJcblx0XHRcdH0gYnJlYWs7XHJcblx0XHRcdGNhc2UgUnVsZVR5cGUuT2Zmc2V0OiB7XHJcblx0XHRcdFx0ZHN0T2Zmc2V0ID0gem9uZUluZm8ucnVsZU9mZnNldDtcclxuXHRcdFx0fSBicmVhaztcclxuXHRcdFx0Y2FzZSBSdWxlVHlwZS5SdWxlTmFtZToge1xyXG5cdFx0XHRcdGRzdE9mZnNldCA9IHRoaXMuZHN0T2Zmc2V0Rm9yUnVsZSh6b25lSW5mby5ydWxlTmFtZSwgdXRjTWlsbGlzLCB6b25lSW5mby5nbXRvZmYpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGRzdE9mZnNldC5hZGQoem9uZUluZm8uZ210b2ZmKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHpvbmUgcnVsZSBhYmJyZXZpYXRpb24sIGUuZy4gQ0VTVCBmb3IgQ2VudHJhbCBFdXJvcGVhbiBTdW1tZXIgVGltZS5cclxuXHQgKiBOb3RlIHRoaXMgaXMgZGVwZW5kZW50IG9uIHRoZSB0aW1lLCBiZWNhdXNlIHdpdGggdGltZSBkaWZmZXJlbnQgcnVsZXMgYXJlIGluIGVmZmVjdFxyXG5cdCAqIGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGFiYnJldmlhdGlvbnMuIFRoZXkgYWxzbyBjaGFuZ2Ugd2l0aCBEU1Q6IGUuZy4gQ0VTVCBvciBDRVQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIHV0Y01pbGxpc1x0VGltZXN0YW1wIGluIFVUQyB1bml4IG1pbGxpc2Vjb25kc1xyXG5cdCAqIEBwYXJhbSBkc3REZXBlbmRlbnQgKGRlZmF1bHQgdHJ1ZSkgc2V0IHRvIGZhbHNlIGZvciBhIERTVC1hZ25vc3RpYyBhYmJyZXZpYXRpb25cclxuXHQgKiBAcmV0dXJuXHRUaGUgYWJicmV2aWF0aW9uIG9mIHRoZSBydWxlIHRoYXQgaXMgaW4gZWZmZWN0XHJcblx0ICovXHJcblx0cHVibGljIGFiYnJldmlhdGlvbih6b25lTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlciwgZHN0RGVwZW5kZW50OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyB7XHJcblx0XHR2YXIgem9uZUluZm86IFpvbmVJbmZvID0gdGhpcy5nZXRab25lSW5mbyh6b25lTmFtZSwgdXRjTWlsbGlzKTtcclxuXHRcdHZhciBmb3JtYXQ6IHN0cmluZyA9IHpvbmVJbmZvLmZvcm1hdDtcclxuXHJcblx0XHQvLyBpcyBmb3JtYXQgZGVwZW5kZW50IG9uIERTVD9cclxuXHRcdGlmIChmb3JtYXQuaW5kZXhPZihcIiVzXCIpICE9PSAtMVxyXG5cdFx0XHQmJiB6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuXHRcdFx0dmFyIGxldHRlcjogc3RyaW5nO1xyXG5cdFx0XHQvLyBwbGFjZSBpbiBmb3JtYXQgc3RyaW5nXHJcblx0XHRcdGlmIChkc3REZXBlbmRlbnQpIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSB0aGlzLmxldHRlckZvclJ1bGUoem9uZUluZm8ucnVsZU5hbWUsIHV0Y01pbGxpcywgem9uZUluZm8uZ210b2ZmKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB1dGlsLmZvcm1hdChmb3JtYXQsIGxldHRlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZvcm1hdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHN0YW5kYXJkIHRpbWUgem9uZSBvZmZzZXQgZnJvbSBVVEMsIGV4Y2x1ZGluZyBEU1QsIGF0XHJcblx0ICogdGhlIGdpdmVuIExPQ0FMIHRpbWVzdGFtcCwgYWdhaW4gZXhjbHVkaW5nIERTVC5cclxuXHQgKlxyXG5cdCAqIElmIHRoZSBsb2NhbCB0aW1lc3RhbXAgZXhpc3RzIHR3aWNlIChhcyBjYW4gb2NjdXIgdmVyeSByYXJlbHkgZHVlIHRvIHpvbmUgY2hhbmdlcylcclxuXHQgKiB0aGVuIHRoZSBmaXJzdCBvY2N1cnJlbmNlIGlzIHJldHVybmVkLlxyXG5cdCAqXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxNaWxsaXNcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBzdGFuZGFyZE9mZnNldExvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsTWlsbGlzOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHR2YXIgem9uZUluZm9zOiBab25lSW5mb1tdID0gdGhpcy5nZXRab25lSW5mb3Moem9uZU5hbWUpO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB6b25lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0dmFyIHpvbmVJbmZvID0gem9uZUluZm9zW2ldO1xyXG5cdFx0XHRpZiAoem9uZUluZm8udW50aWwgPT09IG51bGwgfHwgem9uZUluZm8udW50aWwgKyB6b25lSW5mby5nbXRvZmYubWlsbGlzZWNvbmRzKCkgPiBsb2NhbE1pbGxpcykge1xyXG5cdFx0XHRcdHJldHVybiB6b25lSW5mby5nbXRvZmYuY2xvbmUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdG90YWwgdGltZSB6b25lIG9mZnNldCBmcm9tIFVUQywgaW5jbHVkaW5nIERTVCwgYXRcclxuXHQgKiB0aGUgZ2l2ZW4gTE9DQUwgdGltZXN0YW1wLiBOb24tZXhpc3RpbmcgbG9jYWwgdGltZSBpcyBub3JtYWxpemVkIG91dC5cclxuXHQgKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgVVRDIHRpbWVzIGFuZCB0aGVyZWZvcmUgbXVsdGlwbGUgb2Zmc2V0cyBmb3IgYSBsb2NhbCB0aW1lXHJcblx0ICogbmFtZWx5IGR1cmluZyBhIGJhY2t3YXJkIERTVCBjaGFuZ2UuIFRoaXMgcmV0dXJucyB0aGUgRklSU1Qgc3VjaCBvZmZzZXQuXHJcblx0ICogVGhyb3dzIGlmIHpvbmUgaW5mbyBub3QgZm91bmQuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gbG9jYWxNaWxsaXNcdFRpbWVzdGFtcCBpbiB0aW1lIHpvbmUgdGltZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyB0b3RhbE9mZnNldExvY2FsKHpvbmVOYW1lOiBzdHJpbmcsIGxvY2FsTWlsbGlzOiBudW1iZXIpOiBEdXJhdGlvbiB7XHJcblx0XHR2YXIgbm9ybWFsaXplZDogbnVtYmVyID0gdGhpcy5ub3JtYWxpemVMb2NhbCh6b25lTmFtZSwgbG9jYWxNaWxsaXMpO1xyXG5cdFx0dmFyIG5vcm1hbGl6ZWRUbTogVGltZVN0cnVjdCA9IGJhc2ljcy51bml4VG9UaW1lTm9MZWFwU2Vjcyhub3JtYWxpemVkKTtcclxuXHJcblx0XHQvLy8gTm90ZTogZHVyaW5nIG9mZnNldCBjaGFuZ2VzLCBsb2NhbCB0aW1lIGNhbiBiZWhhdmUgbGlrZTpcclxuXHRcdC8vIGZvcndhcmQgY2hhbmdlICgxaCk6ICAgMCAxIDMgNCA1XHJcblx0XHQvLyBmb3J3YXJkIGNoYW5nZSAoMmgpOiAgIDAgMSA0IDUgNlxyXG5cdFx0Ly8gYmFja3dhcmQgY2hhbmdlICgxaCk6ICAxIDIgMiAzIDRcclxuXHRcdC8vIGJhY2t3YXJkIGNoYW5nZSAoMmgpOiAgMSAyIDEgMiAzICA8LS0gbm90ZSB0aW1lIGdvaW5nIEJBQ0tXQVJEXHJcblxyXG5cdFx0Ly8gVGhlcmVmb3JlIGJpbmFyeSBzZWFyY2ggZG9lcyBub3QgYXBwbHkuIExpbmVhciBzZWFyY2ggdGhyb3VnaCB0cmFuc2l0aW9uc1xyXG5cdFx0Ly8gYW5kIHJldHVybiB0aGUgZmlyc3Qgb2Zmc2V0IHRoYXQgbWF0Y2hlc1xyXG5cclxuXHRcdHZhciB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZSwgbm9ybWFsaXplZFRtLnllYXIgLSAxLCBub3JtYWxpemVkVG0ueWVhciArIDEpO1xyXG5cdFx0dmFyIHByZXY6IFRyYW5zaXRpb24gPSBudWxsO1xyXG5cdFx0dmFyIHByZXZQcmV2OiBUcmFuc2l0aW9uID0gbnVsbDtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdHJhbnNpdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0dmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgKyB0cmFuc2l0aW9uLm9mZnNldC5taWxsaXNlY29uZHMoKSA+IG5vcm1hbGl6ZWQpIHtcclxuXHRcdFx0XHQvLyBmb3VuZCBvZmZzZXQ6IHByZXYub2Zmc2V0IGFwcGxpZXNcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0XHRwcmV2UHJldiA9IHByZXY7XHJcblx0XHRcdHByZXYgPSB0cmFuc2l0aW9uO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXHJcblx0XHRpZiAocHJldikge1xyXG5cdFx0XHQvLyBzcGVjaWFsIGNhcmUgZHVyaW5nIGJhY2t3YXJkIGNoYW5nZTogdGFrZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGxvY2FsIHRpbWVcclxuXHRcdFx0aWYgKHByZXZQcmV2ICYmIHByZXZQcmV2Lm9mZnNldC5ncmVhdGVyVGhhbihwcmV2Lm9mZnNldCkpIHtcclxuXHRcdFx0XHQvLyBiYWNrd2FyZCBjaGFuZ2VcclxuXHRcdFx0XHR2YXIgZGlmZiA9IHByZXZQcmV2Lm9mZnNldC5zdWIocHJldi5vZmZzZXQpO1xyXG5cdFx0XHRcdGlmIChub3JtYWxpemVkID49IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKVxyXG5cdFx0XHRcdFx0JiYgbm9ybWFsaXplZCA8IHByZXYuYXQgKyBwcmV2Lm9mZnNldC5taWxsaXNlY29uZHMoKSArIGRpZmYubWlsbGlzZWNvbmRzKCkpIHtcclxuXHRcdFx0XHRcdC8vIHdpdGhpbiBkdXBsaWNhdGUgcmFuZ2VcclxuXHRcdFx0XHRcdHJldHVybiBwcmV2UHJldi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHByZXYub2Zmc2V0LmNsb25lKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBwcmV2Lm9mZnNldC5jbG9uZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0aGlzIGNhbm5vdCBoYXBwZW4gYXMgdGhlIHRyYW5zaXRpb25zIGFycmF5IGlzIGd1YXJhbnRlZWQgdG8gY29udGFpbiBhIHRyYW5zaXRpb24gYXQgdGhlXHJcblx0XHRcdC8vIGJlZ2lubmluZyBvZiB0aGUgcmVxdWVzdGVkIGZyb21ZZWFyXHJcblx0XHRcdHJldHVybiBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIERTVCBvZmZzZXQgKFdJVEhPVVQgdGhlIHN0YW5kYXJkIHpvbmUgb2Zmc2V0KSBmb3IgdGhlIGdpdmVuXHJcblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcblx0ICogQHBhcmFtIHV0Y01pbGxpc1x0VVRDIHRpbWVzdGFtcFxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGRzdE9mZnNldEZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjTWlsbGlzOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IER1cmF0aW9uIHtcclxuXHRcdHZhciB0bTogVGltZVN0cnVjdCA9IGJhc2ljcy51bml4VG9UaW1lTm9MZWFwU2Vjcyh1dGNNaWxsaXMpO1xyXG5cclxuXHRcdC8vIGZpbmQgYXBwbGljYWJsZSB0cmFuc2l0aW9uIG1vbWVudHNcclxuXHRcdHZhciB0cmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMocnVsZU5hbWUsIHRtLnllYXIgLSAxLCB0bS55ZWFyLCBzdGFuZGFyZE9mZnNldCk7XHJcblxyXG5cdFx0Ly8gZmluZCB0aGUgbGFzdCBwcmlvciB0byBnaXZlbiBkYXRlXHJcblx0XHR2YXIgb2Zmc2V0OiBEdXJhdGlvbiA9IG51bGw7XHJcblx0XHRmb3IgKHZhciBpID0gdHJhbnNpdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0dmFyIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uc1tpXTtcclxuXHRcdFx0aWYgKHRyYW5zaXRpb24uYXQgPD0gdXRjTWlsbGlzKSB7XHJcblx0XHRcdFx0b2Zmc2V0ID0gdHJhbnNpdGlvbi5vZmZzZXQuY2xvbmUoKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKCFvZmZzZXQpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gb2Zmc2V0IGZvdW5kLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb2Zmc2V0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgdGltZSB6b25lIGxldHRlciBmb3IgdGhlIGdpdmVuXHJcblx0ICogcnVsZXNldCBhbmQgdGhlIGdpdmVuIFVUQyB0aW1lc3RhbXBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0bmFtZSBvZiBydWxlc2V0XHJcblx0ICogQHBhcmFtIHV0Y01pbGxpc1x0VVRDIHRpbWVzdGFtcFxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICovXHJcblx0cHVibGljIGxldHRlckZvclJ1bGUocnVsZU5hbWU6IHN0cmluZywgdXRjTWlsbGlzOiBudW1iZXIsIHN0YW5kYXJkT2Zmc2V0OiBEdXJhdGlvbik6IHN0cmluZyB7XHJcblx0XHR2YXIgdG06IFRpbWVTdHJ1Y3QgPSBiYXNpY3MudW5peFRvVGltZU5vTGVhcFNlY3ModXRjTWlsbGlzKTtcclxuXHJcblx0XHQvLyBmaW5kIGFwcGxpY2FibGUgdHJhbnNpdGlvbiBtb21lbnRzXHJcblx0XHR2YXIgdHJhbnNpdGlvbnM6IFRyYW5zaXRpb25bXSA9IHRoaXMuZ2V0VHJhbnNpdGlvbnNEc3RPZmZzZXRzKHJ1bGVOYW1lLCB0bS55ZWFyIC0gMSwgdG0ueWVhciwgc3RhbmRhcmRPZmZzZXQpO1xyXG5cclxuXHRcdC8vIGZpbmQgdGhlIGxhc3QgcHJpb3IgdG8gZ2l2ZW4gZGF0ZVxyXG5cdFx0dmFyIGxldHRlcjogc3RyaW5nID0gbnVsbDtcclxuXHRcdGZvciAodmFyIGkgPSB0cmFuc2l0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG5cdFx0XHR2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25zW2ldO1xyXG5cdFx0XHRpZiAodHJhbnNpdGlvbi5hdCA8PSB1dGNNaWxsaXMpIHtcclxuXHRcdFx0XHRsZXR0ZXIgPSB0cmFuc2l0aW9uLmxldHRlcjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0aWYgKGxldHRlciA9PT0gbnVsbCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBvZmZzZXQgZm91bmQuXCIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBsZXR0ZXI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXR1cm4gYSBsaXN0IG9mIGFsbCB0cmFuc2l0aW9ucyBpbiBbZnJvbVllYXIuLnRvWWVhcl0gc29ydGVkIGJ5IGVmZmVjdGl2ZSBkYXRlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gcnVsZU5hbWVcdE5hbWUgb2YgdGhlIHJ1bGUgc2V0XHJcblx0ICogQHBhcmFtIGZyb21ZZWFyXHRmaXJzdCB5ZWFyIHRvIHJldHVybiB0cmFuc2l0aW9ucyBmb3JcclxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gcmV0dXJuIHRyYW5zaXRpb25zIGZvclxyXG5cdCAqIEBwYXJhbSBzdGFuZGFyZE9mZnNldFx0U3RhbmRhcmQgb2Zmc2V0IHdpdGhvdXQgRFNUIGZvciB0aGUgdGltZSB6b25lXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIFRyYW5zaXRpb25zLCB3aXRoIERTVCBvZmZzZXRzIChubyBzdGFuZGFyZCBvZmZzZXQgaW5jbHVkZWQpXHJcblx0ICovXHJcblx0cHVibGljIGdldFRyYW5zaXRpb25zRHN0T2Zmc2V0cyhydWxlTmFtZTogc3RyaW5nLCBmcm9tWWVhcjogbnVtYmVyLCB0b1llYXI6IG51bWJlciwgc3RhbmRhcmRPZmZzZXQ6IER1cmF0aW9uKTogVHJhbnNpdGlvbltdIHtcclxuXHRcdGFzc2VydChmcm9tWWVhciA8PSB0b1llYXIsIFwiZnJvbVllYXIgbXVzdCBiZSA8PSB0b1llYXJcIik7XHJcblxyXG5cdFx0dmFyIHJ1bGVJbmZvczogUnVsZUluZm9bXSA9IHRoaXMuZ2V0UnVsZUluZm9zKHJ1bGVOYW1lKTtcclxuXHRcdHZhciByZXN1bHQ6IFRyYW5zaXRpb25bXSA9IFtdO1xyXG5cclxuXHRcdGZvciAodmFyIHkgPSBmcm9tWWVhcjsgeSA8PSB0b1llYXI7IHkrKykge1xyXG5cdFx0XHR2YXIgcHJldkluZm86IFJ1bGVJbmZvID0gbnVsbDtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBydWxlSW5mb3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHR2YXIgcnVsZUluZm86IFJ1bGVJbmZvID0gcnVsZUluZm9zW2ldO1xyXG5cdFx0XHRcdGlmIChydWxlSW5mby5hcHBsaWNhYmxlKHkpKSB7XHJcblx0XHRcdFx0XHRyZXN1bHQucHVzaChuZXcgVHJhbnNpdGlvbihcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8udHJhbnNpdGlvblRpbWVVdGMoeSwgc3RhbmRhcmRPZmZzZXQsIHByZXZJbmZvKSxcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8uc2F2ZSxcclxuXHRcdFx0XHRcdFx0cnVsZUluZm8ubGV0dGVyKSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHByZXZJbmZvID0gcnVsZUluZm87XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybiBib3RoIHpvbmUgYW5kIHJ1bGUgY2hhbmdlcyBhcyB0b3RhbCAoc3RkICsgZHN0KSBvZmZzZXRzLlxyXG5cdCAqIEFkZHMgYW4gaW5pdGlhbCB0cmFuc2l0aW9uIGlmIHRoZXJlIGlzIG5vIHpvbmUgY2hhbmdlIHdpdGhpbiB0aGUgcmFuZ2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lXHJcblx0ICogQHBhcmFtIGZyb21ZZWFyXHRGaXJzdCB5ZWFyIHRvIGluY2x1ZGVcclxuXHQgKiBAcGFyYW0gdG9ZZWFyXHRMYXN0IHllYXIgdG8gaW5jbHVkZVxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRUcmFuc2l0aW9uc1RvdGFsT2Zmc2V0cyh6b25lTmFtZTogc3RyaW5nLCBmcm9tWWVhcjogbnVtYmVyLCB0b1llYXI6IG51bWJlcik6IFRyYW5zaXRpb25bXSB7XHJcblx0XHRhc3NlcnQoZnJvbVllYXIgPD0gdG9ZZWFyLCBcImZyb21ZZWFyIG11c3QgYmUgPD0gdG9ZZWFyXCIpO1xyXG5cclxuXHRcdHZhciBzdGFydE1pbGxpczogbnVtYmVyID0gYmFzaWNzLnRpbWVUb1VuaXhOb0xlYXBTZWNzKGZyb21ZZWFyKTtcclxuXHRcdHZhciBlbmRNaWxsaXM6IG51bWJlciA9IGJhc2ljcy50aW1lVG9Vbml4Tm9MZWFwU2Vjcyh0b1llYXIgKyAxKTtcclxuXHJcblxyXG5cdFx0dmFyIHpvbmVJbmZvczogWm9uZUluZm9bXSA9IHRoaXMuZ2V0Wm9uZUluZm9zKHpvbmVOYW1lKTtcclxuXHRcdGFzc2VydCh6b25lSW5mb3MubGVuZ3RoID4gMCwgXCJFbXB0eSB6b25lSW5mb3MgYXJyYXkgcmV0dXJuZWQgZnJvbSBnZXRab25lSW5mb3MoKVwiKTtcclxuXHJcblx0XHR2YXIgcmVzdWx0OiBUcmFuc2l0aW9uW10gPSBbXTtcclxuXHJcblx0XHR2YXIgcHJldlpvbmU6IFpvbmVJbmZvID0gbnVsbDtcclxuXHRcdHZhciBwcmV2VW50aWxUbTogVGltZVN0cnVjdCA9IG51bGw7XHJcblx0XHR2YXIgcHJldlN0ZE9mZnNldDogRHVyYXRpb24gPSBEdXJhdGlvbi5ob3VycygwKTtcclxuXHRcdHZhciBwcmV2RHN0T2Zmc2V0OiBEdXJhdGlvbiA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0dmFyIHByZXZMZXR0ZXI6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdHZhciB1bnRpbFRtOiBUaW1lU3RydWN0ID0gKHpvbmVJbmZvLnVudGlsID8gYmFzaWNzLnVuaXhUb1RpbWVOb0xlYXBTZWNzKHpvbmVJbmZvLnVudGlsKSA6IG5ldyBUaW1lU3RydWN0KHRvWWVhciArIDEpKTtcclxuXHRcdFx0dmFyIHN0ZE9mZnNldDogRHVyYXRpb24gPSBwcmV2U3RkT2Zmc2V0O1xyXG5cdFx0XHR2YXIgZHN0T2Zmc2V0OiBEdXJhdGlvbiA9IHByZXZEc3RPZmZzZXQ7XHJcblx0XHRcdHZhciBsZXR0ZXI6IHN0cmluZyA9IHByZXZMZXR0ZXI7XHJcblxyXG5cdFx0XHQvLyB6b25lIGFwcGxpY2FibGU/XHJcblx0XHRcdGlmICgocHJldlpvbmUgPT09IG51bGwgfHwgcHJldlpvbmUudW50aWwgPCBlbmRNaWxsaXMgLSAxKVxyXG5cdFx0XHRcdCYmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+PSBzdGFydE1pbGxpcykpIHtcclxuXHJcblx0XHRcdFx0c3RkT2Zmc2V0ID0gem9uZUluZm8uZ210b2ZmO1xyXG5cclxuXHRcdFx0XHRzd2l0Y2ggKHpvbmVJbmZvLnJ1bGVUeXBlKSB7XHJcblx0XHRcdFx0XHRjYXNlIFJ1bGVUeXBlLk5vbmU6XHJcblx0XHRcdFx0XHRcdGRzdE9mZnNldCA9IER1cmF0aW9uLmhvdXJzKDApO1xyXG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuT2Zmc2V0OlxyXG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSB6b25lSW5mby5ydWxlT2Zmc2V0O1xyXG5cdFx0XHRcdFx0XHRsZXR0ZXIgPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgUnVsZVR5cGUuUnVsZU5hbWU6XHJcblx0XHRcdFx0XHRcdC8vIGNoZWNrIHdoZXRoZXIgdGhlIGZpcnN0IHJ1bGUgdGFrZXMgZWZmZWN0IGltbWVkaWF0ZWx5IG9uIHRoZSB6b25lIHRyYW5zaXRpb25cclxuXHRcdFx0XHRcdFx0Ly8gKGUuZy4gTHliaWEpXHJcblx0XHRcdFx0XHRcdGlmIChwcmV2Wm9uZSkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciBydWxlSW5mb3M6IFJ1bGVJbmZvW10gPSB0aGlzLmdldFJ1bGVJbmZvcyh6b25lSW5mby5ydWxlTmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0cnVsZUluZm9zLmZvckVhY2goKHJ1bGVJbmZvOiBSdWxlSW5mbyk6IHZvaWQgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLmFwcGxpY2FibGUocHJldlVudGlsVG0ueWVhcikpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHJ1bGVJbmZvLnRyYW5zaXRpb25UaW1lVXRjKHByZXZVbnRpbFRtLnllYXIsIHN0ZE9mZnNldCwgbnVsbCkgPT09IHByZXZab25lLnVudGlsKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZHN0T2Zmc2V0ID0gcnVsZUluZm8uc2F2ZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXR0ZXIgPSBydWxlSW5mby5sZXR0ZXI7XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIGFkZCBhIHRyYW5zaXRpb24gZm9yIHRoZSB6b25lIHRyYW5zaXRpb25cclxuXHRcdFx0XHR2YXIgYXQ6IG51bWJlciA9IChwcmV2Wm9uZSA/IHByZXZab25lLnVudGlsIDogc3RhcnRNaWxsaXMpO1xyXG5cdFx0XHRcdHJlc3VsdC5wdXNoKG5ldyBUcmFuc2l0aW9uKGF0LCBzdGRPZmZzZXQuYWRkKGRzdE9mZnNldCksIGxldHRlcikpO1xyXG5cclxuXHRcdFx0XHQvLyBhZGQgdHJhbnNpdGlvbnMgZm9yIHRoZSB6b25lIHJ1bGVzIGluIHRoZSByYW5nZVxyXG5cdFx0XHRcdGlmICh6b25lSW5mby5ydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUpIHtcclxuXHRcdFx0XHRcdHZhciBkc3RUcmFuc2l0aW9uczogVHJhbnNpdGlvbltdID0gdGhpcy5nZXRUcmFuc2l0aW9uc0RzdE9mZnNldHMoXHJcblx0XHRcdFx0XHRcdHpvbmVJbmZvLnJ1bGVOYW1lLFxyXG5cdFx0XHRcdFx0XHRwcmV2VW50aWxUbSA/IE1hdGgubWF4KHByZXZVbnRpbFRtLnllYXIsIGZyb21ZZWFyKSA6IGZyb21ZZWFyLFxyXG5cdFx0XHRcdFx0XHRNYXRoLm1pbih1bnRpbFRtLnllYXIsIHRvWWVhciksIHN0ZE9mZnNldCk7XHJcblx0XHRcdFx0XHRkc3RUcmFuc2l0aW9ucy5mb3JFYWNoKCh0cmFuc2l0aW9uOiBUcmFuc2l0aW9uKTogdm9pZCA9PiB7XHJcblx0XHRcdFx0XHRcdGxldHRlciA9IHRyYW5zaXRpb24ubGV0dGVyO1xyXG5cdFx0XHRcdFx0XHRkc3RPZmZzZXQgPSB0cmFuc2l0aW9uLm9mZnNldDtcclxuXHRcdFx0XHRcdFx0cmVzdWx0LnB1c2gobmV3IFRyYW5zaXRpb24odHJhbnNpdGlvbi5hdCwgdHJhbnNpdGlvbi5vZmZzZXQuYWRkKHN0ZE9mZnNldCksIHRyYW5zaXRpb24ubGV0dGVyKSk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHByZXZab25lID0gem9uZUluZm87XHJcblx0XHRcdHByZXZVbnRpbFRtID0gdW50aWxUbTtcclxuXHRcdFx0cHJldlN0ZE9mZnNldCA9IHN0ZE9mZnNldDtcclxuXHRcdFx0cHJldkRzdE9mZnNldCA9IGRzdE9mZnNldDtcclxuXHRcdFx0cHJldkxldHRlciA9IGxldHRlcjtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogVHJhbnNpdGlvbiwgYjogVHJhbnNpdGlvbik6IG51bWJlciA9PiB7XHJcblx0XHRcdHJldHVybiBhLmF0IC0gYi5hdDtcclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgem9uZSBpbmZvIGZvciB0aGUgZ2l2ZW4gVVRDIHRpbWVzdGFtcC4gVGhyb3dzIGlmIG5vdCBmb3VuZC5cclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgdGltZSB6b25lIG5hbWVcclxuXHQgKiBAcGFyYW0gdXRjTWlsbGlzXHRVVEMgdGltZSBzdGFtcFxyXG5cdCAqIEByZXR1cm5zXHRab25lSW5mbyBvYmplY3QuIERvIG5vdCBjaGFuZ2UsIHdlIGNhY2hlIHRoaXMgb2JqZWN0LlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBnZXRab25lSW5mbyh6b25lTmFtZTogc3RyaW5nLCB1dGNNaWxsaXM6IG51bWJlcik6IFpvbmVJbmZvIHtcclxuXHRcdHZhciB6b25lSW5mb3M6IFpvbmVJbmZvW10gPSB0aGlzLmdldFpvbmVJbmZvcyh6b25lTmFtZSk7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHpvbmVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR2YXIgem9uZUluZm8gPSB6b25lSW5mb3NbaV07XHJcblx0XHRcdGlmICh6b25lSW5mby51bnRpbCA9PT0gbnVsbCB8fCB6b25lSW5mby51bnRpbCA+IHV0Y01pbGxpcykge1xyXG5cdFx0XHRcdHJldHVybiB6b25lSW5mbztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gem9uZSBpbmZvIGZvdW5kXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQ6IHpvbmUgaW5mbyBjYWNoZVxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3pvbmVJbmZvQ2FjaGU6IHsgW2luZGV4OiBzdHJpbmddOiBab25lSW5mb1tdIH0gPSB7fTtcclxuXHJcblx0LyoqXHJcblx0ICogUmV0dXJuIHRoZSB6b25lIHJlY29yZHMgZm9yIGEgZ2l2ZW4gem9uZSBuYW1lLCBhZnRlclxyXG5cdCAqIGZvbGxvd2luZyBhbnkgbGlua3MuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gem9uZU5hbWVcdElBTkEgem9uZSBuYW1lIGxpa2UgXCJQYWNpZmljL0VmYXRlXCJcclxuXHQgKiBAcmV0dXJuIEFycmF5IG9mIHpvbmUgaW5mb3MuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcblx0ICovXHJcblx0cHVibGljIGdldFpvbmVJbmZvcyh6b25lTmFtZTogc3RyaW5nKTogWm9uZUluZm9bXSB7XHJcblx0XHQvLyBGSVJTVCB2YWxpZGF0ZSB6b25lIG5hbWUgYmVmb3JlIHNlYXJjaGluZyBjYWNoZVxyXG5cdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFRha2UgZnJvbSBjYWNoZVxyXG5cdFx0aWYgKHRoaXMuX3pvbmVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkoem9uZU5hbWUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl96b25lSW5mb0NhY2hlW3pvbmVOYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgcmVzdWx0OiBab25lSW5mb1tdID0gW107XHJcblx0XHR2YXIgYWN0dWFsWm9uZU5hbWU6IHN0cmluZyA9IHpvbmVOYW1lO1xyXG5cdFx0dmFyIHpvbmVFbnRyaWVzOiBhbnkgPSB0aGlzLl9kYXRhLnpvbmVzW3pvbmVOYW1lXTtcclxuXHRcdC8vIGZvbGxvdyBsaW5rc1xyXG5cdFx0d2hpbGUgKHR5cGVvZiAoem9uZUVudHJpZXMpID09PSBcInN0cmluZ1wiKSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRpZiAoIXRoaXMuX2RhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoem9uZUVudHJpZXMpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiWm9uZSBcXFwiXCIgKyB6b25lRW50cmllcyArIFwiXFxcIiBub3QgZm91bmQgKHJlZmVycmVkIHRvIGluIGxpbmsgZnJvbSBcXFwiXCJcclxuXHRcdFx0XHRcdCsgem9uZU5hbWUgKyBcIlxcXCIgdmlhIFxcXCJcIiArIGFjdHVhbFpvbmVOYW1lICsgXCJcXFwiXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGFjdHVhbFpvbmVOYW1lID0gem9uZUVudHJpZXM7XHJcblx0XHRcdHpvbmVFbnRyaWVzID0gdGhpcy5fZGF0YS56b25lc1thY3R1YWxab25lTmFtZV07XHJcblx0XHR9XHJcblx0XHQvLyBmaW5hbCB6b25lIGluZm8gZm91bmRcclxuXHRcdGZvciAodmFyIGk6IG51bWJlciA9IDA7IGkgPCB6b25lRW50cmllcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHR2YXIgem9uZUVudHJ5ID0gem9uZUVudHJpZXNbaV07XHJcblx0XHRcdHZhciBydWxlVHlwZTogUnVsZVR5cGUgPSB0aGlzLnBhcnNlUnVsZVR5cGUoem9uZUVudHJ5WzFdKTtcclxuXHRcdFx0dmFyIHVudGlsOiBudW1iZXIgPSBtYXRoLmZpbHRlckZsb2F0KHpvbmVFbnRyeVszXSk7XHJcblx0XHRcdGlmIChpc05hTih1bnRpbCkpIHtcclxuXHRcdFx0XHR1bnRpbCA9IG51bGw7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBab25lSW5mbyhcclxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKC0xICogbWF0aC5maWx0ZXJGbG9hdCh6b25lRW50cnlbMF0pKSxcclxuXHRcdFx0XHRydWxlVHlwZSxcclxuXHRcdFx0XHRydWxlVHlwZSA9PT0gUnVsZVR5cGUuT2Zmc2V0ID8gbmV3IER1cmF0aW9uKHpvbmVFbnRyeVsxXSkgOiBuZXcgRHVyYXRpb24oKSxcclxuXHRcdFx0XHRydWxlVHlwZSA9PT0gUnVsZVR5cGUuUnVsZU5hbWUgPyB6b25lRW50cnlbMV0gOiBcIlwiLFxyXG5cdFx0XHRcdHpvbmVFbnRyeVsyXSxcclxuXHRcdFx0XHR1bnRpbFxyXG5cdFx0XHQpKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogWm9uZUluZm8sIGI6IFpvbmVJbmZvKTogbnVtYmVyID0+IHtcclxuXHRcdFx0Ly8gc29ydCBudWxsIGxhc3RcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLnVudGlsID09PSBudWxsICYmIGIudW50aWwgPT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gMDtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoYS51bnRpbCAhPT0gbnVsbCAmJiBiLnVudGlsID09PSBudWxsKSB7XHJcblx0XHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChhLnVudGlsID09PSBudWxsICYmIGIudW50aWwgIT09IG51bGwpIHtcclxuXHRcdFx0XHRyZXR1cm4gMTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gKGEudW50aWwgLSBiLnVudGlsKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuX3pvbmVJbmZvQ2FjaGVbem9uZU5hbWVdID0gcmVzdWx0O1xyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBlcmZvcm1hbmNlIGltcHJvdmVtZW50OiBydWxlIGluZm8gY2FjaGVcclxuXHQgKi9cclxuXHRwcml2YXRlIF9ydWxlSW5mb0NhY2hlOiB7IFtpbmRleDogc3RyaW5nXTogUnVsZUluZm9bXSB9ID0ge307XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHJ1bGUgc2V0IHdpdGggdGhlIGdpdmVuIHJ1bGUgbmFtZSxcclxuXHQgKiBzb3J0ZWQgYnkgZmlyc3QgZWZmZWN0aXZlIGRhdGUgKHVuY29tcGVuc2F0ZWQgZm9yIFwid1wiIG9yIFwic1wiIEF0VGltZSlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBydWxlTmFtZVx0TmFtZSBvZiBydWxlIHNldFxyXG5cdCAqIEByZXR1cm4gUnVsZUluZm8gYXJyYXkuIERvIG5vdCBjaGFuZ2UsIHRoaXMgaXMgYSBjYWNoZWQgdmFsdWUuXHJcblx0ICovXHJcblx0cHVibGljIGdldFJ1bGVJbmZvcyhydWxlTmFtZTogc3RyaW5nKTogUnVsZUluZm9bXSB7XHJcblx0XHQvLyB2YWxpZGF0ZSBuYW1lIEJFRk9SRSBzZWFyY2hpbmcgY2FjaGVcclxuXHRcdGlmICghdGhpcy5fZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBzZXQgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyByZXR1cm4gZnJvbSBjYWNoZVxyXG5cdFx0aWYgKHRoaXMuX3J1bGVJbmZvQ2FjaGUuaGFzT3duUHJvcGVydHkocnVsZU5hbWUpKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgcmVzdWx0OiBSdWxlSW5mb1tdID0gW107XHJcblx0XHR2YXIgcnVsZVNldCA9IHRoaXMuX2RhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBydWxlU2V0Lmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHZhciBydWxlID0gcnVsZVNldFtpXTtcclxuXHJcblx0XHRcdHZhciBmcm9tWWVhcjogbnVtYmVyID0gKHJ1bGVbMF0gPT09IFwiTmFOXCIgPyAtMTAwMDAgOiBwYXJzZUludChydWxlWzBdLCAxMCkpO1xyXG5cdFx0XHR2YXIgdG9UeXBlOiBUb1R5cGUgPSB0aGlzLnBhcnNlVG9UeXBlKHJ1bGVbMV0pO1xyXG5cdFx0XHR2YXIgdG9ZZWFyOiBudW1iZXIgPSAodG9UeXBlID09PSBUb1R5cGUuTWF4ID8gMCA6IChydWxlWzFdID09PSBcIm9ubHlcIiA/IGZyb21ZZWFyIDogcGFyc2VJbnQocnVsZVsxXSwgMTApKSk7XHJcblx0XHRcdHZhciBvblR5cGU6IE9uVHlwZSA9IHRoaXMucGFyc2VPblR5cGUocnVsZVs0XSk7XHJcblx0XHRcdHZhciBvbkRheTogbnVtYmVyID0gdGhpcy5wYXJzZU9uRGF5KHJ1bGVbNF0sIG9uVHlwZSk7XHJcblx0XHRcdHZhciBvbldlZWtEYXk6IFdlZWtEYXkgPSB0aGlzLnBhcnNlT25XZWVrRGF5KHJ1bGVbNF0pO1xyXG5cdFx0XHR2YXIgbW9udGhOYW1lOiBzdHJpbmcgPSA8c3RyaW5nPnJ1bGVbM107XHJcblx0XHRcdHZhciBtb250aE51bWJlcjogbnVtYmVyID0gbW9udGhOYW1lVG9TdHJpbmcobW9udGhOYW1lKTtcclxuXHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBSdWxlSW5mbyhcclxuXHRcdFx0XHRmcm9tWWVhcixcclxuXHRcdFx0XHR0b1R5cGUsXHJcblx0XHRcdFx0dG9ZZWFyLFxyXG5cdFx0XHRcdHJ1bGVbMl0sXHJcblx0XHRcdFx0bW9udGhOdW1iZXIsXHJcblx0XHRcdFx0b25UeXBlLFxyXG5cdFx0XHRcdG9uRGF5LFxyXG5cdFx0XHRcdG9uV2Vla0RheSxcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMF0sIDEwKSwgMjQpLCAvLyBub3RlIHRoZSBkYXRhYmFzZSBzb21ldGltZXMgY29udGFpbnMgXCIyNFwiIGFzIGhvdXIgdmFsdWVcclxuXHRcdFx0XHRtYXRoLnBvc2l0aXZlTW9kdWxvKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSwgNjApLFxyXG5cdFx0XHRcdG1hdGgucG9zaXRpdmVNb2R1bG8ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApLCA2MCksXHJcblx0XHRcdFx0dGhpcy5wYXJzZUF0VHlwZShydWxlWzVdWzNdKSxcclxuXHRcdFx0XHREdXJhdGlvbi5taW51dGVzKHBhcnNlSW50KHJ1bGVbNl0sIDEwKSksXHJcblx0XHRcdFx0cnVsZVs3XSA9PT0gXCItXCIgPyBcIlwiIDogcnVsZVs3XVxyXG5cdFx0XHRcdCkpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQuc29ydCgoYTogUnVsZUluZm8sIGI6IFJ1bGVJbmZvKTogbnVtYmVyID0+IHtcclxuXHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdGlmIChhLmVmZmVjdGl2ZUVxdWFsKGIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcdH0gZWxzZSBpZiAoYS5lZmZlY3RpdmVMZXNzKGIpKSB7XHJcblx0XHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLl9ydWxlSW5mb0NhY2hlW3J1bGVOYW1lXSA9IHJlc3VsdDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgUlVMRVMgY29sdW1uIG9mIGEgem9uZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlUnVsZVR5cGUocnVsZTogc3RyaW5nKTogUnVsZVR5cGUge1xyXG5cdFx0aWYgKHJ1bGUgPT09IFwiLVwiKSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5Ob25lO1xyXG5cdFx0fSBlbHNlIGlmIChpc1ZhbGlkT2Zmc2V0U3RyaW5nKHJ1bGUpKSB7XHJcblx0XHRcdHJldHVybiBSdWxlVHlwZS5PZmZzZXQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gUnVsZVR5cGUuUnVsZU5hbWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgVE8gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlVG9UeXBlKHRvOiBzdHJpbmcpOiBUb1R5cGUge1xyXG5cdFx0aWYgKHRvID09PSBcIm1heFwiKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuTWF4O1xyXG5cdFx0fSBlbHNlIGlmICh0byA9PT0gXCJvbmx5XCIpIHtcclxuXHRcdFx0cmV0dXJuIFRvVHlwZS5ZZWFyOyAvLyB5ZXMgd2UgcmV0dXJuIFllYXIgZm9yIG9ubHlcclxuXHRcdH0gZWxzZSBpZiAoIWlzTmFOKHBhcnNlSW50KHRvLCAxMCkpKSB7XHJcblx0XHRcdHJldHVybiBUb1R5cGUuWWVhcjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRPIGNvbHVtbiBpbmNvcnJlY3Q6IFwiICsgdG8pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgT04gY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25UeXBlKG9uOiBzdHJpbmcpOiBPblR5cGUge1xyXG5cdFx0aWYgKG9uLmxlbmd0aCA+IDQgJiYgb24uc3Vic3RyKDAsIDQpID09PSBcImxhc3RcIikge1xyXG5cdFx0XHRyZXR1cm4gT25UeXBlLkxhc3RYO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9uLmluZGV4T2YoXCI8PVwiKSAhPT0gLTEpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5MZXFYO1xyXG5cdFx0fVxyXG5cdFx0aWYgKG9uLmluZGV4T2YoXCI+PVwiKSAhPT0gLTEpIHtcclxuXHRcdFx0cmV0dXJuIE9uVHlwZS5HcmVxWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBPblR5cGUuRGF5TnVtO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBkYXkgbnVtYmVyIGZyb20gYW4gT04gY29sdW1uIHN0cmluZywgMCBpZiBubyBkYXkuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25EYXkob246IHN0cmluZywgb25UeXBlOiBPblR5cGUpOiBudW1iZXIge1xyXG5cdFx0c3dpdGNoIChvblR5cGUpIHtcclxuXHRcdFx0Y2FzZSBPblR5cGUuRGF5TnVtOiByZXR1cm4gcGFyc2VJbnQob24sIDEwKTtcclxuXHRcdFx0Y2FzZSBPblR5cGUuTGVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPD1cIikgKyAyKSwgMTApO1xyXG5cdFx0XHRjYXNlIE9uVHlwZS5HcmVxWDogcmV0dXJuIHBhcnNlSW50KG9uLnN1YnN0cihvbi5pbmRleE9mKFwiPj1cIikgKyAyKSwgMTApO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRcdFx0aWYgKHRydWUpIHtcclxuXHRcdFx0XHRcdHJldHVybiAwO1xyXG5cdFx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgZGF5LW9mLXdlZWsgZnJvbSBhbiBPTiBjb2x1bW4gc3RyaW5nLCBTdW5kYXkgaWYgbm90IHByZXNlbnQuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlT25XZWVrRGF5KG9uOiBzdHJpbmcpOiBXZWVrRGF5IHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcblx0XHRcdGlmIChvbi5pbmRleE9mKFR6RGF5TmFtZXNbaV0pICE9PSAtMSkge1xyXG5cdFx0XHRcdHJldHVybiA8V2Vla0RheT5pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXHJcblx0XHRpZiAodHJ1ZSkge1xyXG5cdFx0XHRyZXR1cm4gV2Vla0RheS5TdW5kYXk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQYXJzZSB0aGUgQVQgY29sdW1uIG9mIGEgcnVsZSBpbmZvIGVudHJ5XHJcblx0ICogYW5kIHNlZSB3aGF0IGtpbmQgb2YgZW50cnkgaXQgaXMuXHJcblx0ICovXHJcblx0cHVibGljIHBhcnNlQXRUeXBlKGF0OiBhbnkpOiBBdFR5cGUge1xyXG5cdFx0c3dpdGNoIChhdCkge1xyXG5cdFx0XHRjYXNlIFwic1wiOiByZXR1cm4gQXRUeXBlLlN0YW5kYXJkO1xyXG5cdFx0XHRjYXNlIFwidVwiOiByZXR1cm4gQXRUeXBlLlV0YztcclxuXHRcdFx0Y2FzZSBcImdcIjogcmV0dXJuIEF0VHlwZS5VdGM7XHJcblx0XHRcdGNhc2UgXCJ6XCI6IHJldHVybiBBdFR5cGUuVXRjO1xyXG5cdFx0XHRjYXNlIFwid1wiOiByZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdGNhc2UgXCJcIjogcmV0dXJuIEF0VHlwZS5XYWxsO1xyXG5cdFx0XHRjYXNlIG51bGw6IHJldHVybiBBdFR5cGUuV2FsbDtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xyXG5cdFx0XHRcdGlmICh0cnVlKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gQXRUeXBlLldhbGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn1cclxuXHJcbmludGVyZmFjZSBNaW5NYXhJbmZvIHtcclxuXHRtaW5Ec3RTYXZlOiBudW1iZXI7XHJcblx0bWF4RHN0U2F2ZTogbnVtYmVyO1xyXG5cdG1pbkdtdE9mZjogbnVtYmVyO1xyXG5cdG1heEdtdE9mZjogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogU2FuaXR5IGNoZWNrIG9uIGRhdGEuIFJldHVybnMgbWluL21heCB2YWx1ZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB2YWxpZGF0ZURhdGEoZGF0YTogYW55KTogTWluTWF4SW5mbyB7XHJcblx0dmFyIGk6IG51bWJlcjtcclxuXHR2YXIgcmVzdWx0OiBNaW5NYXhJbmZvID0ge1xyXG5cdFx0bWluRHN0U2F2ZTogbnVsbCxcclxuXHRcdG1heERzdFNhdmU6IG51bGwsXHJcblx0XHRtaW5HbXRPZmY6IG51bGwsXHJcblx0XHRtYXhHbXRPZmY6IG51bGxcclxuXHR9O1xyXG5cclxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRpZiAodHlwZW9mKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGlzIG5vdCBhbiBvYmplY3RcIik7XHJcblx0fVxyXG5cdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdGlmICghZGF0YS5oYXNPd25Qcm9wZXJ0eShcInJ1bGVzXCIpKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJkYXRhIGhhcyBubyBydWxlcyBwcm9wZXJ0eVwiKTtcclxuXHR9XHJcblx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0aWYgKCFkYXRhLmhhc093blByb3BlcnR5KFwiem9uZXNcIikpIHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcImRhdGEgaGFzIG5vIHpvbmVzIHByb3BlcnR5XCIpO1xyXG5cdH1cclxuXHJcblx0Ly8gdmFsaWRhdGUgem9uZXNcclxuXHRmb3IgKHZhciB6b25lTmFtZSBpbiBkYXRhLnpvbmVzKSB7XHJcblx0XHRpZiAoZGF0YS56b25lcy5oYXNPd25Qcm9wZXJ0eSh6b25lTmFtZSkpIHtcclxuXHRcdFx0dmFyIHpvbmVBcnI6IGFueSA9IGRhdGEuem9uZXNbem9uZU5hbWVdO1xyXG5cdFx0XHRpZiAodHlwZW9mICh6b25lQXJyKSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdC8vIG9rLCBpcyBsaW5rIHRvIG90aGVyIHpvbmUsIGNoZWNrIGxpbmtcclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIWRhdGEuem9uZXMuaGFzT3duUHJvcGVydHkoPHN0cmluZz56b25lQXJyKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgbGlua3MgdG8gXFxcIlwiICsgPHN0cmluZz56b25lQXJyICsgXCJcXFwiIGJ1dCB0aGF0IGRvZXNuXFwndCBleGlzdFwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHpvbmVBcnIpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IHpvbmVBcnIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHZhciBlbnRyeTogYW55ID0gem9uZUFycltpXTtcclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGVudHJ5KSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoZW50cnkubGVuZ3RoICE9PSA0KSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBoYXMgbGVuZ3RoICE9IDRcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMF0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZpcnN0IGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgZ210b2ZmID0gbWF0aC5maWx0ZXJGbG9hdChlbnRyeVswXSk7XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmIChpc05hTihnbXRvZmYpKSB7XHJcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVudHJ5IFwiICsgaS50b1N0cmluZygxMCkgKyBcIiBmb3Igem9uZSBcXFwiXCIgKyB6b25lTmFtZSArIFwiXFxcIiBmaXJzdCBjb2x1bW4gZG9lcyBub3QgY29udGFpbiBhIG51bWJlclwiKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeVsxXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgc2Vjb25kIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbMl0gIT09IFwic3RyaW5nXCIpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIHRoaXJkIGNvbHVtbiBpcyBub3QgYSBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRcdGlmICh0eXBlb2YgZW50cnlbM10gIT09IFwic3RyaW5nXCIgJiYgZW50cnlbM10gIT09IG51bGwpIHtcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiIGZvciB6b25lIFxcXCJcIiArIHpvbmVOYW1lICsgXCJcXFwiIGZvdXJ0aCBjb2x1bW4gaXMgbm90IGEgc3RyaW5nIG5vciBudWxsXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5WzNdID09PSBcInN0cmluZ1wiICYmIGlzTmFOKG1hdGguZmlsdGVyRmxvYXQoZW50cnlbM10pKSkge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFbnRyeSBcIiArIGkudG9TdHJpbmcoMTApICsgXCIgZm9yIHpvbmUgXFxcIlwiICsgem9uZU5hbWUgKyBcIlxcXCIgZm91cnRoIGNvbHVtbiBkb2VzIG5vdCBjb250YWluIGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5tYXhHbXRPZmYgPT09IG51bGwgfHwgZ210b2ZmID4gcmVzdWx0Lm1heEdtdE9mZikge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4R210T2ZmID0gZ210b2ZmO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5taW5HbXRPZmYgPT09IG51bGwgfHwgZ210b2ZmIDwgcmVzdWx0Lm1pbkdtdE9mZikge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWluR210T2ZmID0gZ210b2ZmO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gdmFsaWRhdGUgcnVsZXNcclxuXHRmb3IgKHZhciBydWxlTmFtZSBpbiBkYXRhLnJ1bGVzKSB7XHJcblx0XHRpZiAoZGF0YS5ydWxlcy5oYXNPd25Qcm9wZXJ0eShydWxlTmFtZSkpIHtcclxuXHRcdFx0dmFyIHJ1bGVBcnI6IGFueSA9IGRhdGEucnVsZXNbcnVsZU5hbWVdO1xyXG5cdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGVBcnIpKSB7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRW50cnkgZm9yIHJ1bGUgXFxcIlwiICsgcnVsZU5hbWUgKyBcIlxcXCIgaXMgbm90IGFuIGFycmF5XCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGZvciAoaSA9IDA7IGkgPCBydWxlQXJyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0dmFyIHJ1bGUgPSBydWxlQXJyW2ldO1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHJ1bGUpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdIGlzIG5vdCBhbiBhcnJheVwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZS5sZW5ndGggPCA4KSB7IC8vIG5vdGUgc29tZSBydWxlcyA+IDggZXhpc3RzIGJ1dCB0aGF0IHNlZW1zIHRvIGJlIGEgYnVnIGluIHR6IGZpbGUgcGFyc2luZ1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXSBpcyBub3Qgb2YgbGVuZ3RoIDhcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgcnVsZS5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0XHRpZiAoaiAhPT0gNSAmJiB0eXBlb2YgcnVsZVtqXSAhPT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdW1wiICsgai50b1N0cmluZygxMCkgKyBcIl0gaXMgbm90IGEgc3RyaW5nXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVswXSAhPT0gXCJOYU5cIiAmJiBpc05hTihwYXJzZUludChydWxlWzBdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKHJ1bGVbMV0gIT09IFwib25seVwiICYmIHJ1bGVbMV0gIT09IFwibWF4XCIgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVsxXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVsxXSBpcyBub3QgYSBudW1iZXIsIG9ubHkgb3IgbWF4XCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoIVR6TW9udGhOYW1lcy5oYXNPd25Qcm9wZXJ0eShydWxlWzNdKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVszXSBpcyBub3QgYSBtb250aCBuYW1lXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAocnVsZVs0XS5zdWJzdHIoMCwgNCkgIT09IFwibGFzdFwiICYmIHJ1bGVbNF0uaW5kZXhPZihcIj49XCIpID09PSAtMVxyXG5cdFx0XHRcdCAmJiBydWxlWzRdLmluZGV4T2YoXCI8PVwiKSA9PT0gLTEgJiYgaXNOYU4ocGFyc2VJbnQocnVsZVs0XSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs0XSBpcyBub3QgYSBrbm93biB0eXBlIG9mIGV4cHJlc3Npb25cIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShydWxlWzVdKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3QgYW4gYXJyYXlcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzVdLmxlbmd0aCAhPT0gNCkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XSBpcyBub3Qgb2YgbGVuZ3RoIDRcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihwYXJzZUludChydWxlWzVdWzBdLCAxMCkpKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzBdIGlzIG5vdCBhIG51bWJlclwiKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0LyogaXN0YW5idWwgaWdub3JlIGlmICovXHJcblx0XHRcdFx0aWYgKGlzTmFOKHBhcnNlSW50KHJ1bGVbNV1bMV0sIDEwKSkpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlJ1bGUgXCIgKyBydWxlTmFtZSArIFwiW1wiICsgaS50b1N0cmluZygxMCkgKyBcIl1bNV1bMV0gaXMgbm90IGEgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cclxuXHRcdFx0XHRpZiAoaXNOYU4ocGFyc2VJbnQocnVsZVs1XVsyXSwgMTApKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs1XVsyXSBpcyBub3QgYSBudW1iZXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChydWxlWzVdWzNdICE9PSBcIlwiICYmIHJ1bGVbNV1bM10gIT09IFwic1wiICYmIHJ1bGVbNV1bM10gIT09IFwid1wiXHJcblx0XHRcdFx0XHQmJiBydWxlWzVdWzNdICE9PSBcImdcIiAmJiBydWxlWzVdWzNdICE9PSBcInVcIiAmJiBydWxlWzVdWzNdICE9PSBcInpcIiAmJiBydWxlWzVdWzNdICE9PSBudWxsKSB7XHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSdWxlIFwiICsgcnVsZU5hbWUgKyBcIltcIiArIGkudG9TdHJpbmcoMTApICsgXCJdWzVdWzNdIGlzIG5vdCBlbXB0eSwgZywgeiwgcywgdywgdSBvciBudWxsXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR2YXIgc2F2ZTogbnVtYmVyID0gcGFyc2VJbnQocnVsZVs2XSwgMTApO1xyXG5cdFx0XHRcdC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xyXG5cdFx0XHRcdGlmIChpc05hTihzYXZlKSkge1xyXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUnVsZSBcIiArIHJ1bGVOYW1lICsgXCJbXCIgKyBpLnRvU3RyaW5nKDEwKSArIFwiXVs2XSBkb2VzIG5vdCBjb250YWluIGEgdmFsaWQgbnVtYmVyXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoc2F2ZSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0aWYgKHJlc3VsdC5tYXhEc3RTYXZlID09PSBudWxsIHx8IHNhdmUgPiByZXN1bHQubWF4RHN0U2F2ZSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQubWF4RHN0U2F2ZSA9IHNhdmU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAocmVzdWx0Lm1pbkRzdFNhdmUgPT09IG51bGwgfHwgc2F2ZSA8IHJlc3VsdC5taW5Ec3RTYXZlKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC5taW5Ec3RTYXZlID0gc2F2ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9