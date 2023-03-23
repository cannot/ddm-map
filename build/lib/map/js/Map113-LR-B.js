var myDataSet = {
    userId: null,
    jobCode: null,
    areaCode: null,
    branchCode: null,
    pipeLength: 0,
};

let oldMarker = null;
let isDrawing = false;

var jobDetail = {
    "seqPk": null,
    "branchCode": null,
    "areaCode": null,
    "alley": null,
    "road": null,
    "customerMeterNo": null,
    "pointEditFlag": null,
    "pipeTag": null,
    "pipeType": null,
    "pipeSize": null,
    "pipeMaterial": null,
    "leakType": null,
    "pointGisX": null,
    "pointGisY": null,
    "remark": null,
};

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

    if (layer.pm._shape == 'Marker') {
        console.log('marker created -> ', e);
        let marker = L.marker([e.marker._latlng.lat, e.marker._latlng.lng], {
            draggable: true,
            icon: newWaterDropMarker,
        })
            .addTo(new L.featureGroup())
            .addTo(map)
            .on('dragend', function (e) {
                currentWorkingLayer = e.target;
                console.log('working layer -> ', currentWorkingLayer);
                console.log('marker dragend! (e.target) -> ', e.target);
                console.log('find pipe properties from geoserver!');
                console.log('handleMarkerMoved(e._latlng.lat, e._latlng.lng) -> on dragend!');
                handleMarkerMoved(e.layer._latlng.lat, e.layer._latlng.lng);
            });;
        currentWorkingLayer = marker.layer;
        map.removeLayer(e.marker);
        saveLeakRepairAfterStep();

        // Swal.fire({
        //     title: 'บันทึกข้อมูล?',
        //     text: 'กรุณายืนยันการบันทึกข้อมูล!',
        //     icon: 'question',
        //     showCancelButton: true,
        //     confirmButtonColor: "#007bff",
        //     confirmButtonText: 'ยืนยัน',
        //     cancelButtonColor: "#dc3545",
        //     cancelButtonText: 'ยกเลิก',
        //     reverseButtons: true,
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         saveLeakRepairAfterStep();
        //     }
        // });
    }

    layer.pm.enable({
        allowSelfIntersection: false,
    });

});

function handleMarkerMoved(lat = null, lng = null) {
    if (jobDetail !== undefined && jobDetail !== null && jobDetail.length > 0) {
        $('#ddl-pipe-mtrl').val(jobDetail.pipeMaterial).trigger('change');
        $('#ddl-leak-type').val(jobDetail.leakType).trigger('change');
        $('#ddl-pipe-type').val(jobDetail.pipeType).trigger('change');
        $('#ddl-pipe-size').val(jobDetail.pipeSize).trigger('change');
        $('#p_pipe_tag').val(jobDetail.pipeTag);
        $('#p_remark').val(jobDetail.remark);
    }
    $('#p_mark_lat').val(lat);
    $('#p_mark_lng').val(lng);

    console.log('handleMarkerMoved(lat)', lat);
    console.log('handleMarkerMoved(lng)', lng);

    Swal.fire({
        title: 'บันทึกข้อมูล?',
        text: 'กรุณายืนยันการบันทึกข้อมูล!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: "#007bff",
        confirmButtonText: 'ยืนยัน',
        cancelButtonColor: "#dc3545",
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            saveLeakRepairAfterStep();
        }
    });

}

function handleDetailModal() {
    if (jobDetail !== undefined && jobDetail !== null) {
        $('#ddl-pipe-mtrl').val(jobDetail.pipeMaterial).trigger('change');
        $('#ddl-leak-type').val(jobDetail.leakType).trigger('change');
        $('#ddl-pipe-type').val(jobDetail.pipeType).trigger('change');
        $('#ddl-pipe-size').val(jobDetail.pipeSize).trigger('change');
        $('#p_pipe_tag').val(jobDetail.pipeTag);
        $('#p_mark_lat').val(jobDetail.pointGisX);
        $('#p_mark_lng').val(jobDetail.pointGisY);
        $('#p_remark').val(jobDetail.remark);
        $('#job-detail-modal').modal('show');
    }
}

async function handleDetailSubmit(lat = undefined, lng = undefined) {
    return new Promise((resolve, reject) => {

        const formData = {
            "data": {
                "jobCode": myDataSet.jobCode,
                "pipeMaterial": getValueWithEmptyString(jobDetail.pipeMaterial),
                "pipeSize": getValueWithEmptyString(jobDetail.pipeSize),
                "pipeType": getValueWithEmptyString(jobDetail.pipeType),
                "leakType": getValueWithEmptyString(jobDetail.leakType),
                "pipeTag": getValueWithEmptyString(jobDetail.pipeTag),
                "pointGisX": getValueWithEmptyString(lat),
                "pointGisY": getValueWithEmptyString(lng),
                "remark": getValueWithEmptyString(jobDetail.remark),
                "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
            }
        };

        console.log('save marker detail update (formData) -> ', formData);

        jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_113lr_fm_map_before_field_update",
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log('save marker detail update (success) -> ', response);
                if (response.errorcode !== 1) {
                    jQuery.notify({
                        icon: 'flaticon-signs-3',
                        title: 'ข้อความจากระบบ',
                        message: 'อัปเดทข้อมูลจุดซ่อมเรียบร้อยแล้ว',
                    }, {
                        type: 'success',
                        placement: {
                            from: "top",
                            align: "right"
                        },
                        time: 500,
                    });
                    resolve(response);
                }
                else {
                    jQuery.notify({
                        icon: 'flaticon-signs-3',
                        title: 'ข้อความจากระบบ',
                        message: 'ไม่สามารถอัปเดทข้อมูลจุดซ่อมได้',
                    }, {
                        type: 'warning',
                        placement: {
                            from: "top",
                            align: "right"
                        },
                        time: 500,
                    });
                    console.log('save marker detail update (failure) -> ', response.errormessage);
                    reject(response);
                }
            },
            failure: function (error) {
                jQuery.notify({
                    icon: 'flaticon-signs-3',
                    title: 'ข้อความจากระบบ',
                    message: 'ไม่สามารถอัปเดทข้อมูลจุดซ่อมได้',
                }, {
                    type: 'warning',
                    placement: {
                        from: "top",
                        align: "right"
                    },
                    time: 500,
                });
                console.log('save marker detail update (failure) -> ', error.toString());
                reject(error);
            }
        });
    });
}


function jobDetailFormValidation() {
    let isValid = true;
    const material = $('#ddl-pipe-mtrl').val();
    const leakType = $('#ddl-leak-type').val();
    const pipeSize = $('#ddl-pipe-size').val();
    const pipeType = $('#ddl-pipe-type').val();

    if (material === undefined || material === null || material === '') isValid = false;
    if (leakType === undefined || leakType === null || leakType === '') isValid = false;
    if (pipeSize === undefined || pipeSize === null || pipeSize === '') isValid = false;
    if (pipeType === undefined || pipeType === null || pipeType === '') isValid = false;

    return isValid;
}

function initialQueryString2FormData() {
    myDataSet.userId = queryParams.userId;
    myDataSet.jobCode = queryParams.jobCode;
    myDataSet.areaCode = queryParams.areaCode;
    myDataSet.branchCode = queryParams.branchCode;
    $('#p_user_id').val(myDataSet.userId);
    $('#p_job_code').val(myDataSet.jobCode);
    $('#p_area_code').val(myDataSet.areaCode);
    $('#p_branch_code').val(myDataSet.branchCode);
}

const initialMapWithDataQuery = async function () {
    try {
        initialQueryString2FormData();
        jQuery.when(
            fetchExtendByBranchCode(),
            fetchExtendByAreaCode(),
            fetchExistedMarkers(),
        )
            .then(function (...results) {
                let bnch = results[0];
                let area = results[1];
                let mark = results[2];
                if (bnch !== undefined && bnch !== null) {
                    var bnchFeatureGroup = L.geoJson(bnch, { pmIgnore: true }).addTo(new L.featureGroup()).addTo(map);
                }
                if (area !== undefined && area !== null) {
                    var areaFeatureGroup = L.geoJson(area, { pmIgnore: true, style: { fillColor: "#42ab21", fillOpacity: 0, color: "#12e649", opacity: 0.7 } }).addTo(new L.featureGroup()).addTo(map);
                }
                if (mark !== undefined && mark !== null && mark.pointGisX !== null && mark.pointGisY !== null && mark.pointGisX !== undefined && mark.pointGisY !== undefined) {
                    console.log('A result (mark) -> ', mark);
                    /**
                     * Clear job detail object values
                    */
                    jobDetail = {
                        "seqPk": null,
                        "branchCode": null,
                        "areaCode": null,
                        "alley": null,
                        "road": null,
                        "customerMeterNo": null,
                        "pointEditFlag": null,
                        "pipeTag": null,
                        "pipeType": null,
                        "pipeSize": null,
                        "pipeMaterial": null,
                        "leakType": null,
                        "pointGisX": null,
                        "pointGisY": null,
                        "remark": null,
                    };
                    /**
                     * Clear job detail object values
                     * */

                    /**
                     * Assign job detail values
                    */
                    jobDetail.seqPk = mark.seqPk;
                    jobDetail.branchCode = mark.branchCode;
                    jobDetail.areaCode = mark.areaCode;
                    jobDetail.alley = mark.alley;
                    jobDetail.road = mark.road;
                    jobDetail.customerMeterNo = mark.customerMeterNo;
                    jobDetail.pointEditFlag = mark.pointEditFlag;
                    jobDetail.pipeTag = mark.pipeTag;
                    jobDetail.pipeType = mark.pipeType;
                    jobDetail.pipeSize = mark.pipeSize;
                    jobDetail.pipeMaterial = mark.pipeMaterial;
                    jobDetail.leakType = mark.leakType;
                    jobDetail.pointGisX = mark.pointGisX;
                    jobDetail.pointGisY = mark.pointGisY;
                    jobDetail.remark = mark.remark;
                    /**
                     * Assign job detail values
                    */

                    console.log('p_113lr_fm_map_job_detail (map) -> ', map);

                    let myMarker = null;
                    if (mark.pointEditFlag === "N") {
                        myMarker = L.marker([mark.pointGisX, mark.pointGisY], {
                            draggable: false,
                            icon: newWaterDropMarker,
                        })
                            .addTo(new L.featureGroup())
                            .addTo(map)
                            .on('click', function (e) {
                                currentWorkingLayer = e.target;
                                console.log('job detail (readonly) -> ', jobDetail);
                                console.log('working layer -> ', currentWorkingLayer);
                                console.log('marker click! (e.target) -> ', e.target);
                                handleDetailModal();
                            });
                    } else {
                        myMarker = L.marker([mark.pointGisX, mark.pointGisY], {
                            draggable: true,
                            icon: newWaterDropMarker,
                        })
                            .addTo(new L.featureGroup())
                            .addTo(map)
                            .on('dragend', function (e) {
                                currentWorkingLayer = e.target;
                                console.log('working layer -> ', currentWorkingLayer);
                                console.log('marker dragend! (e.target) -> ', e.target);
                                console.log('find pipe properties from geoserver!');
                                console.log('handleMarkerMoved(e.target._latlng.lat, e.target._latlng.lng) -> on dragend!');
                                handleMarkerMoved(e.target._latlng.lat, e.target._latlng.lng);
                            });
                    }
                    console.log('layer of markers -> ', myMarker);
                }

                /**
                 * zoom to layer with business order
                */
                if (mark !== undefined && mark !== null && mark.pointGisX !== null && mark.pointGisY !== null && mark.pointGisX !== undefined && mark.pointGisY !== undefined) {
                    map.setView([mark.pointGisX, mark.pointGisY], 19);
                    hideMarkerDrawer();
                } else if (area !== undefined && area !== null) {
                    map.fitBounds(areaFeatureGroup.getBounds());
                } else if (bnch !== undefined && bnch !== null) {
                    map.fitBounds(bnchFeatureGroup.getBounds());
                }
                /**
                 * zoom to layer with business order
                */
            })
            .fail(function (jqxhr, textStatus, thrown) {
                console.log('jQuery.when (fail) -> ', thrown);
            });
        hideLoadingOverlay();
    } catch (e) {
        console.log('initial map with data query -> ', e);
    }
}

async function fetchExistedMarkers() {
    return new Promise((resolve, reject) => {
        return jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_113lr_fm_map_job_detail",
            data: JSON.stringify({
                "data": {
                    "jobCode": myDataSet.jobCode,
                    "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                // console.log('/fm/p_113lr_fm_map_job_detail -> ', response);
                let marker = null;
                if (response.errorcode !== 1) {
                    if (response.dataList.length > 0) {
                        marker = response.dataList[0];
                    }
                    console.log('fetch marker (success)-> ', marker)
                }
                resolve(marker);
            },
            failure: function (e) {
                console.log('fetch marker (failure) -> ', e);
                reject(e);
            }
        });
    });
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
                            icon: 'flaticon-signs-3',
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
                        resolve(response);
                    } else {
                        jQuery.notify({
                            icon: 'flaticon-signs-3',
                            title: 'ข้อความจากระบบ',
                            message: 'ไม่สามารถอัปโหลดรูปภาพหน้าจอได้',
                        }, {
                            type: 'warning',
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
                        icon: 'flaticon-signs-3',
                        title: 'ข้อความจากระบบ',
                        message: 'ไม่สามารถอัปโหลดรูปภาพหน้าจอได้',
                    }, {
                        type: 'warning',
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
                        icon: 'flaticon-signs-3',
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
                    resolve(response);
                }
                else {
                    jQuery.notify({
                        icon: 'flaticon-signs-3',
                        title: 'ข้อความจากระบบ',
                        message: 'ไม่สามารถอัปเดทข้อมูลรูปภาพได้',
                    }, {
                        type: 'warning',
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
                    icon: 'flaticon-signs-3',
                    title: 'ข้อความจากระบบ',
                    message: 'ไม่สามารถอัปเดทข้อมูลรูปภาพได้',
                }, {
                    type: 'warning',
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

const saveLeakRepairAfterStep = async function (layer = undefined) {
    try {
        if (layer === undefined || layer === null) {
            map.eachLayer(function (_layer) {
                if (_layer instanceof L.Marker) {
                    layer = _layer.pm._layer;
                }
            });
        }

        showLoadingOverlay();
        $('#job-detail-modal').modal('hide');

        // var group = L.featureGroup(layer)

        console.log('take screenshot at (layer) -> ', layer);
        console.log('save job detail (jobDetail) -> ', jobDetail);

        if (layer !== undefined && jobDetail != null && jobDetail != undefined) {
            const point = getPointSafe(layer);
            if (point === undefined) {
                throw new Error('Unable to get source layer LatLng.');
            }

            await handleDetailSubmit(point.lat, point.lng);

            var blob5000 = await snapshot(layer, 16.70);
            var base5000 = blob5000.replace("data:", "").replace(/^.+,/, "");
            console.log('base 64 string of screen snapshot (1:5000) -> ', base5000);
            var save5000 = await handleUploadImage(base5000, "png")

            var blob1000 = await snapshot(layer, 19);
            var base1000 = blob1000.replace("data:", "").replace(/^.+,/, "");
            console.log('base 64 string of screen snapshot (1:1000) -> ', base1000);
            var save1000 = await handleUploadImage(base1000, "png");

            var saveFoto = await savePhotoDetailUpdate(save1000.filename, save5000.filename);
            console.log('leak repair before (foto) -> ', saveFoto);

        } else {
            console.log('leak repair before (no point or layer)');
        }
        hideLoadingOverlay();
        return true;
    } catch (e) {
        hideLoadingOverlay();
        console.log('leak repair before (failure) -> ', e.message);
        return false;
    }
}