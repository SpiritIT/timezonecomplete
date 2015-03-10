/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * Functionality to parse a DateTime object to a string
 */
/// <reference path="../typings/lib.d.ts"/>
var Tokenizer = (function () {
    /**
     * Create a new tokenizer
     * @param _formatString (optional) Set the format string
     */
    function Tokenizer(_formatString) {
        this._formatString = _formatString;
    }
    /**
     * Set the format string
     * @param formatString The new string to use for formatting
     */
    Tokenizer.prototype.setFormatString = function (formatString) {
        this._formatString = formatString;
    };
    /**
     * Append a new token to the current list of tokens.
     *
     * @param tokenString The string that makes up the token
     * @param tokenArray The existing array of tokens
     * @param raw (optional) If true, don't parse the token but insert it as is
     * @return Token[] The resulting array of tokens.
     */
    Tokenizer.prototype._appendToken = function (tokenString, tokenArray, raw) {
        if (tokenString !== "") {
            var token = {
                length: tokenString.length,
                raw: tokenString,
                symbol: tokenString[0],
                type: 0 /* IDENTITY */
            };
            if (!raw) {
                token.type = mapSymbolToType(token.symbol);
            }
            tokenArray.push(token);
        }
        return tokenArray;
    };
    /**
     * Parse the internal string and return an array of tokens.
     * @return Token[]
     */
    Tokenizer.prototype.parseTokens = function () {
        var result = [];
        var currentToken = "";
        var previousChar = "";
        var quoting = false;
        var possibleEscaping = false;
        for (var i = 0; i < this._formatString.length; ++i) {
            var currentChar = this._formatString[i];
            // Hanlde escaping and quoting
            if (currentChar === "'") {
                if (!quoting) {
                    if (possibleEscaping) {
                        // Escaped a single ' character without quoting
                        if (currentChar !== previousChar) {
                            result = this._appendToken(currentToken, result);
                            currentToken = "";
                        }
                        currentToken += "'";
                        possibleEscaping = false;
                    }
                    else {
                        possibleEscaping = true;
                    }
                }
                else {
                    // Two possibilities: Were are done quoting, or we are escaping a ' character
                    if (possibleEscaping) {
                        // Escaping, add ' to the token
                        currentToken += currentChar;
                        possibleEscaping = false;
                    }
                    else {
                        // Maybe escaping, wait for next token if we are escaping
                        possibleEscaping = true;
                    }
                }
                if (!possibleEscaping) {
                    // Current character is relevant, so save it for inspecting next round
                    previousChar = currentChar;
                }
                continue;
            }
            else if (possibleEscaping) {
                quoting = !quoting;
                possibleEscaping = false;
                // Flush current token
                result = this._appendToken(currentToken, result, !quoting);
                currentToken = "";
            }
            if (quoting) {
                // Quoting mode, add character to token.
                currentToken += currentChar;
                previousChar = currentChar;
                continue;
            }
            if (currentChar !== previousChar) {
                // We stumbled upon a new token!
                result = this._appendToken(currentToken, result);
                currentToken = currentChar;
            }
            else {
                // We are repeating the token with more characters
                currentToken += currentChar;
            }
            previousChar = currentChar;
        }
        // Don't forget to add the last token to the result!
        result = this._appendToken(currentToken, result, quoting);
        return result;
    };
    return Tokenizer;
})();
exports.Tokenizer = Tokenizer;
/**
 * Different types of tokens, each for a DateTime "period type" (like year, month, hour etc.)
 */
(function (DateTimeTokenType) {
    DateTimeTokenType[DateTimeTokenType["IDENTITY"] = 0] = "IDENTITY";
    DateTimeTokenType[DateTimeTokenType["ERA"] = 1] = "ERA";
    DateTimeTokenType[DateTimeTokenType["YEAR"] = 2] = "YEAR";
    DateTimeTokenType[DateTimeTokenType["QUARTER"] = 3] = "QUARTER";
    DateTimeTokenType[DateTimeTokenType["MONTH"] = 4] = "MONTH";
    DateTimeTokenType[DateTimeTokenType["WEEK"] = 5] = "WEEK";
    DateTimeTokenType[DateTimeTokenType["DAY"] = 6] = "DAY";
    DateTimeTokenType[DateTimeTokenType["WEEKDAY"] = 7] = "WEEKDAY";
    DateTimeTokenType[DateTimeTokenType["DAYPERIOD"] = 8] = "DAYPERIOD";
    DateTimeTokenType[DateTimeTokenType["HOUR"] = 9] = "HOUR";
    DateTimeTokenType[DateTimeTokenType["MINUTE"] = 10] = "MINUTE";
    DateTimeTokenType[DateTimeTokenType["SECOND"] = 11] = "SECOND";
    DateTimeTokenType[DateTimeTokenType["ZONE"] = 12] = "ZONE";
})(exports.DateTimeTokenType || (exports.DateTimeTokenType = {}));
var DateTimeTokenType = exports.DateTimeTokenType;
var symbolMapping = {
    "G": 1 /* ERA */,
    "y": 2 /* YEAR */,
    "Y": 2 /* YEAR */,
    "u": 2 /* YEAR */,
    "U": 2 /* YEAR */,
    "r": 2 /* YEAR */,
    "Q": 3 /* QUARTER */,
    "q": 3 /* QUARTER */,
    "M": 4 /* MONTH */,
    "L": 4 /* MONTH */,
    "l": 4 /* MONTH */,
    "w": 5 /* WEEK */,
    "W": 5 /* WEEK */,
    "d": 6 /* DAY */,
    "D": 6 /* DAY */,
    "F": 6 /* DAY */,
    "g": 6 /* DAY */,
    "E": 7 /* WEEKDAY */,
    "e": 7 /* WEEKDAY */,
    "c": 7 /* WEEKDAY */,
    "a": 8 /* DAYPERIOD */,
    "h": 9 /* HOUR */,
    "H": 9 /* HOUR */,
    "k": 9 /* HOUR */,
    "K": 9 /* HOUR */,
    "j": 9 /* HOUR */,
    "J": 9 /* HOUR */,
    "m": 10 /* MINUTE */,
    "s": 11 /* SECOND */,
    "S": 11 /* SECOND */,
    "A": 11 /* SECOND */,
    "z": 12 /* ZONE */,
    "Z": 12 /* ZONE */,
    "O": 12 /* ZONE */,
    "v": 12 /* ZONE */,
    "V": 12 /* ZONE */,
    "X": 12 /* ZONE */,
    "x": 12 /* ZONE */
};
/**
 * Map the given symbol to one of the DateTimeTokenTypes
 * If there is no mapping, DateTimeTokenType.IDENTITY is used
 *
 * @param symbol The single-character symbol used to map the token
 * @return DateTimeTokenType The Type of token this symbol represents
 */
function mapSymbolToType(symbol) {
    if (symbolMapping.hasOwnProperty(symbol)) {
        return symbolMapping[symbol];
    }
    else {
        return 0 /* IDENTITY */;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRva2VuLnRzIl0sIm5hbWVzIjpbIlRva2VuaXplciIsIlRva2VuaXplci5jb25zdHJ1Y3RvciIsIlRva2VuaXplci5zZXRGb3JtYXRTdHJpbmciLCJUb2tlbml6ZXIuX2FwcGVuZFRva2VuIiwiVG9rZW5pemVyLnBhcnNlVG9rZW5zIiwiRGF0ZVRpbWVUb2tlblR5cGUiLCJtYXBTeW1ib2xUb1R5cGUiXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxBQUdBLDJDQUgyQztJQUc5QixTQUFTO0lBRXJCQTs7O09BR0dBO0lBQ0hBLFNBTllBLFNBQVNBLENBTURBLGFBQXNCQTtRQUF0QkMsa0JBQWFBLEdBQWJBLGFBQWFBLENBQVNBO0lBRTFDQSxDQUFDQTtJQUVERDs7O09BR0dBO0lBQ0hBLG1DQUFlQSxHQUFmQSxVQUFnQkEsWUFBb0JBO1FBQ25DRSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxZQUFZQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFFREY7Ozs7Ozs7T0FPR0E7SUFDS0EsZ0NBQVlBLEdBQXBCQSxVQUFxQkEsV0FBbUJBLEVBQUVBLFVBQW1CQSxFQUFFQSxHQUFhQTtRQUMzRUcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsS0FBS0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLElBQUlBLEtBQUtBLEdBQVVBO2dCQUNsQkEsTUFBTUEsRUFBRUEsV0FBV0EsQ0FBQ0EsTUFBTUE7Z0JBQzFCQSxHQUFHQSxFQUFFQSxXQUFXQTtnQkFDaEJBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsRUFBRUEsZ0JBQTBCQTthQUNoQ0EsQ0FBQ0E7WUFFRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1ZBLEtBQUtBLENBQUNBLElBQUlBLEdBQUdBLGVBQWVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQzVDQSxDQUFDQTtZQUNE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LHlEQUFJQTtJQUNKQSw4REFBTUE7SUFDTkEsOERBQU1BO0lBQ05BLDBEQUFJQTtBQUNMQSxDQUFDQSxFQWZXLHlCQUFpQixLQUFqQix5QkFBaUIsUUFlNUI7QUFmRCxJQUFZLGlCQUFpQixHQUFqQix5QkFlWCxDQUFBO0FBMkJELElBQUksYUFBYSxHQUEwQztJQUMxRCxHQUFHLEVBQUUsV0FBcUI7SUFFMUIsR0FBRyxFQUFFLFlBQXNCO0lBQzNCLEdBQUcsRUFBRSxZQUFzQjtJQUMzQixHQUFHLEVBQUUsWUFBc0I7SUFDM0IsR0FBRyxFQUFFLFlBQXNCO0lBQzNCLEdBQUcsRUFBRSxZQUFzQjtJQUUzQixHQUFHLEVBQUUsZUFBeUI7SUFDOUIsR0FBRyxFQUFFLGVBQXlCO0lBRTlCLEdBQUcsRUFBRSxhQUF1QjtJQUM1QixHQUFHLEVBQUUsYUFBdUI7SUFDNUIsR0FBRyxFQUFFLGFBQXVCO0lBRTVCLEdBQUcsRUFBRSxZQUFzQjtJQUMzQixHQUFHLEVBQUUsWUFBc0I7SUFFM0IsR0FBRyxFQUFFLFdBQXFCO0lBQzFCLEdBQUcsRUFBRSxXQUFxQjtJQUMxQixHQUFHLEVBQUUsV0FBcUI7SUFDMUIsR0FBRyxFQUFFLFdBQXFCO0lBRTFCLEdBQUcsRUFBRSxlQUF5QjtJQUM5QixHQUFHLEVBQUUsZUFBeUI7SUFDOUIsR0FBRyxFQUFFLGVBQXlCO0lBRTlCLEdBQUcsRUFBRSxpQkFBMkI7SUFFaEMsR0FBRyxFQUFFLFlBQXNCO0lBQzNCLEdBQUcsRUFBRSxZQUFzQjtJQUMzQixHQUFHLEVBQUUsWUFBc0I7SUFDM0IsR0FBRyxFQUFFLFlBQXNCO0lBQzNCLEdBQUcsRUFBRSxZQUFzQjtJQUMzQixHQUFHLEVBQUUsWUFBc0I7SUFFM0IsR0FBRyxFQUFFLGVBQXdCO0lBRTdCLEdBQUcsRUFBRSxlQUF3QjtJQUM3QixHQUFHLEVBQUUsZUFBd0I7SUFDN0IsR0FBRyxFQUFFLGVBQXdCO0lBRTdCLEdBQUcsRUFBRSxhQUFzQjtJQUMzQixHQUFHLEVBQUUsYUFBc0I7SUFDM0IsR0FBRyxFQUFFLGFBQXNCO0lBQzNCLEdBQUcsRUFBRSxhQUFzQjtJQUMzQixHQUFHLEVBQUUsYUFBc0I7SUFDM0IsR0FBRyxFQUFFLGFBQXNCO0lBQzNCLEdBQUcsRUFBRSxhQUFzQjtDQUMzQixDQUFDO0FBRUYsQUFPQTs7Ozs7O0dBREc7U0FDTSxlQUFlLENBQUMsTUFBYztJQUN0Q0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQzlCQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNQQSxNQUFNQSxDQUFDQSxnQkFBMEJBLENBQUNBO0lBQ25DQSxDQUFDQTtBQUNGQSxDQUFDQSIsImZpbGUiOiJsaWIvdG9rZW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6W251bGxdfQ==