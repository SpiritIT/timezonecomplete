/**
 * Copyright(c) 2014 Spirit IT BV
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
/**
 * Indicates how a Date object should be interpreted.
 * Either we can take getYear(), getMonth() etc for our field
 * values, or we can take getUTCYear(), getUtcMonth() etc to do that.
 */
(function (DateFunctions) {
    /**
     * Use the Date.getFullYear(), Date.getMonth(), ... functions.
     */
    DateFunctions[DateFunctions["Get"] = 0] = "Get";
    /**
     * Use the Date.getUTCFullYear(), Date.getUTCMonth(), ... functions.
     */
    DateFunctions[DateFunctions["GetUTC"] = 1] = "GetUTC";
})(exports.DateFunctions || (exports.DateFunctions = {}));
var DateFunctions = exports.DateFunctions;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qYXZhc2NyaXB0LnRzIl0sIm5hbWVzIjpbIkRhdGVGdW5jdGlvbnMiXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsQUFFQSwyQ0FGMkM7QUFFM0MsWUFBWSxDQUFDO0FBRWIsQUFLQTs7OztHQURHO0FBQ0gsV0FBWSxhQUFhO0lBQ3hCQSxBQUdBQTs7T0FER0E7SUFDSEEsK0NBQUdBLENBQUFBO0lBQ0hBLEFBR0FBOztPQURHQTtJQUNIQSxxREFBTUEsQ0FBQUE7QUFDUEEsQ0FBQ0EsRUFUVyxxQkFBYSxLQUFiLHFCQUFhLFFBU3hCO0FBVEQsSUFBWSxhQUFhLEdBQWIscUJBU1gsQ0FBQSIsImZpbGUiOiJsaWIvamF2YXNjcmlwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb3B5cmlnaHQoYykgMjAxNCBTcGlyaXQgSVQgQlZcclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZC50c1wiLz5cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEluZGljYXRlcyBob3cgYSBEYXRlIG9iamVjdCBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXHJcbiAqIEVpdGhlciB3ZSBjYW4gdGFrZSBnZXRZZWFyKCksIGdldE1vbnRoKCkgZXRjIGZvciBvdXIgZmllbGRcclxuICogdmFsdWVzLCBvciB3ZSBjYW4gdGFrZSBnZXRVVENZZWFyKCksIGdldFV0Y01vbnRoKCkgZXRjIHRvIGRvIHRoYXQuXHJcbiAqL1xyXG5leHBvcnQgZW51bSBEYXRlRnVuY3Rpb25zIHtcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0RnVsbFllYXIoKSwgRGF0ZS5nZXRNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldCxcclxuXHQvKipcclxuXHQgKiBVc2UgdGhlIERhdGUuZ2V0VVRDRnVsbFllYXIoKSwgRGF0ZS5nZXRVVENNb250aCgpLCAuLi4gZnVuY3Rpb25zLlxyXG5cdCAqL1xyXG5cdEdldFVUQ1xyXG59XHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=