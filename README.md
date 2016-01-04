# redis-cache

Simple cache using Redis. It uses Redis' `EXPIRE` command to set key expiry times,
so you don't have to worry about checking cache validity.

All methods return a promise. The module is written in ES2015, but the module's
`package.json` points to the transpiled version, so you can use it in ES5.

This module is designed to be used with [node-redis](https://github.com/NodeRedis/node_redis). `node-redis` is not a
dependency of this module, allowing you more freedom in the way you use it.

# Install

```
npm Install redis-cache-simple
```

# Usage

```js
var RedisCache = require('redis-cache-simple').RedisCache;
var redisClient = require('redis').createClient();

// override the default 'expire' value (in seconds)
var cache = new RedisCache(redisClient, { 'expire': 300 });

// Setting a key
cache.set('some-key', 'some value').then(function() {
	console.log('Key set');
});

// Getting a key
// Note: You can also use get(). It is identical
cache.fetch('some-key').then(function(value) {
	console.log('Key value: %s', value);
});
```

The default options are as follows:

```js
var DEFAULT_OPTIONS = {
	'expire': 60 * 60, // 1hr
	'json': true,
	'rejectOnNull': false,
	'prefix': null
};
```

* `expire`: The key expiry time in seconds
* `json`: If `true`, stringify and parse JSON values
* `rejectOnNull`: If `true`, rejects instead of resolves on `null` values from `fetch()`
* `prefix`: An optional string to prefix all keys with

## Methods

### `RedisCache.fetch(key)` and `RedisCache.get(key)`

__fetch() is exactly the same as get()__

Fetches (gets) a key by its name from the cache.

```js
cache.fetch('some-key')
	.then(function(value) {
		// do something with the value
	}).
```

### `RedisCache.set(key, value, options = {})`

Sets a key in the cache. `options` can be any of the accepted options and will
override said option for this call only.

```js
cache.set('some-key', 'some-value')
	.then(function() {
		// key set
	})
	.catch(function(err) {
		// something went wrong when setting the key
	});
```

### `RedisCache.del(key)`

Deletes a key from the cache.

```js
cache.del('some-key')
	.then(function(reply) {
		// reply = the number of keys that were removed
	})
	.catch(function(err) {
		// something went wrong when removing the key
	});
```

### `RedisCache.ttl(key)`

Get the remaining Time-To-Live (TTL) for the key. If `options.rejectOnNull` is
`true`, the promise will be rejected if the key does not exist.

```js
cache.ttl('some-key')
	.then(function(ttl) {
		// tll in seconds
		// ttl is -1 if key exists but has no expire
	})
	.catch(function(err) {
		// something went wrong when getting the key's ttl
	});
```

### `RedisCache.exists(key)`

Returns `true` if the key exists, `false` otherwise.

```js
cache.exists('some-key')
	.then(function(exists) {
		// do something with it
	})
	.catch(function(err) {
		// something went wrong
	});
```

### `RedisCache.expire(key, expire)`

Set the expiry time for a key in the cache. If `expire` is not given, the method
uses `options.expire`.

```js
cache.expire('some-key', 120) // expire after 2 minutes
	.then(function() {
		// it worked
	})
	.catch(function(err) {
		// something went wrong
	});
```

### `RedisCache.persist(key)`

Remove the expiry time on a key, persisting it in the cache.

```js
cache.persist('some-key')
	.then(function() {
		// it worked
	})
	.catch(function(err) {
		// something went wrong
	});
```

### `RedisCache.split(options, useDefaultOptions)`

Returns a new `RedisCache` instance sharing the same Redis client. `options` accepts
all the default options. If `useDefaultOptions` is `true`, the method uses
`RedisCache`'s default options. If `false`, the new instance inherits its options
from this instance.

```js
// override 'expire' and use 'cache's options instead of the default
var cache2 = cache.split({ 'expire': 300 }, false);
```

# Changelog

* v0.0.1 - v0.0.2 - 4 January 2016
  * (0.0.2) Improved readme
  * (0.0.2) Added `RedisCache.split()`
  * (0.0.2) `RedisCache.ttl()` now rejects if `rejectOnNull` is `true` and the key does not exist
  * (0.0.2) Fixed `extend` error
  * (0.0.1) Published on npm
  * (0.0.1) First release

# License

Copyright 2016 Michiel van der Velde.

This software is licensed under [the MIT License](LICENSE).
