---
---
$(document).ready(function () {

  $.getJSON("/partners.geojson", function (orgs){
    $(".mobile-menu").click(function (e) {
      e.preventDefault();
      $(".nav-global-secondary ul").slideToggle();
    });

    if (window.innerWidth < 1024) showMap([]);;

    orgs.features.forEach(function (org) {
      org.properties.icon = {
          iconSize: [60, 60],
          shadowSize: [60, 60],
          className: 'marker',
          iconUrl: org.properties.logo_url,
          iconAnchor: [0, 25]
      };
    });

    showMap(orgs);
  });


  function hasMatch(feature, collection) {
    collection.filter(function (a) {
      //console.log(a.id);
      //console.log(feature);
      return a.id.toLowerCase() == feature.id.toLowerCase
    })[0];
  }
  function showMap(cfallOrgs) {
    // codeforamerica.j113mi4d - code for all
    // codeforamerica.map-hhckoiuj - brigade
    var worldLayer;
    var latlon = [23, 0], zoom = 2;

    if(window.innerWidth <= 576) {
      latlon = [0, 0];
      zoom = 0.5;
    }

    var options = { dragging: true, scrollWheelZoom: false }

    if (window.innerWidth < 1024) {
      options = { dragging: false, scrollWheelZoom: false }
    }

    var map = L.map('map', options).setView(latlon, zoom);

    function iconStyle(feature) {
      if (feature.properties.icon && feature.properties.icon.iconUrl) {
        return { icon: L.icon(feature.properties.icon), title: feature.properties.name };
      }
    };

    var countries = {{ site.data.countries | jsonify }};

    function worldStyle(feature) {
      // background color
      var fillcolor = "#C6E5F6";

      if (countries.indexOf(feature.properties.NAME) !== -1) {
        // any partner on the map will have the same color
        fillcolor = "#43A2D4";
        //fillcolor = "#ffdd57"
          // fillcolor = "#3273dc";
      }

      return {
        fillColor: fillcolor,
        weight: 1,
        opacity: 1,
        color: '#ECF7FD',
        fillOpacity: 1
      };
    };

    function zoomToFeature(e) {
      var layer = e.target;
      $('#map-info').text(layer.feature.properties.name);
      if (layer.feature.id) {
        $('#' + layer.feature.id.toLowerCase()).addClass("map-highlight");
      } else {
        map.fitBounds(layer.getBounds());
      }
    }

    function resetHighlight(e) {
      var layer = e.target;
      worldLayer.resetStyle(layer);
      if (layer.feature.id) {
        $('#' + layer.feature.id.toLowerCase()).removeClass("map-highlight");
      }
      $('#map-info').html("&nbsp;");
    }

    function highlightFeature(e) {
      var layer = e.target;
      if (layer.feature.id) {
        $('#' + layer.feature.id.toLowerCase()).addClass("map-highlight");
        $('#map-info').html('<em>' + layer.feature.properties.name + '</em>');
      } else {
        layer.setStyle({
          color: '#3273dc'
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
        }
        $('#map-info').html('<i>' + layer.feature.properties.NAME + '</i>');
      }

    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    // Add the worldmap
    $.getJSON(base_url + 'worldmap.geojson', function (response) {
      worldLayer = L.geoJSON(response, { style: worldStyle, onEachFeature: onEachFeature }).addTo(map);
    });

    featureLayer = L.geoJSON(cfallOrgs, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, iconStyle(feature)).on('click', () => {window.location.href = feature.properties.website});
      }, onEachFeature: onEachFeature
    }).addTo(map);
    //map.fitBounds(featureLayer.getBounds());
  };

});