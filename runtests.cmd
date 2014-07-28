

SET TZ=""
CALL mocha -R dot ./test/*.js
SET TZ="America/Anchorage"
CALL mocha -R dot ./test/*.js
SET TZ="Europe/Amsterdam"
CALL mocha -R dot ./test/*.js


REM Run test coverage with empty TZ
SET TZ=""
CALL ./node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha -- ./test/*.js
