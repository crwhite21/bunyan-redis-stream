'use strict';
var bunyan = require('bunyan');

module.exports.getLogger = function getLogger(stream) {
    return bunyan.createLogger({
        name    : 'bunyan-redis',
        streams : [{
            type   : 'raw',
            level  : 'trace',
            stream : stream
        }]
    });
};
