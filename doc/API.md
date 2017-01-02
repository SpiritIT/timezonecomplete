
# API description


## By Example

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
tc.years(1).divide(tc.months(2)); // 1 year divided by 2 months = 6

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

```javascript
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

// Optional, to use your own subset of the IANA time zone data
tc.TzDatabase.init(customTimeZoneData);

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

// Get the total offset from UTC including DST
new tc.DateTime("2016-03-31 Europe/Amsterdam").offsetDuration(); // 2 hours

// Get the standard offset from UTC excluding DST
new tc.DateTime("2016-03-31 Europe/Amsterdam").standardOffsetDuration(); // 1 hour

// Time zone conversion
var africaDoualaDate = amsterdamDate.toZone("Africa/Douala");

// Protection against creating aware dates from naive ones
var error = naiveDate.toZone("Europe/Amsterdam"); // ERROR! THROWS

// Other way around is ok
var ok = amsterdamDate.toZone(undefined); // returns naive date

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
tc.DateTime.exists(1969, 12, 31, 23, 59, 59, 999, undefined, false); // false
tc.DateTime.exists(1969, 12, 31, 23, 59, 59, 999, undefined, true); // true
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

// Analogous to findFirst, we have findLast:
// "2014-04-30T08:05:00.000 Europe/Amsterdam"
var occurrence = period.findLast(new tc.DateTime("2014-04-30T12:00:00 Europe/Amsterdam"));

// Analogous to findNext, we have findPrev (much faster than findLast):
// findPrev also assumes that the given time is on a boundary
var occurrence1 = period.findPrev(occurrence);

// findPrev() and findNext() take an optional count parameter:
// "2014-05-03T08:05:00.000 Europe/Amsterdam"
var occurrence3 = period.findNext(occurrence, 3);

// isBoundary checks whether the given DateTime is on a period boundary
period.isBoundary(occurrence); // true

// Equality checking
var p = new tc.Period(new tc.DateTime("2014-01-01T00:00:00"), tc.hours(1), tc.PeriodDst.RegularIntervals);
var q = new tc.Period(new tc.DateTime("2015-02-02T00:00:00"), tc.minutes(60), tc.PeriodDst.RegularIntervals);
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
