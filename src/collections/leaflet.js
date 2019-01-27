import buildIdTable from "../utils/buildIdTable";
import { getShortestContour } from "../utils/shortestPath";

function styleToLeaflet(style) {
  var ret = {};
  if ("strokeWidth" in style) {
    ret.weight = style.strokeWidth;
  }
  if ("fillColor" in style) {
    ret.fillColor = style.fillColor;
  }
  if ("strokeColor" in style) {
    ret.color = style.strokeColor;
  }
  if ("strokeOpacity" in style) {
    ret.opacity = Math.max(0.001, style.strokeOpacity);
  }
  if ("fillOpacity" in style) {
    ret.fillOpacity = Math.max(0.001, style.fillOpacity);
  }
  return ret;
}

function toLeaflet(baseGeoJson, _L) {
  const Leaflet = _L || window.L;

  // implement unbounded coordinates
  const geoJson = {
    ...baseGeoJson,
    features: baseGeoJson.features.map(feature => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: getShortestContour(feature.geometry.coordinates)
      }
    }))
  };

  var idTable = buildIdTable(geoJson),
    features = [],
    collection = Leaflet.geoJSON(geoJson, {
      onEachFeature: feature => features.push(feature)
    });

  return {
    collection: collection,
    add: function(map) {
      collection.addTo(map);
    },
    remove: function() {
      collection.remove();
    },
    setStyles: function(fn) {
      features.forEach(feature =>
        feature.setStyle(
          styleToLeaflet(fn(idTable[feature.properties.osmId], feature))
        )
      );
    },
    geoJSON: geoJson,
    /**
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} [ctx]
     */
    addEvent: function(eventName, callback, ctx) {
      features.forEach(feature => {
        feature.addEventListener(eventName, function(event) {
          var target = feature;
          callback.call(
            ctx,
            idTable[target.properties.osmId],
            [eventName, "leaflet"],
            target,
            event
          );
        });
      });
    },
    removeEvent: function(event) {
      features.forEach(feature => {
        feature.removeEventListener(event);
      });
    }
  };
}

export default toLeaflet;
