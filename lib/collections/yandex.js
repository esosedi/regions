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