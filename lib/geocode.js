'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Reverse geocode
 * @param {Numbrer[]} point - Point.
 * @param {Object} [options]
 * @param {Number} [options.seq] - Sequence number.
 * @param {String} [options.lang] - Language.
 * @param {Function} [callback]
 * @param {Function} [errorCallback]
 * @return {Promise}
 */
function geocode(point, options, _callback, _errorCallback) {
    var promise = void 0;
    var cb_resolve = void 0,
        cb_reject = void 0;

    var addr = _settings2.default.GEOCODEHOST;
    addr += "?point=" + +point[0] + ',' + +point[1];

    if (typeof options == "function") {
        _errorCallback = _callback;
        _callback = options;
        options = {};
    }

    options = _extends({
        lang: 'en',
        seq: 0
    }, options || {});

    if (options.seq) {
        addr += '&seq=' + +options.seq;
    }
    if (options.lang) {
        addr += '&lng=' + options.lang;
    }

    if (typeof Promise != 'undefined') {
        promise = new Promise(function (resolve, reject) {
            cb_resolve = resolve;
            cb_reject = reject;
        });
    } else {
        cb_resolve = cb_reject = function cb_reject() {};
    }

    var callback = function callback(geojson) {
        cb_resolve(geojson);
        _callback && _callback(geojson);
    };

    var errorCallback = function errorCallback(geojson) {
        cb_reject(geojson);
        _errorCallback && _errorCallback(geojson);
    };

    _settings2.default.load(addr, function (json) {
        return callback(json);
    }, function (err) {
        return errorCallback(err);
    });

    return promise;
}

exports.default = geocode;