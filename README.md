# TimezoneComplete

[![Build Status](https://travis-ci.org/SpiritIT/timezonecomplete.svg?branch=master)](https://travis-ci.org/SpiritIT/timezonecomplete)
[![Coverage Status](https://coveralls.io/repos/github/SpiritIT/timezonecomplete/badge.svg?branch=master)](https://coveralls.io/github/SpiritIT/timezonecomplete?branch=master)
[![NPM version](https://badge.fury.io/js/timezonecomplete.svg)](http://badge.fury.io/js/timezonecomplete)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/spiritit/timezonecomplete/master/LICENSE-MIT)

[![NPM](https://nodei.co/npm/timezonecomplete.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/timezonecomplete/)
[![NPM](https://nodei.co/npm-dl/timezonecomplete.png?months=9&height=3)](https://nodei.co/npm/timezonecomplete/)

## IMPORTANT

This module needs one of the tzdata* NPM modules to be installed next to it in order to work. See the Usage section below.

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
  * **Formatting and parsing** of dates using LDML format strings
  * Ability to use with Node.JS as well as in a browser (CommonJS, AMD)
* Good test coverage
* Under active development by a company who have an interest in keeping it up to date
* Timezonecomplete is written in TypeScript and typings are included


## New in Version 5

The TZ data is now installed as a separate NPM module [tzdata](https://npmjs.com/package/tzdata). For browser use, the data is NOT automatically included anymore, to allow you to choose a subset of the data to optimize your bundle.

Separating the TZ data from timezonecomplete has three advantages:
1. The data becomes useful to other modules than just timezonecomplete
1. By choosing for e.g. 'tzdata-northamerica', you can install just the time zones you need, which is handy for browser use (smaller footprint).
1. The upgrades to the TZ data become independent of changes to timezonecomplete. That means you do not have to upgrade to the latest timezonecomplete version to get the latest TZ data.

See the [Upgrade Instructions](./doc/UPGRADING.md).

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

In Node.JS, timezonecomplete automatically has all time zone data.

Install using:
```
npm install timezonecomplete
```

Then require the timezonecomplete module in your code. Timezonecomplete will automatically find any installed tzdata modules:

```javascript
var tc = require("timezonecomplete");
```

### Browserify

If you use browserify, There are two options:
1. Require the .json files in your code and pass them to TzDatabase.init() before using any timezonecomplete functionality.
1. Include the tzdata .json files manually using browserify.require()

Option 1:
```
// browserify will pick these up. You may need to set the 'extensions' option of browserify to include .json files
// NOTE in TypeScript, also use 'const' NOT 'import'!
const northamerica = require('tzdata-northamerica');
const etcetera = require('tzdata-etcetera');
const tc = require('timezonecomplete');

// Do this before creating e.g. tc.DateTime objects.
// In this example we use only part of the timezone database to reduce bundle size.
// Note you could whittle down the zones and rules further if you like by e.g. excluding rules pre-1990.
// That's at your own risk though
tc.TzDatabase.init([northamerica, etcetera]);
```

Option 2:
```
// Manual browserifying ambient JSON data
var fs = require('fs');
var glob = require('glob');
var browserify  = require('browserify');
browserify({
    entries: glob.sync('./src/*.js'),
    extensions: ['.js', '.json'], // needed to include the tzdata modules
    debug: true
})
.require('./node_modules/tzdata/timezone-data.json', {expose: 'tzdata'}) // add 'tzdata' and make it available globally under its own name
.bundle()
.pipe(fs.createWriteStream('./dist/bundle.js'));
```

### Webpack

Use a >=2.x (beta) version of webpack, to avoid warnings. Then, use a plugin in your webpack configuration to load the time zone data you need.

```javascript
  plugins: [
    new webpack.ContextReplacementPlugin(
      /[\/\\]node_modules[\/\\]timezonecomplete[\/\\]/, 
      path.resolve("tz-database-context"), 
      {
        "tzdata-backward-utc": "tzdata-backward-utc",
        "tzdata-etcetera": "tzdata-etcetera",
        "tzdata-europe": "tzdata-europe"
      }
    )
  ]
```

To install a beta version of webpack, first, look up the latest unstable version using:

```
npm show webpack versions --json
```

Then, install the specific version by specifying it behind an @-sign (in this example 2.2.0-rc3) like this:

```
npm install --save-dev webpack@2.2.0-rc.3
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

