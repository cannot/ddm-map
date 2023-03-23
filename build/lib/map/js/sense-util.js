function getQueryParams(url = window.location.href) {
    url = url.split('#')[0];
    const sliced = url.slice(url.indexOf('?') + 1).split('&');
    const params = {};
    sliced.map(param => {
        const [key, val] = param.split('=');
        params[key] = decodeURIComponent(val);
    })
    return params;
}

function _log(e, m = undefined) {
    if (m !== undefined)
        console.log(m, e);
    else
        console.log(e);
}

function initShapeByLatLngs(layer, group) {
    if (layer instanceof L.LayerGroup) {
        layer.eachLayer(function (layer) {
            initShapeByLatLngs(layer, group);
        });
    } else {
        group.addLayer(layer);
    }
}

function showLoadingOverlay() {
    $.LoadingOverlay("show", {
        image: "",
        size: "45px",
        background: "rgba(255, 149, 0, 0.4)",
        fontawesome: "fa fa-spinner fa-spin",
        fontawesomeColor: "#3434eb",
    });
}

function hideLoadingOverlay() {
    setTimeout(function () {
        $.LoadingOverlay("hide");
    }, 500);
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

function getPointSafe(src = undefined) {
    if (src === undefined || src === null) {
        return undefined;
    }
    if (src.getCenter) {
        return src.getCenter();
    } else if (src.getLatLng) {
        return src.getLatLng();
    } else if (src.getBounds) {
        return src.getBounds().getCenter();
    } else {
        return undefined;
    }
}

async function snapshot(layer, level) {
    return new Promise((resolve, reject) => {
        const point = getPointSafe(layer);
        if (point === undefined) {
            throw new Error('Unable to get source layer LatLng.');
        }

        map.setView(point, level);

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
function handlePolylineDrawerClick() {
    if (document.querySelector('div.leaflet-pm-icon-polyline') != null && document.querySelector('div.leaflet-pm-icon-polyline').closest('a.leaflet-buttons-control-button') != null)
        document.querySelector('div.leaflet-pm-icon-polyline').closest('a.leaflet-buttons-control-button').click();
}

function hidePolylineDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-polyline') != null && document.querySelector('div.leaflet-pm-icon-polyline').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-polyline').closest('.button-container').style.display = 'none';
}

function showPolylineDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-polyline') != null && document.querySelector('div.leaflet-pm-icon-polyline').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-polyline').closest('.button-container').style.display = 'block';
}

function handlePolygonDrawerClick() {
    if (document.querySelector('div.leaflet-pm-icon-polygon') != null && document.querySelector('div.leaflet-pm-icon-polygon').closest('a.leaflet-buttons-control-button') != null)
        document.querySelector('div.leaflet-pm-icon-polygon').closest('a.leaflet-buttons-control-button').click();
}

function hidePolygonDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-polygon') != null && document.querySelector('div.leaflet-pm-icon-polygon').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-polygon').closest('.button-container').style.display = 'none';
}

function showPolygonDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-polygon') != null && document.querySelector('div.leaflet-pm-icon-polygon').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-polygon').closest('.button-container').style.display = 'block';
}

function handleMarkerDrawerClick() {
    if (document.querySelector('div.leaflet-pm-icon-marker') != null && document.querySelector('div.leaflet-pm-icon-marker').closest('a.leaflet-buttons-control-button') != null)
        document.querySelector('div.leaflet-pm-icon-marker').closest('a.leaflet-buttons-control-button').click();
}

function hideMarkerDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-marker') != null && document.querySelector('div.leaflet-pm-icon-marker').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-marker').closest('.button-container').style.display = 'none';
}

function showMarkerDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-marker') != null && document.querySelector('div.leaflet-pm-icon-marker').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-marker').closest('.button-container').style.display = 'block';
}

function handleEditToolClick() {
    if (document.querySelector('div.leaflet-pm-icon-edit') != null && document.querySelector('div.leaflet-pm-icon-edit').closest('a.leaflet-buttons-control-button') != null)
        document.querySelector('div.leaflet-pm-icon-edit').closest('a.leaflet-buttons-control-button').click();
}

function hideEditToolDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-edit') != null && document.querySelector('div.leaflet-pm-icon-edit').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-edit').closest('.button-container').style.display = 'none';
}

function showEditToolDrawer() {
    if (document.querySelector('div.leaflet-pm-icon-marker') != null && document.querySelector('div.leaflet-pm-icon-edit').closest('.button-container') != null)
        document.querySelector('div.leaflet-pm-icon-marker').closest('.button-container').style.display = 'block';
}

function renameSnapshotFileName(file = "", size = 1000)
{
    let name = file.split(".");
    let type = name.pop();
    return name.join('').concat("_", size.toString(), ".", type);
}

function getValueWithEmptyString(value) {
    return value === null || value === undefined ? "" : value;
}

function fetchDropDownListOptions(dataType = "011", selector = undefined, optional = true) {
    try {
        if (selector != null && selector != undefined && document.querySelector(selector) != null) {
            var formData = {
                "data": {
                    "dataType": dataType,
                    "userId": myDataSet.userId === undefined ? 'dev' : myDataSet.userId
                }
            }

            console.log('fetch drop-down list options (formData) ->', formData);

            jQuery.ajax({
                type: "POST",
                headers: {
                    "token": "dev"
                },
                url: api_host + "/WLMAService/rest/internal/app/gen/p_gen_drop_down_list",
                data: JSON.stringify(formData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    console.log('fetch drop-down list options (response) -> ', response);
                    if (response.errorcode !== 1 && response.dataList !== undefined && response.dataList.length > 0) {
                        var dropDownList = jQuery(selector);
                        if (dropDownList.length) {
                            dropDownList.find('option').remove();
                            if (optional === true) dropDownList.append('<option value="">--- กรุณาเลือก ---</option>');
                            jQuery.each(response.dataList, function (key, val) {
                                dropDownList.append('<option value=' + val.dataKey + '>' + val.dataDescription + '</option>');
                            });
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('fetch drop-down list options (failure) -> ', error);
    }
}

jQuery.extend(jQuery.validator.messages, {
    required: "กรุณากรอกข้อมูล",
    remote: "Please fix this field.",
    email: "Please enter a valid email address.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    dateISO: "Please enter a valid date (ISO).",
    number: "Please enter a valid number.",
    digits: "Please enter only digits.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Please enter the same value again.",
    accept: "Please enter a value with a valid extension.",
    maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
    minlength: jQuery.validator.format("Please enter at least {0} characters."),
    rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
});