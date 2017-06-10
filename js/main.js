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

function initMap(){
 map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.938502, lng: -123.030474},
    zoom: 15
  });

  var bounds = new google.maps.LatLngBounds();

  viewModel.google(!!window.google);

}
// Loads location data
function SalemListModel(localSpots){
  $.ajax({
    method: 'get',
    dataType: 'json',
    url: '/js/data.json'
  }).done(function(data){
    var locations = data.locations
    locations.forEach(function(loc, i){
      viewModel.localSpots.push(new LocationModel(loc, viewModel));
    })
  }).fail(function(error){
    console.error(error)
  })
}

// Contructor function for LocationModel
var LocationModel = function(location, viewModel) {
  var self = this;

  self.title = location.title;
  self.position = location.location;
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
        visible: true,
        animation: google.maps.Animation.DROP,
      });
      self.marker.setVisible(true);
      //Build infowindow with content
      self.contentString = ko.computed(function(){
        return `
          <div><i>${self.title}</i></div>
          <div>${self.address}</div>
          <div>${self.city}, ${self.state} ${self.zipcode}</div>
        `
      });
      self.marker.addListener('click', function(){
        // Adding Wikipedia API
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?'+
                      'action=opensearch&search=' + self.title +
                      '&format=json&callback=wikiCallback';
        $.ajax({
          url: wikiUrl,
          dataType: "jsonp"
        }).done(function(response){
          var article = response[3][0];
          var url = `<div><a href="${article}" target="_blank">${self.title}</a></div>`
          //Set infowindow content
          viewModel.largeInfoWindow.setContent(self.contentString() + url);
          // Open LargeInfoWindow
          viewModel.largeInfoWindow.open(map, self.marker);
        }).fail(function(){
          //Set infowindow content
          viewModel.largeInfoWindow.setContent(self.contentString() + `<em><br>Wikipedia data isn't loading</em>`);
          // Open LargeInfoWindow
          viewModel.largeInfoWindow.open(map, self.marker);
        });
        // Marker Animations
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout (function(){self.marker.setAnimation(null);}, 750);
      });
    }
  });
};

// ViewModel
var ViewModel = function(LocationModel) {
  var self = this;
  self.localSpots = ko.observableArray();
  self.google = ko.observable(!!window.google);

  SalemListModel(self.localSpots);

  self.infoWindowCreation = ko.computed(function(){
    if (self.google()){
      self.largeInfoWindow = new google.maps.InfoWindow();
    }
  });

  // Search Filter

  // userQuery represents the user input into the search box
  self.userQuery = ko.observable("");

  // Filter functionality for data text
  self.visibleLocations = ko.computed(function(){
    var searchFilter = self.userQuery().toLowerCase();
    return ko.utils.arrayFilter(self.localSpots(), function(location){
      var locationMatch = location.title.toLowerCase().indexOf(searchFilter) >= 0;
      if(location.marker){
        location.marker.setVisible(locationMatch);
      }
      return locationMatch;
    });
  });


  // Click binding for markers
  self.markerAnimator = function(location) {
    google.maps.event.trigger(location.marker, 'click');
  };


};

viewModel = new ViewModel();
ko.applyBindings(viewModel);