This is a module designed for Yandex, Google or any other JS Maps to show countries, counties and regions of the world.

The module is based on [osme](https://github.com/theKashey/osme) and `regions` or [Yandex.Maps](http://api.yandex.com/maps/doc/jsapi/).
Runs on top of information from [OpenStreetMap](http://openstreetmap.org), [Wikipedia](http://en.wikipedia.org), [GeoNames](http://geonames.org), [eSosedi](http://ru.esosedi.org) and some other sources.

Created for and used by project [esosedi.org](http://ru.esosedi.org).

! And remember, this is neither lib nor API. This is a service !

It also, as any UGC project, may contain, contain and will `contain errors`, holes and mistakes.!

![US](http://kashey.ru/maps/osme/img/r2.png)

The module consists of two parts - this client-side regions.js and server-side at data.esosedi.org. Navigator can be found there - [data.esosedi.org](http://data.esosedi.org/)

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

Where `addr` is OSM RelationId, [ISO3166-2](https://ru.wikipedia.org/wiki/ISO_3166-2) code(US/DE/GB or RU-MOS/US-TX etc, or [world's region name](https://en.wikipedia.org/wiki/Subregion)

Information avail for 300k+ regions in 3 languages(en,de,ru) and some secret modes.
But not all countries covered!

This module uses CORS to transport JSON via different hosts.

You can store geojson produced by this module, or cache packed json files from data server.
You can change data server by executing `osmeRegions.setHost` command.
You have to provide copyright information.

Data format is quite simple and compact. It is look like [topojson](https://github.com/mbostock/topojson), but more "binary" and contains data like schemes etc.
After all you will get standard geoJSON. You can use it by your own risk.


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
 - for #60199 - select all objects in 60199, but not Crimea and Kiev(internal shape)
 - for #60189 - selects RU, plus Crimea regions.
 - later - remove all regions of UA (exists in geoJSON file for this recombination) cos we require countries.

You can set options.recombine to string ('ru' in this example) to select scheme, or set new scheme object. By default recombine==lang
By the same way you can join SJ to NO or GF to FR. Join US to CA and MX or create EuroUnion.
The goal is that result is `borderless`.

Recombination can be used to join any set of regions in one. This is usefull in many cases.

```
 osmeRegions.geoJSON(addr, {lang: 'en'}, function (data, pureData) {
    var coords=osmeRegions.recombine(pureData, { // yes, you can use pure data
        filter: function (region) {
            // somethere in Province of Barcelona (349035) and Barcelona(2417889) or adjacent
            // remember - you have to discard #349035 or you got duplicate.
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

You can do anything like country coloring (http://jsfiddle.net/9o9ak7fb/18/), or making "old" Moscow (http://jsfiddle.net/9o9ak7fb/17/).
OSMe provide geo data, you provide logic.

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

Where is also exists options.scheme - yet another recombination function. It also sometimes exists in source geoJSON file.
The goal still simple - some regions lays on the top of other, and do not have adjacent borders - Kiev, for example, and Kiev province.
Scheme just adds "hole" to province.


You dont need to understand all of this - just use.

Cheers, Kashey.