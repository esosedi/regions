import settings from "./settings";

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
  let promise;
  let cb_resolve, cb_reject;

  var addr = settings.GEOCODEHOST;
  addr += "?point=" + +point[0] + "," + +point[1];

  if (typeof options == "function") {
    _errorCallback = _callback;
    _callback = options;
    options = {};
  }

  options = {
    lang: "en",
    seq: 0,
    ...(options || {})
  };

  if (options.seq) {
    addr += "&seq=" + +options.seq;
  }
  if (options.lang) {
    addr += "&lng=" + options.lang;
  }

  if (typeof Promise != "undefined") {
    promise = new Promise((resolve, reject) => {
      cb_resolve = resolve;
      cb_reject = reject;
    });
  } else {
    cb_resolve = cb_reject = () => {};
  }

  const callback = geojson => {
    cb_resolve(geojson);
    _callback && _callback(geojson);
  };

  const errorCallback = geojson => {
    cb_reject(geojson);
    _errorCallback && _errorCallback(geojson);
  };

  settings.load(addr, json => callback(json), err => errorCallback(err));

  return promise;
}

export default geocode;
