import {getShortestContour} from "../utils/shortestPath";

function toUnboundedGeoJSON(baseGeoJson) {
  return {
    ...baseGeoJson,
    features: baseGeoJson.features.map(feature => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        type: 'MultiPolygon',
        coordinates: getShortestContour(feature.geometry.coordinates)
      }
    }))
  };
}

export default toUnboundedGeoJSON;
