'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RedisCache = undefined;

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_OPTIONS = {
	'expire': 60 * 60, // 1hr
	'json': true,
	'rejectOnNull': false,
	'prefix': null
};

var RedisCache = (function () {
	function RedisCache(client) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, RedisCache);

		if (!client) throw new Error('redis client required');
		this._client = client;
		this._options = (0, _extend2.default)({}, DEFAULT_OPTIONS, options);
	}

	/**
  * Try to parse a JSON value or return the original value
 **/

	_createClass(RedisCache, [{
		key: '_parseJSON',
		value: function _parseJSON(value) {
			try {
				value = JSON.parse(value);
			} catch (e) {}
			return value;
		}

		/**
   * Try to stringify a JSON value or return the original value
  **/

	}, {
		key: '_stringifyJSON',
		value: function _stringifyJSON(value) {
			try {
				value = JSON.stringify(value);
			} catch (e) {}
			return value;
		}

		/**
   * Prefixes the key
  **/

	}, {
		key: '_prefix',
		value: function _prefix(key) {
			var prefix = arguments.length <= 1 || arguments[1] === undefined ? this._options.prefix : arguments[1];

			if (prefix !== null) key = prefix + key;
			return key;
		}

		/**
   * Fetch a key from the cache
  **/

	}, {
		key: 'fetch',
		value: function fetch(key) {
			var _this = this;

			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			options = (0, _extend2.default)({}, this._options, options);
			key = this._prefix(key, options.prefix);
			return new Promise(function (resolve, reject) {
				_this._client.get(key, function (err, reply) {
					if (err) return reject(err);
					if (options.rejectOnNull && reply === null) return reject(new Error('reply is null'));
					if (options.json) reply = _this._parseJSON(reply);
					return resolve(reply);
				});
			});
		}

		/**
   * Convenience method for fetch()
  **/

	}, {
		key: 'get',
		value: function get(key) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return this.fetch(key, options);
		}

		/**
   * Set a key in the cache
  **/

	}, {
		key: 'set',
		value: function set(key, value) {
			var _this2 = this;

			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			options = (0, _extend2.default)({}, this._options, options);
			key = this._prefix(key, options.prefix);
			return new Promise(function (resolve, reject) {
				if (options.json) value = _this2._stringifyJSON(value);
				_this2._client.set(key, value, function (err, reply) {
					if (err) return reject(err);
					if (options.expire) _this2._client.expire(key, options.expire);
					return resolve(reply === 'OK' ? true : false);
				});
			});
		}

		/**
   * Delete a key from the cache
  **/

	}, {
		key: 'del',
		value: function del(key) {
			var _this3 = this;

			key = this._prefix(key);
			return new Promise(function (resolve, reject) {
				_this3._client.del(key, function (err, reply) {
					if (err) return reject(err);
					return resolve(reply);
				});
			});
		}

		/**
   * Get the Time-To-Live (TTL) for a key
  **/

	}, {
		key: 'ttl',
		value: function ttl(key) {
			var _this4 = this;

			key = this._prefix(key);
			return new Promise(function (resolve, reject) {
				_this4._client.ttl(key, function (err, reply) {
					if (err) return reject(err);
					if (_this4._options.rejectOnNull && reply === -2) return reject(new Error('key does not exist'));
					return resolve(reply);
				});
			});
		}

		/**
   * Check if a key exists
  **/

	}, {
		key: 'exists',
		value: function exists(key) {
			var _this5 = this;

			key = this._prefix(key);
			return new Promise(function (resolve, reject) {
				_this5._client.exists(key, function (err, reply) {
					if (err) return reject(err);
					return resolve(reply === 1 ? true : false);
				});
			});
		}

		/**
   * Set expiry time on a key
  **/

	}, {
		key: 'expire',
		value: function expire(key) {
			var _this6 = this;

			var _expire = arguments.length <= 1 || arguments[1] === undefined ? this._options.expire : arguments[1];

			key = this._prefix(key);
			return new Promise(function (resolve, reject) {
				_this6._client.expire(key, _expire, function (err, reply) {
					if (err) return reject(err);
					return resolve(reply === 1 ? true : false);
				});
			});
		}

		/**
   * Remove expiry on a key
  **/

	}, {
		key: 'persist',
		value: function persist(key) {
			var _this7 = this;

			key = this._prefix(key);
			return new Promise(function (resolve, reject) {
				_this7._client.persist(key, function (err, reply) {
					if (err) return reject(err);
					return resolve(reply == 1 ? true : false);
				});
			});
		}

		/**
   * Split the class into a new instance using the same Redis client
  **/

	}, {
		key: 'split',
		value: function split() {
			var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var useDefaultOptions = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			options = (0, _extend2.default)({}, useDefaultOptions ? DEFAULT_OPTIONS : this._options, options);
			return new RedisCache(this._client, options);
		}
	}]);

	return RedisCache;
})();

exports.RedisCache = RedisCache;