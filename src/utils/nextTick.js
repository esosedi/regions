function nextTick(callback, args) {
  Promise.resolve().then(() => callback.apply(this, args));
}

export default nextTick;
