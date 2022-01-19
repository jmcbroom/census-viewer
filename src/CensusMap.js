import bbox from "@turf/bbox";
import centroid from "@turf/centroid";
import maplibregl from "maplibre-gl";
import React, { useEffect, useState } from "react";
import { baseStyle } from './styles/mapstyle';
import _ from 'lodash'
import videoIcon from './video.png'

const CensusMap = ({ blockData, setStreets, images, setImages, streetId, setStreetId, imageId, svBearing }) => {

  const [theMap, setTheMap] = useState(null);

  useEffect(() => {
    var map = new maplibregl.Map({
      container: "map", // container id
      style: baseStyle, // stylesheet location
      center: [-83.04058,42.3314], // starting position [lng, lat]
      zoom: 11 // starting zoom
    });

    map.resize();


    map.on("load", () => {
      setTheMap(map);

      map.loadImage(videoIcon, (error, image) => {
        if (error) throw error;
        map.addImage("video", image);
      });

      map.addSource("block-data", {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": []
        }
      })

      map.addLayer({
        "id": "block-data-fill",
        "source": "block-data",
        "type": "fill",
        "paint": {
          "fill-color": "red",
          "fill-opacity": 0.25
        }
      })

      map.addLayer({
        "id": "block-data-line",
        "source": "block-data",
        "type": "line",
        "paint": {
          "line-color": "black"
        }
      }, 'parcel-linked')
    });

    map.on('click', e => {
    })

    map.on('moveend', e => {
      let streets = map.queryRenderedFeatures({
        layers: ['streets-line']
      })
      let mly = map.queryRenderedFeatures({
        layers: ['mapillary-images']
      })
      setStreets(_.uniqBy(streets, 'properties.street_id'))
      setImages(_.uniqBy(mly, 'properties.id'))
    })

    map.on('sourcedata', e => {
      if(e.sourceId === 'mly' && e.isSourceLoaded === true) {
        let mly = map.queryRenderedFeatures({
          layers: ['mapillary-images']
        })
        setImages(_.uniqBy(mly, 'properties.id'))
      }
    })

  }, []);

  useEffect(() => {
    if(theMap && blockData) {
      theMap.getSource('block-data').setData(blockData)
      theMap.fitBounds(bbox(blockData), {
        padding: 50
      })
    }
  }, [blockData, theMap])

  useEffect(() => {
    if(theMap) {
      theMap.setFilter("streets-highlight", ['==', 'street_id', streetId ? streetId : ''])
    }
  }, [streetId, theMap])

  useEffect(() => {
    if (theMap && imageId) {
      theMap.setFilter('mapillary-images-highlight', ["==", "id", parseInt(imageId)])
      theMap.setFilter('mapillary-location', ["==", "id", parseInt(imageId)])
    }
  }, [imageId])

  useEffect(() => {
    if (theMap && imageId) {
      theMap.setLayoutProperty('mapillary-location', 'icon-rotate', (svBearing - 90))
    }
  }, [svBearing])

  return (
    <div id="map" className="my-4 h-96" />
  );
};


export default CensusMap;