var myDataSet = {
    userId: null,
    jobCode: null,
    areaCode: null,
    branchCode: null,
    pipeLength: 0,
    polygons: []
};

let myPoints = null;
let previous = null;
let modified = null;
let mySource = null;
let changing = false;

var jobDetail = {
    "seqPk": null,
    "alley": null,
    "road": null,
    "areaCode": null,
    "branchCode": null,
    "customerMeterNo": null,
    "leakType": null,
    "leakLevel": null,
    "pipeMaterial": null,
    "pipeSize": null,
    "pipeTag": null,
    "pipeType": null,
    "pointEditFlag": null,
    "pointGisX": null,
    "pointGisY": null,
    "remark": null,
    "leaflet_id": null,
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

map.pm.Toolbar.createCustomControl({
    name: 'markerRemoval',
    block: 'custom',
    title: 'ลบจุดซ่อม',
    onClick: () => {
        Swal.fire({
            title: 'ลบจุดซ่อม?',
            text: 'กรุณายืนยันการลบจุดซ่อม!',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: "#007bff",
            confirmButtonText: 'ยืนยัน',
            cancelButtonColor: "#dc3545",
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                handleMarkerRemoval();
            }
        });
    },
    className: 'fas fa-lg fa-trash mt-1'
});

// map.pm.Toolbar.setButtonDisabled('editMode', true);
// map.pm.Toolbar.setButtonDisabled('dragMode', true);
// map.pm.Toolbar.setButtonDisabled('removalMode', true);
map.pm.Toolbar.setButtonDisabled('markerRemoval', true);
map.pm.Toolbar.setButtonDisabled('drawMarker', true);

map.on('zoom', function () {
    console.log('map.getZoom() -> ', map.getZoom())
});


map.on('pm:create', async function (e) {
    _log(e, 'pm:create -> ');
    map.pm.disableDraw();

    if (e.layer.pm._shape == 'Marker') {
        console.log('marker created -> ', e);
        modified = L.marker([e.marker._latlng.lat, e.marker._latlng.lng], {
            draggable: true,
            icon: newWaterDropMarker,
        })
            .addTo(map)
            .on('click', function (e) {
                mySource = modified = e.target;
                console.log('marker click! (mysource) -> ', mySource);
                console.log('marker click! (modified) -> ', modified);
            })
            .on('dragend', function (e) {
                mySource = modified = e.target;
                console.log('marker click! (mysource) -> ', mySource);
                console.log('marker click! (modified) -> ', modified);
                firedDetailFormModal('CREATE');
            });

        previous = e.layer;
        map.removeLayer(e.layer);
        console.log('marker created! (previous) -> ', previous);
        console.log('marker created! (modified) -> ', modified);

        firedDetailFormModal('CREATE');

    }

    e.layer.pm.enable({
        allowSelfIntersection: false,
    });

});

function firedDetailFormModal(action = 'CREATE') {
    console.log('fired detail form modal (action) -> ', action);
    console.log('fired detail form modal (modified) -> ', modified);
    console.log('fired detail form modal (previous) -> ', previous);
    if (modified === undefined || modified === null) return;
    const leaflet_id = modified._leaflet_id;
    console.log('fired detail form modal (_leaflet_id) -> ', leaflet_id);

    // reset dropdownlist option
    $('#ddl-leak-levl').val('').trigger('change');
    $('#ddl-leak-type').val('').trigger('change');
    $('#ddl-pipe-mtrl').val('').trigger('change');
    $('#ddl-pipe-type').val('').trigger('change');
    $('#ddl-pipe-size').val('').trigger('change');
    $('#p_pipe_tag').val('');
    $('#p_remark').val('');
    // reset dropdownlist option

    switch (action) {
        case 'CREATE':
            // set form data
            $('#p_sequence').val(1);
            $('#p_editable').val("Y");
            $('#p_mark_lat').val(modified._latlng.lat);
            $('#p_mark_lng').val(modified._latlng.lng);
            // set form data

            // initial event handler for cancel job detail
            $("#btn-job-detail-cancel")
                .off('click')
                .click(function () {
                    Swal.fire({
                        title: 'ยกเลิกจุดสำรวจ?',
                        text: 'คุณต้องการยกเลิกการบันทึกรายละเอียด!',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: "#007bff",
                        confirmButtonText: 'ยืนยัน',
                        cancelButtonColor: "#dc3545",
                        cancelButtonText: 'ยกเลิก',
                        reverseButtons: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            console.log('detail create on cancel button clicked! (previous) -> ', previous);
                            console.log('detail create on cancel button clicked! (modified) -> ', modified);
                            map.removeLayer(modified);
                            map.removeLayer(previous);
                            $('#job-detail-modal').modal('hide');
                            modified = null;
                            previous = null;
                        }
                    });
                });
            // initial event handler for cancel job detail

            // initial event handler for leak level dropdownlist
            $('#ddl-leak-levl')
                .off('select2:select')
                .on('select2:select', function (e) {
                    var data = e.params.data;

                    let _icon = data.id === "03" ? lotWaterDropMarker : bitWaterDropMarker;

                    console.log('detail create on leak level changed! (previous) -> ', previous);
                    console.log('detail create on leak level changed! (modified) -> ', modified);
                    map.removeLayer(modified);
                    map.removeLayer(previous);

                    modified = L.marker([modified._latlng.lat, modified._latlng.lng], {
                        draggable: true,
                        icon: _icon,
                    })
                        .addTo(map)
                        .on('dragstart', function (e) {
                            previous = cloneLayer(e.target);
                            console.log('marker dragstart! (previous) -> ', previous);
                        })
                        .on('click', function (e) {
                            previous = modified = e.target;
                            console.log('marker dragend! (modified) -> ', modified);
                            console.log('marker dragend! (previous) -> ', previous);
                            firedDetailFormModal('CREATE');
                        })
                        .on('dragend', function (e) {
                            mySource = modified = e.target;
                            console.log('marker dragend! (modified) -> ', modified);
                            firedDetailFormModal('CREATE');
                        });
                });
            // initial event handler for leak level dropdownlist

            // initial event handler for form submit
            $("#btn-job-detail-submit")
                .off('click')
                .click(function () {
                    if ($('#form-job-detail').valid() === true) {
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
                                showLoadingOverlay();
                                jobDetailFormSubmit();
                                hideLoadingOverlay();
                                $('#job-detail-modal').modal('hide');
                            }
                        });
                    }
                });
            // initial event handler for form submit

            $('#job-detail-modal').modal('show');

            break;
        case 'UPDATE':

            if (jobDetail !== undefined) {

                console.log('fired detail form modal (detail) -> ', jobDetail);

                $('#ddl-leak-levl').val(getValueWithEmptyString(jobDetail?.leakLevel)).trigger('change');
                $('#ddl-leak-type').val(getValueWithEmptyString(jobDetail?.leakType)).trigger('change');
                $('#ddl-pipe-mtrl').val(getValueWithEmptyString(jobDetail?.pipeMaterial)).trigger('change');
                $('#ddl-pipe-type').val(getValueWithEmptyString(jobDetail?.pipeType)).trigger('change');
                $('#ddl-pipe-size').val(getValueWithEmptyString(jobDetail?.pipeSize)).trigger('change');
                $('#p_pipe_tag').val(getValueWithEmptyString(jobDetail?.pipeTag));
                $('#p_remark').val(getValueWithEmptyString(jobDetail?.remark));
                $('#p_sequence').val(getValueWithEmptyString(jobDetail?.seqPk));
                $('#p_editable').val(getValueWithEmptyString(jobDetail?.pointEditFlag));
                $('#p_mark_lat').val(modified._latlng.lat);
                $('#p_mark_lng').val(modified._latlng.lng);
                $('#leaflet_id').val(leaflet_id);

                // initial event handler for cancel job detail
                $("#btn-job-detail-cancel")
                    .off('click')
                    .click(function () {
                        Swal.fire({
                            title: 'ยกเลิกจุดสำรวจ?',
                            text: 'คุณต้องการยกเลิกการบันทึกรายละเอียด!',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: "#007bff",
                            confirmButtonText: 'ยืนยัน',
                            cancelButtonColor: "#dc3545",
                            cancelButtonText: 'ยกเลิก',
                            reverseButtons: true,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                console.log('detail create on cancel button clicked! (previous) -> ', previous);
                                console.log('detail create on cancel button clicked! (modified) -> ', modified);

                                map.removeLayer(modified);

                                let _icon = jobDetail?.leakLevel === "03" ? lotWaterDropMarker : bitWaterDropMarker;

                                let myMarker = L.marker([previous._latlng.lat, previous._latlng.lng], {
                                    draggable: true,
                                    icon: _icon,
                                })
                                    .addTo(map)
                                    .on('dragstart', function (e) {
                                        previous = cloneLayer(e.target);
                                        console.log('marker dragstart! (previous) -> ', previous);
                                    })
                                    .on('click', function (e) {
                                        previous = modified = e.target;
                                        console.log('marker dragend! (modified) -> ', modified);
                                        console.log('marker dragend! (previous) -> ', previous);
                                        firedDetailFormModal('UPDATE');
                                    })
                                    .on('dragend', function (e) {
                                        mySource = modified = e.target;
                                        console.log('marker dragend! (modified) -> ', modified);
                                        firedDetailFormModal('UPDATE');
                                    });

                                previous = myMarker;
                                modified = myMarker;
                                $('#job-detail-modal').modal('hide');
                                // previous = modified;
                            }
                        });
                    });
                // initial event handler for cancel job detail

                // initial event handler for leak level dropdownlist
                $('#ddl-leak-levl')
                    .off('select2:select')
                    .on('select2:select', function (e) {
                        var data = e.params.data;

                        let _icon = data.id === "03" ? lotWaterDropMarker : bitWaterDropMarker;

                        let myMarker = L.marker([modified._latlng.lat, modified._latlng.lng], {
                            draggable: true,
                            icon: _icon,
                        })
                            .addTo(map)
                            .on('dragstart', function (e) {
                                previous = cloneLayer(e.target);
                                console.log('marker dragstart! (previous) -> ', previous);
                            })
                            .on('click', function (e) {
                                previous = modified = e.target;
                                console.log('marker dragend! (modified) -> ', modified);
                                console.log('marker dragend! (previous) -> ', previous);
                                firedDetailFormModal('UPDATE');
                            })
                            .on('dragend', function (e) {
                                mySource = modified = e.target;
                                console.log('marker dragend! (modified) -> ', modified);
                                firedDetailFormModal('UPDATE');
                            });
                        console.log('leak level changed (modified) -> ', modified._leaflet_id);
                        previous = myMarker;
                        map.removeLayer(modified);
                    });
                // initial event handler for leak level dropdownlist

                // initial event handler for form submit
                $("#btn-job-detail-submit")
                    .off('click')
                    .click(function () {
                        if ($('#form-job-detail').valid() === true) {
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
                                    showLoadingOverlay();
                                    jobDetailFormSubmit();
                                    hideLoadingOverlay();
                                    $('#job-detail-modal').modal('hide');
                                }
                            });
                        }
                    });
                // initial event handler for form submit

                $('#job-detail-modal').modal('show');

            }
            break;
    }
}

function handleMarkerRemoval() {
    console.log('handle removal (modified) -> ', modified);
    console.log('handle removal (previous) -> ', previous);
    map.removeLayer(modified);
    map.eachLayer(function(layer) {
        if(layer.options && layer.options.pane === "markerPane") {
            map.removeLayer(layer);
        }
    });
    map.pm.Toolbar.setButtonDisabled('markerRemoval', true);
    map.pm.Toolbar.setButtonDisabled('drawMarker', false);
}

async function jobDetailFormSubmit() {
    return new Promise((resolve, reject) => {
        const formData = {
            "data": {
                "jobCode": myDataSet.jobCode,
                "pipeMaterial": getValueWithEmptyString($('#ddl-pipe-mtrl').val()),
                "pipeSize": getValueWithEmptyString($('#ddl-pipe-size').val()),
                "pipeType": getValueWithEmptyString($('#ddl-pipe-type').val()),
                "leakType": getValueWithEmptyString($('#ddl-leak-type').val()),
                "leakLevel": getValueWithEmptyString($('#ddl-leak-levl').val()),
                "pipeTag": getValueWithEmptyString($('#p_pipe_tag').val()),
                "pointGisX": getValueWithEmptyString($('#p_mark_lat').val()),
                "pointGisY": getValueWithEmptyString($('#p_mark_lng').val()),
                "remark": getValueWithEmptyString($('#p_remark').val()),
                "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
            }
        };

        console.log('save marker detail update (formData) -> ', formData);

        jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_113lr_fm_map_after_field_update",
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

                    jobDetail.leakType = getValueWithEmptyString($('#ddl-leak-type').val());
                    jobDetail.leakLevel = getValueWithEmptyString($('#ddl-leak-levl').val());
                    jobDetail.pipeMaterial = getValueWithEmptyString($('#ddl-pipe-mtrl').val());
                    jobDetail.pipeSize = getValueWithEmptyString($('#ddl-pipe-size').val());
                    jobDetail.pipeTag = getValueWithEmptyString($('#p_pipe_tag').val());
                    jobDetail.pipeType = getValueWithEmptyString($('#ddl-pipe-type').val());
                    jobDetail.pointGisX = getValueWithEmptyString($('#p_mark_lat').val());
                    jobDetail.pointGisY = getValueWithEmptyString($('#p_mark_lng').val());
                    jobDetail.remark = getValueWithEmptyString($('#p_remark').val());

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
    });
}

function jobDetailFormIsValid() {
    let isValid = true;
    const leakLevl = $('#ddl-leak-levl').val();
    const pipeMtrl = $('#ddl-pipe-mtrl').val();
    const leakType = $('#ddl-leak-type').val();
    const pipeSize = $('#ddl-pipe-size').val();
    const pipeType = $('#ddl-pipe-type').val();

    if (leakLevl === undefined || leakLevl === null || leakLevl === '') isValid = false;
    if (pipeMtrl === undefined || pipeMtrl === null || pipeMtrl === '') isValid = false;
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
    return true;
}

const initialMapWithDataQuery = async function () {
    try {
        initialQueryString2FormData();
        jQuery.when(
            fetchExistedMarkers(),
        )
            .then(function (...results) {
                let mark = results[0];
                let detail = null;

                console.log('A result (mark) -> ', mark);
                if (mark !== undefined && mark !== null && mark.length > 0) {
                    detail = mark[0];
                    /**
                     * Clear job detail object values
                    */
                    jobDetail = {
                        "seqPk": null,
                        "alley": null,
                        "road": null,
                        "areaCode": null,
                        "branchCode": null,
                        "customerMeterNo": null,
                        "leakType": null,
                        "leakLevel": null,
                        "pipeMaterial": null,
                        "pipeSize": null,
                        "pipeTag": null,
                        "pipeType": null,
                        "pointEditFlag": null,
                        "pointGisX": null,
                        "pointGisY": null,
                        "remark": null,
                        "leaflet_id": null,
                    };
                    /**
                     * Clear job detail object values
                    */

                    console.log('before dssign job detail values (detail) -> ', detail);
                    /**
                     * Assign job detail values
                    */
                    jobDetail.seqPk = getValueWithEmptyString(detail?.seqPk);
                    jobDetail.alley = getValueWithEmptyString(detail?.alley);
                    jobDetail.road = getValueWithEmptyString(detail?.road);
                    jobDetail.areaCode = getValueWithEmptyString(detail?.areaCode);
                    jobDetail.branchCode = getValueWithEmptyString(detail?.branchCode);
                    jobDetail.customerMeterNo = getValueWithEmptyString(detail?.customerMeterNo);
                    jobDetail.leakType = getValueWithEmptyString(detail?.leakType);
                    jobDetail.leakLevel = getValueWithEmptyString(detail?.leakLevel);
                    jobDetail.pipeMaterial = getValueWithEmptyString(detail?.pipeMaterial);
                    jobDetail.pipeSize = getValueWithEmptyString(detail?.pipeSize);
                    jobDetail.pipeTag = getValueWithEmptyString(detail?.pipeTag);
                    jobDetail.pipeType = getValueWithEmptyString(detail?.pipeType);
                    jobDetail.pointEditFlag = getValueWithEmptyString(detail?.pointEditFlag);
                    jobDetail.pointGisX = getValueWithEmptyString(detail?.pointGisX);
                    jobDetail.pointGisY = getValueWithEmptyString(detail?.pointGisY);
                    jobDetail.remark = getValueWithEmptyString(detail?.remark);
                    /**
                     * Assign job detail values
                    */
                    console.log('after dssign job detail values (detail) -> ', jobDetail);

                    let _icon = jobDetail.leakLevel === "03" ? lotWaterDropMarker : bitWaterDropMarker;
                    let myMarker = null;

                    if (jobDetail.pointEditFlag === "N") {
                        console.log('jobDetail.pointEditFlag === "N"');
                        myMarker = L.marker([jobDetail.pointGisX, jobDetail.pointGisY], {
                            draggable: false,
                            icon: _icon,
                        })
                            .addTo(map)
                            .on('click', function (e) {
                                previous = modified = e.target;
                                console.log('marker click! (modified) -> ', modified);
                                console.log('marker click! (previous) -> ', previous);
                                firedDetailFormModal('UPDATE');
                            });
                    } else {
                        console.log('jobDetail.pointEditFlag !== "N"');
                        myMarker = L.marker([jobDetail.pointGisX, jobDetail.pointGisY], {
                            draggable: true,
                            icon: _icon,
                        })
                            .addTo(map)
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
                    }
                    previous = myMarker;
                    modified = myMarker;
                    jobDetail.leaflet_id = myMarker._leaflet_id;

                    /**
                     * zoom to layer with business order
                    */
                    if (jobDetail.pointGisX !== undefined && jobDetail.pointGisY !== undefined) {
                        map.setView([jobDetail.pointGisX, jobDetail.pointGisY], 19);
                        map.pm.Toolbar.setButtonDisabled('markerRemoval', false);
                    }
                    /**
                     * zoom to layer with business order
                    */
                }
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
                    "areaCode": myDataSet.areaCode,
                    "surveyDistance": 0,
                    "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
                }
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                // console.log('/fm/p_113lr_fm_map_job_detail -> ', response);
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

const handleSaveData = async function () {
    hideLoadingOverlay();
    await handleSaveStep();
    hideLoadingOverlay();
}

const handleSaveStep = async function (layer = undefined) {
    try {
        if (layer === undefined || layer === null) {
            map.eachLayer(function (_layer) {
                if (_layer instanceof (L.Polygon || L.Marker)) {
                    layer = _layer.pm._layer;
                }
            });
        }

        console.log('take screenshot at (layer) -> ', layer);

        if (layer !== undefined && jobDetail !== undefined) {
            var blob5000 = await snapshot(layer, 16.70);
            var base5000 = blob5000.replace("data:", "").replace(/^.+,/, "");
            console.log('base 64 string of screen snapshot (1:5000) -> ', base5000);
            var save5000 = await handleUploadImage(base5000, "png")

            var blob1000 = await snapshot(layer, 19);
            var base1000 = blob1000.replace("data:", "").replace(/^.+,/, "");
            console.log('base 64 string of screen snapshot (1:1000) -> ', base1000);
            var save1000 = await handleUploadImage(base1000, "png");

            var saveFoto = await savePhotoDetailUpdate(save1000.filename, save5000.filename);
            console.log('leak detect before (foto) -> ', saveFoto);
        } else {
            console.log('leak detect before (no point or layer)');
        }
        return true;
    } catch (e) {
        console.log('leak detect before (failure) -> ', e.message);
        return false;
    }
}