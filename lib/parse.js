/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
/// <reference path="../typings/lib.d.ts"/>
var util = require("util");
var basics = require("./basics");
var TimeStruct = basics.TimeStruct;
var token = require("./token");
var Tokenizer = token.Tokenizer;
var TokenType = token.DateTimeTokenType;
var timeZone = require("./timezone");
/**
 * Parse the supplied dateTime assuming the given format.
 *
 * @param dateTimeString The string to parse
 * @param formatString The formatting string to be applied
 * @return string
 */
function parse(dateTimeString, formatString, zone) {
    if (!dateTimeString) {
        throw new Error("no date given");
    }
    if (!formatString) {
        throw new Error("no format given");
    }
    try {
        var tokenizer = new Tokenizer(formatString);
        var tokens = tokenizer.parseTokens();
        var result = {
            time: new TimeStruct(0, 1, 1, 0, 0, 0, 0),
            zone: zone
        };
        var pnr;
        var pzr;
        var remaining = dateTimeString;
        tokens.forEach(function (token) {
            var tokenResult;
            switch (token.type) {
                case TokenType.ERA:
                    // nothing
                    break;
                case TokenType.YEAR:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    result.time.year = pnr.n;
                    break;
                case TokenType.QUARTER:
                    // nothing
                    break;
                case TokenType.MONTH:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    result.time.month = pnr.n;
                    break;
                case TokenType.DAY:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    result.time.day = pnr.n;
                    break;
                case TokenType.WEEKDAY:
                    // nothing
                    break;
                case TokenType.DAYPERIOD:
                    // nothing
                    break;
                case TokenType.HOUR:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    result.time.hour = pnr.n;
                    break;
                case TokenType.MINUTE:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    result.time.minute = pnr.n;
                    break;
                case TokenType.SECOND:
                    pnr = stripNumber(remaining);
                    remaining = pnr.remaining;
                    if (token.raw.charAt(0) === "s") {
                        result.time.second = pnr.n;
                    }
                    else if (token.raw.charAt(0) === "S") {
                        result.time.milli = pnr.n;
                    }
                    else {
                        throw new Error(util.format("unsupported second format '%s'", token.raw));
                    }
                    break;
                case TokenType.ZONE:
                    pzr = stripZone(remaining);
                    remaining = pzr.remaining;
                    result.zone = pzr.zone;
                    break;
                case TokenType.WEEK:
                    // nothing
                    break;
                default:
                case TokenType.IDENTITY:
                    remaining = stripRaw(remaining, token.raw);
                    break;
            }
        });
        if (!result.time.validate()) {
            console.log(util.inspect(result.time, false, 2));
            throw new Error("resulting date invalid");
        }
        // always overwrite zone with given zone
        if (zone) {
            result.zone = zone;
        }
        return result;
    }
    catch (e) {
        throw new Error(util.format("Invalid date '%s' not according to format '%s': %s", dateTimeString, formatString, e.message));
    }
}
exports.parse = parse;
function stripNumber(s) {
    var result = {
        n: NaN,
        remaining: s
    };
    var numberString = "";
    while (result.remaining.length > 0 && result.remaining.charAt(0).match(/\d/)) {
        numberString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    // remove leading zeroes
    while (numberString.charAt(0) === "0" && numberString.length > 1) {
        numberString = numberString.substr(1);
    }
    result.n = parseInt(numberString, 10);
    if (numberString === "" || !isFinite(result.n)) {
        throw new Error(util.format("expected a number but got '%s'", numberString));
    }
    return result;
}
var WHITESPACE = [" ", "\t", "\r", "\v", "\n"];
function stripZone(s) {
    if (s.length === 0) {
        throw new Error("no zone given");
    }
    var result = {
        zone: null,
        remaining: s
    };
    var zoneString = "";
    while (result.remaining.length > 0 && WHITESPACE.indexOf(result.remaining.charAt(0)) === -1) {
        zoneString += result.remaining.charAt(0);
        result.remaining = result.remaining.substr(1);
    }
    result.zone = timeZone.zone(zoneString);
    return result;
}
function stripRaw(s, expected) {
    var remaining = s;
    var eremaining = expected;
    while (remaining.length > 0 && eremaining.length > 0 && remaining.charAt(0) === eremaining.charAt(0)) {
        remaining = remaining.substr(1);
        eremaining = eremaining.substr(1);
    }
    if (eremaining.length > 0) {
        throw new Error(util.format("expected '%s'", expected));
    }
    return remaining;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9wYXJzZS50cyJdLCJuYW1lcyI6WyJwYXJzZSIsInN0cmlwTnVtYmVyIiwic3RyaXBab25lIiwic3RyaXBSYXciXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCwyQ0FBMkM7QUFFM0MsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUM7QUFFOUIsSUFBTyxNQUFNLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDcEMsSUFBTyxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUV0QyxJQUFPLEtBQUssV0FBVyxTQUFTLENBQUMsQ0FBQztBQUNsQyxJQUFPLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0FBRW5DLElBQU8sU0FBUyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztBQUczQyxJQUFPLFFBQVEsV0FBVyxZQUFZLENBQUMsQ0FBQztBQTJCeEM7Ozs7OztHQU1HO0FBQ0gsZUFBc0IsY0FBc0IsRUFBRSxZQUFvQixFQUFFLElBQWU7SUFDbEZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JCQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUNsQ0EsQ0FBQ0E7SUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkJBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBQ0RBLElBQUlBLENBQUNBO1FBQ0pBLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLFNBQVNBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQzVDQSxJQUFJQSxNQUFNQSxHQUFZQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUM5Q0EsSUFBSUEsTUFBTUEsR0FBb0JBO1lBQzdCQSxJQUFJQSxFQUFFQSxJQUFJQSxVQUFVQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN6Q0EsSUFBSUEsRUFBRUEsSUFBSUE7U0FDVkEsQ0FBQ0E7UUFDRkEsSUFBSUEsR0FBc0JBLENBQUNBO1FBQzNCQSxJQUFJQSxHQUFvQkEsQ0FBQ0E7UUFDekJBLElBQUlBLFNBQVNBLEdBQVdBLGNBQWNBLENBQUNBO1FBQ3ZDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxLQUFZQTtZQUMzQkEsSUFBSUEsV0FBbUJBLENBQUNBO1lBQ3hCQSxNQUFNQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcEJBLEtBQUtBLFNBQVNBLENBQUNBLEdBQUdBO29CQUNqQkEsVUFBVUE7b0JBQ1ZBLEtBQUtBLENBQUNBO2dCQUNQQSxLQUFLQSxTQUFTQSxDQUFDQSxJQUFJQTtvQkFDbEJBLEdBQUdBLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO29CQUM3QkEsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7b0JBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDekJBLEtBQUtBLENBQUNBO2dCQUNQQSxLQUFLQSxTQUFTQSxDQUFDQSxPQUFPQTtvQkFDckJBLFVBQVVBO29CQUNWQSxLQUFLQSxDQUFDQTtnQkFDUEEsS0FBS0EsU0FBU0EsQ0FBQ0EsS0FBS0E7b0JBQ25CQSxHQUFHQSxHQUFHQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtvQkFDN0JBLFNBQVNBLEdBQUdBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBO29CQUMxQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzFCQSxLQUFLQSxDQUFDQTtnQkFDUEEsS0FBS0EsU0FBU0EsQ0FBQ0EsR0FBR0E7b0JBQ2pCQSxHQUFHQSxHQUFHQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtvQkFDN0JBLFNBQVNBLEdBQUdBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBO29CQUMxQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3hCQSxLQUFLQSxDQUFDQTtnQkFDUEEsS0FBS0EsU0FBU0EsQ0FBQ0EsT0FBT0E7b0JBQ3JCQSxVQUFVQTtvQkFDVkEsS0FBS0EsQ0FBQ0E7Z0JBQ1BBLEtBQUtBLFNBQVNBLENBQUNBLFNBQVNBO29CQUN2QkEsVUFBVUE7b0JBQ1ZBLEtBQUtBLENBQUNBO2dCQUNQQSxLQUFLQSxTQUFTQSxDQUFDQSxJQUFJQTtvQkFDbEJBLEdBQUdBLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO29CQUM3QkEsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7b0JBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDekJBLEtBQUtBLENBQUNBO2dCQUNQQSxLQUFLQSxTQUFTQSxDQUFDQSxNQUFNQTtvQkFDcEJBLEdBQUdBLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO29CQUM3QkEsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7b0JBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDM0JBLEtBQUtBLENBQUNBO2dCQUNQQSxLQUFLQSxTQUFTQSxDQUFDQSxNQUFNQTtvQkFDcEJBLEdBQUdBLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO29CQUM3QkEsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7b0JBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDakNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO29CQUM1QkEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO3dCQUN4Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxDQUFDQTtvQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQ1BBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGdDQUFnQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNFQSxDQUFDQTtvQkFDREEsS0FBS0EsQ0FBQ0E7Z0JBQ1BBLEtBQUtBLFNBQVNBLENBQUNBLElBQUlBO29CQUNsQkEsR0FBR0EsR0FBR0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQTtvQkFDMUJBLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBO29CQUN2QkEsS0FBS0EsQ0FBQ0E7Z0JBQ1BBLEtBQUtBLFNBQVNBLENBQUNBLElBQUlBO29CQUNsQkEsVUFBVUE7b0JBQ1ZBLEtBQUtBLENBQUNBO2dCQUNQQSxRQUFRQTtnQkFDUkEsS0FBS0EsU0FBU0EsQ0FBQ0EsUUFBUUE7b0JBQ3RCQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFD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QSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUN0R0EsU0FBU0EsR0FBR0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDaENBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25DQSxDQUFDQTtJQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzQkEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDekRBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBO0FBQ2xCQSxDQUFDQSIsImZpbGUiOiJsaWIvcGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29weXJpZ2h0KGMpIDIwMTQgU3Bpcml0IElUIEJWXHJcbiAqXHJcbiAqIEZ1bmN0aW9uYWxpdHkgdG8gcGFyc2UgYSBEYXRlVGltZSBvYmplY3QgdG8gYSBzdHJpbmdcclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZC50c1wiLz5cclxuXHJcbmltcG9ydCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XHJcblxyXG5pbXBvcnQgYmFzaWNzID0gcmVxdWlyZShcIi4vYmFzaWNzXCIpO1xyXG5pbXBvcnQgVGltZVN0cnVjdCA9IGJhc2ljcy5UaW1lU3RydWN0O1xyXG5cclxuaW1wb3J0IHRva2VuID0gcmVxdWlyZShcIi4vdG9rZW5cIik7XHJcbmltcG9ydCBUb2tlbml6ZXIgPSB0b2tlbi5Ub2tlbml6ZXI7XHJcbmltcG9ydCBUb2tlbiA9IHRva2VuLlRva2VuO1xyXG5pbXBvcnQgVG9rZW5UeXBlID0gdG9rZW4uRGF0ZVRpbWVUb2tlblR5cGU7XHJcblxyXG5pbXBvcnQgc3RyaW5ncyA9IHJlcXVpcmUoXCIuL3N0cmluZ3NcIik7XHJcbmltcG9ydCB0aW1lWm9uZSA9IHJlcXVpcmUoXCIuL3RpbWV6b25lXCIpO1xyXG5pbXBvcnQgVGltZVpvbmUgPSB0aW1lWm9uZS5UaW1lWm9uZTtcclxuXHJcbi8qKlxyXG4gKiBUaW1lU3RydWN0IHBsdXMgem9uZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBBd2FyZVRpbWVTdHJ1Y3Qge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0aW1lIHN0cnVjdFxyXG5cdCAqL1xyXG5cdHRpbWU6IFRpbWVTdHJ1Y3Q7XHJcblx0LyoqXHJcblx0ICogVGhlIHRpbWUgem9uZVxyXG5cdCAqL1xyXG5cdHpvbmU/OiB0aW1lWm9uZS5UaW1lWm9uZTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFBhcnNlTnVtYmVyUmVzdWx0IHtcclxuXHRuOiBudW1iZXI7XHJcblx0cmVtYWluaW5nOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBQYXJzZVpvbmVSZXN1bHQge1xyXG5cdHpvbmU6IFRpbWVab25lO1xyXG5cdHJlbWFpbmluZzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogUGFyc2UgdGhlIHN1cHBsaWVkIGRhdGVUaW1lIGFzc3VtaW5nIHRoZSBnaXZlbiBmb3JtYXQuXHJcbiAqXHJcbiAqIEBwYXJhbSBkYXRlVGltZVN0cmluZyBUaGUgc3RyaW5nIHRvIHBhcnNlXHJcbiAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIGZvcm1hdHRpbmcgc3RyaW5nIHRvIGJlIGFwcGxpZWRcclxuICogQHJldHVybiBzdHJpbmdcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShkYXRlVGltZVN0cmluZzogc3RyaW5nLCBmb3JtYXRTdHJpbmc6IHN0cmluZywgem9uZT86IFRpbWVab25lKTogQXdhcmVUaW1lU3RydWN0IHtcclxuXHRpZiAoIWRhdGVUaW1lU3RyaW5nKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBkYXRlIGdpdmVuXCIpO1xyXG5cdH1cclxuXHRpZiAoIWZvcm1hdFN0cmluZykge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gZm9ybWF0IGdpdmVuXCIpO1xyXG5cdH1cclxuXHR0cnkge1xyXG5cdFx0dmFyIHRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIoZm9ybWF0U3RyaW5nKTtcclxuXHRcdHZhciB0b2tlbnM6IFRva2VuW10gPSB0b2tlbml6ZXIucGFyc2VUb2tlbnMoKTtcclxuXHRcdHZhciByZXN1bHQ6IEF3YXJlVGltZVN0cnVjdCA9IHtcclxuXHRcdFx0dGltZTogbmV3IFRpbWVTdHJ1Y3QoMCwgMSwgMSwgMCwgMCwgMCwgMCksXHJcblx0XHRcdHpvbmU6IHpvbmVcclxuXHRcdH07XHJcblx0XHR2YXIgcG5yOiBQYXJzZU51bWJlclJlc3VsdDtcclxuXHRcdHZhciBwenI6IFBhcnNlWm9uZVJlc3VsdDtcclxuXHRcdHZhciByZW1haW5pbmc6IHN0cmluZyA9IGRhdGVUaW1lU3RyaW5nO1xyXG5cdFx0dG9rZW5zLmZvckVhY2goKHRva2VuOiBUb2tlbik6IHZvaWQgPT4ge1xyXG5cdFx0XHR2YXIgdG9rZW5SZXN1bHQ6IHN0cmluZztcclxuXHRcdFx0c3dpdGNoICh0b2tlbi50eXBlKSB7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuRVJBOlxyXG5cdFx0XHRcdFx0Ly8gbm90aGluZ1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuWUVBUjpcclxuXHRcdFx0XHRcdHBuciA9IHN0cmlwTnVtYmVyKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwbnIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0cmVzdWx0LnRpbWUueWVhciA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuUVVBUlRFUjpcclxuXHRcdFx0XHRcdC8vIG5vdGhpbmdcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLk1PTlRIOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHRyZXN1bHQudGltZS5tb250aCA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuREFZOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHRyZXN1bHQudGltZS5kYXkgPSBwbnIubjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUtEQVk6XHJcblx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5EQVlQRVJJT0Q6XHJcblx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5IT1VSOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHRyZXN1bHQudGltZS5ob3VyID0gcG5yLm47XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5NSU5VVEU6XHJcblx0XHRcdFx0XHRwbnIgPSBzdHJpcE51bWJlcihyZW1haW5pbmcpO1xyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gcG5yLnJlbWFpbmluZztcclxuXHRcdFx0XHRcdHJlc3VsdC50aW1lLm1pbnV0ZSA9IHBuci5uO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBUb2tlblR5cGUuU0VDT05EOlxyXG5cdFx0XHRcdFx0cG5yID0gc3RyaXBOdW1iZXIocmVtYWluaW5nKTtcclxuXHRcdFx0XHRcdHJlbWFpbmluZyA9IHBuci5yZW1haW5pbmc7XHJcblx0XHRcdFx0XHRpZiAodG9rZW4ucmF3LmNoYXJBdCgwKSA9PT0gXCJzXCIpIHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0LnRpbWUuc2Vjb25kID0gcG5yLm47XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHRva2VuLnJhdy5jaGFyQXQoMCkgPT09IFwiU1wiKSB7XHJcblx0XHRcdFx0XHRcdHJlc3VsdC50aW1lLm1pbGxpID0gcG5yLm47XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IodXRpbC5mb3JtYXQoXCJ1bnN1cHBvcnRlZCBzZWNvbmQgZm9ybWF0ICclcydcIiwgdG9rZW4ucmF3KSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFRva2VuVHlwZS5aT05FOlxyXG5cdFx0XHRcdFx0cHpyID0gc3RyaXBab25lKHJlbWFpbmluZyk7XHJcblx0XHRcdFx0XHRyZW1haW5pbmcgPSBwenIucmVtYWluaW5nO1xyXG5cdFx0XHRcdFx0cmVzdWx0LnpvbmUgPSBwenIuem9uZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLldFRUs6XHJcblx0XHRcdFx0XHQvLyBub3RoaW5nXHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGNhc2UgVG9rZW5UeXBlLklERU5USVRZOlxyXG5cdFx0XHRcdFx0cmVtYWluaW5nID0gc3RyaXBSYXcocmVtYWluaW5nLCB0b2tlbi5yYXcpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0aWYgKCFyZXN1bHQudGltZS52YWxpZGF0ZSgpKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKHV0aWwuaW5zcGVjdChyZXN1bHQudGltZSwgZmFsc2UsIDIpKTtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwicmVzdWx0aW5nIGRhdGUgaW52YWxpZFwiKTtcclxuXHRcdH1cclxuXHRcdC8vIGFsd2F5cyBvdmVyd3JpdGUgem9uZSB3aXRoIGdpdmVuIHpvbmVcclxuXHRcdGlmICh6b25lKSB7XHJcblx0XHRcdHJlc3VsdC56b25lID0gem9uZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKHV0aWwuZm9ybWF0KFwiSW52YWxpZCBkYXRlICclcycgbm90IGFjY29yZGluZyB0byBmb3JtYXQgJyVzJzogJXNcIiwgZGF0ZVRpbWVTdHJpbmcsIGZvcm1hdFN0cmluZywgZS5tZXNzYWdlKSk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gc3RyaXBOdW1iZXIoczogc3RyaW5nKTogUGFyc2VOdW1iZXJSZXN1bHQge1xyXG5cdHZhciByZXN1bHQ6IFBhcnNlTnVtYmVyUmVzdWx0ID0ge1xyXG5cdFx0bjogTmFOLFxyXG5cdFx0cmVtYWluaW5nOiBzXHJcblx0fTtcclxuXHR2YXIgbnVtYmVyU3RyaW5nID0gXCJcIjtcclxuXHR3aGlsZSAocmVzdWx0LnJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApLm1hdGNoKC9cXGQvKSkge1xyXG5cdFx0bnVtYmVyU3RyaW5nICs9IHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApO1xyXG5cdFx0cmVzdWx0LnJlbWFpbmluZyA9IHJlc3VsdC5yZW1haW5pbmcuc3Vic3RyKDEpO1xyXG5cdH1cclxuXHQvLyByZW1vdmUgbGVhZGluZyB6ZXJvZXNcclxuXHR3aGlsZSAobnVtYmVyU3RyaW5nLmNoYXJBdCgwKSA9PT0gXCIwXCIgJiYgbnVtYmVyU3RyaW5nLmxlbmd0aCA+IDEpIHtcclxuXHRcdG51bWJlclN0cmluZyA9IG51bWJlclN0cmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdHJlc3VsdC5uID0gcGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCk7XHJcblx0aWYgKG51bWJlclN0cmluZyA9PT0gXCJcIiB8fCAhaXNGaW5pdGUocmVzdWx0Lm4pKSB7XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IodXRpbC5mb3JtYXQoXCJleHBlY3RlZCBhIG51bWJlciBidXQgZ290ICclcydcIiwgbnVtYmVyU3RyaW5nKSk7XHJcblx0fVxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbnZhciBXSElURVNQQUNFID0gW1wiIFwiLCBcIlxcdFwiLCBcIlxcclwiLCBcIlxcdlwiLCBcIlxcblwiXTtcclxuXHJcbmZ1bmN0aW9uIHN0cmlwWm9uZShzOiBzdHJpbmcpOiBQYXJzZVpvbmVSZXN1bHQge1xyXG5cdGlmIChzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwibm8gem9uZSBnaXZlblwiKTtcclxuXHR9XHJcblx0dmFyIHJlc3VsdDogUGFyc2Vab25lUmVzdWx0ID0ge1xyXG5cdFx0em9uZTogbnVsbCxcclxuXHRcdHJlbWFpbmluZzogc1xyXG5cdH07XHJcblx0dmFyIHpvbmVTdHJpbmcgPSBcIlwiO1xyXG5cdHdoaWxlIChyZXN1bHQucmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgV0hJVEVTUEFDRS5pbmRleE9mKHJlc3VsdC5yZW1haW5pbmcuY2hhckF0KDApKSA9PT0gLTEpIHtcclxuXHRcdHpvbmVTdHJpbmcgKz0gcmVzdWx0LnJlbWFpbmluZy5jaGFyQXQoMCk7XHJcblx0XHRyZXN1bHQucmVtYWluaW5nID0gcmVzdWx0LnJlbWFpbmluZy5zdWJzdHIoMSk7XHJcblx0fVxyXG5cdHJlc3VsdC56b25lID0gdGltZVpvbmUuem9uZSh6b25lU3RyaW5nKTtcclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJpcFJhdyhzOiBzdHJpbmcsIGV4cGVjdGVkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdHZhciByZW1haW5pbmcgPSBzO1xyXG5cdHZhciBlcmVtYWluaW5nID0gZXhwZWN0ZWQ7XHJcblx0d2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIGVyZW1haW5pbmcubGVuZ3RoID4gMCAmJiByZW1haW5pbmcuY2hhckF0KDApID09PSBlcmVtYWluaW5nLmNoYXJBdCgwKSkge1xyXG5cdFx0cmVtYWluaW5nID0gcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHRcdGVyZW1haW5pbmcgPSBlcmVtYWluaW5nLnN1YnN0cigxKTtcclxuXHR9XHJcblx0aWYgKGVyZW1haW5pbmcubGVuZ3RoID4gMCkge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKHV0aWwuZm9ybWF0KFwiZXhwZWN0ZWQgJyVzJ1wiLCBleHBlY3RlZCkpO1xyXG5cdH1cclxuXHRyZXR1cm4gcmVtYWluaW5nO1xyXG59XHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=