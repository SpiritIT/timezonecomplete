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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qYXZhc2NyaXB0LnRzIl0sIm5hbWVzIjpbIkRhdGVGdW5jdGlvbnMiXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsMkNBQTJDO0FBRTNDLFlBQVksQ0FBQztBQUViOzs7O0dBSUc7QUFDSCxXQUFZLGFBQWE7SUFDeEJBOztPQUVHQTtJQUNIQSwrQ0FBR0EsQ0FBQUE7SUFDSEE7O09BRUdBO0lBQ0hBLHFEQUFNQSxDQUFBQTtBQUNQQSxDQUFDQSxFQVRXLHFCQUFhLEtBQWIscUJBQWEsUUFTeEI7QUFURCxJQUFZLGFBQWEsR0FBYixxQkFTWCxDQUFBIiwiZmlsZSI6ImxpYi9qYXZhc2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodChjKSAyMDE0IFNwaXJpdCBJVCBCVlxyXG4gKi9cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5kLnRzXCIvPlxyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogSW5kaWNhdGVzIGhvdyBhIERhdGUgb2JqZWN0IHNob3VsZCBiZSBpbnRlcnByZXRlZC5cclxuICogRWl0aGVyIHdlIGNhbiB0YWtlIGdldFllYXIoKSwgZ2V0TW9udGgoKSBldGMgZm9yIG91ciBmaWVsZFxyXG4gKiB2YWx1ZXMsIG9yIHdlIGNhbiB0YWtlIGdldFVUQ1llYXIoKSwgZ2V0VXRjTW9udGgoKSBldGMgdG8gZG8gdGhhdC5cclxuICovXHJcbmV4cG9ydCBlbnVtIERhdGVGdW5jdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRGdWxsWWVhcigpLCBEYXRlLmdldE1vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0LFxyXG5cdC8qKlxyXG5cdCAqIFVzZSB0aGUgRGF0ZS5nZXRVVENGdWxsWWVhcigpLCBEYXRlLmdldFVUQ01vbnRoKCksIC4uLiBmdW5jdGlvbnMuXHJcblx0ICovXHJcblx0R2V0VVRDXHJcbn1cclxuXHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==