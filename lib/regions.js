'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _nextTick = require('./utils/nextTick');

var _nextTick2 = _interopRequireDefault(_nextTick);

var _recombine = require('./utils/recombine');

var _recombine2 = _interopRequireDefault(_recombine);

var _setupGeometry = require('./utils/setupGeometry');

var _setupGeometry2 = _interopRequireDefault(_setupGeometry);

var _geocode = require('./geocode');

var _geocode2 = _interopRequireDefault(_geocode);

var _google = require('./collections/google');

var _google2 = _interopRequireDefault(_google);

var _yandex = require('./collections/yandex');

var _yandex2 = _interopRequireDefault(_yandex);

var _leaflet = require('./collections/leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * OSMeRegions JavaScript Library
 * http://data.esosedi.org/regions/
 * https://github.com/esosedi/regions
 *
 * @author Anton Korzunov <kashey@yandex-team.ru>
 * Released under the MIT license
 */

var assertData = function assertData(errorCallback, data) {
    if (!data || data.error) {
        errorCallback("wrong data", data.error);
    }
    return data;
};

/**
 * @name osmeRegions
 * @type Object
 */
var osmeRegions = /** @lends osmeRegions */{
    /**
     * override data host
     * @param host
     */
    setHost: function setHost(host) {
        _settings2.default.HOST = host;
    },

    /**
     * @param {Boolean} debug
     */
    setDebug: function setDebug(debug) {
        _settings2.default.DEBUG = Boolean(debug);
    },

    /**
     * allow recombination
     * @param regionsData
     * @param {Object} query
     * @param {Function} query.filter
     * @function
     */
    recombine: _recombine2.default,

    /**
     * Loads GeoJSON from default host
     * @param {String} region OSMRelationId,ISO3166-2 code or world's region name(Asia, Europe etc) or absolute URL.
     * @param {Object} options
     * @param {String} [options.lang='en'] Language (en,de,ru).
     * @param {Number} [options.quality=0] Quality. 0 for fullHD resolution. -1,0,+1,+2 for /4, x1, x4, x16 quality.
     * @param {String} [options.type=''] Type of data. Can be empty or 'coast' (unstable mode).
     * @param {Boolean} [options.nocache] Turns off internal cache.
     * @param {Function} [options.postFilter] filtering function.
     * @param {String|Object} [options.recombine] recombination function.
     * @param {Object} [options.scheme] another recombination function.
     * @param {Function) [callback]
     * @param {Function) [errorCallback]
     * @return {Promise}
     */
    geoJSON: function geoJSON(region, options, _callback, _errorCallback) {
        var _this = this;

        var promise = void 0;
        var cb_resolve = void 0,
            cb_reject = void 0;
        options = options || {};

        if (typeof options == "function") {
            throw new Error('callback must be at third place');
        }

        var lang = options.lang || 'en',
            addr = lang + '_' + region;

        if (typeof Promise != 'undefined') {
            promise = new Promise(function (resolve, reject) {
                cb_resolve = resolve;
                cb_reject = reject;
            });
        } else {
            cb_resolve = cb_reject = function cb_reject() {};
        }
        var callback = function callback(geojson, data) {
            _settings2.default.cache[addr] = data;
            cb_resolve(geojson, data);
            _callback && _callback(geojson, data);
        };

        var errorCallback = function errorCallback(geojson) {
            cb_reject(geojson);
            _errorCallback && _errorCallback(geojson);
        };

        if ((region + "").indexOf('http') === 0) {
            addr = region;
        } else {
            addr = (options.host || _settings2.default.HOST) + '?lang=' + addr;
            if (options.quality) {
                addr += '&q=' + (options.quality + 1);
            }
            if (options.type) {
                addr += '&type=' + options.type;
            }
        }
        if (!_settings2.default.cache[addr] || options.nocache) {
            this.loadData(addr, function (data) {
                (0, _nextTick2.default)(callback, [assertData(errorCallback, _this.parseData(data, options)), data]);
            }, errorCallback);
        } else {
            var data = _settings2.default.cache[addr];
            (0, _nextTick2.default)(callback, [assertData(errorCallback, this.parseData(data, options)), data]);
        }

        return promise;
    },

    /**
     * overloadable data transfer function
     */
    loadData: function loadData(path, callback, errorCallback) {
        return _settings2.default.load(path, callback, errorCallback);
    },

    /**
     * parse default data format
     * @param {String} data
     * @returns {geoJSON}
     */
    parseData: function parseData(data, options) {
        if (!data.meta) {
            return {
                error: data.error
            };
        }
        return {
            type: "FeatureCollection",
            features: (0, _setupGeometry2.default)(data, options),
            metaData: data.meta
        };
    },

    /**
     * drops internal cache
     */
    dropCache: function dropCache() {
        _settings2.default.cache = {};
    },

    _setCoordOrder: function _setCoordOrder(order) {
        _settings2.default.latLongOrder = order == 'latlong';
    },

    /**
     * convert geoJSON to YMAPS collection
     * @param geoJson
     * @param [ym21] - Maps API namespace
     * @returns {osmeMapCollection}
     */
    toYandex: _yandex2.default,

    /**
     * converts GeoJSON to Google.data object
     * @param geoJson
     * @param maps
     * @returns {osmeMapCollection}
     */
    toGoogle: _google2.default,

    /**
     * converts GeoJSON to Leaflet object
     * @param geoJson
     * @param L
     * @returns {osmeMapCollection}
     */
    toLeaflet: _leaflet2.default,

    /**
     * Reverse geocode
     * @param {Numbrer[]} point - Point.
     * @param {Object} [options]
     * @param {Number} [options.seq] - Sequence number.
     * @param {String} [options.lang] - Language.
     * @param {Function} callback
     * @param {Function} [errorcallback]
     */
    geocode: _geocode2.default
};

exports.default = osmeRegions;