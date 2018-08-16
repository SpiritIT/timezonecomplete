# Formatting and Parsing

The functions for formatting and parsing dates use LDML format strings, see http://unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns

## TL;DR

| Pattern | Example |
|---|---|
| yyyy-MM-dd HH:mm:ss.SSS | 2017-12-31 23:59:14.999 |
| yyyy-MM-dd HH:mm:ss.SSS XXX | 2017-12-31 23:59:14.999 -08:00 |
| yyyy-MM-dd HH:mm:ss.SSS OOOO | 2017-12-31 23:59:14.999 GMT-08:00 |
| yyyy-MM-dd HH:mm:ss.SSS vv | 2017-12-31 23:59:14.999 Europe/Amsterdam |
| M/d/yyyy hh:mm:ss a | 1/31/2017 12:00:00 AM |

## Caveats

* 'MM' is months, 'mm' is minutes
* 'HH' is 24-hour, 'hh' is 12-hour. If you use AM/PM be sure to use 'hh' and otherwise 'HH'.
* Parsing strings with time zones is only possible if there is whitespace or end-of-string after the zone name.
* Time zones with a non-zero seconds offset (e.g. '-03:34:24') are not supported for parsing or formatting.
* Two-digit years are interpreted as being in the 20th century if the digits are greater than (current local year + 50) and in 21th century otherwise.

### Internationalization

You can change the names used for months and weekdays etc. You can do so globally (by setting `DEFAULT_FORMAT_OPTIONS`), or locally
(by passing an options object to the `format` and `parse` functions).

```javascript
// parsing and formatting
let dt = new tc.DateTime("2015-03-01", "yyyy-MM-dd");
dt.format("dd-MMMM-yyyy"); // "31-March-2015"

// formatting with custom month names
dt.format("dd-MMMM-yyyy", { longMonthNames: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", ...]}); // "31-Maart-2015"

// default month names
console.log(tc.DEFAULT_FORMAT_OPTIONS.longMonthNames[1]); // "January"

// all possible format options:
const myFormatOptions = {
	eraNarrow: ["A", "B"],
	eraWide: ["Anno Domini", "Before Christ"],
	eraAbbreviated: ["AD", "BC"],
	quarterLetter: "Q",
	quarterWord: "quarter",
	quarterAbbreviations: ["1st", "2nd", "3rd", "4th"],
	standAloneQuarterLetter: "Q",
	standAloneQuarterWord: "quarter",
	standAloneQuarterAbbreviations: ["1st", "2nd", "3rd", "4th"],
	longMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	shortMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	monthLetters: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
	standAloneLongMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	standAloneShortMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	standAloneMonthLetters: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
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

The table below shows the format patterns and whether timezonecomplete supports them. If you need additional patterns to be supported then please submit a PR or an issue.

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
|  | Y+ | | - | - | Year in “Week of Year” based calendars in which the year transition occurs on a week boundary |
|  | u+ | 4601 | - | - | Extended year (numeric) |
|  | U+ | | - | - | Cyclic year name |
|  | r+ | 2017 | yes | yes | Related Gregorian year (numeric) |
| quarter | Q | 2 | yes | yes | Quarter name/number. Parsing a quarter by itself sets the date to the start of the quarter. Parsing a quarter and a date will throw an error if they don't match. |
|  | QQ | 02 | yes | yes | |
|  | QQQ | Q2 | yes | yes | |
|  | QQQQ | 2nd quarter | yes | yes | |
|  | QQQQQ | 2 | yes | yes | |
|  | q | 2 | yes | yes | Stand-alone quarter name/number (different names for some languages) |
|  | qq | 02 | yes | yes | |
|  | qqq | Q2 | yes | yes | |
|  | qqqq | 2nd quarter | yes | yes | |
|  | qqqqq | 2 | yes | yes | |
| month | M | 9, 12 | yes | yes | Month number/name |
|  | MM | 09, 12 | yes | yes | |
|  | MMM | Sep | yes | yes | |
|  | MMMM | September | yes | - | |
|  | MMMMM | S | yes | yes | This is ambiguous for US month names since June and July start with the same letter |
|  | L | 9, 12 | yes | yes | Stand-alone month number/name (different names for some languages) |
|  | LL | 09, 12 | yes | yes | |
|  | LLL | Sep | yes | yes | |
|  | LLLL | September | yes | yes | |
|  | LLLLL | S | yes | yes | |
| week | w | 8, 27 | yes | - | Week of Year (numeric) |
|  | ww | 08, 27 | yes | - | |
|  | W | 3 | yes | - | Week of Month (numeric) |
| day | d | 1 | yes | yes | Day of month (numeric) |
|  | dd | 01 | yes | yes | |
|  | D..DDD | 345 | yes | - | Day of year (numeric) |
|  | F | 2 | - | - | Day of Week in Month (numeric) |
|  | g+ | 2451334 | - | - | Modified Julian day (numeric) |
| week day | E..EEE | Tue | yes | - | Day of week name |
|  | EEEE | Tuesday | yes | - | |
|  | EEEEE | T | yes | - | |
|  | EEEEEE | Tu | yes | - | |
|  | e | 2 | yes | - | Local day of week number/name |
|  | ee | 02 | yes | - | |
|  | eee | Tue | yes | - | |
|  | eeee | Tuesday | yes | - | |
|  | eeeee | T | yes | - | |
|  | eeeeee | Tu | yes | - | |
|  | c..cc | 2 | yes | - | Stand-alone local day of week number/name |
|  | ccc | Tue | yes | - | |
|  | cccc | Tuesday | yes | - | |
|  | ccccc | T | yes | - | |
|  | cccccc | Tu | yes | - | |
| day period | a..aaa | AM, PM | yes | yes | AM, PM. Tip: use 'hh' and not 'HH' when specifying 'a+' or 'b+' |
|  | aaaa | AM, PM | yes | yes | |
|  | aaaaa | A, P | yes | yes | |
|  | b..bbb | AM, PM, noon, mid. | yes | yes | AM, PM, noon, midnight |
|  | bbbb | AM, PM, noon, midnight | yes | yes | |
|  | bbbbb | A, P, noon, mn | yes | yes | |
|  | B..BBB | at night | - | - | Flexible day periods (abbreviated) |
|  | BBBB | at night | - | - | Flexible day periods (wide) |
|  | BBBBB | at night | - | - | Flexible day periods (narrow) |
| hour | h | 2, 12 | yes | yes | hour of day, 1-12 (when parsing, 0-23 is allowed; 12 without AM/PM is parsed as midnight) |
|  | hh | 02, 12 | yes | yes | |
|  | H | 0, 23 | yes | yes | hour of day, 0-23 |
|  | HH | 00, 23 | yes | yes | |
|  | K | 0, 11 | yes | yes | hour of day, 0-11 (when parsing, 0-23 is allowed; 12 without AM/PM is parsed as noon) |
|  | KK | 00, 11 | yes | yes | |
|  | k | 1, 24 | yes | yes | hour of day, 1-24 |
|  | kk | 01, 24 | yes | yes | |
|  | j+ |  | - | - | Reserved, should not be used |
|  | J+ |  | - | - | Reserved, should not be used |
|  | C+ |  | - | - | Reserved, should not be used |
| minute | m | 8, 59 | yes | yes | Minute |
|  | mm | 08, 59 | yes | yes | |
| second | s | 8, 12 | yes | yes | Second |
|  | ss | 08, 12 | yes | yes | |
|  | S | 3 | yes | yes | Fractional Second (numeric), one digit |
|  | SS | 34 | yes | yes | Fractional Second (numeric), two digits |
|  | SSS | 345 | yes | yes | Fractional Second (numeric), three digits (i.e. milliseconds). Use ss.SSS for displaying seconds.milliseconds |
|  | SSS+ | 34500 | yes | partly | Timezonecomplete does not store sub-millisecond values so values are truncated |
|  | A+ | 69540000 | yes | yes | Milliseconds in day (numeric) |
| zone | z..zzz | PDT | yes | - | The short specific non-location format |
|  | zzzz | Pacific Daylight Time | - | - | The long specific non-location format.  |
|  | Z..ZZZ | -0800 | yes | yes | The ISO8601 basic format with hours, minutes and optional seconds fields |
|  | ZZZZ | GMT-08:00 | yes | yes | The long localized GMT format. This is equivalent to the "OOOO" specifier. |
|  | ZZZZZ | Z, -08:00, -07:52:13 | - | - | The ISO8601 extended format with hours, minutes and optional seconds fields. The ISO8601 UTC indicator "Z" is used when local time offset is 0. |
|  | O | GMT-8 | yes | yes | The short localized GMT format. |
|  | OOOO | GMT-08:00 | yes | yes | The long localized GMT format |
|  | v | PT | - | - | The short generic non-location format. |
|  | vvvv | Pacific Time | - | - | The long generic non-location format. |
|  | V | uslax | - | - | deprecated |
|  | VV | America/Los_Angeles | yes | yes | The long time zone ID. |
|  | VVV | Los Angeles | - | - | The exemplar city (location) for the time zone |
|  | VVVV | Los Angeles Time | - | - | The generic location format.  |
|  | X | -08, +0530, Z | yes | yes | The same as x, plus "Z". |
|  | XX | -0800, Z | yes | yes | The same as xx, plus "Z". |
|  | XXX | -08:00, Z | yes | yes | The same as xxx, plus "Z". |
|  | XXXX | -0800, -075258, Z | - | - | The same as xxxx, plus "Z". |
|  | XXXXX | -0800, -07:52:58, Z | - | - | The same as xxxxx, plus "Z". |
|  | x | -08, +0530 | yes | yes | The ISO8601 basic format with hours field and optional minutes field. |
|  | xx | -0800 | yes | yes | The ISO8601 basic format with hours and minutes fields. |
|  | xxx | -08:00 | yes | yes | The ISO8601 extended format with hours and minutes fields. |
|  | xxxx | -0800, -075258 | - | - | The ISO8601 basic format with hours, minutes and optional seconds fields. |
|  | xxxxx | -0800, -07:52:58 | - | - | The ISO8601 extended format with hours, minutes and optional seconds fields |
