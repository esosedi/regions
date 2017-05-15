'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _load_native = require('./utils/load_native');

var _load_native2 = _interopRequireDefault(_load_native);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = {
    HOST: 'http://data.esosedi.org/regions/v1/',
    GEOCODEHOST: 'http://data.esosedi.org/geocode/v1',
    DEBUG: false,
    cache: {},

    latLongOrder: 0,

    load: _load_native2.default
};

exports.default = settings;