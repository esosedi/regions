(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.osme = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _regions = require("./regions.js");

var _regions2 = _interopRequireDefault(_regions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _regions2.default;
},{"./regions.js":6}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _buildIdTable = require('../utils/buildIdTable');

var _buildIdTable2 = _interopRequireDefault(_buildIdTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styleToGoogle(style) {
    var ret = {};
    if ('strokeWidth' in style) {
        ret.strokeWeight = style.strokeWidth;
    }
    if ('fillColor' in style) {
        ret.fillColor = style.fillColor;
    }
    if ('strokeColor' in style) {
        ret.strokeColor = style.strokeColor;
    }
    if ('strokeOpacity' in style) {
        ret.strokeOpacity = Math.max(0.001, style.strokeOpacity);
    }
    if ('fillOpacity' in style) {
        ret.fillOpacity = Math.max(0.001, style.fillOpacity);
    }
    return ret;
}

function toGoogle(geoJson, maps) {
    // use google.data
    var idTable = (0, _buildIdTable2.default)(geoJson),
        collection = new (maps || window.google.maps).Data();
    collection.addGeoJson(geoJson);

    return {
        collection: collection,
        add: function add(map) {
            collection.setMap(map);
        },
        remove: function remove() {
            collection.setMap(null);
        },
        setStyles: function setStyles(fn) {
            collection.setStyle(function (object) {
                return styleToGoogle(fn(idTable[object.getProperty('osmId')], object));
            });
        },
        /**
         * @param {String} eventName
         * @param {Function} callback
         * @param {Object} [ctx]
         */
        addEvent: function addEvent(eventName, callback, ctx) {
            collection.addListener(eventName, function (event) {
                var target = event.feature;
                callback.call(ctx, idTable[target.getProperty('osmId')], [eventName, 'google'], target, event);
            });
        },
        removeEvent: function removeEvent(event) {
            collection.removeListener(event);
        }
    };
}

exports.default = toGoogle;
},{"../utils/buildIdTable":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _buildIdTable = require('../utils/buildIdTable');

var _buildIdTable2 = _interopRequireDefault(_buildIdTable);

var _shortestPath = require('../utils/shortestPath');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styleToLeaflet(style) {
    var ret = {};
    if ('strokeWidth' in style) {
        ret.weight = style.strokeWidth;
    }
    if ('fillColor' in style) {
        ret.fillColor = style.fillColor;
    }
    if ('strokeColor' in style) {
        ret.color = style.strokeColor;
    }
    if ('strokeOpacity' in style) {
        ret.opacity = Math.max(0.001, style.strokeOpacity);
    }
    if ('fillOpacity' in style) {
        ret.fillOpacity = Math.max(0.001, style.fillOpacity);
    }
    return ret;
}

function toLeaflet(baseGeoJson, _L) {

    var Leaflet = _L || window.L;

    // impliment unbounded coordinates
    var geoJson = _extends({}, baseGeoJson, {
        features: baseGeoJson.features.map(function (feature) {
            return _extends({}, feature, {
                geometry: _extends({}, feature.geometry, {
                    coordinates: (0, _shortestPath.getShortestContour)(feature.geometry.coordinates)
                })
            });
        })
    });

    var idTable = (0, _buildIdTable2.default)(geoJson),
        features = [],
        collection = Leaflet.geoJSON(geoJson, {
        onEachFeature: function onEachFeature(feature) {
            return features.push(feature);
        }
    });

    return {
        collection: collection,
        add: function add(map) {
            collection.addTo(map);
        },
        remove: function remove() {
            collection.remove();
        },
        setStyles: function setStyles(fn) {
            features.forEach(function (feature) {
                return feature.setStyle(styleToLeaflet(fn(idTable[feature.properties.osmId], feature)));
            });
        },
        /**
         * @param {String} eventName
         * @param {Function} callback
         * @param {Object} [ctx]
         */
        addEvent: function addEvent(eventName, callback, ctx) {
            features.forEach(function (feature) {
                feature.addEventListener(eventName, function (event) {
                    var target = feature;
                    callback.call(ctx, idTable[target.properties.osmId], [eventName, 'leaflet'], target, event);
                });
            });
        },
        removeEvent: function removeEvent(event) {
            features.forEach(function (feature) {
                feature.removeEventListener(event);
            });
        }
    };
}

exports.default = toLeaflet;
},{"../utils/buildIdTable":8,"../utils/shortestPath":17}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _buildIdTable = require('../utils/buildIdTable');

var _buildIdTable2 = _interopRequireDefault(_buildIdTable);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _convertCoordinate = require('../utils/convertCoordinate');

var _convertCoordinate2 = _interopRequireDefault(_convertCoordinate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styleToYandex(style) {
    return style;
}

function toYandex(geoJson, ym21) {
    var ymaps = ym21 || window.ymaps;
    var collection = new ymaps.GeoObjectCollection(),
        dataset = geoJson.features,
        idTable = (0, _buildIdTable2.default)(geoJson);

    for (var i = 0, l = dataset.length; i < l; ++i) {
        var line = dataset[i];
        if (line.geometry) {
            collection.add(new ymaps.GeoObject(_settings2.default.latLongOrder ? line : (0, _convertCoordinate2.default)(line), {
                simplificationFixedPoints: line.geometry.fixedPoints
            }));
        } else {
            // window.console && console.error('osme line fail', line); // JFYI
        }
    }
    return {
        collection: collection,
        add: function add(map) {
            map.geoObjects.add(collection);
        },
        remove: function remove() {
            collection.setParent(null);
        },
        setStyles: function setStyles(fn) {
            collection.each(function (object) {
                object.options.set(styleToYandex(fn(idTable[object.properties.get('osmId')], object)));
            });
        },
        /**
         * @param {String|Array.<String>} eventName
         * @param {Function} callback
         * @param {Object} [ctx]
         */
        addEvent: function addEvent(eventName, callback, ctx) {
            collection.events.add(eventName, function (event) {
                var target = event.get('target');
                callback.call(ctx, idTable[target.properties.get('osmId')], [eventName, 'yandex'], target, event);
            });
        },
        removeEvent: function removeEvent(event) {
            collection.events.remove(event);
        }
    };
}

exports.default = toYandex;
},{"../settings":7,"../utils/buildIdTable":8,"../utils/convertCoordinate":9}],5:[function(require,module,exports){
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
},{"./settings":7}],6:[function(require,module,exports){
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
     * @param {Function} [callback]
     * @param {Function} [errorCallback]
     * @return {Promise}
     */
    geoJSON: function geoJSON(region, options, _callback, _errorCallback) {
        var _this = this;

        var promise = void 0;
        var cb_resolve = void 0,
            cb_reject = void 0;
        options = options || {};

        if (typeof options === "function") {
            throw new Error('callback must be at third place');
        }

        var lang = options.lang || 'en',
            addr = typeof region === 'string' ? lang + '_' + region : null;

        if (typeof Promise !== 'undefined') {
            promise = new Promise(function (resolve, reject) {
                cb_resolve = resolve;
                cb_reject = reject;
            });
        } else {
            cb_resolve = cb_reject = function cb_reject() {};
        }
        var callback = function callback(geojson, data) {
            if (addr) {
                _settings2.default.cache[addr] = data;
            }
            cb_resolve(geojson, data);
            _callback && _callback(geojson, data);
        };

        var errorCallback = function errorCallback(geojson) {
            cb_reject(geojson);
            _errorCallback && _errorCallback(geojson);
        };

        if (addr) {
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
        } else {
            (0, _nextTick2.default)(callback, [assertData(errorCallback, this.parseData(region, options)), region]);
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
     * @param {Number[]} point - Point.
     * @param {Object} [options]
     * @param {Number} [options.seq] - Sequence number.
     * @param {String} [options.lang] - Language.
     * @param {Function} callback
     * @param {Function} [errorcallback]
     */
    geocode: _geocode2.default
};

exports.default = osmeRegions;
},{"./collections/google":2,"./collections/leaflet":3,"./collections/yandex":4,"./geocode":5,"./settings":7,"./utils/nextTick":13,"./utils/recombine":14,"./utils/setupGeometry":16}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _load_native = require('./utils/load_native');

var _load_native2 = _interopRequireDefault(_load_native);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = {
   HOST: window.location.protocol === 'https:' ? 'https://osme.geolocated.org/regions/v1/' : 'http://data.esosedi.org/regions/v1/',
   GEOCODEHOST: 'http://data.esosedi.org/geocode/v1',
   DEBUG: false,
   cache: {},

   latLongOrder: 0,

   load: _load_native2.default
};

exports.default = settings;
},{"./utils/load_native":12}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function buildIdTable(geoJson) {
    var ret = {},
        features = geoJson.features;
    for (var i = 0, l = features.length; i < l; ++i) {
        var feature = features[i];
        if (feature && feature.properties) {
            ret[feature.properties.osmId] = feature;
        }
    }

    return ret;
}

exports.default = buildIdTable;
},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function flipa(a) {
    var b = [];
    for (var i = 0, l = a.length; i < l; ++i) {
        b[i] = [a[i][1], a[i][0]];
    }
    return b;
}

function flip(a) {
    var b = [];
    for (var i = 0, l = a.length; i < l; ++i) {
        b[i] = flipa(a[i]);
    }
    return b;
}

function convertCoordinate(feature) {
    return {
        type: "Feature",
        geometry: {
            type: 'Polygon',
            fillRule: feature.geometry.coordinates.length > 1 ? 'evenOdd' : 'nonZero',
            coordinates: flip(feature.geometry.coordinates)
        },
        properties: feature.properties
    };
}

exports.default = convertCoordinate;
},{}],10:[function(require,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var codingCoefficient = 1 / 1000000,
    fraction = 2,
    dividor = 1 / 0xFFFF; // target resolution 65k, real 4k

/**
 * coordinateDecode
 * partof Yandex.Maps.API
 */
function decodeByteVector(x, N) {
    var point = 0;
    for (var i = 0; i < N; ++i) {
        point |= x.charCodeAt(i) << i * 8;
    }
    return point;
}

function clampx(x) {
    return Math.min(180, Math.max(-180, x));
}

function clampy(y) {
    return Math.min(85, Math.max(-85, y));
}

function fromBase64(input) {
    input = input.replace(/_/g, '/').replace(/-/g, '+');
    if (typeof atob != "undefined") {
        return atob(input);
    } else {
        return new Buffer(input, 'base64').toString('binary');
    }
}

function decodeLineBlock(encodedCoordinates) {
    var byteVector = fromBase64(encodedCoordinates),
        byteVectorLength = byteVector.length,
        bounds = [[decodeByteVector(byteVector.substr(0, 4), 4) * codingCoefficient, decodeByteVector(byteVector.substr(4, 4), 4) * codingCoefficient], [decodeByteVector(byteVector.substr(8, 4), 4) * codingCoefficient, decodeByteVector(byteVector.substr(12, 4), 4) * codingCoefficient]],
        dimension = [bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]],
        result = [],
        index = 16,
        fx = dimension[0] * dividor,
        fy = dimension[1] * dividor;

    function read() {
        var ret = decodeByteVector(byteVector.substr(index, fraction), fraction);
        index += fraction;
        return ret;
    }

    while (index < byteVectorLength) {
        var position = [clampy(read() * fx + bounds[0][0]), clampx(read() * fy + bounds[0][1])];
        result.push([position[1], position[0]]);
    }
    return result;
}

function decodeWay(lineBlock, wayId, osmeData) {
    if (osmeData.wayCache[wayId]) {
        return osmeData.wayCache[wayId];
    }
    return osmeData.wayCache[wayId] = decodeLineBlock(lineBlock);
}

exports.default = decodeWay;
}).call(this,require("buffer").Buffer)
},{"buffer":19}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFixedGeometry = exports.getGeometry = undefined;

var _decoder = require('./decoder');

var _decoder2 = _interopRequireDefault(_decoder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function EQ(first, second, diff) {
    diff = diff || 1e-9;
    var dx = Math.abs(second[0] - first[0]),
        dy = Math.abs(second[1] - first[1]);
    return dx < diff && dy < diff;
}

function fixDegenerate(way, path) {
    var offset = 0,
        l = way.length,
        lp = path.length,
        limit = Math.min(l, lp),
        delta = 10 / 0xFFFF; //10 HOPS
    lp--;
    if (lp < 1) {
        return 0;
    }

    for (var i = 0; i < limit; ++i) {
        if (EQ(way[i], path[lp - i], delta)) {
            offset++;
        } else {
            break;
        }
    }

    return offset;
}

function getGeometry(regionId, osmeData, options) {
    var coordinates = [],
        fixedPoints = [],
        meta = [],
        paths = regionId.length ? regionId : osmeData.paths[regionId],

    //segments = [],
    osmeWays = osmeData.ways;

    options = options || {};

    osmeData.wayCache = osmeData.wayCache || {};

    if (!paths) {
        return false;
    }
    for (var pathId = 0, pathLength = paths.length; pathId < pathLength; ++pathId) {
        var path = paths[pathId];
        var pathCoordinates = [],
            ways = [],
            segmentFixedPoints = [0];
        if (typeof path == 'number') {
            path = [path];
        }
        for (var i = 0, l = path.length; i < l; ++i) {
            var wayId = Math.abs(path[i]);
            var way = (0, _decoder2.default)(osmeWays[wayId], wayId, osmeData);
            if (path[i] < 0) {
                way = way.slice(0);
                way.reverse();
            }
            if (options.fixDegenerate) {
                var offset = fixDegenerate(way, pathCoordinates);
                if (offset) {
                    way = way.slice(offset);
                }
                if (i == l - 1) {
                    var tw = way.slice(0);
                    tw.reverse();
                    offset = fixDegenerate(pathCoordinates, way);
                    if (offset) {
                        offset--;
                        way.length = way.length - offset;
                        pathCoordinates = pathCoordinates.slice(offset);
                    }
                }
            } else {
                // edges have same coordinates
                if (pathCoordinates.length) {
                    pathCoordinates.length = pathCoordinates.length - 1;
                }
            }

            pathCoordinates.push.apply(pathCoordinates, way);
            segmentFixedPoints.push(pathCoordinates.length - 1);
            ways.push(wayId);
        }
        pathCoordinates.push(pathCoordinates[0]);
        coordinates.push(pathCoordinates);
        fixedPoints.push(segmentFixedPoints);
        meta.push(ways);
    }

    return {
        type: 'Polygon',
        fillRule: 'nonZero',
        coordinates: coordinates,
        path: paths,
        fixedPoints: fixedPoints
    };
}

function getFixedGeometry(regionId, osmeData) {
    return getGeometry(regionId, osmeData, { fixDegenerate: true });
}

exports.getGeometry = getGeometry;
exports.getFixedGeometry = getFixedGeometry;
},{"./decoder":10}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Vanilla Ajax data transfer
 * @param {String} path
 * @param {Function} callback
 * @param {Function} errorCallback
 */
function load(path, callback, errorCallback) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", path, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 304) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        callback(response);
                    } catch (e) {
                        errorCallback(e);
                    }
                } else {
                    errorCallback(xhr);
                }
            }
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send();
    } catch (e) {
        errorCallback(e);
    }
}

exports.default = load;
},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function nextTick(callback, args) {
    if (typeof setImmediate != 'undefined') {
        setImmediate(function () {
            callback.apply(this, args);
        });
    } else {
        setTimeout(function () {
            callback.apply(this, args);
        }, 0);
    }
}

exports.default = nextTick;
},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _region = require('./region');

var _region2 = _interopRequireDefault(_region);

var _geometryDecode = require('./geometryDecode');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * recombination
 * @param regionsData
 * @param query
 * @returns {*}
 */
function recombineRegion(regionsData, query) {
    var regions = regionsData.regions,
        inpaths = regionsData.paths,
        passRegions = {},
        paths = [],
        way;

    function filterPath(path) {
        var result = [];
        for (var i = 0, l = path.length; i < l; ++i) {
            if (1 || path[i].length > 1) {
                result.push([path[i]]);
            }
        }
        return result;
    }

    //fill regions and way counter
    for (var ri in regions) {
        if (regions.hasOwnProperty(ri)) {
            var tpaths = inpaths[ri];
            var qf = query.filter((0, _region2.default)(ri, regionsData));
            if (qf) {
                if (qf !== true) {
                    if (qf.path) {
                        tpaths = qf.path;
                    }
                }
                if (tpaths && tpaths.length) {
                    tpaths = filterPath(tpaths);
                    if (tpaths.length) {
                        passRegions[ri] = ri;
                        paths.push.apply(paths, tpaths);
                    }
                }
            }
        }
    }

    function joinPaths(patha, pathb) {

        var usedWays = {},
            wayDirection = {},
            wayLookup = {};

        var apaths = [patha, pathb];
        for (var _ri = 0; _ri < 2; ++_ri) {
            var _tpaths = apaths[_ri];
            for (var pathId = 0, pathLength = _tpaths.length; pathId < pathLength; ++pathId) {
                var path = _tpaths[pathId];
                if (typeof path == 'number') {
                    path = [path];
                }
                for (var i = 0, l = path.length; i < l; ++i) {
                    var _wayId = Math.abs(path[i]);
                    usedWays[_wayId] = (usedWays[_wayId] || 0) + 1;
                }
            }
        }

        var //pass = 0,
        lost = 0;
        for (var _ri2 = 0; _ri2 < 2; ++_ri2) {
            var _tpaths2 = apaths[_ri2];
            for (var _pathId = 0, _pathLength = _tpaths2.length; _pathId < _pathLength; ++_pathId) {
                var _path = _tpaths2[_pathId];
                if (typeof _path == 'number') {
                    _path = [_path];
                }

                for (var _i = 0, _l = _path.length; _i < _l; ++_i) {
                    var wayId = Math.abs(_path[_i]);
                    if (usedWays[wayId] === 1) {
                        //pass++;
                        var lw = +_path[(_i - 1 + _l) % _l],
                            rw = +_path[(_i + 1 + _l) % _l];
                        wayLookup[lw] = wayLookup[lw] || [];
                        wayLookup[lw].push(_path[_i]);
                        wayDirection[_path[_i]] = [+lw, +_path[_i], +rw, _ri2, _pathId];
                    } else {
                        lost++;
                    }
                }
            }
        }
        if (!lost) {
            return false;
        }

        function getWay() {
            for (var i in wayDirection) {
                if (testWay(i)) {
                    return +i;
                }
            }
            return false;
        }

        function testWay(i) {
            return i && wayDirection.hasOwnProperty(i) && wayDirection[i][1];
        }

        // function reverse () {
        //     rpath.reverse();
        //     for (var i = 0, l = rpath.length; i < l; ++i) {
        //         rpath[i] *= -1;
        //     }
        //     ord *= -1;
        //     return rpath;
        // }

        var rpaths = [],
            rpath = [],
            ord = 1;

        function tryJoinWay(rpath, way) {
            if (!wayDirection[way]) {
                return false;
            }
            var lw = ord == -1 ? wayDirection[way][0] : 0,
                rw = ord == +1 ? wayDirection[way][2] : 0;
            if (testWay(rw)) {
                way = rw;
                rpath.push(+way * ord);
            } else if (testWay(lw)) {
                way = lw;
                rpath.push(+way);
            } else {
                // indirect
                var rwset = wayLookup[-wayDirection[way][2]];
                way = 0;
                for (var j in rwset) {
                    rw = rwset[j];
                    if (testWay(rw)) {
                        way = rw;
                        rpath.push(+way);
                        break;
                    }
                }
                if (!way) {
                    return false;
                }
            }
            return way;
        }

        while (false !== (way = getWay())) {
            rpath = [];
            ord = 1;
            rpath.push(+way);
            while (way) {
                wayDirection[way][1] = 0;
                var newWay = tryJoinWay(rpath, way);
                if (!newWay) {
                    break;
                }
                way = newWay;
            }
            rpaths.push(rpath);
        }
        return rpaths;
    }

    paths.sort(function (a, b) {
        return Math.abs(a[0][0]) < Math.abs(b[0][0]);
    });

    var rpath = paths[0],
        skip = { 0: 1 },
        skipCnt = 1,
        rpaths = [],
        l = paths.length,
        freePass = 0,
        joinPass = 0,
        ccx = 0;

    while (skipCnt < l) {
        joinPass = 0;
        for (var i = 1, _l2 = paths.length; i < _l2; ++i) {
            var rid = i % _l2;
            if (!(rid in skip)) {
                var result = joinPaths(rpath, paths[rid]);
                if (result && result.length == 1) {
                    rpath = result;
                    skip[rid] = 1;
                    skipCnt++;
                    joinPass++;
                } else {
                    freePass = rid;
                }
            }
        }
        if (!joinPass) {
            if (freePass) {
                rpaths.push(rpath[0]);
                rpath = paths[freePass];
                skip[freePass] = 1;
                skipCnt++;
            } else {
                break;
            }
        }
        if (ccx++ > 1000) {
            break;
        }
    }

    if (rpath) {
        rpaths.push(rpath[0]);
    }

    return (0, _geometryDecode.getFixedGeometry)(rpaths, regionsData);
}

exports.default = recombineRegion;
},{"./geometryDecode":11,"./region":15}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @name RegionObject
 * @class
 */
var RegionObject = function () {
    function RegionObject(rid, meta, prop, data) {
        _classCallCheck(this, RegionObject);

        /** @member {Number} */
        this.osmId = rid;
        /** @member {Number} */
        this.geoNamesId = prop.geoNamesId;
        /** @member {String} */
        this.iso = prop.iso3166;
        /** @member {Number} */
        this.level = meta.level;
        /** @member {Object} */
        this.properties = prop;

        this._meta = meta;
        this._data = data;
    }

    _createClass(RegionObject, [{
        key: "getBorderWith",
        value: function getBorderWith(id) {
            var wset = {},
                i,
                l1,
                j,
                l2,
                path1 = this._data.paths[id],
                path2 = this._data.paths[this.osmId];
            for (i = 0, l1 = path1.length; i < l1; ++i) {
                for (j = 0, l2 = path1[i].length; j < l2; ++j) {
                    wset[Math.abs(path1[i][j])] = 1;
                }
            }
            var result = [];
            for (i = 0, l1 = path2.length; i < l1; ++i) {
                for (j = 0, l2 = path2[i].length; j < l2; ++j) {
                    if (wset[Math.abs(path2[i][j])]) {
                        // path is full in
                        result.push(path2[i]);
                    }
                }
            }
            return result;
        }
    }, {
        key: "hasBorderWith",
        value: function hasBorderWith(id) {

            var wset = {},
                i,
                l1,
                j,
                l2,
                path1 = this._data.paths[this.osmId],
                path2 = this._data.paths[id];
            if (!path1 || !path2) {
                return false;
            }
            for (i = 0, l1 = path1.length; i < l1; ++i) {
                for (j = 0, l2 = path1[i].length; j < l2; ++j) {
                    wset[Math.abs(path1[i][j])] = 1;
                }
            }
            for (i = 0, l1 = path2.length; i < l1; ++i) {
                for (j = 0, l2 = path2[i].length; j < l2; ++j) {
                    if (wset[Math.abs(path2[i][j])]) {
                        return true;
                    }
                }
            }
            return false;
        }
    }, {
        key: "hasParent",
        value: function hasParent(id) {
            var parents = this._meta.parents;
            for (var i = 0, l = parents.length; i < l; ++i) {
                if (parents[i].id == id) {
                    return true;
                }
            }
            return false;
        }
    }]);

    return RegionObject;
}();

/**
 * wraps region for filter functions
 * @param rid
 * @param data
 * @returns {RegionObject}
 */


function wrapRegion(rid, data) {
    var meta = data.regions[rid],
        prop = meta.property || {};
    return new RegionObject(rid, meta, prop, data);
}

exports.default = wrapRegion;
},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _region = require('./region');

var _region2 = _interopRequireDefault(_region);

var _recombine = require('./recombine');

var _recombine2 = _interopRequireDefault(_recombine);

var _geometryDecode = require('./geometryDecode');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * main decode function
 * @param regionsData
 * @param options
 * @returns {Array}
 */
function setupGeometry(regionsData, options) {
    options = options || {};
    var regions = regionsData.regions,
        dataset = [],
        postFilter = options.postFilter || (regionsData.meta && regionsData.meta.postFilter ? new Function('region', regionsData.meta.postFilter) : 0),
        scheme = options.scheme || regionsData.meta && regionsData.meta.scheme,
        disputedBorders = regionsData.meta && regionsData.meta.disputedBorders || {},
        useSetup = options.recombine || options.lang || 'en',
        disputedBorder = typeof useSetup == 'string' ? disputedBorders[useSetup] : useSetup,
        geometry = 0;

    for (var _i in disputedBorders) {
        var setup = disputedBorders[_i];
        for (var j in setup) {
            var regionSet = setup[j];
            if (typeof regionSet == 'string') {
                setup[j] = new Function('region', regionSet);
            }
        }
    }

    for (var _i2 in regions) {
        if (regions.hasOwnProperty(_i2)) {
            if (!postFilter || postFilter((0, _region2.default)(_i2, regionsData))) {
                if (disputedBorder && disputedBorder[+_i2]) {
                    geometry = (0, _recombine2.default)(regionsData, {
                        filter: disputedBorder[+_i2]
                    });
                } else if (scheme && scheme[+_i2]) {
                    var sch = scheme[+_i2];
                    geometry = (0, _recombine2.default)(regionsData, {
                        filter: typeof sch == 'string' ? new Function('region', sch) : sch
                    });
                } else {
                    geometry = (0, _geometryDecode.getGeometry)(+_i2, regionsData);
                }

                if (geometry) {
                    dataset[regions[_i2].index] = {
                        type: "Feature",
                        geometry: geometry,
                        properties: {
                            osmId: _i2,
                            level: regions[_i2].level,
                            properties: regions[_i2].property || {},
                            parents: regions[_i2].parents,
                            hintContent: regions[_i2].name,
                            name: regions[_i2].name,
                            title: regions[_i2].name,
                            wikipedia: regions[_i2].wikipedia,
                            orderIndex: regions[_i2].index,
                            square: regions[_i2].square
                        }
                    };
                }
            }
        }
    }
    var result = [];
    for (var i = 0, l = dataset.length; i < l; ++i) {
        if (dataset[i]) {
            result.push(dataset[i]);
        }
    }
    return result;
}

exports.default = setupGeometry;
},{"./geometryDecode":11,"./recombine":14,"./region":15}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function getShortestPath(contour) {
    var halfWorld = 180;
    var result = [contour[0]],
        point = contour[0];
    for (var i = 1, l = contour.length; i < l; ++i) {
        var delta = point[0] - contour[i][0];
        if (Math.abs(delta) > halfWorld) {
            delta = delta < 0 ? -360 : 360;
        } else {
            delta = 0;
        }

        var nextPoint = [contour[i][0] + delta, contour[i][1]];
        result.push(nextPoint);
        point = nextPoint;
    }
    return result;
}

var getShortestContour = exports.getShortestContour = function getShortestContour(contour) {
    return contour.map(function (path) {
        return getShortestPath(path);
    });
};

exports.default = getShortestPath;
},{}],18:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],19:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":18,"ieee754":20}],20:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}]},{},[1])(1)
});