import load from './utils/load_native';

const settings = {
    HOST: 'http://data.esosedi.org/regions/v1/',
    GEOCODEHOST: 'http://data.esosedi.org/geocode/v1',
    DEBUG: false,
    cache: {},

    latLongOrder: 0,

    load: load
};

export default settings;