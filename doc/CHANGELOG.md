
# Changelog

## 5.4.4 (2017-01-23)

* Add more parameter checking to DateTime constructor (solves issue #32)

## 5.4.3 (2017-01-03)

* Fix compatibility issue with TypeScript 2.0

## 5.4.2 (2017-01-02)

* Upgrade TypeScript to 2.1.4 and enable strict null checks and other compile-time checks
* DateTime.zone() now returns undefined rather than null for an unaware date

## 5.4.1 (2016-11-14)

* Bugfix in Duration#equalsExact(): identical durations of 1 day would not be seen as equal
* Bugfix in Period#equals(): identical periods of 1 day would not be seen as equal; equal regular periods specified in different zones would not be seen as equal

## 5.4.0 (2016-11-07)

The tzdata module is not getting downloaded much and timezonecomplete is. This means that nobody understands that they have to install the tzdata manually. Therefore we make it automatic, assuming that for server use it doesn't matter to load all time zone data.

* Add the tzdata module as a proper dependency. For Node.JS applications, this will automatically add all time zones without initialisation. You can remove time zones by explicitly initializing the TzDatabase using TzDatabase.init().

## 5.3.0 (2016-11-07)

* Add DateTime#standardOffsetDuration() method that returns the offset excluding DST. (Issue #30)
* Add DateTime#offsetDuration() method that returns a Duration instead of a number. (Issue #30)
* Bugfix: the DateTime constructor would throw when given a time zone name with "without DST" appended. (Issue #30)

## 5.2.0 (2016-11-06)

* Add Duration#divide() method that takes another Duration and outputs a unitless number.

## 5.1.2 (2016-10-28)

* Inline the sourcemaps as requested in issue #28

## 5.1.1 (2016-10-27)

* Attempt to fix warnings about the 'require' function that webpack users experience due to automatic loading of tzdata NPM modules.
* Inline the sourcemaps as requested in issue #28

## 5.1.0 (2016-10-17)

* Simplify using timezonecomplete and tzdata with browserify
** Allow to pass arrays to TzDatabase.init()
** Describe way-of-work in README.md

## 5.0.1 (2016-10-17)

* Backward compatibility fix: make year/month/day/... parameters optional in TimeZone#abbreviationForUtc(), TimeZone#offsetForZone() and TimeZone#offsetForUtc()

## 5.0.0 (2016-10-16)

* Separate the tz data into a separate set of NPM modules, allowing to install only the time zones needed.

See [UPGRADING.md](./UPGRADING.md) for instructions on how to migrate from earlier versions.

### 4.0.1 (2016-10-16)

* Fix for stand-alone use of timezonecomplete browser bundles
* Add stand-alone use example

### 4.0.0 (2016-10-15)

* Performance improvements, with a few minor breaking changes as a result

### 3.0.6 (2016-09-29)

* Upgrade TZ database to 2016g
* Upgrade dev-dependencies to latest versions

### 3.0.5 (2016-07-07)

* Upgrade TZ database to 2016f

### 3.0.4 (2016-06-15)

* Upgrade TZ database to 2016e

### 3.0.3 (2016-04-18)

* Upgrade TZ database to 2016d

### 3.0.2 (2016-03-24)

* Upgrade TZ database to 2016c

### 3.0.1 (2016-03-15)

* Upgrade TZ database to 2016b

### 3.0.0 (2016-03-14)

A small Period overhaul:
* Add Period#findLast() analogous to Period#findFirst().
* Periods are now symmetric around the start date, i.e. the start date is no longer considered the point only after which the periods run. So now, calling e.g. findPrev() on the start date returns one period before the start date rather than null.
** Period#findFirst() no longer returns the start date when called with a date multiple periods before the start date, but rather returns the first boundary date after the given date.
** Period#findPrev() no longer returns null when called with the start date or less, but rather returns the greatest boundary date before the given date.
** Period#start() is now deprecated in favor of Period#reference() - after all, the 'start' date is not a starting point anymore but a reference point only.
* The Period#equals() method now considers periods equal also if their reference dates (start dates) are not equal but are boundary dates of each other.

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

* Rogier Schouten
* Daan Wissing
* Peter Kooijmans

