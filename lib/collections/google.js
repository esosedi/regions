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