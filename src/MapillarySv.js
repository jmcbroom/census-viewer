import { Viewer, SimpleMarker } from "mapillary-js";
import { useEffect, useState } from "react";
import moment from "moment";
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils';
import centroid from '@turf/centroid';
import bearing from "@turf/bearing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStreetView } from "@fortawesome/free-solid-svg-icons";
import _ from 'lodash'
import distance from "@turf/distance";

/**
 * Wrap a value on the interval [min, max].
 */
 function wrap(value, min, max) {
  var interval = max - min;

  while (value > max || value < min) {
    if (value > max) {
      value = value - interval;
    } else if (value < min) {
      value = value + interval;
    }
  }

  return value;
}

/**
 * Convert a desired bearing to a basic X image coordinate for
 * a specific node bearing.
 *
 * Works only for a full 360 panorama.
 */
function bearingToBasic(desiredBearing, nodeBearing) {
  // 1. Take difference of desired bearing and node bearing in degrees.
  // 2. Scale to basic coordinates.
  // 3. Add 0.5 because node bearing corresponds to the center
  //    of the image. See
  //    https://mapillary.github.io/mapillary-js/classes/viewer.html
  //    for explanation of the basic coordinate system of an image.
  var basic = (desiredBearing - nodeBearing) / 360 + 0.5;

  // Wrap to a valid basic coordinate (on the [0, 1] interval).
  // Needed when difference between desired bearing and node
  // bearing is more than 180 degrees.
  return wrap(basic, 0, 1);
}

/**
 * Function to set the mapillary viewer's center by computing bearing
 */
function setBearing(node, mly, start, end) {
  var nodeBearing = node.computedCompassAngle; // Computed node compass angle (equivalent
  // to bearing) is used by mjs when placing
  // the node in 3D space.

  // compute this with @turf/bearing
  var desiredBearing = bearing(start, end); // Your desired bearing.
  var basicX = bearingToBasic(desiredBearing, nodeBearing);
  var basicY = 0.45; // tilt slightly up

  var center = [basicX, basicY];

  mly.setCenter(center);
}

let markerStyle = {
  ballColor: "white",
  ballOpacity: 0.65,
  color: "#feb70d",
  opacity: 0.55,
  interactive: false,
  radius: 10,
};


const MapillarySv = ({ imageId, setImageId, setSvBearing, feature }) => {

  let [streetview, setStreetview] = useState(null)

  useEffect(() => {
  
    const viewer = new Viewer({
      accessToken: 'MLY|4690399437648324|de87555bb6015affa20c3df794ebab15',
      container: 'mly-viewer',
      component: {
        marker: true,
        bearing: false,
        cover: true,
        attribution: false,
        sequence: false,
        cache: true,
        direction: true
      },
      imageId: imageId
    });

    viewer.deactivateCover()

    setStreetview(viewer)

    if(feature) {
      let coords = feature.geometry.coordinates
      console.log(coords)
      let defaultMarker = new SimpleMarker("default-id", { lat: coords[1], lng: coords[0] }, markerStyle);
      let markerComponent = viewer.getComponent("marker");
      markerComponent.add([defaultMarker]);
    }

    viewer.on("image", function(e) { 
      if (imageId !== e.image.id) {
        setImageId(e.image.id)
      }
      e.target.getBearing()
        .then(d => setSvBearing(d))
    });

    viewer.on("pov", function(e) {  
      e.target.getBearing()
        .then(d => setSvBearing(d))
    });
  }, [])

  useEffect(() => {
    if(streetview && imageId) {
      streetview.moveTo(imageId)
    }
  }, [imageId])

  // useEffect(() => {
  //   if(streetview) {
  //     let coords = feature.geometry.coordinates
  //     let defaultMarker = new SimpleMarker("default-id", { lat: coords[1], lng: coords[0] }, markerStyle);
  //     let markerComponent = streetview.getComponent("marker");
  //     markerComponent.add([defaultMarker]);

  //     streetview.getImage().then(i => {
  //       setBearing(i, streetview, [i.originalLngLat.lng, i.originalLngLat.lat], [coords[1], coords[0]]);
  //     })
  //   }
  // }, [feature])

  return (
    <div>
    <h2 className="text-lg bg-gray-200 p-2 flex items-center justify-between">
      <span><FontAwesomeIcon icon={faStreetView} className="mr-2" />Street view</span>
      {/* <span className="font-normal">{moment(svImageKey.captured_at).format("ll")}</span> */}
    </h2>
    <section className="sidebar-section street-view">
    <div id="mly-viewer" style={{height: 300, width: '100%'}}/>
    </section>
    </div>
  )
}

export default MapillarySv;