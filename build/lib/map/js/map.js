// var map = L.map('map').setView([39.74739, -105], 13);

var queryParams = getQueryParams();

// var url_api ='http://192.168.170.70:12008';
var url_api = 'http://sitdev.dyndns.org:9131';
// var url_map = 'http://sitdev.dyndns.org:8082';
var url_map = 'http://localhost:90';

var pr_lat = 39.74739;
var pr_long = -105;
var pr_zoom = 16.80;
var pointTrack = L.layerGroup();
var pointTrackHistory = L.layerGroup();
var pointOffice = L.layerGroup();
var layer_restrictarea = L.layerGroup();
var layer_route = L.featureGroup();

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
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    cutPolygon: false,
    drawPolygon: false,
    drawRectangle: false,
    drawCircle: false,
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

var wlmaDma = L.tileLayer.wms(url_map + `/geoserver/WLMAPRO/wms?viewparams=condition:g.branch='${queryParams.branchCode}'`,
    {
        layers: 'WLMAPRO:VW_DMA',
        format: 'image/png',
        styles: 'SLD_DMA',
        maxZoom: 30,
        transparent: true,
    });

var wlmaPipe = L.tileLayer.wms(url_map + `/geoserver/WLMAPRO/wms?viewparams=condition:g.branch='${queryParams.branchCode}'`,
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
    fullscreenControl: true,
    zoomControl: false,
    layers: [googleStreets, pointOffice, pointTrack, pointTrackHistory, layer_restrictarea, layer_route, wlmaDma, wlmaPipe],
});

var zoomControl = L.control.zoom({
    position: "bottomright"
}).addTo(map);


// console.log('wlmaPipe -> ', wlmaPipe);

//var sidebar = L.control.sidebar('sidebar', {
//    closeButton: true,
//    position: 'left'
//});
//map.addControl(sidebar);

//var customControl = L.Control.extend({
//    options: {
//        position: 'topleft'
//    },
//    onAdd: function (map) {
//        var container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
//        container.innerHTML = '<a id="iconroutehistory" style="outline: none; font-size:14px" class="fa fa-search" href="#"></a>';
//        container.onclick = function () {
//            document.getElementById("sidebar").style.display = "block";
//            sidebar.toggle();
//        }
//        return container;
//    }
//});
//map.addControl(new customControl());

var baseLayers = {
    "แผนที่": googleStreets,
    "ภาพถ่ายดาวเทียม": googleHybrid,
    "OpenStreetMap": osm
};

var overlays = {
    "สำนักงาน/ด่านศุลกากร": pointOffice,
    "ตำแหน่งอุปกรณ์": pointTrack
};

let contractNo = getParameterByName("contractNo");
let routeNo = getParameterByName("routeNo");
switch (page) {
    case "MapHome":
        overlays = {
            "สำนักงาน/ด่านศุลกากร": pointOffice,
            "ตำแหน่งอุปกรณ์": pointTrack,
            "ประวัติตำแหน่งอุปกรณ์": pointTrackHistory
        };
        // loadDepartment();
        loadMarker();
        // loadDeviceInfo();
        // setInterval(loadDeviceInfo, 10000);
        break;
    case "MapHistory":
        overlays = {
            "สำนักงาน/ด่านศุลกากร": pointOffice,
            "ตำแหน่งอุปกรณ์": pointTrack,
            "ประวัติตำแหน่งอุปกรณ์": pointTrackHistory
        };
        loadDeviceInfo();
        setInterval(loadDeviceInfo, 10000);
        break;
    case "Map115":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        if (contractNo == '') {
            loadContractList();
        }
        else {
            loadRoute(contractNo, routeNo);
        }
        break;
    case "Map220":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        loadRoute(true);
        break;
    case "Map300":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        loadRoute(true);
        break;
    case "Map301":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };

        if (contractNo == '') {
            loadContractList();
        }
        else {
            loadRoute(contractNo);
        }

        break;
    case "Map302":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        loadRoute(true);
        break;
    case "Map303":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        loadRoute(true);
        break;
    case "Map350":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        loadRoute(true);
        break;
    case "Map419":
        overlays = {
            "ขอบเขตพื้นที่เฝ้าระวัง": pointTrack,
            "ท่อประปา": wmsPipe,
            "วาดท่อประปา": layer_route,
        };
        //loadContractList();
        break;
    case "MapDevice":
        overlays = {
            "สำนักงาน/ด่านศุลกากร": pointOffice,
            "ตำแหน่งอุปกรณ์": pointTrack,
            "เส้นทาง": layer_route,
            "พื้นที่หวงห้าม": layer_restrictarea
        };
        loadRestrictArea();
        break;
    case "Map113-LD-B":
        overlays = {};
        break
    case "Map113-LD-A":
        overlays = {};

        break
}

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

// map.pm.setLang("de");
// var visible = map.pm.controlsVisible();
// map.pm.Toolbar.setButtonDisabled('drawMarker', false);
// map.pm.Toolbar.isVisible= false;

// map.pm.removeControls();


// const geoJsonData = {
//     type: 'FeatureCollection',
//     features: [
//         {
//             type: 'Feature',
//             properties: { customGeometry: { radius: 80 } },
//             geometry: {
//                 type: 'Point',
//                 coordinates: [-0.153636, 51.486562, 77],
//             },
//         },
//         {
//             type: 'Feature',
//             properties: {},
//             geometry: {
//                 type: 'Polygon',
//                 coordinates: [
//                     [
//                         [-0.15369, 51.486973, 77],
//                         [-0.153853, 51.48686, 77],
//                         [-0.154183, 51.486968, 77],
//                         [-0.154001, 51.487087, 77],
//                         [-0.15369, 51.486973, 77],
//                     ],
//                 ],
//             },
//         },

//     ],
// };

// const theCollection = L.geoJson(geoJsonData, {
//     pointToLayer: (feature, latlng) => {
//         if (feature.properties.customGeometry) {
//             return new L.Circle(latlng, feature.properties.customGeometry.radius);
//         } else {
//             return new L.Marker(latlng);
//         }
//     },
//     // onEachFeature: (feature, layer) => {
//     //     layer.addTo(map2);
//     // },
// }).addTo(map);

// const b = theCollection.getBounds();
// map.fitBounds(b);


function logEvent(e) {
    console.log(e);
}

function logEvent_end(e) {
    logEvent('logEvent_end');
    logEvent(e);
    if (!map.pm.globalEditEnabled()) {
        // var layer = e.layer;
        // var coords = e.layer.getLatLngs();
        // let obj = {
        //     type:layer.pm._shape,
        //     coordinates: layer.pm._shape =='Line' ? coords : coords[0]
        //     //coordinates: value.editing.latlngs[0][0]
        //     };

        jQuery.each(map._layers, function (index, value) {



            // var coords =value.getLatLngs();
            // let obj2 = {
            //     type:layer.pm._shape,
            //     coordinates: layer.pm._shape =='Line' ? coords : coords[0]
            //     //coordinates: value.editing.latlngs[0][0]
            //     };



            if (value._latlngs != undefined && typeof _routeNo !== 'undefined' && value.feature.properties.routeNo === _routeNo) {

                let _edit_coordinates = [];
                if (value.pm._markers != undefined) {
                    for (var i = 0; i < value.pm._markers.length; i++) {
                        _edit_coordinates.push(value.pm._markers[i]._latlng);
                    }

                    console.log('_edit_coordinates:', _edit_coordinates);
                    let obj = {
                        type: "Line",
                        coordinates: _edit_coordinates
                    };
                    // SaveRoute(obj);
                }


            }
        });
    }
}

map.on('zoom', function () {
    console.log('map.getZoom() -> ', map.getZoom())
});

map.on('pm:drawstart', function (e) {
    logEvent('pm:drawstart');
    logEvent(e);
    var layer = e.workingLayer;

    // layer.on('pm:vertexadded', logEvent);
    // layer.on('pm:snapdrag', logEvent);
    // layer.on('pm:snap', logEvent);
    // layer.on('pm:unsnap', logEvent);
    // layer.on('pm:centerplaced', logEvent);

});

// map.on('pm:globaleditmodetoggled', e => {
//     if (e.enabled === true) {
//         console.log('pm:globaleditmodetoggled -> start!', e);
//     } else {
//         console.log('pm:globaleditmodetoggled -> ended!', e);
//     }
// });

// map.on('pm:globaldragmodetoggled', async function (e) {
//     if (e.enabled === true) {
//         console.log('pm:globaldragmodetoggled -> start!', e);
//     } else {
//         console.log('pm:globaldragmodetoggled -> ended!', e);
//     }
// });

map.on('pm:dragend', function (e) {
    console.log('pm:dragend -> ', e);
});


// map.on('pm:drawend', logEvent_end);
map.on('pm:create', async function (e) {
    logEvent('pm:create');
    logEvent(e);
    var layer = e.layer;
    // var coords = e.layer.getLatLngs();
    // let obj = {
    //     type: layer.pm._shape,
    //     coordinates: layer.pm._shape == 'Line' ? coords : coords[0]
    //     //coordinates: value.editing.latlngs[0][0]
    // };


    map.pm.disableDraw();


    if (page === "Map113-LD-B") {
        if (layer.pm._shape == 'Line') {
            console.log('line created -> ', e);
        }

        if (layer.pm._shape == 'Polygon') {
            /**
             * Add edit and move event handler
             */
            layer.on('pm:dragend', async function (e) {
                console.log('my-polygon > dragged -> ', e)
                await saveLeakDetectBeforeStep(e.layer);
            })
                .on('pm:update', async function (e) {
                    console.log('my-polygon > updated -> ', e)
                    await saveLeakDetectBeforeStep(e.layer);
                }).on('pm:remove', async function (e) {
                    console.log('my-polygon > removed -> ', e)
                    showPolygonDrawer();
                });

            /*
            Hide drawing controls
            */
            hidePolygonDrawer();
            //hidePolylineDrawer();
            /*
            Hide drawing controls
            */

            initialQueryStringAndDrawer(e, L);
            await saveLeakDetectBeforeStep(e.layer);
        }
    }


    // OpenBeforeLeakDetectModal(e, L);

    // SaveRoute(obj);
    layer.pm.enable({
        allowSelfIntersection: false,
    });

    //Edit Event
    // layer.on('pm:edit', logEvent);
    // layer.on('pm:update', logEvent);
    // layer.on('pm:enable', logEvent);
    // layer.on('pm:disable', logEvent);
    // layer.on('pm:vertexadded', logEvent);
    // layer.on('pm:vertexremoved', logEvent);
    // layer.on('pm:markerdragstart', logEvent);
    // layer.on('pm:markerdrag', logEvent);
    // layer.on('pm:markerdragend', logEvent);
    // layer.on('pm:snap', logEvent);
    // layer.on('pm:snapdrag', logEvent);
    // layer.on('pm:unsnap', logEvent);
    // layer.on('pm:intersect', logEvent);
    // layer.on('pm:centerplaced', logEvent);

    // //Drag event
    // layer.on('pm:dragstart', logEvent);
    // layer.on('pm:drag', logEvent);
    // layer.on('pm:dragend', logEvent_end);

    // //Cut event
    // layer.on('pm:cut', logEvent);

    // //Remove event
    // layer.on('pm:remove', logEvent);
});

//     map.on('pm:globaleditmodetoggled', e => {
//         console.log(0)
//         jQuery.each(map._layers, function (index, value) {
//             console.log(value.editing)
//             if (value.editing !== undefined) {
//                 //console.log(value);
//                 //console.log(value.editing.latlngs[0][0]);
//                 //console.log(value._latlngs[0]);
//                 let obj = {
//                     type: e.shape,
//                     coordinates: value._latlngs[0]
//                     //coordinates: value.editing.latlngs[0][0]
//                 };

//                 console.log(obj)

//                 // jQuery.each(obj.coordinates, function (index, value) {
//                 //     if (edit_h_cql_polygon == undefined || edit_h_cql_polygon == null) {
//                 //         edit_last_h_cql_polygon = value.lng + " " + value.lat;
//                 //         edit_h_cql_polygon = edit_last_h_cql_polygon;
//                 //     }
//                 //     else
//                 //         edit_h_cql_polygon += "," + value.lng + " " + value.lat
//                 // });

//                 // edit_h_cql_polygon += "," + edit_last_h_cql_polygon;
//                 // //$('#hCQLPolygon').val(JSON.stringify(edit_h_cql_polygon));
//                 // //console.log(edit_h_cql_polygon)
//                 // $('#hCQLPolygon').val(edit_h_cql_polygon);
//                 // runQueryWidget();
//             }

//         });
// });

//Toggle mode events
// map.on('pm:globaleditmodetoggled', logEvent_end);
// map.on('pm:globaldragmodetoggled', logEvent_end);
// map.on('pm:globalremovalmodetoggled', logEvent);
// map.on('pm:globaldrawmodetoggled', logEvent);
// map.on('pm:globalcutmodetoggled', logEvent);

//Remove event
// map.on('pm:remove', logEvent);
// map.on('layerremove', logEvent);

//Cut event
// map.on('pm:cut', logEvent);

//Language changed
//map.on('pm:langchange', logEvent);

map.pm.setLang("en");
// map.pm.setGlobalOptions({ measurements: { measurement: true, displayFormat: 'metric' } });
L.control.layers(baseLayers, overlays).addTo(map);// var map = L.map('map').setView([39.74739, -105], 13);


function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Would benefit from https://github.com/Leaflet/Leaflet/issues/4461
function addRecursionToEachLayer(layer, group) {
    if (layer instanceof L.LayerGroup) {
        layer.eachLayer(function (layer) {
            addRecursionToEachLayer(layer, group);
        });
    } else {
        group.addLayer(layer);
    }
}

async function snapshot(layer, level) {
    return new Promise((resolve, reject) => {
        map.setView(layer.getBounds().getCenter(), level);
        setTimeout(() => {
            shoter.takeScreen('image').then(blob => {
                // console.log('resolved (snapshot) -> ', blob);
                // saveAs(blob, 'screen.png');
                return resolve(blob);
            }).catch(e => {
                // console.log('rejected (snapshot) -> ', e.toString());
                return reject(e);
            })
        }, 2000);
    });
}
