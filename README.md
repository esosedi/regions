Module for Yandex, Google or other JS Maps for showing countries and regions of the world.
Based on [osme](https://github.com/theKashey/osme) and Yandex.Maps
Information from [OpenStreetMap](http://openstreetmap.org), [Wikipedia](http://en.wikipedia.org) and other sources.

Created for and used by project [esosedi.org](http://ru.esosedi.org)

![US](http://kashey.ru/maps/osme/img/r2.png)

Usage is simple:
```
// ask for some region
osmeRegions.geoJSON('US'/*addr*/, {lang: 'de'}, function (data) {
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
Where `addr` is OSM RelationId, [ISO3166-2](https://ru.wikipedia.org/wiki/ISO_3166-2) code(US/DE/GB or RU-MOS/US-TX ets, or [world's region name](https://en.wikipedia.org/wiki/Subregion)



Information avail for 300k+ regions in 3 languages(en,de,ru) and some secret modes.
Not all countries covered!

This module uses CORS to transport JSON via different hosts.

You can store geojson produced by this module, or cache packed json files from data server.
You can change data server by executing `osmeRegions.setHost` command.
You have to provide copyright information.


More Examples:
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