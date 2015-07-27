'use strict';
var assert = require('assert'),
    helpers = require(__dirname + '/helpers/'),
    redis = require('redis-mock'),
    RedisStream = require(__dirname + '/../'),
    possibleTypes = ['channel', 'list'];

describe('bunyan redis stream', function() {
    var logger,
        stream;

    beforeEach(function() {
        stream = new RedisStream({
            client : redis.createClient()
        });

        logger = helpers.getLogger(stream);
    });

    describe('events', function() {
        it('should emit a log event', function(done) {
            stream.once('log', function(entry) {
                assert(entry);

                done();
            });

            logger.info('test');
        });

        it('should emit a logged event', function(done) {
            stream.once('logged', function(entry) {
                assert(entry);

                done();
            });

            logger.info('test');
        });
    });

    it('should successfully serialize circular dependencies', function(done) {
        var circularObj = {};

        circularObj.circularRef = circularObj;

        stream.once('logged', function(entry) {
            assert.strictEqual(entry.circularRef, entry.circularRef.circularRef);

            done();
        });

        logger.debug(circularObj);
    });

    describe('throw errors', function() {
        it('should throw an error when an invalid type is passed', function() {
            assert.throws(function() {
                /* jshint nonew:false */
                new RedisStream({
                    client : redis.createClient(),
                    type   : 'invalid'
                });
            }, Error);
        });

        it('should throw an error when no client is specified', function() {
            assert.throws(function() {
                /* jshint nonew:false */
                new RedisStream({});
            }, Error);
        });
    });

    possibleTypes.forEach(function(value) {
        it('should not throw an error when type "' + value + '" is passed', function() {
            /* jshint nonew:false */
            new RedisStream({
                client : redis.createClient(),
                type   : value
            });
        });
    });

    it('should have a "write" function with one parameter', function() {
        assert.strictEqual(typeof stream.write, 'function');
        assert.strictEqual(stream.write.length, 1);
    });
});
