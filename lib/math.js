/**
* Copyright(c) 2014 Spirit IT BV
*
* Math utility functions
*/
/// <reference path="../typings/lib.d.ts"/>
"use strict";
var assert = require("assert");

/**
* @return true iff given argument is an integer number
*/
function isInt(n) {
    if (typeof (n) !== "number") {
        return false;
    }
    if (isNaN(n)) {
        return false;
    }
    return (Math.floor(n) === n);
}
exports.isInt = isInt;

/**
* Stricter variant of parseFloat().
* @param value	Input string
* @return the float if the string is a valid float, NaN otherwise
*/
function filterFloat(value) {
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
        return Number(value);
    }
    return NaN;
}
exports.filterFloat = filterFloat;

function positiveModulo(value, modulo) {
    assert(modulo >= 1, "modulo should be >= 1");
    if (value < 0) {
        return ((value % modulo) + modulo) % modulo;
    } else {
        return value % modulo;
    }
}
exports.positiveModulo = positiveModulo;
