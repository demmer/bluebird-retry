(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['bluebird'], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('bluebird'));
    } else {
        // Browser globals
        this.bluebird_retry = factory(bluebird);
    }
}(function (__external_bluebird) {
    var global = this, define;
    function _require(id) {
        var module = _require.cache[id];
        if (!module) {
            var exports = {};
            module = _require.cache[id] = {
                id: id,
                exports: exports
            };
            _require.modules[id].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            module.exports = _require(1);
        },
        function (module, exports) {
            var Promise = _require(2);    // Subclass of Error that can be thrown to indicate that retry should stop.
                                          //
                                          // If called with an instance of Error subclass, then the retry promise will be
                                          // rejected with the given error.
                                          //
                                          // Otherwise the cancel error object itself is propagated to the caller.
                                          //
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
                    this.err = err;
                } else {
                    this.message = err || 'cancelled';
                }
            }
            StopError.prototype = Object.create(Error.prototype);
            retry.StopError = StopError;    // Retry `func` until it succeeds.
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
            // Retry `func` until it succeeds.
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
            function retry(func, options) {
                options = options || {};
                var interval = typeof options.interval === 'number' ? options.interval : 1000;
                var max_tries, giveup_time;
                if (typeof options.max_tries !== 'undefined') {
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
                function try_once() {
                    var tryStart = new Date().getTime();
                    return Promise.try(function () {
                        return func();
                    }).catch(function (err) {
                        if (err instanceof StopError) {
                            if (err.err instanceof Error) {
                                return Promise.reject(err.err);
                            } else {
                                return Promise.reject(err);
                            }
                        }
                        ++tries;
                        if (tries > 1) {
                            interval = backoff(interval, options);
                        }
                        var now = new Date().getTime();
                        if (max_tries && tries === max_tries || giveup_time && now + interval >= giveup_time) {
                            var timeout = new Error('operation timed out after ' + (now - start) + ' ms, ' + tries + ' tries' + ' failure: ' + err.message);
                            timeout.failure = err;
                            timeout.code = 'ETIMEDOUT';
                            timeout.stack = err.stack;
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
            }    // Return the updated interval after applying the various backoff options
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
        },
        function (module, exports) {
            module.exports = __external_bluebird;
        }
    ];
    return _require(0);
}));