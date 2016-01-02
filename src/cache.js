'use strict';

import { default as extend } from 'extend';

const DEFAULT_OPTIONS = {
	'expire': 60 * 60, // 1hr
	'json': true,
	'rejectOnNull': false
};


export class RedisCache {
	constructor(client, options = {}) {
		this._client = client;
		this._options = extend(true, DEFAULT_OPTIONS, options);
	}

	/**
	 * Try to parse a JSON value or return the original value
	**/
	_parseJSON(value) {
		try {
			value = JSON.parse(value);
		}
		catch(e) { }
		finally {
			return value;
		}
	}

	/**
	 * Try to stringify a JSON value or return the original value
	**/
	_stringifyJSON(value) {
		try {
			value = JSON.stringify(value);
		}
		catch(e) { }
		finally {
			return value;
		}
	}

	/**
	 * Fetch a key from the cache
	**/
	fetch(key, options = {}) {
		options = extend(true, this._options, options);
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
	 * Set a key in the cache
	**/
	set(key, value, options = {}) {
		options = extend(true, this._options, options);
		return new Promise(function(resolve, reject) {
			if(options.json)
				value = this._stringifyJSON(value);
			this._client.set(key, value, (err, reply) => {
				if(err) return reject(err);
				if(options.expire)
					this._client.expire(key, options.expire);
				return resolve(reply);
			});
		});
	}

	/**
	 * Delete a key from the cache
	**/
	del(key) {
		return new Promise(function(resolve, reject) {
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
    return new Promise((resolve, reject) => {
      this._client.ttl(key, (err, reply) => {
        if(err) return reject(err);
        return resolve(reply);
      });
    });
  }

	/**
	 * Check if a key exists
	**/
	exists(key) {
		return new Promise((resolve, reject) => {
			this._client.exists(key, (err, reply) => {
				if(err) reject(err);
				return resolve((reply === 1) ? true : false);
			});
		});
	}
}
