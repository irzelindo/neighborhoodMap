// defining global variables
var map;
var clientID = 'UV251YRLZFNAI4EUTWIVJRPBI5SZTNOAE5NTNZOY0GWVXKRK';
var clientSecret = 'R1FKXA03UTZXFTKAPCGLMFXOU2BSNVWGAZZVOMXPALW3U4XL';
function ViewModel() {
  var self = this;
  // Create a new blank array for all the listing markers.
  self.markers = [];
  self.neighMap = ko.observable('Neighborhood Map');
  self.searchBox = ko.observable('');
  /**
    *This function populates the infowindow when the marker is clicked.
    * We'll only allow one infowindow which will open at the marker
    * that is clicked, and populate based on that markers position.
  */
  this.populateInfoWindow = function(marker, infowindow){
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
       infowindow.marker = marker;
       // Clear the infowindow content to give the streetview time to load.
       infowindow.setContent('loading');
       // Foursqure API client
       var url = 'https://api.foursquare.com/v2/venues/search?ll=' +self.marker.lat+ ',' +self.marker.lng+
       '&client_id=' +clientID+ '&client_secret=' +clientSecret+ '&v=20130815'+ '&query=' +marker.title;
       // Foursquare API
       //var response, name, street, city, phone;
       $.getJSON(url).done(function(marker){
         self.response = marker.response.venues[0];
         self.name = self.response.name || 'No name provided';
         self.street = self.response.location.formattedAddress[0] || 'No phone provided';
         self.city = self.response.location.formattedAddress[1] || 'No city provided';
         self.phone = self.response.contact.formattedPhone || 'No phone provided';
         //self.zip = response.location.formattedAddress[3];
         //self.country = self.response.location.formattedAddress[4];

         self.foursquareContent =
         '<div class="foursquare-data">'+
         '<h4 class="fs-data">'+ self.name +'</h4>' +
         '<p class="fs-data">'+ self.street+'</p>' +
         '<p class="fs-data">'+ self.city+'</p>' +
         '<p class="fs-data">'+ self.phone+'</p>' +
         //'<p class="fs-data">'+ self.country+'</p>' +
         '</div>';
         infowindow.setContent(self.foursquareContent);
       }).fail(function(){
         alert('There is an issue loading the Foursquare API. Please refresh your page or try again.');
       });
       // Open the infowindow on the correct marker.
       infowindow.open(map, marker);

       // Make sure the marker property is cleared if the infowindow is closed.
       infowindow.addListener('closeclick',function(){
         infowindow.marker = null;
       });

     }
  };
  /**
    * onclick list items open and populate InfoWindow
  */
  this.populateAndAnimateMark = function(){
    self.populateInfoWindow(this, self.largeInfowindow);
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this), 1400);
  };

  this.initMap = function(){
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.0026767, lng: -75.2581177},
      zoom: 5,
      styles: styles,
      mapTypeControl: false
    });
    // creating infowindow and set maps bounds to fit marksers
    self.largeInfowindow = new google.maps.InfoWindow();
    self.bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++){
      self.markerlat = locations[i].location.lat;
      self.markerlng = locations[i].location.lng;
      self.title = locations[i].title;
      self.marker = new google.maps.Marker({
        map: map,
        position: {
          lat: self.markerlat,
          lng: self.markerlng
        },
        lat: self.markerlat,
        lng: self.markerlng,
        title: self.title,
        animation: google.maps.Animation.DROP,
        id: i,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });
      // Push the marker to our array of markers.
      self.markers.push(this.marker);
      //create an onclick event to open infowindow for each marker and bounce marker
      self.marker.addListener('click', self.populateAndAnimateMark);
      self.bounds.extend(self.markers[i].position);
    }
    // extend the boundaries of map to fit each marker
    map.fitBounds(self.bounds);
  };
  this.initMap();
  /**
    *creating a list of locations and Filtering the locations on search
  */
  this.locationList = ko.computed(function(){
    var result = [];
    for(var i = 0; i < self.markers.length; i++){
      var location = self.markers[i];
      if(location.title.toLowerCase().includes(this.searchBox().toLowerCase())){
        result.push(location);
        self.markers[i].setVisible(true);
      }
      else{
        self.markers[i].setVisible(false);
      }
    }
    return result;
  }, this);
} //ViewModel ends here
/**
  *gives error messgae if google maps api is unable to load map
*/
function errorLoadingMap(){
  alert('There is an issue loading the Foursquare API. Please refresh your page or try again. ');
}
// starts the application
function startApp(){
  ko.applyBindings(new ViewModel());
}
