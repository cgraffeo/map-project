$(document).ready(function() {
  $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
});

var map;
var marker;
var markers = [];
var locations = [];
var ViewModel;
var contentString;

function googleMapError(){
  alert("Gopogle Maps API isn't loading");
}

// var locations = [
//     {title: 'Capitol', location: {lat: 44.938502, lng: -123.030474}},
//     {title: 'Salem Health - Hospital', location: {lat: 44.932337, lng: -123.034181}},
//     {title: 'Riverfront City Park', location: {lat: 44.942180, lng: -123.042549}},
//     {title: 'The Governor' +"'"+'s Cup Coffee Roasters', location: {lat: 44.940984, lng: -123.036755}},
//     {title: 'Salem Center', location: {lat: 44.943273, lng: -123.036157}}
//   ];
function initMap() {
  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.938502, lng: -123.030474},
    zoom: 15
  });
  // These are the locations that will be shown to the user.
  // Normally we'd have these in a database instead.


  var bounds = new google.maps.LatLngBounds();
  viewModel.google(!!window.google);
  // The following group uses the location array to create an array of markers on initialize.

  function salemListModel(favoritePlaces){
    $.getJSON("data.json", function(data){
      var locationJSON = data.locations;
      for(var i = 0; i < locationJSON.length; i++){
        viewModel.favoritePlaces.push(new LocationModel(locationJSON[i], viewModel));
      }
    }).fail(function(){
      alert("Markers not loading, Try back later");
    });
  }

  var LocationModel = function(location, viewModel) {
    var self = this;

    self.title = location.name;
    self.position = location.position;
    self.address = location.address;
    self.city = location.city;
    self.state = location.state;
    self.zipcode = location.zipcode;

    self.createMarker = ko.computed(function(){
      if (viewModel.google()){
        self.marker = new google.maps.Marker({
          position: self.position,
          map: map,
          title: self.title,
          animation: google.maps.Animation.DROP,
        });
        self.contentString = ko.computed(function(){
          return '<div><i>'+ self.title + '</i></div>' +
          '<div>'+ self.address + '</div>' +
          '<div>'+ self.city + ',' + self.state + ',' + self.zipcode + '</div>';
        });
        self.marker.addListener('click', function(){
        // Wikipedia API
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?'+
                      'action=opensearch&search=' + self.title +
                      '&format=json&callback=wikiCallback';
        $.ajax({
          url: wikiUrl,
          dataType: "jsonp"
        }).done(function(response){
          var article = response[3][0];
          var url = '<div>'+ '<a href ="'+ article +'" target="_blank">'+ self.title +'</a></div>';
          viewModel.largeInfoWindow.setContent(self.contentString() + url);
          viewModel.largeInfoWindow.open(map, self.marker);
        }).fail(function(){
          viewModel.largeInfoWindow.setContent(self.contentString() + '<em><br>'+ "Wikipedia data isn't loading"+'</em>');
          viewModel.largeInfoWindow.open(map, self.marker);
        });
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout (function(){self.marker.setAnimation(null);}, 750);
      });
    }
  });
};

var ViewModel = function(LocationModel) {
  var self = this;
  self.favoritePlaces = ko.observableArray();
  self.google = ko.observable(!!window.google);  //Sets the Google Window to False

  chicagoListModel(self.favoritePlaces);

  self.infoWindowCreation = ko.computed(function(){
    if (self.google()){
      self.largeInfoWindow = new google.maps.InfoWindow();
    }
  });

self.mapParameter = ko.observable("");
self.visibleLocations = ko.computed(function(){
  var filter = self.mapParameter().toLowerCase();
  return ko.utils.arrayFilter(self.favoritePlaces(), function(location){
    var locationMatch = location.title.toLowerCase().indexOf(searchFilter) >= 0;
    if(location.marker){
      location.marker.setVisible(locationMatch);
    }
    return locationMatch;
  });
});

self.markerAnimator = function(location){
  google.maps.event.trigger(location.marker, 'click');
};
}
};

// var largeInfowindow = new google.maps.InfoWindow();
viewModel = new ViewModel();
ko.applyBindings(ViewModel());