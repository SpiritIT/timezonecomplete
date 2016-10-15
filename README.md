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

## New in version 4

We did some performance improvements. The majority of users should be able to just upgrade without making any changes.
A small part of the external API had to change, but it only concerns parts you shouldn't really need anyway. See the [Upgrade Instructions](./doc/UPGRADING.md).

## Documentation

* [API](./doc/API.md)
* [Changelog](./doc/CHANGELOG.md)
* [Upgrade Instructions](./doc/UPGRADING.md)
* [FAQ](./doc/FAQ.md)


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

## License

MIT

