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

### Dates in GMT+5 zone are five hours behind GMT instead of ahead

This is a peculiarity of the IANA time zone database: the zones with names `GMT+N` are reversed with what you'd expect. From the IANA database file 'etcetera':

```
# Be consistent with POSIX TZ settings in the Zone names,
# even though this is the opposite of what many people expect.
# POSIX has positive signs west of Greenwich, but many people expect
# positive signs east of Greenwich.  For example, TZ='Etc/GMT+4' uses
# the abbreviation "-04" and corresponds to 4 hours behind UT
# (i.e. west of Greenwich) even though many people would expect it to
# mean 4 hours ahead of UT (i.e. east of Greenwich).

# Earlier incarnations of this package were not POSIX-compliant,
# and had lines such as
#		Zone	GMT-12		-12	-	GMT-1200
# We did not want things to change quietly if someone accustomed to the old
# way does a
#		zic -l GMT-12
# so we moved the names into the Etc subdirectory.
# Also, the time zone abbreviations are now compatible with %z.
```

So this is not a timezonecomplete issue but rather one of the TZ database. Instead of using GMT+3, simply create a numeric zone that's 3 hours ahead:

```javascript
var t1 = new tc.DateTime("2017-01-12T12:13:59+03:00");
var t2 = new tc.DateTime("2017-01-12T12:13:59.000", tc.zone("+03:00"))
var t3 = new tc.DateTime("2017-01-12T12:13:59.000", tc.zone(3 * 60))
```

### Why does the number returned by weekNumber() not correspond to my calendar?

Different countries have different week number algoritms. We adhere to the ISO 8601 standard, where the first week starts on a Monday and is defined as the week having January 4th in it.
If you need different week numbers, please submit an issue or a pull request.

### Does timezonecomplete handle leap seconds?

Currently not. This is because most platforms don't, especially when converting from and to unix timestamps. If we were to introduce leap seconds, you would have to keep very close track of which of your unix timestamps are adjusted for leap seconds and which aren't. We do plan to add support in some form though.

## Current TZ database version:

The TZ data is no longer installed with this module. You need to install the 'tzdata' module (or one of the more light-weight tzdata-* modules) manually next to timezonecomplete.

Separating the TZ data from timezonecomplete has three advantages:
# The data becomes useful to other modules than just timezonecomplete
# By choosing for e.g. 'tzdata-northamerica', you can install just the time zones you need, which is especially handy for browser use (smaller footprint).
# The upgrades to the TZ data become independent of changes to timezonecomplete. That means you do not have to upgrade to the latest timezonecomplete version to get the latest TZ data.
