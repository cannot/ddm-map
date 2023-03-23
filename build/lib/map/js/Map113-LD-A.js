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

var jobMaster = [];
var jobDetail = {
    "seqPk": null,
    "pointId": null,
    "leakLevel": null,
    "leakType": null,
    "pipeType": null,
    "pipeSize": null,
    "latitude": null,
    "longitude": null,
    "remark": null,
    "canDeleteFlag": null,
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
    name: 'saveEdit',
    block: 'custom',
    title: 'บันทึกข้อมูล',
    onClick: () => {
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
                handleLeakDetectAfterSave();
            }
        });
    },
    className: 'fas fa-lg fa-save mt-1'
});

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
    console.log('fired detail form modal (master) -> ', jobMaster);
    console.log('fired detail form modal (action) -> ', action);
    console.log('fired detail form modal (modified) -> ', modified);
    console.log('fired detail form modal (previous) -> ', previous);
    if (modified === undefined || modified === null) return;
    const leaflet_id = modified._leaflet_id;
    console.log('fired detail form modal (_leaflet_id) -> ', leaflet_id);

    // disable and hide delete button
    $('#btn-job-detail-delete').prop("disabled", true).hide();
    // disable and hide delete button

    // reset dropdownlist option
    $('#ddl-leak-levl').val('').trigger('change');
    $('#ddl-leak-type').val('').trigger('change');
    $('#ddl-pipe-type').val('').trigger('change');
    $('#ddl-pipe-size').val('').trigger('change');
    $('#p_remark').val('');
    // reset dropdownlist option

    switch (action) {
        case 'CREATE':
            let sequence = 0;
            if (jobMaster !== undefined && jobMaster !== null && jobMaster.length > 0) {
                sequence = Math.max(...jobMaster.map(j => j.pointId))
            }
            sequence++;

            // set form data
            $('#p_sequence').val(sequence);
            $('#p_point_id').val(sequence);
            $('#p_act_code').val("A");
            $('#p_del_flag').val("Y");
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
                                jobMasterCreate(leaflet_id);
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
            var jobDetail = jobMaster.filter(function (i) {
                return i.leaflet_id === leaflet_id;
            });

            if (jobDetail !== undefined & jobDetail.length > 0) {

                let detail = jobDetail[0];
                console.log('fired detail form modal (detail) -> ', detail);

                $('#ddl-leak-levl').val(detail.leakLevel).trigger('change');
                $('#ddl-leak-type').val(detail.leakType).trigger('change');
                $('#ddl-pipe-type').val(detail.pipeType).trigger('change');
                $('#ddl-pipe-size').val(detail.pipeSize).trigger('change');
                $('#p_remark').val(detail.remark);
                $('#p_sequence').val(detail.seqPk);
                $('#p_point_id').val(detail.pointId);
                $('#p_act_code').val("U");
                $('#p_del_flag').val(detail.canDeleteFlag);
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

                                let _icon = detail.leakLevel === "03" ? lotWaterDropMarker : bitWaterDropMarker;

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

                                jobMasterRefresh(modified._leaflet_id, myMarker._leaflet_id);
                                previous = myMarker;
                                modified = myMarker;
                                $('#job-detail-modal').modal('hide');
                                // previous = modified;
                            }
                        });
                    });
                // initial event handler for cancel job detail

                // initial event handler for marker deletion
                $('#btn-job-detail-delete')
                    .off('click')
                    .click(async function () {
                        $('#p_act_code').val("D");
                        Swal.fire({
                            title: 'ลบจุดสำรวจ?',
                            text: 'กรุณายืนยันการลบจุดสำรวจ!',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: "#007bff",
                            confirmButtonText: 'ยืนยัน',
                            cancelButtonColor: "#dc3545",
                            cancelButtonText: 'ยกเลิก',
                            reverseButtons: true,
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                jobMasterDelete(modified._leaflet_id);
                                map.removeLayer(modified);
                                console.log('fired detail form modal marker deletion (modified) -> ', modified);
                                showLoadingOverlay();
                                jobDetailFormSubmit();
                                hideLoadingOverlay();
                                $('#job-detail-modal').modal('hide');
                            }
                        });
                    }).prop("disabled", false).show();
                // initial event handler for marker deletion

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
                        jobMasterRefresh(modified._leaflet_id, myMarker._leaflet_id);
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
                                    jobMasterUpdate(modified._leaflet_id);
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

function jobMasterCreate(leaflet_id) {
    try {
        console.log('job master create (leaflet_id) -> ', leaflet_id);
        let sequence = 0;
        if (jobMaster !== undefined && jobMaster !== null && jobMaster.length > 0) {
            console.log('Math.max(...jobMaster.map(j => j.pointId))');
            sequence = Math.max(...jobMaster.map(j => j.pointId))
        }

        sequence++;

        const myDetail = {
            "seqPk": sequence,
            "pointId": sequence,
            "leakLevel": $('#ddl-leak-levl').val(),
            "leakType": $('#ddl-leak-type').val(),
            "pipeSize": $('#ddl-pipe-size').val(),
            "pipeType": $('#ddl-pipe-type').val(),
            "remark": $('#p_remark').val(),
            "latitude": $('#p_mark_lat').val(),
            "longitude": $('#p_mark_lng').val(),
            "canDeleteFlag": $('#p_del_flag').val(),
            "leaflet_id": refresh_id,
        };

        // insert job detail from job master
        jobMaster.push(myDetail);
        // insert job detail from job master

        return true;
    } catch (error) {
        return false;
    }
}

function jobMasterDelete(leaflet_id) {
    try {
        console.log('job master delete (leaflet_id) -> ', leaflet_id);
        var _detail = jobMaster.filter(function (i) {
            return i.leaflet_id === leaflet_id;
        });

        if (_detail !== undefined & _detail.length > 0) {
            // delate job detail from job master
            jobMaster.splice(jobMaster.findIndex(i => i.leaflet_id === leaflet_id), 1);
            // delate job detail from job master
            return true;
        }
    } catch (error) {
        return false;
    }
}

function jobMasterUpdate(leaflet_id) {
    try {
        console.log('job master udpate (leaflet_id) -> ', leaflet_id);
        var _detail = jobMaster.filter(function (i) {
            return i.leaflet_id === leaflet_id;
        });

        if (_detail !== undefined & _detail.length > 0) {
            const _key = jobMaster.findIndex(i => i.leaflet_id === leaflet_id);
            jobMaster[_key].leakLevel = $('#ddl-leak-levl').val();
            jobMaster[_key].leakType = $('#ddl-leak-type').val();
            jobMaster[_key].pipeSize = $('#ddl-pipe-size').val();
            jobMaster[_key].pipeType = $('#ddl-pipe-type').val();
            jobMaster[_key].remark = $('#p_remark').val();
            jobMaster[_key].latitude = $('#p_mark_lat').val();
            jobMaster[_key].longitude = $('#p_mark_lng').val();
            jobMaster[_key].canDeleteFlag = $('#p_del_flag').val();
            jobMaster[_key].leaflet_id = leaflet_id;
        }
        return true;
    } catch (error) {
        return false;
    }
}
function jobMasterRefresh(leaflet_id, refresh_id) {
    try {
        console.log('job master refresh (leaflet_id) -> ', leaflet_id);
        console.log('job master refresh (refresh_id) -> ', refresh_id);
        var _detail = jobMaster.filter(function (i) {
            return i.leaflet_id === leaflet_id;
        });

        if (_detail !== undefined & _detail.length > 0) {
            let sequence = 0;
            if (jobMaster !== undefined && jobMaster !== null && jobMaster.length > 0) {
                sequence = Math.max(...jobMaster.map(j => j.pointId))
            }
            sequence++;

            const myDetail = {
                "seqPk": sequence,
                "pointId": sequence,
                "leakLevel": $('#ddl-leak-levl').val(),
                "leakType": $('#ddl-leak-type').val(),
                "pipeSize": $('#ddl-pipe-size').val(),
                "pipeType": $('#ddl-pipe-type').val(),
                "remark": $('#p_remark').val(),
                "latitude": $('#p_mark_lat').val(),
                "longitude": $('#p_mark_lng').val(),
                "canDeleteFlag": $('#p_del_flag').val(),
                "leaflet_id": refresh_id,
            };

            // delate job detail from job master
            jobMaster.splice(jobMaster.findIndex(i => i.leaflet_id === leaflet_id), 1);
            // delate job detail from job master

            // insert job detail from job master
            jobMaster.push(myDetail);
            // insert job detail from job master

            return true;
        }
    } catch (error) {
        return false;
    }
}

async function jobDetailFormSubmit() {
    return new Promise((resolve, reject) => {
        const formData = {
            "data": {
                "jobCode": myDataSet.jobCode,
                "leakLevel": $('#ddl-leak-levl').val(),
                "leakType": $('#ddl-leak-type').val(),
                "pipeSize": $('#ddl-pipe-size').val(),
                "pipeType": $('#ddl-pipe-type').val(),
                "remark": $('#p_remark').val(),
                "actionCode": $('#p_act_code').val(),
                "pointGisX": $('#p_mark_lat').val(),
                "pointGisY": $('#p_mark_lng').val(),
                "pointId": $('#p_point_id').val(),
                "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
            }
        };

        console.log('save marker detail update (formData) -> ', formData);

        jQuery.ajax({
            type: "POST",
            headers: {
                "token": "dev"
            },
            url: api_host + "/WLMAService/rest/internal/app/fm/p_113ld_fm_map_after_field_update",
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
    });
}

function jobDetailFormIsValid() {
    let isValid = true;
    const leakLevl = $('#ddl-leak-levl').val();
    const leakType = $('#ddl-leak-type').val();
    const pipeSize = $('#ddl-pipe-size').val();
    const pipeType = $('#ddl-pipe-type').val();

    if (leakLevl === undefined || leakLevl === null || leakLevl === '') isValid = false;
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
            fetchExistedPolygon(),
            fetchExistedMarkers(),
        )
            .then(function (...results) {
                let poly = results[0];
                let mark = results[1];
                if (poly !== undefined && poly !== null) {
                    var polyFeatureGroup = L.geoJson(poly, { style: { fillColor: "#ff0000", fillOpacity: 0.2, color: "#ff0000", opacity: 0.7 } }).addTo(new L.featureGroup()).addTo(map);
                    console.log('A result (poly) -> ', poly);
                    map.setView(polyFeatureGroup.getBounds().getCenter(), 19);
                }

                if (mark !== undefined && mark !== null) {
                    console.log('A result (mark) -> ', mark);
                    mark.forEach(m => {
                        /**
                         * Clear job detail object values
                        */
                        jobDetail = {
                            "seqPk": null,
                            "pointId": null,
                            "leakLevel": null,
                            "leakType": null,
                            "pipeType": null,
                            "pipeSize": null,
                            "latitude": null,
                            "longitude": null,
                            "remark": null,
                            "canDeleteFlag": null
                        };
                        /**
                         * Clear job detail object values
                        */

                        /**
                         * Assign job detail values
                        */
                        jobDetail.seqPk = m.seqPk;
                        jobDetail.pointId = m.pointId;
                        jobDetail.leakLevel = m.leakLevel;
                        jobDetail.leakType = m.leakType;
                        jobDetail.pipeType = m.pipeType;
                        jobDetail.pipeSize = m.pipeSize;
                        jobDetail.latitude = m.latitude;
                        jobDetail.longitude = m.longitude;
                        jobDetail.remark = m.remark;
                        jobDetail.actionCode = "U";
                        jobDetail.canDeleteFlag = m.canDeleteFlag;
                        /**
                         * Assign job detail values
                        */

                        let markerIcon = m.leakLevel === "03" ? lotWaterDropMarker : bitWaterDropMarker;
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
                        jobMaster.push(jobDetail);
                    });
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
            success: function (response) {
                let polygon = null;
                if (response.errorcode !== 1) {
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
            url: api_host + "/WLMAService/rest/internal/app/fm/p_113ld_fm_map_job_detail",
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
                // console.log('/fm/p_113ld_fm_map_job_detail -> ', response);
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

const handleLeakDetectAfterSave = async function () {
    hideLoadingOverlay();
    $('#job-master-modal').modal('hide');
    await saveLeakDetectAfterStep();
    hideLoadingOverlay();
}

const saveLeakDetectAfterStep = async function (layer = undefined) {
    try {
        if (layer === undefined || layer === null) {
            map.eachLayer(function (_layer) {
                if (_layer instanceof (L.Polygon || L.Marker)) {
                    layer = _layer.pm._layer;
                }
            });
        }

        console.log('take screenshot at (layer) -> ', layer);

        if (layer !== undefined && jobMaster.length > 0) {
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