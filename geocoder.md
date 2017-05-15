Osme has reverse geocode.

GET url: http://data.esosedi.org/geocode/v1?[lng=(ru|en)]&point=x,y[&seq=?][&callback=?]
Where point - target point, use callback for jsonp, and seq for tracking your requests.

Answer includes 2 main sections:
```
"target": {
    "l2": 60189,    // administrative level 2 ( Country )
    "l3": 1029256,  // 3
    "l4": 81995,
    "l5": 0,
    "l6": 1235817,
    "l7": 0,
    "l8": 1918618,  // 8 (normaly - last)
    "ll": 1918618,  // last level (up to 12)
    "iso": [        // iso3166-2 code
        "RU",
        "KLU"
    ]
},
```

And some of them (not all!) has link to names
```
"names": {
    "60189": {
        "name": "Россия",             // name
        "level": 2,                   // admin_level
        "iso1": "RU",                 // iso3166-1
        "visibleName": "Россия",      // esosedi name
        "references": {               // external reference
            "osm": {
                "relationId": 60189   // to osm relation id
            },
            "esosedi": 1000258596,    // to esosedi object
            "wikipedia": "en:Russia", // to wikipedia
            "geonames": 2017370       // to geonames
        },
        "boundingBox": [              // bounding box of region
            [
                41.1868,
                19.4142
            ],
            [
                82.0577,
                191.037
            ]
        ]
    }
```
