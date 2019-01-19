function buildIdTable(geoJson) {
  var ret = {},
    features = geoJson.features;
  for (var i = 0, l = features.length; i < l; ++i) {
    var feature = features[i];
    if (feature && feature.properties) {
      ret[feature.properties.osmId] = feature;
    }
  }

  return ret;
}

export default buildIdTable;
