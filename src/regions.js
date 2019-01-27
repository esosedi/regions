/*!
 * OSMeRegions JavaScript Library
 * http://data.esosedi.org/regions/
 * https://github.com/esosedi/regions
 *
 * @author Anton Korzunov <kashey@yandex-team.ru>
 * Released under the MIT license
 */

import settings from "./settings";

import nextTick from "./utils/nextTick";

import recombineRegion from "./utils/recombine";
import setupGeometry from "./utils/setupGeometry";

import geocode from "./geocode";

import toGoogleCollection from "./collections/google";
import toYandexCollection from "./collections/yandex";
import toLeafletCollection from "./collections/leaflet";
import toUnboundedGeoJSON from './collections/unbounded';

const assertData = (errorCallback, data) => {
  if (!data || data.error) {
    errorCallback("wrong data", data.error);
  }
  return data;
};

/**
 * @name osmeRegions
 * @type Object
 */
var osmeRegions = /** @lends osmeRegions */ {
  /**
   * override data host
   * @param host
   */
  setHost: function(host) {
    settings.HOST = host;
  },

  /**
   * @param {Boolean} debug
   */
  setDebug: function(debug) {
    settings.DEBUG = Boolean(debug);
  },

  /**
   * allow recombination
   * @param regionsData
   * @param {Object} query
   * @param {Function} query.filter
   * @function
   */
  recombine: recombineRegion,

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
  geoJSON: function(region, options, _callback, _errorCallback) {
    let promise;
    let cb_resolve, cb_reject;
    options = options || {};

    if (typeof options === "function") {
      throw new Error("callback must be at third place");
    }

    const lang = options.lang || "en";
    let addr = typeof region === "string" ? lang + "_" + region : null;

    if (typeof Promise !== "undefined") {
      promise = new Promise((resolve, reject) => {
        cb_resolve = resolve;
        cb_reject = reject;
      });
    } else {
      cb_resolve = cb_reject = () => {};
    }
    const callback = (geojson, data) => {
      if (addr) {
        settings.cache[addr] = data;
      }
      cb_resolve(geojson, data);
      _callback && _callback(geojson, data);
    };

    const errorCallback = geojson => {
      cb_reject(geojson);
      _errorCallback && _errorCallback(geojson);
    };

    if (addr) {
      if ((region + "").indexOf("http") === 0) {
        addr = region;
      } else {
        addr = (options.host || settings.HOST) + "?lang=" + addr;
        if (options.quality) {
          addr += "&q=" + (options.quality + 1);
        }
        if (options.type) {
          addr += "&type=" + options.type;
        }
      }

      if (!settings.cache[addr] || options.nocache) {
        this.loadData(
          addr,
          data => {
            nextTick(callback, [
              assertData(errorCallback, this.parseData(data, options)),
              data
            ]);
          },
          errorCallback
        );
      } else {
        const data = settings.cache[addr];
        nextTick(callback, [
          assertData(errorCallback, this.parseData(data, options)),
          data
        ]);
      }
    } else {
      nextTick(callback, [
        assertData(errorCallback, this.parseData(region, options)),
        region
      ]);
    }

    return promise;
  },

  /**
   * overloadable data transfer function
   */
  loadData: function(path, callback, errorCallback) {
    return settings.load(path, callback, errorCallback);
  },

  /**
   * parse default data format
   * @param {String} data
   * @returns {geoJSON}
   */
  parseData: function(data, options) {
    if (!data.meta) {
      return {
        error: data.error
      };
    }
    return {
      type: "FeatureCollection",
      features: setupGeometry(data, options),
      metaData: data.meta
    };
  },

  /**
   * drops internal cache
   */
  dropCache: function() {
    settings.cache = {};
  },

  _setCoordOrder: function(order) {
    settings.latLongOrder = order == "latlong";
  },

  /**
   * convert geoJSON to YMAPS collection
   * @param geoJson
   * @param [ym21] - Maps API namespace
   * @returns {osmeMapCollection}
   */
  toYandex: toYandexCollection,

  /**
   * converts GeoJSON to Google.data object
   * @param geoJson
   * @param maps
   * @returns {osmeMapCollection}
   */
  toGoogle: toGoogleCollection,

  /**
   * converts GeoJSON to Leaflet object
   * @param geoJson
   * @param L
   * @returns {osmeMapCollection}
   */
  toLeaflet: toLeafletCollection,

  /**
   * converts GeoJSON to GeoJSON with "unbounded" coordinates
   * @param geoJson
   * @returns {geoJson}
   */
  toUnboundedGeoJSON: toUnboundedGeoJSON,

  /**
   * Reverse geocode
   * @param {Number[]} point - Point.
   * @param {Object} [options]
   * @param {Number} [options.seq] - Sequence number.
   * @param {String} [options.lang] - Language.
   * @param {Function} callback
   * @param {Function} [errorcallback]
   */
  geocode: geocode
};

export default osmeRegions;
