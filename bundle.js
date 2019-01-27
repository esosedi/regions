(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _regions = require("./regions.js");

var _regions2 = _interopRequireDefault(_regions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _regions2.default;
},{"./regions.js":7}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buildIdTable = require("../utils/buildIdTable");

var _buildIdTable2 = _interopRequireDefault(_buildIdTable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styleToGoogle(style) {
  var ret = {};
  if ("strokeWidth" in style) {
    ret.strokeWeight = style.strokeWidth;
  }
  if ("fillColor" in style) {
    ret.fillColor = style.fillColor;
  }
  if ("strokeColor" in style) {
    ret.strokeColor = style.strokeColor;
  }
  if ("strokeOpacity" in style) {
    ret.strokeOpacity = Math.max(0.001, style.strokeOpacity);
  }
  if ("fillOpacity" in style) {
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
        return styleToGoogle(fn(idTable[object.getProperty("osmId")], object));
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
        callback.call(ctx, idTable[target.getProperty("osmId")], [eventName, "google"], target, event);
      });
    },
    removeEvent: function removeEvent(event) {
      collection.removeListener(event);
    }
  };
}

exports.default = toGoogle;
},{"../utils/buildIdTable":9}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _buildIdTable = require("../utils/buildIdTable");

var _buildIdTable2 = _interopRequireDefault(_buildIdTable);

var _shortestPath = require("../utils/shortestPath");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styleToLeaflet(style) {
  var ret = {};
  if ("strokeWidth" in style) {
    ret.weight = style.strokeWidth;
  }
  if ("fillColor" in style) {
    ret.fillColor = style.fillColor;
  }
  if ("strokeColor" in style) {
    ret.color = style.strokeColor;
  }
  if ("strokeOpacity" in style) {
    ret.opacity = Math.max(0.001, style.strokeOpacity);
  }
  if ("fillOpacity" in style) {
    ret.fillOpacity = Math.max(0.001, style.fillOpacity);
  }
  return ret;
}

function toLeaflet(baseGeoJson, _L) {
  var Leaflet = _L || window.L;

  // implement unbounded coordinates
  var _geoJson = _extends({}, baseGeoJson, {
    features: baseGeoJson.features.map(function (feature) {
      return _extends({}, feature, {
        geometry: _extends({}, feature.geometry, {
          coordinates: (0, _shortestPath.getShortestContour)(feature.geometry.coordinates)
        })
      });
    })
  });

  var idTable = (0, _buildIdTable2.default)(_geoJson),
      features = [],
      collection = Leaflet.geoJSON(_geoJson, {
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
    geoJson: function geoJson() {
      return _geoJson;
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
          callback.call(ctx, idTable[target.properties.osmId], [eventName, "leaflet"], target, event);
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
},{"../utils/buildIdTable":9,"../utils/shortestPath":18}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _shortestPath = require("../utils/shortestPath");

function toUnboundedGeoJSON(baseGeoJson) {
  return _extends({}, baseGeoJson, {
    features: baseGeoJson.features.map(function (feature) {
      return _extends({}, feature, {
        geometry: _extends({}, feature.geometry, {
          coordinates: (0, _shortestPath.getShortestContour)(feature.geometry.coordinates)
        })
      });
    })
  });
}

exports.default = toUnboundedGeoJSON;
},{"../utils/shortestPath":18}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buildIdTable = require("../utils/buildIdTable");

var _buildIdTable2 = _interopRequireDefault(_buildIdTable);

var _settings = require("../settings");

var _settings2 = _interopRequireDefault(_settings);

var _convertCoordinate = require("../utils/convertCoordinate");

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
        object.options.set(styleToYandex(fn(idTable[object.properties.get("osmId")], object)));
      });
    },
    /**
     * @param {String|Array.<String>} eventName
     * @param {Function} callback
     * @param {Object} [ctx]
     */
    addEvent: function addEvent(eventName, callback, ctx) {
      collection.events.add(eventName, function (event) {
        var target = event.get("target");
        callback.call(ctx, idTable[target.properties.get("osmId")], [eventName, "yandex"], target, event);
      });
    },
    removeEvent: function removeEvent(event) {
      collection.events.remove(event);
    }
  };
}

exports.default = toYandex;
},{"../settings":8,"../utils/buildIdTable":9,"../utils/convertCoordinate":10}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _settings = require("./settings");

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
  addr += "?point=" + +point[0] + "," + +point[1];

  if (typeof options == "function") {
    _errorCallback = _callback;
    _callback = options;
    options = {};
  }

  options = _extends({
    lang: "en",
    seq: 0
  }, options || {});

  if (options.seq) {
    addr += "&seq=" + +options.seq;
  }
  if (options.lang) {
    addr += "&lng=" + options.lang;
  }

  if (typeof Promise != "undefined") {
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
},{"./settings":8}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _settings = require("./settings");

var _settings2 = _interopRequireDefault(_settings);

var _nextTick = require("./utils/nextTick");

var _nextTick2 = _interopRequireDefault(_nextTick);

var _recombine = require("./utils/recombine");

var _recombine2 = _interopRequireDefault(_recombine);

var _setupGeometry = require("./utils/setupGeometry");

var _setupGeometry2 = _interopRequireDefault(_setupGeometry);

var _geocode = require("./geocode");

var _geocode2 = _interopRequireDefault(_geocode);

var _google = require("./collections/google");

var _google2 = _interopRequireDefault(_google);

var _yandex = require("./collections/yandex");

var _yandex2 = _interopRequireDefault(_yandex);

var _leaflet = require("./collections/leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

var _unbounded = require("./collections/unbounded");

var _unbounded2 = _interopRequireDefault(_unbounded);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
/*!
 * OSMeRegions JavaScript Library
 * http://data.esosedi.org/regions/
 * https://github.com/esosedi/regions
 *
 * @author Anton Korzunov <kashey@yandex-team.ru>
 * Released under the MIT license
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
      throw new Error("callback must be at third place");
    }

    var lang = options.lang || "en";
    var addr = typeof region === "string" ? lang + "_" + region : null;

    if (typeof Promise !== "undefined") {
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
      if ((region + "").indexOf("http") === 0) {
        addr = region;
      } else {
        addr = (options.host || _settings2.default.HOST) + "?lang=" + addr;
        if (options.quality) {
          addr += "&q=" + (options.quality + 1);
        }
        if (options.type) {
          addr += "&type=" + options.type;
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
    _settings2.default.latLongOrder = order == "latlong";
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
   * converts GeoJSON to GeoJSON with "unbounded" coordinates
   * @param geoJson
   * @returns {geoJson}
   */
  toUnboundedGeoJSON: _unbounded2.default,

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
},{"./collections/google":2,"./collections/leaflet":3,"./collections/unbounded":4,"./collections/yandex":5,"./geocode":6,"./settings":8,"./utils/nextTick":14,"./utils/recombine":15,"./utils/setupGeometry":17}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _load_native = require("./utils/load_native");

var _load_native2 = _interopRequireDefault(_load_native);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = {
  HOST: typeof window !== "undefined" && window.location.protocol === "https:" ? "https://osme.geolocated.org/regions/v1/" : "http://data.esosedi.org/regions/v1/",
  GEOCODEHOST: "http://data.esosedi.org/geocode/v1",
  DEBUG: false,
  cache: {},

  latLongOrder: 0,

  load: _load_native2.default
};

exports.default = settings;
},{"./utils/load_native":13}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
"use strict";

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
      type: "Polygon",
      fillRule: feature.geometry.coordinates.length > 1 ? "evenOdd" : "nonZero",
      coordinates: flip(feature.geometry.coordinates)
    },
    properties: feature.properties
  };
}

exports.default = convertCoordinate;
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var codingCoefficient = 1 / 1000000,
    fraction = 2,
    dividor = 1 / 0xffff; // target resolution 65k, real 4k

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
  input = input.replace(/_/g, "/").replace(/-/g, "+");
  if (typeof atob !== "undefined") {
    return atob(input);
  } else {
    // hide from webpack
    var B = eval("Buffer");
    return new B(input, "base64").toString("binary");
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
},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFixedGeometry = exports.getGeometry = undefined;

var _decoder = require("./decoder");

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
      delta = 10 / 0xffff; //10 HOPS
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
    if (typeof path == "number") {
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
    type: "Polygon",
    fillRule: "nonZero",
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
},{"./decoder":11}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function nextTick(callback, args) {
  var _this = this;

  Promise.resolve().then(function () {
    return callback.apply(_this, args);
  });
}

exports.default = nextTick;
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _region = require("./region");

var _region2 = _interopRequireDefault(_region);

var _geometryDecode = require("./geometryDecode");

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
        if (typeof path == "number") {
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
        if (typeof _path == "number") {
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
},{"./geometryDecode":12,"./region":16}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _region = require("./region");

var _region2 = _interopRequireDefault(_region);

var _recombine = require("./recombine");

var _recombine2 = _interopRequireDefault(_recombine);

var _geometryDecode = require("./geometryDecode");

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
      postFilter = options.postFilter || (regionsData.meta && regionsData.meta.postFilter ? new Function("region", regionsData.meta.postFilter) : 0),
      scheme = options.scheme || regionsData.meta && regionsData.meta.scheme,
      disputedBorders = regionsData.meta && regionsData.meta.disputedBorders || {},
      useSetup = options.recombine || options.lang || "en",
      disputedBorder = typeof useSetup == "string" ? disputedBorders[useSetup] : useSetup,
      geometry = 0;

  for (var _i in disputedBorders) {
    var setup = disputedBorders[_i];
    for (var j in setup) {
      var regionSet = setup[j];
      if (typeof regionSet == "string") {
        setup[j] = new Function("region", regionSet);
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
            filter: typeof sch == "string" ? new Function("region", sch) : sch
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
},{"./geometryDecode":12,"./recombine":15,"./region":16}],18:[function(require,module,exports){
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
},{}]},{},[1]);
