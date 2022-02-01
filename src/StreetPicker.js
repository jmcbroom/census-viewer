import distance from "@turf/distance";
import centroid from "@turf/centroid";
import React, { useEffect, useState } from "react";
import _ from 'lodash';
import streetnames from './data/streetnames.json'


const StreetPicker = ({ streets, streetId, setStreetId, blockCentroid, images, image, setImage }) => {

  console.log(streetnames)

  let orderedStreets = _.uniqBy(_.orderBy(streets, st => distance(centroid(st.geometry), blockCentroid)), 'properties.streetname_id')

  let [start, setStart] = useState('2020-04-01')
  let [end, setEnd] = useState('2020-11-01') 

  useEffect(() => {
    if(streetId) {
      let street = streets.filter(st => st.properties.street_id === streetId)[0]
    
      let imagesInTimeRange = images.filter(img => {
        let imgDate = new Date(img.properties.captured_at)
        let startDate = new Date(start)
        let endDate = new Date(end)
        return imgDate >= startDate && imgDate <= endDate
      })

      let streetMidpoint = centroid(street.geometry)
    
      let imagesByDistance = []

      if (imagesInTimeRange.length > 0) {
        imagesByDistance = _.sortBy(imagesInTimeRange, i => distance(i.geometry, streetMidpoint))
      }
      else {
        imagesByDistance = _.sortBy(images, i => distance(i.geometry, streetMidpoint))
      }

      setImage(imagesByDistance[0])
    }
  }, [streetId])

  return (
    <div>
      <h2 className="text-lg font-medium">Closest street segments</h2>
      <span className="mb-4 block">Click to select a segment</span>
      <ul>
        {orderedStreets.slice(0, 6).map(str => {

          let rec = streetnames.RECORDS.filter(rec => parseInt(rec.streetname_id) === parseInt(str.properties.streetname_id))[0]

          return (
          <li 
            key={str.properties.street_id}
            className={str.properties.street_id === streetId ? "font-bold list-disc list-inside" : "font-normal list-disc list-inside"}
            onClick={() => setStreetId(str.properties.street_id)}>
              {rec.street_prefix} {rec.street_name} {rec.street_type}
          </li>
        )})}
      </ul>
    </div>
  )
}

export default StreetPicker;