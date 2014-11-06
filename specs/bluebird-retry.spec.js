var _ = require('underscore');
var Promise = require('bluebird');
var expect = require('chai').expect;
var retry = require('../lib/bluebird-retry');

var now = {
    success: function() {
        return true;
    },

    failure: function() {
        throw new Error('not yet');
    },

    successAfter: function(count) {
        var n = 0;
        return function() {
            if (++n === count) {
                return now.success();
            } else {
                return now.failure();
            }
        };
    }
};

var later = {
    success: function() {
        return Promise.resolve(true);
    },

    failure: function() {
        return Promise.reject(new Error('not yet'));
    },

    successAfter: function(count) {
        var n = 0;
        return function() {
            if (++n === count) {
                return later.success();
            } else {
                return later.failure();
            }
        };
    },

    // This only makes sense in the case of promises
    delayFailure: function(delay) {
        return function() {
            return Promise.delay(delay).then(later.failure);
        };
    }
};

function Counter(func) {
    this.func = func;

    var self = this;
    this.call = function() {
        self.call.count++;
        return self.func.apply(self.func, arguments);
    };
    self.call.count = 0;
}

function countCalls(func) {
    var c = new Counter(func);
    return c.call;
}

describe('bluebird-retry', function() {
    _.each({
        'with non-promise functions': now,
        'with promise functions': later
    }, function(funcs, what) {
        describe(what, function() {
            it('succeeds immediately', function(done) {
                var countSuccess = countCalls(funcs.success);
                return retry(countSuccess)
                    .then(function() {
                        expect(countSuccess.count).equal(1);
                    })
                    .done(done, done);
            });

            it('retries a few times', function(done) {
                var countSuccess = countCalls(funcs.successAfter(10));
                return retry(countSuccess, {interval: 10, max_tries: 10})
                    .then(function() {
                        expect(countSuccess.count).equal(10);
                    })
                    .done(done, done);
            });

            it('fails after a few tries', function(done) {
                var countSuccess = countCalls(funcs.successAfter(100));
                return retry(countSuccess, {interval: 10, max_tries: 10})
                    .then(function() {
                        throw new Error('unexpected success');
                    })
                    .catch(function(err) {
                        expect(err.message).match(/operation timed out/);
                        expect(err.failure.message).match(/not yet/);
                        expect(countSuccess.count).equal(10);
                    })
                    .done(done, done);
            });

            it('calculates max_tries based on timeout', function(done) {
                var countSuccess = countCalls(funcs.successAfter(500));
                return retry(countSuccess, {interval: 50, timeout: 475})
                    .then(function() {
                        throw new Error('unexpected success');
                    })
                    .catch(function(err) {
                        expect(err.message).match(/operation timed out/);
                        expect(err.failure.message).match(/not yet/);
                        // Give a bit of leeway for bamboo
                        expect(countSuccess.count).within(8, 10);
                    })
                    .done(done, done);
            });

            it('calculates max_tries based on timeout and exponential interval', function(done) {
                var countSuccess = countCalls(funcs.successAfter(90));
                return retry(countSuccess, {interval: 20, timeout: 200, backoff: 5})
                    .then(function() {
                        throw new Error('unexpected success');
                    })
                    .catch(function(err) {
                        expect(err.message).match(/operation timed out/);
                        expect(err.failure.message).match(/not yet/);
                        expect(countSuccess.count).equal(3); // 20 + 100 + 500
                    })
                    .done(done, done);
            });

            it('calculates max_tries based on exponential interval with limit', function(done) {
                var countSuccess = countCalls(funcs.successAfter(100));
                return retry(countSuccess, {interval: 20, timeout: 200, backoff: 10, max_interval: 100})
                    .then(function() {
                        throw new Error('unexpected success');
                    })
                    .catch(function(err) {
                        expect(err.message).match(/operation timed out/);
                        expect(err.failure.message).match(/not yet/);
                        expect(countSuccess.count).equal(3); // 20 + 100 + 100
                    })
                    .done(done, done);
            });

            if (funcs.delayFailure) {
                it('includes time spent in the handler when computing timeout', function(done) {
                    var count = countCalls(funcs.delayFailure(250));
                    return retry(count, {interval: 20, timeout: 500})
                        .then(function() {
                            throw new Error('unexpected success');
                        })
                        .catch(function(err) {
                            expect(err.message).match(/operation timed out/);
                            expect(err.failure.message).match(/not yet/);
                            expect(count.count).equal(2);
                        })
                        .done(done, done);
                    });
            }

            it('can cancel the retry event loop', function() {
                // test various ways in which cancel() may be invoked
                // by the caller & verify it's output error message
               // ie. input arg => output Error message
                var test_args = [
                    [ undefined, 'cancelled' ],
                    [ 'string error', 'string error' ],
                    [ new Error('custom error'), 'custom error' ]
                ];
                var retry_opts = {interval: 10, max_tries: 5};

                return Promise.all(_.map(test_args, function(arg_type) {
                    var i = 0;
                    var err;
                    var op = function(cancel) {
                        i++;
                        if (i === 3) {
                            cancel(arg_type[0]);
                        }
                        throw new Error();
                    };
                    return retry(op, retry_opts)
                    .catch(function(e) {
                        err = e;
                    })
                    .then(function() {
                        expect(i).to.equal(3);
                        expect(err.message).equal(arg_type[1]);
                    });
                }));
            });
        });
    });
});
