# bunyan-redis-stream
A lightweight Redis stream for Bunyan that can publish to a channel or push to a list.

## Installation
```bash
npm install bunyan-redis-stream
```

## Usage
### node_redis
```javascript
var bunyan = require('bunyan'),
    redis = require('redis'),
    RedisStream = require('bunyan-redis-stream'),
    client = redis.createClient();

var stream = new RedisStream({
  client : client,
  key    : 'logs',
  type   : 'channel'
});

var logger = bunyan.createLogger({
  name: 'bunyan-redis-stream',
  streams: [{
    type   : 'raw',
    level  : 'trace',
    stream : stream
  }]
});
```

### ioredis
```javascript
var bunyan = require('bunyan'),
    Redis = require('ioredis'),
    RedisStream = require('bunyan-redis-stream'),
    client = new Redis();

var stream = new RedisStream({
  client : client,
  key    : 'logs',
  type   : 'channel'
});

var logger = bunyan.createLogger({
  name: 'bunyan-redis-stream',
  streams: [{
    type   : 'raw',
    level  : 'trace',
    stream : stream
  }]
});
```

## Params
| Name           | Type   | Description                                                                      |
|----------------|--------|----------------------------------------------------------------------------------|
| client         | object | Redis client instance                                                            |
| [key=logs]     | string | Name of Redis list or channel to use                                             |
| [type=channel] | string | Method used in which to store log messages in Redis. Either `list` or `channel`. |

## Running Tests
### General
```bash
npm test
```

### Integration
Integration tests assume that a Redis server is running locally on port 6379 with no auth.

```bash
npm run integration
```
