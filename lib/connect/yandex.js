'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Yandex.Maps API
var ymaps = window.ymaps;

if ((typeof ymaps === 'undefined' ? 'undefined' : _typeof(ymaps)) === 'object' && ymaps.modules && ymaps.modules.define) {
    ymaps.modules.define('osmeRegions', ["vow", "system.project"], function (provide, vow, project) {
        provide(ymaps.osmeRegions = {

            /**
             * @name osmeRegions.load
             * @param {String} region RegionId
             * @param {Object} options
             * @returns {vow.Promise}
             */
            load: function load(region, options) {
                var deferred = vow.defer();
                options = options || {};
                _index2.default.geoJSON(region, {
                    lang: options.lang || project.data.lang.substr(0, 2),
                    quality: 'quality' in options ? options.quality : 0
                }, function (data) {
                    deferred.resolve({
                        geoObjects: _index2.default.toYandex(data).collection
                    });
                }, function () {
                    deferred.reject();
                });
                return deferred.promise();
            },

            /**
             * @name osmeRegions.geocode
             * @param {Number[]} point
             * @param {Object} options
             * @returns {vow.Promise}
             */
            geocode: function geocode(point, options) {
                var deferred = vow.defer();
                options = options || {};
                _index2.default.geoJSON(point, {
                    lang: options.lang || project.data.lang.substr(0, 2)
                }, function (data) {
                    deferred.resolve(data);
                }, function () {
                    deferred.reject();
                });
                return deferred.promise();
            }
        });
    });
    //force execute
    ymaps.modules.require('osmeRegions', function () {});
}