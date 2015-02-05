var osmeRegions = (function () {

    var latLongOrder = 0,
        codingCoefficient = 1 / 1000000,
        fraction = 2,
        dividor = 1 / 0xFFFF;//0xFF x fraction

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
     * coordinateDcode
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

    function decodeLineBlock (encodedCoordinates) {
        var byteVector = atob(encodedCoordinates.replace(/_/g, '/').replace(/-/g, '+')),
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

    function getGeometry (regionId, osmeData) {
        var coordinates = [],
            fixedPoints = [],
            meta = [],
            paths = osmeData.paths[regionId],
            segments = [],
            osmeWays = osmeData.ways;

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
                //координаты соседних кусочков совпадают
                if (pathCoordinates.length) {
                    pathCoordinates.length = pathCoordinates.length - 1;
                }
                pathCoordinates.push.apply(pathCoordinates, way);
                //segments.push({way: flipa(way), id: wayId});
                segmentFixedPoints.push(pathCoordinates.length - 1);
                ways.push(wayId);
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
            //segments: segments,
            //fixedPoints: fixedPoints,
            //ways: meta
        };
    };

    /**
     * Загружает файл данных
     * @param {Function} callback Функция обработчик.
     */
    function load (path, callback) {
        jQuery.ajax({
            type: 'GET',
            url: path,
            contentType: 'application/json',
            xhrFields: {
                withCredentials: false
            },

            success: function (data) {
                callback(data);
            },

            error: function (error) {
                window.console && console.error('osmeRegions error:', error);
            }
        });
    }

    function setupGeometry (regionsData) {
        var regions = regionsData.regions,
            dataset = [];

        for (var i in regions) {
            if (regions.hasOwnProperty(i)) {
                var geometry = getGeometry(i, regionsData);
                if (dataset[regions[i].index]) {
                    debugger;
                }
                dataset[regions[i].index] = {
                    type: "Feature",
                    geometry: geometry,
                    properties: {
                        osmId: i,
                        level: regions[i].level,
                        properties: regions[i].property,
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
                fillRule: 'nonZero',
                coordinates: flip(feature.geometry.coordinates)
            },
            properties: feature.properties
        };
    }

    var HOST = 'http://data.esosedi.org/regions/v1/';
    var cache = {};

    return {
        setHost: function (host) {
            HOST = host;
        },

        coordinateDecode: decodeLineBlock,
        geometryCombine: getGeometry,

        geoJSON: function (region, options, callback) {
            var lang = options.lang || 'en',
                addr = lang + '_' + region;
            if (!cache[addr]) {
                var _this = this;
                this.loadData(HOST + '?lang=' + addr, function (data) {
                    cache[addr] = _this.parseData(data);
                    callback(cache[addr]);
                })
            } else {
                callback(cache[addr]);
            }
        },

        loadData: load,

        parseData: function (data) {
            return {
                type: "FeatureCollection",
                features: setupGeometry(data),
                metaData: data.meta
            };
        },

        dropCache: function () {
            cache = {};
        },

        _setCoordOrder: function (order) {
            latLongOrder = (order == 'latlong');
        },

        toYandex: function (geoJson, ym21) {

            ym21 = ym21 || ymaps;
            var collection = new ym21.GeoObjectCollection(),
                dataset = geoJson.features,
                idTable = buildIdTable(geoJson);

            for (var i = 0, l = dataset.length; i < l; ++i) {
                var line = dataset[i];
                if (1) {
                    collection.add(new ym21.GeoObject(
                            latLongOrder ? line : convertCoordinate(line), {
                                simplificationFixedPoints: line.geometry.fixedPoints
                            })
                    );
                }

                if (0) {
                    for (var j in line.geometry.segments) {
                        collection.add(new ym21.Polyline(line.geometry.segments[j].way, {
                            hintContent: 'wid:' + line.geometry.segments[j].id
                        }, {
                            strokeWidth: 4,
                            strokeColor: (i + j) % 2 ? '#F00' : '#0F0'
                        }));
                    }
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
                addEvent: function (event, callback) {
                    collection.events.add(event, function (event) {
                        var target = event.get('target');
                        callback(idTable[target.properties.get('osmId')], 'yandex', target, event);
                    });
                },
                removeEvent: function (event) {
                    collection.events.remove(event);
                }
            };
        },

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
                addEvent: function (event, callback) {
                    collection.addListener(event, function (event) {
                        var target = event.feature;
                        callback(idTable[target.getProperty('osmId')], 'google', target, event);
                    });
                },
                removeEvent: function (event) {
                    collection.removeListener(event);
                }
            };
        }
    }

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

