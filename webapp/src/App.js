import React, { useState , useEffect} from 'react';
import DualMap from './Components/Map';
import Navbar from './Components/Navbar';
import './App.css';

function App() {
  
  const [geojsonLoci, setGeojsonLoci] = useState();
  const [geojsonUmap, setGeojsonUmap] = useState();

  const geojsonLociUrl = "data/location.geojson";
  const geojsonUmapUrl = "data/umap.geojson";
  useEffect(()=> {
    fetch(geojsonLociUrl)
      .then((response) => response.json())
      .then((data) => {
        setGeojsonLoci(data);
       });
    
    fetch(geojsonUmapUrl)
      .then((response) => response.json())
      .then((data) => {
        setGeojsonUmap(data);
       });
  },[])
  
  return (
    <div className="App">
      <Navbar/>
      {(geojsonLoci && geojsonUmap ) ? 
        (
          <DualMap
            geojsonLoci={geojsonLoci}
            geojsonUmap={geojsonUmap}
          />
        ): 
         <div>loading...</div>
    }
    </div>
  );
}

export default App;
