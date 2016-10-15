
# Upgrade Instructions

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
