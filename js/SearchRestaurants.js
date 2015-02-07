var map, places, iw;
var markers = [];
var searchTimeout;
var centerMarker;
var pos;
var autocomplete;
var hostnameRegexp = new RegExp('^https?://.+?/');

function initialize() {
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
  if(navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    pos = new google.maps.LatLng(position.coords.latitude,
                                     position.coords.longitude);
    placeMarker(pos);

    map.setCenter(pos);
  }, function() {
    handleNoGeolocation(true);
  });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
  var myLatlng = new google.maps.LatLng(40,-87);
  var myOptions = {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
  places = new google.maps.places.PlacesService(map);
  google.maps.event.addListener(map, 'tilesloaded', tilesLoaded);
  
  document.getElementById('keyword').onkeyup = function(e) {
    if (!e) var e = window.event;
    if (e.keyCode != 13) return;
    document.getElementById('keyword').blur();
    search(document.getElementById('keyword').value);
  }

  var typeSelect = document.getElementById('type');
  typeSelect.onchange = function() {
    search();
  };

  var rankBySelect = document.getElementById('rankBy');
  rankBySelect.onchange = function() {
    search();
  };

}

function tilesLoaded() {
  search();
  google.maps.event.clearListeners(map, 'tilesloaded');
  google.maps.event.addListener(map, 'zoom_changed', searchIfRankByProminence);
  google.maps.event.addListener(map, 'dragend', search);
}

function searchIfRankByProminence() {
  if (document.getElementById('rankBy').value == 'prominence') {
    search();
  }    
}

function search() {
  clearResults();
  clearMarkers();

  if (searchTimeout) {
    window.clearTimeout(searchTimeout);
  }
  searchTimeout = window.setTimeout(reallyDoSearch, 500);
}

function reallyDoSearch() {      
  var type = document.getElementById('type').value;
  var keyword = document.getElementById('keyword').value;
  var rankBy = document.getElementById('rankBy').value;

  var search = {};
  
  if (keyword) {
    search.keyword = keyword;
  }
  
  if (type != 'establishment') {
    search.types = [type];
  }
  
  if (rankBy == 'distance' && (search.types || search.keyword)) {
    search.rankBy = google.maps.places.RankBy.DISTANCE;
    search.location = map.getCenter();
    centerMarker = new google.maps.Marker({
      position: search.location,
      animation: google.maps.Animation.DROP,
      map: map
    });
  } else {
    search.bounds = map.getBounds();
  }
  
  places.search(search, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        var icon = 'icons/number_' + (i+1) + '.png';
        markers.push(new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: icon
        }));
        google.maps.event.addListener(markers[i], 'click', getDetails(results[i], i));
        window.setTimeout(dropMarker(i), i * 100);
        addResult(results[i], i);
      }
    }
  });
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  if (centerMarker) {
    centerMarker.setMap(null);
  }
}

function dropMarker(i) {
  return function() {
    if (markers[i]) {
      markers[i].setMap(map);
    }
  }
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var tr = document.createElement('tr');
  tr.style.backgroundColor = (i% 2 == 0 ? '#F0F0F0' : '#FFFFFF');
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var iconTd = document.createElement('td');
  var nameTd = document.createElement('td');
  var icon = document.createElement('img');
  icon.src = 'icons/number_' + (i+1) + '.png';
  icon.setAttribute('class', 'placeIcon');
  icon.setAttribute('className', 'placeIcon');
  var name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

function getDetails(result, i) {
  return function() {
    places.getDetails({
        reference: result.reference         //To change a small thing to display route to the restaurant.....
    }, showInfoWindow(i));
  }
}

function showInfoWindow(i) {
  return function(place, status) {
    if (iw) {
      iw.close();
      iw = null;
    }
    
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      iw = new google.maps.InfoWindow({
        content: getIWContent(place)
      });
      iw.open(map, markers[i]);        
    }
  }
}

function getIWContent(place) {
  var content = '';
  content += '<table>';
  content += '<tr class="iw_table_row">';
  content += '<td style="text-align: right"><img class="hotelIcon" src="' + place.icon + '"/></td>';
  content += '<td><b><a href="' + place.url + '">' + place.name + '</a></b></td></tr>';
  content += '<tr class="iw_table_row"><td class="iw_attribute_name">Address:</td><td>' + place.vicinity + '</td></tr>';
  if (place.formatted_phone_number) {
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Telephone:</td><td>' + place.formatted_phone_number + '</td></tr>';      
  }
  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    }
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Rating:</td><td><span id="rating">' + ratingHtml + '</span></td></tr>';
  }
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website == null) { 
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    content += '<tr class="iw_table_row"><td class="iw_attribute_name">Website:</td><td><a href="' + fullUrl + '">' + website + '</a></td></tr>';
  }
  content += '</table>';
  return content;
}

google.maps.event.addDomListener(window, 'load', initialize);
