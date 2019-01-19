/**
 * @name RegionObject
 * @class
 */
class RegionObject {
  constructor(rid, meta, prop, data) {
    /** @member {Number} */
    this.osmId = rid;
    /** @member {Number} */
    this.geoNamesId = prop.geoNamesId;
    /** @member {String} */
    this.iso = prop.iso3166;
    /** @member {Number} */
    this.level = meta.level;
    /** @member {Object} */
    this.properties = prop;

    this._meta = meta;
    this._data = data;
  }

  getBorderWith(id) {
    var wset = {},
      i,
      l1,
      j,
      l2,
      path1 = this._data.paths[id],
      path2 = this._data.paths[this.osmId];
    for (i = 0, l1 = path1.length; i < l1; ++i) {
      for (j = 0, l2 = path1[i].length; j < l2; ++j) {
        wset[Math.abs(path1[i][j])] = 1;
      }
    }
    var result = [];
    for (i = 0, l1 = path2.length; i < l1; ++i) {
      for (j = 0, l2 = path2[i].length; j < l2; ++j) {
        if (wset[Math.abs(path2[i][j])]) {
          // path is full in
          result.push(path2[i]);
        }
      }
    }
    return result;
  }

  hasBorderWith(id) {
    var wset = {},
      i,
      l1,
      j,
      l2,
      path1 = this._data.paths[this.osmId],
      path2 = this._data.paths[id];
    if (!path1 || !path2) {
      return false;
    }
    for (i = 0, l1 = path1.length; i < l1; ++i) {
      for (j = 0, l2 = path1[i].length; j < l2; ++j) {
        wset[Math.abs(path1[i][j])] = 1;
      }
    }
    for (i = 0, l1 = path2.length; i < l1; ++i) {
      for (j = 0, l2 = path2[i].length; j < l2; ++j) {
        if (wset[Math.abs(path2[i][j])]) {
          return true;
        }
      }
    }
    return false;
  }

  hasParent(id) {
    var parents = this._meta.parents;
    for (var i = 0, l = parents.length; i < l; ++i) {
      if (parents[i].id == id) {
        return true;
      }
    }
    return false;
  }
}

/**
 * wraps region for filter functions
 * @param rid
 * @param data
 * @returns {RegionObject}
 */
function wrapRegion(rid, data) {
  var meta = data.regions[rid],
    prop = meta.property || {};
  return new RegionObject(rid, meta, prop, data);
}

export default wrapRegion;
