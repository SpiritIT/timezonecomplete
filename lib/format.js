/**
* Copyright(c) 2014 Spirit IT BV
*
* Functionality to parse a DateTime object to a string
*/
var basics = require("./basics");

var token = require("./token");
var Tokenizer = token.Tokenizer;

var TokenType = token.DateTimeTokenType;

var strings = require("./strings");

var Formatter = (function () {
    function Formatter() {
        this._tokenizer = new Tokenizer();
    }
    Formatter.prototype.format = function (dateTime, formatString) {
        var _this = this;
        this._tokenizer.setFormatString(formatString);
        var tokens = this._tokenizer.parseTokens();
        var result = "";
        tokens.forEach(function (token) {
            result += _this._formatToken(dateTime, token);
        });

        return result;
    };

    Formatter.prototype._formatToken = function (dateTime, token) {
        switch (token.type) {
            case 1 /* ERA */:
                return this._formatEra(dateTime, token);
            case 2 /* YEAR */:
                return this._formatYear(dateTime, token);
            case 3 /* QUARTER */:
                return this._formatQuarter(dateTime, token);
            case 4 /* MONTH */:
                return this._formatMonth(dateTime, token);
            case 6 /* DAY */:
                return this._formatDay(dateTime, token);
            case 7 /* WEEKDAY */:
                return this._formatWeekday(dateTime, token);
            case 8 /* DAYPERIOD */:
                return this._formatDayPeriod(dateTime, token);
            case 9 /* HOUR */:
                return this._formatHour(dateTime, token);
            case 10 /* MINUTE */:
                return this._formatMinute(dateTime, token);
            case 11 /* SECOND */:
                return this._formatSecond(dateTime, token);
            case 12 /* ZONE */:
                return this._formatZone(dateTime, token);
            case 5 /* WEEK */:
                return this._formatWeek(dateTime, token);
            default:
            case 0 /* IDENTITY */:
                return token.raw;
        }
    };

    Formatter.prototype._formatEra = function (dateTime, token) {
        var AD = dateTime.year() > 0;
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
    };

    Formatter.prototype._formatYear = function (dateTime, token) {
        switch (token.symbol) {
            case "y":
            case "Y":
            case "r":
            default:
                var yearValue = strings.padLeft(dateTime.year().toString(), token.length, "0");
                if (token.length === 2) {
                    yearValue = yearValue.slice(-2);
                }
                return yearValue;
        }
    };

    Formatter.prototype._formatQuarter = function (dateTime, token) {
        var quarterAbbr = ["1st", "2nd", "3rd", "4th"];
        var quarter = Math.ceil(dateTime.month() / 3);
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
    };

    Formatter.prototype._formatMonth = function (dateTime, token) {
        var monthStrings = [
            "January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October", "November", "December"];
        var monthString = monthStrings[dateTime.month() - 1];
        switch (token.length) {
            case 1:
            case 2:
                return strings.padLeft(dateTime.month().toString(), token.length, "0");
            case 3:
                return monthString.slice(0, 3);
            case 4:
            default:
                return monthString;
            case 5:
                return monthString.slice(0, 1);
        }
    };

    Formatter.prototype._formatWeek = function (dateTime, token) {
        if (token.symbol === "w") {
            return strings.padLeft(dateTime.weekNumber().toString(), token.length, "0");
        } else {
            // return strings.padLeft(dateTime.weekOfMonth().toString(), token.length, "0");
            // TODO: Week of month is not implemented yet in DateTime
            return "-1";
        }
    };

    Formatter.prototype._formatDay = function (dateTime, token) {
        switch (token.symbol) {
            case "d":
            default:
                return strings.padLeft(dateTime.day().toString(), token.length, "0");
            case "D":
                // return strings.padLeft(dateTime.dayOfYear().toString(), token.length, "0");
                // TODO: Day of year is not implemented yet in DateTime
                return "-1";
        }
    };

    Formatter.prototype._formatWeekday = function (dateTime, token) {
        var weekDay = basics.WeekDay[dateTime.weekDay()];

        switch (token.length) {
            case 1:
            case 2:
                if (token.symbol === "e") {
                    return strings.padLeft(dateTime.weekDay().toString(), token.length, "0");
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
    };

    Formatter.prototype._formatDayPeriod = function (dateTime, token) {
        return (dateTime.hour() < 12 ? "AM" : "PM");
    };

    Formatter.prototype._formatHour = function (dateTime, token) {
        var hour = dateTime.hour();
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
    };

    Formatter.prototype._formatMinute = function (dateTime, token) {
        return strings.padLeft(dateTime.minute().toString(), token.length, "0");
    };

    Formatter.prototype._formatSecond = function (dateTime, token) {
        switch (token.symbol) {
            case "s":
                return strings.padLeft(dateTime.second().toString(), token.length, "0");
            case "S":
                var fraction = dateTime.millisecond();
                var fractionString = strings.padLeft(fraction.toString(), 3, "0");
                fractionString = strings.padRight(fractionString, token.length, "0");
                return fractionString.slice(0, token.length);
            case "A":
                // return strings.padLeft(dateTime.secondOfDay().toString(), token.length, "0");
                // TODO: Second of day is not implemented yet in DateTime
                return "-1";
        }
    };

    Formatter.prototype._formatZone = function (dateTime, token) {
        var zone = dateTime.zone();
        return zone.toString();
    };
    return Formatter;
})();
exports.Formatter = Formatter;
//# sourceMappingURL=format.js.map
