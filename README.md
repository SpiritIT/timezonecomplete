# TimezoneComplete

[![Coverage Status](https://coveralls.io/repos/SpiritIT/timezonecomplete/badge.png?branch=master)](https://coveralls.io/r/SpiritIT/timezonecomplete?branch=master)
[![NPM version](https://badge.fury.io/js/timezonecomplete.svg)](http://badge.fury.io/js/timezonecomplete)
![license](http://img.shields.io/npm/l/timezonecomplete.svg)

[![NPM](https://nodei.co/npm/timezonecomplete.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/timezonecomplete/)
[![NPM](https://nodei.co/npm-dl/timezonecomplete.png?months=9&height=3)](https://nodei.co/npm/timezonecomplete/)

## New in version 2

* Browser bundle with UMD wrapper and minified version
* For TypeScript users: uses ES6-style imports
* For TypeScript users: uses 'typings' field in package.json, so you can/must drop your reference to timezonecomplete.d.ts and ensure that you use 'node' module resolution for tsc.
* Added karma tests to ensure timezonecomplete works well across different browsers

## Upgrading from version 1

Javascript users don't need to do anything. Typescript users should:
* Remove your triple-slash references to the timezonecomplete typings file
* Ensure tsc is called with 'node' module resolution (which is the default)

## Synopsis

TimezoneComplete is a library of date/time utilities, all of which are aware of time zones and daylight saving time. It provides for calculating with Durations (amount of UTC milliseconds) and with Periods (regular intervals in some timezone's time, which might be irregular in UTC). It has aware DateTimes (with timezone) and unaware DateTimes (without timezone) and you are prevented from mixing the two in calculations.


## Difference with timezone-js, Moment.js and other Date libraries

Other libraries are great, we had different requirements. Oh, and they all had bugs in time zone conversions and Daylight Saving Time calculations.

* Consistent behaviour across platforms and with different TZ environment variable settings
* Correct time zone conversions back and forth
* Correct Daylight Saving Time handling with predictable behavior for non-existing hours during DST changes
* Feature-rich:
  * Naive dates (which know they have NO timezone information)
  * Aware dates (which have timezone information)
  * Calculating with dates
  * Durations with units
  * Periods with regular UTC or regular local time repetition
  * Utility functions for determining leap years, determining the last Monday of the month etc.
  * Ability to use with Node.JS as well as in a browser (CommonJS, AMD)
* Good test coverage
* Under active development by a company who have an interest in keeping it up to date
* Timezonecomplete is written in Typescript and typings are included

## Usage

### Node.JS

Install using:
```
npm install timezonecomplete
```

Then require the module in your code:

```javascript
var tc = require("timezonecomplete");
```

### Browser

There are two options:
* Browserify your Node.JS code
* Use one of the ready-made UMD-wrapped browser bundles: [timezonecomplete.js](dist/timezonecomplete.js) or [timezonecomplete.min.js](dist/timezonecomplete.min.js). You can find an example of timezonecomplete and RequireJS in the [examples](examples/) directory

### Enums

```javascript

// day-of-week
tc.WeekDay.Sunday;
tc.WeekDay.Monday;
tc.WeekDay.Tuesday;
tc.WeekDay.Wednesday;
tc.WeekDay.Friday;
tc.WeekDay.Saturday;

// time units, used e.g. when adding to DateTime
tc.TimeUnit.Year;
tc.TimeUnit.Month;
tc.TimeUnit.Week;
tc.TimeUnit.Day;
tc.TimeUnit.Hour;
tc.TimeUnit.Minute;
tc.TimeUnit.Second;
tc.TimeUnit.Millisecond;

```

### Utility Functions

Timezonecomplete defines a number of utility functions.

```javascript

// number of days in a month, accounting for leap years
tc.daysInMonth(2004, 2); // returns 29
tc.daysInMonth(2014, 2); // returns 28

// number of days in a given year
tc.daysInYear(2004); // returns 366
tc.daysInYear(2014); // returns 365

// is the given year a leap year?
tc.isLeapYear(2004); // returns true
tc.isLeapYear(2014); // returns false

// first Monday of August in 2014
tc.firstWeekDayOfMonth(2014, 8, tc.WeekDay.Monday); // returns 4

// last Monday of August in 2014
tc.lastWeekDayOfMonth(2014, 8, tc.WeekDay.Monday); // returns 25

// First Sunday on or after August 15th, 2014
tc.weekDayOnOrAfter(2014, 8, 15, tc.WeekDay.Sunday); // returns 17

// Last Sunday on or before August 15th, 2014
tc.weekDayOnOrBefore(2014, 8, 15, tc.WeekDay.Sunday); // returns 10

// Week number according to ISO 8601 (note this does NOT match American week numbers)
tc.weekNumber(2013, 12, 30); // 1

// Week of the month
tc.weekOfMonth(2013, 12, 30); // 1 (because it's part of the first week of January)

// n-th day of the year, counting from 0
tc.dayOfYear(2014, 1, 1); // returns 0
tc.dayOfYear(2014, 2, 1); // returns 31

// n-th second of the day, counting from 0
tc.secondOfDay(1, 0, 0); // returns 3600

// min and max for Duration
var duration1 = tc.seconds(3);
var duration2 = tc.seconds(1);
tc.min(duration1, duration2); // returns a clone of duration2
tc.max(duration1, duration2); // returns a clone of duration1

// min and max for DateTime
var datetime1 = new tc.DateTime("2014-01-01");
var datetime2 = new tc.DateTime("2014-01-22");
tc.min(datetime1, datetime2); // returns a clone of datetime1
tc.max(datetime1, datetime2); // returns a clone of datetime2

// convert a time unit to approximate milliseconds
tc.timeUnitToMilliseconds(-2, tc.TimeUnit.Second); // returns -2 * 1000 milliseconds
tc.timeUnitToMilliseconds(-2, tc.TimeUnit.Day); // returns -2 * 1000 * 3600 * 24 milliseconds
tc.timeUnitToMilliseconds(-2, tc.TimeUnit.Month); // returns -2 * 1000 * 3600 * 24 * 30 milliseconds
tc.timeUnitToMilliseconds(-2, tc.TimeUnit.Year); // returns -2 * 1000 * 3600 * 24 * 365 milliseconds

// time unit to string function takes an optional amount and pluralizes the outcome
tc.timeUnitToString(tc.TimeUnit.Day); // "day"
tc.timeUnitToString(tc.TimeUnit.Day, 1); // "day"
tc.timeUnitToString(tc.TimeUnit.Day, -1); // "day"
tc.timeUnitToString(tc.TimeUnit.Day, 5); // "days"

// time unit from string function
tc.stringToTimeUnit("days"); // tc.TimeUnit.Day
tc.stringToTimeUnit("day"); // tc.TimeUnit.Day
tc.stringToTimeUnit("DAY"); // tc.TimeUnit.Day

```

### Duration

The Duration class is a unit-aware representation of a duration in wall clock time.
You can create a Duration in milliseconds, seconds, minutes or hours and then query the value in another unit.

```javascript
// creating durations
var duration;
duration = tc.milliseconds(2);	// 2 milliseconds
duration = tc.seconds(2);	// 2 seconds
duration = tc.minutes(2);	// 2 minutes
duration = tc.hours(-2.5); // -2.5 hours
duration = tc.days(-2.5); // -2.5 days
duration = tc.months(-2.5); // -2.5 months
duration = tc.years(-2.5); // -2.5 years

// getters
duration = tc.years(-2.5); // -2.5 years
duration.amount(); // -2.5
duration.unit(); // tc.TimeUnit.Year

// old (more verbose) method for creating:
duration = tc.Duration.milliseconds(2);	// 2 milliseconds
duration = tc.Duration.seconds(2);	// 2 seconds
duration = tc.Duration.minutes(2);	// 2 minutes
duration = tc.Duration.hours(2); // 2 hours

// duration to string
duration = tc.seconds(2);
console.log(duration.toString()); // 00:00:02
console.log(duration.toFullString()); // 00:00:02.000

// value expressed as different unit
console.log(duration.milliseconds()); // 2000

// duration converted to new duration in different unit
duration.convert(tc.TimeUnit.Millisecond); // returns new duration of 2000 milliseconds
duration.as(tc.TimeUnit.Millisecond); // returns number 2000


// arithmetic - preserves the original unit
var duration2;
duration = tc.seconds(2); // 2 seconds
duration2 = duration.add(tc.hours(5)); // 18002 seconds
duration2 = duration.sub(tc.milliseconds(500)); // 1.5 seconds
duration2 = duration.multiply(3); // 6 seconds
duration2 = duration.divide(3); // 0.67 seconds

// note that e.g. adding hours to months gives an approximate value
// as not all months are equally long
duration = tc.hours(2);
duration2 = duration.add(tc.months(1)); // 2 + (30 * 24) hours = 722 hours

// comparisons
var sixSecs = tc.seconds(6);
var fiveSecs = tc.seconds(5);

// normal < and > work
fiveSecs > sixSecs; // false
fiveSecs < sixSecs; // true

fiveSecs.lessThan(sixSecs); // true
fiveSecs.lessEqual(sixSecs); // true
fiveSecs.equals(sixSecs); // false
fiveSecs.greaterEqual(sixSecs); // false
fiveSecs.greaterThan(sixSecs); // false

// different equality functions:
tc.seconds(60).equals(tc.minutes(1)); // true, we don't handle leap seconds so 60 seconds is 1 minute
tc.days(30).equals(tc.months(1)); // true, 1 month is approx 30 days

tc.seconds(60).identical(tc.seconds(60)); // true: same unit same amount
tc.seconds(60).identical(tc.minutes(1)); // false, needs identical amount and identical unit

tc.days(30).equalsExact(tc.months(1)); // false, we don't know whether a month is 30 days exactly
tc.seconds(60).equalsExact(tc.minutes(1)); // true, we don't handle leap seconds so 60 seconds is 1 minute


// min and max functions
var duration3 = tc.seconds(6);
var duration4 = tc.seconds(3);
var duration5;
duration5 = duration3.max(duration4); // 6 seconds
duration5 = duration3.min(duration4); // 3 seconds

// absolute value
var negativeDuration = tc.seconds(-1);
negativeDuration.abs(); // 1 second
tc.abs(negativeDuration); // 1 second


// getters
// Note Duration has two sets of getters: singular and plural:
// - wholeHours(), minute(), second(), millisecond(): these get the hour part, minute part 0-59, second part 0-59 etc.
//   Note that wholeHours() may be 24 or more.
// - hours(), minutes(), seconds(), milliseconds(): these return the whole duration as fractional number in hours/minutes/etc
var duration6 = tc.hours(1.5); // 1:30:00.000

duration6.wholeHours(); // 1
duration6.minute(); // 30
duration6.second(); // 0
duration6.millisecond(); // 0

duration6.hours(); // 1.5
duration6.minutes(); // 90
duration6.seconds(); // 5400
duration6.milliseconds(); // 5400000

duration6.valueOf(); // same as milliseconds()

// create duration from string
var duration7 = new tc.Duration("00:01"); // one minute
duration7 = new tc.Duration("00:00:00.001"); // one millisecond
duration7 = new tc.Duration("1 day"); // one day
duration7 = new tc.Duration("5 months"); // 5 months

// duration to string (note pluralized)
tc.seconds(1).toString(); // "1 second"
tc.seconds(2).toString(); // "2 seconds"

// duration to time string hhhh:mm:ss.nnn in abbreviated and full forms
tc.seconds(1).toHmsString(); // "00:00:01"
tc.seconds(1).toHmsString(true); // "00:00:01.000"

// duration to ISO 8601 duration string
tc.minutes(1).toIsoString(); // "PT1M"
tc.months(1).toIsoString(); // "P1M"
tc.milliseconds(500).toIsoString(); // "P0.5S"

// create approximate duration from amount of time units
var duration8 = new tc.Duration(4, tc.TimeUnit.Month); // 4 months of 30 days

// create duration from number of milliseconds
var duration9 = new tc.Duration(-500); // -500 milliseconds



```
### TimeZone
A TimeZone object defines a time zone. This can be a fixed UTC offset (e.g. +01:30), the OS time zone (localtime), or an IANA time zone (e.g. Europe/Amsterdam).
For an IANA time zone, you can choose whether Daylight Saving Time should be applied or not. Time zone objects are cached - if you ask for the same zone twice you
may get the very same object back. For this reason, time zone objects are immutable.

```
var z;

// local time
z = tc.local(); // Local time zone as specified by your OS
z = tc.zone("localtime"); // Local time zone as specified by your OS

// UTC
z = tc.utc();  // UTC time zone
z = tc.zone("Z"); // UTC

// Fixed offsets
z = tc.zone(60); // Fixed offset in minutes: UTC+01:00
z = tc.zone("-01:30"); // Fixed offset: UTC-01:30

// IANA time zones
z = tc.zone("Europe/Amsterdam"); // Europe/Amsterdam time zone with DST applied
z = tc.zone("Europe/Amsterdam", false); // Europe/Amsterdam time zone DST not applied

// Note that the Daylight Saving Time flag is irrelevant for these cases
z = tc.zone("+01:00", true); // fixed offset has no DST
z = tc.zone("Etc/UTC", true); // UTC has no DST
z = tc.zone("localtime", true); // OS settings apply, not the DST flag

// Getters
z = tc.zone("Europe/Amsterdam", false);
z.name(); // returns "Europe/Amsterdam";
z.dst(); // The DST flag: returns false
z.hasDst(); // true: returns whether the IANA zone has DST somewhere, not whether this object has DST
z.isUtc(); // true if the zone is equivalent to UTC, e.g. an offset of 0, +00:00, or Etc/GMT

// Calculate time zone offsets
z = tc.zone("Europe/Amsterdam");
z.offsetForUtc(2014, 1, 1, 12, 59, 59, 0); // offset for a time specified in UTC; returns a Duration object
z.offsetForZone(2014, 1, 1, 12, 59, 59, 0); // offset for a time specified in Europe/Amsterdam time; returns a Duration object

```
### TzDatabase
The TzDatabase class is a singleton class containing the time zone database. It has methods to query time zone offsets. Also, it provides some aggregate information like 'what is the maximum Daylight Saving Time shift of all zones in the database'?

```javascript
// TzDatabase is a singleton, get at it using the instance() method
var db = tc.TzDatabase.instance();

// Get a sorted array of all zone names
var zoneNames = db.zoneNames();

var duration = db.maxDst(); // maximum DST offet in the database

// Does the zone have daylight saving time
var bool1 = db.hasDst("Europe/Amsterdam"); // true
var bool2 = db.hasDst("UTC"); // false

// Next daylight saving time change in unix utc milliseconds
var unixUtcMillis = db.nextDstChange("Europe/Amsterdam", 1427590799999); // 1427590800000


```


### DateTime
The DateTime class is a replacement (although not drop-in) for the Date class. It has a date value and a time zone. It has getters for both UTC date and equivalent time zone time.
It is smart enough to represent different dates which map to the same UTC date around DST. You could increment the local time by an hour and be sure
that the local time is incremented by one hour even if the UTC date does not change.

The main differences with the JavaScript Date are:
* DateTime is time zone aware.
* All methods are in singular form: "year()" not "years()" and "hour()" not "hours()". The JavaScript Date class mixes these forms.
* Our day-of-month is called day() not date().
* We count months from 1 to 12 inclusive, not from 0 to 11 as JavaScript does.
* With both JavaScript Date and timezone-js Date, the UTC millisecond value is sometimes off (because it depends on your local time). The DateTime UTC value is always UTC for dates that have a time zone, and it is equal to the "local" date value for naive dates.
* format() is a function that takes an [LDML](http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns) formatting string and returns a formatted string.

```javascript
// a naive timestamp: 2014-01-01 13:59:59
var naiveDate = new tc.DateTime(2014, 1, 1, 13, 59, 59);

// a local time in the time zone of your computer
var localdate = new tc.DateTime("2014-01-01T12:00:00.001", tc.local());

// a fully aware time
var utcDate = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.utc());

// a fully aware time that has Daylight Saving Time
var amsterdamDate = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.zone("Europe/Amsterdam"));

// aware time that does NOT apply Daylight Saving Time
var amsterdamDateNoDst = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.zone("Europe/Amsterdam", false));

// date from ISO 8601 string
var amsterdamDateFromString = new tc.DateTime("2014-01-01T13:59:59.000 Europe/Amsterdam");

// date from other string format
var unitedStatesDate = new tc.DateTime("12/31/2015 23:44:55.123 America/Chicago", "MM/dd/yyyy HH:mm:ss.SSS zzzz");

// date from an Excel datetime number
var dt = tc.DateTime.fromExcel(42005.5430555556); // 2015-01-01T13:02:00

// Excel datetime number from a data
var dt = new tc.DateTime("2015-01-01T13:02:00 Europe/Amsterdam");
var excelAmsterdam = dt.toExcel(); // 42005.5430555556
var excelUtc = dt.toUtcExcel(); // 42005.501388888933333333333333333 (one hour earlier)

// a fully aware time without Daylight Saving Time: a fixed offset from UTC of 2 hours
var fixedOffset;
fixedOffset = new tc.DateTime("2014-01-01T13:59:59.000+02:00");
fixedOffset = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.zone(2));

// Current time
var nd;
nd = tc.now(); // current time in UTC
nd = tc.now(tc.zone("Africa/Algiers")); // current local time in given zone
nd = tc.nowLocal(); // computer-local current time
nd = tc.nowUtc(); // current time in UTC
nd = new tc.DateTime();  // computer-local current time

// To string
console.log(amsterdamDate.toUtcString()); // 2014-01-01T12:59:59.000
console.log(amsterdamDate.toString()); // "2014-01-01T13:59:59.000 Europe/Amsterdam", note that this is not ISO 8601
console.log(amsterdamDate.toIsoString()); // "2014-01-01T13:59:59.000+01:00", note that zone name is removed to make perfect ISO 8601

// Formatting
var formatDate = new tc.DateTime("2014-05-29T13:59:59.000 Europe/Amsterdam");
console.log(formatDate.format("dd/MM/yyyy HH.mm.ss")); // 29/05/2014 13.59.59

// Local Getters
amsterdamDate.year(); // 2014
amsterdamDate.month(); // 1  (note: months are 1-12)
amsterdamDate.day(); // 1
amsterdamDate.hour(); // 13
amsterdamDate.minute(); // 59
amsterdamDate.second(); // 59
amsterdamDate.millisecond(); // 0
amsterdamDate.weekDay(); // tc.WeekDay.Wednesday = 3
amsterdamDate.weekNumber(); // ISO week number 1-53 = 1
amsterdamDate.weekOfMonth(); // 1
amsterdamDate.dayOfYear(); // 0th day of year
amsterdamDate.secondOfDay(); // 50399

// UTC getters
amsterdamDate.utcYear(); // 2014
amsterdamDate.utcMonth(); // 1  (note: months are 1-12)
amsterdamDate.utcDay(); // 1
amsterdamDate.utcHour(); // 12
amsterdamDate.utcMinute(); // 59
amsterdamDate.utcSecond(); // 59
amsterdamDate.utcMillisecond(); // 0
amsterdamDate.utcWeekDay(); // tc.WeekDay.Wednesday = 3
amsterdamDate.utcWeekNumber(); // ISO week number 1-53 = 1
amsterdamDate.utcWeekOfMonth(); // 1
amsterdamDate.utcDayOfYear(); // 0th day of year
amsterdamDate.utcSecondOfDay(); // 46799

// Unix millisecond timestamp getter
amsterdamDate.unixUtcMillis(); // milliseconds of UTC date since 1970-01-01
amsterdamDate.valueOf(); // same

// Zone getter
amsterdamDate.zone(); // tc.TimeZone.zone("Europe/Amsterdam");

// Zone abbreviation getter (note that zone abbreviation depends on the date,
// many zones have a different abbreviation during summer time)
amsterdamDate.zoneAbbreviation(); // "CET"

// Time zone conversion
var africaDoualaDate = amsterdamDate.toZone("Africa/Douala");

// Protection against creating aware dates from naive ones
var error = naiveDate.toZone("Europe/Amsterdam"); // ERROR! THROWS

// Other way around is ok
var ok = amsterdamDate.toZone(null); // returns naive date

// In-place time zone conversion
var d = new tc.DateTime("2014-01-01T13:59:59.000 Europe/Amsterdam");
d.convert(tc.zone("UTC")); // 2014-01-01T12:59:59.000 UTC

// Reinterpreting as different time zone
d = new tc.DateTime("2014-01-01T13:59:59.000");
var reinterpreted = d.withZone(tc.zone("UTC")); // 2014-01-01T13:59:59.000 UTC  (note: different moment in time!)

// Cloning
var newCopy = amsterdamDate.clone();

// Truncate a DateTime to a date @ 00:00:00.000
var newDateTime = d.startOfDay();

// Check if a date exists

// leap years (2012 is a leap year)
tc.DateTime.exists(2012, 2, 29); // true
tc.DateTime.exists(2013, 2, 29); // false

// # days in month (April has 30 days)
tc.DateTime.exists(2012, 4, 30); // true
tc.DateTime.exists(2012, 4, 31); // false

// Daylight saving time skips hours
tc.DateTime.exists(2015, 3, 29, 2, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // false
tc.DateTime.exists(2015, 3, 29, 1, 59, 59, 999, TimeZone.zone("Europe/Amsterdam")); // true
tc.DateTime.exists(2015, 3, 29, 3, 0, 0, 0, TimeZone.zone("Europe/Amsterdam")); // true

// Pre-1970 dates: you can allow or disallow them with the last boolean parameter
// as the IANA time zone database is not reliable prior to 1970
tc.DateTime.exists(1969, 12, 31, 23, 59, 59, 999, null, false); // false
tc.DateTime.exists(1969, 12, 31, 23, 59, 59, 999, null, true); // true
tc.DateTime.exists(1969, 12, 31, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam"), false); // false
tc.DateTime.exists(1969, 12, 31, 23, 59, 59, 999, TimeZone.zone("Europe/Amsterdam"), true); // true

```

### Date Arithmetic

The DateTime class allows date arithmetic. The diff() method returns the difference between two dates as a Duration. Next to that, you can use add() and addLocal() to add either a duration or a specific unit of time. The latter case accounts for DST: addLocal(1, TimeUnit.Hour) ensures that the local hour() field increments by one, even if that means UTC time does not change or changes 2 hours due to DST.


```javascript
var utcDate = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.utc());
var amsterdamDate = new tc.DateTime(2014, 1, 1, 13, 59, 59, 0, tc.zone("Europe/Amsterdam"));

// Difference between dates (may be in different zones).
// Returns a Duration
var difference = utcDate.diff(amsterdamDate);
console.log(difference.hours()); // 1

// Add an hour to a time. It may be that
// local time does not increase because of a DST change.
var added;
added = localdate.add(tc.hours(1));

// Add a LOCAL hour to a time (ensure the hour() field increments by 1)
// Note this DOES account for DST
added = localdate.addLocal(tc.hours(1));

// Add a UTC hour to a time. (ensure the utcHour() increments by 1,
// due to DST changes the local hour might not change or change 2 hours)
added = localdate.add(1, tc.TimeUnit.Hour);

// Equality operators
var d1 = new tc.DateTime(2014, 31, 12, 13, 55, 45, 999, tc.zone("UTC"));
var d2 = new tc.DateTime(2014, 31, 12, 13, 55, 45, 999, tc.zone("GMT"));
d1.equals(d2); // true - equivalent time zones
d1.identical(d2); // false - not exactly the same time zones

// Comparison operators
var d3 = new tc.DateTime(2014, 31, 12, 13, 55, 45, 999, tc.zone("UTC"));
var d4 = new tc.DateTime(2014, 31, 12, 13, 55, 45, 999, tc.zone("Europe/Amsterdam"));

// normal < and > work
d3 < d4; // true
d3 > d4; // false

d3.greaterEqual(d4); // false, Amsterdam is ahead of UTC
d3.lessThan(d4); // true
d4.lessEqual(d3); // false, Amsterdam is ahead of UTC
d4.greaterThan(d3); // true

// min and max functions
var d5 = new tc.DateTime("2014-10-17");
var d6 = new tc.DateTime("2014-10-20");
d5.min(d6); // returns a clone of d5
d5.max(d6); // returns a clone of d6


```

### Periods

We had a need for regularly scheduling a task. However if you think about it, what does it mean to run something every 12 hours? Does that mean it happens at the same local time every day? Or does it happen at regular intervals, shifting with DST?  The former means that the intervals are not always 12 hours. The latter means that it doesn't occur at the same time always.
We needed to be able to specify both.

```javascript
// Timezone with DST specified (Europe/Amsterdam)
// Last argument is "RegularLocalTime"
// Repeating daily period at 8:05 local Amsterdam time (moves with Daylight Saving Time so it is always at 8:05 locally)
var period = new tc.Period(new tc.DateTime("2014-01-01T08:05:00 Europe/Amsterdam"), tc.days(1), tc.PeriodDst.RegularLocalTime);

// Timezone with DST specified (Europe/Amsterdam)
// Last argument is "RegularIntervals"
// Repeating daily period at 8:05 OR 9:05 local Amsterdam time (which is always 7:05 UTC)
var period = new tc.Period(new tc.DateTime("2014-01-01T08:05:00 Europe/Amsterdam"), tc.days(1), tc.PeriodDst.RegularIntervals);

// Timezone without DST specified (+01:00)
// Repeating daily period at 7:05 UTC
var period2 = new tc.Period(new tc.DateTime("2014-01-01T08:05:00+01:00"), tc.days(1), tc.PeriodDst.RegularLocalTime);

// You can calculate the first occurrence after a given date (in any time zone)
// "2014-05-01T08:05:00.000 Europe/Amsterdam"
var occurrence = period.findFirst(new tc.DateTime("2014-04-30T12:00:00 Europe/Amsterdam"));

// findNext works much faster, assuming that its parameter is on a period boundary
// "2014-05-02T08:05:00.000 Europe/Amsterdam"
var occurrence2 = period.findNext(occurrence);

// findPrev also assumes that the given time is on a boundary
var occurrence1 = period.findPrev(occurrence);

// isBoundary checks whether the given DateTime is on a period boundary
period.isBoundary(occurrence); // true

// Equality checking
var p = new tc.Period(new tc.DateTime("2014-01-01T00:00:00"), tc.hours(1), tc.PeriodDst.RegularIntervals);
var q = new tc.Period(new tc.DateTime("2014-01-01T00:00:00"), tc.minutes(60), tc.PeriodDst.RegularIntervals);
p.equals(q); // true, same results
p.identical(q); // false, not same constructor arguments

var r = new tc.Period(new tc.DateTime("2014-01-01T00:00:00"), tc.days(30), tc.PeriodDst.RegularIntervals);
var s = new tc.Period(new tc.DateTime("2014-01-01T00:00:00"), tc.months(1), tc.PeriodDst.RegularIntervals);
p.equals(q); // false, not same results
p.identical(q); // false, not same constructor arguments

```

### Internationalization

You can format and parse date times using LDML format strings. You can also change the used month, weekday and quarter names.
Unfortunately, parsing month, weekday and quarter names is not yet possible. Please submit an issue if you need it.

```
// parsing and formatting
var dt = new tc.DateTime("2015-03-01", "yyyy-MM-dd");
dt.format("dd-MMMM-yyyy"); // "31-March-2015"

// formatting with custom month names
dt.format("dd-MMMM-yyyy", {
	longMonthNames: ["Januari", "Februari", "Maart", "April", "Mei", .......]
}); // "31-Maart-2015"

// default month names
console.log(tc.DEFAULT_FORMAT_OPTIONS.longMonthNames[1]); // "January"

// all possible format options for English/US:
var myFormatOptions = {
	quarterLetter: "Q",
	quarterWord: "quarter",
	quarterAbbreviations: ["1st", "2nd", "3rd", "4th"],
	longMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	shortMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	monthLetters: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
	longWeekdayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	shortWeekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	weekdayTwoLetters: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	weekdayLetters: ["S", "M", "T", "W", "T", "F", "S"]
}

```

## On a web page
We spent some effort making timezonecomplete usable in the browser, by packaging it in a [UMD](https://github.com/umdjs/umd). This way, it can be used for example in plain html/javascript:

```html
<html>
<head><title>Timezonecomplete test</title></head>
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

### How do I convert a DateTime object to a JavaScript Date object?
Use new Date(myDateTime.unixUtcMillis()).

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
var datetime = new tc.DateTime(jsDate1, tc.DateFunctions.Get, tc.zone("America/Boise"));

// now the jsDate.getUTCYear(), jsDate.getUTCMonth() etc are assumed to be in America/Boise zone.
var datetime2 = new tc.DateTime(jsDate2, tc.DateFunctions.GetUTC, tc.zone("America/Boise"));

```

### Why does the number returned by weekNumber() not correspond to my calendar?
Different countries have different week number algoritms. We adhere to the ISO 8601 standard, where the first week starts on a Monday and is defined as the week having January 4th in it.
If you need different week numbers, please submit an issue or a pull request.

### Does timezonecomplete handle leap seconds?

Currently not. This is because most platforms don't, especially when converting from and to unix timestamps. If we were to introduce leap seconds, you would have to keep very close track of which of your unix timestamps are adjusted for leap seconds and which aren't. We do plan to add support in some form though.

## Current TZ database version:

The version of the included IANA time zone database is 2016a.

## Changelog

### 2.0.6 (2016-02-27)
* Remove dependency on Node.JS modules for better browser support.

### 2.0.5 (2016-02-26)
* fix for Travis CI build

### 2.0.4 (2016-02-26)
* fix for package.json typings field

### 2.0.1-2.0.3 (2016-02-25)
* adjust .npmignore to avoid publishing stuff that doesn't need publishing
* Improve README.md

### 2.0.0 (2016-02-25)
* Browser bundle with UMD wrapper and minified version
* For TypeScript users: uses ES6-style imports
* For TypeScript users: uses 'typings' field in package.json, so you can/must drop your reference to timezonecomplete.d.ts and ensure that you use 'node' module resolution for tsc.
* Added karma tests to ensure timezonecomplete works well across different browsers

### 1.27.2 (2016-02-02)
* Bugfix for zones that have observed DST but no longer do e.g. Asia/Tokyo zone (issue #22)

### 1.27.1 (2016-01-29)
* Upgrade timezone database to 2016a

### 1.27.0 (2016-01-20)
* Add validation function tc.parseable() for date/time strings

### 1.26.0 (2016-01-20)
* Add possibility to change month, weekday, quarter names

### 1.25.1 (2016-01-13)
* Improved documentation for DateTime.add()/sub()/addLocal()/subLocal()
* Removed console.log() statement
* Bugfix: DateTime#format() would throw if a zone was specified in the format string but no zone was present
* DateTime#format() now trims the string before returning it.

### 1.25.0 (2015-12-03)
* Removed private DateTime member _unixUtcMillisCache to facilitate simple comparison of date objects by their members. There is now a global cache of unix milliseconds.

### 1.24.1 (2015-11-27)
* Bugfix parsing times with zeroes.

### 1.24.0 (2015-11-05)
* Add new DateTime constructor that accepts a date string and a format string to parse dates in a given format
* Add new static method DateTime.parse() that does the same.

### 1.23.0 (2015-10-02)
* Add a static method DateTime.exists() to see whether a given date exists in its time zone

### 1.22.2 (2015-10-02)
* Upgrade TZ database to 2015g

### 1.22.1 (2015-09-21)
* Bugfix: dev-dependencies were listed as dependencies

### 1.22.0 (2015-09-16)
* Add a method to TzDatabase to get a list of all zone names

### 1.21.1 (2015-08-12)
* Upgrade TZ database to 2015f

### 1.21.0 (2015-07-21)
* Add a method to TzDatabase to get the next DST transition moment after a given date

### 1.20.0 (2015-07-20)
* Make a TzDatabase class available with general info on all time zones

### 1.19.4 (2015-06-15)
* Upgrade TZ database to 2015e

### 1.19.3 (2015-04-28)
* Upgrade TZ database to 2015d

### 1.19.2 (2015-04-14)
* Upgrade TZ database to 2015c

### 1.19.1 (2015-04-09)
* Minor adjustment to tc.utc() so that tc.utc().identical(tc.zone("UTC")) === true  (they had a different DST flag)

### 1.19.0 (2015-04-02)
* Made Period cloneable by adding a clone() method

### 1.18.0 (2015-04-01)
* Add DateTime#startOfMonth() which returns the date truncated to the first day of the month at 00:00:00
* Add DateTime#startOfYear() which returns the date truncated to the first day of the year at 00:00:00
* Add Period#findPrev() analogous to findNext()
* Allow count parameter <= 0 in Period#findNext() / Period#findPrev() i.e. findNext(dt, -1) === findPrev(dt, 1)

### 1.17.0 (2015-03-30)
* Add DateTime#toExcel() and DateTime#toUtcExcel() functions to convert a DateTime to a Microsoft Excel date/time number.

### 1.16.1 (2015-03-26)
* Make DateTime constructor robust with respect to fractional numbers (it rounds to nearest millisecond)
* Make DateTime#add() / addLocal() / sub() / subLocal() robust to fractional amounts (works for millis through weeks, throws for months/years)

### 1.16.0 (2015-03-26)
* Add DateTime#withZone() method to add/replace the time zone of an existing datetime

### 1.15.1 (2015-03-23)
* Upgrade TZ database to 2015b

### 1.15.0
 * Add TimeUnit.Millisecond enum value and make it work everywhere
 * Duration class now remembers its unit and it can be used to store Days/Months/Years precisely now too
 * Add members Duration.amount(), Duration.unit() to get at stored value
 * Add members Duration.identical(), Duration.equalsExact() next to already-existing Duration.equals()
 * Add members Duration.wholeYears(), Duration.year(), Duration.months(), Duration.month(), Duration.days(), Duration.day() analogous to existing functions for hours, minutes, seconds etc
 * Add functions for converting time units from/to string like "1 day" or "2 months"
 * Add member Duration.toString() for converting duration to "2 months"-type string
 * Add member Duration.toIsoString() for an ISO 8601 duration string e.g. "P2H3.5S" for 2 hours and 3.5 seconds
 * Period now accepts Duration objects where it accepted an amount and a unit e.g. in its constructor
 * DateTime now accepts Duration objects where it accepted an amount and a unit e.g. in addLocal() and subLocal()
 * Add static functions for creating durations for higher units i.e. tc.months(), tc.years(), tc.days()
 * BREAKING CHANGE: Moved function for converting duration to "hhhh:mm:ss.nnn"-type string from Duration.toString() to Duration.toHmsString()
 * BREAKING CHANGE: for approximate calculations, a year is now seen as 360 days iso 365 (because a month was already seen as 30 days)

### 1.14.0 (2015-03-12)
* Add Duration.abs() function and global abs() function

### 1.13.2 (2015-03-11)
* Allow "without DST" suffix in time zone name.

### 1.13.1 (2015-03-10)
* Check time zone name in TimeZone constructor.

### 1.13.0
* Add static DateTime.fromExcel() function to convert a Microsoft Excel / ODF timestamp number to a datetime
  https://stackoverflow.com/questions/981655/how-to-represent-a-datetime-in-excel
  https://en.wikipedia.org/wiki/Leap_year_bug

### 1.12.1
* Upgrade TZ database to 2015a

### 1.12.0 (2015-01-16)
* Add Period#equals() which checks whether two periods have the same net effect.
* Add Period#identical() which checks whether two periods were constructed in the same way.
* Add TimeZone#identical() which checks whether two time zones were constructed the same way.
* Adjust DateTime#identical() to no longer allow equal-but-not-identical time zone.
* Made last Period constructor argument optional (default: regular local time)

### 1.11.2 (2015-01-09)
* Remove dependency on source-map-support outside of tests.

### 1.11.1 (2015-01-08)
* Bugfix in DateTime#sub() and DateTime#add()

### 1.11.0 (2014-12-09)
* Add function startOfDay() to truncate a DateTime down to a date (00:00:00.000 on the same day).

### 1.10.0 (2014-11-25)
* Added global functions for most static functions (the old ones will remain):
  * tc.now() for tc.DateTime.now()
  * tc.nowLocal() for tc.DateTime.nowLocal()
  * tc.nowUtc() for tc.DateTime.nowUtc()
  * tc.hours() for tc.Duration.hours()
  * tc.minutes() for tc.Duration.minutes()
  * tc.seconds() for tc.Duration.seconds()
  * tc.milliseconds() for tc.Duration.milliseconds()
  * tc.local() for tc.TimeZone.local()
  * tc.utc() for tc.TimeZone.utc()
  * tc.zone() for tc.TimeZone.zone()
* The tc.now() or tc.DateTime.now() method now has its zone argument optional, default value is UTC.
* You can now choose whether timezonecomplete applies Daylight Saving Time for an IANA time zone: the tc.zone() and tc.TimeZone.zone() methods now accept an extra Boolean parameter that indicates whether DST should be applied. For backward compatibility the default value is true.

```
// old code (still works):
var d  = tc.Duration.seconds(20);
var dt = tc.DateTime.now();

// new code:
var d  = tc.seconds(20);
var dt = tc.now();

// Europe/Amsterdam time with DST
var dt = new DateTime(2014, 1, 1, 23, 59, 59, 999, tc.zone("Europe/Amsterdam"));

// Europe/Amsterdam time WITHOUT DST
var dt = new DateTime(2014, 1, 1, 23, 59, 59, 999, tc.zone("Europe/Amsterdam", false));
```

### 1.9.1 (2014-11-11)
* Upgrade time zone database to 2014j

### 1.9.0 (2014-10-29)
* Add function timeUnitToMilliseconds()
* Add Duration constructor for an amount of time units.
* Documented missing Duration constructors.

### 1.8.3 (2014-10-24)
* Bugfix in unixUtxMillis() for dates created with the DateTime(number) constructor.

### 1.8.2 (2014-10-24)
* Document that < and > work out of the box on Duration / DateTime.
* Fix in README.md for DateTime.format()
* Performance optimization for DateTime.valueOf() and DateTime.unixUtcMillis() and < and > on DateTimes.

### 1.8.1 (2014-10-22)
* Upgrade time zone database to 2014i

### 1.8.0 (2014-10-17)
* Add global min() and max() functions for DateTime and Duration
* Add DateTime.min() and DateTime.max() function

### 1.7.0 (2014-10-06)
* Add Duration.greaterEqual() and Duration.lessEqual()
* Bugfix in DateTime-from-string constructor: leading/trailing whitespace led to date not getting parsed.
* Bugfix in Duration-from-string constructor: leading/trailing whitespace led to duration not getting parsed.

### 1.6.0 (2014-10-02)
* Add Period.isBoundary() method for checking that a date is on a period boundary.

### 1.5.4 (2014-09-29)
* Upgrade time zone database to 2014h
* README.md typos

### 1.5.3 (2014-09-09)
* Upgrade time zone database to 2014g

### 1.5.2 (2014-08-27)
* Upgrade time zone database to 2014f
* Upgrade typedoc documentation generator to 0.1.1

### 1.5.1 (2014-08-20)
* Typo in function name: secondPfDay() -> secondOfDay()

### 1.5.0 (2014-08-20)
* Add format() function to DateTime to convert a DateTime to a string with a specified format.
* Add valueOf() method to DateTime and Duration
* Add dayOfYear() and utcDayOfYear() to DateTime returning the n-th day of the year, starting at 0
* Add weekNumber() utility function (ISO week number)
* Add weekNumber() and utcWeekNumber() methods to DateTime
* Add weekOfMonth() utility function (ISO week number)
* Add weekOfMonth() and utcWeekOfMonth() methods to DateTime
* Add secondOfDay() utility function (ISO week number)
* Add secondOfDay() and utcSecondOfDay() methods to DateTime
* Add abbreviationForUtc() to TimeZone
* Add zoneAbbreviation() to DateTime to get time zone abbreviation at the specified datetime.

### 1.4.6 (2014-08-15)
* Bugfix TypeScript .d.ts file

### 1.4.5 (2014-08-15)
* Removed Javascript Date class as much as possible because it behaves differently across platforms.
* Performance improvements (caching in TzDatabase class)
* Corrected HTML example in README.md now that timezone-js is gone
* Bugfix in unix timestamp -> datetime conversion for dates on jan 1st prior to 1970

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

