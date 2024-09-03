//Format Coords
function formatCoordinates(coords) {
    const [x, y, z] = coords.map(valor => Math.floor(valor));
    return `X: ${x}\nY: ${y}\nZ: ${z}`;
}

module.exports = formatCoordinates;