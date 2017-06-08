var map;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.938502, lng: -123.030474},
    zoom: 13
  });
}