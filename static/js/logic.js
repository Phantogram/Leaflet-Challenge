var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(url, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

  function circleColor(d) {

    return d > 90 ? '#FF0000' :
           d > 70 ? '#FF6900' : 
           d > 50 ? '#FF9E00' :
           d > 30 ? '#FFE400' :
           d > 10 ? '#F7FF00' :
                    '#8DFF00';
}

  function createFeatures(usgsData) {
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3 align ='center'>" + feature.properties.place +
        "</h3><hr><p><strong>Time: <strong>" + new Date(feature.properties.time) + "</p>" +
        "</h3><p><strong>Magnitude: <strong>" + feature.properties.mag + "</p>" +
        "</h3><p><strong>Depth: <strong>" + feature.geometry.coordinates[2] + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(usgsData, {
      onEachFeature: onEachFeature,
      pointToLayer: function(feature, coordinate){
        var markerFeatures = {
          radius: 5*feature.properties.mag,
          color: "black",
          fillColor: circleColor(feature.geometry.coordinates[2]),
          weight: 1,
          opacity: 1,
          fillOpacity: 0.6
        }
        return L.circleMarker(coordinate, markerFeatures);
      }
    });
  
    // Sending the earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
function createMap(earthquakes) {

    // Define variables for our tile layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    // Create tectonic layer
    var tectPlates = new L.LayerGroup();

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Light": light,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectPlates
    };

  // Create our map, giving it the satellite and earthquakes layers to display on load
    var myMap = L.map("mapid", {
    center: [40.8, -94.5],
    zoom: 3,
    layers: [satellite, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap)

  // Query to retrieve the tectonic plate data
  var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // Create the tectonic plates and add them to the tectonic layer
  d3.json(platesURL, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "orange", fillOpacity: 0}
      }
    }).addTo(tectPlates)
  })
  
  // Create the legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [-10, 10, 30, 50, 70, 90],
          labels = [];
  
      // Loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;

  };
  
  legend.addTo(myMap);

}
