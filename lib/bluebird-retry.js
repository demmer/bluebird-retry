var Promise = require('bluebird');

// Subclass of Error that can be thrown to indicate that retry should stop.
//
// If called with an instance of Error subclass, then the retry promise will be
// rejected with the given error.
//
// Otherwise the cancel error object itself is propagated to the caller.
//
function StopError(err) {
    this.name = 'StopError';
    if (err instanceof Error) {
        this.err = err
    } else {
        this.message = err || 'cancelled'
    }
}
StopError.prototype = Object.create(Error.prototype);

retry.StopError = StopError;


// Retry `func` until it succeeds.
//
// For each attempt, invokes `func` with `options.args` as arguments and
// `options.context` as `this`.
//
// Waits `options.interval` milliseconds (default 1000) between attempts.
//
// Increases wait by a factor of `options.backoff` each interval, up to
// a limit of `options.max_interval`.
//
// Keeps trying until `options.timeout` milliseconds have elapsed,
// or `options.max_tries` have been attempted, whichever comes first.
//
// If neither is specified, then the default is to make 5 attempts.
//

function retry(func, options) {
    options = options || {};

    var interval = typeof options.interval === 'number' ? options.interval : 1000;

    var max_tries, giveup_time;
    if (typeof(options.max_tries) !== 'undefined') {
        max_tries = options.max_tries;
    }

    if (options.timeout) {
        giveup_time = new Date().getTime() + options.timeout;
    }

    if (!max_tries && !giveup_time) {
        max_tries = 5;
    }

    var tries = 0;
    var start = new Date().getTime();

    // If the user didn't supply a predicate function then add one that
    // always succeeds.
    //
    // This is used in bluebird's filtered catch to flag the error types
    // that should retry.
    var predicate = options.predicate || function(err) { return true; }
    var stopped = false;

    function try_once() {
        var tryStart = new Date().getTime();
        return Promise.attempt(function() {
                return func.apply(options.context, options.args);
            })
            .caught(StopError, function(err) {
                stopped = true;
                if (err.err instanceof Error) {
                    return Promise.reject(err.err);
                } else {
                    return Promise.reject(err);
                }
            })
            .caught(predicate, function(err) {
                if (stopped) {
                    return Promise.reject(err);
                }
                ++tries;
                if (tries > 1) {
                    interval = backoff(interval, options);
                }
                var now = new Date().getTime();

                if ((max_tries && (tries === max_tries) ||
                    (giveup_time && (now + interval >= giveup_time)))) {

                    if (! (err instanceof Error)) {
                        var failure = err;

                        if (failure) {
                          if (typeof failure !== 'string') {
                            failure = JSON.stringify(failure);
                          }
                        }

                        err = new Error('rejected with non-error: ' + failure);
                        err.failure = failure;
                    } else if (options.throw_original) {
                      return Promise.reject(err);
                    }

                    var timeout = new Error('operation timed out after ' + (now - start) + ' ms, ' + tries + ' tries with error: ' + err.message);
                    timeout.failure = err;
                    timeout.code = 'ETIMEDOUT';
                    return Promise.reject(timeout);
                } else {
                    var delay = interval - (now - tryStart);
                    if (delay <= 0) {
                        return try_once();
                    } else {
                        return Promise.delay(delay).then(try_once);
                    }
                }
            });
    }
    return try_once();
}

// Return the updated interval after applying the various backoff options
function backoff(interval, options) {
    if (options.backoff) {
        interval = interval * options.backoff;
    }

    if (options.max_interval) {
        interval = Math.min(interval, options.max_interval);
    }

    return interval;
}

module.exports = retry;
