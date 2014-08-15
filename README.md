# TimezoneComplete

[![Build Status](https://travis-ci.org/SpiritIT/timezonecomplete.svg?branch=master)](https://travis-ci.org/SpiritIT/timezonecomplete)
[![Coverage Status](https://coveralls.io/repos/SpiritIT/timezonecomplete/badge.png?branch=master)](https://coveralls.io/r/SpiritIT/timezonecomplete?branch=master)

## Synopsis

TimezoneComplete is a library of date/time utilities, all of which are aware of time zones and daylight saving time. It provides for calculating with Durations (amount of UTC milliseconds) and with Periods (regular intervals in some timezone's time, which might be irregular in UTC). It has aware DateTimes (with timezone) and unaware DateTimes (without timezone) and you are prevented from mixing the two in calculations.


## Difference with timezone-js, Moment.js and other Date libraries

Other libraries are great. We had different requirements, that's all. We do fix some bugs that originate from the Date class and that result in bugs in most other libraries.


1. Timezonecomplete works around inconsistent behaviour of the Date class. The ECMAScript 6 standard is not specific enough about Date class behaviour around DST changes, and plain wrong in some cases. As a result, the Date class behaviour is different in Firefox, Chrome, IE and Node. Timezonecomplete currently implements workarounds, but plans to be entirely independent of Date soon. Date problems include:
  * The Date constructor normalizes non-existing local times (during DST forward changes) in different ways in Firefox, Chrome, IE and Node.
  * The Date class responds differently to the TZ environment variable on different platforms.
  * The conversion of a local time to a UTC value is broken by specification.
2. The DateTime class in timezonecomplete does not emulate the Date class, because we consider its interface to be inconsistent. For instance, the month numbers ranging from 0 to 11 instead of 1 to 12 catches everyone by surprise. Also, some methods being in plural form and some in singular (getFullYear() versus getHours()). Thus, timezonecomplete is not a drop-in replacement, however with a few find/replace operations you should be able to convert your project. 
3. Timezonecomplete aims to be "complete", whatever that means. Of course it will never be complete but we will keep adding. We did not find a library out there that has all of the following:
  * Naive dates (which know they have NO timezone information)
  * Aware dates (which have timezone information)
  * Proper behaviour around DST changes (note that the ECMA 6 specification leaves this quite unclear and as a result, the JavaScript Date class 
  * Calculating with dates and preserving unit information. Usually calculating with durations requires converting to milliseconds. Your project then becomes littered with "number" type variables that everybody has to guess contains milliseconds. We have a Duration class which you can create and read in terms of Hours, Minutes, Seconds, or Milliseconds. Adding or subtracting DateTimes yields a Duration.
  * Calculating with regular periods. For instance, I could define a period of 12 hours starting at 1970-01-01 08:00:00 Europe/Amsterdam time. What is the next period boundary from the current time?  This cannot be calculated by adding hours to the UTC milliseconds because you have to account for Daylight Saving time.
  * Ability to use with NodeJS as well as in a browser
  * Complete test coverage
  * Under active development

## Usage

See also ./doc/modules/index.html.

### Duration

The Duration class is a unit-aware representation of a duration in wall clock time.
You can create a Duration in milliseconds, seconds, minutes or hours and then query the value in another unit.

```javascript
var tc = require("timezonecomplete");

// a duration of 2 seconds
var duration = tc.Duration.seconds(2);

// duration to string
console.log(duration.toString()); // 00:00:02

// convert to different unit
console.log(duration.milliseconds()); // 2000

// arithmetic
var duration2 = duration.multiply(3); // 6 seconds

// min and max functions
var duration3 = duration2.max(duration); // 6 seconds
```

### DateTime
The DateTime class is a replacement (although not drop-in) for the Date class. It has a date value and a time zone. It has getters for both UTC date and equivalent time zone time.
It is smart enough to be able to represent different dates which map to the same UTC date around DST. Therefore you could increment the local time by an hour and be sure
that the local time is incremented by one hour even if the UTC date does not change.

The DateTime class also fixes various annoyances. 
- All methods are in singular form: "year()" not "years()" and "hour()" not "hours()". The JavaScript Date class mixes these forms. 
- The JavaScript day-of-month is called "date()" instead of "day()". We fixed that.
- We count months from 1 to 12 inclusive like normal human beings, not from 0 to 11 as JavaScript does.
- With both JavaScript Date and timezone-js Date, the UTC millisecond value is sometimes off (because it depends on your local time). The DateTime UTC value
  is always UTC for dates that have a time zone, and it is equal to the "local" date value for naive dates.

```javascript
var tc = require("timezonecomplete");

// a naive timestamp: 2014-01-01 13:59:59
var naiveDate = new tc.DateTime(2014, 1, 1, 13, 59, 59);

// a local time in the time zone of your computer
var localdate = new tc.DateTime("2014-01-01T12:00:00.001", tc.TimeZone.local());

// a fully aware time
var utcDate = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.TimeZone.utc());
var amsterdamDate = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.TimeZone.zone("Europe/Amsterdam"));
var amsterdamDateFromString = new tc.DateTime("2014-01-01T13:59:59.000 Europe/Amsterdam");

// a fully aware time without Daylight Saving Time: a fixed offset from UTC of 2 hours
var fixedOffset = new tc.DateTime("2014-01-01T13:59:59.000+02:00");

console.log(amsterdamDate.toUtcString()); // 2014-01-01T12:59:59.000
console.log(amsterdamDate.toString()); // 2014-01-01T13:59:59.000 Europe/Amsterdam

// time zone conversions
var africaDoualaDate = amsterdamDate.toZone("Africa/Douala");

// Protection against creating aware dates from naive ones
var error = naiveDate.toZone("Europe/Amsterdam"); // throws

// Other way around is ok
var ok = amsterdamDate.toZone(null); // returns naive date

// Week days
var weekDay1 = (new tc.DateTime("2014-07-07T00:00:00 Europe/Amsterdam")).weekDay(); // Monday = 1

// UTC week day from zone datetime
var weekDay2 = (new tc.DateTime("2014-07-07T00:00:00 Europe/Amsterdam")).utcWeekDay(); // Sunday = 0

```

### Date Arithmetic

The DateTime class allows date arithmetic. The diff() method returns the difference between two dates as a Duration. Next to that, you can use add() and addLocal() to add either a duration or a specific unit of time. The latter case accounts for DST and leap seconds: addLocal(1, TimeUnit.Hour) ensures that the local hour() field increments by one, even if that means UTC time does not change or changes 2 hours due to DST.


```javascript
// CONTINUATION FROM PREVIOUS EXAMPLE

// difference between dates in different zones
// returns a Duration
var difference = utcDate.diff(amsterdamDate);

console.log(difference.hours()); // 1

// Add a real hour (3600 seconds) to a time
// Note this does NOT account for leap seconds
var added = localdate.add(tc.Duration.hours(1));

// Add a LOCAL hour to a time (ensure the hour() field increments by 1)
// Note this DOES account for leap seconds and DST
var added = localdate.addLocal(1, tc.TimeUnit.Hour);

// Add a UTC hour to a time (ensure the utcHour() increments by 1,
// due to DST changes the local hour might not change or change 2 hours)
// Note this DOES account for leap seconds and DST
var added = localdate.add(1, tc.TimeUnit.Hour);

```

### Periods

We had a need for regularly scheduling a task. However if you think about it, what does it mean to run something every 12 hours? Does that mean it happens at the same local time every day? Or does it shift with DST?  
The former means that the intervals are not always 12 hours. The latter means that it doesn't occur at the same time always.
We needed to be able to specify both.

```javascript
var tc = require("timezonecomplete");

// Timezone with DST specified (Europe/Amsterdam)
// Last argument is "RegularLocalTime"
// Repeating daily period at 8:05 local Amsterdam time (moves with Daylight Saving Time so it is always at 8:05 locally)
var period = new tc.Period(new tc.DateTime("2014-01-01T08:05:00 Europe/Amsterdam"), 1, tc.TimeUnit.Day, tc.PeriodDst.RegularLocalTime);

// Timezone with DST specified (Europe/Amsterdam)
// Last argument is "RegularIntervals"
// Repeating daily period at 8:05 OR 9:05 local Amsterdam time (which is always 7:05 UTC)
var period = new tc.Period(new tc.DateTime("2014-01-01T08:05:00 Europe/Amsterdam"), 1, tc.TimeUnit.Day, tc.PeriodDst.RegularIntervals);

// Timezone without DST specified (+01:00)
// Repeating daily period at 7:05 UTC
var period2 = new tc.Period(new tc.DateTime("2014-01-01T08:05:00+01:00"), 1, tc.TimeUnit.Day, tc.PeriodDst.RegularLocalTime);

// You can calculate the first occurrence after a given date (in any time zone)
// "2014-05-01T08:05:00.000 Europe/Amsterdam" 
var occurrence = period.findFirst(new tc.DateTime("2014-04-30T12:00:00 Europe/Amsterdam"));

// findNext works much faster, assuming that its parameter is on a period boundary
// "2014-05-02T08:05:00.000 Europe/Amsterdam" 
var occurrence2 = period.findNext(occurrence);

```

## On a web page
We spent some effort making TimezoneComplete usable in the browser, by packaging it in a [UMD](https://github.com/umdjs/umd). This way, it can be used for example in plain html/javascript:

```html
<html>
<head><title>Timezone Complete test</title></head>
<body>
	Hello world
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="timezonecomplete.js"></script> <!-- This is the javascript bundle from ./dist/ -->
	<script>
	    alert(timezonecomplete.isLeapYear(2012));
	</script>
</body>
</html>
```

In theory this bundle is also usable using module loaders like [RequireJS](http://requirejs.org/). However, this has not been thoroughly tested yet, this will happen in the near future.

## FAQ

### What time zone names can I use?
See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

### How do I convert a JavaScript Date object to a DateTime object?

The DateTime class has a constructor that takes a date. It may seem rather complex because the constructor has three parameters. But that was necessary:

1. The first parameter is the Date object.
2. The second parameter indicates which of the two values in the Date object you want to use: a Date object has a UTC value (getUtcFullYear()) and a Local value (getFullYear()). You typically use the local functions, but if you created your date from a unix timestamp then the UTC date is most accurate.
3. The third parameter gives us the missing info: the time zone that the given value is in. 

```javascript

// construct date from separate year, month, day etc.
var jsDate1 = new Date(2014, 5, 6, 8, 0, 0, 0);

// construct date from unix milliseconds
var jsDate2 = new Date(jsDate1.valueOf());

// now the jsDate.getYear(), jsDate.getMonth() etc are assumed to be in America/Boise zone.
var datetime = new tc.DateTime(jsDate, tc.DateFunctions.Get, tc.TimeZone.zone("America/Boise"));

// now the jsDate.getUTCYear(), jsDate.getUTCMonth() etc are assumed to be in America/Boise zone.
var datetime2 = new tc.DateTime(jsDate, tc.DateFunctions.GetUTC, tc.TimeZone.zone("America/Boise"));

```

## Current TZ database version:

The version of the included IANA time zone database is 2014e.

## Changelog

### planned
* Remove Date class usage altogether (v 1.4.5)
* Performance improvements (caching in TzDatabase class) (v1.4.5)
* Make a release 2 where we polish the interface to the library a bit (v2.0.0)

### 1.4.4 (2014-08-14)
* TZ database version: 2014e
* Removed dependency on timezone-js
* Fixed inconsistent behaviour across different platforms.
* Fixed inconsistent behaviour with / without TZ environment variable setting.
* Fixed behaviour with non-existing local times.

### 1.4.3 (2014-07-31)
* Improved timezonecomplete behaviour when using browserify

### 1.4.2 (2014-07-28)
* Ensured tests run with different TZ environment variable settings
* Ensured build runs on Travis CI and the coverage is picked up by Coveralls.io
* Bugfix in weekDay() for times near 00:00:00 with certain machine time zones

### 1.4.1 (2014-07-24)
* Ensured all code is covered with tests using istanbul
* Bufgix in DateTime.toIsoString(): missing space
* Bufgix in DateTime.toIsoString(): local time zone not handled correctly
* Bugfix in Period.findFirst() regarding regular local time periods of less than one hour
* Bugfix in Period.toIsoString() which did not include the start date
* Performance improvement for Period.findFirst() regarding Second periods.

### 1.4.0 (2014-07-24)
* Enable use of timezonecomplete in browser

### 1.3.1 (2014-07-09)
* Add inspect() methods so that console.log(myDateTime) works.
* Bugfix in DateTime.toString(): missing space for datetime in local time.

### 1.3.0 (2014-07-07)
* Add day-of-week methods to DateTime:  weekDay() and utcWeekDay()
* Add .d.ts file for timezonecomplete inside the package as well as on DefinitelyTyped

### 1.2.0 (2014-06-30)
* Add Duration.divide() method

### 1.1.0 (2014-06-27)
* Update Time Zone Database to 2014-06-16
* Add Duration.add() and Duration.sub() methods

### 1.0.1 (2014-06-26)
* Bugfixes in package.json

### 1.0.0 (2014-06-26)
* First released version.

## Contributors

* Rogier Schouten <r.schouten@spiritit.com>
* Daan Wissing <d.wissing@spiritit.com>
* Peter Kooijmans <p.kooijmans@spiritit.com>

## License

MIT

