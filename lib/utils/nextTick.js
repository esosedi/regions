'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function nextTick(callback, args) {
    if (typeof setImmediate != 'undefined') {
        setImmediate(function () {
            callback.apply(this, args);
        });
    } else {
        setTimeout(function () {
            callback.apply(this, args);
        }, 0);
    }
}

exports.default = nextTick;