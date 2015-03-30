var osmeRegions = require("./regions.js"),
    http = require('http');

// Overload load method
osmeRegions.loadData = function (path, callback, errorCallback) {
    console.log('++',path);
    http.get(path, function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            try {
                var response = JSON.parse(body);
                callback(response);
            }catch(e){
                errorCallback(e);
            }
            body = '';
        });
    }).on('error', function (e) {
        errorCallback(e);
    });
};

module.exports = osmeRegions;
