import osmeRegions from "../index";
//Yandex.Maps API
const ymaps = window.ymaps;

if (typeof ymaps === "object" && ymaps.modules && ymaps.modules.define) {
  ymaps.modules.define("osmeRegions", ["vow", "system.project"], function(
    provide,
    vow,
    project
  ) {
    provide(
      (ymaps.osmeRegions = {
        /**
         * @name osmeRegions.load
         * @param {String} region RegionId
         * @param {Object} options
         * @returns {vow.Promise}
         */
        load: function(region, options) {
          var deferred = vow.defer();
          options = options || {};
          osmeRegions.geoJSON(
            region,
            {
              lang: options.lang || project.data.lang.substr(0, 2),
              quality: "quality" in options ? options.quality : 0
            },
            function(data) {
              deferred.resolve({
                geoObjects: osmeRegions.toYandex(data).collection
              });
            },
            function() {
              deferred.reject();
            }
          );
          return deferred.promise();
        },

        /**
         * @name osmeRegions.geocode
         * @param {Number[]} point
         * @param {Object} options
         * @returns {vow.Promise}
         */
        geocode: function(point, options) {
          var deferred = vow.defer();
          options = options || {};
          osmeRegions.geoJSON(
            point,
            {
              lang: options.lang || project.data.lang.substr(0, 2)
            },
            function(data) {
              deferred.resolve(data);
            },
            function() {
              deferred.reject();
            }
          );
          return deferred.promise();
        }
      })
    );
  });
  //force execute
  ymaps.modules.require("osmeRegions", function() {});
}
