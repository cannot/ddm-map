
var myDataSet = {
    userId: null,
    jobCode: null,
    areaCode: null,
    branchCode: null,
    pipeLength: 0,
    points: []
};

let myPoints = null;
let previous = null;
let modified = null;
let mySource = null;
let changing = false;

map.on('zoom', function () {
    console.log('map.getZoom() -> ', map.getZoom())
});

map.on('click', function (e) {
    console.log('map.on(click) -> ', e);
});

// map.on('pm:drawend', logEvent_end);
map.on('pm:create', async function (e) {
    _log(e, 'pm:create -> ');
    map.pm.disableDraw();

    if (e.layer.pm._shape == 'Polygon') {
        /**
         * Add edit and move event handler
         */
        e.layer
            .on('pm:edit', async function (e) {
                console.log('on pm:edit of created -> ', e);
                mySource = e.layer;
                modified = e.layer;
                changing = true;
                // $('#job-master-modal').modal('show');
            })
            .on('pm:update', async function (e) {
                console.log('on pm:update of created -> ', e);
                mySource = e.layer;
                modified = e.layer;
                changing = true;
                calcPipeLengthInWorkingArea(e);
                $('#job-master-modal').modal('show');
            })
            .on('pm:remove', async function (e) {
                console.log('on pm:remove of created -> ', e);
                mySource = e.layer;
                modified = null;
                changing = true;
            })
            .on('pm:dragdisable', async function (e) {
                console.log('on pm:dragdisable of created -> ', e);
                map.pm.Toolbar.setButtonDisabled('editMode', false);
                map.pm.Toolbar.setButtonDisabled('dragMode', false);
                map.pm.Toolbar.setButtonDisabled('removalMode', false);
                map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
                mySource = e.layer;
                modified = e.layer;
                changing = true;
            });
        /**
        * Hide drawing controls
        * */
        map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
        /**
         * Hide drawing controls
         * */

        initialQueryStringAndDrawer(e, L);
        calcPipeLengthInWorkingArea(e);
        mySource = e.layer;
        modified = e.layer;
        console.log('modified object (created) -> ', modified);
        console.log('previous object (created) -> ', previous);
        $('#job-master-modal').modal('show');
        // await saveLeakDetectBeforeStep(e.layer);
    }

});

function handleCancelButtonClicked(e) {
    e.preventDefault();
    console.log('modified object (before) -> ', modified);
    console.log('previous object (before) -> ', previous);
    map.removeLayer(modified);
    if (previous !== undefined && previous != null) {
        let switcher = cloneLayer(previous);
        previous.addTo(new L.featureGroup()).addTo(map);
        modified = previous;
        previous = switcher;
    } else {
        map.pm.Toolbar.setButtonDisabled('drawPolygon', false);
    }
    console.log('modified object (after) -> ', modified);
    console.log('previous object (after) -> ', previous);
    map.pm.Toolbar.setButtonDisabled('editMode', false);
    map.pm.Toolbar.setButtonDisabled('dragMode', false);
    map.pm.Toolbar.setButtonDisabled('removalMode', false);
}

map.on('pm:buttonclick', async function (e) {
    console.log('control button clicked! -> ', e);
    console.log('modified object -> ', modified);
    console.log('previous object -> ', previous);
    switch (e.btnName) {
        case 'editMode':
            map.pm.Toolbar.setButtonDisabled('editMode', false);
            map.pm.Toolbar.setButtonDisabled('dragMode', true);
            map.pm.Toolbar.setButtonDisabled('removalMode', true);
            map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
            break;
        case 'dragMode':
            map.pm.Toolbar.setButtonDisabled('editMode', true);
            map.pm.Toolbar.setButtonDisabled('dragMode', false);
            map.pm.Toolbar.setButtonDisabled('removalMode', true);
            map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
            break;
        case 'removalMode':
            map.pm.Toolbar.setButtonDisabled('editMode', true);
            map.pm.Toolbar.setButtonDisabled('dragMode', true);
            map.pm.Toolbar.setButtonDisabled('removalMode', false);
            map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
            break;
        case 'drawPolygon':
            map.pm.Toolbar.setButtonDisabled('editMode', true);
            map.pm.Toolbar.setButtonDisabled('dragMode', true);
            map.pm.Toolbar.setButtonDisabled('removalMode', true);
            map.pm.Toolbar.setButtonDisabled('drawPolygon', false);
            break;
    }
});

map.on('pm:actionclick', async function (e) {
    console.log('control action clicked! -> ', e);
    console.log('modified object -> ', modified);
    console.log('previous object -> ', previous);

    if (e.btnName === 'editMode') {

    }

    if (e.btnName !== 'removalMode' && e.button.actions.length > 0 && e.button.actions[0] === 'finishMode') {
        calcPipeLengthInWorkingArea(e);
        $('#job-master-modal').modal('show');
    }
    if (e.btnName === 'removalMode' && e.button.actions.length > 0 && e.button.actions[0] === 'finishMode') {
        map.pm.Toolbar.setButtonDisabled('drawPolygon', false);
    }
});

map.pm.Toolbar.setButtonDisabled('drawPolygon', true);

async function initialQueryString2FormData() {
    myDataSet.userId = queryParams.userId === undefined ? "" : queryParams.userId;
    myDataSet.jobCode = queryParams.jobCode === undefined ? "" : queryParams.jobCode;
    myDataSet.areaCode = queryParams.areaCode === undefined ? "" : queryParams.areaCode;
    myDataSet.branchCode = queryParams.branchCode === undefined ? "" : queryParams.branchCode;
    $('#p_user_id').val(myDataSet.userId);
    $('#p_job_code').val(myDataSet.jobCode);
    $('#p_area_code').val(myDataSet.areaCode);
    $('#p_branch_code').val(myDataSet.branchCode);
    console.log('A queryParams -> ', queryParams);
    return true;
}

const initialMapWithDataQuery = async function () {
    try {
        await initialQueryString2FormData();
        jQuery.when(
            fetchExtendByBranchCode(),
            fetchExtendByAreaCode(),
            fetchExistedPolygon(),
        )
            .then(function (...results) {
                console.log('A results -> ', results);
                let bnch = results[0];
                let area = results[1];
                let poly = results[2];
                console.log('A result (bnch) -> ', bnch);
                console.log('A result (area) -> ', area);
                console.log('A result (poly) -> ', poly);

                if (bnch !== undefined && bnch !== null) {
                    var bnchFeatureGroup = L.geoJson(bnch, { pmIgnore: true }).addTo(new L.featureGroup()).addTo(map);
                }
                if (area !== undefined && area !== null) {
                    var areaFeatureGroup = L.geoJson(area, { pmIgnore: true, style: { fillOpacity: 0, color: "#55ba02", opacity: 0.7 } }).addTo(new L.featureGroup()).addTo(map);
                }

                map.pm.Toolbar.setButtonDisabled('drawPolygon', false);

                if (poly !== undefined && poly !== null) {
                    var polyFeatureGroup = L.geoJson(poly, { style: { fillOpacity: 0.1, color: "#ff0000", opacity: 0.7 } }).addTo(new L.featureGroup()).addTo(map)
                        .on('pm:edit', async function (e) {
                            console.log('on pm:edit of initial -> ', e);
                            mySource = e.layer;
                            modified = e.layer;
                            changing = true;
                        })
                        .on('pm:editend', async function (e) {
                            console.log('on pm:editend of initial -> ', e);
                            mySource = e.layer;
                            modified = e.layer;
                            changing = true;
                        })
                        .on('pm:update', async function (e) {
                            console.log('on pm:update of initial -> ', e);
                            mySource = e.layer;
                            modified = e.layer;
                            changing = true;
                            calcPipeLengthInWorkingArea(e);
                            $('#job-master-modal').modal('show');
                        })
                        .on('pm:remove', async function (e) {
                            console.log('on pm:remove of initial -> ', e);
                            mySource = e.layer;
                            modified = null;
                            changing = true;
                        })
                        .on('pm:dragdisable', async function (e) {
                            console.log('on pm:dragdisable of initial -> ', e);
                            map.pm.Toolbar.setButtonDisabled('editMode', false);
                            map.pm.Toolbar.setButtonDisabled('dragMode', false);
                            map.pm.Toolbar.setButtonDisabled('removalMode', false);
                            map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
                            mySource = e.layer;
                            modified = e.layer;
                            changing = true;
                        });
                    modified = polyFeatureGroup;
                    previous = cloneLayer(polyFeatureGroup);
                    map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
                }

                /**
                 * zoom to layer with business order
                */
                if (poly !== undefined && poly !== null) {
                    map.setView(polyFeatureGroup.getBounds().getCenter(), 19);
                } else if (area !== undefined && area !== null) {
                    map.fitBounds(areaFeatureGroup.getBounds());
                } else if (bnch !== undefined && bnch !== null) {
                    map.fitBounds(bnchFeatureGroup.getBounds());
                }
                /**
                 * zoom to layer with business order
                */
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
        return jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_113ld_fm_map_before_field_info",
            data: JSON.stringify({
                "data": {
                    "jobCode": myDataSet.jobCode,
                    "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
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

function updateDataSetFromLayerChanged(layer) {
    var latlngs = layer.getLatLngs();
    console.log('layer.pm._shape -> ', layer.pm._shape)
    console.log('layer.getLatLngs() -> ', latlngs)

    var myPoints = {
        id: layer._leaflet_id,
        plots: []
    }

    latlngs[0].forEach(o => {
        myPoints.plots.push([o.lat, o.lng])
    });

    myDataSet.points.push(myPoints);

    console.log('myDataSet -> ', myDataSet)
    console.log('leaflet_id -> ', layer._leaflet_id);
}

function calcPipeLengthInWorkingArea(e) {
    console.log('calcPipeLengthInWorkingArea (e) -> ', e);
    if (e.layer === undefined || e.layer._latlngs === undefined) return 0;
    let pipeLength = L.GeometryUtil.geodesicArea(e.layer._latlngs[0]);
    console.log('area is: ' + pipeLength);
    $('#p_pipe_length').val(pipeLength);
    if (pipeLength > 0) {
        $('#btn-ld-b-saving').prop("disabled", false);
    }
}

function initialQueryStringAndDrawer(e, L) {
    var latlngs = e.layer.getLatLngs();
    updateDataSetFromLayerChanged(e.layer)
    console.log('area is: ' + L.GeometryUtil.geodesicArea(latlngs[0]));
}

async function handleUploadImage(base64, saveAs = "png") {
    return new Promise((resolve, reject) => {
        try {
            var formData = {
                "data": {
                    "branchCode": myDataSet.branchCode,
                    "fileBase64": base64,
                    "fileType": saveAs,
                    "isTempFile": true,
                    "jobCode": myDataSet.jobCode,
                    "year": new Date().getFullYear().toString()
                }
            }

            console.log('formData (screenshot) -> ', formData);

            jQuery.ajax({
                type: "POST",
                headers: {
                    "token": "dev"
                },
                url: api_host + "/WLMAService/rest/internal/app/common/upload_file",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (response.errorcode !== 1) {
                        jQuery.notify({
                            icon: 'icon-cloud-upload',
                            title: 'ข้อความจากระบบ',
                            message: 'อัปโหลดรูปภาพหน้าจอเรียบร้อยแล้ว',
                        }, {
                            type: 'success',
                            placement: {
                                from: "top",
                                align: "right"
                            },
                            time: 500,
                        });
                        console.log('save screenshot (success) -> ', response);
                        resolve(response)
                    } else {
                        jQuery.notify({
                            icon: 'icon-cloud-upload',
                            title: 'ข้อความจากระบบ',
                            message: 'ไม่สามารถอัปโหลดรูปภาพหน้าจอได้',
                        }, {
                            type: 'danger',
                            placement: {
                                from: "top",
                                align: "right"
                            },
                            time: 500,
                        });
                        console.log('save screenshot (failure) -> ', response.errormessage);
                        reject(response);
                    }
                },
                failure: function (error) {
                    jQuery.notify({
                        icon: 'icon-cloud-upload',
                        title: 'ข้อความจากระบบ',
                        message: 'ไม่สามารถอัปโหลดรูปภาพหน้าจอได้',
                    }, {
                        type: 'danger',
                        placement: {
                            from: "top",
                            align: "right"
                        },
                        time: 500,
                    });
                    console.log('save screenshot (failure) -> ', error.toString());
                    reject(error);
                }
            });
        } catch (e) {
            console.log('ไม่สามารถอัปโหลดรูปภาพหน้าจอได้ -> ', e.toString());
        }
    });
}

async function savePhotoDetailUpdate(filePath1000, filePath5000) {
    return new Promise((resolve, reject) => {

        const photoFileName1000 = renameSnapshotFileName(filePath1000, 1000);
        const photoFileName5000 = renameSnapshotFileName(filePath5000, 5000);

        const formData = {
            "data": {
                "jobCode": myDataSet.jobCode,
                "photoFilename1000": photoFileName1000,
                "photoFilename5000": photoFileName5000,
                "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
            }
        };

        console.log('save photo detail update (formData) -> ', formData);

        jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_fm_job_photo_detail_update",
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log('save photo detail update (success) -> ', response);
                if (response.errorcode !== 1) {
                    jQuery.notify({
                        icon: 'flaticon-picture',
                        title: 'ข้อความจากระบบ',
                        message: 'อัปเดทข้อมูลรูปภาพเรียบร้อยแล้ว',
                    }, {
                        type: 'success',
                        placement: {
                            from: "top",
                            align: "right"
                        },
                        time: 500,
                    });
                    resolve(response)
                }
                else {
                    jQuery.notify({
                        icon: 'flaticon-picture',
                        title: 'ข้อความจากระบบ',
                        message: 'ไม่สามารถอัปเดทข้อมูลรูปภาพได้',
                    }, {
                        type: 'danger',
                        placement: {
                            from: "top",
                            align: "right"
                        },
                        time: 500,
                    });
                    console.log('save photo detail update (failure) -> ', response.errormessage);
                    reject(response);
                }
            },
            failure: function (error) {
                jQuery.notify({
                    icon: 'flaticon-picture',
                    title: 'ข้อความจากระบบ',
                    message: 'ไม่สามารถอัปเดทข้อมูลรูปภาพได้',
                }, {
                    type: 'danger',
                    placement: {
                        from: "top",
                        align: "right"
                    },
                    time: 500,
                });
                console.log('save photo detail update (failure) -> ', error.toString());
                reject(error);
            }
        });
    });
}

async function saveLeakDetectBeforeData() {
    return new Promise((resolve, reject) => {
        let plots = [];

        if (typeof myDataSet.points !== 'undefined' && myDataSet.points.length > 0) {
            myDataSet.points[0].plots.forEach((p) => {
                plots.push("[" + p.join(",") + "]");
            });
        }

        const formData = {
            "data": {
                "areaCode": myDataSet.areaCode,
                "jobCode": myDataSet.jobCode,
                "pipeLength": 0,
                "restrictArea": "[" + plots.join(",") + "]",
                "restrictOrder": 1,
                "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
            }
        };

        console.log('save lead detect before (formData) -> ', formData);

        if (typeof plots !== 'undefined' && plots.length > 0) {
            jQuery.ajax({
                type: "POST",
                headers: {
                    "token": "dev"
                },
                url: api_host + "/WLMAService/rest/internal/app/fm/p_113ld_fm_map_before_field_update",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    console.log('save lead detect before (success) -> ', response);
                    if (response.errorcode !== 1) {
                        jQuery.notify({
                            icon: 'fas fa-database',
                            title: 'ข้อความจากระบบ',
                            message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                        }, {
                            type: 'success',
                            placement: {
                                from: "top",
                                align: "right"
                            },
                            time: 500,
                        });
                        resolve(response)
                    }
                    else {
                        jQuery.notify({
                            icon: 'fas fa-database',
                            title: 'ข้อความจากระบบ',
                            message: 'ไม่สามารถบันทึกข้อมูลได้',
                        }, {
                            type: 'danger',
                            placement: {
                                from: "top",
                                align: "right"
                            },
                            time: 500,
                        });
                        console.log('save lead detect before (failure) -> ', response.errormessage);
                        reject(response);
                    }
                },
                failure: function (error) {
                    jQuery.notify({
                        icon: 'fas fa-database',
                        title: 'ข้อความจากระบบ',
                        message: 'ไม่สามารถบันทึกข้อมูลได้',
                    }, {
                        type: 'danger',
                        placement: {
                            from: "top",
                            align: "right"
                        },
                        time: 500,
                    });
                    console.log('save lead detect before (failure) -> ', error.toString());
                    reject(error);
                }
            });
        }
    });
}

const handleLeakDetectBeforeSave = async function () {
    $('#job-master-modal').modal('hide');
    showLoadingOverlay();
    await saveLeakDetectBeforeStep();
    map.pm.Toolbar.setButtonDisabled('editMode', false);
    map.pm.Toolbar.setButtonDisabled('dragMode', false);
    map.pm.Toolbar.setButtonDisabled('removalMode', false);
    map.pm.Toolbar.setButtonDisabled('drawPolygon', true);
    hideLoadingOverlay();
}

const saveLeakDetectBeforeStep = async function (layer = undefined) {
    try {
        layer === undefined ? layer = mySource : layer;
        updateDataSetFromLayerChanged(layer);
        if (typeof myDataSet.points !== 'undefined' && myDataSet.points.length > 0) {
            var blob5000 = await snapshot(layer, 16.70);
            var base5000 = blob5000.replace("data:", "").replace(/^.+,/, "");
            console.log('base 64 string of screen snapshot (1:5000) -> ', base5000);
            var save5000 = await handleUploadImage(base5000, "png")

            var blob1000 = await snapshot(layer, 19);
            var base1000 = blob1000.replace("data:", "").replace(/^.+,/, "");
            console.log('base 64 string of screen snapshot (1:1000) -> ', base1000);
            var save1000 = await handleUploadImage(base1000, "png");

            var saveInfo = await saveLeakDetectBeforeData();
            var saveFoto = await savePhotoDetailUpdate(save1000.filename, save5000.filename);
            console.log('leak detect before (info) -> ', saveInfo);
            console.log('leak detect before (foto) -> ', saveFoto);

            // map.pm.disableDraw();

        } else {
            console.log('leak detect before (no polygon)');
        }
        return true;
    } catch (e) {
        console.log('leak detect before (failure) -> ', e.message);
        return false;
    }
}