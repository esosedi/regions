"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function getShortestPath(contour) {
    var halfWorld = 180;
    var result = [contour[0]],
        point = contour[0];
    for (var i = 1, l = contour.length; i < l; ++i) {
        var delta = point[0] - contour[i][0];
        if (Math.abs(delta) > halfWorld) {
            delta = delta < 0 ? -360 : 360;
        } else {
            delta = 0;
        }

        var nextPoint = [contour[i][0] + delta, contour[i][1]];
        result.push(nextPoint);
        point = nextPoint;
    }
    return result;
}

var getShortestContour = exports.getShortestContour = function getShortestContour(contour) {
    return contour.map(function (path) {
        return getShortestPath(path);
    });
};

exports.default = getShortestPath;