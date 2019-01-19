var codingCoefficient = 1 / 1000000,
  fraction = 2,
  dividor = 1 / 0xffff; // target resolution 65k, real 4k

/**
 * coordinateDecode
 * partof Yandex.Maps.API
 */
function decodeByteVector(x, N) {
  var point = 0;
  for (var i = 0; i < N; ++i) {
    point |= x.charCodeAt(i) << (i * 8);
  }
  return point;
}

function clampx(x) {
  return Math.min(180, Math.max(-180, x));
}

function clampy(y) {
  return Math.min(85, Math.max(-85, y));
}

function fromBase64(input) {
  input = input.replace(/_/g, "/").replace(/-/g, "+");
  if (typeof atob !== "undefined") {
    return atob(input);
  } else {
    // hide from webpack
    const B = eval("Buffer");
    return new B(input, "base64").toString("binary");
  }
}

function decodeLineBlock(encodedCoordinates) {
  var byteVector = fromBase64(encodedCoordinates),
    byteVectorLength = byteVector.length,
    bounds = [
      [
        decodeByteVector(byteVector.substr(0, 4), 4) * codingCoefficient,
        decodeByteVector(byteVector.substr(4, 4), 4) * codingCoefficient
      ],
      [
        decodeByteVector(byteVector.substr(8, 4), 4) * codingCoefficient,
        decodeByteVector(byteVector.substr(12, 4), 4) * codingCoefficient
      ]
    ],
    dimension = [bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]],
    result = [],
    index = 16,
    fx = dimension[0] * dividor,
    fy = dimension[1] * dividor;

  function read() {
    var ret = decodeByteVector(byteVector.substr(index, fraction), fraction);
    index += fraction;
    return ret;
  }

  while (index < byteVectorLength) {
    var position = [
      clampy(read() * fx + bounds[0][0]),
      clampx(read() * fy + bounds[0][1])
    ];
    result.push([position[1], position[0]]);
  }
  return result;
}

function decodeWay(lineBlock, wayId, osmeData) {
  if (osmeData.wayCache[wayId]) {
    return osmeData.wayCache[wayId];
  }
  return (osmeData.wayCache[wayId] = decodeLineBlock(lineBlock));
}

export default decodeWay;
