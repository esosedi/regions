import load from "./utils/load_native";

const settings = {
  HOST:
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "https://osme.geolocated.org/regions/v1/"
      : "http://data.esosedi.org/regions/v1/",
  GEOCODEHOST: "http://data.esosedi.org/geocode/v1",
  DEBUG: false,
  cache: {},

  latLongOrder: 0,

  load: load
};

export default settings;
