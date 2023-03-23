
function loadHistory() {
    var markerList = [];
    var markers = L.markerClusterGroup();
    var arrWaypoint = [];
    var arrduration = [];
    $.ajax({
        method: "GET",
        url: "http://localhost:5000/api/CTMS/GetTrackLast",
    })
        .done(function (data) {
            if (data.result != null) {
                for (var i = 0; i < data.result.length; i++) {
                    let a = data.result[i];
                    let devinvid = a["devinvid"]
                    let lat = a["lat"]
                    let lng = a["lng"]

                    let iconUrl = "../images/icons8-semi-truck-50-in.png";
                    let myIcon = L.icon({
                        iconUrl: iconUrl,
                        iconSize: [24, 24], // size of the icon
                    });

                    var pulsingIcon = L.icon.pulse({ iconUrl: iconUrl, iconSize: [24, 24], color: 'red' });
                    var marker = L.marker([lat, lng], { icon: myIcon });

                    marker.bindPopup("<b>" + devinvid + "</b><br><a href='MapHistory' target='_black'>History</a>");
                    markerList.push(marker);


                    arrWaypoint.push([lat, lng]);
                    arrduration.push(10000)
                }

                markers.addLayers(markerList);
                pointTrack.addLayer(markers);



                //map.fitBounds(arrWaypoint);

                let iconUrl = "../images/icons8-semi-truck-normal.png";
                let myIcon = L.icon({
                    iconUrl: iconUrl,
                    iconSize: [24, 24], // size of the icon
                });

                var pulsingIcon = L.icon.pulse({ iconUrl: iconUrl, iconSize: [24, 24], color: 'red' });
                var marker2 = L.Marker.movingMarker(arrWaypoint,
                    arrduration, {autostart: true, icon: pulsingIcon}).addTo(map);
                L.polyline(arrWaypoint, {color: 'blue'}).addTo(map);


                marker2.on('end', function() {
                    marker2.bindPopup('<b>ถึงเป้าหมายแล้วจ้า !</b>')
                    .openPopup();
                });

            }
        });


        

}