import wrapRegion from "./region";
import recombineRegion from "./recombine";
import { getGeometry } from "./geometryDecode";

/**
 * main decode function
 * @param regionsData
 * @param options
 * @returns {Array}
 */
function setupGeometry(regionsData, options) {
  options = options || {};
  var regions = regionsData.regions,
    dataset = [],
    postFilter =
      options.postFilter ||
      (regionsData.meta && regionsData.meta.postFilter
        ? new Function("region", regionsData.meta.postFilter)
        : 0),
    scheme = options.scheme || (regionsData.meta && regionsData.meta.scheme),
    disputedBorders =
      (regionsData.meta && regionsData.meta.disputedBorders) || {},
    useSetup = options.recombine || options.lang || "en",
    disputedBorder =
      typeof useSetup == "string" ? disputedBorders[useSetup] : useSetup,
    geometry = 0;

  for (const i in disputedBorders) {
    var setup = disputedBorders[i];
    for (const j in setup) {
      var regionSet = setup[j];
      if (typeof regionSet == "string") {
        setup[j] = new Function("region", regionSet);
      }
    }
  }

  for (const i in regions) {
    if (regions.hasOwnProperty(i)) {
      if (!postFilter || postFilter(wrapRegion(i, regionsData))) {
        if (disputedBorder && disputedBorder[+i]) {
          geometry = recombineRegion(regionsData, {
            filter: disputedBorder[+i]
          });
        } else if (scheme && scheme[+i]) {
          var sch = scheme[+i];
          geometry = recombineRegion(regionsData, {
            filter: typeof sch == "string" ? new Function("region", sch) : sch
          });
        } else {
          geometry = getGeometry(+i, regionsData);
        }

        if (geometry) {
          dataset[regions[i].index] = {
            type: "Feature",
            geometry: geometry,
            properties: {
              osmId: i,
              level: regions[i].level,
              properties: regions[i].property || {},
              parents: regions[i].parents,
              hintContent: regions[i].name,
              name: regions[i].name,
              title: regions[i].name,
              wikipedia: regions[i].wikipedia,
              orderIndex: regions[i].index,
              square: regions[i].square
            }
          };
        }
      }
    }
  }
  var result = [];
  for (var i = 0, l = dataset.length; i < l; ++i) {
    if (dataset[i]) {
      result.push(dataset[i]);
    }
  }
  return result;
}

export default setupGeometry;
