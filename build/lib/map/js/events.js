// var map = L.map('map').setView([39.74739, -105], 13);
var pr_lat =39.74739;
var pr_long =-105;
var pr_zoom =13;


var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var OpenStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var baseLayers = {
    "แผนที่": googleStreets,
    "ดาวเทียม": googleHybrid,
    "OpenStreetMap": OpenStreetMap
};
var overlays = {
    "ขอบเขตจังหวัด": "",
    "ขอบเขตอำเภอ": "",
    "ขอบเขตตำบล": "",
};


var point = L.layerGroup();
var map = L.map('map', {
    center: [39.73, -104.99],
    zoom: 10,
    layers: [googleStreets, cities]
});

var baseLayers = {
    "Grayscale": grayscale,
    "Streets": streets
};

var overlays = {
    "Cities": cities
};
L.control.layers(baseLayers, overlays).addTo(map);

var map = L.map('map', {
    center: [pr_lat, pr_long],
    zoom: pr_zoom,
    fullscreenControl: true,
    zoomControl: true,
    layers: [googleHybrid],
    contextmenu: false,
    // contextmenuWidth: 140,
    // contextmenuItems: [{
    //     text: 'Zoom extent',
    //     icon: '',
    //     callback: centerMap
    // },
    // {
    //     text: 'Zoom in',
    //     icon: '',
    //     callback: zoomIn
    // }, {
    //     text: 'Zoom out',
    //     icon: '',
    //     callback: zoomOut
    // }]
});


map.pm.addControls({
    position: 'topleft',
    drawControls: true,
    editControls: true,
    optionsControls: true,
    customControls: true,
    oneBlock: false,
    drawMarker: false,
    drawCircleMarker: false,
    cutPolygon:false
});
map.pm.setLang("de");


// L.control.groupedLayers(baseLayers, groupedOverlays).addTo(map);

// GEOSJON EXAMPLE
const geoJsonData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { customGeometry: { radius: 80 } },
        geometry: {
          type: 'Point',
          coordinates: [-0.153636, 51.486562, 77],
        },
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-0.15369, 51.486973, 77],
              [-0.153853, 51.48686, 77],
              [-0.154183, 51.486968, 77],
              [-0.154001, 51.487087, 77],
              [-0.15369, 51.486973, 77],
            ],
          ],
        },
      },
     
    ],
};
  
const theCollection = L.geoJson(geoJsonData, {
    pointToLayer: (feature, latlng) => {
        if (feature.properties.customGeometry) {
        return new L.Circle(latlng, feature.properties.customGeometry.radius);
        } else {
        return new L.Marker(latlng);
        }
    },
    // onEachFeature: (feature, layer) => {
    //     layer.addTo(map2);
    // },
}).addTo(map);
  
// const b = theCollection.getBounds();
// map.fitBounds(b);

loadMarker();

function logEvent(e){
    console.log(e);
}

map.on('pm:drawstart',function (e) {
    logEvent(e);
    var layer = e.workingLayer;

    layer.on('pm:vertexadded', logEvent);
    layer.on('pm:snapdrag', logEvent);
    layer.on('pm:snap', logEvent);
    layer.on('pm:unsnap', logEvent);
    layer.on('pm:centerplaced', logEvent);

});
map.on('pm:drawend',logEvent);
map.on('pm:create',function (e) {
    logEvent(e);
    var layer = e.layer;

    map.pm.disableDraw();

    layer.pm.enable({
        allowSelfIntersection: false,
    });

    //Edit Event
    layer.on('pm:edit', logEvent);
    layer.on('pm:update', logEvent);
    layer.on('pm:enable', logEvent);
    layer.on('pm:disable', logEvent);
    layer.on('pm:vertexadded', logEvent);
    layer.on('pm:vertexremoved', logEvent);
    layer.on('pm:markerdragstart', logEvent);
    layer.on('pm:markerdrag', logEvent);
    layer.on('pm:markerdragend', logEvent);
    layer.on('pm:snap', logEvent);
    layer.on('pm:snapdrag', logEvent);
    layer.on('pm:unsnap', logEvent);
    layer.on('pm:intersect', logEvent);
    layer.on('pm:centerplaced', logEvent);

    //Drag event
    layer.on('pm:dragstart',logEvent);
    layer.on('pm:drag',logEvent);
    layer.on('pm:dragend',logEvent);

    //Cut event
    layer.on('pm:cut',logEvent);

    //Remove event
    layer.on('pm:remove',logEvent);
});

//Toggle mode events
map.on('pm:globaleditmodetoggled',logEvent);
map.on('pm:globaldragmodetoggled',logEvent);
map.on('pm:globalremovalmodetoggled',logEvent);
map.on('pm:globaldrawmodetoggled',logEvent);
map.on('pm:globalcutmodetoggled',logEvent);

//Remove event
map.on('pm:remove',logEvent);
map.on('layerremove',logEvent);

//Cut event
map.on('pm:cut',logEvent);

//Language changed
map.on('pm:langchange',logEvent);

map.pm.setLang("en");
