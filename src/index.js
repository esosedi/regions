import osmeRegions from "./regions.js";
import settings from "./settings";

if (typeof window === "undefined") {
  if (typeof __webpack_require__ === "undefined") {
    const r = eval("require");
    const http = r("http");
    // Overload load method
    settings.load = function(path, callback, errorCallback) {
      try {
        http
          .get(path, function(response) {
            let body = "";
            response.on("data", function(chunk) {
              body += chunk;
            });
            response.on("end", function() {
              try {
                const response = JSON.parse(body);
                callback(response);
              } catch (e) {
                errorCallback(e);
              }
              body = "";
            });
          })
          .on("error", function(e) {
            errorCallback(e);
          });
      } catch (e) {
        errorCallback(e);
      }
    };
  }
} else {
  window.osmeRegions = osmeRegions;
}

export default osmeRegions;
