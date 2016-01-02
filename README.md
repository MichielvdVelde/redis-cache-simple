# redis-cache

Simple cache using Redis. It uses Redis' `EXPIRE` command to set key expiry times,
so you don't have to worry about checking cache validity.

**Note: Ths code has not been tested yet!**

# Install

_Not published yet_

# Example

```js
const RedisCache = require('redis-cache-simple');
const client = require('redis').createClient();

// These are the default options
let options = {
	'expire': 60 * 60, // in seconds, 1hr
	'json': true,
	'rejectOnNull': false
};

// Create the cache instance
let cache = new RedisCache(client, options);

// Store something in the cache
cache.set('some-key', { 'some': 'data' })
	.then(function(reply) {
		console.log('Reply is', reply);
	})
	.catch(function(err) {
		console.log('Got error:', err.message);
	});

// Now get something from the cache
cache.fetch('some-key')
	.then(function(value) {
		console.log(value);
	})
	.catch(function(err) {
		console.log('Got error', err.message);
	});
```

# Methods

* `cache.set(key, value, options = {})`: Set a key with a value
  * `key`: The key to store the value under
  * `value`: The value to store. If `options.json` is `true`, JSON will be stringified
  * `options`: (Optional) Override any of the options for this call
* `cache.fetch(key, options = {})`: Fetch a value by its key
  * `key`: The key to retrieve
  * `options`: (Optional) Override any of the options for this call
* `cache.del(key)`: Delete a key
  * `key`: The key to delete
* `cache.ttl(key)`: Get the key's time-to-live in seconds
  * `key`: The key to check
* `cache.exists(key)`: Check if a key exists
  * `key`: The key to check

## License

Copyright 2016 Michiel van der Velde.

This software is licensed under [the MIT License](LICENSE).
