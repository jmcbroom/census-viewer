import logo from './logo.svg';
import {useParams, useSearchParams} from 'react-router-dom';
import CensusMap from './CensusMap';
import { useEffect, useState } from 'react';
import {queryFeatures} from '@esri/arcgis-rest-feature-layer'
import StreetPicker from './StreetPicker';
import centroid from '@turf/centroid';
import MapillarySv from './MapillarySv';

const App = () => {

  let { geoid } = useParams();
  let [block, setBlock] = useState(geoid === undefined ? null : geoid)
  let [blockData, setBlockData] = useState(null)
  let [streets, setStreets] = useState([])
  let [images, setImages] = useState([])

  let [streetId, setStreetId] = useState(null)
  let [imageId, setImageId] = useState(null)
  let [svBearing, setSvBearing] = useState(null)

  let blockCentroid = blockData ? centroid(blockData) : null

  useEffect(() => {
    queryFeatures({
      url: `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/CensusBlocks2020/FeatureServer/0`,
      where: `GEOID20 = '${block}'`,
      f: 'geojson'
    }).then(d => {
      if(d.features.length > 0) {
        setBlockData(d)
      }
      else {
        setBlockData(null)
      }
    })
  }, [block])

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl my-2">Census viewer</h1>
      <div>
        <span className="font-medium py-2 mr-4">Current census block:</span>
        <input type="text" className="p-2 bg-gray-100" value={block} onChange={(e) => setBlock(e.target.value)} />
      </div>
      <CensusMap {...{blockData, setStreets, setImages, streetId, setStreetId, svBearing, imageId}}/>
      <div className="grid grid-cols-2 gap-4"> 
      {images && <StreetPicker {...{streets, streetId, setStreetId, blockCentroid, images, setImageId}} />}
      {imageId && <MapillarySv {...{imageId, setImageId, svBearing, setSvBearing}} /> }
      </div>
    </div>
  );
}

export default App;
