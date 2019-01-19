import wrapRegion from "./region";
import { getFixedGeometry } from "./geometryDecode";
/**
 * recombination
 * @param regionsData
 * @param query
 * @returns {*}
 */
function recombineRegion(regionsData, query) {
  var regions = regionsData.regions,
    inpaths = regionsData.paths,
    passRegions = {},
    paths = [],
    way;

  function filterPath(path) {
    var result = [];
    for (var i = 0, l = path.length; i < l; ++i) {
      if (1 || path[i].length > 1) {
        result.push([path[i]]);
      }
    }
    return result;
  }

  //fill regions and way counter
  for (var ri in regions) {
    if (regions.hasOwnProperty(ri)) {
      var tpaths = inpaths[ri];
      var qf = query.filter(wrapRegion(ri, regionsData));
      if (qf) {
        if (qf !== true) {
          if (qf.path) {
            tpaths = qf.path;
          }
        }
        if (tpaths && tpaths.length) {
          tpaths = filterPath(tpaths);
          if (tpaths.length) {
            passRegions[ri] = ri;
            paths.push.apply(paths, tpaths);
          }
        }
      }
    }
  }

  function joinPaths(patha, pathb) {
    var usedWays = {},
      wayDirection = {},
      wayLookup = {};

    var apaths = [patha, pathb];
    for (let ri = 0; ri < 2; ++ri) {
      const tpaths = apaths[ri];
      for (
        let pathId = 0, pathLength = tpaths.length;
        pathId < pathLength;
        ++pathId
      ) {
        let path = tpaths[pathId];
        if (typeof path == "number") {
          path = [path];
        }
        for (var i = 0, l = path.length; i < l; ++i) {
          const wayId = Math.abs(path[i]);
          usedWays[wayId] = (usedWays[wayId] || 0) + 1;
        }
      }
    }

    var //pass = 0,
      lost = 0;
    for (let ri = 0; ri < 2; ++ri) {
      const tpaths = apaths[ri];
      for (
        let pathId = 0, pathLength = tpaths.length;
        pathId < pathLength;
        ++pathId
      ) {
        let path = tpaths[pathId];
        if (typeof path == "number") {
          path = [path];
        }

        for (let i = 0, l = path.length; i < l; ++i) {
          var wayId = Math.abs(path[i]);
          if (usedWays[wayId] === 1) {
            //pass++;
            var lw = +path[(i - 1 + l) % l],
              rw = +path[(i + 1 + l) % l];
            wayLookup[lw] = wayLookup[lw] || [];
            wayLookup[lw].push(path[i]);
            wayDirection[path[i]] = [+lw, +path[i], +rw, ri, pathId];
          } else {
            lost++;
          }
        }
      }
    }
    if (!lost) {
      return false;
    }

    function getWay() {
      for (var i in wayDirection) {
        if (testWay(i)) {
          return +i;
        }
      }
      return false;
    }

    function testWay(i) {
      return i && wayDirection.hasOwnProperty(i) && wayDirection[i][1];
    }

    // function reverse () {
    //     rpath.reverse();
    //     for (var i = 0, l = rpath.length; i < l; ++i) {
    //         rpath[i] *= -1;
    //     }
    //     ord *= -1;
    //     return rpath;
    // }

    var rpaths = [],
      rpath = [],
      ord = 1;

    function tryJoinWay(rpath, way) {
      if (!wayDirection[way]) {
        return false;
      }
      var lw = ord == -1 ? wayDirection[way][0] : 0,
        rw = ord == +1 ? wayDirection[way][2] : 0;
      if (testWay(rw)) {
        way = rw;
        rpath.push(+way * ord);
      } else if (testWay(lw)) {
        way = lw;
        rpath.push(+way);
      } else {
        // indirect
        var rwset = wayLookup[-wayDirection[way][2]];
        way = 0;
        for (var j in rwset) {
          rw = rwset[j];
          if (testWay(rw)) {
            way = rw;
            rpath.push(+way);
            break;
          }
        }
        if (!way) {
          return false;
        }
      }
      return way;
    }

    while (false !== (way = getWay())) {
      rpath = [];
      ord = 1;
      rpath.push(+way);
      while (way) {
        wayDirection[way][1] = 0;
        var newWay = tryJoinWay(rpath, way);
        if (!newWay) {
          break;
        }
        way = newWay;
      }
      rpaths.push(rpath);
    }
    return rpaths;
  }

  paths.sort(function(a, b) {
    return Math.abs(a[0][0]) < Math.abs(b[0][0]);
  });

  var rpath = paths[0],
    skip = { 0: 1 },
    skipCnt = 1,
    rpaths = [],
    l = paths.length,
    freePass = 0,
    joinPass = 0,
    ccx = 0;

  while (skipCnt < l) {
    joinPass = 0;
    for (let i = 1, l = paths.length; i < l; ++i) {
      var rid = i % l;
      if (!(rid in skip)) {
        var result = joinPaths(rpath, paths[rid]);
        if (result && result.length == 1) {
          rpath = result;
          skip[rid] = 1;
          skipCnt++;
          joinPass++;
        } else {
          freePass = rid;
        }
      }
    }
    if (!joinPass) {
      if (freePass) {
        rpaths.push(rpath[0]);
        rpath = paths[freePass];
        skip[freePass] = 1;
        skipCnt++;
      } else {
        break;
      }
    }
    if (ccx++ > 1000) {
      break;
    }
  }

  if (rpath) {
    rpaths.push(rpath[0]);
  }

  return getFixedGeometry(rpaths, regionsData);
}

export default recombineRegion;
