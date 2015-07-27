'use strict';
var assert = require('assert'),
    redis = require('redis'),
    IORedis = require('ioredis'),
    helpers = require(__dirname + '/helpers'),
    RedisStream = require(__dirname + '/../');

describe('bunyan redis stream - integration', function() {
    var clients = {
            redis   : redis.createClient(),
            ioredis : new IORedis()
        },
        subscribeClients = {
            redis   : redis.createClient(),
            ioredis : new IORedis()
        };

    describe('channel', function() {
        var streams = [
                new RedisStream({
                    client : clients.redis,
                    key    : 'redis',
                    type   : 'channel'
                }),
                new RedisStream({
                    client : clients.ioredis,
                    key    : 'ioredis',
                    type   : 'channel'
                })
            ],
            loggers = [{
                name   : 'redis',
                key    : 'redis',
                client : clients.redis,
                stream : streams[0],
                logger : helpers.getLogger(streams[0])
            }, {
                name   : 'ioredis',
                key    : 'ioredis',
                client : clients.ioredis,
                stream : streams[1],
                logger : helpers.getLogger(streams[1])
            }];

        loggers.forEach(function(logger) {
            describe(logger.name, function() {
                before(function(done) {
                    subscribeClients[logger.name].subscribe(logger.key, function() {
                        done();
                    });
                });

                afterEach(function() {
                    logger.client.flushall();
                });

                it('should publish a message to the correct channel', function(done) {
                    subscribeClients[logger.name].once('message', function(channel) {
                        assert.strictEqual(channel, logger.name);
                        done();
                    });
                    logger.logger.info('test');
                });
                it('should publish a message with the correct msg property value', function(done) {
                    subscribeClients[logger.name].once('message', function(channel, message) {
                        message = JSON.parse(message);
                        assert.strictEqual(message.msg, 'test');
                        done();
                    });
                    logger.logger.info('test');
                });
                it('should publish a message with the correct level property value', function(done) {
                    subscribeClients[logger.name].once('message', function(channel, message) {
                        message = JSON.parse(message);
                        assert.strictEqual(message.level, 30);
                        done();
                    });
                    logger.logger.info('test');
                });
            });
        });
    });

    describe('list', function() {
        var streams = [
                new RedisStream({
                    client : clients.redis,
                    key    : 'redis',
                    type   : 'list'
                }),
                new RedisStream({
                    client : clients.ioredis,
                    key    : 'ioredis',
                    type   : 'list'
                })
            ],
            loggers = [{
                name   : 'redis',
                key    : 'redis',
                client : clients.redis,
                stream : streams[0],
                logger : helpers.getLogger(streams[0])
            }, {
                name   : 'ioredis',
                key    : 'ioredis',
                client : clients.ioredis,
                stream : streams[1],
                logger : helpers.getLogger(streams[1])
            }];

        loggers.forEach(function(logger) {
            describe(logger.name, function() {
                afterEach(function() {
                    logger.client.flushall();
                });

                it('should push a message to the correct list', function(done) {
                    logger.stream.once('logged', function() {
                        logger.client.blpop(logger.key, 0, function(error, value) {
                            assert(value);
                            done();
                        });
                    });
                    logger.logger.info('test');
                });
                it('should push a message with the correct msg property value', function(done) {
                    logger.stream.once('logged', function() {
                        logger.client.blpop(logger.key, 0, function(error, value) {
                            value = JSON.parse(value[1]);
                            assert.strictEqual(value.msg, 'test');
                            done();
                        });
                    });
                    logger.logger.info('test');
                });
                it('should push a message with the correct level property value', function(done) {
                    logger.stream.once('logged', function() {
                        logger.client.blpop(logger.key, 0, function(error, value) {
                            value = JSON.parse(value[1]);
                            assert.strictEqual(value.level, 30);
                            done();
                        });
                    });
                    logger.logger.info('test');
                });
            });
        });
    });
});
