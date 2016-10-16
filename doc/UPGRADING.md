
# Upgrade Instructions


## Upgrading from version 4 to version 5

The TZ data is no longer installed with this module. You need to install the 'tzdata' module (or one of the more light-weight tzdata-* modules) manually next to timezonecomplete.

Separating the TZ data from timezonecomplete has three advantages:
1. The data becomes useful to other modules than just timezonecomplete
1. By choosing for e.g. 'tzdata-northamerica', you can install just the time zones you need, which is especially handy for browser use (smaller footprint).
1. The upgrades to the TZ data become independent of changes to timezonecomplete. That means you do not have to upgrade to the latest timezonecomplete version to get the latest TZ data.

### Node.JS

Simply install one or more of the following NPM modules. Timezonecomplete will find any installed module on its own, you do not need to include them in your Node modules:

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


### Browserify

You need to manually add the tzdata JSON files from the NPM modules above, e.g.:

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

### Browser + Require.JS

You need to ensure that one or more bundle files from the NPM modules above are loaded, e.g. like this:

```
require.config({
    baseUrl: '.',
    paths: {
        "timezonecomplete": 'timezonecomplete',
        "tzdata-backward-utc": 'tzdata-backward-utc',
        "tzdata-etcetera": 'tzdata-etcetera'
    }
});

require(['timezonecomplete', 'tzdata-backward-utc', 'tzdata-etcetera'], function(tc) {
});
```

### Browser (stand-alone)

The tzdata-* NPM modules contain a bundled .js file that you need to include in the HTML before including timezonecomplete. Thus, your script tags should look like this:

```html
	<script src="./tzdata.js"></script>
	<script src="./timezonecomplete.js"></script>
```


## Upgrading from version 3 to version 4

Only minor breaking changes - these classes should not be used much at all.

* unixToTimeNoLeapSecs() returns a TimeComponents instead of a TimeStruct now. Use new TimeStruct(unixMillis) instead.
* timeToUnixNoLeapSecs() now has all of its parameters non-optional. Use TimeStruct.unixMillis instead.
* TimeStruct has changed (you should not have to use this):
  * The constructor no longer takes loose year, month, day, ... arguments. Use either TimeStruct({ year, month, day}) constructor or TimeStruct.fromComponents()
  * Instead of TimeStruct#toUnixNoLeapSecs(), use the TimeStruct#unixMillis property
  * the lessThan() method is gone, simply use the less-than operator < to compare TimeStructs
* The UtcMillisCache is gone.

## Upgrading from version 2 to version 3

The Period class has changed.

* The Period#findLast() method now also returns timestamps before the period start date, instead of stopping there. Change your application logic if it depends on periods not returning timestamps before the start date.
* Change your application logic if it depends on Period#equals() to mean 'same start date and same interval'. Consider using Period#identical() for that purpose if it isn't too strict for you.
* Rename all calls to Period#start() to Period#reference().  The start() method is deprecated.

## Upgrading from version 1 to version 2

Javascript users don't need to do anything. Typescript users should:
* Remove any triple-slash references to the timezonecomplete typings file
* Ensure tsc is called with 'node' module resolution (which is the default)
