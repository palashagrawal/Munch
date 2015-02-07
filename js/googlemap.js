function initialize() {
    var mapOptions = {
      zoom: 4,
      center: new google.maps.LatLng(-25.363882, 131.044922)
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var marker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      title: 'Click to zoom'
    });

    google.maps.event.addListener(map, 'center_changed', function() {
      // 3 seconds after the center of the map has changed, pan back to the
      // marker.
      window.setTimeout(function() {
        map.panTo(marker.getPosition());
      }, 3000);
    });
    var marker;

    function placeMarker(location) {
      if ( marker ) {
        marker.setPosition(location);
      } else {
        marker = new google.maps.Marker({
          position: location,
          map: map
        });
      }
    }

    google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });
    google.maps.event.addListener(marker, 'dblclick', function() {
      map.setZoom(8);
      map.setCenter(marker.getPosition());
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
