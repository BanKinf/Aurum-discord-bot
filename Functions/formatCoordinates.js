//Format Coords
function formatCoordinates(coords) {
    const [x, y, z] = coords.map(valor => Math.floor(valor));
    return `**X**: ${x}\n**Y**: ${y}\n**Z**: ${z}`;
}

module.exports = formatCoordinates;