import buildIdTable from "../utils/buildIdTable";

import settings from "../settings";
import convertCoordinate from "../utils/convertCoordinate";

function styleToYandex(style) {
  return style;
}

function toYandex(geoJson, ym21) {
  const ymaps = ym21 || window.ymaps;
  var collection = new ymaps.GeoObjectCollection(),
    dataset = geoJson.features,
    idTable = buildIdTable(geoJson);

  for (var i = 0, l = dataset.length; i < l; ++i) {
    var line = dataset[i];
    if (line.geometry) {
      collection.add(
        new ymaps.GeoObject(
          settings.latLongOrder ? line : convertCoordinate(line),
          {
            simplificationFixedPoints: line.geometry.fixedPoints
          }
        )
      );
    } else {
      // window.console && console.error('osme line fail', line); // JFYI
    }
  }
  return {
    collection: collection,
    add: function(map) {
      map.geoObjects.add(collection);
    },
    remove: function() {
      collection.setParent(null);
    },
    setStyles: function(fn) {
      collection.each(function(object) {
        object.options.set(
          styleToYandex(fn(idTable[object.properties.get("osmId")], object))
        );
      });
    },
    /**
     * @param {String|Array.<String>} eventName
     * @param {Function} callback
     * @param {Object} [ctx]
     */
    addEvent: function(eventName, callback, ctx) {
      collection.events.add(eventName, function(event) {
        var target = event.get("target");
        callback.call(
          ctx,
          idTable[target.properties.get("osmId")],
          [eventName, "yandex"],
          target,
          event
        );
      });
    },
    removeEvent: function(event) {
      collection.events.remove(event);
    }
  };
}

export default toYandex;
