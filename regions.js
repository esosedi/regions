/*!
 * OSMeRegions JavaScript Library
 * http://data.esosedi.org/regions/
 * https://github.com/esosedi/regions
 *
 * @author Anton Korzunov <kashey@yandex-team.ru>
 * Released under the MIT license
 */
(function (global) {
    var osmeRegions = (function () {

        /**
         * wrapper for map data
         * @name osmeMapCollection
         * @class
         */

        /**
         * Wraper for filtering regions
         * @name RegionObject
         * @class
         */


        var latLongOrder = 0,
            codingCoefficient = 1 / 1000000,
            fraction = 2,
            dividor = 1 / 0xFFFF; // target resolution 65k, real 4k

        function flipa (a) {
            var b = [];
            for (var i = 0, l = a.length; i < l; ++i) {
                b[i] = [a[i][1], a[i][0]];
            }
            return b;
        }

        function flip (a) {
            var b = [];
            for (var i = 0, l = a.length; i < l; ++i) {
                b[i] = flipa(a[i]);
            }
            return b;
        }

        /**
         * coordinateDecode
         * partof Yandex.Maps.API
         */
        function decodeByteVector (x, N) {
            var point = 0;
            for (var i = 0; i < N; ++i) {
                point |= (x.charCodeAt(i) << (i * 8));
            }
            return point;
        }

        function clampx (x) {
            return Math.min(180, Math.max(-180, x));
        }

        function clampy (y) {
            return Math.min(85, Math.max(-85, y));
        }

        function fromBase64 (input) {
            input = input.replace(/_/g, '/').replace(/-/g, '+');
            if (typeof atob != "undefined") {
                return atob(input);
            } else {
                return new Buffer(input, 'base64').toString('binary');
            }
        }

        function decodeLineBlock (encodedCoordinates) {
            var byteVector = fromBase64(encodedCoordinates),
                byteVectorLength = byteVector.length,
                bounds = [
                    [decodeByteVector(byteVector.substr(0, 4), 4) * codingCoefficient, decodeByteVector(byteVector.substr(4, 4), 4) * codingCoefficient],
                    [decodeByteVector(byteVector.substr(8, 4), 4) * codingCoefficient, decodeByteVector(byteVector.substr(12, 4), 4) * codingCoefficient]
                ],
                dimension = [bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]],
                result = [],
                index = 16,
                fx = dimension[0] * dividor,
                fy = dimension[1] * dividor;

            function read () {
                var ret = decodeByteVector(byteVector.substr(index, fraction), fraction);
                index += fraction;
                return ret;
            }

            while (index < byteVectorLength) {
                var position = [clampy(read() * fx + bounds[0][0]), clampx(read() * fy + bounds[0][1])];
                result.push([position[1], position[0]]);
            }
            return result;
        }

        function decodeWay (lineBlock, wayId, osmeData) {
            if (osmeData.wayCache[wayId]) {
                return osmeData.wayCache[wayId];
            }
            return osmeData.wayCache[wayId] = decodeLineBlock(lineBlock);
        }


        function getFixedGeometry (regionId, osmeData) {
            return getGeometry(regionId, osmeData, {fixDegenerate: true})
        }

        function EQ (first, second, diff) {
            diff = diff || 1e-9;
            var dx = Math.abs(second[0] - first[0]),
                dy = Math.abs(second[1] - first[1]);
            return dx < diff && dy < diff;
        }

        function fixDegenerate (way, path) {
            var offset = 0,
                l = way.length,
                lp = path.length,
                limit = Math.min(l, lp),
                delta = 10 / 0xFFFF; //10 HOPS
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

        function getGeometry (regionId, osmeData, options) {
            var coordinates = [],
                fixedPoints = [],
                meta = [],
                paths = regionId.length ? regionId : osmeData.paths[regionId],
            //segments = [],
                osmeWays = osmeData.ways,
                options = options || {};

            osmeData.wayCache = osmeData.wayCache || {};

            if (!paths) {
                return false;
            }
            for (var pathId = 0, pathLength = paths.length; pathId < pathLength; ++pathId) {
                var path = paths[pathId];
                var pathCoordinates = [],
                    ways = [],
                    segmentFixedPoints = [0];
                if (typeof path == 'number') {
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
                    //segments.push({way: flipa(way), id: wayId});
                }
                pathCoordinates.push(pathCoordinates[0]);
                coordinates.push(pathCoordinates);
                fixedPoints.push(segmentFixedPoints);
                meta.push(ways);
            }

            return {
                type: 'Polygon',
                fillRule: 'nonZero',
                coordinates: coordinates,
                path: paths,
                fixedPoints: fixedPoints
                //segments: segments,
                //ways: meta
            };
        }

        /**
         * Vanilla Ajax data transfer
         * @param {String} path
         * @param {Function} callback
         * @param {Function) errorCallback
        */
        function load (path, callback, errorCallback) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", path, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 304) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            callback(response);
                        } catch (e) {
                            errorCallback(e);
                        }
                    } else {
                        window.console && console.error("Response recieved with status " + xhr.status);
                        errorCallback(xhr);
                    }
                }
            };
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send();
        }

        /**
         * main decode function
         * @param regionsData
         * @param options
         * @returns {Array}
         */
        function setupGeometry (regionsData, options) {
            options = options || {};
            var regions = regionsData.regions,
                dataset = [],
                postFilter = options.postFilter || (regionsData.meta && regionsData.meta.postFilter ? new Function('region', regionsData.meta.postFilter) : 0),
                scheme = options.scheme || regionsData.meta && regionsData.meta.scheme,
                disputedBorders = regionsData.meta && regionsData.meta.disputedBorders || {},
                useSetup = options.recombine || options.lang || 'en',
                disputedBorder = typeof useSetup == 'string' ? disputedBorders[useSetup] : useSetup,
                geometry = 0;

            for (var i in disputedBorders) {
                var setup = disputedBorders[i];
                for (var j in setup) {
                    var regionSet = setup[j];
                    if (typeof regionSet == 'string') {
                        setup[j] = new Function('region', regionSet);
                    }
                }
            }

            for (var i in regions) {
                if (regions.hasOwnProperty(i)) {
                    if (!postFilter || postFilter(wrapRegion(i, regionsData))) {
                        if (disputedBorder && disputedBorder[+i]) {
                            geometry = recombineRegion(regionsData, {
                                filter: disputedBorder[+i]
                            });
                        } else if (scheme && scheme[+i]) {
                            var sch = scheme[+i];
                            geometry = recombineRegion(regionsData, {
                                filter: typeof sch == 'string' ? new Function('region', sch) : sch
                            });
                        } else {
                            geometry = getGeometry(+i, regionsData);
                        }

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
            var result = [];
            for (var i = 0, l = dataset.length; i < l; ++i) {
                if (dataset[i]) {
                    result.push(dataset[i]);
                }
            }
            return result;
        }

        function convertCoordinate (feature) {
            return {
                type: "Feature",
                geometry: {
                    type: 'Polygon',
                    fillRule: feature.geometry.coordinates.length > 1 ? 'evenOdd' : 'nonZero',
                    coordinates: flip(feature.geometry.coordinates)
                },
                properties: feature.properties
            };
        }

        /**
         * wraps region for filter functions
         * @param rid
         * @param data
         * @returns {RegionObject}
         */
        function wrapRegion (rid, data) {
            var meta = data.regions[rid],
                prop = meta.property || {};
            return {
                osmId: rid,
                geoNamesId: prop.geoNamesId,
                iso: prop.iso3166,
                level: meta.level,
                properties: prop,

                getBorderWith: function (id) {
                    var wset = {}, i, l1, j, l2,
                        path1 = data.paths[id],
                        path2 = data.paths[rid];
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
                },

                hasBorderWith: function (id) {

                    var wset = {}, i, l1, j, l2,
                        path1 = data.paths[rid],
                        path2 = data.paths[id];
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
                },

                hasParent: function (id) {
                    var parents = meta.parents;
                    for (var i = 0, l = parents.length; i < l; ++i) {
                        if (parents[i].id == id) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        }

        /**
         * recombination
         * @param regionsData
         * @param query
         * @returns {*}
         */
        function recombineRegion (regionsData, query) {
            var regions = regionsData.regions,
                inpaths = regionsData.paths,
                passRegions = {},
                paths = [];

            function filterPath (path) {
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

            function joinPaths (patha, pathb) {

                var usedWays = {},
                    wayDirection = {},
                    wayLookup = {};

                var apaths = [patha, pathb]
                for (var ri = 0; ri < 2; ++ri) {
                    var tpaths = apaths[ri];
                    for (var pathId = 0, pathLength = tpaths.length; pathId < pathLength; ++pathId) {
                        var path = tpaths[pathId];
                        if (typeof path == 'number') {
                            path = [path];
                        }
                        for (var i = 0, l = path.length; i < l; ++i) {
                            var wayId = Math.abs(path[i]);
                            usedWays[wayId] = (usedWays[wayId] || 0) + 1;
                        }
                    }
                }


                var pass = 0, lost = 0;
                for (var ri = 0; ri < 2; ++ri) {
                    var tpaths = apaths[ri];
                    for (var pathId = 0, pathLength = tpaths.length; pathId < pathLength; ++pathId) {
                        var path = tpaths[pathId];
                        if (typeof path == 'number') {
                            path = [path];
                        }

                        for (var i = 0, l = path.length; i < l; ++i) {
                            var wayId = Math.abs(path[i]);
                            if (usedWays[wayId] === 1) {
                                pass++;
                                var lw = +path[(i - 1 + l) % l],
                                    rw = +path[(i + 1 + l) % l];
                                wayLookup[lw] = wayLookup[lw] || [];
                                //wayLookup[rw] = wayLookup[rw] || [];
                                wayLookup[lw].push(path[i]);
                                // wayLookup[rw].push(path[i]);
                                wayDirection[path[i]] = [
                                    +lw,
                                    +path[i],
                                    +rw,
                                    ri,
                                    pathId
                                ];
                            } else {
                                lost++;
                            }
                        }
                    }
                }
                if (!lost) {
                    return false;
                }

                function getWay () {
                    for (var i in wayDirection) {
                        if (testWay(i)) {
                            return +i;
                        }
                    }
                    return false;
                }

                function testWay (i) {
                    return i && wayDirection.hasOwnProperty(i) && wayDirection[i][1];
                }

                function reverse () {
                    rpath.reverse();
                    for (var i = 0, l = rpath.length; i < l; ++i) {
                        rpath[i] *= -1;
                    }
                    ord *= -1;
                    return rpath;
                }

                var rpaths = [], rpath = [], ord = 1;

                function tryJoinWay (rpath, way) {
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

            paths.sort(function (a, b) {
                return Math.abs(a[0][0]) < Math.abs(b[0][0]);
            });

            var rpath = paths[0],
                skip = {0: 1},
                skipCnt = 1,
                rpaths = [],
                l = paths.length,
                freePass = 0, joinPass = 0,
                ccx = 0;

            while (skipCnt < l) {
                joinPass = 0;
                for (var i = 1, l = paths.length; i < l; ++i) {
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

        function nextTick (callback, args) {
            setTimeout(function () {
                callback.apply(this, args);
            }, 0);
        }

        var HOST = 'http://data.esosedi.org/regions/v1/';
        var cache = {};

        return {
            /**
             * override data host
             * @param host
             */
            setHost: function (host) {
                HOST = host;
            },

            coordinateDecode: decodeLineBlock,
            geometryCombine: getGeometry,
            flipCoordinate: flip,

            /**
             * allow recombination
             * @param regionsData
             * @param {Object} query
             * @param {Function} query.filter
             * @function
             */
            recombine: recombineRegion,

            /**
             * Loads GeoJSON from default host
             * @param {String} region OSMRelationId,ISO3166-2 code or world's region name(Asia, Europe etc) or absolute URL.
             * @param {Object} options
             * @param {String} [options.lang='en'] Language (en,de,ru).
             * @param {Number} [options.quality=0] Quality. 0 for fullHD resolution. -1,0,+1,+2 for /4, x1, x4, x16 quality.
             * @param {String} [options.type=''] Type of data. Can be empty or 'coast' (unstable mode).
             * @param {Boolean} [options.noache] Turns off internal cache.
             * @param {Function} [options.postFilter] filtering function.
             * @param {String|Object} [options.recombine] recombination function.
             * @param {Object} [options.scheme] another recombination function.
             * @param {Function) callback
             * @param {Function) [errorCallback]
             */
            geoJSON: function (region, options, callback, errorCallback) {
                if (!errorCallback) {
                    errorCallback = function (e) {
                        window.console && console.error(e);
                    };
                }
                var lang = options.lang || 'en',
                    addr = lang + '_' + region;

                if ((region + "").indexOf('http') === 0) {
                    addr = region;
                } else {
                    addr = HOST + '?lang=' + addr;
                    if (options.quality) {
                        addr += '&q=' + (options.quality + 1);
                    }
                    if (options.type) {
                        addr += '&type=' + options.type;
                    }
                }
                if (!cache[addr] || options.nocache) {
                    var _this = this;
                    this.loadData(addr, function (data) {
                        cache[addr] = data;
                        nextTick(callback, [_this.parseData(data, options), data]);
                    }, errorCallback)
                } else {
                    nextTick(callback, [this.parseData(cache[addr], options), cache[addr]]);
                }
            },

            /**
             * overloadable data transfer function
             */
            loadData: load, //or jq_load

            /**
             * parse default data format
             * @param {String} data
             * @returns {geoJSON}
             */
            parseData: function (data, options) {
                return {
                    type: "FeatureCollection",
                    features: setupGeometry(data, options),
                    metaData: data.meta
                };
            },

            /**
             * drops internal cache
             */
            dropCache: function () {
                cache = {};
            },

            _setCoordOrder: function (order) {
                latLongOrder = (order == 'latlong');
            },

            /**
             * convert geoJSON to YMAPS collection
             * @param geoJson
             * @param [ym21]
             * @returns {osmeMapCollection}
             */
            toYandex: function (geoJson, ym21) {

                ym21 = ym21 || ymaps;
                var collection = new ym21.GeoObjectCollection(),
                    dataset = geoJson.features,
                    idTable = buildIdTable(geoJson);

                for (var i = 0, l = dataset.length; i < l; ++i) {
                    var line = dataset[i];
                    if (line.geometry) {
                        collection.add(new ym21.GeoObject(
                                latLongOrder ? line : convertCoordinate(line), {
                                    simplificationFixedPoints: line.geometry.fixedPoints
                                })
                        );
                    } else {
                        window.console && console.log('osme line fail', line);
                    }
                }
                return {
                    collection: collection,
                    add: function (map) {
                        map.geoObjects.add(collection);
                    },
                    remove: function () {
                        collection.setParent(null);
                    },
                    setStyles: function (fn) {
                        collection.each(function (object) {
                            object.options.set(styleToYandex(fn(idTable[object.properties.get('osmId')], object)));
                        });
                    },
                    addEvent: function (eventName, callback) {
                        collection.events.add(eventName, function (event) {
                            var target = event.get('target');
                            callback(idTable[target.properties.get('osmId')], [eventName, 'yandex'], target, event);
                        });
                    },
                    removeEvent: function (event) {
                        collection.events.remove(event);
                    }
                };
            },

            /**
             * converts GeoJSON to Google.data object
             * @param geoJson
             * @param maps
             * @returns {osmeMapCollection}
             */
            toGoogle: function (geoJson, maps) {
                // use google.data

                var idTable = buildIdTable(geoJson),
                    collection = new (maps || google.maps).Data();
                collection.addGeoJson(geoJson);

                return {
                    collection: collection,
                    add: function (map) {
                        collection.setMap(map);
                    },
                    remove: function () {
                        collection.setMap(null);
                    },
                    setStyles: function (fn) {
                        collection.setStyle(function (object) {
                            return styleToGoogle(fn(idTable[object.getProperty('osmId')], object));
                        });
                    },
                    addEvent: function (eventName, callback) {
                        collection.addListener(eventName, function (event) {
                            var target = event.feature;
                            callback(idTable[target.getProperty('osmId')], [eventName, 'google'], target, event);
                        });
                    },
                    removeEvent: function (event) {
                        collection.removeListener(event);
                    }
                };
            }
        };


        function buildIdTable (geoJson) {
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

        function styleToYandex (style) {
            var ret = {};
            return style;
        }

        function styleToGoogle (style) {
            var ret = {},
                notdefined;
            if ('strokeWidth' in style) {
                ret.strokeWeight = style.strokeWidth;
            }
            if ('fillColor' in style) {
                ret.fillColor = style.fillColor;
            }
            if ('strokeColor' in style) {
                ret.strokeColor = style.strokeColor;
            }
            if ('strokeOpacity' in style) {
                ret.strokeOpacity = Math.max(0.001, style.strokeOpacity);
            }
            if ('fillOpacity' in style) {
                ret.fillOpacity = Math.max(0.001, style.fillOpacity);
            }
            return ret;
        }


    })();

//Node.JS
    if (typeof exports === 'object') {
        module.exports = osmeRegions;
    }
    else {
        //Browser
        global.osmeRegions = osmeRegions;
    }

//Yandex.Maps API
    if (typeof ymaps === 'object' && ymaps.modules && ymaps.modules.define) {
        ymaps.modules.define('osmeRegions', ["vow", "system.project"], function (provide, vow, project) {
            provide(ymaps.osmeRegions = {
                load: function (region, options) {
                    var deferred = vow.defer();
                    options = options || {};
                    osmeRegions.geoJSON(region, {
                        lang: options.lang || project.data.lang.substr(0, 2),
                        quality: 'quality' in options ? options.quality : 0
                    }, function (data) {
                        deferred.resolve({
                            geoObjects: osmeRegions.toYandex(data).collection
                        });
                    }, function () {
                        deferred.reject();
                    });
                    return deferred.promise();
                }
            });
        });
        //force execute
        ymaps.modules.require('osmeRegions', function () {
        });
    }

})
(this);
