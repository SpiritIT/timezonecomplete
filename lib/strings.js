/**
 * Copyright(c) 2014 Spirit IT BV
 *
 * String utility functions
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");
/**
 * Pad a string by adding characters to the beginning.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
function padLeft(s, width, char) {
    assert(width > 0, "expect width > 0");
    assert(char.length === 1, "expect single character in char");
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return padding + s;
}
exports.padLeft = padLeft;
/**
 * Pad a string by adding characters to the end.
 * @param s	the string to pad
 * @param width	the desired minimum string width
 * @param char	the single character to pad with
 * @return	the padded string
 */
function padRight(s, width, char) {
    assert(width > 0, "expect width > 0");
    assert(char.length === 1, "expect single character in char");
    var padding = "";
    for (var i = 0; i < (width - s.length); i++) {
        padding += char;
    }
    return s + padding;
}
exports.padRight = padRight;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0cmluZ3MudHMiXSwibmFtZXMiOlsicGFkTGVmdCIsInBhZFJpZ2h0Il0sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsQUFFQSwyQ0FGMkM7QUFFM0MsWUFBWSxDQUFDO0FBRWIsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUM7QUFFbEMsQUFPQTs7Ozs7O0dBREc7U0FDYSxPQUFPLENBQUMsQ0FBUyxFQUFFLEtBQWEsRUFBRSxJQUFZO0lBQzdEQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO0lBQ3RDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxFQUFFQSxpQ0FBaUNBLENBQUNBLENBQUNBO0lBQzdEQSxJQUFJQSxPQUFPQSxHQUFXQSxFQUFFQSxDQUFDQTtJQUN6QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDN0NBLE9BQU9BLElBQUlBLElBQUlBLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0E7QUFSZSxlQUFPLEdBQVAsT0FRZixDQUFBO0FBRUQsQUFPQTs7Ozs7O0dBREc7U0FDYSxRQUFRLENBQUMsQ0FBUyxFQUFFLEtBQWEsRUFBRSxJQUFZO0lBQzlEQyxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO0lBQ3RDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxFQUFFQSxpQ0FBaUNBLENBQUNBLENBQUNBO0lBQzdEQSxJQUFJQSxPQUFPQSxHQUFXQSxFQUFFQSxDQUFDQTtJQUN6QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDN0NBLE9BQU9BLElBQUlBLElBQUlBLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxPQUFPQSxDQUFDQTtBQUNwQkEsQ0FBQ0E7QUFSZSxnQkFBUSxHQUFSLFFBUWYsQ0FBQSIsImZpbGUiOiJsaWIvc3RyaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbbnVsbF19