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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImphdmFzY3JpcHQudHMiXSwibmFtZXMiOlsiRGF0ZUZ1bmN0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFFYixBQUtBOzs7O0dBREc7QUFDSCxXQUFZLGFBQWE7SUFDeEJBOztPQUVHQTtJQUNIQSwrQ0FBR0E7SUFDSEE7O09BRUdBO0lBQ0hBLHFEQUFNQTtBQUNQQSxDQUFDQSxFQVRXLHFCQUFhLEtBQWIscUJBQWEsUUFTeEI7QUFURCxJQUFZLGFBQWEsR0FBYixxQkFTWCxDQUFBIiwiZmlsZSI6ImxpYi9qYXZhc2NyaXB0LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOltudWxsXX0=