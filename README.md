# bluebird-retry

This very simple library provides a function for retrying an
asynchronous operation until it succeeds. An "asynchronous operation"
is embodied by a function that returns a promise or returns synchronously.

It supports regular intervals and exponential backoff with a configurable
limit, as well as an overall timeout for the operation that limits the
number of retries.

Uses the bluebird library to supply the promise implementation.

Sample usage:

```js
var Promise = require('bluebird');

function promiseSuccess() {
    return Promise.resolve();
};

var count = 0;
function myfunc() {
    console.log('myfunc called ' + (++count) + ' times');
    if (count < 3) {
        throw new Error('i fail the first two times');
    } else {
        return promiseSuccess('i succeed the third time');
    }
}

retry(myfunc)
    .done(function(result) { console.log(result); } );
```

This will display:

```
myfunc called 1 times
myfunc called 2 times
myfunc called 3 times
i succeed the third time
```

Note that the rejection messages from the first two failed calls
were absorbed by `retry`.

The maximum number of retries and controls for the interval
between retries can be specified via the `options` parameter:

* `interval` initial wait time between attempts in milliseconds (default 1000)
* `backoff` if specified, increase interval by this factor between attempts
* `max_interval` if specified, maximum amount that interval can increase to
* `timeout` total time to wait for the operation to succeed in milliseconds
* `max_tries` maximum number of attempts to try the operation

Note that `timeout` does not actually set a real timeout for the operation,
but actually computes a maximum number of attempts based on the interval
options. If both `timeout` and `max_tries` are specified, then whichever
limit comes first applies.

For example:

```js
function logFail() {
    console.log(new Date().toISOString());
    throw new Error('bail');}
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
