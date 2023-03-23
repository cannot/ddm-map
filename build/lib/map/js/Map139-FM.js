
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
 
var myDataSet = {
    userId: null,
    jobCode: null,
    areaCode: null,
    jobId: null,
    statusAll: null,
    statusJ02: null,
    statusJ03: null,
    statusJ04: null,
    statusJ09: null,
    statusJ12: null,
    branchCode: null,
    pipeLength: 0,
    points: []
};

var jobDetail = {
    "seqPk": null,
    "jobCode": null,
    "latitude": null,
    "longitude": null,
    "jobStatusCode": null,
    "jobStatusDesc": null
};

async function initialQueryString2FormData() {
    myDataSet.userId = queryParams.userId === undefined ? "" : queryParams.userId;
    myDataSet.jobCode = queryParams.jobCode === undefined ? "" : queryParams.jobCode;
    myDataSet.areaCode = queryParams.areaCode === undefined ? "" : queryParams.areaCode;
    myDataSet.branchCode = queryParams.branchCode === undefined ? "" : queryParams.branchCode;
    myDataSet.jobOpenDtBegin = queryParams.jobOpenDtBegin === undefined ? "" : queryParams.jobOpenDtBegin;
    myDataSet.jobOpenDtEnd = queryParams.jobOpenDtEnd === undefined ? "" : queryParams.jobOpenDtEnd;
    myDataSet.jobId = queryParams.jobId === undefined ? "" : queryParams.jobId;
    myDataSet.jobStatusAll = queryParams.jobStatusAll === undefined ? "N" : queryParams.jobStatusAll;
    myDataSet.jobStatusJ02 = queryParams.jobStatusJ02 === undefined ? "N" : queryParams.jobStatusJ02;
    myDataSet.jobStatusJ03 = queryParams.jobStatusJ03 === undefined ? "N" : queryParams.jobStatusJ03;
    myDataSet.jobStatusJ04 = queryParams.jobStatusJ04 === undefined ? "N" : queryParams.jobStatusJ04;
    myDataSet.jobStatusJ09 = queryParams.jobStatusJ09 === undefined ? "N" : queryParams.jobStatusJ09;
    myDataSet.jobStatusJ12 = queryParams.jobStatusJ12 === undefined ? "N" : queryParams.jobStatusJ12;
    myDataSet.teamId = queryParams.teamId === undefined ? "0" : queryParams.teamId;

    console.log('A queryParams -> ', queryParams);
    return true;
}

const initialMapWithDataQuery = async function () {
    try {
        await initialQueryString2FormData();
        jQuery.when(
            fetchExistedMarkers(),
        )
            .then(function (...results) {
                console.log('A results -> ', results);
                let mark = results[0];

                console.log('A result (mark) -> ', mark);
                
                if (mark !== undefined && mark !== null) {
                    console.log('A result (mark) -> ', mark);
                    mark.forEach(m => {
                        /**
                         * Clear job detail object values
                        */
                        jobDetail = {
                            "seqPk": null,
                            "jobCode": null,
                            "latitude": null,
                            "longitude": null,
                            "jobStatusCode": null,
                            "jobStatusDesc": null
                        };
                        /**
                         * Clear job detail object values
                        */

                        /**
                         * Assign job detail values
                        */
                        jobDetail.seqPk = m.seqPk;
                        jobDetail.jobCode = m.jobCode;
                        jobDetail.latitude = m.latitude;
                        jobDetail.longitude = m.longitude;
                        jobDetail.jobStatusCode = m.jobStatusCode;
                        jobDetail.jobStatusDesc = m.jobStatusDesc;
                        /**
                         * Assign job detail values
                        */

                        let markerIcon = newWaterDropMarker;
                        // console.log('p_113ld_fm_map_job_detail (myPoints) -> ', myPoints);
                        // console.log('p_113ld_fm_map_job_detail (map) -> ', map);

                        let myMarker = L.marker([m.latitude, m.longitude], {
                            draggable: true,
                            icon: markerIcon,
                        })
                            .addTo(map)
                            .on('dragstart', function (e) {
                                previous = cloneLayer(e.target);
                                console.log('marker dragstart! (previous) -> ', previous);
                            })
                            .on('click', function (e) {
                                previous = modified = e.target;
                                console.log('marker click! (modified) -> ', modified);
                                console.log('marker click! (previous) -> ', previous);
                                firedDetailFormModal('UPDATE');
                            })
                            .on('dragend', function (e) {
                                mySource = modified = e.target;
                                console.log('marker dragend! (modified) -> ', modified);
                                firedDetailFormModal('UPDATE');
                            });
                        jobDetail.leaflet_id = myMarker._leaflet_id;
                    });
                }

                hideLoadingOverlay();
            })
            .fail(function (jqxhr, textStatus, thrown) {
                console.log('jQuery.when (fail) -> ', thrown);
            });
    } catch (e) {
        console.log('initial map with data query -> ', e);
    }
}

async function fetchExistedPolygon() {
    if (myDataSet.jobCode === undefined || myDataSet.jobCode === null) {
        initialQueryString2FormData();
    }
    return new Promise((resolve, reject) => {

        console.log(api_host + "/WLMAService/rest/internal/app/fm/p_139_fm_job_on_map");
        return jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_139_fm_job_on_map",
            data: JSON.stringify({
                "data": {
                    "jobCode": myDataSet.jobCode,
                    "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId,
                    "jobId": myDataSet.jobId,
                    "branchCode": myDataSet.branchCode,
                    "areaCode": myDataSet.areaCode,
                    "jobStatusAll": myDataSet.jobStatusAll,
                    "jobStatusJ02": myDataSet.jobStatusJ02,
                    "jobStatusJ03": myDataSet.jobStatusJ03,
                    "jobStatusJ04": myDataSet.jobStatusJ04,
                    "jobStatusJ09": myDataSet.jobStatusJ09,
                    "jobStatusJ12": myDataSet.jobStatusJ12,
                    "jobOpenDtBegin": myDataSet.jobOpenDtBegin,
                    "jobOpenDtEnd": myDataSet.jobOpenDtEnd,
                    "teamId": myDataSet.teamId
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function (response) {
                let polygon = null;
                if (response.errorcode !== 1 && response.data !== undefined && response.data != null) {
                    polygon = L.polygon(JSON.parse(response.data.restrictArea)).toGeoJSON();
                }
                console.log('fetch polygon (success) -> ', polygon);
                resolve(polygon);
            },
            failure: function (e) {
                console.log('fetch polygon (failure) -> ', e);
                reject(e);
            }
        });
    });
}


async function fetchExistedMarkers() {
    return new Promise((resolve, reject) => {
        return jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_139_fm_job_on_map",
            data: JSON.stringify({
                "data": {
                    "jobCode": myDataSet.jobCode,
                    "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId,
                    "jobId": myDataSet.jobId,
                    "branchCode": myDataSet.branchCode,
                    "areaCode": myDataSet.areaCode,
                    "jobStatusAll": myDataSet.jobStatusAll,
                    "jobStatusJ02": myDataSet.jobStatusJ02,
                    "jobStatusJ03": myDataSet.jobStatusJ03,
                    "jobStatusJ04": myDataSet.jobStatusJ04,
                    "jobStatusJ09": myDataSet.jobStatusJ09,
                    "jobStatusJ12": myDataSet.jobStatusJ12,
                    "jobOpenDtBegin": myDataSet.jobOpenDtBegin,
                    "jobOpenDtEnd": myDataSet.jobOpenDtEnd,
                    "teamId": myDataSet.teamId
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log('/fm/p_139_fm_job_on_map -> ', response);
                let markers = null;
                if (response.errorcode !== 1) {
                    if (response.dataList.length > 0) {
                        markers = response.dataList;
                    }
                    console.log('fetch marker (success)-> ', markers)
                }
                resolve(markers);
            },
            failure: function (e) {
                console.log('fetch marker (failure) -> ', e);
                reject(e);
            }
        });
    });
}