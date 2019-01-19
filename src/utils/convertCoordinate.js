function flipa(a) {
  var b = [];
  for (var i = 0, l = a.length; i < l; ++i) {
    b[i] = [a[i][1], a[i][0]];
  }
  return b;
}

function flip(a) {
  var b = [];
  for (var i = 0, l = a.length; i < l; ++i) {
    b[i] = flipa(a[i]);
  }
  return b;
}

function convertCoordinate(feature) {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      fillRule: feature.geometry.coordinates.length > 1 ? "evenOdd" : "nonZero",
      coordinates: flip(feature.geometry.coordinates)
    },
    properties: feature.properties
  };
}

export default convertCoordinate;
