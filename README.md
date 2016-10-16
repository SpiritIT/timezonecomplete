# TimezoneComplete

[![Build Status](https://travis-ci.org/SpiritIT/timezonecomplete.svg?branch=master)](https://travis-ci.org/SpiritIT/timezonecomplete)
[![Coverage Status](https://coveralls.io/repos/github/SpiritIT/timezonecomplete/badge.svg?branch=master)](https://coveralls.io/github/SpiritIT/timezonecomplete?branch=master)
[![NPM version](https://badge.fury.io/js/timezonecomplete.svg)](http://badge.fury.io/js/timezonecomplete)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/spiritit/timezonecomplete/master/LICENSE-MIT)

[![NPM](https://nodei.co/npm/timezonecomplete.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/timezonecomplete/)
[![NPM](https://nodei.co/npm-dl/timezonecomplete.png?months=9&height=3)](https://nodei.co/npm/timezonecomplete/)

## Synopsis

TimezoneComplete is a library of date/time utilities, all of which are aware of time zones and daylight saving time. It provides for calculating with Durations (amount of UTC milliseconds) and with Periods (regular intervals in some timezone's time, which might be irregular in UTC). It has aware DateTimes (with timezone) and unaware DateTimes (without timezone) and you are prevented from mixing the two in calculations.


## Difference with timezone-js, Moment.js and other Date libraries

Other libraries are great, we had different requirements. The main thing for us was that calculations should be stable and predictable, especially around DST change moments.
Above all, it should give the same answers across platforms. At the time we started this, none of the other libraries showed this level of predictability.

* Consistent behaviour across platforms and with different TZ environment variable settings
* Correct time zone conversions back and forth
* Correct Daylight Saving Time handling with predictable behavior for non-existing hours during DST changes
* Feature-rich:
  * **DateTime** class with or without time zone
  * **Durations** with units
  * **Calculating** with dates and durations across time zones
  * **Periods** with regular UTC or regular local time repetition
  * **Utility functions** for determining leap years, determining the last Monday of the month etc.
  * Ability to use with Node.JS as well as in a browser (CommonJS, AMD)
* Good test coverage
* Under active development by a company who have an interest in keeping it up to date
* Timezonecomplete is written in TypeScript and typings are included


## New in Version 5

The IANA time zone data is no longer included with this module. You need to install the 'tzdata' module (or one of the more light-weight tzdata-* modules) manually next to timezonecomplete.

Separating the TZ data from timezonecomplete has three advantages:
# The data becomes useful to other modules than just timezonecomplete
# By choosing for e.g. 'tzdata-northamerica', you can install just the time zones you need, which is handy for browser use (smaller footprint).
# The upgrades to the TZ data become independent of changes to timezonecomplete. That means you do not have to upgrade to the latest timezonecomplete version to get the latest TZ data.

## New in Version 4

We did some performance improvements. The majority of users should be able to just upgrade without making any changes.
A small part of the external API had to change, but it only concerns parts you shouldn't really need anyway. See the [Upgrade Instructions](./doc/UPGRADING.md).

## Documentation

* [API](./doc/API.md)
* [Changelog](./doc/CHANGELOG.md)
* [Upgrade Instructions](./doc/UPGRADING.md)
* [FAQ](./doc/FAQ.md)

## Usage

### Node.JS

You need to install both timezonecomplete and also one or more of the tzdata modules:

* [tzdata](https://npmjs.com/package/tzdata): contains all time zones. When in doubt, use this.
* [tzdata-africa](https://npmjs.com/package/tzdata-africa)
* [tzdata-antarctica](https://npmjs.com/package/tzdata-antarctica)
* [tzdata-asia](https://npmjs.com/package/tzdata-asia)
* [tzdata-australasia](https://npmjs.com/package/tzdata-australasia)
* [tzdata-backward](https://npmjs.com/package/tzdata-backward): contains deprecated zone names, depends on the other modules
* [tzdata-backward-utc](https://npmjs.com/package/tzdata-backward-utc): contains only the UTC and GMT zones of backward, depends on tzdata-etcetera
* [tzdata-etcetera](https://npmjs.com/package/tzdata-etcetera)
* [tzdata-europe](https://npmjs.com/package/tzdata-europe)
* [tzdata-northamerica](https://npmjs.com/package/tzdata-northamerica)
* [tzdata-pacificnew](https://npmjs.com/package/tzdata-pacificnew)
* [tzdata-southamerica](https://npmjs.com/package/tzdata-southamerica)
* [tzdata-systemv](https://npmjs.com/package/tzdata-systemv)

Install using:
```
npm install timezonecomplete
npm install tzdata-northamerica tzdata-etcetera tzdata-backward-utc
```

Then require the timezonecomplete module in your code. Timezonecomplete will automatically find any installed tzdata modules:

```javascript
var tc = require("timezonecomplete");
```

### Browserify

If you use browserify, be sure to include the tzdata modules manually, as browserify won't pick them up automatically:

```
var fs = require('fs');
var glob = require('glob');
var browserify  = require('browserify');
browserify({
    entries: glob.sync('./src/*.js'),
    extensions: ['.js', '.json'], // needed to include the tzdata modules
    debug: true
})
.require('./node_modules/tzdata/timezone-data.json', {expose: 'tzdata'}) // add tzdata
.bundle()
.pipe(fs.createWriteStream('./dist/bundle.js'));
```

### Browser, stand-alone

Timezonecomplete comes with a [bundle](./dist/timezonecomplete.js) and a [minified bundle](./dist/timezonecomplete.min.js). Both are UMD (isomorphic) modules.
Next to these bundles, you also need one or more of the bundles from the tzdata modules listed above.

You can find examples of using timezonecomplete in a browser in the [examples](examples/) directory, both using Require.JS and ambient.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Timezonecomplete Browser Example</title>
  <script src="./tzdata.js"></script>
  <script src="./timezonecomplete.min.js"></script>
  <script>
    function doIt() {
      var utc = tc.nowUtc();
      var local = utc.toZone(tc.zone('localtime'));
      var diff = local.toZone(null).diff(utc.toZone(null));
      var hourDiff = tc.hours(diff.hours());
      document.getElementById('diff').textContent = hourDiff.toString();
    }
  </script>
</head>
<body onLoad="doIt()">
  <p>
    The difference between local time and UTC is:&nbsp;
    <span id="diff"></div>
  </p>
</body>
</html>
```

## License

MIT

