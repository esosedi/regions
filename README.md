# regions
Module for Yandex, Google or other JS Maps for showing counties and regions of the world.
Based on OpenStreetMap, Wikipedia and other sources

Usage is simple:
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

Created for and used by esosedi.org