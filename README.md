Module for Yandex, Google or other JS Maps for showing countries and regions of the world.

Based on [osme](https://github.com/theKashey/osme) and [Yandex.Maps](http://api.yandex.com/maps/doc/jsapi/).

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
But not all countries covered!

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

And what about boundary dispute? Crimea etc..

Options, the second parameter in geoJSON function contains field named `recombine`. This is not about boundaries, this is about recombination.
You can create new geometry by combination of others.
For example - this code included in world json file, and executed automatically
```
{
    disputedBorders: {
        ru: {
            60199/*UA*/: 'return region.hasParent(60199) && region.osmId != 72639 && region.osmId != 1574364 && region.osmId!=421866;',
            60189/*RU*/: 'return !region.hasParent(60189) && (region.osmId == 60189 || region.osmId == 72639 || region.osmId == 1574364)',
        }
    },
    postFilter: 'return !region.hasParent(60199);', //remove UA*
}
```
What this function do
 - for #60199 - select all object in 60199, but not Crimea and Kiev(internal shape)
 - for #60189 - selects RU plus Crimea regions
 - later - remove all regions of UA (exists in geoJSON file for this recombination)
You can set options.recombine to string ('ru' in this example) to select scheme, or set new scheme object. By default recombine==lang

Recombination can be used to join any set of regions in one. This is usefull in many cases.

```
 osmeRegions.geoJSON(addr, {lang: 'ru',quality:Q,type:T}, function (data, pureData) {
                if (1) {
                    var coords=osmeRegions.recombine(pureData, {
                        filter: function (region) {
                            // somethere in Province of Barcelona (349035) and Barcelona(2417889) or adjacent
                            return region.hasParent(349035) && (region.hasBorderWith(2417889) || region.osmId == 2417889);
                        }
                    });
                    for(var j in coords.coordinates) {
                        var region = new ymaps.GeoObject({
                            geometry: {
                                type: 'Polygon',
                                fillRule: 'nonZero',
                                coordinates: osmeRegions.flipCoordinate([coords.coordinates[j]])
                            }
                        }, {
                            opacity: 0.8,
                            fillColor: 'FEE',
                            strokeColor: 'F00',
                            strokeWidth: 2,
                            pixelRendering: 'static',
                            draggable: true
                        });
                        geoMap.geoObjects.add(region);
                    }
                }
```
And you got mini Barcelona
![BARS](http://kashey.ru/maps/osme/img/r3.png)

You can do anything (http://jsfiddle.net/9o9ak7fb/1/)

```
var countryColors={
    'CA': "F00",
    'IN': "0F0",
    'US': "00F",
    'RU': "F0F
};

function setColors(collection, countryColors){
     // You know this function
     collection.setStyles(function (object) {
        // get ISO counry code and color it
        var iso = object.properties.properties.iso3166.toUpperCase(),
            color=countryColors[iso];
        return ({
            strokeWidth: 1,
            strokeColor: color?'#000':"666",
            fillColor: color || 'EEE',
            visible: !!color
        });
    });
}

```
