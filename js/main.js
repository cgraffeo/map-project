(function () {
  "use strict";
}());

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
//     {title: 'Oregon State Capitol', location: {lat: 44.938502, lng: -123.030474}, address: '900 Court St NE', city: 'Salem', state: 'OR', zipcode: '97301'},
//     {title: 'Salem Health - Hospital', location: {lat: 44.932337, lng: -123.034181}, address: '890 Oak St SE', city: 'Salem', state: 'OR', zipcode: '97301'},
//     {title: 'Riverfront City Park', location: {lat: 44.942180, lng: -123.042549}, address: '200 Water St NE', city: 'Salem', state: 'OR', zipcode: '97301'},
//     {title: 'The Governors Cup Coffee Roasters', location: {lat: 44.940984, lng: -123.036755}, address: '471 Court St NE', city: 'Salem', state: 'OR', zipcode: '97301'},
//     {title: 'Salem Center', location: {lat: 44.943273, lng: -123.036157}, address: '401 Center St NE, Salem, OR 97301', city: 'Salem', state: 'OR', zipcode: '97301'},
//   ];
// var locations = [
//     {title: 'Capitol', location: {lat: 44.938502, lng: -123.030474}},
//     {title: 'Salem Health - Hospital', location: {lat: 44.932337, lng: -123.034181}},
//     {title: 'Riverfront City Park', location: {lat: 44.942180, lng: -123.042549}},
//     {title: 'The Governor' +"'"+'s Cup Coffee Roasters', location: {lat: 44.940984, lng: -123.036755}},
//     {title: 'Salem Center', location: {lat: 44.943273, lng: -123.036157}}
//   ];1
function initMap(){
 map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.938502, lng: -123.030474},
    zoom: 15
  });

  var bounds = new google.maps.LatLngBounds();

  viewModel.google(!!window.google); //true

}
// Loading Locations Data Dynamically
function SalemListModel(favoritePlaces){
  $.getJSON("/js/data.json", function(data) {
    var locationJSON = data.locations;
    for(var i = 0; i < locationJSON.length; i++){
      viewModel.favoritePlaces.push(new LocationModel(locationJSON[i], viewModel));
    }
  }).fail(function(){
    alert("Location Data isn't loading");
  });
}

//Model - LocationModel constructor funtion
var LocationModel = function(location, viewModel) {
  var self = this;

  self.title = location.name;
  self.position = location.position;
  self.address = location.address;
  self.city = location.city;
  self.state = location.state;
  self.zipcode = location.zipcode;


  self.markerCreation = ko.computed(function(){
    if (viewModel.google()){

      self.marker = new google.maps.Marker ({
        position: self.position,
        map: map,
        title: self.title,
        animation: google.maps.Animation.DROP,
      });
      //Create contentString for the InfoWindow
      self.contentString = ko.computed(function(){
        return '<div><i>'+ self.title + '</i></div>' +
        '<div>'+ self.address + '</div>' +
        '<div>'+ self.city +', '+ self.state +' '+ self.zipcode + '</div>';
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
          //Set content with InfoWindow
          viewModel.largeInfoWindow.setContent(self.contentString() + url);
          // Open LargeInfoWindow
          viewModel.largeInfoWindow.open(map, self.marker);
        }).fail(function(){
          //Set content with InfoWindow
          viewModel.largeInfoWindow.setContent(self.contentString() + '<em><br>'+ "Wikipedia data isn't loading"+'</em>');
          // Open LargeInfoWindow
          viewModel.largeInfoWindow.open(map, self.marker);
        });
        // Marker Animation
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout (function(){self.marker.setAnimation(null);}, 750);
      });
      // Search box
      // var input = document.getElementById('searchItem');
      // var searchBox = new google.maps.places.SearchBox(input);
      // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    }
  });
};

// ViewModel
var ViewModel = function(LocationModel) {
  var self = this;
  self.favoritePlaces = ko.observableArray();
  self.google = ko.observable(!!window.google);  //Sets the Google Window to False

  SalemListModel(self.favoritePlaces);

  self.infoWindowCreation = ko.computed(function(){
    if (self.google()){
      self.largeInfoWindow = new google.maps.InfoWindow();
    }
  });

  // Search Filter

  // mapParameter represents the user input into the search box
  self.mapParameter = ko.observable("");

  // Search List is a filtered list of the
  self.visibleLocations = ko.computed(function(){
    var searchFilter = self.mapParameter().toLowerCase();
    return ko.utils.arrayFilter(self.favoritePlaces(), function(location){
      var locationMatch = location.title.toLowerCase().indexOf(searchFilter) >= 0;
      if(location.marker){
        location.marker.setVisible(locationMatch);
      }
      return locationMatch;
    });
  });


  // Click binding
  self.markerAnimator = function(location) {
    google.maps.event.trigger(location.marker, 'click');
  };


};
// Instiate the viewModel
viewModel = new ViewModel();
ko.applyBindings(viewModel);