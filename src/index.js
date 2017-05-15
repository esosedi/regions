import osmeRegions from "./regions.js"
import settings from './settings';

if (typeof window === 'undefined') {
    var http = require('http');
// Overload load method
    settings.load = function (path, callback, errorCallback) {
        try {
            http.get(path, function (response) {
                var body = '';
                response.on('data', function (chunk) {
                    body += chunk;
                });
                response.on('end', function () {
                    try {
                        var response = JSON.parse(body);
                        callback(response);
                    } catch (e) {
                        errorCallback(e);
                    }
                    body = '';
                });
            }).on('error', function (e) {
                errorCallback(e);
            });
        } catch (e) {
            errorCallback(e);
        }
    };
} else {
    window.osmeRegions = osmeRegions;
}

export default osmeRegions;