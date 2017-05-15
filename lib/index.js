'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regions = require('./regions.js');

var _regions2 = _interopRequireDefault(_regions);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window === 'undefined') {
    var http = require('http');
    // Overload load method
    _settings2.default.load = function (path, callback, errorCallback) {
        try {
            http.get(path, function (response) {
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                response.on('end', function () {
                    try {
                        var response = JSON.parse(body);
                        callback(response);
                    } catch (e) {
                        errorCallback(e);
                    }
                    body = '';
                });
            }).on('error', function (e) {
                errorCallback(e);
            });
        } catch (e) {
            errorCallback(e);
        }
    };
} else {
    window.osmeRegions = _regions2.default;
}

exports.default = _regions2.default;