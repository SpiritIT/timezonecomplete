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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90b2tlbi50cyJdLCJuYW1lcyI6WyJUb2tlbml6ZXIiLCJUb2tlbml6ZXIuY29uc3RydWN0b3IiLCJUb2tlbml6ZXIuc2V0Rm9ybWF0U3RyaW5nIiwiVG9rZW5pemVyLl9hcHBlbmRUb2tlbiIsIlRva2VuaXplci5wYXJzZVRva2VucyIsIkRhdGVUaW1lVG9rZW5UeXBlIiwibWFwU3ltYm9sVG9UeXBlIl0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsQUFHQSwyQ0FIMkM7SUFHOUIsU0FBUztJQUVyQkE7OztPQUdHQTtJQUNIQSxTQU5ZQSxTQUFTQSxDQU1EQSxhQUFzQkE7UUFBdEJDLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFTQTtJQUUxQ0EsQ0FBQ0E7SUFFREQ7OztPQUdHQTtJQUNIQSxtQ0FBZUEsR0FBZkEsVUFBZ0JBLFlBQW9CQTtRQUNuQ0UsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsWUFBWUEsQ0FBQ0E7SUFDbkNBLENBQUNBO0lBRURGOzs7Ozs7O09BT0dBO0lBQ0tBLGdDQUFZQSxHQUFwQkEsVUFBcUJBLFdBQW1CQSxFQUFFQSxVQUFtQkEsRUFBRUEsR0FBYUE7UUFDM0VHLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxJQUFJQSxLQUFLQSxHQUFVQTtnQkFDbEJBLE1BQU1BLEVBQUVBLFdBQVdBLENBQUNBLE1BQU1BO2dCQUMxQkEsR0FBR0EsRUFBRUEsV0FBV0E7Z0JBQ2hCQSxNQUFNQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLElBQUlBLEVBQUVBLGdCQUEwQkE7YUFDaENBLENBQUNBO1lBRUZBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO2dCQUNWQSxLQUFLQSxDQUFDQSxJQUFJQSxHQUFHQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUM1Q0EsQ0FBQ0E7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QUMzQixHQUFHLEVBQUUsYUFBc0I7SUFDM0IsR0FBRyxFQUFFLGFBQXNCO0lBQzNCLEdBQUcsRUFBRSxhQUFzQjtJQUMzQixHQUFHLEVBQUUsYUFBc0I7Q0FDM0IsQ0FBQztBQUVGLEFBT0E7Ozs7OztHQURHO1NBQ00sZUFBZSxDQUFDLE1BQWM7SUFDdENDLEVBQUVBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBLGNBQWNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDUEEsTUFBTUEsQ0FBQ0EsZ0JBQTBCQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7QUFDRkEsQ0FBQ0EiLCJmaWxlIjoibGliL3Rva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKlxyXG4gKiBGdW5jdGlvbmFsaXR5IHRvIHBhcnNlIGEgRGF0ZVRpbWUgb2JqZWN0IHRvIGEgc3RyaW5nXHJcbiAqL1xyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmQudHNcIi8+XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRva2VuaXplciB7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZSBhIG5ldyB0b2tlbml6ZXJcclxuXHQgKiBAcGFyYW0gX2Zvcm1hdFN0cmluZyAob3B0aW9uYWwpIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgX2Zvcm1hdFN0cmluZz86IHN0cmluZykge1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCB0aGUgZm9ybWF0IHN0cmluZ1xyXG5cdCAqIEBwYXJhbSBmb3JtYXRTdHJpbmcgVGhlIG5ldyBzdHJpbmcgdG8gdXNlIGZvciBmb3JtYXR0aW5nXHJcblx0ICovXHJcblx0c2V0Rm9ybWF0U3RyaW5nKGZvcm1hdFN0cmluZzogc3RyaW5nKTogdm9pZCB7XHJcblx0XHR0aGlzLl9mb3JtYXRTdHJpbmcgPSBmb3JtYXRTdHJpbmc7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBcHBlbmQgYSBuZXcgdG9rZW4gdG8gdGhlIGN1cnJlbnQgbGlzdCBvZiB0b2tlbnMuXHJcblx0ICogXHJcblx0ICogQHBhcmFtIHRva2VuU3RyaW5nIFRoZSBzdHJpbmcgdGhhdCBtYWtlcyB1cCB0aGUgdG9rZW5cclxuXHQgKiBAcGFyYW0gdG9rZW5BcnJheSBUaGUgZXhpc3RpbmcgYXJyYXkgb2YgdG9rZW5zXHJcblx0ICogQHBhcmFtIHJhdyAob3B0aW9uYWwpIElmIHRydWUsIGRvbid0IHBhcnNlIHRoZSB0b2tlbiBidXQgaW5zZXJ0IGl0IGFzIGlzXHJcblx0ICogQHJldHVybiBUb2tlbltdIFRoZSByZXN1bHRpbmcgYXJyYXkgb2YgdG9rZW5zLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2FwcGVuZFRva2VuKHRva2VuU3RyaW5nOiBzdHJpbmcsIHRva2VuQXJyYXk6IFRva2VuW10sIHJhdz86IGJvb2xlYW4pOiBUb2tlbltdIHtcclxuXHRcdGlmICh0b2tlblN0cmluZyAhPT0gXCJcIikge1xyXG5cdFx0XHR2YXIgdG9rZW46IFRva2VuID0ge1xyXG5cdFx0XHRcdGxlbmd0aDogdG9rZW5TdHJpbmcubGVuZ3RoLFxyXG5cdFx0XHRcdHJhdzogdG9rZW5TdHJpbmcsXHJcblx0XHRcdFx0c3ltYm9sOiB0b2tlblN0cmluZ1swXSxcclxuXHRcdFx0XHR0eXBlOiBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWVxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdFx0aWYgKCFyYXcpIHtcclxuXHRcdFx0XHR0b2tlbi50eXBlID0gbWFwU3ltYm9sVG9UeXBlKHRva2VuLnN5bWJvbCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dG9rZW5BcnJheS5wdXNoKHRva2VuKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0b2tlbkFycmF5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUGFyc2UgdGhlIGludGVybmFsIHN0cmluZyBhbmQgcmV0dXJuIGFuIGFycmF5IG9mIHRva2Vucy5cclxuXHQgKiBAcmV0dXJuIFRva2VuW11cclxuXHQgKi9cclxuXHRwYXJzZVRva2VucygpOiBUb2tlbltdIHtcclxuXHRcdHZhciByZXN1bHQ6IFRva2VuW10gPSBbXTtcclxuXHJcblx0XHR2YXIgY3VycmVudFRva2VuOiBzdHJpbmcgPSBcIlwiO1xyXG5cdFx0dmFyIHByZXZpb3VzQ2hhcjogc3RyaW5nID0gXCJcIjtcclxuXHRcdHZhciBxdW90aW5nOiBib29sZWFuID0gZmFsc2U7XHJcblx0XHR2YXIgcG9zc2libGVFc2NhcGluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZm9ybWF0U3RyaW5nLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdHZhciBjdXJyZW50Q2hhciA9IHRoaXMuX2Zvcm1hdFN0cmluZ1tpXTtcclxuXHJcblx0XHRcdC8vIEhhbmxkZSBlc2NhcGluZyBhbmQgcXVvdGluZ1xyXG5cdFx0XHRpZiAoY3VycmVudENoYXIgPT09IFwiJ1wiKSB7XHJcblx0XHRcdFx0aWYgKCFxdW90aW5nKSB7XHJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0XHQvLyBFc2NhcGVkIGEgc2luZ2xlICcgY2hhcmFjdGVyIHdpdGhvdXQgcXVvdGluZ1xyXG5cdFx0XHRcdFx0XHRpZiAoY3VycmVudENoYXIgIT09IHByZXZpb3VzQ2hhcikge1xyXG5cdFx0XHRcdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuXHRcdFx0XHRcdFx0XHRjdXJyZW50VG9rZW4gPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBcIidcIjtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIFR3byBwb3NzaWJpbGl0aWVzOiBXZXJlIGFyZSBkb25lIHF1b3RpbmcsIG9yIHdlIGFyZSBlc2NhcGluZyBhICcgY2hhcmFjdGVyXHJcblx0XHRcdFx0XHRpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdFx0XHQvLyBFc2NhcGluZywgYWRkICcgdG8gdGhlIHRva2VuXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRcdFx0cG9zc2libGVFc2NhcGluZyA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly8gTWF5YmUgZXNjYXBpbmcsIHdhaXQgZm9yIG5leHQgdG9rZW4gaWYgd2UgYXJlIGVzY2FwaW5nXHJcblx0XHRcdFx0XHRcdHBvc3NpYmxlRXNjYXBpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKCFwb3NzaWJsZUVzY2FwaW5nKSB7XHJcblx0XHRcdFx0XHQvLyBDdXJyZW50IGNoYXJhY3RlciBpcyByZWxldmFudCwgc28gc2F2ZSBpdCBmb3IgaW5zcGVjdGluZyBuZXh0IHJvdW5kXHJcblx0XHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH0gZWxzZSBpZiAocG9zc2libGVFc2NhcGluZykge1xyXG5cdFx0XHRcdHF1b3RpbmcgPSAhcXVvdGluZztcclxuXHRcdFx0XHRwb3NzaWJsZUVzY2FwaW5nID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdC8vIEZsdXNoIGN1cnJlbnQgdG9rZW5cclxuXHRcdFx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgIXF1b3RpbmcpO1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiA9IFwiXCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmIChxdW90aW5nKSB7XHJcblx0XHRcdFx0Ly8gUXVvdGluZyBtb2RlLCBhZGQgY2hhcmFjdGVyIHRvIHRva2VuLlxyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRwcmV2aW91c0NoYXIgPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGN1cnJlbnRDaGFyICE9PSBwcmV2aW91c0NoYXIpIHtcclxuXHRcdFx0XHQvLyBXZSBzdHVtYmxlZCB1cG9uIGEgbmV3IHRva2VuIVxyXG5cdFx0XHRcdHJlc3VsdCA9IHRoaXMuX2FwcGVuZFRva2VuKGN1cnJlbnRUb2tlbiwgcmVzdWx0KTtcclxuXHRcdFx0XHRjdXJyZW50VG9rZW4gPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBXZSBhcmUgcmVwZWF0aW5nIHRoZSB0b2tlbiB3aXRoIG1vcmUgY2hhcmFjdGVyc1xyXG5cdFx0XHRcdGN1cnJlbnRUb2tlbiArPSBjdXJyZW50Q2hhcjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cHJldmlvdXNDaGFyID0gY3VycmVudENoYXI7XHJcblx0XHR9XHJcblx0XHQvLyBEb24ndCBmb3JnZXQgdG8gYWRkIHRoZSBsYXN0IHRva2VuIHRvIHRoZSByZXN1bHQhXHJcblx0XHRyZXN1bHQgPSB0aGlzLl9hcHBlbmRUb2tlbihjdXJyZW50VG9rZW4sIHJlc3VsdCwgcXVvdGluZyk7XHJcblxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogRGlmZmVyZW50IHR5cGVzIG9mIHRva2VucywgZWFjaCBmb3IgYSBEYXRlVGltZSBcInBlcmlvZCB0eXBlXCIgKGxpa2UgeWVhciwgbW9udGgsIGhvdXIgZXRjLilcclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVUaW1lVG9rZW5UeXBlIHtcclxuXHRJREVOVElUWSwgLy8gU3BlY2lhbCwgZG8gbm90IFwiZm9ybWF0XCIgdGhpcywgYnV0IGp1c3Qgb3V0cHV0IHdoYXQgd2VudCBpblxyXG5cclxuXHRFUkEsXHJcblx0WUVBUixcclxuXHRRVUFSVEVSLFxyXG5cdE1PTlRILFxyXG5cdFdFRUssXHJcblx0REFZLFxyXG5cdFdFRUtEQVksXHJcblx0REFZUEVSSU9ELFxyXG5cdEhPVVIsXHJcblx0TUlOVVRFLFxyXG5cdFNFQ09ORCxcclxuXHRaT05FXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNpYyB0b2tlbiBcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW4ge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSB0eXBlIG9mIHRva2VuXHJcblx0ICovXHJcblx0dHlwZTogRGF0ZVRpbWVUb2tlblR5cGU7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzeW1ib2wgZnJvbSB3aGljaCB0aGUgdG9rZW4gd2FzIHBhcnNlZFxyXG5cdCAqL1xyXG5cdHN5bWJvbDogc3RyaW5nO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgdG90YWwgbGVuZ3RoIG9mIHRoZSB0b2tlblxyXG5cdCAqL1xyXG5cdGxlbmd0aDogbnVtYmVyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgb3JpZ2luYWwgc3RyaW5nIHRoYXQgcHJvZHVjZWQgdGhpcyB0b2tlblxyXG5cdCAqL1xyXG5cdHJhdzogc3RyaW5nO1xyXG59XHJcblxyXG52YXIgc3ltYm9sTWFwcGluZzogeyBbY2hhcjogc3RyaW5nXTogRGF0ZVRpbWVUb2tlblR5cGUgfSA9IHtcclxuXHRcIkdcIjogRGF0ZVRpbWVUb2tlblR5cGUuRVJBLFxyXG5cclxuXHRcInlcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcIllcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcInVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcIlVcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHRcInJcIjogRGF0ZVRpbWVUb2tlblR5cGUuWUVBUixcclxuXHJcblx0XCJRXCI6IERhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVIsXHJcblx0XCJxXCI6IERhdGVUaW1lVG9rZW5UeXBlLlFVQVJURVIsXHJcblxyXG5cdFwiTVwiOiBEYXRlVGltZVRva2VuVHlwZS5NT05USCxcclxuXHRcIkxcIjogRGF0ZVRpbWVUb2tlblR5cGUuTU9OVEgsXHJcblx0XCJsXCI6IERhdGVUaW1lVG9rZW5UeXBlLk1PTlRILFxyXG5cclxuXHRcIndcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuXHRcIldcIjogRGF0ZVRpbWVUb2tlblR5cGUuV0VFSyxcclxuXHJcblx0XCJkXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHRcIkRcIjogRGF0ZVRpbWVUb2tlblR5cGUuREFZLFxyXG5cdFwiRlwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVksXHJcblx0XCJnXCI6IERhdGVUaW1lVG9rZW5UeXBlLkRBWSxcclxuXHJcblx0XCJFXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XCJlXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblx0XCJjXCI6IERhdGVUaW1lVG9rZW5UeXBlLldFRUtEQVksXHJcblxyXG5cdFwiYVwiOiBEYXRlVGltZVRva2VuVHlwZS5EQVlQRVJJT0QsXHJcblxyXG5cdFwiaFwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwiSFwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwia1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwiS1wiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwialwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cdFwiSlwiOiBEYXRlVGltZVRva2VuVHlwZS5IT1VSLFxyXG5cclxuXHRcIm1cIjogRGF0ZVRpbWVUb2tlblR5cGUuTUlOVVRFLFxyXG5cclxuXHRcInNcIjogRGF0ZVRpbWVUb2tlblR5cGUuU0VDT05ELFxyXG5cdFwiU1wiOiBEYXRlVGltZVRva2VuVHlwZS5TRUNPTkQsXHJcblx0XCJBXCI6IERhdGVUaW1lVG9rZW5UeXBlLlNFQ09ORCxcclxuXHJcblx0XCJ6XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJaXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJPXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJ2XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJWXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJYXCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkUsXHJcblx0XCJ4XCI6IERhdGVUaW1lVG9rZW5UeXBlLlpPTkVcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYXAgdGhlIGdpdmVuIHN5bWJvbCB0byBvbmUgb2YgdGhlIERhdGVUaW1lVG9rZW5UeXBlc1xyXG4gKiBJZiB0aGVyZSBpcyBubyBtYXBwaW5nLCBEYXRlVGltZVRva2VuVHlwZS5JREVOVElUWSBpcyB1c2VkXHJcbiAqXHJcbiAqIEBwYXJhbSBzeW1ib2wgVGhlIHNpbmdsZS1jaGFyYWN0ZXIgc3ltYm9sIHVzZWQgdG8gbWFwIHRoZSB0b2tlblxyXG4gKiBAcmV0dXJuIERhdGVUaW1lVG9rZW5UeXBlIFRoZSBUeXBlIG9mIHRva2VuIHRoaXMgc3ltYm9sIHJlcHJlc2VudHNcclxuICovXHJcbmZ1bmN0aW9uIG1hcFN5bWJvbFRvVHlwZShzeW1ib2w6IHN0cmluZyk6IERhdGVUaW1lVG9rZW5UeXBlIHtcclxuXHRpZiAoc3ltYm9sTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShzeW1ib2wpKSB7XHJcblx0XHRyZXR1cm4gc3ltYm9sTWFwcGluZ1tzeW1ib2xdO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gRGF0ZVRpbWVUb2tlblR5cGUuSURFTlRJVFk7XHJcblx0fVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==