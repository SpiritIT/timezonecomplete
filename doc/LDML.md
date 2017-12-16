# Formatting and Parsing

The functions for formatting and parsing dates use LDML format strings, see http://unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns

## TL;DR

| Pattern | Example |
|---|---|
| yyyy-MM-dd HH:mm:ss.SSS | 2017-12-31 23:59:14.999 |
| yyyy-MM-dd HH:mm:ss.SSS XXX | 2017-12-31 23:59:14.999 -08:00 |
| yyyy-MM-dd HH:mm:ss.SSS vv | 2017-12-31 23:59:14.999 Europe/Amsterdam |
| M/d/yyyy hh:mm:ss a | 1/31/2017 12:00:00 AM |

## Caveats

* 'MM' is months, 'mm' is minutes
* 'HH' is 24-hour, 'hh' is 12-hour. If you use AM/PM be sure to use 'hh' and otherwise 'HH'.
* 'SSS' is millseconds, other patterns don't currently work

### Internationalization

You can change the names used for months and weekdays etc. You can do so globally (by setting `DEFAULT_FORMAT_OPTIONS`), or locally
(by passing an options object to the `format` and `parse` functions).

```javascript
// parsing and formatting
var dt = new tc.DateTime("2015-03-01", "yyyy-MM-dd");
dt.format("dd-MMMM-yyyy"); // "31-March-2015"

// formatting with custom month names
dt.format("dd-MMMM-yyyy", { longMonthNames: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", ...]}); // "31-Maart-2015"

// default month names
console.log(tc.DEFAULT_FORMAT_OPTIONS.longMonthNames[1]); // "January"

// all possible format options:
var myFormatOptions = {
	eraNarrow: ["A", "B"],
	eraWide: ["Anno Domini", "Before Christ"],
	eraAbbreviated: ["AD", "BC"],
	quarterLetter: "Q",
	quarterWord: "quarter",
	quarterAbbreviations: ["1st", "2nd", "3rd", "4th"],
	longMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	shortMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	monthLetters: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
	longWeekdayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	shortWeekdayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	weekdayTwoLetters: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	weekdayLetters: ["S", "M", "T", "W", "T", "F", "S"],
	dayPeriodAbbreviated: { am: "AM", pm: "PM", noon: "noon", midnight: "mid." },
	dayPeriodWide: { am: "AM", pm: "PM", noon: "noon", midnight: "midnight" },
	dayPeriodNarrow: { am: "A", pm: "P", noon: "noon", midnight: "md" }
}

```

## Supported patterns

The table below shows the format patterns and whether timezonecomplete supports them:

| Type | Pattern | Example | Format support | Parse support | Description |
|---|---|---|---|---|---|
| era | G..GGG | AD | yes | yes | |
|  | GGGG | Anno Domini | yes | yes | |
|  | GGGGG | A | yes | yes | |
| year | y | 2, 20, 201, 2017, 20173 | yes | yes | Calendar year (numeric). In most cases the length of the y field specifies the minimum number of digits to display, zero-padded as necessary; more digits will be displayed if needed to show the full year. However, “yy” requests just the two low-order digits of the year, zero-padded as necessary. For most use cases, “y” or “yy” should be adequate. |
|  | yy | 02, 20, 01, 17, 73 | yes | yes |  |
|  | yyy | 002, 020, 201, 2017, 20173 | yes | yes | |
|  | yyyy | 0002, 0020, 0201, 2017, 20173 | yes | yes | |
|  | yyyyy+ | ... | yes | yes | |
|  | Y+ | | NO | NO | Year in “Week of Year” based calendars in which the year transition occurs on a week boundary |
|  | u+ | 4601 | NO | NO | Extended year (numeric) |
|  | U+ | | NO | NO | Cyclic year name |
|  | r+ | 2017 | yes | yes | Related Gregorian year (numeric) |
| quarter | Q | 2 | yes | yes | Quarter name/number. Parsing a quarter changes the date to the beginning of that quarter |
|  | QQ | 02 | yes | yes | |
|  | QQQ | Q2 | yes | yes | |
|  | QQQQ | 2nd quarter | yes | yes | |
|  | QQQQQ | 2 | yes | yes | |
|  | q | 2 | NO | NO | Stand-alone quarter name/number (changes the date to the given quarter) |
|  | qq | 02 | NO | NO | |
|  | qqq | Q2 | NO | NO | |
|  | qqqq | 2nd quarter | NO | NO | |
|  | qqqqq | 2 | NO | NO | |
| month | M | 9, 12 | yes | yes | Month number/name |
|  | MM | 09, 12 | yes | yes | |
|  | MMM | Sep | yes | NO | |
|  | MMMM | September | yes | NO | |
|  | MMMMM | S |yes  | NO | |
|  | L | 9, 12 | yes | NO | Stand-alone month number/name |
|  | LL | 09, 12 | yes | NO | |
|  | LLL | Sep | yes | NO | |
|  | LLLL | September | yes | NO | |
|  | LLLLL | S | yes | NO | |
| week | w | 8, 27 | yes | NO | Week of Year (numeric) |
|  | ww | 08, 27 | yes | NO | |
|  | W | 3 | yes | NO | Week of Month (numeric) |
| day | d | 1 | yes | yes | Day of month (numeric) |
|  | dd | 01 | yes | yes | |
|  | D..DDD | 345 | yes | NO | Day of year (numeric) |
|  | F | 2 | NO | NO | Day of Week in Month (numeric) |
|  | g+ | 2451334 | NO | NO | Modified Julian day (numeric) |
| week day | E..EEE | Tue | yes | NO | Day of week name |
|  | EEEE | Tuesday | yes | NO | |
|  | EEEEE | T | yes | NO | |
|  | EEEEEE | Tu | yes | NO | |
|  | e | 2 | yes | NO | Local day of week number/name |
|  | ee | 02 | yes | NO | |
|  | eee | Tue | yes | NO | |
|  | eeee | Tuesday | yes | NO | |
|  | eeeee | T | yes | NO | |
|  | eeeeee | Tu | yes | NO | |
|  | c..cc | 2 | yes | NO | Stand-alone local day of week number/name |
|  | ccc | Tue | yes | NO | |
|  | cccc | Tuesday | yes | NO | |
|  | ccccc | T | yes | NO | |
|  | cccccc | Tu | yes | NO | |
| day period | a..aaa | AM, PM | yes | yes | AM, PM. Tip: use 'hh' and not 'HH' when specifying 'a+' or 'b+' |
|  | aaaa | AM, PM | yes | yes | |
|  | aaaaa | A, P | yes | yes | |
|  | b..bbb | AM, PM, noon, mid. | yes | yes | AM, PM, noon, midnight |
|  | bbbb | AM, PM, noon, midnight | yes | yes | |
|  | bbbbb | A, P, noon, mn | yes | yes | |
|  | B..BBB | at night | NO | NO | Flexible day periods (abbreviated) |
|  | BBBB | at night | NO | NO | Flexible day periods (wide) |
|  | BBBBB | at night | NO | NO | Flexible day periods (narrow) |
| hour | h | 2, 12 | yes | yes | hour of day, 1-12 |
|  | hh | 02, 12 | yes | yes | |
|  | H | 0, 23 | yes | yes | hour of day, 0-23 |
|  | HH | 00, 23 | yes | yes | |
|  | K | 0, 11 | yes | NO | hour of day, 0-11 |
|  | KK | 00, 11 | yes | NO | |
|  | k | 1, 24 | yes | NO | hour of day, 1-24 |
|  | kk | 01, 24 | yes | NO | |
|  | j+ |  | NO | NO | Reserved, should not be used |
|  | J+ |  | NO | NO | Reserved, should not be used |
|  | C+ |  | NO | NO | Reserved, should not be used |
| minute | m | 8, 59 | yes | yes | Minute |
|  | mm | 08, 59 | yes | yes | |
| second | s | 8, 12 | yes | yes | Second |
|  | ss | 08, 12 | yes | yes | |
|  | S+ | 3456 | yes | ONLY 'SSS' | Fractional Second (numeric). Truncates, like other numeric time fields, but in this case to the number of digits specified by the field length. (Example shows display using pattern SSSS for seconds value 12.34567). Use ss.SSS for displaying seconds.milliseconds |
|  | A+ | 69540000 | yes | NO | Milliseconds in day (numeric) |
| zone | z..zzz | PDT | yes | NO | The short specific non-location format |
|  | zzzz | Pacific Daylight Time | NO | NO | The long specific non-location format.  |
|  | Z..ZZZ | -0800 | yes | yes | The ISO8601 basic format with hours, minutes and optional seconds fields |
|  | ZZZZ | GMT-08:00 | yes | NO | The long localized GMT format. This is equivalent to the "OOOO" specifier. |
|  | ZZZZZ | Z, -08:00, -07:52:13 | yes | yes | The ISO8601 extended format with hours, minutes and optional seconds fields. The ISO8601 UTC indicator "Z" is used when local time offset is 0. |
|  | O | GMT-8 | yes | NO | The short localized GMT format. |
|  | OOOO | GMT-08:00 | yes | NO | The long localized GMT format |
|  | v | PT | NO | NO | The short generic non-location format. |
|  | vvvv | Pacific Time | NO | NO | The long generic non-location format. |
|  | V | uslax | NO | NO | deprecated |
|  | VV | America/Los_Angeles | yes | yes | The long time zone ID. |
|  | VVV | Los Angeles | NO | NO | The exemplar city (location) for the time zone |
|  | VVVV | Los Angeles Time | NO | NO | The generic location format.  |
|  | X | -08, +0530, Z | yes | yes | The same as x, plus "Z". |
|  | XX | -0800, Z | yes | yes | The same as xx, plus "Z". |
|  | XXX | -08:00, Z | yes | yes | The same as xxx, plus "Z". |
|  | XXXX | -0800, -075258, Z | NO | yes | The same as xxxx, plus "Z". |
|  | XXXXX | -0800, -07:52:58, Z | NO | yes | The same as xxxxx, plus "Z". |
|  | x | -08, +0530 | yes | yes | The ISO8601 basic format with hours field and optional minutes field. |
|  | xx | -0800 | yes | yes | The ISO8601 basic format with hours and minutes fields. |
|  | xxx | -08:00 | yes | yes | The ISO8601 extended format with hours and minutes fields. |
|  | xxxx | -0800, -075258 | NO | yes | The ISO8601 basic format with hours, minutes and optional seconds fields. |
|  | xxxxx | -0800, -07:52:58 | NO | yes | The ISO8601 extended format with hours, minutes and optional seconds fields |
