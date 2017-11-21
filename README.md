# regions (code name osme)
The source of World's administrative divisions.

This is a module designed for: 
 - [Yandex](https://tech.yandex.com/maps/), 
 - [Google](https://developers.google.com/maps/), 
 - [Leaflet](http://leafletjs.com/), 
 - any other JS Maps to outline countries, counties and regions of the world.
 - being just a getJSON provider
 
 
Each time you want to display borders - use the regions, Luke.
 
[![NPM](https://nodei.co/npm/osme.png?downloads=true&stars=true)](https://nodei.co/npm/osme/)

Runs on top of information from [OpenStreetMap](http://openstreetmap.org), [Wikipedia](http://en.wikipedia.org), [GeoNames](http://geonames.org), [eSosedi](http://ru.esosedi.org) and some other sources.

Created for and used by [esosedi.org](http://ru.esosedi.org) project - one of largest cartographical site in the World.

* This is neither lib nor API. This is a service.

```js
 import osme from 'osme';
```
or 
```html
 <script src="https://unpkg.com/osme"></script>
 // use window.osme
```
![World](/_extra/images/world.png?raw=true) 
 
# API
There is only 2 primary commands:
  * osme.geoJSON(addr, [options], [callback]):Promise - to get geoJSON for a region query
  * osme.geocode(point, [options], [callback], [errorCallback]):Promise  - to find region by coordinates

Plus we include build-in wrappers for Yandex Maps API, Google Maps API and Leaflet.
  * osme.toGoogle(geoJson)
  * osme.toYandex(geoJson)
  * osme.toLeaflet(geoJson)
      
  All collections will have interface of .add .remove .setStyles .addEvent .removeEvent.
  
 
  Result it very simple - you can display any continent, country or state on a map.

# As Service

The module consists in two parts, and this part is a client side. 
It does not contain _any_ data, always striming it from the server side at [data.esosedi.org](http://data.esosedi.org). 
Server-side also implements online `navigator` via database to help you find proper place.

* base service runs as 'http' service. Not https!, to https is provided by cloudflare and geolocated.org.

# What I can load?
   
 So, you can load: 
 * `world` - all countries of the World.
 * geoScheme - 21 macro region of the World.
 _Africa, Americas, Asia, Europe, Oceania, Eastern Africa, Middle Africa, Northern Africa, Southern Africa, Western Africa, Cariebbean, Central America, Northern America, South America, Central Asia, Eastern Asia, South-Eastern Asia, Southern Asia, Western Asia, Eastern Europe, Northern Europe, Southern Europe, Western Europe, Australia and New Zealand, Melanesia, Micronesia, Polynesia._
 * iso3166-1 code. Country code. US, AU, DE and so on
 * iso3166-2 code. Region. US-WA, AU-NSW, RU-MOW and so on
 * special exports. bigMoscow, Moscow, SaintPetersburg, bigPiter and so on. Open a Pull Request if you need a special one.
 * `number` - as a OpenStreetMap RelationID. Ie - you can get contour of USA using `US` or `148838`, there is no difference.

# Example
* And check /examples folder!

 ```javascript
 import osmeRegions from 'osme';
 osme.geoJSON('FR').then( geojson => osme.toGoogle(geojson).add(map));
 ```

A bit bigger one:
```
// ask for some region
osme.geoJSON('US'/*addr*/, {lang: 'de'}, function (data) {
    // data is pure GEOJSON
    
    // you can create some helpers
    var yandexGeoObjectColletionWrapper = osme.toYandex(data);
    // or
    var googleDataWrapper = osme.toGoogle(data);
    // or 
    var leafletDataWrapper = osme.toLeaflet(data);

    // call .add to add data into the map
    yandexGeoObjectColletionWrapper.add(map);
    // call .remove to remove
    googleDataWrapper.remove();
    
    // call setStyles to setup styles
    leafletDataWrapper.setStyles(jsonFeatureIn => {
       return styleOptions
    });
    
    // And you also can control events.
    *.addEvent(event,function(feature, apiType, apiObject, apiEvent){});
    *.removeEvent();
})

// PS: OR you can use geoJSON as geoJSON. With out helpers
    new L.geoJson(data).addTo(map);
```

# .geoJSON
* osme.geoJSON(addr, options, callback)
Where:
 `addr` is OSM RelationId, [ISO3166-2](https://ru.wikipedia.org/wiki/ISO_3166-2) code(US/DE/GB or RU-MOS/US-TX etc, or [world's region name](https://en.wikipedia.org/wiki/Subregion)
 `options` is a object of { lang, quality, type, nocache, postFilter, recombine, scheme }. All are optional.
 
        - lang - prefered language (en,de,ru)
        - quality – set 0 to get geomentry for fullHD resolution. -1,0,+1,+2 for /4, x1, x4, x16 quality.
        - type - null|'coast'. 
          - null to get `raw` `maritime` administrative borders, including terrotorial water.
          - "coast", to cut off coast lines.
        - nocache - turns of internal client-side cache
        - postFilter, recombine, scheme - to be used only by advanced users. 
        

If you dont know relationId(`addr`) for region you need, you can:
1. Traverse map database at [http://data.esosedi.org](http://data.esosedi.org).
2. Use reverse geocode, via this lib, or via REST call - http://data.esosedi.org/geocode/v1?[lng=(ru|en)]&point=x,y[&seq=?][&callback=?]
3. Use [iso3166](https://github.com/esosedi/3166) library to get administrative divisions as a list.

### type=coast
Type coast will return information you want - pretty borders. Very hi-detailed borders.
Here is comparison between borders for Greece with and without maritime.
[Greece](/_extra/images/maritime.png?raw=true)
Difference - 154kb versus 251.

### PS:
Information available for ~300k regions in 3 languages(en, de, ru) and some secret modes.

This module uses CORS to transport JSON via different hosts.

You can store geojson produced by this module, or cache packed json files from orinal data endpoint.

Just change data-endpoint by executing `osme.setHost` command.

* Remember: We have to provide copyright information, and you have to display it.

Data format is quite simple and compact. It is look like [topojson](https://github.com/mbostock/topojson), but more "binary" and contains data like schemes etc.
After all you will get standard geoJSON. You can use it by your own risk.

More Examples:
```

// request Moscow
osme.geoJSON('RU-MOW', {lang: 'ru'}, function (data) {
    var collection = osme.toYandex(data, ymaps);
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
        
    // colorize the collection    
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
```
![Moscow](/_extra/images/moscow.png?raw=true)

# setStyles

You can do anything like country coloring (http://jsfiddle.net/9o9ak7fb/18/), or making "old" Moscow (http://jsfiddle.net/9o9ak7fb/17/).
OSMe provide geo data, you provide logic.

```
var countryColors={
    'CA': "F00",
    'IN': "0F0",
    'US': "00F",
    'RU': "F0F"
};

function setColors(collection, countryColors){
     // You know this function
     collection.setStyles(function (object) {
        // get ISO counry code and color it
        var iso = (object.properties.properties.iso3166 ||'').toUpperCase(),
            color=countryColors[iso];
        return ({
            strokeWidth: 1,
            strokeColor: color?'#000':"666",
            fillColor: color || 'EEE',
            visible: !!color
        });
    });
}

//...
osme.geoJSON('world',{}).then(data => {
  const collection = osme.toGoogle(data);
  setColors(collection, countryColors);
  collection.add(map);
});
```
![Colour](/_extra/images/colorworld.png?raw=true)

# addEvents

```javascript
  //any event - click, dblclick and so on.
 const event = collection.addEvent('dblclick', function (object, type, target, event) {
     // object - object itself
     // type – [eventName, provider('yandex','google')]
     // target – Maps API`s feature (polygon) 
     // event – original event    
    event.preventDefault();
 });
 collection.removeEvent(event);
```

And what about boundary dispute? Crimea, Kosovo, etc..

# Magic of Recombine 

Recall strange parameter in options, field named `recombine`. This is not about boundaries, this is about recombination.
It is almost as language - en-US, or en-GB..

* It can be string, and will be treated as key in scheme. Default equals to language.
* Object with key - relation id, and value - javascript code.

See disputed-borders.html in /examples.

Recombination allow you to create new geometry by combination of others.

For example something from internal cuisine - this code included in world.json file, and executed automatically
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
What this function do - it generates Ukraine without Crimea, or Russia with.
 - for #60199(Ukraine) - select all objects in 60199, but not Crimea and Kiev(internal shape)
 - for #60189(Russia) - selects RU, plus Crimea regions.
 - later - remove all regions of UA (exists in geoJSON file for this recombination) cos we require countries.

You can set options.recombine to a string ('ru' in this example) to select desired scheme, or set new scheme object. 

* By default recombine===lang.

By the same way you can join SJ to NO or GF to FR (one will understand).
 
You can create Merica by joining US to CA and MX or create EuroUnion.

The difference between recombination and just displaying everything you need - 
the result of recombination is `borderless`. You will get not a pack of shapes, but BIG one.

Recombination can be used to join any set of regions in one. This is usefull in many cases.

```
 osme.geoJSON('349035', {lang: 'en'}, function (data, pureData) {
    var coords=osme.recombine(pureData, { // yes, you can use pure data
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
                coordinates: osme.flipCoordinate([coords.coordinates[j]])
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
![Barcelona](/_extra/images/bars.png?raw=true)

Where is also exists options.scheme - yet another recombination function. It also sometimes exists in source geoJSON file.
The goal still simple - some regions lays on the top of other, and do not have adjacent borders - Kiev, for example, and Kiev province.
Scheme just adds "hole" to province.


You dont need to understand all of this - just use.

# Remember
* ! As any UGC project, may contain, contain and will `contain errors`, holes in data and mistakes.


Cheers, Kashey.