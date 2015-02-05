Module for Yandex, Google or other JS Maps for showing counties and regions of the world.
Based on OpenStreetMap, Wikipedia and other sources.

![US](http://kashey.ru/maps/osme/img/r2.png)

Usage is simple:
```
 osmeRegions.geoJSON(addr, {lang: 'ru'}, function (data) {
    // and data is "GEO JSON"
    var yandexGeoObjectColletionWrapper = osmeRegions.toYandex(data);
    var googleDataWrapper = osmeRegions.toGoogle(data);

    yandexGeoObjectColletionWrapper.add(map);
    googleDataWrapper.remove();
    ...
    *.setStyles(function(jsonFeatureIn){
       return styleOptions
    });
    *.addEvent(event,function(feature, apiType, apiObject, apiEvent){});
    *.removeEvent();
 })
```
Where `addr` is OSM relation IS, ISO3166-2 code or world's region name

Created for and used by [esosedi.org](http://ru.esosedi.org)

example:
```
            osmeRegions.geoJSON('RU-MOW', {lang: 'ru'}, function (data) {
                var collection = osmeRegions.toYandex(data, ymaps);
                collection.add(geoMap);

                geoMap.setBounds(collection.collection.getBounds(), {duration: 300});
                var strokeColors = [
                    '#000',
                    '#F0F',
                    '#00F',
                    '#0FF',
                ];
                var meta = data.metaData,
                        maxLevel = meta.levels[1] + 1;
                collection.setStyles(function (object, yobject) {
                    var level = object.properties.level;
                    return ({
                        zIndex: level,
                        zIndexHover: level,
                        strokeWidth: Math.max(1, level == 2 ? 2 : (maxLevel - level)),
                        strokeColor: strokeColors[maxLevel - level] || '#000',
                        fillColor: '#FFE2',
                    });
                });

                collection.addEvent('dblclick', function (object, type, target) {
                    var osmId = object.properties.osmId;
                    event.preventDefault();
                });
```

![MOW](http://kashey.ru/maps/osme/img/r1.png)