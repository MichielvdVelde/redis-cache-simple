'use strict';

import extend from 'extend';

const DEFAULT_OPTIONS = {
	'expire': 60 * 60, // 1hr
	'json': true,
	'rejectOnNull': false,
	'prefix': null
};

export class RedisCache {
	constructor(client, options = {}) {
		if(!client) throw new Error('redis client required');
		this._client = client;
		this._options = extend({}, DEFAULT_OPTIONS, options);
	}

	/**
	 * Try to parse a JSON value or return the original value
	**/
	_parseJSON(value) {
		try {
			value = JSON.parse(value);
		}
		catch(e) { }
		return value;
	}

	/**
	 * Try to stringify a JSON value or return the original value
	**/
	_stringifyJSON(value) {
		try {
			value = JSON.stringify(value);
		}
		catch(e) { }
		return value;
	}

	/**
	 * Prefixes the key
	**/
	_prefix(key, prefix = this._options.prefix) {
		if(prefix !== null)
			key = prefix + key;
		return key;
	}

	/**
	 * Fetch a key from the cache
	**/
	fetch(key, options = {}) {
		options = extend({}, this._options, options);
		key = this._prefix(key, options.prefix);
		return new Promise((resolve, reject) => {
			this._client.get(key, (err, reply) => {
				if(err) return reject(err);
				if(options.rejectOnNull && reply === null)
					return reject(new Error('reply is null'));
				if(options.json)
					reply = this._parseJSON(reply);
				return resolve(reply);
			});
		});
	}

	/**
	 * Convenience method for fetch()
	**/
	get(key, options = {}) {
		return this.fetch(key, options);
	}

	/**
	 * Set a key in the cache
	**/
	set(key, value, options = {}) {
		options = extend({}, this._options, options);
		key = this._prefix(key, options.prefix);
		return new Promise((resolve, reject) => {
			if(options.json) value = this._stringifyJSON(value);
			this._client.set(key, value, (err, reply) => {
				if(err) return reject(err);
				if(options.expire)
					this._client.expire(key, options.expire);
				return resolve((reply === 'OK') ? true : false);
			});
		});
	}

	/**
	 * Delete a key from the cache
	**/
	del(key) {
		key = this._prefix(key);
		return new Promise((resolve, reject) => {
			this._client.del(key, (err, reply) => {
				if(err) return reject(err);
				return resolve(reply);
			});
		});
	}

  /**
   * Get the Time-To-Live (TTL) for a key
  **/
  ttl(key) {
		key = this._prefix(key);
    return new Promise((resolve, reject) => {
      this._client.ttl(key, (err, reply) => {
        if(err) return reject(err);
				if(this._options.rejectOnNull && reply === -2)
					return reject(new Error('key does not exist'));
        return resolve(reply);
      });
    });
  }

	/**
	 * Check if a key exists
	**/
	exists(key) {
		key = this._prefix(key);
		return new Promise((resolve, reject) => {
			this._client.exists(key, (err, reply) => {
				if(err) return reject(err);
				return resolve((reply === 1) ? true : false);
			});
		});
	}

	/**
	 * Set expiry time on a key
	**/
	expire(key, expire = this._options.expire) {
		key = this._prefix(key);
		return new Promise((resolve, reject) => {
			this._client.expire(key, expire, (err, reply) => {
				if(err) return reject(err);
				return resolve((reply === 1) ? true : false);
			});
		});
	}

	/**
	 * Remove expiry on a key
	**/
	persist(key) {
		key = this._prefix(key);
		return new Promise((resolve, reject) => {
			this._client.persist(key, (err, reply) => {
				if(err) return reject(err);
				return resolve((reply == 1) ? true : false);
			});
		});
	}

	/**
	 * Split the class into a new instance using the same Redis client
	**/
	split(options = {}, useDefaultOptions = false) {
		options = extend({}, (useDefaultOptions) ? DEFAULT_OPTIONS : this._options, options);
		return new RedisCache(this._client, options);
	}
}
