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

export default nextTick;