var markers = L.markerClusterGroup();
var markerList = [];
var trackLastList=[];

function gotoTrackLast(index) {
    if (trackLastList != null) {
        let marker = trackLastList[index];
        var position = marker.getLatLng();
        let lat = Number(position['lat']).toFixed(5);
        let lng = Number(position['lng']).toFixed(5);
        map.setView(new L.LatLng(lat, lng), 16);
        marker.openPopup();
    }
}
function loadTrackLast() {
  
    if (trackLastList != null) {
        pointTrack.clearLayers();
    }

    $.ajax({
        method: "GET",
        url: "http://localhost:52736/api/CTMS/GetTrackLast",
      })
     .done(function( data ) {
         if (data.result != null) {
            trackLastList = [];
            document.getElementById("datalist").innerHTML = "";
            for (var i = 0; i < data.result.length; i++) {
                let a = data.result[i];
                let devinvid = a["devinvid"]
                let lat = a["lat"]
                let lng = a["lng"]

                let iconUrl="/lib/map/images/icons8-semi-truck-50-in.png";
                let myIcon = L.icon({
                    iconUrl: iconUrl,
                    iconSize:     [24, 24], // size of the icon
                });

                var pulsingIcon = L.icon.pulse({iconUrl: iconUrl,iconSize:[24,24],color:'red'});
                var marker = L.marker([lat, lng], { icon: pulsingIcon});
                
                marker.bindPopup("<b>"+devinvid+"</b><br><a href='MapHistory' target='_black'>History</a>");
                trackLastList.push(marker);
              
                pointTrack.addLayer(marker);

                document.getElementById("datalist").innerHTML += '<tr><td> <a href="#" onclick="gotoTrackLast(' + i +');">'+devinvid+'</a></td ><td>Normal</td></tr>'

            }
       

            // markers.addLayers(markerList);
            // pointTrack.addLayer(markers);

         }
     });
    // map.fitBounds(trackLastList.getBounds());
}

function loadMarker() {
   
    if (markers != null) {
        console.log('loadMarker:', new Date())
        map.removeLayer(markers);
        pointTrack.clearLayers();
        markerList = [];
    }
    

    var arrWaypoint=[];
    var arrduration = [];

    $.ajax({
        method: "GET",
        url: "http://localhost:5000/api/CTMS/GetTrackLast",
      })
     .done(function( data ) {
         if (data.result != null) {
             document.getElementById("datalist").innerHTML = "";
            for (var i = 0; i < data.result.length; i++) {
                let a = data.result[i];
                let devinvid = a["devinvid"]
                let lat = a["lat"]
                let lng = a["lng"]

                let iconUrl="../images/icons8-semi-truck-50-in.png";
                let myIcon = L.icon({
                    iconUrl: iconUrl,
                    iconSize:     [24, 24], // size of the icon
                });

                var pulsingIcon = L.icon.pulse({iconUrl: iconUrl,iconSize:[24,24],color:'red'});
                var marker = L.marker([lat, lng], { icon: pulsingIcon});
                
                marker.bindPopup("<b>"+devinvid+"</b><br><a href='MapHistory' target='_black'>History</a>");
                markerList.push(marker);

                
                arrWaypoint.push([lat, lng]);
                arrduration.push(10000)


                document.getElementById("datalist").innerHTML += '<tr><td> <a href="#" onclick="gotomap(' + i +');">'+devinvid+'</a></td ><td>Normal</td></tr>'

            }

            markers.addLayers(markerList);
            pointTrack.addLayer(markers);


            
            //map.fitBounds(arrWaypoint);

            let iconUrl="../images/icons8-semi-truck-normal.png";
            let myIcon = L.icon({
                iconUrl: iconUrl,
                iconSize:     [24, 24], // size of the icon
            });

            var pulsingIcon = L.icon.pulse({iconUrl: iconUrl,iconSize:[24,24],color:'red'});
            //var marker2 = L.Marker.movingMarker(arrWaypoint,
            //    arrduration, {autostart: true, icon: pulsingIcon}).addTo(map);
            //L.polyline(arrWaypoint, {color: 'blue'}).addTo(map);
            
            
            //marker2.on('end', function() {
            //    marker2.bindPopup('<b>ถึงเป้าหมายแล้วจ้า !</b>')
            //    .openPopup();
            //});

         }
     });


    for (var i = 0; i < addressPoints.length; i++) {
        var a = addressPoints[i];
        var title = a[2];
        //var marker = L.marker(L.latLng(a[0], a[1]), { title: title });
        if(i < 1000) {  
            var iconUrl="";
            if(i==0){
                iconUrl="../images/icons8-semi-truck-normal.png";
                var myIcon = L.icon({
                    iconUrl: iconUrl,
                    iconSize:     [24, 24], // size of the icon
                    });
                var markericon = L.marker([a[0], a[1]],{icon: myIcon});
                markerList.push(markericon);
                continue;
            }
            else if(i==1){
                iconUrl="../images/icons8-semi-truck-50-unlock.png";
            }
            else if(i==2){
                iconUrl="../images/icons8-semi-truck-50-stop.png";
            }
            else if(i==3){
                iconUrl="../images/icons8-semi-truck-50-out.png";
            }
            else if(i==4){
                iconUrl="../images/icons8-semi-truck-50-in.png";
            }
            else if(i==5){
                iconUrl="../images/icons8-semi-truck-50-slow.png";
            }
            else{
                iconUrl="../images/icons8-semi-truck-normal.png";
                var myIcon = L.icon({
                    iconUrl: iconUrl,
                    iconSize:     [24, 24], // size of the icon
                    });
                var markericon = L.marker([a[0], a[1]],{icon: myIcon});
                markericon.bindPopup("<b>Hello world!</b><br><a href='MapHistory.html' target='_black'>��������´</a>");
                markerList.push(markericon);
                continue;
            }
            var pulsingIcon = L.icon.pulse({iconUrl: iconUrl,iconSize:[24,24],color:'red'});
            var marker = L.marker([a[0], a[1]],{icon: pulsingIcon});
            
            marker.bindPopup("<b>Hello world!</b><br><a href='MapHistory.html' target='_black'>��������´</a>");
            markerList.push(marker);

            // var markericon = L.marker([a[0], a[1]],{icon: century21icon});
            // markerList.push(markericon);


        }
    }

    markers.addLayers(markerList);
    pointTrack.addLayer(markers);

    // markers.addLayers(markerList);
   

    

    // alert(markerList.length);


    // map.fitBounds(markers.getBounds());
}