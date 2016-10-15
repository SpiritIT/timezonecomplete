# FAQ

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

The version of the included IANA time zone database is 2016g.
