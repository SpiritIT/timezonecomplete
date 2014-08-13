/**
* Copyright(c) 2014 Spirit IT BV
*
* Olsen Timezone Database container
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
/* tslint:disable */
var assert = require("assert");

var basics = require("./basics");
var duration = require("./duration");
var math = require("./math");

/* tslint:disable:no-var-requires */
var data = require("./timezone-data.json");

/* tslint:enable:no-var-requires */
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
* See http://www.cstdbill.com/tzdb/tz-how-to.html
*/
var RuleInfo = (function () {
    function RuleInfo(/**
    * FROM column year number.
    * Note, can be -10000 for NaN value (e.g. for "SystemV" rules)
    */
    from, /**
    * TO column type: Year for year numbers and "only" values, Max for "max" value.
    */
    toType, /**
    * If TO column is a year, the year number. If TO column is "only", the FROM year.
    */
    toYear, /**
    * TYPE column, not used so far
    */
    type, /**
    * IN column month number 1-12
    */
    inMonth, /**
    * ON column type
    */
    onType, /**
    * If onType is DayNum, the day number
    */
    onDay, /**
    * If onType is not DayNum, the weekday
    */
    onWeekDay, /**
    * AT column hour
    */
    atHour, /**
    * AT column minute
    */
    atMinute, /**
    * AT column second
    */
    atSecond, /**
    * AT column type
    */
    atType, /**
    * DST offset from local standard time (NOT UTC!)
    */
    save, /**
    * Character to insert in %s for time zone abbreviation
    * Note if TZ database indicates "-" the empty string is returned
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
    }
    /**
    * Returns true iff this rule is applicable in the year
    */
    RuleInfo.prototype.applicable = function (year) {
        if (year < this.from) {
            return false;
        }
        switch (this.toType) {
            case 1 /* Max */:
                return true;
            case 0 /* Year */:
                return (year <= this.toYear);
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
        if (this.effectiveDate(this.from) < other.effectiveDate(this.from)) {
            return true;
        }
        return false;
    };

    /**
    * Sort comparison
    * @return (first effective date is equal to other's first effective date)
    */
    RuleInfo.prototype.effectiveEqual = function (other) {
        if (this.from != other.from) {
            return false;
        }
        if (this.inMonth != other.inMonth) {
            return false;
        }
        if (this.effectiveDate(this.from) != other.effectiveDate(this.from)) {
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
        var i;

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
                } else {
                    offset = standardOffset;
                }
                break;
            default:
                assert(false, "unknown AtType");
                break;
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
    function ZoneInfo(/**
    * GMT offset in fractional minutes, POSITIVE to UTC (note JavaScript.Date gives offsets
    * contrary to what you might expect).  E.g. Europe/Amsterdam has +60 minutes in this field because
    * it is one hour ahead of UTC
    */
    gmtoff, /**
    * The RULES column tells us whether daylight saving time is being observed:
    * A hyphen, a kind of null value, means that we have not set our clocks ahead of standard time.
    * An amount of time (usually but not necessarily “1:00” meaning one hour) means that we have set our clocks ahead by that amount.
    * Some alphabetic string means that we might have set our clocks ahead; and we need to check the rule the name of which is the given alphabetic string.
    */
    ruleType, /**
    * If the rule column is an offset, this is the offset
    */
    ruleOffset, /**
    * If the rule column is a rule name, this is the rule name
    */
    ruleName, /**
    * The FORMAT column specifies the usual abbreviation of the time zone name. It can have one of four forms:
    * the string, “zzz,” which is a kind of null value (don’t ask)
    * a single alphabetic string other than “zzz,” in which case that’s the abbreviation
    * a pair of strings separated by a slash (‘/’), in which case the first string is the abbreviation
    * for the standard time name and the second string is the abbreviation for the daylight saving time name
    * a string containing “%s,” in which case the “%s” will be replaced by the text in the appropriate Rule’s LETTER column
    */
    format, /**
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
    function Transition(/**
    * Transition time in UTC millis
    */
    at, /**
    * The rule
    */
    rule) {
        this.at = at;
        this.rule = rule;
    }
    return Transition;
})();
exports.Transition = Transition;

/**
* This class typescriptifies reading the TZ data
*/
var TzDatabase = (function () {
    function TzDatabase() {
        validateData(data);
    }
    TzDatabase.instance = function () {
        return TzDatabase._instance;
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
    * Returns the total time zone offset from UTC, including DST.
    * Throws if info not found.
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
        var transitions = this.getTransitionsAround(ruleName, tm.year, standardOffset);

        // find the last prior to given date
        var offset = null;
        for (var i = transitions.length - 1; i >= 0; i--) {
            var transition = transitions[i];
            if (transition.at <= utcMillis) {
                offset = transition.rule.save.clone();
                break;
            }
        }
        if (!offset) {
            throw new Error("No offset found.");
        }
        return offset;
    };

    /**
    * Return a list of all transitions in [year-1..year] sorted by effective date
    *
    * @param ruleName	Name of the rule set
    * @param year	Year to return transitions for
    * @param standardOffset	Standard offset without DST for the time zone
    */
    TzDatabase.prototype.getTransitionsAround = function (ruleName, year, standardOffset) {
        var ruleInfos = this.getRuleInfos(ruleName);
        var result = [];

        for (var y = year - 1; y <= year; y++) {
            var prevInfo = null;
            for (var i = 0; i < ruleInfos.length; i++) {
                var ruleInfo = ruleInfos[i];
                if (ruleInfo.applicable(y)) {
                    result.push(new Transition(ruleInfo.transitionTimeUtc(y, standardOffset, prevInfo), ruleInfo));
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
    * Get the zone info for the given UTC timestamp. Throws if not found.
    * @param zoneName	IANA time zone name
    * @param utcMillis	UTC time stamp
    * @returns	ZoneInfo object
    */
    TzDatabase.prototype.getZoneInfo = function (zoneName, utcMillis) {
        var zoneInfos = this.getZoneInfos(zoneName);

        for (var i = 0; i < zoneInfos.length; ++i) {
            var zoneInfo = zoneInfos[i];
            if (zoneInfo.until === null || zoneInfo.until > utcMillis) {
                return zoneInfo;
            }
        }
        throw new Error("No zone info found");
    };

    /**
    * Return the zone records for a given zone name, after
    * following any links.
    *
    * @param zoneName	IANA zone name like "Pacific/Efate"
    */
    TzDatabase.prototype.getZoneInfos = function (zoneName) {
        // todors maybe apply caching
        if (!data.zones.hasOwnProperty(zoneName)) {
            throw new Error("Zone \"" + zoneName + "\" not found.");
        }

        var result = [];
        var actualZoneName = zoneName;
        var zoneEntries = data.zones[zoneName];

        while (typeof (zoneEntries) === "string") {
            if (!data.zones.hasOwnProperty(zoneEntries)) {
                throw new Error("Zone \"" + zoneEntries + "\" not found (referred to in link from \"" + zoneName + "\" via \"" + actualZoneName + "\"");
            }
            actualZoneName = zoneEntries;
            zoneEntries = data.zones[actualZoneName];
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
        return result;
    };

    /**
    * Returns the rule set with the given rule name,
    * sorted by first effective date (uncompensated for "w" or "s" AtTime)
    *
    * @param ruleName	Name of rule set
    */
    TzDatabase.prototype.getRuleInfos = function (ruleName) {
        // todors maybe apply caching
        if (!data.rules.hasOwnProperty(ruleName)) {
            throw new Error("Rule set \"" + ruleName + "\" not found.");
        }

        var result = [];

        var ruleSet = data.rules[ruleName];
        for (var i = 0; i < ruleSet.length; ++i) {
            var rule = ruleSet[i];

            var fromYear = (rule[0] === "NaN" ? -10000 : parseInt(rule[0], 10));
            var toType = this.parseToType(rule[1]);
            var toYear = (toType === 1 /* Max */ ? 0 : (rule[1] === "only" ? fromYear : parseInt(rule[1], 10)));
            var onType = this.parseOnType(rule[4]);
            var onDay = this.parseOnDay(rule[4], onType);
            var onWeekDay = this.parseOnWeekDay(rule[4]);

            result.push(new RuleInfo(fromYear, toType, toYear, rule[2], TzMonthNames[rule[3]], onType, onDay, onWeekDay, parseInt(rule[5][0], 10), parseInt(rule[5][1], 10), parseInt(rule[5][2], 10), this.parseAtType(rule[5][3]), Duration.minutes(parseInt(rule[6], 10)), rule[7] === "-" ? "" : rule[7]));
        }

        result.sort(function (a, b) {
            if (a.effectiveLess(b)) {
                return -1;
            } else if (a.effectiveEqual(b)) {
                return 0;
            } else {
                return 1;
            }
        });

        return result;
    };

    /**
    * Parse the RULES column of a zone info entry
    * and see what kind of entry it is.
    */
    TzDatabase.prototype.parseRuleType = function (rule) {
        if (rule === "-") {
            return 0 /* None */;
        } else if (exports.isValidOffsetString(rule)) {
            return 1 /* Offset */;
        } else {
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
        } else if (to === "only") {
            return 0 /* Year */;
        } else if (!isNaN(parseInt(to, 10))) {
            return 0 /* Year */;
        } else {
            throw new Error("TO column incorrect: " + to);
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
            case 0 /* DayNum */:
                 {
                    return parseInt(on, 10);
                }
                break;
            case 3 /* LeqX */:
                 {
                    return parseInt(on.substr(on.indexOf("<=") + 2), 10);
                }
                break;
            case 2 /* GreqX */:
                 {
                    return parseInt(on.substr(on.indexOf(">=") + 2), 10);
                }
                break;
            default: {
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
        return 0 /* Sunday */;
    };

    /**
    * Parse the AT column of a rule info entry
    * and see what kind of entry it is.
    */
    TzDatabase.prototype.parseAtType = function (at) {
        switch (at) {
            case "s":
                return 0 /* Standard */;
            case "u":
                return 2 /* Utc */;
            case "g":
                return 2 /* Utc */;
            case "z":
                return 2 /* Utc */;
            case "w":
                return 1 /* Wall */;
            case "":
                return 1 /* Wall */;
            case null:
                return 1 /* Wall */;
            default:
                return 1 /* Wall */;
        }
    };
    TzDatabase._instance = new TzDatabase();
    return TzDatabase;
})();
exports.TzDatabase = TzDatabase;

function validateData(data) {
    var i;

    if (typeof (data) !== "object") {
        throw new Error("data is not an object");
    }
    if (!data.hasOwnProperty("rules")) {
        throw new Error("data has no rules property");
    }
    if (!data.hasOwnProperty("zones")) {
        throw new Error("data has no zones property");
    }

    for (var zoneName in data.zones) {
        if (data.zones.hasOwnProperty(zoneName)) {
            var zoneArr = data.zones[zoneName];
            if (typeof (zoneArr) === "string") {
                // ok, is link to other zone, check link
                if (!data.zones.hasOwnProperty(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" links to \"" + zoneArr + "\" but that doesn\'t exist");
                }
            } else {
                if (!Array.isArray(zoneArr)) {
                    throw new Error("Entry for zone \"" + zoneName + "\" is neither a string nor an array");
                }
                for (i = 0; i < zoneArr.length; i++) {
                    var entry = zoneArr[i];
                    if (!Array.isArray(entry)) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" is not an array");
                    }
                    if (entry.length !== 4) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" has length != 4");
                    }
                    if (typeof entry[0] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column is not a string");
                    }
                    if (isNaN(math.filterFloat(entry[0]))) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" first column does not contain a number");
                    }
                    if (typeof entry[1] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" second column is not a string");
                    }
                    if (typeof entry[2] !== "string") {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" third column is not a string");
                    }
                    if (typeof entry[3] !== "string" && entry[3] !== null) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column is not a string nor null");
                    }
                    if (typeof entry[3] === "string" && isNaN(math.filterFloat(entry[3]))) {
                        throw new Error("Entry " + i.toString(10) + " for zone \"" + zoneName + "\" fourth column does not contain a number");
                    }
                }
            }
        }
    }

    for (var ruleName in data.rules) {
        if (data.rules.hasOwnProperty(ruleName)) {
            var ruleArr = data.rules[ruleName];
            if (!Array.isArray(ruleArr)) {
                throw new Error("Entry for rule \"" + ruleName + "\" is not an array");
            }
            for (i = 0; i < ruleArr.length; i++) {
                var rule = ruleArr[i];
                if (!Array.isArray(rule)) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not an array");
                }
                if (rule.length < 8) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "] is not of length 8");
                }
                for (var j = 0; j < rule.length; j++) {
                    if (j !== 5 && typeof rule[j] !== "string") {
                        throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][" + j.toString(10) + "] is not a string");
                    }
                }
                if (rule[0] !== "NaN" && isNaN(parseInt(rule[0], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][0] is not a number");
                }
                if (rule[1] !== "only" && rule[1] !== "max" && isNaN(parseInt(rule[1], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][1] is not a number, only or max");
                }
                if (!TzMonthNames.hasOwnProperty(rule[3])) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][3] is not a month name");
                }
                if (rule[4].substr(0, 4) !== "last" && rule[4].indexOf(">=") === -1 && rule[4].indexOf("<=") === -1 && isNaN(parseInt(rule[4], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][4] is not a known type of expression");
                }
                if (!Array.isArray(rule[5])) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not an array");
                }
                if (rule[5].length !== 4) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5] is not of length 4");
                }
                if (isNaN(parseInt(rule[5][0]))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][0] is not a number");
                }
                if (isNaN(parseInt(rule[5][1]))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][1] is not a number");
                }
                if (isNaN(parseInt(rule[5][2]))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][2] is not a number");
                }
                if (rule[5][3] !== "" && rule[5][3] !== "s" && rule[5][3] !== "w" && rule[5][3] !== "g" && rule[5][3] !== "u" && rule[5][3] !== "z" && rule[5][3] !== null) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][5][3] is not empty, g, z, s, w, u or null");
                }
                if (isNaN(parseInt(rule[6], 10))) {
                    throw new Error("Rule " + ruleName + "[" + i.toString(10) + "][6] does not contain a valid number");
                }
            }
        }
    }
}
