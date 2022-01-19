import distance from "@turf/distance";
import centroid from "@turf/centroid";
import React, { useEffect } from "react";
import _ from 'lodash';

const StreetPicker = ({ streets, streetId, setStreetId, blockCentroid, images, setImageId }) => {

  let orderedStreets = _.uniqBy(_.orderBy(streets, st => distance(centroid(st.geometry), blockCentroid)), 'properties.streetname_id')

  useEffect(() => {
    if(streetId) {
      console.log(images)
      let street = streets.filter(st => st.properties.street_id === streetId)[0]
    
      let streetMidpoint = centroid(street.geometry)
    
      let imagesByDistance = _.sortBy(images, i => distance(i.geometry, streetMidpoint))
  
      setImageId(imagesByDistance[0].properties.id)
    }
  }, [streetId])

  return (
    <div>
      <h2 className="text-lg font-medium">Closest street segments</h2>
      <span>Click to select a segment</span>
      <ul>
        {orderedStreets.slice(0, 6).map(str => (
          <li 
            key={str.properties.street_id}
            className={str.properties.street_id === streetId ? "font-bold" : "font-normal"}
            onClick={() => setStreetId(str.properties.street_id)}>
              {str.properties.street_id} ({str.properties.streetname_id})
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StreetPicker;