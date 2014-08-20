/**
* Copyright(c) 2014 Spirit IT BV
*
* Functionality to parse a DateTime object to a string
*/
/// <reference path="../typings/lib.d.ts"/>
var basics = require("./basics");

var token = require("./token");
var Tokenizer = token.Tokenizer;

var TokenType = token.DateTimeTokenType;

var strings = require("./strings");

/**
* Format the supplied dateTime with the formatting string.
*
* @param dateTime The current time to format
* @param utcTime The time in UTC
* @param localZone The zone that currentTime is in
* @param formatString The formatting string to be applied
* @return string
*/
function format(dateTime, utcTime, localZone, formatString) {
    var tokenizer = new Tokenizer(formatString);
    var tokens = tokenizer.parseTokens();
    var result = "";
    tokens.forEach(function (token) {
        var tokenResult;
        switch (token.type) {
            case 1 /* ERA */:
                tokenResult = _formatEra(dateTime, token);
                break;
            case 2 /* YEAR */:
                tokenResult = _formatYear(dateTime, token);
                break;
            case 3 /* QUARTER */:
                tokenResult = _formatQuarter(dateTime, token);
                break;
            case 4 /* MONTH */:
                tokenResult = _formatMonth(dateTime, token);
                break;
            case 6 /* DAY */:
                tokenResult = _formatDay(dateTime, token);
                break;
            case 7 /* WEEKDAY */:
                tokenResult = _formatWeekday(dateTime, token);
                break;
            case 8 /* DAYPERIOD */:
                tokenResult = _formatDayPeriod(dateTime, token);
                break;
            case 9 /* HOUR */:
                tokenResult = _formatHour(dateTime, token);
                break;
            case 10 /* MINUTE */:
                tokenResult = _formatMinute(dateTime, token);
                break;
            case 11 /* SECOND */:
                tokenResult = _formatSecond(dateTime, token);
                break;
            case 12 /* ZONE */:
                tokenResult = _formatZone(dateTime, utcTime, localZone, token);
                break;
            case 5 /* WEEK */:
                tokenResult = _formatWeek(dateTime, token);
                break;
            default:
            case 0 /* IDENTITY */:
                tokenResult = token.raw;
                break;
        }
        result += tokenResult;
    });

    return result;
}
exports.format = format;

/**
* Format the era (BC or AD)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatEra(dateTime, token) {
    var AD = dateTime.year > 0;
    switch (token.length) {
        case 1:
        case 2:
        case 3:
            return (AD ? "AD" : "BC");
        case 4:
            return (AD ? "Anno Domini" : "Before Christ");
        case 5:
            return (AD ? "A" : "B");
        default:
            throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
    }
}

/**
* Format the year
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatYear(dateTime, token) {
    switch (token.symbol) {
        case "y":
        case "Y":
        case "r":
            var yearValue = strings.padLeft(dateTime.year.toString(), token.length, "0");
            if (token.length === 2) {
                yearValue = yearValue.slice(-2);
            }
            return yearValue;

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the quarter
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatQuarter(dateTime, token) {
    var quarterAbbr = ["1st", "2nd", "3rd", "4th"];
    var quarter = Math.ceil(dateTime.month / 3);
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(quarter.toString(), 2, "0");
        case 3:
            return "Q" + quarter;
        case 4:
            return quarterAbbr[quarter - 1] + " quarter";
        case 5:
            return quarter.toString();

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
            }
    }
}

/**
* Format the month
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatMonth(dateTime, token) {
    var monthStrings = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October", "November", "December"];
    var monthString = monthStrings[dateTime.month - 1];
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(dateTime.month.toString(), token.length, "0");
        case 3:
            return monthString.slice(0, 3);
        case 4:
            return monthString;
        case 5:
            return monthString.slice(0, 1);

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
            }
    }
}

/**
* Format the week number
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatWeek(dateTime, token) {
    if (token.symbol === "w") {
        return strings.padLeft(basics.weekNumber(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
    } else {
        return strings.padLeft(basics.weekOfMonth(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
    }
}

/**
* Format the day of the month (or year)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatDay(dateTime, token) {
    switch (token.symbol) {
        case "d":
            return strings.padLeft(dateTime.day.toString(), token.length, "0");
        case "D":
            var dayOfYear = basics.dayOfYear(dateTime.year, dateTime.month, dateTime.day) + 1;
            return strings.padLeft(dayOfYear.toString(), token.length, "0");

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the day of the week
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatWeekday(dateTime, token) {
    var weekDay = basics.WeekDay[basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs())];

    switch (token.length) {
        case 1:
        case 2:
            if (token.symbol === "e") {
                return strings.padLeft(basics.weekDayNoLeapSecs(dateTime.toUnixNoLeapSecs()).toString(), token.length, "0");
            }
        case 3:
            return weekDay.slice(0, 3);
        case 4:
            return weekDay;
        case 5:
            return weekDay.slice(0, 1);
        case 6:
            return weekDay.slice(0, 2);

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
            }
    }
}

/**
* Format the Day Period (AM or PM)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatDayPeriod(dateTime, token) {
    return (dateTime.hour < 12 ? "AM" : "PM");
}

/**
* Format the Hour
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatHour(dateTime, token) {
    var hour = dateTime.hour;
    switch (token.symbol) {
        case "h":
            hour = hour % 12;
            if (hour === 0) {
                hour = 12;
            }
            ;
            return strings.padLeft(hour.toString(), token.length, "0");
        case "H":
            return strings.padLeft(hour.toString(), token.length, "0");
        case "K":
            hour = hour % 12;
            return strings.padLeft(hour.toString(), token.length, "0");
        case "k":
            if (hour === 0) {
                hour = 24;
            }
            ;
            return strings.padLeft(hour.toString(), token.length, "0");

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the minute
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatMinute(dateTime, token) {
    return strings.padLeft(dateTime.minute.toString(), token.length, "0");
}

/**
* Format the seconds (or fraction of a second)
*
* @param dateTime The current time to format
* @param token The token passed
* @return string
*/
function _formatSecond(dateTime, token) {
    switch (token.symbol) {
        case "s":
            return strings.padLeft(dateTime.second.toString(), token.length, "0");
        case "S":
            var fraction = dateTime.milli;
            var fractionString = strings.padLeft(fraction.toString(), 3, "0");
            fractionString = strings.padRight(fractionString, token.length, "0");
            return fractionString.slice(0, token.length);
        case "A":
            return strings.padLeft(basics.secondOfDay(dateTime.hour, dateTime.minute, dateTime.second).toString(), token.length, "0");

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}

/**
* Format the time zone. For this, we need the current time, the time in UTC and the time zone
* @param currentTime The time to format
* @param utcTime The time in UTC
* @param zone The timezone currentTime is in
* @param token The token passed
* @return string
*/
function _formatZone(currentTime, utcTime, zone, token) {
    var offset = Math.round((currentTime.toUnixNoLeapSecs() - utcTime.toUnixNoLeapSecs()) / 60000);

    var offsetHours = Math.floor(Math.abs(offset) / 60);
    var offsetHoursString = strings.padLeft(offsetHours.toString(), 2, "0");
    offsetHoursString = (offset >= 0 ? "+" + offsetHoursString : "-" + offsetHoursString);
    var offsetMinutes = Math.abs(offset % 60);
    var offsetMinutesString = strings.padLeft(offsetMinutes.toString(), 2, "0");
    var result;

    switch (token.symbol) {
        case "O":
            result = "UTC";
            if (offset >= 0) {
                result += "+";
            } else {
                result += "-";
            }
            result += offsetHours.toString();
            if (token.length >= 4 || offsetMinutes !== 0) {
                result += ":" + offsetMinutesString;
            }
            return result;
        case "Z":
            switch (token.length) {
                case 1:
                case 2:
                case 3:
                    return offsetHoursString + offsetMinutesString;
                case 4:
                    var newToken = {
                        length: 4,
                        raw: "OOOO",
                        symbol: "O",
                        type: 12 /* ZONE */
                    };
                    return _formatZone(currentTime, utcTime, zone, newToken);
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "z":
            switch (token.length) {
                case 1:
                case 2:
                case 3:
                    return zone.abbreviationForUtc(currentTime.year, currentTime.month, currentTime.day, currentTime.hour, currentTime.minute, currentTime.second, currentTime.milli, true);
                case 4:
                    return zone.toString();

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "v":
            if (token.length === 1) {
                return zone.abbreviationForUtc(currentTime.year, currentTime.month, currentTime.day, currentTime.hour, currentTime.minute, currentTime.second, currentTime.milli, false);
            } else {
                return zone.toString();
            }
        case "V":
            switch (token.length) {
                case 1:
                    // Not implemented
                    return "unk";
                case 2:
                    return zone.name();
                case 3:
                case 4:
                    return "Unknown";

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }
        case "X":
            if (offset === 0) {
                return "Z";
            }
        case "x":
            switch (token.length) {
                case 1:
                    result = offsetHoursString;
                    if (offsetMinutes !== 0) {
                        result += offsetMinutesString;
                    }
                    return result;
                case 2:
                case 4:
                    return offsetHoursString + offsetMinutesString;
                case 3:
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;

                default:
                    /* istanbul ignore if */
                    /* istanbul ignore next */
                    if (true) {
                        throw new Error("Unexpected length " + token.length + " for symbol " + token.symbol);
                    }
            }

        default:
            /* istanbul ignore if */
            /* istanbul ignore next */
            if (true) {
                throw new Error("Unexpected symbol " + token.symbol + " for token " + TokenType[token.type]);
            }
    }
}
//# sourceMappingURL=format.js.map
