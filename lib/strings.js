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
