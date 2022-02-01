import { faStreetView } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import bearing from "@turf/bearing";
import centroid from '@turf/centroid';
import { SimpleMarker, Viewer } from "mapillary-js";
import moment from "moment";
import { useEffect, useState } from "react";

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
function computeBearing(node, start, end) {
  var nodeBearing = node.computedCompassAngle || node.properties.compass_angle; // Computed node compass angle (equivalent
  // to bearing) is used by mjs when placing
  // the node in 3D space.

  // compute this with @turf/bearing
  var desiredBearing = bearing(start, end); // Your desired bearing.
  var basicX = bearingToBasic(desiredBearing, nodeBearing);
  var basicY = 0.45; // tilt slightly up

  var center = [basicX, basicY];
  return center
}

let markerStyle = {
  ballColor: "white",
  ballOpacity: 0.65,
  color: "#feb70d",
  opacity: 0.55,
  interactive: false,
  radius: 10,
};


const MapillarySv = ({ setImage, setSvBearing, feature, image }) => {
  let [streetview, setStreetview] = useState(null)
  let [capturedAt, setCapturedAt] = useState(null)

  useEffect(() => {
    const viewer = new Viewer({
      accessToken: 'MLY|4690399437648324|de87555bb6015affa20c3df794ebab15',
      container: 'mly-viewer',
      component: {
        marker: true,
        bearing: false,
        attribution: false,
        sequence: false,
        cache: true,
        direction: true
      },
      imageId: image.properties.id
    });

    viewer.deactivateCover()

    setStreetview(viewer)

    viewer.on("image", function (e) {
      setCapturedAt(e.image._spatial.captured_at)
      let imageCoords = image.geometry.coordinates
      let blockCentroid = centroid(feature).geometry.coordinates
      let center = computeBearing(e.image, imageCoords, blockCentroid)
      viewer.getImage().then(i => {
        console.log(i)
        let imageCoords = i._core.geometry.coordinates ? i._core.geometry.coordinates : [i._core.geometry.lng, i._core.geometry.lat]
        console.log(imageCoords)
        let blockCentroid = centroid(feature).geometry.coordinates
        let center = computeBearing(i, imageCoords, blockCentroid)
        console.log(center)
        viewer.setCenter(center)
      })
      e.target.getBearing().then(d => setSvBearing(d))
    });

    viewer.on("bearing", function (e) {
      setSvBearing(e.bearing)
    });
  }, [])
  
  useEffect(() => {
    if (streetview && image) {
      streetview.moveTo(image.properties.id)
      streetview.getImage().then(i => {
        console.log(i)
        let imageCoords = i._core.geometry.coordinates ? i._core.geometry.coordinates : [i._core.geometry.lng, i._core.geometry.lat]
        console.log(imageCoords)
        let blockCentroid = centroid(feature).geometry.coordinates
        let center = computeBearing(i, imageCoords, blockCentroid)
        console.log(center)
        streetview.setCenter(center)
      })
    }
  }, [image])

  return (
    <div>
      <h2 className="text-lg bg-gray-200 p-2 flex items-center justify-between">
        <span><FontAwesomeIcon icon={faStreetView} className="mr-2" />Street view</span>
        {capturedAt && <span className="font-normal">{moment(capturedAt).format("ll")}</span>}
      </h2>
      <section className="sidebar-section street-view">
        <div id="mly-viewer" style={{ height: 300, width: '100%' }} />
      </section>
    </div>
  )
}

export default MapillarySv;