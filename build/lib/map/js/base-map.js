// var map = L.map('map').setView([39.74739, -105], 13);

var queryParams = getQueryParams();

/** Development (LOCAL) */
/** var map_host = 'http://sitdev.dyndns.org:8082'; */
// var api_host = 'http://sitdev.dyndns.org:9131';
// var map_host = 'http://localhost';

/** Staging (SITDEV) */
var api_host = 'http://sitdev.dyndns.org:9131';
var map_host = "http://sitdev.dyndns.org:9130";

/** Production */
// var api_host = 'http://172.19.10.139:8080';
// var map_host = "http://172.19.9.112:8081"; // server-01
// var map_host = "http://172.19.9.113:8081"; // server-02


// var defaultControlOptions = {
//     position: 'bottomright',
//     autoTracingOption: false,
//     customControls: true,
//     cutPolygon: false,
//     dragMode: false,
//     drawCircle: false,
//     drawCircleMarker: false,
//     drawControls: true,
//     drawMarker: false,
//     drawPolygon: false,
//     drawPolyline: true,
//     drawRectangle: false,
//     drawText: false,
//     editControls: true,
//     editMode: false,
//     oneBlock: false,
//     optionsControls: true,
//     pinningOption: false,
//     removalMode: false,
//     rotateMode: false,
//     scaleMode: false,
//     snappingOption: false,
//     splitMode: false,
// }

var defaultControlOptions = {
  position: 'bottomright',
  drawControls: true,
  editControls: true,
  optionsControls: true,
  customControls: true,
  oneBlock: false,
  drawText: false,
  drawMarker: false,
  drawCircleMarker: false,
  drawPolyline: false,
  cutPolygon: false,
  drawPolygon: false,
  drawRectangle: false,
  drawCircle: false,
  rotateMode: false,
  editMode: true,
}

var googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 30,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  maxZoom: 30,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var wlmaDma = L.tileLayer.wms(map_host + `/geoserver/WLMAPRO/wms?viewparams=condition:g.branch='${queryParams.branchCode}'`,
  {
    layers: 'WLMAPRO:VW_DMA',
    format: 'image/png',
    styles: 'SLD_DMA',
    maxZoom: 30,
    transparent: true,
  });

var wlmaPipe = L.tileLayer.wms(map_host + `/geoserver/WLMAPRO/wms?viewparams=condition:g.branch='${queryParams.branchCode}'`,
  {
    layers: 'WLMAPRO:VW_PIPE',
    format: 'image/png',
    styles: 'SLD_PIPE',
    maxZoom: 30,
    transparent: true,
  });

var map = L.map('map', {
  center: [13.753099599921299, 100.49408777071919],
  zoom: 10,
  zoomSnap: 0.05,
  editable: true,
  fullscreenControl: true,
  zoomControl: false,
  layers: [googleStreets, wlmaDma, wlmaPipe],
});

console.log('wlmaPipe', wlmaPipe);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);


/* setup controls configulation (modified by samart.k) */
const updateControlOptions = {};
if (typeof changeControlOptions === 'undefined') {
  var changeControlOptions = {};
}
Object.keys(defaultControlOptions).forEach(key => updateControlOptions[key] = (changeControlOptions.hasOwnProperty(key) ? changeControlOptions[key] : defaultControlOptions[key]));
map.pm.addControls(updateControlOptions);
/* setup controls configulation (modified by samart.k) */

// add screen shoter to map (modified by samart.k)
var shoter = L.simpleMapScreenshoter({
  hidden: true,
}).addTo(map)
// add screen shoter to map (modified by samart.k)

// add scale factor to map (modified by samart.k)
L.control.scalefactor().addTo(map);
// add scale factor to map (modified by samart.k)

function logEvent(e) {
  console.log(e);
}

map.pm.setLang("en");

async function initialExtendByAreaCode() {
  if (queryParams.areaCode == undefined || queryParams.areaCode == "") return;
  var rootUrl = map_host + `/geoserver/WLMAPRO/ows`;
  var defaultParameters = {
    viewparams: `condition:g.dma='${queryParams.areaCode}'`,
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: "WLMAPRO:VW_DMA",
    maxFeatures: 200,
    outputFormat: "application/json",
    format_options: "callback: getJson",
    srsName: "EPSG:4326",
  };
  var parameters = L.Util.extend(defaultParameters);
  return $.ajax({
    url: rootUrl + L.Util.getParamString(parameters),
    dataType: "json",
    type: "GET",
    success: function (r) {
      if (r.features.length !== 0) {
        var g = new L.featureGroup();
        L.geoJson(r, {
          onEachFeature: function (_group, _layer) {
            // console.log("_group (area) -> ", _group);
            // console.log("_layer (area) -> ", _layer);
          },
        }).addTo(g);
        return g;
        // map.fitBounds(featureGroup.getBounds());
      }
    },
  });
}

async function initialExtendByBranchCode() {
  if (queryParams.branchCode == undefined || queryParams.branchCode == "") return;
  var rootUrl = map_host + `/geoserver/WLMAPRO/ows`;
  var defaultParameters = {
    viewparams: `condition:g.branch='${queryParams.branchCode}'`,
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: "WLMAPRO:VW_DMA",
    maxFeatures: 200,
    outputFormat: "application/json",
    format_options: "callback: getJson",
    srsName: "EPSG:4326",
  };
  var parameters = L.Util.extend(defaultParameters);
  return $.ajax({
    url: rootUrl + L.Util.getParamString(parameters),
    dataType: "json",
    type: "GET",
    success: function (r) {
      if (r.features.length !== 0) {
        var g = new L.featureGroup();
        var x = L.geoJson(r, {
          onEachFeature: function (_group, _layer) {
            // console.log("_group (branch) -> ", _group);
            // console.log("_layer (branch) -> ", _layer);
          },
        }).addTo(g);
        console.log("featureGroup -> ", g);
        console.log("branch (geojson) -> ", x.toGeoJSON());
        return g;
        // map.fitBounds(featureGroup.getBounds());
      }
    },
  });
}

async function fetchExtendByAreaCode() {
  return new Promise((resolve, reject) => {
    if (queryParams.areaCode == undefined || queryParams.areaCode == "") resolve(null);
    var rootUrl = map_host + `/geoserver/WLMAPRO/ows`;
    var parameters = {
      viewparams: `condition:g.dma='${queryParams.areaCode}'`,
      service: "WFS",
      version: "1.0.0",
      request: "GetFeature",
      typeName: "WLMAPRO:VW_DMA",
      maxFeatures: 200,
      outputFormat: "application/json",
      format_options: "callback: getJson",
      srsName: "EPSG:4326",
    };
    $.ajax({
      url: rootUrl + L.Util.getParamString(L.Util.extend(parameters)),
      dataType: "json",
      type: "GET",
      success: function (r) {
        resolve(r);
      },
      failure: function (e) {
        reject(e);
      }
    });
  });
}

async function fetchExtendByBranchCode() {
  return new Promise((resolve, reject) => {
    if (queryParams.branchCode == undefined || queryParams.branchCode == "") resolve(null);
    var rootUrl = map_host + `/geoserver/WLMAPRO/ows`;
    var parameters = {
      viewparams: `condition:g.branch='${queryParams.branchCode}'`,
      service: "WFS",
      version: "1.0.0",
      request: "GetFeature",
      typeName: "WLMAPRO:VW_DMA",
      maxFeatures: 200,
      outputFormat: "application/json",
      format_options: "callback: getJson",
      srsName: "EPSG:4326",
    };
    $.ajax({
      url: rootUrl + L.Util.getParamString(L.Util.extend(parameters)),
      dataType: "json",
      type: "GET",
      success: function (r) {
        resolve(r);
      },
      failure: function (e) {
        reject(e);
      }
    });
  });
}

async function fetchPipeByBranchCode() {
  return new Promise((resolve, reject) => {
    if (queryParams.branchCode == undefined || queryParams.branchCode == "") reject();
    var rootUrl = map_host + `/geoserver/WLMAPRO/ows`;
    var parameters = {
      viewparams: `condition:g.branch='${queryParams.branchCode}'`,
      service: "WFS",
      version: "1.0.0",
      request: "GetFeature",
      typeName: "WLMAPRO:VW_PIPE",
      maxFeatures: 200,
      outputFormat: "application/json",
      format_options: "callback: getJson",
      srsName: "EPSG:4326",
    };
    $.ajax({
      url: rootUrl + L.Util.getParamString(L.Util.extend(parameters)),
      dataType: "json",
      type: "GET",
      success: function (r) {
        resolve(r);
      },
      failure: function (e) {
        reject(e);
      }
    });
  });
}
