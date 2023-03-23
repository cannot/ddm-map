
let newWaterDropMarker = L.icon({
    iconUrl: "lib/map/dist/images/water-drop-marker-a-new.png",
    iconSize: [36, 36]
});

let bitWaterDropMarker = L.icon({
    iconUrl: "lib/map/dist/images/water-drop-marker-a-bit.png",
    iconSize: [36, 36]
});

let lotWaterDropMarker = L.icon({
    iconUrl: "lib/map/dist/images/water-drop-marker-a-lot.png",
    iconSize: [36, 36]
});

map.on('zoom', function () {
    console.log('map.getZoom() -> ', map.getZoom())
});

map.on('pm:createend', async function (e) {
    _log(e, 'pm:created -> ');
});

map.on('pm:create', async function (e) {
    _log(e, 'pm:create -> ');
    var layer = e.layer;
    map.pm.disableDraw();

    layer.pm.enable({
        allowSelfIntersection: false,
    });
});
