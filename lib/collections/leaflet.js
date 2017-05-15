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