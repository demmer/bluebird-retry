# bluebird-retry [![Build Status: Linux](https://travis-ci.org/demmer/bluebird-retry.png?branch=master)](https://travis-ci.org/demmer/bluebird-retry)

This very simple library provides a function for retrying an
asynchronous operation until it succeeds. An "asynchronous operation"
is embodied by a function that returns a promise or returns synchronously.

It supports regular intervals and exponential backoff with a configurable
limit, as well as an overall timeout for the operation that limits the
number of retries.

The bluebird library supplies the promise implementation.

## Basic Usage

```js
var Promise = require('bluebird');
var retry = require('bluebird-retry');

var count = 0;
function myfunc() {
    console.log('myfunc called ' + (++count) + ' times');
    if (count < 3) {
        return Promise.reject(new Error('fail the first two times'));
    } else {
        return Promise.resolve('succeed the third time');
    }
}

retry(myfunc)
.then(function(result) {
    console.log(result);
});
```

This will display:

```
myfunc called 1 times
myfunc called 2 times
myfunc called 3 times
succeed the third time
```

The function is executed by `Promise.attempt`, so it can return a simple value or a
Promise that resolves successfully to indicate success, or it can throw an Error
or a rejected promise to indicate failure.

Note that the rejection messages from the first two failed calls
were absorbed by `retry`.

## Options

The maximum number of retries and controls for the interval
between retries can be specified via the `options` parameter:

* `interval` initial wait time between attempts in milliseconds (default 1000)
* `backoff` if specified, increase interval by this factor between attempts
* `max_interval` if specified, maximum amount that interval can increase to
* `timeout` total time to wait for the operation to succeed in milliseconds
* `max_tries` maximum number of attempts to try the operation (default 5)
* `predicate` to be used as bluebird's [Filtered Catch](http://bluebirdjs.com/docs/api/catch.html#filtered-catch). `func` will be retried only if the predicate expectation is met, it will otherwise fail immediately.
* `throw_original` to throw the last thrown error instance rather then a timeout error.
* `context` if specified, is used as the `this` context when calling `func`
* `args` if specified, is passed as arguments to `func`

Note that `timeout` does not actually set a real timeout for the operation,
but actually computes a maximum number of attempts based on the interval
options. If both `timeout` and `max_tries` are specified, then whichever
limit comes first applies. If `max_tries` is set to `-1` and no `timeout` 
is specified, retry will be performed forever.

For example:

```js
function logFail() {
    console.log(new Date().toISOString());
    throw new Error('bail');
}

retry(logFail, { max_tries: 4, interval: 500 });
```
Will display:
```
2014-05-29T23:16:28.941Z
2014-05-29T23:16:29.445Z
2014-05-29T23:16:29.946Z
2014-05-29T23:16:30.447Z
Error: operation timed out
```

And

```js
retry(logFail, { timeout: 10000, interval: 1000, backoff: 2 });
```
Will display:

```
2014-05-29T23:17:29.655Z
2014-05-29T23:17:30.658Z
2014-05-29T23:17:32.660Z
2014-05-29T23:17:36.661Z
Error: operation timed out
```

## Stopping

The library also supports stopping the retry loop before the timeout occurs by throwing a new instance of `retry.StopError` from within the called function.

For example:

```js
var retry = require('bluebird-retry');
var i = 0;
var err;
var swing = function() {
    i++;
    console.log('strike ' + i);
    if (i == 3) {
        throw new retry.StopError('yer out');
    }
    throw new Error('still up at bat');
};

retry(swing, {timeout: 10000})
.caught(function(e) {
    console.log(e.message)
});
```

Will display:

```
strike 1
strike 2
strike 3
yer out
```

The `StopError` constructor accepts one argument. If it is invoked with an instance of `Error`, then the promise is rejected with that error argument. Otherwise the promise is rejected with the `StopError` itself.
