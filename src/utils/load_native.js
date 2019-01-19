/**
 * Vanilla Ajax data transfer
 * @param {String} path
 * @param {Function} callback
 * @param {Function} errorCallback
 */
function load(path, callback, errorCallback) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 304) {
          try {
            var response = JSON.parse(xhr.responseText);
            callback(response);
          } catch (e) {
            errorCallback(e);
          }
        } else {
          errorCallback(xhr);
        }
      }
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send();
  } catch (e) {
    errorCallback(e);
  }
}

export default load;
