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

},{"bluebird":undefined}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYmx1ZWJpcmQtcmV0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcblxuLy8gU3ViY2xhc3Mgb2YgRXJyb3IgdGhhdCBjYW4gYmUgdGhyb3duIHRvIGluZGljYXRlIHRoYXQgcmV0cnkgc2hvdWxkIHN0b3AuXG4vL1xuLy8gSWYgY2FsbGVkIHdpdGggYW4gaW5zdGFuY2Ugb2YgRXJyb3Igc3ViY2xhc3MsIHRoZW4gdGhlIHJldHJ5IHByb21pc2Ugd2lsbCBiZVxuLy8gcmVqZWN0ZWQgd2l0aCB0aGUgZ2l2ZW4gZXJyb3IuXG4vL1xuLy8gT3RoZXJ3aXNlIHRoZSBjYW5jZWwgZXJyb3Igb2JqZWN0IGl0c2VsZiBpcyBwcm9wYWdhdGVkIHRvIHRoZSBjYWxsZXIuXG4vL1xuZnVuY3Rpb24gU3RvcEVycm9yKGVycikge1xuICAgIHRoaXMubmFtZSA9ICdTdG9wRXJyb3InO1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aGlzLmVyciA9IGVyclxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IGVyciB8fCAnY2FuY2VsbGVkJ1xuICAgIH1cbn1cblN0b3BFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG5cbnJldHJ5LlN0b3BFcnJvciA9IFN0b3BFcnJvcjtcblxuXG4vLyBSZXRyeSBgZnVuY2AgdW50aWwgaXQgc3VjY2VlZHMuXG4vL1xuLy8gRm9yIGVhY2ggYXR0ZW1wdCwgaW52b2tlcyBgZnVuY2Agd2l0aCBgb3B0aW9ucy5hcmdzYCBhcyBhcmd1bWVudHMgYW5kXG4vLyBgb3B0aW9ucy5jb250ZXh0YCBhcyBgdGhpc2AuXG4vL1xuLy8gV2FpdHMgYG9wdGlvbnMuaW50ZXJ2YWxgIG1pbGxpc2Vjb25kcyAoZGVmYXVsdCAxMDAwKSBiZXR3ZWVuIGF0dGVtcHRzLlxuLy9cbi8vIEluY3JlYXNlcyB3YWl0IGJ5IGEgZmFjdG9yIG9mIGBvcHRpb25zLmJhY2tvZmZgIGVhY2ggaW50ZXJ2YWwsIHVwIHRvXG4vLyBhIGxpbWl0IG9mIGBvcHRpb25zLm1heF9pbnRlcnZhbGAuXG4vL1xuLy8gS2VlcHMgdHJ5aW5nIHVudGlsIGBvcHRpb25zLnRpbWVvdXRgIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQsXG4vLyBvciBgb3B0aW9ucy5tYXhfdHJpZXNgIGhhdmUgYmVlbiBhdHRlbXB0ZWQsIHdoaWNoZXZlciBjb21lcyBmaXJzdC5cbi8vXG4vLyBJZiBuZWl0aGVyIGlzIHNwZWNpZmllZCwgdGhlbiB0aGUgZGVmYXVsdCBpcyB0byBtYWtlIDUgYXR0ZW1wdHMuXG4vL1xuXG5mdW5jdGlvbiByZXRyeShmdW5jLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgaW50ZXJ2YWwgPSB0eXBlb2Ygb3B0aW9ucy5pbnRlcnZhbCA9PT0gJ251bWJlcicgPyBvcHRpb25zLmludGVydmFsIDogMTAwMDtcblxuICAgIHZhciBtYXhfdHJpZXMsIGdpdmV1cF90aW1lO1xuICAgIGlmICh0eXBlb2Yob3B0aW9ucy5tYXhfdHJpZXMpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtYXhfdHJpZXMgPSBvcHRpb25zLm1heF90cmllcztcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50aW1lb3V0KSB7XG4gICAgICAgIGdpdmV1cF90aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgKyBvcHRpb25zLnRpbWVvdXQ7XG4gICAgfVxuXG4gICAgaWYgKCFtYXhfdHJpZXMgJiYgIWdpdmV1cF90aW1lKSB7XG4gICAgICAgIG1heF90cmllcyA9IDU7XG4gICAgfVxuXG4gICAgdmFyIHRyaWVzID0gMDtcbiAgICB2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIC8vIElmIHRoZSB1c2VyIGRpZG4ndCBzdXBwbHkgYSBwcmVkaWNhdGUgZnVuY3Rpb24gdGhlbiBhZGQgb25lIHRoYXRcbiAgICAvLyBhbHdheXMgc3VjY2VlZHMuXG4gICAgLy9cbiAgICAvLyBUaGlzIGlzIHVzZWQgaW4gYmx1ZWJpcmQncyBmaWx0ZXJlZCBjYXRjaCB0byBmbGFnIHRoZSBlcnJvciB0eXBlc1xuICAgIC8vIHRoYXQgc2hvdWxkIHJldHJ5LlxuICAgIHZhciBwcmVkaWNhdGUgPSBvcHRpb25zLnByZWRpY2F0ZSB8fCBmdW5jdGlvbihlcnIpIHsgcmV0dXJuIHRydWU7IH1cbiAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gdHJ5X29uY2UoKSB7XG4gICAgICAgIHZhciB0cnlTdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hdHRlbXB0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jLmFwcGx5KG9wdGlvbnMuY29udGV4dCwgb3B0aW9ucy5hcmdzKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F1Z2h0KFN0b3BFcnJvciwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5lcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyLmVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXVnaHQocHJlZGljYXRlLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcHBlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKyt0cmllcztcbiAgICAgICAgICAgICAgICBpZiAodHJpZXMgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsID0gYmFja29mZihpbnRlcnZhbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgIGlmICgobWF4X3RyaWVzICYmICh0cmllcyA9PT0gbWF4X3RyaWVzKSB8fFxuICAgICAgICAgICAgICAgICAgICAoZ2l2ZXVwX3RpbWUgJiYgKG5vdyArIGludGVydmFsID49IGdpdmV1cF90aW1lKSkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEgKGVyciBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSBlcnI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZmFpbHVyZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlID0gSlNPTi5zdHJpbmdpZnkoZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKCdyZWplY3RlZCB3aXRoIG5vbi1lcnJvcjogJyArIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyLmZhaWx1cmUgPSBmYWlsdXJlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMudGhyb3dfb3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gbmV3IEVycm9yKCdvcGVyYXRpb24gdGltZWQgb3V0IGFmdGVyICcgKyAobm93IC0gc3RhcnQpICsgJyBtcywgJyArIHRyaWVzICsgJyB0cmllcyB3aXRoIGVycm9yOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0LmZhaWx1cmUgPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQuY29kZSA9ICdFVElNRURPVVQnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QodGltZW91dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gaW50ZXJ2YWwgLSAobm93IC0gdHJ5U3RhcnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVsYXkgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyeV9vbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5kZWxheShkZWxheSkudGhlbih0cnlfb25jZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRyeV9vbmNlKCk7XG59XG5cbi8vIFJldHVybiB0aGUgdXBkYXRlZCBpbnRlcnZhbCBhZnRlciBhcHBseWluZyB0aGUgdmFyaW91cyBiYWNrb2ZmIG9wdGlvbnNcbmZ1bmN0aW9uIGJhY2tvZmYoaW50ZXJ2YWwsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5iYWNrb2ZmKSB7XG4gICAgICAgIGludGVydmFsID0gaW50ZXJ2YWwgKiBvcHRpb25zLmJhY2tvZmY7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubWF4X2ludGVydmFsKSB7XG4gICAgICAgIGludGVydmFsID0gTWF0aC5taW4oaW50ZXJ2YWwsIG9wdGlvbnMubWF4X2ludGVydmFsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJ2YWw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmV0cnk7XG4iXX0=
