(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bluebirdRetry = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    function try_once() {
        var tryStart = new Date().getTime();
        return Promise.attempt(function() {
                return func();
            })
            .caught(function(err) {
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

                if ((max_tries && (tries === max_tries) ||
                    (giveup_time && (now + interval >= giveup_time)))) {
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

},{"bluebird":undefined}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYmx1ZWJpcmQtcmV0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG4vLyBTdWJjbGFzcyBvZiBFcnJvciB0aGF0IGNhbiBiZSB0aHJvd24gdG8gaW5kaWNhdGUgdGhhdCByZXRyeSBzaG91bGQgc3RvcC5cbi8vXG4vLyBJZiBjYWxsZWQgd2l0aCBhbiBpbnN0YW5jZSBvZiBFcnJvciBzdWJjbGFzcywgdGhlbiB0aGUgcmV0cnkgcHJvbWlzZSB3aWxsIGJlXG4vLyByZWplY3RlZCB3aXRoIHRoZSBnaXZlbiBlcnJvci5cbi8vXG4vLyBPdGhlcndpc2UgdGhlIGNhbmNlbCBlcnJvciBvYmplY3QgaXRzZWxmIGlzIHByb3BhZ2F0ZWQgdG8gdGhlIGNhbGxlci5cbi8vXG5mdW5jdGlvbiBTdG9wRXJyb3IoZXJyKSB7XG4gICAgdGhpcy5uYW1lID0gJ1N0b3BFcnJvcic7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRoaXMuZXJyID0gZXJyXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gZXJyIHx8ICdjYW5jZWxsZWQnXG4gICAgfVxufVxuU3RvcEVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcblxucmV0cnkuU3RvcEVycm9yID0gU3RvcEVycm9yO1xuXG5cbi8vIFJldHJ5IGBmdW5jYCB1bnRpbCBpdCBzdWNjZWVkcy5cbi8vXG4vLyBXYWl0cyBgb3B0aW9ucy5pbnRlcnZhbGAgbWlsbGlzZWNvbmRzIChkZWZhdWx0IDEwMDApIGJldHdlZW4gYXR0ZW1wdHMuXG4vL1xuLy8gSW5jcmVhc2VzIHdhaXQgYnkgYSBmYWN0b3Igb2YgYG9wdGlvbnMuYmFja29mZmAgZWFjaCBpbnRlcnZhbCwgdXAgdG9cbi8vIGEgbGltaXQgb2YgYG9wdGlvbnMubWF4X2ludGVydmFsYC5cbi8vXG4vLyBLZWVwcyB0cnlpbmcgdW50aWwgYG9wdGlvbnMudGltZW91dGAgbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCxcbi8vIG9yIGBvcHRpb25zLm1heF90cmllc2AgaGF2ZSBiZWVuIGF0dGVtcHRlZCwgd2hpY2hldmVyIGNvbWVzIGZpcnN0LlxuLy9cbi8vIElmIG5laXRoZXIgaXMgc3BlY2lmaWVkLCB0aGVuIHRoZSBkZWZhdWx0IGlzIHRvIG1ha2UgNSBhdHRlbXB0cy5cbmZ1bmN0aW9uIHJldHJ5KGZ1bmMsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBpbnRlcnZhbCA9IHR5cGVvZiBvcHRpb25zLmludGVydmFsID09PSAnbnVtYmVyJyA/IG9wdGlvbnMuaW50ZXJ2YWwgOiAxMDAwO1xuXG4gICAgdmFyIG1heF90cmllcywgZ2l2ZXVwX3RpbWU7XG4gICAgaWYgKHR5cGVvZihvcHRpb25zLm1heF90cmllcykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1heF90cmllcyA9IG9wdGlvbnMubWF4X3RyaWVzO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnRpbWVvdXQpIHtcbiAgICAgICAgZ2l2ZXVwX3RpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIG9wdGlvbnMudGltZW91dDtcbiAgICB9XG5cbiAgICBpZiAoIW1heF90cmllcyAmJiAhZ2l2ZXVwX3RpbWUpIHtcbiAgICAgICAgbWF4X3RyaWVzID0gNTtcbiAgICB9XG5cbiAgICB2YXIgdHJpZXMgPSAwO1xuICAgIHZhciBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgZnVuY3Rpb24gdHJ5X29uY2UoKSB7XG4gICAgICAgIHZhciB0cnlTdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hdHRlbXB0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdWdodChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgU3RvcEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIuZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICsrdHJpZXM7XG4gICAgICAgICAgICAgICAgaWYgKHRyaWVzID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IGJhY2tvZmYoaW50ZXJ2YWwsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoKG1heF90cmllcyAmJiAodHJpZXMgPT09IG1heF90cmllcykgfHxcbiAgICAgICAgICAgICAgICAgICAgKGdpdmV1cF90aW1lICYmIChub3cgKyBpbnRlcnZhbCA+PSBnaXZldXBfdGltZSkpKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZW91dCA9IG5ldyBFcnJvcignb3BlcmF0aW9uIHRpbWVkIG91dCBhZnRlciAnICsgKG5vdyAtIHN0YXJ0KSArICcgbXMsICcgKyB0cmllcyArICcgdHJpZXMnICsgJyBmYWlsdXJlOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0LmZhaWx1cmUgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQuY29kZSA9ICdFVElNRURPVVQnO1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0LnN0YWNrID0gZXJyLnN0YWNrO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodGltZW91dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gaW50ZXJ2YWwgLSAobm93IC0gdHJ5U3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVsYXkgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyeV9vbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5kZWxheShkZWxheSkudGhlbih0cnlfb25jZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRyeV9vbmNlKCk7XG59XG5cbi8vIFJldHVybiB0aGUgdXBkYXRlZCBpbnRlcnZhbCBhZnRlciBhcHBseWluZyB0aGUgdmFyaW91cyBiYWNrb2ZmIG9wdGlvbnNcbmZ1bmN0aW9uIGJhY2tvZmYoaW50ZXJ2YWwsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5iYWNrb2ZmKSB7XG4gICAgICAgIGludGVydmFsID0gaW50ZXJ2YWwgKiBvcHRpb25zLmJhY2tvZmY7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubWF4X2ludGVydmFsKSB7XG4gICAgICAgIGludGVydmFsID0gTWF0aC5taW4oaW50ZXJ2YWwsIG9wdGlvbnMubWF4X2ludGVydmFsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJ2YWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmV0cnk7XG4iXX0=
