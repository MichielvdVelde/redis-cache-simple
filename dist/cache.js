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
	'rejectOnNull': false
};

var RedisCache = exports.RedisCache = (function () {
	function RedisCache(client) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, RedisCache);

		this._client = client;
		this._options = (0, _extend2.default)(true, DEFAULT_OPTIONS, options);
	}

	/**
  * Try to parse a JSON value or return the original value
 **/

	_createClass(RedisCache, [{
		key: '_parseJSON',
		value: function _parseJSON(value) {
			try {
				value = JSON.parse(value);
			} catch (e) {} finally {
				return value;
			}
		}

		/**
   * Try to stringify a JSON value or return the original value
  **/

	}, {
		key: '_stringifyJSON',
		value: function _stringifyJSON(value) {
			try {
				value = JSON.stringify(value);
			} catch (e) {} finally {
				return value;
			}
		}

		/**
   * Fetch a key from the cache
  **/

	}, {
		key: 'fetch',
		value: function fetch(key) {
			var _this = this;

			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			options = (0, _extend2.default)(true, this._options, options);
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
   * Set a key in the cache
  **/

	}, {
		key: 'set',
		value: function set(key, value) {
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			options = (0, _extend2.default)(true, this._options, options);
			return new Promise(function (resolve, reject) {
				var _this2 = this;

				if (options.json) value = this._stringifyJSON(value);
				this._client.set(key, value, function (err, reply) {
					if (err) return reject(err);
					if (options.expire) _this2._client.expire(key, options.expire);
					return resolve(reply);
				});
			});
		}

		/**
   * Delete a key from the cache
  **/

	}, {
		key: 'del',
		value: function del(key) {
			return new Promise(function (resolve, reject) {
				this._client.del(key, function (err, reply) {
					if (err) return reject(err);
					return resolve(reply);
				});
			});
		}
	}]);

	return RedisCache;
})();