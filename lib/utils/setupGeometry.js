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