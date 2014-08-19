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

function _formatEra(dateTime, token) {
    var AD = dateTime.year > 0;
    switch (token.length) {
        case 1:
        case 2:
        case 3:
        default:
            return (AD ? "AD" : "BC");
        case 4:
            return (AD ? "Anno Domini" : "Before Christ");
        case 5:
            return (AD ? "A" : "B");
    }
}

function _formatYear(dateTime, token) {
    switch (token.symbol) {
        case "y":
        case "Y":
        case "r":
        default:
            var yearValue = strings.padLeft(dateTime.year.toString(), token.length, "0");
            if (token.length === 2) {
                yearValue = yearValue.slice(-2);
            }
            return yearValue;
    }
}

function _formatQuarter(dateTime, token) {
    var quarterAbbr = ["1st", "2nd", "3rd", "4th"];
    var quarter = Math.ceil(dateTime.month / 3);
    switch (token.length) {
        case 1:
        case 2:
            return strings.padLeft(quarter.toString(), 2, "0");
        case 3:
        default:
            return "Q" + quarter;
        case 4:
            return quarterAbbr[quarter - 1] + " quarter";
        case 5:
            return quarter.toString();
    }
}

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
        default:
            return monthString;
        case 5:
            return monthString.slice(0, 1);
    }
}

function _formatWeek(dateTime, token) {
    if (token.symbol === "w") {
        return strings.padLeft(basics.weekNumber(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
    } else {
        return strings.padLeft(basics.weekOfMonth(dateTime.year, dateTime.month, dateTime.day).toString(), token.length, "0");
    }
}

function _formatDay(dateTime, token) {
    switch (token.symbol) {
        case "d":
        default:
            return strings.padLeft(dateTime.day.toString(), token.length, "0");
        case "D":
            var dayOfYear = basics.dayOfYear(dateTime.year, dateTime.month, dateTime.day) + 1;
            return strings.padLeft(dayOfYear.toString(), token.length, "0");
    }
}

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
        default:
            return weekDay;
        case 5:
            return weekDay.slice(0, 1);
        case 6:
            return weekDay.slice(0, 2);
    }
}

function _formatDayPeriod(dateTime, token) {
    return (dateTime.hour < 12 ? "AM" : "PM");
}

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
    }
}

function _formatMinute(dateTime, token) {
    return strings.padLeft(dateTime.minute.toString(), token.length, "0");
}

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
            return strings.padLeft(basics.secondInDay(dateTime.hour, dateTime.minute, dateTime.second).toString(), token.length, "0");
    }
}

function _formatZone(currentZone, utcZone, zone, token) {
    var offset = Math.round((currentZone.toUnixNoLeapSecs() - utcZone.toUnixNoLeapSecs()) / 60000);

    var offsetHours = Math.floor(Math.abs(offset) / 60);
    var offsetHoursString = strings.padLeft(offsetHours.toString(), 2, "0");
    offsetHoursString = (offset >= 0 ? "+" + offsetHoursString : "-" + offsetHoursString);
    var offsetMinutes = Math.abs(offset % 60);
    var offsetMinutesString = strings.padLeft(offsetMinutes.toString(), 2, "0");
    var result;

    switch (token.symbol) {
        case "O":
            result = "GMT";
            if (offsetHours > 0) {
                result += "+";
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
                    return "GMT" + offsetHoursString + ":" + offsetMinutesString;
                case 5:
                    return offsetHoursString + ":" + offsetMinutesString;
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
            }
    }
}
//# sourceMappingURL=format.js.map
