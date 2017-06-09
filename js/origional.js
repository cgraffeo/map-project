for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    // Push the marker to our array of markers.
    markers.push(marker);
    Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  }
}

// This function populates the infowindow when the marker is clicked. Info is populated based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}
// This function will loop through the markers array and display them all.
// function showListings() {
//   var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
//   for (var i = 0; i < markers.length; i++) {
//     markers[i].setMap(map);
//     bounds.extend(markers[i].position);
//   }
//   map.fitBounds(bounds);
// }
// This function will loop through the listings and hide them all.
// function hideListings() {
//   for (var i = 0; i < markers.length; i++) {
//     markers[i].setMap(null);
//   }
// }
// var pins = ko.observableArray[(
//     self.mapPin('Capitol', 44.938502, -123.030474, "Test1"),
//     self.mapPin('Salem Health - Hospital', 44.932337, -123.034181, "Test2"),
//     self.mapPin('Riverfront City Park', 44.942180, -123.042549, "Test2"),
//     self.mapPin('The Governor' +"'"+'s Cup Coffee Roasters', 44.940984, -123.036755, "Test2"),
//     self.mapPin('Salem Center', 44.943273, -123.036157, "Test2"),
//   ]);
var Pin = function Pin() {
  var marker;
  this.locations = ko.observableArray(locations);
  this.name = ko.observable(title);
  this.lat  = ko.observable(lat);
  this.lng  = ko.observable(lng);
  this.text = ko.observable(text);

  marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    animation: google.maps.Animation.DROP
  });

  this.isVisible = ko.observable(false);

  this.isVisible.subscribe(function(currentState) {
    if (currentState) {
      marker.setMap(map);
    } else {
      marker.setMap(null);
    }
  });

  this.isVisible(true);
}
// Search filter
function ViewModel(){
  var self = this;
  this.filter = ko.observable();
  this.locations = ko.observableArray(locations);
  this.markers = ko.observableArray(markers);

  this.visibleLocations = ko.computed(function(){
    this.visibleLocations = ko.computed(function(){
    return this.locations().filter(function(location){
      if(!self.filter() || location.title.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1){
        function hideListings() {
            markers.setMap(null);
        }
        return location;
      }
    });
  }, this);
  self.filterPins = ko.computed(function () {
    var search  = self.query().toLowerCase();

    return ko.utils.arrayFilter(self.pins(), function (pin) {
        var doesMatch = pin.name().toLowerCase().indexOf(search) >= 0;

        pin.isVisible(doesMatch);

        return doesMatch;
    });
});