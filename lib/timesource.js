/**
 * Copyright(c) 2014 Spirit IT BV
 */
/// <reference path="../typings/lib.d.ts"/>
"use strict";
/**
 * Default time source, returns actual time
 */
var RealTimeSource = (function () {
    function RealTimeSource() {
    }
    RealTimeSource.prototype.now = function () {
        /* istanbul ignore if */
        /* istanbul ignore next */
        if (true) {
            return new Date();
        }
    };
    return RealTimeSource;
})();
exports.RealTimeSource = RealTimeSource;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWVzb3VyY2UudHMiXSwibmFtZXMiOlsiUmVhbFRpbWVTb3VyY2UiLCJSZWFsVGltZVNvdXJjZS5jb25zdHJ1Y3RvciIsIlJlYWxUaW1lU291cmNlLm5vdyJdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxBQUVBLDJDQUYyQztBQUUzQyxZQUFZLENBQUM7QUFlYixBQUdBOztHQURHO0lBQ1UsY0FBYztJQUEzQkEsU0FBYUEsY0FBY0E7SUFRM0JDLENBQUNBO0lBUEFELDRCQUFHQSxHQUFIQTtRQUNDRSxBQUVBQSx3QkFGd0JBO1FBQ3hCQSwwQkFBMEJBO1FBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNWQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFDRkYscUJBQUNBO0FBQURBLENBUkEsQUFRQ0EsSUFBQTtBQVJZLHNCQUFjLEdBQWQsY0FRWixDQUFBIiwiZmlsZSI6ImxpYi90aW1lc291cmNlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOltudWxsXX0=