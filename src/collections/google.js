import buildIdTable from "../utils/buildIdTable";

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
  var idTable = buildIdTable(geoJson),
    collection = new (maps || window.google.maps).Data();
  collection.addGeoJson(geoJson);

  return {
    collection: collection,
    add: function(map) {
      collection.setMap(map);
    },
    remove: function() {
      collection.setMap(null);
    },
    setStyles: function(fn) {
      collection.setStyle(function(object) {
        return styleToGoogle(fn(idTable[object.getProperty("osmId")], object));
      });
    },
    /**
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} [ctx]
     */
    addEvent: function(eventName, callback, ctx) {
      collection.addListener(eventName, function(event) {
        var target = event.feature;
        callback.call(
          ctx,
          idTable[target.getProperty("osmId")],
          [eventName, "google"],
          target,
          event
        );
      });
    },
    removeEvent: function(event) {
      collection.removeListener(event);
    }
  };
}

export default toGoogle;
