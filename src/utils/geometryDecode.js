import decodeWay from "./decoder";

function EQ(first, second, diff) {
  diff = diff || 1e-9;
  var dx = Math.abs(second[0] - first[0]),
    dy = Math.abs(second[1] - first[1]);
  return dx < diff && dy < diff;
}

function fixDegenerate(way, path) {
  var offset = 0,
    l = way.length,
    lp = path.length,
    limit = Math.min(l, lp),
    delta = 10 / 0xffff; //10 HOPS
  lp--;
  if (lp < 1) {
    return 0;
  }

  for (var i = 0; i < limit; ++i) {
    if (EQ(way[i], path[lp - i], delta)) {
      offset++;
    } else {
      break;
    }
  }

  return offset;
}

function getGeometry(regionId, osmeData, options) {
  var coordinates = [],
    fixedPoints = [],
    meta = [],
    paths = regionId.length ? regionId : osmeData.paths[regionId],
    //segments = [],
    osmeWays = osmeData.ways;

  options = options || {};

  osmeData.wayCache = osmeData.wayCache || {};

  if (!paths) {
    return false;
  }
  for (
    var pathId = 0, pathLength = paths.length;
    pathId < pathLength;
    ++pathId
  ) {
    var path = paths[pathId];
    var pathCoordinates = [],
      ways = [],
      segmentFixedPoints = [0];
    if (typeof path == "number") {
      path = [path];
    }
    for (var i = 0, l = path.length; i < l; ++i) {
      var wayId = Math.abs(path[i]);
      var way = decodeWay(osmeWays[wayId], wayId, osmeData);
      if (path[i] < 0) {
        way = way.slice(0);
        way.reverse();
      }
      if (options.fixDegenerate) {
        var offset = fixDegenerate(way, pathCoordinates);
        if (offset) {
          way = way.slice(offset);
        }
        if (i == l - 1) {
          var tw = way.slice(0);
          tw.reverse();
          offset = fixDegenerate(pathCoordinates, way);
          if (offset) {
            offset--;
            way.length = way.length - offset;
            pathCoordinates = pathCoordinates.slice(offset);
          }
        }
      } else {
        // edges have same coordinates
        if (pathCoordinates.length) {
          pathCoordinates.length = pathCoordinates.length - 1;
        }
      }

      pathCoordinates.push.apply(pathCoordinates, way);
      segmentFixedPoints.push(pathCoordinates.length - 1);
      ways.push(wayId);
    }
    pathCoordinates.push(pathCoordinates[0]);
    coordinates.push(pathCoordinates);
    fixedPoints.push(segmentFixedPoints);
    meta.push(ways);
  }

  return {
    type: "Polygon",
    fillRule: "nonZero",
    coordinates: coordinates,
    path: paths,
    fixedPoints: fixedPoints
  };
}

function getFixedGeometry(regionId, osmeData) {
  return getGeometry(regionId, osmeData, { fixDegenerate: true });
}

export { getGeometry, getFixedGeometry };
