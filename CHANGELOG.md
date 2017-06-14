# Change Log
This file documents all notable changes to bluebird-retry. The release numbering uses [semantic versioning](http://semver.org).

## 0.11.0
Released 2017-06-13

- @amir-arad removed special browserify entry from package.json

## 0.10.1
Released 2016-11-26

- Fixed the readme to not suggest using the discouraged `.done` chain function.

## 0.10.0
Released 2016-11-26

- Added optional `context` and `args` options that are used when invoking the retry function.

## 0.9.0
Released 2016-11-23

- @dustinblackman added a `throw_original` option so that timeout errors throw the original error instead of wrapping it in a new Error.

## 0.8.0
Released 2016-06-27

- Make sure to stringify a non-error so we get information on the failure instead of the not very helpful [object Object] default toString of a javascript object.

## 0.7.0
Released 2016-06-16

- Added support for a `predicate` option that uses bluebird's [filtered catch](http://bluebirdjs.com/docs/api/catch.html#filtered-catch) so that only errors matching a particular type or predicate function cause the operation to retry.
- Reworked the error handling to handle the case where the function rejects with a non-Error object and to no longer replace the timeout error stack with the original error's stack.

## 0.6.1
Released 2016-04-17

- Updated links in the package and README to reflect the new repository location.

## 0.6.0
Released 2016-03-28

- Changed bluebird to be a peerDependency instead of a regular dependency. This enables support for bluebird 3.
- Replaced use of .try and .catch functions with the .attempt and .caught aliases to support older browsers.
- Switched the build chain to use gulp and browserify instead of grunt.

## 0.5.3
Released 2016-01-14

- Fixed the example in the README.

## 0.5.2
Released 2015-10-16

- Fixed a typo in the README.

## 0.5.1
Released 2015-08-27

- Fixed the README example.
- Moved the dependency on underscore into devDependencies.

## 0.5.0
Released 2015-07-28

- Reworked the cancellation API to use a StopError subclass instead of a callback function.

## 0.4.0
Released 2015-04-19

- Updated the dependencies to be more permissive, supporting newer versions of bluebird.
- Updated README.

## 0.3.2
Released 2015-03-18

- Set the retry interval based on whether the option is a number, not whether it is truthy to support retry intervals of 0.

## 0.3.1
Released 2015-01-10

- Propagate the error stack on the last retry failure so it is visible outside the try block.

## 0.3.0
Released 2015-01-02

- Updated the browser build.

## 0.2.0
Released 2014-11-09

- Rework the build to use grunt-dry.

## 0.1.0
Released 2014-11-06

- Initial release
