import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Map.css';


import BubbleChart from './TopicChart';

import {
  categoricalColorMap,
  colorsTurboArray,
  colorsContinuous,
  obj2flatArray,
} from "./Util";

export default function DualMap({geojsonLoci, geojsonUmap}){
  const mapContainerLoci = useRef(null);
  const mapContainerUmap = useRef(null);

  const mapLoci = useRef(null);
  const mapUmap = useRef(null);
  // put your maptiler API_KEY here
  const API_KEY = process.env.REACT_APP_API_KEY;  
  
  const [selectedTopic, setSelectedTopic] = useState('');
  const [clickedFeatureIds, setClickedFeatureIds] = useState([]);
  const clickedFeatureIdsRef = useRef(clickedFeatureIds);

  const categoricalColorMapArray = obj2flatArray(categoricalColorMap);
  
  useEffect(() => {
    clickedFeatureIdsRef.current = clickedFeatureIds;
  }, [clickedFeatureIds]);


  useEffect(() => {
    console.log(geojsonLoci);
    if (mapLoci.current) return;
    if (mapUmap.current) return;
      
    mapLoci.current = new maplibregl.Map({
      container: mapContainerLoci.current,
      style: `https://api.maptiler.com/maps/basic-v2-light/style.json?key=${API_KEY}`,
      center: [128.128, 36.77], // Initial center coordinates
      zoom: 7.5, // Initial zoom level
    });

    mapUmap.current = new maplibregl.Map({
      container: mapContainerUmap.current,
      style: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${API_KEY}`,
      center: [0.04, 0.04], // Initial center coordinates
      zoom: 12, // Initial zoom level
    });

    mapLoci.current.on('load', () => {
      mapLoci.current.addSource('geojsonLoci', {
        type: 'geojson',
        data: geojsonLoci,
        // generateId: true
      });
      
      mapLoci.current.addLayer({
        id: 'geojsonLoci',
        type: 'circle',
        source: 'geojsonLoci',
        paint: {
          'circle-stroke-width': .5,
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            '#A12',
            '#555'
          ],  
          'circle-color': ['match', 
              ['get', 'topK']
            ].concat(categoricalColorMapArray, ['#ccc']),
          'circle-radius': [
            'interpolate', ['linear'],
            ['zoom'], 6, 2, 10, 4, 18, 15, ],
          'circle-opacity': 1.0, 
        },
      });

      // Add tooltip functionality
      mapLoci.current.on('click', 'geojsonLoci', (e) => {
        mapLoci.current.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        const tooltip = new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(renderTooltip(properties)) 
          .addTo(mapLoci.current);
      });
      mapUmap.current.on('click', 'geojsonUmap', (e) => {
        mapUmap.current.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        const tooltip = new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(renderTooltip(properties)) 
          .addTo(mapUmap.current);
      });

      const renderTooltip = (properties) => {
        const numTopic = 12;
        const topicValues = [];

        // Loop through the properties and extract the topic values
        for (let i = 0; i < numTopic; i++) {
          const topicKey = `topic_${i}`;
          const topicValue = properties[topicKey];
          topicValues.push(topicValue.toFixed(4));
        }

        // Create the HTML content for the tooltip
        const tooltipContent = `
          <div>
            <h3> ${properties.ADMNM}</h3>
            <ul class="small-indent">
              ${topicValues
                .map(
                  (value, index) =>
                    `<li ${
                      index === properties.topK ? 'class="highlight"' : ''
                    }>Topic ${index}: ${value}</li>`
                )
                .join('')}
            </ul>
          </div>
        `;

        return tooltipContent;
      }; // renderTooltip end
      
      mapLoci.current.on('dblclick', 'geojsonLoci', (e) => {
        const id = e.features[0].properties.id; 
        const matchingFeature = geojsonUmap.features.find(
          (feature) => feature.properties.id === id); 
        if (matchingFeature) {
          // Get the coordinates of the clicked feature
          const { coordinates } = matchingFeature.geometry;
          const lngLat = new maplibregl.LngLat(coordinates[0], coordinates[1]);
          mapUmap.current.flyTo({ center: lngLat, zoom: 17 });
        } else {
          console.log("no feature");
        }
      });
      mapUmap.current.on('dblclick', 'geojsonUmap', (e) => {
        const id = e.features[0].properties.id; 
        const matchingFeature = geojsonLoci.features.find(
          (feature) => feature.properties.id === id); 
        if (matchingFeature) {
          // Get the coordinates of the clicked feature
          const { coordinates } = matchingFeature.geometry;
          const lngLat = new maplibregl.LngLat(coordinates[0], coordinates[1]);
          mapLoci.current.flyTo({ center: lngLat, zoom: 17 });
        } else {
          console.log("no feature");
        }
      });



       
      // mapLoci.current.on('click', 'geojsonLoci', (e) => {
      //   const clickedFeatureId = e.features[0].properties.id; 
      //   console.log("click", clickedFeatureId);

      //   // add feature if not clicked 
      //   const isFeatureClicked = clickedFeatureIdsRef.current.includes(clickedFeatureId);
      //   const updatedClickedFeatureIds = isFeatureClicked
      //     ? [clickedFeatureIdsRef.current] 
      //     : [...clickedFeatureIdsRef.current, clickedFeatureId];
      //   setClickedFeatureIds(updatedClickedFeatureIds);
      //   clickedFeatureIdsRef.current = updatedClickedFeatureIds;

      //   console.log(clickedFeatureIdsRef.current);
      //   mapLoci.current.setFeatureState(
      //     { source: 'geojsonLoci', id: e.features[0].id },
      //     { clicked: true }
      //   );
      //   mapUmap.current.setFeatureState(
      //     { source: 'geojsonUmap', id: e.features[0].id },
      //     { clicked: true }
      //   );
      // });  // on click end

    }); // mapLoci on load end

    mapUmap.current.on('load', () => {
      mapUmap.current.addSource('geojsonUmap', {
        type: 'geojson',
        data: geojsonUmap,
        // generateId: true
      });

      
      mapUmap.current.addLayer({
        id: 'geojsonUmap',
        type: 'circle',
        source: 'geojsonUmap',
        paint: {
          'circle-stroke-width': .5,
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            '#A12',
            '#555'
          ], 
          'circle-color': ['match', 
              ['get', 'topK']
            ].concat(categoricalColorMapArray, ['#ccc']),
          'circle-radius': [
            'interpolate', ['linear'],
            ['zoom'], 6, 1, 12, 3, 18, 10, ],
          'circle-opacity': 0.7, // Customize the fill opacity
        },
      });
      mapUmap.current.addLayer({
        id: 'geojsonUmapLable',
        type: 'symbol',
        source: 'geojsonUmap',
        layout: {
          'text-field': ['get', 'ADMNM'], // Replace 'yourProperty' with the actual property key from your GeoJSON
          'text-size': 11, // Customize the font size of the label
          'text-anchor': 'top',
          'text-offset': [0, -1.8],
        },
        paint: {
          'text-color': '#505050', // Customize the color of the label text
          'text-opacity': .8, // Customize the font size of the label
        },
      });
      
      // mapUmap.current.on('click', 'geojsonUmap', (e) => {
      //   const clickedFeatureId = e.features[0].properties.id; 
      //   console.log(clickedFeatureId);
      //   
      //   // Toggle feature color on map1
      //   const isFeatureClicked = clickedFeatureIdsRef.current.includes(clickedFeatureId);
      //   const updatedClickedFeatureIds = isFeatureClicked
      //     ? clickedFeatureIdsRef.current.filter((id) => id !== clickedFeatureId)
      //     : [...clickedFeatureIdsRef.current, clickedFeatureId];

      //   setClickedFeatureIds(updatedClickedFeatureIds);
      //   clickedFeatureIdsRef.current = updatedClickedFeatureIds;
      //   console.log(clickedFeatureIdsRef.current);
      //   mapUmap.current.setFeatureState(
      //     { source: 'geojsonUmap', id: e.features[0].id },
      //     { clicked: true }
      //   );
      //   mapLoci.current.setFeatureState(
      //     { source: 'geojsonLoci', id: e.features[0].id },
      //     { clicked: true  }
      //   );
      //   console.log(geojsonLoci.features[clickedFeatureId]);
      // });

    }); // mapUmap on load end

  }, []);

  useEffect(()=>{

    const categoricalScale = ['match', 
      ['get', 'topK']
    ].concat(categoricalColorMapArray, ['#fff']);
    const continuousScale = [
        'interpolate', ['linear'],
        ['get', `topic_${selectedTopic}`],
      ].concat([
      0.0, '#FFF', 
      0.2, categoricalColorMap[selectedTopic]
    ]);
    const colorScale = selectedTopic===''
      ? categoricalScale 
      : continuousScale;

    if (mapLoci.current?.getLayer("geojsonLoci")) {
      mapLoci.current.setPaintProperty(
        'geojsonLoci', 'circle-color', 
        colorScale
        );
    }
    if (mapUmap.current?.getLayer("geojsonUmap")) {
      mapUmap.current.setPaintProperty(
        'geojsonUmap', 'circle-color', 
        colorScale
        );
    }
  }, [selectedTopic])


  return (
    <div className="map-wrap" style={{ display: 'flex' }}>
      <div ref={mapContainerLoci} className="map"></div>
      <div className="gap">
        <BubbleChart
          onTopicClick={setSelectedTopic}
        />
      </div>
      <div ref={mapContainerUmap} className="map"></div>
    </div>
  );
}
